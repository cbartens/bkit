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
| 1 | `.bkit/core/engine/shared/settings.test.ts` "defaults build.publish to true" | recorded 2026-10-28T20:54:26Z | no | passed |
| 1 | `.bkit/core/engine/shared/settings.test.ts` "reads an explicit publish.local false" | recorded 2026-10-28T20:54:27Z | no | passed |
| 1 | `.bkit/core/engine/shared/settings.test.ts` "coerces publish.remote false to true" | recorded 2026-10-28T20:54:27Z | no | passed |
| 1 | `.bkit/core/engine/shared/settings.test.ts` "lists every invalid build.publish key" | recorded 2026-10-28T20:54:28Z | no | passed |
| 1 | `.bkit/core/engine/shared/settings.test.ts` "reports a non-object publish block" | recorded 2026-10-28T20:54:28Z | no | passed |
| 2 | `.bkit/core/engine/commands/workflow/repo.test.ts` "prints buildPublishRemote and buildPublishLocal" | recorded 2026-10-28T20:54:52Z | no | passed |
| 2 | `.bkit/core/engine/commands/workflow/repo.test.ts` "prints the publish defaults when package.json omits them" | recorded 2026-10-28T20:55:18Z | no | passed |
| 3 | `.bkit/core/engine/checks/before/repo.test.ts` "reports bkit-build-publish-remote for publish.remote false" | recorded 2026-10-28T20:55:20Z | no | passed |
| 3 | `.bkit/core/engine/checks/before/repo.test.ts` "reports bkit-build-publish-invalid for a non-boolean publish.local" | recorded 2026-10-28T20:55:21Z | no | passed |
| 3 | `.bkit/core/engine/checks/before/repo.test.ts` "reports bkit-build-publish-invalid for a non-object publish block" | recorded 2026-10-28T20:55:22Z | no | passed |
| 3 | `.bkit/core/engine/checks/before/repo.test.ts` "stays quiet for a valid or absent build.publish" | recorded 2026-10-28T20:55:33Z | no | passed |
| 3 | `.bkit/core/engine/checks/before/repo.test.ts` "reports only the remote advisory when remote is false and local is valid" | recorded 2026-10-28T20:55:24Z | no | passed |
| 3 | `.bkit/core/engine/checks/before/index.test.ts` "collects build publish advisories into advisories" | recorded 2026-10-28T20:55:25Z | yes | passed |

## Gaps

- Task 3 `test-changed` — `.bkit/core/engine/checks/before/index.test.ts` differs from its red snapshot for "collects build publish advisories into advisories" (diff below) — Fixable: null — log: TASK 3: `.bkit/core/engine/checks/before/index.test.ts` `collects build publish advisories into advisories` — test-changed — Fixable: null

## Diff since red — Task 3 `.bkit/core/engine/checks/before/index.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-1-3-6.snapshot b/.bkit/core/engine/checks/before/index.test.ts
index 1fa13a0c1..1177dc329 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-1-3-6.snapshot
+++ b/.bkit/core/engine/checks/before/index.test.ts
@@ -129,7 +129,9 @@ describe("runPreflight", () => {
   it("collects build publish advisories into advisories", () => {
     fs.writeFileSync(
       path.join(tmpDir, "package.json"),
-      JSON.stringify({ bkit: { workflows: { build: { publish: { remote: false, local: "x" } } } } }),
+      JSON.stringify({
+        bkit: { workflows: { build: { publish: { remote: false, local: "x" } } } },
+      }),
       "utf-8",
     );
     const { advisories } = runPreflight(makeModules("core"), tmpDir);
```
