// install/modules/core.ts — the core module: the core payload blocks, the canonical
// `.bkit/*.md` docs, package.json gate scripts and `.bkit/version` (written last, in
// postDispatch). Also the file helpers every host renderer shares.

import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier1, writeTier2, ensurePackageJsonScripts, type WriteSet } from "../write.js";
import {
  readBkitVersion,
  writeBkitVersion,
  hashFile,
  mergeCanonicalHashes,
  sha256,
} from "../version-file.js";
import {
  extractManagedBlock,
  findLineAnchoredMarkers,
  selectMarkers,
  stripManagedBlock,
} from "../managed-block.js";
import type { TokenMap } from "../placeholders.js";
import { listFilesRecursive, syncTemplateCopies } from "../template-copies.js";
import { PAYLOAD_LINK_RELPATHS, syncPayloadLinks } from "../payload-links.js";
import { writeNetworkAllowlist } from "../network-allowlist.js";
import { migrateContextCiWorkflow } from "../context-ci-workflow.js";
import { migrateTemplateNotes } from "../template-notes.js";
import type { PreflightFinding } from "../../checks/before/index.js";
import { isAdvisorySuppressed } from "../../checks/after/suppression.js";
import { parseJson, readJsonFile } from "../../shared/json.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import { detectDepUpdater, type DepUpdater } from "../../shared/dep-updater.js";
import { ASK_POINTS, CONFIG_DEFAULTS, ciWorkflowPath, limitKey } from "../../shared/settings.js";
import { CI_SCRIPT_UNITS } from "../../checks/after/ci-yml.js";
import {
  getCoreRoot,
  getSharedRoot,
  getBkitDocsRoot,
  getTemplatesRoot,
  TEMPLATE_COPIES_DIR,
} from "../../shared/package-roots.js";
import {
  getInstallManifest,
  BKIT_GATE_SCRIPTS,
  BKIT_OPTIONAL_GATES,
  BKIT_PUSH_GATES,
  BKIT_GATE_CHANGED_SCRIPT,
  BKIT_LINT_FILE_SCRIPT,
  BKIT_TEST_FILE_SCRIPT,
} from "../manifest.js";
import { migrateLedgers } from "../../ledgers/migrate.js";
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
  ".opencode/agents",
  ".opencode/commands",
  ".codex/agents",
  ".agents/skills",
  ".agents/plugins/bkit/agents",
  ".agents/plugins/bkit/skills",
] as const;

export interface RemoveOrphansOptions {
  /** Entry-name suffix an orphan must carry. Default `.md`; `""` matches every name. */
  extension?: string;
  /** Orphans are whole folders (skill dirs) removed recursively; `extension` is ignored. */
  wholeFolders?: boolean;
}

/**
 * Removes entries of `destDir` that start with `prefix` and are absent from `sourceNames`
 * (entry names as they appear in `destDir`). Returns the removed names; with `dryRun` it
 * reports them without deleting. Throws for any `destDir` outside `ORPHAN_PRUNE_DIRS`.
 */
export function removeOrphans(
  destDir: string,
  sourceNames: Set<string>,
  dryRun: boolean,
  prefix?: string,
  options: RemoveOrphansOptions = {},
): string[] {
  const resolved = path.resolve(destDir);
  if (!ORPHAN_PRUNE_DIRS.some((d) => path.resolve(d) === resolved)) {
    throw new Error(`removeOrphans: refusing orphan removal outside allowlist: ${destDir}`);
  }
  if (!fs.existsSync(destDir)) return [];
  const { extension = ".md", wholeFolders = false } = options;
  const removed: string[] = [];
  for (const f of fs.readdirSync(destDir)) {
    if (!wholeFolders && !f.endsWith(extension)) continue;
    if (prefix && !f.startsWith(prefix)) continue;
    if (!sourceNames.has(f)) {
      const target = path.join(destDir, f);
      if (!dryRun) fs.rmSync(target, { recursive: wholeFolders, force: wholeFolders });
      removed.push(f);
    }
  }
  return removed;
}

// ---------------------------------------------------------------------------
// Core payload — the files install writes from `core/`, at their
// folder-relative dest paths. The package-only subtrees (engine/, workflows/,
// prompts/, .bkit/, hooks/) and the shared/ and templates/ payloads are NOT
// part of this walk: the host modules write their own hook files (sourced from
// `core/`), and `runBkitDocs` mirrors the reference docs.
// ---------------------------------------------------------------------------

/** A core-owned payload file and how install writes it. */
interface CoreTemplateFile {
  /** Absolute source path. */
  src: string;
  /** Consumer-relative destination. */
  dst: string;
  /** `block`: writeTier2 refreshes the managed block. `whole`: writeTier1. */
  scope: "block" | "whole";
  /** Block-scope marker style. */
  marker: "html-comment" | "slash-comment";
}

/** The markered-text `.agents/*.md` blocks core owns. */
const CORE_AGENT_FILES = ["context.md", "docs.md", "rules.md", "skills.md"] as const;

// The two shared-root files core writes: stored in `shared/`, owned by the core
// manifest, written as html-comment managed blocks.
const CORE_SHARED_FILES: ReadonlyArray<readonly [rel: string, dst: string]> = [
  ["gitignore", ".gitignore"],
  [".gitattributes", ".gitattributes"],
];

// ---------------------------------------------------------------------------
// guardCoreRoot — fail-loud guard for the resolved core payload root.
// Exported so tests can inject an arbitrary (non-existent) path and assert
// the guard fires for ANY missing root — not just the literal ".bkit/core"
// string. This keeps the assertion valid across any future path changes.
//
// Called by runCoreTemplates (below) before any FS access.
// ---------------------------------------------------------------------------

export function guardCoreRoot(root: string, logPrefix = "[bkit-modules]"): void {
  if (!fs.existsSync(root)) {
    console.error(`${logPrefix} Core root not found at ${root} — package corrupt?`);
    process.exit(1);
  }
}

/**
 * The core-owned payload files, sourced from `root` (defaults to the resolved
 * core root). Every file under `core/docs/templates/` is included; `AGENTS.md`
 * and the `.agents/*.md` doctrine files are the block-merged rest.
 */
export function listCoreTemplateFiles(root: string = getCoreRoot()): CoreTemplateFile[] {
  const out: CoreTemplateFile[] = [];
  const agentsDir = path.join(root, ".agents");
  for (const name of CORE_AGENT_FILES) {
    const src = path.join(agentsDir, name);
    if (fs.existsSync(src)) {
      out.push({ src, dst: path.join(".agents", name), scope: "block", marker: "html-comment" });
    }
  }
  const agentsMd = path.join(root, "AGENTS.md");
  if (fs.existsSync(agentsMd)) {
    out.push({ src: agentsMd, dst: "AGENTS.md", scope: "block", marker: "html-comment" });
  }
  for (const abs of listFilesRecursive(path.join(root, "docs", "templates"))) {
    out.push({
      src: abs,
      dst: path.relative(root, abs),
      scope: "block",
      marker: "html-comment",
    });
  }
  return out;
}

/**
 * The shared payload files core writes, sourced from `root` (defaults to the
 * resolved shared root): the `docs/*.md` managed blocks and the two shared-root
 * files the core manifest owns.
 */
export function listSharedTemplateFiles(root: string = getSharedRoot()): CoreTemplateFile[] {
  const out: CoreTemplateFile[] = [];
  for (const [rel, dst] of CORE_SHARED_FILES) {
    const src = path.join(root, rel);
    if (fs.existsSync(src)) out.push({ src, dst, scope: "block", marker: "html-comment" });
  }
  for (const name of listMdFiles(path.join(root, "docs"))) {
    out.push({
      src: path.join(root, "docs", name),
      dst: path.join("docs", name),
      scope: "block",
      marker: "html-comment",
    });
  }
  return out;
}

