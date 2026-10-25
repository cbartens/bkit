#!/usr/bin/env node
// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
/**
 * bkit-harvest.mjs — the cross-repo harvest. One run, in order:
 *   1. ledgers (scripts/harvest/ledgers.ts): bkit's own `.bkit/` ledgers and those of every repo
 *      in `harvest/consumers.md` into `harvest/stats.jsonl` and `harvest/friction.jsonl`;
 *      friction rows and leftover `chat` / `run` rows are then pruned from the repos;
 *   2. scan: counts what every agent chat on this machine did, from the files each host keeps,
 *      and what every workflow run did, from its run log. Appends one `chat` row per chat and
 *      one `run` row per run to `harvest/stats.jsonl`, open ones included;
 *   3. run check: every settled run as an `outcome` row and as a `run` row (runCheck());
 *   4. `harvest/stats.md` from every row in `harvest/stats.jsonl`.
 * The scan never reads or writes a repo's `.bkit/` ledgers: each repo's own report is
 * `.bkit/stats.md`, written by `bkit stats` from the rows its workflow closes append.
 *
 * Hosts read (read-only; `session.platform` on the row):
 *   claude-code  ~/.claude/projects/<project>/<session>.jsonl + <session>/subagents/
 *   codex        $CODEX_HOME (~/.codex)/sessions/ and archived_sessions/ rollout-*.jsonl
 *   opencode     ~/.local/share/opencode/opencode.db (session_v2, session_message)
 *   cursor       ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb,
 *                ~/.cursor/chats/<hash>/<id>/store.db, ~/.cursor/projects/<project>/agent-transcripts/
 *   antigravity  ~/.gemini/antigravity{,-ide,-cli}/conversations/<id>.db
 * The SQLite hosts need Node 22.5+ (`node:sqlite`); on an older Node they are found empty.
 * Cursor records no token counts; Antigravity's older encrypted `.pb` chats are not read.
 * Claude Code deletes transcripts after `cleanupPeriodDays` (30 by default): run this more
 * often than that, or the chats it never saw are gone.
 *
 * Append-only. Every chat is written on every scan it changed in. `time.lastActivity` = the last
 * write to its files; `scan.settled` = unchanged for `--settle-hours` (a chat can still be
 * resumed later, so none is ever closed). A chat already in the ledger is read again only when
 * its size changed (a resumed or still-open chat), it has since settled, or its row has no
 * `usage.byRun`; it then gets a new row with the same `key`, and readers keep the last one. Rows are never edited or removed. The report
 * counts open rows in totals and lists, marked `open`, and leaves them out of medians.
 *
 * The script records numbers; it judges none against a limit. Limits change, so a reader
 * applies them: per-task test counts are stored per task, each agent's largest turn per agent.
 *
 * Row format (`schema: 3`). Every row starts with the same top section:
 *   schema, ts, kind, key, repo, bkit: {version, ...}, by: {workflow, step}
 * `by` = `chat-stats` / `scan` on a `chat` row, the run's workflow / `scan` on a `run` row.
 * Durations are minutes, named `totalMinutes` / `activeMinutes`; timestamps are unix ms. A field
 * that is absent does not apply; `null` = it applies but could not be measured. A total sits
 * beside its parts (`code` / `tests` / `docs`) or beside a `by<What>` map, and is computed from
 * them just before the write; validateTotals() checks every total, and a row that fails is not
 * written (`[bkit-telemetry] ... not written: <reason>` on stderr).
 *
 * `chat` row = one chat with its subagents folded in. key = `<platform>:<session id>`.
 *   bkit     version (null = none found), versionSource (`repo-history` | `prompt` | `none`),
 *            via (`command` / `subagent`; empty = no bkit), workflows (the `/bkit-*` workflows
 *            it ran), prompts (bkit prompt families its subagents came from), cli {total, byVerb}
 *   session  platform, id, hostVersion, entrypoint, prompts (messages the human typed)
 *   time     start, end, totalMinutes, activeMinutes, spans ([start, end] lists), lastActivity
 *   issue    id, all, mentioned, source (`command` | `summary` | `mention` | `none`)
 *   run      parentShas (printed by `bkit workflows close` in the chat)
 *   effort   turns per effort level
 *   usage    total {turns, tokens, context {start, peak}, compactions}, main {turns, tokens,
 *            context {peak}, compactions, mix}, byModel {<model>: {turns, tokens}}, byRun
 *            {<run key>: {main {turns, tokens}, agents {turns, tokens}}}. context = what one model
 *            call sent: input + cacheWrite + cacheRead. byRun = the chat's calls split by run, each
 *            call counted for the run whose window (its first to its last status row) holds the
 *            call's time, the later-started run when two do; the chat worked on a run its
 *            `session` rows name, or one of its repo and issue it overlaps. `{}` = no run; null =
 *            the host records no call times. tokens =
 *            {input (sent without the cache), cacheWrite (sent and stored in the cache),
 *            cacheRead (from the cache), output, outputEst (characters written / 4), read (all
 *            three sent types)}. mix = calls by what they did: read, edit, grep, shellRead,
 *            shellList, tests, serena.
 *   agents   total {n, errors}, byAgent {<agent type>: {n, errors, instances [{turns,
 *            contextPeak, contextAt10}], usage {turns, tokens, context {peak}, compactions}, mix,
 *            planReads {full, partial}}}. contextAt10 = the 10th call's context, null under 10
 *            calls. planReads = reads of `docs/plans/<YYYYMM>/<fid>-plan.md`: full = a read of the
 *            whole file or `cat`, partial = a read with a line range or `sed` / `head` / `tail`.
 *   tools    total {calls, errors}, byTool {<tool>: {calls, errors, byCategory?}}, filesRead.
 *            byCategory = the tool's shell commands by kind (git, grep / rg, test runner, ...).
 *   scan     files, bytes, settled, tokensRecorded (false: the host records no token counts)
 *
 * `run` row = one workflow run from `docs/plans/<YYYYMM>/logs/<FID>/status.jsonl`, in the main
 * checkout or a worktree of every repo a chat ran in (each feature's longest copy).
 * key = `<fid fp>:<workflow>:<start>`.
 *   run      fid, issue, n (this workflow's run number in the folder), parentSha (its last
 *            `workflow-done` row's, else its last close step's, else null), parentShas (every
 *            commit its status rows name)
 *   time     start, end, totalMinutes, activeMinutes, activeFrom {chats, bytes}, lastActivity
 *   ending   `done` | `close-failed` | `failed` | `decision-pause` | `stopped`
 *   ci       one entry per close step that dispatched CI: {status, reason?, attempts}
 *   steps    total {n, totalMinutes, activeMinutes}, byStep {<step>: {n, totalMinutes,
 *            activeMinutes}}; a step's minutes run from the row before it that is not a mark row
 *            (`session`, `owner-pause`, `owner-answer`); time before the first step is in
 *            time.totalMinutes only
 *   owner    waitBeforeMinutes (since the folder's previous run's last row; null for its first),
 *            total {stops, minutes}, stops [{minutes, open, reason}]: one stop per `owner-pause`
 *            up to the next `owner-answer`, a pause inside an open stop joining it; an open stop
 *            has null minutes
 *   usage    {total, main, agents}, each {turns, tokens}: the sum of the `usage.byRun` entries
 *            of the chats that worked on it; null when none did or one has no split
 *   lines    build and debug runs: total {added, deleted, changed, files}, code, tests, docs
 *            {added, deleted, files}, merges; null when git lacks the run's commits
 *   plan     a feature's last plan run: source `file`, total {tasks, kb}, groups [{tasks
 *            [{tests, testFiles}]}] (null tests: the task has no `TEST FIRST`). An old-format
 *            run: subPlans [{kb, tasks [{tests, testFiles}]}] (null tests: the plan predates
 *            `Test first`), complexity? {verdict, tasksChecked}; one started from a brief:
 *            {source: `brief`}.
 *   build    build runs: verify [{group, attempt, verdict, failures, testOrderGaps}],
 *            gapsRemediate [{group, attempt, verdict, strategy}] (an old run's rounds: `subPlan`
 *            in place of `group`, as its status rows carry it), holistic? {verdict,
 *            failures}, challenge? {verdict, findings {total, CRITICAL, HIGH, MEDIUM, LOW} | null},
 *            redTests
 *   scan     rows, afterEnd (status rows after the end row), settled
 *
 * Every reader here goes through normalize(), so the report also reads rows written without
 * `schema`, schema-2 chat rows (`ctx` / `ctxPeak` read as `context` / `contextPeak`) and the
 * workflow rows (`outcome`, `counter`, `compliance`) the engine writes.
 *
 * Repo slugs, FIDs and issue numbers are stored only as fingerprints (`fp:` + the first 12 hex
 * of sha256 of `owner/repo`, `owner/repo:<FID>` or `owner/repo#123`). `harvest/stats.md` turns
 * them back into names from the repos and run logs found on this machine; `harvest/` is
 * gitignored.
 * No paths, branch names, prompt text or agent descriptions are stored.
 *
 * Links. A row stores the keys; the report joins them, so a row links to rows written
 * after it:
 *   exact  `run.parentShas` = the `parentSha` printed by `bkit workflows close` in the chat ->
 *          that run's `outcome` / `counter` / `compliance` rows (`run.parentSha`); a `run` row's
 *          `run.parentSha` -> its `outcome` row, as the ledger step copied it from that repo.
 *          Outcome rows count once: the newest per (repo, `by.workflow`, `run.parentSha`).
 *   time   rows from the same repo whose `ts` falls inside the chat.
 *   issue  other chats whose `issue.all` / `issue.mentioned` share a fingerprint.
 * A chat whose repo had no `.bkit/version` takes its bkit version from the managed marker of
 * an expanded workflow command, else from those links.
 *
 * Usage:  pnpm harvest [scan|report] [--settle-hours=<n>] [--platforms=<p,...>] [--home=<dir>]
 *           [--dry-run]
 *         (`tsx scripts/harvest/bkit-harvest.mjs`: the ledger step is TypeScript.)
 *         scan (default) runs every step; report only writes `harvest/stats.md`.
 *         --home reads every host's files under <dir> instead of the home folder.
 *         --dry-run skips the ledger step, prints what scan would append and writes nothing.
 * Exit:   0 = done, 1 = a host, the store or the report could not be read or written (the
 *         other hosts' rows are still appended), 2 = bad arguments or not in bkit's checkout.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

export const DEFAULT_SETTLE_HOURS = 24;
/** Platform of rows written before rows carried one. */
const DEFAULT_PLATFORM = "claude-code";
/** Highest issue number the report tries when turning issue fingerprints back into names. */
const ISSUE_LOOKUP_MAX = 20000;
/** Non-bkit chats shorter than this stay out of the "other" medians. */
const OTHER_MIN_TURNS = 20;
/** Rows from the same repo up to this long after a chat ends still count as time-linked. */
const TIME_LINK_GRACE_MS = 15 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const WORKFLOW_CMD = /<command-name>\/bkit-([a-z-]+)<\/command-name>\s*<command-args>\s*#?(\d+)/g;
const SUMMARY_CMD = /\/bkit-([a-z-]+)\s+#?(\d+)\b/g;
const MENTION = /(?:#|issues\/)(\d{2,6})\b/g;
const BKIT_CLI = /(?:^|[\s;&|(])(?:[\w./-]*\/)?bkit\s+([a-z][a-z-]*)(?:\s+([a-z][a-z-]*))?/g;
/** bkit's top-level commands (`bkit --help`); any other word after `bkit` is prose, not a call. */
const BKIT_COMMANDS = new Set([
  "branches",
  "check",
  "ci",
  "comply",
  "context",
  "counters",
  "cursor",
  "disk",
  "doctor",
  "fids",
  "help",
  "install",
  "issues",
  "land",
  "launch",
  "ledgers",
  "locks",
  "opencode",
  "prs",
  "repo",
  "roadmap",
  "runs",
  "runtime",
  "setup",
  "skills",
  "stats",
  "status",
  "steps",
  "telemetry",
  "tests",
  "tips",
  "uninstall",
  "upgrade",
  "workflows",
  "workstreams",
  "worktrees",
]);
/** Commands that take no subcommand: the next word is an argument. */
const BKIT_LEAF_COMMANDS = new Set([
  "check",
  "doctor",
  "help",
  "install",
  "stats",
  "status",
  "tips",
  "uninstall",
  "upgrade",
]);
/** `B=…/bin/bkit` — workflows run bkit through a shell variable: `"$B" workflows close`. */
const BKIT_VAR = /\b([A-Za-z_]\w*)=["']?[^\s;"']*\/bkit["']?(?=[\s;]|$)/g;
/** The close step's own commands; their output carries the run's `parentSha`. */
const CLOSE_CMD = /\bworkflows\s+(?:close|promote)\b/;
/** `parentSha: <sha>` in text output, `"parentSha":"<sha>"` under `--json` (escaped inside a JSON string). */
const PARENT_SHA = /\bparentSha(?:\\?")?\s*:\s*(?:\\?")?([0-9a-f]{40})\b/g;
/** A prompt that starts with a workflow command: `/bkit-plan 650` (Cursor, opencode) or `$bkit-plan 650` (Codex). */
const PROMPT_CMD = /^\s*[/$]bkit-([a-z-]+)\s+#?(\d+)\b/g;
/** A workflow command a host pasted in expanded: bkit's opencode anchor + workflow heading, or Cursor's command block. */
const SESSION_PROMPT = /\*\*Session prompt:\*\*\s*([^\n]*)/;
const WORKFLOW_HEADING =
  /^# (?:(Design|Plan|Build|Debug|Ship) Feature \(Workflow \d\/\d\)|(Auto))\s*$/m;
const CURSOR_CMD = /--- Cursor Command: bkit-([a-z-]+) ---/;
const MANAGED_MARKER = /<!-- bkit:managed v(\d+\.\d+\.\d+[\w.-]*)/;
const WORKFLOWS = new Set(["design", "plan", "build", "debug", "ship", "auto"]);

const BASH_CLASSES = [
  [
    "test runner",
    /\b(vitest|jest|pytest|mocha|maestro|playwright)\b|\b(pnpm|npm|yarn|bun)\s+(run\s+)?test\b|\bgo test\b|\bcargo test\b|xcodebuild\s+test/,
  ],
  ["bkit cli", /(?:^|[\s;&|(])(?:[\w./-]*\/)?bkit\s+[a-z-]+/],
  ["git", /(?:^|[\s;&|(])git\s/],
  ["gh", /(?:^|[\s;&|(])gh\s/],
  ["grep / rg", /\b(grep|rg|ugrep)\b/],
  ["sed / cat / head / tail", /\b(sed|cat|head|tail|awk|wc|diff)\b/],
  ["find / ls", /\b(find|ls|tree|du|stat)\b/],
  ["tsc / lint / format", /\b(tsc|eslint|oxlint|prettier|biome|ruff|mypy)\b/],
  ["package manager", /\b(pnpm|npm|yarn|bun|npx|pip|uv|cargo|go)\s/],
  ["python / node script", /\b(python3?|node|deno)\b/],
];

// ---------------------------------------------------------------------------
// Fingerprints
// ---------------------------------------------------------------------------

export const fingerprint = (text) =>
  "fp:" + createHash("sha256").update(text).digest("hex").slice(0, 12);
export const repoFp = (slug) => fingerprint(slug);
export const issueFp = (slug, n) => fingerprint(`${slug}#${n}`);

/** `git@github.com:owner/repo.git` / `https://…/owner/repo` → `owner/repo`; "" if neither. */
export function slugFromRemote(url) {
  const m = url
    .trim()
    .replace(/\.git$/, "")
    .match(/[/:]([^/:]+\/[^/:]+)$/);
  return m?.[1] ?? "";
}

function git(cwd, args) {
  const r = spawnSync("git", ["-C", cwd, ...args], {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  return r.status === 0 ? r.stdout : null;
}

const repoCache = new Map();

/**
 * The repo a chat ran in: `{slug, root}`, root = the main checkout (worktrees resolve to it).
 * A deleted worktree resolves through its nearest folder that still exists. Not in git →
 * slug "none", root null.
 */
export function resolveRepo(cwd) {
  if (!cwd) return { slug: "none", root: null };
  if (repoCache.has(cwd)) return repoCache.get(cwd);
  let dir = cwd;
  while (dir !== path.dirname(dir) && !fs.existsSync(dir)) dir = path.dirname(dir);
  let out = { slug: "none", root: null };
  const common = git(dir, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (common) {
    const c = common.trim();
    const root = path.basename(c) === ".git" ? path.dirname(c) : c;
    const remote = git(root, ["config", "--get", "remote.origin.url"]);
    const slug = (remote && slugFromRemote(remote)) || `local/${path.basename(root)}`;
    out = { slug, root };
  }
  repoCache.set(cwd, out);
  return out;
}

// ---------------------------------------------------------------------------
// bkit version in force in a repo at a time
// ---------------------------------------------------------------------------

/** Version from `.bkit/version` text: JSON `pinnedVersion`, or a bare version line. */
export function parseVersionFile(text) {
  try {
    const j = JSON.parse(text);
    if (typeof j?.pinnedVersion === "string") return j.pinnedVersion;
  } catch {
    // not JSON: a bare version line
  }
  const m = text.match(/^\s*(\d+\.\d+\.\d+[\w.-]*)\s*$/m);
  return m ? m[1] : null;
}

const historyCache = new Map();

/** [[ms, version], …] ascending: each commit that changed the version, then the working tree. */
export function versionHistory(root) {
  if (!root) return [];
  if (historyCache.has(root)) return historyCache.get(root);
  const out = [];
  const log = git(root, [
    "log",
    "--reverse",
    "--format=%x01%ct",
    "-p",
    "--unified=0",
    "--no-color",
    "--no-ext-diff",
    "--",
    ".bkit/version",
  ]);
  for (const chunk of (log ?? "").split("\x01").slice(1)) {
    const ct = Number(chunk.slice(0, chunk.indexOf("\n")));
    const m =
      chunk.match(/^\+(?!\+\+).*?"pinnedVersion"\s*:\s*"([^"]+)"/m) ??
      chunk.match(/^\+\s*(\d+\.\d+\.\d+[\w.-]*)\s*$/m);
    if (m && m[1] !== out.at(-1)?.[1]) out.push([ct * 1000, m[1]]);
  }
  const file = path.join(root, ".bkit", "version");
  if (fs.existsSync(file)) {
    const v = parseVersionFile(fs.readFileSync(file, "utf8"));
    if (v && v !== out.at(-1)?.[1]) out.push([fs.statSync(file).mtimeMs, v]);
  }
  historyCache.set(root, out);
  return out;
}

export function versionAt(history, ms) {
  let v = null;
  for (const [t, ver] of history) {
    if (t <= ms) v = ver;
    else break;
  }
  return v;
}

// ---------------------------------------------------------------------------
// One transcript → counts
// ---------------------------------------------------------------------------

/** `[noun, verb]` of every bkit call in a Bash command, direct or through a `B=…/bkit` variable. */
export function bkitCalls(cmd) {
  const calls = [...cmd.matchAll(BKIT_CLI)].map(([, noun, verb]) => [noun, verb]);
  for (const [, name] of cmd.matchAll(BKIT_VAR)) {
    const use = new RegExp(`"?\\$\\{?${name}\\}?"?\\s+([a-z][a-z-]*)(?:\\s+([a-z][a-z-]*))?`, "g");
    for (const [, noun, verb] of cmd.matchAll(use)) calls.push([noun, verb]);
  }
  return calls
    .filter(([noun]) => BKIT_COMMANDS.has(noun))
    .map(([noun, verb]) => [noun, BKIT_LEAF_COMMANDS.has(noun) ? undefined : verb]);
}

export function bashClass(cmd) {
  const body = cmd.trim().replace(/^\s*cd\s+("[^"]*"|\S+)\s*&&\s*/, "");
  for (const [name, re] of BASH_CLASSES) {
    if (re.test(body) || (name === "bkit cli" && bkitCalls(body).length)) return name;
  }
  return "other";
}

/** A plan file: `docs/plans/<YYYYMM>/<fid>-plan.md` or an old split plan's `-plan-<n>.md`; never a run log. */
export const PLAN_FILE = /(?:^|\/)docs\/plans\/\d{6}\/[^/\s"']+-plan(?:-\d+)?\.md$/;
const PLAN_IN_SHELL = /(?:^|[\s"'=/])docs\/plans\/\d{6}\/[^/\s"']+-plan(?:-\d+)?\.md(?=$|[\s"';|&)])/;

/**
 * Plan-file reads in one shell command, one entry per command part that reads a plan: `full`
 * for `cat`, `partial` for `sed` / `head` / `tail`. Other commands on a plan (grep, wc) read none.
 */
export function shellPlanReads(cmd) {
  const out = [];
  for (const part of cmd.split(/&&|\|\||[;|\n]/)) {
    if (!PLAN_IN_SHELL.test(part)) continue;
    const word = part.trim().split(/\s+/)[0];
    if (word === "cat") out.push("full");
    else if (["sed", "head", "tail"].includes(word)) out.push("partial");
  }
  return out;
}

/** `mcp__server__tool` → `mcp__server`; other tools keep their name. */
const toolKey = (name) =>
  name.startsWith("mcp__") ? name.split("__").slice(0, 2).join("__") : name;

function textOf(content) {
  if (typeof content === "string") return content;
  return (content ?? [])
    .filter((b) => b && typeof b === "object" && b.type === "text")
    .map((b) => b.text ?? "")
    .join(" ");
}

/** Add one model's counts into `{model: {turns, read, input, cacheWrite, cacheRead, output, outputEst}}`. */
export function addModel(models, model, c) {
  const m = (models[model] ??= {
    turns: 0,
    read: 0,
    input: 0,
    cacheWrite: 0,
    cacheRead: 0,
    output: 0,
    outputEst: 0,
  });
  for (const k of Object.keys(m)) m[k] += c[k] ?? 0;
}

const resultText = (c) => (typeof c === "string" ? c : JSON.stringify(c ?? ""));
const bump = (obj, k, n = 1) => (obj[k] = (obj[k] ?? 0) + n);

/**
 * `{text: "/bkit-<workflow> <n>", version}` for a prompt that is an expanded workflow command,
 * else null. `version` is the bkit version stamped in the command's managed marker.
 */
export function expandedCommand(s) {
  let wf = s.match(CURSOR_CMD)?.[1] ?? null;
  let args = s.match(/<user_query>\s*([\s\S]*?)<\/user_query>/)?.[1] ?? "";
  if (!wf) {
    const h = s.match(WORKFLOW_HEADING);
    const sp = s.match(SESSION_PROMPT);
    if (!h || !sp) return null;
    wf = (h[1] ?? h[2]).toLowerCase();
    args = sp[1];
  }
  const n = args.match(/#?(\d+)/)?.[1];
  return {
    text: n ? `/bkit-${wf} ${n}` : `/bkit-${wf}`,
    version: s.match(MANAGED_MARKER)?.[1] ?? null,
  };
}

/**
 * Counts for one transcript, fed event by event by a host reader. Every host's reader turns its
 * own format into these calls, so every row has the same shape whatever host wrote it.
 */
export class Tally {
  constructor() {
    this.usageById = new Map();
    /** message id → {model, chars}: per-model totals are summed in done(). */
    this.msgs = new Map();
    this.pendingChars = new Map();
    this.anonUses = 0;
    this.effort = {};
    this.tools = {};
    this.bash = {};
    /** tool → {shell command kind: calls}: which tool ran which shell commands. */
    this.bashByTool = {};
    this.bkitCli = {};
    this.useById = new Map();
    this.closeIds = new Set();
    this.filesRead = new Set();
    /** Reads of a plan file: the whole file, or a line range of it. */
    this.planReads = { full: 0, partial: 0 };
    this.workflows = [];
    this.summaryCmds = [];
    this.mentions = [];
    this.parentShas = new Set();
    this.userPrompts = 0;
    this.compactions = 0;
    this.chars = 0;
    this.start = null;
    this.end = null;
    /** Every event time, for the chat's active spans. */
    this.stamps = [];
    this.cwd = null;
    this.hostVersion = null;
    this.entrypoint = null;
    /** bkit version stamped in an expanded workflow command. */
    this.bkitVersionSeen = null;
    /** `owner/repo` the host recorded, for a chat whose folder is gone. */
    this.slugHint = null;
  }

  at(ms) {
    if (!Number.isFinite(ms)) return;
    this.stamps.push(ms);
    if (this.start === null || ms < this.start) this.start = ms;
    if (this.end === null || ms > this.end) this.end = ms;
  }

  meta({ cwd, hostVersion, entrypoint } = {}) {
    this.cwd ??= cwd ?? null;
    this.hostVersion ??= hostVersion ?? null;
    this.entrypoint ??= entrypoint ?? null;
  }

  /**
   * One assistant message. Repeat calls with the same id (a streamed message) count once;
   * the last `usage` given wins. usage = {input, cacheWrite, cacheRead, output}. `at` = when the
   * model was called (unix ms; absent when the host does not record it).
   */
  turn(id, { model, effort, usage, at } = {}) {
    if (usage) this.usageById.set(id, usage);
    if (this.msgs.has(id)) return;
    this.msgs.set(id, {
      model: model || "?",
      chars: this.pendingChars.get(id) ?? 0,
      at: Number.isFinite(at) ? at : null,
    });
    bump(this.effort, effort ?? "?");
  }

  /** Characters the model wrote in message `id` (null when the host does not say which): text, thinking, tool input. */
  text(id, chars) {
    this.chars += chars;
    const m = this.msgs.get(id);
    if (m) m.chars += chars;
    // Codex writes a response's items before the event that opens its turn.
    else if (id !== null) this.pendingChars.set(id, (this.pendingChars.get(id) ?? 0) + chars);
  }

  /**
   * One tool call. `shell` = the command when the tool runs a shell command; `readPath` = the
   * file when the tool reads one, `partial` = it read only a line range. A repeated `useId`
   * counts once.
   */
  toolUse(useId, name, { shell, readPath, partial = false } = {}) {
    useId ??= `anon:${this.anonUses++}`;
    if (this.useById.has(useId)) return;
    this.useById.set(useId, name);
    const k = toolKey(name);
    this.tools[k] ??= { calls: 0, errors: 0 };
    this.tools[k].calls++;
    if (typeof shell === "string") {
      const cls = bashClass(shell);
      bump(this.bash, cls);
      bump((this.bashByTool[k] ??= {}), cls);
      for (const [noun, verb] of bkitCalls(shell))
        bump(this.bkitCli, `${noun} ${verb ?? ""}`.trim());
      if (CLOSE_CMD.test(shell)) this.closeIds.add(useId);
      for (const kind of shellPlanReads(shell)) this.planReads[kind]++;
    }
    if (typeof readPath === "string") {
      this.filesRead.add(readPath);
      if (PLAN_FILE.test(readPath)) this.planReads[partial ? "partial" : "full"]++;
    }
  }

  /** The result of tool call `useId`. `output` is only searched for a close step's `parentSha`. */
  toolResult(useId, { isError = false, output } = {}) {
    const name = this.useById.get(useId);
    if (!name) return;
    if (isError) this.tools[toolKey(name)].errors++;
    if (this.closeIds.has(useId)) {
      for (const [, sha] of resultText(output).matchAll(PARENT_SHA)) this.parentShas.add(sha);
    }
  }

  /** Output of a background command: searched for a close step's `parentSha` once the chat ran one. */
  closeOutput(text) {
    if (!this.closeIds.size) return;
    for (const [, sha] of text.matchAll(PARENT_SHA)) this.parentShas.add(sha);
  }

  /** A message the human typed (or a slash command the host expanded). */
  userText(s, ms) {
    const ex = expandedCommand(s);
    if (ex) {
      s = ex.text;
      this.bkitVersionSeen ??= ex.version;
    }
    for (const re of [WORKFLOW_CMD, PROMPT_CMD]) {
      for (const [, wf, n] of s.matchAll(re)) {
        this.workflows.push({
          workflow: wf,
          issue: Number(n),
          at: Number.isFinite(ms) ? ms : null,
        });
      }
    }
    if (s.trim() && !s.startsWith("<command-") && !s.startsWith("<task-notification")) {
      this.userPrompts++;
      for (const [, n] of s.matchAll(MENTION)) this.mentions.push(Number(n));
    }
  }

  /** The host's summary of the chat so far, written when it compacted. */
  summaryText(s) {
    for (const [, wf, n] of s.matchAll(SUMMARY_CMD)) this.summaryCmds.push([wf, Number(n)]);
  }

  compaction() {
    this.compactions++;
  }

  /**
   * The counts, or null when the transcript has no assistant message. `calls` = one entry per
   * model call in call order, `{at, tokens}`: kept in memory to split the chat across runs, never
   * written.
   */
  done() {
    if (this.msgs.size === 0) return null;
    const us = [...this.usageById.values()];
    const contextOf = (u) => (u.input ?? 0) + (u.cacheWrite ?? 0) + (u.cacheRead ?? 0);
    const context = us.map(contextOf);
    const sum = (k) => us.reduce((a, u) => a + (u[k] ?? 0), 0);
    const models = {};
    const calls = [];
    for (const [id, { model, chars: c, at }] of this.msgs) {
      const u = this.usageById.get(id) ?? {};
      const tokens = {
        read: contextOf(u),
        input: u.input ?? 0,
        cacheWrite: u.cacheWrite ?? 0,
        cacheRead: u.cacheRead ?? 0,
        output: u.output ?? 0,
        outputEst: Math.floor(c / 4),
      };
      addModel(models, model, { turns: 1, ...tokens });
      calls.push({ at, tokens, recorded: this.usageById.has(id) });
    }
    const tenthCall = calls[9];
    return {
      cwd: this.cwd,
      start: this.start,
      end: this.end,
      stamps: this.stamps,
      hostVersion: this.hostVersion,
      entrypoint: this.entrypoint,
      models,
      effort: this.effort,
      workflows: this.workflows,
      summaryCmds: this.summaryCmds,
      mentions: this.mentions,
      parentShas: [...this.parentShas],
      turns: this.msgs.size,
      userPrompts: this.userPrompts,
      compactions: this.compactions,
      tokens: {
        input: sum("input"),
        cacheWrite: sum("cacheWrite"),
        cacheRead: sum("cacheRead"),
        output: sum("output"),
        outputEst: Math.floor(this.chars / 4),
        read: context.reduce((a, b) => a + b, 0),
        contextStart: context[0] ?? 0,
        contextPeak: context.length ? Math.max(...context) : 0,
        contextAt10: tenthCall?.recorded ? tenthCall.tokens.read : null,
      },
      calls,
      tools: this.tools,
      bash: this.bash,
      bashByTool: this.bashByTool,
      bkitCli: this.bkitCli,
      filesRead: this.filesRead.size,
      planReads: { ...this.planReads },
      bkitVersionSeen: this.bkitVersionSeen,
      slugHint: this.slugHint,
    };
  }
}

/** Every line of a JSONL file that parses to an object. */
async function* jsonLines(file) {
  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity });
  for await (const line of rl) {
    try {
      const d = JSON.parse(line);
      if (d && typeof d === "object") yield d;
    } catch {
      // skip a malformed or half-written line
    }
  }
}

// ---------------------------------------------------------------------------
// Claude Code: ~/.claude/projects/<project>/<session>.jsonl + <session>/subagents/*.jsonl
// ---------------------------------------------------------------------------

/** One Claude Code transcript → counts, or null when it has no assistant message. */
export async function scanTranscript(file) {
  const t = new Tally();
  for await (const d of jsonLines(file)) {
    const ts = d.timestamp ? Date.parse(d.timestamp) : NaN;
    t.at(ts);
    t.meta({ cwd: d.cwd, hostVersion: d.version, entrypoint: d.entrypoint });
    if (d.type === "system" && d.subtype === "compact_boundary") {
      t.compaction();
      continue;
    }
    const m = d.message;
    if (!m || typeof m !== "object") continue;
    const content = Array.isArray(m.content) ? m.content : [];

    if (d.type === "assistant") {
      const id = m.id;
      // `<synthetic>`: a message Claude Code wrote itself (an API error notice), not a model call.
      if (!id || m.model === "<synthetic>") continue;
      const u = m.usage;
      t.turn(id, {
        model: m.model ?? d.requestedModel,
        effort: d.effort,
        at: ts,
        usage: u && {
          input: u.input_tokens ?? 0,
          cacheWrite: u.cache_creation_input_tokens ?? 0,
          cacheRead: u.cache_read_input_tokens ?? 0,
          output: u.output_tokens ?? 0,
        },
      });
      for (const b of content) {
        if (!b || typeof b !== "object") continue;
        if (b.type === "text") t.text(id, (b.text ?? "").length);
        else if (b.type === "thinking") t.text(id, (b.thinking ?? "").length);
        else if (b.type === "tool_use") {
          const input = b.input ?? {};
          t.text(id, JSON.stringify(input).length);
          t.toolUse(b.id, b.name ?? "?", {
            shell: b.name === "Bash" ? (input.command ?? "") : undefined,
            readPath: b.name === "Read" ? (input.file_path ?? "") : undefined,
            partial: input.offset !== undefined || input.limit !== undefined,
          });
        }
      }
    } else if (d.type === "user") {
      if (d.isCompactSummary) {
        t.summaryText(textOf(m.content));
        continue;
      }
      let hadResult = false;
      for (const b of content) {
        if (!b || typeof b !== "object" || b.type !== "tool_result") continue;
        hadResult = true;
        t.toolResult(b.tool_use_id, { isError: Boolean(b.is_error), output: b.content });
      }
      if (hadResult || d.isMeta) continue;
      t.userText(textOf(m.content), ts);
    }
  }
  return t.done();
}

// ---------------------------------------------------------------------------
// One chat (session + subagents) → one `chat` row
// ---------------------------------------------------------------------------

const errorsOf = (c) => Object.values(c.tools).reduce((a, t) => a + t.errors, 0);
const uniq = (xs) => [...new Set(xs)];
const sumOf = (xs) => xs.reduce((a, b) => a + (b ?? 0), 0);
/** Row format this script writes; rows without `schema` are read through normalize(). */
export const SCHEMA = 3;
const TOKEN_KEYS = ["input", "cacheWrite", "cacheRead", "output", "outputEst", "read"];
const blankTokens = () => Object.fromEntries(TOKEN_KEYS.map((k) => [k, 0]));
/** Add `from`'s token counts into `into` (both `{input, cacheWrite, cacheRead, output, outputEst, read}`). */
function addTokens(into, from) {
  for (const k of TOKEN_KEYS) into[k] += from?.[k] ?? 0;
  return into;
}
/** Milliseconds covered by `[start, end]` spans. */
const spansMs = (spans) => spans.reduce((a, [s, e]) => a + e - s, 0);

/** Context sizes the report's agent table counts largest turns against. Presentation only: rows store the peaks. */
export const REPORT_CONTEXT_COLUMNS = [120000, 200000];

const TOOL_MIX = {
  read: /^(read|read_file|view)$/,
  edit: /^(edit|write|multiedit|apply_patch|str_replace|create_file|search_replace)$/,
  grep: /^(grep|codebase_search|grep_search)$/,
  shellList: /^(glob|list|ls|list_dir|file_search)$/,
  serena: /serena/,
};

/**
 * Calls of one transcript by what they did, across hosts' tool names and shell commands:
 * `{read, edit, grep, shellRead, shellList, tests, serena}`. shellRead = sed / cat / head /
 * tail and the like; shellList = Glob-type tools plus find / ls and the like.
 */
export function toolMix(c) {
  const out = { read: 0, edit: 0, grep: 0, shellRead: 0, shellList: 0, tests: 0, serena: 0 };
  for (const [name, t] of Object.entries(c.tools)) {
    const n = name.toLowerCase();
    for (const [k, re] of Object.entries(TOOL_MIX)) if (re.test(n)) out[k] += t.calls;
  }
  out.grep += c.bash["grep / rg"] ?? 0;
  out.shellRead += c.bash["sed / cat / head / tail"] ?? 0;
  out.shellList += c.bash["find / ls"] ?? 0;
  out.tests += c.bash["test runner"] ?? 0;
  return out;
}

/**
 * The runs a chat worked on: one whose `session` rows name the chat, or one of the chat's repo
 * whose issue the chat ran (`issue.all`) and whose window overlaps the chat.
 * @param {{key: string, repo: string, issues: string[], start: number, end: number}} chat
 * @param {object[]} runs  runWindows()
 */
export function chatRuns(chat, runs) {
  const fp = fingerprint(chat.key);
  return runs.filter(
    (r) =>
      r.sessions.includes(fp) ||
      (r.issue !== null &&
        r.repo === chat.repo &&
        chat.issues.includes(r.issue) &&
        chat.start <= r.end &&
        chat.end >= r.start),
  );
}

/**
 * A chat's model calls split by run: `{<run key>: {main: {turns, tokens}, agents: {turns,
 * tokens}}}`. Each call counts for the run whose window holds its time; when two windows do,
 * for the run that started later. `{}` when the chat worked on no run; null when it did but a
 * call has no time (the host does not record one).
 */
export function usageByRun(main, subs, runs) {
  if (!runs.length) return {};
  const parts = [["main", main], ...subs.map((s) => ["agents", s.counts])];
  if (parts.some(([, c]) => (c.calls ?? []).some((k) => k.at === null))) return null;
  const latestFirst = [...runs].sort((a, b) => b.start - a.start);
  const out = {};
  for (const [part, c] of parts) {
    for (const call of c.calls ?? []) {
      const r = latestFirst.find((w) => call.at >= w.start && call.at <= w.end);
      if (!r) continue;
      const e = (out[r.key] ??= {
        main: { turns: 0, tokens: blankTokens() },
        agents: { turns: 0, tokens: blankTokens() },
      });
      e[part].turns++;
      addTokens(e[part].tokens, call.tokens);
    }
  }
  return out;
}

/**
 * @param {string} platform  key of HOSTS
 * @param {string} sessionId
 * @param {object} main  Tally counts of the main session
 * @param {{agentType: string|null, counts: object}[]} subs
 * @param {{slug: string, root: string|null}} repo
 * @param {[number, string][]} history  versionHistory() of that repo
 * @param {{files: number, bytes: number}} source
 * @param {object[]} [runs]  runWindows() of the repos found; `usage.byRun` splits the chat across them
 */
export function chatRow(platform, sessionId, main, subs, repo, history, source, runs = []) {
  const all = [main, ...subs.map((s) => s.counts)];
  const start = Math.min(...all.map((c) => c.start ?? Infinity));
  const end = Math.max(...all.map((c) => c.end ?? 0));
  // Subagent events fill the main chat's wait on them.
  const active = activeSpans(all.flatMap((c) => c.stamps ?? []));

  let issueNums = uniq(main.workflows.map((w) => w.issue));
  let wfNames = uniq(main.workflows.map((w) => w.workflow));
  let issueSource = "none";
  if (issueNums.length) issueSource = "command";
  else if (main.summaryCmds.length) {
    issueSource = "summary";
    issueNums = uniq(main.summaryCmds.map(([, n]) => n));
    wfNames = uniq(main.summaryCmds.map(([wf]) => wf));
  }
  wfNames = wfNames.filter((w) => WORKFLOWS.has(w));
  const mentioned = uniq(main.mentions).slice(0, 20);
  let issue = issueNums[0] ?? null;
  if (issue === null && mentioned.length) {
    issue = mentioned[0];
    issueSource = "mention";
  }

  const byAgent = {};
  const bkitKinds = [];
  let bkitSubagents = 0;
  for (const { agentType, counts: c } of subs) {
    const type = agentType ?? "?";
    if (type.startsWith("bkit-")) {
      bkitSubagents++;
      const kind = type.split("-")[1];
      if (kind && !bkitKinds.includes(kind)) bkitKinds.push(kind);
    }
    const a = (byAgent[type] ??= {
      n: 0,
      errors: 0,
      instances: [],
      usage: { turns: 0, tokens: blankTokens(), context: { peak: 0 }, compactions: 0 },
      mix: {},
      planReads: { full: 0, partial: 0 },
    });
    a.instances.push({
      turns: c.turns,
      contextPeak: c.tokens.contextPeak,
      contextAt10: c.tokens.contextAt10 ?? null,
    });
    a.planReads.full += c.planReads?.full ?? 0;
    a.planReads.partial += c.planReads?.partial ?? 0;
    a.errors += errorsOf(c);
    a.usage.turns += c.turns;
    addTokens(a.usage.tokens, c.tokens);
    a.usage.compactions += c.compactions;
    for (const [k, v] of Object.entries(toolMix(c))) bump(a.mix, k, v);
  }
  for (const a of Object.values(byAgent)) {
    a.n = a.instances.length;
    a.usage.context.peak = Math.max(0, ...a.instances.map((i) => i.contextPeak));
  }
  // A workflow named only in the host's summary of the chat was run before this chat began:
  // the chat keeps its issue, but is not counted as running it.
  const bkitVia = [];
  if (issueSource === "command") bkitVia.push("command");
  if (bkitSubagents) bkitVia.push("subagent");

  const merge = (pick) => {
    const out = {};
    for (const c of all) for (const [k, v] of Object.entries(pick(c))) bump(out, k, v);
    return out;
  };
  const byTool = {};
  for (const c of all) {
    for (const [k, t] of Object.entries(c.tools)) {
      byTool[k] ??= { calls: 0, errors: 0 };
      byTool[k].calls += t.calls;
      byTool[k].errors += t.errors;
    }
    for (const [k, cats] of Object.entries(c.bashByTool ?? {})) {
      if (!byTool[k]) continue;
      byTool[k].byCategory ??= {};
      for (const [cat, n] of Object.entries(cats)) bump(byTool[k].byCategory, cat, n);
    }
  }
  const byModel = {};
  for (const c of all) {
    for (const [k, m] of Object.entries(c.models)) {
      const g = (byModel[k] ??= { turns: 0, tokens: blankTokens() });
      g.turns += m.turns;
      addTokens(g.tokens, m);
    }
  }
  const fromHistory = versionAt(history, start);
  const fromPrompt = all.map((c) => c.bkitVersionSeen).find(Boolean) ?? null;
  const version = fromHistory ?? fromPrompt;
  const byVerb = merge((c) => c.bkitCli);
  const main_ = {
    turns: main.turns,
    tokens: addTokens(blankTokens(), main.tokens),
    context: { peak: main.tokens.contextPeak },
    compactions: main.compactions,
    mix: toolMix(main),
  };
  const timed = Number.isFinite(start) && Number.isFinite(end) && end >= start;
  const agentList = Object.values(byAgent);
  const key = `${platform}:${sessionId}`;
  const issueAll = issueNums.map((n) => issueFp(repo.slug, n));
  const worked = chatRuns({ key, repo: repoFp(repo.slug), issues: issueAll, start, end }, runs);

  return {
    schema: SCHEMA,
    ts: end,
    kind: "chat",
    key,
    repo: repoFp(repo.slug),
    bkit: {
      version: version ?? null,
      versionSource: fromHistory ? "repo-history" : fromPrompt ? "prompt" : "none",
      via: bkitVia,
      workflows: wfNames,
      prompts: bkitKinds,
      cli: { total: sumOf(Object.values(byVerb)), byVerb },
    },
    by: { workflow: "chat-stats", step: "scan" },
    session: {
      platform,
      id: sessionId,
      hostVersion: main.hostVersion,
      entrypoint: main.entrypoint,
      prompts: main.userPrompts,
    },
    time: {
      start: timed ? start : null,
      end: timed ? end : null,
      totalMinutes: timed ? tenth(end - start) : null,
      activeMinutes: tenth(spansMs(active)),
      spans: active,
    },
    issue: {
      id: issue === null ? null : issueFp(repo.slug, issue),
      all: issueAll,
      mentioned: mentioned.map((n) => issueFp(repo.slug, n)),
      source: issueSource,
    },
    run: { parentShas: uniq(all.flatMap((c) => c.parentShas)) },
    effort: merge((c) => c.effort),
    usage: {
      total: {
        turns: sumOf(Object.values(byModel).map((m) => m.turns)),
        tokens: Object.values(byModel).reduce((t, m) => addTokens(t, m.tokens), blankTokens()),
        context: {
          start: main.tokens.contextStart,
          peak: Math.max(
            main_.context.peak,
            ...agentList.flatMap((a) => a.instances.map((i) => i.contextPeak)),
          ),
        },
        compactions: main_.compactions + sumOf(agentList.map((a) => a.usage.compactions)),
      },
      main: main_,
      byModel,
      byRun: usageByRun(main, subs, worked),
    },
    agents: {
      total: { n: sumOf(agentList.map((a) => a.n)), errors: sumOf(agentList.map((a) => a.errors)) },
      byAgent,
    },
    tools: {
      total: {
        calls: sumOf(Object.values(byTool).map((t) => t.calls)),
        errors: sumOf(Object.values(byTool).map((t) => t.errors)),
      },
      byTool,
      filesRead: all.reduce((a, c) => a + c.filesRead, 0),
    },
    scan: {
      files: source.files,
      bytes: source.bytes,
      tokensRecorded: all.some((c) => c.tokens.read > 0),
    },
  };
}

// ---------------------------------------------------------------------------
// Active time: spans of a chat with no gap over IDLE_GAP_MS between its events
// ---------------------------------------------------------------------------

/** A gap between two events of a chat longer than this is idle: a human wait, or the session left open. */
export const IDLE_GAP_MS = 5 * 60_000;
/** Fewest code + test lines for "M per 100 lines": a tiny diff makes the ratio explode. */
export const LINES_FLOOR = 100;

/** Event times → `[start, end]` spans, unix ms; a gap over IDLE_GAP_MS ends a span. */
export function activeSpans(times) {
  const spans = [];
  for (const t of [...times].sort((a, b) => a - b)) {
    const last = spans.at(-1);
    if (last && t - last[1] <= IDLE_GAP_MS) last[1] = t;
    else spans.push([t, t]);
  }
  return spans.filter(([a, b]) => b > a);
}

/** Spans of several chats → one sorted list with overlaps merged. */
export function mergeSpans(spans) {
  const out = [];
  for (const [a, b] of [...spans].sort((x, y) => x[0] - y[0])) {
    const last = out.at(-1);
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
}

/** Milliseconds of `spans` inside `[from, to]`. */
export const overlapMs = (spans, from, to) =>
  spans.reduce((t, [a, b]) => t + Math.max(0, Math.min(b, to) - Math.max(a, from)), 0);

// ---------------------------------------------------------------------------
// One workflow run (from its run log) → one `run` row
// ---------------------------------------------------------------------------

const TEST_ORDER_GAP =
  /—\s*(no-red|late-red|red-mismatch|red-evidence-missing|test-changed)\s*—\s*not fixable/g;
/** A gap list item of reports written before that format: `- G1 (Task 11, not fixable): … \`no-red\` x20`. */
const OLD_TEST_ORDER_GAP =
  /^- G\d+ \([^)]*\):.*?`(no-red|late-red|red-mismatch|red-evidence-missing|test-changed)`(?: x(\d+))?/gm;

/** Test-order gaps a verify report lists for its own round, in either format. */
export function testOrderGaps(text) {
  const now = [...text.matchAll(TEST_ORDER_GAP)].length;
  if (now) return now;
  return [...text.matchAll(OLD_TEST_ORDER_GAP)].reduce((a, m) => a + Number(m[2] ?? 1), 0);
}

/** Left out of a run's line counts: plans and run logs, and the ledgers. */
const LINES_EXCLUDE = [
  ":(exclude)docs/plans/**",
  ":(exclude,glob)docs/*.jsonl",
  ":(exclude,glob).bkit/*.jsonl",
];
const TEST_PATH =
  /(^|\/)(__tests__|tests?|spec|e2e)\/|[._-](test|spec)\.[^/]+$|_test\.[^/]+$|(^|\/)test_[^/]+\.py$/i;
const DOCS_PATH = /\.mdx?$|(^|\/)docs\//i;
/** `code`, `tests` or `docs`, from a changed file's path. */
export const lineClass = (file) =>
  TEST_PATH.test(file) ? "tests" : DOCS_PATH.test(file) ? "docs" : "code";

/**
 * Lines the run's own commits changed, from git: its first to its last `parentShas`, cut at
 * each merge on the way (a dev sync) so merged-in work is not counted, each stretch diffed on
 * its own. The row's `lines` block; null when git lacks either commit or the first is not an
 * ancestor of the last.
 */
export function runLines(root, shas) {
  if (!root || shas.length < 2) return null;
  const first = shas[0];
  const last = shas.at(-1);
  if (git(root, ["merge-base", "--is-ancestor", first, last]) === null) return null;
  const chain = git(root, [
    "rev-list",
    "--first-parent",
    "--reverse",
    "--parents",
    `${first}..${last}`,
  ]);
  if (chain === null) return null;
  const stretches = [];
  let from = first;
  for (const line of chain.split("\n").filter(Boolean)) {
    const [sha, parent, ...merged] = line.split(" ");
    if (merged.length === 0) continue;
    stretches.push([from, parent]);
    from = sha;
  }
  stretches.push([from, last]);
  const blank = () => ({ added: 0, deleted: 0, files: 0 });
  const out = { code: blank(), tests: blank(), docs: blank(), merges: stretches.length - 1 };
  for (const [a, b] of stretches) {
    if (a === b) continue;
    const stat = git(root, ["diff", "--numstat", a, b, "--", ".", ...LINES_EXCLUDE]);
    if (stat === null) return null;
    for (const line of stat.split("\n").filter(Boolean)) {
      const [added, deleted, file] = line.split("\t");
      const c = out[lineClass(file)];
      c.files++;
      // Binary files: `-` for both counts.
      if (added !== "-") {
        c.added += Number(added);
        c.deleted += Number(deleted);
      }
    }
  }
  return withLineTotal(out);
}

/** `{total, code, tests, docs, merges}` from the parts: total = their sum, changed = added + deleted. */
export function withLineTotal({ code, tests, docs, merges }) {
  const parts = [code, tests, docs];
  const added = sumOf(parts.map((p) => p.added));
  const deleted = sumOf(parts.map((p) => p.deleted));
  return {
    total: { added, deleted, changed: added + deleted, files: sumOf(parts.map((p) => p.files)) },
    code,
    tests,
    docs,
    merges,
  };
}
/** An old-format plan's task line: `- [ ] **Task 3:** …`, `- [ ] **Task 3 — title.**`, `- [ ] **T3 — title.**`. */
const TASK_START = /^(\s*)- \[[ xX]\] \*\*(?:Task \d+|T\d+)\b/;
/**
 * A plan's group and task markers, `<!-- bkit:task 3 start -->`, and a code fence (markers inside
 * one are text): copies of `MARKER` and `FENCE` in
 * `.bkit/core/engine/commands/workflow/plan-blocks.ts`; a test holds them equal.
 */
export const PLAN_MARKER = /^\s*<!--\s*bkit:(group|task)\s+(\d+)\s+(start|end)\s*-->\s*$/;
export const PLAN_FENCE = /^\s*(`{3,}|~{3,})/;
/** A reconciled challenge finding: a heading whose first severity word is the finding's. */
const FINDING_HEADING = /^#{3,4} [^\n]*?\b(CRITICAL|HIGH|MEDIUM|LOW)\b/gm;
const msOf = (iso) => (typeof iso === "string" ? Date.parse(iso) : NaN);
const tenth = (ms) => Math.round(ms / 6000) / 10;

/** Status rows of a `status.jsonl` that parse, in file order. */
export function readStatus(file) {
  if (!fs.existsSync(file)) return [];
  return readLedger(file).filter((r) => typeof r.type === "string" && Number.isFinite(msOf(r.at)));
}

/**
 * Status rows → runs, split at each `workflow-started`. A close step written after the end row
 * still belongs to the run; other rows after the end row and before the next start (a hand
 * rewind) are counted as `afterEnd`, not as steps.
 */
export function splitRuns(rows) {
  const runs = [];
  let run = null;
  for (const r of rows) {
    if (r.type === "workflow-started") {
      run = { workflow: r.workflow, rows: [r], end: null, afterEnd: 0, last: r };
      runs.push(run);
    } else if (!run) continue;
    else {
      run.last = r;
      const isEnd = r.type === "workflow-done" || r.type === "workflow-failed";
      // A close step after the end row, and the end row it writes, stay in the run: the
      // last end row is the run's ending (done, then a failed close → failed).
      if (run.end && !isEnd && !/-close-workflow$/.test(r.step ?? "")) {
        run.afterEnd++;
        continue;
      }
      run.rows.push(r);
      if (isEnd) run.end = r;
    }
  }
  return runs;
}

const TEST_FIRST = /\*\*Test first:\*\*/i;

/**
 * A task block's `**Test first:**` / `**TEST FIRST:**` entries: `;`-separated on its line, or
 * one per bullet below it; `n/a` = none. Null when the task has no such field.
 */
function testFirstEntries(block) {
  const at = block.findIndex((l) => TEST_FIRST.test(l));
  if (at < 0) return null;
  const rest = block[at].split(TEST_FIRST)[1].trim();
  const entries = /^n\/a\b/i.test(rest) ? [] : rest.split(";").filter((e) => e.trim());
  const indent = block[at].search(/\S/);
  for (const l of block.slice(at + 1)) {
    if (!l.trim()) continue;
    if (l.search(/\S/) <= indent) break;
    if (/^\s*- /.test(l)) entries.push(l);
  }
  return entries;
}

/** Distinct test files of `Test first` entries: each entry's first backticked span. */
const testFileCount = (entries) =>
  uniq(entries.map((e) => e.match(/`([^`]+)`/)?.[1]).filter(Boolean)).length;

/**
 * A marker plan's groups in plan order, each `{tasks: [{tests, testFiles}]}`, read between
 * `PLAN_MARKER` lines outside code fences; null counts = the task has no `TEST FIRST` field. A
 * task outside a group is not counted, as in the parser.
 */
export function planGroups(text) {
  const groups = [];
  let fence = null;
  let group = null;
  let task = null;
  for (const line of text.split("\n")) {
    const mark = PLAN_FENCE.exec(line)?.[1];
    if (mark !== undefined && (fence === null || mark.startsWith(fence))) {
      fence = fence === null ? mark : null;
      continue;
    }
    if (fence !== null) continue;
    const m = PLAN_MARKER.exec(line);
    if (!m) {
      task?.push(line);
      continue;
    }
    if (task) {
      const entries = testFirstEntries(task);
      group?.tasks.push(
        entries === null
          ? { tests: null, testFiles: null }
          : { tests: entries.length, testFiles: testFileCount(entries) },
      );
      task = null;
    }
    if (m[1] === "group") {
      group = m[3] === "start" ? { tasks: [] } : null;
      if (group) groups.push(group);
    } else if (m[3] === "start") task = [];
  }
  return groups;
}

/**
 * `{tasks, tests[], testFiles[], withField}` of an old-format plan file's runbook tasks (task
 * lines matching `TASK_START`, no markers). `withField` = tasks that have the `Test first`
 * field; plans written before it have none.
 */
export function planTasks(text) {
  const lines = text.split("\n");
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(TASK_START);
    if (!m) continue;
    const block = [lines[i]];
    while (i + 1 < lines.length && !TASK_START.test(lines[i + 1])) {
      const next = lines[i + 1];
      if (next.trim() && next.search(/\S/) <= m[1].length) break;
      block.push(next);
      i++;
    }
    blocks.push(block);
  }
  const tests = [];
  const testFiles = [];
  let withField = 0;
  for (const block of blocks) {
    const entries = testFirstEntries(block) ?? [];
    if (block.some((l) => TEST_FIRST.test(l))) withField++;
    tests.push(entries.length);
    testFiles.push(testFileCount(entries));
  }
  return { tasks: tests.length, tests, testFiles, withField };
}

/**
 * The row's `plan` block from a run log's frozen plan copies, the last `plan-v<N>-<name>.md`:
 * with group markers, `{source, total {tasks, kb}, groups [{tasks [{tests, testFiles}]}]}`.
 * An old-format run: its `plan-v<N>-<n>.md` sub-plans, else the last version as one sub-plan,
 * plus the `plan-complexity-check.md` verdict. Null when the folder has no plan copy.
 */
export function planShape(dir) {
  const files = fs.readdirSync(dir);
  const subs = files.filter((f) => /^plan-v\d+-\d+\.md$/.test(f)).sort();
  const versions = files
    .filter((f) => /^plan-v\d+-[a-z]+\.md$/.test(f) && !f.endsWith("-split.md"))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  const finalFiles = subs.length ? subs : versions.slice(-1);
  if (!finalFiles.length) return null;
  const read = (f) => fs.readFileSync(path.join(dir, f), "utf8");
  const kbOf = (f) => Math.round(fs.statSync(path.join(dir, f)).size / 1024);
  const groups = subs.length ? [] : planGroups(read(finalFiles[0]));
  if (groups.length)
    return {
      source: "file",
      total: { tasks: sumOf(groups.map((g) => g.tasks.length)), kb: kbOf(finalFiles[0]) },
      groups,
    };
  const parts = finalFiles.map((f) => ({ kb: kbOf(f), ...planTasks(read(f)) }));
  // null: the plan predates the `Test first` field. Per task, in task order; no limit applied.
  const hasField = parts.some((p) => p.withField > 0);
  const subPlans = parts.map((p) => ({
    kb: p.kb,
    tasks: p.tests.map((n, i) => ({
      tests: hasField ? n : null,
      testFiles: hasField ? p.testFiles[i] : null,
    })),
  }));
  const shape = {
    source: "file",
    total: {
      tasks: sumOf(subPlans.map((p) => p.tasks.length)),
      kb: sumOf(subPlans.map((p) => p.kb)),
    },
    subPlans,
  };
  if (files.includes("plan-complexity-check.md")) {
    const check = read("plan-complexity-check.md");
    const verdict = check.match(/^Verdict:\s*(\w+)/m)?.[1] ?? null;
    // The plan the check read: the last version before the split. Its reason stays in the
    // report file (plan text is not stored); the report quotes it from this machine.
    const before = versions.at(-1) ? planTasks(read(versions.at(-1))) : { tasks: 0 };
    shape.complexity = { verdict, tasksChecked: before.tasks };
  }
  return shape;
}

const readIf = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null);

/**
 * The row's `build` block: every verify round, gaps-remediate round, the holistic verify and the
 * challenge. A later build of the same feature overwrites the report files, so a report is read
 * for the folder's last build, or for an earlier build when the file was last written inside
 * that build (before the next one started). A verify report must also match its round's verdict
 * and failure count.
 * @param {[number, number]} window  the run's start and the next build's start
 */
export function buildFacts(run, dir, isLastBuild, window) {
  const ours = (file) => {
    const f = path.join(dir, file);
    if (!fs.existsSync(f)) return null;
    const t = fs.statSync(f).mtimeMs;
    return isLastBuild || (t >= window[0] && t < window[1]) ? fs.readFileSync(f, "utf8") : null;
  };
  const steps = run.rows.filter((r) => r.type === "step-done");
  // A round's unit: `group`, or `subPlan` on an old run's status rows.
  const unitOf = (r) =>
    r.group === undefined && r.subPlan !== undefined
      ? { subPlan: r.subPlan }
      : { group: r.group ?? null };
  const verify = steps
    .filter((r) => r.step === "build-plan-verify")
    .map((r) => {
      const unit = unitOf(r);
      const v = {
        ...unit,
        attempt: r.attempt ?? null,
        verdict: r.verdict ?? null,
        failures: r.failures ?? null,
        testOrderGaps: null,
      };
      const text = ours(`build-plan-verify-${Object.values(unit)[0]}-${v.attempt}.md`);
      if (
        text &&
        text.match(/^Verdict:\s*(\w+)/m)?.[1] === v.verdict &&
        Number(text.match(/^Failures:\s*(\d+)/m)?.[1]) === v.failures
      )
        v.testOrderGaps = testOrderGaps(text);
      return v;
    });
  const gapsRemediate = steps
    .filter((r) => r.step === "build-plan-gaps-remediate")
    .map((r) => ({
      ...unitOf(r),
      attempt: r.attempt ?? null,
      verdict: r.verdict ?? null,
      strategy: r.strategy ?? null,
    }));
  const hol = steps.findLast((r) => r.step === "build-plan-verify-holistic");
  const ch = steps.findLast((r) => r.step === "build-challenge");
  const reconciled = steps.some((r) => r.step === "build-challenge-reconcile");
  let findings = null;
  const chText = reconciled && ours("build-challenge.md");
  if (chText) {
    const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const [, s] of chText.matchAll(FINDING_HEADING)) bySeverity[s]++;
    findings = { total: sumOf(Object.values(bySeverity)), ...bySeverity };
  }
  return {
    verify,
    gapsRemediate,
    ...(hol ? { holistic: { verdict: hol.verdict ?? null, failures: hol.failures ?? null } } : {}),
    ...(ch ? { challenge: { verdict: ch.verdict ?? null, findings } } : {}),
    // Filled from the row's steps block: build.redTests = steps.byStep["build-task-red"].n.
    redTests: 0,
  };
}

/** The run's last close step, or undefined. */
const lastClose = (run) =>
  run.rows.findLast((r) => r.type === "step-done" && /-close-workflow$/.test(r.step ?? ""));

/**
 * The run's join key to its `outcome` row: the `parentSha` on its last `workflow-done` row (HEAD
 * at close), else its last close step's, else null. A close step written by `runs dispatch`
 * comes after the close commit, so its `parentSha` names a later commit.
 */
const joinSha = (run) =>
  run.rows.findLast((r) => r.type === "workflow-done")?.parentSha ??
  lastClose(run)?.parentSha ??
  null;

/**
 * How the run ended: `done` / `failed` from its last end row. `close-failed` when the work wrote
 * `workflow-done` and the close after it failed: its last close found CI never started
 * (`ciDispatch.outcome: "unresolved"`), or a `workflow-failed` row came after the done row with
 * no close after it. With no end row, `decision-pause` when its `build-decision-<run>-*.md` is
 * still `Status: OPEN`, else `stopped`.
 */
export function endingOf(run, dir, ordinal) {
  // splitRuns keeps only close steps after an end row, so a done row before the last end row
  // means the work finished and anything after it is the close.
  if (run.end && run.rows.some((r) => r.type === "workflow-done")) {
    const close = lastClose(run);
    if (close?.ciDispatch?.outcome === "unresolved") return "close-failed";
    if (run.end.type === "workflow-done") return "done";
    return close && run.rows.indexOf(close) > run.rows.indexOf(run.end) ? "done" : "close-failed";
  }
  if (run.end?.type === "workflow-failed") return "failed";
  if (run.workflow === "build") {
    const open = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`build-decision-${ordinal}-`) && f.endsWith(".md"))
      .some((f) => /^Status:\s*OPEN\b/m.test(readIf(path.join(dir, f)) ?? ""));
    if (open) return "decision-pause";
  }
  return "stopped";
}

/**
 * Audit rows that mark a moment, not the end of a step: a step's minutes run from the row before
 * it that is not one of these. A copy of the engine's `MARK_ROWS`
 * (`.bkit/core/engine/commands/workflow/run-facts.ts`); a test holds the two equal.
 */
export const MARK_ROWS = new Set(["session", "owner-pause", "owner-answer"]);

/** A run row's key: `<fid fp>:<workflow>:<start>`. */
const runKey = (slug, fid, workflow, start) =>
  `${fingerprint(`${slug}:${fid}`)}:${workflow}:${start}`;

/** Chat fingerprints a run's `session` rows name, each once. */
const runSessions = (run) =>
  uniq(run.rows.filter((r) => r.type === "session" && r.session).map((r) => r.session));

/**
 * The owner's waits in a run, from its `owner-pause` / `owner-answer` rows. A stop runs from a
 * pause to the next answer; a pause while a stop is open is the same stop. A stop still open
 * has `minutes: null`. `waitBeforeMinutes` = time since the folder's previous run's last row,
 * null for the folder's first run.
 */
export function ownerBlock(run, prev) {
  const stops = [];
  let open = null;
  for (const r of run.rows) {
    if (r.type === "owner-pause") open ??= { at: msOf(r.at), reason: r.reason ?? null };
    else if (r.type === "owner-answer" && open) {
      stops.push({ ms: msOf(r.at) - open.at, open: false, reason: open.reason });
      open = null;
    }
  }
  if (open) stops.push({ ms: null, open: true, reason: open.reason });
  const start = msOf(run.rows[0].at);
  return {
    waitBeforeMinutes: prev ? tenth(Math.max(0, start - msOf(prev.last.at))) : null,
    total: {
      stops: stops.length,
      minutes: tenth(sumOf(stops.map((x) => x.ms))),
    },
    stops: stops.map(({ ms, open: o, reason }) => ({
      minutes: ms === null ? null : tenth(ms),
      open: o,
      reason,
    })),
  };
}

/**
 * Every run's window in the given repo roots, for splitting chats across runs:
 * `{key, repo, issue, start, end, sessions}`; `end` = the run's last row.
 */
export function runWindows(roots) {
  const out = [];
  const seen = new Set();
  for (const root of uniq(roots.filter(Boolean))) {
    try {
      const repo = resolveRepo(root);
      const top = fs.realpathSync(repo.root ?? root);
      if (seen.has(top)) continue;
      seen.add(top);
      for (const dir of runLogDirs(top)) {
        const fid = path.basename(dir);
        const n = fid.match(/^(\d+)-/)?.[1];
        for (const run of splitRuns(readStatus(path.join(dir, "status.jsonl")))) {
          const start = msOf(run.rows[0].at);
          out.push({
            key: runKey(repo.slug, fid, run.workflow, start),
            repo: repoFp(repo.slug),
            issue: n ? issueFp(repo.slug, Number(n)) : null,
            start,
            end: msOf(run.rows.at(-1).at),
            sessions: runSessions(run),
          });
        }
      }
    } catch {
      // scanRuns() reads the same folders and reports the error
    }
  }
  return out;
}

/**
 * A run's tokens from the chats that worked on it (chatRuns()), summed from each chat's
 * `usage.byRun` entry for it: `{total, main, agents}`, each `{turns, tokens}`. Null when no
 * chat worked on it, or one of them has no split (a chat row from before the split, or a host
 * that records no call times).
 * @param {Iterable<object>} chats  chat rows
 */
export function runUsageIndex(chats) {
  const bySession = new Map();
  const byIssue = new Map();
  for (const row of chats) {
    const c = normalize(row);
    bySession.set(fingerprint(c.key), c);
    for (const fp of c.issue?.all ?? [])
      (byIssue.get(fp) ?? byIssue.set(fp, []).get(fp)).push(c);
  }
  const overlaps = (c, w) =>
    Number.isFinite(c.time?.start) &&
    Number.isFinite(c.time?.end) &&
    c.time.start <= w.end &&
    c.time.end >= w.start;
  return (w) => {
    const cs = new Set(w.sessions.map((fp) => bySession.get(fp)).filter(Boolean));
    for (const c of byIssue.get(w.issue) ?? []) if (c.repo === w.repo && overlaps(c, w)) cs.add(c);
    if (!cs.size || [...cs].some((c) => !c.usage?.byRun)) return null;
    const part = () => ({ turns: 0, tokens: blankTokens() });
    const u = { total: part(), main: part(), agents: part() };
    for (const c of cs) {
      const e = c.usage.byRun[w.key];
      for (const k of ["main", "agents"]) {
        u[k].turns += e?.[k]?.turns ?? 0;
        addTokens(u[k].tokens, e?.[k]?.tokens);
      }
    }
    u.total.turns = u.main.turns + u.agents.turns;
    addTokens(addTokens(u.total.tokens, u.main.tokens), u.agents.tokens);
    return u;
  };
}

/**
 * Every run in one run-log folder → `run` rows. `fid` is the folder name; it is stored only as a
 * fingerprint, and `issue` as the fingerprint of its leading number.
 * @param {string} dir  `docs/plans/<YYYYMM>/logs/<FID>/`
 * @param {{slug: string}} repo
 * @param {[number, string][]} history  versionHistory() of that repo
 * @param {(issue: string|null, start: number, end: number) => {spans: number[][], from: object}|null} [activity]
 *   active spans of the chats that ran this issue's workflows during the run
 * @param {(window: object) => object|null} [usage]  runUsageIndex(): the run's tokens
 */
export function runRows(dir, repo, history, activity = () => null, usage = () => null) {
  const fid = path.basename(dir);
  const n = fid.match(/^(\d+)-/)?.[1];
  const runs = splitRuns(readStatus(path.join(dir, "status.jsonl")));
  const lastOf = (wf) => runs.findLast((r) => r.workflow === wf);
  const ordinals = {};
  return runs.map((run, i) => {
    const ordinal = (ordinals[run.workflow] = (ordinals[run.workflow] ?? 0) + 1);
    const start = msOf(run.rows[0].at);
    const end = msOf(run.rows.at(-1).at);
    const issue = n ? issueFp(repo.slug, Number(n)) : null;
    const act = activity(issue, start, end);
    // A step's minutes = time since the row before it that is not a mark row; its active
    // minutes = the part of that time inside the chats' active spans. Summed in ms; rounded to a
    // tenth only when written.
    const stepMs = {};
    const timed = run.rows.filter((r) => !MARK_ROWS.has(r.type));
    for (let j = 1; j < timed.length; j++) {
      const r = timed[j];
      if (r.type !== "step-done" || !r.step) continue;
      const s = (stepMs[r.step] ??= { n: 0, ms: 0, active: 0 });
      const from = msOf(timed[j - 1].at);
      s.n++;
      s.ms += msOf(r.at) - from;
      if (act) s.active += overlapMs(act.spans, from, msOf(r.at));
    }
    const stepParts = Object.values(stepMs);
    const steps = {
      total: {
        n: sumOf(stepParts.map((p) => p.n)),
        totalMinutes: tenth(sumOf(stepParts.map((p) => p.ms))),
        activeMinutes: act ? tenth(sumOf(stepParts.map((p) => p.active))) : null,
      },
      byStep: Object.fromEntries(
        Object.entries(stepMs).map(([k, { n, ms, active }]) => [
          k,
          { n, totalMinutes: tenth(ms), activeMinutes: act ? tenth(active) : null },
        ]),
      ),
    };
    const nextBuild = runs.find((r) => r.workflow === run.workflow && msOf(r.rows[0].at) > start);
    const window = [start, nextBuild ? msOf(nextBuild.rows[0].at) : Infinity];
    const parentShas = uniq(run.rows.map((r) => r.parentSha).filter(Boolean));
    const writesCode = run.workflow === "build" || run.workflow === "debug";
    const close = lastClose(run);
    const fidFp = fingerprint(`${repo.slug}:${fid}`);
    const key = runKey(repo.slug, fid, run.workflow, start);
    const brief = run.rows.some((r) => r.type === "workflow-meta" && r.planSource === "brief");
    let plan;
    if (run.workflow === "plan" && run === lastOf("plan")) plan = planShape(dir);
    if (brief) plan = { source: "brief" };
    let build;
    if (run.workflow === "build") {
      build = buildFacts(run, dir, run === lastOf("build"), window);
      build.redTests = steps.byStep["build-task-red"]?.n ?? 0;
    }
    return {
      schema: SCHEMA,
      ts: end,
      kind: "run",
      key,
      repo: repoFp(repo.slug),
      bkit: { version: versionAt(history, start) ?? null },
      by: { workflow: run.workflow, step: "scan" },
      run: {
        fid: fidFp,
        issue,
        n: ordinal,
        parentSha: joinSha(run),
        parentShas,
      },
      time: {
        start,
        end,
        totalMinutes: tenth(end - start),
        activeMinutes: act ? tenth(overlapMs(act.spans, start, end)) : null,
        activeFrom: act ? act.from : null,
        // The log's last row of any kind, rows after the end row included: what `settled` is judged on.
        lastActivity: msOf(run.last.at) || end,
      },
      ending: endingOf(run, dir, ordinal),
      ci: run.rows
        .filter((r) => r.type === "step-done" && /-close-workflow$/.test(r.step ?? ""))
        .filter((r) => r.ciDispatch)
        .map(({ ciDispatch: d }) => ({
          status: d.outcome ?? null,
          ...(d.reason ? { reason: d.reason } : {}),
          attempts: d.attempts ?? null,
        })),
      steps,
      owner: ownerBlock(run, runs[i - 1]),
      usage: usage({
        key,
        repo: repoFp(repo.slug),
        issue,
        start,
        end,
        sessions: runSessions(run),
      }),
      ...(writesCode ? { lines: runLines(repo.root, parentShas) } : {}),
      ...(plan !== undefined ? { plan } : {}),
      ...(build ? { build } : {}),
      scan: { rows: run.rows.length + run.afterEnd, afterEnd: run.afterEnd },
    };
  });
}

/**
 * Run-log folders of a repo: the main checkout's and every worktree's, each feature once. A
 * worktree carries copies of other features' logs; for each feature the copy with the most
 * status rows wins (the live one).
 */
export function runLogDirs(root) {
  const best = new Map();
  const bases = [root];
  const wt = path.join(root, ".worktrees");
  if (fs.existsSync(wt)) for (const d of fs.readdirSync(wt)) bases.push(path.join(wt, d));
  for (const base of bases) {
    const plans = path.join(base, "docs", "plans");
    if (!fs.existsSync(plans)) continue;
    for (const month of fs.readdirSync(plans)) {
      const logs = path.join(plans, month, "logs");
      if (!/^\d{6}$/.test(month) || !fs.existsSync(logs)) continue;
      for (const fid of fs.readdirSync(logs)) {
        const status = path.join(logs, fid, "status.jsonl");
        if (!fs.existsSync(status)) continue;
        const size = fs.statSync(status).size;
        if ((best.get(fid)?.size ?? -1) < size) best.set(fid, { dir: path.join(logs, fid), size });
      }
    }
  }
  return [...best.values()].map((b) => b.dir).sort();
}

/**
 * Active spans of the counted chats that ran an issue's workflows (a `/bkit-*` command or the
 * host's summary named it), for a run of that issue: chats of the same repo that overlap it.
 * `from` names how many chats and bytes they came from, so a run is counted again once more
 * of its chats are.
 * @param {Iterable<object>} chats  chat rows
 */
export function activityIndex(chats) {
  const byIssue = new Map();
  for (const row of chats) {
    const c = normalize(row);
    for (const fp of c.issue?.all ?? [])
      if (c.time?.spans?.length) (byIssue.get(fp) ?? byIssue.set(fp, []).get(fp)).push(c);
  }
  return (issue, start, end) => {
    const cs = (byIssue.get(issue) ?? []).filter((c) => c.time.start <= end && c.time.end >= start);
    if (!cs.length) return null;
    return {
      spans: mergeSpans(cs.flatMap((c) => c.time.spans)),
      from: { chats: cs.length, bytes: cs.reduce((a, c) => a + (c.scan?.bytes ?? 0), 0) },
    };
  };
}

/**
 * `run` rows to append for the given repo roots: every run, `settled` once its log's last row is
 * older than the settle window; again when its row count, the chats its active minutes came
 * from, its tokens, its owner waits or `settled` changed.
 */
export function scanRuns({ roots, known, settledBefore, now = Date.now(), chats = [] }) {
  known = new Map([...known].map(([k, r]) => [k, normalize(r)]));
  chats = [...chats];
  const activity = activityIndex(chats);
  const usage = runUsageIndex(chats);
  const rows = [];
  const s = { found: 0, appended: 0, open: 0, unchanged: 0, error: null };
  const seen = new Set();
  for (const root of uniq(roots.filter(Boolean))) {
    try {
      const repo = resolveRepo(root);
      const top = fs.realpathSync(repo.root ?? root);
      // The same checkout reached through a symlink or a subfolder is read once.
      if (seen.has(top)) continue;
      seen.add(top);
      const history = versionHistory(top);
      for (const dir of runLogDirs(top)) {
        for (const r of runRows(dir, { ...repo, root: top }, history, activity, usage)) {
          s.found++;
          const settled = r.time.lastActivity <= settledBefore;
          if (!settled) s.open++;
          const was = known.get(r.key);
          // A migrated split-plan row does not say which sub-plan each task was in: written
          // again once the plan files give it.
          const tasksUnknown = (x) => x?.plan?.subPlans?.some((p) => p.tasks === null) ?? false;
          if (
            !(tasksUnknown(was) && !tasksUnknown(r)) &&
            was?.scan?.rows === r.scan.rows &&
            JSON.stringify(was.time?.activeFrom ?? null) === JSON.stringify(r.time.activeFrom) &&
            JSON.stringify(was.usage ?? null) === JSON.stringify(r.usage) &&
            JSON.stringify(was.owner ?? null) === JSON.stringify(r.owner) &&
            (was.scan?.settled ?? true) === settled
          ) {
            s.unchanged++;
            continue;
          }
          // ts = when the row was written: status rows carry whole seconds only.
          rows.push({ ...r, ts: now, scan: { ...r.scan, settled } });
          s.appended++;
        }
      }
    } catch (err) {
      s.error = err instanceof Error ? err.message : String(err);
    }
  }
  return { rows, stats: s };
}

// ---------------------------------------------------------------------------
// Ledger I/O
// ---------------------------------------------------------------------------

export function readLedger(file) {
  if (!fs.existsSync(file)) return [];
  const rows = [];
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line));
    } catch {
      // malformed line: readers skip it, as the engine's parse does
    }
  }
  return rows;
}

