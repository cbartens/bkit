Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/812-keep-steps-placeholder-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a --derived-artifact holding a whole-line PENDING passes and is recorded" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PENDING in --artifact still refuses while a --derived-artifact is passed" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a PENDING in --optional-artifact still refuses while a --derived-artifact is passed" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a missing --derived-artifact is skipped and not recorded" | red | passed |
| 2 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Fetch Context passes related-issues.md as a derived artifact" | red | passed |

## Gaps

None.
