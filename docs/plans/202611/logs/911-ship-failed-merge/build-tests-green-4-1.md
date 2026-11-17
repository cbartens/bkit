Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/911-ship-failed-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail refuses a bad --next-step with an exit code no other usage error shares" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "the Failure Path re-runs workflows fail without --next-step only on the --next-step refusal" | red | passed |

## Gaps

None.
