Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 1

Plan: `docs/plans/202611/921-tests-lock-default-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "with slots unset on 10 cores, the global setup waits for a held tests lock" | red | failure: expected true to be false // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default

[machine-lock] ⏳ vitest all is waiting for tests (up to 5s), 1st in line: in use by wrapped gate holder — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 65136, since 22:46:33), no earlier run
[machine-lock] ❌ vitest all gave up after 0s waiting for tests, in use by wrapped gate holder — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 65340, since 22:46:33), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.
 ❯ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts (4 tests | 1 failed) 1184ms
   ❯ raw Vitest global setup against wrapped gates (4)
     ✓ the global setup waits for a held tests lock and takes it once the holder ends 416ms
     × with slots unset on 10 cores, the global setup waits for a held tests lock 444ms
     ✓ the global setup throws naming the holder when the wait gives up 162ms
     ✓ the global setup's teardown frees the tests lock 162ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts > raw Vitest global setup against wrapped gates > with slots unset on 10 cores, the global setup waits for a held tests lock
AssertionError: expected true to be false // Object.is equality

- Expected
+ Received

- false
+ true

 ❯ .bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts:169:30
    167|     const acquired = await pending;
    168|     teardown = acquired.value;
    169|     expect(settledWhileHeld).toBe(false);
       |                              ^
    170|     expect(acquired.error).toBeNull();
    171|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 3 passed (4)
   Start at  22:46:32
   Duration  1.26s (tests 98%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5NAbNd/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
