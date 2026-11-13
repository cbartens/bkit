import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { describe, expect, it } from "vitest";

import {
  type StatusEvent,
  actionHash,
  actionKey,
  activeDoneSteps,
  alreadyDone,
  appendLine,
  fold,
  ledgerOperation,
  recordAction,
  recordLedgerOperation,
  validateCiSelection,
  ciSelectionIdentity,
  ciHandoffIdentity,
  foldCiHandoff,
  validateCiHandoffEvent,
} from "./status";
import { readStatusEvents, readStatusRows } from "../commands/workflow/status";

describe("CI evidence selection contract", () => {
  it("validates atomic CI and local selections with stable evidence identities", () => {
    const selection = {
      mode: "ci" as const,
      provider: "github" as const,
      repo: "example/example",
      runId: "123",
      runAttempt: 2,
      runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
      workflowId: "456",
      workflowPath: ".github/workflows/consumer-ci.yml",
      headBranch: "fix/ci",
      headSha: "a".repeat(40),
      conclusion: "failure" as const,
      redTiers: ["integration" as const],
      via: "prompt-run",
    };
    expect(validateCiSelection(selection)).toBe(true);
    expect(validateCiSelection({ mode: "local", reason: "explicit-local" })).toBe(true);
    expect(validateCiSelection({ ...selection, headSha: "not-a-commit" })).toBe(false);
    expect(validateCiSelection({ ...selection, runAttempt: 0 })).toBe(false);
    expect(validateCiSelection({ ...selection, runAttempt: 1.5 })).toBe(false);
    expect(validateCiSelection({ ...selection, runId: "../123" })).toBe(false);
    expect(validateCiSelection({ ...selection, repo: "../example" })).toBe(false);
    expect(validateCiSelection({ ...selection, workflowId: "" })).toBe(false);
    expect(validateCiSelection({ ...selection, workflowPath: "../../ci.yml" })).toBe(false);
    expect(validateCiSelection({ ...selection, headBranch: "" })).toBe(false);
    expect(validateCiSelection({ ...selection, headBranch: "fix/../ci" })).toBe(false);
    expect(
      validateCiSelection({
        ...selection,
        runUrl: "https://github.com/other/repo/actions/runs/123/attempts/2",
      }),
    ).toBe(false);
    expect(validateCiSelection({ ...selection, redTiers: ["unknown"] })).toBe(false);
    expect(validateCiSelection({ ...selection, conclusion: "success" })).toBe(false);
    expect(validateCiSelection({ ...selection, provider: "other" })).toBe(false);
    expect(validateCiSelection({ mode: "local", reason: "" })).toBe(false);
    const identity = ciSelectionIdentity(selection);
    expect(identity).toBe(ciSelectionIdentity({ ...selection, via: "issue-run" }));
    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, repo: "other/example" }));
    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, workflowId: "457" }));
    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, runId: "124" }));
    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, runAttempt: 3 }));
    expect(identity).not.toBe(ciSelectionIdentity({ ...selection, headSha: "b".repeat(40) }));
    expect(identity).not.toBe(ciSelectionIdentity({ mode: "local", reason: "explicit-local" }));
  });

  it("validates failedJobCount as a positive whole number outside the identity", () => {
    const selection = {
      mode: "ci" as const,
      provider: "github" as const,
      repo: "example/example",
      runId: "123",
      runAttempt: 2,
      runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
      workflowId: "456",
      workflowPath: ".github/workflows/consumer-ci.yml",
      headBranch: "fix/ci",
      headSha: "a".repeat(40),
      conclusion: "failure" as const,
      redTiers: ["integration" as const],
      via: "prompt-run",
    };
    expect(validateCiSelection(selection)).toBe(true);
    expect(validateCiSelection({ ...selection, failedJobCount: 2 })).toBe(true);
    expect(validateCiSelection({ ...selection, failedJobCount: 0 })).toBe(false);
    expect(validateCiSelection({ ...selection, failedJobCount: -1 })).toBe(false);
    expect(validateCiSelection({ ...selection, failedJobCount: 1.5 })).toBe(false);
    expect(ciSelectionIdentity({ ...selection, failedJobCount: 2 })).toBe(
      ciSelectionIdentity(selection),
    );
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

  it("fold reads an old subPlan row as its group", () => {
    const events: StatusEvent[] = [
      { type: "workflow-started", workflow: "build", at: "2026-05-01T00:00:00Z" },
      ...[1, 2].map((n): StatusEvent => ({
        type: "step-done",
        workflow: "build",
        step: "verify",
        status: "DONE",
        at: `2026-05-01T00:00:0${n}Z`,
        parentSha: "aaa",
        artifacts: [],
        subPlan: n,
      })),
      {
        type: "step-done",
        workflow: "build",
        step: "verify",
        status: "DONE",
        at: "2026-05-01T00:00:03Z",
        parentSha: "aaa",
        artifacts: [],
        group: 2,
      },
    ];
    const runs = fold(events);
    expect(activeDoneSteps(runs, "build", { step: "verify", group: 2 })).toHaveLength(2);
    expect(activeDoneSteps(runs, "build", { step: "verify", group: 1 })).toHaveLength(1);
    expect(activeDoneSteps(runs, "build", { step: "verify" })).toHaveLength(3);
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

describe("engine-action rows", () => {
  const tmpFile = () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-engine-action-"));
    return path.join(d, "logs", "status.jsonl");
  };

  it("key joins its parts with /, an absent part as -; hash is sha256 hex", () => {
    expect(actionKey("build", 2, "build-plan-verify", undefined, 1, "comment")).toBe(
      "build/2/build-plan-verify/-/1/comment",
    );
    expect(actionHash("x")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("records a row and finds it only by the same key and hash", () => {
    const file = tmpFile();
    expect(alreadyDone(file, "k", "h")).toBeUndefined();
    const row = recordAction(file, { action: "comment", key: "k", hash: "h", ref: "https://c" });
    expect(row).toMatchObject({ type: "engine-action", action: "comment", ref: "https://c" });
    expect(alreadyDone(file, "k", "h")).toEqual(row);
    expect(alreadyDone(file, "k", "h2")).toBeUndefined();
    expect(alreadyDone(file, "k2", "h")).toBeUndefined();
  });

  it("skips malformed lines", () => {
    const file = tmpFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, "not json\n");
    recordAction(file, { action: "commit", key: "k", hash: "h", ref: null });
    expect(alreadyDone(file, "k", "h")?.action).toBe("commit");
  });

  it("the fold ignores them", () => {
    const file = tmpFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      appendLine({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" }),
    );
    recordAction(file, { action: "comment", key: "k", hash: "h", ref: null });
    expect(fold(readStatusEvents(file))).toEqual([
      { workflow: "build", startedAt: "2026-10-01T00:00:00Z", status: "IN_PROGRESS", steps: [] },
    ]);
  });
});

describe("ledger operation receipts", () => {
  const tmpFile = () =>
    path.join(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledger-op-")), "logs", "status.jsonl");

  it("preserves tracker changed-hash actions while rejecting ledger operation collisions", () => {
    const file = tmpFile();

    // Tracker contract: the same key with a changed hash is a deliberate edit and acts again.
    const key = actionKey("tracker", "comment", "run-1");
    const v1 = recordAction(file, {
      action: "comment",
      key,
      hash: actionHash("v1"),
      ref: "https://c/1",
    });
    expect(alreadyDone(file, key, actionHash("v1"))).toEqual(v1);
    expect(alreadyDone(file, key, actionHash("v2"))).toBeUndefined();
    const v2 = recordAction(file, {
      action: "comment",
      key,
      hash: actionHash("v2"),
      ref: "https://c/2",
    });
    expect(alreadyDone(file, key, actionHash("v2"))).toEqual(v2);
    expect(alreadyDone(file, key, actionHash("v1"))).toEqual(v1);

    // Ledger contract: one operation id, one request hash.
    const h1 = actionHash("request-1");
    const h2 = actionHash("request-2");
    expect(ledgerOperation(file, "op-1", h1)).toEqual({ state: "new" });
    const receipt = recordLedgerOperation(file, {
      operation: "op-1",
      hash: h1,
      ref: "docs/failures.jsonl@0+120",
    });
    expect(receipt).toMatchObject({
      type: "engine-action",
      hash: h1,
      ref: "docs/failures.jsonl@0+120",
    });
    expect(ledgerOperation(file, "op-1", h1)).toEqual({ state: "replay", row: receipt });
    expect(ledgerOperation(file, "op-1", h2)).toEqual({ state: "conflict", row: receipt });
    // A new operation with the same request hash is a new effect, not a replay.
    expect(ledgerOperation(file, "op-2", h1)).toEqual({ state: "new" });

    // Recording a conflicting hash for a known operation is refused and writes nothing.
    const before = fs.readFileSync(file, "utf-8");
    expect(() => recordLedgerOperation(file, { operation: "op-1", hash: h2, ref: null })).toThrow();
    expect(fs.readFileSync(file, "utf-8")).toBe(before);

    // The generic action policy is untouched: the ledger row's own key still accepts a changed hash there.
    expect(() =>
      recordAction(file, { action: "comment", key: receipt.key, hash: h2, ref: null }),
    ).not.toThrow();

    // The fold ignores every one of these rows.
    expect(fold(readStatusEvents(file))).toEqual([]);
  });
});

describe("CI handoff events", () => {
  const SHA = "a".repeat(40);
  const NEW_SHA = "b".repeat(40);
  const OTHER_SHA = "c".repeat(40);
  const target = {
    provider: "github" as const,
    repo: "example/example",
    pr: "7",
    head: SHA,
    branch: "feat/1-x",
  };
  const handoff = (at: string, over: Record<string, unknown> = {}) => ({
    type: "ci-handoff",
    workflow: "build",
    at,
    phase: "poll",
    target,
    observation: { result: "none", attempts: 6, errors: 0 },
    ...over,
  });
  const observation = (result: string, attempts: number, errors: number) => ({
    result,
    attempts,
    errors,
  });
  const retrigger = (state: string, extra: Record<string, unknown> = {}) => ({
    state,
    original: SHA,
    ...extra,
  });
  const logFile = (rows: object[]) => {
    const file = path.join(
      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-handoff-")),
      "logs",
      "status.jsonl",
    );
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, rows.map((r) => `${JSON.stringify(r)}\n`).join(""));
    return file;
  };

  it("preserves handoff events across status folding and rejects stale CI selection", () => {
    // Every observation kind and every retrigger checkpoint is a valid event with its own identity.
    const valid = [
      handoff("2026-11-01T00:00:01Z", { observation: observation("none", 6, 0) }),
      handoff("2026-11-01T00:00:02Z", { observation: observation("pending", 3, 0) }),
      handoff("2026-11-01T00:00:03Z", { observation: observation("success", 2, 0) }),
      handoff("2026-11-01T00:00:04Z", { observation: observation("failure", 2, 0) }),
      handoff("2026-11-01T00:00:05Z", { observation: observation("provider-error", 8, 4) }),
      handoff("2026-11-01T00:00:06Z", { retrigger: retrigger("intended") }),
      handoff("2026-11-01T00:00:07Z", {
        observation: observation("pending", 8, 4),
        retrigger: retrigger("commit-created", { commit: NEW_SHA }),
      }),
      handoff("2026-11-01T00:00:08Z", {
        phase: "repoll",
        observation: observation("pending", 8, 4),
        retrigger: retrigger("push-completed", {
          commit: NEW_SHA,
          ref: "refs/heads/feat/1-x",
          remote: NEW_SHA,
        }),
      }),
      handoff("2026-11-01T00:00:09Z", {
        phase: "repoll",
        observation: observation("pending", 8, 4),
        retrigger: retrigger("receipt-completed", {
          commit: NEW_SHA,
          ref: "refs/heads/feat/1-x",
          remote: NEW_SHA,
          receipt: "retrigger-1",
        }),
      }),
    ];
    for (const event of valid) expect(validateCiHandoffEvent(event)).toBe(true);

    // Shapes that carry no usable identity or phase evidence are refused.
    const invalid: Array<Record<string, unknown>> = [
      handoff("t", { observation: observation("maybe", 1, 0) }),
      handoff("t", { observation: observation("none", -1, 0) }),
      handoff("t", { observation: observation("none", 1.5, 0) }),
      handoff("t", { observation: observation("provider-error", 1, 2) }),
      handoff("t", { target: { ...target, head: "not-a-commit" } }),
      handoff("t", { target: { ...target, repo: "../example" } }),
      handoff("t", { target: { ...target, provider: "other" } }),
      handoff("t", { phase: "later" }),
      handoff("t", { phase: "repoll" }),
      handoff("t", { retrigger: retrigger("commit-created") }),
      handoff("t", { retrigger: retrigger("push-completed", { commit: NEW_SHA }) }),
      handoff("t", {
        retrigger: retrigger("receipt-completed", { commit: NEW_SHA, remote: NEW_SHA }),
      }),
    ];
    for (const event of invalid) expect(validateCiHandoffEvent(event)).toBe(false);

    // The target identity ignores wording and tracks repo, PR, head and branch.
    const identity = ciHandoffIdentity(target);
    expect(identity).toBe(ciHandoffIdentity({ ...target, repo: "Example/Example" }));
    expect(identity).not.toBe(ciHandoffIdentity({ ...target, head: OTHER_SHA }));
    expect(identity).not.toBe(ciHandoffIdentity({ ...target, pr: "8" }));
    expect(identity).not.toBe(ciHandoffIdentity({ ...target, repo: "other/example" }));

    // Written, unioned (duplicate and shuffled), read back and folded: the identity and totals survive.
    const rows = [
      { type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" },
      valid[0],
      valid[4],
      valid[6],
      valid[8],
    ];
    const shuffled = [rows[0]!, rows[4]!, rows[2]!, rows[1]!, rows[3]!, rows[2]!];
    const file = logFile(shuffled);
    const reread = readStatusRows(file);
    const state = foldCiHandoff(reread, target);
    expect(state).toMatchObject({
      phase: "repoll",
      attempts: 8,
      errors: 4,
      stale: 0,
      last: { result: "pending" },
      retrigger: {
        state: "receipt-completed",
        original: SHA,
        commit: NEW_SHA,
        remote: NEW_SHA,
        receipt: "retrigger-1",
      },
    });
    // A restart reads the same state from the same bytes.
    expect(foldCiHandoff(readStatusRows(file), target)).toEqual(state);
    // The run fold never mistakes a handoff row for a step or a run.
    expect(fold(readStatusEvents(file))).toEqual([
      { workflow: "build", startedAt: "2026-11-01T00:00:00Z", status: "IN_PROGRESS", steps: [] },
    ]);

    // Evidence for another head, PR or repository never counts toward this target.
    const mixed = [
      valid[0],
      handoff("2026-11-01T00:01:00Z", {
        target: { ...target, head: OTHER_SHA },
        observation: observation("success", 1, 0),
      }),
      handoff("2026-11-01T00:02:00Z", {
        target: { ...target, pr: "8" },
        observation: observation("failure", 1, 0),
      }),
      handoff("2026-11-01T00:03:00Z", {
        target: { ...target, repo: "other/example" },
        observation: observation("success", 1, 0),
      }),
    ];
    expect(foldCiHandoff(mixed, target)).toMatchObject({
      attempts: 6,
      errors: 0,
      stale: 3,
      last: { result: "none" },
    });
    expect(foldCiHandoff(mixed, { ...target, head: OTHER_SHA })).toMatchObject({
      attempts: 1,
      stale: 3,
      last: { result: "success" },
    });
    // A cumulative count that goes backwards is refused, not folded.
    expect(
      foldCiHandoff(
        [valid[0], handoff("2026-11-01T00:04:00Z", { observation: observation("none", 2, 0) })],
        target,
      ),
    ).toMatchObject({ attempts: 6, invalid: 1 });
    // No events for the target is a state, not an error.
    expect(foldCiHandoff([], target)).toMatchObject({
      attempts: 0,
      errors: 0,
      last: null,
      retrigger: null,
    });

    // The failed-only debug selection stays closed to handoff observations and keeps its identity.
    const selection = {
      mode: "ci" as const,
      provider: "github" as const,
      repo: "example/example",
      runId: "123",
      runAttempt: 1,
      runUrl: "https://github.com/example/example/actions/runs/123/attempts/1",
      workflowId: "456",
      workflowPath: ".github/workflows/consumer-ci.yml",
      headBranch: "feat/1-x",
      headSha: SHA,
      conclusion: "failure" as const,
      redTiers: ["unit" as const],
      via: "prompt-run",
    };
    expect(validateCiSelection(selection)).toBe(true);
    expect(validateCiSelection({ ...selection, conclusion: "success" })).toBe(false);
    expect(validateCiSelection({ ...selection, conclusion: "pending" })).toBe(false);
    expect(validateCiSelection(valid[2])).toBe(false);
    expect(validateCiHandoffEvent(selection)).toBe(false);
    expect(ciSelectionIdentity({ ...selection, via: "issue-run" })).toBe(
      ciSelectionIdentity(selection),
    );
    // A saved selection for a different head is not the evidence this target handed off.
    expect(ciSelectionIdentity({ ...selection, headSha: OTHER_SHA })).not.toBe(
      ciSelectionIdentity(selection),
    );
    expect(ciHandoffIdentity(target)).not.toBe(ciSelectionIdentity(selection));
  });
});