function runCoreTemplates(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const root = getCoreRoot();
  guardCoreRoot(root, logPrefix);
  const tag = dryRun ? "[dry-run] " : "";
  const files = [...listCoreTemplateFiles(root), ...listSharedTemplateFiles()];
  for (const { src, dst, scope, marker } of files) {
    const prevLen = ws.writes.length;
    if (scope === "whole") writeTier1(src, dst, tokens, dryRun, ws);
    else writeTier2(src, dst, tokens, marker, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}core: ${dst}`);
    }
  }
}

// ---------------------------------------------------------------------------
// runCoreModule — core templates + .bkit/version (LAST)
// ---------------------------------------------------------------------------

// Canonical bkit-authored reference docs that live package-side under
// `.bkit/core/.bkit/`. They are read from there at runtime (getBkitDocsRoot) AND
// mirrored into the consumer's `.bkit/` on every install so a consumer can read them
// in-repo without spelunking node_modules. Force-overwritten (Tier 1) — bkit owns
// them, so a consumer edit is replaced. Source of truth is the package's own
// `.bkit/core/.bkit/<name>`. (`advisories.md` is a regenerated runtime artifact and
// `instructions.md` is repo-only tooling — neither belongs here. `LICENSE.md` is the MIT
// notice that travels with the files bkit writes: MIT requires the copyright and
// permission notice in every copy.)
export const BKIT_CANONICAL_DOCS = [
  "authoring.md",
  "cloud.md",
  "cli.md",
  "comparison.md",
  "install.md",
  "jsonl.md",
  "LICENSE.md",
  "pipeline.md",
  "providers.md",
  "prompts.md",
  "router.md",
  "templates.md",
  "trackers.md",
  "workflows.md",
  "README.md",
] as const;

// The token map for `.bkit/*.md` docs: only `{{BKIT_MANAGED_MARKER}}` resolves. The other
// tokens map to themselves, so a doc that tells the consumer which token to replace in a
// template (`templates.md`) still names the token.
export function bkitDocTokens(tokens: TokenMap): TokenMap {
  return {
    ...tokens,
    DEFAULT_BRANCH: "{{DEFAULT_BRANCH}}",
    PROJECT_NAME: "{{PROJECT_NAME}}",
    REPO_SLUG: "{{REPO_SLUG}}",
  };
}

// Mirror the package's canonical `.bkit/*.md` docs into the consumer's `.bkit/`.
// Tier 1 (force-overwrite + ws-tracked for dry-run/install parity). Each source carries
// the `{{BKIT_MANAGED_MARKER}}` token. Skipped in dogfood: the consumer destination
// resolves to the repo's own installed copies, never the package source.
export function runBkitDocs(
  dryRun: boolean,
  tokens: TokenMap,
  ws: WriteSet,
  logPrefix: string,
): void {
  const tag = dryRun ? "[dry-run] " : "";
  const docsRoot = getBkitDocsRoot();
  const docTokens = bkitDocTokens(tokens);
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
    const prevLen = ws.writes.length;
    if (formatByPath.get(path.join(".bkit", name)) === "markered-text") {
      writeTier2(srcPath, dstPath, docTokens, "html-comment", dryRun, ws);
    } else {
      writeTier1(srcPath, dstPath, docTokens, dryRun, ws);
    }
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}core: ${dstPath}`);
    }
  }
  migrateRetiredLite(dryRun, ws, logPrefix);
  migrateRetiredDevLock(dryRun, ws, logPrefix);
  migrateLedgerSchema(dryRun, ws, logPrefix);
  migrateJiraKeyName(dryRun, logPrefix);
  migrateModelOverrideAgentNames(dryRun, ws, logPrefix);
  migrateTemplateNotes(dryRun, ws, logPrefix);
  migrateContextCiWorkflow(dryRun, ws, logPrefix);
  const renames = migrateBrandedTemplateFiles(dryRun, ws, logPrefix);
  migrateBrandedFileTokens(dryRun, ws, logPrefix, renames);
}

// Migration (installs up to 6.0.x, `docs/migrations.md`): agents renamed since. A
// consumer's `## Model Overrides` row below `bkit:end` in `.bkit/prompts.md` naming an
// old agent is renamed in place, provider and model kept, so the override keeps applying
// (`parseModelOverrides` reports a row naming no agent as unknown and skips it). Runs
// after the docs loop, which block-merges the file and leaves the consumer region alone.
// A row already naming the new agent wins: the old row is then left for the unknown
// report. Recorded in ws as an update; the canonical hash covers the managed block only.
const PROMPTS_FILE = path.join(".bkit", "prompts.md");
const MODEL_OVERRIDES_HEADING = "## Model Overrides";
export const RENAMED_AGENTS: Readonly<Record<string, string>> = {
  "bkit-build-plan-execute": "bkit-build-plan-tasks",
};

export function migrateModelOverrideAgentNames(
  dryRun: boolean,
  ws: WriteSet,
  logPrefix: string,
): void {
  if (!fs.existsSync(PROMPTS_FILE)) return;
  const text = fs.readFileSync(PROMPTS_FILE, "utf-8");
  const endIdx = findLineAnchoredMarkers(text, selectMarkers("html-comment")[1])[0];
  if (endIdx === undefined) return;
  const headingAt = text.indexOf(MODEL_OVERRIDES_HEADING, endIdx);
  if (headingAt === -1) return;
  const head = text.slice(0, headingAt);
  const lines = text.slice(headingAt).split("\n");
  // The first cell of a table row, backticks and padding aside.
  const promptCell = (line: string): string | undefined =>
    /^\s*\|/.test(line) ? line.split("|")[1]?.trim().replace(/^`|`$/g, "") : undefined;
  const named = new Set(lines.map(promptCell).filter((c): c is string => c !== undefined));
  const renamed: string[] = [];
  const out = lines.map((line) => {
    const cell = promptCell(line);
    const to = cell === undefined ? undefined : RENAMED_AGENTS[cell];
    if (cell === undefined || to === undefined || named.has(to)) return line;
    renamed.push(`${cell} -> ${to}`);
    return line.replace(cell, to);
  });
  if (renamed.length === 0) return;
  if (!dryRun) fs.writeFileSync(PROMPTS_FILE, head + out.join("\n"), "utf-8");
  ws.writes.push({ path: PROMPTS_FILE, action: "update" });
  console.log(
    `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${PROMPTS_FILE} — Model Overrides renamed: ${renamed.join(", ")}`,
  );
}

// Migration (installs up to 5.5.x, `docs/migrations.md`): the Jira key was
// `BKIT_JIRA_API_TOKEN`; the engine and the MCP configs now read `BKIT_JIRA_API_KEY`.
// `.bkit/.env` lines naming the old key are renamed in place, value kept. Logged only,
// never recorded in ws: a ws write gets a canonical hash, and a secrets file never does.
// A file already naming the new key is left alone.
const ENV_FILE = path.join(".bkit", ".env");
const OLD_JIRA_KEY = "BKIT_JIRA_API_TOKEN";
const NEW_JIRA_KEY = "BKIT_JIRA_API_KEY";

export function migrateJiraKeyName(dryRun: boolean, logPrefix: string): void {
  if (!fs.lstatSync(ENV_FILE, { throwIfNoEntry: false })?.isFile()) return;
  const text = fs.readFileSync(ENV_FILE, "utf-8");
  const assigns = (key: string) => new RegExp(`^\\s*(export\\s+)?${key}=`, "m").test(text);
  if (!assigns(OLD_JIRA_KEY) || assigns(NEW_JIRA_KEY)) return;
  if (!dryRun) fs.writeFileSync(ENV_FILE, text.split(OLD_JIRA_KEY).join(NEW_JIRA_KEY), "utf-8");
  console.log(
    `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${ENV_FILE} — ${OLD_JIRA_KEY} renamed to ${NEW_JIRA_KEY}`,
  );
}

// Migration (5.1.0 – 6.0.x installs, `docs/migrations.md`): the lite workflows are retired.
// The managed block of `.bkit/lite.md` (and of its 5.1.0 – 5.2.4 predecessor
// `.agents/shortcuts.md`) is stripped; the consumer's own lines (minus the seeded headings)
// land in `.bkit/lite.md` under a sentinel first line, or the file is deleted when none
// remain. A file holding the sentinel and no managed block is the already-retired stub:
// silent, no write. A blockless or multi-block `.bkit/lite.md` is left byte-for-byte with
// a logged fix. Writes are recorded in ws (dry-run parity; `bkit check` fails until upgrade).
export const RETIRED_LITE_STUB_SENTINEL = "<!-- bkit:retired-lite-stub -->";
const RETIRED_SHORTCUTS = path.join(".agents", "shortcuts.md");
const RETIRED_SHORTCUTS_HEADING = "## Project Shortcuts";
const RETIRED_LITE = path.join(".bkit", "lite.md");
const RETIRED_LITE_HEADING = "## Project Lite Workflows";

/** The consumer lines left once the managed block and the given seeded heading are removed. */
function consumerLines(text: string, heading: string): string {
  const lines = stripManagedBlock(text, "html-comment").split("\n");
  return lines
    .filter((line) => line.trim() !== heading)
    .join("\n")
    .trim();
}

export function migrateRetiredLite(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
  const hasShortcuts = fs.existsSync(RETIRED_SHORTCUTS);
  const hasLite = fs.existsSync(RETIRED_LITE);
  if (!hasShortcuts && !hasLite) return;
  const tag = dryRun ? "[dry-run] " : "";

  let liteOwn = "";
  let liteIsManaged = false;
  if (hasLite) {
    const lite = fs.readFileSync(RETIRED_LITE, "utf-8");
    if (extractManagedBlock(lite, "html-comment") !== null) {
      liteIsManaged = true;
      liteOwn = consumerLines(lite, RETIRED_LITE_HEADING);
    } else if (lite.split("\n")[0]?.trim() === RETIRED_LITE_STUB_SENTINEL) {
      liteOwn = lite.slice(lite.indexOf("\n") + 1).trim();
    } else {
      console.warn(
        `${logPrefix} ${RETIRED_LITE} has no single bkit managed block — left in place. The lite workflows are retired: keep your own lines in it (or in your own docs) and delete any leftover bkit-managed text.`,
      );
      return;
    }
  }

  let shortcutsOwn = "";
  let shortcutsMovable = false;
  if (hasShortcuts) {
    const old = fs.readFileSync(RETIRED_SHORTCUTS, "utf-8");
    if (extractManagedBlock(old, "html-comment") === null) {
      console.warn(
        `${logPrefix} ${RETIRED_SHORTCUTS} has no single bkit managed block — left in place. Move your own lines into ${RETIRED_LITE}, then delete it.`,
      );
    } else {
      shortcutsMovable = true;
      shortcutsOwn = consumerLines(old, RETIRED_SHORTCUTS_HEADING);
    }
  }

  const own = [liteOwn, shortcutsOwn].filter((part) => part.length > 0).join("\n\n");
  const stubText = `${RETIRED_LITE_STUB_SENTINEL}\n\n${own}\n`;
  const liteChanges = liteIsManaged || (own.length > 0 && shortcutsOwn.length > 0);
  if (liteChanges) {
    if (own.length > 0) {
      if (!dryRun) {
        fs.mkdirSync(path.dirname(RETIRED_LITE), { recursive: true });
        fs.writeFileSync(RETIRED_LITE, stubText, "utf-8");
      }
      ws.writes.push({ path: RETIRED_LITE, action: hasLite ? "update" : "write" });
    } else if (hasLite) {
      if (!dryRun) fs.rmSync(RETIRED_LITE);
      ws.writes.push({ path: RETIRED_LITE, action: "write" });
    }
    console.log(`${logPrefix} ${tag}core: retired ${RETIRED_LITE}`);
  }
  if (shortcutsMovable) {
    if (!dryRun) fs.rmSync(RETIRED_SHORTCUTS);
    ws.writes.push({ path: RETIRED_SHORTCUTS, action: "write" });
    console.log(`${logPrefix} ${tag}core: retired ${RETIRED_SHORTCUTS}`);
  }
}

// Migration (installs up to 5.3.x, `docs/migrations.md`): `.bkit/.dev.lock` was the
// repo-wide dev lock. Nothing reads it now, so one a crashed run left behind is deleted.
// bkit owned the name whole. Recorded in ws so `bkit check` fails until upgrade runs.
const RETIRED_DEV_LOCK = path.join(".bkit", ".dev.lock");

export function migrateRetiredDevLock(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
  if (!fs.lstatSync(RETIRED_DEV_LOCK, { throwIfNoEntry: false })?.isFile()) return;
  if (!dryRun) fs.rmSync(RETIRED_DEV_LOCK);
  ws.writes.push({ path: RETIRED_DEV_LOCK, action: "write" });
  console.log(
    `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: removed ${RETIRED_DEV_LOCK} (the dev lock is gone)`,
  );
}

// Migration (installs up to 5.5.x, `docs/migrations.md`): ledger rows written before
// `schema: 2` are rewritten into the current shape (`.bkit/jsonl.md` § Generic Fields).
// Recorded in ws so `bkit check` fails until upgrade runs; ledgers never get a
// canonical hash (`mergeCanonicalHashes`).
export function migrateLedgerSchema(dryRun: boolean, ws: WriteSet, logPrefix: string): void {
  for (const { file, rewritten, dropped } of migrateLedgers(process.cwd(), dryRun)) {
    ws.writes.push({ path: file, action: "update" });
    const copies = dropped > 0 ? `, ${dropped} old copy(ies) of rewritten rows dropped` : "";
    console.log(
      `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: ${file} — ${rewritten} row(s) rewritten to schema 2${copies}`,
    );
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

/** Record a host mirror would-write so `bkit check` exits 1 on content drift. */
export function trackMirrorWrite(ctx: ModuleContext, relPath: string, written: string[]): void {
  written.push(relPath);
  ctx.ws.writes.push({ path: relPath, action: "write" });
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

  if (migrateBrandedScriptNames(dryRun, ws, logPrefix)) written.push("package.json");
  const gates = ensurePackageJsonScripts({ ...BKIT_GATE_SCRIPTS }, dryRun, ws);
  if (gates.added.length > 0) {
    if (!written.includes("package.json")) written.push("package.json");
    console.log(
      `${logPrefix} ${tag}core: package.json scripts added [${gates.added.join(", ")}] — what a gate may run: .bkit/workflows.md § Local gate scripts`,
    );
  }
  if (migrateLinearTeamKey(dryRun, ws, logPrefix) && !written.includes("package.json")) {
    written.push("package.json");
  }
  if (migrateGithubProjectKey(dryRun, ws, logPrefix) && !written.includes("package.json")) {
    written.push("package.json");
  }
  if (migrateBkitLayout(dryRun, ws, logPrefix) && !written.includes("package.json")) {
    written.push("package.json");
  }
  if (pruneMinPushPaths(dryRun, ws, logPrefix) && !written.includes("package.json")) {
    written.push("package.json");
  }
  if (seedBkitDefaults(dryRun, ws, logPrefix) && !written.includes("package.json")) {
    written.push("package.json");
  }
  return written;
}

/**
 * Every `bkit.*` setting, written on every install and upgrade so consumers see them all;
 * add-if-missing, nested blocks included. A key with a default gets it; a choice not made
 * yet is `""` or `[]`, which every reader treats as unset. `dependencies.updater` is the one
 * choice install makes: `seedBkitDefaults` fills it from the updater config present.
 */
export const SEEDED_BKIT_DEFAULTS: Readonly<Record<string, unknown>> = {
  tracker: {
    default: "",
    github: {
      project: "",
      progress: CONFIG_DEFAULTS.github.progress,
      review: CONFIG_DEFAULTS.github.review,
    },
    linear: {
      team: "",
      project: "",
      progress: CONFIG_DEFAULTS.linear.progress,
      review: CONFIG_DEFAULTS.linear.review,
    },
    jira: {
      site: "",
      project: "",
      progress: CONFIG_DEFAULTS.jira.progress,
      review: CONFIG_DEFAULTS.jira.review,
    },
  },
  cloud: { agent: "" },
  providers: { opencode: { default: "", installed: [] } },
  testing: {
    // What bkit writes (ship's bookkeeping allow-list, the plans tree) is always a min push;
    // the seed adds nothing, because a project doc can be a test's input.
    minPushPaths: [...CONFIG_DEFAULTS.minPushPaths],
    ciWorkflow: CONFIG_DEFAULTS.ciWorkflow,
    ciCapstone: CONFIG_DEFAULTS.capstoneJob,
    ciRequired: [...CONFIG_DEFAULTS.ciRequired],
    // Project docs ship's [skip ci] bookkeeping commit may carry onto the PR untested; a
    // repo names its own (bkit's: CHANGELOG.md, README.md), so the seed is the empty choice.
    ciSkipPaths: [...CONFIG_DEFAULTS.ciSkipPaths],
    // CI steps whose failure bkit:generate fixes, beyond the floor bkit's own template
    // steps form (CI_GENERATED_FLOOR); a repo names its own, so the seed is the empty choice.
    ciGenerated: [...CONFIG_DEFAULTS.ciGenerated],
  },
  workflows: {
    minFreeGb: CONFIG_DEFAULTS.diskMinFreeGb,
    worktree: { copy: [...CONFIG_DEFAULTS.worktreeCopy], install: CONFIG_DEFAULTS.worktreeInstall },
    tasks: { ...CONFIG_DEFAULTS.tasks },
    ...withBuildPublish(askBlocks()),
  },
  // bkit-utility-update-roadmap list length; the prompt falls back to 25 too.
  prompts: { roadmapNext: 25 },
  dependencies: { updater: "" },
  advisories: { ignore: [] },
};

/** `{design: {grill: {ask, maxTurns}}, build: {...}, ...}`, from `CONFIG_DEFAULTS.asks`. */
function askBlocks(): Record<string, Record<string, Record<string, unknown>>> {
  const out: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const point of ASK_POINTS) {
    const [workflow, name] = point.split(".") as [string, string];
    const d = CONFIG_DEFAULTS.asks[point];
    (out[workflow] ??= {})[name] = { ask: d.ask, [limitKey(point)]: d.max };
  }
  return out;
}

/** Merge the `build.publish` choice beside the build ask blocks. */
function withBuildPublish(
  blocks: Record<string, Record<string, Record<string, unknown>>>,
): Record<string, Record<string, unknown>> {
  return { ...blocks, build: { ...blocks.build, publish: { remote: true, local: true } } };
}

const plainObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

// Copy each `defaults` key missing from `target`, descending into blocks both sides hold.
// A present key keeps its value, whatever it is. Pushes each added key's dotted path.
function addMissingKeys(
  target: Record<string, unknown>,
  defaults: Readonly<Record<string, unknown>>,
  prefix: string,
  added: string[],
): void {
  for (const [k, v] of Object.entries(defaults)) {
    if (!Object.prototype.hasOwnProperty.call(target, k)) {
      target[k] = structuredClone(v);
      added.push(`${prefix}${k}`);
    } else if (plainObject(v) && plainObject(target[k])) {
      addMissingKeys(target[k], v, `${prefix}${k}.`, added);
    }
  }
}

// Add each SEEDED_BKIT_DEFAULTS key missing from `package.json` `bkit`, creating the block
// when absent. Runs after the legacy-key migrations, which test `=== undefined`. Returns
// true when package.json changed.
export function seedBkitDefaults(dryRun: boolean, ws: WriteSet, logPrefix: string): boolean {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) return false;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  if (!parsed.ok) return false;
  const pkg = parsed.value as Record<string, unknown>;
  if (pkg.bkit !== undefined && !plainObject(pkg.bkit)) return false;
  const cfg = (pkg.bkit ?? {}) as Record<string, unknown>;
  const added: string[] = [];
  addMissingKeys(cfg, SEEDED_BKIT_DEFAULTS, "bkit.", added);
  const updater = fillDepUpdater(cfg);
  if (added.length === 0 && !updater) return false;
  pkg.bkit = cfg;
  ws.writes.push({ path: pkgPath, action: "update" });
  if (!dryRun) writePackageJsonLike(raw, pkg);
  const dry = dryRun ? "[dry-run] " : "";
  if (added.length > 0) {
    console.log(`${logPrefix} ${dry}core: added ${added.join(", ")} to package.json`);
  }
  if (updater) {
    console.log(
      `${logPrefix} ${dry}core: set bkit.dependencies.updater to "${updater}" (its config is present)`,
    );
  }
  return true;
}

// An empty `dependencies.updater` takes the one updater whose config is present; a set value
// stays. Returns the updater written, else null.
function fillDepUpdater(cfg: Record<string, unknown>): DepUpdater | null {
  const deps = cfg.dependencies;
  if (!plainObject(deps) || deps.updater !== "") return null;
  const found = detectDepUpdater(".");
  if (found) deps.updater = found;
  return found;
}

/** Rewrite package.json with `pkg`, keeping the file's indent and trailing newline. */
function writePackageJsonLike(raw: string, pkg: unknown): void {
  const indentMatch = raw.match(/\n([ \t]+)"/);
  const indent = indentMatch ? indentMatch[1] : "  ";
  const trailingNewline = raw.endsWith("\n") ? "\n" : "";
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
}

// Migration (up to 6.0.x installs, `docs/migrations.md`): the package.json scripts bkit runs
// carry the `bkit:` prefix. Old name -> new name. A `graph*` key moves only when its value
// runs bkit's graph scripts; any other `graph*` script is the consumer's own.
export const BKIT_SCRIPT_RENAMES: Readonly<Record<string, string>> = {
  "lint:prose": "bkit:lint:prose",
  "slop:delta": "bkit:slop:delta",
  graph: "bkit:graph",
  ...Object.fromEntries(
    ["check", "clean", "graphml", "refresh", "rollup", "scoped", "tree", "update"].map((verb) => [
      `graph:${verb}`,
      `bkit:graph:${verb}`,
    ]),
  ),
};

const GRAPH_VALUE_GUARD = "scripts/graphify/bkit-";

// The pairs a migration acts on. A pair is inactive when `package.json` holds both keys, or
// when the old key is a `graph*` script whose value is not bkit's; a pair with neither key
// is active, so its tokens in other values and in default gate chains are rewritten.
function activeScriptRenames(
  scripts: Record<string, unknown>,
  renames: Readonly<Record<string, string>>,
): { active: Record<string, string>; bothPresent: string[] } {
  const has = (k: string): boolean => Object.prototype.hasOwnProperty.call(scripts, k);
  const active: Record<string, string> = {};
  const bothPresent: string[] = [];
  for (const [oldName, newName] of Object.entries(renames)) {
    if (has(oldName) && has(newName)) {
      bothPresent.push(oldName);
      continue;
    }
    const value = scripts[oldName];
    if (
      has(oldName) &&
      oldName.startsWith("graph") &&
      !(typeof value === "string" && value.includes(GRAPH_VALUE_GUARD))
    ) {
      continue;
    }
    active[oldName] = newName;
  }
  return { active, bothPresent };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Rewrites `pnpm [flags] [run] [flags] <old>` to the new name, keeping the flags and `run`.
 * Each flag is a value-less `-x` / `--x[=v]` token; `<old>` ends at a character outside
 * `[\w:-]` or at the end of the text. Anything else (`npm run`, `echo`, `--filter web`) stays.
 */
export function renameScriptTokens(
  text: string,
  renames: Readonly<Record<string, string>>,
): string {
  const names = Object.keys(renames).sort((a, b) => b.length - a.length);
  if (names.length === 0) return text;
  const re = new RegExp(
    `\\bpnpm((?:\\s+(?:run|-{1,2}[\\w-]+(?:=\\S*)?))*)(\\s+)(${names.map(escapeRegExp).join("|")})(?![\\w:-])`,
    "g",
  );
  return text.replace(
    re,
    (_m, flags: string, gap: string, old: string) => `pnpm${flags}${gap}${renames[old]}`,
  );
}

/** Each old script name still in `text`, with its 1-based line. */
export function findOldScriptNames(
  text: string,
  renames: Readonly<Record<string, string>>,
): { line: number; name: string }[] {
  const found: { line: number; name: string }[] = [];
  const lines = text.split("\n");
  for (const name of Object.keys(renames)) {
    const re = new RegExp(`(?<![\\w:./-])${escapeRegExp(name)}(?![\\w:-])`);
    lines.forEach((l, i) => {
      if (re.test(l)) found.push({ line: i + 1, name });
    });
  }
  return found;
}

// Renames the old script keys in place (values kept), rewrites old `pnpm` tokens in every
// script value, and warns on an old name it cannot reach. Returns true when package.json
// changed.
export function migrateBrandedScriptNames(
  dryRun: boolean,
  ws: WriteSet,
  logPrefix: string,
): boolean {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) return false;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  if (!parsed.ok) {
    console.warn(`${logPrefix} core: package.json is not valid JSON; script names not migrated`);
    return false;
  }
  const pkg = parsed.value as Record<string, unknown>;
  if (!plainObject(pkg.scripts)) return false;
  const scripts = pkg.scripts;
  const { active, bothPresent } = activeScriptRenames(scripts, BKIT_SCRIPT_RENAMES);
  const tag = dryRun ? "[dry-run] " : "";
  for (const oldName of bothPresent) {
    console.warn(
      `${logPrefix} ${tag}core: package.json scripts hold both "${oldName}" and "${BKIT_SCRIPT_RENAMES[oldName]}"; left "${oldName}" in place — remove it once nothing uses it`,
    );
  }
  const next: Record<string, unknown> = {};
  const renamed: string[] = [];
  let changed = false;
  for (const [key, value] of Object.entries(scripts)) {
    const newKey = active[key];
    if (newKey !== undefined) {
      renamed.push(key);
      changed = true;
    }
    let newValue = value;
    if (typeof value === "string") {
      newValue = renameScriptTokens(value, active);
      if (newValue !== value) changed = true;
    }
    next[newKey ?? key] = newValue;
  }
  if (!changed) return false;
  for (const [key, value] of Object.entries(next)) {
    if (typeof value !== "string") continue;
    for (const { name } of findOldScriptNames(value, active)) {
      console.warn(
        `${logPrefix} ${tag}core: package.json script "${key}" still runs the old name "${name}"; rename it to "${active[name]}" by hand`,
      );
    }
  }
  pkg.scripts = next;
  ws.writes.push({ path: pkgPath, action: "update" });
  if (!dryRun) writePackageJsonLike(raw, pkg);
  console.log(
    `${logPrefix} ${tag}core: package.json script names branded${renamed.length > 0 ? ` [${renamed.join(", ")}]` : ""}`,
  );
  return true;
}

// Migration (up to 6.0.x installs, `docs/migrations.md`): the husky hooks and the CI workflow
// are copy-and-own files that run the old script names. `renameScriptTokens` rewrites them in
// place, for the pairs `migrateBrandedScriptNames` acts on; a name it cannot reach is
// warned with file and line. With `pathRenames` (`migrateBrandedTemplateFiles`) the
// `scripts/ci/<old>` path tokens in those files, `bkit-trivy.yml` and the package.json script
// values are rewritten too. Absent files are skipped. Writes are `unhashed`: the file stays the
// consumer's, bkit never records a hash for it.
export interface PathRename {
  from: string;
  to: string;
}

function renamePathTokens(text: string, pathRenames: readonly PathRename[]): string {
  let out = text;
  for (const { from, to } of pathRenames) {
    out = out.replace(new RegExp(`${escapeRegExp(from)}(?![\\w.-])`, "g"), to);
  }
  return out;
}

export function migrateBrandedFileTokens(
  dryRun: boolean,
  ws: WriteSet,
  logPrefix: string,
  pathRenames: readonly PathRename[] = [],
): void {
  const tag = dryRun ? "[dry-run] " : "";
  let scripts: Record<string, unknown> = {};
  let pkgRaw: string | undefined;
  let pkg: Record<string, unknown> | undefined;
  if (fs.existsSync("package.json")) {
    pkgRaw = fs.readFileSync("package.json", "utf-8");
    const parsed = parseJson(pkgRaw);
    if (parsed.ok && plainObject(parsed.value)) {
      pkg = parsed.value;
      if (plainObject(pkg.scripts)) scripts = pkg.scripts;
    }
  }
  const { active } = activeScriptRenames(scripts, BKIT_SCRIPT_RENAMES);
  const tokenFiles = [
    path.join(".husky", "pre-commit"),
    path.join(".husky", "pre-push"),
    ciWorkflowPath("."),
  ];
  const files = [...new Set([...tokenFiles, path.join(".github", "workflows", "bkit-trivy.yml")])];
  for (const file of files) {
    if (!fs.lstatSync(file, { throwIfNoEntry: false })?.isFile()) continue;
    const text = fs.readFileSync(file, "utf-8");
    let next = tokenFiles.includes(file) ? renameScriptTokens(text, active) : text;
    next = renamePathTokens(next, pathRenames);
    if (tokenFiles.includes(file)) {
      for (const { name, line } of findOldScriptNames(next, active)) {
        console.warn(
          `${logPrefix} ${tag}core: ${file}:${line} still runs the old script name "${name}"; rename it to "${active[name]}" by hand`,
        );
      }
    }
    if (next === text) continue;
    if (!dryRun) fs.writeFileSync(file, next, "utf-8");
    ws.writes.push({ path: file, action: "update", unhashed: true });
    console.log(`${logPrefix} ${tag}core: ${file} — branded script and path names rewritten`);
  }
  if (pkg === undefined || pkgRaw === undefined || pathRenames.length === 0) return;
  let changed = false;
  const nextScripts: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(scripts)) {
    const nextValue = typeof value === "string" ? renamePathTokens(value, pathRenames) : value;
    if (nextValue !== value) changed = true;
    nextScripts[key] = nextValue;
  }
  if (!changed) return;
  pkg.scripts = nextScripts;
  ws.writes.push({ path: "package.json", action: "update", unhashed: true });
  if (!dryRun) writePackageJsonLike(pkgRaw, pkg);
  console.log(`${logPrefix} ${tag}core: package.json — branded CI script paths rewritten`);
}

// sha256 of every distinct release content of the CI script `.mjs` files, per old path, from
// each `v*` tag. An unedited copy matches one of them.
export const SHIPPED_CI_SCRIPT_HASHES: Readonly<Record<string, readonly string[]>> = {
  "scripts/ci/check-capstone.mjs": [
    "3813d9fe3cfae79788990b0a7a4914d18350dde165a3c2fe5940e8348362cea6",
    "45078e630f5ec9ff4e7704c99ac5f56fd37b9c2e94c052f084c03feddc86ef71",
  ],
  "scripts/ci/check-capstone.test.mjs": [
    "0554d64652dcc32ea368a4791372e860a5e3314ecfb7084256627015333c7afb",
    "ad58a0095528fdb3fe7310586b4091824f29fda261542df73c324c8dd574a0d6",
  ],
  "scripts/ci/check-dependency-audit.mjs": [
    "b410ab27cdbeed8d659fdf523d1af9b519beb874901186bb59e2889646cdaa19",
  ],
  "scripts/ci/check-dependency-audit.test.mjs": [
    "db3643ae6ef7ad01d628e6110aa2f7b47cdf2423ca07efc1a8bc6176eb98b6a2",
  ],
  "scripts/ci/check-accepted-divergences.mjs": [
    "3b410c53535e66b7a65b54d574ba7f7e47139bfba58a883a60697b8ab44deef4",
    "66e6f1f9ce22b52afe93454c268613b8f5b03c1c58b5817cac958435fefbe5b1",
  ],
  "scripts/ci/check-accepted-divergences.test.mjs": [
    "743e623f0dcb118a96744d31611fb599e9041a8007a3202fb46c30d72a3e183e",
    "f130f5784349c21c5ae4f02626243362d9c29f783b9ad4b9c158beeca9bf4107",
  ],
  "scripts/ci/lanes/resolve-push-base.mjs": [
    "016c4dacf34ce6edffcc7c7f666027a0a34669ce299d755679c877540fc751e7",
    "11930bf63081ca2b5201799e0262acfcfc148e15bce41e17ebead688a94fe8ce",
    "84acc7ff1596234af0c614236608e2009e794da9549bf77a4cc9560c2784a8f8",
  ],
  "scripts/ci/lanes/resolve-push-base.test.mjs": [
    "1ce7b5fdf1de756f56e6b9710952c1e272c633107b06c0d47780fce36b90d1ad",
    "32e17be38751f2744d660acdd99c6a08e7f437cdeaeb7075bc876b1cd31f0237",
    "6883deb2b20f99af68721b085fbf3e2ab14e4b58d17dd676afaf734c75195e96",
  ],
};

// Migration (up to 6.0.x installs, `docs/migrations.md`): the CI script files carry the
// `bkit-` prefix. A unit (script, test and data file, `CI_SCRIPT_UNITS`) moves whole when each
// present `.mjs` matches a shipped release and no `bkit-` target exists: the old files go, the
// `.mjs` targets come from the shipped templates, the data file moves byte for byte. Any
// other unit stays, with a warning naming the manual move (the `ci-scripts-old-names`
// advisory lists it too). Returns the renames applied plus those already applied (old absent,
// new present), for the path-token rewrite.
export function migrateBrandedTemplateFiles(
  dryRun: boolean,
  ws: WriteSet,
  logPrefix: string,
): PathRename[] {
  const tag = dryRun ? "[dry-run] " : "";
  const renames: PathRename[] = [];
  const templates = getTemplatesRoot();
  for (const unit of CI_SCRIPT_UNITS) {
    const present = unit.filter(([from]) => fs.existsSync(from));
    const done = unit.filter(([from, to]) => !fs.existsSync(from) && fs.existsSync(to));
    for (const [from, to] of done) renames.push({ from, to });
    if (present.length === 0) continue;
    const edited = present.filter(
      ([from]) =>
        from.endsWith(".mjs") &&
        !SHIPPED_CI_SCRIPT_HASHES[from]?.includes(sha256(fs.readFileSync(from))),
    );
    const taken = present.filter(([, to]) => fs.existsSync(to));
    const noTemplate = present.filter(
      ([, to]) => to.endsWith(".mjs") && !fs.existsSync(path.join(templates, to)),
    );
    if (edited.length > 0 || taken.length > 0 || noTemplate.length > 0) {
      const why =
        edited.length > 0
          ? `${edited.map(([from]) => from).join(", ")} differs from every shipped release`
          : taken.length > 0
            ? `${taken.map(([, to]) => to).join(", ")} already exists`
            : "the shipped template is missing";
      console.warn(
        `${logPrefix} ${tag}core: ${present.map(([from]) => from).join(", ")} not moved to the bkit- names (${why}); move them by hand and update every reference`,
      );
      continue;
    }
    for (const [from, to] of present) {
      if (!dryRun) {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        if (to.endsWith(".mjs")) fs.copyFileSync(path.join(templates, to), to);
        else fs.copyFileSync(from, to);
        fs.rmSync(from);
      }
      ws.writes.push({ path: from, action: "write", unhashed: true });
      ws.writes.push({ path: to, action: "write", unhashed: true });
      renames.push({ from, to });
      console.log(`${logPrefix} ${tag}core: ${from} moved to ${to}`);
    }
  }
  return renames;
}

// Status option ids of GitHub's Kanban and Team planning board templates; every board
// made from one carries the same ids.
const TEMPLATE_STATUS_OPTIONS: Readonly<Record<string, string>> = {
  "47fc9ee4": "In progress",
  df73e18b: "In review",
};

// Migration (up to 5.4.x installs, `docs/migrations.md`): the board lived at
// `bkit.githubProject` as `{owner, number, statusFieldId, *OptionId}`, org boards only; it
// is `bkit.github.project`, the board URL, with Status set by option name from
// `bkit.github.progress` / `review`. An existing `bkit.github.project` wins over the old
// key. Returns true when package.json changed.
export function migrateGithubProjectKey(dryRun: boolean, ws: WriteSet, logPrefix: string): boolean {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) return false;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  if (!parsed.ok) return false;
  const pkg = parsed.value as Record<string, unknown>;
  const bkit = pkg.bkit;
  if (bkit === null || typeof bkit !== "object" || Array.isArray(bkit)) return false;
  const cfg = bkit as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(cfg, "githubProject")) return false;
  const old = cfg.githubProject;
  const github =
    cfg.github !== null && typeof cfg.github === "object" && !Array.isArray(cfg.github)
      ? (cfg.github as Record<string, unknown>)
      : {};
  const unnamed: ("progress" | "review")[] = [];
  if (github.project === undefined) {
    if (old === false) github.project = false;
    else if (old !== null && typeof old === "object" && !Array.isArray(old)) {
      const board = old as Record<string, unknown>;
      const owner = typeof board.owner === "string" ? board.owner.trim() : "";
      const number = Number(board.number);
      if (owner !== "" && Number.isInteger(number) && number > 0) {
        github.project = `https://github.com/orgs/${owner}/projects/${number}`;
        for (const [moment, key] of [
          ["progress", "progressOptionId"],
          ["review", "reviewOptionId"],
        ] as const) {
          const id = board[key];
          if (typeof id !== "string" || id.trim() === "") continue;
          const name = TEMPLATE_STATUS_OPTIONS[id.trim()];
          if (name === undefined) unnamed.push(moment);
          else if (github[moment] === undefined && name !== CONFIG_DEFAULTS.github[moment])
            github[moment] = name;
        }
      }
    }
  }
  delete cfg.githubProject;
  if (Object.keys(github).length > 0) cfg.github = github;
  ws.writes.push({ path: pkgPath, action: "update" });
  if (!dryRun) writePackageJsonLike(raw, pkg);
  const tag = dryRun ? "[dry-run] " : "";
  console.log(`${logPrefix} ${tag}core: moved bkit.githubProject to bkit.github in package.json`);
  for (const moment of unnamed)
    console.log(
      `${logPrefix} ${tag}core: bkit.githubProject named its ${moment} Status option by id; set bkit.tracker.github.${moment} to that option's name (default "${CONFIG_DEFAULTS.github[moment]}")`,
    );
  return true;
}

