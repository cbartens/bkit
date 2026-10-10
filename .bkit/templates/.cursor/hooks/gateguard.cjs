#!/usr/bin/env node
// gateguard.cjs — bkit GateGuard advisory PreToolUse hook for Cursor.
//
// On the FIRST touch of a given file in a session it injects an investigation
// checklist into the model's context so the investigation happens BEFORE the edit.
// A second class of paths — quality-gate configs — gets a stronger "fix the code,
// don't weaken the gate" advisory. A write to a not-yet-existing path gets the
// reuse-over-duplicate nudge instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: returns `permission: "allow"` with `additional_context`.
//     Cursor delivers that to the model as a system_reminder on the tool result
//     WITHOUT blocking the edit. Verified live on Cursor 3.17.8.
//   - FAIL OPEN: top-level try/catch emits a bare allow on any error.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Cursor's payload carries no
//     subagent marker.
//   - DEDUP: warns once per (session, file); state lives in OS temp dir keyed by
//     session_id and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (inject context, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file with the checklist as
//                             `agent_message`, then allow the retry. Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// Host notes (Cursor 3.17.8, spike-verified):
//   - Cursor normalises its edit tools to `tool_name: "Write"` with
//     `tool_input: { file_path, content }` for BOTH edits and creates.
//   - `file_path` on a write is RELATIVE to the workspace root; on a read it is
//     absolute. The driver resolves it against `workspace_roots[0]` before calling
//     the engine; the new-file check is an fs.existsSync.
//   - Deny must use `agent_message`. Cursor routes `user_message` to the human.
//
// Wired from `.cursor/hooks.json` → preToolUse (matcher "Write").
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. bkit generates it from the
// same shared parts as the block in `.claude/hooks/gateguard.cjs`, so the two are
// byte-identical. It is a pure advisory engine only — no stdin read, no stdout write, no top-level
// invocation. Add your own logic in the driver that follows the managed block:
// call `bkitGateguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART gateguard-engine.js}}

// {{BKIT_PART gateguard-edit-payload.js}}

// bkit:end

// --- driver (yours) ---------------------------------------------------------
// Reads stdin, adapts Cursor's payload to the engine's shape, and emits EXACTLY
// ONE JSON document. Cursor discards the whole hook's output if two emitters
// both write to stdout.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

/**
 * Resolves a workspace-relative `file_path` (Cursor sends one on writes, an absolute
 * one on reads) against the first workspace root, else the process cwd.
 */
function resolveAgainstWorkspace(filePath, roots) {
  if (!filePath || typeof filePath !== "string") return filePath;
  if (path.isAbsolute(filePath)) return filePath;
  const root = Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : process.cwd();
  return path.join(root, filePath);
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const cursorPayload = JSON.parse(raw);
    const input = cursorPayload.tool_input || {};
    const result = bkitGateguard({
      tool_name: cursorPayload.tool_name,
      tool_input: {
        file_path: resolveAgainstWorkspace(
          input.file_path || input.path,
          cursorPayload.workspace_roots,
        ),
      },
      session_id: cursorPayload.session_id || cursorPayload.conversation_id,
    });
    if (result) {
      emit(
        result.mode === "deny"
          ? { permission: "deny", agent_message: result.context, user_message: result.context }
          : { permission: "allow", additional_context: result.context },
      );
    } else {
      emit({ permission: "allow" });
    }
  } else {
    emit({ permission: "allow" });
  }
} catch {
  // Fail open — any error emits a bare allow.
  emit({ permission: "allow" });
}
