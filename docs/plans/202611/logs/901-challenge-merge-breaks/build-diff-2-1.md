diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 762aad67c..daefade4a 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -1677,6 +1677,23 @@ describe("bkit tests plan-check", () => {
     expect(report().match(/`matrix`/g)).toHaveLength(1);
   });
 
+  it("plan-check refuses a matrix header with no closing pipe", async () => {
+    const lines = matrix(
+      MATRIX,
+      ["case a", "Unit", "`t0.test.ts`", "1"],
+      ["case b", "Unit", "`t1.test.ts`", "2"],
+    ).split("\n");
+    const head = lines.findIndex((l) => l.startsWith("| Test description"));
+    lines[head] = lines[head].replace(/ \|$/, "");
+    write("plan.md", lines.join("\n"), groupBlock(1, okTask(1), okTask(2)));
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
+    ]);
+    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
+  });
+
   it("plan-check accepts the template matrix header in any letter case", async () => {
     write(
       "plan.md",
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index e9051d4c5..2f58a0746 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -897,9 +897,8 @@ export function checkPlanText(text: string, caps: TaskCaps = CONFIG_DEFAULTS.tas
   if (matrix !== null) {
     const expected = "Test description | Type | Target file | Task";
     const header = (matrix.head[0] ?? "")
-      .trim()
-      .replace(/^\||\|$/g, "")
       .split("|")
+      .slice(1, -1)
       .map((c) => c.trim().toLowerCase())
       .join(" | ");
     if (header !== expected.toLowerCase())
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index ef8a4010a..d5a2a35b4 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -643,9 +643,8 @@ export function checkPlanText(text, caps = CONFIG_DEFAULTS.tasks) {
     if (matrix !== null) {
         const expected = "Test description | Type | Target file | Task";
         const header = (matrix.head[0] ?? "")
-            .trim()
-            .replace(/^\||\|$/g, "")
             .split("|")
+            .slice(1, -1)
             .map((c) => c.trim().toLowerCase())
             .join(" | ");
         if (header !== expected.toLowerCase())
