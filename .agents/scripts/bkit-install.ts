#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs, printUsage } from "./bkit-cli.js";
import { dispatchModules, getPkgRoot, type ModuleContext } from "./bkit-modules.js";
import { resolveTokens } from "./bkit-tokens.js";
import { runPreflight } from "./bkit-preflight.js";
import { runPostInstallCheck, formatChecklist, readChangelogVersionDelta } from "./bkit-postinstall.js";

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
] as const;

// Bkit-prefix filter — files in WRITE_DIRS not starting with this prefix are
// project-managed and never written to, overwritten, or pruned by install.
const BKIT_PREFIX = "bkit-";

// Log prefix — mutated by main() to "[bkit-check]" when verb === "check"
// so log scanners can tell which verb actually ran.
let LOG_PREFIX = "[bkit-install]";

export type Host = "claude" | "cursor";

// Parse .agents/prompts.md § Models table → Map<name, cursorModel>
export function parseModelLookup(subagentsMdPath = ".agents/prompts.md"): Map<string, string> {
  const content = fs.readFileSync(subagentsMdPath, "utf-8");
  const map = new Map<string, string>();

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
      if (inTable) break;
      continue;
    }
    inTable = true;
    if (trimmed.includes("---") || trimmed.toLowerCase().includes("cursor model")) continue;

    const cols = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 2) continue;

    const nameMatch = cols[0].match(/^`([^`]+)`$/);
    if (!nameMatch) continue;
    // Strip optional backtick wrapping from model value (table cells may use `model-name`)
    const modelRaw = cols[1];
    const modelClean = modelRaw.replace(/^`|`$/g, "");
    map.set(nameMatch[1], modelClean);
  }

  return map;
}

// T1: Strip leading YAML frontmatter block from command files for Cursor
export function applyT1(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").replace(/^\n+/, "");
}

// T2: Rewrite command body for Cursor invocation
// - `Agent` tool → `Task` tool
// - @name → /name ONLY on exact **Subagent:** lines (anchored)
export function applyT2(content: string): string {
  let result = content.replace(/`Agent` tool/g, "`Task` tool");
  result = result.replace(/using `Agent` tool/g, "using `Task` tool");
  result = result.replace(/^(\*\*Subagent:\*\* )@([a-z][a-z0-9-]*)$/gm, "$1/$2");
  return result;
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
// Emits: name, description, model, tools (passthrough — Cursor 2.4+ accepts identical tool names per BAR-113).
// Drops: effort, permissionMode, maxTurns, readonly, is_background.
// Hard-fails with non-zero exit if model lookup missing for name.
export function applyT3(content: string, modelLookup: Map<string, string>): string {
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
  const toolsBlock = extractFrontmatterField(fmBlock, "tools");

  let newFm = "---\n";
  newFm += `name: ${name}\n`;
  if (description.includes("\n")) {
    const indented = description.split("\n").join("\n  ");
    newFm += `description: |\n  ${indented}\n`;
  } else {
    newFm += `description: ${description}\n`;
  }
  newFm += `model: ${cursorModel}\n`;
  if (toolsBlock) newFm += `${toolsBlock}\n`;
  newFm += "---\n";

  return newFm + afterFm;
}

function listMdFiles(dir: string, prefix?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .filter((f) => (prefix ? f.startsWith(prefix) : true));
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
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
  const allowed = WRITE_DIRS.map((d) => path.resolve(d));
  const resolved = path.resolve(destDir);
  if (!allowed.includes(resolved)) {
    console.error(`${LOG_PREFIX} Refusing orphan removal outside allowlist: ${destDir}`);
    process.exit(1);
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

const START_MARKER = "<!-- bkit:start -->";
const END_MARKER = "<!-- bkit:end -->";
const HASH_START_MARKER = "# bkit:start";
const HASH_END_MARKER = "# bkit:end";

// Marker style selector: html-comment (default, backward-compat) or hash-comment (YAML/INI/shell).
export type MarkerStyle = "html-comment" | "hash-comment";

// Shared WriteSet accumulator — both check and install paths populate this identically,
// ensuring parity by construction (eliminates future dry-run divergence).
export interface WriteEntry {
  path: string;
  action: "write" | "update" | "append";
  /**
   * Optional: names of devDependencies added to package.json in this write.
   * Set by ensurePackageJsonDevDeps callers when new deps are added.
   * Consumed by detectDevDepsNeedFetch in Phase 3.
   */
  devDepsAdded?: string[];
}

export interface WriteSet {
  writes: WriteEntry[];
}

// Select marker pair based on markerStyle.
function selectMarkers(markerStyle: MarkerStyle): [string, string] {
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
export function findLineAnchoredMarkers(
  content: string,
  markerOrStyle: string | MarkerStyle,
  _markerStyle?: MarkerStyle,
): number[] {
  // Support both legacy call-site (content, markerString) and new call-site (content, markerStyle).
  // If markerOrStyle is a known MarkerStyle literal, treat it as style; otherwise treat as marker string.
  let marker: string;
  if (markerOrStyle === "html-comment" || markerOrStyle === "hash-comment") {
    // Called as findLineAnchoredMarkers(content, markerStyle) — internal helper path
    // This overload is used only internally; callers pass marker string directly.
    // Retain backward-compat: interpret as the START marker of the given style.
    const [start] = selectMarkers(markerOrStyle as MarkerStyle);
    marker = start;
  } else {
    marker = markerOrStyle;
  }

  const positions: number[] = [];
  const len = marker.length;
  let pos = 0;
  while (true) {
    const idx = content.indexOf(marker, pos);
    if (idx === -1) break;
    let lineStart = idx;
    while (lineStart > 0 && content[lineStart - 1] !== "\n") lineStart--;
    const beforeMarker = content.slice(lineStart, idx);
    const after = idx + len >= content.length ? "\n" : content[idx + len];
    const isLineEnd = after === "\n" || after === undefined;
    if (ALLOWED_PREFIXES.includes(beforeMarker) && isLineEnd) positions.push(idx);
    pos = idx + len;
  }
  return positions;
}

// Internal helper: find anchored positions for a specific marker string (private).
function findAnchored(content: string, marker: string): number[] {
  const positions: number[] = [];
  const len = marker.length;
  let pos = 0;
  while (true) {
    const idx = content.indexOf(marker, pos);
    if (idx === -1) break;
    let lineStart = idx;
    while (lineStart > 0 && content[lineStart - 1] !== "\n") lineStart--;
    const beforeMarker = content.slice(lineStart, idx);
    const after = idx + len >= content.length ? "\n" : content[idx + len];
    const isLineEnd = after === "\n" || after === undefined;
    if (ALLOWED_PREFIXES.includes(beforeMarker) && isLineEnd) positions.push(idx);
    pos = idx + len;
  }
  return positions;
}

// Find the start of the line containing a position.
function lineStartOf(content: string, idx: number): number {
  let i = idx;
  while (i > 0 && content[i - 1] !== "\n") i--;
  return i;
}

// Managed-block writer: update content between markers.
// markerStyle defaults to "html-comment" for backward compat.
// Markers may be bare (markdown) or comment-prefixed (`# ` shell, `// ` JS/TS) — prefixes
// are preserved on update. No-op (warn + skip) when markers absent, duplicated, or inverted.
export function updateManagedBlock(
  filePath: string,
  newContent: string,
  dryRun = false,
  markerStyle: MarkerStyle = "html-comment",
): boolean {
  if (!fs.existsSync(filePath)) return false;
  const existing = fs.readFileSync(filePath, "utf-8");
  const [startMarker, endMarker] = selectMarkers(markerStyle);
  const starts = findAnchored(existing, startMarker);
  const ends = findAnchored(existing, endMarker);
  if (starts.length === 0 || ends.length === 0) {
    console.warn(`${LOG_PREFIX} Managed block markers absent in ${filePath} — skipping`);
    return false;
  }
  if (starts.length > 1 || ends.length > 1) {
    console.warn(
      `${LOG_PREFIX} Multiple managed-block markers in ${filePath} — skipping (expected exactly one of each)`,
    );
    return false;
  }
  const startIdx = starts[0]!;
  const endIdx = ends[0]!;
  if (startIdx >= endIdx) {
    console.warn(
      `${LOG_PREFIX} Inverted managed-block markers in ${filePath} (end before start) — skipping`,
    );
    return false;
  }
  // Slice on line boundaries so any comment prefix on the marker lines is preserved.
  const startLineEnd = existing.indexOf("\n", startIdx + startMarker.length);
  const beforeBlock =
    startLineEnd === -1
      ? existing.slice(0, startIdx + startMarker.length)
      : existing.slice(0, startLineEnd);
  const afterBlock = existing.slice(lineStartOf(existing, endIdx));
  const normalisedContent = newContent.replace(/^\n+/, "").replace(/\n+$/, "");
  const updated = beforeBlock + "\n\n" + normalisedContent + "\n\n" + afterBlock;
  if (updated === existing) return false;
  if (!dryRun) fs.writeFileSync(filePath, updated, "utf-8");
  return true;
}

