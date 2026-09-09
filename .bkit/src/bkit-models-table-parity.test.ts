// bkit-models-table-parity.test.ts — the § Models table must agree with the prompt files.
//
// § Models carries one column per GATEWAY. Three of those columns are not read by any code
// path: the Claude pin, the effort rung and the turn cap all live in each
// `.bkit/prompts/*.md` frontmatter and are mirrored byte-identically into `.claude/agents/`.
// Only the `Cursor` column and the opencode gateway columns are parsed at install.
//
// That makes those three columns a hand-maintained COPY of the frontmatter with nothing
// checking the two agree — edit one and the other silently becomes a lie, and the table is
// what a human reads when deciding what to re-pin. These tests are the missing check.
//
// Direction: file -> doc, matching bkit-catalog-parity.test.ts. Every prompt file must have
// a row whose cells restate its frontmatter.
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { parseModelLookupForColumn } from "./bkit-install";

const PROMPTS_DIR = path.resolve(".bkit/prompts");
const PROMPTS_MD = path.resolve(".bkit/prompts.md");

/** name -> frontmatter field value, read straight from the prompt files. */
function frontmatterField(field: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const file of fs.readdirSync(PROMPTS_DIR).filter((f) => f.endsWith(".md"))) {
    const lines = fs.readFileSync(path.join(PROMPTS_DIR, file), "utf-8").split("\n");
    if (lines[0]?.trim() !== "---") continue;
    const end = lines.indexOf("---", 1);
    const fm = lines.slice(1, end === -1 ? lines.length : end);
    const hit = fm.find((l) => l.startsWith(`${field}:`));
    if (hit) out.set(file.replace(/\.md$/, ""), hit.slice(field.length + 1).trim());
  }
  return out;
}

describe("§ Models table parity with prompt frontmatter", () => {
  const cases: Array<[column: string, field: string]> = [
    ["Anthropic", "model"],
    ["Effort", "effort"],
    ["Max Turns", "maxTurns"],
  ];

  for (const [column, field] of cases) {
    it(`the ${column} column restates every prompt's \`${field}:\``, () => {
      const fromFiles = frontmatterField(field);
      const fromTable = parseModelLookupForColumn(PROMPTS_MD, column);
      expect(fromFiles.size).toBeGreaterThan(0);

      const drift: string[] = [];
      for (const [name, expected] of fromFiles) {
        const actual = fromTable.get(name);
        if (actual === undefined) drift.push(`${name}: missing from the ${column} column`);
        else if (actual !== expected)
          drift.push(`${name}: ${column}="${actual}" but ${field}: ${expected}`);
      }
      expect(drift).toEqual([]);
    });
  }

  it("every prompt file has a § Models row", () => {
    const files = fs
      .readdirSync(PROMPTS_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
    const rows = [...parseModelLookupForColumn(PROMPTS_MD, "Anthropic").keys()].sort();
    expect(rows).toEqual(files);
  });
});
