// commands/analysis.test.ts — Unit tests for the analysis CLI:
//   - size↔outcome regression + dispatch-size threshold over `outcome` rows;
//     `counterSource` trust tier labels
//   - per-rule compliance rate over `kind:"compliance"` rows

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  computeComplianceRates,
  computeCounts,
  computeDeferralDiscipline,
  computeElapsedStats,
  computeRegression,
  computeVersionCompliance,
  newFailuresThisRun,
  runAnalysis,
  type ComplianceRow,
  type CounterRow,
  type DeferralRow,
  type OutcomeRow,
} from "./analysis";
import type { TelemetryEvent } from "../ledgers/telemetry";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function baseEnvelope(kind: string): Record<string, unknown> {
  return {
    ts: Date.now(),
    kind,
    repo: "cbartens/bkit",
    bkitVersion: "4.1.4",
    workflow: "ship",
    step: "ship-close-workflow",
  };
}

function outcomeRow(
  ts: number,
  linesAdded: number,
  filesChanged: number,
  errorFields: Partial<OutcomeRow> = {},
): OutcomeRow {
  return {
    ts,
    kind: "outcome",
    repo: "cbartens/bkit",
    bkitVersion: "4.1.4",
    workflow: "ship",
    step: "ship-close-workflow",
    parentSha: `sha-${ts}`,
    prNumber: ts % 10000,
    linesAdded: linesAdded,
    linesDeleted: Math.floor(linesAdded * 0.2),
    linesChanged: linesAdded + Math.floor(linesAdded * 0.2),
    filesChanged: filesChanged,
    taskCount: 5,
    durationSeconds: 3600,
    deferrals: 0,
    failures: 0,
    ...errorFields,
  };
}

/** The counter row the workflow close writes alongside an outcome row (same repo/workflow/parentSha). */
function counterRowFor(
  outcome: OutcomeRow,
  counterSource: CounterRow["counterSource"] = "shell-bus",
  over: Partial<CounterRow> = {},
): CounterRow {
  return {
    ts: outcome.ts - 1,
    kind: "counter",
    repo: outcome.repo,
    bkitVersion: outcome.bkitVersion,
    workflow: outcome.workflow,
    step: outcome.step,
    counterName: "SHIP_ATTEMPT",
    counterValue: 1,
    parentSha: outcome.parentSha ?? "",
    counterSource,
    ...over,
  };
}

function complianceRow(
  ts: number,
  rule: string,
  result: "pass" | "fail" | "n/a",
  bkitVersion = "4.1.4",
): ComplianceRow {
  return {
    ts,
    repo: "cbartens/bkit",
    bkitVersion,
    rule,
    result,
    phase: "ship",
    parentSha: "abc123",
  };
}

function telemetryRow(
  kind: string,
  ts: number,
  extra: Record<string, unknown> = {},
): TelemetryEvent {
  return { ...baseEnvelope(kind), ts, ...extra } as TelemetryEvent;
}

// ---------------------------------------------------------------------------
// Temp dir helpers
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-analysis-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// size↔outcome regression + dispatch-size threshold + counterSource
// ---------------------------------------------------------------------------

