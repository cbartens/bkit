#!/usr/bin/env node
// bkit-gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Codex CLI).
//
// Twin of `.claude/hooks/bkit-gateguard.cjs`. Codex's hook contract is the same family as
// Claude Code's — same stdin envelope (`tool_name`, `tool_input`, `session_id`, `cwd`),
// same stdout shape (`hookSpecificOutput` with `permissionDecision` / `additionalContext`)
// — so bkit generates the same advisory engine into it at install (bkit's
// `core/hooks/gateguard-engine.js`). Two things differ and are handled below:
//
//   1. TOOL NAME. Codex reports file edits as `apply_patch`, never Edit/Write/MultiEdit.
//   2. NO FILE PATH. The V4A patch envelope arrives in `tool_input.command`; the touched
//      paths have to be parsed out of it (see parseApplyPatchTargets).
//
// bkit's gateguard parity test runs the shared behaviour table against this host.
//
// REGISTRATION: `.codex/hooks.json`, matcher `apply_patch`. Codex loads project-local
// hooks only once the project `.codex/` layer is TRUSTED — until then this does not run.
// See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: emits `additionalContext` only, never blocks. BKIT_GATEGUARD=deny
//     flips it to a deny ramp; that is a config change, NOT a code change.
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit; each carries its own session id.
//   - DEDUP: warns once per (session, file), state in the OS temp dir, GC'd after 24h.
//
// MODES (BKIT_GATEGUARD): unset → advisory [DEFAULT] | "off" → no-op | "deny" → block first
// touch per file, then allow the retry.  BKIT_ALLOW_CONFIG_EDIT=1 suppresses the gate-config
// advisory.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Codex reports every file edit as `apply_patch`, whatever matcher registered the hook
// (`apply_patch` / `Edit` / `Write` are all accepted as matchers, but the payload always
// says apply_patch). `Edit` / `Write` match a consumer-registered matcher.
const EDIT_TOOLS = new Set(["apply_patch", "Edit", "Write"]);

// Codex does NOT send a file path: `apply_patch` puts a V4A patch envelope in
// `tool_input.command`. Pull the touched paths out of it. Grammar (codex-rs/apply-patch):
//   *** Add File: <path>  |  *** Update File: <path>  |  *** Delete File: <path>
//   (an Update may be followed by *** Move to: <path>, a target too)
// Paths are always repo-relative, so they are resolved against the payload cwd.
// Returns [{ file, isNew }] in patch order; [] when nothing parses.
function parseApplyPatchTargets(command, cwd) {
  if (typeof command !== "string") return [];
  const out = [];
  for (const line of command.split("\n")) {
    const m = /^\*\*\* (?:(Add|Update|Delete) File|Move to): (.+?)\s*$/.exec(line);
    if (!m) continue;
    const rel = m[2];
    out.push({ file: cwd ? path.resolve(cwd, rel) : rel, isNew: m[1] === "Add" });
  }
  return out;
}

// --- GateGuard engine: identical in every host's hook (bkit renders it from one source).
// Needs `fs`, `os` and `path` in scope; the host's own code above declares them.

