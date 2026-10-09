// bkit-comply-gate-wiring.test.ts — close-gate wiring audit.
//
// Done-when contract (WS2-T6 + #387, moved onto `bkit` commands by #467):
//   - Every phase workflow (design, plan, build, debug, ship) grades itself at
//     close with exactly one `"$BKIT" comply --phase=<wf>` call, carrying the
//     fail-open guard on the same line:
//     `|| echo "[bkit-comply] grader unavailable, skipping"`.
//     A grader crash must never fail the close; the bracketed prefix keeps the
//     skip grep-able.
//   - No comply call sits unguarded under `set -e`.
//   - The grader runs in the close block next to `bkit workflows close`, BEFORE
//     that block's commit — comply appends `kind:"compliance"` rows to
//     `.bkit/stats.jsonl`, and rows written after the commit never land.
//   - Close telemetry is written once: one `bkit workflows close` per workflow,
//     and the tracker close comment embeds the `report` it printed (via
//     `close-telemetry.md`) rather than re-running a writer after the push (#387).

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const PHASES = ["design", "plan", "build", "debug", "ship"] as const;

function readWorkflow(name: string): string {
  const p = path.resolve(__dirname, "../../.bkit/workflows", name);
  return fs.readFileSync(p, "utf8");
}

/** Every ```bash block body in a workflow. */
const bashBlocks = (content: string) =>
  [...content.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!);

/**
 * A comply line inside a `set -e` region without a same-line `||` guard: the
 * grader's non-zero exit would abort the close.
 */
function unguardedComplyUnderSetE(content: string): string | null {
  const lines = content.split("\n");
  let inSetE = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (/^set\s+-[a-z]*e[a-z]*\s*$/.test(line)) inSetE = true;
    if (line === "set +e") inSetE = false;
    if (/\bcomply --phase=/.test(line) && !line.includes("||") && inSetE) {
      return `Line ${i + 1}: unguarded comply under set -e: ${lines[i]}`;
    }
  }
  return null;
}

describe("every phase workflow grades itself at close through bkit comply", () => {
  for (const phase of PHASES) {
    const content = readWorkflow(`bkit-${phase}.md`);
    const complyLines = content.split("\n").filter((l) => /\bcomply --phase=/.test(l));

    it(`bkit-${phase}.md calls "$BKIT" comply --phase=${phase} exactly once`, () => {
      expect(complyLines).toHaveLength(1);
      expect(complyLines[0]).toContain(`"$BKIT" comply --phase=${phase} `);
      expect(content).not.toContain("pnpm bkit comply");
    });

    it(`bkit-${phase}.md: the comply call carries the [bkit-comply] fail-open guard on the same line`, () => {
      expect(complyLines[0]).toMatch(/\|\| echo "\[bkit-comply\][^"]*"/);
      expect(unguardedComplyUnderSetE(content)).toBeNull();
    });

    it(`bkit-${phase}.md: comply runs in the close block, beside workflows close and before its commit`, () => {
      const block = bashBlocks(content).find((b) => /\bcomply --phase=/.test(b));
      expect(block, "comply sits inside a bash block").toBeDefined();
      const close = block!.indexOf(`workflows close --workflow=${phase}`);
      const comply = block!.search(/\bcomply --phase=/);
      expect(close, "the close block also runs bkit workflows close").toBeGreaterThan(-1);
      const commit = block!.slice(comply).search(/\bgit commit\b|\bledgers commit\b/);
      expect(commit, "a commit follows the grader in the same block").toBeGreaterThan(-1);
    });

    it(`bkit-${phase}.md writes close telemetry once and embeds its report in the close comment`, () => {
      expect(content.split(`workflows close --workflow=${phase}`).length - 1).toBe(1);
      expect(content).toMatch(/\.report \| join\("\\n"\)'? > "[^"]*close-telemetry\.md"/);
      expect(content).toMatch(
        /issues comment [^\n]*--section="Telemetry=[^"]*close-telemetry\.md"/,
      );
    });
  }
});
