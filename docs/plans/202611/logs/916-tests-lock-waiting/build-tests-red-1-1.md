Enforced: true
Red: 19
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "tests-lock waiters run their commands in arrival order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "stack-lock waiters run their commands in arrival order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a run that releases the lock and asks again queues behind runs already waiting" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with two slots, waiters take freed slots in arrival order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "queued waiters keep their order while a copy without the queue also waits, and no two commands overlap" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter that gives up leaves the line and the runs behind it keep their order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose caller is killed leaves the line and the runs behind it keep their order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the queue folder when it cannot be created" | red | failure: expected +0 to be 73 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the queue folder when no ticket can be written" | red | failure: expected +0 to be 73 // Object.is equality |
| 2 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run exits 4 naming the queue folder when a regular file blocks it" | red | failure: [bkit-tests] running pnpm bkit:gate:static-unit — full output in logs/run.md [bkit-tests] [bkit-tests] no JUnit report in $BKIT_TEST_REPORT_DIR — failures unknown; turn on each test runner's JUnit reporter in the gate and point its output into $BKIT_TEST_REPORT_DIR (.bkit/workflows.md § Local gate scripts) [bkit-tests] verdict PASS (exit 0) : expected +0 to be 4 // Object.is equality |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a try while a run waits first in line reports busy even when the lock is free" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the waiting note says where the run is in line" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a stray file in the queue folder neither blocks the line nor gets deleted" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a stopped first-in-line waiter holds the line while the lock is free" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 3 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by the holder does not wait on its parent" | red | failure: the stack lock's queue folder /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-cX7Vz4/cache/bkit/local-stack-lock/bkit.queue: expected false to be true // Object.is equality |
| 4 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a waiter that gives up and asks again within 120 s keeps its place in line" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |
| 4 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a held place older than 120 s is deleted and the re-ask joins the end of the line" | red | failure: Test timed out in 82500ms. If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout". |

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

[test-timeout-budget] load average 18.5 on 10 cores: unit limits 13750ms per test, 27500ms per hook (x2.75)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (62 tests | 18 failed) 1280514ms
   ✓ machine lock slots, order and wait budgets (11)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 534ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 2140ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 1968ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 1228ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 509ms
     ✓ taking the tests lock while holding the stack lock is refused, naming the lock order 175ms
     ✓ taking the tests lock while holding another named lock is refused, naming the lock order 281ms
     ✓ taking a named lock while holding the stack lock is refused, naming the lock order 225ms
     ✓ a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 261ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 4433ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 4285ms
   ❯ bkit-machine-lock.sh (34)
     ✓ terminating a run wrapper stops its gate before another run acquires the tests lock 2163ms
     ✓ punctuation in distinct named locks keeps acquisition and release state separate 465ms
     ✓ unset owner state is safe under bash -eu for lock "" 166ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 218ms
     ✓ unset owner state is safe under bash -eu for lock "a-b" 221ms
     ✓ a second run cannot take the lock while the first holds it, and is told who holds it 427ms
     ✓ a killed holder leaves no stale lock 545ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 2526ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 2014ms
     ✓ release frees the lock before the caller exits 556ms
     ✓ a caller under `set -e` survives a refused try 427ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 521ms
     × a runner started by the holder does not wait on its parent 459ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 431ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 1174ms
     ✓ outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 125ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2218ms
     ✓ preserves fragmented successful FIFO re… 1871ms
     ✓ stops and reaps an acquired holder afte… 667ms
     ✓ CI=true is a no-op that creates no lock file 72ms
     ✓ CI=1 is a no-op that creates no lock file 56ms
     ✓ `run` holds the lock for the command and passes its exit status on 254ms
     ✓ `run` with no arguments prints usage and exits 2 72ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 2842ms
     ✓ copied-repository lock helpers execute in the requested caller checkout 328ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 498ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 424ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1490ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 486ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 718ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 141ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 112ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 936ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 679ms
   ❯ machine lock waiting order (17)
     × tests-lock waiters run their commands in arrival order 82508ms
     × stack-lock waiters run their commands in arrival order 82507ms
     × a run that releases the lock and asks again queues behind runs already waiting 82504ms
     × with two slots, waiters take freed slots in arrival order 82503ms
     × queued waiters keep their order while a copy without the queue also waits, and no two commands overlap 82503ms
     × a waiter that gives up leaves the line and the runs behind it keep their order 82508ms
     × a waiter whose caller is killed leaves the line and the runs behind it keep their order 82503ms
     × a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order 82502ms
     × a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order 82504ms
     × run exits 73 naming the queue folder when it cannot be created 318ms
     × run exits 73 naming the queue folder when no ticket can be written 289ms
     × a try while a run waits first in line reports busy even when the lock is free 82502ms
     × the waiting note says where the run is in line 82501ms
     × a stray file in the queue folder neither blocks the line nor gets deleted 82503ms
     × a stopped first-in-line waiter holds the line while the lock is free 82506ms
     × a waiter that gives up and asks again within 120 s keeps its place in line 82502ms
     × a held place older than 120 s is deleted and the re-ask joins the end of the line 82505ms