// outcome.deferrals/failures are the repo's CUMULATIVE distinct-entity totals at
// ship time, so per-run discoveries are the delta against the previous row.
describe("newFailuresThisRun — per-run delta over cumulative totals", () => {
  it("a flat cumulative total is NOT a new failure each run", () => {
    const rows: OutcomeRow[] = [
      outcomeRow(1001, 10, 2, { failures: 1 }), // the repo's first-ever bug
      outcomeRow(1002, 20, 3, { failures: 1 }), // same total — nothing new
      outcomeRow(1003, 30, 4, { failures: 1 }), // still nothing new
    ];
    expect(newFailuresThisRun(rows[0]!, rows)).toBe(1); // no predecessor: total IS delta
    expect(newFailuresThisRun(rows[1]!, rows)).toBe(0);
    expect(newFailuresThisRun(rows[2]!, rows)).toBe(0);

    // Only the first run is an error run — an absolute-total test would flag all three.
    const result = computeRegression(rows, []);
    const xs = result.buckets.find((b) => b.label.startsWith("XS"))!;
    expect(xs.count).toBe(3);
    expect(xs.errorCount).toBe(1);
  });

  it("a rising total marks exactly the run that raised it", () => {
    const rows: OutcomeRow[] = [
      outcomeRow(1001, 10, 2, { failures: 2 }),
      outcomeRow(1002, 20, 3, { failures: 5 }), // +3 discovered this run
    ];
    expect(newFailuresThisRun(rows[1]!, rows)).toBe(3);
  });

  it("deltas are per-repo — another repo's ledger must not leak in", () => {
    const mine = outcomeRow(1002, 20, 3, { failures: 1 });
    const theirs: OutcomeRow = { ...outcomeRow(1001, 10, 2, { failures: 9 }), repo: "other/repo" };
    // Only predecessor is from a different repo, so `mine` has none of its own.
    expect(newFailuresThisRun(mine, [theirs, mine])).toBe(1);
  });

  it("a falling total is not an error run — triage folding duplicates away", () => {
    const rows: OutcomeRow[] = [
      outcomeRow(1001, 10, 2, { failures: 4 }),
      outcomeRow(1002, 20, 3, { failures: 2 }), // sweep collapsed dupes
    ];
    expect(newFailuresThisRun(rows[1]!, rows)).toBe(0);
  });

  it("uses the newest prior row, not file order", () => {
    const newest = outcomeRow(3000, 20, 3, { failures: 5 });
    const oldest = outcomeRow(1000, 10, 2, { failures: 1 });
    const middle = outcomeRow(2000, 15, 2, { failures: 4 });
    // shuffled input — ts must decide the predecessor
    expect(newFailuresThisRun(newest, [newest, oldest, middle])).toBe(1);
  });
});

