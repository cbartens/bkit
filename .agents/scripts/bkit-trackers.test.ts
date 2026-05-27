// bkit-trackers.test.ts — inline tracker-block resolution unit tests (true/false model).
import { describe, expect, it } from "vitest";
import { substituteWorkflow } from "./bkit-trackers";
import * as fs from "node:fs";
import * as path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");

function pair(gh: string, ln: string): string {
  return [
    `<!-- bkit:tracker github start -->\n${gh}\n<!-- bkit:tracker github end -->`,
    `<!-- bkit:tracker linear start -->\n${ln}\n<!-- bkit:tracker linear end -->`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// github/linear pairs
// ---------------------------------------------------------------------------

describe("substituteWorkflow — github/linear pairs", () => {
  it("keeps the chosen tracker's block; none collapses to the generic skip message", () => {
    const wf = `Step.\n${pair("GH BODY", "LN BODY")}\nTail.\n`;

    const gh = substituteWorkflow(wf, "github");
    expect(gh.pairs).toBe(1);
    expect(gh.orphans).toEqual([]);
    expect(gh.output).toContain("GH BODY");
    expect(gh.output).not.toContain("LN BODY");
    expect(gh.output).not.toContain("bkit:tracker");

    expect(substituteWorkflow(wf, "linear").output).toContain("LN BODY");

    const no = substituteWorkflow(wf, "none");
    expect(no.output).toContain("_No tracker connected, skip step._");
    expect(no.output).not.toContain("GH BODY");
    expect(no.output).not.toContain("LN BODY");
  });

  it("preserves a list-number prefix on the resolved pair", () => {
    const wf = `3. ${pair("gh-call", "ln-call")}\n4. Next.\n`;
    expect(substituteWorkflow(wf, "github").output).toContain("3. gh-call");
    expect(substituteWorkflow(wf, "none").output).toContain(
      "3. _No tracker connected, skip step._",
    );
  });

  it("uses a pair's trailing false block under none instead of the generic stub", () => {
    const wf = `1. ${pair("gh", "ln")}
<!-- bkit:tracker false start -->
ISSUE_ID="" — derive FID from branch.
<!-- bkit:tracker false end -->
`;
    const no = substituteWorkflow(wf, "none");
    expect(no.output).toContain('ISSUE_ID="" — derive FID from branch.');
    expect(no.output).not.toContain("_No tracker connected, skip step._");
    // wired ignores the trailing false block
    expect(substituteWorkflow(wf, "github").output).toContain("1. gh");
    expect(substituteWorkflow(wf, "github").output).not.toContain("derive FID from branch");
  });

  it("resolves multiple pairs", () => {
    const wf = `${pair("g1", "l1")}\n\n${pair("g2", "l2")}\n`;
    const r = substituteWorkflow(wf, "github");
    expect(r.pairs).toBe(2);
    expect(r.output).toContain("g1");
    expect(r.output).toContain("g2");
  });

  it("flags a lone github block (no linear) as an orphan", () => {
    const wf = `<!-- bkit:tracker github start -->\nbody\n<!-- bkit:tracker github end -->\n`;
    const r = substituteWorkflow(wf, "github");
    expect(r.pairs).toBe(0);
    expect(r.orphans).toContain("github");
  });
});

// ---------------------------------------------------------------------------
// true / false conditional blocks
// ---------------------------------------------------------------------------

describe("substituteWorkflow — true/false conditionals", () => {
  it("`true` keeps content when wired, removes it entirely under none (no stub)", () => {
    const wf = `3. Step.
   <!-- bkit:tracker true start -->
   \`{BODY}\` = fenced block below:
   kept line
   <!-- bkit:tracker true end -->
4. Next.
`;
    const gh = substituteWorkflow(wf, "github");
    expect(gh.conditionals).toBe(1);
    expect(gh.orphans).toEqual([]);
    expect(gh.output).toContain(
      "3. Step.\n   `{BODY}` = fenced block below:\n   kept line\n4. Next.",
    );

    const no = substituteWorkflow(wf, "none");
    // removed entirely — no stub, no blank gap
    expect(no.output).toContain("3. Step.\n4. Next.");
    expect(no.output).not.toContain("kept line");
    expect(no.output).not.toContain("bkit:tracker");
  });

  it("`false` keeps content only under none, removes it when wired", () => {
    const wf = `x
   <!-- bkit:tracker false start -->
   none-only note
   <!-- bkit:tracker false end -->
y
`;
    expect(substituteWorkflow(wf, "none").output).toContain("none-only note");
    const gh = substituteWorkflow(wf, "github");
    expect(gh.output).not.toContain("none-only note");
    expect(gh.output).toContain("x\ny");
  });

  it("resolves a pair nested inside a `true` block", () => {
    const wf = `   <!-- bkit:tracker true start -->
   ${pair("GH", "LN")}
   Set VAR. If empty -> Failure Path.
   <!-- bkit:tracker true end -->
`;
    const gh = substituteWorkflow(wf, "github");
    expect(gh.pairs).toBe(1);
    expect(gh.conditionals).toBe(1);
    expect(gh.orphans).toEqual([]);
    expect(gh.output).toContain("GH");
    expect(gh.output).toContain("Set VAR. If empty -> Failure Path.");
    expect(gh.output).not.toContain("bkit:tracker");

    const no = substituteWorkflow(wf, "none");
    expect(no.output).not.toContain("Failure Path");
    expect(no.output).not.toContain("GH");
    expect(no.output).not.toContain("bkit:tracker");
  });

  it("flags an unbalanced true marker as an orphan", () => {
    expect(substituteWorkflow("<!-- bkit:tracker true start -->\nb\n", "github").orphans).toContain(
      "true",
    );
  });
});

// ---------------------------------------------------------------------------
// Real workflow sources — resolve cleanly for every tracker
// ---------------------------------------------------------------------------

describe("real workflow sources", () => {
  const workflows = [
    "bkit-build",
    "bkit-ship",
    "bkit-debug",
    "bkit-design",
    "bkit-plan",
    "bkit-cloud",
  ];

  for (const wf of workflows) {
    for (const tracker of ["github", "linear", "none"] as const) {
      it(`${wf} resolves cleanly for ${tracker}`, () => {
        const src = fs.readFileSync(
          path.join(REPO_ROOT, ".agents", "workflows", `${wf}.md`),
          "utf-8",
        );
        const r = substituteWorkflow(src, tracker);
        expect(r.orphans, `orphans in ${wf}/${tracker}`).toEqual([]);
        expect(r.output, `leftover markers in ${wf}/${tracker}`).not.toMatch(
          /<!--\s*bkit:tracker\b/,
        );
        expect(r.pairs, `${wf} should have github/linear pairs`).toBeGreaterThan(0);
      });
    }
  }

  it("every github block has a matching linear block; no legacy none markers remain", () => {
    for (const wf of workflows) {
      const src = fs.readFileSync(
        path.join(REPO_ROOT, ".agents", "workflows", `${wf}.md`),
        "utf-8",
      );
      const count = (re: RegExp) => (src.match(re) ?? []).length;
      const gh = count(/<!--\s*bkit:tracker\s+github\s+start\s*-->/g);
      const ln = count(/<!--\s*bkit:tracker\s+linear\s+start\s*-->/g);
      // `none` markers are retired — no-tracker content uses `false`.
      const legacyNone = count(/<!--\s*bkit:tracker\s+none\s+(?:start|end)\s*-->/g);
      expect(gh, `${wf} unbalanced github/linear`).toBe(ln);
      expect(legacyNone, `${wf} has retired bkit:tracker none markers`).toBe(0);
    }
  });
});
