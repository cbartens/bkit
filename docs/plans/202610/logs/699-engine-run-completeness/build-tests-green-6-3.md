Enforced: true
Verdict: null
Gaps: 3
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "appends the completeness row before the workflow-done row" | recorded 2026-10-29T03:07:30Z | code it runs | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "writes one completeness row per close" | recorded 2026-10-29T03:11:26Z | code it runs | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "still closes when the completeness check throws" | recorded 2026-10-29T03:15:13Z | code it runs | passed |
| 12 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "warns when the previous run for this fid was holey" | recorded 2026-10-29T03:17:22Z | code it runs | passed |
| 12 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints nothing when the previous run is clean, absent, or unreadable" | recorded 2026-10-29T03:18:11Z | test body | passed |

## Gaps

- Task 11 `test-changed` — code "appends the completeness row before the workflow-done row" runs changed since its red: `const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));`, `const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));`, `vi.mock("../../checks/status-holes", async (importOriginal) => {`, `afterEach(() => {` (diff below) — Fixable: null — log: TASK 11: `.bkit/core/engine/commands/workflow/workflows.test.ts` `appends the completeness row before the workflow-done row` — test-changed — Fixable: null
- Task 11 `test-changed` — code "writes one completeness row per close" runs changed since its red: `const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));`, `const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));`, `vi.mock("../../checks/status-holes", async (importOriginal) => {`, `afterEach(() => {` (diff below) — Fixable: null — log: TASK 11: `.bkit/core/engine/commands/workflow/workflows.test.ts` `writes one completeness row per close` — test-changed — Fixable: null
- Task 11 `test-changed` — code "still closes when the completeness check throws" runs changed since its red: `const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));`, `const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));`, `vi.mock("../../checks/status-holes", async (importOriginal) => {`, `afterEach(() => {` (diff below) — Fixable: null — log: TASK 11: `.bkit/core/engine/commands/workflow/workflows.test.ts` `still closes when the completeness check throws` — test-changed — Fixable: null

## Test exceptions

