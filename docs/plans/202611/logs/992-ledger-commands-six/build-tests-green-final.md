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
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a negative --cursor offset is refused" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows are gone is not reported as recorded" | red | passed |
| 2 | `.bkit/core/engine/ledgers/status.test.ts` "the row block is stored once per operation" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "the correction-events file has mode 0600" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows a rebase moved is still reported as recorded" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a replayed operation whose rows are gone says it was recorded and must not be retried under a new id" | red | passed |
| 6 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again" | red | passed |

## Gaps

None.
