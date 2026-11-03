Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/748-brand-every-consumer-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > rewrites shipped old workflow names and leaves customised ones" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > logs each renamed check name with the branch-protection fix" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the renovate or trivy job already has one" | red | passed |
| 9 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > rewrites the old health stub in a custom bkit.testing.ciWorkflow file" | red | passed |
| 9 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second check-name migration writes nothing" | red | passed |
| 9 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a dry-run check-name migration writes and moves nothing" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves shipped Vale rules to Bkit and keeps own and edited rules in House" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > names Bkit rules in .vale.ini and lists both styles while House keeps files" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves every House rule and removes House" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > moves rules without a .vale.ini" | red | passed |
| 10 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "a second Vale migration and a dry run write nothing" | red | passed |

## Gaps

None.
