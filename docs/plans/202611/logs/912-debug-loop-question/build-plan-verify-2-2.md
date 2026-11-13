Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 6, 10
Loosened: none
Fingerprint: 167d4849f1043cb5dcae9a20fd989438a05ee8d6664f7b545d5e5e7f961dbfd2
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/912-debug-loop-question/build-plan-verify-2-1.md` (attempt 1, `CONCERNS`): Tasks 4 and 5 satisfied; one gap on Task 6, whose integration test expected `failures: null` on a passing local round.
- `docs/plans/202611/logs/912-debug-loop-question/build-plan-gaps-remediate-2-1-log.md` (`FAIL`, blocked): the fix sat inside a planned test, which a code step may not edit.
- `docs/plans/202611/logs/912-debug-loop-question/build-decision-1-1.md`: the owner chose Fix now, which added Task 10 to group 2.

## Notes

- TASK 4 satisfied. `locateCi` in `.bkit/core/engine/commands/workflow/runs.ts` saves `failedJobCount: Math.max(1, mapped.length)` only when a job failed, and `mapped` leaves out `bkit-tests-check`; the `--evidence-file` jobs take the same path. `validateCiSelection` in `.bkit/core/engine/ledgers/status.ts` refuses 0, -1 and 1.5 and accepts a selection without the field; `ciSelectionIdentity` is unchanged. The `status.test.ts` test and the four `runs.test.ts` tests pass.
- TASK 5 satisfied. `testRunProblem` accepts a CI row whose `failures` is `null` or a positive whole number and refuses 0; the `tests run` CI branch writes `selection.failedJobCount ?? null` to the row and the output; the output help names the CI case. The `tests.test.ts`, `telemetry.test.ts` and `status-holes.test.ts` tests pass. Tasks 5 and 6 code landed in the same commit (`6278bd1e7`).
- TASK 6 satisfied. `finish` in `.bkit/core/engine/commands/workflow/steps.ts` requires `--failures` to equal the row's count when it is a number and to be absent when it is `null`, with the existing error text. `steps.test.ts` `finishes a CI round only with its own failed job count` passes and covers the matching count, a different count and a count on an uncounted row. The plan's revised DONE WHEN hands the end-to-end proof to Task 10, which lands it.
- TASK 10 satisfied. `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` now fails `bkit-tests-check` (job 503) alongside the failed test jobs, and the new `control.failLocal` switch in `gate.cjs` makes the second round exit 1 with no JUnit report. The test asserts the CI round's `failures: 2` with the capstone left out, a local round with `code: 1` and `failures: null`, `counts: "2 → ?"`, `trend: "unknown"` and a `recommend` other than `stop`. It runs `dist/cli.js` (fixture line 129) and passes.
- Checks run here: `pnpm bkit:check:dist` exits 0. The eight files `debug-ci-evidence.integration`, `status`, `runs`, `tests`, `telemetry`, `status-holes`, `steps` and `counters` pass, 966 tests.
- Derived Test Matrix: every group 2 row (Tasks 4, 5, 6 and 10) has its test in its task's DONE WHEN; the integration row now names Task 10.
- Test-first audit `build-tests-green-2-2.md`: `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`, and no `Updated tests` section.
- Already landed (no gap):
  - Task 4 `.bkit/core/engine/commands/workflow/runs.test.ts` `saves no failed job count when no job failed`. The tests step's reason: the old `locateCi` saved no `failedJobCount` at all, so absence already held.
  - Task 6 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown`. The tests step's reason: it is the same test as Task 10, corrected under the owner's Fix now (decision 1), and it passes against the existing runner.
  - Task 10, the same test. The tests step's reason: it was reworked to a failing local gate (`control.failLocal`, exit 1, no JUnit report); the existing runner records `failures: null`, and progress reads `2 → ?` / `unknown`.
- Decision record `build-decision-1-1.md` (`Decision: Fix now`) directs the Task 10 correction; it accepts no gap.
- `docs/testing.md` § Debug CI evidence verification read; the test still runs real built CLI commands against a fresh temporary consumer. `docs/observability.md`: this group adds no new error path or log line.

## Identified Gaps Log

None