⎯⎯⎯⎯⎯⎯ Failed Tests 18 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a runner started by the holder does not wait on its parent
AssertionError: the stack lock's queue folder /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-cX7Vz4/cache/bkit/local-stack-lock/bkit.queue: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:654:76
    652|       .stdout.trim()
    653|       .replace(/\.lock$/, ".queue");
    654|     expect(fs.existsSync(queue), "the stack lock's queue folder " + qu…
       |                                                                            ^
    655|     expect(fs.readdirSync(queue)).toEqual([]);
    656|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > tests-lock waiters run their commands in arrival order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1195:3
    1193|     envFor({ LOCAL_STACK_LOCK_WAIT_S: "60", BKIT_LOCAL_STACK: STACK, .…
    1194|
    1195|   it("tests-lock waiters run their commands in arrival order", async (…
       |   ^
    1196|     expect(await fiveInArrivalOrder("tests", waitEnv())).toEqual(["w1"…
    1197|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > stack-lock waiters run their commands in arrival order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1199:3
    1197|   });
    1198|
    1199|   it("stack-lock waiters run their commands in arrival order", async (…
       |   ^
    1200|     expect(await fiveInArrivalOrder(undefined, waitEnv())).toEqual(["w…
    1201|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a run that releases the lock and asks again queues behind runs already waiting
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1203:3
    1201|   });
    1202|
    1203|   it("a run that releases the lock and asks again queues behind runs a…
       |   ^
    1204|     const env = waitEnv();
    1205|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > with two slots, waiters take freed slots in arrival order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1222:3
    1220|   });
    1221|
    1222|   it("with two slots, waiters take freed slots in arrival order", asyn…
       |   ^
    1223|     const env = waitEnv({ BKIT_TEST_SLOTS: "2" });
    1224|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > queued waiters keep their order while a copy without the queue also waits, and no two commands overlap
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1254:3
    1252|   });
    1253|
    1254|   it("queued waiters keep their order while a copy without the queue a…
       |   ^
    1255|     const env = waitEnv();
    1256|     const events = path.join(tmp, "events");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a waiter that gives up leaves the line and the runs behind it keep their order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1287:3
    1285|   });
    1286|
    1287|   it("a waiter that gives up leaves the line and the runs behind it ke…
       |   ^
    1288|     const env = waitEnv();
    1289|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a waiter whose caller is killed leaves the line and the runs behind it keep their order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1303:3
    1301|   });
    1302|
    1303|   it("a waiter whose caller is killed leaves the line and the runs beh…
       |   ^
    1304|     const env = waitEnv();
    1305|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a waiter whose helper gets SIGTERM leaves the line at once and the runs behind it keep their order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1320:3
    1318|   });
    1319|
    1320|   it("a waiter whose helper gets SIGTERM leaves the line at once and t…
       |   ^
    1321|     const env = waitEnv();
    1322|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a killed waiter's leftover ticket is skipped and removed, and the runs behind it keep their order
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1338:3
    1336|   });
    1337|
    1338|   it("a killed waiter's leftover ticket is skipped and removed, and th…
       |   ^
    1339|     const env = waitEnv();
    1340|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > run exits 73 naming the queue folder when it cannot be created
AssertionError: expected +0 to be 73 // Object.is equality

- Expected
+ Received

- 73
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1363:42
    1361|       envFor(),
    1362|     );
    1363|     expect(result.status, result.stderr).toBe(73);
       |                                          ^
    1364|     expect(result.stdout).not.toContain("should-not-run");
    1365|     expect(result.stderr).toContain(queue);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > run exits 73 naming the queue folder when no ticket can be written
AssertionError: expected +0 to be 73 // Object.is equality

- Expected
+ Received

- 73
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1377:44
    1375|         envFor(),
    1376|       );
    1377|       expect(result.status, result.stderr).toBe(73);
       |                                            ^
    1378|       expect(result.stdout).not.toContain("should-not-run");
    1379|       expect(result.stderr).toContain(queue);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a try while a run waits first in line reports busy even when the lock is free
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1385:3
    1383|   });
    1384|
    1385|   it("a try while a run waits first in line reports busy even when the…
       |   ^
    1386|     const env = waitEnv();
    1387|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > the waiting note says where the run is in line
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1410:3
    1408|   });
    1409|
    1410|   it("the waiting note says where the run is in line", async () => {
       |   ^
    1411|     const env = waitEnv();
    1412|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a stray file in the queue folder neither blocks the line nor gets deleted
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1423:3
    1421|   });
    1422|
    1423|   it("a stray file in the queue folder neither blocks the line nor get…
       |   ^
    1424|     const env = waitEnv();
    1425|     const queue = queueOf("tests");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a stopped first-in-line waiter holds the line while the lock is free
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1434:3
    1432|   });
    1433|
    1434|   it("a stopped first-in-line waiter holds the line while the lock is …
       |   ^
    1435|     const env = waitEnv();
    1436|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a waiter that gives up and asks again within 120 s keeps its place in line
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1454:3
    1452|   });
    1453|
    1454|   it("a waiter that gives up and asks again within 120 s keeps its pla…
       |   ^
    1455|     const env = waitEnv();
    1456|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/18]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock waiting order > a held place older than 120 s is deleted and the re-ask joins the end of the line
