#!/usr/bin/env node
// bkit-readguard.cjs — bkit ReadGuard advisory hook (Google Antigravity).
//
// Twin of `.claude/hooks/bkit-readguard.cjs`: same engine and payload adapter (bkit's
// `core/hooks/readguard-engine.js` / `readguard-payload.js`). Reads arrive as `view_file`
// (`AbsolutePath`, optional `StartLine` / `EndLine`) and shell as `run_command`
// (`CommandLine`, `Cwd`). When an agent re-reads a line range of a file it already read in
// this conversation, and the file has not changed since, it delivers a note so the agent
// uses the earlier output. Plain shell forms only: `cat FILE`, `sed -n 'A,Bp' FILE`,
// `head` / `tail` with a line count.
//
// Antigravity's hook contract, live-verified on the agy CLI (bkit's
// `core/hooks/antigravity-hook.js`): stdin `{ conversationId, toolCall: { name, args } }`,
// stdout `{ decision, reason }`, and only a `deny`'s reason reaches the model. So the note
// is delivered by denying the repeat read once; the agent's retry goes through.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, PreToolUse matcher
// `view_file|run_command`. Antigravity has no compaction hook, so the log is never
// cleared on a summary; the note tells the agent to re-read when the earlier output is
// no longer in its context. See .bkit/providers.md § ReadGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY, DELIVERED BY ONE BLOCK: a repeat read is denied once with the note; the
//     identical retry is allowed.
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - PER CONVERSATION: Antigravity has no native subagents.
//   - STATE: OS temp dir, GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_READGUARD): unset → advisory [DEFAULT] | "off" → no-op.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART readguard-engine.js}}

// {{BKIT_PART readguard-payload.js}}

// {{BKIT_PART antigravity-hook.js}}

// Pure: takes the already-parsed hook payload, returns Antigravity's `{ decision, reason }`
// or null for no opinion. Never touches process.stdin / process.stdout.
function bkitAntigravityReadguard(payload) {
  const p = fromAntigravityPayload(payload);
  if (!p || typeof p !== "object") return null;
  const note = bkitReadguard(p);
  if (!note) return null;
  return adviseOnce("readguard", p.session_id, agCallSignature(p.tool_name, p.tool_input), note);
}

// bkit:end

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  const result = raw.trim() ? bkitAntigravityReadguard(JSON.parse(raw)) : null;
  emit(result ?? { decision: "allow" });
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
