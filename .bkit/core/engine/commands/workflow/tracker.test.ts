import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { alreadyDone } from "../../ledgers/status";
import {
  JIRA_COMMENT_LIMIT,
  JIRA_TOOLS,
  TrackerError,
  markerHashOf,
  stampMarker,
  writeBodyFile,
  classifyFailure,
  classifyStatus,
  fetchIssue,
  moveOnBoard,
  postComment,
  postCommentOnce,
  readBlockers,
  readLabels,
  splitAt,
  trackerTarget,
  writeLabels,
} from "./tracker";

const dirs: string[] = [];
const ORIGINAL_PATH = process.env.PATH;
const SECRETS = ["BKIT_GH_TOKEN", "BKIT_LINEAR_API_KEY", "BKIT_JIRA_API_KEY"] as const;
const saved: Record<string, string | undefined> = {};
let fake: string;

const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

// A `gh` stand-in: every call is logged to $FAKE_GH_DIR/calls (args) and its stdin to
// stdin-<n>; `api <endpoint>` prints resp-<endpoint with / ? = & as _>; `exit` makes
// every call fail with the code inside and the text of `stderr`; GH_TOKEN is logged.
const FAKE_GH = `#!/bin/sh
d="$FAKE_GH_DIR"
n=$(($(cat "$d/n" 2>/dev/null || echo 0) + 1)); echo "$n" > "$d/n"
printf '%s\\n' "$*" >> "$d/calls"
printf '%s\\n' "\${GH_TOKEN:-}" >> "$d/tokens"
cat > "$d/stdin-$n"
if [ -f "$d/exit" ]; then cat "$d/stderr" >&2; exit "$(cat "$d/exit")"; fi
ep=""
for a in "$@"; do case "$a" in repos/*|graphql) ep="$a"; break ;; esac; done
f="$d/resp-$(printf '%s' "$ep" | tr '/?=&' '____')"
[ -f "$f" ] && cat "$f"
exit 0
`;

const gh = {
  resp: (endpoint: string, body: string) =>
    fs.writeFileSync(path.join(fake, `resp-${endpoint.replace(/[/?=&]/g, "_")}`), body),
  fail: (code: number, stderr: string) => {
    fs.writeFileSync(path.join(fake, "exit"), String(code));
    fs.writeFileSync(path.join(fake, "stderr"), stderr);
  },
  calls: () =>
    fs.existsSync(path.join(fake, "calls"))
      ? fs.readFileSync(path.join(fake, "calls"), "utf-8").trim().split("\n")
      : [],
  stdin: (n: number) => fs.readFileSync(path.join(fake, `stdin-${n}`), "utf-8"),
  tokens: () => fs.readFileSync(path.join(fake, "tokens"), "utf-8").trim().split("\n"),
};

beforeEach(() => {
  fake = tmp("bkit-tracker-gh-");
  fs.mkdirSync(path.join(fake, "bin"));
  fs.writeFileSync(path.join(fake, "bin", "gh"), FAKE_GH, { mode: 0o755 });
  process.env.PATH = `${path.join(fake, "bin")}:${ORIGINAL_PATH ?? ""}`;
  process.env.FAKE_GH_DIR = fake;
  for (const k of SECRETS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  process.env.PATH = ORIGINAL_PATH;
  delete process.env.FAKE_GH_DIR;
  for (const k of SECRETS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
  vi.unstubAllGlobals();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

function repo(bkit: Record<string, unknown>) {
  const cwd = tmp("bkit-tracker-");
  spawnSync("git", ["init", "-q", "-b", "dev"], { cwd });
  spawnSync("git", ["remote", "add", "origin", "https://github.com/o/r.git"], { cwd });
  fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ bkit }));
  return cwd;
}

const github = () => repo({ tracker: { default: "github" } });
const linear = () => repo({ tracker: { default: "linear", linear: { team: "ENG" } } });
const jira = () =>
  repo({
    tracker: { default: "jira", jira: { site: "https://acme.atlassian.net", project: "PROJ" } },
  });

/** A fetch stub answering each call with the next queued response; records every request. */
function stubFetch(...responses: Array<Response | Error>) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const fn = vi.fn(async (url: string | URL, init: RequestInit = {}) => {
    calls.push({ url: String(url), init });
    const next = responses.shift();
    if (next === undefined) throw new Error("unexpected fetch");
    if (next instanceof Error) throw next;
    return next;
  });
  vi.stubGlobal("fetch", fn);
  return calls;
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    ...init,
  });

const sse = (body: unknown, headers: Record<string, string> = {}) =>
  new Response(`event: message\ndata: ${JSON.stringify(body)}\n\n`, {
    status: 200,
    headers: { "content-type": "text/event-stream", ...headers },
  });

const headerOf = (init: RequestInit, name: string) =>
  new Headers(init.headers as HeadersInit).get(name);

const bodyOf = (init: RequestInit) => JSON.parse(String(init.body)) as Record<string, any>;

/** Jira MCP: initialize (session id), the initialized notification, then the tool results. */
function jiraMcp(...results: Array<unknown>) {
  return stubFetch(
    sse(
      { jsonrpc: "2.0", id: 1, result: { protocolVersion: "2025-06-18", capabilities: {} } },
      { "mcp-session-id": "sess-1" },
    ),
    new Response(null, { status: 202 }),
    ...results.map((r, i) =>
      r instanceof Response
        ? r
        : sse({
            jsonrpc: "2.0",
            id: i + 2,
            result: { content: [{ type: "text", text: JSON.stringify(r) }] },
          }),
    ),
  );
}

