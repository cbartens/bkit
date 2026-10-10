// bkit-modules.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, advisories, ws, … } (ModuleContext)
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → opencode → codex → lint → cloud
// .bkit-version is written LAST — in postDispatch after ALL modules complete (MED-4).

import * as fs from "node:fs";
import * as path from "node:path";
import {
  writeTier1,
  writeTier2,
  writeIfAbsent,
  writeTier2JsonContained,
  deepMergeJson,
  migrateLegacyBkitEnvelope,
  ensurePackageJsonScripts,
  ensureDir,
  type WriteSet,
  type JsonValue,
} from "./bkit-tiers.js";
import {
  readBkitVersion,
  writeBkitVersion,
  hashFile,
  stampManagedVersion,
} from "./bkit-version.js";
import type { TokenMap } from "./bkit-tokens.js";
import type { ModuleFlag } from "./bkit-cli.js";
import {
  runPayload,
  applyT1,
  applyT2,
  applyT3,
  applyOpencodeAgent,
  applyCodexAgent,
  parseFrontmatter,
  applyEffortRemap,
  applyOpencodeCommand,
  remapTemplateDest,
  listFilesRecursive,
  type EffortMap,
} from "./bkit-install.js";
import type { PreflightFinding } from "./bkit-preflight.js";
import {
  getPkgRoot,
  getTemplatesRoot,
  getWorkflowsRoot,
  getPromptsRoot,
  getBkitDocsRoot,
  TEMPLATE_COPIES_DIR,
} from "./bkit-paths.js";
import {
  getInstallManifest,
  type IssueTracker,
  DEFAULT_ISSUE_TRACKER,
  type CloudAgents,
  BKIT_GATE_SCRIPTS,
  BKIT_OPTIONAL_GATES,
  GATEGUARD_CJS_WIRING_INSTRUCTIONS,
  CODEX_GUARDRAILS_WIRING_INSTRUCTIONS,
  CLAUDE_GUARDRAILS_WIRING_INSTRUCTIONS,
  GATEGUARD_JS_WIRING_INSTRUCTIONS,
  GUARDRAILS_WIRING_INSTRUCTIONS,
} from "./bkit-manifest.js";
import type { CloudVariant } from "./bkit-cli.js";
import { substituteWorkflow } from "./bkit-trackers.js";
import {
  writeClaudeCloudDoc,
  writeCursorCloudDoc,
  resolveNetworkAllowlist,
  resolveClaudeDerivedAllows,
  extractMcpServers,
  networkAllowlistBases,
  writeNetworkAllowlistArtifact,
  writeCursorCliPermissionsArtifact,
} from "./bkit-cloud-env.js";
import { OPENCODE_PROVIDER_DEFAULTS } from "./bkit-registry.js";
import { migrateConfigMdToContext, migrateContextFetchToContext } from "./bkit-context-migrate.js";
import { isRetiredHashKey, retireOwnedFiles, withoutRetiredHashes } from "./bkit-retire.js";
import { repointLegacyScripts } from "./bkit-package-json.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Persist a `bkit.<field>` value into the consumer's package.json so the
 * post-install advisory can tell "deliberately none" from "undecided". Mirrors
 * the `bkit.issueTracker` persist logic in bkit-install.ts. Used for the opt-in
 * decisions recorded by their owning modules (`cloudAgents`). No-op
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

