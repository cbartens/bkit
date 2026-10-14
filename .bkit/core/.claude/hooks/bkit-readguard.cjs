#!/usr/bin/env node
// bkit-readguard.cjs — bkit ReadGuard advisory hook (Claude Code).
//
// Fires before Read and Bash. When an agent reads a line range of a file it already
// read in this conversation, and the file has not changed since (same mtime and size),
// it injects a note so the agent uses the earlier output instead of paying for the
// same lines again. Shell reads are recognised in their plain forms only: `cat FILE`,
// `sed -n 'A,Bp' FILE`, `head` / `tail` with a line count. Pipes, globs, lists and
// substitutions are not tracked. On PreCompact it forgets the session's reads: the
// summary drops the earlier output, so re-reading is right again.
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: emits `additionalContext`, never blocks.
//   - FAIL OPEN: a single top-level catch swallows every error (exit 0, nothing emitted).
//   - PER AGENT: the log is keyed by (session_id, agent_id). A subagent shares its
//     parent's session_id and has its own agent_id, so it never inherits the parent's
//     reads.
//   - STATE: OS temp dir, GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_READGUARD env var): unset → advisory [DEFAULT] | "off" → no-op.
//
// Host note: one engine, five hosts. bkit generates this hook at install from bkit's
// `core/hooks/readguard-engine.js` and `readguard-payload.js`. See .bkit/providers.md
// § ReadGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own logic in the driver that follows the managed block: call
// `bkitReadguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART readguard-engine.js}}

// {{BKIT_PART readguard-payload.js}}

// bkit:end

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const context = bkitReadguard(JSON.parse(raw));
    if (context) emit({ hookEventName: "PreToolUse", additionalContext: context });
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
