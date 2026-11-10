Verdict: CONCERNS
Failures: 3
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **(plan edit) Task 5 edits text inside a `bkit:start` / `bkit:end` block.** `Documentation Updates` row `docs/deployments.md` and Task 5's `UPDATE: docs/deployments.md: drop "and a Failure Remediate fix"` target `docs/deployments.md:349`. That line sits inside the managed block (`<!-- bkit:start -->` at line 1, `<!-- bkit:end -->` at line 541), so `bkit upgrade` overwrites the edit. Its source is `.bkit/shared/docs/deployments.md:349` (the only `.bkit/shared/docs/` hit for `Failure Remediate`). Fix: move that edit to `.bkit/shared/docs/deployments.md`, re-render through `pnpm tsx .bkit/core/engine/cli.ts upgrade`, add the source file to Task 5's `DONE WHEN` grep, and add a `Documentation Updates` row for it. The `Step 14` citations at `docs/deployments.md:617` and `:640` are below `bkit:end` and stay in Task 5 as written. `docs/testing.md` (`:687`, `:699`, after `bkit:end` at `:551`) and `docs/setup.md:115` (after `bkit:end` at `:52`) are project-owned, so their edits are fine.
2. **(plan edit) Task 1 does not scope the tests that the renumber breaks.** The runbook rule says a task "fixes the tests it breaks". Task 1 renumbers ship to 12 steps, but its `UPDATE` lines and `DONE WHEN` miss these expectations:
   - `.bkit/core/engine/commands/workflow/progress.integration.test.ts:471` expects `Progress: ██████████ 100% · Step 14/14 Close Workflow`. Lines `:497` and `:510` expect `Step 3/14 Base Check`, and line `:511` expects `Step 9/14 Re-validate`. No task names this file, and Task 1's `DONE WHEN` run list leaves it out, because it is an integration test and the list holds only unit files.
   - `.bkit/core/engine/commands/workflow/step-table.test.ts:64`, `:158`, `:161` and `:163` (`Step 10/14 Merge Gate + Merge PR`), plus `:131` and `:134`, sit outside the one test Task 1 names (`runProgress all workflow numbers`).
   - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts:264` (`step(ship, 14)` asserting `workflows close ... --flush ... --branch=`) is not in Task 1's list for that file.
   Fix: add `UPDATE` lines for these sites, and add `progress.integration.test.ts` to Task 1's `DONE WHEN` run list.
3. **(plan edit) A red CI run that stops at the Merge Question does not name `/bkit-debug {FID}`.** The owner's scope says "When ship stops on a red CI run, the stop message names `/bkit-debug {FID}`". Edge Cases row 6 promises `NEXT_STEP` = `/bkit-debug {FID}` when "the merge attempts run out on it". But Task 3 and `Architecture & Component Changes` § Workflow hold `NEXT_STEP` only on the used-up `Else` arm (exit 1 with `MERGE_ASK` false). With `ship.merge.ask` on, the regenerable arm sends a used-up red run to the **Merge Question** (`.bkit/core/workflows/bkit-ship.md:737`). If the owner picks Stop there, the run reaches the Failure Path with no `NEXT_STEP`. The planned test `Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path, and on no other` would then also pin the wrong behaviour. Fix:
   - Hold `NEXT_STEP` on that arm before the Merge Question, and clear it on `Try again`.
   - Add an Edge Cases row for the `ask`-on case.
   - Cover it in Task 3's `TEST FIRST`.

## OPTIONAL

1. **Open Question 1's default installs Success Criteria that no source provides.** The `⚠️ MISSING` marker in `Narrative` and `Success Criteria` is correct for a bug-shape issue with no design. But "Default if unanswered: ... `/bkit-build` treats option A's wording as the contract once the owner ticks the Acceptance Scenario box" lets a box tick adopt wording the plan wrote, without the owner choosing A. A safer default: the plan does not proceed until the owner picks A or B, and plan-update copies the chosen wording into the two subsections.
2. **Task 3 `DONE WHEN` gives no expected count.** "`grep -c 'NEXT_STEP'` counts the Step 10 arms, the Step 12 arm and the two Failure Path uses" names no number, and the Failure Path step 1 flag-list text ("drop `--next-step` when `NEXT_STEP` is not held") adds lines to that count. State the exact count, or drop the clause and rely on the `ship-invariants.test.ts` tests.
3. **One renumber citation is missing.** `.bkit/core/engine/commands/workflow/branches.ts:2704` reads "Ship Step 13: after the merge, bring local dev up to origin/dev". The Breaking Changes row says "Every in-repo citation is rewritten in the runbook", but no task names this line. Add it to Task 1.
4. **The "keep the shared agents" scope bullet has no verification step.** Neither Goal 5 nor option A's Success Criterion 5 has a check. Add a `DONE WHEN` clause (Task 1 or Task 4) that `git diff --exit-code` on `.bkit/core/prompts/bkit-debug-failure-diagnose.md` and `.bkit/core/prompts/bkit-debug-failure-remediate.md` prints nothing.
5. **Process Sketch line 2 (the Merge Question) has no matching Edge Cases row.** Add rows for "attempts used up, `ship.merge.ask` on → the Merge Question asks Stop or Try again, with no diagnosis variant" and for the `ask`-off case, so the sketch restates rows rather than adding a case of its own.
6. **`Documentation Updates` has no `CHANGELOG.md` row.** The change removes two steps, renumbers two more and adds `--next-step` / `nextStep` to `bkit workflows fail`, all of which consumers see. Recent ship and engine changes add a line under `Unreleased`.
7. **The `Supersession Inventory` deletions have no `[DELETE]` markers.** Every `DELETE` row targets part of a file, so describing the deletions inside the `[MODIFY]` blocks is workable. A `[DELETE]` marker or a "Delete" sub-heading under each `[MODIFY]` would make the mirror explicit.
8. **Manual Verification Step 3 runs `workflows fail` without `--post`.** Without it, the tracker comment that carries the new `Next step:` line is never posted live. Consider a `--post` run against a scratch tracker issue, or say why the printed `comment` is enough proof.

## OUT OF SCOPE

None
