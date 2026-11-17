Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/814-local-test-limits-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` "a file-level localLimit stays at the CI value under CI=1" | red | passed |
| 7 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "CONTROL — a test limit set through a named numeric constant is caught" | red | passed |
| 7 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "no test file sets a numeric test limit through a named constant" | red | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "localLimit of a large file limit stays inside the tests lock wait" | no row | not passed |

## Gaps

- Task 8 `not-green` — the named test "localLimit of a large file limit stays inside the tests lock wait" did not run; the report holds "the test budget is CI-strict and a fixed multiple locally > limitFactor returns 1 under CI", "the test budget is CI-strict and a fixed multiple locally > limitFactor returns LOCAL_HANG_FACTOR off CI", "the test budget is CI-strict and a fixed multiple locally > tierTimeouts gives the strict bases under CI", "the test budget is CI-strict and a fixed multiple locally > tierTimeouts gives 6x the bases locally", "the test budget is CI-strict and a fixed multiple locally > localLimit scales a file's own limit locally only", … — Fixable: true — log: TASK 8: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `localLimit of a large file limit stays inside the tests lock wait` — not-green — Fixable: true

## Unproven

- Task 8 `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "localLimit of a large file limit stays inside the tests lock wait" — no tests step recorded a red for it (`bkit tests red --group=3`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/814-local-test-limits

 ✓ .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts (17 tests) 43ms

 Test Files  1 passed (1)
      Tests  17 passed (17)
   Start at  18:15:16
   Duration  119ms (tests 64%, setup 28%, transform 4%, import 3%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Sxodr6/junit.xml
```
