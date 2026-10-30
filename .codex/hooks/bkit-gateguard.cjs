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

// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh

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
    `[bkit GateGuard] First edit to \`${base}\` this session — confirm the following, and investigate anything you cannot answer before editing:\n` +
    `- Confirm you read this file and the exact symbols / lines you are about to change.\n` +
    `- Confirm the precise field names, types and signatures being changed.\n` +
    `- Confirm the callers / importers the change affects: search code / read source, do not assume.\n` +
    `- Confirm the symbols / flags / configs the change requires exist: search code / read source, do not assume.\n` +
    `- Confirm the external data contracts (DB schemas, APIs / SDKs) the change affects: verify the actual shape, do not assume.\n` +
    `- Confirm the change follows the patterns / conventions already in this file / its neighbours where feasible: read source, do not assume.\n` +
    `- Confirm the user instructions or plan tasks the change serves: quote them, do not trust memory.\n` +
    `Advisory — proceed once satisfied.`
  );
}

function reuseChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] New file \`${base}\` this session — confirm the following, and investigate anything you cannot answer before adding:\n` +
    `- Confirm existing code does not already provide the capability: search code / read source, do not assume.\n` +
    `- Confirm existing code cannot be reused / extended to provide the capability: search code / read source, do not assume.\n` +
    `- Confirm anything the new code supersedes is deleted, not left as duplicate work: verify the removal, do not assume.\n` +
    `- Confirm the location / naming fits the project architecture / topology / standards: search code / read source, do not assume.\n` +
    `- Confirm the structures / patterns / conventions follow the closest equivalent files where feasible: read source, do not assume.\n` +
    `Evolve existing code first. Advisory — proceed once satisfied.`
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
    `Advisory — proceed once satisfied.`
  );
}

function configAdvisory(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] \`${base}\` quality-gate config (lint / format / types / test / slop):\n` +
    `- Prefer fixing code over weakening any gate.\n` +
    `- If a change is genuinely warranted, use targeted per-file / per-rule opt-outs over a blanket disable.\n` +
    `- ALWAYS get explicit human sign-off for any quality-gate config change.\n` +
    `- Inside \`/bkit-*\` workflows no sign-off is available: record the block and continue; NEVER self-approve the opt-out.\n` +
    `Set BKIT_ALLOW_CONFIG_EDIT=1 to silence this. Advisory — proceed once satisfied.`
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
    "Advisory — proceed once satisfied.",
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
