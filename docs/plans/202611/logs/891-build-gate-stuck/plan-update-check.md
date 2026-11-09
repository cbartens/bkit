Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Engine — record, accept and pass accepted test cases | 3 | 23 | 11.4 |
| 2 | Engine — list accepted cases, show them at ship, hand them to self-checks and pushes | 4 | 10 | 7.1 |
| 3 | Workflows and prompts — ask, pass and show the accepted cases | 5 | 12 | 11.4 |
| 4 | Docs and generated outputs | 1 | 0 | 2.8 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 5 | 1 |
| 2 | 1 | 9 | 3 |
| 3 | 1 | 9 | 2 |
| 4 | 2 | 4 | 1 |
| 5 | 2 | 2 | 1 |
| 6 | 2 | 2 | 1 |
| 7 | 2 | 2 | 1 |
| 8 | 3 | 5 | 1 |
| 9 | 3 | 3 | 1 |
| 10 | 3 | 1 | 1 |
| 11 | 3 | 2 | 1 |
| 12 | 3 | 1 | 1 |
| 13 | 4 | 0 | 0 |

## Problems

None.

## Existence (refuses the plan)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md:523` TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "reads names, outcomes and failure messages, decoding entities" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md:523` TASK 1: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "keeps a failure's text as detail, CDATA as written and tags stripped" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/logs/891-build-gate-stuck/plan-v2-reviewed.md:543` TASK 2: `scripts/harvest/bkit-harvest.test.mjs` already holds a test named "MARK_ROWS is the engine's" — name the update to it in TEST FIRST, or give the new test a new name