// Migration (up to 5.5.x installs, `docs/migrations.md`): `bkit` settings sat flat; they
// are grouped into named sections. Each old key moves to its new path; a value already at
// the new path wins, and two blocks merge key by key. `loopPause: true|false` becomes
// `ask` on every point under `workflows.<workflow>`, where an `ask` already set wins.
// Runs after the linearTeam and githubProject moves, which write the flat keys. Returns
// true when package.json changed.
export const BKIT_LAYOUT_MOVES: readonly (readonly [string, string])[] = [
  ["issueTracker", "tracker.default"],
  ["github", "tracker.github"],
  ["linear", "tracker.linear"],
  ["jira", "tracker.jira"],
  ["cloudAgents", "cloud.agent"],
  ["opencodeProvider", "providers.opencode.default"],
  ["opencodeProviders", "providers.opencode.installed"],
  ["minPushPaths", "testing.minPushPaths"],
  ["capstoneJob", "testing.ciCapstone"],
  ["ciWorkflow", "testing.ciWorkflow"],
  ["shipGateRequiredLanes", "testing.ciRequired"],
  // 6.0.0 installs named the required-lane list `testing.shipGate`.
  ["testing.shipGate", "testing.ciRequired"],
  ["disk.minFreeGb", "workflows.minFreeGb"],
  ["worktree", "workflows.worktree"],
  ["tasks", "workflows.tasks"],
  ["roadmapNext", "prompts.roadmapNext"],
  ["depUpdater", "dependencies.updater"],
  ["ignoreAdvisories", "advisories.ignore"],
];