- Task 12 — honoured; cleared `test-changed` for `.bkit/core/engine/commands/workflow/workflows.test.ts` "warns when the previous run for this fid was holey", `test-changed` for `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints nothing when the previous run is clean, absent, or unreadable"

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-11-1.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..cde20f107 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-11-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -29,13 +29,15 @@ vi.mock("./worktrees", async (importOriginal) => {
   };
 });
 /** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
-const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));
+const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
 vi.mock("../../checks/status-holes", async (importOriginal) => {
   const actual = await importOriginal<typeof import("../../checks/status-holes")>();
   return {
     ...actual,
     check: (...args: Parameters<typeof actual.check>) => {
       if (holes.throwCheck) throw new Error("forced checker failure");
+      // A verdict the row write cannot serialise: the write throws, the check does not.
+      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
       return actual.check(...args);
     },
     readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
@@ -48,6 +50,7 @@ afterEach(() => {
   removing.onEnter = null;
   holes.throwCheck = false;
   holes.throwRead = false;
+  holes.unserialisable = false;
 });
 
 const dirs: string[] = [];
@@ -163,9 +166,18 @@ function linearCommentServer(): string[] {
 // ---------------------------------------------------------------------------
 
 describe("bkit workflows start", () => {
-  /** A closed build run with no steps recorded: a step hole on every required step. */
+  /** A closed build run that recorded only its close step: a step hole on every other required step. */
   const holeyBuild = [
     { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
+    {
+      type: "step-done",
+      workflow: "build",
+      step: "build-close-workflow",
+      status: "DONE",
+      at: "2020-01-01T00:59:00Z",
+      parentSha: "x",
+      artifacts: [],
+    },
     { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
   ];
   const warnings = (err: string) =>
@@ -202,9 +214,9 @@ describe("bkit workflows start", () => {
       clean,
       `${REL}/status.jsonl`,
       jsonl([
-        holeyBuild[0]!,
-        { type: "completeness", workflow: "build", at: "2020-01-01T00:30:00Z", verdict: "CLEAN" },
-        holeyBuild[1]!,
+        ...holeyBuild.slice(0, 2),
+        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
+        holeyBuild[2]!,
       ]),
     );
     const c = await run(clean, wf("start", "design"));
@@ -1082,6 +1094,18 @@ describe("bkit workflows close", () => {
     expect(lines[0]).toContain("forced checker failure");
   });
 
+  it("still closes when the completeness row write throws", async () => {
+    const cwd = closable("build");
+    holes.unserialisable = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+  });
+
   it("refuses without status.jsonl and writes nothing", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("close", "build"));
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-11-2.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..cde20f107 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-11-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -29,13 +29,15 @@ vi.mock("./worktrees", async (importOriginal) => {
   };
 });
 /** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
-const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));
+const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
 vi.mock("../../checks/status-holes", async (importOriginal) => {
   const actual = await importOriginal<typeof import("../../checks/status-holes")>();
   return {
     ...actual,
     check: (...args: Parameters<typeof actual.check>) => {
       if (holes.throwCheck) throw new Error("forced checker failure");
+      // A verdict the row write cannot serialise: the write throws, the check does not.
+      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
       return actual.check(...args);
     },
     readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
@@ -48,6 +50,7 @@ afterEach(() => {
   removing.onEnter = null;
   holes.throwCheck = false;
   holes.throwRead = false;
+  holes.unserialisable = false;
 });
 
 const dirs: string[] = [];
@@ -163,9 +166,18 @@ function linearCommentServer(): string[] {
 // ---------------------------------------------------------------------------
 
 describe("bkit workflows start", () => {
-  /** A closed build run with no steps recorded: a step hole on every required step. */
+  /** A closed build run that recorded only its close step: a step hole on every other required step. */
   const holeyBuild = [
     { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
+    {
+      type: "step-done",
+      workflow: "build",
+      step: "build-close-workflow",
+      status: "DONE",
+      at: "2020-01-01T00:59:00Z",
+      parentSha: "x",
+      artifacts: [],
+    },
     { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
   ];
   const warnings = (err: string) =>
@@ -202,9 +214,9 @@ describe("bkit workflows start", () => {
       clean,
       `${REL}/status.jsonl`,
       jsonl([
-        holeyBuild[0]!,
-        { type: "completeness", workflow: "build", at: "2020-01-01T00:30:00Z", verdict: "CLEAN" },
-        holeyBuild[1]!,
+        ...holeyBuild.slice(0, 2),
+        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
+        holeyBuild[2]!,
       ]),
     );
     const c = await run(clean, wf("start", "design"));
@@ -1082,6 +1094,18 @@ describe("bkit workflows close", () => {
     expect(lines[0]).toContain("forced checker failure");
   });
 
+  it("still closes when the completeness row write throws", async () => {
+    const cwd = closable("build");
+    holes.unserialisable = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+  });
+
   it("refuses without status.jsonl and writes nothing", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("close", "build"));
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-11-3.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..cde20f107 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-11-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -29,13 +29,15 @@ vi.mock("./worktrees", async (importOriginal) => {
   };
 });
 /** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
-const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));
+const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
 vi.mock("../../checks/status-holes", async (importOriginal) => {
   const actual = await importOriginal<typeof import("../../checks/status-holes")>();
   return {
     ...actual,
     check: (...args: Parameters<typeof actual.check>) => {
       if (holes.throwCheck) throw new Error("forced checker failure");
+      // A verdict the row write cannot serialise: the write throws, the check does not.
+      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
       return actual.check(...args);
     },
     readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
@@ -48,6 +50,7 @@ afterEach(() => {
   removing.onEnter = null;
   holes.throwCheck = false;
   holes.throwRead = false;
+  holes.unserialisable = false;
 });
 
 const dirs: string[] = [];
@@ -163,9 +166,18 @@ function linearCommentServer(): string[] {
 // ---------------------------------------------------------------------------
 
 describe("bkit workflows start", () => {
-  /** A closed build run with no steps recorded: a step hole on every required step. */
+  /** A closed build run that recorded only its close step: a step hole on every other required step. */
   const holeyBuild = [
     { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
+    {
+      type: "step-done",
+      workflow: "build",
+      step: "build-close-workflow",
+      status: "DONE",
+      at: "2020-01-01T00:59:00Z",
+      parentSha: "x",
+      artifacts: [],
+    },
     { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
   ];
   const warnings = (err: string) =>
@@ -202,9 +214,9 @@ describe("bkit workflows start", () => {
       clean,
       `${REL}/status.jsonl`,
       jsonl([
-        holeyBuild[0]!,
-        { type: "completeness", workflow: "build", at: "2020-01-01T00:30:00Z", verdict: "CLEAN" },
-        holeyBuild[1]!,
+        ...holeyBuild.slice(0, 2),
+        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
+        holeyBuild[2]!,
       ]),
     );
     const c = await run(clean, wf("start", "design"));
@@ -1082,6 +1094,18 @@ describe("bkit workflows close", () => {
     expect(lines[0]).toContain("forced checker failure");
   });
 
+  it("still closes when the completeness row write throws", async () => {
+    const cwd = closable("build");
+    holes.unserialisable = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+  });
+
   it("refuses without status.jsonl and writes nothing", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("close", "build"));
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-1.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..cde20f107 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -29,13 +29,15 @@ vi.mock("./worktrees", async (importOriginal) => {
   };
 });
 /** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
-const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));
+const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
 vi.mock("../../checks/status-holes", async (importOriginal) => {
   const actual = await importOriginal<typeof import("../../checks/status-holes")>();
   return {
     ...actual,
     check: (...args: Parameters<typeof actual.check>) => {
       if (holes.throwCheck) throw new Error("forced checker failure");
+      // A verdict the row write cannot serialise: the write throws, the check does not.
+      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
       return actual.check(...args);
     },
     readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
@@ -48,6 +50,7 @@ afterEach(() => {
   removing.onEnter = null;
   holes.throwCheck = false;
   holes.throwRead = false;
+  holes.unserialisable = false;
 });
 
 const dirs: string[] = [];
@@ -163,9 +166,18 @@ function linearCommentServer(): string[] {
 // ---------------------------------------------------------------------------
 
 describe("bkit workflows start", () => {
-  /** A closed build run with no steps recorded: a step hole on every required step. */
+  /** A closed build run that recorded only its close step: a step hole on every other required step. */
   const holeyBuild = [
     { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
+    {
+      type: "step-done",
+      workflow: "build",
+      step: "build-close-workflow",
+      status: "DONE",
+      at: "2020-01-01T00:59:00Z",
+      parentSha: "x",
+      artifacts: [],
+    },
     { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
   ];
   const warnings = (err: string) =>
@@ -202,9 +214,9 @@ describe("bkit workflows start", () => {
       clean,
       `${REL}/status.jsonl`,
       jsonl([
-        holeyBuild[0]!,
-        { type: "completeness", workflow: "build", at: "2020-01-01T00:30:00Z", verdict: "CLEAN" },
-        holeyBuild[1]!,
+        ...holeyBuild.slice(0, 2),
+        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
+        holeyBuild[2]!,
       ]),
     );
     const c = await run(clean, wf("start", "design"));
@@ -1082,6 +1094,18 @@ describe("bkit workflows close", () => {
     expect(lines[0]).toContain("forced checker failure");
   });
 
+  it("still closes when the completeness row write throws", async () => {
+    const cwd = closable("build");
+    holes.unserialisable = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+  });
+
   it("refuses without status.jsonl and writes nothing", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("close", "build"));
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-2.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..cde20f107 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -29,13 +29,15 @@ vi.mock("./worktrees", async (importOriginal) => {
   };
 });
 /** Makes the completeness checker throw when a test sets a flag; otherwise the real one. */
-const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false }));
+const holes = vi.hoisted(() => ({ throwCheck: false, throwRead: false, unserialisable: false }));
 vi.mock("../../checks/status-holes", async (importOriginal) => {
   const actual = await importOriginal<typeof import("../../checks/status-holes")>();
   return {
     ...actual,
     check: (...args: Parameters<typeof actual.check>) => {
       if (holes.throwCheck) throw new Error("forced checker failure");
+      // A verdict the row write cannot serialise: the write throws, the check does not.
+      if (holes.unserialisable) return { ...actual.check(...args), extra: 1n };
       return actual.check(...args);
     },
     readCompleteness: (...args: Parameters<typeof actual.readCompleteness>) => {
@@ -48,6 +50,7 @@ afterEach(() => {
   removing.onEnter = null;
   holes.throwCheck = false;
   holes.throwRead = false;
+  holes.unserialisable = false;
 });
 
 const dirs: string[] = [];
@@ -163,9 +166,18 @@ function linearCommentServer(): string[] {
 // ---------------------------------------------------------------------------
 
 describe("bkit workflows start", () => {
-  /** A closed build run with no steps recorded: a step hole on every required step. */
+  /** A closed build run that recorded only its close step: a step hole on every other required step. */
   const holeyBuild = [
     { type: "workflow-started", workflow: "build", at: "2020-01-01T00:00:00Z" },
+    {
+      type: "step-done",
+      workflow: "build",
+      step: "build-close-workflow",
+      status: "DONE",
+      at: "2020-01-01T00:59:00Z",
+      parentSha: "x",
+      artifacts: [],
+    },
     { type: "workflow-done", workflow: "build", at: "2020-01-01T01:00:00Z" },
   ];
   const warnings = (err: string) =>
@@ -202,9 +214,9 @@ describe("bkit workflows start", () => {
       clean,
       `${REL}/status.jsonl`,
       jsonl([
-        holeyBuild[0]!,
-        { type: "completeness", workflow: "build", at: "2020-01-01T00:30:00Z", verdict: "CLEAN" },
-        holeyBuild[1]!,
+        ...holeyBuild.slice(0, 2),
+        { type: "completeness", workflow: "build", at: "2020-01-01T01:00:00Z", verdict: "CLEAN" },
+        holeyBuild[2]!,
       ]),
     );
     const c = await run(clean, wf("start", "design"));
@@ -1082,6 +1094,18 @@ describe("bkit workflows close", () => {
     expect(lines[0]).toContain("forced checker failure");
   });
 
+  it("still closes when the completeness row write throws", async () => {
+    const cwd = closable("build");
+    holes.unserialisable = true;
+    const r = await run(cwd, wf("close", "build"));
+    expect(r.code).toBe(0);
+    const all = rows(statusOf(cwd));
+    expect(all.at(-1)).toMatchObject({ type: "workflow-done", workflow: "build" });
+    expect(all.some((x) => x.type === "completeness")).toBe(false);
+    const lines = r.err.split("\n").filter((l) => l.includes("completeness row not written"));
+    expect(lines).toHaveLength(1);
+  });
+
   it("refuses without status.jsonl and writes nothing", async () => {
     const cwd = repo();
     const r = await run(cwd, wf("close", "build"));
```
