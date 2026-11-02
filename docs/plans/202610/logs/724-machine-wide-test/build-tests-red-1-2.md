Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 2

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a named lock is machine-wide: checkouts of two different repos wait on the same named lock" | red | failure: expected '[machine-lock] ⏳ second repo gate is …' to contain '/private/var/folders/td/lj74ml2d0jz3t…' |
| 12 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "copied-repository lock helpers execute in the requested caller checkout" | red | failure: expected '/Users/christian/Documents/GitHub/bki…' to be '/private/var/folders/td/lj74ml2d0jz3t…' // Object.is equality |

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

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (31 tests | 2 failed) 22051ms
   ❯ bkit-machine-lock.sh (31)
     ✓ punctuation in distinct named locks keeps acquisition and release state separate 94ms
     ✓ unset owner state is safe under bash -eu for lock "" 42ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 50ms
     ✓ unset owner state is safe under bash -eu for lock "a-b" 47ms
     ✓ a second run cannot take the lock while the first holds it, and is told who holds it 92ms
     ✓ a killed holder leaves no stale lock 2102ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 4130ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 2138ms
     ✓ release frees the lock before the caller exits 1127ms
     ✓ a caller under `set -e` survives a refused try 117ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 360ms
     ✓ a runner started by the holder does not wait on its parent 1072ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 1144ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 207ms
     ✓ outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 18ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2036ms
     ✓ CI=true is a no-op that creates no lock file 31ms
     ✓ CI=1 is a no-op that creates no lock file 22ms
     ✓ `run` holds the lock for the command and passes its exit status on 56ms
     ✓ `run` with no arguments prints usage and exits 2 11ms
     × a named lock is machine-wide: checkouts of two different repos wait on the same named lock 4139ms
     × copied-repository lock helpers execute in the requested caller checkout 83ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 111ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 1044ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1245ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 59ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 135ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 26ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 21ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 182ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 107ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a named lock is machine-wide: checkouts of two different repos wait on the same named lock
AssertionError: expected '[machine-lock] ⏳ second repo gate is …' to contain '/private/var/folders/td/lj74ml2d0jz3t…'

- Expected
+ Received

- /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-y2l6ei/first-repo
+ [machine-lock] ⏳ second repo gate is waiting for tests: in use by first repo gate — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 38210, since 19:59:24)
+

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:389:27
    387|     expect(second.stdout).toContain("acquired");
    388|     expect(second.stderr).toContain("first repo gate");
    389|     expect(second.stderr).toContain(firstRepo.root);
       |                           ^
    390|     expect(second.ms).toBeGreaterThanOrEqual(1_000);
    391|     expect(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > copied-repository lock helpers execute in the requested caller checkout
AssertionError: expected '/Users/christian/Documents/GitHub/bki…' to be '/private/var/folders/td/lj74ml2d0jz3t…' // Object.is equality

Expected: "/private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-Yfcxmb/requested-caller"
Received: "/Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test"

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:410:35
    408|     );
    409|     expect(sourced.status, sourced.stderr).toBe(0);
    410|     expect(sourced.stdout.trim()).toBe(copied.root);
       |                                   ^
    411|     expect(command.status, command.stderr).toBe(0);
    412|     expect(command.stdout.trim()).toBe(copied.root);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 29 passed (31)
   Start at  19:59:08
   Duration  22.13s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-LRTNJo/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
