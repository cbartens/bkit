/// <reference lib="es2024.string" />

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { actionHash, alreadyDone, recordAction } from "../../ledgers/status";
import { validate } from "../../ledgers/telemetry";
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
  recentComments,
  readBlockers,
  readLabels,
  runActionKey,
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
[ -f "$f-$n" ] && f="$f-$n"
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
  vi.unstubAllEnvs();
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

function progressFixture() {
  const cwd = github();
  const file = path.join(cwd, "docs/plans/202611/logs/12-progress/status.jsonl");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T01:00:00Z" })}\n`,
  );
  const body = stampMarker("###### bkit:generated\n### Step 7 — Plan Execute\nexact 😀 source\n");
  const url = "https://github.com/o/r/issues/12#issuecomment-101";
  gh.resp(
    "repos/o/r/issues/12/comments",
    JSON.stringify({
      id: 101,
      node_id: "IC_101",
      body,
      html_url: url,
      user: { id: 7, node_id: "U_7", login: "engine" },
      created_at: "2026-11-01T01:01:00Z",
      updated_at: "2026-11-01T01:01:00Z",
      issue_url: "https://api.github.com/repos/o/r/issues/12",
    }),
  );
  gh.resp(
    "graphql",
    JSON.stringify({
      data: {
        repository: {
          issue: {
            comments: {
              nodes: [
                {
                  id: "IC_101",
                  body,
                  url,
                  author: { login: "engine" },
                  createdAt: "2026-11-01T01:01:00Z",
                  updatedAt: "2026-11-01T01:01:00Z",
                },
              ],
              pageInfo: { hasPreviousPage: false, hasNextPage: false, startCursor: "cursor-101" },
            },
          },
        },
      },
    }),
  );
  return {
    cwd,
    file,
    body,
    url,
    target: trackerTarget(cwd, { fid: "12-progress" }),
    options: {
      file,
      key: runActionKey(file, "build", "build-plan-tasks", 1, 1),
      log: () => undefined,
    },
  };
}

function progressFiles(cwd: string): string[] {
  const root = path.join(cwd, ".git/bkit-outbox");
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { recursive: true, encoding: "utf8" })
    .map((entry) => path.join(root, entry))
    .filter((entry) => fs.statSync(entry).isFile() && entry.endsWith(".json"));
}

function stringsOf(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "number") return [String(value)];
  if (Array.isArray(value)) return value.flatMap((entry: unknown) => stringsOf(entry));
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(stringsOf);
  return [];
}

interface PublicationComment {
  id: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string };
}
function publicationFixture() {
  const cwd = linear();
  process.env.BKIT_LINEAR_API_KEY = "linear-test-secret";
  const file = path.join(cwd, "docs/plans/202611/logs/eng-12-progress/status.jsonl");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(
    file,
    `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T01:00:00Z" })}\n`,
  );
  const state = {
    comments: [] as PublicationComment[],
    requests: [] as Array<{
      operation: "create" | "edit" | "read";
      body?: string;
      id?: string;
      signal?: AbortSignal | null;
    }>,
    failReads: 0,
    failEdits: 0,
    failCreates: 0,
    loseEditResponse: false,
    postflightHuman: false,
    repeatedPages: false,
  };
  const make = (body: string, user = "engine-account"): PublicationComment => {
    const id = `comment-${state.comments.length + 1}`;
    return {
      id,
      body,
      url: `https://linear.app/issue/ENG-12#${id}`,
      user: { id: user },
      createdAt: new Date(Date.UTC(2026, 10, 1, 1, 0, state.comments.length)).toISOString(),
      updatedAt: "2026-11-01T01:01:00.000Z",
    };
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string | URL, init: RequestInit = {}) => {
      const request: {
        query: string;
        variables: { id?: string; after?: string; input?: { body?: string } };
      } = JSON.parse(String(init.body));
      const operation = request.query.includes("commentCreate")
        ? "create"
        : request.query.includes("commentUpdate")
          ? "edit"
          : "read";
      state.requests.push({
        operation,
        body: request.variables.input?.body,
        id: request.variables.id,
        signal: init.signal,
      });
      const failure = () =>
        new Response(JSON.stringify({ errors: [{ message: "test transport unavailable" }] }), {
          status: 503,
        });
      if (operation === "read") {
        if (state.failReads-- > 0) return failure();
        return Response.json({
          data: {
            issue: {
              comments: {
                nodes: state.comments,
                pageInfo: {
                  hasNextPage: state.repeatedPages,
                  endCursor: `page-${state.requests.length}`,
                },
              },
            },
          },
        });
      }
      if (operation === "create") {
        if (state.failCreates-- > 0) return failure();
        const comment = make(request.variables.input?.body ?? "");
        state.comments.push(comment);
        return Response.json({ data: { commentCreate: { success: true, comment } } });
      }
      if (state.failEdits-- > 0) return failure();
      const comment = state.comments.find((c) => c.id === request.variables.id);
      if (!comment) return new Response("missing comment", { status: 404 });
      comment.body = request.variables.input?.body ?? "";
      comment.updatedAt = "2026-11-01T01:02:00.000Z";
      if (state.postflightHuman) state.comments.push(make("intervening reply", "human-account"));
      if (state.loseEditResponse) throw new Error("response lost after successful mutation");
      return Response.json({ data: { commentUpdate: { success: true, comment } } });
    }),
  );
  const report = (text: string) =>
    stampMarker(`###### bkit:generated\n### ${text}\nexact current 😀 report\n`);
  const options = (
    key = "first",
    purpose: "routine" | "attention" | "terminal" = "routine",
    budgetMs = 1000,
  ) => ({
    file,
    key: runActionKey(file, "build", key, 1, 1),
    purpose,
    budgetMs,
    log: () => undefined,
  });
  const target = trackerTarget(cwd, { fid: "eng-12-progress" });
  return {
    cwd,
    file,
    state,
    make,
    report,
    options,
    target,
    publish: (
      text: string,
      key = text,
      purpose: "routine" | "attention" | "terminal" = "routine",
    ) => postCommentOnce(target, report(text), options(key, purpose)),
  };
}

function soleComment(f: ReturnType<typeof publicationFixture>): PublicationComment {
  expect(f.state.comments).toHaveLength(1);
  const comment = f.state.comments[0];
  if (!comment) throw new Error("expected one delivered comment");
  return comment;
}
function requireOutcomeUrl(result: Awaited<ReturnType<typeof postCommentOnce>>): string | null {
  expect(result).toMatchObject({ done: true });
  if (!("done" in result) || !result.done) throw new Error("expected acknowledged comment");
  return result.url;
}
function breakReceiptAfterCreate(f: ReturnType<typeof publicationFixture>) {
  const originalFetch = globalThis.fetch;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      const request: { query: string } = JSON.parse(String(init?.body));
      if (request.query.includes("commentCreate")) {
        fs.unlinkSync(f.file);
        fs.mkdirSync(f.file);
        f.state.failReads = 10;
      }
      return response;
    }),
  );
}

