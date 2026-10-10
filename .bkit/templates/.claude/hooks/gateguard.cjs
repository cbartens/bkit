#!/usr/bin/env node
// gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Claude Code).
//
// Fires before Edit / Write / MultiEdit. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory. A Write
// to a not-yet-existing path gets the reuse-over-duplicate checklist (rules.md
// "Improve over duplicate") instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: emits `additionalContext` only, never blocks. Deny mode
//     is wired behind BKIT_GATEGUARD=deny (see MODES).
//   - FAIL OPEN: a single top-level catch swallows every error (the process exits
//     0 with whatever was already emitted). Normal control paths use existence
//     guards, never try/catch; that catch is the only error sink.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Dedup is per (session, file)
//     and a subagent carries its own session id, so it gets its own checklist.
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
// Host note: twinned. `.cursor/hooks/gateguard.cjs` shares this managed block
// byte-for-byte (Cursor's preToolUse delivers `additional_context` on an allow);
// `.opencode/plugin/gateguard.js` carries the same advisories in ES-module form.
// See .bkit/providers.md § GateGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own logic in the driver that follows the managed block: call
// `bkitGateguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

// Basename patterns for quality-gate configs (lint / format / types / test / slop).
// A matching path gets the gate-config advisory instead of the first-touch checklist.
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

// A path under `.bkit/templates/` (bkit's reference copies, refreshed on every upgrade)
// is not a gate config, except in bkit's own repo (package name `@cbartens/bkit`), where
// that folder is the template source and stays guarded.
const TEMPLATE_COPIES_DIR = ".bkit/templates/";

function isBkitRepo(root) {
  const pkg = path.join(root, "package.json");
  if (!fs.existsSync(pkg)) return false;
  return JSON.parse(fs.readFileSync(pkg, "utf-8")).name === "@cbartens/bkit";
}

function isTemplateCopy(filePath) {
  const p = filePath.replace(/\\/g, "/");
  const at = p.startsWith(TEMPLATE_COPIES_DIR) ? 0 : p.indexOf("/" + TEMPLATE_COPIES_DIR);
  if (at < 0) return false;
  return !isBkitRepo(path.resolve(p.slice(0, at) || "."));
}

function isGateConfig(filePath) {
  if (isTemplateCopy(filePath)) return false;
  const base = path.basename(filePath);
  return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}

function investigationChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] First edit to \`${base}\` this session - confirm following, and investigate anything you cannot answer BEFORE editing:\n` +
    `- Confirm you read this file and exact symbols / lines you are about to change.\n` +
    `- Confirm precise field names, types, and signatures being changed.\n` +
    `- Confirm callers / importers changes affect (search code / read source, do NOT assume).\n` +
    `- Confirm symbols / flags / configs changes require exist (search code / read source, do NOT assume).\n` +
    `- Confirm external data contracts (DB schemas, APIs / SDKs) changes affect (verify actual shape, do NOT assume).\n` +
    `- Confirm changes follow patterns / conventions already in this file / its neighbours where feasible (read source, do NOT assume).\n` +
    `- Confirm user instructions or plan tasks changes serve (quote them, do NOT trust memory).\n` +
    `Self-review is weak; the investigation itself is what changes the output. Advisory — proceed once satisfied.`
  );
}

function reuseChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] New file \`${base}\` this session - confirm following, and investigate anything you cannot answer BEFORE adding:\n` +
    `- Confirm existing code does NOT already provide capability (search code / read source, do NOT assume).\n` +
    `- Confirm existing code CANNOT be reused / extended to provide capability (search code / read source, do NOT assume).\n` +
    `- Confirm anything code supersedes is deleted, NOT left as duplicate work (verify removal, do NOT assume).\n` +
    `- Confirm location / naming fits project architecture / topology / standards (search code / read source, do NOT assume).\n` +
    `- Confirm structures / patterns / conventions follow closest equivalent files where feasible (read source, do NOT assume).\n` +
    `Bolt-on drift starts here; evolve existing code first. Advisory — proceed once satisfied.`
  );
}

// docs/*.md authoring contract — appended to whichever base advisory applies
// (first-touch / new-file / gate-config). Matches a `docs/` path segment, not a
// basename. Excludes docs/plans/ and non-.md files.
function isDocsPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return false;
  const inDocs = p.startsWith("docs/") || p.includes("/docs/");
  if (!inDocs) return false;
  const inPlans = p.startsWith("docs/plans/") || p.includes("/docs/plans/");
  return !inPlans;
}

function docAuthoringAdvisory() {
  return (
    `[bkit GateGuard] docs/*.md authoring:\n` +
    `- Read THIS file's header block and follow its purpose and rules if present.\n` +
    `- Check .agents/docs.md index first and confirm topic belongs in THIS doc, not another.\n` +
    `- Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.\n` +
    `- Describe current state / rules, NOT reasons / history; state what to do, NOT why. ONLY exceptions: Docs where purpose IS the record.\n` +
    `Advisory — proceed once satisfied.`
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
// fail-open boundary and that one call no-ops.
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

// Opportunistic TTL: drops session state files older than 24h. Runs last, after the
// advisory is decided; a cleanup race never suppresses the advisory.
function gcOldState() {
  const dir = stateDir();
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name);
    // throwIfNoEntry / force: the file can vanish between readdir and here (another
    // session GCing the same dir); both calls tolerate that without a catch.
    const stat = fs.statSync(f, { throwIfNoEntry: false });
    if (stat && stat.mtimeMs < cutoff) fs.rmSync(f, { force: true });
  }
}

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
function bkitGateguard(payload) {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off") return null;

  // Subagents are NOT exempt. Dedup is per (session, file) and a subagent carries its
  // own session id, so it gets the checklist once for a file the orchestrator already
  // touched.
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;

  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path;
  if (!filePath || typeof filePath !== "string") return null;

  const sessionId = typeof payload.session_id === "string" ? payload.session_id : "no-session";

  // Warn once per (session, file).
  if (alreadyWarned(sessionId, filePath)) return null;

  const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
  // A Write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile = payload.tool_name === "Write" && !fs.existsSync(filePath);
  const baseContext = gated
    ? configAdvisory(filePath)
    : isNewFile
      ? reuseChecklist(filePath)
      : investigationChecklist(filePath);
  const context = isDocsPath(filePath)
    ? `${baseContext}\n\n${docAuthoringAdvisory()}`
    : baseContext;

  markWarned(sessionId, filePath);
  gcOldState();

  return { mode: mode === "deny" ? "deny" : "advisory", context };
}

// bkit:end

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const payload = JSON.parse(raw);
    const result = bkitGateguard(payload);
    if (result) {
      emit(
        result.mode === "deny"
          ? {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: result.context,
            }
          : { hookEventName: "PreToolUse", additionalContext: result.context },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
