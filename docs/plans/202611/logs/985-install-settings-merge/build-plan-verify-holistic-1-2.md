Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 6692a57915050e65577908adb636e3133d7a44159b17942cce2dbe87f6547d87
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0. Group 1's prune in `writeTier2JsonContained`, group 2's advisory, host-module wiring and docs, and group 3's derived-value keep and `permissions.allow`-only limit work together end to end (see Notes, dogfood runs).

## Previously Attempted

- `build-plan-verify-holistic-1-1.md` (Holistic attempt 1, PASS, tasks 1-5, before group 3 existed).
- `build-plan-verify-1-1.md` (Group 1, PASS, tasks 1, 2), `build-plan-verify-2-1.md` (Group 2, PASS, tasks 3, 4, 5).
- `build-plan-verify-3-1.md` (Group 3, CONCERNS, 2 docs-drift gaps), closed by `build-plan-gaps-remediate-3-1-log.md`; `build-plan-verify-3-2.md` (Group 3, PASS, tasks 6, 7).

## Notes

- Tasks 1-7 satisfied against the run diff `tmp/bkit-diff-985-install-settings-merge.md` and the tree at `5eb7708a1`. `RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries` and `pruneRetiredSettingsEntries` are exported from `.bkit/core/engine/install/write.ts`; `writeTier2JsonContained` prunes before `deepContains`, passes the pruned base to `mergeManagedJson`, pushes `retired-settings-entry` when given `advisories` and warns with `console.warn` when not. All five host-module calls pass `advisories`; `runClaudeModule` and the `runUpgrade` JSON branch both pass `resolveClaudeDerivedAllows(cwd)` as `derivedKeep` (task 6). `assertRetirableEntry` throws a `[bkit]` error naming the value and path for any entry off `permissions.allow`, in both prune and find (task 7).
- Cross-group integration: the task 6 keep is applied to the live list before both prune and find, so a derived value is neither pruned nor reported, and `enrichClaudeSettingsAllows` (install `claude.ts`, upgrade `upgrade.ts:1018`) adds nothing back that the prune took. `dist/` carries every source change (`assertRetirableEntry`, `derivedKeep`, `liveList` in `dist/install/write.js`; the `resolveClaudeDerivedAllows` calls in `dist/install/modules/claude.js` and `dist/commands/install/upgrade.js`).
- Dogfood 1 (`dist/cli.js`, fresh scratch consumer, `install --claude`, seeded with the plan's Concrete Example): `bkit check` exit 1 listed `.claude/settings.json` and printed `retired-settings-entry` naming `mcp__claude_ai_Linear__*` and the kept `mcp__claude_ai_Linear__get_issue`; `bkit upgrade --auto-apply` exit 0 removed the retired grant, kept `Bash(my-own-tool:*)` and the edited copy, and warned on the edited copy; a second `bkit check` exit 0 printed `0 write(s) would occur.`
- Dogfood 2 (task 6 upgrade path, which has no test of its own): fresh consumer with `Linear` in the `mcp-servers` block; `install` then `upgrade --auto-apply` kept `mcp__claude_ai_Linear__*`, printed no retired advisory, and `bkit check` exit 0 printed `0 write(s) would occur.`
- Repo checks: `node dist/cli.js check` exit 0 with `0 write(s) would occur.`; `pnpm bkit:text:ceiling check` ok (prompts 86494, workflows 58535).
- Tests run with `pnpm bkit:test:file`, all passing: `write.test.ts`, `write.integration.test.ts`, `modules/claude.integration.test.ts`, `modules/claude.test.ts`, `modules/antigravity.test.ts`, `manifest.test.ts`, `commands/install/check.integration.test.ts` (7 files, 241 tests); `commands/install/upgrade.integration.test.ts`, `modules/index.integration.test.ts` (2 files, 314 tests).
- Every `Derived Test Matrix` row (19) has its named test in its task's `DONE WHEN` file, and each test exists in the diff. The upgrade integration tests spawn the real CLI against a tmp consumer with no mocks.
- Every `Documentation Updates` row is done: `docs/migrations.md` row (tags `v3.0.0`, `v5.4.0`, `v5.5.0`, commit `f57bc5942`, the derived-value keep and the `permissions.allow`-only limit), `.bkit/core/.bkit/install.md` and the identical rendered `.bkit/install.md`, `docs/testing.md` rows naming the group 3 tests, and an appended CLOSED `docs/deferrals.jsonl` row for `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256`.
- No forbidden file is in the run diff, and no new file was added (Gate 2 "No bolt-on"). The plan's naming review and task 4 name `detectRetiredSettingsEntries` in `files.ts`, which does not exist because the architecture section moved the report into `writeTier2JsonContained`; no `DONE WHEN` needs it, so this is no gap.
- Decision record `build-decision-1-1.md` (Q1, task 7): `Decision: Fix now`, assumed by the orchestrator, not the owner's answer. Task 7 carries it out; whether a release may take back a deny or ask rule stays open for #1006. It is not an accept, so it closes no gap.
- Three LOW build-challenge findings are OPEN rows in `docs/deferrals.jsonl` (`985-install-settings-merge-challenge-low-...-write-ts-408`, `-513`, `-516`): a value the template ships again is still reported as retired (no current template ships it), the real-run advisory still says "Run bkit upgrade to remove", and `bkit upgrade` prints no line naming the removed entry. None is a task's `DONE WHEN`, so none is a gap here.
- No test-first audit report was supplied to this step; the group verifies judged `build-tests-green-1-1.md`, `-2-1.md`, `-3-1.md` and `-3-2.md` at 0 gaps (one Already landed test in task 3, accepted as a false-advisory guard).
- `docs/observability.md` is present: the new error carries the `[bkit]` prefix and is thrown, not swallowed; the warning and advisory use the existing channels.

## Identified Gaps Log

None
