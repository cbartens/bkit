Problems: 0
Existence: 10

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202611/864-move-project-docs-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Template ownership and index registration | 3 | 11 | 12.4 |
| 2 | Responsibility guidance, warnings and verification | 5 | 8 | 11.1 |
| 3 | Repair the blocked advisory test | 1 | 1 | 1.5 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 6 | 3 |
| 2 | 1 | 4 | 3 |
| 8 | 1 | 1 | 1 |
| 3 | 2 | 0 | 0 |
| 4 | 2 | 0 | 0 |
| 5 | 2 | 4 | 2 |
| 6 | 2 | 4 | 3 |
| 7 | 2 | 0 | 0 |
| 9 | 3 | 1 | 1 |

## Problems

None.

## Existence (reported only)

- `docs/plans/202611/864-move-project-docs-plan.md:336` — TASK 1: `.bkit/shared/docs/architecture.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:337` — TASK 1: `.bkit/shared/docs/technology.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:338` — TASK 1: `.bkit/shared/docs/security.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:339` — TASK 1: `.bkit/shared/docs/data-schema.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:340` — TASK 1: `.bkit/shared/docs/testing.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:341` — TASK 1: `.bkit/shared/docs/deployments.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:342` — TASK 1: `.bkit/shared/docs/observability.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:343` — TASK 1: `.bkit/shared/docs/design.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:344` — TASK 1: `.bkit/shared/docs/noise.md` does not exist
- `docs/plans/202611/864-move-project-docs-plan.md:345` — TASK 1: `.bkit/shared/docs/setup.md` does not exist

## Planned test names already in use (reported only)

- `docs/plans/202611/864-move-project-docs-plan.md:361` TASK 1: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "ships ten optional document starters on fresh install" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:361` TASK 1: `.bkit/core/engine/commands/install/install.integration.test.ts` already holds a test named "preserves the contents of a legacy managed document when reinstalling" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:361` TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "migrates legacy ownership without changing project text or core ownership" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:361` TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "preserves ambiguous legacy markers and reports cleanup without blocking check" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:361` TASK 1: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "previews project document migration without mutating the checkout" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:361` TASK 1: `.bkit/core/engine/commands/install/uninstall.integration.test.ts` already holds a test named "preserves project document copies on full uninstall" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:406` TASK 8: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "leaves project docs, the index and the version file unchanged when upgrade runs twice" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:470` TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` already holds a test named "distinguishes missing and empty project documentation from populated candidates" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:470` TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` already holds a test named "recognizes current and migrated untouched starters" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:470` TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` already holds a test named "resolves an indexed equivalent without a missing default warning" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202611/864-move-project-docs-plan.md:470` TASK 5: `.bkit/core/engine/checks/after/index.test.ts` already holds a test named "reports and suppresses project documentation advisories without a blocker" — name the update to it in TEST FIRST, or give the new test a new name
