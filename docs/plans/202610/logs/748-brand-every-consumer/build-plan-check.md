Problems: 0
Existence: 3

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Rename bkit-powered package.json scripts and template files | 3 | 12 | 14.3 |
| 2 | Migrate script names; brand check names | 2 | 14 | 7.6 |
| 3 | Brand the Vale style; migrate hook and CI tokens and CI script files | 5 | 14 | 14.2 |
| 4 | Check-name and Vale migrations | 2 | 11 | 6.3 |
| 5 | Rule, docs, mirrors and dogfood | 2 | 0 | 5.2 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 4 | 3 |
| 2 | 1 | 2 | 2 |
| 3 | 1 | 6 | 3 |
| 4 | 2 | 9 | 3 |
| 5 | 2 | 5 | 2 |
| 6 | 3 | 6 | 3 |
| 7 | 3 | 3 | 2 |
| 8 | 3 | 3 | 2 |
| 13 | 3 | 1 | 1 |
| 14 | 3 | 1 | 1 |
| 9 | 4 | 6 | 2 |
| 10 | 4 | 5 | 2 |
| 11 | 5 | 0 | 0 |
| 12 | 5 | 0 | 0 |

## Problems

None.

## Existence (reported only)

- `docs/plans/202610/748-brand-every-consumer-plan.md:573` — TASK 2: `.bkit/templates/scripts/launchd/ai.bkit.launchd.plist` does not exist
- `docs/plans/202610/748-brand-every-consumer-plan.md:574` — TASK 2: `.bkit/templates/scripts/launchd/launchd.env.example` does not exist
- `docs/plans/202610/748-brand-every-consumer-plan.md:770` — TASK 8: `migrateShortcutsToLite` is not in `.bkit/core/engine/install/modules/core.ts`

## Planned test names already in use (reported only)

- `docs/plans/202610/748-brand-every-consumer-plan.md:581` TASK 2: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` already holds a test named "this repo adopts its own templates > every template has an entry, and every entry is a template" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:581` TASK 2: `.bkit/core/engine/audits/templates/templates-content.test.ts` already holds a test named "bkit-launchd.plist > is a LaunchAgent that loads at login and re-runs on env-file writes" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:623` TASK 3: `.bkit/core/engine/audits/templates/templates-content.test.ts` already holds a test named "lists the graphify scripts under bkit:graph names" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:623` TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` already holds a test named "consumer-facing names carry the bkit prefix > template script names that run bkit code" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:623` TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` already holds a test named "consumer-facing names carry the bkit prefix > flags a seeded unprefixed script name that runs bkit code" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:623` TASK 3: `.bkit/core/engine/audits/templates/branding.test.ts` already holds a test named "consumer-facing names carry the bkit prefix > template file names" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:623` TASK 3: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` already holds a test named "this repo adopts its own templates > scripts/graphify/bkit-graphify.sh" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:623` TASK 3: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` already holds a test named "this repo adopts its own templates > scripts/graphify/bkit-graphify-rollup.py" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:754` TASK 7: `.bkit/core/engine/install/modules/core.integration.test.ts` already holds a test named "migrateBrandedFileTokens (via runBkitDocs) > rewrites old script tokens in husky hooks and the CI workflow" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:754` TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "copy-and-own migration writes record no canonical hash and a second upgrade writes nothing" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:754` TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "a dry-run hook and CI token migration writes nothing" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:774` TASK 8: `.bkit/core/engine/install/modules/core.integration.test.ts` already holds a test named "migrateBrandedTemplateFiles (via runBkitDocs) > moves shipped CI script units to bkit- names and rewrites their paths" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:774` TASK 8: `.bkit/core/engine/install/modules/core.integration.test.ts` already holds a test named "migrateBrandedTemplateFiles (via runBkitDocs) > leaves an edited or already-renamed unit and logs the manual move" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/748-brand-every-consumer-plan.md:774` TASK 8: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` already holds a test named "a second template-file migration and a dry run write and move nothing" — name the update to it in TEST FIRST, or give the new test a new name