describe("computeRegression — #183 size↔outcome (WS4-T3)", () => {
  it("computes error rate per size bucket", () => {
    const rows: OutcomeRow[] = [
      // XS (0–49): 2 runs, 0 errors
      outcomeRow(1001, 10, 2),
      outcomeRow(1002, 20, 3),
      // M (200–499): 2 runs, 1 error (failures > 0)
      outcomeRow(1003, 300, 10, { failures: 1 }),
      outcomeRow(1004, 400, 12),
      // XL (1000+): 2 runs, 2 errors
      outcomeRow(1005, 1500, 30, { ciTrySuccess: 2 }),
      outcomeRow(1006, 2000, 40, { correctiveCommits: 1 }),
    ];

    const result = computeRegression(rows, []);

    const xs = result.buckets.find((b) => b.label.startsWith("XS"))!;
    const m = result.buckets.find((b) => b.label.startsWith("M"))!;
    const xl = result.buckets.find((b) => b.label.startsWith("XL"))!;

    expect(xs.count).toBe(2);
    expect(xs.errorCount).toBe(0);
    expect(xs.errorRate).toBe(0);

    expect(m.count).toBe(2);
    expect(m.errorCount).toBe(1);
    expect(m.errorRate).toBe(0.5);

    expect(xl.count).toBe(2);
    expect(xl.errorCount).toBe(2);
    expect(xl.errorRate).toBe(1.0);
  });

  it("dispatch-size threshold is the first bucket with errorRate > 50%", () => {
    const rows: OutcomeRow[] = [
      // S (50–199): 2 runs, 1 error (50%) — borderline
      outcomeRow(1001, 100, 5, { failures: 1 }),
      outcomeRow(1002, 150, 6),
      // M (200–499): 2 runs, 2 errors (100%)
      outcomeRow(1003, 250, 8, { failures: 2 }),
      outcomeRow(1004, 300, 9, { ciTrySuccess: 3 }),
    ];

    const result = computeRegression(rows, []);

    // M is first bucket with errorRate > 0.5 (S is exactly 0.5 = NOT strictly > 0.5)
    expect(result.dispatchSizeThreshold).toBe(200); // M bucket min
  });

  it("defaults dispatch-size threshold to 1000 when no bucket exceeds 50%", () => {
    const rows: OutcomeRow[] = [outcomeRow(1001, 10, 2), outcomeRow(1002, 300, 5)];

    const result = computeRegression(rows, []);
    expect(result.dispatchSizeThreshold).toBe(1000);
  });

  it("counts an outcome row as trusted when a shell-bus counter row shares its repo, workflow and parentSha", () => {
    const rows = [outcomeRow(1001, 10, 2), outcomeRow(1002, 20, 3), outcomeRow(1003, 30, 4)];
    const counters = [counterRowFor(rows[0]!), counterRowFor(rows[1]!)];

    const result = computeRegression(rows, counters);
    expect(result.shellBusCount).toBe(2);
    expect(result.modelSelfReportCount).toBe(1);
    expect(result.totalRows).toBe(3);
  });

  it("counts an outcome row with no counter row as untrusted", () => {
    const rows = [outcomeRow(1001, 100, 5), outcomeRow(1002, 200, 6)];

    const result = computeRegression(rows, []);
    expect(result.modelSelfReportCount).toBe(2);
    expect(result.shellBusCount).toBe(0);
    // Still computes regression — just labels them untrusted
    expect(result.totalRows).toBe(2);
  });

  it("counts an outcome row as untrusted when its matching counter row is model-self-report", () => {
    const row = outcomeRow(1001, 100, 5);

    const result = computeRegression([row], [counterRowFor(row, "model-self-report")]);
    expect(result.shellBusCount).toBe(0);
    expect(result.modelSelfReportCount).toBe(1);
  });

  it("does not trust an outcome row because of a shell-bus counter from another parentSha, workflow or repo", () => {
    const row = outcomeRow(1001, 100, 5);
    const counters = [
      counterRowFor(row, "shell-bus", { parentSha: "some-other-sha" }),
      counterRowFor(row, "shell-bus", { workflow: "build" }),
      counterRowFor(row, "shell-bus", { repo: "other/repo" }),
    ];

    const result = computeRegression([row], counters);
    expect(result.shellBusCount).toBe(0);
    expect(result.modelSelfReportCount).toBe(1);
  });

  it("counts an outcome row without a parentSha as untrusted", () => {
    const row = outcomeRow(1001, 100, 5);
    delete row.parentSha;

    const result = computeRegression([row], [counterRowFor(row, "shell-bus", { parentSha: "" })]);
    expect(result.shellBusCount).toBe(0);
    expect(result.modelSelfReportCount).toBe(1);
  });

  it("handles empty input", () => {
    const result = computeRegression([], []);
    expect(result.totalRows).toBe(0);
    expect(result.shellBusCount).toBe(0);
    expect(result.modelSelfReportCount).toBe(0);
    expect(result.dispatchSizeThreshold).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// WS4-T3: per-rule compliance rate (WS-2→WS-4 edge artefact)
// ---------------------------------------------------------------------------

describe("computeComplianceRates — per-rule compliance (WS4-T3, WS-2→WS-4 edge)", () => {
  it("computes pass rate per rule from kind:compliance rows", () => {
    const rows: ComplianceRow[] = [
      complianceRow(1001, "no-mirror-edit", "pass"),
      complianceRow(1002, "no-mirror-edit", "pass"),
      complianceRow(1003, "no-mirror-edit", "fail"),
      complianceRow(1004, "skip-ci-not-head", "pass"),
      complianceRow(1005, "skip-ci-not-head", "n/a"),
    ];

    const rates = computeComplianceRates(rows);
    const mirrorRate = rates.find((r) => r.rule === "no-mirror-edit")!;
    const skipRate = rates.find((r) => r.rule === "skip-ci-not-head")!;

    expect(mirrorRate.passCount).toBe(2);
    expect(mirrorRate.failCount).toBe(1);
    expect(mirrorRate.totalCount).toBe(3);
    expect(mirrorRate.passRate).toBeCloseTo(2 / 3);

    expect(skipRate.passCount).toBe(1);
    expect(skipRate.naCount).toBe(1);
    expect(skipRate.totalCount).toBe(2);
    expect(skipRate.passRate).toBe(0.5);
  });

  it("returns empty array for no compliance rows", () => {
    expect(computeComplianceRates([])).toHaveLength(0);
  });

  it("handles all-fail rule", () => {
    const rows: ComplianceRow[] = [
      complianceRow(1001, "no-mirror-edit", "fail"),
      complianceRow(1002, "no-mirror-edit", "fail"),
    ];
    const rates = computeComplianceRates(rows);
    expect(rates[0]!.passRate).toBe(0);
    expect(rates[0]!.failCount).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeVersionCompliance
// ---------------------------------------------------------------------------

describe("computeVersionCompliance", () => {
  it("computes per-bkitVersion compliance trend", () => {
    const rows: ComplianceRow[] = [
      complianceRow(1001, "no-mirror-edit", "pass", "4.1.3"),
      complianceRow(1002, "no-mirror-edit", "fail", "4.1.3"),
      complianceRow(1003, "no-mirror-edit", "pass", "4.1.4"),
      complianceRow(1004, "no-mirror-edit", "pass", "4.1.4"),
    ];

    const result = computeVersionCompliance(rows);
    const v413 = result.find((v) => v.bkitVersion === "4.1.3")!;
    const v414 = result.find((v) => v.bkitVersion === "4.1.4")!;

    expect(v413.passRate).toBe(0.5);
    expect(v413.totalRuns).toBe(2);
    expect(v414.passRate).toBe(1.0);
    expect(v414.totalRuns).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// computeDeferralDiscipline
// ---------------------------------------------------------------------------

describe("computeDeferralDiscipline", () => {
  const deferral = (over: Partial<DeferralRow> = {}): DeferralRow => ({
    ts: 1000,
    repo: "cbartens/bkit",
    bkitVersion: "4.10.0",
    workflow: "build",
    subagent: "bkit-build-challenge-remediate",
    model: "claude-sonnet-5",
    reason: "scope-declared",
    ...over,
  });

  it("rates unjustified deferrals per (subagent, model)", () => {
    const result = computeDeferralDiscipline([
      deferral({ key: "a", reason: "unjustified" }),
      deferral({ key: "b", reason: "unjustified" }),
      deferral({ key: "c", reason: "hard-blocked" }),
      deferral({ key: "d", reason: "scope-declared" }),
      deferral({ key: "e", subagent: "bkit-design-generate", model: "claude-opus-5" }),
    ]);

    const remediate = result.find((d) => d.writer === "bkit-build-challenge-remediate")!;
    expect(remediate.total).toBe(4);
    expect(remediate.unjustifiedCount).toBe(2);
    expect(remediate.unjustifiedRate).toBe(0.5);
    expect(remediate.byReason).toEqual({ unjustified: 2, "hard-blocked": 1, "scope-declared": 1 });

    const design = result.find((d) => d.writer === "bkit-design-generate")!;
    expect(design.unjustifiedCount).toBe(0);
    expect(design.unjustifiedRate).toBe(0);
  });

  // Same prompt, two models is the comparison the split exists for — a rate that
  // collapses them cannot tell a bad prompt from a model that gives up early.
  it("splits one subagent across the models that ran it", () => {
    const result = computeDeferralDiscipline([
      deferral({ key: "a", model: "claude-sonnet-5", reason: "unjustified" }),
      deferral({ key: "b", model: "claude-opus-5" }),
    ]);
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.model).sort()).toEqual(["claude-opus-5", "claude-sonnet-5"]);
  });

  // `.bkit/jsonl.md` § Who Wrote It: subagent/model are absent on orchestrator rows.
  it("attributes orchestrator-written rows to the workflow", () => {
    const result = computeDeferralDiscipline([
      { ts: 1, repo: "r", bkitVersion: "4.10.0", workflow: "ship", reason: "own-cycle" },
      { ts: 2, repo: "r", bkitVersion: "4.10.0", reason: "own-cycle" },
    ]);
    expect(result.map((d) => d.writer).sort()).toEqual(["ship (orchestrator)", "unattributed"]);
    expect(result.every((d) => d.model === "unknown")).toBe(true);
  });

  // Rows predating the field read as unknown, never as justified.
  it("buckets a missing reason as unspecified, not as a justification", () => {
    const [entry] = computeDeferralDiscipline([deferral({ key: "a", reason: undefined })]);
    expect(entry!.byReason).toEqual({ unspecified: 1 });
    expect(entry!.unjustifiedCount).toBe(0);
  });

  it("ranks the worst offender first", () => {
    const result = computeDeferralDiscipline([
      deferral({ key: "a", subagent: "clean", reason: "hard-blocked" }),
      deferral({ key: "b", subagent: "sloppy", reason: "unjustified" }),
      deferral({ key: "c", subagent: "sloppy", reason: "unjustified" }),
    ]);
    expect(result[0]!.writer).toBe("sloppy");
  });

  it("returns nothing when no deferrals exist", () => {
    expect(computeDeferralDiscipline([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// computeElapsedStats
// ---------------------------------------------------------------------------

describe("computeElapsedStats", () => {
  it("computes mean/p50/min/max over durationSeconds", () => {
    const rows: OutcomeRow[] = [
      outcomeRow(1001, 10, 2, { durationSeconds: 1000 }),
      outcomeRow(1002, 20, 3, { durationSeconds: 2000 }),
      outcomeRow(1003, 30, 4, { durationSeconds: 3000 }),
    ];

    const stats = computeElapsedStats(rows);
    expect(stats.count).toBe(3);
    expect(stats.totalSeconds).toBe(6000);
    expect(stats.meanSeconds).toBeCloseTo(2000);
    expect(stats.p50Seconds).toBe(2000);
    expect(stats.minSeconds).toBe(1000);
    expect(stats.maxSeconds).toBe(3000);
  });

  it("handles empty input", () => {
    const stats = computeElapsedStats([]);
    expect(stats.count).toBe(0);
    expect(stats.totalSeconds).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeCounts
// ---------------------------------------------------------------------------

describe("computeCounts", () => {
  it("counts by kind, workflow, repo", () => {
    const events: TelemetryEvent[] = [
      telemetryRow("compliance", 1001),
      telemetryRow("compliance", 1002),
      telemetryRow("outcome", 1003, {
        prNumber: 1,
        linesAdded: 0,
        linesDeleted: 0,
        linesChanged: 0,
        filesChanged: 0,
        taskCount: 0,
        durationSeconds: 0,
        deferrals: 0,
        failures: 0,
      }),
    ];

    const counts = computeCounts(events);
    expect(counts.total).toBe(3);
    expect(counts.byKind["compliance"]).toBe(2);
    expect(counts.byKind["outcome"]).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// runAnalysis — full report
// ---------------------------------------------------------------------------

describe("runAnalysis — full report (WS4-T3)", () => {
  it("produces a report from JSONL files on disk", () => {
    const statsPath = path.join(tmpDir, "stats.jsonl");
    const rows = [
      {
        ...baseEnvelope("outcome"),
        ts: 1_700_000_001_000,
        prNumber: 1,
        linesAdded: 50,
        linesDeleted: 10,
        linesChanged: 60,
        filesChanged: 5,
        taskCount: 5,
        durationSeconds: 3600,
        deferrals: 0,
        failures: 0,
        parentSha: "abc123",
      },
      {
        ...baseEnvelope("counter"),
        ts: 1_700_000_000_999,
        counterName: "SHIP_ATTEMPT",
        counterValue: 1,
        counterSource: "shell-bus",
        parentSha: "abc123",
      },
      {
        ...baseEnvelope("compliance"),
        ts: 1_700_000_001_001,
        rule: "no-mirror-edit",
        result: "pass",
        phase: "ship",
        parentSha: "abc123",
      },
      {
        ...baseEnvelope("compliance"),
        ts: 1_700_000_001_002,
        rule: "no-mirror-edit",
        result: "fail",
        phase: "build",
        parentSha: "def456",
      },
    ];
    fs.writeFileSync(statsPath, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");

    const report = runAnalysis([statsPath]);

    // Report lines should describe counts, regression, compliance
    const joined = report.reportLines.join("\n");
    expect(joined).toMatch(/rows: 4/);
    expect(joined).toMatch(/compliance.*2/i);
    expect(joined).toMatch(/no-mirror-edit/);
    expect(report.complianceRates).toHaveLength(1);
    expect(report.complianceRates[0]!.rule).toBe("no-mirror-edit");
    expect(report.regression.totalRows).toBe(1);
    expect(report.regression.shellBusCount).toBe(1);
    expect(joined).toContain("counterSource trust: shell-bus=1 (trusted) | model-self-report=0");
  });

  it("matches counter rows to outcome rows by parentSha when printing the trust line", () => {
    const statsPath = path.join(tmpDir, "stats.jsonl");
    const outcomeFields = {
      linesAdded: 5,
      linesDeleted: 1,
      linesChanged: 6,
      filesChanged: 1,
      taskCount: 1,
      durationSeconds: 60,
      deferrals: 0,
      failures: 0,
    };
    const rows = [
      {
        ...baseEnvelope("counter"),
        ts: 1_700_000_000_001,
        counterName: "SHIP_ATTEMPT",
        counterValue: 1,
        counterSource: "shell-bus",
        parentSha: "sha-a",
      },
      { ...baseEnvelope("outcome"), ts: 1_700_000_000_002, parentSha: "sha-a", ...outcomeFields },
      { ...baseEnvelope("outcome"), ts: 1_700_000_000_003, parentSha: "sha-b", ...outcomeFields },
    ];
    fs.writeFileSync(statsPath, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");

    const report = runAnalysis([statsPath]);
    expect(report.reportLines.join("\n")).toContain(
      "counterSource trust: shell-bus=1 (trusted) | model-self-report=1 (untrusted",
    );
  });

  it("handles missing files gracefully", () => {
    const report = runAnalysis([path.join(tmpDir, "does-not-exist.jsonl")]);
    expect(report.counts.total).toBe(0);
    expect(report.regression.totalRows).toBe(0);
    expect(report.complianceRates).toHaveLength(0);
    expect(report.deferralDiscipline).toHaveLength(0);
  });

  // The deferral ledger is a separate file from stats.jsonl, so the discipline
  // rate only exists if the caller passes it — `bkit analysis` adding
  // docs/deferrals.jsonl to its path list is the other half of this.
  it("folds deferral rows from a ledger path into the discipline rate", () => {
    const deferralsPath = path.join(tmpDir, "deferrals.jsonl");
    const row = (key: string, reason: string, ts: number) => ({
      ...baseEnvelope("deferral"),
      ts,
      key,
      type: "issue",
      category: "agentic",
      severity: "LOW",
      description: "d",
      subagent: "bkit-build-challenge-remediate",
      model: "claude-sonnet-5",
      reason,
    });
    // Same key twice: raised, then adjudicated. Folding must count ONE deferral.
    const rows = [
      row("a", "own-cycle", 1_700_000_002_000),
      row("a", "unjustified", 1_700_000_003_000),
      row("b", "hard-blocked", 1_700_000_004_000),
    ];
    fs.writeFileSync(deferralsPath, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");

    const report = runAnalysis([deferralsPath]);

    expect(report.deferralDiscipline).toHaveLength(1);
    const entry = report.deferralDiscipline[0]!;
    expect(entry.writer).toBe("bkit-build-challenge-remediate");
    expect(entry.total).toBe(2);
    expect(entry.unjustifiedCount).toBe(1);
    expect(entry.unjustifiedRate).toBe(0.5);
    expect(report.reportLines.join("\n")).toMatch(/Deferral discipline: 1\/2/);
  });
});
