Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/903-build-owner-s-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a test-fix FAIL resolved by a later passing test run on the same scope is historical" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug fix FAIL resolved by a later passing debug test run is historical" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a debug fix FAIL after a CI-sourced round is not resolved by a local pass" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "reads the task a Fix now item names on its Fix task line" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "decisionHeader reads the header block only" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause's Fix now group is resolved once each fix task is verified" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause before the round limit resolves its Fix now group the same way" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause clears its group's FAIL only when every item is answered" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a Fix now item clears its group's FAIL only through a ticked task its own group verified after the pause" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a verify pause clears only the group its Group header names" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a Fix now item without a Fix task line or naming a missing task keeps its group's FAIL" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a paused group's CONCERNS rows stay concerns after its Fix now task is verified" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a holistic or challenge decision file clears no group rows" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/summary.test.ts` "a group that paused more than once is settled by its latest qualifying decision" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints CONCERNS when a Fix now group's fix task and a test-fix FAIL are both resolved" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/summary.test.ts` "an Accept-only verify pause resolves its group's FAIL rows before the pause" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a Fix now challenge task is rewritten to the owner's direction in place" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a hard blocker answered Fix now with no direction is asked again" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "each Fix now item records its Fix task line before the decision row is finished" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the owner decisions contract names the task block as the Fix now carrier" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start reports openDecision for a DECIDED decision file that no build-decision row names" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start does not report openDecision for a DECIDED decision file that a build-decision row names" | passed-accepted | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start reports the status of a reopened DECIDED decision file in openDecision" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Resume re-runs a red gate only when openDecision status is OPEN" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause" | red | passed |

## Gaps

None.

## Already landed

- Task 8 `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start does not report openDecision for a DECIDED decision file that a build-decision row names" — passed at the group's red, and the tests step accepted it: current openDecision already skips any non-OPEN file; the test guards the new reopen rule against over-reopening; no red is due
