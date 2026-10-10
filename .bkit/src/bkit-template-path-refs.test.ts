// bkit-template-path-refs.test.ts — no workflow or prompt names a template file.
//
// Templates are the consumer's once installed: they rename, delete or rewrite
// them (a CI workflow, a hook, a lint config, a helper script). A workflow step
// that reads or runs one by path breaks the day the consumer does, so the
// mechanics a workflow needs live in `bkit <noun> <verb>` commands instead, and
// settings come from `package.json` `bkit`. The forbidden names come from the
// templates folder itself, so a new template is covered without editing this test.

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

const repo = path.resolve(__dirname, "../..");
const templates = path.join(repo, ".bkit", "templates");

const listDir = (dir: string) => (fs.existsSync(dir) ? fs.readdirSync(dir) : []);

/** Literal strings that name a template path. */
function forbiddenNames(): string[] {
  return [
    ...listDir(path.join(templates, ".github", "workflows")),
    ".husky/",
    ".vale",
    ".lintstagedrc.json",
    "slop-scan.config.json",
    ".envrc",
    ".bkit/scripts/",
    ...listDir(path.join(templates, "scripts")).map((d) => `scripts/${d}`),
    ...listDir(path.join(templates, "context")).map((f) => `context/${f}`),
  ];
}

function corpus(): Array<{ file: string; text: string }> {
  const dirs = [path.join(repo, ".bkit", "workflows"), path.join(repo, ".bkit", "prompts")];
  const files = dirs.flatMap((d) =>
    listDir(d)
      .filter((f) => f.endsWith(".md"))
      .map((f) => path.join(d, f)),
  );
  files.push(path.join(repo, ".bkit", "wording.md"));
  return files.map((f) => ({ file: path.relative(repo, f), text: fs.readFileSync(f, "utf-8") }));
}

describe("no workflow or prompt names a template path", () => {
  it("derives a non-trivial forbidden list from the templates folder", () => {
    const names = forbiddenNames();
    expect(names).toContain("ci.yml");
    expect(names).toContain("bkit-cloud.yml");
    expect(names.some((n) => n.startsWith("scripts/"))).toBe(true);
    expect(names).toContain("context/vercel.md");
  });

  it("reads every workflow and prompt", () => {
    const files = corpus().map((c) => c.file);
    expect(files.filter((f) => f.startsWith(".bkit/workflows/")).length).toBeGreaterThanOrEqual(6);
    expect(files.filter((f) => f.startsWith(".bkit/prompts/")).length).toBeGreaterThan(10);
  });

  it.each(corpus())("$file names no template path", ({ text }) => {
    const hits = forbiddenNames().flatMap((name) =>
      text
        .split("\n")
        .map((line, i) => ({ line, n: i + 1 }))
        .filter(({ line }) => line.includes(name))
        .map(({ line, n }) => `${n}: ${name} — ${line.trim().slice(0, 120)}`),
    );
    expect(hits).toEqual([]);
  });
});
