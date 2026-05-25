// bkit-modules.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, printSink, ws }
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → ci → lint → git-hooks
// .bkit-version is written LAST — in postDispatch after ALL modules complete (MED-4).

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import {
  writeTier1,
  writeTier2,
  writeTier3,
  writeTier2JsonContained,
  migrateLegacyBkitEnvelope,
  ensurePackageJsonScripts,
  ensurePackageJsonDevDeps,
  type WriteSet,
  type JsonValue,
} from "./bkit-tiers.js";
import { readBkitVersion, writeBkitVersion, hashFile } from "./bkit-version.js";
import { applyTokens, type TokenMap } from "./bkit-tokens.js";
import type { ModuleFlag } from "./bkit-cli.js";
import { runPayload, applyT1, applyT2, applyT3, remapTemplateDest } from "./bkit-install.js";
import type { PreflightFinding } from "./bkit-preflight.js";
import { getPkgRoot } from "./bkit-paths.js";
import { getInstallManifest, type IssueTracker, DEFAULT_ISSUE_TRACKER } from "./bkit-manifest.js";
import { loadTrackers, substituteWorkflow } from "./bkit-trackers.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Persist a `bkit.<field>` value into the consumer's package.json so the
 * post-install advisory can tell "deliberately none" from "undecided". Mirrors
 * the `bkit.issueTracker` persist logic in bkit-install.ts. Used for the opt-in
 * decisions recorded by their owning modules (`depUpdater`, `cloudAgents`). No-op
 * on dry-run or when package.json is absent/unparseable (non-fatal — the config
 * file presence is still the primary signal).
 */
function setConsumerBkitField(field: string, value: string, dryRun: boolean): void {
  if (dryRun) return;
  const pkgPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(pkgPath)) return;
  try {
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as Record<string, unknown>;
    const bkit = (pkg.bkit ?? {}) as Record<string, unknown>;
    if (bkit[field] === value) return; // already set — avoid a no-op rewrite
    bkit[field] = value;
    pkg.bkit = bkit;
    const indentMatch = raw.match(/\n([ \t]+)"/);
    const indent = indentMatch ? indentMatch[1] : "  ";
    const trailingNewline = raw.endsWith("\n") ? "\n" : "";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
  } catch {
    // non-fatal — file presence is the primary signal
  }
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function listMdFiles(dir: string, prefix?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => (prefix ? f.startsWith(prefix) : true));
}

function installFile(
  srcPath: string,
  destPath: string,
  transform: ((content: string) => string) | null,
  dryRun: boolean,
): boolean {
  if (!transform) {
    if (fs.existsSync(destPath)) {
      const src = fs.readFileSync(srcPath);
      const dest = fs.readFileSync(destPath);
      if (src.equals(dest)) return false;
    }
    if (!dryRun) fs.copyFileSync(srcPath, destPath);
    return true;
  }

  const src = fs.readFileSync(srcPath, "utf-8");
  const transformed = transform(src);
  if (fs.existsSync(destPath)) {
    const existing = fs.readFileSync(destPath, "utf-8");
    if (existing === transformed) return false;
  }
  if (!dryRun) fs.writeFileSync(destPath, transformed, "utf-8");
  return true;
}

function removeOrphans(
  destDir: string,
  sourceFiles: Set<string>,
  dryRun: boolean,
  prefix?: string,
): string[] {
  const BKIT_PREFIX = "bkit-";
  if (!fs.existsSync(destDir)) return [];
  const removed: string[] = [];
  for (const f of fs.readdirSync(destDir)) {
    if (!f.endsWith(".md")) continue;
    if (prefix && !f.startsWith(prefix)) continue;
    if (!sourceFiles.has(f)) {
      if (!dryRun) fs.rmSync(path.join(destDir, f));
      removed.push(f);
    }
  }
  return removed;
}

// Re-export getPkgRoot from bkit-paths (lifted there to break the preflight ↔ modules cycle).
export { getPkgRoot } from "./bkit-paths.js";

// ---------------------------------------------------------------------------
// Module context
// ---------------------------------------------------------------------------

export interface ModuleContext {
  dryRun: boolean;
  tokens: TokenMap;
  modelLookup: Map<string, string>;
  /** Structured advisory accumulator — replaces the legacy printSink: string[] channel. */
  advisories: PreflightFinding[];
  ws: WriteSet;
  logPrefix: string;
  /**
   * Deferred callbacks executed by dispatchModules AFTER all modules complete.
   * Use for finalisation work that must run only when the full dispatch succeeds
   * (e.g. writing .bkit-version after all modules return cleanly).
   */
  postDispatch: Array<() => void>;
  /** Issue tracker for workflow mirror substitution. Default: "none". */
  issueTracker: IssueTracker;
}

export type ModuleFn = (ctx: ModuleContext) => void;

// ---------------------------------------------------------------------------
// Core template files — directories/basenames owned ONLY by core module.
// These are templates that don't belong to ci/lint/git-hooks/claude/cursor modules.
// ---------------------------------------------------------------------------

// Top-level template directories/files that belong to core (not other modules)
const CORE_TEMPLATE_DIRS = new Set(["docs", ".agents", "scripts"]);
// Top-level template files (non-directory) that belong to core.
// `gitignore` is stored dot-less (npm strips a literal `.gitignore`); `.gitattributes`
// is stored with its dot (npm does not strip it) — see remapTemplateDest / NPM_STRIP_REMAP.
const CORE_TEMPLATE_FILES = new Set(["AGENTS.md", "CLAUDE.md", "gitignore", ".gitattributes"]);
// Files inside .agents/ subtemplate dir that are Tier 3 (seed-or-print) and are
// owned by other modules — skip in the core Tier 2 templates pass to avoid
// double-recording them in the WriteSet. These are written by their owning module.
const AGENTS_SUBTEMPLATE_TIER3_EXCLUDE = new Set([".env.example"]);
// Files that live under a core-owned template dir (e.g. `scripts/`) but are
// actually owned by an OPT-IN module — skip in the core pass so they ship ONLY
// when the consumer opts into that module, never on default `--full` install.
// `bkit-set-dependabot.sh` ships via `bkit install --dependabot` only.
const CORE_TEMPLATE_PATH_EXCLUDE = new Set([path.join("scripts", "ci", "bkit-set-dependabot.sh")]);
// Template subdirectories that belong to non-core modules (skip in core pass)
const NON_CORE_TEMPLATE_DIRS = new Set([
  ".github",
  ".vale",
  ".vale.ini",
  ".husky",
  ".prettierignore",
  ".cursor",
  ".claude",
]);

