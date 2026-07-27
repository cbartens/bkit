// bkit-uninstall.ts — Single owner of all uninstall logic. (P2.T5-P2.T8)
//
// runUninstall(modules, ctx) orchestrates:
//   1. For each installed file — single dispatch on entry.format:
//      - "json"            : stripTier2JsonScope (strip bkit-owned JSON scope)
//      - "markered-text"   : stripManagedBlock, remove file if empty remainder
//      - "byte-equal-text" : shouldDeleteTier3 — delete only if hash matches install-time hash
//   2. package.json: stripManagedKeys for scripts/devDeps
//   3. .agents/ mirror files (bkit-prefix .md files in .claude/ .cursor/)
//
// Flags:
//   --dry-run       print decision table (FILE / DECISION / REASON) without writes
//   --force         override byte-equal-text hash guard (force-delete even if consumer modified)
//   --nuke          confirm prompt then wipe ALL bkit-managed files regardless of format
//   --yes           skip interactive confirm for --nuke
//   --package       also strip managed package.json keys
//   --keep-npmrc    skip .npmrc removal (default: skip anyway — .npmrc is not bkit-managed)
//   --keep-tooling  skip vale/husky/prettier devDep removal
//
// Observability: console.error("[bkit-uninstall] …") for all error paths.

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import {
  stripManagedBlock,
  type MarkerStyle,
  type JsonValue,
  type WriteSet,
} from "./bkit-tiers.js";
import {
  getInstallManifest,
  type ManifestEntry,
  type ModuleName,
  type IssueTracker,
} from "./bkit-manifest.js";
import { readBkitVersion, shouldDeleteTier3 } from "./bkit-version.js";
import { stripManagedKeys } from "./bkit-package-json.js";
import { getPkgRoot, getTemplatesRoot } from "./bkit-paths.js";
import { removeOpencodeProviderBlock, renderOpencodeJson } from "./bkit-modules.js";
import { CLAUDE_CLOUD_RELPATH, CURSOR_CLOUD_RELPATH } from "./bkit-cloud-env.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UninstallContext {
  /** Consumer repo root (defaults to process.cwd()). */
  cwd: string;
  /** Dry-run: compute decisions but do NOT write to disk. */
  dryRun: boolean;
  /**
   * Force-delete Tier-3 files even if hash differs (consumer modified).
   * Default: false (preserve consumer modifications).
   */
  force: boolean;
  /**
   * Nuke mode: remove ALL bkit-managed files (Tier 1+2+3) regardless of
   * consumer modifications. Requires --yes or interactive confirm.
   * Default: false.
   */
  nuke: boolean;
  /**
   * Skip interactive confirm for --nuke. Useful in non-interactive scripts.
   */
  yes: boolean;
  /**
   * Also strip managed package.json keys (scripts + devDeps).
   */
  stripPackage: boolean;
  /** Log prefix for console output. */
  logPrefix: string;
}

/** Decision taken for each file during uninstall. */
export type FileDecision =
  | "delete"
  | "strip-block"
  | "preserve"
  | "skip-absent"
  | "skip-tier3-modified"
  | "skip-tier3-unknown";

export interface FileSummary {
  file: string;
  decision: FileDecision;
  reason: string;
  format: "json" | "markered-text" | "byte-equal-text";
}

export interface UninstallResult {
  deleted: string[];
  stripped: string[];
  preserved: string[];
  decisions: FileSummary[];
  dryRun: boolean;
}

// ---------------------------------------------------------------------------
// Tier-2 file strip helper
// ---------------------------------------------------------------------------

/**
 * Detect the marker style used in a file (html-comment or hash-comment).
 * Returns null if neither style is present.
 */