function commentFriction(cwd: string): Array<Record<string, unknown>> {
  const ledger = path.join(cwd, ".bkit/friction.jsonl");
  expect(fs.existsSync(ledger), "comment fault must attempt a real friction row").toBe(true);
  return fs
    .readFileSync(ledger, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

async function stateFriction(boundary: "cache" | "receipt" | "lock" | "reconciliation") {
  const f = publicationFixture();
  await f.publish("first");
  if (boundary === "cache") {
    const cache = progressFiles(f.cwd).find((file) =>
      file.includes(`${path.sep}progress${path.sep}`),
    );
    if (!cache) throw new Error("expected the initial publication to save progress source");
    fs.writeFileSync(cache, "invalid source");
  } else if (boundary === "receipt") {
    breakReceiptAfterCreate(f);
    f.state.failReads = 10;
  } else if (boundary === "lock") {
    const locks = path.join(f.cwd, ".git/bkit-outbox/publication-locks");
    fs.rmSync(locks, { recursive: true, force: true });
    fs.writeFileSync(locks, "unavailable lock directory");
  } else {
    f.state.failEdits = 10;
    const fetch = globalThis.fetch;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const result = await fetch(input, init);
        const request: { query: string } = JSON.parse(String(init?.body));
        if (request.query.includes("commentUpdate")) f.state.failReads = 10;
        return result;
      }),
    );
  }
  await expect(f.publish(`fault ${boundary}`)).resolves.toHaveProperty("done");
  return commentFriction(f.cwd);
}

describe("best effort comment friction", () => {
  it("records redacted exhausted comment friction with authorized fields", async () => {
    const f = publicationFixture();
    f.state.failCreates = 10;
    const privateBody = "private person@example.invalid Bearer body-secret";
    const result = await f.publish(privateBody);
    expect(result).toMatchObject({ done: false, action: "comment" });
    const entries = commentFriction(f.cwd);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(validate(entry)).toEqual({ ok: true });
      expect(entry).toMatchObject({
        kind: "friction",
        source: "orchestrator",
        by: { workflow: "build" },
      });
      expect(entry.key).toEqual(expect.any(String));
    }
    const bytes = fs.readFileSync(path.join(f.cwd, ".bkit/friction.jsonl"), "utf8");
    for (const privateValue of [
      privateBody,
      "person@example.invalid",
      "body-secret",
      "linear-test-secret",
    ])
      expect(bytes).not.toContain(privateValue);
    expect(bytes).toContain("comment");
  });

  it("continues after friction and diagnostic writes fail without recursion", async () => {
    const f = publicationFixture();
    fs.mkdirSync(path.join(f.cwd, ".bkit/friction.jsonl"), { recursive: true });
    f.state.failCreates = 10;
    const warning = vi.fn((_line: string) => {
      throw new Error("diagnostic unavailable");
    });
    await expect(
      postCommentOnce(f.target, f.report("undeliverable"), {
        ...f.options("undeliverable"),
        log: warning,
      }),
    ).resolves.toMatchObject({ done: false });
    expect(warning.mock.calls.length).toBeGreaterThan(0);
    expect(warning.mock.calls.length).toBeLessThanOrEqual(3);
    expect(warning.mock.calls.flat().join("\n")).toContain("friction");
    expect(
      f.state.requests.filter((request) => request.operation === "create").length,
    ).toBeLessThanOrEqual(3);
    expect(fs.statSync(path.join(f.cwd, ".bkit/friction.jsonl")).isDirectory()).toBe(true);
    f.state.failCreates = 0;
    await expect(f.publish("next substantive report")).resolves.toMatchObject({ done: true });
    expect(f.state.comments.at(-1)?.body).toContain("next substantive report");
  });

  it("distinguishes fallback attempts from known delivery and lost reports", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.failEdits = 10;
    const fallback = await f.publish("fallback");
    expect(fallback).toMatchObject({ done: true, url: f.state.comments.at(-1)?.url });
    expect(f.state.comments).toHaveLength(2);
    expect(f.state.requests.some((request) => request.operation === "edit")).toBe(true);
    const count = f.state.requests.length;
    await expect(f.publish("fallback")).resolves.toMatchObject({ done: true, deduped: true });
    expect(f.state.requests).toHaveLength(count);
    f.state.failCreates = 10;
    f.state.failReads = 10;
    const lost = await f.publish("lost");
    expect(lost).toMatchObject({ done: false, action: "comment", reason: expect.any(String) });
    expect(lost).not.toHaveProperty("url");
    expect(f.state.comments.some((comment) => comment.body.includes("lost"))).toBe(false);
    expect(commentFriction(f.cwd).length).toBeGreaterThan(0);
  });

  it("logs cache receipt lock and reconciliation problems with stable recurrence identity", async () => {
    for (const boundary of ["cache", "receipt", "lock", "reconciliation"] as const) {
      const first = await stateFriction(boundary);
      const repeated = await stateFriction(boundary);
      expect(first.length).toBeGreaterThan(0);
      expect(repeated.length).toBeGreaterThan(0);
      expect(first.every((entry) => validate(entry).ok)).toBe(true);
      expect(repeated.every((entry) => validate(entry).ok)).toBe(true);
      expect(repeated.map((entry) => entry.key)).toEqual(first.map((entry) => entry.key));
    }
  });
});

