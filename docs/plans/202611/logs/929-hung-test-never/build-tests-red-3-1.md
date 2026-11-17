Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` "stops a child that ignores SIGTERM at the remaining time" | red | failure: expected 30007 to be less than 10000 |
| 7 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "gives a file's afterEach child call the hook timeout after a test that used most of its time" | red | failure: expected '\n RUN v5.0.5 /var/folders/td/lj74ml…' not to contain 'did not finish within' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts

[test-timeout-budget] load average 4.8 on 10 cores: unit limits 6900ms per test, 13800ms per hook (x1.38)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts (5 tests | 1 failed) 31118ms
   ❯ withChildDeadline (5)
     ✓ stops a spawnSync with no timeout at the remaining time and names it 303ms
     ✓ leaves an explicit timeout as the caller set it 202ms
     ✓ limits execSync and execFileSync the same way 603ms
     ✓ uses at least 1ms when the limit has already passed 1ms
     × stops a child that ignores SIGTERM at the remaining time 30008ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts > withChildDeadline > stops a child that ignores SIGTERM at the remaining time
AssertionError: expected 30007 to be less than 10000
 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.test.ts:76:34
     74|       message = (error as Error).message;
     75|     }
     76|     expect(Date.now() - started).toBeLessThan(10_000);
       |                                  ^
     77|     expect(message).toContain("did not finish within");
     78|     expect(message).toMatch(/\b300\s*ms/);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
   Start at  18:59:18
   Duration  31.22s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-x1x23I/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts

[test-timeout-budget] load average 3.8 on 10 cores: unit limits 6400ms per test, 12800ms per hook (x1.28)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts (2 tests | 1 failed) 10676ms
   ✓ fails a test whose spawnSync child hangs within the test's own timeout 5352ms
   × gives a file's afterEach child call the hook timeout after a test that used most of its time 5322ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts > gives a file's afterEach child call the hook timeout after a test that used most of its time
AssertionError: expected '\n RUN  v5.0.5 /var/folders/td/lj74ml…' not to contain 'did not finish within'

- Expected
+ Received

- did not finish within
+
+  RUN  v5.0.5 /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-hook-DG229X
+
+  ❯ hook.test.mjs (1 test | 1 failed) 5009ms
+    × uses most of its time 5008ms
+
+  Test Files  1 failed (1)
+       Tests  1 failed (1)
+    Start at  18:59:56
+    Duration  5.12s (tests 99%)
+
+
+ ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
+
+  FAIL  hook.test.mjs > uses most of its time
+ Error: sleep 2 did not finish within 989 ms (the running test's remaining time)
+  ❯ target.<computed> ../../../../../../Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/vitest.child-deadline.ts:60:15
+      58|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
+      59|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
+      60|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
+        |               ^
+      61|       }
+      62|       return result;
+  ❯ ../../../../../../private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-hook-DG229X/hook.test.mjs:3:12
+
+ Caused by: Error: spawnSync sleep ETIMEDOUT
+  ❯ target.<computed> ../../../../../../Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/vitest.child-deadline.ts:51:27
+  ❯ ../../../../../../private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-hook-DG229X/hook.test.mjs:3:12
+
+ ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
+ Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync sleep', path: 'sleep', spawnargs: [ '2' ] }
+ ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
+
+

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts:64:22
     62|   const output = `${run.stdout}${run.stderr}`;
     63|   expect(run.error, output).toBeUndefined();
     64|   expect(output).not.toContain("did not finish within");
       |                      ^
     65|   expect(run.status, output).toBe(0);
     66| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 1 passed (2)
   Start at  18:59:50
   Duration  10.79s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-V51BMP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
