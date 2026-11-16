#!/usr/bin/env node
// bkit-guardrails.cjs — bkit destructive-op shell gates + secret-file read gates (Google
// Antigravity).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`:
// bkit generates the same shell detection and deny / ask tiers into all three, and the same
// read tiers into this hook and Cursor's, at install (bkit's `core/hooks/`). Wired from
// `.agents/plugins/bkit/hooks.json`, matcher `view_file|run_command` — Antigravity's
// canonical tool names for file reads and shell execution.
//
// WHAT DIFFERS FROM THE CODEX TWIN — Antigravity's hook contract, live-verified on the agy
// CLI (bkit's `core/hooks/antigravity-hook.js`):
//
//   1. ENVELOPE. stdin is `{ conversationId, toolCall: { name, args }, workspacePaths }`;
//      the command is `args.CommandLine`.
//   2. OUTPUT. stdout is `{ decision, reason }`. deny → `deny` (private-key reads too);
//      ask → Antigravity's own `ask` (it prompts the human; `.env` reads too); the advisory
//      tiers (fetch host, shell-as-edit) deny the call once with the advisory as the
//      reason, because only a deny's reason reaches the model — the agent's retry goes
//      through.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher `view_file|run_command`. See
// .bkit/providers.md § Permissions / auto-approve.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - DENY IS REAL: the deny tier returns decision "deny" and blocks every time.
//   - PURE ENGINE: everything between the markers is a decision engine only — no stdin
//     read, no stdout write. Add your own gates in the driver below the block.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`.

"use strict";

// bkit:start

// bkit:managed v6.1.1 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");

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

// The name each host's guardrails advice carries in its deny line.
const ADVICE_HOST_LABELS = {
  claude: "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
  antigravity: "Antigravity",
  opencode: "OpenCode",
};
// The most characters of a command the advice echoes back.
const ADVICE_COMMAND_CHARS = 300;

// `command` cut to `ADVICE_COMMAND_CHARS` whole characters, marked when cut.
function adviceCommand(command) {
  const chars = Array.from(String(command || ""));
  if (chars.length <= ADVICE_COMMAND_CHARS) return chars.join("");
  return `${chars.slice(0, ADVICE_COMMAND_CHARS).join("")} [cut]`;
}

// The guardrails advice for one shell verdict (`classifyShell`): one text for every host
// apart from the host name in the deny line and the Codex-only line that its ask and secret
// tiers ran without a prompt. `budget` is the host's `ADVICE_BUDGETS` entry; `call` is
// `{ command, ctx, session, agent, reserve }`, where `reserve` is the size of any text the
// host adds after the advice. Returns `{ text, selected }`: `selected` are the per-file
// blocks in the text, which the caller acknowledges (`acknowledgeSelected`) once its route
// has delivered them.
function composeAdvice(v, host, budget, call = {}) {
  const label = ADVICE_HOST_LABELS[host] || host;
  const shown = adviceCommand(call.command);
  const noPrompt =
    host === "codex"
      ? "\nIt runs without confirmation, because Codex cannot prompt for one. Tell the user that you ran it."
      : "";
  switch (v.tier) {
    case "deny":
      return { text: `Blocked by bkit ${label} guardrails: ${v.what}. ${v.fix}`, selected: [] };
    case "ask":
      return {
        text: `bkit guardrails: this is a destructive or privileged command (${v.what}). It is on the PROHIBITED list in every bkit workflow.${noPrompt}\nIf the user did not ask for this exact command, NEVER run it.\n\`git clean\` and \`git checkout -- .\` destroy untracked files and uncommitted work, which no reflog can recover.\nCommand: ${shown}`,
        selected: [],
      };
    case "secret":
      return {
        text: `bkit guardrails: this command reads ${v.path}, an env, secrets or private-key file, which may expose secrets.${noPrompt}\nNEVER print secret values.\nPrefer direnv or documented non-secret examples.\nCommand: ${shown}`,
        selected: [],
      };
    default:
      break;
  }
  const fetchNote =
    v.tier === "fetch"
      ? `bkit guardrails: outbound fetch to a host that is not on this repo's network allowlist (.agents/context.md § allowed-domains, plus bkit's shipped tooling hosts).\nConfirm the destination is intended before you rely on the result.\nIf the host is a standing dependency, add it to allowed-domains.\nCommand: ${shown}`
      : "";
  const notice = v.edits ? shellEditAdvisory(v.edits) : "";
  const fixed = [fetchNote, notice].filter(Boolean).join("\n\n");
  const blocks = v.edits
    ? shellTargetBlocks(v.edits.targets, call.ctx, call.session, call.agent)
    : [];
  if (blocks.length === 0) return { text: fixed, selected: [] };
  const sep = "\n\n";
  const fixedCost = adviceSize(fixed, budget.unit) + sep.length + (call.reserve || 0);
  const { selected, context } = selectAdvice(blocks, budget, fixedCost);
  return { text: `${fixed}${sep}${context}`, selected };
}

// --- Shell detection: identical in every host's guardrails hook (bkit renders it from
// one source). Needs `fs` and `path` in scope; the host's own code above declares them. The
// git entry of `KNOWN_WRITERS` calls `parseGit` from `guardrails-deny.js`, spliced beside it.

/** Wrappers that precede the real command; skipped when finding a command's program. */
const CMD_WRAPPERS = new Set([
  "sudo",
  "env",
  "time",
  "nohup",
  "nice",
  "command",
  "exec",
  "xargs",
  "timeout",
  "stdbuf",
  "builtin",
  "noglob",
  "doas",
  "setsid",
  "busybox",
]);

/** Short options of each wrapper that take the next word as their argument. */
const WRAPPER_OPTION_ARGS = {
  xargs: new Set(["-I", "-n", "-P", "-L", "-s", "-d", "-E", "-a", "-J"]),
  sudo: new Set(["-u", "-g", "-h", "-p", "-C", "-D", "-R", "-T", "-U", "-r", "-t"]),
  doas: new Set(["-u", "-C"]),
  nice: new Set(["-n"]),
  env: new Set(["-u", "-C", "-S"]),
  timeout: new Set(["-k", "-s"]),
  exec: new Set(["-a"]),
  stdbuf: new Set(["-i", "-o", "-e"]),
};

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh"]);

/** A word that is safe to pass to a shell unquoted. */
const PLAIN_WORD_RE = /^[A-Za-z0-9_\/.,:=+@%-]+$/;

/**
 * A host's command field as shell text: a string as is; an argv array with each element
 * shell-quoted, so `["bash", "-lc", "git push -f"]` reads its script as one word. Else null.
 */
function shellCommandText(command) {
  if (typeof command === "string") return command;
  if (!Array.isArray(command) || !command.every((w) => typeof w === "string")) return null;
  return command
    .map((w) => (PLAIN_WORD_RE.test(w) ? w : "'" + w.split("'").join("'\\''") + "'"))
    .join(" ");
}

/**
 * A shell's script source: `{ script }` for the operand of `-c`, `{ stdin: true }` when it reads
 * stdin (no operand, `-s`, `-`), or `{ operand }` for a script file. Options are read the way
 * bash reads them: every option word before the first operand, `-o` / `-O` take a value, and
 * `--` or `-` ends the options.
 */
function shellScriptSource(words) {
  let dashC = false;
  let dashS = false;
  let i = 1;
  for (; i < words.length; i++) {
    const w = words[i];
    if (w === "--" || w === "-") {
      i++;
      break;
    }
    if (!/^[-+]/.test(w)) break;
    if (w.startsWith("--")) {
      if (w === "--rcfile" || w === "--init-file") i++;
      continue;
    }
    if (w[0] === "-" && w.includes("c")) dashC = true;
    if (w[0] === "-" && w.includes("s")) dashS = true;
    if (/[oO]/.test(w)) i++;
  }
  if (dashC) return { script: words[i] };
  if (dashS || i >= words.length) return { stdin: true };
  return { operand: words[i] };
}

