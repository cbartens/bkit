#!/usr/bin/env node
// bkit-guardrails.cjs — Cursor destructive-op + secret-exposure gates (parity with
// Claude `.claude/settings.json` permissions deny/ask and OpenCode permission map).
//
// Wired from `.cursor/hooks.json`:
//   - beforeShellExecution → force-push / recursive-rm / dangerous git+gh; shell reads of
//     .env / private-key files ask
//   - preToolUse (Read|TabRead) → .env ask; private-key deny
//
// Output: JSON `{ permission: "allow"|"ask"|"deny", user_message?, agent_message? }`
// Exit 0 always on a decided permission. failClosed:true in hooks.json blocks on crash.
// Fail-open: a single top-level catch allows on unexpected errors (same shape as gateguard).
//
// bkit generates the managed block at install: the shell detection and the deny / ask
// tiers are shared with the Claude and Codex hooks, the read tiers with the Antigravity
// hook (bkit's `core/hooks/`); the output shape is Cursor's own.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure decision
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own gates in the driver that follows the managed block: call
// `bkitGuardrails(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const path = require("node:path");

// {{BKIT_PART guardrails-shell.js}}

// {{BKIT_PART guardrails-tiers.js}}

// {{BKIT_PART guardrails-read.js}}

function allow() {
  return { permission: "allow" };
}

function ask(userMessage, agentMessage) {
  return {
    permission: "ask",
    user_message: userMessage,
    agent_message: agentMessage ?? userMessage,
  };
}

function deny(userMessage, agentMessage) {
  return {
    permission: "deny",
    user_message: userMessage,
    agent_message: agentMessage ?? userMessage,
  };
}

/**
 * @param {string} cmd
 * @param {string[]} dirs where to look for the network allowlist (`hookDirs`)
 */
function decideShell(cmd, dirs) {
  const c = cmd.trim();
  const v = classifyShell(c, dirs);
  if (!v) return allow();
  switch (v.tier) {
    case "deny":
      return deny(`Blocked: ${v.what} is denied by bkit Cursor guardrails.`, v.fix);
    case "ask":
      return ask(
        `bkit Cursor guardrails: confirm this destructive or privileged shell command (${v.what}).`,
        `Command requires confirmation: ${c}`,
      );
    case "secret":
      return ask(
        "bkit Cursor guardrails: confirm a shell read of an env, secrets or private-key file.",
        `Reading ${v.path} through the shell may expose secrets.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
      );
    case "fetch":
      return ask(
        "bkit Cursor guardrails: confirm an outbound curl or wget to a host that is not on the network allowlist.",
        `Command requires confirmation: ${c}`,
      );
    default:
      // Shell-as-edit-channel: ADVISORY, never a block — allow plus an `agent_message`
      // naming the edited paths.
      return { permission: "allow", agent_message: shellEditAdvisory(v.edits) };
  }
}

/** @param {string} filePath */
function decideRead(filePath) {
  const v = classifyRead(filePath);
  if (!v) return allow();
  if (v.tier === "deny") {
    return deny(
      "Blocked: reading private-key material is denied by bkit Cursor guardrails.",
      `NEVER read ${v.path}.\nAsk the user to supply what you need without putting the key in this conversation.`,
    );
  }
  return ask(
    "bkit Cursor guardrails: confirm reading an env or secrets file.",
    `Reading ${v.path} may expose secrets.\nPrefer direnv or documented non-secret examples.`,
  );
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns a decision object
 * `{ permission, user_message?, agent_message? }`, or `null` when bkit has no
 * opinion on this call (the caller decides what a no-opinion result means).
 */
function bkitGuardrails(payload) {
  // beforeShellExecution: { command, cwd, workspace_roots }
  if (
    typeof payload.command === "string" &&
    payload.tool_name == null &&
    payload.tool_input == null
  ) {
    return decideShell(payload.command, hookDirs(payload));
  }

  // preToolUse Read/TabRead: { tool_name, tool_input: { path|file_path|target_file|... } }
  const tool = String(payload.tool_name || payload.toolName || "");
  if (/^(Read|TabRead)$/i.test(tool) || payload.hook_event_name === "beforeReadFile") {
    const input = payload.tool_input || payload.toolInput || payload;
    const filePath =
      input.path ||
      input.file_path ||
      input.filePath ||
      input.target_file ||
      input.targetFile ||
      "";
    return decideRead(String(filePath));
  }

  // beforeReadFile may put path at top level
  if (typeof payload.path === "string" && !payload.command) {
    return decideRead(payload.path);
  }

  return null;
}

// bkit:end

// --- driver (yours) ---------------------------------------------------------
// Reads stdin, calls into the managed block, and emits EXACTLY ONE JSON document.
// Add your own gates here: inspect the payload, and either return your own
// decision or defer to bkit's. Cursor discards the whole hook's output if two
// emitters both write to stdout.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision) + "\n");
}

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  if (!raw) return emit({ permission: "allow" });

  const payload = JSON.parse(raw);
  const decision = bkitGuardrails(payload);

  emit(decision ?? { permission: "allow" });
}

try {
  main();
} catch {
  emit({ permission: "allow" });
}
