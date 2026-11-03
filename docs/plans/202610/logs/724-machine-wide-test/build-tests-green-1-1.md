Enforced: true
Verdict: null
Gaps: 2
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a named lock is machine-wide: checkouts of two different repos wait on the same named lock" | red | not passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "one process holds a named lock and the unnamed stack lock side by side" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by a named-lock holder does not wait on that named lock" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run --lock holds the named lock for the command and passes its exit status on" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 75 when the wait gives up, distinct from the command's own failure" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the path when the lock dir cannot be written" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming /usr/bin/perl when perl is missing" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name" | red | passed |

## Gaps

- Task 1 `not-green` — "a named lock is machine-wide: checkouts of two different repos wait on the same named lock" failure: expected '[machine-lock] ⏳ second repo gate is …' to contain '/private/var/folders/td/lj74ml2d0jz3t…' — Fixable: true — log: TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` — not-green — Fixable: true
- Task 1 `delete-still-referenced` — DELETE `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is still referenced as `bkit-local-stack-lock`: `.bkit/core/.bkit/templates.md:881`, `.bkit/core/.bkit/templates.md:887`, `.bkit/core/.bkit/templates.md:888`, `.bkit/templates.md:881`, `.bkit/templates.md:887`, and 7 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```
     ✓ one process holds a named lock and the unnamed stack lock side by side 129ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 1044ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1247ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 59ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 137ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 25ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 20ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 175ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 103ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a named lock is machine-wide: checkouts of two different repos wait on the same named lock
AssertionError: expected '[machine-lock] ⏳ second repo gate is …' to contain '/private/var/folders/td/lj74ml2d0jz3t…'

- Expected
+ Received

- /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-MMIrvC/first-repo
+ [machine-lock] ⏳ second repo gate is waiting for tests: in use by first repo gate — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 11365, since 18:41:50)
+

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:349:27
    347|     expect(second.stdout).toContain("acquired");
    348|     expect(second.stderr).toContain("first repo gate");
    349|     expect(second.stderr).toContain(firstRepo.root);
       |                           ^
    350|     expect(second.ms).toBeGreaterThanOrEqual(1_000);
    351|     expect(run("local_stack_lock_file tests", env, firstRepo.script).s…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 25 passed (26)
   Start at  18:41:36
   Duration  20.74s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-O5Cwi9/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