/** The text a command prints when it only prints literal text (`echo`, `printf`, `cat <<`), else null. */
function literalOutput(item, words) {
  const program = (words[0] || "").replace(/^.*\//, "");
  if (program === "cat" && words.length === 1) {
    if (item.heredoc) return item.heredoc.body;
    if (item.hereString !== null) return item.hereString;
    return null;
  }
  const args = words.slice(1).map((w) => w.replace(/\u0000/g, ""));
  if (program === "echo") {
    while (/^-[neE]+$/.test(args[0] || "")) args.shift();
    return args.join(" ");
  }
  if (program === "printf" && args.length > 0) {
    return args.length > 1 ? args.slice(1).join("\n") : args[0].replace(/\\n/g, "\n");
  }
  return null;
}

/** `text` cut to at most `limit` bytes of UTF-8, at the last whole character. */
function cutUtf8(text, limit) {
  const buf = Buffer.from(text, "utf8");
  if (buf.length <= limit) return text;
  let end = limit;
  // A continuation byte (10xxxxxx) at the cut belongs to a character that does not fit.
  while (end > 0 && (buf[end] & 0xc0) === 0x80) end--;
  return buf.subarray(0, end).toString("utf8");
}

/** Each `$(…)` and backtick body in an unquoted heredoc body, which the shell expands. */
function heredocSubstitutions(body) {
  const out = [];
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "\\") i++;
    else if (body[i] === "$" && body[i + 1] === "(" && body[i + 2] !== "(") {
      const end = matchParen(body, i + 2);
      out.push(body.slice(i + 2, end));
      i = end;
    } else if (body[i] === "`") {
      const end = body.indexOf("`", i + 1);
      out.push(body.slice(i + 1, end < 0 ? body.length : end));
      i = end < 0 ? body.length : end;
    }
  }
  return out;
}

/**
 * The simple commands a shell text runs, quote-aware (`lexShell`): each list and pipeline
 * member, the bodies of `$(…)`, backticks, subshells and `<(…)`, the script of a `sh -c '…'`,
 * the words of `eval`, the string of `env -S`, the command of `find -exec`, a heredoc or
 * here-string fed to a shell, the literal text `echo`, `printf` or `cat <<` pipes into a shell
 * or a `<(…)` hands to a shell or `source`, and the substitutions of an unquoted heredoc,
 * to depth 3. Each is `{ program, words, prefix, redirects, stdinFile, dyn, scope }`: `words` is
 * the program and its arguments, `prefix` the assignments, wrappers and reserved words
 * stripped ahead of it (so `sudo` stays visible), `program` the first word with its path
 * stripped, `redirects` the output targets, `stdinFile` the `<` input file, `dyn` the
 * words whose value is computed (`$VAR`, `$(…)`, a glob) and `scope` the ids of the
 * subshell scopes it runs in, outermost first (a `cd` moves only its own scope). Text over
 * 256 KiB of UTF-8 is cut at the last whole character first. Quoted text and data heredoc
 * bodies are never commands. A text the parser cannot finish is judged on what was read.
 * `st` (`newEvidence`) collects the analysis limits reached.
 */
function shellCommands(text, st = newEvidence()) {
  const out = [];
  let nextScope = 0;
  const collect = (src, depth, outer) => {
    const scope = [...outer, nextScope++];
    let prev = null;
    for (const item of lexShell(src, st, depth)) {
      if (item.kind === "open") scope.push(nextScope++);
      else if (item.kind === "close" && scope.length > outer.length + 1) scope.pop();
      if (item.kind !== "cmd") continue;
      const before = prev;
      prev = item;
      judge(item, item.words, depth, scope, before);
    }
  };
  // One simple command, then the scripts it runs: a shell's script, `eval`'s words, `env -S`'s
  // string, a `find -exec` command, and text piped or process-substituted into a shell.
  const judge = (item, rawWords, depth, scope, before) => {
    const { words, prefix } = stripCommandPrefix(rawWords);
    const program = (words[0] || "").replace(/^.*\//, "");
    out.push({
      program,
      words,
      prefix,
      redirects: item.redirects,
      stdinFile: item.stdinFile,
      dyn: [...item.dyn],
      scope: [...scope],
    });
    if (item.heredoc && !item.heredoc.quoted && depth < EVIDENCE_LIMITS.depth) {
      for (const body of heredocSubstitutions(item.heredoc.body)) collect(body, depth + 1, scope);
    }
    const scripts = [];
    const split = prefix.findIndex((w, i) => w === "-S" && prefix.slice(0, i).includes("env"));
    if (split >= 0) scripts.push([prefix[split + 1], ...words].join(" "));
    // `eval` joins its words with spaces and runs the result as a script.
    if (program === "eval")
      scripts.push(
        words
          .slice(1)
          .join(" ")
          .replace(/\u0000/g, ""),
      );
    if (program === "find") {
      for (let i = 1; i < words.length; i++) {
        if (!/^-(exec|execdir|ok|okdir)$/.test(words[i])) continue;
        let end = i + 1;
        while (end < words.length && words[end] !== ";" && words[end] !== "+") end++;
        // `{}` stands for each found path: a target the hook cannot name.
        const run = { ...item, redirects: [], stdinFile: null, heredoc: null, hereString: null };
        Object.assign(run, { piped: false, procSubs: [], dyn: new Set([...item.dyn, "{}"]) });
        judge(run, words.slice(i + 1, end), depth, scope, null);
        i = end;
      }
    }
    if (SHELLS.has(program) || program === "source" || program === ".") {
      const src = SHELLS.has(program) ? shellScriptSource(words) : { operand: words[1] };
      if (src.script !== undefined && !item.dyn.has(src.script)) scripts.push(src.script);
      else if (src.operand === "\u0000" && item.procSubs.length > 0) {
        for (const body of item.procSubs) {
          const inner = lexShell(body, st, depth + 1).filter((c) => c.kind === "cmd");
          const last = inner[inner.length - 1];
          const text = last && literalOutput(last, stripCommandPrefix(last.words).words);
          if (text) scripts.push(text);
        }
      } else if (src.stdin) {
        if (item.heredoc) scripts.push(item.heredoc.body);
        else if (item.hereString !== null) scripts.push(item.hereString);
        else if (item.piped && before) {
          const text = literalOutput(before, stripCommandPrefix(before.words).words);
          if (text) scripts.push(text);
        }
      }
    }
    if (!scripts.some(Boolean)) return;
    if (depth >= EVIDENCE_LIMITS.depth) {
      evidenceLimit(st, "depth", false);
      return;
    }
    for (const script of scripts.filter(Boolean)) collect(script, depth + 1, scope);
  };
  collect(cutUtf8(String(text), EVIDENCE_LIMITS.commandBytes), 0, []);
  return out;
}

/**
 * True when some parsed command (`shellCommands`) INVOKES curl or wget, including inside
 * `sh -c '…'`, `$(…)`, backticks and `( … )`.
 *
 * A token that only appears as an argument (`grep -n 'curl' file`) is not a program.
 */
function usesFetch(cmds) {
  return cmds.some((c) => c.program === "curl" || c.program === "wget");
}

// --- Shell edit evidence -----------------------------------------------------
//
// Lexical evidence for "this command edits files", read only from the commands that match
// `KNOWN_WRITERS` or redirect output: ordered unique exact targets, an independent
// uncertainty set and at most one analysis limit. Nothing is executed and no file is read.

/** Source-ish extensions: a write into one of these is plausibly a file edit. */
const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|cjs|mjs|json|jsonl|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/** Agent-read locations an edit reaches even without a source extension. */
const EVIDENCE_AGENT_READ_RE =
  /(?:^|\/)(?:\.agents|\.bkit)\/|(?:^|\/)(?:AGENTS|CLAUDE|GEMINI)\.md$/;

const EVIDENCE_LIMITS = {
  commandBytes: 256 * 1024,
  depth: 3,
  targets: 64,
  targetChars: 160,
  deadlineMs: 200,
};

/** The call context a hook passes: effective directory and the workspace root. */
function hookContext(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const roots = Array.isArray(p.workspace_roots) ? p.workspace_roots : [];
  const root = roots.find((r) => typeof r === "string" && r) || undefined;
  const cwd = typeof p.cwd === "string" && p.cwd ? p.cwd : undefined;
  return { cwd, root };
}

/** This process's own CPU time in ms; scheduler contention does not inflate it. */
function cpuMs() {
  const u = process.cpuUsage();
  return (u.user + u.system) / 1000;
}

function newEvidence(ctx) {
  const cwd = path.resolve((ctx && ctx.cwd) || process.cwd());
  const root = path.resolve((ctx && ctx.root) || (ctx && ctx.cwd) || process.cwd());
  return {
    root,
    baseCwd: cwd,
    targets: [],
    seen: new Set(),
    uncertain: new Set(),
    limit: null,
    halted: false,
    startWall: Date.now(),
    startCpu: cpuMs(),
  };
}

/** Record the first limit; `halt` stops all further analysis (a prefix is kept). */
function evidenceLimit(st, reason, halt = true) {
  if (!st.limit) st.limit = reason;
  if (halt) st.halted = true;
}

function evidenceExpired(st) {
  if (st.halted) return true;
  // The deadline counts the process's own CPU time, so machine load cannot trip it;
  // a wall-clock backstop (4x) still bounds a stalled process.
  if (
    cpuMs() - st.startCpu > EVIDENCE_LIMITS.deadlineMs ||
    Date.now() - st.startWall > EVIDENCE_LIMITS.deadlineMs * 4
  ) {
    evidenceLimit(st, "deadline");
    return true;
  }
  return false;
}

function isQuietLiteral(literal) {
  return (
    /^\/(dev|tmp|var\/folders|var\/tmp)\//.test(literal) ||
    /\.(log|bak|tmp|out|err|orig)$/i.test(literal)
  );
}

function insideRoot(st, abs) {
  const rel = path.relative(st.root, abs);
  return rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel);
}

