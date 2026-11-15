Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/814-local-test-limits-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "limitFactor returns 1 under CI" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "limitFactor returns LOCAL_HANG_FACTOR off CI" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "tierTimeouts gives the strict bases under CI" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "tierTimeouts gives 6x the bases locally" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "localLimit scales a file's own limit locally only" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "the budget reads no load" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "vitest.config.ts spreads unitTimeouts and plans no load" | red | passed |
| 2 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "the bats local default matches the integration hang limit" | red | passed |
| 2 | `scripts/ci/bkit-test-limits.test.mjs` "gives --test-timeout from the integration budget and --test-force-exit" | red | passed |
| 2 | `scripts/ci/bkit-test-limits.test.mjs` "gives the bats limit in whole seconds, 30 under CI" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "no test file sets a bare numeric test or hook limit" | red | passed |
| 3 | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` "CONTROL — a bare numeric test limit is caught" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `planUnitLoad` in `vitest.timeout-budget.ts` is still referenced: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:78`, `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:80`, `docs/failures.jsonl:166`, `docs/failures.jsonl:167`, `docs/failures.jsonl:168`, and 7 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
