// audits/workflows/summary-output-format.test.ts — the `**Output format:**` block of every
// `bkit-*-summary.md` prompt states ONE contract per section, from a closed set.
//
// A leading verb names BOTH axes — coverage, and per-item treatment:
//   Summarise:                              a synthesis; no per-item coverage promised
//   List all items and summarise each:      every item appears, each one compressed
//   List all items verbatim, do not summarise: every item appears, each one exact
//
// The verb carries the whole contract; no placeholder restates it. This suite pins the
// verb set AND rejects a restatement.
//
// A section that only applies under a verdict states the gate FIRST, so the reader
// learns whether the section applies before reading what goes in it:
//   [**If** `Verdict` = CONCERNS or FAIL → list all items and summarise each: …]
// The verb takes a lowercase initial in that form. Trailing `**If** none → \`None\``
// is the empty case, NOT a gate, and stays at the end where it reads correctly.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { getPromptsRoot } from "../../shared/package-roots";

const PROMPTS_DIR = getPromptsRoot();

/** The closed set. Adding a fourth verb is a doctrine change, not a drive-by edit. */
const VERBS = [
  "Summarise:",
  "List all items and summarise each:",
  "List all items verbatim, do not summarise:",
] as const;

/**
 * `Recommended Next Step` is exempt: it is a fixed-shape copy-paste handoff block
 * that reports no upstream artifact content, so the coverage/treatment verbs above
 * do not apply. Its opening `<ref>` derivation clause is shared verbatim across all
 * five prompts; the routing clause after it is per-phase.
 */
const EXEMPT_PREFIX = "Copy-paste handoff.";

const summaryFiles = fs
  .readdirSync(PROMPTS_DIR)
  .filter((f) => /^bkit-.*-summary\.md$/.test(f))
  .sort();

/**
 * The contract verb, and everything after it. Accepts both shapes:
 *   `[Verb: body]`                     — unconditional
 *   `[**If** <gate> → verb: body]`     — gated; verb takes a lowercase initial
 * Returns undefined for the exempt `Recommended Next Step` block.
 */
function contractOf(body: string): { verb: string; tail: string } | undefined {
  const inner = body.slice(1);
  const gate = /^\*\*If\*\* .+? → (?=[a-z])/.exec(inner);
  const rest = gate ? inner.slice(gate[0].length) : inner;
  for (const v of VERBS) {
    const form = gate ? v[0].toLowerCase() + v.slice(1) : v;
    if (rest.startsWith(form)) return { verb: v, tail: rest.slice(form.length) };
  }
  return undefined;
}

/** Every `[...]` placeholder line inside the fenced block after `**Output format:**`. */
function placeholders(file: string): Array<{ section: string; body: string; line: number }> {
  const lines = fs.readFileSync(path.join(PROMPTS_DIR, file), "utf-8").split("\n");
  const start = lines.findIndex((l) => l.trim() === "**Output format:**");
  expect(start, `no Output format block in ${file}`).toBeGreaterThan(-1);

  const out: Array<{ section: string; body: string; line: number }> = [];
  let section = "(before any heading)";
  let inFence = false;
  for (let i = start; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("```")) {
      if (inFence) break;
      inFence = true;
      continue;
    }
    if (!inFence) continue;
    if (l.startsWith("## ")) section = l.slice(3).trim();
    else if (l.startsWith("[")) out.push({ section, body: l, line: i + 1 });
  }
  return out;
}

describe("every bkit-*-summary prompt exists and has an Output format block", () => {
  it("finds all five summary prompts", () => {
    expect(summaryFiles).toEqual([
      "bkit-build-summary.md",
      "bkit-debug-summary.md",
      "bkit-design-summary.md",
      "bkit-plan-summary.md",
      "bkit-ship-summary.md",
    ]);
  });

  it.each(summaryFiles)("%s has placeholders to check", (file) => {
    expect(placeholders(file).length).toBeGreaterThan(0);
  });
});

describe("every Output format placeholder names its contract", () => {
  it.each(summaryFiles)("%s: each placeholder opens with a closed-set verb", (file) => {
    const offenders = placeholders(file)
      .filter(({ body }) => !contractOf(body) && !body.slice(1).startsWith(EXEMPT_PREFIX))
      .map(({ section, line }) => `${file}:${line} § ${section}`);
    expect(offenders).toEqual([]);
  });
});

describe("the verb is the whole contract — nothing restates it", () => {
  // Redundant tails are not merely wordy: two statements of one rule can be
  // edited apart, and then the placeholder says two things at once.
  const RESTATEMENTS = [
    /\bList all\b/,
    /\bdo NOT trim\b/,
    /\bOne line each\b/i,
    /\bOne bullet each\b/i,
    /\bone line per\b/i,
    /\bdo NOT reword\b/i,
  ];

  it.each(summaryFiles)("%s: no placeholder repeats its own verb", (file) => {
    const offenders: string[] = [];
    for (const { section, body, line } of placeholders(file)) {
      const contract = contractOf(body);
      if (!contract) continue;
      const { tail } = contract;
      for (const re of RESTATEMENTS) {
        if (re.test(tail)) offenders.push(`${file}:${line} § ${section} — ${re.source}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("a gated section states its gate before the verb", () => {
  // `only if CONCERNS / FAIL` buried after the verb makes the reader parse the
  // whole instruction before learning the section may not apply at all.
  it.each(summaryFiles)("%s: no placeholder defers its gate", (file) => {
    const offenders = placeholders(file)
      .filter(({ body }) => contractOf(body))
      .filter(({ body }) => /\bonly if\b/i.test(contractOf(body)!.tail))
      .map(({ section, line }) => `${file}:${line} § ${section}`);
    expect(offenders).toEqual([]);
  });
});

describe("sections shared across phases carry the same contract", () => {
  // `Deferred & Out-of-Scope` reaching the human as an exhaustive list in plan but
  // a judgement call in ship is exactly the drift this suite exists to catch.
  const shared = ["Action Items", "Risks", "Deferred & Out-of-Scope", "Outstanding Questions"];

  it.each(shared)("%s uses one verb everywhere it appears", (section) => {
    const seen = new Map<string, string>();
    for (const file of summaryFiles) {
      for (const p of placeholders(file)) {
        if (p.section !== section) continue;
        const contract = contractOf(p.body);
        expect(contract, `${file} § ${section} has no closed-set verb`).toBeDefined();
        seen.set(file, contract!.verb);
      }
    }
    expect(seen.size, `${section} appears in no summary prompt — stale entry?`).toBeGreaterThan(0);
    expect(new Set(seen.values()).size, `${section} disagrees: ${JSON.stringify([...seen])}`).toBe(
      1,
    );
  });
});
