#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { detectRetiredOwnedFiles, retireOwnedFiles } from "./bkit-retire.js";
import { runCommand } from "./commands/lib.js";
import { COMMANDS } from "./commands/registry.js";
import {
  CLASSIC_VERBS,
  parseArgs,
  printUsage,
  OPTIN_MODULES,
  OPENCODE_PROVIDERS,
  normalizeOpencodeProvider,
  type ModuleFlag,
  type CloudVariant,
  type UpgradeFlags,
  type Verb,
} from "./bkit-cli.js";
import {
  runGrader,
  buildComplianceRows,
  appendComplianceRows,
  formatComplianceSummary,
  readBkitVersion,
} from "./bkit-comply.js";
import { resolveGitSha } from "./bkit-telemetry.js";
import { launchApp } from "./bkit-launch.js";
import {
  dispatchModules,
  getPkgRoot,
  listMdFiles,
  renderOpencodeJson,
  reconcileOpencodeJson,
  reconcileMcpJson,
  CREATE_IF_MISSING_PATHS,
  renderManagedOutputs,
  enrichClaudeSettingsAllows,
  pruneRetiredClaudeAskRules,
  opencodeProviderId,
  isTemplate,
  syncTemplateCopies,
  formatTemplateChanges,
  type ModuleContext,
} from "./bkit-modules.js";
import { getTemplatesRoot, getBkitDocsRoot, isDogfood } from "./bkit-paths.js";
import {
  findLineAnchoredMarkers,
  replaceManagedBlock,
  selectMarkers,
  type MarkerStyle,
} from "./bkit-markers.js";
import { resolveTokens } from "./bkit-tokens.js";
import {
  CLAUDE_CLOUD_RELPATH,
  CURSOR_CLOUD_RELPATH,
  writeClaudeCloudDoc,
  writeCursorCloudDoc,
  writeNetworkAllowlistArtifact,
  writeCursorCliPermissionsArtifact,
  parseDotenv,
} from "./bkit-cloud-env.js";
import { migrateConfigMdToContext, migrateContextFetchToContext } from "./bkit-context-migrate.js";
import { runPreflight } from "./bkit-preflight.js";
import {
  runPostInstallCheck,
  formatChecklist,
  readChangelogVersionDelta,
  writeAdvisoriesArtifact,
  findMissingOwnedHooks,
  detectOwnedHookMissing,
  describeMissingOwnedHook,
} from "./bkit-postinstall.js";
import {
  runUninstall,
  runSurgicalOpencodeUninstall,
  type UninstallContext,
} from "./bkit-uninstall.js";
import {
  runUpgrade,
  updateCanonicalHashesAfterUpgrade,
  migrateStrayGitattributes,
  migrateWarningsToNoise,
  planSelfBump,
  type UpgradeCandidate,
} from "./bkit-upgrade.js";
import {
  type ModuleName,
  type IssueTracker,
  type ManifestEntry,
  DEFAULT_ISSUE_TRACKER,
  parseIssueTracker,
  parseCloudAgents,
  getInstallManifest,
  getModuleManifest,
} from "./bkit-manifest.js";

// ---------------------------------------------------------------------------
// Staging helpers (P4.T1 / P4.T2)
//
// `.bkit-staging/` is a per-run SCRATCH area: modules render derived files there
// (e.g. opencode.json) before comparing/merging into the consumer destination.
// runInstall Phase 2 cleans it up after every dispatch — success or failure —
// via `finally { discardAllStaging() }`.
//
// NOTE: `commitStaging` / `discardStaging` / `initStagingDir` are atomic-rename
// PRIMITIVES retained for a future true per-module transactional path. They are
// NOT on the current install path: dispatch writes module files directly to their
// destinations and is NOT atomic across modules. A mid-dispatch failure can leave
// earlier modules' files written (and `.bkit/version` unpinned); `bkit install`
// is idempotent, so re-running completes a partial install. (#255 P1-5)
//
// Design contract (BAR-142 §A4):
//   - Staging path: `.bkit-staging/<module>/` relative to cwd.
//   - Each staged file lives at `<stagingDir>/<rel-consumer-path>`.
//   - commitStaging: move each staged file → real destination (fs.renameSync).
//     Falls back to copy+delete if cross-device rename throws EXDEV.
//   - discardStaging: fs.rmSync(stagingDir, { recursive: true, force: true }).
// ---------------------------------------------------------------------------

/** Staging root dir — all staging work lives under this path (relative to cwd). */
export const STAGING_ROOT = ".bkit-staging";

/**
 * Build the staging directory path for a given module.
 * Returns an absolute path.
 */
export function getStagingDir(module: string, cwd = process.cwd()): string {
  return path.join(cwd, STAGING_ROOT, module);
}

/**
 * Initialise a staging directory (create + empty).
 * Safe to call multiple times — idempotent.
 */
export function initStagingDir(stagingDir: string): void {
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
  fs.mkdirSync(stagingDir, { recursive: true });
}

/**
 * Commit a staging directory by moving each staged file to its real destination.
 *
 * Staged files live at `<stagingDir>/<relPath>` where `relPath` is relative to
 * consumer root (e.g. `.claude/agents/bkit-foo.md`).
 * On commit, each file is moved to `<cwd>/<relPath>`.
 *
 * Falls back to copy+delete when rename throws EXDEV (cross-device move).
 * Returns the list of committed relative paths.
 */
export function commitStaging(stagingDir: string, cwd = process.cwd()): string[] {
  if (!fs.existsSync(stagingDir)) return [];
  const committed: string[] = [];
  const entries = listFilesRecursive(stagingDir);
  for (const absStaged of entries) {
    const relPath = path.relative(stagingDir, absStaged);
    const destAbs = path.join(cwd, relPath);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    try {
      fs.renameSync(absStaged, destAbs);
    } catch (err: unknown) {
      // Cross-device rename (EXDEV) — fall back to copy + delete
      if ((err as NodeJS.ErrnoException).code === "EXDEV") {
        fs.copyFileSync(absStaged, destAbs);
        fs.chmodSync(destAbs, fs.statSync(absStaged).mode);
        fs.rmSync(absStaged);
      } else {
        throw err;
      }
    }
    committed.push(relPath);
  }
  // Clean up the (now-empty) staging dir
  fs.rmSync(stagingDir, { recursive: true, force: true });
  return committed;
}

/**
 * Discard a staging directory without touching consumer files.
 * Safe to call when stagingDir does not exist.
 */
export function discardStaging(stagingDir: string): void {
  if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
  }
}

/**
 * Discard ALL staging dirs under STAGING_ROOT (cleanup on mid-install failure).
 */
export function discardAllStaging(cwd = process.cwd()): void {
  const stagingRoot = path.join(cwd, STAGING_ROOT);
  if (fs.existsSync(stagingRoot)) {
    fs.rmSync(stagingRoot, { recursive: true, force: true });
  }
}

// Bkit-prefix filter — files not starting with this prefix are project-managed
// and never removed by payload cleanup.
const BKIT_PREFIX = "bkit-";

// Log prefix — mutated by main() to "[bkit-check]" when verb === "check"
// so log scanners can tell which verb actually ran.
let LOG_PREFIX = "[bkit-install]";

export type Host = "claude" | "cursor" | "opencode" | "codex";

/**
 * Parse .bkit/prompts.md § Models table → Map<name, columnValue>.
 * columnHeader is the column header label to extract (e.g. "Cursor model", "opencode model").
 * The function is header-addressed: it finds the column by name, never by position.
 * Hard-fails (process.exit(1)) if the section or column header is not found.
 */
export function parseModelLookupForColumn(
  subagentsMdPath: string,
  columnHeader: string,
): Map<string, string> {
  const content = fs.readFileSync(subagentsMdPath, "utf-8");
  const map = new Map<string, string>();

  const modelsIdx = content.indexOf("## Models");
  if (modelsIdx === -1) {
    console.error(`${LOG_PREFIX} Could not find ## Models section in ${subagentsMdPath}`);
    process.exit(1);
  }

  const lines = content.slice(modelsIdx).split("\n");
  let inTable = false;
  let columnIndex = -1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) {
      if (inTable) break;
      continue;
    }
    inTable = true;

    const cols = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    // Header row: find the column index for our target header
    if (columnIndex === -1) {
      // Check if this is the header row by looking for the target column
      const lowerCols = cols.map((c) => c.toLowerCase().replace(/`/g, ""));
      const targetLower = columnHeader.toLowerCase().replace(/`/g, "");
      const idx = lowerCols.findIndex((c) => c === targetLower);
      if (idx !== -1) {
        columnIndex = idx;
      }
      // Also skip separator rows (all --- cells)
      if (trimmed.includes("---")) continue;
      continue;
    }

    // Separator row
    if (trimmed.includes("---")) continue;

    if (cols.length <= columnIndex) continue;

    const nameMatch = cols[0].match(/^`([^`]+)`$/);
    if (!nameMatch) continue;
    // Strip optional backtick wrapping from model value (table cells may use `model-name`)
    const modelRaw = cols[columnIndex];
    const modelClean = modelRaw.replace(/^`|`$/g, "");
    map.set(nameMatch[1], modelClean);
  }

  if (columnIndex === -1) {
    console.error(
      `${LOG_PREFIX} Could not find column "${columnHeader}" in ## Models table in ${subagentsMdPath}`,
    );
    process.exit(1);
  }

  return map;
}

/**
 * Parse .bkit/prompts.md § Models table → Map<name, cursorModel>.
 * Header-addressed: finds the "Cursor model" column by header name.
 * Preserved for backward compatibility — delegates to parseModelLookupForColumn.
 */
export function parseModelLookup(subagentsMdPath: string): Map<string, string> {
  return parseModelLookupForColumn(subagentsMdPath, GATEWAY_COLUMN.cursor);
}

/**
 * Gateway key → its prompts.md § Models column header.
 *
 * § Models is keyed on GATEWAY, never on program — a model id belongs to the gateway it
 * is served from, so a gateway shared by two programs is one column, not two. That is what
 * stops the table growing as programs x gateways. `anthropic` and `cursor` are the pinned
 * gateways of the claude and cursor programs (see PROGRAM_GATEWAYS in bkit-cli.ts).
 *
 * Cells hold the BARE, gateway-scoped model id. Any prefix a program's config format needs
 * is added at render time by formatModelPin — never stored in the table.
 */
const GATEWAY_COLUMN: Record<string, string> = {
  anthropic: "Anthropic",
  cursor: "Cursor",
  openrouter: "OpenRouter",
  ollama: "Ollama",
  "opencode-zen": "OpenCode Zen",
  "opencode-go": "OpenCode Go",
  openai: "OpenAI",
};

/**
 * Spell a model pin the way a program's config file expects it.
 *
 * The § Models cell is the bare, gateway-scoped model id (`kimi-k2.7-code`). Claude and
 * Cursor write it unchanged; opencode requires `<providerId>/<model>`, where providerId is
 * the opencode-side id and is NOT always the bkit gateway key — the `opencode-zen` gateway
 * is `opencode` on the opencode side. Route through opencodeProviderId, never the raw key.
 */
export function formatModelPin(program: string, gateway: string, bareModel: string): string {
  if (program === "opencode") return `${opencodeProviderId(gateway)}/${bareModel}`;
  // claude / cursor / codex all take the bare id: Claude and Cursor because their gateway is
  // implicit, Codex because it names its gateway in `[model_providers.<id>]` instead.
  return bareModel;
}

/**
 * The installed opencode provider, or exit(1) with the fix.
 *
 * `bkit check` / `bkit upgrade` take no `--opencode=` flag, so they read the provider the
 * consumer actually installed (package.json `bkit.opencodeProvider`, else the opencode.json
 * provider block). There is no default: a repo carrying `.opencode/` with no recorded
 * provider is a broken install, and rendering it against a substitute would silently rewrite
 * every agent pin to a provider the consumer never chose.
 *
 * Call ONLY on a path already known to need the opencode host — never speculatively, or a
 * consumer who simply did not install opencode gets a spurious failure.
 */
function requireOpencodeProvider(cwd: string, context: string): string {
  const detected = detectOpencodeProvider(cwd);
  if (!detected) {
    console.error(
      `${LOG_PREFIX} ${context}: the opencode host is installed but no provider is recorded ` +
        `(package.json \`bkit.opencodeProvider\` and .opencode/opencode.json are both silent). ` +
        `Re-run \`bkit install --opencode=<provider>\` — one of ${OPENCODE_PROVIDERS.join(", ")}.`,
    );
    process.exit(1);
  }
  return detected;
}

/**
 * Build the per-agent opencode model lookup for the selected provider.
 * Source of truth = prompts.md § Models, which carries one curated column per
 * provider ("OpenRouter", "Ollama"). Header-addressed. Every allowlisted provider
 * ships a column — an absent one is a bug, not a case to substitute around.
 */
export function buildOpencodeModelLookup(
  subagentsMdPath: string,
  provider: string,
): Map<string, string> {
  const header = GATEWAY_COLUMN[provider];
  if (!header) {
    throw new Error(
      `buildOpencodeModelLookup: no prompts.md § Models column for provider ${JSON.stringify(provider)}`,
    );
  }
  return parseModelLookupForColumn(subagentsMdPath, header);
}

/**
 * Parse the consumer-owned `## Model Overrides` table (below the `bkit:end` marker)
 * from an installed prompts.md. Rows are `| Prompt | Provider | Model |`. Best-effort:
 * returns [] when the file, the marker, the section, or the rows are absent.
 * Only the region after the line-anchored `bkit:end` is read — the bkit-managed block is
 * never an override, even when its prose quotes the marker.
 */
export function parseModelOverrides(
  promptsMdPath: string,
): Array<{ prompt: string; provider: string; model: string }> {
  if (!fs.existsSync(promptsMdPath)) return [];
  const content = fs.readFileSync(promptsMdPath, "utf-8");
  const endIdx = findLineAnchoredMarkers(content, selectMarkers("html-comment")[1])[0];
  const region = endIdx === undefined ? "" : content.slice(endIdx);
  const ovIdx = region.indexOf("## Model Overrides");
  if (ovIdx === -1) return [];
  const out: Array<{ prompt: string; provider: string; model: string }> = [];
  let inTable = false;
  for (const line of region.slice(ovIdx).split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|")) {
      if (inTable) break;
      continue;
    }
    inTable = true;
    const cells = t
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((s) => s.trim().replace(/^`|`$/g, ""));
    if (cells.length < 3) continue;
    const [prompt, provider, model] = cells;
    if (!prompt || !provider || !model) continue;
    if (prompt.toLowerCase() === "prompt") continue; // header row
    if (/^-+$/.test(prompt)) continue; // separator row
    out.push({ prompt, provider, model });
  }
  return out;
}

/**
 * Merge consumer overrides (from `overridesPath`, an installed prompts.md) into a
 * per-agent model `lookup` for one host/provider key. Mutates `lookup` in place;
 * only rows whose Provider matches `providerKey` and whose Prompt is a known agent win.
 */
export function applyModelOverrides(
  lookup: Map<string, string>,
  providerKey: string,
  overridesPath: string,
): void {
  for (const o of parseModelOverrides(overridesPath)) {
    if (o.provider.toLowerCase() === providerKey.toLowerCase() && lookup.has(o.prompt)) {
      lookup.set(o.prompt, o.model);
    }
  }
}

