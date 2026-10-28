Enforced: true
Gaps: 13
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses an unmapped matrix row" | recorded 2026-10-27T12:47:59Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a delete with no supersession row" | recorded 2026-10-27T12:48:11Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix row mapped to two tasks" | recorded 2026-10-27T12:48:19Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a task no matrix row maps to" | recorded 2026-10-27T12:48:28Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check accepts a matrix that maps every test-bearing task" | recorded 2026-10-27T12:49:36Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with no Task column, naming the column to add" | recorded 2026-10-27T12:48:45Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a Task cell naming an undefined task" | recorded 2026-10-27T12:48:53Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check accepts a task whose only TEST FIRST is n/a" | recorded 2026-10-27T12:49:45Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/challenge.test.ts` "challenge merge writes a matrix row for each appended finding task" | recorded 2026-10-27T12:49:52Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` "derivedTestMatrix returns a null column index when the header has no Task column" | recorded 2026-10-27T12:50:09Z | no | passed |
| 6 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff finds an added skip" | recorded 2026-10-27T13:09:46Z | yes | passed |
| 6 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff ignores a skip predating the base" | recorded 2026-10-27T13:10:26Z | yes | passed |
| 6 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff reports a disabled test with its line" | recorded 2026-10-27T13:11:05Z | yes | passed |
| 6 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff exits 0 on a diff that adds no disabled test" | recorded 2026-10-27T13:11:46Z | yes | passed |

## Gaps

- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check refuses an unmapped matrix row" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check refuses a delete with no supersession row" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check refuses a matrix row mapped to two tasks" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check refuses a task no matrix row maps to" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check accepts a matrix that maps every test-bearing task" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check refuses a matrix header with no Task column, naming the column to add" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check refuses a Task cell naming an undefined task" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "plan-check accepts a task whose only TEST FIRST is n/a" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/challenge.test.ts` differs from its red snapshot for "challenge merge writes a matrix row for each appended finding task" (diff below)
- Task 6 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "scan-diff finds an added skip" (diff below)
- Task 6 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "scan-diff ignores a skip predating the base" (diff below)
- Task 6 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "scan-diff reports a disabled test with its line" (diff below)
- Task 6 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "scan-diff exits 0 on a diff that adds no disabled test" (diff below)

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-1.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index a52033aae..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
@@ -1189,6 +1204,14 @@ describe("bkit tests plan-check", () => {
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
@@ -1235,12 +1258,23 @@ describe("bkit tests plan-check", () => {
       groupBlock(
         1,
         okTask(1),
-        taskBlock(2, ["  - **DONE WHEN:** the docs are updated", "  - **TEST FIRST:** n/a — docs only"]),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
       ),
     );
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a group with 4 tasks", async () => {
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-2.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index a52033aae..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
@@ -1189,6 +1204,14 @@ describe("bkit tests plan-check", () => {
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
@@ -1235,12 +1258,23 @@ describe("bkit tests plan-check", () => {
       groupBlock(
         1,
         okTask(1),
-        taskBlock(2, ["  - **DONE WHEN:** the docs are updated", "  - **TEST FIRST:** n/a — docs only"]),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
       ),
     );
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a group with 4 tasks", async () => {
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-3.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index a52033aae..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
@@ -1189,6 +1204,14 @@ describe("bkit tests plan-check", () => {
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
@@ -1235,12 +1258,23 @@ describe("bkit tests plan-check", () => {
       groupBlock(
         1,
         okTask(1),
-        taskBlock(2, ["  - **DONE WHEN:** the docs are updated", "  - **TEST FIRST:** n/a — docs only"]),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
       ),
     );
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a group with 4 tasks", async () => {
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-4.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index a52033aae..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
@@ -1189,6 +1204,14 @@ describe("bkit tests plan-check", () => {
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
@@ -1235,12 +1258,23 @@ describe("bkit tests plan-check", () => {
       groupBlock(
         1,
         okTask(1),
-        taskBlock(2, ["  - **DONE WHEN:** the docs are updated", "  - **TEST FIRST:** n/a — docs only"]),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
       ),
     );
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a group with 4 tasks", async () => {
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-5.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 4c4922dca..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-6.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index a52033aae..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-6.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
@@ -1189,6 +1204,14 @@ describe("bkit tests plan-check", () => {
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
@@ -1235,12 +1258,23 @@ describe("bkit tests plan-check", () => {
       groupBlock(
         1,
         okTask(1),
-        taskBlock(2, ["  - **DONE WHEN:** the docs are updated", "  - **TEST FIRST:** n/a — docs only"]),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
       ),
     );
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a group with 4 tasks", async () => {
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-7.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index a52033aae..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-7.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
@@ -1189,6 +1204,14 @@ describe("bkit tests plan-check", () => {
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
@@ -1235,12 +1258,23 @@ describe("bkit tests plan-check", () => {
       groupBlock(
         1,
         okTask(1),
-        taskBlock(2, ["  - **DONE WHEN:** the docs are updated", "  - **TEST FIRST:** n/a — docs only"]),
+        taskBlock(2, [
+          "  - **DONE WHEN:** the docs are updated",
+          "  - **TEST FIRST:** n/a — docs only",
+        ]),
       ),
     );
     const r = await check();
     expect(r.code).toBe(0);
     expect(r.json.problems).toEqual([]);
+    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
+    write(
+      "plan.md",
+      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const missing = await check();
+    expect(missing.code).toBe(1);
   });
 
   it("plan-check refuses a group with 4 tasks", async () => {
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-8.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 4c4922dca..c593b082e 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-8.snapshot
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -672,9 +672,14 @@ function fencedText(md: string): string {
     .join("\n");
 }
 
-/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
+/**
+ * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
+ * Supersession Inventory row per DELETE file, then the blocks.
+ */
 function asPlan(blocks: string): string {
-  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
+  const parsed = parsePlanBlocks(blocks).tasks;
+  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
+  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
   return [
     "# Plan",
     "",
@@ -683,6 +688,16 @@ function asPlan(blocks: string): string {
     "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
     "| --- | --- | --- | --- | --- | --- |",
     ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
+    ...(removed.length === 0
+      ? []
+      : [
+          "",
+          "## Supersession Inventory",
+          "",
+          "| Existing artifact | Replaced by | Decision | Justification |",
+          "| --- | --- | --- | --- |",
+          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
+        ]),
     "",
     blocks,
   ].join("\n");
@@ -1170,7 +1185,7 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems).toEqual([
       expect.objectContaining({
         kind: "matrix",
-        line: lineOf("plan.md", "**TASK 2:**"),
+        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
       }),
     ]);
     expect(r.json.problems[0].message).toContain("TASK 2");
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/challenge.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-9.snapshot b/.bkit/core/engine/commands/workflow/challenge.test.ts
index 59a46af23..fc66bd389 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-5-9.snapshot
+++ b/.bkit/core/engine/commands/workflow/challenge.test.ts
@@ -263,15 +263,12 @@ describe("bkit challenge merge", () => {
         "",
       ].join("\n"),
     );
-    write(
-      R1,
-      report({ sev: "HIGH", loc: "src/a.ts:10" }, { sev: "MEDIUM", loc: "src/b.ts:4" }),
-    );
+    write(R1, report({ sev: "HIGH", loc: "src/a.ts:10" }, { sev: "MEDIUM", loc: "src/b.ts:4" }));
     const r = await merge(...args([R1]));
     expect(r.code).toBe(0);
     expect(r.json.fixTasks).toBe("3,4");
     const merged = read(PLAN);
-    expect(derivedTestMatrix(merged)?.rows.map((row) => row.tasks)).toEqual([[3], [4]]);
+    expect(derivedTestMatrix(merged)?.rows.map((row) => row.tasks)).toEqual([[1], [2], [3], [4]]);
     expect(checkPlanText(merged).problems).toEqual([]);
   });
```

## Diff since red — Task 6 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-1.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 9d49c34b0..b4db59629 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1560,45 +1560,39 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/y.ts"] });
   });
 
+  // The fixture's skip marker is spelled in two pieces, as the slop plugin spells its own
+  // patterns: this file then carries no skip marker of its own for the scanner to find.
+  const SKIP = `${"it"}.${"skip"}`;
+  /** A test file: one passing test, then `extra` lines after it. */
+  const testFile = (...extra: string[]) =>
+    ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ...extra, ""].join("\n");
+
   it("scan-diff finds an added skip", async () => {
     const { clone } = featureBranch("scan-disabled");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      { "src/a.test.ts": "it.skip('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
   });
 
   it("scan-diff ignores a skip predating the base", async () => {
     const { clone } = featureBranch("scan-disabled-old");
-    commit(clone, { "src/a.test.ts": "it.skip('keeps a', () => {});\n" }, "skip");
-    commit(clone, { "src/b.ts": "b\n" }, "other");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
+    write(clone, "src/b.ts", "b\n");
+    commit(clone, {}, "other");
     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
     expect(r.code).toBe(0);
   });
 
   it("scan-diff reports a disabled test with its line", async () => {
     const { clone } = featureBranch("scan-disabled-line");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      {
-        "src/a.test.ts":
-          "it('keeps a', () => {\n  expect(1).toBe(1);\n});\nit.skip('drops b', () => {});\n",
-      },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('drops b', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4, test: "drops b" }]);
@@ -1606,11 +1600,8 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
 
   it("scan-diff exits 0 on a diff that adds no disabled test", async () => {
     const { clone } = featureBranch("scan-disabled-none");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(0);
     expect(r.json?.disabled).toEqual([]);
```

## Diff since red — Task 6 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-2.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 9d49c34b0..b4db59629 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1560,45 +1560,39 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/y.ts"] });
   });
 
+  // The fixture's skip marker is spelled in two pieces, as the slop plugin spells its own
+  // patterns: this file then carries no skip marker of its own for the scanner to find.
+  const SKIP = `${"it"}.${"skip"}`;
+  /** A test file: one passing test, then `extra` lines after it. */
+  const testFile = (...extra: string[]) =>
+    ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ...extra, ""].join("\n");
+
   it("scan-diff finds an added skip", async () => {
     const { clone } = featureBranch("scan-disabled");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      { "src/a.test.ts": "it.skip('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
   });
 
   it("scan-diff ignores a skip predating the base", async () => {
     const { clone } = featureBranch("scan-disabled-old");
-    commit(clone, { "src/a.test.ts": "it.skip('keeps a', () => {});\n" }, "skip");
-    commit(clone, { "src/b.ts": "b\n" }, "other");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
+    write(clone, "src/b.ts", "b\n");
+    commit(clone, {}, "other");
     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
     expect(r.code).toBe(0);
   });
 
   it("scan-diff reports a disabled test with its line", async () => {
     const { clone } = featureBranch("scan-disabled-line");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      {
-        "src/a.test.ts":
-          "it('keeps a', () => {\n  expect(1).toBe(1);\n});\nit.skip('drops b', () => {});\n",
-      },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('drops b', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4, test: "drops b" }]);
@@ -1606,11 +1600,8 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
 
   it("scan-diff exits 0 on a diff that adds no disabled test", async () => {
     const { clone } = featureBranch("scan-disabled-none");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(0);
     expect(r.json?.disabled).toEqual([]);
```

## Diff since red — Task 6 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-3.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 9d49c34b0..b4db59629 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1560,45 +1560,39 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/y.ts"] });
   });
 
+  // The fixture's skip marker is spelled in two pieces, as the slop plugin spells its own
+  // patterns: this file then carries no skip marker of its own for the scanner to find.
+  const SKIP = `${"it"}.${"skip"}`;
+  /** A test file: one passing test, then `extra` lines after it. */
+  const testFile = (...extra: string[]) =>
+    ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ...extra, ""].join("\n");
+
   it("scan-diff finds an added skip", async () => {
     const { clone } = featureBranch("scan-disabled");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      { "src/a.test.ts": "it.skip('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
   });
 
   it("scan-diff ignores a skip predating the base", async () => {
     const { clone } = featureBranch("scan-disabled-old");
-    commit(clone, { "src/a.test.ts": "it.skip('keeps a', () => {});\n" }, "skip");
-    commit(clone, { "src/b.ts": "b\n" }, "other");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
+    write(clone, "src/b.ts", "b\n");
+    commit(clone, {}, "other");
     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
     expect(r.code).toBe(0);
   });
 
   it("scan-diff reports a disabled test with its line", async () => {
     const { clone } = featureBranch("scan-disabled-line");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      {
-        "src/a.test.ts":
-          "it('keeps a', () => {\n  expect(1).toBe(1);\n});\nit.skip('drops b', () => {});\n",
-      },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('drops b', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4, test: "drops b" }]);
@@ -1606,11 +1600,8 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
 
   it("scan-diff exits 0 on a diff that adds no disabled test", async () => {
     const { clone } = featureBranch("scan-disabled-none");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(0);
     expect(r.json?.disabled).toEqual([]);
```

## Diff since red — Task 6 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-4.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 9d49c34b0..b4db59629 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-4-6-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -1560,45 +1560,39 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
     expect(r.json).toEqual({ found: true, paths: ["src/y.ts"] });
   });
 
+  // The fixture's skip marker is spelled in two pieces, as the slop plugin spells its own
+  // patterns: this file then carries no skip marker of its own for the scanner to find.
+  const SKIP = `${"it"}.${"skip"}`;
+  /** A test file: one passing test, then `extra` lines after it. */
+  const testFile = (...extra: string[]) =>
+    ["it('keeps a', () => {", "  expect(1).toBe(1);", "});", ...extra, ""].join("\n");
+
   it("scan-diff finds an added skip", async () => {
     const { clone } = featureBranch("scan-disabled");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      { "src/a.test.ts": "it.skip('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
   });
 
   it("scan-diff ignores a skip predating the base", async () => {
     const { clone } = featureBranch("scan-disabled-old");
-    commit(clone, { "src/a.test.ts": "it.skip('keeps a', () => {});\n" }, "skip");
-    commit(clone, { "src/b.ts": "b\n" }, "other");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('keeps a', () => {});`));
+    commit(clone, {}, "skip");
+    write(clone, "src/b.ts", "b\n");
+    commit(clone, {}, "other");
     const r = await run(clone, ["scan-diff", "--base=HEAD~1", "--disabled-tests"]);
     expect(r.code).toBe(0);
   });
 
   it("scan-diff reports a disabled test with its line", async () => {
     const { clone } = featureBranch("scan-disabled-line");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
-    commit(
-      clone,
-      {
-        "src/a.test.ts":
-          "it('keeps a', () => {\n  expect(1).toBe(1);\n});\nit.skip('drops b', () => {});\n",
-      },
-      "skip",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
+    write(clone, "src/a.test.ts", testFile(`${SKIP}('drops b', () => {});`));
+    commit(clone, {}, "skip");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(1);
     expect(r.json?.disabled).toEqual([{ file: "src/a.test.ts", line: 4, test: "drops b" }]);
@@ -1606,11 +1600,8 @@ describe("branches scan-diff", { timeout: GIT_TIMEOUT }, () => {
 
   it("scan-diff exits 0 on a diff that adds no disabled test", async () => {
     const { clone } = featureBranch("scan-disabled-none");
-    commit(
-      clone,
-      { "src/a.test.ts": "it('keeps a', () => {\n  expect(1).toBe(1);\n});\n" },
-      "test",
-    );
+    write(clone, "src/a.test.ts", testFile());
+    commit(clone, {}, "test");
     const r = await run(clone, ["scan-diff", "--base=origin/dev", "--disabled-tests"]);
     expect(r.code).toBe(0);
     expect(r.json?.disabled).toEqual([]);
```
