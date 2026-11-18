#!/usr/bin/env node
// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
/**
 * bkit-text-ceiling.mjs — #1028: one word ceiling per folder of agent-read text
 * (`.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`), kept in a committed record.
 *   check   exit 1 when a total is above or below its ceiling, 0 when equal
 *   lower   rewrite both ceilings to the current totals; refuses when a total is above its ceiling
 *   raise   --reason "<why>": rewrite both ceilings to the current totals; owner only, refuses unless
 *           stdin and stdout are a terminal and the person types the confirmation
 * A record the index holds unmerged is a conflict, whatever the file holds:
 *   check and raise refuse it and name lower.
 *   lower refuses when the record is outside --root.
 *   lower reads index stages 1 (base), 2 (ours) and 3 (theirs) and refuses when one is missing or
 *   lacks a whole-number ceiling, or while a counted *.md file is unmerged.
 *   Merge rule, only when git runs a merge or a rebase (no REVERT_HEAD or CHERRY_PICK_HEAD) and
 *   stage 3 is the record of that operation's own commit (MERGE_HEAD or REBASE_HEAD): each folder
 *   may hold min(ours + theirs - base, max(ours, theirs)) words.
 *   Every other conflict (revert, cherry-pick with or without -n, git am, git apply -3, stash pop,
 *   merge --squash, checkout -m, any of these while a rebase is paused unless it replays REBASE_HEAD,
 *   anything unknown):
 *   min(ours, ours + theirs - base) words.
 *   A total at most that becomes the ceiling, with the reason of the higher side in a merge or
 *   rebase (ours on a tie) and of ours otherwise; above it, lower refuses. lower never runs git add.
 * Options: --root <dir> (default: repo root), --record <file> (default: scripts/gate/bkit-text-ceiling.json).
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const FOLDERS = { prompts: ".bkit/core/prompts", workflows: ".bkit/core/workflows" };
const RAISE = 'pnpm bkit:text:ceiling raise --reason "<why>"';
const RECORD_REL = "scripts/gate/bkit-text-ceiling.json";

class CeilingError extends Error {}

const countWords = (text) => text.split(/\s+/).filter(Boolean).length;

function listFiles(root, folder) {
  const dir = path.join(root, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith(".md"))
    .sort()
    .map((n) => ({
      rel: `${folder}/${n}`,
      words: countWords(fs.readFileSync(path.join(dir, n), "utf-8")),
    }));
}

function git(root, args) {
  const r = spawnSync("git", args, { cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  return r.status === 0 ? r.stdout : null;
}

/** Files of one folder that grew since the record's last commit; the five largest without one. */
function grownFiles(root, recordPath, files) {
  const sha = git(root, ["log", "-1", "--format=%H", "--", recordPath])?.trim();
  let rows;
  if (sha) {
    rows = files.map((f) => {
      const old = git(root, ["show", `${sha}:${f.rel}`]);
      return { ...f, delta: f.words - (old === null ? 0 : countWords(old)) };
    });
    rows = rows.filter((r) => r.delta > 0);
  } else {
    rows = files.map((f) => ({ ...f, delta: f.words }));
  }
  return rows.sort((a, b) => b.delta - a.delta || a.rel.localeCompare(b.rel)).slice(0, 5);
}

const CONFLICT = Symbol("record in a merge conflict");

