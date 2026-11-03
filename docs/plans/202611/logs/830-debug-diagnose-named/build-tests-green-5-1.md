Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 12 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes local-only rounds through the actual Debug Step 3 commands" | red | passed |
| 13 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes replacement CI evidence with the unchanged debug run number" | red | passed |
| 13 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "finishes the first CI evidence round of the second debug run" | red | passed |
| 14 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects fork verification runs that shadow a red selected workflow at the same head" | red | passed |
| 14 | `.bkit/core/engine/commands/workflow/runs.test.ts` "preserves the requested event for selected-workflow verification" | red | passed |

## Gaps

None.