/** `obj` without its undefined fields. */
const defined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
/** Shell tools by host: where a row written without `schema` gets its shell command kinds. */
const OLD_SHELL_TOOLS = [
  "Bash",
  "bash",
  "Shell",
  "shell",
  "shell_command",
  "local_shell",
  "exec_command",
  "run_command",
  "run_terminal_cmd",
];

/** The top section of a row written without `schema`. */
function topOf(r, by) {
  return defined({
    schema: SCHEMA,
    ts: r.ts,
    kind: r.kind,
    key: r.key,
    repo: r.repo,
    bkit: {
      version: r.bkitVersion === undefined || r.bkitVersion === "none" ? null : r.bkitVersion,
    },
    // An old row's null or empty `workflow` / `subagent` / `model` meant "none": left out.
    by:
      by ??
      Object.fromEntries(
        ["workflow", "step", "subagent", "model"]
          .map((f) => [f, r[f]])
          .filter(([, v]) => v !== undefined && v !== null && v !== ""),
      ),
    references: r.references,
  });
}

const oldTokens = (t) => Object.fromEntries(TOKEN_KEYS.map((k) => [k, t?.[k] ?? 0]));
const oldMix = (m) =>
  m && {
    read: m.read ?? 0,
    edit: m.edit ?? 0,
    grep: m.grep ?? 0,
    shellRead: m.sedCat ?? 0,
    shellList: m.findLs ?? 0,
    tests: m.tests ?? 0,
    serena: m.serena ?? 0,
  };

