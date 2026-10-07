// bkit-catalog-parity.test.ts — catalog-parity guards (#230 item E).
//
// Recomputes the canonical catalogs from disk and asserts the bkit-authored index
// docs stay in sync: "index drift = regression". Deterministic, no install. Cheap
// insurance that a new prompt/workflow file (or a hand-edited count) cannot silently
// diverge from its documentation.
//
// Direction matters: file -> doc. Every catalog FILE must be documented, but the docs
// MAY describe entries that have no dedicated file.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const PROMPTS_INDEX = path.resolve(".bkit/prompts.md");
const WORKFLOWS_INDEX = path.resolve(".bkit/workflows.md");

// Canonical catalog entry names = sorted `.md` basenames (extension stripped),
// computed once from disk (e.g. "bkit-design-review-1").
const mdRe = /\.md$/;
const PROMPT_NAMES = fs
  .readdirSync(path.resolve(".bkit/prompts"))
  .filter((f) => mdRe.test(f))
  .map((f) => f.replace(mdRe, ""))
  .sort();
const WORKFLOW_NAMES = fs
  .readdirSync(path.resolve(".bkit/workflows"))
  .filter((f) => mdRe.test(f))
  .map((f) => f.replace(mdRe, ""))
  .sort();

describe("catalog parity — workflows", () => {
  const index = fs.readFileSync(WORKFLOWS_INDEX, "utf-8");

  it("has at least one workflow file (sanity)", () => {
    expect(WORKFLOW_NAMES.length).toBeGreaterThan(0);
  });

  it("every .bkit/workflows/*.md file has a `### `/<name>`` section in workflows.md", () => {
    const undocumented = WORKFLOW_NAMES.filter((n) => !index.includes("### `/" + n + "`"));
    expect(undocumented).toEqual([]);
  });
});

describe("catalog parity — prompts", () => {
  const index = fs.readFileSync(PROMPTS_INDEX, "utf-8");

  it("has at least one prompt file (sanity)", () => {
    expect(PROMPT_NAMES.length).toBeGreaterThan(0);
  });

  it("every .bkit/prompts/*.md agent is referenced in the prompts.md catalog", () => {
    const missing = PROMPT_NAMES.filter((n) => !index.includes(n));
    expect(missing).toEqual([]);
  });
});
