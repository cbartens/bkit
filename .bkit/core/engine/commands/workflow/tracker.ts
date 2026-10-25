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

import type { IssueTracker } from "../../install/manifest.js";
import {
  actionHash,
  actionKey,
  alreadyDone,
  recordAction,
  runNumber,
  type WorkflowRun,
} from "../../ledgers/status.js";
import { resolveRepoSlug } from "../../ledgers/telemetry.js";
import { readBkitConfig, type BkitConfig } from "../../shared/settings.js";
import { git, parseJson, runGh, type FlagSpec, type GhResult, type RunContext } from "../lib.js";
import { issueIdOf, readIssueTracker } from "./fids.js";
import { readRunsLenient } from "./locks.js";

/** Jira Cloud's comment limit; longer bodies post as consecutive parts. */
export const JIRA_COMMENT_LIMIT = 32_767;

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
} as const;

// Cloudflare in front of Atlassian answers error 1010 to a default library User-Agent.
const USER_AGENT = "bkit-engine (+https://github.com/cbartens/bkit)";
const TIMEOUT_MS = 30_000;
const SECRET_KEYS = ["BKIT_GH_TOKEN", "BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"] as const;

// ---------------------------------------------------------------------------
// failure reasons
// ---------------------------------------------------------------------------

/** Why a tracker call failed: network | auth | scope | rate-limit | not-found | http-<n>. */
export type FailureReason = string;

export class TrackerError extends Error {
  constructor(
    readonly reason: FailureReason,
    detail: string,
  ) {
    super(redact(detail));
    this.name = "TrackerError";
  }
}

/** Replace every configured tracker secret's value in `text`. */
export function redact(text: string): string {
  let out = text;
  for (const k of SECRET_KEYS) {
    const v = process.env[k];
    if (v && v.length >= 4) out = out.split(v).join(`<${k}>`);
  }
  return out;
}

/** The reason an HTTP status (plus its response text) maps to. */
export function classifyStatus(status: number, text = ""): FailureReason {
  if (status === 401) return "auth";
  if (status === 403) return /rate limit/i.test(text) ? "rate-limit" : "scope";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limit";
  return `http-${status}`;
}

const NETWORK_CODES = /\b(ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|EHOSTUNREACH)\b/;

/** The reason any thrown value maps to; anything not a `TrackerError` or HTTP failure is network. */
export function classifyFailure(err: unknown): FailureReason {
  if (err instanceof TrackerError) return err.reason;
  return "network";
}

/** A `fetch` rejection (DNS, refused, timeout) as a network TrackerError. */
function networkError(err: unknown): TrackerError {
  const e = err as { name?: string; message?: string; cause?: { code?: string; message?: string } };
  const text = [e.name, e.message, e.cause?.code, e.cause?.message].filter(Boolean).join(" ");
  const kind = /TimeoutError|AbortError/.test(text)
    ? "timeout"
    : (NETWORK_CODES.exec(text)?.[1] ?? "fetch failed");
  return new TrackerError("network", kind);
}

/** The reason a failed `gh` call maps to. */
export function ghReason(res: GhResult): FailureReason {
  if (res.missing || res.status === 4) return "auth";
  const http = /\bHTTP (\d{3})\b/.exec(res.stderr);
  if (http) return classifyStatus(Number(http[1]), res.stderr);
  if (/rate limit/i.test(res.stderr)) return "rate-limit";
  if (/connect|timeout|resolve|dial tcp|no such host/i.test(res.stderr)) return "network";
  return `http-${res.status ?? 0}`;
}

// ---------------------------------------------------------------------------
// target
// ---------------------------------------------------------------------------

export interface TrackerTarget {
  tracker: IssueTracker;
  /** Issue number (GitHub) or key (Linear, Jira); null = the run has no issue. */
  issue: string | null;
  cwd: string;
  /** `owner/repo` of `origin` (GitHub). */
  ownerRepo: string;
  linearTeam: string | null;
  jiraSite: string | null;
  config: BkitConfig;
}

/**
 * The issue as a workflow argument: `#N` on GitHub, the key uppercased on Linear /
 * Jira, verbatim (empty included) with no tracker.
 */
export function issueRef(issue: string | null, tracker: IssueTracker): string {
  if (issue === null || issue === "") return "";
  if (tracker === "github") return `#${issue.replace(/^#/, "")}`;
  if (tracker === "none") return issue;
  return issue.toUpperCase();
}

/** The main checkout's root, from any worktree; `cwd` outside git. */
function mainRoot(cwd: string): string {
  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  return common ? path.dirname(common) : cwd;
}

