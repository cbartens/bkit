# Brief: group 1 — Fixed local limits, no load reading (tests)

Plan: Fixed Local Test Limits Implementation Plan

## Why and what

### Context & Goals

Off CI, every Vitest, `node --test` and bats time limit in bkit's own suite becomes a fixed 6 times its CI value, with no load reading. Under `CI=true` or `CI=1` the limits stay exactly as today (5s / 10s unit, 30s integration). The shipped flake audit and starter `docs/testing.md` recommend this split instead of a load-scaled budget. Source: issue #814.

## Where it fits

- Group 1: Fixed local limits, no load reading — this group
  - TASK 1: Replace the load-scaled factor with a fixed local hang factor — done
  - TASK 2: Rewire the config, setup and callers to the fixed factor — done
  - TASK 3: Route every limit a test file sets itself through `localLimit` — open
- Group 2: Docs and the advice bkit ships — next
  - TASK 4: Rewrite the shipped advice and the repo's docs to the CI / local split — open
  - TASK 5: Supersede the knowledge row that prescribes per-suite load budgets — open

## The work

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

### Planned tests that already exist

- TASK 3 `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a bare numeric test or hook limit` — exists at `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:105`; update that test in place: add expectations, never remove or loosen one
- TASK 3 `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a bare numeric test limit is caught` — exists at `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:113`; update that test in place: add expectations, never remove or loosen one
