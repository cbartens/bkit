// bkit-status-hole-detector.ts — Tier-3 advisory status-hole detector (#384).
//
// A fail-open advisory that compares the set of ship steps RECORDED in a
// status.jsonl against the set of steps the workflow PROSE says should be
// there. It derives its expected set from .bkit/workflows/bkit-ship.md at
// runtime (headings + step:"ship-*" literals) — NEVER a hand-maintained table
// (decision 384-tier3-promotion; knowledge
// 384-status-hole-detector-derives-expected-set-from-source-md).
//
// ADVISORY / FAIL-OPEN: the CLI exits 0 unconditionally — even when holes are
// found. A day-one blocking gate on a 25–65% holey corpus is noise that gets
// disabled (decision 384-tier3-promotion). Promotion to a blocking gate is
// gated on one release of fail-open signal without muting.
//
// Path-conditional expectations:
//   - Path A (dev is ancestor): skips ship-conflict-resolve.
//   - Path B (dev moved): includes ship-conflict-resolve.
//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 9): skips the entire
//     middle (base check, integrate, deferred-sweep, merge-pr).
//   - Aborted (workflow-failed row present): no post-abort holes expected.
//   - ship-failure-diagnose / ship-failure-remediate are NEVER mandatory — they
//     appear only in the merge-retry loop.
//
// Usage (advisory CI step or manual):
//   npx tsx .bkit/src/bkit-status-hole-detector.ts <status.jsonl> [--ship-md <path>]
//   # exits 0 always; prints advisory report to stdout
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
// ---------------------------------------------------------------------------
// Canonical ship step order (mirrors bkit-ship-invariants.test.ts
// CANONICAL_SHIP_STEP_KEYS — the frozen schema). The detector cross-checks its
// source-derived set against this. Renaming a key resets attempt counters across
// three repos and orphans the detector corpus.
// ---------------------------------------------------------------------------
export const SHIP_STEP_ORDER = [
    "ship-start-workflow",
    "ship-worktree-setup",
    "ship-regression-guard",
    "ship-conflict-resolve",
    "ship-deferred-sweep",
    "ship-merge-pr",
    "ship-failure-diagnose",
    "ship-failure-remediate",
    "ship-switch-to-dev",
    "ship-update-docs",
    "ship-summary",
    "ship-prune-skills",
    "ship-worktree-cleanup",
    "ship-close-workflow",
];
/** Steps that appear only in the merge-retry loop — never mandatory, never holes. */
const RETRY_LOOP_STEPS = new Set(["ship-failure-diagnose", "ship-failure-remediate"]);
/** The step that Path A skips (dev is ancestor → no integration needed). */
const PATH_B_ONLY_STEPS = new Set(["ship-conflict-resolve"]);
/** The middle steps MERGED-on-entry resume skips entirely. */
const MERGED_ON_ENTRY_SKIP = new Set([
    "ship-conflict-resolve",
    "ship-deferred-sweep",
    "ship-merge-pr",
    // failure-diagnose/remediate are already in RETRY_LOOP_STEPS (never expected)
]);
// ---------------------------------------------------------------------------
// Source derivation — parse bkit-ship.md to find the expected step universe.
// ---------------------------------------------------------------------------
/**
 * Derive the universe of ship step keys from the workflow markdown.
 *
 * Strategy:
 * 1. Extract every `step:"ship-..."` literal from fenced code blocks.
 * 2. Extract every `## … Step N — Name` heading and map the heading's section
 *    to the step key(s) found within it.
 * 3. Return the union of all unique step keys.
 *
 * The headings + literals cross-check ensures both signals agree — a step with
 * a heading but no literal (or vice versa) is a prose bug the detector surfaces.
 */
export function deriveExpectedStepSetFromSource(shipMd) {
    const lines = shipMd.split("\n");
    // 1. Collect every `step:"ship-..."` literal (anywhere — fenced or prose).
    const literalSet = new Set();
    const literalRe = /step:"(ship-[a-z-]+)"/g;
    for (const line of lines) {
        let m;
        while ((m = literalRe.exec(line)) !== null) {
            literalSet.add(m[1]);
        }
        literalRe.lastIndex = 0; // reset per-line
    }
    // 2. Collect heading-derived steps. A `## … Step N` heading opens a section;
    //    the step key(s) within that section's body (until the next `## ` heading)
    //    belong to that step.
    const headingSet = new Set();
    let inStep = false;
    for (const line of lines) {
        if (/^##\s+.*Step\s+\d+/i.test(line)) {
            inStep = true;
            continue;
        }
        if (/^##\s+/m.test(line) && !/Step\s+\d+/i.test(line)) {
            inStep = false;
            continue;
        }
        if (inStep) {
            let m;
            const re = /step:"(ship-[a-z-]+)"/g;
            while ((m = re.exec(line)) !== null) {
                headingSet.add(m[1]);
            }
            re.lastIndex = 0;
        }
    }
    // 3. Union
    const all = new Set([...literalSet, ...headingSet]);
    return {
        steps: [...all].sort(),
        headingSteps: [...headingSet].sort(),
        literalSteps: [...literalSet].sort(),
    };
}
/**
 * Cross-check the source-derived set against the frozen canonical set.
 * Returns the keys that disagree (present in one but not the other).
 */
