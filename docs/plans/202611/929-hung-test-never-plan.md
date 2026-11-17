# Time limits for hung tests Implementation Plan

## Context & Goals

Every test runner bkit uses on itself gets a time limit that holds when a test waits on a child process, so a hang becomes a named failing test, the gate exits red and the machine-wide tests lock frees (#929).

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Path | Section used | Coverage | Gap | Action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | n/a | not applicable: only bkit-only test harness files change | none | none |
| technology | `docs/technology.md` | n/a | not applicable: no new library or convention | none | none |
| security | `docs/security.md` | n/a | not applicable: no auth, input or secret change | none | none |
| testing | `docs/testing.md` | runner bullets, test-file inventory | covers runners and inventory | lacks a time-limit bullet | Task 5 adds it |

## Documentation Warnings

```jsonl

```

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Searches run | Decision | File | Reason |
| --- | --- | --- | --- | --- |
| Time limit on synchronous child calls in Vitest workers | text search for `spawnSync`, `timeout`, `syncBuiltinESMExports` in `vitest.setup.ts`, `vitest.timeout-budget.ts`; no existing wrapper | NEW | `vitest.child-deadline.ts` | (a) no candidate wraps child_process calls; `vitest.setup.ts` only hosts the install (EXTEND) |
| Install the wrapper per worker | read `vitest.setup.ts` | EXTEND | `vitest.setup.ts` | existing setup file and budget read |
| `node --test` and bats limit values | text search for `test-timeout`, `BATS_TEST_TIMEOUT` in `scripts/`, `package.json`, `tests/shell/` | NEW | `scripts/ci/bkit-test-limits.mjs` | (a) no existing helper; extending `vitest.timeout-budget.ts` would put runner flags in the Vitest harness file |
| Apply limits in runners | read `scripts/ci/bkit-test-file.mjs`, `scripts/gate/bkit-gate-changed.mjs`, `package.json`, `tests/shell/setup_suite.bash` | EXTEND | `scripts/ci/bkit-test-file.mjs` | existing runners gain the args |
| Document limits | read `docs/testing.md` | EXTEND | `docs/testing.md` | existing runner bullets |
| Unit tests for the wrapper and limits | search for existing `*child-deadline*`, `bkit-test-limits*` tests | NEW | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | (a) no candidate test exists |
| Integration test for the wrapper | same search | NEW | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | (a) no candidate test exists |
| Unit test for limits helper | same search | NEW | `scripts/ci/bkit-test-limits.test.mjs` | (a) no candidate test exists |
| Bats hang test | search `tests/shell/` and audits for setup_suite tests | NEW | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` | (a) no candidate test exists |

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a `spawnSync` with no `timeout` is stopped at the remaining time and throws naming the command and limit | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| an explicit `timeout` passes through and a timed-out result is returned, not thrown | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| `execSync` and `execFileSync` with no `timeout` get the remaining time and throw naming the command | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| with no current test the hook limit is used, and an expired limit becomes 1ms | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 1 |
| a Vitest test whose `spawnSync` child hangs fails within its own `timeout` | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 2 |
| `nodeTestLimitArgs` gives `--test-timeout` from the integration budget plus `--test-force-exit` | Unit | `scripts/ci/bkit-test-limits.test.mjs` | 3 |
| `bkit:test:file` on a `node --test` file whose test awaits a never-exiting child exits 1 within the limit | Integration | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` | 4 |
| `bkit-gate-changed.mjs` passes the limit args to its `node --test` stage | Unit | `scripts/gate/bkit-gate-changed.test.mjs` | 4 |
| a bats test that hangs fails with `timeout after` under `tests/shell/setup_suite.bash` | Integration | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` | 4 |
| stops a child that ignores SIGTERM at the remaining time | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` | 6 |
| gives a file's afterEach child call the hook timeout after a test that used most of its time | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 7 |
| keeps the body's child limit on the real clock when the test sets a future system time | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 8 |
| stops a hung child at the test's timeout when the test sets a past system time | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` | 8 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Time limit for synchronous child calls in Vitest workers

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout`
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

- [x] **TASK 2:** Install the wrapper in every Vitest worker
  - **UPDATE:** `vitest.setup.ts`: apply `withChildDeadline` to `node:child_process` and call `syncBuiltinESMExports()` so named ESM imports see it; record the deadline in `beforeEach((ctx) => …)` from `ctx.task.timeout`, clear it in `afterEach`; with no current test, the remaining time is the file's `hookTimeout` from the `tierTimeouts` read already there; add the job to the file's header list
  - **CREATE:** `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`: nested vitest run with a hanging `spawnSync` child
  - **READ:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`: existing `syncBuiltinESMExports` use
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a Vitest test whose `spawnSync` child hangs fails within its `timeout` and names the command
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `fails a test whose spawnSync child hangs within the test's own timeout` fails on the nested vitest run not ending before the outer limit

<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Time limits for node --test and bats runs

<!-- bkit:task 3 start -->

- [x] **TASK 3:** One source for the `node --test` and bats limits, derived from the integration budget
  - **CREATE:** `scripts/ci/bkit-test-limits.mjs`: bkit-only (same header line as `scripts/ci/bkit-test-file.mjs`); `nodeTestLimitArgs()` returns `--test-timeout={ms}` and `--test-force-exit`, `{ms}` = `tierTimeouts(true).testTimeout` imported from `vitest.timeout-budget.ts`; `batsTestTimeoutSeconds()` returns the same limit in whole seconds
  - **CREATE:** `scripts/ci/bkit-test-limits.test.mjs`: unit tests for both helpers
  - **READ:** `vitest.timeout-budget.ts`: `tierTimeouts`
  - **DONE WHEN:** both helpers return the integration budget, 30s under `CI=true`
  - **TEST FIRST:**
    - `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit` fails on the module not existing
    - `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI` fails on the module not existing

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Apply the limits in every runner bkit uses on itself
  - **UPDATE:** `runNode` in `scripts/ci/bkit-test-file.mjs`: add `...nodeTestLimitArgs()`
  - **UPDATE:** `runBats` in `scripts/ci/bkit-test-file.mjs`: pass `BATS_TEST_TIMEOUT` from `batsTestTimeoutSeconds()` in the child env
  - **UPDATE:** `scripts/gate/bkit-gate-changed.mjs`: in the `named` stage add `...nodeTestLimitArgs()` to the `node --test` call and `BATS_TEST_TIMEOUT` to the bats call
  - **UPDATE:** `package.json`: the `bkit:test:awake` script runs `node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs`, so it shares `bkit:test:file`'s runner and limits
  - **UPDATE:** `setup_suite()` in `tests/shell/setup_suite.bash`: `export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEOUT:-30}"` when `CI` is set, else `180` (30s x `MAX_LOAD_FACTOR` 6), for `pnpm bkit:test:bats`, which runs no node code first
  - **UPDATE:** `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`: add the never-exiting-child case
  - **UPDATE:** `scripts/gate/bkit-gate-changed.test.mjs`: add the limit-args case
  - **CREATE:** `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`: hanging bats test under `setup_suite.bash`
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a hanging `node --test` file and a hanging bats test each fail and end their run under every entry point listed
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `node — a test awaiting a child that never exits fails within the limit` fails on the run not ending before the vitest timeout
    - `scripts/gate/bkit-gate-changed.test.mjs` `passes the limit args to the node --test stage` fails on the args missing
    - `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after` fails on the bats run not ending
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after` fails on the bats run not ending — accepted without a stated reason ("Ok accepted and finish") (owner, 2026-11-14)

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Document the limits
  - **UPDATE:** `docs/testing.md`: in the runner bullets (around lines 553-557) add a **Time limits** bullet: Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`); `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`; bats gets `BATS_TEST_TIMEOUT` from the same source or `tests/shell/setup_suite.bash`; a limit kills only the direct child
  - **UPDATE:** `docs/testing.md`: in the test-file inventory table (around line 731) add rows for `vitest-child-deadline.test.ts`, `vitest-child-deadline.integration.test.ts` and `scripts/ci/bkit-test-limits.test.mjs`
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** every file and flag named in the bullet exists as written
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** A test whose child traps or ignores SIGTERM (the `scripts/ci/bkit-machine-lock.sh run` owner, or `sh -c "trap '' TERM; ..."`) still blocks the worker for the child's full run, because the injected limit only sends the default SIGTERM
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.child-deadline.ts:42` · **Round:** 1
  - **DONE WHEN:** when the wrapper injects `timeout` (caller set none), it also injects `killSignal: "SIGKILL"` unless the caller set `killSignal`, so a child that traps or ignores SIGTERM ends at the remaining time and the call throws naming the command and limit; a caller-set `timeout` or `killSignal` is passed through untouched.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` `stops a child that ignores SIGTERM at the remaining time` fails on `wrapped(() => 300).spawnSync("sh", ["-c", "trap '' TERM; sleep 30"])` blocking for the full 30s (verified with Node v24.16.0: `spawnSync("sh", ["-c", "trap \"\" TERM; sleep 4"], { timeout: 300 })` returns after 4.07s with `ETIMEDOUT`), so the elapsed `< 10_000` assertion fails

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A test that uses most of its budget, followed by a file-level or `describe`-level `afterEach` that cleans up with `execFileSync` (for example `git worktree remove`), has the cleanup killed after a few ms; the passing test is reported failed and the cleanup is skipped
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:110` · **Round:** 1
  - **DONE WHEN:** a child call inside a test file's own `beforeEach` or `afterEach` hook gets no less than the file's `hookTimeout`, and time spent in `beforeEach` hooks is not subtracted from the test body's child limit. Today the setup file's `beforeEach` runs first (`sequence.hooks: "stack"`, file suite before nested suites) and its clearing `afterEach` runs after every `afterEach` the test file registers (reverse order), so every other each-hook runs against the test deadline; 92 engine test files pair each-hooks with sync child calls.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `gives a file's afterEach child call the hook timeout after a test that used most of its time` fails on the nested run (CI=1, unit budget 5000 ms test / 10000 ms hook) exiting non-zero: the test body waits 4s with `Atomics.wait`, then the file's `afterEach` runs `spawnSync("sleep", ["2"])`, gets about 1000 ms and throws `did not finish within`

