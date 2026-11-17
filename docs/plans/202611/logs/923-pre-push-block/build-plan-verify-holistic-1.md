Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 6, 7, 8, 9
Loosened: none
Fingerprint: e416f9dbddae4bd1ea1ee403edd95c1fd1caccff3ee921924077d38e35d5dc1a
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (group 1 Tasks 1-4, group 2 Tasks 5-9).

## Integration Gaps

1.

- Task 5 (group 2) against the render baselines: `.bkit/core/engine/render/trackers.test.ts` `bkit-ship: the none render matches its baseline byte for byte` renders `.bkit/core/workflows/bkit-ship.md` for the `none` tracker and compares it with `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt`. Task 5 added `BKIT_PR_CONFLICT_CHECK=false` to the three pushes before Step 4, and the baseline was not regenerated, so its lines 202, 226 and 352 still lack the prefix. The ship workflow is right; only the baseline is stale. The test is not a planned `TEST FIRST` test.

The rest fits together across the groups:

- The shared open-PR lookup (Task 1, narrowed to same-repo PRs by Task 9) feeds both the CI-suppressor guard and the `PR conflict` block. The guard still runs its check unless `gh` is missing, and `OPEN_PR` stays empty when `gh` fails, as before.
- The `PR conflict` block holds the switch (Task 5), the explicit refspec and tree-OID check (Task 7) and the empty attribute source (Task 6) in one place. The added and removed lines of `.bkit/templates/.husky/pre-push` and `.husky/pre-push` are identical.
- Ship sets the switch on lines 282, 306 and 432 of `.bkit/core/workflows/bkit-ship.md`. Step 4 starts at line 456, and the pushes at 485, 644 and 746 do not set it. `.claude`, `.cursor` and `.opencode` ship commands and both `.agents` ship skills carry it 3 times each.
- Run 1's holistic gap is closed: `ship-verdict.integration.test.ts` looks up the push line with the `BKIT_PR_CONFLICT_CHECK=false` prefix, and it passes in this run. The `ship-invariants.test.ts` regex at line 464 is not anchored, so it still matches the prefixed line.
- The tip (Tasks 2 and 8) fires when `merge-tree` or `PUSH_BRANCH_SHA=` is missing. bkit's own `.husky/pre-push` has both (4 and 2 hits), so it stays quiet. `dist/checks/tips/catalogue.js` matches the source.
- § Git hooks in `.bkit/core/.bkit/templates.md` describes Tasks 1, 5, 6, 7, 9 and the tip. `.bkit/templates.md` carries the rendered managed marker and the same body.

## Previously Attempted

- This is holistic attempt 1 of build run 2. Build run 1 ended on a `FAIL` from its holistic remediation; its records are on the branch (`8cda99def`).
- Run 1 holistic attempt 1 (`build-plan-verify-holistic-1.md`, overwritten by this report): `PASS`, Tasks 1-4, when the plan had one group.
- Run 1 holistic attempt 2 (`build-plan-verify-holistic-2.md`): `CONCERNS`, one gap: Task 5 broke `ship-verdict.integration.test.ts` (stale push-line lookup). `build-plan-gaps-remediate-holistic-2-log.md` fixed the lookup (`DONE — Gap 1`) and logged a BLOCKED note on restoring the Task 2 tip test.
- Group verifies: `build-plan-verify-1-1.md` (`CONCERNS`, closed by fix Task 4 per `build-decision-1-1.md`), `build-plan-verify-1-2.md` (`PASS`), `build-plan-verify-2-1.md` (`CONCERNS`, mirrors, closed by `build-plan-gaps-remediate-2-1-log.md`), `build-plan-verify-2-2.md` (`PASS`).

## Notes

