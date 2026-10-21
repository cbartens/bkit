// commands/install/uninstall.ts — Single owner of all uninstall logic. (P2.T5-P2.T8)
//
// runUninstall(modules, ctx) orchestrates:
//   1. For each installed file — single dispatch on entry.format:
//      - "json"            : stripTier2JsonScope (strip bkit-owned JSON scope)
//      - "markered-text"   : stripManagedBlock, remove file if empty remainder
//      - "byte-equal-text" : delete only if unchanged since bkit wrote it (canonicalHashes)
//   2. package.json: the `bkit` install-state block (full/core uninstall). Scripts and
//      devDeps are the consumer's — the bkit:gate:* names included — and are left alone.
//   2b. docs/ (full/core uninstall): bkit's managed block stripped from every installed
//      `docs/*.md`, the owned `docs/templates/bkit-*.md` deleted.
//   3. .agents/ mirror files (bkit-prefix .md files in .claude/ .cursor/)
//
// Flags:
//   --dry-run       print decision table (FILE / DECISION / REASON) without writes
//   --force         override the byte-equal-text hash guard (delete even if consumer modified)
//   --nuke          confirm prompt then wipe ALL bkit-managed files regardless of format
//   --yes           skip interactive confirm for --nuke
//
// Observability: console.error("[bkit-uninstall] …") for all error paths.

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { isJsonObject, type JsonValue, type WriteSet } from "../../install/write.js";
import { stripManagedBlock, detectMarkerStyle } from "../../install/managed-block.js";
import { readTemplate } from "../../render/parts.js";
import {
  getInstallManifest,
  type ManifestEntry,
  type ModuleName,
  type IssueTracker,
  ISSUE_TRACKERS,
} from "../../install/manifest.js";
import { OPENCODE_PROVIDERS } from "../../shared/egress.js";
import { parseJson } from "../../shared/json.js";
import {
  hashFile,
  isConsumerModified,
  mergeCanonicalHashes,
  readBkitVersion,
  writeBkitVersion,
} from "../../install/version-file.js";
import {
  getBkitDocsRoot,
  getPkgRoot,
  getSharedRoot,
  findTemplateSource,
  TEMPLATE_COPIES_DIR,
} from "../../shared/package-roots.js";
import { PAYLOAD_LINKS } from "../../install/payload-links.js";
import {
  removeOpencodeProviderBlock,
  renderOpencodeAgentsCommands,
  renderOpencodeJson,
} from "../../install/modules/opencode.js";
import {
  applyModelOverrides,
  buildOpencodeModelLookup,
  parseEffortMap,
} from "../../render/models.js";
import { readInstallingVersion } from "../../shared/package-json.js";
import { readBkitConfig } from "../../shared/settings.js";
import {
  CLAUDE_CLOUD_RELPATH,
  CURSOR_CLOUD_RELPATH,
  resolveClaudeDerivedAllows,
} from "../../install/cloud-env.js";
import type { ModuleFlag, UninstallFlags } from "../../cli.js";
import { LOG_PREFIX, setLogPrefix } from "../../shared/log-prefix.js";
import { type McpServerMapKey, unusedTrackerMcpServers } from "../../checks/before/mcp.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UninstallContext {
  /** Consumer repo root (defaults to process.cwd()). */
  cwd: string;
  /** Dry-run: compute decisions but do NOT write to disk. */
  dryRun: boolean;
  /**
   * Force-delete byte-equal-text files even if their hash differs (consumer modified).
   * Default: false (preserve consumer modifications).
   */
  force: boolean;
  /**
   * Nuke mode: remove ALL bkit-managed files regardless of format or
   * consumer modifications. Requires --yes or interactive confirm.
   * Default: false.
   */
  nuke: boolean;
  /**
   * Skip interactive confirm for --nuke. Useful in non-interactive scripts.
   */
  yes: boolean;
  /** Log prefix for console output. */
  logPrefix: string;
}

/** Decision taken for each file during uninstall. */
export type FileDecision =
  "delete" | "strip-block" | "preserve" | "skip-absent" | "skip-modified" | "skip-unknown";

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
  /** Manifest-listed files already missing on disk (`skip-absent`) — nothing done. */
  absent: string[];
  decisions: FileSummary[];
  dryRun: boolean;
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
 * Strip bkit's scope from `.opencode/opencode.json`. The template ships `@@OPENCODE_*@@`
 * sentinel KEYS that render to the consumer's tracker and provider, and install keeps every
 * earlier provider block and tracker entry (install is additive), so one file can hold several.
 * Render the template once per known tracker and once per supported provider, then remove each
 * `mcp` entry and `provider` block identical to a rendered one; an entry the consumer added or
 * edited stays whole. The rest of the template (permission sandbox, plugin list) strips leaf by
 * leaf like any Tier-2 JSON file. Reads only the template.
 */
