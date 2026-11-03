Enforced: true
Gaps: 2
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage keeps a low-severity deferral exempt" | recorded 2026-10-27T13:46:04Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage marks an unjustified deferral lazy" | recorded 2026-10-27T13:46:12Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage writes an unjustified row with a minted ts" | recorded 2026-10-27T13:46:17Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage ignores another feature's deferral rows" | recorded 2026-10-27T13:46:26Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage writes nothing when the FID has no deferral row" | recorded 2026-10-27T13:46:57Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage marks a scope-declared row whose only declaration is itself lazy" | recorded 2026-10-27T13:46:36Z | added lines only | passed |
| 7 | `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` "outOfScope returns the plan's Out of Scope rows" | recorded 2026-10-27T13:47:00Z | yes | passed |
| 7 | `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` "plan-blocks readers stop at the next heading of the same or a higher level" | recorded 2026-10-27T13:47:01Z | yes | passed |

## Gaps

- Task 7 `test-changed` — `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` differs from its red snapshot for "outOfScope returns the plan's Out of Scope rows" (diff below)
- Task 7 `test-changed` — `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` differs from its red snapshot for "plan-blocks readers stop at the next heading of the same or a higher level" (diff below)

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-1.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index fb686de83..8432ae98e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1304,7 +1304,6 @@ describe("bkit ledgers check", () => {
   });
 });
 
-
 describe("bkit ledgers triage", () => {
   const PLAN = [
     "# Plan",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-2.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index fb686de83..8432ae98e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1304,7 +1304,6 @@ describe("bkit ledgers check", () => {
   });
 });
 
-
 describe("bkit ledgers triage", () => {
   const PLAN = [
     "# Plan",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-3.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index fb686de83..8432ae98e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1304,7 +1304,6 @@ describe("bkit ledgers check", () => {
   });
 });
 
-
 describe("bkit ledgers triage", () => {
   const PLAN = [
     "# Plan",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-4.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index fb686de83..8432ae98e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1304,7 +1304,6 @@ describe("bkit ledgers check", () => {
   });
 });
 
-
 describe("bkit ledgers triage", () => {
   const PLAN = [
     "# Plan",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-5.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index fb686de83..8432ae98e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1304,7 +1304,6 @@ describe("bkit ledgers check", () => {
   });
 });
 
-
 describe("bkit ledgers triage", () => {
   const PLAN = [
     "# Plan",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-6.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index fb686de83..8432ae98e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-6.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -1304,7 +1304,6 @@ describe("bkit ledgers check", () => {
   });
 });
 
-
 describe("bkit ledgers triage", () => {
   const PLAN = [
     "# Plan",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/plan-blocks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-7.snapshot b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
index 3a177c557..db9fd0c54 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-7.snapshot
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
@@ -393,7 +393,11 @@ it("outOfScope returns the plan's Out of Scope rows", () => {
     {
       line: "| Design reviewers | no measurements | `docs/deferrals.jsonl` key `701-design-reviewer-audit` |",
       number: 7,
-      cells: ["Design reviewers", "no measurements", "`docs/deferrals.jsonl` key `701-design-reviewer-audit`"],
+      cells: [
+        "Design reviewers",
+        "no measurements",
+        "`docs/deferrals.jsonl` key `701-design-reviewer-audit`",
+      ],
     },
     {
       line: "| A second item | declared | stays in a prompt |",
```

## Diff since red — Task 7 `.bkit/core/engine/commands/workflow/plan-blocks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-8.snapshot b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
index 3a177c557..db9fd0c54 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-5-7-8.snapshot
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.test.ts
@@ -393,7 +393,11 @@ it("outOfScope returns the plan's Out of Scope rows", () => {
     {
       line: "| Design reviewers | no measurements | `docs/deferrals.jsonl` key `701-design-reviewer-audit` |",
       number: 7,
-      cells: ["Design reviewers", "no measurements", "`docs/deferrals.jsonl` key `701-design-reviewer-audit`"],
+      cells: [
+        "Design reviewers",
+        "no measurements",
+        "`docs/deferrals.jsonl` key `701-design-reviewer-audit`",
+      ],
     },
     {
       line: "| A second item | declared | stays in a prompt |",
```
