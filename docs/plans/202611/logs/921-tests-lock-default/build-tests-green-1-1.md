Enforced: true
Verdict: CONCERNS
Gaps: 1
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
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | red | not passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "an invalid slots value falls back to the core-count default and names it" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with no working core probe, slots unset gives one slot" | passed-accepted | passed |

## Gaps

- Task 1 `not-green` — "a set BKIT_TEST_SLOTS overrides the core-count default both ways" failure: process exited before acquired: [machine-lock] ⏳ three c is waiting for tests (up to 1s), 1st in line: in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86080, since 20:42:36), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86163, since 20:42:37), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86175, since 20:42:37), no earlier run
[machine-lock] ❌ three c gave up after 1s waiting for tests, in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86080, since 20:42:36), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86163, since 20:42:37), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86175, since 20:42:37), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.
 — Fixable: true — log: TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` — not-green — Fixable: true

## Already landed

- Task 1 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset on 7 cores, a second run waits behind the first" — passed at the group's red, and the tests step accepted it: the current default is already 1 slot, so it holds before the change and guards the threshold; no red is due
- Task 1 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with no working core probe, slots unset gives one slot" — passed at the group's red, and the tests step accepted it: the current default is already 1 slot, so it holds before the change; no red is due

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```
     ✓ run exits 73 naming the queue folder when no ticket can be written 281ms
     ✓ a try while a run waits first in line reports busy even when the lock is free 626ms
     ✓ the waiting note says where the run is in line 755ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 1415ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1483ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 2201ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 2104ms
     ✓ a jump marker moves its waiting run to the front of the line 1180ms
     ✓ the newest jump marker goes first 960ms
     ✓ a jump marker that matches no waiting run is deleted 653ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 2206ms
     ✓ concurrent first takes on a fresh cache exit 0 with no cannot-create refusal 95040ms
     ✓ a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 1149ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > a set BKIT_TEST_SLOTS overrides the core-count default both ways
Error: process exited before acquired: [machine-lock] ⏳ three c is waiting for tests (up to 1s), 1st in line: in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86080, since 20:42:36), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86163, since 20:42:37), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86175, since 20:42:37), no earlier run
[machine-lock] ❌ three c gave up after 1s waiting for tests, in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86080, since 20:42:36), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86163, since 20:42:37), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 86175, since 20:42:37), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.

 ❯ waitForOutput .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:222:13
    220|     if ((process.output.stdout + process.output.stderr).includes(text)…
    221|     if (process.child.exitCode !== null || process.child.signalCode !=…
    222|       throw new Error(`process exited before ${text}: ${process.output…
       |             ^
    223|     }
    224|     await delay(20);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:377:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 73 passed (74)
   Start at  20:42:25
   Duration  174.31s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-DZZTUq/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
