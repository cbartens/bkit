// Contract + reducer for the bkit workflow status log.
//
// State is an append-only NDJSON event log (`status.jsonl`): one JSON event per
// line, prior lines NEVER mutated. `merge=union` (see `.gitattributes`) lets git
// auto-concatenate both branches' appended lines server-side, so a per-FID status
// log can never block a PR merge. Union may interleave or duplicate lines, so the
// reader (`fold`) de-dupes by identity and orders by `at` before reconstructing
// the run array.
//
// This module is the CANONICAL reference reducer. The bkit workflows execute an
// inline jq filter that mirrors `fold` exactly; this TS is the unit-tested source
// of truth for the fold semantics.
//
// `parentSha` is captured at step START via `git rev-parse HEAD`, BEFORE the
// step's own commit (if any). Forensic only — points to the commit that preceded
// this step's work, not the commit that resulted from it.

import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

import { parseJson } from "../shared/json.js";

export const CI_TIERS = ["static", "unit", "integration", "e2e", "live", "migration"] as const;
export type CiTier = (typeof CI_TIERS)[number];
export type CiSelection =
  | { mode: "local"; reason: string }
  | {
      mode: "ci";
      provider: "github";
      repo: string;
      runId: string;
      runAttempt: number;
      runUrl: string;
      workflowId: string;
      workflowPath: string;
      headBranch: string;
      headSha: string;
      conclusion: "failure" | "timed_out" | "startup_failure";
      redTiers: CiTier[];
      via: string;
    };

