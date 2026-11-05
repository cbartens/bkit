// commands/workflow/tracker.ts — the engine's own tracker client.
//
// bkit verbs read and write the issue tracker themselves: GitHub through `gh`
// (BKIT_GH_TOKEN as GH_TOKEN when set), Linear through its GraphQL API
// (BKIT_LINEAR_API_KEY), Jira through the Atlassian Rovo MCP server spoken over
// HTTP (BKIT_JIRA_API_KEY). A call that fails throws a `TrackerError` carrying
// one short reason; the verb prints `tracker: {done: false, action, reason}` and
// the workflow falls back to the tracker MCP. No token value ever reaches a
// thrown message, a log line or stdout.
import * as fs from "node:fs";
import * as path from "node:path";
import { appendFrictionRow, frictionRow } from "../../ledgers/journal.js";
import { actionHash, actionKey, alreadyDone, recordAction, runNumber, } from "../../ledgers/status.js";
import { resolveRepoSlug } from "../../ledgers/telemetry.js";
import { readBkitConfig } from "../../shared/settings.js";
import { git, parseJson, runGh } from "../lib.js";
import { issueIdOf, readIssueTracker } from "./fids.js";
import { acquirePublicationLock, readRunsLenient, releasePublicationLock } from "./locks.js";
/** Conservative full Markdown UTF-16 budget, including markers and part labels. */
export const JIRA_COMMENT_LIMIT = 32_767;
/**
 * Live contract evidence v1 (2026-11-05): GitHub accepts 262,144 UTF-8 body bytes
 * and rejects the next byte; Linear accepts 100,000 Unicode scalars and rejects
 * the next scalar. Jira's Markdown conversion makes its raw boundary dependent
 * on formatting; both ASCII and non-BMP payloads pass at this safe UTF-16 budget.
 * Keep the selected budgets conservative, rather than promising provider maxima.
 */
const COMMENT_BODY_BUDGETS = {
    github: 65_536,
    linear: 100_000,
    jira: JIRA_COMMENT_LIMIT,
};
export const JIRA_MCP_URL = "https://mcp.atlassian.com/v2/mcp";
export const LINEAR_API_URL = "https://api.linear.app/graphql";
/** Rovo MCP tools the engine calls; `.bkit/trackers.md` names each. */
export const JIRA_TOOLS = {
    getIssue: "getJiraIssue",
    read: "executeRead",
    comments: "listJiraIssueComments",
    transitions: "listJiraIssueTransitions",
    transition: "transitionJiraIssue",
    comment: "addOrEditJiraIssueComment",
    edit: "editJiraIssue",
    search: "searchJiraIssuesUsingJql",
};
// Cloudflare in front of Atlassian answers error 1010 to a default library User-Agent.
const USER_AGENT = "bkit-engine (+https://github.com/cbartens/bkit)";
const TIMEOUT_MS = 30_000;
function timeLeft(budget) {
    if (!budget)
        return TIMEOUT_MS;
    if (budget.deadline === 0)
        budget.deadline = performance.now() + budget.duration;
    const remaining = budget.deadline - performance.now();
    if (remaining <= 0)
        throw new TrackerError("network", "publication timeout");
    return Math.max(1, Math.floor(Math.min(TIMEOUT_MS, remaining / (budget.reserve ? 2 : 1))));
}
function charge(budget, kind) {
    if (budget && ++budget[kind] > (kind === "pages" ? 10 : 3))
        throw new TrackerError("network", `publication ${kind} limit`);
}
const SECRET_KEYS = ["BKIT_GH_TOKEN", "BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"];
export class TrackerError extends Error {
    reason;
    constructor(reason, detail) {
        super(redact(detail));
        this.reason = reason;
        this.name = "TrackerError";
    }
}
/** Replace every configured tracker secret's value in `text`. */
export function redact(text) {
    let out = text;
    for (const k of SECRET_KEYS) {
        const v = process.env[k];
        if (v && v.length >= 4)
            out = out.split(v).join(`<${k}>`);
    }
    return out;
}
/** The reason an HTTP status (plus its response text) maps to. */
export function classifyStatus(status, text = "") {
    if (status === 401)
        return "auth";
    if (status === 403)
        return /rate limit/i.test(text) ? "rate-limit" : "scope";
    if (status === 404)
        return "not-found";
    if (status === 429)
        return "rate-limit";
    return `http-${status}`;
}
const NETWORK_CODES = /\b(ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|EHOSTUNREACH)\b/;
/** The reason any thrown value maps to; anything not a `TrackerError` or HTTP failure is network. */
export function classifyFailure(err) {
    if (err instanceof TrackerError)
        return err.reason;
    return "network";
}
/** A `fetch` rejection (DNS, refused, timeout) as a network TrackerError. */
function networkError(err) {
    const e = err;
    const text = [e.name, e.message, e.cause?.code, e.cause?.message].filter(Boolean).join(" ");
    const kind = /TimeoutError|AbortError/.test(text)
        ? "timeout"
        : (NETWORK_CODES.exec(text)?.[1] ?? "fetch failed");
    return new TrackerError("network", kind);
}
/** The reason a failed `gh` call maps to. */
export function ghReason(res) {
    if (res.missing || res.status === 4)
        return "auth";
    const http = /\bHTTP (\d{3})\b/.exec(res.stderr);
    if (http)
        return classifyStatus(Number(http[1]), res.stderr);
    if (/rate limit/i.test(res.stderr))
        return "rate-limit";
    if (/connect|timeout|resolve|dial tcp|no such host/i.test(res.stderr))
        return "network";
    return `http-${res.status ?? 0}`;
}
/**
 * The issue as a workflow argument: `#N` on GitHub, the key uppercased on Linear /
 * Jira, verbatim (empty included) with no tracker.
 */
export function issueRef(issue, tracker) {
    if (issue === null || issue === "")
        return "";
    if (tracker === "github")
        return `#${issue.replace(/^#/, "")}`;
    if (tracker === "none")
        return issue;
    return issue.toUpperCase();
}
/** The main checkout's root, from any worktree; `cwd` outside git. */
function mainRoot(cwd) {
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    return common ? path.dirname(common) : cwd;
}
/**
 * Where a tracker action goes: the configured tracker and the issue an explicit
 * `issue` (`#` stripped) names, else the one the FID embeds.
 */
export function trackerTarget(cwd, o) {
    const tracker = readIssueTracker(cwd);
    const config = readBkitConfig(mainRoot(cwd));
    const given = o.issue?.trim().replace(/^#/, "");
    const issue = given !== undefined
        ? given === ""
            ? null
            : given.toUpperCase()
        : o.fid && tracker !== "none"
            ? issueIdOf(o.fid, tracker)
            : null;
    return {
        tracker,
        issue,
        cwd,
        ownerRepo: tracker === "github" ? resolveRepoSlug(cwd) : "",
        linearTeam: config.linear.team,
        jiraSite: config.jira.site,
        config,
    };
}
// ---------------------------------------------------------------------------
// transport
// ---------------------------------------------------------------------------
/** The env `gh` runs with: BKIT_GH_TOKEN as GH_TOKEN when set. */
export function ghEnv() {
    const t = process.env.BKIT_GH_TOKEN;
    return t ? { GH_TOKEN: t } : {};
}
/** `gh` for a tracker call; a failure throws its reason. */
export function gh(t, args, input, budget) {
    const res = runGh(t.cwd, args, input, ghEnv(), budget ? { timeoutMs: timeLeft(budget) } : {});
    if (!res.ok)
        throw new TrackerError(ghReason(res), `gh ${args[0] ?? ""}: ${res.stderr}`);
    return res.stdout;
}
function secret(key) {
    const v = process.env[key];
    if (!v)
        throw new TrackerError("auth", `${key} is not set`);
    return v;
}
/** POST JSON; a non-2xx answer throws its reason unless `o.keepErrors` hands it back to read. */
async function post(url, headers, body, o = {}) {
    let res;
    try {
        res = await fetch(url, {
            method: "POST",
            headers: { "content-type": "application/json", "user-agent": USER_AGENT, ...headers },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(timeLeft(o.budget)),
        });
    }
    catch (err) {
        throw networkError(err);
    }
    const text = await res.text();
    if (!res.ok && o.keepErrors !== true)
        throw new TrackerError(classifyStatus(res.status, text), `HTTP ${res.status}`);
    return { ok: res.ok, status: res.status, headers: res.headers, text };
}
const asRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v) ? v : {};
// ---------------------------------------------------------------------------
// linear
// ---------------------------------------------------------------------------
const LINEAR_CODES = {
    RATELIMITED: "rate-limit",
    AUTHENTICATION_ERROR: "auth",
    FORBIDDEN: "scope",
};
/**
 * One Linear GraphQL call. GraphQL errors map to a reason by `extensions.code` — Linear
 * answers rate limits and auth failures with HTTP 400 and the code in the body.
 */
