#!/usr/bin/env node
// Example. Copy into scripts/cleanup/ and own it. bkit install does not write this file
// and does not overwrite a copy.
/**
 * bkit-tmp-prune.mjs — deletes files under the checkout's `tmp/` last modified more than
 * `--days` days ago, then the folders that leaves empty.
 *
 * Scope: `tmp/` at the top of the checkout the cwd sits in; each worktree has its own.
 * Symlinks are never followed: a symlinked `tmp/` is left alone; a symlink inside it is
 * aged and removed like a file. A folder goes only when empty and either this sweep
 * emptied it or its own last change is past the cutoff, so a fresh empty folder another
 * process just made stays. An entry another process removes or fills mid-sweep is skipped.
 *
 * Usage:  node scripts/cleanup/bkit-tmp-prune.mjs [--days=<n>]   (default 7)
 * Exit:   0 = swept or no `tmp/`, 1 = an entry could not be removed, 2 = bad arguments.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Codes meaning another process changed the entry mid-sweep: skip it, not a failure. */
const RACE_CODES = new Set(["ENOENT", "ENOTDIR", "ENOTEMPTY", "EEXIST"]);

/** Remove one entry; true when it is gone. */
function remove(full, isDir, result) {
  try {
    if (isDir) fs.rmdirSync(full);
    else fs.unlinkSync(full);
  } catch (err) {
    if (!RACE_CODES.has(err.code)) result.failed.push(`${full}: ${err.code ?? err.message}`);
    return err.code === "ENOENT";
  }
  if (isDir) result.dirs++;
  else result.files++;
  return true;
}

/** Prune `dir`'s contents; true when `dir` itself should go. `stat` is read before the sweep. */
function sweep(dir, stat, cutoff, result) {
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch (err) {
    if (!RACE_CODES.has(err.code)) result.failed.push(`${dir}: ${err.code ?? err.message}`);
    return false;
  }
  let kept = 0;
  let removed = 0;
  for (const name of names) {
    const full = path.join(dir, name);
    const entry = fs.lstatSync(full, { throwIfNoEntry: false });
    if (!entry) continue;
    const gone = entry.isDirectory()
      ? sweep(full, entry, cutoff, result) && remove(full, true, result)
      : entry.mtimeMs < cutoff && remove(full, false, result);
    if (gone) removed++;
    else kept++;
  }
  return kept === 0 && (removed > 0 || stat.mtimeMs < cutoff);
}

/**
 * Delete everything under `dir` older than `days` days; `dir` itself always stays.
 * @returns {{ files: number, dirs: number, failed: string[] }}
 */
export function pruneTmp(dir, { days = DEFAULT_DAYS, now = Date.now() } = {}) {
  const result = { files: 0, dirs: 0, failed: [] };
  const stat = fs.lstatSync(dir, { throwIfNoEntry: false });
  if (stat?.isDirectory()) sweep(dir, stat, now - days * DAY_MS, result);
  return result;
}

/** Top of the checkout the cwd sits in; the cwd itself outside git. */
function checkoutTop(cwd) {
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], { cwd, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : cwd;
}

/** `--days=<n>` with n >= 1; null on anything else. */
export function parseDays(argv) {
  let days = DEFAULT_DAYS;
  for (const arg of argv) {
    const m = /^--days=([1-9]\d*)$/.exec(arg);
    if (!m) return null;
    days = Number(m[1]);
  }
  return days;
}

export function main(argv, { cwd = process.cwd(), log = console.log, err = console.error } = {}) {
  const days = parseDays(argv);
  if (days === null) {
    err("usage: node scripts/cleanup/bkit-tmp-prune.mjs [--days=<n>]   (n >= 1, default 7)");
    return 2;
  }
  const { files, dirs, failed } = pruneTmp(path.join(checkoutTop(cwd), "tmp"), { days });
  if (files + dirs > 0) {
    const n = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
    log(
      `[tmp-prune] removed ${n(files, "file")} and ${n(dirs, "folder")} older than ${n(days, "day")} from tmp/`,
    );
  }
  for (const line of failed) err(`[tmp-prune] could not remove ${line}`);
  return failed.length > 0 ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