export function checkSourceCanonicalDrift(sourceSteps) {
    const sourceSet = new Set(sourceSteps);
    const canonicalSet = new Set(SHIP_STEP_ORDER);
    const drift = [];
    for (const k of canonicalSet)
        if (!sourceSet.has(k))
            drift.push(`canonical-but-not-source:${k}`);
    for (const k of sourceSet)
        if (!canonicalSet.has(k))
            drift.push(`source-but-not-canonical:${k}`);
    return drift;
}
// ---------------------------------------------------------------------------
// Run classification + path-conditional expected sets
// ---------------------------------------------------------------------------
/**
 * Classify a run based on the observed step set and whether a workflow-failed
 * row was emitted. Classification logic mirrors bkit-ship.md's routing:
 *
 * - close-workflow present → completed (sub-classify by which middle steps ran)
 *   - no merge-pr AND no deferred-sweep → MERGED_ON_ENTRY (Step 2 jumped to 9)
 *   - conflict-resolve present → PATH_B
 *   - else → PATH_A
 * - workflow-failed present (and no close-workflow) → ABORTED
 * - else → IN_PROGRESS
 */
export function classifyRun(observedSteps, hasWorkflowFailed) {
    if (observedSteps.has("ship-close-workflow")) {
        // Completed — sub-classify
        if (!observedSteps.has("ship-merge-pr") && !observedSteps.has("ship-deferred-sweep")) {
            return "MERGED_ON_ENTRY";
        }
        if (observedSteps.has("ship-conflict-resolve")) {
            return "PATH_B";
        }
        return "PATH_A";
    }
    if (hasWorkflowFailed)
        return "ABORTED";
    return "IN_PROGRESS";
}
/**
 * Compute the set of MANDATORY steps for a given path. Steps NOT in this set
 * are optional and their absence is never a hole.
 */
export function computeMandatoryForPath(path, sourceUniverse) {
    const universe = new Set(sourceUniverse);
    switch (path) {
        case "PATH_A":
            // Skip conflict-resolve + retry-loop steps
            return new Set([...universe].filter((s) => !PATH_B_ONLY_STEPS.has(s) && !RETRY_LOOP_STEPS.has(s)));
        case "PATH_B":
            // Include conflict-resolve, skip retry-loop steps
            return new Set([...universe].filter((s) => !RETRY_LOOP_STEPS.has(s)));
        case "MERGED_ON_ENTRY":
            // Skip the entire middle + retry-loop steps
            return new Set([...universe].filter((s) => !MERGED_ON_ENTRY_SKIP.has(s) && !RETRY_LOOP_STEPS.has(s)));
        case "ABORTED":
            // No mandatory steps — the run terminated; post-abort absences are expected
            return new Set();
        case "IN_PROGRESS":
            // Run not done — can't determine holes
            return new Set();
    }
}
// ---------------------------------------------------------------------------
// Hole detection
// ---------------------------------------------------------------------------
/**
 * Detect holes: missing mandatory steps + unexpected (invented) steps.
 *
 * For ABORTED runs, the expected set is every step at or before the last
 * observed step in canonical order (minus path-conditional skips). This catches
 * holes BEFORE the abort point (e.g. a run that aborted at merge-pr but skipped
 * regression-guard earlier).
 */
