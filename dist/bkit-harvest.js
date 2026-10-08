// bkit-harvest.ts — Cross-repo harvest CLI (WS-4, #234 #233).
//
// MOVES consumer `.bkit/friction.jsonl` and COPIES `.bkit/stats.jsonl` into bkit's
// central store at `harvest/`. COUNT-ONLY aggregates `docs/{deferrals,failures}.jsonl`
// (dimensional counts from envelope metadata; prose NOT copied). Deduplicates by
// row content; entity counts fold by per-kind composite identity.
//
// INVARIANTS (PII guard + move/copy contract):
//   - Touches ONLY the named .jsonl ledgers — never any .env/secret files.
//   - NEVER commits in any repo (bkit's or a consumer's) — the caller commits.
//   - stats.jsonl is COPY-ONLY: consumer mtime + content unchanged.
//   - friction.jsonl is MOVE: harvested rows are pruned from the consumer, but ONLY
//     after that exact row is durably fsync'd + read back from the central store (#343).
//   - The prune gate is byte-for-byte CONTENT, never identity: `fold` collapses rows
//     sharing an identity, so an identity gate deletes colliding rows the store never
//     kept.
//   - The central store ACCUMULATES across runs (never cleared) and holds every
//     DISTINCT row, deduped by content only. It is never rewritten from the fold: a
//     fold winner can change between runs (a newer same-key row, a legacy `ts`), and
//     a store that kept only winners dropped rows an earlier run had already pruned
//     (#343). It is the only record of pruned consumer friction until the caller
//     commits it; readers fold it.
//   - Malformed consumer lines are NEVER pruned (not ours to delete).
//   - Per-consumer timeout + continue-on-stall.
//   - Grep-able [bkit-harvest] log lines.
//   - Relies on WS-1 tolerant `parse` for half-written tails.
//
// #234 originally locked harvest as COPY-ONLY ("copying, not moving, makes a harvest
// bug structurally non-destructive"). #343 deliberately reverses that for friction
// only: friction is a work queue that must drain, so consumers start each cycle clean.
// The safety the copy-only rule bought is preserved structurally instead, by the
// copy -> fsync -> verify -> prune ordering: a crash at any point re-copies
// idempotently on the next run rather than losing rows.
//
// Consumers are listed in `docs/consumers.md` (one absolute path per line).
// See DE-34 for the shared-entrypoint + crash-isolation contract.
import * as fs from "node:fs";
import * as path from "node:path";
import { fold, identity, parse, resolveRepoSlug, } from "./bkit-telemetry.js";
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
/** Files to COPY from each consumer's `.bkit/` directory (content + dedup). */
export const HARVEST_COPY_FILES = ["stats.jsonl", "friction.jsonl"];
/**
 * Files PRUNED from the consumer after their rows are durably in the central store.
 * Must be a subset of HARVEST_COPY_FILES. `stats.jsonl` is deliberately absent —
 * run-outcome metrics are the consumer's own history and are copied, never moved.
 */
export const HARVEST_PRUNE_FILES = ["friction.jsonl"];
/** Files to COUNT-ONLY from each consumer's `docs/` directory (metadata only). */
export const HARVEST_COUNT_FILES = ["deferrals.jsonl", "failures.jsonl"];
/** Per-consumer read timeout in milliseconds. */
export const HARVEST_TIMEOUT_MS = 10_000;
/** Path (relative to bkit repo root) for the consumers list. */
export const CONSUMERS_FILE = "docs/consumers.md";
/**
 * Destination directory in bkit for harvested data. Repo root, NOT under `.bkit/` —
 * `.bkit/` is bkit's managed/installed surface and harvested consumer data is neither
 * managed nor shipped (#343).
 */