// Migration (up to 6.0.x installs, `docs/migrations.md`): `bkit.testing.minPushPaths` was the
// whole min-push list, so installs seeded and repos restated what bkit itself writes. The
// engine now always allows that floor (ship's bookkeeping allow-list, `docs/plans/**`) and
// `bkit.testing.ciSkipPaths`; the setting only adds. Entries the floor already covers are
// dropped from the list. Returns true when package.json changed.
export const MIN_PUSH_FLOOR_ENTRIES: readonly string[] = [
  "docs/plans/**",
  "docs/*.jsonl",
  ".bkit/*.jsonl",
];

export function pruneMinPushPaths(dryRun: boolean, ws: WriteSet, logPrefix: string): boolean {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) return false;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  if (!parsed.ok) return false;
  const pkg = parsed.value as Record<string, unknown>;
  if (!plainObject(pkg.bkit) || !plainObject(pkg.bkit.testing)) return false;
  const testing = pkg.bkit.testing;
  if (!Array.isArray(testing.minPushPaths)) return false;
  const skip = Array.isArray(testing.ciSkipPaths) ? testing.ciSkipPaths : [];
  const covered = new Set<unknown>([...MIN_PUSH_FLOOR_ENTRIES, ...skip]);
  const kept = testing.minPushPaths.filter((p) => !covered.has(p));
  if (kept.length === testing.minPushPaths.length) return false;
  const dropped = testing.minPushPaths.filter((p) => covered.has(p)).map(String);
  testing.minPushPaths = kept;
  ws.writes.push({ path: pkgPath, action: "update" });
  if (!dryRun) writePackageJsonLike(raw, pkg);
  console.log(
    `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: dropped [${dropped.join(", ")}] from bkit.testing.minPushPaths in package.json — bkit always allows what it writes, and ciSkipPaths counts`,
  );
  return true;
}

