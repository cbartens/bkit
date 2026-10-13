#!/usr/bin/env node
// bkit-guardrails.cjs — bkit destructive-op shell gates (Google Antigravity).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`:
// bkit generates the same shell detection and deny / ask tiers into all three at install
// (bkit's `core/hooks/`). Wired from `.agents/hooks.json`, matcher `run_command` —
// Antigravity's canonical tool name for shell execution.
//
// ONE THING DIFFERS FROM THE CODEX TWIN:
//
//   1. ENVELOPE / TOOL NAME. Antigravity reports shell execution as `run_command`, and
//      passes the command as `tool_input.command` (some builds use `CommandLine`). Both
//      are accepted. The stdout envelope is the Claude-family `hookSpecificOutput` shape.
//
// REGISTRATION: `.agents/hooks.json`, matcher `run_command`. See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - DENY IS REAL: the deny tier returns permissionDecision "deny" and blocks.
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

// {{BKIT_PART guardrails-tiers.js}}

/** Verdicts mirror the Cursor hook's tiers so the shared gate table reads identically. */
function ask(reason) {
  return { verdict: "ask", reason };
}

function deny(reason) {
  return { verdict: "deny", reason };
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns
 * `{ verdict: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 *
 * Antigravity reports shell execution as `run_command`; the aliases match a
 * consumer-registered matcher or an isolated `run_command` session.
 */
const SHELL_TOOL_NAMES = new Set(["run_command", "RunCommand", "Bash", "bash", "shell"]);

function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  const tool = payload.tool_name;
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const input = payload.tool_input || {};
  // Antigravity passes the command as a string (`command`), or `CommandLine` in some builds.
  const raw = Array.isArray(input.command)
    ? input.command.join(" ")
    : (input.command ?? input.CommandLine);
  if (typeof raw !== "string") return null;

  const cmd = raw.trim();
  const tier = classifyShell(cmd);
  if (!tier) return null;
  if (tier.tier === "deny") {
    return deny(`Blocked by bkit Antigravity guardrails: ${tier.what}. ${tier.fix}`);
  }
  if (tier.tier === "ask") {
    return ask(
      `bkit Antigravity guardrails: this is a destructive or privileged command. It is on the PROHIBITED list in every bkit workflow. Do not run it unless the user asked for this exact command. Note that git clean and git checkout -- . destroy untracked files and uncommitted work, which no reflog can recover. Command: ${cmd}`,
    );
  }
  if (tier.tier === "fetch") {
    return ask(
      `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist. Confirm the destination is intended before relying on the result. Command: ${cmd}`,
    );
  }
  // Shell-as-edit-channel: advisory on every host, never a block.
  return ask(shellEditAdvisory(tier.edits));
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// verdict, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Antigravity ignores the whole thing.

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
          : { hookEventName: "PreToolUse", additionalContext: result.reason },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