/**
 * Add one literal target. `force` skips the source-extension filter (in-place editors and
 * formatters name files whatever their extension); a forced target that is a directory is
 * uncertainty. A relative target under an unresolved directory is uncertainty, never a
 * guessed path.
 */
function addEvidenceTarget(st, literal, cwd, force) {
  if (evidenceExpired(st) || !literal) return;
  if (!force && !SOURCE_EXT_RE.test(literal) && !EVIDENCE_AGENT_READ_RE.test(literal)) return;
  if (/\.(log|bak|tmp|out|err|orig)$/i.test(literal)) return;
  if (cwd === null && !path.isAbsolute(literal)) {
    st.uncertain.add("unresolved-directory");
    return;
  }
  const abs = path.resolve(cwd === null ? path.sep : cwd, literal);
  if (isQuietLiteral(literal) && !insideRoot(st, abs)) return;
  const shown = insideRoot(st, abs) ? path.relative(st.root, abs).split(path.sep).join("/") : abs;
  // A target reaches hook output: control characters, backticks, overlong names and
  // directories become uncertainty instead of text.
  if (
    shown === "" ||
    shown.length > EVIDENCE_LIMITS.targetChars ||
    (force && fs.statSync(abs, { throwIfNoEntry: false })?.isDirectory()) ||
    /[\u0000-\u001f\u007f-\u009f\u2028\u2029`]/.test(shown)
  ) {
    st.uncertain.add("unresolved-target");
    return;
  }
  if (st.seen.has(shown)) return;
  if (st.targets.length >= EVIDENCE_LIMITS.targets) {
    evidenceLimit(st, "target-count");
    return;
  }
  st.seen.add(shown);
  st.targets.push(shown);
}

/** A target word: dynamic ones are uncertain when they could name a source file. */
function addWordTarget(st, cmd, text, cwd, force) {
  if (cmd.dyn.includes(text)) {
    if (force || SOURCE_EXT_RE.test(text.replace(/\u0000/g, ""))) {
      if (!/^\$[A-Za-z_{][A-Za-z0-9_}]*$/.test(text) || force)
        st.uncertain.add("unresolved-target");
    }
    return;
  }
  addEvidenceTarget(st, text, cwd, force);
}

// --- Lexer -------------------------------------------------------------------

/** Matching `)` of a `$(` whose body starts at `from`; quotes and nesting aware. */
function matchParen(text, from) {
  let depth = 1;
  let quote = "";
  const heredocs = [];
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\" && quote === '"') i++;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
        text.slice(i, i + 200),
      );
      if (m) {
        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
        i += m[0].length - 1;
        continue;
      }
    }
    if (ch === "\n" && heredocs.length > 0) {
      // Heredoc bodies are data: skip to the line holding each delimiter.
      let pos = i + 1;
      for (const h of heredocs) {
        while (pos < text.length) {
          let eol = text.indexOf("\n", pos);
          if (eol < 0) eol = text.length;
          let line = text.slice(pos, eol);
          if (h.strip) line = line.replace(/^\t+/, "");
          pos = eol + 1;
          if (line === h.delim) break;
        }
      }
      heredocs.length = 0;
      i = pos - 2;
      continue;
    }
    if (ch === "\\") i++;
    else if (ch === "'" || ch === '"') quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")" && --depth === 0) return i;
  }
  return text.length;
}

/**
 * Parse `text` into command items: `{ kind: "cmd", words, dyn, redirects, heredoc,
 * stdinFile, hereString, piped }` plus `open` / `close` scope markers around subshells and
 * substitutions. Quotes, escapes, comments, heredoc bodies and substitutions are honoured.
 */
function lexShell(text, st, depth) {
  const items = [];
  let cmd = newLexCommand();
  let cur = newLexWord();
  let pending = null;
  let pipedFromPrev = false;
  const heredocs = [];

  function newLexCommand() {
    return {
      kind: "cmd",
      words: [],
      dyn: new Set(),
      redirects: [],
      heredoc: null,
      stdinFile: null,
      hereString: null,
      piped: false,
      procSubs: [],
    };
  }
  function newLexWord() {
    return { t: "", started: false, dyn: false, quoted: false, digits: true };
  }
  function pushWord() {
    if (!cur.started) return;
    const word = cur;
    cur = newLexWord();
    if (word.dyn) cmd.dyn.add(word.t);
    if (pending) {
      const r = pending;
      pending = null;
      if (r.op === "<<") heredocs.push({ cmd, delim: word.t, quoted: word.quoted, strip: r.strip });
      else if (r.op === "<") cmd.stdinFile = word.t;
      else if (r.op === "<<<") cmd.hereString = word.t;
      else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
      return;
    }
    cmd.words.push(word.t);
  }
  function endCommand(pipe) {
    pushWord();
    pending = null;
    if (cmd.words.length > 0 || cmd.redirects.length > 0 || cmd.stdinFile || cmd.heredoc) {
      cmd.piped = pipedFromPrev;
      items.push(cmd);
    }
    pipedFromPrev = pipe;
    cmd = newLexCommand();
  }
  function subshell(body) {
    if (depth + 1 > EVIDENCE_LIMITS.depth) {
      // Too deep a nesting skips that body only: the commands after it are still judged.
      evidenceLimit(st, "depth", false);
      return;
    }
    items.push({ kind: "open" });
    items.push(...lexShell(body, st, depth + 1));
    items.push({ kind: "close" });
  }
  function add(ch) {
    cur.t += ch;
    cur.started = true;
    if (!/\d/.test(ch)) cur.digits = false;
  }
  function expansion(i) {
    // text[i] === "$"; returns the index of the last consumed char.
    const next = text[i + 1];
    if (next === "(") {
      const end = matchParen(text, i + 2);
      if (text[i + 2] !== "(") subshell(text.slice(i + 2, end));
      cur.dyn = true;
      cur.t += "\u0000";
      cur.started = true;
      cur.digits = false;
      return end;
    }
    if (next === "{") {
      const end = text.indexOf("}", i + 2);
      cur.dyn = true;
      cur.t += text.slice(i, end < 0 ? text.length : end + 1);
      cur.started = true;
      cur.digits = false;
      return end < 0 ? text.length : end;
    }
    if (next && /[A-Za-z0-9_@*#?!-]/.test(next)) cur.dyn = true;
    add("$");
    return i;
  }
  function backtick(i) {
    const end = text.indexOf("`", i + 1);
    subshell(text.slice(i + 1, end < 0 ? text.length : end));
    cur.dyn = true;
    cur.t += "\u0000";
    cur.started = true;
    cur.digits = false;
    return end < 0 ? text.length : end;
  }
  function readHeredocBodies(from) {
    let i = from;
    for (const h of heredocs.splice(0)) {
      const lines = [];
      while (i < text.length) {
        let eol = text.indexOf("\n", i);
        if (eol < 0) eol = text.length;
        const line = text.slice(i, eol);
        i = Math.min(eol + 1, text.length);
        if ((h.strip ? line.replace(/^\t+/, "") : line) === h.delim) break;
        lines.push(line);
      }
      h.cmd.heredoc = { body: lines.join("\n"), quoted: h.quoted };
    }
    return i;
  }

  for (let i = 0; i < text.length; i++) {
    if (i % 512 === 0 && evidenceExpired(st)) break;
    const ch = text[i];
    if (ch === "\\") {
      if (text[i + 1] === "\n") {
        i++;
        continue;
      }
      if (i + 1 < text.length) add(text[++i]);
      cur.quoted = true;
      continue;
    }
    if (ch === "'") {
      const end = text.indexOf("'", i + 1);
      cur.t += text.slice(i + 1, end < 0 ? text.length : end);
      cur.started = true;
      cur.quoted = true;
      cur.digits = false;
      i = end < 0 ? text.length : end;
      continue;
    }
    if (ch === '"') {
      cur.started = true;
      cur.quoted = true;
      cur.digits = false;
      let j = i + 1;
      for (; j < text.length && text[j] !== '"'; j++) {
        const c = text[j];
        if (c === "\\" && j + 1 < text.length) {
          const n = text[j + 1];
          if (n === "\n") j++;
          else if (/["\\$`]/.test(n)) cur.t += text[++j];
          else cur.t += c;
        } else if (c === "$") j = expansion(j);
        else if (c === "`") j = backtick(j);
        else cur.t += c;
      }
      i = j;
      continue;
    }
    if (ch === "`") {
      i = backtick(i);
      continue;
    }
    if (ch === "$") {
      i = expansion(i);
      continue;
    }
    if (ch === "#" && !cur.started) {
      const eol = text.indexOf("\n", i);
      i = eol < 0 ? text.length : eol - 1;
      continue;
    }
    if (ch === "\n") {
      endCommand(false);
      i = readHeredocBodies(i + 1) - 1;
      continue;
    }
    if (/\s/.test(ch)) {
      pushWord();
      continue;
    }
    if (ch === ";") {
      endCommand(false);
      continue;
    }
    if (ch === "&") {
      if (text[i + 1] === "&") {
        endCommand(false);
        i++;
      } else if (text[i + 1] === ">") {
        pushWord();
        pending = { op: ">", ignore: false };
        i += text[i + 2] === ">" ? 2 : 1;
      } else {
        endCommand(false);
      }
      continue;
    }
    if (ch === "|") {
      endCommand(true);
      if (text[i + 1] === "|") {
        pipedFromPrev = false;
        i++;
      } else if (text[i + 1] === "&") i++;
      continue;
    }
    if (ch === "(" || ch === ")") {
      endCommand(false);
      items.push({ kind: ch === "(" ? "open" : "close" });
      continue;
    }
    if ((ch === "<" || ch === ">") && text[i + 1] === "(") {
      // Process substitution: its body runs, and the word is a path to its output.
      const end = matchParen(text, i + 2);
      subshell(text.slice(i + 2, end));
      cmd.procSubs.push(text.slice(i + 2, end));
      cur.dyn = true;
      cur.t += "\u0000";
      cur.started = true;
      cur.digits = false;
      i = end;
      continue;
    }
    if (ch === ">" || ch === "<") {
      let fd = false;
      let stdoutFd = false;
      if (cur.started && cur.digits && !cur.quoted) {
        fd = true;
        stdoutFd = ch === ">" && cur.t === "1";
        cur = newLexWord();
      } else pushWord();
      let op = ch;
      let strip = false;
      let ignore = fd && !stdoutFd;
      let dup = false;
      let j = i + 1;
      if (ch === ">") {
        if (text[j] === ">" || text[j] === "|") j++;
        else if (text[j] === "&") {
          ignore = true;
          dup = !fd || stdoutFd;
          j++;
        }
      } else if (text[j] === "<") {
        j++;
        if (text[j] === "<") {
          op = "<<<";
          j++;
        } else {
          op = "<<";
          if (text[j] === "-") {
            strip = true;
            j++;
          }
        }
      } else if (text[j] === "&") {
        op = ">";
        ignore = true;
        j++;
      } else if (text[j] === ">") {
        j++;
      }
      i = j - 1;
      pending = { op, strip, ignore, dup };
      continue;
    }
    if (!cur.started && ch === "~") cur.dyn = true;
    if (ch === "*" || ch === "?" || ch === "[") cur.dyn = true;
    add(ch);
  }
  endCommand(false);
  readHeredocBodies(text.length);
  return items;
}

// --- Command prefix ----------------------------------------------------------

const KEYWORD_PREFIX = new Set([
  "then",
  "do",
  "else",
  "elif",
  "if",
  "while",
  "until",
  "!",
  "{",
  "}",
  "time",
]);

/**
 * Strip assignments, wrappers (with their options, the arguments those options take and
 * the `timeout` duration), reserved words and a `function NAME` head ahead of the real program. `prefix` is the
 * stripped words.
 */
function stripCommandPrefix(words) {
  let i = 0;
  while (
    i < words.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) ||
      CMD_WRAPPERS.has(words[i]) ||
      KEYWORD_PREFIX.has(words[i]) ||
      words[i] === "function")
  ) {
    const wrapper = words[i];
    // `function NAME` heads a definition; its body is the command.
    i += wrapper === "function" ? 2 : 1;
    if (!CMD_WRAPPERS.has(wrapper)) continue;
    const withArg = WRAPPER_OPTION_ARGS[wrapper];
    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
      const opt = words[i++];
      if (opt === "--") break;
      if (withArg && withArg.has(opt)) i++;
    }
    if (wrapper === "timeout" && i < words.length) i++;
  }
  return { words: words.slice(i), prefix: words.slice(0, i) };
}