export async function linearGql(query, variables, budget) {
    const key = secret("BKIT_LINEAR_API_KEY");
    const res = await post(LINEAR_API_URL, { authorization: key }, { query, variables }, { keepErrors: true, budget });
    const parsed = parseJson(res.text);
    const doc = asRecord(parsed.ok ? parsed.value : null);
    const errors = Array.isArray(doc.errors) ? doc.errors : [];
    if (errors.length > 0) {
        const first = errors[0];
        const code = String(asRecord(first.extensions).code ?? "");
        const message = String(first.message ?? "");
        const reason = LINEAR_CODES[code] ??
            (/not found|could not find/i.test(message)
                ? "not-found"
                : res.ok
                    ? "http-400"
                    : classifyStatus(res.status, res.text));
        throw new TrackerError(reason, `linear: ${message}`);
    }
    if (!res.ok)
        throw new TrackerError(classifyStatus(res.status, res.text), `HTTP ${res.status}`);
    if (!parsed.ok)
        throw new TrackerError(`http-${res.status}`, "linear: response is not JSON");
    return asRecord(doc.data);
}
// ---------------------------------------------------------------------------
// jira (Rovo MCP over streamable HTTP)
// ---------------------------------------------------------------------------
/** The JSON-RPC message answering `id` in a JSON or event-stream response body. */
function rpcMessage(text, contentType, id) {
    const candidates = /event-stream/.test(contentType)
        ? text
            .split("\n")
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim())
        : [text];
    for (const c of candidates) {
        const parsed = parseJson(c);
        const msg = asRecord(parsed.ok ? parsed.value : null);
        if (msg.id === id)
            return msg;
    }
    throw new TrackerError("http-200", "jira: no JSON-RPC answer in the response");
}
/** A Jira tool error's reason, from its text. */
function jiraReason(text) {
    if (/does not exist|not found|no issue/i.test(text))
        return "not-found";
    if (/rate limit|too many/i.test(text))
        return "rate-limit";
    if (/unauthori[sz]ed|authenticat/i.test(text))
        return "auth";
    if (/permission|forbidden|scope/i.test(text))
        return "scope";
    return "http-400";
}
export class JiraSession {
    key;
    budget;
    id = 1;
    session = null;
    constructor(key, budget) {
        this.key = key;
        this.budget = budget;
    }
    static open(budget) {
        return new JiraSession(secret("BKIT_JIRA_API_KEY"), budget);
    }
    headers() {
        return {
            authorization: `Bearer ${this.key}`,
            accept: "application/json, text/event-stream",
            ...(this.session ? { "mcp-session-id": this.session } : {}),
        };
    }
    async start() {
        if (this.session !== null)
            return;
        const res = await post(JIRA_MCP_URL, this.headers(), {
            jsonrpc: "2.0",
            id: this.id,
            method: "initialize",
            params: {
                protocolVersion: "2025-06-18",
                capabilities: {},
                clientInfo: { name: "bkit", version: "engine" },
            },
        }, { budget: this.budget });
        rpcMessage(res.text, res.headers.get("content-type") ?? "", this.id);
        this.session = res.headers.get("mcp-session-id") ?? "";
        await post(JIRA_MCP_URL, this.headers(), {
            jsonrpc: "2.0",
            method: "notifications/initialized",
        }, { budget: this.budget });
    }
    /** `tools/call` one tool; returns its text content parsed as JSON when it is JSON. */
    async call(name, args) {
        await this.start();
        const id = ++this.id;
        const res = await post(JIRA_MCP_URL, this.headers(), {
            jsonrpc: "2.0",
            id,
            method: "tools/call",
            params: { name, arguments: args },
        }, { budget: this.budget });
        const msg = rpcMessage(res.text, res.headers.get("content-type") ?? "", id);
        if (msg.error) {
            const message = String(asRecord(msg.error).message ?? "");
            throw new TrackerError(jiraReason(message), `jira ${name}: ${message}`);
        }
        const result = asRecord(msg.result);
        const content = Array.isArray(result.content) ? result.content : [];
        const text = content
            .map((c) => asRecord(c))
            .filter((c) => c.type === "text")
            .map((c) => String(c.text ?? ""))
            .join("\n");
        if (result.isError === true)
            throw new TrackerError(jiraReason(text), `jira ${name}: ${text}`);
        const parsed = parseJson(text);
        return parsed.ok ? parsed.value : text;
    }
}
function jiraSite(t) {
    if (!t.jiraSite)
        throw new TrackerError("not-found", "bkit.tracker.jira.site is not set");
    return t.jiraSite;
}
// ---------------------------------------------------------------------------
// comments
// ---------------------------------------------------------------------------
/** First line of every comment bkit posts; such comments are never workflow input. */
export const GENERATED_MARKER = "###### bkit:generated";
/** The 12-hex sha256 prefix a stamped marker carries for `rest`, the body below it. */
const markerHash = (rest) => actionHash(rest).slice(0, 12);
/**
 * `body` with a bare first-line marker stamped `###### bkit:generated {hash}`, the
 * hash of everything below it; any other body unchanged.
 */