// ---------------------------------------------------------------------------
// target
// ---------------------------------------------------------------------------

describe("trackerTarget", () => {
  it("github: the issue from the FID, owner/repo from origin", () => {
    const t = trackerTarget(github(), { fid: "12-thing" });
    expect(t).toMatchObject({ tracker: "github", issue: "12", ownerRepo: "o/r" });
  });

  it("linear and jira: the uppercased key from the FID, plus team / site", () => {
    expect(trackerTarget(linear(), { fid: "eng-4-x" })).toMatchObject({
      tracker: "linear",
      issue: "ENG-4",
      linearTeam: "ENG",
    });
    expect(trackerTarget(jira(), { fid: "proj-9-x" })).toMatchObject({
      tracker: "jira",
      issue: "PROJ-9",
      jiraSite: "https://acme.atlassian.net",
    });
  });

  it("an explicit --issue wins (# stripped); an issue-less FID gives no issue", () => {
    expect(trackerTarget(github(), { fid: "12-x", issue: "#40" }).issue).toBe("40");
    expect(trackerTarget(github(), { fid: "dev-ci-failures" }).issue).toBeNull();
    expect(trackerTarget(github(), { issue: "" }).issue).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// split + classification
// ---------------------------------------------------------------------------

describe("splitAt", () => {
  it("keeps a body at the limit whole", () => {
    const body = `###### bkit:generated\n${"a".repeat(JIRA_COMMENT_LIMIT - 22)}`;
    expect(body.length).toBe(JIRA_COMMENT_LIMIT);
    expect(splitAt(body, JIRA_COMMENT_LIMIT)).toEqual([body]);
  });

  it("splits one over the limit at line breaks; every part generated-marked, labelled, under the limit", () => {
    const lines = Array.from({ length: 40 }, (_, i) => `line ${i} ${"x".repeat(1000)}`);
    const body = ["###### bkit:generated", "### Step 6 — Summary", ...lines].join("\n");
    const parts = splitAt(body, JIRA_COMMENT_LIMIT);
    expect(parts.length).toBe(2);
    parts.forEach((p, i) => {
      expect(p.length).toBeLessThanOrEqual(JIRA_COMMENT_LIMIT);
      expect(p.split("\n")[0]).toBe("###### bkit:generated");
      expect(p.split("\n")[1]).toBe(`_(part ${i + 1}/2)_`);
    });
    const rejoined = parts.map((p) => p.split("\n").slice(2).join("\n")).join("\n");
    expect(rejoined).toBe(body.split("\n").slice(1).join("\n"));
  });

  it("hard-splits a single line longer than the limit", () => {
    const body = `###### bkit:generated\n${"y".repeat(70_000)}`;
    const parts = splitAt(body, JIRA_COMMENT_LIMIT);
    expect(parts.length).toBe(3);
    for (const p of parts) expect(p.length).toBeLessThanOrEqual(JIRA_COMMENT_LIMIT);
  });
});

describe("classification", () => {
  it.each([
    [401, "", "auth"],
    [403, "Resource not accessible by personal access token", "scope"],
    [403, "API rate limit exceeded", "rate-limit"],
    [404, "", "not-found"],
    [429, "", "rate-limit"],
    [500, "", "http-500"],
  ])("HTTP %i %s -> %s", (status, text, reason) => {
    expect(classifyStatus(status, text)).toBe(reason);
  });

  it("network errors: DNS failure, refused connection, timeout", () => {
    const dns = Object.assign(new TypeError("fetch failed"), {
      cause: Object.assign(new Error("getaddrinfo ENOTFOUND api.linear.app"), {
        code: "ENOTFOUND",
      }),
    });
    expect(classifyFailure(dns)).toBe("network");
    expect(classifyFailure(Object.assign(new Error("t"), { name: "TimeoutError" }))).toBe(
      "network",
    );
    expect(classifyFailure(new TrackerError("scope", "x"))).toBe("scope");
  });
});

// ---------------------------------------------------------------------------
// github
// ---------------------------------------------------------------------------

describe("github client", () => {
  it("posts the body as JSON on stdin and returns the comment URL", async () => {
    gh.resp("repos/o/r/issues/12/comments", JSON.stringify({ html_url: "https://gh/c/1" }));
    const t = trackerTarget(github(), { fid: "12-x" });
    const r = await postComment(t, "###### bkit:generated\nhello `x`");
    expect(r.url).toBe("https://gh/c/1");
    expect(gh.calls()[0]).toContain("repos/o/r/issues/12/comments");
    expect(gh.calls()[0]).toContain("--method POST");
    expect(JSON.parse(gh.stdin(1))).toEqual({ body: "###### bkit:generated\nhello `x`" });
  });

  it("hands gh BKIT_GH_TOKEN as GH_TOKEN when it is set", async () => {
    process.env.BKIT_GH_TOKEN = "ghp_secret";
    gh.resp("repos/o/r/issues/12/comments", JSON.stringify({ html_url: "u" }));
    await postComment(trackerTarget(github(), { fid: "12-x" }), "b");
    expect(gh.tokens()).toEqual(["ghp_secret"]);
  });

  it.each([
    [1, "gh: Not Found (HTTP 404)", "not-found"],
    [1, "gh: Bad credentials (HTTP 401)", "auth"],
    [1, "error connecting to api.github.com", "network"],
    [4, "To get started with GitHub CLI, please run:  gh auth login", "auth"],
  ])("gh exit %i (%s) -> %s", async (code, stderr, reason) => {
    gh.fail(code, stderr);
    const err = await postComment(trackerTarget(github(), { fid: "12-x" }), "b").catch(
      (e: unknown) => e,
    );
    expect(err).toBeInstanceOf(TrackerError);
    expect((err as TrackerError).reason).toBe(reason);
  });

  it("fetches the issue and its comments as GitHub returns them", async () => {
    gh.resp(
      "repos/o/r/issues/12",
      JSON.stringify({
        title: "Thing",
        html_url: "https://github.com/o/r/issues/12",
        state: "open",
        labels: [{ name: "bkit:plan" }, { name: "enhancement" }],
        body: "<!-- raw -->\nBody",
      }),
    );
    gh.resp(
      "repos/o/r/issues/12/comments?per_page=100",
      [
        JSON.stringify({ body: "second", created_at: "2026-10-02T00:00:00Z" }),
        JSON.stringify({ body: "first", created_at: "2026-10-01T00:00:00Z" }),
      ].join("\n"),
    );
    const issue = await fetchIssue(trackerTarget(github(), { fid: "12-x" }));
    expect(issue).toMatchObject({
      title: "Thing",
      url: "https://github.com/o/r/issues/12",
      state: "open",
      labels: ["bkit:plan", "enhancement"],
      body: "<!-- raw -->\nBody",
    });
    expect(issue.comments.map((c) => c.body)).toEqual(["second", "first"]);
  });
});

// ---------------------------------------------------------------------------
// linear
// ---------------------------------------------------------------------------

describe("linear client", () => {
  it("posts through GraphQL commentCreate with the API key as Authorization", async () => {
    process.env.BKIT_LINEAR_API_KEY = "lin_api_secret";
    const calls = stubFetch(
      json({ data: { commentCreate: { success: true, comment: { url: "https://linear/c" } } } }),
    );
    const r = await postComment(trackerTarget(linear(), { fid: "eng-4-x" }), "hi");
    expect(r.url).toBe("https://linear/c");
    expect(calls[0]!.url).toBe("https://api.linear.app/graphql");
    expect(headerOf(calls[0]!.init, "authorization")).toBe("lin_api_secret");
    const sent = bodyOf(calls[0]!.init);
    expect(sent.query).toContain("commentCreate");
    expect(sent.variables).toEqual({ input: { issueId: "ENG-4", body: "hi" } });
  });

  it("no key -> auth, and fetch is never called", async () => {
    const calls = stubFetch();
    const err = await postComment(trackerTarget(linear(), { fid: "eng-4-x" }), "hi").catch(
      (e: unknown) => e,
    );
    expect((err as TrackerError).reason).toBe("auth");
    expect(calls).toEqual([]);
  });

  it("GraphQL errors map by code; DNS failure is network", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    stubFetch(json({ errors: [{ message: "Rate limited", extensions: { code: "RATELIMITED" } }] }));
    const t = trackerTarget(linear(), { fid: "eng-4-x" });
    expect(((await postComment(t, "x").catch((e: unknown) => e)) as TrackerError).reason).toBe(
      "rate-limit",
    );
    stubFetch(
      Object.assign(new TypeError("fetch failed"), {
        cause: Object.assign(new Error("ENOTFOUND"), { code: "ENOTFOUND" }),
      }),
    );
    const err = await postComment(t, "x").catch((e: unknown) => e);
    expect(classifyFailure(err)).toBe("network");
  });

  it("fetches title, url, state, labels, description and comments", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    stubFetch(
      json({
        data: {
          issue: {
            identifier: "ENG-4",
            title: "T",
            url: "https://linear.app/x/issue/ENG-4",
            description: "D",
            state: { name: "Todo" },
            labels: { nodes: [{ name: "Bug" }] },
            comments: {
              nodes: [
                { body: "b", createdAt: "2026-10-02T00:00:00Z" },
                { body: "a", createdAt: "2026-10-01T00:00:00Z" },
              ],
            },
          },
        },
      }),
    );
    const issue = await fetchIssue(trackerTarget(linear(), { fid: "eng-4-x" }));
    expect(issue).toMatchObject({
      title: "T",
      url: "https://linear.app/x/issue/ENG-4",
      state: "Todo",
      labels: ["Bug"],
      body: "D",
    });
    expect(issue.comments.map((c) => c.body)).toEqual(["b", "a"]);
  });
});

// ---------------------------------------------------------------------------
// jira
// ---------------------------------------------------------------------------

describe("jira client (MCP over HTTP)", () => {
  it("initialize -> session id -> tools/call addOrEditJiraIssueComment, Bearer key, non-default UA", async () => {
    process.env.BKIT_JIRA_API_KEY = "atl_secret";
    const calls = jiraMcp({ id: "10001" });
    const r = await postComment(trackerTarget(jira(), { fid: "proj-9-x" }), "body");
    expect(calls.map((c) => bodyOf(c.init).method)).toEqual([
      "initialize",
      "notifications/initialized",
      "tools/call",
    ]);
    for (const c of calls) {
      expect(c.url).toBe("https://mcp.atlassian.com/v2/mcp");
      expect(headerOf(c.init, "authorization")).toBe("Bearer atl_secret");
      expect(headerOf(c.init, "user-agent")).toMatch(/^bkit/);
    }
    expect(headerOf(calls[0]!.init, "mcp-session-id")).toBeNull();
    expect(headerOf(calls[2]!.init, "mcp-session-id")).toBe("sess-1");
    expect(bodyOf(calls[2]!.init).params).toEqual({
      name: "addOrEditJiraIssueComment",
      arguments: {
        cloudId: "https://acme.atlassian.net",
        issueIdOrKey: "PROJ-9",
        commentBody: "body",
      },
    });
    expect(r.url).toBe("https://acme.atlassian.net/browse/PROJ-9?focusedCommentId=10001");
  });

  it("splits a body over 32,767 characters into consecutive comments", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const body = [
      "###### bkit:generated",
      ...Array.from({ length: 40 }, () => "z".repeat(1000)),
    ].join("\n");
    const calls = jiraMcp({ id: "1" }, { id: "2" });
    const r = await postComment(trackerTarget(jira(), { fid: "proj-9-x" }), body);
    expect(r.parts).toBe(2);
    const sent = calls.slice(2).map((c) => bodyOf(c.init).params.arguments.commentBody as string);
    expect(sent.map((s) => s.split("\n")[1])).toEqual(["_(part 1/2)_", "_(part 2/2)_"]);
  });

  it("a tool error maps to a reason; HTTP 401 on initialize is auth", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    jiraMcp(
      sse({
        jsonrpc: "2.0",
        id: 2,
        result: { isError: true, content: [{ type: "text", text: "Issue does not exist" }] },
      }),
    );
    const t = trackerTarget(jira(), { fid: "proj-9-x" });
    expect(((await postComment(t, "b").catch((e: unknown) => e)) as TrackerError).reason).toBe(
      "not-found",
    );
    stubFetch(new Response("unauthorized", { status: 401 }));
    expect(((await postComment(t, "b").catch((e: unknown) => e)) as TrackerError).reason).toBe(
      "auth",
    );
  });

  it("fetches through getJiraIssue (evidence view) and pages listJiraIssueComments", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const calls = jiraMcp(
      {
        key: "PROJ-9",
        fields: {
          summary: "S",
          status: { name: "To Do" },
          labels: ["bkit:design"],
          description: "Desc",
        },
      },
      { comments: [{ body: "one", created: "2026-10-01T00:00:00Z" }], isLast: false },
      { comments: [{ body: "two", created: "2026-10-02T00:00:00Z" }], isLast: true },
    );
    const issue = await fetchIssue(trackerTarget(jira(), { fid: "proj-9-x" }));
    expect(issue).toMatchObject({
      title: "S",
      url: "https://acme.atlassian.net/browse/PROJ-9",
      state: "To Do",
      labels: ["bkit:design"],
      body: "Desc",
    });
    expect(issue.comments.map((c) => c.body)).toEqual(["one", "two"]);
    const tools = calls.slice(2).map((c) => bodyOf(c.init).params);
    expect(tools[0]).toMatchObject({ name: "getJiraIssue", arguments: { view: "evidence" } });
    expect(tools[1]).toMatchObject({
      name: "executeRead",
      arguments: { name: "listJiraIssueComments", inputs: { startAt: 0 } },
    });
    expect(tools[2].arguments.inputs.startAt).toBe(1);
  });

  it("pins the Rovo tool names .bkit/trackers.md lists", () => {
    const doc = fs.readFileSync(path.resolve(__dirname, "../../../.bkit/trackers.md"), "utf-8");
    for (const name of Object.values(JIRA_TOOLS)) expect(doc, name).toContain(name);
  });
});

