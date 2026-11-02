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
| 4 | bkit's gates take the tests lock; workflows route exit 81 | 3 | 7 | 11.8 |
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
