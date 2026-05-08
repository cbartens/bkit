// bkit-upgrade.ts — `bkit upgrade` orchestrator + diff engine (P4.T5 / P4.T6).
//
// Design contract (BAR-142 §A5):
//
//   `bkit upgrade` diffs old vs new template content against consumer drift using
//   the `canonicalHashes` field from `.agents/.bkit-version`. Files whose on-disk
//   content matches the canonical hash recorded at last install are safe to upgrade
//   (no consumer drift). Files that differ have consumer drift — do NOT silently
//   overwrite.
//
//   Non-interactive mode (--non-interactive):
//     - Auto-apply non-conflicting changes.
//     - Emit conflict list to stderr (one line per conflicting file).
//     - Exit non-zero when any conflict is detected.
//
//   Conflict = a bkit-managed file where:
//     - The template content has changed (new bkit version ships an update), AND
//     - The consumer has modified the file since last install (on-disk hash ≠ canonical hash).
//
// Dependency: P4.T4 `canonicalHashes` + `isConsumerModified` from bkit-version.ts.
//             P3.T6 `migrateTier1JsonToTier2` from bkit-tiers.ts (upgrade respects migration).

import * as fs from "node:fs";
import * as path from "node:path";
import {
  readBkitVersion,
  writeBkitVersion,
  sha256,
  isConsumerModified,
  type BkitVersion,
} from "./bkit-version.js";
import type { ModuleFlag } from "./bkit-cli.js";

export const LOG_PREFIX = "[bkit-upgrade]";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UpgradeConflict {
  /** Consumer-relative path of the conflicting file. */
  relPath: string;
  /** The new template content bkit would write. */
  templateContent: string;
  /** The current on-disk content (consumer-modified). */
  diskContent: string;
}

export interface UpgradeResult {
  /** Files upgraded (written/updated). */
  updated: string[];
  /** Files with conflicts (consumer drift detected). */
  conflicts: UpgradeConflict[];
  /** Files skipped (template unchanged — no upgrade needed). */
  skipped: string[];
}

// ---------------------------------------------------------------------------
// DiffEngine — compare template content vs consumer disk state
// ---------------------------------------------------------------------------

/**
 * Determine the upgrade action for a single file.
 *
 * Returns:
 *   - `{ action: "update", templateContent }` when the template has changed
 *     AND the consumer has no drift (on-disk hash matches canonical hash).
 *   - `{ action: "conflict", templateContent, diskContent }` when the template
 *     has changed AND the consumer has drift.
 *   - `{ action: "skip" }` when the template has NOT changed since last install.
 *   - `{ action: "new" }` when the file doesn't exist on disk (first-time write).
 */
export type DiffAction =
  | { action: "update"; templateContent: string }
  | { action: "conflict"; templateContent: string; diskContent: string }
  | { action: "skip" }
  | { action: "new"; templateContent: string };

export function diffFile(
  relPath: string,
  absolutePath: string,
  templateContent: string,
  canonicalHashes: Record<string, string>,
): DiffAction {
  // File absent → new write (no consumer drift possible)
  if (!fs.existsSync(absolutePath)) {
    return { action: "new", templateContent };
  }

  const diskContent = fs.readFileSync(absolutePath, "utf-8");
  const templateHash = sha256(templateContent);
  const diskHash = sha256(diskContent);

  // Disk already matches template → skip (idempotent; nothing to apply).
  // Checked first so a missing canonical hash never produces a spurious conflict
  // when the file content is already identical to the template.
  if (diskHash === templateHash) {
    return { action: "skip" };
  }

  // Template unchanged since last install → skip.
  const canonicalHash = canonicalHashes[relPath];
  if (canonicalHash && canonicalHash === templateHash) {
    return { action: "skip" };
  }

  // Template has changed (or canonical hash unknown). Check consumer drift —
  // when canonical hash is missing, isConsumerModified treats the file as drifted
  // to block silent overwrites of pre-v0.9.x installs that never recorded hashes.
  if (isConsumerModified(relPath, absolutePath, canonicalHashes)) {
    return { action: "conflict", templateContent, diskContent };
  }

  return { action: "update", templateContent };
}

// ---------------------------------------------------------------------------
// runUpgrade — orchestrator
// ---------------------------------------------------------------------------

export interface UpgradeOptions {
  /** When true: auto-apply non-conflicting; emit conflicts to stderr; exit non-zero on conflict. */
  nonInteractive: boolean;
  /** When true: show what would change without writing. */
  dryRun: boolean;
  cwd?: string;
}