// ---------------------------------------------------------------------------
// postCommentOnce: skips, de-dup, fallback, redaction
// ---------------------------------------------------------------------------

describe("postCommentOnce", () => {
  const log = () => undefined;

  it("skips issue-less runs and tracker none", async () => {
    expect(
      await postCommentOnce(trackerTarget(github(), { fid: "dev-ci-x" }), "b", { log }),
    ).toEqual({ skipped: "no-issue" });
    expect(
      await postCommentOnce(
        trackerTarget(repo({ tracker: { default: "none" } }), { fid: "x" }),
        "b",
        {
          log,
        },
      ),
    ).toEqual({ skipped: "tracker-none" });
    expect(gh.calls()).toEqual([]);
  });

  it("records an engine-action row and skips the same key + body on a re-run", async () => {
    const cwd = github();
    const file = path.join(cwd, "status.jsonl");
    fs.writeFileSync(file, "");
    gh.resp("repos/o/r/issues/12/comments", JSON.stringify({ html_url: "https://gh/c/1" }));
    const t = trackerTarget(cwd, { fid: "12-x" });
    const first = await postCommentOnce(t, "body", { file, key: "k1", log });
    expect(first).toEqual({ done: true, action: "comment", url: "https://gh/c/1" });
    const again = await postCommentOnce(t, "body", { file, key: "k1", log });
    expect(again).toEqual({ done: true, action: "comment", url: "https://gh/c/1", deduped: true });
    expect(gh.calls()).toHaveLength(1);
    const edited = await postCommentOnce(t, "body v2", { file, key: "k1", log });
    expect(edited).toMatchObject({ done: true });
    expect(gh.calls()).toHaveLength(2);
    expect(alreadyDone(file, "k1", "nope")).toBeUndefined();
  });

  it("a recent identical comment counts as done (the final close comment)", async () => {
    gh.resp(
      "graphql",
      JSON.stringify({
        data: {
          repository: {
            issue: { comments: { nodes: [{ body: "older" }, { body: "close body", url: "u" }] } },
          },
        },
      }),
    );
    const r = await postCommentOnce(trackerTarget(github(), { fid: "12-x" }), "close body", {
      recent: 5,
      log,
    });
    expect(r).toEqual({ done: true, action: "comment", url: "u", deduped: true });
    expect(gh.calls().some((c) => c.includes("--method POST"))).toBe(false);
  });

  it("a failed post reports done false with the reason and never leaks a token", async () => {
    process.env.BKIT_GH_TOKEN = "ghp_topsecret";
    gh.fail(1, "gh: Bad credentials (HTTP 401) token ghp_topsecret");
    const lines: string[] = [];
    const r = await postCommentOnce(trackerTarget(github(), { fid: "12-x" }), "b", {
      log: (m) => lines.push(m),
    });
    expect(r).toEqual({ done: false, action: "comment", reason: "auth" });
    expect(JSON.stringify(r)).not.toContain("ghp_topsecret");
    expect(lines.join("\n")).not.toContain("ghp_topsecret");
  });
});