describe("routine publication policy", () => {
  it("creates then appends routine sections under explicit invocation ownership", async () => {
    const f = publicationFixture();
    const first = await f.publish("first");
    const original = soleComment(f).body;
    const second = await f.publish("second");
    expect(requireOutcomeUrl(second)).toBe(requireOutcomeUrl(first));
    expect(soleComment(f).body).toContain(original);
    expect(soleComment(f).body).toContain("second");
    expect(f.state.requests.filter((r) => r.operation === "create")).toHaveLength(1);
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(1);
    expect(soleComment(f).body.split("\n")[0]).toMatch(/^###### bkit:generated/);
  });

  it("deduplicates known reports using available receipts and bounded markers", async () => {
    const f = publicationFixture();
    await f.publish("same", "same-key");
    expect(await f.publish("same", "same-key")).toMatchObject({ done: true, deduped: true });
    fs.writeFileSync(
      f.file,
      fs
        .readFileSync(f.file, "utf8")
        .split("\n")
        .filter((line) => !line.includes('"engine-action"'))
        .join("\n"),
    );
    expect(await f.publish("same", "same-key")).toMatchObject({ done: true, deduped: true });
    expect(f.state.requests.filter((r) => r.operation !== "read")).toHaveLength(1);
    expect(f.state.requests.filter((r) => r.operation === "read").length).toBeLessThanOrEqual(10);
  });

  it("appends changed report versions without replacing prior text", async () => {
    const f = publicationFixture();
    await f.publish("original version", "shared-key");
    const original = soleComment(f).body;
    await f.publish("changed version", "shared-key");
    expect(soleComment(f).body).toContain(original);
    expect(soleComment(f).body).toContain("changed version");
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(1);
  });

  it("classifies attention and terminal reports from structured purpose", async () => {
    const f = publicationFixture();
    await f.publish("failure misleading title", "routine-first");
    await f.publish("Summary", "routine-summary");
    expect(f.state.comments).toHaveLength(1);
    const old = soleComment(f).body;
    const attention = f.report("routine-looking title");
    await postCommentOnce(f.target, attention, f.options("decision", "attention"));
    const terminal = f.report("Step 3");
    await postCommentOnce(f.target, terminal, f.options("close", "terminal"));
    expect(f.state.comments.map((c) => c.body)).toEqual([old, attention, terminal]);
    expect(await postCommentOnce(f.target, terminal, f.options("close", "terminal"))).toMatchObject(
      { deduped: true },
    );
  });

  it("rolls over after intervening comments external edits and deletion", async () => {
    const f = publicationFixture();
    await f.publish("first");
    const first = soleComment(f);
    first.body += "\nexternal edit retains markers";
    await f.publish("after external edit");
    expect(f.state.comments).toHaveLength(2);
    expect(f.state.comments[1]?.body).toBe(f.report("after external edit"));
    f.state.comments.push(f.make("human reply", "human"));
    await f.publish("after human");
    expect(f.state.comments.at(-1)?.body).toBe(f.report("after human"));
    f.state.comments.pop();
    await f.publish("after deletion");
    expect(f.state.comments.at(-1)?.body).toBe(f.report("after deletion"));
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(0);
  });

  it("starts only new source after overflow or missing source", async () => {
    const f = publicationFixture();
    await f.publish("first");
    const oversized = f.report("x".repeat(100_000));
    await postCommentOnce(f.target, oversized, f.options("overflow"));
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(0);
    expect(
      f.state.comments
        .slice(1)
        .map((c) => c.body)
        .join("\n"),
    ).not.toContain("### first");
    for (const file of progressFiles(f.cwd)) fs.unlinkSync(file);
    await f.publish("missing cache");
    expect(f.state.comments.at(-1)?.body).toBe(f.report("missing cache"));
  });

  it("keeps standalone fallback exact and unassociated calls conservative", async () => {
    const f = publicationFixture();
    const logs: string[] = [];
    const body = f.report("unassociated");
    const options = { purpose: "routine", log: (line: string) => logs.push(line) };
    await postCommentOnce(f.target, body, options);
    expect(soleComment(f).body).toBe(body);
    expect(logs.join("\n")).toMatch(/aggregation.unavailable|association.unavailable/i);
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(0);
  });

  it("uses exact new comment after a failed eligibility read", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.failReads = 1;
    await f.publish("fallback");
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(0);
    expect(f.state.comments.at(-1)?.body).toBe(f.report("fallback"));
    expect(f.state.requests.filter((r) => r.operation === "create")).toHaveLength(2);
  });
});

