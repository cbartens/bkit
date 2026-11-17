Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" | no row | passed |
| 12 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP" | red | passed |
| 13 | `.bkit/core/engine/install/modules/index.integration.test.ts` "the codex hook denies bkit tests jump when .codex is a symlinked folder" | red | passed |
| 14 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 14 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" — passed at the group's red, and the tests step accepted it: TASK 11 fix (mkdir || -d) is already in the template, so 16 takes x 50 folders all exit 0; no red is due

## Unproven

- Task 11 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" — no tests step recorded a red for it (`bkit tests red --group=4`); the owner answers it at the end of the build
