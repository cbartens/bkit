Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/914-build-planned-test-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | The planned-test lock in the engine | 3 | 6 | 8.1 |
| 2 | `tests green`, the build workflow, prompts and docs | 4 | 7 | 8.7 |
| 3 | Challenge round 1 findings | 4 | 7 | 6.0 |
| 4 | Holistic fix — planned tests Task 11's add-only rule changed | 2 | 13 | 5.7 |
| 5 | Challenge round 2 findings | 5 | 8 | 7.1 |
| 6 | Verify fix — Task 11's planned test Task 18's refusal wording changed | 1 | 1 | 1.4 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 2 | 1 |
| 2 | 1 | 3 | 2 |
| 3 | 1 | 1 | 1 |
| 4 | 2 | 1 | 1 |
| 5 | 2 | 3 | 1 |
| 6 | 2 | 3 | 1 |
| 7 | 2 | 0 | 0 |
| 8 | 3 | 1 | 1 |
| 9 | 3 | 1 | 1 |
| 10 | 3 | 1 | 1 |
| 11 | 3 | 4 | 3 |
| 12 | 4 | 10 | 1 |
| 13 | 4 | 3 | 2 |
| 14 | 5 | 1 | 1 |
| 15 | 5 | 2 | 1 |
| 16 | 5 | 2 | 1 |
| 17 | 5 | 1 | 1 |
| 18 | 5 | 2 | 2 |
| 19 | 6 | 1 | 1 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/914-build-planned-test-plan.md:768` TASK 18: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` already holds a test named "the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/914-build-planned-test-plan.md:768` TASK 18: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "the exit 11 refusal says verify reads a BLOCKED change's added lines" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/914-build-planned-test-plan.md:786` TASK 19: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11" — name the update to it in TEST FIRST, or give the new test a new name
