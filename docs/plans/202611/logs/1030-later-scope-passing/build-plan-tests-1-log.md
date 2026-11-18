Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: row shape and RESOLVED_BY/SAME_SCOPE from .bkit/core/engine/commands/workflow/summary.ts:78-89
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/summary.test.ts` `a build-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-diagnose FAIL resolved by a later passing test run on the same scope is historical`
PASSES — TASK 1: `.bkit/core/engine/commands/workflow/summary.test.ts` `a diagnose FAIL followed by a passing run on a different scope still counts`: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added
PASSES — TASK 1: `.bkit/core/engine/commands/workflow/summary.test.ts` `a diagnose FAIL followed by a passing run with no scope still counts`: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added
PASSES — TASK 1: `.bkit/core/engine/commands/workflow/summary.test.ts` `a debug-failure-soak FAIL followed by a passing same-scope run still counts`: diagnose and soak are not in RESOLVED_BY yet, so the FAIL already counts; the test guards the scope check once diagnose is added
