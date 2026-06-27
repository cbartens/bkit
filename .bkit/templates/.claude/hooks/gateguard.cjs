#!/usr/bin/env node
// gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Claude Code).
//
// Fires before Edit / Write / MultiEdit. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit (LLM self-review is weak; the act of
// investigating is what changes the output). A second class of paths — quality-
// gate configs — gets a stronger "fix the code, don't weaken the gate" advisory.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: emits `additionalContext` only, never blocks. The
//     deny ramp is a deliberate, dogfood-gated flip — already wired behind
//     BKIT_GATEGUARD=deny, so enabling it is a config change, NOT a code change.
//   - FAIL OPEN: a single top-level catch swallows every error (the process exits
//     0 with whatever was already emitted). Normal control paths use existence
//     guards rather than try/catch so the only error sink is that one boundary —
//     a hook that throws would break the consumer's session.
//   - SUBAGENT EXEMPT: skipped when `agent_id` is present — bkit's workflow
//     subagents are already scope-bounded by their own prompts.
//   - DEDUP: warns once per (session, file); state lives in the OS temp dir keyed
//     by session_id and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (inject context, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file with the checklist as
//                             the reason, then allow the retry. Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// Host note: Claude-only. Cursor's hook model has no pre-edit context-injection
// event; see .bkit/IDEs.md § GateGuard for the documented divergence.

"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

// Basename patterns for quality-gate configs (lint / format / types / test / slop).
// Editing these to silence a gate is the recurring "weaken the gate instead of
// fixing the code" anti-pattern — prefer a targeted per-file opt-out + sign-off.
const GATE_CONFIG_PATTERNS = [
  /^tsconfig(\..+)?\.json$/,
  /^vitest\.config\.[mc]?[jt]s$/,
  /^vite\.config\.[mc]?[jt]s$/,
  /^eslint\.config\.[mc]?[jt]s$/,
  /^\.eslintrc(\.(json|js|cjs|ya?ml))?$/,
  /^\.prettierrc(\.(json|js|cjs|mjs|ya?ml|toml))?$/,
  /^prettier\.config\.[mc]?js$/,
  /^\.prettierignore$/,
  /^biome\.jsonc?$/,
  /^\.vale\.ini$/,
  /^slop-scan\.config\.json$/,
  /^\.lintstagedrc(\.(json|js|cjs|mjs|ya?ml))?$/,
  /^lint-staged\.config\.[mc]?js$/,
];

function isGateConfig(filePath) {
  const base = path.basename(filePath);
  return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}

function investigationChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] First edit to \`${base}\` this session - confirm following, and investigate anything you cannot answer BEFORE editing:\n` +
    `- Confirm you read this file and exact symbols / lines you are about to change.\n` +
    `- Confirm precise field names, types, and signatures being changed.\n` +
    `- Confirm callers / importers changes affect (grep / read source, do NOT assume).\n` +
    `- Confirm symbols / flags / configs changes require exist (grep / read source, do NOT assume).\n` +
    `- Confirm external data contracts (DB schemas, APIs / SDKs) changes affect (verify actual shape, do NOT assume).\n` +
    `- Confirm user instructions or plan tasks changes serve (quote them, do NOT trust memory).\n` +
    `Self-review is weak; the investigation itself is what changes the output. Advisory — proceed once satisfied.`
  );
}

function configAdvisory(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] \`${base}\` quality-gate config (lint / format / types / test / slop):\n` +
    `- Prefer FIXING code over weakening any gates.\n` +
    `- If changes genuinely warranted, use targeted per-file / per-rule opt-outs over blanket disable.\n` +
    `- ALWAYS get explicit human sign-off for any quality-gate config changes.\n` +
    `Set BKIT_ALLOW_CONFIG_EDIT=1 to silence this. Advisory — proceed once satisfied.`
  );
}

function stateDir() {
  return path.join(os.tmpdir(), "bkit-gateguard");
}

function stateFile(sessionId) {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) || "no-session";
  return path.join(stateDir(), safe + ".json");
}

// Returns the per-session warned-file map. Absent state file is the NORMAL
// first-touch case (guarded, no throw); a corrupt file throws to the top-level
// fail-open boundary, which is acceptable (that one call no-ops).
function readState(sessionId) {
  const file = stateFile(sessionId);
  if (!fs.existsSync(file)) return { files: {} };
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (parsed && typeof parsed === "object" && parsed.files && typeof parsed.files === "object") {
    return parsed;
  }
  return { files: {} };
}

function alreadyWarned(sessionId, filePath) {
  return Boolean(readState(sessionId).files[filePath]);
}

function markWarned(sessionId, filePath) {
  fs.mkdirSync(stateDir(), { recursive: true });
  const state = readState(sessionId);
  state.files[filePath] = true;
  fs.writeFileSync(stateFile(sessionId), JSON.stringify(state), "utf-8");
}

// Opportunistic TTL: drop session state files older than 24h so the temp dir does
// not grow without bound. Runs last (after the advisory is emitted) so a cleanup
// race surfacing at the top-level boundary cannot suppress the advisory.
function gcOldState() {
  const dir = stateDir();
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name);
    const stat = fs.statSync(f);
    if (stat.mtimeMs < cutoff) fs.unlinkSync(f);
  }
}

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

function main() {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off") return;

  const raw = fs.readFileSync(0, "utf-8");
  if (!raw.trim()) return;
  const payload = JSON.parse(raw);

  // Subagent-exempt: agent_id is present only on subagent tool calls.
  if (payload.agent_id) return;
  if (!EDIT_TOOLS.has(payload.tool_name)) return;

  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path;
  if (!filePath || typeof filePath !== "string") return;

  const sessionId = typeof payload.session_id === "string" ? payload.session_id : "no-session";

  // Warn once per (session, file). Emit first, then record + GC, so a state-write
  // or cleanup failure cannot swallow the advisory.
  if (alreadyWarned(sessionId, filePath)) return;

  const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
  const context = gated ? configAdvisory(filePath) : investigationChecklist(filePath);

  if (mode === "deny") {
    emit({ hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: context });
  } else {
    emit({ hookEventName: "PreToolUse", additionalContext: context });
  }

  markWarned(sessionId, filePath);
  gcOldState();
}

try {
  main();
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
