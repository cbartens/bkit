Enforced: true
Red: 4
Accepted: 2
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/921-tests-lock-default-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset on 10 cores, two runs hold tests at once and a third waits naming both" | red | failure: process exited before acquired: [machine-lock] ⏳ second core slot is waiting for tests (up to 2s), 1st in line: in use by first core slot — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 22987, since 20:26:00), no earlier run [machine-lock] ❌ second core slot gave up after 2s waiting for tests, in use by first core slot — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 22987, since 20:26:00), no earlier run [machine-lock] Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait. |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset on 7 cores, a second run waits behind the first" | passed-accepted | passes; accepted by the tests step: the current default is already 1 slot, so it holds before the change and guards the threshold |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with slots unset, BKIT_TEST_WORKERS follows the core-count slots" | red | failure: expected [ '9', '7', '6' ] to deeply equal [ '4', '3', '6' ] |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a set BKIT_TEST_SLOTS overrides the core-count default both ways" | red | failure: process exited before acquired: [machine-lock] ⏳ three c is waiting for tests (up to 1s), 1st in line: in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 26893, since 20:26:04), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28256, since 20:26:06), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28244, since 20:26:06), no earlier run [machine-lock] ❌ three c gave up after 1s waiting for tests, in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 26893, since 20:26:04), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28256, since 20:26:06), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28244, since 20:26:06), no earlier run [machine-lock] Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait. |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "an invalid slots value falls back to the core-count default and names it" | red | failure: expected '[machine-lock] invalid BKIT_TEST_SLOT…' to contain '[machine-lock] invalid BKIT_TEST_SLOT…' |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with no working core probe, slots unset gives one slot" | passed-accepted | passes; accepted by the tests step: the current default is already 1 slot, so it holds before the change |

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

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (74 tests | 4 failed) 200543ms
   ❯ machine lock slots, order and wait budgets (17)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 444ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 2163ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 1432ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 556ms
     × with slots unset on 10 cores, two runs hold tests at once and a third waits naming both 2011ms
     ✓ with slots unset on 7 cores, a second run waits behind the first 1031ms
     × with slots unset, BKIT_TEST_WORKERS follows the core-count slots 1285ms
     × a set BKIT_TEST_SLOTS overrides the core-count default both ways 2668ms
     × an invalid slots value falls back to the core-count default and names it 854ms
     ✓ with no working core probe, slots unset gives one slot 1105ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 1003ms
     ✓ taking the tests lock while holding the stack lock is refused, naming the lock order 355ms
     ✓ taking the tests lock while holding another named lock is refused, naming the lock order 351ms
     ✓ taking a named lock while holding the stack lock is refused, naming the lock order 122ms
     ✓ a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 406ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 4829ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 3258ms
   ✓ bkit-machine-lock.sh (34)
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 1980ms
     ✓ punctuation in distinct named locks keeps acquisition and release state separate 204ms
     ✓ unset owner state is safe under bash -eu for lock "" 149ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 370ms
     ✓ unset owner state is safe under bash -eu for lock "a-b" 118ms
     ✓ a second run cannot take the lock while the first holds it, and is told who holds it 194ms
     ✓ a killed holder leaves no stale lock 404ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2279ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 1997ms
     ✓ release frees the lock before the caller exits 436ms
     ✓ a caller under `set -e` survives a refused try 198ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 406ms
     ✓ a runner started by the holder does not wait on its parent 247ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 279ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 503ms
     ✓ outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 48ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2058ms
     ✓ preserves fragmented successful FIFO re… 2096ms
     ✓ stops and reaps an acquired holder afte… 566ms
     ✓ CI=true is a no-op that creates no lock file 34ms
     ✓ CI=1 is a no-op that creates no lock file 34ms
     ✓ `run` holds the lock for the command and passes its exit status on 121ms
     ✓ `run` with no arguments prints usage and exits 2 29ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2699ms
     ✓ copied-repository lock helpers execute in the requested caller checkout 296ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 233ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 381ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1310ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 347ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 463ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 240ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 221ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 899ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 563ms
   ✓ machine lock waiting order (23)
     ✓ tests-lock waiters run their commands in arrival order 1726ms
     ✓ stack-lock waiters run their commands in arrival order 940ms
     ✓ a run that releases the lock and asks again queues behind runs already waiting 1543ms
     ✓ with two slots, waiters take freed slots in arrival order 2701ms
     ✓ queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 2805ms
     ✓ a waiter that gives up leaves the line and the runs behind it keep their order 1894ms
     ✓ a waiter whose caller is killed leaves the line and the runs behind it keep their order 1122ms
     ✓ a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 2460ms
     ✓ a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 2463ms
     ✓ run exits 73 naming the queue folder when it cannot be created 270ms
     ✓ run exits 73 naming the queue folder when no ticket can be written 279ms
     ✓ a try while a run waits first in line reports busy even when the lock is free 678ms
     ✓ the waiting note says where the run is in line 957ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 1374ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1449ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 2013ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 2008ms
     ✓ a jump marker moves its waiting run to the front of the line 1147ms
     ✓ the newest jump marker goes first 961ms
     ✓ a jump marker that matches no waiting run is deleted 637ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 2346ms
     ✓ concurrent first takes on a fresh cache exit 0 with no cannot-create refusal 120651ms
     ✓ a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 1846ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > with slots unset on 10 cores, two runs hold tests at once and a third waits naming both
