Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: 1f5d7363e21f1f39221559566efaee23467853f4299edca669cd33147eaf6572
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups).

## Integration Gaps

0. Checked across groups against `tmp/bkit-diff-992-ledger-commands-six.md`, the full feature diff:

- TASK 5 (group 3) and TASK 6 (group 4) now agree on what "landed" means. The receipt replay branch of `appendLedgerRows` (`.bkit/core/engine/commands/workflow/ledgers.ts:1839-1846`) accepts the block anywhere in the file (`held.indexOf(wanted) === -1` refuses), and the intent path (`ledgers.ts:1878-1883`) receipts the block when `have.indexOf(want) !== -1`. A lost response after a rebase is receipted by TASK 6, and a later replay of the same operation is answered by TASK 5's branch, so neither path appends the rows a second time.
- TASK 6 records its receipt through the same `receipt` helper that TASK 2 trimmed to `detail: { offset, bytes }`, so the block still lives once, in the intent row, and `ledgerEffect` (TASK 2, `.bkit/core/engine/ledgers/status.ts:736`) reads it back for the replay. The stored `offset` is the intent's original offset, not the block's current position; nothing reads it as a position, because the replay searches the whole file.
- TASK 5's refusal and TASK 2's `has a receipt without its effect` error stay `CommandError(EXIT_STAGE)` thrown before any write, so the `effects: none` contract in `docs/observability.md:32` holds; TASK 6 returns the existing receipt shape (`operation`, `replayed`, per-row `key` and `ts`).
- TASK 3's `0600` corrections file and TASK 4's `:(exclude,glob)**/*.bkit-lock` pathspec are untouched by groups 3 and 4. The exclude is never the only pathspec, because `bookPathspecs` always returns positive entries.
- `dist/commands/workflow/ledgers.js` and `dist/ledgers/status.js` carry every engine change from all four groups (`dist/commands/workflow/ledgers.js:1021`, `:1325`, `:1485`, `:1516`, `:1703`).

## Previously Attempted

- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-1.md`: Group 1, PASS, tasks 1 and 2.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-2.md`: Group 1, PASS, tasks 1 and 2, after `build-plan-gaps-remediate-1-1-log.md` repaired the `.bkit/instructions.md` mirror drift that failed the group gate.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-2-1.md`: Group 2, PASS, tasks 3 and 4.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-1.md`: Holistic, PASS, tasks 1 to 4 (2 of 2 groups).
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-3-1.md`: Group 3, PASS, task 5.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-2.md`: Holistic, PASS, tasks 1 to 5 (3 of 3 groups, before the second challenge round added group 4).
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-4-1.md`: Group 4, PASS, task 6.

## Notes

- TASK 1 satisfied: `decodeCursor` requires `o >= 0`; `a negative --cursor offset is refused` asserts exit 2, a cursor error, no rows, and an empty page for an offset beyond the end.
- TASK 2 satisfied: `ledgerEffect` in `.bkit/core/engine/ledgers/status.ts` returns offset and bytes from the receipt and the block from the intent, or from an old receipt's `detail.block`; the receipt writes `detail: { offset, bytes }` only; `the row block is stored once per operation`, `a replayed operation whose rows are gone is not reported as recorded` and `returns durable append receipt and permits a deliberate same-key update` pass. TASK 5 replaced the at-offset check with the anywhere-in-file check, as decision record `build-decision-1-1.md` directs.
- TASK 3 satisfied: `correctionBook` creates the file with `{ mode: 0o600 }`; `the correction-events file has mode 0600` passes.
- TASK 4 satisfied: `commitBookkeeping` excludes `**/*.bkit-lock` after `...specs`; `bookPathspecs` is unchanged; `*.bkit-lock` is in `.bkit/shared/gitignore` and in the bkit-managed block of `.gitignore`, and `.bkit/version` carries the new `.gitignore` hash; `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit` passes. No `*.bkit-lock` file is tracked.
- TASK 5 satisfied: the replay returns the stored receipt with `replayed: true` when the block is anywhere in the file; a missing block throws `EXIT_STAGE` before any write with "was recorded earlier, but {file} no longer holds its rows; do not retry it under a new operation id". Compact, harvest and the receipt lookup are unchanged, with no row-key matching. `docs/architecture.md:220`, `.bkit/core/.bkit/jsonl.md:62` and the mirror `.bkit/jsonl.md` carry the new wording. Decision record `build-decision-1-1.md` (Decision: Fix now, under the owner's instruction) sets this remedy; it accepts no gap.
- TASK 6 satisfied: in the intent path, when the bytes at `intent.offset` differ but `have.indexOf(want) !== -1`, the engine receipts the intent and returns `replayed: true`, `appended: 0`, writing nothing to the ledger; the uncertain check and "prepare afresh" run only when the block is nowhere in the file. `receipts a lost-response block that a rebase moved behind upstream rows instead of appending it again` (`.bkit/core/engine/ledgers/journal.integration.test.ts`), `prepares afresh when nothing landed and a foreign row followed` and `refuses to re-append a partly landed block after a foreign writer appended` pass.
- Item 6 needs no task: the row `992-worktree-fingerprint-stays-plain-hash` exists once in `docs/decisions.jsonl`.
- Tests: `pnpm exec vitest run` on `.bkit/core/engine/commands/workflow/ledgers.test.ts`, `.bkit/core/engine/ledgers/status.test.ts` and `.bkit/core/engine/ledgers/journal.integration.test.ts` passed 159 of 159; a verbose filtered run confirmed each of the 11 tests named in a `DONE WHEN` or `TEST FIRST` passes. `pnpm exec tsc --noEmit -p .` exits 0. The full suite is left to the holistic gate and the final run, per `.agents/rules.md` section Local tests first; `build-holistic-gate-1-2.md` ran before group 4.
- Derived Test Matrix: all eight rows are named in their task's `DONE WHEN` or `TEST FIRST`, and each exists as a plain `it(...)` test with no skip.
- Test-first audits: no audit report was supplied as an input for this holistic pass. The group 4 audit `build-tests-green-4-1.md` reports `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven, task 6 red then green; the group 1 to 3 audits reported the same per their verify reports. No `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` entries.
- Documentation Updates: both rows are done. Observability: the receipt and error shapes in `docs/observability.md:32` are unchanged.
- Advisory, not a gap: a block that was first written with a leading separator newline (when the ledger lacked a trailing newline) may not survive a line-based union merge byte for byte, so the anywhere-in-file search would miss it and fall through to the existing paths. The plan's `DONE WHEN` asks for the whole block only, and no matrix row covers this.
- Out of scope, not a gap: `.bkit/friction.jsonl` carries orchestrator friction rows, `DETAILS.md` and `docs/capabilities.md` carry Graphify count refreshes, `.bkit/instructions.md` carries the remediated mirror entry, and `docs/deferrals.jsonl` carries the LOW challenge deferral on committing the deletion of a tracked `*.bkit-lock`.

## Identified Gaps Log

None
