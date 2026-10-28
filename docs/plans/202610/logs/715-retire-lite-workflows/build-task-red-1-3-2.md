
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/before/repo.test.ts

[test-timeout-budget] load average 11.9 on 10 cores: unit limits 5949ms per test, 11898ms per hook (x1.19)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/checks/before/repo.test.ts (27 tests | 4 failed) 68ms
   ✓ detectNoPackageJson (2)
     ✓ returns finding when package.json is absent 2ms
     ✓ returns null when package.json exists 1ms
   ✓ detectMalformedPackageJson (3)
     ✓ returns finding when package.json contains invalid JSON 1ms
     ✓ returns null when package.json is valid JSON 1ms
     ✓ returns null when package.json is absent (no-package-json fires instead) 1ms
   ✓ detectNotGitRepo (3)
     ✓ returns finding when --core requested AND .git/ absent 0ms
     ✓ returns null when --core requested AND .git/ exists 1ms
     ✓ returns null when --core NOT requested (even if .git/ absent) 1ms
   ✓ detectBkitNotOnPath (3)
     ✓ returns null in CI environment 1ms
     ✓ returns null when `bkit` is on PATH (found by which) 6ms
     ✓ returns advisory when `bkit` is not on PATH 3ms
   ✓ detectInvalidTaskCaps (2)
     ✓ returns null with no package.json, no tasks block, or valid caps 2ms
     ✓ returns an advisory naming each invalid key and the default it falls back to 2ms
   ❯ detectBuildPublish (5)
     × reports bkit-build-publish-remote for publish.remote false 7ms
     × reports bkit-build-publish-invalid for a non-boolean publish.local 2ms
     × reports bkit-build-publish-invalid for a non-object publish block 1ms
     ✓ stays quiet for a valid or absent build.publish 1ms
     × reports only the remote advisory when remote is false and local is valid 1ms
   ✓ detectTaskCapFormStale (4)
     ✓ returns null when the change form is absent 1ms
     ✓ returns null when every number the form shows matches package.json 3ms
     ✓ compares against the defaults when package.json sets no caps 2ms
     ✓ names each mismatched key, the file, and the number to write 3ms
   ✓ taskCapDefaultsNamed (1)
     ✓ pairs each key with the default after it on its line, before the next key 0ms
   ✓ detectUnmarkedPlans (4)
     ✓ returns null with no docs/plans, or when every plan has task markers 5ms
     ✓ lists each unmarked plan, sorted, and skips archive, logs and non-plan files 11ms
     ✓ skips a plan whose FID has a ship workflow-done row, and keeps one only built 3ms
     ✓ reads past malformed status lines when looking for the ship row 3ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports bkit-build-publish-remote for publish.remote false
AssertionError: expected [] to deeply equal [ 'bkit-build-publish-remote' ]

- Expected
+ Received

- [
-   "bkit-build-publish-remote",
- ]
+ []

 ❯ .bkit/core/engine/checks/before/repo.test.ts:219:36
    217|     pkg({ remote: false });
    218|     const found = detectBuildPublish(tmpDir);
    219|     expect(found.map((f) => f.id)).toEqual(["bkit-build-publish-remote…
       |                                    ^
    220|     expect(found[0]).toMatchObject({ severity: "advisory" });
    221|     expect(found[0]!.detect).toContain("`bkit.workflows.build.publish.…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports bkit-build-publish-invalid for a non-boolean publish.local
AssertionError: expected [] to deeply equal [ 'bkit-build-publish-invalid' ]

- Expected
+ Received

- [
-   "bkit-build-publish-invalid",
- ]
+ []

 ❯ .bkit/core/engine/checks/before/repo.test.ts:226:19
    224|   it("reports bkit-build-publish-invalid for a non-boolean publish.loc…
    225|     pkg({ local: "no" });
    226|     expect(ids()).toEqual(["bkit-build-publish-invalid"]);
       |                   ^
    227|   });
    228|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports bkit-build-publish-invalid for a non-object publish block
AssertionError: expected [] to deeply equal [ 'bkit-build-publish-invalid' ]

- Expected
+ Received

- [
-   "bkit-build-publish-invalid",
- ]
+ []

 ❯ .bkit/core/engine/checks/before/repo.test.ts:231:19
    229|   it("reports bkit-build-publish-invalid for a non-object publish bloc…
    230|     pkg(false);
    231|     expect(ids()).toEqual(["bkit-build-publish-invalid"]);
       |                   ^
    232|   });
    233|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports only the remote advisory when remote is false and local is valid
AssertionError: expected [] to deeply equal [ 'bkit-build-publish-remote' ]

- Expected
+ Received

- [
-   "bkit-build-publish-remote",
- ]
+ []

 ❯ .bkit/core/engine/checks/before/repo.test.ts:246:19
    244|   it("reports only the remote advisory when remote is false and local …
    245|     pkg({ remote: false, local: false });
    246|     expect(ids()).toEqual(["bkit-build-publish-remote"]);
       |                   ^
    247|   });
    248| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 23 passed (27)
   Start at  06:55:20
   Duration  410ms (transform 55%, tests 24%, setup 14%, import 6%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-06Becm/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
