#!/usr/bin/env node
// Example. Copy into scripts/stats/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-chat-stats.mjs — counts what every agent chat on this machine did, from the files each
 * host keeps, and what every workflow run did, from its run log. Appends one `chat` row per
 * chat and one `run` row per run to the checkout's `.bkit/stats.jsonl`, open ones included,
 * then writes `.bkit/stats.md` from every row in that file.
 *
 * Hosts read (read-only; `platform` on the row):
 *   claude-code  ~/.claude/projects/<project>/<session>.jsonl + <session>/subagents/
 *   codex        $CODEX_HOME (~/.codex)/sessions/ and archived_sessions/ rollout-*.jsonl
 *   opencode     ~/.local/share/opencode/opencode.db (session_v2, session_message)
 *   cursor       ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb,
 *                ~/.cursor/chats/<hash>/<id>/store.db, ~/.cursor/projects/<project>/agent-transcripts/
 *   antigravity  ~/.gemini/antigravity{,-ide,-cli}/conversations/<id>.db
 * The SQLite hosts need Node 22.5+ (`node:sqlite`); on an older Node they are found empty.
 * Cursor records no token counts; Antigravity's older encrypted `.pb` chats are not read.
 * Claude Code deletes transcripts after `cleanupPeriodDays` (30 by default): run this more
 * often than that, or the chats it never saw are gone.
 *
 * Append-only. Every chat is written on every scan it changed in. `lastActivityAt` = the last
 * write to its files; `settled` = unchanged for `--settle-hours` (a chat can still be resumed
 * later, so none is ever closed). A chat already in the ledger is read again only when its size
 * changed (a resumed or still-open chat) or it has since settled; it then gets a new row with the
 * same `key`, and readers keep the last one. Rows are never edited or removed. The report counts
 * open rows in totals and lists, marked `open`, and leaves them out of medians.
 *
 * The script records numbers; it judges none against a limit. Limits change, so a reader
 * applies them: per-task test counts are stored as lists, each agent's largest turn as a list.
 *
 * `chat` row = one chat with its subagents folded in: totals, plus `models` and `agents` per
 * model and agent type. Tokens are kept by type: `input` (sent without the cache), `cacheWrite`
 * (sent and stored in the cache), `cacheRead` (from the cache); `read` = all three. Per agent
 * type: `ctxPeaks` (each agent's largest turn, in tokens) and `mix` (calls by what they did:
 * read, edit, grep, sed / cat, find / ls, tests, Serena).
 *
 * `run` row = one workflow run from `docs/plans/<YYYYMM>/logs/<FID>/status.jsonl`, in the main
 * checkout or a worktree of every repo a chat ran in (each feature's longest copy). It holds
 * how the run ended, minutes per step, the close step's `parentSha` and, for builds, each verify
 * and gaps-remediate round and the challenge findings; a feature's last plan run adds the plan's
 * shape. Every run is written, `settled` once its log has been unchanged for `--settle-hours`;
 * a run already in the ledger gets a new row when its log grew, its counted chats changed or it
 * settled.
 *
 * Repo slugs, FIDs and issue numbers are stored only as fingerprints (`fp:` + the first 12 hex
 * of sha256 of `owner/repo`, `owner/repo:<FID>` or `owner/repo#123`). `stats.md` turns them back
 * into names from the repos and run logs found on this machine; that is why it is gitignored.
 * No paths, branch names, prompt text or agent descriptions are stored.
 *
 * Links. A row stores the keys; the report joins them, so a row links to rows written
 * after it:
 *   exact  `parentShas` = the `parentSha` printed by `bkit workflows close` in the chat →
 *          that run's `outcome` / `counter` / `compliance` rows; a `run` row's `parentSha`
 *          → its `outcome` row, in this ledger or any repo's or worktree's.
 *   time   rows from the same repo whose `ts` falls inside the chat.
 *   issue  other chats whose `issues` / `mentioned` share a fingerprint.
 * A chat whose repo had no `.bkit/version` takes its bkit version from the managed marker of
 * an expanded workflow command, else from those links.
 *
 * Usage:  node scripts/stats/bkit-chat-stats.mjs [scan|report] [--settle-hours=<n>]
 *           [--platforms=<p,...>] [--home=<dir>] [--stats=<file>] [--report=<file>] [--dry-run]
 *         scan (default) appends new rows, then writes the report; report only writes it.
 *         --home reads every host's files under <dir> instead of the home folder.
 *         --dry-run prints what scan would append and writes nothing.
 * Exit:   0 = done, 1 = a host, the ledger or the report could not be read or written (the
 *         other hosts' rows are still appended), 2 = bad arguments or not inside a git checkout.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DEFAULT_SETTLE_HOURS = 24;
/** Platform of rows written before rows carried one. */
const DEFAULT_PLATFORM = "claude-code";
/** Highest issue number the report tries when turning issue fingerprints back into names. */
const ISSUE_LOOKUP_MAX = 20000;
/** Non-bkit chats shorter than this stay out of the "other" medians. */
const OTHER_MIN_TURNS = 20;
/** Rows from the same repo up to this long after a chat ends still count as time-linked. */
const TIME_LINK_GRACE_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const WORKFLOW_CMD = /<command-name>\/bkit-([a-z-]+)<\/command-name>\s*<command-args>\s*#?(\d+)/g;
const SUMMARY_CMD = /\/bkit-([a-z-]+)\s+#?(\d+)\b/g;
const MENTION = /(?:#|issues\/)(\d{2,6})\b/g;
const BKIT_CLI = /(?:^|[\s;&|(])(?:[\w./-]*\/)?bkit\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/g;
/** bkit's top-level commands (`bkit --help`); any other word after `bkit` is prose, not a call. */
const BKIT_COMMANDS = new Set([
  "analysis",
  "branches",
  "check",
  "ci",
  "comply",
  "context",
  "counters",
  "cursor",
  "disk",
  "doctor",
  "fids",
  "harvest",
  "help",
  "install",
  "issues",
  "land",
  "launch",
  "ledgers",
  "locks",
  "opencode",
  "prs",
  "repo",
  "roadmap",
  "runs",
  "runtime",
  "setup",
  "skills",
  "status",
  "steps",
  "telemetry",
  "tests",
  "tips",
  "uninstall",
  "upgrade",
  "workflows",
  "workstreams",
  "worktrees",
]);
/** Commands that take no subcommand: the next word is an argument. */
const BKIT_LEAF_COMMANDS = new Set([
  "check",
  "doctor",
  "help",
  "install",
  "status",
  "tips",
  "uninstall",
  "upgrade",
]);
/** `B=…/bin/bkit` — workflows run bkit through a shell variable: `"$B" workflows close`. */
const BKIT_VAR = /\b([A-Za-z_]\w*)=["']?[^\s;"']*\/bkit["']?(?=[\s;]|$)/g;
/** The close step's own commands; their output carries the run's `parentSha`. */
const CLOSE_CMD = /\bworkflows\s+(?:close|promote)\b/;
const PARENT_SHA = /\\?"parentSha\\?"\s*:\s*\\?"([0-9a-f]{40})/g;
/** A prompt that starts with a workflow command: `/bkit-plan 650` (Cursor, opencode) or `$bkit-plan 650` (Codex). */
const PROMPT_CMD = /^\s*[/$]bkit-([a-z-]+)\s+#?(\d+)\b/g;
/** A workflow command a host pasted in expanded: bkit's opencode anchor + workflow heading, or Cursor's command block. */
const SESSION_PROMPT = /\*\*Session prompt:\*\*\s*([^\n]*)/;
const WORKFLOW_HEADING =
  /^# (?:(Design|Plan|Build|Debug|Ship) Feature \(Workflow \d\/\d\)|(Auto))\s*$/m;
const CURSOR_CMD = /--- Cursor Command: bkit-([a-z-]+) ---/;
const MANAGED_MARKER = /<!-- bkit:managed v(\d+\.\d+\.\d+[\w.-]*)/;
const WORKFLOWS = new Set(["design", "plan", "build", "debug", "ship", "auto"]);

const BASH_CLASSES = [
  [
    "test runner",
    /\b(vitest|jest|pytest|mocha|maestro|playwright)\b|\b(pnpm|npm|yarn|bun)\s+(run\s+)?test\b|\bgo test\b|\bcargo test\b|xcodebuild\s+test/,
  ],
  ["bkit cli", /(?:^|[\s;&|(])(?:[\w./-]*\/)?bkit\s+[a-z-]+/],
  ["git", /(?:^|[\s;&|(])git\s/],
  ["gh", /(?:^|[\s;&|(])gh\s/],
  ["grep / rg", /\b(grep|rg|ugrep)\b/],
  ["sed / cat / head / tail", /\b(sed|cat|head|tail|awk|wc|diff)\b/],
  ["find / ls", /\b(find|ls|tree|du|stat)\b/],
  ["tsc / lint / format", /\b(tsc|eslint|oxlint|prettier|biome|ruff|mypy)\b/],
  ["package manager", /\b(pnpm|npm|yarn|bun|npx|pip|uv|cargo|go)\s/],
  ["python / node script", /\b(python3?|node|deno)\b/],
];

// ---------------------------------------------------------------------------
// Fingerprints
// ---------------------------------------------------------------------------

export const fingerprint = (text) =>
  "fp:" + createHash("sha256").update(text).digest("hex").slice(0, 12);
export const repoFp = (slug) => fingerprint(slug);
export const issueFp = (slug, n) => fingerprint(`${slug}#${n}`);

/** `git@github.com:owner/repo.git` / `https://…/owner/repo` → `owner/repo`; "" if neither. */
export function slugFromRemote(url) {
  const m = url
    .trim()
    .replace(/\.git$/, "")
    .match(/[/:]([^/:]+\/[^/:]+)$/);
  return m?.[1] ?? "";
}

function git(cwd, args) {
  const r = spawnSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  return r.status === 0 ? r.stdout : null;
}

const repoCache = new Map();

/**
 * The repo a chat ran in: `{slug, root}`, root = the main checkout (worktrees resolve to it).
 * A deleted worktree resolves through its nearest folder that still exists. Not in git →
 * slug "none", root null.
 */
export function resolveRepo(cwd) {
  if (!cwd) return { slug: "none", root: null };
  if (repoCache.has(cwd)) return repoCache.get(cwd);
  let dir = cwd;
  while (dir !== path.dirname(dir) && !fs.existsSync(dir)) dir = path.dirname(dir);
  let out = { slug: "none", root: null };
  const common = git(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (common) {
    const c = common.trim();
    const root = path.basename(c) === ".git" ? path.dirname(c) : c;
    const remote = git(root, ["config", "--get", "remote.origin.url"]);
    const slug = (remote && slugFromRemote(remote)) || `local/${path.basename(root)}`;
    out = { slug, root };
  }
  repoCache.set(cwd, out);
  return out;
}

// ---------------------------------------------------------------------------
// bkit version in force in a repo at a time
// ---------------------------------------------------------------------------

/** Version from `.bkit/version` text: JSON `pinnedVersion`, or a bare version line. */
export function parseVersionFile(text) {
  try {
    const j = JSON.parse(text);
    if (typeof j?.pinnedVersion === "string") return j.pinnedVersion;
  } catch {
    // not JSON: a bare version line
  }
  const m = text.match(/^\s*(\d+\.\d+\.\d+[\w.-]*)\s*$/m);
  return m ? m[1] : null;
}

const historyCache = new Map();

/** [[ms, version], …] ascending: each commit that changed the version, then the working tree. */
export function versionHistory(root) {
  if (!root) return [];
  if (historyCache.has(root)) return historyCache.get(root);
  const out = [];
  const log = git(root, [
    "log",
    "--reverse",
    "--format=%x01%ct",
    "-p",
    "--unified=0",
    "--no-color",
    "--no-ext-diff",
    "--",
    ".bkit/version",
  ]);
  for (const chunk of (log ?? "").split("\x01").slice(1)) {
    const ct = Number(chunk.slice(0, chunk.indexOf("\n")));
    const m =
      chunk.match(/^\+(?!\+\+).*?"pinnedVersion"\s*:\s*"([^"]+)"/m) ??
      chunk.match(/^\+\s*(\d+\.\d+\.\d+[\w.-]*)\s*$/m);
    if (m && m[1] !== out.at(-1)?.[1]) out.push([ct * 1000, m[1]]);
  }
  const file = path.join(root, ".bkit", "version");
  if (fs.existsSync(file)) {
    const v = parseVersionFile(fs.readFileSync(file, "utf8"));
    if (v && v !== out.at(-1)?.[1]) out.push([fs.statSync(file).mtimeMs, v]);
  }
  historyCache.set(root, out);
  return out;
}

export function versionAt(history, ms) {
  let v = null;
  for (const [t, ver] of history) {
    if (t <= ms) v = ver;
    else break;
  }
  return v;
}

// ---------------------------------------------------------------------------
// One transcript → counts
// ---------------------------------------------------------------------------

/** `[noun, verb]` of every bkit call in a Bash command, direct or through a `B=…/bkit` variable. */
export function bkitCalls(cmd) {
  const calls = [...cmd.matchAll(BKIT_CLI)].map(([, noun, verb]) => [noun, verb]);
  for (const [, name] of cmd.matchAll(BKIT_VAR)) {
    const use = new RegExp(`"?\\$\\{?${name}\\}?"?\\s+([a-z][a-z-]*)(?:\\s+([a-z][a-z-]*))?`, "g");
    for (const [, noun, verb] of cmd.matchAll(use)) calls.push([noun, verb]);
  }
  return calls
    .filter(([noun]) => BKIT_COMMANDS.has(noun))
    .map(([noun, verb]) => [noun, BKIT_LEAF_COMMANDS.has(noun) ? undefined : verb]);
}

export function bashClass(cmd) {
  const body = cmd.trim().replace(/^\s*cd\s+("[^"]*"|\S+)\s*&&\s*/, "");
  for (const [name, re] of BASH_CLASSES) {
    if (re.test(body) || (name === "bkit cli" && bkitCalls(body).length)) return name;
  }
  return "other";
}

/** `mcp__server__tool` → `mcp__server`; other tools keep their name. */
const toolKey = (name) =>
  name.startsWith("mcp__") ? name.split("__").slice(0, 2).join("__") : name;

function textOf(content) {
  if (typeof content === "string") return content;
  return (content ?? [])
    .filter((b) => b && typeof b === "object" && b.type === "text")
    .map((b) => b.text ?? "")
    .join(" ");
}

/** Add one model's counts into `{model: {turns, read, input, cacheWrite, cacheRead, output, outputEst}}`. */
export function addModel(models, model, c) {
  const m = (models[model] ??= {
    turns: 0,
    read: 0,
    input: 0,
    cacheWrite: 0,
    cacheRead: 0,
    output: 0,
    outputEst: 0,
  });
  for (const k of Object.keys(m)) m[k] += c[k] ?? 0;
}

const resultText = (c) => (typeof c === "string" ? c : JSON.stringify(c ?? ""));
const bump = (obj, k, n = 1) => (obj[k] = (obj[k] ?? 0) + n);

/**
 * `{text: "/bkit-<workflow> <n>", version}` for a prompt that is an expanded workflow command,
 * else null. `version` is the bkit version stamped in the command's managed marker.
 */
export function expandedCommand(s) {
  let wf = s.match(CURSOR_CMD)?.[1] ?? null;
  let args = s.match(/<user_query>\s*([\s\S]*?)<\/user_query>/)?.[1] ?? "";
  if (!wf) {
    const h = s.match(WORKFLOW_HEADING);
    const sp = s.match(SESSION_PROMPT);
    if (!h || !sp) return null;
    wf = (h[1] ?? h[2]).toLowerCase();
    args = sp[1];
  }
  const n = args.match(/#?(\d+)/)?.[1];
  return {
    text: n ? `/bkit-${wf} ${n}` : `/bkit-${wf}`,
    version: s.match(MANAGED_MARKER)?.[1] ?? null,
  };
}

/**
 * Counts for one transcript, fed event by event by a host reader. Every host's reader turns its
 * own format into these calls, so every row has the same shape whatever host wrote it.
 */
export class Tally {
  constructor() {
    this.usageById = new Map();
    /** message id → {model, chars}: per-model totals are summed in done(). */
    this.msgs = new Map();
    this.pendingChars = new Map();
    this.anonUses = 0;
    this.effort = {};
    this.tools = {};
    this.bash = {};
    this.bkitCli = {};
    this.useById = new Map();
    this.closeIds = new Set();
    this.filesRead = new Set();
    this.workflows = [];
    this.summaryCmds = [];
    this.mentions = [];
    this.parentShas = new Set();
    this.userPrompts = 0;
    this.compactions = 0;
    this.chars = 0;
    this.start = null;
    this.end = null;
    /** Every event time, for the chat's active spans. */
    this.stamps = [];
    this.cwd = null;
    this.hostVersion = null;
    this.entrypoint = null;
    /** bkit version stamped in an expanded workflow command. */
    this.bkitVersionSeen = null;
    /** `owner/repo` the host recorded, for a chat whose folder is gone. */
    this.slugHint = null;
  }

  at(ms) {
    if (!Number.isFinite(ms)) return;
    this.stamps.push(ms);
    if (this.start === null || ms < this.start) this.start = ms;
    if (this.end === null || ms > this.end) this.end = ms;
  }

  meta({ cwd, hostVersion, entrypoint } = {}) {
    this.cwd ??= cwd ?? null;
    this.hostVersion ??= hostVersion ?? null;
    this.entrypoint ??= entrypoint ?? null;
  }

  /**
   * One assistant message. Repeat calls with the same id (a streamed message) count once;
   * the last `usage` given wins. usage = {input, cacheWrite, cacheRead, output}.
   */
  turn(id, { model, effort, usage } = {}) {
    if (usage) this.usageById.set(id, usage);
    if (this.msgs.has(id)) return;
    this.msgs.set(id, { model: model || "?", chars: this.pendingChars.get(id) ?? 0 });
    bump(this.effort, effort ?? "?");
  }

  /** Characters the model wrote in message `id` (null when the host does not say which): text, thinking, tool input. */
  text(id, chars) {
    this.chars += chars;
    const m = this.msgs.get(id);
    if (m) m.chars += chars;
    // Codex writes a response's items before the event that opens its turn.
    else if (id !== null) this.pendingChars.set(id, (this.pendingChars.get(id) ?? 0) + chars);
  }

  /**
   * One tool call. `shell` = the command when the tool runs a shell command; `readPath` = the
   * file when the tool reads one. A repeated `useId` counts once.
   */
  toolUse(useId, name, { shell, readPath } = {}) {
    useId ??= `anon:${this.anonUses++}`;
    if (this.useById.has(useId)) return;
    this.useById.set(useId, name);
    const k = toolKey(name);
    this.tools[k] ??= { calls: 0, errors: 0 };
    this.tools[k].calls++;
    if (typeof shell === "string") {
      bump(this.bash, bashClass(shell));
      for (const [noun, verb] of bkitCalls(shell))
        bump(this.bkitCli, `${noun} ${verb ?? ""}`.trim());
      if (CLOSE_CMD.test(shell)) this.closeIds.add(useId);
    }
    if (typeof readPath === "string") this.filesRead.add(readPath);
  }

  /** The result of tool call `useId`. `output` is only searched for a close step's `parentSha`. */
  toolResult(useId, { isError = false, output } = {}) {
    const name = this.useById.get(useId);
    if (!name) return;
    if (isError) this.tools[toolKey(name)].errors++;
    if (this.closeIds.has(useId)) {
      for (const [, sha] of resultText(output).matchAll(PARENT_SHA)) this.parentShas.add(sha);
    }
  }

  /** Output of a background command: searched for a close step's `parentSha` once the chat ran one. */
  closeOutput(text) {
    if (!this.closeIds.size) return;
    for (const [, sha] of text.matchAll(PARENT_SHA)) this.parentShas.add(sha);
  }

  /** A message the human typed (or a slash command the host expanded). */
  userText(s, ms) {
    const ex = expandedCommand(s);
    if (ex) {
      s = ex.text;
      this.bkitVersionSeen ??= ex.version;
    }
    for (const re of [WORKFLOW_CMD, PROMPT_CMD]) {
      for (const [, wf, n] of s.matchAll(re)) {
        this.workflows.push({
          workflow: wf,
          issue: Number(n),
          at: Number.isFinite(ms) ? ms : null,
        });
      }
    }
    if (s.trim() && !s.startsWith("<command-") && !s.startsWith("<task-notification")) {
      this.userPrompts++;
      for (const [, n] of s.matchAll(MENTION)) this.mentions.push(Number(n));
    }
  }

  /** The host's summary of the chat so far, written when it compacted. */
  summaryText(s) {
    for (const [, wf, n] of s.matchAll(SUMMARY_CMD)) this.summaryCmds.push([wf, Number(n)]);
  }

  compaction() {
    this.compactions++;
  }

  /** The counts, or null when the transcript has no assistant message. */
  done() {
    if (this.msgs.size === 0) return null;
    const us = [...this.usageById.values()];
    const ctxOf = (u) => (u.input ?? 0) + (u.cacheWrite ?? 0) + (u.cacheRead ?? 0);
    const ctx = us.map(ctxOf);
    const sum = (k) => us.reduce((a, u) => a + (u[k] ?? 0), 0);
    const models = {};
    for (const [id, { model, chars: c }] of this.msgs) {
      const u = this.usageById.get(id) ?? {};
      addModel(models, model, {
        turns: 1,
        read: ctxOf(u),
        input: u.input ?? 0,
        cacheWrite: u.cacheWrite ?? 0,
        cacheRead: u.cacheRead ?? 0,
        output: u.output ?? 0,
        outputEst: Math.floor(c / 4),
      });
    }
    return {
      cwd: this.cwd,
      start: this.start,
      end: this.end,
      stamps: this.stamps,
      hostVersion: this.hostVersion,
      entrypoint: this.entrypoint,
      models,
      effort: this.effort,
      workflows: this.workflows,
      summaryCmds: this.summaryCmds,
      mentions: this.mentions,
      parentShas: [...this.parentShas],
      turns: this.msgs.size,
      userPrompts: this.userPrompts,
      compactions: this.compactions,
      tokens: {
        input: sum("input"),
        cacheWrite: sum("cacheWrite"),
        cacheRead: sum("cacheRead"),
        output: sum("output"),
        outputEst: Math.floor(this.chars / 4),
        read: ctx.reduce((a, b) => a + b, 0),
        ctxStart: ctx[0] ?? 0,
        ctxPeak: ctx.length ? Math.max(...ctx) : 0,
      },
      tools: this.tools,
      bash: this.bash,
      bkitCli: this.bkitCli,
      filesRead: this.filesRead.size,
      bkitVersionSeen: this.bkitVersionSeen,
      slugHint: this.slugHint,
    };
  }
}

/** Every line of a JSONL file that parses to an object. */
async function* jsonLines(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of rl) {
    try {
      const d = JSON.parse(line);
      if (d && typeof d === "object") yield d;
    } catch {
      // skip a malformed or half-written line
    }
  }
}

// ---------------------------------------------------------------------------
// Claude Code: ~/.claude/projects/<project>/<session>.jsonl + <session>/subagents/*.jsonl
// ---------------------------------------------------------------------------

/** One Claude Code transcript → counts, or null when it has no assistant message. */
export async function scanTranscript(file) {
  const t = new Tally();
  for await (const d of jsonLines(file)) {
    const ts = d.timestamp ? Date.parse(d.timestamp) : NaN;
    t.at(ts);
    t.meta({ cwd: d.cwd, hostVersion: d.version, entrypoint: d.entrypoint });
    if (d.type === "system" && d.subtype === "compact_boundary") {
      t.compaction();
      continue;
    }
    const m = d.message;
    if (!m || typeof m !== "object") continue;
    const content = Array.isArray(m.content) ? m.content : [];

    if (d.type === "assistant") {
      const id = m.id;
      // `<synthetic>`: a message Claude Code wrote itself (an API error notice), not a model call.
      if (!id || m.model === "<synthetic>") continue;
      const u = m.usage;
      t.turn(id, {
        model: m.model ?? d.requestedModel,
        effort: d.effort,
        usage: u && {
          input: u.input_tokens ?? 0,
          cacheWrite: u.cache_creation_input_tokens ?? 0,
          cacheRead: u.cache_read_input_tokens ?? 0,
          output: u.output_tokens ?? 0,
        },
      });
      for (const b of content) {
        if (!b || typeof b !== "object") continue;
        if (b.type === "text") t.text(id, (b.text ?? "").length);
        else if (b.type === "thinking") t.text(id, (b.thinking ?? "").length);
        else if (b.type === "tool_use") {
          const input = b.input ?? {};
          t.text(id, JSON.stringify(input).length);
          t.toolUse(b.id, b.name ?? "?", {
            shell: b.name === "Bash" ? (input.command ?? "") : undefined,
            readPath: b.name === "Read" ? (input.file_path ?? "") : undefined,
          });
        }
      }
    } else if (d.type === "user") {
      if (d.isCompactSummary) {
        t.summaryText(textOf(m.content));
        continue;
      }
      let hadResult = false;
      for (const b of content) {
        if (!b || typeof b !== "object" || b.type !== "tool_result") continue;
        hadResult = true;
        t.toolResult(b.tool_use_id, { isError: Boolean(b.is_error), output: b.content });
      }
      if (hadResult || d.isMeta) continue;
      t.userText(textOf(m.content), ts);
    }
  }
  return t.done();
}

// ---------------------------------------------------------------------------
// One chat (session + subagents) → one `chat` row
// ---------------------------------------------------------------------------

const errorsOf = (c) => Object.values(c.tools).reduce((a, t) => a + t.errors, 0);
const uniq = (xs) => [...new Set(xs)];

/** Context sizes the report's agent table counts largest turns against. Presentation only: rows store the peaks. */
export const REPORT_CTX_COLUMNS = [120000, 200000];

const TOOL_MIX = {
  read: /^(read|read_file|view)$/,
  edit: /^(edit|write|multiedit|apply_patch|str_replace|create_file|search_replace)$/,
  grep: /^(grep|codebase_search|grep_search)$/,
  findLs: /^(glob|list|ls|list_dir|file_search)$/,
  serena: /serena/,
};

/**
 * Calls of one transcript by what they did, across hosts' tool names and shell commands:
 * `{read, edit, grep, sedCat, findLs, tests, serena}`.
 */
export function toolMix(c) {
  const out = { read: 0, edit: 0, grep: 0, sedCat: 0, findLs: 0, tests: 0, serena: 0 };
  for (const [name, t] of Object.entries(c.tools)) {
    const n = name.toLowerCase();
    for (const [k, re] of Object.entries(TOOL_MIX)) if (re.test(n)) out[k] += t.calls;
  }
  out.grep += c.bash["grep / rg"] ?? 0;
  out.sedCat += c.bash["sed / cat / head / tail"] ?? 0;
  out.findLs += c.bash["find / ls"] ?? 0;
  out.tests += c.bash["test runner"] ?? 0;
  return out;
}

/**
 * @param {string} platform  key of HOSTS
 * @param {string} sessionId
 * @param {object} main  Tally counts of the main session
 * @param {{agentType: string|null, counts: object}[]} subs
 * @param {{slug: string, root: string|null}} repo
 * @param {[number, string][]} history  versionHistory() of that repo
 * @param {{files: number, bytes: number}} source
 */
export function chatRow(platform, sessionId, main, subs, repo, history, source) {
  const all = [main, ...subs.map((s) => s.counts)];
  const start = Math.min(...all.map((c) => c.start ?? Infinity));
  const end = Math.max(...all.map((c) => c.end ?? 0));
  // Subagent events fill the main chat's wait on them.
  const active = activeSpans(all.flatMap((c) => c.stamps ?? []));

  let issueNums = uniq(main.workflows.map((w) => w.issue));
  let wfNames = uniq(main.workflows.map((w) => w.workflow));
  let issueSource = "none";
  if (issueNums.length) issueSource = "command";
  else if (main.summaryCmds.length) {
    issueSource = "summary";
    issueNums = uniq(main.summaryCmds.map(([, n]) => n));
    wfNames = uniq(main.summaryCmds.map(([wf]) => wf));
  }
  wfNames = wfNames.filter((w) => WORKFLOWS.has(w));
  const mentioned = uniq(main.mentions).slice(0, 20);
  let issue = issueNums[0] ?? null;
  if (issue === null && mentioned.length) {
    issue = mentioned[0];
    issueSource = "mention";
  }

  const agents = {};
  const bkitKinds = [];
  let bkitSubagents = 0;
  for (const { agentType, counts: c } of subs) {
    const type = agentType ?? "?";
    if (type.startsWith("bkit-")) {
      bkitSubagents++;
      const kind = type.split("-")[1];
      if (kind && !bkitKinds.includes(kind)) bkitKinds.push(kind);
    }
    const a = (agents[type] ??= {
      n: 0,
      turns: 0,
      turnsMax: 0,
      read: 0,
      input: 0,
      cacheWrite: 0,
      cacheRead: 0,
      output: 0,
      outputEst: 0,
      ctxPeakMax: 0,
      ctxPeaks: [],
      compactions: 0,
      errors: 0,
      mix: {},
    });
    a.n++;
    a.turns += c.turns;
    a.turnsMax = Math.max(a.turnsMax, c.turns);
    for (const k of ["read", "input", "cacheWrite", "cacheRead", "output", "outputEst"])
      a[k] += c.tokens[k];
    a.ctxPeakMax = Math.max(a.ctxPeakMax, c.tokens.ctxPeak);
    a.ctxPeaks.push(c.tokens.ctxPeak);
    a.compactions += c.compactions;
    a.errors += errorsOf(c);
    for (const [k, v] of Object.entries(toolMix(c))) bump(a.mix, k, v);
  }
  // A workflow named only in the host's summary of the chat was run before this chat began:
  // the chat keeps its issue, but is not counted as running it.
  const bkitVia = [];
  if (issueSource === "command") bkitVia.push("command");
  if (bkitSubagents) bkitVia.push("subagent");

  const merge = (pick) => {
    const out = {};
    for (const c of all) for (const [k, v] of Object.entries(pick(c))) bump(out, k, v);
    return out;
  };
  const tools = {};
  for (const c of all) {
    for (const [k, t] of Object.entries(c.tools)) {
      tools[k] ??= { calls: 0, errors: 0 };
      tools[k].calls += t.calls;
      tools[k].errors += t.errors;
    }
  }
  const tok = (k) => all.reduce((a, c) => a + c.tokens[k], 0);
  const mergeModels = (cs) => {
    const out = {};
    for (const c of cs) for (const [k, v] of Object.entries(c.models)) addModel(out, k, v);
    return out;
  };
  const fromHistory = versionAt(history, start);
  const fromPrompt = all.map((c) => c.bkitVersionSeen).find(Boolean) ?? null;
  const version = fromHistory ?? fromPrompt;

  return {
    ts: end,
    kind: "chat",
    repo: repoFp(repo.slug),
    bkitVersion: version ?? "none",
    workflow: "chat-stats",
    step: "scan",
    key: `${platform}:${sessionId}`,
    platform,
    sessionId,
    bkitVersionSource: fromHistory ? "repo-history" : fromPrompt ? "prompt" : "none",
    start,
    end,
    minutes: Math.round((end - start) / 6000) / 10,
    activeMinutes: tenth(active.reduce((a, [s, e]) => a + e - s, 0)),
    active,
    hostVersion: main.hostVersion,
    entrypoint: main.entrypoint,
    models: mergeModels(all),
    effort: merge((c) => c.effort),
    bkit: bkitVia.length > 0,
    bkitVia,
    bkitKinds,
    bkitWorkflows: wfNames,
    issue: issue === null ? null : issueFp(repo.slug, issue),
    issueSource,
    issues: issueNums.map((n) => issueFp(repo.slug, n)),
    mentioned: mentioned.map((n) => issueFp(repo.slug, n)),
    parentShas: uniq(all.flatMap((c) => c.parentShas)),
    turns: all.reduce((a, c) => a + c.turns, 0),
    userPrompts: main.userPrompts,
    compactions: all.reduce((a, c) => a + c.compactions, 0),
    tokens: {
      input: tok("input"),
      cacheWrite: tok("cacheWrite"),
      cacheRead: tok("cacheRead"),
      output: tok("output"),
      outputEst: tok("outputEst"),
      read: tok("read"),
      ctxStart: main.tokens.ctxStart,
      ctxPeak: Math.max(...all.map((c) => c.tokens.ctxPeak)),
    },
    tokensRecorded: all.some((c) => c.tokens.read > 0),
    main: {
      turns: main.turns,
      read: main.tokens.read,
      input: main.tokens.input,
      cacheWrite: main.tokens.cacheWrite,
      cacheRead: main.tokens.cacheRead,
      output: main.tokens.output,
      outputEst: main.tokens.outputEst,
      ctxPeak: main.tokens.ctxPeak,
      compactions: main.compactions,
      mix: toolMix(main),
    },
    subagents: subs.length,
    bkitSubagents,
    otherSubagents: subs.length - bkitSubagents,
    agents,
    tools,
    bash: merge((c) => c.bash),
    bkitCli: merge((c) => c.bkitCli),
    filesRead: all.reduce((a, c) => a + c.filesRead, 0),
    errors: all.reduce((a, c) => a + errorsOf(c), 0),
    sourceFiles: source.files,
    sourceBytes: source.bytes,
  };
}

// ---------------------------------------------------------------------------
// Active time: spans of a chat with no gap over IDLE_GAP_MS between its events
// ---------------------------------------------------------------------------

/** A gap between two events of a chat longer than this is idle: a human wait, or the session left open. */
export const IDLE_GAP_MS = 5 * 60_000;
/** Fewest code + test lines for "M per 100 lines": a tiny diff makes the ratio explode. */
export const LINES_FLOOR = 100;

/** Event times → `[start, end]` spans, unix ms; a gap over IDLE_GAP_MS ends a span. */
export function activeSpans(times) {
  const spans = [];
  for (const t of [...times].sort((a, b) => a - b)) {
    const last = spans.at(-1);
    if (last && t - last[1] <= IDLE_GAP_MS) last[1] = t;
    else spans.push([t, t]);
  }
  return spans.filter(([a, b]) => b > a);
}

/** Spans of several chats → one sorted list with overlaps merged. */
export function mergeSpans(spans) {
  const out = [];
  for (const [a, b] of [...spans].sort((x, y) => x[0] - y[0])) {
    const last = out.at(-1);
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

/** Milliseconds of `spans` inside `[from, to]`. */
export const overlapMs = (spans, from, to) =>
  spans.reduce((t, [a, b]) => t + Math.max(0, Math.min(b, to) - Math.max(a, from)), 0);

// ---------------------------------------------------------------------------
// One workflow run (from its run log) → one `run` row
// ---------------------------------------------------------------------------

const TEST_ORDER_GAP =
  /—\s*(no-red|late-red|red-mismatch|red-evidence-missing|test-changed)\s*—\s*not fixable/g;
/** A gap list item of reports written before that format: `- G1 (Task 11, not fixable): … \`no-red\` x20`. */
const OLD_TEST_ORDER_GAP =
  /^- G\d+ \([^)]*\):.*?`(no-red|late-red|red-mismatch|red-evidence-missing|test-changed)`(?: x(\d+))?/gm;

/** Test-order gaps a verify report lists for its own round, in either format. */
export function testOrderGaps(text) {
  const now = [...text.matchAll(TEST_ORDER_GAP)].length;
  if (now) return now;
  return [...text.matchAll(OLD_TEST_ORDER_GAP)].reduce((a, m) => a + Number(m[2] ?? 1), 0);
}

/** Left out of a run's line counts: plans and run logs, and the ledgers. */
const LINES_EXCLUDE = [
  ":(exclude)docs/plans/**",
  ":(exclude,glob)docs/*.jsonl",
  ":(exclude,glob).bkit/*.jsonl",
];
const TEST_PATH =
  /(^|\/)(__tests__|tests?|spec|e2e)\/|[._-](test|spec)\.[^/]+$|_test\.[^/]+$|(^|\/)test_[^/]+\.py$/i;
const DOCS_PATH = /\.mdx?$|(^|\/)docs\//i;
/** `code`, `tests` or `docs`, from a changed file's path. */
export const lineClass = (file) =>
  TEST_PATH.test(file) ? "tests" : DOCS_PATH.test(file) ? "docs" : "code";

/**
 * Lines the run's own commits changed, from git: its first to its last `parentShas`, cut at
 * each merge on the way (a dev sync) so merged-in work is not counted, each stretch diffed on
 * its own. Null when git lacks either commit or the first is not an ancestor of the last.
 */
export function runLines(root, shas) {
  if (!root || shas.length < 2) return null;
  const first = shas[0];
  const last = shas.at(-1);
  if (git(root, ["merge-base", "--is-ancestor", first, last]) === null) return null;
  const chain = git(root, [
    "rev-list",
    "--first-parent",
    "--reverse",
    "--parents",
    `${first}..${last}`,
  ]);
  if (chain === null) return null;
  const stretches = [];
  let from = first;
  for (const line of chain.split("\n").filter(Boolean)) {
    const [sha, parent, ...merged] = line.split(" ");
    if (merged.length === 0) continue;
    stretches.push([from, parent]);
    from = sha;
  }
  stretches.push([from, last]);
  const blank = () => ({ added: 0, deleted: 0, files: 0 });
  const out = { code: blank(), tests: blank(), docs: blank(), merges: stretches.length - 1 };
  for (const [a, b] of stretches) {
    if (a === b) continue;
    const stat = git(root, ["diff", "--numstat", a, b, "--", ".", ...LINES_EXCLUDE]);
    if (stat === null) return null;
    for (const line of stat.split("\n").filter(Boolean)) {
      const [added, deleted, file] = line.split("\t");
      const c = out[lineClass(file)];
      c.files++;
      // Binary files: `-` for both counts.
      if (added !== "-") {
        c.added += Number(added);
        c.deleted += Number(deleted);
      }
    }
  }
  return out;
}
/** A runbook task's first line: `- [ ] **Task 3:** …`, `- [ ] **Task 3 — title.**`, `- [ ] **T3 — title.**`. */
const TASK_START = /^(\s*)- \[[ xX]\] \*\*(?:Task \d+|T\d+)\b/;
/** A reconciled challenge finding: a heading whose first severity word is the finding's. */
const FINDING_HEADING = /^#{3,4} [^\n]*?\b(CRITICAL|HIGH|MEDIUM|LOW)\b/gm;
const msOf = (iso) => (typeof iso === "string" ? Date.parse(iso) : NaN);
const tenth = (ms) => Math.round(ms / 6000) / 10;

/** Status rows of a `status.jsonl` that parse, in file order. */
export function readStatus(file) {
  if (!fs.existsSync(file)) return [];
  return readLedger(file).filter((r) => typeof r.type === "string" && Number.isFinite(msOf(r.at)));
}

/**
 * Status rows → runs, split at each `workflow-started`. A close step written after the end row
 * still belongs to the run; other rows after the end row and before the next start (a hand
 * rewind) are counted as `afterEnd`, not as steps.
 */
export function splitRuns(rows) {
  const runs = [];
  let run = null;
  for (const r of rows) {
    if (r.type === "workflow-started") {
      run = { workflow: r.workflow, rows: [r], end: null, afterEnd: 0, last: r };
      runs.push(run);
    } else if (!run) continue;
    else {
      run.last = r;
      const isEnd = r.type === "workflow-done" || r.type === "workflow-failed";
      // A close step after the end row, and the end row it writes, stay in the run: the
      // last end row is the run's ending (done, then a failed close → failed).
      if (run.end && !isEnd && !/-close-workflow$/.test(r.step ?? "")) {
        run.afterEnd++;
        continue;
      }
      run.rows.push(r);
      if (isEnd) run.end = r;
    }
  }
  return runs;
}

/**
 * `{tasks, tests[], testFiles[], withField}` of one plan file's runbook tasks. A task's
 * `**Test first:**` entries are `;`-separated on its line, or one per bullet below it.
 * `withField` = tasks that have the field; plans written before it have none.
 */
export function planTasks(text) {
  const lines = text.split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TASK_START);
    if (!m) continue;
    const block = [lines[i]];
    while (i + 1 < lines.length && !TASK_START.test(lines[i + 1])) {
      const next = lines[i + 1];
      if (next.trim() && next.search(/\S/) <= m[1].length) break;
      block.push(next);
      i++;
    }
    blocks.push(block);
  }
  const tests = [];
  const testFiles = [];
  let withField = 0;
  for (const block of blocks) {
    const at = block.findIndex((l) => l.includes("**Test first:**"));
    let entries = [];
    if (at >= 0) {
      withField++;
      const rest = block[at].split("**Test first:**")[1].trim();
      if (!/^n\/a\b/i.test(rest)) entries = rest.split(";").filter((e) => e.trim());
      const indent = block[at].search(/\S/);
      for (const l of block.slice(at + 1)) {
        if (!l.trim()) continue;
        if (l.search(/\S/) <= indent) break;
        if (/^\s*- /.test(l)) entries.push(l);
      }
    }
    tests.push(entries.length);
    testFiles.push(uniq(entries.map((e) => e.match(/`([^`]+)`/)?.[1]).filter(Boolean)).length);
  }
  return { tasks: tests.length, tests, testFiles, withField };
}

/** Plan shape from a run log's frozen plan copies: `plan-v4-<n>.md` sub-plans, else the last version. */
export function planShape(dir) {
  const files = fs.readdirSync(dir);
  const subs = files.filter((f) => /^plan-v\d+-\d+\.md$/.test(f)).sort();
  const versions = files
    .filter((f) => /^plan-v\d+-[a-z]+\.md$/.test(f) && !f.endsWith("-split.md"))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  const finalFiles = subs.length ? subs : versions.slice(-1);
  if (!finalFiles.length) return null;
  const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
  const parts = finalFiles.map((f) => planTasks(read(f)));
  const tests = parts.flatMap((p) => p.tests);
  const testFiles = parts.flatMap((p) => p.testFiles);
  const hasField = parts.some((p) => p.withField > 0);
  const shape = {
    kb: Math.round(finalFiles.reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0) / 1024),
    subPlans: subs.length || 1,
    tasks: tests.length,
    // null: the plan predates the `Test first` field. Lists in task order; no limit applied.
    tasksWithoutTests: hasField ? tests.filter((n) => n === 0).length : null,
    testsPerTask: hasField ? tests : null,
    testFilesPerTask: hasField ? testFiles : null,
    complexity: null,
  };
  if (files.includes("plan-complexity-check.md")) {
    const check = read("plan-complexity-check.md");
    const verdict = check.match(/^Verdict:\s*(\w+)/m)?.[1] ?? null;
    // The plan the check read: the last version before the split. Its reason stays in the
    // report file (plan text is not stored); the report quotes it from this machine.
    const before = versions.at(-1) ? planTasks(read(versions.at(-1))) : { tasks: 0 };
    shape.complexity = { verdict, tasksChecked: before.tasks };
  }
  return shape;
}

const readIf = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null);

/**
 * Build-only counts: every verify round, gaps-remediate round, the holistic verify and the
 * challenge. A later build of the same feature overwrites the report files, so a report is read
 * for the folder's last build, or for an earlier build when the file was last written inside
 * that build (before the next one started). A verify report must also match its round's verdict
 * and failure count.
 * @param {[number, number]} window  the run's start and the next build's start
 */
function buildFacts(run, dir, isLastBuild, window) {
  const ours = (file) => {
    const f = path.join(dir, file);
    if (!fs.existsSync(f)) return null;
    const t = fs.statSync(f).mtimeMs;
    return isLastBuild || (t >= window[0] && t < window[1]) ? fs.readFileSync(f, "utf8") : null;
  };
  const steps = run.rows.filter((r) => r.type === "step-done");
  const verify = steps
    .filter((r) => r.step === "build-plan-verify")
    .map((r) => {
      const v = {
        subPlan: r.subPlan ?? null,
        attempt: r.attempt ?? null,
        verdict: r.verdict ?? null,
        failures: r.failures ?? null,
        testOrderGaps: null,
      };
      const text = ours(`build-plan-verify-${v.subPlan}-${v.attempt}.md`);
      if (
        text &&
        text.match(/^Verdict:\s*(\w+)/m)?.[1] === v.verdict &&
        Number(text.match(/^Failures:\s*(\d+)/m)?.[1]) === v.failures
      )
        v.testOrderGaps = testOrderGaps(text);
      return v;
    });
  const gapsRemediate = steps
    .filter((r) => r.step === "build-plan-gaps-remediate")
    .map((r) => ({
      subPlan: r.subPlan ?? null,
      attempt: r.attempt ?? null,
      verdict: r.verdict ?? null,
      strategy: r.strategy ?? null,
    }));
  const hol = steps.findLast((r) => r.step === "build-plan-verify-holistic");
  const ch = steps.findLast((r) => r.step === "build-challenge");
  const reconciled = steps.some((r) => r.step === "build-challenge-reconcile");
  let findings = null;
  const chText = reconciled && ours("build-challenge.md");
  if (chText) {
    findings = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const [, s] of chText.matchAll(FINDING_HEADING)) findings[s]++;
  }
  return {
    verify,
    gapsRemediate,
    holistic: hol ? { verdict: hol.verdict ?? null, failures: hol.failures ?? null } : null,
    challenge: ch ? { verdict: ch.verdict ?? null, findings } : null,
    redTests: steps.filter((r) => r.step === "build-task-red").length,
  };
}

/** The run's last close step, or undefined. */
const lastClose = (run) =>
  run.rows.findLast((r) => r.type === "step-done" && /-close-workflow$/.test(r.step ?? ""));

/**
 * How the run ended: `done` / `failed` from its last end row. `close-failed` when the work wrote
 * `workflow-done` and the close after it failed: its last close found CI never started
 * (`ciDispatch.outcome: "unresolved"`), or a `workflow-failed` row came after the done row with
 * no close after it. With no end row, `decision-pause` when its `build-decision-<run>-*.md` is
 * still `Status: OPEN`, else `stopped`.
 */
export function endingOf(run, dir, ordinal) {
  // splitRuns keeps only close steps after an end row, so a done row before the last end row
  // means the work finished and anything after it is the close.
  if (run.end && run.rows.some((r) => r.type === "workflow-done")) {
    const close = lastClose(run);
    if (close?.ciDispatch?.outcome === "unresolved") return "close-failed";
    if (run.end.type === "workflow-done") return "done";
    return close && run.rows.indexOf(close) > run.rows.indexOf(run.end) ? "done" : "close-failed";
  }
  if (run.end?.type === "workflow-failed") return "failed";
  if (run.workflow === "build") {
    const open = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`build-decision-${ordinal}-`) && f.endsWith(".md"))
      .some((f) => /^Status:\s*OPEN\b/m.test(readIf(path.join(dir, f)) ?? ""));
    if (open) return "decision-pause";
  }
  return "stopped";
}

/**
 * Every run in one run-log folder → `run` rows. `fid` is the folder name; it is stored only as a
 * fingerprint, and `issue` as the fingerprint of its leading number.
 * @param {string} dir  `docs/plans/<YYYYMM>/logs/<FID>/`
 * @param {{slug: string}} repo
 * @param {[number, string][]} history  versionHistory() of that repo
 * @param {(issue: string|null, start: number, end: number) => {spans: number[][], from: object}|null} [activity]
 *   active spans of the chats that ran this issue's workflows during the run
 */
export function runRows(dir, repo, history, activity = () => null) {
  const fid = path.basename(dir);
  const n = fid.match(/^(\d+)-/)?.[1];
  const runs = splitRuns(readStatus(path.join(dir, "status.jsonl")));
  const lastOf = (wf) => runs.findLast((r) => r.workflow === wf);
  const ordinals = {};
  return runs.map((run) => {
    const ordinal = (ordinals[run.workflow] = (ordinals[run.workflow] ?? 0) + 1);
    const start = msOf(run.rows[0].at);
    const end = msOf(run.rows.at(-1).at);
    const issue = n ? issueFp(repo.slug, Number(n)) : null;
    const act = activity(issue, start, end);
    // A step's minutes = time since the row before it; its active minutes = the part of that
    // time inside the chats' active spans.
    const stepMs = {};
    for (let i = 1; i < run.rows.length; i++) {
      const r = run.rows[i];
      if (r.type !== "step-done" || !r.step) continue;
      const s = (stepMs[r.step] ??= { n: 0, ms: 0, active: 0 });
      const from = msOf(run.rows[i - 1].at);
      s.n++;
      s.ms += msOf(r.at) - from;
      if (act) s.active += overlapMs(act.spans, from, msOf(r.at));
    }
    const stepMinutes = Object.fromEntries(
      Object.entries(stepMs).map(([k, { n, ms, active }]) => [
        k,
        { n, minutes: tenth(ms), active: act ? tenth(active) : null },
      ]),
    );
    const nextBuild = runs.find((r) => r.workflow === run.workflow && msOf(r.rows[0].at) > start);
    const window = [start, nextBuild ? msOf(nextBuild.rows[0].at) : Infinity];
    const parentShas = uniq(run.rows.map((r) => r.parentSha).filter(Boolean));
    const writesCode = run.workflow === "build" || run.workflow === "debug";
    const close = lastClose(run);
    const fidFp = fingerprint(`${repo.slug}:${fid}`);
    return {
      ts: end,
      kind: "run",
      repo: repoFp(repo.slug),
      bkitVersion: versionAt(history, start) ?? "none",
      workflow: run.workflow,
      step: "scan",
      key: `${fidFp}:${run.workflow}:${start}`,
      fid: fidFp,
      issue,
      run: ordinal,
      start,
      end,
      // The log's last row of any kind, rows after the end row included: what `settled` is judged on.
      lastActivityAt: msOf(run.last.at) || end,
      minutes: tenth(end - start),
      activeMinutes: act ? tenth(overlapMs(act.spans, start, end)) : null,
      activeFrom: act ? act.from : null,
      ending: endingOf(run, dir, ordinal),
      parentSha: close?.parentSha ?? null,
      closeCi: run.rows
        .filter((r) => r.type === "step-done" && /-close-workflow$/.test(r.step ?? ""))
        .filter((r) => r.ciDispatch)
        .map(({ ciDispatch: d }) => ({
          outcome: d.outcome ?? null,
          reason: d.reason ?? null,
          attempts: d.attempts ?? null,
        })),
      parentShas,
      steps: stepMinutes,
      afterEnd: run.afterEnd,
      ...(writesCode ? { lines: runLines(repo.root, parentShas) } : {}),
      ...(run.workflow === "build" ? buildFacts(run, dir, run === lastOf("build"), window) : {}),
      ...(run.workflow === "plan" && run === lastOf("plan") ? { plan: planShape(dir) } : {}),
      sourceRows: run.rows.length + run.afterEnd,
    };
  });
}

/**
 * Run-log folders of a repo: the main checkout's and every worktree's, each feature once. A
 * worktree carries copies of other features' logs; for each feature the copy with the most
 * status rows wins (the live one).
 */
export function runLogDirs(root) {
  const best = new Map();
  const bases = [root];
  const wt = path.join(root, ".worktrees");
  if (fs.existsSync(wt)) for (const d of fs.readdirSync(wt)) bases.push(path.join(wt, d));
  for (const base of bases) {
    const plans = path.join(base, "docs", "plans");
    if (!fs.existsSync(plans)) continue;
    for (const month of fs.readdirSync(plans)) {
      const logs = path.join(plans, month, "logs");
      if (!/^\d{6}$/.test(month) || !fs.existsSync(logs)) continue;
      for (const fid of fs.readdirSync(logs)) {
        const status = path.join(logs, fid, "status.jsonl");
        if (!fs.existsSync(status)) continue;
        const size = fs.statSync(status).size;
        if ((best.get(fid)?.size ?? -1) < size) best.set(fid, { dir: path.join(logs, fid), size });
      }
    }
  }
  return [...best.values()].map((b) => b.dir).sort();
}

/**
 * Active spans of the counted chats that ran an issue's workflows (a `/bkit-*` command or the
 * host's summary named it), for a run of that issue: chats of the same repo that overlap it.
 * `from` names how many chats and bytes they came from, so a run is counted again once more
 * of its chats are.
 * @param {Iterable<object>} chats  chat rows
 */
export function activityIndex(chats) {
  const byIssue = new Map();
  for (const c of chats)
    for (const fp of c.issues ?? [])
      if (c.active?.length) (byIssue.get(fp) ?? byIssue.set(fp, []).get(fp)).push(c);
  return (issue, start, end) => {
    const cs = (byIssue.get(issue) ?? []).filter((c) => c.start <= end && c.end >= start);
    if (!cs.length) return null;
    return {
      spans: mergeSpans(cs.flatMap((c) => c.active)),
      from: { chats: cs.length, bytes: cs.reduce((a, c) => a + (c.sourceBytes ?? 0), 0) },
    };
  };
}

/**
 * `run` rows to append for the given repo roots: every run, `settled` once its log's last row is
 * older than the settle window; again when its row count, the chats its active minutes came
 * from, or `settled` changed.
 */
export function scanRuns({ roots, known, settledBefore, now = Date.now(), chats = [] }) {
  const activity = activityIndex(chats);
  const rows = [];
  const s = { found: 0, appended: 0, open: 0, unchanged: 0, error: null };
  const seen = new Set();
  for (const root of uniq(roots.filter(Boolean))) {
    try {
      const repo = resolveRepo(root);
      const top = fs.realpathSync(repo.root ?? root);
      // The same checkout reached through a symlink or a subfolder is read once.
      if (seen.has(top)) continue;
      seen.add(top);
      const history = versionHistory(top);
      for (const dir of runLogDirs(top)) {
        for (const r of runRows(dir, { ...repo, root: top }, history, activity)) {
          s.found++;
          const settled = r.lastActivityAt <= settledBefore;
          if (!settled) s.open++;
          const was = known.get(r.key);
          if (
            was?.sourceRows === r.sourceRows &&
            JSON.stringify(was.activeFrom ?? null) === JSON.stringify(r.activeFrom) &&
            (was.settled ?? true) === settled
          ) {
            s.unchanged++;
            continue;
          }
          // ts = when the row was written: status rows carry whole seconds only.
          rows.push({ ...r, settled, ts: now });
          s.appended++;
        }
      }
    } catch (err) {
      s.error = err instanceof Error ? err.message : String(err);
    }
  }
  return { rows, stats: s };
}

// ---------------------------------------------------------------------------
// Ledger I/O
// ---------------------------------------------------------------------------

export function readLedger(file) {
  if (!fs.existsSync(file)) return [];
  const rows = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      // malformed line: readers skip it, as the engine's parse does
    }
  }
  return rows;
}

/** Last row of `kind` per key wins (§ Updating a Row). */
export function latestRows(rows, kind) {
  const out = new Map();
  for (const r of rows) if (r.kind === kind && r.key) out.set(r.key, r);
  return out;
}
export const latestChats = (rows) => latestRows(rows, "chat");

function appendRows(file, rows) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let lead = "";
  if (fs.existsSync(file) && fs.statSync(file).size > 0) {
    const fd = fs.openSync(file, "r");
    const last = Buffer.alloc(1);
    fs.readSync(fd, last, 0, 1, fs.statSync(file).size - 1);
    fs.closeSync(fd);
    if (last.toString() !== "\n") lead = "\n";
  }
  fs.appendFileSync(file, lead + rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
}

// ---------------------------------------------------------------------------
// Hosts. Each lists its chats as
//   {sessionId, files, bytes, mtime, cwd(), load()}
// `bytes` changes whenever the chat does; `mtime` is its newest write (Infinity while the host
// is still writing it); `load()` → {main, subs: [{agentType, counts}]}, counts from a Tally.
// ---------------------------------------------------------------------------

/** Every file under `dir` whose name passes `test`. */
function walkFiles(dir, test, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, test, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}

/** Chats from host entries `{id, parent, agentType, size, mtime, …}`: subagents fold into their root. */
function groupByRoot(entries, toChat) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const rootOf = (e) => {
    const seen = new Set();
    while (e.parent && byId.has(e.parent) && !seen.has(e.id)) {
      seen.add(e.id);
      e = byId.get(e.parent);
    }
    return e;
  };
  const groups = new Map();
  for (const e of entries) {
    const root = rootOf(e);
    const g = groups.get(root.id) ?? groups.set(root.id, { root, kids: [] }).get(root.id);
    if (e !== root) g.kids.push(e);
  }
  return [...groups.values()].map(({ root, kids }) => {
    const all = [root, ...kids];
    return {
      sessionId: root.id,
      files: all.length,
      bytes: all.reduce((a, e) => a + e.size, 0),
      mtime: Math.max(...all.map((e) => e.mtime)),
      ...toChat(root, kids),
    };
  });
}

let sqliteModule;
const walSize = (file) => (fs.existsSync(`${file}-wal`) ? fs.statSync(`${file}-wal`).size : 0);

/**
 * Opens a host's SQLite file read-only and leaves the host's folder exactly as it was; null when
 * it cannot be opened or Node is older than 22.5. A plain read-only open of a WAL-mode database
 * creates `-wal` and `-shm` files beside it, so:
 *   no WAL pages        → `immutable=1`, which reads the file alone and creates nothing;
 *   WAL pages + `-shm`  → read-only through the files the host already has open;
 *   WAL pages, no `-shm` → a copy of the database and its WAL in a temp folder.
 */
async function openDb(file) {
  if (sqliteModule === undefined) {
    try {
      sqliteModule = await import("node:sqlite");
    } catch {
      sqliteModule = null;
    }
  }
  if (!sqliteModule || !fs.existsSync(file)) return null;
  const open = (f, q) => {
    try {
      const u = pathToFileURL(f);
      u.search = q;
      const db = new sqliteModule.DatabaseSync(u, { readOnly: true });
      db.prepare("select 1 from sqlite_master limit 1").all();
      return db;
    } catch {
      return null;
    }
  };
  if (walSize(file) === 0) return open(file, "mode=ro&immutable=1");
  if (fs.existsSync(`${file}-shm`)) return open(file, "mode=ro");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-chat-stats-db-"));
  const copy = path.join(dir, path.basename(file));
  fs.copyFileSync(file, copy);
  fs.copyFileSync(`${file}-wal`, `${copy}-wal`);
  process.once("exit", () => fs.rmSync(dir, { recursive: true, force: true }));
  return open(copy, "mode=ro");
}

/** Wire fields of one protobuf message as [field, value] (Buffer or number); null if `buf` is not one. */
export function pbFields(buf) {
  const out = [];
  let i = 0;
  const varint = () => {
    let r = 0;
    let s = 1;
    let x;
    do {
      if (i >= buf.length) throw new Error("eof");
      x = buf[i++];
      r += (x & 0x7f) * s;
      s *= 128;
    } while (x & 0x80);
    return r;
  };
  try {
    while (i < buf.length) {
      const k = varint();
      const f = Math.floor(k / 8);
      const w = k % 8;
      if (f === 0) return null;
      if (w === 0) out.push([f, varint()]);
      else if (w === 2) {
        const l = varint();
        if (i + l > buf.length) return null;
        out.push([f, buf.subarray(i, i + l)]);
        i += l;
      } else if (w === 1) i += 8;
      else if (w === 5) i += 4;
      else return null;
      if (i > buf.length) return null;
    }
  } catch {
    return null;
  }
  return out;
}

/** Every value at a dotted field path (`"28.21.1"`), descending into nested messages. */
export function pbAll(buf, p) {
  let cur = [Buffer.from(buf)];
  for (const f of String(p).split(".").map(Number)) {
    cur = cur.flatMap((b) =>
      Buffer.isBuffer(b) ? (pbFields(b) ?? []).filter(([g]) => g === f).map(([, v]) => v) : [],
    );
  }
  return cur;
}
const pbStr = (buf, p) => {
  const v = buf && pbAll(buf, p)[0];
  return Buffer.isBuffer(v) ? v.toString("utf8") : null;
};
const pbNum = (buf, p) => {
  const v = buf && pbAll(buf, p)[0];
  return typeof v === "number" ? v : null;
};
/** {1: seconds, 2: nanoseconds} → ms. */
const pbTime = (buf, p) => {
  const s = pbNum(buf, `${p}.1`);
  return s === null ? NaN : s * 1000 + Math.floor((pbNum(buf, `${p}.2`) ?? 0) / 1e6);
};
const jsonOr = (s, fallback = {}) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};
const fileOf = (uri) => {
  try {
    return uri?.startsWith("file:") ? fileURLToPath(uri) : (uri ?? null);
  } catch {
    return null;
  }
};

// Claude Code ---------------------------------------------------------------

export function listClaude(home) {
  const projectsDir = path.join(home, ".claude", "projects");
  const chats = [];
  if (!fs.existsSync(projectsDir)) return chats;
  for (const proj of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!proj.isDirectory()) continue;
    const dir = path.join(projectsDir, proj.name);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".jsonl")) continue;
      const sessionId = f.slice(0, -6);
      const mainFile = path.join(dir, f);
      const subDir = path.join(dir, sessionId, "subagents");
      const subFiles = fs.existsSync(subDir)
        ? fs
            .readdirSync(subDir)
            .filter((s) => s.endsWith(".jsonl"))
            .map((s) => path.join(subDir, s))
        : [];
      let bytes = 0;
      let mtime = 0;
      for (const p of [mainFile, ...subFiles]) {
        const st = fs.statSync(p);
        bytes += st.size;
        mtime = Math.max(mtime, st.mtimeMs);
      }
      chats.push({
        sessionId,
        files: 1 + subFiles.length,
        bytes,
        mtime,
        cwd: () => firstCwd(mainFile),
        load: async () => {
          const subs = [];
          for (const file of subFiles) {
            const counts = await scanTranscript(file);
            if (!counts) continue;
            const meta = jsonOr(
              fs.existsSync(file.slice(0, -6) + ".meta.json")
                ? fs.readFileSync(file.slice(0, -6) + ".meta.json", "utf8")
                : "",
            );
            subs.push({ agentType: meta.agentType ?? null, counts });
          }
          return { main: await scanTranscript(mainFile), subs };
        },
      });
    }
  }
  return chats;
}

async function firstCwd(file) {
  let n = 0;
  for await (const d of jsonLines(file)) {
    if (d.cwd) return d.cwd;
    if (++n > 200) break;
  }
  return null;
}

// Codex: $CODEX_HOME/sessions/YYYY/MM/DD/rollout-*.jsonl, subagents in their own files ---------

const isRollout = (name) => name.startsWith("rollout-") && name.endsWith(".jsonl");
const SHELL_TOOLS = new Set([
  "exec_command",
  "shell",
  "shell_command",
  "local_shell",
  "run_command",
  "run_terminal_cmd",
  "Shell",
  "bash",
]);

export async function listCodex(home) {
  const codexHome =
    process.env.CODEX_HOME && home === os.homedir()
      ? process.env.CODEX_HOME
      : path.join(home, ".codex");
  const entries = new Map();
  for (const file of ["sessions", "archived_sessions"].flatMap((d) =>
    walkFiles(path.join(codexHome, d), isRollout),
  )) {
    let meta = null;
    for await (const d of jsonLines(file)) {
      meta = d.type === "session_meta" ? (d.payload ?? null) : null;
      break;
    }
    if (!meta?.id) continue;
    const st = fs.statSync(file);
    // An archived copy of a chat still in sessions/: keep the bigger one.
    if ((entries.get(meta.id)?.size ?? -1) >= st.size) continue;
    const sub = meta.source && typeof meta.source === "object" ? meta.source.subagent : null;
    const spawn = sub && typeof sub === "object" ? sub.thread_spawn : null;
    entries.set(meta.id, {
      id: meta.id,
      file,
      size: st.size,
      mtime: st.mtimeMs,
      cwd: meta.cwd ?? null,
      parent: meta.parent_thread_id ?? spawn?.parent_thread_id ?? null,
      agentType:
        spawn?.agent_role ??
        spawn?.agent_nickname ??
        (typeof sub === "string" ? `codex-${sub}` : null),
    });
  }
  return groupByRoot([...entries.values()], (root, kids) => ({
    cwd: async () => root.cwd,
    load: async () => {
      const subs = [];
      for (const k of kids) {
        const counts = await scanCodex(k.file);
        if (counts) subs.push({ agentType: k.agentType, counts });
      }
      return { main: await scanCodex(root.file), subs };
    },
  }));
}

const codexFailed = (out) =>
  /Process exited with code [1-9]/.test(out) || /^Exit code: [1-9]/m.test(out);
const partsText = (content) =>
  (Array.isArray(content) ? content : [])
    .map((c) => (typeof c === "string" ? c : (c?.text ?? "")))
    .join(" ");

/** One Codex rollout file → counts. One API response = one `token_count` event = one turn. */
export async function scanCodex(file) {
  const t = new Tally();
  let model = null;
  let effort = null;
  let n = 0;
  let lastTotal = null;
  let assistantMsgs = 0;
  let compacted = 0;
  let contextCompacted = 0;
  const prompts = [];
  const userItems = [];
  const id = () => `r${n}`;
  for await (const d of jsonLines(file)) {
    const ms = d.timestamp ? Date.parse(d.timestamp) : NaN;
    t.at(ms);
    const p = d.payload ?? {};
    if (d.type === "session_meta")
      t.meta({ cwd: p.cwd, hostVersion: p.cli_version, entrypoint: p.originator });
    else if (d.type === "turn_context") {
      model = p.model ?? model;
      effort = p.effort ?? effort;
    } else if (d.type === "compacted") {
      compacted++;
      if (typeof p.message === "string") t.summaryText(p.message);
    } else if (d.type === "event_msg") {
      if (p.type === "token_count" && p.info?.last_token_usage) {
        const total = p.info.total_token_usage?.total_tokens;
        // The same response is sometimes reported twice in a row.
        if (total !== undefined && total === lastTotal) continue;
        lastTotal = total;
        const u = p.info.last_token_usage;
        const cached = u.cached_input_tokens ?? 0;
        t.turn(id(), {
          model,
          effort,
          usage: {
            input: Math.max(0, (u.input_tokens ?? 0) - cached),
            cacheWrite: u.cache_write_input_tokens ?? 0,
            cacheRead: cached,
            output: u.output_tokens ?? 0,
          },
        });
        n++;
      } else if (p.type === "user_message" && typeof p.message === "string")
        prompts.push([p.message, ms]);
      else if (p.type === "context_compacted") contextCompacted++;
    } else if (d.type === "response_item") {
      if (p.type === "function_call" || p.type === "custom_tool_call") {
        const raw = p.type === "function_call" ? (p.arguments ?? "") : String(p.input ?? "");
        const args = p.type === "function_call" ? jsonOr(raw) : {};
        const cmd = args.cmd ?? args.command;
        t.text(id(), raw.length);
        t.toolUse(p.call_id, p.name ?? "?", {
          shell: SHELL_TOOLS.has(p.name) ? [].concat(cmd ?? []).join(" ") : undefined,
        });
      } else if (p.type === "local_shell_call") {
        t.toolUse(p.call_id ?? p.id ?? `ls${n}`, "local_shell", {
          shell: [].concat(p.action?.command ?? []).join(" "),
        });
      } else if (p.type === "web_search_call") t.toolUse(p.id ?? `ws${n}:${ms}`, "web_search");
      else if (p.type === "function_call_output" || p.type === "custom_tool_call_output") {
        const out = typeof p.output === "string" ? p.output : JSON.stringify(p.output ?? "");
        t.toolResult(p.call_id, { isError: codexFailed(out), output: out });
      } else if (p.type === "message" && p.role === "assistant") {
        assistantMsgs++;
        t.text(id(), partsText(p.content).length);
      } else if (p.type === "reasoning") t.text(id(), partsText(p.summary).length);
      else if (p.type === "message" && p.role === "user") {
        const s = partsText(p.content);
        if (!s.trimStart().startsWith("<")) userItems.push([s, ms]);
      }
    }
  }
  // A rollout written before token counts were recorded: one turn per assistant message.
  for (let i = 0; n === 0 && i < assistantMsgs; i++) t.turn(`a${i}`, { model, effort });
  // Chats saved without user_message events keep the prompts only as user items.
  for (const [s, ms] of prompts.length ? prompts : userItems) t.userText(s, ms);
  for (let i = 0; i < Math.max(compacted, contextCompacted); i++) t.compaction();
  return t.done();
}

// opencode: ~/.local/share/opencode/opencode.db, tables session_v2 + session_message ---------

export async function listOpencode(home) {
  const db = await openDb(path.join(home, ".local", "share", "opencode", "opencode.db"));
  if (!db) return [];
  const has = db
    .prepare(
      "select name from sqlite_master where type = 'table' and name in ('session_v2', 'session_message')",
    )
    .all();
  if (has.length < 2) return [];
  const msgStats = new Map(
    db
      .prepare(
        "select session_id, min(time_created) first, max(time_updated) last, sum(length(data)) size from session_message group by session_id",
      )
      .all()
      .map((r) => [r.session_id, r]),
  );
  const entries = [];
  for (const s of db
    .prepare(
      "select id, parent_id, agent, directory, version, time_created, time_updated, time_idle from session_v2",
    )
    .all()) {
    const m = msgStats.get(s.id);
    if (!m) continue;
    entries.push({
      id: s.id,
      parent: s.parent_id ?? null,
      agentType: s.agent ?? null,
      cwd: s.directory,
      version: s.version,
      // A fork starts with a copy of the original's messages: count only the ones after the fork.
      since: m.first < s.time_created ? s.time_created : 0,
      size: m.size ?? 0,
      mtime: Math.max(s.time_updated ?? 0, s.time_idle ?? 0, m.last ?? 0),
    });
  }
  const messages = db.prepare(
    "select type, seq, time_created, data from session_message where session_id = ? and time_created >= ? order by seq",
  );
  return groupByRoot(entries, (root, kids) => ({
    cwd: async () => root.cwd,
    load: async () => ({
      main: scanOpencode(root, messages.all(root.id, root.since)),
      subs: kids
        .map((k) => ({
          agentType: k.agentType,
          counts: scanOpencode(k, messages.all(k.id, k.since)),
        }))
        .filter((s) => s.counts),
    }),
  }));
}

const OPENCODE_SHELL = new Set(["bash", "shell"]);

export function scanOpencode(session, messages) {
  const t = new Tally();
  t.meta({ cwd: session.cwd, hostVersion: session.version, entrypoint: "opencode" });
  for (const row of messages) {
    t.at(row.time_created);
    const d = jsonOr(row.data, null);
    if (!d) continue;
    if (row.type === "assistant") {
      const id = d.id ?? `m${row.seq}`;
      const tk = d.tokens ?? {};
      t.turn(id, {
        model: d.model?.id,
        effort: d.model?.variant,
        usage: {
          input: tk.input ?? 0,
          cacheWrite: tk.cache?.write ?? 0,
          cacheRead: tk.cache?.read ?? 0,
          output: tk.output ?? 0,
        },
      });
      for (const c of Array.isArray(d.content) ? d.content : []) {
        if (c?.type === "text" || c?.type === "reasoning") t.text(id, (c.text ?? "").length);
        if (c?.type !== "tool") continue;
        const st = c.state ?? {};
        const input = st.input ?? {};
        t.text(id, JSON.stringify(input).length);
        const shell = OPENCODE_SHELL.has(c.name)
          ? input.command
          : c.name === "execute"
            ? input.code
            : undefined;
        t.toolUse(c.id, c.name ?? "?", {
          shell: typeof shell === "string" ? shell : undefined,
          readPath: c.name === "read" ? input.filePath : undefined,
        });
        const exit = st.metadata?.exit;
        t.toolResult(c.id, {
          isError:
            st.status === "error" ||
            (shell !== undefined && typeof exit === "number" && exit !== 0),
          output: partsText(st.content),
        });
      }
    } else if (row.type === "user" && typeof d.text === "string")
      t.userText(d.text, row.time_created);
    else if (row.type === "compaction") {
      t.compaction();
      if (typeof d.summary === "string") t.summaryText(d.summary);
    }
  }
  return t.done();
}

// Cursor: composer chats in globalStorage/state.vscdb, CLI chats in ~/.cursor/chats/*/*/store.db,
// and plain transcripts in ~/.cursor/projects/*/agent-transcripts for chats whose state is gone ---

/** The 32-byte message hashes of a conversation-state protobuf, as hex. */
const stateHashes = (buf) =>
  (pbFields(buf) ?? [])
    .filter(([f, v]) => f === 1 && Buffer.isBuffer(v) && v.length === 32)
    .map(([, v]) => v.toString("hex"));

export async function listCursor(home) {
  const transcripts = new Map();
  for (const file of walkFiles(path.join(home, ".cursor", "projects"), (n) =>
    n.endsWith(".jsonl"),
  )) {
    if (file.includes(`${path.sep}agent-transcripts${path.sep}`))
      transcripts.set(path.basename(file, ".jsonl"), file);
  }
  const entries = new Map();
  const add = (e) => {
    const t = transcripts.get(e.id);
    if (!e.load && !t) return;
    const st = t ? fs.statSync(t) : null;
    entries.set(e.id, {
      ...e,
      transcript: t ?? null,
      size: (e.size ?? 0) + (st?.size ?? 0),
      mtime: e.generating ? Infinity : Math.max(e.mtime ?? 0, st?.mtimeMs ?? 0),
    });
  };

  const db = await openDb(
    path.join(
      home,
      "Library",
      "Application Support",
      "Cursor",
      "User",
      "globalStorage",
      "state.vscdb",
    ),
  );
  const hasHeaders = db
    ?.prepare("select name from sqlite_master where type = 'table' and name = 'composerHeaders'")
    .all().length;
  if (hasHeaders) {
    const kv = db.prepare("select value from cursorDiskKV where key = ?");
    const value = (key) => {
      const r = kv.get(key);
      return r ? Buffer.from(r.value) : null;
    };
    for (const h of db
      .prepare(
        "select composerId, createdAt, lastUpdatedAt, isSubagent, subagentTypeName, value from composerHeaders",
      )
      .all()) {
      const head = jsonOr(String(h.value ?? ""));
      const data = jsonOr(value(`composerData:${h.composerId}`)?.toString() ?? "", null);
      const state =
        typeof data?.conversationState === "string" && data.conversationState.startsWith("~")
          ? Buffer.from(data.conversationState.slice(1), "base64")
          : null;
      const hashes = state ? stateHashes(state) : [];
      const info = head.subagentInfo ?? {};
      add({
        id: h.composerId,
        parent: h.isSubagent
          ? (info.rootParentConversationId ?? info.parentComposerId ?? null)
          : null,
        agentType: h.subagentTypeName ?? info.subagentTypeName ?? null,
        cwd: pbStr(state, "21.1") ?? head.workspaceIdentifier?.uri?.fsPath ?? null,
        entrypoint: pbStr(state, "22") ?? "ide",
        model: data?.modelConfig?.modelName ?? null,
        start: pbNum(state, "26") ?? h.createdAt ?? head.createdAt,
        end: Math.max(
          h.lastUpdatedAt ?? 0,
          head.conversationCheckpointLastUpdatedAt ?? 0,
          h.createdAt ?? 0,
        ),
        size: data?.conversationState?.length ?? 0,
        mtime: Math.max(
          h.lastUpdatedAt ?? 0,
          head.conversationCheckpointLastUpdatedAt ?? 0,
          h.createdAt ?? 0,
        ),
        generating: (data?.generatingBubbleIds?.length ?? 0) > 0,
        load: hashes.length
          ? () =>
              hashes
                .map((x) => jsonOr(value(`agentKv:blob:${x}`)?.toString() ?? "", null))
                .filter(Boolean)
          : null,
      });
    }
  }

  for (const file of walkFiles(path.join(home, ".cursor", "chats"), (n) => n === "store.db")) {
    const id = path.basename(path.dirname(file));
    if (entries.has(id)) continue;
    const store = await openDb(file);
    if (!store) continue;
    const metaHex = store.prepare("select value from meta where key = '0'").get()?.value;
    const meta = metaHex ? jsonOr(Buffer.from(String(metaHex), "hex").toString()) : {};
    const blob = store.prepare("select data from blobs where id = ?");
    const get = (x) => {
      const r = blob.get(x);
      return r ? Buffer.from(r.data) : null;
    };
    const root = meta.latestRootBlobId ? get(meta.latestRootBlobId) : null;
    const hashes = root ? stateHashes(root) : [];
    const side = jsonOr(
      fs.existsSync(path.join(path.dirname(file), "meta.json"))
        ? fs.readFileSync(path.join(path.dirname(file), "meta.json"), "utf8")
        : "",
    );
    const st = fs.statSync(file);
    add({
      id,
      parent: null,
      agentType: null,
      cwd: pbStr(root, "21.1") ?? side.cwd ?? null,
      entrypoint: pbStr(root, "22") ?? "cli",
      model: null,
      start: side.createdAtMs ?? meta.createdAt ?? st.birthtimeMs,
      end: side.updatedAtMs ?? st.mtimeMs,
      size: st.size,
      mtime: st.mtimeMs,
      load: hashes.length
        ? () => hashes.map((x) => jsonOr(get(x)?.toString() ?? "", null)).filter(Boolean)
        : null,
    });
  }

  // Chats whose state is gone (archived) survive only as transcripts; subagents sit beside them.
  for (const [id, file] of transcripts) {
    if (entries.has(id)) continue;
    const st = fs.statSync(file);
    const parentDir = path.dirname(path.dirname(file));
    const isSub = path.basename(path.dirname(file)) === "subagents";
    add({
      id,
      parent: isSub ? path.basename(parentDir) : null,
      agentType: null,
      cwd: null,
      entrypoint: "ide",
      start: st.birthtimeMs,
      end: st.mtimeMs,
      size: 0,
      mtime: st.mtimeMs,
      load: null,
    });
  }

  return groupByRoot([...entries.values()], (root, kids) => ({
    cwd: async () => root.cwd,
    load: async () => ({
      main: await scanCursor(root),
      subs: (
        await Promise.all(
          kids.map(async (k) => ({ agentType: k.agentType, counts: await scanCursor(k) })),
        )
      ).filter((s) => s.counts),
    }),
  }));
}

const CURSOR_SHELL = new Set(["Shell", "run_terminal_cmd"]);
const userQuery = (s) => s.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/)?.[1] ?? null;

/** Cursor tool name: MCP calls through CallDynamicTool get the `mcp__server` key other hosts use. */
function cursorTool(name, args) {
  return name === "CallDynamicTool" && args?.namespace
    ? `mcp__${args.namespace}__${args.toolName ?? "?"}`
    : (name ?? "?");
}

/** One Cursor chat → counts. Cursor records no token counts; times are the chat's first and last. */
export async function scanCursor(e) {
  const t = new Tally();
  t.meta({ cwd: e.cwd, entrypoint: e.entrypoint });
  t.at(e.start);
  t.at(e.end);
  let model = e.model;
  let n = 0;
  const user = (s) => {
    if (s.includes("Your conversation was summarized")) {
      t.compaction();
      t.summaryText(s);
    } else if (s.includes("<cursor_commands>")) t.userText(s);
    else {
      const q = userQuery(s);
      if (q) t.userText(q);
    }
  };
  if (e.load) {
    for (const m of e.load()) {
      const parts = Array.isArray(m.content)
        ? m.content
        : [{ type: "text", text: String(m.content ?? "") }];
      if (m.role === "assistant") {
        const id = `a${n++}`;
        model =
          parts.find((p) => p?.providerOptions?.cursor?.modelName)?.providerOptions.cursor
            .modelName ?? model;
        t.turn(id, { model });
        for (const p of parts) {
          if (p?.type === "text" || p?.type === "reasoning") t.text(id, (p.text ?? "").length);
          else if (p?.type === "tool-call") {
            const args = p.args ?? {};
            t.text(id, JSON.stringify(args).length);
            t.toolUse(p.toolCallId, cursorTool(p.toolName, args), {
              shell: CURSOR_SHELL.has(p.toolName) ? args.command : undefined,
              readPath: p.toolName === "Read" ? args.path : undefined,
            });
          }
        }
      } else if (m.role === "tool") {
        const hl = m.providerOptions?.cursor?.highLevelToolCallResult;
        const failed = Boolean(hl?.isError) || Boolean(hl?.output && !("success" in hl.output));
        for (const p of parts)
          if (p?.type === "tool-result")
            t.toolResult(p.toolCallId, { isError: failed, output: p.result });
      } else if (m.role === "user") {
        if (m.providerOptions?.cursor?.isSummary) {
          t.compaction();
          t.summaryText(partsText(parts));
        } else user(partsText(parts));
      }
    }
  } else if (e.transcript) {
    // Transcripts keep only the messages: no model, no tool results, no times.
    let u = 0;
    for await (const d of jsonLines(e.transcript)) {
      const parts = d.message?.content ?? [];
      if (d.role === "assistant") {
        const id = `a${n++}`;
        t.turn(id, { model });
        for (const p of parts) {
          if (p?.type === "text") t.text(id, (p.text ?? "").length);
          else if (p?.type === "tool_use") {
            const args = p.input ?? {};
            t.text(id, JSON.stringify(args).length);
            t.toolUse(`${id}:${u++}`, cursorTool(p.name, args), {
              shell: CURSOR_SHELL.has(p.name) ? args.command : undefined,
              readPath: p.name === "Read" ? args.path : undefined,
            });
          }
        }
      } else if (d.role === "user") user(partsText(parts));
    }
  }
  return t.done();
}

// Google Antigravity: ~/.gemini/antigravity*/conversations/<id>.db (SQLite holding protobuf) ----

const ANTIGRAVITY_ROOTS = ["antigravity", "antigravity-ide", "antigravity-cli"];

export function listAntigravity(home) {
  const entries = new Map();
  for (const root of ANTIGRAVITY_ROOTS) {
    const dir = path.join(home, ".gemini", root, "conversations");
    for (const file of walkFiles(dir, (n) => n.endsWith(".db"))) {
      if (path.dirname(file) !== dir) continue;
      const id = path.basename(file, ".db");
      // An empty -wal is not a change: SQLite leaves one behind after a clean close.
      const sts = [file, ...(walSize(file) ? [`${file}-wal`] : [])].map((f) => fs.statSync(f));
      const size = sts.reduce((a, s) => a + s.size, 0);
      if ((entries.get(id)?.size ?? -1) >= size) continue;
      entries.set(id, { id, file, root, size, mtime: Math.max(...sts.map((s) => s.mtimeMs)) });
    }
  }
  return [...entries.values()].map((e) => ({
    sessionId: e.id,
    files: 1,
    bytes: e.size,
    mtime: e.mtime,
    cwd: async () => (await antigravityMeta(e.file))?.cwd ?? null,
    load: async () => ({ main: await scanAntigravity(e.file, e.root), subs: [] }),
  }));
}

async function antigravityMeta(file) {
  const db = await openDb(file);
  const row = db?.prepare("select data from trajectory_metadata_blob limit 1").get();
  if (!row) return null;
  const b = Buffer.from(row.data);
  return { cwd: fileOf(pbStr(b, "1.1")), slug: pbStr(b, "1.3.1"), created: pbTime(b, "2") };
}

/** One Antigravity chat → counts. Turns and tokens come from gen_metadata, one row per model call. */
export async function scanAntigravity(file, root) {
  const db = await openDb(file);
  if (!db) return null;
  const tables = new Set(
    db
      .prepare("select name from sqlite_master where type = 'table'")
      .all()
      .map((r) => r.name),
  );
  if (!tables.has("steps") || !tables.has("gen_metadata")) return null;
  const t = new Tally();
  const meta = await antigravityMeta(file);
  t.meta({ cwd: meta?.cwd, entrypoint: root });
  t.slugHint = meta?.slug ?? null;
  t.at(meta?.created);
  for (const g of db.prepare("select idx, data from gen_metadata order by idx").all()) {
    const b = Buffer.from(g.data);
    t.turn(`g${g.idx}`, {
      model: pbStr(b, "1.19"),
      usage: {
        input: pbNum(b, "1.4.2") ?? 0,
        cacheWrite: pbNum(b, "1.4.4") ?? 0,
        cacheRead: pbNum(b, "1.4.5") ?? 0,
        output: pbNum(b, "1.4.3") ?? 0,
      },
    });
  }
  for (const s of db
    .prepare("select idx, step_type, status, metadata, step_payload from steps order by idx")
    .all()) {
    const md = s.metadata ? Buffer.from(s.metadata) : null;
    const pay = s.step_payload ? Buffer.from(s.step_payload) : null;
    const ms = pbTime(md, "1");
    t.at(ms);
    if (s.step_type === 14) {
      const text = pbStr(pay, "19.2");
      if (text) t.userText(text, ms);
    } else if (s.step_type === 15) {
      t.text(null, (pbStr(pay, "20.3") ?? "").length);
      for (const call of pbAll(pay ?? Buffer.alloc(0), "20.7")) {
        const name = pbStr(call, "2") ?? "?";
        const raw = pbStr(call, "3") ?? "";
        const args = jsonOr(raw);
        t.text(null, raw.length);
        t.toolUse(pbStr(call, "1"), name, {
          shell: name === "run_command" ? args.CommandLine : undefined,
          readPath: name === "view_file" ? args.AbsolutePath : undefined,
        });
      }
    } else if (s.step_type === 101) t.closeOutput(pbStr(pay, "114.2.2") ?? "");
    else {
      const useId = pbStr(md, "4.1");
      if (!useId) continue;
      const exit = s.step_type === 21 ? pbNum(pay, "28.6") : null;
      t.toolResult(useId, {
        isError: s.status === 7 || (exit !== null && exit !== 0),
        output: s.step_type === 21 ? pbStr(pay, "28.21.1") : undefined,
      });
    }
  }
  return t.done();
}

/** Every host the script reads, by the `platform` its rows carry. */
export const HOSTS = {
  "claude-code": listClaude,
  codex: listCodex,
  opencode: listOpencode,
  cursor: listCursor,
  antigravity: listAntigravity,
};

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

/**
 * @param {{platform: string, list: () => Promise<object[]>|object[]}[]} hosts
 * @param {string|null} checkout  this checkout's root: its run logs are read with those of every
 *   repo a chat ran in
 * Returns the rows appended, per platform what was found and skipped, and the same for runs.
 */
export async function scan({
  hosts,
  statsFile,
  settleHours,
  checkout = null,
  now = Date.now(),
  dryRun = false,
}) {
  const ledger = readLedger(statsFile);
  const known = latestChats(ledger);
  const settledBefore = now - settleHours * HOUR_MS;
  const rows = [];
  const byPlatform = {};
  const roots = [checkout];
  for (const { platform, list } of hosts) {
    const s = (byPlatform[platform] = {
      found: 0,
      appended: 0,
      open: 0,
      unchanged: 0,
      empty: 0,
      error: null,
    });
    try {
      for (const chat of await list()) {
        s.found++;
        roots.push(resolveRepo(await chat.cwd()).root);
        // A host writing right now reports Infinity: open.
        const settled = chat.mtime <= settledBefore;
        if (!settled) s.open++;
        const was = known.get(`${platform}:${chat.sessionId}`);
        if (was?.sourceBytes === chat.bytes && (was.settled ?? true) === settled) {
          s.unchanged++;
          continue;
        }
        const { main, subs } = await chat.load();
        if (!main) {
          s.empty++;
          continue;
        }
        let repo = resolveRepo(main.cwd);
        if (repo.slug === "none" && main.slugHint) repo = { slug: main.slugHint, root: null };
        const row = chatRow(
          platform,
          chat.sessionId,
          main,
          subs,
          repo,
          versionHistory(repo.root),
          chat,
        );
        rows.push({
          ...row,
          lastActivityAt: Number.isFinite(chat.mtime) ? Math.round(chat.mtime) : now,
          settled,
        });
        s.appended++;
      }
    } catch (err) {
      s.error = err instanceof Error ? err.message : String(err);
    }
  }
  // Chats counted before and in this scan, newest row per chat.
  const chats = new Map(known);
  for (const r of rows) chats.set(r.key, r);
  const runs = scanRuns({
    roots,
    known: latestRows(ledger, "run"),
    settledBefore,
    now,
    chats: chats.values(),
  });
  rows.push(...runs.rows);
  rows.sort((a, b) => a.ts - b.ts);
  if (!dryRun) appendRows(statsFile, rows);
  return { rows, byPlatform, runs: runs.stats };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

/** A row a workflow wrote, not one this script wrote (`chat`, `run`). */
const workflowRow = (r) => r.kind !== "chat" && r.kind !== "run";

/** fp → readable name, for every repo found on this machine and every issue up to the max. */
/**
 * The complexity check's own reason, quoted from its report on this machine: the first paragraph
 * of `## Session Fit Estimate`, cut to 160 characters. Null when the folder or section is missing.
 */
export function checkReason(dir) {
  const text = dir ? readIf(path.join(dir, "plan-complexity-check.md")) : null;
  const para = text
    ?.match(/(?:^|\n)## Session Fit Estimate[ \t]*\n+([\s\S]*?)(?=\n[ \t]*\n|\n#|$)/)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  if (!para) return null;
  const cut = para.length > 160 ? `${para.slice(0, 159)}…` : para;
  return cut.replace(/\|/g, "\\|");
}

/** `run` row `fid` → its run-log folder, for every repo resolved so far: the report reads reports there. */
export function logDirIndex() {
  const dirs = new Map();
  for (const { slug, root } of repoCache.values())
    if (root)
      for (const dir of runLogDirs(root))
        dirs.set(fingerprint(`${slug}:${path.basename(dir)}`), dir);
  return dirs;
}

export async function buildLookup(hosts, ledgerRows) {
  const slugs = new Set(
    ledgerRows.filter((r) => workflowRow(r) && r.repo).map((r) => r.repo.replace(/^@/, "")),
  );
  slugs.add("none");
  for (const { list } of hosts) {
    try {
      for (const chat of await list()) slugs.add(resolveRepo(await chat.cwd()).slug);
    } catch {
      // a host that cannot be listed adds no names
    }
  }
  for (const { slug } of repoCache.values()) slugs.add(slug);
  const names = new Map();
  for (const s of slugs) names.set(repoFp(s), s === "none" ? "(no repo)" : s.split("/").pop());
  for (const { slug, root } of repoCache.values()) {
    if (!root) continue;
    for (const dir of runLogDirs(root)) {
      names.set(fingerprint(`${slug}:${path.basename(dir)}`), path.basename(dir));
    }
  }
  const wanted = new Set(
    ledgerRows
      .filter((r) => r.kind === "chat" || r.kind === "run")
      .flatMap((r) => [r.issue, ...(r.issues ?? []), ...(r.mentioned ?? [])]),
  );
  wanted.delete(null);
  for (const s of slugs) {
    const short = names.get(repoFp(s));
    for (let n = 1; n <= ISSUE_LOOKUP_MAX && wanted.size; n++) {
      const fp = issueFp(s, n);
      if (wanted.has(fp)) {
        names.set(fp, `${short}#${n}`);
        wanted.delete(fp);
      }
    }
  }
  return names;
}

/**
 * Workflow rows (not `chat` or `run` rows) from the `.bkit/stats.jsonl` of every repo resolved so
 * far and of each of its worktrees (rows not yet merged), other than `statsFile` and without
 * rows `statsFile` already has — read only, to link chats and runs to the rows those repos recorded.
 */
export function otherLedgerRows(statsFile) {
  const own = path.resolve(statsFile);
  const seenRows = new Set(readLedger(own).map((r) => JSON.stringify(r)));
  const seen = new Set([own]);
  const rows = [];
  for (const { root } of repoCache.values()) {
    if (!root) continue;
    const wt = path.join(root, ".worktrees");
    const bases = [
      root,
      ...(fs.existsSync(wt) ? fs.readdirSync(wt).map((d) => path.join(wt, d)) : []),
    ];
    for (const base of bases) {
      const file = path.resolve(base, ".bkit", "stats.jsonl");
      if (seen.has(file)) continue;
      seen.add(file);
      for (const r of readLedger(file).filter(workflowRow)) {
        const k = JSON.stringify(r);
        if (seenRows.has(k)) continue;
        seenRows.add(k);
        rows.push(r);
      }
    }
  }
  return rows;
}

const median = (xs) => quantile(xs, 0.5);
function quantile(xs, q) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.round(q * (s.length - 1)))];
}
const M = (n) => (n / 1e6).toFixed(1);
/**
 * One name per model across hosts: `anthropic/claude-opus-5.5` (OpenRouter), `claude-opus-5-5-high-fast`
 * (Cursor: effort and speed in the name) and `claude-opus-5-5` all → `claude-opus-5-5`. Rows keep the host's name.
 */
export function modelFamily(model) {
  if (!model || model === "?") return "(not recorded)";
  let m = model
    .toLowerCase()
    .replace(/^.*\//, "")
    .replace(/^cursor-/, "");
  m = m.replace(/(\d)\.(\d)/g, "$1-$2");
  for (;;) {
    const next = m.replace(/-(?:low|medium|high|xhigh|max|fast|thinking|default)$/, "");
    if (next === m) return m;
    m = next;
  }
}
/** A row written before its chat or run settled: counted in totals and lists, not in medians. */
const isOpen = (r) => r.settled === false;
const settledOnly = (rs) => rs.filter((r) => !isOpen(r));
const openMark = (r) => (isOpen(r) ? " (open)" : "");
/** Tokens read of the settled chats whose host records token counts (Cursor does not). */
const readsOf = (rs) =>
  settledOnly(rs)
    .filter((c) => c.tokensRecorded !== false)
    .map((c) => c.tokens.read);
const medRead = (rs, q = 0.5) => {
  const xs = readsOf(rs);
  return xs.length ? M(quantile(xs, q)) : "-";
};
const pct = (n) => `${(100 * n).toFixed(0)}%`;
const day = (ms) => new Date(ms).toLocaleDateString("en-CA");
/** Rows whose host records token counts. */
const counted = (rs) => rs.filter((c) => c.tokensRecorded !== false);
/** Token types summed over chats: fresh input, cache written, cache read, read, written (est.). */
function tokenTypes(rs) {
  const t = { input: 0, cacheWrite: 0, cacheRead: 0, read: 0, outputEst: 0 };
  for (const c of counted(rs)) for (const k of Object.keys(t)) t[k] += c.tokens[k] ?? 0;
  return t;
}
/** Share of tokens read that came from the cache; "-" with nothing read. */
const cacheShare = (t) => (t.read ? pct(t.cacheRead / t.read) : "-");
const minutesOf = (ms) => Math.round(ms / 60000);

/** ISO week of a local date: `2026-W43`, with its Monday. */
export function isoWeek(ms) {
  const d = new Date(ms);
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (local.getDay() + 6) % 7;
  const monday = new Date(local.getTime() - dow * DAY_MS);
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  const week = 1 + Math.floor((thursday - jan1) / (7 * DAY_MS));
  return {
    key: `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`,
    monday: day(monday.getTime()),
  };
}

/** Chat kinds the report groups by. */
export function chatClass(r) {
  if (r.bkitVia?.includes("command") && r.bkitWorkflows?.length) {
    return r.otherSubagents > r.bkitSubagents ? "workbench" : "workflow";
  }
  if (r.bkit) return "bkit agents only";
  return "other";
}

/** Links for each chat: exact / time / issue, plus the version the links imply. */
export function linkChats(chats, ledgerRows) {
  const others = ledgerRows.filter(workflowRow);
  const bySha = new Map();
  for (const r of others)
    if (r.parentSha)
      (bySha.get(r.parentSha) ?? bySha.set(r.parentSha, []).get(r.parentSha)).push(r);
  const byIssue = new Map();
  for (const c of chats)
    for (const fp of uniq([...(c.issues ?? []), ...(c.mentioned ?? [])])) {
      (byIssue.get(fp) ?? byIssue.set(fp, []).get(fp)).push(c);
    }
  const links = new Map();
  for (const c of chats) {
    const exact = (c.parentShas ?? []).flatMap((s) => bySha.get(s) ?? []);
    // A workflow chat links only to rows of its own workflows: a long chat overlaps other runs.
    const time = others.filter(
      (r) =>
        repoFp(String(r.repo).replace(/^@/, "")) === c.repo &&
        r.ts >= c.start &&
        r.ts <= c.end + TIME_LINK_GRACE_MS &&
        (!c.bkitWorkflows?.length || c.bkitWorkflows.includes(r.workflow)),
    );
    const issue = uniq(
      [...(c.issues ?? []), ...(c.mentioned ?? [])].flatMap((fp) => byIssue.get(fp) ?? []),
    ).filter((o) => o.key !== c.key);
    let version = c.bkitVersion;
    let versionSource = c.bkitVersionSource;
    if (version === "none") {
      const from = [
        ["exact", exact],
        ["time", time],
        ["issue", issue.filter((o) => o.bkitVersion !== "none")],
      ].find(([, rs]) => rs.length);
      if (from) {
        version = from[1][0].bkitVersion;
        versionSource = from[0];
      }
    }
    links.set(c.key, { exact, time, issue, version, versionSource });
  }
  return links;
}

function table(head, rows) {
  if (!rows.length) return "_none yet_\n";
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...rows.map(line)].join("\n") + "\n";
}

/**
 * @param {object[]} ledgerRows  every row of this checkout's `.bkit/stats.jsonl`
 * @param {Map<string, string>} names  buildLookup()
 * @param {object[]} extraRows  workflow rows from other repos' ledgers, for links only
 * @param {Map<string, string>} logDirs  logDirIndex(): where the report quotes run-log reports from
 */
export function renderReport(
  ledgerRows,
  names,
  extraRows = [],
  now = Date.now(),
  logDirs = new Map(),
) {
  const chats = [...latestChats(ledgerRows).values()].sort((a, b) => a.start - b.start);
  const links = linkChats(chats, [...ledgerRows, ...extraRows]);
  const name = (fp) => (fp ? (names.get(fp) ?? fp) : "-");
  const versionOf = (c) => links.get(c.key).version;
  const wfKey = (c) => c.bkitWorkflows.join("+");
  const workflowRuns = chats.filter((c) => chatClass(c) === "workflow");
  const out = [];

  out.push("# Chat stats\n");
  if (!chats.length) {
    out.push(
      "No `chat` rows in `.bkit/stats.jsonl` yet. Run `node scripts/stats/bkit-chat-stats.mjs`.\n",
    );
    return out.join("\n");
  }
  out.push(
    `Generated ${new Date(now).toISOString().slice(0, 16).replace("T", " ")} UTC from ${chats.length} chats ` +
      `(${day(chats[0].start)} to ${day(chats.at(-1).start)}) by \`scripts/stats/bkit-chat-stats.mjs\`. ` +
      "This file is local and gitignored: it shows the repo names and issue numbers that `.bkit/stats.jsonl` stores only as fingerprints.\n",
  );
  out.push(
    "- A **chat** is one session in one host (Claude Code, Codex, opencode, Cursor, Antigravity) plus all its subagents. **Tokens read** is the context sent on each turn, added up over every turn. " +
      "Cursor records no token counts: its chats count everywhere except in token medians.\n" +
      "- **Workflow run**: a `/bkit-*` command ran in the chat. **Workbench**: a workflow chat where non-bkit subagents outnumber bkit ones (reused by hand afterwards); left out of the workflow medians. " +
      "**bkit agents only**: bkit subagents ran but no `/bkit-*` command. **Other**: no bkit at all; medians use chats of " +
      `${OTHER_MIN_TURNS} turns or more.\n` +
      "- **Turns** are model calls. Output tokens are not shown: Claude Code's subagent transcripts record them about 12 times too low. " +
      "**Written, est.** is the text, thinking and tool input the model wrote, at 4 characters a token.\n" +
      "- Tokens read come in three types. **Fresh input** was sent without the cache. **Cache written** was sent and stored in the cache. **Cache read** came out of the cache. " +
      "On a subscription these cost nothing extra, so the report shows tokens, not dollars; the cache-read share says how much of each turn's context the host reused.\n" +
      "- **Run** rows come from the run logs (`docs/plans/<month>/logs/<feature>/status.jsonl`) of every repo a chat ran in: one row per workflow run, with its steps, verify rounds, challenge findings and plan shape.\n",
  );

  // Week by week
  const weeks = new Map();
  for (const c of chats) {
    const w = isoWeek(c.start);
    (weeks.get(w.key) ?? weeks.set(w.key, { ...w, chats: [] }).get(w.key)).chats.push(c);
  }
  const weekList = [...weeks.values()].sort((a, b) => b.key.localeCompare(a.key));
  out.push("## Week by week\n");
  out.push(
    table(
      [
        "Week",
        "bkit versions in use",
        "Chats",
        "Workflow runs",
        "Workbench",
        "bkit agents only",
        "Other",
        "Tokens read, M",
        "Workflow run median, M",
        "Other median, M",
        "Compactions",
      ],
      weekList.map((w) => {
        const by = (k) => w.chats.filter((c) => chatClass(c) === k);
        const versions = new Map();
        for (const c of w.chats) {
          const v = versionOf(c);
          if (v === "none") continue;
          (
            versions.get(name(c.repo)) ?? versions.set(name(c.repo), new Set()).get(name(c.repo))
          ).add(v);
        }
        const vtext =
          [...versions].map(([repo, vs]) => `${repo} ${[...vs].sort().join(", ")}`).join(" · ") ||
          "-";
        const other = by("other").filter((c) => c.turns >= OTHER_MIN_TURNS);
        return [
          `${w.key} (${w.monday})`,
          vtext,
          w.chats.length,
          by("workflow").length,
          by("workbench").length,
          by("bkit agents only").length,
          by("other").length,
          M(w.chats.reduce((a, c) => a + c.tokens.read, 0)),
          medRead(by("workflow")),
          medRead(other),
          w.chats.reduce((a, c) => a + c.compactions, 0),
        ];
      }),
    ),
  );

  const wfNames = uniq(workflowRuns.map(wfKey)).sort();
  out.push("### Workflow runs by week\n\nEach cell: runs · median tokens read, M.\n");
  out.push(
    table(
      ["Week", ...wfNames],
      weekList.map((w) => [
        `${w.key} (${w.monday})`,
        ...wfNames.map((k) => {
          const rs = w.chats.filter((c) => chatClass(c) === "workflow" && wfKey(c) === k);
          return rs.length ? `${rs.length} · ${medRead(rs)}` : "-";
        }),
      ]),
    ),
  );

  out.push("### Tokens by type, by week\n\nAll chats with token counts. M = millions of tokens.\n");
  out.push(
    table(
      [
        "Week",
        "Tokens read, M",
        "Fresh input, M",
        "Cache written, M",
        "Cache read, M",
        "Cache-read share",
        "Workflow runs' cache-read share",
        "Written, est. M",
      ],
      weekList.map((w) => {
        const t = tokenTypes(w.chats);
        if (!counted(w.chats).length) return [`${w.key} (${w.monday})`, ...Array(7).fill("-")];
        return [
          `${w.key} (${w.monday})`,
          M(t.read),
          M(t.input),
          M(t.cacheWrite),
          M(t.cacheRead),
          cacheShare(t),
          cacheShare(tokenTypes(w.chats.filter((c) => chatClass(c) === "workflow"))),
          M(t.outputEst),
        ];
      }),
    ),
  );

  // By bkit version
  out.push(
    "## By bkit version\n\nWorkflow runs only. The version is the one installed in the chat's repo when the chat started.\n",
  );
  const groups = new Map();
  for (const c of workflowRuns) {
    const k = `${versionOf(c)}\u0000${wfKey(c)}`;
    (groups.get(k) ?? groups.set(k, []).get(k)).push(c);
  }
  const semver = (v) =>
    v
      .split(/[.-]/)
      .map((p) => (/^\d+$/.test(p) ? p.padStart(6, "0") : p))
      .join(".");
  out.push(
    table(
      [
        "bkit version",
        "Workflow",
        "Runs",
        "Tokens read median, M",
        "p90, M",
        "Fresh input median, M",
        "Cache-read share",
        "Turns median",
        "Subagents median",
        "Orchestrator share",
        "Compactions per run",
        "Abort handovers",
      ],
      [...groups]
        .sort(([a], [b]) => semver(b).localeCompare(semver(a)))
        .map(([k, rs]) => {
          const [v, wf] = k.split("\u0000");
          return [
            v,
            wf,
            rs.length,
            medRead(rs),
            medRead(rs, 0.9),
            readsOf(rs).length
              ? M(median(settledOnly(counted(rs)).map((c) => c.tokens.input)))
              : "-",
            cacheShare(tokenTypes(rs)),
            settledOnly(rs).length ? median(settledOnly(rs).map((c) => c.turns)) : "-",
            settledOnly(rs).length ? median(settledOnly(rs).map((c) => c.subagents)) : "-",
            readsOf(rs).length
              ? pct(
                  median(
                    settledOnly(rs)
                      .filter((c) => c.tokensRecorded !== false)
                      .map((c) => c.main.read / Math.max(1, c.tokens.read)),
                  ),
                )
              : "-",
            (rs.reduce((a, c) => a + c.compactions, 0) / rs.length).toFixed(1),
            rs.reduce((a, c) => a + (c.agents["bkit-debug-abort-handover"]?.n ?? 0), 0),
          ];
        }),
    ),
  );

  // By platform
  const platforms = uniq(chats.map((c) => c.platform ?? DEFAULT_PLATFORM)).sort();
  out.push(
    "## By platform\n\nThe host the chat ran in. Each cell in the weekly table: chats · tokens read, M.\n",
  );
  out.push(
    table(
      [
        "Platform",
        "Chats",
        "Workflow runs",
        "Other",
        "Tokens read, M",
        "Workflow run median, M",
        "Host versions",
        "Chats without token counts",
      ],
      platforms.map((p) => {
        const rs = chats.filter((c) => (c.platform ?? DEFAULT_PLATFORM) === p);
        const wf = rs.filter((c) => chatClass(c) === "workflow");
        const versions = uniq(rs.map((c) => c.hostVersion).filter(Boolean)).sort((a, b) =>
          semver(b).localeCompare(semver(a)),
        );
        return [
          p,
          rs.length,
          wf.length,
          rs.filter((c) => chatClass(c) === "other").length,
          M(rs.reduce((a, c) => a + c.tokens.read, 0)),
          medRead(wf),
          versions.slice(0, 3).join(", ") +
            (versions.length > 3 ? ` (+${versions.length - 3})` : "") || "-",
          rs.filter((c) => c.tokensRecorded === false).length,
        ];
      }),
    ),
  );
  if (platforms.length > 1) {
    out.push(
      table(
        ["Week", ...platforms],
        weekList.map((w) => [
          `${w.key} (${w.monday})`,
          ...platforms.map((p) => {
            const rs = w.chats.filter((c) => (c.platform ?? DEFAULT_PLATFORM) === p);
            return rs.length
              ? `${rs.length} · ${M(rs.reduce((a, c) => a + c.tokens.read, 0))}`
              : "-";
          }),
        ]),
      ),
    );
  }

  // By model
  const byModel = new Map();
  for (const c of chats) {
    const counted = new Set();
    for (const [raw, m] of Object.entries(c.models ?? {})) {
      const model = modelFamily(raw);
      const g =
        byModel.get(model) ??
        byModel
          .set(model, {
            chats: 0,
            workflowChats: 0,
            turns: 0,
            read: 0,
            input: 0,
            cacheWrite: 0,
            cacheRead: 0,
            output: 0,
            outputEst: 0,
            platforms: new Set(),
            names: new Set(),
            weeks: new Map(),
          })
          .get(model);
      g.names.add(raw === "?" ? "-" : raw);
      if (!counted.has(model)) {
        counted.add(model);
        g.chats++;
        if (chatClass(c) === "workflow") g.workflowChats++;
      }
      g.turns += m.turns;
      g.read += m.read;
      // Rows written before per-model token types were stored lack input and cacheRead.
      g.input += m.input ?? 0;
      g.cacheRead += m.cacheRead ?? 0;
      g.cacheWrite += m.cacheWrite;
      g.output += m.output;
      g.outputEst += m.outputEst;
      g.platforms.add(c.platform ?? DEFAULT_PLATFORM);
      const wk = isoWeek(c.start).key;
      g.weeks.set(wk, (g.weeks.get(wk) ?? 0) + m.read);
    }
  }
  const allRead = [...byModel.values()].reduce((a, g) => a + g.read, 0) || 1;
  const models = [...byModel].sort(([, a], [, b]) => b.read - a.read || b.turns - a.turns);
  out.push(
    "## By model\n\nEvery turn counted under the model that answered it, subagents included. One row per model; **As named** lists how each host spells it.\n",
  );
  out.push(
    table(
      [
        "Model",
        "As named",
        "Platforms",
        "Chats",
        "In workflow runs",
        "Turns",
        "Tokens read, M",
        "Share",
        "Fresh input, M",
        "Cache written, M",
        "Cache read, M",
        "Cache-read share",
        "Written, est. k",
      ],
      models.map(([model, g]) => [
        model,
        [...g.names].sort().slice(0, 4).join(", ") +
          (g.names.size > 4 ? ` (+${g.names.size - 4})` : ""),
        [...g.platforms].sort().join(", "),
        g.chats,
        g.workflowChats,
        g.turns,
        M(g.read),
        pct(g.read / allRead),
        M(g.input),
        M(g.cacheWrite),
        M(g.cacheRead),
        cacheShare(g),
        Math.round(g.outputEst / 1000),
      ]),
    ),
  );
  const topModels = models.slice(0, 6).map(([m]) => m);
  if (topModels.length > 1) {
    out.push("### Models by week\n\nTokens read, M, for the six models that read the most.\n");
    out.push(
      table(
        ["Week", ...topModels],
        weekList.map((w) => [
          `${w.key} (${w.monday})`,
          ...topModels.map((m) => {
            const v = byModel.get(m).weeks.get(w.key);
            return v ? M(v) : "-";
          }),
        ]),
      ),
    );
  }

  // Where tokens go
  out.push("## Where workflow tokens go\n\nWorkflow runs, all weeks, summed per agent type.\n");
  for (const wf of wfNames) {
    const rs = workflowRuns.filter((c) => wfKey(c) === wf);
    const total = rs.reduce((a, c) => a + c.tokens.read, 0) || 1;
    const agg = new Map([["main session", { read: 0, n: 0, turns: 0 }]]);
    for (const c of rs) {
      const m = agg.get("main session");
      m.read += c.main.read;
      m.n++;
      m.turns += c.main.turns;
      for (const [t, a] of Object.entries(c.agents)) {
        const g = agg.get(t) ?? agg.set(t, { read: 0, n: 0, turns: 0 }).get(t);
        g.read += a.read;
        g.n += a.n;
        g.turns += a.turns;
      }
    }
    out.push(`### ${wf} (${rs.length} runs)\n`);
    out.push(
      table(
        ["Agent", "Share", "Agents", "Turns"],
        [...agg]
          .sort(([, a], [, b]) => b.read - a.read)
          .slice(0, 12)
          .map(([t, g]) => [t, pct(g.read / total), g.n, g.turns]),
      ),
    );
  }

  // Agents
  out.push(
    "## Agents\n\n" +
      `Every bkit agent type across all chats, plus the main session of workflow runs. **Over ${REPORT_CTX_COLUMNS.map((n) => `${n / 1000}k`).join(" / ")}**: agents whose largest turn sent at least that much context (from the stored peaks; the lines are this report's choice). ` +
      "Tool columns are calls per agent: **grep** = Grep tool + `grep`/`rg`, **sed / cat** = those shell reads, **find / ls** = Glob + those shell lists, **tests** = test-runner commands, **Serena** = Serena MCP calls.\n",
  );
  const agentAgg = new Map();
  const addAgent = (type, a, n) => {
    const g =
      agentAgg.get(type) ??
      agentAgg
        .set(type, {
          n: 0,
          read: 0,
          cacheRead: 0,
          input: 0,
          turns: 0,
          ctxPeakMax: 0,
          ctxPeaks: [],
          compactions: 0,
          mix: {},
          counted: true,
        })
        .get(type);
    g.n += n;
    for (const k of ["read", "cacheRead", "input", "turns", "compactions"]) g[k] += a[k] ?? 0;
    g.ctxPeaks.push(...(a.ctxPeaks ?? []));
    g.ctxPeakMax = Math.max(g.ctxPeakMax, a.ctxPeakMax ?? a.ctxPeak ?? 0);
    // Rows written before per-agent tool counts were stored have no `mix`.
    if (!a.mix) g.counted = false;
    for (const [k, v] of Object.entries(a.mix ?? {})) bump(g.mix, k, v);
  };
  for (const c of counted(chats)) {
    for (const [t, a] of Object.entries(c.agents ?? {}))
      if (t.startsWith("bkit-")) addAgent(t, a, a.n);
    if (chatClass(c) === "workflow") {
      const m = c.main;
      addAgent(
        "main session (workflow runs)",
        { ...m, ctxPeakMax: m.ctxPeak, ctxPeaks: [m.ctxPeak] },
        1,
      );
    }
  }
  const per = (g, k) => (g.counted && g.n ? (g.mix[k] ?? 0) / g.n : null);
  const one = (v) => (v === null ? "-" : v.toFixed(1));
  out.push(
    table(
      [
        "Agent",
        "Agents",
        "Tokens read per agent, M",
        "Cache-read share",
        "Turns per agent",
        "Peak context, k",
        ...REPORT_CTX_COLUMNS.map((n) => `Over ${n / 1000}k`),
        "Compactions",
        "Read",
        "Edit",
        "grep",
        "sed / cat",
        "find / ls",
        "tests",
        "Serena",
      ],
      [...agentAgg]
        .sort(([, a], [, b]) => b.read - a.read)
        .slice(0, 40)
        .map(([t, g]) => [
          t,
          g.n,
          (g.read / Math.max(1, g.n) / 1e6).toFixed(2),
          cacheShare(g),
          Math.round(g.turns / Math.max(1, g.n)),
          Math.round(g.ctxPeakMax / 1000),
          ...REPORT_CTX_COLUMNS.map((n) => g.ctxPeaks.filter((p) => p >= n).length),
          g.compactions,
          ...["read", "edit", "grep", "sedCat", "findLs", "tests", "serena"].map((k) =>
            one(per(g, k)),
          ),
        ]),
    ),
  );

  // Runs, from the run logs
  const runs = [...latestRows(ledgerRows, "run").values()].sort((a, b) => a.start - b.start);
  const outcomes = [...ledgerRows, ...extraRows].filter((r) => r.kind === "outcome");
  const outcomeBySha = new Map(outcomes.filter((r) => r.parentSha).map((r) => [r.parentSha, r]));
  const outcomeOf = (r) => (r.parentSha ? (outcomeBySha.get(r.parentSha) ?? null) : null);
  const featureName = (r) => (names.has(r.fid) ? names.get(r.fid) : name(r.issue));
  const churn = (c) => c.added + c.deleted;
  /** Code and test lines a run's own commits changed (git), or null. */
  const ownLines = (r) =>
    r.lines ? { code: churn(r.lines.code), tests: churn(r.lines.tests) } : null;
  const sumOr = (xs, f) => {
    const v = xs.map(f).filter((x) => x !== null && x !== undefined);
    return v.length ? v.reduce((a, b) => a + b, 0) : null;
  };

  // By feature
  out.push(
    "## By feature\n\n" +
      "One row per issue: every workflow run in its run logs and every chat that ran a `/bkit-*` command for it. " +
      "**Tasks** come from the plan run. **Code lines** and **test lines** are lines added plus deleted by the build and debug runs' own commits, from git: " +
      "each run's first to last commit, cut at every dev merge so merged-in work is left out; plans, run logs and ledgers are left out too. " +
      `**Active minutes**: time inside the issue's chats with no gap over ${IDLE_GAP_MS / 60_000} minutes between events; a gap is a human wait or an idle session. ` +
      `**M per 100 lines**: \`-\` under ${LINES_FLOOR} code and test lines. ` +
      "**Verify FAIL rounds**: build verify rounds that ended `FAIL`. **Debug after ship**: debug runs for the same issue that started after its ship run ended; a debug run filed under another issue is not counted.\n",
  );
  const features = new Map();
  const feat = (fp) =>
    features.get(fp) ?? features.set(fp, { runs: [], chats: [], repo: null }).get(fp);
  for (const r of runs)
    if (r.issue) {
      const f = feat(r.issue);
      f.runs.push(r);
      f.repo ??= r.repo;
    }
  for (const c of chats)
    for (const fp of c.bkitVia?.includes("command") ? (c.issues ?? []) : []) {
      const f = feat(fp);
      f.chats.push(c);
      f.repo ??= c.repo;
    }
  const featureRows = [...features]
    .map(([fp, f]) => {
      const t = tokenTypes(f.chats);
      const plan = f.runs.findLast((r) => r.workflow === "plan" && r.plan)?.plan;
      const buildOutcomes = f.runs
        .filter((r) => r.workflow === "build")
        .map(outcomeOf)
        .filter(Boolean);
      const coding = f.runs.filter((r) => r.workflow === "build" || r.workflow === "debug");
      const code = sumOr(coding, (r) => ownLines(r)?.code);
      const testLines = sumOr(coding, (r) => ownLines(r)?.tests);
      const lines = code === null ? null : code + testLines;
      const tasks =
        plan?.tasks ||
        (buildOutcomes.length ? Math.max(...buildOutcomes.map((o) => o.taskCount)) : null);
      const ship = f.runs.findLast((r) => r.workflow === "ship" && r.ending === "done");
      const wfCount = {};
      for (const r of f.runs) bump(wfCount, r.workflow);
      const openWf = new Set(f.runs.filter(isOpen).map((r) => r.workflow));
      const openChats = f.chats.filter(isOpen).length;
      const last = Math.max(...f.runs.map((r) => r.end), ...f.chats.map((c) => c.end));
      return {
        last,
        cells: [
          name(fp),
          uniq(f.runs.map(featureName)).join(", ") || "-",
          Object.entries(wfCount)
            .map(([w, n]) => `${n > 1 ? `${w}×${n}` : w}${openWf.has(w) ? " (open)" : ""}`)
            .join(", ") || "-",
          openChats ? `${f.chats.length} (${openChats} open)` : f.chats.length,
          counted(f.chats).length ? M(t.read) : "-",
          cacheShare(t),
          f.chats.length ? minutesOf(f.chats.reduce((a, c) => a + (c.end - c.start), 0)) : "-",
          f.runs.length ? Math.round(f.runs.reduce((a, r) => a + r.minutes, 0)) : "-",
          sumOr(f.runs, (r) => r.activeMinutes) === null
            ? "-"
            : Math.round(sumOr(f.runs, (r) => r.activeMinutes)),
          tasks ?? "-",
          code ?? "-",
          testLines ?? "-",
          tasks && t.read ? (t.read / tasks / 1e6).toFixed(1) : "-",
          lines >= LINES_FLOOR && t.read ? (t.read / (lines / 100) / 1e6).toFixed(2) : "-",
          f.runs.reduce(
            (a, r) => a + (r.verify ?? []).filter((v) => v.verdict === "FAIL").length,
            0,
          ),
          ship ? f.runs.filter((r) => r.workflow === "debug" && r.start > ship.end).length : "-",
        ],
      };
    })
    .sort((a, b) => b.last - a.last)
    .slice(0, 30);
  out.push(
    table(
      [
        "Issue",
        "Feature",
        "Runs",
        "Chats",
        "Tokens read, M",
        "Cache-read share",
        "Chat minutes",
        "Run minutes",
        "Active run minutes",
        "Tasks",
        "Code lines",
        "Test lines",
        "M per task",
        "M per 100 lines",
        "Verify FAIL rounds",
        "Debug after ship",
      ],
      featureRows.map((r) => r.cells),
    ),
  );

  out.push(
    "## Workflow runs, from the run logs\n\n" +
      "Every run is listed; one whose log changed within the settle window is **open**: counted here, left out of the medians. " +
      "**Ending**: `done` / `failed` from its last end row; `close-failed` = the work wrote `workflow-done` and only the close after it failed, or its last close found CI never started (a later close that started CI → `done`); with no end row, `decision-pause` when its `build-decision-*.md` is still `Status: OPEN`, else `stopped`. **Close CI not started**: closes, counted one by one, whose `ciDispatch` found CI never started, by reason.\n",
  );
  const wfs = uniq(runs.map((r) => r.workflow)).sort();
  /** Median of the known values, `-` when none is known; with how many runs it covers when not all. */
  const activeMedian = (xs) => {
    const known = xs.filter((x) => x !== null && x !== undefined);
    if (!known.length) return "-";
    const m = Math.round(median(known));
    return known.length === xs.length ? m : `${m} (${known.length} of ${xs.length})`;
  };
  const endings = ["done", "close-failed", "failed", "decision-pause", "stopped"];
  out.push(
    table(
      [
        "Workflow",
        "Runs",
        "Open",
        ...endings,
        "Minutes median",
        "Minutes p90",
        "Active minutes median",
        "Close CI not started",
      ],
      wfs.map((w) => {
        const rs = runs.filter((r) => r.workflow === w);
        const done = settledOnly(rs);
        return [
          w,
          rs.length,
          rs.filter(isOpen).length,
          ...endings.map((e) => rs.filter((r) => r.ending === e).length),
          done.length ? Math.round(median(done.map((r) => r.minutes))) : "-",
          done.length
            ? Math.round(
                quantile(
                  done.map((r) => r.minutes),
                  0.9,
                ),
              )
            : "-",
          activeMedian(done.map((r) => r.activeMinutes)),
          Object.entries(
            rs.reduce((a, r) => {
              for (const c of r.closeCi ?? [])
                if (c.outcome === "unresolved") bump(a, c.reason ?? "?");
              return a;
            }, {}),
          )
            .map(([k, n]) => `${n} ${k}`)
            .join(", ") || "-",
        ];
      }),
    ),
  );

  out.push(
    "### Build verify loop\n\n" +
      "**Verify rounds**: per sub-plan, each round's verdict and failure count (`P` PASS, `C` CONCERNS, `F` FAIL). **Test-order gaps**: per round, in the same order, `no-red`, `late-red` and the like in the round's report (`-` = report not read); " +
      "a later build of the same feature overwrites the reports, so an earlier build has them only for files last written during that build. **Gaps fixes**: gaps-remediate rounds by strategy. " +
      "**Findings** are the reconciled challenge's, by severity (critical / high / medium / low), next to the code and test lines the build's own commits changed.\n",
  );
  const letter = (v) => ({ PASS: "P", CONCERNS: "C", FAIL: "F" })[v] ?? "?";
  out.push(
    table(
      [
        "Started",
        "Feature",
        "bkit version",
        "Ending",
        "Minutes",
        "Active minutes",
        "Verify rounds",
        "Test-order gaps",
        "Gaps fixes",
        "Holistic",
        "Challenge",
        "Findings C/H/M/L",
        "Code / test lines",
      ],
      runs
        .filter((r) => r.workflow === "build")
        .slice(-30)
        .reverse()
        .map((r) => {
          const bySub = new Map();
          const gapsBySub = new Map();
          for (const v of r.verify ?? []) {
            const k = v.subPlan ?? "-";
            (bySub.get(k) ?? bySub.set(k, []).get(k)).push(
              `${letter(v.verdict)}${v.failures ?? ""}`,
            );
            (gapsBySub.get(k) ?? gapsBySub.set(k, []).get(k)).push(v.testOrderGaps ?? "-");
          }
          const gaps = (r.verify ?? []).filter((v) => v.testOrderGaps !== null);
          const strat = {};
          for (const g of r.gapsRemediate ?? []) bump(strat, (g.strategy ?? "?").toLowerCase());
          const fd = r.challenge?.findings;
          const own = ownLines(r);
          return [
            day(r.start),
            featureName(r) + openMark(r),
            r.bkitVersion,
            r.ending,
            Math.round(r.minutes),
            r.activeMinutes === null || r.activeMinutes === undefined
              ? "-"
              : Math.round(r.activeMinutes),
            [...bySub].map(([k, vs]) => `${k}: ${vs.join(" ")}`).join(" · ") || "-",
            gaps.length
              ? [...gapsBySub].map(([k, gs]) => `${k}: ${gs.join(" ")}`).join(" · ")
              : "-",
            Object.entries(strat)
              .map(([k, n]) => `${n} ${k}`)
              .join(", ") || "-",
            r.holistic ? `${letter(r.holistic.verdict)}${r.holistic.failures ?? ""}` : "-",
            r.challenge?.verdict ?? "-",
            fd ? `${fd.CRITICAL}/${fd.HIGH}/${fd.MEDIUM}/${fd.LOW}` : "-",
            own ? `${own.code} / ${own.tests}` : "-",
          ];
        }),
    ),
  );

  out.push(
    "### Plan shape\n\n" +
      "Measured on the plan the run closed with: its sub-plans when split, else the last version. **Tests** and **test files** are per task, median / p90 / max, from each task's `Test first` entries " +
      "(`-` = the plan predates that field); **at each count** = `count:tasks`. No limit is applied: the rows keep every task's numbers. " +
      "**Complexity** is the check's own verdict; **Check's reason** quotes its `Session Fit Estimate` from the report on this machine.\n",
  );
  const mm = (xs) =>
    xs?.length ? `${median(xs)} / ${quantile(xs, 0.9)} / ${Math.max(...xs)}` : "-";
  const atEach = (xs) => {
    if (!xs?.length) return "-";
    const n = {};
    for (const x of xs) bump(n, x);
    return Object.entries(n)
      .sort(([a], [b]) => a - b)
      .map(([k, v]) => `${k}:${v}`)
      .join(" ");
  };
  out.push(
    table(
      [
        "Closed",
        "Feature",
        "bkit version",
        "Plan KB",
        "Sub-plans",
        "Tasks",
        "Tests per task",
        "Tasks at each test count",
        "Test files per task",
        "Tasks at each test-file count",
        "Tasks without tests",
        "Complexity",
        "Check's reason",
      ],
      runs
        .filter((r) => r.workflow === "plan" && r.plan)
        .slice(-30)
        .reverse()
        .map((r) => [
          day(r.end),
          featureName(r) + openMark(r),
          r.bkitVersion,
          r.plan.kb,
          r.plan.subPlans,
          r.plan.tasks,
          mm(r.plan.testsPerTask),
          atEach(r.plan.testsPerTask),
          mm(r.plan.testFilesPerTask),
          atEach(r.plan.testFilesPerTask),
          r.plan.tasksWithoutTests ?? "-",
          r.plan.complexity?.verdict ?? "-",
          (r.plan.complexity && checkReason(logDirs.get(r.fid))) || "-",
        ]),
    ),
  );

  out.push(
    "### Minutes per step\n\nA step's minutes run from the status row before it to its own, so they include waiting. **Active** is the part of that time inside the issue's chats' active spans " +
      `(no gap over ${IDLE_GAP_MS / 60_000} minutes between events); runs with no counted chat have none. Shares and order use active minutes. ` +
      "Steps that ran more than once in a run (task reds, verify rounds) are summed per run first. Open runs are left out.\n",
  );
  for (const w of wfs) {
    const rs = settledOnly(runs.filter((r) => r.workflow === w));
    const withActive = rs.filter((r) => r.activeMinutes !== null && r.activeMinutes !== undefined);
    const activeTotal = withActive.reduce((a, r) => a + r.activeMinutes, 0) || 1;
    const sum = (xs) => xs.reduce((x, y) => x + y, 0);
    const agg = new Map();
    for (const r of rs) {
      for (const [st, { n, minutes, active }] of Object.entries(r.steps ?? {})) {
        const g = agg.get(st) ?? agg.set(st, { runs: 0, n: 0, mins: [], active: [] }).get(st);
        g.runs++;
        g.n += n;
        g.mins.push(minutes);
        if (active !== null && active !== undefined) g.active.push(active);
      }
    }
    out.push(`#### ${w} (${rs.length} runs, ${withActive.length} with active minutes)\n`);
    out.push(
      table(
        [
          "Step",
          "Runs",
          "Times run",
          "Minutes median",
          "Active minutes median",
          "Active minutes max",
          "Share of active time",
        ],
        [...agg]
          .sort(([, a], [, b]) => sum(b.active) - sum(a.active) || sum(b.mins) - sum(a.mins))
          .slice(0, 15)
          .map(([st, g]) => [
            st,
            g.runs,
            g.n,
            median(g.mins).toFixed(1),
            g.active.length ? median(g.active).toFixed(1) : "-",
            g.active.length ? Math.max(...g.active).toFixed(1) : "-",
            withActive.length ? pct(sum(g.active) / activeTotal) : "-",
          ]),
      ),
    );
  }

  // Links
  out.push(
    "## Recent bkit chats and their links\n\n" +
      "**exact**: the chat printed the `parentSha` of these rows (`bkit workflows close`). **time**: rows from the same repo and workflow written during the chat. **issue**: other chats about the same issue. " +
      "**Outcome** comes from the exact `outcome` row, or from the time-linked one when there is exactly one.\n",
  );
  const bkitChats = chats
    .filter((c) => c.bkit)
    .slice(-30)
    .reverse();
  out.push(
    table(
      [
        "Started",
        "Repo",
        "Issue",
        "Kind",
        "Workflows",
        "bkit version",
        "Tokens read, M",
        "exact",
        "time",
        "issue",
        "Outcome",
      ],
      bkitChats.map((c) => {
        const l = links.get(c.key);
        const kinds = (rs) =>
          rs.length
            ? uniq(rs.map((r) => r.kind))
                .map((k) => `${rs.filter((r) => r.kind === k).length} ${k}`)
                .join(", ")
            : "-";
        const timeOutcomes = l.time.filter((r) => r.kind === "outcome");
        const exactOutcome = l.exact.find((r) => r.kind === "outcome");
        const oc = exactOutcome ?? (timeOutcomes.length === 1 ? timeOutcomes[0] : null);
        return [
          day(c.start) + openMark(c),
          name(c.repo),
          name(c.issue),
          chatClass(c),
          c.bkitWorkflows.join("+") || c.bkitKinds.join("+") || "-",
          l.versionSource === "repo-history" || l.versionSource === "none"
            ? l.version
            : `${l.version} (${l.versionSource})`,
          M(c.tokens.read),
          kinds(l.exact),
          kinds(l.time),
          l.issue.length ? `${l.issue.length} chats` : "-",
          oc
            ? `${oc.linesChanged} lines, ${oc.taskCount} tasks, ${Math.round(oc.durationSeconds / 60)} min${exactOutcome ? "" : " (time)"}`
            : "-",
        ];
      }),
    ),
  );

  // Biggest chats
  const recent = chats
    .filter((c) => c.start >= now - 28 * DAY_MS)
    .sort((a, b) => b.tokens.read - a.tokens.read)
    .slice(0, 10);
  out.push("## Biggest chats, last 4 weeks\n");
  out.push(
    table(
      [
        "Started",
        "Repo",
        "Issue",
        "Kind",
        "Tokens read, M",
        "Turns",
        "Subagents",
        "Peak context, k",
        "Compactions",
        "Tool errors",
        "Human prompts",
      ],
      recent.map((c) => [
        day(c.start) + openMark(c),
        name(c.repo),
        name(c.issue),
        chatClass(c),
        M(c.tokens.read),
        c.turns,
        c.subagents,
        Math.round(c.tokens.ctxPeak / 1000),
        c.compactions,
        c.errors,
        c.userPrompts,
      ]),
    ),
  );
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    cmd: "scan",
    settleHours: DEFAULT_SETTLE_HOURS,
    dryRun: false,
    home: os.homedir(),
    only: Object.keys(HOSTS),
  };
  for (const a of argv) {
    if (a === "scan" || a === "report") opts.cmd = a;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a.startsWith("--settle-hours=")) opts.settleHours = Number(a.slice(15));
    else if (a.startsWith("--home=")) opts.home = a.slice(7);
    else if (a.startsWith("--platforms=")) opts.only = a.slice(12).split(",").filter(Boolean);
    else if (a.startsWith("--stats=")) opts.statsFile = a.slice(8);
    else if (a.startsWith("--report=")) opts.reportFile = a.slice(9);
    else return { error: `unknown argument: ${a}` };
  }
  if (!Number.isFinite(opts.settleHours) || opts.settleHours < 0)
    return { error: "--settle-hours must be a number >= 0" };
  const unknown = opts.only.filter((p) => !HOSTS[p]);
  if (unknown.length)
    return {
      error: `unknown platform: ${unknown.join(", ")} (known: ${Object.keys(HOSTS).join(", ")})`,
    };
  return opts;
}

/** The hosts to read, each listed at most once per run. */
export function hostsFor(home, platforms = Object.keys(HOSTS)) {
  return platforms.map((platform) => {
    let listed;
    return { platform, list: () => (listed ??= Promise.resolve(HOSTS[platform](home))) };
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error) {
    console.error(`[bkit-chat-stats] ${opts.error}`);
    return 2;
  }
  const top = git(process.cwd(), ["rev-parse", "--show-toplevel"])?.trim();
  if (!top && !(opts.statsFile && opts.reportFile)) {
    console.error("[bkit-chat-stats] run inside a git checkout, or pass --stats= and --report=");
    return 2;
  }
  const hosts = hostsFor(opts.home, opts.only);
  const statsFile = opts.statsFile ?? path.join(top, ".bkit", "stats.jsonl");
  const reportFile = opts.reportFile ?? path.join(top, ".bkit", "stats.md");
  let failed = false;
  try {
    if (opts.cmd === "scan") {
      const res = await scan({
        hosts,
        statsFile,
        settleHours: opts.settleHours,
        checkout: top ?? null,
        dryRun: opts.dryRun,
      });
      const verb = opts.dryRun ? "would append" : "appended";
      const n = (k) => res.rows.filter((r) => r.kind === k).length;
      console.log(
        `[bkit-chat-stats] ${verb} ${n("chat")} chat rows and ${n("run")} run rows to ${statsFile}`,
      );
      for (const [p, s] of Object.entries(res.byPlatform)) {
        if (s.error) {
          failed = true;
          console.error(`  ${p}: could not be read: ${s.error}`);
          continue;
        }
        console.log(
          `  ${p}: ${s.found} chats found, ${s.appended} ${verb}, ${s.unchanged} already counted, ` +
            `${s.open} open (changed in the last ${opts.settleHours}h), ${s.empty} with no turns`,
        );
      }
      const rs = res.runs;
      if (rs.error) {
        failed = true;
        console.error(`  run logs: could not be read: ${rs.error}`);
      } else {
        console.log(
          `  run logs: ${rs.found} runs found, ${rs.appended} ${verb}, ${rs.unchanged} already counted, ` +
            `${rs.open} open (changed in the last ${opts.settleHours}h)`,
        );
      }
      if (opts.dryRun) {
        for (const r of res.rows)
          console.log(
            r.kind === "run"
              ? `  ${day(r.start)} run ${r.workflow} ${r.ending} ${r.minutes} min`
              : `  ${day(r.start)} ${r.key} ${r.bkitWorkflows.join("+") || "-"} ${M(r.tokens.read)}M`,
          );
        return failed ? 1 : 0;
      }
    }
    const rows = readLedger(statsFile);
    const names = await buildLookup(hosts, rows);
    fs.writeFileSync(
      reportFile,
      renderReport(rows, names, otherLedgerRows(statsFile), Date.now(), logDirIndex()),
    );
    console.log(`[bkit-chat-stats] wrote ${reportFile}`);
    return failed ? 1 : 0;
  } catch (err) {
    console.error(`[bkit-chat-stats] ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
