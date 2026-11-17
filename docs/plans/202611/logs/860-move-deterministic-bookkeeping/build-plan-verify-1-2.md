Verdict: FAIL
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
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-1-1-log.md`: `FAIL`, 6 fixed. It left Gap 1's status-authority remainder BLOCKED and did not touch attempt 1's `Fixable: false` journal gap.

## Notes

- Mode `Group`. Judged against `build-diff-1-2.md`. The brief has no `Deviations` section, and no `build-decision-*.md` records exist.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `Already landed` entries. There was nothing to decide and nothing was loosened.
- All nine Derived Test Matrix rows for Tasks 1-3 exist under their exact names. The five files pass: 555 tests. For the full suite this report relies on the remediation log ("bkit tests changed: exit 0"). The full suite was not re-run here (load average about 17).
- Attempt-1 gaps closed and reproduced on the built CLI in a scratch repo:
  - An agent with no `--observed-model` is recorded `unavailable`, and its append succeeds.
  - A legacy append asserting `by.modelSource: unavailable` is refused with exit 8.
  - A ledger row with no `ts` gives an `invalid-timestamp` diagnostic and `coverage {status: partial, clean: false}`.
  - The table-driven provenance compatibility test covers validate, normalize, fold, compact and query.
  - `--group` / `--attempt` bind, and the standalone receipt carries `declaredStep` and `allowedAgent`.
- TASK 2 is judged satisfied. "resume" in its DONE WHEN is read as the ledger read-back path (`queryLedger`), because ledgers have no separate resume reader.
- Advisory items, outside every DONE WHEN:
  - The new TASK 2 logic has no test of its own: the default `unavailable` model and the refusal of a legacy `unavailable`.
  - Plan § Data Schema Changes RowBy names `invocationId` and `modelAvailability`, but the build carries `modelSource` only.
  - `ledgers query` reports invalid-timestamp/identity lines under `malformedLines`.
- Still open from attempt 1:
  - Two engine identities are both called "invocation": `RunContext.publication` (#826) and `ctx.invocation`. No decision record covers this.
  - `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS`, and no task lists that file.
  - #836 has landed no host/model capture, so `--host` and `--observed-model` stay caller-asserted.
- The owner must decide whether an invocation-bound call writes to the run's `status.jsonl` (engine-call evidence and the invocation event as status authority). Both `Fixable: false` gaps hang on that one choice. The two planned tests that assert unchanged status bytes then either stay or are rewritten by the tests step.
- Documentation Updates rows belong to Task 9 (Group 3).

## Identified Gaps Log

4 gaps: 2 `Fixable: true`, 2 `Fixable: false`.

- TASK 1: `runCommand` in `.bkit/core/engine/commands/lib.ts` still skips `journal.call` for every invocation-bound call, so those calls write no `engine-call` row (unchanged since attempt 1; no decision record). This contradicts Reuse Inventory R1 "preserve fail-open journal", changes the evidence `bkit completeness check` reads, and is not listed in `docs/observability.md` § `[bkit-telemetry]` among the no-row cases. Restoring the row breaks the planned test `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes explicit invocation across two real worktrees without identity leakage`, which asserts the issuing run's status bytes stay unchanged after resolving under `--invocation`; the plan does not decide where invocation-bound engine-call evidence lives. — Fixable: false
- TASK 1: The workflow-mode invocation is not recorded in `status.jsonl`, so status is not its authority and the outbox receipt is not a rehydratable index (plan § Data Schema Changes, Invocation row; § Architecture "Extend existing `status row --type=invocation`"); `.bkit/core/engine/ledgers/status.ts` is absent from the diff, and deleting `<git-common>/bkit-outbox/invocation-context/<id>.json` makes a live run's id unresolvable. Writing the event conflicts with the planned test `.bkit/core/engine/commands/workflow/status.test.ts` `issues invocation metadata from an explicit run and registered step` ("Issuing mutates no run state" asserts the status bytes unchanged) and with the journal test above; remediation attempt 1 logged this BLOCKED. Same owner decision as the gap above. — Fixable: false
- TASK 1: DONE WHEN "including setup/no-plan/group/remediation/ship and existing build→debug→build characterization" is still unmet — `--group` / `--attempt` now bind (reproduced on the built CLI), but no test covers group or attempt binding, setup, no-plan conversion, remediation, ship's bookkeeping root or build→debug→build, and the listed UPDATEs to `.bkit/core/engine/commands/workflow/workflows.ts` (lifecycle integration, invocation-ready inputs, no-plan/remediation/ship book-root reuse) and `.bkit/core/engine/commands/workflow/step-table.ts` (step/agent artifact metadata) are absent from the diff. None of this needs the status-authority decision. — Fixable: true
- TASK 1: DONE WHEN "Runless issuance creates authoritative scoped outbox context" is only partly met — the standalone receipt now records `declaredStep` and `allowedAgent`, but no explicit input/output scope (plan § Data Schema Changes, Invocation row): `ledgers append --invocation=<outbox id>` accepts any `--root` because `bookRoot` is null (`append` in `.bkit/core/engine/commands/workflow/ledgers.ts:1499`), and `withInvocationBy` fills no `by.step` from `declaredStep`. The remediation's new validation (`--agent` / `--name` / `--group` / `--attempt` patterns, standalone refusals, default `observedModel: unavailable`) has no test. — Fixable: true
