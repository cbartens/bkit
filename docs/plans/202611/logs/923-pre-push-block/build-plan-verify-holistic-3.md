Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12
Loosened: none
Fingerprint: 41fab527fea6edeea956eb418f71b429cf4360367995cf17d4d3633cb10bdc9b
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (group 1 Tasks 1-4, group 2 Tasks 5-9, group 3 Tasks 10-12).

## Integration Gaps

1.

- Task 11 (group 3) against the debug workflow-shape test: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Steps 9 and 10 push nothing on dev` finds the push fences of Step 9 and Step 10 with `pushFences` (line 1696), whose regex `/^\s*"\{BKIT\}" branches push\b/` only matches a line that starts with `"{BKIT}"`. Task 11 put `BKIT_PR_CONFLICT_CHECK=false` in front of those pushes, so the helper finds none and the test fails with `no branches push fence: expected 0 to be greater than 0`. On `origin/dev` the workflow has 5 lines that match the regex; on this branch it has 1. The workflow is right and the `**Skip if** BRANCH = dev` guard above each push is unchanged; only the test helper is stale. The test is not a planned `TEST FIRST` test, so the code step can fix it. It failed in both the related and the named batch of `bkit tests changed`.

The rest fits together across the groups:

- The shared open-PR lookup (Task 1, narrowed to same-repo PRs by Task 9) feeds both the CI-suppressor guard and the `PR conflict` block. The `PR conflict` block holds the switch (Task 5), the shallow-clone skip (Task 12), the explicit refspec and tree-OID check (Task 7) and the empty attribute source (Task 6) in one place, in that order. The added and removed lines of `.bkit/templates/.husky/pre-push` and `.husky/pre-push` against `origin/dev` are identical.
- The switch reaches the hook: `bkit branches push` runs git with `gitEnv()` (`.bkit/core/engine/ledgers/telemetry.ts:62`), which copies `process.env` and drops only the `GIT_DIR` / `GIT_WORK_TREE` / `GIT_INDEX_FILE` / `GIT_OBJECT_DIRECTORY` variables, so `BKIT_PR_CONFLICT_CHECK` passes through with no engine change, as Task 5 says.
- Ship (Tasks 5 and 10): all 6 `branches push` lines in `.bkit/core/workflows/bkit-ship.md` carry the switch, and so do the `none` render snapshot and the `.claude`, `.cursor`, `.opencode`, `.agents/skills` and `.agents/plugins` mirrors (6 of 6 each). Task 10 replaced Task 5's "before Step 4, and only those" test with `ship switches the PR conflict check off for every push`, as the plan directs.
- Debug (Task 11): the 4 `branches push --mode=feature` lines carry the switch in the source, the snapshot and every mirror (4 of 4 each); the `--mode=dev` close push is unchanged.
- The tip (Tasks 2 and 8) fires when `merge-tree` or `PUSH_BRANCH_SHA=` is missing; bkit's own `.husky/pre-push` has both, so it stays quiet. `dist/checks/tips/catalogue.js` is in the diff with the source.
- § Git hooks — Husky: the added lines of `.bkit/core/.bkit/templates.md` and `.bkit/templates.md` are identical, and describe Tasks 1, 5, 6, 7, 9, 10, 11, 12 and the tip.

## Previously Attempted

- Build run 2, holistic attempt 2 (`build-plan-verify-holistic-2.md`): `PASS`, Tasks 1-9, when the plan had two groups. Holistic attempt 1 (`build-plan-verify-holistic-1.md`): `CONCERNS`, stale ship none-render baseline, closed by `build-plan-gaps-remediate-holistic-1-log.md`.
- Group 3 verify (`build-plan-verify-3-1.md`): `PASS`, Tasks 10-12, after challenge round 1 and `build-decision-2-1.md` added group 3.
- Earlier group verifies: `build-plan-verify-1-1.md` (`CONCERNS`, closed by fix Task 4 per `build-decision-1-1.md`), `build-plan-verify-1-2.md` (`PASS`), `build-plan-verify-2-1.md` (`CONCERNS`, mirrors, closed by `build-plan-gaps-remediate-2-1-log.md`), `build-plan-verify-2-2.md` (`PASS`).

## Notes

- Test run: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 (`verdict: FAIL`, `failed: related, named`). The related batch failed 2 of 6562 tests; the named batch failed 1 of 8386 (2 skipped in each). The `node --test` batches passed (13 of 13 each).
  - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Steps 9 and 10 push nothing on dev` failed in both batches. It is the gap above.
  - `.bkit/core/engine/commands/land.test.ts` `dev moved before every push: exhausted, nothing landed` failed in the related batch only: a child `git worktree unlock` hit `ETIMEDOUT` when the file had used its time budget (97.9 s, load average near 17 on 10 cores). Run alone, the file passes (45 of 45). This feature does not touch `land.ts` or its test, so it is a load-caused timing failure, not a gap.
