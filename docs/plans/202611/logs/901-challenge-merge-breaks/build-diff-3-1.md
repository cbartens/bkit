diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index daefade4a..29226b434 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -1560,6 +1560,44 @@ describe("bkit tests plan-check", () => {
     expect(r.json.problems[0].message).toContain("TASK 2");
   });
 
+  it("plan-check refuses rows left in the old column order under the template header", async () => {
+    write(
+      "plan.md",
+      matrix(
+        MATRIX,
+        ["case a", "Unit", "2", "`t1.test.ts`"],
+        ["case b", "Unit", "1", "`t2.test.ts`"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    const lines = r.json.problems
+      .filter((p: { kind: string }) => p.kind === "matrix")
+      .map((p: { line: number }) => p.line);
+    expect(lines).toContain(lineOf("plan.md", "| case a"));
+    expect(lines).toContain(lineOf("plan.md", "| case b"));
+  });
+
+  it("plan-check refuses rows with an extra cell under the template header", async () => {
+    write(
+      "plan.md",
+      matrix(
+        MATRIX,
+        ["1", "case a", "Unit", "`t1.test.ts`", "1"],
+        ["2", "case b", "Unit", "`t2.test.ts`", "2"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    const lines = r.json.problems
+      .filter((p: { kind: string }) => p.kind === "matrix")
+      .map((p: { line: number }) => p.line);
+    expect(lines).toContain(lineOf("plan.md", "| 1 | case a"));
+    expect(lines).toContain(lineOf("plan.md", "| 2 | case b"));
+  });
+
   it("plan-check refuses a task no matrix row maps to", async () => {
     write(
       "plan.md",
@@ -1632,11 +1670,13 @@ describe("bkit tests plan-check", () => {
     );
     const r = await check();
     expect(r.code).toBe(1);
-    expect(r.json.problems).toEqual([
+    expect(r.json.problems[0]).toEqual(
       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| #") }),
-    ]);
+    );
     expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
-    expect(report().match(/`matrix`/g)).toHaveLength(1);
+    const lines = r.json.problems.map((p: { line: number }) => p.line);
+    expect(lines).toContain(lineOf("plan.md", "| 1 | case a"));
+    expect(lines).toContain(lineOf("plan.md", "| 2 | case b"));
   });
 
   it("plan-check refuses a matrix header with Task not last", async () => {
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 2f58a0746..6f55e85a9 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -911,7 +911,18 @@ export function checkPlanText(text: string, caps: TaskCaps = CONFIG_DEFAULTS.tas
       const mapped = new Set<number>();
       for (const row of matrix.rows) {
         const named = row.tasks.map((n) => `TASK ${n}`);
-        if (row.tasks.length === 0)
+        const taskCell = (row.cells[matrix.taskColumn] ?? "").trim();
+        if (
+          row.cells.length !== 4 ||
+          (taskCell !== "" &&
+            !/^(?:task\s*)?\d+(?:\s*(?:,|and)\s*(?:task\s*)?\d+)*$/i.test(taskCell))
+        )
+          problems.push({
+            line: row.number,
+            kind: "matrix",
+            message: `Derived Test Matrix row must have 4 cells in the template's order, with only task numbers (\`N\` or \`TASK N\`) in its \`Task\` cell`,
+          });
+        else if (row.tasks.length === 0)
           problems.push({
             line: row.number,
             kind: "matrix",
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index d5a2a35b4..4bffb4b95 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -657,7 +657,16 @@ export function checkPlanText(text, caps = CONFIG_DEFAULTS.tasks) {
             const mapped = new Set();
             for (const row of matrix.rows) {
                 const named = row.tasks.map((n) => `TASK ${n}`);
-                if (row.tasks.length === 0)
+                const taskCell = (row.cells[matrix.taskColumn] ?? "").trim();
+                if (row.cells.length !== 4 ||
+                    (taskCell !== "" &&
+                        !/^(?:task\s*)?\d+(?:\s*(?:,|and)\s*(?:task\s*)?\d+)*$/i.test(taskCell)))
+                    problems.push({
+                        line: row.number,
+                        kind: "matrix",
+                        message: `Derived Test Matrix row must have 4 cells in the template's order, with only task numbers (\`N\` or \`TASK N\`) in its \`Task\` cell`,
+                    });
+                else if (row.tasks.length === 0)
                     problems.push({
                         line: row.number,
                         kind: "matrix",
