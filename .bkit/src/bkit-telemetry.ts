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
  | "decision"
  | "feature";

export const VALID_KINDS: Set<string> = new Set([
  "compliance",
  "outcome",
  "counter",
  "friction",
  "deferral",
  "failure",
  "knowledge",
  "decision",
  "feature",
]);

/**
 * Triage severity — carried by the three author-written kinds whose rows are
 * triaged by a human or a later agent (friction / deferral / failure).
 *
 * Deliberately the SAME vocabulary the challenge prompts already assign
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
 * NOT on knowledge or decision. Both use the `ACTIVE` / `SUPERSEDED`
 * lifecycle, a different axis entirely. Absent `status` = `ACTIVE`.
 */
export type TriageStatus = "OPEN" | "TRIAGED" | "CLOSED";

export const TRIAGE_STATUSES: Set<string> = new Set(["OPEN", "TRIAGED", "CLOSED"]);

/** The `ACTIVE` / `SUPERSEDED` lifecycle shared by `decision` and `knowledge`. */
export const DECISION_STATUSES: Set<string> = new Set(["ACTIVE", "SUPERSEDED"]);

/**
 * The `feature` kind's six-state phase ladder — the canonical status for
 * `.bkit/issues.jsonl` (#380), appended once per phase close, same-`key`
 * (the FID). `SHIPPED` projects into the roadmap's `## Shipped` section
 * (last 10, ts desc); `ABANDONED` hides the FID from every section.
 * `ABANDONED` is appended only by a human, or an agent on explicit human
 * instruction — never inferred by a workflow.
 *
 * A separate axis from TRIAGE_STATUSES: `feature` carries no `severity`
 * (`.bkit/jsonl.md` § Severity forbids it outside the friction/deferral/
 * failure triage trio) — it tracks WHERE a feature is, not how badly
 * something is broken.
 */
export type FeatureStatus = "DESIGNED" | "PLANNED" | "BUILT" | "DEBUGGED" | "SHIPPED" | "ABANDONED";

export const FEATURE_STATUSES: Set<string> = new Set([
  "DESIGNED",
  "PLANNED",
  "BUILT",
  "DEBUGGED",
  "SHIPPED",
  "ABANDONED",
]);

/**
 * Why a `deferral` is in the ledger instead of done — the justification, on a
 * different axis from `status` (how far the work has got) and `severity` (how
 * much it matters).
 *
 * The field exists because being declared was the ONLY test for exemption:
 * `@bkit-ship-deferred-sweep` builds its exempt set from whatever design, plan
 * and this ledger declare out-of-scope, and exempt never blocks a ship. The
 * agent that wanted out of the work also wrote the declaration granting it, so
 * unfinished in-scope work left the same trace as genuine out-of-scope work and
 * no reader could separate the two. A closed enum makes the claim testable:
 *
 * - `scope-declared` — a design or plan called this out of scope BEFORE the work
 *   started. MUST carry a `references` pointer to that section; the ledger row
 *   being the only place it was ever declared is the tell of the opposite case.
 * - `hard-blocked` — an external blocker (missing credential, upstream fix,
 *   another feature) makes it impossible now. MUST name the blocker.
 * - `needs-decision` — a human decision is missing, and guessing it is worse than
 *   waiting. Confirmation is unavailable inside `/bkit-*` workflows by design.
 * - `own-cycle` — genuinely plan-sized: a new architecture, not a mechanical fix.
 * - `unjustified` — ADJUDICATOR-ONLY (see UNJUSTIFIED_REASON).
 *
 * A writer who cannot pick one of the first four does not have a deferral; it has
 * unfinished work (`.agents/rules.md` § Principles, "Finish over deferrals").
 */
export type DeferralReason =
  "scope-declared" | "hard-blocked" | "needs-decision" | "own-cycle" | "unjustified";

export const DEFERRAL_REASONS: Set<string> = new Set([
  "scope-declared",
  "hard-blocked",
  "needs-decision",
  "own-cycle",
  "unjustified",
]);

