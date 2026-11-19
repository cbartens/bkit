Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 218f03dc3edb524358df53d1f4b7afdf852929f87a93db36f953b728a8911f2a
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. Group 1's prune in `writeTier2JsonContained` and group 2's advisory, host-module wiring and docs work together end to end (see Notes, dogfood run).

## Previously Attempted

- `build-plan-verify-1-1.md` (Group 1, PASS, tasks 1, 2).
- `build-plan-verify-2-1.md` (Group 2, PASS, tasks 3, 4, 5).

## Notes

- Tasks 1-5 satisfied against the run diff `tmp/bkit-diff-985-install-settings-merge.md`. `RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries` and `pruneRetiredSettingsEntries` are exported from `.bkit/core/engine/install/write.ts`. `writeTier2JsonContained` prunes before `deepContains`, passes the pruned base to `mergeManagedJson`, and pushes `retired-settings-entry` when given `advisories`, or prints `console.warn` for edited entries when not. All five host-module calls pass `advisories`, and `upgrade.ts` passes none.
- Cross-group integration: the `bkit check` path (`runInstall` in dry-run mode, then `reportCheckDrift`) prints the module advisory, because `refreshPreflightAfterWrites` keeps module advisories. `dist/` mirrors the source change in all five engine files.
- Dogfood run of `dist/cli.js` on a fresh scratch consumer (`install --claude`, seeded with the plan's Concrete Example): `bkit check` exit 1 listed `.claude/settings.json` as drift and printed `retired-settings-entry` naming `mcp__claude_ai_Linear__*` and the kept `mcp__claude_ai_Linear__get_issue`. `bkit upgrade --auto-apply` exit 0 removed the retired grant, kept `Bash(my-own-tool:*)` and the edited copy, and warned on the edited copy. A second `bkit check` exit 0 printed `0 write(s) would occur.`
- Tests run with `pnpm bkit:test:file`, all passing: `write.test.ts`, `write.integration.test.ts`, `modules/claude.integration.test.ts`, `modules/claude.test.ts`, `modules/antigravity.test.ts`, `manifest.test.ts`, `commands/install/check.integration.test.ts` (7 files, 239 tests); `commands/install/upgrade.integration.test.ts`, `modules/index.integration.test.ts` (2 files, 314 tests).
- Every `Derived Test Matrix` row has its named test in its task's `DONE WHEN` file, and each test exists in the diff. The upgrade integration tests run the real CLI against a tmp consumer with no mocks.
- Every `Documentation Updates` row is done: `docs/migrations.md` row (tags `v3.0.0`, `v5.4.0`, `v5.5.0`, commit `f57bc5942`), `.bkit/core/.bkit/install.md` and rendered `.bkit/install.md`, `docs/testing.md` rows, and an appended CLOSED `docs/deferrals.jsonl` row for `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256`.
- No forbidden file is in the run diff, and no new file was added (Gate 2 "No bolt-on").
- The plan's naming review and task 4 name `detectRetiredSettingsEntries` in `files.ts`. That function does not exist, because the plan's architecture section moved the report into `writeTier2JsonContained` and left `checks/` unchanged. No task's `DONE WHEN` needs it, so this is no gap.
- Test-first audits (`build-tests-green-1-1.md`, `build-tests-green-2-1.md`) were judged in the group verifies: 0 gaps. One Already landed test: task 3 `dry run over a clean settings file records no drift and no retired-settings-entry advisory` (it guards against a false advisory). No decision records or gap-remediation logs were supplied.
- `docs/observability.md` is present. No new error path; the warning uses the existing `console.warn` channel.

## Identified Gaps Log

None
