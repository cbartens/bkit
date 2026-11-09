Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 4, 5, 6, 7, 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (Group 1: Tasks 1, 2, 8; Group 2: Tasks 3, 4, 5, 6, 7; Group 3: Task 9).

## Integration Gaps

1 integration gap.

- **Debug-run warnings never reach the summary or the handover (Task 3 producers vs Task 6 summary and the Task 3 handover).** `bkit-debug-abort-handover.md` step 7 copies `## Documentation Warnings` records from the diagnose, remediate and verify logs. None of those prompts has that output section or the `doc-warning-record` field format. The only debug instruction to record a gap is the `Project documents:` note at `.bkit/core/workflows/bkit-debug.md:518`, in the conditional Step 5 reproduce launch only, with no field list. `documentationWarnings` in `.bkit/core/engine/commands/workflow/summary.ts` skips any record without the five fields. So a debug run's documentation gaps are dropped, even though design, plan, build, audit and ship producers carry the format. The summary and handover code is correct; the debug producers do not match its contract.

Checked and consistent across groups:

- The Group 1 resolver `.bkit/core/engine/install/project-docs.ts` is shared by install/upgrade (`syncProjectDocs`) and the Group 2 detector in `checks/after/tools.ts` (`findIndexedEquivalent`, `readProjectIndex`, `legacyStarterTopic`, the Task 1 legacy digests).
- The warning record contract (`topic`, `gap`, `recommendedPath`, `alternativeEvidence`, `action`) matches between `summary.ts` `WARNING_FIELDS`, the `doc-warning-record` clause in `.bkit/instructions.md`, and all eight carrier prompts and audit templates. The design launch context in `bkit-design.md:390` names the same fields.
- `dist/` was last committed with the last engine source change (`215e70962`), and it carries `syncProjectDocs`, `stripManagedWrapper`, `detectProjectDocs` and `jsonObjectChunks`.
- All four host mirrors of `bkit-debug-abort-handover` carry the new section. `docs/templates/` copies differ from `.bkit/core/docs/templates/` only by the rendered marker and this repo's own Project Instructions.

## Previously Attempted

- Holistic: none; this is attempt 1.
- Group 1: `build-plan-verify-1-1.md` (CONCERNS, 3) and `build-plan-verify-1-2.md` (CONCERNS, 1), then `build-decision-1-1.md` (Fix now, added Task 8), then `build-plan-verify-1-3.md`, `-1-4.md` and `-1-5.md` (PASS, Tasks 1, 2, 8). Remediation logs `build-plan-gaps-remediate-1-1-log.md` to `-1-4-log.md`.
- Group 2: `build-plan-verify-2-1.md` (CONCERNS, 4) and `build-plan-verify-2-2.md` (CONCERNS, 1: the Task 5 ESM spy), then `build-decision-1-4.md` (Fix now, added Task 9). Remediation logs `build-plan-gaps-remediate-2-1-log.md` and `-2-2-log.md`.
- Group 3: `build-plan-verify-3-1.md` (PASS, Task 9).

## Notes

