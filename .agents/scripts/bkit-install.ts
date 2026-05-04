#!/usr/bin/env bun
import * as fs from "node:fs";
import * as path from "node:path";

// Hard allowlist: install ONLY writes to these four directories
const WRITE_DIRS = [
  ".claude/agents",
  ".claude/commands",
  ".cursor/agents",
  ".cursor/commands",
] as const;

type Host = "claude" | "cursor";
type Verb = "install" | "check";

function parseArgs(): { verb: Verb; hosts: Host[] } {
  const args = process.argv.slice(2);
  let verb: Verb = "install";
  let hosts: Host[] = ["claude", "cursor"];

  if (args[0] === "install" || args[0] === "check") {
    verb = args[0] as Verb;
    args.shift();
  }

  const hostFlag = args.find((a) => a.startsWith("--host="));
  if (hostFlag) {
    const h = hostFlag.slice("--host=".length) as Host;
    if (h !== "claude" && h !== "cursor") {
      console.error(`[bkit-install] Unknown host: ${h}`);
      process.exit(1);
    }
    hosts = [h];
  }

  return { verb, hosts };
}

// Parse .agents/prompts.md § Models table → Map<name, cursorModel>
export function parseModelLookup(subagentsMdPath = ".agents/prompts.md"): Map<string, string> {
  const content = fs.readFileSync(subagentsMdPath, "utf-8");
  const map = new Map<string, string>();

  const modelsIdx = content.indexOf("## Models");
  if (modelsIdx === -1) {
    console.error("[bkit-install] Could not find ## Models section in .agents/prompts.md");
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
    console.error("[bkit-install] Subagent frontmatter missing 'name' field");
    process.exit(1);
  }

  const cursorModel = modelLookup.get(name);
  if (!cursorModel) {
    console.error(`[bkit-install] Missing model lookup for ${name}`);
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

function listMdFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
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

function removeOrphans(destDir: string, sourceFiles: Set<string>, dryRun: boolean): string[] {
  const allowed = WRITE_DIRS.map((d) => path.resolve(d));
  const resolved = path.resolve(destDir);
  if (!allowed.includes(resolved)) {
    console.error(`[bkit-install] Refusing orphan removal outside allowlist: ${destDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(destDir)) return [];
  const removed: string[] = [];
  for (const f of fs.readdirSync(destDir)) {
    if (!f.endsWith(".md")) continue;
    if (!sourceFiles.has(f)) {
      if (!dryRun) fs.rmSync(path.join(destDir, f));
      removed.push(f);
    }
  }
  return removed;
}

const START_MARKER = "<!-- bkit:start -->";
const END_MARKER = "<!-- bkit:end -->";

// Recognised line-comment prefixes — bare, shell (#), JS/TS (//).
const ALLOWED_PREFIXES = ["", "# ", "// "];

// Find line-anchored marker positions. A marker is line-anchored when:
//   - The line before the marker is empty, "# ", or "// " (comment prefixes).
//   - The character after the marker is end-of-line or end-of-file.
// Backtick-quoted prose mentions are ignored.
function findLineAnchoredMarkers(content: string, marker: string): number[] {
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

// Managed-block writer: update content between <!-- bkit:start --> and <!-- bkit:end -->.
// Markers may be bare (markdown) or comment-prefixed (`# ` shell, `// ` JS/TS) — prefixes
// are preserved on update. No-op (warn + skip) when markers absent, duplicated, or inverted.
export function updateManagedBlock(filePath: string, newContent: string, dryRun = false): boolean {
  if (!fs.existsSync(filePath)) return false;
  const existing = fs.readFileSync(filePath, "utf-8");
  const starts = findLineAnchoredMarkers(existing, START_MARKER);
  const ends = findLineAnchoredMarkers(existing, END_MARKER);
  if (starts.length === 0 || ends.length === 0) {
    console.warn(`[bkit-install] Managed block markers absent in ${filePath} — skipping`);
    return false;
  }
  if (starts.length > 1 || ends.length > 1) {
    console.warn(
      `[bkit-install] Multiple managed-block markers in ${filePath} — skipping (expected exactly one of each)`,
    );
    return false;
  }
  const startIdx = starts[0];
  const endIdx = ends[0];
  if (startIdx >= endIdx) {
    console.warn(
      `[bkit-install] Inverted managed-block markers in ${filePath} (end before start) — skipping`,
    );
    return false;
  }
  // Slice on line boundaries so any comment prefix on the marker lines is preserved.
  const startLineEnd = existing.indexOf("\n", startIdx + START_MARKER.length);
  const beforeBlock =
    startLineEnd === -1
      ? existing.slice(0, startIdx + START_MARKER.length)
      : existing.slice(0, startLineEnd);
  const afterBlock = existing.slice(lineStartOf(existing, endIdx));
  const normalisedContent = newContent.replace(/^\n+/, "").replace(/\n+$/, "");
  const updated = beforeBlock + "\n\n" + normalisedContent + "\n\n" + afterBlock;
  if (updated === existing) return false;
  if (!dryRun) fs.writeFileSync(filePath, updated, "utf-8");
  return true;
}

// Extract the bkit-managed block content from a file, stripping surrounding newlines.
// Markers may be bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractManagedBlock(content: string): string | null {
  const starts = findLineAnchoredMarkers(content, START_MARKER);
  const ends = findLineAnchoredMarkers(content, END_MARKER);
  if (starts.length !== 1 || ends.length !== 1) return null;
  if (starts[0] >= ends[0]) return null;
  const startLineEnd = content.indexOf("\n", starts[0] + START_MARKER.length);
  const inner =
    startLineEnd === -1 ? "" : content.slice(startLineEnd + 1, lineStartOf(content, ends[0]));
  return inner.replace(/^\n+/, "").replace(/\n+$/, "");
}

// Extract the FULL bkit-managed block INCLUDING marker lines from a file.
// Used to append a fresh block to a destination that has none. Markers may be
// bare or comment-prefixed. Returns null if markers absent, duplicated, or inverted.
export function extractFullManagedBlock(content: string): string | null {
  const starts = findLineAnchoredMarkers(content, START_MARKER);
  const ends = findLineAnchoredMarkers(content, END_MARKER);
  if (starts.length !== 1 || ends.length !== 1) return null;
  if (starts[0] >= ends[0]) return null;
  const startLineStart = lineStartOf(content, starts[0]);
  const endLineEnd = content.indexOf("\n", ends[0] + END_MARKER.length);
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

// Templates pass: walk .agents/templates/ and apply per-file rules:
//   1.  Dest missing                                  → write template verbatim
//   2.  Dest exists, has bkit markers                 → update only the managed block from template
//   3a. Dest exists, no markers, template HAS block   → append managed block at EOF (preserve existing content)
//   3b. Dest exists, no markers, template has no block → no-op (preserve project content)
export function runTemplates(dryRun: boolean, root = ".agents/templates"): { writes: number } {
  if (!fs.existsSync(root)) return { writes: 0 };
  const repoRoot = path.resolve(".");
  let writes = 0;
  const tag = dryRun ? "[dry-run] " : "";

  for (const srcPath of listFilesRecursive(root)) {
    const destPath = path.relative(root, srcPath);
    const resolvedDest = path.resolve(destPath);
    if (resolvedDest !== repoRoot && !resolvedDest.startsWith(repoRoot + path.sep)) {
      console.error(`[bkit-install] Refusing to write outside repo root: ${destPath}`);
      process.exit(1);
    }

    if (!fs.existsSync(destPath)) {
      ensureDir(path.dirname(destPath));
      if (!dryRun) {
        fs.copyFileSync(srcPath, destPath);
        fs.chmodSync(destPath, fs.statSync(srcPath).mode);
      }
      writes++;
      console.log(`[bkit-install] ${tag}write template: ${destPath}`);
      continue;
    }

    const destContent = fs.readFileSync(destPath, "utf-8");
    const srcContent = fs.readFileSync(srcPath, "utf-8");

    if (findLineAnchoredMarkers(destContent, START_MARKER).length === 0) {
      // case 3: dest has no markers
      const fullBlock = extractFullManagedBlock(srcContent);
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
      console.log(`[bkit-install] ${tag}append block: ${destPath}`);
      continue;
    }

    const blockContent = extractManagedBlock(srcContent);
    if (blockContent === null) {
      console.warn(
        `[bkit-install] Template has no usable bkit block but dest does: ${srcPath} — skipping`,
      );
      continue;
    }

    if (updateManagedBlock(destPath, blockContent, dryRun)) {
      writes++;
      console.log(`[bkit-install] ${tag}update block: ${destPath}`);
    }
  }

  return { writes };
}

function runHost(
  host: Host,
  modelLookup: Map<string, string>,
  dryRun: boolean,
): { writes: number; deletes: number } {
  let writes = 0;
  let deletes = 0;
  const tag = dryRun ? "[dry-run] " : "";

  if (host === "claude") {
    // Byte-identical passthrough: commands and subagents
    const pairs: Array<[string, string]> = [
      [".agents/workflows", ".claude/commands"],
      [".agents/prompts", ".claude/agents"],
    ];
    for (const [src, dest] of pairs) {
      ensureDir(dest);
      const files = listMdFiles(src);
      const sourceSet = new Set(files);
      for (const f of files) {
        if (installFile(path.join(src, f), path.join(dest, f), null, dryRun)) {
          writes++;
          console.log(`[bkit-install] ${tag}write: ${path.join(dest, f)}`);
        }
      }
      for (const f of removeOrphans(dest, sourceSet, dryRun)) {
        deletes++;
        console.log(`[bkit-install] ${tag}delete orphan: ${path.join(dest, f)}`);
      }
    }
  } else {
    // Cursor: commands (T1+T2), subagents (T3)
    {
      const src = ".agents/workflows";
      const dest = ".cursor/commands";
      ensureDir(dest);
      const files = listMdFiles(src);
      const sourceSet = new Set(files);
      for (const f of files) {
        const transform = (c: string) => applyT2(applyT1(c));
        if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
          writes++;
          console.log(`[bkit-install] ${tag}write: ${path.join(dest, f)}`);
        }
      }
      for (const f of removeOrphans(dest, sourceSet, dryRun)) {
        deletes++;
        console.log(`[bkit-install] ${tag}delete orphan: ${path.join(dest, f)}`);
      }
    }
    {
      const src = ".agents/prompts";
      const dest = ".cursor/agents";
      ensureDir(dest);
      const files = listMdFiles(src);
      const sourceSet = new Set(files);
      for (const f of files) {
        const transform = (c: string) => applyT3(c, modelLookup);
        if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
          writes++;
          console.log(`[bkit-install] ${tag}write: ${path.join(dest, f)}`);
        }
      }
      for (const f of removeOrphans(dest, sourceSet, dryRun)) {
        deletes++;
        console.log(`[bkit-install] ${tag}delete orphan: ${path.join(dest, f)}`);
      }
    }
  }

  return { writes, deletes };
}

function main() {
  const { verb, hosts } = parseArgs();
  const dryRun = verb === "check";

  if (dryRun) console.log("[bkit-install] Running in check (dry-run) mode");

  const modelLookup = parseModelLookup();
  let totalWrites = 0;
  let totalDeletes = 0;

  for (const host of hosts) {
    console.log(`[bkit-install] Installing for host: ${host}${dryRun ? " (dry-run)" : ""}`);
    const { writes, deletes } = runHost(host, modelLookup, dryRun);
    totalWrites += writes;
    totalDeletes += deletes;
  }

  console.log(`[bkit-install] Running templates pass${dryRun ? " (dry-run)" : ""}`);
  totalWrites += runTemplates(dryRun).writes;

  if (dryRun && (totalWrites > 0 || totalDeletes > 0)) {
    console.error(
      `[bkit-install] check: ${totalWrites} writes and ${totalDeletes} deletes would occur — DRIFT DETECTED`,
    );
    process.exit(1);
  }

  console.log(`[bkit-install] Done. ${totalWrites} writes, ${totalDeletes} deletes.`);
}

if (import.meta.main) {
  main();
}