/**
 * Where a tracker action goes: the configured tracker and the issue an explicit
 * `issue` (`#` stripped) names, else the one the FID embeds.
 */
export function trackerTarget(cwd: string, o: { fid?: string; issue?: string }): TrackerTarget {
  const tracker = readIssueTracker(cwd);
  const config = readBkitConfig(mainRoot(cwd));
  const given = o.issue?.trim().replace(/^#/, "");
  const issue =
    given !== undefined
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
export function ghEnv(): Record<string, string> {
  const t = process.env.BKIT_GH_TOKEN;
  return t ? { GH_TOKEN: t } : {};
}

/** `gh` for a tracker call; a failure throws its reason. */
export function gh(t: TrackerTarget, args: string[], input?: string): string {
  const res = runGh(t.cwd, args, input, ghEnv());
  if (!res.ok) throw new TrackerError(ghReason(res), `gh ${args[0] ?? ""}: ${res.stderr}`);
  return res.stdout;
}

function secret(key: (typeof SECRET_KEYS)[number]): string {
  const v = process.env[key];
  if (!v) throw new TrackerError("auth", `${key} is not set`);
  return v;
}

/** POST JSON; a non-2xx answer throws its reason unless `o.keepErrors` hands it back to read. */
async function post(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  o: { keepErrors?: boolean } = {},
): Promise<{ ok: boolean; status: number; headers: Headers; text: string }> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": USER_AGENT, ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw networkError(err);
  }
  const text = await res.text();
  if (!res.ok && o.keepErrors !== true)
    throw new TrackerError(classifyStatus(res.status, text), `HTTP ${res.status}`);
  return { ok: res.ok, status: res.status, headers: res.headers, text };
}

const asRecord = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

// ---------------------------------------------------------------------------
// linear
// ---------------------------------------------------------------------------

const LINEAR_CODES: Record<string, FailureReason> = {
  RATELIMITED: "rate-limit",
  AUTHENTICATION_ERROR: "auth",
  FORBIDDEN: "scope",
};

/**
 * One Linear GraphQL call. GraphQL errors map to a reason by `extensions.code` — Linear
 * answers rate limits and auth failures with HTTP 400 and the code in the body.
 */
export async function linearGql(query: string, variables: Record<string, unknown>) {
  const key = secret("BKIT_LINEAR_API_KEY");
  const res = await post(
    LINEAR_API_URL,
    { authorization: key },
    { query, variables },
    { keepErrors: true },
  );
  const parsed = parseJson(res.text);
  const doc = asRecord(parsed.ok ? parsed.value : null);
  const errors = Array.isArray(doc.errors) ? (doc.errors as Array<Record<string, unknown>>) : [];
  if (errors.length > 0) {
    const first = errors[0]!;
    const code = String(asRecord(first.extensions).code ?? "");
    const message = String(first.message ?? "");
    const reason =
      LINEAR_CODES[code] ??
      (/not found|could not find/i.test(message)
        ? "not-found"
        : res.ok
          ? "http-400"
          : classifyStatus(res.status, res.text));
    throw new TrackerError(reason, `linear: ${message}`);
  }
  if (!res.ok) throw new TrackerError(classifyStatus(res.status, res.text), `HTTP ${res.status}`);
  if (!parsed.ok) throw new TrackerError(`http-${res.status}`, "linear: response is not JSON");
  return asRecord(doc.data);
}

// ---------------------------------------------------------------------------
// jira (Rovo MCP over streamable HTTP)
// ---------------------------------------------------------------------------

/** The JSON-RPC message answering `id` in a JSON or event-stream response body. */
function rpcMessage(text: string, contentType: string, id: number): Record<string, unknown> {
  const candidates = /event-stream/.test(contentType)
    ? text
        .split("\n")
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
    : [text];
  for (const c of candidates) {
    const parsed = parseJson(c);
    const msg = asRecord(parsed.ok ? parsed.value : null);
    if (msg.id === id) return msg;
  }
  throw new TrackerError("http-200", "jira: no JSON-RPC answer in the response");
}

/** A Jira tool error's reason, from its text. */
function jiraReason(text: string): FailureReason {
  if (/does not exist|not found|no issue/i.test(text)) return "not-found";
  if (/rate limit|too many/i.test(text)) return "rate-limit";
  if (/unauthori[sz]ed|authenticat/i.test(text)) return "auth";
  if (/permission|forbidden|scope/i.test(text)) return "scope";
  return "http-400";
}

