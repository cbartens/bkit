Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 0ede2ab9dd2066840675ac4076261cb6d77484af42df64c5c6f52b4a9c8fc619
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 task groups).

## Integration Gaps

1 integration gap.

- The holistic fix round made `stepBase` (TASK 1) depend on a new `uncommitted` field that `writeStepRow` in `steps.ts` stamps on every `--commit=none` row. The code is correct as read: every `--commit=none` writer (`tests.ts`, `runs.ts`, `workflows.ts`, `tasks.ts`, `steps.ts`) goes through `writeStepRow`, so a swept `build-tests-red` row now yields its `parentSha`. No test covers the writer half of that link, though. The new `step-base.test.ts` case writes `uncommitted: true` by hand, and neither `steps.test.ts` nor `tests-changed.test.ts` checks it end to end. If the stamp were dropped, the failure from issue #1018 would come back and every test would still pass.

## Previously Attempted

- `build-plan-verify-1-1.md`, `build-plan-verify-1-2.md`: group 1, PASS, Tasks 1, 2, 3 (the `conventions.test.ts` fix was made in `build-plan-gaps-remediate-1-1-log.md`).
- `build-plan-verify-2-1.md` (CONCERNS, 3 gaps), fixed by `build-plan-gaps-remediate-2-1-log.md`; `build-plan-verify-2-2.md` PASS, Tasks 4, 5.
- `build-plan-verify-holistic-1-1.md`: CONCERNS, 3 fixable gaps: the swept uncommitted row, workflows word total 58538, and the `stepBase` docstring. `build-plan-gaps-remediate-holistic-1-1-log.md` reports Fixed: 3, and its holistic gate exited 0.

## Notes

- Holistic mode, judged against `tmp/bkit-diff-1018-subagent-commits-makes.md`, the codebase at `90dab75d0`, and the holistic fix commit `90dab75d0` itself. No `build-decision-*.md` records exist. No test-first audit report was supplied this round.
- All 3 attempt-1 gaps are closed. (1) `stepBase` returns `parentSha` for a row stamped `uncommitted` (`step-base.ts:52-53`), and `writeStepRow` stamps it on `--commit=none` (`steps.ts:698`). The new `step-base.test.ts` case passes. (2) Word totals: `.bkit/core/workflows/*.md` = 58535 (dev 58536), `.bkit/core/prompts/*.md` = 86494 (dev 86494). Both are within the run constraint. `pnpm tsx .bkit/core/engine/tools/instructions.ts` exits 0. (3) The docstring now says that a step with no row measures from the last `step-done` row.
- The cut words are in Step 9 sub-step 4 ("it only goes" became "it goes") and sub-step 5 ("Exit 1 means no source file changed."). Step 10 sub-step 11 still reads "it only goes". No shared entry covers these sentences, so this is noted here and not logged.
- TASK 1: `step-base.ts` exports `stepBase` and imports only `../lib.js` and `./status.js`. Its tests pass (4 now, including the holistic-fix case).
- TASK 2: the default base comes from `stepBase`. An explicit `--base` wins. With no run, the verb logs a line and uses `HEAD`. No `.bkit/core/prompts/*` file changed. The 3 default-base cases pass.
- TASK 3: `--since-step` and `--file` are in the verb spec. Using either one together with `--base` is a usage error. A base that cannot be resolved exits `EXIT_DIFF_FAILED`. The 3 cases pass.
- TASK 4: `rg -n 'HEAD~1'` finds nothing in `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md` or `.bkit/workflows.md`. Both calls carry `--since-step` and `--file="{STATUS}"`. The invariant and the fence-syntax audit pass.
- TASK 5: the docs rows in `docs/testing.md` (572, 815, 829) and `.bkit/core/.bkit/cli.md` are done. `dist/commands/workflow/step-base.js` and `steps.js` carry the holistic fix. `node dist/cli.js check` exits 0 and reports no drift. The holistic-fix gate (`bkit:gate:changed`: related tests, Oxlint, Prettier, typecheck) exited 0. I did not run the full unit suite myself (`Local tests first`).
- Tests run by this verifier: `step-base.test.ts`, `tests-changed.test.ts`, `branches.test.ts`, `steps.test.ts`, `workflow-shape.test.ts`, `workflow-fence-syntax.test.ts`, `conventions.test.ts`, `instructions-coverage.test.ts`. All 8 files passed, 867 tests.
- Cross-group contract: the step names in the two workflow calls match the rows the workflow writes. `{STATUS}` is the input `resolveActiveRun` takes. The Step 9 and Step 10 index rows match the commands.
- Derived Test Matrix: each of the 10 rows has its test in its task's `TEST FIRST` / `DONE WHEN`. Both `Documentation Updates` rows are done. `docs/observability.md`: the new failure paths report through `ctx.log`, like the code next to them.
- The `at` collision observation from attempt 1 still holds and is still not a gap. `commitOfRow` matches on the one-second `at` string, so a committed row that shares the same second could make the base come out too early.
- I did not repeat the attempt-1 scratch-repo repro, because it needs `git commit` and this agent may not commit. The fix was judged by reading the code and by the unit test.

## Identified Gaps Log

## Identified Gaps Log

2 gaps.

INTEGRATION: the holistic fix joins `writeStepRow` (`.bkit/core/engine/commands/workflow/steps.ts:698`, stamps `uncommitted: true` on a `--commit=none` row) to TASK 1 `stepBase` (`.bkit/core/engine/commands/workflow/step-base.ts:52`, returns `parentSha` for such a row) through the new `uncommitted` field, but no test checks the writer side: the new `step-base.test.ts` case builds the row by hand, `steps.test.ts` `--commit=none writes the row and leaves it uncommitted` (line 420) does not assert the field, and no `tests-changed.test.ts` case lists a subagent's committed file after a later commit sweeps an uncommitted row, which the attempt-1 finding's DONE WHEN asked for. Dropping the stamp in `steps.ts` would bring the issue's failure back with every test green. Assert `uncommitted: true` on the written row in that `steps.test.ts` case, and add a `tests-changed.test.ts` case where an uncommitted `step-done` row is swept into the subagent's commit and the subagent's file is still listed — Fixable: true
TASK 1: doc drift on the status row contract: `.bkit/core/.bkit/workflows.md:291` lists the `step-done` fields without the new `uncommitted` field, and `:313` still calls `parentSha` "forensic only", though `stepBase` now reads `parentSha` (and `uncommitted`) to pick the base of `bkit tests changed` and `scan-diff --since-step`. Add `uncommitted?` to the `step-done` field list and say what it means and that `stepBase` reads it and `parentSha`, then re-render with `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** INTEGRATION: no test checks that writeStepRow stamps uncommitted, the field stepBase now relies on
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:698` · **Round:** 1
  - **DONE WHEN:** steps.test.ts --commit=none case asserts the written row has uncommitted: true, and a tests-changed.test.ts case where an uncommitted step-done row is swept into the subagent commit still lists the subagent file; both pass
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts
    - .bkit/core/engine/commands/workflow/tests-changed.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 1: status row contract docs miss the uncommitted field and call parentSha forensic only
  **Severity:** LOW · **Class:** doc-drift · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:291` · **Round:** 1
  - **DONE WHEN:** the step-done field list in .bkit/core/.bkit/workflows.md names uncommitted, line 313 no longer calls parentSha forensic only and says stepBase reads it, and .bkit/workflows.md is re-rendered
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
