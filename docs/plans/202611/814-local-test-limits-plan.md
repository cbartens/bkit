# Fixed Local Test Limits Implementation Plan

## Context & Goals

Off CI, every Vitest, `node --test` and bats time limit in bkit's own suite becomes a fixed 6 times its CI value, with no load reading. Under `CI=true` or `CI=1` the limits stay exactly as today (5s / 10s unit, 30s integration). The shipped flake audit and starter `docs/testing.md` recommend this split instead of a load-scaled budget. Source: issue #814.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — a test-harness constant change, no component boundary moves | none | none | None |
| technology | `docs/technology.md` | no — no new dependency or tool | none | none | None |
| security | `docs/security.md` | no — no credential, permission or data boundary changes | none | none | None |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Accepted divergences (`ci-strict-time-limits`), **Time limits** bullet | covered | Rewritten in task 4 |
| deployments | `docs/deployments.md` | no — CI limits are unchanged | none | none | None |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Fixed local factor and `localLimit` | `vitest.timeout-budget.ts` | `git grep -n -E "loadFactor\|MAX_LOAD_FACTOR\|planUnitLoad" -- '*.ts' '*.mjs'`, read of the file | `vitest.timeout-budget.ts` — has the bases and `tierTimeouts`, missing a fixed factor | EXTEND | Rename and simplify `loadFactor`, add `localLimit` in the same file |
| Config and per-file tier wiring | `vitest.config.ts`, `vitest.setup.ts` | read both, `git grep -n "tierTimeouts\|unitTimeouts"` | both already apply the budget | EXTEND | Drop `planUnitLoad`, keep the tier pick |
| Guard tests for the limits | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | read the file's describe blocks | existing budget tests assert the load-scaled shape | EXTEND | Replace the load tests, add the no-bare-limit guard |
| node and bats local limit | `scripts/ci/bkit-test-limits.mjs`, `tests/shell/setup_suite.bash` | read both with their test | already 30s CI / 180s local | EXTEND | Comments and exact-value assertions only |
| Shipped advice | `.bkit/core/docs/templates/bkit-audit-flakes.md`, `.bkit/templates/docs/testing.md`, `docs/testing.md` | `git grep -l -i "load-scaled"` | each recommends load scaling | EXTEND | Reword to the CI / local split |

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `plannedLoadPerCore` and `planUnitLoad` in `vitest.timeout-budget.ts` | `limitFactor` in `vitest.timeout-budget.ts` | DELETE | The code no longer reads the machine's load |
| `the run declares the load it is about to add` in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | the fixed-factor tests in the same file | DELETE | It tests the deleted load planning |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Fixed local limits, no load reading

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Replace the load-scaled factor with a fixed local hang factor
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

- [x] **TASK 2:** Rewire the config, setup and callers to the fixed factor
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

- [x] **TASK 3:** Route every limit a test file sets itself through `localLimit`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts`: wrap each literal test or hook limit as `localLimit(N)`; the same edit applies to every other `.bkit/core/engine/**/*.test.ts` and `scripts/harvest/**/*.test.ts` file the listing finds (`{ timeout: N }`, a trailing `}, N);`, `beforeAll(fn, N)`; 22 files today). Listing: `git grep -n -E "\{ ?timeout: ?[0-9][0-9_]* ?\}|\}, ?[0-9][0-9_]{3,}\);" -- '.bkit/core/engine/**/*.test.ts' 'scripts/harvest/**/*.test.ts'`
  - **UPDATE:** `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`: add the no-bare-limit guard and its CONTROL
  - **READ:** `vitest.child-deadline.ts`: child calls with no `timeout` are sized from the test limit, so they follow automatically
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the guard test passes on the whole tree, and each edited test file passes when run alone
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a bare numeric test or hook limit` fails while e.g. `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:110` `{ timeout: 60_000 }` is literal
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a bare numeric test limit is caught` fails if the guard's pattern misses `it("x", { timeout: 30_000 }, fn)` or `}, 30_000);`

<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Docs and the advice bkit ships

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Rewrite the shipped advice and the repo's docs to the CI / local split
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-flakes.md`: in § Context & Goals (`:23`) replace the sentences recommending a load-scaled budget re-read per test file with: strict limits under CI; locally a fixed multiple of the CI limit whose only job is to catch a hang; no load-based scaling. Keep the warning against widening one test's limit to hide a flake.
  - **UPDATE:** `.bkit/templates/docs/testing.md`: in § Accepted divergences, row `ci-strict-time-limits` (`:136`): same split in one sentence
  - **UPDATE:** `docs/testing.md`: in § Accepted divergences, row `ci-strict-time-limits` (`:133`), and the **Time limits** bullet (`:560`): same split, local values 30s / 60s / 180s
  - **UPDATE:** `docs/templates/bkit-audit-dependencies.md`: line 482, drop the `test-timeout-budget` load-line mention (outside the `bkit:start` / `bkit:end` block)
  - **UPDATE:** `docs/templates/bkit-audit-failures.md`: line 295, name `limitFactor`, `localLimit` and `tierTimeouts` (outside the managed block)
  - **UPDATE:** `docs/templates/bkit-audit-testing.md`: line 311, no "load-scaled" (outside the managed block)
  - **UPDATE:** `docs/templates/bkit-audit-flakes.md`: refresh its managed block from the edited core template with `bkit upgrade`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n -i -E "load-scaled|loadFactor|planUnitLoad|MAX_LOAD_FACTOR|UNIT_PLANNED_LOAD_PER_CORE|laptop's load" -- ':!docs/audits/**' ':!docs/plans/**' ':!*.jsonl' ':!floorplan/**'` prints nothing, and `bkit check` passes
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Supersede the knowledge row that prescribes per-suite load budgets
  - **UPDATE:** `docs/knowledge.jsonl`: for key `spawn-heavy-unit-suite-needs-its-own-budget-under-load`, append a same-key row with `status: "SUPERSEDED"` via `bkit ledgers append`, saying the local limit is now a fixed hang limit (#814)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=knowledge --status=ACTIVE` no longer lists the key
  - **TEST FIRST:** n/a — ledger row, no behaviour change

