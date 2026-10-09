/**
 * bkit-context-fetch-contexts.test.ts — the `context-fetch` context vocabulary is
 * spelled out in three places: the preflight const `CONTEXT_FETCH_CONTEXTS`
 * (what `bkit check` advisories expect), the runner's `CONTEXTS` in
 * `commands/workflow/context.ts` (what `bkit context list-blocks|run-block`
 * will execute), and the consumer-facing table in `.agents/context.md`.
 *
 * Drift is silent and asymmetric. A context the runner accepts but preflight does
 * not makes preflight read those blocks as unknown; a context preflight expects but
 * the runner refuses makes the advisory demand a block that is never executed.
 * Neither shows up at runtime as an error — the evidence simply never arrives, and
 * an absent artifact reads as "clean".
 *
 * The same holds for the start-marker grammar: preflight and the runner each parse
 * `<!-- context-fetch:start ... -->`, and a line one accepts and the other reads
 * differently is a block that runs while every advisory reports it absent.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { CONTEXT_FETCH_CONTEXTS, parseContextFetchStart } from "./bkit-preflight";
import { CONTEXTS, parseMarker } from "./commands/workflow/context";

const REPO_ROOT = path.resolve(__dirname, "../..");
const CONFIG_MD = path.join(REPO_ROOT, ".agents/context.md");
const CONFIG_TEMPLATE = path.join(REPO_ROOT, ".bkit/templates/.agents/context.md");

describe("context-fetch context vocabulary is single-valued across surfaces", () => {
  it("the runner's CONTEXTS equal preflight's CONTEXT_FETCH_CONTEXTS, in narration order", () => {
    expect([...CONTEXTS]).toEqual([...CONTEXT_FETCH_CONTEXTS]);
  });

  it("the consumer-facing table lists exactly CONTEXT_FETCH_CONTEXTS", () => {
    for (const file of [CONFIG_MD, CONFIG_TEMPLATE]) {
      const rows = [...fs.readFileSync(file, "utf-8").matchAll(/^\| `(\w+)`[^|]*\| `context-/gm)]
        .map((m) => m[1]!)
        .sort();
      expect(rows, `context table drift in ${path.relative(REPO_ROOT, file)}`).toEqual(
        [...CONTEXT_FETCH_CONTEXTS].sort(),
      );
    }
  });
});

describe("start-marker parsers agree between preflight and the runner", () => {
  const START = "<!-- context-fetch:start";
  const cases: [string, { name: string; context: string } | null][] = [
    ["<!-- context-fetch:start -->", { name: "", context: "runtime" }],
    ["<!-- context-fetch:start vercel -->", { name: "vercel", context: "runtime" }],
    ["<!-- context-fetch:start github context=ci -->", { name: "github", context: "ci" }],
    ["<!-- context-fetch:start context=e2e playwright -->", { name: "playwright", context: "e2e" }],
    ["<!-- context-fetch:start  github   context=ci -->", { name: "github", context: "ci" }],
    ["<!-- context-fetch:start\tgithub\tcontext=ci -->", { name: "github", context: "ci" }],
    ["<!-- context-fetch:start github context=ci\t-->", { name: "github", context: "ci" }],
    ["<!-- context-fetch:end -->", null],
    ["  <!-- context-fetch:start github -->", null],
  ];

  for (const [line, expected] of cases) {
    it(`parses ${JSON.stringify(line)}`, () => {
      expect(parseContextFetchStart(line)).toEqual(expected);
      // The runner only treats a line as a block start when it begins with the
      // marker; on those lines its parse must match preflight's exactly.
      if (line.startsWith(START)) expect(parseMarker(line)).toEqual(expected);
      else expect(expected).toBeNull();
    });
  }
});
