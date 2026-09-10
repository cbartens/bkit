#!/usr/bin/env node
// gateguard.cjs — bkit GateGuard advisory PreToolUse hook for Cursor.
//
// On the FIRST touch of a given file in a session it injects an investigation
// checklist into the model's context so the investigation happens BEFORE the edit.
// A second class of paths — quality-gate configs — gets a stronger "fix the code,
// don't weaken the gate" advisory. A write to a not-yet-existing path gets the
// reuse-over-duplicate nudge instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: returns `permission: "allow"` with `additional_context`.
//     Cursor delivers that to the model as a system_reminder on the tool result
//     WITHOUT blocking the edit. Verified live on Cursor 3.17.8.
//   - FAIL OPEN: top-level try/catch emits a bare allow on any error.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Cursor's payload carries no
//     subagent marker at all, so there is nothing to exempt on even if we wanted to.
//   - DEDUP: warns once per (session, file); state lives in OS temp dir keyed by
//     session_id and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (inject context, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file with the checklist as
//                             `agent_message`, then allow the retry. Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// Host notes (Cursor 3.17.8, spike-verified):
//   - Cursor normalises its edit tools to `tool_name: "Write"` with
//     `tool_input: { file_path, content }` for BOTH edits and creates.
//   - `file_path` on a write is RELATIVE to the workspace root; on a read it is
//     absolute. The driver resolves it against `workspace_roots[0]` before calling
//     the engine, because the new-file check is an fs.existsSync.
//   - Deny must use `agent_message`. Cursor routes `user_message` to the human.
//
// Wired from `.cursor/hooks.json` → preToolUse (matcher "Write").
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is byte-identical to
// the block in `.claude/hooks/gateguard.cjs` (asserted by a parity test) and is a
// pure advisory engine only — no stdin read, no stdout write, no top-level
// invocation. Add your own logic in the driver that follows the managed block:
// call `bkitGateguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

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

// docs/*.md authoring contract — path-scoped, appended to whichever base advisory
// applies (first-touch / new-file / gate-config are orthogonal to this). Segment
// match, not basename — every one of these directories holds same-named files.
// Excludes docs/plans/ (the plan template governs those, not the docs register)
// and non-.md files (docs/ also holds knowledge.jsonl, decisions.jsonl, etc.).
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
// not grow without bound. Runs last (after the advisory is decided) so a cleanup
// race cannot suppress the advisory — the driver emits before this returns.
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
// null. Never touches process.stdin / process.stdout — the driver below owns
// both, so bkit and consumer logic can never produce two JSON documents on one
// stdout stream.
function bkitGateguard(payload) {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off") return null;

  // Subagents are NOT exempt: a subagent edit is still an edit, and the
  // investigation it skips is the same investigation. Dedup is per (session, file)
  // and a subagent carries its own session id, so it gets the checklist once for a
  // file the orchestrator already touched.
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;

  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path;
  if (!filePath || typeof filePath !== "string") return null;

  const sessionId = typeof payload.session_id === "string" ? payload.session_id : "no-session";

  // Warn once per (session, file).
  if (alreadyWarned(sessionId, filePath)) return null;

  const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
  // A Write to a not-yet-existing path is a NEW file — the bolt-on moment.
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

// --- driver (yours) ---------------------------------------------------------
// Reads stdin, adapts Cursor's payload to the engine's shape, and emits EXACTLY
// ONE JSON document. Cursor discards the whole hook's output if two emitters
// both write to stdout.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

// ---------------------------------------------------------------------------
// DOGFOOD ONLY — bkit's own authoring rules for its own execution surfaces.
// This region exists ONLY in this repo's .claude/hooks/gateguard.cjs; it ships
// in no template and reaches no consumer install (.bkit/workflows/ and
// .bkit/prompts/ never exist outside this repo). Lives outside the managed
// block so it survives every `bkit install` / `bkit upgrade`.
// ---------------------------------------------------------------------------

function isBkitWorkflowPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  return p.endsWith(".md") && (p.startsWith(".bkit/workflows/") || p.includes("/.bkit/workflows/"));
}

function isBkitPromptPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  return p.endsWith(".md") && (p.startsWith(".bkit/prompts/") || p.includes("/.bkit/prompts/"));
}

