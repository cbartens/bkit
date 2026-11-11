Verdict: CONCERNS
Failures: 3
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **Task 1 leaves tests it breaks to nobody (plan edit).** Renumbering ship from 14 to 12 steps changes every rendered ship progress line, but Task 1's UPDATE/TEST FIRST names only the `runProgress all workflow numbers` case and the it.each resume case in `.bkit/core/engine/commands/workflow/step-table.test.ts`. Also broken and unnamed:
   - `step-table.test.ts:62-64` `runProgress flat workflow` (`Step 10/14 Merge Gate + Merge PR`, 71%).
   - `step-table.test.ts:155-164` `runProgress attempt suffix` (three `Step 10/14` lines).
   - `.bkit/core/engine/commands/workflow/progress.integration.test.ts:471` (`100% · Step 14/14 Close Workflow`), `:497` (`Step 3/14 Base Check`), `:510-511` (`Step 3/14`, `Step 9/14 Re-validate`).
   `pnpm test` (vitest.config.ts) includes `*.integration.test.ts`, so Group 1's gate goes red with no task that owns the fix. Under the #796 test freeze (knowledge row `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`), the code step cannot touch a planned test file after its red (exit 11), and the tests step cannot touch a file that no TEST FIRST line in the group names (exit 15). Fix: add these cases to Task 1's TEST FIRST (or a named UPDATE line in the tests step) with their new 12-step expectations, and add `progress.integration.test.ts` to Task 1's UPDATE list. Check the per-task cap (10 tests across 3 test files): Task 1 already uses workflow-shape, step-table and status-holes, so the integration file is a 4th file. Split Task 1 (for example, engine step-table plus progress tests in one task, workflow text plus status-holes in another) to stay within the cap.

2. **No capability-register refresh after the engine edits (plan edit).** Tasks 1-2 change exported symbols and symbol counts in `.bkit/core/engine/checks/status-holes.ts`, `.bkit/core/engine/commands/workflow/step-table.ts`, `steps.ts` and `workflows.ts`. `docs/capabilities.md` records per-module symbol counts (for example `:292` `status-holes<br/>47 symbols · 1 files`, `:330` `step-table 14 symbols`). `.husky/pre-push:282-366` blocks the push on register drift, and CI's Check Capability Register runs on every PR. The plan's REGEN procedure (line 409) deliberately avoids `pnpm bkit:generate`, which is the path that would otherwise have rebuilt the register, and nothing replaces it. Fix: add `pnpm bkit:graph:refresh` (run after staging the engine edits, because it reads the staged tree) plus `docs/capabilities.md` to the UPDATE list of the last engine-touching task (Task 2), with a DONE WHEN of `pnpm bkit:graph:check` exiting 0.

3. **The red-CI stop at Step 2 sub-step 5 gets no `NEXT_STEP` (plan edit).** `.bkit/core/workflows/bkit-ship.md:329-340`: when ship opens the PR itself, it waits for CI and asserts green with `prs checks`. Red (`failed` / `failing`, exit 1) goes straight to the Failure Path with no next step. That is a red-CI stop in the same sense as the Step 10 merge gate and the Step 12 squash capstone. The owner's scope ("every red-CI stop in ship hands off to `/bkit-debug`") covers it, but Task 3 names only the two later routes, Open Question 3 says "two places", and the Derived Test Matrix row (plan line 109) asserts "and no other route does". As written, that row would lock the gap in as expected behaviour. Fix: add Step 2 sub-step 5 to Task 3's UPDATE list, change the matrix row to name three routes (Step 2 CI wait, Step 10 merge gate, Step 12 squash capstone), and update Open Question 3 to match. If the owner meant to leave Step 2 out, record it as an explicit Exempt row with a reason, not by silence.

## OPTIONAL

