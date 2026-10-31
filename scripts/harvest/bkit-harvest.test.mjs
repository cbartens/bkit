#!/usr/bin/env node
// bkit's own checkout only; never shipped.
/**
 * bkit-harvest.test.mjs — tests for bkit-harvest.mjs against made-up chats of every host
 * under a temp home folder, with a temp git repo as the repo the chats ran in.
 *
 * `node:test`: `node scripts/harvest/bkit-harvest.test.mjs`, or `pnpm bkit:test:file` on this file
 * for a JUnit report. The opencode, Cursor and Antigravity tests need Node 22.5+ (`node:sqlite`)
 * and are skipped on an older Node.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test as nodeTest } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  activeSpans,
  activityIndex,
  buildFacts,
  checkReason,
  endingOf,
  bkitCalls,
  chatClass,
  chatRow,
  expandedCommand,
  fingerprint,
  hostsFor,
  isoWeek,
  issueFp,
  latestOutcomes,
  latestRows,
  lineClass,
  MARK_ROWS,
  mergeSpans,
  modelFamily,
  normalize,
  overlapMs,
  PLAN_FILE,
  PLAN_FENCE,
  PLAN_MARKER,
  planShape,
  planTasks,
  readLedger,
  renderReport,
  renderRunCheck,
  repoFp,
  resolveRepo,
  runLines,
  runCheck,
  runLogDirs,
  runRows,
  runUsageIndex,
  runWindows,
  scan,
  scanRuns,
  shellPlanReads,
  slugFromRemote,
  splitRuns,
  Tally,
  testOrderGaps,
  toolMix,
  validateTotals,
  versionAt,
  writableRows,
} from "./bkit-harvest.mjs";

const SCRIPT = new URL("./bkit-harvest.mjs", import.meta.url);

let sqlite = null;
try {
  sqlite = await import("node:sqlite");
} catch {
  // Node older than 22.5: the SQLite hosts' tests are skipped
}

const test = (name, fn, { needsSqlite = false } = {}) =>
  nodeTest(name, { skip: needsSqlite && !sqlite ? "no node:sqlite" : false }, fn);

const SHA = "d3187b9daa21f7652a4d85f3c89aae040280b72b";
const SHA2 = "0123456789abcdef0123456789abcdef01234567";
const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.parse("2026-10-19T01:00:00Z");

const run = (cwd, ...args) => {
  const r = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
};

/** A git repo with an origin remote and a committed `.bkit/version`. */
function makeRepo(dir) {
  fs.mkdirSync(path.join(dir, ".bkit"), { recursive: true });
  run(dir, "init", "-q");
  run(dir, "remote", "add", "origin", "git@github.com:acme/widget.git");
  fs.writeFileSync(path.join(dir, ".bkit", "version"), JSON.stringify({ pinnedVersion: "5.5.1" }));
  run(dir, "add", ".");
  const r = spawnSync(
    "git",
    [
      "-C",
      dir,
      "-c",
      "user.name=t",
      "-c",
      "user.email=t@t",
      "-c",
      "commit.gpgsign=false",
      "commit",
      "-q",
      "--no-verify",
      "-m",
      "v",
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_COMMITTER_DATE: "2026-10-01T00:00:00Z",
        GIT_AUTHOR_DATE: "2026-10-01T00:00:00Z",
      },
    },
  );
  if (r.status !== 0) throw new Error(`git commit: ${r.stderr}`);
}

const line = (o) => JSON.stringify(o) + "\n";
const at = (min) => new Date(T0 + min * 60_000).toISOString();
const ms = (min) => T0 + min * 60_000;
const usage = (ctx) => ({
  input_tokens: 10,
  cache_creation_input_tokens: 0,
  cache_read_input_tokens: ctx - 10,
  output_tokens: 5,
});

function age(dir, when = Date.now() - 3 * DAY) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) age(p, when);
    else fs.utimesSync(p, when / 1000, when / 1000);
  }
}

/** Protobuf encoder for fixtures: [[field, number | string | Buffer], …]. */
const varint = (n) => {
  const out = [];
  do {
    let b = n % 128;
    n = Math.floor(n / 128);
    if (n) b |= 128;
    out.push(b);
  } while (n);
  return Buffer.from(out);
};
const pb = (...fields) =>
  Buffer.concat(
    fields.map(([f, v]) => {
      if (typeof v === "number") return Buffer.concat([varint(f * 8), varint(v)]);
      const b = Buffer.isBuffer(v) ? v : Buffer.from(String(v));
      return Buffer.concat([varint(f * 8 + 2), varint(b.length), b]);
    }),
  );
const pbTime = (t) => pb([1, Math.floor(t / 1000)], [2, (t % 1000) * 1e6]);

// Claude Code: /bkit-plan 650, a close step that prints the parentSha, one MCP tool error ----------

function claudeMain(cwd) {
  return [
    line({
      type: "user",
      timestamp: at(0),
      cwd,
      gitBranch: "feat/650-secret-branch",
      version: "2.1.0",
      message: {
        role: "user",
        content: "<command-name>/bkit-plan</command-name>\n<command-args>650</command-args>",
      },
    }),
    line({
      type: "user",
      timestamp: at(1),
      message: { role: "user", content: "also see #651 please" },
    }),
    line({
      type: "assistant",
      timestamp: at(2),
      message: {
        id: "m1",
        model: "claude-opus-5-5",
        usage: usage(1000),
        content: [
          {
            type: "tool_use",
            id: "t1",
            name: "Bash",
            input: { command: 'B=/r/node_modules/.bin/bkit; "$B" workflows close --workflow=plan' },
          },
        ],
      },
    }),
    line({
      type: "user",
      timestamp: at(3),
      message: {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: "t1",
            content: `{"counterRow":{"counterSource":"shell-bus","parentSha":"${SHA}"}}`,
          },
        ],
      },
    }),
    line({
      type: "assistant",
      timestamp: at(4),
      message: {
        id: "m2",
        model: "claude-opus-5-5",
        usage: usage(3000),
        content: [{ type: "tool_use", id: "t2", name: "mcp__github__issue_read", input: {} }],
      },
    }),
    line({
      type: "user",
      timestamp: at(5),
      message: {
        role: "user",
        content: [{ type: "tool_result", tool_use_id: "t2", is_error: true, content: "boom" }],
      },
    }),
    line({
      type: "assistant",
      timestamp: at(5),
      message: { id: "x1", model: "<synthetic>", content: [{ type: "text", text: "API Error" }] },
    }),
    line({ type: "system", subtype: "compact_boundary", timestamp: at(6) }),
  ].join("");
}

function claudeSub() {
  return [
    line({
      type: "user",
      timestamp: at(2),
      message: { role: "user", content: "Plan generate for #650" },
    }),
    line({
      type: "assistant",
      timestamp: at(3),
      message: {
        id: "s1",
        model: "claude-sonnet-5-5",
        usage: usage(2000),
        content: [
          { type: "tool_use", id: "u1", name: "Read", input: { file_path: "/secret/path.md" } },
        ],
      },
    }),
  ].join("");
}

function makeClaude(home, cwd, sid) {
  const proj = path.join(home, ".claude", "projects", "-tmp-widget");
  const sub = path.join(proj, sid, "subagents");
  fs.mkdirSync(sub, { recursive: true });
  fs.writeFileSync(path.join(proj, `${sid}.jsonl`), claudeMain(cwd));
  fs.writeFileSync(path.join(sub, "agent-a.jsonl"), claudeSub());
  fs.writeFileSync(
    path.join(sub, "agent-a.meta.json"),
    JSON.stringify({ agentType: "bkit-plan-generate", description: "secret prompt text" }),
  );
  age(proj);
  return proj;
}

// Codex: $bkit-build 652, a close step, a failed command, one subagent rollout -------------------

const CODEX_ID = "0199a1b2-0000-7000-8000-000000000001";
function makeCodex(home, cwd) {
  const dir = path.join(home, ".codex", "sessions", "2026", "10", "19");
  fs.mkdirSync(dir, { recursive: true });
  const ev = (min, type, payload) => line({ timestamp: at(min), type, payload });
  const tokens = (total, input, cached, output) => ({
    type: "token_count",
    info: {
      total_token_usage: { total_tokens: total },
      last_token_usage: {
        input_tokens: input,
        cached_input_tokens: cached,
        output_tokens: output,
        total_tokens: input + output,
      },
    },
  });
  fs.writeFileSync(
    path.join(dir, `rollout-2026-10-19T01-00-00-${CODEX_ID}.jsonl`),
    [
      ev(0, "session_meta", {
        id: CODEX_ID,
        cwd,
        originator: "codex_cli_rs",
        cli_version: "0.146.0",
        source: "cli",
      }),
      ev(0, "turn_context", { turn_id: "t1", cwd, model: "gpt-5.5-codex", effort: "high" }),
      ev(1, "event_msg", { type: "user_message", message: "$bkit-build 652" }),
      ev(1, "response_item", {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "<skill>\n<name>bkit-build</name>\n</skill>" }],
      }),
      ev(2, "response_item", {
        type: "function_call",
        name: "exec_command",
        call_id: "c1",
        arguments: JSON.stringify({ cmd: "pnpm exec bkit workflows close --workflow=build" }),
      }),
      ev(3, "response_item", {
        type: "function_call_output",
        call_id: "c1",
        output: `Process exited with code 0\nOutput:\nfinalReturn: DONE\nparentSha: ${SHA2}\n`,
      }),
      ev(3, "event_msg", tokens(11500, 11000, 9000, 500)),
      ev(3, "event_msg", tokens(11500, 11000, 9000, 500)),
      ev(4, "response_item", {
        type: "function_call",
        name: "exec_command",
        call_id: "c2",
        arguments: JSON.stringify({ cmd: "pnpm test" }),
      }),
      ev(5, "response_item", {
        type: "function_call_output",
        call_id: "c2",
        output: "Process exited with code 1\nOutput:\nfail",
      }),
      ev(5, "event_msg", tokens(23500, 11500, 10000, 500)),
      ev(6, "compacted", { message: "summary of /bkit-build 652", replacement_history: [] }),
    ].join(""),
  );
  fs.writeFileSync(
    path.join(dir, "rollout-2026-10-19T01-02-00-child.jsonl"),
    [
      ev(2, "session_meta", {
        id: "child-1",
        cwd,
        cli_version: "0.146.0",
        source: {
          subagent: {
            thread_spawn: { parent_thread_id: CODEX_ID, depth: 1, agent_role: "explorer" },
          },
        },
      }),
      ev(2, "turn_context", { turn_id: "t1", cwd, model: "gpt-5.5-codex-mini", effort: "low" }),
      ev(3, "event_msg", tokens(2000, 2000, 0, 100)),
    ].join(""),
  );
  age(path.join(home, ".codex"));
}

// opencode: an expanded /bkit-design 653 command, a shell call that exits 1, a subagent, a fork ---

function makeOpencode(home, cwd) {
  const dir = path.join(home, ".local", "share", "opencode");
  fs.mkdirSync(dir, { recursive: true });
  const db = new sqlite.DatabaseSync(path.join(dir, "opencode.db"));
  db.exec(`create table session_v2 (id text primary key, project_id text, parent_id text, directory text, title text,
    version text, agent text, time_created integer, time_updated integer, time_idle integer, idle_outcome text);
    create table session_message (id text primary key, session_id text, type text, seq integer, time_created integer,
    time_updated integer, data text)`);
  const ses = db.prepare(
    "insert into session_v2 values (?, 'p', ?, ?, 't', '2.1.2', ?, ?, ?, ?, 'succeeded')",
  );
  const msg = db.prepare("insert into session_message values (?, ?, ?, ?, ?, ?, ?)");
  ses.run("ses_root", null, cwd, "build", ms(0), ms(10), ms(10));
  ses.run("ses_child", "ses_root", cwd, "bkit-design-generate", ms(2), ms(4), ms(4));
  ses.run("ses_fork", null, cwd, "build", ms(20), ms(30), ms(30));
  const prompt =
    "<!-- bkit:managed v5.4.0 -->\n**Session prompt:**\n\n653\n\n---\n\n# Design Feature (Workflow 1/5)\n\nsee #9999 in the template";
  const asst = (id, model, input, read, tools = []) =>
    JSON.stringify({
      id,
      model: { id: model, providerID: "openrouter", variant: "max" },
      tokens: { input, output: 50, reasoning: 0, cache: { read, write: 0 } },
      content: tools,
    });
  let n = 0;
  const add = (sid, type, min, data) => msg.run(`m${n++}`, sid, type, n, ms(min), ms(min), data);
  for (const sid of ["ses_root", "ses_fork"]) {
    // The fork's copy of the root's first messages keeps their original times.
    add(sid, "user", 0, JSON.stringify({ text: prompt }));
    add(
      sid,
      "assistant",
      1,
      asst(`a-${sid}`, "anthropic/claude-opus-5.5", 1000, 9000, [
        {
          type: "tool",
          id: `call-${sid}`,
          name: "shell",
          state: {
            status: "completed",
            input: { command: "pnpm exec bkit steps finish" },
            content: [{ type: "text", text: "nope" }],
            metadata: { exit: 1 },
          },
        },
      ]),
    );
  }
  add("ses_child", "assistant", 3, asst("c1", "deepseek/deepseek-v4.1-flash", 500, 0));
  add("ses_fork", "user", 21, JSON.stringify({ text: "carry on with #654" }));
  add("ses_fork", "assistant", 22, asst("f1", "anthropic/claude-opus-5.5", 2000, 0));
  add("ses_fork", "compaction", 23, JSON.stringify({ reason: "manual", summary: "..." }));
  db.close();
}

// Cursor: a composer chat with an expanded bkit-ship command and an MCP call, its subagent, and an
// archived chat that survives only as a transcript ------------------------------------------------

