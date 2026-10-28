Enforced: true
Gaps: 1
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 18 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "triage refuses a plan with no task blocks" | recorded 2026-10-28T00:35:45Z | yes | passed |

## Gaps

- Task 18 `test-changed` — `.bkit/core/engine/commands/workflow/ledgers.test.ts` differs from its red snapshot for "triage refuses a plan with no task blocks" (diff below)

## Diff since red — Task 18 `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-10-18-1.snapshot b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 780bab63a..855a0c235 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-10-18-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -16,7 +16,7 @@ import {
   readRecord,
   writeRecord,
 } from "./ledgers";
-import { NO_MARKERS_REASON } from "./tests";
+import { NO_MARKERS_REASON } from "./plan-blocks";
 
 const dirs: string[] = [];
 afterEach(() => {
```
