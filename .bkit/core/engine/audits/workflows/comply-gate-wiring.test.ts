// audits/workflows/comply-gate-wiring.test.ts — close-gate wiring audit.
//
// Contract:
//   - `bkit workflows close` grades the run itself (`gradeCompliance`, fail-open)
//     BEFORE it writes the close report and before its commit, so the report
//     carries this run's grade and the `kind:"compliance"` rows land in the close
//     commit. That ordering is pinned in commands/workflow/workflows.test.ts.
//   - So every phase workflow (design, plan, build, debug, ship) closes through
//     exactly one `workflows close --workflow=<wf>` call, which commits in the
//     same call (`--message=` or ship's `--flush`), and never calls `bkit comply`
//     itself — a second grader run would double the compliance rows.
//   - Close telemetry is written once (`--outbox` writes `close-telemetry.md`),
//     and the tracker close comment embeds it: the close call's own `--number`
//     comment, `workflows links --outbox`, or an `issues comment` Telemetry section.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const PHASES = ["design", "plan", "build", "debug", "ship"] as const;

function readWorkflow(name: string): string {
  const p = path.resolve(__dirname, "../../../../../.bkit/workflows", name);
  return fs.readFileSync(p, "utf8");
}

/** Every ```bash block body in a workflow. */
const bashBlocks = (content: string) =>
  [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!);

describe("every phase workflow grades itself at close through bkit workflows close", () => {
  for (const phase of PHASES) {
    const content = readWorkflow(`bkit-${phase}.md`);
    const closeLines = bashBlocks(content)
      .flatMap((b) => b.split("\n"))
      .filter((l) => l.includes(`"{BKIT}" workflows close --workflow=${phase}`));

    it(`bkit-${phase}.md closes through exactly one workflows close call`, () => {
      expect(closeLines).toHaveLength(1);
    });

    it(`bkit-${phase}.md never runs the grader itself`, () => {
      expect(content).not.toMatch(/\bcomply --phase=/);
      expect(content).not.toContain("pnpm bkit comply");
    });

    it(`bkit-${phase}.md: the close call commits what it graded`, () => {
      expect(closeLines[0]).toMatch(/--message="[^"]+"|--flush\b/);
    });

    it(`bkit-${phase}.md writes close telemetry once and embeds it in the close comment`, () => {
      expect(closeLines[0]).toContain('--outbox="{OUTBOX}"');
      const embedded =
        /--number=\d+/.test(closeLines[0]!) ||
        /workflows links [^\n]*--outbox="\{OUTBOX\}"/.test(content) ||
        /issues comment [^\n]*--section="Telemetry=\{OUTBOX\}\/close-telemetry\.md"/.test(content);
      expect(embedded, "the close comment carries the telemetry report").toBe(true);
    });
  }
});
