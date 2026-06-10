#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, printUsage, OPTIN_MODULES } from "./bkit-cli.js";
import { dispatchModules, getPkgRoot, renderCloudWorkflow, renderManagedOutputs, } from "./bkit-modules.js";
import { getTemplatesRoot, getBkitDocsRoot, isDogfood } from "./bkit-paths.js";
import { resolveTokens } from "./bkit-tokens.js";
import { runPreflight } from "./bkit-preflight.js";
import { runPostInstallCheck, formatChecklist, readChangelogVersionDelta, writeAdvisoriesArtifact, } from "./bkit-postinstall.js";
import { runUninstall } from "./bkit-uninstall.js";
import { runUpgrade, updateCanonicalHashesAfterUpgrade, migrateStrayGitattributes, } from "./bkit-upgrade.js";
import { DEFAULT_ISSUE_TRACKER, parseIssueTracker, getInstallManifest, getModuleManifest, } from "./bkit-manifest.js";
// ---------------------------------------------------------------------------
// Staging helpers (P4.T1 / P4.T2)
//
// Transactional install: each module writes into `.bkit-staging/<module>/`
// first. `commitStaging` atomically renames the staging dir to the real
// destination when ALL modules succeed. `discardStaging` cleans up on failure.
//
// Design contract (BAR-142 §A4):
//   - Staging path: `.bkit-staging/<module>/` relative to cwd.
//   - Each staged file lives at `<stagingDir>/<rel-consumer-path>`.
//   - commitStaging: move each staged file → real destination (fs.renameSync).
//     Falls back to copy+delete if cross-device rename throws EXDEV.
//   - discardStaging: fs.rmSync(stagingDir, { recursive: true, force: true }).
//
// Callers:
//   - bkit-modules.ts dispatchModules wraps each module fn with commit/discard
//     so a crash inside any module discards that module's staging dir and all
//     prior modules' staging dirs that have not yet been committed.
// ---------------------------------------------------------------------------
/** Staging root dir — all staging work lives under this path (relative to cwd). */
export const STAGING_ROOT = ".bkit-staging";
/**
 * Build the staging directory path for a given module.
 * Returns an absolute path.
 */
export function getStagingDir(module, cwd = process.cwd()) {
    return path.join(cwd, STAGING_ROOT, module);
}
/**
 * Initialise a staging directory (create + empty).
 * Safe to call multiple times — idempotent.
 */
