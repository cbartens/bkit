/**
 * tools/instructions-coverage.test.ts — `.bkit/instructions.md` covers the corpus both
 * ways: every standing line has an entry (nothing missing), and every entry and listed
 * carrier is still in its files (nothing extra).
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkCarry,
  checkCoverage,
  loadCorpus,
  openDrift,
  openFits,
  similarEntries,
  syncCarry,
  syncCoverage,
  type CorpusFile,
} from "./instructions";

const REPO_ROOT = path.resolve(__dirname, "../../../..");
const STORE = fs.readFileSync(path.join(REPO_ROOT, ".bkit/instructions.md"), "utf-8");
const CORPUS = loadCorpus(REPO_ROOT);

const prompt = (name: string, body: string[]): CorpusFile => ({
  surface: "prompt",
  id: `.bkit/core/prompts/${name}.md`,
  name,
  content: ["---", `name: ${name}`, "---", ...body].join("\n"),
});

const FILES = [
  prompt("p-one", [
    "- **Order:** Execute steps in order.",
    "- **Rule:** NEVER skip. ALWAYS finish.",
    "- Keep the local line.",
    "- NEVER skip the shortcut.",
  ]),
  prompt("p-two", [
    "- **Order:** Execute steps in order.",
    "- Shared local line.",
    "- ALWAYS finish.",
  ]),
  prompt("p-three", ["- **Order:** Execute steps in order.", "- Shared local line."]),
];

const STORE_MD = [
  "# Agent Instructions",
  "## Rules",
  "",
  "### rule",
  "",
  "- rule: Universal Rules",
  "- prompt:",
  "  - verbatim: `p-one`",
  "  - partial: `p-two`",
  "  - condensed: `p-one`",
  "- drift:",
  '  - `p-one:7`: "skip the shortcut" restates the rule loosely',
  "    - kept: the shortcut wording is deliberate",
  "",
  "```text",
  "**Rule:** NEVER skip. ALWAYS finish.",
  "```",
  "",
  "## Project Rules",
  "",
  "## Clauses",
  "",
  "### order",
  "",
  "- prompt: required",
  "",
  "```text",
  "**Order:** Execute steps in order.",
  "```",
  "",
  "## Local Instructions",
  "",
  "### Shared lines",
  "",
  "- carriers: prompt `p-three`, `p-two`",
  "",
  "  ```text",
  "  Shared local line.",
  "  ```",
  "",
  "### Prompts",
  "",
  "#### p-one",
  "",
  "- source: `.bkit/core/prompts/p-one.md`",
  "",
  "```text",
  "Keep the local line.",
  "[rule] NEVER skip the shortcut.",
  "```",
].join("\n");

describe("checkCoverage", () => {
  it("the fixture passes", () => {
    expect(checkCoverage(STORE_MD, FILES)).toEqual([]);
  });

  it("a standing line no entry matches fails and prints the entry to add", () => {
    const files = [
      ...FILES.slice(0, 2),
      prompt("p-three", ["- Shared local line.", "- A new line."]),
    ];
    const findings = checkCoverage(STORE_MD, files).join("\n");
    expect(findings).toMatch(/p-three\.md:5: no entry — add under #### p-three: A new line\./);
  });

  it("a local entry whose text left its file fails", () => {
    const files = [
      prompt("p-one", [
        "- **Order:** Execute steps in order.",
        "- **Rule:** NEVER skip. ALWAYS finish.",
        "- NEVER skip the shortcut.",
      ]),
      ...FILES.slice(1),
    ];
    expect(checkCoverage(STORE_MD, files).join("\n")).toMatch(
      /p-one: local entry no longer in the file: Keep the local line\./,
    );
  });

  it("a listed verbatim carrier without the text fails", () => {
    const files = [
      prompt("p-one", [
        "- **Order:** Execute steps in order.",
        "- Keep the local line.",
        "- NEVER skip the shortcut.",
      ]),
      ...FILES.slice(1),
    ];
    expect(checkCoverage(STORE_MD, files).join("\n")).toMatch(
      /`rule`: verbatim carrier `p-one` lacks the text/,
    );
  });

  it("a condensed carrier without a tagged local line fails", () => {
    const untagged = STORE_MD.replace(
      "[rule] NEVER skip the shortcut.",
      "NEVER skip the shortcut.",
    );
    expect(checkCoverage(untagged, FILES).join("\n")).toMatch(
      /`rule`: condensed carrier `p-one` has no local line or clause tagged `rule`/,
    );
  });

  it("a clause tagged with the rule backs a condensed carrier", () => {
    const viaClause = STORE_MD.replace(
      "[rule] NEVER skip the shortcut.",
      "NEVER skip the shortcut.",
    ).replace("- prompt: required\n", "- prompt: required\n- tags: rule\n");
    expect(checkCoverage(viaClause, FILES)).toEqual([]);
  });

  it("a tag naming no rule fails instead of pointing at another rule", () => {
    const typo = STORE_MD.replace("[rule] NEVER", "[rules] NEVER");
    expect(checkCoverage(typo, FILES)).toContain(
      ".bkit/core/prompts/p-one.md: tag `rules` names no rule: NEVER skip the shortcut.",
    );
  });

  it("a clause rule or tag naming no rule fails", () => {
    const typo = STORE_MD.replace(
      "- prompt: required\n",
      "- prompt: required\n- tags: rule, gone\n",
    );
    expect(checkCoverage(typo, FILES)).toContain("clause `order`: `gone` names no rule");
  });

  it("two entries 80% alike are flagged", () => {
    const twin = STORE_MD.replace(
      "## Local Instructions",
      [
        "### order-twin",
        "",
        "- prompt: where-used",
        "",
        "```text",
        "**Order:** Execute the steps in order.",
        "```",
        "",
        "## Local Instructions",
      ].join("\n"),
    );
    expect(similarEntries(twin).join("\n")).toMatch(/`order` and `order-twin` are 0\.8\d alike/);
    const reviewed = twin.replace(
      "- prompt: where-used",
      "- prompt: where-used\n- distinct-from: `order`",
    );
    expect(similarEntries(reviewed)).toEqual([]);
  });

  it("a drift excerpt not on its cited line fails", () => {
    const moved = STORE_MD.replace("`p-one:7`", "`p-one:6`");
    expect(checkCoverage(moved, FILES).join("\n")).toMatch(
      /drift `p-one:6` does not hold "skip the shortcut"/,
    );
    expect(checkCoverage(syncCoverage(moved, FILES), FILES)).toEqual([]);
  });
});

describe("checkCarry", () => {
  const carrying = (spec: string) =>
    STORE_MD.replace("- prompt:\n  - verbatim", `- carry: ${spec}\n- prompt:\n  - verbatim`);

  it("a carry line naming each prompt that holds the whole rule passes", () => {
    const found = checkCarry(carrying("`p-one`"), FILES);
    expect([...found.missing, ...found.undeclared]).toEqual([]);
  });

  it("a carry line naming a prompt without the whole rule fails", () => {
    expect(checkCarry(carrying("`p-one`, `p-two`"), FILES).missing).toEqual([
      "`rule`: carry `p-two` lacks the whole rule bullet",
    ]);
  });

  it("a prompt holding a bkit rule its carry line does not name fails", () => {
    expect(checkCarry(STORE_MD, FILES).undeclared).toEqual([
      "`rule`: `p-one` holds the rule but no carry line names it",
    ]);
  });

  it("sync rewrites a copy of the rule's retired text in a carrying prompt's block", () => {
    const store = carrying("`p-one`").replace(
      "**Rule:** NEVER skip. ALWAYS finish.\n```\n",
      "**Rule:** NEVER skip. ALWAYS finish.\n```\n\n```retired\n**Rule:** NEVER skip.\n```\n",
    );
    const stale = prompt("p-one", [
      "**Rules:** Copied.",
      "",
      "- **Rule:** NEVER skip.",
      "",
      "**Process:**",
      "",
      "1. **Rule:** NEVER skip.",
    ]);
    expect(syncCarry(store, [stale]).get(stale.id)).toBe(
      stale.content.replace(
        "- **Rule:** NEVER skip.\n",
        "- **Rule:** NEVER skip. ALWAYS finish.\n",
      ),
    );
    expect(syncCarry(store, FILES).size).toBe(0);
  });

  it("a prompt that carries no rule is listed", () => {
    expect(checkCarry(carrying("`p-one`"), FILES).empty).toEqual(["p-two", "p-three"]);
  });
});

describe("open review items", () => {
  it("a fit tag without a keep reason is open", () => {
    const fit = STORE_MD.replace("Keep the local line.", "[fit `order` 0.70] Keep the local line.");
    expect(openFits(fit)).toEqual([
      ".bkit/core/prompts/p-one.md: fit `order` 0.70: Keep the local line.",
    ]);
    expect(openFits(fit.replace("0.70]", "0.70; keep: says something else]"))).toEqual([]);
  });

  it("a drift item without a kept reason is open", () => {
    expect(openDrift(STORE_MD)).toEqual([]);
    expect(
      openDrift(STORE_MD.replace("    - kept: the shortcut wording is deliberate\n", "")),
    ).toHaveLength(1);
  });
});

describe("the repo", () => {
  it("has no coverage findings", { timeout: 60_000 }, () => {
    expect(checkCoverage(STORE, CORPUS)).toEqual([]);
  });

  it("has no unreviewed near-alike entries", { timeout: 60_000 }, () => {
    expect(similarEntries(STORE)).toEqual([]);
  });

  it("every fit tag matches its target or records why it stays", () => {
    expect(openFits(STORE)).toEqual([]);
  });

  it("every prompt carries verbatim each rule its carry line names", { timeout: 60_000 }, () => {
    expect(checkCarry(STORE, CORPUS).missing).toEqual([]);
  });

  it("no prompt carries a bkit rule its carry line does not name", { timeout: 60_000 }, () => {
    expect(checkCarry(STORE, CORPUS).undeclared).toEqual([]);
  });

  it("every prompt carries at least one rule", { timeout: 60_000 }, () => {
    expect(checkCarry(STORE, CORPUS).empty).toEqual([]);
  });

  it("every drift item is fixed or carries a kept reason", () => {
    expect(openDrift(STORE)).toEqual([]);
  });
});
