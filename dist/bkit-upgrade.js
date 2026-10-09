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
import { readBkitVersion, writeBkitVersion, sha256, isConsumerModified, } from "./bkit-version.js";
import { writeTier2, writeTier2JsonContained } from "./bkit-tiers.js";
import { detectMarkerStyle } from "./bkit-markers.js";
import { applyTokens } from "./bkit-tokens.js";
import { isRetiredHashKey, withoutRetiredHashes } from "./bkit-retire.js";
import { TEMPLATE_COPIES_DIR } from "./bkit-paths.js";
/** Zero-value token map — markered-text templates managed on upgrade are token-free. */
const EMPTY_TOKENS = {
    NODE_VERSION: "",
    DEFAULT_BRANCH: "",
    PROJECT_NAME: "",
    REPO_SLUG: "",
};
// ---------------------------------------------------------------------------
// planSelfBump — pure decision for `bkit upgrade --to=<v>` / `--latest`
//
// Decides what the atomic self-bump should do WITHOUT any IO: bump the installed
// @cbartens/bkit package, then re-render at the new version. The imperative half
// (pnpm add + re-exec of the freshly-installed binary) lives in bkit-install.ts
// (runSelfBump); the version logic is split out here so it is unit-testable with
// `resolveLatest` injected. Keeping the package bump and the re-render in ONE
// command is the whole point — a bare `pnpm add @cbartens/bkit` that forgets the
// re-render is exactly what leaves a base branch's rendered mirrors stale (#256),
// which every branch cut from it then inherits.
// ---------------------------------------------------------------------------
/** Accepts X.Y.Z with an optional prerelease tag (e.g. 4.1.5, 4.2.0-rc.1). */
const SELF_BUMP_SEMVER_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
/**
 * Resolve the self-bump target and decide the action. `resolveLatest` is only
 * invoked for `--latest` (it shells out to the registry in production); injected
 * so tests stay offline. A leading `v` is tolerated on either source.
 */
