Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 6, attempt 1

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "terminating a run wrapper stops its gate before another run acquires the tests lock" | red | failure: expected 'gate-still-alive\nacquired\n' not to contain 'gate-still-alive' |
| 14 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "a build close push retry does not repeat workflow close or lose its outputs" | red | failure: expected ' "{BKIT}" roadmap mirror --workflow…' not to match /\bbranches push\b\|\blocks release\b/ |

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

[test-timeout-budget] load average 49.8 on 10 cores: unit limits 24907ms per test, 49814ms per hook (x4.98)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts (43 tests | 1 failed) 87116ms
   ✓ machine lock slots, order and wait budgets (11)
     ✓ reports a remaining numbered slot under bash -e after the primary slot is released 1027ms
     ✓ with N slots, N runs hold a named lock at once and run N+1 waits naming every holder 3156ms
     ✓ a slots value that is not a whole number >= 1 falls back to 1 and says so 6349ms
     ✓ the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one 1762ms
     ✓ a killed tests-lock holder frees its slot within a second and the waiter starts 1557ms
     ✓ taking the tests lock while holding the stack lock is refused, naming the lock order 312ms
     ✓ taking the tests lock while holding another named lock is refused, naming the lock order 644ms
     ✓ taking a named lock while holding the stack lock is refused, naming the lock order 780ms
     ✓ a child of a stack-lock holder asking for the tests lock is refused, naming the lock order 1276ms
     ✓ a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set 6235ms
     ✓ the tests lock records its held time by checkout on release and the next waiting note names the holder's last run 6423ms
   ❯ bkit-machine-lock.sh (32)
     × terminating a run wrapper stops its gate before another run acquires the tests lock 2592ms
     ✓ punctuation in distinct named locks keeps acquisition and release state separate 1165ms
     ✓ unset owner state is safe under bash -eu for lock "" 671ms
     ✓ unset owner state is safe under bash -eu for lock "tests" 908ms
     ✓ unset owner state is safe under bash -eu for lock "a-b" 909ms
     ✓ a second run cannot take the lock while the first holds it, and is told who holds it 1479ms
     ✓ a killed holder leaves no stale lock 3345ms
     ✓ a waiting run starts as soon as the holder finishes, having said who it waits for 4977ms
     ✓ the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder 2966ms
     ✓ release frees the lock before the caller exits 2561ms
     ✓ a caller under `set -e` survives a refused try 1442ms
     ✓ a caller under `set -e` survives releasing a holder that is already gone 992ms
     ✓ a runner started by the holder does not wait on its parent 1704ms
     ✓ a stack named by BKIT_LOCAL_STACK never waits on the shared one 2533ms
     ✓ every worktree of one repo resolves the main checkout's lock, and waits on it 3132ms
     ✓ outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why 228ms
     ✓ a holder that stops before it answers fails the take at once instead of hanging 2331ms
     ✓ CI=true is a no-op that creates no lock file 121ms
     ✓ CI=1 is a no-op that creates no lock file 131ms
     ✓ `run` holds the lock for the command and passes its exit status on 423ms
     ✓ `run` with no arguments prints usage and exits 2 64ms
     ✓ a named lock is machine-wide: checkouts of two different repos wait on the same named lock 5097ms
     ✓ copied-repository lock helpers execute in the requested caller checkout 2093ms
     ✓ one process holds a named lock and the unnamed stack lock side by side 2212ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 1632ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 2533ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 329ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 1811ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 302ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 263ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 2321ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 4311ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > terminating a run wrapper stops its gate before another run acquires the tests lock
AssertionError: expected 'gate-still-alive\nacquired\n' not to contain 'gate-still-alive'

- Expected
+ Received

  gate-still-alive
