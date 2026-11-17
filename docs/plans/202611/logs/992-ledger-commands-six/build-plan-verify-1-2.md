Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 7706e04c13bca622746b96b6c0729185e67a116ec2e9cf4874c72b54d3cde00f
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-1.md`: PASS, tasks 1 and 2, no gaps.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-gaps-remediate-1-1-log.md`: the group gate failed on `instructions-sources.test.ts` (mirror drift of `plan-task-ticking-owned-by-verify` in `.bkit/instructions.md`); remediation ran `pnpm instructions:sync` and the gate re-ran with exit 0.

## Notes

- Judged against `build-diff-1-2.md`. Compared with attempt 1, the only new change is the regenerated `.bkit/instructions.md` entry from the remediation; it is a generated mirror repair for the group gate, not plan work, and touches no task field.
- TASK 1 satisfied: `decodeCursor` in `.bkit/core/engine/commands/workflow/ledgers.ts` (line 2102) requires `o >= 0`; `a negative --cursor offset is refused` asserts exit 2, a cursor error, no JSON rows, and an empty page for an offset beyond the end.
- TASK 2 satisfied: `ledgerEffect` in `.bkit/core/engine/ledgers/status.ts` (line 736) reads offset and bytes from the receipt and the block from the intent row, or from an old receipt's `detail.block`; the replay branch of `appendLedgerRows` (ledgers.ts lines 1832-1844) compares the ledger bytes at the stored offset and throws `EXIT_STAGE` naming the operation and saying nothing was recorded; the receipt writes `detail: { offset, bytes }` only (line 1858); the `recordLedgerOperation` comment is updated. Intent rows and receipt rows are separate, so the receipt lookup by `ledgerOpKey` cannot pick up the intent.
- Tests: `pnpm exec vitest run` on `.bkit/core/engine/commands/workflow/ledgers.test.ts` and `.bkit/core/engine/ledgers/status.test.ts` passed 132 of 132. A filtered verbose run confirmed `a negative --cursor offset is refused`, `a replayed operation whose rows are gone is not reported as recorded`, `the row block is stored once per operation` and `returns durable append receipt and permits a deliberate same-key update` each pass.
- Derived Test Matrix: the rows for tasks 1 and 2 are named in their task's `DONE WHEN` and exist; the rows for tasks 3 and 4 belong to group 2.
- Documentation Updates: both rows (task 2) are done: `docs/architecture.md` line 220 and `.bkit/core/.bkit/jsonl.md` line 62. The installed mirror `.bkit/jsonl.md` is re-rendered by `bkit upgrade` once at the end of the session, per `.agents/rules.md` section Install to mirror.
- `dist/commands/workflow/ledgers.js` and `dist/ledgers/status.js` are rebuilt in the same change.
- Errors surface as `CommandError` on the CLI stderr path, per `docs/observability.md`.
- Test-first audit `build-tests-green-1-2.md`: `Enforced: true`, 0 gaps, 0 unproven; no taken-over, changed-by-code, updated or already-landed tests.
- `.bkit/friction.jsonl` carries an orchestrator friction row in the diff; it is not task work and was left untouched.
- No decision records were supplied for group 1.

## Identified Gaps Log

None
