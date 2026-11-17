Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 10, 11
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
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-3-log.md`: `PASS` (`FINAL`), 1 fixed.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-4.md`: `FAIL`, 2 gaps (both `Fixable: false`); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-1.md`: owner chose "Fix now" on both attempt-4 gaps, which added TASK 10.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-5.md`: `CONCERNS`, 3 gaps (all `Fixable: true`); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-2.md`: owner chose "Try again" and "Fix now" on all three attempt-5 gaps, which added TASK 11.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-6.md`: `CONCERNS`, 4 gaps (all `Fixable: true`: the nested-worktree `--file` hole on Tasks 1, 10 and 11, and the harvest `MARK_ROWS` parity test TASK 11 broke); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-6-log.md`: `PASS` (`FINAL`), 4 fixed; group gate exit 0.

## Notes

- Mode `Group`. Judged against `build-diff-1-7.md`, focusing on the attempt-6 remediation commit `96256f948` (`.bkit/core/engine/commands/workflow/status.ts`, `dist/commands/workflow/status.js`, `scripts/harvest/bkit-harvest.mjs`). The briefs have no `Deviations` section. `build-decision-1-1.md` and `build-decision-1-2.md` are "Fix now" / "Try again" decisions, not accepts, so neither closes a gap by itself.
- Test-first audit (`build-tests-green-1-7.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` sections. All 14 rows (Tasks 1, 2, 3, 10, 11) went red, then green. Nothing to decide and nothing loosened.
- All four attempt-6 gaps are closed. `status invocation` now also refuses a `--file` when the git top folder that owns it differs from the issuing top folder (`.bkit/core/engine/commands/workflow/status.ts:691-705`), and `dist/` carries the change. Reproduced with `dist/cli.js` on a scratch repo with `git worktree add .worktrees/b`. From the main checkout, a relative `--file`, an absolute `--file` and a `--file` in a not-yet-created run folder under `.worktrees/b` each exit 2 with B's log byte-identical. From B, a `--file` in the main checkout exits 2. Each checkout issues into its own log (exit 0). The main checkout's id is refused from B ("issued in another checkout"), and B's log does not change. `scripts/harvest/bkit-harvest.mjs` `MARK_ROWS` now lists `invocation`: `node --test scripts/harvest/bkit-harvest.test.mjs` 61/61 pass.
- The six group test files pass: 605 tests (`lib.test.ts`, `status.test.ts`, `run-facts.test.ts`, `ledgers.test.ts`, `telemetry.test.ts`, `journal.integration.test.ts`).
- Full-suite check: the first `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 81, because the machine-wide tests lock was held by another repo's gate run. The re-run passed: `bkit:gate:changed` `verdict: PASS`, exit 0, every stage passed (tests, bats, lint, format, typecheck).
- Tasks 1, 2, 3, 10 and 11 meet their DONE WHEN. Tasks 2 and 3 are already ticked in the plan. Group 1 holds 5 tasks, inside the 5-task cap.
- Advisory, outside every DONE WHEN: no test issues an invocation from the main checkout into a nested `.worktrees/<fid>` status file. The attempt-6 gap suggested adding that case to `refuses to issue an invocation into a status file outside the issuing checkout`, but remediation changed only source. Removing the new owner-top-folder check would fail no test, and that nested layout is bkit's own. Worth a follow-up test.
- Advisory, unchanged since earlier attempts: `--name` pattern validation has no test. `bookRoot` is derived by `path.dirname` in `status invocation` rather than through the `workflows.ts` path functions. Two engine identities are named "invocation" (`RunContext.publication` from #826 and `ctx.invocation`), per `build-plan-current.md` TASK 1 `Reword`. `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS`, and no task lists that file. #836 has landed no host/model capture, so `--host` and `--observed-model` stay caller-asserted. `journalRowsAppended` in `.bkit/core/engine/commands/workflow/worktrees.ts` sets aside only `engine-call` rows during a resume rebase.
- `bkit:generate` was BLOCKED by the Vitest lock in remediation attempts 2 and 3, and no later log confirms it ran for this group.
- Documentation Updates rows belong to Task 9 (Group 3).

## Identified Gaps Log

None

