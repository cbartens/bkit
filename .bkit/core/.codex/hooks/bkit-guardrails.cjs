#!/usr/bin/env node
// bkit-guardrails.cjs — bkit destructive-op shell gates (Codex CLI).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs`: bkit generates the same shell detection and
// deny / ask tiers into both at install (bkit's `core/hooks/`). Wired from
// `.codex/hooks.json`, matcher `Bash` — Codex's canonical tool name for shell execution.
//
// TWO THINGS DIFFER FROM THE CURSOR TWIN:
//
//   1. NO `ask`. Codex parses `permissionDecision: "ask"` but does not implement it —
//      an attempt is recorded as an error and the tool call proceeds anyway. The ask
//      tier is emitted as `additionalContext`: an advisory the model reads, the command
//      still runs. The deny tier is a real block. Asserted in bkit's hook parity
//      tests; see providers.md.
//   2. ENVELOPE. Codex is the Claude-family hook contract (stdin `tool_name` /
//      `tool_input`, stdout `hookSpecificOutput`), not Cursor's `beforeShellExecution`
//      + `{ permission }` shape.
//
// REGISTRATION: `.codex/hooks.json`, matcher `Bash`. Codex loads project-local hooks
// only once the project `.codex/` layer is TRUSTED — until then this does not run.
// See .bkit/providers.md § GateGuard.
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
function allow() {
  return { verdict: "allow" };
}

function ask(reason) {
  return { verdict: "ask", reason };
}

function deny(reason) {
  return { verdict: "deny", reason };
}

/** @param {string} cmd */
function decideShell(cmd) {
  const c = String(cmd || "").trim();
  const v = classifyShell(c);
  if (!v) return allow();
  switch (v.tier) {
    case "deny":
      return deny(`Blocked by bkit Codex guardrails: ${v.what}. ${v.fix}`);
    case "ask":
      // Advisory on this host (Codex cannot prompt).
      return ask(
        `bkit Codex guardrails: this is a destructive or privileged command and Codex cannot prompt for confirmation. It is on the PROHIBITED list in every bkit workflow. Do not run it unless the user asked for this exact command. Note that git clean and git checkout -- . destroy untracked files and uncommitted work, which no reflog can recover. Command: ${c}`,
      );
    case "fetch":
      return ask(
        `bkit Codex guardrails: outbound fetch to a host that is not on the network allowlist. Confirm the destination is intended before relying on the result. Command: ${c}`,
      );
    default:
      // Shell-as-edit-channel: advisory on every host, never a block.
      return ask(shellEditAdvisory(v.edits));
  }
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns
 * `{ verdict: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 *
 * Codex reports shell execution as `Bash`; the aliases match a consumer-registered
 * matcher.
 */
const SHELL_TOOL_NAMES = new Set(["Bash", "bash", "shell", "local_shell", "exec"]);

function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  const tool = payload.tool_name;
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const input = payload.tool_input || {};
  // Codex passes the command as a string, or as an argv array for some shells.
  const cmd = Array.isArray(input.command) ? input.command.join(" ") : input.command;
  if (typeof cmd !== "string") return null;
  const decision = decideShell(cmd);
  return decision.verdict === "allow" ? null : decision;
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// verdict, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Codex ignores the whole thing.

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
          : // `ask` is parsed-but-unimplemented on Codex; the ask tier is emitted as
            // advisory context.
            { hookEventName: "PreToolUse", additionalContext: result.reason },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
