#!/usr/bin/env node
// bkit-gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Claude Code).
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
// Host note: one engine, four hosts. bkit generates this hook at install from one
// shared engine (bkit's `core/hooks/gateguard-engine.js`) plus the parts that
// differ per host. `.cursor/hooks/bkit-gateguard.cjs` carries this same managed block (Cursor's
// preToolUse delivers `additional_context` on an allow); the Codex and opencode hooks
// carry the same engine behind their own payload adapters. See .bkit/providers.md
// § GateGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own logic in the driver that follows the managed block: call
// `bkitGateguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

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
    `[bkit GateGuard] First edit to \`${base}\` this session. Before you edit, confirm each point below, and investigate any you cannot answer:\n` +
    `- Confirm you read this file and the exact symbols and lines you are about to change.\n` +
    `- Confirm the exact field names, types and signatures you are changing.\n` +
    `- Confirm the callers and importers the change affects, by searching or reading the code.\n` +
    `- Confirm the symbols, flags and configs the change needs exist, by searching or reading the code.\n` +
    `- Confirm the external data contracts (database schemas, APIs and SDKs) the change affects, by checking their actual shape.\n` +
    `- Confirm the change follows the patterns and conventions already in this file or its neighbours where feasible, by reading the code.\n` +
    `- Confirm the user instructions or plan tasks the change serves, by quoting them, not from memory.\n` +
    `Advisory: proceed once satisfied.`
  );
}

function reuseChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] New file \`${base}\` this session. Before you add it, confirm each point below, and investigate any you cannot answer:\n` +
    `- Confirm existing code does not already provide the capability, by searching or reading the code.\n` +
    `- Confirm existing code cannot be reused or extended to provide the capability, by searching or reading the code.\n` +
    `- Confirm anything the new code supersedes is deleted rather than left as duplicate work, by checking the removal.\n` +
    `- Confirm the location and naming fit the project's architecture, topology and standards, by searching or reading the code.\n` +
    `- Confirm the structures, patterns and conventions follow the closest equivalent files where feasible, by reading the code.\n` +
    `Evolve existing code first.\n` +
    `Advisory: proceed once satisfied.`
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
    `- Read this file's \`> [!CAUTION]\` header and follow its \`Purpose\` and \`Rules\`.\n` +
    `- Find the topic's home in the \`.agents/docs.md\` index first, and confirm that it is this doc.\n` +
    `- Follow \`.bkit/authoring.md\` § All Agent-Read Files and § Docs.\n` +
    `Advisory: proceed once satisfied.`
  );
}

function configAdvisory(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] \`${base}\` quality-gate config (lint, format, types, tests or slop):\n` +
    `- Prefer fixing the code over weakening any gate.\n` +
    `- If a change is genuinely warranted, use targeted opt-outs per file or per rule rather than a blanket disable.\n` +
    `- ALWAYS get explicit human sign-off for any quality-gate config change.\n` +
    `- If you are inside a \`/bkit-*\` workflow, where no sign-off is available:\n` +
    `  - Record the block and continue.\n` +
    `  - NEVER self-approve the opt-out.\n` +
    `With BKIT_ALLOW_CONFIG_EDIT=1 set, this file gets the normal first-edit or new-file checklist instead.\n` +
    `Advisory: proceed once satisfied.`
  );
}

// Per user: on a temp dir users share (Linux `/tmp`) another user's copy cannot be written.
function stateDir() {
  return path.join(
    os.tmpdir(),
    typeof process.getuid === "function" ? `bkit-gateguard-${process.getuid()}` : "bkit-gateguard",
  );
}

// (session, file) warnings this process could not write to its state file, standing in
// for it for the process's life.
const warnedInProcess = new Set();

function inProcessKey(sessionId, filePath) {
  return JSON.stringify([sessionId, filePath]);
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
  if (warnedInProcess.has(inProcessKey(sessionId, filePath))) return true;
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
// Fail-open: a state-file write error still returns the checklist and the process
// remembers it, as advisory only — a deny no later call can see was given would block
// every retry of the edit.
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

  try {
    markWarned(sid, filePath);
    gcOldState();
  } catch {
    warnedInProcess.add(inProcessKey(sid, filePath));
    return { mode: "advisory", context };
  }

  return { mode: mode === "deny" ? "deny" : "advisory", context };
}

// Edit / Write / MultiEdit payload adapter, shared by the Claude Code and Cursor hooks:
// `{ tool_name, tool_input: { file_path | path }, session_id }`.
const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
// Subagents are NOT exempt: dedup is per (session, agent, file). A Claude Code subagent
// shares its parent's session_id and carries its own agent_id, so it gets the checklist
// once for a file the orchestrator already touched.
function bkitGateguard(payload) {
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path;
  // A Write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile =
    payload.tool_name === "Write" && typeof filePath === "string" && !fs.existsSync(filePath);
  return firstTouchAdvice(filePath, dedupKey(payload.session_id, payload.agent_id), isNewFile);
}

// bkit:end

// ---------------------------------------------------------------------------
// DOGFOOD ONLY — bkit's own authoring rules for its own files.
// Present in this repo's four installed GateGuard hooks (Claude Code, Cursor,
// Codex, opencode); ships in no template and reaches no consumer install. Lives
// outside the managed block so it survives every `bkit install` / `bkit upgrade`.
// Each agent-read file gets the `.bkit/authoring.md` sections whose scope line names
// it, read from the package source (`.bkit/core/.bkit/authoring.md`) at hook time,
// never copied.
// ---------------------------------------------------------------------------

