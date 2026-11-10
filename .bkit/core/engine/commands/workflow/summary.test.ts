import * as fs from "node:fs";
import * as path from "node:path";
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

  it("writes Publish: held when publish is false", () => {
    const s = buildSummary(input({ publish: false }));
    expect(s.markdown).toMatch(/^Publish: held$/m);
    expect(s.markdown).not.toMatch(/^Publish: pr$/m);
  });

  it("writes Publish: pr by default", () => {
    for (const publish of [undefined, true]) {
      const s = buildSummary(input({ publish }));
      expect(s.markdown).toMatch(/^Publish: pr$/m);
      expect(s.markdown).not.toContain("Publish: held");
    }
  });

  it("writes Docs: not synced on a held summary", () => {
    const held = buildSummary(input({ publish: false }));
    expect(held.markdown).toContain("Docs: not synced (ship syncs on landing)");
    expect(buildSummary(input({ publish: true })).markdown).not.toContain("Docs:");
    expect(buildSummary(input({})).markdown).not.toContain("Docs:");
  });

  it("keeps the verdict and next step unchanged by publish", () => {
    const held = buildSummary(input({ publish: false }));
    const pr = buildSummary(input({ publish: true }));
    expect(held.markdown).toContain("Publish: held");
    expect(pr.markdown).toContain("Publish: pr");
    expect(held.verdict).toBe(pr.verdict);
    expect(held.nextStep).toBe(pr.nextStep);
    expect(held.reasons).toEqual(pr.reasons);
    expect(held.markdown.split("\n").slice(0, 3)).toEqual(pr.markdown.split("\n").slice(0, 3));
  });

  it("a plan review resolved by its passing apply step leaves a passing summary and history", () => {
    const s = buildSummary(
      input({
        workflow: "plan",
        rows: [
          { type: "step-done", step: "plan-review", verdict: "FAIL", failures: 2, attempt: 1 },
          { type: "step-done", step: "plan-apply-review", verdict: "PASS", attempt: 1 },
        ],
      }),
    );
    expect(s.verdict).toBe("PASS");
    expect(s.nextStep).toBe("/bkit-build #682");
    expect(s.reasons).toEqual([]);
    expect(s.markdown).toContain("plan-review FAIL, resolved by plan-apply-review");
  });

  it("a build challenge cannot be cleared by unrelated fix tasks or a decision", () => {
    const challenge = {
      type: "step-done",
      step: "build-challenge",
      verdict: "FAIL",
      failures: 1,
      attempt: 1,
    };
    for (const answer of ["build-plan-tasks", "build-decision"]) {
      const s = buildSummary(
        input({
          rows: [challenge, { type: "step-done", step: answer, verdict: "PASS", attempt: 2 }],
        }),
      );
      expect(s.verdict, answer).toBe("FAIL");
    }
    expect(buildSummary(input({ rows: [challenge] })).verdict).toBe("FAIL");
  });

  it.each(["design", "plan"] as const)(
    "%s clears only the review covered by a passing update",
    (workflow) => {
      const review = {
        type: "step-done",
        step: `${workflow}-review`,
        verdict: "CONCERNS",
        attempt: 1,
      };
      const apply = {
        type: "step-done",
        step: `${workflow}-apply-review`,
        verdict: "PASS",
        attempt: 1,
      };
      const s = buildSummary(input({ workflow, rows: [review, apply] }));
      expect(s.verdict).toBe("PASS");
      expect(s.markdown).toContain(
        `${workflow}-review CONCERNS, resolved by ${workflow}-apply-review`,
      );
      for (const rows of [
        [review],
        [apply, review],
        [review, { ...apply, step: `${workflow}-organise` }],
        [review, { ...apply, verdict: "CONCERNS" }],
        [review, { ...apply, verdict: undefined }],
        [review, { ...apply, attempt: 2 }],
      ])
        expect(buildSummary(input({ workflow, rows })).verdict).toBe("CONCERNS");
    },
  );

  it("does not inherit a previous summary verdict when recomputing resolved work", () => {
    const rows = [
      { type: "step-done", step: "plan-review", verdict: "CONCERNS", attempt: 1 },
      { type: "step-done", step: "plan-summary", verdict: "CONCERNS" },
      { type: "step-done", step: "plan-apply-review", verdict: "PASS", attempt: 1 },
    ];
    const original = structuredClone(rows);
    const s = buildSummary(input({ workflow: "plan", rows }));
    expect(s.verdict).toBe("PASS");
    expect(s.reasons).toEqual([]);
    expect(rows).toEqual(original);
    expect(s.markdown).toContain("plan-summary | CONCERNS");
  });

  it("retains unrelated concerns after resolving a review", () => {
    const s = buildSummary(
      input({
        workflow: "design",
        rows: [
          { type: "step-done", step: "design-review", verdict: "CONCERNS" },
          { type: "step-done", step: "design-spike", verdict: "CONCERNS" },
          { type: "step-done", step: "design-apply-review", verdict: "PASS" },
        ],
      }),
    );
    expect(s.verdict).toBe("CONCERNS");
    expect(s.reasons).toEqual(["design-spike CONCERNS"]);
  });

  it("an update that applies critical review findings leaves only its optional concerns", () => {
    const s = buildSummary(
      input({
        workflow: "plan",
        rows: [
          { type: "step-done", step: "plan-review", verdict: "FAIL", attempt: 1 },
          { type: "step-done", step: "plan-apply-review", verdict: "CONCERNS", attempt: 1 },
        ],
      }),
    );
    expect(s.verdict).toBe("CONCERNS");
    expect(s.reasons).toEqual(["plan-apply-review CONCERNS"]);
    expect(s.markdown).toContain("remaining findings assessed by plan-apply-review");
  });

  it("a spike's disproven claims can be addressed without hiding unsettled claims", () => {
    const rows = [
      { type: "step-done", step: "design-spike", verdict: "FAIL", artifacts: ["spike.md"] },
      { type: "step-done", step: "design-apply-review", verdict: "PASS" },
    ];
    const resolved = buildSummary(
      input({
        workflow: "design",
        rows,
        read: reader({
          "spike.md": "## Unsettled\n\nNone\n\n## Verdict Reasoning\nDisproven assumption.",
        }),
      }),
    );
    expect(resolved.verdict).toBe("PASS");
    const partial = buildSummary(
      input({
        workflow: "design",
        rows,
        read: reader({
          "spike.md":
            "## Unsettled\n\nCapacity is BLOCKED\n\n## Verdict Reasoning\nMixed findings.",
        }),
      }),
    );
    expect(partial.verdict).toBe("CONCERNS");
    expect(partial.reasons).toContain("design-spike: unsettled claims remain");
    expect(buildSummary(input({ workflow: "design", rows })).verdict).toBe("FAIL");
  });

  it("retains remediation warnings and unrelated group failures after a verification PASS", () => {
    const s = buildSummary(
      input({
        rows: [
          { type: "step-done", step: "build-plan-gaps-remediate", verdict: "CONCERNS", group: 1 },
          { type: "step-done", step: "build-plan-tasks", verdict: "FAIL", group: 2 },
          { type: "step-done", step: "build-plan-verify", verdict: "PASS", group: 1 },
        ],
      }),
    );
    expect(s.reasons).toEqual([
      "build-plan-tasks (group 2) FAIL",
      "build-plan-gaps-remediate (group 1) CONCERNS",
    ]);
  });

  it("uses the latest verification and preserves earlier attempts in history", () => {
    const s = buildSummary(
      input({
        rows: [
          { type: "step-done", step: "build-plan-tasks", verdict: "FAIL", group: 1 },
          { type: "step-done", step: "build-plan-verify", verdict: "PASS", group: 1, attempt: 1 },
          { type: "step-done", step: "build-plan-verify", verdict: "FAIL", group: 1, attempt: 2 },
        ],
      }),
    );
    expect(s.verdict).toBe("FAIL");
    expect(s.reasons).toContain("build-plan-tasks (group 1) FAIL");
    expect(s.markdown).toContain("## Assessment History");
    expect(s.markdown).toContain("build-plan-verify (group 1) | PASS");
  });

  it("resolves challenge findings only through their matching round's verified tasks", () => {
    const finding = (n: number, severity: string, location: string) =>
      [
        `<!-- bkit:task ${n} start -->`,
        `- [x] **TASK ${n}:** Fix ${location}.`,
        `  **Severity:** ${severity} · **Fixable:** true · **Location:** \`${location}\` · **Round:** 1`,
        "  - **DONE WHEN:** fixed.",
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `regression` fails on bug",
        `<!-- bkit:task ${n} end -->`,
      ].join("\n");
    const critical = finding(2, "CRITICAL", "a.ts:10");
    const high = finding(3, "HIGH", "b.ts:20");
    const plan = `<!-- bkit:group 2 start -->\n### TASK GROUP 2: Fixes\n${critical}\n${high}\n<!-- bkit:group 2 end -->`;
    const report = `Verdict: FAIL\nFailures: 1\n<!-- verdict:end -->\n## Findings Log\n${critical}\n${high}`;
    const challenge = {
      type: "step-done",
      step: "build-challenge",
      verdict: "FAIL",
      round: 1,
      artifacts: ["challenge.md"],
    };
    const verify = {
      type: "step-done",
      step: "build-plan-verify",
      verdict: "PASS",
      group: 2,
      artifacts: ["verify.md"],
    };
    const files = {
      "challenge.md": report,
      "verify.md": "Verdict: PASS\nTasks: 2, 3\n<!-- verdict:end -->",
    };
    const params = {
      rows: [challenge, verify],
      plans: [{ path: "p.md", text: plan }],
      read: reader(files),
    };
    const s = buildSummary(input(params));
    expect(s.verdict).toBe("PASS");
    expect(s.markdown).toContain("a.ts:10");
    expect(s.markdown).toContain("resolved by build-plan-verify");
    for (const over of [
      { rows: [challenge, { ...verify, group: 3 }] },
      { rows: [verify, challenge] },
      { plans: [{ path: "p.md", text: plan.replaceAll("**Round:** 1", "**Round:** 2") }] },
      { read: reader({ ...files, "verify.md": "Verdict: PASS\nTasks: 7\n<!-- verdict:end -->" }) },
      { read: reader({ "verify.md": files["verify.md"] }) },
    ])
      expect(buildSummary(input({ ...params, ...over })).verdict).toBe("FAIL");
    const partial = buildSummary(
      input({
        ...params,
        read: reader({ ...files, "verify.md": "Verdict: PASS\nTasks: 2\n<!-- verdict:end -->" }),
      }),
    );
    expect(partial.verdict).toBe("CONCERNS");
    expect(partial.reasons.join("\n")).toContain("b.ts:20");
    expect(partial.reasons.join("\n")).not.toContain("a.ts:10");
    const rereviewed = buildSummary(
      input({
        ...params,
        rows: [challenge, verify, { ...challenge, verdict: "PASS", round: 2 }],
        read: reader({
          ...files,
          "challenge.md": "Verdict: PASS\nFailures: 0\n<!-- verdict:end -->\n## Findings Log\nNone",
        }),
      }),
    );
    expect.soft(rereviewed.verdict).toBe("PASS");
    expect(rereviewed.markdown).toContain("build-challenge | FAIL");
    const nextConcern = buildSummary(
      input({
        ...params,
        rows: [
          {
            ...challenge,
            challengeFindings: [
              { severity: "CRITICAL", location: "a.ts:10", title: "Old defect" },
              { severity: "HIGH", location: "b.ts:20", title: "Old second defect" },
            ],
          },
          verify,
          {
            ...challenge,
            verdict: "CONCERNS",
            round: 2,
            challengeFindings: [{ severity: "HIGH", location: "new.ts:30", title: "New defect" }],
          },
        ],
        read: reader({ "verify.md": files["verify.md"] }),
      }),
    );
    expect.soft(nextConcern.verdict).toBe("CONCERNS");
    expect.soft(nextConcern.reasons.join("\n")).toContain("new.ts:30");
    expect.soft(nextConcern.reasons.join("\n")).not.toContain("a.ts:10");
    const accepted = buildSummary(
      input({
        ...params,
        rows: [challenge],
        decisionFiles: ["decision.md"],
        read: reader({
          ...files,
          "decision.md":
            "Status: DECIDED\n\n**Q1 — Gap:** a.ts:10\nDecision: Accept — known limitation",
        }),
      }),
    );
    expect.soft(accepted.verdict).toBe("CONCERNS");
    expect.soft(accepted.reasons.join("\n")).toContain("accepted");
    const lowReport = `Verdict: CONCERNS\nFailures: 0\n<!-- verdict:end -->\n## Findings Log\n${finding(4, "LOW", "c.ts:30")}`;
    const closedLow = buildSummary(
      input({
        ...params,
        rows: [{ ...challenge, verdict: "CONCERNS" }],
        read: reader({ "challenge.md": lowReport }),
        deferrals: [
          {
            key: "682-summary-verb-challenge-low-c-ts-30",
            source: "c.ts:30",
            status: "CLOSED",
            severity: "LOW",
          },
        ],
      }),
    );
    expect.soft(closedLow.verdict).toBe("PASS");
    expect.soft(closedLow.markdown).not.toContain("resolved by build-plan-verify");
    const unrelatedClosure = buildSummary(
      input({
        ...params,
        rows: [{ ...challenge, verdict: "CONCERNS" }],
        read: reader({ "challenge.md": lowReport }),
        deferrals: [{ key: "unrelated", source: "c.ts:30", status: "CLOSED", severity: "LOW" }],
      }),
    );
    expect.soft(unrelatedClosure.verdict).toBe("CONCERNS");
  });

  it("a later verification covering the complete plan resolves its currency findings", () => {
    const current = { type: "step-done", step: "build-plan-current", verdict: "CONCERNS" };
    const verify = {
      type: "step-done",
      step: "build-plan-verify",
      verdict: "PASS",
      group: 1,
      artifacts: ["verify.md"],
    };
    const read = reader({ "verify.md": "Verdict: PASS\nTasks: 1\n<!-- verdict:end -->" });
    expect(buildSummary(input({ rows: [current, verify], read })).verdict).toBe("PASS");
    expect(buildSummary(input({ rows: [current, { ...verify, group: 2 }], read })).verdict).toBe(
      "CONCERNS",
    );
  });

  it("a group's failed execution stays unresolved when verification still has concerns", () => {
    const row = (step: string, group: number, verdict: string, attempt = 1) => ({
      type: "step-done",
      step,
      group,
      verdict,
      attempt,
    });
    const execute = row("build-plan-tasks", 7, "FAIL");
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
    expect(s.verdict).toBe("FAIL");
    expect(s.reasons).toContain("build-plan-tasks (group 7) FAIL");
    expect(s.reasons).toContain("build-plan-verify (group 7) CONCERNS");

    for (const rows of [
      [execute],
      [execute, row("build-plan-verify", 8, "PASS")],
      [row("build-plan-verify", 7, "PASS"), execute],
      [execute, { type: "step-done", step: "build-decision", attempt: 1 }],
    ])
      expect(buildSummary(input({ rows })).reasons).toContain("build-plan-tasks (group 7) FAIL");
  });

  it("a group's gaps fix FAIL resolved by that group's later PASS verify is historical", () => {
    const row = (step: string, group: number, verdict: string, attempt = 1) => ({
      type: "step-done",
      step,
      group,
      verdict,
      attempt,
    });
    const gaps = row("build-plan-gaps-remediate", 3, "FAIL");
    const answered = buildSummary(
      input({
        rows: [
          row("build-plan-verify", 3, "CONCERNS"),
          gaps,
          row("build-plan-verify", 3, "PASS", 2),
        ],
      }),
    );
    expect(answered.markdown).toContain(
      "build-plan-gaps-remediate (group 3) FAIL, resolved by build-plan-verify",
    );
    expect(answered.verdict).toBe("PASS");

    for (const rows of [
      [gaps],
      [gaps, row("build-plan-verify", 4, "PASS")],
      [gaps, row("build-plan-verify", 3, "FAIL", 2)],
    ])
      expect(buildSummary(input({ rows })).reasons).toContain(
        "build-plan-gaps-remediate (group 3) FAIL",
      );
  });

  it("a holistic gaps fix FAIL resolved by a later PASS holistic verify is historical", () => {
    const row = (step: string, verdict: string, attempt = 1) => ({
      type: "step-done",
      step,
      verdict,
      attempt,
    });
    const gaps = row("build-plan-gaps-remediate-holistic", "FAIL");
    const answered = buildSummary(
      input({
        rows: [
          row("build-plan-verify-holistic", "FAIL"),
          gaps,
          row("build-plan-verify-holistic", "PASS", 2),
        ],
      }),
    );
    expect(answered.markdown).toContain(
      "build-plan-gaps-remediate-holistic FAIL, resolved by build-plan-verify-holistic",
    );
    expect(answered.verdict).toBe("PASS");
    expect(
      buildSummary(input({ rows: [gaps, row("build-plan-verify-holistic", "FAIL", 2)] })).reasons,
    ).toContain("build-plan-gaps-remediate-holistic FAIL");
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
        suggestedPlans: [plan(1, "Command", ["WS-1", "WS-2"]), plan(2, "Docs", ["WS-3"], ["P-1"])],
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
      "log/build-plan-tasks-1-log.md": "DONE — Task 1\nBLOCKED — Task 2: needs a key\n",
      "log/build-decision-1-1.md": "Status: DECIDED\n**Q1 — gap:** x\nDecision: Accept — fine\n",
      "log/build-decision-1-2.md": "Status: OPEN\n**Q1 — gap:** y\n",
    };
    const s = buildSummary(
      input({
        rows: [
          {
            type: "step-done",
            step: "build-plan-tasks",
            attempt: 1,
            artifacts: ["log/build-plan-tasks-1-log.md"],
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
    expect(s.markdown).toContain(
      "- TEST EXCEPTION, task 1: `a.test.ts` `t1` — owner accepted (`docs/plans/p.md`)",
    );
    expect(s.verdict).toBe("CONCERNS");
  });

  it.each(["Task", "Step", "Gap"])(
    "keeps a repaired %s blocker in history rather than current action items",
    (kind) => {
      const log = `BLOCKED — ${kind} 1: waiting\nBLOCKED — ${kind} 2: still waiting\nDONE — ${kind} 1: fixed\n`;
      const s = buildSummary(
        input({
          rows: [{ type: "step-done", step: "build-plan-tasks", artifacts: ["tasks-log.md"] }],
          read: reader({ "tasks-log.md": log }),
        }),
      );
      const risks = s.markdown.split("## Risks and Action Items")[1]!;
      expect(risks).not.toContain(`${kind} 1: waiting`);
      expect(risks).toContain(`${kind} 2: still waiting`);
    },
  );

  it("lists each sub-bullet of a nested TEST EXCEPTION field with its task and reason", () => {
    const plan = [
      "<!-- bkit:group 1 start -->",
      "### GROUP 1: Do",
      "<!-- bkit:task 7 start -->",
      "- [x] **TASK 7:** Do.",
      "  - **DONE WHEN:** d.",
      "  - **TEST FIRST:**",
      "    - `a.test.ts` `t1`",
      "    - `b.test.ts` `t2`",
      "  - **TEST EXCEPTION:**",
      "    - `a.test.ts` `t1` fails on x — task 6 already built it",
      "      (owner, 2026-10-29)",
      "    - `b.test.ts` `t2` fails on y — edited first (owner, 2026-10-29)",
      "<!-- bkit:task 7 end -->",
      "<!-- bkit:group 1 end -->",
    ].join("\n");
    const s = buildSummary(input({ plans: [{ path: "docs/plans/p.md", text: plan }] }));
    const risks = s.markdown.split("## Risks and Action Items")[1]!.split("\n## ")[0]!;
    expect(risks.split("\n").filter((l) => l.startsWith("- "))).toEqual([
      "- TEST EXCEPTION, task 7: `a.test.ts` `t1` fails on x — task 6 already built it (owner, 2026-10-29) (`docs/plans/p.md`)",
      "- TEST EXCEPTION, task 7: `b.test.ts` `t2` fails on y — edited first (owner, 2026-10-29) (`docs/plans/p.md`)",
    ]);
  });

  it("consolidates documentation warnings from the active run without changing its verdict", () => {
    const record = (r: Record<string, string>) => JSON.stringify(r);
    const report = (...records: string[]) =>
      [
        "Verdict: PASS",
        "",
        "## Documentation Warnings",
        "",
        "```jsonl",
        ...records,
        "```",
        "",
      ].join("\n");
    const sec = {
      topic: "security",
      gap: "starter-only",
      recommendedPath: "docs/security.md",
      action: "Populate the security document with credential boundaries.",
    };
    const files = {
      "log/build-plan-tasks-1-log.md": report(
        record({ ...sec, alternativeEvidence: "EVIDENCE-FROM-TASKS-AGENT" }),
      ),
      "log/build-plan-verify-1-1.md": report(
        record({ ...sec, topic: "Security", alternativeEvidence: "EVIDENCE-FROM-VERIFY-AGENT" }),
        record({
          topic: "testing",
          gap: "missing",
          recommendedPath: "docs/testing.md",
          alternativeEvidence: "None available",
          action: "Copy the testing starter and fill in the CI lanes.",
        }),
        "{ this line is not json",
        record({ topic: "design", gap: "missing" }),
      ),
      // Untrusted raw input carrying a warning-shaped section.
      "log/build-input-1.md": report(
        record({ ...sec, topic: "deployments", gap: "RAW-INPUT-GAP", alternativeEvidence: "x" }),
      ),
      // A file of an earlier run: not one of this run's step artifacts.
      "log/build-plan-tasks-0-log.md": report(
        record({ ...sec, topic: "observability", gap: "OLD-RUN-GAP", alternativeEvidence: "y" }),
      ),
    };
    const rows = [
      {
        type: "step-done",
        step: "build-plan-tasks",
        verdict: "PASS",
        artifacts: ["log/build-plan-tasks-1-log.md", "log/missing-optional.md"],
      },
      {
        type: "step-done",
        step: "build-plan-verify",
        verdict: "PASS",
        artifacts: ["log/build-plan-verify-1-1.md", "log/build-input-1.md"],
      },
    ];
    const baseline = buildSummary(input({ rows }));
    const s = buildSummary(input({ rows, read: reader(files) }));

    // Verdict, failures and next step are untouched.
    expect(s.verdict).toBe(baseline.verdict);
    expect(s.failures).toBe(baseline.failures);
    expect(s.reasons).toEqual(baseline.reasons);
    expect(s.nextStep).toBe(baseline.nextStep);
    expect(s.markdown.split("\n").slice(0, 3)).toEqual([
      "Verdict: PASS",
      "Failures: 0",
      "<!-- verdict:end -->",
    ]);

    expect(s.markdown).toContain("## Documentation Warnings");
    // The same topic and gap from two agents appears once, with both pieces of evidence kept.
    expect(s.markdown.split("Populate the security document").length - 1).toBe(1);
    expect(s.markdown).toContain("EVIDENCE-FROM-TASKS-AGENT");
    expect(s.markdown).toContain("EVIDENCE-FROM-VERIFY-AGENT");
    // A distinct gap stays visible.
    expect(s.markdown).toContain("Copy the testing starter and fill in the CI lanes.");
    expect(s.markdown).toContain("docs/testing.md");
    // Untrusted input, earlier runs and malformed records never surface as a current gap.
    expect(s.markdown).not.toContain("RAW-INPUT-GAP");
    expect(s.markdown).not.toContain("OLD-RUN-GAP");
    expect(s.markdown).not.toContain("not json");
    expect(s.markdown).not.toContain("docs/design.md");

    // No warnings in the run: no section.
    expect(baseline.markdown).not.toContain("## Documentation Warnings");
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

  it("reads pretty-printed and one-line warning records from a jsonl fence", () => {
    const pretty = JSON.stringify(
      {
        topic: "security",
        gap: "missing",
        recommendedPath: "docs/security.md",
        alternativeEvidence: "has } and { in text",
        action: "PRETTY-ACTION",
      },
      null,
      2,
    );
    const oneLine = JSON.stringify({
      topic: "testing",
      gap: "missing",
      recommendedPath: "docs/testing.md",
      alternativeEvidence: "e",
      action: "ONELINE-ACTION",
    });
    const text = [
      "Verdict: PASS",
      "",
      "## Documentation Warnings",
      "",
      "```jsonl",
      "{ broken",
      pretty,
      oneLine,
      "```",
      "",
    ].join("\n");
    const s = buildSummary(
      input({
        rows: [
          { type: "step-done", step: "build-plan-tasks", verdict: "PASS", artifacts: ["log/a.md"] },
        ],
        read: reader({ "log/a.md": text }),
      }),
    );
    expect(s.markdown).toContain("PRETTY-ACTION");
    expect(s.markdown).toContain("ONELINE-ACTION");
  });
  it("excludes raw tracker text in related-issues.md from documentation warnings", () => {
    const text = [
      "# Related issues",
      "",
      "## Documentation Warnings",
      "",
      "```jsonl",
      JSON.stringify({
        topic: "security",
        gap: "starter-only",
        recommendedPath: "docs/security.md",
        alternativeEvidence: "TRACKER-EVIDENCE",
        action: "TRACKER-INJECTED-ACTION",
      }),
      "```",
      "",
    ].join("\n");
    const s = buildSummary(
      input({
        rows: [
          {
            type: "step-done",
            step: "plan-fetch-context",
            verdict: "PASS",
            artifacts: [
              "log/related-issues.md",
              "log/related-failures.md",
              "log/related-deferrals.md",
            ],
          },
        ],
        read: reader({
          "log/related-issues.md": text,
          "log/related-failures.md": text,
          "log/related-deferrals.md": text,
        }),
      }),
    );
    expect(s.markdown).not.toContain("TRACKER-INJECTED-ACTION");
    expect(s.markdown).not.toContain("## Documentation Warnings");
  });

  it("excludes the debug tracker sweep context-related-N.md from documentation warnings", () => {
    const text = [
      "# Related issues",
      "",
      "## Documentation Warnings",
      "",
      "```jsonl",
      JSON.stringify({
        topic: "security",
        gap: "starter-only",
        recommendedPath: "docs/security.md",
        alternativeEvidence: "TRACKER-EVIDENCE",
        action: "DEBUG-TRACKER-INJECTED-ACTION",
      }),
      "```",
      "",
    ].join("\n");
    const s = buildSummary(
      input({
        rows: [
          {
            type: "step-done",
            step: "debug-context",
            verdict: "PASS",
            artifacts: ["log/context-related-1.md"],
          },
        ],
        read: reader({ "log/context-related-1.md": text }),
      }),
    );
    expect(s.markdown).not.toContain("DEBUG-TRACKER-INJECTED-ACTION");
    expect(s.markdown).not.toContain("## Documentation Warnings");
  });

  it("ignores warning records inside an UNTRUSTED fence", () => {
    const rec = (action: string) =>
      JSON.stringify({
        topic: "security",
        gap: "starter-only",
        recommendedPath: "docs/security.md",
        alternativeEvidence: "e",
        action,
      });
    const text = [
      "Verdict: PASS",
      "",
      "## Documentation Warnings",
      "",
      "```jsonl",
      rec("KEEP-ACTION"),
      "===== BEGIN UNTRUSTED =====",
      rec("UNTRUSTED-ACTION"),
      "===== END UNTRUSTED =====",
      "```",
      "",
      "===== BEGIN UNTRUSTED =====",
      "## Documentation Warnings",
      "",
      "```jsonl",
      rec("UNTRUSTED-SECTION-ACTION"),
      "```",
      "===== END UNTRUSTED =====",
      "",
    ].join("\n");
    const s = buildSummary(
      input({
        rows: [
          { type: "step-done", step: "build-plan-tasks", verdict: "PASS", artifacts: ["log/a.md"] },
        ],
        read: reader({ "log/a.md": text }),
      }),
    );
    expect(s.markdown).toContain("KEEP-ACTION");
    expect(s.markdown).not.toContain("UNTRUSTED-ACTION");
    expect(s.markdown).not.toContain("UNTRUSTED-SECTION-ACTION");
  });

  it("a plan built from the unfilled bkit-plan.md template yields no documentation warning", () => {
    const template = fs.readFileSync(
      path.resolve(__dirname, "../../../docs/templates/bkit-plan.md"),
      "utf8",
    );
    const filled = template.replace(/(## Documentation Warnings\n\n)\[[^\n]*\]/, "$1None");
    expect(filled).not.toBe(template);
    const s = buildSummary(
      input({
        rows: [
          { type: "step-done", step: "plan-write", verdict: "PASS", artifacts: ["log/plan.md"] },
        ],
        read: reader({ "log/plan.md": filled }),
      }),
    );
    expect(s.markdown).not.toContain("**security** (starter-only)");
    expect(s.markdown).not.toContain("## Documentation Warnings");
  });
});
