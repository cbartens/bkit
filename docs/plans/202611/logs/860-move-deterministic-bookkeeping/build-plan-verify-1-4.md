Verdict: FAIL
Failures: 2
Fixable: false
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
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-2.md`: `FAIL`, 4 gaps (2 `Fixable: true`, 2 `Fixable: false`); Tasks 2 and 3 judged satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-2-log.md`: `FAIL` (`PIVOT`), 2 fixed; `bkit:generate` BLOCKED on the machine-wide Vitest lock.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-3.md`: `FAIL`, 3 gaps (1 `Fixable: true`, 2 `Fixable: false`); Tasks 2 and 3 satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-3-log.md`: `PASS` (`FINAL`), 1 fixed (no-plan conversion test); `bkit:generate` BLOCKED on the Vitest lock again.

## Notes

- Mode `Group`. Judged against `build-diff-1-4.md` and the attempt-3 remediation commit `4166851ce` (adds one test to `.bkit/core/engine/commands/workflow/status.test.ts`; no engine source change). The brief has no `Deviations` section, and no `build-decision-*.md` records exist.
- Test-first audit (`build-tests-green-1-4.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` entries. Nothing to decide and nothing loosened.
- All nine Derived Test Matrix rows for Tasks 1-3 exist under their exact names. The five group files pass: 558 tests (load average about 14). The full suite was not re-run here; the remediation log reports the group gate `bkit:gate:changed` PASS.
- Attempt-3 gap closed: `.bkit/core/engine/commands/workflow/status.test.ts` `registers the no-plan conversion step` issues an invocation for `build-plan-convert` and passes. TASK 1's DONE WHEN coverage list (setup/no-plan/group/remediation/ship and build→debug→build) is now met by tests.
- Tasks 2 and 3 are already ticked in the plan and stay satisfied.
- TASK 1 stays unsatisfied only on the two `Fixable: false` gaps, both unchanged since attempt 1. They hang on one owner choice: does an invocation-bound call write to the run's `status.jsonl` (the invocation event as status authority, plus engine-call evidence)? If yes, the tests step rewrites the two planned tests that assert unchanged status bytes (`status.test.ts:1202-1203` and the journal integration test). If no, the plan's Invocation row and Reuse Inventory R1 need rewording, and `docs/observability.md` § `[bkit-telemetry]` must list invocation-bound calls as a no-row case. Further remediation rounds cannot close these without that decision.
- `bkit:generate` (render snapshot step) was BLOCKED in remediation attempts 2 and 3 by the machine-wide Vitest lock; it has not been confirmed run for this group.
- Advisory, outside every DONE WHEN, still open: `--name` pattern validation has no test; `bookRoot` is derived by `path.dirname` in `status invocation` rather than via the `workflows.ts` path functions; two engine identities are both named "invocation" (`RunContext.publication` from #826 and `ctx.invocation`), per `build-plan-current.md` TASK 1 `Reword`; `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS` with no task listing that file; #836 has landed no host/model capture, so `--host` and `--observed-model` stay caller-asserted.
- Documentation Updates rows belong to Task 9 (Group 3).

## Identified Gaps Log

2 gaps: 0 `Fixable: true`, 2 `Fixable: false`.

- TASK 1: `runCommand` in `.bkit/core/engine/commands/lib.ts:766` still skips `journal.call` for every invocation-bound call, so those calls write no `engine-call` row (unchanged since attempt 1; no `build-decision-*.md` record). This contradicts Reuse Inventory R1 "preserve fail-open journal", changes the evidence `bkit completeness check` reads, and is not listed in `docs/observability.md` § `[bkit-telemetry]` among the no-row cases. Restoring the row breaks the planned test `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes explicit invocation across two real worktrees without identity leakage`, which asserts the issuing run's status bytes stay unchanged; the plan does not decide where invocation-bound engine-call evidence lives. — Fixable: false
- TASK 1: The workflow-mode invocation is still not recorded in `status.jsonl`, so status is not its authority and the outbox receipt is not a rehydratable index (plan § Data Schema Changes, Invocation row: "status is its authority and the outbox entry is a rehydratable index"); `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts` (lifecycle integration, cache rehydration) and `.bkit/core/engine/commands/workflow/step-table.ts` remain absent from the group diff. Writing the event conflicts with the planned test `.bkit/core/engine/commands/workflow/status.test.ts` `issues invocation metadata from an explicit run and registered step` (`status.test.ts:1202-1203`, "Issuing mutates no run state") and with the journal test above. Same owner decision as the gap above. — Fixable: false
