// gateguard.js — bkit GateGuard plugin for opencode.
//
// Fires via `tool.execute.before` hook. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory.
// A write to a not-yet-existing path gets the reuse-over-duplicate checklist (rules.md
// "Improve over duplicate") instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: writes the checklist to stderr, which opencode surfaces in
//     the tool result the model reads — never blocks. tool.execute.before is
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
// opencode tool names (v1.16.x): no Edit/Write/MultiEdit tools; the edit surface is
// `write` (file writes), `edit` (targeted edits) and `patch`. Guarded: write, edit,
// patch. Bash is not guarded.
//
// The engine inside the managed block is generated at install from bkit's
// `hook-parts/gateguard-engine.js`, the same source as the Claude, Cursor and Codex hooks.
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

// opencode edit-like tool names (v1.16.x), lowercase in opencode's plugin API.
// `bash` is NOT in this list.
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

/** @param {import('@opencode-ai/plugin').PluginInput} input */
export default function plugin(input) {
  return {
    "tool.execute.before": async (hookInput, output) => {
      try {
        if (process.env.BKIT_GATEGUARD === "off") return;

        const { tool, sessionID } = hookInput;
        if (!EDIT_TOOLS.has(tool)) return;

        // Subagents are NOT exempt. Dedup is per (session, file), and a subagent runs
        // in its own session, so it gets the checklist once for a file the orchestrator
        // already touched.

        // Extract file path from tool args (opencode's write/edit/patch tools).
        // The args object structure: write → { path, content }, edit → { path, ... },
        // patch → { path, ... }. All use `path` as the file-path key.
        const args = output?.args ?? {};
        const filePath = args.path ?? args.file_path;

        const result = bkitGateguard(tool, filePath, sessionID);
        if (!result) return;

        if (result.mode === "deny") {
          // Deny mode: throw to hard-block the tool call. The thrown message is
          // model-visible in opencode's tool result surface.
          throw new Error(result.context);
        }
        // Advisory mode: emit to stderr (opencode surfaces stderr in tool context).
        // This delivers the checklist to the model without blocking the edit.
        process.stderr.write(`\n${result.context}\n\n`);
      } catch (err) {
        // Re-throw only for deny mode (intentional block). All other errors: fail-open.
        if (
          process.env.BKIT_GATEGUARD === "deny" &&
          err instanceof Error &&
          err.message.includes("[bkit GateGuard]")
        ) {
          throw err;
        }
        // Fail-open: unexpected errors are swallowed and the tool call proceeds.
      }
    },
  };
}
