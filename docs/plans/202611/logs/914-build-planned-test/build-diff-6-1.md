diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 8a21f9894..2925b22a5 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2451,6 +2451,9 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     expect(r.code).toBe(11);
     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
     expect(r.json.problem).toMatch(/refuses a BLOCKED-named change that removes a line/);
+    expect(r.json.problem).toMatch(
+      /the engine refuses a BLOCKED-named change that removes a line of a planned test/,
+    );
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
   });
 