/** `recordPath` relative to `root` in git's `/` form, or null when it is outside `root`. */
function insideRel(root, recordPath) {
  const rel = path.relative(root, recordPath);
  if (!rel || rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

/** The record as `root` names it: relative when inside `root`, else absolute. */
const shownPath = (root, recordPath) => insideRel(root, recordPath) ?? recordPath;

/** Paths under `pathspecs` that the index of the repo at `root` holds unmerged; none outside a repo. */
function unmergedPaths(root, pathspecs) {
  const out = git(root, ["ls-files", "-u", "-z", "--", ...pathspecs]);
  if (out === null) return [];
  const paths = out
    .split("\0")
    .filter(Boolean)
    .map((l) => l.slice(l.indexOf("\t") + 1));
  return [...new Set(paths)];
}

/** Unmerged `*.md` files directly in the text folders: the files the totals count. */
function unmergedText(root) {
  const folders = Object.values(FOLDERS);
  return unmergedPaths(root, folders).filter((p) => {
    const dir = path.posix.dirname(p);
    return folders.includes(dir) && p.endsWith(".md");
  });
}

/**
 * True only when git runs a merge or a rebase and the record's stage 3 is that operation's own
 * incoming record: no REVERT_HEAD or CHERRY_PICK_HEAD, and stage 3 has the object id of the
 * record in MERGE_HEAD (a merge) or REBASE_HEAD (`rebase-merge/` or `rebase-apply/rebasing`;
 * `git am` writes `rebase-apply/applying`).
 */
function isMergeOrRebase(root, rel) {
  const id = (rev) => git(root, ["rev-parse", "-q", "--verify", rev])?.trim() || null;
  const exists = (name) => {
    const p = git(root, ["rev-parse", "--git-path", name])?.trim();
    return Boolean(p) && fs.existsSync(path.resolve(root, p));
  };
  if (id("REVERT_HEAD") || id("CHERRY_PICK_HEAD")) return false;
  const rebase = exists("rebase-merge") || exists("rebase-apply/rebasing");
  const incoming = rebase ? "REBASE_HEAD" : "MERGE_HEAD";
  if (!id(incoming)) return false;
  const stage3 = id(`:3:./${rel}`);
  return stage3 !== null && stage3 === id(`${incoming}:./${rel}`);
}

const validCeiling = (x) => Number.isSafeInteger(x) && x >= 0;

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    if (!(e instanceof SyntaxError)) throw e;
    return undefined;
  }
}

/**
 * The parsed record, null when absent, or CONFLICT when `allowConflict` and the index holds it
 * unmerged, whatever the file on disk holds.
 */
function loadRecord(root, recordPath, allowConflict) {
  const shown = shownPath(root, recordPath);
  if (unmergedPaths(root, [recordPath]).length > 0) {
    if (allowConflict) return CONFLICT;
    throw new CeilingError(
      `${shown} is in a merge conflict; resolve the text files, then run: pnpm bkit:text:ceiling lower`,
    );
  }
  if (!fs.existsSync(recordPath)) return null;
  const parsed = parseJson(fs.readFileSync(recordPath, "utf-8"));
  if (parsed !== undefined) return parsed;
  throw new CeilingError(
    `${shown} is not valid JSON; restore it from a commit where it is valid, then run: pnpm bkit:text:ceiling lower`,
  );
}

/**
 * Settles a record the index holds unmerged. Each folder may hold min(ours + theirs - base,
 * max(ours, theirs)) words in a merge or rebase, and min(ours, ours + theirs - base) otherwise.
 * Writes only when every total fits.
 */
function settleConflict(root, recordPath, ctx) {
  const shown = insideRel(root, recordPath);
  if (shown === null) {
    throw new CeilingError(
      `lower refused: ${recordPath} is outside the repository the script was pointed at (--root ${root}); the record is unchanged.`,
    );
  }
  const sides = {};
  for (const [side, stage] of [
    ["merge base", 1],
    ["ours", 2],
    ["theirs", 3],
  ]) {
    const text = git(root, ["show", `:${stage}:./${shown}`]);
    const rec = text === null ? undefined : parseJson(text);
    const valid = rec && Object.keys(FOLDERS).every((n) => validCeiling(rec[n]?.ceiling));
    if (!valid) {
      throw new CeilingError(
        `lower refused: the ${side} side of ${shown} is missing or lacks a whole-number ceiling for each folder; the record is unchanged.`,
      );
    }
    sides[side] = rec;
  }
  const text = unmergedText(root);
  if (text.length > 0) {
    throw new CeilingError(
      `lower refused: ${text.join(", ")} still unmerged; resolve the text conflicts first, because conflict markers would be counted as words. The record is unchanged.`,
    );
  }
  const { "merge base": base, ours, theirs } = sides;
  const merge = isMergeOrRebase(root, shown);
  const rec = {};
  const over = [];
  for (const name of Object.keys(FOLDERS)) {
    const [o, t, b] = [ours[name].ceiling, theirs[name].ceiling, base[name].ceiling];
    const sum = `ours ${o} + theirs ${t} - base ${b} = ${o + t - b}`;
    const allowed = merge ? Math.min(o + t - b, Math.max(o, t)) : Math.min(o, o + t - b);
    const how = merge
      ? `the smaller of ${sum} and the higher side ${Math.max(o, t)}`
      : `the smaller of ours ${o} and ${sum}`;
    const total = ctx.state[name].total;
    if (total > allowed) {
      over.push(
        `${name}: ${total} words is above the allowed ${allowed}, ${how}.\n` +
          "  Shorten the text. Only the owner raises the ceiling, at a terminal, with: pnpm bkit:text:ceiling raise --reason",
      );
    }
    const kept = merge && t > o ? theirs[name] : ours[name];
    rec[name] = { ceiling: total, reason: typeof kept.reason === "string" ? kept.reason : "" };
  }
  if (over.length > 0) {
    const what = merge
      ? "the merged text is above what both sides of the merge allow"
      : "this conflict is not a merge or a rebase bringing in its own commit, and only a merge or a rebase carries a raise from the other side";
    throw new CeilingError(`lower refused: ${what}; the record is unchanged.\n${over.join("\n")}`);
  }
  writeRecord(recordPath, rec);
  return { shown, merge };
}

