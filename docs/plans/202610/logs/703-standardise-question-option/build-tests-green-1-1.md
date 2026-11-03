Enforced: true
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/703-standardise-question-option-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "compose letters every option and the recommended one" | recorded 2026-10-26T08:01:34Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "parseDecisionItems keeps the bare option name, dropping the letter" | recorded 2026-10-26T08:01:43Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "a decision file written before the letters still parses" | recorded 2026-10-26T08:01:53Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "--loop letters the loop question's options and recommendation" | recorded 2026-10-26T08:01:59Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "--defer letters the options in the deferral row" | recorded 2026-10-26T08:02:08Z | no | passed |
| 1 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "a lettered recommendation still settles its item by name" | recorded 2026-10-26T08:02:14Z | no | passed |

## Gaps

None.
