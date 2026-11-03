
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/before/index.test.ts

[test-timeout-budget] load average 11.9 on 10 cores: unit limits 5949ms per test, 11898ms per hook (x1.19)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/checks/before/index.test.ts (16 tests | 1 failed) 97ms
   ❯ runPreflight (9)
     ✓ returns blockers when package.json is absent 6ms
     ✓ returns blocker malformed-package-json when JSON is invalid 4ms
     ✓ returns no blockers when package.json is valid and git repo exists 4ms
     ✓ deduplicates findings within phase when same id would appear twice 4ms
     ✓ reads the installing version from the package root when run from dist/ (no false downgrade) 51ms
     ✓ reports advisory plan-task-markers-missing for a plan with no task markers 5ms
     ✓ reports advisory bkit-tasks-form-stale when the change form shows another cap 5ms
     × collects build publish advisories into advisories 6ms
     ✓ not-git-repo does NOT fire when --core is not requested 4ms
   ✓ P3.T7 — detectHooksConfigOverwriteRisk absent (3)
     ✓ detectHooksConfigOverwriteRisk is NOT present in the checks/before/ sources 1ms
     ✓ the checks/before/ sources do not contain detectHooksConfigOverwriteRisk 1ms
     ✓ runPreflight does NOT produce hooks-config-overwrite-risk blockers (Tier-2 handles survival) 5ms
   ✓ dedupeById (4)
     ✓ keeps first occurrence when duplicate ids are present 0ms
     ✓ returns all entries unchanged when all ids are unique 0ms
     ✓ returns empty array for empty input 0ms
     ✓ keeps a single entry unchanged 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/before/index.test.ts > runPreflight > collects build publish advisories into advisories
AssertionError: expected [] to include 'bkit-build-publish-remote'
 ❯ .bkit/core/engine/checks/before/index.test.ts:137:17
    135|     const { advisories } = runPreflight(makeModules("core"), tmpDir);
    136|     const ids = advisories.map((f) => f.id);
    137|     expect(ids).toContain("bkit-build-publish-remote");
       |                 ^
    138|     expect(ids).toContain("bkit-build-publish-invalid");
    139|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 15 passed (16)
   Start at  06:55:25
   Duration  392ms (transform 50%, tests 31%, setup 10%, import 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-MIiLEL/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
