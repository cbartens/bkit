Verdict: FAIL
Failures: 4
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

None

## Notes

- Mode `Group`; judged against `build-diff-1-1.md` (group diff). No decision records (`build-decision-*.md`), no prior verify or gaps-remediate logs. Plan currency `PASS`, `Affected: 0`.
- TASK 1 code: both `MARK_ROWS` copies (`.bkit/core/engine/commands/workflow/run-facts.ts`, `scripts/harvest/bkit-harvest.mjs`) list `engine-call` and `completeness`; `dist/commands/workflow/run-facts.js` rebuilt. `pnpm test` green (204 files, 8137 passed, 1 skipped); `pnpm test:harvest` green (57/57, `MARK_ROWS is the engine's` ok); step-timing case passes. DONE WHEN is met in substance, but the test-first audit leaves two gaps, so TASK 1 stays off `Tasks`.
- TASK 1 `no-red` (`Fixable: false`, set by the audit, not `null`, so it stands): `bkit tests red` runs vitest, whose `include` does not cover `scripts/harvest/*.test.mjs`; the harvest test runs only under `node` (`pnpm test:harvest`), so no red was ever recorded. The execute log's "confirmed failing via pnpm test:harvest" claim carries no recorded evidence. A `Decision: Accept` record is the route to clear it.
- TASK 1 `not-green` (`Fixable: true`): the same runner mismatch; the test does pass under `pnpm test:harvest`. The parity-test edit (`JSON.parse(list.replace(/,\s*\]$/, "]"))` plus two `assert.ok` lines) only normalises the trailing comma prettier adds to the multi-line set; the `deepEqual` stays, not weakened.
- TASK 2 `no-red` (`Fixable: false`, set by the audit): the planned test can never go red because `fold` / `readStatusRows` / `runStatusRows` already ignore unknown row types — the plan's own READ line on `fold` says so. The TEST FIRST is a pinning test; clearing the gap needs a decision record accepting it.
- TASK 2 docs unstarted: execute log `BLOCKED`; `grep -l engine-call` finds no hit in `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`, `.bkit/core/.bkit/jsonl.md` or `.bkit/jsonl.md`; the existing `afterEnd` mention at `.bkit/core/.bkit/jsonl.md:112` predates this change and does not record the shift.
- No new error paths in this group; `docs/observability.md` logging n/a. No `Documentation Updates` rows judged (Group mode; TASK 2 owns this group's doc rows).
- Verdict `FAIL`: two `Fixable: false` gaps (both `no-red`).

## Identified Gaps Log

4 gaps.

- TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — no-red — Fixable: false
- TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — not-green — Fixable: true
- TASK 2: `.bkit/core/engine/commands/workflow/status.test.ts` `ignores a row type it does not know` — no-red — Fixable: false
- TASK 2: DONE WHEN unmet — `.bkit/core/.bkit/workflows.md` § `status.jsonl` Row type table lacks `engine-call` / `completeness`; `.bkit/core/.bkit/jsonl.md` `run` row `scan` block does not record the accepted `afterEnd` / `scan.rows` shift; `.bkit/{workflows,jsonl}.md` mirrors not regenerated; `pnpm bkit check` not run (execute log: BLOCKED, docs/install steps not started) — Fixable: true
