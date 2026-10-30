// bkit-readguard.js — bkit ReadGuard plugin for opencode.
//
// When an agent re-reads a line range of a file it already read in this session, and
// the file has not changed since (same mtime and size), it appends a note to the tool
// result so the next read uses the earlier output instead. Covers the `read` tool and
// plain shell reads (`cat FILE`, `sed -n 'A,Bp' FILE`, `head` / `tail` with a line
// count) through the terminal tool (`shell` in v2, `bash` before v2).
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: appends the note to the tool RESULT in the after-execute hook.
//     The before-execute hook can only allow or block, so ReadGuard does not use it;
//     the note arrives with the repeated read, not before it.
//   - FAIL OPEN: every hook swallows its own errors.
//   - PER SESSION: keyed by sessionID. A subagent runs in its own session, so it never
//     inherits its parent's reads.
//   - COMPACTION: 1.x forgets a session's reads on `session.compacted`. 2.0 exposes no
//     event subscription to this plugin, so its log is not cleared on a summary; the
//     note tells the agent to re-read when the earlier output is no longer in context.
//   - STATE: OS temp dir, GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_READGUARD env var): unset → advisory [DEFAULT] | "off" → no-op.
//
// The engine inside the managed block is generated at install from bkit's
// `core/hooks/readguard-engine.js`, the same source as the Claude, Cursor, Codex and
// Antigravity hooks. See .bkit/providers.md § ReadGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no client calls, no stderr write, no throw — so it composes
// with your own checks in the exported plugin that follows the managed block.

// bkit:start

// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode tool names, lowercase in opencode's plugin API.
const READ_TOOLS = new Set(["read"]);
const SHELL_TOOLS = new Set(["shell", "bash"]);

// --- ReadGuard engine: identical in every host's hook (bkit renders it from one source).
// Needs `fs`, `os` and `path` in scope; the host's own code above declares them.

// Read tools stop here when the call gives no limit (Claude Code, opencode).
const READ_TOOL_DEFAULT_LIMIT = 2000;
// Larger files are not line-counted: a whole-file read of one stays open-ended and a
// `tail` of one is not tracked.
const LINE_COUNT_MAX_BYTES = 4 * 1024 * 1024;
// Stored end of an open-ended range (`cat`, `sed -n 'A,$p'`) on an uncounted file.
const OPEN_END = Number.MAX_SAFE_INTEGER;

// Outside quotes, any of these makes a command more than one plain read (pipe, list,
// redirect, substitution, glob, escape); such a command is not tracked.
const SHELL_COMPLEX_CHARS = new Set([..."|;&<>`$(){}*?[]\\\n"]);

/**
 * Words of a single plain shell command, quotes removed; null when the command
 * carries anything ReadGuard does not model (see SHELL_COMPLEX_CHARS, `$` or a
 * backtick inside double quotes, unbalanced quotes).
 */
function shellWords(cmd) {
  const words = [];
  let word = null;
  let quote = null;
  for (const ch of String(cmd).trim()) {
    if (quote) {
      if (ch === quote) quote = null;
      else if (quote === '"' && (ch === "$" || ch === "`" || ch === "\\")) return null;
      else word += ch;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      word = word ?? "";
    } else if (ch === " " || ch === "\t") {
      if (word !== null) words.push(word);
      word = null;
    } else if (SHELL_COMPLEX_CHARS.has(ch)) {
      return null;
    } else {
      word = (word ?? "") + ch;
    }
  }
  if (quote) return null;
  if (word !== null) words.push(word);
  return words;
}

/** `head` / `tail` line count: `-n N`, `-nN`, `-N`, `--lines=N`; tail also `+N`. */
function lineCountArg(args) {
  const rest = [];
  let count = { n: 10, fromStart: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    let v = null;
    if (a === "-n" || a === "--lines") v = args[++i];
    else if (/^-n.+/.test(a)) v = a.slice(2);
    else if (/^--lines=/.test(a)) v = a.slice("--lines=".length);
    else if (/^-\d+$/.test(a)) v = a.slice(1);
    else if (a.startsWith("-")) return null;
    else {
      rest.push(a);
      continue;
    }
    const m = /^(\+)?(\d+)$/.exec(v ?? "");
    if (!m) return null;
    count = { n: Number(m[2]), fromStart: Boolean(m[1]) };
  }
  return { count, files: rest };
}

/**
 * File reads a shell command performs, as `[{ file, start, end }]` or
 * `[{ file, tail }]`: `cat FILE…`, `sed -n 'A,Bp' FILE…`, `head` / `tail` with a
 * line count. Anything else (pipes, globs, other programs, other flags) → [].
 */
