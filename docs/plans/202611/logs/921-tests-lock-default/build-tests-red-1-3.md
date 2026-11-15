Enforced: true
Red: 0
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 3

Plan: `docs/plans/202611/921-tests-lock-default-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | passed-accepted | passes; accepted by the tests step: rewritten in place by TASK 5 after the script change landed; the corrected setup passes (74 tests) |

## Gaps

None.

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

 ✓ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (74 tests) 197003ms
   ✓ machine lock slots, order and wait budgets (17)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 661ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 1710ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 1852ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 935ms
     ✓ with slots unset on 10 cores, two runs hold tests at once and a third waits naming both 2215ms
     ✓ with slots unset on 7 cores, a second run waits behind the first 1010ms
     ✓ with slots unset, BKIT_TEST_WORKERS follows the core-count slots 1859ms
     ✓ a set BKIT_TEST_SLOTS overrides the core-count default both ways 2197ms
     ✓ an invalid slots value falls back to the core-count default and names it 3974ms
     ✓ with no working core probe, slots unset gives one slot 2031ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 732ms
     ✓ taking the tests lock while holding the stack lock is refused, naming the lock order 372ms
     ✓ taking the tests lock while holding another named lock is refused, naming the lock order 622ms
     ✓ a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 423ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 3658ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 3251ms
   ✓ bkit-machine-lock.sh (34)
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 2063ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 402ms
     ✓ a killed holder leaves no stale lock 389ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2406ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 1706ms
     ✓ release frees the lock before the caller exits 722ms
     ✓ a caller under `set -e` survives a refused try 467ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 493ms
     ✓ a runner started by the holder does not wait on its parent 354ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 404ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 660ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2165ms
     ✓ preserves fragmented successful FIFO re… 2139ms
     ✓ stops and reaps an acquired holder afte… 661ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 3217ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 353ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 476ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1378ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 555ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 1186ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 430ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 316ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 969ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 685ms
   ✓ machine lock waiting order (23)
     ✓ tests-lock waiters run their commands in arrival order 1794ms
     ✓ stack-lock waiters run their commands in arrival order 1394ms
     ✓ a run that releases the lock and asks again queues behind runs already waiting 2030ms
     ✓ with two slots, waiters take freed slots in arrival order 3238ms
     ✓ queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 3267ms
     ✓ a waiter that gives up leaves the line and the runs behind it keep their order 2151ms
     ✓ a waiter whose caller is killed leaves the line and the runs behind it keep their order 1254ms
     ✓ a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 2740ms
     ✓ a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 2911ms
     ✓ run exits 73 naming the queue folder when it cannot be created 497ms
     ✓ run exits 73 naming the queue folder when no ticket can be written 389ms
     ✓ a try while a run waits first in line reports busy even when the lock is free 881ms
     ✓ the waiting note says where the run is in line 1060ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 1835ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1881ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 2625ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 3145ms
     ✓ a jump marker moves its waiting run to the front of the line 1475ms
     ✓ the newest jump marker goes first 1107ms
     ✓ a jump marker that matches no waiting run is deleted 766ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 2558ms
     ✓ concurrent first takes on a fresh cache exit 0 with no cannot-create refusal 102693ms
     ✓ a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 1407ms

 Test Files  1 passed (1)
      Tests  74 passed (74)
   Start at  21:25:50
   Duration  197.22s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-SFxz9c/junit.xml
```