function makeCursor(home, cwd) {
  const dir = path.join(home, "Library", "Application Support", "Cursor", "User", "globalStorage");
  fs.mkdirSync(dir, { recursive: true });
  const db = new sqlite.DatabaseSync(path.join(dir, "state.vscdb"));
  db.exec(`create table composerHeaders (composerId text primary key, workspaceId text, createdAt integer, lastUpdatedAt integer,
    isArchived integer, isSubagent integer, subagentTypeName text, value text);
    create table cursorDiskKV (key text primary key, value blob)`);
  const kv = db.prepare("insert into cursorDiskKV values (?, ?)");
  const head = db.prepare("insert into composerHeaders values (?, 'w', ?, ?, 0, ?, ?, ?)");
  let h = 0;
  const blob = (m) => {
    const hex = (++h).toString(16).padStart(64, "0");
    kv.run(`agentKv:blob:${hex}`, Buffer.from(JSON.stringify(m)));
    return Buffer.from(hex, "hex");
  };
  const chat = (id, msgs, extra = []) => {
    const state = pb(
      ...msgs.map((m) => [1, blob(m)]),
      [21, pb([1, cwd], [2, "dev"])],
      [22, "ide"],
      [26, ms(0)],
      ...extra,
    );
    kv.run(
      `composerData:${id}`,
      Buffer.from(
        JSON.stringify({
          conversationState: "~" + state.toString("base64"),
          generatingBubbleIds: [],
          modelConfig: { modelName: "composer-2.5" },
        }),
      ),
    );
  };
  chat("cur-root", [
    { role: "system", content: "You are…" },
    {
      role: "user",
      content: [{ type: "text", text: "<user_info>Workspace Path: /x</user_info>" }],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "<cursor_commands>\n--- Cursor Command: bkit-ship ---\n…\n</cursor_commands>\n<user_query>655</user_query>",
        },
      ],
    },
    {
      role: "assistant",
      content: [
        {
          type: "reasoning",
          text: "thinking",
          providerOptions: { cursor: { modelName: "claude-opus-5-5-high-fast" } },
        },
        {
          type: "tool-call",
          toolCallId: "k1",
          toolName: "CallDynamicTool",
          args: { namespace: "github", toolName: "issue_read" },
        },
        {
          type: "tool-call",
          toolCallId: "k2",
          toolName: "Shell",
          args: { command: "bkit workflows close --workflow=ship" },
        },
      ],
    },
    {
      role: "tool",
      content: [{ type: "tool-result", toolCallId: "k1", result: "denied" }],
      providerOptions: {
        cursor: { highLevelToolCallResult: { isError: false, output: { rejected: {} } } },
      },
    },
    {
      role: "tool",
      content: [{ type: "tool-result", toolCallId: "k2", result: "ok" }],
      providerOptions: {
        cursor: { highLevelToolCallResult: { isError: false, output: { success: {} } } },
      },
    },
    { role: "assistant", content: [{ type: "text", text: "done" }] },
  ]);
  head.run(
    "cur-root",
    ms(0),
    ms(10),
    0,
    null,
    JSON.stringify({ workspaceIdentifier: { uri: { fsPath: cwd } } }),
  );
  chat("cur-sub", [{ role: "assistant", content: [{ type: "text", text: "sub work" }] }]);
  head.run(
    "cur-sub",
    ms(2),
    ms(3),
    1,
    "explore",
    JSON.stringify({
      subagentInfo: { parentComposerId: "cur-root", rootParentConversationId: "cur-root" },
    }),
  );
  db.close();
  const tdir = path.join(
    home,
    ".cursor",
    "projects",
    "Users-x-widget",
    "agent-transcripts",
    "cur-old",
  );
  fs.mkdirSync(tdir, { recursive: true });
  fs.writeFileSync(
    path.join(tdir, "cur-old.jsonl"),
    [
      line({
        role: "user",
        message: {
          content: [
            {
              type: "text",
              text: "<timestamp>…</timestamp>\n<user_query>\nfix #656\n</user_query>",
            },
          ],
        },
      }),
      line({
        role: "assistant",
        message: {
          content: [
            { type: "text", text: "on it" },
            { type: "tool_use", name: "Shell", input: { command: "git status" } },
          ],
        },
      }),
      line({ type: "turn_ended", status: "success" }),
    ].join(""),
  );
  age(path.join(home, ".cursor"));
}

// Antigravity: one chat database, a model call per gen_metadata row, a command that exits 1 --------

function makeAntigravity(home, cwd) {
  const dir = path.join(home, ".gemini", "antigravity-ide", "conversations");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "ag-1.db");
  const db = new sqlite.DatabaseSync(file);
  db.exec(`pragma journal_mode = wal;
    create table steps (idx integer primary key, step_type integer, status integer, has_subtrajectory numeric, metadata blob,
      error_details blob, permissions blob, task_details blob, render_info blob, step_payload blob, step_format integer);
    create table gen_metadata (idx integer primary key, data blob, size integer);
    create table trajectory_metadata_blob (id text primary key, data blob)`);
  db.prepare("insert into trajectory_metadata_blob values ('main', ?)").run(
    pb(
      [1, pb([1, pathToFileURL(cwd).href], [3, pb([1, "acme/widget"])])],
      [2, pbTime(ms(0))],
      [6, "ag-1"],
    ),
  );
  const step = db.prepare(
    "insert into steps (idx, step_type, status, metadata, step_payload) values (?, ?, ?, ?, ?)",
  );
  step.run(0, 14, 3, pb([1, pbTime(ms(0))]), pb([19, pb([2, "/bkit-debug 657"])]));
  step.run(
    1,
    15,
    3,
    pb([1, pbTime(ms(1))]),
    pb([
      20,
      pb(
        [3, "let me look"],
        [
          7,
          pb([1, "call_1"], [2, "run_command"], [3, JSON.stringify({ CommandLine: "pnpm test" })]),
        ],
      ),
    ]),
  );
  step.run(
    2,
    21,
    3,
    pb([1, pbTime(ms(2))], [4, pb([1, "call_1"], [2, "run_command"])]),
    pb([28, pb([6, 1], [21, pb([1, "1 failed"])])]),
  );
  const gen = db.prepare("insert into gen_metadata values (?, ?, 0)");
  gen.run(0, pb([1, pb([19, "gemini-3.8-flash-n"], [4, pb([2, 1000], [3, 40], [5, 4000])])]));
  gen.run(1, pb([1, pb([19, "gemini-3.8-flash-n"], [4, pb([2, 200], [3, 60], [5, 5000])])]));
  db.close();
  age(path.join(home, ".gemini"));
  return dir;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-harvest-"));
const home = path.join(tmp, "home");
const repoDir = path.join(tmp, "widget");
makeRepo(repoDir);
const sid = "11111111-2222-3333-4444-555555555555";
const proj = makeClaude(home, repoDir, sid);
const statsFile = path.join(tmp, "stats.jsonl");
fs.writeFileSync(
  statsFile,
  line({
    ts: T0 + 3 * 60_000,
    kind: "outcome",
    repo: "acme/widget",
    bkitVersion: "5.5.1",
    workflow: "plan",
    step: "plan-close-workflow",
    parentSha: SHA,
    linesAdded: 10,
    linesDeleted: 2,
    linesChanged: 12,
    filesChanged: 3,
    taskCount: 4,
    durationSeconds: 600,
    deferrals: 0,
    failures: 0,
  }),
);
const scanHosts = (platforms) =>
  scan({ hosts: hostsFor(home, platforms), statsFile, settleHours: 24 });
const rowOf = (key) =>
  readLedger(statsFile)
    .filter((r) => r.key === key)
    .at(-1);

console.log("bkit-harvest");

await test("slugFromRemote reads ssh and https remotes", () => {
  assert.equal(slugFromRemote("git@github.com:acme/widget.git"), "acme/widget");
  assert.equal(slugFromRemote("https://github.com/acme/widget"), "acme/widget");
});

await test("bkitCalls finds real bkit commands, direct and through a B=…/bkit variable, and skips prose", () => {
  assert.deepEqual(bkitCalls('B=/x/.bin/bkit; "$B" workflows close && pnpm bkit check script'), [
    ["check", undefined],
    ["workflows", "close"],
  ]);
  assert.deepEqual(bkitCalls('gh issue create --body "bkit for the release"'), []);
});

await test("expandedCommand reads opencode's anchor and Cursor's command block", () => {
  assert.deepEqual(
    expandedCommand(
      "<!-- bkit:managed v5.4.0 -->\n**Session prompt:**\n\n#653\n\n---\n\n# Plan Feature (Workflow 2/5)\n",
    ),
    {
      text: "/bkit-plan 653",
      version: "5.4.0",
    },
  );
  assert.deepEqual(
    expandedCommand(
      "<cursor_commands>--- Cursor Command: bkit-ship ---</cursor_commands><user_query>655</user_query>",
    ),
    {
      text: "/bkit-ship 655",
      version: null,
    },
  );
  assert.equal(expandedCommand("**Session prompt:** but no workflow heading"), null);
});

await test("modelFamily gives one name per model across hosts", () => {
  assert.equal(modelFamily("anthropic/claude-opus-5.5"), "claude-opus-5-5");
  assert.equal(modelFamily("claude-opus-5-5-high-fast"), "claude-opus-5-5");
  assert.equal(modelFamily("claude-opus-5-5"), "claude-opus-5-5");
  assert.equal(modelFamily("?"), "(not recorded)");
});

await test("versionAt is null before the first recorded version", () => {
  const h = [
    [100, "5.4.0"],
    [200, "5.5.0"],
  ];
  assert.equal(versionAt(h, 50), null);
  assert.equal(versionAt(h, 150), "5.4.0");
  assert.equal(versionAt(h, 250), "5.5.0");
});

await test("isoWeek puts a Sunday in the week that started the Monday before", () => {
  const sun = isoWeek(new Date(2026, 9, 25, 12).getTime());
  assert.equal(sun.key, "2026-W43");
  assert.equal(sun.monday, "2026-10-19");
});

await test("claude-code: one folded row per chat, with fingerprints and no prose", async () => {
  const res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 1);
  const row = rowOf(`claude-code:${sid}`);
  assert.equal(row.schema, 3);
  assert.equal(row.kind, "chat");
  assert.equal(row.key, `claude-code:${sid}`);
  assert.deepEqual(row.by, { workflow: "chat-stats", step: "scan" });
  assert.equal(row.session.platform, "claude-code");
  assert.equal(row.session.id, sid);
  assert.equal(row.session.hostVersion, "2.1.0");
  assert.equal(row.session.prompts, 1, "the command line is not a typed prompt");
  assert.equal(row.repo, repoFp("acme/widget"));
  assert.deepEqual(row.issue, {
    id: issueFp("acme/widget", 650),
    all: [issueFp("acme/widget", 650)],
    mentioned: [issueFp("acme/widget", 651)],
    source: "command",
  });
  assert.equal(row.bkit.version, "5.5.1");
  assert.equal(row.bkit.versionSource, "repo-history");
  assert.deepEqual(row.bkit.via, ["command", "subagent"]);
  assert.deepEqual(row.bkit.workflows, ["plan"]);
  assert.deepEqual(row.bkit.prompts, ["plan"]);
  assert.deepEqual(row.bkit.cli, { total: 1, byVerb: { "workflows close": 1 } });
  assert.deepEqual(row.run, { parentShas: [SHA] });
  assert.deepEqual(row.agents.total, { n: 1, errors: 0 });
  assert.equal(row.agents.byAgent["bkit-plan-generate"].n, 1);
  assert.equal(row.usage.total.turns, 3, "the <synthetic> message is not a turn");
  assert.deepEqual(Object.keys(row.usage.byModel).sort(), ["claude-opus-5-5", "claude-sonnet-5-5"]);
  assert.equal(row.usage.byModel["claude-opus-5-5"].tokens.read, 4000);
  assert.equal(row.usage.total.tokens.read, 6000);
  assert.deepEqual(row.usage.total.context, { start: 1000, peak: 3000 });
  assert.equal(row.scan.tokensRecorded, true);
  assert.equal(row.scan.settled, true);
  assert.equal(row.scan.files, 2);
  assert.equal(row.usage.main.tokens.read, 4000);
  assert.equal(row.usage.total.compactions, 1);
  assert.deepEqual(row.tools.total, { calls: 3, errors: 1 });
  assert.deepEqual(row.tools.byTool["mcp__github"], { calls: 1, errors: 1 });
  assert.deepEqual(row.tools.byTool.Bash, { calls: 1, errors: 0, byCategory: { "bkit cli": 1 } });
  assert.equal(row.tools.filesRead, 1);
  assert.deepEqual(row.usage.byModel["claude-opus-5-5"], {
    turns: 2,
    tokens: {
      input: 20,
      cacheWrite: 0,
      cacheRead: 3980,
      output: 10,
      outputEst: row.usage.byModel["claude-opus-5-5"].tokens.outputEst,
      read: 4000,
    },
  });
  assert.deepEqual(row.time.spans, [[ms(0), ms(6)]]);
  assert.equal(row.time.totalMinutes, 6);
  assert.equal(row.time.activeMinutes, 6);
  assert.ok(row.time.lastActivity > 0);
  const agent = row.agents.byAgent["bkit-plan-generate"];
  assert.equal(agent.usage.tokens.cacheRead, 1990);
  assert.equal(agent.usage.tokens.input, 10);
  assert.equal(agent.mix.read, 1, "the Read tool counts as a read");
  assert.deepEqual(
    agent.instances,
    [{ turns: 1, contextPeak: 2000, contextAt10: null }],
    "each agent's largest turn is kept",
  );
  assert.equal(row.usage.main.tokens.cacheRead, 3980);
  assert.deepEqual(Object.keys(row.usage.main.mix), [
    "read",
    "edit",
    "grep",
    "shellRead",
    "shellList",
    "tests",
    "serena",
  ]);
  assert.deepEqual(validateTotals(row), { ok: true });
  for (const gone of [
    "bkitVersion",
    "workflow",
    "step",
    "subagents",
    "minutes",
    "tokens",
    "models",
  ])
    assert.ok(!(gone in row), `row still has ${gone}`);
  const text = JSON.stringify(row);
  for (const leak of ["widget", "secret", "650", "/tmp", repoDir])
    assert.ok(!text.includes(leak), `row contains ${leak}`);
});

await test("a second scan appends nothing when the chats are unchanged", async () => {
  const res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 0);
  assert.equal(res.byPlatform["claude-code"].unchanged, 1);
});

await test("a stored chat row without the split across runs is read again", async () => {
  const last = rowOf(`claude-code:${sid}`);
  assert.deepEqual(last.usage.byRun, {}, "the chat worked on no run");
  const { byRun, ...usageWithout } = last.usage;
  const before = fs.readFileSync(statsFile, "utf8");
  fs.appendFileSync(statsFile, line({ ...last, schema: 2, usage: usageWithout }));
  const res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 1);
  assert.deepEqual(rowOf(`claude-code:${sid}`).usage.byRun, {});
  fs.writeFileSync(statsFile, before);
});