/** Validate the whole saved selection before any reader treats it as evidence. */
export function validateCiSelection(value: unknown): value is CiSelection {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (v.mode === "local") return typeof v.reason === "string" && v.reason.trim().length > 0;
  const stringField = (key: string) => (typeof v[key] === "string" ? v[key] : "");
  const repo = stringField("repo");
  const runId = stringField("runId");
  const branch = stringField("headBranch");
  return (
    v.mode === "ci" &&
    v.provider === "github" &&
    /^[A-Za-z0-9][A-Za-z0-9_.-]*\/[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(repo) &&
    /^[1-9][0-9]*$/.test(runId) &&
    Number.isSafeInteger(v.runAttempt) &&
    Number(v.runAttempt) > 0 &&
    stringField("runUrl") ===
      `https://github.com/${repo}/actions/runs/${runId}/attempts/${v.runAttempt}` &&
    /^[1-9][0-9]*$/.test(stringField("workflowId")) &&
    /^\.github\/workflows\/[^/]+\.ya?ml$/.test(stringField("workflowPath")) &&
    !stringField("workflowPath").includes("..") &&
    branch.length > 0 &&
    !branch.startsWith("-") &&
    !branch.startsWith("/") &&
    !branch.endsWith("/") &&
    !/[\s~^:?*\[\\\u0000-\u001f\u007f]/.test(branch) &&
    !branch.includes("..") &&
    !branch.includes("//") &&
    !branch.includes("@{") &&
    !branch.endsWith(".") &&
    branch.split("/").every((part) => !part.startsWith(".") && !part.endsWith(".lock")) &&
    /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(stringField("headSha")) &&
    ["failure", "timed_out", "startup_failure"].includes(stringField("conclusion")) &&
    Array.isArray(v.redTiers) &&
    v.redTiers.every((tier) => CI_TIERS.some((known) => known === tier)) &&
    typeof v.via === "string" &&
    v.via.trim().length > 0
  );
}

/** Transport and wording changes preserve the identity of the evidence. */
export function ciSelectionIdentity(selection: CiSelection): string {
  return JSON.stringify(
    selection.mode === "local"
      ? ["local"]
      : [
          selection.provider,
          selection.repo.toLowerCase(),
          selection.workflowId,
          selection.workflowPath,
          selection.runId,
          selection.runAttempt,
          selection.headSha,
        ],
  );
}

export type Step = {
  step: string;
  status: "DONE" | "FAILED";
  at: string;
  parentSha: string;
  artifacts: string[];
  verdict?: "PASS" | "FAIL" | "CONCERNS" | "HANDOVER" | "SINGLE" | "SPLIT";
  attempt?: number;
  /** The task group the step ran for. */
  group?: number;
  /** A row written before groups replaced sub-plans; read as its group. */
  subPlan?: number;
  failures?: number;
  strategy?: "STANDARD" | "PIVOT" | "FINAL";
  scope?: string;
  ciGeneration?: number;
  reproduced?: string;
};

/** Validate the bounded CI evidence variant without relaxing local exit codes. */
export function testRunProblem(value: unknown): string | null {
  if (!value || typeof value !== "object") return "test-run must be an object";
  const r = value as Record<string, unknown>;
  const positive = (v: unknown) => Number.isSafeInteger(v) && Number(v) > 0;
  if (r.source === "ci") {
    if (
      r.workflow !== "debug" ||
      r.step !== "debug-run-tests" ||
      r.verdict !== "FAIL" ||
      r.exitCode !== null ||
      r.failures !== null ||
      r.gate !== null ||
      !positive(r.ciGeneration) ||
      !positive(r.runAttempt) ||
      typeof r.ciRun !== "string" ||
      !/^[1-9][0-9]*$/.test(r.ciRun) ||
      r.scope !== `ci:${r.ciRun}` ||
      typeof r.artifact !== "string" ||
      !r.artifact ||
      typeof r.repo !== "string" ||
      !/^[\w.-]+\/[\w.-]+$/.test(r.repo) ||
      r.ciUrl !== `https://github.com/${r.repo}/actions/runs/${r.ciRun}/attempts/${r.runAttempt}` ||
      typeof r.workflowId !== "string" ||
      !/^[1-9][0-9]*$/.test(r.workflowId) ||
      typeof r.workflowPath !== "string" ||
      !/^\.github\/workflows\/[^/]+\.ya?ml$/.test(r.workflowPath) ||
      typeof r.headSha !== "string" ||
      !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(r.headSha)
    )
      return "invalid CI evidence round";
    return null;
  }
  if (r.source !== undefined && r.source !== "local") return "invalid test source";
  if (!Number.isSafeInteger(r.exitCode) || Number(r.exitCode) < 0)
    return "local exitCode must be a non-negative integer";
  if (r.failures !== null && (!Number.isSafeInteger(r.failures) || Number(r.failures) < 0))
    return "invalid failure count";
  return null;
}

/** A round belongs to exactly one saved evidence generation. */
export function ciRoundMatches(
  row: Record<string, unknown>,
  selection: unknown,
  generation: unknown,
): boolean {
  return (
    validateCiSelection(selection) &&
    selection.mode === "ci" &&
    testRunProblem(row) === null &&
    row.source === "ci" &&
    row.ciGeneration === generation &&
    row.ciRun === selection.runId &&
    row.runAttempt === selection.runAttempt &&
    row.ciUrl === selection.runUrl &&
    row.repo === selection.repo &&
    row.workflowId === selection.workflowId &&
    row.workflowPath === selection.workflowPath &&
    row.headSha === selection.headSha
  );
}

export type WorkflowRun = {
  workflow: string;
  startedAt: string;
  status: "IN_PROGRESS" | "DONE" | "FAILED";
  steps: Step[];
  // workflow-meta events merge extra fields (e.g. debugAttempt) onto the run.
  [meta: string]: unknown;
};

// One appended line of `status.jsonl`. `step-done` carries the full `Step` shape
// plus the routing `type`/`workflow`; the rest are workflow-level transitions.
export type StatusEvent =
  | { type: "workflow-started"; workflow: string; at: string }
  | ({ type: "step-done"; workflow: string } & Step)
  | ({ type: "workflow-meta"; workflow: string; at: string } & Record<string, unknown>)
  // `parentSha`: HEAD at close, the run's join key (`run.parentSha` on its ledger rows).
  // `ending` / `publish`: a build's close; `held` = a local build that published nothing.
  | {
      type: "workflow-done";
      workflow: string;
      at: string;
      parentSha?: string;
      ending?: "done" | "held";
      publish?: boolean;
    }
  | { type: "workflow-failed"; workflow: string; at: string };

// Identity for de-dup under union merge. `step-done` is unique per
// (workflow, step, parentSha, at); workflow-level events per (type, workflow, at).
function identity(e: StatusEvent): string {
  if (e.type === "step-done")
    return `S\u0000${e.workflow}\u0000${e.step}\u0000${e.parentSha}\u0000${e.at}${e.ciGeneration === undefined ? "" : `\u0000${e.status}\u0000${e.ciGeneration}`}`;
  if (e.type === "workflow-meta" && e.ciSelection !== undefined)
    return `M\u0000${e.workflow}\u0000${e.at}\u0000${e.ciGeneration}\u0000${JSON.stringify(e.ciSelection)}`;
  return `W\u0000${e.type}\u0000${e.workflow}\u0000${e.at}`;
}

// Index of the most-recent run matching `workflow`, or -1.
function lastIndexOfWorkflow(runs: WorkflowRun[], workflow: string): number {
  for (let i = runs.length - 1; i >= 0; i--) if (runs[i].workflow === workflow) return i;
  return -1;
}

// Strip routing fields to recover the bare `Step`.
function toStep(e: { type: "step-done"; workflow: string } & Step): Step {
  const { type: _t, workflow: _w, ...step } = e;
  return step as Step;
}

// Fold the event log into the run array. De-dupes
// (keeping first occurrence), then orders by `at` (stable), then reduces.
export function fold(events: StatusEvent[]): WorkflowRun[] {
  const seen = new Set<string>();
  const deduped = events.filter((e) => {
    const k = identity(e);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // Stable sort by `at` (Array.prototype.sort is stable in modern engines).
  const ordered = deduped
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.at < b.e.at ? -1 : a.e.at > b.e.at ? 1 : a.i - b.i))
    .map((x) => x.e);

  const runs: WorkflowRun[] = [];
  for (const e of ordered) {
    if (e.type === "workflow-started") {
      runs.push({ workflow: e.workflow, startedAt: e.at, status: "IN_PROGRESS", steps: [] });
    } else if (e.type === "step-done") {
      const i = lastIndexOfWorkflow(runs, e.workflow);
      if (i < 0) {
        runs.push({
          workflow: e.workflow,
          startedAt: e.at,
          status: "IN_PROGRESS",
          steps: [toStep(e)],
        });
      } else {
        runs[i].steps.push(toStep(e));
      }
    } else if (e.type === "workflow-meta") {
      const i = lastIndexOfWorkflow(runs, e.workflow);
      if (i >= 0) {
        const { type: _t, workflow: _w, at: _a, ...meta } = e;
        Object.assign(runs[i], meta);
      }
    } else if (e.type === "workflow-done" || e.type === "workflow-failed") {
      const i = lastIndexOfWorkflow(runs, e.workflow);
      if (i >= 0) runs[i].status = e.type === "workflow-done" ? "DONE" : "FAILED";
    }
  }
  return runs;
}

// Any status.jsonl row. The fold reads only StatusEvent types; the log also carries
// rows it skips (runtime-resolved, transport-fallback, close-transport, ...).
export type StatusRow = { type: string } & Record<string, unknown>;

/**
 * The `invocation` row a run's `status.jsonl` carries for one engine-issued workflow-mode
 * invocation: the durable authority the outbox receipt is rebuilt from. The fold skips it.
 */
export type InvocationEvent = {
  type: "invocation";
  workflow: string;
  at: string;
  id: string;
  step: string;
  number: number;
  title: string;
  run: number;
  statusPath: string;
  bookRoot: string;
  group: string | null;
  attempt: string | null;
  agent: string | null;
  host: string | null;
  configuredModel: string | null;
  observedModel: string | null;
  worktree: string;
};

/** True for a parsed `status.jsonl` row that is a complete `invocation` event. */
export function isInvocationEvent(value: unknown): value is InvocationEvent {
  if (value === null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v["type"] === "invocation" &&
    typeof v["id"] === "string" &&
    typeof v["workflow"] === "string" &&
    typeof v["step"] === "string" &&
    typeof v["number"] === "number" &&
    typeof v["title"] === "string" &&
    typeof v["run"] === "number" &&
    typeof v["statusPath"] === "string" &&
    typeof v["bookRoot"] === "string" &&
    typeof v["worktree"] === "string"
  );
}

// Serialize one event to the NDJSON line appended to `status.jsonl`, newline included.
export function appendLine(event: StatusEvent | StatusRow | InvocationEvent): string {
  return `${JSON.stringify(event)}\n`;
}

// ---------------------------------------------------------------------------
// Queries — the reads routing and counters make. Two opposite scopings: attempt
// counts and verdict/failures/mode reads look at the ACTIVE
// run only, so a resumed run never inherits a finished run's spent budget;
// strategy reads ALL runs, so a resumed run keeps its place on the
// STANDARD -> PIVOT -> FINAL ladder instead of restarting it.
// ---------------------------------------------------------------------------

/** `status.jsonl` timestamp: UTC, whole seconds (`date -u +%FT%TZ`). */
export const statusTimestamp = (now: Date = new Date()) =>
  now.toISOString().replace(/\.\d{3}Z$/, "Z");

/** The latest run of `workflow` — the active one. */
export function lastRun(runs: WorkflowRun[], workflow: string): WorkflowRun | undefined {
  const i = lastIndexOfWorkflow(runs, workflow);
  return i < 0 ? undefined : runs[i];
}

export interface StepFilter {
  step: string;
  group?: number;
}

const matches = (s: Step, f: StepFilter) =>
  s.step === f.step &&
  s.status === "DONE" &&
  (f.group === undefined || (s.group ?? s.subPlan) === f.group);

/** DONE rows for the step in the active run of `workflow`. */
export function activeDoneSteps(runs: WorkflowRun[], workflow: string, f: StepFilter): Step[] {
  const run = lastRun(runs, workflow);
  if (!run) return [];
  return run.steps.filter((s) => matches(s, f));
}

/** A check round that found no problems: verdict PASS, or CONCERNS with 0 failures. */
export const cleanRound = (s: Step) =>
  s.status === "DONE" && (s.verdict === "PASS" || (s.verdict === "CONCERNS" && s.failures === 0));

/** The active run's last clean round of `step` (`cleanRound`); undefined when none ran. */
export function lastCleanRound(runs: WorkflowRun[], workflow: string, step: string) {
  return lastRun(runs, workflow)
    ?.steps.filter((s) => s.step === step && cleanRound(s))
    .at(-1);
}

/** `activeDoneSteps` after `clean`'s last clean round: the rounds of the loop still open. */
export function activeDoneStepsSinceClean(
  runs: WorkflowRun[],
  workflow: string,
  f: StepFilter,
  clean: string,
): Step[] {
  const run = lastRun(runs, workflow);
  if (!run) return [];
  const last = lastCleanRound(runs, workflow, clean);
  return run.steps
    .slice(last === undefined ? 0 : run.steps.indexOf(last) + 1)
    .filter((s) => matches(s, f));
}

/** DONE rows for the step across ALL runs of `workflow`: debug's limits span every run. */
export function allRunsDoneSteps(runs: WorkflowRun[], workflow: string, f: StepFilter): Step[] {
  return runs
    .filter((r) => r.workflow === workflow)
    .flatMap((r) => r.steps.filter((s) => matches(s, f)));
}

/** The last DONE row for the step across ALL runs of `workflow`. */
export function lastDoneStepAllRuns(
  runs: WorkflowRun[],
  workflow: string,
  f: StepFilter,
): Step | undefined {
  return runs
    .filter((r) => r.workflow === workflow)
    .flatMap((r) => r.steps)
    .filter((s) => matches(s, f))
    .at(-1);
}

/**
 * Which run of `workflow` this invocation is (1-based): the count of its runs,
 * plus one unless the latest of them is still IN_PROGRESS — a resume, even after
 * another workflow's run. Same answer before and after the run's `workflow-started` row lands.
 */
export function runNumber(runs: WorkflowRun[], workflow: string): number {
  const n = runs.filter((r) => r.workflow === workflow).length;
  return lastRun(runs, workflow)?.status === "IN_PROGRESS" ? n : n + 1;
}

/**
 * A run-level field of the active run (merged from `workflow-meta`) when set,
 * else the last step that carries it. "" when neither does.
 */
export function runOrStepField(runs: WorkflowRun[], workflow: string, field: string): string {
  const run = lastRun(runs, workflow);
  if (!run) return "";
  const own = run[field];
  if (typeof own === "string" && own !== "") return own;
  const fromStep = run.steps
    .map((s) => (s as Record<string, unknown>)[field])
    .filter((v) => v !== undefined && v !== null && v !== "")
    .at(-1);
  return fromStep === undefined ? "" : String(fromStep);
}

// ---------------------------------------------------------------------------
// engine-action rows — an engine action unsafe to repeat (a tracker comment, a
// marker commit, a CI re-trigger, a PR open) records itself here and is checked
// first, so a re-run of the same block does not do it twice. Actions safe to
// repeat (a label already set) record nothing. The fold and every status reader
// skip the type.
// ---------------------------------------------------------------------------

export const ENGINE_ACTION = "engine-action";

export type EngineActionRow = {
  type: typeof ENGINE_ACTION;
  /** What was done: `comment`, `commit`, `dispatch`, `pr-open`, … */
  action: string;
  /** The moment: workflow, run, step, task group, attempt and kind, joined by `/`. */
  key: string;
  /** sha256 of the body or payload acted on. */
  hash: string;
  /** What the action made: comment URL, commit SHA, run id; null when it names none. */
  ref: string | null;
  at: string;
};

/** The `key` of an engine-action row: its parts joined by `/`, an absent part as `-`. */
export const actionKey = (...parts: Array<string | number | undefined | null>): string =>
  parts.map((p) => (p === undefined || p === null || p === "" ? "-" : String(p))).join("/");

/** sha256 hex of an action's body or payload. */
export const actionHash = (payload: string): string =>
  createHash("sha256").update(payload).digest("hex");

/** The engine-action rows of `file`; a missing file or a malformed line reads as none. */
function engineActions(file: string): EngineActionRow[] {
  if (!fs.existsSync(file)) return [];
  const out: EngineActionRow[] = [];
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    if (line.trim() === "") continue;
    const parsed = parseJson(line);
    if (!parsed.ok) continue;
    const r = parsed.value as Partial<EngineActionRow> | null;
    if (r?.type === ENGINE_ACTION && typeof r.key === "string" && typeof r.hash === "string")
      out.push(r as EngineActionRow);
  }
  return out;
}

/**
 * The row recording this action already done (same key, same hash), or undefined.
 * Same key with a different hash is a deliberate edit: act again.
 */
export function alreadyDone(file: string, key: string, hash: string): EngineActionRow | undefined {
  return engineActions(file)
    .filter((r) => r.key === key && r.hash === hash)
    .at(-1);
}

/** Append the engine-action row for an action just done; returns the row. */
export function recordAction(
  file: string,
  a: { action: string; key: string; hash: string; ref: string | null },
): EngineActionRow {
  const row: EngineActionRow = { type: ENGINE_ACTION, ...a, at: statusTimestamp() };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, appendLine(row));
  return row;
}

