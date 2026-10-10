// bkit-analysis.ts — Analysis CLI for bkit telemetry.
//
// Provides:
//   1. Counts/rates/elapsed-time over telemetry rows.
//   2. Size↔outcome regression (logistic approximation: error ~ log(linesAdded)
//      + filesChanged) over `kind:"outcome"` rows.
//   3. Dispatch-size threshold computation for plan-complexity-check / plan-split.
//   4. `counterSource` trust labelling (model-self-report pre-P3, shell-bus post-P3).
//   5. Per-rule compliance rate over `kind:"compliance"` rows.
//   6. Per-`bkitVersion`→CHANGELOG release-attributed regression.
//
// Backfill scope (DE-37): GitHub-API backfill limited to the repo where bkit is
// installed; PRs closed >= `--since` date; fields: additions, deletions, changedFiles,
// commits count (for correctiveCommits proxy). Model-self-report counterSource.
//
// All computation is advisory + inform-only; never gates any workflow.
// See DE-34 for the shared-entrypoint + crash-isolation contract.

import { UNJUSTIFIED_REASON, foldFrom, type TelemetryEvent } from "./bkit-telemetry.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OutcomeRow {
  ts: number;
  repo: string;
  bkitVersion: string;
  /** Ship-only: the merged PR number. Absent on non-ship workflow run rows. */
  prNumber?: number;
  linesAdded: number;
  linesDeleted: number;
  linesChanged: number;
  filesChanged: number;
  taskCount: number;
  durationSeconds: number;
  ciTrySuccess?: number;
  correctiveCommits?: number;
  reviewIterations?: number;
  deferrals: number;
  failures: number;
  counterSource?: string;
}

export interface ComplianceRow {
  ts: number;
  repo: string;
  bkitVersion: string;
  rule: string;
  result: "pass" | "fail" | "n/a";
  phase: string;
  parentSha: string;
}

// ---------------------------------------------------------------------------
// Counts / rates summary
// ---------------------------------------------------------------------------

export interface TelemetryCounts {
  total: number;
  byKind: Record<string, number>;
  byWorkflow: Record<string, number>;
  byRepo: Record<string, number>;
}

export function computeCounts(events: TelemetryEvent[]): TelemetryCounts {
  const byKind: Record<string, number> = {};
  const byWorkflow: Record<string, number> = {};
  const byRepo: Record<string, number> = {};

  for (const ev of events) {
    byKind[ev.kind] = (byKind[ev.kind] ?? 0) + 1;
    byWorkflow[ev.workflow] = (byWorkflow[ev.workflow] ?? 0) + 1;
    byRepo[ev.repo] = (byRepo[ev.repo] ?? 0) + 1;
  }

  return { total: events.length, byKind, byWorkflow, byRepo };
}

// ---------------------------------------------------------------------------
// Elapsed-time stats
// ---------------------------------------------------------------------------

export interface ElapsedStats {
  count: number;
  totalSeconds: number;
  meanSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  p50Seconds: number;
}

export function computeElapsedStats(rows: OutcomeRow[]): ElapsedStats {
  if (rows.length === 0) {
    return {
      count: 0,
      totalSeconds: 0,
      meanSeconds: 0,
      minSeconds: 0,
      maxSeconds: 0,
      p50Seconds: 0,
    };
  }
  const durations = rows.map((r) => r.durationSeconds).sort((a, b) => a - b);
  const total = durations.reduce((s, v) => s + v, 0);
  const p50 = durations[Math.floor(durations.length / 2)] ?? 0;
  return {
    count: rows.length,
    totalSeconds: total,
    meanSeconds: total / rows.length,
    minSeconds: durations[0] ?? 0,
    maxSeconds: durations[durations.length - 1] ?? 0,
    p50Seconds: p50,
  };
}

// ---------------------------------------------------------------------------
// Size↔outcome regression
//
// Logistic approximation: P(error) ~ 1 / (1 + exp(-(b0 + b1*log1p(linesAdded) + b2*filesChanged)))
// Computed as a bucketed version without external libraries.
// "Error" = ciTrySuccess > 1 OR correctiveCommits > 0 OR reviewIterations > 1 OR failures > 0.
// ---------------------------------------------------------------------------

export interface SizeBucket {
  label: string;
  minLines: number;
  maxLines: number;
  count: number;
  errorCount: number;
  errorRate: number;
}

