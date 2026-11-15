Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none
Fingerprint: 0a6a6be9c326b6b3ea688e2b83f53c916b2cc13b19c510f929523393fe104cdd
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 groups verified (the plan has 3 groups).

## Integration Gaps

1 integration gap.

- Catalog states the old continue rule: Group 3 changed the `continue` rule in `.bkit/core/workflows/bkit-build.md`. TASK 7 added the condition that no source changed since the paused verify (`SOURCE_CHANGED` = false). TASK 8 moved the verify tick before the `build-decision` row. The Group 2 (TASK 5) text in `.bkit/core/.bkit/workflows.md` was not updated to match. The § Decision Pause `Then:` bullet (line 1003) lists only three conditions: every item `Accept`, the loop question `Decide` and no `Gate: FAIL`. The **Re-runs follow answers** row (line 259) names only `Fix now`, `Try again` and a red gate as re-run causes. The build gate checklist line (`.bkit/core/workflows/bkit-build.md:346`) also leaves out the source condition. The installed `.bkit/workflows.md` repeats the stale text. Build agents always read that catalog (`.agents/docs.md` marks it as always-read for Build), so an agent reading it would route `continue` after a fix round that edited source the verify never saw. The runtime workflow text is correct, so this is drift in the docs, not in behaviour.

## Previously Attempted

- `build-plan-verify-1-1.md`: PASS, Tasks 1, 2, 3.
- `build-plan-verify-2-1.md`: CONCERNS, 2 fixable gaps (`.bkit/instructions.md` out of sync). `build-plan-gaps-remediate-2-1-log.md` closed them.
- `build-plan-verify-2-2.md`: PASS, Tasks 4, 5.
- `build-plan-verify-holistic-1-1.md`: CONCERNS, 1 fixable integration gap (installed copies not re-rendered). `build-plan-gaps-remediate-holistic-1-1-log.md` closed it (commit `81e831def`).
- `build-plan-verify-holistic-1-2.md`: PASS, Tasks 1-5.
- `build-plan-verify-3-1.md`: PASS, Tasks 6, 7, 8, 9.

## Notes

