Verdict: PASS
Failures: 0
Fixable: false
Tasks: 11, 13
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
- `build-decision-1-3.md`: owner chose Fix now; the tests step corrects only the counting assertion (commit a8f1d9c52).
- `build-plan-verify-3-5.md`: FAIL, 1 gap (the unused `count` helper broke `tsc -p tsconfig.test.json`, `Fixable: false`); Task 11 judged satisfied.
- `build-decision-1-4.md`: owner chose Fix now; the tests step deletes only the unused `count` line.

## Notes

- **In scope this attempt:** the open Group 3 tasks, Task 11 and Task 13 (brief `build-brief-3-2.md`, no `Deviations` section). Tasks 10 and 12 are already `[x]` in the plan and were not re-judged.
- **Change since attempt 5:** commit b5d3e8e00 deletes exactly one line from `.bkit/core/engine/install/modules/core.integration.test.ts`, the unused `const count = ...` helper at line 2632. Nothing else in the test changed, which matches the scope of `build-decision-1-4.md`. The `countCommands` no-duplicate assertions, the new-matcher assertions, the custom-entry assertions and the second-install no-op assertion are all still in place (lines 2633-2667).
- **Typecheck (this run, node v24.16.0):** `pnpm exec tsc -p tsconfig.test.json --noEmit` exits 0, and `pnpm exec tsc -p tsconfig.json --noEmit` exits 0. The attempt-5 gap (TS6133 on `count`) is closed.
- **Tests (this run, load average about 20 on 10 CPUs):** `write.test.ts`, `core.test.ts` and `core.integration.test.ts` give 3 files and 284 tests passed, 0 failed, none skipped. That includes `merges managed lists while keeping consumer-added entries` (`write.test.ts:946`), `upgrades shipped registrations without dropping consumer hook groups or permissions` (`core.integration.test.ts:2568`) and Task 11's `installs and upgrades shared hook behavior without replacing owned drivers` (`core.integration.test.ts:2488`). `pnpm bkit:lint:file` on `write.ts`, `write.test.ts` and `core.integration.test.ts` exits 0.
- **Other group-touched tests:** `gateguard-parity.integration.test.ts`, `guardrails-cursor.integration.test.ts` and `templates.test.ts` give 624 passed and 39 failed out of 663. `gateguard-parity.integration.test.ts` passes in full. The 39 failures are all installed-mirror equality cases: 36 in `templates.test.ts` (the 35 `docs/templates/bkit-audit-*.md` dogfood managed blocks and `docs/templates/bkit-plan.md`), and 3 in `guardrails-cursor.integration.test.ts` (`T6 — guardrails.cjs installed mirror is its rendered template`, for cursor, claude and codex). These are stale installed copies that the orchestrator's end-of-session `pnpm tsx .bkit/core/engine/cli.ts upgrade` regenerates, as recorded in every earlier Group 3 round. They belong to the already-ticked Tasks 10 and 12, not to Tasks 11 or 13, so they are not logged here.
- **Task 11, satisfied:** its named case passes, and its last open item (custom registration groups from the shipped layout) closes with the Task 13 case, which now passes and typechecks (`build-decision-1-2.md`, Fix now through Task 13).
- **Task 13, satisfied:** every DONE WHEN item holds in code. The new matchers (Claude `NotebookEdit`, Cursor `Write|Delete`, Antigravity `multi_replace_file_content`) arrive; the custom hook groups and the own `permissions.allow` entry survive; there is one gateguard command per host; a second install writes nothing; `deepMergeJson` still replaces lists (asserted in `write.test.ts`); `.bkit/core/.bkit/install.md:224` states the list rule; `docs/migrations.md` has no change since base `da97be38`; `dist/install/write.js` carries `mergeManagedJson`; Task 11's case passes. The merge adds no error path, so `docs/observability.md` has nothing to apply.
- **Test-first audit (`build-tests-green-3-6.md`):** `Enforced: true`, 0 gaps, 1 unproven, and no `Updated tests` or `delete-still-referenced` section.
  - Unproven: Task 13 `upgrades shipped registrations without dropping consumer hook groups or permissions` (left `vacuous`). The code existed when the owner-approved correction landed (`build-decision-1-3.md`, `build-decision-1-4.md`); the owner answers it at the end of the build, at Step 15.
  - Already landed: Task 11 `installs and upgrades shared hook behavior without replacing owned drivers` (the tests step's reason: fresh install and upgrade already keep the managed shell advice, customised driver bytes and the custom Claude registration group).
  - Already landed: Task 12 `keeps rendered classification advice and acknowledgement equivalent` (the tests step's reason: all four shell adapters already give the same reminder, acknowledgement and unknown-target warning; OpenCode has no shell hook).
- **Decision records:** `build-decision-1-1.md` covers group 2 Task 7 only. `build-decision-1-2.md`, `build-decision-1-3.md` and `build-decision-1-4.md` chose Fix now, not Accept, so none accepts a gap; all three fixes are done.
- **Derived Test Matrix:** rows 117 (Task 11), 119 and 120 (Task 13) map to the TEST FIRST cases of their tasks, and those cases pass.
- **Documentation Updates:** the `docs/testing.md:741` row for `core.integration.test.ts` names the shipped-registration upgrade coverage.
- **Plan currency:** `build-plan-current.md` reports 0 affected tasks.

## Identified Gaps Log

None
