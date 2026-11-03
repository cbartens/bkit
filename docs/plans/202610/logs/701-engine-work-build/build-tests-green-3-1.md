Enforced: true
Gaps: 5
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "currency matches a task on a moved symbol" | recorded 2026-10-27T12:26:32Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "currency emits no hunk outside the matched set" | recorded 2026-10-27T12:26:36Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "currency refuses a plan with no task blocks" | recorded 2026-10-27T12:26:39Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "currency exits 0 with no hunks when no task matches" | recorded 2026-10-27T12:26:43Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "currency judges base...against (origin/dev), not base...HEAD" | recorded 2026-10-27T12:26:46Z | yes | passed |

## Gaps

- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "currency matches a task on a moved symbol" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "currency emits no hunk outside the matched set" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "currency refuses a plan with no task blocks" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "currency exits 0 with no hunks when no task matches" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/tasks.test.ts` differs from its red snapshot for "currency judges base...against (origin/dev), not base...HEAD" (diff below)

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-1.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index cc6c23179..bf1402816 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -303,10 +303,7 @@ describe("bkit tasks currency", () => {
     writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
     writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
     commit(cwd, "both change");
-    const plan = write(
-      "currency-hunks.md",
-      refPlan("`alpha` in `src/matched.ts`: value changed"),
-    );
+    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
     const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
     expect(r.code).toBe(0);
     const hunks = r.json.tasks[0].hunks.join("\n");
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-2.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index cc6c23179..bf1402816 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -303,10 +303,7 @@ describe("bkit tasks currency", () => {
     writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
     writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
     commit(cwd, "both change");
-    const plan = write(
-      "currency-hunks.md",
-      refPlan("`alpha` in `src/matched.ts`: value changed"),
-    );
+    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
     const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
     expect(r.code).toBe(0);
     const hunks = r.json.tasks[0].hunks.join("\n");
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-3.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index cc6c23179..bf1402816 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -303,10 +303,7 @@ describe("bkit tasks currency", () => {
     writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
     writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
     commit(cwd, "both change");
-    const plan = write(
-      "currency-hunks.md",
-      refPlan("`alpha` in `src/matched.ts`: value changed"),
-    );
+    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
     const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
     expect(r.code).toBe(0);
     const hunks = r.json.tasks[0].hunks.join("\n");
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-4.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index cc6c23179..bf1402816 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -303,10 +303,7 @@ describe("bkit tasks currency", () => {
     writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
     writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
     commit(cwd, "both change");
-    const plan = write(
-      "currency-hunks.md",
-      refPlan("`alpha` in `src/matched.ts`: value changed"),
-    );
+    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
     const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
     expect(r.code).toBe(0);
     const hunks = r.json.tasks[0].hunks.join("\n");
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/tasks.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-5.snapshot b/.bkit/core/engine/commands/workflow/tasks.test.ts
index cc6c23179..bf1402816 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-3-4-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -303,10 +303,7 @@ describe("bkit tasks currency", () => {
     writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
     writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
     commit(cwd, "both change");
-    const plan = write(
-      "currency-hunks.md",
-      refPlan("`alpha` in `src/matched.ts`: value changed"),
-    );
+    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
     const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
     expect(r.code).toBe(0);
     const hunks = r.json.tasks[0].hunks.join("\n");
```
