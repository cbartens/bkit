Problems: 0
Existence: 3

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/1008-plan-design-owner-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | The run link in `status.jsonl` | 5 | 13 | 11.6 |
| 2 | The Owner Answers steps and the docs | 2 | 1 | 4.7 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 1 | 1 |
| 2 | 1 | 3 | 2 |
| 3 | 1 | 5 | 2 |
| 4 | 1 | 3 | 2 |
| 7 | 1 | 1 | 1 |
| 5 | 2 | 1 | 1 |
| 6 | 2 | 0 | 0 |

## Problems

None.

## Existence (reported only)

- `docs/plans/202611/1008-plan-design-owner-plan.md:487` — TASK 3: `bindRunPublication` is not in `.bkit/core/engine/commands/workflow/tracker.ts`
- `docs/plans/202611/1008-plan-design-owner-plan.md:488` — TASK 3: `runPublicationFile` is not in `.bkit/core/engine/commands/workflow/tracker.ts`
- `docs/plans/202611/1008-plan-design-owner-plan.md:509` — TASK 4: `endedRunActionKey` is not in `.bkit/core/engine/commands/workflow/tracker.ts`

## Planned test names already in use (reported only)

- `docs/plans/202611/1008-plan-design-owner-plan.md:494` TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "start with --session-dir writes the session's link as progress on the workflow-started row" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:494` TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "a resumed start with another session keeps the run's first link" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:494` TASK 3: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "start with a session folder that holds no progress id writes the row without progress and records association friction" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:494` TASK 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` already holds a test named "keeps one progress comment when the status file moves to the main checkout" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:494` TASK 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` already holds a test named "keeps one progress comment across checkouts for a run started with no session" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:517` TASK 4: `.bkit/core/engine/commands/workflow/tracker.test.ts` already holds a test named "runActionKey names the latest run after it ended" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:517` TASK 4: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` already holds a test named "joins the run's progress comment with the Owner Answers after workflows close" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1008-plan-design-owner-plan.md:517` TASK 4: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` already holds a test named "keeps two Owner Answers rounds in one comment after a terminal close comment" — name the update to it in TEST FIRST, or give the new test a new name

## Tests that change hands (reported only)

- `docs/plans/202611/1008-plan-design-owner-plan.md:534` TASK 7 takes over "keeps one progress comment when the status file moves to the main checkout" in `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` from TASK 3 (same group: one test, one baseline)
