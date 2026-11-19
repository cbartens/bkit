Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Refuse audit files in `[skip ci]` pushes to `main` | 3 | 13 | 6.1 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 7 | 1 |
| 2 | 1 | 6 | 1 |
| 3 | 1 | 0 | 0 |

## Problems

None.

## Existence (reported only)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/1031-pre-push-refuses-plan.md:216` TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` already holds a test named "audit report to dev under a [skip ci] head → allowed, light gate" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/1031-pre-push-refuses-plan.md:216` TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` already holds a test named "audit-template project section to dev under a [skip ci] head → allowed, light gate" — name the update to it in TEST FIRST, or give the new test a new name
