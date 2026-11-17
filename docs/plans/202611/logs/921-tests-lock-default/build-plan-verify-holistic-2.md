Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: a3f8e24be46b01ee58be0cb47f8932c1ffb1b67575b6d52feb58d649043e8afe
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups)

## Integration Gaps

0. The script default (group 1), the docs and decision text (group 2) and the per-process override advice (group 3) state one rule: 2 slots on 8 or more cores, else 1; `BKIT_TEST_SLOTS` overrides; an invalid value falls back to that default with one note; `BKIT_TEST_WORKERS` follows the chosen slot count; the value is read per process, so an override goes in every place runs start from or nowhere. Group 3 reworded the group 2 "user-level host settings or the shell profile" advice in all five docs, so no doc still carries the old wording. The decision row `724-tests-lock-fixed-slots-not-live-load` (updates 4) keeps the group 2 description and adds the group 3 sentence. No shipped host settings file sets `BKIT_TEST_SLOTS`; the only other copy naming it is the preserved fixture `tests/fixtures/machine-lock/machine-lock-6.1.1.sh`.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS, 0 gaps, over groups 1 and 2 (tasks 1-5), before group 3 existed.
- Group checks: `build-plan-verify-1-1.md` (CONCERNS, closed by TASK 5 after `build-decision-1-1.md` chose `Fix now`), `build-plan-verify-1-2.md` (PASS), `build-plan-verify-2-1.md` (PASS), `build-plan-verify-3-1.md` (PASS).
- `build-decision-1-2.md` (challenge round 1) chose `Fix now` with a docs-only, per-process design, which created TASK 6 in group 3.

## Notes

- Test base: the Context named none, so the base is `eee33be27617ec7229b1779c3b578d0a6652cf9d`, the `parentSha` of the run's last clean holistic check (`build-plan-verify-holistic-1.md`, PASS; `git merge-base --is-ancestor` confirms it is on the branch). `bkit tests changed --base=eee33be27617ec7229b1779c3b578d0a6652cf9d --fallback=bkit:gate:static-unit` exited 0, verdict PASS: 20 changed files (group 3 docs, ledger rows and plan logs), named vitest run 84 files and 6259 tests passed (2 skipped, not in this change), bats and prettier passed.
- The lock script and its tests did not change since that base, so the three lock test files were also run by name: `machine-lock.integration.test.ts` 74/74, `tests-lock.integration.test.ts` 18/18 and `branches-lock.integration.test.ts` 2/2 pass on this 10-core machine.
- TASK 1: `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds; the script diff matches every UPDATE line; the test file passes.
- TASK 2: `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists only `machine-lock.integration.test.ts` (4 cores pinned in `envFor`), `tests-lock.integration.test.ts` and `branches-lock.integration.test.ts` (both pin `BKIT_TEST_SLOTS: "1"`); both pass on 10 cores.
- TASK 5: the override test kills the `override one` holder before the three-slot half, keeps its name and passes.
- TASK 3: `git grep -n "default 1"` over the five named docs matches no `BKIT_TEST_SLOTS` line. `.bkit/templates.md` and `.bkit/workflows.md` equal their `.bkit/core/.bkit/` sources below the managed-marker line.
- TASK 4 and TASK 6: `bkit ledgers query --ledger=decisions --status=ACTIVE --key=724-tests-lock-fixed-slots-not-live-load` returns one ACTIVE row (updates 4) with the core-count default and the per-process override sentence.
- TASK 6: the old-wording `git grep` finds no match (exit 1), and each of the five docs has one line with "in every place runs start from ... or nowhere".
- `node dist/cli.js check` exits 0: 0 writes would occur, 0 blockers, 14 advisories, none about this change.
- Every Derived Test Matrix row has its test named in TASK 1's or TASK 5's TEST FIRST, and the file holding them passes.
- The invalid-slots note goes to stderr with the `[machine-lock]` prefix, like the other lock messages, so `docs/observability.md` raises no gap. The plan has no `Documentation Updates` section; TASKS 3 and 6 cover the docs.
- `build-decision-1-1.md` and `build-decision-1-2.md` are `Fix now` (they created TASK 5 and TASK 6), not accepts, so they close no gap by themselves.
- No test-first audit report was supplied for this holistic check.
- The working tree's uncommitted edits to the plan and `status.jsonl` belong to the orchestrator and were left untouched.

## Identified Gaps Log

None
