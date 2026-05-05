// bkit-modules.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, printSink, ws }
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → ci → lint → git-hooks
// .bkit-version is written LAST — in postDispatch after ALL modules complete (MED-4).

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { writeTier1, writeTier2, writeTier3, type WriteSet } from "./bkit-tiers.js";
import type { TokenMap } from "./bkit-tokens.js";
import type { ModuleFlag } from "./bkit-cli.js";
import { runPayload, applyT1, applyT2, applyT3 } from "./bkit-install.js";

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

// Resolve the package root at runtime (same logic as bkit-init.ts).
function getPkgRoot(): string {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  return scriptDir.endsWith(`${path.sep}.agents${path.sep}scripts`)
    ? path.resolve(scriptDir, "..", "..")
    : path.resolve(scriptDir, "..");
}

// ---------------------------------------------------------------------------
// Module context
// ---------------------------------------------------------------------------

export interface ModuleContext {
  dryRun: boolean;
  tokens: TokenMap;
  modelLookup: Map<string, string>;
  printSink: string[];
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
const CORE_TEMPLATE_DIRS = new Set(["docs"]);
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

  // Note: .agents/ subtemplates in templates/.agents/ are intentionally NOT processed here.
  // They are handled by copyAdditive (which copies PKG_AGENTS → consumer .agents/ additively).
  // Processing them here would cause dry-run parity issues since copyAdditive skips existing files
  // in live mode but runCoreTemplates would re-record them in dry-run mode.
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
const COPY_EXCLUDE = new Set(["skills", "scripts", "README.md", ".bkit-version"]);

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
    if (fs.existsSync(dst)) return 0;
    if (!dryRun) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
      fs.chmodSync(dst, stats.mode);
    }
    log(path.relative(relRoot, dst));
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
  const { dryRun, ws, printSink, logPrefix, postDispatch } = ctx;
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
  postDispatch.push(() => {
    let needsVersionWrite = !fs.existsSync(versionFile);
    if (!needsVersionWrite) {
      const existing = fs.readFileSync(versionFile, "utf-8").trim();
      if (existing !== pkgVersion) needsVersionWrite = true;
    }
    if (needsVersionWrite) {
      if (!dryRun) {
        fs.mkdirSync(target, { recursive: true });
        fs.writeFileSync(versionFile, pkgVersion + "\n", "utf-8");
      }
      console.log(
        `${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`,
      );
      ws.writes.push({ path: versionFile, action: "write" });
    }
  });

  // 5. First-run extra logging (only when .bkit-version was absent at start of install)
  if (isFirstInstall) {
    // Build the script block as a proper JSON object so values are copy-paste safe.
    const scriptEntries = JSON.stringify(
      {
        "lint:prose":
          'bash -c \'if command -v vale >/dev/null 2>&1; then vale $(find . -name "*.md" -not -path "*/node_modules/*"); else echo "[bkit] vale not in PATH — skipping"; fi\'',
        "lint:slop": "slop-scan scan .",
        "format:check": "prettier --check .",
        prepare: "husky install",
      },
      null,
      2,
    )
      .split("\n")
      .slice(1, -1) // strip outer { }
      .map((l) => `   ${l}`)
      .join("\n");

    printSink.push(
      `
[bkit] First install detected (.bkit-version was absent). Post-install steps:

1. Add BKIT_READ_TOKEN to your GitHub Actions repository secrets:
   - Create a fine-grained PAT with Contents: read on cbartens/bkit
   - GitHub Settings → Secrets and variables → Actions → New repository secret
   - Name: BKIT_READ_TOKEN
   - See README.md ## Consumer CI auth for full setup.

2. Add these scripts to your package.json "scripts" block (copy-paste ready):
${scriptEntries}

3. Add to pnpm-workspace.yaml or package.json:
   onlyBuiltDependencies: ["@cbartens/bkit"]
`,
    );
  }
}

// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------

const BKIT_PREFIX = "bkit-";

