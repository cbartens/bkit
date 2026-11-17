## Session Prompt — this run's, newer than everything below

/bkit-plan #914

## Issue description — oldest

## What happens

`bkit steps finish` refuses a build commit with exit 11 when a planned test differs from the lines its group's tests step recorded at its red (`touchedTests`, `.bkit/core/engine/commands/workflow/tests.ts:309`, called at `.bkit/core/engine/commands/workflow/steps.ts:1262`). Two problems surfaced in #891's build:

### 1. A change to another group's planned test is caught only at the holistic fix

The check covers only the step's own group for `build-plan-tasks` and `build-plan-gaps-remediate`, and every group only for `build-plan-gaps-remediate-holistic`. A code step that legitimately has to reshape an earlier group's planned test is waved through. The refusal then lands on a later, unrelated holistic fix round that never touched the file.

In #891, group 7 Task 20 made `decisions apply --by=rerun` refuse a `Gate: FAIL` file with no loop question. The group 3 (Task 8) planned test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` composed exactly that file, so its setup had to change; its assertions stayed the same. Group 7's finish passed. The holistic fix of attempt 4 (help-text wording only) then failed exit 11 twice.

### 2. A planned test the owner superseded stays locked

Task 16 was rewritten after an owner decision, replacing its `TEST FIRST` test. The old name, `bkit tests base > a gate red on a non-test stage as well never reads all`, is still in group 6's first `build-tests-red` row (state `missing`). The plan no longer names it and the file never held it, yet `touchedTests` keeps reporting it as changed.

### 3. The refusal offers a BLOCKED escape the engine never reads

The problem text says "...or log the task BLOCKED naming the test and what it gets wrong", and the `steps finish` help says the same. `touchedTests` reads only the red rows and the test files. No BLOCKED line in the agent's log changes the result, so the re-ask the workflow prescribes can't succeed when restoring the test would be wrong, and the run goes to the Failure Path.

## Expected

- A code step that changes another group's planned test is flagged in that step, not in a later holistic round.
- A red row whose test the plan no longer names is not checked.
- Either the BLOCKED escape works (the check reads it), or the message and help stop offering it.

## Found in

#891 build, holistic attempt 4, 2026-11-10.

## Issue comment — posted 2026-11-10T06:11:24.000Z

**Label added: `next:design`**

The issue had no `next:*` label. The cause of all three problems is known, but point 3 under "Expected" is an open choice: make the `BLOCKED` escape work, or stop offering it. Point 1 says what should happen but not how. That is design's job (`.bkit/workflows.md:58`). If the owner settles point 3 in a comment, the issue can skip design and go to `/bkit-plan 914`.

## Issue comment — posted 2026-11-10T06:56:35.000Z

### Owner decisions (design no longer needed)

**Point 3: make the BLOCKED escape real.** When a code step genuinely has to change a planned test, for example new setup lines that a correct code change forces while the assertions stay the same, it keeps the edit and logs the task BLOCKED, naming the test and saying why the change is needed. `steps finish` reads that line and lets the step through instead of refusing with exit 11. The changed test then appears as an item at the build Decision Pause, where the owner accepts or rejects it. A headless or `ask: false` run takes the recommendation and records it as an assumed accept, the same as other assumed accepts, so ship asks the owner to confirm it. A planned test that changed with no BLOCKED line naming it is still refused, as today.

Why: the lock exists so a code agent can't quietly weaken a test until it passes. This keeps that guarantee, because every change reaches the owner, without failing a run whose change is correct. The refusal text and the `steps finish` help now describe a path that works.

**Point 1: catch the change in the step that made it.** `build-plan-tasks` and `build-plan-gaps-remediate` check the planned tests of every group that already has a red row, not only their own group. A cross-group change is then flagged (or let through by BLOCKED, as above) in the step that made it, never in a later holistic round that didn't touch the file.

**Point 2: skip superseded tests.** A red row's test that the current plan no longer names (for example a `TEST FIRST` test replaced after an owner decision) is not checked.

Next step: `/bkit-plan 914`.
