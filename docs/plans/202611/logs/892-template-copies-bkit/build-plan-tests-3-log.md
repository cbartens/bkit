Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 5: bkit:gate:format = "pnpm lint-staged" from .bkit/core/engine/install/manifest.ts:242
SOURCE — TASK 6: LINT_STAGED_CONFIGS names from .bkit/core/engine/checks/tips/detect.ts:129
WROTE — TASK 5: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade writes no root lint-staged config for a consumer that relied on the nested sample`
WROTE — TASK 5: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade names the missing root lint-staged config with the copy command`
WROTE — TASK 6: `.bkit/core/engine/checks/tips/detect.test.ts` `hasLintStagedConfig is true for every config name lint-staged 17 reads`
WROTE — TASK 6: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts`
WROTE — TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when lint-staged is not a dependency`
WROTE — TASK 7: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path`