function shellReadTargets(cmd, cwd) {
  const words = shellWords(cmd);
  if (!words || words.length < 2) return [];
  const prog = words[0].replace(/^.*\//, "");
  const args = words.slice(1);
  const at = (f) => path.resolve(cwd, f);

  if (prog === "cat") {
    const files = args.filter((a) => !a.startsWith("-"));
    return files.map((f) => ({ file: at(f), start: 1, end: OPEN_END }));
  }
  if (prog === "sed") {
    if (args[0] !== "-n" || args.length < 3) return [];
    const m = /^(\d+)(?:,(\d+|\$))?p$/.exec(args[1]);
    if (!m || args.slice(2).some((a) => a.startsWith("-"))) return [];
    const start = Number(m[1]);
    const end = m[2] === undefined ? start : m[2] === "$" ? OPEN_END : Number(m[2]);
    return args.slice(2).map((f) => ({ file: at(f), start, end }));
  }
  if (prog === "head" || prog === "tail") {
    const parsed = lineCountArg(args);
    if (!parsed) return [];
    const { count, files } = parsed;
    if (prog === "head") return files.map((f) => ({ file: at(f), start: 1, end: count.n }));
    if (count.fromStart) return files.map((f) => ({ file: at(f), start: count.n, end: OPEN_END }));
    return files.map((f) => ({ file: at(f), tail: count.n }));
  }
  return [];
}

/** A read tool's target: 1-based `start` plus `limit` lines, or an explicit `end`. */
function toolReadTarget(file, cwd, start, limit, end) {
  if (typeof file !== "string" || !file) return [];
  const s = Number.isInteger(start) && start > 0 ? start : 1;
  const e =
    Number.isInteger(end) && end >= s
      ? end
      : s + (Number.isInteger(limit) && limit > 0 ? limit : READ_TOOL_DEFAULT_LIMIT) - 1;
  return [{ file: path.resolve(cwd, file), start: s, end: e }];
}

function countLines(file) {
  const text = fs.readFileSync(file, "utf-8");
  if (text.length === 0) return 0;
  let n = 0;
  for (let i = text.indexOf("\n"); i >= 0; i = text.indexOf("\n", i + 1)) n++;
  return text.endsWith("\n") ? n : n + 1;
}

/** `[start, end]` clipped to the file's line count, or null when not trackable. */
function resolveRange(target, lines) {
  if (target.tail !== undefined) {
    if (lines === null) return null;
    return [Math.max(1, lines - target.tail + 1), Math.max(1, lines)];
  }
  const end = lines === null ? target.end : Math.min(target.end, Math.max(1, lines));
  return target.start > end ? null : [target.start, end];
}

function mergeRanges(ranges) {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]);
    else out.push([r[0], r[1]]);
  }
  return out;
}

function isCovered(ranges, [start, end]) {
  return mergeRanges(ranges).some(([s, e]) => s <= start && end <= e);
}

// Per user: on a temp dir users share (Linux `/tmp`) another user's copy cannot be written.
function readStateDir() {
  return path.join(
    os.tmpdir(),
    typeof process.getuid === "function" ? `bkit-readguard-${process.getuid()}` : "bkit-readguard",
  );
}

// Read logs this process could not write, standing in for them for the process's life.
const readLogsInProcess = new Map();

function safeKey(value, fallback) {
  const s = typeof value === "string" ? value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
  return s || fallback;
}

// One log per (session, agent). A subagent that shares its parent's session id still
// gets its own log when the host passes an agent id.
function readLogFile(sessionId, agentId) {
  return path.join(
    readStateDir(),
    `${safeKey(sessionId, "no-session")}.${safeKey(agentId, "main")}.json`,
  );
}

// Absent log is the normal first-read case (guarded, no throw); a corrupt one throws
// to the host's top-level fail-open boundary and that one call no-ops.
function loadReadLog(file) {
  if (readLogsInProcess.has(file)) return readLogsInProcess.get(file);
  if (!fs.existsSync(file)) return { files: {} };
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  return parsed && typeof parsed.files === "object" && parsed.files ? parsed : { files: {} };
}

// Opportunistic TTL: drops logs older than 24h.
function gcOldReadLogs() {
  const dir = readStateDir();
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name);
    const stat = fs.statSync(f, { throwIfNoEntry: false });
    if (stat && stat.mtimeMs < cutoff) fs.rmSync(f, { force: true });
  }
}

/**
 * Forgets every read of a session, all its agents included. Hosts call it when the
 * conversation is summarised: earlier read output is no longer in context.
 */
function resetReadLog(sessionId) {
  const prefix = `${safeKey(sessionId, "no-session")}.`;
  for (const file of readLogsInProcess.keys()) {
    if (path.basename(file).startsWith(prefix)) readLogsInProcess.delete(file);
  }
  const dir = readStateDir();
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith(prefix)) fs.rmSync(path.join(dir, name), { force: true });
  }
}

function displayPath(file, cwd) {
  const rel = path.relative(cwd, file);
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel) ? rel : file;
}

function repeatReadMessage(repeats, cwd) {
  const lines = repeats.map(
    ({ file, range }) =>
      `- \`${displayPath(file, cwd)}\` lines ${range[0]}-${range[1] === OPEN_END ? "end" : range[1]}`,
  );
  return (
    `[bkit ReadGuard] Repeat read in this conversation. These lines are unchanged since your last read:\n` +
    `${lines.join("\n")}\n` +
    `Use the earlier output instead of reading these lines again.\n` +
    `If that output is no longer in your context (summarised, or read by another agent), re-read the lines.\n` +
    `Advisory: proceed once satisfied.`
  );
}