function workflowAuthoringAdvisory() {
  return (
    "[bkit GateGuard] .bkit/workflows/*.md authoring:\n" +
    "- These files ARE their own template: ALWAYS `grep .bkit/workflows/` for closest existing cases and copy shapes verbatim BEFORE inventing wording / formatting (phrasing, variables, operators, conditionals, routes, jump targets, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections (subagent invocations, `bash` blocks, conditional routes, comment fences, gate checklists). Bash decides, prose routes; `→` is intentional process glyph, adopt do NOT convert; 1 process branch → inline; 2+ branches → labeled decision / route block.\n" +
    "- Dense instructions only: NO rationale, NO commentary, NO parentheticals explaining why, NO inline behaviour justification. Every byte is paid on every run; ANY explanations, decisions, trade-offs, history, commentary lives in `.bkit/workflows.md`.\n" +
    "- Cross-workflow alignment: Check for shared instructions and change in ALL workflows using them.\n" +
    "- Self-contained: every file MUST stand alone; inline ALL instructions; NO file references. Exceptions: subagent context.\n" +
    "- Removal = delete: drop instruction outright; NEVER leave removal explanations.\n" +
    "Advisory — proceed once satisfied."
  );
}

function promptAuthoringAdvisory() {
  return (
    "[bkit GateGuard] .bkit/prompts/*.md authoring:\n" +
    "- These files ARE their own template: ALWAYS `grep .bkit/prompts/` for closest existing cases and copy shapes verbatim BEFORE inventing wording / formatting (phrasing, variables, operators, conditionals, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections (contract clauses, process steps, output format blocks, verdict mappings). `→` is intentional process glyph, adopt do NOT convert.\n" +
    "- Dense instructions only: NO rationale, NO commentary, NO parentheticals explaining why, NO inline comments justifying behaviour. Every byte is paid on every run; ANY explanations, decisions, trade-offs, history, commentary lives in `.bkit/prompts.md`.\n" +
    "- Cross-prompt alignment: Check for shared instructions and change in ALL prompts using them.\n" +
    "- Self-contained: every prompt MUST stand alone; inline ALL instructions; NO file references. Exceptions: `.agents/docs.md`, `*.jsonl` ledgers.\n" +
    "- Removal = delete: drop instruction outright; NEVER leave removal explanations.\n" +
    "Advisory — proceed once satisfied."
  );
}

function bkitDocAuthoringAdvisory() {
  return (
    "[bkit GateGuard] bkit `.md` doc authoring:\n" +
    "- Read THIS file's header block and follow its purpose and rules if present.\n" +
    "- Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.\n" +
    "- Describe current state / rules, NOT reasons / history; state what to do, NOT why. ONLY exceptions: Docs where purpose IS the record.\n" +
    "Advisory — proceed once satisfied."
  );
}

function isBkitDocPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return false;
  // Own docs/** test, deliberately NOT the managed block's isDocsPath: this region
  // must keep working whatever happens inside the markers. docs/** already gets the
  // shipped advisory, and the two execution surfaces get their own — what is left is
  // bkit's own reference docs under `.bkit/` and `.agents/`, templates included.
  if (p.startsWith("docs/") || p.includes("/docs/")) return false;
  if (isBkitWorkflowPath(p) || isBkitPromptPath(p)) return false;
  return (
    p.startsWith(".bkit/") ||
    p.includes("/.bkit/") ||
    p.startsWith(".agents/") ||
    p.includes("/.agents/")
  );
}

/** Returns the authoring advisory for a bkit execution-surface path, else null. */
function dogfoodAuthoringAdvisory(filePath) {
  if (isBkitWorkflowPath(filePath)) return workflowAuthoringAdvisory();
  if (isBkitPromptPath(filePath)) return promptAuthoringAdvisory();
  if (isBkitDocPath(filePath)) return bkitDocAuthoringAdvisory();
  return null;
}

/**
 * Cursor sends a workspace-relative `file_path` on writes and an absolute one on
 * reads. The engine's new-file check is an fs.existsSync, so a relative path that
 * misses would make every edit look like a new file.
 */
function resolveAgainstWorkspace(filePath, roots) {
  if (!filePath || typeof filePath !== "string") return filePath;
  if (path.isAbsolute(filePath)) return filePath;
  const root = Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : process.cwd();
  return path.join(root, filePath);
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const cursorPayload = JSON.parse(raw);
    const input = cursorPayload.tool_input || {};
    const result = bkitGateguard({
      tool_name: cursorPayload.tool_name,
      tool_input: {
        file_path: resolveAgainstWorkspace(
          input.file_path || input.path,
          cursorPayload.workspace_roots,
        ),
      },
      session_id: cursorPayload.session_id || cursorPayload.conversation_id,
    });
    if (result) {
      const dogfoodExtra = dogfoodAuthoringAdvisory(input.file_path || input.path || "");
      const context = dogfoodExtra ? `${result.context}\n\n${dogfoodExtra}` : result.context;
      emit(
        result.mode === "deny"
          ? { permission: "deny", agent_message: context, user_message: context }
          : { permission: "allow", additional_context: context },
      );
    } else {
      emit({ permission: "allow" });
    }
  } else {
    emit({ permission: "allow" });
  }
} catch {
  // Fail open — a hook that throws must never stand between the agent and its edit.
  emit({ permission: "allow" });
}
