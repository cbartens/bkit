Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 4, 5
Loosened: none
Fingerprint: e2c9db6798cbe5bd57bf241f0c81261cb8205f7c1cb727675f2aec960dbd9442
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 4 satisfied. `locateCi` in `.bkit/core/engine/commands/workflow/runs.ts:514` saves `failedJobCount: Math.max(1, mapped.length)` only when a job failed, where `mapped` already leaves out `bkit-tests-check`. The `--evidence-file` jobs go through the same `failedJobs` / `mapped` filter. `validateCiSelection` refuses 0, -1 and 1.5; `ciSelectionIdentity` is unchanged. The four `runs.test.ts` tests and the `status.test.ts` test pass.
- TASK 5 satisfied. `testRunProblem` accepts a CI row whose `failures` is `null` or a positive whole number; the `tests run` CI branch writes `selection.failedJobCount ?? null` to the row and the output; the output help names the CI case. The `tests.test.ts`, `telemetry.test.ts` and `status-holes.test.ts` tests pass. Tasks 5 and 6 code landed in the same commit (`6278bd1e7`).
- TASK 6 not satisfied. The `steps finish` change and its `steps.test.ts` test pass, but the DONE WHEN integration test fails (see the gap). Rerun here: `pnpm vitest run .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` gives 1 failed, 7 passed, same `failures: 0` vs `null` diff as the test-first audit. The fault is in the test, not the code: `tests run` records 0 on a PASS by contract, and the test's second round passes.
- Checks run: the seven unit files (`status`, `runs`, `tests`, `telemetry`, `status-holes`, `steps`, `counters`) pass, 958 tests; `pnpm bkit:check:dist` exits 0.
- Test-first audit: one gap (Task 6 `not-green`, engine `Fixable: true`), logged below. `Unproven`: 0. No `Updated tests` section.
- Already landed: Task 4 `.bkit/core/engine/commands/workflow/runs.test.ts` `saves no failed job count when no job failed` passed at red; the tests step's reason: the old `locateCi` saved no `failedJobCount` at all, so absence already held.
- The execute step edited two planned test files without loosening any expectation: in `.bkit/core/engine/ledgers/status.test.ts` it merged the tests step's separate `describe("CI evidence selection contract > failedJobCount")` into the parent `describe`, so the test's full name now matches the plan's TEST FIRST name; in `.bkit/core/engine/commands/workflow/steps.test.ts` it widened the fixture's `failures: null` to `null as number | null` so the new test can set 2. No gap.
- `docs/testing.md` § Debug CI evidence verification and `docs/observability.md` read; this group adds no new error path or log line.
- No `build-decision-*.md` or earlier group 2 verify or remediation records exist.

## Identified Gaps Log

1 gap.

TASK 6: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown` — not-green: the test's second round is a passing local gate (remediate writes `source.txt` = `fixed` and the test sets `control.local = true`, so `gate.cjs` exits 0), and a PASS records `failures: 0` by the `tests run` contract, so `expect(local).toMatchObject({ code: 0, json: { source: "local", failures: null } })` at line 391 can never hold; the round must be a failing local gate with no JUnit report (exit 1, `failures: null`) for `counts: "2 → ?"` and `trend: "unknown"` to be tested — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: integration test expects failures null on a passing local round; make the second round a failing local gate with no JUnit report
  **Severity:** HIGH · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts:391` · **Round:** 1
  - **DONE WHEN:** the integration test replays Step 3 twice with the capstone failed, runs the Loop Question counters progress, sees the CI round failures without the capstone, counts: "2 → ?" and trend: "unknown", and passes
  - **TEST FIRST:**
    - .bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts > Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown
<!-- bkit:task 1 end -->