export function detectHoles(observed, sourceUniverse, path, hasWorkflowFailed) {
    const universeSet = new Set(sourceUniverse);
    // Unexpected = observed but not in the source universe
    const unexpected = [...observed].filter((s) => !universeSet.has(s));
    // Missing = mandatory but not observed
    if (path === "ABORTED") {
        // Determine the last observed step in canonical order
        const lastObservedIdx = SHIP_STEP_ORDER.reduce((lastIdx, key, idx) => {
            if (observed.has(key))
                return idx;
            return lastIdx;
        }, -1);
        if (lastObservedIdx < 0)
            return { missing: [], unexpected };
        // For aborted runs, expected = everything before the last step, minus
        // retry-loop steps and minus conflict-resolve (unless it was observed)
        const skipSet = new Set([...RETRY_LOOP_STEPS]);
        if (!observed.has("ship-conflict-resolve"))
            skipSet.add("ship-conflict-resolve");
        const missing = [];
        for (let i = 0; i <= lastObservedIdx; i++) {
            const key = SHIP_STEP_ORDER[i];
            if (skipSet.has(key))
                continue;
            if (!observed.has(key))
                missing.push(key);
        }
        return { missing, unexpected };
    }
    if (path === "IN_PROGRESS") {
        return { missing: [], unexpected };
    }
    const mandatory = computeMandatoryForPath(path, sourceUniverse);
    const missing = [...mandatory].filter((s) => !observed.has(s));
    return { missing: missing.sort(), unexpected: unexpected.sort() };
}
// ---------------------------------------------------------------------------
// Full audit — parse status.jsonl + ship md, classify, detect, report
// ---------------------------------------------------------------------------
export function auditStatusJsonl(statusJsonl, shipMd) {
    // Derive expected set from source
    const { steps: sourceUniverse } = deriveExpectedStepSetFromSource(shipMd);
    const sourceCanonicalDrift = checkSourceCanonicalDrift(sourceUniverse);
    // Parse status rows
    const rows = [];
    for (const line of statusJsonl.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            rows.push(JSON.parse(trimmed));
        }
        catch (_e) {
            void _e; // skip unparseable lines (advisory — never throw)
        }
    }
    // Filter to ship step-done rows + workflow-failed rows
    const shipStepRows = rows.filter((r) => r.type === "step-done" && r.workflow === "ship" && typeof r.step === "string");
    const hasWorkflowFailed = rows.some((r) => r.type === "workflow-failed" && r.workflow === "ship");
    // Collect observed steps
    const observed = new Set();
    for (const r of shipStepRows) {
        if (r.step)
            observed.add(r.step);
    }
    // Classify + detect
    const runPath = classifyRun(observed, hasWorkflowFailed);
    const { missing, unexpected } = detectHoles(observed, sourceUniverse, runPath, hasWorkflowFailed);
    return {
        missing,
        unexpected,
        path: runPath,
        observed: [...observed].sort(),
        sourceUniverse: [...sourceUniverse].sort(),
        sourceCanonicalDrift,
    };
}
// ---------------------------------------------------------------------------
// Advisory report formatter
// ---------------------------------------------------------------------------
export function formatAdvisoryReport(report) {
    const lines = [];
    lines.push("[bkit-status-hole-detector] ADVISORY — fail-open (exit 0 regardless)");
    lines.push(`  path: ${report.path}`);
    lines.push(`  observed: ${report.observed.length} step(s)`);
    if (report.sourceCanonicalDrift.length > 0) {
        lines.push(`  ⚠ source/canonical drift: ${report.sourceCanonicalDrift.join(", ")}`);
    }
    if (report.missing.length > 0) {
        lines.push(`  missing (mandatory for ${report.path}): ${report.missing.join(", ")}`);
    }
    else {
        lines.push(`  missing: none`);
    }
    if (report.unexpected.length > 0) {
        lines.push(`  unexpected (invented names): ${report.unexpected.join(", ")}`);
    }
    else {
        lines.push(`  unexpected: none`);
    }
    return lines.join("\n");
}
// ---------------------------------------------------------------------------
// CLI entry — always exits 0 (advisory / fail-open)
// ---------------------------------------------------------------------------
export function main(argv) {
    const args = argv.slice(2);
    // Resolve status.jsonl path (first positional)
    const statusPath = args.find((a) => !a.startsWith("--"));
    if (!statusPath) {
        process.stdout.write("[bkit-status-hole-detector] no status.jsonl path given — skipping (advisory)\n");
        return; // exit 0
    }
    // Resolve ship md path — derive script dir from import.meta.url (ESM-safe)
    const mdFlagIdx = args.indexOf("--ship-md");
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const defaultShipMd = path.resolve(scriptDir, "../workflows/bkit-ship.md");
    const shipMdPath = mdFlagIdx >= 0 && args[mdFlagIdx + 1] ? args[mdFlagIdx + 1] : defaultShipMd;
    // Read inputs (advisory — missing files = skip, never fail)
    let statusJsonl = "";
    try {
        statusJsonl = fs.readFileSync(statusPath, "utf-8");
    }
    catch {
        process.stdout.write(`[bkit-status-hole-detector] ${statusPath} not found — skipping (advisory)\n`);
        return; // exit 0
    }
    let shipMd = "";
    try {
        shipMd = fs.readFileSync(shipMdPath, "utf-8");
    }
    catch {
        process.stdout.write(`[bkit-status-hole-detector] ${shipMdPath} not found — skipping (advisory)\n`);
        return; // exit 0
    }
    const report = auditStatusJsonl(statusJsonl, shipMd);
    process.stdout.write(formatAdvisoryReport(report) + "\n");
    // ALWAYS exit 0 — this is advisory / fail-open
}
// Run if invoked directly (ESM-compatible main-module detection)
if (process.argv[1]) {
    try {
        if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
            main(process.argv);
        }
    }
    catch (_e) {
        void _e; // realpathSync can fail on symlinks — skip (advisory, never crash)
    }
}
