Verdict: PASS
Failures: 0
Fixable: false
Tasks: 5
Loosened: none
Fingerprint: 169e21a42d7a5c668795f5bc257c6a618d5af353362b96a7fc3876435f966376
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 5 satisfied against `build-diff-3-1.md`. The replay branch of `appendLedgerRows` (`.bkit/core/engine/commands/workflow/ledgers.ts:1842`) now uses `held.indexOf(wanted) === -1`, so a block anywhere in the ledger returns the stored receipt with `replayed: true`; a missing block still throws `CommandError(EXIT_STAGE, ...)` before any write, and the message reads "was recorded earlier, but {file} no longer holds its rows; do not retry it under a new operation id". `dist/commands/workflow/ledgers.js` carries the same change.
- Compact, harvest and the receipt lookup (`ledgerOperation`, `ledgerEffect`) are untouched in the diff; no row-key matching was added.
- `docs/architecture.md:220` and `.bkit/core/.bkit/jsonl.md:62` (and its mirror `.bkit/jsonl.md`, identical below the managed header) describe the new refusal. No other file outside `docs/plans/` carries the old "has a receipt, but" / "nothing recorded" wording.
- Tests: `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts -t "replayed operation"` passes 3 of 3: the two TEST FIRST tests and the unchanged existing test `a replayed operation whose rows are gone is not reported as recorded`. `pnpm tsc --noEmit -p .` exits 0.
- Test-first audit `build-tests-green-3-1.md`: Enforced true, Verdict PASS, 0 gaps, 0 unproven; no Taken over, Changed by a code step, Updated tests or Already landed sections.
- Decision record `build-decision-1-1.md` (Decision: Fix now, owner's instruction via the orchestrator) directs the remedy task 5 implements; it accepts no gap.
- `docs/observability.md`: the change adds no new error path; the refusal stays a `CommandError` with an exit code, as before.

## Identified Gaps Log

None