+ acquired
+

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:497:31
    495|       // Keeping the lock until the gate stops and cancelling the gate…
    496|       expect([0, 75], next.stderr).toContain(next.status);
    497|       expect(next.stdout).not.toContain("gate-still-alive");
       |                               ^
    498|       const expectedOutput: Record<string, string> = { "0": "acquired\…
    499|       expect(next.stdout).toBe(expectedOutput[String(next.status)]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 42 passed (43)
   Start at  13:21:41
   Duration  87.61s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Fi7ZAW/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

```

## Runner output — `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test
> node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/workflows/local-gate-audit.test.ts

[test-timeout-budget] load average 46.7 on 10 cores: unit limits 23334ms per test, 46668ms per hook (x4.67)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts (33 tests | 1 failed | 2 skipped) 161ms
   ❯ bkit-local-gate-audit (#437) (33)
     × a build close push retry does not repeat workflow close or lose its outputs 18ms
     ✓ every prompt that runs bkit tests changed routes exit 81 to a re-run of the command 5ms
     ✓ no toolchain command is inlined at a call site (2)
       ✓ `pnpm turbo` appears nowhere unexempted — names a task runner instead of a bkit:gate* script 37ms
       ✓ `--filter='...[origin/dev]'` appears nowhere unexempted — turbo affected-selector inlined at a call site 9ms
     ✓ every call site dispatches through a named gate (9)
       ✓ .bkit/templates/.husky/pre-commit runs `pnpm bkit:gate:format` 1ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:static-unit` 2ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:static` 0ms
       ✓ .bkit/templates/.husky/pre-push runs `pnpm bkit:gate:min` 1ms
       ✓ .bkit/core/prompts/bkit-build-plan-tasks.md runs `--fallback=bkit:gate:static`` 1ms
       ✓ .bkit/core/prompts/bkit-build-plan-gaps-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-debug-failure-remediate.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-build-plan-verify.md runs `--fallback=bkit:gate:static-unit`` 0ms
       ✓ .bkit/core/prompts/bkit-ship-conflict-resolve.md runs `pnpm bkit:gate:install-static-unit-build` 0ms
     ✓ every gate a call site names is one install actually seeds 1ms
     ✓ workflows run the local gate only through `bkit tests run` 4ms
     ✓ every tests run call site routes exit 81 to a re-run of its block 23ms
     ✓ every branches push call site routes exit 81 to a re-run of its block 31ms
     ✓ a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt 16ms
     ✓ every `tests run` call site of a workflow is probed 2ms
     ✓ bkit-build.md build-run-tests runs the deepest declared gate (through integration) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 2ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-build.md build-group-gate- runs the deepest declared gate (through unit) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ↓ routes the engine's gate list where a block passes {GATE_FLAGS}
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ bkit-debug.md tests run runs the deepest declared gate (through live) (4)
       ✓ passes every candidate, in descending depth, at each of its 1 call site(s) 0ms
       ✓ routes the engine's gate list where a block passes {GATE_FLAGS} 0ms
       ✓ falls back to a gate install actually seeds, so the chain terminates 0ms
       ✓ never swallows a could-not-run exit, so an undeclared gate fails loud 0ms
     ✓ only debug reaches the live tier, and only its deepest gate carries the `live` word 1ms
     ✓ the seeded gates chain only scripts that exist here or are themselves gates 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/workflows/local-gate-audit.test.ts > bkit-local-gate-audit (#437) > a build close push retry does not repeat workflow close or lose its outputs
AssertionError: expected '   "{BKIT}" roadmap mirror --workflow…' not to match /\bbranches push\b|\blocks release\b/

- Expected:
/\bbranches push\b|\blocks release\b/

+ Received:
"   \"{BKIT}\" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
   \"{BKIT}\" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox=\"{OUTBOX}\" --message=\"chore({FID}): close-workflow\" {LABEL_FLAGS} --number=16 --post --title=\"Close Workflow & Create PR\" --tree={BRANCH} --final-return --summary-file=\"docs/plans/{YYYYMM}/logs/{FID}/build-summary.md\" --session-dir=\"{SESSION_DIR}\" --line=\"CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug.\" || exit 1
   \"{BKIT}\" branches push --mode=feature --require-ci >/dev/null || exit \"$?\"
   \"{BKIT}\" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
"

 ❯ .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:157:29
    155|     const close = closeBlocks[0]!;
    156|     expect(close.block).toContain("--final-return");
    157|     expect(close.block).not.toMatch(/\bbranches push\b|\blocks release…
       |                             ^
    158|     const closeAt = body.indexOf(close.block);
    159|     const pushBlocks = commandRoutes(body.slice(closeAt), /\bbranches …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 30 passed | 2 skipped (33)
   Start at  13:23:21
   Duration  1.38s (transform 41%, import 25%, tests 24%, setup 9%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-l6eXJZ/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