// ---------------------------------------------------------------------------
// labels, state and board
// ---------------------------------------------------------------------------

describe("label writes", () => {
  it("github: reads names; POSTs the added labels as JSON, DELETEs each removed one", async () => {
    gh.resp("repos/o/r/issues/12", JSON.stringify(["bkit:plan", "next:build"]));
    const t = trackerTarget(github(), { fid: "12-x" });
    expect(await readLabels(t)).toEqual(["bkit:plan", "next:build"]);
    await writeLabels(t, {
      add: ["bkit:build"],
      remove: ["bkit:plan", "next:build"],
      labels: ["bkit:build"],
      state: null,
    });
    const calls = gh.calls();
    expect(calls[1]).toBe("api repos/o/r/issues/12/labels --method POST --input -");
    expect(JSON.parse(gh.stdin(2))).toEqual({ labels: ["bkit:build"] });
    expect(calls.slice(2)).toEqual([
      "api repos/o/r/issues/12/labels/bkit%3Aplan --method DELETE",
      "api repos/o/r/issues/12/labels/next%3Abuild --method DELETE",
    ]);
  });

  it("linear: label ids by name (creating a missing one), then the state by name", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const calls = stubFetch(
      json({
        data: {
          issue: {
            id: "uuid-4",
            team: { id: "team-1", states: { nodes: [{ id: "st-2", name: "In Progress" }] } },
          },
          issueLabels: {
            nodes: [
              { id: "lab-old", name: "bkit:plan", team: { id: "team-1" } },
              { id: "lab-other-team", name: "bkit:build", team: { id: "team-9" } },
            ],
          },
        },
      }),
      json({ data: { issueLabelCreate: { success: true, issueLabel: { id: "lab-new" } } } }),
      json({ data: { issueUpdate: { success: true } } }),
      json({ data: { issueUpdate: { success: true } } }),
    );
    await writeLabels(trackerTarget(linear(), { fid: "eng-4-x" }), {
      add: ["bkit:build"],
      remove: ["bkit:plan"],
      labels: ["bkit:build"],
      state: "In Progress",
    });
    expect(bodyOf(calls[1]!.init).variables.input).toEqual({
      name: "bkit:build",
      teamId: "team-1",
    });
    expect(bodyOf(calls[2]!.init).variables).toEqual({
      id: "uuid-4",
      input: { addedLabelIds: ["lab-new"], removedLabelIds: ["lab-old"] },
    });
    expect(bodyOf(calls[3]!.init).variables.input).toEqual({ stateId: "st-2" });
  });

  it("linear: a state the team lacks is not-found, after the labels landed", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const calls = stubFetch(
      json({
        data: {
          issue: { id: "u", team: { id: "t", states: { nodes: [] } } },
          issueLabels: { nodes: [{ id: "l1", name: "bkit:failed", team: null }] },
        },
      }),
      json({ data: { issueUpdate: { success: true } } }),
    );
    const err = await writeLabels(trackerTarget(linear(), { fid: "eng-4-x" }), {
      add: ["bkit:failed"],
      remove: [],
      labels: ["bkit:failed"],
      state: "In Review",
    }).catch((e: unknown) => e);
    expect((err as TrackerError).reason).toBe("not-found");
    expect(calls).toHaveLength(2);
  });

  it("jira: the full label set (keeping labels that are not bkit's), then the matching transition", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const TRANSITIONS = {
      transitions: [
        { id: "11", to: { name: "Done" } },
        { id: "21", to: { name: "In Progress" } },
      ],
    };
    jiraMcp({ fields: { labels: ["customer", "bkit:plan"] } });
    const t = trackerTarget(jira(), { fid: "proj-9-x" });
    expect(await readLabels(t)).toEqual(["customer", "bkit:plan"]);
    const recorded = jiraMcp({}, TRANSITIONS, {});
    await writeLabels(t, {
      add: ["bkit:build"],
      remove: ["bkit:plan"],
      labels: ["customer", "bkit:build"],
      state: "In Progress",
    });
    const writes = recorded.slice(2).map((c) => bodyOf(c.init).params);
    expect(writes).toEqual([
      {
        name: "editJiraIssue",
        arguments: {
          cloudId: "https://acme.atlassian.net",
          issueIdOrKey: "PROJ-9",
          fields: { labels: ["customer", "bkit:build"] },
        },
      },
      {
        name: "executeRead",
        arguments: {
          cloudId: "https://acme.atlassian.net",
          name: "listJiraIssueTransitions",
          inputs: { issueIdOrKey: "PROJ-9" },
        },
      },
      {
        name: "transitionJiraIssue",
        arguments: {
          cloudId: "https://acme.atlassian.net",
          issueIdOrKey: "PROJ-9",
          transitionId: "21",
        },
      },
    ]);
  });
});

