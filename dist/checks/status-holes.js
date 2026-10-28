// checks/status-holes.ts — Tier-3 advisory status-hole detector.
//
// A fail-open advisory that compares the steps RECORDED in each run of a
// status.jsonl against the steps the workflow PROSE says should be there. It
// derives the expected set from .bkit/core/workflows/bkit-{workflow}.md at
// runtime (headings + --step= literals) — NEVER a hand-maintained table
// (decision 384-tier3-promotion). Each run's workflow is inferred from its rows.
//
// ADVISORY / FAIL-OPEN: the CLI exits 0 unconditionally — even when holes are
// found (decision 384-tier3-promotion).
//
// Path-conditional expectations:
//   - Path A (dev is ancestor): skips ship-conflict-resolve.
//   - Path B (dev moved): includes ship-conflict-resolve.
//   - MERGED-on-entry (Step 2 detects state=MERGED → Step 13): skips the entire
//     middle (base check, integrate, deferred-sweep, the pre-merge docs /
//     summary / prune / bookkeeping-push steps, merge-pr).
//   - Aborted (workflow-failed row present): no post-abort holes expected.
//   - ship-failure-diagnose / ship-failure-remediate are NEVER mandatory — they
//     appear only in the merge-retry loop.
//
// Usage (advisory CI step or manual):
//   npx tsx .bkit/core/engine/checks/status-holes.ts <status.jsonl>...
//   # exits 0 always; prints advisory report to stdout
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { WORKFLOW_STEPS } from "../commands/workflow/step-table.js";
import { parseJson } from "../shared/json.js";
import { getWorkflowsRoot } from "../shared/package-roots.js";
// ---------------------------------------------------------------------------
// Canonical ship step order (mirrors audits/workflows/ship-invariants.test.ts
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
    "ship-update-docs",
    "ship-summary",
    "ship-prune-skills",
    "ship-bookkeeping-push",
    "ship-merge-pr",
    "ship-failure-diagnose",
    "ship-failure-remediate",
    "ship-switch-to-dev",
    "ship-close-workflow",
];
/** Steps that appear only in the merge-retry loop — never mandatory, never holes. */
const RETRY_LOOP_STEPS = new Set(["ship-failure-diagnose", "ship-failure-remediate"]);
/** The step that Path A skips (dev is ancestor → no integration needed). */
const PATH_B_ONLY_STEPS = new Set(["ship-conflict-resolve"]);
/**
 * The steps a MERGED-on-entry resume skips entirely.
 *
 * bkit-ship.md Step 2 routes to Step 13 at sub-step 5 (`state` = MERGED), which
 * is BEFORE sub-step 8 writes `ship-worktree-setup` + `ship-regression-guard` —
 * so those two are absent too, not just the middle. The pre-merge docs,
 * summary, prune and bookkeeping-push steps (6-8) ride the PR, so a PR that is
 * already merged skips them too.
 */
