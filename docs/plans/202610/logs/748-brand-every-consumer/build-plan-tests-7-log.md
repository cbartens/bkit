Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 20: shipped v6.0.0 bkit-trivy.yml job header and runs-on line from git show v6.0.0:.bkit/templates/.github/workflows/bkit-trivy.yml:35
SOURCE — TASK 21: renameScriptTokens signature and selector lookahead from .bkit/core/engine/install/modules/core.ts:810
SOURCE — TASK 22: shippedOld/CI_DIR helpers from .bkit/core/engine/install/modules/core.integration.test.ts (migrateBrandedTemplateFiles block)
WROTE — TASK 20: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedCheckNames (via runBkitDocs) > inserts no job name when a job-indent comment sits above the job's own name`
WROTE — TASK 21: `.bkit/core/engine/install/modules/core.test.ts` `renameScriptTokens leaves recursive flag forms alone`
WROTE — TASK 22: `.bkit/core/engine/install/modules/core.integration.test.ts` `migrateBrandedTemplateFiles (via runBkitDocs) > leaves a unit whose old path a composite action still names`
