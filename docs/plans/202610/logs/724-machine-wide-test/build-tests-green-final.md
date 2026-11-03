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
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a named lock is machine-wide: checkouts of two different repos wait on the same named lock" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "one process holds a named lock and the unnamed stack lock side by side" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by a named-lock holder does not wait on that named lock" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run --lock holds the named lock for the command and passes its exit status on" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 75 when the wait gives up, distinct from the command's own failure" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming the path when the lock dir cannot be written" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run exits 73 naming /usr/bin/perl when perl is missing" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "copied-repository lock helpers execute in the requested caller checkout" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "with N slots, N runs hold a named lock at once and run N+1 waits naming every holder" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a slots value that is not a whole number >= 1 falls back to 1 and says so" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a killed tests-lock holder frees its slot within a second and the waiter starts" | passed-accepted | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "taking the tests lock while holding the stack lock is refused, naming the lock order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "taking the tests lock while holding another named lock is refused, naming the lock order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "taking a named lock while holding the stack lock is refused, naming the lock order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a child of a stack-lock holder asking for the tests lock is refused, naming the lock order" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "the tests lock records its held time by checkout on release and the next waiting note names the holder's last run" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run waits for a held tests lock and runs the gate once the holder finishes" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run exits 81 naming the holder when the lock stays held past --lock-wait-s" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run holds the tests lock for the whole gate, so a second tests run waits" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests red runs its test file without waiting for a held tests lock" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run under CI=true never waits on a held tests lock" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run under CI=1 never waits on a held tests lock" | passed-accepted | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run with an unwritable lock dir exits 4 naming the path" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run with --lock-wait-s=0 exits 81 at once against a held lock" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a gate that itself exits 75 is a FAIL verdict, not a lock wait" | passed-accepted | passed |
| 5 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run --file appends no test-run row when it exits 81 on a held tests lock" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests changed with an unwritable lock dir exits 4 naming the path" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` "tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every prompt that runs bkit tests changed routes exit 81 to a re-run of the command" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/package-json.test.ts` "bkit's root package.json wraps every test-running bkit:gate script in the tests lock" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every tests run call site routes exit 81 to a re-run of its block" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` "branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts` "branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" | passed-accepted | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a run whose every filter is an existing test file is light and takes no lock" | red-not-loaded | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a run with no filters, or a pattern filter, is heavy and takes the tests lock" | red-not-loaded | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a run started under a live tests-lock owner takes no lock" | red-not-loaded | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "CI=true takes no lock" | red-not-loaded | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "CI=1 takes no lock" | red-not-loaded | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "BKIT_TEST_WORKERS sets maxWorkers when present" | red-not-loaded | passed |
| 8 | `.bkit/core/engine/audits/repo/vitest-test-lock.test.ts` "a watch-mode run takes no lock" | red-not-loaded | passed |
| 9 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "the global setup waits for a held tests lock and takes it once the holder ends" | red-not-loaded | passed |
| 9 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "the global setup throws naming the holder when the wait gives up" | red-not-loaded | passed |
| 9 | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` "the global setup's teardown frees the tests lock" | red-not-loaded | passed |
| 13 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "terminating a run wrapper stops its gate before another run acquires the tests lock" | red | passed |
| 14 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "a build close push retry does not repeat workflow close or lose its outputs" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is still referenced as `bkit-local-stack-lock`: `CHANGELOG.md:240`, `docs/plans/202611/logs/825-show-progress-bar/run-tests-1.md:2105`, `docs/plans/202611/logs/825-show-progress-bar/run-tests-1.md:2862`, `docs/plans/202611/logs/830-debug-diagnose-named/run-tests-1.md:2725`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:12`, and 4 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
- Task 4 `delete-still-referenced` — DELETE `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts` is still referenced: `.bkit/core/engine/commands/lib.ts:96`, `.bkit/core/engine/commands/workflow/branches.ts:39`, `.bkit/core/engine/commands/workflow/branches.ts:873`, `.bkit/core/engine/commands/workflow/runs.ts:1698`, `.bkit/core/engine/commands/workflow/runs.ts:1699`, and 27 more — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null

## Already landed

- Task 2 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a killed tests-lock holder frees its slot within a second and the waiter starts" — passed at the group's red, and the tests step accepted it: the existing Perl holder detects its dead parent and releases flock; the waiter polls each second (.bkit/templates/scripts/ci/bkit-machine-lock.sh:129,155).; no red is due
- Task 5 `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run under CI=1 never waits on a held tests lock" — passed at the group's red, and the tests step accepted it: the copied template already bypasses locking under CI=1 and the current CLI runs the gate successfully.; no red is due
- Task 5 `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a gate that itself exits 75 is a FAIL verdict, not a lock wait" — passed at the group's red, and the tests step accepted it: the existing CLI maps the wrapped gate's own 75 to FAIL; its recorded environment proves the template held the tests lock.; no red is due
- Task 11 `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "every branches push call site routes exit 81 to a re-run of its block" — passed at the group's red, and the tests step accepted it: all active canonical push routes already satisfy the contract after rebase; the expected inventory now reflects dev's deliberate deletion. The focused file passes 31 cases with two unchanged conditional skips (tmp/724-group4-rebase-tests.log); file lint, Prettier check and scoped diff check pass. No production or plan file was edited.; no red is due
