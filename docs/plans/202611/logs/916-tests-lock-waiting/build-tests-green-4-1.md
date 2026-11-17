Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "runs that take a lock at once on a fresh cache never refuse over the queue folder" | red | not passed |
| 12 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP" | red | passed |
| 13 | `.bkit/core/engine/install/modules/index.integration.test.ts` "the codex hook denies bkit tests jump when .codex is a symlinked folder" | red | passed |

## Gaps

- Task 11 `not-green` — "runs that take a lock at once on a fresh cache never refuse over the queue folder" failure: expected [ …(350) ] to deeply equal [] — Fixable: true — log: TASK 11: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `runs that take a lock at once on a fresh cache never refuse over the queue folder` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```
+   "round 47 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2443, since 20:48:49), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2443, since 20:48:49), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2443, since 20:48:49), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2443, since 20:48:49), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2443, since 20:48:49), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2443, since 20:48:49), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 1st in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 3rd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2713, since 20:48:50), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2979, since 20:48:51), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by another run",
+   "round 49 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 49 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2979, since 20:48:51), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by another run",
+   "round 49 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2979, since 20:48:51), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 2979, since 20:48:51), no earlier run",
+ ]

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1589:64
    1587|       }
    1588|     }
    1589|     expect(refused.filter((line) => !/ exit 0: $/.test(line))).toEqual…
       |                                                                ^
    1590|   }, 600_000);
    1591|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 67 passed (68)
   Start at  20:47:20
   Duration  93.12s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-v7Scmu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
