Enforced: true
Verdict: PASS
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 20 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch" | recorded 2026-11-01T04:01:29Z | test body | passed |

## Gaps

None.

## Test exceptions

- Task 20 — honoured; cleared `test-changed` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "bkit-build.md: a Failure Path reached before publish is resolved never pushes the feature branch"

## Diff since red — Task 20 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-10-20-1.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 6bbd42a91..43bb6a748 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-10-20-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -343,8 +343,16 @@ describe("Failure Path", () => {
     const pushing = calls.filter((l) => l.includes("--push"));
     expect(pushing).toHaveLength(1);
     const before = failure.slice(0, failure.indexOf(pushing[0]!));
-    expect(before).not.toMatch(/not yet resolved/);
-    expect(before).toMatch(/`PUBLISH` = true/);
+    const guard = before
+      .trimEnd()
+      .split("\n")
+      .filter((l) => l.includes("**Else**"))
+      .pop()!;
+    expect(guard).not.toMatch(/not yet resolved/);
+    expect(guard).toMatch(/`PUBLISH` = true/);
+    expect(before).toMatch(
+      /`PUBLISH` = false \*\*or\*\* not yet resolved[^\n]*NEVER pass `--push`/,
+    );
   });
 
   it.each(["design", "plan", "build", "debug"])(
```
