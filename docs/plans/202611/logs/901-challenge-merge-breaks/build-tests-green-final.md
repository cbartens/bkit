Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/901-challenge-merge-breaks-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with an extra leading # column" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with Task not last" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses synonym matrix column names" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with no Task column, naming the column to add" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check accepts the template matrix header in any letter case" | passed-accepted | passed |
| 3 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses a matrix header with no closing pipe" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses rows left in the old column order under the template header" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check refuses rows with an extra cell under the template header" | red | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts` "plan-check accepts the template matrix header in any letter case" — passed at the group's red, and the tests step accepted it: current check accepts any header with a Task column, so the case-different header already passes (guards against over-strict fix); no red is due
