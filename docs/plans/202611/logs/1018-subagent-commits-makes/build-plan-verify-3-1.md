Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6, 7, 8
Loosened: none
Fingerprint: 478d1e4015f79267a7be46954f4bce1659138463297d29a2c53c244b624f0a45
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-3-1.md` (group diff since group 3 began). The brief's `Deviations` section holds only `publish=false`, which names no task.
- TASK 6: `stepBase` (`.bkit/core/engine/commands/workflow/step-base.ts`) reads the `feat/{FID}` branch (`branchFid`) and calls `resolveActiveRun({ cwd, fid })` before the existing `resolveActiveRun({ cwd, file })` fallback, only when no `--file` is passed. The existing `step-base.test.ts` and `tests-changed.test.ts` cases are unchanged in the diff (additions only).
- TASK 7: `stepBase` drops `step-done` rows whose `step` is `build-takeover` before it picks the prior row. The local `TAKEOVER` constant equals `TAKEOVER_STEP` in `.bkit/core/engine/commands/workflow/tests.ts:327`; it is a copy rather than an import, with the reason given in its doc comment.
- TASK 8: `tests changed` with no `--base` keeps `HEAD` when the active run has a shared-checkout record (`readRecord`). `changedFiles` also leaves out every `docs/plans/*/logs/*/status.jsonl` path; the planned TASK 6 test (`toEqual(["src/a.ts"])`) needs this filter, and it also reaches `bkit tests run --changed-since` (`tests.ts:163`), which shares `changedFiles`.
- `dist/commands/workflow/step-base.js` and `dist/commands/workflow/tests-changed.js` carry the same changes as the sources.
- Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all five planned tests red then passed. It has no Taken over, Unproven, Changed by a code step, Updated tests or Already landed section.
- Derived Test Matrix rows for tasks 6, 7 and 8 each match a `TEST FIRST` test of that task.
- Run constraint: `LC_ALL=C wc -w` gives 58535 for `.bkit/core/workflows/*.md` (dev 58536) and 86494 for `.bkit/core/prompts/*.md` (dev 86494); group 3 touched neither.
- No new error path was added, so `docs/observability.md` asks nothing new here.
- Observation, out of scope: `resolveActiveRun` with `fid` looks the run up in the current UTC month only (`month: utcMonth()`), so a run whose `status.jsonl` sits in an earlier month falls back to the scan, and with another in-progress run there the base is `HEAD` again. TASK 6's `DONE WHEN` prescribes that call, so it is not a gap.
- No decision record (`build-decision-*.md`), earlier verify report or gaps-remediate log exists for group 3.
- Local runs: `step-base.test.ts` and `tests-changed.test.ts` in full, 37 passed; `branches.test.ts -t since-step`, 4 passed (279 skipped). The rest of `branches.test.ts` and `tests.test.ts` (which shares `changedFiles`) were not run here; the group gate covers them. No test in either file asserts that a `status.jsonl` path is listed as changed.
- Gap count: 1. All three tasks meet their `DONE WHEN`; the one gap is the plan-level Documentation Updates row, so the tasks stay on the `Tasks` line.

## Identified Gaps Log

TASK 8: `docs/testing.md:815` and `docs/testing.md:829` -- the `tests-changed.test.ts` and `branches.test.ts` inventory rows do not name the group 3 cases (another feature's in-progress run, the in-place shared-branch run keeping the HEAD base, the excluded run `status.jsonl` files, the `build-takeover` row skipped by `scan-diff --since-step`), so the plan's Documentation Updates row 1 ("the inventory rows name the new cases") is no longer done; the same root cause covers TASK 6 and TASK 7 cases — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 8: `docs/testing.md:815` and `docs/testing.md:829` -- the `tests-changed.test.ts` and `branches.test.ts` inventory rows do not name the group 3 cases (another feature's in-progress run, the in-place shared-branch run keeping the HEAD base, the excluded run `status.jsonl` files, the `build-takeover` row skipped by `scan-diff --since-step`), so the plan's Documentation Updates row 1 ("the inventory rows name the new cases") is no longer done; the same root cause covers TASK 6 and TASK 7 cases — Fixable: true
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/testing.md:815` · **Round:** 1
  - **DONE WHEN:** The `docs/testing.md` inventory rows for `commands/workflow/tests-changed.test.ts` (line 815) and `commands/workflow/branches.test.ts` (line 829) name the group 3 cases: another feature in-progress run on a feat/{FID} branch, the in-place shared-branch run keeping the HEAD base, run status.jsonl files left out of the changed set, and scan-diff --since-step skipping a build-takeover row.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
