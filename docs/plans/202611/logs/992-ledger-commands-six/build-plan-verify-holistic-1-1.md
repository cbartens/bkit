Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: 8aa905e6e3a8af525a8353f6f272ddb1bafbb314c04c55146988e15a08566d29
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. The groups touch separate paths of `.bkit/core/engine/commands/workflow/ledgers.ts` (`decodeCursor` and the replay branch of `appendLedgerRows` in group 1; `correctionBook` and `commitBookkeeping` in group 2) and share no state beyond the module. Checked across groups:

- The new `:(exclude,glob)**/*.bkit-lock` pathspec in `commitBookkeeping` (TASK 4) is never the only pathspec: `bookPathspecs` always returns at least seven positive entries, so the exclude cannot widen `ls-files` to the whole tree.
- No engine code outside `ledgerEffect` reads a block from a receipt's `detail`, so dropping `detail.block` from new receipts (TASK 2) breaks no other reader; old receipts that hold it still replay through `ledgerEffect`.
- The replay refusal (TASK 2) throws a plain `CommandError` with `EXIT_STAGE`, the same class as the existing `has a receipt without its effect` error beside it, so the error contract in `docs/observability.md:32` is unchanged.

## Previously Attempted

- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-1.md`: Group 1, PASS, tasks 1 and 2.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-2.md`: Group 1, PASS, tasks 1 and 2, after `build-plan-gaps-remediate-1-1-log.md` repaired the `.bkit/instructions.md` mirror drift that failed the group gate.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-2-1.md`: Group 2, PASS, tasks 3 and 4.
- This is the first holistic attempt.

## Notes

- Judged against `tmp/bkit-diff-992-ledger-commands-six.md`, the full feature diff.
- TASK 1 satisfied: `decodeCursor` in `.bkit/core/engine/commands/workflow/ledgers.ts` requires `o >= 0`; `a negative --cursor offset is refused` asserts exit 2, a cursor error, no rows, and an empty page for an offset beyond the end.
- TASK 2 satisfied: `ledgerEffect` in `.bkit/core/engine/ledgers/status.ts` returns offset and bytes from the receipt and the block from the intent, or from an old receipt's `detail.block`; the replay branch compares the ledger bytes at the stored offset and throws `EXIT_STAGE` naming the operation; the receipt writes `detail: { offset, bytes }` only; `a replayed operation whose rows are gone is not reported as recorded`, `the row block is stored once per operation` and `returns durable append receipt and permits a deliberate same-key update` pass.
- TASK 3 satisfied: `correctionBook` creates the file with `{ mode: 0o600 }`; `the correction-events file has mode 0600` passes.
- TASK 4 satisfied: `commitBookkeeping` excludes `**/*.bkit-lock` after `...specs`; `bookPathspecs` is unchanged; `*.bkit-lock` sits in `.bkit/shared/gitignore` and in the bkit-managed block of `.gitignore`, and `.bkit/version` carries the new `.gitignore` hash; `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit` passes. No `*.bkit-lock` file is tracked in the repo.
- Item 6 needs no task: the row `992-worktree-fingerprint-stays-plain-hash` exists once in `docs/decisions.jsonl`.
- Tests: `pnpm exec vitest run` on the 19 test files that import `.bkit/core/engine/commands/workflow/ledgers.ts` or `.bkit/core/engine/ledgers/status.ts`, or that cover gitignore and lock handling, passed 1896 of 1896. The full suite is left to the holistic gate, per `.agents/rules.md` section Local tests first.
- Derived Test Matrix: all five rows are named in their task's `DONE WHEN` and exist as plain `it(...)` tests with no skip.
- Documentation Updates: both rows are done (`docs/architecture.md` line 220 and `.bkit/core/.bkit/jsonl.md` line 62), and the installed mirror `.bkit/jsonl.md` is re-rendered with its hash updated in `.bkit/version`. No other tracked doc carries the old replay sentence outside archived build-diff logs.
- Observability: the receipt shape in `docs/observability.md:32` (`operation`, `replayed`, per-row `key` and `ts`) is unchanged; `detail` is internal to the operation store.
- `dist/commands/workflow/ledgers.js` and `dist/ledgers/status.js` carry every engine change.
- No test-first audit report or `build-decision-*.md` record was supplied; the group verify reports recorded `Enforced: true` with 0 gaps for both groups.
- Out of scope, not a gap: `.bkit/friction.jsonl` carries an orchestrator friction row, and `DETAILS.md` and `docs/capabilities.md` carry Graphify count refreshes.

## Identified Gaps Log

None
