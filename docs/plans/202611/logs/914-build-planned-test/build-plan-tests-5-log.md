Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 14: `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a changed test when test-first is not enforced`
WROTE — TASK 15: `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block`
PASSES — TASK 15: `.bkit/core/engine/commands/workflow/steps.test.ts` `still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11`: the engine already refuses any edit to an unlocated test's whole file (exit 11); the test guards that it stays refused
WROTE — TASK 16: `.bkit/core/engine/commands/workflow/steps.test.ts` `a changedTests record on a non-code-step row does not move the lock's baseline`
WROTE — TASK 16: `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a --field changedTests on a step finish`
WROTE — TASK 17: `.bkit/core/engine/commands/workflow/tests.test.ts` `green gives a changed test whose red recorded its file missing every line of the test as added`
WROTE — TASK 18: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment`
WROTE — TASK 18: `.bkit/core/engine/commands/workflow/steps.test.ts` `the exit 11 refusal says verify reads a BLOCKED change's added lines`
SOURCE — TASK 15: red entry block null/whole-file compare from .bkit/core/engine/commands/workflow/tests.ts:468
SOURCE — TASK 17: baselineDiff null blob returns null from .bkit/core/engine/commands/workflow/tests.ts:486
