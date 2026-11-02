Enforced: true
Red: 9
Accepted: 1
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with N slots, N runs hold a named lock at once and run N+1 waits naming every holder" | red | failure: process exited before acquired: [machine-lock] ⏳ second slot is waiting for tests: in use by first slot — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 18749, since 20:15:59) [machine-lock] ❌ second slot gave up after 2s waiting for tests, in use by first slot — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 18749, since 20:15:59) [machine-lock] Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait. |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a slots value that is not a whole number >= 1 falls back to 1 and says so" | red | failure: expected [ undefined, undefined, …(2) ] to deeply equal [ 1, 1, 1, 1 ] |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one" | red | failure: expected [ '', '', '' ] to deeply equal [ '9', '4', '1' ] |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a killed tests-lock holder frees its slot within a second and the waiter starts" | passed-accepted | passes; accepted by the tests step: the existing Perl holder detects its dead parent and releases flock; the waiter polls each second (.bkit/templates/scripts/ci/bkit-machine-lock.sh:129,155). |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "taking the tests lock while holding the stack lock is refused, naming the lock order" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "taking the tests lock while holding another named lock is refused, naming the lock order" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "taking a named lock while holding the stack lock is refused, naming the lock order" | red | failure: expected +0 to be 1 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a child of a stack-lock holder asking for the tests lock is refused, naming the lock order" | red | failure: expected +0 to be 73 // Object.is equality |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set" | red | failure: expected '[machine-lock] ⏳ default is waiting f…' to contain 'up to 60s' |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the tests lock records its held time by checkout on release and the next waiting note names the holder's last run" | red | failure: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-a5jz2F/cache/bkit/machine-lock/tests.last' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/machine-lock.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/machine-lock.integration.test.ts


 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (41 tests | 9 failed) 31369ms
   ❯ machine lock slots, order and wait budgets (10)
     × with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 2151ms
     × a slots value that is not a whole number >= 1 falls back to 1 and says so 307ms
     × the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 144ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 1111ms
     × taking the tests lock while holding the stack lock is refused, naming the lock order 1100ms
     × taking the tests lock while holding another named lock is refused, naming the lock order 1105ms
     × taking a named lock while holding the stack lock is refused, naming the lock order 1117ms
     × a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 131ms
     × a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 3081ms
     × the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 1106ms
   ✓ bkit-machine-lock.sh (31)
     ✓ punctuation in distinct named locks keeps acquisition and release state separate 108ms
     ✓ unset owner state is safe under bash -eu for lock "" 44ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 48ms
     ✓ unset owner state is safe under bash -eu for lock "a-b" 47ms
     ✓ a second run cannot take the lock while the first holds it, and is told who holds it 91ms
     ✓ a killed holder leaves no stale lock 2099ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 3119ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 2111ms
     ✓ release frees the lock before the caller exits 1119ms
     ✓ a caller under `set -e` survives a refused try 114ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 358ms
     ✓ a runner started by the holder does not wait on its parent 1075ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1113ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 262ms
     ✓ outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 23ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2041ms
     ✓ CI=true is a no-op that creates no lock file 31ms
     ✓ CI=1 is a no-op that creates no lock file 23ms
     ✓ `run` holds the lock for the command and passes its exit status on 54ms
     ✓ `run` with no arguments prints usage and exits 2 11ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 3155ms
     ✓ copied-repository lock helpers execute in the requested caller checkout 73ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 108ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 1042ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1217ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 58ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 136ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 26ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 22ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 180ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 108ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > with N slots, N runs hold a named lock at once and run N+1 waits naming every holder
