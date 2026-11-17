Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 4, attempt 3

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "runs that take a lock at once on a fresh cache never refuse over the queue folder" | missing | "runs that take a lock at once on a fresh cache never refuse over the queue folder" did not run; the report holds "machine lock slots, order and wait budgets > reports a remaining numbered slot under bash -e after the primary slot is released", "machine lock slots, order and wait budgets > with N slots, N runs hold a named lock at once and run N+1 waits naming every holder", "machine lock slots, order and wait budgets > a slots value that is not a whole number >= 1 falls back to 1 and says so", "machine lock slots, order and wait budgets > the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one", "machine lock slots, order and wait budgets > a killed tests-lock holder frees its slot within a second and the waiter starts", … |
| 14 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "concurrent first takes on a fresh cache exit 0 with no cannot-create refusal" | passed-accepted | passes; accepted by the tests step: TASK 11 fix (mkdir \|\| -d) is already in the template, so 16 takes x 50 folders all exit 0 |

## Gaps

- TASK 11 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "runs that take a lock at once on a fresh cache never refuse over the queue folder" `missing` — "runs that take a lock at once on a fresh cache never refuse over the queue folder" did not run; the report holds "machine lock slots, order and wait budgets > reports a remaining numbered slot under bash -e after the primary slot is released", "machine lock slots, order and wait budgets > with N slots, N runs hold a named lock at once and run N+1 waits naming every holder", "machine lock slots, order and wait budgets > a slots value that is not a whole number >= 1 falls back to 1 and says so", "machine lock slots, order and wait budgets > the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one", "machine lock slots, order and wait budgets > a killed tests-lock holder frees its slot within a second and the waiter starts", …

## Lint output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

[test-timeout-budget] load average 13.1 on 10 cores: unit limits 11050ms per test, 22100ms per hook (x2.21)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting

 ✓ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (68 tests) 150384ms
   ✓ machine lock slots, order and wait budgets (11)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 358ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 2232ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 909ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 678ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 3668ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 3090ms
   ✓ bkit-machine-lock.sh (34)
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 1559ms
     ✓ a killed holder leaves no stale lock 402ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2351ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 1933ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 390ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 326ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2043ms
     ✓ preserves fragmented successful FIFO re… 1374ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2477ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1281ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 387ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 369ms
   ✓ machine lock waiting order (23)
     ✓ tests-lock waiters run their commands in arrival order 1066ms
     ✓ stack-lock waiters run their commands in arrival order 698ms
     ✓ a run that releases the lock and asks again queues behind runs already waiting 1025ms
     ✓ with two slots, waiters take freed slots in arrival order 2188ms
     ✓ queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 2296ms
     ✓ a waiter that gives up leaves the line and the runs behind it keep their order 2241ms
     ✓ a waiter whose caller is killed leaves the line and the runs behind it keep their order 607ms
     ✓ a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 2238ms
     ✓ a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 2208ms
     ✓ a try while a run waits first in line reports busy even when the lock is free 318ms
     ✓ the waiting note says where the run is in line 488ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 890ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1141ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 1763ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 2124ms
     ✓ a jump marker moves its waiting run to the front of the line 736ms
     ✓ the newest jump marker goes first 469ms
     ✓ a jump marker that matches no waiting run is deleted 380ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 2341ms
     ✓ concurrent first takes on a fresh cache exit 0 with no cannot-create refusal 94496ms
     ✓ a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 1040ms

 Test Files  1 passed (1)
      Tests  68 passed (68)
   Start at  08:50:34
   Duration  150.59s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-W8dnS3/junit.xml
```
