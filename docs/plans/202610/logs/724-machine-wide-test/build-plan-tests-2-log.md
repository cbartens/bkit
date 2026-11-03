Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 2: named holder text and caller checkout from .bkit/templates/scripts/ci/bkit-machine-lock.sh:106
SOURCE — TASK 2: waiting and timeout text from .bkit/templates/scripts/ci/bkit-machine-lock.sh:143
SOURCE — TASK 2: worker arithmetic and getconf core fixture from docs/plans/202610/logs/724-machine-wide-test/build-brief-tests-2-1.md:103
SOURCE — TASK 2: tab-separated history fixture and duration suffix from docs/plans/202610/logs/724-machine-wide-test/build-brief-tests-2-1.md:104
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with N slots, N runs hold a named lock at once and run N+1 waits naming every holder`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a slots value that is not a whole number >= 1 falls back to 1 and says so`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock exports BKIT_TEST_WORKERS as cores divided by slots, minus one, never below one`
PASSES — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a killed tests-lock holder frees its slot within a second and the waiter starts`: the existing Perl holder detects its dead parent and releases flock; the waiter polls each second (.bkit/templates/scripts/ci/bkit-machine-lock.sh:129,155).
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding the stack lock is refused, naming the lock order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking the tests lock while holding another named lock is refused, naming the lock order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `taking a named lock while holding the stack lock is refused, naming the lock order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a child of a stack-lock holder asking for the tests lock is refused, naming the lock order`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a run with no TTY caps the lock wait at 60 s unless LOCAL_STACK_LOCK_WAIT_S is set`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the tests lock records its held time by checkout on release and the next waiting note names the holder's last run`
