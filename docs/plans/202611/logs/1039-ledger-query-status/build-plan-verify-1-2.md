Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 3664da55770e07d0a080291aee3882b53d73ac3117b18fe3ccab2182ae24702d
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/1039-ledger-query-status/build-plan-verify-1-1.md`: CONCERNS, 2 Fixable: true gaps (TASK 1 guard test `a status-less winner whose newer row is CLOSED does not match OPEN` missing; TASK 2 `describe("hasUnsharedFriction")` guard test missing in `detect.test.ts`).
- `docs/plans/202611/logs/1039-ledger-query-status/build-plan-gaps-remediate-1-1-log.md`: PASS, both gaps reported fixed.

## Notes

- Judged against `build-diff-1-2.md` (changes since group 1 started). The brief has no `Deviations` section; no decision records exist for this build.
- Test-first audit `build-tests-green-1-2.md`: `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven; no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections. The three TEST FIRST tests of TASK 1 went red, then green.
- Both attempt-1 gaps are closed. `.bkit/core/engine/ledgers/telemetry.test.ts` now has `a status-less winner whose newer row is CLOSED does not match OPEN` (Derived Test Matrix row 2). `.bkit/core/engine/checks/tips/detect.test.ts` imports `hasUnsharedFriction` and has `describe("hasUnsharedFriction")` with `hasUnsharedFriction counts a friction winner with no status` (row 5), plus a TRIAGED-winner case.
- TASK 2 fixture detail: the DONE WHEN describes the guard test as writing a non-bkit `package.json` and a `scope: "universal"` row. The test writes neither. That is the same input to `hasUnsharedFriction`: a missing `package.json` is not the bkit package, and a missing `scope` is not `consumer`. The asserted behaviour (a status-less friction winner counts) matches, so this is not logged as a gap.
- TASK 1: `defaultStatus` is exported beside `SEVERITY_KINDS` in `.bkit/core/engine/ledgers/telemetry.ts`; `queryLedger` uses `e.status ?? defaultStatus(String(e.kind))`; `DEFAULT_ACTIVE_KINDS` is gone from `.bkit/core/engine` and `dist/`; `dist/` carries the change.
- TASK 2: `appendLedgerRows` fills `status: "OPEN"` only when `defaultStatus(...) === "OPEN"` and no longer imports `SEVERITY_KINDS`; `hasUnsharedFriction` uses `defaultStatus("friction")`; the append-status tests near `ledgers.test.ts` lines 1426 and 1439 are unchanged.
- TASK 3: `.bkit/core/.bkit/jsonl.md` and the rendered `.bkit/jsonl.md` state the severity-kind `OPEN` read default in § Read Idiom **Filters** and § Updating a Row; `.bkit/version` carries the new hash; the `docs/testing.md` Key test files row adds the `query --status=OPEN` case. Both `Documentation Updates` rows are done.
- Ran `pnpm vitest run .bkit/core/engine/ledgers/telemetry.test.ts .bkit/core/engine/commands/workflow/ledgers.test.ts .bkit/core/engine/checks/tips/detect.test.ts` at load average 13.9: 3 files, 463 tests passed.
- `docs/observability.md`: the change adds no error path, so no logging is required.
- The group diff also carries one orchestrator `friction` row in `.bkit/friction.jsonl`, which is outside the tasks.

## Identified Gaps Log

None.