await test("a resumed chat gets a new row with the same key; nothing is rewritten", async () => {
  const before = fs.readFileSync(statsFile, "utf8");
  fs.appendFileSync(
    path.join(proj, `${sid}.jsonl`),
    line({
      type: "assistant",
      timestamp: at(30),
      message: { id: "m3", model: "claude-opus-5-5", usage: usage(500), content: [] },
    }),
  );
  age(proj);
  const res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 1);
  assert.ok(fs.readFileSync(statsFile, "utf8").startsWith(before), "existing lines changed");
  assert.equal(readLedger(statsFile).filter((r) => r.key === `claude-code:${sid}`).length, 2);
});

await test("a chat changed inside the settle window is written as open, then again once settled", async () => {
  fs.appendFileSync(path.join(proj, `${sid}.jsonl`), "\n");
  let res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 1);
  assert.equal(res.byPlatform["claude-code"].open, 1);
  assert.equal(res.rows[0].scan.settled, false);
  assert.ok(
    res.rows[0].time.lastActivity > res.rows[0].time.end - 1,
    "time.lastActivity = the last write",
  );
  res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 0, "still open, same size: nothing new");
  age(proj);
  res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 1, "settled since: one more row");
  assert.equal(res.rows[0].scan.settled, true);
});

await test("codex: $bkit-build, parentSha, failed command, duplicate token event, subagent folded in", async () => {
  makeCodex(home, repoDir);
  const res = await scanHosts(["codex"]);
  assert.equal(res.byPlatform.codex.found, 1);
  const row = rowOf(`codex:${CODEX_ID}`);
  assert.deepEqual(row.bkit.workflows, ["build"]);
  assert.equal(row.issue.id, issueFp("acme/widget", 652));
  assert.deepEqual(row.run.parentShas, [SHA2]);
  assert.equal(row.usage.total.turns, 3, "the repeated token_count is one turn");
  assert.equal(row.usage.byModel["gpt-5.5-codex"].tokens.read, 22500);
  assert.equal(row.usage.total.tokens.cacheRead, 19000);
  assert.equal(row.agents.byAgent.explorer.n, 1);
  assert.equal(row.tools.byTool.exec_command.errors, 1);
  assert.deepEqual(row.tools.byTool.exec_command.byCategory, { "bkit cli": 1, "test runner": 1 });
  assert.equal(row.usage.total.compactions, 1);
  assert.equal(row.session.prompts, 1, "the injected <skill> message is not a prompt");
  assert.equal(row.session.hostVersion, "0.146.0");
  assert.deepEqual(validateTotals(row), { ok: true });
});

await test(
  "opencode: expanded command, exit code, subagent, fork counts only its own messages",
  async () => {
    makeOpencode(home, repoDir);
    const res = await scanHosts(["opencode"]);
    assert.equal(res.byPlatform.opencode.found, 2);
    const root = rowOf("opencode:ses_root");
    assert.deepEqual(root.bkit.workflows, ["design"]);
    assert.equal(root.issue.id, issueFp("acme/widget", 653));
    assert.deepEqual(root.issue.mentioned, [], "the expanded template's text is not the human's");
    assert.equal(root.usage.byModel["anthropic/claude-opus-5.5"].tokens.read, 10000);
    assert.equal(root.agents.byAgent["bkit-design-generate"].n, 1);
    assert.equal(root.tools.byTool.shell.errors, 1);
    assert.equal(root.bkit.cli.byVerb["steps finish"], 1);
    assert.deepEqual(root.effort, { max: 2 });
    assert.deepEqual(validateTotals(root), { ok: true });
    const fork = rowOf("opencode:ses_fork");
    assert.equal(fork.usage.total.turns, 1);
    assert.deepEqual(fork.bkit.workflows, []);
    assert.deepEqual(fork.issue.mentioned, [issueFp("acme/widget", 654)]);
    assert.equal(fork.usage.total.compactions, 1);
  },
  { needsSqlite: true },
);

await test(
  "cursor: no token counts, command block, MCP naming, rejected call, subagent, archived transcript",
  async () => {
    makeCursor(home, repoDir);
    const res = await scanHosts(["cursor"]);
    assert.equal(res.byPlatform.cursor.found, 2);
    const row = rowOf("cursor:cur-root");
    assert.equal(row.scan.tokensRecorded, false);
    assert.deepEqual(row.bkit.workflows, ["ship"]);
    assert.equal(row.issue.id, issueFp("acme/widget", 655));
    assert.equal(row.session.prompts, 1);
    assert.deepEqual(row.tools.byTool["mcp__github"], { calls: 1, errors: 1 });
    assert.equal(row.bkit.cli.byVerb["workflows close"], 1);
    assert.equal(row.usage.byModel["claude-opus-5-5-high-fast"].turns, 2);
    assert.equal(row.agents.byAgent.explore.n, 1);
    assert.equal(row.repo, repoFp("acme/widget"));
    assert.deepEqual(validateTotals(row), { ok: true });
    const old = rowOf("cursor:cur-old");
    assert.equal(old.usage.total.turns, 1);
    assert.equal(old.tools.byTool.Shell.calls, 1);
    assert.equal(old.tools.byTool.Shell.byCategory.git, 1);
    assert.equal(old.issue.id, fingerprintNone(656));
  },
  { needsSqlite: true },
);

await test(
  "antigravity: tokens per model call, exit code, and the host folder is left untouched",
  async () => {
    const dir = makeAntigravity(home, repoDir);
    const before = fs.readdirSync(dir).sort();
    const res = await scanHosts(["antigravity"]);
    assert.equal(res.byPlatform.antigravity.appended, 1);
    const row = rowOf("antigravity:ag-1");
    assert.deepEqual(row.bkit.workflows, ["debug"]);
    assert.equal(row.usage.total.turns, 2);
    assert.equal(row.usage.byModel["gemini-3.8-flash-n"].tokens.read, 10200);
    assert.equal(row.usage.total.tokens.output, 100);
    assert.deepEqual(row.tools.byTool.run_command, {
      calls: 1,
      errors: 1,
      byCategory: { "test runner": 1 },
    });
    assert.deepEqual(validateTotals(row), { ok: true });
    assert.deepEqual(
      fs.readdirSync(dir).sort(),
      before,
      "reading created files beside the database",
    );
  },
  { needsSqlite: true },
);

