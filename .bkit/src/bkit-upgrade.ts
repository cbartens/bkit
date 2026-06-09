// bkit-upgrade.ts — `bkit upgrade` orchestrator + diff engine (P4.T5 / P4.T6).
//
// Design contract (BAR-142 §A5):
//
//   `bkit upgrade` diffs old vs new template content against consumer drift using
//   the `canonicalHashes` field from `.bkit/version`. Files whose on-disk
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
//     - The consumer has modified the file since last install (on-disk hash != canonical hash).
//
// Dependency: P4.T4 `canonicalHashes` + `isConsumerModified` from bkit-version.ts.
//             BAR-167 v2.0.0: `migrateLegacyBkitEnvelope` from bkit-tiers.ts runs before
//             `writeTier2JsonContained` to strip legacy `__bkit__` envelope on upgrade.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  readBkitVersion,
  writeBkitVersion,
  sha256,
  isConsumerModified,
  type BkitVersion,
} from "./bkit-version.js";
import { writeTier2, writeTier2JsonContained, type WriteSet } from "./bkit-tiers.js";
import type { MarkerStyle } from "./bkit-install.js";
import { applyTokens, type TokenMap } from "./bkit-tokens.js";
import type { ManifestEntry } from "./bkit-manifest.js";
import type { ModuleFlag } from "./bkit-cli.js";

/** Zero-value token map — markered-text templates managed on upgrade are token-free. */
const EMPTY_TOKENS: TokenMap = {
  NODE_VERSION: "",
  DEFAULT_BRANCH: "",
  PROJECT_NAME: "",
  REPO_SLUG: "",
};

/**
 * Detect a template's managed-block marker style from its content.
 * The html-comment marker (`<!-- bkit:start -->`) may itself be hash-prefixed in
 * hash-comment files (`# <!-- bkit:start -->` in `.gitignore`/`.gitattributes`), so
 * it is checked FIRST; only files using the bare `# bkit:start` marker are hash-comment.
 * Returns null when the template carries NO bkit block (→ not a block-merge file).
 */
function detectMarkerStyle(templateContent: string): MarkerStyle | null {
  if (templateContent.includes("<!-- bkit:start -->")) return "html-comment";
  if (templateContent.includes("# bkit:start")) return "hash-comment";
  return null;
}

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

/**
 * A bkit-managed template the upgrade engine may write to the consumer repo.
 *   - `relPath`: consumer-relative dest path (already dotfile-remapped).
 *   - `templatePath`: absolute path to the new template file in the bkit package.
 *   - `format`: manifest format that drives the write strategy. When omitted the
 *     file is treated as whole-file byte-equal (drift-detected, conflict-aware).
 */
export interface UpgradeCandidate {
  relPath: string;
  templatePath: string;
  format?: ManifestEntry["format"];
  /**
   * Seed-or-print (Tier 3): bkit seeds it once, consumer owns it after. Upgrade must
   * never overwrite it when present — surface a conflict instead (mirrors install's
   * writeTier3). Only meaningful for whole-file (byte-equal-text) candidates.
   */
  seedOrPrint?: boolean;
  /**
   * Pre-rendered template content that overrides reading `templatePath`. Used for
   * files install writes via a transform the upgrade walk can't reproduce from the raw
   * template — e.g. the tracker-conditional `bkit-auto.yml` (issue #138), rendered with
   * the consumer's `bkit.issueTracker` so install and upgrade emit byte-identical output.
   */
  contentOverride?: string;
}

export interface UpgradeOptions {
  /** When true: auto-apply non-conflicting; emit conflicts to stderr; exit non-zero on conflict. */
  nonInteractive: boolean;
  /** When true: show what would change without writing. */
  dryRun: boolean;
  cwd?: string;
  /** Tokens applied to markered-text templates (defaults to zero-value — those templates are token-free). */
  tokens?: TokenMap;
}

/**
 * Run the upgrade engine against a set of (relPath, absoluteTemplatePath) pairs.
 *
 * Each entry in `candidates` describes a file bkit manages:
 *   - `relPath`: consumer-relative path (e.g. ".claude/agents/bkit-foo.md")
 *   - `templatePath`: absolute path to the new template file in the bkit package
 *
 * The function reads `canonicalHashes` from `.bkit/version`, diffs each
 * candidate, and applies the upgrade strategy based on `options`.
 *
 * Returns an `UpgradeResult` describing what happened.
 */
