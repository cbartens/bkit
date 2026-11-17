## Session Prompt — this run's, newer than everything below

#929

## Issue description — oldest

### Narrative

A local gate run (`bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs …`) from `.worktrees/787-show-authoring-rules` held the machine-wide tests lock for over 8h50m. The same gate normally finishes in about 4 minutes. Every push on the machine waited for the lock, gave up and was refused.

The hung process was `node .bkit/templates/scripts/ci/bkit-test-awake.test.mjs`, started by `pnpm bkit:test:file` from `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`. It sat idle with no children. Nothing above it could time out:

- **Vitest's limit cannot fire during `spawnSync` / `execSync` / `execFileSync`.** These calls block the worker thread that vitest's timer runs on. The test declared `{ timeout: 120_000 }`, and it never took effect. Test files make 385 such calls across 106 files, most with no `timeout` of their own, so this is a whole class, not one test.
- **`node --test` has no per-test limit by default.** `scripts/ci/bkit-test-file.mjs`, `scripts/gate/bkit-gate-changed.mjs` and `package.json` `bkit:test:awake` run it without one.
- **bats has no per-test limit by default.** `pnpm bkit:test:bats`, `bkit-test-file.mjs` and `bkit-gate-changed.mjs` run bats without `BATS_TEST_TIMEOUT`.

The fix gives every test runner bkit uses on itself a time limit that holds even when a test waits on a child process, so a hang becomes a named failing test, the gate exits red and the lock frees. One central wrapper covers every synchronous child call in Vitest workers, instead of 385 call-site edits that new tests would forget.

Probes (2026-11-13, macOS, Node v24.16.0, bats 1.13.0) that settled the design:

<!-- prettier-ignore -->
| Probe | Result |
| --- | --- |
| `spawnSync(..., { timeout: 1000 })` on a child whose grandchild holds the stdout pipe | returns after ~1000ms with `error.code` `ETIMEDOUT`, in every stdio mode |
| same, then `pgrep` for the grandchild | the grandchild is still running (orphaned) |
| `node --test --test-timeout=1500` on a test awaiting a never-settling promise, and one awaiting a child that never exits | both cancelled at 1.5s, but the run only ends when the child exits (41s for `sleep 40`) |
| same plus `--test-force-exit` | run ends in 3s, exit 1; the `sleep` grandchild is orphaned |
| `BATS_TEST_TIMEOUT=2` exported in `setup_suite()`, test runs `sleep 20` | `not ok 1 hangs # timeout after 2s`, run takes 2s |
| vitest 5.0.5 test object | carries `timeout` (`options.timeout ?? runner.config.testTimeout`), readable from `beforeEach((ctx) => ctx.task.timeout)` |

### Success Criteria

- A Vitest test whose synchronous child call hangs fails within that test's own time limit, with an error naming the command and the limit.
- A synchronous child call that passes its own `timeout` keeps it unchanged.
- A `node --test` file run by `bkit:test:file`, `bkit:gate:changed` or `bkit:test:awake` whose test hangs, including on a child that never exits, fails and the run exits non-zero within the limit.
- A bats test that hangs fails with `timeout after` and the bats run ends.
- `docs/testing.md` states each runner's limit and where it is set.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Caller passes its own `timeout` | Caller's value is used; no limit is injected and no wrapper error is thrown |
| Call made in `beforeAll` / `afterAll` (no current test) | The file's `hookTimeout` is the limit |
| Test already past its limit when it makes the call | Limit is at least 1ms; the call times out at once and throws |
| Engine code under test makes the call | Same injected limit; the call was already past the test's limit when it fires |
| Test file mocks `node:child_process` with `vi.mock` (8 files) | Mock wins; nothing real is spawned, nothing is wrapped |
| Injected limit fires on `execSync` / `execFileSync` | They already throw on `ETIMEDOUT`; the wrapper rethrows with the command and limit named |
| `CI=true` | Limits use load factor 1 (30s per `node --test` / bats test), as Vitest's do |
| Laptop under load | `node --test` and bats limits scale by `loadFactor()`, like Vitest's |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| a `spawnSync` with no `timeout` is stopped at the remaining time and throws naming the command and limit | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` |
| an explicit `timeout` passes through and a timed-out result is returned, not thrown | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` |
| `execSync` and `execFileSync` with no `timeout` get the remaining time and throw naming the command | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` |
| with no current test the hook limit is used, and an expired limit becomes 1ms | Unit | `.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts` |
| a Vitest test whose `spawnSync` child hangs fails within its own `timeout` | Integration | `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts` |
| `nodeTestLimitArgs` gives `--test-timeout` from the integration budget plus `--test-force-exit` | Unit | `scripts/ci/bkit-test-limits.test.mjs` |
| `bkit:test:file` on a `node --test` file whose test awaits a never-exiting child exits 1 within the limit | Integration | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` |
| `bkit-gate-changed.mjs` passes the limit args to its `node --test` stage | Unit | `scripts/gate/bkit-gate-changed.test.mjs` |
| a bats test that hangs fails with `timeout after` under `tests/shell/setup_suite.bash` | Integration | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Time limit for synchronous child calls in Vitest workers
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout`
  - **CREATE:** `vitest.child-deadline.ts`: `withChildDeadline(childProcess, remainingMs)` wraps the three functions on the given module object; when `options.timeout` is absent it sets `timeout` to `Math.max(1, remainingMs())`; when that injected limit produces `ETIMEDOUT` it throws an `Error` naming the command, its arguments and the limit in ms; an explicit `timeout` is passed through untouched and `spawnSync` keeps returning its result
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
- [ ] **TASK 3:** One source for the `node --test` and bats limits, derived from the integration budget
  - **CREATE:** `scripts/ci/bkit-test-limits.mjs`: bkit-only (same header line as `scripts/ci/bkit-test-file.mjs`); `nodeTestLimitArgs()` returns `--test-timeout={ms}` and `--test-force-exit`, `{ms}` = `tierTimeouts(true).testTimeout` imported from `vitest.timeout-budget.ts`; `batsTestTimeoutSeconds()` returns the same limit in whole seconds
  - **DONE WHEN:** both helpers return the integration budget, 30s under `CI=true`
  - **TEST FIRST:**
    - `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit` fails on the module not existing
    - `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI` fails on the module not existing
