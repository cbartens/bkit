# Brief: group 3 — Challenge round 1 findings (tests)

Plan: Time limits for hung tests Implementation Plan

## Why and what

### Context & Goals

Every test runner bkit uses on itself gets a time limit that holds when a test waits on a child process, so a hang becomes a named failing test, the gate exits red and the machine-wide tests lock frees (#929).

## Where it fits

- Group 1: Time limit for synchronous child calls in Vitest workers — done
  - TASK 1: Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout` — done
  - TASK 2: Install the wrapper in every Vitest worker — done
- Group 2: Time limits for node --test and bats runs — done
  - TASK 3: One source for the `node --test` and bats limits, derived from the integration budget — done
  - TASK 4: Apply the limits in every runner bkit uses on itself — done
  - TASK 5: Document the limits — done
- Group 3: Challenge round 1 findings — this group
  - TASK 6: A test whose child traps or ignores SIGTERM (the `scripts/ci/bkit-machine-lock.sh run` owner, or `sh -c "trap '' TERM; ..."`) still blocks the worker for the child's full run, because the injected limit only sends the default SIGTERM — open
  - TASK 7: A test that uses most of its budget, followed by a file-level or `describe`-level `afterEach` that cleans up with `execFileSync` (for example `git worktree remove`), has the cleanup killed after a few ms; the passing test is reported failed and the cleanup is skipped — open

## The work

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A test whose child traps or ignores SIGTERM (the `scripts/ci/bkit-machine-lock.sh run` owner, or `sh -c "trap '' TERM; ..."`) still blocks the worker for the child's full run, because the injected limit only sends the default SIGTERM
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.child-deadline.ts:42` · **Round:** 1
  - **DONE WHEN:** when the wrapper injects `timeout` (caller set none), it also injects `killSignal: "SIGKILL"` unless the caller set `killSignal`, so a child that traps or ignores SIGTERM ends at the remaining time and the call throws naming the command and limit; a caller-set `timeout` or `killSignal` is passed through untouched.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` `stops a child that ignores SIGTERM at the remaining time` fails on `wrapped(() => 300).spawnSync("sh", ["-c", "trap '' TERM; sleep 30"])` blocking for the full 30s (verified with Node v24.16.0: `spawnSync("sh", ["-c", "trap \"\" TERM; sleep 4"], { timeout: 300 })` returns after 4.07s with `ETIMEDOUT`), so the elapsed `< 10_000` assertion fails
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A test that uses most of its budget, followed by a file-level or `describe`-level `afterEach` that cleans up with `execFileSync` (for example `git worktree remove`), has the cleanup killed after a few ms; the passing test is reported failed and the cleanup is skipped
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:110` · **Round:** 1
  - **DONE WHEN:** a child call inside a test file's own `beforeEach` or `afterEach` hook gets no less than the file's `hookTimeout`, and time spent in `beforeEach` hooks is not subtracted from the test body's child limit. Today the setup file's `beforeEach` runs first (`sequence.hooks: "stack"`, file suite before nested suites) and its clearing `afterEach` runs after every `afterEach` the test file registers (reverse order), so every other each-hook runs against the test deadline; 92 engine test files pair each-hooks with sync child calls.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `gives a file's afterEach child call the hook timeout after a test that used most of its time` fails on the nested run (CI=1, unit budget 5000 ms test / 10000 ms hook) exiting non-zero: the test body waits 4s with `Atomics.wait`, then the file's `afterEach` runs `spawnSync("sleep", ["2"])`, gets about 1000 ms and throws `did not finish within`
<!-- bkit:task 7 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a `spawnSync` with no `timeout` is stopped at the remaining time and throws naming the command and limit | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| an explicit `timeout` passes through and a timed-out result is returned, not thrown | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| `execSync` and `execFileSync` with no `timeout` get the remaining time and throw naming the command | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| with no current test the hook limit is used, and an expired limit becomes 1ms | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| a Vitest test whose `spawnSync` child hangs fails within its own `timeout` | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 2 |
| stops a child that ignores SIGTERM at the remaining time | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 6 |
| gives a file's afterEach child call the hook timeout after a test that used most of its time | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 7 |
