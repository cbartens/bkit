Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4
Loosened: none

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

- TASK 4 satisfied. `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts` (matrix row loop, about line 914) now pushes one `matrix` problem on the row's line when the row does not have 4 cells, or when its `Task` cell holds anything other than task numbers (`N`, `TASK N`, joined by `,` or `and`). The if/else chain keeps it to one problem per row. Both shapes in DONE WHEN are covered: an extra leading `#` cell (5 cells) and `Task` before `Target file` (the `Task` cell holds a backticked file name, which fails the pattern). `dist/commands/workflow/tests.js` was rebuilt to match.
- Both TEST FIRST tests exist in `.bkit/core/engine/commands/workflow/tests.test.ts`. The test-first audit (`build-tests-green-3-1.md`) shows them red before the code and green after: Enforced true, 0 gaps, 0 unproven, and no Updated tests or Already landed entries.
- The execute step changed the existing test `plan-check refuses a matrix header with an extra leading # column`. It now asserts that the header problem comes first and that both 5-cell rows are refused, instead of asserting exactly one `matrix` problem. This is a fix to a test the task broke, not a loosening. DONE WHEN refuses every row whose cell count is not 4, and it names the old exact-one assertion as part of the cause. The `Task not last` test still asserts exactly one problem, and that is still right: its rows match their own header, so they have 4 cells and a numeric `Task` cell.
- I ran `pnpm vitest run .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts`: 2 files, 188 tests passed. That includes `plan-check refuses a matrix row mapped to two tasks` and the challenge-merge tests that run `checkPlanText` on merged plans. `pnpm tsc --noEmit -p .` reported no errors.
- This plan has no `Derived Test Matrix` or `Documentation Updates` section, so there were no matrix-row or documentation checks to run. `docs/observability.md` does not apply: the change is a pure check function and adds no error path that needs logging.
- Decision records `build-decision-1-1.md` and `build-decision-1-2.md` are holistic-round accepts of test-environment flakes. They do not touch group 3, and I relied on neither.

## Identified Gaps Log

None
