Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/logs/849-keep-local-dev/plan-v1-draft.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Sync core and the two existing sync verbs | 4 | 24 | 10.5 |
| 2 | Every `dev`-pushing verb reports `localDev` | 4 | 16 | 8.9 |
| 3 | Workflow display, ship Step 13 retirement and generated files | 3 | 7 | 6.5 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 9 | 1 |
| 2 | 1 | 9 | 1 |
| 3 | 1 | 5 | 2 |
| 4 | 1 | 1 | 1 |
| 5 | 2 | 5 | 1 |
| 6 | 2 | 5 | 1 |
| 7 | 2 | 4 | 3 |
| 8 | 2 | 2 | 1 |
| 9 | 3 | 3 | 1 |
| 10 | 3 | 4 | 3 |
| 11 | 3 | 0 | 0 |

## Problems

None.

## Existence (refuses the plan)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/logs/849-keep-local-dev/plan-v1-draft.md:634` TASK 3: `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` already holds a test named "bkit-design.md local close squash > lands past another session's uncommitted edit to a file the close changes, and keeps the edit" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/logs/849-keep-local-dev/plan-v1-draft.md:707` TASK 7: `.bkit/core/engine/commands/workflow/workflows.test.ts` already holds a test named "bkit workflows handover > --push on dev hands the landed record back, so local dev fast-forwards onto it" — name the update to it in TEST FIRST, or give the new test a new name