describe("board move (Projects v2)", () => {
  const BOARD = { owner: "o", number: 3, status: "In Progress" };
  const ANSWER = {
    data: {
      repository: { issue: { id: "I_12" } },
      repositoryOwner: {
        projectV2: {
          id: "PVT_1",
          field: { id: "F_status", options: [{ id: "opt-2", name: "In Progress" }] },
        },
      },
      addProjectV2ItemById: { item: { id: "PVTI_9" } },
    },
  };

  it("looks up issue, board and Status option, adds the item, sets the option", async () => {
    gh.resp("graphql", JSON.stringify(ANSWER));
    await moveOnBoard(trackerTarget(github(), { fid: "12-x" }), BOARD);
    const calls = gh.calls();
    expect(calls).toHaveLength(3);
    expect(calls[0]).toContain("login=o");
    expect(calls[0]).toContain("p=3");
    expect(calls[1]).toContain("addProjectV2ItemById");
    expect(calls[1]).toContain("c=I_12");
    expect(calls[2]).toContain("updateProjectV2ItemFieldValue");
    expect(calls[2]).toContain("i=PVTI_9");
    expect(calls[2]).toContain("o=opt-2");
  });

  it("a board the token cannot see is scope", async () => {
    gh.resp(
      "graphql",
      JSON.stringify({ data: { repository: { issue: { id: "I" } }, repositoryOwner: null } }),
    );
    const err = await moveOnBoard(trackerTarget(github(), { fid: "12-x" }), BOARD).catch(
      (e: unknown) => e,
    );
    expect((err as TrackerError).reason).toBe("scope");
  });

  it("an HTTP 403 from gh is scope", async () => {
    gh.fail(1, "gh: Resource not accessible by personal access token (HTTP 403)");
    const err = await moveOnBoard(trackerTarget(github(), { fid: "12-x" }), BOARD).catch(
      (e: unknown) => e,
    );
    expect((err as TrackerError).reason).toBe("scope");
  });
});

