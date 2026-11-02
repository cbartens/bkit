Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log
BLOCKED — TASK 1: test `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a named lock is machine-wide: checkouts of two different repos wait on the same named lock` — holdNamed and run source the copied script without setting cwd, but expect the copied script repository as the holder checkout; task specifies the caller checkout from git -C "$PWD", which remains this worktree.
BLOCKED — TASK 1: named machine-wide lock API — focused tests passed 394/395; the unchanged planned cwd assertion blocks completion. Bash syntax, identical dogfood copy, frozen merge-base fixture, catalog checks, fresh-consumer install and real named-lock acquire/release passed; bkit:generate passed. Required tests changed passed lint, formatting and both typechecks, but its named lane failed the planned cwd assertion and the existing build-plan-tests comment-number mismatch (tmp/724-group1-changed.log).