// Run templates pass only for core-owned files (top-level md files, docs/, .agents/ subtemplates).
// Each other module handles its own template files directly.
function runCoreTemplates(
  dryRun: boolean,
  pkgRoot: string,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const root = path.join(pkgRoot, ".agents", "templates");
  if (!fs.existsSync(root)) return;

  const tag = dryRun ? "[dry-run] " : "";

  // Process top-level entries
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    const name = ent.name;
    // Skip non-core module dirs/files
    if (NON_CORE_TEMPLATE_DIRS.has(name)) continue;
    // Only process known core files or core dirs
    if (!CORE_TEMPLATE_FILES.has(name) && !CORE_TEMPLATE_DIRS.has(name) && !ent.isDirectory()) {
      // Allow slop-scan.config.json through (lint module handles it), skip others
      continue;
    }
    if (ent.isDirectory() && !CORE_TEMPLATE_DIRS.has(name)) continue;

    const srcPath = path.join(root, name);
    if (ent.isFile()) {
      // Single shared dotfile remap (gitignore → .gitignore, npmignore → .npmignore).
      const dstPath = remapTemplateDest(name);
      const prevLen = ws.writes.length;
      writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}core: ${dstPath}`);
      }
    } else if (ent.isDirectory()) {
      // Process the directory recursively
      processCoreTemplateDir(srcPath, name, dryRun, tokens, ws, logPrefix);
    }
  }

  // Note: `.agents/` subtemplates in `templates/.agents/` ARE processed here
  // (via CORE_TEMPLATE_DIRS) so that their managed block is sourced from the
  // template — NOT from bkit's own dogfood `.agents/*.md` (which carries
  // bkit-specific out-of-block content like `### bkit Repo Authoring`). These
  // basenames are listed in COPY_EXCLUDE so copyAdditive does not race the
  // templates pass for the same destination paths (would double-record in
  // dry-run mode otherwise).
}

function processCoreTemplateDir(
  srcDir: string,
  relBase: string,
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const tag = dryRun ? "[dry-run] " : "";
  if (!fs.existsSync(srcDir)) return;
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    // Skip Tier 3 files inside .agents/ subtemplate dir — they are owned by their
    // respective modules and written via writeTier3 (seed-or-print), not Tier 2.
    if (ent.isFile() && relBase === ".agents" && AGENTS_SUBTEMPLATE_TIER3_EXCLUDE.has(ent.name)) {
      continue;
    }
    const srcPath = path.join(srcDir, ent.name);
    const relPath = path.join(relBase, ent.name);
    if (ent.isDirectory()) {
      processCoreTemplateDir(srcPath, relPath, dryRun, tokens, ws, logPrefix);
    } else if (ent.isFile()) {
      // Skip opt-in-module-owned files that happen to live under a core dir.
      if (CORE_TEMPLATE_PATH_EXCLUDE.has(relPath)) continue;
      const dstPath = relPath;
      const prevLen = ws.writes.length;
      writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}core: ${dstPath}`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// runCoreModule — payload pass + core templates + .bkit-version (LAST)
// ---------------------------------------------------------------------------

// `.bkit-version` excluded: it's a runtime artifact written by postDispatch,
// never source of truth. Including it would pollute consumer `.agents/` and
// break the dry-run/install parity check (postDispatch suppresses its own
// write when the file already matches pkgVersion).
//
// Tier-2-style `.agents/*.md` files (rules/friction/docs/skills) are excluded
// because they ship as templates under `.agents/templates/.agents/` and are
// installed by the templates pass. Copying them here additively would dump
// bkit's own out-of-block content (e.g. bkit's `## Project Rules` body in
// `rules.md`, bkit's friction-log entries) onto consumers on first install.
const COPY_EXCLUDE = new Set([
  "skills",
  "scripts",
  "README.md",
  ".bkit-version",
  "rules.md",
  "friction.md",
  "docs.md",
  "skills.md",
  // BAR-260 follow-up: .env.example ships via Tier 3 (writeTier3 from the
  // template at .agents/templates/.agents/.env.example). Including it in the
  // payload copy would double-handle the same destination — Tier 3 sees the
  // file already written by payload copy in live mode, skips its own write,
  // and dry-run vs install writesets diverge. Tier 3 owns this file.
  ".env.example",
]);

// Top-level `.agents/` files that bkit owns end-to-end (no managed-block, no
// consumer edits). copyAdditive's default skip-if-exists semantics are wrong
// for these — a stale consumer copy left over from a prior version causes
// downstream lookups (e.g. parseModelLookup) to crash mid-install when the
// release adds a new prompt. Force-overwrite keeps the on-disk index in sync
// with the installed package version.
//
// BAR-165: every path here MUST also be listed in .agents/templates/.prettierignore
// (the bkit:start/end block) so consumer prettier — which may resolve a different
// printWidth than bkit's 100 — does not lint canonical content that the consumer
// cannot edit. The invariant is asserted by bkit-templates.content.test.ts.
export const CANONICAL_OVERWRITE_RELPATHS = new Set<string>([
  ".agents/prompts.md",
  ".agents/workflows.md",
  ".agents/IDEs.md",
  ".agents/cloud.md",
]);

function copyAdditive(
  src: string,
  dst: string,
  dryRun: boolean,
  log: (rel: string) => void,
  relRoot: string,
): number {
  let writes = 0;
  if (!fs.existsSync(src)) return 0;
  const stats = fs.statSync(src);
  if (stats.isFile()) {
    const relPath = path.relative(relRoot, dst);
    const isCanonical = CANONICAL_OVERWRITE_RELPATHS.has(relPath);
    if (fs.existsSync(dst)) {
      if (!isCanonical) return 0;
      const srcBuf = fs.readFileSync(src);
      const dstBuf = fs.readFileSync(dst);
      if (srcBuf.equals(dstBuf)) return 0;
    }
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      fs.chmodSync(dst, stats.mode);
    }
    log(relPath);
    return 1;
  }
  if (!dryRun) fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    writes += copyAdditive(
      path.join(src, entry.name),
      path.join(dst, entry.name),
      dryRun,
      log,
      relRoot,
    );
  }
  return writes;
}

export function runCoreModule(ctx: ModuleContext): void {
  const { dryRun, ws, advisories, logPrefix, postDispatch } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const cwd = process.cwd();
  const PKG_ROOT = getPkgRoot();
  const PKG_AGENTS = path.join(PKG_ROOT, ".agents");
  const PKG_PACKAGE_JSON = path.join(PKG_ROOT, "package.json");

  if (!fs.existsSync(PKG_AGENTS)) {
    console.error(`${logPrefix} Packaged .agents/ not found at ${PKG_AGENTS} — package corrupt?`);
    process.exit(1);
  }
  if (!fs.existsSync(PKG_PACKAGE_JSON)) {
    console.error(`${logPrefix} package.json not found at ${PKG_PACKAGE_JSON} — package corrupt?`);
    process.exit(1);
  }

  const pkgVersion = JSON.parse(fs.readFileSync(PKG_PACKAGE_JSON, "utf-8")).version as string;
  const target = path.join(cwd, ".agents");

  // Capture first-install signal NOW (before any writes) — used for the post-install banner.
  // The actual .bkit-version write is deferred to postDispatch so that a mid-install crash
  // in a subsequent module does NOT leave .bkit-version on disk (which would suppress the
  // first-install banner on retry).
  const versionFile = path.join(target, ".bkit-version");
  const isFirstInstall = !fs.existsSync(versionFile);

  // 1. Additive .agents/ payload copy (core subdirs only, excluding COPY_EXCLUDE)
  console.log(`${logPrefix} ${tag}Running core payload copy`);
  for (const entry of fs.readdirSync(PKG_AGENTS, { withFileTypes: true })) {
    if (COPY_EXCLUDE.has(entry.name)) continue;
    const srcPath = path.join(PKG_AGENTS, entry.name);
    const dstPath = path.join(target, entry.name);
    copyAdditive(
      srcPath,
      dstPath,
      dryRun,
      (rel) => {
        console.log(`${logPrefix} ${tag}copy: ${rel}`);
        // Note: copyAdditive writes are internal .agents/ payload management (not consumer outputs).
        // We log them but do NOT add to ws (ws tracks consumer output files for parity checks).
      },
      cwd,
    );
  }

  // 2. Payload pass (bkit-prefix sync for workflows/prompts + templates mirror)
  console.log(`${logPrefix} ${tag}Running payload pass`);
  const { writes: payloadWrites } = runPayload(dryRun);
  if (payloadWrites > 0) {
    console.log(`${logPrefix} ${tag}payload: ${payloadWrites} file(s) synced`);
  }

  // 3. Core templates pass (only core-owned template files: AGENTS.md, CLAUDE.md, .gitignore, docs/)
  // Each other module handles its own template files directly.
  console.log(`${logPrefix} ${tag}Running core templates pass`);
  runCoreTemplates(dryRun, PKG_ROOT, ctx.tokens, ws, logPrefix);

  // 4. .bkit-version write — deferred to postDispatch so it only persists when ALL modules succeed.
  // This ensures a mid-install crash in a subsequent module does not suppress the first-install
  // banner on retry (MED-4).
  // C3 fix: write JSON format with canonicalHashes populated from ws.writes (fully populated
  // by the time postDispatch runs — all modules have completed). canonicalHashes records the
  // sha256 of each bkit-managed consumer file as written, enabling drift detection on upgrade.
  postDispatch.push(() => {
    // Read existing file to check whether an update is needed.
    const existingVersion = readBkitVersion(versionFile);
    const existingTier3Hashes = existingVersion?.tier3Hashes ?? {};
    const existingCanonical = existingVersion?.canonicalHashes ?? {};

    // Build the set of consumer-relative paths that have format "byte-equal-text".
    // tier3Hashes is narrowed (v2.0.0+) to only these paths — json and markered-text
    // formats use deepContains / marker extraction for drift detection, so they do NOT
    // need a hash entry. ".agents/.bkit-version" is excluded (it is the version file
    // itself, not a consumer-facing file).
    const byteEqualPaths = new Set<string>(
      getInstallManifest()
        .filter(
          (e) => e.format === "byte-equal-text" && e.path !== path.join(".agents", ".bkit-version"),
        )
        .map((e) => e.path),
    );

    // Build new canonicalHashes entries from ws.writes (files written in this run).
    // ws.writes is fully populated by the time postDispatch runs.
    // Exclude .bkit-version itself and .agents/ internal files (not consumer-facing).
    const newCanonicalEntries: Record<string, string> = {};
    // Also record hashes for byte-equal-text files written in this run.
    const newTier3Entries: Record<string, string> = {};
    for (const entry of ws.writes) {
      const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
      const relPath = path.relative(cwd, absPath);
      if (relPath === path.join(".agents", ".bkit-version")) continue;
      if (relPath.startsWith(".agents" + path.sep)) continue;
      if (!fs.existsSync(absPath)) continue;
      const hash = hashFile(absPath);
      if (hash) {
        newCanonicalEntries[relPath] = hash;
        // Narrow tier3Hashes to byte-equal-text format only.
        if (byteEqualPaths.has(relPath)) {
          newTier3Entries[relPath] = hash;
        }
      }
    }

    // tier3Hashes: start from existing byte-equal-text entries only (drop any legacy wider entries),
    // then merge new writes. Backward-compat: preserve existing entries for known byte-equal-text
    // paths (uninstall safety — shouldDeleteTier3 needs the hash if the file was written before
    // this narrowing landed).
    const narrowedExistingTier3: Record<string, string> = {};
    for (const [p, h] of Object.entries(existingTier3Hashes)) {
      if (byteEqualPaths.has(p)) narrowedExistingTier3[p] = h;
    }
    const tier3Hashes: Record<string, string> = { ...narrowedExistingTier3, ...newTier3Entries };

    // Merge: existing hashes preserved, new writes overwrite (hashes stay current).
    const canonicalHashes: Record<string, string> = {
      ...existingCanonical,
      ...newCanonicalEntries,
    };

    // Decide whether a write is needed: version mismatch, first install, or new canonical entries.
    const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
    const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
    const needsWrite = versionChanged || hasNewEntries;

    if (needsWrite) {
      console.log(
        `${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`,
      );
      ws.writes.push({ path: versionFile, action: "write" });
      if (!dryRun) {
        fs.mkdirSync(target, { recursive: true });
        writeBkitVersion(versionFile, { pinnedVersion: pkgVersion, tier3Hashes, canonicalHashes });
      }
    }
  });

  // 5. First-run extra logging (only when .bkit-version was absent at start of install)
  // Note: package.json scripts (typecheck, format:check, lint:prose, lint:slop, prepare)
  // are auto-added by their respective modules — no manual copy-paste required.
  if (isFirstInstall) {
    advisories.push({
      id: "first-install-postinstall-steps",
      severity: "advisory",
      detect: "First install detected (.bkit-version was absent).",
      action:
        "Post-install steps:\n\n" +
        "1. Add GH_BKIT_TOKEN to your GitHub Actions repository secrets:\n" +
        "   - Create a classic PAT with `read:packages` scope (fine-grained PATs are\n" +
        "     not currently supported by GitHub Packages npm registry).\n" +
        "   - GitHub Settings → Secrets and variables → Actions → New repository secret\n" +
        "   - Name: GH_BKIT_TOKEN\n" +
        "   - See README.md ## Consumer CI auth for full setup.\n\n" +
        "2. Add a `.npmrc` at your repo root so pnpm can authenticate to GH Packages:\n" +
        "     @cbartens:registry=https://npm.pkg.github.com\n" +
        "     //npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}\n\n" +
        "3. Run `pnpm install` to refresh the lockfile, then commit.\n\n" +
        "Note: package.json scripts (typecheck, format:check, lint:prose, lint:slop,\n" +
        "prepare) are auto-added by bkit when their parent module installs. Run\n" +
        "`pnpm bkit install --full` to seed them all. Existing scripts are preserved\n" +
        "(consumer values always win).",
    });
  }
}

// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------

const BKIT_PREFIX = "bkit-";

export function runClaudeModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  // Load tracker snippets once for this module run (reads from bkit package root).
  const trackers = loadTrackers(getPkgRoot());
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;

  const pairs: Array<[string, string]> = [
    [".agents/workflows", ".claude/commands"],
    [".agents/prompts", ".claude/agents"],
  ];

  for (const [src, dest] of pairs) {
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      // Apply tracker substitution for workflow files; prompts are byte-identical.
      const transform: ((c: string) => string) | null =
        src === ".agents/workflows"
          ? (c: string) => substituteWorkflow(c, issueTracker, trackers).output
          : null;
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
    }
  }

  const PKG_ROOT = getPkgRoot();
  const claudeTemplates = path.join(PKG_ROOT, ".agents", "templates", ".claude");

  // Tier 2 JSON (contained) — deep-containment: settings.json
  // Phase 1: run migrateLegacyBkitEnvelope to strip __bkit__ before writing.
  const settingsSrc = path.join(claudeTemplates, "settings.json");
  const settingsDst = ".claude/settings.json";
  if (fs.existsSync(settingsSrc)) {
    // Run migration first (idempotent — strips __bkit__ envelope if present)
    if (fs.existsSync(settingsDst) && !dryRun) {
      try {
        const raw = fs.readFileSync(settingsDst, "utf-8");
        const doc = JSON.parse(raw) as Record<string, JsonValue>;
        const templateRaw = fs.readFileSync(settingsSrc, "utf-8");
        const template = JSON.parse(templateRaw) as Record<string, JsonValue>;
        const result = migrateLegacyBkitEnvelope(doc, template);
        if (result.stripped) {
          // Write migrated doc atomically via temp file + rename
          const tmpPath = `${settingsDst}.bkit-migrate-tmp`;
          fs.writeFileSync(tmpPath, JSON.stringify(result.outDoc, null, 2) + "\n", "utf-8");
          fs.renameSync(tmpPath, settingsDst);
          const variant = result.schemaFlipped
            ? "schema flip applied (flat-array → keyed-object)"
            : "stripped __bkit__ envelope";
          console.log(`[bkit] migrated ${settingsDst} — ${variant} (v2.0.0)`);
        }
      } catch {
        // Malformed JSON in migration — skip migration; writeTier2JsonContained below will throw
        // with a user-actionable error message requiring manual fix before re-running bkit install.
      }
    }
    const prevLen = ws.writes.length;
    writeTier2JsonContained(settingsSrc, settingsDst, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}claude: ${settingsDst}`);
    }
  }

  // Markered-text — manifest format: "markered-text" — preflight hook.
  // Uses writeTier2 (html-comment markers: # <!-- bkit:start --> / # <!-- bkit:end -->)
  // to update only the bkit-managed block, preserving any consumer content outside markers.
  // Changed from writeTier1 to align install dispatch with manifest format classification.
  {
    const src = path.join(claudeTemplates, "hooks", "preflight.sh");
    const dst = ".claude/hooks/preflight.sh";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${dst}`);
      }
    }
  }

  // cloud-bootstrap.sh moved to the opt-in `cloud` module (runCloudModule) — it
  // only matters once a Claude Code on the web env is wired (a manual opt-in step),
  // so a default --full install ships zero cloud footprint. The SessionStart hook
  // entry in .claude/settings.json is guarded (`test -f … || true`) so it no-ops
  // when the script is absent. The `cloud-env-customize` advisory moved with it.

  // Byte-equal-text — .mcp.json root-level MCP config — Tier 3 seed-or-print.
  // Content is filtered by issueTracker: only the selected tracker's mcpServers entry is seeded.
  {
    const mcpSrc = path.join(PKG_ROOT, ".agents", "templates", ".mcp.json");
    const mcpDst = ".mcp.json";
    const prevLen = ws.writes.length;
    const result = seedMcpJson(
      mcpSrc,
      mcpDst,
      issueTracker,
      MCP_ROOT_MERGE_INSTRUCTIONS,
      dryRun,
      advisories,
      ws,
    );
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}claude: ${mcpDst}`);
    } else if (result.suggested) {
      console.log(`${logPrefix} ${tag}claude: ${mcpDst} (exists; AI merge instructions printed)`);
    }
  }

  // Byte-equal-text — .agents/.env.example — Tier 3 seed-or-print.
  // Seeds the canonical token-placeholder file on first install; emits merge
  // instructions if consumer has modified. Not claude-specific but the claude
  // module is the default-runs-everywhere module — appropriate home for
  // consumer-setup scaffolding that all environments need.
  {
    const envExampleSrc = path.join(PKG_ROOT, ".agents", "templates", ".agents", ".env.example");
    const envExampleDst = ".agents/.env.example";
    if (fs.existsSync(envExampleSrc)) {
      const prevLen = ws.writes.length;
      const result = writeTier3(
        envExampleSrc,
        envExampleDst,
        dryRun,
        advisories,
        ws,
        ENV_EXAMPLE_MERGE_INSTRUCTIONS,
      );
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${envExampleDst}`);
      } else if (result.suggested) {
        console.log(
          `${logPrefix} ${tag}claude: ${envExampleDst} (exists; AI merge instructions printed)`,
        );
      }
    }
  }

  // Byte-equal-text — .envrc — Tier 3 seed-or-print.
  // Seeds a single-line dotenv_if_exists directive for direnv auto-load.
  {
    const envrcSrc = path.join(PKG_ROOT, ".agents", "templates", ".envrc");
    const envrcDst = ".envrc";
    if (fs.existsSync(envrcSrc)) {
      const prevLen = ws.writes.length;
      const result = writeTier3(
        envrcSrc,
        envrcDst,
        dryRun,
        advisories,
        ws,
        ENVRC_MERGE_INSTRUCTIONS,
      );
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${envrcDst}`);
      } else if (result.suggested) {
        console.log(
          `${logPrefix} ${tag}claude: ${envrcDst} (exists; AI merge instructions printed)`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------

export function runCursorModule(ctx: ModuleContext): void {
  const { dryRun, tokens, modelLookup, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  // Load tracker snippets once for this module run.
  const trackers = loadTrackers(getPkgRoot());
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;

  // Commands: tracker substitution → T1 → T2
  {
    const src = ".agents/workflows";
    const dest = ".cursor/commands";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        applyT2(applyT1(substituteWorkflow(c, issueTracker, trackers).output));
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
    }
  }

  // Agents: T3
  {
    const src = ".agents/prompts";
    const dest = ".cursor/agents";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) => applyT3(c, modelLookup);
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        console.log(`${logPrefix} ${tag}write: ${path.join(dest, f)}`);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      console.log(`${logPrefix} ${tag}delete orphan: ${path.join(dest, f)}`);
    }
  }

  // Tier 2 JSON (contained) — deep-containment: hooks.json
  // Phase 1: run migrateLegacyBkitEnvelope to strip __bkit__ before writing.
  const PKG_ROOT = getPkgRoot();
  const cursorTemplates = path.join(PKG_ROOT, ".agents", "templates", ".cursor");
  const hooksSrc = path.join(cursorTemplates, "hooks.json");
  const hooksDst = ".cursor/hooks.json";
  if (fs.existsSync(hooksSrc)) {
    // Run migration first (idempotent — strips __bkit__ envelope if present)
    if (fs.existsSync(hooksDst) && !dryRun) {
      try {
        const raw = fs.readFileSync(hooksDst, "utf-8");
        const doc = JSON.parse(raw) as Record<string, JsonValue>;
        const templateRaw = fs.readFileSync(hooksSrc, "utf-8");
        const template = JSON.parse(templateRaw) as Record<string, JsonValue>;
        const result = migrateLegacyBkitEnvelope(doc, template);
        if (result.stripped) {
          // Write migrated doc atomically via temp file + rename
          const tmpPath = `${hooksDst}.bkit-migrate-tmp`;
          fs.writeFileSync(tmpPath, JSON.stringify(result.outDoc, null, 2) + "\n", "utf-8");
          fs.renameSync(tmpPath, hooksDst);
          const variant = result.schemaFlipped
            ? "schema flip applied (flat-array → keyed-object)"
            : "stripped __bkit__ envelope";
          console.log(`[bkit] migrated ${hooksDst} — ${variant} (v2.0.0)`);
        }
      } catch {
        // Malformed JSON in migration — skip migration; writeTier2JsonContained below will throw
        // with a user-actionable error message requiring manual fix before re-running bkit install.
      }
    }
    const prevLen = ws.writes.length;
    writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}cursor: ${hooksDst}`);
    }
  }

  // Markered-text — manifest format: "markered-text" — preflight hook + shared rules.
  // All use html-comment markers (# <!-- bkit:start --> / # <!-- bkit:end -->).
  // Uses writeTier2 to update only the bkit-managed block; consumer content outside
  // markers is preserved. `.cursor/Dockerfile` moved to the opt-in `cloud` module
  // (runCloudModule) — it only matters for Cursor Background Agents (cloud).
  {
    const markeredFiles: Array<[string, string]> = [
      [path.join(cursorTemplates, "hooks", "preflight.sh"), ".cursor/hooks/preflight.sh"],
      [
        path.join(cursorTemplates, "rules", "00-shared-rules.mdc"),
        ".cursor/rules/00-shared-rules.mdc",
      ],
    ];
    for (const [src, dst] of markeredFiles) {
      if (!fs.existsSync(src)) continue;
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${dst}`);
      }
    }
  }

  // Byte-equal-text — manifest format: "byte-equal-text" — seed-or-print for consumer infra.
  // Uses writeTier3 semantics: seed if absent, emit AI-actionable advisory if present and
  // differing. These files are consumer-configurable; bkit does not force-overwrite them.
  // The manifest classifies them "byte-equal-text" for check/uninstall dispatch; install
  // intentionally uses seed-or-print to preserve consumer modifications on upgrade.
  //
  // `.cursor/environment.json` moved to the opt-in `cloud` module (runCloudModule) — it
  // configures Cursor Background Agents (cloud) and is inert for local Cursor use.
  const tier3Files: Array<[string, string, string]> = [
    [
      path.join(cursorTemplates, "settings.json"),
      ".cursor/settings.json",
      CURSOR_SETTINGS_MERGE_INSTRUCTIONS,
    ],
  ];
  for (const [src, dst, msg] of tier3Files) {
    if (!fs.existsSync(src)) continue;
    const prevLen = ws.writes.length;
    const result = writeTier3(src, dst, dryRun, advisories, ws, msg);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}cursor: ${dst}`);
    } else if (result.suggested) {
      console.log(`${logPrefix} ${tag}cursor: ${dst} (exists; AI merge instructions printed)`);
    }
  }

  // .cursor/mcp.json — Tier 3 seed-or-print, filtered by issueTracker (same as .mcp.json).
  {
    const cursorMcpSrc = path.join(cursorTemplates, "mcp.json");
    const cursorMcpDst = ".cursor/mcp.json";
    const prevLen = ws.writes.length;
    const result = seedMcpJson(
      cursorMcpSrc,
      cursorMcpDst,
      issueTracker,
      CURSOR_MCP_MERGE_INSTRUCTIONS,
      dryRun,
      advisories,
      ws,
    );
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}cursor: ${cursorMcpDst}`);
    } else if (result.suggested) {
      console.log(
        `${logPrefix} ${tag}cursor: ${cursorMcpDst} (exists; AI merge instructions printed)`,
      );
    }
  }
}

// checkBkitTokenSecret and detectVercelProject moved to bkit-postinstall.ts (Phase 3 owns them).

// ---------------------------------------------------------------------------
// AI-actionable Tier 3 merge instructions
//
// Each constant is a self-contained instruction block: any AI agent
// (Claude/Cursor/Copilot/etc.) reading the install output can paste it as
// a prompt and apply the required merge without referring back to bkit
// docs. Use {{TEMPLATE_CONTENT}} as a placeholder — writeTier3 substitutes
// the live template content at print time.
// ---------------------------------------------------------------------------

// scanForeignBkitUses — BAR-164 installer guard. Returns every
// `uses: cbartens/bkit/...@<ref>` line in the canonical CI template. While
// `cbartens/bkit` stays private and consumers live in other GitHub orgs, such
// references cannot be resolved by the runner's GITHUB_TOKEN. The env-var
// pattern (GH_BKIT_TOKEN env on the install step) is the canonical install
// flow — see README §"Consumer CI auth". `runCiModule` calls this and throws
// before writing if any matches are found, so a regression is caught at
// dev/CI time, never in a consumer repo.
export function scanForeignBkitUses(content: string): string[] {
  const matches: string[] = [];
  const re = /^\s*-?\s*uses:\s*(cbartens\/bkit\/[^\s@]+@\S+)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    matches.push(m[1]!);
  }
  return matches;
}

const CI_YML_MERGE_INSTRUCTIONS = `[bkit] .github/workflows/ci.yml exists — bkit cannot safely YAML-merge jobs. Manual merge required.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .github/workflows/ci.yml. Compare it to the bkit reference workflow
  below (which represents the complete recommended CI gates for any bkit
  consumer). Your existing workflow likely has additional consumer-specific
  jobs and triggers — preserve those.

  Required merge actions:
  1. Ensure a .npmrc file exists at the repo root with these two lines:

        @cbartens:registry=https://npm.pkg.github.com
        //npm.pkg.github.com/:_authToken=\${GH_BKIT_TOKEN}

     Commit this .npmrc file — the CI runner reads it during pnpm install.

  2. Ensure the install step passes GH_BKIT_TOKEN from the repo secret:

        - name: Install dependencies
          run: pnpm install --frozen-lockfile
          env:
            GH_BKIT_TOKEN: \${{ secrets.GH_BKIT_TOKEN }}

  3. Remove any 'Configure private-repo auth' step (git config --global
     url."...cbartens/bkit...".insteadOf "...") — this git auth-shim is
     obsolete. The .npmrc + env var approach replaces it entirely.

  4. Ensure the GitHub repo secret GH_BKIT_TOKEN is set with a PAT that has
     read:packages scope (classic) or Packages: read permission (fine-grained).

  5. Ensure 'package.json' has '"packageManager": "pnpm@<version>"' set.
     pnpm/action-setup@v4 reads this as single source of truth and will
     fail if it is missing or conflicts with a 'with: version:' block.

  6. Ensure the package.json scripts referenced by the workflow exist:
     "format:check", "lint:prose", "lint:slop". Run 'bkit install --lint'
     to seed them, or add manually.

  Do NOT remove or duplicate top-level 'name:', 'on:', or 'jobs:' keys.
  YAML allows only one of each per file.

  --- begin bkit reference workflow ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference workflow ---

  After merging, push to a feature branch and verify the workflow runs to
  green before merging to your default branch.
`;

// CI_ROUTER_YML_MERGE_INSTRUCTIONS removed — `.github/workflows/bkit-cloud.yml`
// is now Tier 1 canonical-overwrite. The YAML is pure plumbing; all routing
// logic lives in the mirrored slash-command orchestrator. No consumer-side
// customisation surface, so no merge instructions are needed.

// DEPENDABOT_YML_MERGE_INSTRUCTIONS removed — `.github/renovate.json5` is now
// Tier 1 canonical-overwrite. bkit owns the config; consumers do not edit it.
// Renovate's `extends: ["config:recommended"]` covers the customisation surface
// that Dependabot required hand-editing for, so no merge advisory is needed.

const VALE_INI_MERGE_INSTRUCTIONS = `[bkit] .vale.ini exists — bkit cannot safely INI-merge (core options must precede [glob] sections per Vale spec). Manual merge required.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .vale.ini. Compare it to the bkit reference content below.

  Required merge actions:
  1. Ensure these three CORE options appear at the TOP of the file (above
     any [glob] section). If they are already present with different
     values, prefer the existing value:
        StylesPath = .vale/styles
        MinAlertLevel = warning
        Packages = write-good
  2. Ensure the SCOPED sections from the reference are present below the
     core options. If a section header (e.g. '[.agents/**]' or '[*.md]')
     already exists in the file, merge the rules into it rather than
     duplicating the header.
  3. Run 'vale sync' once after merging to install any newly-listed
     Packages (e.g. 'write-good').

  Vale will reject the file with error E201 if any core option appears
  AFTER a [glob] section, so ordering matters.

  --- begin bkit reference .vale.ini ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .vale.ini ---

  After merging, run 'vale .agents/' (or your scoped path) to verify the
  rules apply with no parse errors.
`;

const SLOP_SCAN_MERGE_INSTRUCTIONS = `[bkit] slop-scan.config.json exists — bkit will not overwrite. Review the reference defaults and merge if useful.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open slop-scan.config.json. Compare against the bkit reference below.
  Merge any new patterns/exclusions you find useful into the existing
  file. Keep your existing project-specific entries.

  --- begin bkit reference slop-scan.config.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference slop-scan.config.json ---
`;

const LINTSTAGED_MERGE_INSTRUCTIONS = `[bkit] .lintstagedrc.json exists — bkit will not overwrite. The bkit pre-commit hook calls \`pnpm lint-staged\`; ensure your config formats markdown/code on staged files (e.g. \`"*": "prettier --write --ignore-unknown"\`).

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .lintstagedrc.json. Compare against the bkit reference below.
  Keep your existing project-specific entries; ensure that staged
  files matching the bkit canonical paths get formatted on commit.

  --- begin bkit reference .lintstagedrc.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .lintstagedrc.json ---
`;

// Husky hooks moved from Tier 2 (managed-block enforced) to Tier 3 (seed-or-print)
// in v2.0.4. Real-world consumers routinely already run typecheck/test/format:check
// via turbo or lint-staged in their own hook content, making the bkit-managed block
// a duplicate — and the strict Tier-2 drift gate (`tier2-text-drift`) failed CI
// whenever the consumer customised the block, forcing them either back to the
// canonical form or to delete the block (which the next install would re-seed).
// Tier 3 seeds the canonical hook for new consumers and emits an advisory for
// existing consumers whose hook differs — no drift gate, no managed-block markers
// to keep in sync. Declarative pattern files (`.gitignore`, `.prettierignore`)
// stay Tier 2 because their semantics genuinely require additive merging; husky
// hooks are imperative scripts whose semantics are fully replaceable.
const HUSKY_PRE_COMMIT_MERGE_INSTRUCTIONS = `[bkit] .husky/pre-commit exists — bkit will not overwrite. Review the reference below and merge if useful; otherwise keep yours.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  bkit's reference pre-commit hook runs \`pnpm lint-staged && pnpm lint:prose && pnpm lint:slop\`.
  Most consumers using turbo or their own lint-staged config already cover the
  equivalent — in that case, ignore this advisory and keep your existing hook.
  If your hook does NOT already format staged files / run prose + slop scans,
  consider adopting the reference, or merging the missing commands into yours.

  Migration note: bkit versions <= 2.0.3 wrote a marker-block (# bkit:start ..
  # bkit:end) around its hook commands and failed CI on drift. v2.0.4+ ships
  the hook as a full-file template (Tier 3 seed-or-print). If your file still
  contains bkit:start/bkit:end markers, you can safely delete them — the file
  is yours to own. The block content itself can stay or go.

  --- begin bkit reference .husky/pre-commit ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .husky/pre-commit ---
`;

const HUSKY_PRE_PUSH_MERGE_INSTRUCTIONS = `[bkit] .husky/pre-push exists — bkit will not overwrite. Review the reference below and merge if useful; otherwise keep yours.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  bkit's reference pre-push hook runs \`pnpm typecheck && pnpm test && pnpm format:check\`
  followed by \`pnpm bkit check\` (the same drift gate CI runs — catching it
  locally saves a wasted CI cycle when someone bumps @cbartens/bkit without
  re-running \`bkit install\`). Most consumers using turbo (e.g.
  \`npx turbo run lint typecheck format:check test\`) already cover the first
  three gates — in that case, just add \`pnpm bkit check\` after your existing
  command. If your hook does NOT already run those gates, consider adopting the
  reference, or merging the missing commands into yours.

  Migration note: bkit versions <= 2.0.3 wrote a marker-block (# bkit:start ..
  # bkit:end) around its hook commands and failed CI on drift. v2.0.4+ ships
  the hook as a full-file template (Tier 3 seed-or-print). If your file still
  contains bkit:start/bkit:end markers, you can safely delete them — the file
  is yours to own. The block content itself can stay or go.

  --- begin bkit reference .husky/pre-push ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .husky/pre-push ---
`;

// CLOUD_BOOTSTRAP_MERGE_INSTRUCTIONS removed in BAR-191 follow-up — file is
// now Tier 2 markered-text; writeTier2 updates only the bkit:start/bkit:end
// block and preserves consumer extensions outside it. The cloud-env-customize
// advisory above carries the customization guidance.

const CURSOR_SETTINGS_MERGE_INSTRUCTIONS = `[bkit] .cursor/settings.json exists — bkit will not overwrite consumer Cursor config. Review the reference defaults and merge if useful.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/settings.json. Compare against the bkit reference below.
  Merge any new keys (e.g. plugin allowlists, MCP entries) you want.
  Keep your existing project-specific entries.

  --- begin bkit reference .cursor/settings.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/settings.json ---
`;

// CURSOR_DOCKERFILE_MERGE_INSTRUCTIONS removed in BAR-191 follow-up — file
// is now Tier 2 markered-text. bkit owns the toolchain block (vale + gh +
// jq + python3 + corepack-pinned pnpm); consumers customise Node major,
// Playwright, Supabase CLI, etc. OUTSIDE the markers and bkit preserves
// those across upgrades.

const ENV_EXAMPLE_MERGE_INSTRUCTIONS = `[bkit] .agents/.env.example exists — bkit will not overwrite. Review the reference and merge any new entries.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .agents/.env.example. Compare against the bkit reference below.
  Merge any new token entries you find (GH_TOKEN, GH_BKIT_TOKEN, LINEAR_API_KEY)
  into your existing file. Keep any project-specific additions you have.

  --- begin bkit reference .agents/.env.example ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .agents/.env.example ---
`;

const ENVRC_MERGE_INSTRUCTIONS = `[bkit] .envrc exists — bkit will not overwrite. Ensure it loads .agents/.env via direnv.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .envrc. Compare against the bkit reference below.
  Ensure the file contains \`dotenv_if_exists .agents/.env\` so direnv
  auto-exports the tokens into your shell. Keep any existing lines.
  You can append more \`dotenv_if_exists <path>\` lines to expose additional
  env files (e.g. .env.local, infra/secrets.env); run \`direnv allow\` after.

  --- begin bkit reference .envrc ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .envrc ---
`;

const MCP_ROOT_MERGE_INSTRUCTIONS = `[bkit] .mcp.json exists — bkit will not overwrite. Review the reference defaults and merge if needed.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .mcp.json. Compare against the bkit reference below.
  Keep any project-specific server entries you have added.

  --- begin bkit reference .mcp.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .mcp.json ---
`;

/**
 * Build filtered `.mcp.json` content for the given tracker.
 * - "github"  → keep only the `github` mcpServers entry.
 * - "linear"  → keep only the `linear` mcpServers entry.
 * - "none"    → empty mcpServers object (tracker not wired).
 */
function buildMcpJson(templatePath: string, tracker: IssueTracker): string {
  const template = JSON.parse(fs.readFileSync(templatePath, "utf-8")) as {
    mcpServers?: Record<string, unknown>;
  };
  const all = template.mcpServers ?? {};
  const filtered: Record<string, unknown> = {};
  if (tracker !== "none" && Object.prototype.hasOwnProperty.call(all, tracker)) {
    filtered[tracker] = all[tracker];
  }
  return JSON.stringify({ mcpServers: filtered }, null, 2) + "\n";
}

/**
 * Seed-or-suggest a tracker-filtered MCP JSON file (Tier 3 semantics).
 * Absent → seed with filtered content. Present+different → push advisory.
 */
function seedMcpJson(
  templatePath: string,
  dstPath: string,
  tracker: IssueTracker,
  mergeInstructions: string,
  dryRun: boolean,
  advisories: PreflightFinding[],
  ws: WriteSet,
): { suggested: boolean } {
  if (!fs.existsSync(templatePath)) return { suggested: false };
  const content = buildMcpJson(templatePath, tracker);
  const basename = path.basename(dstPath);
  if (fs.existsSync(dstPath)) {
    const existing = fs.readFileSync(dstPath, "utf-8");
    if (existing !== content) {
      advisories.push({
        id: `tier3-merge-suggested-${basename}`,
        severity: "advisory",
        detect: `${dstPath} exists and differs from the bkit reference. Manual merge required.`,
        action: mergeInstructions.replace(/\{\{TEMPLATE_CONTENT\}\}/g, () => content.trimEnd()),
      });
      return { suggested: true };
    }
    return { suggested: false };
  }
  ws.writes.push({ path: dstPath, action: "write" });
  if (!dryRun) {
    ensureDir(path.dirname(dstPath));
    fs.writeFileSync(dstPath, content, "utf-8");
  }
  return { suggested: false };
}

const CURSOR_MCP_MERGE_INSTRUCTIONS = `[bkit] .cursor/mcp.json exists — bkit will not overwrite. Review the reference defaults and merge if needed.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/mcp.json. Compare against the bkit reference below.
  Ensure the mcpServers object contains entries for both "linear" and "github".
  Keep any project-specific server entries you have added.

  --- begin bkit reference .cursor/mcp.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/mcp.json ---
`;

const CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS = `[bkit] .cursor/environment.json exists — bkit will not overwrite. This file is fully consumer-owned because the \`install\` / \`start\` / \`terminals[]\` / \`env\` fields are typically repo-specific.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .cursor/environment.json. Compare against the bkit reference below.
  Merge new top-level fields if useful; keep your project-specific overrides.

  Typical non-trivial customisations consumers add:
  - Monorepo prebuild: \`"install": "pnpm install --frozen-lockfile && npx turbo run build --filter='./packages/*'"\`
    so workspace packages are compiled before the agent starts.
  - Dev-server terminal + port forwarding: \`env: { PORT: "4000" }\` plus a
    \`terminals[]\` entry that runs \`pnpm turbo dev --filter=web\` with
    \`ports: [4000]\` exposed.
  - \`start\` field with a one-line "read docs/deployments.md before setup"
    nudge so the agent doesn't blindly run dev commands.

  The bkit baseline runs \`pnpm install --frozen-lockfile && vale sync\` (when
  .vale.ini exists). Replace if your monorepo needs prebuild, your repo uses
  npm/yarn/bun, or you don't ship vale.

  --- begin bkit reference .cursor/environment.json ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .cursor/environment.json ---
`;

// ---------------------------------------------------------------------------
// runCiModule — .github/workflows/ci.yml (Tier 3 seed-or-print)
//
// Switched from Tier 2 to Tier 3 in v0.2.1 — appending a complete workflow
// to an existing ci.yml produces duplicate top-level keys (invalid GHA YAML).
// Bkit can't safely YAML-merge, so we seed when absent and print AI-actionable
// merge instructions when present.
// ---------------------------------------------------------------------------

export function runCiModule(ctx: ModuleContext): void {
  const { dryRun, tokens, ws, advisories, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();

  const templatePath = path.join(
    PKG_ROOT,
    ".agents",
    "templates",
    ".github",
    "workflows",
    "ci.yml",
  );
  if (!fs.existsSync(templatePath)) {
    console.warn(`${logPrefix} CI template not found at ${templatePath} — skipping CI module`);
    return;
  }

  // BAR-164 guard: refuse to seed a canonical template that contains a
  // `uses: cbartens/bkit/...@<ref>` reference. While `cbartens/bkit` stays
  // private and consumers live in other GitHub orgs, the runner's GITHUB_TOKEN
  // cannot resolve such a reference and CI fails with "repository not found"
  // before any install step runs. The env-var pattern (GH_BKIT_TOKEN on the
  // install step + .npmrc substitution) is the canonical install flow — see
  // README §"Consumer CI auth". Hard error so the regression is caught at
  // dev/CI time, never written into a consumer repo.
  const templateContent = fs.readFileSync(templatePath, "utf-8");
  const foreignUses = scanForeignBkitUses(templateContent);
  if (foreignUses.length > 0) {
    throw new Error(
      `${logPrefix} canonical CI template contains cross-org private \`uses:\` reference(s) — consumer auth cannot resolve them at action-resolution time. Remove from .agents/templates/.github/workflows/ci.yml and use the env-var pattern (GH_BKIT_TOKEN env on \`pnpm install\`) instead. See README §"Consumer CI auth" / BAR-164. Offending reference(s):\n  - ${foreignUses.join("\n  - ")}`,
    );
  }

  const dstPath = path.join(".github", "workflows", "ci.yml");
  const prevLen = ws.writes.length;
  const result = writeTier3(
    templatePath,
    dstPath,
    dryRun,
    advisories,
    ws,
    CI_YML_MERGE_INSTRUCTIONS,
    tokens,
  );
  if (ws.writes.length > prevLen) {
    console.log(`${logPrefix} ${tag}ci: ${dstPath}`);
  } else if (result.suggested) {
    console.log(`${logPrefix} ${tag}ci: ${dstPath} (exists; AI merge instructions printed)`);
  }

  // bkit-cloud.yml is no longer shipped by `--ci`. Post-CI auto-routing is
  // now opt-in via `bkit install --cloud` (see `runCloudModule` below). The
  // router is inert without ANTHROPIC_API_KEY + LINEAR_API_KEY secrets, GitHub
  // Actions write permissions, and (Cursor half) a dashboard trigger — and it
  // depends on the issue tracker, which is itself opt-in. Shipping it on every
  // `--full` / `--ci` install wired an autonomous router to a tracker that may
  // not be configured. See issue #119 ("Managed Cloud Agents").

  // renovate.json5 is no longer shipped by `--ci`. Renovate is now opt-in via
  // `bkit install --renovate` (phase-gated). See `runRenovateModule` below
  // and issue #123 follow-up for rationale (Renovate App's first scan reads
  // the default branch, so the file must reach `main` before App install —
  // default install can't sequence that).

  // Ensure the typecheck script the workflow calls exists in package.json.
  // `test` is deliberately not managed — too opinionated for a default.
  const typecheckDefault = fs.existsSync("tsconfig.json")
    ? "tsc --noEmit"
    : 'echo "[bkit] typecheck: no tsconfig.json — skipping" >&2';
  const ciScripts = ensurePackageJsonScripts({ typecheck: typecheckDefault }, dryRun, ws);
  if (ciScripts.added.length > 0) {
    console.log(
      `${logPrefix} ${tag}ci: package.json scripts added [${ciScripts.added.join(", ")}]`,
    );
  }
  if (ciScripts.missingPkg) {
    advisories.push({
      id: "ci-package-json-missing",
      severity: "advisory",
      detect: "package.json not found — cannot ensure `typecheck` script.",
      action:
        "The seeded ci.yml will fail until you add a `typecheck` script to package.json. Run `pnpm bkit install --ci` after creating package.json.",
    });
  } else if (ciScripts.malformed) {
    advisories.push({
      id: "ci-package-json-malformed",
      severity: "advisory",
      detect: "package.json failed to parse — cannot ensure `typecheck` script.",
      action: "Fix the JSON syntax error in package.json and re-run `pnpm bkit install`.",
    });
  }
  // The `test` script is the consumer's responsibility — flag if absent so they know.
  if (!dryRun && !ciScripts.missingPkg && !ciScripts.malformed) {
    try {
      const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8")) as {
        scripts?: Record<string, string>;
      };
      if (!pkg.scripts || !pkg.scripts.test) {
        advisories.push({
          id: "ci-no-test-script",
          severity: "advisory",
          detect: "package.json has no `test` script.",
          action:
            'The seeded ci.yml calls `pnpm test` — add a script (e.g. `"test": "vitest run"`) or remove the step from ci.yml.',
        });
      }
    } catch {
      // Already handled above
    }
  }
  // Note: GH_BKIT_TOKEN secret check and Vercel detection are now Phase 3 responsibilities.
  // runPostInstallCheck in bkit-postinstall.ts handles them after writes complete.
}

// ---------------------------------------------------------------------------
// runLintModule — vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore
// ---------------------------------------------------------------------------

export function runLintModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();
  const templatesBase = path.join(PKG_ROOT, ".agents", "templates");

  // .vale.ini — Tier 3 (seed-or-print) since v0.2.1
  // Was Tier 2 but appending a managed-block at EOF puts core options after
  // [glob] sections, which Vale rejects (E201). Tier 3 seeds the whole file
  // when absent and prints AI-actionable merge instructions when present.
  const valeIniSrc = path.join(templatesBase, ".vale.ini");
  if (fs.existsSync(valeIniSrc)) {
    const valeDst = ".vale.ini";
    const prevLen = ws.writes.length;
    const valeRes = writeTier3(
      valeIniSrc,
      valeDst,
      dryRun,
      advisories,
      ws,
      VALE_INI_MERGE_INSTRUCTIONS,
    );
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}lint: ${valeDst}`);
    } else if (valeRes.suggested) {
      console.log(`${logPrefix} ${tag}lint: ${valeDst} (exists; AI merge instructions printed)`);
    }
  }

  // .vale/styles/House/ — Tier 1 (fully managed)
  const valeStylesSrc = path.join(templatesBase, ".vale", "styles", "House");
  if (fs.existsSync(valeStylesSrc)) {
    const valeStylesDst = path.join(".vale", "styles", "House");
    ensureDir(valeStylesDst);
    for (const file of fs.readdirSync(valeStylesSrc)) {
      const srcPath = path.join(valeStylesSrc, file);
      const dstPath = path.join(valeStylesDst, file);
      if (!fs.statSync(srcPath).isFile()) continue;
      const prevLen = ws.writes.length;
      writeTier1(srcPath, dstPath, tokens, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}lint: ${dstPath}`);
      }
    }
  }

  // slop-scan.config.json — Tier 3 (seed-or-print)
  const slopSrc = path.join(templatesBase, "slop-scan.config.json");
  if (fs.existsSync(slopSrc)) {
    const slopDst = "slop-scan.config.json";
    const prevLen = ws.writes.length;
    const slopRes = writeTier3(
      slopSrc,
      slopDst,
      dryRun,
      advisories,
      ws,
      SLOP_SCAN_MERGE_INSTRUCTIONS,
    );
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}lint: ${slopDst}`);
    } else if (slopRes.suggested) {
      console.log(`${logPrefix} ${tag}lint: ${slopDst} (exists; AI merge instructions printed)`);
    }
  }

  // .lintstagedrc.json — Tier 3 (seed-or-print). Pairs with the lint-staged
  // call in the bkit-managed pre-commit hook block; without the config file
  // lint-staged errors out at commit time.
  const lintstagedSrc = path.join(templatesBase, ".lintstagedrc.json");
  if (fs.existsSync(lintstagedSrc)) {
    const lintstagedDst = ".lintstagedrc.json";
    const prevLen = ws.writes.length;
    const lintstagedRes = writeTier3(
      lintstagedSrc,
      lintstagedDst,
      dryRun,
      advisories,
      ws,
      LINTSTAGED_MERGE_INSTRUCTIONS,
    );
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}lint: ${lintstagedDst}`);
    } else if (lintstagedRes.suggested) {
      console.log(
        `${logPrefix} ${tag}lint: ${lintstagedDst} (exists; AI merge instructions printed)`,
      );
    }
  }

  // .prettierignore — Tier 2 hash-comment
  const prettierSrc = path.join(templatesBase, ".prettierignore");
  if (fs.existsSync(prettierSrc)) {
    const prettierDst = ".prettierignore";
    const prevLen = ws.writes.length;
    writeTier2(prettierSrc, prettierDst, tokens, "hash-comment", dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}lint: ${prettierDst}`);
    }
  }

  // Ensure lint scripts the seeded .vale.ini / slop-scan.config / .prettierignore
  // expect actually exist in package.json. Add-if-missing; consumer values win.
  const lintScripts = ensurePackageJsonScripts(
    {
      "format:check": "prettier --check .",
      "lint:prose":
        // F9 (BAR-138): symmetric soft-skip — protect against missing vale
        // binary AND missing referenced packages (e.g. write-good not synced
        // after .vale.ini was rewritten or after a clean checkout). Hard-failing
        // on a missing package would break local commits via the pre-commit
        // hook with no actionable signal.
        'bash -c \'if command -v vale >/dev/null 2>&1 && [ -d .vale/styles/write-good ]; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale missing or .vale/styles/write-good not synced — skipping (run \\`vale sync\\` to enable)"; fi\'',
      "lint:slop": "slop-scan scan .",
    },
    dryRun,
    ws,
  );
  if (lintScripts.added.length > 0) {
    console.log(
      `${logPrefix} ${tag}lint: package.json scripts added [${lintScripts.added.join(", ")}]`,
    );
  }
  if (lintScripts.missingPkg) {
    advisories.push({
      id: "lint-package-json-missing",
      severity: "advisory",
      detect: "package.json not found — cannot ensure lint scripts.",
      action:
        "Configs are installed but ci.yml steps will fail until you add `format:check`, `lint:prose`, `lint:slop` scripts to package.json.",
    });
  } else if (lintScripts.malformed) {
    advisories.push({
      id: "lint-package-json-malformed",
      severity: "advisory",
      detect: "package.json failed to parse — cannot ensure lint scripts.",
      action: "Fix the JSON syntax error in package.json and re-run `pnpm bkit install`.",
    });
  }

  // Ensure devDeps for the tools the lint scripts call. Vale is a system tool
  // (binary) and is documented as a prereq instead of a managed devDep.
  const lintDevDeps = ensurePackageJsonDevDeps(
    {
      prettier: "^3.5.3",
      "slop-scan": "^0.3.0",
      "lint-staged": "^15.2.10",
    },
    dryRun,
    ws,
  );
  if (lintDevDeps.added.length > 0) {
    console.log(
      `${logPrefix} ${tag}lint: package.json devDependencies added [${lintDevDeps.added.join(", ")}] — run \`pnpm install\` to fetch`,
    );
    // Thread devDepsAdded through the WriteSet for Phase 3 detection
    const lastWrite = ws.writes[ws.writes.length - 1];
    if (lastWrite && lastWrite.path === "package.json") {
      lastWrite.devDepsAdded = lintDevDeps.added;
    }
  }

  // vale sync advisory removed in v2.1.0 — duplicated by `vale-package-not-synced`
  // (Phase 3, gated on `vale --version` actually succeeding). The Phase 3 variant
  // is actionable; this one fired on every install regardless of vale presence.
}

