#!/usr/bin/env node
// bkit-gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Claude Code).
//
// Fires before Edit / Write / MultiEdit. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory. A Write
// to a not-yet-existing path gets the reuse-over-duplicate checklist (rules.md
// "Improve over duplicate") instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: emits `additionalContext` only, never blocks. Deny mode
//     is wired behind BKIT_GATEGUARD=deny (see MODES).
//   - FAIL OPEN: a single top-level catch swallows every error (the process exits
//     0 with whatever was already emitted). The engine catches only its own state
//     write: the checklist is still returned, as advisory.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Dedup is per (session, agent,
//     file): a subagent shares its parent's session_id and carries its own agent_id,
//     so it gets its own checklist.
//   - DEDUP: warns once per (session, agent, file); state lives in the OS temp dir keyed
//     by session_id and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (inject context, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file with the checklist as
//                             the reason, then allow the retry. Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// Host note: one engine, four hosts. bkit generates this hook at install from one
// shared engine (bkit's `core/hooks/gateguard-engine.js`) plus the parts that
// differ per host. `.cursor/hooks/bkit-gateguard.cjs` carries this same managed block (Cursor's
// preToolUse delivers `additional_context` on an allow); the Codex and opencode hooks
// carry the same engine behind their own payload adapters. See .bkit/providers.md
// § GateGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own logic in the driver that follows the managed block: call
// `bkitGateguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART gateguard-engine.js}}

// {{BKIT_PART gateguard-edit-payload.js}}

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