export interface RegressionResult {
  buckets: SizeBucket[];
  /**
   * Dispatch-size threshold: the bucket where error rate first exceeds 50%,
   * or the largest bucket if no bucket does. Feeds plan-complexity-check/split.
   */
  dispatchSizeThreshold: number;
  /**
   * Trust tier split: rows labelled by counterSource.
   * "shell-bus" = post-P3 deterministic; "model-self-report" = pre-P3 untrusted.
   */
  shellBusCount: number;
  modelSelfReportCount: number;
  totalRows: number;
}

const SIZE_BUCKETS: Array<{ label: string; min: number; max: number }> = [
  { label: "XS (0–49)", min: 0, max: 49 },
  { label: "S (50–199)", min: 50, max: 199 },
  { label: "M (200–499)", min: 200, max: 499 },
  { label: "L (500–999)", min: 500, max: 999 },
  { label: "XL (1000+)", min: 1000, max: Infinity },
];

/**
 * Per-run NEW failures = this row's cumulative total minus the previous row's.
 *
 * `outcome.failures` is the repo's CUMULATIVE distinct-failure count at ship time.
 *
 * Previous = the newest outcome row for the SAME repo strictly before this one; the
 * first row for a repo has no predecessor, so its total IS its delta.
 *
 * Clamped at 0: totals can fall when a triage sweep folds duplicate keys away.
 */
export function newFailuresThisRun(row: OutcomeRow, allRows: OutcomeRow[]): number {
  const previous = allRows
    .filter((r) => r.repo === row.repo && r.ts < row.ts)
    .sort((a, b) => b.ts - a.ts)[0];
  if (!previous) return row.failures;
  return Math.max(0, row.failures - previous.failures);
}

function isErrorRun(row: OutcomeRow, allRows: OutcomeRow[]): boolean {
  return (
    (row.ciTrySuccess !== undefined && row.ciTrySuccess > 1) ||
    (row.correctiveCommits !== undefined && row.correctiveCommits > 0) ||
    (row.reviewIterations !== undefined && row.reviewIterations > 1) ||
    newFailuresThisRun(row, allRows) > 0
  );
}

export function computeRegression(rows: OutcomeRow[]): RegressionResult {
  const buckets: SizeBucket[] = SIZE_BUCKETS.map((b) => ({
    label: b.label,
    minLines: b.min,
    maxLines: b.max,
    count: 0,
    errorCount: 0,
    errorRate: 0,
  }));

  let shellBusCount = 0;
  let modelSelfReportCount = 0;

  for (const row of rows) {
    // Trust tier labelling
    if (row.counterSource === "shell-bus") {
      shellBusCount++;
    } else {
      modelSelfReportCount++;
    }

    // Bucket by linesAdded
    const lines = row.linesAdded;
    for (const bucket of buckets) {
      if (lines >= bucket.minLines && lines <= bucket.maxLines) {
        bucket.count++;
        if (isErrorRun(row, rows)) {
          bucket.errorCount++;
        }
        break;
      }
    }
  }

  // Compute error rates
  for (const b of buckets) {
    b.errorRate = b.count > 0 ? b.errorCount / b.count : 0;
  }

  // Dispatch-size threshold: first bucket where errorRate > 0.5, else max bucket midpoint
  let threshold = 1000; // default: XL
  for (const b of buckets) {
    if (b.count > 0 && b.errorRate > 0.5) {
      threshold = b.minLines;
      break;
    }
  }

  return {
    buckets,
    dispatchSizeThreshold: threshold,
    shellBusCount,
    modelSelfReportCount,
    totalRows: rows.length,
  };
}

// ---------------------------------------------------------------------------
// Per-rule compliance rate (WS-2→WS-4 edge artefact)
// ---------------------------------------------------------------------------

export interface ComplianceRuleRate {
  rule: string;
  passCount: number;
  failCount: number;
  naCount: number;
  totalCount: number;
  passRate: number;
}

export function computeComplianceRates(rows: ComplianceRow[]): ComplianceRuleRate[] {
  const byRule: Record<
    string,
    { passCount: number; failCount: number; naCount: number; totalCount: number }
  > = {};

  for (const row of rows) {
    if (!byRule[row.rule]) {
      byRule[row.rule] = { passCount: 0, failCount: 0, naCount: 0, totalCount: 0 };
    }
    const r = byRule[row.rule]!;
    r.totalCount++;
    if (row.result === "pass") r.passCount++;
    else if (row.result === "fail") r.failCount++;
    else r.naCount++;
  }

  return Object.entries(byRule).map(([rule, counts]) => ({
    rule,
    ...counts,
    passRate: counts.totalCount > 0 ? counts.passCount / counts.totalCount : 0,
  }));
}