describe("blockers", () => {
  it("github: the blocked-by block in the body, each issue's state", async () => {
    gh.resp(
      "repos/o/r/issues/12",
      JSON.stringify({
        body: "Intro\n###### bkit:blocked-by start\n- #3\n- #4\n###### bkit:blocked-by end\n- #9 not a blocker",
        state: "open",
      }),
    );
    // Every issue read answers the same file in the fake: one state for all.
    const t = trackerTarget(github(), { fid: "12-x" });
    const blockers = await readBlockers(t);
    expect(blockers.map((b) => b.id)).toEqual(["#3", "#4"]);
    expect(gh.calls().slice(1)).toEqual([
      "api repos/o/r/issues/3 --jq .state",
      "api repos/o/r/issues/4 --jq .state",
    ]);
  });

  it("github: no block, no blockers and no further reads", async () => {
    gh.resp("repos/o/r/issues/12", JSON.stringify({ body: "nothing", state: "open" }));
    expect(await readBlockers(trackerTarget(github(), { fid: "12-x" }))).toEqual([]);
    expect(gh.calls()).toHaveLength(1);
  });

  it("linear: inverse blocks relations; done and canceled are closed", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    stubFetch(
      json({
        data: {
          issue: {
            inverseRelations: {
              nodes: [
                {
                  type: "blocks",
                  issue: { identifier: "ENG-1", state: { name: "Done", type: "completed" } },
                },
                {
                  type: "related",
                  issue: { identifier: "ENG-2", state: { name: "Todo", type: "unstarted" } },
                },
                {
                  type: "blocks",
                  issue: { identifier: "ENG-3", state: { name: "Todo", type: "unstarted" } },
                },
              ],
            },
          },
        },
      }),
    );
    expect(await readBlockers(trackerTarget(linear(), { fid: "eng-4-x" }))).toEqual([
      { id: "ENG-1", state: "Done", open: false },
      { id: "ENG-3", state: "Todo", open: true },
    ]);
  });

  it("jira: issues linked as 'is blocked by', open unless their status category is done", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const calls = jiraMcp({
      issues: [
        { key: "PROJ-1", fields: { status: { name: "Done", statusCategory: { key: "done" } } } },
        { key: "PROJ-2", fields: { status: { name: "To Do", statusCategory: { key: "new" } } } },
      ],
    });
    expect(await readBlockers(trackerTarget(jira(), { fid: "proj-9-x" }))).toEqual([
      { id: "PROJ-1", state: "Done", open: false },
      { id: "PROJ-2", state: "To Do", open: true },
    ]);
    expect(bodyOf(calls[2]!.init).params.arguments.jql).toBe(
      "issue in linkedIssues('PROJ-9', 'is blocked by')",
    );
  });
});