function resolveCwd(cwd, dir) {
  if (cwd === null) return path.isAbsolute(dir) ? path.resolve(dir) : null;
  return path.resolve(cwd, dir);
}

/** Positional operands of a simple tool: non-option words (everything after `--`). */
function operands(args) {
  const out = [];
  let rest = false;
  for (const a of args) {
    if (rest || a === "-" || !a.startsWith("-")) out.push(a);
    else if (a === "--") rest = true;
  }
  return out;
}

// --- Known writers -------------------------------------------------------------

/**
 * In-place operands of an editor call, or null when it does not edit in place. `flag(a)` reads
 * one option word: `"in-place"`, `"script"` (the program is an option value, so the first
 * operand is a file), `"script+1"` / `"value"` (the next word is that value) or null. Without
 * a script option the first operand is the program.
 */
function inPlaceOperands(args, flag) {
  let inPlace = false;
  let script = false;
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      pos.push(...args.slice(i + 1));
      break;
    }
    if (!a.startsWith("-") || a === "-") {
      pos.push(a);
      continue;
    }
    const kind = flag(a, args[i + 1]);
    if (kind === "in-place") inPlace = true;
    else if (kind === "in-place+1") {
      inPlace = true;
      i++;
    } else if (kind === "script") script = true;
    else if (kind === "script+1") {
      script = true;
      i++;
    } else if (kind === "value") i++;
  }
  if (!inPlace) return null;
  if (!script) pos.shift();
  return pos;
}

/** sed / gsed: `-i[SUFFIX]` (BSD `-i ''`), `--in-place`; `-e` / `-f` supply the script. */
function sedFlag(a, next) {
  if (/^--in-place(=|$)/.test(a)) return "in-place";
  if (/^--(expression|file)=/.test(a)) return "script";
  if (a === "--expression" || a === "--file") return "script+1";
  const m = /^-[A-Za-z]*?([ief])/.exec(a);
  if (!m) return null;
  if (m[1] === "i") return a.endsWith("i") && next === "" ? "in-place+1" : "in-place";
  return a.endsWith(m[1]) ? "script+1" : "script";
}

/** perl / ruby: `-i[SUFFIX]` in a cluster (`-pi`); `-e` / `-E` supply the script. */
function perlFlag(a) {
  if (a.startsWith("--")) return null;
  for (let k = 1; k < a.length; k++) {
    const c = a[k];
    if (c === "i") return "in-place";
    if (c === "e" || c === "E") return k === a.length - 1 ? "script+1" : "script";
    // These take the rest of the cluster as their own argument.
    if ("IMmFlx0".includes(c)) return null;
  }
  return null;
}

/** awk / gawk: `-i inplace`; `-f` / `-e` supply the program; `-v`, `-F` take a value. */
function awkFlag(a, next) {
  if (a === "-i") return next === "inplace" ? "in-place+1" : "value";
  if (a === "-f" || a === "-e" || a === "--file" || a === "--source") return "script+1";
  if (a === "-v" || a === "-F") return "value";
  return null;
}

/** Operands a formatter writes when one of `flags` is given; `values` take the next word. */
function fixerTargets(args, flags, values) {
  if (!args.some((a) => flags.includes(a))) return null;
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      out.push(...args.slice(i + 1));
      break;
    }
    if (!a.startsWith("-")) out.push(a);
    else if (values.has(a)) i++;
  }
  return out;
}

