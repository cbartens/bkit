/**
 * tools/grammar-density.test.ts — article density of agent text, the measure behind
 * `.bkit/core/.bkit/authoring.md` § Notation, Grammar.
 */

import * as path from "node:path";

import { describe, expect, it } from "vitest";

import {
  FLOORS,
  addedLines,
  articlesPer1k,
  measure,
  textBlockLines,
  workingTree,
} from "./grammar-density";

const REPO_ROOT = path.resolve(__dirname, "../../../..");

describe("counting", () => {
  it("articlesPer1k counts a, an and the per 1,000 words", () => {
    const r = articlesPer1k(["The cat sat on a mat; an owl watched.", "Dogs bark."]);
    expect(r.words).toBe(11);
    expect(r.articles).toBe(3);
    expect(r.per1k).toBeCloseTo(3000 / 11);
  });

  it("drops fence marker lines, lowercases, and splits on anything but letters", () => {
    const r = articlesPer1k(["```text", "THE don't", "```"]);
    // `text` on the fence line is dropped; `don't` splits into `don` and `t`.
    expect(r.words).toBe(3);
    expect(r.articles).toBe(1);
  });

  it("an empty input counts zero, never NaN", () => {
    expect(articlesPer1k([]).per1k).toBe(0);
  });

  it("textBlockLines returns only the lines inside text blocks of the named section", () => {
    const md = [
      "# Doc",
      "## Rules",
      "```text",
      "the rule",
      "```",
      "```retired",
      "a retired rule",
      "```",
      "## Other",
      "```text",
      "the other",
      "```",
    ].join("\n");
    expect(textBlockLines(md, "Rules").map((i) => md.split("\n")[i])).toEqual(["the rule"]);
    expect(textBlockLines(md).map((i) => md.split("\n")[i])).toEqual(["the rule", "the other"]);
  });

  it("addedLines reads the new-side line numbers of a zero-context diff", () => {
    const diff = ["@@ -1,0 +2,2 @@", "+a", "+b", "@@ -9 +11 @@", "-x", "+y"].join("\n");
    expect([...addedLines(diff)].sort((a, b) => a - b)).toEqual([1, 2, 10]);
  });
});

describe("floor", () => {
  it("canonical clause and rule text stays at or above the floor", () => {
    const groups = measure(workingTree(REPO_ROOT));
    for (const [name, floor] of Object.entries(FLOORS)) {
      const g = groups.find((x) => x.name === name);
      expect(g, name).toBeDefined();
      expect(g!.words, name).toBeGreaterThan(0);
      expect(g!.per1k, name).toBeGreaterThanOrEqual(floor);
    }
  });
});