// ---------------------------------------------------------------------------
// review fixes: marker hash, body files, Linear errors and paging, Jira HTML pages
// ---------------------------------------------------------------------------

describe("generated marker hash", () => {
  it("stamps a bare marker with the 12-hex hash of the rest; other bodies stay as they are", () => {
    const stamped = stampMarker("###### bkit:generated\n### Step 3 — X");
    expect(stamped).toMatch(/^###### bkit:generated [0-9a-f]{12}\n### Step 3 — X$/);
    expect(stampMarker(stamped)).toBe(stamped);
    expect(stampMarker("plain")).toBe("plain");
    expect(stampMarker("###### bkit:generated\n### Step 3 — Y")).not.toBe(stamped);
  });

  it("reads the hash from a markdown heading, an HTML h6 and leading blank lines", () => {
    const stamped = stampMarker("###### bkit:generated\nbody");
    const h = markerHashOf(stamped)!;
    expect(h).toMatch(/^[0-9a-f]{12}$/);
    expect(markerHashOf(`\n\n${stamped}`)).toBe(h);
    expect(markerHashOf(`<h6 id="x">bkit:generated ${h}</h6><p>body</p>`)).toBe(h);
    expect(markerHashOf("###### bkit:generated\nbody")).toBeNull();
    expect(markerHashOf(`note\n${stamped}`)).toBeNull();
  });
});

describe("writeBodyFile", () => {
  it("writes the body verbatim under the checkout's tmp/ and returns the absolute path", () => {
    const cwd = github();
    const body = "###### bkit:generated abc\nline 1\n\\n stays\n";
    const file = writeBodyFile(cwd, "comment", body);
    expect(path.isAbsolute(file)).toBe(true);
    expect(file.startsWith(path.join(cwd, "tmp", "bkit-comment-"))).toBe(true);
    expect(fs.readFileSync(file, "utf-8")).toBe(body);
    expect(writeBodyFile(cwd, "comment", body)).toBe(file);
  });
});

describe("postCommentOnce: re-runs compare the marker hash, never the rewritten text", () => {
  const log = () => undefined;
  const body = stampMarker("###### bkit:generated\n### Step 4 — Close\n- a\n- *b*");
  const h = markerHashOf(body)!;

  it("github: a recent comment carrying the same marker hash is done", async () => {
    gh.resp(
      "graphql",
      JSON.stringify({
        data: {
          repository: {
            issue: {
              comments: { nodes: [{ body: `###### bkit:generated ${h}\n\n* a`, url: "u" }] },
            },
          },
        },
      }),
    );
    const r = await postCommentOnce(trackerTarget(github(), { fid: "12-x" }), body, {
      recent: 5,
      log,
    });
    expect(r).toEqual({ done: true, action: "comment", url: "u", deduped: true });
  });

  it("linear: markdown round-tripped by Linear still dedups on the marker", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const calls = stubFetch(
      json({
        data: {
          issue: {
            title: "T",
            comments: {
              nodes: [{ body: `###### bkit:generated ${h}\n\n* a\n* _b_`, createdAt: "x" }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          },
        },
      }),
    );
    const r = await postCommentOnce(trackerTarget(linear(), { fid: "eng-4-x" }), body, {
      recent: 5,
      log,
    });
    expect(r).toMatchObject({ done: true, deduped: true });
    expect(calls).toHaveLength(1);
  });

  it("jira: a split `_(part i/n)_` comment and an HTML page both dedup on the marker", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const t = trackerTarget(jira(), { fid: "proj-9-x" });
    const calls = jiraMcp(
      { key: "PROJ-9", fields: { summary: "S" } },
      {
        comments: [{ body: `###### bkit:generated ${h}\n_(part 1/2)_\n* a`, created: "x" }],
        isLast: true,
      },
    );
    expect(await postCommentOnce(t, body, { recent: 5, log })).toMatchObject({ deduped: true });
    expect(calls).toHaveLength(4);
    jiraMcp(
      { key: "PROJ-9", fields: { summary: "S" } },
      {
        comments: [{ body: `<h6>bkit:generated ${h}</h6><ul><li>a</li></ul>`, created: "x" }],
        appliedContentFormat: "html",
        isLast: true,
      },
      {
        comments: [{ body: `<h6>bkit:generated ${h}</h6><ul><li>a</li></ul>`, created: "x" }],
        appliedContentFormat: "html",
        isLast: true,
      },
    );
    expect(await postCommentOnce(t, body, { recent: 5, log })).toMatchObject({ deduped: true });
  });

  it("a different marker hash posts", async () => {
    gh.resp(
      "graphql",
      JSON.stringify({
        data: {
          repository: {
            issue: { comments: { nodes: [{ body: "###### bkit:generated 000000000000\nx" }] } },
          },
        },
      }),
    );
    gh.resp("repos/o/r/issues/12/comments", JSON.stringify({ html_url: "https://gh/c/2" }));
    const r = await postCommentOnce(trackerTarget(github(), { fid: "12-x" }), body, {
      recent: 5,
      log,
    });
    expect(r).toEqual({ done: true, action: "comment", url: "https://gh/c/2" });
  });

  it("a status.jsonl write that fails after the post is done with a warning, never done false", async () => {
    const cwd = github();
    // Its parent is a file: nothing to read, and the row write fails.
    const file = path.join(cwd, "package.json", "status.jsonl");
    gh.resp("repos/o/r/issues/12/comments", JSON.stringify({ html_url: "https://gh/c/3" }));
    const lines: string[] = [];
    const r = await postCommentOnce(trackerTarget(cwd, { fid: "12-x" }), body, {
      file,
      key: "k",
      log: (m) => lines.push(m),
    });
    expect(r).toMatchObject({ done: true, action: "comment", url: "https://gh/c/3" });
    expect((r as { warning?: string }).warning).toMatch(/engine-action/);
    expect(lines.join("\n")).toMatch(/engine-action/);
  });
});

describe("linear: errors on a non-2xx answer and comment paging", () => {
  it("a 400 carrying a GraphQL RATELIMITED / AUTHENTICATION_ERROR code maps by code", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const t = trackerTarget(linear(), { fid: "eng-4-x" });
    stubFetch(
      json(
        { errors: [{ message: "Rate limit exceeded", extensions: { code: "RATELIMITED" } }] },
        { status: 400 },
      ),
    );
    expect(((await postComment(t, "x").catch((e: unknown) => e)) as TrackerError).reason).toBe(
      "rate-limit",
    );
    stubFetch(
      json(
        {
          errors: [
            { message: "Authentication required", extensions: { code: "AUTHENTICATION_ERROR" } },
          ],
        },
        { status: 400 },
      ),
    );
    expect(((await postComment(t, "x").catch((e: unknown) => e)) as TrackerError).reason).toBe(
      "auth",
    );
    stubFetch(new Response("bad gateway", { status: 502 }));
    expect(((await postComment(t, "x").catch((e: unknown) => e)) as TrackerError).reason).toBe(
      "http-502",
    );
  });

  it("fetchIssue pages comments past the first page", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const calls = stubFetch(
      json({
        data: {
          issue: {
            title: "T",
            comments: {
              nodes: [{ body: "one", createdAt: "2026-10-01T00:00:00Z" }],
              pageInfo: { hasNextPage: true, endCursor: "c1" },
            },
          },
        },
      }),
      json({
        data: {
          issue: {
            comments: {
              nodes: [{ body: "two", createdAt: "2026-10-02T00:00:00Z" }],
              pageInfo: { hasNextPage: false, endCursor: "c2" },
            },
          },
        },
      }),
    );
    const issue = await fetchIssue(trackerTarget(linear(), { fid: "eng-4-x" }));
    expect(issue.comments.map((c) => c.body)).toEqual(["one", "two"]);
    expect(bodyOf(calls[1]!.init).variables).toEqual({ id: "ENG-4", after: "c1" });
  });
});

