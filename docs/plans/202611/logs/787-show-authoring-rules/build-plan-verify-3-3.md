Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: none
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: FAIL, 4 gaps (Task 11 `Fixable: false`; Task 12 evidence and two Task 10 doc gaps `Fixable: true`).
- `build-plan-gaps-remediate-3-1-log.md`: 3 DONE, Task 11 BLOCKED for an owner decision.
- `build-plan-verify-3-2.md`: FAIL, 1 gap (Task 11 `Fixable: false`); Tasks 10 and 12 judged satisfied (now `[x]` in the plan).
- `build-decision-1-2.md`: owner chose Fix now for the Task 11 gap through a new Task 13 (list-aware merge, no migration).

## Notes

- **In scope this attempt:** the open tasks of Group 3, Task 11 and Task 13 (brief `build-brief-3-2.md`, no `Deviations` section). Tasks 10 and 12 are already `[x]` in the plan and were not re-judged.
- **Tests (this run, node v24.16.0):** `write.test.ts`, `core.test.ts` and `core.integration.test.ts` give 283 passed, 1 failed. `merges managed lists while keeping consumer-added entries` passes. `installs and upgrades shared hook behavior without replacing owned drivers` (Task 11) still passes. `upgrades shipped registrations without dropping consumer hook groups or permissions` fails at line 2647, as the test-first audit and the execution log's BLOCKED line report.
- **Two causes behind the Task 13 integration failure:**
  - Line 2647 is a test defect. It counts the substring `bkit-gateguard.cjs` in the stringified Claude `PreToolUse`, but the one shipped Claude command (`.bkit/shared/.claude/settings.json:127`) is `test -f .claude/hooks/bkit-gateguard.cjs && node .claude/hooks/bkit-gateguard.cjs || true`, which names the file twice. The merge gives exactly one Claude gateguard group (checked directly). Only the tests step may correct this planned TEST FIRST case: count entries whose commands name the file, not substrings. The orchestrator should route it to the tests step, as for group 2 Task 7.
  - Behind it, the Cursor count (lines 2648-2650) fails on a real defect: the merge keeps the old Cursor `Write` gateguard entry next to the new `Write|Delete` one (gap 2).
- **Task 13 items checked and met:** Claude `NotebookEdit`, Cursor `Write|Delete` and Antigravity `multi_replace_file_content` arrive; the custom Claude, Cursor and Antigravity entries and the own `permissions.allow` entry survive; Claude and Antigravity hold one gateguard entry each; a second merge is stable and `deepContains(template, merged)` holds on all three, so a second install writes nothing; `deepMergeJson` is unchanged (the hunk starts after it, and the unit test asserts it still replaces lists); `.bkit/core/.bkit/install.md` § JSON ownership model states the list rule; `dist/install/write.js` carries `mergeManagedJson` and its call in `writeTier2JsonContained`; no migration or `docs/migrations.md` change since base `da97be38`.
- **Test-first audit (`build-tests-green-3-3.md`):** `Enforced: true`, 1 gap (Task 13 `not-green`, engine `Fixable: true`, kept), 0 unproven, no `Updated tests` or `delete-still-referenced` section. Already landed: Task 11 `installs and upgrades shared hook behavior without replacing owned drivers` (the tests step's reason: fresh install and upgrade already keep the managed shell advice, customised driver bytes and the custom Claude group) and Task 12 `keeps rendered classification advice and acknowledgement equivalent` (the tests step's reason: all four shell adapters already agree; OpenCode has no shell hook).
- **Decision records:** `build-decision-1-1.md` covers group 2 Task 7 only. `build-decision-1-2.md` chose Fix now (not Accept) for Task 11, so the Task 11 gap stays open until Task 13 closes.
- **Derived Test Matrix:** rows 119 and 120 (Task 13) map to the two Task 13 TEST FIRST cases.
- **Plan currency:** `build-plan-current.md` reports 0 affected tasks.
- **Stale mirrors:** installed copies (for example `.bkit/install.md`, `.claude/settings.json`) still lag their sources; the orchestrator's end-of-session `bkit upgrade` refreshes them, as recorded in the earlier rounds. Not a gap.

## Identified Gaps Log

Gaps: 4 (0 `Fixable: false`, 4 `Fixable: true`).

TASK 13: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — not-green — Fixable: true
TASK 13: DONE WHEN not met, "no duplicate bkit group appears" fails on Cursor: `mergeManagedList` (`.bkit/core/engine/install/write.ts`) reads a list entry's commands only from a nested `hooks` array (`groupCommands`), but Cursor `preToolUse` entries are flat `{ command, matcher }` objects. The shipped (da97be38) entry `{"command":"node .cursor/hooks/bkit-gateguard.cjs","matcher":"Write"}` differs from the template's `Write|Delete` entry, so it is kept as a consumer entry and the upgraded `.cursor/hooks.json` registers `bkit-gateguard.cjs` twice (merged list: guardrails, gateguard `Write|Delete`, readguard, gateguard `Write`), so GateGuard runs twice on every Cursor Write. Reproduced with `mergeManagedJson` from `dist/install/write.js` on the shipped file; the second merge is stable, so the duplicate never clears. The test's Cursor count at lines 2648-2650 catches it once the Claude assertion is corrected. Fix: treat an entry's own top-level `command` as one of its commands — Fixable: true
TASK 13: `docs/testing.md` row `.bkit/core/engine/install/modules/core.integration.test.ts` (shell advice) still ends "Upgrade from the shipped registrations is not yet covered." Task 13 adds exactly that coverage, so the row must name the shipped-registration upgrade case (Claude, Cursor, Antigravity, custom groups and `permissions.allow`) and drop the sentence (Documentation Updates row `docs/testing.md`: install evidence) — Fixable: true
TASK 11: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades shared hook behavior without replacing owned drivers` — DONE WHEN not met: "custom registration groups from the shipped layout" survive upgrade only once Task 13 lands. `build-decision-1-2.md` chose Fix now through Task 13 (not Accept), and Task 13 is not satisfied (its integration case fails and Cursor keeps a duplicate bkit entry). The named case itself passes. Closes when Task 13 closes — Fixable: true
