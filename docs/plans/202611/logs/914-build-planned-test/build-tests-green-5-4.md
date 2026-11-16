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
| 14 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green lists a changed test when test-first is not enforced" | red | passed |
| 15 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block" | red | passed |
| 15 | `.bkit/core/engine/commands/workflow/steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" | passed-accepted | passed |
| 16 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a changedTests record on a non-code-step row does not move the lock's baseline" | red | passed |
| 16 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a --field changedTests on a step finish" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green gives a changed test whose red recorded its file missing every line of the test as added" | red | passed |
| 18 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the exit 11 refusal says verify reads a BLOCKED change's added lines" | red | passed |

## Gaps

None.

## Already landed

- Task 15 `.bkit/core/engine/commands/workflow/steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" — passed at the group's red, and the tests step accepted it: the engine already refuses any edit to an unlocated test's whole file (exit 11); the test guards that it stays refused; no red is due