Error: process exited before acquired: [machine-lock] ⏳ second core slot is waiting for tests (up to 2s), 1st in line: in use by first core slot — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 22987, since 20:26:00), no earlier run
[machine-lock] ❌ second core slot gave up after 2s waiting for tests, in use by first core slot — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 22987, since 20:26:00), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.

 ❯ waitForOutput .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:222:13
    220|     if ((process.output.stdout + process.output.stderr).includes(text)…
    221|     if (process.child.exitCode !== null || process.child.signalCode !=…
    222|       throw new Error(`process exited before ${text}: ${process.output…
       |             ^
    223|     }
    224|     await delay(20);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:337:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > with slots unset, BKIT_TEST_WORKERS follows the core-count slots
AssertionError: expected [ '9', '7', '6' ] to deeply equal [ '4', '3', '6' ]

- Expected
+ Received

  [
-   "4",
-   "3",
+   "9",
+   "7",
    "6",
  ]

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:363:52
    361|     const results = [10, 8, 7].map(workers);
    362|     expect(results.map((result) => result.status)).toEqual([0, 0, 0]);
    363|     expect(results.map((result) => result.stdout)).toEqual(["4", "3", …
       |                                                    ^
    364|   });
    365|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > a set BKIT_TEST_SLOTS overrides the core-count default both ways
Error: process exited before acquired: [machine-lock] ⏳ three c is waiting for tests (up to 1s), 1st in line: in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 26893, since 20:26:04), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28256, since 20:26:06), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28244, since 20:26:06), no earlier run
[machine-lock] ❌ three c gave up after 1s waiting for tests, in use by override one — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 26893, since 20:26:04), no earlier run; three b — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28256, since 20:26:06), no earlier run; three a — /Users/christian/Documents/GitHub/bkit/.worktrees/921-tests-lock-default (pid 28244, since 20:26:06), no earlier run
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.

 ❯ waitForOutput .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:222:13
    220|     if ((process.output.stdout + process.output.stderr).includes(text)…
    221|     if (process.child.exitCode !== null || process.child.signalCode !=…
    222|       throw new Error(`process exited before ${text}: ${process.output…
       |             ^
    223|     }
    224|     await delay(20);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:377:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > an invalid slots value falls back to the core-count default and names it
AssertionError: expected '[machine-lock] invalid BKIT_TEST_SLOT…' to contain '[machine-lock] invalid BKIT_TEST_SLOT…'

- Expected
+ Received

- [machine-lock] invalid BKIT_TEST_SLOTS; using 2 slot(s)
+ [machine-lock] invalid BKIT_TEST_SLOTS; using 1 slot
+

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:389:24
    387|     expect(ten.status).toBe(0);
    388|     expect(ten.stderr.match(/BKIT_TEST_SLOTS/g)?.length).toBe(1);
    389|     expect(ten.stderr).toContain("[machine-lock] invalid BKIT_TEST_SLO…
       |                        ^
    390|     const four = run(twice, coresEnv(4, { BKIT_TEST_SLOTS: "0" }));
    391|     expect(four.status).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 70 passed (74)
   Start at  20:25:54
   Duration  201.06s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0NXwS7/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
