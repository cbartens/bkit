Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Loosened: none
Fingerprint: ada5b203bddd065a87fe2e069a16becee82fa44f66e71e8ae1ce80114f6d5a2a
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups: Group 1 Tasks 1-3, Group 2 Tasks 4, 5, 6, 10, Group 3 Tasks 7-9).

## Integration Gaps

0. Both round-1 gaps are closed; no new cross-group mismatch was found.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (CONCERNS, 2 fixable integration gaps: `minutesPerRound` span in `counters.ts`; stale § Evidence round contract in `.bkit/core/.bkit/workflows.md`), closed by `build-plan-gaps-remediate-holistic-1-log.md` (commit `d5890f7f9`).
- Per-group reports: `build-plan-verify-1-1.md` (PASS), `build-plan-verify-2-1.md` (CONCERNS), `build-plan-verify-2-2.md` (PASS), `build-plan-verify-2-3.md` (PASS), `build-plan-verify-3-1.md` (PASS).

## Notes

- Round-1 gap 1 (`minutesPerRound`) is fixed. `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts:480-483` measures the span from `rounds[0]`, and `dist/commands/workflow/counters.js:336-338` matches. A new test, `measures minutesPerRound over all rounds, not only the compared same-scope ones` (`counters.test.ts:964`), covers it. Reproduced in a scratch folder with `node dist/cli.js counters progress --file=status.jsonl --workflow=debug --check=debug-run-tests --fix=debug-failure-remediate`. Rounds `ci:123` at 00:00 and a local gate at 00:30 printed `minutesPerRound: 30` (round 1 printed 0). Adding a local round at 01:00 also printed `30` (round 1 printed 15). The same run printed `counts: 2 → ?`, `trend: unknown`, `recommend: null` and the different-scopes `trendLine`, which is Manual Verification Step 1's expected output.
- Round-1 gap 2 (stale doc paragraph) is fixed. § Evidence round contract at `.bkit/core/.bkit/workflows.md:1046` now says the failure count is the run's failed job count when `runs locate` read the jobs, else null. The rendered copy `.bkit/workflows.md:1046` has the same text, and `.bkit/version` carries the new hash.
- Regression re-check of Tasks 1-10, by targeted reads:
  - `loopTrend` returns `unknown` on a missing count.
  - The same-scope pair, `codeChanged` between that pair, per-round `scope`, `trendLine` (different scopes win over a missing count) and `recommend: null` on `unknown` are all intact.
  - `failedJobCount` is validated in `status.ts:82-83`, saved by `runs.ts:514` and recorded by `tests.ts:1708,1719`. `dist/` carries the same code.
  - `testRunProblem` accepts `null` or a positive count on a CI row (`status.ts:302`).
  - `steps finish` checks that `--failures` equals the row's count (`steps.ts:1241-1243`).
  - The `compose` unknown-trend reason (`decisions.ts:463-464`) and `Q1` ending with `p.trendLine` (`decisions.ts:512-513`) are intact.
  - `LOOP_TREND_LINE` appears in the narration and all four `Q1` texts in `.bkit/core/workflows/bkit-debug.md:135-143`, in `.claude/commands/bkit-debug.md` and in `.bkit/instructions.md:10304-10308`. No "left no fewer failures" text remains.
  - The Step 12 sentence is at `bkit-build.md:1071`.
  - Commit `f459500f4` changed only the `bkit-debug.none.txt` and `bkit-build.none.txt` snapshots, and only on the Loop Question, narration and Step 12 lines.
  - The integration test (`debug-ci-evidence.integration.test.ts:162-166,391-401`) fails the capstone, uses `failLocal`, and asserts `failures: null`, `counts: "2 → ?"` and `trend: "unknown"`.
- Every planned test named in the runbook and the Derived Test Matrix exists in its target file (32 names checked).
- `pnpm bkit:check:dist` exited 0 and left the tree clean. `node dist/cli.js check` exited 0 and reported no drift (advisories only).
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `pnpm bkit:gate:changed`: `exitCode: 0`, `verdict: PASS`. `bkit:check:dist` rebuilt `dist/` while this gate was running; the gate still passed, and the rebuilt `dist/` is byte-identical to the committed copy.
- Docs: the rows in `docs/testing.md:335,638`, `.bkit/core/.bkit/workflows.md:1033,1044,1046,1771` and `.bkit/core/.bkit/authoring.md:651` are done. `docs/observability.md` is unaffected: the plan adds no new log name, and the refusal reuses the existing `CommandError`.
- Decision record `build-decision-1-1.md` (`Decision: Fix now`) added Task 10; it accepts no gap. The integration test is listed under both Task 6 and Task 10 on purpose.
- No test-first audit report was supplied to this holistic step.
- The diff file `tmp/bkit-diff-912-debug-loop-question.md` is large because the branch carries merged dev commits. Each task was checked with targeted reads instead of a full diff read.
- Out-of-scope observations from round 1 stand and are not gaps:
  - `decisions compose --loop` still gives `first-round` the reason "the last round made progress" (`decisions.ts:466`).
  - The debug narration reads `({LOOP_TREND_LINE})`, not `(failures {LOOP_COUNTS}: {LOOP_TREND_LINE})`. `trendLine` already carries the counts.

## Identified Gaps Log

None.
