Enforced: true
Verdict: null
Gaps: 1
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 9 | `.bkit/core/engine/commands/install/uninstall.test.ts` "strips a managed lite.md block and keeps the consumer section" | recorded 2026-10-29T01:35:30Z | test body | passed |

## Gaps

- Task 9 `test-changed` — "strips a managed lite.md block and keeps the consumer section"'s own lines changed since its red (diff below) — Fixable: null — log: TASK 9: `.bkit/core/engine/commands/install/uninstall.test.ts` `strips a managed lite.md block and keeps the consumer section` — test-changed — Fixable: null

## Diff since red — Task 9 `.bkit/core/engine/commands/install/uninstall.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-4-9-1.snapshot b/.bkit/core/engine/commands/install/uninstall.test.ts
index 81e9b847d..c56ab917e 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-4-9-1.snapshot
+++ b/.bkit/core/engine/commands/install/uninstall.test.ts
@@ -213,7 +213,10 @@ describe("buildDecisionTable — markered-text format", () => {
 
   it("strips a managed lite.md block and keeps the consumer section", async () => {
     const consumer = "## Our lite notes\n\nkeep me\n";
-    writeFile(".bkit/lite.md", `<!-- bkit:start -->\n\nretired lite payload\n\n<!-- bkit:end -->\n${consumer}`);
+    writeFile(
+      ".bkit/lite.md",
+      `<!-- bkit:start -->\n\nretired lite payload\n\n<!-- bkit:end -->\n${consumer}`,
+    );
     const table = buildDecisionTable(["core"], makeCtx());
     await runUninstall(["core"], makeCtx());
     expect(table.find((r) => r.file === ".bkit/lite.md")?.decision).toBe("strip-block");
```
