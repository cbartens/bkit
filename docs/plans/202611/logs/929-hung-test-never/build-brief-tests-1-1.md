# Brief: group 1 — Time limit for synchronous child calls in Vitest workers (tests)

Plan: Time limits for hung tests Implementation Plan

## Why and what

### Context & Goals

Every test runner bkit uses on itself gets a time limit that holds when a test waits on a child process, so a hang becomes a named failing test, the gate exits red and the machine-wide tests lock frees (#929).

## Where it fits

- Group 1: Time limit for synchronous child calls in Vitest workers — this group
  - TASK 1: Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout` — open
  - TASK 2: Install the wrapper in every Vitest worker — open
- Group 2: Time limits for node --test and bats runs — next
  - TASK 3: One source for the `node --test` and bats limits, derived from the integration budget — open
  - TASK 4: Apply the limits in every runner bkit uses on itself — open
  - TASK 5: Document the limits — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout`
  - **CREATE:** `vitest.child-deadline.ts`: `withChildDeadline(childProcess, remainingMs)` wraps the three functions on the given module object; when `options.timeout` is absent it sets `timeout` to `Math.max(1, remainingMs())`; when that injected limit produces `ETIMEDOUT` it throws an `Error` naming the command, its arguments and the limit in ms; an explicit `timeout` is passed through untouched and `spawnSync` keeps returning its result
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts`: unit tests for the wrapper
  - **READ:** `vitest.timeout-budget.ts`: `tierTimeouts`, the budget the limit derives from
  - **READ:** `scripts/ci/bkit-test-awake.mjs`: header style for bkit-only scripts
  - **DONE WHEN:** the four unit tests pass and `withChildDeadline` has no dependency on vitest
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` `stops a spawnSync with no timeout at the remaining time and names it` fails on the call blocking for the full `sleep 30`
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` `leaves an explicit timeout as the caller set it` fails on the result being thrown instead of returned
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` `limits execSync and execFileSync the same way` fails on either call blocking for the full `sleep 30`
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` `uses at least 1ms when the limit has already passed` fails on `timeout: 0` meaning no limit

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Install the wrapper in every Vitest worker
  - **UPDATE:** `vitest.setup.ts`: apply `withChildDeadline` to `node:child_process` and call `syncBuiltinESMExports()` so named ESM imports see it; record the deadline in `beforeEach((ctx) => …)` from `ctx.task.timeout`, clear it in `afterEach`; with no current test, the remaining time is the file's `hookTimeout` from the `tierTimeouts` read already there; add the job to the file's header list
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`: nested vitest run with a hanging `spawnSync` child
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: existing `syncBuiltinESMExports` use
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a Vitest test whose `spawnSync` child hangs fails within its `timeout` and names the command
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `fails a test whose spawnSync child hangs within the test's own timeout` fails on the nested vitest run not ending before the outer limit

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a `spawnSync` with no `timeout` is stopped at the remaining time and throws naming the command and limit | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| an explicit `timeout` passes through and a timed-out result is returned, not thrown | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| `execSync` and `execFileSync` with no `timeout` get the remaining time and throw naming the command | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| with no current test the hook limit is used, and an expired limit becomes 1ms | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| a Vitest test whose `spawnSync` child hangs fails within its own `timeout` | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 2 |