export function planSelfBump(installed, flags, resolveLatest) {
    let target;
    if (flags.toVersion !== null) {
        target = flags.toVersion.trim().replace(/^v/, "");
        if (!SELF_BUMP_SEMVER_RE.test(target)) {
            return {
                kind: "invalid",
                message: `--to=<version> must be a semver (e.g. 4.1.5). Got: ${JSON.stringify(flags.toVersion)}`,
            };
        }
    }
    else {
        target = resolveLatest().trim().replace(/^v/, "");
        if (!SELF_BUMP_SEMVER_RE.test(target)) {
            return {
                kind: "invalid",
                message: `could not resolve a valid latest @cbartens/bkit version from the registry (got ${JSON.stringify(target)}). Pin explicitly with --to=<version>.`,
            };
        }
    }
    if (target === installed.trim().replace(/^v/, ""))
        return { kind: "noop", target };
    return { kind: "bump", target };
}
export const LOG_PREFIX = "[bkit-upgrade]";
export function diffFile(relPath, absolutePath, templateContent, canonicalHashes) {
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
    // to block silent overwrites of pre-v0.9.x installs that never recorded hashes.
    if (isConsumerModified(relPath, absolutePath, canonicalHashes)) {
        return { action: "conflict", templateContent, diskContent };
    }
    return { action: "update", templateContent };
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
export function runUpgrade(candidates, options) {
    const cwd = options.cwd ?? process.cwd();
    const versionFile = path.join(cwd, ".bkit", "version");
    const bkitVersion = readBkitVersion(versionFile);
    const canonicalHashes = bkitVersion?.canonicalHashes ?? {};
    const tokens = options.tokens ?? EMPTY_TOKENS;
    const result = { updated: [], conflicts: [], skipped: [], skippedSeedable: [] };
    // Local WriteSet drives updated/skipped classification for the block/scope-merge
    // formats; the tier writers push exactly one entry per file they actually change.
    const ws = { writes: [] };
    for (const { relPath, templatePath, format, contentOverride, noMarkerMigration } of candidates) {
        if (contentOverride === undefined && !fs.existsSync(templatePath)) {
            console.error(`${LOG_PREFIX} Template not found: ${templatePath} — skipping ${relPath}`);
            continue;
        }
        const absolutePath = path.join(cwd, relPath);
        // `contentOverride` (e.g. the rendered opencode.json, #245) wins over the raw
        // template so upgrade emits the same bytes install would.
        const templateContent = contentOverride ?? fs.readFileSync(templatePath, "utf-8");
        // Resolve the write strategy the SAME way `bkit install` would — so install and
        // upgrade can never disagree on a file and fight each other across runs:
        //
        //   - manifest `format` is authoritative when present:
        //       markered-text → block-merge (writeTier2, preserves content outside markers)
        //       json          → deep-merge  (writeTier2JsonContained, preserves consumer keys)
        //       byte-equal-text → whole-file/diff — even when the template carries markers
        //                         (install writes these verbatim via writeTier1; block-merging
        //                         one would reformat the block and churn forever against
        //                         install).
        //   - NO manifest entry: the install core-templates pass block-merges markered
        //       MARKDOWN it manages as a directory (`docs/*.md`, `.agents/*.md`) where the
        //       consumer's prose lives after `bkit:end`; everything else (e.g. canonical
        //       `.vale/styles/**.yml`) is whole-file. So: markered `.md` → block-merge.
        //
        // Block/scope-merge are ALWAYS safe (never a whole-file overwrite), so they have no
        // conflict path; whole-file keeps the drift-detect/conflict guard.
        const isMarkdown = relPath.endsWith(".md");
        const markerStyle = detectMarkerStyle(templateContent);
        const blockMerge = format === "markered-text" || (format === undefined && isMarkdown && markerStyle !== null);
        if (blockMerge || format === "json") {
            const before = ws.writes.length;
            if (format === "json") {
                // `contentOverride` (e.g. the rendered opencode.json with `@@OPENCODE_*@@`
                // sentinels resolved, #245) must win over the raw template — otherwise the
                // deep-merge injects the raw sentinel keys into the consumer's config.
                if (contentOverride !== undefined && options.dryRun) {
                    // Dry-run must NOT touch disk — mirror install's opencode.json dry-run path (no
                    // `.bkit-staging/` temp file). Compare the consumer dest against the rendered
                    // override directly. (#255 P2-11)
                    if (!fs.existsSync(absolutePath) ||
                        fs.readFileSync(absolutePath, "utf-8") !== contentOverride) {
                        ws.writes.push({ path: absolutePath, action: "write" });
                    }
                }
                else {
                    // writeTier2JsonContained reads from a path, so stage the override to a temp file.
                    let jsonSrc = templatePath;
                    let jsonTmp = null;
                    if (contentOverride !== undefined) {
                        jsonTmp = path.join(cwd, ".bkit-staging", "upgrade-json-rendered.json");
                        fs.mkdirSync(path.dirname(jsonTmp), { recursive: true });
                        fs.writeFileSync(jsonTmp, contentOverride, "utf-8");
                        jsonSrc = jsonTmp;
                    }
                    try {
                        writeTier2JsonContained(jsonSrc, absolutePath, options.dryRun, ws);
                    }
                    finally {
                        if (jsonTmp) {
                            try {
                                fs.rmSync(jsonTmp, { force: true });
                                const stagingDir = path.dirname(jsonTmp);
                                if (fs.existsSync(stagingDir) && fs.readdirSync(stagingDir).length === 0) {
                                    fs.rmdirSync(stagingDir);
                                }
                            }
                            catch {
                                // non-fatal staging cleanup
                            }
                        }
                    }
                }
            }
            else {
                writeTier2(templatePath, absolutePath, tokens, markerStyle ?? "html-comment", options.dryRun, ws, noMarkerMigration
                    ? { relPath, canonicalHashes, wiringMessage: noMarkerMigration }
                    : undefined);
            }
            if (ws.writes.length > before) {
                result.updated.push(relPath);
                console.log(`${LOG_PREFIX}${options.dryRun ? " [dry-run]" : ""} upgrade (merge): ${relPath}`);
            }
            else {
                result.skipped.push(relPath);
                result.skippedSeedable.push(relPath);
            }
            continue;
        }
        // Whole-file formats (byte-equal-text, or unmanaged non-markered templates).
        // Token-substitute FIRST (matching install's writeTier1 tokens) so
        // drift-detect compares like-for-like and a freshly-seeded file gets real values,
        // not a literal `{{DEFAULT_BRANCH}}` (#129 §2). Token-free templates are unchanged.
        const effectiveTemplate = applyTokens(templateContent, tokens);
        const diffAction = diffFile(relPath, absolutePath, effectiveTemplate, canonicalHashes);
        switch (diffAction.action) {
            case "skip":
                result.skipped.push(relPath);
                if (diffAction.reason === "in-sync")
                    result.skippedSeedable.push(relPath);
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
                console.error(`${LOG_PREFIX} conflict: ${relPath} — consumer drift detected, NOT overwriting`);
                break;
            }
        }
    }
    // In non-interactive mode: emit conflict summary to stderr
    if (options.nonInteractive && result.conflicts.length > 0) {
        console.error(`${LOG_PREFIX} ${result.conflicts.length} conflict(s) detected. Manually merge or revert consumer changes:`);
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
 *     or confirmed (`result.updated` ∪ `result.skippedSeedable`):
 *       - updated → always (disk is what bkit just wrote).
 *       - block/scope-merge skips → always. Disk is NOT the template (it carries
 *         consumer content too), so the file is hashed as it now sits on disk.
 *       - whole-file skips → only when disk == template. A template-unchanged skip
 *         over consumer drift keeps its prior hash, so the next template change is
 *         a conflict, not a silent overwrite (#459).
 *       - conflicts → never, for the same reason.
 *   - `pinnedVersion`: bump to the version just upgraded TO (`options.pinnedVersion`).
 *     `bkit upgrade` previously refreshed hashes but left the pin stale, so the very
 *     next `bkit check` wanted to write the pin (1 write → exit 1), leaving a clean
 *     upgrade in a CI-FAILING state until a manual edit (issue #129 §3). Writing the
 *     pin here — exactly as `install`/`check` do — keeps upgrade drift-clean.
 *
 * Call this AFTER `runUpgrade` completes (P4.T4 integration: hashes must stay
 * in sync with the files bkit actually wrote so the next upgrade can detect drift).
 */
export function updateCanonicalHashesAfterUpgrade(result, options) {
    if (options.dryRun)
        return;
    const cwd = options.cwd ?? process.cwd();
    const versionFile = path.join(cwd, ".bkit", "version");
    const bkitVersion = readBkitVersion(versionFile);
    if (!bkitVersion)
        return;
    const seedablePaths = new Set([...result.updated, ...result.skippedSeedable]);
    // Drop the keys bkit no longer keeps (retired owned files, templates) and the retired
    // tier3Hashes field, exactly as install's postDispatch does, so a clean upgrade is
    // followed by a zero-write check.
    const newCanonicalHashes = withoutRetiredHashes(bkitVersion.canonicalHashes);
    const droppedRetired = Object.keys(newCanonicalHashes).length !== Object.keys(bkitVersion.canonicalHashes).length ||
        bkitVersion.legacyTier3Hashes === true;
    for (const relPath of seedablePaths) {
        // Exclude .agents/ internal files (docs.md, friction.md, rules.md, skills.md,
        // .env.example etc.) from canonicalHashes — they are not consumer-facing files
        // whose hashes bkit uses for drift detection. Mirrors the same filter applied
        // in the install path (bkit-modules.ts postDispatch). Template copies and
        // retired paths carry no hash there either.
        if (relPath.startsWith(".agents" + path.sep))
            continue;
        if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep))
            continue;
        if (isRetiredHashKey(relPath))
            continue;
        const absolutePath = path.join(cwd, relPath);
        if (!fs.existsSync(absolutePath))
            continue;
        newCanonicalHashes[relPath] = sha256(fs.readFileSync(absolutePath, "utf-8"));
    }
    const pinnedVersion = options.pinnedVersion ?? bkitVersion.pinnedVersion;
    const webFetchUnchanged = options.claudeAllowDerived == null ||
        JSON.stringify([...options.claudeAllowDerived]) ===
            JSON.stringify(bkitVersion.claudeAllowDerived);
    // Nothing to persist: no files processed AND the pin is current AND the record is unchanged.
    if (seedablePaths.size === 0 &&
        pinnedVersion === bkitVersion.pinnedVersion &&
        webFetchUnchanged &&
        !droppedRetired) {
        return;
    }
    const updated = {
        ...bkitVersion,
        pinnedVersion,
        canonicalHashes: newCanonicalHashes,
        ...(options.claudeAllowDerived == null
            ? {}
            : { claudeAllowDerived: [...options.claudeAllowDerived] }),
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
export function migrateStrayGitattributes(cwd, dryRun) {
    const stray = path.join(cwd, "gitattributes");
    const dotted = path.join(cwd, ".gitattributes");
    if (fs.existsSync(stray) && fs.statSync(stray).isFile()) {
        if (!fs.existsSync(dotted)) {
            console.log(`${LOG_PREFIX}${dryRun ? " [dry-run]" : ""} migrate: rename stray 'gitattributes' → '.gitattributes'`);
            if (!dryRun)
                fs.renameSync(stray, dotted);
        }
        else {
            console.warn(`${LOG_PREFIX} stray dot-less 'gitattributes' found alongside '.gitattributes' — leaving the stray for manual removal`);
        }
    }
    if (dryRun)
        return;
    // Drop the bogus dot-less key 2.5.0 recorded; the dotted key is reseeded later.
    const versionFile = path.join(cwd, ".bkit", "version");
    const bkitVersion = readBkitVersion(versionFile);
    if (bkitVersion?.canonicalHashes && "gitattributes" in bkitVersion.canonicalHashes) {
        const canonicalHashes = { ...bkitVersion.canonicalHashes };
        delete canonicalHashes.gitattributes;
        writeBkitVersion(versionFile, { ...bkitVersion, canonicalHashes });
    }
}
// ---------------------------------------------------------------------------
// migrateWarningsToNoise — docs/warnings.md → docs/noise.md rename
// ---------------------------------------------------------------------------
/**
 * `docs/warnings.md` (registry of intentional log-level downgrades) widened to
 * cover every deliberate signal downgrade — log levels, error-tracker issue
 * archives / mutes, alert thresholds — and was renamed `docs/noise.md`.
 *
 * Consumers keep their own entries BELOW the managed block, so the file has to
 * MOVE, not reseed: renaming only the template would write a fresh empty
 * `docs/noise.md` and strand every recorded downgrade in the orphaned old file.
 *
 * This migration:
 *   1. Moves `docs/warnings.md` → `docs/noise.md` (only when no `docs/noise.md`
 *      already exists — never clobbers one). The upgrade walk that follows
 *      block-merges the new managed header into the moved file, so consumer
 *      entries below `bkit:end` survive untouched.
 *   2. Drops the stale `docs/warnings.md` key from canonicalHashes; the
 *      `docs/noise.md` key is reseeded by that same walk.
 *
 * Idempotent: a no-op on fresh installs and already-migrated consumers.
 */
export function migrateWarningsToNoise(cwd, dryRun) {
    const oldPath = path.join(cwd, "docs", "warnings.md");
    const newPath = path.join(cwd, "docs", "noise.md");
    if (fs.existsSync(oldPath) && fs.statSync(oldPath).isFile()) {
        if (!fs.existsSync(newPath)) {
            console.log(`${LOG_PREFIX}${dryRun ? " [dry-run]" : ""} migrate: rename 'docs/warnings.md' → 'docs/noise.md'`);
            if (!dryRun) {
                fs.mkdirSync(path.dirname(newPath), { recursive: true });
                fs.renameSync(oldPath, newPath);
            }
        }
        else {
            console.warn(`${LOG_PREFIX} 'docs/warnings.md' found alongside 'docs/noise.md' — merge the entries by hand, then delete the old file`);
        }
    }
    if (dryRun)
        return;
    const versionFile = path.join(cwd, ".bkit", "version");
    const bkitVersion = readBkitVersion(versionFile);
    if (bkitVersion?.canonicalHashes && "docs/warnings.md" in bkitVersion.canonicalHashes) {
        const canonicalHashes = { ...bkitVersion.canonicalHashes };
        delete canonicalHashes["docs/warnings.md"];
        writeBkitVersion(versionFile, { ...bkitVersion, canonicalHashes });
    }
}
