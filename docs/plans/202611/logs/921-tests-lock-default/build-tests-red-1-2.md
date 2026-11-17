Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202611/921-tests-lock-default-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | vacuous | "a set BKIT_TEST_SLOTS overrides the core-count default both ways" passes at its red, so it proves nothing |
| 5 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | passed-accepted | passes; accepted by the tests step: the script override already exists; the test now stops the override-one holder before the three-slot half, and the file passes (74 tests) |

## Gaps

- TASK 1 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" `vacuous` — "a set BKIT_TEST_SLOTS overrides the core-count default both ways" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/machine-lock.integration.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default

 ✓ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (74 tests) 176190ms
   ✓ machine lock slots, order and wait budgets (17)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 518ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 2597ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 1221ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 577ms
     ✓ with slots unset on 10 cores, two runs hold tests at once and a third waits naming both 2136ms
     ✓ with slots unset on 7 cores, a second run waits behind the first 1027ms
     ✓ with slots unset, BKIT_TEST_WORKERS follows the core-count slots 930ms
     ✓ a set BKIT_TEST_SLOTS overrides the core-count default both ways 2112ms
     ✓ an invalid slots value falls back to the core-count default and names it 2957ms
     ✓ with no working core probe, slots unset gives one slot 982ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 651ms
     ✓ taking the tests lock while holding the stack lock is refused, naming the lock order 304ms
     ✓ a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 327ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 4366ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 3264ms
   ✓ bkit-machine-lock.sh (34)
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 1827ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 321ms
     ✓ a killed holder leaves no stale lock 414ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2255ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 1261ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 405ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 394ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2064ms
     ✓ preserves fragmented successful FIFO re… 1638ms
     ✓ stops and reaps an acquired holder afte… 423ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2680ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 427ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1233ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 369ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 507ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 638ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 510ms
   ✓ machine lock waiting order (23)
     ✓ tests-lock waiters run their commands in arrival order 1257ms
     ✓ stack-lock waiters run their commands in arrival order 898ms
     ✓ a run that releases the lock and asks again queues behind runs already waiting 1342ms
     ✓ with two slots, waiters take freed slots in arrival order 2344ms
     ✓ queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 2764ms
     ✓ a waiter that gives up leaves the line and the runs behind it keep their order 2315ms
     ✓ a waiter whose caller is killed leaves the line and the runs behind it keep their order 811ms
     ✓ a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 2482ms
     ✓ a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 2486ms
     ✓ a try while a run waits first in line reports busy even when the lock is free 542ms
     ✓ the waiting note says where the run is in line 770ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 1202ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1493ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 2636ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 2127ms
     ✓ a jump marker moves its waiting run to the front of the line 1059ms
     ✓ the newest jump marker goes first 949ms
     ✓ a jump marker that matches no waiting run is deleted 750ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 2144ms
     ✓ concurrent first takes on a fresh cache exit 0 with no cannot-create refusal 99552ms
     ✓ a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 1207ms

 Test Files  1 passed (1)
      Tests  74 passed (74)
   Start at  21:22:25
   Duration  176.36s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dtFyAX/junit.xml
```
