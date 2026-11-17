Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 11
Loosened: none
Fingerprint: b92f3e1a9b2cc0e33a597c0f0a572ce866e6e7aa10f763b66abc417bed48d1d1
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`; the group diff is `build-diff-3-1.md`. No `Deviations` section in `build-brief-3-1.md`, no `build-decision-*.md` records, and `build-plan-current.md` lists no affected tasks.
- Test-first audit `build-tests-green-3-1.md`: `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` entries. All 7 planned tests went red, then green.
- Tests run locally with `BKIT_TEST_SLOTS=2`: `push-gate.test.ts` + `tests.test.ts` 190 passed; `local-gate-audit.test.ts`, `catalogue.test.ts`, `conventions.test.ts` 119 passed (2 skipped); `husky-pre-push.integration.test.ts` 132 passed. `node dist/cli.js check` exit 0 (advisories only). `pnpm bkit:lint:prose` 0 errors.
- TASK 10: `DONE WHEN` items hold (`runWithReceipt` exported, `tests run` records the receipt for the required gate without `--changed-since`, the six named tests pass, existing receipt tests unchanged, `tierTimeouts(true).testTimeout` used, `dist/` refreshed in d80f1130c). The task stays unticked because the extraction changed `runPushGate`'s behaviour on exit 81, which the task's UPDATE field forbids (gap below).
- TASK 11: satisfied. `hasVerifiedIncrement` walks the new sha's ancestors for an all-zero old sha; `minPushUpdates` (`ci.ts:733-753`) already hands new-branch updates to it. The new test and the changed regression test both pass.
- TASK 12: `workflows.md` § Group gate, the Step 10 row, Allowance, ask-points table, loop table and § Local gate scripts, the `templates.md` receipt contract and `docs/deployments.md` are all updated, and the mirrors are regenerated. One sentence in the verify routing table (line 771) still states the reset (gap below). The `prompts.md` rows 206-207, 213 and 337-352 state nothing the Task 3, 7 and 8 edits made untrue.
- Derived Test Matrix rows for Tasks 10 and 11 each map to a `TEST FIRST` test named in the task's `DONE WHEN`. `bkit:check:dist` was not run because it rebuilds `dist/`; the `dist/` diff carries the source changes.

## Identified Gaps Log

2 gaps.

TASK 10: `runWithReceipt` in `.bkit/core/engine/commands/ci/push-gate.ts:77` defaults `waited` to exit 81, so `runPushGate` (which passes no `waited`) now treats any consumer gate exit 81 as a lock wait: it removes the pre-run `.failed` marker and records no failure, where before it left `.failed` for HEAD; the UPDATE field requires `runPushGate` behaviour unchanged. The wait path (`:106-108`) also leaves an earlier receipt for HEAD deleted by the pre-run `fail()`. Fix: `runPushGate` passes a never-wait callback (or the default never waits), and the wait path leaves the receipt and markers as they were, with a `push-gate.test.ts` case for a full gate exiting 81 — Fixable: true
TASK 12: `.bkit/core/.bkit/workflows.md:771` (and its mirror `.bkit/workflows.md`) still says the holistic loop is "counted since the last clean holistic round", which states the reset the DONE WHEN says no doc may state; reword to the run-wide `build.holistic` allowance with no reset after a clean check, then regenerate the mirror — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** runPushGate now treats any gate exit 81 as a lock wait
  **Severity:** MEDIUM · **Class:** behaviour-change · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/push-gate.ts:77` · **Round:** 1
  - **DONE WHEN:** runPushGate records a .failed marker for HEAD when its gate exits 81, as before the extraction; the tests-run wait path leaves an earlier receipt and markers for HEAD as they were; a push-gate.test.ts case covers a full gate exiting 81
  - **TEST FIRST:**
    - .bkit/core/engine/commands/ci/push-gate.test.ts
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Verify routing table still says holistic rounds are counted since the last clean round
  **Severity:** LOW · **Class:** doc-drift · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:771` · **Round:** 1
  - **DONE WHEN:** no sentence in .bkit/core/.bkit/workflows.md or its mirror .bkit/workflows.md says holistic rounds are counted since the last clean holistic round; line 771 names the run-wide build.holistic allowance; bkit check reports no drift
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
