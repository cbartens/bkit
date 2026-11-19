Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
Loosened: none
Fingerprint: 86e30d46422281893d73539deb6c570e2d171bc7b1a43b0e04049f3caf4e185b
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

5 of 5 (the plan has 5 groups).

## Integration Gaps

0. Group 1's prune in `writeTier2JsonContained`, group 2's advisory, host-module wiring and docs, group 3's derived-value keep and `permissions.allow`-only limit, group 4's ten Linear connector tool grants and group 5's rewritten tests work together end to end (see Notes, dogfood run).

## Previously Attempted

- `build-plan-verify-holistic-1-1.md` (Holistic attempt 1, PASS, tasks 1-5, before group 3 existed).
- `build-plan-verify-holistic-1-2.md` (Holistic attempt 2, PASS, tasks 1-7, before groups 4 and 5 existed).
- Group verifies: `build-plan-verify-1-1.md`, `-2-1.md`, `-3-2.md` (PASS); `-3-1.md` (CONCERNS, closed by `build-plan-gaps-remediate-3-1-log.md`); `-4-1.md` (CONCERNS, 1 plan-text gap, closed by `build-plan-gaps-remediate-4-1-log.md`); `-5-1.md` (PASS, tasks 9-13).

## Notes

- Tasks 1-13 satisfied against the run diff `tmp/bkit-diff-985-install-settings-merge.md` and the tree at `f718f8c6b` (engine and `dist/` clean against HEAD).
- Task 8: `RETIRED_SETTINGS_ENTRIES` (`.bkit/core/engine/install/write.ts`) holds 11 entries, `mcp__claude_ai_Linear__*` plus the ten `mcp__claude_ai_Linear__<tool>` grants. `findRetiredSettingsEntries` skips listed values when looking for edited copies, so the ten report as `retired`. The plan's Concrete Example (lines 45, 50), the tests and the `docs/migrations.md` row use `mcp__claude_ai_Linear__my_own_tool` as the edited example. `dist/install/write.js` carries all ten tool names and the `!listed.includes(item)` check.
- Cross-group integration: `resolveClaudeDerivedAllows` derives only `mcp__<s>__*` and `mcp__claude_ai_<s>__*`, never a per-tool grant. So the group 3 derived-value keep cannot re-add a group 4 tool grant that the prune removed, and the prune and re-add cannot loop. The `runUpgrade` JSON branch passes no `advisories`, so it warns only for edited copies, the same as before group 4.
- Dogfood (`dist/cli.js`, fresh scratch consumer, `install --claude --tracker=github`, seeded with `mcp__claude_ai_Linear__*`, `Bash(my-own-tool:*)`, `mcp__claude_ai_Linear__my_own_tool`, `mcp__claude_ai_Linear__save_issue`, `mcp__claude_ai_Linear__list_teams`):
  - `bkit check` exited 1 and listed `.claude/settings.json`. The `retired-settings-entry` advisory named the three retired grants as removed and `my_own_tool` as kept.
  - `bkit upgrade --auto-apply` exited 0. It removed the three grants, kept both of the person's entries and warned on the edited copy.
  - A second `bkit check` exited 0 and printed `0 write(s) would occur.`
- Repo checks: `node dist/cli.js check` exited 0 and printed `0 write(s) would occur.`; `pnpm bkit:text:ceiling check` ok (prompts 86494, workflows 58535).
- Tests run with `pnpm bkit:test:file`, all passing:
  - `write.test.ts`, `write.integration.test.ts`, `modules/claude.integration.test.ts`, `modules/claude.test.ts`, `modules/antigravity.test.ts`, `manifest.test.ts`, `commands/install/check.integration.test.ts` (7 files, 243 tests).
  - `commands/install/upgrade.integration.test.ts`, `modules/index.integration.test.ts` (2 files, 314 tests).
  - The latest holistic gate log (`build-holistic-gate-1-2.md`) predates groups 4 and 5, so these runs are the post-group-5 evidence.
- Every `Derived Test Matrix` row (26) has its named test in its task's `DONE WHEN` file, and each named test exists exactly once. The upgrade integration tests spawn the real CLI against a tmp consumer with no mocks.
- Taken over (group 5, judged from `build-tests-green-5-1.md` in `build-plan-verify-5-1.md`): tasks 9-13 rewrote tasks 1-3 tests. Each rewrite only changes the example string `get_issue` to `my_own_tool`, or the list length from 1 to 11 (task 9). No expectation is removed, and each rewrite matches task 8's `DONE WHEN` and its matrix row. Unproven, Changed by a code step, Updated tests: none. No test-first audit report was supplied to this step directly.
- Every `Documentation Updates` row is done:
  - `docs/migrations.md` row with tags `v3.0.0` to `v5.4.0`, `v5.5.0` and `f57bc5942`, plus the ten tool grants from `v0.4.0` / `v2.0.5` to `v2.2.3`.
  - `.bkit/core/.bkit/install.md` and the rendered `.bkit/install.md`.
  - `docs/testing.md` inventory rows. The rows describe `write.test.ts` and `claude.integration.test.ts` by scope, which covers the task 8 tests, though it does not name them.
  - An appended CLOSED `docs/deferrals.jsonl` row for `787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256`.
- No forbidden file is in the run diff, nothing under `.bkit/core/engine/checks/` changed, and no new file was added (Gate 2 "No bolt-on"). `DETAILS.md` and `docs/capabilities.md` changed only in generated graph counts (group 4 commit `fdc7e4001`).
- The naming review and task 4 name `detectRetiredSettingsEntries` in `files.ts`. That function does not exist, because the architecture section moved the report into `writeTier2JsonContained`. No `DONE WHEN` needs it, so it is no gap.
- Decision records:
  - `build-decision-1-1.md` (task 7, `Decision: Fix now`) was assumed by the orchestrator, not the owner's answer. Task 7 carries it out. It closes no gap.
  - `build-decision-1-2.md` (task 8 worked example, `Decision: Accept (assumed)`) is assumed, not the owner's acceptance. Task 8 does not depend on it, because the fix is in the plan (lines 45, 50).
- Four LOW build-challenge findings are OPEN rows in `docs/deferrals.jsonl` (`985-install-settings-merge-challenge-low-...-write-ts-408`, `-513`, `-516`, `-366`). They cover a re-shipped value still reported, the real-run advisory wording, upgrade naming no removed entry, and older-release grants the survey missed. None is a task's `DONE WHEN`, so none is a gap here.
- `docs/observability.md` is present: the only new error is the thrown `[bkit]` error from task 7, and group 4 adds no error path.

## Identified Gaps Log

None
