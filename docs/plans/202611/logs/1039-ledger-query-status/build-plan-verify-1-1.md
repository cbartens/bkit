Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 3
Loosened: none
Fingerprint: bb71eca851e8b7f064b6394aacaa7d3e94ab13f9d167f986433f09811cdfe888
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-1-1.md` (changes since group 1 started). No brief has a `Deviations` section; no decision records, earlier verify reports or remediation logs exist for group 1.
- Test-first audit `build-tests-green-1-1.md`: `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven; no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections. All three TEST FIRST tests of TASK 1 went red, then green.
- TASK 1: `defaultStatus` is exported beside `SEVERITY_KINDS` in `.bkit/core/engine/ledgers/telemetry.ts`; `queryLedger` uses `e.status ?? defaultStatus(String(e.kind))`; `DEFAULT_ACTIVE_KINDS` is gone from `.bkit/core/engine` and `dist/`; `dist/` is rebuilt and committed. Not satisfied: the DONE WHEN guard test `a status-less winner whose newer row is CLOSED does not match OPEN` (Derived Test Matrix row 2) does not exist.
- TASK 2: `appendLedgerRows` fills `status: "OPEN"` only when `defaultStatus(...) === "OPEN"`, the `SEVERITY_KINDS` import is dropped, and `hasUnsharedFriction` uses `defaultStatus("friction")`; the append-status tests near `ledgers.test.ts` lines 1426 and 1439 are unchanged. Not satisfied: `.bkit/core/engine/checks/tips/detect.test.ts` was not touched, so the `describe("hasUnsharedFriction")` guard test (UPDATE field, DONE WHEN, Derived Test Matrix row 5) is missing.
- TASK 3: satisfied. `.bkit/core/.bkit/jsonl.md` § Read Idiom **Filters** and § Updating a Row state the severity-kind `OPEN` read default; the rendered `.bkit/jsonl.md` matches its source apart from the managed header, and `.bkit/version` carries the new hash; the `docs/testing.md` Key test files row adds the `query --status=OPEN` case. Both `Documentation Updates` rows are done.
- `docs/observability.md`: the change adds no error path, so no logging is required.
- The two DONE WHEN vitest runs were not re-run here: load average was 36 from parallel builds. The three new tests' pass comes from the test-first audit; the full-file runs are left to the group gate.

## Identified Gaps Log

2 gaps.

TASK 1: `.bkit/core/engine/ledgers/telemetry.test.ts` `a status-less winner whose newer row is CLOSED does not match OPEN` — missing-test: the guard test named in DONE WHEN and Derived Test Matrix row 2 does not exist; no file in the group diff adds it — Fixable: true
TASK 2: `.bkit/core/engine/checks/tips/detect.test.ts` `hasUnsharedFriction counts a friction winner with no status` — missing-test: detect.test.ts is not in the group diff; it neither imports `hasUnsharedFriction` nor has the `describe("hasUnsharedFriction")` guard test named in UPDATE, DONE WHEN and Derived Test Matrix row 5 — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 1: DONE WHEN guard test missing (Derived Test Matrix row 2)
  **Severity:** MEDIUM · **Class:** missing-test · **Fixable:** true · **Location:** `.bkit/core/engine/ledgers/telemetry.test.ts:3114` · **Round:** 1
  - **DONE WHEN:** telemetry.test.ts has the guard test `a status-less winner whose newer row is CLOSED does not match OPEN` and it passes
  - **TEST FIRST:**
    - .bkit/core/engine/ledgers/telemetry.test.ts a status-less winner whose newer row is CLOSED does not match OPEN
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 2: hasUnsharedFriction guard test missing (Derived Test Matrix row 5)
  **Severity:** MEDIUM · **Class:** missing-test · **Fixable:** true · **Location:** `.bkit/core/engine/checks/tips/detect.test.ts:5` · **Round:** 1
  - **DONE WHEN:** detect.test.ts imports hasUnsharedFriction and has describe("hasUnsharedFriction") with `hasUnsharedFriction counts a friction winner with no status`, which passes
  - **TEST FIRST:**
    - .bkit/core/engine/checks/tips/detect.test.ts hasUnsharedFriction counts a friction winner with no status
<!-- bkit:task 2 end -->
