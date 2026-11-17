Verdict: FAIL
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
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-1-2.md`: `FAIL`, 4 gaps (2 `Fixable: true`, 2 `Fixable: false`); Tasks 2 and 3 judged satisfied.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-2-log.md`: `FAIL` (`PIVOT`), 2 fixed (Gaps 3 and 4); `bkit:generate` BLOCKED on the machine-wide Vitest lock (render snapshot step only).

## Notes

- Mode `Group`. Judged against `build-diff-1-3.md` and the attempt-2 remediation commit `b30b6803c`. The brief has no `Deviations` section, and no `build-decision-*.md` records exist.
- Test-first audit (`build-tests-green-1-3.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` entries. Nothing to decide and nothing loosened.
- All nine Derived Test Matrix rows for Tasks 1-3 exist under their exact names. The five group files plus `.bkit/core/engine/commands/workflow/workflows.test.ts` (which holds the existing build→debug→build characterization, e.g. `resumes the workflow's own IN_PROGRESS run when another workflow's run came after it`) pass: 6 files, 711 tests. The full suite was not re-run here; the remediation log reports the group gate `bkit:gate:changed` PASS. `dist/` carries the remediation change and the tree has no uncommitted engine edits.
- Attempt-2 gaps closed:
  - Gap 3 (coverage): the new `status.test.ts` test covers group/attempt binding, setup (`build-worktree-setup`), remediation (`build-plan-gaps-remediate`), ship (`ship-summary`, `bookRoot`), debug, malformed ids and standalone-with-group refusal. Only no-plan conversion is still untested (logged).
  - Gap 4 (runless scope): `withInvocationBy` fills `by.step` from `declaredStep`, a different step is refused, and `append` refuses a `--root` outside the issuing checkout with no ledger effect; tested in `ledgers.test.ts` `scopes a runless invocation to its declared step, agent and issuing checkout`.
- Tasks 2 and 3 are already ticked in the plan and stay satisfied; the remediation's `declaredStep` fallback does not change run-scope behaviour.
- Advisory, outside every DONE WHEN:
  - `--name` pattern validation has no test.
  - `bookRoot` is derived by `path.dirname` four times in `status invocation` rather than through the `workflows.ts` lifecycle/path functions (plan § Architecture: "setup/no-plan/remediation/group/ship paths all use the current lifecycle/path functions").
  - Still open from attempts 1-2: two engine identities named "invocation" (`RunContext.publication` from #826 and `ctx.invocation`); `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS` with no task listing that file; #836 has landed no host/model capture, so `--host` and `--observed-model` stay caller-asserted.
- The owner must decide whether an invocation-bound call writes to the run's `status.jsonl` (engine-call evidence and the invocation event as status authority). Both `Fixable: false` gaps hang on that one choice; the two planned tests that assert unchanged status bytes then either stay or are rewritten by the tests step.
- Documentation Updates rows belong to Task 9 (Group 3).

## Identified Gaps Log

3 gaps: 1 `Fixable: true`, 2 `Fixable: false`.

- TASK 1: `runCommand` in `.bkit/core/engine/commands/lib.ts:766` still skips `journal.call` for every invocation-bound call, so those calls write no `engine-call` row (unchanged since attempt 1; no `build-decision-*.md` record). This contradicts Reuse Inventory R1 "preserve fail-open journal", changes the evidence `bkit completeness check` reads, and is not listed in `docs/observability.md` § `[bkit-telemetry]` among the no-row cases. Restoring the row breaks the planned test `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes explicit invocation across two real worktrees without identity leakage`, which asserts the issuing run's status bytes stay unchanged; the plan does not decide where invocation-bound engine-call evidence lives. — Fixable: false
- TASK 1: The workflow-mode invocation is still not recorded in `status.jsonl`, so status is not its authority and the outbox receipt is not a rehydratable index (plan § Data Schema Changes, Invocation row; § Architecture "status event is durable authority"); `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/workflow/workflows.ts` (lifecycle integration, cache rehydration) and `.bkit/core/engine/commands/workflow/step-table.ts` remain absent from the group diff. Writing the event conflicts with the planned test `.bkit/core/engine/commands/workflow/status.test.ts` `issues invocation metadata from an explicit run and registered step` ("Issuing mutates no run state") and with the journal test above. Same owner decision as the gap above. — Fixable: false
- TASK 1: DONE WHEN "including setup/no-plan/group/remediation/ship" is met for setup, group, attempt, remediation, ship and debug by the new `.bkit/core/engine/commands/workflow/status.test.ts` `binds group and attempt and registers setup, remediation and ship steps`, but no test issues an invocation for no-plan conversion (`build-plan-convert`, step 4, `resumeAt` in `.bkit/core/engine/commands/workflow/step-table.ts:63`). The remediation log names group/attempt/setup/remediation/ship/debug only. — Fixable: true
