Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 17, 19

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 9`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-9-1.md` (FAIL, 3 gaps). Gap 2 (TASK 18 `workflows start` required) and Gap 3 (`MARK_ROWS` knowledge reference) fixed by `build-plan-gaps-remediate-9-1-log.md` in `9bc27d7ea`. Gap 1 (TASK 19 test-changed) accepted by the owner in `build-decision-1-10.md` Q2; the plan's TASK 19 now carries a TEST EXCEPTION.

## Notes

- Mode `Group`, judged against `build-diff-9-2.md` (from `f9898949a`) at HEAD `6f4b2857a`. Inputs: `build-brief-9-1.md`, `build-plan-execute-9-log.md`, `build-tests-green-9-2.md`, `build-plan-current.md` (PASS, 0 affected), `build-plan-verify-9-1.md`, `build-plan-gaps-remediate-9-1-log.md`, `build-decision-1-9.md` (group 8, not group 9), `build-decision-1-10.md`, `build-task-red-9-18-1.md`, `build-task-red-9-18-2.md`, `build-task-red-9-19-1.md`.
- TASK 17 — satisfied (already `[x]`). `pnpm bkit:typecheck:tests` exit 0. `pnpm bkit:gate:static-unit` exit 0 at HEAD with this report final: unit suite 6661 passed, 1 skipped (163 files), bats 34/34. The first run failed only at `format:check` on this report's own stub.
- TASK 18 — DONE WHEN met; left off `Tasks` for gap 1 only. `deriveContract` (`status-holes.ts:311-364`) moves every `workflows start` call, and every call above the first start or below the last `workflows close`, into `workflowCalls`. Scratch probe against `dist/checks/status-holes.js`, journaling only in-window non-branch calls: design, plan, build, debug and ship each read `CLEAN` (0 evidence, 0 step, 0 unexpected), and no contract lists `workflows start` as required. Dropping each in-window call in turn reads `HOLEY`, except calls with a second copy in the same run that still matches on noun + verb (R2) — e.g. build `status route` x8, ship `steps finish` x11. `pnpm bkit:audit:status` exit 0 (sweep: 11 files, 4 holey). Planned test and `never requires the workflows start call, which a fresh run cannot journal` both red in `build-task-red-9-18-2.md` and pass at HEAD.
- TASK 18 also rewrote the non-planned test `derives a required call from each {BKIT} literal of every live step section`: its count now adds `workflowCalls` and compares with every literal in the file, not only step-section literals. That is the task fixing a test its behaviour change broke. Not an audit gap.
- TASK 19 — satisfied. `writeCompletenessRow` (`workflows.ts:1084-1088`) logs one line through `ctx.log` when `journalSuspect` is set; the test passes. TEST EXCEPTION honoured by the audit, per `build-decision-1-10.md` Q2 (the owner's own decision, not assumed). `docs/observability.md:63` names the line. `docs/knowledge.jsonl` holds the three keys; the latest `mark-rows-copies-must-stay-in-parity` row (`updates: 2`) points at `run-facts.ts:354` and `bkit-harvest.mjs:1478`, and both lines hold `MARK_ROWS`.
- Test-first audit: `Enforced: true`. Task 19 `test-changed` cleared by its TEST EXCEPTION. `Late-red check`: Tasks 18 and 19 not checked, because no plan-execute step commit's log records `DONE — TASK 18` / `DONE — TASK 19`, so when their code landed is unknown. No gap.
- Targeted run: `status-holes.test.ts`, `workflows.test.ts`, `journal.integration.test.ts`, `lib.test.ts` — 268 passed.
- Group 9 adds no `Derived Test Matrix` rows and no `Documentation Updates` rows beyond the TASK 19 doc edits checked above.
- No embedded directives found in the diff, logs or red records.

## Identified Gaps Log

1 gap: 1 `Fixable: false`.

- Gap 1: TASK 18: `.bkit/core/engine/checks/status-holes.test.ts` `calls outside the journal window are matched but never required` — test-changed (`Changed since red` = `test body`). Since its red (`build-task-red-9-18-1.md`, 2026-10-29T07:10:48Z) the remediation deleted one input row, `callRow("build", "workflows", "start"),`, from the test's `inWindow` journal; every `expect` line is byte-identical. No assertion is weakened: the test now also proves the run reads CLEAN with no `workflows start` row journaled, which is stricter. The edited body has its own red in `build-task-red-9-18-2.md` (fails with `build-b` missing `workflows start`) and passes at HEAD. The same remediation added a `workflows start` filter to the shared `replay` helper, which this test does not call. No decision record accepts it (`build-decision-1-10.md` covers TASK 19 only). Owner decides: accept the edited input as a TEST EXCEPTION, or stop. — Fixable: false
