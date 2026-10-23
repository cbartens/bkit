#!/usr/bin/env node
// Example. Copy into scripts/stats/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-chat-stats.test.mjs — tests for bkit-chat-stats.mjs against made-up chats of every host
 * under a temp home folder, with a temp git repo as the repo the chats ran in.
 *
 * Pure Node, no runner: `node scripts/stats/bkit-chat-stats.test.mjs`. The opencode, Cursor and
 * Antigravity tests need Node 22.5+ (`node:sqlite`) and are skipped on an older Node.
 * Exit: 0 = all tests passed, 1 = at least one test failed.
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  activeSpans,
  activityIndex,
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
  latestRows,
  lineClass,
  mergeSpans,
  modelFamily,
  overlapMs,
  planShape,
  planTasks,
  readLedger,
  renderReport,
  repoFp,
  runLines,
  runLogDirs,
  runRows,
  scan,
  scanRuns,
  slugFromRemote,
  splitRuns,
  testOrderGaps,
  toolMix,
  versionAt,
} from "./bkit-chat-stats.mjs";

const SCRIPT = new URL("./bkit-chat-stats.mjs", import.meta.url);

let sqlite = null;
try {
  sqlite = await import("node:sqlite");
} catch {
  // Node older than 22.5: the SQLite hosts' tests are skipped
}

let passed = 0;
let failed = 0;
let skipped = 0;

async function test(name, fn, { needsSqlite = false } = {}) {
  if (needsSqlite && !sqlite) {
    skipped++;
    console.log(`  skip ${name} — no node:sqlite`);
    return;
  }
  try {
    await fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failed++;
    console.log(`  FAIL ${name} — ${err.message}`);
  }
}

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
        output: `Process exited with code 0\nOutput:\n{"parentSha":"${SHA2}"}`,
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-chat-stats-"));
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

console.log("bkit-chat-stats");

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
  assert.equal(row.platform, "claude-code");
  assert.equal(row.repo, repoFp("acme/widget"));
  assert.equal(row.issue, issueFp("acme/widget", 650));
  assert.equal(row.issueSource, "command");
  assert.deepEqual(row.mentioned, [issueFp("acme/widget", 651)]);
  assert.deepEqual(row.bkitWorkflows, ["plan"]);
  assert.deepEqual(row.parentShas, [SHA]);
  assert.equal(row.bkitVersion, "5.5.1");
  assert.equal(row.subagents, 1);
  assert.equal(row.agents["bkit-plan-generate"].n, 1);
  assert.equal(row.turns, 3, "the <synthetic> message is not a turn");
  assert.deepEqual(Object.keys(row.models).sort(), ["claude-opus-5-5", "claude-sonnet-5-5"]);
  assert.equal(row.models["claude-opus-5-5"].read, 4000);
  assert.equal(row.tokens.read, 6000);
  assert.equal(row.tokensRecorded, true);
  assert.equal(row.main.read, 4000);
  assert.equal(row.compactions, 1);
  assert.equal(row.errors, 1);
  assert.deepEqual(row.tools["mcp__github"], { calls: 1, errors: 1 });
  assert.equal(row.bkitCli["workflows close"], 1);
  assert.deepEqual(row.models["claude-opus-5-5"], {
    turns: 2,
    read: 4000,
    input: 20,
    cacheWrite: 0,
    cacheRead: 3980,
    output: 10,
    outputEst: row.models["claude-opus-5-5"].outputEst,
  });
  const agent = row.agents["bkit-plan-generate"];
  assert.equal(agent.cacheRead, 1990);
  assert.equal(agent.input, 10);
  assert.equal(agent.mix.read, 1, "the Read tool counts as a read");
  assert.deepEqual(agent.ctxPeaks, [agent.ctxPeakMax], "each agent's largest turn is kept");
  assert.equal(row.main.cacheRead, 3980);
  const text = JSON.stringify(row);
  for (const leak of ["widget", "secret", "650", "/tmp", repoDir])
    assert.ok(!text.includes(leak), `row contains ${leak}`);
});

await test("a second scan appends nothing when the chats are unchanged", async () => {
  const res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 0);
  assert.equal(res.byPlatform["claude-code"].unchanged, 1);
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
  assert.equal(res.rows[0].settled, false);
  assert.ok(res.rows[0].lastActivityAt > res.rows[0].end - 1, "lastActivityAt = the last write");
  res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 0, "still open, same size: nothing new");
  age(proj);
  res = await scanHosts(["claude-code"]);
  assert.equal(res.rows.length, 1, "settled since: one more row");
  assert.equal(res.rows[0].settled, true);
});

