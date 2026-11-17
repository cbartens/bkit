Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/957-workflows-skip-re-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick --decision ticks the tasks of accepted verify-gap items" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick --decision leaves a Fix now item's task open" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a continue decision after a holistic round resumes at Build Challenge" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "a continue decision after a group verify resumes at Plan Execute" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "an all-Accept holistic pause settles the holistic FAIL before it" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a holistic pause with a Fix now item settles nothing" | passed-accepted | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "an Accept-only verify or holistic pause routes continue before the verify and holistic re-runs" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "continue sends holistic to Step 11 and verify to the decision tick then Step 7" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a Gate FAIL pause never routes continue" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug and ship questions offer no answer that re-runs a check without a change" | passed-accepted | passed |
| 6 | `.bkit/core/engine/commands/workflow/summary.test.ts` "an all-Accept holistic pause with a Decide loop question settles the holistic FAIL" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "continue is never set after a fix round that changed source files" | red | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the continue decision tick runs before the build-decision row is recorded" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "tick --decision ticks a task whose item title reads TASK {N}" | red | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the continue decision tick routes a non-zero exit to the Failure Path" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a verify or holistic decision file records Source changed and a resume holds it" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "openDecision carries the Source changed header" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the continue rule reads the source change from the decision file header" | red | passed |

## Gaps

None.

## Already landed

- Task 3 `.bkit/core/engine/commands/workflow/summary.test.ts` "a holistic pause with a Fix now item settles nothing" — passed at the group's red, and the tests step accepted it: current summary.ts settles no holistic FAIL on a pause, so the negative case already holds; no red is due
- Task 5 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug and ship questions offer no answer that re-runs a check without a change" — passed at the group's red, and the tests step accepted it: today's debug and ship Options lines only offer Stop, Try again, Confirm, Reject; no red is due
