// commands/install/upgrade.ts — `bkit upgrade` orchestrator + diff engine.
//
// Design contract:
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
// Dependency: `canonicalHashes` + `isConsumerModified` from install/version-file.ts.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  readBkitVersion,
  writeBkitVersion,
  sha256,
  isConsumerModified,
  type BkitVersion,
} from "../../install/version-file.js";
import { writeTier2, writeTier2JsonContained, type WriteSet } from "../../install/write.js";
import { detectMarkerStyle } from "../../install/managed-block.js";
import { applyTokens, type TokenMap } from "../../install/placeholders.js";
import type { ManifestEntry } from "../../install/manifest.js";
import { TEMPLATE_COPIES_DIR } from "../../shared/package-roots.js";

/** Zero-value token map — markered-text templates managed on upgrade are token-free. */
const EMPTY_TOKENS: TokenMap = {
  DEFAULT_BRANCH: "",
  PROJECT_NAME: "",
  REPO_SLUG: "",
};

// ---------------------------------------------------------------------------
// planSelfBump — pure decision for `bkit upgrade --to=<v>` / `--latest`
//
// Decides what the atomic self-bump should do WITHOUT any IO: bump the installed
// @cbartens/bkit package, then re-render at the new version. The imperative half
// (pnpm add + re-exec of the freshly-installed binary) lives in commands/install/install.ts
// (runSelfBump); the version logic is split out here so it is unit-testable with
// `resolveLatest` injected. The package bump and the re-render are ONE command.
// ---------------------------------------------------------------------------

/** Accepts X.Y.Z with an optional prerelease tag (e.g. 4.1.5, 4.2.0-rc.1). */
const SELF_BUMP_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

export type SelfBumpPlan =
  | { kind: "invalid"; message: string }
  /** Already at the target → caller falls through to a normal in-place re-render. */
  | { kind: "noop"; target: string }
  /** Install `target`, then re-exec the new binary to re-render + re-pin. */
  | { kind: "bump"; target: string };

/**
 * Resolve the self-bump target and decide the action. `resolveLatest` is only
 * invoked for `--latest` (it shells out to the registry in production); injected
 * so tests stay offline. A leading `v` is tolerated on either source.
 */