export function listMdFiles(dir: string, prefix?: string): string[] {
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

// Re-export getPkgRoot from bkit-paths (lifted there to break the preflight ↔ modules cycle).
export { getPkgRoot } from "./bkit-paths.js";

// ---------------------------------------------------------------------------
// Module context
// ---------------------------------------------------------------------------

export interface ModuleContext {
  dryRun: boolean;
  /**
   * Set by runClaudeModule to what enrichClaudeSettingsAllows actually recorded, so
   * core's postDispatch can persist it into `.bkit/version`. `null` or absent means
   * "not determined this run" — carry the prior record forward rather than clearing it.
   * Enrich itself never writes `.bkit/version`; there is one writer.
   */
  claudeAllowRecorded?: readonly string[] | null;
  tokens: TokenMap;
  modelLookup: Map<string, string>;
  /**
   * opencode model lookup — additive field for the opencode module. Using a separate
   * field (not reshaping modelLookup) keeps the shared cursor model-lookup stable:
   * modelLookup is consumed by runCursorModule; reshaping it would be a high-risk
   * shared-utility change touching all module signatures for no functional gain.
   * Populated only when --opencode is in the module set. Empty map when absent.
   */
  opencodeModelLookup: Map<string, string>;
  /**
   * name -> BARE § Models `OpenAI` cell, for `.codex/agents/*.toml`. Separate from
   * opencodeModelLookup because they read different gateway columns.
   */
  codexModelLookup?: Map<string, string>;
  /**
   * Effort → provider thinking map from prompts.md (Default | Claude | Cursor | …).
   * Shared by Claude / Cursor / opencode transforms. Empty map when prompts.md absent.
   */
  effortMap: EffortMap;
  /**
   * opencode provider chosen via `--opencode=<provider>`. null = not specified.
   * Used by runOpencodeModule to seed the provider block in opencode.json.
   */
  opencodeProvider?: string | null;
  /** Structured advisory accumulator. */
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
  /**
   * Cloud variant chosen via `--auto=claude|cursor`. null = not specified (cloud module
   * not being installed). Used by `runCloudModule` to dispatch the correct variant.
   */
  cloudVariant?: CloudVariant | null;
  /**
   * Installing bkit version (package.json `version`) stamped into every rendered agent +
   * command as a managed-version marker (#256). Additive/optional: when absent the render
   * functions fall back to reading the package root directly (readInstallingVersion), so
   * older ctx builders keep working — production install/upgrade set it explicitly.
   */
  version?: string;
}

export type ModuleFn = (ctx: ModuleContext) => void;

// ---------------------------------------------------------------------------
// Core template files — directories/basenames owned ONLY by core module.
// These are templates that don't belong to the lint/claude/cursor modules.
// ---------------------------------------------------------------------------

// Top-level template directories/files that belong to core (not other modules)
const CORE_TEMPLATE_DIRS = new Set(["docs", ".agents", ".bkit", "scripts"]);
// Top-level template files (non-directory) that belong to core.
// `gitignore` is stored dot-less (npm strips a literal `.gitignore`); `.gitattributes`
// is stored with its dot (npm does not strip it) — see remapTemplateDest / NPM_STRIP_REMAP.
// CLAUDE.md is NOT here (#252): it belongs to the `claude` module (a Claude-Code-only root
// redirect, the analog of Cursor's .cursor/rules/00-shared-rules.mdc) — runClaudeModule
// emits it. AGENTS.md (cross-host dispatch router) stays core.
const CORE_TEMPLATE_FILES = new Set(["AGENTS.md", "gitignore", ".gitattributes"]);
// Files inside the .agents/ and .bkit/ subtemplate dirs that another module writes —
// skip in the core templates pass to avoid double-recording them in the WriteSet.
// `.bkit/.env.example` is written by the claude module (writeTier1).
const SUBTEMPLATE_MODULE_OWNED = new Set([".env.example"]);

/**
 * Core templates written once when absent and never again (writeIfAbsent): the consumer
 * owns them from the first install. No hash, no `bkit check` drift, skipped by the
 * upgrade walk when present, left in place by uninstall.
 */
export const CREATE_IF_MISSING_PATHS: ReadonlySet<string> = new Set([
  path.join(".agents", "skills.md"),
]);

/**
 * Templates. Install and upgrade copy them into the consumer's `.bkit/templates/`
 * and never apply them. A consumer copies the file into the repo and owns it.
 */
const TEMPLATE_EXACT = new Set([
  ".github/renovate.json5",
  ".github/dependabot.yml",
  ".github/workflows/renovate.yml",
  ".github/workflows/ci.yml",
  ".github/workflows/bkit-cloud.yml",
  ".husky/pre-commit",
  ".husky/pre-push",
  ".vale.ini",
  ".lintstagedrc.json",
  "slop-scan.config.json",
  ".prettierignore",
  ".envrc",
  ".cursor/settings.json",
  ".cursor/environment.json",
  ".cursor/Dockerfile",
  ".graphifyignore",
  ".serena/project.yml",
  "docs/capabilities.md",
]);

export function isTemplate(relPath: string): boolean {
  const norm = relPath.split(path.sep).join("/");
  if (TEMPLATE_EXACT.has(norm)) return true;
  if (norm.startsWith(".vale/styles/House/")) return true;
  // One context-fetch file per provider, copied below `bkit:end` in `.agents/context.md`.
  if (norm.startsWith("context/")) return true;
  // Root `scripts/` in the templates holds only per-tool examples (`scripts/<tool>/`).
  // bkit's own scripts live under `.bkit/scripts/`.
  return norm === "scripts" || norm.startsWith("scripts/");
}

// Files that live under a core-owned template dir (e.g. `.bkit/scripts/`) but are
// NOT shipped by the plain core pass — skip them there so the right owner writes them.
const SLOP_PLUGIN = "bkit-slop-type-suppression.mjs";
const CORE_TEMPLATE_PATH_EXCLUDE = new Set([
  // The slop-scan plugin belongs to the `lint` module (--typescript), so a consumer
  // without it never receives the file (#265). runLintModule emits it as Tier 1.
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

// Run templates pass only for core-owned files (top-level md files, docs/, .agents/ subtemplates).
// Each other module handles its own template files directly.
function runCoreTemplates(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const root = getTemplatesRoot();
  guardTemplatesRoot(root, logPrefix);

  const tag = dryRun ? "[dry-run] " : "";

  // Process top-level entries
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    const name = ent.name;
    // Skip non-core module dirs/files
    if (NON_CORE_TEMPLATE_DIRS.has(name)) continue;
    // Only process known core files or core dirs
    if (!CORE_TEMPLATE_FILES.has(name) && !CORE_TEMPLATE_DIRS.has(name) && !ent.isDirectory()) {
      // Root-level template files outside the core set belong to another module or are
      // templates (copied by syncTemplateCopies) — skip.
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
      processCoreTemplateDir(srcPath, relPath, dryRun, tokens, ws, logPrefix);
    } else if (ent.isFile()) {
      // Templates live under core dirs (scripts/, docs/) but are not installed.
      if (isTemplate(relPath)) continue;
      // Skip opt-in-module-owned files that happen to live under a core dir.
      if (CORE_TEMPLATE_PATH_EXCLUDE.has(relPath)) continue;
      const dstPath = relPath;
      if (CREATE_IF_MISSING_PATHS.has(relPath)) {
        if (writeIfAbsent(srcPath, dstPath, tokens, dryRun)) {
          console.log(`${logPrefix} ${tag}core: ${dstPath}`);
        }
        continue;
      }
      const prevLen = ws.writes.length;
      if (relBase === path.join(".bkit", "scripts")) {
        // `.bkit/scripts/*` are bkit-owned executables with NO consumer-editable region.
        // They were being handed to writeTier2 with the html-comment marker style, which no
        // shell script uses: `extractFullManagedBlock` returned null, writeTier2 returned
        // early, and once seeded a modified script was never re-rendered and never entered
        // the drift comparison — `bkit check` exited 0 on a tampered script the merge gate
        // relied on. The upgrade engine already treats every one of them whole-file
        // (non-markdown, no manifest entry → diffFile/conflict), so Tier 1 here is what makes
        // install, upgrade and check agree.
        writeTier1(srcPath, dstPath, tokens, dryRun, ws);
      } else {
        writeTier2(srcPath, dstPath, tokens, "html-comment", dryRun, ws);
      }
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
// because they ship as templates under `.bkit/templates/.agents/` and are
// installed by the templates pass. Copying them here additively would dump
// bkit's own out-of-block content (e.g. bkit's `### bkit Repo Authoring` section
// in `rules.md`, bkit's friction-log entries) onto consumers on first install.
const COPY_EXCLUDE = new Set([
  "skills",
  "scripts",
  "README.md",
  ".bkit-version",
  "rules.md",
  "friction.md",
  "docs.md",
  "skills.md",
  "context.md",
  // .env.example is written by the claude module (writeTier1 from the template at
  // .bkit/templates/.bkit/.env.example). Copying it here too would double-handle the
  // same destination.
  ".env.example",
  // bkit-mode.sh is not shipped; this entry guards against an accidental re-addition.
  "bkit-mode.sh",
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
// Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). No-op in
// dogfood: getBkitDocsRoot() resolves to <cwd>/.bkit, so src === dst and
// writeTier1 short-circuits on the byte-equal check (no ws write).
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
    // Defensive: a partial/corrupt package may be missing a doc — skip rather than
    // crash the whole install (writeTier1 would throw on a missing src).
    if (!fs.existsSync(srcPath)) continue;
    const dstPath = path.join(".bkit", name);
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

/** Template paths (relative to `.bkit/templates/`) a sync changed, added or removed. */
export interface TemplateCopyChanges {
  changed: string[];
  added: string[];
  removed: string[];
}

// Copy the template set (isTemplate) from the package into the consumer's
// `.bkit/templates/`, raw: no token substitution, so the copy is the package bytes and
// `git diff .bkit/templates` on an upgrade commit is the template changelog. Byte-compares
// first, keeps the source mode (hooks and scripts are executable), and prunes copies that
// left the set. Every change pushes a ws write in dry-run and live alike, so `bkit check`
// flags a stale copy. No-op in dogfood: there the folder IS the package's template source.
export function syncTemplateCopies(
  cwd: string,
  opts: { dryRun: boolean; ws: WriteSet },
): TemplateCopyChanges {
  const changes: TemplateCopyChanges = { changed: [], added: [], removed: [] };
  if (path.resolve(cwd) === getPkgRoot()) return changes;
  const srcRoot = getTemplatesRoot();
  const dstRoot = path.join(cwd, TEMPLATE_COPIES_DIR);

  const shipped = new Set<string>();
  for (const srcPath of listFilesRecursive(srcRoot)) {
    const rel = path.relative(srcRoot, srcPath);
    if (!isTemplate(remapTemplateDest(rel))) continue;
    shipped.add(rel);
    const dstPath = path.join(dstRoot, rel);
    const exists = fs.existsSync(dstPath);
    if (exists && fs.readFileSync(srcPath).equals(fs.readFileSync(dstPath))) continue;
    (exists ? changes.changed : changes.added).push(rel);
    if (!opts.dryRun) {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.copyFileSync(srcPath, dstPath);
      fs.chmodSync(dstPath, fs.statSync(srcPath).mode);
    }
    opts.ws.writes.push({
      path: path.join(TEMPLATE_COPIES_DIR, rel),
      action: exists ? "update" : "write",
    });
  }

  for (const dstPath of listFilesRecursive(dstRoot)) {
    const rel = path.relative(dstRoot, dstPath);
    if (shipped.has(rel)) continue;
    changes.removed.push(rel);
    if (!opts.dryRun) fs.rmSync(dstPath);
    opts.ws.writes.push({ path: path.join(TEMPLATE_COPIES_DIR, rel), action: "update" });
  }
  if (!opts.dryRun) pruneEmptyDirs(dstRoot);
  return changes;
}

// Remove empty folders under `root`, deepest first. `root` itself stays.
function pruneEmptyDirs(root: string): void {
  if (!fs.existsSync(root)) return;
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const dir = path.join(root, ent.name);
    pruneEmptyDirs(dir);
    if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  }
}

/** One-line pointer to the template docs, shared by the install and upgrade messages. */
export const TEMPLATES_POINTER =
  "Templates: see .bkit/templates.md; copies live in .bkit/templates/ (if your own gates scan the repo, ignore .bkit/templates/).";

/**
 * The upgrade report for a template sync: one line per changed, added or removed
 * template, then where to read about adopting them. Empty when nothing changed.
 */
export function formatTemplateChanges(changes: TemplateCopyChanges): string {
  const lines = [
    ...changes.changed.map((p) => `  changed: ${path.join(TEMPLATE_COPIES_DIR, p)}`),
    ...changes.added.map((p) => `  added:   ${path.join(TEMPLATE_COPIES_DIR, p)}`),
    ...changes.removed.map((p) => `  removed: ${path.join(TEMPLATE_COPIES_DIR, p)}`),
  ];
  if (lines.length === 0) return "";
  return [
    `Templates updated (${lines.length}). bkit never applies these; diff them against your own copies and adopt what you want:`,
    ...lines,
    TEMPLATES_POINTER,
  ].join("\n");
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
// Managed-version stamping (#256). The marker shape (stampManagedVersion +
// regexes) is the single source of truth in bkit-version.ts so the renderer and
// the `bkit check` detector can never drift. Here we only resolve WHICH version
// to stamp: ctx.version (set by install/upgrade) with a package-root fallback.
// ---------------------------------------------------------------------------

/**
 * Best-effort read of the installing bkit version from the package root's
 * package.json. Mirrors getInstallingVersion in bkit-install.ts; duplicated here
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
function trackMirrorWrite(ctx: ModuleContext, relPath: string, written: string[]): void {
  written.push(relPath);
  ctx.ws.writes.push({ path: relPath, action: "write" });
}

export function renderClaudeAgentsCommands(ctx: ModuleContext): string[] {
  const { dryRun, logPrefix, effortMap } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];

  const pairs: Array<[string, string]> = [
    [getWorkflowsRoot(), ".claude/commands"],
    [getPromptsRoot(), ".claude/agents"],
  ];

  for (const [src, dest] of pairs) {
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      // Resolve tracker blocks for both; agents also remap effort via prompts.md
      // Claude column. Managed-version marker stamped LAST (#256).
      const transform = (c: string) => {
        const resolved = substituteWorkflow(c, issueTracker).output;
        const body =
          dest === ".claude/commands" ? resolved : applyEffortRemap(resolved, effortMap, "claude");
        return stampManagedVersion(body, version);
      };
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }
  return written;
}

export function renderCursorAgentsCommands(ctx: ModuleContext): string[] {
  const { dryRun, modelLookup, effortMap, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];

  // Commands: tracker block resolution → T1 → T2 → managed-version stamp (last, #256)
  {
    const src = getWorkflowsRoot();
    const dest = ".cursor/commands";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(applyT2(applyT1(substituteWorkflow(c, issueTracker).output)), version);
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }

  // Agents: tracker block resolution → T3
  {
    const src = getPromptsRoot();
    const dest = ".cursor/agents";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyT3(substituteWorkflow(c, issueTracker).output, modelLookup, effortMap),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }
  return written;
}

export function renderOpencodeAgentsCommands(ctx: ModuleContext): string[] {
  const { dryRun, opencodeModelLookup, effortMap, opencodeProvider, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];
  // The opencode host cannot render without a provider — `--opencode=<provider>` is
  // unary at the CLI, so an absent value here is a caller bug, not a case to default.
  if (!opencodeProvider) {
    throw new Error("renderOpencodeAgentsCommands: ctx.opencodeProvider is required");
  }
  const provider = opencodeProvider;

  // --- Agents: tracker substitution → applyOpencodeAgent → managed-version stamp (last, #256) ---
  {
    const src = getPromptsRoot();
    const dest = ".opencode/agents";
    // dryRun-gated so `bkit check` stays read-only — installFile/removeOrphans below are
    // already dryRun-guarded, so the dir is only needed for a real write (#255 #8).
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyOpencodeAgent(
            substituteWorkflow(c, issueTracker).output,
            opencodeModelLookup,
            effortMap,
            provider,
          ),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    // Remove orphan agent files (bkit-prefix only, no allowlist gate needed — .opencode/agents
    // is a dynamic mirror dir like .claude/agents and .cursor/agents). dryRun still reports
    // would-deletes into ws.writes so `bkit check` fails on stale mirrors.
    if (fs.existsSync(dest)) {
      for (const f of fs.readdirSync(dest)) {
        if (!f.endsWith(".md")) continue;
        if (!f.startsWith(BKIT_PREFIX)) continue;
        if (!sourceSet.has(f)) {
          const rel = path.join(dest, f);
          if (!dryRun) fs.rmSync(path.join(dest, f));
          console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
          trackMirrorWrite(ctx, rel, written);
        }
      }
    }
  }

  // --- Commands: tracker substitution + applyOpencodeCommand ---
  {
    const src = getWorkflowsRoot();
    const dest = ".opencode/commands";
    // dryRun-gated (see .opencode/agents above) — keep `bkit check` read-only (#255 #8).
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyOpencodeCommand(substituteWorkflow(c, issueTracker).output),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    if (fs.existsSync(dest)) {
      for (const f of fs.readdirSync(dest)) {
        if (!f.endsWith(".md")) continue;
        if (!f.startsWith(BKIT_PREFIX)) continue;
        if (!sourceSet.has(f)) {
          const rel = path.join(dest, f);
          if (!dryRun) fs.rmSync(path.join(dest, f));
          console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
          trackMirrorWrite(ctx, rel, written);
        }
      }
    }
  }
  return written;
}

// ---------------------------------------------------------------------------
// renderManagedOutputs — re-render the bkit-managed OUTPUT files that the
// `bkit upgrade` template walk (runUpgrade over .bkit/templates/) does NOT cover
// (#251): host agents/commands (source-rendered), the `.bkit/*.md` canonical
// docs (runBkitDocs) and core's package.json scripts (seedCorePackageJsonScripts).
// A version bump must refresh them. `.bkit/prompts.md` is markered → runBkitDocs block-merges it
// (managed block refreshed, consumer `## Model Overrides` below bkit:end preserved).
//
// CRITICAL (#204/#219): docs stay single-source PACKAGE-side and are mirrored from
// getBkitDocsRoot() — they are NEVER relocated into .bkit/templates/.
//
// Doc writes land in ctx.ws (runBkitDocs uses the tier writers) so the caller can
// refresh their canonicalHashes. Agent/command mirrors also push to ws.writes on
// would-write so `bkit check` exits 1 on content drift (not only managed-version
// marker stale). They are still re-rendered from source (not the template walk).
// `modules` should contain only hosts the consumer actually has installed.
// Returns every consumer-relative path written (for the upgrade summary).
// ---------------------------------------------------------------------------

export function renderManagedOutputs(modules: Set<ModuleFlag>, ctx: ModuleContext): string[] {
  const written: string[] = [];

  // Canonical .bkit/*.md docs — always (core is always present once installed).
  const docsBefore = ctx.ws.writes.length;
  runBkitDocs(ctx.dryRun, ctx.tokens, ctx.ws, ctx.logPrefix);
  for (let i = docsBefore; i < ctx.ws.writes.length; i++) {
    written.push(String(ctx.ws.writes[i].path));
  }

  // Core package.json scripts — the same pass install runs, so `bkit check` after a
  // clean upgrade finds no missing gate name and no superseded script value.
  written.push(...seedCorePackageJsonScripts(ctx));

  // Host agents/commands — only for hosts the consumer has installed.
  if (modules.has("claude")) written.push(...renderClaudeAgentsCommands(ctx));
  if (modules.has("cursor")) written.push(...renderCursorAgentsCommands(ctx));
  if (modules.has("opencode")) written.push(...renderOpencodeAgentsCommands(ctx));
  if (modules.has("codex")) written.push(...renderCodexAgentsSkills(ctx));

  return written;
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
 * never touched, whatever its value), and the re-point of superseded bkit script
 * values. Install (runCoreModule) and upgrade (renderManagedOutputs) both run it, so a
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

  const repointed = repointLegacyScripts(process.cwd(), dryRun);
  if (repointed.length > 0) {
    ws.writes.push({ path: "package.json", action: "update" });
    if (written.length === 0) written.push("package.json");
    console.log(
      `${logPrefix} ${tag}core: package.json scripts re-pointed from a superseded bkit default [${repointed.join(", ")}]`,
    );
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
 * Advisories for the `bkit:gate:*` scripts (#437): the scripts a still-default gate
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

  // A repo that HAS a deeper tier but never declares its gate is silently gated at
  // bkit:gate:static-unit by both /bkit-build and /bkit-debug — the tier exists, CI runs
  // it, and the agent loop never does. bkit cannot seed these (a stub would exit 0 and
  // claim the coverage), so it detects the mismatch and hands over the line to paste.
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

  // 2. Payload cleanup pass — mirror sources + bkit docs are package-only (read
  // directly from .bkit/); this removes any orphan copies a consumer carries from
  // a legacy layout. No-op in dogfood and on clean trees.
  console.log(`${logPrefix} ${tag}Running payload cleanup pass`);
  const { deletes: payloadDeletes } = runPayload(dryRun);
  if (payloadDeletes > 0) {
    console.log(`${logPrefix} ${tag}payload: ${payloadDeletes} relocated orphan(s) removed`);
  }

  // 2b. Retire pass — delete files bkit dropped, when unchanged since bkit wrote them.
  // A pending delete is a write, so `bkit check` reports it as drift.
  const { deleted: retired } = retireOwnedFiles(cwd, {
    dryRun,
    log: (line) => console.log(`${logPrefix} ${line}`),
  });
  for (const p of retired) ws.writes.push({ path: p, action: "update" });

  // 3. Core templates pass (only core-owned template files: AGENTS.md, CLAUDE.md, .gitignore, docs/)
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

  // 3c. Auto-migrate consumer context-fetch config onto .agents/context.md. Runs AFTER the
  // templates pass has (re)written context.md's managed block, so carried blocks land below a
  // header that already exists. Idempotent no-op once nothing remains. Consumers do nothing —
  // the install moves their copied-down blocks for them.
  //
  // #454 (retire .agents/config.md, rename the markers) runs BEFORE #334 (move the blocks out
  // of docs/observability.md) so both hops converge on one context.md in a single pass.
  {
    const movedConfigMd = migrateConfigMdToContext(cwd, dryRun);
    if (movedConfigMd) console.log(`${logPrefix} ${tag}${movedConfigMd}`);

    const moved = migrateContextFetchToContext(cwd, dryRun);
    if (moved) console.log(`${logPrefix} ${tag}${moved}`);
  }

  // 3d. The bkit:gate:* / bkit:deps:* package.json scripts (add-if-missing) and the
  // re-point of superseded bkit script values. The advisories read the result.
  seedCorePackageJsonScripts(ctx);
  if (!dryRun) advisories.push(...detectGateAdvisories(cwd));

  // 4. .bkit-version write — deferred to postDispatch so it only persists when ALL modules succeed.
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
    // Exclude .bkit-version itself and .agents/ internal files (not consumer-facing).
    const newCanonicalEntries: Record<string, string> = {};
    for (const entry of ws.writes) {
      const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
      const relPath = path.relative(cwd, absPath);
      if (relPath === path.join(".bkit", "version")) continue;
      if (relPath.startsWith(".agents" + path.sep)) continue;
      // Template copies and retired paths carry no hash.
      if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
      if (isRetiredHashKey(relPath)) continue;
      if (!fs.existsSync(absPath)) continue;
      const hash = hashFile(absPath);
      if (hash) newCanonicalEntries[relPath] = hash;
    }

    // Merge: existing hashes preserved, new writes overwrite (hashes stay current).
    // Drop paths bkit does not keep (retired owned files, templates). A stale key
    // would keep exempting that file from checks such as the floating-tag check.
    const canonicalHashes = withoutRetiredHashes({ ...existingCanonical, ...newCanonicalEntries });

    // Decide whether a write is needed: version mismatch, first install, new canonical
    // entries, dropped keys, or a file carrying the legacy tier3Hashes field.
    const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
    const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
    const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
    const derivedChanged =
      JSON.stringify(claudeAllowDerived) !==
      JSON.stringify(existingVersion?.claudeAllowDerived ?? []);
    const droppedRetired = Object.keys(existingCanonical).some(isRetiredHashKey);
    const needsWrite =
      versionChanged ||
      hasNewEntries ||
      derivedChanged ||
      droppedRetired ||
      existingVersion?.legacyTier3Hashes === true;

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

  // 5. First-run extra logging (only when .bkit-version was absent at start of install)
  if (isFirstInstall) {
    advisories.push({
      id: "first-install-postinstall-steps",
      severity: "advisory",
      detect: "First install detected (.bkit-version was absent).",
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

const BKIT_PREFIX = "bkit-";

export function runClaudeModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;

  // Source-rendered agents/commands (.claude/agents from .bkit/prompts, .claude/commands
  // from .bkit/workflows). Shared with `bkit upgrade` via renderClaudeAgentsCommands so it
  // re-renders them identically (#251) — bkit-owned output, force-overwritten.
  renderClaudeAgentsCommands(ctx);

  // Root CLAUDE.md — Claude-Code redirect to .agents/rules.md (#252).
  // It is a ROOT file (not under .claude/), so the .claude/ template walk does not cover it
  // and core does not emit it — the claude module writes it here. Tier-2 markered-text
  // (writeTier2 html-comment). The matching canonicalHashes entry is recorded by core's
  // postDispatch from ws (which aggregates every module's writes).
  {
    const src = path.join(getTemplatesRoot(), "CLAUDE.md");
    const dst = "CLAUDE.md";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${dst}`);
      }
    }
  }

  const claudeTemplates = path.join(getTemplatesRoot(), ".claude");

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
    ctx.claudeAllowRecorded = enrichClaudeSettingsAllows(
      settingsDst,
      process.cwd(),
      dryRun,
      ws,
      advisories,
    );
    // AFTER the contained merge: the merge is additive and would otherwise re-seat a
    // row this prune had just removed if the ordering were reversed.
    const prunedAsk = pruneRetiredClaudeAskRules(settingsDst, dryRun, ws);
    if (prunedAsk) console.log(`${logPrefix} ${tag}${prunedAsk}`);
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

  // markered-text (slash-comment) — GateGuard advisory PreToolUse hook. bkit owns
  // only the advisory engine between the markers; consumers own the stdin/stdout
  // driver from first install onward (env vars BKIT_GATEGUARD / BKIT_ALLOW_CONFIG_EDIT
  // still tune behaviour, same as before).
  {
    const src = path.join(claudeTemplates, "hooks", "gateguard.cjs");
    const dst = ".claude/hooks/gateguard.cjs";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(src, dst, tokens, "slash-comment", dryRun, ws, {
        relPath: dst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: GATEGUARD_CJS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${dst}`);
      }
    }
  }

  // markered-text (slash-comment) — shell advisories (PreToolUse matcher `Bash`).
  // Covers what the permission table cannot express: URL hosts and shell-as-edit-channel.
  {
    const src = path.join(claudeTemplates, "hooks", "guardrails.cjs");
    const dst = ".claude/hooks/guardrails.cjs";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(src, dst, tokens, "slash-comment", dryRun, ws, {
        relPath: dst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: CLAUDE_GUARDRAILS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${dst}`);
      }
    }
  }

  // cloud-bootstrap.sh belongs to the opt-in `cloud` module (runCloudModule) — it
  // only matters once a Claude Code on the web env is wired (a manual opt-in step),
  // so an install without `--auto=` ships zero cloud footprint. The SessionStart hook
  // entry in .claude/settings.json is guarded (`test -f … || true`) so it no-ops
  // when the script is absent. The `cloud-env-customize` advisory lives there too.

  // .mcp.json — bkit owns only its tracker entry under `mcpServers`; every other key
  // (the consumer's own servers) is kept as-is.
  {
    const mcpSrc = path.join(getTemplatesRoot(), ".mcp.json");
    const mcpDst = ".mcp.json";
    if (fs.existsSync(mcpSrc)) {
      const prevLen = ws.writes.length;
      reconcileMcpJson(mcpSrc, mcpDst, issueTracker, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${mcpDst}`);
      }
    }
  }

  // .bkit/.env.example — owned (Tier 1): the token-placeholder reference, overwritten on
  // every install. Real values go in `.bkit/.env`. Not claude-specific, but the claude
  // module is the default-runs-everywhere module.
  {
    const envExampleSrc = path.join(getTemplatesRoot(), ".bkit", ".env.example");
    const envExampleDst = path.join(".bkit", ".env.example");
    if (fs.existsSync(envExampleSrc)) {
      const prevLen = ws.writes.length;
      writeTier1(envExampleSrc, envExampleDst, tokens, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}claude: ${envExampleDst}`);
      }
    }
  }

  // Task 6.3 — bkit-mode.sh deletion advisory (upgrade-migration drift detection).
  // An older bkit wrote .bkit/scripts/bkit-mode.sh once and left it to the consumer,
  // so upgrade does not remove it, and bkit does not ship it. Detect the orphan and
  // advise deletion — provider selection is the opencode host (additive, via
  // `bkit install --opencode=<provider>`); bkit has no `bkit mode` surface or ccr router.
  //
  // The advisory explicitly names the shell-rc source line removal step because
  // bkit-mode.sh installs a bkit() shell-function shim via `source .../bkit-mode.sh`
  // in ~/.zshrc/~/.bashrc. Deleting the file without removing the source line leaves
  // a broken source call that errors on every new shell.
  {
    const modeDst = ".bkit/scripts/bkit-mode.sh";
    if (fs.existsSync(modeDst)) {
      advisories.push({
        id: "bkit-mode-sh-deletion-required",
        severity: "advisory",
        detect:
          ".bkit/scripts/bkit-mode.sh is present but bkit does not manage it. bkit has no `bkit mode` surface or ccr router, which this script depends on. Keeping this file creates a broken shell-rc source call on every new terminal.",
        action:
          "1. Delete the orphan script: rm .bkit/scripts/bkit-mode.sh\n" +
          "2. Remove the source line from your shell rc (~/.zshrc or ~/.bashrc): delete or comment out the line that reads `source <repo-path>/.bkit/scripts/bkit-mode.sh`.\n" +
          "3. Provider selection is an install operation: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode-zen`). The claude host installs with `--claude`.\n" +
          "4. Check your installed hosts and credentials: `bkit doctor` (credentials + tools) and `bkit status` (installed hosts + providers).",
      });
    }
  }

  // Generated copy-paste-ready Claude-on-web setup doc — `.claude/cloud.md`.
  // UNTRACKED + gitignored (see .bkit/templates/gitignore): writeClaudeCloudDoc
  // inlines REAL secret values resolved from the consumer's `.envrc` (dotenv
  // sources minus its unsets minus session-hijack keys, per bkit-cloud-env.ts), so
  // it must never be committed and deliberately does NOT enter ws.writes /
  // canonicalHashes / `bkit check` drift — values are machine-local and expected to
  // differ. Skipped on dry-run (`bkit check`) so a read-only check never writes
  // secrets. Upgrade regenerates it via the same helper (see runUpgrade caller).
  if (!dryRun && writeClaudeCloudDoc(process.cwd(), tokens)) {
    console.log(
      `${logPrefix} ${tag}claude: .claude/cloud.md (generated — gitignored, holds resolved secrets)`,
    );
  }
}

// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------

export function runCursorModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;

  // Source-rendered agents/commands (.cursor/agents T3 from .bkit/prompts, .cursor/commands
  // T1/T2 from .bkit/workflows). Extracted to renderCursorAgentsCommands so `bkit upgrade`
  // re-renders them identically (#251) — bkit-owned output, force-overwritten.
  renderCursorAgentsCommands(ctx);

  // Tier 2 JSON (contained) — deep-containment: hooks.json
  // Phase 1: run migrateLegacyBkitEnvelope to strip __bkit__ before writing.
  const cursorTemplates = path.join(getTemplatesRoot(), ".cursor");
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
  // markers is preserved. `.cursor/Dockerfile` is a template (`.bkit/templates.md`).
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

  // markered-text (slash-comment) — Cursor destructive-op / secret-exposure guardrails
  // (parity with Claude permissions deny/ask and OpenCode permission map). bkit owns
  // only the decision engine between the markers; consumers own the stdin/stdout driver
  // from first install onward, same split as the two GateGuard hooks.
  {
    const src = path.join(cursorTemplates, "hooks", "guardrails.cjs");
    const dst = ".cursor/hooks/guardrails.cjs";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(src, dst, tokens, "slash-comment", dryRun, ws, {
        relPath: dst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: GUARDRAILS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${dst}`);
      }
    }
  }

  // markered-text (slash-comment) — GateGuard advisory PreToolUse hook for Cursor.
  // Same managed block as the Claude twin; the driver outside it adapts Cursor's
  // payload (relative file_path, no subagent marker) and emits Cursor's shape.
  {
    const src = path.join(cursorTemplates, "hooks", "gateguard.cjs");
    const dst = ".cursor/hooks/gateguard.cjs";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(src, dst, tokens, "slash-comment", dryRun, ws, {
        relPath: dst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: GATEGUARD_CJS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${dst}`);
      }
    }
  }

  // .cursor/mcp.json — same per-entry ownership as .mcp.json (reconcileMcpJson).
  {
    const cursorMcpSrc = path.join(cursorTemplates, "mcp.json");
    const cursorMcpDst = path.join(".cursor", "mcp.json");
    if (fs.existsSync(cursorMcpSrc)) {
      const prevLen = ws.writes.length;
      reconcileMcpJson(cursorMcpSrc, cursorMcpDst, issueTracker, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${cursorMcpDst}`);
      }
    }
  }

  // Cursor-only runtime curl/wget allowlist (guardrails.cjs reads `.cursor/allowlist.json`).
  // Same domain set as Claude WebFetch / OpenCode bash allows — sourced from tooling
  // defaults ∪ consumer `allowed-domains`. Not under `.bkit/` (IDE-scoped artifact).
  // Cursor CLI / cloud-agent MCP allows (`.cursor/cli.json`) from consumer `mcp-servers` —
  // same server set as Claude `mcp__…` allows / OpenCode `<server>_*` permission rows.
  for (const art of [
    writeNetworkAllowlistArtifact(process.cwd(), dryRun),
    writeCursorCliPermissionsArtifact(process.cwd(), dryRun),
  ]) {
    if (art.wrote) {
      ws.writes.push({ path: art.path, action: "write" });
      console.log(`${logPrefix} ${tag}cursor: ${art.path}`);
    }
  }

  // Post-install advisory: macOS GUI-isolation note.
  // MCP token placeholders (${BKIT_GH_TOKEN}, ${BKIT_LINEAR_API_KEY}, …) in .cursor/mcp.json are
  // expanded by Cursor from the process environment. When Cursor is launched from the
  // Dock/Finder (launchd), it does NOT inherit the login-shell / direnv env — tokens
  // resolve empty and MCP calls fail with auth errors (#279/#280).
  advisories.push({
    id: "cursor-gui-isolation",
    severity: "advisory",
    detect:
      "Cursor's MCP token placeholders (${BKIT_GH_TOKEN}, …) resolve from process.env. " +
      "Dock/Finder-launched Cursor does not inherit the login-shell / direnv env.",
    action:
      "[cursor] Use `bkit cursor` to launch Cursor — it execs the binary directly with " +
      ".bkit/.env merged into the environment so MCP tokens resolve correctly. " +
      "Quit Cursor first (a running instance will not see the new env). " +
      'Alternative: `launchctl setenv BKIT_GH_TOKEN "$BKIT_GH_TOKEN"` (session-scoped; must re-run after reboot) ' +
      "then relaunch from Dock.",
  });

  // Generated copy-paste-ready Cursor Background Agents setup doc — `.cursor/cloud.md`.
  // Twin of `.claude/cloud.md` (runClaudeModule): UNTRACKED + gitignored, inlines REAL
  // secret values resolved from `.envrc` under the Cursor env-var policy (Linear tracker
  // adds BKIT_LINEAR_API_KEY, no autocompact knob). Never enters ws.writes / canonicalHashes /
  // `bkit check` drift — values are machine-local and expected to differ. Skipped on
  // dry-run (`bkit check`) so a read-only check never writes secrets. Upgrade regenerates
  // it via the same helper (see runUpgrade caller).
  if (!dryRun && writeCursorCloudDoc(process.cwd(), tokens, issueTracker)) {
    console.log(
      `${logPrefix} ${tag}cursor: .cursor/cloud.md (generated — gitignored, holds resolved secrets)`,
    );
  }
}

// ---------------------------------------------------------------------------
// runOpencodeModule — opencode provider-agnostic host (opt-in via --opencode=<provider>)
//
// Additive alongside always-on claude/cursor: .opencode/agents/*.md (via applyOpencodeAgent),
// .opencode/commands/*.md (via applyOpencodeCommand + tracker substitution),
// .opencode/opencode.json (Tier-2 deep-contained), .opencode/plugin/gateguard.js (Tier-1).
//
// Dir names: .opencode/agents/ and .opencode/commands/ (plural) per opencode.ai/docs.
// Spike initially observed singular; official docs are plural — plural is correct.
//   .opencode/plugin/   (singular, not plugins/)
//
// Provider config is seeded into opencode.json; consumers tune model IDs and provider
// keys after install. opencode.json is Tier-2 deep-contained (ownership-mixed) so bkit
// reconverges its keys on upgrade without clobbering consumer additions (KN-17).
// ---------------------------------------------------------------------------

/**
 * The opencode-side provider id for a bkit provider key. Equal to the key for all providers
 * (opencode → opencode, openrouter → openrouter, etc.). Model ids are `<providerId>/<model>`. Unknown
 * keys pass through unchanged.
 */
export function opencodeProviderId(providerKey: string): string {
  return OPENCODE_PROVIDER_DEFAULTS[providerKey]?.providerId ?? providerKey;
}

/**
 * The provider secret env var name for a bkit provider key (`BKIT_OPENROUTER_API_KEY`,
 * `BKIT_OPENCODE_API_KEY`, ...). Empty string for an unknown key. Mirrors
 * {@link opencodeProviderId}; used to compare a self-installed opencode.yml handler's `env:`
 * secret against the installed provider.
 */
export function opencodeProviderEnvVar(providerKey: string): string {
  return OPENCODE_PROVIDER_DEFAULTS[providerKey]?.envVar ?? "";
}

/**
 * Detect drift between the self-installed `.github/workflows/opencode.yml` reactive `/oc` handler
 * and the installed opencode provider.
 *
 * opencode.yml is NOT bkit-managed: it is self-installed via `opencode github install` (the `/oc`
 * | `/opencode` comment handler — the opencode analogue of the App-generated claude.yml). It
 * HARDCODES two provider-specific values: a `model: <providerId>/<model>` line and a provider
 * secret `env:` var. `bkit install --opencode=<provider>` rewrites neither, so switching providers
 * silently leaves the handler calling the wrong provider's model and authenticating with the wrong
 * (likely-unset) secret.
 *
 * bkit-cloud.yml (the cloud lane, copied from bkit's template) has NO such problem: it runs
 * `opencode run` against the committed `.opencode/` config and fans one `OPENCODE_PROVIDER_KEY`
 * secret out to every provider env var, so it self-syncs on a provider switch. Only the reactive
 * handler drifts — hence a manual-fix advisory rather than an auto-rewrite.
 *
 * File-existence guarded (no-op when opencode.yml is absent) so it is safe to ship: it fires only
 * for repos that self-installed the /oc handler. No equivalent check for claude.yml — the @claude
 * handler is provider-fixed to Claude and has nothing to compare. Non-fatal (severity "advisory"):
 * bkit does not own the file, so this never gates `bkit check`; it surfaces on both check and
 * postinstall as a nudge to hand-edit.
 */
export function detectOpencodeYmlProviderDrift(cwd: string): PreflightFinding | null {
  const ymlPath = path.join(cwd, ".github", "workflows", "opencode.yml");
  if (!fs.existsSync(ymlPath)) return null;

  // The installed provider — package.json `bkit.opencodeProvider` is the authoritative record
  // written on install. Absent/broken → we cannot know the intended provider; the null-guard
  // below skips silently (no false alarm).
  let provider: string | null = null;
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
        bkit?: { opencodeProvider?: unknown };
      };
      if (typeof pkg.bkit?.opencodeProvider === "string") provider = pkg.bkit.opencodeProvider;
    } catch {
      // Malformed package.json — leave provider null; a JSON-drift advisory covers that separately.
    }
  }
  if (!provider) return null;

  const expectedPrefix = opencodeProviderId(provider); // model id form is `<providerId>/<model>`
  const expectedEnvVar = opencodeProviderEnvVar(provider);
  if (!expectedEnvVar) return null; // unknown provider key — no registry entry to compare against.

  const content = fs.readFileSync(ymlPath, "utf-8");

  // The handler's hardcoded `model: <providerId>/<model>` line (opencode `run --model`).
  const ymlModel = content.match(/^\s*model:\s*(\S+)/m)?.[1] ?? null;
  const ymlPrefix = ymlModel ? ymlModel.split("/")[0] : null;
  // The handler's hardcoded provider secret — an `env:` key like BKIT_OPENROUTER_API_KEY / BKIT_OPENCODE_API_KEY.
  const ymlEnvVar = content.match(/^\s*([A-Z][A-Z0-9_]*(?:_API_KEY|_HOST)):/m)?.[1] ?? null;

  // Two independent drift signals. The model prefix is the precise one (it distinguishes the two
  // opencode gateways that share BKIT_OPENCODE_API_KEY); the env var catches a wrong/absent secret.
  const modelDrift = ymlPrefix !== null && ymlPrefix !== expectedPrefix;
  const envDrift = !new RegExp(`\\b${expectedEnvVar}\\b`).test(content);
  if (!modelDrift && !envDrift) return null;

  const foundModel = ymlModel ?? "(none)";
  const foundEnvVar = ymlEnvVar ?? "(none)";

  return {
    id: "opencode-yml-provider-drift",
    severity: "advisory",
    detect:
      ".github/workflows/opencode.yml (the self-installed /oc handler, NOT bkit-managed) is pinned to model `" +
      foundModel +
      "` with secret `" +
      foundEnvVar +
      "`, but the installed opencode provider is `" +
      provider +
      "` (model ids `" +
      expectedPrefix +
      "/<model>`, secret `" +
      expectedEnvVar +
      "`). The reactive handler will call the wrong provider's model and/or authenticate with the wrong (likely-unset) secret. bkit install does not rewrite this file.",
    action:
      "opencode.yml is self-installed via `opencode github install` and is NOT bkit-managed, so `bkit install --opencode=<provider>` will not fix it. Hand-edit the two hardcoded lines to match the installed provider:\n\n" +
      "      env:\n" +
      "        " +
      expectedEnvVar +
      ": ${{ secrets." +
      expectedEnvVar +
      " }}\n" +
      "      with:\n" +
      "        model: " +
      expectedPrefix +
      "/<model>   # a model your provider serves (see .opencode/opencode.json)\n\n" +
      "Keep opencode.yml in sync with .opencode/opencode.json on every provider switch. (bkit-cloud.yml needs no such edit: it reads .opencode/ and fans OPENCODE_PROVIDER_KEY out to every provider env var.)",
  };
}

// Sentinel values used in the opencode.json template for tracker-filtered mcp injection.
const OPENCODE_TRACKER_MCP_SENTINEL = '"@@OPENCODE_TRACKER_MCP@@": {}';
const OPENCODE_PROVIDER_KEY_SENTINEL = "@@OPENCODE_PROVIDER_KEY@@";
const OPENCODE_PROVIDER_ENV_VAR_SENTINEL = "@@OPENCODE_PROVIDER_ENV_VAR@@";
const OPENCODE_PROVIDER_BASE_URL_SENTINEL = "@@OPENCODE_PROVIDER_BASE_URL@@";

/**
 * Render the opencode.json template with tracker-filtered mcp + provider config.
 * Resolves the @@OPENCODE_TRACKER_MCP@@ sentinel into the correct mcpServers entry
 * and fills in provider-specific fields.
 *
 * Also injects `curl *{domain}*` / `wget *{domain}*` **allow** rules (after the
 * template's `curl *` / `wget *` ask) for {@link resolveNetworkAllowlist} so
 * context-fetch / provider hosts do not prompt (OpenCode bash is last-match-wins), and
 * `<server>_*` allows for the consumer's `mcp-servers` block.
 */
export function renderOpencodeJson(
  templatePath: string,
  tracker: IssueTracker,
  provider: string,
  cwd: string = process.cwd(),
): string {
  const raw = fs.readFileSync(templatePath, "utf-8");
  // Strict allowlist: provider is gated to OPENCODE_PROVIDERS at the CLI, so it is always
  // a known key here. An unknown id is a caller bug — fail loudly rather than emitting a
  // non-working endpoint or silently substituting another provider.
  const providerDefaults = OPENCODE_PROVIDER_DEFAULTS[provider];
  if (!providerDefaults) {
    throw new Error(`renderOpencodeJson: unknown opencode provider ${JSON.stringify(provider)}`);
  }

  // Resolve tracker MCP entry
  // opencode's MCP schema differs from Claude/Cursor: remote servers use type "remote"
  // (NOT "http" — not in opencode's enum, which makes the whole config invalid) and read
  // secrets via {env:VAR} (NOT shell ${VAR}). See https://opencode.ai/config.json.
  let mcpEntry: string;
  if (tracker === "github") {
    mcpEntry =
      '"github": { "type": "remote", "url": "https://api.githubcopilot.com/mcp/", "headers": { "Authorization": "Bearer {env:BKIT_GH_TOKEN}", "X-MCP-Toolsets": "context,issues,pull_requests,repos,users,projects" } }';
  } else if (tracker === "linear") {
    mcpEntry = '"linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }';
  } else {
    mcpEntry = "";
  }

  let rendered = raw.replace(OPENCODE_TRACKER_MCP_SENTINEL, mcpEntry);
  rendered = rendered.replace(OPENCODE_PROVIDER_KEY_SENTINEL, provider);
  rendered = rendered.replace(OPENCODE_PROVIDER_ENV_VAR_SENTINEL, providerDefaults.envVar);
  rendered = rendered.replace(OPENCODE_PROVIDER_BASE_URL_SENTINEL, providerDefaults.baseURL);

  // Parse + re-serialize to normalise JSON (removes empty mcp entry if tracker=none)
  try {
    const parsed = JSON.parse(rendered) as Record<string, unknown>;
    // Clean up empty mcp object when tracker=none
    const mcp = parsed.mcp as Record<string, unknown> | undefined;
    if (mcp && Object.keys(mcp).length === 0) {
      delete parsed.mcp;
    }
    // Built-in opencode gateways (Zen/Go): opencode resolves the provider from models.dev,
    // so there is no npm driver and no baseURL — emit a minimal block keyed by the
    // opencode-side provider id carrying only the apiKey ({env:BKIT_OPENCODE_API_KEY}).
    if (providerDefaults.builtin) {
      const pid = providerDefaults.providerId ?? provider;
      const options: Record<string, unknown> = { apiKey: providerDefaults.apiPlaceholder };
      (parsed.provider as Record<string, unknown>) = { [pid]: { options } };
      injectOpencodeDerivedAllows(parsed, cwd);
      return JSON.stringify(parsed, null, 2) + "\n";
    }
    // For npm-based custom providers (e.g. openrouter), replace the api-openai provider
    // block with the npm-driver format: { npm, name, options: { baseURL, apiKey } }
    if (providerDefaults.npmPackage) {
      // Every custom provider carries an apiKey as {env:VAR}. opencode rejects an unknown
      // "api" field, so the block is rebuilt to the npm-driver shape only.
      const options: Record<string, unknown> = {
        baseURL: providerDefaults.baseURL,
        apiKey: providerDefaults.apiPlaceholder,
      };
      (parsed.provider as Record<string, unknown>) = {
        [provider]: {
          npm: providerDefaults.npmPackage,
          name: providerDefaults.displayName ?? provider,
          options,
        },
      };
    }
    injectOpencodeDerivedAllows(parsed, cwd);
    return JSON.stringify(parsed, null, 2) + "\n";
  } catch {
    return rendered;
  }
}

/**
 * Append curl/wget domain allows after template ask rules (OpenCode last-match-wins),
 * and one `<server>_*` allow per declared MCP server — opencode names MCP tools
 * `<server>_<tool>` and matches permission keys as globs against the tool name.
 */
function injectOpencodeDerivedAllows(parsed: Record<string, unknown>, cwd: string): void {
  const permission = parsed.permission as Record<string, unknown> | undefined;
  if (!permission) return;
  for (const server of extractMcpServers(cwd)) {
    permission[`${server}_*`] = "allow";
  }
  if (typeof permission.bash !== "object" || permission.bash === null) return;
  const bash = permission.bash as Record<string, string>;
  for (const base of networkAllowlistBases(resolveNetworkAllowlist(cwd))) {
    bash[`curl *${base}*`] = "allow";
    bash[`wget *${base}*`] = "allow";
  }
}

/**
 * Ensure Claude `permissions.allow` covers {@link resolveClaudeDerivedAllows} —
 * `WebFetch(domain:…)` per network-allowlist host and `mcp__…` per declared MCP server.
 * Claude rules match a command prefix, not a URL host, so curl cannot be excepted
 * by domain — network allowlisting for Claude is WebFetch-only; shell curl runs under
 * Bash(*), gated by `deny` and the auto-mode classifier rather than an ask row.
 * Called from install (`runClaudeModule`) and upgrade (mirror — upgrade does not
 * dispatch modules).
 *
 * Adds AND prunes, but only ever removes a grant bkit itself recorded writing. The
 * record is `claudeAllowDerived` in `.bkit/version`: a grant in that list and no longer
 * in the derived set is bkit's to remove; a grant the consumer added by hand was
 * never recorded, so it is never touched. An absent or empty record means bkit claims
 * authorship of nothing and prunes nothing — old consumers converge by addition only.
 *
 * Returns the set to record for next time, or `null` when nothing was determined and
 * the caller must leave the prior record alone: no settings file, unparseable JSON,
 * a non-array `allow`, or a dry run. `null` is a statement about PROVENANCE, never
 * about the write set — the `ws.writes` push below still fires under `dryRun`, because
 * it is the entire `bkit check` drift signal for `.claude/settings.json`.
 */
export function enrichClaudeSettingsAllows(
  settingsDst: string,
  cwd: string,
  dryRun: boolean,
  ws: WriteSet,
  advisories?: PreflightFinding[],
): readonly string[] | null {
  if (!fs.existsSync(settingsDst)) return null;
  let doc: {
    permissions?: { allow?: string[] };
  };
  try {
    doc = JSON.parse(fs.readFileSync(settingsDst, "utf-8")) as typeof doc;
  } catch {
    return null;
  }
  const allow = doc.permissions?.allow;
  if (!Array.isArray(allow)) return null;

  const needed = resolveClaudeDerivedAllows(cwd);
  const recorded = readBkitVersion(path.join(cwd, ".bkit", "version"))?.claudeAllowDerived ?? [];
  const add = needed.filter((r) => !allow.includes(r));
  // Only what bkit recorded writing AND the derived set no longer wants.
  const remove = recorded.filter((r) => !needed.includes(r) && allow.includes(r));

  if (add.length > 0 || remove.length > 0) {
    if (!dryRun) {
      doc.permissions!.allow = [...allow.filter((r) => !remove.includes(r)), ...add];
      fs.writeFileSync(settingsDst, JSON.stringify(doc, null, 2) + "\n", "utf-8");
    }
    // Outside the dryRun guard on purpose — see the provenance note above.
    if (!ws.writes.some((w) => w.path === settingsDst)) {
      ws.writes.push({ path: settingsDst, action: "write" });
    }
    if (remove.length > 0 && advisories) {
      advisories.push({
        id: "derived-grants-pruned",
        severity: "advisory",
        detect: `bkit removed ${remove.length} permissions.allow grant(s) it had previously added and no longer derives: ${remove.join(", ")}.`,
        action:
          "Nothing to do — a grant bkit added for a host or MCP server it no longer derives (dropped from .agents/context.md allowed-domains / mcp-servers, or no longer shipped) was withdrawn. To keep one, add it back to permissions.allow in .claude/settings.json by hand and bkit will leave it alone from then on.",
      });
    }
  }
  return dryRun ? null : needed;
}

/**
 * `ask` rules an older bkit shipped, which bkit removes. Matched by exact string.
 *
 * A content-scoped `ask` rule such as `Bash(curl:*)` / `Bash(wget:*)` is evaluated
 * BEFORE the auto-mode classifier and always forces a prompt — beating even a matching
 * `allow`, in every permission mode. A cloud session cannot answer one, so every
 * `context=web` context-fetch block stalls on it. Claude's rules match a command prefix,
 * not a URL host, so there is no per-domain exception to carve out the way
 * `guardrails.cjs` does on Cursor and `curl *{domain}*` allows do on opencode. Shell curl
 * runs under `Bash(*)`; `deny` still blocks and the auto-mode classifier still sees the
 * command.
 */
const RETIRED_CLAUDE_ASK_RULES: readonly string[] = ["Bash(curl:*)", "Bash(wget:*)"];

/**
 * Remove {@link RETIRED_CLAUDE_ASK_RULES} from a consumer's `.claude/settings.json`.
 *
 * A template edit alone does NOT reach existing consumers: `.claude/settings.json` is
 * Tier 2 JSON deep-containment and the merge is ADDITIVE — it never prunes, so a row
 * bkit stops shipping stays in every installed repo forever. This is the one-shot
 * prune, and it is deliberately narrow: exact string match on the two rows bkit
 * itself shipped, nothing pattern-based. A consumer's own `ask` rows — including a
 * hand-written curl rule in any other form — are untouched.
 *
 * Idempotent (no-op once absent), dry-run aware, and called from BOTH engines:
 * install dispatches modules, upgrade does not, and `bkit upgrade --latest` is the
 * path the README points consumers at. Mirrors {@link enrichClaudeSettingsAllows}.
 */
export function pruneRetiredClaudeAskRules(
  settingsDst: string,
  dryRun: boolean,
  ws: WriteSet,
): string | null {
  if (!fs.existsSync(settingsDst)) return null;
  let doc: { permissions?: { ask?: string[] } };
  try {
    doc = JSON.parse(fs.readFileSync(settingsDst, "utf-8")) as typeof doc;
  } catch {
    // Malformed consumer JSON: leave it alone rather than rewrite what we can't read.
    return null;
  }
  const ask = doc.permissions?.ask;
  if (!Array.isArray(ask)) return null;
  const removed = ask.filter((r) => RETIRED_CLAUDE_ASK_RULES.includes(r));
  if (removed.length === 0) return null;
  if (!dryRun) {
    doc.permissions!.ask = ask.filter((r) => !RETIRED_CLAUDE_ASK_RULES.includes(r));
    fs.writeFileSync(settingsDst, JSON.stringify(doc, null, 2) + "\n", "utf-8");
  }
  if (!ws.writes.some((w) => w.path === settingsDst)) {
    ws.writes.push({ path: settingsDst, action: "write" });
  }
  return `removed retired ask rule(s) from ${settingsDst}: ${removed.join(", ")} — shell curl/wget prompted in every mode, including cloud sessions that cannot answer`;
}

/**
 * Reconcile a consumer's `.opencode/opencode.json` against the freshly-rendered template.
 * Install is additive across provider keys: existing blocks for other providers
 * (bkit-seeded or consumer-added) are preserved. For each provider key present in the
 * template, the block is REPLACED (not deep-merged) so a hijacked npm/baseURL cannot
 * survive reinstall — deepContains alone would treat a corrupted supersets-of-template
 * block as already satisfied.
 *
 * To remove a stale bkit provider block (e.g. after switching providers), use the surgical
 * `removeOpencodeProviderBlock` below — called by the uninstall path, not install.
 *
 * Mirrors writeTier2JsonContained's contract (first-install write, idempotent no-op via
 * final equality, else merge), so dry-run and real runs compute the identical writeset.
 */
export function reconcileOpencodeJson(
  renderedTemplate: string,
  relDst: string,
  dryRun: boolean,
  ws: WriteSet,
): void {
  const template = JSON.parse(renderedTemplate) as Record<string, JsonValue>;

  if (!fs.existsSync(relDst)) {
    // First install — write template as-is.
    if (!dryRun) {
      ensureDir(path.dirname(relDst));
      fs.writeFileSync(relDst, JSON.stringify(template, null, 2) + "\n", "utf-8");
    }
    ws.writes.push({ path: relDst, action: "write" });
    return;
  }

  // Parse into a sentinel and validate AFTER the catch — keeping the throw out of the catch
  // body (matches the codebase's parse-or-sentinel idiom; a throw inside catch obscures the
  // original error). Malformed consumer JSON is a hard stop: refuse to merge, require a fix.
  let existing: Record<string, JsonValue> | null = null;
  try {
    existing = JSON.parse(fs.readFileSync(relDst, "utf-8")) as Record<string, JsonValue>;
  } catch {
    existing = null;
  }
  if (existing === null) {
    throw new Error(
      `[bkit] ${relDst} is malformed JSON — fix manually before running bkit install`,
    );
  }

  const merged = deepMergeJson(existing as JsonValue, template as JsonValue) as Record<
    string,
    JsonValue
  >;
  // Replace (do not deep-merge) each provider key the template seeds — heals hijacked
  // npm/baseURL/name while keeping other provider keys additive.
  //
  // Preserve the EXISTING file's provider key order. deepMergeJson orders template keys
  // first (correct for last-match-wins maps like permission.bash), but for the provider
  // map that reordering is churn: reconciling one provider (e.g. an "additional provider"
  // block on `bkit upgrade`) would move it ahead of the others, so install (active
  // provider only) and upgrade (every installed provider) render a DIFFERENT order and
  // `bkit check` never settles. Rebuild from the existing order — replacing template-seeded
  // blocks in place — then append genuinely-new template providers in template order.
  const tmplProv = template.provider;
  if (tmplProv !== null && typeof tmplProv === "object" && !Array.isArray(tmplProv)) {
    const tmplProvObj = tmplProv as Record<string, JsonValue>;
    const existingProvObj =
      existing.provider !== null &&
      typeof existing.provider === "object" &&
      !Array.isArray(existing.provider)
        ? (existing.provider as Record<string, JsonValue>)
        : ({} as Record<string, JsonValue>);
    const orderedProv: Record<string, JsonValue> = {};
    for (const k of Object.keys(existingProvObj)) {
      orderedProv[k] =
        k in tmplProvObj
          ? (JSON.parse(JSON.stringify(tmplProvObj[k])) as JsonValue)
          : existingProvObj[k];
    }
    for (const [k, v] of Object.entries(tmplProvObj)) {
      if (!(k in orderedProv)) orderedProv[k] = JSON.parse(JSON.stringify(v)) as JsonValue;
    }
    merged.provider = orderedProv;
  }

  const mergedStr = JSON.stringify(merged, null, 2) + "\n";
  if (mergedStr === fs.readFileSync(relDst, "utf-8")) return; // idempotent guard
  if (!dryRun) {
    fs.writeFileSync(relDst, mergedStr, "utf-8");
  }
  ws.writes.push({ path: relDst, action: "update" });
}

/**
 * Remove exactly one bkit-seeded provider block from the consumer's opencode.json.
 * `dst` may be an absolute or relative path (fs.* accepts both).
 * Used by the surgical uninstall path — this is NOT called during install (install is additive).
 * Compares on opencodeProviderId(providerKey) to resolve the opencode-side block key.
 * The caller is responsible for passing only bkit-seeded provider keys; this function does not
 * validate providerKey against OPENCODE_PROVIDER_DEFAULTS (bkit-registry.ts).
 */
export function removeOpencodeProviderBlock(
  dst: string,
  providerKey: string,
  dryRun: boolean,
  ws: WriteSet,
): void {
  if (!fs.existsSync(dst)) return;
  // Parse-or-sentinel idiom: keep the early-return outside the catch body.
  let existing: Record<string, JsonValue> | null = null;
  try {
    existing = JSON.parse(fs.readFileSync(dst, "utf-8")) as Record<string, JsonValue>;
  } catch {
    existing = null;
  }
  if (existing === null) {
    console.warn(`[bkit] ${dst} is malformed — leaving as-is`);
    return;
  }
  const blockKey = opencodeProviderId(providerKey);
  const providerObj = existing.provider;
  if (providerObj === null || typeof providerObj !== "object" || Array.isArray(providerObj)) return;
  const pObj = providerObj as Record<string, JsonValue>;
  if (!(blockKey in pObj)) return; // already absent — idempotent
  delete pObj[blockKey];
  if (Object.keys(pObj).length === 0) delete existing.provider;
  const updatedStr = JSON.stringify(existing, null, 2) + "\n";
  if (!dryRun) {
    fs.writeFileSync(dst, updatedStr, "utf-8");
  }
  ws.writes.push({ path: dst, action: "update" });
}

export function runOpencodeModule(ctx: ModuleContext): void {
  const { dryRun, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  // See renderOpencodeAgentsCommands — the opencode host is unary; no provider is a bug.
  if (!ctx.opencodeProvider) {
    throw new Error("runOpencodeModule: ctx.opencodeProvider is required");
  }
  const provider = ctx.opencodeProvider;

  // Source-rendered agents/commands (.opencode/agents + .opencode/commands). Extracted to
  // renderOpencodeAgentsCommands so `bkit upgrade` re-renders them identically (#251) —
  // bkit-owned output, force-overwritten.
  renderOpencodeAgentsCommands(ctx);

  // --- opencode.json — Tier-2 deep-contained (reconverged on upgrade) ---
  {
    const opencodeTplDir = path.join(getTemplatesRoot(), ".opencode");
    const jsonSrc = path.join(opencodeTplDir, "opencode.json");
    const jsonDst = ".opencode/opencode.json";
    if (fs.existsSync(jsonSrc)) {
      // Render the template with tracker-filtered mcp + provider config, then reconcile it into
      // the consumer file. Install is additive: existing provider blocks are preserved.
      // reconcileOpencodeJson computes an identical writeset for dry-run vs real runs — no
      // `.bkit-staging` scratch file.
      const rendered = renderOpencodeJson(jsonSrc, issueTracker, provider, process.cwd());
      const prevLen = ws.writes.length;
      reconcileOpencodeJson(rendered, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}opencode: ${jsonDst}`);
      }
    }
  }

  // --- gateguard.js — Tier-2 markered-text (slash-comment); see bkit-manifest.ts ---
  {
    const opencodeTplDir = path.join(getTemplatesRoot(), ".opencode");
    const pluginSrc = path.join(opencodeTplDir, "plugin", "gateguard.js");
    const pluginDst = ".opencode/plugin/gateguard.js";
    if (fs.existsSync(pluginSrc)) {
      // dryRun-gated — writeTier2 honours dryRun, so the dir is only needed for a real
      // write; keeps `bkit check` read-only when gateguard's parent dir is absent (#255 #8).
      if (!dryRun) ensureDir(path.dirname(pluginDst));
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(pluginSrc, pluginDst, ctx.tokens, "slash-comment", dryRun, ws, {
        relPath: pluginDst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: GATEGUARD_JS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}opencode: ${pluginDst}`);
      }
    }
  }

  // opencode post-install advisory — provider key + launch + model-ID lookup pointer.
  advisories.push({
    id: "opencode-setup",
    severity: "advisory",
    detect: `opencode host installed (provider: ${provider}). The opencode CLI and your provider credentials are required before running agents.`,
    action:
      `opencode setup for provider "${provider}":\n\n` +
      (() => {
        const pd = OPENCODE_PROVIDER_DEFAULTS[provider];
        if (!pd) {
          return (
            `  1. Set ${provider.toUpperCase()}_API_KEY in your environment / .bkit/.env.\n` +
            `  2. Update .opencode/opencode.json provider.${provider}.options.baseURL for your endpoint.\n`
          );
        }
        // opencode-native gateways (opencode-zen / opencode-go) → BKIT_OPENCODE_API_KEY only.
        // Built-in: no baseURL to seed; models use the opencode-side provider id.
        if (pd.builtin || pd.envVar === "BKIT_OPENCODE_API_KEY") {
          const modelPrefix = opencodeProviderId(provider);
          return (
            `  1. opencode gateway "${provider}". Create an API key at https://opencode.ai/auth (one BKIT_OPENCODE_API_KEY covers both opencode-zen and opencode-go).\n` +
            `  2. Set ${pd.envVar} in your environment / .bkit/.env:\n` +
            `     ${pd.envVar}=<your-api-key>\n` +
            `  3. Built-in provider (no npm/baseURL). Models are referenced as ${modelPrefix}/<id>.\n`
          );
        }
        return (
          `  1. Set ${pd.envVar} in your environment / .bkit/.env:\n` +
          `     ${pd.envVar}=<your-api-key>\n` +
          `  2. Provider base URL is pre-seeded: ${pd.baseURL}.\n`
        );
      })() +
      `  3. Launch opencode: \`opencode\` (CLI, reads .opencode/opencode.json automatically), or\n` +
      `     \`bkit opencode\` to launch the desktop app with .bkit/.env merged into its environment.\n` +
      `     macOS GUI apps launched from the Dock/Finder do not inherit the login-shell / direnv\n` +
      `     env — {env:KEY} placeholders in opencode.json resolve empty without this. Quit the\n` +
      `     running app first (a running instance ignores the new env).\n` +
      `  4. Model IDs: all four providers (openrouter, ollama, opencode-zen, opencode-go) install ready-to-run curated per-agent pins. ` +
      `Re-pin any agent via .bkit/prompts.md § Model Overrides or by probing the provider's live /v1/models — see .bkit/providers.md § Models. NOTE: ollama opus/convergent pins (kimi-k2.7-code, deepseek-v4-pro) need a paid Ollama plan; its sonnet/haiku pins run on the free tier. opencode-go pins (minimax-m3, qwen3.7-plus, deepseek-v4-pro/-flash) — prefer pins that stay within the Go 5h usage window; opencode-zen pins are existence-validated via models.dev (the /zen/v1/models REST probe cannot see Go-only models — models.dev is the source of truth).\n` +
      `  5. Verify with: \`bkit doctor\` (credentials + tools) and \`bkit status\` (installed hosts + providers).`,
  });
}

// ---------------------------------------------------------------------------
// MCP config — `.mcp.json` (claude) and `.cursor/mcp.json` (cursor). bkit owns only
// its tracker entry under `mcpServers`; the rest of the file is the consumer's.
// ---------------------------------------------------------------------------

/**
 * Render the tracker-filtered `.mcp.json` / `.cursor/mcp.json` content: keep only the selected
 * tracker's `mcpServers` entry (none → empty map). Token-free. This is what a fresh install
 * writes, and its one entry is what `reconcileMcpJson` owns in an existing file.
 */
export function buildMcpJson(templatePath: string, tracker: IssueTracker): string {
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
 * Reconcile bkit's tracker entry into a consumer's `.mcp.json` / `.cursor/mcp.json`. bkit
 * owns exactly one key, `mcpServers[<tracker>]`, and sets it to the template's entry; every
 * other key and the existing key order stay the consumer's. Absent file → write the
 * `buildMcpJson` render. Malformed JSON → throw (refuse to merge; the consumer fixes it).
 * Tracker `none` owns no entry, so a present file is left alone. Writes only on change, so
 * dry-run and live compute the identical WriteSet. Another tracker's entry from an earlier
 * install is left in place (`detectExtraMcpServers` advises on it).
 */
export function reconcileMcpJson(
  templatePath: string,
  relDst: string,
  tracker: IssueTracker,
  dryRun: boolean,
  ws: WriteSet,
): void {
  const rendered = buildMcpJson(templatePath, tracker);
  if (!fs.existsSync(relDst)) {
    if (!dryRun) {
      ensureDir(path.dirname(relDst));
      fs.writeFileSync(relDst, rendered, "utf-8");
    }
    ws.writes.push({ path: relDst, action: "write" });
    return;
  }

  // Parse-or-sentinel idiom (see reconcileOpencodeJson): the throw stays out of the catch.
  let existing: JsonValue | null = null;
  try {
    existing = JSON.parse(fs.readFileSync(relDst, "utf-8")) as JsonValue;
  } catch {
    existing = null;
  }
  if (existing === null || typeof existing !== "object" || Array.isArray(existing)) {
    throw new Error(
      `[bkit] ${relDst} is malformed JSON — fix manually before running bkit install`,
    );
  }

  const owned = (JSON.parse(rendered) as { mcpServers: Record<string, JsonValue> }).mcpServers;
  const servers = existing.mcpServers;
  const serversObj =
    servers !== null && typeof servers === "object" && !Array.isArray(servers) ? servers : {};
  const inSync = Object.entries(owned).every(
    ([k, v]) => JSON.stringify(serversObj[k]) === JSON.stringify(v),
  );
  if (inSync) return;

  const next = { ...existing, mcpServers: { ...serversObj, ...owned } };
  if (!dryRun) fs.writeFileSync(relDst, JSON.stringify(next, null, 2) + "\n", "utf-8");
  ws.writes.push({ path: relDst, action: "update" });
}

// ---------------------------------------------------------------------------
// runLintModule — the owned slop-scan type-suppression plugin. The tool scripts and
// devDeps, slop-scan.config.json, .prettierignore, .lintstagedrc.json, the Vale config
// and the husky hooks ship as templates (`.bkit/templates.md`).
// ---------------------------------------------------------------------------

export function runLintModule(ctx: ModuleContext): void {
  const { dryRun, tokens, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  // Moved OUT of the core template walk (#265) so it ships only with --typescript.
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

// The cloud workflow is a template (`.bkit/templates.md`). Shared first step of the
// claude and opencode setup advisories.
const CLOUD_WORKFLOW_ADOPT_STEP =
  "  - Copy `.bkit/templates/.github/workflows/bkit-cloud.yml` to `.github/workflows/bkit-cloud.yml` and own it: bkit never writes or overwrites that file. Replace the `{{CLOUD_RUNNER}}` placeholder in both jobs' `runs-on` with a runner label (e.g. `ubuntu-latest`). `.bkit/templates.md` lists every placeholder; on each `bkit upgrade`, diff the refreshed template against your copy.\n";

// ---------------------------------------------------------------------------
// runCloudModule — opt-in cloud-agent integration (issue #119, "Managed Cloud Agents")
// ---------------------------------------------------------------------------
//
// NOT shipped by a default install — opt-in via `bkit install --auto=<variant>`,
// so a default install ships ZERO cloud footprint. Variant-split (DECISION-C/D):
//
//   cloud=claude (tracker=github):
//   - `.claude/hooks/cloud-bootstrap.sh`   — Claude Code on the web SessionStart install
//        hook (Tier 2 markered; no-op unless CLAUDE_CODE_REMOTE=true).
//
//   cloud=opencode (tracker=github), cloud=cursor (tracker=linear): no files.
//
// Every variant records `bkit.cloudAgents` and prints its setup advisories. The cloud
// workflow (bkit-cloud.yml) and the Cursor Background Agent files (.cursor/Dockerfile,
// .cursor/environment.json) are templates the advisories point at.
//
// Variant constraints are enforced in bkit-install.ts before dispatch (tracker mismatch
// = hard error). The context's cloudVariant carries the chosen variant.

export function runCloudModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const templates = getTemplatesRoot();
  // Default to "claude" (the Claude/GitHub path) when cloudVariant is not set.
  // Callers should always pass cloudVariant.
  const variant: CloudAgents = ctx.cloudVariant ?? "claude";

  if (variant === "claude") {
    // --- cloud=claude: GitHub-tracker path ---

    // Claude Code on the web SessionStart install hook — Tier 2 markered.
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

    // Record the variant so the post-install advisory and `bkit check` stay consistent.
    setConsumerBkitField("cloudAgents", "claude", dryRun);

    // Advisory — cloud=claude setup checklist (App required; id-token: write).
    advisories.push({
      id: "bkit-cloud-setup",
      severity: "advisory",
      detect:
        "Cloud agents (claude) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The Claude GitHub App is required for `claude-code-action@v1` to authenticate via OIDC.",
      action:
        "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
        "REQUIRED ONE-TIME SETUP:\n" +
        CLOUD_WORKFLOW_ADOPT_STEP +
        "  - Run `/install-github-app` (Claude Code CLI) to install the Claude GitHub App on your repo. This is required — `claude-code-action@v1` authenticates as the App via OIDC (`id-token: write`); without the App it fails at boot with an OIDC error.\n" +
        "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
        "  - Add `ANTHROPIC_API_KEY` to repo secrets (Settings → Secrets and variables → Actions). Used by `claude-code-action@v1` (job env keeps this vendor name; local `.bkit/.env` stores it as `BKIT_ANTHROPIC_API_KEY`).\n" +
        "  - Do NOT add `BKIT_GH_TOKEN_INSTALL` to this workflow — it is package-install scoped and has no access to the consumer repo. Repo git/gh ops use the auto-provided `github.token` via the workflow's `permissions:` block.\n" +
        "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
        "OPTIONAL (manual phase launch): after `/install-github-app`, comment `@claude /bkit-plan` (or any phase) on a GitHub issue/PR to launch it from the tracker UI. The App's generated `claude.yml` triggers on mention events; `bkit-cloud.yml` triggers on CI completion + `workflow_dispatch` — the two coexist.\n\n" +
        "Both the CI-driven path and the `@claude` mention path invoke the same `/bkit-auto` orchestrator (mirrored to `.claude/commands/bkit-auto.md` on each `pnpm bkit install`).",
    });

    // Advisory — cloud env scaffolding (Claude half).
    advisories.push({
      id: "cloud-env-customize",
      severity: "advisory",
      detect:
        "Cloud env config splits across the repo (`.claude/hooks/cloud-bootstrap.sh`, bkit-managed) and the Claude app dashboard (setup script + env vars + auth tokens, manual).",
      action:
        "Two locations to touch — full recipe in bkit's `cloud.md`.\n\n" +
        "IN REPO (Tier 2 markered; bkit owns content between `# <!-- bkit:start -->` and `# <!-- bkit:end -->`; consumer customises outside):\n" +
        "  - `.claude/hooks/cloud-bootstrap.sh`: add repo-specific install steps after the bkit:end marker (Supabase start, turbo prebuild, etc. — examples inlined).\n\n" +
        "IN CLAUDE APP (claude.ai/code → environment selector → + Add environment):\n" +
        "  - Name: the repo name (e.g. `app-gether-life`; bkit's own is `bkit`) — one environment per repo, since secrets are per-repo.\n" +
        "  - Setup script: paste from bkit's `cloud.md` § Setup script (installs vale + gh + corepack-pinned pnpm — exact versions live in cloud.md, not duplicated here).\n" +
        "  - Environment variables: `BKIT_GH_TOKEN` (fine-grained PAT for GitHub MCP), `BKIT_GH_TOKEN_INSTALL` (classic PAT with read:packages), `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70`.\n" +
        "  - Tracker env vars (GitHub): No tracker PAT needed. Run `gh auth login` once for CLI surface. MCP auth is browser OAuth (automatic on first tool call). Set `BKIT_GH_TOKEN` (fine-grained PAT for GitHub MCP server).\n" +
        "  - Network access: `Trusted` (default). One environment per repo (secrets differ per repo); the setup script + variable *names* are identical across repos, only the values change. See cloud.md § Sharing across repos → Claude.",
    });
  } else if (variant === "opencode") {
    // --- cloud=opencode: GitHub-tracker path (same bkit-cloud.yml template, no OIDC) ---

    // Record the variant.
    setConsumerBkitField("cloudAgents", "opencode", dryRun);

    // Advisory — cloud=opencode setup checklist.
    advisories.push({
      id: "bkit-cloud-setup",
      severity: "advisory",
      detect:
        "Cloud agents (opencode) need the unified cloud workflow (claude + opencode jobs, runtime-gated by secret presence), which ships as a template at `.bkit/templates/.github/workflows/bkit-cloud.yml`. The opencode job runs when `OPENCODE_PROVIDER_KEY` is set.",
      action:
        "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
        "REQUIRED ONE-TIME SETUP:\n" +
        CLOUD_WORKFLOW_ADOPT_STEP +
        "  - Install the local opencode host first: `bkit install --opencode=<provider>` (e.g. `--opencode=opencode`). The cloud opencode job runs against the committed `.opencode/` config — provider and model pins come from there, not from this YAML.\n" +
        "  - Add `OPENCODE_PROVIDER_KEY` to repo secrets (Settings → Secrets and variables → Actions). Set it to your configured provider's API key. The workflow fans this one secret out to every supported provider env var name (`BKIT_OPENROUTER_API_KEY`/`BKIT_OLLAMA_API_KEY`/`BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider you installed.\n" +
        "  - GitHub Actions permissions — flip BOTH org AND repo: Settings → Actions → General → Workflow permissions = **Read and write permissions** + tick **Allow GitHub Actions to create and approve pull requests**.\n" +
        "  - The opencode job does NOT use a Claude API key — it runs the opencode runner with your chosen provider key only. If you also install the claude job (separate secret), both jobs coexist on the same event.\n" +
        "  - Label the issue `bkit:auto` before pushing the build commit — without the label the CI auto-route exits no-op.\n\n" +
        "REACTIVE HANDLER (separate, consumer self-installed): the stock `/oc` comment handler (`opencode github install`) is NOT managed by bkit — install it once per repo independently. It mirrors the `@claude`/`claude.yml` stance. `bkit-cloud.yml` handles the CI-driven + `workflow_dispatch` path only.",
    });
  } else {
    // --- cloud=cursor: Linear-tracker path ---

    // Record the variant.
    setConsumerBkitField("cloudAgents", "cursor", dryRun);

    // Advisory — cloud=cursor setup checklist.
    advisories.push({
      id: "bkit-cloud-setup",
      severity: "advisory",
      detect:
        "Cloud agents (cursor) need the Cursor Background Agent scaffolding, which ships as templates at `.bkit/templates/.cursor/Dockerfile` and `.bkit/templates/.cursor/environment.json`. The Cursor Background Agent trigger is configured in the Cursor cloud agents dashboard — bkit cannot automate that step.",
      action:
        "Full recipe in bkit's `cloud.md` § Post-CI auto-routing.\n\n" +
        "IN CURSOR DASHBOARD:\n" +
        "  - Cursor → Cloud Agents dashboard → Triggers → + Add trigger.\n" +
        "  - Event: CI workflow completion. Branch filter: `feat/**`.\n" +
        "  - Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`.\n" +
        "  - Allowed concurrency: latest-supersedes.\n" +
        "  - Set `BKIT_LINEAR_API_KEY` as a **Runtime Secret** in the Cloud Agents dashboard (https://cursor.com/dashboard/cloud-agents) → your environment → Secrets tab.\n" +
        "  - Label the issue `bkit:auto` in Linear before pushing the build commit.\n\n" +
        "IN REPO (copy each template and own it; bkit never writes or overwrites these files — see `.bkit/templates.md`):\n" +
        "  - `.bkit/templates/.cursor/Dockerfile` → `.cursor/Dockerfile`: change Node major if `engines.node` differs from 20; add Playwright / Supabase CLI / extra apt deps.\n" +
        "  - `.bkit/templates/.cursor/environment.json` → `.cursor/environment.json`: set `install` / `start` / `terminals[]` / `env` for your stack.",
    });

    // Advisory — cloud env scaffolding (Cursor half).
    advisories.push({
      id: "cloud-env-customize",
      severity: "advisory",
      detect:
        "Cloud env config splits across the repo (`.cursor/Dockerfile` + `.cursor/environment.json`, copied from `.bkit/templates/.cursor/`) and the Cursor Cloud Agents dashboard (secrets, manual).",
      action:
        "Copy-paste-ready values (resolved from your `.envrc`) are written to `.cursor/cloud.md` (gitignored) on every install.\n\n" +
        "IN THE CLOUD AGENTS DASHBOARD (https://cursor.com/dashboard/cloud-agents → your environment → Secrets tab) — add each as a **Runtime Secret** (loaded as an env var, redacted from the agent's transcript):\n" +
        "  - `BKIT_GH_TOKEN`, `BKIT_GH_TOKEN_INSTALL`.\n" +
        "  - Tracker secret (Linear): `BKIT_LINEAR_API_KEY` (generate at https://linear.app/settings/api). `LINEAR_ISSUE_ID` is injected per-session — don't hardcode.\n" +
        "  - First session after Dockerfile changes rebuilds the image; subsequent sessions reuse cached layers.\n\n" +
        "Full recipe in bkit's `cloud.md`; the paste-ready block is in `.cursor/cloud.md`.",
    });
  }
}

/**
 * Convert a workflow orchestrator (`.bkit/workflows/*.md`) into a Codex SKILL.md.
 *
 * Codex requires `name` and `description` in the skill frontmatter; the workflows already
 * carry `description`, so `name` is added and the body is kept verbatim (it is the whole
 * point — the workflow steps ARE the skill instructions). Tracker-conditional blocks are
 * resolved first, exactly as for the other hosts' command mirrors.
 */
export function applyCodexSkill(
  content: string,
  skillName: string,
  issueTracker: IssueTracker,
): string {
  const resolved = substituteWorkflow(content, issueTracker).output;
  const fmMatch = resolved.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
  if (!fmMatch) {
    return `---\nname: ${skillName}\ndescription: bkit ${skillName} workflow\n---\n\n${resolved}`;
  }
  const fmBlock = fmMatch[2];
  const body = resolved.slice(fmMatch[0].length);
  const parsed = parseFrontmatter(fmBlock);
  const description = (parsed.get("description") ?? `bkit ${skillName} workflow`).replace(
    /^"|"$/g,
    "",
  );
  return `---\nname: ${skillName}\ndescription: "${description.replace(/"/g, '\\"')}"\n---\n${body}`;
}

// ---------------------------------------------------------------------------
// runCodexModule — Codex CLI host (opt-in via --codex)
//
// Nullary flag, unlike --opencode: Codex has exactly one gateway (`openai`), because the
// ChatGPT subscription is what makes it cheap to run. See PROGRAM_GATEWAYS in bkit-cli.ts.
//
// Renders THREE things, two of them unlike any other host:
//   .codex/agents/<name>.toml          — TOML, not markdown-with-frontmatter
//   .codex/hooks.json + hooks/         — GateGuard registration (PreToolUse / apply_patch)
//   .agents/skills/bkit-<wf>/SKILL.md  — workflow entry points, as SKILLS not commands
//
// Why skills: Codex has NO project-scoped command surface. Custom prompts live only in
// ~/.codex/prompts, are explicitly "not shared through your repository", and are deprecated
// in favour of skills; openai/codex#4734 and #9848 both asked for `.codex/prompts` and were
// closed NOT PLANNED. Codex's skill search path INCLUDES `$REPO_ROOT/.agents/skills`, which
// is already bkit's canonical directory. Consequence: workflows are invoked `$bkit-design`
// on Codex, not `/bkit-design`, and because `.agents/` is shared the skills are visible to
// every host — accepted deliberately.
//
// NOTE there is no `.codex/config.toml`: `openai` is a RESERVED built-in provider id in
// Codex, so bkit has nothing to declare and re-stating it would be rejected.
// ---------------------------------------------------------------------------

/** Directory holding bkit-generated workflow skills, shared across hosts. */
const CODEX_SKILLS_DIR = ".agents/skills";

/**
 * Render `.codex/agents/*.toml` and the workflow skills. Extracted so `bkit upgrade`
 * re-renders them identically (#251) — bkit-owned output, force-overwritten.
 */
export function renderCodexAgentsSkills(ctx: ModuleContext): string[] {
  const { dryRun, effortMap, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];
  const codexModelLookup = ctx.codexModelLookup;
  if (!codexModelLookup) {
    throw new Error("renderCodexAgentsSkills: ctx.codexModelLookup is required");
  }

  // --- Agents: markdown+frontmatter -> TOML ---
  {
    const src = getPromptsRoot();
    const dest = ".codex/agents";
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    // Destination basenames are .toml, so the orphan sweep has to compare on stem.
    const sourceStems = new Set(files.map((f) => f.replace(/\.md$/, "")));

    for (const f of files) {
      const stem = f.replace(/\.md$/, "");
      const transform = (c: string) =>
        applyCodexAgent(substituteWorkflow(c, issueTracker).output, codexModelLookup, effortMap);
      if (installFile(path.join(src, f), path.join(dest, `${stem}.toml`), transform, dryRun)) {
        const rel = path.join(dest, `${stem}.toml`);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    if (fs.existsSync(dest)) {
      for (const f of fs.readdirSync(dest)) {
        if (!f.endsWith(".toml")) continue;
        if (!f.startsWith(BKIT_PREFIX)) continue;
        if (!sourceStems.has(f.replace(/\.toml$/, ""))) {
          const rel = path.join(dest, f);
          if (!dryRun) fs.rmSync(path.join(dest, f));
          console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
          trackMirrorWrite(ctx, rel, written);
        }
      }
    }
  }

  // --- Workflow skills: one directory per workflow, each holding SKILL.md ---
  {
    const src = getWorkflowsRoot();
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceStems = new Set(files.map((f) => f.replace(/\.md$/, "")));
    if (!dryRun && files.length > 0) ensureDir(CODEX_SKILLS_DIR);

    for (const f of files) {
      const stem = f.replace(/\.md$/, "");
      const dest = path.join(CODEX_SKILLS_DIR, stem, "SKILL.md");
      if (!dryRun) ensureDir(path.dirname(dest));
      const transform = (c: string) =>
        stampManagedVersion(applyCodexSkill(c, stem, issueTracker), version);
      if (installFile(path.join(src, f), dest, transform, dryRun)) {
        console.log(`${logPrefix} ${tag}write: ${dest}`);
        trackMirrorWrite(ctx, dest, written);
      }
    }

    // Orphan sweep is bkit-prefix scoped: `.agents/skills/` is SHARED with third-party
    // skills installed via skills.sh, so anything not named bkit-* is off limits here.
    if (fs.existsSync(CODEX_SKILLS_DIR)) {
      for (const d of fs.readdirSync(CODEX_SKILLS_DIR)) {
        if (!d.startsWith(BKIT_PREFIX)) continue;
        if (sourceStems.has(d)) continue;
        const rel = path.join(CODEX_SKILLS_DIR, d);
        if (!dryRun) fs.rmSync(rel, { recursive: true, force: true });
        console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }
  }

  return written;
}

export function runCodexModule(ctx: ModuleContext): void {
  const { dryRun, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  renderCodexAgentsSkills(ctx);

  const codexTplDir = path.join(getTemplatesRoot(), ".codex");

  // --- hooks.json — Tier-2 deep-contained (consumers may add their own event groups) ---
  {
    const jsonSrc = path.join(codexTplDir, "hooks.json");
    const jsonDst = ".codex/hooks.json";
    if (fs.existsSync(jsonSrc)) {
      if (!dryRun) ensureDir(path.dirname(jsonDst));
      const prevLen = ws.writes.length;
      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${jsonDst}`);
    }
  }

  // --- gateguard.cjs — Tier-2 markered-text, twin of the Claude hook ---
  {
    const hookSrc = path.join(codexTplDir, "hooks", "gateguard.cjs");
    const hookDst = ".codex/hooks/gateguard.cjs";
    if (fs.existsSync(hookSrc)) {
      if (!dryRun) ensureDir(path.dirname(hookDst));
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(hookSrc, hookDst, ctx.tokens, "slash-comment", dryRun, ws, {
        relPath: hookDst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: GATEGUARD_CJS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${hookDst}`);
    }
  }

  // --- guardrails.cjs — Tier-2 markered-text, twin of the Cursor hook ---
  // Registered on matcher `Bash` in hooks.json above. Same decision engine as Cursor;
  // the deny tier blocks, the ask tier is advisory because Codex parses but does not
  // implement `permissionDecision: "ask"`.
  {
    const railSrc = path.join(codexTplDir, "hooks", "guardrails.cjs");
    const railDst = ".codex/hooks/guardrails.cjs";
    if (fs.existsSync(railSrc)) {
      if (!dryRun) ensureDir(path.dirname(railDst));
      const prevLen = ws.writes.length;
      const priorVersion = readBkitVersion(path.join(process.cwd(), ".bkit", "version"));
      writeTier2(railSrc, railDst, ctx.tokens, "slash-comment", dryRun, ws, {
        relPath: railDst,
        canonicalHashes: priorVersion?.canonicalHashes ?? {},
        advisories,
        wiringMessage: CODEX_GUARDRAILS_WIRING_INSTRUCTIONS,
      });
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${railDst}`);
    }
  }

  advisories.push({
    id: "codex-setup",
    severity: "advisory",
    detect: "codex host installed (.codex/agents + .agents/skills/bkit-*).",
    action:
      "Three things that differ from the other hosts:\n" +
      "1. TRUST THE LAYER. Codex loads project-local hooks only once the `.codex/` layer is trusted. Until then GateGuard is installed and never fires.\n" +
      "2. Workflows are SKILLS here, not slash commands: invoke `$bkit-design`, not `/bkit-design`.\n" +
      "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.",
  });
}

// ---------------------------------------------------------------------------
// MODULE_REGISTRY — maps ModuleFlag → ModuleFn
// ---------------------------------------------------------------------------

export const MODULE_REGISTRY: Partial<Record<ModuleFlag, ModuleFn>> = {
  core: runCoreModule,
  claude: runClaudeModule,
  cursor: runCursorModule,
  opencode: runOpencodeModule,
  codex: runCodexModule,
  lint: runLintModule,
  cloud: runCloudModule,
  // "full" is never directly in the registry — resolveModules expands it to all modules
};

// Canonical dispatch order
export const MODULE_DISPATCH_ORDER: ModuleFlag[] = [
  "core",
  "claude",
  "cursor",
  "opencode",
  "codex",
  "lint",
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
