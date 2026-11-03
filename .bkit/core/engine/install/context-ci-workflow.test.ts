// install/context-ci-workflow.test.ts — the CI-run lookup rewrite in the consumer's
// `.agents/context.md` blocks.

import { describe, expect, it } from "vitest";

import { scopeCiRunLookups } from "./context-ci-workflow";

const CI_LOOKUP = [
  'RUN_JSON=$(gh run list --branch "$(git branch --show-current)" --limit 1 \\',
  "  --json databaseId,conclusion,headSha 2>/dev/null || echo '[]')",
];
const E2E_LOOKUP = [
  'RUN_ID=$(gh run list --branch "$(git branch --show-current)" --limit 1 \\',
  `  --json databaseId,conclusion --jq 'if (.[0].conclusion // "") == "success" then "" else (.[0].databaseId // "" | tostring) end' 2>/dev/null)`,
];
const scoped = (lookup: string[], workflow: string): string[] => [
  `CI_WORKFLOW="\${CI_WORKFLOW:-${workflow}}"`,
  lookup[0]!.replace("--limit 1", '--workflow "$CI_WORKFLOW" --limit 1'),
  lookup[1]!,
];

const MANAGED = "<!-- bkit:start -->\n\n# Context\n\n<!-- bkit:end -->\n";
const block = (name: string, body: string[]): string =>
  [
    `<!-- context-fetch:start ${name} -->`,
    "",
    "```bash",
    ...body,
    "```",
    "",
    "<!-- context-fetch:end -->",
  ].join("\n");

describe("scopeCiRunLookups", () => {
  it("scopes the shipped `context=ci` and `context=e2e` lookups below bkit:end to the CI workflow", () => {
    const text = `${MANAGED}\n${block("github context=ci", CI_LOOKUP)}\n\n${block("playwright context=e2e", E2E_LOOKUP)}\n`;
    const result = scopeCiRunLookups(text, "bkit-ci.yml");
    expect(result.rewritten).toBe(2);
    expect(result.content).toBe(
      `${MANAGED}\n${block("github context=ci", scoped(CI_LOOKUP, "bkit-ci.yml"))}\n\n${block("playwright context=e2e", scoped(E2E_LOOKUP, "bkit-ci.yml"))}\n`,
    );
    expect(result.unscoped).toEqual([]);
  });

  it("uses the workflow file the consumer configured", () => {
    const text = `${MANAGED}\n${block("github context=ci", CI_LOOKUP)}\n`;
    expect(scopeCiRunLookups(text, "ci.yml").content).toContain(
      'CI_WORKFLOW="${CI_WORKFLOW:-ci.yml}"',
    );
  });

  it("is idempotent", () => {
    const once = scopeCiRunLookups(
      `${MANAGED}\n${block("github context=ci", CI_LOOKUP)}\n`,
      "bkit-ci.yml",
    );
    const twice = scopeCiRunLookups(once.content, "bkit-ci.yml");
    expect(twice.rewritten).toBe(0);
    expect(twice.content).toBe(once.content);
    expect(twice.unscoped).toEqual([]);
  });

  it("keeps CRLF line endings on the lines it writes", () => {
    const text = `${MANAGED}\n${block("github context=ci", CI_LOOKUP)}\n`.replace(/\n/g, "\r\n");
    const result = scopeCiRunLookups(
      text.replace("<!-- bkit:end -->\r\n", "<!-- bkit:end -->\n"),
      "bkit-ci.yml",
    );
    expect(result.rewritten).toBe(1);
    expect(result.content).toContain('CI_WORKFLOW="${CI_WORKFLOW:-bkit-ci.yml}"\r\n');
  });

  it("leaves a lookup inside the managed block alone", () => {
    const text = `<!-- bkit:start -->\n${CI_LOOKUP.join("\n")}\n<!-- bkit:end -->\n`;
    expect(scopeCiRunLookups(text, "bkit-ci.yml")).toEqual({
      content: text,
      rewritten: 0,
      unscoped: [],
    });
  });

  it("leaves an edited lookup alone and reports it as unscoped", () => {
    const edited = [CI_LOOKUP[0]!.replace("--limit 1", "--limit 3"), CI_LOOKUP[1]!];
    const text = `${MANAGED}\n${block("github context=ci", edited)}\n`;
    const result = scopeCiRunLookups(text, "bkit-ci.yml");
    expect(result.content).toBe(text);
    expect(result.rewritten).toBe(0);
    expect(result.unscoped).toEqual([edited[0]]);
  });

  it("leaves a lookup whose continuation line already names a workflow alone", () => {
    const own = [CI_LOOKUP[0]!, `  --workflow ci.yml${CI_LOOKUP[1]!.slice(1)}`];
    const text = `${MANAGED}\n${block("github context=ci", own)}\n`;
    expect(scopeCiRunLookups(text, "bkit-ci.yml")).toEqual({
      content: text,
      rewritten: 0,
      unscoped: [],
    });
  });

  it("writes nothing when the configured workflow name is not a plain file name", () => {
    const text = `${MANAGED}\n${block("github context=ci", CI_LOOKUP)}\n`;
    const result = scopeCiRunLookups(text, 'ci.yml"; rm -rf ~; "');
    expect(result.content).toBe(text);
    expect(result.rewritten).toBe(0);
    expect(result.unscoped).toEqual([CI_LOOKUP[0]]);
  });

  it("returns a file without a bkit:end marker unchanged", () => {
    const text = block("github context=ci", CI_LOOKUP);
    expect(scopeCiRunLookups(text, "bkit-ci.yml")).toEqual({
      content: text,
      rewritten: 0,
      unscoped: [],
    });
  });
});
