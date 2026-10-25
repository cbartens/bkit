// commands/analysis.ts — the computations behind `bkit stats` (commands/stats.ts) and the
// cross-repo section of the harvest report (scripts/harvest/, bkit's checkout only).
//
// Provides:
//   1. Counts/rates/elapsed-time over telemetry rows.
//   2. Size↔outcome regression (error rate per `lines.total.added` bucket) over
//      `kind:"outcome"` rows.
//   3. Dispatch-size threshold computation, printed by `bkit stats` and the harvest report.
//   4. `counter.source` trust labelling: each outcome row is joined to its `counter` row
//      (model-self-report or shell-bus).
//   5. Per-rule compliance rate over `kind:"compliance"` rows.
//   6. Per-`bkit.version` release-attributed regression.
//
// Rows are read folded, so rows written without `schema` arrive in the current shape.
//
// All computation is advisory + inform-only; never gates any workflow.
// See DE-34 for the shared-entrypoint + crash-isolation contract.

import {
  AGENT_CONTEXT_CAP,
  UNJUSTIFIED_REASON,
  foldFrom,
  type CompliancePayload,
  type CounterPayload,
  type DeferralPayload,
  type OutcomePayload,
  type TelemetryEnvelope,
  type TelemetryEvent,
} from "../ledgers/telemetry.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A `kind:"outcome"` ledger row: the shared envelope plus the outcome payload. */
export type OutcomeRow = TelemetryEnvelope & OutcomePayload;

/** A `kind:"counter"` ledger row; `counter.source` lives here, never on the outcome row. */
export type CounterRow = TelemetryEnvelope & CounterPayload;

/** A `kind:"compliance"` ledger row. */
export type ComplianceRow = TelemetryEnvelope & CompliancePayload;

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
    const workflow = ev.by?.workflow ?? "unknown";
    byWorkflow[workflow] = (byWorkflow[workflow] ?? 0) + 1;
    byRepo[ev.repo] = (byRepo[ev.repo] ?? 0) + 1;
  }

  return { total: events.length, byKind, byWorkflow, byRepo };
}

// ---------------------------------------------------------------------------
// Elapsed-time stats
// ---------------------------------------------------------------------------

export interface ElapsedStats {
  count: number;
  totalMinutes: number;
  meanMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  p50Minutes: number;
}