// Fill `into` with each `from` key it lacks, descending into blocks both sides hold.
function mergeMissing(into: Record<string, unknown>, from: Record<string, unknown>): void {
  for (const [k, v] of Object.entries(from)) {
    if (into[k] === undefined) into[k] = v;
    else if (plainObject(v) && plainObject(into[k])) mergeMissing(into[k], v);
  }
}

export function migrateBkitLayout(dryRun: boolean, ws: WriteSet, logPrefix: string): boolean {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) return false;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  if (!parsed.ok) return false;
  const pkg = parsed.value as Record<string, unknown>;
  if (!plainObject(pkg.bkit)) return false;
  const cfg = pkg.bkit;
  const moved: string[] = [];
  for (const [from, to] of BKIT_LAYOUT_MOVES) {
    const fromPath = from.split(".");
    const fromParent = fromPath
      .slice(0, -1)
      .reduce<unknown>((o, k) => (plainObject(o) ? o[k] : undefined), cfg);
    const fromKey = fromPath[fromPath.length - 1]!;
    if (!plainObject(fromParent) || !Object.prototype.hasOwnProperty.call(fromParent, fromKey))
      continue;
    const old = fromParent[fromKey];
    const toPath = to.split(".");
    let parent: Record<string, unknown> = cfg;
    let blocked = false;
    for (const k of toPath.slice(0, -1)) {
      if (parent[k] === undefined) parent[k] = {};
      if (!plainObject(parent[k])) {
        blocked = true;
        break;
      }
      parent = parent[k];
    }
    // A non-object where the new section belongs: leave the old key for `bkit check` to show.
    if (blocked) continue;
    const toKey = toPath[toPath.length - 1]!;
    if (parent[toKey] === undefined) parent[toKey] = old;
    else if (plainObject(parent[toKey]) && plainObject(old)) mergeMissing(parent[toKey], old);
    delete fromParent[fromKey];
    if (fromParent !== cfg && Object.keys(fromParent).length === 0) delete cfg[fromPath[0]!];
    moved.push(`bkit.${from} -> bkit.${to}`);
  }
  if (Object.prototype.hasOwnProperty.call(cfg, "loopPause")) {
    const old = cfg.loopPause;
    if (typeof old === "boolean") {
      if (cfg.workflows === undefined) cfg.workflows = {};
      if (plainObject(cfg.workflows)) mergeMissing(cfg.workflows, askOnly(old));
    }
    delete cfg.loopPause;
    moved.push("bkit.loopPause -> bkit.workflows.<workflow>.<point>.ask");
  }
  if (moved.length === 0) return false;
  ws.writes.push({ path: pkgPath, action: "update" });
  if (!dryRun) writePackageJsonLike(raw, pkg);
  console.log(
    `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: moved ${moved.join(", ")} in package.json`,
  );
  return true;
}