// Basename patterns for quality-gate configs (lint / format / types / test / slop).
// A matching path gets the gate-config advisory instead of the first-touch checklist.
// JS / TS first, then the other ecosystems' gate configs (Python, Go, Rust). Mixed-purpose
// manifests that also hold dependencies and metadata (package.json, pyproject.toml,
// setup.cfg, tox.ini) are not matched: routine edits to them are not gate edits.
const GATE_CONFIG_PATTERNS = [
  /^tsconfig(\..+)?\.json$/,
  /^vitest\.config\.[mc]?[jt]s$/,
  /^vite\.config\.[mc]?[jt]s$/,
  /^jest\.config\.([mc]?[jt]s|json)$/,
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
  /^ruff\.toml$/,
  /^\.ruff\.toml$/,
  /^\.flake8$/,
  /^\.?mypy\.ini$/,
  /^\.?pylintrc$/,
  /^pytest\.ini$/,
  /^\.golangci\.(ya?ml|toml|json)$/,
  /^\.?clippy\.toml$/,
  /^\.?rustfmt\.toml$/,
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

// Dedup scope: the session, narrowed to one agent when the host names it. A Claude Code
// subagent shares its parent's session_id and carries its own agent_id.
function dedupKey(sessionId, agentId) {
  const sid = typeof sessionId === "string" ? sessionId : "no-session";
  return typeof agentId === "string" && agentId ? `${sid}.${agentId}` : sid;
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

// The advisory for the first touch of `filePath` this session, or null when GateGuard
// is off, the path is unusable, or this session was already warned about it. Records
// the touch. `isNewFile` picks the reuse checklist over the read-this-file checklist.
function firstTouchAdvice(filePath, sessionId, isNewFile) {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off") return null;
  if (!filePath || typeof filePath !== "string") return null;

  const sid = typeof sessionId === "string" ? sessionId : "no-session";

  // Warn once per (session, file).
  if (alreadyWarned(sid, filePath)) return null;

  const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
  const baseContext = gated
    ? configAdvisory(filePath)
    : isNewFile
      ? reuseChecklist(filePath)
      : investigationChecklist(filePath);
  const context = isDocsPath(filePath)
    ? `${baseContext}\n\n${docAuthoringAdvisory()}`
    : baseContext;

  markWarned(sid, filePath);
  gcOldState();

  return { mode: mode === "deny" ? "deny" : "advisory", context };
}

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
// Subagents are NOT exempt: dedup is per (session, agent, file). Codex tool payloads
// carry the parent's session_id inside a subagent and no agent id, so a Codex subagent
// is not told apart from its parent.
function bkitGateguard(payload) {
  if (process.env.BKIT_GATEGUARD === "off") return null;
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;

  const input = payload.tool_input || {};
  const cwd = typeof payload.cwd === "string" ? payload.cwd : "";
  const sessionId = dedupKey(payload.session_id, payload.agent_id);
  // One patch can touch several files. Advises on the first not-yet-warned target, so a
  // new file after an already-warned one still gets its advisory.
  const target = parseApplyPatchTargets(input.command, cwd).find(
    (t) => !alreadyWarned(sessionId, t.file),
  );
  if (!target) return null;
  // `*** Add File:` IS the new-file signal; no existence probe.
  return firstTouchAdvice(target.file, sessionId, target.isNew);
}

// bkit:end

// ---------------------------------------------------------------------------
// DOGFOOD ONLY — bkit's own authoring rules for its own files.
// Present in this repo's four installed GateGuard hooks (Claude Code, Cursor,
// Codex, opencode); ships in no template and reaches no consumer install
// (.bkit/core/workflows/ and .bkit/core/prompts/ never exist outside this repo). Lives
// outside the managed block so it survives every `bkit install` / `bkit upgrade`.
// Rules the advisories share with .bkit/workflows.md and .bkit/prompts.md are read
// from their package sources (`.bkit/core/.bkit/`) at hook time, never copied.
// ---------------------------------------------------------------------------

function isBkitWorkflowPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  return p.endsWith(".md") && (p.startsWith(".bkit/core/workflows/") || p.includes("/.bkit/core/workflows/"));
}

function isBkitPromptPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  return p.endsWith(".md") && (p.startsWith(".bkit/core/prompts/") || p.includes("/.bkit/core/prompts/"));
}

const REPO_AUTHORING_RULE =
  "- `.agents/rules.md` § Repo Authoring applies: authoring rules, index update in the same change, prose per `.bkit/core/prompts/bkit-utility-compress-markdown.md`.";

/**
 * One rule from a doc section as an advisory bullet: its `- **Lead:** text` line with
 * the bold unwrapped. First line only — sub-bullets are test-enforced or shown by the
 * corpus. Missing doc, section, or rule → a bullet naming where to read it instead.
 */
function sectionRule(source, heading, lead, doc) {
  const file = path.join(bkitRepoRoot(), source);
  const src = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
  const start = src.indexOf(`\n## ${heading}\n`);
  const rest = start >= 0 ? src.slice(start + heading.length + 5) : "";
  const end = rest.indexOf("\n## ");
  const body = end >= 0 ? rest.slice(0, end) : rest;
  const prefix = `- **${lead}:** `;
  const line = body.split("\n").find((l) => l.startsWith(prefix));
  return line
    ? `- ${lead}: ${line.slice(prefix.length)}`
    : `- ${lead}: unreadable here; read \`${doc}\` § ${heading}.`;
}

