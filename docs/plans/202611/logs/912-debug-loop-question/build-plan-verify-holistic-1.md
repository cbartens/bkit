Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups: Group 1 Tasks 1-3, Group 2 Tasks 4, 5, 6, 10, Group 3 Tasks 7-9).

## Integration Gaps

2.

1. `minutesPerRound` regressed by the same-scope pair (Group 1 Task 2 → Group 3 Task 7). `loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts:480-483` takes the span from `first` (now the earliest round sharing the last round's `scope`) but divides by `rounds.length - 1` (all rounds). On `origin/dev` `first` was `rounds[0]`. When scopes differ the figure is wrong: a scratch `node dist/cli.js counters progress` on `ci:123` at 00:00 and a local gate at 00:30 printed `minutesPerRound: 0`; adding a local round at 01:00 printed `15`. Both should be 30. `decisions compose --loop` prints it as `Minutes per round:` (`.bkit/core/engine/commands/workflow/decisions.ts:504`) at every build pause. The plan says `minutesPerRound` stays over all rounds (Architecture & Component Changes § Engine — loop trend). No test covers mixed-scope `minutesPerRound`.
2. Stale CI evidence round contract (Group 2 Tasks 4-6 → Group 3 Task 9). `.bkit/core/.bkit/workflows.md:1046` (§ Evidence round contract, rendered to `.bkit/workflows.md`) still says the CI row has "null gate, exit code and failure count". Line 1044 (§ Selected CI loop, updated by Task 9) and the code (`tests.ts:1708`, `selection.failedJobCount ?? null`) now give it the failed job count when known.

## Previously Attempted

None (first holistic attempt). Per-group reports: `build-plan-verify-1-1.md` (PASS), `build-plan-verify-2-1.md` (CONCERNS, Task 6 integration test), `build-plan-verify-2-2.md` (PASS), `build-plan-verify-2-3.md` (PASS), `build-plan-verify-3-1.md` (PASS).

## Notes

- Judged with partial diff coverage: `tmp/bkit-diff-912-debug-loop-question.md` covers 20 of 527 files (the branch carries dev merges). Each task was checked with targeted reads of its named symbols and files instead.
- Tasks 1-10: every `DONE WHEN` is met in the code. `loopTrend` returns `unknown` on a missing count; `loopProgress` compares the earliest same-scope round with the last, judges `codeChanged` between that pair, reports `scope` per round, writes `trendLine` (different scopes win over a missing count) and sets `recommend: null` on `unknown`. `CiSelection.failedJobCount` is validated as a positive safe integer outside `ciSelectionIdentity`; `locateCi` saves `Math.max(1, mapped.length)` only when a job failed, with `bkit-tests-check` filtered out on both the jobs API and `--evidence-file` paths; `tests run` writes `selection.failedJobCount ?? null`; `testRunProblem` accepts `null` or a positive count on a CI row; `steps finish` requires `--failures` to equal the row's count, or be absent when it is `null`. `decisions compose --loop` ends `Q1` with `p.trendLine`, gives `unknown` the used-up-limit reason and keeps `Try again`; the local `trendLine` map is gone. `bkit-debug.md` holds `LOOP_TREND_LINE` in the narration and all four `Q1` texts; no "left no fewer failures" remains outside the negative assertion in `workflow-shape.test.ts:2040`. `bkit-build.md:1071` names `closing`, `unknown`. `dist/` carries the same code (`dist/commands/workflow/runs.js:351`, `tests.js:1295`, `dist/ledgers/status.js:59`).
- Every planned test named in the runbook and the Derived Test Matrix exists in its target file (27 names checked).
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `pnpm bkit:gate:changed`: exit 0, `verdict: PASS`; vitest 234 files / 9597 passed, 2 skipped, and 232 files / 9566 passed, 2 skipped.
- Cross-group contracts: Group 2's counted CI round reaches Group 1's same-scope trend through `step-done.failures` / `scope` (the Task 10 integration test replays it through `dist/cli.js`); Group 3's `compose` and `bkit-debug.md` read `trend` / `trendLine` exactly as Group 1 emits them. The two gaps above are the only mismatches found.
- Decision record `build-decision-1-1.md` (`Decision: Fix now`) added Task 10; it accepts no gap. The integration test is listed under Task 6 and Task 10 on purpose.
- No test-first audit report was supplied to this holistic step; the per-group audits (`build-tests-green-*`) were already decided in the group reports.
- `docs/observability.md`: the plan adds no new log name or error path; the `steps finish` refusal reuses the existing `CI evidence does not match the active selection` `CommandError`.
- Documentation Updates rows: `docs/testing.md` (`:638`, `:335`), `.bkit/core/.bkit/workflows.md` (`:1029-1034`, `:1044`, `:1771`, Step 12 row), `.bkit/core/.bkit/authoring.md:651` and the two snapshots are done; `.bkit/workflows.md` differs from its source only in the managed marker line. Integration Gap 2 is one paragraph in the same doc that the row did not name.
- Out-of-scope observations, not gaps (no `DONE WHEN` or Architecture line asks for them):
  - `decisions compose --loop` still gives `first-round` the reason "the last round made progress" (`decisions.ts:466`). The Reuse Inventory row mentions `first-round`, but Task 7 and the Architecture section name only `unknown`.
  - The debug no-ask narration reads `taken without asking ({LOOP_TREND_LINE})`, not the plan's `(failures {LOOP_COUNTS}: {LOOP_TREND_LINE})`; `trendLine` already carries the counts, and the Group 3 verify accepted it.

## Identified Gaps Log

2 gaps.

- INTEGRATION: Group 1 Task 2 (`loopProgress` in `.bkit/core/engine/commands/workflow/counters.ts:480-483`) now computes `minutesPerRound` from the same-scope `first` round but still divides by `rounds.length - 1`, so the "Minutes per round" line that Group 3 Task 7's `decisions compose --loop` pause prints (`decisions.ts:504`) is wrong whenever scopes differ: a scratch `node dist/cli.js counters progress` on rounds `ci:123` (00:00) and a local gate (00:30) printed `minutesPerRound: 0`, and with a third local round at 01:00 printed `15` (both should be 30). The plan says `minutesPerRound` stays over all rounds (Architecture § Engine — loop trend); `origin/dev` used `rounds[0]` — Fixable: true
- INTEGRATION: Group 2 (Tasks 4-6) let a `source: ci` round carry the failed job count, and Group 3 Task 9 updated § Selected CI loop, but `.bkit/core/.bkit/workflows.md:1046` (§ Evidence round contract, mirrored to `.bkit/workflows.md`) still says the CI row has "null gate, exit code and failure count", which contradicts line 1044 and the code — Fixable: true
