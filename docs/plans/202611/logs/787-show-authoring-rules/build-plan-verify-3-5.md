Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 11
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
- `build-plan-gaps-remediate-3-3-log.md`: Cursor duplicate and `docs/testing.md` row DONE; the line-2647 planned-test defect BLOCKED.
- `build-plan-verify-3-4.md`: FAIL, 3 gaps (Task 13 not-green, the line-2647 substring count `Fixable: false`, Task 11 closes with Task 13).
- `build-decision-1-3.md`: owner chose Fix now; the tests step corrects only the counting assertion.

## Notes

- **In scope this attempt:** the open Group 3 tasks, Task 11 and Task 13 (brief `build-brief-3-2.md`, no `Deviations` section). Tasks 10 and 12 are already `[x]` in the plan and were not re-judged.
- **Change since attempt 4:** commit a8f1d9c52 touches only the three no-duplicate assertions of the Task 13 integration case. They now count `"command":"..."` values that name `bkit-gateguard.cjs`, so the one Claude command that names the file twice counts once, and a duplicate entry on any host still counts 2. No other assertion changed, which matches the scope of `build-decision-1-3.md`. The test is `unproven` in the audit because the code already existed when it was corrected; that is the owner-approved path, answered at Step 15, so it is not a gap.
- **Tests (this run, node v24.16.0, load 13.4 on 10 CPUs):** `write.test.ts`, `core.test.ts` and `core.integration.test.ts` give 284 passed, 0 failed. That includes `merges managed lists while keeping consumer-added entries`, `upgrades shipped registrations without dropping consumer hook groups or permissions` and Task 11's `installs and upgrades shared hook behavior without replacing owned drivers`. `pnpm bkit:lint:file` on the three Task 13 files exits 0. `tsc -p tsconfig.test.json` exits 1 on the unused `count` (logged gap).
- **Task 11, satisfied:** its remaining gap was "custom registration groups from the shipped layout", which closes when the Task 13 case passes (`build-decision-1-2.md`, Fix now through Task 13). That case now passes, and Task 11's own case passes. The typecheck error sits in Task 13's test, not in Task 11's work. Stale installed mirrors are left to the orchestrator's end-of-session `bkit upgrade`, as in every earlier round; `dist/install/write.js` carries `mergeManagedJson`, its top-level `command` read and its call in `writeTier2JsonContained`.
- **Task 13, every DONE WHEN item met in code:** new matchers arrive on Claude, Cursor and Antigravity; the custom hook groups and the own `permissions.allow` entry survive; one gateguard entry per host; a second install writes nothing; `deepMergeJson` still replaces lists (asserted in `write.test.ts`); `.bkit/core/.bkit/install.md:224` states the list rule; no migration and no `docs/migrations.md` change since base `da97be38`; Task 11's case passes. It stays off the `Tasks` line only because its test now breaks `pnpm typecheck`.
- **Test-first audit (`build-tests-green-3-5.md`):** `Enforced: true`, 0 gaps, 1 unproven, no `Updated tests` or `delete-still-referenced` section. Unproven: Task 13 `upgrades shipped registrations without dropping consumer hook groups or permissions` (left `vacuous`; the owner answers it at the end of the build). Already landed: Task 11 `installs and upgrades shared hook behavior without replacing owned drivers` (the tests step's reason: fresh install and upgrade already keep the managed shell advice, customised driver bytes and the custom Claude group) and Task 12 `keeps rendered classification advice and acknowledgement equivalent` (the tests step's reason: all four shell adapters already agree; OpenCode has no shell hook).
- **Decision records:** `build-decision-1-1.md` covers group 2 Task 7 only. `build-decision-1-2.md` and `build-decision-1-3.md` both chose Fix now, not Accept, so neither accepts a gap.
- **Derived Test Matrix:** rows 117 (Task 11), 119 and 120 (Task 13) map to the TEST FIRST cases of their tasks.
- **Documentation Updates:** the `docs/testing.md` row for `core.integration.test.ts` (line 741) names the shipped-registration upgrade coverage.
- **Plan currency:** `build-plan-current.md` reports 0 affected tasks.
- **Why `Fixable: false`:** the fix is one deleted line, but it is inside a planned TEST FIRST case, and only the tests step may edit that. The orchestrator can route it there under the scope `build-decision-1-3.md` already approved.

## Identified Gaps Log

Gaps: 1 (1 `Fixable: false`, 0 `Fixable: true`).

TASK 13: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — the owner-approved counting fix (`build-decision-1-3.md`, commit a8f1d9c52) replaced every use of the local helper `count` (line 2632) with `countCommands`, but left the declaration in place, so `pnpm typecheck` (its `tsc -p tsconfig.test.json` half, part of `bkit:gate:static`) now fails with `core.integration.test.ts(2632,11): error TS6133: 'count' is declared but its value is never read.` It is the only error that `tsc -p tsconfig.test.json` reports; the test itself passes and oxlint passes. The line sits inside the planned TEST FIRST case, which no code step may edit (`.bkit/core/prompts/bkit-build-plan-gaps-remediate.md:95`), and it is not a loosened expectation, so the `Loosened` route does not apply. Closing it needs the tests step to delete that one unused line, within the scope the owner already approved in `build-decision-1-3.md` — Fixable: false