Error: Test timed out in 82500ms.
If this is a long-running test, pass a timeout value as the last argument or configure it globally with "testTimeout".
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1469:3
    1467|   });
    1468|
    1469|   it("a held place older than 120 s is deleted and the re-ask joins th…
       |   ^
    1470|     const env = waitEnv();
    1471|     const order = path.join(tmp, "order");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/18]⎯


 Test Files  1 failed (1)
      Tests  18 failed | 44 passed (62)
   Start at  13:20:38
   Duration  1280.91s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-tBen1t/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts

[test-timeout-budget] load average 11.1 on 10 cores: unit limits 10050ms per test, 20100ms per hook (x2.01)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/916-tests-lock-waiting

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts (15 tests | 1 failed) 28347ms
   ❯ tests lock through a consumer's wrapped gate (15)
     ✓ a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself 6084ms
     ✓ tests run --file appends no test-run row when it exits 81 on a held tests lock 1403ms
     ✓ tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock 1613ms
     ✓ tests changed with an unwritable lock dir exits 4 naming the path 1092ms
     ✓ tests run waits for a held tests lock and runs the gate once the holder finishes 1706ms
     ✓ tests run exits 81 naming the holder when the lock stays held past --lock-wait-s 1672ms
     ✓ tests run holds the tests lock for the whole gate, so a second tests run waits 2286ms
     ✓ tests red runs its test file without waiting for a held tests lock 2098ms
     ✓ tests run under CI=true never waits on a held tests lock 2226ms
     ✓ tests run under CI=1 never waits on a held tests lock 1316ms
     ✓ tests run with an unwritable lock dir exits 4 naming the path 1150ms
     × tests run exits 4 naming the queue folder when a regular file blocks it 1118ms
     ✓ tests run with --lock-wait-s=0 exits 81 at once against a held lock 1499ms
     ✓ a gate that itself exits 75 is a FAIL verdict, not a lock wait 1200ms
     ✓ the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait 1882ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts > tests lock through a consumer's wrapped gate > tests run exits 4 naming the queue folder when a regular file blocks it
AssertionError: [bkit-tests] running pnpm bkit:gate:static-unit — full output in logs/run.md
[bkit-tests] 
[bkit-tests] no JUnit report in $BKIT_TEST_REPORT_DIR — failures unknown; turn on each test runner's JUnit reporter in the gate and point its output into $BKIT_TEST_REPORT_DIR (.bkit/workflows.md § Local gate scripts)
[bkit-tests] verdict PASS (exit 0)
: expected +0 to be 4 // Object.is equality

- Expected
+ Received

- 4
+ 0

 ❯ .bkit/core/engine/commands/workflow/tests-lock.integration.test.ts:440:42
    438|     fs.writeFileSync(queue, "a file cannot hold a queue folder");
    439|     const result = execute(runArgs());
    440|     expect(result.status, result.stderr).toBe(4);
       |                                          ^
    441|     expect(result.stderr).toContain(queue);
    442|     expect(output(result)).toMatchObject({ verdict: null });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 14 passed (15)
   Start at  13:42:03
   Duration  28.80s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-P0PC93/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
