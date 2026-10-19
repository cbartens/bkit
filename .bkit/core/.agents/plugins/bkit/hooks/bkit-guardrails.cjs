#!/usr/bin/env node
// bkit-guardrails.cjs — bkit destructive-op shell gates + secret-file read gates (Google
// Antigravity).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`:
// bkit generates the same shell detection and deny / ask tiers into all three, and the same
// read tiers into this hook and Cursor's, at install (bkit's `core/hooks/`). Wired from
// `.agents/plugins/bkit/hooks.json`, matcher `view_file|run_command` — Antigravity's
// canonical tool names for file reads and shell execution.
//
// WHAT DIFFERS FROM THE CODEX TWIN — Antigravity's hook contract, live-verified on the agy
// CLI (bkit's `core/hooks/antigravity-hook.js`):
//
//   1. ENVELOPE. stdin is `{ conversationId, toolCall: { name, args }, workspacePaths }`;
//      the command is `args.CommandLine`.
//   2. OUTPUT. stdout is `{ decision, reason }`. deny → `deny` (private-key reads too);
//      ask → Antigravity's own `ask` (it prompts the human; `.env` reads too); the advisory
//      tiers (fetch host, shell-as-edit) deny the call once with the advisory as the
//      reason, because only a deny's reason reaches the model — the agent's retry goes
//      through.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher `view_file|run_command`. See
// .bkit/providers.md § Permissions / auto-approve.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - DENY IS REAL: the deny tier returns decision "deny" and blocks every time.
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

// {{BKIT_PART guardrails-shell.js}}

// {{BKIT_PART guardrails-tiers.js}}

// {{BKIT_PART guardrails-read.js}}

// {{BKIT_PART antigravity-hook.js}}

/**
 * Antigravity reports shell execution as `run_command`; the aliases match a
 * consumer-registered matcher or an isolated `run_command` session.
 */
const SHELL_TOOL_NAMES = new Set(["run_command", "RunCommand", "Bash", "bash", "shell"]);

/**
 * Antigravity reads a file with `view_file` (path `AbsolutePath`); `Read` matches a
 * consumer-registered matcher.
 */
const READ_TOOL_NAMES = new Set(["view_file", "Read"]);

/** A read's decision: deny private-key material, ask on an env / secrets file, else null. */
function decideRead(filePath) {
  const v = classifyRead(filePath);
  if (!v) return null;
  if (v.tier === "deny") {
    return {
      decision: "deny",
      reason: `Blocked by bkit Antigravity guardrails: reading private-key material is denied. Do not read ${v.path}. Ask the user to supply needed material out-of-band.`,
    };
  }
  return {
    decision: "ask",
    reason: `bkit Antigravity guardrails: reading ${v.path} may expose secrets. Prefer direnv / documented non-secret examples.`,
  };
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns Antigravity's
 * `{ decision: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 */
function bkitGuardrails(payload) {
  const p = fromAntigravityPayload(payload);
  if (!p || typeof p !== "object") return null;
  const tool = p.tool_name;
  const input = p.tool_input || {};
  if (READ_TOOL_NAMES.has(tool)) return decideRead(input.AbsolutePath ?? input.file_path);
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const raw = Array.isArray(input.command)
    ? input.command.join(" ")
    : (input.CommandLine ?? input.command);
  if (typeof raw !== "string") return null;

  const cmd = raw.trim();
  const tier = classifyShell(cmd, hookDirs(p));
  if (!tier) return null;
  if (tier.tier === "deny") {
    return {
      decision: "deny",
      reason: `Blocked by bkit Antigravity guardrails: ${tier.what}. ${tier.fix}`,
    };
  }
  if (tier.tier === "ask") {
    return {
      decision: "ask",
      reason: `bkit Antigravity guardrails: this is a destructive or privileged command (${tier.what}). It is on the PROHIBITED list in every bkit workflow. Do not run it unless the user asked for this exact command. Note that git clean and git checkout -- . destroy untracked files and uncommitted work, which no reflog can recover. Command: ${cmd}`,
    };
  }
  if (tier.tier === "secret") {
    return {
      decision: "ask",
      reason: `bkit Antigravity guardrails: this command reads ${tier.path}, an env/secrets or private-key file, which may expose secrets. Prefer direnv / documented non-secret examples. Command: ${cmd}`,
    };
  }
  const advisory =
    tier.tier === "fetch"
      ? `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist. Confirm the destination is intended before relying on the result. Command: ${cmd}`
      : shellEditAdvisory(tier.edits);
  return adviseOnce("guardrails", p.session_id, agCallSignature(tool, input), advisory);
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// decision, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Antigravity ignores the whole thing.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  const result = raw.trim() ? bkitGuardrails(JSON.parse(raw)) : null;
  emit(result ?? { decision: "allow" });
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