/** Forward slashes, so one set of patterns serves every OS. */
function slashed(filePath) {
  return filePath.replace(/\\/g, "/");
}

/** True when `p` starts at `prefix` from the repo root, given as a relative or absolute path. */
function under(p, prefix) {
  return p.startsWith(prefix) || p.includes(`/${prefix}`);
}

function isBkitWorkflowPath(filePath) {
  const p = slashed(filePath);
  return p.endsWith(".md") && under(p, ".bkit/core/workflows/");
}

function isBkitPromptPath(filePath) {
  const p = slashed(filePath);
  return p.endsWith(".md") && under(p, ".bkit/core/prompts/");
}

/** § Doc Templates scope: `.bkit/core/docs/templates/*.md` and the installed `docs/templates/*.md`. */
function isDocTemplatePath(filePath) {
  const p = slashed(filePath);
  return p.endsWith(".md") && under(p, "docs/templates/");
}

/**
 * § Docs scope: `.agents/**`, `.bkit/*.md` and `docs/*.md`. The patterns match at any
 * depth, so the sources (`.bkit/core/.agents/`, `.bkit/core/.bkit/`, `.bkit/shared/docs/`)
 * match too.
 */
const DOC_PATTERNS = [/(^|\/)\.agents\//, /(^|\/)\.bkit\/[^/]+\.md$/, /(^|\/)docs\/[^/]+\.md$/];

function isBkitDocPath(filePath) {
  const p = slashed(filePath);
  return p.endsWith(".md") && DOC_PATTERNS.some((re) => re.test(p));
}

const ENTRY_FILES = ["AGENTS.md", "CLAUDE.md", "GEMINI.md"];

/** The rest of § All Agent-Read Files scope: `.bkit/**`, `docs/**`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`. */
function isAgentReadPath(filePath) {
  const p = slashed(filePath);
  if (!p.endsWith(".md")) return false;
  const base = p.slice(p.lastIndexOf("/") + 1);
  return under(p, ".bkit/") || under(p, "docs/") || ENTRY_FILES.includes(base);
}

const REPO_AUTHORING_RULE =
  "- `.agents/rules.md` § Repo Authoring applies: authoring rules, index update in the same change.";

const AUTHORING_SOURCE = ".bkit/core/.bkit/authoring.md";
const AUTHORING_DOC = ".bkit/authoring.md";

/**
 * Every rule of `.bkit/core/.bkit/authoring.md` § `heading` as advisory bullets: each
 * `- **Lead:** text` first line with the bold unwrapped. A rule with a `Checked by:`
 * line is left out, because its test enforces it. Missing doc or section → one bullet
 * naming where to read it instead.
 */
function authoringRules(heading) {
  const file = path.join(bkitRepoRoot(), AUTHORING_SOURCE);
  const src = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
  const start = src.indexOf(`\n## ${heading}\n`);
  if (start < 0) return [`- § ${heading}: unreadable here; read \`${AUTHORING_DOC}\` § ${heading}.`];
  const rest = src.slice(start + heading.length + 5);
  const end = rest.indexOf("\n## ");
  const body = end >= 0 ? rest.slice(0, end) : rest;
  const out = [];
  let rule = null;
  let checked = false;
  const close = () => {
    if (rule && !checked) out.push(rule);
    rule = null;
    checked = false;
  };
  for (const line of body.split("\n")) {
    const lead = /^- \*\*([^*]+):\*\* (.*)$/.exec(line);
    if (lead) {
      close();
      rule = `- ${lead[1]}: ${lead[2]}`;
    } else if (/^\s+- Checked by:/.test(line)) checked = true;
    else if (/^\S/.test(line)) close();
  }
  close();
  return out;
}

/** Each kind of agent-read file, most specific first, with the sections that apply to it. */
const AUTHORING_KINDS = [
  {
    test: isBkitWorkflowPath,
    label: ".bkit/core/workflows/*.md",
    sections: ["All Agent-Read Files", "Prompts and Workflows", "Output Formatting", "Workflows Only"],
  },
  {
    test: isBkitPromptPath,
    label: ".bkit/core/prompts/*.md",
    sections: ["All Agent-Read Files", "Prompts and Workflows", "Output Formatting", "Prompts Only"],
  },
  {
    test: isDocTemplatePath,
    label: "doc template",
    sections: ["All Agent-Read Files", "Output Formatting", "Doc Templates"],
  },
  { test: isBkitDocPath, label: "doc", sections: ["All Agent-Read Files", "Docs"] },
  { test: isAgentReadPath, label: "agent-read file", sections: ["All Agent-Read Files"] },
];

function authoringAdvisory(kind) {
  return [
    `[bkit GateGuard] ${kind.label} authoring:`,
    ...kind.sections.flatMap(authoringRules),
    REPO_AUTHORING_RULE,
    "Advisory: proceed once satisfied.",
  ].join("\n");
}

/** Returns the bkit-repo authoring advisory for a path, else null. First match wins. */
function dogfoodAuthoringAdvisory(filePath) {
  const kind = AUTHORING_KINDS.find((k) => k.test(filePath));
  return kind ? authoringAdvisory(kind) : null;
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
    const result = bkitGateguard(payload);
    if (result) {
      const input = payload.tool_input || {};
      const filePath = input.file_path || input.path || "";
      const dogfoodExtra = dogfoodAuthoringAdvisory(filePath);
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
