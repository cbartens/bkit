Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 7
Loosened: none
Fingerprint: f6c45c22a330833ba9771cca948d98ec827563e9cfff4d512c65caef8a81e21b
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
- `build-plan-gaps-remediate-1-1-log.md`: FAIL, Fixed 1; graph refreshed in `01793fc88`, the test gap BLOCKED because a code step may not rewrite a planned test.
- `build-plan-verify-1-2.md`: CONCERNS, Tasks 1, 2; the same two gaps.
- `build-decision-1-1.md`: Q1 Decide, Q2 Fix now, Q3 Fix now, all assumed by the v6.3 orchestrator on the owner's behalf; both fixes routed to new Task 7.

## Notes

- Mode `Group`, judged against `build-diff-1-3.md`. Since attempt 2 the only code change is the last assertion of `keeps one progress comment when the status file moves to the main checkout` in `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` (commit `a7f20f282`): it now folds the non-`engine-action` rows and expects `lastRun(fold(events), "build")?.status` to be `IN_PROGRESS`; the one-comment assertions are unchanged.
- Tasks 1 and 2 satisfied: code and tests unchanged since attempts 1 and 2.
- Task 3 satisfied: `grep -rn '"invocations"' .bkit/core/engine` finds nothing; `bindRunPublication` and `runPublicationFile` are gone from `.bkit/core` and `dist/`; the moved-status-file test now passes and checks the run stays `IN_PROGRESS`; its other four TEST FIRST tests and the named existing integration tests pass.
- Task 4 satisfied: `endedRunActionKey` is gone from `.bkit/core/engine` and `dist/`; its TEST FIRST tests and the regression guard pass; `pnpm -s bkit:graph:check` passes (run here, exit 0, "docs/capabilities.md matches a rebuild at 09b8f07c0").
- Task 7 satisfied: the moved-status-file test passes with the one-comment assertions unchanged and the folded-status last assertion; `pnpm bkit:test:file` passes on `tracker.integration.test.ts` (28/28, run here); `pnpm bkit:graph:check` passes. Task 7's UPDATE line expected the refresh to drop a `tracker` to `shared/json` edge. That edge is still in `docs/capabilities.md:425`, and the check confirms the current tree still produces it. Attempt 2's claim that the tree no longer produces this edge was wrong, and the DONE WHEN gate holds.
- Checks run here: `pnpm -s bkit:test:file` on `status.test.ts`, `repo.test.ts`, `tracker.test.ts`, `workflows.test.ts` and `issues.test.ts` (5 files, 467 tests passed) and on `tracker.integration.test.ts` (28 passed); `pnpm -s bkit:graph:check` (exit 0, no tracked file changed). The 1-minute load was 2.5 to 3.9 before each run.
- Test-first audit `delete-still-referenced` gaps (Task 3 `bindRunPublication`, `runPublicationFile`; Task 4 `endedRunActionKey`): no gap. The hits `docs/decisions.jsonl:948`, `:950` and `:951` are this plan's own decision rows that record the removal, not uses of the symbols. No `.bkit/core` or `dist/` file references them; the only other hits are archived plan and log files under `docs/plans/`.
- Taken over: Task 7 `tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout`, taken over from Task 3. Judged as a Task 7 planned test: it meets Task 7's DONE WHEN (one-comment assertions unchanged, last assertion checks the folded run is `IN_PROGRESS`) and Task 3's DONE WHEN clause on the same test. The `as StatusEvent[]` narrowing on the filtered `rows()` output is a plain assertion cast, not one of the banned escapes.
- Unproven: Task 3 `tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` (left `vacuous`, not red); the owner answers it at the end of the build.
- Audit `Enforced: true`; no `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Decision record `build-decision-1-1.md` holds no Accept; its Fix-now answers are assumed by the orchestrator, not the owner's own answers.
- Errors on the new path go through `commentDiagnostic` with the `[bkit-tracker]` prefix, per `docs/observability.md` § Tracker reporting diagnostics (checked in attempt 1; engine code unchanged since).

## Identified Gaps Log

None