describe("bounded nonfatal publication", () => {
  it("falls back to a new comment after failed or uncertain append", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.failEdits = 1;
    const before = f.state.requests.length;
    expect(await f.publish("fallback")).toMatchObject({ done: true });
    expect(f.state.requests.slice(before).filter((r) => r.operation === "edit")).toHaveLength(1);
    expect(f.state.comments.at(-1)?.body).toBe(f.report("fallback"));
    expect(
      f.state.requests.slice(before).filter((r) => r.operation !== "read").length,
    ).toBeLessThanOrEqual(3);
  });

  it("recognizes append success within budget without unnecessary resend", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.loseEditResponse = true;
    const result = await f.publish("ack lost");
    expect(requireOutcomeUrl(result)).toBe(soleComment(f).url);
    expect(soleComment(f).body).toContain("ack lost");
    expect(f.state.requests.filter((r) => r.operation === "create")).toHaveLength(1);
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(1);
  });

  it("contains exhausted append and create failures without fabricated success", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.failEdits = 10;
    f.state.failCreates = 10;
    const before = f.state.requests.length;
    await expect(f.publish("all failed")).resolves.toMatchObject({
      done: false,
      action: "comment",
    });
    const writes = f.state.requests.slice(before).filter((r) => r.operation !== "read");
    expect(writes.some((r) => r.operation === "edit")).toBe(true);
    expect(writes.some((r) => r.operation === "create")).toBe(true);
    expect(writes.length).toBeLessThanOrEqual(3);
    expect(soleComment(f).body).not.toContain("all failed");
  });

  it("keeps multipart loss and duplicate handling bounded and nonfatal", async () => {
    const f = publicationFixture();
    const body = f.report("😀".repeat(110_000));
    f.state.failCreates = 10;
    await expect(postCommentOnce(f.target, body, f.options("multipart"))).resolves.toMatchObject({
      done: false,
    });
    expect(f.state.requests.filter((r) => r.operation !== "read").length).toBeLessThanOrEqual(3);
    expect(alreadyDone(f.file, f.options("multipart").key!, actionHash(body))).toBeUndefined();
    f.state.failCreates = 0;
    const start = f.state.requests.length;
    const recovered = await postCommentOnce(f.target, body, f.options("multipart"));
    expect(recovered).toMatchObject({ done: true });
    const delivered = f.state.requests.length;
    expect(await postCommentOnce(f.target, body, f.options("multipart"))).toMatchObject({
      deduped: true,
    });
    expect(f.state.requests.length).toBe(delivered);
    expect(delivered - start).toBeLessThanOrEqual(13);
  });

  it("keeps positive acknowledgment after receipt cache or postflight failure", async () => {
    const f = publicationFixture();
    breakReceiptAfterCreate(f);
    const result = await f.publish("acknowledged");
    expect(requireOutcomeUrl(result)).toBe(soleComment(f).url);
    expect(f.state.requests.filter((r) => r.operation === "create")).toHaveLength(1);
  });

  it("reserves new comment opportunity within total delivery budget", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.repeatedPages = true;
    const start = f.state.requests.length;
    const began = performance.now();
    await postCommentOnce(
      f.target,
      f.report("bounded fallback"),
      f.options("bounded", "routine", 100),
    );
    const calls = f.state.requests.slice(start);
    expect(performance.now() - began).toBeLessThan(1500);
    expect(calls.filter((r) => r.operation === "read").length).toBeLessThanOrEqual(10);
    expect(calls.filter((r) => r.operation === "create")).toHaveLength(1);
    expect(calls.filter((r) => r.operation !== "read").length).toBeLessThanOrEqual(3);
    expect(f.state.comments.at(-1)?.body).toBe(f.report("bounded fallback"));
    expect(calls.every((r) => r.signal !== undefined)).toBe(true);
    const toolScript = path.join(fake, "gh-body.sh");
    fs.writeFileSync(toolScript, FAKE_GH, { mode: 0o644 });
    fs.unlinkSync(path.join(fake, "bin/gh"));
    fs.symlinkSync(
      path.resolve(import.meta.dirname, "../../../../../tests/fixtures/gh/bin/gh"),
      path.join(fake, "bin/gh"),
    );
    vi.stubEnv("BKIT_FAKE_TOOL_SCRIPT", toolScript);
    const g = progressFixture();
    const firstOptions = { ...g.options, purpose: "routine", budgetMs: 200 };
    expect(requireOutcomeUrl(await postCommentOnce(g.target, g.body, firstOptions))).toBe(g.url);
    fs.writeFileSync(
      toolScript,
      `#!/bin/sh\nprintf '%s\\n' "$*" >> "$FAKE_GH_DIR/slow-calls"\nexec "${process.execPath}" -e 'setTimeout(()=>{},10000)'\n`,
      { mode: 0o644 },
    );
    const childStart = performance.now();
    const current = stampMarker("###### bkit:generated\nslow child current report\n");
    const slowOptions = {
      ...g.options,
      key: runActionKey(g.file, "build", "slow-child", 1, 1),
      purpose: "routine",
      budgetMs: 200,
    };
    const result = await postCommentOnce(g.target, current, slowOptions);
    expect(result).toMatchObject({ done: false });
    expect(performance.now() - childStart).toBeLessThan(1500);
    const slowCalls = fs.readFileSync(path.join(fake, "slow-calls"), "utf8").trim().split("\n");
    expect(slowCalls.some((call) => call.includes("--method POST"))).toBe(true);
    expect(slowCalls.length).toBeLessThanOrEqual(3);
    const commonOutbox = path.join(g.cwd, ".git/bkit-outbox");
    expect(
      fs
        .readdirSync(commonOutbox, { recursive: true, encoding: "utf8" })
        .filter((file) => file.endsWith(".lock")),
    ).toEqual([]);
  });

  it("contains preparation state lock and reconciliation exceptions", async () => {
    const f = publicationFixture();
    await f.publish("first");
    for (const file of progressFiles(f.cwd)) {
      fs.unlinkSync(file);
      fs.mkdirSync(file);
    }
    f.state.failReads = 10;
    const body = f.report("fallback survives local faults");
    const options = {
      ...f.options("local-fault"),
      log: () => {
        throw new Error("diagnostic unavailable");
      },
    };
    await expect(postCommentOnce(f.target, body, options)).resolves.toMatchObject({ done: true });
    expect(f.state.comments.at(-1)?.body).toBe(body);
    expect(f.state.requests.filter((r) => r.operation === "edit")).toHaveLength(0);
  });

  it("attempts independent attention after routine uncertainty", async () => {
    const f = publicationFixture();
    await f.publish("first");
    f.state.failEdits = 10;
    f.state.failCreates = 10;
    await f.publish("uncertain");
    f.state.failCreates = 0;
    const body = f.report("independent failure report");
    await expect(
      postCommentOnce(f.target, body, f.options("attention", "attention")),
    ).resolves.toMatchObject({ done: true });
    expect(f.state.comments.at(-1)?.body).toBe(body);
    const before = f.state.requests.length;
    await f.publish("after attention");
    expect(f.state.requests.slice(before).filter((r) => r.operation === "edit")).toHaveLength(0);
  });

  it("seals an acknowledged segment after a postflight intervening comment", async () => {
    const f = publicationFixture();
    await f.publish("first");
    const firstUrl = soleComment(f).url;
    f.state.postflightHuman = true;
    expect(requireOutcomeUrl(await f.publish("accepted race"))).toBe(firstUrl);
    expect(f.state.comments).toHaveLength(2);
    expect(f.state.comments[0]?.body).toContain("accepted race");
    f.state.postflightHuman = false;
    const before = f.state.requests.length;
    await f.publish("next segment");
    expect(f.state.requests.slice(before).filter((r) => r.operation === "edit")).toHaveLength(0);
    expect(f.state.comments.at(-1)?.body).toBe(f.report("next segment"));
  });
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
  it("budgets continuation headers beyond ninety nine parts", () => {
    const body = stampMarker(`###### bkit:generated\n${"x".repeat(10_000)}`);
    const parts = splitAt(body, 100);
    expect(parts.length).toBeGreaterThan(99);
    expect(parts.every((part) => part.length <= 100)).toBe(true);
    expect(parts.map((part) => part.split("\n").slice(2).join("\n")).join("")).toBe(
      "x".repeat(10_000),
    );
    expect(splitAt(body, 100)).toEqual(parts);
  });

  it("refuses aggregation with an unverified provider budget", () => {
    const render: (body: string, limit: number, options: { verifiedBudget: boolean }) => string[] =
      splitAt;
    const body = stampMarker(`###### bkit:generated\n${"😀".repeat(100)}`);
    expect(render(body, 101, { verifiedBudget: false })).toEqual([body]);
    expect(render(body, 101, { verifiedBudget: true }).length).toBeGreaterThan(1);
  });

  it("budgets the entire encoded body at limit and overflow", () => {
    const limit = JIRA_COMMENT_LIMIT;
    const marker = stampMarker("###### bkit:generated\nreport").split("\n")[0]!;
    const exact = `${marker}\n${"a".repeat(limit - marker.length - 1)}`;
    expect(splitAt(exact, limit)).toEqual([exact]);
    const parts = splitAt(`${exact}b`, limit);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((part) => part.length <= limit)).toBe(true);
    expect(parts.map((part) => part.split("\n")[0])).toEqual(parts.map(() => marker));
    expect(parts.map((part) => part.split("\n").slice(2).join("\n")).join("")).toBe(
      `${exact}b`.slice(marker.length + 1),
    );
  });

  it("keeps non BMP code points intact in deterministic parts", () => {
    const marker = stampMarker("###### bkit:generated\nreport").split("\n")[0]!;
    const text = "😀".repeat(100);
    const body = `${marker}\n${text}`;
    const parts = splitAt(body, 101);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.every((part) => part.length <= 101)).toBe(true);
    expect(parts.every((part) => part.isWellFormed())).toBe(true);
    expect(parts.map((part) => part.split("\n").slice(2).join("\n")).join("")).toBe(text);
    expect(splitAt(body, 101)).toEqual(parts);
  });

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

