// bkit-gateguard.js — bkit GateGuard plugin for opencode.
//
// Fires via `tool.execute.before` hook. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory.
// A write to a not-yet-existing path gets the reuse-over-duplicate checklist (rules.md
// "Improve over duplicate") instead of the read-this-file checklist.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: writes the checklist to stderr, which opencode surfaces in
//     the tool result the model reads — never blocks. tool.execute.before is
//     block-or-allow only (return = allow, throw = block); it has no "inject context
//     without blocking" primitive, so stderr is the advisory channel and the throw
//     path is reserved for deny mode.
//
//   - FAIL OPEN: top-level try/catch swallows every error except the deny-mode throw.
//   - SUBAGENTS INCLUDED: a subagent edit is an edit. Dedup is per (session, file)
//     and a subagent runs in its own session, so it gets its own checklist.
//   - DEDUP: warns once per (session, file); state lives in OS temp dir keyed by
//     sessionID and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (emit context to stderr, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file by throwing with the checklist
//                             as the reason; allow the retry (dedup). Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// opencode tool names (v1.16.x): no Edit/Write/MultiEdit tools; the edit surface is
// `write` (file writes), `edit` (targeted edits) and `patch`. Guarded: write, edit,
// patch. Bash is not guarded.
//
// The engine inside the managed block is generated at install from bkit's
// `core/hooks/gateguard-engine.js`, the same source as the Claude, Cursor and Codex hooks.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no client calls, no stderr write, no throw — so it composes
// with your own checks in the exported plugin that follows the managed block,
// without bkit's block needing to know about them.

// bkit:start

// bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do NOT edit; run `bkit upgrade` to refresh

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode edit-like tool names (v1.16.x), lowercase in opencode's plugin API.
// `bash` is NOT in this list.
const EDIT_TOOLS = new Set(["write", "edit", "patch"]);

// --- GateGuard engine: identical in every host's hook (bkit renders it from one source).
// Needs `fs`, `os` and `path` in scope; the host's own code above declares them.

// Basename patterns for quality-gate configs (lint / format / types / test / slop).
// A matching path gets the gate-config advisory instead of the first-touch checklist.
// JS / TS first, then the other ecosystems' gate configs (Python, Go, Rust).
const GATE_CONFIG_PATTERNS = [
  /^tsconfig(\..+)?\.json$/,
  /^vitest\.config\.[mc]?[jt]s$/,
  /^vite\.config\.[mc]?[jt]s$/,
  /^jest\.config\.[mc]?[jt]s$/,
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
  /^pyproject\.toml$/,
  /^ruff\.toml$/,
  /^\.ruff\.toml$/,
  /^\.flake8$/,
  /^mypy\.ini$/,
  /^\.golangci\.(ya?ml|toml|json)$/,
  /^clippy\.toml$/,
  /^rustfmt\.toml$/,
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

// Pure: takes the tool name, the already-extracted file path, and the session id;
// returns the advisory to emit or null. Never touches opencode's client, stderr,
// or the throw path — the driver below owns all three, so it can fold in its own
// checks without bkit's block needing to change.
function bkitGateguard(toolName, filePath, sessionId) {
  if (!EDIT_TOOLS.has(toolName)) return null;
  // A write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile =
    toolName === "write" && typeof filePath === "string" && !fs.existsSync(filePath);
  return firstTouchAdvice(filePath, sessionId, isNewFile);
}

// bkit:end

import { fileURLToPath } from "node:url";

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
    "- These files ARE their own template: ALWAYS `grep .bkit/core/workflows/` for closest existing cases and copy shapes verbatim BEFORE inventing wording / formatting (phrasing, variables, operators, conditionals, routes, jump targets, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections (subagent invocations, `bash` blocks, conditional routes, comment fences, gate checklists). Bash decides, prose routes; `→` is intentional process glyph, adopt do NOT convert; 1 process branch → inline; 2+ branches → labeled decision / route block.",
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
    "- These files ARE their own template: ALWAYS `grep .bkit/core/prompts/` for closest existing cases and copy shapes verbatim BEFORE inventing wording / formatting (phrasing, variables, operators, conditionals, bolding, backticks, indentation, line breaks, punctuation, spacing). Match shapes for repeated sections (contract clauses, process steps, output format blocks, verdict mappings). `→` is intentional process glyph, adopt do NOT convert.",
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
  if (isBkitDocPath(filePath)) return `${bkitDocAuthoringAdvisory()}\n\n${proseAuthoringAdvisory()}`;
  if (isProsePath(filePath)) return proseAuthoringAdvisory();
  return null;
}

/** Repo root: this plugin lives at `<root>/.opencode/plugin/`. */
function bkitRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
}

/** @param {import('@opencode-ai/plugin').PluginInput} input */
export default function plugin(input) {
  return {
    "tool.execute.before": async (hookInput, output) => {
      try {
        if (process.env.BKIT_GATEGUARD === "off") return;

        const { tool, sessionID } = hookInput;
        if (!EDIT_TOOLS.has(tool)) return;

        // Subagents are NOT exempt. Dedup is per (session, file), and a subagent runs
        // in its own session, so it gets the checklist once for a file the orchestrator
        // already touched.

        // Extract file path from tool args (opencode's write/edit/patch tools).
        // The args object structure: write → { path, content }, edit → { path, ... },
        // patch → { path, ... }. All use `path` as the file-path key.
        const args = output?.args ?? {};
        const filePath = args.path ?? args.file_path;

        const result = bkitGateguard(tool, filePath, sessionID);
        if (!result) return;

        const dogfoodExtra = dogfoodAuthoringAdvisory(filePath || "");
        if (dogfoodExtra) result.context = `${result.context}\n\n${dogfoodExtra}`;

        if (result.mode === "deny") {
          // Deny mode: throw to hard-block the tool call. The thrown message is
          // model-visible in opencode's tool result surface.
          throw new Error(result.context);
        }
        // Advisory mode: emit to stderr (opencode surfaces stderr in tool context).
        // This delivers the checklist to the model without blocking the edit.
        process.stderr.write(`\n${result.context}\n\n`);
      } catch (err) {
        // Re-throw only for deny mode (intentional block). All other errors: fail-open.
        if (
          process.env.BKIT_GATEGUARD === "deny" &&
          err instanceof Error &&
          err.message.includes("[bkit GateGuard]")
        ) {
          throw err;
        }
        // Fail-open: unexpected errors are swallowed and the tool call proceeds.
      }
    },
  };
}