/**
 * Effort → provider thinking map from prompts.md.
 * Row key = Default column (canonical prompt `effort:`).
 * Other columns = value emitted per host/provider at install.
 */
export type EffortMap = Map<string, Map<string, string>>; // column → (sourceEffort → target)

/**
 * Program → prompts.md effort-table column header.
 *
 * The effort table is keyed on PROGRAM, never on gateway — how hard to think is a property
 * of the program's config format (`effort:` on Claude and Cursor, `reasoningEffort:` on
 * opencode, on a different ladder), not of the model. Every opencode gateway therefore
 * shares one column. That is the opposite axis to GATEWAY_COLUMN, and keeping the two apart
 * is what stops either table growing as programs x gateways.
 */
const EFFORT_COLUMN_FOR_PROGRAM: Record<string, string> = {
  claude: "Claude",
  cursor: "Cursor",
  opencode: "OpenCode",
  codex: "Codex",
};

/**
 * Parse prompts.md effort→provider table (header starts with Default | Claude | …).
 * Returns column → (sourceEffort → target). Hard-fails if the table is absent/malformed.
 */
export function parseEffortMap(promptsMdPath: string): EffortMap {
  if (!fs.existsSync(promptsMdPath)) {
    throw new Error(`${LOG_PREFIX} Effort map: file not found: ${promptsMdPath}`);
  }
  const content = fs.readFileSync(promptsMdPath, "utf-8");
  const lines = content.split("\n");
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t.startsWith("|")) continue;
    const headers = t
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim().replace(/`/g, ""));
    if (
      headers[0]?.toLowerCase() === "default" &&
      headers.some((h) => h.toLowerCase() === "claude") &&
      headers.some((h) => /opencode/i.test(h))
    ) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) {
    throw new Error(
      `${LOG_PREFIX} Could not find Effort → provider thinking table (Default | Claude | …) in ${promptsMdPath}`,
    );
  }
  const headerCells = lines[headerIdx]
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim().replace(/`/g, ""));
  // Skip separator row
  let rowStart = headerIdx + 1;
  if (rowStart < lines.length && /^[|\s:-]+$/.test(lines[rowStart].trim())) rowStart++;

  const out: EffortMap = new Map();
  for (const h of headerCells) out.set(h, new Map());

  for (let i = rowStart; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t.startsWith("|")) break;
    const cells = t
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => c.trim().replace(/`/g, ""));
    if (cells.length < headerCells.length) continue;
    const sourceEffort = cells[0];
    if (!sourceEffort || /^-+$/.test(sourceEffort)) continue;
    for (let c = 0; c < headerCells.length; c++) {
      const target = cells[c];
      if (!target) continue;
      out.get(headerCells[c])!.set(sourceEffort, target);
    }
  }
  const defaultCol = out.get("Default");
  if (!defaultCol || defaultCol.size === 0) {
    throw new Error(`${LOG_PREFIX} Effort map Default column empty in ${promptsMdPath}`);
  }
  return out;
}

/**
 * Resolve the prompts.md effort-table column for a program.
 * Throws on an unknown program: with the table keyed on program there is no gateway key
 * left to substitute around, and silently falling back would emit a ladder the caller
 * never chose. Callers pass a program ("claude" / "cursor" / "opencode"), not a gateway.
 */
export function effortColumnForProgram(program: string): string {
  const col = EFFORT_COLUMN_FOR_PROGRAM[program];
  if (!col) {
    throw new Error(
      `effortColumnForProgram: no prompts.md effort column for program ${JSON.stringify(program)}`,
    );
  }
  return col;
}

/**
 * Look up the emitted thinking value for a program + source prompt effort.
 * Column resolution: program → named column → identity when the row is absent.
 */
export function lookupEffort(effortMap: EffortMap, program: string, sourceEffort: string): string {
  return effortMap.get(effortColumnForProgram(program))?.get(sourceEffort) ?? sourceEffort;
}

// Fields in Claude frontmatter that are opencode-incompatible and must be dropped.
const CLAUDE_ONLY_FIELDS = new Set(["permissionMode", "maxTurns", "is_background", "readonly"]);

/**
 * Convert a Claude `tools:` frontmatter block (a YAML array of capitalized tool names,
 * e.g. `- Read`/`- Write`) into opencode's `AgentConfig.tools` shape: an object map of
 * lowercase tool names → true (`tools:\n  read: true`). opencode REJECTS the array form
 * ("tools: Expected object | undefined, got [...]"), and its tool names are lowercase.
 * MCP tools are `<server>_<tool>` on opencode, so Claude's `mcp__<server>__<tool>` (or
 * `mcp__<server>__*`) is respelled rather than lowercased; the key may be a `*` pattern.
 * Returns "" when there are no tools (field omitted — also valid per the schema).
 */
export function opencodeToolsBlock(toolsBlock: string | null): string {
  if (!toolsBlock) return "";
  const names: string[] = [];
  for (const m of toolsBlock.matchAll(/^[ \t]*-[ \t]*([A-Za-z][\w*-]*)/gm)) names.push(m[1]);
  if (names.length === 0) {
    // Fallback: inline array form `tools: [Read, Write]`.
    const inline = toolsBlock.match(/\[([^\]]*)\]/);
    if (inline) {
      for (const t of inline[1].split(",")) {
        const n = t.trim().replace(/['"]/g, "");
        if (n) names.push(n);
      }
    }
  }
  if (names.length === 0) return "";
  let out = "tools:\n";
  for (const n of names) {
    const mcp = /^mcp__(.+?)__(.+)$/.exec(n);
    out += `  ${mcp ? `${mcp[1]}_${mcp[2]}` : n.toLowerCase()}: true\n`;
  }
  return out;
}

/**
 * OC1: opencode agent frontmatter rewrite.
 * Emits: mode, name, description, model, tools (Claude array → opencode object map),
 * reasoningEffort (from prompts.md effort table via provider column). Drops: Claude-only
 * fields (permissionMode, maxTurns, is_background, readonly) and the original effort field.
 * Hard-fails with non-zero exit if model lookup missing for name.
 */
export function applyOpencodeAgent(
  content: string,
  opencodeModelLookup: Map<string, string>,
  effortMap?: EffortMap,
  provider?: string,
): string {
  const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
  if (!fmMatch) return content;

  const fmBlock = fmMatch[2];
  const afterFm = content.slice(fmMatch[0].length);
  const parsed = parseFrontmatter(fmBlock);

  const name = parsed.get("name") ?? "";
  if (!name) {
    console.error(`${LOG_PREFIX} Subagent frontmatter missing 'name' field`);
    process.exit(1);
  }

  const opencodeModel = opencodeModelLookup.get(name);
  if (!opencodeModel) {
    console.error(`${LOG_PREFIX} Missing opencode model lookup for ${name}`);
    process.exit(1);
  }

  const description = parsed.get("description") ?? "";
  const effort = parsed.get("effort");
  const toolsBlock = extractFrontmatterField(fmBlock, "tools");

  let newFm = "---\n";
  newFm += `mode: subagent\n`;
  newFm += `name: ${name}\n`;
  if (description.includes("\n")) {
    const indented = description.split("\n").join("\n  ");
    newFm += `description: |\n  ${indented}\n`;
  } else {
    newFm += `description: ${description}\n`;
  }
  newFm += `model: ${formatModelPin("opencode", provider ?? "", opencodeModel)}\n`;
  newFm += opencodeToolsBlock(toolsBlock);
  if (effort && effortMap) {
    // Program-keyed: every opencode gateway shares the one "OpenCode" ladder, so the
    // gateway is deliberately not consulted here.
    newFm += `reasoningEffort: ${lookupEffort(effortMap, "opencode", effort)}\n`;
  }
  newFm += "---\n";

  return newFm + afterFm;
}

/**
 * Remap frontmatter `effort:` through the prompts.md effort table for a host column
 * (Claude / Cursor). Used by Claude (native `effort:`) and Cursor (emits `effort:` from
 * the Cursor column so thinking intent survives the T3 rewrite).
 */
export function applyEffortRemap(content: string, effortMap: EffortMap, host: string): string {
  const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
  if (!fmMatch) return content;
  const fmBlock = fmMatch[2];
  const afterFm = content.slice(fmMatch[0].length);
  const parsed = parseFrontmatter(fmBlock);
  const effort = parsed.get("effort");
  if (!effort) return content;
  const mapped = lookupEffort(effortMap, host, effort);
  if (mapped === effort) return content;
  const newFm = fmBlock.replace(/^effort:\s*\S+\s*$/m, `effort: ${mapped}`);
  return `---\n${newFm}\n---\n${afterFm}`;
}

/**
 * Escape a body for a TOML basic multi-line string (`"""` … `"""`).
 *
 * TOML has no raw-string escape hatch that survives arbitrary content: literal strings
 * cannot contain their own quote run, and basic strings interpret backslashes. So the body
 * is emitted as a basic multi-line string with the sequences that would terminate or corrupt
 * it neutralised — a stray triple-quote in a prompt would otherwise close the value early and
 * yield a TOML file that parses as something else entirely.
 */
export function escapeTomlMultiline(body: string): string {
  return body
    .replace(/\\/g, "\\\\") // backslash first, or the escapes below get double-escaped
    .replace(/"""/g, '\\"\\"\\"')
    .replace(/\r\n/g, "\n");
}

/** Emit a TOML `key = "value"` line, escaping the basic-string metacharacters. */
function tomlString(key: string, value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  return `${key} = "${escaped}"\n`;
}

/**
 * Convert a Claude-format prompt (`.bkit/prompts/*.md`) into a Codex agent definition
 * (`.codex/agents/<name>.toml`).
 *
 * Field mapping — `name`, `description` and `developer_instructions` are REQUIRED by Codex:
 *   name                    <- frontmatter `name`
 *   description             <- frontmatter `description`
 *   developer_instructions  <- the markdown body
 *   model                   <- § Models `OpenAI` column (bare id; Codex names its gateway
 *                              in `[model_providers.<id>]`, not in the pin)
 *   model_reasoning_effort  <- § Effort `Codex` column
 *
 * NOT emitted — `tools:`. Codex has no per-agent tool allowlist (openai/codex#6049 is open),
 * and `sandbox_mode` cannot stand in: every bkit agent is write-capable, so it would be
 * `workspace-write` for all of them and discriminate nothing. The declared `tools:` block is
 * therefore NOT enforced on this host; that limitation is documented in providers.md rather
 * than hidden behind a field that only looks like it restricts something.
 */
export function applyCodexAgent(
  content: string,
  codexModelLookup: Map<string, string>,
  effortMap?: EffortMap,
): string {
  const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
  if (!fmMatch) return content;

  const fmBlock = fmMatch[2];
  const body = content.slice(fmMatch[0].length).trim();
  const parsed = parseFrontmatter(fmBlock);

  const name = parsed.get("name") ?? "";
  if (!name) {
    console.error(`${LOG_PREFIX} Subagent frontmatter missing 'name' field`);
    process.exit(1);
  }

  const model = codexModelLookup.get(name);
  if (!model) {
    console.error(`${LOG_PREFIX} Missing codex model lookup for ${name}`);
    process.exit(1);
  }

  const effort = parsed.get("effort");
  let out = "";
  out += tomlString("name", name);
  out += tomlString("description", parsed.get("description") ?? "");
  out += tomlString("model", formatModelPin("codex", "openai", model));
  if (effort && effortMap) {
    out += tomlString("model_reasoning_effort", lookupEffort(effortMap, "codex", effort));
  }
  out += `developer_instructions = """\n${escapeTomlMultiline(body)}\n"""\n`;
  return out;
}

/**
 * Session-prompt anchor prepended to every opencode command body. OpenCode
 * substitutes `$ARGUMENTS` with everything typed after the slash command before
 * the template is sent to the model. Without this, the command body replaces the
 * user's input and the issue ref / instructions are lost (issue #278). A single
 * top anchor keeps a large pasted prompt in one place and sits at the head where
 * the workflows' Step 1 issue-extraction ("scan session prompt") reads it. The
 * managed-version stamp is prepended afterwards, so this renders just below it.
 */
export const OPENCODE_SESSION_PROMPT_ANCHOR = "**Session prompt:**\n\n$ARGUMENTS\n\n---\n\n";

/**
 * T2: Cursor/OpenCode command invocation rewrite (shared — also OC2 step 2 via
 * applyOpencodeCommand). Paired with applyT1 in the Cursor render pipeline.
 * - `Agent` tool → `Task` tool (subagent invocations)
 * - `Skill` tool → `Task` tool (slash-command invocations — Cursor/OpenCode
 *   `Task` covers both surfaces; Claude splits them into `Agent` + `Skill`)
 * - @name → /name on **Subagent:** lines:
 *   - bare `**Subagent:** @name` (legacy exact line)
 *   - real workflow shape `**Subagent:** Invoke \`@name\`…` (incl. indented lists)
 * - Caution placeholder `Invoke using \`@name\`` → `\`/name\``
 * Does NOT rewrite body prose, npm scopes, emails, or gate-checklist `@agent` refs.
 */
export function applyT2(content: string): string {
  let result = content.replace(/`Agent` tool/g, "`Task` tool");
  result = result.replace(/using `Agent` tool/g, "using `Task` tool");
  result = result.replace(/`Skill` tool/g, "`Task` tool");
  result = result.replace(/using `Skill` tool/g, "using `Task` tool");
  // Backticked `@agent` on any **Subagent:** line (numbered, list-indented, or bare).
  result = result.replace(/^([^\n]*?\*\*Subagent:\*\*[^\n]*?)`@([a-z][a-z0-9-]*)`/gm, "$1`/$2`");
  // Bare `@agent` immediately after **Subagent:** (legacy exact-line form).
  result = result.replace(/^([^\n]*?\*\*Subagent:\*\* )@([a-z][a-z0-9-]*)\b/gm, "$1/$2");
  result = result.replace(/Invoke using `@name`/g, "Invoke using `/name`");
  return result;
}

/**
 * OC2: opencode command rewrite.
 * - Strips leading YAML frontmatter block (same as T1).
 * - Rewrites invocation spelling for opencode (same as T2 — see `applyT2`).
 * - Prepends the session-prompt `$ARGUMENTS` anchor (issue #278).
 */
export function applyOpencodeCommand(content: string): string {
  // Step 1: strip frontmatter (same as T1)
  const stripped = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\n+/, "");
  // Step 2: rewrite invocations (same as T2)
  const result = applyT2(stripped);
  // Step 3: prepend the session-prompt anchor so the slash-command args survive.
  return OPENCODE_SESSION_PROMPT_ANCHOR + result;
}

