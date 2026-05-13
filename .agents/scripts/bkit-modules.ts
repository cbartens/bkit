// bkit-modules.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, printSink, ws }
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → ci → lint → git-hooks
// .bkit-version is written LAST — in postDispatch after ALL modules complete (MED-4).

import * as fs from "node:fs";
import * as path from "node:path";
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
import type { TokenMap } from "./bkit-tokens.js";
import type { ModuleFlag } from "./bkit-cli.js";
import { runPayload, applyT1, applyT2, applyT3 } from "./bkit-install.js";
import type { PreflightFinding } from "./bkit-preflight.js";
import { getPkgRoot } from "./bkit-paths.js";
import { getInstallManifest } from "./bkit-manifest.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
}

export type ModuleFn = (ctx: ModuleContext) => void;

// ---------------------------------------------------------------------------
// Core template files — directories/basenames owned ONLY by core module.
// These are templates that don't belong to ci/lint/git-hooks/claude/cursor modules.
// ---------------------------------------------------------------------------

// Top-level template directories/files that belong to core (not other modules)
const CORE_TEMPLATE_DIRS = new Set(["docs", ".agents", "scripts"]);
// Top-level template files (non-directory) that belong to core
const CORE_TEMPLATE_FILES = new Set(["AGENTS.md", "CLAUDE.md", "gitignore"]);
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
      // Remap (e.g. gitignore → .gitignore)
      const destName = name === "gitignore" ? ".gitignore" : name;
      const dstPath = destName;
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
    const srcPath = path.join(srcDir, ent.name);
    const relPath = path.join(relBase, ent.name);
    if (ent.isDirectory()) {
      processCoreTemplateDir(srcPath, relPath, dryRun, tokens, ws, logPrefix);
    } else if (ent.isFile()) {
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
// cannot edit. The invariant is asserted by templates.test.ts.
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

  const pairs: Array<[string, string]> = [
    [".agents/workflows", ".claude/commands"],
    [".agents/prompts", ".claude/agents"],
  ];

  for (const [src, dest] of pairs) {
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      if (installFile(path.join(src, f), path.join(dest, f), null, dryRun)) {
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

  // Markered-text — cloud-bootstrap.sh (Tier 2 managed block).
  // SessionStart hook for Claude Code on the web. bkit owns the install steps
  // between `# <!-- bkit:start -->` and `# <!-- bkit:end -->` (pnpm install +
  // vale sync); consumers add per-repo install steps OUTSIDE the markers.
  // Switched from Tier 3 (byte-equal-text seed-or-print) in BAR-191 follow-up
  // so bkit can ship base updates without trampling consumer extensions.
  {
    const src = path.join(claudeTemplates, "hooks", "cloud-bootstrap.sh");
    const dst = ".claude/hooks/cloud-bootstrap.sh";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${dst}`);
        if (!dryRun && fs.existsSync(dst)) {
          fs.chmodSync(dst, 0o755);
        }
      }

      // Always emit cloud-env-customize advisory pointing consumers at
      // `.agents/cloud.md` for the paste-into-claude.ai recipe AND the Cursor
      // Background Agents setup. The repo hooks are half the picture; the
      // cloud-side setup script (Claude) + Dockerfile (Cursor) are the other
      // half. Both clouds are now aligned on vale 3.9.1 + pnpm 10.33.0 + gh.
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
          "  - Environment variables: `GH_TOKEN` (fine-grained PAT), `GH_BKIT_TOKEN` (classic PAT with read:packages), `LINEAR_API_KEY`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`.\n" +
          "  - Network access: `Trusted` (default). One env can be reused across bkit + every consumer repo.\n\n" +
          "IN CURSOR APP (Cursor → Settings → Background Agents → Environment Variables):\n" +
          "  - `LINEAR_API_KEY`, `GH_TOKEN`, `GH_BKIT_TOKEN`. `LINEAR_ISSUE_ID` is injected per-session by the Linear integration — don't hardcode.\n" +
          "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------

export function runCursorModule(ctx: ModuleContext): void {
  const { dryRun, tokens, modelLookup, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  // Commands: T1 + T2
  {
    const src = ".agents/workflows";
    const dest = ".cursor/commands";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) => applyT2(applyT1(c));
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

  // Markered-text — manifest format: "markered-text" — preflight hook + shared rules + Dockerfile.
  // All use html-comment markers (# <!-- bkit:start --> / # <!-- bkit:end -->).
  // Uses writeTier2 to update only the bkit-managed block; consumer content outside
  // markers is preserved. Dockerfile switched from Tier 3 to Tier 2 in BAR-191 follow-up
  // so bkit can ship base-toolchain updates without trampling consumer Node-version /
  // Playwright / Supabase / monorepo customisations.
  {
    const markeredFiles: Array<[string, string]> = [
      [path.join(cursorTemplates, "hooks", "preflight.sh"), ".cursor/hooks/preflight.sh"],
      [
        path.join(cursorTemplates, "rules", "00-shared-rules.mdc"),
        ".cursor/rules/00-shared-rules.mdc",
      ],
      [path.join(cursorTemplates, "Dockerfile"), ".cursor/Dockerfile"],
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
  // `.cursor/environment.json` stays Tier 3 because the `install` / `start` / `terminals[]`
  // fields are typically completely consumer-owned (monorepos commonly prebuild
  // package workspaces in `install`, set `env.PORT`, and expose dev-server ports
  // via `terminals[]`). Splitting it on a marker isn't worth the JSON complexity.
  const tier3Files: Array<[string, string, string]> = [
    [
      path.join(cursorTemplates, "settings.json"),
      ".cursor/settings.json",
      CURSOR_SETTINGS_MERGE_INSTRUCTIONS,
    ],
    [
      path.join(cursorTemplates, "environment.json"),
      ".cursor/environment.json",
      CURSOR_ENVIRONMENT_MERGE_INSTRUCTIONS,
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

const CI_ROUTER_YML_MERGE_INSTRUCTIONS = `[bkit] .github/workflows/bkit-ci-router.yml exists — bkit will not overwrite. Reference shown below for comparison only.

INSTRUCTIONS FOR AN AI AGENT (copy-paste this whole block into Claude/Cursor/etc.):

  Open .github/workflows/bkit-ci-router.yml. The bkit reference is thin
  plumbing — \`workflow_run\` on CI completion, branch filter \`feat/**\`,
  dispatches \`/bkit-ci-router\` via \`anthropics/claude-code-action@v1\`. All
  routing decisions live in the mirrored slash-command orchestrator at
  \`.claude/commands/bkit-ci-router.md\` (Tier 1, fully bkit-managed). If your
  router YAML diverges intentionally (extra branch filters, extra label
  gates, extra secret env), keep your version. If it has stale routing
  logic embedded in the YAML body itself, prefer the bkit reference: the
  orchestrator file already handles stale-run guards, Linear opt-in, and
  ship/debug dispatch — duplicating that logic in YAML is a drift hazard.

  Required repo secrets: \`ANTHROPIC_API_KEY\`, \`LINEAR_API_KEY\`,
  \`GH_BKIT_TOKEN\`. Required Linear label on the issue at build time: \`Auto\`
  (opt-in — router exits no-op without it).

  --- begin bkit reference .github/workflows/bkit-ci-router.yml ---
{{TEMPLATE_CONTENT}}
  --- end bkit reference .github/workflows/bkit-ci-router.yml ---
`;

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

  bkit's reference pre-push hook runs \`pnpm typecheck && pnpm test && pnpm format:check\`.
  Most consumers using turbo (e.g. \`npx turbo run lint typecheck format:check test\`)
  already cover the equivalent — in that case, ignore this advisory and keep your
  existing hook. If your hook does NOT already run those three gates, consider
  adopting the reference, or merging the missing commands into yours.

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

  // bkit-ci-router.yml — Tier 3 seed-or-print. Thin GHA plumbing that wakes on
  // CI completion and dispatches the `/bkit-ci-router` orchestrator inside a
  // fresh Claude Code session via claude-code-action. Cursor consumers don't
  // need this workflow — they configure an equivalent trigger in the Cursor
  // cloud agents dashboard (see `.agents/cloud.md` § Post-CI auto-routing).
  const ciRouterSrc = path.join(
    PKG_ROOT,
    ".agents",
    "templates",
    ".github",
    "workflows",
    "bkit-ci-router.yml",
  );
  if (fs.existsSync(ciRouterSrc)) {
    const ciRouterDst = path.join(".github", "workflows", "bkit-ci-router.yml");
    const ciRouterPrev = ws.writes.length;
    const ciRouterResult = writeTier3(
      ciRouterSrc,
      ciRouterDst,
      dryRun,
      advisories,
      ws,
      CI_ROUTER_YML_MERGE_INSTRUCTIONS,
    );
    if (ws.writes.length > ciRouterPrev) {
      console.log(`${logPrefix} ${tag}ci: ${ciRouterDst}`);
    } else if (ciRouterResult.suggested) {
      console.log(`${logPrefix} ${tag}ci: ${ciRouterDst} (exists; AI merge instructions printed)`);
    }

    // Always emit the dual-IDE setup advisory. The GHA workflow is the Claude
    // half; the Cursor half (dashboard trigger + paste-once prompt) is manual.
    advisories.push({
      id: "ci-router-setup",
      severity: "advisory",
      detect:
        "`.github/workflows/bkit-ci-router.yml` is in place (Claude half of post-CI auto-routing). The Cursor half is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
      action:
        "Full recipe in `.agents/cloud.md` § Post-CI auto-routing.\n\n" +
        "IN GITHUB (Claude half):\n" +
        "  - Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets and variables → Actions). Used by `claude-code-action@v1`.\n" +
        "  - Confirm `LINEAR_API_KEY` and `GH_BKIT_TOKEN` are already set (preflight + bkit package install both need them).\n" +
        "  - Confirm the issue is labelled `Auto` in Linear before pushing the build commit — without the label the router exits no-op.\n\n" +
        "IN CURSOR DASHBOARD (Cursor half):\n" +
        "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
        "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
        "  - Prompt (paste literally, no edits): `/bkit-ci-router $CI_STATUS $PR_NUMBER` — Cursor substitutes the variables from the trigger payload.\n" +
        "  - Allowed concurrency: latest-supersedes (newer CI completion cancels in-flight router runs).\n\n" +
        "Both halves invoke the same `/bkit-ci-router` orchestrator (lives in `.cursor/commands/bkit-ci-router.md` + `.claude/commands/bkit-ci-router.md`, mirrored from `.agents/workflows/bkit-ci-router.md` on each `pnpm bkit install`). Routing logic updates flow to both clouds automatically — the dashboard prompt itself never needs to change.",
    });
  }

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

  // F7: vale is a system binary, not an npm package. The seeded .vale.ini
  // references the `write-good` Vale package which Vale downloads via
  // `vale sync`. Print a one-time hint after writing .vale.ini so the consumer
  // knows to run sync before lint:prose works against the seeded styles.
  advisories.push({
    id: "vale-sync-recommended",
    severity: "advisory",
    detect:
      ".vale.ini references the `write-good` Vale package which requires `vale sync` to download.",
    action:
      "Run `vale sync` (one-time per repo) to download the write-good package. Vale itself is a system binary; install via brew/apt/etc. The lint:prose script soft-skips when vale isn't on PATH, so CI passes either way.",
  });
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
    advisories.push({
      id: "git-hooks-husky-devdep-added",
      severity: "advisory",
      detect: "husky added to package.json devDependencies.",
      action: "Run `pnpm install` to fetch husky; husky install will then activate the hooks.",
    });
    // Thread devDepsAdded through the WriteSet for Phase 3 detection
    const lastWrite = ws.writes[ws.writes.length - 1];
    if (lastWrite && lastWrite.path === "package.json") {
      lastWrite.devDepsAdded = hookDevDeps.added;
    }
  }
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
