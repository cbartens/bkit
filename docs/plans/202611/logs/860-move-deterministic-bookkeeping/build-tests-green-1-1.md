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
| 1 | `.bkit/core/engine/commands/workflow/status.test.ts` "issues invocation metadata from an explicit run and registered step" | red | passed |
| 1 | `.bkit/core/engine/commands/lib.test.ts` "rejects stale cross-worktree invocation and conflicting overrides" | red | passed |
| 1 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "resumes explicit invocation across two real worktrees without identity leakage" | red | passed |
| 2 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts verified unavailable model without confusing configured and observed models" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "rejects conflicting attribution and retains legacy writer restrictions" | red | passed |
| 2 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "completes missing subagent attribution before a real append" | red | passed |
| 3 | `.bkit/core/engine/ledgers/telemetry.test.ts` "folds numeric timestamps and equal timestamp ties before filtering" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "pages canonical winners with diagnostics and rejects stale cursors" | red | passed |
| 3 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "distinguishes unreadable missing malformed and clean ledger coverage without writing" | red | passed |

## Gaps

None.
