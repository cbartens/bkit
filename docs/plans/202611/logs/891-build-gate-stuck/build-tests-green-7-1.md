Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 20 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a Gate: FAIL file whose Q1 is an item, not the loop question" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > refuses a loop file with an undecided item question" | red | passed |
| 20 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "resume facts > build re-runs a red gate pause only when the loop question is its only undecided question" | red | passed |
| 21 | `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` "bkit tests base > a case skipped at the base commit reads unknown, not the branch's" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/tests-base.test.ts` "baseVerdict > some with an undetermined case names it in the reason" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions compose > base check some with undetermined cases counts only the branch's as fixable" | red | passed |

## Gaps

None.
