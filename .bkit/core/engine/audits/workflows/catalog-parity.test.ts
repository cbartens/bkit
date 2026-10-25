// audits/workflows/catalog-parity.test.ts — catalog-parity guards.
//
// Recomputes the canonical catalogs from disk and asserts the bkit-authored index
// docs stay in sync. Deterministic, no install.
//
// Direction matters: file -> doc. Every catalog FILE must be documented, but the docs
// MAY describe entries that have no dedicated file.

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getBkitDocsRoot,
  getPkgRoot,
  getPromptsRoot,
  getWorkflowsRoot,
} from "../../shared/package-roots";

const PROMPTS_INDEX = path.join(getBkitDocsRoot(), "prompts.md");
const WORKFLOWS_INDEX = path.join(getBkitDocsRoot(), "workflows.md");

// Canonical catalog entry names = sorted `.md` basenames (extension stripped),
// computed once from disk (e.g. "bkit-design-review-1").
const mdRe = /\.md$/;
const PROMPT_NAMES = fs
  .readdirSync(getPromptsRoot())
  .filter((f) => mdRe.test(f))
  .map((f) => f.replace(mdRe, ""))
  .sort();
const WORKFLOW_NAMES = fs
  .readdirSync(getWorkflowsRoot())
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

// Retired plan agents, steps and file names. Built from parts so this file never names them.
const REMOVED_PLAN_NAMES = [
  `bkit-plan-review-${3}`,
  `bkit-plan-scope-check-${1}`,
  `bkit-plan-scope-check-${2}`,
  `plan-apply-${"scope"}`,
  `step=plan-scope-${"check"}`,
  `plan-v3-${"checked"}`,
  `plan-v4-${"split"}`,
  `bkit-plan-complexity-${"split"}`,
];
// History files keep the names they were written with.
const HISTORY_PATHS = [
  /^CHANGELOG\.md$/,
  /^docs\/[^/]+\.jsonl$/,
  /^docs\/audits\//,
  /^docs\/plans\//,
  /^\.bkit\/issues\.jsonl$/,
  /^scripts\/harvest\/.*\.test\.mjs$/,
];

/** Each `file: name` where a shipped, non-history file still names a removed plan agent or step. */
function removedNameHits(root: string): string[] {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf-8",
  })
    .split("\n")
    .filter((f) => f && !HISTORY_PATHS.some((re) => re.test(f)));
  const hits: string[] = [];
  for (const f of files) {
    const abs = path.join(root, f);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    const text = fs.readFileSync(abs, "utf-8");
    for (const name of REMOVED_PLAN_NAMES) if (text.includes(name)) hits.push(`${f}: ${name}`);
  }
  return hits;
}

describe("catalog parity — retired plan agents", () => {
  it("removed plan agents absent", () => {
    expect(removedNameHits(getPkgRoot())).toEqual([]);
  });
});
