#!/usr/bin/env node
// bkit-gateguard.cjs — bkit GateGuard advisory PreToolUse hook for Cursor.
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
//     subagent marker.
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
//     the engine; the new-file check is an fs.existsSync.
//   - Deny must use `agent_message`. Cursor routes `user_message` to the human.
//
// Wired from `.cursor/hooks.json` → preToolUse (matcher "Write").
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. bkit generates it from the
// same shared parts as the block in `.claude/hooks/bkit-gateguard.cjs`, so the two are
// byte-identical. It is a pure advisory engine only — no stdin read, no stdout write, no top-level
// invocation. Add your own logic in the driver that follows the managed block:
// call `bkitGateguard(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh

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
  /^prettierignore\.example$/,
  /^biome\.jsonc?$/,
  /^\.vale\.ini$/,
  /^slop-scan\.config\.json$/,
  /^\.lintstagedrc(\.(json|js|cjs|mjs|ya?ml))?$/,
  /^lintstagedrc\.example\.json$/,
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

// Agent-read files: the files below `.agents/`, `.bkit/` and `docs/` plus the root agent
// files, matching the scope `.bkit/authoring.md` states. Plan artifacts under `docs/plans/`
// keep their own template contract and get no general reminder.
const AGENT_READ_ROOT_FILES = new Set(["AGENTS.md", "CLAUDE.md", "GEMINI.md"]);

function isAgentReadPath(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (AGENT_READ_ROOT_FILES.has(p.split("/").pop() || "")) return true;
  if (p.startsWith("docs/plans/") || p.includes("/docs/plans/")) return false;
  return ["docs/", ".agents/", ".bkit/"].some((d) => p.startsWith(d) || p.includes("/" + d));
}

