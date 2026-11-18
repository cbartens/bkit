Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none
Fingerprint: eb861e2c96a21ee2d3c7ce45173d72c5205f738e69779b1633ba7a8b05f374bd
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 task groups).

## Integration Gaps

0 integration gaps. The TASK 8 / TASK 9 gap that `build-plan-verify-holistic-1-5.md` logged is closed: `tests changed` now decides whether the run works in place from `stepRun({ cwd: top })` (`.bkit/core/engine/commands/workflow/tests-changed.ts:214`), the same exported resolver `stepBase` uses (`.bkit/core/engine/commands/workflow/step-base.ts:71`, `:89`). With a second in-progress run in the tree and a dirty `status.jsonl`, `ownChangedRun` picks the in-place run, `readRecord` finds its shared-checkout record, and the base stays `HEAD`. The other joins hold: both `bkit-build.md` calls (group 2) pass `--file="{STATUS}"`, so neither the branch lookup (TASK 6) nor `ownChangedRun` (TASK 9) runs for them; `scan-diff --since-step` and `tests changed` both resolve through the one `stepBase`; the takeover skip (TASK 7) and the `uncommitted` stamp apply after whichever run is found.

## Previously Attempted

- `build-plan-verify-1-1.md`, `-1-2.md`: group 1, PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md` (CONCERNS, fixed by `build-plan-gaps-remediate-2-1-log.md`), `-2-2.md`: PASS, Tasks 4, 5.
- `build-plan-verify-3-1.md` (CONCERNS, fixed by `build-plan-gaps-remediate-3-1-log.md`), `-3-2.md`: PASS, Tasks 6, 7, 8.
- `build-plan-verify-4-1.md` (CONCERNS, fixed by `build-plan-gaps-remediate-4-1-log.md`), `-4-2.md`: PASS, Task 9.
- `build-plan-verify-holistic-1-1.md`, `-1-2.md`: CONCERNS, fixed by `build-plan-gaps-remediate-holistic-1-1-log.md`, `-1-2-log.md`; `-1-3.md`, `-1-4.md`: PASS.
- `build-plan-verify-holistic-1-5.md`: CONCERNS, 1 integration gap (TASK 8 undone by TASK 9 with two runs in progress), fixed by `build-plan-gaps-remediate-holistic-1-5-log.md` (commit `fe91b5a4d`); `build-decision-1-1.md` chose another fix round.

## Notes

- Holistic mode, judged against `tmp/bkit-diff-1018-subagent-commits-makes.md` (refreshed after `fe91b5a4d`; it carries `stepRun`) and the codebase at `fe91b5a4d`. No test-first audit report was supplied this round.
- `build-decision-1-1.md`: Q1 "Try again" applied (LOCAL); Q2 carries no `Decision:` line. The fix round ran, so the gap is fixed, not accepted.
- TASK 1: `step-base.ts` exports `stepBase` (and now `stepRun`), imports only `../lib.js` and `./status.js`; planned tests pass.
- TASK 2: default base from `stepBase`, explicit `--base` wins, `HEAD` plus a log line with no run. `git diff 800085c4d HEAD -- .bkit/core/prompts` is empty.
- TASK 3: `--since-step` and `--file` in the verb spec, exclusive with `--base`, unresolved base exits `EXIT_DIFF_FAILED`.
- TASK 4: `rg -n 'HEAD~1' .bkit/core/workflows/bkit-build.md` finds nothing; both calls carry `--since-step` and `--file="{STATUS}"`; the invariant passes.
- TASK 5: `docs/testing.md:815` and `:829` and the `scan-diff` rows of `.bkit/core/.bkit/cli.md` and `.bkit/cli.md` name the new behaviour; `dist/commands/workflow/tests-changed.js:193` and `dist/commands/workflow/step-base.js:69` carry the fix. I did not run the full unit suite (`Local tests first`); the holistic gate runs it.
- TASK 8: satisfied again. Its planned test passes, and the new case `on an in-place shared-branch run with a second run in progress and a dirty status file leaves out another agent's commit` in `tests-changed.test.ts` covers the two-run setup and passes.
- TASK 6, 7, 9: satisfied; planned tests pass.
- Derived Test Matrix: each of the 17 rows has its test in its task's `TEST FIRST` / `DONE WHEN`. Both `Documentation Updates` rows are done; the `docs/testing.md:815` row's in-place sentence covers the new two-run case. `docs/observability.md`: the change adds no error path.
- Minor, not a gap: on an in-place run `tests changed` logs "no active run with a step-done row — measuring from HEAD", which names the wrong reason (the run exists; it is in place). The base is correct; TASK 2's DONE WHEN does not fix the log wording.
- Tests run by this verifier: `step-base.test.ts`, `tests-changed.test.ts`, `workflow-shape.test.ts` and `branches.test.ts` (4 files, 650 passed).

## Identified Gaps Log

None
