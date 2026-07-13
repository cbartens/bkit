// bkit-config-migrate.ts — automatic, content-preserving relocation of consumer
// debug-fetch blocks from docs/observability.md → .agents/config.md.
//
// Ships in the release that moves the debug-fetch contract into `.agents/config.md`
// (issue #334). Runs on every `bkit install` / `bkit upgrade` via runCoreModule
// (AFTER the templates pass writes config.md's managed block), so upgrading
// consumers need do NOTHING — their copied-down `debug-fetch:*` blocks move on the
// next install. Modelled on the automatic `.agents/→.bkit/` move + `.envrc`
// re-point in bkit-install.ts (content-preserving, dry-run-aware, idempotent).
//
// Safety contract:
//   1. MOVE, not transform — each block's text is relocated VERBATIM.
//   2. Idempotent — once observability.md has no consumer-section debug-fetch
//      blocks, a re-run is a no-op.
//   3. Dedup — a block whose exact text already exists in config.md is dropped
//      from observability.md but NOT appended twice (survives a partial run).
//   4. Only the well-delimited `<!-- debug-fetch:* -->` marker blocks move; any
//      other consumer prose in observability.md stays put.

import * as fs from "node:fs";
import * as path from "node:path";

const OBSERVABILITY_RELPATH = path.join("docs", "observability.md");
const CONFIG_RELPATH = path.join(".agents", "config.md");

const BKIT_END_RE = /^<!-- bkit:end -->$/;
const BLOCK_OPEN_RE = /^<!-- debug-fetch:(?:start|provision)(?: [^>]*)? -->$/;
const BLOCK_CLOSE_RE = /^<!-- debug-fetch:end -->$/;
const NONE_RE = /^<!-- debug-fetch:none(?: [^>]*)? -->$/;

export interface DebugFetchMigration {
  /** Whether any block was relocated (observability.md changed). */
  migrated: boolean;
  /** Number of debug-fetch blocks moved out of observability.md. */
  blockCount: number;
  /** observability.md with the consumer-section debug-fetch blocks removed. */
  newObservability: string;
  /** config.md with the moved blocks appended to its consumer section (unchanged if none moved). */
  newConfig: string;
}

/**
 * Extract the contiguous consumer-section `debug-fetch:*` marker blocks from
 * observability.md and append them to config.md. Pure — no filesystem access.
 *
 * `observability` / `config` are the current file contents. Returns the rewritten
 * contents plus a count. When observability.md has no managed block, no consumer
 * blocks, or config.md has no managed block, returns migrated=false untouched.
 */
export function migrateDebugFetchBlocks(
  observability: string,
  config: string,
): DebugFetchMigration {
  const noop: DebugFetchMigration = {
    migrated: false,
    blockCount: 0,
    newObservability: observability,
    newConfig: config,
  };

  const obsLines = observability.split("\n");
  const endIdx = obsLines.findIndex((l) => BKIT_END_RE.test(l));
  if (endIdx === -1) return noop; // no managed block → consumer-owned, don't touch
  // config.md must have its own managed block to append below.
  if (!config.split("\n").some((l) => BKIT_END_RE.test(l))) return noop;

  // Walk the consumer section (after bkit:end) collecting whole marker blocks and
  // the line indices they occupy.
  const blocks: string[] = [];
  const removeIdx = new Set<number>();
  for (let i = endIdx + 1; i < obsLines.length; i++) {
    const line = obsLines[i]!;
    if (NONE_RE.test(line)) {
      blocks.push(line);
      removeIdx.add(i);
      continue;
    }
    if (BLOCK_OPEN_RE.test(line)) {
      // Capture through the matching close marker (inclusive).
      let j = i;
      const range: number[] = [];
      let closed = false;
      for (; j < obsLines.length; j++) {
        range.push(j);
        if (j > i && BLOCK_CLOSE_RE.test(obsLines[j]!)) {
          closed = true;
          break;
        }
      }
      if (!closed) break; // malformed (no close) — leave the rest untouched
      blocks.push(range.map((k) => obsLines[k]!).join("\n"));
      range.forEach((k) => removeIdx.add(k));
      i = j;
    }
  }

  if (blocks.length === 0) return noop;

  // Rebuild observability.md without the moved lines; collapse the blank-line runs
  // the removal leaves behind (avoid a growing gap on repeated shapes).
  const keptLines = obsLines.filter((_, idx) => !removeIdx.has(idx));
  let newObservability = collapseBlankRuns(keptLines.join("\n"));

  // Dedup: only append blocks whose exact text is not already in config.md.
  const fresh = blocks.filter((b) => !config.includes(b.trim()));
  let newConfig = config;
  if (fresh.length > 0) {
    const trimmed = newConfig.replace(/\s+$/, "");
    newConfig = trimmed + "\n\n" + fresh.join("\n\n") + "\n";
  }
  // Normalize a trailing newline on observability too.
  newObservability = newObservability.replace(/\s+$/, "") + "\n";

  return {
    migrated: true,
    blockCount: blocks.length,
    newObservability,
    newConfig,
  };
}

/** Collapse 3+ consecutive newlines to a single blank line. */
function collapseBlankRuns(s: string): string {
  return s.replace(/\n{3,}/g, "\n\n");
}

/**
 * Filesystem wrapper: read observability.md + config.md, migrate, write both when
 * anything moved. Dry-run logs only. Idempotent no-op when there is nothing to move
 * or either file is absent. Returns a human-readable log line (or null on no-op).
 */
export function migrateDebugFetchToConfig(cwd: string, dryRun: boolean): string | null {
  const obsPath = path.join(cwd, OBSERVABILITY_RELPATH);
  const configPath = path.join(cwd, CONFIG_RELPATH);
  if (!fs.existsSync(obsPath) || !fs.existsSync(configPath)) return null;

  const observability = fs.readFileSync(obsPath, "utf-8");
  const config = fs.readFileSync(configPath, "utf-8");
  const result = migrateDebugFetchBlocks(observability, config);
  if (!result.migrated) return null;

  const line = `migrated ${result.blockCount} debug-fetch block(s) docs/observability.md → .agents/config.md`;
  if (!dryRun) {
    fs.writeFileSync(configPath, result.newConfig, "utf-8");
    fs.writeFileSync(obsPath, result.newObservability, "utf-8");
  }
  return line;
}
