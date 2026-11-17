Verdict: PASS
Failures: 0
Fixable: false
Tasks: 23, 24
Loosened: none
Fingerprint: 773bb71ee87ef77f31acb1a2ac87e09a14667fd3aca17b740371bf37db93dead
<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 23: satisfied. `ledgerOperationsFile` in `.bkit/core/engine/ledgers/status.ts:681` puts the store at `<git common dir>/bkit-outbox/ledger-operations/<root hash>.jsonl`; `privateDir` creates 0700 directories and both `recordLedgerIntent` and `recordLedgerOperation` append with mode 0600. The constant `LEDGER_OPERATIONS_FILE` is gone (`git grep` finds no engine reference to `.bkit/ledger-operations.jsonl`; `tsc --noEmit` exits 0). Union (`ledgers.ts:1319`), the `--correction-of` guard (`ledgers.ts:1858`), compact (`ledgers.ts:2107`) and `migrateLedgers` (`migrate.ts:88`) read pending intents only through `pendingLedgerIntentsFor`, so a tracked `.bkit/ledger-operations.jsonl` row no longer blocks them. `UNION_PATHSPECS` still lists `.bkit/*.jsonl`, but no store row is written there, so nothing the operations store holds is staged or carried. An operation in a root outside git is refused with `EXIT.USAGE` before any write. `docs/architecture.md` and `docs/observability.md` describe the new location.
- TASK 24: satisfied. `parseAuditResult` (`issues.ts:647`) refuses CR/LF in `report`, `issue` and `parent`; `renderResult` wraps that as EXIT_INVALID (6) for the audit agent, and refuses CR/LF in every judgment (`steps.ts:1653`). `Status` is an enum and `Findings` is derived, so every header line of `renderAudit` is covered. `issues comment --result-file` builds its `Report:` line (`issues.ts:907`) from the same parsed result, so it refuses with exit 2 (`EXIT.USAGE`) and writes nothing.
- Tests run singly: both DONE WHEN tests pass. Full single-file runs of `ledgers.test.ts` (106), `steps.test.ts` (124), `issues.test.ts` (93), `migrate.test.ts` (11) and `journal.integration.test.ts` (20) all pass, and that covers the two repointed old-location tests. The full suite was not run: the caller forbids directory runs.
- Test-first audit (`build-tests-green-7-1.md`): Enforced true, 0 gaps, 0 unproven, no updated-test or already-landed sections.
- Decision records `build-decision-1-1.md` to `build-decision-1-5.md` concern group 1 and do not cover tasks 23 and 24.
- Out of scope, proposed separately: `docs/deferrals.jsonl:235` (LOW deferral `...challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1709`) still describes rows written twice into the committed `.bkit/ledger-operations.jsonl`. Task 23 moved that store into the private outbox, so the row's wording is now out of date, though the size-growth concern may still apply to the outbox file.

## Identified Gaps Log

None
