Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: matrix header and problem shape from .bkit/core/engine/commands/workflow/tests.ts:896
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with an extra leading # column`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with Task not last`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses synonym matrix column names`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with no Task column, naming the column to add`
PASSES — TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check accepts the template matrix header in any letter case`: current check accepts any header with a Task column, so the case-different header already passes (guards against over-strict fix)
