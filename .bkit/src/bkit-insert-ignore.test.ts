/**
 * bkit-insert-ignore.test.ts — the copy-and-own prettier-ignore template
 * (`.bkit/templates/scripts/prettier/bkit-insert-ignore.mjs`), run in-process
 * against fixture markdown.
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const TEMPLATE = path.join(REPO_ROOT, ".bkit/templates/scripts/prettier/bkit-insert-ignore.mjs");

const mod = await import(pathToFileURL(TEMPLATE).href);

let root: string;
const write = (rel: string, text: string) => {
  fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
  fs.writeFileSync(path.join(root, rel), text);
};
const read = (rel: string) => fs.readFileSync(path.join(root, rel), "utf8");
const run = (...argv: string[]) => {
  const lines: string[] = [];
  const status = mod.main(argv, { root, log: (l: string) => lines.push(l) });
  return { status, out: lines.join("\n") };
};

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-insert-ignore-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("bkit-insert-ignore.mjs", () => {
  it("wraps a table, strips padding, normalises the separator, and is idempotent", () => {
    const src = "Intro\n|  A  | B |\n| :---- | ----: |\n|  1  |   2 |\n";
    const once = mod.processText(src);
    expect(once).toBe("Intro\n\n<!-- prettier-ignore -->\n| A | B |\n| :--- | ---: |\n| 1 | 2 |\n");
    expect(mod.processText(once)).toBe(once);
  });

  it("escapes a code-span pipe only when that restores the column count; keeps \\| literal", () => {
    const src = "| A | B |\n| --- | --- |\n| `a || b` | c |\n| x\\|y | z |\n";
    expect(mod.processText(src)).toBe(
      "<!-- prettier-ignore -->\n| A | B |\n| --- | --- |\n| `a \\|\\| b` | c |\n| x\\|y | z |\n",
    );
  });

  it("leaves tables inside fences and already-wrapped tables alone", () => {
    const src =
      "```\n| A | B |\n| --- | --- |\n```\n\n<!-- prettier-ignore -->\n\n| C | D |\n| --- | --- |\n";
    expect(mod.processText(src)).toBe(src);
  });

  it("reports damage escaping cannot repair: truncated rows and unrendered tables", () => {
    const problems = mod.auditText(
      "| A | B |\n| --- | --- |\n| 1 | 2 | 3 |\n\n| A |\n| --- | --- |\n",
    );
    expect(problems.map((p: [number, string]) => `${p[0]}:${p[1]}`)).toEqual([
      "3:truncated-row",
      "5:unrendered-table",
    ]);
  });

  it("--check writes nothing and exits 1 when a file would change", () => {
    write("docs/a.md", "| A |\n| --- |\n");
    const r = run("--check");
    expect(r.status).toBe(1);
    expect(r.out).toContain("needs formatting: docs/a.md");
    expect(read("docs/a.md")).toBe("| A |\n| --- |\n");
    expect(run().status).toBe(0);
    expect(read("docs/a.md")).toBe("<!-- prettier-ignore -->\n| A |\n| --- |\n");
  });

  it("walks skip skills/, docs/audits/ and docs/plans/; an explicit file is still processed", () => {
    const table = "| A |\n| --- |\n";
    for (const f of [
      "docs/live.md",
      "docs/skills.md",
      "docs/audits/202610/config.md",
      "docs/plans/202610/x.md",
      ".agents/skills/vendor/SKILL.md",
      "README.md",
    ])
      write(f, table);
    expect(mod.collectTargets([], root)).toEqual(["README.md", "docs/live.md", "docs/skills.md"]);
    expect(mod.collectTargets(["docs/plans/202610/x.md"], root)).toEqual([
      "docs/plans/202610/x.md",
    ]);
  });
});
