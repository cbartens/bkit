Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5, 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md` (attempt 1): `CONCERNS`, 2 gaps, both `Fixable: true` (TASK 6 no-op `shipGate` log sink; TASK 5 `pnpm test` red on `json-parse-owner.test.ts` from `readRows`). `Tasks: 4`.
- `build-plan-gaps-remediate-2-1-log.md`: both gaps reported `DONE` in commit `722111cb5`.

## Notes

- Judged against `build-diff-2-2.md`, the group 2 diff since the group started (plan-tests, plan-execute and the attempt 1 remediation in `722111cb5`). The brief `build-brief-2-1.md` has no `Deviations` section. `build-decision-1-1.md` and `build-decision-1-2.md` cover group 1 only, so no decision record applies to group 2.
- Test-first audit `build-tests-green-2-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `Already landed` sections. The 8 TASK 4 tests read `red-not-loaded`, and all 22 planned tests pass.
- Both attempt 1 gaps are closed. `shipGate` now gets `ctx.log` (`tests-base.ts:204-208`). `readRows` parses each line through `parseJson` from `shared/json.ts`, and `json-parse-owner.test.ts` passes.
- TASK 4 is satisfied. `caseFile` and `baseVerdict` are exported. `tests-base.ts` has no import of `tests.ts`. `tests-base.test.ts` passes (8/8).
- TASK 5 is satisfied:
  - `base` is listed in `.bkit/core/.bkit/cli.md`, and `cli-doc.test.ts` passes (7/7).
  - `tests-base.ts` has no static import of `tests.ts` or `runs.ts`; `runs.js` is reached only through `await import`.
  - `tests-base.test.ts` imports `./tests-base` first. The integration suite passes, and `git worktree list` shows no `bkit-base-*` entry.
  - `pnpm bkit:check:dist` exits 0, with `dist/` unchanged.
  - The full `pnpm test` run (which also covers `*.integration.test.ts`) had 9293 passed, 2 skipped and 1 failed. The one failure was `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `bkit-machine-lock.sh > a waiting run starts as soon as the holder finishes, having said who it waits for`: the waiting run gave up before the holder released the lock. That test touches no group 2 file and does not use the gate fixture. It passed 43/43 when re-run on its own. The machine was loaded at the time (load average 16.5 on 10 cores, with other worktrees' gates holding the tests lock), so this is a timing failure under load, not a regression from this group. The test that caused the attempt 1 failure (`json-parse-owner.test.ts`) passed in this run.
- TASK 6 is satisfied. `tests-base.ts` has no static import of `runs.ts`, both test files pass, no `bkit-base-*` worktree is left, and dist is clean. CI refusals and gh errors now reach `ctx.log`, as `docs/observability.md` § Log Format requires.
- Observation, no gap: a failed `git worktree add` in `baseRun` returns the reason `base checkout failed` in the output object without logging git's stderr. The output object still states the reason, so the failure is not swallowed.
- The `conventions.test.ts` `HELPER_SOURCES` entry for `tests-base.ts` fixes a test the new module would otherwise break, so it is in scope.
- Every group 2 row of the Derived Test Matrix (plan lines 146-167) maps to a `TEST FIRST` test in the `DONE WHEN` of task 4, 5 or 6. `Documentation Updates` belongs to TASK 13 (group 5), so it is outside this group.

## Identified Gaps Log

None