export const HARVEST_DEST_DIR = "harvest";
// ---------------------------------------------------------------------------
// Read consumer list from `docs/consumers.md`
// ---------------------------------------------------------------------------
/**
 * Read the list of consumer repo root paths from `docs/consumers.md`.
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
        countOnlyRawRows: {},
        malformedLineCount: 0,
        skipped: false,
        prunedRows: {},
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
        const stamped = parsed.events.map((ev) => stampRepo(ev, consumerSlug));
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
        // Count ENTITIES, not lines. A row is not an entity: updating a deferral
        // (triage closing it, adding references) appends a new same-key row, so a
        // raw line count reports one deferral as two and inflates with every triage
        // pass. `fold` collapses same-key rows to the current state — the thing the
        // dimensional harvest is actually counting. See .bkit/jsonl.md § Updating a Row.
        const folded = fold(parsed.events);
        result.countOnlyRows[filename] = folded.size;
        result.countOnlyRawRows[filename] = parsed.events.length;
        result.malformedLineCount += parsed.malformedLineCount;
        console.error(`[bkit-harvest] ${consumerPath}/docs/${filename} — count-only: ${folded.size} entities (${parsed.events.length} rows)`);
    }
    return result;
}
// ---------------------------------------------------------------------------
// Prune — remove durably-stored rows from a consumer ledger
// ---------------------------------------------------------------------------
/**
 * Stamp `repo` on an event when the consumer wrote the row without one.
 * MUST be applied on both the store side and the prune side, or the two contents
 * diverge and a stored row is never recognised as prunable.
 */
export function stampRepo(event, consumerSlug) {
    return {
        ...event,
        repo: event.repo && event.repo.length > 0 ? event.repo : consumerSlug,
    };
}
/**
 * Remove from `srcPath` exactly those rows whose CONTENT is durably in the store.
 *
 * Gated on byte-for-byte content, NOT on identity. This distinction is load-bearing and
 * was a real data-loss bug (#343): `fold()` collapses rows sharing an identity, so an
 * identity-gated prune deletes every colliding row from the consumer when the store
 * holds only one of them. Real consumer data hit this: friction `key`s were truncated
 * to ~68 chars, so two distinct entries produced byte-identical keys and one identity.
 *
 * Line-level, NOT event-level: a line that does not parse is kept verbatim. The tolerant
 * `parse` exists so a half-written tail does not abort a harvest — pruning that same tail
 * would delete a row we never stored.
 *
 * Re-reads the file at prune time so rows appended by the consumer DURING the harvest
 * survive rather than being blanket-truncated.
 *
 * Writes via temp-file + rename so an interrupted prune cannot leave a torn ledger.
 */
export function pruneConsumerFile(srcPath, consumerSlug, durable) {
    const raw = fs.readFileSync(srcPath, "utf-8");
    const kept = [];
    let removed = 0;
    for (const line of raw.split("\n")) {
        if (line.trim() === "")
            continue;
        let event;
        try {
            event = JSON.parse(line.trim());
        }
        catch {
            kept.push(line); // malformed — never ours to delete
            continue;
        }
        if (durable.rows.has(canonicalRow(stampRepo(event, consumerSlug)))) {
            removed++;
            continue;
        }
        kept.push(line);
    }
    if (removed === 0)
        return { removed: 0, kept: kept.length };
    const next = kept.length > 0 ? kept.join("\n") + "\n" : "";
    const tmpPath = `${srcPath}.bkit-harvest.tmp`;
    fs.writeFileSync(tmpPath, next, "utf-8");
    fs.renameSync(tmpPath, srcPath);
    return { removed, kept: kept.length };
}
/**
 * Canonical serialisation used to compare a consumer row against a stored row.
 * Safe as a plain `JSON.stringify`: the store was written from exactly this function's
 * output, and a JSON.parse -> JSON.stringify round-trip preserves key order, so the
 * store's own rewrite is byte-stable.
 */
function canonicalRow(event) {
    return JSON.stringify(event);
}
/** fsync a file to disk, so a durability check is not just a page-cache read. */
function fsyncFile(filePath) {
    const fd = fs.openSync(filePath, "r+");
    try {
        fs.fsyncSync(fd);
    }
    finally {
        fs.closeSync(fd);
    }
}
// ---------------------------------------------------------------------------
// Run harvest across all consumers
// ---------------------------------------------------------------------------
/**
 * Run harvest across all consumers listed in `docs/consumers.md`.
 * Deduplicates the store by row content after collecting all rows.
 */
