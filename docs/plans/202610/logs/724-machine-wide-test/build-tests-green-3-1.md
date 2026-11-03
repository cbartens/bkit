Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
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

## Gaps

- Task 4 `delete-still-referenced` — DELETE `wholeNumber` in `.bkit/core/engine/commands/workflow/runs.ts` is still referenced: `.bkit/core/engine/commands/lib.ts:95`, `.bkit/core/engine/commands/workflow/runs.ts:1299`, `.bkit/core/engine/commands/workflow/runs.ts:1300`, `.bkit/core/engine/commands/workflow/runs.ts:1402`, `.bkit/core/engine/commands/workflow/runs.ts:1403`, and 23 more — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null

## Already landed

- Task 5 `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "tests run under CI=1 never waits on a held tests lock" — passed at the group's red, and the tests step accepted it: the copied template already bypasses locking under CI=1 and the current CLI runs the gate successfully.; no red is due
- Task 5 `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` "a gate that itself exits 75 is a FAIL verdict, not a lock wait" — passed at the group's red, and the tests step accepted it: the existing CLI maps the wrapped gate's own 75 to FAIL; its recorded environment proves the template held the tests lock.; no red is due