// T1: Replace the leading YAML frontmatter block with its `description:` value as a
// plain first line, for Cursor commands. Cursor prints a command file's literal first
// line as the description in the picker and hover, and it does not read frontmatter —
// hence the strip. Dropping the description outright left whatever came next (the
// managed-version marker) standing in as the description (#386). Derived from the
// frontmatter at render time, so it cannot drift from the value Claude Code shows.
// No frontmatter, or frontmatter without `description`, falls back to a plain strip.
export function applyT1(content: string): string {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fm) return content;
  const body = content.slice(fm[0].length).replace(/^\n+/, "");
  const eol = fm[0].includes("\r\n") ? "\r\n" : "\n";
  const raw = parseFrontmatter(fm[1]).get("description")?.trim() ?? "";
  const description = raw.replace(/^(['"])([\s\S]*)\1$/, "$2").trim();
  return description ? `${description}${eol}${eol}${body}` : body;
}

// Parse simple YAML frontmatter block (key: value, or key: | multiline)
export function parseFrontmatter(fmBlock: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = fmBlock.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*):\s*(.*)/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    const valueOnLine = keyMatch[2].trim();

    if (valueOnLine === "|") {
      const blockLines: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (/^[a-zA-Z_][a-zA-Z0-9_-]*:/.test(nextLine)) break;
        blockLines.push(nextLine.replace(/^ {2}/, ""));
        i++;
      }
      map.set(key, blockLines.join("\n").trim());
    } else {
      map.set(key, valueOnLine);
      i++;
    }
  }

  return map;
}

// Extract a YAML field's raw block (including continuation lines) from a frontmatter string.
// Handles both inline (`field: [a, b]`) and multi-line list (`field:\n  - a\n  - b`) formats.
// Returns null if field absent.
function extractFrontmatterField(fmBlock: string, field: string): string | null {
  const re = new RegExp(`^(${field}:[ \\t]*[^\\n]*(?:\\n[ \\t]+[^\\n]*)*)`, "m");
  const m = fmBlock.match(re);
  return m ? m[1] : null;
}

// T3: Cursor subagent frontmatter rewrite.
// Emits: name, description, model, tools (passthrough — Cursor 2.4+ accepts identical tool names per BAR-113),
// effort (from prompts.md Cursor column). Drops: permissionMode, maxTurns, readonly, is_background.
// Hard-fails with non-zero exit if model lookup missing for name.
export function applyT3(
  content: string,
  modelLookup: Map<string, string>,
  effortMap?: EffortMap,
): string {
  const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
  if (!fmMatch) return content;

  const fmBlock = fmMatch[2];
  const afterFm = content.slice(fmMatch[0].length);
  const parsed = parseFrontmatter(fmBlock);

  const name = parsed.get("name") ?? "";
  if (!name) {
    console.error(`${LOG_PREFIX} Subagent frontmatter missing 'name' field`);
    process.exit(1);
  }

  const cursorModel = modelLookup.get(name);
  if (!cursorModel) {
    console.error(`${LOG_PREFIX} Missing model lookup for ${name}`);
    process.exit(1);
  }

  const description = parsed.get("description") ?? "";
  const effort = parsed.get("effort");
  const toolsBlock = extractFrontmatterField(fmBlock, "tools");

  let newFm = "---\n";
  newFm += `name: ${name}\n`;
  if (description.includes("\n")) {
    const indented = description.split("\n").join("\n  ");
    newFm += `description: |\n  ${indented}\n`;
  } else {
    newFm += `description: ${description}\n`;
  }
  newFm += `model: ${formatModelPin("cursor", "cursor", cursorModel)}\n`;
  if (effort && effortMap) {
    newFm += `effort: ${lookupEffort(effortMap, "cursor", effort)}\n`;
  }
  if (toolsBlock) newFm += `${toolsBlock}\n`;
  newFm += "---\n";

  return newFm + afterFm;
}

// Shared WriteSet accumulator — both check and install paths populate this identically,
// ensuring parity by construction (eliminates future dry-run divergence).
export interface WriteEntry {
  path: string;
  action: "write" | "update" | "append";
}

export interface WriteSet {
  writes: WriteEntry[];
}

// Managed-block writer: update content between markers in a file on disk.
// No-op (warn + skip) when markers absent, duplicated, or inverted.
export function updateManagedBlock(
  filePath: string,
  newContent: string,
  dryRun = false,
  markerStyle: MarkerStyle = "html-comment",
): boolean {
  if (!fs.existsSync(filePath)) return false;
  const existing = fs.readFileSync(filePath, "utf-8");
  const result = replaceManagedBlock(existing, newContent, markerStyle);
  if (!result.ok) {
    const reason = {
      absent: `Managed block markers absent in ${filePath} — skipping`,
      multiple: `Multiple managed-block markers in ${filePath} — skipping (expected exactly one of each)`,
      inverted: `Inverted managed-block markers in ${filePath} (end before start) — skipping`,
    }[result.problem];
    console.warn(`${LOG_PREFIX} ${reason}`);
    return false;
  }
  if (result.content === existing) return false;
  if (!dryRun) fs.writeFileSync(filePath, result.content, "utf-8");
  return true;
}

export function listFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFilesRecursive(p));
    else if (ent.isFile()) out.push(p);
  }
  return out;
}

// npm hard-excludes files literally named `.gitignore` and `.npmignore` from
// packed tarballs (by basename, anywhere in the tree), regardless of the `files`
// field. Those — and ONLY those — are stored without the leading dot in
// `.bkit/templates/` and remapped to their dotted dest at install/upgrade time.
//
// Any OTHER dotfile (`.gitattributes`, `.prettierignore`, `.mcp.json`, …) packs
// fine with its dot, so it is stored dotted in the template tree and needs NO
// remap. Do not add such names here — store the template with its real name.
//
// This is the single source of truth for the dotfile remap; the module install
// pass (bkit-modules.ts) and the `bkit upgrade` template walk both call it, so
// they can never disagree about how a template basename maps to its dest path.
const NPM_STRIP_REMAP: Record<string, string> = {
  gitignore: ".gitignore",
  npmignore: ".npmignore",
};

export function remapTemplateDest(rel: string): string {
  const dir = path.dirname(rel);
  const base = path.basename(rel);
  const mapped = NPM_STRIP_REMAP[base];
  if (mapped === undefined) return rel;
  return dir === "." ? mapped : path.join(dir, mapped);
}

function mirrorDirAlways(
  src: string,
  dst: string,
  dryRun: boolean,
  log: (rel: string) => void,
): number {
  let writes = 0;
  if (!dryRun) fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, ent.name);
    const dstPath = path.join(dst, ent.name);
    if (ent.isDirectory()) {
      writes += mirrorDirAlways(srcPath, dstPath, dryRun, (sub) => log(path.join(ent.name, sub)));
      continue;
    }
    if (!ent.isFile()) continue;
    const srcContent = fs.readFileSync(srcPath);
    if (fs.existsSync(dstPath)) {
      const dstContent = fs.readFileSync(dstPath);
      if (srcContent.equals(dstContent)) continue;
    }
    if (!dryRun) {
      fs.copyFileSync(srcPath, dstPath);
      fs.chmodSync(dstPath, fs.statSync(srcPath).mode);
    }
    writes++;
    log(ent.name);
  }
  return writes;
}

// Payload pass: refresh bkit-canonical content in <cwd>/.agents/ from the package payload.
//   - .agents/{workflows,prompts}/bkit-*.md → overwrite + prune (bkit-prefix only)
// In dogfood (running from .bkit/src/ in the bkit repo itself), src and dst
// resolve to the same paths, so this pass is a no-op.
// Mirror sources (`.bkit/workflows`, `.bkit/prompts`) and bkit-authoring docs
// (`.bkit/*.md`) live package-side and are read directly from there at runtime
// (see getWorkflowsRoot / getPromptsRoot / getBkitDocsRoot). The reference docs
// are ALSO mirrored into the consumer's own `.bkit/` by runBkitDocs — but at the
// NEW `.bkit/` home, never the old `.agents/` one. Consumers upgraded from a
// layout that copied these into `.agents/` carry orphans at the OLD path —
// `runPayload` removes those so the tree stays clean. (`.agents/rules.md` is NOT
// relocated — it remains a consumer-shipped Tier-2 file; AGENTS.md/CLAUDE.md
// reference it.)
//
// Named `runPayload` for call-site stability with the dispatch in runCoreModule;
// the historical "payload copy" is gone, leaving only orphan cleanup. Never
// touches the bkit repo's own tree (isDogfood guard): in dogfood these paths
// already live under `.bkit/`, so there is nothing in `.agents/` to remove.
const RELOCATED_AGENTS_FILES = [
  "trackers.md",
  "workflows.md",
  "cloud.md",
  "prompts.md",
  "providers.md",
] as const;

// Files that moved from `.agents/` to a consumer-side `.bkit/` directory and
// carry consumer-owned or stateful content — MIGRATE (move) rather than delete,
// so an upgrading consumer keeps their version pin, secrets, and friction log.
// [oldRel, newRel]. `.env.example` is owned (the claude module overwrites it at the new
// path), so the move only keeps the old path from lingering.
const MIGRATED_AGENTS_FILES: ReadonlyArray<readonly [string, string]> = [
  [path.join(".agents", ".bkit-version"), path.join(".bkit", "version")],
  [path.join(".agents", ".env"), path.join(".bkit", ".env")],
  [path.join(".agents", ".env.example"), path.join(".bkit", ".env.example")],
  [path.join(".agents", "friction.md"), path.join(".bkit", "friction.md")],
];

export function runPayload(dryRun: boolean): { deletes: number } {
  let deletes = 0;
  const tag = dryRun ? "[dry-run] " : "";

  if (isDogfood()) return { deletes: 0 };

  // 1. Relocated mirror-source dirs: remove bkit-prefix files, then the dir if empty.
  for (const subdir of ["workflows", "prompts"] as const) {
    const dstDir = path.join(".agents", subdir);
    if (!fs.existsSync(dstDir)) continue;
    for (const f of listMdFiles(dstDir, BKIT_PREFIX)) {
      const target = path.join(dstDir, f);
      console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing relocated ${target}`);
      deletes++;
      if (!dryRun) fs.rmSync(target, { force: true });
    }
    if (!dryRun && fs.readdirSync(dstDir).length === 0) fs.rmdirSync(dstDir);
  }

  // 2. Relocated single files (bkit-authoring docs).
  for (const name of RELOCATED_AGENTS_FILES) {
    const target = path.join(".agents", name);
    if (!fs.existsSync(target)) continue;
    console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing relocated ${target}`);
    deletes++;
    if (!dryRun) fs.rmSync(target, { force: true });
  }

  // 3. Migrate stateful/consumer-owned files .agents/ → .bkit/ (move, content-preserving).
  //    Only when the old path exists and the new one does not, so a re-run is a no-op
  //    and an already-migrated consumer is never clobbered.
  for (const [oldRel, newRel] of MIGRATED_AGENTS_FILES) {
    if (!fs.existsSync(oldRel)) continue;
    if (fs.existsSync(newRel)) {
      // Already migrated (or freshly seeded) — drop the stale .agents/ copy.
      console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing superseded ${oldRel}`);
      deletes++;
      if (!dryRun) fs.rmSync(oldRel, { force: true });
      continue;
    }
    console.log(`${LOG_PREFIX} ${tag}payload migrate: ${oldRel} → ${newRel}`);
    if (!dryRun) {
      fs.mkdirSync(path.dirname(newRel), { recursive: true });
      fs.renameSync(oldRel, newRel);
    }
  }
  // Old regenerated advisories artifact — drop it (rewritten at .bkit/advisories.md).
  {
    const oldAdvisories = path.join(".agents", "advisories.md");
    if (fs.existsSync(oldAdvisories)) {
      console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing superseded ${oldAdvisories}`);
      deletes++;
      if (!dryRun) fs.rmSync(oldAdvisories, { force: true });
    }
  }

  return { deletes };
}

// ---------------------------------------------------------------------------
// D1 upgrade orphan-removal (#160)
//
// Consumers who ran `bkit upgrade` on a version that shipped `.agents/templates/`
// (pre-#160 layout) now carry an orphaned directory that no longer exists in the
// tarball. Remove it so the consumer tree stays clean. No-op when absent.
// Dry-run aware: logs only, no FS write.
// ---------------------------------------------------------------------------

export function removeOrphanTemplatesDir(cwd: string, dryRun: boolean): void {
  const orphanDir = path.join(cwd, ".agents", "templates");
  if (!fs.existsSync(orphanDir)) return;
  // Gate on bkit-origin sentinel: verify at least one known bkit-managed path
  // exists inside the directory before deleting. This guards against silently
  // destroying a consumer-owned .agents/templates/ directory that bkit never wrote.
  const BKIT_SENTINELS = [
    "AGENTS.md",
    "CLAUDE.md",
    path.join(".github", "workflows"),
    path.join(".github", "renovate.json5"),
    path.join(".github", "dependabot.yml"),
    "gitignore",
    ".vale.ini",
  ];
  const isBkitOrigin = BKIT_SENTINELS.some((s) => fs.existsSync(path.join(orphanDir, s)));
  if (!isBkitOrigin) {
    console.log(
      `${LOG_PREFIX} upgrade: skipping .agents/templates/ removal — no bkit-origin sentinel found; directory appears consumer-owned`,
    );
    return;
  }
  const tag = dryRun ? "[dry-run] " : "";
  console.log(`${LOG_PREFIX} ${tag}upgrade: removing orphan .agents/templates/ (D1 auto-clean)`);
  if (!dryRun) {
    fs.rmSync(orphanDir, { recursive: true, force: true });
  }
}

/**
 * Read the installing bkit version from the package root's package.json.
 * Returns "0.0.0" when unreadable (e.g. dev tree without a package.json at the
 * resolved root) — keeps the advisories artifact informational, not fatal.
 */
export function getInstallingVersion(): string {
  try {
    const pkgJsonPath = path.join(getPkgRoot(), "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
      return pkg.version ?? "0.0.0";
    }
  } catch {
    return "0.0.0"; // best-effort: unreadable/garbled package.json
  }
  return "0.0.0";
}

/**
 * `bkit status` — read-only host/provider status.
 * Reports current host+provider sampled from .opencode/opencode.json,
 * .claude/, and .cursor/ presence. Writes nothing.
 */
