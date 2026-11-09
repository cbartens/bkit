Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Explicit identity and canonical ledger contracts | 5 | 14 | 12.0 |
| 2 | Replay-safe writes and shared result rendering | 3 | 10 | 8.9 |
| 3 | Durable continuation and maintained caller contracts | 3 | 8 | 12.8 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 3 | 3 |
| 2 | 1 | 3 | 3 |
| 3 | 1 | 3 | 3 |
| 10 | 1 | 3 | 3 |
| 11 | 1 | 2 | 2 |
| 4 | 2 | 4 | 3 |
| 5 | 2 | 3 | 2 |
| 6 | 2 | 3 | 3 |
| 7 | 3 | 3 | 3 |
| 8 | 3 | 3 | 3 |
| 9 | 3 | 2 | 2 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md:389` TASK 1: `.bkit/core/engine/commands/workflow/status.test.ts` already holds a test named "issues invocation metadata from an explicit run and registered step" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md:389` TASK 1: `.bkit/core/engine/commands/lib.test.ts` already holds a test named "rejects stale cross-worktree invocation and conflicting overrides" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md:389` TASK 1: `.bkit/core/engine/ledgers/journal.integration.test.ts` already holds a test named "resumes explicit invocation across two real worktrees without identity leakage" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md:444` TASK 10: `.bkit/core/engine/commands/workflow/status.test.ts` already holds a test named "records the issued invocation in the run status log and rebuilds a deleted receipt" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md:444` TASK 10: `.bkit/core/engine/commands/lib.test.ts` already holds a test named "writes the engine-call row for an invocation-bound command" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/860-move-deterministic-bookkeeping-plan.md:444` TASK 10: `.bkit/core/engine/ledgers/journal.integration.test.ts` already holds a test named "keeps invocation events and engine-call rows inside the issuing worktree after receipt loss" — name the update to it in TEST FIRST, or give the new test a new name