/** `{design: {grill: {ask}}, build: {verify: {ask}, ...}, ...}` with every `ask` = `ask`. */
function askOnly(ask: boolean): Record<string, unknown> {
  const out: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const point of ASK_POINTS) {
    const [workflow, name] = point.split(".") as [string, string];
    (out[workflow] ??= {})[name] = { ask };
  }
  return out;
}

// Migration (up to 5.4.x installs, `docs/migrations.md`): the Linear team lived at
// `bkit.linearTeam`; it is `bkit.linear.team`, beside the project and state names. An
// existing `bkit.linear.team` wins over the old key. Returns true when package.json changed.
export function migrateLinearTeamKey(dryRun: boolean, ws: WriteSet, logPrefix: string): boolean {
  const pkgPath = "package.json";
  if (!fs.existsSync(pkgPath)) return false;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  if (!parsed.ok) return false;
  const pkg = parsed.value as Record<string, unknown>;
  const bkit = pkg.bkit;
  if (bkit === null || typeof bkit !== "object" || Array.isArray(bkit)) return false;
  const cfg = bkit as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(cfg, "linearTeam")) return false;
  const old = cfg.linearTeam;
  const linear =
    cfg.linear !== null && typeof cfg.linear === "object" && !Array.isArray(cfg.linear)
      ? (cfg.linear as Record<string, unknown>)
      : {};
  if (linear.team === undefined && typeof old === "string" && old.trim() !== "") linear.team = old;
  delete cfg.linearTeam;
  if (Object.keys(linear).length > 0) cfg.linear = linear;
  ws.writes.push({ path: pkgPath, action: "update" });
  if (!dryRun) writePackageJsonLike(raw, pkg);
  console.log(
    `${logPrefix} ${dryRun ? "[dry-run] " : ""}core: moved bkit.linearTeam to bkit.linear.team in package.json`,
  );
  return true;
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
 * The scripts a gate ends up running: each `pnpm <script>` / `pnpm run <script>` it calls,
 * with every `bkit:gate:*` it chains expanded in place. pnpm's own subcommands and
 * binaries are left out.
 */
