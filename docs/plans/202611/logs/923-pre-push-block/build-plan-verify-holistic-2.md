Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none
Fingerprint: cc698925b42cdf533969e1e93d35af07d1725a3f2bf4bb716350528daeee7b45
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (group 1 Tasks 1-4, group 2 Tasks 5-9).

## Integration Gaps

0.

- Attempt 1's gap is closed: `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` lines 202, 226 and 352 now carry `BKIT_PR_CONFLICT_CHECK=false` (commit `8c81f8197`), and `.bkit/core/engine/render/trackers.test.ts` passes. It is the only snapshot that holds the ship `branches push` line.
- The shared open-PR lookup (Task 1, narrowed to same-repo PRs by Task 9) feeds both the CI-suppressor guard and the `PR conflict` block. The guard still runs unless `gh` is missing, and `OPEN_PR` stays empty when `gh` fails.
- The `PR conflict` block holds the switch (Task 5), the explicit refspec and tree-OID check (Task 7) and the empty attribute source (Task 6) in one place. The added and removed lines of `.bkit/templates/.husky/pre-push` and `.husky/pre-push` against `origin/dev` are identical.
- Ship sets the switch on the three `branches push` lines before Step 4 `Integrate` only; `ship-invariants.test.ts` and `ship-verdict.integration.test.ts` (prefixed lookup) pass. The ship mirrors in `.claude`, `.cursor`, `.opencode` and both `.agents` skills carry the same change.
- The tip (Tasks 2 and 8) fires when `merge-tree` or `PUSH_BRANCH_SHA=` is missing; bkit's own hook has both, so it stays quiet. `dist/checks/tips/catalogue.js` is in the diff with the source.
- § Git hooks in `.bkit/core/.bkit/templates.md` describes Tasks 1, 5, 6, 7, 9 and the tip.

## Previously Attempted

- Build run 2, holistic attempt 1 (`build-plan-verify-holistic-1.md`): `CONCERNS`, one gap (stale ship none-render baseline). `build-plan-gaps-remediate-holistic-1-log.md` regenerated the baseline (`DONE — Gap 1`).
- Build run 1, holistic attempt 2 (the earlier `build-plan-verify-holistic-2.md`, overwritten by this report): `CONCERNS`, stale `ship-verdict.integration.test.ts` lookup, closed by `build-plan-gaps-remediate-holistic-2-log.md`.
- Group verifies: `build-plan-verify-1-1.md` (`CONCERNS`, closed by fix Task 4 per `build-decision-1-1.md`), `build-plan-verify-1-2.md` (`PASS`), `build-plan-verify-2-1.md` (`CONCERNS`, mirrors, closed by `build-plan-gaps-remediate-2-1-log.md`), `build-plan-verify-2-2.md` (`PASS`).

## Notes

- Test run: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1. The related batch passed (135 files, 6550 tests). The named batch failed 2 of 8353 tests, at a load average near 20 on 10 cores. `node --test`, bats, oxlint, prettier and typecheck passed.
  - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time`: 1274 ms against a 1000 ms limit.
  - `.bkit/core/engine/commands/workflow/tests.test.ts` `a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row`: a child `spawnSync` hit `ETIMEDOUT`.
  - Both files run alone pass (2 files, 230 tests). This feature does not touch the guardrails hook, `tests.ts`, `junit.ts` or either test, so both are load-caused timing failures, not gaps. The guardrails one is already in `docs/failures.jsonl` as `guardrails-cursor-dense-script-linear-time-flakes-under-load`.
- The feature's own files pass together: `husky-pre-push.integration.test.ts`, `catalogue.test.ts`, `ship-invariants.test.ts`, `ship-verdict.integration.test.ts`, `trackers.test.ts` and `dogfood-templates.test.ts` (6 files, 455 tests).
- All nine tasks are satisfied. Task 5 is now satisfied too: its own work and its two `TEST FIRST` tests were in place, and the two tests it broke (`ship-verdict.integration.test.ts` lookup, ship none-render baseline) are fixed and pass.
- Every Derived Test Matrix row has its test in its task's `DONE WHEN`. The plan has no `Documentation Updates` section.
- No test-first audit report was supplied to this step. The Task 2 tip test's "complete hook" sample carries `PUSH_BRANCH_SHA="$l"` with its `false` expectation kept, so it agrees with Task 8; `build-plan-verify-2-2.md` judged it a needed fixture fix.
- Decision records: `build-decision-1-1.md` (fix Task 4) and `build-decision-1-2.md` (owner direction for Task 5: an on/off switch, which the work follows).
- Docs: `.agents/docs.md`, `docs/observability.md` § Scope (logging is CLI stdout and stderr only; the hook reports on stderr with the `[pre-push]` prefix) and `docs/testing.md` were read.
- The holistic-1 remediation logged `bkit:generate` as BLOCKED by the tests lock; it ran each sub-step by hand except the graph refresh. Its only change was the render snapshot text file, which does not feed the capability register.
- Out of scope, for the owner:
  - The branch carries two commits that are not on `origin/dev` and are not this feature's work: `d8cee96cf` (Discovered gotchas rule, `telemetry.ts` writers) and `7b6a5e636` (#887 plan).
  - The BLOCKED `Fix:` line says `git fetch origin $PR_BASE && git merge origin/$PR_BASE`, which leaves no `origin/<base>` in a single-branch clone.
  - `docs/deployments.md` § Pre-push checklist does not list the PR conflict check.
  - The two `gh not on PATH` tests now test the same thing.

## Identified Gaps Log

None.
