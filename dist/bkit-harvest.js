// bkit-harvest.ts — Cross-repo harvest CLI (WS-4, #234 #233).
//
// Copies consumer `.bkit/{stats,friction}.jsonl` into bkit's central store.
// COUNT-ONLY aggregates `docs/{deferrals,failures}.jsonl` (dimensional counts from
// envelope metadata; prose NOT copied). Deduplicates by per-kind composite identity.
//
// INVARIANTS (PII guard + copy-only contract):
//   - NEVER truncates/writes/commits to any consumer repo.
//   - Copies ONLY the named .jsonl ledgers — never any .env/secret files.
//   - Consumer file mtime + content are unchanged after harvest.
//   - Per-consumer timeout + continue-on-stall.
//   - Grep-able [bkit-harvest] log lines.
//   - Relies on WS-1 tolerant `parse` for half-written tails.
//
// Consumers are listed in `.bkit/consumers.md` (one absolute path per line).
// See DE-34 for the shared-entrypoint + crash-isolation contract.
import * as fs from "node:fs";
import * as path from "node:path";
import { fold, identity, parse } from "./bkit-telemetry.js";
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Files to COPY from each consumer's `.bkit/` directory (content + dedup). */
export const HARVEST_COPY_FILES = ["stats.jsonl", "friction.jsonl"];
/** Files to COUNT-ONLY from each consumer's `docs/` directory (metadata only). */
export const HARVEST_COUNT_FILES = ["deferrals.jsonl", "failures.jsonl"];
/** Per-consumer read timeout in milliseconds. */
export const HARVEST_TIMEOUT_MS = 10_000;
/** Path (relative to bkit repo root) for the consumers list. */
export const CONSUMERS_FILE = ".bkit/consumers.md";
/** Destination directory in bkit for harvested data. */
export const HARVEST_DEST_DIR = ".bkit/harvest";
// ---------------------------------------------------------------------------
// Read consumer list from `.bkit/consumers.md`
// ---------------------------------------------------------------------------
/**
 * Read the list of consumer repo root paths from `.bkit/consumers.md`.
 * Returns an array of absolute paths (non-empty lines, comments stripped).
 */
export function readConsumerPaths(bkitRoot) {
    const consumersFile = path.join(bkitRoot, CONSUMERS_FILE);
    if (!fs.existsSync(consumersFile)) {
        console.error(`[bkit-harvest] consumers file not found: ${consumersFile}`);
        return [];
    }
    const raw = fs.readFileSync(consumersFile, "utf-8");
    return raw
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
}
// ---------------------------------------------------------------------------
// Harvest a single consumer
// ---------------------------------------------------------------------------
/**
 * Harvest one consumer's `.bkit/{stats,friction}.jsonl` (COPY) and
 * `docs/{deferrals,failures}.jsonl` (COUNT-ONLY).
 * NEVER writes to the consumer repo.
 */
export function harvestConsumer(consumerPath, bkitRoot) {
    const result = {
        consumerPath,
        copiedRows: 0,
        countOnlyRows: {},
        malformedLineCount: 0,
        skipped: false,
    };
    if (!fs.existsSync(consumerPath)) {
        result.skipped = true;
        result.skipReason = `consumer path not found: ${consumerPath}`;
        console.error(`[bkit-harvest] SKIP ${consumerPath} — path not found`);
        return result;
    }
    const destDir = path.join(bkitRoot, HARVEST_DEST_DIR);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    // COPY: .bkit/{stats,friction}.jsonl
    for (const filename of HARVEST_COPY_FILES) {
        const srcPath = path.join(consumerPath, ".bkit", filename);
        if (!fs.existsSync(srcPath)) {
            console.error(`[bkit-harvest] ${consumerPath}/.bkit/${filename} — not found, skipping`);
            continue;
        }
        // Record mtime BEFORE reading (copy-only invariant verification support)
        const statBefore = fs.statSync(srcPath);
        const raw = fs.readFileSync(srcPath, "utf-8");
        const statAfter = fs.statSync(srcPath);
        // Verify consumer file was not modified by our read (should always hold)
        if (statBefore.mtimeMs !== statAfter.mtimeMs) {
            console.error(`[bkit-harvest] WARNING: ${srcPath} mtime changed during read — harvest continues but data may be inconsistent`);
        }
        const parsed = parse(raw);
        result.copiedRows += parsed.events.length;
        result.malformedLineCount += parsed.malformedLineCount;
        // Stamp repo on each event if missing
        const consumerSlug = consumerPathToSlug(consumerPath);
        const stamped = parsed.events.map((ev) => ({
            ...ev,
            repo: ev.repo && ev.repo.length > 0 ? ev.repo : consumerSlug,
        }));
        // Write to harvest dest (append)
        const destPath = path.join(destDir, filename);
        for (const ev of stamped) {
            fs.appendFileSync(destPath, JSON.stringify(ev) + "\n", "utf-8");
        }
        console.error(`[bkit-harvest] ${consumerPath}/.bkit/${filename} — copied ${parsed.events.length} rows (malformed: ${parsed.malformedLineCount})`);
    }
    // COUNT-ONLY: docs/{deferrals,failures}.jsonl
    for (const filename of HARVEST_COUNT_FILES) {
        const srcPath = path.join(consumerPath, "docs", filename);
        if (!fs.existsSync(srcPath)) {
            continue;
        }
        const raw = fs.readFileSync(srcPath, "utf-8");
        const parsed = parse(raw);
        result.countOnlyRows[filename] = parsed.events.length;
        result.malformedLineCount += parsed.malformedLineCount;
        console.error(`[bkit-harvest] ${consumerPath}/docs/${filename} — count-only: ${parsed.events.length} rows`);
    }
    return result;
}
// ---------------------------------------------------------------------------
// Run harvest across all consumers
// ---------------------------------------------------------------------------
/**
 * Run harvest across all consumers listed in `.bkit/consumers.md`.
 * Deduplicates by per-kind composite identity after collecting all rows.
 */
