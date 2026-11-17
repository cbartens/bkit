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
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start reports openDecision for a DECIDED decision file that no build-decision row names" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start does not report openDecision for a DECIDED decision file that a build-decision row names" | passed-accepted | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check" | red | passed |

## Gaps

None.

## Already landed

- Task 8 `.bkit/core/engine/commands/workflow/workflows.test.ts` "workflows start does not report openDecision for a DECIDED decision file that a build-decision row names" — passed at the group's red, and the tests step accepted it: current openDecision already skips any non-OPEN file; the test guards the new reopen rule against over-reopening; no red is due
