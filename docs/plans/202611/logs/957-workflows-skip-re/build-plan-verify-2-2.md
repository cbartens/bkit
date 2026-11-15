Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5
Loosened: none
Fingerprint: 4994c7412eb7fdc0f263576b599d42bd9bdb0deeb7d39e534b4517a90bf6fde0
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md`: CONCERNS, 2 fixable gaps (`.bkit/instructions.md` out of sync with the TASK 4 and TASK 5 edits).
- `build-plan-gaps-remediate-2-1-log.md`: both gaps logged `DONE`.

## Notes

- Both attempt-1 gaps are closed. `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (no flag) exits 0 with no findings. `.bkit/core/engine/tools/instructions-coverage.test.ts`, `.bkit/core/engine/tools/instructions-sources.test.ts` and `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` pass, 330 of 330 tests. `.bkit/core/engine/tools/instructions.test.ts`, `.bkit/core/engine/audits/templates/template-path-refs.test.ts`, `.bkit/core/engine/audits/templates/template-shape.test.ts` and `.bkit/core/engine/commands/workflow/tasks.test.ts` pass, 190 of 190 tests.
- The fix-round diff in `.bkit/instructions.md` is right. It adds the five new `bkit-build` lines (the step 2 `Task {N}` title, the step 6 `continue` rule, the two step 7 `continue` routes and the gate line) and the **Re-runs follow answers** row in `cross-step-invariants`. It also moves both `commits` / `pushes` drift anchors from `bkit-build:445` to `bkit-build:450`, and line 450 of `.bkit/core/workflows/bkit-build.md` is the `ledgers commit --only-if-dirty-tracked --scope=core --mode=commit` line.
- TASK 4 `DONE WHEN` holds. `.bkit/core/workflows/bkit-build.md` sets `DECISION_ROUTE` = `continue` after the `fix` and `retry` rules, before the `holistic` and `verify` rules, and only when no `Gate: FAIL` header is set. Step 7 sends holistic to Step 11 and verify to `tasks tick --decision`, then Step 7, so no new verify round starts. `route=continue` is written through the `Then:` `steps finish --field=route=` value list, and `DECISION_ROUTES` in `.bkit/core/engine/commands/workflow/step-table.ts` (group 1) has a `continue` entry. Its three `TEST FIRST` tests were red, then green.
- TASK 5 `DONE WHEN` holds. `.bkit/core/.bkit/workflows.md` names `continue` in the invariant row, in the `route` field values, in the Step 15 row and in the Decision Pause `Then:` bullet. `docs/decisions.jsonl` row `957-reruns-follow-answers` is valid JSON. Its test passes on today's debug and ship `Options:` lines.
- Test-first audit (`build-tests-green-2-2.md`): `Enforced: true`, 0 gaps, 0 unproven. Already landed: TASK 5 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug and ship questions offer no answer that re-runs a check without a change". The tests step accepted its pass because today's debug and ship `Options:` lines offer only Stop, Try again, Confirm and Reject. No gap.
- No decision record was supplied, and no `build-plan-current.md` exists.
- Documentation and logging: this group's Documentation Updates are TASK 5's own doc edits, and they are done. The group adds no runtime code, so `docs/observability.md` logging does not apply.
- Mirrors (`.bkit/workflows.md`, `.claude/*` and the other host copies) are not re-rendered yet. Per `.agents/rules.md` **Install to mirror**, that happens once at the end of the session, so it is no gap here.
- Out-of-scope proposal: `pnpm instructions:show --file bkit-build.md` exits 1 with no output. It does the same for `bkit-debug.md` and `workflows.md`, so this group did not cause it. `--file bkit-build` (no `.md`) and `--file .bkit/core/workflows/bkit-build.md` both return entries. `.agents/rules.md` **Shared instructions** tells agents to pass `{basename}`, so either the tool should accept a name with `.md` or the rule should say to drop the extension.

## Identified Gaps Log

None
