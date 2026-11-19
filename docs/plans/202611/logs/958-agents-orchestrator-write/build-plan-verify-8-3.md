Verdict: PASS
Failures: 0
Fixable: false
Tasks: 27, 28, 29, 30, 31
Loosened: none
Fingerprint: 86e14427ef30dd322b6d5275357cbee52c4b7db61afbcf6d7f645dbdb008d1b3
<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-8-1.md` (attempt 1): `CONCERNS`, 3 fixable gaps (Tasks 28, 29, 31); `build-plan-gaps-remediate-8-1-log.md` (commit `207418dfb`) closed all three, each with a new test.
- `build-plan-verify-8-2.md` (attempt 2): `PASS`, Tasks 27-31 satisfied. The group gate then failed (`build-group-gate-8-2.md`); decision record `build-decision-2-1.md` took `Try again` (assumed by the orchestrator, not the owner's acceptance), and `build-plan-gaps-remediate-8-2-log.md` (commit `9de130504`) ran the second fix round.

## Notes

- Mode `Group`, judged against `build-diff-8-3.md`. No engine source or `dist/` file changed since attempt 2's verify (`git diff --stat b7b247647 HEAD -- .bkit/core/engine dist` lists only `decisions.test.ts` and `open-decision.test.ts`), so the code attempt 2 judged satisfied is unchanged, and Tasks 27, 28, 29, 30 and 31 stay satisfied.
- Remediation round 2 changed only tests and one workflow line: it removed the unused `engineFile` helper from `open-decision.test.ts` (TS6133), ported older `decisions.test.ts` fixtures and assertions from the `-engine.md` file to `decision-counts` / `decision-answer` rows (the `apply --by=rerun` and `--by=headless` tests of earlier tasks; each assertion became the matching row field, none was dropped), and changed `.bkit/core/workflows/bkit-build.md:207` from `--out` to `--decision`, re-rendered into the host copies. That last edit makes `workflow-shape.test.ts` `engine calls > build calls only verbs and flags the CLI has` pass now.
- The same commit added group 11 (Tasks 38-43) to the plan, taking over six older `decisions.test.ts` tests that still asserted the `-engine.md` layout. The group 11 tests step has since rewritten them (commits `7a0152f64`, `7d2f4999b`).
- Tests run: `status.test.ts`, `ledgers/status.test.ts`, `open-decision.test.ts`, `decisions.test.ts`, `workflows.test.ts`, `tasks.test.ts`, `challenge.test.ts`, `steps.test.ts`, `tools/cli-doc.test.ts` and `audits/workflows/workflow-shape.test.ts`: 1039 passed, 2 failed. Every planned group 8 test and every attempt-1 remediation test passes.
- The 2 failures are `bkit decisions check > refuses Q1 when the engine file holds the loop question` (Task 39) and `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` (Task 43). Both are group 11 take-overs, red by design until Task 34 makes `check` read the `decision-counts` row (`build-tests-red-11-2.md`). No group 8 `DONE WHEN` or `TEST FIRST` names them, so they are not gaps here.
- Task 30's `git grep -n -e engineSibling -e isEngineFile -- .bkit/core/engine ':!*.test.ts'` prints nothing; neither does a grep for `mergeItems`, `mergeHeader`, `TAKEN_UNASKED`, `engineStub` and `engineWith`.
- Test-first audit (`build-tests-green-8-3.md`): `Enforced: true`, 24 planned tests red then passed. It has no `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Audit gap `TASK 29: delete-still-referenced` (`mergeItems` at `docs/deferrals.jsonl:531`) is not a gap. The hit is text inside an append-only deferral row about an earlier challenge finding, not a code reference.
- Taken over, each judged as a planned test of the task that took it, against that task's `DONE WHEN`: Task 28 took six Task 11 `decisions counts` tests; Task 29 took six Task 9 and two Task 18 `open-decision.test.ts` tests; Task 30 took the Task 9 `status resume` and `workflows summary` tests and the Task 18 `decisions skip` test. Each asserts the row-based behaviour its task names, was red before its code, and passes now.
- Decision records: `build-decision-1-1.md` (group 3 verify) and `build-decision-1-2.md` (challenge, Task 18 Fix now; assumed, not the owner's acceptance) accept no group 8 gap. `build-decision-2-1.md` (group 8 verify loop, Try again; assumed, not the owner's acceptance) routes this round and accepts no gap.
- `docs/observability.md` and `docs/testing.md` are present; the group adds no new error path beyond the usage and `problem` exits the tasks name.

## Identified Gaps Log

None
