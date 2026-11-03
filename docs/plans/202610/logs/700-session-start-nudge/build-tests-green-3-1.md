Enforced: true
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/700-session-start-nudge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 6 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "opencode plugin keeps the advisory for the next call when the first result is missing" | recorded 2026-10-26T14:20:33Z | no | passed |
| 6 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` "the 1.x driver keeps the advisory when the first output is not an object" | recorded 2026-10-26T14:20:36Z | no | passed |
| 7 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a failed commit leaves no row staged in the index" | recorded 2026-10-26T14:21:16Z | no | passed |

## Gaps

None.