- Mode `Holistic`, all 3 groups, judged on the current tree at `4a2205870`. `tmp/bkit-diff-864-move-project-docs.md` has partial diff coverage (20 largest files of 426), so I read the changed files directly where the diff was partial.
- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit`: the first run exited 81 because another repo's run held the machine-wide tests lock. The rerun exited 0 (`verdict: PASS`). Vitest unit: 231 files, 9296 passed, 2 skipped. Vitest integration: 229 files, 9265 passed, 2 skipped. node:test 12/12, bats 32/32, oxlint, prettier and typecheck all clean. The run included `install`, `upgrade`, `uninstall` and `workflows` `.integration.test.ts`, `checks/after/tools.test.ts`, `summary.test.ts` and `shipped-docs-refs.test.ts`. Log: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/holistic-tests-changed-2.log`.
- All 20 planned `TEST FIRST` test names exist exactly once in their named files, and they passed in the run above.
- Task 1 is satisfied: ten marker-free starters in `.bkit/templates/docs/`, `.bkit/shared/docs/` is gone, `project-docs.ts` holds the catalog, digests (`LEGACY_STARTER_SOURCE_REVISION = "45f4254bd"`), wrapper migration and row insertion, install and upgrade call `syncProjectDocs` (which logs its own report, dry run included), and `docs/migrations.md:41` has the row.
- Task 5 is satisfied on the current tree. It was unticked only because of the ESM spy test, which Task 9 repaired in place under `build-decision-1-4.md` (`Decision: Fix now`, the owner's own choice). All four of its planned tests pass.
- Tasks 2, 4, 6 and 7 stay satisfied. Task 7's scratch-matrix logs (`fresh-*.log`, `legacy-*.log`) are in the scratchpad folder named above, and `dist/` has not changed since that run. Tasks 8 and 9 are satisfied (`stableSnapshot()` leaves out only `CHANGES_EVERY_RUN`; `tools.test.ts` uses the hoisted `fsReads` pass-through `vi.mock("node:fs")` and has no `spyOn`).
- Task 3 is left off the `Tasks` line. Its UPDATE for `bkit-debug.md` ("capture warnings on no-plan and handover paths") is not met end to end, which is the one integration gap. It is logged once, as `INTEGRATION`, not again as a task gap.
- No test-first audit report was supplied for this holistic round. Per the caller, the tests of Tasks 1, 8 and 9 are accepted or landed-before-red cases that the owner answers at Step 15. Task 1 `upgrade.integration.test.ts` `migrates legacy ownership without changing project text or core ownership` is unproven (red column `vacuous`). Task 8 `leaves project docs, the index and the version file unchanged when upgrade runs twice` and Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace` landed already green. None is counted as a gap.
- Decision records: `build-decision-1-1.md` (Fix now, added Task 8) and `build-decision-1-4.md` (Fix now, added Task 9) are the owner's choices. `build-decision-1-2.md` and `-1-3.md` hold no questions. None accepts the integration gap.
- Mandatory checks: every Derived Test Matrix row has its test in its task's `DONE WHEN`. Every `Documentation Updates` row has a matching change (`README.md`, `DETAILS.md`, `docs/architecture.md`, `docs/observability.md`, `docs/testing.md`, the core `.bkit/*.md` guides, `.bkit/core/.agents/docs.md`, `docs/migrations.md`). Migration and index problems are printed through `logReport` in `project-docs.ts` and raised as `project-docs-*` advisories, per `docs/observability.md` § Advisory Checklist Output. The full changed suite passes.
- Out-of-scope observation, not a gap: the plan's Concrete Example step 4 says plan reviewers' reports keep the same security gap. `bkit-plan-review-1.md` and `-2.md` have no `Documentation Warnings` output, so in the plan phase only the generate, update and convert outputs feed the summary. The runbook assigns no reviewer-prompt change, and the merge-by-topic-and-gap logic is proven by `summary.test.ts` and `workflows.integration.test.ts`.
- Out-of-scope observation carried from `build-plan-verify-3-1.md`: `docs/testing.md:560` prefers the real filesystem over a mocked `fs`, and its exception list does not yet name the pass-through `node:fs` mock in `checks/after/tools.test.ts`.

## Identified Gaps Log

1 gap.

INTEGRATION: Task 3 debug path vs Task 6 summary and Task 3 handover — debug-run documentation warnings never reach the run summary or the handover. `.bkit/core/prompts/bkit-debug-abort-handover.md` step 7 copies `## Documentation Warnings` records "from the diagnose, remediate and verify logs", but `bkit-debug-failure-diagnose.md` and `bkit-debug-failure-remediate.md` have no `Documentation Warnings` output section and do not carry the `doc-warning-record` clause (`.bkit/instructions.md` lists only plan-generate, plan-convert, plan-update, audit-generate, ship-update-docs, utility-update-documentation and the two audit templates as carriers). The only debug instruction to record a gap is the `Project documents:` note in `.bkit/core/workflows/bkit-debug.md:518`, which sits in the Step 5 `@bkit-debug-failure-reproduce` launch only (a conditional step, and a log the handover does not read) and gives no record fields, so `documentationWarnings` in `.bkit/core/engine/commands/workflow/summary.ts` would skip its records. Fix: give the debug diagnose, remediate and reproduce subagents the record format (the `doc-warning-record` clause or launch-context wording with the five fields) and a `Documentation Warnings` output section, and make the handover's source list match the logs that carry them — Fixable: true
