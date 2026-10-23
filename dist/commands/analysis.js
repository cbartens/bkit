// commands/analysis.ts — the computations behind `bkit stats` (commands/stats.ts) and the
// cross-repo section of the harvest report (scripts/harvest/, bkit's checkout only).
//
// Provides:
//   1. Counts/rates/elapsed-time over telemetry rows.
//   2. Size↔outcome regression (error rate per `lines.total.added` bucket) over
//      `kind:"outcome"` rows.
//   3. Dispatch-size threshold computation for plan-split.
//   4. `counter.source` trust labelling: each outcome row is joined to its `counter` row
//      (model-self-report or shell-bus).
//   5. Per-rule compliance rate over `kind:"compliance"` rows.
//   6. Per-`bkit.version` release-attributed regression.
//
// Rows are read folded, so rows written without `schema` arrive in the current shape.
//
// All computation is advisory + inform-only; never gates any workflow.
// See DE-34 for the shared-entrypoint + crash-isolation contract.
import { UNJUSTIFIED_REASON, foldFrom, } from "../ledgers/telemetry.js";
export function computeCounts(events) {
    const byKind = {};
    const byWorkflow = {};
    const byRepo = {};
    for (const ev of events) {
        byKind[ev.kind] = (byKind[ev.kind] ?? 0) + 1;
        const workflow = ev.by?.workflow ?? "unknown";
        byWorkflow[workflow] = (byWorkflow[workflow] ?? 0) + 1;
        byRepo[ev.repo] = (byRepo[ev.repo] ?? 0) + 1;
    }
    return { total: events.length, byKind, byWorkflow, byRepo };
}
/** Over the rows that carry `time.totalMinutes`. */
export function computeElapsedStats(rows) {
    const durations = rows
        .map((r) => r.time?.totalMinutes)
        .filter((m) => typeof m === "number")
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
 * `ledgers.failures.repo` is the repo's CUMULATIVE distinct-failure count at close.
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
    const failures = (r) => r.ledgers?.failures?.repo ?? 0;
    if (!previous)
        return failures(row);
    return Math.max(0, failures(row) - failures(previous));
}
const isErrorRun = (row, allRows) => newFailuresThisRun(row, allRows) > 0;
/** Identity of one workflow run: the key the close writes on both its counter and outcome rows. */
function runKey(row) {
    const sha = row.run?.parentSha;
    return sha ? JSON.stringify([row.repo, row.by?.workflow, sha]) : undefined;
}
export function computeRegression(rows, counterRows) {
    const shellBusRuns = new Set();
    for (const c of counterRows) {
        const key = runKey(c);
        if (c.counter?.source === "shell-bus" && key !== undefined)
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
export function computeComplianceRates(rows) {
    const byRule = {};
    for (const row of rows) {
        const id = row.rule?.id ?? "unknown";
        if (!byRule[id]) {
            byRule[id] = { passCount: 0, failCount: 0, naCount: 0, totalCount: 0 };
        }
        const r = byRule[id];
        r.totalCount++;
        if (row.rule?.verdict === "pass")
            r.passCount++;
        else if (row.rule?.verdict === "fail")
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
        const version = row.bkit?.version ?? "unknown";
        if (!byVersion[version])
            byVersion[version] = { pass: 0, total: 0 };
        const v = byVersion[version];
        v.total++;
        if (row.rule?.verdict === "pass")
            v.pass++;
    }
    return Object.entries(byVersion)
        .map(([version, { pass, total }]) => ({
        version,
        passRate: total > 0 ? pass / total : 0,
        totalRuns: total,
    }))
        .sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
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
        const writer = row.by?.subagent ?? (row.by?.workflow ? `${row.by.workflow} (orchestrator)` : "unattributed");
        const model = row.by?.model ?? "unknown";
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
/** Analyse the folded rows of `paths`, leaving out rows of `skipKinds`. */
export function runAnalysis(paths, skipKinds = new Set()) {
    const { state, rowCount, malformedLineCount } = foldFrom(paths);
    const events = [...state.values()].filter((ev) => !skipKinds.has(ev.kind));
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
        reportLines.push(`[bkit-analysis] Duration (min): mean=${elapsed.meanMinutes.toFixed(1)} | p50=${elapsed.p50Minutes.toFixed(1)} | min=${elapsed.minMinutes} | max=${elapsed.maxMinutes}`);
    }
    // Regression report
    reportLines.push(`[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: ${regression.dispatchSizeThreshold} lines added):`);
    for (const b of regression.buckets) {
        if (b.count > 0) {
            reportLines.push(`  ${b.label}: ${b.count} runs, ${b.errorCount} errors (${(b.errorRate * 100).toFixed(1)}%)`);
        }
    }
    reportLines.push(`[bkit-analysis] counter.source trust: shell-bus=${regression.shellBusCount} (trusted) | model-self-report=${regression.modelSelfReportCount} (untrusted)`);
    // Compliance rates
    if (complianceRates.length > 0) {
        reportLines.push(`[bkit-analysis] Per-rule compliance rates:`);
        for (const r of complianceRates) {
            reportLines.push(`  ${r.rule}: ${(r.passRate * 100).toFixed(1)}% pass (${r.passCount}/${r.totalCount})`);
        }
    }
    // Version compliance
    if (versionCompliance.length > 0) {
        reportLines.push(`[bkit-analysis] Per-bkit.version compliance:`);
        for (const v of versionCompliance) {
            reportLines.push(`  v${v.version}: ${(v.passRate * 100).toFixed(1)}% pass (${v.totalRuns} runs)`);
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
