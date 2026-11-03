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
- Task 1 `delete-still-referenced` — DELETE `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is still referenced as `bkit-local-stack-lock`: `CHANGELOG.md:230`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:12`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:186`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:24`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:5`, and 1 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

```
     ✓ one process holds a named lock and the unnamed stack lock side by side 116ms
     ✓ a runner started by a named-lock holder does not wait on that named lock 1042ms
     ✓ the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other 1451ms
     ✓ run --lock holds the named lock for the command and passes its exit status on 68ms
     ✓ run exits 75 when the wait gives up, distinct from the command's own failure 158ms
     ✓ run exits 73 naming the path when the lock dir cannot be written 33ms
     ✓ run exits 73 naming /usr/bin/perl when perl is missing 28ms
     ✓ a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy 248ms
     ✓ run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name 152ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/machine-lock.integration.test.ts > bkit-machine-lock.sh > a named lock is machine-wide: checkouts of two different repos wait on the same named lock
AssertionError: expected '[machine-lock] ⏳ second repo gate is …' to contain '/private/var/folders/td/lj74ml2d0jz3t…'

- Expected
+ Received

- /private/var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-stack-lock-2HU4L6/first-repo
+ [machine-lock] ⏳ second repo gate is waiting for tests: in use by first repo gate — /Users/christian/Documents/GitHub/bkit/.worktrees/724-machine-wide-test (pid 88943, since 18:55:56)
+

 ❯ .bkit/core/engine/audits/templates/machine-lock.integration.test.ts:387:27
    385|     expect(second.stdout).toContain("acquired");
    386|     expect(second.stderr).toContain("first repo gate");
    387|     expect(second.stderr).toContain(firstRepo.root);
       |                           ^
    388|     expect(second.ms).toBeGreaterThanOrEqual(1_000);
    389|     expect(run("local_stack_lock_file tests", env, firstRepo.script).s…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 29 passed (30)
   Start at  18:55:39
   Duration  24.28s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-RBfxvY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