await test("the report resolves names, links the chat to its outcome row exactly, and breaks down by platform and model", () => {
  const rows = readLedger(statsFile);
  const names = new Map([
    [repoFp("acme/widget"), "widget"],
    [issueFp("acme/widget", 650), "widget#650"],
  ]);
  const md = renderReport(rows, names, T0 + DAY);
  assert.equal(chatClass(rowOf(`claude-code:${sid}`)), "workflow");
  assert.match(md, /\| widget \| widget#650 \| workflow \| plan \| 5\.5\.1 \|/);
  assert.match(md, /1 outcome/);
  assert.match(md, /12 lines, 10 min \|/, "the schema-1 outcome row's task count is not read");
  assert.match(md, /2026-W43/);
  assert.match(md, /## By platform/);
  assert.match(md, /\| claude-code \| 1 \|/);
  assert.match(md, /## By model/);
  assert.match(md, /\| claude-opus-5-5 \| [^|]*anthropic\/claude-opus-5\.5[^|]*\|/);
});

// Chat-row shape: workflow named only in a summary, context limits, tool mix ---------------------

/** Tally-shaped counts for chatRow, with the fields it reads. */
function counts(over = {}) {
  return {
    cwd: null,
    start: T0,
    end: T0 + 60_000,
    hostVersion: null,
    entrypoint: null,
    models: {},
    effort: {},
    workflows: [],
    summaryCmds: [],
    mentions: [],
    parentShas: [],
    turns: 1,
    userPrompts: 1,
    compactions: 0,
    tokens: {
      input: 0,
      cacheWrite: 0,
      cacheRead: 0,
      output: 0,
      outputEst: 0,
      read: 0,
      contextStart: 0,
      contextPeak: 0,
      contextAt10: null,
    },
    tools: {},
    bash: {},
    bashByTool: {},
    bkitCli: {},
    filesRead: 0,
    bkitVersionSeen: null,
    slugHint: null,
    ...over,
  };
}

await test("toolMix counts each host's tool names and the shell commands by what they did", () => {
  const mix = toolMix(
    counts({
      tools: {
        Read: { calls: 3, errors: 0 },
        Edit: { calls: 2, errors: 0 },
        write: { calls: 1, errors: 0 },
        Grep: { calls: 4, errors: 0 },
        Glob: { calls: 1, errors: 0 },
        mcp__serena: { calls: 5, errors: 0 },
        Bash: { calls: 9, errors: 0 },
      },
      bash: { "grep / rg": 2, "sed / cat / head / tail": 3, "find / ls": 1, "test runner": 4 },
    }),
  );
  assert.deepEqual(mix, {
    read: 3,
    edit: 3,
    grep: 6,
    shellRead: 3,
    shellList: 2,
    tests: 4,
    serena: 5,
  });
});

await test("a workflow named only in the host's summary keeps the issue but is not a workflow run", () => {
  const context = (peak) => ({
    ...counts().tokens,
    read: peak,
    cacheRead: peak,
    contextPeak: peak,
  });
  const row = chatRow(
    "claude-code",
    "s1",
    counts({ summaryCmds: [["build", 650]] }),
    [
      { agentType: "bkit-build-plan-verify", counts: counts({ tokens: context(130_000) }) },
      { agentType: "bkit-build-plan-verify", counts: counts({ tokens: context(210_000) }) },
    ],
    { slug: "acme/widget", root: null },
    [],
    { files: 1, bytes: 10 },
  );
  assert.equal(row.issue.source, "summary");
  assert.equal(row.issue.id, issueFp("acme/widget", 650));
  assert.deepEqual(row.bkit.via, ["subagent"]);
  assert.equal(chatClass(row), "bkit agents only");
  assert.deepEqual(row.agents.byAgent["bkit-build-plan-verify"].instances, [
    { turns: 1, contextPeak: 130_000, contextAt10: null },
    { turns: 1, contextPeak: 210_000, contextAt10: null },
  ]);
  assert.equal(row.usage.total.context.peak, 210_000);
  assert.deepEqual(validateTotals(row), { ok: true });
});

// Run logs: a plan run and two build runs of one feature, in the main checkout and a worktree ----

const FID = "650-secret-feature";
const logDir = path.join(repoDir, "docs", "plans", "202610", "logs", FID);
const status = (min, type, extra = {}) => line({ type, at: at(min), ...extra });
const step = (min, wf, name, extra = {}) =>
  status(min, "step-done", { workflow: wf, step: name, status: "DONE", ...extra });
const CLOSE_SHA = "c".repeat(40);
const BUILD_SHA = "b".repeat(40);

function makeRunLogs() {
  fs.mkdirSync(logDir, { recursive: true });
  const rows = [
    status(100, "workflow-started", { workflow: "plan", parentSha: SHA2 }),
    step(110, "plan", "plan-generate", { attempt: 1 }),
    step(112, "plan", "plan-complexity-check", { verdict: "SPLIT" }),
    step(120, "plan", "plan-close-workflow", { parentSha: CLOSE_SHA }),
    status(120, "workflow-done", { workflow: "plan" }),
    status(200, "workflow-started", { workflow: "build", parentSha: SHA2 }),
    step(201, "build", "build-task-red", { subPlan: 1 }),
    step(202, "build", "build-task-red", { subPlan: 1 }),
    step(210, "build", "build-plan-execute", { subPlan: 1, attempt: 1, verdict: "PASS" }),
    step(215, "build", "build-plan-verify", {
      subPlan: 1,
      attempt: 1,
      verdict: "FAIL",
      failures: 2,
    }),
    step(220, "build", "build-plan-verify", {
      subPlan: 1,
      attempt: 2,
      verdict: "FAIL",
      failures: 20,
    }),
    status(221, "workflow-failed", { workflow: "build" }),
    step(225, "build", "build-task-red", { subPlan: 1 }),
    status(300, "workflow-started", { workflow: "build", parentSha: SHA2 }),
    step(310, "build", "build-plan-verify", {
      subPlan: 1,
      attempt: 1,
      verdict: "FAIL",
      failures: 2,
    }),
    step(320, "build", "build-plan-gaps-remediate", {
      subPlan: 1,
      attempt: 1,
      verdict: "PASS",
      strategy: "STANDARD",
    }),
    step(330, "build", "build-plan-verify", {
      subPlan: 1,
      attempt: 2,
      verdict: "PASS",
      failures: 0,
    }),
    step(340, "build", "build-challenge", { verdict: "CONCERNS" }),
    step(345, "build", "build-challenge-reconcile", { verdict: "CONCERNS" }),
    status(350, "workflow-done", { workflow: "build" }),
    step(352, "build", "build-close-workflow", { parentSha: BUILD_SHA }),
  ];
  fs.writeFileSync(path.join(logDir, "status.jsonl"), rows.join(""));
  // The plan the complexity check read: 13 tasks, one with 6 tests.
  const task = (n, tests) =>
    `- [ ] **Task ${n}:** Do ${n}. **Done when:** ok. **Test first:** ${
      tests
        ? Array.from(
            { length: tests },
            (_, i) => `\`t/${i % 2}.test.ts\` \`case ${i}\` fails`,
          ).join("; ")
        : "n/a — docs only"
    }\n`;
  fs.writeFileSync(
    path.join(logDir, "plan-v3-checked.md"),
    Array.from({ length: 13 }, (_, i) => task(i + 1, i === 0 ? 6 : 1)).join(""),
  );
  fs.writeFileSync(path.join(logDir, "plan-v4-1.md"), task(1, 6) + task(2, 0));
  fs.writeFileSync(
    path.join(logDir, "plan-v4-2.md"),
    "- [ ] **T3 — Older shape.**\n  - **Test first:**\n    - `t/2.test.ts` `a` fails\n    - `t/3.test.ts` `b` fails\n",
  );
  fs.writeFileSync(path.join(logDir, "plan-v4-split.md"), "index\n");
  fs.writeFileSync(
    path.join(logDir, "plan-complexity-check.md"),
    "Verdict: SPLIT\n\n## Session Fit Estimate\n\n13 tasks | over the 12 threshold.\nTask 1 names 6 tests.\n\n## Rationale\n\nSplit.\n",
  );
  /** Write a log file last changed at `min` minutes. */
  const written = (file, min, text) => {
    fs.writeFileSync(path.join(logDir, file), text);
    fs.utimesSync(path.join(logDir, file), ms(min) / 1000, ms(min) / 1000);
  };
  // Overwritten by the second build: matches its attempt-1 round, not the first build's.
  written(
    "build-plan-verify-1-1.md",
    312,
    "Verdict: FAIL\nFailures: 2\n\nTask 1: `t/0.test.ts` `case 0` — late-red — not fixable\n",
  );
  // The first build's round 2, in the older gap format; the line naming round 1 is history.
  written(
    "build-plan-verify-1-2.md",
    219,
    "Verdict: FAIL\nFailures: 20\n\n- `build-plan-verify-1-1.md` — `FAIL`, Failures 2: G9 Task 1 `late-red` x1.\n" +
      "- G1 (Task 11, not fixable): test-first audit `build-tests-green-1-2.md` `no-red` x20 — code first.\n",
  );
  written(
    "build-challenge.md",
    346,
    "# Build Challenge\n\n## Findings\n\n### 1. HIGH — x\n### F2 — `MEDIUM` · y\n### BC3 — LOW · z\n## Reconciliation Notes\n",
  );
  // A worktree's older copy of the same log: the main checkout's longer one wins.
  const wt = path.join(repoDir, ".worktrees", "other", "docs", "plans", "202610", "logs", FID);
  fs.mkdirSync(wt, { recursive: true });
  fs.writeFileSync(path.join(wt, "status.jsonl"), rows.slice(0, 5).join(""));
}

await test("planTasks reads both task shapes, `;` and bulleted Test first, and n/a", () => {
  const p = planTasks(
    "- [ ] **Task 1:** a. **Test first:** `x.test.ts` `one` fails; `y.test.ts` `two` fails\n" +
      "- [x] **Task 2 — b.** **Test first:** n/a — docs only\n" +
      "- [ ] **T3 — c.**\n  - **Done when:** ok\n  - **Test first:**\n    - `x.test.ts` `three` fails\n" +
      "- [ ] **Acceptance Scenario confirmed:** not a task\n",
  );
  assert.deepEqual(p, { tasks: 3, tests: [2, 0, 1], testFiles: [2, 0, 1], withField: 3 });
  assert.equal(planTasks("- [ ] **Task 1:** no field\n").withField, 0);
});

await test("splitRuns keeps a close step written after the end row in its run", () => {
  makeRunLogs();
  const runs = splitRuns(readLedger(path.join(logDir, "status.jsonl")));
  assert.deepEqual(
    runs.map((r) => [r.workflow, r.end?.type, r.afterEnd]),
    [
      ["plan", "workflow-done", 0],
      ["build", "workflow-failed", 1],
      ["build", "workflow-done", 0],
    ],
  );
  assert.equal(runs[2].rows.at(-1).step, "build-close-workflow");
  const closeFailed = splitRuns([
    { type: "workflow-started", workflow: "build", at: at(0) },
    { type: "workflow-done", workflow: "build", at: at(1) },
    { type: "step-done", workflow: "build", step: "build-close-workflow", at: at(2) },
    { type: "workflow-failed", workflow: "build", at: at(3) },
  ]);
  assert.equal(closeFailed[0].end.type, "workflow-failed", "the last end row wins");
  assert.deepEqual(runLogDirs(repoDir), [logDir]);
});

await test("endingOf: a failure only at close is close-failed; a later close that starts CI is done", () => {
  const close = (n, outcome) => ({
    type: "step-done",
    workflow: "build",
    step: "build-close-workflow",
    at: at(n),
    ciDispatch: {
      outcome,
      attempts: 12,
      reason: outcome === "unresolved" ? "ci-declared-no-run" : undefined,
    },
  });
  const work = [
    { type: "workflow-started", workflow: "build", at: at(0) },
    { type: "workflow-done", workflow: "build", at: at(1) },
    { type: "step-done", workflow: "build", step: "build-create-pr", at: at(2) },
    close(3, "unresolved"),
    { type: "workflow-failed", workflow: "build", at: at(4) },
  ];
  const ending = (rows) => endingOf(splitRuns(rows)[0], logDir, 1);
  assert.equal(ending(work), "close-failed");
  assert.equal(ending([...work, close(20, "dispatched")]), "done", "the later close wins");
  assert.equal(ending([...work, close(20, "unresolved")]), "close-failed");
  assert.equal(
    ending(work.slice(0, 4)),
    "close-failed",
    "CI never started at close, even with no failed row after it",
  );
  assert.equal(
    ending([work[0], { type: "workflow-failed", workflow: "build", at: at(1) }]),
    "failed",
    "a failure before any done row is the work's",
  );
});

await test("scan appends one run row per finished run, with fingerprints and no FID text", async () => {
  const res = await scan({
    hosts: hostsFor(home, ["claude-code"]),
    statsFile,
    settleHours: 24,
    checkout: repoDir,
  });
  const runs = res.rows.filter((r) => r.kind === "run");
  assert.equal(runs.length, 3);
  assert.equal(res.runs.appended, 3);
  const [plan, b1, b2] = runs;
  const fid = fingerprint(`acme/widget:${FID}`);
  assert.equal(plan.schema, 3);
  assert.equal(plan.key, `${fid}:plan:${ms(100)}`);
  assert.deepEqual(plan.by, { workflow: "plan", step: "scan" });
  assert.deepEqual(plan.bkit, { version: "5.5.1" });
  assert.deepEqual(plan.run, {
    fid,
    issue: issueFp("acme/widget", 650),
    n: 1,
    parentSha: CLOSE_SHA,
    parentShas: [SHA2, CLOSE_SHA],
  });
  assert.equal(plan.ending, "done");
  assert.deepEqual(plan.steps.byStep["plan-generate"], {
    n: 1,
    totalMinutes: 10,
    activeMinutes: null,
  });
  assert.deepEqual(plan.steps.total, { n: 3, totalMinutes: 20, activeMinutes: null });
  assert.deepEqual(plan.time, {
    start: ms(100),
    end: ms(120),
    totalMinutes: 20,
    activeMinutes: null,
    activeFrom: null,
    lastActivity: ms(120),
  });
  assert.equal(plan.time.activeMinutes, null, "no counted chat ran this issue during the run");
  assert.deepEqual(plan.plan, {
    source: "file",
    total: { tasks: 3, kb: 0 },
    subPlans: [
      {
        kb: 0,
        tasks: [
          { tests: 6, testFiles: 2 },
          { tests: 0, testFiles: 0 },
        ],
      },
      { kb: 0, tasks: [{ tests: 2, testFiles: 2 }] },
    ],
    complexity: { verdict: "SPLIT", tasksChecked: 13 },
  });
  assert.deepEqual(plan.scan, { rows: 5, afterEnd: 0, settled: true });
  assert.ok(!("lines" in plan) && !("build" in plan), "a plan run writes no code");
  assert.equal(b1.ending, "failed");
  assert.equal(b1.build.redTests, 2);
  assert.equal(b1.steps.byStep["build-task-red"].n, 2);
  assert.deepEqual(
    b1.build.verify.map((v) => [v.attempt, v.verdict, v.testOrderGaps]),
    [
      [1, "FAIL", null],
      [2, "FAIL", 20],
    ],
    "round 1's report was overwritten by the second build; round 2's was written during the first",
  );
  assert.equal(b1.lines, null, "git does not have the run's commits");
  assert.ok(!("challenge" in b1.build), "no challenge ran");
  assert.equal(b2.run.n, 2);
  assert.equal(b2.run.parentSha, BUILD_SHA);
  assert.deepEqual(
    b2.build.verify.map((v) => [v.attempt, v.verdict, v.testOrderGaps]),
    [
      [1, "FAIL", 1],
      [2, "PASS", null],
    ],
  );
  assert.deepEqual(b2.build.gapsRemediate, [
    { subPlan: 1, attempt: 1, verdict: "PASS", strategy: "STANDARD" },
  ]);
  assert.deepEqual(b2.build.challenge, {
    verdict: "CONCERNS",
    findings: { total: 3, CRITICAL: 0, HIGH: 1, MEDIUM: 1, LOW: 1 },
  });
  for (const r of runs) {
    assert.ok(!JSON.stringify(r).includes("secret"), "row contains the FID text");
    assert.deepEqual(validateTotals(r), { ok: true });
  }
});

await test("a run without an end row is written as open, then settles as stopped or paused", async () => {
  const scanRunsNow = (now) =>
    scan({ hosts: [], statsFile, settleHours: 24, checkout: repoDir, now, dryRun: true });
  let res = await scanRunsNow(Date.now());
  assert.equal(res.runs.unchanged, 3);
  fs.appendFileSync(
    path.join(logDir, "status.jsonl"),
    status(400, "workflow-started", { workflow: "build" }) +
      step(410, "build", "build-plan-verify"),
  );
  res = await scanRunsNow(ms(420));
  const open = res.rows.filter((r) => r.kind === "run" && r.time.start === ms(400));
  assert.deepEqual(
    open.map((r) => [r.ending, r.scan.settled, r.time.lastActivity]),
    [["stopped", false, ms(410)]],
    "an open run is written, marked open",
  );
  res = await scanRunsNow(ms(420) + 2 * DAY);
  assert.deepEqual(
    res.rows.filter((r) => r.kind === "run").map((r) => [r.ending, r.scan.settled]),
    [["stopped", true]],
  );
  fs.writeFileSync(path.join(logDir, "build-decision-3-1.md"), "Status: OPEN\nFrom: verify\n");
  res = await scanRunsNow(ms(420) + 2 * DAY);
  assert.equal(res.rows.find((r) => r.kind === "run").ending, "decision-pause");
});

await test("the report shows token types, agents, features, the verify loop, plan shape and step minutes", () => {
  fs.appendFileSync(
    statsFile,
    line({
      ts: ms(352),
      kind: "outcome",
      repo: "acme/widget",
      bkitVersion: "5.5.1",
      workflow: "build",
      step: "build-close-workflow",
      parentSha: BUILD_SHA,
      linesAdded: 150,
      linesDeleted: 50,
      linesChanged: 200,
      filesChanged: 4,
      taskCount: 3,
      durationSeconds: 3000,
      deferrals: 0,
      failures: 0,
    }),
  );
  const names = new Map([
    [repoFp("acme/widget"), "widget"],
    [issueFp("acme/widget", 650), "widget#650"],
    [fingerprint(`acme/widget:${FID}`), FID],
  ]);
  const md = renderReport(
    readLedger(statsFile),
    names,
    T0 + DAY,
    new Map([[fingerprint(`acme/widget:${FID}`), logDir]]),
  );
  assert.match(md, /### Tokens by type, by week/);
  assert.match(md, /\| Fresh input, M \| Cache written, M \| Cache read, M \| Cache-read share \|/);
  assert.match(md, /## Agents/);
  assert.match(md, /\| bkit-plan-generate \| 1 \|/);
  assert.match(md, /## By feature/);
  assert.match(md, /\| widget#650 \| 650-secret-feature \| plan, build×2 \|/);
  assert.match(
    md,
    /\| - \| 3 \| - \| - \| [\d.]+ \| - \| 3 \| - \|/,
    "active minutes, tasks, code lines, test lines, per task, per 100 lines, FAIL rounds",
  );
  assert.match(
    md,
    /\| 650-secret-feature \| 5\.5\.1 \| done \| 52 \| - \| 1: F2 P0 \| 1: 1 - \| 1 standard \| - \| CONCERNS \| 0\/1\/1\/1 \| - \|/,
  );
  assert.match(md, /\| failed \| 21 \| - \| 1: F2 F20 \| 1: - 20 \|/);
  assert.match(
    md,
    /\| 650-secret-feature \| 5\.5\.1 \| 0 \| - \| 2 \| 3 \| 2 \/ 6 \/ 6 \| 0:1 2:1 6:1 \| 2 \/ 2 \/ 2 \| 0:1 2:2 \| 1 \| SPLIT \| 13 tasks \\\| over the 12 threshold\. Task 1 names 6 tests\. \|/,
  );
  assert.match(md, /#### build \(2 runs, 0 with active minutes\)/);
  assert.match(md, /\| Active minutes median \| Active minutes max \| Share of active time \|/);
});

await test("the plan shape report reads a group plan", () => {
  const planRun = structuredClone(
    readLedger(statsFile)
      .filter((r) => r.kind === "run" && r.schema === 3 && r.plan?.subPlans)
      .at(-1),
  );
  planRun.plan = {
    source: "file",
    total: { tasks: 3, kb: 5 },
    groups: [
      {
        tasks: [
          { tests: 3, testFiles: 2 },
          { tests: 0, testFiles: 0 },
        ],
      },
      { tasks: [{ tests: 1, testFiles: 1 }] },
    ],
  };
  planRun.ts += 1;
  const md = renderReport(
    [...readLedger(statsFile), planRun],
    new Map([[fingerprint(`acme/widget:${FID}`), FID]]),
    T0 + DAY,
  );
  assert.match(md, /\| Plan KB \| Groups \| Sub-plans \| Tasks \|/);
  assert.match(
    md,
    /\| 650-secret-feature \| 5\.5\.1 \| 5 \| 2 \| - \| 3 \| 1 \/ 3 \/ 3 \| 0:1 1:1 3:1 \| 1 \/ 2 \/ 2 \| 0:1 1:1 2:1 \| 1 \| - \| - \|/,
  );
});

// Active time ---------------------------------------------------------------------------------

await test("active spans end at a gap over 5 minutes, and subagent events fill the main chat's wait", () => {
  const s = (sec) => T0 + sec * 1000;
  assert.deepEqual(activeSpans([s(0), s(60), s(500), s(560), s(2000)]), [
    [s(0), s(60)],
    [s(500), s(560)],
  ]);
  assert.deepEqual(
    mergeSpans([
      [5, 9],
      [1, 6],
      [20, 30],
    ]),
    [
      [1, 9],
      [20, 30],
    ],
  );
  assert.equal(
    overlapMs(
      [
        [0, 10],
        [20, 30],
      ],
      5,
      25,
    ),
    10,
  );
  const row = chatRow(
    "claude-code",
    "s2",
    counts({ stamps: [s(0), s(120), s(1200)] }),
    [
      {
        agentType: "bkit-build-plan-execute",
        counts: counts({ stamps: [s(130), s(400), s(600)] }),
      },
    ],
    { slug: "acme/widget", root: null },
    [],
    { files: 1, bytes: 10 },
  );
  assert.deepEqual(row.time.spans, [[s(0), s(600)]]);
  assert.equal(row.time.activeMinutes, 10);
});

await test("a run's active minutes come from its issue's chats, per step, and a newly counted chat re-counts it", () => {
  const chat = {
    schema: 2,
    kind: "chat",
    key: "claude-code:x",
    issue: { id: null, all: [issueFp("acme/widget", 650)], mentioned: [], source: "command" },
    time: { start: ms(300), end: ms(360), spans: [[ms(300), ms(330)]] },
    scan: { files: 1, bytes: 10 },
  };
  // A chat row written without `schema`: read through normalize().
  const other = {
    kind: "chat",
    key: "claude-code:y",
    issues: [issueFp("acme/widget", 651)],
    start: ms(300),
    end: ms(360),
    active: [[ms(300), ms(330)]],
    sourceBytes: 10,
  };
  const rows = runRows(
    logDir,
    { slug: "acme/widget", root: repoDir },
    [],
    activityIndex([chat, other]),
  );
  const b2 = rows[2];
  assert.equal(b2.time.activeMinutes, 30);
  assert.deepEqual(b2.time.activeFrom, { chats: 1, bytes: 10 });
  assert.equal(b2.steps.byStep["build-plan-verify"].activeMinutes, 20, "300-310 and 320-330");
  assert.equal(b2.steps.byStep["build-plan-gaps-remediate"].activeMinutes, 10);
  assert.equal(
    b2.steps.byStep["build-challenge"].activeMinutes,
    0,
    "330-340 is after the chat's last span",
  );
  assert.equal(b2.steps.total.activeMinutes, 30);
  assert.equal(rows[1].time.activeMinutes, null, "the first build ran before the chat");
  const viaOld = runRows(
    logDir,
    { slug: "acme/widget", root: repoDir },
    [],
    activityIndex([{ ...other, issues: chat.issue.all }]),
  );
  assert.equal(viaOld[2].time.activeMinutes, 30, "a schema-1 chat row gives the same minutes");
  const res = scanRuns({
    roots: [repoDir],
    known: latestRows(readLedger(statsFile), "run"),
    settledBefore: Date.now(),
    chats: [chat],
  });
  const keys = res.rows.map((r) => r.key);
  assert.ok(keys.includes(b2.key), "the build its chat now covers is counted again");
  assert.ok(!keys.includes(rows[0].key), "the plan run is unchanged");
  // A migrated split-plan row: which sub-plan each task was in was not recorded.
  const known = latestRows(readLedger(statsFile), "run");
  const stored = known.get(rows[0].key);
  known.set(rows[0].key, {
    ...stored,
    plan: { ...stored.plan, subPlans: stored.plan.subPlans.map(() => ({ kb: null, tasks: null })) },
  });
  const again = scanRuns({ roots: [repoDir], known, settledBefore: Date.now(), chats: [chat] });
  assert.ok(
    again.rows.some((r) => r.key === rows[0].key),
    "a stored run whose sub-plan tasks are unknown is written again once the plan files give them",
  );
});

await test("a run's parentSha is its last workflow-done row's, else its last close step's, else null", () => {
  const DONE_SHA = "d".repeat(40);
  const LATER_SHA = "e".repeat(40);
  const dir = path.join(tmp, "join-sha", "651-join");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "status.jsonl"),
    [
      // The close commit lands after workflow-done, so the close step names a later commit.
      status(100, "workflow-started", { workflow: "design", parentSha: SHA2 }),
      status(110, "workflow-done", { workflow: "design", parentSha: CLOSE_SHA }),
      status(112, "workflow-done", { workflow: "design", parentSha: DONE_SHA }),
      step(115, "design", "design-close-workflow", { parentSha: LATER_SHA }),
      // No parentSha on the done row: the close step's.
      status(200, "workflow-started", { workflow: "design" }),
      status(210, "workflow-done", { workflow: "design" }),
      step(212, "design", "design-close-workflow", { parentSha: BUILD_SHA }),
      // Neither.
      status(300, "workflow-started", { workflow: "design" }),
      status(310, "workflow-done", { workflow: "design" }),
    ].join(""),
  );
  const rows = runRows(dir, { slug: "acme/widget", root: null }, []);
  assert.deepEqual(
    rows.map((r) => r.run.parentSha),
    [DONE_SHA, BUILD_SHA, null],
  );
  assert.ok(rows[0].run.parentShas.includes(LATER_SHA), "parentShas still names every commit");
});

// Lines from git, test-order gaps, split reasons ----------------------------------------------

await test("runLines counts the run's own commits by code, tests and docs, leaving out merged-in work and plans", () => {
  const dir = path.join(tmp, "lines-repo");
  fs.mkdirSync(dir, { recursive: true });
  const g = (...args) => {
    const r = spawnSync(
      "git",
      [
        "-C",
        dir,
        "-c",
        "user.name=t",
        "-c",
        "user.email=t@t",
        "-c",
        "commit.gpgsign=false",
        ...args,
      ],
      { encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  const put = (file, text) => {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    fs.writeFileSync(path.join(dir, file), text);
  };
  const commit = (msg) => {
    g("add", "-A");
    g("commit", "-q", "--no-verify", "-m", msg);
    return g("rev-parse", "HEAD");
  };
  g("init", "-q", "-b", "dev");
  put("README.md", "x\n");
  commit("base");
  g("checkout", "-q", "-b", "feat");
  put("docs/plans/202610/logs/1-x/status.jsonl", "{}\n".repeat(100));
  const first = commit("start");
  put("src/a.ts", "1\n2\n3\n");
  put("src/a.test.ts", "t\nt\n");
  put("docs/notes.md", "n\n");
  put(".bkit/stats.jsonl", "{}\n");
  commit("code");
  g("checkout", "-q", "dev");
  put("src/other.ts", "o\n".repeat(50));
  commit("someone else's work");
  g("checkout", "-q", "feat");
  g("merge", "-q", "--no-edit", "dev");
  put("src/a.ts", "1\n2\nthree\n");
  const last = commit("fix");
  assert.deepEqual(runLines(dir, [first, last]), {
    total: { added: 7, deleted: 1, changed: 8, files: 4 },
    code: { added: 4, deleted: 1, files: 2 },
    tests: { added: 2, deleted: 0, files: 1 },
    docs: { added: 1, deleted: 0, files: 1 },
    merges: 1,
  });
  assert.equal(runLines(dir, [last, first]), null, "not an ancestor");
  assert.equal(runLines(dir, [first, "f".repeat(40)]), null, "a commit git does not have");
  assert.deepEqual(
    ["src/a.ts", "src/a.test.ts", "tests/x.py", "pkg/x_test.go", "docs/x.ts", "README.md"].map(
      lineClass,
    ),
    ["code", "tests", "tests", "tests", "docs", "docs"],
  );
});

await test("testOrderGaps reads the current and the older report format, and only the round's own gaps", () => {
  assert.equal(
    testOrderGaps(
      "Task 1: `a.test.ts` `x` — no-red — not fixable\nTask 2: `b` — late-red — not fixable\n",
    ),
    2,
  );
  assert.equal(
    testOrderGaps(
      "- `build-plan-verify-1-1.md` — `FAIL`, Failures 21: G1 Task 11 `no-red` x20.\n" +
        "- G1 (Task 11, not fixable): test-first `no-red` x20 stands.\n" +
        "- G2 (Task 2, not fixable): `test-changed` assertion rewritten.\n" +
        "- G3 (Task 4, fixable): missing export.\n",
    ),
    21,
  );
});

await test("plan shape stores every task's numbers and judges none; the reason is the check's own", () => {
  const dir = path.join(tmp, "old-check");
  fs.mkdirSync(dir, { recursive: true });
  const many =
    "- [ ] **Task 1:** a. **Test first:** " +
    Array(8).fill("`t.test.ts` `x` fails").join("; ") +
    "\n";
  fs.writeFileSync(path.join(dir, "plan-v3-checked.md"), many);
  fs.writeFileSync(path.join(dir, "plan-v4-1.md"), many);
  fs.writeFileSync(path.join(dir, "plan-complexity-check.md"), "Verdict: SPLIT\n\nTwo domains.\n");
  const shape = planShape(dir);
  assert.deepEqual(shape.subPlans, [{ kb: 0, tasks: [{ tests: 8, testFiles: 1 }] }]);
  assert.deepEqual(shape.total, { tasks: 1, kb: 0 });
  assert.deepEqual(shape.complexity, { verdict: "SPLIT", tasksChecked: 1 });
  assert.equal(checkReason(dir), null, "no Session Fit Estimate section: no reason");
  assert.ok(!/SPLIT_|CTX_LIMITS/.test(fs.readFileSync(SCRIPT, "utf8")), "no limit in the script");
});

await test("plan marker and fence regexes are the TS parser's", () => {
  const parser = fs.readFileSync(
    new URL("../../.bkit/core/engine/commands/workflow/plan-blocks.ts", import.meta.url),
    "utf8",
  );
  const copied = (name) => parser.match(new RegExp(`^const ${name} = (/.*/[a-z]*);$`, "m"))?.[1];
  assert.equal(String(PLAN_MARKER), copied("MARKER"));
  assert.equal(String(PLAN_FENCE), copied("FENCE"));
});

/** A build run of `step-done` rows, as splitRuns gives it. */
const buildRun = (...rows) => ({
  rows: rows.map((r) => ({ type: "step-done", workflow: "build", ...r })),
});

await test("buildFacts keys verify rounds by group", () => {
  const dir = path.join(tmp, "group-build");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "build-plan-verify-2-1.md"),
    "Verdict: FAIL\nFailures: 1\n\nTask 4: `a.test.ts` `one` — no-red — not fixable\n",
  );
  const b = buildFacts(
    buildRun(
      { step: "build-plan-verify", group: 2, attempt: 1, verdict: "FAIL", failures: 1 },
      { step: "build-plan-gaps-remediate", group: 2, attempt: 1, verdict: "PASS", strategy: "STANDARD" },
    ),
    dir,
    true,
    [0, Infinity],
  );
  assert.deepEqual(b.verify, [
    { group: 2, attempt: 1, verdict: "FAIL", failures: 1, testOrderGaps: 1 },
  ]);
  assert.deepEqual(b.gapsRemediate, [
    { group: 2, attempt: 1, verdict: "PASS", strategy: "STANDARD" },
  ]);
});

await test("buildFacts still reads an old subPlan run", () => {
  const dir = path.join(tmp, "sub-plan-build");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "build-plan-verify-1-2.md"),
    "Verdict: FAIL\nFailures: 1\n\nTask 1: `a.test.ts` `one` — late-red — not fixable\n",
  );
  const b = buildFacts(
    buildRun(
      { step: "build-plan-verify", subPlan: 1, attempt: 2, verdict: "FAIL", failures: 1 },
      { step: "build-plan-gaps-remediate", subPlan: 1, attempt: 2, verdict: "PASS", strategy: "STANDARD" },
    ),
    dir,
    true,
    [0, Infinity],
  );
  assert.deepEqual(b.verify, [
    { subPlan: 1, attempt: 2, verdict: "FAIL", failures: 1, testOrderGaps: 1 },
  ]);
  assert.deepEqual(b.gapsRemediate, [
    { subPlan: 1, attempt: 2, verdict: "PASS", strategy: "STANDARD" },
  ]);
});

await test("the build verify report groups rounds by group, and an old run's by sub-plan", () => {
  const buildRow = structuredClone(
    readLedger(statsFile)
      .filter((r) => r.kind === "run" && r.schema === 3 && r.build?.challenge)
      .at(-1),
  );
  buildRow.ts += 1;
  buildRow.build.verify = [
    { group: 1, attempt: 1, verdict: "PASS", failures: 0, testOrderGaps: null },
    { group: 2, attempt: 1, verdict: "FAIL", failures: 3, testOrderGaps: 1 },
    { group: 2, attempt: 2, verdict: "PASS", failures: 0, testOrderGaps: null },
  ];
  const md = renderReport(
    [...readLedger(statsFile), buildRow],
    new Map([[fingerprint(`acme/widget:${FID}`), FID]]),
    T0 + DAY,
  );
  assert.match(md, /\*\*Verify rounds\*\*: per group \(an old run's: per sub-plan\)/);
  assert.match(md, /\| 1: P0 · 2: F3 P0 \| 1: - · 2: 1 - \|/);
});

await test("planShape reads groups", () => {
  const dir = path.join(tmp, "groups-plan");
  fs.mkdirSync(dir, { recursive: true });
  const task = (n, ...body) => [
    `<!-- bkit:task ${n} start -->`,
    `- [ ] **TASK ${n}:** Task ${n}.`,
    ...body,
    `<!-- bkit:task ${n} end -->`,
  ];
  const plan = [
    "# Plan",
    "```",
    "<!-- bkit:group 9 start -->",
    "<!-- bkit:task 9 start -->",
    "- [ ] **TASK 9:** an example inside a fence, not a task",
    "<!-- bkit:task 9 end -->",
    "<!-- bkit:group 9 end -->",
    "```",
    "<!-- bkit:group 1 start -->",
    "### GROUP 1: One",
    ...task(
      1,
      "  - **DONE WHEN:** ok",
      "  - **TEST FIRST:**",
      "    - `a.test.ts` `one` fails on x",
      "    - `a.test.ts` `two` fails on y",
      "    - `b.test.ts` `three` fails on z",
    ),
    ...task(2, "  - **TEST FIRST:** n/a — docs only"),
    "<!-- bkit:group 1 end -->",
    "<!-- bkit:group 2 start -->",
    "### GROUP 2: Two",
    ...task(3, "  - **DONE WHEN:** no test field"),
    "<!-- bkit:group 2 end -->",
  ].join("\n");
  fs.writeFileSync(path.join(dir, "plan-v1-draft.md"), "# draft\n");
  fs.writeFileSync(path.join(dir, "plan-v2-reviewed.md"), plan);
  assert.deepEqual(planShape(dir), {
    source: "file",
    total: { tasks: 3, kb: 1 },
    groups: [
      {
        tasks: [
          { tests: 3, testFiles: 2 },
          { tests: 0, testFiles: 0 },
        ],
      },
      { tasks: [{ tests: null, testFiles: null }] },
    ],
  });
});

