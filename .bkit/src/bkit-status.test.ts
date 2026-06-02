import { describe, expect, it } from "vitest";

import {
  type Step,
  type StatusEvent,
  appendLine,
  fold,
  parseStatus,
  validateInvariants,
} from "./bkit-status";

describe("status invariants", () => {
  const base: Step = {
    step: "verify-plan",
    status: "DONE",
    at: "2026-04-28T07:33:00Z",
    parentSha: "a1b2c3d",
    artifacts: [],
  };

  it("PASS + failures=0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "PASS", failures: 0 }).ok).toBe(true);
  });
  it("PASS + failures>0 rejected", () => {
    expect(validateInvariants({ ...base, verdict: "PASS", failures: 3 }).ok).toBe(false);
  });
  it("FAIL + failures>0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "FAIL", failures: 3 }).ok).toBe(true);
  });
  it("FAIL + failures=0 rejected", () => {
    expect(validateInvariants({ ...base, verdict: "FAIL", failures: 0 }).ok).toBe(false);
  });
  it("CONCERNS + failures=0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "CONCERNS", failures: 0 }).ok).toBe(true);
  });
  it("CONCERNS + failures>0 valid", () => {
    expect(validateInvariants({ ...base, verdict: "CONCERNS", failures: 2 }).ok).toBe(true);
  });
  it("plumbing step (no verdict) valid", () => {
    expect(validateInvariants({ ...base, step: "start-workflow" }).ok).toBe(true);
  });
});

