Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 9
Loosened: none
Fingerprint: 73107a4a8d7ff1d738f625ef3cb8c64a5c9d7a6ebd69b4c91b75f8f76fb32d0e
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 task groups; group 4 holds the challenge round 2 task 9).

## Integration Gaps

1 integration gap, between TASK 8 (group 3) and TASK 9 (group 4). TASK 8 keeps `HEAD` as the base of `tests changed` when the active run works in place on a shared branch, and finds that run with `resolveActiveRun({ cwd: top })` (`tests-changed.ts:222`). That lookup gives up when the tree holds two in-progress runs. Before TASK 9, `stepBase` gave up in the same case, so the base still came out as `HEAD`. TASK 9 added `ownChangedRun`, which on a non-`feat/` branch such as `dev` picks the run whose `status.jsonl` this checkout changed. A run's `status.jsonl` is dirty for most of every step, because each engine call appends an `engine-call` row. So an in-place debug run on `dev` with another in-progress run in the tree now measures from its last step-done commit, and lists files another agent committed on `dev` after it. Reproduced with `dist/` (see the gap log). The other joins hold: both `bkit-build.md` calls (group 2) pass `--file="{STATUS}"`, so neither the branch lookup (TASK 6) nor `ownChangedRun` (TASK 9) runs for them; `scan-diff --since-step` and `tests changed` both resolve through the one `stepBase`; the takeover skip (TASK 7) and the `uncommitted` stamp still apply after whichever run is found.

## Previously Attempted

- `build-plan-verify-1-1.md`, `build-plan-verify-1-2.md`: group 1, PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md` (CONCERNS, 3 gaps, fixed by `build-plan-gaps-remediate-2-1-log.md`), `build-plan-verify-2-2.md`: PASS, Tasks 4, 5.
- `build-plan-verify-holistic-1-1.md`, `-1-2.md`: CONCERNS, fixed by `build-plan-gaps-remediate-holistic-1-1-log.md` and `-1-2-log.md`; `build-plan-verify-holistic-1-3.md`: PASS, 2 of 2 groups.
- `build-plan-verify-3-1.md` (CONCERNS, fixed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md`: PASS, Tasks 6, 7, 8.
- `build-plan-verify-holistic-1-4.md`: PASS, Tasks 1-8, 3 of 3 groups (before the challenge round 2 added group 4).
- `build-plan-verify-4-1.md` (CONCERNS, 1 doc-drift gap, fixed by `build-plan-gaps-remediate-4-1-log.md`), `build-plan-verify-4-2.md`: PASS, Task 9.

## Notes

- Holistic mode, judged against `tmp/bkit-diff-1018-subagent-commits-makes.md` (the whole feature diff since merge base `800085c4d`) and the codebase at `17fdd63ad`. No `build-decision-*.md` records exist. No test-first audit report was supplied this round; the group 4 audits (`build-tests-green-4-1.md`, `-4-2.md`) had 0 gaps and nothing Unproven.
- TASK 1: `step-base.ts` exports `stepBase` and imports only `../lib.js` and `./status.js`; its planned tests pass.
- TASK 2: the default base comes from `stepBase`, an explicit `--base` wins, and with no run a log line is written and `HEAD` is used. `git diff 800085c4d HEAD -- .bkit/core/prompts` is empty.
- TASK 3: `--since-step` and `--file` are in the verb spec, exclusive with `--base`; an unresolved base exits `EXIT_DIFF_FAILED` with a log line.
- TASK 4: `rg -n 'HEAD~1' .bkit/core/workflows/bkit-build.md` finds nothing; both calls (`bkit-build.md:933`, `:1046`) carry `--since-step` and `--file="{STATUS}"`.
- TASK 5: `docs/testing.md` lines 815 and 829 and the `.bkit/core/.bkit/cli.md` / `.bkit/cli.md` `scan-diff` rows name the new behaviour; `dist/commands/workflow/step-base.js` carries `ownChangedRun`. I did not run the full unit suite (`Local tests first`); the holistic gate runs it.
- TASK 6, 7, 9: satisfied; their planned tests pass.
- TASK 8: left off `Tasks`. Its own planned test still passes (it has one run in the tree), but its DONE WHEN no longer holds once a second in-progress run is in the tree, because of the TASK 9 fallback. See Integration Gaps.
- Derived Test Matrix: each of the 17 rows has its test in its task's `TEST FIRST` / `DONE WHEN`. Both `Documentation Updates` rows are done. `docs/observability.md`: `ownChangedRun` adds no error path; it returns undefined on a git failure like the rest of the module.
- The 5 `docs/deferrals.jsonl` rows added on this branch are LOW challenge findings; none covers the integration gap.
- The repro ran in a scratch repo under the session scratchpad with `dist/`; it wrote nothing in this worktree.
- Tests run by this verifier: `step-base.test.ts`, `tests-changed.test.ts` and `workflow-shape.test.ts` (3 files, 366 passed), and the `scan-diff` cases of `branches.test.ts` (45 passed, the rest filtered out). A wider 8-file run was cut off by a 500 s timeout under machine load near 18 and gave no result.

## Identified Gaps Log

1 gap.

TASK 8: INTEGRATION: TASK 9 (group 4) `ownChangedRun` undoes TASK 8 (group 3) when the tree carries a second in-progress run. `tests changed` decides "in place" from `resolveActiveRun({ cwd: top })` (`.bkit/core/engine/commands/workflow/tests-changed.ts:222`), which returns undefined when two runs are in progress, so `inPlace` is false and `stepBase` runs; on `dev` (`branchFid` undefined) the new `ownChangedRun` fallback (`.bkit/core/engine/commands/workflow/step-base.ts:83`) then picks the in-place run whose `status.jsonl` is dirty (any `engine-call` row makes it so) and returns its step-done commit, so a file another agent committed on `dev` after that commit is listed. Reproduced with `dist/` in a scratch repo (in-place debug run on `dev` with a shared-checkout record, a committed `2-y/status.jsonl` holding only `workflow-started`, a foreign commit of `src/foreign.ts`, an edit to `src/a.ts`): clean status file → `files: ["src/a.ts"]`; one appended row → `files: ["src/a.ts","src/foreign.ts"]`. TASK 8's DONE WHEN ("never lists a file that only a commit outside the run touched") no longer holds; the fix is to decide `inPlace` from the same run `stepBase` resolves, plus a test of this case — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 9 ownChangedRun undoes TASK 8 in-place HEAD base when a second run is in progress
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-changed.ts:222` · **Round:** 1
  - **DONE WHEN:** On an in-place shared-branch run (shared-checkout record) with another in-progress run in the tree and a dirty run status.jsonl, `bkit tests changed` with no `--base` leaves out a file another agent committed after the last step-done commit: `inPlace` is decided from the same run `stepBase` resolves; a tests-changed.test.ts case covers it and passes.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tests-changed.test.ts
<!-- bkit:task 1 end -->
