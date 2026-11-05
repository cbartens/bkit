Problems: 0
Existence: 2

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Tracker-aware session guard — `terminal` fact, GitHub + Linear (WS-1, WS-2) | 2 | 10 | 5.7 |
| 2 | Session guard — Jira branch, no-id line, Claude trigger (WS-2) | 1 | 6 | 3.4 |
| 3 | Install engine — `codex` variant and wired-tracker rule (WS-3) | 5 | 15 | 8.9 |
| 4 | Router context job — `BKIT_` secrets and one agent (WS-4) | 1 | 8 | 4.1 |
| 5 | Router context job — tracker-agnostic gate and summary (WS-4) | 2 | 12 | 6.4 |
| 6 | Router dev arm and agent jobs (WS-4, WS-5) | 3 | 15 | 9.2 |
| 7 | Post-install checks (WS-7) | 2 | 14 | 6.0 |
| 8 | `cloud` tip and docs (WS-7, WS-8) | 3 | 2 | 6.0 |
| 9 | Mirrors and full verification | 1 | 0 | 1.7 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 5 | 2 |
| 2 | 1 | 5 | 1 |
| 3 | 2 | 6 | 1 |
| 4 | 3 | 3 | 2 |
| 5 | 3 | 5 | 2 |
| 6 | 3 | 6 | 2 |
| 19 | 3 | 1 | 1 |
| 20 | 3 | 0 | 0 |
| 7 | 4 | 8 | 2 |
| 8 | 5 | 10 | 2 |
| 9 | 5 | 2 | 1 |
| 10 | 6 | 6 | 1 |
| 11 | 6 | 1 | 1 |
| 12 | 6 | 8 | 1 |
| 13 | 7 | 7 | 1 |
| 14 | 7 | 7 | 1 |
| 15 | 8 | 2 | 1 |
| 16 | 8 | 0 | 0 |
| 17 | 8 | 0 | 0 |
| 18 | 9 | 0 | 0 |

## Problems

None.

## Existence (reported only)

- `docs/plans/202610/719-cloud-variants-add-plan.md:657` — TASK 2: `.bkit/core/hooks/preflight-linear.sh` does not exist
- `docs/plans/202610/719-cloud-variants-add-plan.md:740` — TASK 6: `validateCloudTrackerMatch` is not in `.bkit/core/engine/commands/install/install.ts`

## Planned test names already in use (reported only)

- `docs/plans/202610/719-cloud-variants-add-plan.md:660` TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` already holds a test named "github issue without bkit:auto stops the Cursor background session" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:660` TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` already holds a test named "github closed issue stops the session and an open labelled one passes" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:660` TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` already holds a test named "github read failure stops the session naming the tracker and the reason" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:660` TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` already holds a test named "linear completed state renamed Shipped stops the session" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:660` TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` already holds a test named "generated Claude and Cursor hooks carry the one preflight-tracker.sh part" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:749` TASK 6: `.bkit/core/engine/commands/install/install.test.ts` already holds a test named "validateCloudTrackerWired passes %s with %s" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:749` TASK 6: `.bkit/core/engine/commands/install/install.test.ts` already holds a test named "validateCloudTrackerWired refuses tracker none naming --tracker=" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:749` TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "--auto=codex without .codex/ exits 1 naming --codex and writes nothing" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:749` TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "--tracker=jira --codex --auto=codex exits 0 and records codex" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:749` TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "--tracker=github --auto=cursor exits 0 and records cursor" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:749` TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/719-cloud-variants-add-plan.md:766` TASK 19: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "--tracker=jira --codex --auto=codex exits 0 and records codex" — name the update to it in TEST FIRST, or give the new test a new name
