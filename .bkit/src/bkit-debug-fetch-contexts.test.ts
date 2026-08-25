/**
 * bkit-debug-fetch-contexts.test.ts — the `debug-fetch` context vocabulary is
 * spelled out in four places that cannot import from each other: a TypeScript
 * const, two shell loops and a `case` in `.bkit/workflows/bkit-debug.md`, and the
 * consumer-facing table in `.agents/config.md`.
 *
 * Drift is silent and asymmetric. A context added to the workflow but not to
 * `DEBUG_FETCH_CONTEXTS` makes preflight read those blocks as unknown; a context
 * added to the const but not the workflow makes the advisory demand a block the
 * runner will refuse to execute. Neither shows up at runtime as an error — the
 * evidence simply never arrives, and an absent artifact reads as "clean".
 *
 * So the lists stay duplicated (a shared shell helper would have to ship as a new
 * managed file) and this test is what keeps them equal.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import { DEBUG_FETCH_CONTEXTS, parseDebugFetchStart } from "./bkit-preflight";

const REPO_ROOT = path.resolve(__dirname, "../..");
const DEBUG_MD = path.join(REPO_ROOT, ".bkit/workflows/bkit-debug.md");
const CONFIG_MD = path.join(REPO_ROOT, ".agents/config.md");
const CONFIG_TEMPLATE = path.join(REPO_ROOT, ".bkit/templates/.agents/config.md");

const debugMd = () => fs.readFileSync(DEBUG_MD, "utf-8");

describe("debug-fetch context vocabulary is single-valued across surfaces", () => {
  it("every `for CONTEXT in …` loop in the workflow matches DEBUG_FETCH_CONTEXTS", () => {
    const loops = [...debugMd().matchAll(/for CONTEXT in ([\w ]+); do/g)].map((m) =>
      m[1]!.trim().split(/\s+/),
    );
    // Coverage narration (Step 4.2) + contextsConfigured (Step 4.6).
    expect(loops.length).toBe(2);
    for (const loop of loops) expect(loop).toEqual([...DEBUG_FETCH_CONTEXTS]);
  });

  it("the workflow's `case` arms match DEBUG_FETCH_CONTEXTS", () => {
    const m = /^\s*([\w|]+)\) PREFIX="debug-context-\$CONTEXT" ;;$/m.exec(debugMd());
    expect(m, "no `case` arm assigning PREFIX found in bkit-debug.md").not.toBeNull();
    expect(m![1]!.split("|")).toEqual([...DEBUG_FETCH_CONTEXTS]);
  });

  it("the consumer-facing table lists exactly DEBUG_FETCH_CONTEXTS", () => {
    for (const file of [CONFIG_MD, CONFIG_TEMPLATE]) {
      const rows = [
        ...fs.readFileSync(file, "utf-8").matchAll(/^\| `(\w+)`[^|]*\| `debug-context-/gm),
      ]
        .map((m) => m[1]!)
        .sort();
      expect(rows, `context table drift in ${path.relative(REPO_ROOT, file)}`).toEqual(
        [...DEBUG_FETCH_CONTEXTS].sort(),
      );
    }
  });

  it("an unknown context is refused, not run under a blank prefix", () => {
    // The `*)` arm must terminate the block; falling through leaves PREFIX empty
    // and writes the artifact to a path the Step 4.6 glob cannot see.
    const md = debugMd();
    const star = /^\s*\*\) echo "\[bkit-debug\] debug-fetch: UNKNOWN context=.*$/m.exec(md);
    expect(star, "no `*)` arm for unknown contexts").not.toBeNull();
    expect(star![0]).toMatch(/exit 0 ;;$/);
  });
});

describe("marker parsers agree across TypeScript and awk", () => {
  // The awk parser strips `[ \t]*` and splits attributes on `[ \t]+`; anything it
  // accepts and this one rejects is a block that runs while every advisory in
  // `bkit check` reports it absent.
  const cases: [string, { name: string; context: string } | null][] = [
    ["<!-- debug-fetch:start -->", { name: "", context: "runtime" }],
    ["<!-- debug-fetch:start vercel -->", { name: "vercel", context: "runtime" }],
    ["<!-- debug-fetch:start github context=ci -->", { name: "github", context: "ci" }],
    ["<!-- debug-fetch:start context=e2e playwright -->", { name: "playwright", context: "e2e" }],
    ["<!-- debug-fetch:start  github   context=ci -->", { name: "github", context: "ci" }],
    ["<!-- debug-fetch:start\tgithub\tcontext=ci -->", { name: "github", context: "ci" }],
    ["<!-- debug-fetch:start github context=ci\t-->", { name: "github", context: "ci" }],
    ["<!-- debug-fetch:end -->", null],
    ["  <!-- debug-fetch:start github -->", null],
  ];

  for (const [line, expected] of cases) {
    it(`parses ${JSON.stringify(line)}`, () => {
      expect(parseDebugFetchStart(line)).toEqual(expected);
    });
  }
});
