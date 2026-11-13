# Brief: group 2 — Time limits for node --test and bats runs (tests)

Plan: Time limits for hung tests Implementation Plan

## Why and what

### Context & Goals

Every test runner bkit uses on itself gets a time limit that holds when a test waits on a child process, so a hang becomes a named failing test, the gate exits red and the machine-wide tests lock frees (#929).

## Where it fits

- Group 1: Time limit for synchronous child calls in Vitest workers — done
  - TASK 1: Add a wrapper that gives `spawnSync`, `execSync` and `execFileSync` the running test's remaining time when the caller passes no `timeout` — done
  - TASK 2: Install the wrapper in every Vitest worker — done
- Group 2: Time limits for node --test and bats runs — this group
  - TASK 3: One source for the `node --test` and bats limits, derived from the integration budget — open
  - TASK 4: Apply the limits in every runner bkit uses on itself — open
  - TASK 5: Document the limits — done

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** One source for the `node --test` and bats limits, derived from the integration budget
  - **CREATE:** `scripts/ci/bkit-test-limits.mjs`: bkit-only (same header line as `scripts/ci/bkit-test-file.mjs`); `nodeTestLimitArgs()` returns `--test-timeout={ms}` and `--test-force-exit`, `{ms}` = `tierTimeouts(true).testTimeout` imported from `vitest.timeout-budget.ts`; `batsTestTimeoutSeconds()` returns the same limit in whole seconds
  - **CREATE:** `scripts/ci/bkit-test-limits.test.mjs`: unit tests for both helpers
  - **READ:** `vitest.timeout-budget.ts`: `tierTimeouts`
  - **DONE WHEN:** both helpers return the integration budget, 30s under `CI=true`
  - **TEST FIRST:**
    - `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit` fails on the module not existing
    - `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI` fails on the module not existing

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Apply the limits in every runner bkit uses on itself
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

<!-- bkit:task 4 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `nodeTestLimitArgs` gives `--test-timeout` from the integration budget plus `--test-force-exit` | Unit | `scripts/ci/bkit-test-limits.test.mjs` | 3 |
| `bkit:test:file` on a `node --test` file whose test awaits a never-exiting child exits 1 within the limit | Integration | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` | 4 |
| `bkit-gate-changed.mjs` passes the limit args to its `node --test` stage | Unit | `scripts/gate/bkit-gate-changed.test.mjs` | 4 |
| a bats test that hangs fails with `timeout after` under `tests/shell/setup_suite.bash` | Integration | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` | 4 |