<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Under CI a file's own localLimit(N) returns 6N, because vitest.setup.ts deletes CI before the test file evaluates it, so a CI hang in machine-lock.integration.test.ts waits 60 minutes, not 10
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.timeout-budget.ts:24` · **Round:** 1
  - **DONE WHEN:** A test file evaluated in a worker started with CI=true or CI=1 gets localLimit(N) === N (and a module-level tierTimeouts(true) gets 30000), because the factor is captured before vitest.setup.ts:173-181 deletes CI (for example the setup records the factor in an env var or module state that limitFactor() reads first), and the localLimit JSDoc claim "unchanged under CI" holds
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` `a file-level localLimit stays at the CI value under CI=1` fails on a nested vitest run with CI=1 and setupFiles [vitest.setup.ts] over a fixture asserting localLimit(60_000) === 60_000 at module level, which reads 360000 today

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** branches.test.ts keeps a bare 60s limit through const GIT_TIMEOUT = 60_000 on 16 describe blocks, and the no-bare-limit guard cannot see a named constant, so those suites stay at 60s locally while every other file gets 6x
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.test.ts:102` · **Round:** 1
  - **DONE WHEN:** GIT_TIMEOUT is localLimit(60_000), and the guard at .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:96 also flags a numeric literal bound to a constant used as { timeout: NAME } or }, NAME); (and a multi-key { timeout: N, ... } test option), with a CONTROL for each shape
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a test limit set through a named numeric constant is caught` fails on BARE not matching a const T = 60_000 used as { timeout: T }
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a numeric test limit through a named constant` fails on .bkit/core/engine/commands/workflow/branches.test.ts:102 binding GIT_TIMEOUT = 60_000

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** Scaling an already-large file limit by 6 lets one hung local test hold the machine-wide tests lock for up to an hour (localLimit(600_000) = 3,600,000 ms, localLimit(240_000) = 24 min), past the 1200s lock wait other agents use, so their runs give up with exit 81 — accepted by owner
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1629` · **Round:** 1
  - **DONE WHEN:** The owner decides whether a file's own limit above the tier base is multiplied by LOCAL_HANG_FACTOR (the plan's localLimit = Math.ceil(ms * factor), task 1) or capped (for example at max(ms, INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR)); no agent can settle it because the plan and docs/testing.md § Time limits fix the plain multiply, and a cap trades hang latency against the tests lock wait budget (BKIT_LOCK_WAIT_S=1200)
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `localLimit of a large file limit stays inside the tests lock wait` fails on localLimit(600_000, limitFactor({})) returning 3,600,000 ms, above 1,200,000 ms

<!-- bkit:task 8 end -->
<!-- bkit:group 3 end -->

## Derived Test Matrix

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
| a file-level localLimit stays at the CI value under CI=1 | Integration | `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` | 6 |
| CONTROL — a test limit set through a named numeric constant is caught | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 7 |
| no test file sets a numeric test limit through a named constant | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 7 |
| localLimit of a large file limit stays inside the tests lock wait | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` | 8 |