<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Apply the limits in every runner bkit uses on itself
  - **UPDATE:** `runNode` in `scripts/ci/bkit-test-file.mjs`: add `...nodeTestLimitArgs()`
  - **UPDATE:** `runBats` in `scripts/ci/bkit-test-file.mjs`: pass `BATS_TEST_TIMEOUT` from `batsTestTimeoutSeconds()` in the child env
  - **UPDATE:** the `named` stage in `scripts/gate/bkit-gate-changed.mjs`: add `...nodeTestLimitArgs()` to the `node --test` call and `BATS_TEST_TIMEOUT` to the bats call
  - **UPDATE:** `bkit:test:awake` in `package.json`: run `node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs scripts/ci/bkit-test-awake.test.mjs`, so it shares `bkit:test:file`'s runner and limits
  - **UPDATE:** `setup_suite()` in `tests/shell/setup_suite.bash`: `export BATS_TEST_TIMEOUT="${BATS_TEST_TIMEOUT:-30}"` when `CI` is set, else `180` (30s x `MAX_LOAD_FACTOR` 6), for `pnpm bkit:test:bats`, which runs no node code first
  - **DEPENDS ON:** 3
  - **DONE WHEN:** a hanging `node --test` file and a hanging bats test each fail and end their run under every entry point listed
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `node — a test awaiting a child that never exits fails within the limit` fails on the run not ending before the vitest timeout
    - `scripts/gate/bkit-gate-changed.test.mjs` `passes the limit args to the node --test stage` fails on the args missing
    - `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after` fails on the bats run not ending
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Document the limits
  - **UPDATE:** `docs/testing.md` § the runner bullets (around lines 553-557): add a **Time limits** bullet: Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`); `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`; bats gets `BATS_TEST_TIMEOUT` from the same source or `tests/shell/setup_suite.bash`; a limit kills only the direct child
  - **UPDATE:** `docs/testing.md` test-file inventory table (around line 731): rows for `vitest-child-deadline.test.ts`, `vitest-child-deadline.integration.test.ts` and `scripts/ci/bkit-test-limits.test.mjs`
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** every file and flag named in the bullet exists as written
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- **Orphaned grandchildren (owner decision).** Every limit above kills only the direct child; the probes show its own children keep running. Killing the whole tree needs the child in its own process group (`detached: true`, which works with `spawnSync` on Node 24 per a probe, though Node's docs do not list it there). That stops Ctrl-C and an agent's cancel from reaching the child, so a cancelled run would leave orphans every time instead of only on a timeout. Default in this plan: leave orphans, and name the limit in the error so the cause is visible.
- **Process-wide wrapper.** Engine code under test gets the injected limit too. Assumption: no engine path relies on a synchronous child outliving the test that started it.
- **Bats under CI.** Assumption: no bats test in `tests/shell/` takes over 30s on a CI runner. Check with one timed `pnpm bkit:test:bats` under `CI=true` before landing.
- **`.mjs` importing `.ts`.** `scripts/ci/bkit-test-limits.mjs` imports `vitest.timeout-budget.ts` directly; this relies on Node >=24 (`package.json` `engines`) stripping types by default.

### Breaking Changes & Naming

None for consumers: every file touched is bkit-only (none is in `dist`, `.bkit/core`, `.bkit/shared` or `.bkit/templates`). `vitest.child-deadline.ts` follows the root `vitest.*.ts` harness naming; `scripts/ci/bkit-test-limits.mjs` carries the `bkit-` prefix.

### Out of Scope

- Why `bkit-test-awake.test.mjs` hung. With this change it fails as a named test, which then gets its own bug.
- A maximum hold time on the tests lock. The holder was alive; a lock that expires on a timer would let a second run start while the first still uses the machine.
- Lock waiting order: #916 — Tests lock: waiting runs win at random, so one can wait out its limit.

### References

- #916 — Tests lock: waiting runs win at random, so one can wait out its limit
- #724 — Machine-wide test lock: one test run at a time across agents
- `docs/testing.md` § Accepted divergences (`ci-strict-time-limits` row)
- `docs/failures.jsonl` key `subprocess-integration-tests-time-out-at-5000ms-under-high-load`
- `.bkit/templates.md` § Local test sleep prevention