export class JiraSession {
  private id = 1;
  private session: string | null = null;
  constructor(private readonly key: string) {}

  static open(): JiraSession {
    return new JiraSession(secret("BKIT_JIRA_API_KEY"));
  }

  private headers(): Record<string, string> {
    return {
      authorization: `Bearer ${this.key}`,
      accept: "application/json, text/event-stream",
      ...(this.session ? { "mcp-session-id": this.session } : {}),
    };
  }

  private async start(): Promise<void> {
    if (this.session !== null) return;
    const res = await post(JIRA_MCP_URL, this.headers(), {
      jsonrpc: "2.0",
      id: this.id,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "bkit", version: "engine" },
      },
    });
    rpcMessage(res.text, res.headers.get("content-type") ?? "", this.id);
    this.session = res.headers.get("mcp-session-id") ?? "";
    await post(JIRA_MCP_URL, this.headers(), {
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });
  }

  /** `tools/call` one tool; returns its text content parsed as JSON when it is JSON. */
  async call(name: string, args: Record<string, unknown>): Promise<unknown> {
    await this.start();
    const id = ++this.id;
    const res = await post(JIRA_MCP_URL, this.headers(), {
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: { name, arguments: args },
    });
    const msg = rpcMessage(res.text, res.headers.get("content-type") ?? "", id);
    if (msg.error) {
      const message = String(asRecord(msg.error).message ?? "");
      throw new TrackerError(jiraReason(message), `jira ${name}: ${message}`);
    }
    const result = asRecord(msg.result);
    const content = Array.isArray(result.content) ? (result.content as unknown[]) : [];
    const text = content
      .map((c) => asRecord(c))
      .filter((c) => c.type === "text")
      .map((c) => String(c.text ?? ""))
      .join("\n");
    if (result.isError === true) throw new TrackerError(jiraReason(text), `jira ${name}: ${text}`);
    const parsed = parseJson(text);
    return parsed.ok ? parsed.value : text;
  }
}

function jiraSite(t: TrackerTarget): string {
  if (!t.jiraSite) throw new TrackerError("not-found", "bkit.tracker.jira.site is not set");
  return t.jiraSite;
}

// ---------------------------------------------------------------------------
// comments
// ---------------------------------------------------------------------------

/** First line of every comment bkit posts; such comments are never workflow input. */
export const GENERATED_MARKER = "###### bkit:generated";

/** The 12-hex sha256 prefix a stamped marker carries for `rest`, the body below it. */
const markerHash = (rest: string): string => actionHash(rest).slice(0, 12);

/**
 * `body` with a bare first-line marker stamped `###### bkit:generated {hash}`, the
 * hash of everything below it; any other body unchanged.
 */
export function stampMarker(body: string): string {
  const nl = body.indexOf("\n");
  if ((nl === -1 ? body : body.slice(0, nl)) !== GENERATED_MARKER) return body;
  const rest = nl === -1 ? "" : body.slice(nl + 1);
  return `${GENERATED_MARKER} ${markerHash(rest)}${nl === -1 ? "" : `\n${rest}`}`;
}

/** The hash a comment's first-line marker carries, as markdown or as Jira's HTML `<h6>`; null without one. */
export function markerHashOf(body: string): string | null {
  const first = body.replace(/^\s+/, "").split(/\r?\n/, 1)[0] ?? "";
  return (
    /^(?:######[ \t]+|<h6\b[^>]*>\s*)bkit:generated[ \t]+([0-9a-f]{12})\b/.exec(first)?.[1] ?? null
  );
}

/**
 * Write `body` byte-for-byte to `tmp/bkit-{kind}-{hash}.md` in the checkout `cwd`
 * sits in, for an MCP fallback to read verbatim; returns the absolute path.
 */
export function writeBodyFile(cwd: string, kind: "comment" | "pr-body", body: string): string {
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
export function splitAt(body: string, limit: number): string[] {
  if (body.length <= limit) return [body];
  const lines = body.split("\n");
  const marker = lines[0]?.startsWith("###### ") ? lines.shift()! : null;
  const headerRoom = (marker ? marker.length + 1 : 0) + "_(part 99/99)_\n".length;
  const room = limit - headerRoom;
  const chunks: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur !== "") chunks.push(cur);
    cur = "";
  };
  for (const raw of lines) {
    let line = raw;
    while (line.length > room) {
      flush();
      chunks.push(line.slice(0, room));
      line = line.slice(room);
    }
    const next = cur === "" ? line : `${cur}\n${line}`;
    if (next.length > room) {
      flush();
      cur = line;
    } else cur = next;
  }
  flush();
  return chunks.map((c, i) =>
    [...(marker ? [marker] : []), `_(part ${i + 1}/${chunks.length})_`, c].join("\n"),
  );
}

