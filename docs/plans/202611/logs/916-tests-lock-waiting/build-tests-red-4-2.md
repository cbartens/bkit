Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 4, attempt 2

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 11 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "runs that take a lock at once on a fresh cache never refuse over the queue folder" | red | failure: expected [ …(350) ] to deeply equal [] |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

[test-timeout-budget] load average 2.8 on 10 cores: unit limits 5900ms per test, 11800ms per hook (x1.18)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (68 tests | 2 failed) 92277ms
   ✓ machine lock slots, order and wait budgets (11)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 204ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 1343ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 567ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 630ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 235ms
     ✓ taking the tests lock while holding the stack lock is refused, naming the lock order 58ms
     ✓ taking the tests lock while holding another named lock is refused, naming the lock order 65ms
     ✓ taking a named lock while holding the stack lock is refused, naming the lock order 55ms
     ✓ a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 77ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 3335ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 3124ms
   ✓ bkit-machine-lock.sh (34)
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 1444ms
     ✓ punctuation in distinct named locks keeps acquisition and release state separate 112ms
     ✓ unset owner state is safe under bash -eu for lock "" 46ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 65ms
     ✓ unset owner state is safe under bash -eu for lock "a-b" 61ms
     ✓ a second run cannot take the lock while the first holds it, and is told who holds it 102ms
     ✓ a killed holder leaves no stale lock 312ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2285ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 1486ms
     ✓ release frees the lock before the caller exits 219ms
     ✓ a caller under `set -e` survives a refused try 114ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 407ms
     ✓ a runner started by the holder does not wait on its parent 209ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 198ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 219ms
     ✓ outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 24ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2036ms
     ✓ preserves fragmented successful FIFO re… 1354ms
     ✓ stops and reaps an acquired holder afte… 116ms
     ✓ CI=true is a no-op that creates no lock file 17ms
     ✓ CI=1 is a no-op that creates no lock file 16ms
     ✓ `run` holds the lock for the command and passes its exit status on 59ms
     ✓ `run` with no arguments prints usage and exits 2 15ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2350ms
     ✓ copied-repository lock helpers execute in the requested caller checkout 86ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 129ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 159ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1163ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 90ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 161ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 34ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 29ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 228ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 158ms
   ❯ machine lock waiting order (23)
     ✓ tests-lock waiters run their commands in arrival order 823ms
     ✓ stack-lock waiters run their commands in arrival order 469ms
     ✓ a run that releases the lock and asks again queues behind runs already waiting 926ms
     ✓ with two slots, waiters take freed slots in arrival order 2059ms
     ✓ queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 2107ms
     ✓ a waiter that gives up leaves the line and the runs behind it keep their order 2284ms
     ✓ a waiter whose caller is killed leaves the line and the runs behind it keep their order 581ms
     ✓ a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 2177ms
     ✓ a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 2197ms
     ✓ run exits 73 naming the queue folder when it cannot be created 73ms
     ✓ run exits 73 naming the queue folder when no ticket can be written 47ms
     ✓ a try while a run waits first in line reports busy even when the lock is free 238ms
     ✓ the waiting note says where the run is in line 402ms
     ✓ a stray file in the queue folder neither blocks the line nor gets deleted 801ms
     ✓ a stopped first-in-line waiter holds the line while the lock is free 1126ms
     ✓ a waiter that gives up and asks again within 120 s keeps its place in line 2378ms
     ✓ a held place older than 120 s is deleted and the re-ask joins the end of the line 2089ms
     ✓ a jump marker moves its waiting run to the front of the line 677ms
     ✓ the newest jump marker goes first 440ms
     ✓ a jump marker that matches no waiting run is deleted 349ms
     ✓ a jumped run that gives up and asks again within 120 s keeps the front 2549ms
     × runs that take a lock at once on a fresh cache never refuse over the queue folder 41654ms
     × a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP 634ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > runs that take a lock at once on a fresh cache never refuse over the queue folder