export function stampMarker(body) {
    const nl = body.indexOf("\n");
    if ((nl === -1 ? body : body.slice(0, nl)) !== GENERATED_MARKER)
        return body;
    const rest = nl === -1 ? "" : body.slice(nl + 1);
    return `${GENERATED_MARKER} ${markerHash(rest)}${nl === -1 ? "" : `\n${rest}`}`;
}
/** The hash a comment's first-line marker carries, as markdown or as Jira's HTML `<h6>`; null without one. */
export function markerHashOf(body) {
    const first = body.replace(/^\s+/, "").split(/\r?\n/, 1)[0] ?? "";
    return (/^(?:######[ \t]+|<h6\b[^>]*>\s*)bkit:generated[ \t]+([0-9a-f]{12})\b/.exec(first)?.[1] ?? null);
}
/**
 * Write `body` byte-for-byte to `tmp/bkit-{kind}-{hash}.md` in the checkout `cwd`
 * sits in, for an MCP fallback to read verbatim; returns the absolute path.
 */
export function writeBodyFile(cwd, kind, body) {
    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
    const file = path.join(top, "tmp", `bkit-${kind}-${actionHash(body).slice(0, 12)}.md`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
    return file;
}
/**
 * `body` cut at line breaks into parts of at most `limit` characters. Each part of
 * a split body opens with the body's first line when it is the generated marker,
 * then `_(part i/n)_`; a single line longer than a part is cut hard.
 */
export function splitAt(body, limit, opts = {}) {
    if (opts.verifiedBudget === false)
        return [body];
    if (body.length <= limit)
        return [body];
    if (opts.compact) {
        const marker = body.startsWith("###### ") ? body.split("\n", 1)[0] : "";
        let rest = marker ? body.slice(marker.length + 1) : body;
        const room = limit - marker.length - 64;
        if (room <= 1)
            throw new TrackerError("http-400", "comment limit cannot fit one code point");
        const chunks = [];
        while (rest.length) {
            const cut = /[\uD800-\uDBFF]/.test(rest[room - 1] ?? "") ? room - 1 : room;
            chunks.push(rest.slice(0, cut));
            rest = rest.slice(cut);
        }
        return chunks.map((part, i) => `${marker ? `${marker}\n` : ""}_(part ${i + 1}/${chunks.length})_\n${part}`);
    }
    const lines = body.split("\n");
    const marker = lines[0]?.startsWith("###### ") ? lines.shift() : null;
    let digits = 2;
    for (;;) {
        const widestPart = "9".repeat(digits);
        const headerRoom = (marker ? marker.length + 1 : 0) + `_(part ${widestPart}/${widestPart})_\n`.length;
        const room = limit - headerRoom;
        const chunks = [];
        let cur = "";
        const flush = () => {
            if (cur !== "")
                chunks.push(cur);
            cur = "";
        };
        for (const raw of lines) {
            let line = raw;
            while (line.length > room) {
                flush();
                const cut = room > 0 && /[\uD800-\uDBFF]/.test(line[room - 1] ?? "") ? room - 1 : room;
                if (cut <= 0)
                    throw new TrackerError("http-400", "comment limit cannot fit one code point");
                chunks.push(line.slice(0, cut));
                line = line.slice(cut);
            }
            const next = cur === "" ? line : `${cur}\n${line}`;
            if (next.length > room) {
                flush();
                cur = line;
            }
            else
                cur = next;
        }
        flush();
        const requiredDigits = String(chunks.length).length;
        if (requiredDigits > digits) {
            digits = requiredDigits;
            continue;
        }
        return chunks.map((c, i) => [...(marker ? [marker] : []), `_(part ${i + 1}/${chunks.length})_`, c].join("\n"));
    }
}
function commentEvidence(raw) {
    const author = asRecord(raw.user ?? raw.author);
    const id = raw.databaseId ?? raw.id;
    const authorId = author.databaseId ?? author.accountId ?? author.id;
    const createdAt = raw.created_at ?? raw.createdAt ?? raw.created;
    const updatedAt = raw.updated_at ?? raw.updatedAt ?? raw.updated;
    if ((typeof id !== "string" && typeof id !== "number") ||
        String(id).trim() === "" ||
        typeof createdAt !== "string" ||
        typeof updatedAt !== "string" ||
        !Number.isFinite(Date.parse(createdAt)) ||
        !Number.isFinite(Date.parse(updatedAt)) ||
        typeof raw.body !== "string")
        return undefined;
    return {
        id: String(id),
        authorId: (typeof authorId === "string" || typeof authorId === "number") &&
            String(authorId).trim() !== ""
            ? String(authorId)
            : null,
        createdAt,
        updatedAt,
        fingerprint: actionHash(raw.body),
        representation: "markdown",
        sectionIds: [
            ...raw.body.matchAll(/(?:######[ \t]+|<h6\b[^>]*>\s*)bkit:section v1 ([a-f0-9]{64})\b/g),
        ].map((match) => match[1]),
    };
}
/** Create a comment, or edit the supplied verified ID. Throws `TrackerError` on failure. */
export async function postComment(t, body, opts = {}) {
    if (t.issue === null)
        throw new TrackerError("not-found", "no issue");
    const limit = t.tracker === "linear"
        ? COMMENT_BODY_BUDGETS.linear
        : t.tracker === "github"
            ? COMMENT_BODY_BUDGETS.github
            : COMMENT_BODY_BUDGETS.jira;
    if (!opts.commentId && t.tracker !== "jira" && body.length > limit) {
        const parts = splitAt(body, limit, { compact: true });
        let last;
        for (const part of parts)
            last = await postComment(t, part, opts);
        if (!last)
            throw new TrackerError("network", "no comment parts");
        return { url: last.url, parts: parts.length };
    }
    if (t.tracker === "github") {
        charge(opts.budget, "writes");
        const out = gh(t, [
            "api",
            opts.commentId
                ? `repos/${t.ownerRepo}/issues/comments/${encodeURIComponent(opts.commentId)}`
                : `repos/${t.ownerRepo}/issues/${t.issue}/comments`,
            "--method",
            opts.commentId ? "PATCH" : "POST",
            "--input",
            "-",
        ], JSON.stringify({ body }), opts.budget);
        const parsed = parseJson(out);
        const raw = asRecord(parsed.ok ? parsed.value : null);
        const url = raw.html_url;
        const evidence = commentEvidence(raw);
        return {
            url: typeof url === "string" ? url : null,
            parts: 1,
            ...(evidence ? { evidence } : {}),
        };
    }
    if (t.tracker === "linear") {
        charge(opts.budget, "writes");
        const data = await linearGql(opts.commentId
            ? "mutation($id: String!, $input: CommentUpdateInput!) { commentUpdate(id: $id, input: $input) { success comment { id body url createdAt updatedAt user { id } } } }"
            : "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { id body url createdAt updatedAt user { id } } } }", opts.commentId
            ? { id: opts.commentId, input: { body } }
            : { input: { issueId: t.issue, body } }, opts.budget);
        const created = asRecord(opts.commentId ? data.commentUpdate : data.commentCreate);
        if (created.success !== true)
            throw new TrackerError("http-400", "linear: comment mutation failed");
        const raw = asRecord(created.comment);
        const url = raw.url;
        const evidence = commentEvidence(raw);
        return {
            url: typeof url === "string" ? url : null,
            parts: 1,
            ...(evidence ? { evidence } : {}),
        };
    }
    if (t.tracker === "jira") {
        if (opts.commentId &&
            (!opts.evidence ||
                opts.evidence.id !== opts.commentId ||
                !opts.evidence.authorId ||
                opts.evidence.representation !== "markdown" ||
                !/^[a-f0-9]{64}$/.test(opts.evidence.fingerprint) ||
                !Number.isFinite(Date.parse(opts.evidence.createdAt)) ||
                !Number.isFinite(Date.parse(opts.evidence.updatedAt))))
            throw new TrackerError("unsupported", "jira: comment edit requires verified evidence");
        const site = jiraSite(t);
        const jira = JiraSession.open(opts.budget);
        const parts = splitAt(body, JIRA_COMMENT_LIMIT);
        if (opts.commentId && parts.length !== 1)
            throw new TrackerError("unsupported", "jira: split bodies require new comments");
        let id;
        let observed = false;
        let returnedBody;
        for (const part of parts) {
            charge(opts.budget, "writes");
            const res = asRecord(await jira.call(JIRA_TOOLS.comment, {
                cloudId: site,
                issueIdOrKey: t.issue,
                commentBody: part,
                ...(opts.commentId
                    ? {
                        commentId: opts.commentId,
                        contentFormat: "markdown",
                        responseContentFormat: "markdown",
                    }
                    : {}),
            }));
            const raw = res.data === undefined ? res : asRecord(res.data);
            id = raw.commentId ?? raw.id;
            observed = typeof raw.commentId === "string";
            returnedBody =
                raw.appliedContentFormat === "markdown" && typeof raw.body === "string"
                    ? raw.body
                    : undefined;
        }
        const base = `${site}/browse/${t.issue}`;
        const posted = {
            url: id === undefined ? base : `${base}?focusedCommentId=${String(id)}`,
            parts: parts.length,
        };
        if (observed && parts.length === 1) {
            try {
                const latest = await jiraComments(t, 1, jira, opts.budget);
                const evidence = latest.find((comment) => comment.evidence !== undefined &&
                    comment.evidence.id === id &&
                    returnedBody !== undefined &&
                    comment.evidence.fingerprint === actionHash(returnedBody) &&
                    (!opts.evidence || comment.evidence.authorId === opts.evidence.authorId))?.evidence;
                return { ...posted, ...(evidence ? { evidence } : {}) };
            }
            catch {
                // An acknowledged mutation stays successful when optional evidence is unavailable.
                return posted;
            }
        }
        return posted;
    }
    throw new TrackerError("not-found", "issue tracker none");
}
/** The issue's latest `n` comments (body + url), newest last. */
export async function recentComments(t, n, budget) {
    if (t.issue === null || !Number.isInteger(n) || n <= 0)
        return [];
    if (t.tracker === "github") {
        const [owner, name] = t.ownerRepo.split("/");
        const nodes = [];
        const cursors = new Set();
        let before;
        for (let page = 0; page < 10; page++) {
            charge(budget, "pages");
            const out = gh(t, [
                "api",
                "graphql",
                "-f",
                `query=query($o:String!,$r:String!,$n:Int!,$before:String){repository(owner:$o,name:$r){issue(number:$n){comments(last:${Math.min(n, 100)},before:$before){nodes{id databaseId body url author{__typename ... on User{id databaseId} ... on Bot{id databaseId}} createdAt updatedAt} pageInfo{hasPreviousPage startCursor}}}}}`,
                "-F",
                `o=${owner ?? ""}`,
                "-F",
                `r=${name ?? ""}`,
                "-F",
                `n=${t.issue}`,
                ...(before ? ["-f", `before=${before}`] : []),
            ], undefined, budget);
            const parsed = parseJson(out);
            const comments = asRecord(asRecord(asRecord(asRecord(asRecord(parsed.ok ? parsed.value : null).data).repository).issue).comments);
            if (!Array.isArray(comments.nodes))
                throw new TrackerError("http-200", "github: comment page returned no nodes");
            nodes.unshift(...comments.nodes);
            const info = asRecord(comments.pageInfo);
            if (info.hasPreviousPage !== true || nodes.length >= n)
                break;
            const cursor = info.startCursor;
            if (typeof cursor !== "string" || cursor === "" || cursors.has(cursor) || page === 9)
                throw new TrackerError("http-200", "github: comment pagination is incomplete");
            cursors.add(cursor);
            before = cursor;
        }
        return nodes.map((c) => {
            const r = asRecord(c);
            const evidence = commentEvidence(r);
            return {
                body: String(r.body ?? ""),
                url: typeof r.url === "string" ? r.url : null,
                ...(evidence ? { evidence } : {}),
            };
        });
    }
    if (t.tracker === "linear") {
        const nodes = [];
        const cursors = new Set();
        let after = null;
        for (let page = 0; page < 10; page++) {
            charge(budget, "pages");
            const data = await linearGql("query($id: String!, $after: String) { issue(id: $id) { comments(first: 100, after: $after) { nodes { id body url createdAt updatedAt user { id } } pageInfo { hasNextPage endCursor } } } }", { id: t.issue, after }, budget);
            const comments = asRecord(asRecord(data.issue).comments);
            if (!Array.isArray(comments.nodes))
                throw new TrackerError("http-200", "linear: comment page returned no nodes");
            nodes.push(...comments.nodes);
            const info = asRecord(comments.pageInfo);
            if (info.hasNextPage !== true)
                break;
            const cursor = info.endCursor;
            if (typeof cursor !== "string" || cursor === "" || cursors.has(cursor) || page === 9)
                throw new TrackerError("http-200", "linear: comment pagination is incomplete");
            cursors.add(cursor);
            after = cursor;
        }
        const ordered = nodes.map((raw) => {
            const comment = asRecord(raw);
            const created = typeof comment.createdAt === "string" ? Date.parse(comment.createdAt) : NaN;
            if (!Number.isFinite(created))
                throw new TrackerError("http-200", "linear: comment creation ordering is incomplete");
            return { comment, created };
        });
        return ordered
            .sort((a, b) => a.created - b.created)
            .slice(-n)
            .map(({ comment: raw }) => {
            const evidence = commentEvidence(raw);
            return {
                body: str(raw.body),
                url: typeof raw.url === "string" ? raw.url : null,
                ...(evidence ? { evidence } : {}),
            };
        });
    }
    if (t.tracker === "jira")
        return jiraComments(t, n, JiraSession.open(budget), budget);
    return [];
}
async function jiraComments(t, n, jira, budget) {
    const site = jiraSite(t);
    const comments = [];
    for (let page = 0; page < 10; page++) {
        charge(budget, "pages");
        const response = asRecord(await jira.call(JIRA_TOOLS.comments, {
            cloudId: site,
            issueIdOrKey: t.issue,
            startAt: comments.length,
            maxResults: Math.min(n - comments.length, 100),
            orderBy: "-created",
            responseContentFormat: "markdown",
            view: "evidence",
        }));
        const data = response.data === undefined ? response : asRecord(response.data);
        if (!Array.isArray(data.comments))
            throw new TrackerError("http-200", "jira: comment page returned no comments");
        for (const item of data.comments) {
            const raw = asRecord(item);
            const candidate = data.appliedContentFormat === "markdown" ? commentEvidence(raw) : undefined;
            const evidence = candidate?.authorId ? candidate : undefined;
            comments.push({
                body: textOf(raw.body),
                url: typeof raw.id === "string"
                    ? `${site}/browse/${t.issue}?focusedCommentId=${raw.id}`
                    : null,
                ...(evidence ? { evidence } : {}),
            });
        }
        if (data.isLast !== false || comments.length >= n)
            return comments.slice(0, n).reverse();
        if (data.comments.length === 0)
            throw new TrackerError("http-200", "jira: comment pagination is incomplete");
    }
    throw new TrackerError("http-200", "jira: comment pagination is incomplete");
}
const str = (v) => (typeof v === "string" ? v : "");
// ADF nodes whose children are inline text; every other node's children are blocks, one per line.
const ADF_INLINE = new Set(["paragraph", "heading", "codeBlock", "mediaSingle"]);
/** An Atlassian Document Format node as text: headings as `#` lines, blocks one per line. */
function adfText(node) {
    if (typeof node === "string")
        return node;
    const n = asRecord(node);
    if (n.type === "text")
        return str(n.text);
    if (n.type === "hardBreak")
        return "\n";
    const children = Array.isArray(n.content) ? n.content.map(adfText) : [];
    if (!ADF_INLINE.has(str(n.type)))
        return children.join("\n");
    const text = children.join("");
    if (n.type !== "heading")
        return text;
    const level = Math.min(6, Math.max(1, Number(asRecord(n.attrs).level) || 1));
    return `${"#".repeat(level)} ${text}`;
}
/** A tracker text field as a string: a string verbatim, a document node (ADF) as its text. */
const textOf = (v) => typeof v === "string" ? v : v === null || v === undefined ? "" : adfText(v);
const commentOf = (raw, at) => {
    const r = asRecord(raw);
    const created = r[at];
    return {
        body: textOf(r.body),
        ...(typeof created === "string" ? { createdAt: created } : {}),
    };
};
/** The issue's facts, description and every comment. Throws `TrackerError` on failure. */
export async function fetchIssue(t) {
    if (t.issue === null)
        throw new TrackerError("not-found", "no issue");
    if (t.tracker === "github") {
        const parsed = parseJson(gh(t, ["api", `repos/${t.ownerRepo}/issues/${t.issue}`]));
        const issue = asRecord(parsed.ok ? parsed.value : null);
        const lines = gh(t, [
            "api",
            "--paginate",
            `repos/${t.ownerRepo}/issues/${t.issue}/comments?per_page=100`,
            "--jq",
            ".[] | {body, created_at}",
        ]);
        const comments = lines
            .split("\n")
            .filter((l) => l.trim() !== "")
            .map((l) => {
            const c = parseJson(l);
            return commentOf(c.ok ? c.value : null, "created_at");
        });
        return {
            title: str(issue.title),
            url: str(issue.html_url),
            state: str(issue.state),
            labels: (Array.isArray(issue.labels) ? issue.labels : []).map((l) => typeof l === "string" ? l : str(asRecord(l).name)),
            body: str(issue.body),
            comments,
        };
    }
    if (t.tracker === "linear") {
        const page = "nodes { body createdAt } pageInfo { hasNextPage endCursor }";
        const data = await linearGql(`query($id: String!) { issue(id: $id) { identifier title url description state { name } labels { nodes { name } } comments(first: 250) { ${page} } } }`, { id: t.issue });
        const issue = asRecord(data.issue);
        if (!data.issue)
            throw new TrackerError("not-found", `linear: ${t.issue} not found`);
        const nodes = (o) => {
            const n = asRecord(o).nodes;
            return Array.isArray(n) ? n : [];
        };
        const comments = nodes(issue.comments).map((c) => commentOf(c, "createdAt"));
        for (let info = asRecord(asRecord(issue.comments).pageInfo); info.hasNextPage === true;) {
            const next = await linearGql(`query($id: String!, $after: String!) { issue(id: $id) { comments(first: 250, after: $after) { ${page} } } }`, { id: t.issue, after: str(info.endCursor) });
            const more = asRecord(asRecord(next.issue).comments);
            const list = nodes(more);
            comments.push(...list.map((c) => commentOf(c, "createdAt")));
            info = list.length === 0 ? {} : asRecord(more.pageInfo);
        }
        return {
            title: str(issue.title),
            url: str(issue.url),
            state: str(asRecord(issue.state).name),
            labels: nodes(issue.labels).map((l) => str(asRecord(l).name)),
            body: str(issue.description),
            comments,
        };
    }
    if (t.tracker === "jira") {
        const site = jiraSite(t);
        const jira = JiraSession.open();
        const raw = asRecord(await jira.call(JIRA_TOOLS.getIssue, {
            cloudId: site,
            issueIdOrKey: t.issue,
            view: "evidence",
        }));
        const fields = asRecord(raw.fields);
        const description = fields.description;
        const comments = [];
        for (let startAt = 0;;) {
            const page = asRecord(await jira.call(JIRA_TOOLS.read, {
                cloudId: site,
                name: JIRA_TOOLS.comments,
                inputs: { issueIdOrKey: t.issue, maxResults: 100, startAt },
            }));
            const list = Array.isArray(page.comments) ? page.comments : [];
            if (page.appliedContentFormat === "html") {
                // One comment Jira cannot express as markdown turns its whole page HTML; read
                // alone, every other comment on it comes back as markdown.
                for (const [i, c] of list.entries()) {
                    const one = asRecord(await jira.call(JIRA_TOOLS.read, {
                        cloudId: site,
                        name: JIRA_TOOLS.comments,
                        inputs: { issueIdOrKey: t.issue, maxResults: 1, startAt: startAt + i },
                    }));
                    const alone = Array.isArray(one.comments) ? one.comments[0] : undefined;
                    comments.push(commentOf(alone ?? c, "created"));
                }
            }
            else
                comments.push(...list.map((c) => commentOf(c, "created")));
            if (page.isLast !== false || list.length === 0)
                break;
            startAt += list.length;
        }
        return {
            title: str(fields.summary),
            url: `${site}/browse/${t.issue}`,
            state: str(asRecord(fields.status).name),
            labels: (Array.isArray(fields.labels) ? fields.labels : []).map((l) => String(l)),
            body: textOf(description),
            comments,
        };
    }
    throw new TrackerError("not-found", "issue tracker none");
}
// ---------------------------------------------------------------------------
// labels, state and board
// ---------------------------------------------------------------------------
/** The issue's current label names. Throws `TrackerError` on failure. */
export async function readLabels(t) {
    if (t.issue === null)
        throw new TrackerError("not-found", "no issue");
    if (t.tracker === "github") {
        const out = gh(t, [
            "api",
            `repos/${t.ownerRepo}/issues/${t.issue}`,
            "--jq",
            "[.labels[].name]",
        ]);
        const parsed = parseJson(out);
        const names = parsed.ok ? parsed.value : null;
        return Array.isArray(names) ? names.map((n) => String(n)) : [];
    }
    if (t.tracker === "linear") {
        const data = await linearGql("query($id: String!) { issue(id: $id) { labels { nodes { name } } } }", {
            id: t.issue,
        });
        if (!data.issue)
            throw new TrackerError("not-found", `linear: ${t.issue} not found`);
        const nodes = asRecord(asRecord(data.issue).labels).nodes;
        return (Array.isArray(nodes) ? nodes : []).map((n) => str(asRecord(n).name));
    }
    if (t.tracker === "jira") {
        const raw = asRecord(await JiraSession.open().call(JIRA_TOOLS.getIssue, {
            cloudId: jiraSite(t),
            issueIdOrKey: t.issue,
            view: "evidence",
        }));
        const labels = asRecord(raw.fields).labels;
        return (Array.isArray(labels) ? labels : []).map((l) => String(l));
    }
    throw new TrackerError("not-found", "issue tracker none");
}
/**
 * Write a label transition (and, on Linear / Jira, the state). Labels land before
 * the state: a state name the team or project lacks throws after them, with the
 * labels written. Throws `TrackerError` on failure.
 */
export async function writeLabels(t, w) {
    if (t.issue === null)
        throw new TrackerError("not-found", "no issue");
    if (t.tracker === "github") {
        const base = `repos/${t.ownerRepo}/issues/${t.issue}/labels`;
        if (w.add.length > 0)
            gh(t, ["api", base, "--method", "POST", "--input", "-"], JSON.stringify({ labels: w.add }));
        for (const l of w.remove)
            gh(t, ["api", `${base}/${encodeURIComponent(l)}`, "--method", "DELETE"]);
        return;
    }
    if (t.tracker === "linear") {
        const data = await linearGql("query($id: String!, $names: [String!]!) { issue(id: $id) { id team { id states { nodes { id name } } } } issueLabels(first: 250, filter: { name: { in: $names } }) { nodes { id name team { id } } } }", { id: t.issue, names: [...w.add, ...w.remove] });
        const issue = asRecord(data.issue);
        if (!data.issue)
            throw new TrackerError("not-found", `linear: ${t.issue} not found`);
        const team = asRecord(issue.team);
        const teamId = str(team.id);
        const known = (Array.isArray(asRecord(data.issueLabels).nodes)
            ? asRecord(data.issueLabels).nodes
            : [])
            .map((n) => asRecord(n))
            // A team's own label wins over a workspace label of the same name.
            .filter((n) => n.team === null || n.team === undefined || str(asRecord(n.team).id) === teamId)
            .sort((a, b) => Number(Boolean(b.team)) - Number(Boolean(a.team)));
        const idOf = (name) => known.find((n) => n.name === name)?.id;
        const added = [];
        for (const name of w.add) {
            const id = idOf(name);
            if (id) {
                added.push(id);
                continue;
            }
            const created = asRecord((await linearGql("mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { success issueLabel { id } } }", { input: { name, teamId } })).issueLabelCreate);
            added.push(str(asRecord(created.issueLabel).id));
        }
        const removed = w.remove.map(idOf).filter((id) => Boolean(id));
        if (added.length + removed.length > 0) {
            await linearGql("mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }", { id: str(issue.id) || t.issue, input: { addedLabelIds: added, removedLabelIds: removed } });
        }
        if (w.state !== null) {
            const states = asRecord(team.states).nodes;
            const state = (Array.isArray(states) ? states : [])
                .map((s) => asRecord(s))
                .find((s) => s.name === w.state);
            if (!state)
                throw new TrackerError("not-found", `linear: no state "${w.state}"`);
            await linearGql("mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }", { id: str(issue.id) || t.issue, input: { stateId: str(state.id) } });
        }
        return;
    }
    if (t.tracker === "jira") {
        const site = jiraSite(t);
        const jira = JiraSession.open();
        if (w.add.length + w.remove.length > 0) {
            await jira.call(JIRA_TOOLS.edit, {
                cloudId: site,
                issueIdOrKey: t.issue,
                fields: { labels: w.labels },
            });
        }
        if (w.state !== null) {
            const listed = asRecord(await jira.call(JIRA_TOOLS.read, {
                cloudId: site,
                name: JIRA_TOOLS.transitions,
                inputs: { issueIdOrKey: t.issue },
            }));
            const all = Array.isArray(listed.transitions) ? listed.transitions : [];
            const hit = all.map((x) => asRecord(x)).find((x) => asRecord(x.to).name === w.state);
            if (!hit)
                throw new TrackerError("not-found", `jira: no transition to "${w.state}"`);
            await jira.call(JIRA_TOOLS.transition, {
                cloudId: site,
                issueIdOrKey: t.issue,
                transitionId: String(hit.id),
            });
        }
        return;
    }
    throw new TrackerError("not-found", "issue tracker none");
}
const BLOCKED_START = /^[ \t]*###### bkit:blocked-by start[ \t]*\r?$/;
const BLOCKED_END = /^[ \t]*###### bkit:blocked-by end[ \t]*\r?$/;
/** The `- #N` lines of a body's whole-line `###### bkit:blocked-by start` … `end` block, as numbers. */
export function parseBlockedBy(body) {
    const lines = body.split("\n");
    const start = lines.findIndex((l) => BLOCKED_START.test(l));
    if (start === -1)
        return [];
    const out = [];
    for (const line of lines.slice(start + 1)) {
        if (BLOCKED_END.test(line))
            break;
        const m = /^[ \t]*[-*][ \t]+#([0-9]+)\b/.exec(line);
        if (m)
            out.push(m[1]);
    }
    return out;
}
/**
 * The issues blocking the target: GitHub from the body's blocked-by block, Linear
 * from `blocks` relations pointing at it, Jira from `is blocked by` links. Throws
 * `TrackerError` on failure.
 */
export async function readBlockers(t) {
    if (t.issue === null)
        throw new TrackerError("not-found", "no issue");
    if (t.tracker === "github") {
        const parsed = parseJson(gh(t, ["api", `repos/${t.ownerRepo}/issues/${t.issue}`]));
        const numbers = parseBlockedBy(str(asRecord(parsed.ok ? parsed.value : null).body));
        return numbers.map((n) => {
            const state = gh(t, ["api", `repos/${t.ownerRepo}/issues/${n}`, "--jq", ".state"]).trim();
            return { id: `#${n}`, state, open: state !== "closed" };
        });
    }
    if (t.tracker === "linear") {
        const data = await linearGql("query($id: String!) { issue(id: $id) { inverseRelations(first: 100) { nodes { type issue { identifier state { name type } } } } } }", { id: t.issue });
        if (!data.issue)
            throw new TrackerError("not-found", `linear: ${t.issue} not found`);
        const nodes = asRecord(asRecord(data.issue).inverseRelations).nodes;
        return (Array.isArray(nodes) ? nodes : [])
            .map((n) => asRecord(n))
            .filter((n) => n.type === "blocks")
            .map((n) => {
            const issue = asRecord(n.issue);
            const state = asRecord(issue.state);
            return {
                id: str(issue.identifier),
                state: str(state.name),
                open: !["completed", "canceled"].includes(str(state.type)),
            };
        });
    }
    if (t.tracker === "jira") {
        const res = asRecord(await JiraSession.open().call(JIRA_TOOLS.search, {
            cloudId: jiraSite(t),
            jql: `issue in linkedIssues('${t.issue}', 'is blocked by')`,
            fields: ["status"],
            maxResults: 100,
        }));
        const issues = Array.isArray(res.issues) ? res.issues : [];
        return issues.map((i) => {
            const issue = asRecord(i);
            const status = asRecord(asRecord(issue.fields).status);
            return {
                id: str(issue.key),
                state: str(status.name),
                open: str(asRecord(status.statusCategory).key) !== "done",
            };
        });
    }
    throw new TrackerError("not-found", "issue tracker none");
}
/**
 * Put the issue on the Projects v2 board and set its Status. Adding an item that is
 * already on the board returns that item, so a repeat is harmless. Throws
 * `TrackerError` on failure (a token without `project` scope fails as `scope`).
 */
export async function moveOnBoard(t, b) {
    if (t.issue === null)
        throw new TrackerError("not-found", "no issue");
    const [owner, name] = t.ownerRepo.split("/");
    const field = 'projectV2(number: $p) { id field(name: "Status") { ... on ProjectV2SingleSelectField { id options { id name } } } }';
    const looked = parseJson(gh(t, [
        "api",
        "graphql",
        "-f",
        `query=query($o: String!, $r: String!, $n: Int!, $login: String!, $p: Int!) { repository(owner: $o, name: $r) { issue(number: $n) { id } } repositoryOwner(login: $login) { ... on User { ${field} } ... on Organization { ${field} } } }`,
        "-F",
        `o=${owner ?? ""}`,
        "-F",
        `r=${name ?? ""}`,
        "-F",
        `n=${t.issue}`,
        "-F",
        `login=${b.owner}`,
        "-F",
        `p=${b.number}`,
    ]));
    const data = asRecord(asRecord(looked.ok ? looked.value : null).data);
    const issueId = str(asRecord(asRecord(data.repository).issue).id);
    const project = asRecord(asRecord(data.repositoryOwner).projectV2);
    const status = asRecord(project.field);
    const options = Array.isArray(status.options) ? status.options : [];
    const option = options.map((o) => asRecord(o)).find((o) => o.name === b.status);
    if (!issueId || !project.id)
        throw new TrackerError("scope", "github: the issue or the board is not visible to this token");
    if (!status.id || !option)
        throw new TrackerError("not-found", `github: the board has no Status option "${b.status}"`);
    const added = parseJson(gh(t, [
        "api",
        "graphql",
        "-f",
        "query=mutation($p: ID!, $c: ID!) { addProjectV2ItemById(input: { projectId: $p, contentId: $c }) { item { id } } }",
        "-F",
        `p=${str(project.id)}`,
        "-F",
        `c=${issueId}`,
    ]));
    const itemId = str(asRecord(asRecord(asRecord(asRecord(added.ok ? added.value : null).data).addProjectV2ItemById).item).id);
    if (!itemId)
        throw new TrackerError("http-200", "github: addProjectV2ItemById returned no item");
    gh(t, [
        "api",
        "graphql",
        "-f",
        "query=mutation($p: ID!, $i: ID!, $f: ID!, $o: String!) { updateProjectV2ItemFieldValue(input: { projectId: $p, itemId: $i, fieldId: $f, value: { singleSelectOptionId: $o } }) { projectV2Item { id } } }",
        "-F",
        `p=${str(project.id)}`,
        "-F",
        `i=${itemId}`,
        "-F",
        `f=${str(status.id)}`,
        "-F",
        `o=${str(option.id)}`,
    ]);
}
/** The skip a target calls for, or null when the action can go ahead. */
export function skipOf(t) {
    if (t.tracker === "none")
        return { skipped: "tracker-none" };
    if (t.issue === null)
        return { skipped: "no-issue" };
    return null;
}
function progressBinding(t, o) {
    const common = git(t.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    if (!common)
        return null;
    const target = [t.tracker, t.ownerRepo || t.jiraSite || t.linearTeam || "", t.issue].join("/");
    if (o.publication && o.key) {
        const { invocation, workflow } = o.publication;
        return {
            target,
            invocation,
            workflow,
            file: path.join(common, "bkit-outbox", "progress", `${actionHash(`${target}\0${invocation}`)}.json`),
            priorDelivery: false,
        };
    }
    if (!o.file || !o.key)
        return null;
    const [workflow, runText, step, group, attempt] = o.key.split("/");
    if (!workflow || !/^\d+$/.test(runText ?? ""))
        return null;
    if (step === "failure")
        return null;
    const runs = readRunsLenient(o.file).filter((run) => run.workflow === workflow);
    const run = runs[Number(runText) - 1];
    if (!run)
        return null;
    const fid = path.basename(path.dirname(o.file));
    const issue = issueIdOf(fid, t.tracker);
    if (issue !== null && issue !== t.issue)
        return "conflict";
    if (issue === null)
        return null;
    let invocation = actionHash([path.resolve(o.file), workflow, runText, run.startedAt].join("\0"));
    const association = runPublicationFile(common, o.file, workflow, run.startedAt);
    if (fs.existsSync(association)) {
        const parsed = parseJson(fs.readFileSync(association, "utf-8"));
        const saved = asRecord(parsed.ok ? parsed.value : null);
        if (saved.version === 1 && saved.workflow === workflow && typeof saved.invocation === "string")
            invocation = saved.invocation;
    }
    const at = run.steps.find((row) => row.step === step &&
        (group === "-" || row.group === Number(group)) &&
        (attempt === "-" || row.attempt === Number(attempt)))?.at;
    const prefix = `${workflow}/${runText}/`;
    const priorDelivery = fs
        .readFileSync(o.file, "utf-8")
        .split("\n")
        .some((line) => {
        const parsed = parseJson(line);
        const row = asRecord(parsed.ok ? parsed.value : null);
        return (row.type === "engine-action" && typeof row.key === "string" && row.key.startsWith(prefix));
    });
    return {
        target,
        invocation,
        workflow,
        file: path.join(common, "bkit-outbox", "progress", `${actionHash(`${target}\0${invocation}`)}.json`),
        ...(at && Number.isFinite(Date.parse(at)) ? { at } : {}),
        priorDelivery,
    };
}
function readProgress(binding) {
    if (!fs.existsSync(binding.file))
        return null;
    const parsed = parseJson(fs.readFileSync(binding.file, "utf-8"));
    const raw = asRecord(parsed.ok ? parsed.value : null);
    const comment = asRecord(raw.comment);
    const evidence = asRecord(comment.evidence);
    if (raw.version !== 1 ||
        raw.target !== binding.target ||
        raw.invocation !== binding.invocation ||
        raw.workflow !== binding.workflow ||
        typeof raw.source !== "string" ||
        !Array.isArray(raw.sections) ||
        typeof evidence.id !== "string" ||
        typeof evidence.authorId !== "string" ||
        typeof evidence.fingerprint !== "string" ||
        typeof evidence.createdAt !== "string" ||
        typeof evidence.updatedAt !== "string" ||
        evidence.representation !== "markdown" ||
        !Array.isArray(evidence.sectionIds) ||
        !evidence.sectionIds.every((id) => typeof id === "string") ||
        (comment.url !== null && typeof comment.url !== "string"))
        return null;
    const sections = [];
    for (const value of raw.sections) {
        const section = asRecord(value);
        if (typeof section.id !== "string" ||
            typeof section.key !== "string" ||
            typeof section.hash !== "string" ||
            (section.at !== undefined && typeof section.at !== "string"))
            return null;
        sections.push({
            id: section.id,
            key: section.key,
            hash: section.hash,
            ...(typeof section.at === "string" ? { at: section.at } : {}),
        });
    }
    return {
        version: 1,
        target: binding.target,
        invocation: binding.invocation,
        workflow: binding.workflow,
        source: raw.source,
        comment: {
            url: comment.url,
            evidence: {
                id: evidence.id,
                authorId: evidence.authorId,
                fingerprint: evidence.fingerprint,
                createdAt: evidence.createdAt,
                updatedAt: evidence.updatedAt,
                representation: "markdown",
                sectionIds: evidence.sectionIds,
            },
        },
        sections,
    };
}
function progressSection(body, binding, key) {
    const hash = actionHash(body);
    const section = {
        id: actionHash(`${key}\0${hash}`),
        key,
        hash,
        ...(binding.at ? { at: binding.at } : {}),
    };
    const rest = body.split("\n").slice(1).join("\n");
    const source = stampMarker([
        GENERATED_MARKER,
        `###### bkit:progress v1 ${binding.invocation} 1 1`,
        `###### bkit:section v1 ${section.id} 1/1`,
        ...(binding.at ? [`Reported at ${binding.at}`, ""] : []),
        rest,
    ].join("\n"));
    return { section, source };
}
function saveProgress(binding, source, section, posted, priorSections = []) {
    if (!posted.evidence?.authorId)
        return;
    const state = {
        version: 1,
        target: binding.target,
        invocation: binding.invocation,
        workflow: binding.workflow,
        source,
        comment: { url: posted.url, evidence: posted.evidence },
        sections: [...priorSections, section],
    };
    fs.mkdirSync(path.dirname(binding.file), { recursive: true });
    fs.writeFileSync(binding.file, JSON.stringify(state), { mode: 0o600 });
}
export function commentDiagnostic(o, text, warnings) {
    const detail = redact(text);
    try {
        o.log(detail);
    }
    catch {
        warnings.push(`${detail}; comment diagnostic unavailable`);
    }
    const workflow = o.publication?.workflow ?? o.workflow ?? o.key?.split("/")[0];
    if (!o.cwd ||
        !workflow ||
        !["design", "plan", "build", "debug", "ship", "auto"].includes(workflow))
        return;
    const stage = /receipt|engine-action/.test(text)
        ? "receipt"
        : /lock/.test(text)
            ? "lock"
            : /recognition|reconciliation|postflight/.test(text)
                ? "reconciliation"
                : /source|cache/.test(text)
                    ? "source"
                    : /association/.test(text)
                        ? "association"
                        : "delivery";
    try {
        const root = git(o.cwd, ["rev-parse", "--show-toplevel"]) ?? o.cwd;
        const row = frictionRow({
            workflow,
            step: `comment-${stage}`,
            noun: "tracker",
            verb: "comment",
            code: null,
            bookRoot: root,
        });
        row.summary = `Workflow comment ${stage} unavailable`;
        row.description = `${workflow} comment reporting encountered an exhausted ${stage} problem; substantive workflow work continues.`;
        row.remediation =
            "Inspect tracker availability or local comment state; delivery may start a fresh comment.";
        if (o.knownUrl)
            row.references = [o.knownUrl];
        if (appendFrictionRow(root, row).ok)
            return;
    }
    catch {
        warnings.push("[bkit-tracker] comment friction unavailable");
    }
    try {
        o.log("[bkit-tracker] comment friction unavailable; continuing workflow");
    }
    catch {
        warnings.push("[bkit-tracker] friction diagnostic unavailable");
    }
}
/** The latest of `recent` that is `body` posted before: same marker hash, else same text. */
function samePosted(recent, body) {
    const hash = markerHashOf(body);
    return recent
        .filter((c) => (hash === null ? c.body.trim() === body.trim() : markerHashOf(c.body) === hash))
        .at(-1);
}
/**
 * Post `body` once. A recorded engine-action row with the same key and body, or a
 * recent comment with the same marker hash, is `deduped: true` without posting; a
 * failure is `done: false` with its reason, never a throw. A row that cannot be
 * written after a successful post is `done: true` with a `warning`.
 */
export async function postCommentOnce(t, body, o) {
    o = { ...o, cwd: t.cwd };
    const skip = skipOf(t);
    if (skip)
        return skip;
    const action = "comment";
    const hash = actionHash(body);
    let posted;
    let binding = null;
    let outgoing = body;
    let section;
    const warnings = [];
    let cached = null;
    let lock = null;
    const routine = o.purpose === "routine";
    let aggregate = false;
    const budget = {
        deadline: 0,
        duration: Math.max(1, Math.min(60_000, o.budgetMs ?? 60_000)),
        pages: 0,
        writes: 0,
        reserve: true,
    };
    const seal = () => {
        if (binding && binding !== "conflict") {
            try {
                fs.rmSync(binding.file, { force: true });
            }
            catch {
                commentDiagnostic(o, "[bkit-tracker] progress seal unavailable", warnings);
            }
        }
    };
    try {
        try {
            try {
                binding = progressBinding(t, o);
            }
            catch {
                commentDiagnostic(o, "[bkit-tracker] progress association unavailable; creating standalone comment", warnings);
            }
            if (o.file && o.key && binding !== "conflict") {
                try {
                    const prior = alreadyDone(o.file, o.key, hash);
                    if (prior)
                        return { done: true, action, url: prior.ref, deduped: true };
                }
                catch {
                    commentDiagnostic(o, "[bkit-tracker] comment receipt unavailable; creating standalone comment", warnings);
                }
            }
            if (o.purpose === "attention" || o.purpose === "terminal")
                seal();
            if (binding &&
                binding !== "conflict" &&
                o.key &&
                markerHashOf(body) &&
                o.purpose !== "attention" &&
                o.purpose !== "terminal") {
                try {
                    cached = readProgress(binding);
                    if (cached === null && fs.existsSync(binding.file))
                        commentDiagnostic(o, "[bkit-tracker] progress source unavailable; creating standalone comment", warnings);
                    if (cached)
                        o.knownUrl = cached.comment.url;
                    const rendered = progressSection(body, binding, o.key);
                    section = rendered.section;
                    if (routine) {
                        lock = await acquirePublicationLock(t.cwd, {
                            target: binding.target,
                            invocation: binding.invocation,
                            timeoutMs: Math.min(30_000, budget.duration / 2),
                        });
                        if (!lock) {
                            cached = null;
                            commentDiagnostic(o, "[bkit-tracker] aggregation unavailable: publication lock", warnings);
                        }
                        else {
                            cached = readProgress(binding);
                            if (cached && budget.duration < 1000) {
                                // With a short caller allowance, reserve the transport for standalone delivery.
                                outgoing = body;
                            }
                            else if (cached) {
                                const newest = (await recentComments(t, 1, budget)).at(-1);
                                const actual = newest?.evidence;
                                const saved = cached.comment.evidence;
                                if (actual?.authorId &&
                                    actual.id === saved.id &&
                                    actual.authorId === saved.authorId &&
                                    actual.fingerprint === saved.fingerprint &&
                                    actual.updatedAt === saved.updatedAt &&
                                    actual.createdAt === saved.createdAt &&
                                    actual.representation === saved.representation) {
                                    const known = cached.sections.find((s) => s.id === rendered.section.id);
                                    if (known && actual.sectionIds.includes(known.id))
                                        return {
                                            done: true,
                                            action,
                                            url: newest?.url ?? cached.comment.url,
                                            deduped: true,
                                        };
                                    outgoing = `${cached.source}\n\n${rendered.source.split("\n").slice(2).join("\n")}`;
                                    const limit = t.tracker === "linear"
                                        ? COMMENT_BODY_BUDGETS.linear
                                        : t.tracker === "jira"
                                            ? COMMENT_BODY_BUDGETS.jira
                                            : COMMENT_BODY_BUDGETS.github;
                                    if (outgoing.length <= limit)
                                        aggregate = true;
                                    else
                                        outgoing = body;
                                }
                                else
                                    outgoing = body;
                            }
                            else if (!binding.priorDelivery)
                                outgoing = rendered.source;
                        }
                    }
                    else if (cached || !binding.priorDelivery)
                        outgoing = rendered.source;
                }
                catch {
                    outgoing = body;
                    aggregate = false;
                    commentDiagnostic(o, "[bkit-tracker] progress source unavailable; creating standalone comment", warnings);
                }
            }
            if (routine && (!binding || binding === "conflict"))
                commentDiagnostic(o, "[bkit-tracker] aggregation unavailable: progress association unavailable", warnings);
            if (o.recent) {
                try {
                    const same = samePosted(await recentComments(t, o.recent, budget), body);
                    if (same)
                        return { done: true, action, url: same.url, deduped: true };
                }
                catch {
                    commentDiagnostic(o, "[bkit-tracker] comment lookup unavailable; creating standalone comment", warnings);
                    outgoing = body;
                }
            }
            if (aggregate && cached) {
                try {
                    posted = await postComment(t, outgoing, {
                        commentId: cached.comment.evidence.id,
                        evidence: cached.comment.evidence,
                        budget,
                    });
                }
                catch {
                    try {
                        const latest = (await recentComments(t, 1, budget)).at(-1);
                        if (latest?.evidence?.id === cached.comment.evidence.id &&
                            latest.evidence.authorId === cached.comment.evidence.authorId &&
                            section &&
                            latest.evidence.sectionIds.includes(section.id))
                            posted = { url: latest.url, parts: 1, evidence: latest.evidence };
                    }
                    catch {
                        commentDiagnostic(o, "[bkit-tracker] append recognition unavailable", warnings);
                    }
                    if (!posted) {
                        outgoing = body;
                        aggregate = false;
                        seal();
                    }
                }
            }
            if (!posted) {
                budget.reserve = false;
                posted = await postComment(t, outgoing, { budget });
            }
        }
        catch (err) {
            const reason = classifyFailure(err);
            commentDiagnostic(o, `tracker ${action} failed (${reason}); delivery unavailable`, warnings);
            seal();
            return { done: false, action, reason };
        }
        let retain = true;
        if (aggregate && posted.evidence) {
            try {
                const latest = (await recentComments(t, 1, budget)).at(-1)?.evidence;
                retain =
                    latest?.id === posted.evidence.id &&
                        latest.fingerprint === posted.evidence.fingerprint &&
                        latest.authorId === posted.evidence.authorId &&
                        latest.updatedAt === posted.evidence.updatedAt;
            }
            catch {
                retain = false;
                commentDiagnostic(o, "[bkit-tracker] postflight reconciliation unavailable", warnings);
            }
            if (!retain)
                seal();
        }
        if (retain && binding && binding !== "conflict" && section) {
            try {
                saveProgress(binding, outgoing, section, posted, aggregate ? cached?.sections : []);
            }
            catch {
                const warning = "[bkit-tracker] posted, but progress source could not be saved";
                commentDiagnostic(o, warning, warnings);
                warnings.push(warning);
            }
        }
        if (o.file && o.key && binding !== "conflict") {
            try {
                recordAction(o.file, { action, key: o.key, hash, ref: posted.url });
            }
            catch (err) {
                const warning = redact(`posted, but the engine-action row was not written to ${o.file}: ${err.message ?? String(err)}`);
                commentDiagnostic(o, warning, warnings);
                warnings.push(warning);
            }
        }
        return {
            done: true,
            action,
            url: posted.url,
            ...(warnings.length ? { warning: warnings.join("; ") } : {}),
        };
    }
    finally {
        if (lock && !(await releasePublicationLock(lock)))
            commentDiagnostic(o, "[bkit-tracker] publication lock release unavailable", warnings);
    }
}
/** Run one tracker write as `action`: `done: true`, or `done: false` with the reason (logged, redacted). */
export async function attempt(action, log, fn) {
    try {
        await fn();
        return { done: true, action, url: null };
    }
    catch (err) {
        const reason = classifyFailure(err);
        log(redact(`tracker ${action} failed (${reason}): ${err.message ?? String(err)}`));
        return { done: false, action, reason };
    }
}
// ---------------------------------------------------------------------------
// verb glue
// ---------------------------------------------------------------------------
/** `--post` on a verb that builds a comment. */
export const POST_FLAG = {
    name: "post",
    type: "boolean",
    help: "post the comment to the run's issue through the engine; prints `tracker`",
};
/** The `tracker` output key's meaning, shared by every `--post` verb. */
export const TRACKER_OUTPUT = "with --post: {done: true, action, url, deduped?, warning?} | {done: false, action, reason} (post `commentFile` verbatim via the tracker MCP) | {skipped: no-issue | tracker-none}; absent without --post";
/** The `commentFile` output key's meaning, shared by every verb that prints a comment. */
export const COMMENT_FILE_OUTPUT = "absolute path of a file holding `comment` byte-for-byte (the MCP fallback reads it); null when comment is null or its source file is unavailable";
/** How many of the issue's latest comments a re-run checks for the same marker hash. */
export const RECENT_COMMENTS = 5;
/** `comment` written to its body file, or null for no comment. */
export function commentFileOf(cwd, comment, ctx) {
    if (comment === null)
        return null;
    try {
        return writeBodyFile(cwd, "comment", comment);
    }
    catch {
        commentDiagnostic({
            cwd,
            workflow: ctx?.publication?.workflow ?? str(ctx?.flags.workflow),
            log: (line) => ctx?.log(line),
        }, "[bkit-tracker] fallback source unavailable; continuing workflow", []);
        return null;
    }
}
/** Optional session ownership, validated against this repository's private outbox. */
export function sessionPublication(cwd, session, workflow) {
    if (!session || !workflow)
        return undefined;
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    if (!common)
        throw new Error("session association repository unavailable");
    const sessions = path.join(common, "bkit-outbox", "sessions");
    const dir = fs.realpathSync(path.resolve(cwd, session));
    if (path.dirname(dir) !== fs.realpathSync(sessions) || !fs.statSync(dir).isDirectory())
        throw new Error("session association directory unavailable");
    return { invocation: actionHash(`${dir}\0${workflow}`), workflow };
}
function runPublicationFile(common, file, workflow, at) {
    return path.join(common, "bkit-outbox", "invocations", `${actionHash([path.resolve(file), workflow, at].join("\0"))}.json`);
}
/** Bind only the exact run opened by workflows start; loss of this cache is harmless. */
export function bindRunPublication(ctx, file, workflow, run) {
    try {
        const publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), workflow);
        const current = readRunsLenient(file).filter((r) => r.workflow === workflow)[run - 1];
        const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
        if (!publication || !current || !common)
            return;
        const destination = runPublicationFile(common, file, workflow, current.startedAt);
        if (fs.existsSync(destination))
            return;
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, JSON.stringify({ version: 1, ...publication }), {
            mode: 0o600,
            flag: "wx",
        });
    }
    catch {
        commentDiagnostic({ cwd: ctx.cwd, workflow, log: (line) => ctx.log(line) }, "[bkit-tracker] invocation association unavailable; progress may start fresh", []);
    }
}
/**
 * The engine-action key of a comment in `file`'s current run of `workflow` (the
 * latest run's workflow when omitted); undefined with no status.jsonl or no run.
 */
export function runActionKey(file, workflow, ...parts) {
    return commentKey(file, workflow, runNumber, parts);
}
/**
 * The same key for the latest run of `workflow` once it has ended (a failure
 * comment written after the workflow-failed row): that run's number, not the next.
 */
export function endedRunActionKey(file, workflow, ...parts) {
    const latest = (runs, name) => runs.filter((r) => r.workflow === name).length;
    return commentKey(file, workflow, latest, parts);
}
function commentKey(file, workflow, numberOf, parts) {
    if (file === undefined || !fs.existsSync(file))
        return undefined;
    const runs = readRunsLenient(file);
    const name = workflow ?? runs.at(-1)?.workflow;
    if (name === undefined)
        return undefined;
    const n = numberOf(runs, name);
    return n === 0 ? undefined : actionKey(name, n, ...parts, "comment");
}
/**
 * Post `body` for a verb's `--post`: once per key in `file` when both are given,
 * else once per marker hash among the issue's latest comments.
 */
export async function postForVerb(ctx, body, o) {
    try {
        const t = trackerTarget(ctx.cwd, { fid: o.fid, issue: o.issue });
        let publication = ctx.publication;
        if (!o.file && !publication) {
            try {
                publication = sessionPublication(ctx.cwd, str(ctx.flags.sessionDir), str(ctx.flags.workflow));
            }
            catch {
                commentDiagnostic({ cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) }, "[bkit-tracker] invocation association unavailable; progress may start fresh", []);
                publication = undefined;
            }
        }
        const key = o.key ??
            (publication
                ? actionKey(publication.workflow, 1, "step", str(ctx.flags.stepNumber), str(ctx.flags.subStep), str(ctx.flags.attempt), "comment")
                : undefined);
        return await postCommentOnce(t, body, {
            file: o.file,
            key,
            publication,
            workflow: str(ctx.flags.workflow),
            purpose: o.purpose ?? (str(ctx.flags.workflow) ? "routine" : undefined),
            recent: key ? undefined : RECENT_COMMENTS,
            log: (line) => ctx.log(line),
        });
    }
    catch {
        commentDiagnostic({ cwd: ctx.cwd, workflow: str(ctx.flags.workflow), log: (line) => ctx.log(line) }, "[bkit-tracker] comment preparation unavailable; continuing workflow", []);
        return { done: false, action: "comment", reason: "preparation" };
    }
}