const PRETTIER_VALUE_OPTS = new Set([
  "--config",
  "--ignore-path",
  "--plugin",
  "--parser",
  "--log-level",
  "--cache-location",
  "--cache-strategy",
  "--stdin-filepath",
  "--print-width",
  "--tab-width",
]);
const ESLINT_VALUE_OPTS = new Set([
  "-c",
  "--config",
  "-f",
  "--format",
  "-o",
  "--output-file",
  "--ext",
  "--rule",
  "--parser",
  "--plugin",
  "--ignore-path",
  "--ignore-pattern",
  "--max-warnings",
  "--cache-location",
  "--fix-type",
]);
const YQ_VALUE_OPTS = new Set([
  "-o",
  "--output-format",
  "-p",
  "--input-format",
  "-I",
  "--indent",
  "-s",
  "--split-exp",
  "--front-matter",
]);

/** yq: `-i` / `--inplace`; files follow the expression (`yq eval -i EXPR FILE`). */
function yqTargets(args) {
  if (!args.some((a) => a === "-i" || /^--inplace(=|$)/.test(a))) return null;
  const rest = ["e", "eval", "ea", "eval-all"].includes(args[0]) ? args.slice(1) : args;
  let expression = false;
  const pos = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--expression") {
      expression = true;
      i++;
    } else if (a.startsWith("--expression=")) expression = true;
    else if (!a.startsWith("-")) pos.push(a);
    else if (YQ_VALUE_OPTS.has(a)) i++;
  }
  if (!expression) pos.shift();
  return pos;
}

/** cp / mv: the target is an option value (`-t DIR`) the table does not name. */
function hasTargetDir(args) {
  return args.some((a) => a === "-t" || a.startsWith("--target-directory"));
}

/** git: `apply` (its files are in the patch body) and `checkout -- <file>`, via `parseGit`. */
function gitTargets(args, words) {
  const g = parseGit(words);
  if (!g) return null;
  if (g.sub === "apply") {
    const report = ["--check", "--stat", "--numstat", "--summary"].some((o) => g.long.has(o));
    return report && !g.long.has("--apply") ? null : "patch-body";
  }
  if (g.sub !== "checkout") return null;
  const end = words.indexOf("--");
  return end > 0 ? words.slice(end + 1) : null;
}

/**
 * The commands known to write files: the only ones the "may edit files" advice names. bkit
 * owns the list; it is not extensible. Each entry is keyed by program and gives `form`, the
 * flag or form that makes it write, and `read(args, words)`, which returns the target words,
 * null when this call writes nothing, or a reason code when the targets are not on the command
 * line. `force` names a target whatever its extension; otherwise only source and agent-read
 * files count, so `cp a.png b.png` and `tee out.txt` stay quiet. The `>` and `>>` redirects
 * of any command are writers too (`shellEditTargets`). Every other command is silent: script
 * runners (`node`, `python3`) are never read. `prettier` and `eslint` are also matched behind
 * `npx`, `pnpm exec`, `pnpm dlx`, `yarn` and `bunx` (`unwrapRunner`).
 */
const KNOWN_WRITERS = {
  sed: { form: "-i", force: true, read: (args) => inPlaceOperands(args, sedFlag) },
  gsed: { form: "-i", force: true, read: (args) => inPlaceOperands(args, sedFlag) },
  perl: { form: "-i", force: true, read: (args) => inPlaceOperands(args, perlFlag) },
  ruby: { form: "-i", force: true, read: (args) => inPlaceOperands(args, perlFlag) },
  awk: { form: "-i inplace", force: true, read: (args) => inPlaceOperands(args, awkFlag) },
  gawk: { form: "-i inplace", force: true, read: (args) => inPlaceOperands(args, awkFlag) },
  tee: { form: "its file operands", force: false, read: operands },
  cp: {
    form: "its last operand",
    force: false,
    read: (args) => {
      if (hasTargetDir(args)) return "unresolved-target";
      const ops = operands(args);
      return ops.length > 1 ? ops.slice(-1) : null;
    },
  },
  mv: {
    form: "both operands",
    force: false,
    read: (args) =>
      hasTargetDir(args) ? "unresolved-target" : operands(args).length > 1 ? operands(args) : null,
  },
  patch: {
    form: "any call but a dry run",
    read: (args) => (args.some((a) => /^(--dry-run|--check|-C)$/.test(a)) ? null : "patch-body"),
  },
  git: { form: "apply, checkout -- <file>", force: true, read: gitTargets },
  prettier: {
    form: "--write or -w",
    force: true,
    read: (args) => fixerTargets(args, ["--write", "-w"], PRETTIER_VALUE_OPTS),
  },
  eslint: {
    form: "--fix",
    force: true,
    read: (args) => fixerTargets(args, ["--fix"], ESLINT_VALUE_OPTS),
  },
  yq: { form: "-i or --inplace", force: true, read: yqTargets },
  dd: {
    form: "of=FILE",
    force: false,
    read: (args) => {
      const out = args.filter((a) => a.startsWith("of=")).map((a) => a.slice(3));
      return out.length > 0 ? out : null;
    },
  },
};