export function stripOpencodeJsonScope(
  consumer: Record<string, JsonValue>,
  templatePath: string,
  cwd: string,
): Record<string, JsonValue> {
  const render = (tracker: IssueTracker, provider: string): Record<string, JsonValue> =>
    renderOpencodeDoc(templatePath, tracker, provider, cwd);
  const ownedMcp = ownedOpencodeMcpEntries(templatePath, cwd);
  const ownedProviders: Record<string, JsonValue> = {};
  for (const provider of OPENCODE_PROVIDERS) {
    const rendered = render("none", provider).provider;
    if (isJsonObject(rendered)) Object.assign(ownedProviders, rendered);
  }
  const rest = render("none", OPENCODE_PROVIDERS[0]);
  delete rest.mcp;
  delete rest.provider;

  const out = JSON.parse(JSON.stringify(consumer)) as Record<string, JsonValue>;
  removeOwnedEntries(out, "mcp", ownedMcp);
  removeOwnedEntries(out, "provider", ownedProviders);
  return stripTier2JsonScope(out, rest);
}

function renderOpencodeDoc(
  templatePath: string,
  tracker: IssueTracker,
  provider: string,
  cwd: string,
): Record<string, JsonValue> {
  return JSON.parse(renderOpencodeJson(templatePath, tracker, provider, cwd)) as Record<
    string,
    JsonValue
  >;
}

/** Every tracker's `mcp` entry exactly as bkit renders it into `.opencode/opencode.json`. */
function ownedOpencodeMcpEntries(templatePath: string, cwd: string): Record<string, JsonValue> {
  const owned: Record<string, JsonValue> = {};
  for (const tracker of ISSUE_TRACKERS) {
    const { mcp } = renderOpencodeDoc(templatePath, tracker, OPENCODE_PROVIDERS[0], cwd);
    if (isJsonObject(mcp)) Object.assign(owned, mcp);
  }
  return owned;
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
    } else if (Array.isArray(tVal) && Array.isArray(cVal)) {
      // Both arrays — strip ELEMENT-WISE, not whole-array: install enriches some lists
      // after rendering the template (apex-domain `WebFetch` entries in
      // `.claude/settings.json` `permissions.allow`).
      const tSerialised = new Set(tVal.map((el) => JSON.stringify(el)));
      const kept = cVal.filter((el) => !tSerialised.has(JSON.stringify(el)));
      if (kept.length === 0) {
        delete consumer[key];
      } else {
        consumer[key] = kept as JsonValue;
      }
    } else {
      // Leaf (primitive, null) — remove if deep-equal to template
      if (JSON.stringify(cVal) === JSON.stringify(tVal)) {
        delete consumer[key];
      }
      // else: consumer has a different value — preserve it
    }
  }
}

// `.mcp.json` / `.cursor/mcp.json`: bkit owns only its tracker entry under `mcpServers`
// (reconcileMcpJson), so uninstall removes exactly that, never a leaf-by-leaf strip.
const MCP_JSON_RELPATHS = new Set([".mcp.json", path.join(".cursor", "mcp.json")]);

/**
 * Remove each `mcpServers` entry that is identical to a tracker entry in the template — the
 * entry bkit wrote. A consumer's own servers, and a bkit entry the consumer edited, stay. Drops
 * `mcpServers` once empty, so a file bkit wrote alone strips to `{}` (deleted by the caller).
 * Pure function — no file I/O.
 */
export function stripMcpTrackerEntries(
  consumer: Record<string, JsonValue>,
  template: Record<string, JsonValue>,
): Record<string, JsonValue> {
  const out = JSON.parse(JSON.stringify(consumer)) as Record<string, JsonValue>;
  const owned = template.mcpServers;
  if (isJsonObject(owned)) removeOwnedEntries(out, "mcpServers", owned);
  return out;
}

/**
 * Delete each entry of `doc[key]` identical to the same-named entry in `owned`, then drop
 * `doc[key]` once empty (unless `dropEmpty` is false). Entries that differ, and names `owned`
 * lacks, stay. Mutates `doc`; returns the names deleted.
 */
function removeOwnedEntries(
  doc: Record<string, JsonValue>,
  key: string,
  owned: Record<string, JsonValue>,
  dropEmpty = true,
): string[] {
  const entries = doc[key];
  if (!isJsonObject(entries)) return [];
  const removed: string[] = [];
  for (const [name, entry] of Object.entries(owned)) {
    if (name in entries && JSON.stringify(entries[name]) === JSON.stringify(entry)) {
      delete entries[name];
      removed.push(name);
    }
  }
  if (dropEmpty && Object.keys(entries).length === 0) delete doc[key];
  return removed;
}

