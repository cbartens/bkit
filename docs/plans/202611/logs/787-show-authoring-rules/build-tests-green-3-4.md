Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

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
| 13 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" | red | not passed |

## Gaps

- Task 13 `not-green` — "upgrades shipped registrations without dropping consumer hook groups or permissions" failure: expected 2 to be 1 // Object.is equality — Fixable: true — log: TASK 13: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — not-green — Fixable: true

## Already landed

- Task 11 `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades shared hook behavior without replacing owned drivers" — passed at the group's red, and the tests step accepted it: fresh install and upgrade already keep the managed shell advice, customised driver bytes and custom Claude registration group (Tier-2 writeTier2 in the host modules); no red is due
- Task 12 `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "keeps rendered classification advice and acknowledgement equivalent" — passed at the group's red, and the tests step accepted it: all four shell adapters already give the same shared reminder, acknowledgement and unknown-target warning; OpenCode has no shell hook (stated exception); no red is due

## Runner output — `.bkit/core/engine/install/modules/core.integration.test.ts`

```
   ✓ migrateValeHouseStyle (via runBkitDocs) (6)
     ✓ moves shipped Vale rules to Bkit and keeps own and edited rules in House 8ms
     ✓ keeps House and an own entry named like a moved rule without .yml 8ms
     ✓ names Bkit rules in .vale.ini and lists both styles while House keeps files 8ms
     ✓ moves every House rule and removes House 8ms
     ✓ moves rules without a .vale.ini 7ms
     ✓ does not move rules into a symlinked Bkit directory 8ms
   ❯ shared hook behaviour footprint (fresh install and upgrade) (2)
     ✓ installs and upgrades shared hook behavior without replacing owned drivers 648ms
     × upgrades shipped registrations without dropping consumer hook groups or permissions 259ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/modules/core.integration.test.ts > shared hook behaviour footprint (fresh install and upgrade) > upgrades shipped registrations without dropping consumer hook groups or permissions
AssertionError: expected 2 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 2

 ❯ .bkit/core/engine/install/modules/core.integration.test.ts:2647:87
    2645|
    2646|     // No duplicate bkit group: each bkit hook command is registered o…
    2647|     expect(count(JSON.stringify(claudeAfter.hooks.PreToolUse), "bkit-g…
       |                                                                                       ^
    2648|     expect(
    2649|       count(JSON.stringify(JSON.parse(read(cursorPath)).hooks.preToolU…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 147 passed (148)
   Start at  08:13:18
   Duration  2.97s (tests 97%, import 1%, setup 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-TZxyRa/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
