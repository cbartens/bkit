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

// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
// source into every host hook whose host has no session-start event: opencode, Codex,
// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
// these bytes into each host template, so either would make the rendered CJS hook invalid.

const RULES_READ_ADVISORY =
  "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";

/** The OS-temp dir holding one state file per session the advisory already reached. */
function rulesAdvisoryStateDir() {
  return path.join(os.tmpdir(), "bkit-rules-advisory");
}

/** One state file per session id; a payload with no id falls back to one shared bucket. */
function rulesAdvisoryFile(sessionId) {
  const safe =
    typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
  return path.join(rulesAdvisoryStateDir(), `${safe || "no-session"}.json`);
}

/** Opportunistic TTL: drops state files older than 24h. */
function rulesAdvisoryGc() {
  const dir = rulesAdvisoryStateDir();
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (stat && stat.mtimeMs < cutoff) fs.rmSync(file, { force: true });
  }
}

/**
 * The advisory the first time `sessionId` is seen, null after. State lives in the OS temp
 * dir — never in the consumer repo — and is GC'd after 24h. Fail-open: a state-file error
 * returns the advisory instead of throwing, so the nudge is never lost to a bad state.
 */
function rulesReadAdviceOnce(sessionId) {
  try {
    const file = rulesAdvisoryFile(sessionId);
    if (fs.existsSync(file)) return null;
    fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
    rulesAdvisoryGc();
    return RULES_READ_ADVISORY;
  } catch {
    return RULES_READ_ADVISORY;
  }
}

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