export interface PostedComment {
  url: string | null;
  /** How many comments the body went out as (Jira splits long bodies). */
  parts: number;
}

/** Post `body` as a new comment on the target issue. Throws `TrackerError` on failure. */
export async function postComment(t: TrackerTarget, body: string): Promise<PostedComment> {
  if (t.issue === null) throw new TrackerError("not-found", "no issue");
  if (t.tracker === "github") {
    const out = gh(
      t,
      [
        "api",
        `repos/${t.ownerRepo}/issues/${t.issue}/comments`,
        "--method",
        "POST",
        "--input",
        "-",
      ],
      JSON.stringify({ body }),
    );
    const parsed = parseJson(out);
    const url = asRecord(parsed.ok ? parsed.value : null).html_url;
    return { url: typeof url === "string" ? url : null, parts: 1 };
  }
  if (t.tracker === "linear") {
    const data = await linearGql(
      "mutation($input: CommentCreateInput!) { commentCreate(input: $input) { success comment { url } } }",
      { input: { issueId: t.issue, body } },
    );
    const created = asRecord(data.commentCreate);
    if (created.success !== true)
      throw new TrackerError("http-400", "linear: commentCreate failed");
    const url = asRecord(created.comment).url;
    return { url: typeof url === "string" ? url : null, parts: 1 };
  }
  if (t.tracker === "jira") {
    const site = jiraSite(t);
    const jira = JiraSession.open();
    const parts = splitAt(body, JIRA_COMMENT_LIMIT);
    let id: unknown;
    for (const part of parts) {
      const res = await jira.call(JIRA_TOOLS.comment, {
        cloudId: site,
        issueIdOrKey: t.issue,
        commentBody: part,
      });
      id = asRecord(res).id;
    }
    const base = `${site}/browse/${t.issue}`;
    return {
      url: id === undefined ? base : `${base}?focusedCommentId=${String(id)}`,
      parts: parts.length,
    };
  }
  throw new TrackerError("not-found", "issue tracker none");
}

/** The issue's latest `n` comments (body + url), newest last. */
export async function recentComments(
  t: TrackerTarget,
  n: number,
): Promise<Array<{ body: string; url: string | null }>> {
  if (t.issue === null) return [];
  if (t.tracker === "github") {
    const [owner, name] = t.ownerRepo.split("/");
    const out = gh(t, [
      "api",
      "graphql",
      "-f",
      `query=query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){issue(number:$n){comments(last:${n}){nodes{body url}}}}}`,
      "-F",
      `o=${owner ?? ""}`,
      "-F",
      `r=${name ?? ""}`,
      "-F",
      `n=${t.issue}`,
    ]);
    const parsed = parseJson(out);
    const nodes = asRecord(
      asRecord(asRecord(asRecord(asRecord(parsed.ok ? parsed.value : null).data).repository).issue)
        .comments,
    ).nodes;
    return (Array.isArray(nodes) ? nodes : []).map((c) => {
      const r = asRecord(c);
      return { body: String(r.body ?? ""), url: typeof r.url === "string" ? r.url : null };
    });
  }
  const issue = await fetchIssue(t);
  return issue.comments.slice(-n).map((c) => ({ body: c.body, url: null }));
}

export interface FetchedIssue {
  title: string;
  url: string;
  state: string;
  labels: string[];
  /** The description, raw. */
  body: string;
  /** In the order the tracker returned them; callers sort. */
  comments: Array<{ body: string; createdAt?: string }>;
}

const str = (v: unknown): string => (typeof v === "string" ? v : "");

// ADF nodes whose children are inline text; every other node's children are blocks, one per line.
const ADF_INLINE = new Set(["paragraph", "heading", "codeBlock", "mediaSingle"]);

/** An Atlassian Document Format node as text: headings as `#` lines, blocks one per line. */
function adfText(node: unknown): string {
  if (typeof node === "string") return node;
  const n = asRecord(node);
  if (n.type === "text") return str(n.text);
  if (n.type === "hardBreak") return "\n";
  const children = Array.isArray(n.content) ? n.content.map(adfText) : [];
  if (!ADF_INLINE.has(str(n.type))) return children.join("\n");
  const text = children.join("");
  if (n.type !== "heading") return text;
  const level = Math.min(6, Math.max(1, Number(asRecord(n.attrs).level) || 1));
  return `${"#".repeat(level)} ${text}`;
}