function normalizeChat(r) {
  const byAgent = {};
  for (const [type, a] of Object.entries(r.agents ?? {})) {
    const peaks = a.ctxPeaks ?? [];
    byAgent[type] = defined({
      n: a.n ?? peaks.length,
      errors: a.errors ?? 0,
      // Per-instance turns were stored only as a sum: known when the type ran once.
      instances: peaks.map((p) => ({
        turns: (a.n ?? 1) === 1 ? (a.turns ?? null) : null,
        contextPeak: p,
      })),
      usage: {
        turns: a.turns ?? 0,
        tokens: oldTokens(a),
        context: { peak: a.ctxPeakMax ?? Math.max(0, ...peaks) },
        compactions: a.compactions ?? 0,
      },
      mix: oldMix(a.mix),
    });
  }
  const byTool = {};
  for (const [k, t] of Object.entries(r.tools ?? {}))
    byTool[k] = { calls: t.calls ?? 0, errors: t.errors ?? 0 };
  const shellTool = OLD_SHELL_TOOLS.find((k) => byTool[k]);
  if (shellTool && Object.keys(r.bash ?? {}).length) byTool[shellTool].byCategory = { ...r.bash };
  const byModel = Object.fromEntries(
    Object.entries(r.models ?? {}).map(([k, m]) => [
      k,
      { turns: m.turns ?? 0, tokens: oldTokens(m) },
    ]),
  );
  const m = r.main ?? {};
  const byVerb = r.bkitCli ?? {};
  const agentList = Object.values(byAgent);
  return {
    ...topOf(r, { workflow: r.workflow ?? "chat-stats", step: r.step ?? "scan" }),
    bkit: {
      version: r.bkitVersion === undefined || r.bkitVersion === "none" ? null : r.bkitVersion,
      versionSource: r.bkitVersionSource ?? "none",
      via: r.bkitVia ?? [],
      workflows: r.bkitWorkflows ?? [],
      prompts: r.bkitKinds ?? [],
      cli: { total: sumOf(Object.values(byVerb)), byVerb },
    },
    session: {
      platform: r.platform ?? DEFAULT_PLATFORM,
      id: r.sessionId ?? null,
      hostVersion: r.hostVersion ?? null,
      entrypoint: r.entrypoint ?? null,
      prompts: r.userPrompts ?? 0,
    },
    time: defined({
      start: r.start ?? null,
      end: r.end ?? null,
      totalMinutes:
        r.minutes ??
        (Number.isFinite(r.start) && Number.isFinite(r.end) ? tenth(r.end - r.start) : null),
      activeMinutes: r.activeMinutes ?? null,
      spans: r.active ?? [],
      lastActivity: r.lastActivityAt,
    }),
    issue: {
      id: r.issue ?? null,
      all: r.issues ?? [],
      mentioned: r.mentioned ?? [],
      source: r.issueSource ?? "none",
    },
    run: { parentShas: r.parentShas ?? [] },
    effort: r.effort ?? {},
    usage: {
      total: {
        turns: r.turns ?? 0,
        // Summed from the models, as a fresh scan writes it: the old row's own total
        // estimated output once over the whole chat, so it can differ from its parts.
        tokens: Object.keys(byModel).length
          ? Object.fromEntries(
              TOKEN_KEYS.map((k) => [k, sumOf(Object.values(byModel).map((x) => x.tokens[k]))]),
            )
          : oldTokens(r.tokens),
        context: { start: r.tokens?.ctxStart ?? 0, peak: r.tokens?.ctxPeak ?? 0 },
        compactions: r.compactions ?? 0,
      },
      main: defined({
        turns: m.turns ?? 0,
        tokens: oldTokens(m),
        context: { peak: m.ctxPeak ?? 0 },
        compactions: m.compactions ?? 0,
        mix: oldMix(m.mix),
      }),
      byModel,
    },
    agents: {
      total: {
        n: r.subagents ?? sumOf(agentList.map((a) => a.n)),
        errors: sumOf(agentList.map((a) => a.errors)),
      },
      byAgent,
    },
    tools: {
      total: {
        calls: sumOf(Object.values(byTool).map((t) => t.calls)),
        errors: sumOf(Object.values(byTool).map((t) => t.errors)),
      },
      byTool,
      filesRead: r.filesRead ?? 0,
    },
    scan: defined({
      files: r.sourceFiles,
      bytes: r.sourceBytes,
      settled: r.settled,
      tokensRecorded: r.tokensRecorded,
    }),
  };
}