export function gateLeafScripts(
  gate: string,
  declared: Readonly<Record<string, string>>,
  seen: Set<string> = new Set(),
): string[] {
  const value = declared[gate];
  if (typeof value !== "string" || seen.has(gate)) return [];
  seen.add(gate);
  const leaves: string[] = [];
  for (const [, called] of value.matchAll(/\bpnpm (?:run )?([\w:-]+)/g)) {
    if (PNPM_NOT_A_SCRIPT.has(called)) continue;
    if (called.startsWith("bkit:gate:")) leaves.push(...gateLeafScripts(called, declared, seen));
    else leaves.push(called);
  }
  return leaves;
}

/**
 * What a gate may run. bkit never reads a gate's value beyond its seeded default, so it
 * cannot check this; every gate advisory restates it (`.bkit/workflows.md` § Local gate
 * scripts).
 */
export const GATE_CONTENTS_NOTE =
  "Gate contents (`.bkit/workflows.md` § Local gate scripts): every gate but `bkit:gate:static-unit-integration-e2e` and `bkit:gate:static-unit-integration-e2e-live` runs on a push or inside `/bkit-build`, so it MUST NOT run tests that need a deployed boundary or remote service; local services (a database in Docker) are fine.";

/**
 * Advisories for the `bkit:gate:*` scripts: the scripts a still-default gate
 * chains that package.json does not declare, the deeper test tiers the repo has
 * but no gate runs, a commit gate that repeats the push gate, a missing
 * `bkit:test:file`, and a missing `bkit:gate:changed`. Judges the scripts as install
 * leaves them (missing gate names at their seeded defaults), so install, `bkit check`
 * and `bkit upgrade` report the same set. Read-only; an absent or unparseable
 * package.json yields none.
 */