// ---------------------------------------------------------------------------
// runGitHooksModule — .husky/pre-commit + .husky/pre-push (Tier 3 seed-or-print)
//
// Switched from Tier 2 (managed-block) to Tier 3 (seed-or-print) in v2.0.4.
// Rationale: imperative hook scripts don't need the additive-merge semantics
// of `.gitignore` / `.prettierignore`. Consumers with their own turbo /
// lint-staged hook content fully replace bkit's commands and would otherwise
// fail the `tier2-text-drift` gate every install. Tier 3 seeds the canonical
// hook for new consumers, prints AI-actionable merge instructions when one
// already exists, and never enforces drift. See KN entry / CHANGELOG 2.0.4.
// ---------------------------------------------------------------------------

const HUSKY_MERGE_INSTRUCTIONS: Record<"pre-commit" | "pre-push", string> = {
  "pre-commit": HUSKY_PRE_COMMIT_MERGE_INSTRUCTIONS,
  "pre-push": HUSKY_PRE_PUSH_MERGE_INSTRUCTIONS,
};

export function runGitHooksModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();
  const huskyTemplatesDir = path.join(PKG_ROOT, ".agents", "templates", ".husky");

  if (!fs.existsSync(huskyTemplatesDir)) {
    console.warn(
      `${logPrefix} .husky templates not found at ${huskyTemplatesDir} — skipping git-hooks module`,
    );
    return;
  }

  ensureDir(".husky");

  for (const hookName of ["pre-commit", "pre-push"] as const) {
    const srcPath = path.join(huskyTemplatesDir, hookName);
    if (!fs.existsSync(srcPath)) continue;
    const dstPath = path.join(".husky", hookName);
    const prevLen = ws.writes.length;
    const result = writeTier3(
      srcPath,
      dstPath,
      dryRun,
      advisories,
      ws,
      HUSKY_MERGE_INSTRUCTIONS[hookName],
      tokens,
    );
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}git-hooks: ${dstPath}`);
      if (!dryRun && fs.existsSync(dstPath)) {
        fs.chmodSync(dstPath, 0o755);
      }
    } else if (result.suggested) {
      console.log(
        `${logPrefix} ${tag}git-hooks: ${dstPath} (exists; AI merge instructions printed)`,
      );
    }
  }

  // Ensure `prepare: husky install` exists so hooks activate on `pnpm install`.
  // Husky 9+ requires this; without it, the .husky/* files exist but never run.
  // Husky 9+: `husky install` was renamed to plain `husky` (legacy form prints
  // "DEPRECATED" warning on every `pnpm install`). Bkit ships the modern form
  // for new consumers; existing consumers with `husky install` keep theirs
  // (consumer-value-wins) — they can manually shorten to silence the warning.
  const hookScripts = ensurePackageJsonScripts({ prepare: "husky" }, dryRun, ws);
  if (hookScripts.added.length > 0) {
    console.log(
      `${logPrefix} ${tag}git-hooks: package.json scripts added [${hookScripts.added.join(", ")}]`,
    );
  }
  if (hookScripts.missingPkg) {
    advisories.push({
      id: "git-hooks-package-json-missing",
      severity: "advisory",
      detect: "package.json not found — cannot ensure `prepare` script.",
      action:
        'Hooks installed but won\'t activate until you add `"prepare": "husky"` to package.json and run `pnpm install`.',
    });
  } else if (hookScripts.malformed) {
    advisories.push({
      id: "git-hooks-package-json-malformed",
      severity: "advisory",
      detect: "package.json failed to parse — cannot ensure `prepare` script.",
      action: "Fix the JSON syntax error in package.json and re-run `pnpm bkit install`.",
    });
  } else if (hookScripts.preserved.includes("prepare")) {
    // Consumer has a custom `prepare` value — note it but don't override.
    // Either `husky` (modern, 9+) or `husky install` (legacy) activates the
    // hooks; the legacy form just emits a deprecation warning on each install.
    advisories.push({
      id: "git-hooks-package-json-preserved-prepare",
      severity: "advisory",
      detect: "package.json `prepare` already set (preserved — consumer value wins).",
      action:
        "Ensure it runs `husky` (or legacy `husky install`) for hooks to activate. The modern form is plain `husky`; `husky install` emits a deprecation warning on each `pnpm install`.",
    });
  }

  // Ensure husky devDep — without it, the `prepare: husky install` script we
  // just added blows up on `pnpm install` with `husky: not found`. Surfaced
  // by BAR-138 Finding 5 during consumer-repo smoke testing.
  const hookDevDeps = ensurePackageJsonDevDeps({ husky: "^9.1.7" }, dryRun, ws);
  if (hookDevDeps.added.length > 0) {
    console.log(
      `${logPrefix} ${tag}git-hooks: package.json devDependencies added [${hookDevDeps.added.join(", ")}] — run \`pnpm install\` to fetch`,
    );
    // husky-devdep-added advisory removed in v2.1.0 — duplicated by the generic
    // `devdeps-need-fetch` Phase 3 advisory which fires for any added devDep.
    // Thread devDepsAdded through the WriteSet for Phase 3 detection.
    const lastWrite = ws.writes[ws.writes.length - 1];
    if (lastWrite && lastWrite.path === "package.json") {
      lastWrite.devDepsAdded = hookDevDeps.added;
    }
  }
}

