Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: 42606420e82adf3e534b025ab2f51328dcd3bdff75c34cbf76dd43c838ad1285
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

- Task 6 is satisfied: `vitest.child-deadline.ts:42-50` injects `killSignal: "SIGKILL"` with every injected `timeout`, keeps a caller-set `killSignal` through `existing.killSignal ?? "SIGKILL"`, and line 38 still passes a caller-set `timeout` through untouched. `stops a child that ignores SIGTERM at the remaining time` passed in 304 ms in this verify run.
- Task 7's own DONE WHEN holds, and its test passed in 6529 ms. The floor that makes it hold also covers the test body, so the body's limit is always the hook timeout. That breaks Task 2's DONE WHEN, so Task 7 stays off the `Tasks` line (see the gap below).
- The test-first audit (`build-tests-green-3-1.md`) reports `Enforced: true`, 0 gaps, 0 unproven tests, no updated tests and no already-landed tests.
- There are no decision records and no earlier verify or remediate reports for group 3.
- `docs/testing.md` § Time limits describes the new SIGKILL and hook-floor behaviour accurately. The plan has no `Documentation Updates` section.
- `docs/observability.md` does not apply: the change touches only bkit-only test harness files and adds no runtime error path.
- The `docs/deferrals.jsonl` rows the diff adds are the challenge's LOW findings. They do not count toward any task.

## Identified Gaps Log

1 gap.

TASK 7: `vitest.setup.ts:120` — the floor `Math.max(hookTimeout, testDeadline - Date.now())` also applies to the test body, and `hookTimeout` is never below `testTimeout` (unit 10000 vs 5000, integration 30000 vs 30000, both scaled by the same factor), so every child call in a test body now gets the hook timeout instead of the test's remaining time. A unit test whose child hangs is stopped at 10s, not at its own 5s timeout, which breaks Task 2's DONE WHEN ("fails within its `timeout`"): the Task 2 integration test `fails a test whose spawnSync child hangs within the test's own timeout` took 10622 ms in this verify run and passes only because its bound is 20_000 ms. Done when: a child call in a file's own `beforeEach` / `afterEach` gets no less than `hookTimeout`, while a child call in the test body is stopped at the test's own timeout measured from body start (for example with Vitest's `aroundEach`, which `node_modules/vitest/dist/index.d.ts` exports), and the Task 2 integration test bounds the nested run below the hook timeout. — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Hook-timeout floor also lifts the test body limit, so a hung child in a unit test runs to the hook timeout (10s), not the test timeout (5s), breaking Task 2 DONE WHEN
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:120` · **Round:** 1
  - **DONE WHEN:** a child call in a file own beforeEach / afterEach gets no less than hookTimeout, while a child call in the test body is stopped at the test own timeout measured from body start (for example with Vitest aroundEach), and the Task 2 integration test bounds the nested run below the hook timeout
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
<!-- bkit:task 1 end -->
