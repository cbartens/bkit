Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 15: old unit files from v6.0.0:.bkit/templates/scripts/ci/check-dependency-audit*.mjs via shippedOld in .bkit/core/engine/install/modules/core.integration.test.ts:1768
SOURCE — TASK 16: old trivy workflow from v6.0.0:.bkit/templates/.github/workflows/bkit-trivy.yml:34-36
SOURCE — TASK 18: warn calls from migrateBrandedFileTokens in .bkit/core/engine/install/modules/core.ts:908
WROTE — TASK 15: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a workflow outside the path pass still names`
WROTE — TASK 16: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when the job sets name below another key`
WROTE — TASK 17: `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens leaves package-selecting flag forms alone`
WROTE — TASK 18: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedFileTokens (via runBkitDocs) > warns on an old script name in a workflow it does not rewrite`
WROTE — TASK 19: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > does not write through a dangling bkit- target symlink`
WROTE — TASK 19: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a symlinked old data file in place`
WROTE — TASK 19: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateValeHouseStyle (via runBkitDocs) > does not move rules into a symlinked Bkit directory`
