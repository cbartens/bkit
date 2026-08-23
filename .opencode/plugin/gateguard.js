// gateguard.js — bkit GateGuard plugin for opencode.
//
// Fires via `tool.execute.before` hook. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory.
// New-file advisory: a write to a not-yet-existing path is where bolt-on drift is
// born. Nudge reuse-over-duplicate (rules.md "Improve over duplicate") instead of
// the read-this-file checklist, which does not fit a file that does not exist yet.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: writes the checklist to stderr, which opencode surfaces in
//     the tool result the model reads — never blocks. tool.execute.before is
//     block-or-allow only (return = allow, throw = block); it has no "inject context
//     without blocking" primitive, so stderr is the advisory channel and the throw
//     path is reserved for deny mode.
//
//   - FAIL OPEN: top-level try/catch swallows every error. A plugin that throws
//     unexpectedly would crash the tool call — the fail-open boundary prevents that.
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
// opencode tool names (v1.16.x, from spike-verdict.md §(d)):
//   The spike captured `"tool": "bash"` for a subagent bash call. opencode does not
//   ship separate Edit/Write/MultiEdit tools — its primary edit surface is `write`
//   (file writes) and `edit` (targeted edits). We guard: write, edit, patch.
//   Bash is excluded (same as Claude's hook excludes Bash from non-edit tools).
//
// See: docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md §(d)
// Functional mirror of: .bkit/templates/.claude/hooks/gateguard.cjs
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no client calls, no stderr write, no throw — so it composes
// with your own checks in the exported plugin that follows the managed block,
// without bkit's block needing to know about them.

// bkit:start

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode edit-like tool names (v1.16.x confirmed from spike).
// `bash` is NOT in this list — same logic as the Claude hook excluding Bash.
// Tool names are lowercase in opencode's plugin API (confirmed from spike payload).
const EDIT_TOOLS = new Set(["write", "edit", "patch"]);

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

function reuseChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] New file \`${base}\` this session - confirm following, and investigate anything you cannot answer BEFORE adding:\n` +
    `- Confirm existing code does NOT already provide capability (grep / read source, do NOT assume).\n` +
    `- Confirm existing code CANNOT be reused / extended to provide capability (grep / read source, do NOT assume).\n` +
    `- Confirm anything code supersedes is deleted, NOT left as duplicate work (verify removal, do NOT assume).\n` +
    `- Confirm location / naming fits project architecture / topology / standards (grep / read source, do NOT assume).\n` +
    `Bolt-on drift starts here; evolve existing code first. Advisory — proceed once satisfied.`
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

function stateDir() {
  return path.join(os.tmpdir(), "bkit-gateguard");
}

function stateFile(sessionId) {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) || "no-session";
  return path.join(stateDir(), safe + ".json");
}

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
// race cannot suppress the advisory.
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

// Pure: takes the tool name, the already-extracted file path, and the session id;
// returns the advisory to emit or null. Never touches opencode's client, stderr,
// or the throw path — the driver below owns all three, so it can fold in its own
// checks without bkit's block needing to change.
function bkitGateguard(toolName, filePath, sessionId) {
  const mode = process.env.BKIT_GATEGUARD;
  if (mode === "off") return null;
  if (!EDIT_TOOLS.has(toolName)) return null;
  if (!filePath || typeof filePath !== "string") return null;

  const sid = typeof sessionId === "string" ? sessionId : "no-session";

  // Warn once per (session, file).
  if (alreadyWarned(sid, filePath)) return null;

  const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
  // A write to a not-yet-existing path is a NEW file — the bolt-on moment.
  const isNewFile = toolName === "write" && !fs.existsSync(filePath);
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

// bkit:end

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

/** @param {import('@opencode-ai/plugin').PluginInput} input */
export default function plugin(input) {
  return {
    "tool.execute.before": async (hookInput, output) => {
      try {
        if (process.env.BKIT_GATEGUARD === "off") return;

        const { tool, sessionID } = hookInput;
        if (!EDIT_TOOLS.has(tool)) return;

        // Subagents are NOT exempt: a subagent edit is still an edit, and the
        // investigation it skips is the same investigation. Dedup is per
        // (session, file), and a subagent runs in its own session, so it gets the
        // checklist once for a file the orchestrator already touched.

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
        // Fail-open: swallow unexpected errors so the hook never crashes a session.
      }
    },
  };
}