describe("progress inspection", () => {
  it("rejects inconclusive Linear creation order before selecting recent comments", async () => {
    process.env.BKIT_LINEAR_API_KEY = "linear-test-key";
    const target = trackerTarget(linear(), { issue: "ENG-4" });
    for (const createdAt of [undefined, "invalid-date"]) {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              data: {
                issue: {
                  comments: {
                    nodes: [
                      {
                        id: "own",
                        body: "own",
                        createdAt: "2026-11-01T00:00:00Z",
                        updatedAt: "2026-11-01T00:00:00Z",
                        user: { id: "owner" },
                      },
                      {
                        id: "foreign",
                        body: "foreign",
                        createdAt,
                        updatedAt: "2026-11-02T00:00:00Z",
                        user: { id: "human" },
                      },
                    ],
                    pageInfo: { hasNextPage: false },
                  },
                },
              },
            }),
            { headers: { "content-type": "application/json" } },
          ),
        ),
      );
      await expect(recentComments(target, 1)).rejects.toBeInstanceOf(TrackerError);
    }
  });

  it("orders Linear comments by creation instant across timestamp offsets", async () => {
    process.env.BKIT_LINEAR_API_KEY = "linear-test-key";
    const target = trackerTarget(linear(), { issue: "ENG-4" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              issue: {
                comments: {
                  nodes: [
                    {
                      id: "newer",
                      body: "newer",
                      createdAt: "2026-11-01T01:00:00Z",
                      updatedAt: "2026-11-01T01:00:00Z",
                      user: { id: "owner" },
                    },
                    {
                      id: "older",
                      body: "older",
                      createdAt: "2026-11-01T02:00:00+02:00",
                      updatedAt: "2026-11-01T02:00:00+02:00",
                      user: { id: "human" },
                    },
                  ],
                  pageInfo: { hasNextPage: false },
                },
              },
            },
          }),
          { headers: { "content-type": "application/json" } },
        ),
      ),
    );
    expect((await recentComments(target, 1)).map((comment) => comment.body)).toEqual(["newer"]);
  });

  it("reads Jira ownership evidence and seals HTML or anonymous representations", async () => {
    process.env.BKIT_JIRA_API_KEY = "jira-test-key";
    const target = trackerTarget(jira(), { issue: "PROJ-12" });
    const body = "###### bkit:generated\n\nowned report\n\n";
    const comment = {
      id: "101",
      author: { accountId: "account-7", displayName: "Test author" },
      body,
      created: "2026-11-03T11:43:17.402+1000",
      updated: "2026-11-03T11:44:17.402+1000",
      updateAuthor: { accountId: "account-7", displayName: "Test author" },
      jsdPublic: true,
    };
    const page = (comments: unknown[], appliedContentFormat: string) => ({
      startAt: 0,
      maxResults: 1,
      total: 1,
      isLast: true,
      appliedContentFormat,
      comments,
    });
    const calls = jiraMcp({ data: page([comment], "markdown") });
    const inspected = await recentComments(target, 1);
    expect(bodyOf(calls[2]!.init).params).toMatchObject({
      name: "listJiraIssueComments",
      arguments: {
        cloudId: "https://acme.atlassian.net",
        issueIdOrKey: "PROJ-12",
        view: "evidence",
        responseContentFormat: "markdown",
      },
    });
    expect(inspected[0]?.evidence).toMatchObject({
      id: "101",
      authorId: "account-7",
      createdAt: comment.created,
      updatedAt: comment.updated,
      fingerprint: actionHash(body),
      representation: "markdown",
    });
    jiraMcp({
      data: page([{ ...comment, body: "<h6>bkit:generated</h6><p>owned report</p>" }], "html"),
    });
    expect((await recentComments(target, 1))[0]?.evidence).toBeUndefined();
    jiraMcp({ data: page([{ ...comment, author: { displayName: "Test author" } }], "markdown") });
    expect((await recentComments(target, 1))[0]?.evidence).toBeUndefined();
  });

  it("edits Jira comments with verified preflight evidence", async () => {
    process.env.BKIT_JIRA_API_KEY = "jira-test-key";
    const target = trackerTarget(jira(), { issue: "PROJ-12" });
    const body = stampMarker("###### bkit:generated\nupdated section 😀");
    const returnedBody = `${body.split("\n")[0]}\n\nupdated section 😀\n\n`;
    const evidence = {
      id: "101",
      authorId: "account-7",
      createdAt: "2026-11-03T11:43:17.402+1000",
      updatedAt: "2026-11-03T11:43:17.402+1000",
      fingerprint: actionHash("previous returned body"),
      representation: "markdown" as const,
      sectionIds: [],
    };
    const calls = jiraMcp(
      {
        data: {
          commentId: "101",
          body: returnedBody,
          appliedContentFormat: "markdown",
          jsmCommentType: "publicComment",
        },
      },
      {
        data: {
          startAt: 0,
          maxResults: 1,
          total: 1,
          isLast: true,
          appliedContentFormat: "markdown",
          comments: [
            {
              id: "101",
              author: { accountId: "account-7", displayName: "Test author" },
              body: returnedBody,
              created: evidence.createdAt,
              updated: "2026-11-03T11:44:17.402+1000",
              updateAuthor: { accountId: "account-7", displayName: "Test author" },
              jsdPublic: true,
            },
          ],
        },
      },
    );
    const edit: (
      t: Parameters<typeof postComment>[0],
      text: string,
      options: { commentId: string; evidence: typeof evidence },
    ) => ReturnType<typeof postComment> = postComment;
    const result = await edit(target, body, { commentId: "101", evidence });
    expect(bodyOf(calls[2]!.init).params).toMatchObject({
      name: "addOrEditJiraIssueComment",
      arguments: {
        cloudId: "https://acme.atlassian.net",
        issueIdOrKey: "PROJ-12",
        commentId: "101",
        commentBody: body,
      },
    });
    expect(result.url).toBe("https://acme.atlassian.net/browse/PROJ-12?focusedCommentId=101");
    expect(result.evidence).toMatchObject({
      id: "101",
      authorId: "account-7",
      createdAt: evidence.createdAt,
      updatedAt: "2026-11-03T11:44:17.402+1000",
      fingerprint: actionHash(returnedBody),
      representation: "markdown",
    });
  });

  it("edits by verified comment id through each existing transport", async () => {
    const edit: (
      target: Parameters<typeof postComment>[0],
      body: string,
      options: { commentId: string },
    ) => ReturnType<typeof postComment> = postComment;
    const body = stampMarker("###### bkit:generated\nupdated section 😀");
    gh.resp(
      "repos/o/r/issues/comments/101",
      JSON.stringify({
        id: 101,
        body,
        html_url: "https://github.com/o/r/issues/12#issuecomment-101",
        user: { id: 7 },
        created_at: "2026-11-01T01:01:00Z",
        updated_at: "2026-11-01T01:02:00Z",
      }),
    );
    const edited = await edit(trackerTarget(github(), { issue: "12" }), body, {
      commentId: "101",
    });
    expect(gh.calls()).toEqual(["api repos/o/r/issues/comments/101 --method PATCH --input -"]);
    expect(JSON.parse(gh.stdin(1))).toEqual({ body });
    expect(edited.evidence).toMatchObject({ id: "101", fingerprint: actionHash(body) });

    process.env.BKIT_LINEAR_API_KEY = "linear-test-key";
    const calls = stubFetch(
      json({
        data: {
          commentUpdate: {
            success: true,
            comment: {
              id: "comment-101",
              body,
              url: "https://linear.app/issue/comment-101",
              user: { id: "author-7" },
              createdAt: "2026-11-01T01:01:00Z",
              updatedAt: "2026-11-01T01:02:00Z",
            },
          },
        },
      }),
    );
    const linearEdited = await edit(trackerTarget(linear(), { issue: "ENG-12" }), body, {
      commentId: "comment-101",
    });
    const request = bodyOf(calls[0]!.init);
    expect(request.query).toContain("commentUpdate");
    expect(request.query).not.toContain("commentCreate");
    expect(request.variables).toEqual({ id: "comment-101", input: { body } });
    expect(linearEdited.evidence).toMatchObject({
      id: "comment-101",
      fingerprint: actionHash(body),
    });

    process.env.BKIT_JIRA_API_KEY = "jira-test-key";
    const unsupportedCalls = stubFetch();
    await expect(
      edit(trackerTarget(jira(), { issue: "PROJ-12" }), body, { commentId: "101" }),
    ).rejects.toBeInstanceOf(TrackerError);
    expect(unsupportedCalls).toHaveLength(0);
  });

  it("seals unavailable or unstable representation evidence", async () => {
    const f = progressFixture();
    const stable = {
      id: "IC_101",
      databaseId: 101,
      body: f.body,
      url: f.url,
      author: { __typename: "Bot", id: "U_7", databaseId: 7 },
      createdAt: "2026-11-01T01:01:00Z",
      updatedAt: "2026-11-01T01:01:00Z",
    };
    const unavailable = [
      { ...stable, createdAt: null },
      { ...stable, updatedAt: null },
      { ...stable, updatedAt: "not-a-timestamp" },
      { ...stable, body: null },
    ];
    for (const node of unavailable) {
      gh.resp(
        "graphql",
        JSON.stringify({
          data: {
            repository: {
              issue: {
                comments: {
                  nodes: [node],
                  pageInfo: { hasPreviousPage: false },
                },
              },
            },
          },
        }),
      );
      const inspected = await recentComments(f.target, 1);
      expect(inspected).toHaveLength(1);
      expect(inspected[0]?.evidence).toBeUndefined();
    }
    expect(gh.calls().every((call) => !call.includes("--method PATCH"))).toBe(true);
  });

  it("uses accepted final preflight eligibility without provider atomicity", async () => {
    const f = progressFixture();
    const node = {
      id: "IC_101",
      databaseId: 101,
      body: f.body,
      url: f.url,
      author: { __typename: "Bot", id: "U_7", databaseId: 7 },
      createdAt: "2026-11-01T01:01:00Z",
      updatedAt: "2026-11-01T01:01:00Z",
    };
    const page = (author: unknown) =>
      JSON.stringify({
        data: {
          repository: {
            issue: {
              comments: {
                nodes: [{ ...node, author }],
                pageInfo: { hasPreviousPage: false },
              },
            },
          },
        },
      });
    gh.resp("graphql", page(node.author));
    const inspected = await recentComments(f.target, 1);
    expect(inspected[0]?.evidence).toMatchObject({
      id: "101",
      authorId: "7",
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      fingerprint: actionHash(f.body),
      representation: "markdown",
    });
    gh.resp("graphql", page({ login: "engine" }));
    const unknownOwner = await recentComments(f.target, 1);
    expect(unknownOwner[0]?.evidence?.authorId).toBeNull();
    expect(gh.calls().every((call) => !call.includes("--method PATCH"))).toBe(true);
  });

  it("rejects marker preserving external edits", async () => {
    const f = progressFixture();
    const original = await recentComments(f.target, 1);
    const editedBody = `${f.body}external edit that retains the generated marker`;
    gh.resp(
      "graphql",
      JSON.stringify({
        data: {
          repository: {
            issue: {
              comments: {
                nodes: [
                  {
                    id: "IC_101",
                    body: editedBody,
                    url: f.url,
                    author: { login: "engine" },
                    createdAt: "2026-11-01T01:01:00Z",
                    updatedAt: "2026-11-01T01:02:00Z",
                  },
                ],
                pageInfo: { hasPreviousPage: false, hasNextPage: false },
              },
            },
          },
        },
      }),
    );
    const edited = await recentComments(f.target, 1);
    expect(markerHashOf(original[0]!.body)).toBe(markerHashOf(edited[0]!.body));
    expect(stringsOf(original)).toContain(actionHash(f.body));
    expect(stringsOf(edited)).toContain(actionHash(editedBody));
    expect(stringsOf(edited)).not.toContain(actionHash(f.body));
    expect(gh.calls().some((call) => call.includes("--method PATCH"))).toBe(false);
  });

  it("preserves generated first line and extracts versioned h6 section markers", async () => {
    const f = progressFixture();
    const section = actionHash("original section identity");
    const body = stampMarker(
      `###### bkit:generated\n###### bkit:section v1 ${section} 1/2\nsection report 😀`,
    );
    gh.resp(
      "graphql",
      JSON.stringify({
        data: {
          repository: {
            issue: {
              comments: {
                nodes: [
                  {
                    id: "IC_101",
                    body,
                    url: f.url,
                    author: { login: "engine" },
                    createdAt: "2026-11-01T01:01:00Z",
                    updatedAt: "2026-11-01T01:01:00Z",
                  },
                ],
                pageInfo: { hasPreviousPage: false, hasNextPage: false },
              },
            },
          },
        },
      }),
    );
    const inspected = await recentComments(f.target, 1);
    expect(inspected[0]?.body.split("\n")[0]).toBe(body.split("\n")[0]);
    expect(stringsOf(inspected)).toContain(section);
    expect(markerHashOf(body)).toMatch(/^[a-f0-9]{12}$/);
    expect(markerHashOf(`<h6>bkit:generated ${markerHashOf(body)}</h6>\n<p>section</p>`)).toBe(
      markerHashOf(body),
    );
  });

  it("returns owned comment identity and stable representation evidence", async () => {
    const f = progressFixture();
    const githubResult = await postComment(f.target, f.body);
    const githubEvidence = stringsOf(githubResult);
    expect(githubEvidence).toContain("101");
    expect(githubEvidence).toContain("7");
    expect(githubEvidence).toContain(actionHash(f.body));

    process.env.BKIT_LINEAR_API_KEY = "unit-linear-key";
    stubFetch(
      json({
        data: {
          commentCreate: {
            success: true,
            comment: {
              id: "comment-101",
              body: f.body,
              url: "https://linear.test/comment-101",
              createdAt: "2026-11-01T01:01:00.000Z",
              updatedAt: "2026-11-01T01:01:00.000Z",
              user: { id: "author-7" },
            },
          },
        },
      }),
    );
    const linearResult = await postComment(trackerTarget(linear(), { issue: "ENG-4" }), f.body);
    const linearEvidence = stringsOf(linearResult);
    expect(linearEvidence).toContain("comment-101");
    expect(linearEvidence).toContain("author-7");
    expect(linearEvidence).toContain(actionHash(f.body));
  });

  it("selects newest created comment across complete pages", async () => {
    const target = trackerTarget(github(), { fid: "12-progress" });
    const newer = Array.from({ length: 100 }, (_, index) => ({
      id: `IC_${index + 2}`,
      body: `comment ${index + 2}`,
      url: `https://gh/c/${index + 2}`,
      author: { login: "engine" },
      createdAt: new Date(Date.UTC(2026, 10, 1, 0, index + 1)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 10, 1, 0, index + 1)).toISOString(),
    }));
    const older = {
      id: "IC_1",
      body: "older but edited later",
      url: "https://gh/c/1",
      author: { login: "engine" },
      createdAt: "2026-11-01T00:00:00.000Z",
      updatedAt: "2026-11-02T00:00:00.000Z",
    };
    gh.resp(
      "graphql-1",
      JSON.stringify({
        data: {
          repository: {
            issue: {
              comments: {
                nodes: newer,
                pageInfo: { hasPreviousPage: true, hasNextPage: false, startCursor: "cursor-2" },
              },
            },
          },
        },
      }),
    );
    gh.resp(
      "graphql-2",
      JSON.stringify({
        data: {
          repository: {
            issue: {
              comments: {
                nodes: [older],
                pageInfo: { hasPreviousPage: false, hasNextPage: true, startCursor: "cursor-1" },
              },
            },
          },
        },
      }),
    );
    const comments = await recentComments(target, 101);
    expect(comments.map((comment) => comment.body)).toEqual([
      older.body,
      ...newer.map((c) => c.body),
    ]);
    expect(comments.at(-1)?.url).toBe("https://gh/c/101");
    expect(gh.calls()).toHaveLength(2);
    expect(gh.calls().join("\n")).not.toMatch(/(?:first|last):101/);
    expect(gh.calls()[1]).toContain("cursor-2");

    gh.resp(
      "graphql-3",
      JSON.stringify({
        data: {
          repository: {
            issue: { comments: { nodes: newer, pageInfo: { hasPreviousPage: true } } },
          },
        },
      }),
    );
    await expect(recentComments(target, 101)).rejects.toBeInstanceOf(TrackerError);
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

  it("reuses original section time without changing duplicate identity", async () => {
    const f = progressFixture();
    const originalTime = "2026-11-01T01:02:03Z";
    const completed = {
      type: "step-done",
      workflow: "build",
      step: "build-plan-tasks",
      status: "DONE",
      at: originalTime,
      parentSha: "a".repeat(40),
      artifacts: [],
      group: 1,
      attempt: 1,
    };
    fs.appendFileSync(f.file, `${JSON.stringify(completed)}\n`);
    expect(await postCommentOnce(f.target, f.body, f.options)).toMatchObject({ done: true });
    const firstWrite = gh.calls().findIndex((call) => call.includes("--method POST"));
    const submitted: { body: string } = JSON.parse(gh.stdin(firstWrite + 1));
    expect(submitted.body).toMatch(/2026-11-01[T ]01:02:03(?:\.000)?(?:Z| UTC)/);
    expect(alreadyDone(f.file, f.options.key!, actionHash(f.body))?.ref).toBe(f.url);
    fs.appendFileSync(f.file, `${JSON.stringify({ ...completed, at: "2026-11-01T02:03:04Z" })}\n`);
    expect(await postCommentOnce(f.target, f.body, f.options)).toMatchObject({ deduped: true });
    const cached = progressFiles(f.cwd).flatMap((file) =>
      stringsOf(JSON.parse(fs.readFileSync(file, "utf-8"))),
    );
    expect(cached).toContain(submitted.body);
    expect(cached.join("\n")).not.toContain("2026-11-01T02:03:04Z");
    expect(gh.calls().filter((call) => call.includes("--method POST"))).toHaveLength(1);
  });

  it("caches exact engine source with available progress identity", async () => {
    const f = progressFixture();
    expect(await postCommentOnce(f.target, f.body, f.options)).toMatchObject({ done: true });
    const files = progressFiles(f.cwd);
    expect(files.length).toBeGreaterThan(0);
    const values = files.flatMap((file) => stringsOf(JSON.parse(fs.readFileSync(file, "utf-8"))));
    const firstWrite = gh.calls().findIndex((call) => call.includes("--method POST"));
    const submitted: { body: string } = JSON.parse(gh.stdin(firstWrite + 1));
    expect(values).toContain(submitted.body);
    expect(submitted.body).toContain(f.body.split("\n").slice(1).join("\n"));
    expect(values).toContain(f.url);
    expect(values.join("\n")).toContain("build");
    expect(values.join("\n")).toContain("o/r");
    expect(values.join("\n")).toContain("12");
    expect(values.join("\n")).not.toContain("remote-only source");
  });

  it("keeps original body identity separate from time and changed output", async () => {
    const f = progressFixture();
    await postCommentOnce(f.target, f.body, f.options);
    const files = progressFiles(f.cwd);
    expect(files.length).toBeGreaterThan(0);
    const original = files.map((file) => fs.readFileSync(file, "utf-8")).join("\n");
    expect(await postCommentOnce(f.target, f.body, f.options)).toMatchObject({ deduped: true });
    expect(files.map((file) => fs.readFileSync(file, "utf-8")).join("\n")).toBe(original);
    const changed = `${f.body}changed output\n`;
    expect(await postCommentOnce(f.target, changed, f.options)).toMatchObject({ done: true });
    expect(alreadyDone(f.file, f.options.key!, actionHash(f.body))?.ref).toBe(f.url);
    expect(alreadyDone(f.file, f.options.key!, actionHash(changed))?.ref).toBe(f.url);
    expect(gh.calls().filter((call) => /--method (?:POST|PATCH)/.test(call))).toHaveLength(2);
  });

  it("reuses matching invocation state without adopting foreign ownership", async () => {
    const f = progressFixture();
    await postCommentOnce(f.target, f.body, f.options);
    expect(progressFiles(f.cwd).length).toBeGreaterThan(0);
    expect(await postCommentOnce(f.target, f.body, f.options)).toMatchObject({ deduped: true });
    const otherTarget = trackerTarget(f.cwd, { issue: "13", fid: "13-progress" });
    gh.resp("repos/o/r/issues/13/comments", JSON.stringify({ html_url: "https://gh/c/foreign" }));
    expect(await postCommentOnce(otherTarget, f.body, f.options)).toMatchObject({
      done: true,
      url: "https://gh/c/foreign",
    });
    expect(gh.calls().filter((call) => call.includes("--method PATCH"))).toEqual([]);
    expect(
      gh.calls().some((call) => call.includes("repos/o/r/issues/13/comments --method POST")),
    ).toBe(true);
  });

  it("invalidates missing corrupt and unsupported progress cache", async () => {
    const missing = progressFixture();
    const corrupt = progressFixture();
    const unsupported = progressFixture();
    await postCommentOnce(missing.target, missing.body, missing.options);
    await postCommentOnce(corrupt.target, corrupt.body, corrupt.options);
    await postCommentOnce(unsupported.target, unsupported.body, unsupported.options);
    const missingFiles = progressFiles(missing.cwd);
    const corruptFiles = progressFiles(corrupt.cwd);
    const unsupportedFiles = progressFiles(unsupported.cwd);
    expect(missingFiles.length).toBeGreaterThan(0);
    expect(corruptFiles.length).toBeGreaterThan(0);
    expect(unsupportedFiles.length).toBeGreaterThan(0);
    missingFiles.forEach((file) => fs.unlinkSync(file));
    corruptFiles.forEach((file) => fs.writeFileSync(file, "{not-json"));
    unsupportedFiles.forEach((file) =>
      fs.writeFileSync(file, JSON.stringify({ version: 999_999, schema: 999_999 })),
    );
    const next = stampMarker("###### bkit:generated\n### Step 8 — Plan Verify\nnew report only");
    const first = await postCommentOnce(missing.target, next, {
      ...missing.options,
      key: runActionKey(missing.file, "build", "build-plan-verify", 1, 1),
    });
    const second = await postCommentOnce(corrupt.target, next, {
      ...corrupt.options,
      key: runActionKey(corrupt.file, "build", "build-plan-verify", 1, 1),
    });
    const third = await postCommentOnce(unsupported.target, next, {
      ...unsupported.options,
      key: runActionKey(unsupported.file, "build", "build-plan-verify", 1, 1),
    });
    expect([first, second, third]).toEqual([
      expect.objectContaining({ done: true }),
      expect.objectContaining({ done: true }),
      expect.objectContaining({ done: true }),
    ]);
    const writes = gh
      .calls()
      .map((call, index) => ({ call, index }))
      .filter(({ call }) => call.includes("--method POST"));
    expect(writes).toHaveLength(6);
    expect(writes.slice(-3).map(({ index }) => JSON.parse(gh.stdin(index + 1)))).toEqual([
      { body: next },
      { body: next },
      { body: next },
    ]);
    expect(gh.calls().filter((call) => call.includes("--method PATCH"))).toEqual([]);
  });

  it("contains cache read and write failures as standalone degradation", async () => {
    const f = progressFixture();
    await postCommentOnce(f.target, f.body, f.options);
    const files = progressFiles(f.cwd);
    expect(files.length).toBeGreaterThan(0);
    files.forEach((file) => {
      fs.unlinkSync(file);
      fs.mkdirSync(file);
    });
    const next = stampMarker("###### bkit:generated\n### Step 8 — Plan Verify\nstandalone");
    expect(
      await postCommentOnce(f.target, next, {
        ...f.options,
        key: runActionKey(f.file, "build", "build-plan-verify", 1, 1),
      }),
    ).toMatchObject({ done: true, url: f.url });
    const writes = gh
      .calls()
      .map((call, index) => ({ call, index }))
      .filter(({ call }) => call.includes("--method POST"));
    expect(writes).toHaveLength(2);
    expect(JSON.parse(gh.stdin(writes[1]!.index + 1))).toEqual({ body: next });
    expect(gh.calls().filter((call) => call.includes("--method PATCH"))).toEqual([]);
  });

  it("uses legacy receipts and contains receipt failures", async () => {
    const cwd = github();
    const target = trackerTarget(cwd, { fid: "12-x" });
    const body = stampMarker("###### bkit:generated\n### Step 7 — Plan Execute\nreport");
    const file = path.join(cwd, "status.jsonl");
    recordAction(file, {
      action: "comment",
      key: "build/1/build-plan-tasks/1/1/comment",
      hash: actionHash(body),
      ref: "https://gh/c/legacy",
    });
    const known = await postCommentOnce(target, body, {
      file,
      key: "build/1/build-plan-tasks/1/1/comment",
      log,
    });
    expect(known).toMatchObject({ done: true, deduped: true, url: "https://gh/c/legacy" });
    expect(gh.calls()).toEqual([]);

    gh.resp("repos/o/r/issues/12/comments", JSON.stringify({ html_url: "https://gh/c/fresh" }));
    const unavailable = path.join(cwd, "package.json", "status.jsonl");
    const fresh = await postCommentOnce(target, body, {
      file: unavailable,
      key: "build/1/build-plan-tasks/1/1/comment",
      log,
    });
    expect(fresh).toMatchObject({ done: true, url: "https://gh/c/fresh" });
    expect(fresh).not.toHaveProperty("deduped");
    expect(gh.calls().filter((call) => call.includes("--method POST"))).toHaveLength(1);
    expect(JSON.parse(gh.stdin(1))).toEqual({ body });
  });

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
              nodes: [
                {
                  body: `###### bkit:generated ${h}\n\n* a\n* _b_`,
                  createdAt: "2026-11-01T00:00:00Z",
                },
              ],
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
    const calls = jiraMcp({
      comments: [{ body: `###### bkit:generated ${h}\n_(part 1/2)_\n* a`, created: "x" }],
      isLast: true,
    });
    expect(await postCommentOnce(t, body, { recent: 5, log })).toMatchObject({ deduped: true });
    expect(calls).toHaveLength(3);
    jiraMcp({
      comments: [{ body: `<h6>bkit:generated ${h}</h6><ul><li>a</li></ul>`, created: "x" }],
      appliedContentFormat: "html",
      isLast: true,
    });
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