AssertionError: expected [ …(350) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "round 0 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21211, since 20:41:44), no earlier run",
+   "round 0 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 0 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21211, since 20:41:44), no earlier run",
+   "round 0 exit 73: [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-Jrj1oO/race-cache-0/bkit/machine-lock/tests.queue: File exists",
+   "round 0 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21211, since 20:41:44), no earlier run",
+   "round 0 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21211, since 20:41:44), no earlier run",
+   "round 0 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21211, since 20:41:44), no earlier run",
+   "round 1 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 1 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21479, since 20:41:45), no earlier run",
+   "round 1 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21479, since 20:41:45), no earlier run",
+   "round 1 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21479, since 20:41:45), no earlier run",
+   "round 1 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21479, since 20:41:45), no earlier run",
+   "round 1 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 1 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21479, since 20:41:45), no earlier run",
+   "round 2 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21747, since 20:41:46), no earlier run",
+   "round 2 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21747, since 20:41:46), no earlier run",
+   "round 2 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21747, since 20:41:46), no earlier run",
+   "round 2 exit 73: [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-Jrj1oO/race-cache-2/bkit/machine-lock/tests.queue: File exists",
+   "round 2 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21747, since 20:41:46), no earlier run",
+   "round 2 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 3rd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21747, since 20:41:46), no earlier run",
+   "round 2 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 21747, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 6th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 4th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 3 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22016, since 20:41:46), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 4 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22279, since 20:41:47), no earlier run",
+   "round 5 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22541, since 20:41:48), no earlier run",
+   "round 5 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22541, since 20:41:48), no earlier run",
+   "round 5 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22541, since 20:41:48), no earlier run",
+   "round 5 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22541, since 20:41:48), no earlier run",
+   "round 5 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22541, since 20:41:48), no earlier run",
+   "round 5 exit 73: [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-Jrj1oO/race-cache-5/bkit/machine-lock/tests.queue: File exists",
+   "round 5 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 1st in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22541, since 20:41:48), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 5th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 7th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 4th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 6 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 3rd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 22812, since 20:41:49), no earlier run",
+   "round 7 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23072, since 20:41:50), no earlier run",
+   "round 7 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23072, since 20:41:50), no earlier run",
+   "round 7 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23072, since 20:41:50), no earlier run",
+   "round 7 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 7 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23072, since 20:41:50), no earlier run",
+   "round 7 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23072, since 20:41:50), no earlier run",
+   "round 7 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23072, since 20:41:50), no earlier run",
+   "round 8 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23349, since 20:41:50), no earlier run",
+   "round 8 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 4th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23349, since 20:41:50), no earlier run",
+   "round 8 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23349, since 20:41:50), no earlier run",
+   "round 8 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 8 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23349, since 20:41:50), no earlier run",
+   "round 8 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23349, since 20:41:50), no earlier run",
+   "round 8 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 5th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23349, since 20:41:50), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 1st in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 3rd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 9 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23637, since 20:41:51), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 10 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 23905, since 20:41:52), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 11 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24178, since 20:41:53), no earlier run",
+   "round 12 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24436, since 20:41:54), no earlier run",
+   "round 12 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24436, since 20:41:54), no earlier run",
+   "round 12 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 3rd in line: in use by another run",
+   "round 12 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by another run",
+   "round 12 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 12 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24436, since 20:41:54), no earlier run",
+   "round 12 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24436, since 20:41:54), no earlier run",
+   "round 13 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24704, since 20:41:55), no earlier run",
+   "round 13 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24704, since 20:41:55), no earlier run",
+   "round 13 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24704, since 20:41:55), no earlier run",
+   "round 13 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 13 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 13 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24704, since 20:41:55), no earlier run",
+   "round 13 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 4th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24704, since 20:41:55), no earlier run",
+   "round 14 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24981, since 20:41:55), no earlier run",
+   "round 14 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 4th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24981, since 20:41:55), no earlier run",
+   "round 14 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 6th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24981, since 20:41:55), no earlier run",
+   "round 14 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 14 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24981, since 20:41:55), no earlier run",
+   "round 14 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 14 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 24981, since 20:41:55), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 7th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 6th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 1st in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 15 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25256, since 20:41:56), no earlier run",
+   "round 16 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25524, since 20:41:57), no earlier run",
+   "round 16 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 6th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25524, since 20:41:57), no earlier run",
+   "round 16 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 3rd in line: in use by another run",
+   "round 16 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 7th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25524, since 20:41:57), no earlier run",
+   "round 16 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25524, since 20:41:57), no earlier run",
+   "round 16 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25524, since 20:41:57), no earlier run",
+   "round 16 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 17 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25792, since 20:41:58), no earlier run",
+   "round 17 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 4th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25792, since 20:41:58), no earlier run",
+   "round 17 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25792, since 20:41:58), no earlier run",
+   "round 17 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 17 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25792, since 20:41:58), no earlier run",
+   "round 17 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25792, since 20:41:58), no earlier run",
+   "round 17 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 25792, since 20:41:58), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 18 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26062, since 20:41:59), no earlier run",
+   "round 19 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26322, since 20:42:00), no earlier run",
+   "round 19 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26322, since 20:42:00), no earlier run",
+   "round 19 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26322, since 20:42:00), no earlier run",
+   "round 19 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26322, since 20:42:00), no earlier run",
+   "round 19 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 19 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26322, since 20:42:00), no earlier run",
+   "round 19 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26322, since 20:42:00), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 20 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26589, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 6th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 21 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 26865, since 20:42:01), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 7th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 1st in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 22 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27134, since 20:42:02), no earlier run",
+   "round 23 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27404, since 20:42:03), no earlier run",
+   "round 23 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27404, since 20:42:03), no earlier run",
+   "round 23 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 23 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 7th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27404, since 20:42:03), no earlier run",
+   "round 23 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27404, since 20:42:03), no earlier run",
+   "round 23 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27404, since 20:42:03), no earlier run",
+   "round 23 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27404, since 20:42:03), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 1st in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 24 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27662, since 20:42:04), no earlier run",
+   "round 25 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 3rd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27937, since 20:42:05), no earlier run",
+   "round 25 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27937, since 20:42:05), no earlier run",
+   "round 25 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 25 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 6th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27937, since 20:42:05), no earlier run",
+   "round 25 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27937, since 20:42:05), no earlier run",
+   "round 25 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27937, since 20:42:05), no earlier run",
+   "round 25 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 4th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 27937, since 20:42:05), no earlier run",
+   "round 26 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28202, since 20:42:06), no earlier run",
+   "round 26 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28202, since 20:42:06), no earlier run",
+   "round 26 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28202, since 20:42:06), no earlier run",
+   "round 26 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 26 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28202, since 20:42:06), no earlier run",
+   "round 26 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28202, since 20:42:06), no earlier run",
+   "round 26 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28202, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 27 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 1st in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28468, since 20:42:06), no earlier run",
+   "round 28 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28741, since 20:42:07), no earlier run",
+   "round 28 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 28 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 3rd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28741, since 20:42:07), no earlier run",
+   "round 28 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 28 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28741, since 20:42:07), no earlier run",
+   "round 28 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28741, since 20:42:07), no earlier run",
+   "round 28 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 28741, since 20:42:07), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 7th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 1st in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 29 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by race3 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29009, since 20:42:08), no earlier run",
+   "round 30 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29285, since 20:42:09), no earlier run",
+   "round 30 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29285, since 20:42:09), no earlier run",
+   "round 30 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 30 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29285, since 20:42:09), no earlier run",
+   "round 30 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29285, since 20:42:09), no earlier run",
+   "round 30 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29285, since 20:42:09), no earlier run",
+   "round 30 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29285, since 20:42:09), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 31 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29543, since 20:42:10), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 32 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 29819, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 33 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30092, since 20:42:11), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30358, since 20:42:12), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30358, since 20:42:12), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30358, since 20:42:12), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30358, since 20:42:12), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30358, since 20:42:12), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30358, since 20:42:12), no earlier run",
+   "round 34 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 35 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 35 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30631, since 20:42:13), no earlier run",
+   "round 35 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30631, since 20:42:13), no earlier run",
+   "round 35 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30631, since 20:42:13), no earlier run",
+   "round 35 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30631, since 20:42:13), no earlier run",
+   "round 35 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30631, since 20:42:13), no earlier run",
+   "round 35 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30631, since 20:42:13), no earlier run",
+   "round 36 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30905, since 20:42:14), no earlier run",
+   "round 36 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30905, since 20:42:14), no earlier run",
+   "round 36 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30905, since 20:42:14), no earlier run",
+   "round 36 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 5th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30905, since 20:42:14), no earlier run",
+   "round 36 exit 73: [machine-lock] ❌ could not take the lock for tests: cannot create /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-Jrj1oO/race-cache-36/bkit/machine-lock/tests.queue: File exists",
+   "round 36 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30905, since 20:42:14), no earlier run",
+   "round 36 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race7 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 30905, since 20:42:14), no earlier run",
+   "round 37 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31155, since 20:42:15), no earlier run",
+   "round 37 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31155, since 20:42:15), no earlier run",
+   "round 37 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31155, since 20:42:15), no earlier run",
+   "round 37 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 3rd in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31155, since 20:42:15), no earlier run",
+   "round 37 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 37 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31155, since 20:42:15), no earlier run",
+   "round 37 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race2 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31155, since 20:42:15), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 7th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 2nd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 5th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 1st in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 38 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race5 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31431, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 39 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31705, since 20:42:16), no earlier run",
+   "round 40 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31966, since 20:42:17), no earlier run",
+   "round 40 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31966, since 20:42:17), no earlier run",
+   "round 40 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 40 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31966, since 20:42:17), no earlier run",
+   "round 40 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31966, since 20:42:17), no earlier run",
+   "round 40 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31966, since 20:42:17), no earlier run",
+   "round 40 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 31966, since 20:42:17), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 1st in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 41 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32240, since 20:42:18), no earlier run",
+   "round 42 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 2nd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32506, since 20:42:19), no earlier run",
+   "round 42 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 7th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32506, since 20:42:19), no earlier run",
+   "round 42 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 6th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32506, since 20:42:19), no earlier run",
+   "round 42 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 42 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32506, since 20:42:19), no earlier run",
+   "round 42 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 3rd in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32506, since 20:42:19), no earlier run",
+   "round 42 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 5th in line: in use by race6 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32506, since 20:42:19), no earlier run",
+   "round 43 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32778, since 20:42:20), no earlier run",
+   "round 43 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32778, since 20:42:20), no earlier run",
+   "round 43 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32778, since 20:42:20), no earlier run",
+   "round 43 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32778, since 20:42:20), no earlier run",
+   "round 43 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 43 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32778, since 20:42:20), no earlier run",
+   "round 43 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 32778, since 20:42:20), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 4th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 1st in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 2nd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 44 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33034, since 20:42:21), no earlier run",
+   "round 45 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 45 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33308, since 20:42:21), no earlier run",
+   "round 45 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33308, since 20:42:21), no earlier run",
+   "round 45 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33308, since 20:42:21), no earlier run",
+   "round 45 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33308, since 20:42:21), no earlier run",
+   "round 45 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33308, since 20:42:21), no earlier run",
+   "round 45 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33308, since 20:42:21), no earlier run",
+   "round 46 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 5th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33585, since 20:42:22), no earlier run",
+   "round 46 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33585, since 20:42:22), no earlier run",
+   "round 46 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 2nd in line: in use by another run",
+   "round 46 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33585, since 20:42:22), no earlier run",
+   "round 46 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 2nd in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33585, since 20:42:22), no earlier run",
+   "round 46 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 6th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33585, since 20:42:22), no earlier run",
+   "round 46 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 7th in line: in use by race8 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33585, since 20:42:22), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race1 is waiting for tests (up to 60s), 1st in line: in use by another run",
+   "round 47 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33846, since 20:42:23), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 5th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33846, since 20:42:23), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 4th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33846, since 20:42:23), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 7th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33846, since 20:42:23), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 2nd in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33846, since 20:42:23), no earlier run",
+   "round 47 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 6th in line: in use by race4 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 33846, since 20:42:23), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 2nd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 4th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 1st in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 48 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34107, since 20:42:24), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race2 is waiting for tests (up to 60s), 2nd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race3 is waiting for tests (up to 60s), 6th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race4 is waiting for tests (up to 60s), 7th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race5 is waiting for tests (up to 60s), 1st in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race6 is waiting for tests (up to 60s), 4th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race7 is waiting for tests (up to 60s), 3rd in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+   "round 49 exit 0: [machine-lock] ⏳ race8 is waiting for tests (up to 60s), 5th in line: in use by race1 — /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting (pid 34375, since 20:42:25), no earlier run",
+ ]

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1589:64
    1587|       }
    1588|     }
    1589|     expect(refused.filter((line) => !/ exit 0: $/.test(line))).toEqual…
       |                                                                ^
    1590|   }, 600_000);
    1591|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a waiter whose caller ignores SIGHUP keeps its place when its helper gets SIGHUP
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1613:48
    1611|     process.kill(ticketPid(queueOf("tests"), "w1"), "SIGHUP");
    1612|     await delay(500);
    1613|     expect(ticketsIn(queueOf("tests")).length).toBe(1);
       |                                                ^
    1614|     holder.release();
    1615|     expect(await done, stderr).toBe(0);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 66 passed (68)
   Start at  20:40:54
   Duration  92.37s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-kxJ60x/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