Error: process exited before acquired: [machine-lock] ⏳ second slot is waiting for tests: in use by first slot — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 18749, since 20:15:59)
[machine-lock] ❌ second slot gave up after 2s waiting for tests, in use by first slot — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 18749, since 20:15:59)
[machine-lock]    Let that run finish, or stop it. LOCAL_STACK_LOCK_WAIT_S sets how long to wait.

 ❯ waitForOutput .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:182:13
    180|     if ((process.output.stdout + process.output.stderr).includes(text)…
    181|     if (process.child.exitCode !== null || process.child.signalCode !=…
    182|       throw new Error(`process exited before ${text}: ${process.output…
       |             ^
    183|     }
    184|     await delay(20);
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:199:5

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > a slots value that is not a whole number >= 1 falls back to 1 and says so
AssertionError: expected [ undefined, undefined, …(2) ] to deeply equal [ 1, 1, 1, 1 ]

- Expected
+ Received

  [
-   1,
-   1,
-   1,
-   1,
+   undefined,
+   undefined,
+   undefined,
+   undefined,
  ]

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:220:84
    218|     );
    219|     expect(notes.map((result) => result.status)).toEqual([0, 0, 0, 0]);
    220|     expect(notes.map((result) => result.stderr.match(/BKIT_TEST_SLOTS/…
       |                                                                                    ^
    221|       1, 1, 1, 1,
    222|     ]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one
AssertionError: expected [ '', '', '' ] to deeply equal [ '9', '4', '1' ]

- Expected
+ Received

  [
-   "9",
-   "4",
-   "1",
+   "",
+   "",
+   "",
  ]

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:249:52
    247|     );
    248|     expect(results.map((result) => result.status)).toEqual([0, 0, 0]);
    249|     expect(results.map((result) => result.stdout)).toEqual(["9", "4", …
       |                                                    ^
    250|   });
    251|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > taking the tests lock while holding the stack lock is refused, naming the lock order
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:274:27
    272|       envFor(),
    273|     );
    274|     expect(result.status).toBe(1);
       |                           ^
    275|     expect(result.stderr).toMatch(/order/i);
    276|     expect(result.stderr).toContain("tests");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > taking the tests lock while holding another named lock is refused, naming the lock order
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:286:27
    284|       envFor(),
    285|     );
    286|     expect(result.status).toBe(1);
       |                           ^
    287|     expect(result.stderr).toMatch(/order/i);
    288|     expect(result.stderr).toContain("tests");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > taking a named lock while holding the stack lock is refused, naming the lock order
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:298:27
    296|       envFor(),
    297|     );
    298|     expect(result.status).toBe(1);
       |                           ^
    299|     expect(result.stderr).toMatch(/order/i);
    300|     expect(result.stderr).toContain("database");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > a child of a stack-lock holder asking for the tests lock is refused, naming the lock order
AssertionError: expected +0 to be 73 // Object.is equality

- Expected
+ Received

- 73
+ 0

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:310:27
    308|       envFor(),
    309|     );
    310|     expect(result.status).toBe(73);
       |                           ^
    311|     expect(result.stdout).not.toContain("entered");
    312|     expect(result.stderr).toMatch(/order/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set
AssertionError: expected '[machine-lock] ⏳ default is waiting f…' to contain 'up to 60s'

- Expected
+ Received

- up to 60s
+ [machine-lock] ⏳ default is waiting for tests: in use by budget holder — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 19547, since 20:16:07)
+

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:327:39
    325|     defaultWait.child.kill("SIGKILL");
    326|     await defaultWait.done;
    327|     expect(defaultWait.output.stderr).toContain("up to 60s");
       |                                       ^
    328|     const explicit = commandRun(["explicit", "--lock", "tests", "--", …
    329|       ...env,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/9]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > machine lock slots, order and wait budgets > the tests lock records its held time by checkout on release and the next waiting note names the holder's last run
Error: ENOENT: no such file or directory, open '/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-a5jz2F/cache/bkit/machine-lock/tests.last'
 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:352:15
    350|     expect(firstRun.status).toBe(0);
    351|     const history = path.join(cache, "bkit", "machine-lock", "tests.la…
    352|     expect(fs.readFileSync(history, "utf-8")).toMatch(new RegExp(`${fi…
       |               ^
    353|     const secondRun = run(
    354|       "take_local_stack_lock second tests || exit 1; sleep 1; release_…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/9]⎯


 Test Files  1 failed (1)
      Tests  9 failed | 32 passed (41)
   Start at  20:15:59
   Duration  31.47s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-4Bc9DN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
