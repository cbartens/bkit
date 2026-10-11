// bkit-gateguard.js — bkit GateGuard plugin for opencode.
//
// Fires on opencode's tool hooks. On the FIRST touch of a given file in a session it
// delivers an investigation checklist into the model's tool result so the next edit is
// made with the investigation done. A second class of paths — quality-gate configs —
// gets a stronger "fix the code, don't weaken the gate" advisory.
// A write to a not-yet-existing path gets the reuse-over-duplicate checklist (rules.md
// "Improve over duplicate") instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: appends the checklist to the tool RESULT in the
//     after-execute hook — never blocks. The before-execute hook is block-or-allow
//     only (return = allow, throw = block) and has no "inject context without
//     blocking" primitive, so it is reserved for deny mode; the after hook's result
//     (`event.result.content` on 2.0, `output.output` on 1.x) is the channel the host
//     reads back into the model's tool result. stderr is NOT a model channel on 2.0's
//     detached server.
//
//   - FAIL OPEN: top-level try/catch swallows every error except the deny-mode throw.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Dedup is per (session, file)
//     and a subagent runs in its own session, so it gets its own checklist.
//   - DEDUP: warns once per (session, file); state lives in OS temp dir keyed by
//     sessionID and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (append context to the tool result, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file by throwing with the checklist
//                             as the reason; allow the retry (dedup). Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// opencode tool names: the edit surface is `write`, `edit` and `patch`. The terminal
// tool (`shell` in v2, `bash` before v2) is NOT guarded.
//
// The engine inside the managed block is generated at install from bkit's
// `core/hooks/gateguard-engine.js`, the same source as the Claude, Cursor and Codex hooks.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no client calls, no stderr write, no throw — so it composes
// with your own checks in the exported plugin that follows the managed block,
// without bkit's block needing to know about them.

// bkit:start

// {{BKIT_MANAGED_MARKER}}

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode edit-like tool names, lowercase in opencode's plugin API.
// The terminal tool (`shell` in v2, `bash` before v2) is NOT in this list.
const EDIT_TOOLS = new Set(["write", "edit", "patch"]);

// {{BKIT_PART gateguard-engine.js}}

// Pure: takes the tool name, the already-extracted file path, and the session id;
// returns the advisory to emit or null. Never touches opencode's client, stderr,
// or the throw path — the driver below owns all three, so it can fold in its own
// checks without bkit's block needing to change.
function bkitGateguard(toolName, filePath, sessionId) {
  if (!EDIT_TOOLS.has(toolName)) return null;
  // A write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile =
    toolName === "write" && typeof filePath === "string" && !fs.existsSync(filePath);
  return firstTouchAdvice(filePath, sessionId, isNewFile);
}

// bkit:end

// ---------------------------------------------------------------------------
// Driver — the one export shape OpenCode 1.x and 2.0 both load.
//
//   - OpenCode 2.0 reads the default export's `id` and `setup()` and registers
//     `ctx.tool.hook("execute.before", …)` (deny) and `ctx.tool.hook("execute.after", …)`
//     (advisory). The event carries the tool name / arguments / session id as
//     `event.tool` / `event.input` / `event.sessionID`; the after event also carries a
//     mutable `event.result` the host reads back into the model's tool result.
//   - OpenCode 1.18.29+ calls the default export's `server()` and uses the returned
//     `"tool.execute.before"` / `"tool.execute.after"` hooks, whose arguments are
//     `(input, output)` — tool args on `output.args`, result text on `output.output`.
//
// Both call the same bkitGateguard() engine above, so advisory / deny / off behaviour
// is identical across the two. The file deliberately imports NOTHING from
// `@opencode/plugin`: the engine needs nothing from it, and that package only exists
// on 2.0 — importing it would break the module load on 1.x.
//
// OpenCode 1.x earlier than 1.18.29 expects a FUNCTION default export; this file ships
// the object form the 2.0 loader requires. On such a release, delete and reinstall the
// plugin, or hand-port this driver to the function shape.
// ---------------------------------------------------------------------------

/** Edit-tool args → the target file path, across 1.x and 2.0 argument keys. */
function gateGuardFilePath(input) {
  return input && typeof input === "object"
    ? (input.path ?? input.filePath ?? input.file_path)
    : undefined;
}

/** True only for this plugin's deny-mode throw, so fail-open swallows nothing else. */
function isDenyThrow(err) {
  return (
    process.env.BKIT_GATEGUARD === "deny" &&
    err instanceof Error &&
    err.message.includes("[bkit GateGuard]")
  );
}