// ---------------------------------------------------------------------------
// Ledger operations — a bookkeeping write that must survive a lost response. One
// operation id names one request (its hash): the same id and hash replays the
// original receipt, the same id with another hash is refused, and a new id on the
// same ledger key is a deliberate later update. This is stricter than the generic
// action policy above, where the same key with a changed hash acts again.
// ---------------------------------------------------------------------------

/** The operations store, relative to a book root; `.bkit/*.jsonl` is allow-listed and unioned. */
export const LEDGER_OPERATIONS_FILE = path.join(".bkit", "ledger-operations.jsonl");

const ledgerOpKey = (operation: string) => actionKey("ledger-op", operation);

export type LedgerOperationState =
  { state: "new" } | { state: "replay" | "conflict"; row: EngineActionRow };

/** Where `operation` stands in `file`: unseen, done with this request, or used for another. */
export function ledgerOperation(
  file: string,
  operation: string,
  hash: string,
): LedgerOperationState {
  const known = engineActions(file)
    .filter((r) => r.key === ledgerOpKey(operation))
    .at(0);
  if (known === undefined) return { state: "new" };
  return { state: known.hash === hash ? "replay" : "conflict", row: known };
}

/**
 * Record the receipt of a finished ledger operation. A known operation with the same
 * hash returns its original row unchanged; one with another hash throws and writes nothing.
 * `detail` rides on the row so a replay can return the original effect.
 */
