Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 3, attempt 2

Plan: `docs/plans/202611/814-local-test-limits-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "CONTROL — a test limit set through a named numeric constant is caught" | red | failure: expected false to be true // Object.is equality |

## Gaps

None.

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

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (17 tests | 2 failed) 78ms
   ✓ the test budget is CI-strict and a fixed multiple locally (7)
     ✓ limitFactor returns 1 under CI 1ms
     ✓ limitFactor returns LOCAL_HANG_FACTOR off CI 0ms
     ✓ tierTimeouts gives the strict bases under CI 1ms
     ✓ tierTimeouts gives 6x the bases locally 0ms
     ✓ localLimit scales a file's own limit locally only 0ms
     ✓ keeps the 5s unit and 30s integration bases 0ms
     ✓ the budget reads no load 0ms
   ✓ the configs read the fixed budget (2)
     ✓ vitest.config.ts spreads unitTimeouts and plans no load 0ms
     ✓ the bats local default matches the integration hang limit 0ms
   ✓ no test file sets a bare limit (2)
     ✓ no test file sets a bare numeric test or hook limit 29ms
     ✓ CONTROL — a bare numeric test limit is caught 0ms
   ❯ no test file sets a limit through a named constant (2)
     × CONTROL — a test limit set through a named numeric constant is caught 5ms
     × no test file sets a numeric test limit through a named constant 38ms
   ✓ the runners re-read the budget per test file (4)
     ✓ vitest.config.ts spreads the unit budget 0ms
     ✓ vitest.setup.ts re-reads it with vi.setConfig 0ms
     ✓ CONTROL — a setup that hard-codes a timeout is caught 0ms
     ✓ CONTROL — a config without the spread is caught 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > no test file sets a limit through a named constant > CONTROL — a test limit set through a named numeric constant is caught
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:156:74
    154|     expect(namedLimits('const T = localLimit(60_000);\nit("x", { timeo…
    155|     // the shared bare-limit guard itself must see a numeric literal b…
    156|     expect(BARE.test('const T = 60_000;\nit("x", { timeout: T }, fn);'…
       |                                                                          ^
    157|     expect(BARE.test('const T = 60_000;\nit("x", () => {\n}, T);')).to…
    158|     expect(BARE.test('it("x", { timeout: 30_000, retry: 1 }, fn);')).t…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts > no test file sets a limit through a named constant > no test file sets a numeric test limit through a named constant
AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   ".bkit/core/engine/commands/workflow/branches.test.ts:GIT_TIMEOUT",
+ ]

 ❯ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:167:23
    165|     );
    166|     const offenders = files.flatMap((f) => namedLimits(read(f)).map((n…
    167|     expect(offenders).toEqual([]);
       |                       ^
    168|   });
    169| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 15 passed (17)
   Start at  17:02:02
   Duration  233ms (tests 64%, setup 27%, transform 4%, import 3%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-N3bi15/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
