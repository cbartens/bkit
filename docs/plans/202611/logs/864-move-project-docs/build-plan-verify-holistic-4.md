Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (Group 1: Tasks 1, 2, 8; Group 2: Tasks 3, 4, 5, 6, 7; Group 3: Task 9; Group 4: Tasks 10, 11, 12, 13, 14; Group 5: Tasks 15, 16, 17).

## Integration Gaps

0 integration gaps. The 7 gaps logged in `build-plan-verify-holistic-3.md` are closed on the tree at `0aa6cf243`:

- Debug tracker text: `isRawInput` in `.bkit/core/engine/commands/workflow/summary.ts:153-156` now also excludes `context-related-*`, covered by `summary.test.ts` `excludes the debug tracker sweep context-related-N.md from documentation warnings`. The only other debug context artifact, `context-tests-local-{N}.md`, is local test output. Fetched external sources are fenced by `context.ts` (`FENCE_OPEN` / `FENCE_CLOSE`), which `stripUntrusted` removes.
- `bkit check` drift: `node dist/cli.js check` exits 0 with `0 write(s) would occur`; `docs/templates/bkit-plan.md` and `.bkit/version` are refreshed.
- `templates.test.ts` dogfood and `instructions-coverage.test.ts`: both pass in the unit lane (231 of 231 files). The `#### bkit-plan` entry in `.bkit/instructions.md` matches the new bracket.
- Cleanup vs unindexed advice (Task 15 vs Task 14): `detectProjectDocs` now puts an unindexed doc with an ambiguous wrapper in its own `project-docs-unindexed` finding. That finding's action tells the user to remove the wrapper first, and says `bkit upgrade` registers the doc only "once the wrapper is gone". This matches `syncProjectDocs` skipping ambiguous paths. Covered by `tools.test.ts` `does not promise bkit upgrade for an unindexed doc whose wrapper is ambiguous`.
- `docs/observability.md`: the table has a `project-docs-cleanup` row. § Phase documentation warnings names the full exclusion set.
- `docs/migrations.md:41`: names `LEGACY_STARTER_DIGEST_HISTORY`, every released starter with branch-agnostic normalization, and the Task 14 registration rule.

Checked and consistent across groups: `dist/` carries the latest engine edits (`tools.ts`, `summary.ts` and `dist/` all last changed in `0aa6cf243`; `project-docs.ts` and its `dist/` copy in `184e4505c`). The shared resolver is used by both `syncProjectDocs` and `detectProjectDocs`. The five warning fields match between `summary.ts`, the `doc-warning-record` clause and the plan template.

## Previously Attempted

- Holistic: `build-plan-verify-holistic-1.md` (CONCERNS, 1 gap, fixed per `build-plan-gaps-remediate-holistic-1-log.md`); `build-plan-verify-holistic-2.md` (PASS, Tasks 1-9, 3 groups); `build-plan-verify-holistic-3.md` (CONCERNS, 7 integration gaps across Groups 1-5), fixed per `build-plan-gaps-remediate-holistic-3-log.md` in `0aa6cf243`.
- Group 1: `build-plan-verify-1-1.md` to `-1-5.md` (final PASS). Group 2: `build-plan-verify-2-1.md`, `-2-2.md` (CONCERNS, closed by Task 9). Group 3: `build-plan-verify-3-1.md` (PASS). Group 4: `build-plan-verify-4-1.md` (PASS). Group 5: `build-plan-verify-5-1.md` (PASS).

## Notes

- Mode `Holistic`, all 5 groups, judged on the tree at `0aa6cf243`. `tmp/bkit-diff-864-move-project-docs.md` has partial diff coverage (20 largest of 428 files), so I read the remediation commit `0aa6cf243` and the changed files directly.
- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit`, run three times:
  - Run 1 exited 81: the machine-wide tests lock was held by another worktree.
  - Run 2 was killed with SIGTERM (exit 143) while still waiting for the lock. No test ran.
  - Run 3 exited 1. The unit lane passed: 231 of 231 files, 9312 passed, 2 skipped. node:test and bats passed. The integration lane had 1 failure in 229 files (9280 passed, 2 skipped): `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault` timed out at 106500ms.
  - I did not log that failure. The branch does not touch the test or the code it exercises (`git diff origin/dev...HEAD` is empty for them). Rerun alone, the file passed 13 of 13 (139s), so it is a timing flake under full parallel load.
  - Logs: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/h4-tests-changed.log`, `-2.log` and `-3.log`.
- `node dist/cli.js check` exited 0 (`0 write(s) would occur`). Its advisories still show `project-docs-unpopulated` for this repo's own starter-only docs. That is the intended non-blocking behaviour. Log: `h4-check.log` in the same scratchpad folder.
- All 34 planned `TEST FIRST` names exist exactly once in the engine test files. None of them failed in run 3. Commit `0aa6cf243` only adds tests (`tools.test.ts` +16 lines, `summary.test.ts` +34 lines) and changes no planned test's assertions.
- No test-first audit report was supplied for this holistic round. These tests passed at their red step. They are not gaps; the owner answers them at the end of the build:
  - Task 1 `migrates legacy ownership without changing project text or core ownership` (red `vacuous`).
  - Task 8 `leaves project docs, the index and the version file unchanged when upgrade runs twice`.
  - Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`.
  - Task 17's two `Already landed` tests (`reports an index row through a regular file as ambiguous instead of throwing`, `reports a NUL-byte index path as ambiguous instead of throwing`). The tests step's reason: `detectProjectDocs` already returned `project-docs-ambiguous` without throwing.
- Tasks 6, 14 and 16, left off in attempt 3, are satisfied now:
  - Task 6: no untrusted debug tracker text reaches the summary.
  - Task 14: no advisory promises an upgrade registration that sync skips.
  - Task 16: the rendered template, the instruction registry and the dogfood test agree.
- Tasks 1-5, 7-13, 15 and 17 stay satisfied, as `build-plan-verify-holistic-3.md` and the group reports record.
- Decision records:
  - `build-decision-1-1.md` (Fix now, Task 8), `build-decision-1-4.md` (Fix now, Task 9) and `build-decision-1-5.md` (Fix now, both halves, Task 14) are the owner's choices.
  - `build-decision-1-2.md` and `-1-3.md` hold no questions.
  - No record accepts a gap.
- Mandatory checks:
  - Every Derived Test Matrix row maps to a task whose TEST FIRST names the test.
  - Migration and index problems are reported through `logReport` in `project-docs.ts` and the `project-docs-*` advisories, per `docs/observability.md` § Advisory Checklist Output.
  - The suite passes apart from the unrelated flake.
  - Every Documentation Updates row is done.
- Gate and Verification Plan checkboxes left unticked in the plan are advisory and block nothing.
- Out-of-scope observations carried forward, not gaps:
  - Plan reviewers have no `Documentation Warnings` output.
  - `docs/testing.md` does not list the pass-through `node:fs` mock in `checks/after/tools.test.ts`.
  - `.bkit/core/.bkit/prompts.md` § Debug Phase wording about the handover's input logs.
  - `stripManagedWrapper` reports `inside-fence` for a populated doc that quotes a marker in a code fence.

## Identified Gaps Log

None.