/** Over the rows that carry `time.totalMinutes`. */
export function computeElapsedStats(rows: OutcomeRow[]): ElapsedStats {
  const durations = rows
    .map((r) => r.time?.totalMinutes)
    .filter((m): m is number => typeof m === "number")
    .sort((a, b) => a - b);
  if (durations.length === 0) {
    return {
      count: 0,
      totalMinutes: 0,
      meanMinutes: 0,
      minMinutes: 0,
      maxMinutes: 0,
      p50Minutes: 0,
    };
  }
  const total = durations.reduce((s, v) => s + v, 0);
  return {
    count: durations.length,
    totalMinutes: total,
    meanMinutes: total / durations.length,
    minMinutes: durations[0] ?? 0,
    maxMinutes: durations[durations.length - 1] ?? 0,
    p50Minutes: durations[Math.floor(durations.length / 2)] ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Build challenge size gate
// ---------------------------------------------------------------------------

export interface ChallengeGateCounts {
  /** Build runs whose challenge block carries a size gate. */
  runs: number;
  /** Small changes: challenge-2 ran alone. */
  small: number;
  /** Large changes: both reviewers ran. */
  large: number;
}

/** Over the outcome rows whose `build.challenge.gate` is set. */
export function computeChallengeGate(rows: OutcomeRow[]): ChallengeGateCounts {
  const out: ChallengeGateCounts = { runs: 0, small: 0, large: 0 };
  for (const r of rows) {
    const gate = r.build?.challenge?.gate;
    if (gate === undefined) continue;
    out.runs++;
    if (gate.skipped) out.small++;
    else out.large++;
  }
  return out;
}

export interface AgentContextEntry {
  agent: string;
  /** Subagents of this type, over every run. */
  subagents: number;
  /** Workflow runs that started one. */
  runs: number;
  /** The largest context any of them reached, tokens. */
  peak: number;
  /** Workflow runs in which one of them went past `cap`. */
  overCap: number;
}

export interface AgentContextReport {
  cap: number;
  /** Outcome rows read, and those carrying a `context` block. */
  outcomes: number;
  recorded: number;
  /** By agent type, largest peak first. */
  byAgent: AgentContextEntry[];
}

/** Each agent type's context peak over the outcome rows' `context` blocks, against `cap`. */
export function computeAgentContext(
  rows: OutcomeRow[],
  cap: number = AGENT_CONTEXT_CAP,
): AgentContextReport {
  const by: Record<string, AgentContextEntry> = {};
  let recorded = 0;
  for (const r of rows) {
    if (r.context === undefined) continue;
    recorded++;
    for (const [agent, a] of Object.entries(r.context.byAgent)) {
      const e = (by[agent] ??= { agent, subagents: 0, runs: 0, peak: 0, overCap: 0 });
      e.subagents += a.runs;
      e.runs++;
      e.peak = Math.max(e.peak, a.peak);
      if (a.peak > cap) e.overCap++;
    }
  }
  return {
    cap,
    outcomes: rows.length,
    recorded,
    byAgent: Object.values(by).sort((a, b) => b.peak - a.peak || a.agent.localeCompare(b.agent)),
  };
}

// ---------------------------------------------------------------------------
// Size↔outcome regression
//
// Error rate per `lines.total.added` bucket. "Error" = the run added failures
// (`ledgers.failures.repo` rose against the previous run of the repo).
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
   * or the largest bucket if no bucket does. Printed by `bkit stats` and the harvest report.
   */
  dispatchSizeThreshold: number;
  /**
   * Trust tier split: an outcome row is shell-bus when a `counter` row with the same
   * repo + workflow + run.parentSha carries `counter.source: "shell-bus"`
   * (deterministic); every other outcome row is model-self-report (untrusted).
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
 * `ledgers.failures.repo` is the repo's CUMULATIVE distinct-failure count at close.
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
  const failures = (r: OutcomeRow) => r.ledgers?.failures?.repo ?? 0;
  if (!previous) return failures(row);
  return Math.max(0, failures(row) - failures(previous));
}

const isErrorRun = (row: OutcomeRow, allRows: OutcomeRow[]): boolean =>
  newFailuresThisRun(row, allRows) > 0;

/** Identity of one workflow run: the key the close writes on both its counter and outcome rows. */
function runKey(row: TelemetryEnvelope & { run?: { parentSha?: string } }): string | undefined {
  const sha = row.run?.parentSha;
  return sha ? JSON.stringify([row.repo, row.by?.workflow, sha]) : undefined;
}

export function computeRegression(rows: OutcomeRow[], counterRows: CounterRow[]): RegressionResult {
  const shellBusRuns = new Set<string>();
  for (const c of counterRows) {
    const key = runKey(c);
    if (c.counter?.source === "shell-bus" && key !== undefined) shellBusRuns.add(key);
  }

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
    const key = runKey(row);
    if (key !== undefined && shellBusRuns.has(key)) {
      shellBusCount++;
    } else {
      modelSelfReportCount++;
    }

    // Bucket by lines added
    const lines = row.lines?.total?.added ?? 0;
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
    const id = row.rule?.id ?? "unknown";
    if (!byRule[id]) {
      byRule[id] = { passCount: 0, failCount: 0, naCount: 0, totalCount: 0 };
    }
    const r = byRule[id]!;
    r.totalCount++;
    if (row.rule?.verdict === "pass") r.passCount++;
    else if (row.rule?.verdict === "fail") r.failCount++;
    else r.naCount++;
  }

  return Object.entries(byRule).map(([rule, counts]) => ({
    rule,
    ...counts,
    passRate: counts.totalCount > 0 ? counts.passCount / counts.totalCount : 0,
  }));
}

// ---------------------------------------------------------------------------
// Per-bkit.version compliance trend (release-attributed regression)
// ---------------------------------------------------------------------------

export interface VersionComplianceEntry {
  version: string;
  passRate: number;
  totalRuns: number;
}

export function computeVersionCompliance(rows: ComplianceRow[]): VersionComplianceEntry[] {
  const byVersion: Record<string, { pass: number; total: number }> = {};
  for (const row of rows) {
    const version = row.bkit?.version ?? "unknown";
    if (!byVersion[version]) byVersion[version] = { pass: 0, total: 0 };
    const v = byVersion[version]!;
    v.total++;
    if (row.rule?.verdict === "pass") v.pass++;
  }
  return Object.entries(byVersion)
    .map(([version, { pass, total }]) => ({
      version,
      passRate: total > 0 ? pass / total : 0,
      totalRuns: total,
    }))
    .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
}

// ---------------------------------------------------------------------------
// Deferral discipline — unjustified-rate per writer
// ---------------------------------------------------------------------------

/**
 * One folded `kind:"deferral"` entity. `by.subagent` + `by.model` are absent on rows an
 * orchestrator wrote directly (`.bkit/jsonl.md` § Who Wrote It).
 */
export type DeferralRow = TelemetryEnvelope & Partial<DeferralPayload>;

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
      row.by?.subagent ?? (row.by?.workflow ? `${row.by.workflow} (orchestrator)` : "unattributed");
    const model = row.by?.model ?? "unknown";
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
  challengeGate: ChallengeGateCounts;
  agentContext: AgentContextReport;
  reportLines: string[];
}

