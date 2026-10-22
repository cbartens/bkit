// install/template-copies.ts — the consumer's `.bkit/templates/` copies: the sync that
// refreshes them, and the dotfile remap they share with the install/upgrade walk.

import * as fs from "node:fs";
import * as path from "node:path";
import {
  NPM_STRIP_REMAP,
  getPkgRoot,
  getTemplatesRoot,
  TEMPLATE_COPIES_DIR,
} from "../shared/package-roots.js";
import type { WriteSet } from "./write.js";

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

// The dotfile remap: the one table lives in shared/package-roots.ts (NPM_STRIP_REMAP); the
// module install pass (install/modules/index.ts) and the `bkit upgrade` template walk both
// call this, so they never disagree about how a payload basename maps to its dest.
export function remapTemplateDest(rel: string): string {
  const dir = path.dirname(rel);
  const base = path.basename(rel);
  const mapped = NPM_STRIP_REMAP[base];
  if (mapped === undefined) return rel;
  return dir === "." ? mapped : path.join(dir, mapped);
}

// Templates installed executable. The npm tarball stores every file 0644, so the source
// mode cannot carry the exec bit to a consumer; this list does. A test pins it to the
// templates the repo tracks as executable.
export const EXECUTABLE_TEMPLATES: readonly string[] = [
  ".claude/hooks/bkit-cloud-bootstrap.sh",
  ".husky/post-commit",
  ".husky/pre-commit",
  ".husky/pre-push",
  "scripts/ci/bkit-local-stack-lock.sh",
  "scripts/env-backup/bkit-env-backup.mjs",
  "scripts/graphify/bkit-graph-pre-push.sh",
  "scripts/graphify/bkit-graphify.sh",
  "scripts/launchd/bkit-launchd-env.sh",
  "scripts/prettier/bkit-insert-ignore.mjs",
  "scripts/secrets/bkit-secrets.mjs",
  "scripts/serena/bkit-serena-mcp.sh",
];

const EXEC_BITS = 0o111;

/** The mode a template copy gets: the source mode, plus the exec bits for an executable template. */
function copyMode(rel: string, srcMode: number): number {
  const normalized = rel.split(path.sep).join("/");
  return EXECUTABLE_TEMPLATES.includes(normalized) ? srcMode | EXEC_BITS : srcMode;
}

/** Template paths (relative to `.bkit/templates/`) a sync changed, added or removed. */
export interface TemplateCopyChanges {
  changed: string[];
  added: string[];
  removed: string[];
}

// Copy the whole templates root from the package into the consumer's
// `.bkit/templates/`, raw: no token substitution, so the copy is the package bytes and
// `git diff .bkit/templates` on an upgrade commit is the template changelog. Byte-compares
// first, keeps the source mode and gives the EXECUTABLE_TEMPLATES their exec bits (a
// same-bytes copy that lost them is a change), and prunes copies that left the set. Every change pushes a ws write in dry-run and live alike, so `bkit check`
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
    shipped.add(rel);
    const dstPath = path.join(dstRoot, rel);
    const exists = fs.existsSync(dstPath);
    const mode = copyMode(rel, fs.statSync(srcPath).mode);
    const modeOk = !exists || (fs.statSync(dstPath).mode & mode & EXEC_BITS) === (mode & EXEC_BITS);
    if (exists && modeOk && fs.readFileSync(srcPath).equals(fs.readFileSync(dstPath))) continue;
    (exists ? changes.changed : changes.added).push(rel);
    if (!opts.dryRun) {
      fs.mkdirSync(path.dirname(dstPath), { recursive: true });
      fs.copyFileSync(srcPath, dstPath);
      fs.chmodSync(dstPath, mode);
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
  "Templates (adopt, do not skip): read .bkit/templates.md; bkit never applies templates, so adopt each copy in .bkit/templates/ unless adoption would break existing functionality — state which you did not adopt and why. (If your own gates scan the repo, ignore .bkit/templates/.)";

/**
 * Changed templates whose ADOPTED copy also backs a gate: the consequence of leaving it
 * stale, keyed by template rel path. The upgrade line names it so the consequence reaches
 * the same run that changed the copy — a stale adopted copy can redden a gate that a
 * bkit-installed file trips, and the agent at that gate never sees this report.
 */
export const TEMPLATE_CHANGE_CONSEQUENCES: Readonly<Record<string, string>> = {
  "slop-scan.config.json":
    "your adopted copy's guardrails exemptions are now stale; your slop gate may go red",
};

/** `  changed: <dest>`, plus the consequence when that template's adopted copy backs a gate. */
function formatChangedLine(rel: string): string {
  const line = `  changed: ${path.join(TEMPLATE_COPIES_DIR, rel)}`;
  const note = TEMPLATE_CHANGE_CONSEQUENCES[rel];
  return note === undefined ? line : `${line} — ${note}`;
}

/**
 * The upgrade report for a template sync: one line per changed, added or removed
 * template, then where to read about adopting them. Empty when nothing changed.
 */
export function formatTemplateChanges(changes: TemplateCopyChanges): string {
  const lines = [
    ...changes.changed.map(formatChangedLine),
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