const MERGED_ON_ENTRY_SKIP = new Set([
    "ship-worktree-setup",
    "ship-regression-guard",
    "ship-conflict-resolve",
    "ship-deferred-sweep",
    "ship-update-docs",
    "ship-summary",
    "ship-prune-skills",
    "ship-bookkeeping-push",
    "ship-merge-pr",
    // failure-diagnose/remediate are already in RETRY_LOOP_STEPS (never expected)
]);
// A key followed by `{` is a templated log label (`build-group-gate-{GROUP}`), not a row key.
const STEP_KEY_RE = /(?:step:"|--step=)([a-z][a-z0-9-]*)(\{)?/g;
/** The words of one `"{BKIT}" ...` call: shell-split, quotes kept, stopped at the first unquoted operator. */
export function callWords(rest) {
    const words = [];
    let word = "";
    let quote = "";
    for (const ch of rest) {
        if (quote) {
            word += ch;
            if (ch === quote)
                quote = "";
        }
        else if (ch === '"' || ch === "'") {
            word += ch;
            quote = ch;
        }
        else if ("|;&><)`".includes(ch))
            break;
        else if (/\s/.test(ch)) {
            if (word)
                words.push(word);
            word = "";
        }
        else
            word += ch;
    }
    if (word)
        words.push(word);
    return words;
}
/** Each `Step N — Title` heading, with the text up to the next step or section heading. */
export function stepSections(text) {
    const lines = text.split("\n");
    const heading = /^#{2,3} \S+ Step (\d+) — (.+)$/;
    const out = [];
    lines.forEach((l, i) => {
        const m = heading.exec(l);
        if (!m)
            return;
        const end = lines.findIndex((x, j) => j > i && /^#{2,3} /.test(x) && !x.startsWith("### 🔒"));
        out.push({
            number: Number(m[1]),
            title: m[2],
            body: lines.slice(i, end === -1 ? undefined : end).join("\n"),
        });
    });
    return out;
}
/** Each `"{BKIT}"` call in `text` as noun / verb / flag names. */
function requiredCalls(text) {
    const joined = text.replace(/\\\n\s*/g, " ");
    return joined
        .split('"{BKIT}"')
        .slice(1)
        .map((call) => {
        const [noun = "", verb = "", ...rest] = callWords(call.replace(/^ /, ""));
        const flags = rest.flatMap((w) => {
            const f = /^--([a-z][a-z0-9-]*)/.exec(w)?.[1];
            return f ? [f] : [];
        });
        return { noun, verb: verb.startsWith("--") ? "" : verb, flags };
    });
}
const stepKeys = (text) => [
    ...new Set([...text.matchAll(STEP_KEY_RE)].filter((m) => !m[2]).map((m) => m[1])),
];
/** A step is conditional under a column-0 marker line anywhere in its section, or a `(Path X only)` heading. */
export function isConditionalSection(body) {
    const lines = body.split("\n");
    return (/\(Path [A-Z] only\)/.test(lines[0] ?? "") ||
        lines.some((l) => /^\*\*(Run only if|Skip if)\*\*/.test(l)));
}
/**
 * Derive the contract of one workflow from its markdown: the step sections, the
 * row keys and `"{BKIT}"` calls each holds, and the calls no step owns. The
 * universe is cross-checked against the deduped `WORKFLOW_STEPS[workflow]`; a
 * disagreement is reported as drift, never thrown.
 */
export function deriveContract(workflowMd, workflow) {
    const sections = stepSections(workflowMd);
    const steps = sections.map((s) => ({
        number: s.number,
        title: s.title,
        keys: stepKeys(s.body),
        calls: requiredCalls(s.body),
        conditional: isConditionalSection(s.body),
    }));
    const universe = [...new Set(steps.flatMap((s) => s.keys))].sort();
    // Text outside every step section: the md minus each section body.
    let outside = workflowMd;
    for (const s of sections)
        outside = outside.replace(s.body, "");
    const table = WORKFLOW_STEPS[workflow];
    const tableKeys = new Set((table ?? []).flatMap((s) => (s.step ? [s.step] : [])));
    const drift = [];
    if (table) {
        for (const k of tableKeys)
            if (!universe.includes(k))
                drift.push(`table-but-not-source:${k}`);
        for (const k of universe)
            if (!tableKeys.has(k))
                drift.push(`source-but-not-table:${k}`);
    }
    return {
        workflow,
        steps,
        universe,
        workflowCalls: requiredCalls(outside),
        orphanSteps: stepKeys(outside)
            .filter((k) => k.startsWith(`${workflow}-`) && !universe.includes(k))
            .sort(),
        drift,
    };
}
// ---------------------------------------------------------------------------
// Run classification + path-conditional expected sets
// ---------------------------------------------------------------------------
/**
 * Classify a run based on the observed step set and whether a workflow-failed
 * row was emitted. Classification logic mirrors bkit-ship.md's routing:
 *
 * - close-workflow present → completed (sub-classify by the Step 2 marker)
 *   - no regression-guard → MERGED_ON_ENTRY (Step 2 jumped to 13)
 *   - conflict-resolve present → PATH_B
 *   - else → PATH_A
 * - workflow-failed present (and no close-workflow) → ABORTED
 * - else → IN_PROGRESS
 *
 * MERGED_ON_ENTRY is decided by the explicit `ship-merged-on-entry` row that
 * bkit-ship.md Step 2 sub-step 5 writes on the `state` = MERGED route. It does NOT
 * key on the absence of `ship-merge-pr` / `ship-deferred-sweep`.
 *
 * For corpus rows without the marker, it falls back to requiring BOTH
 * `ship-worktree-setup` and `ship-regression-guard` to be absent (Step 2 writes those
 * two in a single fenced block); a run that dropped only one stays Path A/B.
 */
export function classifyRun(observedSteps, hasWorkflowFailed, hasMergedOnEntryMarker = false) {
    if (observedSteps.has("ship-close-workflow")) {
        if (hasMergedOnEntryMarker)
            return "MERGED_ON_ENTRY";
        if (!observedSteps.has("ship-worktree-setup") && !observedSteps.has("ship-regression-guard")) {
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
        case "COMPLETED":
            // Non-ship runs derive their mandatory set from the contract (auditRun)
            return new Set(universe);
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
export function detectHoles(observed, sourceUniverse, path) {
    const universeSet = new Set(sourceUniverse);
    // Unexpected = observed but not in the source universe
    const unexpected = [...observed].filter((s) => !universeSet.has(s)).sort();
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
    const missing = [...mandatory].filter((s) => !observed.has(s)).sort();
    return { missing, unexpected };
}
// ---------------------------------------------------------------------------
// Full audit — parse status.jsonl + workflow md, classify, detect, report
// ---------------------------------------------------------------------------
function parseRows(statusJsonl) {
    const rows = [];
    for (const line of statusJsonl.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        // Unparseable lines are skipped (advisory — never throw).
        const row = parseJson(trimmed);
        if (row.ok)
            rows.push(row.value);
    }
    return rows;
}
/** Audit one run's rows against the contract derived from its workflow markdown. */
export function auditRun(rows, workflow, workflowMd) {
    const contract = deriveContract(workflowMd, workflow);
    const stepRows = rows.filter((r) => r.type === "step-done" && r.workflow === workflow && typeof r.step === "string");
    const hasWorkflowFailed = rows.some((r) => r.type === "workflow-failed" && r.workflow === workflow);
    const observed = new Set();
    for (const r of stepRows)
        if (r.step)
            observed.add(r.step);
    const sorted = [...observed].sort();
    if (workflow === "ship") {
        const hasMergedOnEntryMarker = rows.some((r) => r.type === "ship-merged-on-entry" && r.workflow === "ship");
        const runPath = classifyRun(observed, hasWorkflowFailed, hasMergedOnEntryMarker);
        const { missing, unexpected } = detectHoles(observed, contract.universe, runPath);
        return {
            workflow,
            missing,
            unexpected,
            path: runPath,
            observed: sorted,
            sourceUniverse: contract.universe,
            sourceCanonicalDrift: contract.drift,
            orphanSteps: contract.orphanSteps,
        };
    }
    const closeKey = `${workflow}-close-workflow`;
    const runPath = observed.has(closeKey)
        ? "COMPLETED"
        : hasWorkflowFailed
            ? "ABORTED"
            : "IN_PROGRESS";
    const missing = runPath === "COMPLETED"
        ? contract.steps
            .filter((s) => s.keys.length > 0 && !s.conditional && !s.keys.some((k) => observed.has(k)))
            .map((s) => s.keys[0])
            .sort()
        : [];
    return {
        workflow,
        missing,
        unexpected: sorted.filter((k) => !contract.universe.includes(k)),
        path: runPath,
        observed: sorted,
        sourceUniverse: contract.universe,
        sourceCanonicalDrift: contract.drift,
        // Decision Pause / abort rows sit outside the numbered steps by design
        orphanSteps: [],
    };
}
/** Audit a status.jsonl as a ship run against `shipMd`. */
export function auditStatusJsonl(statusJsonl, shipMd) {
    return auditRun(parseRows(statusJsonl), "ship", shipMd);
}
/** The workflows a status.jsonl holds runs of, inferred from its own rows. */
export function inferWorkflows(rows) {
    const known = new Set(Object.keys(WORKFLOW_STEPS));
    const found = new Set();
    for (const r of rows)
        if (typeof r.workflow === "string" && known.has(r.workflow))
            found.add(r.workflow);
    return [...found].sort();
}
// ---------------------------------------------------------------------------
// Advisory report formatter
// ---------------------------------------------------------------------------
export function formatAdvisoryReport(report) {
    const lines = [];
    lines.push("[bkit-status-holes] ADVISORY — fail-open (exit 0 regardless)");
    if (report.workflow)
        lines.push(`  workflow: ${report.workflow}`);
    lines.push(`  path: ${report.path}`);
    lines.push(`  observed: ${report.observed.length} step(s)`);
    if (report.sourceCanonicalDrift.length > 0) {
        lines.push(`  ⚠ source/canonical drift: ${report.sourceCanonicalDrift.join(", ")}`);
    }
    if (report.orphanSteps.length > 0) {
        lines.push(`  ⚠ recorded outside any numbered step: ${report.orphanSteps.join(", ")}`);
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
    // Every positional is a status.jsonl to audit — one report per file, so a
    // whole corpus can be swept in one advisory CI step.
    const statusPaths = argv.slice(2).filter((a) => !a.startsWith("--"));
    if (statusPaths.length === 0) {
        process.stdout.write("[bkit-status-holes] no status.jsonl path given — skipping (advisory)\n");
        return; // exit 0
    }
    const mdCache = new Map();
    const loadMd = (workflow) => {
        if (!mdCache.has(workflow)) {
            try {
                mdCache.set(workflow, fs.readFileSync(path.join(getWorkflowsRoot(), `bkit-${workflow}.md`), "utf-8"));
            }
            catch {
                mdCache.set(workflow, null);
            }
        }
        return mdCache.get(workflow) ?? null;
    };
    let holeyRuns = 0;
    for (const statusPath of statusPaths) {
        // Read inputs (advisory — missing files = skip, never fail)
        let statusJsonl = "";
        try {
            statusJsonl = fs.readFileSync(statusPath, "utf-8");
        }
        catch {
            process.stdout.write(`[bkit-status-holes] ${statusPath} not found — skipping (advisory)\n`);
            continue; // exit 0
        }
        const rows = parseRows(statusJsonl);
        const workflows = inferWorkflows(rows);
        process.stdout.write(`\n${statusPath}\n`);
        if (workflows.length === 0) {
            process.stdout.write(`[bkit-status-holes] ${statusPath}: no workflow rows — skipping (advisory)\n`);
            continue;
        }
        for (const workflow of workflows) {
            const md = loadMd(workflow);
            if (md === null) {
                process.stdout.write(`[bkit-status-holes] bkit-${workflow}.md not found — skipping ${workflow} run (advisory)\n`);
                continue;
            }
            const report = auditRun(rows, workflow, md);
            if (report.missing.length > 0)
                holeyRuns += 1;
            process.stdout.write(formatAdvisoryReport(report) + "\n");
        }
    }
    process.stdout.write(`[bkit-status-holes] sweep: ${statusPaths.length} file(s), ${holeyRuns} holey\n`);
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
