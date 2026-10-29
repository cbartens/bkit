Verdict: PASS
Failures: 0
Fixable: false
Tasks: 8, 9

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 4`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-4-1.md` — FAIL, 6 `Fixable: false` test-first gaps (TASK 8 `test-changed` x2, TASK 9 `no-red` x4); all six settled by owner decision `build-decision-1-4.md` (`Decision: Accept`, owner, not assumed), now written as `TEST EXCEPTION` fields on TASK 8 and TASK 9 in `docs/plans/202610/699-engine-run-completeness-plan.md`.

## Notes

- Code unchanged since attempt 1: `build-diff-4-2.md` is byte-identical to `build-diff-4-1.md` (`cmp`). Deliverables: `RequiredCall.position` / `branch`, `Contract.workflowCalls` / `sourceSha`, `contractUnits`, `check`, `readCompleteness` in `.bkit/core/engine/checks/status-holes.ts`; `dist/checks/status-holes.js` rebuilt in the same diff.
- `pnpm vitest run .bkit/core/engine/checks/status-holes.test.ts`: 55/55 pass. All 12 planned TASK 8 / TASK 9 tests exist under the planned names. Full suite not run (machine load, orchestrator instruction).
- TASK 8 `DONE WHEN`: evidence hole names the missing call; step hole on a closed run, conditional absence exempt; `unexercised` never flips `holey`; `unexpected` names out-of-contract calls and steps; five-workflow markdown-order replay is `CLEAN` with no `unexpected` — each pinned by a passing test.
- TASK 9 `DONE WHEN`: `preJournal` steps-only verdict; `journalSuspect` only when the caller passes it (and only on a pre-journal run); post-terminator and between-outside-rows calls in `unattributable`; `completeness` self-excluded from expectations and `unexpected`; last `completeness` row wins, recomputed when a `step-done` / `engine-call` row follows; no age filter — each pinned by a passing test.
- Test-first report (`build-tests-green-4-2.md`): `Test exceptions` section honours both TASK 8 and all four TASK 9 exceptions. The six remaining `test-changed` (`Fixable: null`) lines judged no gap, matching attempt 1:
  - `names an evidence hole with its missing calls`, `reports a missing required step as a step hole`, `gives each group-loop repeat its own gaps`, `matches workflow-level calls outside any step` (`code it runs`): change is the import list (`contractUnits`, `readCompleteness`, `import type { StatusRow }`); none calls the rewritten `replay`; inputs, mocks and expected values unchanged.
  - `reports unexercised calls without marking the run holey` (`test body`): prettier reflow of `deriveContract(...)` plus `'...'` → `"..."` on a same-valued string; formatting only.
  - `takes the last completeness row and recomputes when rows follow it` (`code it runs`): diff since its red is the added `import type { StatusRow }` line plus reflows inside other tests; its own inputs and expected values unchanged.
- Derived Test Matrix rows for tasks 8 (7 rows) and 9 (5 rows) each map to a passing planned test in that task's `TEST FIRST` / `DONE WHEN`.
- Plan-currency `Affected: 0`. Observability: `check` / `readCompleteness` are pure, never throw, perform no I/O; no logging duty in this group.

## Identified Gaps Log

None
