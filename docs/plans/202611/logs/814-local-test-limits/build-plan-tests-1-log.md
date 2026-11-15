Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `limitFactor returns 1 under CI`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `limitFactor returns LOCAL_HANG_FACTOR off CI`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `tierTimeouts gives the strict bases under CI`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `tierTimeouts gives 6x the bases locally`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `localLimit scales a file's own limit locally only`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the budget reads no load`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `vitest.config.ts spreads unitTimeouts and plans no load`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the bats local default matches the integration hang limit`
WROTE — TASK 2: `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit`
WROTE — TASK 2: `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI`
WROTE — TASK 3: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a bare numeric test or hook limit`
WROTE — TASK 3: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a bare numeric test limit is caught`
SOURCE — TASK 2: local bats default 180 from tests/shell/setup_suite.bash:25
WROTE — TASK 3: `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a bare numeric test limit is caught`
SOURCE — TASK 3: localLimit/limitFactor signatures from vitest.timeout-budget.ts (task 1 DONE WHEN, matches existing tests at test file lines 56-59)