export function recordLedgerOperation(
  file: string,
  a: { operation: string; hash: string; ref: string | null; detail?: Record<string, unknown> },
): EngineActionRow {
  const known = ledgerOperation(file, a.operation, a.hash);
  if (known.state === "conflict")
    throw new Error(`ledger operation ${a.operation} was already used for a different request`);
  if (known.state === "replay") return known.row;
  const row = {
    ...recordRow({
      action: "ledger-append",
      key: ledgerOpKey(a.operation),
      hash: a.hash,
      ref: a.ref,
    }),
    ...(a.detail === undefined ? {} : { detail: a.detail }),
  };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, appendLine(row));
  return row;
}

const recordRow = (a: {
  action: string;
  key: string;
  hash: string;
  ref: string | null;
}): EngineActionRow => ({ type: ENGINE_ACTION, ...a, at: statusTimestamp() });

/** The exact bytes an operation prepared, written before the target is touched. */
export type LedgerIntent = {
  type: "ledger-intent";
  operation: string;
  hash: string;
  /** Target path relative to the book root. */
  file: string;
  offset: number;
  bytes: number;
  block: string;
  at: string;
};

function intentRows(file: string): LedgerIntent[] {
  if (!fs.existsSync(file)) return [];
  const out: LedgerIntent[] = [];
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    if (line.trim() === "") continue;
    const parsed = parseJson(line);
    if (!parsed.ok) continue;
    const r = parsed.value as Partial<LedgerIntent> | null;
    if (r?.type === "ledger-intent" && typeof r.operation === "string") out.push(r as LedgerIntent);
  }
  return out;
}

