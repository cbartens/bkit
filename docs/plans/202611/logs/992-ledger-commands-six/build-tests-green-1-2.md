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

## Gaps

None.
