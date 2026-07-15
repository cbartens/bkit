// Contract + codec for the bkit unified JSONL telemetry ledgers.
//
// Generalises the per-FID `status.jsonl` machine into a family of append-only
// NDJSON ledgers governed by ONE canonical TypeScript reducer:
//
//   .bkit/stats.jsonl     — compliance, outcome, counter rows
//   .bkit/friction.jsonl  — friction entries (replaces .bkit/friction.md)
//   docs/deferrals.jsonl  — deferred work (replaces docs/pending.md)
//   docs/failures.jsonl   — discovered bugs (new)
//
// LOAD-BEARING DIVERGENCES FROM bkit-status.ts (NOT inherited — each pinned by test):
//   (a) Tolerant `parse`: per-line try/catch + skip + malformedLineCount.
//       `parseStatus` does a bare JSON.parse(l) and THROWS on malformed lines.
//   (b) `validate` REJECTS unknown `kind` before write. No reject path in status.ts.
//   (c) ms `ts` via now*1000|floor, NOT ISO `at`.
//
// Archive shard path: .bkit/archive/{basename}.{YYYYMM}.jsonl
// `foldFrom(paths[])` reads hot + archive shards so the P4 rollup cannot break readers.
//
// Version provenance: every row records the emitting `bkitVersion`. Readers ingest
// ALL well-formed rows (no version gating) and report row counts per `bkitVersion`
// so an unexpected version surfaces for triage.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const MAX_ROWS_BEFORE_ROLLUP = 5000;
/** Template for archive shards: replace {basename} and {YYYYMM}. */
export const ARCHIVE_SHARD_TEMPLATE = ".bkit/archive/{basename}.{YYYYMM}.jsonl";

// ---------------------------------------------------------------------------
// repo — the owner/repo slug, resolved ONE way
//
// `repo` is part of identity() for EVERY kind, so a respelled repo FORKS the
// entity — the same failure the spec warns about for `key`, except `repo` is not
// authored by anyone: it is derived. It therefore must be derived identically
// everywhere, from the only authoritative source: the git remote.
//
// NOT package.json `name` — that is an npm package name, not a slug
// (`@cbartens/bkit` vs `cbartens/bkit`). NOT the filesystem path — that makes the
// "owner" a folder on whoever's laptop ran the tool (`GitHub/app-gether-life`,
// or `code/app-gether-life` after they reorganise).
// ---------------------------------------------------------------------------

/**
 * Parse `owner/repo` out of a git remote URL. Pure — the fiddly half, kept
 * testable without a git repo.
 *
 * Handles HTTPS (`https://github.com/owner/repo.git`), SSH scp-form
 * (`git@github.com:owner/repo.git`) and `ssh://` URLs. Returns "" when the URL
 * yields no `owner/repo` pair rather than guessing.
 */
export function parseRemoteUrlToSlug(url: string): string {
  const m = url
    .trim()
    .replace(/\.git$/, "")
    .match(/[/:]([^/:]+\/[^/:]+)$/);
  return m?.[1] ?? "";
}

/** git env with hook vars scrubbed — see resolveRepoSlug for why this is load-bearing. */
function gitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env["GIT_DIR"];
  delete env["GIT_WORK_TREE"];
  delete env["GIT_INDEX_FILE"];
  delete env["GIT_OBJECT_DIRECTORY"];
  return env;
}

/**
 * Resolve a rev (`HEAD~1`, a branch, a tag) to a full hex SHA. "" if it does not
 * resolve — e.g. `HEAD~1` in a repo with one commit.
 *
 * `parentSha` MUST be resolved before it reaches a row. It is part of identity()
 * for compliance and counter, so an unresolved literal like "HEAD~1" is the SAME
 * identity on every run and successive runs fold into each other. It is also what
 * the grader diffs against, and the diff guard rejects anything non-hex — silently
 * grading an empty diff, which passes every diff-based rule vacuously.
 */
