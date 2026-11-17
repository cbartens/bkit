Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 30 | `.bkit/core/engine/commands/workflow/steps.test.ts` "derives a fresh audit key when the ledger already holds it" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/status.test.ts` "refuses to issue an invocation through a status file symlinked out of the checkout" | red | passed |

## Gaps

None.
