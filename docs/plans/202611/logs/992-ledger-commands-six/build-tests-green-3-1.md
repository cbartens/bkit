Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/992-ledger-commands-six-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows a rebase moved is still reported as recorded" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows are gone says it was recorded and must not be retried under a new id" | red | passed |

## Gaps

None.
