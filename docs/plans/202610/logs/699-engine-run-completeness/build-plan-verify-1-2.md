Verdict: FAIL
Failures: 3
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

`build-plan-verify-1-1.md` (FAIL, 4 gaps); `build-plan-gaps-remediate-1-1-log.md` (FAIL, fixed TASK 2 docs + mirrors and a static-unit typecheck error in `run-facts.test.ts`; left both `no-red` gaps and the harvest `not-green` BLOCKED).

## Notes

- Mode `Group`; judged against `build-diff-1-2.md`. No `build-decision-*.md` records exist, so no `Decision: Accept` clears any gap. Test-first audit `build-tests-green-1-2.md`: `Enforced: true`, 4 gaps.
- TASK 1 code: both `MARK_ROWS` copies list `engine-call` and `completeness`; `dist/commands/workflow/run-facts.js` rebuilt. `pnpm test` green (204 files, 8137 passed, 1 skipped); `pnpm test:harvest` green (57/57, `MARK_ROWS is the engine's` ok); step-timing case passes. DONE WHEN met in substance; held off `Tasks` by the audit gaps below.
- TASK 1 `test-changed` (`Fixable: null`) → no gap: the diff swaps `{...} as Row` fixtures for a `journalRow` JSON round-trip helper; `at()` (`run-facts.test.ts:75`) returns an ISO string, so the rows are value-identical, and the `expect(stepsBlock(journaled)).toEqual(stepsBlock(plain))` assertion is unchanged — no assertion weakened, removed or rewritten.
- TASK 1 `no-red` (`Fixable: false`, set by the audit) stands: `bkit tests red` runs vitest, whose `include` omits `scripts/harvest/*.test.mjs`; no red was recorded. Clearing it needs a decision record.
- TASK 1 `not-green` (`Fixable: true`, set by the audit) stands: same runner mismatch; the test passes under `pnpm test:harvest`. The parity-test edit only strips the trailing comma prettier adds and adds two `assert.ok` lines; the `deepEqual` stays.
- TASK 2 DONE WHEN now met: `.bkit/core/.bkit/workflows.md` Row type table lists `engine-call` and `completeness`; `.bkit/core/.bkit/jsonl.md` `run` row `scan` block records the `afterEnd` / `scan.rows` shift; `diff` shows `.bkit/{workflows,jsonl}.md` differ from sources only at line 3 (managed marker); `pnpm bkit check` exits 0; `ignores a row type it does not know` passes and covers `readStatusRows`, `fold` (via `readRuns`) and `runStatusRows`.
- TASK 2 `no-red` (`Fixable: false`, set by the audit) stands: the pinning test cannot go red because the readers already ignore unknown types (the plan's own READ on `fold`). Clearing it needs a decision record.
- No new error paths; `docs/observability.md` logging n/a. No `Documentation Updates` rows judged in Group mode beyond TASK 2's own.
- Verdict `FAIL`: two `Fixable: false` `no-red` gaps, neither clearable without a `Decision: Accept` record.

## Identified Gaps Log

3 gaps.

- TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — no-red — Fixable: false
- TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — not-green — Fixable: true
- TASK 2: `.bkit/core/engine/commands/workflow/status.test.ts` `ignores a row type it does not know` — no-red — Fixable: false