/**
 * The adjudication verdict: this was in-scope work that should have been finished.
 * Written ONLY by a reviewer judging someone else's deferral — never self-assigned
 * at write time, where the four justifications are the whole legal vocabulary.
 *
 * Set via same-`key` append like any other update, and NEVER rewritten afterwards:
 * a later row that closes the entry carries `unjustified` through verbatim, because
 * the rate it feeds (`computeDeferralDiscipline` in `bkit-analysis.ts`) measures how
 * often an agent deferred work it should have done — not whether someone later
 * cleaned up after it.
 */
export const UNJUSTIFIED_REASON = "unjustified";

/**
 * The subagents sanctioned to write a `deferral` row (`.bkit/jsonl.md`
 * § Ledgers & Writers). EXHAUSTIVE: a subagent absent from this set does not
 * write the kind at all.
 *
 * The list is data, not prose, because the prose alone did not hold. Both
 * `@bkit-build-plan-execute` and `@bkit-build-plan-gaps-remediate` carry an
 * explicit "NO out-of-scope deferral" contract line, and the executor still
 * wrote rows — a blocked plan task is unfinished in-scope work, and routing it
 * to the ledger converts it into something the build loop treats as settled.
 * Its `BLOCKED` log line is the record; the next verify pass reads it.
 *
 * Orchestrator-written rows carry no `subagent` and are outside this check.
 */
export const DEFERRAL_WRITERS: Set<string> = new Set([
  "bkit-design-generate",
  "bkit-plan-generate",
  "bkit-plan-update",
  "bkit-build-challenge-remediate",
  "bkit-debug-abort-handover",
  "bkit-ship-deferred-sweep",
  "bkit-utility-update-deferrals",
]);

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

// outcome — one row per WORKFLOW RUN, keyed by (repo, workflow, parentSha).
// Generalized from the original ship/PR-only shape (#234 follow-up): every workflow
// now writes one run row at its close, carrying just the fields that apply to it
// (absent fields are simply omitted — the summary shows a metric only when present).
// `prNumber` is ship-only; the per-run instinct-loop deltas (frictionAdded /
// deferralsAdded / failuresAdded) are what `workflowTelemetry` features.
export interface OutcomePayload {
  /**
   * Parent commit SHA of the run — the run's identity anchor (shared with the
   * `compliance` / `counter` rows written in the same close). Optional for
   * back-compat with pre-generalization ship rows that keyed off `prNumber`.
   */
  parentSha?: string;
  /** Ship-only: the merged PR number. Absent on design/plan/build/debug runs. */
  prNumber?: number;
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
  /**
   * Per-run instinct-loop DELTAS — how many rows THIS run added to each ledger,
   * counted at close from rows with `workflow == <this workflow>` and
   * `ts >= workflow-started`. Distinct from the cumulative `deferrals`/`failures`
   * above: those are repo totals, these are what this one run contributed.
   * `frictionAdded` is the featured per-workflow signal (see `workflowTelemetry`);
   * all three are optional so a workflow that cannot produce one simply omits it.
   */
  frictionAdded?: number;
  deferralsAdded?: number;
  failuresAdded?: number;
  /** Sweep verdict from ship deferred-sweep step. */
  sweepVerdict?: string;
  /**
   * `"brief"` = the run had no `{FID}-plan*.md` and worked from its input file
   * (build / ship `workflow-meta` row). Absent = the run had a plan. Brief runs
   * report `taskCount` 0 and are baselined only against other brief runs.
   */
  planSource?: "brief";
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
  /**
   * Free-form friction-type tag (see § Categories in .bkit/jsonl.md). Documented
   * set: human-confirm, permission-prompt, agent-rework, manual-install,
   * tool-failure, destructive-backout, other. NOT validated on write — a
   * different axis from the deferral/failure domain vocabulary, and kept
   * free-form for symmetry with them (docs are the single source of truth).
   */
  category: string;
  scope: "bkit-repo" | "consumer" | "universal";
  /** How much this friction hurts — see TelemetrySeverity. */
  severity: TelemetrySeverity;
  /** Short title. `description` carries the prose; without this the title has nowhere to live. */
  summary?: string;
  description: string;
  remediation?: string;
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
  /**
   * Why this is deferred rather than done — see DeferralReason. Required on every
   * row written from this version on; optional in the type because the ledger is
   * append-only and pre-existing rows cannot grow a field they were never asked for.
   */
  reason?: DeferralReason;
  /** OPEN -> TRIAGED -> CLOSED. See TRIAGE_STATUSES; TRIAGED is still open work. */
  status?: TriageStatus;
}

