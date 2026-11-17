Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 3a73319458436a05d9d7c958435e0362e2eb01f8758cc8b562bd3d01b55dcaf1
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0. Checked across groups against `tmp/bkit-diff-992-ledger-commands-six.md`, the full feature diff:

- TASK 2 (group 1) and TASK 5 (group 3) share the replay branch of `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts`. TASK 5 changed the check from a byte comparison at `d.offset` to `held.indexOf(wanted) === -1` and kept TASK 2's `ledgerEffect` lookup, its `EXIT_STAGE` refusal and its `detail: { offset, bytes }` receipt. TASK 2's test `a replayed operation whose rows are gone is not reported as recorded` still passes beside TASK 5's two tests.
- The correction flow (`ledgers.ts:2050-2059`) counts `receipt.replayed === true` as success. After TASK 5, a replay whose block was moved by a rebase still verifies, and a replay whose rows are gone refuses before any write, so a `correction-succeeded` row cannot follow a refused replay. TASK 3's `0600` corrections file is created before either branch and is not affected.
- TASK 4's `:(exclude,glob)**/*.bkit-lock` pathspec is never the only pathspec, because `bookPathspecs` always returns positive entries. The `<file>.bkit-lock` that every append holds (named in `.bkit/core/.bkit/jsonl.md:62`) is the file both ignore files now list.
- No workflow, prompt or engine caller matches on the old refusal text ("has a receipt, but" / "nothing recorded"). The other hits for "nothing recorded", "new operation id" and "no longer holds" in `.bkit/core/prompts/`, `.bkit/core/.bkit/pipeline.md`, `runs.ts`, `tasks.ts`, `counters.ts` and `steps.test.ts` are unrelated sentences.
- The error contract in `docs/observability.md:32` is unchanged: the refusal is a `CommandError` thrown before any write, and the receipt shape (`operation`, `replayed`, per-row `key` and `ts`) is the same.

## Previously Attempted

- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-1.md`: Group 1, PASS, tasks 1 and 2.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-1-2.md`: Group 1, PASS, tasks 1 and 2, after `build-plan-gaps-remediate-1-1-log.md` repaired the `.bkit/instructions.md` mirror drift that failed the group gate.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-2-1.md`: Group 2, PASS, tasks 3 and 4.
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-holistic-1-1.md`: Holistic, PASS, tasks 1 to 4 (2 of 2 groups, before the challenge added group 3).
- `docs/plans/202611/logs/992-ledger-commands-six/build-plan-verify-3-1.md`: Group 3, PASS, task 5.

## Notes

- TASK 1 satisfied: `decodeCursor` requires `o >= 0`; `a negative --cursor offset is refused` asserts exit 2, a cursor error, no rows, and an empty page for an offset beyond the end.
- TASK 2 satisfied: `ledgerEffect` in `.bkit/core/engine/ledgers/status.ts` returns offset and bytes from the receipt and the block from the intent, or from an old receipt's `detail.block`; the receipt writes `detail: { offset, bytes }` only; `the row block is stored once per operation`, `a replayed operation whose rows are gone is not reported as recorded` and `returns durable append receipt and permits a deliberate same-key update` pass. The replay check that TASK 2 placed at the stored offset is now TASK 5's anywhere-in-file check, as decision record `build-decision-1-1.md` directs.
- TASK 3 satisfied: `correctionBook` creates the file with `{ mode: 0o600 }`; `the correction-events file has mode 0600` passes.
- TASK 4 satisfied: `commitBookkeeping` excludes `**/*.bkit-lock` after `...specs`; `bookPathspecs` is unchanged; `*.bkit-lock` is in `.bkit/shared/gitignore:46` and in the bkit-managed block of `.gitignore:56`, and `.bkit/version` carries the new `.gitignore` hash; `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit` passes. No `*.bkit-lock` file is tracked.
- TASK 5 satisfied: the replay returns the stored receipt with `replayed: true` when the block is anywhere in the file; a missing block still throws `EXIT_STAGE` before any write, with the message "was recorded earlier, but {file} no longer holds its rows; do not retry it under a new operation id". Compact, harvest and the receipt lookup are unchanged, and no row-key matching was added. `docs/architecture.md:220` and `.bkit/core/.bkit/jsonl.md:62` (and the installed mirror `.bkit/jsonl.md`) carry the new wording. Decision record `build-decision-1-1.md` (Decision: Fix now, given under the owner's instruction) sets this remedy; it accepts no gap.
- Item 6 needs no task: the row `992-worktree-fingerprint-stays-plain-hash` exists once in `docs/decisions.jsonl`.
- Tests: `pnpm exec vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/ledgers/status.test.ts` passed 136 of 136. `pnpm exec tsc --noEmit -p .` exits 0. The full suite is left to the holistic gate, per `.agents/rules.md` section Local tests first; `build-holistic-gate-1-1.md` (before group 3) ended "every stage passed".
- Derived Test Matrix: all seven rows are named in their task's `DONE WHEN` or `TEST FIRST`, and each exists as a plain `it(...)` test with no skip.
- Test-first audits: `build-tests-green-3-1.md` reports `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven, both TASK 5 tests red then green; the group 1 and group 2 audits reported the same per their verify reports. No `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` entries.
- Documentation Updates: both rows are done. `dist/commands/workflow/ledgers.js` and `dist/ledgers/status.js` carry every engine change.
- Out of scope, not a gap: `.bkit/friction.jsonl` carries orchestrator friction rows, and `DETAILS.md` and `docs/capabilities.md` carry Graphify count refreshes. The pre-existing items `build-challenge-2.md` proposed separately (no slug check on `--fid`, `invocation-context` dir mode) sit outside this plan.

## Identified Gaps Log

None
