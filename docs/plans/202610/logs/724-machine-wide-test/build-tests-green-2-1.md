Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
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

## Gaps

None.

## Already landed

- Task 2 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "a killed tests-lock holder frees its slot within a second and the waiter starts" — passed at the group's red, and the tests step accepted it: the existing Perl holder detects its dead parent and releases flock; the waiter polls each second (.bkit/templates/scripts/ci/bkit-machine-lock.sh:129,155).; no red is due
