#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, printUsage, OPTIN_MODULES } from "./bkit-cli.js";
import { dispatchModules, getPkgRoot, renderCloudWorkflow, } from "./bkit-modules.js";
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
// Hard allowlist: install / payload prune may ONLY remove files from these dirs.
// `.agents/{workflows,prompts}/` are mirrored from the package payload during the
// payload pass; the host dirs are mirrored from `.agents/` during the host pass.
const WRITE_DIRS = [
    ".agents/workflows",
    ".agents/prompts",
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
// Parse .agents/prompts.md § Models table → Map<name, cursorModel>
export function parseModelLookup(subagentsMdPath = ".agents/prompts.md") {
    const content = fs.readFileSync(subagentsMdPath, "utf-8");
    const map = new Map();
    const modelsIdx = content.indexOf("## Models");
    if (modelsIdx === -1) {
        console.error(`${LOG_PREFIX} Could not find ## Models section in .agents/prompts.md`);
        process.exit(1);
    }
    const lines = content.slice(modelsIdx).split("\n");
    let inTable = false;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("|")) {
            if (inTable)
                break;
            continue;
        }
        inTable = true;
        if (trimmed.includes("---") || trimmed.toLowerCase().includes("cursor model"))
            continue;
        const cols = trimmed
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean);
        if (cols.length < 2)
            continue;
        const nameMatch = cols[0].match(/^`([^`]+)`$/);
        if (!nameMatch)
            continue;
        // Strip optional backtick wrapping from model value (table cells may use `model-name`)
        const modelRaw = cols[1];
        const modelClean = modelRaw.replace(/^`|`$/g, "");
        map.set(nameMatch[1], modelClean);
    }
    return map;
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
// `.agents/templates/` and remapped to their dotted dest at install/upgrade time.
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
//   - .agents/templates/** → full mirror (bkit-owned subtree)
// In dogfood (running from .agents/scripts/ in the bkit repo itself), src and dst
// resolve to the same paths, so this pass is a no-op.
export function runPayload(dryRun) {
    const PKG_ROOT = getPkgRoot();
    const PKG_AGENTS = path.join(PKG_ROOT, ".agents");
    let writes = 0;
    let deletes = 0;
    const tag = dryRun ? "[dry-run] " : "";
    if (!fs.existsSync(PKG_AGENTS))
        return { writes, deletes };
    for (const subdir of ["workflows", "prompts"]) {
        const srcDir = path.join(PKG_AGENTS, subdir);
        const dstDir = path.join(".agents", subdir);
        if (!fs.existsSync(srcDir))
            continue;
        if (path.resolve(srcDir) === path.resolve(dstDir))
            continue;
        ensureDir(dstDir);
        const srcFiles = listMdFiles(srcDir, BKIT_PREFIX);
        const sourceSet = new Set(srcFiles);
        for (const f of srcFiles) {
            if (installFile(path.join(srcDir, f), path.join(dstDir, f), null, dryRun)) {
                writes++;
                console.log(`${LOG_PREFIX} ${tag}payload: ${path.join(dstDir, f)}`);
            }
        }
        for (const f of removeOrphans(dstDir, sourceSet, dryRun, BKIT_PREFIX)) {
            deletes++;
            console.log(`${LOG_PREFIX} ${tag}payload delete: ${path.join(dstDir, f)}`);
        }
    }
    const tplSrc = path.join(PKG_AGENTS, "templates");
    const tplDst = path.join(".agents", "templates");
    if (fs.existsSync(tplSrc) && path.resolve(tplSrc) !== path.resolve(tplDst)) {
        writes += mirrorDirAlways(tplSrc, tplDst, dryRun, (rel) => {
            console.log(`${LOG_PREFIX} ${tag}payload: ${path.join(tplDst, rel)}`);
        });
    }
    return { writes, deletes };
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
        // best-effort
    }
    return "0.0.0";
}
async function main() {
    const { verb, modules, uninstallFlags, upgradeFlags, tracker, cloudVariant, force } = parseArgs(process.argv.slice(2));
    if (verb === "help") {
        printUsage();
        return;
    }
    if (verb === "doctor") {
        LOG_PREFIX = "[bkit-doctor]";
        console.log(`${LOG_PREFIX} Running read-only advisory scan (no writes)`);
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
        return;
    }
    if (verb === "upgrade") {
        LOG_PREFIX = "[bkit-upgrade]";
        console.log(`${LOG_PREFIX} Running upgrade${upgradeFlags.dryRun ? " (dry-run)" : ""}${upgradeFlags.nonInteractive ? " (non-interactive)" : ""}`);
        // 2.5.0 migration: that release wrote `.gitattributes` to a file literally
        // named `gitattributes` (no dot), which git never reads. Rename it and drop
        // the bogus dot-less canonicalHashes key before the walk reseeds the dotted one.
        migrateStrayGitattributes(process.cwd(), upgradeFlags.dryRun);
        // Collect bkit-managed template candidates from the package.
        // Templates live in .agents/templates/ — walk the directory for all files.
        const pkgRoot = getPkgRoot();
        const tplRoot = path.join(pkgRoot, ".agents", "templates");
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
        // Markered-text templates managed on upgrade are token-free, but resolve real
        // tokens when possible so any future token-bearing block stays correct.
        const tokens = await resolveTokens(process.cwd()).catch(() => undefined);
        const result = runUpgrade(candidates, {
            nonInteractive: upgradeFlags.nonInteractive,
            dryRun: upgradeFlags.dryRun,
            cwd: process.cwd(),
            tokens,
        });
        // Refresh canonicalHashes (from resulting on-disk content) AND bump pinnedVersion
        // to the version we just upgraded TO — otherwise a clean upgrade leaves the pin
        // stale and the next `bkit check` wants to write it (1 write → exit 1), failing
        // the CI drift gate (#129 §3). Called unconditionally (non-dry-run) so the pin
        // bumps even when every file was a no-op skip.
        if (!upgradeFlags.dryRun) {
            const pkgVersion = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf-8"))
                .version;
            updateCanonicalHashesAfterUpgrade(result, {
                dryRun: false,
                cwd: process.cwd(),
                pinnedVersion: pkgVersion,
            });
        }
        console.log(`${LOG_PREFIX} Done. updated: ${result.updated.length}, skipped: ${result.skipped.length}, conflicts: ${result.conflicts.length}`);
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
    // Source: PACKAGE's .agents/prompts.md, not the consumer's. The consumer's
    // copy may be stale (e.g. upgrading from a release that predates a newly
    // added prompt) — reading from the package guarantees the lookup matches the
    // prompt files about to be installed and avoids a mid-install hard-fail in
    // applyT3 ("Missing model lookup for <name>"). Falls back to consumer file
    // when running from a non-package context (e.g. the bkit repo itself).
    let modelLookup = new Map();
    const pkgPromptsMd = path.join(getPkgRoot(), ".agents", "prompts.md");
    const promptsMdPath = fs.existsSync(pkgPromptsMd) ? pkgPromptsMd : ".agents/prompts.md";
    if (fs.existsSync(promptsMdPath)) {
        try {
            modelLookup = parseModelLookup(promptsMdPath);
        }
        catch {
            // Not fatal — cursor module will fail per-file if a model is missing
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
    // cloud=claude requires tracker=github; cloud=cursor requires tracker=linear.
    // Mismatch is a hard error — checked BEFORE any package.json write so no state
    // is recorded on mismatch ("no files written on hard error" invariant).
    if (cloudVariant !== null && modules.has("cloud")) {
        const requiredTracker = cloudVariant === "claude" ? "github" : "linear";
        if (issueTracker !== requiredTracker) {
            console.error(`[bkit] --cloud=${cloudVariant} requires tracker=${requiredTracker}, ` +
                `but the resolved tracker is "${issueTracker}". ` +
                (issueTracker === DEFAULT_ISSUE_TRACKER || issueTracker === "none"
                    ? `Set the tracker first: bkit install --tracker=${requiredTracker} --cloud=${cloudVariant}`
                    : `Use the matching cloud variant or reconfigure the tracker with --force.`));
            process.exit(1);
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
    catch {
        // Non-fatal — changelog header is informational
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
