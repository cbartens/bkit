Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Holistic allowance, base and report numbers | 5 | 12 | 7.9 |
| 2 | Changed-files test runs and the verify-limit migration | 4 | 9 | 5.4 |
| 3 | Push proof and docs | 3 | 5 | 4.2 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 3 | 3 |
| 2 | 1 | 4 | 1 |
| 3 | 1 | 2 | 2 |
| 4 | 1 | 1 | 1 |
| 5 | 1 | 2 | 1 |
| 6 | 2 | 5 | 1 |
| 7 | 2 | 2 | 1 |
| 8 | 2 | 1 | 1 |
| 9 | 2 | 1 | 1 |
| 10 | 3 | 3 | 1 |
| 11 | 3 | 2 | 1 |
| 12 | 3 | 0 | 0 |

## Problems

None.

## Existence (refuses the plan)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/logs/951-build-repeat-whole/plan-v1-draft.md:660` TASK 11: `.bkit/core/engine/commands/ci/push-gate.test.ts` already holds a test named "rejects new code, a mixed push, new branches with code, and non-ancestor old heads" — name the update to it in TEST FIRST, or give the new test a new name
