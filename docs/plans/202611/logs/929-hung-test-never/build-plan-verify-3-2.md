Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 6
Loosened: none
Fingerprint: d578b2b5cfb80a457261fc748e97eddb3c85e6360a948f71496db8133a377799
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md` (CONCERNS, 1 gap): the hook-timeout floor also lifted the test-body limit. `build-plan-gaps-remediate-3-1-log.md` fixed it by applying the floor only when the stack shows `callSuiteHook`, and tightened the Task 2 integration bound from 20_000 to 9_000 ms.

## Notes

- Task 6 is satisfied: `vitest.child-deadline.ts` injects `killSignal: "SIGKILL"` with every injected `timeout`, keeps a caller-set `killSignal` (`existing.killSignal ?? "SIGKILL"`), and passes a caller-set `timeout` through untouched. `stops a child that ignores SIGTERM at the remaining time` passed in 303 ms in this verify run.
- The attempt-1 gap is closed: the Task 2 integration test `fails a test whose spawnSync child hangs within the test's own timeout` passed in 5325 ms against its 9_000 ms bound, so a body call is again stopped at the test's own timeout.
- Task 7 stays off the `Tasks` line. Its named test passed in 6284 ms, but two scratch nested runs (files under `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/92d64bcb-1d06-4182-abc1-0516de052020/scratchpad/hookprobe/`, using the repo's `vitest.setup.ts`, CI=1) show that both halves of its DONE WHEN fail outside the synchronous case. See the gap below.
- The Task 2 bound change (20_000 to 9_000 ms) tightens an expectation, so it is not a loosened test. The test-first audit `build-tests-green-3-2.md` reports `Enforced: true`, 0 gaps and 0 unproven tests, and lists no updated or already-landed tests.
- There are no decision records (`build-decision-*.md`) and no `build-plan-current.md`.
- Derived Test Matrix rows for Tasks 6 and 7 are each named in their task's `TEST FIRST`. The plan has no `Documentation Updates` section. The `docs/testing.md` § Time limits text matches the intended behaviour. Once the Task 7 gap is closed it will also match the code.
- `docs/observability.md` does not apply: the change touches only bkit-only test harness files and adds no runtime error path.
- The `docs/deferrals.jsonl` rows in the diff are the challenge's LOW findings. They count toward no task.
- The remediation log reports the group gate green (53 files, 3729 tests). This verify reran only the two task test files, and all 7 tests passed.

## Identified Gaps Log

1 gap.

TASK 7: `vitest.setup.ts:113-134` — two halves of the DONE WHEN do not hold. (a) "time spent in `beforeEach` hooks is not subtracted from the test body's child limit": `testDeadline` is still set in the setup file's `beforeEach`, which runs before the test file's own `beforeEach` hooks, and a body call now gets `testDeadline - Date.now()` with no floor, so beforeEach time comes off the body's limit, while Vitest's own test timeout starts at the body (`withTimeout` on the test fn, after `callSuiteHook(..., "beforeEach")` at `run.BPv-BBRv.js:3899`). Scratch repro (CI=1, 5000/10000 ms): a file `beforeEach` that waits 4s, then a body `spawnSync("sleep", ["3"])`, throws `sleep 3 did not finish within 991 ms (the running test's remaining time)`. (b) "a child call inside a test file's own `beforeEach` or `afterEach` hook gets no less than the file's `hookTimeout`" fails for an async hook after its first `await`: `inEachHook()` looks for `callSuiteHook` in the stack, but Vitest runs hooks through `limitConcurrency`, which chains the hook promise with `.finally` (`run.BPv-BBRv.js:1353`), so the async stack drops `callSuiteHook` after an `await`. Scratch repro: a 4s body, then `afterEach(async () => { await new Promise((r) => setTimeout(r, 10)); spawnSync("sleep", ["2"]); })` throws `sleep 2 did not finish within 980 ms`. The comment at `vitest.setup.ts:121-122` ("also across an `await`") is wrong. The named test `gives a file's afterEach child call the hook timeout after a test that used most of its time` passes because its hook is synchronous. Done when: a body child call gets the test's timeout measured from body start (beforeEach time excluded); an each-hook child call, sync or async after an `await`, gets no less than `hookTimeout` (for example by reading the hook state Vitest records on `test.result.hooks` through `updateSuiteHookState` instead of the stack); and the integration test file covers both an async `afterEach` and a slow `beforeEach`. — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Task 7: body child limit still loses beforeEach time, and async each-hooks lose the hook-timeout floor after an await
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:113` · **Round:** 1
  - **DONE WHEN:** a body child call gets the test timeout measured from body start (beforeEach time excluded); an each-hook child call, sync or async after an await, gets no less than hookTimeout (for example by reading test.result.hooks state that Vitest records via updateSuiteHookState instead of the stack); the integration test file covers an async afterEach and a slow beforeEach
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts
<!-- bkit:task 1 end -->
