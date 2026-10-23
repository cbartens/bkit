// scripts/harvest/ledgers.ts — the ledger half of the harvest (bkit's checkout only, never shipped).
//
// Run by `scripts/harvest/bkit-harvest.mjs` (`pnpm harvest`), before the chat scan. For bkit's
// own checkout and every repo in `harvest/consumers.md`:
//   - `.bkit/stats.jsonl`: every row is copied into `harvest/stats.jsonl`. `chat` / `run` rows are
//     then pruned from the repo: they belong in `harvest/` only. Close-time rows (`outcome` /
//     `compliance` / `counter`) stay in the repo.
//   - `.bkit/friction.jsonl`: every row is copied, then pruned (friction is a drained queue).
//   - `docs/{deferrals,failures}.jsonl`: COUNT-ONLY (entities from envelope metadata; prose is
//     never copied).
//
// INVARIANTS (PII guard + copy/prune contract):
//   - Touches ONLY the named .jsonl ledgers — never any .env/secret files.
//   - NEVER commits in any repo — the caller commits.
//   - A row is pruned from a repo ONLY after that exact row is durably fsync'd + read back from
//     the store. The prune gate is byte-for-byte CONTENT of the row in its current shape
//     (`normalize`), never identity. The store holds rows in that shape.
//   - Rows a repo keeps (close-time stats rows) are never rewritten: the repo file is untouched
//     unless a row is pruned from it.
//   - The store ACCUMULATES across runs (never cleared) and holds every DISTINCT row, deduped by
//     content only. It is gitignored and never backed up by bkit, so it is the only record of
//     pruned rows; readers fold it.
//   - A copied row without `repo` gets the repo's `owner/repo` (see `stampRepo`).
//   - Malformed lines are NEVER pruned (not ours to delete).
//   - Grep-able [bkit-harvest] log lines.
//   - Relies on the tolerant `parse` for half-written tails.
//
// Ordering is copy -> fsync -> verify -> prune; a crash at any point re-copies idempotently on
// the next run.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  fold,
  normalize,
  parse,
  resolveRepoSlug,
  type FoldedState,
  type TelemetryEvent,
} from "../../.bkit/core/engine/ledgers/telemetry.js";
import { parseJson } from "../../.bkit/core/engine/shared/json.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Files to COPY from each repo's `.bkit/` directory (content + dedup). */
export const HARVEST_COPY_FILES = ["stats.jsonl", "friction.jsonl"] as const;
/**
 * Per copied file, the rows PRUNED from the repo once they are durably in the store.
 * `friction.jsonl`: every row. `stats.jsonl`: only `chat` / `run` rows — close-time rows stay.
 */
export const HARVEST_PRUNE_KINDS: Record<(typeof HARVEST_COPY_FILES)[number], "all" | string[]> = {
  "stats.jsonl": ["chat", "run"],
  "friction.jsonl": "all",
};
/** Files to COUNT-ONLY from each consumer's `docs/` directory (metadata only). */
export const HARVEST_COUNT_FILES = ["deferrals.jsonl", "failures.jsonl"] as const;
/** Path (relative to bkit repo root) for the consumers list. */
export const CONSUMERS_FILE = "harvest/consumers.md";
/**
 * Destination directory in bkit for harvested data. Repo root, NOT under `.bkit/`
 * (bkit's managed/installed surface).
 */
export const HARVEST_DEST_DIR = "harvest";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HarvestConsumerResult {
  consumerPath: string;
  copiedRows: number;
  /**
   * Distinct ENTITIES per count-only ledger (same-key rows folded to one).
   * This is the dimensional number: a triage pass that closes a deferral appends
   * a second same-key row, which must not read as a second deferral.
   */
  countOnlyRows: Record<string, number>;
  /** Raw line count per count-only ledger. Diverges from countOnlyRows once rows are updated. */
  countOnlyRawRows: Record<string, number>;
  malformedLineCount: number;
  skipped: boolean;
  skipReason?: string;
  /** Rows pruned from this repo's ledgers, keyed by filename. */
  prunedRows: Record<string, number>;
}

