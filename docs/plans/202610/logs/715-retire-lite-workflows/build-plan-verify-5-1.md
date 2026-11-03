Verdict: FAIL
Failures: 6
Fixable: true
Tasks: 10

<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- **Judged against:** `build-diff-5-1.md` (commit `70aca6be0`), `build-tests-green-5-1.md` (test-first audit: `Enforced: true`, 6 gaps), `build-plan-execute-5-log.md`, `build-plan-current.md` (affects TASK 15 only), `build-decision-1-1.md` (group 3 decisions; covers no group 5 test).
- **Runs (this verifier):** `pnpm vitest run` on `workflows.test.ts`, `telemetry.test.ts`, `stats.test.ts` → 3 files, 431 passed; `node scripts/harvest/bkit-harvest.test.mjs` → `60 passed, 0 failed`; `pnpm typecheck` → exit 0. `pnpm build` not run (mandate); `dist/commands/workflow/workflows.js` and `dist/ledgers/telemetry.js` are committed in `70aca6be0` and mirror the source diff line for line.
- **TASK 10 satisfied:** `CloseInput` gains `ending` / `publish`; `closeEnding` validates `--ending` (`done` / `held`) and `--publish` (`true` / `false`), exit 2 otherwise; `closeWorkflow` writes both onto the `workflow-done` and outcome rows (default `ending: done`, `publish` absent when unset); `StatusEvent` `workflow-done` typed; `OUTCOME_ENDINGS` / `RUN_ENDINGS` / payload types add `held`; `validate` rejects a non-boolean `publish`; outcome message built from `OUTCOME_ENDINGS`; `.bkit/core/.bkit/jsonl.md` and `docs/observability.md` updated. Test 1 asserts exactly one `workflow-done` row with `ending: held`.
- **TASK 10 `refuses an unknown ending` (Already landed, no gap):** red run `build-task-red-5-10-3.md` shows tests 1-2 failing and this one passing before code — the generic flag parser already refused the unknown `--ending` / `--publish` flags with exit 2. The audit names TASK 9 (`0139455`) as the code it stood on; the real reason is the flag parser, not TASK 9. The test still guards the new validation: dropping `closeEnding`'s checks makes `--ending=paused` exit 0.
- **TASK 11 stats `counts a held outcome row in its kind total` (Already landed, no gap):** passed before code by design — the plan states `computeCounts` tallies `ev.kind` only, so `stats.ts` / `analysis.ts` need no change; the test is a regression guard (`build-task-red-5-11-5.md`).
- **TASK 11 code and DONE WHEN substance met:** `endingOf` returns `held` on the last `workflow-done` row's `ending: held`; report `endings` list and legend add `held`; `workflowTelemetry` prints the `ending | held` row; `pnpm test:harvest` (= `node scripts/harvest/bkit-harvest.test.mjs`) and the vitest files pass. Left off `Tasks` only for the 6 test-first audit gaps below.
- **TASK 11 harvest `no-red` x3 (unfixable test-order gaps, `Fixable: false` from the audit; no plan-currency `Broken` row or decision record clears them):** red files `build-task-red-5-11-{1,2,3}.md` hold only vitest's `No test files found` — vitest `include` matches `scripts/harvest/**/*.test.ts`, not `.mjs`. Reproduced here: the committed test file against `HEAD~1` `scripts/harvest/bkit-harvest.mjs` (scratch copy) fails `derives held…` (`'done' !== 'held'`) and `counts held runs…` (no `held` column) and passes `keeps a normal done run as done` — so tests 1-2 are genuine reds, test 3 is a guard with no red possible against old code. This proves the tests fail without the code, not that they were written first; the executor's "saw 2 fail under node" note is unrecorded. Clearing route: the owner's `TEST EXCEPTION` lines on TASK 11 (precedent: TASKS 6 / 7 in the plan) or a decision record `Decision: Accept`.
- **TASK 11 harvest `not-green` x3 (`Fixable: true` from the audit, kept):** the substance is false — all three pass under `node` (`ok` lines 23-25 of the run, 60/60). The green tool runs every TEST FIRST file through `pnpm bkit:test:file` (vitest), which cannot run this `node`-run file. The plan's `TEST FIRST` names a file the red / green tool cannot run, while its `DONE WHEN` names the right runner (`pnpm test:harvest`). Fix is a plan change, not a code change: owner-committed `TEST EXCEPTION` lines naming `pnpm test:harvest` as the proof. A code fix (teach the test tool to run `node` `.test.mjs` files, or port the 60-test custom harness to vitest) is engine / harness work outside #715 — propose separately; a remediation round inside this group cannot honestly clear these.
- **Observability:** new failures surface as `CommandError(EXIT.USAGE, …)` messages and the telemetry `validate` reason (`outcome publish must be a boolean …`), per `docs/observability.md` § `[bkit-telemetry] … not written: <reason>`.
- **Out of scope noted:** `scripts/harvest/bkit-harvest.test.mjs` runs in no gate (`bkit:gate:static-unit` and CI do not call `pnpm test:harvest`); TASK 16's `DONE WHEN` runs it once. Not a group 5 gap.

## Identified Gaps Log

6 gaps, all TASK 11 harvest tests in `scripts/harvest/bkit-harvest.test.mjs`:

- TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `derives held from a workflow-done row ending held` — no-red — Fixable: false
- TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `derives held from a workflow-done row ending held` — not-green — Fixable: true
- TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `counts held runs in the workflow report` — no-red — Fixable: false
- TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `counts held runs in the workflow report` — not-green — Fixable: true
- TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `keeps a normal done run as done` — no-red — Fixable: false
- TASK 11: `scripts/harvest/bkit-harvest.test.mjs` `keeps a normal done run as done` — not-green — Fixable: true
