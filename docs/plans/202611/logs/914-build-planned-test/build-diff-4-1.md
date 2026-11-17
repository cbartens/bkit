diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index d6d960c75..eadf3820e 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -2737,6 +2737,8 @@ describe("bkit tests red / green", () => {
         },
         () => {},
       );
+    /** The red body with one setup line added before its expectation: a change that only adds. */
+    const withSetup = (n: number) => body(n).replace("  expect(", "  setup();\n  expect(");
     const provenRed = async () => {
       fs.writeFileSync(path.join(cwd, TEST), body(5));
       vi.stubEnv("FAKE_EXIT", "1");
@@ -2746,7 +2748,7 @@ describe("bkit tests red / green", () => {
 
     it("green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap", async () => {
       await provenRed();
-      fs.writeFileSync(path.join(cwd, TEST), body(6));
+      fs.writeFileSync(path.join(cwd, TEST), withSetup(5));
       codeStepRow([{ test: TEST, testName: NAME, reason: "new setup line" }]);
       vi.stubEnv("FAKE_EXIT", "0");
       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
@@ -2812,7 +2814,7 @@ describe("bkit tests red / green", () => {
       vi.stubEnv("FAKE_EXIT", "1");
       vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("third")));
       expect((await red()).code).toBe(0);
-      fs.writeFileSync(path.join(cwd, TEST), body(6));
+      fs.writeFileSync(path.join(cwd, TEST), withSetup(5));
       fs.appendFileSync(path.join(cwd, OTHER), "// setup\n");
       codeStepRow([
         { test: TEST, testName: NAME, reason: "kept" },