export function planSelfBump(
  installed: string,
  flags: { toVersion: string | null; latest: boolean },
  resolveLatest: () => string,
): SelfBumpPlan {
  let target: string;
  if (flags.toVersion !== null) {
    target = flags.toVersion.trim().replace(/^v/, "");
    if (!SELF_BUMP_SEMVER_RE.test(target)) {
      return {
        kind: "invalid",
        message: `--to=<version> must be a semver (e.g. 4.1.5). Got: ${JSON.stringify(flags.toVersion)}`,
      };
    }
  } else {
    target = resolveLatest().trim().replace(/^v/, "");
    if (!SELF_BUMP_SEMVER_RE.test(target)) {
      return {
        kind: "invalid",
        message: `could not resolve a valid latest @cbartens/bkit version from the registry (got ${JSON.stringify(
          target,
        )}). Pin explicitly with --to=<version>.`,
      };
    }
  }
  if (target === installed.trim().replace(/^v/, "")) return { kind: "noop", target };
  return { kind: "bump", target };
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
  /**
   * Subset of `skipped` whose on-disk content is bkit's canonical baseline: block/scope-merge
   * skips, and whole-file skips where disk == template. A whole-file skip over consumer
   * drift is excluded, so the drift record survives.
   */
  skippedSeedable: string[];
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
 *   - `{ action: "skip", reason: "in-sync" }` when disk already equals the template.
 *   - `{ action: "skip", reason: "template-unchanged" }` when the template has NOT changed
 *     since last install but disk differs from it (consumer drift, left alone).
 *   - `{ action: "new" }` when the file doesn't exist on disk (first-time write).
 */
export type DiffAction =
  | { action: "update"; templateContent: string }
  | { action: "conflict"; templateContent: string; diskContent: string }
  | { action: "skip"; reason: "in-sync" | "template-unchanged" }
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
    return { action: "skip", reason: "in-sync" };
  }

  // Template unchanged since last install → skip.
  const canonicalHash = canonicalHashes[relPath];
  if (canonicalHash && canonicalHash === templateHash) {
    return { action: "skip", reason: "template-unchanged" };
  }

  // Template has changed (or canonical hash unknown). Check consumer drift —
  // when canonical hash is missing, isConsumerModified treats the file as drifted
  // to block a silent overwrite of a file bkit has no record of writing.
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
   * Pre-rendered template content that overrides reading `templatePath`. Used for
   * files install writes via a transform the upgrade walk can't reproduce from the raw
   * template — e.g. `opencode.json`, rendered with the consumer's tracker and
   * provider so install and upgrade emit byte-identical output.
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

  const result: UpgradeResult = { updated: [], conflicts: [], skipped: [], skippedSeedable: [] };
  // Local WriteSet drives updated/skipped classification for the block/scope-merge
  // formats; the tier writers push exactly one entry per file they actually change.
  const ws: WriteSet = { writes: [] };

  for (const { relPath, templatePath, format, contentOverride } of candidates) {
    if (contentOverride === undefined && !fs.existsSync(templatePath)) {
      console.error(`${LOG_PREFIX} Template not found: ${templatePath} — skipping ${relPath}`);
      continue;
    }

    const absolutePath = path.join(cwd, relPath);
    // `contentOverride` (e.g. the rendered opencode.json) wins over the raw
    // template so upgrade emits the same bytes install would.
    const templateContent = contentOverride ?? fs.readFileSync(templatePath, "utf-8");

    // Resolve the write strategy the SAME way `bkit install` does:
    //
    //   - manifest `format` is authoritative when present:
    //       markered-text → block-merge (writeTier2, preserves content outside markers)
    //       json          → deep-merge  (writeTier2JsonContained, preserves consumer keys)
    //       byte-equal-text → whole-file/diff — even when the template carries markers
    //                         (install writes these verbatim via writeTier1).
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
        // `contentOverride` (e.g. the rendered opencode.json with `@@OPENCODE_*@@`
        // sentinels resolved) wins over the raw template.
        if (contentOverride !== undefined && options.dryRun) {
          // Dry-run must NOT touch disk — mirror install's opencode.json dry-run path (no
          // `.bkit-staging/` temp file). Compare the consumer dest against the rendered
          // override directly.
          if (
            !fs.existsSync(absolutePath) ||
            fs.readFileSync(absolutePath, "utf-8") !== contentOverride
          ) {
            ws.writes.push({ path: absolutePath, action: "write" });
          }
        } else {
          // writeTier2JsonContained reads from a path, so stage the override to a temp file.
          let jsonSrc = templatePath;
          let jsonTmp: string | null = null;
          if (contentOverride !== undefined) {
            jsonTmp = path.join(cwd, ".bkit-staging", "upgrade-json-rendered.json");
            fs.mkdirSync(path.dirname(jsonTmp), { recursive: true });
            fs.writeFileSync(jsonTmp, contentOverride, "utf-8");
            jsonSrc = jsonTmp;
          }
          try {
            writeTier2JsonContained(jsonSrc, absolutePath, options.dryRun, ws);
          } finally {
            if (jsonTmp) {
              try {
                fs.rmSync(jsonTmp, { force: true });
                const stagingDir = path.dirname(jsonTmp);
                if (fs.existsSync(stagingDir) && fs.readdirSync(stagingDir).length === 0) {
                  fs.rmdirSync(stagingDir);
                }
              } catch {
                // non-fatal staging cleanup
              }
            }
          }
        }
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
        result.skippedSeedable.push(relPath);
      }
      continue;
    }

    // Whole-file formats (byte-equal-text, or unmanaged non-markered templates).
    // Token-substitute FIRST (matching install's writeTier1 tokens) so
    // drift-detect compares like-for-like and a freshly-seeded file gets real values,
    // not a literal `{{DEFAULT_BRANCH}}`. Token-free templates are unchanged.
    const effectiveTemplate = applyTokens(templateContent, tokens);
    const diffAction = diffFile(relPath, absolutePath, effectiveTemplate, canonicalHashes);

    switch (diffAction.action) {
      case "skip":
        result.skipped.push(relPath);
        if (diffAction.reason === "in-sync") result.skippedSeedable.push(relPath);
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
// updateCanonicalHashes — record hashes of written files back to .bkit/version
// ---------------------------------------------------------------------------

/**
 * After a successful upgrade, update `.bkit/version`:
 *   - `canonicalHashes`: refresh from the ON-DISK content of every file bkit wrote
 *     or confirmed (`result.updated` ∪ `result.skippedSeedable`):
 *       - updated → always (disk is what bkit just wrote).
 *       - block/scope-merge skips → always. Disk is NOT the template (it carries
 *         consumer content too), so the file is hashed as it now sits on disk.
 *       - whole-file skips → only when disk == template. A template-unchanged skip
 *         over consumer drift keeps its prior hash, so the next template change is
 *         a conflict, not a silent overwrite.
 *       - conflicts → never, for the same reason.
 *   - `pinnedVersion`: bump to the version just upgraded TO (`options.pinnedVersion`).
 *     Written here exactly as `install`/`check` do, so the next `bkit check` has no
 *     pin write.
 *
 * Call this AFTER `runUpgrade` completes (hashes stay in sync with the files bkit
 * actually wrote).
 */
export function updateCanonicalHashesAfterUpgrade(
  result: UpgradeResult,
  options: {
    dryRun: boolean;
    cwd?: string;
    pinnedVersion?: string;
    /** What enrich recorded this run. `null`/absent = not determined; keep the prior record. */
    claudeAllowDerived?: readonly string[] | null;
  },
): void {
  if (options.dryRun) return;

  const cwd = options.cwd ?? process.cwd();
  const versionFile = path.join(cwd, ".bkit", "version");
  const bkitVersion = readBkitVersion(versionFile);
  if (!bkitVersion) return;

  const seedablePaths = new Set([...result.updated, ...result.skippedSeedable]);

  const newCanonicalHashes = { ...bkitVersion.canonicalHashes };
  for (const relPath of seedablePaths) {
    // Exclude .agents/ internal files (docs.md, friction.md, rules.md, skills.md,
    // .env.example etc.) from canonicalHashes — they are not consumer-facing files
    // whose hashes bkit uses for drift detection. Mirrors the same filter applied
    // in the install path (install/modules/index.ts postDispatch). Template copies carry no
    // hash there either.
    if (relPath.startsWith(".agents" + path.sep)) continue;
    if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
    const absolutePath = path.join(cwd, relPath);
    if (!fs.existsSync(absolutePath)) continue;
    newCanonicalHashes[relPath] = sha256(fs.readFileSync(absolutePath, "utf-8"));
  }

  const pinnedVersion = options.pinnedVersion ?? bkitVersion.pinnedVersion;

  const webFetchUnchanged =
    options.claudeAllowDerived == null ||
    JSON.stringify([...options.claudeAllowDerived]) ===
      JSON.stringify(bkitVersion.claudeAllowDerived);

  // Nothing to persist: no files processed AND the pin is current AND the record is unchanged.
  if (
    seedablePaths.size === 0 &&
    pinnedVersion === bkitVersion.pinnedVersion &&
    webFetchUnchanged
  ) {
    return;
  }

  const updated: BkitVersion = {
    ...bkitVersion,
    pinnedVersion,
    canonicalHashes: newCanonicalHashes,
    ...(options.claudeAllowDerived == null
      ? {}
      : { claudeAllowDerived: [...options.claudeAllowDerived] }),
  };
  writeBkitVersion(versionFile, updated);
}
