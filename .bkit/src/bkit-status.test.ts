import { describe, expect, it } from "vitest";

import { type StatusEvent, appendLine, fold } from "./bkit-status";

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
});

describe("appendLine", () => {
  it("serializes one event as a newline-terminated JSON line", () => {
    const e: StatusEvent = {
      type: "workflow-started",
      workflow: "design",
      at: "2026-05-01T00:00:00Z",
    };
    expect(appendLine(e)).toBe(`${JSON.stringify(e)}\n`);
  });
});
