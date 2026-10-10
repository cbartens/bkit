// bkit-context-migrate.ts — automatic relocation of consumer context-fetch config
// from `.agents/config.md` and `docs/observability.md` onto `.agents/context.md`.
//
// Two migrations live here, and `bkit install` / `bkit upgrade` run them in order:
//
//   1. migrateConfigMdToContext  — `.agents/config.md` → `.agents/context.md`.
//      MOVES the consumer section AND transforms `debug-fetch:` → `context-fetch:`
//      inside it, then deletes `.agents/config.md`. This is the one migration under a
//      RELAXED contract: config.md carries the `debug-fetch:` marker vocabulary, so a
//      verbatim move would leave the consumer with markers nothing parses.
//   2. migrateContextFetchToContext — `docs/observability.md` → `.agents/context.md`.
//      MOVE-only; the one rewrite is the same marker swap.
//
// Order matters: config.md runs FIRST so that a consumer with blocks in
// observability.md, a config.md, or both converges on one context.md in a single pass.
//
// Wired into BOTH version-move paths — `bkit install` via runCoreModule (after its
// templates pass) AND `bkit upgrade` via the upgrade engine's explicit call (after its
// render pass), each AFTER context.md's managed block is written — so an upgrading
// consumer need do NOTHING. (install and upgrade are SEPARATE engines — both migrations
// must be called from both.) Dry-run-aware and idempotent.
//
// Safety contract:
//   1. Content-preserving — a block's body is never rewritten except for the
//      `debug-fetch:` → `context-fetch:` token swap, which is confined to that token.
//   2. Idempotent — once the source file has no consumer-section blocks (or is gone),
//      a re-run is a no-op.
//   3. Dedup — a block whose exact text already exists in context.md is dropped from
//      the source but NOT appended twice (survives a partial run).
//   4. Only the well-delimited `<!-- context-fetch:* -->` marker blocks move out of
//      observability.md; any other consumer prose there stays put.
import * as fs from "node:fs";
import * as path from "node:path";
const OBSERVABILITY_RELPATH = path.join("docs", "observability.md");
const CONTEXT_RELPATH = path.join(".agents", "context.md");
/** Legacy location of the same file. Read-and-delete only; never written. */
const LEGACY_CONFIG_RELPATH = path.join(".agents", "config.md");
const BKIT_END_RE = /^<!-- bkit:end -->$/;
// Both marker vocabularies, on purpose. A consumer's observability.md may hold blocks
// written as `debug-fetch:` — matching only `context-fetch:` would silently leave them
// there forever, since nothing else ever revisits that file. They are transformed on
// the way out by renameLegacyContextFetchMarkers.
const FETCH_NS = "(?:debug|context)-fetch";
const BLOCK_OPEN_RE = new RegExp(`^<!-- ${FETCH_NS}:(?:start|provision)(?: [^>]*)? -->$`);
const BLOCK_CLOSE_RE = new RegExp(`^<!-- ${FETCH_NS}:end -->$`);
const NONE_RE = new RegExp(`^<!-- ${FETCH_NS}:none(?: [^>]*)? -->$`);
/**
 * Extract the contiguous consumer-section `context-fetch:*` marker blocks from
 * observability.md and append them to context.md. Pure — no filesystem access.
 *
 * `observability` / `context` are the current file contents. Returns the rewritten
 * contents plus a count. When observability.md has no managed block, no consumer
 * blocks, or context.md has no managed block, returns migrated=false untouched.
 */
export function migrateContextFetchBlocks(observability, context) {
    const noop = {
        migrated: false,
        blockCount: 0,
        newObservability: observability,
        newContext: context,
    };
    const obsLines = observability.split("\n");
    const endIdx = obsLines.findIndex((l) => BKIT_END_RE.test(l));
    if (endIdx === -1)
        return noop; // no managed block → consumer-owned, don't touch
    // context.md must have its own managed block to append below.
    if (!context.split("\n").some((l) => BKIT_END_RE.test(l)))
        return noop;
    // Walk the consumer section (after bkit:end) collecting whole marker blocks and
    // the line indices they occupy.
    const blocks = [];
    const removeIdx = new Set();
    for (let i = endIdx + 1; i < obsLines.length; i++) {
        const line = obsLines[i];
        if (NONE_RE.test(line)) {
            blocks.push(line);
            removeIdx.add(i);
            continue;
        }
        if (BLOCK_OPEN_RE.test(line)) {
            // Capture through the matching close marker (inclusive).
            let j = i;
            const range = [];
            let closed = false;
            for (; j < obsLines.length; j++) {
                range.push(j);
                if (j > i && BLOCK_CLOSE_RE.test(obsLines[j])) {
                    closed = true;
                    break;
                }
            }
            if (!closed)
                break; // malformed (no close) — leave the rest untouched
            blocks.push(range.map((k) => obsLines[k]).join("\n"));
            range.forEach((k) => removeIdx.add(k));
            i = j;
        }
    }
    if (blocks.length === 0)
        return noop;
    // Rebuild observability.md without the moved lines; collapse the blank-line runs
    // the removal leaves behind (avoid a growing gap on repeated shapes).
    const keptLines = obsLines.filter((_, idx) => !removeIdx.has(idx));
    let newObservability = collapseBlankRuns(keptLines.join("\n"));
    // Rename any legacy-vocabulary markers as they move (same swap as for config.md),
    // THEN dedup — so a re-run cannot append a second, differently-spelled
    // copy of a block the consumer already carries.
    const renamed = blocks.map((b) => renameLegacyContextFetchMarkers(b));
    const fresh = renamed.filter((b) => !context.includes(b.trim()));
    let newContext = context;
    if (fresh.length > 0) {
        const trimmed = newContext.replace(/\s+$/, "");
        newContext = trimmed + "\n\n" + fresh.join("\n\n") + "\n";
    }
    // Normalize a trailing newline on observability too.
    newObservability = newObservability.replace(/\s+$/, "") + "\n";
    return {
        migrated: true,
        blockCount: blocks.length,
        newObservability,
        newContext,
    };
}
/** Collapse 3+ consecutive newlines to a single blank line. */
function collapseBlankRuns(s) {
    return s.replace(/\n{3,}/g, "\n\n");
}
/**
 * Filesystem wrapper: read observability.md + context.md, migrate, write both when
 * anything moved. Dry-run logs only. Idempotent no-op when there is nothing to move
 * or either file is absent. Returns a human-readable log line (or null on no-op).
 */
