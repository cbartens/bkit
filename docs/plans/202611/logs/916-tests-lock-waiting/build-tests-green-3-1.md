Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a jump marker moves its waiting run to the front of the line" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the newest jump marker goes first" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a jump marker that matches no waiting run is deleted" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a jumped run that gives up and asks again within 120 s keeps the front" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests jump moves a waiting run to the front of the tests line" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests jump refuses a run name no waiting run carries" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests jump refuses a run name two waiting runs share" | red | passed |
| 9 | `.bkit/core/engine/install/modules/index.integration.test.ts` "bkit tests jump asks the human on claude, opencode, cursor and antigravity and is denied on codex" | red | passed |
| 9 | `.bkit/core/engine/install/modules/index.integration.test.ts` "path-prefixed bkit tests jump forms get the same verdicts on every host" | red | passed |

## Gaps

None.