export function runUpgrade(candidates: UpgradeCandidate[], options: UpgradeOptions): UpgradeResult {
  const cwd = options.cwd ?? process.cwd();
  const versionFile = path.join(cwd, ".bkit", "version");
  const bkitVersion = readBkitVersion(versionFile);
  const canonicalHashes = bkitVersion?.canonicalHashes ?? {};
  const tokens = options.tokens ?? EMPTY_TOKENS;

  const result: UpgradeResult = { updated: [], conflicts: [], skipped: [] };
  // Local WriteSet drives updated/skipped classification for the block/scope-merge
  // formats; the tier writers push exactly one entry per file they actually change.
  const ws: WriteSet = { writes: [] };

  for (const { relPath, templatePath, format, seedOrPrint, contentOverride } of candidates) {
    if (contentOverride === undefined && !fs.existsSync(templatePath)) {
      console.error(`${LOG_PREFIX} Template not found: ${templatePath} — skipping ${relPath}`);
      continue;
    }

    const absolutePath = path.join(cwd, relPath);
    // `contentOverride` (e.g. the tracker-rendered bkit-auto.yml, #138) wins over the
    // raw template so upgrade emits the same bytes install would.
    const templateContent = contentOverride ?? fs.readFileSync(templatePath, "utf-8");

    // Resolve the write strategy the SAME way `bkit install` would — so install and
    // upgrade can never disagree on a file and fight each other across runs:
    //
    //   - manifest `format` is authoritative when present:
    //       markered-text → block-merge (writeTier2, preserves content outside markers)
    //       json          → deep-merge  (writeTier2JsonContained, preserves consumer keys)
    //       byte-equal-text → whole-file/diff — even when the template carries markers
    //                         (e.g. `.vale.ini`, which install writes verbatim via
    //                         writeTier1; block-merging it would reformat the block and
    //                         churn forever against install).
    //   - NO manifest entry: the install core-templates pass block-merges markered
    //       MARKDOWN it manages as a directory (`docs/*.md`, `.agents/*.md`) where the
    //       consumer's prose lives after `bkit:end`; everything else (e.g. canonical
    //       `.vale/styles/**.yml`) is whole-file. So: markered `.md` → block-merge.
    //
    // Block/scope-merge are ALWAYS safe (never a whole-file overwrite), so they have no
    // conflict path; whole-file keeps the drift-detect/conflict guard.
    const isMarkdown = relPath.endsWith(".md");
    const markerStyle = detectMarkerStyle(templateContent);
    const blockMerge =
      format === "markered-text" || (format === undefined && isMarkdown && markerStyle !== null);
    if (blockMerge || format === "json") {
      const before = ws.writes.length;
      if (format === "json") {
        writeTier2JsonContained(templatePath, absolutePath, options.dryRun, ws);
      } else {
        writeTier2(
          templatePath,
          absolutePath,
          tokens,
          markerStyle ?? "html-comment",
          options.dryRun,
          ws,
        );
      }
      if (ws.writes.length > before) {
        result.updated.push(relPath);
        console.log(
          `${LOG_PREFIX}${options.dryRun ? " [dry-run]" : ""} upgrade (merge): ${relPath}`,
        );
      } else {
        result.skipped.push(relPath);
      }
      continue;
    }

    // Whole-file formats (byte-equal-text, or unmanaged non-markered templates).
    // Token-substitute FIRST (matching install's writeTier1/writeTier3 tokens) so
    // drift-detect compares like-for-like and a freshly-seeded file gets real values,
    // not a literal `{{DEFAULT_BRANCH}}` (#129 §2). Token-free templates are unchanged.
    const effectiveTemplate = applyTokens(templateContent, tokens);
    const diffAction = diffFile(relPath, absolutePath, effectiveTemplate, canonicalHashes);

    // Seed-or-print (Tier 3) files are consumer-owned after the initial seed: install's
    // writeTier3 never overwrites a present one, so neither may upgrade. A present seed
    // file with no whole-file drift would otherwise be an "update" (silent overwrite) —
    // but the consumer's customisation may BE the recorded canonical baseline, so
    // "no drift" must NOT license clobbering it. Downgrade to a conflict (#129 §1).
    if (seedOrPrint && diffAction.action === "update") {
      result.conflicts.push({
        relPath,
        templateContent: effectiveTemplate,
        diskContent: fs.readFileSync(absolutePath, "utf-8"),
      });
      console.error(
        `${LOG_PREFIX} conflict: ${relPath} — seed-or-print file is consumer-owned, NOT overwriting`,
      );
      continue;
    }

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
 * After a successful upgrade, update `.bkit/version`:
 *   - `canonicalHashes`: refresh from the ON-DISK content of every file bkit wrote
 *     or confirmed (`result.updated` ∪ `result.skipped`). For block/scope-merge
 *     formats the disk content is NOT the template (it carries consumer content
 *     too), so the file must be hashed as it now sits on disk. Conflicts are NEVER
 *     seeded — that would re-introduce the silent-overwrite bug.
 *   - `pinnedVersion`: bump to the version just upgraded TO (`options.pinnedVersion`).
 *     `bkit upgrade` previously refreshed hashes but left the pin stale, so the very
 *     next `bkit check` wanted to write the pin (1 write → exit 1), leaving a clean
 *     upgrade in a CI-FAILING state until a manual edit (issue #129 §3). Writing the
 *     pin here — exactly as `install`/`check` do — keeps upgrade drift-clean.
 *
 * Call this AFTER `runUpgrade` completes (P4.T4 integration: hashes must stay
 * in sync with the files bkit actually wrote so the next upgrade can detect drift).
 */
export function updateCanonicalHashesAfterUpgrade(
  result: UpgradeResult,
  options: { dryRun: boolean; cwd?: string; pinnedVersion?: string },
): void {
  if (options.dryRun) return;

  const cwd = options.cwd ?? process.cwd();
  const versionFile = path.join(cwd, ".bkit", "version");
  const bkitVersion = readBkitVersion(versionFile);
  if (!bkitVersion) return;

  const seedablePaths = new Set([...result.updated, ...result.skipped]);

  const newCanonicalHashes = { ...bkitVersion.canonicalHashes };
  for (const relPath of seedablePaths) {
    // Exclude .agents/ internal files (docs.md, friction.md, rules.md, skills.md,
    // .env.example etc.) from canonicalHashes — they are not consumer-facing files
    // whose hashes bkit uses for drift detection. Mirrors the same filter applied
    // in the install path (bkit-modules.ts postDispatch, line ~470).
    if (relPath.startsWith(".agents" + path.sep)) continue;
    const absolutePath = path.join(cwd, relPath);
    if (!fs.existsSync(absolutePath)) continue;
    newCanonicalHashes[relPath] = sha256(fs.readFileSync(absolutePath, "utf-8"));
  }

  const pinnedVersion = options.pinnedVersion ?? bkitVersion.pinnedVersion;

  // Nothing to persist: no files processed AND the pin is already current.
  if (seedablePaths.size === 0 && pinnedVersion === bkitVersion.pinnedVersion) return;

  const updated: BkitVersion = {
    ...bkitVersion,
    pinnedVersion,
    canonicalHashes: newCanonicalHashes,
  };
  writeBkitVersion(versionFile, updated);
}

// ---------------------------------------------------------------------------
// migrateStrayGitattributes — repair the 2.5.0 no-dot gitattributes regression
// ---------------------------------------------------------------------------

/**
 * 2.5.0 wrote the `.gitattributes` template to a file literally named
 * `gitattributes` (no leading dot) at the repo root. Git only reads
 * `.gitattributes`, so the shipped union-merge rules for the append-only ledgers
 * were inert, and `.bkit/version` recorded a bogus dot-less
 * `gitattributes` canonicalHashes key.
 *
 * This migration:
 *   1. Renames a stray dot-less `gitattributes` file → `.gitattributes` (only
 *      when no real `.gitattributes` already exists — never clobbers one).
 *   2. Drops the bogus dot-less `gitattributes` key from canonicalHashes (the
 *      dotted `.gitattributes` key is reseeded by the upgrade walk that follows).
 *
 * Idempotent: a no-op on repos that never hit the 2.5.0 bug or already migrated.
 */
export function migrateStrayGitattributes(cwd: string, dryRun: boolean): void {
  const stray = path.join(cwd, "gitattributes");
  const dotted = path.join(cwd, ".gitattributes");

  if (fs.existsSync(stray) && fs.statSync(stray).isFile()) {
    if (!fs.existsSync(dotted)) {
      console.log(
        `${LOG_PREFIX}${dryRun ? " [dry-run]" : ""} migrate: rename stray 'gitattributes' → '.gitattributes'`,
      );
      if (!dryRun) fs.renameSync(stray, dotted);
    } else {
      console.warn(
        `${LOG_PREFIX} stray dot-less 'gitattributes' found alongside '.gitattributes' — leaving the stray for manual removal`,
      );
    }
  }

  if (dryRun) return;

  // Drop the bogus dot-less key 2.5.0 recorded; the dotted key is reseeded later.
  const versionFile = path.join(cwd, ".bkit", "version");
  const bkitVersion = readBkitVersion(versionFile);
  if (bkitVersion?.canonicalHashes && "gitattributes" in bkitVersion.canonicalHashes) {
    const canonicalHashes = { ...bkitVersion.canonicalHashes };
    delete canonicalHashes.gitattributes;
    writeBkitVersion(versionFile, { ...bkitVersion, canonicalHashes });
  }
}
