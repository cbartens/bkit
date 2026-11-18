Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: step-done row fields (type, workflow, step, status, at, parentSha, artifacts) from .bkit/core/engine/commands/workflow/steps.ts:683
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-base.test.ts` `returns the commit that holds the last step-done row`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-base.test.ts` `with a step name returns the commit of the row before that step's latest row`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-base.test.ts` `falls back to the run start commit, and null with no run`
SOURCE — TASK 2: scratch run layout and row shapes from .bkit/core/engine/commands/lib.ts:549 (resolveActiveRun) and steps.ts:683
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists a file the subagent committed after the last step-done commit`
PASSES — TASK 2: `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the same file when it is left uncommitted`: the current HEAD default already lists an uncommitted edit; the test guards that it stays equal to the committed case
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `leaves out a file only the previous step's own commit touched`
SOURCE — TASK 3: scan-diff range and --code exit codes from .bkit/core/engine/commands/workflow/branches.ts:1664
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it`
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 1 when the step changed only logs`
