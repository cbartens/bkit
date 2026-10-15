#!/usr/bin/env node
// bkit-readguard.cjs — bkit ReadGuard advisory hook for Cursor.
//
// Fires on preToolUse for `Read` and `Shell`. When an agent re-reads a line range of a
// file it already read in this conversation, and the file has not changed since (same
// mtime and size), it adds a note so the agent uses the earlier output instead. Shell
// reads are recognised in their plain forms only: `cat FILE`, `sed -n 'A,Bp' FILE`,
// `head` / `tail` with a line count. On preCompact it forgets the conversation's reads.
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: returns `permission: "allow"` with `additional_context` (the same
//     channel GateGuard uses on Cursor), never denies.
//   - FAIL OPEN: top-level try/catch emits a bare allow on any error.
//   - PER CONVERSATION: keyed by `conversation_id`; Cursor's tool payload carries no
//     subagent marker. The note tells the agent to re-read when the earlier output is
//     not in its context.
//   - STATE: OS temp dir, GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_READGUARD env var): unset → advisory [DEFAULT] | "off" → no-op.
//
// Wired from `.cursor/hooks.json` → preToolUse (matcher "Read|Shell") and preCompact,
// without failClosed. bkit generates the managed block from the same shared parts as
// `.claude/hooks/bkit-readguard.cjs`, so the two are byte-identical between the markers.
// See .bkit/providers.md § ReadGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. Add your own logic in the
// driver that follows the managed block, and emit EXACTLY ONE JSON document.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART readguard-engine.js}}

// {{BKIT_PART readguard-payload.js}}

// bkit:end

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  const payload = raw.trim() ? JSON.parse(raw) : {};
  const context = bkitReadguard(payload);
  if (payload.hook_event_name === "preCompact") emit({});
  else emit(context ? { permission: "allow", additional_context: context } : { permission: "allow" });
} catch {
  // Fail open — any error emits a bare allow.
  emit({ permission: "allow" });
}
