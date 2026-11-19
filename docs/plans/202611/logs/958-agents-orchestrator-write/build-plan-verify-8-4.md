Verdict: PASS
Failures: 0
Fixable: false
Tasks: 27, 28, 29, 30, 31
Loosened: none
Fingerprint: b7d50a0e4c6098dd819c9442d8dcf00ed0cf5ef0ab0d02d4b5e2a5d09f838478
<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-8-1.md` (attempt 1): `CONCERNS`, 3 fixable gaps (Tasks 28, 29, 31), closed by `build-plan-gaps-remediate-8-1-log.md`.
- `build-plan-verify-8-2.md` (attempt 2): `PASS`, Tasks 27-31. The group gate failed (`build-group-gate-8-2.md`); `build-decision-2-1.md` took `Try again`, and `build-plan-gaps-remediate-8-2-log.md` ran the fix round.
- `build-plan-verify-8-3.md` (attempt 3): `PASS`, Tasks 27-31. The group gate failed again (`build-group-gate-8-3.md`: 2 `decisions check` tests in `decisions.test.ts`, plus TS6133 on `VERIFY_LOOP`); `build-plan-gaps-remediate-8-3-log.md` (commit `3b11c60b0`) closed both.

## Notes

- Mode `Group`, judged against `build-diff-8-4.md`. Since attempt 3's verify (`d77c1df6b`), the only engine changes are commit `3b11c60b0`: `decisions check` now passes the last `decision-counts` row's `loop` to `itemProblem` (read through `decisionRows`) instead of `null`, `itemProblem` takes `loop: { options: string[] } | null` in place of the engine text, the unused `VERIFY_LOOP` test constant is gone, and `dist/commands/workflow/decisions.js` carries the same change. The plan file only moved Task 43 into a new group 12.
- That `check` change is Task 34's behaviour (group 9), made by the remediate step to clear the group gate. No group 8 `DONE WHEN` names it, and it breaks none, so it is no gap here. Out of scope, for the owner to look at: the `itemProblem` refusal texts in `.bkit/core/engine/commands/workflow/decisions.ts` still say "the engine writes it in the -engine.md file" and "the engine file's loop question", although no `-engine.md` file is written any more; Task 34 owns that wording.
- Tests run: `status.test.ts`, `ledgers/status.test.ts`, `open-decision.test.ts`, `decisions.test.ts`, `workflows.test.ts`, `tasks.test.ts`, `challenge.test.ts`, `steps.test.ts`, `tools/cli-doc.test.ts` and `audits/workflows/workflow-shape.test.ts`: 10 files, 1041 passed, 0 failed. Every planned group 8 test passes, and so do the two group 11 / 12 take-overs that failed at attempt 3.
- `tsc --noEmit -p .` exits 0; `oxlint` on the two changed files exits 0.
- Task 30's `git grep -n -e engineSibling -e isEngineFile -- .bkit/core/engine ':!*.test.ts'` prints nothing; neither does a grep for `mergeItems`, `mergeHeader`, `TAKEN_UNASKED`, `engineStub` and `engineWith` across `.bkit/core/engine` and `dist`.
- Test-first audit (`build-tests-green-8-4.md`): `Enforced: true`, 24 planned tests red then passed, `Unproven: 0`. It has no `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Audit gap `TASK 29: delete-still-referenced` (`mergeItems` at `docs/deferrals.jsonl:531`) is no gap: the hit is text in an append-only deferral row about an earlier challenge finding, not a code reference.
- Taken over, each judged as a planned test of the task that took it: Task 28 took six Task 11 `decisions counts` tests; Task 29 took six Task 9 and two Task 18 `open-decision.test.ts` tests; Task 30 took the Task 9 `status resume` and `workflows summary` tests and the Task 18 `decisions skip` test. Each asserts the row-based behaviour its task names, was red before its code, and passes now.
- Decision records: `build-decision-1-1.md` and `build-decision-1-2.md` (Task 18 Fix now; assumed, not the owner's acceptance) accept no group 8 gap. `build-decision-2-1.md` (group 8 verify loop, Try again; assumed, not the owner's acceptance) routes the fix rounds and accepts no gap.
- `docs/observability.md` and `docs/testing.md` are present; the group adds no error path beyond the usage and `problem` exits the tasks name.

## Identified Gaps Log

None
