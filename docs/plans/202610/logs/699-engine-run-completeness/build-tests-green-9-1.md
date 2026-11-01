Enforced: true
Verdict: null
Gaps: 1
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 18 | `.bkit/core/engine/checks/status-holes.test.ts` "calls outside the journal window are matched but never required" | recorded 2026-10-29T07:10:48Z | outside the test only | passed |
| 19 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints one telemetry line on stderr when the journal looks dead at close" | recorded 2026-10-29T07:13:31Z | test body | passed |

## Gaps

- Task 19 `test-changed` — "prints one telemetry line on stderr when the journal looks dead at close"'s own lines changed since its red (diff below) — Fixable: null — log: TASK 19: `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints one telemetry line on stderr when the journal looks dead at close` — test-changed — Fixable: null

## Late-red check

- Task 18 — not checked: no plan-execute step commit's log records `DONE — TASK 18`, so when its code landed is unknown
- Task 19 — not checked: no plan-execute step commit's log records `DONE — TASK 19`, so when its code landed is unknown

## Diff since red — Task 19 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-9-19-1.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index b6ed4fc16..8865a9dbc 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-9-19-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1072,7 +1072,7 @@ describe("bkit workflows close", () => {
     expect(r.code).toBe(0);
     const lines = r.err.split("\n").filter((l) => l.includes("journal looks dead"));
     expect(lines).toHaveLength(1);
-    expect(lines[0]).toMatch(/^\[bkit-telemetry\] journal looks dead at close/);
+    expect(lines[0]).toContain("[bkit-telemetry] journal looks dead at close");
     // stdout is still the one output object, with no journal field.
     expect(JSON.stringify(r.json)).not.toContain("journal looks dead");
     expect(r.json).not.toHaveProperty("journalSuspect");
```
