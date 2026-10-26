Verdict: FAIL
Failures: 5
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 1` (task 1 only).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — no `build-plan-verify-1-*` file, no `build-plan-current.md` and no `build-plan-gaps-remediate-1-*-log.md` exists.

## Notes

- Task 1's `DONE WHEN` is satisfied in the codebase: `.bkit/core/workflows/bkit-build.md` carries the headings `Step 1 — Start Workflow` through `Step 16 — Close Workflow & Create PR` with `Step 3 — Branch Sync` (docs merge only, `--step=build-branch-sync … --number=3 --post --title="Branch Sync"`) and `Step 4 — Plan Convert` (plan check, `@bkit-build-plan-convert` dispatch, re-check, `--step=build-plan-convert … --number=4 --post --title="Plan Convert"`); `WORKFLOW_STEPS.build` in `.bkit/core/engine/commands/workflow/step-table.ts` numbers 1-16 with titles matching those headings, `build-plan-convert` at 4 titled `Plan Convert` with `resumeAt: "build-plan-convert"`; the four-suite command re-run here passes (`4` files, `451` tests).
- The execute log's `DONE — TASK 1` line was treated as a claim and cross-checked against the diff, the workflow, the step table and the test run above; it holds for the deliverable itself.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 5`, `Test order only: true`, all five `test-changed` on `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`; `tests green` exited 1. The report carries no `Late-red check` section.
- The five gap entries below are logged as reported. Four of them are a module-level helper added above the tests plus line shifts, their own assertions untouched; the fifth (`build's comment numbers match the step table`) had its assertions replaced by the helpers `sharedStepNumbers()` / `commentNumberProblems()`.
- No decision record accepts these gaps: `build-decision-*.md` is absent, so the execute log's "owner decision at the Decision Pause (TEST EXCEPTION)" carry-over is a declared intent, not a supplied `Decision: Accept`.
- Task 1 is left `[ ]` because a test-first audit gap stands; the group's other tests (`step-table.test.ts` x3, `trackers.test.ts` x1) show `Changed since red` = no and pass.
- Nothing committed by this step.

## Identified Gaps Log

1. TASK 1: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Branch Sync merges docs and finishes as its own step` — test-changed — the diff since its red snapshot adds `sharedStepNumbers()` / `commentNumberProblems()` at module level above the test and shifts its lines; the test body's own assertions are unchanged, so it needs its red evidence re-recorded against the refactored file rather than an assertion repair — Fixable: true
2. TASK 1: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert checks the plan, converts one with no task markers, and re-checks` — test-changed — same module-level helper addition above the test and line shift only; its assertions are unchanged and need their red evidence re-recorded — Fixable: true
3. TASK 1: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Convert leaves a valid plan with no newer comments alone` — test-changed — same module-level helper addition above the test and line shift only; its assertions are unchanged and need their red evidence re-recorded — Fixable: true
4. TASK 1: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the convert step posts under Plan Convert's number and title` — test-changed — same module-level helper addition above the test and line shift only; its assertions are unchanged and need their red evidence re-recorded — Fixable: true
5. TASK 1: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build's comment numbers match the step table` — test-changed — its inline assertion loop (`expect(row).toBeDefined()`, `expect(line).toContain(--number=)`, `expect(line).toMatch(--title=)`) was rewritten after the red run into two module-level helpers returning problem strings plus `expect(…).toEqual([])`; equivalent in substance but the asserted statements are not the ones the red evidence covers, and restoring them inline re-triggers the `vitest(no-conditional-in-test)` static-gate rule, so it needs an owner test-first exception, not a subagent edit — Fixable: false
