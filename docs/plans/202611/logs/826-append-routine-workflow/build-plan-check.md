Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/826-append-routine-workflow-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Provider evidence, rendering and progress cache | 3 | 17 | 7.1 |
| 2 | Safe append and bounded nonfatal fallback | 3 | 22 | 9.7 |
| 3 | Lifecycle integration, diagnostics and host contracts | 4 | 16 | 11.6 |
| 4 | Provider acceptance and executable release evidence | 2 | 0 | 3.7 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 6 | 1 |
| 2 | 1 | 5 | 1 |
| 3 | 1 | 6 | 1 |
| 4 | 2 | 4 | 1 |
| 5 | 2 | 8 | 1 |
| 6 | 2 | 10 | 2 |
| 7 | 3 | 8 | 1 |
| 8 | 3 | 4 | 1 |
| 9 | 3 | 3 | 1 |
| 12 | 3 | 1 | 1 |
| 10 | 4 | 0 | 0 |
| 11 | 4 | 0 | 0 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/826-append-routine-workflow-plan.md:428` TASK 4: `.bkit/core/engine/commands/workflow/locks.test.ts` already holds a test named "serializes publication for one target and invocation" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:428` TASK 4: `.bkit/core/engine/commands/workflow/locks.test.ts` already holds a test named "bounds acquisition and preserves unverifiable owners" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:428` TASK 4: `.bkit/core/engine/commands/workflow/locks.test.ts` already holds a test named "reclaims only a proven dead matching process identity" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:428` TASK 4: `.bkit/core/engine/commands/workflow/locks.test.ts` already holds a test named "releases only its delivery token on every exit" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "creates then appends routine sections under explicit invocation ownership" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "deduplicates known reports using available receipts and bounded markers" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "appends changed report versions without replacing prior text" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "classifies attention and terminal reports from structured purpose" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "rolls over after intervening comments external edits and deletion" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "starts only new source after overflow or missing source" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "keeps standalone fallback exact and unassociated calls conservative" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:444` TASK 5: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "uses exact new comment after a failed eligibility read" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "falls back to a new comment after failed or uncertain append" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "recognizes append success within budget without unnecessary resend" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "contains exhausted append and create failures without fabricated success" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "keeps multipart loss and duplicate handling bounded and nonfatal" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "keeps positive acknowledgment after receipt cache or postflight failure" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "reserves new comment opportunity within total delivery budget" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "contains preparation state lock and reconciliation exceptions" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "attempts independent attention after routine uncertainty" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "seals an acknowledged segment after a postflight intervening comment" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:466` TASK 6: `.bkit/core/engine/commands/lib.test.ts` already holds a test named "bounds a slow child with an optional deadline and classifies timeout" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/826-append-routine-workflow-plan.md:560` TASK 12: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "reserves new comment opportunity within total delivery budget" — name the update to it in TEST FIRST, or give the new test a new name
