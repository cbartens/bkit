#!/usr/bin/env node
// bkit-guardrails.cjs — bkit shell advisories (Claude Code).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`: bkit
// generates the same shell detection into all three at install (bkit's
// `core/hooks/guardrails-shell.js`). Wired from `.claude/settings.json` → PreToolUse,
// matcher `Bash`.
//
// SCOPE — the two shell checks a command-PREFIX permission table cannot express:
//
//   1. URL HOSTS. `Bash(curl:*)` matches a prefix, never a URL host. This hook flags a
//      curl / wget whose URL host is off the network allowlist.
//   2. SHELL-AS-EDIT-CHANNEL. `sed -i` and redirection into a source file bypass every
//      pre-edit gate (GateGuard only sees Edit/Write/MultiEdit). Detection parses the
//      target path.
//
// ADVISORY ONLY — this hook NEVER denies and NEVER asks; it emits `additionalContext`.
// `deny` rows live in settings.json and are evaluated BEFORE any hook. The permission
// table and the auto-mode classifier are what stop commands.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - NEVER BLOCKS: no `permissionDecision` is ever emitted from the managed block.
//   - PURE ENGINE: everything between the markers is a decision engine only — no stdin
//     read, no stdout write. Add your own gates in the driver below the block.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const path = require("node:path");

// {{BKIT_PART guardrails-shell.js}}

const SHELL_TOOL_NAMES = new Set(["Bash", "bash"]);

/**
 * Entry point — pure. Returns `{ context }` when bkit has something to say about this
 * call, or `null` when it does not. Never returns a blocking decision: see the header.
 */
function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (!SHELL_TOOL_NAMES.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const cmd = Array.isArray(input.command) ? input.command.join(" ") : input.command;
  if (typeof cmd !== "string") return null;
  const c = cmd.trim();
  if (!c) return null;

  const notes = [];
  if (usesFetch(c) && !curlWgetHostAllowed(c, hookDirs(payload))) {
    notes.push(
      "bkit guardrails: outbound fetch to a host that is not on this repo's network allowlist " +
        "(.agents/context.md § allowed-domains, plus bkit's shipped tooling hosts). Not blocked — " +
        "confirm the destination is intended before relying on the result, and add the host to " +
        "allowed-domains if it is a standing dependency.",
    );
  }
  const edits = shellEditTargets(c);
  if (edits.length > 0) notes.push(shellEditAdvisory(edits));

  return notes.length > 0 ? { context: notes.join("\n\n") } : null;
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// result, and call emit() exactly once. Keep the single-emit rule — two writers on one
// stdout produce an unparseable blob and Claude Code ignores the whole thing.

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const result = bkitGuardrails(JSON.parse(raw));
    if (result) {
      emit({ hookEventName: "PreToolUse", additionalContext: result.context });
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
