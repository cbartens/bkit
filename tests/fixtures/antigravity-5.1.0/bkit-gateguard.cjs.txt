#!/usr/bin/env node
// bkit-gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Google Antigravity).
//
// Twin of `.claude/hooks/bkit-gateguard.cjs`. Antigravity's hook contract is the same
// family as Claude Code's — same stdin envelope (`tool_name`, `tool_input`, `session_id`,
// `cwd`), same stdout shape (`hookSpecificOutput` with `permissionDecision` /
// `additionalContext`) — so bkit generates the same advisory engine into it at install
// (bkit's `core/hooks/gateguard-engine.js`). Two things differ and are handled below:
//
//   1. TOOL NAME. Antigravity reports file edits as `write_to_file` (whole-file) or
//      `replace_file_content` (in-place edit), never Edit/Write/MultiEdit.
//   2. FILE PATH. Antigravity passes the target path in `tool_input.file_path` (some
//      builds use `path` / `target_file`); all three are accepted.
//
// bkit's gateguard parity test runs the shared behaviour table against this host.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matchers `write_to_file` / `replace_file_content`.
// See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: emits `additionalContext` only, never blocks. BKIT_GATEGUARD=deny
//     flips it to a deny ramp; that is a config change, NOT a code change.
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit; each carries its own session id.
//   - DEDUP: warns once per (session, file), state in the OS temp dir, GC'd after 24h.
//
// MODES (BKIT_GATEGUARD): unset → advisory [DEFAULT] | "off" → no-op | "deny" → block first
// touch per file, then allow the retry.  BKIT_ALLOW_CONFIG_EDIT=1 suppresses the gate-config
// advisory.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Antigravity's file-writing tools. `write_to_file` creates or overwrites a whole file;
// `replace_file_content` edits in place. `Edit` / `Write` are accepted as matchers too.
const EDIT_TOOLS = new Set(["write_to_file", "replace_file_content", "Edit", "Write"]);

// Antigravity puts the touched path in the tool input. Different builds name the field
// differently (`file_path` / `path` / `target_file`); accept any, resolved against cwd.
function parseEditTargets(input, cwd) {
  if (!input || typeof input !== "object") return [];
  const rel = input.file_path ?? input.path ?? input.target_file;
  if (typeof rel !== "string" || rel.length === 0) return [];
  return [{ file: cwd ? path.resolve(cwd, rel) : rel }];
}

// {{BKIT_PART gateguard-engine.js}}

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
// Subagents are NOT exempt: dedup is per (session, file) and a subagent carries its
// own session id, so it gets the checklist once for a file the orchestrator already
// touched.
function bkitGateguard(payload) {
  if (process.env.BKIT_GATEGUARD === "off") return null;
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;

  const input = payload.tool_input || {};
  const cwd = typeof payload.cwd === "string" ? payload.cwd : "";
  const sessionId = typeof payload.session_id === "string" ? payload.session_id : "no-session";
  const target = parseEditTargets(input, cwd).find((t) => !alreadyWarned(sessionId, t.file));
  if (!target) return null;
  // A write_to_file to a not-yet-existing path is a NEW file and gets the reuse checklist;
  // replace_file_content is always an in-place edit of an existing file.
  const isNew = payload.tool_name === "write_to_file" && !fs.existsSync(target.file);
  return firstTouchAdvice(target.file, sessionId, isNew);
}

// bkit:end

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const payload = JSON.parse(raw);
    const result = bkitGateguard(payload);
    if (result) {
      emit(
        result.mode === "deny"
          ? {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: result.context,
            }
          : { hookEventName: "PreToolUse", additionalContext: result.context },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