/** The files bkit writes a tracker MCP entry into, and the key of each one's server map. */
const TRACKER_MCP_FILES: ReadonlyArray<{ relPath: string; mapKey: McpServerMapKey }> = [
  { relPath: ".mcp.json", mapKey: "mcpServers" },
  { relPath: path.join(".cursor", "mcp.json"), mapKey: "mcpServers" },
  { relPath: path.join(".opencode", "opencode.json"), mapKey: "mcp" },
];

/**
 * Tracker switch: remove each `unusedTrackerMcpServers(tracker)` entry from `.mcp.json`,
 * `.cursor/mcp.json` and `.opencode/opencode.json` while it still equals bkit's template entry
 * — the rule uninstall applies (`removeOwnedEntries`). An entry the consumer edited stays and
 * is named in a warning. `.mcp.json` / `.cursor/mcp.json` keep an emptied `mcpServers` (the
 * tracker-`none` render); `.opencode/opencode.json` drops an emptied `mcp`, as its render does.
 * Absent and malformed files are skipped (the host module reports malformed JSON). Pushes each
 * rewritten file onto `ws` and returns its path.
 */
export function removeUnusedTrackerMcpEntries(
  cwd: string,
  tracker: IssueTracker,
  dryRun: boolean,
  ws: WriteSet,
  logPrefix: string,
): string[] {
  const unused = unusedTrackerMcpServers(tracker);
  const written: string[] = [];
  for (const { relPath, mapKey } of TRACKER_MCP_FILES) {
    const absPath = path.join(cwd, relPath);
    const templatePath = findTemplateSource(relPath);
    if (unused.length === 0 || templatePath === null || !fs.existsSync(absPath)) continue;
    const parsed = parseJson(fs.readFileSync(absPath, "utf-8"));
    const doc = parsed.ok ? (parsed.value as JsonValue) : null;
    if (!isJsonObject(doc)) continue;
    const servers = doc[mapKey];
    if (!isJsonObject(servers)) continue;

    let templateEntries: JsonValue | undefined;
    if (mapKey === "mcp") {
      templateEntries = ownedOpencodeMcpEntries(templatePath, cwd);
    } else {
      const template = parseJson(fs.readFileSync(templatePath, "utf-8"));
      const templateDoc = template.ok ? (template.value as JsonValue) : null;
      templateEntries = isJsonObject(templateDoc) ? templateDoc[mapKey] : undefined;
    }
    if (!isJsonObject(templateEntries)) continue;
    const owned: Record<string, JsonValue> = {};
    for (const name of unused) {
      if (name in servers && name in templateEntries) owned[name] = templateEntries[name];
    }

    const removed = removeOwnedEntries(doc, mapKey, owned, mapKey === "mcp");
    for (const name of Object.keys(owned).filter((n) => !removed.includes(n))) {
      console.warn(
        `${logPrefix} kept ${relPath} ${mapKey}.${name}: edited since bkit wrote it, and the ` +
          `${tracker} tracker does not use it — remove it by hand if unneeded.`,
      );
    }
    if (removed.length === 0) continue;
    if (!dryRun) fs.writeFileSync(absPath, JSON.stringify(doc, null, 2) + "\n", "utf-8");
    ws.writes.push({ path: absPath, action: "update" });
    written.push(absPath);
    for (const name of removed) {
      console.log(
        `${logPrefix} ${dryRun ? "[dry-run] " : ""}removed ${relPath} ${mapKey}.${name} ` +
          `(the ${tracker} tracker does not use it)`,
      );
    }
  }
  return written;
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
// rules/docs. Each carries a bkit managed block (markered-text), so strip-block preserves any
// consumer content added below `bkit:end`, exactly like the root AGENTS.md. Removed only on a
// full/core uninstall (gated on core in moduleList below).
const CORE_TEMPLATE_DOCTRINE: ManifestEntry[] = [
  { path: ".agents/context.md", format: "markered-text", module: "core" },
  { path: ".agents/docs.md", format: "markered-text", module: "core" },
  { path: ".agents/rules.md", format: "markered-text", module: "core" },
  { path: ".agents/skills.md", format: "markered-text", module: "core" },
  // Retired path of `.bkit/lite.md` (5.1.0 – 5.2.4), for an install never upgraded since.
  { path: ".agents/shortcuts.md", format: "markered-text", module: "core" },
];

/**
 * The top-level `docs/*.md` the core payload pass installs: each carries bkit's managed
 * block (`bkit:start` / `bkit:end`, managed marker inside), so uninstall strips the block
 * and keeps the consumer's content, exactly like `.agents/*.md`. The payload's
 * `shared/docs/` holds only these block docs; `docs/capabilities.md` is a template
 * (copied, never installed) and is left alone.
 */
function coreDocEntries(): ManifestEntry[] {
  const dir = path.join(getSharedRoot(), "docs");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e): ManifestEntry => ({
      path: path.join("docs", e.name),
      format: "markered-text",
      module: "core",
    }));
}

