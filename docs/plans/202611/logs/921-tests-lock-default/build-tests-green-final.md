Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/921-tests-lock-default-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset on 10 cores, two runs hold tests at once and a third waits naming both" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset on 7 cores, a second run waits behind the first" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset, BKIT_TEST_WORKERS follows the core-count slots" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "an invalid slots value falls back to the core-count default and names it" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with no working core probe, slots unset gives one slot" | passed-accepted | passed |
| 5 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | passed-accepted | passed |
| 7 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "with slots unset on 10 cores, the global setup waits for a held tests lock" | red | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset on 7 cores, a second run waits behind the first" — passed at the group's red, and the tests step accepted it: the current default is already 1 slot, so it holds before the change and guards the threshold; no red is due
- Task 1 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" — passed at the group's red, and the tests step accepted it: rewritten in place by TASK 5 after the script change landed; the corrected setup passes (74 tests); no red is due
- Task 1 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with no working core probe, slots unset gives one slot" — passed at the group's red, and the tests step accepted it: the current default is already 1 slot, so it holds before the change; no red is due
- Task 5 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" — passed at the group's red, and the tests step accepted it: the script override already exists; the test now stops the override-one holder before the three-slot half, and the file passes (74 tests); no red is due