export function detectGateAdvisories(cwd: string): PreflightFinding[] {
  const read = readJsonFile(path.join(cwd, "package.json"));
  // Absent or malformed package.json — preflight's no-package-json /
  // malformed-package-json blockers already report it.
  if (!read.ok || read.value === null) return [];
  const pkg = read.value as { scripts?: Record<string, string> };
  const declared: Record<string, string> = { ...BKIT_GATE_SCRIPTS, ...pkg.scripts };
  const findings: PreflightFinding[] = [];

  // Every script a seeded gate default chains MUST exist, or the gate dies on the first
  // missing one and the workflow reads that as a real failure. Checked only where the
  // value is still bkit's default — a consumer who rewrote the gate owns what it calls.
  const missing = new Set<string>();
  for (const [name, seeded] of Object.entries(BKIT_GATE_SCRIPTS)) {
    if (declared[name] !== seeded) continue;
    for (const [, called] of seeded.matchAll(/\bpnpm ([\w:-]+)/g)) {
      if (PNPM_NOT_A_SCRIPT.has(called)) continue;
      if (!(called in declared)) missing.add(called);
    }
  }
  if (missing.size > 0) {
    const names = [...missing].sort().map((n) => `\`${n}\``);
    findings.push({
      id: "gate-missing-called-scripts",
      severity: "advisory",
      detect: `The bkit:gate scripts call scripts package.json does not declare: ${names.join(", ")}.`,
      action: `Every bkit workflow runs a \`bkit:gate*\` script, so a missing link fails the whole gate. Add ${names.join(", ")} to package.json (\`.bkit/templates.md\` lists the tool scripts and the devDeps they need), or edit the \`bkit:gate*\` scripts to drop what this repo does not have.\n\n${GATE_CONTENTS_NOTE}`,
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
        "package.json declares deeper test tiers than any `bkit:gate*` script runs, so `/bkit-build`, `/bkit-debug` and the pre-push hook gate at `bkit:gate:static-unit` and never execute them.",
      action:
        "Each workflow runs the DEEPEST gate you declare, and `.husky/pre-push` runs `bkit:gate:static-unit-integration` when it is declared; an undeclared one is skipped, never guessed. Add the gates you want the agent loop to run:\n\n" +
        unwired.join("\n") +
        "\n\nOrder matters — each chains the one above it. Omit a level deliberately to keep it CI-only (E2E in the build loop costs a production build on every remediation attempt). `.bkit/templates.md` lists the tool scripts the gates chain.\n\n" +
        GATE_CONTENTS_NOTE,
    });
  }

  // The commit gate is the fast one: a script it shares with the push gate runs on every
  // commit and again on the push that carries it.
  const pushGate = BKIT_PUSH_GATES.find((g) => g in declared);
  const commitCalls = pushGate === undefined ? [] : gateLeafScripts("bkit:gate:format", declared);
  const pushCalls = new Set(pushGate === undefined ? [] : gateLeafScripts(pushGate, declared));
  const repeated = [...new Set(commitCalls.filter((s) => pushCalls.has(s)))].sort();
  if (repeated.length > 0) {
    const names = repeated.map((n) => `\`${n}\``).join(", ");
    findings.push({
      id: "gate-commit-repeats-push",
      severity: "advisory",
      detect: `\`bkit:gate:format\` (pre-commit) runs ${names}, which \`${pushGate}\` (pre-push) runs again.`,
      action: `Drop ${names} from \`bkit:gate:format\`. The commit gate formats staged files and nothing else; every whole-repo check runs once, at pre-push.\n\n${GATE_CONTENTS_NOTE}`,
    });
  }

  // /bkit-build records each task's red through this script; without it test-first is
  // reported as not enforced. bkit cannot seed it: what runs one file is the stack's.
  if (!(BKIT_TEST_FILE_SCRIPT in declared)) {
    findings.push({
      id: "test-file-script-missing",
      severity: "advisory",
      detect: `package.json does not declare \`${BKIT_TEST_FILE_SCRIPT}\`, so \`/bkit-build\` cannot check that each task's tests fail before its code is written.`,
      action: `Add \`${BKIT_TEST_FILE_SCRIPT}\` to package.json: it runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit report to the path in \`$BKIT_TEST_REPORT\`. Vitest example:\n\n    "${BKIT_TEST_FILE_SCRIPT}": "vitest run --reporter=default --reporter=junit --outputFile.junit=\\"$BKIT_TEST_REPORT\\""\n\nCall the runner directly, not through a task runner that caches results or runs dependent packages first. A monorepo routes the path to the package and config that own it.`,
    });
  }

  // A red recorded before the linter sees the test: a lint rewrite after it reads as an
  // edited test, and no red can be recorded again once the task's code makes it pass.
  if (BKIT_TEST_FILE_SCRIPT in declared && !(BKIT_LINT_FILE_SCRIPT in declared)) {
    findings.push({
      id: "lint-file-script-missing",
      severity: "advisory",
      detect: `package.json declares \`${BKIT_TEST_FILE_SCRIPT}\` but not \`${BKIT_LINT_FILE_SCRIPT}\`, so \`/bkit-build\` records a task's red before the linter sees the test; a lint fix after it pauses the build for an owner exception.`,
      action: `Add \`${BKIT_LINT_FILE_SCRIPT}\` to package.json: it lints the ONE test file bkit appends as its argument (repo-relative path) with the rules your static gate applies, exiting 0 when clean. \`bkit tests red\` runs it before the test and records no red while it fails. Examples:\n\n    "${BKIT_LINT_FILE_SCRIPT}": "eslint --max-warnings=0"\n    "${BKIT_LINT_FILE_SCRIPT}": "ruff check"\n\nUse the same linter config as the static gate, or the gate can still demand a rewrite after the red.`,
    });
  }

  // Build and debug agents check their own change through this script; without it each
  // one runs a whole gate after every change. bkit cannot seed it: what finds the tests
  // a file affects is the stack's.
  const changedId = "gate-changed-script-missing";
  if (
    !(BKIT_GATE_CHANGED_SCRIPT in declared) &&
    !isAdvisorySuppressed(cwd, changedId, "advisory")
  ) {
    findings.push({
      id: changedId,
      severity: "advisory",
      detect: `package.json does not declare \`${BKIT_GATE_CHANGED_SCRIPT}\`, so \`/bkit-build\` and \`/bkit-debug\` agents run a whole gate (\`bkit:gate:static\` or \`bkit:gate:static-unit\`) after every change instead of checking only what changed.`,
      action: `Add \`${BKIT_GATE_CHANGED_SCRIPT}\` to package.json. \`bkit tests changed\` calls it with the changed files as its arguments (repo-relative paths: uncommitted, untracked and committed since the step began; deleted files left out) and never with none. It runs the tests that import those files, the tests that name their paths, and the static checks (lint, format, typecheck) on those files, exiting 0 when clean. Vitest + ESLint example, with \`scripts/gate-changed.sh\` holding \`vitest related --run "$@" && eslint --max-warnings=0 --no-error-on-unmatched-pattern "$@" && prettier --check --ignore-unknown "$@"\`:\n\n    "${BKIT_GATE_CHANGED_SCRIPT}": "sh scripts/gate-changed.sh"\n\n\`vitest related\` finds only importers; also run the tests that read a changed file by its path (a text search of the test files for each path). The orchestrator's group gate, pre-push and CI still run the whole gates. To keep the whole gate on every change, add \`${changedId}\` to \`bkit.advisories.ignore\` in package.json.\n\n${GATE_CONTENTS_NOTE}`,
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
 * so every agent run and push passes it. Warn-only, at install, `bkit check` and `bkit upgrade`, on
 * every branch. Read-only; an absent or unparseable package.json yields none.
 */
export function detectNoopGates(cwd: string): PreflightFinding[] {
  const read = readJsonFile(path.join(cwd, "package.json"));
  // Absent or malformed package.json — preflight's blockers already report it.
  if (!read.ok || read.value === null) return [];
  const pkg = read.value as { scripts?: Record<string, unknown> };
  const declared: Record<string, unknown> = pkg.scripts ?? {};
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
        'Every bkit workflow and the pre-push hook trust a green `bkit:gate*` script, so a no-op gate passes every agent run and push. Point each at the checks it should run (e.g. `"bkit:gate:static": "pnpm typecheck && pnpm lint"`), or delete it from package.json and run `bkit upgrade` to get bkit\'s default back.\n\n' +
        GATE_CONTENTS_NOTE,
    },
  ];
}

export function runCoreModule(ctx: ModuleContext): void {
  const { dryRun, ws, advisories, logPrefix, postDispatch } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const cwd = process.cwd();
  const pkgVersion = readInstallingVersion();

  // Capture first-install signal NOW (before any writes) — used for the post-install banner.
  // The .bkit/version write happens in postDispatch, so a mid-install crash in a later
  // module leaves no .bkit/version on disk.
  const versionFile = path.join(cwd, ".bkit", "version");
  const isFirstInstall = !fs.existsSync(versionFile);

  // 2. Core payload pass (AGENTS.md, `.agents/*.md`, `docs/templates/**`, the two
  // shared-root files core owns). Each host module writes its own hook files.
  console.log(`${logPrefix} ${tag}Running core payload pass`);
  runCoreTemplates(dryRun, ctx.tokens, ws, logPrefix);

  // 3b. bkit canonical docs pass — mirror the package's reference docs
  // (cloud/IDEs/prompts/trackers/workflows/README/install/comparison/pipeline) into the
  // consumer's `.bkit/` so they are readable in-repo. Force-overwrite (Tier 1).
  console.log(`${logPrefix} ${tag}Running bkit docs pass`);
  runBkitDocs(dryRun, ctx.tokens, ws, logPrefix);

  // 3b2. Template copies — the whole templates root into the consumer's
  // `.bkit/templates/` (never applied to the repo; no-op in dogfood).
  console.log(`${logPrefix} ${tag}Running template copies pass`);
  const templateChanges = syncTemplateCopies(cwd, { dryRun, ws });
  for (const [verb, paths] of Object.entries(templateChanges)) {
    for (const p of paths) {
      console.log(`${logPrefix} ${tag}template ${verb}: ${path.join(TEMPLATE_COPIES_DIR, p)}`);
    }
  }

  // 3b3. Payload view links — `.bkit/core` + `.bkit/shared` symlinks into the
  // installed package (browse-only, gitignored; no-op in dogfood). A real
  // directory or file at either path is never clobbered (advisory); a platform
  // refusal is an advisory, never a failure.
  const linkChanges = syncPayloadLinks(cwd, { dryRun });
  for (const rel of linkChanges.created) {
    console.log(`${logPrefix} ${tag}payload link: ${rel}`);
  }
  for (const rel of linkChanges.repaired) {
    console.log(`${logPrefix} ${tag}payload link repaired: ${rel}`);
  }
  for (const rel of linkChanges.skippedRealDir) {
    advisories.push({
      id: "payload-link-real-dir",
      severity: "advisory",
      detect: `${rel} is a real directory or file, not a view symlink into the installed package — left untouched.`,
      action: `bkit never overwrites consumer content. The ${rel} view is a symlink into node_modules/@cbartens/bkit; if you want it, remove your own ${rel} by hand and re-run \`bkit install\`.`,
    });
  }
  for (const rel of linkChanges.failed) {
    advisories.push({
      id: "payload-link-failed",
      severity: "advisory",
      detect: `could not create the ${rel} view symlink into the installed package (the platform refused).`,
      action: `Browse-only — bkit reads its payload from the package regardless. To add the view by hand on POSIX: ln -s ../node_modules/@cbartens/bkit/${rel} ${rel}`,
    });
  }

  // 3b4. `.bkit/allowlist.json` — the network allowlist every host's guardrails hook
  // reads (writeNetworkAllowlist), plus the move off the retired `.cursor/` copy.
  writeNetworkAllowlist(cwd, dryRun, ws, logPrefix);

  // 3c. The bkit:gate:* / bkit:deps:* package.json scripts (add-if-missing). The
  // advisories read the result.
  seedCorePackageJsonScripts(ctx);
  advisories.push(...detectGateAdvisories(cwd));
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
      // Brand-migrated copy-and-own files carry no hash.
      if (entry.unhashed) continue;
      const absPath = path.isAbsolute(entry.path) ? entry.path : path.resolve(cwd, entry.path);
      const relPath = path.relative(cwd, absPath);
      if (relPath === path.join(".bkit", "version")) continue;
      if (relPath.startsWith(".agents" + path.sep)) continue;
      // Template copies carry no hash.
      if (relPath.startsWith(TEMPLATE_COPIES_DIR + path.sep)) continue;
      // Payload view links carry no hash either — a symlink's bytes are the package's.
      if (PAYLOAD_LINK_RELPATHS.has(relPath)) continue;
      if (!fs.existsSync(absPath)) continue;
      const hash = hashFile(absPath);
      if (hash) newCanonicalEntries[relPath] = hash;
    }

    // Merge: existing hashes preserved, new writes overwrite (hashes stay current),
    // and entries whose path is gone are pruned (mergeCanonicalHashes).
    const { canonicalHashes, pruned } = mergeCanonicalHashes(
      cwd,
      existingCanonical,
      newCanonicalEntries,
    );

    // Decide whether a write is needed: version mismatch, first install, new canonical
    // entries, a pruned stale entry, or a changed claudeAllowDerived record.
    const versionChanged = !existingVersion || existingVersion.pinnedVersion !== pkgVersion;
    const hasNewEntries = Object.keys(newCanonicalEntries).length > 0;
    const claudeAllowDerived = ctx.claudeAllowRecorded ?? existingVersion?.claudeAllowDerived ?? [];
    const derivedChanged =
      JSON.stringify(claudeAllowDerived) !==
      JSON.stringify(existingVersion?.claudeAllowDerived ?? []);
    const needsWrite = versionChanged || hasNewEntries || pruned > 0 || derivedChanged;

    if (needsWrite) {
      console.log(
        `${logPrefix} ${tag}write version pin: ${path.relative(cwd, versionFile)} (${pkgVersion})`,
      );
      ws.writes.push({ path: versionFile, action: "write" });
      if (!dryRun) {
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
        "1. Run `pnpm install` to refresh the lockfile, then commit.\n\n" +
        "2. See `.bkit/install.md` for consumer setup and `.bkit/README.md` for ongoing ops.\n\n" +
        "Note: bkit seeded the bkit:gate:* / bkit:deps:* package.json scripts every workflow\n" +
        "runs (existing values are never touched). The tool scripts they chain (typecheck,\n" +
        "lint, format:check, bkit:lint:prose, bkit:slop:delta) and the devDeps those need are yours to\n" +
        "add: see .bkit/templates.md.",
    });
  }
}

// ---------------------------------------------------------------------------
// runClaudeModule — byte-identical mirror from .agents/ → .claude/
// ---------------------------------------------------------------------------

export const BKIT_PREFIX = "bkit-";
