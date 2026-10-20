#!/usr/bin/env node
// bkit-readguard.cjs — bkit ReadGuard advisory hook (Claude Code).
//
// Fires before Read and Bash. When an agent reads a line range of a file it already
// read in this conversation, and the file has not changed since (same mtime and size),
// it injects a note so the agent uses the earlier output instead of paying for the
// same lines again. Shell reads are recognised in their plain forms only: `cat FILE`,
// `sed -n 'A,Bp' FILE`, `head` / `tail` with a line count. Pipes, globs, lists and
// substitutions are not tracked. On PreCompact it forgets the session's reads: the
// summary drops the earlier output, so re-reading is right again.
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: emits `additionalContext`, never blocks.
//   - FAIL OPEN: a single top-level catch swallows every error (exit 0, nothing emitted).
//   - PER AGENT: the log is keyed by (session_id, agent_id). A subagent shares its
//     parent's session_id and has its own agent_id, so it never inherits the parent's
//     reads.
//   - STATE: OS temp dir, GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_READGUARD env var): unset → advisory [DEFAULT] | "off" → no-op.
//
// Host note: one engine, five hosts. bkit generates this hook at install from bkit's
// `core/hooks/readguard-engine.js` and `readguard-payload.js`. See .bkit/providers.md
// § ReadGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own logic in the driver that follows the managed block: call
// `bkitReadguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// bkit:managed v5.4.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

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

function readStateDir() {
  return path.join(os.tmpdir(), "bkit-readguard");
}

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
  const dir = readStateDir();
  if (!fs.existsSync(dir)) return;
  const prefix = `${safeKey(sessionId, "no-session")}.`;
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
    `[bkit ReadGuard] Repeat read this conversation - unchanged since your last read:\n` +
    `${lines.join("\n")}\n` +
    `Use the earlier output; do NOT read these lines again. Re-read ONLY if that output is no longer in your context (summarised, or read by another agent).\n` +
    `Advisory — proceed once satisfied.`
  );
}

/**
 * The advisory for reading `targets` again, or null when ReadGuard is off, nothing is
 * trackable, or no target repeats an earlier read of the same unchanged file by the
 * same (session, agent). Records every trackable target.
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

  if (changed) {
    fs.mkdirSync(readStateDir(), { recursive: true });
    fs.writeFileSync(logFile, JSON.stringify(log), "utf-8");
  }
  gcOldReadLogs();

  return repeats.length > 0 ? repeatReadMessage(repeats, cwd) : null;
}

// Read / shell payload adapter, shared by the Claude Code, Cursor, Codex and Antigravity
// hooks: `{ tool_name, tool_input, session_id | conversation_id, agent_id?, cwd }`.
// Antigravity's own envelope is converted first (`antigravity-hook.js`).
const READ_TOOLS = new Set(["Read", "view_file"]);
const SHELL_TOOLS = new Set([
  "Bash",
  "bash",
  "Shell",
  "shell",
  "local_shell",
  "exec",
  "exec_command",
  "run_command",
  "RunCommand",
]);
const COMPACT_EVENTS = new Set(["PreCompact", "preCompact"]);
const SHELL_WRAPPERS = new Set(["bash", "sh", "zsh"]);

/** A shell command as one string; unwraps an argv `["bash", "-lc", "<cmd>"]`. */
function shellCommand(input) {
  const cmd = input.command ?? input.cmd ?? input.CommandLine;
  if (!Array.isArray(cmd)) return typeof cmd === "string" ? cmd : "";
  const isWrapped =
    cmd.length === 3 &&
    SHELL_WRAPPERS.has(String(cmd[0]).replace(/^.*\//, "")) &&
    /^-l?c$/.test(cmd[1]);
  return isWrapped ? String(cmd[2]) : cmd.join(" ");
}

function intOrUndefined(value) {
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isInteger(n) ? n : undefined;
}

// Pure: takes the already-parsed hook payload, returns the advisory text or null. A
// compaction event clears the session's read log and returns null. Never touches
// process.stdin / process.stdout — the driver below owns both.
function bkitReadguard(payload) {
  const sessionId = payload.session_id ?? payload.conversation_id;
  if (COMPACT_EVENTS.has(payload.hook_event_name)) {
    resetReadLog(sessionId);
    return null;
  }
  const tool = payload.tool_name;
  const input = payload.tool_input ?? {};
  const roots = payload.workspace_roots;
  const cwd =
    payload.cwd ??
    input.working_directory ??
    (Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : process.cwd());

  let targets = [];
  if (READ_TOOLS.has(tool)) {
    const file =
      input.file_path ?? input.path ?? input.filePath ?? input.target_file ?? input.AbsolutePath;
    targets = toolReadTarget(
      file,
      cwd,
      intOrUndefined(input.offset ?? input.StartLine),
      intOrUndefined(input.limit),
      intOrUndefined(input.EndLine),
    );
  } else if (SHELL_TOOLS.has(tool)) {
    targets = shellReadTargets(shellCommand(input), cwd);
  }
  return repeatReadAdvice(targets, sessionId, payload.agent_id, cwd);
}

// bkit:end

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const context = bkitReadguard(JSON.parse(raw));
    if (context) emit({ hookEventName: "PreToolUse", additionalContext: context });
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
