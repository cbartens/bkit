Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (Group 1: Tasks 1, 2, 8; Group 2: Tasks 3, 4, 5, 6, 7; Group 3: Task 9; Group 4: Tasks 10, 11, 12, 13, 14; Group 5: Tasks 15, 16, 17; Group 6: Tasks 18, 19, 20, 21).

## Integration Gaps

0 integration gaps.

- The one gap from attempt 6 is closed. `c3e5859c4` rewrote the selection in `.bkit/core/engine/checks/after/tools.test.ts:737-739` (test `does not promise bkit upgrade for an unindexed doc while the index holds an unreadable row`) as two chained `.filter` calls. It selects the same findings as the old `&&` filter, and all three assertions are unchanged. No source file changed, and no lint opt-out was added.
- Task 14 (Group 4) and Task 21 (Group 6) now agree in behaviour and pass the static gate. When the `## Project Documents` table holds an unreadable row, `syncProjectDocs` registers nothing, and `detectProjectDocs` says upgrade registers the doc only once the row is repaired.
- `git diff b68e7fa3c..HEAD` outside `docs/plans` touches only that test file. The cross-group checks recorded in `build-plan-verify-holistic-5.md` and `-6.md` still hold: the Task 19 shared `usable` predicate, the Task 20 digests, the Task 18 `stripUntrusted` with the Task 10 exclusions, and `dist/` matching its sources.

## Previously Attempted

- Holistic: `build-plan-verify-holistic-1.md` (CONCERNS, 1 gap), `-2.md` (PASS, Tasks 1-9), `-3.md` (CONCERNS, 7 gaps), `-4.md` (PASS, Tasks 1-17), `-5.md` (CONCERNS, 1 integration gap: Task 21's unparsed-row guard vs Task 14's DONE WHEN, fixed in `b68e7fa3c`), `-6.md` (CONCERNS, 1 integration gap: the `b68e7fa3c` test failed lint with `vitest(no-conditional-in-test)` at `.bkit/core/engine/checks/after/tools.test.ts:738`). Remediation logs `build-plan-gaps-remediate-holistic-1-log.md`, `-3-log.md`, `-5-log.md`, `-6-log.md` (attempt 6 fix in `c3e5859c4`).
- Group reports: `build-plan-verify-1-5.md`, `-2-2.md`, `-3-1.md`, `-4-1.md`, `-5-1.md`, `-6-2.md` (all PASS).

## Notes

- Mode `Holistic`, all 6 groups, judged on the tree at `c3e5859c4`. `tmp/bkit-diff-864-move-project-docs.md` has partial diff coverage (20 largest of 428 files). Attempt 6 judged every task at `b68e7fa3c`. Since then only `c3e5859c4` changed a non-plan file (6 lines in `tools.test.ts`), and I read that diff in full.
- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 on the first run (`verdict: PASS`, `lockHolder: null`). Lint (`oxlint --type-aware --deny-warnings` over the changed engine files), prettier and typecheck passed. Unit lane: 231 files, 9322 passed, 2 skipped. Integration lane: 229 files, 9291 passed, 2 skipped. Script suites: 6 + 13 + 13 passed. Cloud setup for `db` and `cli` was unavailable and non-blocking. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/h7-tests-changed.log`.
- Direct runs: the `tools`, `index` and `project-docs` unit suites passed 120 of 120, and `oxlint --deny-warnings` on `tools.test.ts` exited 0.
- All 41 planned `TEST FIRST` names exist exactly once in their named files. Every Derived Test Matrix row maps to a task whose TEST FIRST names that test.
- Task 14 is back on the `Tasks` line. Its behaviour met its DONE WHEN at attempt 6, and its regression test now passes the static gate. Tasks 1-13 and 15-21 stay satisfied, as `build-plan-verify-holistic-5.md` and `-6.md` record. Their code is unchanged and their tests pass in the full lanes above.
- No test-first audit report was supplied for this holistic round. Carried forward for the owner to answer at the end of the build, not as gaps: Task 1 `migrates legacy ownership without changing project text or core ownership` (red `vacuous`), Task 8 `leaves project docs, the index and the version file unchanged when upgrade runs twice`, Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`, and Task 17's two `Already landed` tests (`reports an index row through a regular file as ambiguous instead of throwing`, `reports a NUL-byte index path as ambiguous instead of throwing`). The tests step's reason for those two was that `detectProjectDocs` already returned `project-docs-ambiguous` without throwing.
- Decision records:
  - `build-decision-1-1.md`, `-1-4.md` and `-1-5.md` record the owner choosing "Fix now".
  - `build-decision-1-2.md` and `-1-3.md` hold no questions.
  - No record was needed to accept a gap this round.
- Mandatory checks:
  - Errors print through `logReport` and the `project-docs-*` advisories, per `docs/observability.md` § Advisory Checklist Output.
  - Every Documentation Updates row is done.
  - Gate and Verification Plan checkboxes left unticked in the plan are advisory and block nothing.
- Out-of-scope observations carried from attempts 4-6, not gaps:
  - A `./docs/security.md` link target is treated as an equivalent, not the same path.
  - One unrelated prose row in `## Project Documents` blocks registration of every default doc. The advisory says so.
  - Plan reviewers have no `Documentation Warnings` output.
  - `docs/testing.md` does not list the pass-through `node:fs` mock.
  - The handover wording in `.bkit/core/.bkit/prompts.md` § Debug Phase.
  - `stripManagedWrapper` reports `inside-fence` for a populated doc that quotes a marker in a code fence.

## Identified Gaps Log

None.
