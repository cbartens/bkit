Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1039-ledger-query-status-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/ledgers/telemetry.test.ts` "a friction, deferral or failure winner with no status matches the OPEN filter" | red | passed |
| 1 | `.bkit/core/engine/ledgers/telemetry.test.ts` "defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "query --status=OPEN returns a deferral winner that has no status, printed as stored" | red | passed |

## Gaps

None.
