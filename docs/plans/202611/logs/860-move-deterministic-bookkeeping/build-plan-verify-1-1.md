Verdict: FAIL
Failures: 7
Fixable: true
Tasks: none
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

None

## Notes

- Mode `Group`, judged against `build-diff-1-1.md`. The brief has no `Deviations` section. No decision records, earlier verify reports or remediation logs exist for group 1.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` entries. Nothing needed deciding there and nothing was loosened.
- All nine Derived Test Matrix rows for Tasks 1-3 exist under their exact names and pass: 5 files, 550 tests. `pnpm typecheck` and `pnpm lint` exit 0.
- Full suite: 9270 passed, 1 failed, 2 skipped. The one failure is `.bkit/core/engine/commands/workflow/locks.test.ts` `publication ownership lock > reclaims only a proven dead matching process identity`. Neither `locks.ts` nor its test is in this group's diff, and the file passes 23/23 when run alone, so it is a timing flake under load (load average about 15), not a group-1 regression.
- `build-plan-current.md` marked TASK 1 `Reword` because #826 had already claimed the name "invocation" (`RunContext.publication`, `bkit-outbox/invocations/`). The build kept a separate `ctx.invocation` under `bkit-outbox/invocation-context/`, so two engine identities are now called "invocation". The plan was not reworded and no decision record covers this. Raise it with the owner together with the journal gap.
- #836 has not landed any host/model capture yet (only its design and plan are done). The invocation's `--host` and `--observed-model` are values the caller asserts.
- Out-of-scope edit worth reviewing: `.bkit/core/engine/commands/registry.ts` dropped `readonly` from `COMMANDS` so the tests can pass it to `runCommand`. No task lists this file.
- Advisory, not gating: `queryLedger` re-implements the line loop instead of wrapping `parse`. The query also has no default lifecycle status filter and no `--status=all` (plan § Architecture). Neither is in a DONE WHEN.
- Documentation Updates rows (instructions, jsonl.md, workflows.md, architecture.md, testing.md, observability.md) belong to Task 9 in Group 3. `.bkit/cli.md` and its `core/` source already list the new verbs and flags.

## Identified Gaps Log

7 gaps: 6 `Fixable: true`, 1 `Fixable: false`.

- TASK 1: DONE WHEN "including setup/no-plan/group/remediation/ship and existing build→debug→build characterization" is unmet — `status invocation` binds no group or attempt (`--group` is refused as an unknown flag, so two remediation groups of one step get indistinguishable context), no test covers setup, no-plan conversion, group, remediation, ship book root or build→debug→build, and the listed UPDATEs to `.bkit/core/engine/ledgers/status.ts` (invocation event as status authority, outbox as rehydratable index), `.bkit/core/engine/commands/workflow/workflows.ts` (lifecycle integration, cache rehydration) and `.bkit/core/engine/commands/workflow/step-table.ts` (artifact metadata) are absent from the diff — deleting the outbox receipt makes a live run's id unresolvable. — Fixable: true
- TASK 1: DONE WHEN "Runless issuance creates authoritative scoped outbox context" is unmet — `status invocation --standalone=audit|utility --name=X` records no declared step, allowed agent or input/output scope (plan § Data Schema Changes, Invocation row), and `--name` / `--agent` are accepted unvalidated, so the receipt scopes nothing. — Fixable: true
- TASK 1: `runCommand` in `.bkit/core/engine/commands/lib.ts` skips `journal.call` for every invocation-bound call, so those calls write no `engine-call` row; this contradicts the plan's Reuse Inventory R1 "preserve fail-open journal", changes the evidence `bkit completeness check` reads, and is not documented in `docs/observability.md` § `[bkit-telemetry]` (which lists the only no-row cases). Restoring the row conflicts with the planned test `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes explicit invocation across two real worktrees without identity leakage`, which asserts the issuing run's status bytes stay unchanged; the plan does not decide where invocation-bound engine-call evidence lives. — Fixable: false
- TASK 2: DONE WHEN "unavailable optional model carries authoritative provenance without blocking" is unmet when the host reports nothing — an invocation issued with `--agent` but no `--observed-model` leaves `modelSource` unset, and `ledgers append --invocation` then refuses the row (`missing by.model`, exit 8; reproduced on the built CLI). The plan (Edge Cases "Missing model telemetry with valid author/run binding"; Architecture "absent optional observation is explicit and nonblocking") needs the engine to record `unavailable`; `.bkit/core/engine/commands/workflow/run-facts.ts` is unchanged. — Fixable: true
- TASK 2: A legacy `ledgers append` with no `--invocation` can self-assert `by.modelSource: "unavailable"` and skip the `by.model` requirement (`writerProblem` in `.bkit/core/engine/ledgers/telemetry.ts`; reproduced: exit 0, row written). Plan § Data Schema Changes RowBy: "Unavailable subagent rows require validated invocation provenance"; the DONE WHEN asks for "authoritative provenance". Refusing a caller-asserted unavailable source outside an invocation in `appendLedgerRows` keeps the planned codec test intact. — Fixable: true
- TASK 2: DONE WHEN "Table-driven compatibility checks cover old valid rows, new provenance shapes and unknown optional fields through normalization/fold/compact/resume" is unmet — `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts verified unavailable model without confusing configured and observed models` checks single rows through `validate`, `normalizeEvent` and one `fold` only; no table-driven case and no compact or resume path. — Fixable: true
- TASK 3: DONE WHEN "diagnoses malformed/invalid/missing/unreadable coverage" is unmet for invalid rows — `queryLedger` in `.bkit/core/engine/ledgers/telemetry.ts` diagnoses only `malformed-json` and `not-an-object`; a row with no `ts` or no `key` folds silently and `ledgers query` reports `coverage {status: complete, clean: true}` (reproduced on the built CLI). Plan § Data Schema Changes, Ledger query: "invalid identity/timestamp are explicit coverage failures, never clean". — Fixable: true
