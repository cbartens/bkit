Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 8: baseline with no blob refused unless it came from a changedTests record (.bkit/core/engine/commands/workflow/tests.ts)
DONE — TASK 9: refusal of a test whose baseline is a recorded change names that recorded change (.bkit/core/engine/commands/workflow/steps.ts)
DONE — TASK 10: refusal says a logged BLOCKED reason is already recorded and a new reason is needed (.bkit/core/engine/commands/workflow/steps.ts)
DONE — TASK 11: BLOCKED lets through only additive changes; changedTests stores blob and after; green changed carries diff and additive; report, Decision Pause rule, prompts, workflows.md and testing.md updated (.bkit/core/engine/commands/workflow/steps.ts, tests.ts)
BLOCKED — TASK 1: test `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row` — the record now also holds blob and after, so its exact toEqual gained those two keys
BLOCKED — TASK 2: test `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its BLOCKED line names the changed test by the last segment of its name` — rewrote toBe(1) to toBe(2), which Task 11 refuses; the edit now only adds expect lines
BLOCKED — TASK 2: test `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test` — same: the edit now only adds expect lines
BLOCKED — TASK 2: test `.bkit/core/engine/commands/workflow/steps.test.ts` `records only the changed test when a BLOCKED line also names an unchanged one` — same: the edit now only adds expect lines
BLOCKED — TASK 2: test `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses only the changed planned tests no BLOCKED line of the log names` — same: the edit now only adds expect lines
BLOCKED — TASK 3: test `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a later code step that leaves a BLOCKED change as it is` — same: the edit now only adds expect lines
BLOCKED — TASK 3: test `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a later code step that changes a BLOCKED change again` — same: the edit now only adds expect lines
BLOCKED — TASK 3: test `.bkit/core/engine/commands/workflow/steps.test.ts` `records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line` — same: the edit now only adds expect lines
BLOCKED — TASK 3: test `.bkit/core/engine/commands/workflow/steps.test.ts` `uses a red the tests step recorded after a code step's change as the baseline` — same: the edit now only adds expect lines
BLOCKED — TASK 4: test `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap` — changed entries now carry diff and additive, so exact toEqual became objectContaining
BLOCKED — TASK 4: test `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a changed test the plan no longer names out of changed` — same: exact toEqual became objectContaining
BLOCKED — TASK 4: test `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` `a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed` — same: exact toEqual became objectContaining
BLOCKED — bkit:generate: Vitest tests lock exited before readiness (75): held by another worktree; the render snapshot (`bkit-build: the none render matches its baseline`) still needs `vitest run .bkit/core/engine/render -u`; build, cli:sync, instructions:sync and bkit upgrade did run
