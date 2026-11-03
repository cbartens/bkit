#!/usr/bin/env node
// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Codex CLI).
//
// Codex's hook contract is the same family as Claude Code's — same stdin envelope
// (`tool_name`, `tool_input`, `session_id`, `cwd`), same stdout shape
// (`hookSpecificOutput` with `additionalContext`). bkit generates the advisory text and
// its once-per-session helper into it at install (bkit's
// `core/hooks/session-rules-advisory.js`), the same source as the opencode and
// Antigravity hooks.
//
// Codex has no session-start event, so the advisory rides the FIRST tool call instead:
// the hook writes it as `additionalContext` once per session, and every later call writes
// nothing. `additionalContext` is advisory only — no call is ever blocked.
//
// REGISTRATION: `.codex/hooks.json`, two single-value `PreToolUse` groups — `apply_patch`
// and `Bash`, the shape every shipped Codex matcher uses (alternation is not verified on
// that host). Codex loads project-local hooks only once the project `.codex/` layer is
// TRUSTED — until then this does not run. See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: emits `additionalContext`, never a permission decision.
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - ONCE PER SESSION: dedup is by `session_id`, state in the OS temp dir, GC'd after
//     24h. Codex reports the parent's session_id inside a subagent and no agent id, so a
//     subagent can miss an advisory its parent already consumed — the same limit
//     GateGuard records. A payload carrying no session id falls back to one shared bucket.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART session-rules-advisory.js}}

// bkit:end

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const advisory = rulesReadAdviceOnce(JSON.parse(raw).session_id);
    if (advisory) emit({ hookEventName: "PreToolUse", additionalContext: advisory });
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
