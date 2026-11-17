Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: a95cf0503612ea99b7aed01a7080a6e7126763f3664d0baaa07fa4312aa6174c
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups)

## Integration Gaps

0. The lock script default (group 1), the docs and decision text (groups 2 and 3) and the Vitest global setup pin (group 4) fit together. Group 4 changes only raw heavy Vitest runs that take the lock in `vitest.test-lock.ts` global setup: with `BKIT_TEST_SLOTS` unset they ask the script for one slot, so they queue behind a holder of `tests.lock`. Wrapped gates still use the core-count default, because a wrapped run's global setup sees a live `LOCAL_STACK_LOCK_OWNER_tests` and takes no lock (`testLockDecision` returns `nested`). An explicit `BKIT_TEST_SLOTS` passes through unchanged. A raw run on slot 1 beside a wrapped run on `tests.2.lock` is the mixed-value overlap that `build-decision-1-2.md` chose to document rather than prevent, and the five docs and decision row `724-tests-lock-fixed-slots-not-live-load` (updates 4) say runs reading different values can hold slots at once. `docs/testing.md:558` (Raw Vitest bullet) still says heavy raw runs queue for the `tests` lock, which stays true.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS, 0 gaps, over groups 1 and 2 (tasks 1-5).
- `build-plan-verify-holistic-2.md`: PASS, 0 gaps, over groups 1-3 (tasks 1-6), before group 4 existed.
- Group checks: `build-plan-verify-1-1.md` (CONCERNS, closed by TASK 5 after `build-decision-1-1.md` chose `Fix now`), `build-plan-verify-1-2.md`, `build-plan-verify-2-1.md`, `build-plan-verify-3-1.md` and `build-plan-verify-4-1.md` (all PASS).
- `build-decision-1-2.md` (challenge round 1) chose `Fix now` with the per-process, docs-only design, which created TASK 6. Group 4 (the plan's challenge round 2 findings) added TASK 7.

## Notes

- Test base: the Context named none, so the base is `376636725de5a565acf788b1f82f92ad55d4f063`, the `parentSha` of the run's last clean holistic check (`build-plan-verify-holistic-2.md`, PASS); `git merge-base --is-ancestor` confirms it is on the branch. `BKIT_TEST_SLOTS=2 node dist/cli.js tests changed --base=376636725de5a565acf788b1f82f92ad55d4f063 --fallback=bkit:gate:static-unit` exited 0, verdict PASS: 16 changed files; related run 239 files and 9840 tests passed (2 skipped, not in this change); named run 51 files and 3957 tests passed, including `vitest-test-lock.integration.test.ts` and `tests-lock.integration.test.ts`; lint, Prettier and typecheck passed.
- The lock script did not change since that base, so the lock test files were also run by name with `BKIT_TEST_SLOTS=2`: `machine-lock.integration.test.ts` 74/74, `branches-lock.integration.test.ts` 2/2, `tests-lock.integration.test.ts` 18/18 and `vitest-test-lock.integration.test.ts` 4/4 pass on this 10-core machine.
- TASK 1: `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds; the script diff matches every UPDATE line; the test file passes.
- TASK 2: `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists only `machine-lock.integration.test.ts` (4 cores pinned in `envFor`), `tests-lock.integration.test.ts` and `branches-lock.integration.test.ts` (both pin `BKIT_TEST_SLOTS: "1"`); both pass on 10 cores.
- TASK 5: the override test kills the `override one` holder before the three-slot half, keeps its name and passes.
- TASK 3: `git grep -n "default 1"` over the five named docs matches no `BKIT_TEST_SLOTS` line.
- TASK 4 and TASK 6: `node dist/cli.js ledgers query --ledger=decisions --status=ACTIVE --key=724-tests-lock-fixed-slots-not-live-load` returns one ACTIVE row (updates 4) with the core-count default and the per-process override sentence. The old-wording `git grep` finds no match (exit 1), and each of the five docs has one line with "in every place runs start from".
- TASK 7: `vitest.test-lock.ts:81-89` spawns the lock command with `BKIT_TEST_SLOTS: process.env.BKIT_TEST_SLOTS ?? "1"`. Its TEST FIRST test `with slots unset on 10 cores, the global setup waits for a held tests lock` exists and passes.
- `node dist/cli.js check` exits 0: 0 writes would occur, 0 blockers, 14 advisories, none about this change.
- Every Derived Test Matrix row has its test named in the TEST FIRST of TASK 1, TASK 5 or TASK 7, and the files holding them pass.
- The invalid-slots note goes to stderr with the `[machine-lock]` prefix, like the other lock messages, and TASK 7 adds no new error path, so `docs/observability.md` raises no gap. The plan has no `Documentation Updates` section; TASKS 3 and 6 cover the docs.
- `build-decision-1-1.md` and `build-decision-1-2.md` are `Fix now` (they created TASK 5 and TASK 6), not accepts, so they close no gap by themselves.
- No test-first audit report was supplied for this holistic check.
- The working tree's uncommitted edits to the plan and `status.jsonl` belong to the orchestrator and were left untouched.

## Identified Gaps Log

None
