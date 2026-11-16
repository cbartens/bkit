#!/usr/bin/env node
// bkit-guardrails.cjs — bkit shell deny tier and advisories (Claude Code).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`: bkit
// generates the same shell parser and deny tier into all of them at install (bkit's
// `core/hooks/guardrails-shell.js` and `guardrails-deny.js`). Wired from
// `.claude/settings.json` → PreToolUse, matcher `Bash`.
//
// SCOPE — the shell checks a command-PREFIX permission table cannot express:
//
//   1. DENY TIER. A git force push, `rm -rf` of a filesystem root and `chmod -R 777 /`
//      are refused, read through wrappers (`env -u FOO`, `timeout 30`) that a prefix
//      pattern cannot see past, and not refused when they only appear inside quotes.
//   2. URL HOSTS. `Bash(curl:*)` matches a prefix, never a URL host. This hook flags a
//      curl / wget whose URL host is off the network allowlist.
//   3. SHELL-AS-EDIT-CHANNEL. `sed -i` and redirection into a source file bypass every
//      pre-edit gate (GateGuard only sees Edit/Write/MultiEdit). Detection parses the
//      target path.
//
// REFUSES THE DENY TIER ONLY — it prints `permissionDecision: "deny"` and exits 0 (the
// `.claude/settings.json` registration ends in `|| true`, which swallows a non-zero exit).
// It NEVER asks: the URL-host and edit checks are `additionalContext` advice.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - DENY IS REAL: the deny tier returns `{ verdict: "deny" }` and the driver blocks.
//   - PURE ENGINE: everything between the markers is a decision engine only — no stdin
//     read, no stdout write. Add your own gates in the driver below the block.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// {{BKIT_PART gateguard-engine.js}}

// {{BKIT_PART guardrails-shell.js}}

// {{BKIT_PART guardrails-deny.js}}

const SHELL_TOOL_NAMES = new Set(["Bash", "bash"]);

/**
 * Entry point — pure. Returns `{ verdict: "deny", reason }` for a command the deny tier
 * refuses, `{ context }` when bkit has advice about this call, or `null` when it does not.
 */
function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (!SHELL_TOOL_NAMES.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const cmd = shellCommandText(input.command);
  if (typeof cmd !== "string") return null;
  const c = cmd.trim();
  if (!c) return null;

  const cmds = shellCommands(c);
  const denied = denyRule(cmds);
  if (denied) {
    const refusal = composeAdvice({ tier: "deny", ...denied }, "claude", ADVICE_BUDGETS.claude);
    return { verdict: "deny", reason: refusal.text };
  }
  const ctx = hookContext(payload);
  const fetch = usesFetch(cmds) && !curlWgetHostAllowed(c, hookDirs(payload));
  const edits = shellEditTargets(c, ctx);
  const found = hasEditEvidence(edits);
  if (!fetch && !found) return null;
  const advice = composeAdvice(
    { tier: fetch ? "fetch" : "edit", edits: found ? edits : undefined },
    "claude",
    ADVICE_BUDGETS.claude,
    { command: c, ctx, session: payload.session_id, agent: payload.agent_id },
  );
  acknowledgeSelected(advice.selected);
  return { context: advice.text };
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
      emit(
        result.verdict === "deny"
          ? {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: result.reason,
            }
          : { hookEventName: "PreToolUse", additionalContext: result.context },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
