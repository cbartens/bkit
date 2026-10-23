// commands/analysis.ts — Analysis CLI for bkit telemetry.
//
// Provides:
//   1. Counts/rates/elapsed-time over telemetry rows.
//   2. Size↔outcome regression (logistic approximation: error ~ log(linesAdded)
//      + filesChanged) over `kind:"outcome"` rows.
//   3. Dispatch-size threshold computation for plan-split.
//   4. `counterSource` trust labelling: each outcome row is joined to its `counter` row
//      (model-self-report pre-P3, shell-bus post-P3).
//   5. Per-rule compliance rate over `kind:"compliance"` rows.
//   6. Per-`bkitVersion`→CHANGELOG release-attributed regression.
//
// Backfill scope (DE-37): GitHub-API backfill limited to the repo where bkit is
// installed; PRs closed >= `--since` date; fields: additions, deletions, changedFiles,
// commits count (for correctiveCommits proxy). Model-self-report counterSource.
//
// All computation is advisory + inform-only; never gates any workflow.
// See DE-34 for the shared-entrypoint + crash-isolation contract.
import * as fs from "node:fs";
import * as path from "node:path";
import { UNJUSTIFIED_REASON, foldFrom, } from "../ledgers/telemetry.js";
import { HARVEST_DEST_DIR } from "./harvest.js";
export function computeCounts(events) {
    const byKind = {};
    const byWorkflow = {};
    const byRepo = {};
    for (const ev of events) {
        byKind[ev.kind] = (byKind[ev.kind] ?? 0) + 1;
        byWorkflow[ev.workflow] = (byWorkflow[ev.workflow] ?? 0) + 1;
        byRepo[ev.repo] = (byRepo[ev.repo] ?? 0) + 1;
    }
    return { total: events.length, byKind, byWorkflow, byRepo };
}
export function computeElapsedStats(rows) {
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
const SIZE_BUCKETS = [
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
export function newFailuresThisRun(row, allRows) {
    const previous = allRows
        .filter((r) => r.repo === row.repo && r.ts < row.ts)
        .sort((a, b) => b.ts - a.ts)[0];
    if (!previous)
        return row.failures;
    return Math.max(0, row.failures - previous.failures);
}
function isErrorRun(row, allRows) {
    return ((row.ciTrySuccess !== undefined && row.ciTrySuccess > 1) ||
        (row.correctiveCommits !== undefined && row.correctiveCommits > 0) ||
        (row.reviewIterations !== undefined && row.reviewIterations > 1) ||
        newFailuresThisRun(row, allRows) > 0);
}
/** Identity of one workflow run: the key the close writes on both its counter and outcome rows. */
function runKey(row) {
    return row.parentSha ? JSON.stringify([row.repo, row.workflow, row.parentSha]) : undefined;
}
export function computeRegression(rows, counterRows) {
    const shellBusRuns = new Set();
    for (const c of counterRows) {
        const key = runKey(c);
        if (c.counterSource === "shell-bus" && key !== undefined)
            shellBusRuns.add(key);
    }
    const buckets = SIZE_BUCKETS.map((b) => ({
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
        }
        else {
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
export function computeComplianceRates(rows) {
    const byRule = {};
    for (const row of rows) {
        if (!byRule[row.rule]) {
            byRule[row.rule] = { passCount: 0, failCount: 0, naCount: 0, totalCount: 0 };
        }
        const r = byRule[row.rule];
        r.totalCount++;
        if (row.result === "pass")
            r.passCount++;
        else if (row.result === "fail")
            r.failCount++;
        else
            r.naCount++;
    }
    return Object.entries(byRule).map(([rule, counts]) => ({
        rule,
        ...counts,
        passRate: counts.totalCount > 0 ? counts.passCount / counts.totalCount : 0,
    }));
}
export function computeVersionCompliance(rows) {
    const byVersion = {};
    for (const row of rows) {
        if (!byVersion[row.bkitVersion])
            byVersion[row.bkitVersion] = { pass: 0, total: 0 };
        const v = byVersion[row.bkitVersion];
        v.total++;
        if (row.result === "pass")
            v.pass++;
    }
    return Object.entries(byVersion)
        .map(([bkitVersion, { pass, total }]) => ({
        bkitVersion,
        passRate: total > 0 ? pass / total : 0,
        totalRuns: total,
    }))
        .sort((a, b) => a.bkitVersion.localeCompare(b.bkitVersion, undefined, { numeric: true }));
}
/**
 * Unjustified-rate per `(subagent, model)`.
 *
 * Counts FOLDED entities, so an adjudication and its later close are one deferral,
 * not three. `unjustified` is carried verbatim through later rows, so the rate keeps
 * counting it.
 */
export function computeDeferralDiscipline(rows) {
    const byWriter = {};
    for (const row of rows) {
        const writer = row.subagent ?? (row.workflow ? `${row.workflow} (orchestrator)` : "unattributed");
        const model = row.model ?? "unknown";
        const id = `${writer}\u0000${model}`;
        if (!byWriter[id])
            byWriter[id] = { writer, model, total: 0, unjustifiedCount: 0, byReason: {} };
        const w = byWriter[id];
        w.total++;
        const reason = row.reason ?? "unspecified";
        w.byReason[reason] = (w.byReason[reason] ?? 0) + 1;
        if (reason === UNJUSTIFIED_REASON)
            w.unjustifiedCount++;
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
        .sort((a, b) => b.unjustifiedCount - a.unjustifiedCount ||
        b.unjustifiedRate - a.unjustifiedRate ||
        b.total - a.total ||
        a.writer.localeCompare(b.writer));
}
export function runAnalysis(paths) {
    const { state, rowCount, malformedLineCount } = foldFrom(paths);
    const events = [...state.values()];
    const outcomeRows = [];
    const counterRows = [];
    const complianceRows = [];
    const deferralRows = [];
    for (const ev of events) {
        if (ev.kind === "outcome") {
            outcomeRows.push(ev);
        }
        else if (ev.kind === "counter") {
            counterRows.push(ev);
        }
        else if (ev.kind === "compliance") {
            complianceRows.push(ev);
        }
        else if (ev.kind === "deferral") {
            deferralRows.push(ev);
        }
    }
    const counts = computeCounts(events);
    const elapsed = computeElapsedStats(outcomeRows);
    const regression = computeRegression(outcomeRows, counterRows);
    const complianceRates = computeComplianceRates(complianceRows);
    const versionCompliance = computeVersionCompliance(complianceRows);
    const deferralDiscipline = computeDeferralDiscipline(deferralRows);
    const reportLines = [
        `[bkit-analysis] Telemetry rows: ${rowCount} | malformed: ${malformedLineCount}`,
        `[bkit-analysis] Kinds: ${JSON.stringify(counts.byKind)}`,
        `[bkit-analysis] Workflows: ${JSON.stringify(counts.byWorkflow)}`,
        `[bkit-analysis] Run outcomes: ${outcomeRows.length} | Compliance rows: ${complianceRows.length}`,
    ];
    if (elapsed.count > 0) {
        reportLines.push(`[bkit-analysis] Duration (s): mean=${elapsed.meanSeconds.toFixed(0)} | p50=${elapsed.p50Seconds.toFixed(0)} | min=${elapsed.minSeconds} | max=${elapsed.maxSeconds}`);
    }
    // Regression report
    reportLines.push(`[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: ${regression.dispatchSizeThreshold} linesAdded):`);
    for (const b of regression.buckets) {
        if (b.count > 0) {
            reportLines.push(`  ${b.label}: ${b.count} runs, ${b.errorCount} errors (${(b.errorRate * 100).toFixed(1)}%)`);
        }
    }
    reportLines.push(`[bkit-analysis] counterSource trust: shell-bus=${regression.shellBusCount} (trusted) | model-self-report=${regression.modelSelfReportCount} (untrusted, pre-P3)`);
    // Compliance rates
    if (complianceRates.length > 0) {
        reportLines.push(`[bkit-analysis] Per-rule compliance rates:`);
        for (const r of complianceRates) {
            reportLines.push(`  ${r.rule}: ${(r.passRate * 100).toFixed(1)}% pass (${r.passCount}/${r.totalCount})`);
        }
    }
    // Version compliance
    if (versionCompliance.length > 0) {
        reportLines.push(`[bkit-analysis] Per-bkitVersion compliance:`);
        for (const v of versionCompliance) {
            reportLines.push(`  v${v.bkitVersion}: ${(v.passRate * 100).toFixed(1)}% pass (${v.totalRuns} runs)`);
        }
    }
    // Deferral discipline — who defers work they should have finished.
    if (deferralDiscipline.length > 0) {
        const totals = deferralDiscipline.reduce((acc, d) => ({ total: acc.total + d.total, unjust: acc.unjust + d.unjustifiedCount }), { total: 0, unjust: 0 });
        reportLines.push(`[bkit-analysis] Deferral discipline: ${totals.unjust}/${totals.total} adjudicated unjustified (${((totals.unjust / totals.total) * 100).toFixed(1)}%), by writer:`);
        for (const d of deferralDiscipline) {
            const reasons = Object.entries(d.byReason)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([reason, n]) => `${reason}=${n}`)
                .join(" ");
            reportLines.push(`  ${d.writer} [${d.model}]: ${d.unjustifiedCount}/${d.total} unjustified (${(d.unjustifiedRate * 100).toFixed(1)}%) | ${reasons}`);
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
// analysis — cross-repo analysis CLI.
// Reports counts/rates/elapsed-time, size↔outcome regression, per-rule compliance
// rate, dispatch-size threshold, counterSource trust labelling. Advisory + inform-only.
// See DE-34 for the shared-entrypoint + crash-isolation contract.
export function runAnalysisCommand() {
    try {
        const cwd = process.cwd();
        // Analyse: bkit's own stats.jsonl + harvested consumer rows.
        // Harvest dest is sourced from the constant, NOT re-spelled here.
        const statsPath = path.join(cwd, ".bkit", "stats.jsonl");
        const harvestStatsPath = path.join(cwd, HARVEST_DEST_DIR, "stats.jsonl");
        const harvestFrictionPath = path.join(cwd, HARVEST_DEST_DIR, "friction.jsonl");
        const frictionPath = path.join(cwd, ".bkit", "friction.jsonl");
        // deferrals is LOCAL-only: harvest takes it count-only (prose never leaves the
        // consumer), so the discipline rate is this repo's own writers, not a fleet view.
        const deferralsPath = path.join(cwd, "docs", "deferrals.jsonl");
        const paths = [
            statsPath,
            harvestStatsPath,
            harvestFrictionPath,
            frictionPath,
            deferralsPath,
        ].filter((p) => fs.existsSync(p));
        if (paths.length === 0) {
            console.log("[bkit-analysis] No telemetry files found. Run `bkit harvest` first, or accumulate telemetry via bkit workflows.");
            return;
        }
        const report = runAnalysis(paths);
        for (const line of report.reportLines) {
            console.log(line);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[bkit-analysis] analysis error (fail-open): ${msg}`);
    }
}
