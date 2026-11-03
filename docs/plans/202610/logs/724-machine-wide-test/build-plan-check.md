Problems: 0
Existence: 2

<!-- verdict:end -->

# Plan Check

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`. Caps: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task.

## Groups

<!-- prettier-ignore -->
| Group | Title | Tasks | TEST FIRST tests | KB |
| --- | --- | --- | --- | --- |
| 1 | Machine lock script — named locks | 2 | 11 | 7.3 |
| 2 | Slots, lock order, no-TTY wait and template docs | 2 | 10 | 6.9 |
| 3 | `bkit tests run` and `bkit tests changed` read the tests-lock outcome of a wrapped gate | 3 | 21 | 16.0 |
| 4 | bkit's gates take the tests lock; workflows route exit 81 | 3 | 7 | 12.5 |
| 5 | bkit's own raw vitest runs queue too | 2 | 10 | 4.8 |

## Tasks

<!-- prettier-ignore -->
| Task | Group | Tests | Test files |
| --- | --- | --- | --- |
| 1 | 1 | 10 | 1 |
| 12 | 1 | 1 | 1 |
| 2 | 2 | 10 | 1 |
| 3 | 2 | 0 | 0 |
| 4 | 3 | 6 | 1 |
| 5 | 3 | 10 | 1 |
| 10 | 3 | 5 | 3 |
| 6 | 4 | 2 | 2 |
| 7 | 4 | 2 | 1 |
| 11 | 4 | 3 | 2 |
| 8 | 5 | 7 | 1 |
| 9 | 5 | 3 | 1 |

## Problems

None.

## Existence (reported only)

- `docs/plans/202610/724-machine-wide-test-plan.md:741` — TASK 1: `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` does not exist
- `docs/plans/202610/724-machine-wide-test-plan.md:742` — TASK 1: `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts` does not exist

## Planned test names already in use (reported only)

- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a named lock is machine-wide: checkouts of two different repos wait on the same named lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "one process holds a named lock and the unnamed stack lock side by side" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a runner started by a named-lock holder does not wait on that named lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "run --lock holds the named lock for the command and passes its exit status on" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "run exits 75 when the wait gives up, distinct from the command's own failure" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "run exits 73 naming the path when the lock dir cannot be written" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "run exits 73 naming /usr/bin/perl when perl is missing" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:748` TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "with N slots, N runs hold a named lock at once and run N+1 waits naming every holder" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a slots value that is not a whole number >= 1 falls back to 1 and says so" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a killed tests-lock holder frees its slot within a second and the waiter starts" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "taking the tests lock while holding the stack lock is refused, naming the lock order" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "taking the tests lock while holding another named lock is refused, naming the lock order" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "taking a named lock while holding the stack lock is refused, naming the lock order" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a child of a stack-lock holder asking for the tests lock is refused, naming the lock order" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:786` TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` already holds a test named "the tests lock records its held time by checkout on release and the next waiting note names the holder's last run" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:834` TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:834` TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:834` TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:834` TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:834` TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:834` TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` already holds a test named "a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run waits for a held tests lock and runs the gate once the holder finishes" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run exits 81 naming the holder when the lock stays held past --lock-wait-s" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run holds the tests lock for the whole gate, so a second tests run waits" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests red runs its test file without waiting for a held tests lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run under CI=true never waits on a held tests lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run under CI=1 never waits on a held tests lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run with an unwritable lock dir exits 4 naming the path" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "tests run with --lock-wait-s=0 exits 81 at once against a held lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "a gate that itself exits 75 is a FAIL verdict, not a lock wait" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:859` TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:917` TASK 6: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` already holds a test named "a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:917` TASK 6: `.bkit/core/engine/audits/repo/package-json.test.ts` already holds a test named "bkit's root package.json wraps every test-running bkit:gate script in the tests lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:935` TASK 7: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` already holds a test named "every tests run call site routes exit 81 to a re-run of its block" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:935` TASK 7: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` already holds a test named "a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:965` TASK 11: `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` already holds a test named "branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:965` TASK 11: `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` already holds a test named "branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push" — name the update to it in TEST FIRST, or give the new test a new name
- `docs/plans/202610/724-machine-wide-test-plan.md:965` TASK 11: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` already holds a test named "every branches push call site routes exit 81 to a re-run of its block" — name the update to it in TEST FIRST, or give the new test a new name