await test("planShape still reads an old sub-plan run", () => {
  const dir = path.join(tmp, "old-sub-plans");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "plan-v3-checked.md"),
    "- [ ] **Task 1:** a.\n- [ ] **Task 2:** b.\n- [ ] **Task 3:** c.\n",
  );
  fs.writeFileSync(
    path.join(dir, "plan-v4-1.md"),
    "- [ ] **Task 1:** a. **Test first:** `x.test.ts` `one` fails; `y.test.ts` `two` fails\n" +
      "- [ ] **Task 2:** b. **Test first:** n/a — docs only\n",
  );
  fs.writeFileSync(
    path.join(dir, "plan-v4-2.md"),
    "- [ ] **Task 3:** c. **Test first:** `z.test.ts` `three` fails\n",
  );
  fs.writeFileSync(path.join(dir, "plan-complexity-check.md"), "Verdict: SPLIT\n");
  assert.deepEqual(planShape(dir), {
    source: "file",
    total: { tasks: 3, kb: 0 },
    subPlans: [
      {
        kb: 0,
        tasks: [
          { tests: 2, testFiles: 2 },
          { tests: 0, testFiles: 0 },
        ],
      },
      { kb: 0, tasks: [{ tests: 1, testFiles: 1 }] },
    ],
    complexity: { verdict: "SPLIT", tasksChecked: 3 },
  });
});

