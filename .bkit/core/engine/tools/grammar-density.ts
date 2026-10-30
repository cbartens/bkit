// tools/grammar-density.ts — articles (`a`, `an`, `the`) per 1,000 words of agent text.
//
// The measure behind `.bkit/core/.bkit/authoring.md` § All Agent-Read Files, Plain, complete sentences: clipped text
// drops articles, plain English keeps them. `pnpm grammar:density` prints one row per
// group for the working tree, `--rev=<rev>` for a past commit, and `--diff=<base>..<head>`
// for only the lines `<head>` added. Repo-only tooling, like `tools/instructions.ts`.
//
// Counting: fence marker lines (a line starting with three backticks) are dropped; the
// rest is lowercased, every character but `a`-`z` becomes a word break.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

export interface Count {
  words: number;
  articles: number;
  per1k: number;
}

export interface GroupCount extends Count {
  name: string;
}

/** Where files come from: the working tree or one git revision. */
export interface Source {
  /** Repo-relative paths of every file under `dir`, sorted. */
  list(dir: string): string[];
  /** File content, or undefined when the file is absent. */
  read(file: string): string | undefined;
}

interface GroupDef {
  name: string;
  files(src: Source): string[];
  /** Indexes of the counted lines; undefined = every line. */
  lines?(content: string, file: string): number[];
}

/** Minimum per-1k values for the canonical shared text (`grammar-density.test.ts`). */
export const FLOORS: Record<string, number> = { clauses: 20, rules: 16 };

const FENCE = /^```/;
const ARTICLE = new Set(["a", "an", "the"]);

export function articlesPer1k(lines: string[]): Count {
  let words = 0;
  let articles = 0;
  for (const line of lines) {
    if (FENCE.test(line)) continue;
    for (const w of line.toLowerCase().split(/[^a-z]+/)) {
      if (w === "") continue;
      words++;
      if (ARTICLE.has(w)) articles++;
    }
  }
  return { words, articles, per1k: words === 0 ? 0 : (articles * 1000) / words };
}

/** Line indexes inside ` ```text ` blocks; with `section`, only under that `## ` heading. */
export function textBlockLines(md: string, section?: string): number[] {
  const lines = md.split("\n");
  const out: number[] = [];
  let inSection = section === undefined;
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!inBlock && line.startsWith("## ")) {
      if (section !== undefined) inSection = line === `## ${section}`;
      continue;
    }
    if (!inSection) continue;
    if (inBlock) {
      if (line === "```") inBlock = false;
      else out.push(i);
    } else if (line === "```text") {
      inBlock = true;
    }
  }
  return out;
}

/** New-side 0-based line indexes a `git diff -U0` output adds. */
export function addedLines(diff: string): Set<number> {
  const out = new Set<number>();
  for (const m of diff.matchAll(/^@@ -\S+ \+(\d+)(?:,(\d+))? @@/gm)) {
    const start = Number(m[1]);
    const count = m[2] === undefined ? 1 : Number(m[2]);
    for (let n = 0; n < count; n++) out.add(start - 1 + n);
  }
  return out;
}

const STORE = ".bkit/instructions.md";

const one = (file: string) => (src: Source) => (src.read(file) === undefined ? [] : [file]);

export const GROUPS: readonly GroupDef[] = [
  { name: "rules", files: one(".bkit/core/.agents/rules.md") },
  { name: "prompts", files: (src) => src.list(".bkit/core/prompts") },
  { name: "workflows", files: (src) => src.list(".bkit/core/workflows") },
  {
    // Revisions before the store kept the clauses in `.bkit/wording.md`.
    name: "clauses",
    files: (src) => (src.read(STORE) !== undefined ? [STORE] : one(".bkit/wording.md")(src)),
    lines: (md, file) => (file === STORE ? textBlockLines(md, "Clauses") : textBlockLines(md)),
  },
  {
    name: "store-rules",
    files: one(STORE),
    lines: (md) => textBlockLines(md, "Rules"),
  },
];

/**
 * One count per group. `added` limits each file to the line indexes it names; a file
 * missing from `added` counts nothing.
 */
export function measure(src: Source, added?: Map<string, Set<number>>): GroupCount[] {
  return GROUPS.map((g) => {
    const counted: string[] = [];
    for (const file of g.files(src)) {
      const content = src.read(file);
      if (content === undefined) continue;
      const lines = content.split("\n");
      let idx = g.lines ? g.lines(content, file) : lines.map((_, i) => i);
      if (added) {
        const keep = added.get(file) ?? new Set<number>();
        idx = idx.filter((i) => keep.has(i));
      }
      for (const i of idx) counted.push(lines[i]!);
    }
    return { name: g.name, ...articlesPer1k(counted) };
  });
}

export function workingTree(root: string): Source {
  const walk = (rel: string): string[] => {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) return [];
    return fs
      .readdirSync(abs, { withFileTypes: true })
      .flatMap((e) => (e.isDirectory() ? walk(path.join(rel, e.name)) : [path.join(rel, e.name)]));
  };
  return {
    list: (dir) => walk(dir).sort(),
    read: (file) => {
      const abs = path.join(root, file);
      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : undefined;
    },
  };
}

function git(root: string, args: string[]): { ok: boolean; out: string } {
  const res = spawnSync("git", args, { cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  return { ok: res.status === 0, out: res.stdout ?? "" };
}

export function gitRev(root: string, rev: string): Source {
  return {
    list: (dir) =>
      git(root, ["ls-tree", "-r", "--name-only", rev, "--", dir])
        .out.split("\n")
        .filter(Boolean)
        .sort(),
    read: (file) => {
      const res = git(root, ["show", `${rev}:${file}`]);
      return res.ok ? res.out : undefined;
    },
  };
}

// ---------------------------------------------------------------------------
// CLI: `pnpm grammar:density [--rev=<rev>] [--diff=<base>..<head>]`
// ---------------------------------------------------------------------------

function main(argv: string[]): number {
  const root = process.cwd();
  const arg = (name: string) =>
    argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
  const rev = arg("rev");
  const diff = arg("diff");
  let groups: GroupCount[];
  if (diff !== undefined) {
    const [base, head] = diff.split("..");
    if (!base || !head) {
      console.error("[bkit-grammar] --diff takes <base>..<head>");
      return 2;
    }
    const src = gitRev(root, head);
    const added = new Map<string, Set<number>>();
    for (const g of GROUPS) {
      for (const file of g.files(src)) {
        added.set(file, addedLines(git(root, ["diff", "-U0", base, head, "--", file]).out));
      }
    }
    groups = measure(src, added);
  } else {
    groups = measure(rev === undefined ? workingTree(root) : gitRev(root, rev));
  }
  console.log(`${"group".padEnd(12)} ${"words".padStart(8)} ${"art/1k".padStart(7)}`);
  for (const g of groups) {
    console.log(
      `${g.name.padEnd(12)} ${String(g.words).padStart(8)} ${g.per1k.toFixed(1).padStart(7)}`,
    );
  }
  return 0;
}

if (process.argv[1] && fs.existsSync(process.argv[1])) {
  if (fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
    process.exitCode = main(process.argv.slice(2));
  }
}