export function runClaudeModule(ctx: ModuleContext): void {
  const { dryRun, tokens, ws, logPrefix } = ctx;
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

  // Tier 1 — fully managed: settings.json + preflight hook
  const PKG_ROOT = getPkgRoot();
  const claudeTemplates = path.join(PKG_ROOT, ".agents", "templates", ".claude");
  const tier1Files: Array<[string, string]> = [
    [path.join(claudeTemplates, "settings.json"), ".claude/settings.json"],
    [path.join(claudeTemplates, "hooks", "preflight.sh"), ".claude/hooks/preflight.sh"],
  ];
  for (const [src, dst] of tier1Files) {
    if (!fs.existsSync(src)) continue;
    const prevLen = ws.writes.length;
    writeTier1(src, dst, tokens, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}claude: ${dst}`);
    }
  }
}

// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------

export function runCursorModule(ctx: ModuleContext): void {
  const { dryRun, tokens, modelLookup, printSink, ws, logPrefix } = ctx;
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

  // Tier 1 — fully managed: hooks.json, preflight, shared rules
  const PKG_ROOT = getPkgRoot();
  const cursorTemplates = path.join(PKG_ROOT, ".agents", "templates", ".cursor");
  const tier1Files: Array<[string, string]> = [
    [path.join(cursorTemplates, "hooks.json"), ".cursor/hooks.json"],
    [path.join(cursorTemplates, "hooks", "preflight.sh"), ".cursor/hooks/preflight.sh"],
    [
      path.join(cursorTemplates, "rules", "00-shared-rules.mdc"),
      ".cursor/rules/00-shared-rules.mdc",
    ],
  ];
  for (const [src, dst] of tier1Files) {
    if (!fs.existsSync(src)) continue;
    const prevLen = ws.writes.length;
    writeTier1(src, dst, tokens, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}cursor: ${dst}`);
    }
  }

  // Tier 3 — seed-or-print: settings.json + consumer infra files
  const tier3Files: Array<[string, string]> = [
    [path.join(cursorTemplates, "settings.json"), ".cursor/settings.json"],
    [path.join(cursorTemplates, "Dockerfile"), ".cursor/Dockerfile"],
    [path.join(cursorTemplates, "environment.json"), ".cursor/environment.json"],
  ];
  for (const [src, dst] of tier3Files) {
    if (!fs.existsSync(src)) continue;
    const prevLen = ws.writes.length;
    const result = writeTier3(src, dst, dryRun, printSink, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}cursor: ${dst}`);
    } else if (result.suggested) {
      console.log(`${logPrefix} ${tag}cursor: ${dst} (exists; suggestion printed)`);
    }
  }
}

// ---------------------------------------------------------------------------
// runCiModule — .github/workflows/ci.yml (Tier 2 hash-comment)
// ---------------------------------------------------------------------------

export function runCiModule(ctx: ModuleContext): void {
  const { dryRun, tokens, ws, printSink, logPrefix } = ctx;
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

  const dstPath = path.join(".github", "workflows", "ci.yml");
  const prevLen = ws.writes.length;
  writeTier2(templatePath, dstPath, tokens, "hash-comment", dryRun, ws);
  if (ws.writes.length > prevLen) {
    console.log(`${logPrefix} ${tag}ci: ${dstPath}`);
  }

  // Always remind the user which package.json scripts the CI workflow expects.
  // These scripts are seeded by --lint; --ci alone does NOT add them.
  printSink.push(
    `[bkit] ci: the generated ci.yml invokes the following package.json scripts — ensure they exist (run bkit install --lint to seed them, or add manually):
   "lint:prose": "bash -c 'if command -v vale >/dev/null 2>&1; then vale $(find . -name \"*.md\" -not -path \"*/node_modules/*\"); else echo \"[bkit] vale not in PATH — skipping\"; fi'"
   "lint:slop": "slop-scan scan ."
   "format:check": "prettier --check ."`,
  );
}

// ---------------------------------------------------------------------------
// runLintModule — vale.ini + .vale/styles/House/ + slop-scan.config.json + .prettierignore
// ---------------------------------------------------------------------------

export function runLintModule(ctx: ModuleContext): void {
  const { dryRun, tokens, printSink, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const PKG_ROOT = getPkgRoot();
  const templatesBase = path.join(PKG_ROOT, ".agents", "templates");

  // .vale.ini — Tier 2 hash-comment
  const valeIniSrc = path.join(templatesBase, ".vale.ini");
  if (fs.existsSync(valeIniSrc)) {
    const valeDst = ".vale.ini";
    const prevLen = ws.writes.length;
    writeTier2(valeIniSrc, valeDst, tokens, "hash-comment", dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}lint: ${valeDst}`);
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
    writeTier3(slopSrc, slopDst, dryRun, printSink, ws);
    if (fs.existsSync(slopDst) || dryRun) {
      // Already logged by writeTier3 if it wrote
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
}

// ---------------------------------------------------------------------------
// runGitHooksModule — .husky/pre-commit + .husky/pre-push (Tier 2 hash-comment)
// ---------------------------------------------------------------------------

export function runGitHooksModule(ctx: ModuleContext): void {
  const { dryRun, tokens, printSink, ws, logPrefix } = ctx;
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

  for (const hookName of ["pre-commit", "pre-push"]) {
    const srcPath = path.join(huskyTemplatesDir, hookName);
    if (!fs.existsSync(srcPath)) continue;
    const dstPath = path.join(".husky", hookName);
    const prevLen = ws.writes.length;
    writeTier2(srcPath, dstPath, tokens, "hash-comment", dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}git-hooks: ${dstPath}`);
      // Ensure hook is executable after write
      if (!dryRun && fs.existsSync(dstPath)) {
        fs.chmodSync(dstPath, 0o755);
      }
    }
  }

  // Print-sink: suggest prepare script
  printSink.push(
    '[bkit] git-hooks: add "prepare": "husky install" to your package.json scripts to activate hooks.',
  );
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
 * ctx.ws is populated by each module fn; printSink is flushed by caller.
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