/** A run row's plan written without `schema`: its per-task lists, grouped when unsplit. */
function normalizePlan(p) {
  const n = p.subPlans ?? 1;
  const tasks = p.tasks ?? p.testsPerTask?.length ?? 0;
  const out = { source: "file", total: { tasks, kb: p.kb ?? 0 } };
  if (n === 1) {
    out.subPlans = [
      {
        kb: p.kb ?? 0,
        tasks: Array.from({ length: tasks }, (_, i) => ({
          tests: p.testsPerTask?.[i] ?? null,
          testFiles: p.testFilesPerTask?.[i] ?? null,
        })),
      },
    ];
  } else {
    // A split plan's per-task lists were stored flat: which sub-plan each task was in is not known.
    out.subPlans = Array.from({ length: n }, () => ({ kb: null, tasks: null }));
  }
  if (p.complexity) out.complexity = p.complexity;
  return out;
}

function normalizeRun(r) {
  const parts = Object.values(r.steps ?? {});
  const byStep = Object.fromEntries(
    Object.entries(r.steps ?? {}).map(([k, s]) => [
      k,
      { n: s.n ?? 0, totalMinutes: s.minutes ?? 0, activeMinutes: s.active ?? null },
    ]),
  );
  const isBuild =
    r.workflow === "build" ||
    ["verify", "gapsRemediate", "holistic", "challenge", "redTests"].some((k) => k in r);
  const ch = r.challenge;
  const findings = ch?.findings && { total: sumOf(Object.values(ch.findings)), ...ch.findings };
  return defined({
    ...topOf(r, { workflow: r.workflow, step: r.step ?? "scan" }),
    run: {
      fid: r.fid ?? null,
      issue: r.issue ?? null,
      n: r.run ?? null,
      parentSha: r.parentSha ?? null,
      parentShas: r.parentShas ?? [],
    },
    time: defined({
      start: r.start ?? null,
      end: r.end ?? null,
      totalMinutes: r.minutes ?? null,
      activeMinutes: r.activeMinutes ?? null,
      activeFrom: r.activeFrom ?? null,
      lastActivity: r.lastActivityAt,
    }),
    ending: r.ending,
    ci: (r.closeCi ?? []).map((c) =>
      defined({
        status: c.outcome ?? null,
        reason: c.reason ?? undefined,
        attempts: c.attempts ?? null,
      }),
    ),
    steps: {
      total: {
        n: sumOf(parts.map((s) => s.n)),
        totalMinutes: Math.round(sumOf(parts.map((s) => s.minutes)) * 10) / 10,
        activeMinutes: parts.some((s) => s.active === null || s.active === undefined)
          ? null
          : Math.round(sumOf(parts.map((s) => s.active)) * 10) / 10,
      },
      byStep,
    },
    lines: r.lines && r.lines.code ? withLineTotal(r.lines) : r.lines,
    plan: r.plan ? normalizePlan(r.plan) : r.plan,
    build: isBuild
      ? defined({
          verify: r.verify ?? [],
          gapsRemediate: r.gapsRemediate ?? [],
          holistic: r.holistic ?? undefined,
          challenge: ch ? { verdict: ch.verdict ?? null, findings: findings ?? null } : undefined,
          redTests: r.redTests ?? 0,
        })
      : undefined,
    scan: defined({ rows: r.sourceRows, afterEnd: r.afterEnd, settled: r.settled }),
  });
}

function normalizeOutcome(r) {
  const has = (...ks) => ks.some((k) => r[k] !== undefined);
  // Every outcome counts all three ledgers, as the engine's normalize() gives them.
  const ledgers = {
    deferrals: defined({ repo: r.deferrals, added: r.deferralsAdded }),
    failures: defined({ repo: r.failures, added: r.failuresAdded }),
    friction: defined({ added: r.frictionAdded }),
  };
  return defined({
    ...topOf(r),
    run: has("parentSha", "prNumber")
      ? defined({ parentSha: r.parentSha, pr: r.prNumber })
      : undefined,
    time: has("durationSeconds") ? { totalMinutes: tenth(r.durationSeconds * 1000) } : undefined,
    ending: r.ending,
    lines: has("linesAdded", "linesDeleted", "linesChanged", "filesChanged")
      ? {
          total: defined({
            added: r.linesAdded,
            deleted: r.linesDeleted,
            changed: r.linesChanged,
            files: r.filesChanged,
          }),
        }
      : undefined,
    ledgers,
    plan: has("planSource") ? { source: r.planSource } : undefined,
    build: has("redTests") ? { redTests: r.redTests } : undefined,
    ship: has("coverage") ? { coverage: r.coverage } : undefined,
  });
}

/** Top-level fields of a row written without `schema` that its top section or a block takes over. */
const OLD_TOP = [
  "bkitVersion",
  "workflow",
  "step",
  "subagent",
  "model",
  "parentSha",
  "prNumber",
  "phase",
];

/** `{ctx, ...}` → `{context, ...}`; an object already renamed is kept. */
const renamedCtx = (o) => {
  if (!o || typeof o !== "object" || !("ctx" in o)) return o;
  const { ctx, ...rest } = o;
  return { ...rest, context: o.context ?? ctx };
};

/** A schema-2 chat row with schema-3 names: `ctx` → `context`, `ctxPeak` → `contextPeak`. */
function renamedChat(r) {
  const u = r.usage ?? {};
  const byAgent = Object.fromEntries(
    Object.entries(r.agents?.byAgent ?? {}).map(([k, a]) => [
      k,
      {
        ...a,
        usage: renamedCtx(a.usage),
        instances: (a.instances ?? []).map(({ ctxPeak, ...i }) => ({
          ...i,
          contextPeak: i.contextPeak ?? ctxPeak,
        })),
      },
    ]),
  );
  return {
    ...r,
    usage: { ...u, total: renamedCtx(u.total), main: renamedCtx(u.main) },
    ...(r.agents ? { agents: { ...r.agents, byAgent } } : {}),
  };
}

/**
 * Any stats row in the schema-3 shape. A row with `schema` passes through unchanged, except a
 * schema-2 `chat` row, which gets schema-3 names (`renamedChat()`) and keeps `schema: 2`: it has
 * no `usage.byRun`. A row written without `schema` (any kind) is mapped as far as it has the data: top-level
 * `bkitVersion` / `workflow` / `step` / `subagent` / `model` -> `bkit.version` / `by.*`,
 * `parentSha` -> `run.parentSha`, and each kind's fields into their blocks. Fields the format
 * drops (`taskCount`, `phase`, `bkit: true`, the subagent counts, ...) are left out. The row in
 * the file is never changed.
 */
export function normalize(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return row;
  if (row.schema === 2 && row.kind === "chat") return renamedChat(row);
  if (row.schema !== undefined) return row;
  switch (row.kind) {
    case "chat":
      return normalizeChat(row);
    case "run":
      return normalizeRun(row);
    case "outcome":
      return normalizeOutcome(row);
    case "counter":
      return defined({
        ...topOf(row),
        run: row.parentSha !== undefined ? { parentSha: row.parentSha } : undefined,
        counter: defined({
          name: row.counterName,
          value: row.counterValue,
          source: row.counterSource,
        }),
      });
    case "compliance":
      return defined({
        ...topOf(row),
        run: row.parentSha !== undefined ? { parentSha: row.parentSha } : undefined,
        rule: defined({ id: row.rule, verdict: row.result, evidence: row.evidence }),
      });
    default: {
      const rest = Object.fromEntries(Object.entries(row).filter(([k]) => !OLD_TOP.includes(k)));
      return defined({
        ...rest,
        ...topOf(row),
        run: row.parentSha !== undefined ? { parentSha: row.parentSha } : undefined,
      });
    }
  }
}

/**
 * Checks every total on a row against its parts, as the engine's `validate()` does:
 * `{ok: true}`, or `{ok: false, reason}` naming the first total that does not match. Minute
 * totals may differ from the sum of their rounded parts by 0.1 per part.
 */
export function validateTotals(row) {
  const problems = [];
  const same = (p, got, want) => {
    if (got !== want) problems.push(`${p} is ${got}, its parts give ${want}`);
  };
  const near = (p, got, want, parts) => {
    if (typeof got !== "number" || Math.abs(got - want) > 0.1 * Math.max(1, parts) + 1e-9)
      problems.push(`${p} is ${got}, its parts give ${Math.round(want * 1000) / 1000}`);
  };
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);

  const L = row.lines;
  if (L?.total && L.code && L.tests && L.docs) {
    for (const k of ["added", "deleted", "files"])
      same(`lines.total.${k}`, L.total[k], L.code[k] + L.tests[k] + L.docs[k]);
    same("lines.total.changed", L.total.changed, L.total.added + L.total.deleted);
  }

  const t = row.time;
  if (t && "totalMinutes" in t && "start" in t && "end" in t) {
    if (isNum(t.start) && isNum(t.end))
      near("time.totalMinutes", t.totalMinutes, (t.end - t.start) / 60000, 1);
    else if (t.totalMinutes !== null)
      problems.push("time.totalMinutes is set but time.start or time.end is not");
  }
  if (row.kind === "chat" && t && Array.isArray(t.spans))
    near("time.activeMinutes", t.activeMinutes, spansMs(t.spans) / 60000, t.spans.length);

  const u = row.usage;
  const agents = Object.entries(row.agents?.byAgent ?? {});
  if (u) {
    const withTokens = [
      ["usage.total", u.total],
      ["usage.main", u.main],
      ...Object.entries(u.byModel ?? {}).map(([k, m]) => [`usage.byModel.${k}`, m]),
      ...agents.map(([k, a]) => [`agents.byAgent.${k}.usage`, a.usage]),
    ];
    for (const [p, x] of withTokens)
      if (x?.tokens)
        same(
          `${p}.tokens.read`,
          x.tokens.read,
          x.tokens.input + x.tokens.cacheWrite + x.tokens.cacheRead,
        );
    if (u.total && u.byModel) {
      const models = Object.values(u.byModel);
      same("usage.total.turns", u.total.turns, sumOf(models.map((m) => m.turns)));
      for (const k of TOKEN_KEYS)
        same(
          `usage.total.tokens.${k}`,
          u.total.tokens?.[k],
          sumOf(models.map((m) => m.tokens?.[k])),
        );
    }
    if (row.kind !== "run" && u.total && u.main) {
      same(
        "usage.total.compactions",
        u.total.compactions,
        u.main.compactions + sumOf(agents.map(([, a]) => a.usage?.compactions)),
      );
      if (u.main.context)
        same(
          "usage.total.context.peak",
          u.total.context?.peak,
          Math.max(
            u.main.context.peak ?? 0,
            ...agents.flatMap(([, a]) => (a.instances ?? []).map((i) => i.contextPeak)),
          ),
        );
    }
    for (const [k, e] of Object.entries(u.byRun ?? {}))
      for (const part of ["main", "agents"]) {
        const x = e?.[part]?.tokens;
        if (x)
          same(
            `usage.byRun.${k}.${part}.tokens.read`,
            x.read,
            x.input + x.cacheWrite + x.cacheRead,
          );
      }
    if (row.kind === "run" && u.total && u.main && u.agents) {
      same("usage.total.turns", u.total.turns, u.main.turns + u.agents.turns);
      for (const k of TOKEN_KEYS)
        same(
          `usage.total.tokens.${k}`,
          u.total.tokens?.[k],
          (u.main.tokens?.[k] ?? 0) + (u.agents.tokens?.[k] ?? 0),
        );
    }
  }
  const o = row.owner;
  if (o?.total && Array.isArray(o.stops)) {
    same("owner.total.stops", o.total.stops, o.stops.length);
    const closed = o.stops.filter((x) => x.minutes !== null);
    near("owner.total.minutes", o.total.minutes, sumOf(closed.map((x) => x.minutes)), closed.length);
  }
  if (row.agents?.total) {
    for (const [k, a] of agents) same(`agents.byAgent.${k}.n`, a.n, (a.instances ?? []).length);
    same("agents.total.n", row.agents.total.n, sumOf(agents.map(([, a]) => a.n)));
    same("agents.total.errors", row.agents.total.errors, sumOf(agents.map(([, a]) => a.errors)));
  }
  if (row.tools?.total) {
    const tools = Object.values(row.tools.byTool ?? {});
    same("tools.total.calls", row.tools.total.calls, sumOf(tools.map((x) => x.calls)));
    same("tools.total.errors", row.tools.total.errors, sumOf(tools.map((x) => x.errors)));
  }
  if (row.bkit?.cli)
    same("bkit.cli.total", row.bkit.cli.total, sumOf(Object.values(row.bkit.cli.byVerb ?? {})));

  const st = row.steps;
  if (st?.total && st.byStep) {
    const parts = Object.values(st.byStep);
    same("steps.total.n", st.total.n, sumOf(parts.map((s) => s.n)));
    near(
      "steps.total.totalMinutes",
      st.total.totalMinutes,
      sumOf(parts.map((s) => s.totalMinutes)),
      parts.length,
    );
    if ("activeMinutes" in st.total) {
      // A run with no steps yet and no counted chat has nothing to sum.
      const unknown =
        parts.some((s) => s.activeMinutes === null || s.activeMinutes === undefined) ||
        (!parts.length && st.total.activeMinutes === null);
      if (unknown) {
        if (st.total.activeMinutes !== null)
          problems.push(
            `steps.total.activeMinutes is ${st.total.activeMinutes}, but a step's is null`,
          );
      } else
        near(
          "steps.total.activeMinutes",
          st.total.activeMinutes,
          sumOf(parts.map((s) => s.activeMinutes)),
          parts.length,
        );
    }
  }
  const pl = row.plan;
  const planParts = pl?.groups ?? pl?.subPlans;
  if (pl?.total && Array.isArray(planParts) && planParts.every((s) => Array.isArray(s.tasks))) {
    same("plan.total.tasks", pl.total.tasks, sumOf(planParts.map((s) => s.tasks.length)));
    if (pl.subPlans) same("plan.total.kb", pl.total.kb, sumOf(pl.subPlans.map((s) => s.kb)));
  }
  const b = row.build;
  if (b && "redTests" in b && st?.byStep)
    same("build.redTests", b.redTests, st.byStep["build-task-red"]?.n ?? 0);
  const f = b?.challenge?.findings;
  if (f) same("build.challenge.findings.total", f.total, f.CRITICAL + f.HIGH + f.MEDIUM + f.LOW);

  return problems.length ? { ok: false, reason: problems[0] } : { ok: true };
}

