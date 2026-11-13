Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/install/modules/core.test.ts` "keeps shipped authoring pointers in their editor context" | red | passed |
| 11 | `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades shared hook behavior without replacing owned drivers" | passed-accepted | passed |
| 12 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "keeps rendered classification advice and acknowledgement equivalent" | passed-accepted | passed |
| 12 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "bounds rendered cold-start time and complete response size" | red | passed |
| 13 | `.bkit/core/engine/install/write.test.ts` "merges managed lists while keeping consumer-added entries" | red | passed |
| 13 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" | vacuous | passed |

## Gaps

None.

## Already landed

- Task 11 `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades shared hook behavior without replacing owned drivers" — passed at the group's red, and the tests step accepted it: fresh install and upgrade already keep the managed shell advice, customised driver bytes and custom Claude registration group (Tier-2 writeTier2 in the host modules); no red is due
- Task 12 `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "keeps rendered classification advice and acknowledgement equivalent" — passed at the group's red, and the tests step accepted it: all four shell adapters already give the same shared reminder, acknowledgement and unknown-target warning; OpenCode has no shell hook (stated exception); no red is due

## Unproven

- Task 13 `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
