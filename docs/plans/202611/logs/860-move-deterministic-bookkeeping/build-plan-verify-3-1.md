Verdict: CONCERNS
Failures: 5
Fixable: true
Tasks: 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- **Mode:** `Group`, judged against `build-diff-3-1.md` (changes since group 3 started). The briefs `build-brief-3-1.md` and `build-brief-3-2.md` are identical and carry no `Deviations` section.
- **Checks run:** the six planned test files plus `locks.test.ts` (401 tests; all ten named tests pass), `tsc --noEmit` and `tsc -p tsconfig.test.json` (exit 0), `bkit ci slop --base=e0403df0f` (passed, 0 added). A compiled-CLI probe in a scratch repo (`steps stub --agent=bkit-audit-generate --result-file`, `issues comment --kind=audit --result-file`, `steps stub --agent=bkit-build-plan-verify --result-file`) ran without an import cycle and reproduced the `Fixable` gap.
- **Flaky test, not a gap:** `.bkit/core/engine/commands/workflow/locks.test.ts` `reclaims only a proven dead matching process identity` failed once while the seven files ran in parallel (the child's `acquirePublicationLock` printed `null` inside its 3 s `spawnSync` timeout) and passed 23/23 when re-run alone. The group gate may hit it under load.
- **Test-first audit:** `build-tests-green-3-1.md` is `Enforced: true`, `Gaps: 0`, `Unproven: 0`, with no `Updated tests` or `Already landed` sections, so no test-first gap and nothing loosened.
- **TASK 4 (not satisfied):** the receipt, replay, conflict, lineage, checkpoint reconcile, torn-write block, compact/union pending check, `appendFrictionRow` lock (which also covers the #826 `commentDiagnostic` caller) and the carry/restore writer locks are in place, and `tryCreate` delegates to `createExclusive` with `acquirePublicationLock` unchanged. Three gaps stay open: the operation store is not serialized, `migrateLedgers` is not coordinated, and the operation id is not engine-issued.
- **TASK 5 (not satisfied):** stub `--result-file`, Fingerprint checks in `readHeader` and `verdict --result-file`, judged special verdicts, the refusal of PASS on findings or incomplete evidence, and legacy copy / strip-header all work. The `Fixable` derivation contradicts the plan-verify contract, and the fixtures do not cover every registered header kind.
- **TASK 6 (satisfied):** `parseAuditResult` / `auditEntries` / `auditLedgerRows` / `auditHeaderFields` live in `issues.ts`, and `steps.ts` imports them in the existing direction. `issues comment --result-file` refuses a hand-written `Status` / `Findings` and leaves tracker none and Linear dedupe as they were. The runless integration test issues a standalone invocation, renders, appends under one operation, drafts the comment and replays without duplicate rows. `dist/` is rebuilt in the diff. Its "operation context" clause is met with a caller-named operation bound to the standalone invocation through the request hash; the missing engine issuance is logged once, under TASK 4.
- **Plan currency (`build-plan-current.md`):** the Task 4 and Task 6 rewords are covered in code (the `commentDiagnostic` writer goes through the locked `appendFrictionRow`, and an invalid result under `--post` produces no comment and calls no tracker).
- **Decision records:** `build-decision-1-1.md`, `1-2` and `1-3` cover groups 1 and 2 only. None accepts a group 3 gap.
- **Documentation rows:** `docs/architecture.md`, `docs/testing.md` and the workflow/prompt docs belong to Task 9 in group 4 and are not counted here. `.bkit/core/.bkit/cli.md` and `.bkit/core/.bkit/jsonl.md` were updated in this group.
- **Out of scope:** none.

## Identified Gaps Log

Gaps: 5

- TASK 4: `.bkit/core/engine/commands/workflow/ledgers.ts` `appendLedgerRows` — the operation store `.bkit/ledger-operations.jsonl` is checked (`ledgerOperation` / `ledgerIntent`) and then written (`recordLedgerIntent` / `recordLedgerOperation`) while holding only the target ledger's `<file>.bkit-lock`, never a lock on the store itself; two processes using one operation id on two different ledgers both see `new` and both record, so "conflicting hash refuses" does not hold under concurrency, and a later replay of either finds the other's receipt first (`.at(0)`) and reports a conflict for an effect that landed; `unionLedgers` also appends to the store under the store's own lock, which those writers never take — Fixable: true
- TASK 4: `.bkit/core/engine/ledgers/migrate.ts` `migrateLedgers` (run by `bkit install` / `upgrade` from `.bkit/core/engine/install/modules/core.ts:514`) still rewrites `docs/*.jsonl` by temp file + rename without `withTargetLock` or a `pendingLedgerIntents` check, so it can replace bytes a pending operation prepared (its intent offset then points at rewritten text) and can drop a row appended under the lock between its read and its rename; the DONE WHEN requires all engine target writers to serialize or visibly refuse, and the UPDATE asks to inventory and coordinate every direct managed-target writer, as compact and union now do — Fixable: true
- TASK 4: `.bkit/core/engine/commands/workflow/ledgers.ts` `--operation` — the UPDATE asks for engine-issued operation preparation ("issue the ID into that context or read it from there"), but the operation id is a free-text value the caller names (`op-1`, `audit-security-1`); no command issues one or reads it from invocation context, so callers in Group 4 must invent ids and an accidental reuse is only caught by the request hash — Fixable: true
- TASK 5: `.bkit/core/engine/commands/workflow/steps.ts` `DERIVED_FIELDS.Fixable` — derives `Fixable` as `every(finding.fixable)` and refuses a supplied value, but the only prompt that declares a `Fixable:` header (`.bkit/core/prompts/bkit-build-plan-verify.md:112-114`) sets it `true` when any gap is fixable, else `false`; compiled-CLI probe: one fixable plus one unfixable gap renders `Fixable: false` (contract: `true`), no gaps renders `Fixable: true` (contract: `false`), and supplying `Fixable` exits 6 "derived from the findings and cannot be supplied"; the planned test `derives supported header fields and rejects stale bodies without false PASS` encodes the wrong values (mixed → `false`, clean → `true`), so the fix needs that test's two expectations corrected with the derivation — Fixable: true
- TASK 5: `.bkit/core/engine/commands/workflow/steps.test.ts` — the DONE WHEN requires table-driven fixtures that exercise every registered header kind, but the fixtures cover `bkit-build-challenge-1`, `bkit-plan-review-1`, `bkit-build-plan-verify`, `bkit-build-plan-tests` and `bkit-audit-generate` only; prompts that declare a machine header and are not exercised include `bkit-build-challenge-2`, `bkit-plan-review-2`, `bkit-plan-scope-check`, `bkit-build-plan-current` (`Affected`), `bkit-build-plan-gaps-remediate` (`Strategy`, `Fixed`), `bkit-build-plan-tasks`, `bkit-debug-failure-diagnose`, `bkit-debug-failure-reproduce`, `bkit-debug-failure-remediate`, `bkit-ship-deferred-sweep` (`Lazy`) and the design prompts — Fixable: true
