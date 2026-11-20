Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3. The plan has three groups: group 1 holds tasks 1-2, group 2 holds tasks 3-4, and group 3 holds tasks 5-7.

## Integration Gaps

0. The three groups build one `finish` flow in `.bkit/core/engine/commands/workflow/steps.ts`, and its parts fit together:

- **Order (tasks 1, 3, 5):** The gate checks (`gateChecks`, `missingRowFields`) refuse first, with `EXIT.NO`. After them comes the generate block, gated by `CODE_STEPS.has(step) && commit === "auto"`. Next is the planned-test lock (`CODE_STEPS.has(step)`), then the `bkit.workflows` check, then the commit. One `CODE_STEPS` set drives both the generate run and the lock.
- **Exit 16 is gone (task 3 replaces task 1's contract):** `EXIT_GENERATE_FAILED` and every `exit 16` string are gone from `steps.ts`, `.bkit/core/.bkit/cli.md`, `.bkit/cli.md` and `docs/testing.md`. The only `exit 16` left in `.bkit/core/.bkit/workflows.md` (line 1149) belongs to `bkit branches sync-dev`, which this diff does not touch. A failing generate logs, calls `recordGenerateFriction`, prints `generate: failed` and goes on.
- **Task 4's split check and task 5's set-aside agree:** Task 5 sets `workflowsBefore` to HEAD's reading only when the HEAD write lands (`kept` defined). The final check then reads `ownWorkflowKeys` first and falls back to `changedKeys(wfHead, wfBefore)`. So when generate reproduces the working reading, the change is judged by task 4's rule (added keys ride, `generatedWorkflows` goes on the row and in the output, any other change exits 13). When it does not reproduce it, or generate fails, the kept reading is restored before exit 13. Both the set-aside and the final check skip a `package.json` that `recordedPath` marks as already dirty.
- **Task 7 closes the restore path task 5 opened:** `restoreKept` returns `RestoreOutcome`. Both call sites route every outcome other than `structured` to `refuseWriteBack`, which reports `none` with the write error.
- **Task 6:** `recordGenerateFriction` keys its row `steps-finish-generate/<step>`, apart from the `steps-finish/<step>` key that `recordTestLockFriction` uses.
- **Shared helper (task 4):** `isBkitOwnRepo` in `.bkit/core/engine/shared/package-roots.ts` is used by `steps.ts` (twice), `payload-links.ts` and `template-copies.ts` (twice). No inline `path.resolve(cwd) === getPkgRoot()` copy is left.
- **Docs (tasks 2, 3, 4, 5):** The `Callers` bullet and the `Limits are fixed for the run` bullet of `.bkit/core/.bkit/workflows.md` match their rendered copies in `.bkit/workflows.md` word for word. Together with the `exitCodes` help and the `docs/testing.md` `steps.test.ts` row, they describe the code as it stands. The `docs/deployments.md` bullet from task 2 describes a successful generate only, which still holds after task 3.

## Previously Attempted

- `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-1.md`: holistic attempt 1, run after group 1. PASS, tasks 1 and 2.
- `docs/plans/202611/logs/1051-build-code-step/build-plan-verify-holistic-1-2.md`: holistic attempt 2, run after group 2. PASS, tasks 1-4.
- Group verifies: `build-plan-verify-1-1.md` PASS (tasks 1, 2); `build-plan-verify-2-1.md` PASS (tasks 3, 4); `build-plan-verify-3-1.md` CONCERNS (task 5 write-back result ignored, closed by `build-plan-gaps-remediate-3-1-log.md`); `build-plan-verify-3-2.md` CONCERNS (task 5 restore outcome, which became task 7 through `build-decision-1-3.md` Q2); `build-plan-verify-3-3.md` PASS (tasks 5, 6, 7).

## Notes

- **Decision records:**
  - `build-decision-1-1.md`: Q1 and Q2 were both answered `B` (Fix now) by the owner, and they became tasks 3 and 4. Q1 replaces the exit-16 clause of task 1's `DONE WHEN`, so task 1 is judged on the rest of it.
  - `build-decision-1-2.md`: Q1 `B` became task 5's design. Assumed, not the owner's acceptance.
  - `build-decision-1-3.md`: Q2 `A` became task 7. Assumed, not the owner's acceptance.
  - None of these records accepts an open gap.
- **Tasks 1-7 are satisfied.** Every `DONE WHEN` holds in the code at HEAD `86d7675fc`. `tmp/bkit-diff-1051-build-code-step.md` matches `git diff 724848c61 HEAD` (the run's `workflow-started` parentSha) for every source file; the only extra files are the run's plan and logs.
- **Checks re-run here:**
  - `pnpm exec vitest run` on `steps.test.ts`, `package-roots.test.ts`, `payload-links.test.ts`, `payload-links.integration.test.ts`, `template-copies.test.ts` and `template-copies.integration.test.ts`: 6 files, 262 tests passed.
  - All 22 distinct `TEST FIRST` names are in `steps.test.ts`, each once, with no `.skip`, `.only` or `.todo`.
  - `tsx .bkit/core/engine/tools/cli-doc.ts`: exit 0 (no `cli.md` drift).
  - `node scripts/gate/bkit-check-dist.mjs --ref=HEAD`: exit 0.
  - `bkit-text-ceiling.mjs check`: prompts 83837, workflows 57977.
  - `node dist/cli.js check`: exit 0.
  - Frozen files: none of `tasks.ts`, `summary.ts`, `workflows.ts`, `branches.ts`, `prs.ts`, `land.ts`, `.bkit/instructions.md`, `.bkit/core/prompts/`, `.bkit/core/workflows/`, `.husky/` or `.github/workflows/` changed since the base.
- **Derived Test Matrix:** all 24 rows map to a test in their task's `TEST FIRST`. The row "a failing `bkit:generate` exits 16 ..." is listed under both task 1 and task 3: it is one test, taken over by task 3, which asserts exit 0, the row and the commit.
- **Test-first audits** (`build-tests-green-1-1.md`, `2-1`, `3-1`, `3-2`, `3-3`): all show `Enforced: true`, `Verdict: PASS`, `Gaps: 0` and `Unproven: 0`.
  - Taken over (2-1): task 3's rewrite of task 1's exit-16 test. It matches task 3's `DONE WHEN`, so no gap.
  - Already landed (3-1, 3-2, 3-3): the task 5 test "outside bkit's own repo a bkit.workflows difference before bkit:generate exits 13 and finish never rewrites package.json". The tests step's reason: it pins unchanged behaviour that the existing exit-13 path already meets. No gap.
- **Gate:** `build-holistic-gate-1-2.md` (after group 2) passed. No holistic gate has run yet after group 3. Per `Local tests first`, that gate and the pre-push hook run the full suite, so it was not run here.
- **Mandatory tasks:** `docs/testing.md` and `docs/observability.md` are present. Failures go to stderr through `ctx.log` and are reported to the caller by exit 13 or by `generate: failed`. The plan has no `Documentation Updates` section; tasks 2-5 carry the doc rows. Task 7's `DONE WHEN` limits its change to `steps.ts`, `steps.test.ts` and `dist/`, so no doc row was due.
- **Out of scope, proposed separately (not gaps):**
  - (a) The JSDoc on `refuseWriteBack` ("the step's own bytes are restored") is true only for the `bytes` outcome.
  - (b) `refuseWriteBack` emits `changed: []`, while the exit-13 help says `changed` names the keys.
  - (c) The comment "A code step never edits a planned test case ..." still sits above the generate block instead of the lock block it describes.
  - (d) Challenge deferrals in `docs/deferrals.jsonl` stay open as routed. Their keys end `steps-ts-1426` (graph register built from the pre-edit index), `steps-ts-1439` (a signal-killed generate logs `exited undefined`), `steps-ts-1122` (an unparseable `package.json` now exits 13), `template-copies-ts-62` and `package-roots-ts-52` (`isBkitOwnRepo` now covers linked worktrees and non-git folders inside a bkit checkout).

## Identified Gaps Log

None
