Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 3, 4

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 2`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-2-1.md` (group diff); plan currency `PASS`, `Affected: 0`; no `build-plan-gaps-remediate-2-*` log; the only decision record, `build-decision-1-1.md`, covers group 1 and accepts no group 2 gap.
- Rerun: `journal.test.ts`, `journal.integration.test.ts`, `commands/lib.test.ts` and `scripts/harvest/ledgers.integration.test.ts` give 4 files and 102 tests green, including every planned `TEST FIRST` test and the existing harvest pruning cases; `pnpm bkit check` exits 0.
- TASK 3 satisfied: `ledgers/journal.ts` exists with all seven exports; there is no `commands/**` import; the friction row passes `validate` and `writerProblem`; `journalEnabled` is off only for `off`; `frictionKey`'s comment states the ~68-char bound (`KEY_LIMIT = 60`); `.bkit/jsonl.md` differs from `.bkit/core/.bkit/jsonl.md` only on the managed-marker line (line 3); `docs/architecture.md` places `journal.ts` in the tree. Deviation, not a gap: `journal.ts` also imports `../shared/json.js` beyond the CREATE line's import list; that is a shared leaf (`status.ts` imports it too), and DONE WHEN only bars the `commands/` layer. Weak test, not a gap: `writes no row when BKIT_ENGINE_JOURNAL is off` asserts only `journalEnabled`'s return value. The seam's `off` behaviour comes from `engineJournal` checking `journalEnabled()` in `call` and `failure`, which no test drives with `off`.
- TASK 4 satisfied: `runCommand` takes an injectable `journal`, builds the exclusion set from `SHARED_EXIT_CODES` and `spec.exitCodes`, journals inside try/finally, and logs one `[bkit-telemetry] journal write failed` line; `resolveActiveRun` is exported and imports only `../ledgers/status.js` / `journal.js` / `telemetry.js` / `../shared/json.js`. The integration cases assert the worktree's `.bkit/friction.jsonl` bytes, that the main checkout's file is absent, and that no row is written with no active run; exit-code passthrough passes; `dist/` is updated in the diff.
- TASK 5 not satisfied: the work meets DONE WHEN (a real `tsx cli.ts` child process, a seam-written row, real `ledgers commit`, `runHarvest`, the harvested row matching on `key`, pruning cases green), but test-first audit `build-tests-green-2-1.md` records `no-red`, `Fixable: false`. The step 8 override does not apply: plan currency does not classify TASK 5 `Broken`, and the execute log records `BLOCKED`, not `DONE — TASK 5: already landed`. Only the owner can accept a missing red. Side note: the test forces its undeclared exit through a raw `EISDIR` throw in `ledgers check --plan=<dir>`, so a later fix to that verb would break this test's trigger.
- Errors are logged on the `[bkit-telemetry]` prefix per `docs/observability.md` § prefixes; documenting the new log line is TASK 14 (group 7).

## Identified Gaps Log

1. TASK 5: `scripts/harvest/ledgers.integration.test.ts` `keeps a seam-written tool-failure row through commit and harvest` — no-red — Fixable: false