// The one general authoring reminder, identical for every edit channel and host.
function authoringReminder() {
  return (
    `[bkit GateGuard] Agent-read file. Before you edit it:\n` +
    `- Find this file in \`.bkit/authoring.md\` § Which Sections Apply, and read the sections its row lists.\n` +
    `- Follow those rules in the edit.`
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

// Normalized warning identity: an absolute path resolved against the call's effective
// directory, so a relative, absolute or `..` spelling of one file shares one record.
function normalizeIdentity(filePath, cwd) {
  const base = typeof cwd === "string" && cwd ? cwd : process.cwd();
  return path.resolve(base, filePath);
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
// first-touch case (guarded, no throw); a corrupt file reads as empty.
function readState(sessionId) {
  const file = stateFile(sessionId);
  if (!fs.existsSync(file)) return { files: {} };
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    // Unparseable state is treated as empty; the in-process set still prevents a deny loop.
    return { files: {} };
  }
  if (parsed && typeof parsed === "object" && parsed.files && typeof parsed.files === "object") {
    return parsed;
  }
  return { files: {} };
}

function alreadyWarned(sessionId, filePath) {
  if (warnedInProcess.has(inProcessKey(sessionId, filePath))) return true;
  return Boolean(readState(sessionId).files[filePath]);
}

// `spelling` is the path as the host wrote it; it is recorded beside the normalized key so
// state readers that look a file up by its original spelling still find it.
function markWarned(sessionId, filePath, spelling) {
  fs.mkdirSync(stateDir(), { recursive: true });
  const state = readState(sessionId);
  state.files[filePath] = true;
  if (typeof spelling === "string" && spelling) state.files[spelling] = true;
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

// Host-declared: true when the hook process outlives one call (the opencode plugin), so a
// deny whose state file cannot be written is still remembered in process and cannot loop.
function processPersists() {
  return typeof GATEGUARD_PROCESS_PERSISTS !== "undefined" && GATEGUARD_PROCESS_PERSISTS === true;
}

// Pure preparation: the advice for the first touch of `filePath` this session, or null when
// GateGuard is off, the path is unusable, or the session was already warned about it.
// Writes nothing; `acknowledgeAdvice` records the touch once the advice is delivered.
// `isNewFile` picks the reuse checklist over the read-this-file checklist.
function prepareAdvice(filePath, sessionId, isNewFile, cwd) {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off") return null;
  if (!filePath || typeof filePath !== "string") return null;

  const sid = typeof sessionId === "string" ? sessionId : "no-session";
  const key = normalizeIdentity(filePath, cwd);

  // Warn once per (session, file).
  if (alreadyWarned(sid, key)) return null;

  const gated = isGateConfig(key) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
  const baseContext = gated
    ? configAdvisory(key)
    : isNewFile
      ? reuseChecklist(key)
      : investigationChecklist(key);
  const parts = [baseContext];
  if (isDocsPath(key)) parts.push(docAuthoringAdvisory());
  if (isAgentReadPath(key)) parts.push(authoringReminder());

  return {
    sid,
    key,
    mode: mode === "deny" ? "deny" : "advisory",
    context: parts.join("\n\n"),
    spelling: filePath,
    agentRead: isAgentReadPath(key),
  };
}

// Records a prepared touch. Fail-open: a state-file write error remembers the touch in
// this process and returns false (not durable). Only a durable record, or a process that
// outlives the call, can back a deny: a deny no later call can see was given would block
// every retry of the edit.
function acknowledgeAdvice(prepared) {
  try {
    markWarned(prepared.sid, prepared.key, prepared.spelling);
    gcOldState();
    return true;
  } catch {
    warnedInProcess.add(inProcessKey(prepared.sid, prepared.key));
    return false;
  }
}

// The advisory for the first touch of `filePath` this session, or null. Prepares and
// acknowledges in one step, for callers that deliver the advice themselves.
function firstTouchAdvice(filePath, sessionId, isNewFile, cwd) {
  const prepared = prepareAdvice(filePath, sessionId, isNewFile, cwd);
  if (!prepared) return null;
  const durable = acknowledgeAdvice(prepared);
  const mode = durable || processPersists() ? prepared.mode : "advisory";
  return { mode, context: prepared.context };
}

// Conservative per-host output budgets for delivered advice (reviewed under decision
// `787-conservative-host-advisory-budgets`; complete-block visibility is unverified).
const ADVICE_BUDGETS = {
  claude: { limit: 8000, unit: "chars" },
  codex: { limit: 2000, unit: "bytes" },
  cursor: { limit: 2000, unit: "bytes" },
  antigravity: { limit: 2000, unit: "bytes" },
  opencode: { limit: 8000, unit: "chars" },
};
const ADVICE_NOTICE_RESERVE = 512;

function adviceSize(text, unit) {
  return unit === "bytes" ? Buffer.byteLength(text, "utf-8") : text.length;
}

// Selects prepared advice blocks inside `budget`: only whole blocks, in order, with
// `ADVICE_NOTICE_RESERVE` units kept for the omitted-target notice. Pure: acknowledges
// nothing. `fixedCost` is the size (in the budget's unit) of text the caller adds around
// the blocks, so the whole composed advice fits. Returns `{ selected, context }`
// (`context` includes the omitted-target notice).
function selectAdvice(blocks, budget, fixedCost = 0) {
  const sep = "\n\n";
  const pick = (room) => {
    const selected = [];
    const omitted = [];
    let used = 0;
    for (const b of blocks) {
      const cost = adviceSize(b.context, budget.unit) + (selected.length > 0 ? sep.length : 0);
      if (used + cost <= room) {
        selected.push(b);
        used += cost;
      } else {
        omitted.push(b);
      }
    }
    return { selected, omitted };
  };
  const omittedNotice = (omitted) => {
    const reminder = omitted.some((b) => b.agentRead)
      ? " Agent-read files: see `.bkit/authoring.md` § Which Sections Apply."
      : "";
    return `[bkit GateGuard] ${omitted.length} target${omitted.length === 1 ? "" : "s"} omitted (output limit); they stay unacknowledged and are advised on a later edit.${reminder}`;
  };
  let { selected, omitted } = pick(
    budget.limit - (fixedCost > 0 ? 0 : ADVICE_NOTICE_RESERVE) - fixedCost,
  );
  if (fixedCost > 0 && omitted.length > 0) {
    // Composed advice counts its own text, so the omitted-target notice is sized exactly
    // (worst case: every block omitted) instead of by the fixed reserve.
    const noticeRoom = adviceSize(omittedNotice(blocks), budget.unit) + sep.length;
    ({ selected, omitted } = pick(budget.limit - fixedCost - noticeRoom));
  }
  const texts = selected.map((b) => b.context);
  if (omitted.length > 0) texts.push(omittedNotice(omitted));
  return { selected, context: texts.join(sep) };
}

// Records the selected blocks once their route has delivered them. Returns the mode to
// report: a deny only when every record is durable (or the process outlives the call).
function acknowledgeSelected(selected) {
  if (selected.length === 0) return "advisory";
  let durable = true;
  for (const b of selected) if (!acknowledgeAdvice(b)) durable = false;
  return durable || processPersists() ? selected[0].mode : "advisory";
}

// Delivers prepared advice blocks inside `budget` (see `selectAdvice`). Acknowledges exactly
// the selected blocks, and only when `verified` says the route reaches the model. Returns
// `{ mode, context }` or null when there is nothing to say.
function deliverAdvice(blocks, budget, verified, fixedCost = 0) {
  if (blocks.length === 0) return null;
  const { selected, context } = selectAdvice(blocks, budget, fixedCost);
  return { mode: verified ? acknowledgeSelected(selected) : "advisory", context };
}

// Prepared per-file blocks for the exact targets of a shell edit. Shell targets are
// relative to the evidence root (`ctx.root`, else `ctx.cwd`); they normalize to the same
// absolute identity the edit tools record, so both channels share one warning. A shell
// edit is advisory only and never a new-file reuse check: the file may not exist yet.
function shellTargetBlocks(targets, ctx, sessionId, agentId) {
  const base = (ctx && (ctx.root || ctx.cwd)) || process.cwd();
  const sid = dedupKey(sessionId, agentId);
  const blocks = [];
  const seen = new Set();
  for (const t of targets || []) {
    const prepared = prepareAdvice(t, sid, false, base);
    if (!prepared || seen.has(prepared.key)) continue;
    seen.add(prepared.key);
    // The record carries only the normalized path: the relative spelling is shell-local.
    prepared.spelling = prepared.key;
    blocks.push(prepared);
  }
  return blocks;
}

// The shell `notice` plus the per-file checklists for the evidence's exact targets, inside
// `budget`. Always advisory text (never a deny); acknowledges the delivered blocks. The
// notice and `outside` (text the caller joins around the result) count against `budget`.
function shellEditContext(notice, edits, ctx, sessionId, agentId, budget, outside = "") {
  const sepSize = 2;
  const fixedCost =
    adviceSize(notice, budget.unit) +
    sepSize +
    (outside ? adviceSize(outside, budget.unit) + sepSize : 0);
  const delivered = deliverAdvice(
    shellTargetBlocks(edits.targets, ctx, sessionId, agentId),
    budget,
    true,
    fixedCost,
  );
  return delivered ? `${notice}\n\n${delivered.context}` : notice;
}

// Edit / Write / MultiEdit / NotebookEdit / Delete payload adapter, shared by the Claude Code
// and Cursor hooks: `{ tool_name, tool_input: { file_path | path | notebook_path }, session_id,
// cwd }`. `NotebookEdit` (Claude) names its target `notebook_path`; `Delete` (Cursor) uses
// `file_path`.
const EDIT_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit", "Delete"]);

// Pure: takes the already-parsed hook payload, returns the advisory to emit or
// null. Never touches process.stdin / process.stdout — the driver below owns both.
// Subagents are NOT exempt: dedup is per (session, agent, file). A Claude Code subagent
// shares its parent's session_id and carries its own agent_id, so it gets the checklist
// once for a file the orchestrator already touched.
function bkitGateguard(payload) {
  if (!EDIT_TOOLS.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const filePath = input.file_path || input.path || input.notebook_path;
  // A Write to a not-yet-existing path is a NEW file and gets the reuse checklist.
  const isNewFile =
    payload.tool_name === "Write" && typeof filePath === "string" && !fs.existsSync(filePath);
  const cwd = typeof payload.cwd === "string" ? payload.cwd : undefined;
  return firstTouchAdvice(filePath, dedupKey(payload.session_id, payload.agent_id), isNewFile, cwd);
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
 * depth, so the sources (`.bkit/core/.agents/`, `.bkit/core/.bkit/`)
 * match too.
 */
const DOC_PATTERNS = [/(^|\/)\.agents\//, /(^|\/)\.bkit\/[^/]+\.md$/, /(^|\/)docs\/[^/]+\.md$/];

function isBkitDocPath(filePath) {
  const p = slashed(filePath);
  return p.endsWith(".md") && DOC_PATTERNS.some((re) => re.test(p));
}

const ENTRY_FILES = ["AGENTS.md", "CLAUDE.md", "GEMINI.md"];

/** The rest of § All Agent-Read Files scope: `.bkit/**`, `docs/**`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`. */
function isDogfoodAgentReadPath(filePath) {
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
  { test: isDogfoodAgentReadPath, label: "agent-read file", sections: ["All Agent-Read Files"] },
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

/**
 * Resolves a workspace-relative `file_path` (Cursor sends one on writes, an absolute
 * one on reads) against the first workspace root, else the process cwd.
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
  // Fail open — any error emits a bare allow.
  emit({ permission: "allow" });
}
