Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/891-build-gate-stuck-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Engine evidence the pause reads | 4 | 9 | 8.5 |
| 2 | The base check | 3 | 22 | 10.7 |
| 3 | The pause's wording and engine support for the resume re-run | 3 | 13 | 5.9 |
| 4 | Workflow and prompt | 3 | 7 | 7.0 |
| 5 | Docs, generated files and mirrors | 1 | 0 | 1.6 |
| 6 | Challenge round 1 findings | 5 | 6 | 6.9 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 2 | 1 |
| 2 | 1 | 1 | 1 |
| 3 | 1 | 5 | 2 |
| 14 | 1 | 1 | 1 |
| 4 | 2 | 8 | 1 |
| 5 | 2 | 10 | 1 |
| 6 | 2 | 4 | 1 |
| 7 | 3 | 9 | 1 |
| 8 | 3 | 2 | 1 |
| 9 | 3 | 2 | 1 |
| 10 | 4 | 3 | 1 |
| 11 | 4 | 3 | 1 |
| 12 | 4 | 1 | 1 |
| 13 | 5 | 0 | 0 |
| 15 | 6 | 1 | 1 |
| 16 | 6 | 1 | 1 |
| 17 | 6 | 1 | 1 |
| 18 | 6 | 1 | 1 |
| 19 | 6 | 2 | 2 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/891-build-gate-stuck-plan.md:857` TASK 15: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` already holds a test named "bkit tests base > a pull_request-event CI run at the base sha does not settle none" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/891-build-gate-stuck-plan.md:875` TASK 17: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` already holds a test named "bkit tests base > a base file run that exits non-zero without the failing case reads unknown" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/891-build-gate-stuck-plan.md:884` TASK 18: `.bkit/core/engine/commands/workflow/tests-base.integration.test.ts` already holds a test named "bkit tests base > the base test run does not inherit the hooks-off git config" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/891-build-gate-stuck-plan.md:893` TASK 19: `.bkit/core/engine/commands/workflow/decisions.test.ts` already holds a test named "bkit decisions apply --by=rerun > refuses a file whose only Gate: FAIL line is in an item body" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/891-build-gate-stuck-plan.md:893` TASK 19: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "bkit workflows start — resume facts > openDecision gate ignores a Gate line below the header" — name the update to it in TEST FIRST, or give the new test a new name