export function runStatus(cwd: string, logPrefix: string): void {
  console.log(`${logPrefix} Host/provider status (read-only — no writes)`);
  console.log(`${logPrefix} Working directory: ${cwd}`);

  // --- claude host ---
  const claudeDir = path.join(cwd, ".claude");
  const claudePresent = fs.existsSync(claudeDir);
  const claudeSettingsPath = path.join(claudeDir, "settings.json");
  let claudeModel = "claude (default)";
  if (claudePresent && fs.existsSync(claudeSettingsPath)) {
    try {
      const settings = JSON.parse(fs.readFileSync(claudeSettingsPath, "utf-8")) as {
        model?: string;
      };
      if (settings.model) claudeModel = settings.model;
    } catch {
      // best-effort
    }
  }
  console.log(
    `${logPrefix} claude:  ${claudePresent ? "INSTALLED" : "absent"}  (provider: anthropic / ${claudeModel})`,
  );

  // --- cursor host ---
  const cursorDir = path.join(cwd, ".cursor");
  const cursorPresent = fs.existsSync(cursorDir);
  console.log(`${logPrefix} cursor:  ${cursorPresent ? "INSTALLED" : "absent"}`);

  // --- opencode host ---
  const opencodeDir = path.join(cwd, ".opencode");
  const opencodePresent = fs.existsSync(opencodeDir);
  // Resolve active provider (manifest-first; covers managed-auth gateways like opencode).
  const activeOpencodeProvider = detectOpencodeProvider(cwd);
  // All installed providers (multi-provider tracking, Task 5 / #281).
  const allOpencodeProviders = detectOpencodeProviders(cwd);
  let opencodeModel = "unknown";
  const opencodeJsonPath = path.join(opencodeDir, "opencode.json");
  if (opencodePresent && fs.existsSync(opencodeJsonPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8")) as {
        model?: string;
        models?: Record<string, unknown>;
      };
      if (cfg.model) opencodeModel = cfg.model;
      // Fallback: look for non-empty models map
      if (opencodeModel === "unknown" && cfg.models) {
        const modelKeys = Object.keys(cfg.models);
        if (modelKeys.length > 0) opencodeModel = `${modelKeys.length} model(s) configured`;
      }
    } catch {
      opencodeModel = "parse-error";
    }
  }
  let opencodeProviderDisplay: string;
  let providerLabel: string;
  if (allOpencodeProviders.length > 1) {
    // Multi-provider: list all, mark active
    const activeKey = activeOpencodeProvider ?? allOpencodeProviders[0];
    opencodeProviderDisplay = allOpencodeProviders
      .map((p) => (p === activeKey ? `${p} (active)` : p))
      .join(", ");
    providerLabel = "providers";
  } else {
    // Single provider: use singular label
    opencodeProviderDisplay = activeOpencodeProvider ?? allOpencodeProviders[0] ?? "unknown";
    providerLabel = "provider";
  }
  // --- codex host ---
  const codexDir = path.join(cwd, ".codex");
  const codexPresent = fs.existsSync(codexDir);

  const opencodeStatus = opencodePresent
    ? `INSTALLED  (${providerLabel}: ${opencodeProviderDisplay} / model: ${opencodeModel})`
    : "absent (run: bkit install --opencode=<provider>)";
  console.log(`${logPrefix} opencode: ${opencodeStatus}`);
  console.log(
    `${logPrefix} codex:   ${codexPresent ? "INSTALLED  (provider: openai)" : "absent (run: bkit install --codex)"}`,
  );

  // --- summary ---
  const installedHosts = [
    claudePresent ? "claude" : null,
    cursorPresent ? "cursor" : null,
    opencodePresent ? "opencode" : null,
    codexPresent ? "codex" : null,
  ].filter(Boolean);
  console.log(
    `${logPrefix} Installed hosts: ${installedHosts.length > 0 ? installedHosts.join(", ") : "none"}`,
  );
}

/**
 * Detect which host modules a consumer has installed, by the presence of each host's
 * source-rendered agents directory. Used by `bkit upgrade` to re-render (#251) only the
 * hosts the consumer actually opted into — never force-creating an opencode/cursor tree.
 */
export function detectInstalledHostModules(cwd: string): Set<ModuleFlag> {
  const mods = new Set<ModuleFlag>();
  if (fs.existsSync(path.join(cwd, ".claude", "agents"))) mods.add("claude");
  if (fs.existsSync(path.join(cwd, ".cursor", "agents"))) mods.add("cursor");
  if (fs.existsSync(path.join(cwd, ".opencode", "agents"))) mods.add("opencode");
  if (fs.existsSync(path.join(cwd, ".codex", "agents"))) mods.add("codex");
  return mods;
}

/**
 * Installed-module set, detected by sentinel-file presence. Always core, plus the installed
 * subset of {claude, cursor, opencode, codex, lint}. Two callers:
 *   - `bkit check` (#252 Step 3) — scopes the drift gate, so a `--cursor`-only repo no longer
 *     reports `.claude/**` as drift, and a `--claude`-only repo is not flagged for lint files.
 *   - `bkit upgrade` — scopes the template walk, so upgrade does NOT force-create files for a
 *     module the consumer never installed (the install↔upgrade divergence: upgrade used to seed
 *     lint/cursor files for a claude-only consumer, which `check` then flagged).
 *
 * opencode IS gated (#255 #8): `.opencode/opencode.json` is the most drift-sensitive file
 * bkit ships (provider block + tracker-filtered mcp + permission map). It is safe to gate
 * because the render inputs fall back to the INSTALLED provider/tracker (renderOpencodeProvider
 * + the package.json tracker resolution), so an openrouter/opencode/… consumer is checked against its own
 * config — not the install default — and the dry-run path is read-only (installFile /
 * writeTier1 / reconcileOpencodeJson honour dryRun; ensureDir is dryRun-gated). The remaining
 * opt-ins (cloud) stay out of the gate, matching prior behaviour.
 * Dependency-updater files are not modules: bkit never drift-checks them.
 */
export function detectInstalledModules(cwd: string): Set<ModuleFlag> {
  const mods = new Set<ModuleFlag>(["core"]);
  if (fs.existsSync(path.join(cwd, ".claude", "agents"))) mods.add("claude");
  if (fs.existsSync(path.join(cwd, ".cursor", "agents"))) mods.add("cursor");
  if (fs.existsSync(path.join(cwd, ".opencode", "agents"))) mods.add("opencode");
  if (fs.existsSync(path.join(cwd, ".codex", "agents"))) mods.add("codex");
  // lint (#265, the --typescript toolchain): the owned slop-scan plugin. Its configs
  // (slop-scan.config.json, .prettierignore) are templates the consumer may adopt without
  // the module, so they cannot be sentinels.
  if (fs.existsSync(path.join(cwd, ".bkit", "scripts", "bkit-slop-type-suppression.mjs"))) {
    mods.add("lint");
  }
  return mods;
}

/**
 * Render a resolved module set back into valid new-surface CLI flags (#252/#265) for
 * recovery-hint text. Skips core (implicit), maps lint to --typescript and opt-ins to
 * their value-flag spellings.
 */
export function modulesToCliFlags(
  mods: Set<ModuleFlag>,
  opencodeProvider: string | null,
  cloudVariant: CloudVariant | null,
): string {
  const out: string[] = [];
  if (mods.has("claude")) out.push("--claude");
  if (mods.has("cursor")) out.push("--cursor");
  if (mods.has("opencode")) out.push(`--opencode=${opencodeProvider ?? "<provider>"}`);
  if (mods.has("codex")) out.push("--codex");
  if (mods.has("lint")) out.push("--typescript");
  if (mods.has("cloud")) out.push(`--auto=${cloudVariant ?? "<variant>"}`);
  return out.join(" ");
}

/**
 * #252 Step 2/3 — validate the verb/module-flag combination before any dispatch
 * work runs. `install` requires >=1 module flag (bare install errors; replaces
 * the old implicit empty→full); `check` / `upgrade` take NO module flags — they
 * operate on everything already installed, so a stray flag is a hard error
 * pointing at the no-flag form. Returns the error message to print, or `null`
 * when the combination is valid.
 */
export function validateModuleFlagsForVerb(
  verb: Verb,
  moduleFlags: Set<ModuleFlag>,
): string | null {
  if (verb === "install" && moduleFlags.size === 0) {
    return (
      "[bkit] `bkit install` requires at least one module flag. Name what to install: " +
      "--claude, --cursor, --codex, --opencode=<provider>, --typescript (plus opt-in " +
      "--auto=<claude|cursor>). Run `bkit help` for usage."
    );
  }
  if ((verb === "check" || verb === "upgrade") && moduleFlags.size > 0) {
    return (
      `[bkit] \`bkit ${verb}\` takes no module flags — it operates on everything already ` +
      `installed. Re-run as \`bkit ${verb}\` (no module flags). Run \`bkit help\` for usage.`
    );
  }
  return null;
}

/**
 * Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4): cloud=claude and
 * cloud=opencode both require tracker=github (both use the bkit-cloud.yml template);
 * cloud=cursor requires tracker=linear. Mismatch is a hard error — checked BEFORE
 * any package.json write so no state is recorded on mismatch ("no files written
 * on hard error" invariant). Returns the error message to print, or `null` when
 * the tracker matches (or no cloud module/variant is in play).
 */
export function validateCloudTrackerMatch(
  cloudVariant: CloudVariant | null,
  hasCloudModule: boolean,
  issueTracker: IssueTracker,
): string | null {
  if (cloudVariant === null || !hasCloudModule) return null;
  const requiredTracker: IssueTracker = cloudVariant === "cursor" ? "linear" : "github";
  if (issueTracker === requiredTracker) return null;
  return (
    `[bkit] --auto=${cloudVariant} requires tracker=${requiredTracker}, ` +
    `but the resolved tracker is "${issueTracker}". ` +
    (issueTracker === DEFAULT_ISSUE_TRACKER || issueTracker === "none"
      ? `Set the tracker first: bkit install --tracker=${requiredTracker} --auto=${cloudVariant}`
      : `Re-run with the matching tracker: bkit install --tracker=${requiredTracker} --auto=${cloudVariant} (tracker switching is free).`)
  );
}

/**
 * Detect the bkit opencode provider key a consumer installed.
 *
 * Resolution order:
 *  1. `package.json` `bkit.opencodeProvider` — the authoritative record written on install.
 *     This is the ONLY signal for managed-auth gateways (opencode) whose opencode.json carries no
 *     custom provider block; without it upgrade would re-render the provider as the install default.
 *  2. `.opencode/opencode.json` first provider key — back-compat for installs that predate the
 *     manifest field (the block is keyed by provider id, matching renderOpencodeJson).
 *  3. null — caller falls back to the install default so the model lookup still resolves.
 *
 * The manifest value is validated against the allowlist so a hand-edited package.json cannot
 * smuggle an unsupported provider into the render path.
 */
export function detectOpencodeProvider(cwd: string): string | null {
  const pkgPath = path.join(cwd, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
        bkit?: { opencodeProvider?: unknown };
      };
      const rawStored = pkg.bkit?.opencodeProvider;
      // Normalize legacy keys (e.g. "zen" → "opencode") before allowlist check.
      const stored =
        typeof rawStored === "string" ? normalizeOpencodeProvider(rawStored) : rawStored;
      if (
        typeof stored === "string" &&
        (OPENCODE_PROVIDERS as readonly string[]).includes(stored)
      ) {
        return stored;
      }
    } catch {
      // unparseable package.json — fall through to opencode.json detection
    }
  }
  const jsonPath = path.join(cwd, ".opencode", "opencode.json");
  if (!fs.existsSync(jsonPath)) return null;
  try {
    const cfg = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as {
      provider?: Record<string, unknown>;
    };
    if (cfg.provider && typeof cfg.provider === "object") {
      const first = Object.keys(cfg.provider)[0];
      if (!first) return null;
      // Zen's opencode.json block is keyed by the built-in id `opencode`, not the CLI key.
      return normalizeOpencodeProvider(first === "opencode" ? "opencode-zen" : first);
    }
  } catch {
    return null; // unparseable opencode.json — fall back to the default provider
  }
  return null;
}

/**
 * Returns all bkit-installed opencode providers from the consumer package.json.
 * Reads `bkit.opencodeProviders` array; falls back to `[bkit.opencodeProvider]` for
 * legacy single-provider installs (migrated on the next install run).
 * Filters to valid OPENCODE_PROVIDERS entries; returns [] when neither field exists.
 */
export function detectOpencodeProviders(cwd: string): string[] {
  const pkgPath = path.join(cwd, "package.json");
  if (!fs.existsSync(pkgPath)) return [];
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as {
      bkit?: { opencodeProviders?: unknown; opencodeProvider?: unknown };
    };
    const arr = pkg.bkit?.opencodeProviders;
    if (Array.isArray(arr)) {
      return arr
        .filter((v): v is string => typeof v === "string")
        .map((v) => normalizeOpencodeProvider(v)) // migrate legacy keys (e.g. "zen" → "opencode")
        .filter((v) => (OPENCODE_PROVIDERS as readonly string[]).includes(v));
    }
    // Legacy fallback: call detectOpencodeProvider which checks both package.json and opencode.json
    const single = detectOpencodeProvider(cwd);
    if (single !== null) {
      return [single];
    }
  } catch {
    // unparseable — return empty
  }
  return [];
}

/**
 * Resolve the newest published @cbartens/bkit version from the registry for
 * `bkit upgrade --latest`. Shells out to `pnpm view` (honours the consumer's
 * registry auth). Hard-exits with guidance on failure — the caller has nothing
 * to fall back to.
 */
async function resolveLatestPublishedVersion(cwd: string): Promise<string> {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync("pnpm", ["view", "@cbartens/bkit", "version"], { cwd, encoding: "utf-8" });
  if (r.status !== 0 || !r.stdout || !r.stdout.trim()) {
    console.error(
      `${LOG_PREFIX} could not resolve the latest @cbartens/bkit version from the registry ` +
        `(pnpm view exit ${r.status ?? "null"}). Ensure GitHub Packages read auth (BKIT_GH_TOKEN_INSTALL, ` +
        `classic PAT, read:packages), or pin a version with --to=<version>.`,
    );
    process.exit(1);
  }
  return r.stdout.trim();
}

/**
 * Atomic self-bump for `bkit upgrade --to=<v>` / `--latest`: install the target
 * @cbartens/bkit, then RE-EXEC the freshly-installed binary so the NEW code does
 * the render + re-pin (this process is still the OLD code — rendering new
 * templates with old logic would be a correctness hole). Coupling the package
 * bump and the re-render in one command is the point: it is impossible to bump
 * the package and forget the re-render, which is what strands a base branch's
 * mirrors (#256) for every feature branch to inherit.
 *
 * Returns true when it handled the run (bumped + re-exec'd, or dry-run reported a
 * bump) → the caller should return. Returns false when already at target → the
 * caller falls through to a normal in-place re-render.
 */
async function runSelfBump(flags: UpgradeFlags, cwd: string): Promise<boolean> {
  const installed = getInstallingVersion();
  // --latest needs async registry resolution, but planSelfBump's injected resolver
  // is sync; resolve the latest first (only when asked), then feed it a constant.
  const latestVersion = flags.latest ? await resolveLatestPublishedVersion(cwd) : "";
  const resolvedPlan = planSelfBump(
    installed,
    { toVersion: flags.toVersion, latest: flags.latest },
    () => latestVersion,
  );

  if (resolvedPlan.kind === "invalid") {
    console.error(`${LOG_PREFIX} ${resolvedPlan.message}`);
    process.exit(1);
  }
  if (resolvedPlan.kind === "noop") {
    console.log(
      `${LOG_PREFIX} already at @cbartens/bkit@${resolvedPlan.target} — re-rendering in place at the installed version.`,
    );
    return false; // fall through to the normal upgrade path
  }

  // resolvedPlan.kind === "bump"
  //
  // In a pnpm workspace ROOT, `pnpm add` refuses without -w/--workspace-root
  // (ERR_PNPM_ADDING_TO_ROOT) when bkit is a root devDependency — the standard
  // layout for a workspace consumer. Detect the workspace (pnpm-workspace.yaml at
  // cwd) and pass -w so the documented upgrade path works there. A single-package
  // repo has no pnpm-workspace.yaml and must NOT get -w (pnpm errors that -w may
  // only be used inside a workspace).
  const inWorkspaceRoot = fs.existsSync(path.join(cwd, "pnpm-workspace.yaml"));
  const addArgs = [
    "add",
    "-D",
    ...(inWorkspaceRoot ? ["-w"] : []),
    `@cbartens/bkit@${resolvedPlan.target}`,
  ];
  const addCmd = `pnpm ${addArgs.join(" ")}`;
  if (flags.dryRun) {
    console.log(
      `${LOG_PREFIX} [dry-run] would bump @cbartens/bkit ${installed} -> ${resolvedPlan.target} ` +
        `(${addCmd}), then re-render + re-pin via the ` +
        `freshly-installed binary. No changes made.`,
    );
    return true;
  }

  const { spawnSync } = await import("node:child_process");
  console.log(`${LOG_PREFIX} bumping @cbartens/bkit ${installed} -> ${resolvedPlan.target} ...`);
  const add = spawnSync("pnpm", addArgs, {
    cwd,
    stdio: "inherit",
  });
  if (add.status !== 0) {
    console.error(
      `${LOG_PREFIX} \`${addCmd}\` failed (exit ${add.status ?? "null"}). ` +
        `Most common cause: GitHub Packages auth — set BKIT_GH_TOKEN_INSTALL (classic PAT, read:packages). Nothing re-rendered.`,
    );
    process.exit(1);
  }

  // Re-exec the just-installed (NEW) bkit so IT renders + re-pins, not this old process.
  console.log(`${LOG_PREFIX} re-rendering with @cbartens/bkit@${resolvedPlan.target} ...`);
  const reArgs = ["exec", "bkit", "upgrade"];
  if (flags.nonInteractive) reArgs.push("--auto-apply");
  const re = spawnSync("pnpm", reArgs, { cwd, stdio: "inherit" });
  process.exit(re.status ?? 1);
}

