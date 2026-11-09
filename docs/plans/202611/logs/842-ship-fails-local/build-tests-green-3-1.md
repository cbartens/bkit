Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/842-ship-fails-local-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/commands/workflow/runs.test.ts` "requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse" | red | passed |
| 9 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "routes late revalidation code and gate seventeen through reconciliation before merge" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects MCP green runs from another repository or workflow at the same head" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/runs.test.ts` "rejects MCP capstone jobs belonging to another run" | red | passed |

## Gaps

None.
