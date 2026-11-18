Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2
Loosened: none
Fingerprint: 4061addf5bc1d349972ae1e5abd34f7c8a34d52d37fe45b00b72e5d73bfdd0ee
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, Tasks 1, 2; gaps TASK 3 not-green (moved-status-file test) and TASK 4 graph drift.
- `build-plan-gaps-remediate-1-1-log.md`: FAIL, Fixed 1; Gap 2 refreshed the graph (commit `01793fc88`), Gap 1 BLOCKED because the failing assertion is in a planned test.

## Notes

- Mode `Group`, judged against `build-diff-1-2.md`. The only change since attempt 1 is commit `01793fc88` (graph refresh, `DETAILS.md`, plan ticks for Tasks 1 and 2); no engine or test file changed. No decision record exists for group 1.
- Tasks 1 and 2 satisfied: their code and tests are unchanged since attempt 1, when `status.test.ts`, `repo.test.ts`, `issues.test.ts` and `tracker.test.ts` passed and the two named integration tests passed (`build-tests-green-1-2.md` shows them still passing).
- Task 3 not satisfied: the code matches every field (no `"invocations"` in `.bkit/core/engine`, `bindRunPublication` and `runPublicationFile` gone), but `keeps one progress comment when the status file moves to the main checkout` still fails at `tracker.integration.test.ts:800` (`build-tests-green-1-2.md`, 27 passed, 1 failed). The test text is unchanged since attempt 1.
- Task 4 not satisfied: code, `dist/` and its TEST FIRST tests and regression guard pass, but `pnpm -s bkit:graph:check` (run here, exit 1) still reports drift in `docs/capabilities.md`, and its whole-file `tracker.integration.test.ts` pass waits on the Task 3 gap.
- Test-first audit `delete-still-referenced` gaps (Task 3 `bindRunPublication`, `runPublicationFile`; Task 4 `endedRunActionKey`): no gap. `docs/decisions.jsonl:948-951` are this plan's own `1008-*` decision rows; `grep -rln` finds no hit in `.bkit/core`, `dist` or `docs/*.md`.
- Test-first audit `not-green` gap (Task 3): `Fixable: true` stands as the audit set it. The fix belongs to the tests step (a code step may not rewrite a planned test); if the workflow routes it only to gaps-remediate again, it will block again.
- Audit `Enforced: true`, `Unproven: 0`; no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Errors on the new path go through `commentDiagnostic` with the `[bkit-tracker]` prefix, per `docs/observability.md` § Tracker reporting diagnostics (checked in attempt 1; code unchanged).

## Identified Gaps Log

2 gaps.

TASK 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` — not-green: unchanged since attempt 1; the one-comment assertions pass, but the last assertion `rows(cwd).at(-1)?.type` toBe "workflow-started" (line 800) fails because the keyed post from the main checkout appends an engine-action row; the code is correct and gaps-remediate attempt 1 was BLOCKED because a code step may not rewrite a planned test; the tests step must assert what the DONE WHEN asks (the folded run stays IN_PROGRESS, or no close row) instead of the last row type — Fixable: true
TASK 4: `docs/capabilities.md` — graph still drifts: gaps-remediate attempt 1 ran `pnpm bkit:graph:refresh` and committed it in `01793fc88`, but `pnpm bkit:graph:check` still reports DRIFT; the committed block keeps the `n_bkit_core_engine_commands_workflow_tracker -->|13| n_bkit_core_engine_shared_json` edge that the tree no longer produces (tracker.ts no longer imports shared/json) and the commands->shared count 431 instead of 418; rerun `pnpm bkit:graph:refresh` against the committed engine edits, commit `docs/capabilities.md` and `DETAILS.md`, and confirm `pnpm bkit:graph:check` passes — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 3: moved-status-file test fails on its last-row assertion
  **Severity:** HIGH · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts:800` · **Round:** 1
  - **DONE WHEN:** Task 3 five TEST FIRST tests pass; the moved-status-file test proves the run stays IN_PROGRESS while the file moves by checking the folded run status or the absence of a close row, not rows(cwd).at(-1)?.type, because the keyed post appends an engine-action row (a tests-step fix: no code step may rewrite a planned test)
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tracker.integration.test.ts keeps one progress comment when the status file moves to the main checkout
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 4: capabilities graph still drifts after refresh
  **Severity:** MEDIUM · **Class:** graph-drift · **Fixable:** true · **Location:** `docs/capabilities.md:134` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:graph:refresh rewrites the docs/capabilities.md graph block against the committed engine edits (dropping the tracker -> shared/json edge), docs/capabilities.md and DETAILS.md are committed, and pnpm bkit:graph:check passes
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