/**
 * The advisory for reading `targets` again, or null when ReadGuard is off, nothing is
 * trackable, or no target repeats an earlier read of the same unchanged file by the
 * same (session, agent). Records every trackable target. Fail-open: a log write error
 * still returns the note and the process keeps the log, so a long-lived host (opencode)
 * still sees its repeats.
 */
function repeatReadAdvice(targets, sessionId, agentId, cwd) {
  if (process.env.BKIT_READGUARD === "off") return null;
  if (!Array.isArray(targets) || targets.length === 0) return null;

  const logFile = readLogFile(sessionId, agentId);
  const log = loadReadLog(logFile);
  const repeats = [];
  let changed = false;

  for (const target of targets) {
    const stat = fs.statSync(target.file, { throwIfNoEntry: false });
    if (!stat || !stat.isFile()) continue;
    const lines = stat.size <= LINE_COUNT_MAX_BYTES ? countLines(target.file) : null;
    const range = resolveRange(target, lines);
    if (!range) continue;

    const prev = log.files[target.file];
    const fresh = Boolean(prev) && prev.mtimeMs === stat.mtimeMs && prev.size === stat.size;
    if (fresh && isCovered(prev.ranges, range)) repeats.push({ file: target.file, range });
    log.files[target.file] = {
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      ranges: mergeRanges([...(fresh ? prev.ranges : []), range]),
    };
    changed = true;
  }

  try {
    if (changed) {
      fs.mkdirSync(readStateDir(), { recursive: true });
      fs.writeFileSync(logFile, JSON.stringify(log), "utf-8");
      readLogsInProcess.delete(logFile);
    }
    gcOldReadLogs();
  } catch {
    readLogsInProcess.set(logFile, log);
  }

  return repeats.length > 0 ? repeatReadMessage(repeats, cwd) : null;
}

// Pure: takes the tool name, its arguments and the session id; returns the note to
// append or null. `read` takes `path` (2.0) or `filePath` (1.x); 1-based `offset` plus
// `limit`, the whole file when neither is given. The terminal tool takes `command` and
// an optional `workdir`.
function bkitReadguard(tool, args, sessionID) {
  const input = args && typeof args === "object" ? args : {};
  const cwd = typeof input.workdir === "string" ? input.workdir : process.cwd();
  let targets = [];
  if (READ_TOOLS.has(tool)) {
    const paged = input.offset !== undefined || input.limit !== undefined;
    targets = toolReadTarget(
      input.path ?? input.filePath,
      cwd,
      input.offset,
      input.limit,
      paged ? undefined : OPEN_END,
    );
  } else if (SHELL_TOOLS.has(tool)) {
    targets = shellReadTargets(typeof input.command === "string" ? input.command : "", cwd);
  }
  return repeatReadAdvice(targets, sessionID, undefined, cwd);
}

// bkit:end

// ---------------------------------------------------------------------------
// Driver — the one export shape OpenCode 1.x and 2.0 both load (same as
// `bkit-gateguard.js`): 2.0 calls `setup(ctx)` and registers `execute.after`; 1.18.29+
// calls `server()` and uses `"tool.execute.after"` plus the `event` hook.
// ---------------------------------------------------------------------------

/** OpenCode 1.x after hook: append the note to `output.output`, the result text. */
async function bkitReadGuardAfterV1(hookInput, output) {
  try {
    const { tool, sessionID, args } = hookInput ?? {};
    if (!output || typeof output !== "object") return;
    const context = bkitReadguard(tool, args ?? output.args, sessionID);
    if (!context) return;
    const existing = typeof output.output === "string" ? output.output : "";
    output.output = existing.length > 0 ? `${existing}\n\n${context}` : context;
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

/** OpenCode 1.x event hook: forget a session's reads once it is compacted. */
async function bkitReadGuardEventV1({ event } = {}) {
  try {
    if (event?.type === "session.compacted") resetReadLog(event.properties?.sessionID);
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

/** OpenCode 2.0 after hook: append the note to `event.result.content`. */
async function bkitReadGuardAfterV2(event) {
  try {
    if (event?.status !== "completed" || !event.result) return;
    const context = bkitReadguard(event.tool, event.input, event.sessionID);
    if (!context) return;
    const content = Array.isArray(event.result.content) ? event.result.content : [];
    event.result.content = [...content, { type: "text", text: context }];
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

const bkitReadGuardPlugin = {
  id: "bkit-readguard",
  async setup(ctx) {
    await ctx.tool.hook("execute.after", bkitReadGuardAfterV2);
  },
  async server() {
    return {
      "tool.execute.after": bkitReadGuardAfterV1,
      event: bkitReadGuardEventV1,
    };
  },
};

export default bkitReadGuardPlugin;
