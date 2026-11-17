# Brief: group 3 — Challenge round 1 findings (tests)

Plan: Fixed Local Test Limits Implementation Plan

## Why and what

### Context & Goals

Off CI, every Vitest, `node --test` and bats time limit in bkit's own suite becomes a fixed 6 times its CI value, with no load reading. Under `CI=true` or `CI=1` the limits stay exactly as today (5s / 10s unit, 30s integration). The shipped flake audit and starter `docs/testing.md` recommend this split instead of a load-scaled budget. Source: issue #814.

## Where it fits

- Group 1: Fixed local limits, no load reading — done
  - TASK 1: Replace the load-scaled factor with a fixed local hang factor — done
  - TASK 2: Rewire the config, setup and callers to the fixed factor — done
  - TASK 3: Route every limit a test file sets itself through `localLimit` — done
- Group 2: Docs and the advice bkit ships — done
  - TASK 4: Rewrite the shipped advice and the repo's docs to the CI / local split — done
  - TASK 5: Supersede the knowledge row that prescribes per-suite load budgets — done
- Group 3: Challenge round 1 findings — this group
  - TASK 6: Under CI a file's own localLimit(N) returns 6N, because vitest.setup.ts deletes CI before the test file evaluates it, so a CI hang in machine-lock.integration.test.ts waits 60 minutes, not 10 — open
  - TASK 7: branches.test.ts keeps a bare 60s limit through const GIT_TIMEOUT = 60_000 on 16 describe blocks, and the no-bare-limit guard cannot see a named constant, so those suites stay at 60s locally while every other file gets 6x — open
  - TASK 8: Scaling an already-large file limit by 6 lets one hung local test hold the machine-wide tests lock for up to an hour (localLimit(600_000) = 3,600,000 ms, localLimit(240_000) = 24 min), past the 1200s lock wait other agents use, so their runs give up with exit 81 — accepted by owner — done

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Under CI a file's own localLimit(N) returns 6N, because vitest.setup.ts deletes CI before the test file evaluates it, so a CI hang in machine-lock.integration.test.ts waits 60 minutes, not 10
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.timeout-budget.ts:24` · **Round:** 1
  - **DONE WHEN:** A test file evaluated in a worker started with CI=true or CI=1 gets localLimit(N) === N (and a module-level tierTimeouts(true) gets 30000), because the factor is captured before vitest.setup.ts:173-181 deletes CI (for example the setup records the factor in an env var or module state that limitFactor() reads first), and the localLimit JSDoc claim "unchanged under CI" holds
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` `a file-level localLimit stays at the CI value under CI=1` fails on a nested vitest run with CI=1 and setupFiles [vitest.setup.ts] over a fixture asserting localLimit(60_000) === 60_000 at module level, which reads 360000 today

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** branches.test.ts keeps a bare 60s limit through const GIT_TIMEOUT = 60_000 on 16 describe blocks, and the no-bare-limit guard cannot see a named constant, so those suites stay at 60s locally while every other file gets 6x
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.test.ts:102` · **Round:** 1
  - **DONE WHEN:** GIT_TIMEOUT is localLimit(60_000), and the guard at .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:96 also flags a numeric literal bound to a constant used as { timeout: NAME } or }, NAME); (and a multi-key { timeout: N, ... } test option), with a CONTROL for each shape
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a test limit set through a named numeric constant is caught` fails on BARE not matching a const T = 60_000 used as { timeout: T }
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a numeric test limit through a named constant` fails on .bkit/core/engine/commands/workflow/branches.test.ts:102 binding GIT_TIMEOUT = 60_000

<!-- bkit:task 7 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `limitFactor` returns 1 when `CI` is `true` or `1` | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 1 |
| `limitFactor` returns `LOCAL_HANG_FACTOR` (6) when `CI` is unset, empty or `false` | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 1 |
| `tierTimeouts` gives 5000 / 10000 unit and 30000 / 30000 integration under CI | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 1 |
| `tierTimeouts` gives 30000 / 60000 unit and 180000 / 180000 integration locally | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 1 |
| `localLimit(60_000)` is 60000 under CI and 360000 locally | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 1 |
| The budget source reads no load, plus a CONTROL that a source calling `os.loadavg()` is caught | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 1 |
| `vitest.config.ts` spreads `unitTimeouts()` and calls no `planUnitLoad`; `vitest.setup.ts` still re-applies the tier with `vi.setConfig(tierTimeouts(` | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 2 |
| The local `BATS_TEST_TIMEOUT` default in `tests/shell/setup_suite.bash` equals `INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR / 1000`, plus a CONTROL with a mismatched value | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 2 |
| No test file passes a bare numeric test-level or hook-level limit, plus a CONTROL that `it("x", { timeout: 30_000 }, fn)` and `}, 30_000);` are caught | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 3 |
| a file-level localLimit stays at the CI value under CI=1 | Integration | `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` | 6 |
| CONTROL — a test limit set through a named numeric constant is caught | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 7 |
| no test file sets a numeric test limit through a named constant | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 7 |
| localLimit of a large file limit stays inside the tests lock wait | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 8 |