/**
 * Run the upgrade engine against a set of (relPath, absoluteTemplatePath) pairs.
 *
 * Each entry in `candidates` describes a file bkit manages:
 *   - `relPath`: consumer-relative path (e.g. ".claude/agents/bkit-foo.md")
 *   - `templatePath`: absolute path to the new template file in the bkit package
 *
 * The function reads `canonicalHashes` from `.agents/.bkit-version`, diffs each
 * candidate, and applies the upgrade strategy based on `options`.
 *
 * Returns an `UpgradeResult` describing what happened.
 */
export function runUpgrade(
  candidates: Array<{ relPath: string; templatePath: string }>,
  options: UpgradeOptions,
): UpgradeResult {
  const cwd = options.cwd ?? process.cwd();
  const versionFile = path.join(cwd, ".agents", ".bkit-version");
  const bkitVersion = readBkitVersion(versionFile);
  const canonicalHashes = bkitVersion?.canonicalHashes ?? {};

  const result: UpgradeResult = { updated: [], conflicts: [], skipped: [] };

  for (const { relPath, templatePath } of candidates) {
    if (!fs.existsSync(templatePath)) {
      console.error(`${LOG_PREFIX} Template not found: ${templatePath} — skipping ${relPath}`);
      continue;
    }

    const templateContent = fs.readFileSync(templatePath, "utf-8");
    const absolutePath = path.join(cwd, relPath);
    const diffAction = diffFile(relPath, absolutePath, templateContent, canonicalHashes);

    switch (diffAction.action) {
      case "skip":
        result.skipped.push(relPath);
        break;

      case "new":
      case "update": {
        if (!options.dryRun) {
          fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
          fs.writeFileSync(absolutePath, diffAction.templateContent, "utf-8");
        }
        result.updated.push(relPath);
        console.log(`${LOG_PREFIX}${options.dryRun ? " [dry-run]" : ""} upgrade: ${relPath}`);
        break;
      }

      case "conflict": {
        result.conflicts.push({
          relPath,
          templateContent: diffAction.templateContent,
          diskContent: diffAction.diskContent,
        });
        console.error(
          `${LOG_PREFIX} conflict: ${relPath} — consumer drift detected, NOT overwriting`,
        );
        break;
      }
    }
  }

  // In non-interactive mode: emit conflict summary to stderr
  if (options.nonInteractive && result.conflicts.length > 0) {
    console.error(
      `${LOG_PREFIX} ${result.conflicts.length} conflict(s) detected. Manually merge or revert consumer changes:`,
    );
    for (const c of result.conflicts) {
      console.error(`  - ${c.relPath}`);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// updateCanonicalHashes — record hashes of written files back to .bkit-version
// ---------------------------------------------------------------------------

/**
 * After a successful upgrade, update `canonicalHashes` in `.agents/.bkit-version`
 * to reflect the template content for files where bkit knows the on-disk content
 * matches the template:
 *   - `result.updated` — bkit just wrote the new template content; record its hash.
 *   - `result.skipped` — disk already matched template (idempotent); record the
 *     same template hash so future upgrades stop flagging the file as
 *     unknown-state (the safe-by-default conflict path added when DE-12 flipped
 *     the missing-hash default in `isConsumerModified`).
 *
 * Conflicts are NEVER seeded — that would re-introduce the silent-overwrite bug.
 *
 * Call this AFTER `runUpgrade` completes (P4.T4 integration: hashes must stay
 * in sync with the files bkit actually wrote so the next upgrade can detect drift).
 */
export function updateCanonicalHashesAfterUpgrade(
  result: UpgradeResult,
  candidates: Array<{ relPath: string; templatePath: string }>,
  options: { dryRun: boolean; cwd?: string },
): void {
  if (options.dryRun) return;
  if (result.updated.length === 0 && result.skipped.length === 0) return;

  const cwd = options.cwd ?? process.cwd();
  const versionFile = path.join(cwd, ".agents", ".bkit-version");
  const bkitVersion = readBkitVersion(versionFile);
  if (!bkitVersion) return;

  const seedablePaths = new Set([...result.updated, ...result.skipped]);
  const candidateMap = new Map(candidates.map((c) => [c.relPath, c.templatePath]));

  const newCanonicalHashes = { ...bkitVersion.canonicalHashes };
  for (const relPath of seedablePaths) {
    const templatePath = candidateMap.get(relPath);
    if (!templatePath || !fs.existsSync(templatePath)) continue;
    const content = fs.readFileSync(templatePath, "utf-8");
    newCanonicalHashes[relPath] = sha256(content);
  }

  const updated: BkitVersion = {
    ...bkitVersion,
    canonicalHashes: newCanonicalHashes,
  };
  writeBkitVersion(versionFile, updated);
}