function writeRecord(recordPath, rec) {
  const sorted = {};
  for (const k of Object.keys(rec).sort()) {
    sorted[k] = { ceiling: rec[k].ceiling, reason: rec[k].reason };
  }
  fs.mkdirSync(path.dirname(recordPath), { recursive: true });
  fs.writeFileSync(recordPath, `${JSON.stringify(sorted, null, 2)}\n`);
}

function load(root, recordPath, allowConflict = false) {
  const record = loadRecord(root, recordPath, allowConflict);
  const state = {};
  const empty = [];
  for (const [name, folder] of Object.entries(FOLDERS)) {
    const files = listFiles(root, folder);
    if (files.length === 0) empty.push(folder);
    state[name] = { files, total: files.reduce((a, f) => a + f.words, 0) };
  }
  return { record, state, empty };
}

function requireFolders(ctx) {
  if (ctx.empty.length > 0) {
    throw new CeilingError(
      `${ctx.empty.join(", ")} is missing or holds no *.md file; the ceiling cannot be counted. Restore the folder, or move the record's folder with the text.`,
    );
  }
}

function problems(root, recordPath, ctx) {
  const { record, state } = ctx;
  const out = [];
  let above = false;
  for (const name of Object.keys(FOLDERS)) {
    const total = state[name].total;
    const ceiling = record?.[name]?.ceiling;
    if (typeof ceiling !== "number") {
      out.push(`${name}: no ceiling in ${recordPath}.`);
      above = true;
      continue;
    }
    if (total > ceiling) {
      above = true;
      const grown = grownFiles(root, recordPath, state[name].files)
        .map((f) => `    ${f.rel} (+${f.delta}, ${f.words} words)`)
        .join("\n");
      out.push(
        `${name}: ${total} words is above the ceiling of ${ceiling}, over the ceiling by ${total - ceiling} words. Files that grew most:\n${grown}\n` +
          "  Shorten the text. Only the owner raises the ceiling, at a terminal, with: pnpm bkit:text:ceiling raise --reason",
      );
    } else if (total < ceiling) {
      out.push(
        `${name}: ${total} words is below the ceiling of ${ceiling}. Lower the ceiling in this change: pnpm bkit:text:ceiling lower`,
      );
    }
  }
  return { out, above };
}

function next(ctx, reasonFor) {
  const rec = {};
  for (const name of Object.keys(FOLDERS)) {
    const old = ctx.record?.[name];
    const total = ctx.state[name].total;
    rec[name] = {
      ceiling: total,
      reason: old && old.ceiling === total ? old.reason : (reasonFor ?? old?.reason ?? ""),
    };
  }
  return rec;
}

/**
 * The write path of `raise`. `confirm` receives the old and new ceilings of each folder and
 * resolves true only when the person typed the confirmation; the record is written only then.
 * Returns true when written.
 */
