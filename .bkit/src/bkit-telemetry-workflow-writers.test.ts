/**
 * Workflow telemetry writers — the wiring half.
 *
 * Telemetry rows (`counter`, `outcome`) are written by `bkit workflows close`,
 * and `compliance` rows by `bkit comply`. Those commands stamp the A2-mandatory
 * envelope (ts/kind/repo/bkitVersion/step), validate each row against the stats
 * schema, compute ship's size fields, and fail open with
 * `[bkit-telemetry] append failed` — all pinned in
 * commands/workflow/workflows.test.ts (`bkit workflows close`) and
 * bkit-comply.test.ts.
 *
 * What stays here is the invariant that keeps those commands the ONLY writers:
 * a workflow that appends to `.bkit/stats.jsonl` itself bypasses the schema
 * check and the fail-open guard, and its rows drift from the command's the
 * moment either changes. Shell-side millisecond timestamps are banned for the
 * same reason they were before: `date +%s%3N` is GNU-only and prints a literal
 * `3N` on BSD/macOS.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const WORKFLOWS_DIR = path.join(REPO_ROOT, ".bkit/workflows");

const WORKFLOW_FILES = fs
  .readdirSync(WORKFLOWS_DIR)
  .filter((f) => f.endsWith(".md"))
  .sort();

/** Every ```bash block body in a workflow. */
const bashBlocks = (content: string) =>
  [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!);

describe("workflows never write telemetry rows themselves", () => {
  it("enumerates the workflows (not vacuous)", () => {
    expect(WORKFLOW_FILES.length).toBeGreaterThanOrEqual(6);
  });

  for (const name of WORKFLOW_FILES) {
    const content = fs.readFileSync(path.join(WORKFLOWS_DIR, name), "utf-8");

    it(`${name}: no bash block names .bkit/stats.jsonl — rows go through bkit workflows close / bkit comply`, () => {
      const writers = bashBlocks(content)
        .flatMap((b) => b.split("\n"))
        .filter((l) => /stats\.jsonl|>>\s*"?\$STATS\b/.test(l));
      expect(writers).toEqual([]);
    });

    it(`${name}: does NOT use the GNU-only date +%s%3N`, () => {
      expect(content).not.toContain("%3N");
    });
  }
});
