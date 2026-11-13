Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/912-debug-loop-question-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | An honest loop trend in the engine | 3 | 12 | 7.8 |
| 2 | A failure count for the CI evidence round | 4 | 11 | 7.1 |
| 3 | Loop questions, docs and generated copies | 3 | 5 | 6.0 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 3 | 2 |
| 2 | 1 | 4 | 1 |
| 3 | 1 | 5 | 1 |
| 4 | 2 | 5 | 2 |
| 5 | 2 | 3 | 3 |
| 6 | 2 | 2 | 2 |
| 10 | 2 | 1 | 1 |
| 7 | 3 | 3 | 1 |
| 8 | 3 | 2 | 1 |
| 9 | 3 | 0 | 0 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/912-debug-loop-question-plan.md:605` TASK 6: `.bkit/core/engine/commands/workflow/steps.test.ts` already holds a test named "finishes a CI round only with its own failed job count" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/912-debug-loop-question-plan.md:605` TASK 6: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` already holds a test named "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/912-debug-loop-question-plan.md:617` TASK 10: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` already holds a test named "Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown" — name the update to it in TEST FIRST, or give the new test a new name