// ---------------------------------------------------------------------------
// runRenovateModule — opt-in `.github/renovate.json5` (phase-gated)
// ---------------------------------------------------------------------------
//
// Renovate is NOT shipped by default install (--full). It's opt-in via
// `bkit install --renovate` and runs a two-phase flow gated on whether the
// config has reached the remote default branch:
//
//   Phase A — file NOT yet on origin/<DEFAULT_BRANCH>:
//     Writes the file to the working tree and emits a "commit + PR to main,
//     then re-run" advisory. Does NOT print the App-install URL — installing
//     the App before the config reaches the default branch causes Renovate
//     to fire its default onboarding flow (broken; ignores the shipped
//     config). See issue #123 follow-up.
//
//   Phase B — file IS on origin/<DEFAULT_BRANCH>:
//     Re-writes the file (idempotent byte-equal) and emits the App-install
//     URL + activation checklist.

function isRenovateConfigOnDefaultBranch(defaultBranch: string, cwd: string): boolean {
  try {
    execSync(`git cat-file -e origin/${defaultBranch}:.github/renovate.json5`, {
      cwd,
      stdio: ["ignore", "ignore", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

export function runRenovateModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();

  // Mutually exclusive with --dependabot — refuse if Dependabot config exists.
  // Both opening PRs against the same packages is silly and creates noise.
  const dependabotYml = path.join(process.cwd(), ".github", "dependabot.yml");
  const dependabotYaml = path.join(process.cwd(), ".github", "dependabot.yaml");
  if (fs.existsSync(dependabotYml) || fs.existsSync(dependabotYaml)) {
    advisories.push({
      id: "renovate-dependabot-mutually-exclusive",
      severity: "blocker",
      detect:
        "`.github/dependabot.yml` is present — Renovate and Dependabot are mutually exclusive (running both opens competing PRs against the same packages). Refusing to install Renovate.",
      action:
        "Choose one:\n\n" +
        "  A. Switch to Renovate (recommended):\n" +
        "     1. `git rm .github/dependabot.yml` (also `git rm scripts/ci/bkit-set-dependabot.sh` if present).\n" +
        "     2. GitHub UI → Settings → Code security → Dependabot version updates → Disable. Leave Dependabot ALERTS on.\n" +
        "     3. Re-run `pnpm bkit install --renovate`.\n\n" +
        "  B. Keep Dependabot: skip `--renovate`; run `pnpm bkit install --dependabot` to keep using bkit's Dependabot module.",
    });
    return;
  }

  const renovateSrc = path.join(PKG_ROOT, ".agents", "templates", ".github", "renovate.json5");
  if (!fs.existsSync(renovateSrc)) return;

  const renovateDst = path.join(".github", "renovate.json5");
  const prevLen = ws.writes.length;
  writeTier1(renovateSrc, renovateDst, tokens, dryRun, ws);
  if (ws.writes.length > prevLen) {
    console.log(`${logPrefix} ${tag}renovate: ${renovateDst}`);
  }

  // Record the choice so the post-install advisory stays quiet about
  // "undecided dep updater" and the mutual-exclusion check has a record.
  setConsumerBkitField("depUpdater", "renovate", dryRun);

  const defaultBranch = tokens.DEFAULT_BRANCH;
  const onDefault = isRenovateConfigOnDefaultBranch(defaultBranch, process.cwd());

  if (!onDefault) {
    advisories.push({
      id: "renovate-phase-a-pr-to-default-branch",
      severity: "advisory",
      detect: `.github/renovate.json5 is in the working tree but not yet on origin/${defaultBranch}. The Renovate GitHub App's first scan reads the default branch — installing the App before the config lands there triggers a broken onboarding PR that ignores this config (issue #123).`,
      action:
        "Phase A — land the config on the default branch BEFORE installing the Renovate App:\n\n" +
        "  1. Commit the newly-written `.github/renovate.json5`.\n" +
        `  2. Open a PR to your integration branch and merge it through to \`${defaultBranch}\`.\n` +
        `  3. Re-run \`pnpm bkit install --renovate\` once the file is on \`origin/${defaultBranch}\`. The command will detect it and print the App-install URL (Phase B).\n\n` +
        "Do NOT install the Renovate App yet — that's Phase B. Installing it now produces a broken onboarding PR (wrong base branch, ungrouped, redundant root `renovate.json`).",
    });
    return;
  }

  advisories.push({
    id: "renovate-phase-b-install-app",
    severity: "advisory",
    detect: `.github/renovate.json5 is present on origin/${defaultBranch} — ready for Renovate GitHub App activation.`,
    action:
      "Phase B — activate Renovate by installing the GitHub App (one-time, manual, free; bkit cannot automate this — no `gh api` equivalent exists):\n\n" +
      "  1. Open https://github.com/apps/renovate and click Install.\n" +
      '  2. Choose "Only select repositories" → pick this repo.\n' +
      "  3. Grant Renovate read-auth to the private `@cbartens/bkit` package — REQUIRED, else every dependency PR fails CI with `ERR_PNPM_OUTDATED_LOCKFILE`. Renovate resolves the whole workspace (incl. the GitHub Packages `@cbartens/bkit`) to regenerate `pnpm-lock.yaml`; the CI `GH_BKIT_TOKEN` secret is NOT visible to Mend's runner. The shipped config has an inert `hostRules` anchor for `npm.pkg.github.com` — finish it:\n" +
      '     - Mend hosted: dashboard → https://developer.mend.io/github/<owner>/<repo> → Settings → Secrets → add `GH_BKIT_TOKEN` (PAT with `read:packages`). CRITICAL: in the secret dialog, tick "If checked - secret will be used during the scan as an environment variable." — without it the secret is not exposed to the scan and lockfile regen still 401s. Then uncomment `token: "{{ secrets.GH_BKIT_TOKEN }}"` in `.github/renovate.json5`.\n' +
      "     - Self-hosted: set the `RENOVATE_HOST_RULES` env var (or an `encrypted` block). See docs/security.md § Renovate read-auth.\n" +
      '  4. Wait ~5 minutes for Renovate\'s onboarding PR. Verify it targets your integration branch (the shipped config sets `baseBranches: ["dev"]`).\n' +
      "     - If the onboarding PR targets a different branch, adds a redundant root `renovate.json`, or proposes 40+ ungrouped PRs: close it. Renovate scanned a stale commit. Re-trigger from the Mend dashboard at https://developer.mend.io/github/<owner>/<repo>.\n" +
      "  5. (If migrating from Dependabot) GitHub UI → Settings → Code security → Dependabot version updates → Disable. Leave Dependabot ALERTS on (Renovate's `osvVulnerabilityAlerts` surfaces them via the same Security tab).\n" +
      "  6. Merge the onboarding PR. The first batch of grouped update PRs follows on the next scheduled run (Monday ~06:00 UTC).",
  });
}

// ---------------------------------------------------------------------------
// runDependabotModule — opt-in `.github/dependabot.yml` + helper script
// ---------------------------------------------------------------------------
//
// Dependabot is NOT shipped by default install (--full). It's opt-in via
// `bkit install --dependabot` and is mutually exclusive with `--renovate`.
//
// Unlike Renovate, Dependabot is first-party GitHub and does NOT have an
// App-install race condition — the `dependabot.yml` file is read directly
// from the default branch by GitHub's hosted Dependabot service. The only
// out-of-band setup is the repo-level Dependabot toggles (auto-fixes-enabled,
// vulnerability-alerts), which the shipped helper script `bkit-set-dependabot.sh`
// flips via `gh api`.

export function runDependabotModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();

  // Mutually exclusive with --renovate — refuse if Renovate config exists.
  const renovateJson5 = path.join(process.cwd(), ".github", "renovate.json5");
  const renovateJson = path.join(process.cwd(), ".github", "renovate.json");
  if (fs.existsSync(renovateJson5) || fs.existsSync(renovateJson)) {
    advisories.push({
      id: "dependabot-renovate-mutually-exclusive",
      severity: "blocker",
      detect:
        "`.github/renovate.json5` is present — Renovate and Dependabot are mutually exclusive (running both opens competing PRs against the same packages). Refusing to install Dependabot.",
      action:
        "Choose one:\n\n" +
        "  A. Switch to Dependabot:\n" +
        "     1. `git rm .github/renovate.json5`.\n" +
        "     2. Uninstall the Renovate GitHub App at https://github.com/settings/installations → Renovate → Configure → Uninstall.\n" +
        "     3. Re-run `pnpm bkit install --dependabot`.\n\n" +
        "  B. Keep Renovate (recommended — see docs/security.md § Renovate activation): skip `--dependabot`; the existing Renovate setup stays.",
    });
    return;
  }

  // Write Tier 1: dependabot.yml + bkit-set-dependabot.sh.
  const ymlSrc = path.join(PKG_ROOT, ".agents", "templates", ".github", "dependabot.yml");
  const scriptSrc = path.join(
    PKG_ROOT,
    ".agents",
    "templates",
    "scripts",
    "ci",
    "bkit-set-dependabot.sh",
  );
  if (!fs.existsSync(ymlSrc) || !fs.existsSync(scriptSrc)) return;

  const ymlDst = path.join(".github", "dependabot.yml");
  const scriptDst = path.join("scripts", "ci", "bkit-set-dependabot.sh");
  const prevLen = ws.writes.length;
  writeTier1(ymlSrc, ymlDst, tokens, dryRun, ws);
  if (ws.writes.length > prevLen) {
    console.log(`${logPrefix} ${tag}dependabot: ${ymlDst}`);
  }
  const prevLen2 = ws.writes.length;
  writeTier1(scriptSrc, scriptDst, tokens, dryRun, ws);
  if (ws.writes.length > prevLen2) {
    console.log(`${logPrefix} ${tag}dependabot: ${scriptDst}`);
    // Preserve executable bit on the helper script.
    if (!dryRun) {
      try {
        fs.chmodSync(scriptDst, 0o755);
      } catch {
        // non-fatal — surface via advisory below
      }
    }
  }

  // Record the choice (parity with renovate path).
  setConsumerBkitField("depUpdater", "dependabot", dryRun);

  advisories.push({
    id: "dependabot-setup-repo-state",
    severity: "advisory",
    detect:
      "`.github/dependabot.yml` and `scripts/ci/bkit-set-dependabot.sh` are now installed. Dependabot version updates need repo-level state (auto-fixes-enabled, vulnerability-alerts) that the YAML file alone does not set.",
    action:
      "One-shot repo-level setup (idempotent — safe to re-run):\n\n" +
      "    bash scripts/ci/bkit-set-dependabot.sh\n\n" +
      "The script uses `gh api` to enable Dependabot security updates, vulnerability alerts, and the never-auto-merge-on-main policy. Re-run any time the policy needs sanity-checking; use `--dry-run` to preview, `--print` to inspect current state.\n\n" +
      "After commit + merge through to your default branch, Dependabot will start opening PRs on the next scheduled poll (per `schedule:` in dependabot.yml — default weekly).",
  });
}

// ---------------------------------------------------------------------------
// runCloudModule — opt-in cloud-agent integration (issue #119, "Managed Cloud Agents")
// ---------------------------------------------------------------------------
//
// NOT shipped by default install (--full) — opt-in via `bkit install --cloud`, so
// a default install ships ZERO cloud footprint. Owns every file that only matters
// once a human wires a cloud surface:
//
//   - `.github/workflows/bkit-cloud.yml`   — phase-routed GitHub Action. Wakes on CI
//        completion and dispatches the `/bkit-cloud` orchestrator inside a fresh Claude
//        Code session via claude-code-action; the orchestrator routes to the matching
//        phase skill (ship on CI pass, debug on CI fail; design/plan/build via
//        workflow_dispatch). Ships Tier 1 (pure plumbing; routing lives in the mirrored
//        slash command) so auto-overwrite keeps the mirror in lockstep.
//   - `.claude/hooks/cloud-bootstrap.sh`   — Claude Code on the web SessionStart install
//        hook (Tier 2 markered; no-op unless CLAUDE_CODE_REMOTE=true).
//   - `.cursor/Dockerfile`                 — Cursor Background Agent toolchain (Tier 2 markered).
//   - `.cursor/environment.json`           — Cursor Background Agent env config (Tier 3,
//        consumer-owned).
//
// Why opt-in: the workflow is inert without ANTHROPIC_API_KEY + LINEAR_API_KEY repo
// secrets, GitHub Actions write permissions, and (Cursor half) a dashboard trigger —
// and it depends on the issue tracker, which is itself opt-in. The env scaffolding is
// inert until a Claude/Cursor cloud env is wired in the respective dashboard.
// Auto-dispatching cloud agents is a deliberate decision, not a sensible default.

// Render the bkit-cloud.yml template for a specific tracker (issue #138). Substitutes
// the `@@CLOUD_TRACKER_*@@` sentinels so a `github`/`none` repo gets a Linear-free
// workflow (no `LINEAR_API_KEY` secret, `mcp__github__*` instead of `mcp__linear__*`),
// while `linear` keeps the Linear surface. `@@…@@` sentinels avoid clashing with the
// workflow's own `${{ … }}` GitHub expressions.
export function renderCloudWorkflow(raw: string, tracker: IssueTracker): string {
  const isLinear = tracker === "linear";
  const mcp = isLinear ? "mcp__linear__*" : "mcp__github__*";
  const secretNote = isLinear ? ", LINEAR_API_KEY (Linear tracker)" : "";
  // Standalone sentinel line: replaced with the indented Linear secret env line under
  // Linear, or removed entirely (line + newline) for github/none.
  const secretEnvLine = isLinear ? "          LINEAR_API_KEY: ${{ secrets.LINEAR_API_KEY }}\n" : "";
  return raw
    .replace(/@@CLOUD_TRACKER_MCP@@/g, () => mcp)
    .replace(/@@CLOUD_TRACKER_SECRET_NOTE@@/g, () => secretNote)
    .replace(/^@@CLOUD_TRACKER_SECRET_ENV@@\n/gm, () => secretEnvLine);
}

export function runCloudModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const templates = path.join(PKG_ROOT, ".agents", "templates");

  // 1. Phase-routed workflow — `.github/workflows/bkit-cloud.yml` (Tier 1 canonical,
  // rendered tracker-conditional via renderCloudWorkflow — issue #138). Linear-tracker
  // repos keep the `LINEAR_API_KEY` secret + `mcp__linear__*` surface; github/none repos
  // get a Linear-free workflow. The render is deterministic from `issueTracker` (read the
  // same way on install and `bkit check`), so the drift gate stays consistent.
  const workflowSrc = path.join(templates, ".github", "workflows", "bkit-cloud.yml");
  if (!fs.existsSync(workflowSrc)) return;
  const workflowDst = path.join(".github", "workflows", "bkit-cloud.yml");
  {
    const rendered = applyTokens(
      renderCloudWorkflow(fs.readFileSync(workflowSrc, "utf-8"), issueTracker),
      tokens,
    );
    const current = fs.existsSync(workflowDst) ? fs.readFileSync(workflowDst, "utf-8") : null;
    if (current !== rendered) {
      ws.writes.push({ path: workflowDst, action: "write" });
      if (!dryRun) {
        ensureDir(path.dirname(workflowDst));
        fs.writeFileSync(workflowDst, rendered, "utf-8");
      }
      console.log(`${logPrefix} ${tag}cloud: ${workflowDst}`);
    }
  }

  // 2. Claude Code on the web SessionStart install hook — Tier 2 markered.
  // bkit owns the install steps between `# <!-- bkit:start -->` / `# <!-- bkit:end -->`
  // (pnpm install + vale sync); consumers add per-repo steps OUTSIDE the markers. The
  // .claude/settings.json SessionStart entry is guarded (`test -f … || true`) so it
  // no-ops on a --full install without this script.
  {
    const src = path.join(templates, ".claude", "hooks", "cloud-bootstrap.sh");
    const dst = ".claude/hooks/cloud-bootstrap.sh";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cloud: ${dst}`);
        if (!dryRun && fs.existsSync(dst)) {
          fs.chmodSync(dst, 0o755);
        }
      }
    }
  }

  // 3. Cursor Background Agent Dockerfile — Tier 2 markered. bkit owns the toolchain
  // block (vale + gh + jq + python3 + corepack-pinned pnpm); consumers customise Node
  // major, Playwright, Supabase CLI, etc. OUTSIDE the markers.
  {
    const src = path.join(templates, ".cursor", "Dockerfile");
    const dst = ".cursor/Dockerfile";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cloud: ${dst}`);
      }
    }
  }

  // 4. Cursor Background Agent env config — Tier 3 seed-or-print (fully consumer-owned).
  {
    const src = path.join(templates, ".cursor", "environment.json");
    const dst = ".cursor/environment.json";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      const result = writeTier3(
        src,
        dst,
        dryRun,
        advisories,
        ws,
        CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS,
      );
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cloud: ${dst}`);
      } else if (result.suggested) {
        console.log(`${logPrefix} ${tag}cloud: ${dst} (exists; AI merge instructions printed)`);
      }
    }
  }

  // Record the choice so the post-install advisory stays quiet about
  // "undecided cloud agents" — file presence is the primary signal.
  setConsumerBkitField("cloudAgents", "enabled", dryRun);

  // Advisory 1 — cloud env scaffolding customisation (repo files + dashboard env vars).
  // Tracker-aware: env var list differs by issueTracker.
  const trackerEnvNote =
    issueTracker === "github"
      ? "  - Tracker env vars (GitHub): No tracker PAT needed. Run `gh auth login` once for CLI surface. MCP auth is browser OAuth (automatic on first tool call). Set `GH_TOKEN` (fine-grained PAT for GitHub MCP server).\n"
      : issueTracker === "linear"
        ? "  - Tracker env vars (Linear): `LINEAR_API_KEY` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session — don't hardcode.\n"
        : "  - Tracker env vars: tracker not wired (`bkit.issueTracker` = `none`). Run `bkit install --tracker=github` to enable. GitHub tracker uses browser OAuth — no PAT required.\n";
  advisories.push({
    id: "cloud-env-customize",
    severity: "advisory",
    detect:
      "Cloud env config splits across the repo (scripts + Dockerfile, bkit-managed) and the online dashboards (env vars + auth tokens, manual). Claude Code on the web reads its setup script + env vars from the Claude app; Cursor Background Agents read `.cursor/Dockerfile` + `.cursor/environment.json` from the repo but env vars from Cursor Settings.",
    action:
      "Three locations to touch — full recipe in `.agents/cloud.md`.\n\n" +
      "IN REPO (Tier 2 markered; bkit owns content between `# <!-- bkit:start -->` and `# <!-- bkit:end -->`; consumer customises outside):\n" +
      "  - `.cursor/Dockerfile`: change Node major above the bkit block if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps below.\n" +
      "  - `.claude/hooks/cloud-bootstrap.sh`: add repo-specific install steps after the bkit:end marker (Supabase start, turbo prebuild, etc. — examples inlined).\n" +
      "  - `.cursor/environment.json`: Tier 3, fully consumer-owned — set `install` / `start` / `terminals[]` / `env` for your stack.\n\n" +
      "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
      "  - Name: `bkit-shared` (or per-repo).\n" +
      "  - Setup script: paste from `.agents/cloud.md` § Setup script (installs vale 3.9.1 + gh + corepack-pinned pnpm 10.33.0).\n" +
      "  - Environment variables: `GH_TOKEN` (fine-grained PAT), `GH_BKIT_TOKEN` (classic PAT with read:packages), `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`.\n" +
      trackerEnvNote +
      "  - Network access: `Trusted` (default). One env can be reused across bkit + every consumer repo.\n\n" +
      "IN CURSOR APP (Cursor → Settings → Background Agents → Environment Variables):\n" +
      "  - `GH_TOKEN`, `GH_BKIT_TOKEN`.\n" +
      trackerEnvNote +
      "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.",
  });

  // Advisory 2 — phase-routed workflow setup. The GHA workflow is the Claude half;
  // the Cursor half (dashboard trigger + paste-once prompt) is manual. Tracker-conditional:
  // the Linear secret line + "in Linear" phrasing appear only under the Linear tracker (#138).
  const isLinearCloud = issueTracker === "linear";
  const trackerSecretLine = isLinearCloud
    ? "  - Confirm `LINEAR_API_KEY` is set (the workflow reads the `Auto` opt-in label and appends comments).\n"
    : "";
  const trackerLabelLine = isLinearCloud
    ? "  - Confirm the issue is labelled `Auto` in Linear before pushing the build commit — without the label the workflow exits no-op.\n\n"
    : "  - Confirm the issue carries the `Auto` label before pushing the build commit — without it the workflow exits no-op.\n\n";
  // OPTIONAL manual trigger (GitHub tracker only): the `@claude` mention path. Run
  // `/install-github-app` to add it alongside the CI-driven + workflow_dispatch paths.
  // Experimental until verified live — the runner must load the bkit skill mirror and
  // allow the phase skill. GitHub-gated because you mention on a GitHub issue/PR.
  const mentionTipLine = isLinearCloud
    ? ""
    : "  - OPTIONAL (manual launch) — run `/install-github-app` (Claude Code CLI) to add `@claude` mention launches: comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to start a phase from the tracker UI, alongside the CI-driven and `workflow_dispatch` paths. It coexists with `bkit-cloud.yml` (different trigger events) and provides the runner's GitHub identity for the `mcp__github__*` surface. Verify with one live `@claude` mention before relying on it — the runner must load the bkit skill mirror and allow the phase skill.\n";
  advisories.push({
    id: "bkit-cloud-setup",
    severity: "advisory",
    detect:
      "`.github/workflows/bkit-cloud.yml` is in place (Claude half of the phase-routed cloud workflow). The Cursor half is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
    action:
      "Full recipe in `.agents/cloud.md` § Post-CI auto-routing.\n\n" +
      "IN GITHUB (Claude half):\n" +
      "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**. Repo cannot exceed org. If this is skipped, `actions/checkout` 403s on the first fire — the workflow declares `permissions: contents: write` but the org/repo ceiling overrides it.\n" +
      "  - Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets and variables → Actions). Used by `claude-code-action@v1`.\n" +
      mentionTipLine +
      trackerSecretLine +
      "  - Do NOT add `GH_BKIT_TOKEN` to this workflow — it is package-install scoped and has no access to the consumer repo. Repo git/gh ops use the auto-provided `github.token` via the workflow's `permissions:` block.\n" +
      trackerLabelLine +
      "IN CURSOR DASHBOARD (Cursor half):\n" +
      "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
      "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
      "  - Prompt (paste literally, no edits): `/bkit-cloud $CI_STATUS $PR_NUMBER` — Cursor substitutes the variables from the trigger payload.\n" +
      "  - Allowed concurrency: latest-supersedes (newer CI completion cancels in-flight runs).\n\n" +
      "Both halves invoke the same `/bkit-cloud` orchestrator (lives in `.cursor/commands/bkit-cloud.md` + `.claude/commands/bkit-cloud.md`, mirrored from `.agents/workflows/bkit-cloud.md` on each `pnpm bkit install`). Routing logic updates flow to both clouds automatically — the dashboard prompt itself never needs to change.",
  });
}