await test("the report lists open runs, marked, and leaves them out of the medians", () => {
  const run = (start, minutes, settled) => ({
    ts: start,
    kind: "run",
    repo: repoFp("acme/widget"),
    bkitVersion: "5.5.1",
    workflow: "build",
    step: "scan",
    key: `k:${start}`,
    fid: fingerprint(`acme/widget:${FID}`),
    issue: issueFp("acme/widget", 650),
    run: 1,
    start,
    end: start + minutes * 60_000,
    lastActivityAt: start + minutes * 60_000,
    minutes,
    activeMinutes: null,
    activeFrom: null,
    ending: settled ? "done" : "stopped",
    steps: { "build-plan-execute": { n: 1, minutes, active: null } },
    closeCi: [],
    settled,
  });
  const md = renderReport(
    [
      ...readLedger(statsFile).filter((r) => r.kind === "chat"),
      run(T0, 100, true),
      run(T0 + DAY, 7, false),
    ],
    new Map([[fingerprint(`acme/widget:${FID}`), FID]]),
    T0 + 2 * DAY,
  );
  assert.match(md, /\| build \| 2 \| 1 \| 1 \| 0 \| 0 \| 0 \| 1 \| 100 \| 100 \|/);
  assert.match(md, /\| 650-secret-feature \(open\) \| 5\.5\.1 \| stopped \| 7 \|/);
  assert.match(
    md,
    /\| build-plan-execute \| 1 \| 1 \| 100\.0 \|/,
    "step medians use the settled run only",
  );
  assert.match(md, /\| build \(open\)|build×2 \(open\)/);
});

// Totals: validateTotals() refuses a row whose total does not match its parts -----------------

/** A written chat row and run row of this test run, to break one total at a time. */
const writtenChat = () => structuredClone(rowOf(`claude-code:${sid}`));
const writtenRun = () =>
  structuredClone(
    readLedger(statsFile)
      .filter((r) => r.kind === "run" && r.schema === 3 && r.build?.challenge)
      .at(-1),
  );
const refuses = (row, why) => {
  const v = validateTotals(row);
  assert.equal(v.ok, false, `accepted a row with a wrong ${why}`);
  assert.match(v.reason, new RegExp(why.replace(/[.*[\]]/g, "\\$&")));
};

await test("validateTotals accepts every row the scans wrote", () => {
  const written = readLedger(statsFile).filter((r) => r.schema === 3);
  assert.ok(written.length >= 8);
  for (const r of written) assert.deepEqual(validateTotals(r), { ok: true }, r.key);
});

await test("validateTotals refuses each kind of mismatched total", () => {
  let r = writtenRun();
  r.lines = {
    total: { added: 5, deleted: 1, changed: 6, files: 3 },
    code: { added: 1, deleted: 1, files: 1 },
    tests: { added: 1, deleted: 0, files: 1 },
    docs: { added: 2, deleted: 0, files: 1 },
    merges: 0,
  };
  refuses(structuredClone(r), "lines.total.added");
  r.lines.total = { added: 4, deleted: 2, changed: 6, files: 3 };
  refuses(structuredClone(r), "lines.total.deleted");
  r.lines.total = { added: 4, deleted: 1, changed: 5, files: 4 };
  refuses(structuredClone(r), "lines.total.files");
  r.lines.total = { added: 4, deleted: 1, changed: 6, files: 3 };
  refuses(structuredClone(r), "lines.total.changed");
  r.lines.total.changed = 5;
  assert.deepEqual(validateTotals(r), { ok: true });

  r = writtenRun();
  r.time.totalMinutes += 0.2;
  refuses(r, "time.totalMinutes");
  r = writtenRun();
  r.steps.total.n += 1;
  refuses(r, "steps.total.n");
  r = writtenRun();
  r.steps.total.totalMinutes += 0.1 * Object.keys(r.steps.byStep).length + 0.01;
  refuses(r, "steps.total.totalMinutes");
  r = writtenRun();
  r.steps.total.activeMinutes = 3;
  refuses(r, "steps.total.activeMinutes");
  r = writtenRun();
  r.build.redTests += 1;
  refuses(r, "build.redTests");
  r = writtenRun();
  r.build.challenge.findings.total = 4;
  refuses(r, "build.challenge.findings.total");
  r = writtenRun();
  r.plan = {
    source: "file",
    total: { tasks: 2, kb: 3 },
    subPlans: [{ kb: 3, tasks: [{ tests: 1, testFiles: 1 }] }],
  };
  refuses(structuredClone(r), "plan.total.tasks");
  r.plan.total = { tasks: 1, kb: 4 };
  refuses(r, "plan.total.kb");
  r = writtenRun();
  r.plan = {
    source: "file",
    total: { tasks: 2, kb: 3 },
    groups: [{ tasks: [{ tests: 1, testFiles: 1 }] }],
  };
  refuses(structuredClone(r), "plan.total.tasks");
  r.plan.total.tasks = 1;
  assert.deepEqual(validateTotals(r), { ok: true }, "a group plan's kb is the file's own");

  let c = writtenChat();
  c.time.activeMinutes += 1;
  refuses(c, "time.activeMinutes");
  c = writtenChat();
  c.usage.main.tokens.read += 1;
  refuses(c, "usage.main.tokens.read");
  c = writtenChat();
  c.usage.byModel["claude-opus-5-5"].tokens.read += 1;
  refuses(c, "usage.byModel.claude-opus-5-5.tokens.read");
  c = writtenChat();
  c.usage.total.turns += 1;
  refuses(c, "usage.total.turns");
  c = writtenChat();
  c.usage.total.tokens.output += 1;
  refuses(c, "usage.total.tokens.output");
  c = writtenChat();
  c.usage.total.compactions += 1;
  refuses(c, "usage.total.compactions");
  c = writtenChat();
  c.usage.total.context.peak += 1;
  refuses(c, "usage.total.context.peak");
  c = writtenChat();
  c.agents.total.n += 1;
  refuses(c, "agents.total.n");
  c = writtenChat();
  c.agents.total.errors += 1;
  refuses(c, "agents.total.errors");
  c = writtenChat();
  c.agents.byAgent["bkit-plan-generate"].instances.push({ turns: 1, contextPeak: 1 });
  refuses(c, "agents.byAgent.bkit-plan-generate.n");
  c = writtenChat();
  c.tools.total.calls += 1;
  refuses(c, "tools.total.calls");
  c = writtenChat();
  c.tools.total.errors += 1;
  refuses(c, "tools.total.errors");
  c = writtenChat();
  c.bkit.cli.total += 1;
  refuses(c, "bkit.cli.total");
});

await test("the writer skips a row that fails validateTotals and says why", () => {
  const good = writtenChat();
  const bad = writtenChat();
  bad.tools.total.calls += 1;
  const said = [];
  const kept = writableRows([good, bad], (m) => said.push(m));
  assert.deepEqual(kept, [good]);
  assert.equal(said.length, 1);
  assert.match(
    said[0],
    /^\[bkit-telemetry\] chat row claude-code:\S+ not written: tools\.total\.calls/,
  );
});

// normalize(): rows written without `schema` read in the schema-2 shape -----------------------

const OLD_CHAT = {
  ts: 1792722243262,
  kind: "chat",
  repo: "fp:55c170f293b3",
  bkitVersion: "5.5.1",
  workflow: "chat-stats",
  step: "scan",
  key: "claude-code:ece8",
  platform: "claude-code",
  sessionId: "ece8",
  bkitVersionSource: "repo-history",
  start: 1000,
  end: 61000,
  minutes: 1,
  activeMinutes: 0.5,
  active: [[1000, 31000]],
  hostVersion: "2.1.299",
  entrypoint: "sdk-cli",
  models: {
    m1: { turns: 2, read: 30, input: 1, cacheWrite: 9, cacheRead: 20, output: 4, outputEst: 5 },
  },
  effort: { high: 2 },
  bkit: true,
  bkitVia: ["subagent"],
  bkitKinds: ["build"],
  bkitWorkflows: [],
  issue: null,
  issueSource: "none",
  issues: [],
  mentioned: [],
  parentShas: [SHA],
  turns: 2,
  userPrompts: 1,
  compactions: 2,
  tokens: {
    input: 1,
    cacheWrite: 9,
    cacheRead: 20,
    output: 4,
    outputEst: 5,
    read: 30,
    ctxStart: 7,
    ctxPeak: 26,
  },
  tokensRecorded: true,
  main: {
    turns: 1,
    read: 10,
    input: 1,
    cacheWrite: 4,
    cacheRead: 5,
    output: 3,
    outputEst: 2,
    ctxPeak: 26,
    compactions: 1,
    mix: { read: 3, edit: 16, grep: 25, sedCat: 13, findLs: 0, tests: 8, serena: 0 },
  },
  subagents: 1,
  bkitSubagents: 1,
  otherSubagents: 0,
  agents: {
    "bkit-build-challenge-remediate": {
      n: 1,
      turns: 1,
      turnsMax: 1,
      read: 20,
      input: 0,
      cacheWrite: 5,
      cacheRead: 15,
      output: 1,
      outputEst: 3,
      ctxPeakMax: 20,
      ctxPeaks: [20],
      compactions: 1,
      errors: 3,
      mix: { read: 0, edit: 3, grep: 64, sedCat: 57, findLs: 0, tests: 33, serena: 0 },
    },
  },
  tools: { Bash: { calls: 5, errors: 3 }, Read: { calls: 3, errors: 0 } },
  bash: { git: 4, "grep / rg": 1 },
  bkitCli: { "steps finish": 9, status: 1 },
  filesRead: 3,
  errors: 3,
  sourceFiles: 2,
  sourceBytes: 5957523,
  lastActivityAt: 1792722243263,
  settled: false,
};

await test("normalize maps a schema-1 chat row into the schema-3 shape", () => {
  const n = normalize(OLD_CHAT);
  assert.deepEqual(n, {
    schema: 3,
    ts: 1792722243262,
    kind: "chat",
    key: "claude-code:ece8",
    repo: "fp:55c170f293b3",
    bkit: {
      version: "5.5.1",
      versionSource: "repo-history",
      via: ["subagent"],
      workflows: [],
      prompts: ["build"],
      cli: { total: 10, byVerb: { "steps finish": 9, status: 1 } },
    },
    by: { workflow: "chat-stats", step: "scan" },
    session: {
      platform: "claude-code",
      id: "ece8",
      hostVersion: "2.1.299",
      entrypoint: "sdk-cli",
      prompts: 1,
    },
    time: {
      start: 1000,
      end: 61000,
      totalMinutes: 1,
      activeMinutes: 0.5,
      spans: [[1000, 31000]],
      lastActivity: 1792722243263,
    },
    issue: { id: null, all: [], mentioned: [], source: "none" },
    run: { parentShas: [SHA] },
    effort: { high: 2 },
    usage: {
      total: {
        turns: 2,
        tokens: { input: 1, cacheWrite: 9, cacheRead: 20, output: 4, outputEst: 5, read: 30 },
        context: { start: 7, peak: 26 },
        compactions: 2,
      },
      main: {
        turns: 1,
        tokens: { input: 1, cacheWrite: 4, cacheRead: 5, output: 3, outputEst: 2, read: 10 },
        context: { peak: 26 },
        compactions: 1,
        mix: { read: 3, edit: 16, grep: 25, shellRead: 13, shellList: 0, tests: 8, serena: 0 },
      },
      byModel: {
        m1: {
          turns: 2,
          tokens: { input: 1, cacheWrite: 9, cacheRead: 20, output: 4, outputEst: 5, read: 30 },
        },
      },
    },
    agents: {
      total: { n: 1, errors: 3 },
      byAgent: {
        "bkit-build-challenge-remediate": {
          n: 1,
          errors: 3,
          instances: [{ turns: 1, contextPeak: 20 }],
          usage: {
            turns: 1,
            tokens: { input: 0, cacheWrite: 5, cacheRead: 15, output: 1, outputEst: 3, read: 20 },
            context: { peak: 20 },
            compactions: 1,
          },
          mix: { read: 0, edit: 3, grep: 64, shellRead: 57, shellList: 0, tests: 33, serena: 0 },
        },
      },
    },
    tools: {
      total: { calls: 8, errors: 3 },
      byTool: {
        Bash: { calls: 5, errors: 3, byCategory: { git: 4, "grep / rg": 1 } },
        Read: { calls: 3, errors: 0 },
      },
      filesRead: 3,
    },
    scan: { files: 2, bytes: 5957523, settled: false, tokensRecorded: true },
  });
  assert.equal(normalize(n), n, "a schema-3 row passes through unchanged");
  assert.equal(normalize({ ...OLD_CHAT, bkitVersion: "none" }).bkit.version, null);
  const two = normalize({
    ...OLD_CHAT,
    agents: {
      x: { ...OLD_CHAT.agents["bkit-build-challenge-remediate"], n: 2, ctxPeaks: [5, 20] },
    },
  });
  assert.deepEqual(
    two.agents.byAgent.x.instances,
    [
      { turns: null, contextPeak: 5 },
      { turns: null, contextPeak: 20 },
    ],
    "per-instance turns of a two-agent type were not stored",
  );
});