/** The rows that pass validateTotals(); each other one is logged and left out. */
export function writableRows(rows, log = console.error) {
  return rows.filter((r) => {
    const v = validateTotals(r);
    if (!v.ok) log(`[bkit-telemetry] ${r.kind} row ${r.key} not written: ${v.reason}`);
    return v.ok;
  });
}

/** Last row of `kind` per key wins (§ Updating a Row), in the schema-2 shape. */
export function latestRows(rows, kind) {
  const out = new Map();
  for (const r of rows) if (r?.kind === kind && r.key) out.set(r.key, normalize(r));
  return out;
}
export const latestChats = (rows) => latestRows(rows, "chat");

/**
 * Outcome rows, the newest per (repo, `by.workflow`, `run.parentSha`): `bkit runs dispatch`
 * appends the run's outcome again with the dispatch in `ci`. Newest is the larger `ts`, the later
 * row on a tie. Rows without `run.parentSha` are
 * all kept. Order follows each kept row's first appearance.
 */
export function latestOutcomes(rows) {
  const out = [];
  const at = new Map();
  for (const r of rows) {
    if (r?.kind !== "outcome") continue;
    const sha = r.run?.parentSha ?? r.parentSha;
    if (!sha) {
      out.push(r);
      continue;
    }
    const k = [r.repo, r.by?.workflow ?? r.workflow, sha].join("\u0000");
    const i = at.get(k);
    if (i === undefined) at.set(k, out.push(r) - 1);
    else if ((r.ts ?? 0) >= (out[i].ts ?? 0)) out[i] = r;
  }
  return out;
}

function appendRows(file, rows) {
  if (!rows.length) return;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let lead = "";
  if (fs.existsSync(file) && fs.statSync(file).size > 0) {
    const fd = fs.openSync(file, "r");
    const last = Buffer.alloc(1);
    fs.readSync(fd, last, 0, 1, fs.statSync(file).size - 1);
    fs.closeSync(fd);
    if (last.toString() !== "\n") lead = "\n";
  }
  fs.appendFileSync(file, lead + rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
}

// ---------------------------------------------------------------------------
// Hosts. Each lists its chats as
//   {sessionId, files, bytes, mtime, cwd(), load()}
// `bytes` changes whenever the chat does; `mtime` is its newest write (Infinity while the host
// is still writing it); `load()` → {main, subs: [{agentType, counts}]}, counts from a Tally.
// ---------------------------------------------------------------------------

/** Every file under `dir` whose name passes `test`. */
function walkFiles(dir, test, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, test, out);
    else if (test(e.name)) out.push(p);
  }
  return out;
}

/** Chats from host entries `{id, parent, agentType, size, mtime, …}`: subagents fold into their root. */
function groupByRoot(entries, toChat) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const rootOf = (e) => {
    const seen = new Set();
    while (e.parent && byId.has(e.parent) && !seen.has(e.id)) {
      seen.add(e.id);
      e = byId.get(e.parent);
    }
    return e;
  };
  const groups = new Map();
  for (const e of entries) {
    const root = rootOf(e);
    const g = groups.get(root.id) ?? groups.set(root.id, { root, kids: [] }).get(root.id);
    if (e !== root) g.kids.push(e);
  }
  return [...groups.values()].map(({ root, kids }) => {
    const all = [root, ...kids];
    return {
      sessionId: root.id,
      files: all.length,
      bytes: all.reduce((a, e) => a + e.size, 0),
      mtime: Math.max(...all.map((e) => e.mtime)),
      ...toChat(root, kids),
    };
  });
}

let sqliteModule;
const walSize = (file) => (fs.existsSync(`${file}-wal`) ? fs.statSync(`${file}-wal`).size : 0);

/**
 * Opens a host's SQLite file read-only and leaves the host's folder exactly as it was; null when
 * it cannot be opened or Node is older than 22.5. A plain read-only open of a WAL-mode database
 * creates `-wal` and `-shm` files beside it, so:
 *   no WAL pages        → `immutable=1`, which reads the file alone and creates nothing;
 *   WAL pages + `-shm`  → read-only through the files the host already has open;
 *   WAL pages, no `-shm` → a copy of the database and its WAL in a temp folder.
 */
async function openDb(file) {
  if (sqliteModule === undefined) {
    try {
      sqliteModule = await import("node:sqlite");
    } catch {
      sqliteModule = null;
    }
  }
  if (!sqliteModule || !fs.existsSync(file)) return null;
  const open = (f, q) => {
    try {
      const u = pathToFileURL(f);
      u.search = q;
      const db = new sqliteModule.DatabaseSync(u, { readOnly: true });
      db.prepare("select 1 from sqlite_master limit 1").all();
      return db;
    } catch {
      return null;
    }
  };
  if (walSize(file) === 0) return open(file, "mode=ro&immutable=1");
  if (fs.existsSync(`${file}-shm`)) return open(file, "mode=ro");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-chat-stats-db-"));
  const copy = path.join(dir, path.basename(file));
  fs.copyFileSync(file, copy);
  fs.copyFileSync(`${file}-wal`, `${copy}-wal`);
  process.once("exit", () => fs.rmSync(dir, { recursive: true, force: true }));
  return open(copy, "mode=ro");
}

/** Wire fields of one protobuf message as [field, value] (Buffer or number); null if `buf` is not one. */
export function pbFields(buf) {
  const out = [];
  let i = 0;
  const varint = () => {
    let r = 0;
    let s = 1;
    let x;
    do {
      if (i >= buf.length) throw new Error("eof");
      x = buf[i++];
      r += (x & 0x7f) * s;
      s *= 128;
    } while (x & 0x80);
    return r;
  };
  try {
    while (i < buf.length) {
      const k = varint();
      const f = Math.floor(k / 8);
      const w = k % 8;
      if (f === 0) return null;
      if (w === 0) out.push([f, varint()]);
      else if (w === 2) {
        const l = varint();
        if (i + l > buf.length) return null;
        out.push([f, buf.subarray(i, i + l)]);
        i += l;
      } else if (w === 1) i += 8;
      else if (w === 5) i += 4;
      else return null;
      if (i > buf.length) return null;
    }
  } catch {
    return null;
  }
  return out;
}

/** Every value at a dotted field path (`"28.21.1"`), descending into nested messages. */
export function pbAll(buf, p) {
  let cur = [Buffer.from(buf)];
  for (const f of String(p).split(".").map(Number)) {
    cur = cur.flatMap((b) =>
      Buffer.isBuffer(b) ? (pbFields(b) ?? []).filter(([g]) => g === f).map(([, v]) => v) : [],
    );
  }
  return cur;
}
const pbStr = (buf, p) => {
  const v = buf && pbAll(buf, p)[0];
  return Buffer.isBuffer(v) ? v.toString("utf8") : null;
};
const pbNum = (buf, p) => {
  const v = buf && pbAll(buf, p)[0];
  return typeof v === "number" ? v : null;
};
/** {1: seconds, 2: nanoseconds} → ms. */
const pbTime = (buf, p) => {
  const s = pbNum(buf, `${p}.1`);
  return s === null ? NaN : s * 1000 + Math.floor((pbNum(buf, `${p}.2`) ?? 0) / 1e6);
};
const jsonOr = (s, fallback = {}) => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};
const fileOf = (uri) => {
  try {
    return uri?.startsWith("file:") ? fileURLToPath(uri) : (uri ?? null);
  } catch {
    return null;
  }
};

// Claude Code ---------------------------------------------------------------

export function listClaude(home) {
  const projectsDir = path.join(home, ".claude", "projects");
  const chats = [];
  if (!fs.existsSync(projectsDir)) return chats;
  for (const proj of fs.readdirSync(projectsDir, { withFileTypes: true })) {
    if (!proj.isDirectory()) continue;
    const dir = path.join(projectsDir, proj.name);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith(".jsonl")) continue;
      const sessionId = f.slice(0, -6);
      const mainFile = path.join(dir, f);
      const subDir = path.join(dir, sessionId, "subagents");
      const subFiles = fs.existsSync(subDir)
        ? fs
            .readdirSync(subDir)
            .filter((s) => s.endsWith(".jsonl"))
            .map((s) => path.join(subDir, s))
        : [];
      let bytes = 0;
      let mtime = 0;
      for (const p of [mainFile, ...subFiles]) {
        const st = fs.statSync(p);
        bytes += st.size;
        mtime = Math.max(mtime, st.mtimeMs);
      }
      chats.push({
        sessionId,
        files: 1 + subFiles.length,
        bytes,
        mtime,
        cwd: () => firstCwd(mainFile),
        load: async () => {
          const subs = [];
          for (const file of subFiles) {
            const counts = await scanTranscript(file);
            if (!counts) continue;
            const meta = jsonOr(
              fs.existsSync(file.slice(0, -6) + ".meta.json")
                ? fs.readFileSync(file.slice(0, -6) + ".meta.json", "utf8")
                : "",
            );
            subs.push({ agentType: meta.agentType ?? null, counts });
          }
          return { main: await scanTranscript(mainFile), subs };
        },
      });
    }
  }
  return chats;
}

async function firstCwd(file) {
  let n = 0;
  for await (const d of jsonLines(file)) {
    if (d.cwd) return d.cwd;
    if (++n > 200) break;
  }
  return null;
}

// Codex: $CODEX_HOME/sessions/YYYY/MM/DD/rollout-*.jsonl, subagents in their own files ---------

const isRollout = (name) => name.startsWith("rollout-") && name.endsWith(".jsonl");
const SHELL_TOOLS = new Set([
  "exec_command",
  "shell",
  "shell_command",
  "local_shell",
  "run_command",
  "run_terminal_cmd",
  "Shell",
  "bash",
]);

export async function listCodex(home) {
  const codexHome =
    process.env.CODEX_HOME && home === os.homedir()
      ? process.env.CODEX_HOME
      : path.join(home, ".codex");
  const entries = new Map();
  for (const file of ["sessions", "archived_sessions"].flatMap((d) =>
    walkFiles(path.join(codexHome, d), isRollout),
  )) {
    let meta = null;
    for await (const d of jsonLines(file)) {
      meta = d.type === "session_meta" ? (d.payload ?? null) : null;
      break;
    }
    if (!meta?.id) continue;
    const st = fs.statSync(file);
    // An archived copy of a chat still in sessions/: keep the bigger one.
    if ((entries.get(meta.id)?.size ?? -1) >= st.size) continue;
    const sub = meta.source && typeof meta.source === "object" ? meta.source.subagent : null;
    const spawn = sub && typeof sub === "object" ? sub.thread_spawn : null;
    entries.set(meta.id, {
      id: meta.id,
      file,
      size: st.size,
      mtime: st.mtimeMs,
      cwd: meta.cwd ?? null,
      parent: meta.parent_thread_id ?? spawn?.parent_thread_id ?? null,
      agentType:
        spawn?.agent_role ??
        spawn?.agent_nickname ??
        (typeof sub === "string" ? `codex-${sub}` : null),
    });
  }
  return groupByRoot([...entries.values()], (root, kids) => ({
    cwd: async () => root.cwd,
    load: async () => {
      const subs = [];
      for (const k of kids) {
        const counts = await scanCodex(k.file);
        if (counts) subs.push({ agentType: k.agentType, counts });
      }
      return { main: await scanCodex(root.file), subs };
    },
  }));
}

const codexFailed = (out) =>
  /Process exited with code [1-9]/.test(out) || /^Exit code: [1-9]/m.test(out);
const partsText = (content) =>
  (Array.isArray(content) ? content : [])
    .map((c) => (typeof c === "string" ? c : (c?.text ?? "")))
    .join(" ");

/** One Codex rollout file → counts. One API response = one `token_count` event = one turn. */
export async function scanCodex(file) {
  const t = new Tally();
  let model = null;
  let effort = null;
  let n = 0;
  let lastTotal = null;
  let assistantMsgs = 0;
  let compacted = 0;
  let contextCompacted = 0;
  const prompts = [];
  const userItems = [];
  const id = () => `r${n}`;
  for await (const d of jsonLines(file)) {
    const ms = d.timestamp ? Date.parse(d.timestamp) : NaN;
    t.at(ms);
    const p = d.payload ?? {};
    if (d.type === "session_meta")
      t.meta({ cwd: p.cwd, hostVersion: p.cli_version, entrypoint: p.originator });
    else if (d.type === "turn_context") {
      model = p.model ?? model;
      effort = p.effort ?? effort;
    } else if (d.type === "compacted") {
      compacted++;
      if (typeof p.message === "string") t.summaryText(p.message);
    } else if (d.type === "event_msg") {
      if (p.type === "token_count" && p.info?.last_token_usage) {
        const total = p.info.total_token_usage?.total_tokens;
        // The same response is sometimes reported twice in a row.
        if (total !== undefined && total === lastTotal) continue;
        lastTotal = total;
        const u = p.info.last_token_usage;
        const cached = u.cached_input_tokens ?? 0;
        t.turn(id(), {
          model,
          effort,
          at: ms,
          usage: {
            input: Math.max(0, (u.input_tokens ?? 0) - cached),
            cacheWrite: u.cache_write_input_tokens ?? 0,
            cacheRead: cached,
            output: u.output_tokens ?? 0,
          },
        });
        n++;
      } else if (p.type === "user_message" && typeof p.message === "string")
        prompts.push([p.message, ms]);
      else if (p.type === "context_compacted") contextCompacted++;
    } else if (d.type === "response_item") {
      if (p.type === "function_call" || p.type === "custom_tool_call") {
        const raw = p.type === "function_call" ? (p.arguments ?? "") : String(p.input ?? "");
        const args = p.type === "function_call" ? jsonOr(raw) : {};
        const cmd = args.cmd ?? args.command;
        t.text(id(), raw.length);
        t.toolUse(p.call_id, p.name ?? "?", {
          shell: SHELL_TOOLS.has(p.name) ? [].concat(cmd ?? []).join(" ") : undefined,
        });
      } else if (p.type === "local_shell_call") {
        t.toolUse(p.call_id ?? p.id ?? `ls${n}`, "local_shell", {
          shell: [].concat(p.action?.command ?? []).join(" "),
        });
      } else if (p.type === "web_search_call") t.toolUse(p.id ?? `ws${n}:${ms}`, "web_search");
      else if (p.type === "function_call_output" || p.type === "custom_tool_call_output") {
        const out = typeof p.output === "string" ? p.output : JSON.stringify(p.output ?? "");
        t.toolResult(p.call_id, { isError: codexFailed(out), output: out });
      } else if (p.type === "message" && p.role === "assistant") {
        assistantMsgs++;
        t.text(id(), partsText(p.content).length);
      } else if (p.type === "reasoning") t.text(id(), partsText(p.summary).length);
      else if (p.type === "message" && p.role === "user") {
        const s = partsText(p.content);
        if (!s.trimStart().startsWith("<")) userItems.push([s, ms]);
      }
    }
  }
  // A rollout written before token counts were recorded: one turn per assistant message.
  for (let i = 0; n === 0 && i < assistantMsgs; i++) t.turn(`a${i}`, { model, effort });
  // Chats saved without user_message events keep the prompts only as user items.
  for (const [s, ms] of prompts.length ? prompts : userItems) t.userText(s, ms);
  for (let i = 0; i < Math.max(compacted, contextCompacted); i++) t.compaction();
  return t.done();
}

// opencode: ~/.local/share/opencode/opencode.db, tables session_v2 + session_message ---------

export async function listOpencode(home) {
  const db = await openDb(path.join(home, ".local", "share", "opencode", "opencode.db"));
  if (!db) return [];
  const has = db
    .prepare(
      "select name from sqlite_master where type = 'table' and name in ('session_v2', 'session_message')",
    )
    .all();
  if (has.length < 2) return [];
  const msgStats = new Map(
    db
      .prepare(
        "select session_id, min(time_created) first, max(time_updated) last, sum(length(data)) size from session_message group by session_id",
      )
      .all()
      .map((r) => [r.session_id, r]),
  );
  const entries = [];
  for (const s of db
    .prepare(
      "select id, parent_id, agent, directory, version, time_created, time_updated, time_idle from session_v2",
    )
    .all()) {
    const m = msgStats.get(s.id);
    if (!m) continue;
    entries.push({
      id: s.id,
      parent: s.parent_id ?? null,
      agentType: s.agent ?? null,
      cwd: s.directory,
      version: s.version,
      // A fork starts with a copy of the original's messages: count only the ones after the fork.
      since: m.first < s.time_created ? s.time_created : 0,
      size: m.size ?? 0,
      mtime: Math.max(s.time_updated ?? 0, s.time_idle ?? 0, m.last ?? 0),
    });
  }
  const messages = db.prepare(
    "select type, seq, time_created, data from session_message where session_id = ? and time_created >= ? order by seq",
  );
  return groupByRoot(entries, (root, kids) => ({
    cwd: async () => root.cwd,
    load: async () => ({
      main: scanOpencode(root, messages.all(root.id, root.since)),
      subs: kids
        .map((k) => ({
          agentType: k.agentType,
          counts: scanOpencode(k, messages.all(k.id, k.since)),
        }))
        .filter((s) => s.counts),
    }),
  }));
}

const OPENCODE_SHELL = new Set(["bash", "shell"]);

export function scanOpencode(session, messages) {
  const t = new Tally();
  t.meta({ cwd: session.cwd, hostVersion: session.version, entrypoint: "opencode" });
  for (const row of messages) {
    t.at(row.time_created);
    const d = jsonOr(row.data, null);
    if (!d) continue;
    if (row.type === "assistant") {
      const id = d.id ?? `m${row.seq}`;
      const tk = d.tokens ?? {};
      t.turn(id, {
        model: d.model?.id,
        effort: d.model?.variant,
        at: row.time_created,
        usage: {
          input: tk.input ?? 0,
          cacheWrite: tk.cache?.write ?? 0,
          cacheRead: tk.cache?.read ?? 0,
          output: tk.output ?? 0,
        },
      });
      for (const c of Array.isArray(d.content) ? d.content : []) {
        if (c?.type === "text" || c?.type === "reasoning") t.text(id, (c.text ?? "").length);
        if (c?.type !== "tool") continue;
        const st = c.state ?? {};
        const input = st.input ?? {};
        t.text(id, JSON.stringify(input).length);
        const shell = OPENCODE_SHELL.has(c.name)
          ? input.command
          : c.name === "execute"
            ? input.code
            : undefined;
        t.toolUse(c.id, c.name ?? "?", {
          shell: typeof shell === "string" ? shell : undefined,
          readPath: c.name === "read" ? input.filePath : undefined,
          partial: input.offset !== undefined || input.limit !== undefined,
        });
        const exit = st.metadata?.exit;
        t.toolResult(c.id, {
          isError:
            st.status === "error" ||
            (shell !== undefined && typeof exit === "number" && exit !== 0),
          output: partsText(st.content),
        });
      }
    } else if (row.type === "user" && typeof d.text === "string")
      t.userText(d.text, row.time_created);
    else if (row.type === "compaction") {
      t.compaction();
      if (typeof d.summary === "string") t.summaryText(d.summary);
    }
  }
  return t.done();
}

// Cursor: composer chats in globalStorage/state.vscdb, CLI chats in ~/.cursor/chats/*/*/store.db,
// and plain transcripts in ~/.cursor/projects/*/agent-transcripts for chats whose state is gone ---

/** The 32-byte message hashes of a conversation-state protobuf, as hex. */
const stateHashes = (buf) =>
  (pbFields(buf) ?? [])
    .filter(([f, v]) => f === 1 && Buffer.isBuffer(v) && v.length === 32)
    .map(([, v]) => v.toString("hex"));

