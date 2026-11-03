Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 4: give-up, refusal and lock-order message fixtures from .bkit/templates/scripts/ci/bkit-machine-lock.sh:154,178,182,317
SOURCE — TASK 4: whole-number validation message from .bkit/core/engine/commands/workflow/runs.ts:1190
SOURCE — TASK 4: gate env merges into real process env in .bkit/core/engine/commands/workflow/tests.ts:103
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` `a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` `a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` `a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` `tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` `tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/tests.test.ts` `a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4`
SOURCE — TASK 5: real lock holder format, workers export, CI bypass and run wrapper from .bkit/templates/scripts/ci/bkit-machine-lock.sh:123,157,254,390
SOURCE — TASK 5: failing JUnit fixture and BKIT_TEST_REPORT from .bkit/core/engine/commands/workflow/tests.ts:203,1098 and .bkit/core/engine/commands/workflow/tests.test.ts:1747
SOURCE — TASK 5: package runner argv from .bkit/core/engine/shared/package-manager.ts:12
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run waits for a held tests lock and runs the gate once the holder finishes`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run exits 81 naming the holder when the lock stays held past --lock-wait-s`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run holds the tests lock for the whole gate, so a second tests run waits`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests red runs its test file without waiting for a held tests lock`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=true never waits on a held tests lock`
PASSES — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run under CI=1 never waits on a held tests lock`: the copied template already bypasses locking under CI=1 and the current CLI runs the gate successfully.
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with an unwritable lock dir exits 4 naming the path`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run with --lock-wait-s=0 exits 81 at once against a held lock`
PASSES — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `a gate that itself exits 75 is a FAIL verdict, not a lock wait`: the existing CLI maps the wrapped gate's own 75 to FAIL; its recorded environment proves the template held the tests lock.
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `the gate runs with BKIT_TEST_WORKERS and LOCAL_STACK_LOCK_OWNER_tests set, and a nested run --lock tests inside it does not wait`
SOURCE — TASK 10: status row shape and append behavior from .bkit/core/engine/commands/workflow/tests.ts:151
SOURCE — TASK 10: changed gate selection and logged exit from .bkit/core/engine/commands/workflow/tests-changed.ts:113,133
SOURCE — TASK 10: changed-runner argument spy from .bkit/core/engine/commands/workflow/tests-changed.test.ts:61
SOURCE — TASK 10: fallback caller inventory from .bkit/core/engine/audits/workflows/local-gate-audit.test.ts:104
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests run --file appends no test-run row when it exits 81 on a held tests lock`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests changed with an unwritable lock dir exits 4 naming the path`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `tests changed with a --lock-wait-s that is not a whole number exits 2 and runs no gate`
WROTE — TASK 10: `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `every prompt that runs bkit tests changed routes exit 81 to a re-run of the command`
SOURCE — TASK 5: CI bypass and worker export confirmed at .bkit/templates/scripts/ci/bkit-machine-lock.sh:140,110; holder line at :254 and the run wrapper at :390 refer to the copied template, executed without mocking.
SOURCE — TASK 5: corrected template locations for the holder line and run wrapper are .bkit/templates/scripts/ci/bkit-machine-lock.sh:255 and :369 (the earlier :254 and :390 references were imprecise).