export function migrateContextFetchToContext(cwd, dryRun) {
    const obsPath = path.join(cwd, OBSERVABILITY_RELPATH);
    const contextPath = path.join(cwd, CONTEXT_RELPATH);
    if (!fs.existsSync(obsPath) || !fs.existsSync(contextPath))
        return null;
    const observability = fs.readFileSync(obsPath, "utf-8");
    const context = fs.readFileSync(contextPath, "utf-8");
    const result = migrateContextFetchBlocks(observability, context);
    if (!result.migrated)
        return null;
    const line = `migrated ${result.blockCount} context-fetch block(s) docs/observability.md → .agents/context.md`;
    if (!dryRun) {
        fs.writeFileSync(contextPath, result.newContext, "utf-8");
        fs.writeFileSync(obsPath, result.newObservability, "utf-8");
    }
    return line;
}
/**
 * Rewrite the legacy `debug-fetch:` marker vocabulary inside a consumer's own config text.
 *
 * One token does the whole job: `debug-fetch:` is the prefix of all four markers
 * (`start` / `end` / `provision` / `none`) AND of the `[debug-fetch:<name>] skipped`
 * breadcrumb consumers echo from inside block bodies, so a single swap keeps a
 * consumer's blocks and their stderr breadcrumbs consistent with the docs.
 * Deliberately narrow — the word "debug" elsewhere in their prose or shell is theirs.
 */
export function renameLegacyContextFetchMarkers(text) {
    return text.replace(/debug-fetch:/g, "context-fetch:");
}
/**
 * `.agents/config.md` → `.agents/context.md`.
 *
 * TRANSFORMS as it moves — see `renameLegacyContextFetchMarkers`. Three shapes, all
 * idempotent:
 *
 *   - No legacy file → no-op (the common steady state).
 *   - Legacy file, no context.md yet → move the whole file across, transforming.
 *   - Both present (the normal upgrade: the templates pass just wrote a fresh
 *     context.md) → append the legacy consumer section below context.md's own
 *     managed block, transforming, deduping anything already there.
 *
 * The legacy file is DELETED either way. There is no generic retired-file sweep, so
 * leaving it would strand a stale copy that still reads as authoritative.
 */
export function migrateConfigMdToContext(cwd, dryRun) {
    const legacyPath = path.join(cwd, LEGACY_CONFIG_RELPATH);
    const contextPath = path.join(cwd, CONTEXT_RELPATH);
    if (!fs.existsSync(legacyPath))
        return null;
    const legacy = fs.readFileSync(legacyPath, "utf-8");
    // No context.md yet → straight move of the whole file, markers transformed.
    if (!fs.existsSync(contextPath)) {
        const line = "moved .agents/config.md → .agents/context.md (context-fetch markers renamed)";
        if (!dryRun) {
            fs.mkdirSync(path.dirname(contextPath), { recursive: true });
            fs.writeFileSync(contextPath, renameLegacyContextFetchMarkers(legacy), "utf-8");
            fs.rmSync(legacyPath);
        }
        return line;
    }
    // Both present → carry the legacy CONSUMER section (below `bkit:end`) across. The
    // managed half is bkit's own and the fresh context.md already has the current copy.
    const legacyLines = legacy.split("\n");
    const endIdx = legacyLines.findIndex((l) => BKIT_END_RE.test(l));
    // No managed block at all → the whole legacy file is consumer-owned.
    const consumerRaw = (endIdx === -1 ? legacyLines : legacyLines.slice(endIdx + 1))
        .join("\n")
        .replace(/^\s+|\s+$/g, "");
    const consumer = renameLegacyContextFetchMarkers(consumerRaw);
    const context = fs.readFileSync(contextPath, "utf-8");
    let carried = 0;
    let newContext = context;
    if (consumer !== "" && !context.includes(consumer)) {
        newContext = context.replace(/\s+$/, "") + "\n\n" + consumer + "\n";
        carried = 1;
    }
    const line = carried > 0
        ? "merged .agents/config.md consumer section → .agents/context.md (context-fetch markers renamed), removed .agents/config.md"
        : "removed superseded .agents/config.md (nothing to carry over)";
    if (!dryRun) {
        if (carried > 0)
            fs.writeFileSync(contextPath, newContext, "utf-8");
        fs.rmSync(legacyPath);
    }
    return line;
}
