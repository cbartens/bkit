Verdict: FAIL
Failures: 3
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
- `build-plan-verify-3-2.md`: FAIL, 1 gap (Task 11 `Fixable: false`); Tasks 10 and 12 judged satisfied.
- `build-decision-1-2.md`: owner chose Fix now for Task 11 through a new Task 13 (list-aware merge, no migration).
- `build-plan-verify-3-3.md`: CONCERNS, 4 gaps (Task 13 not-green, Task 13 Cursor duplicate, Task 13 `docs/testing.md` row, Task 11 closes with Task 13).
- `build-plan-gaps-remediate-3-3-log.md`: Cursor duplicate and `docs/testing.md` row DONE; the planned-test defect at line 2647 BLOCKED (`Fixable: false`, tests step must rewrite it).

## Notes

- **In scope this attempt:** the open Group 3 tasks, Task 11 and Task 13 (brief `build-brief-3-2.md`, no `Deviations` section). Tasks 10 and 12 are already `[x]` in the plan and were not re-judged.
- **Tests (this run, node v24.16.0):** `write.test.ts`, `core.test.ts` and `core.integration.test.ts` give 283 passed, 1 failed. `merges managed lists while keeping consumer-added entries` passes; Task 11's `installs and upgrades shared hook behavior without replacing owned drivers` passes; `upgrades shipped registrations without dropping consumer hook groups or permissions` fails at line 2647 (`expected 2 to be 1`). Its assertions before that line (new matchers, custom Claude / Cursor / Antigravity entries and the own `permissions.allow` entry) pass.
- **Attempt-3 fixes, checked:** `groupCommands` in `.bkit/core/engine/install/write.ts` now reads an entry's top-level `command`, and `dist/install/write.js:152` carries it. A direct merge of the da97be38 registrations gives one gateguard entry per host (Cursor `Write|Delete` only, the old `Write` entry gone). `docs/testing.md:741` now says the shipped-registration upgrade is covered. It does not name the `permissions.allow` entry, which is a minor wording point and not logged.
- **No code gap remains for Task 13.** `deepMergeJson` is unchanged and its unit test still asserts it replaces lists; `.bkit/core/.bkit/install.md:224` states the list rule; no migration and no `docs/migrations.md` change since base `da97be38`. The only blocker is the line-2647 substring count in the planned test. It is `Fixable: false` because the remediate round cannot edit a planned TEST FIRST test and no tests step has run since attempt 3, so another code round cannot close it. The owner's decision should send it to the tests step, as for group 2 Task 7.
- **Test-first audit (`build-tests-green-3-4.md`):** `Enforced: true`, 1 gap (Task 13 `not-green`, engine `Fixable: true`, kept), 0 unproven, no `Updated tests` or `delete-still-referenced` section. Already landed: Task 11 `installs and upgrades shared hook behavior without replacing owned drivers` (the tests step's reason: fresh install and upgrade already keep the managed shell advice, customised driver bytes and the custom Claude group) and Task 12 `keeps rendered classification advice and acknowledgement equivalent` (the tests step's reason: all four shell adapters already agree; OpenCode has no shell hook).
- **Decision records:** `build-decision-1-1.md` covers group 2 Task 7 only. `build-decision-1-2.md` chose Fix now (not Accept) for Task 11, so Task 11 stays open until the Task 13 case is green.
- **Derived Test Matrix:** rows 117 (Task 11), 119 and 120 (Task 13) map to the TEST FIRST cases of their tasks.
- **Plan currency:** `build-plan-current.md` reports 0 affected tasks.
- **Stale mirrors:** installed copies still lag their sources; the orchestrator's end-of-session `bkit upgrade` refreshes them, as recorded in earlier rounds. Not a gap.

## Identified Gaps Log

Gaps: 3 (1 `Fixable: false`, 2 `Fixable: true`).

TASK 13: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — not-green — Fixable: true
TASK 13: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — DONE WHEN not met only through a defect in the planned test, unchanged since attempt 3: line 2647 counts the substring `bkit-gateguard.cjs` in the stringified Claude `PreToolUse`, but the one shipped Claude command (`test -f .claude/hooks/bkit-gateguard.cjs && node .claude/hooks/bkit-gateguard.cjs || true`) names the file twice, so one correct group counts 2. The code meets every DONE WHEN item (reproduced with `mergeManagedJson` from `dist/install/write.js` on the da97be38 registrations plus custom entries: exactly one gateguard entry on Claude, Cursor and Antigravity, new matchers present, custom groups and `permissions.allow` entry kept, second merge stable, `deepContains` ok). The remediate round (`build-plan-gaps-remediate-3-3-log.md`) logged it BLOCKED because no code step may rewrite a planned TEST FIRST test, and no tests step ran since; closing it needs the owner to send the assertion back to the tests step (count entries whose commands name the file, not substrings), as `build-decision-1-1.md` did for group 2 Task 7 — Fixable: false
TASK 11: `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades shared hook behavior without replacing owned drivers` — DONE WHEN item "custom registration groups from the shipped layout" is proven only by the Task 13 case, which `build-decision-1-2.md` made the route (Fix now through Task 13). The named case passes and the behaviour holds, but the case that proves it is not green. Closes when Task 13's integration case passes — Fixable: true
