Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md`: `CONCERNS`, 3 gaps (Task 1 not-green idempotency snapshot, live `.bkit/shared/docs/` references, managed-guide section links). Task 2 satisfied.
- `build-plan-gaps-remediate-1-1-log.md`: `FAIL`. Fixed gaps 2 and 3. Blocked on gap 1 (a planned-test edit) and on the group gate (1 failed, 7407 passed: the same test).
- `build-plan-verify-1-2.md`: `CONCERNS`, 1 gap (the same not-green snapshot). Task 2 satisfied.
- `build-plan-gaps-remediate-1-2-log.md`: `FAIL`. Blocked on the same planned test.
- `build-decision-1-1.md`: the owner chose `Fix now`. Task 8 was added to narrow the snapshot.

## Notes

- Mode `Group`, group 1 (Tasks 1, 2, 8), judged against `build-diff-1-3.md`. Neither brief has a `Deviations` section. `build-plan-current.md` reports no affected tasks.
- Task 8 is satisfied. In `.bkit/core/engine/commands/install/upgrade.integration.test.ts`, `stableSnapshot()` drops only `.claude/bkit-cloud.md` and `.bkit/advisories.md` (`CHANGES_EVERY_RUN`). Both the closing comparison of `migrates legacy ownership without changing project text or core ownership` and the new test `leaves project docs, the index and the version file unchanged when upgrade runs twice` use it. The new test also compares `docs/testing.md`, `.agents/docs.md` and `.bkit/version` one by one. Commits `6a6b1ab7f` and `c3104f1d8` touch only that test file and run logs, so no source file changed.
- Task 1 is satisfied. Its last open gap (the not-green idempotency snapshot) is closed, because the owner-ordered Task 8 narrowing now makes the test pass. The attempt 1 gaps for live `.bkit/shared/docs/` references and managed-guide section links stay closed.
- Task 2 stays satisfied (already `[x]` in the plan).
- Re-run on 2026-11-09. Lifecycle integration tests (`install`, `upgrade`, `uninstall` `.integration.test.ts`): 155 of 155 pass, including all six Task 1 tests, all four Task 2 tests and the Task 8 test. Group unit and audit tests: 11 files, 961 tests pass (`templates.test.ts`, `template-path-refs.test.ts`, `project-docs.test.ts`, `managed.test.ts`, `shipped-docs-refs.test.ts`, `rules-sync.test.ts`, `dogfood-templates.test.ts`, `instructions.test.ts`, `uninstall.test.ts`, `managed-block.test.ts`, `version-file.test.ts`). The last group gate (remediation attempt 1) failed only on this test.
- Test-first audit (`build-tests-green-1-3.md`): `Enforced: true`, 10 gaps, all `delete-still-referenced` at `Fixable: null`. Decided by `git grep -n 'shared/docs'` over tracked files outside `docs/audits/`, `docs/plans/` and the ledgers. The remaining hits are path fixtures in the gateguard hook tests and `.bkit/core/engine/tools/instructions.test.ts:106`, the legacy-revision note in `.bkit/core/engine/install/project-docs.ts:117` (and `dist/install/project-docs.js:93`) and `project-docs.test.ts:74`, the self-check in `templates.test.ts:306`, and a release entry in `CHANGELOG.md:331`. These are different things or history. The bare topic words (`technology`, `data-schema`, `deployments`, `observability`, `noise`) name topics or the consumer `docs/{topic}.md` paths. The SIGTERM / SIGPIPE "references not checked" entries are covered by the same grep. No gap.
- Unproven: Task 1 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` (red column `vacuous`). The owner answers it at the end of the build.
- Already landed: Task 8 `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `leaves project docs, the index and the version file unchanged when upgrade runs twice`. The tests step's reason: the file ran 68/68 green, the existing upgrade migration already leaves docs, index and version unchanged, and the test itself skips the two excluded files. No red is due, because Task 8 changes only a test.
- No `Updated tests` section. The narrowing of the Task 1 test is the change that `build-decision-1-1.md` (`Decision: Fix now`) ordered through Task 8, not a loosening.

## Identified Gaps Log

None