/** Prefix of the bkit-owned files under `docs/templates/`; uninstall deletes them whole. */
const DOCS_TEMPLATES_DIR = path.join("docs", "templates");
const isOwnedDocsTemplate = (name: string) => name.startsWith("bkit-") && name.endsWith(".md");

export function buildDecisionTable(
  modules: ModuleName[] | Set<string>,
  ctx: Pick<UninstallContext, "cwd" | "force" | "nuke">,
): FileSummary[] {
  const moduleList =
    modules instanceof Set
      ? ([...modules].filter((m) =>
          // Includes the opt-in add-ons (cloud) a Set caller passes.
          ["core", "claude", "cursor", "opencode", "codex", "antigravity", "cloud"].includes(m),
        ) as ModuleName[])
      : (modules as ModuleName[]);

  const entries = [
    ...getInstallManifest(moduleList),
    ...(moduleList.includes("core") ? [...CORE_TEMPLATE_DOCTRINE, ...coreDocEntries()] : []),
  ];

  // The hash of every owned file as bkit last wrote it.
  const versionFilePath = path.join(ctx.cwd, ".bkit", "version");
  const canonicalHashes = readBkitVersion(versionFilePath)?.canonicalHashes ?? {};

  const table: FileSummary[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const absPath = path.join(ctx.cwd, entry.path);
    const key = entry.path;
    if (seen.has(key)) continue; // deduplicate (a path listed by more than one module)
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
        // .bkit/version is bkit's own install-state manifest (pinnedVersion + hashes), never
        // consumer content. It records no hash for itself, so the generic hash-guard preserves it
        // as "consumer-modified" — leaving bkit state behind after a full teardown. It is
        // `module: core`, so it only reaches this table on a full/core uninstall; delete it there
        // (zero-footprint). A targeted (non-core) uninstall never sees it, so the modules that
        // remain keep working. The hashes are read into memory before the delete loop, so
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
        if (canonicalHashes[entry.path] === undefined) {
          table.push({
            file: entry.path,
            decision: "skip-unknown",
            reason:
              "byte-equal-text: no recorded install-time hash — preserve (consumer may have modified it)",
            format: "byte-equal-text",
          });
        } else if (!isConsumerModified(entry.path, absPath, canonicalHashes)) {
          table.push({
            file: entry.path,
            decision: "delete",
            reason: "byte-equal-text: content matches install-time hash — safe to delete",
            format: "byte-equal-text",
          });
        } else {
          table.push({
            file: entry.path,
            decision: "skip-modified",
            reason:
              "byte-equal-text: content differs from install-time hash — consumer modified, preserve",
            format: "byte-equal-text",
          });
        }
        break;
      }
    }
  }

  // `docs/templates/bkit-*.md` are bkit-owned whole (the audit templates and the plan
  // template); the consumer's own files in that folder stay. Full/core uninstall only.
  const templatesDir = path.join(ctx.cwd, DOCS_TEMPLATES_DIR);
  if (moduleList.includes("core") && fs.existsSync(templatesDir)) {
    for (const name of fs.readdirSync(templatesDir).sort()) {
      const rel = path.join(DOCS_TEMPLATES_DIR, name);
      if (!isOwnedDocsTemplate(name) || seen.has(rel)) continue;
      if (!fs.statSync(path.join(ctx.cwd, rel)).isFile()) continue;
      seen.add(rel);
      table.push({
        file: rel,
        decision: "delete",
        reason: "bkit-owned docs template — removed on full/core uninstall",
        format: "markered-text",
      });
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
    absent: [],
    decisions: [],
    dryRun: ctx.dryRun,
  };

  const moduleList =
    modules instanceof Set
      ? ([...modules].filter((m) =>
          // Includes the opt-in add-ons (cloud) a Set caller passes.
          ["core", "claude", "cursor", "opencode", "codex", "antigravity", "cloud"].includes(m),
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

  const seen = new Set<string>();

  for (const summary of table) {
    if (seen.has(summary.file)) continue;
    seen.add(summary.file);

    const absPath = path.join(ctx.cwd, summary.file);

    switch (summary.decision) {
      case "skip-absent": {
        result.absent.push(summary.file);
        if (!ctx.dryRun) {
          console.log(`${ctx.logPrefix} absent: ${summary.file} (${summary.reason})`);
        }
        break;
      }

      case "skip-modified":
      case "skip-unknown":
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
              const templatePath = findTemplateSource(summary.file);
              if (templatePath === null || !fs.existsSync(templatePath)) {
                // No payload source — preserve as-is
                console.warn(`${ctx.logPrefix} no template found for ${summary.file} — preserving`);
                result.preserved.push(summary.file);
                break;
              }
              const raw = fs.readFileSync(absPath, "utf-8");
              const consumerParsed = parseJson(raw);
              if (!consumerParsed.ok) throw new Error(`${summary.file} is not valid JSON`);
              const consumerDoc = consumerParsed.value as Record<string, JsonValue>;
              const templateRaw = fs.readFileSync(templatePath, "utf-8");
              // opencode.json ships `@@OPENCODE_*@@` sentinel KEYS; stripOpencodeJsonScope
              // renders them for every tracker and provider bkit can have written.
              const isOpencodeJson = templateRaw.includes("@@OPENCODE_TRACKER_MCP@@");
              const templateParsed = parseJson(templateRaw);
              if (!templateParsed.ok) throw new Error(`${templatePath} is not valid JSON`);
              const templateDoc = templateParsed.value as Record<string, JsonValue>;
              // `.claude/settings.json` is not written verbatim: after rendering the
              // template, install appends one `WebFetch(domain:<d>)` grant per entry in
              // the resolved network allowlist and `mcp__…` grants per declared MCP
              // server (enrichClaudeSettingsAllows). Stripping
              // against the RAW template leaves those grants behind as if the consumer
              // had added them. Recompute the same set — the very function that produced
              // them — and treat it as part of the template, exactly as the opencode.json
              // sentinel render above does.
              if (summary.file === path.join(".claude", "settings.json")) {
                const perms = templateDoc.permissions;
                if (perms !== null && typeof perms === "object" && !Array.isArray(perms)) {
                  const permsObj = perms as Record<string, JsonValue>;
                  const allow = permsObj.allow;
                  if (Array.isArray(allow)) {
                    const enriched = resolveClaudeDerivedAllows(ctx.cwd);
                    permsObj.allow = [
                      ...allow,
                      ...enriched.filter((e) => !allow.includes(e)),
                    ] as JsonValue;
                  }
                }
              }
              const stripped = MCP_JSON_RELPATHS.has(summary.file)
                ? stripMcpTrackerEntries(consumerDoc, templateDoc)
                : isOpencodeJson
                  ? stripOpencodeJsonScope(consumerDoc, templatePath, ctx.cwd)
                  : stripTier2JsonScope(consumerDoc, templateDoc);
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
              // OUTSIDE the bkit block. A markdown file reduced to a lone ATX heading (its only
              // non-blank line) is a husk and is deleted. Scoped to .md/.mdc (shell/gitignore
              // residue such as a lone `# comment` is unaffected); a multi-line residual (e.g.
              // prompts.md's consumer `## Model Overrides`) is preserved.
              const nonBlank = stripped.split("\n").filter((l) => l.trim().length > 0);
              const isMarkdown = /\.mdc?$/.test(summary.file);
              const isLoneHeadingHusk =
                isMarkdown && nonBlank.length === 1 && /^#{1,6}\s+\S/.test(nonBlank[0].trim());
              // A file whose post-strip residual equals the bkit-seeded scaffold OUTSIDE the block
              // (i.e. the template stripped the same way) carries NO genuine consumer content — it is
              // 100% bkit-authored (hook shells left with only a shebang/header, a `.mdc` frontmatter
              // shell, a pristine prompts.md) and is deleted. A consumer who added content outside
              // the block strips UNEQUAL → preserved. Read is covered by the enclosing try/catch.
              const normResidual = (s: string): string =>
                s
                  .split("\n")
                  .map((l) => l.replace(/[ \t]+$/, ""))
                  .join("\n")
                  .trim();
              let isBkitOnlyScaffold = false;
              const markeredTemplatePath = findTemplateSource(summary.file);
              if (markeredTemplatePath !== null && fs.existsSync(markeredTemplatePath)) {
                const templateContent = readTemplate(markeredTemplatePath);
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

  // Full/core uninstall: strip the `bkit` install-state object from package.json
  // (issueTracker / opencodeProvider(s) / cloudAgents), whatever keys it holds. Scripts
  // and devDeps are the consumer's and stay. No try/catch — malformed package.json is a hard failure on full
  // teardown (same as a missing dest would be).
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

  // Targeted uninstall: drop the `bkit.*` keys the removed module records, so its advisories
  // stop firing. Core keeps every other key.
  if (!moduleList.includes("core")) {
    stripModuleBkitKeys(moduleList, ctx, result);
  }

  // Clean up .agents/ bkit-prefix mirror files
  // (.claude/commands/bkit-*.md, .claude/agents/bkit-*.md, .opencode/agents/bkit-*.md, etc.)
  // A dry run lists the same paths in result.deleted and removes nothing.
  {
    const mirrorDirs = [
      // Each host's mirror dirs are gated on its own module so a targeted
      // uninstall (e.g. --claude / --auto) leaves other hosts
      // untouched — symmetric with install. A bare/full uninstall populates
      // moduleList with every host, so all mirrors are still swept then.
      ...(moduleList.includes("claude") ? [".claude/commands", ".claude/agents"] : []),
      ...(moduleList.includes("cursor") ? [".cursor/commands", ".cursor/agents"] : []),
      // opencode mirrors (plural dir names per opencode.ai/docs)
      ...(moduleList.includes("opencode") ? [".opencode/agents", ".opencode/commands"] : []),
      // codex agent mirrors. The workflow skills under `.agents/skills/bkit-*` are swept
      // separately below: `.agents/skills/` is SHARED with third-party skills installed via
      // skills.sh, so the directory itself must never be removed wholesale.
      ...(moduleList.includes("codex") ? [".codex/agents"] : []),
      // antigravity plugin subagent mirrors (`.agents/plugins/bkit/agents/bkit-*.md`). The
      // plugin's workflow skills (`.agents/plugins/bkit/skills/bkit-*`) are swept below.
      ...(moduleList.includes("antigravity") ? [".agents/plugins/bkit/agents"] : []),
    ];
    for (const dir of mirrorDirs) {
      const absDir = path.join(ctx.cwd, dir);
      if (!fs.existsSync(absDir)) continue;
      try {
        for (const f of fs.readdirSync(absDir)) {
          // .toml as well as .md: codex agent mirrors are TOML.
          if (!f.startsWith("bkit-") || !(f.endsWith(".md") || f.endsWith(".toml"))) continue;
          const absFile = path.join(absDir, f);
          if (!ctx.dryRun) fs.rmSync(absFile, { force: true });
          result.deleted.push(path.join(dir, f));
          if (!ctx.dryRun) console.log(`${ctx.logPrefix} delete mirror: ${path.join(dir, f)}`);
        }
      } catch (err) {
        console.error(`${ctx.logPrefix} error cleaning up ${dir}: ${(err as Error).message}`);
      }
    }

    // Workflow skills. Codex's live at `.agents/skills/` (SHARED with third-party skills
    // installed via skills.sh, so only the bkit-prefixed DIRECTORIES are removed — never the
    // parent); Antigravity's live in its plugin at `.agents/plugins/bkit/skills/`. Sweep each
    // host's set independently.
    const skillDirs = [
      ...(moduleList.includes("codex") ? [path.join(".agents", "skills")] : []),
      ...(moduleList.includes("antigravity")
        ? [path.join(".agents", "plugins", "bkit", "skills")]
        : []),
    ];
    for (const skillsDir of skillDirs) {
      const absDir = path.join(ctx.cwd, skillsDir);
      if (!fs.existsSync(absDir)) continue;
      try {
        for (const d of fs.readdirSync(absDir)) {
          if (!d.startsWith("bkit-")) continue;
          const abs = path.join(absDir, d);
          if (!fs.statSync(abs).isDirectory()) continue;
          if (!ctx.dryRun) fs.rmSync(abs, { recursive: true, force: true });
          result.deleted.push(path.join(skillsDir, d));
          if (!ctx.dryRun) {
            console.log(`${ctx.logPrefix} delete mirror: ${path.join(skillsDir, d)}`);
          }
        }
      } catch (err) {
        const msg = (err as Error).message;
        console.error(`${ctx.logPrefix} error cleaning up ${skillsDir}: ${msg}`);
      }
    }
  }

  // Remove the generated `.claude/bkit-cloud.md` (untracked, gitignored — holds resolved
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

  // Same for the Cursor twin `.cursor/bkit-cloud.md` (writeCursorCloudDoc) — untracked,
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

  // Full/core uninstall: the consumer's template copies (`.bkit/templates/`) are
  // bkit's folder, refreshed whole on every install and upgrade, so they go whole.
  // Never in dogfood, where that folder is bkit's own template source. Adopted copies
  // elsewhere in the repo stay.
  if (moduleList.includes("core")) {
    const templatesDir = path.join(ctx.cwd, TEMPLATE_COPIES_DIR);
    if (path.resolve(ctx.cwd) !== getPkgRoot() && fs.existsSync(templatesDir)) {
      result.deleted.push(TEMPLATE_COPIES_DIR);
      if (!ctx.dryRun) {
        fs.rmSync(templatesDir, { recursive: true, force: true });
        console.log(`${ctx.logPrefix} delete: ${TEMPLATE_COPIES_DIR}/`);
      }
    }
  }

  // Full/core uninstall: the payload view links (`.bkit/core`, `.bkit/shared`) are
  // bkit-created symlinks into the package and go with it. Symlinks ONLY — a real
  // directory or file at that path is consumer content (install's no-clobber guard)
  // and stays. Never in dogfood, where `.bkit/core` is bkit's own source.
  if (moduleList.includes("core") && path.resolve(ctx.cwd) !== getPkgRoot()) {
    for (const { relPath } of PAYLOAD_LINKS) {
      const linkAbs = path.join(ctx.cwd, relPath);
      let st: fs.Stats | null = null;
      try {
        st = fs.lstatSync(linkAbs);
      } catch {
        st = null; // absent
      }
      if (st?.isSymbolicLink() !== true) continue;
      result.deleted.push(relPath);
      if (!ctx.dryRun) {
        fs.rmSync(linkAbs, { force: true });
        console.log(`${ctx.logPrefix} delete: ${relPath} (payload view link)`);
      }
    }
  }

  // Prune bkit-authored dirs left empty by the deletions above (e.g. .claude/agents,
  // .claude/hooks). Candidates are the parent
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

  // Targeted (non-core) uninstall: `.bkit/version` stays (the modules that remain read it),
  // but its canonicalHashes still list every path this run deleted — absent entries that
  // `mergeCanonicalHashes` prunes. Left in place, the very next `bkit check` (a dry-run
  // install whose core postDispatch prunes the same absent paths) reports write-drift on
  // `.bkit/version` and fails the CI gate. Recompute and rewrite here so the on-disk manifest
  // already matches what the next check would produce. A full/core uninstall deletes the file
  // earlier instead (zero footprint) and never reaches this branch.
  if (!moduleList.includes("core")) {
    const versionFile = path.join(ctx.cwd, ".bkit", "version");
    const existing = readBkitVersion(versionFile);
    if (existing) {
      const { canonicalHashes, pruned } = mergeCanonicalHashes(
        ctx.cwd,
        existing.canonicalHashes,
        {},
        result.deleted,
      );
      if (pruned > 0) {
        console.log(
          `${ctx.logPrefix}${ctx.dryRun ? " [dry-run]" : ""} update version pin: .bkit/version (pruned ${pruned})`,
        );
        if (!ctx.dryRun) {
          writeBkitVersion(versionFile, { ...existing, canonicalHashes });
        }
      }
    }
  }

  return result;
}

/** `package.json` `bkit.*` keys each module records on install. */
const MODULE_BKIT_KEYS: Partial<Record<ModuleName, readonly string[]>> = {
  cloud: ["cloudAgents"],
  opencode: ["opencodeProvider", "opencodeProviders"],
};

/**
 * Remove the `bkit.*` keys recorded by the modules in `moduleList` from the consumer's
 * package.json, keeping its indent. Lists each removed key in `result.stripped`; a dry run
 * lists without writing.
 */
function stripModuleBkitKeys(
  moduleList: ModuleName[],
  ctx: UninstallContext,
  result: UninstallResult,
): void {
  const keys = moduleList.flatMap((m) => MODULE_BKIT_KEYS[m] ?? []);
  if (keys.length === 0) return;
  const pkgPath = path.join(ctx.cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return;
  const raw = fs.readFileSync(pkgPath, "utf-8");
  const parsed = parseJson(raw);
  const pkg = parsed.ok ? (parsed.value as Record<string, unknown> | null) : null;
  if (pkg === null || !isJsonObject(pkg.bkit as JsonValue)) return;
  const bkit = pkg.bkit as Record<string, unknown>;
  const present = keys.filter((k) => k in bkit);
  if (present.length === 0) return;
  for (const k of present) {
    delete bkit[k];
    result.stripped.push(`package.json#bkit.${k}`);
  }
  console.log(
    `${ctx.logPrefix}${ctx.dryRun ? " [dry-run]" : ""} package.json: removed bkit.${present.join(", bkit.")}`,
  );
  if (ctx.dryRun) return;
  const indentMatch = raw.match(/\n([ \t]+)"/);
  const indent = indentMatch ? indentMatch[1] : "  ";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + "\n", "utf-8");
}

// ---------------------------------------------------------------------------
// runSurgicalOpencodeUninstall — remove exactly ONE provider block
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
    const parsed = parseJson(raw);
    const pkg = parsed.ok ? (parsed.value as Record<string, unknown> | null) : null;
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
      logPrefix: LOG_PREFIX,
    });
    return;
  }

  // 4. If was active → re-render the agent pins for the new active provider, so `bkit check`
  //    finds the mirrors in sync right after.
  if (wasActive && newActive !== null) {
    if (dryRun) {
      console.log(
        `${LOG_PREFIX}${tag} active provider would switch to "${newActive}" — .opencode/agents/ ` +
          `would be re-rendered to its model pins.`,
      );
      return;
    }
    const previousCwd = process.cwd();
    process.chdir(cwd);
    try {
      const written = rerenderOpencodeMirrors(newActive, LOG_PREFIX);
      console.log(
        `${LOG_PREFIX} active provider switched to "${newActive}" — re-rendered ` +
          `${written.length} .opencode/ agent/command file(s) to its model pins.`,
      );
    } finally {
      process.chdir(previousCwd);
    }
  }
}

/**
 * Re-render `.opencode/agents/` + `.opencode/commands/` for `provider` — the per-agent model
 * pins `bkit check` expects once `provider` is the active one, consumer `.bkit/prompts.md`
 * § Model Overrides applied — and refresh their `.bkit/version` hashes. Renders into
 * process.cwd(), as the host renderers resolve consumer paths from it. Returns the paths written.
 */
function rerenderOpencodeMirrors(provider: string, logPrefix: string): string[] {
  const cwd = process.cwd();
  const promptsMd = path.join(getBkitDocsRoot(), "prompts.md");
  const opencodeModelLookup = buildOpencodeModelLookup(promptsMd, provider);
  applyModelOverrides(opencodeModelLookup, provider, path.join(cwd, ".bkit", "prompts.md"));
  const written = renderOpencodeAgentsCommands({
    dryRun: false,
    tokens: { DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" },
    modelLookup: new Map(),
    opencodeModelLookup,
    effortMap: parseEffortMap(promptsMd),
    opencodeProvider: provider,
    advisories: [],
    ws: { writes: [] },
    logPrefix,
    postDispatch: [],
    issueTracker: readBkitConfig(cwd).issueTracker,
    version: readInstallingVersion(),
  });

  const versionFile = path.join(cwd, ".bkit", "version");
  const existing = readBkitVersion(versionFile);
  if (existing && written.length > 0) {
    const fresh: Record<string, string> = {};
    for (const rel of written) {
      const hash = hashFile(path.join(cwd, rel));
      if (hash) fresh[rel] = hash;
    }
    const { canonicalHashes } = mergeCanonicalHashes(cwd, existing.canonicalHashes, fresh);
    writeBkitVersion(versionFile, { ...existing, canonicalHashes });
  }
  return written;
}

export async function runUninstallCommand(
  modules: Set<ModuleFlag>,
  opencodeProvider: string | null,
  uninstallFlags: UninstallFlags,
): Promise<void> {
  setLogPrefix("[bkit-uninstall]");

  // Surgical single-provider removal: `uninstall --opencode=<provider>`
  if (modules.has("opencode") && opencodeProvider !== null) {
    const tag = uninstallFlags.dryRun ? " (dry-run)" : "";
    console.log(
      `${LOG_PREFIX} Surgical opencode uninstall: removing provider "${opencodeProvider}"${tag}...`,
    );
    await runSurgicalOpencodeUninstall(opencodeProvider, uninstallFlags.dryRun, process.cwd());
    return;
  }

  const uninstallCtx: UninstallContext = {
    cwd: process.cwd(),
    dryRun: uninstallFlags.dryRun,
    force: uninstallFlags.force,
    nuke: uninstallFlags.nuke,
    yes: uninstallFlags.yes,
    logPrefix: LOG_PREFIX,
  };
  const moduleList = [...modules] as ModuleName[];
  console.log(`${LOG_PREFIX} Running uninstall${uninstallCtx.dryRun ? " (dry-run)" : ""}...`);
  const result = await runUninstall(moduleList, uninstallCtx);
  console.log(uninstallSummaryLine(result, LOG_PREFIX));
}

/** The closing totals line of an uninstall run (dry-run wording when `result.dryRun`). */
export function uninstallSummaryLine(result: UninstallResult, logPrefix: string): string {
  const deleted = result.deleted.length;
  const stripped = result.stripped.length;
  const preserved = result.preserved.length;
  const absent = result.absent.length;
  return result.dryRun
    ? `${logPrefix} [dry-run] Would delete: ${deleted}, strip: ${stripped}, preserve: ${preserved}, already absent: ${absent}`
    : `${logPrefix} Done. Deleted: ${deleted}, stripped: ${stripped}, preserved: ${preserved}, already absent: ${absent}`;
}
