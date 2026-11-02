Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 1: unnamed cache path and holder sidecar from .bkit/templates/scripts/ci/bkit-local-stack-lock.sh:62
SOURCE — TASK 1: holder line checkout, pid and start time from .bkit/templates/scripts/ci/bkit-local-stack-lock.sh:128
SOURCE — TASK 1: inherited owner liveness check from .bkit/templates/scripts/ci/bkit-local-stack-lock.sh:78
SOURCE — TASK 1: function refusal status and explicit release from .bkit/templates/scripts/ci/bkit-local-stack-lock.sh:173
SOURCE — TASK 1: named lock API, run exit codes and optional who precedence from docs/plans/202610/logs/724-machine-wide-test/build-brief-tests-1-1.md:107
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `one process holds a named lock and the unnamed stack lock side by side`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a named-lock holder does not wait on that named lock`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the unnamed stack lock keeps its lock file path, so an older copy and this one exclude each other`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run --lock holds the named lock for the command and passes its exit status on`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming the path when the lock dir cannot be written`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 73 naming /usr/bin/perl when perl is missing`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a runner started by a tests-lock holder still waits on a held unnamed stack lock, under this script and under an older copy`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run with no who names the run from LOCAL_STACK_LOCK_WHO, else the package.json script name`
SOURCE — TASK 1: corrected holder line checkout, pid and start-time reference: .bkit/templates/scripts/ci/bkit-local-stack-lock.sh:125
SOURCE — TASK 1: corrected named-lock API, run exit-code and optional-who reference: docs/plans/202610/logs/724-machine-wide-test/build-brief-tests-1-1.md:103
