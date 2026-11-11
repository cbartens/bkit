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
| 18 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "issues the same operation for rows whose keys are reordered" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/issues.test.ts` "derives audit ledger keys under the audit-slug prefix" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "renders no PASS from a result that omits its evidence" | red | passed |
| 21 | `.bkit/core/engine/tools/instructions.test.ts` "routes every ledgers query reader on coverage status" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/status.test.ts` "writes no absolute checkout path into the run's committed invocation event" | red | passed |

## Gaps

None.