// ---------------------------------------------------------------------------
// MODULE_REGISTRY — maps ModuleFlag → ModuleFn
// ---------------------------------------------------------------------------

export const MODULE_REGISTRY: Partial<Record<ModuleFlag, ModuleFn>> = {
  core: runCoreModule,
  claude: runClaudeModule,
  cursor: runCursorModule,
  ci: runCiModule,
  lint: runLintModule,
  "git-hooks": runGitHooksModule,
  renovate: runRenovateModule,
  dependabot: runDependabotModule,
  cloud: runCloudModule,
  // "full" is never directly in the registry — resolveModules expands it to all modules
};

// Canonical dispatch order
export const MODULE_DISPATCH_ORDER: ModuleFlag[] = [
  "core",
  "claude",
  "cursor",
  "ci",
  "lint",
  "git-hooks",
  "renovate",
  "dependabot",
  "cloud",
];

/**
 * Dispatch modules in canonical order.
 * ctx.ws is populated by each module fn; ctx.advisories accumulates findings flushed by caller.
 * After all modules complete, ctx.postDispatch callbacks are run in order.
 */
export function dispatchModules(modules: Set<ModuleFlag>, ctx: ModuleContext): void {
  for (const flag of MODULE_DISPATCH_ORDER) {
    if (!modules.has(flag)) continue;
    const fn = MODULE_REGISTRY[flag];
    if (!fn) continue;
    fn(ctx);
  }
  // Run deferred finalisation callbacks (e.g. .bkit-version write) only after all modules succeed.
  for (const cb of ctx.postDispatch) {
    cb();
  }
}
