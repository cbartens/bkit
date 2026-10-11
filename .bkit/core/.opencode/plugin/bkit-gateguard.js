// bkit-gateguard.js — bkit GateGuard plugin for opencode.
//
// Fires on opencode's before-execute tool hook. On the FIRST touch of a given file in
// a session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory.
// A write to a not-yet-existing path gets the reuse-over-duplicate checklist (rules.md
// "Improve over duplicate") instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: writes the checklist to stderr, which opencode surfaces in
//     the tool result the model reads — never blocks. The before-execute hook is
//     block-or-allow only (return = allow, throw = block); it has no "inject context
//     without blocking" primitive, so stderr is the advisory channel and the throw
//     path is reserved for deny mode.
//
//   - FAIL OPEN: top-level try/catch swallows every error except the deny-mode throw.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Dedup is per (session, file)
//     and a subagent runs in its own session, so it gets its own checklist.
//   - DEDUP: warns once per (session, file); state lives in OS temp dir keyed by
//     sessionID and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (emit context to stderr, never block)  [DEFAULT]
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
//   - OpenCode 2.0 reads the default export's `id` and `setup()` and calls
//     `ctx.tool.hook("execute.before", event => …)`. The event carries the tool name
//     and its arguments as `event.tool` / `event.input`, plus `event.sessionID`.
//   - OpenCode 1.18.29+ calls the default export's `server()` and uses the returned
//     `"tool.execute.before"` hook, whose arguments are `(input, output)` with the
//     tool arguments on `output.args`.
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

/** Shared verdict path: engine → deny throw / stderr advisory; no advice fails open. */
function runBkitGateGuard(tool, filePath, sessionID) {
  const result = bkitGateguard(tool, filePath, sessionID);
  if (!result) return;
  if (result.mode === "deny") throw new Error(result.context);
  process.stderr.write(`\n${result.context}\n\n`);
}

/** Re-throw the deny-mode block; swallow every other error (fail-open). */
function rethrowDenyMode(err) {
  if (
    process.env.BKIT_GATEGUARD === "deny" &&
    err instanceof Error &&
    err.message.includes("[bkit GateGuard]")
  ) {
    throw err;
  }
}

/** OpenCode 1.x hook body: `(input, output)`, tool args on `output.args`. */
async function bkitGateGuardV1(hookInput, output) {
  try {
    if (process.env.BKIT_GATEGUARD === "off") return;
    const { tool, sessionID } = hookInput ?? {};
    if (!EDIT_TOOLS.has(tool)) return;
    const args = output?.args ?? {};
    runBkitGateGuard(tool, args.path ?? args.file_path, sessionID);
  } catch (err) {
    rethrowDenyMode(err);
  }
}

/** OpenCode 2.0 hook body: one mutable `event`, tool args on `event.input`. */
async function bkitGateGuardV2(event) {
  try {
    if (process.env.BKIT_GATEGUARD === "off") return;
    const tool = event?.tool;
    if (!EDIT_TOOLS.has(tool)) return;
    const input = event?.input ?? {};
    runBkitGateGuard(tool, input.path ?? input.filePath ?? input.file_path, event?.sessionID);
  } catch (err) {
    rethrowDenyMode(err);
  }
}

const bkitGateGuardPlugin = {
  id: "bkit-gateguard",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", bkitGateGuardV2);
  },
  async server() {
    return { "tool.execute.before": bkitGateGuardV1 };
  },
};

export default bkitGateGuardPlugin;