export async function listCursor(home) {
  const transcripts = new Map();
  for (const file of walkFiles(path.join(home, ".cursor", "projects"), (n) =>
    n.endsWith(".jsonl"),
  )) {
    if (file.includes(`${path.sep}agent-transcripts${path.sep}`))
      transcripts.set(path.basename(file, ".jsonl"), file);
  }
  const entries = new Map();
  const add = (e) => {
    const t = transcripts.get(e.id);
    if (!e.load && !t) return;
    const st = t ? fs.statSync(t) : null;
    entries.set(e.id, {
      ...e,
      transcript: t ?? null,
      size: (e.size ?? 0) + (st?.size ?? 0),
      mtime: e.generating ? Infinity : Math.max(e.mtime ?? 0, st?.mtimeMs ?? 0),
    });
  };

  const db = await openDb(
    path.join(
      home,
      "Library",
      "Application Support",
      "Cursor",
      "User",
      "globalStorage",
      "state.vscdb",
    ),
  );
  const hasHeaders = db
    ?.prepare("select name from sqlite_master where type = 'table' and name = 'composerHeaders'")
    .all().length;
  if (hasHeaders) {
    const kv = db.prepare("select value from cursorDiskKV where key = ?");
    const value = (key) => {
      const r = kv.get(key);
      return r ? Buffer.from(r.value) : null;
    };
    for (const h of db
      .prepare(
        "select composerId, createdAt, lastUpdatedAt, isSubagent, subagentTypeName, value from composerHeaders",
      )
      .all()) {
      const head = jsonOr(String(h.value ?? ""));
      const data = jsonOr(value(`composerData:${h.composerId}`)?.toString() ?? "", null);
      const state =
        typeof data?.conversationState === "string" && data.conversationState.startsWith("~")
          ? Buffer.from(data.conversationState.slice(1), "base64")
          : null;
      const hashes = state ? stateHashes(state) : [];
      const info = head.subagentInfo ?? {};
      add({
        id: h.composerId,
        parent: h.isSubagent
          ? (info.rootParentConversationId ?? info.parentComposerId ?? null)
          : null,
        agentType: h.subagentTypeName ?? info.subagentTypeName ?? null,
        cwd: pbStr(state, "21.1") ?? head.workspaceIdentifier?.uri?.fsPath ?? null,
        entrypoint: pbStr(state, "22") ?? "ide",
        model: data?.modelConfig?.modelName ?? null,
        start: pbNum(state, "26") ?? h.createdAt ?? head.createdAt,
        end: Math.max(
          h.lastUpdatedAt ?? 0,
          head.conversationCheckpointLastUpdatedAt ?? 0,
          h.createdAt ?? 0,
        ),
        size: data?.conversationState?.length ?? 0,
        mtime: Math.max(
          h.lastUpdatedAt ?? 0,
          head.conversationCheckpointLastUpdatedAt ?? 0,
          h.createdAt ?? 0,
        ),
        generating: (data?.generatingBubbleIds?.length ?? 0) > 0,
        load: hashes.length
          ? () =>
              hashes
                .map((x) => jsonOr(value(`agentKv:blob:${x}`)?.toString() ?? "", null))
                .filter(Boolean)
          : null,
      });
    }
  }

  for (const file of walkFiles(path.join(home, ".cursor", "chats"), (n) => n === "store.db")) {
    const id = path.basename(path.dirname(file));
    if (entries.has(id)) continue;
    const store = await openDb(file);
    if (!store) continue;
    const metaHex = store.prepare("select value from meta where key = '0'").get()?.value;
    const meta = metaHex ? jsonOr(Buffer.from(String(metaHex), "hex").toString()) : {};
    const blob = store.prepare("select data from blobs where id = ?");
    const get = (x) => {
      const r = blob.get(x);
      return r ? Buffer.from(r.data) : null;
    };
    const root = meta.latestRootBlobId ? get(meta.latestRootBlobId) : null;
    const hashes = root ? stateHashes(root) : [];
    const side = jsonOr(
      fs.existsSync(path.join(path.dirname(file), "meta.json"))
        ? fs.readFileSync(path.join(path.dirname(file), "meta.json"), "utf8")
        : "",
    );
    const st = fs.statSync(file);
    add({
      id,
      parent: null,
      agentType: null,
      cwd: pbStr(root, "21.1") ?? side.cwd ?? null,
      entrypoint: pbStr(root, "22") ?? "cli",
      model: null,
      start: side.createdAtMs ?? meta.createdAt ?? st.birthtimeMs,
      end: side.updatedAtMs ?? st.mtimeMs,
      size: st.size,
      mtime: st.mtimeMs,
      load: hashes.length
        ? () => hashes.map((x) => jsonOr(get(x)?.toString() ?? "", null)).filter(Boolean)
        : null,
    });
  }

  // Chats whose state is gone (archived) survive only as transcripts; subagents sit beside them.
  for (const [id, file] of transcripts) {
    if (entries.has(id)) continue;
    const st = fs.statSync(file);
    const parentDir = path.dirname(path.dirname(file));
    const isSub = path.basename(path.dirname(file)) === "subagents";
    add({
      id,
      parent: isSub ? path.basename(parentDir) : null,
      agentType: null,
      cwd: null,
      entrypoint: "ide",
      start: st.birthtimeMs,
      end: st.mtimeMs,
      size: 0,
      mtime: st.mtimeMs,
      load: null,
    });
  }

  return groupByRoot([...entries.values()], (root, kids) => ({
    cwd: async () => root.cwd,
    load: async () => ({
      main: await scanCursor(root),
      subs: (
        await Promise.all(
          kids.map(async (k) => ({ agentType: k.agentType, counts: await scanCursor(k) })),
        )
      ).filter((s) => s.counts),
    }),
  }));
}

const CURSOR_SHELL = new Set(["Shell", "run_terminal_cmd"]);
const userQuery = (s) => s.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/)?.[1] ?? null;

/** Cursor tool name: MCP calls through CallDynamicTool get the `mcp__server` key other hosts use. */
function cursorTool(name, args) {
  return name === "CallDynamicTool" && args?.namespace
    ? `mcp__${args.namespace}__${args.toolName ?? "?"}`
    : (name ?? "?");
}

/** One Cursor chat → counts. Cursor records no token counts; times are the chat's first and last. */
export async function scanCursor(e) {
  const t = new Tally();
  t.meta({ cwd: e.cwd, entrypoint: e.entrypoint });
  t.at(e.start);
  t.at(e.end);
  let model = e.model;
  let n = 0;
  const user = (s) => {
    if (s.includes("Your conversation was summarized")) {
      t.compaction();
      t.summaryText(s);
    } else if (s.includes("<cursor_commands>")) t.userText(s);
    else {
      const q = userQuery(s);
      if (q) t.userText(q);
    }
  };
  if (e.load) {
    for (const m of e.load()) {
      const parts = Array.isArray(m.content)
        ? m.content
        : [{ type: "text", text: String(m.content ?? "") }];
      if (m.role === "assistant") {
        const id = `a${n++}`;
        model =
          parts.find((p) => p?.providerOptions?.cursor?.modelName)?.providerOptions.cursor
            .modelName ?? model;
        t.turn(id, { model });
        for (const p of parts) {
          if (p?.type === "text" || p?.type === "reasoning") t.text(id, (p.text ?? "").length);
          else if (p?.type === "tool-call") {
            const args = p.args ?? {};
            t.text(id, JSON.stringify(args).length);
            t.toolUse(p.toolCallId, cursorTool(p.toolName, args), {
              shell: CURSOR_SHELL.has(p.toolName) ? args.command : undefined,
              readPath: p.toolName === "Read" ? args.path : undefined,
              partial: args.offset !== undefined || args.limit !== undefined,
            });
          }
        }
      } else if (m.role === "tool") {
        const hl = m.providerOptions?.cursor?.highLevelToolCallResult;
        const failed = Boolean(hl?.isError) || Boolean(hl?.output && !("success" in hl.output));
        for (const p of parts)
          if (p?.type === "tool-result")
            t.toolResult(p.toolCallId, { isError: failed, output: p.result });
      } else if (m.role === "user") {
        if (m.providerOptions?.cursor?.isSummary) {
          t.compaction();
          t.summaryText(partsText(parts));
        } else user(partsText(parts));
      }
    }
  } else if (e.transcript) {
    // Transcripts keep only the messages: no model, no tool results, no times.
    let u = 0;
    for await (const d of jsonLines(e.transcript)) {
      const parts = d.message?.content ?? [];
      if (d.role === "assistant") {
        const id = `a${n++}`;
        t.turn(id, { model });
        for (const p of parts) {
          if (p?.type === "text") t.text(id, (p.text ?? "").length);
          else if (p?.type === "tool_use") {
            const args = p.input ?? {};
            t.text(id, JSON.stringify(args).length);
            t.toolUse(`${id}:${u++}`, cursorTool(p.name, args), {
              shell: CURSOR_SHELL.has(p.name) ? args.command : undefined,
              readPath: p.name === "Read" ? args.path : undefined,
              partial: args.offset !== undefined || args.limit !== undefined,
            });
          }
        }
      } else if (d.role === "user") user(partsText(parts));
    }
  }
  return t.done();
}

// Google Antigravity: ~/.gemini/antigravity*/conversations/<id>.db (SQLite holding protobuf) ----

const ANTIGRAVITY_ROOTS = ["antigravity", "antigravity-ide", "antigravity-cli"];

export function listAntigravity(home) {
  const entries = new Map();
  for (const root of ANTIGRAVITY_ROOTS) {
    const dir = path.join(home, ".gemini", root, "conversations");
    for (const file of walkFiles(dir, (n) => n.endsWith(".db"))) {
      if (path.dirname(file) !== dir) continue;
      const id = path.basename(file, ".db");
      // An empty -wal is not a change: SQLite leaves one behind after a clean close.
      const sts = [file, ...(walSize(file) ? [`${file}-wal`] : [])].map((f) => fs.statSync(f));
      const size = sts.reduce((a, s) => a + s.size, 0);
      if ((entries.get(id)?.size ?? -1) >= size) continue;
      entries.set(id, { id, file, root, size, mtime: Math.max(...sts.map((s) => s.mtimeMs)) });
    }
  }
  return [...entries.values()].map((e) => ({
    sessionId: e.id,
    files: 1,
    bytes: e.size,
    mtime: e.mtime,
    cwd: async () => (await antigravityMeta(e.file))?.cwd ?? null,
    load: async () => ({ main: await scanAntigravity(e.file, e.root), subs: [] }),
  }));
}

async function antigravityMeta(file) {
  const db = await openDb(file);
  const row = db?.prepare("select data from trajectory_metadata_blob limit 1").get();
  if (!row) return null;
  const b = Buffer.from(row.data);
  return { cwd: fileOf(pbStr(b, "1.1")), slug: pbStr(b, "1.3.1"), created: pbTime(b, "2") };
}

/** One Antigravity chat → counts. Turns and tokens come from gen_metadata, one row per model call. */
export async function scanAntigravity(file, root) {
  const db = await openDb(file);
  if (!db) return null;
  const tables = new Set(
    db
      .prepare("select name from sqlite_master where type = 'table'")
      .all()
      .map((r) => r.name),
  );
  if (!tables.has("steps") || !tables.has("gen_metadata")) return null;
  const t = new Tally();
  const meta = await antigravityMeta(file);
  t.meta({ cwd: meta?.cwd, entrypoint: root });
  t.slugHint = meta?.slug ?? null;
  t.at(meta?.created);
  for (const g of db.prepare("select idx, data from gen_metadata order by idx").all()) {
    const b = Buffer.from(g.data);
    t.turn(`g${g.idx}`, {
      model: pbStr(b, "1.19"),
      usage: {
        input: pbNum(b, "1.4.2") ?? 0,
        cacheWrite: pbNum(b, "1.4.4") ?? 0,
        cacheRead: pbNum(b, "1.4.5") ?? 0,
        output: pbNum(b, "1.4.3") ?? 0,
      },
    });
  }
  for (const s of db
    .prepare("select idx, step_type, status, metadata, step_payload from steps order by idx")
    .all()) {
    const md = s.metadata ? Buffer.from(s.metadata) : null;
    const pay = s.step_payload ? Buffer.from(s.step_payload) : null;
    const ms = pbTime(md, "1");
    t.at(ms);
    if (s.step_type === 14) {
      const text = pbStr(pay, "19.2");
      if (text) t.userText(text, ms);
    } else if (s.step_type === 15) {
      t.text(null, (pbStr(pay, "20.3") ?? "").length);
      for (const call of pbAll(pay ?? Buffer.alloc(0), "20.7")) {
        const name = pbStr(call, "2") ?? "?";
        const raw = pbStr(call, "3") ?? "";
        const args = jsonOr(raw);
        t.text(null, raw.length);
        t.toolUse(pbStr(call, "1"), name, {
          shell: name === "run_command" ? args.CommandLine : undefined,
          readPath: name === "view_file" ? args.AbsolutePath : undefined,
          partial: args.StartLine !== undefined || args.EndLine !== undefined,
        });
      }
    } else if (s.step_type === 101) t.closeOutput(pbStr(pay, "114.2.2") ?? "");
    else {
      const useId = pbStr(md, "4.1");
      if (!useId) continue;
      const exit = s.step_type === 21 ? pbNum(pay, "28.6") : null;
      t.toolResult(useId, {
        isError: s.status === 7 || (exit !== null && exit !== 0),
        output: s.step_type === 21 ? pbStr(pay, "28.21.1") : undefined,
      });
    }
  }
  return t.done();
}

/** Every host the script reads, by the `platform` its rows carry. */
export const HOSTS = {
  "claude-code": listClaude,
  codex: listCodex,
  opencode: listOpencode,
  cursor: listCursor,
  antigravity: listAntigravity,
};

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

/**
 * @param {{platform: string, list: () => Promise<object[]>|object[]}[]} hosts
 * @param {string|null} checkout  this checkout's root: its run logs are read with those of every
 *   repo a chat ran in
 * Returns the rows appended, per platform what was found and skipped, and the same for runs.
 */
export async function scan({
  hosts,
  statsFile,
  settleHours,
  checkout = null,
  now = Date.now(),
  dryRun = false,
  log = console.error,
}) {
  const ledger = readLedger(statsFile);
  const known = latestChats(ledger);
  const settledBefore = now - settleHours * HOUR_MS;
  const rows = [];
  const byPlatform = {};
  const roots = [checkout];
  // Every chat is listed before any is read: its row splits it across the runs of every repo found.
  const changed = [];
  for (const { platform, list } of hosts) {
    const s = (byPlatform[platform] = {
      found: 0,
      appended: 0,
      open: 0,
      unchanged: 0,
      empty: 0,
      error: null,
    });
    try {
      for (const chat of await list()) {
        s.found++;
        roots.push(resolveRepo(await chat.cwd()).root);
        // A host writing right now reports Infinity: open.
        const settled = chat.mtime <= settledBefore;
        if (!settled) s.open++;
        const was = known.get(`${platform}:${chat.sessionId}`);
        // A row from before the split across runs is read again.
        if (
          was?.scan?.bytes === chat.bytes &&
          (was.scan?.settled ?? true) === settled &&
          was.usage?.byRun !== undefined
        ) {
          s.unchanged++;
          continue;
        }
        changed.push({ platform, chat, settled });
      }
    } catch (err) {
      s.error = err instanceof Error ? err.message : String(err);
    }
  }
  const windows = runWindows(roots);
  for (const { platform, chat, settled } of changed) {
    const s = byPlatform[platform];
    try {
      const { main, subs } = await chat.load();
      if (!main) {
        s.empty++;
        continue;
      }
      let repo = resolveRepo(main.cwd);
      if (repo.slug === "none" && main.slugHint) repo = { slug: main.slugHint, root: null };
      const row = chatRow(
        platform,
        chat.sessionId,
        main,
        subs,
        repo,
        versionHistory(repo.root),
        chat,
        windows,
      );
      row.time.lastActivity = Number.isFinite(chat.mtime) ? Math.round(chat.mtime) : now;
      const { files, bytes, tokensRecorded } = row.scan;
      row.scan = { files, bytes, settled, tokensRecorded };
      rows.push(row);
      s.appended++;
    } catch (err) {
      s.error = err instanceof Error ? err.message : String(err);
    }
  }
  // Chats counted before and in this scan, newest row per chat.
  const chats = new Map(known);
  for (const r of rows) chats.set(r.key, r);
  const runs = scanRuns({
    roots,
    known: latestRows(ledger, "run"),
    settledBefore,
    now,
    chats: chats.values(),
  });
  rows.push(...runs.rows);
  rows.sort((a, b) => a.ts - b.ts);
  // Every total was computed from its parts as the row was built; a row whose totals still do
  // not match is not written.
  const kept = writableRows(rows, log);
  if (!dryRun) appendRows(statsFile, kept);
  return { rows: kept, refused: rows.length - kept.length, byPlatform, runs: runs.stats };
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

/** A row a workflow wrote, not one this script wrote (`chat`, `run`). */
const workflowRow = (r) =>
  Boolean(r) && typeof r === "object" && r.kind !== "chat" && r.kind !== "run";

/** fp → readable name, for every repo found on this machine and every issue up to the max. */
/**
 * The complexity check's own reason, quoted from its report on this machine: the first paragraph
 * of `## Session Fit Estimate`, cut to 160 characters. Null when the folder or section is missing.
 */
export function checkReason(dir) {
  const text = dir ? readIf(path.join(dir, "plan-complexity-check.md")) : null;
  const para = text
    ?.match(/(?:^|\n)## Session Fit Estimate[ \t]*\n+([\s\S]*?)(?=\n[ \t]*\n|\n#|$)/)?.[1]
    ?.replace(/\s+/g, " ")
    .trim();
  if (!para) return null;
  const cut = para.length > 160 ? `${para.slice(0, 159)}…` : para;
  return cut.replace(/\|/g, "\\|");
}

/** `run` row `fid` → its run-log folder, for every repo resolved so far: the report reads reports there. */
export function logDirIndex() {
  const dirs = new Map();
  for (const { slug, root } of repoCache.values())
    if (root)
      for (const dir of runLogDirs(root))
        dirs.set(fingerprint(`${slug}:${path.basename(dir)}`), dir);
  return dirs;
}

export async function buildLookup(hosts, ledgerRows) {
  const slugs = new Set(
    ledgerRows
      .filter((r) => workflowRow(r) && typeof r.repo === "string")
      .map((r) => r.repo),
  );
  slugs.add("none");
  for (const { list } of hosts) {
    try {
      for (const chat of await list()) slugs.add(resolveRepo(await chat.cwd()).slug);
    } catch {
      // a host that cannot be listed adds no names
    }
  }
  for (const { slug } of repoCache.values()) slugs.add(slug);
  const names = new Map();
  for (const s of slugs) names.set(repoFp(s), s === "none" ? "(no repo)" : s.split("/").pop());
  for (const { slug, root } of repoCache.values()) {
    if (!root) continue;
    for (const dir of runLogDirs(root)) {
      names.set(fingerprint(`${slug}:${path.basename(dir)}`), path.basename(dir));
    }
  }
  const wanted = new Set(
    ledgerRows
      .map(normalize)
      .flatMap((r) =>
        r?.kind === "chat"
          ? [r.issue?.id, ...(r.issue?.all ?? []), ...(r.issue?.mentioned ?? [])]
          : r?.kind === "run"
            ? [r.run?.issue]
            : [],
      ),
  );
  wanted.delete(undefined);
  wanted.delete(null);
  for (const s of slugs) {
    const short = names.get(repoFp(s));
    for (let n = 1; n <= ISSUE_LOOKUP_MAX && wanted.size; n++) {
      const fp = issueFp(s, n);
      if (wanted.has(fp)) {
        names.set(fp, `${short}#${n}`);
        wanted.delete(fp);
      }
    }
  }
  return names;
}

const median = (xs) => quantile(xs, 0.5);
function quantile(xs, q) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.round(q * (s.length - 1)))];
}
const M = (n) => (n / 1e6).toFixed(1);
/**
 * One name per model across hosts: `anthropic/claude-opus-5.5` (OpenRouter), `claude-opus-5-5-high-fast`
 * (Cursor: effort and speed in the name) and `claude-opus-5-5` all → `claude-opus-5-5`. Rows keep the host's name.
 */
export function modelFamily(model) {
  if (!model || model === "?") return "(not recorded)";
  let m = model
    .toLowerCase()
    .replace(/^.*\//, "")
    .replace(/^cursor-/, "");
  m = m.replace(/(\d)\.(\d)/g, "$1-$2");
  for (;;) {
    const next = m.replace(/-(?:low|medium|high|xhigh|max|fast|thinking|default)$/, "");
    if (next === m) return m;
    m = next;
  }
}
/** A row written before its chat or run settled: counted in totals and lists, not in medians. */
const isOpen = (r) => r.scan?.settled === false;
const settledOnly = (rs) => rs.filter((r) => !isOpen(r));
const openMark = (r) => (isOpen(r) ? " (open)" : "");
/** Tokens read of the settled chats whose host records token counts (Cursor does not). */
const readsOf = (rs) =>
  settledOnly(rs)
    .filter((c) => c.scan?.tokensRecorded !== false)
    .map((c) => c.usage.total.tokens.read);
const medRead = (rs, q = 0.5) => {
  const xs = readsOf(rs);
  return xs.length ? M(quantile(xs, q)) : "-";
};
const pct = (n) => `${(100 * n).toFixed(0)}%`;
const day = (ms) => new Date(ms).toLocaleDateString("en-CA");
/** Rows whose host records token counts. */
const counted = (rs) => rs.filter((c) => c.scan?.tokensRecorded !== false);
/** Token types summed over chats: fresh input, cache written, cache read, read, written (est.). */
function tokenTypes(rs) {
  const t = { input: 0, cacheWrite: 0, cacheRead: 0, read: 0, outputEst: 0 };
  for (const c of counted(rs)) for (const k of Object.keys(t)) t[k] += c.usage.total.tokens[k] ?? 0;
  return t;
}
/** Shorthands for a chat row's usage. */
const readOf = (c) => c.usage.total.tokens.read;
const turnsOf = (c) => c.usage.total.turns;
const compactionsOf = (c) => c.usage.total.compactions;
/** Share of tokens read that came from the cache; "-" with nothing read. */
const cacheShare = (t) => (t.read ? pct(t.cacheRead / t.read) : "-");
const minutesOf = (ms) => Math.round(ms / 60000);

/** ISO week of a local date: `2026-W43`, with its Monday. */
export function isoWeek(ms) {
  const d = new Date(ms);
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (local.getDay() + 6) % 7;
  const monday = new Date(local.getTime() - dow * DAY_MS);
  const thursday = new Date(monday.getTime() + 3 * DAY_MS);
  const jan1 = new Date(thursday.getFullYear(), 0, 1);
  const week = 1 + Math.floor((thursday - jan1) / (7 * DAY_MS));
  return {
    key: `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`,
    monday: day(monday.getTime()),
  };
}

/** Chat kinds the report groups by. bkit / other subagents are told apart by agent type name. */
export function chatClass(row) {
  const r = normalize(row);
  if (r.bkit?.via?.includes("command") && r.bkit.workflows?.length) {
    const agents = Object.entries(r.agents?.byAgent ?? {});
    const bkitN = sumOf(agents.filter(([t]) => t.startsWith("bkit-")).map(([, a]) => a.n));
    const otherN = sumOf(agents.filter(([t]) => !t.startsWith("bkit-")).map(([, a]) => a.n));
    return otherN > bkitN ? "workbench" : "workflow";
  }
  if (r.bkit?.via?.length) return "bkit agents only";
  return "other";
}

/** Links for each chat: exact / time / issue, plus the version the links imply. */
export function linkChats(chatRows, ledgerRows) {
  const chats = chatRows.map(normalize);
  const rows = ledgerRows.filter(workflowRow).map(normalize);
  const kept = new Set(latestOutcomes(rows));
  const others = rows.filter((r) => r.kind !== "outcome" || kept.has(r));
  const bySha = new Map();
  for (const r of others) {
    const sha = r.run?.parentSha;
    if (sha) (bySha.get(sha) ?? bySha.set(sha, []).get(sha)).push(r);
  }
  const issuesOf = (c) => uniq([...(c.issue?.all ?? []), ...(c.issue?.mentioned ?? [])]);
  const byIssue = new Map();
  for (const c of chats)
    for (const fp of issuesOf(c)) (byIssue.get(fp) ?? byIssue.set(fp, []).get(fp)).push(c);
  const links = new Map();
  for (const c of chats) {
    const exact = (c.run?.parentShas ?? []).flatMap((s) => bySha.get(s) ?? []);
    const wfs = c.bkit?.workflows ?? [];
    // A workflow chat links only to rows of its own workflows: a long chat overlaps other runs.
    const time = others.filter(
      (r) =>
        repoFp(r.repo) === c.repo &&
        r.ts >= c.time.start &&
        r.ts <= c.time.end + TIME_LINK_GRACE_MS &&
        (!wfs.length || wfs.includes(r.by?.workflow)),
    );
    const issue = uniq(issuesOf(c).flatMap((fp) => byIssue.get(fp) ?? [])).filter(
      (o) => o.key !== c.key,
    );
    let version = c.bkit?.version ?? null;
    let versionSource = c.bkit?.versionSource ?? "none";
    if (version === null) {
      const from = [
        ["exact", exact],
        ["time", time],
        ["issue", issue.filter((o) => o.bkit?.version)],
      ].find(([, rs]) => rs.length);
      if (from) {
        version = from[1][0].bkit?.version ?? null;
        versionSource = from[0];
      }
    }
    links.set(c.key, { exact, time, issue, version, versionSource });
  }
  return links;
}

function table(head, rows) {
  if (!rows.length) return "_none yet_\n";
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...rows.map(line)].join("\n") + "\n";
}

