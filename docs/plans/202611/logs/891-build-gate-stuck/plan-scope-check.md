Verdict: CONCERNS
Failures: 4
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit) Group 1 leaves `.bkit/core/.bkit/cli.md` stale, so its own group gate goes red.** Tasks 2, 3 and 4 add the `tests accept` and `tests failures` verbs and the `--accepted-from` flag. The only `pnpm cli:sync` run is in Task 9 (group 2). `.bkit/core/engine/tools/cli-doc.test.ts:13` ("the generated region of .bkit/cli.md is current (run pnpm cli:sync)") is a unit test inside `bkit:gate:static-unit`, so the group 1 gate fails, which contradicts the runbook's "Each group leaves `bkit:gate:static-unit` green". It also breaks the rule that a task fixes the tests it breaks. Fix: each task that adds a verb or flag (2, 3, 4) adds `**UPDATE:** .bkit/core/.bkit/cli.md: regenerated with pnpm cli:sync`, and its `DONE WHEN` names `cli-doc.test.ts` passing.
2. **(plan edit) Tasks 1-5 edit `.bkit/core/engine/**/*.ts`, but only Task 9 rebuilds `dist/`.** The project rule `Engine builds` (`.agents/rules.md:202`) requires `pnpm build && git add dist/` in the same commit as the engine edit. The repo pre-commit runs `bkit:check:dist` on staged engine `.ts` and refuses a commit while `dist/` is stale. This is the exact wedge recorded on #707: `steps finish` exits 8 at the first per-step commit. Fix: Tasks 1, 2, 3, 4 and 5 each carry `pnpm build` and `dist/` in their scope and `DONE WHEN`. Task 9 keeps only the final regeneration.
3. **(plan edit) The docs scope misses the sections of `.bkit/core/.bkit/workflows.md` that the change makes wrong.** Task 9 and `Documentation Updates` name only § Group gate and § Local gate scripts. `Data Schema Changes` says the new row and fields are documented in § Local gate scripts. The status-row contract actually lives in other sections, and these stay stale:
   - § `status.jsonl` — workflow state SoT: the `test-run` row shape at `:301` (no `failedCases`, `failedCasesTruncated`, `acceptedFailing`), and the row-type and writer tables at `:299-:328` (no `accepted-failures` row and no `bkit tests accept` writer).
   - § Decision Pause at `:988-:989`: the hard-blocker list has no named-failure or `onlyAccepted` item, and the line "Group-gate failures are never items." directly contradicts Task 6.
   - § `/bkit-ship` Confirm Assumed Items (`:1119`): Task 8's `ACCEPTED_TESTS` narration is not described.

   The `Index updates` rule requires `.bkit/workflows.md` to change with every workflow edit. Fix: add these sections to Task 9's `UPDATE` line and to the `Documentation Updates` row, and point `Data Schema Changes` at § `status.jsonl`.
4. **(plan edit) The `Derived Test Matrix` has no row for two behaviours that Success Criterion 2 and Gate 2 rely on.**
   - Edge Case "Two cases share a `name` in different files → only the case whose `classname` and `name` both match is accepted" (decision `891-accepted-test-identity-is-junit-classname-and-name`). No test proves that an accept of `a.test.ts > x` leaves `b.test.ts > x` failing and `unaccepted`.
   - Edge Case "`tests run` without `--accepted-from` → no accepted cases are passed, and the verdict comes from the exit code exactly as before". Task 3's `DONE WHEN` says "a gate run without the flag sees no such variable", and Gate 2's "No gate weakened" checkbox depends on it, but no `TEST FIRST` test covers it.

   Fix: add one matrix row and one Task 3 `TEST FIRST` test for each. Task 3 then has 7 tests in 2 files, which is within the per-task cap.

## OPTIONAL

- **Q2's default overrides the newest input.** The issue comment (2026-11-08T12:17, the newest dated input) settles decision 3: `tests run` returns PASS. The plan keeps that as option A, but its `Default if unanswered` is B, and the whole runbook is written for B. The argument for B (an `&&`-chained gate stops at the failing stage, so the later stages never run) is sound. Even so, a default that silently reverses the owner's recorded decision should not let the build go ahead. Consider making Q2 must-answer at Gate 1 with no silent default, or saying plainly in Context & Goals that the build does not start until the owner confirms B.
- **Success Criterion 1 holds only for consumers whose runners read `$BKIT_ACCEPTED_TESTS`.** If a runner ignores the variable, the build stays stuck, which is the same outcome as the issue's original report, now with a clearer pause. The Edge Cases table says so, but the Narrative and Success Criteria do not. Add one line to the Concrete Example or the Edge Cases saying that, for an unwired runner, Criterion 1 is not met until the consumer follows `docs/testing.md` § Accepted failures.
- **Shell quoting for the owner's reason.** Task 6 writes `--reason="{human's reason}"` inside a double-quoted bash argument. A reason that contains `"`, a backtick or `$(` breaks the command or runs code. JUnit case names quoted into the decision file are untrusted too. Pass the reason through a file or stdin (`--reason-file`), or require single-quote escaping, and add a test with a reason that contains a quote and a backtick.
- **A Step 8 routing arm is promised but missing.** `Suggested Scope Expansion` says "Task 6 and 7 add routing arms to … Step 8", but Task 7 only adds a flag. With an unwired runner and every failing case accepted, Step 8 sub-step 11 still sends the FAIL to Step 9 remediate rounds that cannot change anything, and the pause only comes once the limit is used up. Either add an arm (`onlyAccepted` true → go straight to the Decision Pause) or correct the expansion row.
- **Task 6 does not say where the run goes after a named-failure `Accept`.** The Process Sketch says "Step 8 runs again" (route `verify`). An accept from a `TESTS_LOOP` pause should re-run Step 12 (route `tests`). Name both in Task 6.
- **Lesser edge cases have no matrix row.** These are: `--accepted-from` naming a status file with no `accepted-failures` rows (empty list, behaviour unchanged); the one-line `onlyAccepted` log; `acceptedFailing` on the `test-run` row; the pause text for a failure that has no test names (a Task 6 workflow-text assertion); and the headless hard-blocker path (`decisions apply --by=headless` exits 4).
- **Some `DONE WHEN` and `Shared instructions` gaps.** Task 6's `DONE WHEN` item "`pnpm instructions:show --file bkit-build.md` was checked before the edit" cannot be checked in the codebase afterwards. Tasks 7 and 8 also edit sentences in `.bkit/core/workflows/*.md` but do not name the `Shared instructions` check. Move the check into each task's scope, and keep only checkable outcomes in `DONE WHEN`.
- **One input was cut short.** `related-failures.md` reached this audit with only 3 of 9 lines (the tool dropped the rest). Rows in that file were not checked for overlap with this plan.

## OUT OF SCOPE

- An install or `bkit check` advisory when the declared `bkit:gate:*` runners do not honour `$BKIT_ACCEPTED_TESTS`, in the same pattern as `gate-changed-script-missing`. Owners would find the opt-in before a build gets stuck, not at the pause.
- The build summary (`@bkit-build-summary`) listing the accepted cases beside the assumed items, so the owner sees them before `/bkit-ship`.
