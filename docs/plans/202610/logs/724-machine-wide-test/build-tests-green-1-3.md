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

## Gaps

- Task 1 `delete-still-referenced` — DELETE `.bkit/templates/scripts/ci/bkit-local-stack-lock.sh` is still referenced as `bkit-local-stack-lock`: `CHANGELOG.md:230`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:12`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:186`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:24`, `tests/fixtures/machine-lock/stack-lock-6.0.0.sh:5`, and 1 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
