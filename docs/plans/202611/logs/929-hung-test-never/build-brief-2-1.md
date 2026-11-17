# Brief: group 2 — Time limits for node --test and bats runs

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
  - TASK 5: Document the limits — open

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

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Document the limits
  - **UPDATE:** `docs/testing.md`: in the runner bullets (around lines 553-557) add a **Time limits** bullet: Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) also cap synchronous child calls (`vitest.child-deadline.ts`); `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`; bats gets `BATS_TEST_TIMEOUT` from the same source or `tests/shell/setup_suite.bash`; a limit kills only the direct child
  - **UPDATE:** `docs/testing.md`: in the test-file inventory table (around line 731) add rows for `vitest-child-deadline.test.ts`, `vitest-child-deadline.integration.test.ts` and `scripts/ci/bkit-test-limits.test.mjs`
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** every file and flag named in the bullet exists as written
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Install the wrapper in every Vitest worker — `.bkit/core/engine/audits/repo/vitest-child-deadline.integration.test.ts`, `vitest.setup.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | Searches run | Decision | File | Reason |
| --- | --- | --- | --- | --- |
| `node --test` and bats limit values | text search for `test-timeout`, `BATS_TEST_TIMEOUT` in `scripts/`, `package.json`, `tests/shell/` | NEW | `scripts/ci/bkit-test-limits.mjs` | (a) no existing helper; extending `vitest.timeout-budget.ts` would put runner flags in the Vitest harness file |
| Apply limits in runners | read `scripts/ci/bkit-test-file.mjs`, `scripts/gate/bkit-gate-changed.mjs`, `package.json`, `tests/shell/setup_suite.bash` | EXTEND | `scripts/ci/bkit-test-file.mjs` | existing runners gain the args |
| Document limits | read `docs/testing.md` | EXTEND | `docs/testing.md` | existing runner bullets |
| Unit test for limits helper | same search | NEW | `scripts/ci/bkit-test-limits.test.mjs` | (a) no candidate test exists |
| Bats hang test | search `tests/shell/` and audits for setup_suite tests | NEW | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` | (a) no candidate test exists |
