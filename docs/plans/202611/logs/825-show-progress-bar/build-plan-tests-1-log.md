Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 1: Step titles, duplicate numbered entries, rowless ship positions and workflow totals from .bkit/core/engine/commands/workflow/step-table.ts:36.
SOURCE — TASK 1: runProgress input contract is {workflow, step?, number?, groups?: number[], group?, attempt?, max?}; output is {percent, progressLine}. The plan names the helper but leaves the exact signature open; groups are marker numbers in parsed file order.
SOURCE — TASK 1: Exact strings, percentage formulas, suffix ordering and nonfinal clamp from docs/plans/202611/825-show-progress-bar-plan.md:240.
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress flat workflow`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress build groups`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress groups added`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress loop back`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress bar width`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress all workflow numbers`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress missing plan fallback`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress attempt suffix`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/step-table.test.ts` `runProgress final completion only`
SOURCE — TASK 2: Real done/finish/gate fixtures, required attempt row fields and command output shape from .bkit/core/engine/commands/workflow/steps.ts:335 and .bkit/core/engine/commands/workflow/steps.test.ts:38.
SOURCE — TASK 2: Frozen limits use {ask,max}; grants use allowance-granted with point and optional group from .bkit/core/engine/commands/workflow/counters.ts:139.
SOURCE — TASK 2: Canonical plan path and group marker syntax from .bkit/core/engine/commands/workflow/run-facts.ts:176 and .bkit/core/engine/commands/workflow/plan-blocks.ts:1.
SOURCE — TASK 2: Context finalise --record flags and dispatch supplied-error completion from .bkit/core/engine/commands/workflow/context.ts:1772 and .bkit/core/engine/commands/workflow/runs.ts:1368.
SOURCE — TASK 2: Close --flush real local-remote/worktree fixture from .bkit/core/engine/commands/workflow/workflows.test.ts:1937. flush is a close flag, not a separate emitting verb.
SOURCE — TASK 2: engine-call journal dispatch semantics and journal environment controls from .bkit/core/engine/commands/lib.ts:458 and .bkit/core/engine/ledgers/journal.ts:39.
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `finish prints progressLine`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `done prints progressLine`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `progress output metadata`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `gate progress number validation`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress reads fresh plan groups`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress resumes from saved run`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress loop attempts and grants`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress specialized completion producers`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress gate only completions`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions`
SOURCE — TASK 2: The owner approved the specific fixture correction in build-decision-1-1.md: `Decision: Fix now — B)`.
SOURCE — TASK 2: `.bkit/core/engine/commands/lib.ts:369` skips malformed lines when finding the active run, and `.bkit/core/engine/commands/lib.ts:478` appends its normal engine-call journal entry before command validation. The malformed-status fixture therefore expects one journal entry. The unreadable-status fixture still expects zero.
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions`
SOURCE — TASK 2: On 2026-11-03, targeted `pnpm bkit:lint:file .bkit/core/engine/commands/workflow/progress.integration.test.ts` exited 0, and `pnpm bkit:test:file .bkit/core/engine/commands/workflow/progress.integration.test.ts` exited 0 with 8 Integration tests passed. The sole test edit changes the malformed-status journal expectation to one; every completion, commit, and journal assertion remains present. Production code was unchanged.