// Extract the bkit-managed block content from a file, stripping surrounding newlines.
// markerStyle defaults to "html-comment" for backward compat.
// Markers may be bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractManagedBlock(
  content: string,
  markerStyle: MarkerStyle = "html-comment",
): string | null {
  const [startMarker, endMarker] = selectMarkers(markerStyle);
  const starts = findAnchored(content, startMarker);
  const ends = findAnchored(content, endMarker);
  if (starts.length !== 1 || ends.length !== 1) return null;
  if (starts[0]! >= ends[0]!) return null;
  const startLineEnd = content.indexOf("\n", starts[0]! + startMarker.length);
  const inner =
    startLineEnd === -1 ? "" : content.slice(startLineEnd + 1, lineStartOf(content, ends[0]!));
  return inner.replace(/^\n+/, "").replace(/\n+$/, "");
}

// Extract the FULL bkit-managed block INCLUDING marker lines from a file.
// markerStyle defaults to "html-comment" for backward compat.
// Used to append a fresh block to a destination that has none. Markers may be
// bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractFullManagedBlock(
  content: string,
  markerStyle: MarkerStyle = "html-comment",
): string | null {
  const [startMarker, endMarker] = selectMarkers(markerStyle);
  const starts = findAnchored(content, startMarker);
  const ends = findAnchored(content, endMarker);
  if (starts.length !== 1 || ends.length !== 1) return null;
  if (starts[0]! >= ends[0]!) return null;
  const startLineStart = lineStartOf(content, starts[0]!);
  const endLineEnd = content.indexOf("\n", ends[0]! + endMarker.length);
  return endLineEnd === -1
    ? content.slice(startLineStart)
    : content.slice(startLineStart, endLineEnd + 1);
}

