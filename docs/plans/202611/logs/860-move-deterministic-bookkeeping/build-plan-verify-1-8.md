Verdict: FAIL
Failures: 1
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

- `build-plan-verify-1-1.md` through `build-plan-verify-1-6.md` and their remediation logs: summarised in `build-plan-verify-1-7.md` § Previously Attempted (attempts 1-6, decisions `build-decision-1-1.md` and `build-decision-1-2.md` added TASK 10 and TASK 11).
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-7.md`: `PASS`, 0 gaps; Tasks 1, 2, 3, 10 and 11 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-group-gate-1-7.md`: failed at `bkit:slop:delta` with 2 net-new findings: `defensive.empty-catch` at `.bkit/core/engine/commands/lib.ts:596` and `boundary/type-suppression` at `.bkit/core/engine/ledgers/telemetry.test.ts:2986`.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-7-log.md`: `CONCERNS` (`FINAL`), 1 fixed (the empty catch); the test cast BLOCKED for the tests step.

## Notes

- Mode `Group`. Judged against `build-diff-1-8.md`; the only code change since attempt 7 is remediation commit `060a34198` (`.bkit/core/engine/commands/lib.ts` `rebuildInvocation` catch, `dist/commands/lib.js`). The briefs have no `Deviations` section. `build-decision-1-1.md` and `build-decision-1-2.md` are "Fix now" / "Try again" decisions, not accepts, so neither closes a gap.
- Test-first audit (`build-tests-green-1-8.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` sections. All 14 rows (Tasks 1, 2, 3, 10, 11) red then green. Nothing to decide and nothing loosened.
- Group-gate gap 1 is closed: the `rebuildInvocation` catch now returns whether the receipt file exists (`.bkit/core/engine/commands/lib.ts:619-625`), and `dist/commands/lib.js:424` carries it. A fresh `pnpm bkit:slop:delta` run reports only the telemetry test finding (1 net-new, `passed: false`).
- Group-gate gap 2 is open (see Identified Gaps Log). It is logged `Fixable: false` because the remediation step is barred from rewriting a planned test and already BLOCKED on it once, no tests step has run since, and the `Loosened` route does not apply (the cast loosens no expectation). The owner decides between a tests-step rewrite, a code-step edit of the planned test, or a confirmed per-file slop opt-out.
- The six group test files pass: 605 tests (`lib.test.ts`, `status.test.ts`, `run-facts.test.ts`, `ledgers.test.ts`, `telemetry.test.ts`, `journal.integration.test.ts`).
- Tasks 1, 2, 3, 10 and 11 meet their DONE WHEN (all named tests pass; behaviour unchanged since the attempt-7 reproductions in `build-plan-verify-1-7.md` § Notes). TASK 2 stays on the `Tasks` line because its DONE WHEN holds; the open gap is the mandatory full-gate check, which fails on TASK 2's test file. Group 1 holds 5 tasks, inside the 5-task cap.
- Advisories carried from attempt 7, outside every DONE WHEN: no test issues an invocation from the main checkout into a nested `.worktrees/<fid>` status file; `--name` pattern validation has no test; `bookRoot` comes from `path.dirname` rather than the `workflows.ts` path functions; two engine identities are named "invocation" (`RunContext.publication` from #826 and `ctx.invocation`); `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS` and no task lists that file; `--host` / `--observed-model` stay caller-asserted until #836 lands capture.
- `bkit:generate` was BLOCKED by the Vitest lock in remediation attempts 2 and 3, and no later log confirms it ran for this group.
- Documentation Updates rows belong to Task 9 (Group 3).

## Identified Gaps Log

1 gap.

- TASK 2: `.bkit/core/engine/ledgers/telemetry.test.ts:2986` `accepts verified unavailable model without confusing configured and observed models` — boundary/type-suppression: the planned test calls `writerProblem(unavailable as unknown as Record<string, unknown>)`, so `pnpm bkit:slop:delta` still fails (re-run in this attempt: `passed: false`, 1 net-new finding) and with it `bkit:gate:static-unit` (`build-group-gate-1-7.md`). The double cast is a type-system escape the rules forbid. Remediation attempt 7 BLOCKED it because only the tests step may change a planned test, and no tests step ran after it (no commit touches the file since `dc829b6d0`). Closing it needs a choice the plan does not make: send the test back to the tests step to retype the argument without the cast (other calls in the same file pass plain object literals to `writerProblem(row: Record<string, unknown>)`, e.g. lines 2099-2127), let a code step edit the planned test, or accept a targeted per-file slop opt-out, which needs explicit owner confirmation — Fixable: false