<!-- bkit:task 7 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 8 start -->

- [x] **TASK 8:** A test that mocks the clock (`vi.setSystemTime`, or `vi.useFakeTimers` with `Date` faked) moves the child limit with it: a future time kills every child call in the test body at 1 ms, so a passing test fails with `did not finish within 1 ms`, and a past time removes the limit, so a hung child blocks the worker for its full run
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.setup.ts:156` · **Round:** 2
  - **DONE WHEN:** `vitest.setup.ts` reads every time for the child limit (lines 122, 136, 153, 155 and 156) from a clock reference taken when the setup file loads, before any test can mock `Date` (for example `const realNow = Date.now;`), so a test body's child call gets the test's real remaining time whatever the mocked clock says. Two repo tests hit this today: `.bkit/core/engine/commands/workflow/locks.test.ts:245-247` and `.bkit/core/engine/commands/workflow/ledgers.test.ts:1279-1281` set a past time, then run `git` with no `timeout`, so their child calls get a limit of about 12 days and about 78 days.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `keeps the body's child limit on the real clock when the test sets a future system time` fails on the nested run (CI=1, 5000 ms test / 10000 ms hook) exiting non-zero: the body runs `vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(Date.now() + 3_600_000); expect(spawnSync("true").status).toBe(0)` and the call throws `true did not finish within 1 ms (the running test's remaining time)` (verified with a nested run of the real `vitest.setup.ts`)
    - `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` `stops a hung child at the test's timeout when the test sets a past system time` fails on the elapsed time check (`< 5000 + 3000`): the body sets `vi.setSystemTime(new Date("2026-10-31T23:30:00-05:00"))` and runs `spawnSync("sleep", ["12"])`, which blocks for 12015 ms against 5004 ms with the real clock (verified the same way)

<!-- bkit:task 8 end -->
<!-- bkit:group 4 end -->
