Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: 45d409526277915a6567799e1bccc97906e8071f3a1706d6b737897e4a501cc8
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md` (CONCERNS, 1 gap): the hook-timeout floor also lifted the test-body limit. `build-plan-gaps-remediate-3-1-log.md` applied the floor only when the stack showed `callSuiteHook` and tightened the Task 2 integration bound from 20_000 to 9_000 ms.
- `build-plan-verify-3-2.md` (CONCERNS, 1 gap): beforeEach time still came off the body limit, and async each-hooks lost the floor after an `await`. `build-plan-gaps-remediate-3-2-log.md` switched to reading `task.result.hooks`, started the body limit at the body's first child call, and added the async `afterEach` and slow `beforeEach` integration tests.

## Notes

- Task 6 is satisfied: `vitest.child-deadline.ts` injects `killSignal: "SIGKILL"` with every injected `timeout`, keeps a caller-set `killSignal` (`existing.killSignal ?? "SIGKILL"`), and passes a caller-set `timeout` through untouched. `stops a child that ignores SIGTERM at the remaining time` passed in 303 ms in this verify run.
- The attempt-2 gap is closed. Vitest sets `task.result.hooks[name]` to "run" before a suite level's each-hooks and to "pass" after them (`updateSuiteHookState` in `node_modules/vitest/dist/chunks/run.BPv-BBRv.js:3552-3614`), so the state holds across an `await`. All four integration tests passed: Task 2 (5855 ms), the Task 7 named test (6867 ms), the async `afterEach` test (6881 ms) and the slow `beforeEach` test (7815 ms). A scratch nested-`describe` probe (a 6 s `beforeEach` child and an async `afterEach` child after a 4 s body) also passed.
- Task 7 stays off the `Tasks` line because the new body-limit start point breaks Task 2's DONE WHEN for a body that does other work before its first child call. See the gap below. The scratch probes are in `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/92d64bcb-1d06-4182-abc1-0516de052020/scratchpad/probe3/`.
- Test-first audit `build-tests-green-3-3.md`: `Enforced: true`, 0 gaps, 0 unproven tests, and no updated or already-landed tests.
- There are no decision records (`build-decision-*.md`) and no `build-plan-current.md`. The brief has no `Deviations` section.
- The Derived Test Matrix rows for Tasks 6 and 7 are each named in their task's `TEST FIRST`. The plan has no `Documentation Updates` section.
- `docs/observability.md` does not apply: the change touches only bkit-only test harness files and adds no runtime error path.
- The `docs/deferrals.jsonl` rows in the diff are the challenge's LOW findings. They count toward no task.
- This verify ran only the two task test files (9 tests, all passed). The remediation log reports the group gate green.

## Identified Gaps Log

1 gap.

TASK 7: `vitest.setup.ts:138` — the body child limit is counted from the body's first child call (`bodyDeadline ??= Date.now() + limit`), not from body start, so any body time before the first child call (an `await`, sync work, fixture setup) is added on top of the test's timeout, which breaks Task 2's DONE WHEN ("a Vitest test whose `spawnSync` child hangs fails within its `timeout`"). Scratch repro (CI=1, testTimeout 5000, hookTimeout 10000, repo `vitest.setup.ts`): a body that awaits a 3000 ms `setTimeout` and then runs `spawnSync("sleep", ["30"])` fails at 8004 ms with `sleep 30 did not finish within 5000 ms (the running test's remaining time)`, though only about 2000 ms of the test's time was left; the Group 1 code stopped the same child at about 5000 ms. Done when: a test-body child call gets the test's timeout measured from body start (the end of the last `beforeEach` hook, for example by timestamping the `task.result.hooks.beforeEach` change to "pass", or from Vitest's own test deadline), so beforeEach time is excluded and earlier body time is not; the error's limit matches the time the test actually had left; `docs/testing.md` § Time limits and the `vitest.setup.ts` comment stop saying "counted from the body's first child call"; and `vitest-child-deadline.integration.test.ts` covers a body that awaits before a hung child and asserts the nested run ends below the test timeout plus a margin. — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Task 7: body child limit counted from the first child call, so earlier body time is added on top of the test timeout
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:138` · **Round:** 1
  - **DONE WHEN:** a test-body child call gets the test's timeout measured from body start (the end of the last `beforeEach` hook, for example by timestamping the `task.result.hooks.beforeEach` change to "pass", or from Vitest's own test deadline), so beforeEach time is excluded and earlier body time is not; the error's limit matches the time the test actually had left; `docs/testing.md` § Time limits and the `vitest.setup.ts` comment stop saying "counted from the body's first child call"; and `vitest-child-deadline.integration.test.ts` covers a body that awaits before a hung child and asserts the nested run ends below the test timeout plus a margin.
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
<!-- bkit:task 1 end -->
