Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: acf70c42efcab079742380ec457c190fdf8ea2b299c88b98a868658a80869def
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups)

## Integration Gaps

0. The script default (group 1) and the docs and decision text (group 2) state the same rule: 2 slots on 8 or more cores, else 1; `BKIT_TEST_SLOTS` overrides; an invalid value falls back to that default with one note; `BKIT_TEST_WORKERS` follows the chosen slot count. The note text `[machine-lock] invalid BKIT_TEST_SLOTS; using N slot(s)` matches between the script and its tests.

## Previously Attempted

None. This is the first holistic check. Group checks: `build-plan-verify-1-1.md` (CONCERNS, closed by TASK 5 after `build-decision-1-1.md` chose `Fix now`), `build-plan-verify-1-2.md` (PASS), `build-plan-verify-2-1.md` (PASS).

## Notes

- Test base: `origin/dev` (first holistic check). `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 with verdict PASS: related run 239 files and 9839 tests passed, named run 179 files and 8762 tests passed, plus node test, bats, lint, format and typecheck stages. The named run included `machine-lock.integration.test.ts`, `tests-lock.integration.test.ts` and `branches-lock.integration.test.ts`. The changed set is wide (361 files) because the branch was cut from local dev, which carries commits not yet on `origin/dev`.
- The run's own changes (`1ae01d449..HEAD`, plan logs excluded) touch 12 files, all named by a task, plus `.bkit/friction.jsonl` rows the orchestrator wrote.
- TASK 1: `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds. The script diff matches every UPDATE line (`_local_stack_lock_cores`, the core-count default in `_local_stack_lock_slots`, `_local_stack_lock_workers` reusing `_lsl_cores`, `_lsl_cores` local in `_local_stack_lock`, header comment, `envFor` 4-core fake `getconf`). The test file passed in the changed run.
- TASK 2: `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists only `machine-lock.integration.test.ts` (4 cores pinned in `envFor`), `tests-lock.integration.test.ts` and `branches-lock.integration.test.ts` (both pin `BKIT_TEST_SLOTS: "1"`). Both passed on this 10-core machine.
- TASK 5: the override test kills the `override one` holder before the three-slot half and keeps its name; it passed.
- TASK 3: `git grep -n "default 1"` over the five named docs matches no `BKIT_TEST_SLOTS` line. The `.bkit/templates.md` and `.bkit/workflows.md` mirrors equal their core sources below the managed-marker line. `node dist/cli.js check` exits 0 with 0 writes and 0 blockers.
- TASK 4: `bkit ledgers query --ledger=decisions --status=ACTIVE --key=724-tests-lock-fixed-slots-not-live-load` returns the row (`updates: 3`, references `921`) with the core-count default description.
- Every Derived Test Matrix row has its test named in TASK 1's or TASK 5's TEST FIRST, and the file holding them passed.
- The invalid-slots note goes to stderr with the `[machine-lock]` prefix, like the other lock messages, so `docs/observability.md` raises no gap. The plan has no `Documentation Updates` section; TASK 3 covers the docs.
- The upgrade migration in `.bkit/core/engine/install/modules/core.ts` (`SHIPPED_MACHINE_LOCK_HASHES`) replaces an unedited 6.1.x copy with the current template, so released copies pick up the new default; the plan asks for no migration.
- `build-decision-1-1.md` is `Fix now` (created TASK 5), not an accept, so it closes no gap by itself.
- No test-first audit report was supplied for this holistic check; the group audits (`build-tests-green-1-2.md`, `build-tests-green-2-1.md`) had 0 gaps, 0 unproven and no loosened tests, as the group reports record.

## Identified Gaps Log

None
