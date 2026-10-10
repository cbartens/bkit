// install/modules/core.ts — the core module: core templates, the canonical `.bkit/*.md` docs,
// package.json gate scripts and `.bkit/version` (written last, in postDispatch). Also the
// lint module (--typescript) and the file helpers every host renderer shares.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  writeTier1,
  writeTier2,
  ensurePackageJsonScripts,
  ensureDir,
  type WriteSet,
} from "../write.js";
import { readBkitVersion, writeBkitVersion, hashFile } from "../version-file.js";
import type { TokenMap } from "../placeholders.js";
import { remapTemplateDest, isTemplate, syncTemplateCopies } from "../template-copies.js";
import type { PreflightFinding } from "../../checks/before/index.js";
import {
  getPkgRoot,
  getTemplatesRoot,
  getBkitDocsRoot,
  TEMPLATE_COPIES_DIR,
} from "../../shared/package-roots.js";
import { getInstallManifest, BKIT_GATE_SCRIPTS, BKIT_OPTIONAL_GATES } from "../manifest.js";
import type { ModuleContext } from "./index.js";

export function listMdFiles(dir: string, prefix?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => (prefix ? f.startsWith(prefix) : true));
}

export function installFile(
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

// Hard allowlist: orphan pruning may ONLY remove files from these generated IDE
// mirror dirs. Mirror SOURCES live package-side under `.bkit/{workflows,prompts}`.
const ORPHAN_PRUNE_DIRS = [
  ".claude/agents",
  ".claude/commands",
  ".cursor/agents",
  ".cursor/commands",
] as const;

export function removeOrphans(
  destDir: string,
  sourceFiles: Set<string>,
  dryRun: boolean,
  prefix?: string,
): string[] {
  const resolved = path.resolve(destDir);
  if (!ORPHAN_PRUNE_DIRS.some((d) => path.resolve(d) === resolved)) {
    throw new Error(`removeOrphans: refusing orphan removal outside allowlist: ${destDir}`);
  }
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

// ---------------------------------------------------------------------------
// Core template files — directories/basenames owned ONLY by core module.
// These are templates that don't belong to the lint/claude/cursor modules.
// ---------------------------------------------------------------------------

// Top-level template directories/files that belong to core (not other modules)
const CORE_TEMPLATE_DIRS = new Set(["docs", ".agents", ".bkit", "scripts"]);

// Top-level template files (non-directory) that belong to core.
// `gitignore` is stored dot-less (npm strips a literal `.gitignore`); `.gitattributes`
// is stored with its dot (npm does not strip it) — see remapTemplateDest / NPM_STRIP_REMAP.
// CLAUDE.md is NOT here: it belongs to the `claude` module (a Claude-Code-only root
// redirect, the analog of Cursor's .cursor/rules/00-shared-rules.mdc) — runClaudeModule
// emits it. AGENTS.md (cross-host dispatch router) stays core.
const CORE_TEMPLATE_FILES = new Set(["AGENTS.md", "gitignore", ".gitattributes"]);

// Files inside the .agents/ and .bkit/ subtemplate dirs that another module writes —
// skip in the core templates pass to avoid double-recording them in the WriteSet.
// `.bkit/.env.example` is written by the claude module (writeTier1).
const SUBTEMPLATE_MODULE_OWNED = new Set([".env.example"]);

// Files that live under a core-owned template dir (e.g. `.bkit/scripts/`) but are
// NOT shipped by the plain core pass — skip them there so the right owner writes them.
const SLOP_PLUGIN = "bkit-slop-type-suppression.mjs";

const CORE_TEMPLATE_PATH_EXCLUDE = new Set([
  // The slop-scan plugin belongs to the `lint` module (--typescript); a consumer without
  // it never receives the file. runLintModule emits it as Tier 1.
  path.join(".bkit", "scripts", SLOP_PLUGIN),
]);

// Template subdirectories that belong to non-core modules (skip in core pass)
const NON_CORE_TEMPLATE_DIRS = new Set([
  ".github",
  ".vale",
  ".vale.ini",
  ".husky",
  ".prettierignore",
  ".cursor",
  ".claude",
  ".opencode",
]);

// ---------------------------------------------------------------------------
// guardTemplatesRoot — fail-loud guard for the resolved templates root.
// Exported so tests can inject an arbitrary (non-existent) path and assert
// the guard fires for ANY missing root — not just the literal ".bkit/templates"
// string. This keeps the assertion valid across any future path changes.
//
// Called by runCoreTemplates (below) before any FS access.
// ---------------------------------------------------------------------------

export function guardTemplatesRoot(root: string, logPrefix = "[bkit-modules]"): void {
  if (!fs.existsSync(root)) {
    console.error(`${logPrefix} Templates root not found at ${root} — package corrupt?`);
    process.exit(1);
  }
}

/** A core-owned template and how install writes it. */
interface CoreTemplateFile {
  /** Absolute template path. */
  src: string;
  /** Consumer-relative destination. */
  dst: string;
  /** `block`: writeTier2 refreshes the html-comment managed block. `whole`: writeTier1. */
  scope: "block" | "whole";
}

// The core-owned templates (top-level AGENTS.md / .gitignore / .gitattributes, docs/,
// .agents/, .bkit/scripts/). Each other module handles its own template files directly.
// `.agents/` templates are sourced from the templates tree, never from bkit's own dogfood
// `.agents/*.md`; COPY_EXCLUDE lists their basenames so copyAdditive never writes them.
export function listCoreTemplateFiles(root: string): CoreTemplateFile[] {
  const out: CoreTemplateFile[] = [];
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    const name = ent.name;
    if (NON_CORE_TEMPLATE_DIRS.has(name)) continue;
    if (ent.isFile() && CORE_TEMPLATE_FILES.has(name)) {
      // Single shared dotfile remap (gitignore → .gitignore, npmignore → .npmignore).
      out.push({ src: path.join(root, name), dst: remapTemplateDest(name), scope: "block" });
    } else if (ent.isDirectory() && CORE_TEMPLATE_DIRS.has(name)) {
      collectCoreTemplateDir(path.join(root, name), name, out);
    }
  }
  return out;
}

function collectCoreTemplateDir(srcDir: string, relBase: string, out: CoreTemplateFile[]): void {
  for (const ent of fs.readdirSync(srcDir, { withFileTypes: true })) {
    // Skip subtemplate files another module writes (e.g. .bkit/.env.example).
    if (
      ent.isFile() &&
      (relBase === ".agents" || relBase === ".bkit") &&
      SUBTEMPLATE_MODULE_OWNED.has(ent.name)
    ) {
      continue;
    }
    const srcPath = path.join(srcDir, ent.name);
    const relPath = path.join(relBase, ent.name);
    if (ent.isDirectory()) {
      collectCoreTemplateDir(srcPath, relPath, out);
    } else if (ent.isFile()) {
      // Templates live under core dirs (scripts/, docs/) but are not installed.
      if (isTemplate(relPath)) continue;
      // Skip opt-in-module-owned files that happen to live under a core dir.
      if (CORE_TEMPLATE_PATH_EXCLUDE.has(relPath)) continue;
      // `.bkit/scripts/*` are bkit-owned whole files with no consumer region: Tier 1,
      // overwritten and drift-checked whole, as the upgrade engine treats them.
      const scope = relBase === path.join(".bkit", "scripts") ? "whole" : "block";
      out.push({ src: srcPath, dst: relPath, scope });
    }
  }
}

function runCoreTemplates(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const root = getTemplatesRoot();
  guardTemplatesRoot(root, logPrefix);
  const tag = dryRun ? "[dry-run] " : "";
  for (const { src, dst, scope } of listCoreTemplateFiles(root)) {
    const prevLen = ws.writes.length;
    if (scope === "whole") writeTier1(src, dst, tokens, dryRun, ws);
    else writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}core: ${dst}`);
    }
  }
}

// ---------------------------------------------------------------------------
// runCoreModule — core templates + .bkit/version (LAST)
// ---------------------------------------------------------------------------

// Tier-2-style `.agents/*.md` files (rules/friction/docs/skills) are excluded:
// they ship as templates under `.bkit/templates/.agents/` and are installed by the
// templates pass.
const COPY_EXCLUDE = new Set([
  "skills",
  "scripts",
  "README.md",
  "rules.md",
  "friction.md",
  "docs.md",
  "skills.md",
  "context.md",
  // .env.example is written by the claude module (writeTier1 from the template at
  // .bkit/templates/.bkit/.env.example).
  ".env.example",
]);

// Top-level `.agents/` files that bkit force-overwrites on install (copyAdditive's
// default skip-if-exists is wrong for canonical bkit-owned content).
//
// EMPTY: the bkit-authoring docs / engine data (prompts.md, workflows.md, providers.md,
// cloud.md) live package-side under `.bkit/` and are read directly from there at
// runtime (getBkitDocsRoot). They are not `.agents/` files, so there is nothing to
// force-overwrite HERE. Their consumer-side mirrors (under `.bkit/`, not `.agents/`)
// are written by `runBkitDocs` (see BKIT_CANONICAL_DOCS below). This set is the
// extension point for a canonical consumer-side `.agents/` file.
export const CANONICAL_OVERWRITE_RELPATHS = new Set<string>([]);

// Canonical bkit-authored reference docs that live package-side under `.bkit/`.
// They are read from there at runtime (getBkitDocsRoot) AND mirrored into the
// consumer's `.bkit/` on every install so a consumer can read them in-repo without
// spelunking node_modules. Force-overwritten (Tier 1) — bkit owns them, so a
// consumer edit is replaced. Source of truth is the package's own `.bkit/<name>`.
// Every entry ships in the tarball under `.bkit/`. (`advisories.md` is a regenerated runtime
// artifact and `friction.md` is a consumer-owned seed — neither belongs here.)
export const BKIT_CANONICAL_DOCS = [
  "cloud.md",
  "jsonl.md",
  "providers.md",
  "prompts.md",
  "templates.md",
  "trackers.md",
  "workflows.md",
  "README.md",
] as const;

// Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
// Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). Each source carries
// the `{{BKIT_MANAGED_MARKER}}` token. Skipped in dogfood: getBkitDocsRoot() resolves to
// <cwd>/.bkit, so the source is the destination and stays unrendered.
export function runBkitDocs(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const tag = dryRun ? "[dry-run] " : "";
  const docsRoot = getBkitDocsRoot();
  // Per-doc write strategy from the manifest: markered-text docs (e.g. prompts.md,
  // which carries the consumer-owned `## Model Overrides` section below `bkit:end`)
  // are block-merged so consumer content survives; the rest are force-overwritten.
  const formatByPath = new Map(getInstallManifest().map((e) => [e.path, e.format]));
  for (const name of BKIT_CANONICAL_DOCS) {
    const srcPath = path.join(docsRoot, name);
    // A doc missing from a partial/corrupt package is skipped (writeTier1 throws on a
    // missing src).
    if (!fs.existsSync(srcPath)) continue;
    const dstPath = path.join(".bkit", name);
    if (path.resolve(dstPath) === path.resolve(srcPath)) continue;
    const prevLen = ws.writes.length;
    if (formatByPath.get(path.join(".bkit", name)) === "markered-text") {
      writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
    } else {
      writeTier1(srcPath, dstPath, tokens, dryRun, ws);
    }
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}core: ${dstPath}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Source-rendered host outputs — agents (.agents/prompts source) and commands
// (.bkit/workflows source). Extracted from the host module functions so BOTH
// `bkit install` (via the modules) AND `bkit upgrade` (via renderManagedOutputs)
// render them identically — a single source of truth that can never diverge.
//
// These are bkit-OWNED output files: force-overwritten (installFile), never
// drift-detected, never consumer config. They are NOT recorded in canonicalHashes
// (installFile does not touch ws), matching the install path exactly. Each returns
// the consumer-relative dest paths it wrote (for the upgrade summary).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Managed-version stamping. The marker shape (stampManagedVersion + regexes) lives
// in install/version-file.ts, shared by the renderer and the `bkit check` detector. Here we
// only resolve WHICH version to stamp: ctx.version (set by install/upgrade) with a
// package-root fallback.
// ---------------------------------------------------------------------------

/**
 * Best-effort read of the installing bkit version from the package root's
 * package.json. Mirrors getInstallingVersion in commands/install/install.ts; duplicated here
 * (not imported) to avoid a modules → install dependency cycle. Returns "0.0.0"
 * when unreadable — the same non-fatal fallback the install side uses.
 */
export function readInstallingVersion(): string {
  try {
    const pkgPath = path.join(getPkgRoot(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

/** Record a host mirror would-write so `bkit check` exits 1 on content drift. */
export function trackMirrorWrite(ctx: ModuleContext, relPath: string, written: string[]): void {
  written.push(relPath);
  ctx.ws.writes.push({ path: relPath, action: "write" });
}

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

/**
 * The package.json scripts core keeps: the `bkit:gate:*` / `bkit:deps:*` names every
 * workflow, prompt and hook runs, seeded add-if-missing (a name already declared is
 * never touched, whatever its value). Install (runCoreModule) and upgrade
 * (renderManagedOutputs) both run it, so a
 * clean upgrade leaves `bkit check` nothing to write. A missing gate name is a write,
 * so `bkit check` reports it. A missing or malformed package.json is preflight's to
 * report. Returns the paths written.
 */
export function seedCorePackageJsonScripts(
  ctx: Pick<ModuleContext, "dryRun" | "ws" | "logPrefix">,
): string[] {
  const { dryRun, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const written: string[] = [];

  const gates = ensurePackageJsonScripts({ ...BKIT_GATE_SCRIPTS }, dryRun, ws);
  if (gates.added.length > 0) {
    written.push("package.json");
    console.log(`${logPrefix} ${tag}core: package.json scripts added [${gates.added.join(", ")}]`);
  }
  return written;
}

// Tokens that follow `pnpm` in a gate value but are not package.json scripts: the
// package manager's own subcommands (`install` in bkit:gate:install-static-unit-build,
// `audit` / `outdated` in the bkit:deps:* pair) and node_modules binaries pnpm resolves
// directly (`lint-staged` in bkit:gate:format). None can be "missing" as a script.
const PNPM_NOT_A_SCRIPT = new Set([
  "install",
  "run",
  "exec",
  "dlx",
  "audit",
  "outdated",
  "lint-staged",
]);

/**
 * Advisories for the `bkit:gate:*` scripts: the scripts a still-default gate
 * chains that package.json does not declare, and the deeper test tiers the repo has
 * but no gate runs. Read-only; an absent or unparseable package.json yields none.
 */
export function detectGateAdvisories(cwd: string): PreflightFinding[] {
  let declared: Record<string, string>;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as {
      scripts?: Record<string, string>;
    };
    declared = pkg.scripts ?? {};
  } catch {
    // Absent or malformed package.json — preflight's no-package-json /
    // malformed-package-json blockers already report it.
    return [];
  }
  const findings: PreflightFinding[] = [];

  // Every script a seeded gate default chains MUST exist, or the gate dies on the first
  // missing one and the workflow reads that as a real failure. Checked only where the
  // value is still bkit's default — a consumer who rewrote the gate owns what it calls.
  const missing = new Set<string>();
  for (const [name, seeded] of Object.entries(BKIT_GATE_SCRIPTS)) {
    if (declared[name] !== seeded) continue;
    for (const [, called] of seeded.matchAll(/\bpnpm ([\w:-]+)/g)) {
      if (PNPM_NOT_A_SCRIPT.has(called)) continue;
      if (!(called in declared) && !(called in BKIT_GATE_SCRIPTS)) missing.add(called);
    }
  }
  if (missing.size > 0) {
    const names = [...missing].sort().map((n) => `\`${n}\``);
    findings.push({
      id: "gate-missing-called-scripts",
      severity: "advisory",
      detect: `The bkit:gate scripts call scripts package.json does not declare: ${names.join(", ")}.`,
      action: `Every bkit workflow runs a \`bkit:gate*\` script, so a missing link fails the whole gate. Add ${names.join(", ")} to package.json (\`.bkit/templates.md\` lists the tool scripts and the devDeps they need), or edit the \`bkit:gate*\` scripts to drop what this repo does not have.`,
    });
  }

  // A repo that HAS a deeper tier but declares no gate for it is gated at
  // bkit:gate:static-unit by both /bkit-build and /bkit-debug. bkit does not seed these
  // gates; it detects the mismatch and hands over the line to paste.
  const unwired: string[] = [];
  for (const { gate, parent, declaredBy } of BKIT_OPTIONAL_GATES) {
    const tierCall = declaredBy.find((s) => s in declared);
    if (tierCall === undefined || gate in declared) continue;
    unwired.push(`    "${gate}": "pnpm ${parent} && pnpm ${tierCall}"`);
  }
  if (unwired.length > 0) {
    findings.push({
      id: "gate-tier-not-wired",
      severity: "advisory",
      detect:
        "package.json declares deeper test tiers than any `bkit:gate*` script runs, so `/bkit-build` and `/bkit-debug` gate at `bkit:gate:static-unit` and never execute them.",
      action:
        "Each workflow runs the DEEPEST gate you declare; an undeclared one is skipped, never guessed. Add the gates you want the agent loop to run:\n\n" +
        unwired.join("\n") +
        "\n\nOrder matters — each chains the one above it. Omit a level deliberately to keep it CI-only (E2E in the build loop costs a production build on every remediation attempt). `.bkit/templates.md` lists the tool scripts the gates chain.",
    });
  }
  return findings;
}

/** One command that cannot fail: `true`, `:`, `exit 0`, or an `echo`. */
const NOOP_COMMAND = /^(?:true|:|exit 0|echo(?:\s.*)?)$/;

/** Whether a script value checks nothing: empty, or only no-op commands chained. */
export function isNoopScript(value: string): boolean {
  return value
    .split(/&&|\|\||;|\n/)
    .map((part) => part.trim())
    .every((part) => part === "" || NOOP_COMMAND.test(part));
}

/**
 * Advisory for every `bkit:gate:*` script that is empty or a no-op: it checks nothing,
 * so every agent run and push passes it. Warn-only, at install and `bkit check`, on
 * every branch. Read-only; an absent or unparseable package.json yields none.
 */
export function detectNoopGates(cwd: string): PreflightFinding[] {
  let declared: Record<string, unknown>;
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as {
      scripts?: Record<string, unknown>;
    };
    declared = pkg.scripts ?? {};
  } catch {
    // Absent or malformed package.json — preflight's blockers already report it.
    return [];
  }
  const noop = Object.entries(declared)
    .filter(([name, value]) => name.startsWith("bkit:gate:") && typeof value === "string")
    .filter(([, value]) => isNoopScript(value as string))
    .map(([name, value]) => `\`${name}\` (\`${String(value).trim() || "empty"}\`)`)
    .sort();
  if (noop.length === 0) return [];
  return [
    {
      id: "gate-noop",
      severity: "advisory",
      detect: `These bkit:gate scripts are empty or cannot fail, so they check nothing: ${noop.join(", ")}.`,
      action:
        'Every bkit workflow and the pre-push hook trust a green `bkit:gate*` script, so a no-op gate passes every agent run and push. Point each at the checks it should run (e.g. `"bkit:gate:static": "pnpm typecheck && pnpm lint"`), or delete it from package.json and run `bkit upgrade` to get bkit\'s default back.',
    },
  ];
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
  // The .bkit/version write happens in postDispatch, so a mid-install crash in a later
  // module leaves no .bkit/version on disk.
  const versionFile = path.join(cwd, ".bkit", "version");
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

  // 2. Core templates pass (only core-owned template files: AGENTS.md, CLAUDE.md, .gitignore, docs/)
  // Each other module handles its own template files directly.
  console.log(`${logPrefix} ${tag}Running core templates pass`);
  runCoreTemplates(dryRun, ctx.tokens, ws, logPrefix);

  // 3b. bkit canonical docs pass — mirror the package's `.bkit/*.md` reference docs
  // (cloud/IDEs/prompts/trackers/workflows/README) into the consumer's `.bkit/` so
  // they are readable in-repo. Force-overwrite (Tier 1); no-op in dogfood.
  console.log(`${logPrefix} ${tag}Running bkit docs pass`);
  runBkitDocs(dryRun, ctx.tokens, ws, logPrefix);

  // 3b2. Template copies — the template set into the consumer's `.bkit/templates/`
  // (never applied to the repo; no-op in dogfood).
  console.log(`${logPrefix} ${tag}Running template copies pass`);
  const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
  for (const [verb, paths] of Object.entries(templateChanges)) {
    for (const p of paths) {
      console.log(`${logPrefix} ${tag}template ${verb}: ${path.join(TEMPLATE_COPIES_DIR, p)}`);
    }
  }

  // 3c. The bkit:gate:* / bkit:deps:* package.json scripts (add-if-missing). The
  // advisories read the result.
  seedCorePackageJsonScripts(ctx);
  if (!dryRun) advisories.push(...detectGateAdvisories(cwd));
  advisories.push(...detectNoopGates(cwd));

  // 4. .bkit/version write — deferred to postDispatch so it only persists when ALL modules succeed.
  // This ensures a mid-install crash in a subsequent module does not suppress the first-install
  // banner on retry (MED-4).
  // C3 fix: write JSON format with canonicalHashes populated from ws.writes (fully populated
  // by the time postDispatch runs — all modules have completed). canonicalHashes records the
  // sha256 of each bkit-managed consumer file as written, enabling drift detection on upgrade.
  postDispatch.push(() => {
    // Read existing file to check whether an update is needed.
    const existingVersion = readBkitVersion(versionFile);
    const existingCanonical = existingVersion?.canonicalHashes ?? {};

    // Build new canonicalHashes entries from ws.writes (files written in this run).
    // ws.writes is fully populated by the time postDispatch runs.
    // Exclude .bkit/version itself and .agents/ internal files (not consumer-facing).
    const newCanonicalEntries: Record<string, string> = {};
    for (const entry of ws.writes) {
      const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
      const relPath = path.relative(cwd, absPath);
      if (relPath === path.join(".bkit", "version")) continue;
      if (relPath.startsWith(".agents" + path.sep)) continue;
      // Template copies carry no hash.
      if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
      if (!fs.existsSync(absPath)) continue;
      const hash = hashFile(absPath);
      if (hash) newCanonicalEntries[relPath] = hash;
    }

    // Merge: existing hashes preserved, new writes overwrite (hashes stay current).
    const canonicalHashes = { ...existingCanonical, ...newCanonicalEntries };

    // Decide whether a write is needed: version mismatch, first install, new canonical
    // entries, or a changed claudeAllowDerived record.
    const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
    const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
    const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
    const derivedChanged =
      JSON.stringify(claudeAllowDerived) !==
      JSON.stringify(existingVersion?.claudeAllowDerived ?? []);
    const needsWrite = versionChanged || hasNewEntries || derivedChanged;

    if (needsWrite) {
      console.log(
        `${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`,
      );
      ws.writes.push({ path: versionFile, action: "write" });
      if (!dryRun) {
        fs.mkdirSync(target, { recursive: true });
        writeBkitVersion(versionFile, {
          pinnedVersion: pkgVersion,
          canonicalHashes,
          claudeAllowDerived: [...claudeAllowDerived],
        });
      }
    }
  });

  // 5. First-run extra logging (only when .bkit/version was absent at start of install)
  if (isFirstInstall) {
    advisories.push({
      id: "first-install-postinstall-steps",
      severity: "advisory",
      detect: "First install detected (.bkit/version was absent).",
      action:
        "Post-install steps:\n\n" +
        "1. Add BKIT_GH_TOKEN_INSTALL to your GitHub Actions repository secrets:\n" +
        "   - Create a classic PAT with `read:packages` scope (fine-grained PATs are\n" +
        "     not currently supported by GitHub Packages npm registry).\n" +
        "   - GitHub Settings → Secrets and variables → Actions → New repository secret\n" +
        "   - Name: BKIT_GH_TOKEN_INSTALL\n" +
        "   - See README.md ## Consumer CI auth for full setup.\n\n" +
        "2. Add a `.npmrc` at your repo root with the @cbartens registry mapping (the\n" +
        "   auth token is NOT stored here — it goes in pnpm's user-level config):\n" +
        "     @cbartens:registry=https://npm.pkg.github.com\n\n" +
        "3. Write the token into pnpm's user-level config (run once; CI does this in its\n" +
        "   install step). pnpm >=10.34.3 401s on a project-.npmrc ${BKIT_GH_TOKEN_INSTALL} ref:\n" +
        '     pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"\n\n' +
        "4. Run `pnpm install` to refresh the lockfile, then commit.\n\n" +
        "Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow\n" +
        "runs (existing values are never touched). The tool scripts they chain (typecheck,\n" +
        "lint, format:check, lint:prose, slop:delta) and the devDeps those need are yours to\n" +
        "add: see .bkit/templates.md.",
    });
  }
}

// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------

export const BKIT_PREFIX = "bkit-";

// ---------------------------------------------------------------------------
// runLintModule — the owned slop-scan type-suppression plugin. The tool scripts and
// devDeps, slop-scan.config.json, .prettierignore, .lintstagedrc.json, the Vale config
// and the husky hooks ship as templates (`.bkit/templates.md`).
// ---------------------------------------------------------------------------

export function runLintModule(ctx: ModuleContext): void {
  const { dryRun, tokens, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  // Not in the core template walk: ships only with --typescript.
  // Tier 1 (bkit-owned, force-overwritten; writeTier1 copies the source mode). Listed
  // in CORE_TEMPLATE_PATH_EXCLUDE so the core pass skips it.
  const scriptSrc = path.join(getTemplatesRoot(), ".bkit", "scripts", SLOP_PLUGIN);
  if (!fs.existsSync(scriptSrc)) return;
  const scriptDst = path.join(".bkit", "scripts", SLOP_PLUGIN);
  ensureDir(path.dirname(scriptDst));
  const prevLen = ws.writes.length;
  writeTier1(scriptSrc, scriptDst, tokens, dryRun, ws);
  if (ws.writes.length > prevLen) {
    console.log(`${logPrefix} ${tag}lint: ${scriptDst}`);
  }
}
