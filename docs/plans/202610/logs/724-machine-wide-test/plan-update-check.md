Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/logs/724-machine-wide-test/plan-v2-reviewed.md`. Caps: 3 tasks and 15 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Machine lock script — named locks | 1 | 9 | 5.3 |
| 2 | Slots, lock order and template docs | 2 | 8 | 4.6 |
| 3 | `bkit tests run` takes the tests lock | 3 | 15 | 9.9 |
| 4 | Shipped hook and prompts run gates through `bkit tests run` | 2 | 3 | 4.4 |
| 5 | bkit's own raw vitest runs queue too | 2 | 11 | 4.9 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 9 | 1 |
| 2 | 2 | 8 | 1 |
| 3 | 2 | 0 | 0 |
| 4 | 3 | 4 | 1 |
| 5 | 3 | 10 | 1 |
| 6 | 3 | 1 | 1 |
| 7 | 4 | 2 | 1 |
| 8 | 4 | 1 | 1 |
| 9 | 5 | 8 | 1 |
| 10 | 5 | 3 | 1 |

## Problems

None.

## Existence (refuses the plan)

None.