// failure — keyed by explicit `key` field
export interface FailurePayload {
  /**
   * Free-form domain tag (mirrors DeferralPayload.category; see § Categories in
   * .bkit/jsonl.md). `"testing"` marks a flaky / intermittent test — recurrence
   * via same-`key` append is the flake signal; no extra fields. See § Categories.
   */
  category?: string;
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
  /** Absent = `ACTIVE`. Same closed set as `DecisionPayload.status`. */
  status?: "ACTIVE" | "SUPERSEDED";
}

// decision — keyed by explicit `key` field (P5)
export interface DecisionPayload {
  summary: string;
  description?: string;
  rationale?: string;
  alternatives?: string;
  status?: "ACTIVE" | "SUPERSEDED";
}

// feature — keyed by explicit `key` field (the FID). The canonical row for
// `.bkit/issues.jsonl` (#380): a `deferral`/`failure` row MINUS `severity`,
// PLUS the six-state FeatureStatus ladder in place of TriageStatus. Appended
// at every one of the five phase closes (design/plan/build/debug/ship) —
// same-`key` append, last-write-wins fold gives the current phase.
export interface FeaturePayload {
  /** DOMAIN category (shared vocabulary with deferral/failure), NOT completed.md's legacy product-shaped set. */
  category: string;
  /** Short title. `description` carries the prose. */
  summary?: string;
  description: string;
  /** The phase ladder — REQUIRED, closed six-value enum. See FeatureStatus. */
  status: FeatureStatus;
  /**
   * Unix ms the feature ACTUALLY shipped, when that differs from `ts`.
   *
   * `ts` is append time and MUST be minted at append (§ Write Idiom), so a
   * historic row backfilled today sorts as the newest ship. `shippedAt` is not
   * part of the row identity, so it MAY carry a historic literal: an issue's
   * `closed_at`, or a migrated `docs/completed.md` entry's own date. The board's
   * Shipped section ranks on `shippedAt // ts`, so a backfill lands in its real
   * place instead of evicting genuinely recent ships.
   *
   * Optional. A live phase close can omit it — there `ts` already IS the ship
   * time. Only meaningful on `status: "SHIPPED"` rows.
   */
  shippedAt?: number;
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
    | ({ kind: "feature" } & FeaturePayload)
  );

// ---------------------------------------------------------------------------
// Identity — per-kind composite tuple for dedup (NOT bare ts)
// Mirrors bkit-status.ts's tuple dedupe approach.
// ---------------------------------------------------------------------------

