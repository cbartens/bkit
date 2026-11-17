diff --git a/.bkit/core/engine/ledgers/telemetry.test.ts b/.bkit/core/engine/ledgers/telemetry.test.ts
index 8c541ab78..4fa28041c 100644
--- a/.bkit/core/engine/ledgers/telemetry.test.ts
+++ b/.bkit/core/engine/ledgers/telemetry.test.ts
@@ -2983,7 +2983,7 @@ describe("verified model attribution", () => {
       by: subagentBy({ modelSource: "unavailable", configuredModel: "sonnet" }),
     });
     expect(validate(unavailable).ok).toBe(true);
-    expect(writerProblem(unavailable as unknown as Record<string, unknown>)).toBeUndefined();
+    expect(writerProblem({ ...unavailable })).toBeUndefined();
 
     // The configured pin is never recorded as the runtime model.
     const pinAsRuntime = knowledgeEvent("k", {
