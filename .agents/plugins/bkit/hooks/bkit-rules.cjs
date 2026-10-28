#!/usr/bin/env node
// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Google Antigravity).
//
// Antigravity has no session-start event, and its only channel to the model is a `deny`'s
// reason (bkit's `core/hooks/antigravity-hook.js`). So the advisory is delivered by
// denying the FIRST tool call once with the advisory as the reason; the agent's retry of
// the identical call is allowed. The session is never blocked.
//
// bkit generates the advisory text and its once-per-session helper into this hook at
// install (bkit's `core/hooks/session-rules-advisory.js`), the same source as the opencode
// and Codex hooks, plus the shared envelope adapter and `adviseOnce` deny-once delivery.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher
// `write_to_file|replace_file_content|view_file|run_command` — the broadest PreToolUse
// matcher, so the session's first call of any kind carries the advisory. See
// .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY, DELIVERED BY ONE BLOCK: the first call of a session is denied with the
//     advisory; the retry is allowed.
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - ONCE PER SESSION: the rulesReadAdviceOnce() gate is keyed by `conversationId`, state
//     in the OS temp dir, GC'd after 24h. A payload carrying no conversation id falls back
//     to one shared bucket.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
// source into every host hook whose host has no session-start event: opencode, Codex,
// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
// these bytes into each host template, so either would make the rendered CJS hook invalid.

const RULES_READ_ADVISORY =
  "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";

/**
 * The OS-temp dir holding one state file per session the advisory already reached. Per
 * user: on a temp dir users share (Linux `/tmp`) another user's copy cannot be written.
 */
function rulesAdvisoryStateDir() {
  const user = typeof process.getuid === "function" ? `-${process.getuid()}` : "";
  return path.join(os.tmpdir(), `bkit-rules-advisory${user}`);
}

/** State files this process could not write, standing in for them for the process's life. */
const rulesAdvisedInProcess = new Set();

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
 * returns the advisory instead of throwing, so the nudge is never lost to a bad state, and
 * the process remembers it, so a long-lived host (opencode) does not repeat it every call.
 */
function rulesReadAdviceOnce(sessionId) {
  const file = rulesAdvisoryFile(sessionId);
  try {
    if (fs.existsSync(file)) return null;
    fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
    rulesAdvisoryGc();
    return RULES_READ_ADVISORY;
  } catch {
    if (rulesAdvisedInProcess.has(file)) return null;
    rulesAdvisedInProcess.add(file);
    return RULES_READ_ADVISORY;
  }
}

// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
// it from one source). Needs `fs`, `os`, `path` and `crypto` in scope; the host's own code
// above declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
// args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
// Args: `view_file` AbsolutePath / StartLine / EndLine; `run_command` CommandLine / Cwd;
// `write_to_file` / `replace_file_content` TargetFile. Stdout is `{ decision, reason }`,
// and only a `deny`'s reason reaches the model.

/**
 * Antigravity's envelope in the Claude-family shape bkit's shared engines read. A payload
 * already in that shape (a consumer's own matcher, a test) passes through unchanged.
 */
function fromAntigravityPayload(payload) {
  if (!payload || typeof payload !== "object" || !payload.toolCall) return payload;
  const args =
    payload.toolCall.args && typeof payload.toolCall.args === "object" ? payload.toolCall.args : {};
  const roots = payload.workspacePaths;
  const root = Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : undefined;
  return {
    tool_name: payload.toolCall.name,
    tool_input: args,
    session_id: payload.conversationId,
    cwd: typeof args.Cwd === "string" ? args.Cwd : root,
    workspace_roots: Array.isArray(roots) ? roots : [],
  };
}

// Model-written labels that differ between two otherwise identical calls.
const AG_LABEL_ARGS = new Set(["toolAction", "toolSummary", "Description", "Instruction"]);

/** The call's identity: tool name plus its arguments, labels dropped, keys sorted. */
function agCallSignature(toolName, input) {
  const args = input && typeof input === "object" ? input : {};
  const kept = Object.keys(args)
    .filter((k) => !AG_LABEL_ARGS.has(k))
    .sort()
    .map((k) => [k, args[k]]);
  return JSON.stringify([toolName, kept]);
}

// One record per (hook, conversation): two hooks on the same call each let its retry through.
// Per user: on a temp dir users share (Linux `/tmp`) another user's copy cannot be written.
function agRetryFile(hook, sessionId) {
  const safe =
    typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
  const user = typeof process.getuid === "function" ? `-${process.getuid()}` : "";
  return path.join(
    os.tmpdir(),
    `bkit-antigravity-retry${user}`,
    `${hook}.${safe || "no-session"}.json`,
  );
}

/**
 * Delivers an advisory the only way Antigravity shows one to the model: deny the call
 * with the advisory as the reason, once. The identical call right after is the agent's
 * retry and is allowed. Fail-open: a retry-store error allows the call — each call is
 * its own process, so a deny it cannot record would block every retry.
 */
function adviseOnce(hook, sessionId, signature, advisory) {
  const file = agRetryFile(hook, sessionId);
  // One-way digest of the call signature: the retry store is world-readable and has no
  // TTL, so no tool argument (a shell command line with an inline secret, a file path)
  // may rest on disk in cleartext.
  const digest = crypto.createHash("sha256").update(signature).digest("hex");
  try {
    const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
    if (last === digest) {
      fs.rmSync(file, { force: true });
      return { decision: "allow" };
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, digest, "utf-8");
  } catch {
    return { decision: "allow" };
  }
  return {
    decision: "deny",
    reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  };
}

// bkit:end

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (!raw.trim()) {
    emit({ decision: "allow" });
  } else {
    const p = fromAntigravityPayload(JSON.parse(raw));
    const advisory = rulesReadAdviceOnce(p.session_id);
    emit(
      advisory
        ? adviseOnce("rules", p.session_id, agCallSignature(p.tool_name, p.tool_input), advisory)
        : { decision: "allow" },
    );
  }
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