export function initStagingDir(stagingDir) {
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
export function commitStaging(stagingDir, cwd = process.cwd()) {
    if (!fs.existsSync(stagingDir))
        return [];
    const committed = [];
    const entries = listFilesRecursive(stagingDir);
    for (const absStaged of entries) {
        const relPath = path.relative(stagingDir, absStaged);
        const destAbs = path.join(cwd, relPath);
        fs.mkdirSync(path.dirname(destAbs), { recursive: true });
        try {
            fs.renameSync(absStaged, destAbs);
        }
        catch (err) {
            // Cross-device rename (EXDEV) — fall back to copy + delete
            if (err.code === "EXDEV") {
                fs.copyFileSync(absStaged, destAbs);
                fs.chmodSync(destAbs, fs.statSync(absStaged).mode);
                fs.rmSync(absStaged);
            }
            else {
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
export function discardStaging(stagingDir) {
    if (fs.existsSync(stagingDir)) {
        fs.rmSync(stagingDir, { recursive: true, force: true });
    }
}
/**
 * Discard ALL staging dirs under STAGING_ROOT (cleanup on mid-install failure).
 */
export function discardAllStaging(cwd = process.cwd()) {
    const stagingRoot = path.join(cwd, STAGING_ROOT);
    if (fs.existsSync(stagingRoot)) {
        fs.rmSync(stagingRoot, { recursive: true, force: true });
    }
}
// Hard allowlist: install / host-pass prune may ONLY remove files from these
// dirs. Mirror SOURCES live package-side under `.bkit/{workflows,prompts}`; only
// the generated IDE mirror dirs below are consumer-writable.
const WRITE_DIRS = [
    ".claude/agents",
    ".claude/commands",
    ".cursor/agents",
    ".cursor/commands",
];
// Bkit-prefix filter — files in WRITE_DIRS not starting with this prefix are
// project-managed and never written to, overwritten, or pruned by install.
const BKIT_PREFIX = "bkit-";
// Log prefix — mutated by main() to "[bkit-check]" when verb === "check"
// so log scanners can tell which verb actually ran.
let LOG_PREFIX = "[bkit-install]";
/**
 * Parse .bkit/prompts.md § Models table → Map<name, columnValue>.
 * columnHeader is the column header label to extract (e.g. "Cursor model", "opencode model").
 * The function is header-addressed: it finds the column by name, never by position.
 * Hard-fails (process.exit(1)) if the section or column header is not found.
 */
export function parseModelLookupForColumn(subagentsMdPath, columnHeader) {
    const content = fs.readFileSync(subagentsMdPath, "utf-8");
    const map = new Map();
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
            if (inTable)
                break;
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
            if (trimmed.includes("---"))
                continue;
            continue;
        }
        // Separator row
        if (trimmed.includes("---"))
            continue;
        if (cols.length <= columnIndex)
            continue;
        const nameMatch = cols[0].match(/^`([^`]+)`$/);
        if (!nameMatch)
            continue;
        // Strip optional backtick wrapping from model value (table cells may use `model-name`)
        const modelRaw = cols[columnIndex];
        const modelClean = modelRaw.replace(/^`|`$/g, "");
        map.set(nameMatch[1], modelClean);
    }
    if (columnIndex === -1) {
        console.error(`${LOG_PREFIX} Could not find column "${columnHeader}" in ## Models table in ${subagentsMdPath}`);
        process.exit(1);
    }
    return map;
}
/**
 * Parse .bkit/prompts.md § Models table → Map<name, cursorModel>.
 * Header-addressed: finds the "Cursor model" column by header name.
 * Preserved for backward compatibility — delegates to parseModelLookupForColumn.
 */
export function parseModelLookup(subagentsMdPath) {
    return parseModelLookupForColumn(subagentsMdPath, "Cursor");
}
/**
 * Like parseModelLookupForColumn but returns null instead of exiting when the
 * column header is absent — used for optional per-provider opencode columns.
 */
function tryParseModelLookupForColumn(subagentsMdPath, columnHeader) {
    const content = fs.readFileSync(subagentsMdPath, "utf-8");
    const modelsIdx = content.indexOf("## Models");
    if (modelsIdx === -1)
        return null;
    // The header row is the first table line in the § Models section (the row
    // immediately above the `| --- | ... |` separator).
    const sectionLines = content.slice(modelsIdx).split("\n");
    let headerLine;
    for (let i = 0; i < sectionLines.length; i++) {
        const t = sectionLines[i].trim();
        if (!t.startsWith("|"))
            continue;
        const next = (sectionLines[i + 1] ?? "").trim();
        if (next.startsWith("|") && /^[|\s:-]+$/.test(next)) {
            headerLine = t;
            break;
        }
    }
    if (!headerLine)
        return null;
    const headers = headerLine
        .split("|")
        .map((c) => c.trim().toLowerCase().replace(/`/g, ""))
        .filter(Boolean);
    if (!headers.includes(columnHeader.toLowerCase()))
        return null;
    return parseModelLookupForColumn(subagentsMdPath, columnHeader);
}
// Single documented starting-point model for opencode providers WITHOUT a curated
// per-prompt column in prompts.md. Consumers tune via providers.md § Models
// (live /v1/models lookup). Prefix is added at build time.
const OPENCODE_PROVIDER_FALLBACK_MODEL = {
    openrouter: "qwen/qwen-2.5-coder-32b-instruct",
    gemini: "gemini-2.0-flash",
};
// Map an opencode provider key → its human-friendly prompts.md § Models column header.
// The table uses display headers ("Ollama (Local)", "Nvidia"); the install flag uses
// provider keys ("ollama-local", "nvidia"). Providers absent here have no curated column.
const OPENCODE_PROVIDER_COLUMN = {
    "ollama-local": "Ollama (Local)",
    nvidia: "Nvidia",
};
/**
 * Build the per-agent opencode model lookup for the selected provider.
 * Source of truth = prompts.md § Models, which carries one curated column per
 * provider ("Ollama (Local)", "Nvidia"). Providers without a column fall back to a
 * single documented default (consumer tunes after install). Header-addressed.
 */
export function buildOpencodeModelLookup(subagentsMdPath, provider) {
    const header = OPENCODE_PROVIDER_COLUMN[provider];
    const curated = header ? tryParseModelLookupForColumn(subagentsMdPath, header) : null;
    if (curated)
        return curated;
    // Uncurated provider: prefix-correct single default for every agent.
    const names = tryParseModelLookupForColumn(subagentsMdPath, "Ollama (Local)") ??
        parseModelLookupForColumn(subagentsMdPath, "Claude");
    const bare = OPENCODE_PROVIDER_FALLBACK_MODEL[provider] ?? "set-model-id";
    const out = new Map();
    for (const name of names.keys())
        out.set(name, `${provider}/${bare}`);
    return out;
}
/**
 * Parse the consumer-owned `## Model Overrides` table (below the `bkit:end` marker)
 * from an installed prompts.md. Rows are `| Prompt | Provider | Model |`. Best-effort:
 * returns [] when the file, the marker, the section, or the rows are absent.
 * Only the region after `bkit:end` is read — the bkit-managed block is never an override.
 */
export function parseModelOverrides(promptsMdPath) {
    if (!fs.existsSync(promptsMdPath))
        return [];
    const content = fs.readFileSync(promptsMdPath, "utf-8");
    const endIdx = content.indexOf("<!-- bkit:end -->");
    const region = endIdx === -1 ? "" : content.slice(endIdx);
    const ovIdx = region.indexOf("## Model Overrides");
    if (ovIdx === -1)
        return [];
    const out = [];
    let inTable = false;
    for (const line of region.slice(ovIdx).split("\n")) {
        const t = line.trim();
        if (!t.startsWith("|")) {
            if (inTable)
                break;
            continue;
        }
        inTable = true;
        const cells = t
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((s) => s.trim().replace(/^`|`$/g, ""));
        if (cells.length < 3)
            continue;
        const [prompt, provider, model] = cells;
        if (!prompt || !provider || !model)
            continue;
        if (prompt.toLowerCase() === "prompt")
            continue; // header row
        if (/^-+$/.test(prompt))
            continue; // separator row
        out.push({ prompt, provider, model });
    }
    return out;
}
/**
 * Merge consumer overrides (from `overridesPath`, an installed prompts.md) into a
 * per-agent model `lookup` for one host/provider key. Mutates `lookup` in place;
 * only rows whose Provider matches `providerKey` and whose Prompt is a known agent win.
 */
export function applyModelOverrides(lookup, providerKey, overridesPath) {
    for (const o of parseModelOverrides(overridesPath)) {
        if (o.provider.toLowerCase() === providerKey.toLowerCase() && lookup.has(o.prompt)) {
            lookup.set(o.prompt, o.model);
        }
    }
}
/**
 * Parse .bkit/prompts.md § Models table → Map<name, opencodeModel> for ollama-local.
 * Back-compat shim — delegates to buildOpencodeModelLookup with the default provider.
 */
export function parseOpencodeModelLookup(subagentsMdPath) {
    return buildOpencodeModelLookup(subagentsMdPath, "ollama-local");
}
// Effort → reasoningEffort mapping for opencode frontmatter.
// Claude's effort knob (low/medium/high/xhigh/max) maps to opencode's reasoningEffort.
const EFFORT_TO_REASONING_EFFORT = {
    low: "none",
    medium: "low",
    high: "medium",
    xhigh: "high",
    max: "max",
};
// Fields in Claude frontmatter that are opencode-incompatible and must be dropped.
const CLAUDE_ONLY_FIELDS = new Set(["permissionMode", "maxTurns", "is_background", "readonly"]);
/**
 * OC1: opencode agent frontmatter rewrite.
 * Emits: mode, name, description, model, tools (passthrough), reasoningEffort (from effort).
 * Drops: Claude-only fields (permissionMode, maxTurns, is_background, readonly) and the
 * original effort field (replaced by reasoningEffort).
 * Hard-fails with non-zero exit if model lookup missing for name.
 */
export function applyOpencodeAgent(content, opencodeModelLookup) {
    const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
    if (!fmMatch)
        return content;
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
    }
    else {
        newFm += `description: ${description}\n`;
    }
    newFm += `model: ${opencodeModel}\n`;
    if (toolsBlock)
        newFm += `${toolsBlock}\n`;
    if (effort) {
        const reasoningEffort = EFFORT_TO_REASONING_EFFORT[effort];
        if (reasoningEffort) {
            newFm += `reasoningEffort: ${reasoningEffort}\n`;
        }
    }
    newFm += "---\n";
    return newFm + afterFm;
}
/**
 * OC2: opencode command rewrite.
 * - Strips leading YAML frontmatter block (same as T1).
 * - Rewrites invocation spelling for opencode:
 *   - `Agent` tool → `Task` tool (subagent invocations)
 *   - `Skill` tool → `Task` tool (slash-command invocations)
 *   - @name → /name ONLY on exact **Subagent:** lines (anchored, same as T2)
 */
export function applyOpencodeCommand(content) {
    // Step 1: strip frontmatter (same as T1)
    const stripped = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\n+/, "");
    // Step 2: rewrite invocations (same as T2)
    let result = stripped.replace(/`Agent` tool/g, "`Task` tool");
    result = result.replace(/using `Agent` tool/g, "using `Task` tool");
    result = result.replace(/`Skill` tool/g, "`Task` tool");
    result = result.replace(/using `Skill` tool/g, "using `Task` tool");
    result = result.replace(/^(\*\*Subagent:\*\* )@([a-z][a-z0-9-]*)$/gm, "$1/$2");
    return result;
}
// T1: Strip leading YAML frontmatter block from command files for Cursor
export function applyT1(content) {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\n+/, "");
}
// T2: Rewrite command body for Cursor invocation
// - `Agent` tool → `Task` tool (subagent invocation)
// - `Skill` tool → `Task` tool (slash-command invocation — Cursor's `Task`
//   tool covers both surfaces; Claude splits them into `Agent` + `Skill`)
// - @name → /name ONLY on exact **Subagent:** lines (anchored)
export function applyT2(content) {
    let result = content.replace(/`Agent` tool/g, "`Task` tool");
    result = result.replace(/using `Agent` tool/g, "using `Task` tool");
    result = result.replace(/`Skill` tool/g, "`Task` tool");
    result = result.replace(/using `Skill` tool/g, "using `Task` tool");
    result = result.replace(/^(\*\*Subagent:\*\* )@([a-z][a-z0-9-]*)$/gm, "$1/$2");
    return result;
}
// Parse simple YAML frontmatter block (key: value, or key: | multiline)
export function parseFrontmatter(fmBlock) {
    const map = new Map();
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
            const blockLines = [];
            i++;
            while (i < lines.length) {
                const nextLine = lines[i];
                if (/^[a-zA-Z_][a-zA-Z0-9_-]*:/.test(nextLine))
                    break;
                blockLines.push(nextLine.replace(/^ {2}/, ""));
                i++;
            }
            map.set(key, blockLines.join("\n").trim());
        }
        else {
            map.set(key, valueOnLine);
            i++;
        }
    }
    return map;
}
// Extract a YAML field's raw block (including continuation lines) from a frontmatter string.
// Handles both inline (`field: [a, b]`) and multi-line list (`field:\n  - a\n  - b`) formats.
// Returns null if field absent.
function extractFrontmatterField(fmBlock, field) {
    const re = new RegExp(`^(${field}:[ \\t]*[^\\n]*(?:\\n[ \\t]+[^\\n]*)*)`, "m");
    const m = fmBlock.match(re);
    return m ? m[1] : null;
}
// T3: Cursor subagent frontmatter rewrite.
// Emits: name, description, model, tools (passthrough — Cursor 2.4+ accepts identical tool names per BAR-113).
// Drops: effort, permissionMode, maxTurns, readonly, is_background.
// Hard-fails with non-zero exit if model lookup missing for name.
export function applyT3(content, modelLookup) {
    const fmMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
    if (!fmMatch)
        return content;
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
    const toolsBlock = extractFrontmatterField(fmBlock, "tools");
    let newFm = "---\n";
    newFm += `name: ${name}\n`;
    if (description.includes("\n")) {
        const indented = description.split("\n").join("\n  ");
        newFm += `description: |\n  ${indented}\n`;
    }
    else {
        newFm += `description: ${description}\n`;
    }
    newFm += `model: ${cursorModel}\n`;
    if (toolsBlock)
        newFm += `${toolsBlock}\n`;
    newFm += "---\n";
    return newFm + afterFm;
}
function listMdFiles(dir, prefix) {
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".md"))
        .filter((f) => (prefix ? f.startsWith(prefix) : true));
}
function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}
function installFile(srcPath, destPath, transform, dryRun) {
    if (!transform) {
        if (fs.existsSync(destPath)) {
            const src = fs.readFileSync(srcPath);
            const dest = fs.readFileSync(destPath);
            if (src.equals(dest))
                return false;
        }
        if (!dryRun)
            fs.copyFileSync(srcPath, destPath);
        return true;
    }
    const src = fs.readFileSync(srcPath, "utf-8");
    const transformed = transform(src);
    if (fs.existsSync(destPath)) {
        const existing = fs.readFileSync(destPath, "utf-8");
        if (existing === transformed)
            return false;
    }
    if (!dryRun)
        fs.writeFileSync(destPath, transformed, "utf-8");
    return true;
}
function removeOrphans(destDir, sourceFiles, dryRun, prefix) {
    const allowed = WRITE_DIRS.map((d) => path.resolve(d));
    const resolved = path.resolve(destDir);
    if (!allowed.includes(resolved)) {
        console.error(`${LOG_PREFIX} Refusing orphan removal outside allowlist: ${destDir}`);
        process.exit(1);
    }
    if (!fs.existsSync(destDir))
        return [];
    const removed = [];
    for (const f of fs.readdirSync(destDir)) {
        if (!f.endsWith(".md"))
            continue;
        if (prefix && !f.startsWith(prefix))
            continue;
        if (!sourceFiles.has(f)) {
            if (!dryRun)
                fs.rmSync(path.join(destDir, f));
            removed.push(f);
        }
    }
    return removed;
}
const START_MARKER = "<!-- bkit:start -->";
const END_MARKER = "<!-- bkit:end -->";
const HASH_START_MARKER = "# bkit:start";
const HASH_END_MARKER = "# bkit:end";
// Select marker pair based on markerStyle.
function selectMarkers(markerStyle) {
    return markerStyle === "hash-comment"
        ? [HASH_START_MARKER, HASH_END_MARKER]
        : [START_MARKER, END_MARKER];
}
// Recognised line-comment prefixes — bare, shell (#), JS/TS (//).
const ALLOWED_PREFIXES = ["", "# ", "// "];
// Find line-anchored marker positions. A marker is line-anchored when:
//   - The line before the marker is empty, "# ", or "// " (comment prefixes).
//   - The character after the marker is end-of-line or end-of-file.
// Backtick-quoted prose mentions are ignored.
// markerStyle defaults to "html-comment" for backward compat.
export function findLineAnchoredMarkers(content, markerOrStyle, _markerStyle) {
    // Support both legacy call-site (content, markerString) and new call-site (content, markerStyle).
    // If markerOrStyle is a known MarkerStyle literal, treat it as style; otherwise treat as marker string.
    let marker;
    if (markerOrStyle === "html-comment" || markerOrStyle === "hash-comment") {
        // Called as findLineAnchoredMarkers(content, markerStyle) — internal helper path
        // This overload is used only internally; callers pass marker string directly.
        // Retain backward-compat: interpret as the START marker of the given style.
        const [start] = selectMarkers(markerOrStyle);
        marker = start;
    }
    else {
        marker = markerOrStyle;
    }
    const positions = [];
    const len = marker.length;
    let pos = 0;
    while (true) {
        const idx = content.indexOf(marker, pos);
        if (idx === -1)
            break;
        let lineStart = idx;
        while (lineStart > 0 && content[lineStart - 1] !== "\n")
            lineStart--;
        const beforeMarker = content.slice(lineStart, idx);
        const after = idx + len >= content.length ? "\n" : content[idx + len];
        const isLineEnd = after === "\n" || after === undefined;
        if (ALLOWED_PREFIXES.includes(beforeMarker) && isLineEnd)
            positions.push(idx);
        pos = idx + len;
    }
    return positions;
}
// Internal helper: find anchored positions for a specific marker string (private).
function findAnchored(content, marker) {
    const positions = [];
    const len = marker.length;
    let pos = 0;
    while (true) {
        const idx = content.indexOf(marker, pos);
        if (idx === -1)
            break;
        let lineStart = idx;
        while (lineStart > 0 && content[lineStart - 1] !== "\n")
            lineStart--;
        const beforeMarker = content.slice(lineStart, idx);
        const after = idx + len >= content.length ? "\n" : content[idx + len];
        const isLineEnd = after === "\n" || after === undefined;
        if (ALLOWED_PREFIXES.includes(beforeMarker) && isLineEnd)
            positions.push(idx);
        pos = idx + len;
    }
    return positions;
}
// Find the start of the line containing a position.
function lineStartOf(content, idx) {
    let i = idx;
    while (i > 0 && content[i - 1] !== "\n")
        i--;
    return i;
}
// Managed-block writer: update content between markers.
// markerStyle defaults to "html-comment" for backward compat.
// Markers may be bare (markdown) or comment-prefixed (`# ` shell, `// ` JS/TS) — prefixes
// are preserved on update. No-op (warn + skip) when markers absent, duplicated, or inverted.
export function updateManagedBlock(filePath, newContent, dryRun = false, markerStyle = "html-comment") {
    if (!fs.existsSync(filePath))
        return false;
    const existing = fs.readFileSync(filePath, "utf-8");
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findAnchored(existing, startMarker);
    const ends = findAnchored(existing, endMarker);
    if (starts.length === 0 || ends.length === 0) {
        console.warn(`${LOG_PREFIX} Managed block markers absent in ${filePath} — skipping`);
        return false;
    }
    if (starts.length > 1 || ends.length > 1) {
        console.warn(`${LOG_PREFIX} Multiple managed-block markers in ${filePath} — skipping (expected exactly one of each)`);
        return false;
    }
    const startIdx = starts[0];
    const endIdx = ends[0];
    if (startIdx >= endIdx) {
        console.warn(`${LOG_PREFIX} Inverted managed-block markers in ${filePath} (end before start) — skipping`);
        return false;
    }
    // Slice on line boundaries so any comment prefix on the marker lines is preserved.
    const startLineEnd = existing.indexOf("\n", startIdx + startMarker.length);
    const beforeBlock = startLineEnd === -1
        ? existing.slice(0, startIdx + startMarker.length)
        : existing.slice(0, startLineEnd);
    const afterBlock = existing.slice(lineStartOf(existing, endIdx));
    const normalisedContent = newContent.replace(/^\n+/, "").replace(/\n+$/, "");
    const updated = beforeBlock + "\n\n" + normalisedContent + "\n\n" + afterBlock;
    if (updated === existing)
        return false;
    if (!dryRun)
        fs.writeFileSync(filePath, updated, "utf-8");
    return true;
}
// Extract the bkit-managed block content from a file, stripping surrounding newlines.
// markerStyle defaults to "html-comment" for backward compat.
// Markers may be bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractManagedBlock(content, markerStyle = "html-comment") {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findAnchored(content, startMarker);
    const ends = findAnchored(content, endMarker);
    if (starts.length !== 1 || ends.length !== 1)
        return null;
    if (starts[0] >= ends[0])
        return null;
    const startLineEnd = content.indexOf("\n", starts[0] + startMarker.length);
    const inner = startLineEnd === -1 ? "" : content.slice(startLineEnd + 1, lineStartOf(content, ends[0]));
    return inner.replace(/^\n+/, "").replace(/\n+$/, "");
}
// Extract the FULL bkit-managed block INCLUDING marker lines from a file.
// markerStyle defaults to "html-comment" for backward compat.
// Used to append a fresh block to a destination that has none. Markers may be
// bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractFullManagedBlock(content, markerStyle = "html-comment") {
    const [startMarker, endMarker] = selectMarkers(markerStyle);
    const starts = findAnchored(content, startMarker);
    const ends = findAnchored(content, endMarker);
    if (starts.length !== 1 || ends.length !== 1)
        return null;
    if (starts[0] >= ends[0])
        return null;
    const startLineStart = lineStartOf(content, starts[0]);
    const endLineEnd = content.indexOf("\n", ends[0] + endMarker.length);
    return endLineEnd === -1
        ? content.slice(startLineStart)
        : content.slice(startLineStart, endLineEnd + 1);
}
function listFilesRecursive(dir) {
    if (!fs.existsSync(dir))
        return [];
    const out = [];
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory())
            out.push(...listFilesRecursive(p));
        else if (ent.isFile())
            out.push(p);
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
const NPM_STRIP_REMAP = {
    gitignore: ".gitignore",
    npmignore: ".npmignore",
};
export function remapTemplateDest(rel) {
    const dir = path.dirname(rel);
    const base = path.basename(rel);
    const mapped = NPM_STRIP_REMAP[base];
    if (mapped === undefined)
        return rel;
    return dir === "." ? mapped : path.join(dir, mapped);
}
function mirrorDirAlways(src, dst, dryRun, log) {
    let writes = 0;
    if (!dryRun)
        fs.mkdirSync(dst, { recursive: true });
    for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, ent.name);
        const dstPath = path.join(dst, ent.name);
        if (ent.isDirectory()) {
            writes += mirrorDirAlways(srcPath, dstPath, dryRun, (sub) => log(path.join(ent.name, sub)));
            continue;
        }
        if (!ent.isFile())
            continue;
        const srcContent = fs.readFileSync(srcPath);
        if (fs.existsSync(dstPath)) {
            const dstContent = fs.readFileSync(dstPath);
            if (srcContent.equals(dstContent))
                continue;
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
];
// Files that moved from `.agents/` to a consumer-side `.bkit/` directory and
// carry consumer-owned or stateful content — MIGRATE (move) rather than delete,
// so an upgrading consumer keeps their version pin, secrets, and friction log.
// [oldRel, newRel]. `.env.example` is a seed but may carry consumer edits, so
// move it too (install reseeds at the new path only if absent).
const MIGRATED_AGENTS_FILES = [
    [path.join(".agents", ".bkit-version"), path.join(".bkit", "version")],
    [path.join(".agents", ".env"), path.join(".bkit", ".env")],
    [path.join(".agents", ".env.example"), path.join(".bkit", ".env.example")],
    [path.join(".agents", "friction.md"), path.join(".bkit", "friction.md")],
];
export function runPayload(dryRun) {
    let deletes = 0;
    let writes = 0;
    const tag = dryRun ? "[dry-run] " : "";
    if (isDogfood())
        return { writes: 0, deletes: 0 };
    // 1. Relocated mirror-source dirs: remove bkit-prefix files, then the dir if empty.
    for (const subdir of ["workflows", "prompts"]) {
        const dstDir = path.join(".agents", subdir);
        if (!fs.existsSync(dstDir))
            continue;
        for (const f of listMdFiles(dstDir, BKIT_PREFIX)) {
            const target = path.join(dstDir, f);
            console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing relocated ${target}`);
            deletes++;
            if (!dryRun)
                fs.rmSync(target, { force: true });
        }
        if (!dryRun && fs.readdirSync(dstDir).length === 0)
            fs.rmdirSync(dstDir);
    }
    // 2. Relocated single files (bkit-authoring docs).
    for (const name of RELOCATED_AGENTS_FILES) {
        const target = path.join(".agents", name);
        if (!fs.existsSync(target))
            continue;
        console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing relocated ${target}`);
        deletes++;
        if (!dryRun)
            fs.rmSync(target, { force: true });
    }
    // 3. Migrate stateful/consumer-owned files .agents/ → .bkit/ (move, content-preserving).
    //    Only when the old path exists and the new one does not, so a re-run is a no-op
    //    and an already-migrated consumer is never clobbered.
    for (const [oldRel, newRel] of MIGRATED_AGENTS_FILES) {
        if (!fs.existsSync(oldRel))
            continue;
        if (fs.existsSync(newRel)) {
            // Already migrated (or freshly seeded) — drop the stale .agents/ copy.
            console.log(`${LOG_PREFIX} ${tag}payload cleanup: removing superseded ${oldRel}`);
            deletes++;
            if (!dryRun)
                fs.rmSync(oldRel, { force: true });
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
            if (!dryRun)
                fs.rmSync(oldAdvisories, { force: true });
        }
    }
    // 4. Re-point a stale `.envrc` dotenv directive left behind by the
    //    .agents/.env → .bkit/.env move in step 3. `.envrc` is Tier-3 seed-or-print,
    //    so bkit never overwrites it — but the single line bkit itself authored
    //    (`dotenv_if_exists .agents/.env`) now points at the path the migration just
    //    emptied, silently breaking direnv auto-load for upgrading consumers. Rewrite
    //    ONLY that exact, whole-line directive — never a consumer-appended sibling
    //    such as `dotenv_if_exists .agents/.env.local` (anchored match, no leading/
    //    trailing-newline capture). Idempotent: an `.envrc` already pointing at
    //    .bkit/.env (fresh 3.x install or hand-fixed) has no match → no-op.
    {
        const envrcPath = ".envrc";
        if (fs.existsSync(envrcPath)) {
            const before = fs.readFileSync(envrcPath, "utf-8");
            const after = before.replace(/^([ \t]*)dotenv_if_exists[ \t]+\.agents\/\.env[ \t]*$/gm, "$1dotenv_if_exists .bkit/.env");
            if (after !== before) {
                console.log(`${LOG_PREFIX} ${tag}payload migrate: re-pointed .envrc directive .agents/.env → .bkit/.env`);
                writes++;
                if (!dryRun)
                    fs.writeFileSync(envrcPath, after, "utf-8");
            }
        }
    }
    return { writes, deletes };
}
// ---------------------------------------------------------------------------
// D1 upgrade orphan-removal (#160)
//
// Consumers who ran `bkit upgrade` on a version that shipped `.agents/templates/`
// (pre-#160 layout) now carry an orphaned directory that no longer exists in the
// tarball. Remove it so the consumer tree stays clean. No-op when absent.
// Dry-run aware: logs only, no FS write.
// ---------------------------------------------------------------------------
export function removeOrphanTemplatesDir(cwd, dryRun) {
    const orphanDir = path.join(cwd, ".agents", "templates");
    if (!fs.existsSync(orphanDir))
        return;
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
        console.log(`${LOG_PREFIX} upgrade: skipping .agents/templates/ removal — no bkit-origin sentinel found; directory appears consumer-owned`);
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
function getInstallingVersion() {
    try {
        const pkgJsonPath = path.join(getPkgRoot(), "package.json");
        if (fs.existsSync(pkgJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
            return pkg.version ?? "0.0.0";
        }
    }
    catch {
        return "0.0.0"; // best-effort: unreadable/garbled package.json
    }
    return "0.0.0";
}
/**
 * `bkit status` — read-only host/provider status.
 * Reports current host+provider sampled from .opencode/opencode.json,
 * .claude/, and .cursor/ presence. Writes nothing.
 */
function runStatus(cwd, logPrefix) {
    console.log(`${logPrefix} Host/provider status (read-only — no writes)`);
    console.log(`${logPrefix} Working directory: ${cwd}`);
    // --- claude host ---
    const claudeDir = path.join(cwd, ".claude");
    const claudePresent = fs.existsSync(claudeDir);
    const claudeSettingsPath = path.join(claudeDir, "settings.json");
    let claudeModel = "claude (default)";
    if (claudePresent && fs.existsSync(claudeSettingsPath)) {
        try {
            const settings = JSON.parse(fs.readFileSync(claudeSettingsPath, "utf-8"));
            if (settings.model)
                claudeModel = settings.model;
        }
        catch {
            // best-effort
        }
    }
    console.log(`${logPrefix} claude:  ${claudePresent ? "INSTALLED" : "absent"}  (provider: anthropic / ${claudeModel})`);
    // --- cursor host ---
    const cursorDir = path.join(cwd, ".cursor");
    const cursorPresent = fs.existsSync(cursorDir);
    console.log(`${logPrefix} cursor:  ${cursorPresent ? "INSTALLED" : "absent"}`);
    // --- opencode host ---
    const opencodeDir = path.join(cwd, ".opencode");
    const opencodePresent = fs.existsSync(opencodeDir);
    let opencodeProvider = "unknown";
    let opencodeModel = "unknown";
    const opencodeJsonPath = path.join(opencodeDir, "opencode.json");
    if (opencodePresent && fs.existsSync(opencodeJsonPath)) {
        try {
            const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8"));
            // opencode.json structure: provider block has the provider name/id
            // Try to extract provider and model from the config
            if (cfg.provider?.name)
                opencodeProvider = cfg.provider.name;
            if (cfg.model)
                opencodeModel = cfg.model;
            // Fallback: look for non-empty models map
            if (opencodeModel === "unknown" && cfg.models) {
                const modelKeys = Object.keys(cfg.models);
                if (modelKeys.length > 0)
                    opencodeModel = `${modelKeys.length} model(s) configured`;
            }
        }
        catch {
            opencodeModel = "parse-error";
        }
    }
    const opencodeStatus = opencodePresent
        ? `INSTALLED  (provider: ${opencodeProvider} / model: ${opencodeModel})`
        : "absent (run: bkit install --opencode=<provider>)";
    console.log(`${logPrefix} opencode: ${opencodeStatus}`);
    // --- summary ---
    const installedHosts = [
        claudePresent ? "claude" : null,
        cursorPresent ? "cursor" : null,
        opencodePresent ? "opencode" : null,
    ].filter(Boolean);
    console.log(`${logPrefix} Installed hosts: ${installedHosts.length > 0 ? installedHosts.join(", ") : "none"}`);
}
/**
 * Detect which host modules a consumer has installed, by the presence of each host's
 * source-rendered agents directory. Used by `bkit upgrade` to re-render (#251) only the
 * hosts the consumer actually opted into — never force-creating an opencode/cursor tree.
 */
function detectInstalledHostModules(cwd) {
    const mods = new Set();
    if (fs.existsSync(path.join(cwd, ".claude", "agents")))
        mods.add("claude");
    if (fs.existsSync(path.join(cwd, ".cursor", "agents")))
        mods.add("cursor");
    if (fs.existsSync(path.join(cwd, ".opencode", "agents")))
        mods.add("opencode");
    return mods;
}
/**
 * Detect the opencode provider id from a consumer's `.opencode/opencode.json`. The
 * provider block is keyed by id (matching renderOpencodeJson + the --cloud=opencode
 * constraint check), so the first key IS the provider. Returns null when absent or
 * unparseable — the caller falls back to the install default so the opencode model
 * lookup still resolves on upgrade.
 */
function detectOpencodeProvider(cwd) {
    const jsonPath = path.join(cwd, ".opencode", "opencode.json");
    if (!fs.existsSync(jsonPath))
        return null;
    try {
        const cfg = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
        if (cfg.provider && typeof cfg.provider === "object") {
            return Object.keys(cfg.provider)[0] ?? null;
        }
    }
    catch {
        return null; // unparseable opencode.json — fall back to the default provider
    }
    return null;
}
async function main() {
    const { verb, modules, uninstallFlags, upgradeFlags, tracker, cloudVariant, opencodeProvider, force, } = parseArgs(process.argv.slice(2));
    if (verb === "help") {
        printUsage();
        return;
    }
    if (verb === "doctor") {
        LOG_PREFIX = "[bkit-doctor]";
        console.log(`${LOG_PREFIX} Running read-only advisory scan (no writes)`);
        console.log(`${LOG_PREFIX} Templates root: ${getTemplatesRoot()}`);
        const { blockers, advisories: preflightAdvisories } = runPreflight(modules, process.cwd());
        const allFindings = runPostInstallCheck([...preflightAdvisories, ...blockers], { writes: [] }, modules, process.cwd());
        const banner = formatChecklist(allFindings);
        if (banner) {
            console.log(banner);
        }
        else {
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
            console.log(`${LOG_PREFIX} opencode binary: ${opencodeInstalled ? "FOUND (" + whichResult.stdout.trim() + ")" : "NOT FOUND (install opencode first)"}`);
            // Read provider from opencode.json to check creds
            let detectedProvider = null;
            if (fs.existsSync(opencodeJsonPath)) {
                try {
                    const cfg = JSON.parse(fs.readFileSync(opencodeJsonPath, "utf-8"));
                    detectedProvider =
                        cfg.provider && typeof cfg.provider === "object"
                            ? (Object.keys(cfg.provider)[0] ?? null)
                            : null;
                }
                catch {
                    // best-effort
                }
            }
            if (opencodeProvider)
                detectedProvider = opencodeProvider;
            // Per-provider cred check (present/absent only — no value echoed)
            const PROVIDER_KEYS = {
                nvidia: ["NVIDIA_API_KEY"],
                openrouter: ["OPENROUTER_API_KEY"],
                gemini: ["GEMINI_API_KEY"],
                openai: ["OPENAI_API_KEY"],
                anthropic: ["ANTHROPIC_API_KEY"],
                // ollama-local: local server, no API key required
            };
            // Local-only providers that use no remote API key
            const LOCAL_PROVIDERS = new Set(["ollama-local"]);
            if (detectedProvider && !LOCAL_PROVIDERS.has(detectedProvider)) {
                const keys = PROVIDER_KEYS[detectedProvider] ?? [
                    `${detectedProvider.toUpperCase()}_API_KEY`,
                ];
                for (const key of keys) {
                    const present = Boolean(process.env[key] && process.env[key].trim().length > 0);
                    console.log(`${LOG_PREFIX} ${key}: ${present ? "PRESENT" : "ABSENT (required for provider " + detectedProvider + ")"}`);
                }
            }
            else if (detectedProvider && LOCAL_PROVIDERS.has(detectedProvider)) {
                console.log(`${LOG_PREFIX} OLLAMA_HOST: ${process.env.OLLAMA_HOST ? "PRESENT (" + process.env.OLLAMA_HOST + ")" : "not set (defaults to http://localhost:11434)"}`);
                // Memory-safety check (read-only — bkit never mutates the Ollama server env).
                // These vars govern the Ollama SERVER process; opencode.json has no field for them.
                // On a single local box, holding 2+ models resident causes swap thrash on model switch.
                const maxLoaded = process.env.OLLAMA_MAX_LOADED_MODELS?.trim();
                if (!maxLoaded) {
                    console.log(`${LOG_PREFIX} OLLAMA_MAX_LOADED_MODELS: not set — recommend =1 on constrained machines (avoids swap thrash on model switch)`);
                }
                else if (maxLoaded !== "1") {
                    console.log(`${LOG_PREFIX} OLLAMA_MAX_LOADED_MODELS: ${maxLoaded} — recommend =1 on constrained machines (>1 holds multiple models resident → swap thrash)`);
                }
                else {
                    console.log(`${LOG_PREFIX} OLLAMA_MAX_LOADED_MODELS: 1 (memory-safe)`);
                }
                console.log(`${LOG_PREFIX} OLLAMA_KEEP_ALIVE: ${process.env.OLLAMA_KEEP_ALIVE?.trim() ? process.env.OLLAMA_KEEP_ALIVE.trim() : "not set (default 5m) — consider 2m to unload sooner after idle"}`);
                // Subagent fan-out: bkit workflows dispatch subagents concurrently. With one local
                // model, parallel requests give no speedup and split the KV cache (more memory).
                // NUM_PARALLEL=1 serializes execution at the Ollama server — the memory-safe default.
                const numParallel = process.env.OLLAMA_NUM_PARALLEL?.trim();
                if (!numParallel) {
                    console.log(`${LOG_PREFIX} OLLAMA_NUM_PARALLEL: not set — recommend =1 on constrained machines (serializes workflow subagent fan-out; parallel gives no speedup on one model)`);
                }
                else if (numParallel !== "1") {
                    console.log(`${LOG_PREFIX} OLLAMA_NUM_PARALLEL: ${numParallel} — recommend =1 on constrained machines (>1 splits the KV cache across concurrent subagent requests → more memory)`);
                }
                else {
                    console.log(`${LOG_PREFIX} OLLAMA_NUM_PARALLEL: 1 (subagent fan-out serialized)`);
                }
            }
            else if (!detectedProvider) {
                console.log(`${LOG_PREFIX} Provider not detected — run \`bkit install --opencode=<provider>\` first`);
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
        console.log(`${LOG_PREFIX} Running upgrade${upgradeFlags.dryRun ? " (dry-run)" : ""}${upgradeFlags.nonInteractive ? " (non-interactive)" : ""}`);
        // 2.5.0 migration: that release wrote `.gitattributes` to a file literally
        // named `gitattributes` (no dot), which git never reads. Rename it and drop
        // the bogus dot-less canonicalHashes key before the walk reseeds the dotted one.
        migrateStrayGitattributes(process.cwd(), upgradeFlags.dryRun);
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
        // Collect bkit-managed template candidates from the package.
        // Templates live in .bkit/templates/ — walk the directory for all files.
        const tplRoot = getTemplatesRoot();
        // Manifest entry drives the per-file write strategy in runUpgrade:
        //   markered-text → block-merge, json → deep-merge (both preserve consumer
        //   content outside the managed region), byte-equal-text / unmanaged →
        //   whole-file write with drift detection. `seedOrPrint` byte-equal files are
        //   consumer-owned after seeding — upgrade must not overwrite a present one.
        const entryByPath = new Map();
        for (const entry of getInstallManifest()) {
            entryByPath.set(entry.path, entry);
        }
        // Files owned by OPT-IN modules (renovate, dependabot) must NEVER be
        // force-created by upgrade — they ship only via an explicit `bkit install
        // --renovate`/`--dependabot`. Creating `.github/renovate.json5` on a consumer
        // that already runs Dependabot opens competing dependency PRs (issue #129 §5).
        // We still UPDATE such a file when the consumer has opted in (dest present).
        const optInPaths = new Set();
        for (const mod of OPTIN_MODULES) {
            // renovate/dependabot are both ModuleFlag and ModuleName.
            for (const entry of getModuleManifest(mod))
                optInPaths.add(entry.path);
        }
        // Tracker-conditional cloud workflow (#138): resolve the consumer's tracker so upgrade
        // renders bkit-cloud.yml the same way install does (byte-identical, no drift fight).
        const CLOUD_WORKFLOW_RELPATH = path.join(".github", "workflows", "bkit-cloud.yml");
        let upgradeTracker = DEFAULT_ISSUE_TRACKER;
        try {
            const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
            const stored = parseIssueTracker(pkg.bkit?.issueTracker);
            if (stored !== null)
                upgradeTracker = stored;
        }
        catch {
            // package.json absent/unparseable — default tracker
        }
        const candidates = [];
        if (fs.existsSync(tplRoot)) {
            const collectTemplates = (dir, rel) => {
                for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
                    const entRel = rel ? path.join(rel, ent.name) : ent.name;
                    const entAbs = path.join(dir, ent.name);
                    if (ent.isDirectory()) {
                        collectTemplates(entAbs, entRel);
                    }
                    else if (ent.isFile()) {
                        // Single shared dotfile remap (gitignore → .gitignore, npmignore → .npmignore).
                        const relPath = remapTemplateDest(entRel);
                        // Skip opt-in-module files the consumer hasn't opted into (dest absent).
                        if (optInPaths.has(relPath) && !fs.existsSync(path.join(process.cwd(), relPath))) {
                            continue;
                        }
                        const entry = entryByPath.get(relPath);
                        // bkit-cloud.yml is rendered tracker-conditional on install (#138) — the raw
                        // template carries `@@CLOUD_TRACKER_*@@` sentinels. Render it the same way here
                        // so upgrade emits byte-identical output (install/upgrade can never disagree).
                        const contentOverride = relPath === CLOUD_WORKFLOW_RELPATH
                            ? renderCloudWorkflow(fs.readFileSync(entAbs, "utf-8"), upgradeTracker)
                            : undefined;
                        candidates.push({
                            relPath,
                            templatePath: entAbs,
                            format: entry?.format,
                            seedOrPrint: entry?.seedOrPrint,
                            contentOverride,
                        });
                    }
                }
            };
            collectTemplates(tplRoot, "");
        }
        // Upgrade orphan: bkit-auto.yml was renamed to bkit-cloud.yml (#245).
        // Only remove when bkit-cloud.yml is already present or being installed in this run —
        // otherwise a plain `bkit install` (no --cloud flag) would silently delete the old
        // cloud workflow without seeding the replacement.
        const oldAutoWorkflow = path.join(process.cwd(), ".github", "workflows", "bkit-auto.yml");
        const newCloudWorkflow = path.join(process.cwd(), ".github", "workflows", "bkit-cloud.yml");
        const cloudWillBeInstalled = candidates.some((c) => c.relPath === path.join(".github", "workflows", "bkit-cloud.yml"));
        if (fs.existsSync(oldAutoWorkflow) &&
            (fs.existsSync(newCloudWorkflow) || cloudWillBeInstalled)) {
            const tag = upgradeFlags.dryRun ? "[dry-run] " : "";
            console.log(`${LOG_PREFIX} ${tag}upgrade: removing orphan .github/workflows/bkit-auto.yml (renamed to bkit-cloud.yml)`);
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
        // #251: the template walk above only covers `.bkit/templates/` config. Re-render the
        // bkit-managed OUTPUT files install also produces but that are NOT templates — host
        // agents/commands (source-rendered from .bkit/prompts + .bkit/workflows) and the
        // `.bkit/*.md` canonical docs (runBkitDocs). These are bkit-owned, force-overwritten
        // output; without this a version bump ships new config but stale prompts/agents/
        // commands/docs (a consumer would have to re-run `bkit install` to get them). Only the
        // hosts the consumer installed are re-rendered (detected by their agents dir) so upgrade
        // never force-creates an opt-in host. `.bkit/prompts.md` is markered → runBkitDocs
        // block-merges it: managed block refreshed, consumer `## Model Overrides` below bkit:end
        // preserved. Docs stay single-source PACKAGE-side (#204/#219) — never relocated to templates/.
        const renderModules = detectInstalledHostModules(process.cwd());
        const renderProvider = detectOpencodeProvider(process.cwd()) ?? "ollama-local";
        // Build the model lookups the SAME way the install dispatch does: DEFAULTS from the
        // package's .bkit/prompts.md § Models, consumer overrides from the consumer's installed
        // .bkit/prompts.md `## Model Overrides` (per-agent, per-provider, preserved across upgrades).
        let renderModelLookup = new Map();
        let renderOpencodeModelLookup = new Map();
        const pkgPromptsMd = path.join(getBkitDocsRoot(), "prompts.md");
        const consumerPromptsMd = path.join(process.cwd(), ".bkit", "prompts.md");
        if (fs.existsSync(pkgPromptsMd)) {
            try {
                renderModelLookup = parseModelLookup(pkgPromptsMd);
            }
            catch {
                // Not fatal — the cursor render fails per-file if a model is missing
            }
            applyModelOverrides(renderModelLookup, "cursor", consumerPromptsMd);
            if (renderModules.has("opencode")) {
                try {
                    renderOpencodeModelLookup = buildOpencodeModelLookup(pkgPromptsMd, renderProvider);
                }
                catch {
                    // Not fatal — the opencode render fails per-file if a model is missing
                }
                applyModelOverrides(renderOpencodeModelLookup, renderProvider, consumerPromptsMd);
            }
        }
        const renderWs = { writes: [] };
        const renderCtx = {
            dryRun: upgradeFlags.dryRun,
            tokens: tokens ?? { NODE_VERSION: "", DEFAULT_BRANCH: "", PROJECT_NAME: "", REPO_SLUG: "" },
            modelLookup: renderModelLookup,
            opencodeModelLookup: renderOpencodeModelLookup,
            opencodeProvider: renderProvider,
            advisories: [],
            ws: renderWs,
            logPrefix: LOG_PREFIX,
            postDispatch: [],
            issueTracker: upgradeTracker,
            cloudVariant: null,
        };
        const rendered = renderManagedOutputs(renderModules, renderCtx);
        // Refresh canonicalHashes (from resulting on-disk content) AND bump pinnedVersion
        // to the version we just upgraded TO — otherwise a clean upgrade leaves the pin
        // stale and the next `bkit check` wants to write it (1 write → exit 1), failing
        // the CI drift gate (#129 §3). Called unconditionally (non-dry-run) so the pin
        // bumps even when every file was a no-op skip. The re-rendered `.bkit/*.md` docs ARE
        // in canonicalHashes (install records them via runBkitDocs → ws), so feed their writes
        // in too — keeping install/upgrade `.bkit/version` parity. Agent/command writes are
        // intentionally untracked (installFile), matching install — they never enter canonicalHashes.
        if (!upgradeFlags.dryRun) {
            const pkgVersion = JSON.parse(fs.readFileSync(path.join(getPkgRoot(), "package.json"), "utf-8")).version;
            const renderedDocPaths = renderWs.writes.map((w) => path.relative(process.cwd(), path.isAbsolute(w.path) ? w.path : path.resolve(process.cwd(), w.path)));
            updateCanonicalHashesAfterUpgrade({
                updated: [...result.updated, ...renderedDocPaths],
                skipped: result.skipped,
                conflicts: result.conflicts,
            }, {
                dryRun: false,
                cwd: process.cwd(),
                pinnedVersion: pkgVersion,
            });
        }
        console.log(`${LOG_PREFIX} Done. updated: ${result.updated.length}, skipped: ${result.skipped.length}, conflicts: ${result.conflicts.length}, re-rendered: ${rendered.length}`);
        // Non-interactive mode: exit non-zero on conflicts
        if (upgradeFlags.nonInteractive && result.conflicts.length > 0) {
            process.exit(1);
        }
        return;
    }
    if (verb === "uninstall") {
        LOG_PREFIX = "[bkit-uninstall]";
        const uninstallCtx = {
            cwd: process.cwd(),
            dryRun: uninstallFlags.dryRun,
            force: uninstallFlags.force,
            nuke: uninstallFlags.nuke,
            yes: uninstallFlags.yes,
            stripPackage: uninstallFlags.stripPackage,
            logPrefix: LOG_PREFIX,
        };
        const moduleList = [...modules];
        console.log(`${LOG_PREFIX} Running uninstall${uninstallCtx.dryRun ? " (dry-run)" : ""}...`);
        const result = await runUninstall(moduleList, uninstallCtx);
        const totalDeleted = result.deleted.length;
        const totalStripped = result.stripped.length;
        const totalPreserved = result.preserved.length;
        if (uninstallCtx.dryRun) {
            console.log(`${LOG_PREFIX} [dry-run] Would delete: ${totalDeleted}, strip: ${totalStripped}, preserve: ${totalPreserved}`);
        }
        else {
            console.log(`${LOG_PREFIX} Done. Deleted: ${totalDeleted}, stripped: ${totalStripped}, preserved: ${totalPreserved}`);
        }
        return;
    }
    const dryRun = verb === "check";
    if (dryRun)
        LOG_PREFIX = "[bkit-check]";
    if (dryRun)
        console.log(`${LOG_PREFIX} Running in check (dry-run) mode`);
    // --- Phase 1: Preflight (read-only, before any writes) ---
    // Must run BEFORE resolveTokens to short-circuit cleanly on blockers.
    const { blockers, advisories: preflightAdvisories } = runPreflight(modules, process.cwd());
    if (blockers.length > 0) {
        console.log(`${LOG_PREFIX} Preflight blockers detected — aborting.`);
        const blockerBanner = formatChecklist(blockers);
        if (blockerBanner)
            console.log(blockerBanner);
        process.exit(1);
    }
    // Resolve tokens once for the whole install
    const tokens = await resolveTokens(process.cwd()).catch((err) => {
        console.error(`${LOG_PREFIX} Token resolution failed: ${err.message}`);
        process.exit(1);
    });
    // Parse model lookup (needed for cursor transforms).
    // DEFAULTS come from the PACKAGE's .bkit/prompts.md § Models (authoritative, matches the
    // prompt files about to be installed — avoids a mid-install hard-fail in applyT3).
    // OVERRIDES come from the CONSUMER's installed .bkit/prompts.md `## Model Overrides`
    // section (below `bkit:end`) — per-agent, per-provider, preserved across upgrades.
    let modelLookup = new Map();
    let opencodeModelLookup = new Map();
    const promptsMdPath = path.join(getBkitDocsRoot(), "prompts.md");
    const consumerPromptsMdPath = path.join(process.cwd(), ".bkit", "prompts.md");
    if (fs.existsSync(promptsMdPath)) {
        try {
            modelLookup = parseModelLookup(promptsMdPath);
        }
        catch {
            // Not fatal — cursor module will fail per-file if a model is missing
        }
        // Consumer overrides merge after the base parse — parseModelOverrides is internally
        // guarded (returns [] when the file/section is absent), so it needs no catch here.
        applyModelOverrides(modelLookup, "cursor", consumerPromptsMdPath);
        if (modules.has("opencode")) {
            const provider = opencodeProvider ?? "ollama-local";
            try {
                opencodeModelLookup = buildOpencodeModelLookup(promptsMdPath, provider);
            }
            catch {
                // Not fatal — opencode module will fail per-file if a model is missing
            }
            applyModelOverrides(opencodeModelLookup, provider, consumerPromptsMdPath);
        }
    }
    // Seed preflight advisories into ctx so modules can accumulate into the same list.
    const advisories = [...preflightAdvisories];
    const ws = { writes: [] };
    const postDispatch = [];
    // Resolve issueTracker: --tracker= flag overrides; else read bkit.issueTracker from consumer
    // package.json; else default to "none".
    let issueTracker = DEFAULT_ISSUE_TRACKER;
    let recordedIssueTracker = null; // the value already stored in package.json
    {
        const consumerPkgPath = path.join(process.cwd(), "package.json");
        if (fs.existsSync(consumerPkgPath)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(consumerPkgPath, "utf-8"));
                const bkitField = pkg.bkit;
                const stored = parseIssueTracker(bkitField?.issueTracker);
                if (stored !== null) {
                    issueTracker = stored;
                    recordedIssueTracker = stored;
                }
            }
            catch {
                // non-fatal — keep default
            }
        }
        if (tracker !== null) {
            // Tracker-switch hard-block: if a tracker is already recorded and differs from the
            // requested one, require --force to override (FINAL SCOPE decision 4).
            // First-set (no recorded tracker) is always free.
            if (recordedIssueTracker !== null &&
                recordedIssueTracker !== "none" &&
                recordedIssueTracker !== tracker &&
                !force) {
                console.error(`[bkit] Tracker is already set to "${recordedIssueTracker}" in package.json. ` +
                    `Switching to "${tracker}" requires --force. ` +
                    `Re-run with --force to override: bkit install --tracker=${tracker} --force`);
                process.exit(1);
            }
            issueTracker = tracker;
        }
    }
    // Symmetric cloud/tracker constraint (FINAL SCOPE decision 3/4):
    // cloud=claude and cloud=opencode both require tracker=github (both render bkit-cloud.yml).
    // cloud=cursor requires tracker=linear.
    // Mismatch is a hard error — checked BEFORE any package.json write so no state
    // is recorded on mismatch ("no files written on hard error" invariant).
    if (cloudVariant !== null && modules.has("cloud")) {
        const requiredTracker = cloudVariant === "cursor" ? "linear" : "github";
        if (issueTracker !== requiredTracker) {
            console.error(`[bkit] --cloud=${cloudVariant} requires tracker=${requiredTracker}, ` +
                `but the resolved tracker is "${issueTracker}". ` +
                (issueTracker === DEFAULT_ISSUE_TRACKER || issueTracker === "none"
                    ? `Set the tracker first: bkit install --tracker=${requiredTracker} --cloud=${cloudVariant}`
                    : `Use the matching cloud variant or reconfigure the tracker with --force.`));
            process.exit(1);
        }
        // cloud=opencode additionally requires the local opencode host to be installed first
        // (the cloud job runs against the committed .opencode/ — no model is hard-coded in YAML).
        if (cloudVariant === "opencode" && !fs.existsSync(path.join(process.cwd(), ".opencode"))) {
            console.error(`[bkit] --cloud=opencode requires the local opencode host to be installed first.\n` +
                `Run: bkit install --opencode=<provider>  (e.g. --opencode=nvidia, --opencode=openrouter)\n` +
                `The cloud opencode job runs against the committed .opencode/ config — without it there is nothing to run.`);
            process.exit(1);
        }
        // Warn (non-fatal) when the detected provider is local-only (ollama-local) — the cloud runner
        // has no local model server, so the cloud job will fail at runtime.
        if (cloudVariant === "opencode") {
            const ocJsonPath = path.join(process.cwd(), ".opencode", "opencode.json");
            if (fs.existsSync(ocJsonPath)) {
                try {
                    const cfg = JSON.parse(fs.readFileSync(ocJsonPath, "utf-8"));
                    const detectedId = cfg.provider && typeof cfg.provider === "object"
                        ? (Object.keys(cfg.provider)[0] ?? null)
                        : null;
                    const LOCAL_ONLY_PROVIDERS = new Set(["ollama-local"]);
                    if (detectedId && LOCAL_ONLY_PROVIDERS.has(detectedId)) {
                        console.warn(`[bkit] warning: .opencode/opencode.json is configured for ${detectedId} (local server). ` +
                            `The cloud opencode job requires a remote provider with an API key — ` +
                            `re-run \`bkit install --opencode=<provider>\` (e.g. --opencode=nvidia) to switch.`);
                    }
                }
                catch {
                    // best-effort
                }
            }
        }
    }
    // Persist tracker to consumer package.json AFTER all hard-error gates pass.
    // This preserves the "no files written on mismatch" invariant.
    if (tracker !== null) {
        const consumerPkgPath2 = path.join(process.cwd(), "package.json");
        if (fs.existsSync(consumerPkgPath2) && !dryRun) {
            try {
                const raw = fs.readFileSync(consumerPkgPath2, "utf-8");
                const pkg = JSON.parse(raw);
                const bkit = (pkg.bkit ?? {});
                bkit.issueTracker = tracker;
                pkg.bkit = bkit;
                const indentMatch = raw.match(/\n([ \t]+)"/);
                const indent = indentMatch ? indentMatch[1] : "  ";
                const trailingNewline = raw.endsWith("\n") ? "\n" : "";
                fs.writeFileSync(consumerPkgPath2, JSON.stringify(pkg, null, indent) + trailingNewline, "utf-8");
                console.log(`${LOG_PREFIX} Set bkit.issueTracker = "${tracker}" in package.json`);
            }
            catch {
                // non-fatal
            }
        }
    }
    const ctx = {
        dryRun,
        tokens,
        modelLookup,
        opencodeModelLookup,
        opencodeProvider,
        advisories,
        ws,
        logPrefix: LOG_PREFIX,
        postDispatch,
        issueTracker,
        cloudVariant,
    };
    // --- Phase 2: Install (current behaviour — dispatch modules) ---
    dispatchModules(modules, ctx);
    const totalWrites = ws.writes.length;
    // Done banner first so the line count is easy to find above the checklist.
    // For check, "would occur" makes intent explicit; for install, writes already happened.
    if (dryRun) {
        console.log(`${LOG_PREFIX} ${totalWrites} write(s) would occur.`);
    }
    else {
        console.log(`${LOG_PREFIX} Done. ${totalWrites} write(s).`);
    }
    // --- Phase 3: Post-install checks (re-detect + unified output) ---
    // Runs for both install AND check — detectors are read-only, so check produces
    // the same advisory set as install would emit against the same filesystem state.
    // Changelog version-delta header (A7): surface what changed in the installed version.
    try {
        const pkgJsonPath = path.join(getPkgRoot(), "package.json");
        if (fs.existsSync(pkgJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
            const deltaHeader = readChangelogVersionDelta(pkg.version ?? "");
            if (deltaHeader)
                console.log(deltaHeader);
        }
    }
    catch (err) {
        void err; // Non-fatal — changelog header is informational
    }
    const postFindings = runPostInstallCheck(ctx.advisories, ws, modules, process.cwd());
    const banner = formatChecklist(postFindings);
    if (banner)
        console.log(banner);
    writeAdvisoriesArtifact(postFindings, {
        cwd: process.cwd(),
        mode: dryRun ? "check" : "install",
        version: getInstallingVersion(),
        logPrefix: LOG_PREFIX,
    });
    // Check mode: exit-1 on drift (totalWrites > 0). Banner already emitted above.
    if (dryRun) {
        if (totalWrites > 0) {
            console.error(`${LOG_PREFIX} check: ${totalWrites} write(s) would occur — DRIFT DETECTED`);
            process.exit(1);
        }
        return;
    }
    // P2.T9: exit-1 on Phase 3 blockers + recovery action text.
    // Blockers in Phase 3 are actionable hard-fails (e.g. gh-bkit-token gap in CI).
    // Advisory findings are informational only and do NOT exit-1.
    const phase3Blockers = postFindings.filter((f) => f.severity === "blocker");
    if (phase3Blockers.length > 0) {
        const moduleFlags = [...modules].map((m) => `--${m}`).join(" ");
        const recoveryLine = `pnpm bkit uninstall ${moduleFlags} && <fix the issue> && pnpm bkit install ${moduleFlags}`;
        console.error(`${LOG_PREFIX} ${phase3Blockers.length} Phase 3 blocker(s) detected. Recovery:\n  ${recoveryLine}`);
        // P2.T10: --auto-revert: run uninstall in-process before exit-1
        if (uninstallFlags.autoRevert) {
            console.log(`${LOG_PREFIX} --auto-revert: reverting install...`);
            const uninstallCtx = {
                cwd: process.cwd(),
                dryRun: false,
                // force: true — auto-revert must delete byte-equal-text files (e.g. .bkit-version)
                // that were just written in this install run. Without force, shouldDeleteTier3 skips
                // them when tier3Hashes has no recorded hash (newly-written file).
                force: true,
                nuke: false,
                yes: true,
                stripPackage: false,
                logPrefix: "[bkit-uninstall]",
            };
            await runUninstall([...modules], uninstallCtx);
            console.log(`${LOG_PREFIX} --auto-revert: uninstall complete. Exiting 1.`);
        }
        process.exit(1);
    }
}
function isMainScript() {
    if (!process.argv[1])
        return false;
    try {
        const argvReal = fs.realpathSync(process.argv[1]);
        const metaReal = fs.realpathSync(fileURLToPath(import.meta.url));
        return argvReal === metaReal;
    }
    catch {
        return false;
    }
}
if (isMainScript()) {
    main().catch((err) => {
        console.error(`${LOG_PREFIX} Unhandled error: ${err.message}`);
        process.exit(1);
    });
}
