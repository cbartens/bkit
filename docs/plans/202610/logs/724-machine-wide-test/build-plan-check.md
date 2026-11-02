Problems: 4
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Machine lock script — named locks | 1 | 10 | 6.2 |
| 2 | Slots, lock order, no-TTY wait and template docs | 2 | 10 | 6.9 |
| 3 | `bkit tests run` and `bkit tests changed` read the tests-lock outcome of a wrapped gate | 3 | 21 | 16.0 |
| 4 | bkit's gates take the tests lock; workflows route exit 81 | 3 | 7 | 11.0 |
| 5 | bkit's own raw vitest runs queue too | 2 | 10 | 4.8 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 10 | 1 |
| 2 | 2 | 10 | 1 |
| 3 | 2 | 0 | 0 |
| 4 | 3 | 6 | 1 |
| 5 | 3 | 10 | 1 |
| 10 | 3 | 5 | 3 |
| 6 | 4 | 2 | 2 |
| 7 | 4 | 2 | 1 |
| 11 | 4 | 3 | 2 |
| 8 | 5 | 7 | 1 |
| 9 | 5 | 3 | 1 |

## Problems

- `docs/plans/202610/724-machine-wide-test-plan.md:931` `format` — TASK 11: UPDATE is neither `symbol` in `file`: what nor `file`: what
- `docs/plans/202610/724-machine-wide-test-plan.md:932` `format` — TASK 11: UPDATE is neither `symbol` in `file`: what nor `file`: what
- `docs/plans/202610/724-machine-wide-test-plan.md:934` `inventory` — TASK 11: CREATE in `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` has no NEW row naming it in the Reuse Inventory's File column
- `docs/plans/202610/724-machine-wide-test-plan.md:939` `format` — TASK 11: UPDATE is neither `symbol` in `file`: what nor `file`: what

## Existence (reported only)

None.
