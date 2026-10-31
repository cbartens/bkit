Enforced: true
Verdict: null
Gaps: 2
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "appends the completeness row before the workflow-done row" | recorded 2026-10-29T03:07:30Z | outside the test only | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "writes one completeness row per close" | recorded 2026-10-29T03:11:26Z | outside the test only | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "still closes when the completeness check throws" | recorded 2026-10-29T03:15:13Z | outside the test only | passed |
| 12 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "warns when the previous run for this fid was holey" | recorded 2026-10-29T03:17:22Z | code it runs | passed |
| 12 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints nothing when the previous run is clean, absent, or unreadable" | recorded 2026-10-29T03:18:11Z | test body | passed |

## Gaps

- Task 12 `test-changed` — code "warns when the previous run for this fid was holey" runs changed since its red: `/** A closed build run with no steps recorded: a step hole on every required step. */`, `/** A closed build run that recorded only its close step: a step hole on every other required step. */`, `const holeyBuild = [` (diff below) — Fixable: null — log: TASK 12: `.bkit/core/engine/commands/workflow/workflows.test.ts` `warns when the previous run for this fid was holey` — test-changed — Fixable: null
- Task 12 `test-changed` — "prints nothing when the previous run is clean, absent, or unreadable"'s own lines changed since its red (diff below) — Fixable: null — log: TASK 12: `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints nothing when the previous run is clean, absent, or unreadable` — test-changed — Fixable: null

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-1.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..f2282ed29 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -163,9 +163,18 @@ function linearCommentServer(): string[] {
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
@@ -202,9 +211,9 @@ describe("bkit workflows start", () => {
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
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-2.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 73061ff7d..f2282ed29 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-6-12-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -163,9 +163,18 @@ function linearCommentServer(): string[] {
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
@@ -202,9 +211,9 @@ describe("bkit workflows start", () => {
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
```