function listFilesRecursive(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFilesRecursive(p));
    else if (ent.isFile()) out.push(p);
  }
  return out;
}

// npm strips files matching certain dotfile names from packed tarballs.
// Templates targeting `<dest>/.gitignore` etc. are stored without the leading dot
// in `.agents/templates/` and remapped at install time.
const NPM_STRIP_REMAP: Record<string, string> = {
  gitignore: ".gitignore",
  npmignore: ".npmignore",
};

function remapDestPath(rel: string): string {
  const dir = path.dirname(rel);
  const base = path.basename(rel);
  const mapped = NPM_STRIP_REMAP[base];
  if (mapped === undefined) return rel;
  return dir === "." ? mapped : path.join(dir, mapped);
}

// Templates pass: walk .agents/templates/ and apply per-file rules:
//   1.  Dest missing                                  → write template verbatim
//   2.  Dest exists, has bkit markers                 → update only the managed block from template
//   3a. Dest exists, no markers, template HAS block   → append managed block at EOF (preserve existing content)
//   3b. Dest exists, no markers, template has no block → no-op (preserve project content)
//
// Returns both a count (`writes`) and a structured `writeSet` accumulator.
// Both dry-run and live-run paths populate `writeSet` identically — parity by construction.
export function runTemplates(
  dryRun: boolean,
  root = ".agents/templates",
): { writes: number; writeSet: WriteEntry[] } {
  if (!fs.existsSync(root)) return { writes: 0, writeSet: [] };
  const repoRoot = path.resolve(".");
  let writes = 0;
  const writeSet: WriteEntry[] = [];
  const tag = dryRun ? "[dry-run] " : "";

  for (const srcPath of listFilesRecursive(root)) {
    const destPath = remapDestPath(path.relative(root, srcPath));
    const resolvedDest = path.resolve(destPath);
    if (resolvedDest !== repoRoot && !resolvedDest.startsWith(repoRoot + path.sep)) {
      console.error(`${LOG_PREFIX} Refusing to write outside repo root: ${destPath}`);
      process.exit(1);
    }

    if (!fs.existsSync(destPath)) {
      ensureDir(path.dirname(destPath));
      if (!dryRun) {
        fs.copyFileSync(srcPath, destPath);
        fs.chmodSync(destPath, fs.statSync(srcPath).mode);
      }
      writes++;
      writeSet.push({ path: destPath, action: "write" });
      console.log(`${LOG_PREFIX} ${tag}write template: ${destPath}`);
      continue;
    }

    const destContent = fs.readFileSync(destPath, "utf-8");
    const srcContent = fs.readFileSync(srcPath, "utf-8");

    // Check for both html-comment and hash-comment markers in dest
    const hasHtmlMarkers = findAnchored(destContent, START_MARKER).length > 0;
    const hasHashMarkers = findAnchored(destContent, HASH_START_MARKER).length > 0;

    if (!hasHtmlMarkers && !hasHashMarkers) {
      // case 3: dest has no markers — try both styles in template
      const fullBlockHtml = extractFullManagedBlock(srcContent, "html-comment");
      const fullBlockHash = extractFullManagedBlock(srcContent, "hash-comment");
      const fullBlock = fullBlockHtml ?? fullBlockHash;
      if (fullBlock === null) continue; // 3b — template also has no block; preserve dest as-is
      // 3a — append the template's full block at EOF, preserve all existing dest content
      const sep =
        destContent.length === 0
          ? ""
          : destContent.endsWith("\n\n")
            ? ""
            : destContent.endsWith("\n")
              ? "\n"
              : "\n\n";
      const tail = fullBlock.endsWith("\n") ? "" : "\n";
      if (!dryRun) fs.writeFileSync(destPath, destContent + sep + fullBlock + tail, "utf-8");
      writes++;
      writeSet.push({ path: destPath, action: "append" });
      console.log(`${LOG_PREFIX} ${tag}append block: ${destPath}`);
      continue;
    }

    // case 2: dest has markers — determine which style and update
    const style: MarkerStyle = hasHashMarkers ? "hash-comment" : "html-comment";
    const blockContent = extractManagedBlock(srcContent, style);
    if (blockContent === null) {
      // Try the other style in case template uses different style than dest
      const altStyle: MarkerStyle = style === "hash-comment" ? "html-comment" : "hash-comment";
      const altBlock = extractManagedBlock(srcContent, altStyle);
      if (altBlock === null) {
        console.warn(
          `${LOG_PREFIX} Template has no usable bkit block but dest does: ${srcPath} — skipping`,
        );
        continue;
      }
      if (updateManagedBlock(destPath, altBlock, dryRun, style)) {
        writes++;
        writeSet.push({ path: destPath, action: "update" });
        console.log(`${LOG_PREFIX} ${tag}update block: ${destPath}`);
      }
      continue;
    }

    if (updateManagedBlock(destPath, blockContent, dryRun, style)) {
      writes++;
      writeSet.push({ path: destPath, action: "update" });
      console.log(`${LOG_PREFIX} ${tag}update block: ${destPath}`);
    }
  }

  return { writes, writeSet };
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
//   - .agents/templates/** → full mirror (bkit-owned subtree)
// In dogfood (running from .agents/scripts/ in the bkit repo itself), src and dst
// resolve to the same paths, so this pass is a no-op.
export function runPayload(dryRun: boolean): { writes: number; deletes: number } {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const PKG_ROOT = scriptDir.endsWith(`${path.sep}.agents${path.sep}scripts`)
    ? path.resolve(scriptDir, "..", "..")
    : path.resolve(scriptDir, "..");
  const PKG_AGENTS = path.join(PKG_ROOT, ".agents");

  let writes = 0;
  let deletes = 0;
  const tag = dryRun ? "[dry-run] " : "";

  if (!fs.existsSync(PKG_AGENTS)) return { writes, deletes };

  for (const subdir of ["workflows", "prompts"] as const) {
    const srcDir = path.join(PKG_AGENTS, subdir);
    const dstDir = path.join(".agents", subdir);
    if (!fs.existsSync(srcDir)) continue;
    if (path.resolve(srcDir) === path.resolve(dstDir)) continue;

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

async function main() {
  const { verb, modules } = parseArgs(process.argv.slice(2));

  if (verb === "help") {
    printUsage();
    return;
  }

  if (verb === "doctor") {
    LOG_PREFIX = "[bkit-doctor]";
    console.log(`${LOG_PREFIX} Running read-only advisory scan (no writes)`);
    const { blockers, advisories: preflightAdvisories } = runPreflight(modules, process.cwd());
    const allFindings = runPostInstallCheck(
      [...preflightAdvisories, ...blockers],
      { writes: [] },
      modules,
      process.cwd(),
      false,
    );
    const banner = formatChecklist(allFindings);
    if (banner) {
      console.log(banner);
    } else {
      console.log(`${LOG_PREFIX} No advisories found.`);
    }
    return;
  }

  const dryRun = verb === "check";
  if (dryRun) LOG_PREFIX = "[bkit-check]";

  if (dryRun) console.log(`${LOG_PREFIX} Running in check (dry-run) mode`);

  // --- Phase 1: Preflight (read-only, before any writes) ---
  // Must run BEFORE resolveTokens to short-circuit cleanly on blockers.
  const { blockers, advisories: preflightAdvisories } = runPreflight(modules, process.cwd());
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
  // Source: PACKAGE's .agents/prompts.md, not the consumer's. The consumer's
  // copy may be stale (e.g. upgrading from a release that predates a newly
  // added prompt) — reading from the package guarantees the lookup matches the
  // prompt files about to be installed and avoids a mid-install hard-fail in
  // applyT3 ("Missing model lookup for <name>"). Falls back to consumer file
  // when running from a non-package context (e.g. the bkit repo itself).
  let modelLookup: Map<string, string> = new Map();
  const pkgPromptsMd = path.join(getPkgRoot(), ".agents", "prompts.md");
  const promptsMdPath = fs.existsSync(pkgPromptsMd) ? pkgPromptsMd : ".agents/prompts.md";
  if (fs.existsSync(promptsMdPath)) {
    try {
      modelLookup = parseModelLookup(promptsMdPath);
    } catch {
      // Not fatal — cursor module will fail per-file if a model is missing
    }
  }

  // Seed preflight advisories into ctx so modules can accumulate into the same list.
  const advisories: import("./bkit-preflight.js").PreflightFinding[] = [...preflightAdvisories];
  const ws: WriteSet = { writes: [] };
  const postDispatch: Array<() => void> = [];

  const ctx: ModuleContext = {
    dryRun,
    tokens,
    modelLookup,
    advisories,
    ws,
    logPrefix: LOG_PREFIX,
    postDispatch,
  };

  // --- Phase 2: Install (current behaviour — dispatch modules) ---
  dispatchModules(modules, ctx);

  const totalWrites = ws.writes.length;

  if (dryRun && totalWrites > 0) {
    console.error(`${LOG_PREFIX} check: ${totalWrites} write(s) would occur — DRIFT DETECTED`);
    // Dry-run: skip Phase 3 (check stays read-only). Still emit Phase 1 advisories
    // accumulated in ctx.advisories to preserve parity with legacy printSink dump.
    const banner = formatChecklist(ctx.advisories);
    if (banner) console.log(banner);
    process.exit(1);
  }

  // Done banner first so the line count is easy to find above the checklist.
  console.log(`${LOG_PREFIX} Done. ${totalWrites} write(s).`);

  if (dryRun) {
    // Zero-drift dry-run: emit Phase 1 advisories if any.
    const banner = formatChecklist(ctx.advisories);
    if (banner) console.log(banner);
    return;
  }

  // --- Phase 3: Post-install checks (re-detect + unified output) ---
  // Changelog version-delta header (A7): surface what changed in the installed version.
  try {
    const pkgJsonPath = path.join(getPkgRoot(), "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8")) as { version?: string };
      const deltaHeader = readChangelogVersionDelta(pkg.version ?? "");
      if (deltaHeader) console.log(deltaHeader);
    }
  } catch {
    // Non-fatal — changelog header is informational
  }
  const postFindings = runPostInstallCheck(ctx.advisories, ws, modules, process.cwd());
  const banner = formatChecklist(postFindings);
  if (banner) console.log(banner);
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
