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
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade copies the lint-staged sample to the root when the format gate runs lint-staged with no root config" | red | passed |
| 4 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade dry run reports the lint-staged config copy without writing it" | red | passed |

## Gaps

None.