export function resolveGitSha(rev: string, cwd: string): string {
  const res = spawnSync("git", ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`], {
    cwd,
    encoding: "utf-8",
    env: gitEnv(),
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (res.status !== 0 || typeof res.stdout !== "string") return "";
  const sha = res.stdout.trim();
  return /^[0-9a-f]{7,40}$/.test(sha) ? sha : "";
}

/**
 * Resolve a repo's `owner/repo` slug from its git remote. "" when there is no
 * remote or no git repo — callers decide the fallback, loudly.
 *
 * The env scrub is load-bearing, not hygiene: git hooks export GIT_DIR /
 * GIT_WORK_TREE / GIT_INDEX_FILE, and leaving them set makes `git -C <path>`
 * silently answer for the HOOK's repo instead of <path> — so a harvest run from
 * a hook would stamp every consumer's rows with bkit's own slug.
 *
 * spawnSync, not execSync-in-a-try: a non-zero exit is an expected answer here
 * ("no remote"), not an exception to swallow.
 */
export function resolveRepoSlug(cwd: string): string {
  const res = spawnSync("git", ["remote", "get-url", "origin"], {
    cwd,
    encoding: "utf-8",
    env: gitEnv(),
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (res.status !== 0 || typeof res.stdout !== "string") return "";
  return parseRemoteUrlToSlug(res.stdout);
}

// ---------------------------------------------------------------------------
// Shared envelope (A2-mandatory fields on EVERY row, every kind)
// ---------------------------------------------------------------------------

export interface TelemetryEnvelope {
  /** Primary id = unix milliseconds (portable: jq `now*1000|floor`). */
  ts: number;
  /** Closed enum — validated on append; unknown kind rejected. */
  kind: TelemetryKind;
  /** Origin repo (slug, e.g. "cbartens/bkit"). */
  repo: string;
  /** bkit version stamped on every row for regression attribution. */
  bkitVersion: string;
  /** Emitting workflow: design | plan | build | debug | ship */
  workflow: string;
  /**
   * The WORKFLOW STEP the row was emitted at, e.g. `build-close-workflow`,
   * `ship-close-gate`. A step of the orchestrator, never an agent name — a
   * subagent's identity goes in `subagent`, and its model in `model`.
   */
  step: string;
  /**
   * The SUBAGENT that wrote the row, e.g. `bkit-build-challenge-remediate`.
   * Absent on orchestrator-written rows (the workflow itself wrote it).
   *
   * Distinct from `step` on purpose: `step` is WHERE in the workflow, `subagent`
   * is WHO. They were conflated — most rows put an agent name in `step` while
   * `subagent` sat empty on all 141 — which cost the harvest one of the five
   * dimensions it exists to slice by (repo/workflow/step/subagent/severity), and
   * made "which agent generates the most rework?" unanswerable.
   */
  subagent?: string;
  /**
   * The model that wrote the row, read from the writing subagent's OWN prompt
   * frontmatter `model:` at call time — the deterministic source bkit already
   * owns, and the only one that stays true when a prompt is re-pinned.
   *
   * Set ONLY on subagent-written rows, i.e. exactly when `subagent` is set. An
   * orchestrator-written row has no `model`: the session model is the operator's
   * runtime choice, not a property of the row, and self-reporting it invites the
   * same nondeterminism the compliance grader exists to avoid.
   */
  model?: string;
  /**
   * Free-form related context — the JSONL form of the retired `**Related:**`
   * field. Holds ANY pointer that helps a later reader place this row: feature
   * ids, tracker ids (`BAR-217`), PRs, commit SHAs, file paths, sibling `ts`,
   * and this row's OWN former ledger id (`KN-14`, `DE-7`) when it was migrated
   * off the `.md` ledgers.
   *
   * Deliberately NOT split into an identity field vs a link field. The design's
   * separate `aliases[]` ("I AM KN-14") was folded in here after the sequential
   * `DE-{N}` scheme proved un-mintable under concurrency — two workflows read
   * the same max from their own base commit and mint the same id, so an alias
   * could not be a reliable identity anyway (9 collided in a live consumer
   * ledger). `ts` is the id; everything else is a pointer.
   */
  references?: string[];
  /**
   * Explicit written-once logical key for instinct-loop kinds
   * (friction / deferral / failure / knowledge / decision).
   * Author writes a stable slug ONCE; recurrence = same-key append.
   * Absent on event kinds that key off composite tuples (compliance / counter / outcome).
   */
  key?: string;
}

// ---------------------------------------------------------------------------
// Per-kind discriminated-union payloads
// ---------------------------------------------------------------------------

export type TelemetryKind =
  | "compliance"
  | "outcome"
  | "counter"
  | "friction"
  | "deferral"
  | "failure"
  | "knowledge"
  | "decision";

export const VALID_KINDS: Set<string> = new Set([
  "compliance",
  "outcome",
  "counter",
  "friction",
  "deferral",
  "failure",
  "knowledge",
  "decision",
]);

/**
 * Triage severity — carried by the three author-written kinds whose rows are
 * triaged by a human or a later agent (friction / deferral / failure).
 *
 * Deliberately the SAME vocabulary the challenge + audit prompts already assign
 * to their findings, so `@bkit-build-challenge-remediate` passes a blocked
 * finding's severity straight through to its deferral row instead of re-deriving
 * it. NOT the preflight `blocker`/`advisory` scale (that gates `bkit install`,
 * a different axis), and NOT the pre-JSONL `critical|normal|low` scale — the
 * latter's authored distribution collapsed to its default (19 low / 2 normal /
 * 0 critical of 21 rows in the old `docs/pending.md`), carrying no signal.
 *
 * Absent on machine-generated kinds (compliance / outcome / counter) and on
 * knowledge / decision, which have no triage severity.
 */
export type TelemetrySeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export const VALID_SEVERITIES: Set<string> = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

/**
 * Kinds that carry `severity` — and, identically, the kinds that carry the
 * OPEN/TRIAGED/CLOSED ladder. Both express the same property: these three are
 * the author-written kinds that describe OPEN WORK someone triages. Keep in
 * sync with the payload interfaces below.
 */
export const SEVERITY_KINDS: Set<string> = new Set(["friction", "deferral", "failure"]);

/**
 * The triage ladder, shared by the SEVERITY_KINDS trio (friction/deferral/failure).
 *
 * `OPEN` raised, cause unknown -> `TRIAGED` analysed, disposition known, not yet
 * fixed -> `CLOSED` dealt with (fixed, refuted, or established as not ours).
 *
 * `TRIAGED` exists because analysing something and fixing it are different events,
 * often far apart. Without it a sweep that works out exactly what an entry is, and
 * where its fix belongs, has nowhere to put that: recording `CLOSED` is a lie, and
 * leaving `OPEN` discards the analysis and invites the next sweep to redo it.
 *
 * `TRIAGED` IS STILL OPEN WORK. Readers counting open entries — a CI gate on open
 * CRITICAL failures, an audit debt lens, an age report — MUST count it. Only
 * `CLOSED` is done.
 *
 * NOT on knowledge (no status — a lesson is not work) or decision (`ACTIVE`/
 * `SUPERSEDED` is a lifecycle, a different axis entirely).
 */
export type TriageStatus = "OPEN" | "TRIAGED" | "CLOSED";

export const TRIAGE_STATUSES: Set<string> = new Set(["OPEN", "TRIAGED", "CLOSED"]);

/** A row still needing work: anything not CLOSED, including TRIAGED. */
export function isOpenWork(status: string | undefined): boolean {
  return status !== "CLOSED";
}

// compliance — one row per run x rule (kind:"compliance")
export interface CompliancePayload {
  rule: string;
  result: "pass" | "fail" | "n/a";
  evidence?: string;
  phase: string;
  parentSha: string;
}

/** Code-coverage percentages (0-100), from a coverage-summary.json `total`. */
export interface CoverageStats {
  lines?: number;
  branches?: number;
  functions?: number;
  statements?: number;
}

// outcome — one row per PR/run, keyed by (repo, prNumber)
export interface OutcomePayload {
  prNumber: number;
  /** Lines added (git diff --stat). */
  linesAdded: number;
  /** Lines deleted (git diff --stat). */
  linesDeleted: number;
  /** linesAdded + linesDeleted. */
  linesChanged: number;
  /** Files changed (git diff --stat). */
  filesChanged: number;
  /** Count of tasks in the sub-plan(s). */
  taskCount: number;
  /** Total workflow duration in seconds. */
  durationSeconds: number;
  /**
   * Which CI attempt passed (e.g. 2 = failed once then passed on retry).
   * undefined = not yet backfilled by P4 analysis.
   */
  ciTrySuccess?: number;
  /** Number of corrective commits post-PR-open. */
  correctiveCommits?: number;
  /** Number of PR review iterations. */
  reviewIterations?: number;
  /**
   * The repo's CUMULATIVE count of distinct deferrals at ship time — folded
   * entities, not lines. Per-cycle is the DELTA against the previous outcome
   * row (see newFailuresThisRun / isErrorRun in bkit-analysis.ts).
   */
  deferrals: number;
  /**
   * The repo's CUMULATIVE count of distinct failures at ship time — folded
   * entities, not lines. Per-cycle is the DELTA against the previous outcome row.
   *
   * A total, NOT this run's discoveries: a raw count would mark every run after
   * the first-ever bug as an error run forever. Readers MUST diff consecutive
   * rows rather than test this absolutely.
   */
  failures: number;
  /** Sweep verdict from ship deferred-sweep step. */
  sweepVerdict?: string;
  /**
   * Per-tier code-coverage % — each tier's coverage-summary.json `total.*.pct`.
   * Best-effort: a tier is absent when its coverage report is not produced
   * (coverage is opt-in per #312 unit/integration, #313 e2e). Additive-optional —
   * no version bump; readers ingest rows with or without it.
   */
  coverage?: {
    unit?: CoverageStats;
    integration?: CoverageStats;
    e2e?: CoverageStats;
  };
}

// counter — attempt/failure counts, keyed by (repo, workflow, parentSha, counterName)
export interface CounterPayload {
  counterName: string;
  counterValue: number;
  parentSha: string;
  /**
   * Trust-tier field: model-self-report (pre-P3) vs shell-bus (post-P3 deterministic).
   */
  counterSource: "model-self-report" | "shell-bus";
}

// friction — keyed by explicit `key` field
export interface FrictionPayload {
  category:
    | "human-confirm"
    | "permission-prompt"
    | "agent-rework"
    | "manual-install"
    | "tool-failure"
    | "destructive-backout"
    | "other";
  scope: "bkit-repo" | "consumer" | "universal";
  /** How much this friction hurts — see TelemetrySeverity. */
  severity: TelemetrySeverity;
  /** Short title. `description` carries the prose; without this the title has nowhere to live. */
  summary?: string;
  description: string;
  remediation?: string;
  recovery?: string;
  /** Who observed it: agent | human | phase | orchestrator. Mirrors DeferralPayload.source. */
  source?: string;
  /**
   * `OPEN` raised, cause unknown -> `TRIAGED` analysed, disposition known, not yet
   * fixed -> `CLOSED` dealt with (fixed, refuted, or not ours to fix).
   *
   * `TRIAGED` exists because analysing a friction and fixing it are different events,
   * often months apart, and collapsing them loses the interval. Appending it as its own
   * same-`key` row makes that interval fall out of the ledger the same way the close does
   * (see § Updating a Row): the entry's `ts` is when it was raised, the TRIAGED row's `ts`
   * is when someone worked out what it was, the CLOSED row's `ts` is when it was fixed.
   * Carry the disposition in `references` (the issue, the Fix N, or why it is not ours).
   */
  status?: TriageStatus | string;
  confidence?: number;
  lastConfirmed?: number;
  recurrenceCount?: number;
}

// deferral — keyed by explicit `key` field
export interface DeferralPayload {
  type: "issue" | "feature";
  category: string;
  /** Triage severity of the deferred work — see TelemetrySeverity. */
  severity: TelemetrySeverity;
  /** Short title. `description` carries the prose; without this the title has nowhere to live. */
  summary?: string;
  description: string;
  remediation?: string;
  source?: string;
  /** OPEN -> TRIAGED -> CLOSED. See TRIAGE_STATUSES; TRIAGED is still open work. */
  status?: TriageStatus;
}

// failure — keyed by explicit `key` field
export interface FailurePayload {
  summary?: string;
  /** Triage severity of the discovered bug — see TelemetrySeverity. */
  severity: TelemetrySeverity;
  description: string;
  rootCause?: string;
  remediation?: string;
  /**
   * OPEN -> TRIAGED -> CLOSED. See TRIAGE_STATUSES; TRIAGED is still open work
   * — a diagnosed bug is not a fixed bug.
   */
  status?: TriageStatus | string;
}

// knowledge — keyed by explicit `key` field (P5)
export interface KnowledgePayload {
  summary: string;
  description?: string;
  rootCause?: string;
  remediation?: string;
}

// decision — keyed by explicit `key` field (P5)
export interface DecisionPayload {
  summary: string;
  description?: string;
  rationale?: string;
  alternatives?: string;
  status?: "ACTIVE" | "SUPERSEDED";
}

// ---------------------------------------------------------------------------
// Discriminated union event type
// ---------------------------------------------------------------------------

export type TelemetryEvent = TelemetryEnvelope &
  (
    | ({ kind: "compliance" } & CompliancePayload)
    | ({ kind: "outcome" } & OutcomePayload)
    | ({ kind: "counter" } & CounterPayload)
    | ({ kind: "friction" } & FrictionPayload)
    | ({ kind: "deferral" } & DeferralPayload)
    | ({ kind: "failure" } & FailurePayload)
    | ({ kind: "knowledge" } & KnowledgePayload)
    | ({ kind: "decision" } & DecisionPayload)
  );

// ---------------------------------------------------------------------------
// Identity — per-kind composite tuple for dedup (NOT bare ts)
// Mirrors bkit-status.ts's tuple dedupe approach.
// ---------------------------------------------------------------------------

export function identity(event: TelemetryEvent): string {
  switch (event.kind) {
    case "compliance":
      return `compliance ${event.repo} ${event.workflow} ${event.parentSha} ${event.rule}`;
    case "outcome":
      return `outcome ${event.repo} ${event.prNumber}`;
    case "counter":
      return `counter ${event.repo} ${event.workflow} ${event.parentSha} ${event.counterName}`;
    case "friction":
    case "deferral":
    case "failure":
    case "knowledge":
    case "decision":
      // instinct-loop kinds: identity = kind + key
      return `${event.kind} ${event.repo} ${event.key ?? event.ts}`;
  }
}

// ---------------------------------------------------------------------------
// Validation result
// ---------------------------------------------------------------------------

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

// ---------------------------------------------------------------------------
// Validate — reject malformed + unknown kind before write
// ---------------------------------------------------------------------------

export function validate(event: unknown): ValidationResult {
  if (!event || typeof event !== "object") {
    return { ok: false, reason: "event must be an object" };
  }
  const e = event as Record<string, unknown>;

  // A2-mandatory envelope fields
  const mandatory: string[] = ["ts", "kind", "repo", "bkitVersion", "step"];
  for (const field of mandatory) {
    if (e[field] === undefined || e[field] === null) {
      return { ok: false, reason: `missing mandatory field: ${field}` };
    }
  }

  if (typeof e["ts"] !== "number") {
    return { ok: false, reason: "ts must be a number (ms unix)" };
  }
  if (typeof e["kind"] !== "string") {
    return { ok: false, reason: "kind must be a string" };
  }
  if (!VALID_KINDS.has(e["kind"] as string)) {
    return { ok: false, reason: `unknown kind: ${e["kind"]}` };
  }
  if (typeof e["repo"] !== "string" || e["repo"] === "") {
    return { ok: false, reason: "repo must be a non-empty string" };
  }
  if (typeof e["bkitVersion"] !== "string" || e["bkitVersion"] === "") {
    return { ok: false, reason: "bkitVersion must be a non-empty string" };
  }
  if (typeof e["step"] !== "string" || e["step"] === "") {
    return { ok: false, reason: "step must be a non-empty string" };
  }

  // kind-specific payload validation (minimal — structural check)
  const kind = e["kind"] as TelemetryKind;

  // severity — required on the triaged author-written kinds, rejected elsewhere.
  // Enforced on write only; `parse` stays tolerant so pre-severity rows still read.
  if (SEVERITY_KINDS.has(kind)) {
    if (e["severity"] === undefined || e["severity"] === null) {
      return { ok: false, reason: `${kind} row missing required field: severity` };
    }
    if (!VALID_SEVERITIES.has(e["severity"] as string)) {
      return {
        ok: false,
        reason: `${kind} severity must be one of CRITICAL|HIGH|MEDIUM|LOW (got: ${String(e["severity"])})`,
      };
    }
  } else if (e["severity"] !== undefined) {
    return { ok: false, reason: `${kind} rows do not carry severity` };
  }

  if (kind === "compliance") {
    if (!e["rule"] || !e["result"] || !e["phase"] || !e["parentSha"]) {
      return { ok: false, reason: "compliance row missing required payload fields" };
    }
  }
  if (kind === "outcome") {
    const numFields = [
      "prNumber",
      "linesAdded",
      "linesDeleted",
      "linesChanged",
      "filesChanged",
      "taskCount",
      "durationSeconds",
      "deferrals",
      "failures",
    ];
    for (const f of numFields) {
      if (typeof e[f] !== "number") {
        return { ok: false, reason: `outcome missing or invalid numeric field: ${f}` };
      }
    }
    // coverage is optional + per-tier; validate structure only when present.
    if (e["coverage"] !== undefined) {
      const cov = e["coverage"];
      if (typeof cov !== "object" || cov === null) {
        return { ok: false, reason: "outcome coverage must be an object" };
      }
      for (const tier of ["unit", "integration", "e2e"]) {
        const t = (cov as Record<string, unknown>)[tier];
        if (t === undefined) continue;
        if (typeof t !== "object" || t === null) {
          return { ok: false, reason: `outcome coverage.${tier} must be an object` };
        }
        for (const m of ["lines", "branches", "functions", "statements"]) {
          const v = (t as Record<string, unknown>)[m];
          if (v !== undefined && typeof v !== "number") {
            return { ok: false, reason: `outcome coverage.${tier}.${m} must be a number` };
          }
        }
      }
    }
  }
  if (kind === "counter") {
    if (!e["counterName"] || typeof e["counterValue"] !== "number" || !e["parentSha"]) {
      return { ok: false, reason: "counter row missing required payload fields" };
    }
    if (e["counterSource"] !== "model-self-report" && e["counterSource"] !== "shell-bus") {
      return { ok: false, reason: "counter counterSource must be model-self-report or shell-bus" };
    }
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Parse result (tolerant — per-line try/catch, never throws)
// ---------------------------------------------------------------------------

export interface ParseResult {
  events: TelemetryEvent[];
  malformedLineCount: number;
}

/**
 * Tolerant parse — per-line try/catch, skips + counts unparseable lines.
 * NEVER throws. NEW behaviour vs parseStatus which throws on malformed lines.
 *
 * No version gating — ALL well-formed rows are kept regardless of `bkitVersion`.
 */
export function parse(raw: string): ParseResult {
  const result: ParseResult = {
    events: [],
    malformedLineCount: 0,
  };
  const lines = raw.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") continue;
    try {
      const obj = JSON.parse(trimmed);
      result.events.push(obj as TelemetryEvent);
    } catch {
      result.malformedLineCount++;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Fold — reduce event log to current state map, deduping by composite identity
// ---------------------------------------------------------------------------

export type FoldedState = Map<string, TelemetryEvent>;

/**
 * Fold events into a Map keyed by per-kind composite identity.
 * Later rows (higher ts) win for the same key — last-write-wins fold.
 * Mirrors bkit-status.ts's dedupe approach but with per-kind composite tuples.
 */
export function fold(events: TelemetryEvent[]): FoldedState {
  // Sort by ts ascending so later rows overwrite earlier ones
  const sorted = [...events].sort((a, b) => a.ts - b.ts);
  const state: FoldedState = new Map();
  for (const event of sorted) {
    const key = identity(event);
    state.set(key, event);
  }
  return state;
}

// ---------------------------------------------------------------------------
// FoldFrom — reads hot file + archive shards, returns combined fold
// ---------------------------------------------------------------------------

export interface FoldFromResult {
  state: FoldedState;
  rowCount: number;
  malformedLineCount: number;
  /** Row count per emitting `bkitVersion` — for triage of unexpected versions. */
  versionCounts: Record<string, number>;
  maxRowsWarning: boolean;
}

/**
 * Reads the hot file at `hotPath` plus any archive shards matching the
 * ARCHIVE_SHARD_TEMPLATE, folds all events together.
 *
 * Archive shard template: .bkit/archive/{basename}.{YYYYMM}.jsonl
 * e.g. .bkit/archive/stats.202606.jsonl
 */
export function foldFrom(paths: string[]): FoldFromResult {
  let allEvents: TelemetryEvent[] = [];
  let totalMalformed = 0;

  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    const raw = fs.readFileSync(p, "utf-8");
    const parsed = parse(raw);
    allEvents = allEvents.concat(parsed.events);
    totalMalformed += parsed.malformedLineCount;
  }

  const versionCounts: Record<string, number> = {};
  for (const e of allEvents) {
    const v = typeof e.bkitVersion === "string" && e.bkitVersion !== "" ? e.bkitVersion : "unknown";
    versionCounts[v] = (versionCounts[v] ?? 0) + 1;
  }

  const rowCount = allEvents.length;
  const maxRowsWarning = rowCount > MAX_ROWS_BEFORE_ROLLUP;
  if (maxRowsWarning) {
    console.warn(
      `[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: ${rowCount} rows > ${MAX_ROWS_BEFORE_ROLLUP}. Consider archiving to ${ARCHIVE_SHARD_TEMPLATE}.`,
    );
  }

  return {
    state: fold(allEvents),
    rowCount,
    malformedLineCount: totalMalformed,
    versionCounts,
    maxRowsWarning,
  };
}

/**
 * Compute archive shard paths for a hot file.
 * Returns all existing archive shards matching the template pattern.
 */
export function archiveShardPaths(hotPath: string): string[] {
  const basename = path.basename(hotPath, ".jsonl");
  const archiveDir = path.join(path.dirname(hotPath), "..", ".bkit", "archive");
  const altArchiveDir = path.join(path.dirname(hotPath), "archive");

  const candidates: string[] = [];
  for (const dir of [archiveDir, altArchiveDir]) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (entry.startsWith(`${basename}.`) && entry.endsWith(".jsonl")) {
        candidates.push(path.join(dir, entry));
      }
    }
  }
  return candidates;
}

// ---------------------------------------------------------------------------
// AppendLine — serialize one event to its NDJSON line
// ---------------------------------------------------------------------------

export function appendLine(event: TelemetryEvent): string {
  const v = validate(event);
  if (!v.ok) throw new Error(`[bkit-telemetry] appendLine: invalid event — ${v.reason}`);
  return JSON.stringify(event);
}

// ---------------------------------------------------------------------------
// Summary report for per-workflow summary steps
// ---------------------------------------------------------------------------

export interface TelemetrySummary {
  rowCount: number;
  malformedLineCount: number;
  versionCounts: Record<string, number>;
  maxRowsWarning: boolean;
  /** Rows per emitting workflow — the chain rollup a close step reports. */
  workflowCounts: Record<string, number>;
  /** Human-readable report lines. */
  lines: string[];
}

/**
 * THE telemetry summary. One implementation, called by every workflow close step
 * via `bkit telemetry summary` — see § the reason it is not inline shell.
 *
 * The five workflows each carried their own bash version of this, and every one
 * was wrong in ways this is not:
 *   - `MALFORMED=$(grep -cvE '^\{.*\}$' … || echo 0)` prints "0\n0" whenever there
 *     are NO malformed lines, because `grep -c` exits 1 on zero matches and the
 *     `|| echo 0` fires on top of grep's own "0". Broken in the common case.
 *   - `jq -r '.bkitVersion // "unknown"'` buckets an EMPTY version under an empty
 *     key (`versions: =2`), because jq's `//` substitutes only on null/false and
 *     `""` is neither.
 *   - `wc -l` counts LINES, not parsed rows, and a regex is not a JSON parser.
 * This counts what `parse()` actually parsed, and names the unknown bucket.
 *
 * @param workflow when given, adds the per-workflow chain line the close step reports.
 */
export function buildSummary(result: FoldFromResult, workflow?: string): TelemetrySummary {
  const versionStr =
    Object.entries(result.versionCounts)
      .map(([v, n]) => `${v}=${n}`)
      .join(", ") || "none";
  const lines: string[] = [
    `[bkit-telemetry] rows: ${result.rowCount} | malformed: ${result.malformedLineCount} | versions: ${versionStr}`,
  ];
  if (result.maxRowsWarning) {
    lines.push(
      `[bkit-telemetry] WARNING: MAX_ROWS_BEFORE_ROLLUP (${MAX_ROWS_BEFORE_ROLLUP}) exceeded — ${result.rowCount} rows in stats.jsonl; consider archiving.`,
    );
  }

  // Counted off the FOLDED state, so these are ENTITIES, not lines — same rule the
  // spec sets for every reader. The bash version grepped '"workflow":"ship"' across
  // raw lines, so an updated row counted twice.
  const workflowCounts: Record<string, number> = {};
  for (const ev of result.state.values()) {
    const w = ev.workflow || "unknown";
    workflowCounts[w] = (workflowCounts[w] ?? 0) + 1;
  }
  if (workflow) {
    lines.push(
      `[bkit-telemetry] ${workflow}: ${workflowCounts[workflow] ?? 0} | design→ship chain total: ${result.state.size} (from ${result.rowCount} rows)`,
    );
  }

  return {
    rowCount: result.rowCount,
    malformedLineCount: result.malformedLineCount,
    versionCounts: result.versionCounts,
    maxRowsWarning: result.maxRowsWarning,
    workflowCounts,
    lines,
  };
}

// Re-export readline for potential streaming use (optional)
export { readline };
