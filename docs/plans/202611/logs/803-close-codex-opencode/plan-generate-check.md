Problems: 0
Existence: 0

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/logs/803-close-codex-opencode/plan-v1-draft.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | OpenCode generated fetch grants (`deferrals-1`, `deferrals-11`) | 2 | 9 | 5.8 |
| 2 | Uninstall cleanup by recorded evidence (`deferrals-11`) | 1 | 4 | 2.6 |
| 3 | Codex private-key shell reads (`deferrals-3`) | 3 | 4 | 5.1 |
| 4 | Cloud allowlist fingerprint (`deferrals-11`) | 3 | 12 | 6.3 |
| 5 | Mirrors, bkit's own copies and test docs | 1 | 0 | 1.8 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 4 | 2 |
| 2 | 1 | 5 | 2 |
| 3 | 2 | 4 | 1 |
| 4 | 3 | 3 | 1 |
| 5 | 3 | 0 | 0 |
| 6 | 3 | 1 | 1 |
| 7 | 4 | 3 | 2 |
| 8 | 4 | 5 | 1 |
| 9 | 4 | 4 | 2 |
| 10 | 5 | 0 | 0 |

## Problems

None.

## Existence (refuses the plan)

None.

## Planned test names already in use (reported only)

- `docs/plans/202611/logs/803-close-codex-opencode/plan-v1-draft.md:568` TASK 1: `.bkit/core/engine/install/modules/opencode.integration.test.ts` already holds a test named "permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated" — name the update to it in TEST FIRST, or give the new test a new name
