Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Lock the plan-named tests of every group with a red row — touchedTests takes no group; steps.test.ts passes (.bkit/core/engine/commands/workflow/tests.ts, steps.ts)
DONE — TASK 2: Make the BLOCKED escape real — blockedTests exported; finish records changedTests; help and problem text rewritten (.bkit/core/engine/commands/workflow/tests.ts, steps.ts)
DONE — TASK 3: Use a recorded change as the next baseline — lockBaselines exported and read by touchedTests and tests red (.bkit/core/engine/commands/workflow/tests.ts)
BLOCKED — bkit:generate: exits 1 at the render vitest step (machine tests lock held by another worktree's run); no files changed by it
