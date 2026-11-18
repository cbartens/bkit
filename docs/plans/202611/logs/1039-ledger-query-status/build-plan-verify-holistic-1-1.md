Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: a24cced24be6c07999785fbd4db53adc0638bc209d2dba18c7de7f7a863dc66a
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has one group).

## Integration Gaps

0. The plan has one group. Across its three tasks, `defaultStatus` is exported once from `.bkit/core/engine/ledgers/telemetry.ts` and imported by `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts` and `hasUnsharedFriction` in `.bkit/core/engine/checks/tips/detect.ts`; `queryLedger` uses it in the same file. `dist/ledgers/telemetry.js`, `dist/commands/workflow/ledgers.js` and `dist/checks/tips/detect.js` carry the same change. The docs (Task 3) state the same default the code applies.

## Previously Attempted

- `docs/plans/202611/logs/1039-ledger-query-status/build-plan-verify-1-1.md`: group 1, CONCERNS, 2 Fixable: true gaps (two missing guard tests).
- `docs/plans/202611/logs/1039-ledger-query-status/build-plan-gaps-remediate-1-1-log.md`: PASS, both gaps fixed.
- `docs/plans/202611/logs/1039-ledger-query-status/build-plan-verify-1-2.md`: group 1, PASS, tasks 1, 2, 3.
- This is the first holistic attempt.

## Notes

- Judged against `tmp/bkit-diff-1039-ledger-query-status.md`, which matches `git diff` from the `dev` merge-base to HEAD outside `docs/plans/` (14 files). No decision records and no test-first audit report were supplied, so Step 8 had nothing to decide.
- TASK 1: satisfied. `defaultStatus` is exported beside `SEVERITY_KINDS`; `queryLedger` filters on `e.status ?? defaultStatus(String(e.kind))`; `DEFAULT_ACTIVE_KINDS` is gone from `.bkit/core/engine`, `dist/` and `docs/` (only plan logs still name it). All four Task 1 tests exist (Derived Test Matrix rows 1-4), including the guard test `a status-less winner whose newer row is CLOSED does not match OPEN`.
- TASK 2: satisfied. `appendLedgerRows` fills `status: "OPEN"` only when `defaultStatus(...) === "OPEN"`, and `SEVERITY_KINDS` is no longer imported in `ledgers.ts`. `hasUnsharedFriction` uses `defaultStatus("friction")`. The append-status tests near `ledgers.test.ts` lines 1426 and 1439 are untouched. `detect.test.ts` has `hasUnsharedFriction counts a friction winner with no status` (row 5). Its fixture writes no `package.json` and no `scope`, unlike the DONE WHEN wording. The function sees the same input either way (no bkit package, scope not `consumer`), so this is not a gap, as in verify 1-2.
- TASK 3: satisfied. `.bkit/core/.bkit/jsonl.md` and the rendered `.bkit/jsonl.md` state the severity-kind `OPEN` read default in § Read Idiom **Filters** and § Updating a Row, and `.bkit/version` carries the new hash. The `docs/testing.md` Key test files row adds the `query --status=OPEN` case. Both `Documentation Updates` rows are done.
- Ran `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/checks/tips/detect.test.ts`: 3 files and 463 tests passed, none skipped. `npx tsc --noEmit -p .` exited 0.
- Advisory Manual Verification check: `node dist/cli.js ledgers query --ledger=deferrals --status=OPEN --limit=1000` returned 188 rows, 96 of them with a `status`. The 92 status-less winners print as stored. The plan's 179-versus-95 figure predates later ledger growth.
- `docs/observability.md` is present. The change adds no error path, so no logging is needed.
- The `.bkit/friction.jsonl` row in the diff is an orchestrator friction entry outside the tasks.

## Identified Gaps Log

None.
