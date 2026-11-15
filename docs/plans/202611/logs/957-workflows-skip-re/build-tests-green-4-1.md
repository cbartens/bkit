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
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "a verify or holistic decision file records Source changed and a resume holds it" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "openDecision carries the Source changed header" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "the continue rule reads the source change from the decision file header" | red | passed |

## Gaps

None.
