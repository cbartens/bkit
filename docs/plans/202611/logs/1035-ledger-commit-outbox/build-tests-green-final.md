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
| 4 | `.bkit/core/engine/commands/lib.test.ts` "writeInvocation creates invocation-context owner-only" | red | passed |
| 4 | `.bkit/core/engine/commands/lib.test.ts` "writeInvocation narrows an existing invocation-context to 0700" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a correction-events file left at 0644 is 0600 after a corrected append" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "checkOnlyBookkeeping refuses a climbing fid from any caller" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "commitBookkeeping refuses a climbing fid from any caller" | red | passed |

## Gaps

None.
