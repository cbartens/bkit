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
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const MAX_ROWS_BEFORE_ROLLUP = 5000;
/** Template for archive shards: replace {basename} and {YYYYMM}. */
export const ARCHIVE_SHARD_TEMPLATE = ".bkit/archive/{basename}.{YYYYMM}.jsonl";
export const VALID_KINDS = new Set([
    "compliance",
    "outcome",
    "counter",
    "friction",
    "deferral",
    "failure",
    "knowledge",
    "decision",
]);
export const VALID_SEVERITIES = new Set(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);
/** Kinds that carry `severity`. Keep in sync with the payload interfaces below. */
export const SEVERITY_KINDS = new Set(["friction", "deferral", "failure"]);
// ---------------------------------------------------------------------------
// Identity — per-kind composite tuple for dedup (NOT bare ts)
// Mirrors bkit-status.ts's tuple dedupe approach.
// ---------------------------------------------------------------------------
export function identity(event) {
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
// Validate — reject malformed + unknown kind before write
// ---------------------------------------------------------------------------
export function validate(event) {
    if (!event || typeof event !== "object") {
        return { ok: false, reason: "event must be an object" };
    }
    const e = event;
    // A2-mandatory envelope fields
    const mandatory = ["ts", "kind", "repo", "bkitVersion", "step"];
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
    if (!VALID_KINDS.has(e["kind"])) {
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
    const kind = e["kind"];
    // severity — required on the triaged author-written kinds, rejected elsewhere.
    // Enforced on write only; `parse` stays tolerant so pre-severity rows still read.
    if (SEVERITY_KINDS.has(kind)) {
        if (e["severity"] === undefined || e["severity"] === null) {
            return { ok: false, reason: `${kind} row missing required field: severity` };
        }
        if (!VALID_SEVERITIES.has(e["severity"])) {
            return {
                ok: false,
                reason: `${kind} severity must be one of CRITICAL|HIGH|MEDIUM|LOW (got: ${String(e["severity"])})`,
            };
        }
    }
    else if (e["severity"] !== undefined) {
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
                const t = cov[tier];
                if (t === undefined)
                    continue;
                if (typeof t !== "object" || t === null) {
                    return { ok: false, reason: `outcome coverage.${tier} must be an object` };
                }
                for (const m of ["lines", "branches", "functions", "statements"]) {
                    const v = t[m];
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
/**
 * Tolerant parse — per-line try/catch, skips + counts unparseable lines.
 * NEVER throws. NEW behaviour vs parseStatus which throws on malformed lines.
 *
 * No version gating — ALL well-formed rows are kept regardless of `bkitVersion`.
 */
export function parse(raw) {
    const result = {
        events: [],
        malformedLineCount: 0,
    };
    const lines = raw.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === "")
            continue;
        try {
            const obj = JSON.parse(trimmed);
            result.events.push(obj);
        }
        catch {
            result.malformedLineCount++;
        }
    }
    return result;
}
/**
 * Fold events into a Map keyed by per-kind composite identity.
 * Later rows (higher ts) win for the same key — last-write-wins fold.
 * Mirrors bkit-status.ts's dedupe approach but with per-kind composite tuples.
 */
export function fold(events) {
    // Sort by ts ascending so later rows overwrite earlier ones
    const sorted = [...events].sort((a, b) => a.ts - b.ts);
    const state = new Map();
    for (const event of sorted) {
        const key = identity(event);
        state.set(key, event);
    }
    return state;
}
/**
 * Reads the hot file at `hotPath` plus any archive shards matching the
 * ARCHIVE_SHARD_TEMPLATE, folds all events together.
 *
 * Archive shard template: .bkit/archive/{basename}.{YYYYMM}.jsonl
 * e.g. .bkit/archive/stats.202606.jsonl
 */
export function foldFrom(paths) {
    let allEvents = [];
    let totalMalformed = 0;
    for (const p of paths) {
        if (!fs.existsSync(p))
            continue;
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = parse(raw);
        allEvents = allEvents.concat(parsed.events);
        totalMalformed += parsed.malformedLineCount;
    }
    const versionCounts = {};
    for (const e of allEvents) {
        const v = typeof e.bkitVersion === "string" && e.bkitVersion !== "" ? e.bkitVersion : "unknown";
        versionCounts[v] = (versionCounts[v] ?? 0) + 1;
    }
    const rowCount = allEvents.length;
    const maxRowsWarning = rowCount > MAX_ROWS_BEFORE_ROLLUP;
    if (maxRowsWarning) {
        console.warn(`[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: ${rowCount} rows > ${MAX_ROWS_BEFORE_ROLLUP}. Consider archiving to ${ARCHIVE_SHARD_TEMPLATE}.`);
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
export function archiveShardPaths(hotPath) {
    const basename = path.basename(hotPath, ".jsonl");
    const archiveDir = path.join(path.dirname(hotPath), "..", ".bkit", "archive");
    const altArchiveDir = path.join(path.dirname(hotPath), "archive");
    const candidates = [];
    for (const dir of [archiveDir, altArchiveDir]) {
        if (!fs.existsSync(dir))
            continue;
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
export function appendLine(event) {
    const v = validate(event);
    if (!v.ok)
        throw new Error(`[bkit-telemetry] appendLine: invalid event — ${v.reason}`);
    return JSON.stringify(event);
}
export function buildSummary(result) {
    const versionStr = Object.entries(result.versionCounts)
        .map(([v, n]) => `${v}=${n}`)
        .join(", ") || "none";
    const lines = [
        `[bkit-telemetry] rows: ${result.rowCount} | malformed: ${result.malformedLineCount} | versions: ${versionStr}`,
    ];
    if (result.maxRowsWarning) {
        lines.push(`[bkit-telemetry] WARNING: MAX_ROWS_BEFORE_ROLLUP (${MAX_ROWS_BEFORE_ROLLUP}) exceeded — ${result.rowCount} rows in stats.jsonl; consider archiving.`);
    }
    return {
        rowCount: result.rowCount,
        malformedLineCount: result.malformedLineCount,
        versionCounts: result.versionCounts,
        maxRowsWarning: result.maxRowsWarning,
        lines,
    };
}
// Re-export readline for potential streaming use (optional)
export { readline };
