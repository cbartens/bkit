Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 9: old workflow/job names from v6.0.0:.bkit/templates/.github/workflows/bkit-{cloud,renovate,trivy}.yml:3,16,14,96
SOURCE — TASK 9: new names from .bkit/templates/.github/workflows/bkit-cloud.yml:96,472,547 and bkit-renovate.yml:52, bkit-trivy.yml:36
SOURCE — TASK 9: old health stub block from v6.0.0:.bkit/templates/.github/workflows/bkit-ci.yml:1011-1015; current block .bkit/templates/.github/workflows/bkit-ci.yml:1015-1018
SOURCE — TASK 10: old House rules and .vale.ini from v6.0.0:.bkit/templates/.vale/styles/House/*.yml and .bkit/templates/.vale.ini
WROTE — TASK 9: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones`
WROTE — TASK 9: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix`
WROTE — TASK 9: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one`
WROTE — TASK 9: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > rewrites the old health stub in a custom bkit.testing.ciWorkflow file`
WROTE — TASK 9: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second check-name migration writes nothing`
WROTE — TASK 9: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a dry-run check-name migration writes and moves nothing`
WROTE — TASK 10: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House`
WROTE — TASK 10: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files`
WROTE — TASK 10: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House`
WROTE — TASK 10: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini`
WROTE — TASK 10: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `a second Vale migration and a dry run write nothing`
