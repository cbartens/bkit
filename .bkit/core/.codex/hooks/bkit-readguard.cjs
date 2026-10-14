#!/usr/bin/env node
// bkit-readguard.cjs — bkit ReadGuard advisory hook (Codex CLI).
//
// Twin of `.claude/hooks/bkit-readguard.cjs`, same stdin envelope and stdout shape.
// Codex has no file-read tool, so every read arrives as a shell command (`Bash`, argv
// `["bash", "-lc", "<cmd>"]` unwrapped). When an agent re-reads a line range of a file
// it already read in this conversation, and the file has not changed since, it injects
// a note so the agent uses the earlier output. Plain forms only: `cat FILE`,
// `sed -n 'A,Bp' FILE`, `head` / `tail` with a line count. On PreCompact it forgets the
// session's reads.
//
// REGISTRATION: `.codex/hooks.json`, PreToolUse matcher `Bash` plus PreCompact. Codex
// loads project-local hooks only once the project `.codex/` layer is TRUSTED.
// See .bkit/providers.md § ReadGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: emits `additionalContext`, never blocks.
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - PER AGENT: keyed by (session_id, agent_id when present). Codex tool payloads
//     carry the parent's session_id inside subagents and no agent id, so a subagent can
//     see the parent's reads; the note tells the agent to re-read when the earlier
//     output is not in its context.
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