function detectMarkerStyle(content: string): MarkerStyle | null {
  // HTML markers may carry a `# ` / `// ` comment prefix so they survive inside
  // shell / JS files (e.g. preflight.sh uses `# <!-- bkit:start -->`); match the
  // same prefixes findAnchored/ALLOWED_PREFIXES allow. Checked FIRST so a prefixed
  // HTML marker is never mistaken for the bare `# bkit:start` hash style.
  if (/^(?:# |\/\/ )?<!-- bkit:start -->$/m.test(content)) return "html-comment";
  if (/^# bkit:start$/m.test(content)) return "hash-comment";
  return null;
}

// ---------------------------------------------------------------------------
// stripTier2JsonScope — remove bkit-owned JSON scope from consumer doc (BAR-167 Phase 1)
//
// Pure function — no file I/O.
//
// Algorithm:
//   1. Deep-clone consumer to `out`.
//   2. Walk template; for each leaf path `p`:
//      - If `out[p]` deep-equals template[p] → delete it from `out`.
//      - Else leave it (consumer has customised it — preserve).
//   3. Prune empty intermediate objects ONLY where template populated them
//      (NOT arrays; NOT consumer-only siblings).
//   4. Return `out`.
//
// Consumer-only keys at any level are preserved byte-identical.
// ---------------------------------------------------------------------------

/**
 * Detect the tracker bkit seeded into opencode.json from its mcp keys. The template ships an
 * `@@OPENCODE_TRACKER_MCP@@` sentinel KEY that renders to `github` / `linear` at install, so a
 * strip-scope keyed on the raw template never matches — these detectors let uninstall render the
 * template the same way the install did before stripping. Keyed on bkit's known tracker names so
 * a consumer-added mcp server is never mistaken for bkit's.
 */
function detectOpencodeTracker(doc: Record<string, JsonValue>): IssueTracker {
  const mcp = doc.mcp;
  if (mcp !== null && typeof mcp === "object" && !Array.isArray(mcp)) {
    if ("github" in mcp) return "github";
    if ("linear" in mcp) return "linear";
  }
  return "none";
}

/** Detect the opencode provider key bkit seeded (the first `provider` block key). */
function detectOpencodeProvider(doc: Record<string, JsonValue>): string {
  const provider = doc.provider;
  if (provider !== null && typeof provider === "object" && !Array.isArray(provider)) {
    const keys = Object.keys(provider);
    if (keys.length > 0) {
      const first = keys[0];
      // Zen block is keyed `opencode` (built-in id); map back to the bkit CLI key.
      return first === "opencode" ? "opencode-zen" : first;
    }
  }
  return "opencode-zen";
}

export function stripTier2JsonScope(
  consumerDoc: Record<string, JsonValue>,
  templateDoc: Record<string, JsonValue>,
): Record<string, JsonValue> {
  const out = JSON.parse(JSON.stringify(consumerDoc)) as Record<string, JsonValue>;
  _stripScope(out, templateDoc);
  return out;
}

function _stripScope(
  consumer: Record<string, JsonValue>,
  template: Record<string, JsonValue>,
): void {
  for (const key of Object.keys(template)) {
    const tVal = template[key];
    const cVal = consumer[key];
    if (cVal === undefined) continue; // consumer doesn't have it — nothing to strip

    if (
      tVal !== null &&
      typeof tVal === "object" &&
      !Array.isArray(tVal) &&
      cVal !== null &&
      typeof cVal === "object" &&
      !Array.isArray(cVal)
    ) {
      // Both plain objects — recurse into them
      const tObj = tVal as Record<string, JsonValue>;
      const cObj = cVal as Record<string, JsonValue>;
      _stripScope(cObj, tObj);
      // Prune empty intermediate only if template populated this key
      if (Object.keys(cObj).length === 0) {
        delete consumer[key];
      }
    } else {
      // Leaf (primitive, array, null) — remove if deep-equal to template
      if (JSON.stringify(cVal) === JSON.stringify(tVal)) {
        delete consumer[key];
      }
      // else: consumer has a different value — preserve it
    }
  }
}

// ---------------------------------------------------------------------------
// Decision table builder (for --dry-run output and UninstallResult)
// ---------------------------------------------------------------------------

/**
 * Build a decision table for all files that would be affected by uninstall.
 * Does NOT perform any writes.
 */
// Core doctrine files installed by the templates pass (runCoreTemplates), NOT the manifest —
// so the manifest-driven table never sees them and a full uninstall would orphan bkit's own
// rules/docs/skills/config. Each carries a bkit managed block (markered-text), so strip-block
// preserves any consumer content added below `bkit:end`, exactly like the root AGENTS.md.
// Removed only on a full/core uninstall (gated on core in moduleList below).
const CORE_TEMPLATE_DOCTRINE: ManifestEntry[] = [
  { path: ".agents/config.md", format: "markered-text", module: "core" },
  { path: ".agents/docs.md", format: "markered-text", module: "core" },
  { path: ".agents/rules.md", format: "markered-text", module: "core" },
  { path: ".agents/skills.md", format: "markered-text", module: "core" },
];

export function buildDecisionTable(
  modules: ModuleName[] | Set<string>,
  ctx: Pick<UninstallContext, "cwd" | "force" | "nuke">,
): FileSummary[] {
  const moduleList =
    modules instanceof Set
      ? ([...modules].filter((m) =>
          // Include the opt-in add-ons (renovate/dependabot/cloud) too — a Set caller passing
          // them must not have them silently dropped (zero-footprint trap). (#255 P3)
          [
            "core",
            "claude",
            "cursor",
            "ci",
            "lint",
            "git-hooks",
            "opencode",
            "renovate",
            "dependabot",
            "cloud",
          ].includes(m),
        ) as ModuleName[])
      : (modules as ModuleName[]);

  const entries = [
    ...getInstallManifest(moduleList),
    ...(moduleList.includes("core") ? CORE_TEMPLATE_DOCTRINE : []),
  ];

  // Read tier3Hashes from .bkit-version
  const versionFilePath = path.join(ctx.cwd, ".bkit", "version");
  const bkitVer = readBkitVersion(versionFilePath);
  const tier3Hashes = bkitVer?.tier3Hashes ?? {};

  const table: FileSummary[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const absPath = path.join(ctx.cwd, entry.path);
    const key = entry.path;
    if (seen.has(key)) continue; // deduplicate (e.g. package.json appears in multiple modules)
    seen.add(key);

    if (!fs.existsSync(absPath)) {
      table.push({
        file: entry.path,
        decision: "skip-absent",
        reason: "file not found — nothing to do",
        format: entry.format,
      });
      continue;
    }

    if (ctx.nuke) {
      // Nuke: delete everything regardless of format
      table.push({
        file: entry.path,
        decision: "delete",
        reason: "--nuke: forcibly remove",
        format: entry.format,
      });
      continue;
    }

    // Single dispatch on entry.format
    switch (entry.format) {
      case "json": {
        // JSON deep-containment: strip bkit-owned scope from consumer doc
        // For uninstall, treat as strip-block (handled in runUninstall via stripTier2JsonScope)
        table.push({
          file: entry.path,
          decision: "strip-block",
          reason: "json (deep-containment) — strip bkit-owned scope, preserve consumer keys",
          format: "json",
        });
        break;
      }
      case "markered-text": {
        const content = fs.readFileSync(absPath, "utf-8");
        const style = detectMarkerStyle(content);
        if (!style) {
          table.push({
            file: entry.path,
            decision: "preserve",
            reason: "markered-text but no bkit markers found — 100% consumer content",
            format: "markered-text",
          });
        } else {
          table.push({
            file: entry.path,
            decision: "strip-block",
            reason: "markered-text — strip bkit block, preserve consumer content",
            format: "markered-text",
          });
        }
        break;
      }
      case "byte-equal-text": {
        // .bkit/version is bkit's own install-state manifest (pinnedVersion + tier3Hashes), never
        // consumer content. It records no hash for itself, so the generic hash-guard preserves it
        // as "consumer-modified" — leaving bkit state behind after a full teardown. It is
        // `module: core`, so it only reaches this table on a full/core uninstall; delete it there
        // (zero-footprint). A targeted (non-core) uninstall never sees it, so the modules that
        // remain keep working. Execution reads tier3Hashes into memory before the delete loop, so
        // removing this file mid-loop cannot affect any other file's decision.
        if (entry.path === ".bkit/version") {
          table.push({
            file: entry.path,
            decision: "delete",
            reason: "bkit install-state manifest — removed on full/core uninstall",
            format: "byte-equal-text",
          });
          break;
        }
        if (ctx.force) {
          table.push({
            file: entry.path,
            decision: "delete",
            reason: "--force: delete byte-equal-text regardless of hash",
            format: "byte-equal-text",
          });
          break;
        }
        const safe = shouldDeleteTier3(entry.path, absPath, tier3Hashes);
        if (tier3Hashes[entry.path] === undefined) {
          table.push({
            file: entry.path,
            decision: "skip-tier3-unknown",
            reason:
              "byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it)",
            format: "byte-equal-text",
          });
        } else if (safe) {
          table.push({
            file: entry.path,
            decision: "delete",
            reason: "byte-equal-text: content matches install-time hash — safe to delete",
            format: "byte-equal-text",
          });
        } else {
          table.push({
            file: entry.path,
            decision: "skip-tier3-modified",
            reason:
              "byte-equal-text: content differs from install-time hash — consumer modified, preserve",
            format: "byte-equal-text",
          });
        }
        break;
      }
    }
  }

  return table;
}

// ---------------------------------------------------------------------------
// Format dry-run decision table
// ---------------------------------------------------------------------------

/**
 * Format a decision table as a human-readable string.
 * Format: FILE | DECISION | REASON
 */
export function formatDecisionTable(table: FileSummary[]): string {
  if (table.length === 0) return "[bkit-uninstall] No files to process.\n";

  const COL_FILE = 48;
  const COL_DEC = 22;

  const header =
    `${"FILE".padEnd(COL_FILE)} | ${"DECISION".padEnd(COL_DEC)} | REASON\n` +
    `${"-".repeat(COL_FILE)}-+-${"-".repeat(COL_DEC)}-+-${"-".repeat(40)}\n`;

  const rows = table
    .map((r) => `${r.file.padEnd(COL_FILE)} | ${r.decision.padEnd(COL_DEC)} | ${r.reason}`)
    .join("\n");

  return header + rows + "\n";
}

// ---------------------------------------------------------------------------
// Prompt helper (--nuke confirmation)
// ---------------------------------------------------------------------------

async function confirmNuke(): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(
      "[bkit-uninstall] --nuke will delete ALL bkit-managed files. Type 'yes' to confirm: ",
      (answer) => {
        rl.close();
        resolve(answer.trim().toLowerCase() === "yes");
      },
    );
  });
}

