Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-1-1.md` (FAIL, 4 gaps); `build-plan-gaps-remediate-1-1-log.md` (fixed TASK 2 docs + mirrors and the `run-facts.test.ts` typecheck error); `build-plan-verify-1-2.md` (FAIL, 3 gaps: two `no-red`, one harvest `not-green`); `build-decision-1-1.md` (owner: Accept all).

## Notes

- Mode `Group`; judged against `build-diff-1-3.md`. Since attempt 2 (`414a1b9ff`) only `docs/decisions.jsonl`, the plan (two `TEST EXCEPTION` fields), `build-decision-1-1.md` and `status.jsonl` changed; no code changed.
- Decision records: `build-decision-1-1.md` (`Status: DECIDED`, owner "Accept all", not assumed) Q2 / Q4 accept both `no-red` gaps, now plan `TEST EXCEPTION` fields on TASK 1 and TASK 2 that the audit honours; Q3 accepts the harvest `not-green`, recorded as `docs/decisions.jsonl` row `699-harvest-test-outside-audit-runner` (present, `ACTIVE`).
- Audit `build-tests-green-1-3.md` (`Enforced: true`, 2 gaps):
  - TASK 1 `test-changed` on `run-facts.test.ts` (`Fixable: null`) → no gap. `Changed since red` = `yes`, so the added-lines-only rule does not apply. The diff swaps two `{...} as Row` literals for a `journalRow` JSON round-trip helper (the remediation of the static-unit typecheck error, `build-plan-gaps-remediate-1-1-log.md`). `at()` (`run-facts.test.ts:75`) returns an ISO string and `workflow: "build"` still comes before the fields, so the rows have the same values. The `expect(stepsBlock(journaled)).toEqual(stepsBlock(plain))` assertion is unchanged; no assertion was weakened, removed or rewritten. This matches attempt 2's call.
  - TASK 1 `not-green` on `bkit-harvest.test.mjs` `MARK_ROWS is the engine's` (`Fixable: true`) → no gap; accepted by Q3 and `699-harvest-test-outside-audit-runner`. Rechecked: `pnpm test:harvest` 57 passed, 0 failed, `MARK_ROWS is the engine's` ok.
- TASK 1 DONE WHEN met: both `MARK_ROWS` copies list `engine-call` and `completeness`; `dist/commands/workflow/run-facts.js` rebuilt; the step-timing case passes; harvest green.
- TASK 2 DONE WHEN met: `.bkit/core/.bkit/workflows.md` Row type table lists both rows; `.bkit/core/.bkit/jsonl.md` `run` `scan` block records the `afterEnd` / `scan.rows` shift; `diff` shows `.bkit/{workflows,jsonl}.md` differ from their sources only at line 3 (managed marker); `pnpm bkit check` exits 0; `ignores a row type it does not know` passes and covers `readStatusRows`, `fold` (via `readRuns`) and `runStatusRows`.
- Full suite: `pnpm test` → 204 files, 8137 passed, 1 skipped. An earlier run showed 2 failed files. It overlapped with a targeted vitest run I started at the same time in the same worktree, and nothing changed before the clean rerun, so the 2 failures are not counted as a gap.
- Derived Test Matrix rows for tasks 1 and 2 (`run-facts.test.ts`, `bkit-harvest.test.mjs`, `status.test.ts`) each sit in their task's `DONE WHEN` / `TEST FIRST`. No new error paths, so `docs/observability.md` logging does not apply. Group 1's share of the `.bkit/{workflows,jsonl}.md` `Documentation Updates` rows is done; the Step 4 skip row, friction and authoring parts belong to TASK 3 / TASK 7.
- No accepted gap re-opened.

## Identified Gaps Log

None
