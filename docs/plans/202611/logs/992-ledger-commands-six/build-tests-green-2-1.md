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
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "the correction-events file has mode 0600" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit" | red | passed |

## Gaps

None.
