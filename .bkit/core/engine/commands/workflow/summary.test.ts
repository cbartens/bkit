import { describe, expect, it } from "vitest";

import { buildSummary, NEXT_STEP, refOf, type SummaryInput } from "./summary";

/** A `read` that serves these files and nothing else. */
const reader =
  (files: Record<string, string>) =>
  (rel: string): string | null =>
    files[rel] ?? null;

describe("refOf", () => {
  it("gives #N for a numeric issue segment", () => {
    expect(refOf("160-slug")).toBe("#160");
    expect(refOf("160-slug", "github")).toBe("#160");
  });

  it("gives the uppercase key for a prefixed issue segment", () => {
    expect(refOf("abc-123-slug")).toBe("ABC-123");
    expect(refOf("abc-123-slug", "linear")).toBe("ABC-123");
  });

  it("gives no ref for a FID with no issue segment, or under no tracker", () => {
    expect(refOf("my-branch-slug")).toBeUndefined();
    expect(refOf("upgrade-react-19", "github")).toBeUndefined();
    expect(refOf("160-slug", "none")).toBeUndefined();
  });
});

describe("buildSummary", () => {
  /** A plan whose one task is ticked. */
  const donePlan = [
    "<!-- bkit:group 1 start -->",
    "### GROUP 1: Do",
    "<!-- bkit:task 1 start -->",
    "- [x] **TASK 1:** Do.",
    "  - **DONE WHEN:** d.",
    "  - **TEST FIRST:**",
    "    - `a.test.ts` `t1`",
    "<!-- bkit:task 1 end -->",
    "<!-- bkit:group 1 end -->",
  ].join("\n");
  const input = (over: Partial<SummaryInput>): SummaryInput => ({
    workflow: "build",
    fid: "682-summary-verb",
    ref: "#682",
    rows: [],
    plans: [{ path: "docs/plans/p-plan.md", text: donePlan }],
    deferrals: [],
    deferralsAdded: 0,
    decisionFiles: [],
    read: () => null,
    ...over,
  });

  it("writes the header every reader expects, and the next step with the ref", () => {
    const s = buildSummary(input({}));
    expect(s.markdown.split("\n").slice(0, 3)).toEqual([
      "Verdict: PASS",
      "Failures: 0",
      "<!-- verdict:end -->",
    ]);
    expect(s.nextStep).toBe("/bkit-ship #682");
    expect(s.markdown).toContain("## Recommended Next Step");
  });

  it("a plan step's FAIL review answered by its apply step is CONCERNS, not FAIL", () => {
    const s = buildSummary(
      input({
        workflow: "plan",
        rows: [
          { type: "step-done", step: "plan-review", verdict: "FAIL", failures: 2, attempt: 1 },
          { type: "step-done", step: "plan-apply-review", verdict: "PASS", attempt: 1 },
        ],
      }),
    );
    expect(s.verdict).toBe("CONCERNS");
    expect(s.nextStep).toBe("/bkit-build #682");
  });

  it("a build challenge FAIL answered by its fix tasks or a decision is CONCERNS; unanswered is FAIL", () => {
    const challenge = {
      type: "step-done",
      step: "build-challenge",
      verdict: "FAIL",
      failures: 1,
      attempt: 1,
    };
    for (const answer of ["build-plan-execute", "build-decision"]) {
      const s = buildSummary(
        input({
          rows: [challenge, { type: "step-done", step: answer, verdict: "PASS", attempt: 2 }],
        }),
      );
      expect(s.verdict, answer).toBe("CONCERNS");
      expect(s.markdown).toContain(`answered by ${answer}`);
    }
    expect(buildSummary(input({ rows: [challenge] })).verdict).toBe("FAIL");
  });

  it("a group's execute FAIL answered by that group's later non-FAIL verify is CONCERNS; else FAIL", () => {
    const row = (step: string, group: number, verdict: string, attempt = 1) => ({
      type: "step-done",
      step,
      group,
      verdict,
      attempt,
    });
    const execute = row("build-plan-execute", 7, "FAIL");
    // Verify FAIL → Decision Pause accepts the gap → verify re-runs with CONCERNS.
    const s = buildSummary(
      input({
        rows: [
          execute,
          row("build-plan-verify", 7, "FAIL"),
          { type: "step-done", step: "build-decision", attempt: 1, route: "verify" },
          row("build-plan-verify", 7, "CONCERNS", 2),
        ],
      }),
    );
    expect(s.verdict).toBe("CONCERNS");
    expect(s.reasons).toContain("build-plan-execute (group 7) FAIL, answered by build-plan-verify");
    expect(s.reasons).toContain("build-plan-verify (group 7) CONCERNS");

    for (const rows of [
      [execute],
      [execute, row("build-plan-verify", 8, "PASS")],
      [row("build-plan-verify", 7, "PASS"), execute],
      [execute, { type: "step-done", step: "build-decision", attempt: 1 }],
    ])
      expect(buildSummary(input({ rows })).reasons).toContain("build-plan-execute (group 7) FAIL");
  });

  it("the Challenge section says when challenge-1 was skipped for a small change", () => {
    const gate = (linesChanged: number, filesChanged: number, size: string, skipped: boolean) => ({
      type: "challenge-gate",
      workflow: "build",
      linesChanged,
      filesChanged,
      size,
      skipped,
    });
    const small = buildSummary(
      input({ rows: [gate(900, 20, "large", false), gate(42, 3, "small", true)] }),
    );
    const section = small.markdown.split("## Challenge")[1]!.split("## ")[0]!;
    expect(section).toContain("- challenge-1 skipped: small change (42 lines, 3 files)");
    expect(section).not.toContain("None");
    const large = buildSummary(
      input({ rows: [gate(42, 3, "small", true), gate(900, 20, "large", false)] }),
    );
    expect(large.markdown).not.toContain("challenge-1 skipped");
  });

  it("debug with Reproduced: NO recommends a repro re-run, not FAIL", () => {
    const s = buildSummary(
      input({
        workflow: "debug",
        rows: [
          {
            type: "step-done",
            step: "debug-failure-reproduce",
            verdict: "FAIL",
            failures: 1,
            attempt: 1,
            artifacts: ["r.md"],
          },
        ],
        read: reader({ "r.md": "Verdict: FAIL\nReproduced: NO\n<!-- verdict:end -->\n" }),
      }),
    );
    expect(s.verdict).toBe("CONCERNS");
    expect(s.nextStep).toBe("/bkit-debug #682 [repro]");
  });

  it("ship PASS says no further command; FAIL goes back to /bkit-ship", () => {
    expect(buildSummary(input({ workflow: "ship" })).nextStep).toBe(NEXT_STEP.ship.PASS.line);
    const failed = buildSummary(
      input({
        workflow: "ship",
        rows: [{ type: "step-done", step: "ship-merge-pr", verdict: "FAIL", failures: 1 }],
      }),
    );
    expect(failed.nextStep).toBe("/bkit-ship #682");
  });

  const ws = (n: number, name: string) => ({
    id: `WS-${n}`,
    n,
    name,
    requires: [],
    requiresText: "[]",
  });
  const plan = (n: number, name: string, covers: string[], requires: string[] = []) => ({
    id: `P-${n}`,
    n,
    name,
    covers,
    requires,
    requiresText: `[${requires.join(", ")}]`,
  });

  it("prints plans with covered workstreams", () => {
    const s = buildSummary(
      input({
        workflow: "design",
        workstreams: [ws(1, "Engine"), ws(2, "Help"), ws(3, "Docs")],
        suggestedPlans: [plan(1, "Command", ["WS-1", "WS-2", "WS-3"])],
      }),
    );
    expect(s.nextStep).toBe("/bkit-plan #682");
    const section = s.markdown.split("## Suggested Plans\n")[1]!.split("\n## ")[0]!;
    expect(section.trim()).toBe(
      [
        "### P-1: Command",
        "",
        "Covers: WS-1 (Engine), WS-2 (Help), WS-3 (Docs)",
        "Requires: []",
      ].join("\n"),
    );
    expect(s.markdown).not.toContain("### WS-");
    expect(s.markdown).not.toContain("one issue each");
  });

  it("a one-workstream design shows one plan and /bkit-plan on its own ref", () => {
    const s = buildSummary(
      input({
        workflow: "design",
        workstreams: [ws(1, "Engine")],
        suggestedPlans: [plan(1, "Engine", ["WS-1"])],
      }),
    );
    expect(s.nextStep).toBe("/bkit-plan #682");
    expect(s.markdown).toContain("### P-1: Engine\n\nCovers: WS-1 (Engine)\n");
  });

  it("two plans ask to file plan issues first", () => {
    const s = buildSummary(
      input({
        workflow: "design",
        workstreams: [ws(1, "Engine"), ws(2, "Help"), ws(3, "Docs")],
        suggestedPlans: [
          plan(1, "Command", ["WS-1", "WS-2"]),
          plan(2, "Docs", ["WS-3"], ["P-1"]),
        ],
      }),
    );
    expect(s.nextStep).toBe(
      "File the Suggested Plans issues, then /bkit-plan <first root plan's new issue>",
    );
    expect(s.markdown).toContain("### P-1: Command");
    expect(s.markdown).toContain("### P-2: Docs\n\nCovers: WS-3 (Docs)\nRequires: [P-1]\n");
  });

  it("copies the organised design's Risks & Open Questions under ## Open Questions", () => {
    const organised = [
      "# Design",
      "",
      "## Trade-offs Accepted",
      "",
      "Speed over size.",
      "",
      "## Risks & Open Questions",
      "",
      "- Which store? Options: A, B. Recommended: A. Default if unanswered: A.",
      "",
      "## Suggested Workstreams",
      "",
    ].join("\n");
    const s = buildSummary(input({ workflow: "design", plans: [], organised }));
    const section = s.markdown.split("## Open Questions\n")[1]!.split("\n## ")[0]!;
    expect(section.trim()).toBe(
      "- Which store? Options: A, B. Recommended: A. Default if unanswered: A.",
    );
    expect(s.markdown).not.toContain("Speed over size.");
  });

  it("a design with no organised design says None under ## Open Questions", () => {
    const s = buildSummary(input({ workflow: "design", plans: [] }));
    expect(s.markdown).toContain("## Open Questions\n\nNone\n");
  });

  it("copies the plan's Acceptance Scenario and Open Questions word for word", () => {
    const plan = [
      "# Plan",
      "",
      "## 👤 ⚠️ Acceptance Scenario",
      "",
      "### Narrative",
      "",
      "A user exports a CSV.",
      "",
      "### Derived Test Matrix",
      "",
      "| row |",
      "",
      "### 👤 ✅ Human Confirmation",
      "",
      "- [ ] confirmed",
      "",
      "## 👤 ⚠️ Open Questions & Assumptions",
      "",
      "1. Which encoding? Recommended: UTF-8.",
      "",
      "## Out of Scope",
      "",
    ].join("\n");
    const s = buildSummary(
      input({ workflow: "plan", plans: [{ path: "docs/plans/p.md", text: plan }] }),
    );
    expect(s.markdown).toContain("### Narrative\n\nA user exports a CSV.");
    expect(s.markdown).toContain("1. Which encoding? Recommended: UTF-8.");
    expect(s.markdown).not.toContain("Derived Test Matrix");
    expect(s.markdown).not.toContain("- [ ] confirmed");
    expect(s.markdown).not.toContain("Out of Scope");
  });

  it("a build with no plan file fails, even when every step passed", () => {
    const s = buildSummary(
      input({
        plans: [],
        rows: [{ type: "step-done", step: "build-run-tests", verdict: "PASS", attempt: 1 }],
      }),
    );
    expect(s.verdict).toBe("FAIL");
    expect(s.failures).toBe(1);
    expect(s.reasons).toEqual(["No plan file"]);
    expect(s.markdown).toContain("Plan tasks: no plan file.");
  });

  it("a missing plan file fails only the build summary", () => {
    for (const workflow of ["plan", "design", "debug", "ship"] as const)
      expect(buildSummary(input({ workflow, plans: [] })).verdict, workflow).toBe("PASS");
  });

  it("a build's last unanswered verify FAIL fails it", () => {
    const s = buildSummary(
      input({
        rows: [
          {
            type: "step-done",
            step: "build-plan-verify",
            verdict: "FAIL",
            failures: 1,
            attempt: 1,
          },
          {
            type: "step-done",
            step: "build-decision",
            attempt: 1,
          },
        ],
      }),
    );
    expect(s.verdict).toBe("FAIL");
    expect(s.reasons).toContain("build-plan-verify FAIL");
    expect(s.reasons).toEqual(["build-plan-verify FAIL"]);
    expect(s.markdown).toContain("Plan tasks: 1 of 1 ticked in `docs/plans/p-plan.md`.");
  });

  it("lists open BLOCKED lines, accepted gaps, undecided pauses and TEST EXCEPTION fields", () => {
    const plan = [
      "<!-- bkit:group 1 start -->",
      "### GROUP 1: Do",
      "<!-- bkit:task 1 start -->",
      "- [x] **TASK 1:** Do.",
      "  - **DONE WHEN:** d.",
      "  - **TEST FIRST:**",
      "    - `a.test.ts` `t1`",
      "  - **TEST EXCEPTION:** `a.test.ts` `t1` — owner accepted",
      "<!-- bkit:task 1 end -->",
      "<!-- bkit:group 1 end -->",
    ].join("\n");
    const files: Record<string, string> = {
      "log/build-plan-execute-1-log.md": "DONE — Task 1\nBLOCKED — Task 2: needs a key\n",
      "log/build-decision-1-1.md": "Status: DECIDED\n**Q1 — gap:** x\nDecision: Accept — fine\n",
      "log/build-decision-1-2.md": "Status: OPEN\n**Q1 — gap:** y\n",
    };
    const s = buildSummary(
      input({
        rows: [
          {
            type: "step-done",
            step: "build-plan-execute",
            attempt: 1,
            artifacts: ["log/build-plan-execute-1-log.md"],
          },
          {
            type: "step-done",
            step: "build-decision",
            attempt: 1,
            artifacts: ["log/build-decision-1-1.md"],
          },
        ],
        plans: [{ path: "docs/plans/p.md", text: plan }],
        decisionFiles: ["log/build-decision-1-1.md", "log/build-decision-1-2.md"],
        read: reader(files),
      }),
    );
    expect(s.markdown).toContain("BLOCKED — Task 2: needs a key");
    expect(s.markdown).toContain("Decision: Accept — fine");
    expect(s.markdown).toContain("log/build-decision-1-2.md");
    expect(s.markdown).toContain("**TEST EXCEPTION:**");
    expect(s.verdict).toBe("CONCERNS");
  });

  it("counts a lettered Accept decision as accepted at the Decision Pause", () => {
    const decision = [
      "Status: ASSUMED",
      "**Q1 — Gap:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: A) Accept — minor",
      "Decision: A) Accept — fine by me",
      "",
      "**Q2 — Other gap:** accept it?",
      "Options: A) Accept / B) Fix now",
      "Recommended: A) Accept — minor",
      "Decision: A) Accept (assumed) — minor (ask:false, LOCAL, 2026-10-28)",
      "",
    ].join("\n");
    const s = buildSummary(
      input({
        rows: [
          {
            type: "step-done",
            step: "build-decision",
            attempt: 1,
            artifacts: ["log/build-decision-1-1.md"],
          },
        ],
        decisionFiles: ["log/build-decision-1-1.md"],
        read: reader({ "log/build-decision-1-1.md": decision }),
      }),
    );
    expect(s.verdict).toBe("CONCERNS");
    expect(s.markdown).toContain("1 item(s) accepted at the Decision Pause");
    expect(s.markdown).toContain("1 item(s) accepted without the owner");
    expect(s.markdown).toContain(
      "- Accepted: log/build-decision-1-1.md: Decision: Accept — fine by me",
    );
  });
});