function workflowAuthoringAdvisory() {
  const rule = (lead) =>
    sectionRule(".bkit/core/.bkit/workflows.md", "Workflow Authoring Rules", lead, ".bkit/workflows.md");
  return [
    "[bkit GateGuard] .bkit/core/workflows/*.md authoring:",
    "- These files ARE their own template: ALWAYS `grep .bkit/core/workflows/` for closest existing cases and copy shapes verbatim BEFORE inventing wording / formatting (phrasing, variables, operators, conditionals, routes, jump targets, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections (subagent invocations, `bash` blocks, conditional routes, comment fences, gate checklists). Bash decides, prose routes; `→` is intentional process glyph, 1 process branch → inline; 2+ branches → labeled decision / route block.",
    rule("Notation"),
    rule("Dense instructions only"),
    rule("Cross-workflow alignment"),
    rule("Self-contained"),
    rule("Removal = delete"),
    REPO_AUTHORING_RULE,
    "Advisory — proceed once satisfied.",
  ].join("\n");
}

function promptAuthoringAdvisory() {
  const rule = (lead) =>
    sectionRule(".bkit/core/.bkit/prompts.md", "Prompt Authoring Rules", lead, ".bkit/prompts.md");
  return [
    "[bkit GateGuard] .bkit/core/prompts/*.md authoring:",
    "- These files ARE their own template: ALWAYS `grep .bkit/core/prompts/` for closest existing cases and copy shapes verbatim BEFORE inventing wording / formatting (phrasing, plurals, variables, operators, conditionals, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections (contract clauses, process steps, output format blocks, verdict mappings). `→` is intentional process glyph, adopt do NOT convert.",
    rule("Dense instructions only"),
    rule("Cross-prompt alignment"),
    rule("Self-contained"),
    rule("Removal = delete"),
    REPO_AUTHORING_RULE,
    "Advisory — proceed once satisfied.",
  ].join("\n");
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

function proseAuthoringAdvisory() {
  return [
    "[bkit GateGuard] prose authoring:",
    REPO_AUTHORING_RULE,
    "Advisory — proceed once satisfied.",
  ].join("\n");
}

function isBkitDocPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return false;
  // Own docs/** test, independent of the managed block's isDocsPath. Matches bkit's
  // own reference docs under `.bkit/` and `.agents/`, templates included; docs/** and
  // the two execution surfaces are excluded.
  if (p.startsWith("docs/") || p.includes("/docs/")) return false;
  if (isBkitWorkflowPath(p) || isBkitPromptPath(p)) return false;
  return (
    p.startsWith(".bkit/") ||
    p.includes("/.bkit/") ||
    p.startsWith(".agents/") ||
    p.includes("/.agents/")
  );
}

/** Rest of the `.agents/rules.md` § Repo Authoring prose scope: `docs/**` (plans included), `AGENTS.md`, `CLAUDE.md`. */
function isProsePath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (!p.endsWith(".md")) return false;
  const base = p.slice(p.lastIndexOf("/") + 1);
  return (
    p.startsWith("docs/") || p.includes("/docs/") || base === "AGENTS.md" || base === "CLAUDE.md"
  );
}

/** Returns the bkit-repo authoring advisory for a path, else null. */
function dogfoodAuthoringAdvisory(filePath) {
  if (isBkitWorkflowPath(filePath)) return workflowAuthoringAdvisory();
  if (isBkitPromptPath(filePath)) return promptAuthoringAdvisory();
  if (isBkitDocPath(filePath))
    return `${bkitDocAuthoringAdvisory()}\n\n${proseAuthoringAdvisory()}`;
  if (isProsePath(filePath)) return proseAuthoringAdvisory();
  return null;
}

/** Repo root: this hook lives at `<root>/.<host>/hooks/`. */
function bkitRepoRoot() {
  return path.resolve(__dirname, "..", "..");
}

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const payload = JSON.parse(raw);
    // The engine advises on the first not-yet-warned patch target and marks it warned,
    // so pick that target out before calling it.
    const sessionId = typeof payload.session_id === "string" ? payload.session_id : "no-session";
    const cwd = typeof payload.cwd === "string" ? payload.cwd : "";
    const target = parseApplyPatchTargets((payload.tool_input || {}).command, cwd).find(
      (t) => !alreadyWarned(sessionId, t.file),
    );
    const result = bkitGateguard(payload);
    if (result) {
      const dogfoodExtra = target ? dogfoodAuthoringAdvisory(target.file) : null;
      const context = dogfoodExtra ? `${result.context}\n\n${dogfoodExtra}` : result.context;
      emit(
        result.mode === "deny"
          ? {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: context,
            }
          : { hookEventName: "PreToolUse", additionalContext: context },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
