Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/929-hung-test-never-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "keeps the body's child limit on the real clock when the test sets a future system time" | red | failure: expected '\n RUN v5.0.5 /var/folders/td/lj74ml…' not to contain 'did not finish within' |
| 8 | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` "stops a hung child at the test's timeout when the test sets a past system time" | red | failure: expected 12316 to be less than 8000 |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts

[test-timeout-budget] load average 2.2 on 10 cores: unit limits 5601ms per test, 11201ms per hook (x1.12)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts (7 tests | 2 failed) 43184ms
   ✓ fails a test whose spawnSync child hangs within the test's own timeout 5339ms
   ✓ gives a file's afterEach child call the hook timeout after a test that used most of its time 6283ms
   ✓ gives an async afterEach child call the hook timeout after an await 6341ms
   ✓ does not take a slow beforeEach off the test body's child limit 7290ms
   ✓ counts the body's child limit from when the body starts, not from its first child call 5288ms
   × keeps the body's child limit on the real clock when the test sets a future system time 326ms
   × stops a hung child at the test's timeout when the test sets a past system time 12317ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts > keeps the body's child limit on the real clock when the test sets a future system time
AssertionError: expected '\n RUN  v5.0.5 /var/folders/td/lj74ml…' not to contain 'did not finish within'

- Expected
+ Received

- did not finish within
+
+  RUN  v5.0.5 /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-nested-L7CFLw
+
+  ❯ futureclock.test.mjs (1 test | 1 failed) 4ms
+    × sets a future time then runs a child 4ms
+
+  Test Files  1 failed (1)
+       Tests  1 failed (1)
+    Start at  21:58:30
+    Duration  105ms (transform 46%, setup 39%, tests 8%, worker 5%, import 2%)
+
+
+ ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
+
+  FAIL  futureclock.test.mjs > sets a future time then runs a child
+ Error: true did not finish within 1 ms (the running test's remaining time)
+  ❯ target.<computed> ../../../../../../Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/vitest.child-deadline.ts:64:15
+      62|       const err = (result as { error?: NodeJS.ErrnoException } | undef…
+      63|       if (name === "spawnSync" && err?.code === "ETIMEDOUT") {
+      64|         throw new Error(describeCall(callArgs[0], args, limitMs), { ca…
+        |               ^
+      65|       }
+      66|       return result;
+  ❯ ../../../../../../private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-nested-L7CFLw/futureclock.test.mjs:6:19
+
+ Caused by: Error: spawnSync true ETIMEDOUT
+  ❯ target.<computed> ../../../../../../Users/christian/Documents/GitHub/bkit/.worktrees/929-hung-test-never/vitest.child-deadline.ts:55:27
+  ❯ ../../../../../../private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-child-deadline-nested-L7CFLw/futureclock.test.mjs:6:19
+
+ ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
+ Serialized Error: { errno: -60, code: 'ETIMEDOUT', syscall: 'spawnSync true', path: 'true', spawnargs: [] }
+ ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯
+
+

 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts:130:22
    128|   );
    129|   expect(run.error, output).toBeUndefined();
    130|   expect(output).not.toContain("did not finish within");
       |                      ^
    131|   expect(run.status, output).toBe(0);
    132| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts > stops a hung child at the test's timeout when the test sets a past system time
AssertionError: expected 12316 to be less than 8000
 ❯ .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts:143:32
    141|   );
    142|   expect(run.error, output).toBeUndefined();
    143|   expect(Date.now() - started).toBeLessThan(5000 + 3000);
       |                                ^
    144|   expect(run.status).not.toBe(0);
    145| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 5 passed (7)
   Start at  21:57:59
   Duration  43.28s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-y2VE6s/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