// opencode's advisory rides execute.after, by which point a `write` has already created
// the file, so `firstTouchAdvice`'s existsSync new-file test can no longer see that it
// was new. execute.before snapshots existence per call id; execute.after reads it back.
// Bounded: a call that never reaches after (a deny-mode throw) is dropped on overflow.
const NEW_FILE_BY_CALL = new Map();

function snapshotNewFile(callID, tool, filePath) {
  if (callID === undefined || tool !== "write" || typeof filePath !== "string") return;
  if (NEW_FILE_BY_CALL.size > 256) NEW_FILE_BY_CALL.clear();
  NEW_FILE_BY_CALL.set(callID, !fs.existsSync(filePath));
}

function takeNewFile(callID) {
  const isNew = NEW_FILE_BY_CALL.get(callID);
  NEW_FILE_BY_CALL.delete(callID);
  return isNew === true;
}

/**
 * DENY MODE (execute.before — the only hook that can block). First touch of a file
 * per session throws the checklist as the reason; the dedup lets the retry through.
 * The before hook sees the file before a write creates it, so existence is accurate.
 */
function denyFirstTouch(tool, filePath, sessionID) {
  if (process.env.BKIT_GATEGUARD !== "deny") return;
  const result = bkitGateguard(tool, filePath, sessionID);
  if (result && result.mode === "deny") throw new Error(result.context);
}

/**
 * ADVISORY MODE (execute.after). Returns the checklist to append to the tool result,
 * or null when off / deny / already warned / no advice for this path. `isNewFile` is
 * the pre-write snapshot (see NEW_FILE_BY_CALL), not the post-write filesystem.
 */
function advisoryFor(tool, filePath, sessionID, isNewFile) {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off" || mode === "deny") return null;
  if (!EDIT_TOOLS.has(tool)) return null;
  const result = firstTouchAdvice(filePath, sessionID, isNewFile);
  return result ? result.context : null;
}

/** OpenCode 1.x before hook: `(input, output)`, tool args on `output.args`. */
async function bkitGateGuardBeforeV1(hookInput, output) {
  try {
    const { tool, sessionID, callID } = hookInput ?? {};
    if (!EDIT_TOOLS.has(tool)) return;
    const filePath = gateGuardFilePath(output?.args);
    snapshotNewFile(callID, tool, filePath);
    denyFirstTouch(tool, filePath, sessionID);
  } catch (err) {
    if (isDenyThrow(err)) throw err;
  }
}

/** OpenCode 1.x after hook: append the checklist to `output.output`, the result text. */
async function bkitGateGuardAfterV1(hookInput, output) {
  try {
    const { tool, sessionID, callID, args } = hookInput ?? {};
    const isNewFile = takeNewFile(callID);
    if (!EDIT_TOOLS.has(tool)) return;
    if (!output || typeof output !== "object") return;
    const context = advisoryFor(tool, gateGuardFilePath(args ?? output.args), sessionID, isNewFile);
    if (!context) return;
    const existing = typeof output.output === "string" ? output.output : "";
    output.output = existing.length > 0 ? `${existing}\n\n${context}` : context;
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

/** OpenCode 2.0 before hook: one event, tool args on `event.input`. Snapshot + deny. */
async function bkitGateGuardBeforeV2(event) {
  try {
    const tool = event?.tool;
    if (!EDIT_TOOLS.has(tool)) return;
    const filePath = gateGuardFilePath(event?.input);
    snapshotNewFile(event?.id, tool, filePath);
    denyFirstTouch(tool, filePath, event?.sessionID);
  } catch (err) {
    if (isDenyThrow(err)) throw err;
  }
}

/** OpenCode 2.0 after hook: append the checklist to `event.result.content`. */
async function bkitGateGuardAfterV2(event) {
  try {
    const tool = event?.tool;
    const isNewFile = takeNewFile(event?.id);
    if (!EDIT_TOOLS.has(tool)) return;
    if (event?.status !== "completed" || !event.result) return;
    const context = advisoryFor(tool, gateGuardFilePath(event?.input), event?.sessionID, isNewFile);
    if (!context) return;
    const content = Array.isArray(event.result.content) ? event.result.content : [];
    event.result.content = [...content, { type: "text", text: context }];
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

const bkitGateGuardPlugin = {
  id: "bkit-gateguard",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", bkitGateGuardBeforeV2);
    await ctx.tool.hook("execute.after", bkitGateGuardAfterV2);
  },
  async server() {
    return {
      "tool.execute.before": bkitGateGuardBeforeV1,
      "tool.execute.after": bkitGateGuardAfterV1,
    };
  },
};

export default bkitGateGuardPlugin;
