import { describe, expect, it } from "vitest";
import { challengeResolution, taskVerified } from "./summary-findings";
import { parsePlanBlocks } from "./plan-blocks";
import type { SummaryInput } from "./summary";

const plan = `<!-- bkit:group 2 start -->
### GROUP 2: Fixes
<!-- bkit:task 3 start -->
- [x] **TASK 3:** Fix the finding.
  - **Location:** src/check.ts:10
  - **Severity:** CRITICAL
  - **Round:** 1
<!-- bkit:task 3 end -->
<!-- bkit:group 2 end -->`;
const task = { ...parsePlanBlocks(plan).groups[0]!.tasks[0]!, path: "plan.md" };
const finding = {
  type: "step-done",
  step: "build-challenge",
  verdict: "FAIL",
  round: 1,
  artifacts: ["challenge.md"],
  challengeFindings: [{ severity: "CRITICAL", location: "src/check.ts:10", title: "Defect" }],
};
const verify = {
  type: "step-done",
  step: "build-plan-verify",
  group: 2,
  verdict: "PASS",
  failures: 0,
  artifacts: ["verify.md"],
};
const input = (over: Partial<SummaryInput> = {}): SummaryInput => ({
  workflow: "build",
  fid: "summary-findings",
  rows: [finding, verify],
  plans: [{ path: "plan.md", text: plan }],
  deferrals: [],
  deferralsAdded: 0,
  decisionFiles: [],
  read: (p) => (p === "verify.md" ? "Verdict: PASS\nTasks: 3\n<!-- verdict:end -->" : null),
  ...over,
});

describe("task verification evidence", () => {
  it("requires a later passing assessment covering the completed task", () => {
    expect(taskVerified(input(), task, 0)).toBe(true);
    expect(taskVerified(input(), { ...task, done: false }, 0)).toBe(false);
    expect(taskVerified(input({ rows: [verify, finding] }), task, 1)).toBe(false);
    expect(taskVerified(input({ read: () => null }), task, 0)).toBe(false);
    expect(taskVerified(input({ read: () => "Verdict: PASS\nTasks: 30" }), task, 0)).toBe(false);
  });

  it("invalidates an earlier pass after failed verification or new execution", () => {
    for (const later of [
      { ...verify, verdict: "FAIL", failures: 1 },
      { type: "step-done", step: "build-plan-tasks", group: 2 },
      { type: "step-done", step: "build-plan-gaps-remediate", group: 2 },
    ]) {
      expect(taskVerified(input({ rows: [finding, verify, later] }), task, 0)).toBe(false);
    }
  });
});

describe("challenge resolution evidence", () => {
  it("resolves a recorded finding only through its matching verified task", () => {
    const resolved = challengeResolution(input(), finding, 0, [task]);
    expect(resolved?.failures).toEqual([]);
    expect(resolved?.resolved).toEqual([
      "build-challenge round 1: CRITICAL src/check.ts:10, resolved by build-plan-verify (group 2, task 3)",
    ]);
    expect(challengeResolution(input(), finding, 0, [])?.failures).toEqual([
      "build-challenge round 1: CRITICAL src/check.ts:10",
    ]);
    expect(
      challengeResolution(input({ read: () => null }), finding, 0, [task])?.failures,
    ).toHaveLength(1);
  });

  it("leaves malformed or missing assessment evidence unresolved", () => {
    expect(challengeResolution(input(), { ...finding, artifacts: [] }, 0, [task])).toBeUndefined();
    expect(
      challengeResolution(input(), { ...finding, challengeFindings: [{}] }, 0, [task]),
    ).toBeUndefined();
  });
});
