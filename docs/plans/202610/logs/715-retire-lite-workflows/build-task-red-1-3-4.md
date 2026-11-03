
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/before/repo.test.ts

[test-timeout-budget] load average 10.8 on 10 cores: unit limits 5379ms per test, 10757ms per hook (x1.08)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

 ❯ .bkit/core/engine/checks/before/repo.test.ts (27 tests | 5 failed) 24ms
   ✓ detectNoPackageJson (2)
     ✓ returns finding when package.json is absent 1ms
     ✓ returns null when package.json exists 1ms
   ✓ detectMalformedPackageJson (3)
     ✓ returns finding when package.json contains invalid JSON 0ms
     ✓ returns null when package.json is valid JSON 0ms
     ✓ returns null when package.json is absent (no-package-json fires instead) 0ms
   ✓ detectNotGitRepo (3)
     ✓ returns finding when --core requested AND .git/ absent 0ms
     ✓ returns null when --core requested AND .git/ exists 0ms
     ✓ returns null when --core NOT requested (even if .git/ absent) 0ms
   ✓ detectBkitNotOnPath (3)
     ✓ returns null in CI environment 0ms
     ✓ returns null when `bkit` is on PATH (found by which) 3ms
     ✓ returns advisory when `bkit` is not on PATH 2ms
   ✓ detectInvalidTaskCaps (2)
     ✓ returns null with no package.json, no tasks block, or valid caps 1ms
     ✓ returns an advisory naming each invalid key and the default it falls back to 1ms
   ❯ detectBuildPublish (5)
     × reports bkit-build-publish-remote for publish.remote false 3ms
     × reports bkit-build-publish-invalid for a non-boolean publish.local 1ms
     × reports bkit-build-publish-invalid for a non-object publish block 1ms
     × stays quiet for a valid or absent build.publish 0ms
     × reports only the remote advisory when remote is false and local is valid 1ms
   ✓ detectTaskCapFormStale (4)
     ✓ returns null when the change form is absent 0ms
     ✓ returns null when every number the form shows matches package.json 1ms
     ✓ compares against the defaults when package.json sets no caps 1ms
     ✓ names each mismatched key, the file, and the number to write 1ms
   ✓ taskCapDefaultsNamed (1)
     ✓ pairs each key with the default after it on its line, before the next key 0ms
   ✓ detectUnmarkedPlans (4)
     ✓ returns null with no docs/plans, or when every plan has task markers 1ms
     ✓ lists each unmarked plan, sorted, and skips archive, logs and non-plan files 2ms
     ✓ skips a plan whose FID has a ship workflow-done row, and keeps one only built 1ms
     ✓ reads past malformed status lines when looking for the ship row 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports bkit-build-publish-remote for publish.remote false
AssertionError: expected [ 'stub' ] to deeply equal [ 'bkit-build-publish-remote' ]

- Expected
+ Received

  [
-   "bkit-build-publish-remote",
+   "stub",
  ]

 ❯ .bkit/core/engine/checks/before/repo.test.ts:219:36
    217|     pkg({ remote: false });
    218|     const found = detectBuildPublish(tmpDir);
    219|     expect(found.map((f) => f.id)).toEqual(["bkit-build-publish-remote…
       |                                    ^
    220|     expect(found[0]).toMatchObject({ severity: "advisory" });
    221|     expect(found[0]!.detect).toContain("`bkit.workflows.build.publish.…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports bkit-build-publish-invalid for a non-boolean publish.local
AssertionError: expected [ 'stub' ] to deeply equal [ 'bkit-build-publish-invalid' ]

- Expected
+ Received

  [
-   "bkit-build-publish-invalid",
+   "stub",
  ]

 ❯ .bkit/core/engine/checks/before/repo.test.ts:226:19
    224|   it("reports bkit-build-publish-invalid for a non-boolean publish.loc…
    225|     pkg({ local: "no" });
    226|     expect(ids()).toEqual(["bkit-build-publish-invalid"]);
       |                   ^
    227|   });
    228|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports bkit-build-publish-invalid for a non-object publish block
AssertionError: expected [ 'stub' ] to deeply equal [ 'bkit-build-publish-invalid' ]

- Expected
+ Received

  [
-   "bkit-build-publish-invalid",
+   "stub",
  ]

 ❯ .bkit/core/engine/checks/before/repo.test.ts:231:19
    229|   it("reports bkit-build-publish-invalid for a non-object publish bloc…
    230|     pkg(false);
    231|     expect(ids()).toEqual(["bkit-build-publish-invalid"]);
       |                   ^
    232|   });
    233|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > stays quiet for a valid or absent build.publish
AssertionError: expected [ 'stub' ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "stub",
+ ]

 ❯ .bkit/core/engine/checks/before/repo.test.ts:235:19
    233|
    234|   it("stays quiet for a valid or absent build.publish", () => {
    235|     expect(ids()).toEqual([]);
       |                   ^
    236|     fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify…
    237|     expect(ids()).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/checks/before/repo.test.ts > detectBuildPublish > reports only the remote advisory when remote is false and local is valid
AssertionError: expected [ 'stub' ] to deeply equal [ 'bkit-build-publish-remote' ]

- Expected
+ Received

  [
-   "bkit-build-publish-remote",
+   "stub",
  ]

 ❯ .bkit/core/engine/checks/before/repo.test.ts:246:19
    244|   it("reports only the remote advisory when remote is false and local …
    245|     pkg({ remote: false, local: false });
    246|     expect(ids()).toEqual(["bkit-build-publish-remote"]);
       |                   ^
    247|   });
    248| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 22 passed (27)
   Start at  06:55:33
   Duration  169ms (transform 52%, tests 21%, setup 18%, import 7%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-oBG1ZN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
