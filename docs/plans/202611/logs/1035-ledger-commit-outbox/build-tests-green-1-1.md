Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1035-ledger-commit-outbox-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a --fid that climbs out of the log folder is refused and commits nothing" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a --month that is not six digits is refused and commits nothing" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "pending refuses a --fid that climbs out of the log folder and reads and writes nothing" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit" | red | passed |

## Gaps

None.