await test("a schema-2 chat row reads with context names", () => {
  const two = {
    schema: 2,
    kind: "chat",
    key: "claude-code:s2",
    usage: {
      total: { turns: 2, ctx: { start: 7, peak: 26 }, compactions: 0 },
      main: { turns: 1, ctx: { peak: 26 } },
      byModel: {},
    },
    agents: {
      total: { n: 1, errors: 0 },
      byAgent: { x: { n: 1, instances: [{ turns: 1, ctxPeak: 20 }], usage: { ctx: { peak: 20 } } } },
    },
  };
  const n = normalize(two);
  assert.equal(n.schema, 2, "it keeps its schema: it has no split across runs");
  assert.deepEqual(n.usage.total.context, { start: 7, peak: 26 });
  assert.deepEqual(n.usage.main.context, { peak: 26 });
  assert.equal("ctx" in n.usage.total, false);
  assert.deepEqual(n.agents.byAgent.x.instances, [{ turns: 1, contextPeak: 20 }]);
  assert.deepEqual(n.agents.byAgent.x.usage, { context: { peak: 20 } });
  assert.equal(two.usage.total.ctx.peak, 26, "the stored row is not changed");
  const renamed = normalize(n);
  assert.deepEqual(renamed.usage.total.context, { start: 7, peak: 26 }, "already renamed is kept");
});

await test("normalize maps a schema-1 run row, its plan and build facts", () => {
  const n = normalize({
    ts: 9,
    kind: "run",
    repo: "fp:r",
    bkitVersion: "5.4.0",
    workflow: "build",
    step: "scan",
    key: "fp:f:build:1",
    fid: "fp:f",
    issue: "fp:i",
    run: 1,
    start: 60000,
    end: 180000,
    lastActivityAt: 180000,
    minutes: 2,
    activeMinutes: 1.5,
    activeFrom: { chats: 1, bytes: 9 },
    ending: "close-failed",
    parentSha: SHA,
    closeCi: [{ outcome: "unresolved", reason: "ci-declared-no-run", attempts: 12 }],
    parentShas: [SHA2, SHA],
    steps: {
      "build-task-red": { n: 2, minutes: 0.5, active: 0.5 },
      "build-close-workflow": { n: 1, minutes: 1, active: null },
    },
    afterEnd: 3,
    lines: {
      code: { added: 4, deleted: 1, files: 2 },
      tests: { added: 2, deleted: 0, files: 1 },
      docs: { added: 1, deleted: 0, files: 1 },
      merges: 1,
    },
    verify: [{ subPlan: 1, attempt: 1, verdict: "PASS", failures: 0, testOrderGaps: 0 }],
    gapsRemediate: [],
    holistic: null,
    challenge: { verdict: "CONCERNS", findings: { CRITICAL: 0, HIGH: 0, MEDIUM: 1, LOW: 6 } },
    redTests: 2,
    sourceRows: 51,
    settled: true,
  });
  assert.deepEqual(n, {
    schema: 3,
    ts: 9,
    kind: "run",
    key: "fp:f:build:1",
    repo: "fp:r",
    bkit: { version: "5.4.0" },
    by: { workflow: "build", step: "scan" },
    run: { fid: "fp:f", issue: "fp:i", n: 1, parentSha: SHA, parentShas: [SHA2, SHA] },
    time: {
      start: 60000,
      end: 180000,
      totalMinutes: 2,
      activeMinutes: 1.5,
      activeFrom: { chats: 1, bytes: 9 },
      lastActivity: 180000,
    },
    ending: "close-failed",
    ci: [{ status: "unresolved", reason: "ci-declared-no-run", attempts: 12 }],
    steps: {
      total: { n: 3, totalMinutes: 1.5, activeMinutes: null },
      byStep: {
        "build-task-red": { n: 2, totalMinutes: 0.5, activeMinutes: 0.5 },
        "build-close-workflow": { n: 1, totalMinutes: 1, activeMinutes: null },
      },
    },
    lines: {
      total: { added: 7, deleted: 1, changed: 8, files: 4 },
      code: { added: 4, deleted: 1, files: 2 },
      tests: { added: 2, deleted: 0, files: 1 },
      docs: { added: 1, deleted: 0, files: 1 },
      merges: 1,
    },
    build: {
      verify: [{ subPlan: 1, attempt: 1, verdict: "PASS", failures: 0, testOrderGaps: 0 }],
      gapsRemediate: [],
      challenge: {
        verdict: "CONCERNS",
        findings: { total: 7, CRITICAL: 0, HIGH: 0, MEDIUM: 1, LOW: 6 },
      },
      redTests: 2,
    },
    scan: { rows: 51, afterEnd: 3, settled: true },
  });
  const planRun = (plan) =>
    normalize({ kind: "run", workflow: "plan", key: "k", start: 0, end: 0, plan }).plan;
  assert.deepEqual(
    planRun({
      kb: 12,
      subPlans: 1,
      tasks: 2,
      tasksWithoutTests: 1,
      testsPerTask: [3, 0],
      testFilesPerTask: [1, 0],
      complexity: { verdict: "SINGLE", tasksChecked: 2 },
    }),
    {
      source: "file",
      total: { tasks: 2, kb: 12 },
      subPlans: [
        {
          kb: 12,
          tasks: [
            { tests: 3, testFiles: 1 },
            { tests: 0, testFiles: 0 },
          ],
        },
      ],
      complexity: { verdict: "SINGLE", tasksChecked: 2 },
    },
  );
  assert.deepEqual(
    planRun({ kb: 9, subPlans: 1, tasks: 2, testsPerTask: null, testFilesPerTask: null }),
    {
      source: "file",
      total: { tasks: 2, kb: 9 },
      subPlans: [
        {
          kb: 9,
          tasks: [
            { tests: null, testFiles: null },
            { tests: null, testFiles: null },
          ],
        },
      ],
    },
    "a plan before `Test first`: null per task",
  );
  assert.deepEqual(
    planRun({
      kb: 256,
      subPlans: 2,
      tasks: 3,
      testsPerTask: [1, 2, 3],
      testFilesPerTask: [1, 1, 1],
    }),
    {
      source: "file",
      total: { tasks: 3, kb: 256 },
      subPlans: [
        { kb: null, tasks: null },
        { kb: null, tasks: null },
      ],
    },
    "a split plan's per-sub-plan grouping was not stored",
  );
});

await test("normalize puts an opencode chat's bash categories on its lowercase bash tool", () => {
  const n = normalize({
    ...OLD_CHAT,
    tools: { bash: { calls: 3, errors: 0 } },
    bash: { git: 2, other: 1 },
  });
  assert.deepEqual(n.tools.byTool.bash, { calls: 3, errors: 0, byCategory: { git: 2, other: 1 } });
});

await test("normalize sums a chat's total tokens from its models, as a fresh scan writes them", () => {
  const n = normalize({
    ...OLD_CHAT,
    tokens: { input: 9, outputEst: 10 },
    models: { a: { turns: 1, input: 4, outputEst: 4 }, b: { turns: 1, input: 5, outputEst: 5 } },
  });
  assert.equal(n.usage.total.tokens.input, 9);
  assert.equal(n.usage.total.tokens.outputEst, 9);
});

await test("normalize leaves null by fields out and always gives an outcome its ledgers", () => {
  const n = normalize({
    ts: 7,
    kind: "outcome",
    repo: "cbartens/bkit",
    bkitVersion: "5.5.1",
    workflow: null,
    step: "ship-close-workflow",
    subagent: null,
    model: "",
    parentSha: SHA,
  });
  assert.deepEqual(n.by, { step: "ship-close-workflow" });
  assert.deepEqual(n.ledgers, { deferrals: {}, failures: {}, friction: {} });
});

await test("normalize maps schema-1 outcome, counter and compliance rows", () => {
  assert.deepEqual(
    normalize({
      ts: 5,
      kind: "outcome",
      workflow: "ship",
      repo: "cbartens/bkit",
      bkitVersion: "4.10.0",
      step: "ship-close-workflow",
      subagent: "bkit-x",
      model: "m",
      parentSha: SHA,
      prNumber: 395,
      linesAdded: 11089,
      linesDeleted: 1273,
      linesChanged: 12362,
      filesChanged: 95,
      taskCount: 55,
      durationSeconds: 45132,
      deferrals: 52,
      failures: 4,
      frictionAdded: 0,
      deferralsAdded: 1,
      failuresAdded: 2,
      planSource: "brief",
      redTests: 3,
      coverage: { unit: { lines: 78.41 } },
    }),
    {
      schema: 3,
      ts: 5,
      kind: "outcome",
      repo: "cbartens/bkit",
      bkit: { version: "4.10.0" },
      by: { workflow: "ship", step: "ship-close-workflow", subagent: "bkit-x", model: "m" },
      run: { parentSha: SHA, pr: 395 },
      time: { totalMinutes: 752.2 },
      lines: { total: { added: 11089, deleted: 1273, changed: 12362, files: 95 } },
      ledgers: {
        deferrals: { repo: 52, added: 1 },
        failures: { repo: 4, added: 2 },
        friction: { added: 0 },
      },
      plan: { source: "brief" },
      build: { redTests: 3 },
      ship: { coverage: { unit: { lines: 78.41 } } },
    },
  );
  assert.deepEqual(
    normalize({
      ts: 6,
      kind: "counter",
      workflow: "build",
      repo: "cbartens/bkit",
      bkitVersion: "5.5.1",
      step: "build-close-workflow",
      counterName: "BUILD_ATTEMPT",
      counterValue: 2,
      counterSource: "shell-bus",
      parentSha: SHA,
    }),
    {
      schema: 3,
      ts: 6,
      kind: "counter",
      repo: "cbartens/bkit",
      bkit: { version: "5.5.1" },
      by: { workflow: "build", step: "build-close-workflow" },
      run: { parentSha: SHA },
      counter: { name: "BUILD_ATTEMPT", value: 2, source: "shell-bus" },
    },
  );
  assert.deepEqual(
    normalize({
      ts: 7,
      kind: "compliance",
      repo: "cbartens/bkit",
      bkitVersion: "5.5.1",
      workflow: "build",
      step: "close-gate",
      rule: "skip-ci-not-head",
      result: "fail",
      phase: "build",
      parentSha: SHA,
      evidence: "HEAD is [skip ci]",
    }),
    {
      schema: 3,
      ts: 7,
      kind: "compliance",
      repo: "cbartens/bkit",
      bkit: { version: "5.5.1" },
      by: { workflow: "build", step: "close-gate" },
      run: { parentSha: SHA },
      rule: { id: "skip-ci-not-head", verdict: "fail", evidence: "HEAD is [skip ci]" },
    },
  );
  const s2 = { schema: 2, kind: "outcome", run: { parentSha: SHA } };
  assert.equal(normalize(s2), s2);
});

await test("the report renders a ledger that mixes schema-1 and schema-2 rows of every kind", () => {
  const fresh = writtenChat();
  const oldChat = {
    ...OLD_CHAT,
    key: "claude-code:old-1",
    sessionId: "old-1",
    repo: repoFp("acme/widget"),
    start: T0 - 2 * 60_000,
    end: T0 + 60_000,
    bkitVia: ["command"],
    bkitWorkflows: ["build"],
    issue: issueFp("acme/widget", 650),
    issues: [issueFp("acme/widget", 650)],
    issueSource: "command",
    parentShas: [BUILD_SHA],
    settled: true,
  };
  const newOutcome = {
    schema: 2,
    ts: ms(352),
    kind: "outcome",
    repo: "acme/widget",
    bkit: { version: "5.6.0" },
    by: { workflow: "build", step: "build-close-workflow" },
    run: { parentSha: BUILD_SHA },
    time: { start: ms(300), end: ms(352), totalMinutes: 52 },
    ending: "done",
    lines: {
      total: { added: 30, deleted: 3, changed: 33, files: 3 },
      code: { added: 10, deleted: 1, files: 1 },
      tests: { added: 10, deleted: 1, files: 1 },
      docs: { added: 10, deleted: 1, files: 1 },
      merges: 0,
    },
    plan: { source: "file", total: { tasks: 7, kb: 4 }, subPlans: [] },
  };
  const counter = {
    schema: 2,
    ts: ms(352),
    kind: "counter",
    repo: "acme/widget",
    bkit: { version: "5.6.0" },
    by: { workflow: "build", step: "build-close-workflow" },
    run: { parentSha: BUILD_SHA },
    counter: { name: "BUILD_ATTEMPT", value: 2, source: "shell-bus" },
  };
  const oldCompliance = {
    ts: ms(352),
    kind: "compliance",
    repo: "acme/widget",
    bkitVersion: "5.5.1",
    workflow: "build",
    step: "close-gate",
    rule: "skip-ci-not-head",
    result: "pass",
    phase: "build",
    parentSha: BUILD_SHA,
  };
  const ledger = [
    // The schema-1 build outcome is replaced by the schema-2 one.
    ...readLedger(statsFile).filter(
      (r) => r.kind !== "chat" && !(r.kind === "outcome" && r.parentSha === BUILD_SHA),
    ),
    fresh,
    oldChat,
    newOutcome,
    counter,
    oldCompliance,
  ];
  const md = renderReport(
    ledger,
    new Map([
      [repoFp("acme/widget"), "widget"],
      [issueFp("acme/widget", 650), "widget#650"],
    ]),
    T0 + DAY,
  );
  assert.match(md, /Generated .* from 2 chats/);
  assert.match(
    md,
    /\| 1 outcome, 1 counter, 1 compliance \|/,
    "exact links to rows of both schemas",
  );
  assert.match(md, /33 lines, 7 tasks, 52 min \|/, "the schema-2 outcome row");
  assert.match(md, /12 lines, 10 min \|/, "the schema-1 outcome row");
  assert.match(
    md,
    /\| widget#650 \| [^|]* \| plan, build×2 \| 2 \|/,
    "both chats count for the issue",
  );
  assert.match(md, /\| bkit-build-challenge-remediate \| 1 \|/, "the schema-1 chat's agents");
  assert.match(md, /\| bkit-plan-generate \| 1 \|/, "the schema-2 chat's agents");
});