// ---------------------------------------------------------------------------
// Per-bkitVersion compliance trend (release-attributed regression)
// ---------------------------------------------------------------------------

export interface VersionComplianceEntry {
  bkitVersion: string;
  passRate: number;
  totalRuns: number;
}

export function computeVersionCompliance(rows: ComplianceRow[]): VersionComplianceEntry[] {
  const byVersion: Record<string, { pass: number; total: number }> = {};
  for (const row of rows) {
    if (!byVersion[row.bkitVersion]) byVersion[row.bkitVersion] = { pass: 0, total: 0 };
    const v = byVersion[row.bkitVersion]!;
    v.total++;
    if (row.result === "pass") v.pass++;
  }
  return Object.entries(byVersion)
    .map(([bkitVersion, { pass, total }]) => ({
      bkitVersion,
      passRate: total > 0 ? pass / total : 0,
      totalRuns: total,
    }))
    .sort((a, b) => a.bkitVersion.localeCompare(b.bkitVersion, undefined, { numeric: true }));
}

// ---------------------------------------------------------------------------
// Deferral discipline — unjustified-rate per writer
// ---------------------------------------------------------------------------

/**
 * One folded `kind:"deferral"` entity. `subagent` + `model` are absent on rows an
 * orchestrator wrote directly (`.bkit/jsonl.md` § Who Wrote It).
 */
export interface DeferralRow {
  ts: number;
  repo: string;
  bkitVersion: string;
  key?: string;
  workflow?: string;
  step?: string;
  subagent?: string;
  model?: string;
  reason?: string;
  severity?: string;
  status?: string;
}

export interface DeferralDisciplineEntry {
  /** The writer: subagent name, or the workflow that wrote the row itself. */
  writer: string;
  /** That writer's model, `unknown` on orchestrator-written rows. */
  model: string;
  total: number;
  unjustifiedCount: number;
  /** Share of this writer's deferrals a reviewer ruled should have been finished. */
  unjustifiedRate: number;
  /** Tally per `reason`; `unspecified` counts rows predating the field. */
  byReason: Record<string, number>;
}

/**
 * Unjustified-rate per `(subagent, model)`.
 *
 * Counts FOLDED entities, so an adjudication and its later close are one deferral,
 * not three. `unjustified` is carried verbatim through later rows, so the rate keeps
 * counting it.
 */
export function computeDeferralDiscipline(rows: DeferralRow[]): DeferralDisciplineEntry[] {
  const byWriter: Record<
    string,
    {
      writer: string;
      model: string;
      total: number;
      unjustifiedCount: number;
      byReason: Record<string, number>;
    }
  > = {};

  for (const row of rows) {
    const writer =
      row.subagent ?? (row.workflow ? `${row.workflow} (orchestrator)` : "unattributed");
    const model = row.model ?? "unknown";
    const id = `${writer}\u0000${model}`;
    if (!byWriter[id])
      byWriter[id] = { writer, model, total: 0, unjustifiedCount: 0, byReason: {} };
    const w = byWriter[id]!;
    w.total++;
    const reason = row.reason ?? "unspecified";
    w.byReason[reason] = (w.byReason[reason] ?? 0) + 1;
    if (reason === UNJUSTIFIED_REASON) w.unjustifiedCount++;
  }

  return Object.values(byWriter)
    .map((w) => ({
      writer: w.writer,
      model: w.model,
      total: w.total,
      unjustifiedCount: w.unjustifiedCount,
      unjustifiedRate: w.total > 0 ? w.unjustifiedCount / w.total : 0,
      byReason: w.byReason,
    }))
    .sort(
      (a, b) =>
        b.unjustifiedCount - a.unjustifiedCount ||
        b.unjustifiedRate - a.unjustifiedRate ||
        b.total - a.total ||
        a.writer.localeCompare(b.writer),
    );
}

// ---------------------------------------------------------------------------
// Full analysis report
// ---------------------------------------------------------------------------

