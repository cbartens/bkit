Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 21, 22
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, group 7 (Tasks 20, 21, 22), judged against `build-diff-7-1.md`. The brief has no `Deviations` section.
- Test-first audit (`build-tests-green-7-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` section. All 6 planned tests went red and then passed.
- The code step reshaped the existing test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` to a loop-only file, as Task 20's DONE WHEN requires. Only its fixture changed and its expectations are unchanged, so nothing was loosened.
- The 4 test files ran green here (334 tests: `decisions.test.ts`, `workflow-shape.test.ts`, `tests-base.test.ts`, `tests-base.integration.test.ts`), and `pnpm typecheck` exits 0. `dist/` and all 7 rendered copies of the build workflow's Resume bullet (source, render snapshot, `.claude`, `.cursor`, `.opencode`, both `.agents` skills) carry the change. `pnpm instructions:sync` reports no drift.
- Task 21 is satisfied: a case in state `skipped` reads `unknown`, only `passed` reads `pass`, and a skip-only verdict is `unknown` with reason `{n} case(s) skipped at the base commit`.
- Task 22 is satisfied: `baseVerdict` gives `some` a reason when `undetermined` > 0, the verb keeps its crash, no-report or unresolved reason for `some`, and compose words the result as `a round can fix {branch} of {failing}` plus `{undetermined} could not be checked: {reason}`.
- Task 20 is not satisfied. The guard and the Resume route are right, but the refusal for a file with no loop question names Q1 only, and the catalog's Decision Pause bullet still describes the re-run as unconditional (2 gaps, both Fixable: true).
- Each `Derived Test Matrix` row for Tasks 20-22 (plan lines 195-200) has its test in its task's `TEST FIRST`. No new error logging is involved: the refusals are `CommandError` usage exits.
- The decision records `build-decision-1-1.md`, `-1-2.md` and `-1-3.md` cover groups 1 and the challenge round, and none of them covers a group 7 gap.

## Identified Gaps Log

2 gaps.

TASK 20: `.bkit/core/engine/commands/workflow/decisions.ts:604` — `decisions apply --by=rerun` on a `Gate: FAIL` file with no `## Progress` block throws "Q1 is not the loop question" before it collects the undecided items, so a non-loop pause with undecided Q1, Q2 and Q3 (the hard-blocker case the task describes) is refused with an error that names Q1 only; DONE WHEN requires the usage error to name each undecided question number. Fix: collect the undecided question numbers first (Q1 included when there is no loop question) and name them all in both refusals — Fixable: true
TASK 20: `.bkit/core/.bkit/workflows.md:985` (mirrored to `.bkit/workflows.md:985`) — § Decision Pause bullet **Resume into a red-gate pause** still says `openDecision.gate` = `FAIL` always skips the question and re-runs the gate; after this task the re-run happens only when the loop question is the pause's only undecided question, and any other open `Gate: FAIL` pause resumes at **Decision Pause** step 3. The `Documentation Updates` row for this section no longer matches the workflow. Fix: add the condition and the step 3 fallback to that bullet, then `bkit upgrade` to refresh the mirror — Fixable: true
