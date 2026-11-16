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
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a code step through when its BLOCKED line names the changed test by the last segment of its name" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records only the changed test when a BLOCKED line also names an unchanged one" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses only the changed planned tests no BLOCKED line of the log names" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the refusal names the BLOCKED line the engine reads" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "the exit 11 help names the BLOCKED line that lets a change through" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "passes a later code step that leaves a BLOCKED change as it is" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "refuses a later code step that changes a BLOCKED change again" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "uses a red the tests step recorded after a code step's change as the baseline" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/tests.test.ts` "red keeps a test standing whose lines match a code step's recorded change" | red | passed |

## Gaps

None.