/** The tool a package runner starts (`npx -y prettier@3 …` -> `prettier …`), else `words`. */
function unwrapRunner(words) {
  const p = (words[0] || "").replace(/^.*\//, "");
  let rest;
  if (p === "npx" || p === "bunx") rest = words.slice(1);
  else if (p === "pnpm" && (words[1] === "exec" || words[1] === "dlx")) rest = words.slice(2);
  else if (p === "yarn")
    rest = ["exec", "dlx"].includes(words[1]) ? words.slice(2) : words.slice(1);
  else return words;
  let i = 0;
  while (i < rest.length && rest[i].startsWith("-")) i += /^(-p|--package)$/.test(rest[i]) ? 2 : 1;
  rest = rest.slice(i);
  return rest.length > 0 ? [rest[0].replace(/(.)@[^/]*$/, "$1"), ...rest.slice(1)] : rest;
}

/** Record what one parsed command writes, from its redirects and `KNOWN_WRITERS`. */
function addCommandEdits(st, c, cwd) {
  for (const t of c.redirects) if (!t.startsWith("&")) addWordTarget(st, c, t, cwd, false);
  const words = unwrapRunner(c.words);
  const program = (words[0] || "").replace(/^.*\//, "");
  if (!Object.hasOwn(KNOWN_WRITERS, program) || c.dyn.includes(words[0])) return;
  const writer = KNOWN_WRITERS[program];
  const hit = writer.read(words.slice(1), words);
  if (hit === null) return;
  // A reason code, or operands `xargs` extends from its input: no file can be named.
  if (typeof hit === "string") st.uncertain.add(hit);
  else if (c.prefix.some((w) => w.replace(/^.*\//, "") === "xargs"))
    st.uncertain.add("unresolved-target");
  else for (const w of hit) addWordTarget(st, c, w, cwd, writer.force);
}

const EVIDENCE_REASONS = {
  "unresolved-directory": "the working directory is not a literal path",
  "unresolved-target": "a target path is computed, not literal, or a directory",
  "patch-body": "a patch names its files in its body, which is not read",
};
const LIMIT_REASONS = {
  "command-size": "the command is longer than 256 KiB",
  depth: "nesting is deeper than 3 levels",
  "target-count": "more than 64 targets",
  deadline: "analysis took longer than 200 ms",
};

/**
 * Edit evidence for a shell command: `{ targets, uncertain, limit }`. Each parsed command
 * (`shellCommands`) is matched against its redirects and `KNOWN_WRITERS`; nothing else counts.
 * `targets` are ordered unique paths (workspace-relative where inside it), `uncertain` lists
 * reason codes for writes whose targets cannot be named, and `limit` is the first analysis
 * limit reached (the targets found before it are kept). A literal `cd` moves the directory
 * relative targets resolve against, within its own subshell scope. A command that matches no
 * writer returns empty `targets` and `uncertain` and a null `limit`.
 *
 * Quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `mktemp` handoff files and log capture.
 * `ctx` is `{ cwd, root }` (`hookContext`).
 */
function shellEditTargets(cmd, ctx) {
  const st = newEvidence(ctx);
  const text = String(cmd);
  if (Buffer.byteLength(text, "utf8") > EVIDENCE_LIMITS.commandBytes) {
    evidenceLimit(st, "command-size", false);
  }
  // The directory of each scope: a scope starts in its parent's directory.
  const cwds = new Map();
  for (const c of shellCommands(text, st)) {
    if (evidenceExpired(st)) break;
    let cwd = st.baseCwd;
    for (const id of c.scope) {
      if (cwds.has(id)) cwd = cwds.get(id);
      else cwds.set(id, cwd);
    }
    if (c.program === "cd" || c.program === "pushd" || c.program === "popd") {
      const arg = c.program === "popd" ? undefined : operands(c.words.slice(1))[0];
      const known = arg !== undefined && arg !== "-" && !c.dyn.includes(arg);
      cwds.set(c.scope[c.scope.length - 1], known ? resolveCwd(cwd, arg) : null);
    }
    addCommandEdits(st, c, cwd);
  }
  return { targets: st.targets, uncertain: [...st.uncertain], limit: st.limit };
}

/** True when the evidence has anything to report. */
function hasEditEvidence(ev) {
  return Boolean(ev) && (ev.targets.length > 0 || ev.uncertain.length > 0 || Boolean(ev.limit));
}

/** Shared advisory string, identical on every host. */
function shellEditAdvisory(ev) {
  const named = ev.targets.length > 0;
  // The introduction counts against the host's response budget, so it names only as many
  // targets as fit a fixed character cap; the per-file blocks carry the full list.
  const shown = [];
  let used = 0;
  for (const t of ev.targets) {
    if (shown.length > 0 && used + JSON.stringify(t).length > 200) break;
    shown.push(JSON.stringify(t));
    used += JSON.stringify(t).length + 2;
  }
  const more = ev.targets.length - shown.length;
  const lines = [
    named
      ? `bkit guardrails: this command edits files through the shell (targets: ${shown.join(", ")}${more > 0 ? ` and ${more} more` : ""}). The command is allowed.`
      : "bkit guardrails: this command may edit files through the shell. The command is allowed.",
    "Pre-edit gates see only the edit and write tools, so a shell edit gets past every one of them.",
  ];
  if (ev.uncertain.length > 0) {
    lines.push(
      `Some targets cannot be determined (${ev.uncertain.map((r) => EVIDENCE_REASONS[r] || r).join("; ")}). The authoring rules in .bkit/authoring.md still apply to every file this command may write.`,
    );
  }
  if (ev.limit) {
    lines.push(
      `Analysis limit reached (${LIMIT_REASONS[ev.limit] || ev.limit}); the targets listed were found before it, and later ones were not examined.`,
    );
  }
  lines.push(
    "Use the edit or write tool instead.",
    "If this is one of the exceptions in .agents/rules.md (generating files from a script, a bulk mechanical rewrite, or appending a log line to your own step output file with `>>`), proceed.",
  );
  return lines.join("\n");
}

/** Repo-relative path of the install-written network allowlist every host's hook reads. */
const NETWORK_ALLOWLIST_FILE = path.join(".bkit", "allowlist.json");

/**
 * Directories a hook call names, most authoritative first: the workspace roots (Cursor
 * `workspace_roots`; Antigravity `workspacePaths`, carried over by its payload adapter),
 * the payload `cwd` (Claude, Codex, Cursor), then the hook process's own cwd — which on
 * Antigravity is the plugin dir, not the repo.
 */
function hookDirs(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const roots = Array.isArray(p.workspace_roots) ? p.workspace_roots : [];
  return [...roots, p.cwd, process.cwd()].filter((d) => typeof d === "string" && d !== "");
}

/**
 * The network allowlist file for a hook call: walking up from each of `dirs` in turn,
 * the first `.bkit/allowlist.json` found. A directory holding `.git` (the repo root)
 * ends that walk. null when none is found.
 */
function findNetworkAllowlist(dirs) {
  for (const start of dirs) {
    let dir = path.resolve(start);
    for (;;) {
      const file = path.join(dir, NETWORK_ALLOWLIST_FILE);
      if (fs.existsSync(file)) return file;
      const parent = path.dirname(dir);
      if (parent === dir || fs.existsSync(path.join(dir, ".git"))) break;
      dir = parent;
    }
  }
  return null;
}

/**
 * Hosts come from `.bkit/allowlist.json`, the one install-written artifact carrying the
 * resolved network allowlist (the shipped egress registry union the consumer's
 * `allowed-domains`); every host's hook reads it, found from the hook call's
 * directories (`hookDirs`). There is NO hardcoded fallback list: absent or unreadable,
 * this returns empty and every host is treated as unknown.
 */
function loadNetworkAllowlistBases(dirs) {
  const bases = new Set();
  try {
    const p = findNetworkAllowlist(dirs);
    if (p) {
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      const domains = Array.isArray(doc.domains) ? doc.domains : [];
      for (const d of domains) {
        const b = String(d).replace(/^\*\./, "").trim();
        if (b) bases.add(b);
      }
    }
  } catch {
    /* corrupt allowlist → empty set: every host reads as unknown; never crashes */
  }
  return bases;
}

/**
 * Pull the HOST out of every `http(s)://…` URL in a command.
 *
 * Strict: only an explicit scheme counts; a scheme-less token (`./deploy.sh`,
 * `pkg.json`) is never read as a URL.
 */
function extractUrlHosts(cmd) {
  const hosts = [];
  const re = /\bhttps?:\/\/([^\s"'`\\|;&<>()]+)/gi;
  let m;
  while ((m = re.exec(cmd)) !== null) {
    // Authority ends at the first /, ? or #.
    let authority = m[1].split(/[/?#]/)[0];
    // Strip userinfo — `https://github.com@evil.tld/` is a request to evil.tld.
    const at = authority.lastIndexOf("@");
    if (at >= 0) authority = authority.slice(at + 1);
    // Strip port.
    authority = authority.split(":")[0];
    if (authority) hosts.push(authority.toLowerCase());
  }
  return hosts;
}

/** Suffix match on host labels — `github.com` covers `api.github.com`, not `github.com.evil.tld`. */
function hostMatchesBase(host, base) {
  const b = String(base).toLowerCase();
  return host === b || host.endsWith("." + b);
}

/**
 * True when EVERY URL in the command targets an allowlisted host.
 *
 * Only each URL's host is consulted, never the rest of the command string (query
 * params, headers). No parseable URL, or any host off the list → false. `dirs` locate
 * the allowlist (`hookDirs`).
 */
function curlWgetHostAllowed(cmd, dirs) {
  const hosts = extractUrlHosts(cmd);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases(dirs);
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
}

// --- Shell deny tier: identical in every host's guardrails hook (bkit renders it from one
// source). Reads the parsed commands `shellCommands` (`guardrails-shell.js`) returns; needs
// nothing else in scope.
//
// git commands are classified by their parsed words — subcommand, flag set (any order,
// short clusters such as `-fdx` expanded), positionals, `+refspec` — never by a literal
// prefix, so `git reset -q --hard` and `git push origin +dev` land in the same tier as
// `git reset --hard` and `git push --force`.

/** git global options that take the next word as their value (`git -C dir push`). */
const GIT_GLOBAL_VALUE_OPTS = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
  "--super-prefix",
]);

/**
 * Per subcommand, the options that take a value: `short` letters consume the rest of their
 * cluster or the next word, `long` names consume the next word when written without `=`.
 * A value is never read as a flag or a positional (`git commit -m "drop -n"`).
 */
const GIT_VALUE_OPTS = {
  push: { short: "o", long: ["--push-option", "--repo", "--receive-pack", "--exec"] },
  clean: { short: "e", long: ["--exclude"] },
  checkout: { short: "bB", long: ["--orphan"] },
  restore: { short: "s", long: ["--source"] },
  rebase: { short: "xsXC", long: ["--onto", "--exec", "--strategy", "--strategy-option"] },
  commit: {
    short: "mFCct",
    long: [
      "--message",
      "--file",
      "--author",
      "--date",
      "--reuse-message",
      "--reedit-message",
      "--fixup",
      "--squash",
      "--template",
      "--cleanup",
      "--trailer",
    ],
  },
};

/**
 * A git invocation's parsed words, or null when `words` does not run git:
 * `{ sub, long: Set<"--name">, short: Set<letter>, args: string[] }`. Words after `--`
 * are positionals.
 */
function parseGit(words) {
  if ((words[0] || "").replace(/^.*\//, "") !== "git") return null;
  let i = 1;
  while (i < words.length && words[i].startsWith("-")) {
    i += GIT_GLOBAL_VALUE_OPTS.has(words[i]) ? 2 : 1;
  }
  const sub = words[i];
  if (!sub) return null;
  const spec = GIT_VALUE_OPTS[sub] || { short: "", long: [] };
  const long = new Set();
  const short = new Set();
  const args = [];
  let positionalOnly = false;
  for (let j = i + 1; j < words.length; j++) {
    const w = words[j];
    if (positionalOnly || w === "-" || !w.startsWith("-")) {
      args.push(w);
    } else if (w === "--") {
      positionalOnly = true;
    } else if (w.startsWith("--")) {
      const name = w.split("=")[0];
      long.add(name);
      if (!w.includes("=") && spec.long.includes(name)) j++;
    } else {
      for (let k = 1; k < w.length; k++) {
        short.add(w[k]);
        if (spec.short.includes(w[k])) {
          if (k === w.length - 1) j++;
          break;
        }
      }
    }
  }
  return { sub, long, short, args };
}

/** `{ what, fix }` when a parsed command's words force-push with git, else null. */
function gitDenyRule(words) {
  const g = parseGit(words);
  if (!g || g.sub !== "push") return null;
  if (g.long.has("--force") || g.short.has("f") || g.args.some((a) => a.startsWith("+"))) {
    return {
      what: "git force-push",
      fix: "NEVER force-push (--force, -f or a +refspec). Use a normal push, or --force-with-lease only when the user explicitly asks for it on a personal branch.",
    };
  }
  return null;
}

/**
 * A filesystem root an operand names: `/` (also `//`, `/.`), or `~`, `$HOME` or `${HOME}` bare
 * or followed by such slashes and dots, with an optional trailing `*`.
 */
const ROOT_OPERAND = /^(?:\/[/.]*|(?:~|\$HOME|\$\{HOME\})(?:\/[/.]*)?)\*?$/;

/** The system root itself: `/`, `//`, `/.`, `/*`. */
const SYSTEM_ROOT = /^\/[/.]*\*?$/;

/** A chmod mode that makes a file world-writable: octal `777` / `0777` / `666`, or `a+w` / `o=rwx`. */
function worldWritable(mode) {
  if (/^[0-7]{3,4}$/.test(mode)) return /[2367]$/.test(mode);
  return mode.split(",").some((clause) => /^[ugoa]*[ao][ugoa]*[+=][rwxXst]*w/.test(clause));
}

/** An option word's short letters and long names, and the operands, of `words` after the program. */
function optionsAndOperands(words) {
  const short = new Set();
  const long = new Set();
  const operands = [];
  let positionalOnly = false;
  for (const w of words.slice(1)) {
    if (positionalOnly || w === "-" || !w.startsWith("-")) operands.push(w);
    else if (w === "--") positionalOnly = true;
    else if (w.startsWith("--")) long.add(w.split("=")[0]);
    else for (const ch of w.slice(1)) short.add(ch);
  }
  return { short, long, operands };
}

/**
 * Deny tier — matches Claude's settings.json deny rows and OpenCode's bash deny map.
 * `cmds` are the parsed commands (`shellCommands`). `{ what, fix }` for a blocked
 * command, else null.
 */
function denyRule(cmds) {
  for (const c of cmds) {
    const denied = gitDenyRule(c.words);
    if (denied) return denied;
    const { short, long, operands } = optionsAndOperands(c.words);
    // rm with both -r and -f (-rf, -fr, -Rf, -r -f, --recursive --force) on /, ~ or $HOME
    // itself. A path below them (~/projects/x) is not matched.
    if (
      c.program === "rm" &&
      (short.has("r") || short.has("R") || long.has("--recursive")) &&
      (short.has("f") || long.has("--force")) &&
      operands.some((o) => ROOT_OPERAND.test(o))
    ) {
      return {
        what: "recursive delete of a filesystem root",
        fix: "NEVER run rm -rf against /, ~, or $HOME. Narrow the path to the target directory.",
      };
    }
    if (
      c.program === "chmod" &&
      (short.has("R") || long.has("--recursive")) &&
      worldWritable(operands[0] || "") &&
      operands.slice(1).some((o) => SYSTEM_ROOT.test(o))
    ) {
      return {
        what: "world-writable chmod -R on the filesystem root",
        fix: "NEVER make the filesystem root world-writable.",
      };
    }
  }
  return null;
}

// --- Shell tiers: identical in the Cursor, Codex and Google Antigravity guardrails hooks
// (bkit renders them from one source). Each host maps a tier to its own output shape and
// wording. Needs `shellCommands` and `usesFetch` from `guardrails-shell.js`, and
// `parseGit` and `denyRule` from `guardrails-deny.js`, above it.

/** A pathspec naming the whole tree (or more): `.`, `./`, `..`, `:/`. */
const WHOLE_TREE_PATH = /^(?:\.\.?\/?|:\/\.?)$/;

/** What makes a parsed git invocation ask-tier, else null. */
function gitAskRule(g) {
  if (g.long.has("--no-verify") || (g.sub === "commit" && g.short.has("n"))) {
    return "--no-verify (skips git hooks)";
  }
  switch (g.sub) {
    case "reset":
      return g.long.has("--hard") ? "git reset --hard" : null;
    case "clean":
      return g.short.has("n") || g.long.has("--dry-run") ? null : "git clean";
    case "checkout":
      return g.args.some((p) => WHOLE_TREE_PATH.test(p)) ? "git checkout of the whole tree" : null;
    case "restore": {
      const staged = g.long.has("--staged") || g.short.has("S");
      const worktree = g.long.has("--worktree") || g.short.has("W");
      return g.args.some((p) => WHOLE_TREE_PATH.test(p)) && (!staged || worktree)
        ? "git restore of the whole tree"
        : null;
    }
    case "stash":
      return g.args[0] === "drop" || g.args[0] === "clear" ? `git stash ${g.args[0]}` : null;
    case "rebase":
      return g.short.has("i") || g.long.has("--interactive") ? "git rebase -i" : null;
    case "filter-branch":
      return "git filter-branch";
    default:
      return null;
  }
}

/** The basename of a word that names a program (`/usr/bin/sudo` -> `sudo`). */
function programName(word) {
  return String(word || "").replace(/^.*\//, "");
}

/** The words after the program that are not options. */
function operandsOf(words) {
  return words.slice(1).filter((w) => !w.startsWith("-"));
}

/** Whether a parsed command runs `bkit tests jump` (also `pnpm bkit ...`, `node dist/cli.js ...`). */
function isTestsJump(words) {
  return words.some(
    (w, i) =>
      (programName(w) === "bkit" || /^cli\.[jt]s$/.test(programName(w))) &&
      words[i + 1] === "tests" &&
      words[i + 2] === "jump",
  );
}

/** Whether any parsed command runs `bkit tests jump`. */
function testsJump(cmds) {
  return cmds.some((c) => isTestsJump(c.words));
}

/** Ask tier, non-git: what makes one parsed command destructive or privileged, else null. */
function shellAskRule(c) {
  for (const priv of ["sudo", "doas"]) {
    if (c.program === priv || c.prefix.some((w) => programName(w) === priv)) return priv;
  }
  const ops = operandsOf(c.words);
  if (c.program === "brew" && ops[0] === "install") return "brew install";
  if (["pnpm", "npm", "bun"].includes(c.program) && ops[0] === "publish") return "package publish";
  if (c.program === "gh") {
    const sub = `${ops[0] || ""} ${ops[1] || ""}`;
    if (sub === "repo delete" || sub === "pr close" || sub === "release delete") return `gh ${sub}`;
  }
  return isTestsJump(c.words) ? "bkit tests jump" : null;
}

/** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
const HOOK_FILE = typeof __filename === "string" ? __filename : "";
// `__filename` is the real path; `process.argv[1]` is the path the hook was invoked by, which
// keeps a symlinked `.codex` folder visible.
const HOOK_INVOKED =
  typeof process !== "undefined" && process.argv && typeof process.argv[1] === "string"
    ? process.argv[1]
    : "";
const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE) || CODEX_HOOK_RE.test(HOOK_INVOKED);

/** What makes one of the parsed commands ask-tier, else null. */
function askRule(cmds) {
  for (const c of cmds) {
    const g = parseGit(c.words);
    const what = (g && gitAskRule(g)) || shellAskRule(c);
    if (what) return what;
  }
  return null;
}

/**
 * `"key"` for private-key material (`*.pem`, `*.p12`, `id_rsa`), `"env"` for an env /
 * secrets file (`.env`, `.env.*` except `.env.example`), else null. `/` or `\` separated.
 */
function secretFileKind(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  if (!p) return null;
  if (/\.pem$/i.test(p) || /\.p12$/i.test(p) || /(^|\/)id_rsa$/i.test(p)) return "key";
  const base = p.split("/").pop() || p;
  if (base === ".env" || (/^\.env[.*]/.test(base) && base !== ".env.example")) return "env";
  return null;
}

/** Programs that only stat, create or remove a file — naming a secret file reads nothing. */
const NON_READING_HEADS = new Set([
  "ls",
  "stat",
  "test",
  "[",
  "[[",
  "touch",
  "rm",
  "mv",
  "ln",
  "chmod",
  "chown",
  "mkdir",
  "echo",
  "printf",
  "realpath",
  "basename",
  "dirname",
]);

/** Programs whose last positional is the file they write (`cp .env.example .env`). */
const COPY_HEADS = new Set(["cp", "install", "rsync", "scp"]);
/** Programs whose first positional is a search pattern unless `-e` / `-f` supplies one. */
const PATTERN_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "ag"]);

/**
 * The first secret file the parsed commands read (`cat .bkit/.env`, `grep KEY .env.local`,
 * `source .env`, `curl -d @.env ...`, `wc -l < .env`), else null. Not reads: a redirect
 * target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`), and
 * anything `NON_READING_HEADS` runs.
 */
function shellSecretRead(cmds) {
  for (const c of cmds) {
    const words = c.words;
    const head = c.program;
    if (!head || NON_READING_HEADS.has(head)) continue;
    if (c.stdinFile && secretFileKind(c.stdinFile)) return c.stdinFile;
    const positionals = words.flatMap((w, i) => (i > 0 && !w.startsWith("-") ? [i] : []));
    const skip = new Set();
    if (COPY_HEADS.has(head) && positionals.length > 1) skip.add(positionals.at(-1));
    if (
      PATTERN_HEADS.has(head) &&
      !words.some((w) => /^-[a-zA-Z]*[ef]/.test(w) || /^--(?:regexp|file)\b/.test(w))
    ) {
      skip.add(positionals[0]);
    }
    for (let i = 1; i < words.length; i++) {
      if (skip.has(i)) continue;
      for (const part of words[i].split(/[=:@,]/)) {
        if (secretFileKind(part)) return part;
      }
    }
  }
  return null;
}

/**
 * The tier a trimmed command falls in, first match wins:
 *   `{ tier: "deny", what, fix }` — blocked on every host;
 *   `{ tier: "ask", what }`       — a destructive / privileged command;
 *   `{ tier: "secret", path }`    — a shell read of an env / secrets / private-key file;
 *   `{ tier: "fetch", edits? }`   — curl / wget to a host off the network allowlist, with the
 *                                   edit evidence of the same command when it has any;
 *   `{ tier: "edit", edits }`     — the shell used as an edit channel (advisory only);
 *   null                          — nothing to say.
 * An allowed fetch never hides an edit in the same command. `edits` is the evidence from
 * `shellEditTargets`. `dirs` locate the network allowlist (`hookDirs`); `ctx` is the call's
 * `{ cwd, root }` (`hookContext`) that edit targets resolve against.
 */
function classifyShell(c, dirs, ctx) {
  if (!c) return null;
  const cmds = shellCommands(c);
  const denied = denyRule(cmds);
  if (denied) return { tier: "deny", ...denied };
  if (IS_CODEX_HOOK && testsJump(cmds)) {
    return {
      tier: "deny",
      what: "bkit tests jump",
      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
    };
  }
  const what = askRule(cmds);
  if (what) return { tier: "ask", what };
  const secret = shellSecretRead(cmds);
  if (secret) return { tier: "secret", path: secret };
  const offList = usesFetch(cmds) && !curlWgetHostAllowed(c, dirs);
  const edits = shellEditTargets(c, ctx);
  const found = hasEditEvidence(edits);
  if (offList) return found ? { tier: "fetch", edits } : { tier: "fetch" };
  return found ? { tier: "edit", edits } : null;
}

// --- Secret-file read tier: identical in the Cursor and Google Antigravity guardrails hooks
// (bkit renders it from one source). Same policy as Claude's settings.json `Read(...)` deny /
// ask rows and opencode's `permission.read` map; each host maps a tier to its own output
// shape and wording. Needs `secretFileKind` from `guardrails-tiers.js` above it.

/**
 * The read tier for a file path (`/` or `\` separated), first match wins:
 *   `{ tier: "deny", path }` — private-key material: `*.pem`, `*.p12`, `id_rsa`;
 *   `{ tier: "ask", path }`  — an env / secrets file: `.env`, `.env.*` except `.env.example`;
 *   null                     — nothing to say.
 */
function classifyRead(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  const kind = secretFileKind(p);
  if (kind === "key") return { tier: "deny", path: p };
  if (kind === "env") return { tier: "ask", path: p };
  return null;
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
  return adviseOnceDelivery(hook, sessionId, signature, advisory).decision;
}

const AG_RETRY_SUFFIX =
  "\nThis call was held once so you see this advisory. Repeat the same call to proceed.";

/**
 * `adviseOnce` with its transport outcome: `{ decision, delivered }`. `delivered` is true
 * only when the call was denied with the advisory as the reason. An identical retry or an
 * unusable retry store returns the bare allow with `delivered` false, so the caller leaves
 * the advised targets unacknowledged.
 */
function adviseOnceDelivery(hook, sessionId, signature, advisory) {
  const file = agRetryFile(hook, sessionId);
  // One-way digest of the call signature: the retry store is world-readable and has no
  // TTL, so no tool argument (a shell command line with an inline secret, a file path)
  // may rest on disk in cleartext.
  const digest = crypto.createHash("sha256").update(signature).digest("hex");
  try {
    const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
    if (last === digest) {
      fs.rmSync(file, { force: true });
      return { decision: { decision: "allow" }, delivered: false };
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, digest, "utf-8");
  } catch {
    return { decision: { decision: "allow" }, delivered: false };
  }
  return {
    decision: {
      decision: "deny",
      reason: `${advisory}${AG_RETRY_SUFFIX}`,
    },
    delivered: true,
  };
}

/**
 * Antigravity reports shell execution as `run_command`; the aliases match a
 * consumer-registered matcher or an isolated `run_command` session.
 */
const SHELL_TOOL_NAMES = new Set(["run_command", "RunCommand", "Bash", "bash", "shell"]);

/**
 * Antigravity reads a file with `view_file` (path `AbsolutePath`); `Read` matches a
 * consumer-registered matcher.
 */
const READ_TOOL_NAMES = new Set(["view_file", "Read"]);

/** A read's decision: deny private-key material, ask on an env / secrets file, else null. */
function decideRead(filePath) {
  const v = classifyRead(filePath);
  if (!v) return null;
  if (v.tier === "deny") {
    return {
      decision: "deny",
      reason: `Blocked by bkit Antigravity guardrails: reading private-key material is denied.\nNEVER read ${v.path}.\nAsk the user to supply what you need without putting the key in this conversation.`,
    };
  }
  return {
    decision: "ask",
    reason: `bkit Antigravity guardrails: reading ${v.path} may expose secrets. Prefer direnv or documented non-secret examples.`,
  };
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns Antigravity's
 * `{ decision: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 */
function bkitGuardrails(payload) {
  const p = fromAntigravityPayload(payload);
  if (!p || typeof p !== "object") return null;
  const tool = p.tool_name;
  const input = p.tool_input || {};
  if (READ_TOOL_NAMES.has(tool)) return decideRead(input.AbsolutePath ?? input.file_path);
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const raw = shellCommandText(input.CommandLine ?? input.command);
  if (typeof raw !== "string") return null;

  const cmd = raw.trim();
  const ctx = hookContext(p);
  const tier = classifyShell(cmd, hookDirs(p), ctx);
  if (!tier) return null;
  const hold = tier.tier !== "deny" && tier.tier !== "ask" && tier.tier !== "secret";
  const advice = composeAdvice(tier, "antigravity", ADVICE_BUDGETS.antigravity, {
    command: cmd,
    ctx,
    session: p.session_id,
    agent: p.agent_id,
    // The retry text the hold-once delivery appends counts against the budget.
    reserve: hold ? adviceSize(AG_RETRY_SUFFIX, ADVICE_BUDGETS.antigravity.unit) : 0,
  });
  if (!hold) return { decision: tier.tier === "deny" ? "deny" : "ask", reason: advice.text };
  const sent = adviseOnceDelivery(
    "guardrails",
    p.session_id,
    agCallSignature(tool, input),
    advice.text,
  );
  if (sent.delivered) acknowledgeSelected(advice.selected);
  return sent.decision;
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// decision, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Antigravity ignores the whole thing.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  const result = raw.trim() ? bkitGuardrails(JSON.parse(raw)) : null;
  emit(result ?? { decision: "allow" });
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