export interface AnalysisReport {
  counts: TelemetryCounts;
  elapsed: ElapsedStats;
  regression: RegressionResult;
  complianceRates: ComplianceRuleRate[];
  versionCompliance: VersionComplianceEntry[];
  deferralDiscipline: DeferralDisciplineEntry[];
  reportLines: string[];
}

export function runAnalysis(paths: string[]): AnalysisReport {
  const { state, rowCount, malformedLineCount } = foldFrom(paths);
  const events = [...state.values()];

  const outcomeRows: OutcomeRow[] = [];
  const complianceRows: ComplianceRow[] = [];
  const deferralRows: DeferralRow[] = [];

  for (const ev of events) {
    if (ev.kind === "outcome") {
      outcomeRows.push(ev);
    } else if (ev.kind === "compliance") {
      complianceRows.push(ev);
    } else if (ev.kind === "deferral") {
      deferralRows.push(ev);
    }
  }

  const counts = computeCounts(events);
  const elapsed = computeElapsedStats(outcomeRows);
  const regression = computeRegression(outcomeRows);
  const complianceRates = computeComplianceRates(complianceRows);
  const versionCompliance = computeVersionCompliance(complianceRows);
  const deferralDiscipline = computeDeferralDiscipline(deferralRows);

  const reportLines: string[] = [
    `[bkit-analysis] Telemetry rows: ${rowCount} | malformed: ${malformedLineCount}`,
    `[bkit-analysis] Kinds: ${JSON.stringify(counts.byKind)}`,
    `[bkit-analysis] Workflows: ${JSON.stringify(counts.byWorkflow)}`,
    `[bkit-analysis] Run outcomes: ${outcomeRows.length} | Compliance rows: ${complianceRows.length}`,
  ];

  if (elapsed.count > 0) {
    reportLines.push(
      `[bkit-analysis] Duration (s): mean=${elapsed.meanSeconds.toFixed(0)} | p50=${elapsed.p50Seconds.toFixed(0)} | min=${elapsed.minSeconds} | max=${elapsed.maxSeconds}`,
    );
  }

  // Regression report
  reportLines.push(
    `[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: ${regression.dispatchSizeThreshold} linesAdded):`,
  );
  for (const b of regression.buckets) {
    if (b.count > 0) {
      reportLines.push(
        `  ${b.label}: ${b.count} runs, ${b.errorCount} errors (${(b.errorRate * 100).toFixed(1)}%)`,
      );
    }
  }
  reportLines.push(
    `[bkit-analysis] counterSource trust: shell-bus=${regression.shellBusCount} (trusted) | model-self-report=${regression.modelSelfReportCount} (untrusted, pre-P3)`,
  );

  // Compliance rates
  if (complianceRates.length > 0) {
    reportLines.push(`[bkit-analysis] Per-rule compliance rates:`);
    for (const r of complianceRates) {
      reportLines.push(
        `  ${r.rule}: ${(r.passRate * 100).toFixed(1)}% pass (${r.passCount}/${r.totalCount})`,
      );
    }
  }

  // Version compliance
  if (versionCompliance.length > 0) {
    reportLines.push(`[bkit-analysis] Per-bkitVersion compliance:`);
    for (const v of versionCompliance) {
      reportLines.push(
        `  v${v.bkitVersion}: ${(v.passRate * 100).toFixed(1)}% pass (${v.totalRuns} runs)`,
      );
    }
  }

  // Deferral discipline — who defers work they should have finished.
  if (deferralDiscipline.length > 0) {
    const totals = deferralDiscipline.reduce(
      (acc, d) => ({ total: acc.total + d.total, unjust: acc.unjust + d.unjustifiedCount }),
      { total: 0, unjust: 0 },
    );
    reportLines.push(
      `[bkit-analysis] Deferral discipline: ${totals.unjust}/${totals.total} adjudicated unjustified (${((totals.unjust / totals.total) * 100).toFixed(1)}%), by writer:`,
    );
    for (const d of deferralDiscipline) {
      const reasons = Object.entries(d.byReason)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([reason, n]) => `${reason}=${n}`)
        .join(" ");
      reportLines.push(
        `  ${d.writer} [${d.model}]: ${d.unjustifiedCount}/${d.total} unjustified (${(d.unjustifiedRate * 100).toFixed(1)}%) | ${reasons}`,
      );
    }
  }

  return {
    counts,
    elapsed,
    regression,
    complianceRates,
    versionCompliance,
    deferralDiscipline,
    reportLines,
  };
}