/** Analyse the folded rows of `paths`, leaving out rows of `skipKinds`. */
export function runAnalysis(
  paths: string[],
  skipKinds: ReadonlySet<string> = new Set(),
): AnalysisReport {
  const { state, rowCount, malformedLineCount } = foldFrom(paths);
  const events = [...state.values()].filter((ev) => !skipKinds.has(ev.kind));

  const outcomeRows: OutcomeRow[] = [];
  const counterRows: CounterRow[] = [];
  const complianceRows: ComplianceRow[] = [];
  const deferralRows: DeferralRow[] = [];

  for (const ev of events) {
    if (ev.kind === "outcome") {
      outcomeRows.push(ev);
    } else if (ev.kind === "counter") {
      counterRows.push(ev);
    } else if (ev.kind === "compliance") {
      complianceRows.push(ev);
    } else if (ev.kind === "deferral") {
      deferralRows.push(ev);
    }
  }

  const counts = computeCounts(events);
  const elapsed = computeElapsedStats(outcomeRows);
  const regression = computeRegression(outcomeRows, counterRows);
  const complianceRates = computeComplianceRates(complianceRows);
  const versionCompliance = computeVersionCompliance(complianceRows);
  const deferralDiscipline = computeDeferralDiscipline(deferralRows);
  const challengeGate = computeChallengeGate(outcomeRows);
  const agentContext = computeAgentContext(outcomeRows);

  const reportLines: string[] = [
    `[bkit-analysis] Telemetry rows: ${rowCount} | malformed: ${malformedLineCount}`,
    `[bkit-analysis] Kinds: ${JSON.stringify(counts.byKind)}`,
    `[bkit-analysis] Workflows: ${JSON.stringify(counts.byWorkflow)}`,
    `[bkit-analysis] Run outcomes: ${outcomeRows.length} | Compliance rows: ${complianceRows.length}`,
  ];

  if (elapsed.count > 0) {
    reportLines.push(
      `[bkit-analysis] Duration (min): mean=${elapsed.meanMinutes.toFixed(1)} | p50=${elapsed.p50Minutes.toFixed(1)} | min=${elapsed.minMinutes} | max=${elapsed.maxMinutes}`,
    );
  }

  // Regression report
  reportLines.push(
    `[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: ${regression.dispatchSizeThreshold} lines added):`,
  );
  for (const b of regression.buckets) {
    if (b.count > 0) {
      reportLines.push(
        `  ${b.label}: ${b.count} runs, ${b.errorCount} errors (${(b.errorRate * 100).toFixed(1)}%)`,
      );
    }
  }
  reportLines.push(
    `[bkit-analysis] counter.source trust: shell-bus=${regression.shellBusCount} (trusted) | model-self-report=${regression.modelSelfReportCount} (untrusted)`,
  );

  if (challengeGate.runs > 0) {
    reportLines.push(
      `[bkit-analysis] Build challenge size: ${challengeGate.small} small (challenge-1 skipped) | ${challengeGate.large} large, of ${challengeGate.runs} runs`,
    );
  }

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
    reportLines.push(`[bkit-analysis] Per-bkit.version compliance:`);
    for (const v of versionCompliance) {
      reportLines.push(
        `  v${v.version}: ${(v.passRate * 100).toFixed(1)}% pass (${v.totalRuns} runs)`,
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
    challengeGate,
    agentContext,
    reportLines,
  };
}
