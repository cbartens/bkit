Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: 2, 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-1.md`: `FAIL`, 7 gaps (6 `Fixable: true`, 1 `Fixable: false`).
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-1-log.md`: `FAIL`, 6 fixed; status-authority remainder BLOCKED.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-2.md`: `FAIL`, 4 gaps (2 `Fixable: true`, 2 `Fixable: false`); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-2-log.md`: `FAIL` (`PIVOT`), 2 fixed.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-3.md`: `FAIL`, 3 gaps (1 `Fixable: true`, 2 `Fixable: false`); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-3-log.md`: `PASS` (`FINAL`), 1 fixed (no-plan conversion test).
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-4.md`: `FAIL`, 2 gaps (both `Fixable: false`, the status-authority and engine-call choice); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-1.md`: owner chose "Fix now" on both attempt-4 gaps, which added TASK 10 to group 1.

## Notes

- Mode `Group`. Judged against `build-diff-1-5.md`, focusing on the decision-1 work: tests commit `8cd680a6c` and execute commit `16e04bc3d` (`.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/ledgers/status.ts`, `dist/`, `docs/observability.md`). The briefs have no `Deviations` section. `build-decision-1-1.md` is a "Fix now" decision, not an accept, so it closes no gap by itself.
- Test-first audit (`build-tests-green-1-5.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` sections. All 12 rows (Tasks 1, 2, 3, 10) red then green. Nothing to decide and nothing loosened.
- The five group test files pass here: 561 tests. The full suite was not re-run in this step.
- The two attempt-4 `Fixable: false` gaps are closed by TASK 10: `status invocation` appends an `invocation` event to the run's own `status.jsonl`; `resolveInvocation` rebuilds a deleted receipt from it (`rebuildInvocation`, scanning this checkout only); `runCommand` writes the `engine-call` row of an invocation-bound call into `bound.statusPath`; runless issuance writes no row, run or `docs/` directory; `docs/observability.md` § `[bkit-telemetry]` states the new behaviour; `dist/` carries the change. The fold and `resolveInvocation` (`FOLD_TYPES`) skip the new row type.
- The two Task 1 tests changed as the owner approved in TASK 10's UPDATE lines; every other expectation is kept. In `resumes explicit invocation across two real worktrees without identity leakage` the other worktree's baseline moved from before both resumed calls to after them (`afterB`), because worktree B's own bound call now legitimately writes to B's log. This means the test no longer catches A's resumed call writing into B's log; the new TASK 10 test `keeps invocation events and engine-call rows inside the issuing worktree after receipt loss` covers that path. Advisory only.
- TASK 1 and TASK 10 stay unsatisfied on one shared, reproduced hole: issuance accepts another worktree's `--file` and then writes there (see the log). TASK 10 also has a `stepsBlock` step-minutes regression from the new row type.
- Tasks 2 and 3 are already ticked in the plan and stay satisfied.
- Advisory, outside every DONE WHEN and unchanged since earlier attempts: `--name` pattern validation has no test; `bookRoot` is derived by `path.dirname` in `status invocation` rather than through the `workflows.ts` path functions; two engine identities are named "invocation" (`RunContext.publication` from #826 and `ctx.invocation`), per `build-plan-current.md` TASK 1 `Reword`; `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS` with no task listing that file; #836 has landed no host/model capture, so `--host` and `--observed-model` stay caller-asserted. New: `journalRowsAppended` in `.bkit/core/engine/commands/workflow/worktrees.ts:382` sets aside only `engine-call` rows during a resume rebase, so an uncommitted `invocation` row there makes the tree count as dirty (low risk, because the carry commit runs first).
- `bkit:generate` was BLOCKED by the Vitest lock in remediation attempts 2 and 3 and has not been confirmed run for this group.
- Documentation Updates rows belong to Task 9 (Group 3).

## Identified Gaps Log

3 gaps: 3 `Fixable: true`, 0 `Fixable: false`.

- TASK 10: `status invocation` in `.bkit/core/engine/commands/workflow/status.ts:680-736` accepts a `--file` that is another worktree's `status.jsonl` and appends the `invocation` event to it; every later call bound to that id then writes its `engine-call` row there too (`runCommand` in `.bkit/core/engine/commands/lib.ts:828-830` uses `bound.statusPath`). Reproduced on a scratch repo with `dist/cli.js`: from worktree A, `bkit status invocation --workflow=build --step=build-branch-sync --file=<B>/docs/plans/202611/logs/900-x/status.jsonl` exit 0 wrote the event into B's log, and `bkit ledgers append --invocation=<id>` from A wrote an `engine-call` row into B's log while A's stayed unchanged. This breaks DONE WHEN "nothing is written to another worktree's status or artifacts"; `rebuildInvocation` (`lib.ts:581`) already only trusts events under the issuing toplevel, so issuance should refuse a status file outside it before any write. No test issues with a cross-worktree `--file`. — Fixable: true
- TASK 1: Same root cause as the TASK 10 gap: issuance does not check that `--file` lies in the issuing checkout, so an id issued in worktree A binds to worktree B's run (`statusPath`, `bookRoot`) and `resolveInvocation` accepts it from A (it compares only the caller's toplevel with the receipt's `worktree`). DONE WHEN "reject ambiguous/stale/cross-worktree/conflicting mutations" is not met for this path. The one fix (refuse a `--file` outside the issuing toplevel, with a test) closes both gaps. — Fixable: true
- TASK 10: The new `invocation` row is not in `MARK_ROWS` (`.bkit/core/engine/commands/workflow/run-facts.ts:338`), so `stepsBlock` (`run-facts.ts:116`) measures each step's minutes from the last `invocation` row instead of the previous step's row, shrinking reported step time for every step that issues an invocation. An "additive event" that the fold skips (`.bkit/core/engine/ledgers/status.ts` docstring "The fold skips it") should also be skipped as a moment by this reader; no test covers it. — Fixable: true
