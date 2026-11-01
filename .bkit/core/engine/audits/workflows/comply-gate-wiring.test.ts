// audits/workflows/comply-gate-wiring.test.ts — close-gate wiring audit.
//
// Contract:
//   - `bkit workflows close` grades the run itself (`gradeCompliance`, fail-open)
//     BEFORE it writes the close report and before its commit, so the report
//     carries this run's grade and the `kind:"compliance"` rows land in the close
//     commit. That ordering is pinned in commands/workflow/workflows.test.ts.
//   - So every phase workflow (design, plan, build, debug, ship) closes through
//     exactly one `workflows close --workflow=<wf>` call (build has one per
//     ending: the published close and the held close), which commits in the
//     same call (`--message=` or ship's `--flush`), and never calls `bkit comply`
//     itself — a second grader run would double the compliance rows.
//   - Close telemetry is written once (`--outbox` writes `close-telemetry.md`),
//     and the tracker close comment embeds it: the close call's own `--number`
//     comment, `workflows links --outbox`, or an `issues comment` Telemetry section.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const PHASES = ["design", "plan", "build", "debug", "ship"] as const;

/** Close calls per phase: build closes once per ending (published, held); every other phase once. */
const EXPECTED_CLOSE_CALLS: Record<(typeof PHASES)[number], number> = {
  design: 1,
  plan: 1,
  build: 2,
  debug: 1,
  ship: 1,
};

/** Held-ending close calls per phase: only build has a held close. */
const EXPECTED_HELD_CLOSE_CALLS: Record<(typeof PHASES)[number], number> = {
  design: 0,
  plan: 0,
  build: 1,
  debug: 0,
  ship: 0,
};

function readWorkflow(name: string): string {
  const p = path.resolve(__dirname, "../../../../../.bkit/core/workflows", name);
  return fs.readFileSync(p, "utf8");
}

/** Every ```bash block body in a workflow. */
const bashBlocks = (content: string) =>
  [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!);

/** True when the tracker close comment embeds the close telemetry, by any of the three routes. */
function embedsTelemetry(closeLine: string, content: string): boolean {
  return (
    /--number=\d+/.test(closeLine) ||
    /workflows links [^\n]*--outbox="\{OUTBOX\}"/.test(content) ||
    /issues comment [^\n]*--section="Telemetry=\{OUTBOX\}\/close-telemetry\.md"/.test(content)
  );
}

describe("every phase workflow grades itself at close through bkit workflows close", () => {
  for (const phase of PHASES) {
    const content = readWorkflow(`bkit-${phase}.md`);
    const closeLines = bashBlocks(content)
      .flatMap((b) => b.split("\n"))
      .filter((l) => l.includes(`"{BKIT}" workflows close --workflow=${phase}`));

    it(`bkit-${phase}.md closes through exactly ${EXPECTED_CLOSE_CALLS[phase]} workflows close call(s)`, () => {
      expect(closeLines).toHaveLength(EXPECTED_CLOSE_CALLS[phase]);
      expect(closeLines.filter((l) => l.includes("--ending=held"))).toHaveLength(
        EXPECTED_HELD_CLOSE_CALLS[phase],
      );
    });

    it(`bkit-${phase}.md never runs the grader itself`, () => {
      expect(content).not.toMatch(/\bcomply --phase=/);
      expect(content).not.toContain("pnpm bkit comply");
    });

    for (const [i, line] of closeLines.entries()) {
      it(`bkit-${phase}.md: close call ${i + 1} commits what it graded`, () => {
        expect(line).toMatch(/--message="[^"]+"|--flush\b/);
      });

      it(`bkit-${phase}.md: close call ${i + 1} writes close telemetry once and embeds it in the close comment`, () => {
        expect(line).toContain('--outbox="{OUTBOX}"');
        expect(
          embedsTelemetry(line, content),
          "the close comment carries the telemetry report",
        ).toBe(true);
      });
    }
  }
});