// Not exported: this is the CLI entrypoint, driven by real argv/fs/process.exit
// side effects, and its ~70 spawn-based scenarios in bkit-install.integration.test.ts
// are what actually exercise it (v8 in-process coverage can't see a child process —
// see docs/testing.md § Coverage on PRs, bkit-tests-unit). Pull genuinely pure
// decision logic OUT into an exported function (see validateModuleFlagsForVerb /
// validateCloudTrackerMatch above) when you want it unit-covered here instead.
async function main() {
  const commandExit = await runCommand(process.argv.slice(2), COMMANDS, {
    classicVerbs: CLASSIC_VERBS,
  });
  if (commandExit !== null) {
    process.exitCode = commandExit;
    return;
  }

  const {
    verb,
    modules,
    moduleFlags,
    uninstallFlags,
    upgradeFlags,
    tracker,
    cloudVariant,
    opencodeProvider,
    complyPhase,
    telemetrySubverb,
    telemetryMigrateFlags,
  } = parseArgs(process.argv.slice(2));

  // A bare `bkit` (no arguments) means no command was given: print usage and exit non-zero
  // (2 = usage error), distinct from an explicit `bkit help` / `--help` (verb "help"), which
  // prints the same usage and exits 0. parseArgs still defaults no-args to the "help" verb.
  if (process.argv.slice(2).length === 0) {
    printUsage();
    process.exit(2);
  }

  if (verb === "help") {
    printUsage();
    return;
  }

  // comply — compliance grader (advisory, never gating, fail-open).
  // Runs `runGrader` over `git diff parentSha..HEAD`, appends `kind:"compliance"`
  // rows to `.bkit/stats.jsonl`, and logs violations.  Always exits 0 (fail-open);
  // callers MUST use the pinned idiom:
  //   `pnpm bkit comply --phase=<phase> || echo "[bkit-comply] grader unavailable, skipping"`
  // See DE-34 for the shared-entrypoint + crash-isolation contract.
  if (verb === "comply") {
    try {
      const cwd = process.cwd();
      const phase = complyPhase ?? "unknown";
      const logPrefix = "[bkit-comply]";

      // parentSha MUST be a resolved hex SHA, for two reasons:
      //   1. diffPaths guards on /^[0-9a-f]{7,40}$/ and returns [] otherwise — so an
      //      unresolved rev makes every diff-based rule grade an EMPTY diff and pass
      //      vacuously. It logs, but the row is still written and still says "pass".
      //   2. parentSha is in identity() for compliance, so an unresolved literal is
      //      the SAME identity on every run — successive runs fold into one another
      //      and the history silently collapses.
      //
      // The previous code scanned .bkit/stats.jsonl for "the most recent
      // workflow-started row that carried a parentSha". That row does not exist
      // there: `workflow-started` is a status.jsonl EVENT TYPE, while stats.jsonl
      // holds compliance/outcome/counter — and of those, only compliance and counter
      // carry parentSha, both of which the loop explicitly skipped. So the loop could
      // never match, the literal "HEAD~1" always won, and every compliance row bkit
      // has ever written records parentSha "HEAD~1" against an empty diff.
      const statsPath = path.join(cwd, ".bkit", "stats.jsonl");
      const parentSha = resolveGitSha("HEAD~1", cwd) || resolveGitSha("HEAD", cwd);
      if (!parentSha) {
        console.log(`${logPrefix} cannot resolve a parent SHA (no commits?) — skipping grade`);
        return;
      }

      console.log(
        `${logPrefix} Running compliance grader (phase=${phase}, parentSha=${parentSha})`,
      );

      const violations = runGrader({ parentSha, phase, cwd });

      // Resolve repo slug from package.json (best-effort).
      let repo = "unknown";
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8")) as {
          name?: string;
          bkit?: { repoSlug?: string };
        };
        repo = pkg.bkit?.repoSlug ?? pkg.name ?? "unknown";
      } catch {
        // package.json absent/unparseable
      }

      const bkitVersion = readBkitVersion(cwd);

      const rows = buildComplianceRows({ violations, phase, parentSha, repo, bkitVersion });
      appendComplianceRows(rows, statsPath);

      if (violations.length > 0) {
        const summary = formatComplianceSummary(violations);
        console.log(`${logPrefix} Compliance violations found:\n${summary}`);
      } else {
        console.log(`${logPrefix} All rules pass.`);
      }

      console.log(
        `${logPrefix} Appended ${rows.length} compliance row(s) to .bkit/stats.jsonl (advisory — not gating).`,
      );
    } catch (err: unknown) {
      // Fail-open: any unexpected error in the dispatch body must not gate the workflow.
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[bkit-comply] grader error (fail-open): ${msg}`);
    }
    // Always exit 0 — the comply verb is advisory and must never block.
    return;
  }

  // harvest — cross-repo harvest CLI (WS-4, #234 #233 #343).
  // Copies consumer .bkit/stats.jsonl and MOVES .bkit/friction.jsonl into harvest/;
  // COUNT-ONLY for docs/{deferrals,failures}.jsonl. Friction rows are pruned from the
  // consumer only after they are fsync'd + read back from the store. Fail-open: exits 0.
  // See DE-34 for the shared-entrypoint + crash-isolation contract.
  if (verb === "harvest") {
    try {
      const { runHarvest, HARVEST_DEST_DIR } = await import("./bkit-harvest.js");
      const cwd = process.cwd();
      console.log("[bkit-harvest] Starting cross-repo harvest...");
      const result = runHarvest(cwd);
      console.log(
        `[bkit-harvest] Harvest complete — consumers: ${result.consumers.length}, rows copied: ${result.totalCopiedRows}, entities after fold: ${result.dedupedRows}, pruned from consumers: ${result.totalPrunedRows}`,
      );
      const countOnlyEntries = Object.entries(result.totalCountOnly);
      if (countOnlyEntries.length > 0) {
        for (const [file, count] of countOnlyEntries) {
          console.log(`[bkit-harvest] count-only ${file}: ${count} rows (not copied)`);
        }
      }
      if (result.totalPrunedRows > 0) {
        console.log(
          `[bkit-harvest] ${result.totalPrunedRows} friction row(s) were REMOVED from consumers and now exist only in ${HARVEST_DEST_DIR}/ — commit it.`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[bkit-harvest] harvest error (fail-open): ${msg}`);
    }
    return;
  }

  // analysis — cross-repo analysis CLI (WS-4, #234 #183).
  // Reports counts/rates/elapsed-time, #183 size↔outcome regression, per-rule compliance
  // rate, dispatch-size threshold, counterSource trust labelling. Advisory + inform-only.
  // See DE-34 for the shared-entrypoint + crash-isolation contract.
  if (verb === "analysis") {
    try {
      const { runAnalysis } = await import("./bkit-analysis.js");
      const { HARVEST_DEST_DIR } = await import("./bkit-harvest.js");
      const cwd = process.cwd();
      // Analyse: bkit's own stats.jsonl + harvested consumer rows.
      // Harvest dest is sourced from the constant, NOT re-spelled here — these paths
      // silently found nothing when the dir moved out of .bkit/ (#343).
      const statsPath = path.join(cwd, ".bkit", "stats.jsonl");
      const harvestStatsPath = path.join(cwd, HARVEST_DEST_DIR, "stats.jsonl");
      const harvestFrictionPath = path.join(cwd, HARVEST_DEST_DIR, "friction.jsonl");
      const frictionPath = path.join(cwd, ".bkit", "friction.jsonl");
      // deferrals is LOCAL-only: harvest takes it count-only (prose never leaves the
      // consumer), so the discipline rate is this repo's own writers, not a fleet view.
      const deferralsPath = path.join(cwd, "docs", "deferrals.jsonl");
      const paths = [
        statsPath,
        harvestStatsPath,
        harvestFrictionPath,
        frictionPath,
        deferralsPath,
      ].filter((p) => fs.existsSync(p));
      if (paths.length === 0) {
        console.log(
          "[bkit-analysis] No telemetry files found. Run `bkit harvest` first, or accumulate telemetry via bkit workflows.",
        );
        return;
      }
      const report = runAnalysis(paths);
      for (const line of report.reportLines) {
        console.log(line);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[bkit-analysis] analysis error (fail-open): ${msg}`);
    }
    return;
  }

  // telemetry — sub-verb dispatcher (WS-5, #234).
  // `bkit telemetry migrate` ports docs/knowledge.md + docs/decisions.md to .jsonl.
  // Destructive (parity-gated) and NEVER reachable from `bkit upgrade` — see DE-39.
  // Advisory: exits 0 on failure after printing error (fail-open pattern).
  if (verb === "telemetry") {
    try {
      const { runMigrate } = await import("./bkit-telemetry-migrate.js");
      // `bkit telemetry summary [--phase <workflow>]` — THE telemetry summary, for
      // every workflow's close step. Previously each of the five workflows carried
      // its own bash version, and each was wrong: `grep -c … || echo 0` printed
      // "0\n0" whenever nothing was malformed (grep exits 1 on zero matches), and
      // `jq '.bkitVersion // "unknown"'` bucketed empty versions under an empty key
      // because `//` substitutes only on null/false. One implementation, one answer.
      if (telemetrySubverb === "summary") {
        const { foldFrom, workflowTelemetry } = await import("./bkit-telemetry.js");
        const statsPath = path.join(process.cwd(), ".bkit", "stats.jsonl");
        if (!fs.existsSync(statsPath)) {
          console.log("[bkit-telemetry] stats.jsonl not found — no telemetry rows yet");
          return;
        }
        const summary = workflowTelemetry(foldFrom([statsPath]), complyPhase ?? undefined);
        for (const line of summary.lines) console.log(line);
        return;
      }
      // `bkit telemetry validate` — read-only alias-collision scan. Exits 1 on a
      // collision (one DE-<n>/KN-<n> claimed by unrelated rows) — the loud signal
      // the merge=union append never surfaces. WARNs (exit 0) on minted keys.
      if (telemetrySubverb === "validate") {
        const { lintLedgers } = await import("./bkit-telemetry-lint.js");
        const result = lintLedgers(process.cwd());
        for (const line of result.lines) console.log(line);
        if (!result.ok) process.exitCode = 1;
        return;
      }
      // `bkit telemetry normalise [--dry-run]` — one-shot, idempotent rewrite off
      // the retired sequential-alias scheme (parity-gated; original untouched on abort).
      if (telemetrySubverb === "normalise") {
        const { runNormalise } = await import("./bkit-telemetry-normalise.js");
        const result = await runNormalise({
          cwd: process.cwd(),
          dryRun: telemetryMigrateFlags.dryRun,
        });
        for (const line of result.lines) console.log(line);
        if (!result.ok && result.error) {
          console.error(`[bkit-telemetry] normalise failed: ${result.error}`);
          process.exitCode = 1;
        }
        return;
      }
      if (telemetrySubverb === "migrate") {
        const pkgPath = path.join(process.cwd(), "package.json");
        let bkitVersion = "unknown";
        if (fs.existsSync(pkgPath)) {
          try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
            if (typeof pkg["version"] === "string") bkitVersion = pkg["version"] as string;
          } catch {
            // ignore
          }
        }
        const result = await runMigrate({
          cwd: process.cwd(),
          bkitVersion,
          dryRun: telemetryMigrateFlags.dryRun,
        });
        for (const line of result.lines) {
          console.log(line);
        }
        if (!result.ok && result.error) {
          console.error(`[bkit-telemetry] migrate failed: ${result.error}`);
        }
      } else {
        console.error(
          `[bkit] \`bkit telemetry\` requires a sub-verb. Valid values: migrate, summary, validate, normalise`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[bkit-telemetry] internal error (fail-open): ${msg}`);
    }
    return;
  }

  // Launcher verbs — exec the GUI app binary with .bkit/.env merged into the env
  // so that MCP token placeholders (BKIT_GH_TOKEN, BKIT_OPENCODE_API_KEY, …) resolve correctly
  // even when launched from the Dock/Finder (macOS GUI-isolation #279/#280).
  if (verb === "cursor" || verb === "opencode") {
    await launchApp(verb, process.cwd());
    return;
  }

  // #252 Step 2/3 — install requires >=1 module flag; check/upgrade take NONE.
  // See validateModuleFlagsForVerb for the full rationale.
  const moduleFlagsError = validateModuleFlagsForVerb(verb, moduleFlags);
  if (moduleFlagsError) {
    console.error(moduleFlagsError);
    process.exit(1);
  }

  if (verb === "doctor") {
    LOG_PREFIX = "[bkit-doctor]";
    console.log(`${LOG_PREFIX} Running advisory scan (no managed-file writes)`);
    console.log(`${LOG_PREFIX} Templates root: ${getTemplatesRoot()}`);
    const { blockers, advisories: preflightAdvisories } = runPreflight(modules, process.cwd());
    const allFindings = runPostInstallCheck(
      [...preflightAdvisories, ...blockers],
      modules,
      process.cwd(),
    );
    // #435 broken-install case: the opencode host is on disk but neither provider signal
    // survives. `bkit check` and `bkit upgrade` both exit 1 with the fix; doctor — the verb
    // whose help advertises diagnosing config drift — printed four opencode lines and never
    // mentioned it. Reported here (enforcement stays with check, which is the gating verb).
    if (fs.existsSync(path.join(process.cwd(), ".opencode"))) {
      if (detectOpencodeProvider(process.cwd()) === null) {
        allFindings.push({
          id: "opencode-provider-missing",
          severity: "blocker",
          detect:
            "`.opencode/` is present but no provider is recorded — neither package.json `bkit.opencodeProvider` nor an `opencode.json` provider block.",
          action: `Re-run \`bkit install --opencode=<provider>\` (${OPENCODE_PROVIDERS.join(", ")}). Until then \`bkit check\` and \`bkit upgrade\` exit 1 rather than render every agent pin against a substitute provider.`,
        });
      }
    }

    const banner = formatChecklist(allFindings);
    if (banner) {
      console.log(banner);
    } else {
      console.log(`${LOG_PREFIX} No advisories found.`);
    }
    writeAdvisoriesArtifact(allFindings, {
      cwd: process.cwd(),
      mode: "doctor",
      version: getInstallingVersion(),
      logPrefix: LOG_PREFIX,
    });

    // opencode host diagnostics: report required tools and cred presence per provider.
    // Never echoes key values — only reports present/absent.
    const opencodeDir = path.join(process.cwd(), ".opencode");
    const opencodeJsonPath = path.join(opencodeDir, "opencode.json");
    if (fs.existsSync(opencodeDir) || modules.has("opencode")) {
      console.log(`${LOG_PREFIX} --- opencode host diagnostics ---`);
      // Check opencode binary
      const { spawnSync: spawnSyncLocal } = await import("node:child_process");
      const whichResult = spawnSyncLocal("which", ["opencode"], { encoding: "utf-8" });
      const opencodeInstalled = whichResult.status === 0 && whichResult.stdout.trim().length > 0;
      console.log(
        `${LOG_PREFIX} opencode binary: ${opencodeInstalled ? "FOUND (" + whichResult.stdout.trim() + ")" : "NOT FOUND (install opencode first)"}`,
      );

      // Resolve provider: manifest-first (detectOpencodeProvider) so managed-auth gateways
      // (opencode — no provider block beyond the minimal apiKey entry) are still detected;
      // the `--opencode=` flag, if given this run, overrides.
      let detectedProvider: string | null = detectOpencodeProvider(process.cwd());
      if (opencodeProvider) detectedProvider = opencodeProvider;

      // Multi-provider: get all installed providers (Task 5 / #281).
      // If bkit.opencodeProviders is populated, use it; otherwise fall back to the
      // single detected provider for backward compat with legacy single-provider installs.
      const allProviders = detectOpencodeProviders(process.cwd());
      const activeProvider = detectedProvider ?? allProviders[0] ?? null;
      const providersToCheck =
        allProviders.length > 0 ? allProviders : activeProvider ? [activeProvider] : [];

      // Per-provider cred check (present/absent only — no value echoed).
      // Every provider names one API key. Any provider absent here falls back to
      // `BKIT_${PROVIDER}_API_KEY` (see below).
      const PROVIDER_KEYS: Record<string, string[]> = {
        openrouter: ["BKIT_OPENROUTER_API_KEY"],
        ollama: ["BKIT_OLLAMA_API_KEY"], // Ollama cloud endpoint (ollama.com)
        "opencode-zen": ["BKIT_OPENCODE_API_KEY"], // opencode-native gateway (Zen; https://opencode.ai/zen/v1)
        "opencode-go": ["BKIT_OPENCODE_API_KEY"], // opencode-native gateway (Go; https://opencode.ai/zen/go/v1)
      };

      if (providersToCheck.length === 0) {
        console.log(
          `${LOG_PREFIX} Provider not detected — run \`bkit install --opencode=<provider>\` first`,
        );
      } else {
        for (const provider of providersToCheck) {
          const roleLabel = provider === activeProvider ? "(active)" : "(installed)";
          console.log(`${LOG_PREFIX} --- ${provider} ${roleLabel} ---`);
          const keys = PROVIDER_KEYS[provider] ?? [`BKIT_${provider.toUpperCase()}_API_KEY`];
          for (const key of keys) {
            const present = Boolean(process.env[key] && process.env[key]!.trim().length > 0);
            console.log(
              `${LOG_PREFIX} ${key}: ${present ? "PRESENT" : "ABSENT (required for provider " + provider + ")"}`,
            );
          }
        }
      }
    }

    // GUI-isolation check: flag any .bkit/.env keys that are set (non-empty) in the
    // file but absent or empty in process.env. This happens when the app was launched
    // via Dock/Finder (launchd) rather than from a direnv-active terminal — the env
    // vars never make it into the process. Pointing at `bkit cursor` / `bkit opencode`
    // is the actionable fix. (#279/#280)
    const bkitEnvPath = path.join(process.cwd(), ".bkit", ".env");
    if (fs.existsSync(bkitEnvPath)) {
      const fileVars = new Map(parseDotenv(fs.readFileSync(bkitEnvPath, "utf-8")));
      const guiMissing: string[] = [];
      for (const [key, value] of fileVars) {
        if (!value || value.trim() === "") continue; // skip blank placeholders
        const inProcess = process.env[key] && process.env[key]!.trim().length > 0;
        if (!inProcess) guiMissing.push(key);
      }
      if (guiMissing.length > 0) {
        console.log(
          `${LOG_PREFIX} --- GUI-isolation advisory ---\n` +
            `${LOG_PREFIX} The following keys are set in .bkit/.env but are NOT present in this\n` +
            `${LOG_PREFIX} process environment (GUI apps launched from Dock/Finder do not\n` +
            `${LOG_PREFIX} inherit the login shell / direnv env):\n` +
            guiMissing.map((k) => `${LOG_PREFIX}   ${k}`).join("\n") +
            "\n" +
            `${LOG_PREFIX} Fix: launch the app via \`bkit cursor\` or \`bkit opencode\` — these\n` +
            `${LOG_PREFIX} verbs exec the binary directly with .bkit/.env merged in.`,
        );
      } else {
        const nonBlankCount = [...fileVars.values()].filter((v) => v.trim() !== "").length;
        if (nonBlankCount > 0) {
          console.log(
            `${LOG_PREFIX} GUI-isolation: all .bkit/.env keys are present in this process env (OK)`,
          );
        }
      }
    }

    return;
  }

  if (verb === "status") {
    LOG_PREFIX = "[bkit-status]";
    runStatus(process.cwd(), LOG_PREFIX);
    return;
  }

  if (verb === "upgrade") {
    LOG_PREFIX = "[bkit-upgrade]";

    // --to=<version> / --latest: atomic self-bump. Install the target package,
    // then re-exec the freshly-installed binary to render + re-pin (this process
    // is the OLD code). When a bump happens (or a dry-run reports one) runSelfBump
    // handles the whole run; when already at target it returns false and we fall
    // through to a normal in-place re-render.
    if (upgradeFlags.toVersion !== null || upgradeFlags.latest) {
      const handled = await runSelfBump(upgradeFlags, process.cwd());
      if (handled) return;
    }

    console.log(
      `${LOG_PREFIX} Running upgrade${upgradeFlags.dryRun ? " (dry-run)" : ""}${upgradeFlags.nonInteractive ? " (non-interactive)" : ""}`,
    );

    // 2.5.0 migration: that release wrote `.gitattributes` to a file literally
    // named `gitattributes` (no dot), which git never reads. Rename it and drop
    // the bogus dot-less canonicalHashes key before the walk reseeds the dotted one.
    migrateStrayGitattributes(process.cwd(), upgradeFlags.dryRun);

    // docs/warnings.md → docs/noise.md rename: the doc widened from log-level
    // downgrades to every deliberate signal downgrade. Move the consumer's file
    // (their entries live below the managed block) before the walk reseeds it.
    migrateWarningsToNoise(process.cwd(), upgradeFlags.dryRun);

    // D1 orphan-removal: consumers who upgraded from a version that shipped
    // `.agents/templates/` (pre-#160 layout) now carry an orphaned directory
    // that no longer exists in the tarball. Remove it on upgrade so the
    // consumer tree stays clean. No-op when already absent (fresh consumers).
    // Dry-run aware: log only, no FS write.
    removeOrphanTemplatesDir(process.cwd(), upgradeFlags.dryRun);

    // Relocated-orphan removal: mirror sources (.agents/workflows, .agents/prompts)
    // and the bkit-authoring docs moved into `.bkit/`. Strip any copies an old-layout
    // consumer still carries. No-op when absent / in dogfood.
    runPayload(upgradeFlags.dryRun);

    // Retired bkit files: delete unedited copies, then name every edited copy and
    // every consumer CI / package.json line that still calls one.
    retireOwnedFiles(process.cwd(), {
      dryRun: upgradeFlags.dryRun,
      log: (line) => console.log(`${LOG_PREFIX} ${line}`),
    });
    const retiredBanner = formatChecklist(detectRetiredOwnedFiles(process.cwd()));
    if (retiredBanner) console.log(retiredBanner);

    // Collect bkit-managed template candidates from the package.
    // Templates live in .bkit/templates/ — walk the directory for all files.
    const tplRoot = getTemplatesRoot();

    // Manifest entry drives the per-file write strategy in runUpgrade:
    //   markered-text → block-merge, json → deep-merge (both preserve consumer
    //   content outside the managed region), byte-equal-text / unmanaged →
    //   whole-file write with drift detection.
    const entryByPath = new Map<string, ManifestEntry>();
    for (const entry of getInstallManifest()) {
      entryByPath.set(entry.path, entry);
    }

    // Opt-in module files (cloud, opencode, codex) must NEVER be force-created by
    // upgrade — they ship only via an explicit install flag. Update them when the
    // consumer has opted in (dest present).
    const optInPaths = new Set<string>();
    for (const mod of OPTIN_MODULES) {
      for (const entry of getModuleManifest(mod as ModuleName)) optInPaths.add(entry.path);
    }

    // Host/tooling modules (claude, cursor, lint) must ALSO not be force-created by upgrade —
    // post-#252 each is separately installable, so a `--claude`-only consumer must not get
    // cursor/lint files seeded on upgrade (which `check` then flags — the install↔upgrade
    // divergence). We gate them on sentinel-detected installation, exactly like `bkit check`
    // scopes its drift gate. core + unmanaged files (docs/*.md, no manifest entry) always upgrade; the opt-in
    // modules keep their dest-presence gating just below.
    const installedModules = detectInstalledModules(process.cwd());

    // Resolve the consumer's tracker so upgrade renders tracker-conditional files
    // (opencode.json, the mcp.json files) the same way install does.
    let upgradeTracker: IssueTracker = DEFAULT_ISSUE_TRACKER;
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"),
      ) as { bkit?: { issueTracker?: unknown } };
      const stored = parseIssueTracker(pkg.bkit?.issueTracker);
      if (stored !== null) upgradeTracker = stored;
    } catch {
      // package.json absent/unparseable — default tracker
    }

    // opencode.json is provider/tracker-templated on install (renderOpencodeJson resolves the
    // `@@OPENCODE_*@@` sentinels). It MUST be rendered the same way on
    // upgrade — otherwise the json deep-merge injects the raw sentinel keys into the
    // consumer's config (#245). Detect the installed provider so the render matches install.
    const OPENCODE_JSON_RELPATH = path.join(".opencode", "opencode.json");
    // Demanded only when the consumer actually has an opencode.json to re-render — a repo
    // without the host must not be failed for a provider it was never asked to choose.
    const upgradeOpencodeProvider = fs.existsSync(path.join(process.cwd(), OPENCODE_JSON_RELPATH))
      ? requireOpencodeProvider(process.cwd(), "upgrade")
      : null;

    // .mcp.json / .cursor/mcp.json: bkit owns only its tracker entry, which the walk's json
    // deep-merge cannot express. reconcileMcpJson handles them after runUpgrade, like install.
    const MCP_ROOT_RELPATH = ".mcp.json";
    const CURSOR_MCP_RELPATH = path.join(".cursor", "mcp.json");

    const candidates: UpgradeCandidate[] = [];
    if (fs.existsSync(tplRoot)) {
      const collectTemplates = (dir: string, rel: string): void => {
        for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
          const entRel = rel ? path.join(rel, ent.name) : ent.name;
          const entAbs = path.join(dir, ent.name);
          if (ent.isDirectory()) {
            collectTemplates(entAbs, entRel);
          } else if (ent.isFile()) {
            // Single shared dotfile remap (gitignore → .gitignore, npmignore → .npmignore).
            const relPath = remapTemplateDest(entRel);
            // `.claude/cloud.md` + `.cursor/cloud.md` are GENERATED output files
            // (writeClaudeCloudDoc / writeCursorCloudDoc), not templates to reconcile:
            // install/upgrade regenerate them with resolved secret values, so the raw
            // template is never a byte-match and the walk must never drift-flag or
            // overwrite them. Regenerated explicitly in the runUpgrade block below
            // (host-gated, non-dry-run).
            if (relPath === CLAUDE_CLOUD_RELPATH || relPath === CURSOR_CLOUD_RELPATH) continue;
            // Templates are never applied: upgrade refreshes the consumer's
            // `.bkit/templates/` copies instead (syncTemplateCopies below).
            if (isTemplate(relPath)) continue;
            if (relPath === MCP_ROOT_RELPATH || relPath === CURSOR_MCP_RELPATH) continue;
            // Create-if-missing files are the consumer's once written: never merged.
            if (
              CREATE_IF_MISSING_PATHS.has(relPath) &&
              fs.existsSync(path.join(process.cwd(), relPath))
            ) {
              continue;
            }
            // Skip opt-in-module files the consumer hasn't opted into (dest absent).
            if (optInPaths.has(relPath) && !fs.existsSync(path.join(process.cwd(), relPath))) {
              continue;
            }
            const entry = entryByPath.get(relPath);
            // Skip host/tooling-module files when that module is not installed — upgrade updates
            // only what the consumer opted into, never force-creating a new module. opt-ins are
            // handled by the dest-presence check above; core + entry-less files always pass.
            const ownerModule = entry?.module;
            if (
              ownerModule &&
              ownerModule !== "core" &&
              !optInPaths.has(relPath) &&
              !installedModules.has(ownerModule)
            ) {
              continue;
            }
            const contentOverride =
              relPath === OPENCODE_JSON_RELPATH && upgradeOpencodeProvider
                ? renderOpencodeJson(entAbs, upgradeTracker, upgradeOpencodeProvider, process.cwd())
                : undefined;
            candidates.push({
              relPath,
              templatePath: entAbs,
              format: entry?.format,
              contentOverride,
              noMarkerMigration: entry?.noMarkerMigration,
            });
          }
        }
      };
      collectTemplates(tplRoot, "");
    }

    // Upgrade orphan: bkit-auto.yml was renamed to bkit-cloud.yml (#245).
    // Only remove when bkit-cloud.yml is present — otherwise the old cloud workflow
    // would go with no replacement.
    const oldAutoWorkflow = path.join(process.cwd(), ".github", "workflows", "bkit-auto.yml");
    const newCloudWorkflow = path.join(process.cwd(), ".github", "workflows", "bkit-cloud.yml");
    if (fs.existsSync(oldAutoWorkflow) && fs.existsSync(newCloudWorkflow)) {
      const tag = upgradeFlags.dryRun ? "[dry-run] " : "";
      console.log(
        `${LOG_PREFIX} ${tag}upgrade: removing orphan .github/workflows/bkit-auto.yml (renamed to bkit-cloud.yml)`,
      );
      if (!upgradeFlags.dryRun) {
        fs.rmSync(oldAutoWorkflow, { force: true });
      }
    }

    // Markered-text templates managed on upgrade are token-free, but resolve real
    // tokens when possible so any future token-bearing block stays correct.
    const tokens = await resolveTokens(process.cwd()).catch(() => undefined);

    const result = runUpgrade(candidates, {
      nonInteractive: upgradeFlags.nonInteractive,
      dryRun: upgradeFlags.dryRun,
      cwd: process.cwd(),
      tokens,
    });

    // Refresh the consumer's `.bkit/templates/` copies and name what changed. The
    // list is computed before overwriting, so it is exactly the package's template
    // diff. The copies carry no hash, so nothing here feeds `.bkit/version`.
    const templateChanges = syncTemplateCopies(process.cwd(), {
      dryRun: upgradeFlags.dryRun,
      ws: { writes: [] },
    });
    const templateReport = formatTemplateChanges(templateChanges);
    if (templateReport) console.log(`${LOG_PREFIX} ${templateReport}`);

    // Task 3 (#281): re-render all installed provider blocks for upgrade.
    // The candidates walk above handles the ACTIVE provider's block via renderOpencodeJson.
    // For each ADDITIONAL installed provider, reconcile their template block into opencode.json
    // so template changes (new keys, updated placeholders) propagate to all providers' blocks.
    const OPENCODE_JSON_DST = path.join(".opencode", "opencode.json");
    if (fs.existsSync(path.join(process.cwd(), OPENCODE_JSON_DST))) {
      const allProviders = detectOpencodeProviders(process.cwd());
      const otherProviders = allProviders.filter((p) => p !== upgradeOpencodeProvider);
      if (otherProviders.length > 0) {
        const opencodeTplDir = path.join(getTemplatesRoot(), ".opencode");
        const jsonSrc = path.join(opencodeTplDir, "opencode.json");
        if (fs.existsSync(jsonSrc)) {
          const upgradeWs: WriteSet = { writes: [] };
          for (const provider of otherProviders) {
            const rendered = renderOpencodeJson(jsonSrc, upgradeTracker, provider, process.cwd());
            reconcileOpencodeJson(rendered, OPENCODE_JSON_DST, upgradeFlags.dryRun, upgradeWs);
          }
          for (const w of upgradeWs.writes) {
            console.log(
              `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: additional provider ${w.path}`,
            );
          }
        }
      }
    }

    // Auto-migrate consumer context-fetch config onto .agents/context.md. Install runs both of
    // these in runCoreModule (after ITS templates pass); upgrade is a separate render engine, so
    // mirror them here — AFTER runUpgrade (re)wrote context.md's managed block, and BEFORE
    // writeClaudeCloudDoc (so the cloud.md provision injection sees the moved blocks) and the
    // canonicalHashes refresh (so the moved files are re-hashed → drift-clean).
    //
    // #454 first: it retires .agents/config.md and renames the markers, so the #334 move below
    // appends into the file that survives, whichever hop the consumer is coming from.
    const migratedConfigMd = migrateConfigMdToContext(process.cwd(), upgradeFlags.dryRun);
    if (migratedConfigMd) console.log(`${LOG_PREFIX} ${migratedConfigMd}`);

    const migratedContextFetch = migrateContextFetchToContext(process.cwd(), upgradeFlags.dryRun);
    if (migratedContextFetch) console.log(`${LOG_PREFIX} ${migratedContextFetch}`);

    // #251: the template walk above only covers `.bkit/templates/` config. Re-render the
    // bkit-managed OUTPUT files install also produces but that are NOT templates — host
    // agents/commands (source-rendered from .bkit/prompts + .bkit/workflows), the
    // `.bkit/*.md` canonical docs (runBkitDocs) and core's package.json scripts (the
    // bkit:gate:* names, add-if-missing, and the legacy script re-point). These are bkit-owned, force-overwritten
    // output; without this a version bump ships new config but stale prompts/agents/
    // commands/docs (a consumer would have to re-run `bkit install` to get them). Only the
    // hosts the consumer installed are re-rendered (detected by their agents dir) so upgrade
    // never force-creates an opt-in host. `.bkit/prompts.md` is markered → runBkitDocs
    // block-merges it: managed block refreshed, consumer `## Model Overrides` below bkit:end
    // preserved. Docs stay single-source PACKAGE-side (#204/#219) — never relocated to templates/.
    const renderModules = detectInstalledHostModules(process.cwd());
    // Demanded only when opencode is one of the detected hosts — see requireOpencodeProvider.
    const renderProvider = renderModules.has("opencode")
      ? requireOpencodeProvider(process.cwd(), "upgrade render")
      : null;
    // Build the model lookups the SAME way the install dispatch does: DEFAULTS from the
    // package's .bkit/prompts.md § Models, consumer overrides from the consumer's installed
    // .bkit/prompts.md `## Model Overrides` (per-agent, per-provider, preserved across upgrades).
    let renderModelLookup: Map<string, string> = new Map();
    let renderOpencodeModelLookup: Map<string, string> = new Map();
    let renderCodexModelLookup: Map<string, string> = new Map();
    let renderEffortMap: EffortMap = new Map();
    const pkgPromptsMd = path.join(getBkitDocsRoot(), "prompts.md");
    const consumerPromptsMd = path.join(process.cwd(), ".bkit", "prompts.md");
    if (fs.existsSync(pkgPromptsMd)) {
      try {
        renderModelLookup = parseModelLookup(pkgPromptsMd);
      } catch {
        // Not fatal — the cursor render fails per-file if a model is missing
      }
      applyModelOverrides(renderModelLookup, "cursor", consumerPromptsMd);
      // Non-null exactly when opencode is a detected host (see renderProvider above).
      if (renderProvider) {
        try {
          renderOpencodeModelLookup = buildOpencodeModelLookup(pkgPromptsMd, renderProvider);
        } catch {
          // Not fatal — the opencode render fails per-file if a model is missing
        }
        applyModelOverrides(renderOpencodeModelLookup, renderProvider, consumerPromptsMd);
      }
      if (renderModules.has("codex")) {
        try {
          renderCodexModelLookup = buildOpencodeModelLookup(pkgPromptsMd, "openai");
        } catch {
          // Not fatal — the codex module fails per-file if a model is missing
        }
        applyModelOverrides(renderCodexModelLookup, "openai", consumerPromptsMd);
      }
      renderEffortMap = parseEffortMap(pkgPromptsMd);
    }
    const renderWs: WriteSet = { writes: [] };
    const renderCtx: ModuleContext = {
      dryRun: upgradeFlags.dryRun,
      tokens: tokens ?? { DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" },
      modelLookup: renderModelLookup,
      opencodeModelLookup: renderOpencodeModelLookup,
      codexModelLookup: renderCodexModelLookup,
      effortMap: renderEffortMap,
      opencodeProvider: renderProvider,
      advisories: [],
      ws: renderWs,
      logPrefix: LOG_PREFIX,
      postDispatch: [],
      issueTracker: upgradeTracker,
      cloudVariant: null,
      // Re-stamp every rendered agent + command at the version we are upgrading TO (#256),
      // so a clean upgrade refreshes the managed-version marker and `bkit check` stays green.
      version: getInstallingVersion(),
    };
    const rendered = renderManagedOutputs(renderModules, renderCtx);

    // MCP config: bkit's tracker entry only (reconcileMcpJson), for the hosts the consumer
    // installed — the same pass install's claude/cursor modules run. Never force-creates the
    // file for a host the consumer does not have.
    const mcpWs: WriteSet = { writes: [] };
    for (const [host, relPath] of [
      ["claude", MCP_ROOT_RELPATH],
      ["cursor", CURSOR_MCP_RELPATH],
    ] as const) {
      if (!renderModules.has(host)) continue;
      const src = path.join(tplRoot, relPath);
      if (!fs.existsSync(src)) continue;
      reconcileMcpJson(
        src,
        path.join(process.cwd(), relPath),
        upgradeTracker,
        upgradeFlags.dryRun,
        mcpWs,
      );
    }
    for (const w of mcpWs.writes) {
      console.log(
        `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${path.relative(process.cwd(), w.path)} (tracker MCP entry)`,
      );
    }

    // Regenerate `.claude/cloud.md` (excluded from the template walk above — it is a
    // generated, untracked, secret-bearing OUTPUT file). Claude-host-gated so upgrade
    // never force-creates it for a non-claude repo; non-dry-run so `bkit check` never
    // writes resolved secrets. Rotated secrets / version bumps reach the paste doc via
    // the same helper install uses (runClaudeModule). Untracked → not in canonicalHashes.
    // What enrich recorded this upgrade, threaded into the one .bkit/version writer.
    // null = not determined (dry run / no settings file) -> keep the prior record.
    let upgradeClaudeAllowDerived: readonly string[] | null = null;
    if (!upgradeFlags.dryRun && renderModules.has("claude") && tokens) {
      if (writeClaudeCloudDoc(process.cwd(), tokens)) {
        console.log(
          `${LOG_PREFIX} upgrade: .claude/cloud.md (regenerated — gitignored, holds resolved secrets)`,
        );
      }
    }

    // Same for `.cursor/cloud.md` — cursor-host-gated twin (see writeCursorCloudDoc).
    // Uses upgradeTracker so the Linear/GitHub env-var policy matches the installed
    // tracker; excluded from the template walk above for the same reason as the Claude doc.
    if (!upgradeFlags.dryRun && renderModules.has("cursor") && tokens) {
      if (writeCursorCloudDoc(process.cwd(), tokens, upgradeTracker)) {
        console.log(
          `${LOG_PREFIX} upgrade: .cursor/cloud.md (regenerated — gitignored, holds resolved secrets)`,
        );
      }
    }

    // Network allowlist + MCP allows — OpenCode from renderOpencodeJson; Claude enrich
    // below; Cursor `.cursor/allowlist.json` + `.cursor/cli.json` only when cursor
    // module installed.
    {
      const cwd = process.cwd();
      if (renderModules.has("cursor")) {
        for (const art of [
          writeNetworkAllowlistArtifact(cwd, upgradeFlags.dryRun),
          writeCursorCliPermissionsArtifact(cwd, upgradeFlags.dryRun),
        ]) {
          if (art.wrote) {
            console.log(
              `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${art.path}`,
            );
          }
        }
      }
      if (
        renderModules.has("claude") &&
        fs.existsSync(path.join(cwd, ".claude", "settings.json"))
      ) {
        const enrichWs: WriteSet = { writes: [] };
        upgradeClaudeAllowDerived = enrichClaudeSettingsAllows(
          ".claude/settings.json",
          cwd,
          upgradeFlags.dryRun,
          enrichWs,
        );
        for (const w of enrichWs.writes) {
          console.log(
            `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${w.path} (WebFetch + MCP derived allows)`,
          );
        }
        // Retired-rule prune. Upgrade does not dispatch modules, so without this the
        // install-side call never runs for `bkit upgrade --latest` — the path the
        // README points consumers at — and the row survives every upgrade.
        const prunedAsk = pruneRetiredClaudeAskRules(".claude/settings.json", upgradeFlags.dryRun, {
          writes: [],
        });
        if (prunedAsk) {
          console.log(
            `${LOG_PREFIX}${upgradeFlags.dryRun ? " [dry-run]" : ""} upgrade: ${prunedAsk}`,
          );
        }
      }
    }

    // Refresh canonicalHashes (from resulting on-disk content) AND bump pinnedVersion
    // to the version we just upgraded TO — otherwise a clean upgrade leaves the pin
    // stale and the next `bkit check` wants to write it (1 write → exit 1), failing
    // the CI drift gate (#129 §3). Called unconditionally (non-dry-run) so the pin
    // bumps even when every file was a no-op skip. The re-rendered `.bkit/*.md` docs AND
    // host agent/command mirrors land in renderWs.writes (mirrors now count toward check
    // exit), so feed those writes into canonicalHashes — keeping install/upgrade `.bkit/version`
    // parity.
    if (!upgradeFlags.dryRun) {
      const pkgVersion = JSON.parse(
        fs.readFileSync(path.join(getPkgRoot(), "package.json"), "utf-8"),
      ).version as string;
      const renderedDocPaths = renderWs.writes.map((w) =>
        path.relative(
          process.cwd(),
          path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path),
        ),
      );
      updateCanonicalHashesAfterUpgrade(
        {
          // Include the migrated docs so their post-migration on-disk hashes are
          // recorded (both migrations mutate context.md, and the #334 move also mutates
          // observability.md, AFTER runUpgrade hashed them) — else `bkit check` sees drift.
          updated: [
            ...result.updated,
            ...renderedDocPaths,
            ...mcpWs.writes.map((w) => path.relative(process.cwd(), w.path)),
            ...(migratedConfigMd || migratedContextFetch
              ? [path.join(".agents", "context.md")]
              : []),
            ...(migratedContextFetch ? [path.join("docs", "observability.md")] : []),
          ],
          skipped: result.skipped,
          skippedSeedable: result.skippedSeedable,
          conflicts: result.conflicts,
        },
        {
          dryRun: false,
          cwd: process.cwd(),
          pinnedVersion: pkgVersion,
          claudeAllowDerived: upgradeClaudeAllowDerived,
        },
      );
    }

    console.log(
      `${LOG_PREFIX} Done. updated: ${result.updated.length}, skipped: ${result.skipped.length}, conflicts: ${result.conflicts.length}, re-rendered: ${rendered.length}`,
    );

    // Non-interactive mode: exit non-zero on conflicts
    if (upgradeFlags.nonInteractive && result.conflicts.length > 0) {
      process.exit(1);
    }
    return;
  }

  if (verb === "uninstall") {
    LOG_PREFIX = "[bkit-uninstall]";

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
    const totalDeleted = result.deleted.length;
    const totalStripped = result.stripped.length;
    const totalPreserved = result.preserved.length;
    if (uninstallCtx.dryRun) {
      console.log(
        `${LOG_PREFIX} [dry-run] Would delete: ${totalDeleted}, strip: ${totalStripped}, preserve: ${totalPreserved}`,
      );
    } else {
      console.log(
        `${LOG_PREFIX} Done. Deleted: ${totalDeleted}, stripped: ${totalStripped}, preserved: ${totalPreserved}`,
      );
    }
    return;
  }

  const dryRun = verb === "check";
  if (dryRun) LOG_PREFIX = "[bkit-check]";

  if (dryRun) console.log(`${LOG_PREFIX} Running in check (dry-run) mode`);

  // #252 Step 3 — `bkit check` scopes drift detection to what is INSTALLED (detected by
  // sentinel files), not to a fixed full set. Otherwise a single-host repo would falsely
  // report the absent host's files as drift. `install` keeps its explicit resolved set.
  const effectiveModules = verb === "check" ? detectInstalledModules(process.cwd()) : modules;

  // #255 #8 — RENDER-input provider resolution. `bkit check` takes no `--opencode=` flag, so
  // the parsed `opencodeProvider` is null on the check path. Falling back to the INSTALLED
  // provider (package.json `bkit.opencodeProvider`, else the opencode.json provider block) lets
  // the opencode drift check render with the consumer's real provider instead of the
  // install default — otherwise an openrouter/opencode/… consumer reports false drift. On
  // install this is a no-op: opencode joins the module set only when `--opencode=<provider>` was
  // given (non-null), so `?? detect` never fires. The PARSED `opencodeProvider` still drives the
  // persist-to-package.json logic below (gated on `!dryRun` + a real flag), so detection never
  // leaks into what we record. (Tracker is already resolved from package.json below, so the
  // opencode mcp block — which is tracker-dependent — already renders correctly on check.)
  const renderOpencodeProvider = opencodeProvider ?? detectOpencodeProvider(process.cwd());

  // Resolve issueTracker: --tracker= flag overrides; else read bkit.issueTracker from consumer
  // package.json; else default to "none".
  // #252 S2-A: tracker switching is FREE — a `--tracker=` value always applies, whether
  // first-set or a re-set of an already-recorded tracker. The old switch guard (and its
  // `--force` override) was dropped along with install `--force`.
  // Resolved BEFORE preflight: preflight's tracker-dependent detectors must grade the tracker
  // this run INSTALLS, not the one on disk from the previous run. Read-only — no writes here.
  let issueTracker: IssueTracker = DEFAULT_ISSUE_TRACKER;
  {
    const consumerPkgPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(consumerPkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(consumerPkgPath, "utf-8")) as Record<
          string,
          unknown
        >;
        const bkitField = pkg.bkit as Record<string, unknown> | undefined;
        const stored = parseIssueTracker(bkitField?.issueTracker);
        if (stored !== null) issueTracker = stored;
      } catch {
        // non-fatal — keep default
      }
    }
    if (tracker !== null) issueTracker = tracker;
  }

  // --- Phase 1: Preflight (read-only, before any writes) ---
  // Must run BEFORE resolveTokens to short-circuit cleanly on blockers.
  const { blockers, advisories: preflightAdvisories } = runPreflight(
    effectiveModules,
    process.cwd(),
    undefined,
    issueTracker,
  );
  if (blockers.length > 0) {
    console.log(`${LOG_PREFIX} Preflight blockers detected — aborting.`);
    const blockerBanner = formatChecklist(blockers);
    if (blockerBanner) console.log(blockerBanner);
    process.exit(1);
  }

  // Resolve tokens once for the whole install
  const tokens = await resolveTokens(process.cwd()).catch((err: unknown) => {
    console.error(`${LOG_PREFIX} Token resolution failed: ${(err as Error).message}`);
    process.exit(1);
  });

  // Parse model lookup (needed for cursor transforms).
  // DEFAULTS come from the PACKAGE's .bkit/prompts.md § Models (authoritative, matches the
  // prompt files about to be installed — avoids a mid-install hard-fail in applyT3).
  // OVERRIDES come from the CONSUMER's installed .bkit/prompts.md `## Model Overrides`
  // section (below `bkit:end`) — per-agent, per-provider, preserved across upgrades.
  let modelLookup: Map<string, string> = new Map();
  let opencodeModelLookup: Map<string, string> = new Map();
  let codexModelLookup: Map<string, string> = new Map();
  let effortMap: EffortMap = new Map();
  const promptsMdPath = path.join(getBkitDocsRoot(), "prompts.md");
  const consumerPromptsMdPath = path.join(process.cwd(), ".bkit", "prompts.md");
  if (fs.existsSync(promptsMdPath)) {
    try {
      modelLookup = parseModelLookup(promptsMdPath);
    } catch {
      // Not fatal — cursor module will fail per-file if a model is missing
    }
    // Consumer overrides merge after the base parse — parseModelOverrides is internally
    // guarded (returns [] when the file/section is absent), so it needs no catch here.
    applyModelOverrides(modelLookup, "cursor", consumerPromptsMdPath);
    if (effectiveModules.has("opencode")) {
      // On install `--opencode=<provider>` already set this; on check it comes from what the
      // consumer installed. Either way the opencode host cannot render without a real one.
      const provider =
        renderOpencodeProvider ?? requireOpencodeProvider(process.cwd(), "opencode render");
      try {
        opencodeModelLookup = buildOpencodeModelLookup(promptsMdPath, provider);
      } catch {
        // Not fatal — opencode module will fail per-file if a model is missing
      }
      applyModelOverrides(opencodeModelLookup, provider, consumerPromptsMdPath);
    }
    if (effectiveModules.has("codex")) {
      // Codex is nullary — one gateway (`openai`), so there is nothing to detect.
      try {
        codexModelLookup = buildOpencodeModelLookup(promptsMdPath, "openai");
      } catch {
        // Not fatal — codex module will fail per-file if a model is missing
      }
      applyModelOverrides(codexModelLookup, "openai", consumerPromptsMdPath);
    }
    effortMap = parseEffortMap(promptsMdPath);
  }

  // Seed preflight advisories into ctx so modules can accumulate into the same list.
  const advisories: import("./bkit-preflight.js").PreflightFinding[] = [...preflightAdvisories];
  const ws: WriteSet = { writes: [] };
  const postDispatch: Array<() => void> = [];

  // Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4) — see
  // validateCloudTrackerMatch for the full rationale. Checked BEFORE any
  // package.json write so no state is recorded on mismatch.
  const cloudTrackerError = validateCloudTrackerMatch(
    cloudVariant,
    modules.has("cloud"),
    issueTracker,
  );
  if (cloudTrackerError) {
    console.error(cloudTrackerError);
    process.exit(1);
  }
  if (cloudVariant !== null && modules.has("cloud")) {
    // auto=opencode additionally requires the local opencode host to be installed first
    // (the cloud job runs against the committed .opencode/ — no model is hard-coded in YAML).
    if (cloudVariant === "opencode" && !fs.existsSync(path.join(process.cwd(), ".opencode"))) {
      console.error(
        `[bkit] --auto=opencode requires the local opencode host to be installed first.\n` +
          `Run: bkit install --opencode=<provider>  (e.g. --opencode=opencode-zen)\n` +
          `The cloud opencode job runs against the committed .opencode/ config — without it there is nothing to run.`,
      );
      process.exit(1);
    }
  }

  // Persist bkit manifest fields to consumer package.json AFTER all hard-error gates pass.
  // This preserves the "no files written on mismatch" invariant. Two fields are recorded:
  //   - issueTracker: when a `--tracker=` value was given this run.
  //   - opencodeProvider: when an `--opencode=<provider>` value was given this run. This is
  //     the authoritative provider record detectOpencodeProvider reads on upgrade — REQUIRED
  //     for managed-auth gateways (opencode), whose opencode.json carries no provider block to
  //     detect from. Both are merged in one read-modify-write to avoid double-writing.
  const persistTracker = tracker !== null;
  const persistProvider = opencodeProvider !== null && effectiveModules.has("opencode");
  if ((persistTracker || persistProvider) && !dryRun) {
    const consumerPkgPath2 = path.join(process.cwd(), "package.json");
    if (fs.existsSync(consumerPkgPath2)) {
      try {
        const raw = fs.readFileSync(consumerPkgPath2, "utf-8");
        const pkg = JSON.parse(raw) as Record<string, unknown>;
        const bkit = (pkg.bkit ?? {}) as Record<string, unknown>;
        if (persistTracker) bkit.issueTracker = tracker;
        if (persistProvider) {
          // Save legacy single-string value BEFORE overwriting
          const prevProvider =
            typeof bkit.opencodeProvider === "string" ? bkit.opencodeProvider : null;
          bkit.opencodeProvider = opencodeProvider; // active (drives agent frontmatter)
          // Update providers array (deduped). Migrate: if only legacy string existed, seed array.
          const existingArr: string[] = Array.isArray(bkit.opencodeProviders)
            ? [...(bkit.opencodeProviders as string[])]
            : prevProvider && (OPENCODE_PROVIDERS as readonly string[]).includes(prevProvider)
              ? [prevProvider]
              : [];
          if (!existingArr.includes(opencodeProvider!)) {
            existingArr.push(opencodeProvider!);
          }
          bkit.opencodeProviders = existingArr;
        }
        pkg.bkit = bkit;
        const indentMatch = raw.match(/\n([ \t]+)"/);
        const indent = indentMatch ? indentMatch[1] : "  ";
        const trailingNewline = raw.endsWith("\n") ? "\n" : "";
        fs.writeFileSync(
          consumerPkgPath2,
          JSON.stringify(pkg, null, indent) + trailingNewline,
          "utf-8",
        );
        if (persistTracker) {
          console.log(`${LOG_PREFIX} Set bkit.issueTracker = "${tracker}" in package.json`);
        }
        if (persistProvider) {
          console.log(
            `${LOG_PREFIX} Set bkit.opencodeProvider = "${opencodeProvider}" and updated bkit.opencodeProviders in package.json`,
          );
        }
      } catch {
        // non-fatal
      }
    }
  }

  const ctx: ModuleContext = {
    dryRun,
    tokens,
    modelLookup,
    opencodeModelLookup,
    codexModelLookup,
    effortMap,
    opencodeProvider: renderOpencodeProvider,
    advisories,
    ws,
    logPrefix: LOG_PREFIX,
    postDispatch,
    issueTracker,
    cloudVariant,
    // Stamped into every rendered agent + command as the managed-version marker (#256).
    version: getInstallingVersion(),
  };

  // --- Phase 2: Install (current behaviour — dispatch modules) ---
  // check dispatches the detected installed set; install dispatches the resolved set.
  //
  // `.bkit-staging/` is a per-run scratch area for rendered files (e.g. opencode.json) — NOT a
  // cross-module commit/rollback transaction. Module fns write directly to their consumer
  // destinations, so a mid-dispatch failure can leave files already written (postDispatch — the
  // `.bkit/version` pin — does not run). We surface the error rather than swallow it, and always
  // clean up the scratch dir. `bkit install` is idempotent, so re-running completes a partial
  // install. (#255 P1-5 — see README § Install staging directory.)
  try {
    dispatchModules(effectiveModules, ctx);
  } finally {
    discardAllStaging();
  }

  const totalWrites = ws.writes.length;

  // Done banner first so the line count is easy to find above the checklist.
  // For check, "would occur" makes intent explicit; for install, writes already happened.
  if (dryRun) {
    console.log(`${LOG_PREFIX} ${totalWrites} write(s) would occur.`);
  } else {
    console.log(`${LOG_PREFIX} Done. ${totalWrites} write(s).`);
  }

  // --- Phase 3: Post-install checks (re-detect + unified output) ---
  // Runs for both install AND check — detectors are read-only, so check produces
  // the same advisory set as install would emit against the same filesystem state.
  // Changelog version-delta header (A7): surface what changed in the installed version.
  try {
    const pkgJsonPath = path.join(getPkgRoot(), "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
      const deltaHeader = readChangelogVersionDelta(pkg.version ?? "");
      if (deltaHeader) console.log(deltaHeader);
    }
  } catch (err) {
    void err; // Non-fatal — changelog header is informational
  }
  const postFindings = runPostInstallCheck(ctx.advisories, effectiveModules, process.cwd());
  // check only: install has just written every hook file of the modules it dispatched, and a
  // missing cloud-bootstrap.sh after `install --claude` is not that run's fault.
  const missingHooks = dryRun ? findMissingOwnedHooks(process.cwd(), effectiveModules) : [];
  const missingHooksFinding = detectOwnedHookMissing(missingHooks);
  if (missingHooksFinding) postFindings.push(missingHooksFinding);
  const banner = formatChecklist(postFindings);
  if (banner) console.log(banner);
  writeAdvisoriesArtifact(postFindings, {
    cwd: process.cwd(),
    mode: dryRun ? "check" : "install",
    version: getInstallingVersion(),
    logPrefix: LOG_PREFIX,
  });

  // Check mode: exit-1 on drift (totalWrites > 0). Banner already emitted above.
  // Host agent/command mirrors push would-writes into ws.writes (content drift OR
  // orphan delete). A stale managed-version marker ALSO surfaces as the
  // bkit-rendered-prompts-stale Phase-3 blocker. The same is true for the
  // managed docs/*.md marker (bkit-managed-docs-stale) — a stale doctrine doc need
  // not change ws.writes to be stale. Treat BOTH marker blockers as drift here so
  // `bkit check` hard-fails on outdated rendered prompts/workflows AND outdated
  // docs (#256). A missing owned hook file (owned-hook-missing) fails check too, by name: the
  // hook commands skip an absent file silently, and cloud-bootstrap.sh is never in ws.writes.
  // Other Phase-3 blockers keep their historical install-only semantics.
  //
  // Gate on `severity === "blocker"`, NOT mere id-presence: both gates are
  // branch-scoped (detectRenderedPromptsStale / detectManagedDocsStale downgrade to
  // `advisory` off main/dev), so on a feature branch the finding still surfaces in
  // the checklist but does not exit-1. On main/dev (or a PR into them) it stays a
  // blocker and hard-fails as before.
  if (dryRun) {
    const renderedStale = postFindings.some(
      (f) => f.id === "bkit-rendered-prompts-stale" && f.severity === "blocker",
    );
    const docsStale = postFindings.some(
      (f) => f.id === "bkit-managed-docs-stale" && f.severity === "blocker",
    );
    if (totalWrites > 0 || renderedStale || docsStale || missingHooks.length > 0) {
      if (totalWrites > 0) {
        console.error(`${LOG_PREFIX} check: ${totalWrites} write(s) would occur — DRIFT DETECTED`);
      }
      if (renderedStale) {
        console.error(
          `${LOG_PREFIX} check: rendered prompts/workflows are stale (managed-version marker drift) — ` +
            `see the bkit-rendered-prompts-stale blocker above. Run \`pnpm bkit upgrade\` (or re-run install) and commit.`,
        );
      }
      if (docsStale) {
        console.error(
          `${LOG_PREFIX} check: managed docs are stale (managed-version marker drift) — ` +
            `see the bkit-managed-docs-stale blocker above. Run \`pnpm bkit upgrade\` (or re-run install) and commit.`,
        );
      }
      for (const hook of missingHooks) {
        console.error(`${LOG_PREFIX} check: ${describeMissingOwnedHook(hook)}`);
      }
      process.exit(1);
    }
    return;
  }

  // P2.T9: exit-1 on Phase 3 blockers + recovery action text.
  // Blockers in Phase 3 are actionable hard-fails (e.g. gh-bkit-token gap in CI).
  // Advisory findings are informational only and do NOT exit-1.
  const phase3Blockers = postFindings.filter((f) => f.severity === "blocker");
  if (phase3Blockers.length > 0) {
    const recoveryFlags = modulesToCliFlags(effectiveModules, opencodeProvider, cloudVariant);
    const recoveryLine = `pnpm bkit uninstall ${recoveryFlags} && <fix the issue> && pnpm bkit install ${recoveryFlags}`;
    console.error(
      `${LOG_PREFIX} ${phase3Blockers.length} Phase 3 blocker(s) detected. Recovery:\n  ${recoveryLine}`,
    );
    // P2.T10: --auto-revert: run uninstall in-process before exit-1
    if (uninstallFlags.autoRevert) {
      console.log(`${LOG_PREFIX} --auto-revert: reverting install...`);
      const uninstallCtx: UninstallContext = {
        cwd: process.cwd(),
        dryRun: false,
        // force: true — auto-revert must delete byte-equal-text files (e.g. .bkit-version)
        // that were just written in this install run. Without force, the hash guard keeps
        // any of them whose hash `.bkit/version` does not record.
        force: true,
        nuke: false,
        yes: true,
        logPrefix: "[bkit-uninstall]",
      };
      await runUninstall([...effectiveModules] as ModuleName[], uninstallCtx);
      console.log(`${LOG_PREFIX} --auto-revert: uninstall complete. Exiting 1.`);
    }
    process.exit(1);
  }
}

function isMainScript(): boolean {
  if (!process.argv[1]) return false;
  try {
    const argvReal = fs.realpathSync(process.argv[1]);
    const metaReal = fs.realpathSync(fileURLToPath(import.meta.url));
    return argvReal === metaReal;
  } catch {
    return false;
  }
}

if (isMainScript()) {
  main().catch((err: unknown) => {
    console.error(`${LOG_PREFIX} Unhandled error: ${(err as Error).message}`);
    process.exit(1);
  });
}
