// audits/workflows/untrusted-fence.test.ts — the untrusted-input fence around fetched external text:
// written once by `bkit context run-block`, never copied partially or nested by a shipped source.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { FENCE_CLOSE, FENCE_INSTRUCTION_LINES, FENCE_OPEN } from "../../commands/workflow/context";

// ---------------------------------------------------------------------------
// untrusted-fence
// ---------------------------------------------------------------------------
/**
 * untrusted-fence — the wrapper put around fetched external text as
 * it lands on disk. `/bkit-debug` writes fetched CI / runtime / web output; that
 * payload is attacker-influenceable and is read back by a subagent.
 *
 * The fence is written in exactly one place: `bkit context run-block`, from the
 * constants exported by `commands/workflow/context.ts` (its own tests pin the
 * written bytes). This file guards everything around that:
 *
 * - no workflow prints a fence of its own (run-block already wraps the payload);
 * - any other copy of the instruction lines in a shipped source (prompts,
 *   templates, scripts, agent rules) is the WHOLE fence, verbatim and in order;
 * - consumer fetch blocks emit no fence, and subagents reading fenced artifacts
 *   are told so on spawn.
 *
 * The prose sits next to the payload, not in a header; it is defence-in-depth and does
 * not replace a narrowly-scoped token.
 */
describe("untrusted-fence", () => {
  const REPO_ROOT = path.resolve(__dirname, "../../../../..");

  /** Workflows whose subagents read fetched external evidence. */
  const FENCED_WORKFLOWS = [".bkit/core/workflows/bkit-debug.md"] as const;

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

  const WORKFLOWS = filesUnder(".bkit/core/workflows").filter((f) => f.endsWith(".md"));

  /**
   * Shipped sources that could write or hand an agent another copy of the fence.
   * Docs (`docs/*.md`, `.bkit/workflows.md`) are excluded: they quote single lines
   * in prose to explain the fence, which is not a copy.
   */
  const OTHER_SURFACES = [
    ".bkit/core/prompts",
    ".bkit/core/.agents",
    ".bkit/templates/scripts",
    "scripts/slop",
    ".agents/context.md",
    ".agents/rules.md",
  ].flatMap(filesUnder);

  /** Surfaces carrying some instruction lines but not the whole fence verbatim and in order. */
  function partialFenceCopies(): string[] {
    const partial: string[] = [];
    for (const rel of OTHER_SURFACES) {
      const content = read(rel);
      const counts = FENCE_INSTRUCTION_LINES.map((line) => countOf(content, line));
      const whole = [...FENCE_INSTRUCTION_LINES, FENCE_OPEN].join("\n");
      if (counts.every((c) => c === 0)) continue;
      if (new Set(counts).size !== 1) {
        partial.push(`${rel}: fence lines out of step (${counts.join("/")})`);
      } else if (countOf(content, whole) !== counts[0]) {
        partial.push(`${rel}: fence reordered or split`);
      }
    }
    return partial;
  }

  /** Lines that print their own UNTRUSTED marker banner. */
  function ownFenceMarkers(text: string): string[] {
    return text.match(/^.*={3,}[^\n]*UNTRUSTED.*$/gm) ?? [];
  }

  /** True when the line above a `Read:` is a `Context:` line that names `Untrusted:` input. */
  function namesUntrustedInput(context: string | undefined): boolean {
    return /^\s*Context:/.test(context ?? "") && (context ?? "").includes("Untrusted:");
  }

  /** True for a `Read:` line that lists a fetched-evidence artifact. */
  function isUntrustedRead(line: string): boolean {
    return /^\s*Read:/.test(line) && UNTRUSTED_ARTIFACTS.test(line);
  }

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
      const partial = partialFenceCopies();
      expect(partial).toEqual([]);
    });
  });

  describe("the payload is wrapped once, never twice", () => {
    // Fetch blocks are consumer-authored and their stdout IS the payload. A block
    // that prints its own banner nests a second fence inside the first, and the
    // shipped templates are what consumers copy. Prose about untrusted output is fine;
    // a marker line emitted into the payload is not.
    const contextTemplates = fs
      .readdirSync(path.join(REPO_ROOT, ".bkit/templates/context"))
      .filter((f) => f.endsWith(".md"))
      .map((f) => `.bkit/templates/context/${f}`);
    for (const rel of [".agents/context.md", ...contextTemplates]) {
      it(`${rel} fetch blocks emit no fence of their own`, () => {
        const emitted = ownFenceMarkers(read(rel));
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
          .filter(({ line }) => isUntrustedRead(line));
        expect(readLines.length, `no untrusted Read: paths found in ${rel}`).toBeGreaterThan(0);
        const unannounced = readLines
          .filter(({ i }) => !namesUntrustedInput(lines[i - 1]))
          .map(
            ({ line, i }) =>
              `${rel}:${i + 1} reads untrusted artifacts but its Context: line does not say so — ${line.trim().slice(0, 60)}…`,
          );
        expect(unannounced).toEqual([]);
      });
    }
  });
});
