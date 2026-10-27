#!/usr/bin/env node
// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Google Antigravity).
//
// Antigravity has no session-start event, and its only channel to the model is a `deny`'s
// reason (bkit's `core/hooks/antigravity-hook.js`). So the advisory is delivered by
// denying the FIRST tool call once with the advisory as the reason; the agent's retry of
// the identical call is allowed. The session is never blocked.
//
// bkit generates the advisory text and its once-per-session helper into this hook at
// install (bkit's `core/hooks/session-rules-advisory.js`), the same source as the opencode
// and Codex hooks, plus the shared envelope adapter and `adviseOnce` deny-once delivery.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher
// `write_to_file|replace_file_content|view_file|run_command` — the broadest PreToolUse
// matcher, so the session's first call of any kind carries the advisory. See
// .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY, DELIVERED BY ONE BLOCK: the first call of a session is denied with the
//     advisory; the retry is allowed.
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - ONCE PER SESSION: the rulesReadAdviceOnce() gate is keyed by `conversationId`, state
//     in the OS temp dir, GC'd after 24h. A payload carrying no conversation id falls back
//     to one shared bucket.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

// {{BKIT_PART session-rules-advisory.js}}

// {{BKIT_PART antigravity-hook.js}}

// bkit:end

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (!raw.trim()) {
    emit({ decision: "allow" });
  } else {
    const p = fromAntigravityPayload(JSON.parse(raw));
    const advisory = rulesReadAdviceOnce(p.session_id);
    emit(
      advisory
        ? adviseOnce("rules", p.session_id, agCallSignature(p.tool_name, p.tool_input), advisory)
        : { decision: "allow" },
    );
  }
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
