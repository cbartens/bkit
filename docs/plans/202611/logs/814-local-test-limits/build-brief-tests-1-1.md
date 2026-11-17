# Brief: group 1 — Fixed local limits, no load reading (tests)

Plan: Fixed Local Test Limits Implementation Plan

## Why and what

### Context & Goals

Off CI, every Vitest, `node --test` and bats time limit in bkit's own suite becomes a fixed 6 times its CI value, with no load reading. Under `CI=true` or `CI=1` the limits stay exactly as today (5s / 10s unit, 30s integration). The shipped flake audit and starter `docs/testing.md` recommend this split instead of a load-scaled budget. Source: issue #814.

## Where it fits

- Group 1: Fixed local limits, no load reading — this group
  - TASK 1: Replace the load-scaled factor with a fixed local hang factor — open
  - TASK 2: Rewire the config, setup and callers to the fixed factor — open
  - TASK 3: Route every limit a test file sets itself through `localLimit` — open
- Group 2: Docs and the advice bkit ships — next
  - TASK 4: Rewrite the shipped advice and the repo's docs to the CI / local split — open
  - TASK 5: Supersede the knowledge row that prescribes per-suite load budgets — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Replace the load-scaled factor with a fixed local hang factor
  - **UPDATE:** `loadFactor` in `vitest.timeout-budget.ts`: rename to `limitFactor(env = process.env)`; return 1 when `env.CI` is `"true"` or `"1"`, else `LOCAL_HANG_FACTOR`; drop the load-average and core-count parameters
  - **UPDATE:** `MAX_LOAD_FACTOR` in `vitest.timeout-budget.ts`: rename to `LOCAL_HANG_FACTOR`, value stays 6
  - **UPDATE:** `localLimit` in `vitest.timeout-budget.ts`: add `localLimit(ms, factor = limitFactor())` returning `Math.ceil(ms * factor)`, for limits a test file sets itself
  - **UPDATE:** `tierTimeouts` in `vitest.timeout-budget.ts`: default `factor` to `limitFactor()`
  - **UPDATE:** `unitTimeouts` in `vitest.timeout-budget.ts`: default `factor` to `limitFactor()`; remove the `[test-timeout-budget] load average` `console.warn`
  - **DELETE:** `plannedLoadPerCore` in `vitest.timeout-budget.ts`: the function
  - **DELETE:** `planUnitLoad` in `vitest.timeout-budget.ts`: the function, the `UNIT_PLANNED_LOAD_PER_CORE` read and the `node:os` import
  - **UPDATE:** `vitest.timeout-budget.ts`: rewrite the header and JSDoc comments to describe the CI / local split
  - **UPDATE:** `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`: replace the load-scaled describe block with the new budget tests
  - **DONE WHEN:** `git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.timeout-budget.ts` prints nothing, `pnpm typecheck` passes, and the new budget tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `limitFactor returns 1 under CI` fails on the missing `limitFactor` export
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `limitFactor returns LOCAL_HANG_FACTOR off CI` fails on the missing `limitFactor` export
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `tierTimeouts gives the strict bases under CI` fails while the factor is load-scaled
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `tierTimeouts gives 6x the bases locally` fails while a quiet machine gets x1
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `localLimit scales a file's own limit locally only` fails on the missing `localLimit` export
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the budget reads no load` fails while the source calls `os.loadavg`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Rewire the config, setup and callers to the fixed factor
  - **UPDATE:** `vitest.config.ts`: remove the `planUnitLoad` import, the `planUnitLoad();` call and its comment (`:5`, `:8-11`); reword the comment above `...unitTimeouts()` (`:37-39`)
  - **UPDATE:** `vitest.setup.ts`: keep `vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")))`; rewrite the comment block above it (`:103-119`) so it describes picking the tier, not load
  - **UPDATE:** `CORPUS_CASE` in `.bkit/core/engine/tools/instructions.test.ts`: `{ timeout: localLimit(60_000) }`, importing `localLimit` instead of `loadFactor`
  - **UPDATE:** `scripts/ci/bkit-test-limits.mjs`: header comment says 30s under CI, else 180s, from the integration budget
  - **UPDATE:** `tests/shell/setup_suite.bash`: the comment above `setup_suite` names `LOCAL_HANG_FACTOR` instead of `MAX_LOAD_FACTOR`
  - **UPDATE:** `scripts/ci/bkit-test-limits.test.mjs`: assert the exact local values (180000 and 180)
  - **DELETE:** `the run declares the load it is about to add` in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`: the describe block
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.config.ts vitest.setup.ts scripts tests/shell .bkit/core/engine` prints nothing, and the named test files pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `vitest.config.ts spreads unitTimeouts and plans no load` fails while the config calls `planUnitLoad()`
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the bats local default matches the integration hang limit` fails on a mismatch, with its CONTROL
    - `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit` fails until the local value is asserted as exactly "--test-timeout=180000"
    - `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI` fails until the local value is asserted as exactly 180

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Route every limit a test file sets itself through `localLimit`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts`: wrap each literal test or hook limit as `localLimit(N)`; the same edit applies to every other `.bkit/core/engine/**/*.test.ts` and `scripts/harvest/**/*.test.ts` file the listing finds (`{ timeout: N }`, a trailing `}, N);`, `beforeAll(fn, N)`; 22 files today). Listing: `git grep -n -E "\{ ?timeout: ?[0-9][0-9_]* ?\}|\}, ?[0-9][0-9_]{3,}\);" -- '.bkit/core/engine/**/*.test.ts' 'scripts/harvest/**/*.test.ts'`
  - **UPDATE:** `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`: add the no-bare-limit guard and its CONTROL
  - **READ:** `vitest.child-deadline.ts`: child calls with no `timeout` are sized from the test limit, so they follow automatically
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the guard test passes on the whole tree, and each edited test file passes when run alone
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a bare numeric test or hook limit` fails while e.g. `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:110` `{ timeout: 60_000 }` is literal
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a bare numeric test limit is caught` fails if the guard's pattern misses `it("x", { timeout: 30_000 }, fn)` or `}, 30_000);`

<!-- bkit:task 3 end -->

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
| `nodeTestLimitArgs()` gives `--test-timeout=30000` under CI and exactly `--test-timeout=180000` locally | Unit | `scripts/ci/bkit-test-limits.test.mjs` | 2 |
| `batsTestTimeoutSeconds()` gives 30 under CI and exactly 180 locally | Unit | `scripts/ci/bkit-test-limits.test.mjs` | 2 |

### Planned tests that already exist

- TASK 2 `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit` — exists at `scripts/ci/bkit-test-limits.test.mjs:19`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI` — exists at `scripts/ci/bkit-test-limits.test.mjs:31`; update that test in place: add expectations, never remove or loosen one
