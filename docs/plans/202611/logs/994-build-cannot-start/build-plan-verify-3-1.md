Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: fc3d8acca41d02c4938fe8c3b617eab873f929141856367362d8a92a4d4e5caf
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 6 DONE WHEN is met in `.bkit/core/engine/commands/workflow/branches.ts` (`resolveRebase`, `keptBranchCopy`) and `.bkit/core/engine/commands/workflow/worktrees.ts` (`droppedLogsDir`, `keepAside`, now called by `carryLeftovers`). A `planlog` conflict still takes the rebase target's copy and the exit is unchanged. A stage-3 blob that differs from stage 2 is written to the outbox's `{FID}/dropped-logs/{time}/{path}` first. An identical copy keeps nothing. A target-deleted file (no stage 2, `git` returns null) is kept before the `git rm`. The `RESOLVED` line names the kept path. `dist/` carries the same change.
- The TEST FIRST test `does not silently drop a later branch edit to the plan file when dev changed an adjacent line` passes locally. The test-first audit (`build-tests-green-3-1.md`) reports `Enforced: true`, 0 gaps, red then green. The `carryLeftovers` regression test `keeps a dropped log that differs from dev's copy outside the tree, and removes an identical one` (`worktrees.integration.test.ts`) also passes.
- The Fix-now direction (a) comes from decision `build-decision-1-1.md`. It is not an accept. The orchestrator answered it under the away policy; the owner did not type it.
- Observations (no gap): `keptBranchCopy` returns null with no log line when `git cat-file` fails, for example a blob over spawnSync's default 1 MB buffer. The copy is then lost without notice. `droppedLogsDir` is called once per conflicted file, so files from one round can land in different `{time}` folders.

## Identified Gaps Log

1 gap.

TASK 6: docs drift — `.bkit/core/.bkit/workflows.md:835` Tier 2 row and the `docs/testing.md:966` `branches.test.ts` row still describe only taking the rebase target's copy of the feature's plan files; neither says a differing branch copy is now kept under the outbox's `{FID}/dropped-logs/{time}/` and named on the `RESOLVED` line, nor names the new adjacent-line case (Documentation Updates row for `docs/testing.md` asks the rows to name the new cases) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Docs do not describe the kept branch copy of a plan-log conflict
  **Severity:** MEDIUM · **Class:** docs-drift · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:835` · **Round:** 1
  - **DONE WHEN:** The Tier 2 row in .bkit/core/.bkit/workflows.md (and its rendered .bkit/workflows.md) says a differing branch copy of the feature plan file is kept under the outbox {FID}/dropped-logs/{time}/ and named on the RESOLVED line, and the docs/testing.md:966 branches.test.ts row names the adjacent-line case
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/branches.test.ts
<!-- bkit:task 1 end -->