await test("outcome readers keep only the newest row per repo, workflow and parentSha", () => {
  const base = {
    schema: 2,
    kind: "outcome",
    repo: "acme/widget",
    bkit: { version: "5.6.0" },
    by: { workflow: "build", step: "build-close-workflow" },
    run: { parentSha: BUILD_SHA },
    time: { start: ms(300), end: ms(352), totalMinutes: 52 },
    ending: "done",
    lines: {
      total: { added: 30, deleted: 3, changed: 33, files: 3 },
      code: { added: 10, deleted: 1, files: 1 },
      tests: { added: 10, deleted: 1, files: 1 },
      docs: { added: 10, deleted: 1, files: 1 },
      merges: 0,
    },
  };
  // `runs dispatch` re-appends the row with the dispatch in `ci`; the newer ts wins, not file order.
  const redispatched = {
    ...base,
    ts: ms(400),
    ending: "close-failed",
    ci: [{ status: "unresolved", reason: "no-run", attempts: 1 }],
    lines: { ...base.lines, total: { added: 37, deleted: 3, changed: 40, files: 3 } },
  };
  const first = { ...base, ts: ms(352) };
  const otherWorkflow = { ...base, ts: ms(352), by: { workflow: "debug", step: "close" } };
  assert.deepEqual(latestOutcomes([redispatched, first, otherWorkflow]), [
    redispatched,
    otherWorkflow,
  ]);
  const chat = {
    ...normalize({
      ...OLD_CHAT,
      key: "claude-code:dispatch",
      sessionId: "dispatch",
      repo: repoFp("acme/widget"),
      start: ms(290),
      end: ms(500),
      bkitVia: ["command"],
      bkitWorkflows: ["build"],
      issue: issueFp("acme/widget", 650),
      issues: [issueFp("acme/widget", 650)],
      issueSource: "command",
      parentShas: [BUILD_SHA],
      settled: true,
    }),
  };
  const md = renderReport(
    [chat, redispatched, first],
    new Map([[repoFp("acme/widget"), "widget"]]),
    ms(500) + DAY,
  );
  assert.match(md, /\| 1 outcome \| 1 outcome \|/, "the re-appended row is not counted twice");
  assert.match(md, /40 lines, 52 min \|/, "the newest row's numbers");
});

await test("the run check pairs outcome rows with run rows on parentSha, per repo", () => {
  const sha = (c) => c.repeat(40);
  const top = { schema: 2, bkit: { version: "5.0.0" } };
  const outcome = (repo, s, ts) => ({
    ...top,
    ts,
    kind: "outcome",
    repo,
    by: { workflow: "build", step: "build-close-workflow" },
    run: { parentSha: s },
  });
  const run = (repo, s, settled = true) => ({
    ...top,
    ts: 1,
    kind: "run",
    key: `${repo}:${s}`,
    repo,
    by: { workflow: "build", step: "scan" },
    run: { parentSha: s },
    time: { start: 1 },
    scan: { settled },
  });
  const fp = repoFp("acme/widget");
  const rows = [
    outcome("acme/widget", sha("a"), 10),
    outcome("acme/widget", sha("a"), 11), // the re-appended close: one outcome
    run(fp, sha("a")),
    outcome("acme/widget", sha("b"), 12), // no run row
    run(fp, sha("c")), // no outcome row
    run(fp, sha("d"), false), // open: left out
  ];
  const c = runCheck(rows).get(fp);
  assert.equal(c.both, 1);
  assert.deepEqual(c.outcomeOnly.map((o) => o.run.parentSha), [sha("b")]);
  assert.deepEqual(c.runOnly.map((r) => r.run.parentSha), [sha("c")]);
  const md = renderRunCheck(runCheck(rows), new Map([[fp, "widget"]]));
  assert.match(md, /\| widget \| 1 \| 1 \| 1 \|/);
  assert.match(md, /\| widget \| run only \| build \| .* \| cccccccc \|/);
});

// Per-run tokens, context at turn 10, plan reads, owner waits -----------------------------------

/** Tally counts of `n` model calls at minutes `mins`, each sending `read` context. */
function tallied(mins, read = 100) {
  const t = new Tally();
  mins.forEach((m, i) => {
    t.at(ms(m));
    t.turn(`m${i}`, {
      model: "m",
      at: ms(m),
      usage: { input: 10, cacheWrite: 0, cacheRead: read - 10, output: 1 },
    });
  });
  return t.done();
}

await test("run usage splits one chat by turn time", () => {
  const repo = { slug: "acme/widget", root: null };
  const win = (key, from, to, extra = {}) => ({
    key,
    repo: repoFp("acme/widget"),
    issue: issueFp("acme/widget", 650),
    start: ms(from),
    end: ms(to),
    sessions: [],
    ...extra,
  });
  // Run A 0-10, run B 5-20 overlaps it; run C names the chat on a session row only.
  const runs = [
    win("A", 0, 10),
    win("B", 5, 20),
    win("C", 30, 40, { issue: issueFp("acme/widget", 9), sessions: [fingerprint("claude-code:s1")] }),
    win("D", 0, 40, { issue: issueFp("acme/widget", 9) }),
  ];
  const main = tallied([1, 6, 12, 25, 31]);
  main.workflows = [{ workflow: "build", issue: 650, at: ms(1) }];
  const sub = tallied([7, 8]);
  const row = chatRow("claude-code", "s1", main, [{ agentType: "x", counts: sub }], repo, [], {
    files: 1,
    bytes: 1,
  }, runs);
  const part = (turns) => ({
    turns,
    tokens: { input: 10 * turns, cacheWrite: 0, cacheRead: 90 * turns, output: turns, outputEst: 0, read: 100 * turns },
  });
  assert.deepEqual(row.usage.byRun, {
    A: { main: part(1), agents: part(0) },
    B: { main: part(2), agents: part(2) },
    C: { main: part(1), agents: part(0) },
  }, "a call in two windows counts for the later-started run; minute 25 is in no run; D is another issue");
  assert.deepEqual(validateTotals(row), { ok: true });

  const usage = runUsageIndex([row]);
  assert.deepEqual(usage(runs[1]), {
    total: part(4),
    main: part(2),
    agents: part(2),
  });
  assert.equal(usage(win("E", 100, 110)), null, "no chat worked on it");
  const old = { ...row, key: "claude-code:old", usage: { ...row.usage, byRun: undefined } };
  assert.equal(runUsageIndex([row, old])(runs[1]), null, "a chat without the split leaves it unknown");

  const untimed = tallied([1]);
  untimed.calls[0].at = null;
  untimed.workflows = [{ workflow: "build", issue: 650, at: null }];
  const cursor = chatRow("cursor", "c1", untimed, [], repo, [], { files: 1, bytes: 1 }, runs);
  assert.equal(cursor.usage.byRun, null, "a host with no call times cannot be split");
  const none = chatRow("claude-code", "s2", tallied([1]), [], repo, [], { files: 1, bytes: 1 }, runs);
  assert.deepEqual(none.usage.byRun, {}, "a chat that worked on no run");
});

await test("agent instance records context at turn 10", () => {
  const ten = tallied(Array.from({ length: 12 }, (_, i) => i), 100);
  assert.equal(ten.tokens.contextAt10, 100);
  assert.equal(tallied([1, 2, 3]).tokens.contextAt10, null, "fewer than 10 calls");
  const row = chatRow(
    "claude-code",
    "s1",
    tallied([0]),
    [{ agentType: "x", counts: ten }],
    { slug: "acme/widget", root: null },
    [],
    { files: 1, bytes: 1 },
  );
  assert.deepEqual(row.agents.byAgent.x.instances, [
    { turns: 12, contextPeak: 100, contextAt10: 100 },
  ]);
});

await test("plan reads count full and partial", () => {
  const t = new Tally();
  const plan = "/r/docs/plans/202610/688-stats-plan.md";
  t.toolUse("r1", "Read", { readPath: plan });
  t.toolUse("r2", "Read", { readPath: plan, partial: true });
  t.toolUse("r3", "Read", { readPath: "/r/docs/plans/202609/12-x-plan-2.md" });
  t.toolUse("r4", "Read", { readPath: "/r/docs/plans/202610/logs/688-stats/build-plan.md" });
  t.toolUse("r5", "Read", { readPath: "/r/docs/plans/202610/688-stats-design.md" });
  t.toolUse("b1", "Bash", { shell: `cat docs/plans/202610/688-stats-plan.md` });
  t.toolUse("b2", "Bash", { shell: `sed -n 1,40p "docs/plans/202610/688-stats-plan.md" | head -5` });
  t.toolUse("b3", "Bash", { shell: `grep -n Task docs/plans/202610/688-stats-plan.md` });
  t.turn("m", { model: "m" });
  assert.deepEqual(t.done().planReads, { full: 3, partial: 2 });
  assert.deepEqual(shellPlanReads("cd x && tail -20 docs/plans/202610/a-plan.md"), ["partial"]);
  assert.ok(PLAN_FILE.test("docs/plans/202610/a-plan.md"));
  const row = chatRow(
    "claude-code",
    "s1",
    tallied([0]),
    [
      { agentType: "x", counts: t.done() },
      { agentType: "x", counts: t.done() },
    ],
    { slug: "acme/widget", root: null },
    [],
    { files: 1, bytes: 1 },
  );
  assert.deepEqual(row.agents.byAgent.x.planReads, { full: 6, partial: 4 });
});

await test("run row records owner waits and stops", () => {
  const dir = path.join(tmp, "owner", "docs", "plans", "202610", "logs", "650-owner");
  fs.mkdirSync(dir, { recursive: true });
  const rows = [
    status(0, "workflow-started", { workflow: "design" }),
    status(1, "session", { workflow: "design", session: "fp:aaa" }),
    status(2, "owner-pause", { workflow: "design", reason: "grill" }),
    status(5, "owner-answer", { workflow: "design" }),
    status(6, "owner-pause", { workflow: "design", reason: "draft" }),
    status(7, "owner-pause", { workflow: "design", reason: "draft" }),
    status(16, "owner-answer", { workflow: "design" }),
    step(20, "design", "design-grill"),
    status(21, "workflow-done", { workflow: "design" }),
    status(81, "workflow-started", { workflow: "build" }),
    status(85, "owner-pause", { workflow: "build", reason: "decision" }),
  ];
  fs.writeFileSync(path.join(dir, "status.jsonl"), rows.join(""));
  const [design, build] = runRows(dir, { slug: "acme/widget", root: null }, []);
  assert.deepEqual(design.owner, {
    waitBeforeMinutes: null,
    total: { stops: 2, minutes: 13 },
    stops: [
      { minutes: 3, open: false, reason: "grill" },
      { minutes: 10, open: false, reason: "draft" },
    ],
  });
  assert.deepEqual(
    design.steps.byStep["design-grill"],
    { n: 1, totalMinutes: 20, activeMinutes: null },
    "a step's minutes run from the row before it that is not a mark row",
  );
  assert.deepEqual(build.owner, {
    waitBeforeMinutes: 60,
    total: { stops: 1, minutes: 0 },
    stops: [{ minutes: null, open: true, reason: "decision" }],
  });
  assert.equal(design.usage, null, "no chat worked on it");
  for (const r of [design, build]) assert.deepEqual(validateTotals(r), { ok: true });
  const bad = structuredClone(design);
  bad.owner.total.minutes = 20;
  assert.match(validateTotals(bad).reason, /^owner\.total\.minutes/);
  bad.owner.total.stops = 3;
  assert.match(validateTotals(bad).reason, /^owner\.total\.stops/);
  const w = runWindows([]);
  assert.deepEqual(w, [], "no roots, no windows");
});

await test("MARK_ROWS is the engine's", () => {
  const facts = fs.readFileSync(
    new URL("../../.bkit/core/engine/commands/workflow/run-facts.ts", import.meta.url),
    "utf8",
  );
  const list = facts.match(/export const MARK_ROWS[^=]*= new Set\((\[[^\]]*\])\)/)?.[1];
  assert.deepEqual([...MARK_ROWS], JSON.parse(list.replace(/,\s*\]$/, "]")));
  for (const t of ["engine-call", "completeness"]) assert.ok(MARK_ROWS.has(t), `${t} is a mark row`);
});

await test("report shows per-run tokens and owner waits", () => {
  const fid = fingerprint("acme/widget:650-owner");
  const part = (turns, read) => ({
    turns,
    tokens: { input: 0, cacheWrite: 0, cacheRead: read, output: 0, outputEst: 0, read },
  });
  const runRow = {
    schema: 3,
    ts: ms(30),
    kind: "run",
    key: `${fid}:design:${ms(0)}`,
    repo: repoFp("acme/widget"),
    bkit: { version: "5.5.1" },
    by: { workflow: "design", step: "scan" },
    run: { fid, issue: issueFp("acme/widget", 650), n: 1, parentSha: null, parentShas: [] },
    time: { start: ms(0), end: ms(21), totalMinutes: 21, activeMinutes: null, activeFrom: null },
    ending: "done",
    ci: [],
    steps: { total: { n: 0, totalMinutes: 0, activeMinutes: null }, byStep: {} },
    owner: {
      waitBeforeMinutes: 60,
      total: { stops: 2, minutes: 13 },
      stops: [
        { minutes: 13, open: false, reason: "grill" },
        { minutes: null, open: true, reason: "draft" },
      ],
    },
    usage: { total: part(3, 3_000_000), main: part(1, 1_000_000), agents: part(2, 2_000_000) },
    scan: { rows: 9, afterEnd: 0, settled: true },
  };
  const md = renderReport(
    [...readLedger(statsFile), runRow],
    new Map([[fid, "650-owner"]]),
    ms(100),
  );
  assert.match(md, /### Tokens and owner waits per run/);
  assert.match(md, /\| design \| done \| 21 \| 3\.0 \(1\.0 \/ 2\.0\) \| 1 \+ open \| 13 \| 60 \|/);
});

/** The Cursor transcript has no folder, so its issue is fingerprinted under the "none" repo. */
function fingerprintNone(n) {
  return issueFp("none", n);
}

fs.rmSync(tmp, { recursive: true, force: true });