/** A tracker text field as a string: a string verbatim, a document node (ADF) as its text. */
const textOf = (v: unknown): string =>
  typeof v === "string" ? v : v === null || v === undefined ? "" : adfText(v);

const commentOf = (raw: unknown, at: string) => {
  const r = asRecord(raw);
  const created = r[at];
  return {
    body: textOf(r.body),
    ...(typeof created === "string" ? { createdAt: created } : {}),
  };
};

/** The issue's facts, description and every comment. Throws `TrackerError` on failure. */
export async function fetchIssue(t: TrackerTarget): Promise<FetchedIssue> {
  if (t.issue === null) throw new TrackerError("not-found", "no issue");
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
      labels: (Array.isArray(issue.labels) ? issue.labels : []).map((l) =>
        typeof l === "string" ? l : str(asRecord(l).name),
      ),
      body: str(issue.body),
      comments,
    };
  }
  if (t.tracker === "linear") {
    const page = "nodes { body createdAt } pageInfo { hasNextPage endCursor }";
    const data = await linearGql(
      `query($id: String!) { issue(id: $id) { identifier title url description state { name } labels { nodes { name } } comments(first: 250) { ${page} } } }`,
      { id: t.issue },
    );
    const issue = asRecord(data.issue);
    if (!data.issue) throw new TrackerError("not-found", `linear: ${t.issue} not found`);
    const nodes = (o: unknown) => {
      const n = asRecord(o).nodes;
      return Array.isArray(n) ? n : [];
    };
    const comments = nodes(issue.comments).map((c) => commentOf(c, "createdAt"));
    for (let info = asRecord(asRecord(issue.comments).pageInfo); info.hasNextPage === true;) {
      const next = await linearGql(
        `query($id: String!, $after: String!) { issue(id: $id) { comments(first: 250, after: $after) { ${page} } } }`,
        { id: t.issue, after: str(info.endCursor) },
      );
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
    const raw = asRecord(
      await jira.call(JIRA_TOOLS.getIssue, {
        cloudId: site,
        issueIdOrKey: t.issue,
        view: "evidence",
      }),
    );
    const fields = asRecord(raw.fields);
    const description = fields.description;
    const comments: FetchedIssue["comments"] = [];
    for (let startAt = 0; ;) {
      const page = asRecord(
        await jira.call(JIRA_TOOLS.read, {
          cloudId: site,
          name: JIRA_TOOLS.comments,
          inputs: { issueIdOrKey: t.issue, maxResults: 100, startAt },
        }),
      );
      const list = Array.isArray(page.comments) ? page.comments : [];
      if (page.appliedContentFormat === "html") {
        // One comment Jira cannot express as markdown turns its whole page HTML; read
        // alone, every other comment on it comes back as markdown.
        for (const [i, c] of list.entries()) {
          const one = asRecord(
            await jira.call(JIRA_TOOLS.read, {
              cloudId: site,
              name: JIRA_TOOLS.comments,
              inputs: { issueIdOrKey: t.issue, maxResults: 1, startAt: startAt + i },
            }),
          );
          const alone = Array.isArray(one.comments) ? one.comments[0] : undefined;
          comments.push(commentOf(alone ?? c, "created"));
        }
      } else comments.push(...list.map((c) => commentOf(c, "created")));
      if (page.isLast !== false || list.length === 0) break;
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
export async function readLabels(t: TrackerTarget): Promise<string[]> {
  if (t.issue === null) throw new TrackerError("not-found", "no issue");
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
    const data = await linearGql(
      "query($id: String!) { issue(id: $id) { labels { nodes { name } } } }",
      {
        id: t.issue,
      },
    );
    if (!data.issue) throw new TrackerError("not-found", `linear: ${t.issue} not found`);
    const nodes = asRecord(asRecord(data.issue).labels).nodes;
    return (Array.isArray(nodes) ? nodes : []).map((n) => str(asRecord(n).name));
  }
  if (t.tracker === "jira") {
    const raw = asRecord(
      await JiraSession.open().call(JIRA_TOOLS.getIssue, {
        cloudId: jiraSite(t),
        issueIdOrKey: t.issue,
        view: "evidence",
      }),
    );
    const labels = asRecord(raw.fields).labels;
    return (Array.isArray(labels) ? labels : []).map((l) => String(l));
  }
  throw new TrackerError("not-found", "issue tracker none");
}

export interface LabelWrite {
  add: string[];
  remove: string[];
  /** The full set after the write (Jira replaces the whole set). */
  labels: string[];
  /** Linear / Jira state name to move to, or null. */
  state: string | null;
}

/**
 * Write a label transition (and, on Linear / Jira, the state). Labels land before
 * the state: a state name the team or project lacks throws after them, with the
 * labels written. Throws `TrackerError` on failure.
 */
export async function writeLabels(t: TrackerTarget, w: LabelWrite): Promise<void> {
  if (t.issue === null) throw new TrackerError("not-found", "no issue");
  if (t.tracker === "github") {
    const base = `repos/${t.ownerRepo}/issues/${t.issue}/labels`;
    if (w.add.length > 0)
      gh(t, ["api", base, "--method", "POST", "--input", "-"], JSON.stringify({ labels: w.add }));
    for (const l of w.remove)
      gh(t, ["api", `${base}/${encodeURIComponent(l)}`, "--method", "DELETE"]);
    return;
  }
  if (t.tracker === "linear") {
    const data = await linearGql(
      "query($id: String!, $names: [String!]!) { issue(id: $id) { id team { id states { nodes { id name } } } } issueLabels(first: 250, filter: { name: { in: $names } }) { nodes { id name team { id } } } }",
      { id: t.issue, names: [...w.add, ...w.remove] },
    );
    const issue = asRecord(data.issue);
    if (!data.issue) throw new TrackerError("not-found", `linear: ${t.issue} not found`);
    const team = asRecord(issue.team);
    const teamId = str(team.id);
    const known = (
      Array.isArray(asRecord(data.issueLabels).nodes)
        ? (asRecord(data.issueLabels).nodes as unknown[])
        : []
    )
      .map((n) => asRecord(n))
      // A team's own label wins over a workspace label of the same name.
      .filter((n) => n.team === null || n.team === undefined || str(asRecord(n.team).id) === teamId)
      .sort((a, b) => Number(Boolean(b.team)) - Number(Boolean(a.team)));
    const idOf = (name: string) => known.find((n) => n.name === name)?.id as string | undefined;
    const added: string[] = [];
    for (const name of w.add) {
      const id = idOf(name);
      if (id) {
        added.push(id);
        continue;
      }
      const created = asRecord(
        (
          await linearGql(
            "mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { success issueLabel { id } } }",
            { input: { name, teamId } },
          )
        ).issueLabelCreate,
      );
      added.push(str(asRecord(created.issueLabel).id));
    }
    const removed = w.remove.map(idOf).filter((id): id is string => Boolean(id));
    if (added.length + removed.length > 0) {
      await linearGql(
        "mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }",
        { id: str(issue.id) || t.issue, input: { addedLabelIds: added, removedLabelIds: removed } },
      );
    }
    if (w.state !== null) {
      const states = asRecord(team.states).nodes;
      const state = (Array.isArray(states) ? states : [])
        .map((s) => asRecord(s))
        .find((s) => s.name === w.state);
      if (!state) throw new TrackerError("not-found", `linear: no state "${w.state}"`);
      await linearGql(
        "mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }",
        { id: str(issue.id) || t.issue, input: { stateId: str(state.id) } },
      );
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
      const listed = asRecord(
        await jira.call(JIRA_TOOLS.read, {
          cloudId: site,
          name: JIRA_TOOLS.transitions,
          inputs: { issueIdOrKey: t.issue },
        }),
      );
      const all = Array.isArray(listed.transitions) ? listed.transitions : [];
      const hit = all.map((x) => asRecord(x)).find((x) => asRecord(x.to).name === w.state);
      if (!hit) throw new TrackerError("not-found", `jira: no transition to "${w.state}"`);
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
export function parseBlockedBy(body: string): string[] {
  const lines = body.split("\n");
  const start = lines.findIndex((l) => BLOCKED_START.test(l));
  if (start === -1) return [];
  const out: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (BLOCKED_END.test(line)) break;
    const m = /^[ \t]*[-*][ \t]+#([0-9]+)\b/.exec(line);
    if (m) out.push(m[1]!);
  }
  return out;
}

export interface Blocker {
  /** `#N` on GitHub, the key on Linear / Jira. */
  id: string;
  state: string;
  /** Not closed / done / canceled. */
  open: boolean;
}

/**
 * The issues blocking the target: GitHub from the body's blocked-by block, Linear
 * from `blocks` relations pointing at it, Jira from `is blocked by` links. Throws
 * `TrackerError` on failure.
 */
export async function readBlockers(t: TrackerTarget): Promise<Blocker[]> {
  if (t.issue === null) throw new TrackerError("not-found", "no issue");
  if (t.tracker === "github") {
    const parsed = parseJson(gh(t, ["api", `repos/${t.ownerRepo}/issues/${t.issue}`]));
    const numbers = parseBlockedBy(str(asRecord(parsed.ok ? parsed.value : null).body));
    return numbers.map((n) => {
      const state = gh(t, ["api", `repos/${t.ownerRepo}/issues/${n}`, "--jq", ".state"]).trim();
      return { id: `#${n}`, state, open: state !== "closed" };
    });
  }
  if (t.tracker === "linear") {
    const data = await linearGql(
      "query($id: String!) { issue(id: $id) { inverseRelations(first: 100) { nodes { type issue { identifier state { name type } } } } } }",
      { id: t.issue },
    );
    if (!data.issue) throw new TrackerError("not-found", `linear: ${t.issue} not found`);
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
    const res = asRecord(
      await JiraSession.open().call(JIRA_TOOLS.search, {
        cloudId: jiraSite(t),
        jql: `issue in linkedIssues('${t.issue}', 'is blocked by')`,
        fields: ["status"],
        maxResults: 100,
      }),
    );
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

/** A Projects v2 board from `bkit.tracker.github.project`. */
export interface Board {
  owner: string;
  number: number;
  /** The Status option name to set. */
  status: string;
}

/**
 * Put the issue on the Projects v2 board and set its Status. Adding an item that is
 * already on the board returns that item, so a repeat is harmless. Throws
 * `TrackerError` on failure (a token without `project` scope fails as `scope`).
 */
export async function moveOnBoard(t: TrackerTarget, b: Board): Promise<void> {
  if (t.issue === null) throw new TrackerError("not-found", "no issue");
  const [owner, name] = t.ownerRepo.split("/");
  const field =
    'projectV2(number: $p) { id field(name: "Status") { ... on ProjectV2SingleSelectField { id options { id name } } } }';
  const looked = parseJson(
    gh(t, [
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
    ]),
  );
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
  const added = parseJson(
    gh(t, [
      "api",
      "graphql",
      "-f",
      "query=mutation($p: ID!, $c: ID!) { addProjectV2ItemById(input: { projectId: $p, contentId: $c }) { item { id } } }",
      "-F",
      `p=${str(project.id)}`,
      "-F",
      `c=${issueId}`,
    ]),
  );
  const itemId = str(
    asRecord(
      asRecord(asRecord(asRecord(added.ok ? added.value : null).data).addProjectV2ItemById).item,
    ).id,
  );
  if (!itemId) throw new TrackerError("http-200", "github: addProjectV2ItemById returned no item");
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

// ---------------------------------------------------------------------------
// the `tracker` field verbs print
// ---------------------------------------------------------------------------

export type TrackerOutcome =
  | { done: true; action: string; url: string | null; deduped?: true; warning?: string }
  | { done: false; action: string; reason: FailureReason }
  | { skipped: "no-issue" | "tracker-none" };

/** The skip a target calls for, or null when the action can go ahead. */
export function skipOf(t: TrackerTarget): TrackerOutcome | null {
  if (t.tracker === "none") return { skipped: "tracker-none" };
  if (t.issue === null) return { skipped: "no-issue" };
  return null;
}

export interface OnceOptions {
  /** status.jsonl to record and check the engine-action row in; with `key`. */
  file?: string;
  key?: string;
  /**
   * Instead of a row: a comment among the issue's last `recent` carrying the same
   * marker hash counts as done — trackers rewrite markdown and Jira adds part lines,
   * so the text never compares. A body without a stamped marker compares as text.
   */
  recent?: number;
  /** Where the redacted failure detail goes (stderr). */
  log: (line: string) => void;
}

/** The latest of `recent` that is `body` posted before: same marker hash, else same text. */
function samePosted<T extends { body: string }>(recent: T[], body: string): T | undefined {
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
export async function postCommentOnce(
  t: TrackerTarget,
  body: string,
  o: OnceOptions,
): Promise<TrackerOutcome> {
  const skip = skipOf(t);
  if (skip) return skip;
  const action = "comment";
  const hash = actionHash(body);
  let posted: PostedComment;
  try {
    if (o.file && o.key) {
      const prior = alreadyDone(o.file, o.key, hash);
      if (prior) return { done: true, action, url: prior.ref, deduped: true };
    }
    if (o.recent) {
      const same = samePosted(await recentComments(t, o.recent), body);
      if (same) return { done: true, action, url: same.url, deduped: true };
    }
    posted = await postComment(t, body);
  } catch (err) {
    const reason = classifyFailure(err);
    o.log(redact(`tracker ${action} failed (${reason}): ${(err as Error).message ?? String(err)}`));
    return { done: false, action, reason };
  }
  if (o.file && o.key) {
    try {
      recordAction(o.file, { action, key: o.key, hash, ref: posted.url });
    } catch (err) {
      const warning = redact(
        `posted, but the engine-action row was not written to ${o.file}: ${(err as Error).message ?? String(err)}`,
      );
      o.log(warning);
      return { done: true, action, url: posted.url, warning };
    }
  }
  return { done: true, action, url: posted.url };
}

/** Run one tracker write as `action`: `done: true`, or `done: false` with the reason (logged, redacted). */
export async function attempt(
  action: string,
  log: (line: string) => void,
  fn: () => Promise<void>,
): Promise<TrackerOutcome> {
  try {
    await fn();
    return { done: true, action, url: null };
  } catch (err) {
    const reason = classifyFailure(err);
    log(redact(`tracker ${action} failed (${reason}): ${(err as Error).message ?? String(err)}`));
    return { done: false, action, reason };
  }
}

// ---------------------------------------------------------------------------
// verb glue
// ---------------------------------------------------------------------------

/** `--post` on a verb that builds a comment. */
export const POST_FLAG: FlagSpec = {
  name: "post",
  type: "boolean",
  help: "post the comment to the run's issue through the engine; prints `tracker`",
};

/** The `tracker` output key's meaning, shared by every `--post` verb. */
export const TRACKER_OUTPUT =
  "with --post: {done: true, action, url, deduped?, warning?} | {done: false, action, reason} (post `commentFile` verbatim via the tracker MCP) | {skipped: no-issue | tracker-none}; absent without --post";

/** The `commentFile` output key's meaning, shared by every verb that prints a comment. */
export const COMMENT_FILE_OUTPUT =
  "absolute path of a file holding `comment` byte-for-byte (the MCP fallback reads it); null when comment is null";

/** How many of the issue's latest comments a re-run checks for the same marker hash. */
export const RECENT_COMMENTS = 5;

/** `comment` written to its body file, or null for no comment. */
export const commentFileOf = (cwd: string, comment: string | null): string | null =>
  comment === null ? null : writeBodyFile(cwd, "comment", comment);

/**
 * The engine-action key of a comment in `file`'s current run of `workflow` (the
 * latest run's workflow when omitted); undefined with no status.jsonl or no run.
 */
export function runActionKey(
  file: string | undefined,
  workflow: string | undefined,
  ...parts: Array<string | number | undefined | null>
): string | undefined {
  return commentKey(file, workflow, runNumber, parts);
}

/**
 * The same key for the latest run of `workflow` once it has ended (a failure
 * comment written after the workflow-failed row): that run's number, not the next.
 */
export function endedRunActionKey(
  file: string | undefined,
  workflow: string,
  ...parts: Array<string | number | undefined | null>
): string | undefined {
  const latest = (runs: WorkflowRun[], name: string) =>
    runs.filter((r) => r.workflow === name).length;
  return commentKey(file, workflow, latest, parts);
}

function commentKey(
  file: string | undefined,
  workflow: string | undefined,
  numberOf: (runs: WorkflowRun[], name: string) => number,
  parts: Array<string | number | undefined | null>,
): string | undefined {
  if (file === undefined || !fs.existsSync(file)) return undefined;
  const runs = readRunsLenient(file);
  const name = workflow ?? runs.at(-1)?.workflow;
  if (name === undefined) return undefined;
  const n = numberOf(runs, name);
  return n === 0 ? undefined : actionKey(name, n, ...parts, "comment");
}

/**
 * Post `body` for a verb's `--post`: once per key in `file` when both are given,
 * else once per marker hash among the issue's latest comments.
 */
export function postForVerb(
  ctx: RunContext,
  body: string,
  o: { fid?: string; issue?: string; file?: string; key?: string },
): Promise<TrackerOutcome> {
  const t = trackerTarget(ctx.cwd, { fid: o.fid, issue: o.issue });
  return postCommentOnce(t, body, {
    file: o.file,
    key: o.key,
    recent: o.file && o.key ? undefined : RECENT_COMMENTS,
    log: (line) => ctx.log(line),
  });
}