await test("codex: $bkit-build, parentSha, failed command, duplicate token event, subagent folded in", async () => {
  makeCodex(home, repoDir);
  const res = await scanHosts(["codex"]);
  assert.equal(res.byPlatform.codex.found, 1);
  const row = rowOf(`codex:${CODEX_ID}`);
  assert.deepEqual(row.bkitWorkflows, ["build"]);
  assert.equal(row.issue, issueFp("acme/widget", 652));
  assert.deepEqual(row.parentShas, [SHA2]);
  assert.equal(row.turns, 3, "the repeated token_count is one turn");
  assert.equal(row.models["gpt-5.5-codex"].read, 22500);
  assert.equal(row.tokens.cacheRead, 19000);
  assert.equal(row.agents.explorer.n, 1);
  assert.equal(row.tools.exec_command.errors, 1);
  assert.equal(row.compactions, 1);
  assert.equal(row.userPrompts, 1, "the injected <skill> message is not a prompt");
  assert.equal(row.hostVersion, "0.146.0");
});

await test(
  "opencode: expanded command, exit code, subagent, fork counts only its own messages",
  async () => {
    makeOpencode(home, repoDir);
    const res = await scanHosts(["opencode"]);
    assert.equal(res.byPlatform.opencode.found, 2);
    const root = rowOf("opencode:ses_root");
    assert.deepEqual(root.bkitWorkflows, ["design"]);
    assert.equal(root.issue, issueFp("acme/widget", 653));
    assert.deepEqual(root.mentioned, [], "the expanded template's text is not the human's");
    assert.equal(root.models["anthropic/claude-opus-5.5"].read, 10000);
    assert.equal(root.agents["bkit-design-generate"].n, 1);
    assert.equal(root.tools.shell.errors, 1);
    assert.equal(root.bkitCli["steps finish"], 1);
    assert.deepEqual(root.effort, { max: 2 });
    const fork = rowOf("opencode:ses_fork");
    assert.equal(fork.turns, 1);
    assert.deepEqual(fork.bkitWorkflows, []);
    assert.deepEqual(fork.mentioned, [issueFp("acme/widget", 654)]);
    assert.equal(fork.compactions, 1);
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
    assert.equal(row.tokensRecorded, false);
    assert.deepEqual(row.bkitWorkflows, ["ship"]);
    assert.equal(row.issue, issueFp("acme/widget", 655));
    assert.equal(row.userPrompts, 1);
    assert.deepEqual(row.tools["mcp__github"], { calls: 1, errors: 1 });
    assert.equal(row.bkitCli["workflows close"], 1);
    assert.equal(row.models["claude-opus-5-5-high-fast"].turns, 2);
    assert.equal(row.agents.explore.n, 1);
    assert.equal(row.repo, repoFp("acme/widget"));
    const old = rowOf("cursor:cur-old");
    assert.equal(old.turns, 1);
    assert.equal(old.tools.Shell.calls, 1);
    assert.equal(old.bash.git, 1);
    assert.equal(old.issue, fingerprintNone(656));
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
    assert.deepEqual(row.bkitWorkflows, ["debug"]);
    assert.equal(row.turns, 2);
    assert.equal(row.models["gemini-3.8-flash-n"].read, 10200);
    assert.equal(row.tokens.output, 100);
    assert.deepEqual(row.tools.run_command, { calls: 1, errors: 1 });
    assert.equal(row.bash["test runner"], 1);
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
  const md = renderReport(rows, names, [], T0 + DAY);
  assert.equal(chatClass(rowOf(`claude-code:${sid}`)), "workflow");
  assert.match(md, /\| widget \| widget#650 \| workflow \| plan \| 5\.5\.1 \|/);
  assert.match(md, /1 outcome/);
  assert.match(md, /12 lines, 4 tasks, 10 min \|/);
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
      ctxStart: 0,
      ctxPeak: 0,
    },
    tools: {},
    bash: {},
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
  assert.deepEqual(mix, { read: 3, edit: 3, grep: 6, sedCat: 3, findLs: 2, tests: 4, serena: 5 });
});

