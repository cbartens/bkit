Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/914-build-planned-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses the execute step when it changes another group's planned test, exit 11" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses the gaps-remediate step when it changes another group's planned test, exit 11" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/tests.test.ts` "blockedTests > reads the file, name and reason from a TASK or Gap BLOCKED test line" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/tests.test.ts` "blockedTests > ignores a BLOCKED line that names no test" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the exit 11 help names the BLOCKED line that lets a change through" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/tests.test.ts` "red keeps a test standing whose lines match a code step's recorded change" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green prints an empty changed list and no Changed by a code step section when no code step changed a test" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "an exit 11 re-ask offers the BLOCKED test line the engine reads" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Step 15 asks once about planned tests a code step changed, before the unproven ones" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a changed-test item offers Accept or Stop, recommended Accept" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the execute prompt's BLOCKED test line is one the engine reads" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the remediate prompt's BLOCKED test line is one the engine reads" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the verify prompt notes a planned test a code step changed and raises no gap" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step that writes a planned test whose red recorded its file missing, exit 11" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal of a restored BLOCKED change names the recorded change as the lines to put back" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal of a re-change says the logged reason is already recorded" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the baseline blob on a BLOCKED-named change that only adds lines" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green gives each changed test the line diff of its own lines since its baseline and whether it is additive" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a changed-test item shows the test's line diff since its baseline" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the code prompts say a BLOCKED line lets through only a change that adds lines" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its BLOCKED line names the changed test by the last segment of its name" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records only the changed test when a BLOCKED line also names an unchanged one" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses only the changed planned tests no BLOCKED line of the log names" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal names the BLOCKED line the engine reads" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a later code step that leaves a BLOCKED change as it is" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a later code step that changes a BLOCKED change again" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line" | passed-accepted | passed |
| 12 | `.bkit/core/engine/commands/workflow/steps.test.ts` "uses a red the tests step recorded after a code step's change as the baseline" | passed-accepted | passed |
| 13 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap" | passed-accepted | passed |
| 13 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green leaves a changed test the plan no longer names out of changed" | passed-accepted | passed |
| 13 | `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` "a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed" | passed-accepted | passed |
| 14 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a changed test when test-first is not enforced" | red | passed |
| 15 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block" | red | passed |
| 15 | `.bkit/core/engine/commands/workflow/steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" | passed-accepted | passed |
| 16 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a changedTests record on a non-code-step row does not move the lock's baseline" | red | passed |
| 16 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a --field changedTests on a step finish" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green gives a changed test whose red recorded its file missing every line of the test as added" | red | passed |
| 18 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the exit 11 refusal says verify reads a BLOCKED change's added lines" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its BLOCKED line names the changed test by the last segment of its name" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "records only the changed test when a BLOCKED line also names an unchanged one" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses only the changed planned tests no BLOCKED line of the log names" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal names the BLOCKED line the engine reads" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a later code step that leaves a BLOCKED change as it is" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a later code step that changes a BLOCKED change again" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 12 `.bkit/core/engine/commands/workflow/steps.test.ts` "uses a red the tests step recorded after a code step's change as the baseline" — passed at the group's red, and the tests step accepted it: already additive (grown/blockedLine helpers add lines only); passes against the engine's add-only rule; no red is due
- Task 13 `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a planned test a code step changed under a BLOCKED line as changed, with its reason, never a gap" — passed at the group's red, and the tests step accepted it: change now adds a setup line; green already lists changed tests; no red is due
- Task 13 `.bkit/core/engine/commands/workflow/tests.test.ts` "green leaves a changed test the plan no longer names out of changed" — passed at the group's red, and the tests step accepted it: change now adds a setup line; green already filters by plan; no red is due
- Task 13 `.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts` "a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed" — passed at the group's red, and the tests step accepted it: already additive (adds setup() line); engine already supports it; no red is due
- Task 15 `.bkit/core/engine/commands/workflow/steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" — passed at the group's red, and the tests step accepted it: the engine already refuses any edit to an unlocated test's whole file (exit 11); the test guards that it stays refused; no red is due
- Task 19 `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11" — passed at the group's red, and the tests step accepted it: steps.ts:1387 already words the refusal as "the engine refuses a BLOCKED-named change that removes a line of a planned test"; no red is due