- **Dangling "Task 7" reference.** Plan line 274 says the mirrors and `dist/` "are regenerated in Task 7", but the plan has 5 tasks and the REGEN procedure runs inside Tasks 1 and 3. Point it at the REGEN procedure instead.
- **Stale engine comment left out.** `.bkit/core/engine/commands/workflow/branches.ts:2704` reads "Ship Step 13: after the merge…". After the renumber that is Step 11. Add it to Task 1's UPDATE list so the comment matches the code (there is no behaviour change, so no test is needed).
- **`workflows fail` signature in the catalog.** `.bkit/core/.bkit/workflows.md:801` (§ Failure Path) documents the `workflows fail` signature, and Task 2 adds `--next-step` to it. Name that line explicitly in Task 4. The § is also an `.bkit/instructions.md` source (around line 9612), so its local entry has to be rewritten by hand (knowledge row `renumbering-a-workflow-leaves-instructions-md-local-entries-stale`). The same applies to the bkit-ship source block at `instructions.md:10341` and the pre-release-check example naming `ship-failure-remediate` at `instructions.md:11900`. Name all three in Task 4.
- **Task 4's DONE WHEN grep is too narrow.** It greps for the removed step names only. Leftover `Step 13` / `Step 14` ship citations in `.bkit/core/.bkit/workflows.md` (lines 29, 141, 146, 149, 217, 219, 300, 306, 338, 1076-1135, 1207, 1242, 1253, 1255, 1328, 1353, 1420, 1673) and the step count in `.bkit/core/.bkit/README.md:56` (`| Ship | /bkit-ship | 14 | …`) would pass it. Add a check that no ship citation names Step 13 or 14 and that README shows 12.
- **Matrix rows with no TEST FIRST line.** Matrix rows 3 and 8 have no TEST FIRST line in any task. Row 8 as written cannot go red before the change. Either give each one a TEST FIRST line in the task the `Task` cell names, or reword row 8 so it fails first.
- **Make the test-file split explicit per task.** Several test files (`workflows.test.ts`, `step-table.test.ts`) are touched by more than one task. To avoid tripping the freeze (exit 11 / exit 15), each task should state which test-file edits belong to its tests step and which belong to its code step.
- **Unverified trackers baseline-drift claim.** The plan regenerates only `bkit-ship.none.txt` on the grounds that the other four none baselines have unrelated drift (failure row `workflow-none-render-baselines-miss-read-only-helper-recovery`). In the current tree, all none baselines already contain "Read-only helper recovery", so the drift may already be gone. If the drift is real, a DONE WHEN that needs the whole `trackers.test.ts` to pass can never be met. Confirm before build and scope the DONE WHEN to the ship case if needed.
- **No CHANGELOG entry.** Removing two ship steps and adding a CLI flag changes behaviour consumers can see. If the repo's release practice expects an Unreleased entry, add it to Task 5.
- **Task 1 is large.** It covers the workflow text, the step table, the status-holes order, the retry-loop set and three test files. Splitting it (see CRITICAL 1) also lowers the risk of a half-done renumber.
- **Order on the Failure Path final message.** Failure Path step 6 says the final message is `ship-summary.md` verbatim. Say where the new `Next step:` line goes relative to that verbatim text, so the two rules do not conflict.
- **Alternative to consider:** have `bkit workflows fail` derive the next step from the step key (red-CI keys map to `/bkit-debug`) instead of a free `--next-step` flag. This leaves fewer call sites to keep in step, but the flag is more explicit and matches the existing NEXT_STEP pattern. The plan's choice is defensible; noted for the owner only.

## OUT OF SCOPE

- **#849 removes Ship Step 13 (WS-9).** Ship will be renumbered again when it lands. Sequence #849 after this change and rebase its step numbers then, rather than combining the two renumbers here.

## SUGGESTED SCOPE EXPANSION

- #849 (removes ship Step 13), source `related-issues.md`. Overlaps the same step table and citations. Recommendation: keep separate and sequence it after #911.
- #811 (Failure Path flush), source `related-issues.md`. Overlaps § Failure Path in `bkit-ship.md` and `.bkit/core/.bkit/workflows.md`. Recommendation: keep separate.
- Failure row `workflow-none-render-baselines-miss-read-only-helper-recovery` (`OPEN`), source `related-failures.md` / `docs/failures.jsonl:177`. Overlaps the none render baselines. It looks stale (every none baseline already has the text). Recommendation: verify it, and if it is stale, close it via `/bkit-utility-update-failures`. Do not fold it into this plan.
- Deferral `891-ship-base-red-notice`, source `related-deferrals.md`. Overlaps ship's red-CI handling. Recommendation: keep deferred.
- Deferral `384-promote-status-hole-detector-from-advisory-to-gate`, source `related-deferrals.md`. Overlaps `status-holes.ts`. Recommendation: keep deferred.
- Deferral `911-ship-strategy-field-removal-via-907`, source `related-deferrals.md`. Already an Exempt row in this plan. Recommendation: no action.