/**
 * @param {object[]} ledgerRows  every row of `harvest/stats.jsonl`: the chats and runs this script
 *   wrote, and the workflow rows the ledger step copied from every repo's `.bkit/stats.jsonl`
 * @param {Map<string, string>} names  buildLookup()
 * @param {Map<string, string>} logDirs  logDirIndex(): where the report quotes run-log reports from
 */
export function renderReport(ledgerRows, names, now = Date.now(), logDirs = new Map()) {
  // Every row in the schema-2 shape, whichever format it was written in.
  ledgerRows = ledgerRows.map(normalize);
  const chats = [...latestChats(ledgerRows).values()].sort((a, b) => a.time.start - b.time.start);
  const links = linkChats(chats, ledgerRows);
  const name = (fp) => (fp ? (names.get(fp) ?? fp) : "-");
  const versionOf = (c) => links.get(c.key).version;
  const wfKey = (c) => c.bkit.workflows.join("+");
  const workflowRuns = chats.filter((c) => chatClass(c) === "workflow");
  const out = [];

  out.push("# Harvest stats\n");
  if (!chats.length) {
    out.push("No `chat` rows in `harvest/stats.jsonl` yet. Run `pnpm harvest`.\n");
    return out.join("\n");
  }
  out.push(
    `Generated ${new Date(now).toISOString().slice(0, 16).replace("T", " ")} UTC from ${chats.length} chats ` +
      `(${day(chats[0].time.start)} to ${day(chats.at(-1).time.start)}) by \`scripts/harvest/bkit-harvest.mjs\`, across every repo. ` +
      "Each repo's own report is its `.bkit/stats.md` (`bkit stats`). " +
      "This file is local and gitignored, like all of `harvest/`: it shows the repo names and issue numbers that `harvest/stats.jsonl` stores only as fingerprints.\n",
  );
  out.push(
    "- A **chat** is one session in one host (Claude Code, Codex, opencode, Cursor, Antigravity) plus all its subagents. **Tokens read** is the context sent on each turn, added up over every turn. " +
      "Cursor records no token counts: its chats count everywhere except in token medians.\n" +
      "- **Workflow run**: a `/bkit-*` command ran in the chat. **Workbench**: a workflow chat where non-bkit subagents outnumber bkit ones (reused by hand afterwards); left out of the workflow medians. " +
      "**bkit agents only**: bkit subagents ran but no `/bkit-*` command. **Other**: no bkit at all; medians use chats of " +
      `${OTHER_MIN_TURNS} turns or more.\n` +
      "- **Turns** are model calls. Output tokens are not shown: Claude Code's subagent transcripts record them about 12 times too low. " +
      "**Written, est.** is the text, thinking and tool input the model wrote, at 4 characters a token.\n" +
      "- Tokens read come in three types. **Fresh input** was sent without the cache. **Cache written** was sent and stored in the cache. **Cache read** came out of the cache. " +
      "On a subscription these cost nothing extra, so the report shows tokens, not dollars; the cache-read share says how much of each turn's context the host reused.\n" +
      "- **Run** rows come from the run logs (`docs/plans/<month>/logs/<feature>/status.jsonl`) of every repo a chat ran in: one row per workflow run, with its steps, verify rounds, challenge findings and plan shape.\n",
  );

  // Week by week
  const weeks = new Map();
  for (const c of chats) {
    const w = isoWeek(c.time.start);
    (weeks.get(w.key) ?? weeks.set(w.key, { ...w, chats: [] }).get(w.key)).chats.push(c);
  }
  const weekList = [...weeks.values()].sort((a, b) => b.key.localeCompare(a.key));
  out.push("## Week by week\n");
  out.push(
    table(
      [
        "Week",
        "bkit versions in use",
        "Chats",
        "Workflow runs",
        "Workbench",
        "bkit agents only",
        "Other",
        "Tokens read, M",
        "Workflow run median, M",
        "Other median, M",
        "Compactions",
      ],
      weekList.map((w) => {
        const by = (k) => w.chats.filter((c) => chatClass(c) === k);
        const versions = new Map();
        for (const c of w.chats) {
          const v = versionOf(c);
          if (v === null) continue;
          (
            versions.get(name(c.repo)) ?? versions.set(name(c.repo), new Set()).get(name(c.repo))
          ).add(v);
        }
        const vtext =
          [...versions].map(([repo, vs]) => `${repo} ${[...vs].sort().join(", ")}`).join(" · ") ||
          "-";
        const other = by("other").filter((c) => turnsOf(c) >= OTHER_MIN_TURNS);
        return [
          `${w.key} (${w.monday})`,
          vtext,
          w.chats.length,
          by("workflow").length,
          by("workbench").length,
          by("bkit agents only").length,
          by("other").length,
          M(w.chats.reduce((a, c) => a + readOf(c), 0)),
          medRead(by("workflow")),
          medRead(other),
          w.chats.reduce((a, c) => a + compactionsOf(c), 0),
        ];
      }),
    ),
  );

  const wfNames = uniq(workflowRuns.map(wfKey)).sort();
  out.push("### Workflow runs by week\n\nEach cell: runs · median tokens read, M.\n");
  out.push(
    table(
      ["Week", ...wfNames],
      weekList.map((w) => [
        `${w.key} (${w.monday})`,
        ...wfNames.map((k) => {
          const rs = w.chats.filter((c) => chatClass(c) === "workflow" && wfKey(c) === k);
          return rs.length ? `${rs.length} · ${medRead(rs)}` : "-";
        }),
      ]),
    ),
  );

  out.push("### Tokens by type, by week\n\nAll chats with token counts. M = millions of tokens.\n");
  out.push(
    table(
      [
        "Week",
        "Tokens read, M",
        "Fresh input, M",
        "Cache written, M",
        "Cache read, M",
        "Cache-read share",
        "Workflow runs' cache-read share",
        "Written, est. M",
      ],
      weekList.map((w) => {
        const t = tokenTypes(w.chats);
        if (!counted(w.chats).length) return [`${w.key} (${w.monday})`, ...Array(7).fill("-")];
        return [
          `${w.key} (${w.monday})`,
          M(t.read),
          M(t.input),
          M(t.cacheWrite),
          M(t.cacheRead),
          cacheShare(t),
          cacheShare(tokenTypes(w.chats.filter((c) => chatClass(c) === "workflow"))),
          M(t.outputEst),
        ];
      }),
    ),
  );

  // By bkit version
  out.push(
    "## By bkit version\n\nWorkflow runs only. The version is the one installed in the chat's repo when the chat started.\n",
  );
  const groups = new Map();
  for (const c of workflowRuns) {
    const k = `${versionOf(c) ?? "none"}\u0000${wfKey(c)}`;
    (groups.get(k) ?? groups.set(k, []).get(k)).push(c);
  }
  const semver = (v) =>
    v
      .split(/[.-]/)
      .map((p) => (/^\d+$/.test(p) ? p.padStart(6, "0") : p))
      .join(".");
  out.push(
    table(
      [
        "bkit version",
        "Workflow",
        "Runs",
        "Tokens read median, M",
        "p90, M",
        "Fresh input median, M",
        "Cache-read share",
        "Turns median",
        "Subagents median",
        "Orchestrator share",
        "Compactions per run",
        "Abort handovers",
      ],
      [...groups]
        .sort(([a], [b]) => semver(b).localeCompare(semver(a)))
        .map(([k, rs]) => {
          const [v, wf] = k.split("\u0000");
          return [
            v,
            wf,
            rs.length,
            medRead(rs),
            medRead(rs, 0.9),
            readsOf(rs).length
              ? M(median(settledOnly(counted(rs)).map((c) => c.usage.total.tokens.input)))
              : "-",
            cacheShare(tokenTypes(rs)),
            settledOnly(rs).length ? median(settledOnly(rs).map(turnsOf)) : "-",
            settledOnly(rs).length ? median(settledOnly(rs).map((c) => c.agents.total.n)) : "-",
            readsOf(rs).length
              ? pct(
                  median(
                    counted(settledOnly(rs)).map(
                      (c) => c.usage.main.tokens.read / Math.max(1, readOf(c)),
                    ),
                  ),
                )
              : "-",
            (rs.reduce((a, c) => a + compactionsOf(c), 0) / rs.length).toFixed(1),
            rs.reduce((a, c) => a + (c.agents.byAgent["bkit-debug-abort-handover"]?.n ?? 0), 0),
          ];
        }),
    ),
  );

  // By platform
  const platforms = uniq(chats.map((c) => c.session.platform)).sort();
  out.push(
    "## By platform\n\nThe host the chat ran in. Each cell in the weekly table: chats · tokens read, M.\n",
  );
  out.push(
    table(
      [
        "Platform",
        "Chats",
        "Workflow runs",
        "Other",
        "Tokens read, M",
        "Workflow run median, M",
        "Host versions",
        "Chats without token counts",
      ],
      platforms.map((p) => {
        const rs = chats.filter((c) => c.session.platform === p);
        const wf = rs.filter((c) => chatClass(c) === "workflow");
        const versions = uniq(rs.map((c) => c.session.hostVersion).filter(Boolean)).sort((a, b) =>
          semver(b).localeCompare(semver(a)),
        );
        return [
          p,
          rs.length,
          wf.length,
          rs.filter((c) => chatClass(c) === "other").length,
          M(rs.reduce((a, c) => a + readOf(c), 0)),
          medRead(wf),
          versions.slice(0, 3).join(", ") +
            (versions.length > 3 ? ` (+${versions.length - 3})` : "") || "-",
          rs.filter((c) => c.scan?.tokensRecorded === false).length,
        ];
      }),
    ),
  );
  if (platforms.length > 1) {
    out.push(
      table(
        ["Week", ...platforms],
        weekList.map((w) => [
          `${w.key} (${w.monday})`,
          ...platforms.map((p) => {
            const rs = w.chats.filter((c) => c.session.platform === p);
            return rs.length ? `${rs.length} · ${M(rs.reduce((a, c) => a + readOf(c), 0))}` : "-";
          }),
        ]),
      ),
    );
  }

  // By model
  const byModel = new Map();
  for (const c of chats) {
    const counted = new Set();
    for (const [raw, m] of Object.entries(c.usage.byModel)) {
      const model = modelFamily(raw);
      const g =
        byModel.get(model) ??
        byModel
          .set(model, {
            chats: 0,
            workflowChats: 0,
            turns: 0,
            read: 0,
            input: 0,
            cacheWrite: 0,
            cacheRead: 0,
            output: 0,
            outputEst: 0,
            platforms: new Set(),
            names: new Set(),
            weeks: new Map(),
          })
          .get(model);
      g.names.add(raw === "?" ? "-" : raw);
      if (!counted.has(model)) {
        counted.add(model);
        g.chats++;
        if (chatClass(c) === "workflow") g.workflowChats++;
      }
      g.turns += m.turns;
      for (const k of TOKEN_KEYS) g[k] += m.tokens[k];
      g.platforms.add(c.session.platform);
      const wk = isoWeek(c.time.start).key;
      g.weeks.set(wk, (g.weeks.get(wk) ?? 0) + m.tokens.read);
    }
  }
  const allRead = [...byModel.values()].reduce((a, g) => a + g.read, 0) || 1;
  const models = [...byModel].sort(([, a], [, b]) => b.read - a.read || b.turns - a.turns);
  out.push(
    "## By model\n\nEvery turn counted under the model that answered it, subagents included. One row per model; **As named** lists how each host spells it.\n",
  );
  out.push(
    table(
      [
        "Model",
        "As named",
        "Platforms",
        "Chats",
        "In workflow runs",
        "Turns",
        "Tokens read, M",
        "Share",
        "Fresh input, M",
        "Cache written, M",
        "Cache read, M",
        "Cache-read share",
        "Written, est. k",
      ],
      models.map(([model, g]) => [
        model,
        [...g.names].sort().slice(0, 4).join(", ") +
          (g.names.size > 4 ? ` (+${g.names.size - 4})` : ""),
        [...g.platforms].sort().join(", "),
        g.chats,
        g.workflowChats,
        g.turns,
        M(g.read),
        pct(g.read / allRead),
        M(g.input),
        M(g.cacheWrite),
        M(g.cacheRead),
        cacheShare(g),
        Math.round(g.outputEst / 1000),
      ]),
    ),
  );
  const topModels = models.slice(0, 6).map(([m]) => m);
  if (topModels.length > 1) {
    out.push("### Models by week\n\nTokens read, M, for the six models that read the most.\n");
    out.push(
      table(
        ["Week", ...topModels],
        weekList.map((w) => [
          `${w.key} (${w.monday})`,
          ...topModels.map((m) => {
            const v = byModel.get(m).weeks.get(w.key);
            return v ? M(v) : "-";
          }),
        ]),
      ),
    );
  }

  // Where tokens go
  out.push("## Where workflow tokens go\n\nWorkflow runs, all weeks, summed per agent type.\n");
  for (const wf of wfNames) {
    const rs = workflowRuns.filter((c) => wfKey(c) === wf);
    const total = rs.reduce((a, c) => a + readOf(c), 0) || 1;
    const agg = new Map([["main session", { read: 0, n: 0, turns: 0 }]]);
    for (const c of rs) {
      const m = agg.get("main session");
      m.read += c.usage.main.tokens.read;
      m.n++;
      m.turns += c.usage.main.turns;
      for (const [t, a] of Object.entries(c.agents.byAgent)) {
        const g = agg.get(t) ?? agg.set(t, { read: 0, n: 0, turns: 0 }).get(t);
        g.read += a.usage.tokens.read;
        g.n += a.n;
        g.turns += a.usage.turns;
      }
    }
    out.push(`### ${wf} (${rs.length} runs)\n`);
    out.push(
      table(
        ["Agent", "Share", "Agents", "Turns"],
        [...agg]
          .sort(([, a], [, b]) => b.read - a.read)
          .slice(0, 12)
          .map(([t, g]) => [t, pct(g.read / total), g.n, g.turns]),
      ),
    );
  }

  // Agents
  out.push(
    "## Agents\n\n" +
      `Every bkit agent type across all chats, plus the main session of workflow runs. **Over ${REPORT_CONTEXT_COLUMNS.map((n) => `${n / 1000}k`).join(" / ")}**: agents whose largest turn sent at least that much context (from the stored peaks; the lines are this report's choice). **Turn-10 context**: median context an agent sent on its 10th model call (agents with fewer calls left out). **Plan reads**: reads of a plan file, whole / a line range. ` +
      "Tool columns are calls per agent: **grep** = Grep tool + `grep`/`rg`, **sed / cat** = those shell reads, **find / ls** = Glob + those shell lists, **tests** = test-runner commands, **Serena** = Serena MCP calls.\n",
  );
  const agentAgg = new Map();
  /**
   * a = {usage: {turns, tokens, context: {peak}, compactions}, peaks: [contextPeak per agent],
   * at10: [contextAt10 per agent], planReads?: {full, partial}, mix}.
   */
  const addAgent = (type, a, n) => {
    const g =
      agentAgg.get(type) ??
      agentAgg
        .set(type, {
          n: 0,
          read: 0,
          cacheRead: 0,
          input: 0,
          turns: 0,
          contextPeakMax: 0,
          contextPeaks: [],
          at10: [],
          planReads: { full: 0, partial: 0 },
          compactions: 0,
          mix: {},
          counted: true,
        })
        .get(type);
    g.n += n;
    for (const k of ["read", "cacheRead", "input"]) g[k] += a.usage.tokens[k] ?? 0;
    g.turns += a.usage.turns ?? 0;
    g.compactions += a.usage.compactions ?? 0;
    g.contextPeaks.push(...a.peaks);
    g.contextPeakMax = Math.max(g.contextPeakMax, a.usage.context?.peak ?? 0);
    g.at10.push(...(a.at10 ?? []).filter((v) => typeof v === "number"));
    g.planReads.full += a.planReads?.full ?? 0;
    g.planReads.partial += a.planReads?.partial ?? 0;
    // Rows written before per-agent tool counts were stored have no `mix`.
    if (!a.mix) g.counted = false;
    for (const [k, v] of Object.entries(a.mix ?? {})) bump(g.mix, k, v);
  };
  for (const c of counted(chats)) {
    for (const [t, a] of Object.entries(c.agents.byAgent))
      if (t.startsWith("bkit-"))
        addAgent(
          t,
          {
            usage: a.usage,
            peaks: a.instances.map((i) => i.contextPeak),
            at10: a.instances.map((i) => i.contextAt10),
            planReads: a.planReads,
            mix: a.mix,
          },
          a.n,
        );
    if (chatClass(c) === "workflow") {
      const m = c.usage.main;
      addAgent("main session (workflow runs)", { usage: m, peaks: [m.context.peak], mix: m.mix }, 1);
    }
  }
  const per = (g, k) => (g.counted && g.n ? (g.mix[k] ?? 0) / g.n : null);
  const one = (v) => (v === null ? "-" : v.toFixed(1));
  out.push(
    table(
      [
        "Agent",
        "Agents",
        "Tokens read per agent, M",
        "Cache-read share",
        "Turns per agent",
        "Peak context, k",
        ...REPORT_CONTEXT_COLUMNS.map((n) => `Over ${n / 1000}k`),
        "Turn-10 context, k",
        "Plan reads",
        "Compactions",
        "Read",
        "Edit",
        "grep",
        "sed / cat",
        "find / ls",
        "tests",
        "Serena",
      ],
      [...agentAgg]
        .sort(([, a], [, b]) => b.read - a.read)
        .slice(0, 40)
        .map(([t, g]) => [
          t,
          g.n,
          (g.read / Math.max(1, g.n) / 1e6).toFixed(2),
          cacheShare(g),
          Math.round(g.turns / Math.max(1, g.n)),
          Math.round(g.contextPeakMax / 1000),
          ...REPORT_CONTEXT_COLUMNS.map((n) => g.contextPeaks.filter((p) => p >= n).length),
          g.at10.length ? Math.round(median(g.at10) / 1000) : "-",
          `${g.planReads.full} / ${g.planReads.partial}`,
          g.compactions,
          ...["read", "edit", "grep", "shellRead", "shellList", "tests", "serena"].map((k) =>
            one(per(g, k)),
          ),
        ]),
    ),
  );

  // Runs, from the run logs
  const runs = [...latestRows(ledgerRows, "run").values()].sort(
    (a, b) => a.time.start - b.time.start,
  );
  const wfOf = (r) => r.by?.workflow;
  const outcomes = latestOutcomes(ledgerRows);
  const outcomeBySha = new Map(
    outcomes.filter((r) => r.run?.parentSha).map((r) => [r.run.parentSha, r]),
  );
  const outcomeOf = (r) => (r.run.parentSha ? (outcomeBySha.get(r.run.parentSha) ?? null) : null);
  const featureName = (r) => (names.has(r.run.fid) ? names.get(r.run.fid) : name(r.run.issue));
  const churn = (c) => c.added + c.deleted;
  /** Code and test lines a run's own commits changed (git), or null. */
  const ownLines = (r) =>
    r.lines ? { code: churn(r.lines.code), tests: churn(r.lines.tests) } : null;
  const sumOr = (xs, f) => {
    const v = xs.map(f).filter((x) => x !== null && x !== undefined);
    return v.length ? v.reduce((a, b) => a + b, 0) : null;
  };

  // By feature
  out.push(
    "## By feature\n\n" +
      "One row per issue: every workflow run in its run logs and every chat that ran a `/bkit-*` command for it. " +
      "**Tasks** come from the plan run. **Code lines** and **test lines** are lines added plus deleted by the build and debug runs' own commits, from git: " +
      "each run's first to last commit, cut at every dev merge so merged-in work is left out; plans, run logs and ledgers are left out too. " +
      `**Active minutes**: time inside the issue's chats with no gap over ${IDLE_GAP_MS / 60_000} minutes between events; a gap is a human wait or an idle session. ` +
      `**M per 100 lines**: \`-\` under ${LINES_FLOOR} code and test lines. ` +
      "**Verify FAIL rounds**: build verify rounds that ended `FAIL`. **Debug after ship**: debug runs for the same issue that started after its ship run ended; a debug run filed under another issue is not counted.\n",
  );
  const features = new Map();
  const feat = (fp) =>
    features.get(fp) ?? features.set(fp, { runs: [], chats: [], repo: null }).get(fp);
  for (const r of runs)
    if (r.run.issue) {
      const f = feat(r.run.issue);
      f.runs.push(r);
      f.repo ??= r.repo;
    }
  for (const c of chats)
    for (const fp of c.bkit.via.includes("command") ? c.issue.all : []) {
      const f = feat(fp);
      f.chats.push(c);
      f.repo ??= c.repo;
    }
  const featureRows = [...features]
    .map(([fp, f]) => {
      const t = tokenTypes(f.chats);
      const plan = f.runs.findLast((r) => wfOf(r) === "plan" && r.plan?.total)?.plan;
      const outcomeTasks = f.runs
        .filter((r) => wfOf(r) === "build")
        .map((r) => outcomeOf(r)?.plan?.total?.tasks)
        .filter((n) => typeof n === "number");
      const coding = f.runs.filter((r) => wfOf(r) === "build" || wfOf(r) === "debug");
      const code = sumOr(coding, (r) => ownLines(r)?.code);
      const testLines = sumOr(coding, (r) => ownLines(r)?.tests);
      const lines = code === null ? null : code + testLines;
      const tasks = plan?.total.tasks || (outcomeTasks.length ? Math.max(...outcomeTasks) : null);
      const ship = f.runs.findLast((r) => wfOf(r) === "ship" && r.ending === "done");
      const wfCount = {};
      for (const r of f.runs) bump(wfCount, wfOf(r));
      const openWf = new Set(f.runs.filter(isOpen).map(wfOf));
      const openChats = f.chats.filter(isOpen).length;
      const last = Math.max(...f.runs.map((r) => r.time.end), ...f.chats.map((c) => c.time.end));
      return {
        last,
        cells: [
          name(fp),
          uniq(f.runs.map(featureName)).join(", ") || "-",
          Object.entries(wfCount)
            .map(([w, n]) => `${n > 1 ? `${w}×${n}` : w}${openWf.has(w) ? " (open)" : ""}`)
            .join(", ") || "-",
          openChats ? `${f.chats.length} (${openChats} open)` : f.chats.length,
          counted(f.chats).length ? M(t.read) : "-",
          cacheShare(t),
          f.chats.length
            ? minutesOf(f.chats.reduce((a, c) => a + (c.time.end - c.time.start), 0))
            : "-",
          f.runs.length ? Math.round(f.runs.reduce((a, r) => a + r.time.totalMinutes, 0)) : "-",
          sumOr(f.runs, (r) => r.time.activeMinutes) === null
            ? "-"
            : Math.round(sumOr(f.runs, (r) => r.time.activeMinutes)),
          tasks ?? "-",
          code ?? "-",
          testLines ?? "-",
          tasks && t.read ? (t.read / tasks / 1e6).toFixed(1) : "-",
          lines >= LINES_FLOOR && t.read ? (t.read / (lines / 100) / 1e6).toFixed(2) : "-",
          f.runs.reduce(
            (a, r) => a + (r.build?.verify ?? []).filter((v) => v.verdict === "FAIL").length,
            0,
          ),
          ship
            ? f.runs.filter((r) => wfOf(r) === "debug" && r.time.start > ship.time.end).length
            : "-",
        ],
      };
    })
    .sort((a, b) => b.last - a.last)
    .slice(0, 30);
  out.push(
    table(
      [
        "Issue",
        "Feature",
        "Runs",
        "Chats",
        "Tokens read, M",
        "Cache-read share",
        "Chat minutes",
        "Run minutes",
        "Active run minutes",
        "Tasks",
        "Code lines",
        "Test lines",
        "M per task",
        "M per 100 lines",
        "Verify FAIL rounds",
        "Debug after ship",
      ],
      featureRows.map((r) => r.cells),
    ),
  );

  out.push(
    "## Workflow runs, from the run logs\n\n" +
      "Every run is listed; one whose log changed within the settle window is **open**: counted here, left out of the medians. " +
      "**Ending**: `done` / `failed` from its last end row; `close-failed` = the work wrote `workflow-done` and only the close after it failed, or its last close found CI never started (a later close that started CI → `done`); with no end row, `decision-pause` when its `build-decision-*.md` is still `Status: OPEN`, else `stopped`. **Close CI not started**: closes, counted one by one, whose `ciDispatch` found CI never started, by reason.\n",
  );
  const wfs = uniq(runs.map(wfOf)).sort();
  /** Median of the known values, `-` when none is known; with how many runs it covers when not all. */
  const activeMedian = (xs) => {
    const known = xs.filter((x) => x !== null && x !== undefined);
    if (!known.length) return "-";
    const m = Math.round(median(known));
    return known.length === xs.length ? m : `${m} (${known.length} of ${xs.length})`;
  };
  const endings = ["done", "close-failed", "failed", "decision-pause", "stopped"];
  out.push(
    table(
      [
        "Workflow",
        "Runs",
        "Open",
        ...endings,
        "Minutes median",
        "Minutes p90",
        "Active minutes median",
        "Close CI not started",
      ],
      wfs.map((w) => {
        const rs = runs.filter((r) => wfOf(r) === w);
        const done = settledOnly(rs);
        return [
          w,
          rs.length,
          rs.filter(isOpen).length,
          ...endings.map((e) => rs.filter((r) => r.ending === e).length),
          done.length ? Math.round(median(done.map((r) => r.time.totalMinutes))) : "-",
          done.length
            ? Math.round(
                quantile(
                  done.map((r) => r.time.totalMinutes),
                  0.9,
                ),
              )
            : "-",
          activeMedian(done.map((r) => r.time.activeMinutes)),
          Object.entries(
            rs.reduce((a, r) => {
              for (const c of r.ci ?? []) if (c.status === "unresolved") bump(a, c.reason ?? "?");
              return a;
            }, {}),
          )
            .map(([k, n]) => `${n} ${k}`)
            .join(", ") || "-",
        ];
      }),
    ),
  );

  out.push(
    "### Tokens and owner waits per run\n\n" +
      "The last 30 runs. **Tokens read, M**: the run's own model calls in the chats that worked on it, each call counted by its own time (`-` = a chat without that split, or a host that records no call times). " +
      "**Owner stops**: waits for the owner's answers, from the run's `owner-pause` / `owner-answer` rows (`+ open` = still waiting). **Wait before**: minutes since the feature's previous run ended.\n",
  );
  const mOf = (u) => (u ? M(u.tokens.read) : "-");
  out.push(
    table(
      [
        "Started",
        "Feature",
        "Workflow",
        "Ending",
        "Minutes",
        "Tokens read, M (main / agents)",
        "Owner stops",
        "Owner minutes",
        "Wait before, minutes",
      ],
      runs
        .slice(-30)
        .reverse()
        .map((r) => {
          const o = r.owner;
          const open = (o?.stops ?? []).some((x) => x.open);
          return [
            day(r.time.start),
            featureName(r) + openMark(r),
            wfOf(r),
            r.ending,
            Math.round(r.time.totalMinutes),
            r.usage ? `${mOf(r.usage.total)} (${mOf(r.usage.main)} / ${mOf(r.usage.agents)})` : "-",
            o ? `${o.total.stops - (open ? 1 : 0)}${open ? " + open" : ""}` : "-",
            o ? Math.round(o.total.minutes) : "-",
            o?.waitBeforeMinutes === null || o?.waitBeforeMinutes === undefined
              ? "-"
              : Math.round(o.waitBeforeMinutes),
          ];
        }),
    ),
  );

  out.push(
    "### Build verify loop\n\n" +
      "**Verify rounds**: per group (an old run's: per sub-plan), each round's verdict and failure count (`P` PASS, `C` CONCERNS, `F` FAIL). **Test-order gaps**: per round, in the same order, `no-red`, `late-red` and the like in the round's report (`-` = report not read); " +
      "a later build of the same feature overwrites the reports, so an earlier build has them only for files last written during that build. **Gaps fixes**: gaps-remediate rounds by strategy. " +
      "**Findings** are the reconciled challenge's, by severity (critical / high / medium / low), next to the code and test lines the build's own commits changed.\n",
  );
  const letter = (v) => ({ PASS: "P", CONCERNS: "C", FAIL: "F" })[v] ?? "?";
  out.push(
    table(
      [
        "Started",
        "Feature",
        "bkit version",
        "Ending",
        "Minutes",
        "Active minutes",
        "Verify rounds",
        "Test-order gaps",
        "Gaps fixes",
        "Holistic",
        "Challenge",
        "Findings C/H/M/L",
        "Code / test lines",
      ],
      runs
        .filter((r) => wfOf(r) === "build")
        .slice(-30)
        .reverse()
        .map((r) => {
          const b = r.build ?? {};
          const bySub = new Map();
          const gapsBySub = new Map();
          for (const v of b.verify ?? []) {
            const k = v.group ?? v.subPlan ?? "-";
            (bySub.get(k) ?? bySub.set(k, []).get(k)).push(
              `${letter(v.verdict)}${v.failures ?? ""}`,
            );
            (gapsBySub.get(k) ?? gapsBySub.set(k, []).get(k)).push(v.testOrderGaps ?? "-");
          }
          const gaps = (b.verify ?? []).filter((v) => v.testOrderGaps !== null);
          const strat = {};
          for (const g of b.gapsRemediate ?? []) bump(strat, (g.strategy ?? "?").toLowerCase());
          const fd = b.challenge?.findings;
          const own = ownLines(r);
          return [
            day(r.time.start),
            featureName(r) + openMark(r),
            r.bkit.version ?? "none",
            r.ending,
            Math.round(r.time.totalMinutes),
            r.time.activeMinutes === null || r.time.activeMinutes === undefined
              ? "-"
              : Math.round(r.time.activeMinutes),
            [...bySub].map(([k, vs]) => `${k}: ${vs.join(" ")}`).join(" · ") || "-",
            gaps.length
              ? [...gapsBySub].map(([k, gs]) => `${k}: ${gs.join(" ")}`).join(" · ")
              : "-",
            Object.entries(strat)
              .map(([k, n]) => `${n} ${k}`)
              .join(", ") || "-",
            b.holistic ? `${letter(b.holistic.verdict)}${b.holistic.failures ?? ""}` : "-",
            b.challenge?.verdict ?? "-",
            fd ? `${fd.CRITICAL}/${fd.HIGH}/${fd.MEDIUM}/${fd.LOW}` : "-",
            own ? `${own.code} / ${own.tests}` : "-",
          ];
        }),
    ),
  );

  out.push(
    "### Plan shape\n\n" +
      "Measured on the plan the run closed with: its last version, by group; an old-format run's sub-plans when split. **Tests** and **test files** are per task, median / p90 / max, from each task's `TEST FIRST` entries " +
      "(`-` = a task without that field); **at each count** = `count:tasks`. No limit is applied: the rows keep every task's numbers. " +
      "**Complexity** (old-format runs) is the check's own verdict; **Check's reason** quotes its `Session Fit Estimate` from the report on this machine.\n",
  );
  const mm = (xs) =>
    xs?.length ? `${median(xs)} / ${quantile(xs, 0.9)} / ${Math.max(...xs)}` : "-";
  const atEach = (xs) => {
    if (!xs?.length) return "-";
    const n = {};
    for (const x of xs) bump(n, x);
    return Object.entries(n)
      .sort(([a], [b]) => a - b)
      .map(([k, v]) => `${k}:${v}`)
      .join(" ");
  };
  out.push(
    table(
      [
        "Closed",
        "Feature",
        "bkit version",
        "Plan KB",
        "Groups",
        "Sub-plans",
        "Tasks",
        "Tests per task",
        "Tasks at each test count",
        "Test files per task",
        "Tasks at each test-file count",
        "Tasks without tests",
        "Complexity",
        "Check's reason",
      ],
      runs
        .filter((r) => wfOf(r) === "plan" && r.plan?.total)
        .slice(-30)
        .reverse()
        .map((r) => {
          const p = r.plan;
          const parts = p.groups ?? p.subPlans ?? [];
          // Per-task lists: null when the plan predates `Test first` or its grouping is not known.
          const all = parts.every((x) => Array.isArray(x.tasks))
            ? parts.flatMap((x) => x.tasks)
            : null;
          const list = (k) =>
            all && all.every((t) => t[k] !== null) ? all.map((t) => t[k]) : null;
          const tests = list("tests");
          return [
            day(r.time.end),
            featureName(r) + openMark(r),
            r.bkit.version ?? "none",
            p.total.kb,
            p.groups?.length ?? "-",
            p.subPlans?.length || "-",
            p.total.tasks,
            mm(tests),
            atEach(tests),
            mm(list("testFiles")),
            atEach(list("testFiles")),
            tests ? tests.filter((n) => n === 0).length : "-",
            p.complexity?.verdict ?? "-",
            (p.complexity && checkReason(logDirs.get(r.run.fid))) || "-",
          ];
        }),
    ),
  );

  out.push(
    "### Minutes per step\n\nA step's minutes run from the status row before it to its own, so they include waiting. **Active** is the part of that time inside the issue's chats' active spans " +
      `(no gap over ${IDLE_GAP_MS / 60_000} minutes between events); runs with no counted chat have none. Shares and order use active minutes. ` +
      "Steps that ran more than once in a run (task reds, verify rounds) are summed per run first. Open runs are left out.\n",
  );
  for (const w of wfs) {
    const rs = settledOnly(runs.filter((r) => wfOf(r) === w));
    const withActive = rs.filter(
      (r) => r.time.activeMinutes !== null && r.time.activeMinutes !== undefined,
    );
    const activeTotal = withActive.reduce((a, r) => a + r.time.activeMinutes, 0) || 1;
    const sum = (xs) => xs.reduce((x, y) => x + y, 0);
    const agg = new Map();
    for (const r of rs) {
      for (const [st, s] of Object.entries(r.steps?.byStep ?? {})) {
        const { n, totalMinutes: minutes, activeMinutes: active } = s;
        const g = agg.get(st) ?? agg.set(st, { runs: 0, n: 0, mins: [], active: [] }).get(st);
        g.runs++;
        g.n += n;
        g.mins.push(minutes);
        if (active !== null && active !== undefined) g.active.push(active);
      }
    }
    out.push(`#### ${w} (${rs.length} runs, ${withActive.length} with active minutes)\n`);
    out.push(
      table(
        [
          "Step",
          "Runs",
          "Times run",
          "Minutes median",
          "Active minutes median",
          "Active minutes max",
          "Share of active time",
        ],
        [...agg]
          .sort(([, a], [, b]) => sum(b.active) - sum(a.active) || sum(b.mins) - sum(a.mins))
          .slice(0, 15)
          .map(([st, g]) => [
            st,
            g.runs,
            g.n,
            median(g.mins).toFixed(1),
            g.active.length ? median(g.active).toFixed(1) : "-",
            g.active.length ? Math.max(...g.active).toFixed(1) : "-",
            withActive.length ? pct(sum(g.active) / activeTotal) : "-",
          ]),
      ),
    );
  }

  // Links
  out.push(
    "## Recent bkit chats and their links\n\n" +
      "**exact**: the chat printed the `parentSha` of these rows (`bkit workflows close`). **time**: rows from the same repo and workflow written during the chat. **issue**: other chats about the same issue. " +
      "**Outcome** comes from the exact `outcome` row, or from the time-linked one when there is exactly one.\n",
  );
  const bkitChats = chats
    .filter((c) => c.bkit.via.length)
    .slice(-30)
    .reverse();
  out.push(
    table(
      [
        "Started",
        "Repo",
        "Issue",
        "Kind",
        "Workflows",
        "bkit version",
        "Tokens read, M",
        "exact",
        "time",
        "issue",
        "Outcome",
      ],
      bkitChats.map((c) => {
        const l = links.get(c.key);
        const kinds = (rs) =>
          rs.length
            ? uniq(rs.map((r) => r.kind))
                .map((k) => `${rs.filter((r) => r.kind === k).length} ${k}`)
                .join(", ")
            : "-";
        const timeOutcomes = l.time.filter((r) => r.kind === "outcome");
        const exactOutcome = l.exact.find((r) => r.kind === "outcome");
        const oc = exactOutcome ?? (timeOutcomes.length === 1 ? timeOutcomes[0] : null);
        const ocText = (o) => {
          const tasks = o.plan?.total?.tasks;
          const mins = o.time?.totalMinutes;
          return [
            `${o.lines?.total?.changed ?? "-"} lines`,
            ...(typeof tasks === "number" ? [`${tasks} tasks`] : []),
            ...(typeof mins === "number" ? [`${Math.round(mins)} min`] : []),
          ].join(", ");
        };
        return [
          day(c.time.start) + openMark(c),
          name(c.repo),
          name(c.issue.id),
          chatClass(c),
          c.bkit.workflows.join("+") || c.bkit.prompts.join("+") || "-",
          l.versionSource === "repo-history" || l.versionSource === "none"
            ? (l.version ?? "none")
            : `${l.version} (${l.versionSource})`,
          M(readOf(c)),
          kinds(l.exact),
          kinds(l.time),
          l.issue.length ? `${l.issue.length} chats` : "-",
          oc ? `${ocText(oc)}${exactOutcome ? "" : " (time)"}` : "-",
        ];
      }),
    ),
  );

  // Biggest chats
  const recent = chats
    .filter((c) => c.time.start >= now - 28 * DAY_MS)
    .sort((a, b) => readOf(b) - readOf(a))
    .slice(0, 10);
  out.push("## Biggest chats, last 4 weeks\n");
  out.push(
    table(
      [
        "Started",
        "Repo",
        "Issue",
        "Kind",
        "Tokens read, M",
        "Turns",
        "Subagents",
        "Peak context, k",
        "Compactions",
        "Tool errors",
        "Human prompts",
      ],
      recent.map((c) => [
        day(c.time.start) + openMark(c),
        name(c.repo),
        name(c.issue.id),
        chatClass(c),
        M(readOf(c)),
        turnsOf(c),
        c.agents.total.n,
        Math.round(c.usage.total.context.peak / 1000),
        compactionsOf(c),
        c.tools.total.errors,
        c.session.prompts,
      ]),
    ),
  );
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// Run check: every settled workflow run as an `outcome` row (written at close, copied by the
// ledger step) and as a `run` row (rebuilt from the run log), joined on `run.parentSha`.
// ---------------------------------------------------------------------------

/**
 * Per repo fingerprint: runs found on both sides, outcome rows with no `run` row, and `run` rows
 * with no outcome row. Only rows that carry `run.parentSha` take part, and only settled runs.
 * @returns {Map<string, {both: number, outcomeOnly: object[], runOnly: object[]}>}
 */
export function runCheck(rows) {
  rows = rows.map(normalize);
  const byRepo = new Map();
  const of = (fp) =>
    byRepo.get(fp) ?? byRepo.set(fp, { both: 0, outcomeOnly: [], runOnly: [] }).get(fp);
  const runKey = (fp, sha) => `${fp}\u0000${sha}`;
  const runs = new Map();
  for (const r of latestRows(rows, "run").values()) {
    if (!r.run?.parentSha || r.scan?.settled === false) continue;
    runs.set(runKey(r.repo, r.run.parentSha), r);
  }
  const matched = new Set();
  for (const o of latestOutcomes(rows)) {
    const sha = o.run?.parentSha;
    if (!sha || typeof o.repo !== "string") continue;
    const fp = o.repo.startsWith("fp:") ? o.repo : repoFp(o.repo);
    const k = runKey(fp, sha);
    if (runs.has(k)) {
      of(fp).both++;
      matched.add(k);
    } else of(fp).outcomeOnly.push(o);
  }
  for (const [k, r] of runs) if (!matched.has(k)) of(r.repo).runOnly.push(r);
  return byRepo;
}

/** The run check as a report section. */
export function renderRunCheck(byRepo, names) {
  const name = (fp) => names.get(fp) ?? fp;
  const repos = [...byRepo.entries()].sort(([a], [b]) => name(a).localeCompare(name(b)));
  const out = ["## Run check\n"];
  out.push(
    "Every settled workflow run should appear twice: as an `outcome` row its close wrote to the repo's `.bkit/stats.jsonl`, " +
      "and as a `run` row rebuilt from its run log. **Outcome only**: the run log is gone or was not scanned. " +
      "**Run only**: the close never wrote its row.\n",
  );
  out.push(
    table(
      ["Repo", "Both", "Outcome only", "Run only"],
      repos.map(([fp, c]) => [name(fp), c.both, c.outcomeOnly.length, c.runOnly.length]),
    ),
  );
  const misses = repos.flatMap(([fp, c]) => [
    ...c.outcomeOnly.map((o) => [name(fp), "outcome only", o.by?.workflow ?? "-", day(o.ts), o.run.parentSha.slice(0, 8)]),
    ...c.runOnly.map((r) => [name(fp), "run only", r.by?.workflow ?? "-", day(r.time.start), r.run.parentSha.slice(0, 8)]),
  ]);
  if (misses.length) {
    out.push("### Mismatches\n");
    out.push(table(["Repo", "Side", "Workflow", "Day", "parentSha"], misses));
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    cmd: "scan",
    settleHours: DEFAULT_SETTLE_HOURS,
    dryRun: false,
    home: os.homedir(),
    only: Object.keys(HOSTS),
  };
  for (const a of argv) {
    if (a === "scan" || a === "report") opts.cmd = a;
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a.startsWith("--settle-hours=")) opts.settleHours = Number(a.slice(15));
    else if (a.startsWith("--home=")) opts.home = a.slice(7);
    else if (a.startsWith("--platforms=")) opts.only = a.slice(12).split(",").filter(Boolean);
    else return { error: `unknown argument: ${a}` };
  }
  if (!Number.isFinite(opts.settleHours) || opts.settleHours < 0)
    return { error: "--settle-hours must be a number >= 0" };
  const unknown = opts.only.filter((p) => !HOSTS[p]);
  if (unknown.length)
    return {
      error: `unknown platform: ${unknown.join(", ")} (known: ${Object.keys(HOSTS).join(", ")})`,
    };
  return opts;
}

