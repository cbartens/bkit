// install/modules/index.ts — Module registry and per-module install functions.
// Each module function receives { dryRun, tokens, modelLookup, advisories, ws, … } (ModuleContext)
// and emits writes into the shared WriteSet.
//
// Dispatch order: core → claude → cursor → opencode → codex → lint → cloud
// .bkit/version is written LAST — in postDispatch after ALL modules complete (MED-4).

import * as fs from "node:fs";
import * as path from "node:path";
import type { WriteSet } from "../write.js";
import type { TokenMap } from "../placeholders.js";
import type { ModuleFlag, CloudVariant } from "../../cli.js";
import type { EffortMap } from "../../render/models.js";
import type { PreflightFinding } from "../../checks/before/index.js";
import { getTemplatesRoot, getBkitDocsRoot } from "../../shared/package-roots.js";
import { getInstallManifest, type IssueTracker } from "../manifest.js";
import {
  BKIT_CANONICAL_DOCS,
  BKIT_PREFIX,
  listCoreTemplateFiles,
  runBkitDocs,
  runCoreModule,
  runLintModule,
  seedCorePackageJsonScripts,
} from "./core.js";
import { renderClaudeAgentsCommands, runClaudeModule } from "./claude.js";
import { renderCursorAgentsCommands, runCursorModule } from "./cursor.js";
import { renderOpencodeAgentsCommands, runOpencodeModule } from "./opencode.js";
import { CODEX_SKILLS_DIR, renderCodexAgentsSkills, runCodexModule } from "./codex.js";
import { runCloudModule } from "./cloud.js";

// ---------------------------------------------------------------------------
// Module context
// ---------------------------------------------------------------------------

export interface ModuleContext {
  dryRun: boolean;
  /**
   * Set by runClaudeModule to what enrichClaudeSettingsAllows actually recorded, so
   * core's postDispatch can persist it into `.bkit/version`. `null` or absent means
   * "not determined this run" — the prior record is carried forward, never cleared.
   * Enrich itself never writes `.bkit/version`; there is one writer.
   */
  claudeAllowRecorded?: readonly string[] | null;
  tokens: TokenMap;
  modelLookup: Map<string, string>;
  /**
   * opencode model lookup for the opencode module, separate from modelLookup (consumed by
   * runCursorModule). Populated only when --opencode is in the module set. Empty map when
   * absent.
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
   * (e.g. writing .bkit/version after all modules return cleanly).
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
   * command as a managed-version marker. Optional: when absent the render functions fall
   * back to reading the package root directly (readInstallingVersion); production
   * install/upgrade set it explicitly.
   */
  version?: string;
}

export type ModuleFn = (ctx: ModuleContext) => void;

// ---------------------------------------------------------------------------
// renderManagedOutputs — re-render the bkit-managed OUTPUT files that the
// `bkit upgrade` template walk (runUpgrade over .bkit/templates/) does NOT cover:
// host agents/commands (source-rendered), the `.bkit/*.md` canonical docs
// (runBkitDocs) and core's package.json scripts (seedCorePackageJsonScripts).
// `.bkit/prompts.md` is markered → runBkitDocs block-merges it (managed block
// refreshed, consumer `## Model Overrides` below bkit:end preserved).
//
// CRITICAL: docs stay single-source PACKAGE-side and are mirrored from
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

// ---------------------------------------------------------------------------
// listStampedFiles — every file bkit writes that carries the managed-version marker
// ---------------------------------------------------------------------------

/** A file bkit writes into the consumer repo carrying the managed-version marker. */
export interface StampedFile {
  /** Consumer-relative path. */
  path: string;
  /** `block`: the marker is the first line of the file's bkit block. `whole`: bkit owns the file. */
  scope: "block" | "whole";
}

/** Rendered mirror dirs: every `bkit-*` file of the given extension in each is bkit's. */
const RENDERED_MIRRORS: ReadonlyArray<[dir: string, ext: string]> = [
  [".claude/agents", ".md"],
  [".claude/commands", ".md"],
  [".cursor/agents", ".md"],
  [".cursor/commands", ".md"],
  [".opencode/agents", ".md"],
  [".opencode/commands", ".md"],
  [".codex/agents", ".toml"],
];

/**
 * Every file bkit writes into `cwd` that carries the managed-version marker: the core
 * templates (listCoreTemplateFiles), the non-JSON non-generated manifest entries of every
 * module, and the rendered mirrors present on disk (agents, commands, the codex workflow
 * skills). JSON files carry none. A `.bkit/*.md` doc whose package source is the destination
 * (dogfood) is not rendered there, so it is left out. Paths only; whether each exists is the
 * caller's to check.
 */
export function listStampedFiles(cwd: string): StampedFile[] {
  const byPath = new Map<string, StampedFile>();
  const add = (p: string, scope: StampedFile["scope"]): void => {
    const rel = path.normalize(p);
    if (!byPath.has(rel)) byPath.set(rel, { path: rel, scope });
  };

  for (const { dst, scope } of listCoreTemplateFiles(getTemplatesRoot())) add(dst, scope);

  const canonicalDocs = new Set<string>(BKIT_CANONICAL_DOCS.map((n) => path.join(".bkit", n)));
  for (const entry of getInstallManifest()) {
    if (entry.format === "json" || entry.generated) continue;
    if (entry.path === path.join(".bkit", "version")) continue;
    if (
      canonicalDocs.has(path.normalize(entry.path)) &&
      path.resolve(cwd, entry.path) === path.resolve(getBkitDocsRoot(), path.basename(entry.path))
    ) {
      continue;
    }
    add(entry.path, entry.format === "markered-text" ? "block" : "whole");
  }

  for (const [dir, ext] of RENDERED_MIRRORS) {
    const abs = path.join(cwd, dir);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.startsWith(BKIT_PREFIX) && f.endsWith(ext)) add(path.join(dir, f), "whole");
    }
  }
  const skills = path.join(cwd, CODEX_SKILLS_DIR);
  if (fs.existsSync(skills)) {
    for (const d of fs.readdirSync(skills)) {
      if (!d.startsWith(BKIT_PREFIX)) continue;
      if (fs.existsSync(path.join(skills, d, "SKILL.md"))) {
        add(path.join(CODEX_SKILLS_DIR, d, "SKILL.md"), "whole");
      }
    }
  }
  return [...byPath.values()];
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
  // Run deferred finalisation callbacks (e.g. .bkit/version write) only after all modules succeed.
  for (const cb of ctx.postDispatch) {
    cb();
  }
}
