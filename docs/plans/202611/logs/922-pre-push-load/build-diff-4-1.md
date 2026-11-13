diff --git a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
index 6e701d8dc..862e037c7 100644
--- a/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts
@@ -1519,7 +1519,7 @@ describe(".husky/pre-push direnv", () => {
 
 describe("the gate's vitest run", () => {
   it("the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED", () => {
-    const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
+    const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };
     delete env.CI;
     delete env.GITHUB_ACTIONS;
     const result = spawnSync(