- Test run: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1 (`verdict: FAIL`, `failed: related, named`). The related batch failed 1 of 6552 tests. The named batch failed 2 of 8353 tests (2 skipped). The `node --test` and bats batches passed, and so did prettier.
  - `.bkit/core/engine/render/trackers.test.ts` `bkit-ship: the none render matches its baseline byte for byte` is the gap above.
  - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `analyses dense script sources in linear time` failed in both batches (1812 ms and 2245 ms against a 1000 ms limit) with the load average near 28 on 10 cores. Run alone at load ~9, it passes. This feature does not touch the guardrails hook or that test. It is a load-caused timing failure, not a gap, and it is recorded in `docs/failures.jsonl` as `guardrails-cursor-dense-script-linear-time-flakes-under-load`.
- Tasks 1, 2, 3, 4, 6, 7, 8 and 9 are satisfied. Their `DONE WHEN` behaviour is in both hook copies, the tip, the doc and the test helper, and their tests pass in this run (`husky-pre-push.integration.test.ts`, `catalogue.test.ts`, `ship-invariants.test.ts`, `dogfood-templates.test.ts`).
- Task 5 is not satisfied. Its own work and its two `TEST FIRST` tests are in place and pass, but it broke the ship none-render baseline test and did not fix it.
- The Task 2 tip test's "complete hook" sample now carries `PUSH_BRANCH_SHA="$l"` with its `false` expectation kept, so it agrees with Task 8's test. Run 1's holistic remediation logged a BLOCKED note on restoring the tests-step version, because that version contradicts Task 8. No test-first audit report was supplied to this step, so no loosening is decided here; the group 2 verifies judged the change a needed fixture fix.
- Every Derived Test Matrix row has its test in its task's `DONE WHEN`. The plan has no `Documentation Updates` section.
- Decision records: `build-decision-1-1.md` (fix Task 4) and `build-decision-1-2.md` (owner direction for Task 5: an on/off switch). Neither accepts the gap above.
- Docs: `.agents/docs.md` and `docs/observability.md` were read here; `docs/testing.md` and `docs/deployments.md` are present and were read by the group verifies. `docs/observability.md` § Scope limits logging to CLI stdout and stderr; the hook reports on stderr with the `[pre-push]` prefix, like the rest of the hook.
- Out of scope, for the owner:
  - The branch carries two commits that are not on `origin/dev` and are not this feature's work: `d8cee96cf` (Discovered gotchas rule, `telemetry.ts` writers) and `7b6a5e636` (#887 plan). They show up in the feature diff.
  - The BLOCKED `Fix:` line says `git fetch origin $PR_BASE && git merge origin/$PR_BASE`, which leaves no `origin/<base>` in a single-branch clone.
  - `docs/deployments.md` § Pre-push checklist does not list the PR conflict check.
  - The two `gh not on PATH` tests now test the same thing.

## Identified Gaps Log

1 gap.

- TASK 5: INTEGRATION: `.bkit/core/engine/render/trackers.test.ts` `bkit-ship: the none render matches its baseline byte for byte` fails (in both `bkit tests changed` batches): Task 5 (group 2) put `BKIT_PR_CONFLICT_CHECK=false` in front of the three pre-Step-4 `branches push` lines of `.bkit/core/workflows/bkit-ship.md`, but the baseline `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` (lines 202, 226, 352) still has them without it; Task 5 broke the test and did not fix it — regenerate the baseline (`vitest run .bkit/core/engine/render -u`, as `bkit:generate` does) and commit it — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 5: Task 5 left the ship none-render baseline stale, so trackers.test.ts fails
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt:202` · **Round:** 1
  - **DONE WHEN:** .bkit/core/engine/render/__snapshots__/bkit-ship.none.txt carries BKIT_PR_CONFLICT_CHECK=false on the three pre-Step-4 branches push lines (regenerated with vitest run .bkit/core/engine/render -u), and "bkit-ship: the none render matches its baseline byte for byte" in .bkit/core/engine/render/trackers.test.ts passes
  - **TEST FIRST:**
    - .bkit/core/engine/render/trackers.test.ts bkit-ship: the none render matches its baseline byte for byte
<!-- bkit:task 1 end -->
