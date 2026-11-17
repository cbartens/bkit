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