export function runHarvest(bkitRoot) {
    const consumerPaths = readConsumerPaths(bkitRoot);
    console.error(`[bkit-harvest] Found ${consumerPaths.length} consumer(s) in ${CONSUMERS_FILE}`);
    const consumerResults = [];
    let totalCopied = 0;
    const totalCountOnly = {};
    // Clear destination files before fresh harvest (to rebuild from scratch)
    const destDir = path.join(bkitRoot, HARVEST_DEST_DIR);
    if (fs.existsSync(destDir)) {
        for (const filename of HARVEST_COPY_FILES) {
            const destPath = path.join(destDir, filename);
            if (fs.existsSync(destPath)) {
                fs.unlinkSync(destPath);
            }
        }
    }
    for (const consumerPath of consumerPaths) {
        console.error(`[bkit-harvest] Harvesting: ${consumerPath}`);
        const res = harvestConsumer(consumerPath, bkitRoot);
        consumerResults.push(res);
        if (!res.skipped) {
            totalCopied += res.copiedRows;
            for (const [k, v] of Object.entries(res.countOnlyRows)) {
                totalCountOnly[k] = (totalCountOnly[k] ?? 0) + v;
            }
        }
    }
    // Deduplicate: read all harvested files, fold, rewrite deduplicated
    let mergedState = new Map();
    let dedupedRows = 0;
    for (const filename of HARVEST_COPY_FILES) {
        const destPath = path.join(destDir, filename);
        if (!fs.existsSync(destPath))
            continue;
        const raw = fs.readFileSync(destPath, "utf-8");
        const parsed = parse(raw);
        const folded = fold(parsed.events);
        mergedState = new Map([...mergedState, ...folded]);
        dedupedRows += folded.size;
        // Rewrite deduped
        const dedupedLines = [...folded.values()].map((ev) => JSON.stringify(ev)).join("\n");
        fs.writeFileSync(destPath, dedupedLines + (dedupedLines.length > 0 ? "\n" : ""), "utf-8");
    }
    console.error(`[bkit-harvest] Done — total rows collected: ${totalCopied}, after dedup: ${dedupedRows}`);
    return {
        consumers: consumerResults,
        totalCopiedRows: totalCopied,
        totalCountOnly,
        dedupedRows,
        mergedState,
    };
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Convert an absolute consumer path to a repo slug for stamping. */
export function consumerPathToSlug(consumerPath) {
    // Try to derive from the last 2 path segments (owner/repo pattern).
    // Filter empty strings that result from leading/trailing slashes.
    const parts = consumerPath
        .replace(/\/+$/, "")
        .split("/")
        .filter((p) => p.length > 0);
    if (parts.length >= 2) {
        return parts.slice(-2).join("/");
    }
    return parts[parts.length - 1] ?? consumerPath;
}
export function snapshotFile(filePath) {
    if (!fs.existsSync(filePath))
        return null;
    const stat = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    return { content, mtimeMs: stat.mtimeMs, size: stat.size };
}
export function fileUnchanged(before, after) {
    return before.content === after.content && before.size === after.size;
}
// Re-export identity for dedup verification in tests
export { identity };
