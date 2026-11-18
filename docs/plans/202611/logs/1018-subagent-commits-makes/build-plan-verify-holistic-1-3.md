Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 5ad9e33670efac1076490288ec90145cff3bf612d67eb3ccb4244eed5c06c1f4
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 task groups).

## Integration Gaps

0 integration gaps. `writeStepRow` stamps `uncommitted: true` on a `--commit=none` row, and `steps.test.ts` now asserts it. `stepBase` (TASK 1) returns that row's `parentSha`. `tests changed` (TASK 2) and `scan-diff --since-step` (TASK 3) both resolve through `stepBase`, and the two `bkit-build.md` calls (TASK 4) pass the step names the workflow writes plus `--file="{STATUS}"`. A run against this run's own `status.jsonl` with `dist/` gave `--since-step=build-plan-gaps-remediate-holistic` → `5a76c3289` (the holistic-gate commit). `scan-diff ... --code` exited 0 and listed exactly the source files of fix commit `37ea244ba`.

## Previously Attempted

- `build-plan-verify-1-1.md`, `build-plan-verify-1-2.md`: group 1, PASS, Tasks 1, 2, 3 (`conventions.test.ts` fix in `build-plan-gaps-remediate-1-1-log.md`).
- `build-plan-verify-2-1.md`: CONCERNS, 3 gaps, fixed by `build-plan-gaps-remediate-2-1-log.md`; `build-plan-verify-2-2.md`: PASS, Tasks 4, 5.
- `build-plan-verify-holistic-1-1.md`: CONCERNS, 3 fixable gaps (swept uncommitted row, workflows word total 58538, `stepBase` docstring); fixed by `build-plan-gaps-remediate-holistic-1-1-log.md`.
- `build-plan-verify-holistic-1-2.md`: CONCERNS, 2 fixable gaps (no test of the `uncommitted` stamp, `.bkit/core/.bkit/workflows.md` row contract); fixed by `build-plan-gaps-remediate-holistic-1-2-log.md` in commit `37ea244ba`.

## Notes

- Holistic mode, judged against `tmp/bkit-diff-1018-subagent-commits-makes.md` and the codebase at `37ea244ba`. No `build-decision-*.md` records exist. No test-first audit report was supplied this round.
- Both attempt-2 gaps are closed. (1) `steps.test.ts` `--commit=none` case asserts `r.json.row.uncommitted` is `true`, and `tests-changed.test.ts` `lists the subagent's file when a later commit sweeps in an uncommitted step-done row` passes. (2) `.bkit/core/.bkit/workflows.md` lists `uncommitted?` on `step-done`, drops "forensic only" and says `stepBase` reads `parentSha`. `.bkit/workflows.md` is re-rendered.
- TASK 1: `step-base.ts` exports `stepBase` and imports only `../lib.js` and `./status.js`. 4 tests pass.
- TASK 2: the default base comes from `stepBase`. An explicit `--base` wins. With no run, a log line is written and `HEAD` is used. No `.bkit/core/prompts/*` file changed since merge base `800085c4d`. 4 default-base cases pass.
- TASK 3: `--since-step` and `--file` are in the verb spec. `--since-step` with `--base` is a usage error. A base that cannot be resolved exits `EXIT_DIFF_FAILED` with a log line. 3 cases pass.
- TASK 4: `rg -n 'HEAD~1'` finds nothing in `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md` or `.bkit/workflows.md`. The invariant and `workflow-fence-syntax.test.ts` pass. `pnpm tsx .bkit/core/engine/tools/instructions.ts` exits 0.
- TASK 5: the `docs/testing.md` lines 572, 815 and 829 and the `.bkit/core/.bkit/cli.md` `scan-diff` row are done. `dist/` matches the sources (`step-base.js`, `steps.js`, `branches.js`, `tests-changed.js`). `node dist/cli.js check` exits 0. I did not run the full unit suite (`Local tests first`); the holistic gate covers it.
- Tests run by this verifier: `step-base.test.ts`, `tests-changed.test.ts`, `branches.test.ts`, `steps.test.ts`, `workflow-shape.test.ts`, `workflow-fence-syntax.test.ts`, `conventions.test.ts`, `instructions-coverage.test.ts`. All 8 files passed, 868 tests.
- Run constraint: `.bkit/core/workflows/*.md` = 58535 (dev 58536), `.bkit/core/prompts/*.md` = 86494 (dev 86494). Both are within the constraint.
- Derived Test Matrix: each of the 10 rows has its test in its task's `TEST FIRST` / `DONE WHEN`. Both `Documentation Updates` rows are done. `docs/observability.md`: the new failure paths report through `ctx.log`, like the code next to them.
- `.bkit/instructions.md` changed in the `plan-task-ticking-owned-by-verify` entry. The change is a regenerated copy, and it matches the same entry on `dev`. It is not a scope change.
- Observations, not gaps: (a) `commitOfRow` matches on the one-second `at` string, so a committed row that shares the same second could make the base come out too early. (b) The `docs/testing.md` row for `tests-changed.test.ts` (line 815) does not name the swept-row case that the holistic fix added. `step-base.test.ts` has no inventory row, but the inventory leaves out other workflow test files too (`feature-base.test.ts`, for example), and the plan asked for no such row.

## Identified Gaps Log

None
