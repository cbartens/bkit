Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 3, attempt 1

Plan: `docs/plans/202611/814-local-test-limits-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` "a file-level localLimit stays at the CI value under CI=1" | red | failure: RUN v5.1.0 /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-budget-ci-i4TxzZ ❯ limit.test.mjs (1 test \| 1 failed) 8ms × reads the CI value at module level 6ms Test Files 1 failed (1) Tests 1 failed (1) Start at 17:01:13 Duration 272ms (transform 48%, setup 37%, tests 7%, worker 7%, import 2%) ⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯ FAIL limit.test.mjs > reads the CI value at module level AssertionError: expected 360000 to be 60000 // Object.is equality - Expected + Received - 60000 + 360000 ❯ ../../../../../../private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-budget-ci-i4TxzZ/limit.test.mjs:5:21 3\| const tier = tierTimeouts(true); 4\| it("reads the CI value at module level", () => { 5\| expect(fileLimit).toBe(60000); \| ^ 6\| expect(tier.testTimeout).toBe(30000); 7\| }); ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯ : expected 1 to be +0 // Object.is equality |
| 7 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "CONTROL — a test limit set through a named numeric constant is caught" | vacuous | "CONTROL — a test limit set through a named numeric constant is caught" passes at its red, so it proves nothing |
| 7 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "no test file sets a numeric test limit through a named constant" | red | failure: expected [ Array(1) ] to deeply equal [] |

## Gaps

- TASK 7 `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "CONTROL — a test limit set through a named numeric constant is caught" `vacuous` — "CONTROL — a test limit set through a named numeric constant is caught" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts (1 test | 1 failed) 835ms
   × a file-level localLimit stays at the CI value under CI=1 834ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts > a file-level localLimit stays at the CI value under CI=1
AssertionError: 
 RUN  v5.1.0 /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-budget-ci-i4TxzZ

 ❯ limit.test.mjs (1 test | 1 failed) 8ms
   × reads the CI value at module level 6ms

 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  17:01:13
   Duration  272ms (transform 48%, setup 37%, tests 7%, worker 7%, import 2%)


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  limit.test.mjs > reads the CI value at module level
AssertionError: expected 360000 to be 60000 // Object.is equality

- Expected
+ Received

- 60000
+ 360000

 ❯ ../../../../../../private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-budget-ci-i4TxzZ/limit.test.mjs:5:21
      3| const tier = tierTimeouts(true);
      4| it("reads the CI value at module level", () => {
      5|   expect(fileLimit).toBe(60000);
       |                     ^
      6|   expect(tier.testTimeout).toBe(30000);
      7| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts:39:30
     37|   const output = `${run.stdout}${run.stderr}`;
     38|   expect(run.error, output).toBeUndefined();
     39|   expect(run.status, output).toBe(0);
       |                              ^
     40| });
     41|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  17:01:13
   Duration  1.03s (tests 95%, setup 4%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-7fyInH/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts

```

## Runner output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (17 tests | 1 failed) 95ms
   ✓ the test budget is CI-strict and a fixed multiple locally (7)
     ✓ limitFactor returns 1 under CI 2ms
     ✓ limitFactor returns LOCAL_HANG_FACTOR off CI 0ms
     ✓ tierTimeouts gives the strict bases under CI 1ms
     ✓ tierTimeouts gives 6x the bases locally 0ms
     ✓ localLimit scales a file's own limit locally only 0ms
     ✓ keeps the 5s unit and 30s integration bases 0ms
     ✓ the budget reads no load 0ms
   ✓ the configs read the fixed budget (2)
     ✓ vitest.config.ts spreads unitTimeouts and plans no load 1ms
     ✓ the bats local default matches the integration hang limit 1ms
   ✓ no test file sets a bare limit (2)
     ✓ no test file sets a bare numeric test or hook limit 36ms
     ✓ CONTROL — a bare numeric test limit is caught 0ms
   ❯ no test file sets a limit through a named constant (2)
     ✓ CONTROL — a test limit set through a named numeric constant is caught 1ms
     × no test file sets a numeric test limit through a named constant 51ms
   ✓ the runners re-read the budget per test file (4)
     ✓ vitest.config.ts spreads the unit budget 1ms
     ✓ vitest.setup.ts re-reads it with vi.setConfig 0ms
     ✓ CONTROL — a setup that hard-codes a timeout is caught 0ms
     ✓ CONTROL — a config without the spread is caught 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > no test file sets a limit through a named constant > no test file sets a numeric test limit through a named constant
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/engine/commands/workflow/branches.test.ts:GIT_TIMEOUT",
+ ]

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:161:23
    159|     );
    160|     const offenders = files.flatMap((f) => namedLimits(read(f)).map((n…
    161|     expect(offenders).toEqual([]);
       |                       ^
    162|   });
    163| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 16 passed (17)
   Start at  17:01:15
   Duration  265ms (tests 63%, setup 28%, transform 4%, import 3%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-HRPGAk/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
