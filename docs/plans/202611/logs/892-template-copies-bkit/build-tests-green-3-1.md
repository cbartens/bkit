Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade writes no root lint-staged config for a consumer that relied on the nested sample" | red | passed |
| 5 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade names the missing root lint-staged config with the copy command" | red | passed |
| 6 | `.bkit/core/engine/checks/tips/detect.test.ts` "hasLintStagedConfig is true for every config name lint-staged 17 reads" | red | passed |
| 6 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when the consumer's config is lint-staged.config.ts" | red | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when lint-staged is not a dependency" | red | passed |
| 7 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade prints no missing lint-staged config line when the format gate passes lint-staged a config path" | red | passed |

## Gaps

None.
