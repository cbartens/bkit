Verdict: CONCERNS
Failures: 4
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
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-3-log.md`: `PASS` (`FINAL`), 1 fixed.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-4.md`: `FAIL`, 2 gaps (both `Fixable: false`); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-1.md`: owner chose "Fix now" on both attempt-4 gaps, which added TASK 10.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-5.md`: `CONCERNS`, 3 gaps (all `Fixable: true`: the cross-worktree `--file` hole on Tasks 1 and 10, and the `MARK_ROWS` step-minutes regression); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-decision-1-2.md`: owner chose "Try again" and "Fix now" on all three attempt-5 gaps, which added TASK 11.

## Notes

- Mode `Group`. Judged against `build-diff-1-6.md`, focusing on the decision-2 work: tests commit `2be57d070` and execute commit `d5b6f547e` (`.bkit/core/engine/commands/workflow/status.ts`, `.bkit/core/engine/commands/workflow/run-facts.ts`, `dist/`). The briefs have no `Deviations` section. `build-decision-1-2.md` is "Try again" plus "Fix now", not an accept, so it closes no gap by itself.
- Test-first audit (`build-tests-green-1-6.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` sections. All 14 rows (Tasks 1, 2, 3, 10, 11) red then green. Nothing to decide and nothing loosened.
- The six group test files pass here: 605 tests (`lib.test.ts`, `status.test.ts`, `run-facts.test.ts`, `ledgers.test.ts`, `telemetry.test.ts`, `journal.integration.test.ts`).
- Attempt-5 gap 3 is closed: `invocation` is in `MARK_ROWS` (`.bkit/core/engine/commands/workflow/run-facts.ts:345`), and `run-facts.test.ts` `starts a step clock at the previous step row, not at an invocation row` passes. That half of TASK 11's DONE WHEN is met, but the harvest script's copy of the list was not updated (see the log).
- Attempt-5 gaps 1 and 2 are closed for two separate checkouts (the planned test, absolute and relative `--file`), but not for a worktree nested inside the issuing checkout, which is how bkit lays out `.worktrees/<fid>`. Reproduced on a scratch repo with `dist/cli.js` (see the log). The other direction is refused: from inside the nested worktree, a `--file` in the main checkout is outside its top folder, and an id issued in the main checkout is refused there.
- Tasks 2 and 3 are already ticked in the plan and stay satisfied. Tasks 1, 10 and 11 stay open on the one nested-worktree hole.
- Group 1 holds 5 tasks (1, 2, 3, 10, 11), inside the 5-task cap.
- Advisory, outside every DONE WHEN, unchanged since earlier attempts: `--name` pattern validation has no test; `bookRoot` is derived by `path.dirname` in `status invocation` rather than through the `workflows.ts` path functions; two engine identities are named "invocation" (`RunContext.publication` from #826 and `ctx.invocation`), per `build-plan-current.md` TASK 1 `Reword`; `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS` with no task listing that file; #836 has landed no host/model capture, so `--host` and `--observed-model` stay caller-asserted; `journalRowsAppended` in `.bkit/core/engine/commands/workflow/worktrees.ts:382` sets aside only `engine-call` rows during a resume rebase.
- `bkit:generate` was BLOCKED by the Vitest lock in remediation attempts 2 and 3 and has not been confirmed run for this group.
- Documentation Updates rows belong to Task 9 (Group 3).
- Full-suite check: `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran `bkit:gate:changed` and failed: 3 of 9255 tests in 2 of 227 files. Two are the harvest parity break logged against TASK 11. The third, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `run exits 75 when the wait gives up, distinct from the command's own failure` (`ENOTEMPTY` while `afterEach` removed its temp folder, load average about 11), passed when that file was re-run alone, and the branch does not touch it. It is not logged as a gap.

## Identified Gaps Log

4 gaps: 4 `Fixable: true`, 0 `Fixable: false`. The first three share one root cause, and one fix closes them; the fourth is a test that TASK 11 broke.

- TASK 11: The new check in `status invocation` (`.bkit/core/engine/commands/workflow/status.ts:680-695`) only tests that the real path of `--file` starts with the issuing checkout's real top folder, so it still accepts a status log in a worktree nested inside that folder, which is bkit's own `.worktrees/<fid>` layout. Reproduced with `dist/cli.js` on a scratch repo with `git worktree add .worktrees/b`: from the main checkout, `bkit status invocation --workflow=build --step=build-branch-sync --file=.worktrees/b/docs/plans/202611/logs/900-x/status.jsonl` exited 0 and appended the `invocation` row to B's `status.jsonl`, with `bookRoot` and `statusPath` in B and `worktree` = main. DONE WHEN "`status invocation` with a `--file` from another worktree exits non-zero and changes no file" and "an id issued for one worktree's run is not accepted from another" fail for this layout: the id bound to B's run resolves from main, because `resolveInvocation` compares only the caller's top folder with the receipt's `worktree`. The planned test `refuses to issue an invocation into a status file outside the issuing checkout` uses two sibling repos, so it passes. Fix: refuse when the git top folder that owns `--file` (for example `git rev-parse --show-toplevel` run in its nearest existing folder) differs from the issuing top folder, and add the nested-worktree case to that test. — Fixable: true
- TASK 10: Same root cause as the TASK 11 gap. DONE WHEN "nothing is written to another worktree's status or artifacts" still fails when the other worktree is nested under the issuing checkout: issuance writes the `invocation` event into the nested worktree's log, and every later call bound to that id writes its `engine-call` row to `bound.statusPath` there (`runCommand`, `.bkit/core/engine/commands/lib.ts`). Reproduced: `bkit ledgers append --ledger=knowledge --rows=... --invocation=<id>` run from the main checkout added an `engine-call` row to B's `status.jsonl` (the append itself was refused on `--root`), while the main checkout's log stayed unchanged. — Fixable: true
- TASK 1: Same root cause as the TASK 11 gap. DONE WHEN "reject ambiguous/stale/cross-worktree/conflicting mutations" is not met for a nested worktree: an id issued in the main checkout binds to the nested worktree's run (`statusPath`, `bookRoot`) and is accepted from the main checkout (reproduced; the same id is refused from inside B, "issued in another checkout"). — Fixable: true
- TASK 11: Adding `invocation` to the engine's `MARK_ROWS` (`.bkit/core/engine/commands/workflow/run-facts.ts:345`) broke the parity test `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's`, because the copy in `scripts/harvest/bkit-harvest.mjs:1479-1486` still lacks `invocation` (actual `[session, owner-pause, owner-answer, test-run, engine-call, completeness]`, expected the same plus `invocation`). That failure also fails `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `node — scripts/harvest/bkit-harvest.test.mjs reports its named test passed` and `node — with no report path the test file is left as it was`, so `bkit tests changed --base=origin/dev` exits with `bkit:gate:changed` FAIL. Reproduced with `node --test scripts/harvest/bkit-harvest.test.mjs` and by re-running the integration file alone. The task did not fix the tests it broke: add `invocation` to the harvest copy. — Fixable: true