await test("a workflow named only in the host's summary keeps the issue but is not a workflow run", () => {
  const ctx = (peak) => ({ ...counts().tokens, read: peak, cacheRead: peak, ctxPeak: peak });
  const row = chatRow(
    "claude-code",
    "s1",
    counts({ summaryCmds: [["build", 650]] }),
    [
      { agentType: "bkit-build-plan-verify", counts: counts({ tokens: ctx(130_000) }) },
      { agentType: "bkit-build-plan-verify", counts: counts({ tokens: ctx(210_000) }) },
    ],
    { slug: "acme/widget", root: null },
    [],
    { files: 1, bytes: 10 },
  );
  assert.equal(row.issueSource, "summary");
  assert.equal(row.issue, issueFp("acme/widget", 650));
  assert.deepEqual(row.bkitVia, ["subagent"]);
  assert.equal(chatClass(row), "bkit agents only");
  assert.deepEqual(row.agents["bkit-build-plan-verify"].ctxPeaks, [130_000, 210_000]);
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
  assert.equal(plan.key, `${fid}:plan:${ms(100)}`);
  assert.equal(plan.issue, issueFp("acme/widget", 650));
  assert.equal(plan.parentSha, CLOSE_SHA);
  assert.equal(plan.ending, "done");
  assert.deepEqual(plan.steps["plan-generate"], { n: 1, minutes: 10, active: null });
  assert.equal(plan.activeMinutes, null, "no counted chat ran this issue during the run");
  assert.deepEqual(plan.plan, {
    kb: 0,
    subPlans: 2,
    tasks: 3,
    tasksWithoutTests: 1,
    testsPerTask: [6, 0, 2],
    testFilesPerTask: [2, 0, 2],
    complexity: { verdict: "SPLIT", tasksChecked: 13 },
  });
  assert.equal(b1.ending, "failed");
  assert.equal(b1.redTests, 2);
  assert.deepEqual(
    b1.verify.map((v) => [v.attempt, v.verdict, v.testOrderGaps]),
    [
      [1, "FAIL", null],
      [2, "FAIL", 20],
    ],
    "round 1's report was overwritten by the second build; round 2's was written during the first",
  );
  assert.equal(b1.lines, null, "git does not have the run's commits");
  assert.equal(b1.challenge, null);
  assert.equal(b2.run, 2);
  assert.equal(b2.parentSha, BUILD_SHA);
  assert.deepEqual(
    b2.verify.map((v) => [v.attempt, v.verdict, v.testOrderGaps]),
    [
      [1, "FAIL", 1],
      [2, "PASS", null],
    ],
  );
  assert.deepEqual(b2.gapsRemediate, [
    { subPlan: 1, attempt: 1, verdict: "PASS", strategy: "STANDARD" },
  ]);
  assert.deepEqual(b2.challenge.findings, { CRITICAL: 0, HIGH: 1, MEDIUM: 1, LOW: 1 });
  for (const r of runs)
    assert.ok(!JSON.stringify(r).includes("secret"), "row contains the FID text");
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
  const open = res.rows.filter((r) => r.kind === "run" && r.start === ms(400));
  assert.deepEqual(
    open.map((r) => [r.ending, r.settled, r.lastActivityAt]),
    [["stopped", false, ms(410)]],
    "an open run is written, marked open",
  );
  res = await scanRunsNow(ms(420) + 2 * DAY);
  assert.deepEqual(
    res.rows.filter((r) => r.kind === "run").map((r) => [r.ending, r.settled]),
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
    [],
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
    /\| 650-secret-feature \| 5\.5\.1 \| 0 \| 2 \| 3 \| 2 \/ 6 \/ 6 \| 0:1 2:1 6:1 \| 2 \/ 2 \/ 2 \| 0:1 2:2 \| 1 \| SPLIT \| 13 tasks \\\| over the 12 threshold\. Task 1 names 6 tests\. \|/,
  );
  assert.match(md, /#### build \(2 runs, 0 with active minutes\)/);
  assert.match(md, /\| Active minutes median \| Active minutes max \| Share of active time \|/);
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
  assert.deepEqual(row.active, [[s(0), s(600)]]);
  assert.equal(row.activeMinutes, 10);
});

await test("a run's active minutes come from its issue's chats, per step, and a newly counted chat re-counts it", () => {
  const chat = {
    key: "claude-code:x",
    issues: [issueFp("acme/widget", 650)],
    start: ms(300),
    end: ms(360),
    active: [[ms(300), ms(330)]],
    sourceBytes: 10,
  };
  const other = { ...chat, key: "claude-code:y", issues: [issueFp("acme/widget", 651)] };
  const rows = runRows(
    logDir,
    { slug: "acme/widget", root: repoDir },
    [],
    activityIndex([chat, other]),
  );
  const b2 = rows[2];
  assert.equal(b2.activeMinutes, 30);
  assert.deepEqual(b2.activeFrom, { chats: 1, bytes: 10 });
  assert.equal(b2.steps["build-plan-verify"].active, 20, "300-310 and 320-330");
  assert.equal(b2.steps["build-plan-gaps-remediate"].active, 10);
  assert.equal(b2.steps["build-challenge"].active, 0, "330-340 is after the chat's last span");
  assert.equal(rows[1].activeMinutes, null, "the first build ran before the chat");
  const res = scanRuns({
    roots: [repoDir],
    known: latestRows(readLedger(statsFile), "run"),
    settledBefore: Date.now(),
    chats: [chat],
  });
  const keys = res.rows.map((r) => r.key);
  assert.ok(keys.includes(b2.key), "the build its chat now covers is counted again");
  assert.ok(!keys.includes(rows[0].key), "the plan run is unchanged");
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
  assert.deepEqual(shape.testsPerTask, [8]);
  assert.deepEqual(shape.complexity, { verdict: "SPLIT", tasksChecked: 1 });
  assert.equal(checkReason(dir), null, "no Session Fit Estimate section: no reason");
  assert.ok(!/SPLIT_|CTX_LIMITS/.test(fs.readFileSync(SCRIPT, "utf8")), "no limit in the script");
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
    [],
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

/** The Cursor transcript has no folder, so its issue is fingerprinted under the "none" repo. */
function fingerprintNone(n) {
  return issueFp("none", n);
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed} passed, ${failed} failed${skipped ? `, ${skipped} skipped` : ""}`);
process.exitCode = failed ? 1 : 0;
