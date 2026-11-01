Enforced: true
Verdict: PASS
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 3 | `.bkit/core/engine/ledgers/journal.test.ts` "writes no friction row for a declared routing exit" | recorded 2026-10-28T20:58:14Z | no | passed |
| 3 | `.bkit/core/engine/ledgers/journal.test.ts` "never leaves by.step empty" | recorded 2026-10-28T20:58:15Z | no | passed |
| 3 | `.bkit/core/engine/ledgers/journal.test.ts` "raises recurrenceCount on a same-key row" | recorded 2026-10-28T20:58:16Z | no | passed |
| 3 | `.bkit/core/engine/ledgers/journal.test.ts` "journals flag names only" | recorded 2026-10-28T20:58:17Z | no | passed |
| 3 | `.bkit/core/engine/ledgers/journal.test.ts` "writes no row when BKIT_ENGINE_JOURNAL is off" | recorded 2026-10-28T20:58:18Z | no | passed |
| 3 | `.bkit/core/engine/ledgers/journal.test.ts` "writes a friction row with no run object when parentSha is unresolvable" | recorded 2026-10-28T20:58:19Z | no | passed |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "writes friction to the run's own book root" | recorded 2026-10-28T21:00:22Z | no | passed |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "skips a call made outside the run's worktree" | recorded 2026-10-28T21:00:23Z | no | passed |
| 4 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "writes nothing when no run is active in the cwd" | recorded 2026-10-28T21:00:23Z | no | passed |
| 4 | `.bkit/core/engine/commands/lib.test.ts` "passes the command's exit code through when the journal write throws" | recorded 2026-10-28T21:00:25Z | no | passed |
| 5 | `scripts/harvest/ledgers.integration.test.ts` "keeps a seam-written tool-failure row through commit and harvest" | missing | — | passed |

## Gaps

None.

## Test exceptions

- Task 5 — honoured; cleared `no-red` for `scripts/harvest/ledgers.integration.test.ts` "keeps a seam-written tool-failure row through commit and harvest"