/** Record the prepared bytes of an operation before writing them. */
export function recordLedgerIntent(file: string, intent: Omit<LedgerIntent, "type" | "at">): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const row: LedgerIntent = { type: "ledger-intent", ...intent, at: statusTimestamp() };
  fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
}

/** The latest prepared intent of `operation`, or undefined. */
export function ledgerIntent(file: string, operation: string): LedgerIntent | undefined {
  return intentRows(file)
    .filter((i) => i.operation === operation)
    .at(-1);
}

/** Intents on `target` (relative path) whose operation has no receipt: effects not yet confirmed. */
export function pendingLedgerIntents(file: string, target: string): LedgerIntent[] {
  const receipted = new Set(engineActions(file).map((r) => r.key));
  const latest = new Map<string, LedgerIntent>();
  for (const i of intentRows(file)) latest.set(i.operation, i);
  return [...latest.values()].filter(
    (i) => i.file === target && !receipted.has(ledgerOpKey(i.operation)),
  );
}

/** Create `file` holding `content` only if absent; false when it exists. Other errors throw. */
export function createExclusive(file: string, content: string): boolean {
  let fd: number;
  try {
    fd = fs.openSync(file, "wx");
  } catch (err) {
    // EEXIST is the expected "someone holds it" answer; anything else is a real error.
    if ((err as NodeJS.ErrnoException).code === "EEXIST") return false;
    throw err;
  }
  try {
    fs.writeSync(fd, content);
  } finally {
    fs.closeSync(fd);
  }
  return true;
}

