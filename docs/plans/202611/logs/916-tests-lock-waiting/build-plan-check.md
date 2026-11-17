Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Arrival-ordered queue in the lock template | 5 | 19 | 16.2 |
| 2 | Upgrade migration replaces unedited adopted lock copies | 1 | 3 | 3.3 |
| 3 | A human-approved jump to the front of the tests line | 4 | 9 | 9.4 |
| 4 | Challenge round 1 findings | 4 | 3 | 6.1 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 5 | 1 |
| 2 | 1 | 7 | 2 |
| 3 | 1 | 5 | 1 |
| 4 | 1 | 2 | 1 |
| 5 | 1 | 0 | 0 |
| 6 | 2 | 3 | 1 |
| 7 | 3 | 4 | 1 |
| 8 | 3 | 3 | 1 |
| 9 | 3 | 2 | 1 |
| 10 | 3 | 0 | 0 |
| 11 | 4 | 1 | 1 |
| 12 | 4 | 1 | 1 |
| 13 | 4 | 1 | 1 |
| 14 | 4 | 0 | 0 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/916-tests-lock-waiting-plan.md:775` TASK 11: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" — name the update to it in TEST FIRST, or give the new test a new name