export function identity(event: TelemetryEvent): string {
  switch (event.kind) {
    case "compliance":
      return `compliance ${event.repo} ${event.workflow} ${event.parentSha} ${event.rule}`;
    case "outcome": {
      // One run row per workflow run: keyed by (repo, workflow, parentSha).
      // Back-compat: pre-generalization ship rows carry no parentSha, so fall
      // back to prNumber (then ts) — old ship rows stay uniquely keyed per PR.
      const anchor =
        event.parentSha ?? (event.prNumber !== undefined ? `pr${event.prNumber}` : `ts${event.ts}`);
      return `outcome ${event.repo} ${event.workflow} ${anchor}`;
    }
    case "counter":
      return `counter ${event.repo} ${event.workflow} ${event.parentSha} ${event.counterName}`;
    case "friction":
    case "deferral":
    case "failure":
    case "knowledge":
    case "decision":
    case "feature":
      // instinct-loop kinds (+ feature): identity = kind + key
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

  // status — triage ladder on the SEVERITY_KINDS trio, ACTIVE/SUPERSEDED lifecycle on
  // decision and knowledge, absent elsewhere. Optional: absent = ACTIVE on that lifecycle.
  // Enforced on write only; `parse` stays tolerant so legacy free-text statuses still read.
  if (SEVERITY_KINDS.has(kind)) {
    if (e["status"] !== undefined && !TRIAGE_STATUSES.has(e["status"] as string)) {
      return {
        ok: false,
        reason: `${kind} status must be one of OPEN|TRIAGED|CLOSED (got: ${String(e["status"])})`,
      };
    }
  } else if (kind === "decision" || kind === "knowledge") {
    if (e["status"] !== undefined && !DECISION_STATUSES.has(e["status"] as string)) {
      return {
        ok: false,
        reason: `${kind} status must be one of ACTIVE|SUPERSEDED (got: ${String(e["status"])})`,
      };
    }
  } else if (kind === "feature") {
    // status is REQUIRED on feature (unlike the optional triage ladder) — the
    // roadmap projection has no phase to render without it.
    if (e["status"] === undefined || !FEATURE_STATUSES.has(e["status"] as string)) {
      return {
        ok: false,
        reason: `feature status must be one of DESIGNED|PLANNED|BUILT|DEBUGGED|SHIPPED|ABANDONED (got: ${String(e["status"])})`,
      };
    }
  } else if (e["status"] !== undefined) {
    return { ok: false, reason: `${kind} rows do not carry status` };
  }

  // reason — the deferral justification (see DeferralReason). Required on write:
  // an unjustifiable deferral is unfinished work, and the whole point of the field
  // is that it cannot be skipped. Enforced on write only; `parse` stays tolerant so
  // rows appended before the field existed still read.
  if (kind === "deferral") {
    if (e["reason"] === undefined || e["reason"] === null) {
      return { ok: false, reason: "deferral row missing required field: reason" };
    }
    if (!DEFERRAL_REASONS.has(e["reason"] as string)) {
      return {
        ok: false,
        reason: `deferral reason must be one of ${[...DEFERRAL_REASONS].join("|")} (got: ${String(e["reason"])})`,
      };
    }
  } else if (e["reason"] !== undefined) {
    return { ok: false, reason: `${kind} rows do not carry reason` };
  }

  if (kind === "compliance") {
    if (!e["rule"] || !e["result"] || !e["phase"] || !e["parentSha"]) {
      return { ok: false, reason: "compliance row missing required payload fields" };
    }
  }
  if (kind === "outcome") {
    // Every workflow run carries these; `prNumber` is ship-only (see below).
    const numFields = [
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
    // prNumber — ship-only, optional; validate only when present.
    if (e["prNumber"] !== undefined && typeof e["prNumber"] !== "number") {
      return { ok: false, reason: "outcome prNumber must be a number when present" };
    }
    // parentSha — the run's identity anchor; optional (absent on legacy ship rows).
    if (e["parentSha"] !== undefined && typeof e["parentSha"] !== "string") {
      return { ok: false, reason: "outcome parentSha must be a string when present" };
    }
    // Optional per-run numeric metrics: validate type only when present.
    for (const f of [
      "frictionAdded",
      "deferralsAdded",
      "failuresAdded",
      "correctiveCommits",
      "reviewIterations",
      "ciTrySuccess",
    ]) {
      if (e[f] !== undefined && typeof e[f] !== "number") {
        return { ok: false, reason: `outcome ${f} must be a number when present` };
      }
    }
    if (e["planSource"] !== undefined && e["planSource"] !== "brief") {
      return { ok: false, reason: 'outcome planSource must be "brief" when present' };
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
  if (kind === "feature") {
    if (!e["key"] || typeof e["key"] !== "string") {
      return { ok: false, reason: "feature row missing required field: key (the FID)" };
    }
    if (!e["category"] || typeof e["category"] !== "string") {
      return { ok: false, reason: "feature row missing required payload field: category" };
    }
    if (!e["description"] || typeof e["description"] !== "string") {
      return { ok: false, reason: "feature row missing required payload field: description" };
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
  /** Folded ENTITY count per emitting workflow (an updated row folds to one). */
  workflowCounts: Record<string, number>;
  /** The workflow this report is scoped to, when given. */
  workflow?: string;
  /** Human-readable report lines — the block injected into the tracker close comment. */
  lines: string[];
}

// Per-metric baseline: compare THIS run to the previous N runs of the SAME workflow.
/** Rolling-baseline window (median over the previous N same-workflow runs). */
export const RUN_BASELINE_WINDOW = 5;
/** Below this many prior runs the median is noise — show `n/a` instead. */
const RUN_BASELINE_MIN = 3;

// The three stats.jsonl member types, narrowed for the per-workflow report.
type OutcomeEvent = TelemetryEnvelope & { kind: "outcome" } & OutcomePayload;
type ComplianceEvent = TelemetryEnvelope & { kind: "compliance" } & CompliancePayload;
type CounterEvent = TelemetryEnvelope & { kind: "counter" } & CounterPayload;

/** Seconds → compact human duration: `45s` · `33m` · `2h11m`. */
export function humanizeDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return `${sec}s`;
  if (sec < 60) return `${Math.round(sec)}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}m`;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

/** Median (lower-middle for even counts, matching computeElapsedStats). null if empty. */
function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? null;
}

function versionSpread(versionCounts: Record<string, number>): string {
  return (
    Object.entries(versionCounts)
      .map(([v, n]) => `${v}=${n}`)
      .join(", ") || "none"
  );
}

/**
 * Ledger-health readout — the parse-integrity line kept as a footer. Preserves the
 * `rows` / `malformed:` / `versions:` tokens that replaced five wrong bash copies
 * (grep -c printing "0\n0" on zero matches; jq's `//` bucketing "" under an empty
 * key; wc -l counting lines not parsed rows).
 */
function ledgerLine(result: FoldFromResult): string {
  return `[bkit-telemetry] ledger: ${result.rowCount} rows · malformed: ${result.malformedLineCount} · versions: ${versionSpread(result.versionCounts)}`;
}

/**
 * THE per-workflow telemetry report, emitted at each workflow's close step and
 * injected into the tracker close comment (`bkit telemetry summary --phase=<w>`).
 *
 * Scoped STRICTLY to the one workflow — never the design→…→ship chain (this #234
 * follow-up supersedes the original "ship reports the whole chain" note). For the
 * given workflow it shows THIS run's generalized `outcome` (run) row against
 * `med·N` = the median of that workflow's previous N runs (rolling, outlier-robust
 * because durations are right-skewed), a secondary compliance line, and the ledger
 * footer. Fields absent on the run row are omitted — a metric shows only when the
 * workflow actually produced it.
 *
 * Without a workflow it degrades to the ledger-health line alone.
 */
export function workflowTelemetry(result: FoldFromResult, workflow?: string): TelemetrySummary {
  const events = [...result.state.values()];

  // Folded ENTITY count per workflow (not raw lines) — an updated row folds to one.
  const workflowCounts: Record<string, number> = {};
  for (const ev of events) {
    const w = ev.workflow || "unknown";
    workflowCounts[w] = (workflowCounts[w] ?? 0) + 1;
  }

  const base = {
    rowCount: result.rowCount,
    malformedLineCount: result.malformedLineCount,
    versionCounts: result.versionCounts,
    maxRowsWarning: result.maxRowsWarning,
    workflowCounts,
    workflow,
  };

  const maxRowsLines = result.maxRowsWarning
    ? [
        `[bkit-telemetry] WARNING: MAX_ROWS_BEFORE_ROLLUP (${MAX_ROWS_BEFORE_ROLLUP}) exceeded — ${result.rowCount} rows in stats.jsonl; consider archiving.`,
      ]
    : [];

  // No workflow → ledger-health readout only.
  if (!workflow) {
    return { ...base, lines: [ledgerLine(result), ...maxRowsLines] };
  }

  // This workflow's run rows (generalized outcome), oldest → newest.
  const runs = events
    .filter((e): e is OutcomeEvent => e.kind === "outcome" && e.workflow === workflow)
    .sort((a, b) => a.ts - b.ts);
  const cur = runs.at(-1);
  // Baseline only against runs of the same plan source — a brief run (no plan)
  // has no tasks and a different shape, so mixing them skews every median.
  const prev = runs
    .slice(0, -1)
    .filter((r) => r.planSource === cur?.planSource)
    .slice(-RUN_BASELINE_WINDOW);

  const repo = cur?.repo ?? events[0]?.repo ?? "unknown/repo";
  // Rendered as a Markdown table so it drops straight into the tracker comment
  // (no code fence needed) — GitHub/Linear render it natively.
  const lines: string[] = [`**${workflow} close** · ${repo}`, ""];

  const tableRows: string[] = [];
  const row = (label: string, self: string, med: string): void => {
    tableRows.push(`| ${label} | ${self} | ${med} |`);
  };

  if (cur) {
    // med·N: median of the previous runs that carry the field, `—` until there are
    // at least RUN_BASELINE_MIN of them (1–2 samples is noise, not a baseline).
    const medCell = (key: keyof OutcomeEvent, fmt: (n: number) => string = String): string => {
      const vals = prev.map((r) => r[key]).filter((v): v is number => typeof v === "number");
      if (vals.length < RUN_BASELINE_MIN) return "—";
      const m = median(vals);
      return m === null ? "—" : fmt(m);
    };

    // Core metrics — always shown.
    row(
      "durationSeconds",
      `${cur.durationSeconds} (${humanizeDuration(cur.durationSeconds)})`,
      medCell("durationSeconds", (n) => `${n} (${humanizeDuration(n)})`),
    );
    row(
      "linesChanged",
      `${cur.linesChanged} (+${cur.linesAdded}/-${cur.linesDeleted})`,
      medCell("linesChanged"),
    );
    row("filesChanged", `${cur.filesChanged}`, medCell("filesChanged"));

    // Conditional metrics — shown only when this run carries them.
    if (cur.planSource) row("planSource", cur.planSource, "—");
    if (cur.taskCount > 0) row("taskCount", `${cur.taskCount}`, medCell("taskCount"));
    if (typeof cur.reviewIterations === "number")
      row("reviewIterations", `${cur.reviewIterations}`, medCell("reviewIterations"));
    if (typeof cur.correctiveCommits === "number")
      row("correctiveCommits", `${cur.correctiveCommits}`, medCell("correctiveCommits"));
    if (typeof cur.ciTrySuccess === "number")
      row(
        "ciTrySuccess",
        `${cur.ciTrySuccess}${cur.ciTrySuccess === 1 ? " (first-try)" : ""}`,
        medCell("ciTrySuccess"),
      );
    // Instinct-loop deltas — frictionAdded is the featured signal (shown even at 0).
    if (typeof cur.frictionAdded === "number")
      row("frictionAdded", `${cur.frictionAdded}`, medCell("frictionAdded"));
    if (typeof cur.deferralsAdded === "number")
      row("deferralsAdded", `${cur.deferralsAdded}`, medCell("deferralsAdded"));
    if (typeof cur.failuresAdded === "number")
      row("failuresAdded", `${cur.failuresAdded}`, medCell("failuresAdded"));
  }

  // Compliance — this run's rows. The `outcome` and `compliance` rows are written
  // at different points in a close (different HEADs → different parentSha), so we
  // DON'T match on the run row's parentSha: we take the newest same-workflow
  // compliance group (its parentSha) as "this run".
  const complianceRows = events.filter(
    (e): e is ComplianceEvent => e.kind === "compliance" && e.workflow === workflow,
  );
  const compSha = complianceRows.slice().sort((a, b) => b.ts - a.ts)[0]?.parentSha;
  if (compSha) {
    const comp = complianceRows.filter((c) => c.parentSha === compSha);
    const pass = comp.filter((c) => c.result === "pass").length;
    const fail = comp.filter((c) => c.result === "fail").length;
    const na = comp.filter((c) => c.result === "n/a").length;
    const denom = pass + fail + na;
    const rate = denom > 0 ? Math.round((pass / denom) * 100) : 0;
    row("compliance", `${pass} pass · ${fail} fail · ${na} n/a (${rate}%)`, "—");
  }

  // Attempts — the newest same-workflow *_ATTEMPT counter (this run).
  const attempt = events
    .filter(
      (e): e is CounterEvent =>
        e.kind === "counter" && e.workflow === workflow && /_ATTEMPT$/.test(e.counterName),
    )
    .sort((a, b) => b.ts - a.ts)[0];
  if (attempt) row("attempts", `${attempt.counterName} ${attempt.counterValue}`, "—");

  if (tableRows.length > 0) {
    lines.push(
      `| metric | this run | med·${RUN_BASELINE_WINDOW} |`,
      "| --- | --- | --- |",
      ...tableRows,
      "",
    );
  }
  lines.push(
    `\`med·${RUN_BASELINE_WINDOW}\` = median of the previous ${RUN_BASELINE_WINDOW} ${workflow}${cur?.planSource ? ` ${cur.planSource}` : ""} runs (— if < ${RUN_BASELINE_MIN}) · ledger ${result.rowCount} rows, ${result.malformedLineCount} malformed`,
  );
  lines.push(...maxRowsLines);

  return { ...base, lines };
}

// Re-export readline for potential streaming use (optional)
export { readline };