export function runHarvest(bkitRoot) {
    const consumerPaths = readConsumerPaths(bkitRoot);
    console.error(`[bkit-harvest] Found ${consumerPaths.length} consumer(s) in ${CONSUMERS_FILE}`);
    const consumerResults = [];
    let totalCopied = 0;
    const totalCountOnly = {};
    // The central store ACCUMULATES — it is NEVER cleared between runs. Harvest prunes
    // the consumer once a row is stored, so the store is the only remaining record of
    // that row until the caller commits it. Clearing here would delete the originals'
    // only copy on the very next run. Re-copied rows collapse via the content dedup below.
    const destDir = path.join(bkitRoot, HARVEST_DEST_DIR);
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
    // Deduplicate by content: drop exact re-copies, keep every distinct row in first-seen
    // order. Entity counts come from the fold, which is a read — never what is written.
    let mergedState = new Map();
    let dedupedRows = 0;
    /** Per-file durable content read BACK OFF DISK — the prune gate. */
    const durableByFile = {};
    for (const filename of HARVEST_COPY_FILES) {
        const destPath = path.join(destDir, filename);
        if (!fs.existsSync(destPath))
            continue;
        const raw = fs.readFileSync(destPath, "utf-8");
        const parsed = parse(raw);
        const folded = fold(parsed.events);
        mergedState = new Map([...mergedState, ...folded]);
        dedupedRows += folded.size;
        const distinctLines = [...new Set(parsed.events.map((ev) => canonicalRow(ev)))].join("\n");
        fs.writeFileSync(destPath, distinctLines + (distinctLines.length > 0 ? "\n" : ""), "utf-8");
        // Durability gate: fsync, then read the rows BACK OFF DISK. Pruning against the
        // in-memory rows would trust a write we never confirmed landed.
        fsyncFile(destPath);
        const verified = parse(fs.readFileSync(destPath, "utf-8"));
        durableByFile[filename] = {
            rows: new Set(verified.events.map((ev) => canonicalRow(ev))),
        };
    }
    // Prune ONLY now — every row below is confirmed byte-for-byte in the store on disk.
    let totalPruned = 0;
    let totalKept = 0;
    for (const res of consumerResults) {
        if (res.skipped)
            continue;
        const consumerSlug = consumerPathToSlug(res.consumerPath);
        for (const filename of HARVEST_PRUNE_FILES) {
            const srcPath = path.join(res.consumerPath, ".bkit", filename);
            if (!fs.existsSync(srcPath))
                continue;
            const durable = durableByFile[filename];
            if (!durable || durable.rows.size === 0)
                continue;
            const { removed, kept } = pruneConsumerFile(srcPath, consumerSlug, durable);
            if (removed > 0) {
                res.prunedRows[filename] = removed;
                totalPruned += removed;
                console.error(`[bkit-harvest] ${res.consumerPath}/.bkit/${filename} — pruned ${removed} harvested row(s)`);
            }
            if (kept > 0) {
                totalKept += kept;
                console.error(`[bkit-harvest] ${res.consumerPath}/.bkit/${filename} — kept ${kept} line(s) not in the store (malformed, or appended after the copy)`);
            }
        }
    }
    console.error(`[bkit-harvest] Done — total rows collected: ${totalCopied}, entities after fold: ${dedupedRows}, pruned from consumers: ${totalPruned}, kept in consumers: ${totalKept}`);
    if (totalPruned > 0) {
        console.error(`[bkit-harvest] ${totalPruned} row(s) now exist ONLY in ${HARVEST_DEST_DIR}/ — commit it to make them durable.`);
    }
    return {
        consumers: consumerResults,
        totalCopiedRows: totalCopied,
        totalCountOnly,
        dedupedRows,
        totalPrunedRows: totalPruned,
        mergedState,
    };
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Convert an absolute consumer path to a repo slug for stamping. */
export function consumerPathToSlug(consumerPath) {
    // The consumer's OWN git remote — the only authoritative source.
    const slug = resolveRepoSlug(consumerPath);
    if (slug)
        return slug;
    // Last resort, and loud. The previous implementation used the last two path
    // segments unconditionally, which makes the "owner" a directory on whoever's
    // machine ran the harvest: /Users/x/Documents/GitHub/app-gether-life became
    // `GitHub/app-gether-life`, and re-cloning to ~/code/ would have silently
    // minted `code/app-gether-life` as a THIRD identity for the same repo.
    // `repo` is part of identity() for every kind, so each spelling forks the
    // entity. Kept only so a remote-less consumer still harvests, never silently.
    const parts = consumerPath
        .replace(/\/+$/, "")
        .split("/")
        .filter((p) => p.length > 0);
    const fallback = parts[parts.length - 1] ?? consumerPath;
    console.error(`[bkit-harvest] no git remote at ${consumerPath} — falling back to path-derived slug "${fallback}". ` +
        `This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.`);
    return fallback;
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
