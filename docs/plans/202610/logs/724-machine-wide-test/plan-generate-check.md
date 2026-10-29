Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/logs/724-machine-wide-test/plan-v1-draft.md`. Caps: 3 tasks and 15 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Machine lock script | 3 | 11 | 7.5 |
| 2 | `bkit tests run` takes the tests lock | 2 | 9 | 5.4 |
| 3 | bkit's own raw vitest runs queue too | 1 | 8 | 3.5 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 7 | 1 |
| 2 | 1 | 4 | 1 |
| 3 | 1 | 0 | 0 |
| 4 | 2 | 8 | 1 |
| 5 | 2 | 1 | 1 |
| 6 | 3 | 8 | 2 |

## Problems

None.

## Existence (refuses the plan)

None.