- Diff reviewed: `git diff 3e08269f7..HEAD` (the feature's own commits), focused on `git diff 81e831def..HEAD` (the changes since the last clean holistic check), plus `git diff HEAD`. The uncommitted changes only tick TASK 6-9 in the plan and add `status.jsonl` rows. The supplied `tmp/bkit-diff-957-workflows-skip-re.md` was not used, because it is over its size guard and mostly covers unrelated `dev` commits.
- Tests: the caller said to run single named files only and no `bkit:gate:*` script, so `bkit tests changed --base=81e831def` was not run. Each of these files was run alone with `BKIT_TEST_SLOTS=2 pnpm bkit:test:file`, and all passed: `tasks.test.ts` (25), `summary.test.ts` (68), `summary-findings.test.ts` (4), `step-table.test.ts` (48), `decisions.test.ts` (50), `status.test.ts` (87), `workflow-shape.test.ts` (282), `counter-prose-audit.test.ts` (71), `owner-wait-rows.test.ts` (9), `runtime-prose-audit.test.ts` (26), `local-gate-audit.test.ts` (37 passed, 2 skipped; the file is unchanged by this feature), `verdict-vocabulary.test.ts` (39), `generated-marker.test.ts` (30), `skip-ci-subject-audit.test.ts` (23), `ci-dispatch-gate-alignment.test.ts` (36), `instructions-coverage.test.ts` (28), `instructions-sources.test.ts` (23), `instructions.test.ts` (108), `cli-doc.test.ts` (7), `status-holes.test.ts` (77) and `core.integration.test.ts` (157).
- `node dist/cli.js check` exits 0 with `0 write(s) would occur`, so the Group 3 edits are in every installed copy. `dist/commands/workflow/tasks.js:194` carries the case-insensitive match, and `dist/commands/workflow/summary.js` carries the `Holistic verify` filter.
- Derived Test Matrix: all 15 rows have their test, named in the `TEST FIRST` of the task the row names. Each test exists under its exact name and passes.
- TASK 1-5 `DONE WHEN` hold, as recorded in `build-plan-verify-holistic-1-2.md`. Group 3 changed `tasks.ts` only in the title regex and `summary.ts` only in the holistic settling, and the tests for those tasks still pass.
- TASK 6-9 `DONE WHEN` hold, as recorded in `build-plan-verify-3-1.md`, and were checked again against the source here.
- TASK 8 follows the owner's `Fix now` answer in decision record `build-decision-1-1.md` (`Decision: Fix now`, not an accept).
- How the groups fit together, each checked:
  - The summary's holistic settling needs every gap `Accept` and the `Holistic verify` loop item `Decide`. That matches the step 6 continue rule, and `decisions.ts:205` writes that loop title.
  - The step 6 tick and the step 7 route both use `build-decision-{RUN}-{DECISION}.md`. `{DECISION}` comes from `build-decision --position=next`, the same number `steps finish --attempt-of=build-decision:next` writes.
  - The case-insensitive match in `tasks.ts:219` reads both the `Task {N}` titles that pause step 2 writes and a copied `TASK {N}`.
  - `SOURCE_CHANGED` is reset to false in Step 8 and Step 10 sub-step 6, and set by the scan-diff in Step 9 and Step 10 sub-step 10. Those are the only places a verify or holistic pause starts.
  - `DECISION_ROUTES.build.routes.continue` still resumes the verify case at `build-plan-tasks`, and the tick now runs before that row is written.
- Documentation Updates: both rows are done. `docs/decisions.jsonl` has row `957-reruns-follow-answers`. `.bkit/core/.bkit/workflows.md` names `continue` wherever it lists decision routes, but its condition text is stale (the integration gap above).
- Observability: Group 3 adds no new error path in the engine. The workflow sends a non-zero tick exit to the Failure Path. `docs/observability.md` adds no requirement here.
- No test-first audit report was supplied for this holistic round.
- Out-of-scope proposal: `build-challenge-2.md` LOW finding 1 (`tasks.ts:219`) asked to anchor the title match (`/^Task (\d+)\b/`), so that a task number mentioned inside an un-numbered gap's title ticks nothing. It shares its `Location` with the challenge-1 finding that became TASK 9. The merged TASK 9 kept only the case-insensitive fix, which makes that match broader, and `docs/deferrals.jsonl` has no row for the challenge-2 finding (the other two LOW findings from the same round each have one). It looks like the merge dropped it. It is not a plan task, so it is not a gap here. A deferral row or a follow-up issue would keep it on record.
- Out-of-scope proposal, carried from `build-plan-verify-3-1.md`: `SOURCE_CHANGED` exists only in the session. A run resumed at an unanswered pause has lost it, and `Pause step: 10` cannot tell Step 10 sub-steps 5-6 apart from sub-step 10.

## Identified Gaps Log

1 gap.

INTEGRATION: Group 3 (TASK 7, TASK 8) changed the continue rule in `.bkit/core/workflows/bkit-build.md` (step 6 now also requires `SOURCE_CHANGED` = false, and the verify tick runs before the `build-decision` row), but the Group 2 (TASK 5) text in `.bkit/core/.bkit/workflows.md` still states the old rule: the § Decision Pause `Then:` bullet (line 1003) lists only every item `Accept`, loop `Decide` and no `Gate: FAIL`; the **Re-runs follow answers** row (line 259) names only `Fix now`, `Try again` and a red gate as re-run causes, and says build routes an all-Accept pause with no `Gate: FAIL` to `continue`; and the build gate line (`bkit-build.md:346`) omits the source condition. The installed `.bkit/workflows.md` repeats the stale text. An agent that reads the catalog would route `continue` after a fix round that edited source the verify never saw. Fix: add the no-source-change condition to those three places (and the tick-before-record order to line 1003), run `pnpm instructions:sync` if the shared-instruction check flags it, then `pnpm tsx .bkit/core/engine/cli.ts upgrade`, and confirm `node dist/cli.js check` reports no drift — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Catalog states the old continue rule: no-source-change condition and tick-before-record order missing from workflows.md and the build gate line
  **Severity:** LOW · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:1003` · **Round:** 1
  - **DONE WHEN:** The § Decision Pause Then: bullet (line 1003) and the Re-runs follow answers row (line 259) in .bkit/core/.bkit/workflows.md, and the Gate — Decision Pause continue line in .bkit/core/workflows/bkit-build.md:346, state that continue also requires no source changed since the paused verify (SOURCE_CHANGED = false), line 1003 says the verify tick runs before the build-decision row, the installed copies are re-rendered with upgrade, and node dist/cli.js check reports no drift
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
