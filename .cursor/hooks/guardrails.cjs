#!/usr/bin/env node
// guardrails.cjs — Cursor destructive-op + secret-exposure gates (parity with
// Claude `.claude/settings.json` permissions deny/ask and OpenCode permission map).
//
// Wired from `.cursor/hooks.json`:
//   - beforeShellExecution → force-push / recursive-rm / dangerous git+gh
//   - preToolUse (Read|TabRead) → .env ask; private-key deny
//
// Output: JSON `{ permission: "allow"|"ask"|"deny", user_message?, agent_message? }`
// Exit 0 always on a decided permission. failClosed:true in hooks.json blocks on crash.
// Fail-open: a single top-level catch allows on unexpected errors (same shape as gateguard).

"use strict";

const fs = require("node:fs");

function emit(decision) {
  process.stdout.write(JSON.stringify(decision) + "\n");
}

function allow() {
  emit({ permission: "allow" });
}

function ask(userMessage, agentMessage) {
  emit({
    permission: "ask",
    user_message: userMessage,
    agent_message: agentMessage ?? userMessage,
  });
}

function deny(userMessage, agentMessage) {
  emit({
    permission: "deny",
    user_message: userMessage,
    agent_message: agentMessage ?? userMessage,
  });
}

/** @param {string} cmd */
function decideShell(cmd) {
  const c = cmd.trim();
  if (!c) return allow();

  // Deny — matches Claude deny + OpenCode bash deny
  // Check --force-with-lease BEFORE bare --force (substring otherwise matches).
  const isForceWithLease = /\bgit\s+push\b[\s\S]*--force-with-lease\b/.test(c);
  if (
    !isForceWithLease &&
    (/\bgit\s+push\b[\s\S]*--force\b/.test(c) || /\bgit\s+push\b[\s\S]*\s-f\b/.test(c))
  ) {
    return deny(
      "Blocked: git force-push is denied by bkit Cursor guardrails.",
      "Do not force-push. Use a normal push or --force-with-lease only when the user explicitly requests it on a personal branch.",
    );
  }
  if (/\brm\s+-rf\s+(\/(?:\s|$|\*)|~\/\*|\$HOME\/\*)/.test(c)) {
    return deny(
      "Blocked: recursive delete of filesystem roots is denied by bkit Cursor guardrails.",
      "Do not run rm -rf against /, ~, or $HOME. Narrow the path to the target directory.",
    );
  }
  if (/\bchmod\s+-R\s+777\s+\//.test(c)) {
    return deny(
      "Blocked: chmod -R 777 / is denied by bkit Cursor guardrails.",
      "Do not world-writable-chmod the filesystem root.",
    );
  }

  // Ask — matches Claude ask list
  const askPatterns = [
    /\bsudo\b/,
    /\bbrew\s+install\b/,
    /\b(pnpm|npm|bun)\s+publish\b/,
    /\bgit\s+reset\s+--hard\b/,
    /\bgit\s+clean\s+-fdx?\b/,
    /\bgit\s+filter-branch\b/,
    /\bgit\s+checkout\s+--\s+\./,
    /\bgit\s+restore\s+\./,
    /\bgit\s+stash\s+drop\b/,
    /\bgit\s+rebase\s+-i\b/,
    /\bgh\s+repo\s+delete\b/,
    /\bgh\s+pr\s+close\b/,
    /\bgh\s+release\s+delete\b/,
  ];
  for (const re of askPatterns) {
    if (re.test(c)) {
      return ask(
        "bkit Cursor guardrails: confirm this destructive / privileged shell command.",
        `Command requires confirmation: ${c}`,
      );
    }
  }

  return allow();
}

/** @param {string} filePath */
function decideRead(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (!p) return allow();

  // Deny private-key material
  if (/\.pem$/i.test(p) || /\.p12$/i.test(p) || /(^|\/)id_rsa$/i.test(p)) {
    return deny(
      "Blocked: reading private-key material is denied by bkit Cursor guardrails.",
      `Do not read ${p}. Ask the user to supply needed material out-of-band.`,
    );
  }

  // Ask on .env (allow .env.example)
  const base = p.split("/").pop() || p;
  if (base === ".env" || (/^\.env\./.test(base) && base !== ".env.example")) {
    return ask(
      "bkit Cursor guardrails: confirm reading an env/secrets file.",
      `Reading ${p} may expose secrets. Prefer direnv / documented non-secret examples.`,
    );
  }

  return allow();
}

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  if (!raw) return allow();

  const payload = JSON.parse(raw);

  // beforeShellExecution: { command }
  if (
    typeof payload.command === "string" &&
    payload.tool_name == null &&
    payload.tool_input == null
  ) {
    return decideShell(payload.command);
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

  return allow();
}

try {
  main();
} catch {
  allow();
}