describe("jira: HTML comment pages and non-string bodies", () => {
  it("re-reads an HTML page one comment per call; a body that stays HTML is kept as HTML", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const calls = jiraMcp(
      { key: "PROJ-9", fields: { summary: "S" } },
      {
        comments: [
          { body: "<h6>bkit:generated</h6><p>x</p>", created: "2026-10-01T00:00:00Z" },
          { body: "<p>human @mention</p>", created: "2026-10-02T00:00:00Z" },
        ],
        appliedContentFormat: "html",
        isLast: true,
      },
      { comments: [{ body: "###### bkit:generated\nx", created: "2026-10-01T00:00:00Z" }] },
      {
        comments: [{ body: "<p>human @mention</p>", created: "2026-10-02T00:00:00Z" }],
        appliedContentFormat: "html",
      },
    );
    const issue = await fetchIssue(trackerTarget(jira(), { fid: "proj-9-x" }));
    expect(issue.comments.map((c) => c.body)).toEqual([
      "###### bkit:generated\nx",
      "<p>human @mention</p>",
    ]);
    const reads = calls.slice(4).map((c) => bodyOf(c.init).params.arguments.inputs);
    expect(reads).toEqual([
      { issueIdOrKey: "PROJ-9", maxResults: 1, startAt: 0 },
      { issueIdOrKey: "PROJ-9", maxResults: 1, startAt: 1 },
    ]);
  });

  it("an ADF comment or description body reads as text, never a JSON blob", async () => {
    process.env.BKIT_JIRA_API_KEY = "k";
    const adf = (heading: string, para: string) => ({
      type: "doc",
      version: 1,
      content: [
        { type: "heading", attrs: { level: 6 }, content: [{ type: "text", text: heading }] },
        { type: "paragraph", content: [{ type: "text", text: para }] },
      ],
    });
    jiraMcp(
      { key: "PROJ-9", fields: { summary: "S", description: adf("Spec", "do it") } },
      { comments: [{ body: adf("bkit:generated", "x"), created: "x" }], isLast: true },
    );
    const issue = await fetchIssue(trackerTarget(jira(), { fid: "proj-9-x" }));
    expect(issue.body).toBe("###### Spec\ndo it");
    expect(issue.comments[0]!.body).toBe("###### bkit:generated\nx");
  });
});