- The feature's own test files pass together: `husky-pre-push.integration.test.ts`, `catalogue.test.ts`, `ship-invariants.test.ts`, `debug-ci-evidence.integration.test.ts`, `ship-verdict.integration.test.ts`, `render/trackers.test.ts` and `dogfood-templates.test.ts` (7 files, 465 tests). `workflow-shape.test.ts`, `local-gate-audit.test.ts`, `status-holes.test.ts` and `ci-dispatch-gate-alignment.test.ts` were run because they match on push lines; only the `workflow-shape` case above fails. No other test anchors a regex on `"{BKIT}" branches push`.
- Tasks 1-10 and 12 are satisfied: their `DONE WHEN` behaviour is in the hooks, workflows, snapshots, mirrors, tip and doc, and their tests exist and pass. Task 11 is not: its own work and its `TEST FIRST` test are in place and pass, but it broke `workflow-shape.test.ts` and did not fix it.
- Every Derived Test Matrix row has its test in its task's `DONE WHEN` or `TEST FIRST`. The Task 5 row "ship switches the PR conflict check off for its pushes before Step 4, and only those" is superseded by Task 10's row, as Task 10's `DONE WHEN` directs. The plan has no `Documentation Updates` section.
- No test-first audit report was supplied to this step, so Step 8 decided nothing. `build-plan-verify-3-1.md` read `build-tests-green-3-1.md`: Enforced true, 0 gaps.
- Decision records: `build-decision-1-1.md` (fix Task 4), `build-decision-1-2.md` (owner direction for Task 5: an on/off switch) and `build-decision-2-1.md` (Tasks 10 and 11: switch off on every push that needs it). None accepts the gap above.
- Docs: `.agents/docs.md`, `docs/testing.md` (§ Which tier, § Test first, § Tests lock) and `docs/observability.md` § Scope (logging is CLI stdout and stderr only) were read. The hook's new lines report on stderr with the existing `[pre-push]` prefix.
- Out of scope, for the owner:
  - The branch carries two commits not on `origin/dev` and not this feature's work: `d8cee96cf` (Discovered gotchas rule, `telemetry.ts` writers) and `7b6a5e636` (#887 plan). They show up in the feature diff.
  - The feature-branch pushes in `bkit-build`, `bkit-plan` and `bkit-design` do not set `BKIT_PR_CONFLICT_CHECK=false`; Tasks 10 and 11 cover only ship and debug.
  - The BLOCKED `Fix:` line says `git fetch origin $PR_BASE && git merge origin/$PR_BASE`, which leaves no `origin/<base>` in a single-branch clone.
  - `docs/deployments.md` § Pre-push checklist does not list the PR conflict check.
  - The two `gh not on PATH` tests now test the same thing.

## Identified Gaps Log

1 gap.

- TASK 11: INTEGRATION: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug Steps 9 and 10 push nothing on dev` fails ("/Step 9 — Push Remediation/: no branches push fence: expected 0 to be greater than 0"): its helper `pushFences` (line 1696) matches only lines that start with `"{BKIT}" branches push`, and Task 11 (group 3) put `BKIT_PR_CONFLICT_CHECK=false` in front of the Step 9 and Step 10 pushes of `.bkit/core/workflows/bkit-debug.md`, so the helper finds no push fence; Task 11 broke the test and did not fix it — let `pushFences` accept the optional `BKIT_PR_CONFLICT_CHECK=false ` prefix (the `**Skip if** BRANCH = dev` guard above each push is unchanged) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 11: Task 11 broke workflow-shape.test.ts debug Steps 9 and 10 push nothing on dev
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:1697` · **Round:** 1
  - **DONE WHEN:** pushFences in .bkit/core/engine/audits/workflows/workflow-shape.test.ts accepts a branches push line with the optional BKIT_PR_CONFLICT_CHECK=false prefix, and "debug Steps 9 and 10 push nothing on dev" passes against .bkit/core/workflows/bkit-debug.md
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/workflow-shape.test.ts debug Steps 9 and 10 push nothing on dev
<!-- bkit:task 1 end -->