// ---------------------------------------------------------------------------
// runUninstall — main orchestrator
// ---------------------------------------------------------------------------

/**
 * Perform the uninstall operation for the given modules.
 * Returns an UninstallResult describing what was done.
 */
export async function runUninstall(
  modules: ModuleName[] | Set<string>,
  ctx: UninstallContext,
): Promise<UninstallResult> {
  const result: UninstallResult = {
    deleted: [],
    stripped: [],
    preserved: [],
    decisions: [],
    dryRun: ctx.dryRun,
  };

  const moduleList =
    modules instanceof Set
      ? ([...modules].filter((m) =>
          // Include the opt-in add-ons (renovate/dependabot/cloud) too — a Set caller passing
          // them must not have them silently dropped (zero-footprint trap). (#255 P3)
          [
            "core",
            "claude",
            "cursor",
            "ci",
            "lint",
            "git-hooks",
            "opencode",
            "renovate",
            "dependabot",
            "cloud",
          ].includes(m),
        ) as ModuleName[])
      : (modules as ModuleName[]);

  // Nuke confirmation
  if (ctx.nuke && !ctx.yes && !ctx.dryRun) {
    const confirmed = await confirmNuke();
    if (!confirmed) {
      console.log(`${ctx.logPrefix} --nuke cancelled.`);
      return result;
    }
  }

  const table = buildDecisionTable(moduleList, ctx);
  result.decisions = table;

  if (ctx.dryRun) {
    console.log(`${ctx.logPrefix} [dry-run] Decision table:`);
    console.log(formatDecisionTable(table));
  }

  // Read tier3Hashes for actual deletions
  const versionFilePath = path.join(ctx.cwd, ".bkit", "version");
  const bkitVer = readBkitVersion(versionFilePath);
  const tier3Hashes = bkitVer?.tier3Hashes ?? {};

  const seen = new Set<string>();

  for (const summary of table) {
    if (seen.has(summary.file)) continue;
    seen.add(summary.file);

    const absPath = path.join(ctx.cwd, summary.file);

    switch (summary.decision) {
      case "skip-absent":
      case "skip-tier3-modified":
      case "skip-tier3-unknown":
      case "preserve": {
        result.preserved.push(summary.file);
        if (!ctx.dryRun) {
          console.log(`${ctx.logPrefix} preserve: ${summary.file} (${summary.reason})`);
        }
        break;
      }

      case "delete": {
        result.deleted.push(summary.file);
        if (!ctx.dryRun) {
          try {
            fs.rmSync(absPath, { force: true });
            console.log(`${ctx.logPrefix} delete: ${summary.file}`);
          } catch (err) {
            console.error(
              `${ctx.logPrefix} error deleting ${summary.file}: ${(err as Error).message}`,
            );
          }
        }
        break;
      }

      case "strip-block": {
        if (!ctx.dryRun) {
          try {
            if (summary.format === "json") {
              // JSON deep-containment: strip bkit-owned scope, preserve consumer keys
              const templatePath = path.join(getTemplatesRoot(), summary.file);
              if (!fs.existsSync(templatePath)) {
                // No template — preserve as-is
                console.warn(`${ctx.logPrefix} no template found for ${summary.file} — preserving`);
                result.preserved.push(summary.file);
                break;
              }
              const raw = fs.readFileSync(absPath, "utf-8");
              const consumerDoc = JSON.parse(raw) as Record<string, JsonValue>;
              let templateRaw = fs.readFileSync(templatePath, "utf-8");
              // opencode.json ships `@@OPENCODE_*@@` sentinel KEYS that render to the consumer's
              // tracker / provider at install; strip-scope keyed on the RAW template never matches
              // the rendered keys, so bkit's mcp + provider blocks (a token-referencing config)
              // survive a full uninstall. Render the template with the consumer's OWN tracker +
              // provider first so the keys line up and the bkit-owned scope strips cleanly.
              if (templateRaw.includes("@@OPENCODE_TRACKER_MCP@@")) {
                templateRaw = renderOpencodeJson(
                  templatePath,
                  detectOpencodeTracker(consumerDoc),
                  detectOpencodeProvider(consumerDoc),
                );
              }
              const templateDoc = JSON.parse(templateRaw) as Record<string, JsonValue>;
              const stripped = stripTier2JsonScope(consumerDoc, templateDoc);
              const strippedJson = JSON.stringify(stripped, null, 2) + "\n";
              if (Object.keys(stripped).length === 0) {
                // All keys were bkit-owned → delete file
                fs.rmSync(absPath, { force: true });
                result.deleted.push(summary.file);
                console.log(
                  `${ctx.logPrefix} delete (empty after JSON scope strip): ${summary.file}`,
                );
              } else {
                fs.writeFileSync(absPath, strippedJson, "utf-8");
                result.stripped.push(summary.file);
                console.log(`${ctx.logPrefix} strip-json-scope: ${summary.file}`);
              }
            } else {
              // markered-text: strip bkit marker block, preserve consumer content
              const content = fs.readFileSync(absPath, "utf-8");
              const style = detectMarkerStyle(content) ?? "html-comment";
              const stripped = stripManagedBlock(content, style);
              // A bkit-seeded markdown file (AGENTS.md, CLAUDE.md) keeps its `# Title` H1
              // OUTSIDE the bkit block, so a plain strip leaves a content-free husk like
              // `# AGENTS.md\n` rather than deleting the file. Treat a markdown file reduced to
              // a lone ATX heading (its only non-blank line) as a husk and delete it. Scoped to
              // .md/.mdc so shell/gitignore residue (a lone `# comment`) is never affected, and a
              // multi-line residual (e.g. prompts.md's consumer `## Model Overrides`) is preserved.
              // (#255 P2-15)
              const nonBlank = stripped.split("\n").filter((l) => l.trim().length > 0);
              const isMarkdown = /\.mdc?$/.test(summary.file);
              const isLoneHeadingHusk =
                isMarkdown && nonBlank.length === 1 && /^#{1,6}\s+\S/.test(nonBlank[0].trim());
              // A file whose post-strip residual equals the bkit-seeded scaffold OUTSIDE the block
              // (i.e. the template stripped the same way) carries NO genuine consumer content — it is
              // 100% bkit-authored (hook shells left with only a shebang/header, a `.mdc` frontmatter
              // shell, a pristine prompts.md). Delete it rather than leave a dead husk (zero-footprint).
              // A consumer who added content outside the block strips UNEQUAL → preserved. Read is
              // covered by the enclosing try/catch — no separate error-obscuring catch.
              const normResidual = (s: string): string =>
                s
                  .split("\n")
                  .map((l) => l.replace(/[ \t]+$/, ""))
                  .join("\n")
                  .trim();
              let isBkitOnlyScaffold = false;
              const markeredTemplatePath = path.join(getTemplatesRoot(), summary.file);
              if (fs.existsSync(markeredTemplatePath)) {
                const templateContent = fs.readFileSync(markeredTemplatePath, "utf-8");
                const templateStripped = stripManagedBlock(
                  templateContent,
                  detectMarkerStyle(templateContent) ?? style,
                );
                isBkitOnlyScaffold = normResidual(stripped) === normResidual(templateStripped);
              }
              if (stripped.trim().length === 0 || isLoneHeadingHusk || isBkitOnlyScaffold) {
                // File is now empty (or a bkit-seeded heading husk) → delete it
                fs.rmSync(absPath, { force: true });
                result.deleted.push(summary.file);
                console.log(`${ctx.logPrefix} delete (empty after strip): ${summary.file}`);
              } else {
                fs.writeFileSync(absPath, stripped, "utf-8");
                result.stripped.push(summary.file);
                console.log(`${ctx.logPrefix} strip-block: ${summary.file}`);
              }
            }
          } catch (err) {
            console.error(
              `${ctx.logPrefix} error stripping block from ${summary.file}: ${(err as Error).message}`,
            );
          }
        } else {
          result.stripped.push(summary.file);
        }
        break;
      }
    }
  }

  // Package.json managed key stripping
  if (ctx.stripPackage && !ctx.dryRun) {
    try {
      const originalCwd = process.cwd();
      process.chdir(ctx.cwd);
      const pkgResult = stripManagedKeys(moduleList, false);
      process.chdir(originalCwd);
      if (pkgResult.removedScripts.length > 0) {
        console.log(
          `${ctx.logPrefix} package.json: removed scripts [${pkgResult.removedScripts.join(", ")}]`,
        );
      }
      if (pkgResult.removedDevDeps.length > 0) {
        console.log(
          `${ctx.logPrefix} package.json: removed devDependencies [${pkgResult.removedDevDeps.join(", ")}]`,
        );
      }
    } catch (err) {
      console.error(
        `${ctx.logPrefix} error stripping package.json keys: ${(err as Error).message}`,
      );
    }
  }

  // Full/core uninstall: strip the `bkit` install-state object from package.json
  // (issueTracker / opencodeProvider(s) / depUpdater / cloudAgents / runners). Scripts
  // and devDeps still need `--package`; this clears the preference/manifest block so an
  // "uninstalled" repo does not keep advertising prior bkit choices. No try/catch — malformed
  // package.json is a hard failure on full teardown (same as a missing dest would be).
  if (moduleList.includes("core") && !ctx.dryRun) {
    const pkgPath = path.join(ctx.cwd, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
      if (pkg.bkit !== undefined) {
        delete pkg.bkit;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
        console.log(`${ctx.logPrefix} package.json: removed bkit install-state block`);
        result.stripped.push("package.json#bkit");
      }
    }
  }

  // Clean up .agents/ bkit-prefix mirror files
  // (.claude/commands/bkit-*.md, .claude/agents/bkit-*.md, .opencode/agents/bkit-*.md, etc.)
  if (!ctx.dryRun) {
    const mirrorDirs = [
      // Each host's mirror dirs are gated on its own module so a targeted
      // uninstall (e.g. --tooling / --dependency / --auto) leaves other hosts
      // untouched — symmetric with install. A bare/full uninstall populates
      // moduleList with every host, so all mirrors are still swept then.
      ...(moduleList.includes("claude") ? [".claude/commands", ".claude/agents"] : []),
      ...(moduleList.includes("cursor") ? [".cursor/commands", ".cursor/agents"] : []),
      // opencode mirrors (plural dir names per opencode.ai/docs)
      ...(moduleList.includes("opencode") ? [".opencode/agents", ".opencode/commands"] : []),
    ];
    for (const dir of mirrorDirs) {
      const absDir = path.join(ctx.cwd, dir);
      if (!fs.existsSync(absDir)) continue;
      try {
        for (const f of fs.readdirSync(absDir)) {
          if (!f.startsWith("bkit-") || !f.endsWith(".md")) continue;
          const absFile = path.join(absDir, f);
          fs.rmSync(absFile, { force: true });
          result.deleted.push(path.join(dir, f));
          console.log(`${ctx.logPrefix} delete mirror: ${path.join(dir, f)}`);
        }
      } catch (err) {
        console.error(`${ctx.logPrefix} error cleaning up ${dir}: ${(err as Error).message}`);
      }
    }
  }

  // Remove the generated `.claude/cloud.md` (untracked, gitignored — holds resolved
  // secrets). It is not in the manifest, so the table-driven pass never sees it;
  // delete it explicitly when the claude host is uninstalled so a live-secrets file
  // is never left behind. Pushed to result.deleted so a dry-run reports it too.
  if (moduleList.includes("claude")) {
    const cloudAbs = path.join(ctx.cwd, CLAUDE_CLOUD_RELPATH);
    if (fs.existsSync(cloudAbs)) {
      result.deleted.push(CLAUDE_CLOUD_RELPATH);
      if (!ctx.dryRun) {
        fs.rmSync(cloudAbs, { force: true });
        console.log(`${ctx.logPrefix} delete: ${CLAUDE_CLOUD_RELPATH} (generated cloud setup doc)`);
      }
    }
  }

  // Same for the Cursor twin `.cursor/cloud.md` (writeCursorCloudDoc) — untracked,
  // gitignored, holds resolved secrets; delete it explicitly when the cursor host is
  // uninstalled so a live-secrets file is never left behind.
  if (moduleList.includes("cursor")) {
    const cloudAbs = path.join(ctx.cwd, CURSOR_CLOUD_RELPATH);
    if (fs.existsSync(cloudAbs)) {
      result.deleted.push(CURSOR_CLOUD_RELPATH);
      if (!ctx.dryRun) {
        fs.rmSync(cloudAbs, { force: true });
        console.log(`${ctx.logPrefix} delete: ${CURSOR_CLOUD_RELPATH} (generated cloud setup doc)`);
      }
    }
  }

  // Clean up bkit-owned scripts under .bkit/scripts/ (every shipped script is `bkit-*` and
  // fully bkit-owned). They install via the core templates pass, not the manifest, so the
  // table never sees them — glob rather than hardcode names so new scripts are covered. A
  // full/core uninstall only, symmetric with how the core templates pass installs them.
  if (moduleList.includes("core")) {
    const scriptsDir = path.join(ctx.cwd, ".bkit", "scripts");
    if (fs.existsSync(scriptsDir)) {
      for (const f of fs.readdirSync(scriptsDir)) {
        if (!f.startsWith("bkit-")) continue;
        const rel = path.join(".bkit", "scripts", f);
        result.deleted.push(rel);
        if (!ctx.dryRun) {
          fs.rmSync(path.join(scriptsDir, f), { force: true });
          console.log(`${ctx.logPrefix} delete: ${rel}`);
        }
      }
    }
  }

  // Prune bkit-authored dirs left empty by the deletions above (e.g. .claude/agents,
  // .github/workflows, .husky, .vale/styles/House, .bkit/scripts). Candidates are the parent
  // dirs of everything deleted, plus their ancestors; each is removed ONLY when it is actually
  // empty (never touches a dir still holding consumer files), deepest-first so the removal
  // cascades up. Skipped in dry-run — nothing was deleted, so nothing is empty to report.
  if (!ctx.dryRun) {
    const dirCandidates = new Set<string>();
    for (const rel of result.deleted) {
      let dir = path.dirname(rel);
      while (dir && dir !== "." && dir !== path.sep) {
        dirCandidates.add(dir);
        dir = path.dirname(dir);
      }
    }
    const byDepthDesc = [...dirCandidates].sort(
      (a, b) => b.split(path.sep).length - a.split(path.sep).length,
    );
    for (const rel of byDepthDesc) {
      const absDir = path.join(ctx.cwd, rel);
      // rmdirSync removes ONLY an empty dir (throws on non-empty) — the emptiness check
      // above makes it a no-op on any dir still holding consumer files. Single-threaded, so
      // the check and the remove cannot race.
      if (fs.existsSync(absDir) && fs.readdirSync(absDir).length === 0) {
        fs.rmdirSync(absDir);
        console.log(`${ctx.logPrefix} prune empty dir: ${rel}`);
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// runSurgicalOpencodeUninstall — remove exactly ONE provider block (#281 Task 4)
// ---------------------------------------------------------------------------

/**
 * Surgical removal of a single opencode provider installed by bkit.
 *
 * Distinct from bare `bkit uninstall --opencode` (full host teardown):
 *   - Removes the provider block from `.opencode/opencode.json`
 *   - Updates `bkit.opencodeProviders` in `package.json`
 *   - If the removed provider was the active one, re-points `bkit.opencodeProvider`
 *     to the first remaining provider and emits a re-render advisory
 *   - If no providers remain, falls through to full host teardown via `runUninstall`
 */
export async function runSurgicalOpencodeUninstall(
  providerKey: string,
  dryRun: boolean,
  cwd: string,
): Promise<void> {
  const LOG_PREFIX = "[bkit-uninstall]";
  const tag = dryRun ? " (dry-run)" : "";
  const jsonDst = path.join(cwd, ".opencode", "opencode.json");
  const ws: WriteSet = { writes: [] };

  // 1. Remove provider block from opencode.json
  removeOpencodeProviderBlock(jsonDst, providerKey, dryRun, ws);
  if (ws.writes.length > 0) {
    console.log(`${LOG_PREFIX}${tag} removed provider block "${providerKey}" from opencode.json`);
  }

  // 2. Update bkit.opencodeProviders in package.json (read inline — no detectOpencodeProviders import)
  const pkgPath = path.join(cwd, "package.json");
  let remainingProviders: string[] = [];
  let wasActive = false;
  let newActive: string | null = null;

  if (fs.existsSync(pkgPath)) {
    const raw = fs.readFileSync(pkgPath, "utf-8");
    // Parse-or-sentinel idiom: keep the early-return outside the catch body.
    let pkg: Record<string, unknown> | null = null;
    try {
      pkg = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      pkg = null;
    }
    if (pkg === null) {
      console.warn(`${LOG_PREFIX} package.json is malformed — skipping bkit section update`);
      return;
    }
    const bkit = (pkg.bkit ?? {}) as Record<string, unknown>;
    const arr = Array.isArray(bkit.opencodeProviders)
      ? [...(bkit.opencodeProviders as string[])]
      : [];
    remainingProviders = arr.filter((p) => p !== providerKey);
    wasActive = bkit.opencodeProvider === providerKey;
    if (wasActive && remainingProviders.length > 0) {
      newActive = remainingProviders[0]!;
    }

    if (!dryRun) {
      bkit.opencodeProviders = remainingProviders;
      if (wasActive) {
        if (newActive !== null) {
          bkit.opencodeProvider = newActive;
        } else {
          delete bkit.opencodeProvider;
        }
      }
      pkg.bkit = bkit;
      const indentMatch = raw.match(/\n([ \t]+)"/);
      const indent = indentMatch ? indentMatch[1] : "  ";
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + "\n", "utf-8");
      console.log(
        `${LOG_PREFIX} updated package.json: opencodeProviders=[${remainingProviders.join(", ")}]` +
          (wasActive ? ` opencodeProvider=${newActive ?? "(removed)"}` : ""),
      );
    }
  }

  // 3. If none remain → full host teardown
  if (remainingProviders.length === 0) {
    console.log(
      `${LOG_PREFIX}${tag} no providers remain — triggering full opencode host teardown...`,
    );
    await runUninstall(["opencode"], {
      cwd,
      dryRun,
      force: false,
      nuke: false,
      yes: false,
      stripPackage: false,
      logPrefix: LOG_PREFIX,
    });
    return;
  }

  // 4. If was active → emit advisory (re-rendering agents requires full ModuleContext)
  if (wasActive && newActive !== null) {
    console.log(
      `${LOG_PREFIX}${tag} active provider switched to "${newActive}". ` +
        `Run \`bkit install --opencode=${newActive}\` or \`bkit upgrade\` to re-render agent frontmatter.`,
    );
  }
}