/** The hosts to read, each listed at most once per run. */
export function hostsFor(home, platforms = Object.keys(HOSTS)) {
  return platforms.map((platform) => {
    let listed;
    return { platform, list: () => (listed ??= Promise.resolve(HOSTS[platform](home))) };
  });
}

/** Print the ledger step's result. */
function logLedgers(res) {
  const done = [res.self, ...res.consumers].filter((r) => r && !r.skipped);
  console.log(
    `[bkit-harvest] ledgers: ${done.length} repo(s), ${res.totalCopiedRows} rows copied, ` +
      `${res.totalPrunedRows} pruned from repos`,
  );
  for (const [file, count] of Object.entries(res.totalCountOnly))
    console.log(`[bkit-harvest] count-only ${file}: ${count} entities (not copied)`);
  if (res.totalPrunedRows > 0)
    console.log(
      `[bkit-harvest] ${res.totalPrunedRows} row(s) now exist only in harvest/ (gitignored, not backed up by bkit)`,
    );
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.error) {
    console.error(`[bkit-harvest] ${opts.error}`);
    return 2;
  }
  const top = git(process.cwd(), ["rev-parse", "--show-toplevel"])?.trim();
  if (!top || !fs.existsSync(path.join(top, "harvest", "consumers.md"))) {
    console.error("[bkit-harvest] run in bkit's own checkout: harvest/consumers.md not found");
    return 2;
  }
  // TypeScript from the engine and the ledger step: `pnpm harvest` runs this file under tsx.
  const { runHarvest } = await import("./ledgers.ts");
  const { runAnalysis } = await import("../../.bkit/core/engine/commands/analysis.ts");
  const { renderStatsMarkdown } = await import("../../.bkit/core/engine/commands/stats.ts");
  const hosts = hostsFor(opts.home, opts.only);
  const statsFile = path.join(top, "harvest", "stats.jsonl");
  const frictionFile = path.join(top, "harvest", "friction.jsonl");
  const reportFile = path.join(top, "harvest", "stats.md");
  let failed = false;
  try {
    if (opts.cmd === "scan") {
      // Ledgers first: chat / run rows a repo still holds land in the store before the scan,
      // which then counts them as already seen.
      if (!opts.dryRun) logLedgers(runHarvest(top));
      const res = await scan({
        hosts,
        statsFile,
        settleHours: opts.settleHours,
        checkout: top,
        dryRun: opts.dryRun,
      });
      const verb = opts.dryRun ? "would append" : "appended";
      const n = (k) => res.rows.filter((r) => r.kind === k).length;
      console.log(
        `[bkit-harvest] ${verb} ${n("chat")} chat rows and ${n("run")} run rows to ${statsFile}`,
      );
      for (const [p, s] of Object.entries(res.byPlatform)) {
        if (s.error) {
          failed = true;
          console.error(`  ${p}: could not be read: ${s.error}`);
          continue;
        }
        console.log(
          `  ${p}: ${s.found} chats found, ${s.appended} ${verb}, ${s.unchanged} already counted, ` +
            `${s.open} open (changed in the last ${opts.settleHours}h), ${s.empty} with no turns`,
        );
      }
      const rs = res.runs;
      if (rs.error) {
        failed = true;
        console.error(`  run logs: could not be read: ${rs.error}`);
      } else {
        console.log(
          `  run logs: ${rs.found} runs found, ${rs.appended} ${verb}, ${rs.unchanged} already counted, ` +
            `${rs.open} open (changed in the last ${opts.settleHours}h)`,
        );
      }
      if (opts.dryRun) {
        for (const r of res.rows)
          console.log(
            r.kind === "run"
              ? `  ${day(r.time.start)} run ${r.by.workflow} ${r.ending} ${r.time.totalMinutes} min`
              : `  ${day(r.time.start)} ${r.key} ${r.bkit.workflows.join("+") || "-"} ${M(r.usage.total.tokens.read)}M`,
          );
        return failed ? 1 : 0;
      }
    }
    const rows = readLedger(statsFile);
    const names = await buildLookup(hosts, rows);
    const check = runCheck(rows);
    const workflowRows = renderStatsMarkdown(
      runAnalysis(
        [statsFile, frictionFile].filter((f) => fs.existsSync(f)),
        new Set(["chat", "run"]),
      ),
      "Workflow rows, all repos",
      "The rows every repo's workflow closes wrote, as copied into `harvest/`.",
    ).replace(/^#/gm, "##");
    fs.writeFileSync(
      reportFile,
      [
        renderReport(rows, names, Date.now(), logDirIndex()),
        renderRunCheck(check, names),
        workflowRows,
      ].join("\n"),
    );
    const misses = [...check.values()].reduce(
      (n, c) => n + c.outcomeOnly.length + c.runOnly.length,
      0,
    );
    console.log(`[bkit-harvest] run check: ${misses} mismatch(es)`);
    console.log(`[bkit-harvest] wrote ${reportFile}`);
    return failed ? 1 : 0;
  } catch (err) {
    console.error(`[bkit-harvest] ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
