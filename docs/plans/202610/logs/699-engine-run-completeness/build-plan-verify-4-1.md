Verdict: FAIL
Failures: 6
Fixable: false
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 4`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Code: `check`, `contractUnits`, `readCompleteness`, `Contract.workflowCalls` / `sourceSha`, `RequiredCall.position` / `branch` in `.bkit/core/engine/checks/status-holes.ts`; `dist/checks/status-holes.js` rebuilt. Every TASK 8 / TASK 9 `DONE WHEN` behaviour is present in code and each planned test exists. `pnpm vitest run .bkit/core/engine/checks/status-holes.test.ts`: 55/55 pass (full suite not run — machine load, orchestrator instruction). Language-server diagnostics clean on both files.
- `journalSuspect` is set only when the caller passes it **and** the run is `preJournal` (`preJournal && options.journalSuspect === true`); within `DONE WHEN`.
- No `build-decision-4-*` record exists; `build-decision-1-1..3` cover groups 1-3 only. Plan-currency `Affected: 0`, so the `no-red` / `Broken` override does not apply.
- Task 8 `test-changed` gaps are NOT all import-only edits:
  - No gap — `names an evidence hole with its missing calls`, `reports a missing required step as a step hole`, `gives each group-loop repeat its own gaps`, `matches workflow-level calls outside any step`: only change is the import list (`contractUnits`, `readCompleteness` added; `import type { StatusRow }` line added); none of them calls the rewritten `replay`, inputs and expected values unchanged.
  - No gap — `reports unexercised calls without marking the run holey`: own diff is a prettier reflow of `deriveContract(...)` plus `'...'` → `"..."` on a string with the same value.
  - Gap — `charges calls below a step's finish line to that step`: own lines are a reflow, but the shared `replay` fixture it runs was rewritten after the red (`contract.steps` + `s.keys.slice(0, 1)` → `contractUnits(...)` + every `u.keys`), changing the rows fed to `check`. Probe (tsx, scratchpad): with the red-time fixture, all five workflows come out HOLEY with evidence holes on their start step (build: 2 on `build-start-workflow`), because the implementation folds rowless sections into the next row-owning unit. Plausibly a fixture correction for that ownership model, but the inputs changed after the red; owner decision.
  - Gap — `reports an untaken route arm as unexercised`: assertion weakened after the red — `expect(taken.unexercised).toEqual([])` → `.not.toContainEqual({ step: unit12.keys[0], call: counters route })`, `step12.keys[0]` → `unit12.keys[0]`, same rewritten `replay`. Probe: with every arm taken, build still reports `{ step: "build-create-pr", call: branches push }` unexercised, so the original assertion fails on today's code. Owner decision.
- Task 9 `test-changed` on `takes the last completeness row and recomputes when rows follow it`: only change is the added `import type { StatusRow }` line (other hunks sit in other tests); inputs and expected values unchanged — no gap.
- Task 9 `no-red` x4: reds refused as passed because TASK 8's `check()` already implemented the behaviour (execute log `BLOCKED — TASK 9 (reds only)`); left `Fixable: false` for the Decision Pause as directed.
- Tasks 8 and 9 both carry `Fixable: false` test-first gaps, so neither is named on `Tasks`.

## Identified Gaps Log

6 gaps:

- TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `charges calls below a step's finish line to that step` — test-changed — Fixable: false
- TASK 8: `.bkit/core/engine/checks/status-holes.test.ts` `reports an untaken route arm as unexercised` — test-changed — Fixable: false
- TASK 9: `.bkit/core/engine/checks/status-holes.test.ts` `gives a pre-journal run a steps-only verdict` — no-red — Fixable: false
- TASK 9: `.bkit/core/engine/checks/status-holes.test.ts` `names a call no contract step owns` — no-red — Fixable: false
- TASK 9: `.bkit/core/engine/checks/status-holes.test.ts` `excludes its own journaled call` — no-red — Fixable: false
- TASK 9: `.bkit/core/engine/checks/status-holes.test.ts` `reports a hole in a long-closed run with no baseline` — no-red — Fixable: false
