Problems: 0
Existence: 2

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`. Caps: 3 tasks and 15 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Publish setting, repo info and advisories | 3 | 13 | 4.9 |
| 2 | Runtime publish resolution and summary line | 2 | 12 | 4.2 |
| 3 | Install seed and the retired-lite migration | 3 | 15 | 8.6 |
| 4 | Lite payload removal and uninstall doctrine | 2 | 1 | 2.0 |
| 5 | Close row, telemetry ending and stats view | 2 | 11 | 4.5 |
| 6 | Build workflow branch and gates | 2 | 14 | 6.9 |
| 7 | Guidance retirement | 2 | 8 | 5.5 |
| 8 | Dist, dogfood mirrors and the gate | 1 | 0 | 1.5 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 5 | 1 |
| 2 | 1 | 2 | 1 |
| 3 | 1 | 6 | 2 |
| 4 | 2 | 7 | 1 |
| 5 | 2 | 5 | 2 |
| 6 | 3 | 4 | 1 |
| 7 | 3 | 10 | 2 |
| 17 | 3 | 1 | 1 |
| 8 | 4 | 0 | 0 |
| 9 | 4 | 1 | 1 |
| 10 | 5 | 6 | 2 |
| 11 | 5 | 5 | 3 |
| 12 | 6 | 10 | 3 |
| 13 | 6 | 4 | 2 |
| 14 | 7 | 5 | 3 |
| 15 | 7 | 3 | 1 |
| 16 | 8 | 0 | 0 |

## Problems

None.

## Existence (reported only)

- `docs/plans/202610/715-retire-lite-workflows-plan.md:826` — TASK 7: `migrateShortcutsToLite` is not in `.bkit/core/engine/install/modules/core.ts`
- `docs/plans/202610/715-retire-lite-workflows-plan.md:832` — TASK 7: `migrateShortcutsToLite` is not in `.bkit/core/engine/install/modules/core.ts`
