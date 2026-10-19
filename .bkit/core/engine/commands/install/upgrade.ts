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
  mergeCanonicalHashes,
  type BkitVersion,
} from "../../install/version-file.js";
import { writeTier2, writeTier2JsonContained, type WriteSet } from "../../install/write.js";
import { detectMarkerStyle } from "../../install/managed-block.js";
import { applyTokens, type TokenMap, resolveTokens } from "../../install/placeholders.js";
import type { ManifestEntry } from "../../install/manifest.js";
import { readTemplate } from "../../render/parts.js";
import {
  TEMPLATE_COPIES_DIR,
  getCoreRoot,
  getSharedRoot,
  getBkitDocsRoot,
  getPkgRoot,
} from "../../shared/package-roots.js";
import type { UpgradeFlags } from "../../cli.js";
import {
  getInstallingVersion,
  requireOpencodeProvider,
  detectOpencodeProviders,
  runUpgradeAdvisories,
} from "./install.js";
import { setLogPrefix } from "../../shared/log-prefix.js";
import { BKIT_PACKAGE, lookupLatestPublished } from "../../shared/bkit-latest.js";
import {
  getInstallManifest,
  getModuleManifest,
  type ModuleName,
  type IssueTracker,
  DEFAULT_ISSUE_TRACKER,
  parseIssueTracker,
} from "../../install/manifest.js";
import { OPTIN_MODULES } from "../../install/manifest.js";
import { detectInstalledHostModules } from "../../install/hosts.js";
import { detectInstalledModules } from "./check.js";
import { remapTemplateDest } from "../../install/template-copies.js";
import {
  CLAUDE_CLOUD_RELPATH,
  CURSOR_CLOUD_RELPATH,
  writeClaudeCloudDoc,
  writeCursorCloudDoc,
  writeNetworkAllowlistArtifact,
  writeCursorCliPermissionsArtifact,
} from "../../install/cloud-env.js";
import { syncTemplateCopies, formatTemplateChanges } from "../../install/template-copies.js";
import { formatPayloadLinkChanges, syncPayloadLinks } from "../../install/payload-links.js";
import { renderOpencodeJson, reconcileOpencodeJson } from "../../install/modules/opencode.js";
import { type ModuleContext, renderManagedOutputs } from "../../install/modules/index.js";
import { reconcileMcpJson, enrichClaudeSettingsAllows } from "../../install/modules/claude.js";
import {
  type EffortMap,
  parseModelLookup,
  applyModelOverrides,
  buildOpencodeModelLookup,
  buildAntigravityModelLookup,
  parseEffortMap,
} from "../../render/models.js";

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
    const templateContent = contentOverride ?? readTemplate(templatePath);

    // Resolve the write strategy the SAME way `bkit install` does:
    //
    //   - manifest `format` is authoritative when present:
    //       markered-text → block-merge (writeTier2, preserves content outside markers)
    //       json          → deep-merge  (writeTier2JsonContained, preserves consumer keys)
    //       byte-equal-text → whole-file/diff — even when the template carries markers
    //                         (install writes these verbatim via writeTier1).
    //   - NO manifest entry: the install core payload pass block-merges markered
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
 *   - entries whose path is no longer on disk are pruned (a retired or renamed
 *     managed file leaves one behind), in both directions of the merge.
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

  const fresh: Record<string, string> = {};
  for (const relPath of seedablePaths) {
    // Exclude .agents/ internal files (docs.md, friction.md, rules.md, shortcuts.md,
    // skills.md, .env.example etc.) from canonicalHashes — they are not consumer-facing files
    // whose hashes bkit uses for drift detection. Mirrors the same filter applied
    // in the install path (install/modules/index.ts postDispatch). Template copies carry no
    // hash there either.
    if (relPath.startsWith(".agents" + path.sep)) continue;
    if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
    const absolutePath = path.join(cwd, relPath);
    if (!fs.existsSync(absolutePath)) continue;
    fresh[relPath] = sha256(fs.readFileSync(absolutePath, "utf-8"));
  }

  // Fresh hashes overwrite; entries for paths gone from disk are pruned (a retired
  // or renamed managed file leaves one behind — mergeCanonicalHashes).
  const { canonicalHashes: newCanonicalHashes, pruned } = mergeCanonicalHashes(
    cwd,
    bkitVersion.canonicalHashes,
    fresh,
  );

  const pinnedVersion = options.pinnedVersion ?? bkitVersion.pinnedVersion;

  const webFetchUnchanged =
    options.claudeAllowDerived == null ||
    JSON.stringify([...options.claudeAllowDerived]) ===
      JSON.stringify(bkitVersion.claudeAllowDerived);

  // Nothing to persist: no files processed AND nothing pruned AND the pin is
  // current AND the record is unchanged.
  if (
    seedablePaths.size === 0 &&
    pruned === 0 &&
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

/**
 * Resolve the newest published @cbartens/bkit version from the registry for
 * `bkit upgrade --latest`. Shells out to `pnpm view` (honours the consumer's
 * registry auth). Hard-exits with guidance on failure — the caller has nothing
 * to fall back to.
 */
function resolveLatestPublishedVersion(cwd: string): string {
  const latest = lookupLatestPublished(cwd, null);
  if (latest === null) {
    console.error(
      `${LOG_PREFIX} could not resolve the latest ${BKIT_PACKAGE} version from the registry ` +
        `(pnpm view failed). Check your network / registry access, ` +
        `or pin a version with --to=<version>.`,
    );
    process.exit(1);
  }
  return latest;
}

/**
 * Atomic self-bump for `bkit upgrade --to=<v>` / `--latest`: install the target
 * @cbartens/bkit, then RE-EXEC the freshly-installed binary so the NEW code does
 * the render + re-pin (this process is still the OLD code). The package bump and
 * the re-render are one command.
 *
 * Returns true when it handled the run (bumped + re-exec'd, or dry-run reported a
 * bump) → the caller should return. Returns false when already at target → the
 * caller falls through to a normal in-place re-render.
 */
export async function runSelfBump(flags: UpgradeFlags, cwd: string): Promise<boolean> {
  const installed = getInstallingVersion();
  // Resolve the latest first (only when asked), then feed planSelfBump a constant.
  const latestVersion = flags.latest ? resolveLatestPublishedVersion(cwd) : "";
  const resolvedPlan = planSelfBump(
    installed,
    { toVersion: flags.toVersion, latest: flags.latest },
    () => latestVersion,
  );

  if (resolvedPlan.kind === "invalid") {
    console.error(`${LOG_PREFIX} ${resolvedPlan.message}`);
    process.exit(1);
  }
  if (resolvedPlan.kind === "noop") {
    console.log(
      `${LOG_PREFIX} already at @cbartens/bkit@${resolvedPlan.target} — re-rendering in place at the installed version.`,
    );
    return false; // fall through to the normal upgrade path
  }

  // resolvedPlan.kind === "bump"
  //
  // In a pnpm workspace ROOT, `pnpm add` refuses without -w/--workspace-root
  // (ERR_PNPM_ADDING_TO_ROOT) when bkit is a root devDependency — the standard
  // layout for a workspace consumer. Detect the workspace (pnpm-workspace.yaml at
  // cwd) and pass -w so the documented upgrade path works there. A single-package
  // repo has no pnpm-workspace.yaml and must NOT get -w (pnpm errors that -w may
  // only be used inside a workspace).
  const inWorkspaceRoot = fs.existsSync(path.join(cwd, "pnpm-workspace.yaml"));
  const addArgs = [
    "add",
    "-D",
    ...(inWorkspaceRoot ? ["-w"] : []),
    `@cbartens/bkit@${resolvedPlan.target}`,
  ];
  const addCmd = `pnpm ${addArgs.join(" ")}`;
  if (flags.dryRun) {
    console.log(
      `${LOG_PREFIX} [dry-run] would bump @cbartens/bkit ${installed} -> ${resolvedPlan.target} ` +
        `(${addCmd}), then re-render + re-pin via the ` +
        `freshly-installed binary. No changes made.`,
    );
    return true;
  }

  const { spawnSync } = await import("node:child_process");
  console.log(`${LOG_PREFIX} bumping @cbartens/bkit ${installed} -> ${resolvedPlan.target} ...`);
  const add = spawnSync("pnpm", addArgs, {
    cwd,
    stdio: "inherit",
  });
  if (add.status !== 0) {
    console.error(
      `${LOG_PREFIX} \`${addCmd}\` failed (exit ${add.status ?? "null"}). ` +
        `Check your network / registry access. Nothing re-rendered.`,
    );
    process.exit(1);
  }

  // Re-exec the just-installed (NEW) bkit so IT renders + re-pins, not this old process.
  console.log(`${LOG_PREFIX} re-rendering with @cbartens/bkit@${resolvedPlan.target} ...`);
  const reArgs = ["exec", "bkit", "upgrade"];
  if (flags.nonInteractive) reArgs.push("--auto-apply");
  const re = spawnSync("pnpm", reArgs, { cwd, stdio: "inherit" });
  process.exit(re.status ?? 1);
}

export async function runUpgradeCommand(upgradeFlags: UpgradeFlags): Promise<void> {
  setLogPrefix("[bkit-upgrade]");

  // --to=<version> / --latest: atomic self-bump. Install the target package,
  // then re-exec the freshly-installed binary to render + re-pin (this process
  // is the OLD code). When a bump happens (or a dry-run reports one) runSelfBump
  // handles the whole run; when already at target it returns false and we fall
  // through to a normal in-place re-render.
  if (upgradeFlags.toVersion !== null || upgradeFlags.latest) {
    const handled = await runSelfBump(upgradeFlags, process.cwd());
    if (handled) return;
  }

  console.log(
    `${LOG_PREFIX} Running upgrade${upgradeFlags.dryRun ? " (dry-run)" : ""}${upgradeFlags.nonInteractive ? " (non-interactive)" : ""}`,
  );

  // Collect bkit-managed payload candidates from the package: `shared/` and
  // `core/` hold every file install writes. `templates/` is excluded — it is
  // copy-and-own, and syncTemplateCopies refreshes the consumer's copies instead.
  const sharedRoot = getSharedRoot();

  // Package-only core subtrees: engine/ (TypeScript source), workflows/ and
  // prompts/ (rendered mirrors), .bkit/ (canonical docs, handled by
  // renderManagedOutputs) and hooks/ (spliced into hooks at render time).
  const CORE_SKIP_TOP_DIRS: ReadonlySet<string> = new Set([
    "engine",
    "workflows",
    "prompts",
    ".bkit",
    "hooks",
  ]);

  // Manifest entry drives the per-file write strategy in runUpgrade:
  //   markered-text → block-merge, json → deep-merge (both preserve consumer
  //   content outside the managed region), byte-equal-text / unmanaged →
  //   whole-file write with drift detection.
  const entryByPath = new Map<string, ManifestEntry>();
  for (const entry of getInstallManifest()) {
    entryByPath.set(entry.path, entry);
  }

  // Opt-in module files (cloud, opencode, codex) must NEVER be force-created by
  // upgrade — they ship only via an explicit install flag. Update them when the
  // consumer has opted in (dest present).
  const optInPaths = new Set<string>();
  for (const mod of OPTIN_MODULES) {
    for (const entry of getModuleManifest(mod as ModuleName)) optInPaths.add(entry.path);
  }

  // Host modules (claude, cursor, codex, opencode) are never force-created by upgrade: they
  // are gated on sentinel-detected installation, exactly like `bkit check` scopes its
  // drift gate. core + unmanaged files (docs/*.md, no manifest entry) always upgrade; the
  // opt-in modules keep their dest-presence gating just below.
  const installedModules = detectInstalledModules(process.cwd());

  // Resolve the consumer's tracker so upgrade renders tracker-conditional files
  // (opencode.json, the mcp.json files) the same way install does.
  let upgradeTracker: IssueTracker = DEFAULT_ISSUE_TRACKER;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")) as {
      bkit?: { issueTracker?: unknown };
    };
    const stored = parseIssueTracker(pkg.bkit?.issueTracker);
    if (stored !== null) upgradeTracker = stored;
  } catch {
    // package.json absent/unparseable — default tracker
  }

  // opencode.json is provider/tracker-templated on install (renderOpencodeJson resolves the
  // `@@OPENCODE_*@@` sentinels). Upgrade renders it the same way, with the installed
  // provider, so no raw sentinel key reaches the consumer's config.
  const OPENCODE_JSON_RELPATH = path.join(".opencode", "opencode.json");
  // Demanded only when the consumer actually has an opencode.json to re-render — a repo
  // without the host must not be failed for a provider it was never asked to choose.
  const upgradeOpencodeProvider = fs.existsSync(path.join(process.cwd(), OPENCODE_JSON_RELPATH))
    ? requireOpencodeProvider(process.cwd(), "upgrade")
    : null;

  // .mcp.json / .cursor/mcp.json: bkit owns only its tracker entry, which the walk's json
  // deep-merge cannot express. reconcileMcpJson handles them after runUpgrade, like install.
  const MCP_ROOT_RELPATH = ".mcp.json";
  const CURSOR_MCP_RELPATH = path.join(".cursor", "mcp.json");

  const candidates: UpgradeCandidate[] = [];
  const collectPayload = (dir: string, rel: string, skipTopDirs: ReadonlySet<string>): void => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (rel === "" && ent.isDirectory() && skipTopDirs.has(ent.name)) continue;
      const entRel = rel ? path.join(rel, ent.name) : ent.name;
      const entAbs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        collectPayload(entAbs, entRel, skipTopDirs);
      } else if (ent.isFile()) {
        // Single shared dotfile remap (gitignore → .gitignore, npmignore → .npmignore).
        const relPath = remapTemplateDest(entRel);
        // `.claude/bkit-cloud.md` + `.cursor/bkit-cloud.md` are GENERATED output files
        // (writeClaudeCloudDoc / writeCursorCloudDoc), not payload files to reconcile:
        // install/upgrade regenerate them with resolved secret values, so the raw
        // source is never a byte-match and the walk must never drift-flag or
        // overwrite them. Regenerated explicitly in the runUpgrade block below
        // (host-gated, non-dry-run).
        if (relPath === CLAUDE_CLOUD_RELPATH || relPath === CURSOR_CLOUD_RELPATH) continue;
        if (relPath === MCP_ROOT_RELPATH || relPath === CURSOR_MCP_RELPATH) continue;
        const entry = entryByPath.get(relPath);
        const ownerModule = entry?.module;
        // Skip opt-in-module files the consumer hasn't opted into: dest absent and the owning
        // module not detected as installed. A detected opt-in host (opencode / codex /
        // antigravity) gets the files a newer release adds; `cloud` has no install sentinel,
        // so its files upgrade only when present. opencode.json is created only when its
        // provider resolves — never written with raw `@@OPENCODE_*@@` sentinels.
        if (optInPaths.has(relPath) && !fs.existsSync(path.join(process.cwd(), relPath))) {
          const hostInstalled = ownerModule !== undefined && installedModules.has(ownerModule);
          if (!hostInstalled || (relPath === OPENCODE_JSON_RELPATH && !upgradeOpencodeProvider)) {
            continue;
          }
        }
        // Skip host-module files when that module is not installed — upgrade updates
        // only what the consumer opted into, never force-creating a new module. opt-ins are
        // handled by the check above; core + entry-less files always pass.
        if (
          ownerModule &&
          ownerModule !== "core" &&
          !optInPaths.has(relPath) &&
          !installedModules.has(ownerModule)
        ) {
          continue;
        }
        const contentOverride =
          relPath === OPENCODE_JSON_RELPATH && upgradeOpencodeProvider
            ? renderOpencodeJson(entAbs, upgradeTracker, upgradeOpencodeProvider, process.cwd())
            : undefined;
        candidates.push({
          relPath,
          templatePath: entAbs,
          format: entry?.format,
          contentOverride,
        });
      }
    }
  };
  if (fs.existsSync(sharedRoot)) collectPayload(sharedRoot, "", new Set<string>());
  const coreRoot = getCoreRoot();
  if (fs.existsSync(coreRoot)) collectPayload(coreRoot, "", CORE_SKIP_TOP_DIRS);

  // Markered-text templates managed on upgrade are token-free, but resolve real
  // tokens when possible so any future token-bearing block stays correct.
  const tokens = await resolveTokens(process.cwd()).catch(() => undefined);

  const result = runUpgrade(candidates, {
    nonInteractive: upgradeFlags.nonInteractive,
    dryRun: upgradeFlags.dryRun,
    cwd: process.cwd(),
    tokens,
  });

  // Refresh the consumer's `.bkit/templates/` copies and name what changed. The
  // list is computed before overwriting, so it is exactly the package's template
  // diff. The copies carry no hash, so nothing here feeds `.bkit/version`.
  const templateChanges = syncTemplateCopies(process.cwd(), {
    dryRun: upgradeFlags.dryRun,
    ws: { writes: [] },
  });
  const templateReport = formatTemplateChanges(templateChanges);
  if (templateReport) console.log(`${LOG_PREFIX} ${templateReport}`);

  // Payload view links — the same sync install runs (`.bkit/core` + `.bkit/shared`
  // point into the installed package). Never clobbers a real directory; a platform
  // refusal is reported, never fatal. Links carry no hash.
  const linkChanges = syncPayloadLinks(process.cwd(), { dryRun: upgradeFlags.dryRun });
  const linkReport = formatPayloadLinkChanges(linkChanges);
  if (linkReport) console.log(`${LOG_PREFIX} ${linkReport}`);

  // Re-render all installed provider blocks for upgrade.
  // The candidates walk above handles the ACTIVE provider's block via renderOpencodeJson.
  // For each ADDITIONAL installed provider, reconcile their template block into opencode.json
  // so template changes (new keys, updated placeholders) propagate to all providers' blocks.
  const OPENCODE_JSON_DST = path.join(".opencode", "opencode.json");
  if (fs.existsSync(path.join(process.cwd(), OPENCODE_JSON_DST))) {
    const allProviders = detectOpencodeProviders(process.cwd());
    const otherProviders = allProviders.filter((p) => p !== upgradeOpencodeProvider);
    if (otherProviders.length > 0) {
      const jsonSrc = path.join(sharedRoot, ".opencode", "opencode.json");
      if (fs.existsSync(jsonSrc)) {
        const upgradeWs: WriteSet = { writes: [] };
        for (const provider of otherProviders) {
          const rendered = renderOpencodeJson(jsonSrc, upgradeTracker, provider, process.cwd());
          reconcileOpencodeJson(rendered, OPENCODE_JSON_DST, upgradeFlags.dryRun, upgradeWs);
        }
        for (const w of upgradeWs.writes) {
          console.log(
            `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: additional provider ${w.path}`,
          );
        }
      }
    }
  }

  // The payload walk above only covers the written payload files. Re-render the
  // bkit-managed OUTPUT files install also produces but that are NOT payload — host
  // agents/commands (source-rendered from core/prompts + core/workflows), the
  // `.bkit/*.md` canonical docs (runBkitDocs) and core's package.json scripts (the
  // bkit:gate:* names, add-if-missing). These are
  // bkit-owned, force-overwritten output. Only the hosts the consumer installed are
  // re-rendered (detected by their agents dir). `.bkit/prompts.md` is markered → runBkitDocs
  // block-merges it: managed block refreshed, consumer `## Model Overrides` below bkit:end
  // preserved. Docs stay single-source PACKAGE-side, never in the payload walk.
  const renderModules = detectInstalledHostModules(process.cwd());
  // Demanded only when opencode is one of the detected hosts — see requireOpencodeProvider.
  const renderProvider = renderModules.has("opencode")
    ? requireOpencodeProvider(process.cwd(), "upgrade render")
    : null;
  // Build the model lookups the SAME way the install dispatch does: DEFAULTS from the
  // package's .bkit/prompts.md § Models, consumer overrides from the consumer's installed
  // .bkit/prompts.md `## Model Overrides` (per-agent, per-provider, preserved across upgrades).
  let renderModelLookup: Map<string, string> = new Map();
  let renderOpencodeModelLookup: Map<string, string> = new Map();
  let renderCodexModelLookup: Map<string, string> = new Map();
  let renderAntigravityModelLookup: Map<string, string> = new Map();
  let renderEffortMap: EffortMap = new Map();
  const pkgPromptsMd = path.join(getBkitDocsRoot(), "prompts.md");
  const consumerPromptsMd = path.join(process.cwd(), ".bkit", "prompts.md");
  if (fs.existsSync(pkgPromptsMd)) {
    try {
      renderModelLookup = parseModelLookup(pkgPromptsMd);
    } catch {
      // Not fatal — the cursor render fails per-file if a model is missing
    }
    applyModelOverrides(renderModelLookup, "cursor", consumerPromptsMd);
    // Non-null exactly when opencode is a detected host (see renderProvider above).
    if (renderProvider) {
      try {
        renderOpencodeModelLookup = buildOpencodeModelLookup(pkgPromptsMd, renderProvider);
      } catch {
        // Not fatal — the opencode render fails per-file if a model is missing
      }
      applyModelOverrides(renderOpencodeModelLookup, renderProvider, consumerPromptsMd);
    }
    if (renderModules.has("codex")) {
      try {
        renderCodexModelLookup = buildOpencodeModelLookup(pkgPromptsMd, "openai");
      } catch {
        // Not fatal — the codex module fails per-file if a model is missing
      }
      applyModelOverrides(renderCodexModelLookup, "openai", consumerPromptsMd);
    }
    if (renderModules.has("antigravity")) {
      try {
        renderAntigravityModelLookup = buildAntigravityModelLookup(pkgPromptsMd);
      } catch {
        // Not fatal — the antigravity module fails per-file if a model is missing
      }
      applyModelOverrides(renderAntigravityModelLookup, "google", consumerPromptsMd);
    }
    renderEffortMap = parseEffortMap(pkgPromptsMd);
  }
  const renderWs: WriteSet = { writes: [] };
  const renderCtx: ModuleContext = {
    dryRun: upgradeFlags.dryRun,
    tokens: tokens ?? { DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" },
    modelLookup: renderModelLookup,
    opencodeModelLookup: renderOpencodeModelLookup,
    codexModelLookup: renderCodexModelLookup,
    antigravityModelLookup: renderAntigravityModelLookup,
    effortMap: renderEffortMap,
    opencodeProvider: renderProvider,
    advisories: [],
    ws: renderWs,
    logPrefix: LOG_PREFIX,
    postDispatch: [],
    issueTracker: upgradeTracker,
    cloudVariant: null,
    // Re-stamp every rendered agent + command at the version we are upgrading TO,
    // so a clean upgrade refreshes the managed-version marker and `bkit check` stays green.
    version: getInstallingVersion(),
    // The detected host set — read by the Antigravity module for the Codex-overlap advisory.
    installedModules: renderModules,
  };
  const rendered = renderManagedOutputs(renderModules, renderCtx);

  // MCP config: bkit's tracker entry only (reconcileMcpJson), for the hosts the consumer
  // installed — the same pass install's claude/cursor modules run. Never force-creates the
  // file for a host the consumer does not have.
  const mcpWs: WriteSet = { writes: [] };
  for (const [host, relPath] of [
    ["claude", MCP_ROOT_RELPATH],
    ["cursor", CURSOR_MCP_RELPATH],
  ] as const) {
    if (!renderModules.has(host)) continue;
    const src = path.join(sharedRoot, relPath);
    if (!fs.existsSync(src)) continue;
    reconcileMcpJson(
      src,
      path.join(process.cwd(), relPath),
      upgradeTracker,
      upgradeFlags.dryRun,
      mcpWs,
    );
  }
  for (const w of mcpWs.writes) {
    console.log(
      `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${path.relative(process.cwd(), w.path)} (tracker MCP entry)`,
    );
  }

  // Regenerate `.claude/bkit-cloud.md` (excluded from the payload walk above — it is a
  // generated, untracked, secret-bearing OUTPUT file). Claude-host-gated so upgrade
  // never force-creates it for a non-claude repo; non-dry-run so `bkit check` never
  // writes resolved secrets. Rotated secrets / version bumps reach the paste doc via
  // the same helper install uses (runClaudeModule). Untracked → not in canonicalHashes.
  // What enrich recorded this upgrade, threaded into the one .bkit/version writer.
  // null = not determined (dry run / no settings file) -> keep the prior record.
  let upgradeClaudeAllowDerived: readonly string[] | null = null;
  if (!upgradeFlags.dryRun && renderModules.has("claude") && tokens) {
    if (writeClaudeCloudDoc(process.cwd(), tokens)) {
      console.log(
        `${LOG_PREFIX} upgrade: .claude/bkit-cloud.md (regenerated — gitignored, holds resolved secrets)`,
      );
    }
  }

  // Same for `.cursor/bkit-cloud.md` — cursor-host-gated twin (see writeCursorCloudDoc).
  // Uses upgradeTracker so the Linear/GitHub env-var policy matches the installed
  // tracker; excluded from the payload walk above for the same reason as the Claude doc.
  if (!upgradeFlags.dryRun && renderModules.has("cursor") && tokens) {
    if (writeCursorCloudDoc(process.cwd(), tokens, upgradeTracker)) {
      console.log(
        `${LOG_PREFIX} upgrade: .cursor/bkit-cloud.md (regenerated — gitignored, holds resolved secrets)`,
      );
    }
  }

  // Network allowlist + MCP allows — OpenCode from renderOpencodeJson; Claude enrich
  // below; Cursor `.cursor/allowlist.json` + `.cursor/cli.json` only when cursor
  // module installed. Written artifacts get their canonicalHashes refreshed below.
  const artifactWrites: string[] = [];
  {
    const cwd = process.cwd();
    if (renderModules.has("cursor")) {
      for (const art of [
        writeNetworkAllowlistArtifact(cwd, upgradeFlags.dryRun),
        writeCursorCliPermissionsArtifact(cwd, upgradeFlags.dryRun),
      ]) {
        if (art.wrote) {
          artifactWrites.push(art.path);
          console.log(
            `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${art.path}`,
          );
        }
      }
    }
    if (renderModules.has("claude") && fs.existsSync(path.join(cwd, ".claude", "settings.json"))) {
      const enrichWs: WriteSet = { writes: [] };
      upgradeClaudeAllowDerived = enrichClaudeSettingsAllows(
        ".claude/settings.json",
        cwd,
        upgradeFlags.dryRun,
        enrichWs,
      );
      for (const w of enrichWs.writes) {
        console.log(
          `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${w.path} (WebFetch + MCP derived allows)`,
        );
      }
    }
  }

  // Refresh canonicalHashes (from resulting on-disk content) AND bump pinnedVersion
  // to the version we just upgraded TO, so the next `bkit check` has nothing to write.
  // Called unconditionally (non-dry-run) so the pin bumps even when every file was a
  // no-op skip. The re-rendered `.bkit/*.md` docs AND
  // host agent/command mirrors land in renderWs.writes (mirrors count toward check
  // exit), so feed those writes into canonicalHashes — keeping install/upgrade `.bkit/version`
  // parity.
  if (!upgradeFlags.dryRun) {
    const pkgVersion = JSON.parse(fs.readFileSync(path.join(getPkgRoot(), "package.json"), "utf-8"))
      .version as string;
    const renderedDocPaths = renderWs.writes.map((w) =>
      path.relative(
        process.cwd(),
        path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path),
      ),
    );
    updateCanonicalHashesAfterUpgrade(
      {
        updated: [
          ...result.updated,
          ...renderedDocPaths,
          ...mcpWs.writes.map((w) => path.relative(process.cwd(), w.path)),
          ...artifactWrites,
        ],
        skipped: result.skipped,
        skippedSeedable: result.skippedSeedable,
        conflicts: result.conflicts,
      },
      {
        dryRun: false,
        cwd: process.cwd(),
        pinnedVersion: pkgVersion,
        claudeAllowDerived: upgradeClaudeAllowDerived,
      },
    );
  }

  console.log(
    `${LOG_PREFIX} Done. updated: ${result.updated.length}, skipped: ${result.skipped.length}, conflicts: ${result.conflicts.length}, re-rendered: ${rendered.length}`,
  );

  // `.bkit/advisories.md` describes the upgraded repo, not the last install or check.
  if (!upgradeFlags.dryRun) await runUpgradeAdvisories();

  // Non-interactive mode: exit non-zero on conflicts
  if (upgradeFlags.nonInteractive && result.conflicts.length > 0) {
    process.exit(1);
  }
}
