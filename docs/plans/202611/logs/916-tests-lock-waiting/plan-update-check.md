Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Arrival-ordered queue in the lock template | 5 | 19 | 16.1 |
| 2 | Upgrade report names the cost of a stale lock copy | 1 | 1 | 1.4 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 5 | 1 |
| 2 | 1 | 7 | 2 |
| 3 | 1 | 5 | 1 |
| 4 | 1 | 2 | 1 |
| 5 | 1 | 0 | 0 |
| 6 | 2 | 1 | 1 |

## Problems

None.

## Existence (refuses the plan)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/logs/916-tests-lock-waiting/plan-v2-reviewed.md:516` TASK 3: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a runner started by the holder does not wait on its parent" — name the update to it in TEST FIRST, or give the new test a new name
