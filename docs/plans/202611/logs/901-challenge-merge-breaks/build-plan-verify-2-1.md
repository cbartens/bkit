Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3
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

None

## Notes

- TASK 3 satisfied. `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts:899` now parses the header with `.split("|").slice(1, -1)` and trims each cell, the same parse as `tableCells` in `.bkit/core/engine/commands/workflow/plan-blocks.ts:128`. `dist/commands/workflow/tests.js` carries the same change.
- DONE WHEN dogfood: `node dist/cli.js tests plan-check` on a scratch plan with the header `| Test description | Type | Target file | Task` and a row naming TASK 7 exits 1 with one `matrix` problem naming `Test description | Type | Target file | Task`. The same plan with the closing pipe has no header problem and reports "row maps to TASK 7, which the plan does not define".
- TEST FIRST test `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with no closing pipe` exists, matches the brief's shape (`okTask(1)`, `okTask(2)`, code 1, one `matrix` problem at the header line, message contains `EXPECTED_MATRIX_HEADER`), and passes. Whole file: 149/149 passed. `challenge.test.ts` and `plan-blocks.test.ts` (the other `checkPlanText` callers): 68/68 passed.
- Test-first audit `build-tests-green-2-1.md`: Enforced true, PASS, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` section.
- The plan has no `Derived Test Matrix` section and no `Documentation Updates` section, so no matrix-row or doc-row obligations apply. The change adds no error path, so `docs/observability.md` adds nothing here.
- Decision records `build-decision-1-1.md` and `build-decision-1-2.md` cover holistic-run flakes and lock waits; neither bears on group 2.
- No brief has a `Deviations` section.

## Identified Gaps Log

None
