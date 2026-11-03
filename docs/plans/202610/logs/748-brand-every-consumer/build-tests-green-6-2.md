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
| 15 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a workflow outside the path pass still names" | red | passed |
| 16 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the job sets name below another key" | red | passed |
| 17 | `.bkit/core/engine/install/modules/core.test.ts` "renameScriptTokens leaves package-selecting flag forms alone" | red | passed |
| 18 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedFileTokens (via runBkitDocs) > warns on an old script name in a workflow it does not rewrite" | red | passed |
| 19 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > does not write through a dangling bkit- target symlink" | red | passed |
| 19 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateBrandedTemplateFiles (via runBkitDocs) > leaves a symlinked old data file in place" | red | passed |
| 19 | `.bkit/core/engine/install/modules/core.integration.test.ts` "migrateValeHouseStyle (via runBkitDocs) > does not move rules into a symlinked Bkit directory" | red | passed |

## Gaps

None.
