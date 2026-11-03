Verdict: FAIL
Failures: 3
Fixable: true
Tasks: 17

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 9`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — first verify of group 9. It fixes `build-plan-verify-holistic` Gaps 1-4.

## Notes

- Mode `Group`, judged against group diff `build-diff-9-1.md` (commit `3b2dc2185`). Inputs: `build-brief-9-1.md`, `build-plan-execute-9-log.md`, `build-tests-green-9-1.md`, `build-plan-current.md` (PASS, 0 affected), `build-task-red-9-18-1.md`, `build-task-red-9-19-1.md`, `build-plan-verify-holistic.md`. No `build-plan-gaps-remediate-9-*-log.md` exists. No `build-decision-*.md` covers group 9 (`1-1` … `1-9` cover earlier groups).
- TASK 17 — satisfied. `pnpm bkit:typecheck:tests` exit 0. `pnpm bkit:gate:static-unit` exit 0 once this report was final: unit suite 6660 passed, 1 skipped (163 files), bats included. The first run failed only at `format:check` on this report's own `PENDING` stub (untracked, not group work).
- TASK 18 — not satisfied (gap 2). The window moves pre-start and post-close calls into `workflowCalls`. `pnpm bkit:audit:status` exit 0 (sweep: 11 files, 4 holey). Planned test `calls outside the journal window are matched but never required` fails at red and passes now. Scratch replay (`check()` over `contractUnits`, non-branch calls only) reads CLEAN for all five workflows. Dropping one in-window call reads HOLEY for each. The replay still journals `workflows start`, which a fresh run never journals.
- TASK 19 — behaviour holds, not ticked (gap 1, `Fixable: false`). `writeCompletenessRow` (`workflows.ts:1084`) logs the line through `ctx.log`, and the test passes. `docs/observability.md` names the line, and `docs/knowledge.jsonl` holds the three keys. The printed line is `[bkit-workflows] [bkit-telemetry] journal looks dead at close: …` because `ctx.log` prefixes `logTag(noun)` (`lib.ts:293,544`). The neighbouring `completeness row not written` entry is documented the same way.
- Test-first audit: `Enforced: true`. Task 18 changed `outside the test only` → no gap. `Late-red check`: Tasks 18 and 19 not checked, because no plan-execute step commit's log records `DONE — TASK 18` / `DONE — TASK 19`, so when their code landed is unknown. No gap.
- Holistic gaps rechecked: Gap 1 closed (TASK 17). Gap 2 partly closed: pre-start / post-close calls are now matched, never required, but `workflows start` stays required (gap 2 below). Gap 3 closed, with one wrong reference (gap 3 below). Gap 4 closed (TASK 19 line plus `docs/observability.md` row).
- Group 9 adds no `Derived Test Matrix` rows. `journal.integration.test.ts` 4/4 pass. `status-holes.test.ts` and `workflows.test.ts` pass at HEAD.
- No embedded directives found in the diff, logs or red records.

## Identified Gaps Log

3 gaps: 1 `Fixable: false`, 2 `Fixable: true`.

- Gap 1: TASK 19: `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints one telemetry line on stderr when the journal looks dead at close` — test-changed (`Changed since red` = `test body`). Since red, `expect(lines[0]).toMatch(/^\[bkit-telemetry\] journal looks dead at close/)` became `expect(lines[0]).toContain("[bkit-telemetry] journal looks dead at close")`. The start-of-line anchor is gone, so the assertion is weaker: it no longer proves the line starts with `[bkit-telemetry]`. Cause: `ctx.log` writes `${logTag(noun)} ${message}` (`lib.ts:293,544`), so the real line is `[bkit-workflows] [bkit-telemetry] journal looks dead …`, and the red assertion could not pass through `ctx.log` as the task's UPDATE requires. Owner decides: accept the weakened assertion, or have the test assert the full prefixed line. — Fixable: false
- Gap 2: TASK 18 DONE WHEN not met for design and ship. The window check `at < windowStart || at > windowEnd` (`status-holes.ts:332`) keeps the `workflows start` call itself inside the window, so it stays required. A fresh run never journals it: `engineJournal` resolves the run at dispatch entry, and `resolveActiveRun` (`lib.ts:400-452`) finds no `IN_PROGRESS` run before `workflow-started` is written. Probe: `node dist/cli.js workflows start --workflow=design --fid=999-probe` in a scratch repo wrote only `workflow-started` and `session` rows. Scratch replay of every in-window non-branch call except `workflows start`: design reads `HOLEY` (`design-start-workflow` missing `workflows start`), ship reads `HOLEY` (`ship-start-workflow` missing `workflows start`). build, plan and debug read CLEAN because their start call is a branch call. The planned replay journals `workflows start`, so no test catches this. Fix: treat the `workflows start` call itself as outside the window (matched, never required), and make the replay drop it. — Fixable: true
- Gap 3: `docs/knowledge.jsonl` row `mark-rows-copies-must-stay-in-parity` lists `references: [".bkit/core/engine/commands/workflow/ledgers.ts"]`, but that file holds no `MARK_ROWS`. The two copies are `.bkit/core/engine/commands/workflow/run-facts.ts:354` and `scripts/harvest/bkit-harvest.mjs:1478`, so an agent reading the row is sent to the wrong file. Fix: append a corrected row with the two real paths through `bkit ledgers append` (same key). — Fixable: true