const sleepSync = (ms: number) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** How long a writer waits for another writer's lock on a ledger before refusing. */
export const TARGET_LOCK_WAIT_MS = 10_000;

/**
 * Run `fn` holding the exclusive lock on `target` (`<target>.bkit-lock`). A holder that
 * does not release in time is never reclaimed: the call throws, naming the lock file.
 */
export function withTargetLock<T>(target: string, fn: () => T, waitMs = TARGET_LOCK_WAIT_MS): T {
  const lock = `${target}.bkit-lock`;
  const token = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  const body = JSON.stringify({ pid: process.pid, at: statusTimestamp(), token });
  const deadline = Date.now() + waitMs;
  while (!createExclusive(lock, body)) {
    if (Date.now() >= deadline) {
      const holder = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8").trim() : "unknown";
      throw new Error(
        `ledger target ${target} is locked by another writer (${holder}); if that process is gone, remove ${lock}`,
      );
    }
    sleepSync(20);
  }
  try {
    return fn();
  } finally {
    const held = fs.existsSync(lock) ? fs.readFileSync(lock, "utf-8") : "";
    if (held === body) fs.rmSync(lock, { force: true });
  }
}

/** Append `block` to `target` at exactly `offset`, flush it and read it back; throws on any mismatch. */
export function writePrepared(target: string, block: string, offset: number): void {
  const size = fs.existsSync(target) ? fs.statSync(target).size : 0;
  if (size !== offset)
    throw new Error(
      `ledger ${target} changed since the append was prepared (${size} != ${offset})`,
    );
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const fd = fs.openSync(target, "a");
  try {
    fs.writeSync(fd, block);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  const bytes = Buffer.byteLength(block);
  const back = Buffer.alloc(bytes);
  const rd = fs.openSync(target, "r");
  try {
    fs.readSync(rd, back, 0, bytes, offset);
  } finally {
    fs.closeSync(rd);
  }
  if (back.toString("utf-8") !== block)
    throw new Error(`ledger ${target} read-back disagrees with the bytes just written`);
}

export type AppendCheckpoint = (name: "prepared" | "written" | "receipted") => void;

export type AppendHooks = {
  prepared?: (p: { offset: number; block: string }) => void;
  written?: (p: { offset: number; bytes: number; block: string }) => void;
  checkpoint?: AppendCheckpoint;
};

/**
 * The one lock-and-confirm append: under the target lock, read the current text, let
 * `prepare` build the rows to add, write them (a missing final newline is closed first)
 * and flush and read them back. Returns where the bytes landed.
 */
export function appendLocked(
  target: string,
  prepare: (current: string) => string,
  hooks: AppendHooks = {},
): { offset: number; bytes: number; block: string } {
  return withTargetLock(target, () => appendHeld(target, prepare, hooks));
}

/** {@link appendLocked} for a caller that already holds the target lock. */
export function appendHeld(
  target: string,
  prepare: (current: string) => string,
  hooks: AppendHooks = {},
): { offset: number; bytes: number; block: string } {
  {
    const current = fs.existsSync(target) ? fs.readFileSync(target, "utf-8") : "";
    const body = prepare(current);
    const block = `${current !== "" && !current.endsWith("\n") ? "\n" : ""}${body}`;
    const offset = Buffer.byteLength(current);
    hooks.prepared?.({ offset, block });
    hooks.checkpoint?.("prepared");
    writePrepared(target, block, offset);
    const bytes = Buffer.byteLength(block);
    hooks.checkpoint?.("written");
    hooks.written?.({ offset, bytes, block });
    hooks.checkpoint?.("receipted");
    return { offset, bytes, block };
  }
}

export type Strategy = NonNullable<Step["strategy"]>;

/** Next rung: none -> STANDARD -> PIVOT -> FINAL, and FINAL stays FINAL. */
export function nextStrategy(prior: Strategy | undefined): Strategy {
  if (prior === undefined) return "STANDARD";
  return prior === "STANDARD" ? "PIVOT" : "FINAL";
}