export interface HarvestResult {
  /** bkit's own checkout, harvested like a consumer. `null` when it is also listed in `consumers.md`. */
  self: HarvestConsumerResult | null;
  /** The repos in `harvest/consumers.md`. */
  consumers: HarvestConsumerResult[];
  totalCopiedRows: number;
  totalCountOnly: Record<string, number>;
  dedupedRows: number;
  totalPrunedRows: number;
  mergedState: FoldedState;
}

// ---------------------------------------------------------------------------
// Read consumer list from `harvest/consumers.md`
// ---------------------------------------------------------------------------

/**
 * Read the list of consumer repo root paths from `harvest/consumers.md`.
 * Returns an array of absolute paths (non-empty lines, comments stripped).
 */
export function readConsumerPaths(bkitRoot: string): string[] {
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
 * Harvest one repo's `.bkit/{stats,friction}.jsonl` (COPY) and
 * `docs/{deferrals,failures}.jsonl` (COUNT-ONLY).
 * NEVER writes to the repo: pruning is `runHarvest`'s, after the store is durable.
 */
export function harvestConsumer(consumerPath: string, bkitRoot: string): HarvestConsumerResult {
  const result: HarvestConsumerResult = {
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

  const consumerSlug = consumerPathToSlug(consumerPath);

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
      console.error(
        `[bkit-harvest] WARNING: ${srcPath} mtime changed during read — harvest continues but data may be inconsistent`,
      );
    }

    const parsed = parse(raw);
    result.copiedRows += parsed.events.length;
    result.malformedLineCount += parsed.malformedLineCount;

    const stamped = parsed.events.map((ev) => stampRepo(ev, consumerSlug));

    // Write to harvest dest (append)
    const destPath = path.join(destDir, filename);
    for (const ev of stamped) {
      fs.appendFileSync(destPath, JSON.stringify(ev) + "\n", "utf-8");
    }

    console.error(
      `[bkit-harvest] ${consumerPath}/.bkit/${filename} — copied ${parsed.events.length} rows (malformed: ${parsed.malformedLineCount})`,
    );
  }

  // COUNT-ONLY: docs/{deferrals,failures}.jsonl
  for (const filename of HARVEST_COUNT_FILES) {
    const srcPath = path.join(consumerPath, "docs", filename);
    if (!fs.existsSync(srcPath)) {
      continue;
    }
    const raw = fs.readFileSync(srcPath, "utf-8");
    const parsed = parse(raw);
    // Count ENTITIES, not lines: updating a deferral appends a new same-key row, and
    // `fold` collapses same-key rows to the current state. See .bkit/jsonl.md § Updating
    // a Row.
    const folded = fold(parsed.events);
    result.countOnlyRows[filename] = folded.size;
    result.countOnlyRawRows[filename] = parsed.events.length;
    result.malformedLineCount += parsed.malformedLineCount;
    console.error(
      `[bkit-harvest] ${consumerPath}/docs/${filename} — count-only: ${folded.size} entities (${parsed.events.length} rows)`,
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Prune — remove durably-stored rows from a consumer ledger
// ---------------------------------------------------------------------------

/**
 * Stamp `repo` on a row the repo wrote without one; any written `repo` is kept.
 * MUST be applied on both the store side and the prune side, or the two contents
 * diverge and a stored row is never recognised as prunable.
 */
export function stampRepo(event: TelemetryEvent, consumerSlug: string): TelemetryEvent {
  if (typeof event.repo === "string" && event.repo.length > 0) return event;
  return { ...event, repo: consumerSlug };
}

/** What the store durably holds, read back off disk after fsync. */
export interface DurableStore {
  /** Canonical JSON of every confirmed row. THE prune gate — content, not identity. */
  rows: Set<string>;
}

export interface PruneResult {
  removed: number;
  /** Lines the prune would take but left: malformed, or appended after the copy. */
  kept: number;
}

/** Whether a row of `kinds` is pruned once it is stored (`all`: every row). */
function drains(event: TelemetryEvent, kinds: "all" | string[]): boolean {
  return kinds === "all" || kinds.includes(String(event.kind));
}

/**
 * Remove from `srcPath` exactly those rows of `kinds` whose CONTENT is durably in the store.
 *
 * Gated on byte-for-byte content, NOT on identity.
 *
 * Line-level, NOT event-level: a line that does not parse is kept verbatim, and a row of
 * another kind is kept verbatim.
 *
 * Re-reads the file at prune time, so rows appended by the repo DURING the harvest
 * survive.
 *
 * Writes via temp-file + rename; an interrupted prune never leaves a torn ledger.
 */
export function pruneConsumerFile(
  srcPath: string,
  consumerSlug: string,
  durable: DurableStore,
  kinds: "all" | string[] = "all",
): PruneResult {
  const raw = fs.readFileSync(srcPath, "utf-8");
  const lines: string[] = [];
  let removed = 0;
  let kept = 0;

  for (const line of raw.split("\n")) {
    if (line.trim() === "") continue;
    const parsed = parseJson(line.trim());
    if (!parsed.ok) {
      lines.push(line); // malformed — never ours to delete
      kept++;
      continue;
    }
    const event = parsed.value as TelemetryEvent;
    if (!drains(event, kinds)) {
      lines.push(line);
      continue;
    }
    if (durable.rows.has(canonicalRow(stampRepo(event, consumerSlug)))) {
      removed++;
      continue;
    }
    lines.push(line);
    kept++;
  }

  if (removed === 0) return { removed: 0, kept };

  const next = lines.length > 0 ? lines.join("\n") + "\n" : "";
  const tmpPath = `${srcPath}.bkit-harvest.tmp`;
  fs.writeFileSync(tmpPath, next, "utf-8");
  fs.renameSync(tmpPath, srcPath);
  return { removed, kept };
}

/**
 * Canonical serialisation used to compare a consumer row against a stored row: the
 * row in the current shape (`normalize`), so a row written before `schema: 2` and its
 * migrated copy are the same content. The store is written from exactly this
 * function's output, and `normalize` returns a `schema` row unchanged, so the
 * store's own rewrite is byte-stable.
 */
function canonicalRow(event: TelemetryEvent): string {
  return JSON.stringify(normalize(event));
}

/** fsync a file to disk, so a durability check is not just a page-cache read. */
function fsyncFile(filePath: string): void {
  const fd = fs.openSync(filePath, "r+");
  try {
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
}

// ---------------------------------------------------------------------------
// Run harvest across all consumers
// ---------------------------------------------------------------------------

/**
 * Run the ledger harvest over bkit's own checkout (`bkitRoot`) and every repo listed in
 * `harvest/consumers.md`. Deduplicates the store by row content after collecting all rows,
 * then prunes what drains (`HARVEST_PRUNE_KINDS`).
 */
export function runHarvest(bkitRoot: string): HarvestResult {
  const consumerPaths = readConsumerPaths(bkitRoot);
  console.error(`[bkit-harvest] Found ${consumerPaths.length} consumer(s) in ${CONSUMERS_FILE}`);

  let totalCopied = 0;
  const totalCountOnly: Record<string, number> = {};
  const harvestOne = (repoPath: string): HarvestConsumerResult => {
    console.error(`[bkit-harvest] Harvesting: ${repoPath}`);
    const res = harvestConsumer(repoPath, bkitRoot);
    if (!res.skipped) {
      totalCopied += res.copiedRows;
      for (const [k, v] of Object.entries(res.countOnlyRows)) {
        totalCountOnly[k] = (totalCountOnly[k] ?? 0) + v;
      }
    }
    return res;
  };

  // bkit's own checkout first, unless consumers.md lists it too (then it is harvested there).
  const listsSelf = consumerPaths.some((p) => samePath(p, bkitRoot));
  const self = listsSelf ? null : harvestOne(bkitRoot);
  const consumerResults = consumerPaths.map(harvestOne);

  // The central store ACCUMULATES — it is NEVER cleared between runs. Re-copied rows
  // collapse via the content dedup below.
  const destDir = path.join(bkitRoot, HARVEST_DEST_DIR);

  // Deduplicate by content: drop exact re-copies, keep every distinct row in first-seen
  // order. Entity counts come from the fold, which is a read — never what is written.
  let mergedState: FoldedState = new Map();
  let dedupedRows = 0;
  /** Per-file durable content read BACK OFF DISK — the prune gate. */
  const durableByFile: Record<string, DurableStore> = {};

  for (const filename of HARVEST_COPY_FILES) {
    const destPath = path.join(destDir, filename);
    if (!fs.existsSync(destPath)) continue;
    const raw = fs.readFileSync(destPath, "utf-8");
    const parsed = parse(raw);
    const folded = fold(parsed.events);
    mergedState = new Map([...mergedState, ...folded]);
    dedupedRows += folded.size;

    const distinctLines = [...new Set(parsed.events.map((ev) => canonicalRow(ev)))].join("\n");
    fs.writeFileSync(destPath, distinctLines + (distinctLines.length > 0 ? "\n" : ""), "utf-8");

    // Durability gate: fsync, then read the rows BACK OFF DISK; prune against those.
    fsyncFile(destPath);
    const verified = parse(fs.readFileSync(destPath, "utf-8"));
    durableByFile[filename] = {
      rows: new Set(verified.events.map((ev) => canonicalRow(ev))),
    };
  }

  // Prune ONLY now — every row below is confirmed byte-for-byte in the store on disk.
  let totalPruned = 0;
  let totalKept = 0;
  for (const res of self ? [self, ...consumerResults] : consumerResults) {
    if (res.skipped) continue;
    const consumerSlug = consumerPathToSlug(res.consumerPath);
    for (const filename of HARVEST_COPY_FILES) {
      const srcPath = path.join(res.consumerPath, ".bkit", filename);
      if (!fs.existsSync(srcPath)) continue;
      const durable = durableByFile[filename];
      if (!durable || durable.rows.size === 0) continue;
      const { removed, kept } = pruneConsumerFile(
        srcPath,
        consumerSlug,
        durable,
        HARVEST_PRUNE_KINDS[filename],
      );
      if (removed > 0) {
        res.prunedRows[filename] = removed;
        totalPruned += removed;
        console.error(
          `[bkit-harvest] ${res.consumerPath}/.bkit/${filename} — pruned ${removed} harvested row(s)`,
        );
      }
      if (kept > 0) {
        totalKept += kept;
        console.error(
          `[bkit-harvest] ${res.consumerPath}/.bkit/${filename} — kept ${kept} line(s) not in the store (malformed, or appended after the copy)`,
        );
      }
    }
  }

  console.error(
    `[bkit-harvest] Done — total rows collected: ${totalCopied}, entities after fold: ${dedupedRows}, pruned from repos: ${totalPruned}, kept in repos: ${totalKept}`,
  );
  if (totalPruned > 0) {
    console.error(
      `[bkit-harvest] ${totalPruned} row(s) now exist ONLY in ${HARVEST_DEST_DIR}/ (gitignored, not backed up by bkit).`,
    );
  }

  return {
    self,
    consumers: consumerResults,
    totalCopiedRows: totalCopied,
    totalCountOnly,
    dedupedRows,
    totalPrunedRows: totalPruned,
    mergedState,
  };
}

/** Whether two paths name the same directory (symlinks and trailing slashes resolved). */
function samePath(a: string, b: string): boolean {
  const real = (p: string): string => (fs.existsSync(p) ? fs.realpathSync(p) : path.resolve(p));
  return real(a) === real(b);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert an absolute consumer path to a repo slug for stamping. */
export function consumerPathToSlug(consumerPath: string): string {
  // The consumer's OWN git remote — the only authoritative source.
  const slug = resolveRepoSlug(consumerPath);
  if (slug) return slug;

  // Last resort, and loud: a remote-less consumer still harvests.
  const parts = consumerPath
    .replace(/\/+$/, "")
    .split("/")
    .filter((p) => p.length > 0);
  const fallback = parts[parts.length - 1] ?? consumerPath;
  console.error(
    `[bkit-harvest] no git remote at ${consumerPath} — falling back to path-derived slug "${fallback}". ` +
      `This is NOT an owner/repo slug and will not join rows from the same repo harvested elsewhere.`,
  );
  return fallback;
}