describe("fold — event log → run array", () => {
  it("folds a single run, step-done appends to the open run", () => {
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "design", at: "2026-05-01T00:00:00Z" },
      {
        type: "step-done",
        workflow: "design",
        step: "design-start-workflow",
        status: "DONE",
        at: "2026-05-01T00:00:01Z",
        parentSha: "aaa",
        artifacts: [],
      },
      { type: "workflow-done", workflow: "design", at: "2026-05-01T00:00:02Z" },
    ];
    const runs = fold(events);
    expect(runs).toHaveLength(1);
    expect(runs[0].workflow).toBe("design");
    expect(runs[0].status).toBe("DONE");
    expect(runs[0].steps).toHaveLength(1);
    expect(runs[0].steps[0].step).toBe("design-start-workflow");
    // routing fields stripped from the folded step
    expect((runs[0].steps[0] as Record<string, unknown>).type).toBeUndefined();
    expect((runs[0].steps[0] as Record<string, unknown>).workflow).toBeUndefined();
  });

  it("preserves multiple phase runs in one log (design → plan → build)", () => {
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "design", at: "2026-05-01T00:00:00Z" },
      { type: "workflow-done", workflow: "design", at: "2026-05-01T00:00:05Z" },
      { type: "workflow-started", workflow: "plan", at: "2026-05-02T00:00:00Z" },
      { type: "workflow-done", workflow: "plan", at: "2026-05-02T00:00:05Z" },
      { type: "workflow-started", workflow: "build", at: "2026-05-03T00:00:00Z" },
    ];
    const runs = fold(events);
    expect(runs.map((r) => r.workflow)).toEqual(["design", "plan", "build"]);
    expect(runs.map((r) => r.status)).toEqual(["DONE", "DONE", "IN_PROGRESS"]);
  });

  it("attaches step-done to the latest run of its workflow across two runs of the same phase", () => {
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "debug", at: "2026-05-01T00:00:00Z" },
      {
        type: "step-done",
        workflow: "debug",
        step: "debug-run-tests",
        status: "DONE",
        at: "2026-05-01T00:00:01Z",
        parentSha: "r1",
        artifacts: [],
      },
      { type: "workflow-failed", workflow: "debug", at: "2026-05-01T00:00:02Z" },
      { type: "workflow-started", workflow: "debug", at: "2026-05-02T00:00:00Z" },
      {
        type: "step-done",
        workflow: "debug",
        step: "debug-run-tests",
        status: "DONE",
        at: "2026-05-02T00:00:01Z",
        parentSha: "r2",
        artifacts: [],
      },
    ];
    const runs = fold(events);
    expect(runs).toHaveLength(2);
    expect(runs[0].status).toBe("FAILED");
    expect(runs[0].steps[0].parentSha).toBe("r1");
    expect(runs[1].status).toBe("IN_PROGRESS");
    expect(runs[1].steps[0].parentSha).toBe("r2");
  });

  it("de-dupes identical lines (union duplication) — keeps one", () => {
    const dup: StatusEvent = {
      type: "step-done",
      workflow: "build",
      step: "build-run-tests",
      status: "DONE",
      at: "2026-05-01T00:00:01Z",
      parentSha: "sha1",
      artifacts: [],
    };
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "build", at: "2026-05-01T00:00:00Z" },
      dup,
      { ...dup },
    ];
    const runs = fold(events);
    expect(runs[0].steps).toHaveLength(1);
  });

  it("orders interleaved (union-shuffled) lines by `at`", () => {
    const events: StatusEvent[] = [
      {
        type: "step-done",
        workflow: "build",
        step: "second",
        status: "DONE",
        at: "2026-05-01T00:00:02Z",
        parentSha: "b",
        artifacts: [],
      },
      { type: "workflow-started", workflow: "build", at: "2026-05-01T00:00:00Z" },
      {
        type: "step-done",
        workflow: "build",
        step: "first",
        status: "DONE",
        at: "2026-05-01T00:00:01Z",
        parentSha: "a",
        artifacts: [],
      },
    ];
    const runs = fold(events);
    expect(runs[0].steps.map((s) => s.step)).toEqual(["first", "second"]);
  });

  it("merges workflow-meta onto the run (debugAttempt)", () => {
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "debug", at: "2026-05-01T00:00:00Z" },
      { type: "workflow-meta", workflow: "debug", at: "2026-05-01T00:00:01Z", debugAttempt: 2 },
    ];
    const runs = fold(events);
    expect(runs[0].debugAttempt).toBe(2);
  });

  it("folded steps still pass invariant validation", () => {
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "plan", at: "2026-05-01T00:00:00Z" },
      {
        type: "step-done",
        workflow: "plan",
        step: "plan-review",
        status: "DONE",
        at: "2026-05-01T00:00:01Z",
        parentSha: "p",
        artifacts: [],
        verdict: "PASS",
        failures: 0,
      },
    ];
    const runs = fold(events);
    expect(validateInvariants(runs[0].steps[0]).ok).toBe(true);
  });
});

describe("parseStatus — coexistence at the migration boundary", () => {
  it("parses new NDJSON status.jsonl", () => {
    const raw = [
      JSON.stringify({ type: "workflow-started", workflow: "ship", at: "2026-05-01T00:00:00Z" }),
      JSON.stringify({ type: "workflow-done", workflow: "ship", at: "2026-05-01T00:00:01Z" }),
    ].join("\n");
    const runs = parseStatus(raw);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("DONE");
  });

  it("passes through a legacy status.json array unchanged", () => {
    const legacy = JSON.stringify([
      { workflow: "build", startedAt: "2026-04-01T00:00:00Z", status: "DONE", steps: [] },
    ]);
    const runs = parseStatus(legacy);
    expect(runs).toHaveLength(1);
    expect(runs[0].workflow).toBe("build");
  });

  it("empty input → empty run array", () => {
    expect(parseStatus("")).toEqual([]);
    expect(parseStatus("  \n ")).toEqual([]);
  });

  it("appendLine round-trips through parseStatus", () => {
    const e: StatusEvent = {
      type: "workflow-started",
      workflow: "design",
      at: "2026-05-01T00:00:00Z",
    };
    expect(parseStatus(appendLine(e))).toHaveLength(1);
  });
});