export async function raiseCeilings({ root, record, reason, confirm }) {
  const recordPath = path.resolve(record ?? path.join(root, RECORD_REL));
  const ctx = load(path.resolve(root), recordPath);
  requireFolders(ctx);
  const why = (reason ?? "").trim();
  if (!why) {
    throw new CeilingError(`raise refused: a non-empty --reason is required. Usage: ${RAISE}`);
  }
  const proposed = next(ctx, why);
  const shown = Object.keys(FOLDERS)
    .map((n) => `${n}: ceiling ${ctx.record?.[n]?.ceiling ?? "none"} -> ${proposed[n].ceiling}`)
    .join("\n");
  if (!(await confirm(shown))) {
    throw new CeilingError(
      "raise cancelled: the confirmation was not given; the record is unchanged.",
    );
  }
  writeRecord(recordPath, proposed);
  return true;
}

async function typedConfirm(shown) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log(`Raise the text ceilings (owner only):\n${shown}`);
    const answer = await rl.question("Type RAISE to write the record: ");
    return answer.trim() === "RAISE";
  } finally {
    rl.close();
  }
}

async function main(argv) {
  const command = argv[0];
  const opt = (name) => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? undefined : (argv[i + 1] ?? "");
  };
  const root = path.resolve(opt("root") ?? path.resolve(import.meta.dirname, "..", ".."));
  const recordPath = path.resolve(opt("record") ?? path.join(root, RECORD_REL));

  if (command === "check") {
    const ctx = load(root, recordPath);
    requireFolders(ctx);
    const { out } = problems(root, recordPath, ctx);
    if (out.length > 0) {
      console.error(`[bkit:text:ceiling] FAIL\n${out.join("\n")}`);
      process.exit(1);
    }
    console.log(
      `[bkit:text:ceiling] ok — ${Object.keys(FOLDERS)
        .map((n) => `${n} ${ctx.state[n].total}`)
        .join(", ")}`,
    );
  } else if (command === "lower") {
    const ctx = load(root, recordPath, true);
    requireFolders(ctx);
    if (ctx.record === CONFLICT) {
      const { shown, merge } = settleConflict(root, recordPath, ctx);
      const how = merge
        ? "settled from both sides of the merge"
        : "settled against this branch's own ceiling";
      console.log(`[bkit:text:ceiling] record ${how}; stage it with: git add ${shown}`);
      return;
    }
    const { above } = problems(root, recordPath, ctx);
    const grew = Object.keys(FOLDERS).some(
      (n) =>
        typeof ctx.record?.[n]?.ceiling !== "number" || ctx.state[n].total > ctx.record[n].ceiling,
    );
    if (above || grew) {
      console.error(
        `[bkit:text:ceiling] lower refused: a total is above its ceiling or the record is missing. Owner only: ${RAISE}`,
      );
      process.exit(1);
    }
    writeRecord(recordPath, next(ctx, undefined));
    console.log("[bkit:text:ceiling] ceilings lowered to the current totals");
  } else if (command === "raise") {
    const ctx = load(root, recordPath);
    requireFolders(ctx);
    if (!(opt("reason") ?? "").trim()) {
      throw new CeilingError(`raise refused: a non-empty --reason is required. Usage: ${RAISE}`);
    }
    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      throw new CeilingError(
        "raise refused: it runs only at a terminal (stdin and stdout) and the owner types the confirmation.",
      );
    }
    await raiseCeilings({ root, record: recordPath, reason: opt("reason"), confirm: typedConfirm });
    console.log("[bkit:text:ceiling] ceilings raised to the current totals");
  } else {
    console.error(
      "Usage: bkit-text-ceiling.mjs check|lower|raise [--reason <why>] [--root <dir>] [--record <file>]",
    );
    process.exit(1);
  }
}

function isEntryScript() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch (e) {
    if (e.code === "ENOENT") return false;
    throw e;
  }
}

if (isEntryScript()) {
  main(process.argv.slice(2)).catch((e) => {
    if (e instanceof CeilingError) {
      console.error(`[bkit:text:ceiling] ${e.message}`);
      process.exit(1);
    }
    throw e;
  });
}
