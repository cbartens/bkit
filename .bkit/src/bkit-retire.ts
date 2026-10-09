// bkit-retire.ts — remove files bkit used to own and no longer ships.
//
// Install and upgrade overwrite what bkit owns, but never delete a file bkit has
// dropped, so a retired script would sit in every consumer's repo forever. This
// deletes it when it still matches the hash bkit recorded when it last wrote it
// (`.bkit/version` `canonicalHashes`). A file the consumer edited stays, and an
// advisory names what replaced it. Consumer files that still call a retired path
// (CI workflows, package.json scripts) get one advisory per line, because nothing
// else would tell them the call now fails.

import * as fs from "node:fs";
import * as path from "node:path";

import type { PreflightFinding } from "./bkit-preflight.js";
import { isConsumerModified, readBkitVersion, writeBkitVersion } from "./bkit-version.js";

export interface RetiredFile {
  /** Consumer-relative path bkit used to write. */
  path: string;
  /** What does its job now, e.g. a `bkit <noun> <verb>` command. */
  replacement: string;
}

/** Files bkit owned and no longer ships. Append when a file is dropped; never remove an entry. */
export const RETIRED_OWNED_FILES: readonly RetiredFile[] = [];

export const isRetiredOwned = (
  relPath: string,
  list: readonly RetiredFile[] = RETIRED_OWNED_FILES,
) => list.some((r) => r.path === relPath);

export interface RetireResult {
  /** Deleted (or, on dry-run, would be deleted): unchanged since bkit wrote them. */
  deleted: string[];
  /** Left in place: edited by the consumer, or no hash on record. */
  kept: string[];
}

/**
 * Delete each retired file that is unchanged since bkit wrote it, and drop every
 * retired path's hash from `.bkit/version`. Dry-run reports without touching disk.
 */
export function retireOwnedFiles(
  cwd: string,
  opts: { dryRun: boolean; log: (line: string) => void },
  list: readonly RetiredFile[] = RETIRED_OWNED_FILES,
): RetireResult {
  const result: RetireResult = { deleted: [], kept: [] };
  const versionFile = path.join(cwd, ".bkit", "version");
  const version = readBkitVersion(versionFile);
  const hashes = version?.canonicalHashes ?? {};
  const tag = opts.dryRun ? "[dry-run] " : "";

  for (const r of list) {
    const abs = path.join(cwd, r.path);
    if (!fs.existsSync(abs)) continue;
    if (isConsumerModified(r.path, abs, hashes)) {
      result.kept.push(r.path);
      opts.log(
        `${tag}retire: kept ${r.path} — edited since bkit wrote it (replaced by ${r.replacement})`,
      );
      continue;
    }
    result.deleted.push(r.path);
    opts.log(`${tag}retire: delete ${r.path} (replaced by ${r.replacement})`);
    if (!opts.dryRun) fs.rmSync(abs);
  }

  const stale = Object.keys(hashes).filter((p) => isRetiredOwned(p, list));
  if (version && stale.length > 0 && !opts.dryRun) {
    const canonicalHashes = { ...hashes };
    for (const p of stale) delete canonicalHashes[p];
    writeBkitVersion(versionFile, { ...version, canonicalHashes });
  }
  return result;
}

export interface RetiredCaller {
  file: string;
  line: number;
  retired: RetiredFile;
}

/** Lines in the consumer's CI workflows and package.json that still name a retired path. */
export function findRetiredCallers(
  cwd: string,
  list: readonly RetiredFile[] = RETIRED_OWNED_FILES,
): RetiredCaller[] {
  if (list.length === 0) return [];
  const files: string[] = [];
  const workflows = path.join(".github", "workflows");
  if (fs.existsSync(path.join(cwd, workflows))) {
    for (const f of fs.readdirSync(path.join(cwd, workflows)).sort()) {
      if (/\.ya?ml$/.test(f)) files.push(path.join(workflows, f));
    }
  }
  if (fs.existsSync(path.join(cwd, "package.json"))) files.push("package.json");

  const callers: RetiredCaller[] = [];
  for (const file of files) {
    const lines = fs.readFileSync(path.join(cwd, file), "utf-8").split("\n");
    lines.forEach((text, i) => {
      for (const retired of list) {
        if (text.includes(retired.path)) callers.push({ file, line: i + 1, retired });
      }
    });
  }
  return callers;
}

/** Advisories for retired files left on disk and for consumer lines that still call one. */
export function detectRetiredOwnedFiles(
  cwd: string,
  list: readonly RetiredFile[] = RETIRED_OWNED_FILES,
): PreflightFinding[] {
  const findings: PreflightFinding[] = [];
  const hashes = readBkitVersion(path.join(cwd, ".bkit", "version"))?.canonicalHashes ?? {};
  for (const r of list) {
    const abs = path.join(cwd, r.path);
    // An unedited copy is retireOwnedFiles' to delete, not the consumer's to act on.
    if (!fs.existsSync(abs) || !isConsumerModified(r.path, abs, hashes)) continue;
    findings.push({
      id: `retired-file-kept:${r.path}`,
      severity: "advisory",
      detect: `${r.path} is no longer shipped by bkit. It was edited after bkit wrote it, so bkit left it in place.`,
      action: `Move any change you still need to ${r.replacement}, then delete it: rm ${r.path}`,
    });
  }
  for (const c of findRetiredCallers(cwd, list)) {
    findings.push({
      id: `retired-file-caller:${c.file}:${c.line}`,
      severity: "advisory",
      detect: `${c.file}:${c.line} calls ${c.retired.path}, which bkit no longer ships — that line fails on its next run.`,
      action: `In ${c.file} line ${c.line}, replace the call to ${c.retired.path} with ${c.retired.replacement}.`,
    });
  }
  return findings;
}
