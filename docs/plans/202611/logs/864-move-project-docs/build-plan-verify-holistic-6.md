Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

6 of 6 (Group 1: Tasks 1, 2, 8; Group 2: Tasks 3, 4, 5, 6, 7; Group 3: Task 9; Group 4: Tasks 10, 11, 12, 13, 14; Group 5: Tasks 15, 16, 17; Group 6: Tasks 18, 19, 20, 21).

## Integration Gaps

1 integration gap, Fixable: true, logged once below.

- **Attempt 5 remediation (Task 14, Group 4 vs Task 21, Group 6) fails lint.** The behaviour fix in `b68e7fa3c` is correct: `detectProjectDocs` now puts a populated, unindexed default doc into `unindexedBlocked` whenever `index.unparsed` is non-empty, which is exactly the condition under which `syncProjectDocs` (`.bkit/core/engine/install/project-docs.ts:572`) refuses to register anything. The new finding's action says to repair the unreadable row first and promises `bkit upgrade` only "once the row is repaired". But the regression test added with it (`.bkit/core/engine/checks/after/tools.test.ts:738`) uses `&&` inside a `filter` callback, and the changed-files gate rejects it with `vitest(no-conditional-in-test)` under `--deny-warnings`. The gate exits 1 on that single error.

Checked and consistent across groups:

- Sync and detector now agree in all three "unindexed" cases: a plain unindexed default (detector says run `bkit upgrade`, sync registers it), an ambiguous wrapper (`unindexedWrapped`, sync skips it) and an unreadable index row (`unindexedBlocked`, sync sets `indexProblem`). Task 14's "No advisory names an action the CLI will not perform" holds in behaviour.
- `dist/checks/after/tools.js` carries the same change as the source in the same commit.
- `docs/observability.md` § Project documentation advisories still describes `project-docs-unindexed` accurately (same finding id, same meaning).
- Task 19's shared `usable` predicate, Task 20's digests, Task 18's `stripUntrusted` and the Task 10 exclusions are unchanged since attempt 5 (`git diff 034ceefdd..b68e7fa3c` outside `docs/plans` touches only `tools.ts`, `tools.test.ts` and `dist/checks/after/tools.js`).

## Previously Attempted

- Holistic: `build-plan-verify-holistic-1.md` (CONCERNS, 1 gap), `-2.md` (PASS, Tasks 1-9), `-3.md` (CONCERNS, 7 gaps), `-4.md` (PASS, Tasks 1-17), `-5.md` (CONCERNS, 1 integration gap: Task 21's unparsed-row guard vs Task 14's "No advisory names an action the CLI will not perform"). Remediation logs `build-plan-gaps-remediate-holistic-1-log.md`, `-3-log.md`, `-5-log.md` (attempt 5 fix in `b68e7fa3c`).
- Group reports: `build-plan-verify-1-5.md`, `-2-2.md`, `-3-1.md`, `-4-1.md`, `-5-1.md`, `-6-2.md` (all PASS).

## Notes

- Mode `Holistic`, all 6 groups, judged on the tree at `b68e7fa3c`. `tmp/bkit-diff-864-move-project-docs.md` has partial diff coverage (20 largest of 428 files). Holistic attempt 5 judged every task at `eafb48a59`. Since then only `b68e7fa3c` changed non-plan files, and I read that diff in full.
- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81 three times while another repo's `bkit:gate:static-unit-integration-e2e-live` held the machine-wide tests lock. On the fourth run it got the lock and exited 1. Unit lane: 231 files, 9322 passed, 2 skipped. Integration lane: 229 files, 9291 passed, 2 skipped. Script suites: 6 + 13 + 13 passed. Prettier and typecheck passed. Lint failed on the one error logged below. Logs: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/h6-tests-changed.log` and `-2.log` to `-4.log`.
- Direct runs while waiting, all passing:
  - `tools`, `index`, `project-docs`, `summary` and `managed-block` unit suites: 202 of 202.
  - `template-path-refs`, `templates`, `shipped-docs-refs`, `rules-sync` and `dogfood-templates`: 669 of 669.
  - `workflows`, `uninstall`, `install` and `upgrade` integration suites: 156 of 156 (`h6-integration.log`).
- All 41 planned `TEST FIRST` names exist exactly once in their named files. Every Derived Test Matrix row maps to a task whose TEST FIRST names that test.
- Task 14 stays off the `Tasks` line. Its behaviour now meets its DONE WHEN, but the commit that closes its gap carries a test that fails the static gate, so the fix is not yet merge-clean. Tasks 1-13 and 15-21 stay satisfied, as `build-plan-verify-holistic-5.md` records. The attempt-5 fix touched none of their code paths, and their tests pass.
- No test-first audit report was supplied for this holistic round. Carried forward for the owner to answer at the end of the build, not as gaps: Task 1 `migrates legacy ownership without changing project text or core ownership` (red `vacuous`), Task 8 `leaves project docs, the index and the version file unchanged when upgrade runs twice`, Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`, and Task 17's two `Already landed` tests (`reports an index row through a regular file as ambiguous instead of throwing`, `reports a NUL-byte index path as ambiguous instead of throwing`). The tests step's reason for those two was that `detectProjectDocs` already returned `project-docs-ambiguous` without throwing.
- Decision records:
  - `build-decision-1-1.md`, `-1-4.md` and `-1-5.md` record the owner choosing "Fix now".
  - `build-decision-1-2.md` and `-1-3.md` hold no questions.
  - No record accepts the logged gap.
- Mandatory checks:
  - Errors print through `logReport` and the `project-docs-*` advisories, per `docs/observability.md` § Advisory Checklist Output.
  - Every Documentation Updates row is done.
  - Gate and Verification Plan checkboxes left unticked in the plan are advisory and block nothing.
- Out-of-scope observations carried from attempt 5, not gaps:
  - A `./docs/security.md` link target is treated as an equivalent, not the same path.
  - One unrelated prose row in `## Project Documents` blocks registration of every default doc. Since `b68e7fa3c` the advisory says so.
  - Plan reviewers have no `Documentation Warnings` output.
  - `docs/testing.md` does not list the pass-through `node:fs` mock.
  - The handover wording in `.bkit/core/.bkit/prompts.md` § Debug Phase.
  - `stripManagedWrapper` reports `inside-fence` for a populated doc that quotes a marker in a code fence.
- The `bkit tests changed` changed-file list includes the untracked report file `build-plan-verify-holistic-6.md` and the modified `status.jsonl`. Neither affected the result.

## Identified Gaps Log

1 gap.

INTEGRATION: holistic attempt 5 remediation of Task 14 (Group 4) vs Task 21 (Group 6) fails the changed-files static gate — `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `[bkit:gate:changed] failed: lint`: `.bkit/core/engine/checks/after/tools.test.ts:738:14: error vitest(no-conditional-in-test)` in the new test `does not promise bkit upgrade for an unindexed doc while the index holds an unreadable row` (added in `b68e7fa3c`), whose `findings.filter((f) => f.id === "project-docs-unindexed" && f.detect.includes("docs/security.md"))` uses `&&`. Every unit and integration test in that run passed (231 files / 9322 tests and 229 files / 9291 tests), and prettier and typecheck passed. Fix: rewrite the selection without a conditional (for example chain two `.filter` calls, or assert on `findings.find` by id and then on its `detect`), keeping all three assertions; no lint opt-out — Fixable: true
