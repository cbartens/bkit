/**
 * bkit-untrusted-fence.test.ts — the wrapper put around fetched external text as
 * it lands on disk. `/bkit-debug` writes fetched CI / runtime / web output; that
 * payload is attacker-influenceable and is read back by a subagent.
 *
 * The fence is written in exactly one place: `bkit context run-block`, from the
 * constants exported by `commands/workflow/context.ts` (its own tests pin the
 * written bytes). This file guards everything around that:
 *
 * - no workflow prints a fence of its own — run-block already wraps the payload,
 *   so a second fence nests inside the first and the "Fence ends at LAST line"
 *   claim stops being true;
 * - any other copy of the instruction lines in a shipped source (prompts,
 *   templates, scripts, agent rules) is the WHOLE fence, verbatim and in order. A half-copied fence is the
 *   dangerous failure: the markers survive, one instruction line goes missing,
 *   and the artifact still looks wrapped;
 * - consumer fetch blocks emit no fence, and subagents reading fenced artifacts
 *   are told so on spawn.
 *
 * Prose is defence-in-depth, the layer injection is designed to defeat. It sits
 * next to the payload rather than in a header, which is the whole reason for the
 * wrap; it does not replace a narrowly-scoped token.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { FENCE_CLOSE, FENCE_INSTRUCTION_LINES, FENCE_OPEN } from "./commands/workflow/context";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Workflows whose subagents read fetched external evidence. */
const FENCED_WORKFLOWS = [".bkit/workflows/bkit-debug.md"] as const;

/** Artifacts holding fetched external evidence — tracker dumps excluded. */
const UNTRUSTED_ARTIFACTS = /context-(?!related)/;

const read = (rel: string) => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");

const countOf = (haystack: string, needle: string) => haystack.split(needle).length - 1;

/** Every regular file under `rel` (recursive), repo-relative. */
function filesUnder(rel: string): string[] {
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return [rel];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? filesUnder(`${rel}/${e.name}`) : e.isFile() ? [`${rel}/${e.name}`] : [],
    )
    .sort();
}

const WORKFLOWS = filesUnder(".bkit/workflows").filter((f) => f.endsWith(".md"));

/**
 * Shipped sources that could write or hand an agent another copy of the fence.
 * Docs (`docs/*.md`, `.bkit/workflows.md`) are excluded: they quote single lines
 * in prose to explain the fence, which is not a copy.
 */
const OTHER_SURFACES = [
  ".bkit/prompts",
  ".bkit/templates/.agents",
  ".bkit/templates/scripts",
  ".bkit/scripts",
  ".agents/context.md",
  ".agents/rules.md",
].flatMap(filesUnder);

describe("the fence is written once, by bkit context run-block", () => {
  it("enumerates workflow files (not vacuous)", () => {
    expect(WORKFLOWS.length).toBeGreaterThanOrEqual(6);
    expect(OTHER_SURFACES.length).toBeGreaterThan(10);
  });

  for (const rel of WORKFLOWS) {
    it(`${rel} prints no fence line of its own`, () => {
      const content = read(rel);
      const hits = [...FENCE_INSTRUCTION_LINES, FENCE_OPEN, FENCE_CLOSE].filter((line) =>
        content.includes(line),
      );
      expect(hits, `${rel} carries fence text; run-block already wraps the payload`).toEqual([]);
    });
  }

  it("any other copy of the instruction lines is the whole fence, in order", () => {
    const partial: string[] = [];
    for (const rel of OTHER_SURFACES) {
      const content = read(rel);
      const counts = FENCE_INSTRUCTION_LINES.map((line) => countOf(content, line));
      if (counts.every((c) => c === 0)) continue;
      if (new Set(counts).size !== 1) {
        partial.push(`${rel}: fence lines out of step (${counts.join("/")})`);
        continue;
      }
      const whole = [...FENCE_INSTRUCTION_LINES, FENCE_OPEN].join("\n");
      if (countOf(content, whole) !== counts[0]) partial.push(`${rel}: fence reordered or split`);
    }
    expect(partial).toEqual([]);
  });
});

describe("the payload is wrapped once, never twice", () => {
  // Fetch blocks are consumer-authored and their stdout IS the payload. A block
  // that prints its own banner nests a second fence inside the first, and the
  // shipped example is what consumers copy. Prose about untrusted output is fine;
  // a marker line emitted into the payload is not.
  for (const rel of [".agents/context.md", ".bkit/templates/.agents/context.md"]) {
    it(`${rel} fetch blocks emit no fence of their own`, () => {
      const emitted = read(rel).match(/^.*={3,}[^\n]*UNTRUSTED.*$/gm) ?? [];
      expect(emitted, `${rel} emits its own fence marker`).toEqual([]);
    });
  }
});

describe("subagents reading untrusted artifacts are told so on spawn", () => {
  for (const rel of [...FENCED_WORKFLOWS]) {
    it(`${rel} names untrusted input on the Context: line above each Read:`, () => {
      const lines = read(rel).split("\n");
      const readLines = lines
        .map((line, i) => ({ line, i }))
        .filter(({ line }) => /^\s*Read:/.test(line) && UNTRUSTED_ARTIFACTS.test(line));
      expect(readLines.length, `no untrusted Read: paths found in ${rel}`).toBeGreaterThan(0);
      for (const { line, i } of readLines) {
        const context = lines[i - 1] ?? "";
        expect(
          /^\s*Context:/.test(context) && context.includes("Untrusted:"),
          `${rel}:${i + 1} reads untrusted artifacts but its Context: line does not say so — ${line.trim().slice(0, 60)}…`,
        ).toBe(true);
      }
    });
  }
});
