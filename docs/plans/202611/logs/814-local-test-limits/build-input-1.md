## Session Prompt — this run's, newer than everything below

#814

## Issue description — oldest

### Narrative

On a laptop, tests in bkit's own suite keep failing with `Test timed out in N ms`. They aren't broken: the suite has loaded the machine, and the time limit was too tight. Each failure sends a build or debug run into another round, which spends tokens and catches no bug.

The limits are currently scaled by the machine's load (`vitest.timeout-budget.ts`: `loadFactor`, `planUnitLoad`, plus the per-file re-read in `vitest.setup.ts`). That estimate keeps falling short. A round 2 diagnosis measured the full suite slowing these tests about 2.3 times while the limit stretched about 1.6 times, and round 4 of the same run started at x1.33. The estimate counts each vitest worker as one core, but every worker starts its own git, bash and node processes, and the 1-minute load average trails the load the suite builds up. Any better number would fit this suite and still be wrong for the next one.

Owner decision (2026-11-15): each limit gets one job.

- **CI:** the strict limits stay exactly as they are: 5s per unit test, 10s per unit hook, 30s per integration test and hook. A test that really got slower fails there, on every PR.
- **Locally:** a limit only has to catch a test that is really hung, so it is a fixed 6 times the CI limit: 30s per unit test, 60s per unit hook, 180s per integration test and hook. The code stops reading the machine's load. Six is the current cap, so no local limit is ever tighter than it is today. bats already works this way (`tests/shell/setup_suite.bash`: 30s under CI, else 180s).

The advice bkit ships to consumers changes to match. The flake audit and the starter `docs/testing.md` stop recommending a load-scaled budget and recommend this split instead.

### Success Criteria

- Off CI, every Vitest, `node --test` and bats time limit in bkit's own suite is 6 times its CI value, whatever the machine's load.
- Under `CI=true` or `CI=1`, every limit equals its CI base, unchanged from today.
- No code in the repo reads the load average to set a test time limit: `os.loadavg`, `UNIT_PLANNED_LOAD_PER_CORE`, `planUnitLoad` and `plannedLoadPerCore` are gone.
- Every test-level and hook-level limit a test file sets itself goes through the same local multiplier, and a guard test fails on a bare numeric one.
- The shipped flake audit (`.bkit/core/docs/templates/bkit-audit-flakes.md`) and the starter `.bkit/templates/docs/testing.md` describe strict CI limits plus a fixed local hang limit, and no longer recommend load scaling.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `CI=true` or `CI=1` | Factor 1: unit 5000ms test / 10000ms hook, integration 30000ms / 30000ms. |
| `CI` unset, empty or `false` | Factor 6: unit 30000ms / 60000ms, integration 180000ms / 180000ms. |
| A test really hangs locally | It fails after its local limit. A synchronous child call with no `timeout` of its own is still ended by `vitest.child-deadline.ts`, sized from that limit. |
| A test file sets its own limit (`{ timeout: 60_000 }`, `}, 30_000);`, `beforeAll(fn, 60_000)`) | It passes the value through `localLimit(ms)`: the literal under CI, 6 times it locally. |
| A caller already set `BATS_TEST_TIMEOUT` | Kept as is (unchanged behaviour). |
| The load average is 0 or unavailable (Windows) | No effect: the load is no longer read. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `limitFactor` returns 1 when `CI` is `true` or `1` | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| `limitFactor` returns `LOCAL_HANG_FACTOR` (6) when `CI` is unset, empty or `false` | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| `tierTimeouts` gives 5000 / 10000 unit and 30000 / 30000 integration under CI | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| `tierTimeouts` gives 30000 / 60000 unit and 180000 / 180000 integration locally | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| `localLimit(60_000)` is 60000 under CI and 360000 locally | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| The budget source reads no load: no `os.loadavg`, `UNIT_PLANNED_LOAD_PER_CORE`, `planUnitLoad` or `plannedLoadPerCore`, plus a CONTROL that a source calling `os.loadavg()` is caught | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| `vitest.config.ts` spreads `unitTimeouts()` and calls no `planUnitLoad`; `vitest.setup.ts` still re-applies the tier with `vi.setConfig(tierTimeouts(` | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| The local `BATS_TEST_TIMEOUT` default in `tests/shell/setup_suite.bash` equals `INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR / 1000`, plus a CONTROL with a mismatched value | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| No test file passes a bare numeric test-level or hook-level limit, plus a CONTROL that `it("x", { timeout: 30_000 }, fn)` and `}, 30_000);` are caught | Unit | `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` |
| `nodeTestLimitArgs()` gives `--test-timeout=30000` under CI and exactly `--test-timeout=180000` locally | Unit | `scripts/ci/bkit-test-limits.test.mjs` |
| `batsTestTimeoutSeconds()` gives 30 under CI and exactly 180 locally | Unit | `scripts/ci/bkit-test-limits.test.mjs` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Fixed local limits, no load reading
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Replace the load-scaled factor with a fixed local hang factor
  - **UPDATE:** `loadFactor` in `vitest.timeout-budget.ts`: rename to `limitFactor(env = process.env)`; return 1 when `env.CI` is `"true"` or `"1"`, else `LOCAL_HANG_FACTOR`; drop the load-average and core-count parameters
  - **UPDATE:** `MAX_LOAD_FACTOR` in `vitest.timeout-budget.ts`: rename to `LOCAL_HANG_FACTOR`, value stays 6
  - **CREATE:** `localLimit` in `vitest.timeout-budget.ts`: `localLimit(ms, factor = limitFactor())` returns `Math.ceil(ms * factor)`, for limits a test file sets itself
  - **UPDATE:** `tierTimeouts` and `unitTimeouts` in `vitest.timeout-budget.ts`: default `factor` to `limitFactor()`; remove the `[test-timeout-budget] load average …` `console.warn` from `unitTimeouts`
  - **DELETE:** `plannedLoadPerCore` and `planUnitLoad` in `vitest.timeout-budget.ts`, the `UNIT_PLANNED_LOAD_PER_CORE` read, and the `node:os` import
  - **UPDATE:** `vitest.timeout-budget.ts`: rewrite the header and JSDoc comments to describe the CI / local split
  - **DONE WHEN:** `git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.timeout-budget.ts` prints nothing, and `pnpm typecheck` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `limitFactor returns 1 under CI` fails on the missing `limitFactor` export
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `limitFactor returns LOCAL_HANG_FACTOR off CI` fails on the missing export
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `tierTimeouts gives the strict bases under CI` fails while the factor is load-scaled
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `tierTimeouts gives 6x the bases locally` fails while a quiet machine gets x1
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `localLimit scales a file's own limit locally only` fails on the missing export
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the budget reads no load` fails while the source calls `os.loadavg`
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Rewire the config, setup and callers to the fixed factor
  - **UPDATE:** `vitest.config.ts`: remove the `planUnitLoad` import, the `planUnitLoad();` call and its comment (`:5`, `:8-11`); reword the comment above `...unitTimeouts()` (`:37-39`)
  - **UPDATE:** `vitest.setup.ts`: keep `vi.setConfig(tierTimeouts(testPath.endsWith(".integration.test.ts")))` (it picks the unit or integration tier per file); rewrite the comment block above it (`:103-119`) so it describes picking the tier, not load
  - **UPDATE:** `CORPUS_CASE` in `.bkit/core/engine/tools/instructions.test.ts`: `{ timeout: localLimit(60_000) }`, importing `localLimit` instead of `loadFactor`
  - **UPDATE:** `scripts/ci/bkit-test-limits.mjs`: header comment says 30s under CI, else 180s, from the integration budget
  - **UPDATE:** `tests/shell/setup_suite.bash`: the comment above `setup_suite` names `LOCAL_HANG_FACTOR` instead of `MAX_LOAD_FACTOR`
  - **DELETE:** the `the run declares the load it is about to add` describe block in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n -E "loadavg|UNIT_PLANNED_LOAD_PER_CORE|planUnitLoad|plannedLoadPerCore|MAX_LOAD_FACTOR|loadFactor" -- vitest.config.ts vitest.setup.ts scripts tests/shell .bkit/core/engine` prints nothing, and the named test files pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `vitest.config.ts spreads unitTimeouts and plans no load` fails while the config calls `planUnitLoad()`
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the bats local default matches the integration hang limit` fails on a mismatch, with its CONTROL
    - `scripts/ci/bkit-test-limits.test.mjs` `gives --test-timeout from the integration budget and --test-force-exit` fails until the local value is asserted as exactly 180000
    - `scripts/ci/bkit-test-limits.test.mjs` `gives the bats limit in whole seconds, 30 under CI` fails until the local value is asserted as exactly 180
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Route every limit a test file sets itself through `localLimit`
  - **UPDATE:** every `.bkit/core/engine/**/*.test.ts` and `scripts/harvest/**/*.test.ts` file that passes a numeric literal as a test-level or hook-level limit (`{ timeout: N }` on `it` / `test` / `describe` / `it.each(...)`, a trailing `}, N);` on a test or hook, `beforeAll(fn, N)` and similar): wrap the value as `localLimit(N)`. Listing: `git grep -n -E "\{ ?timeout: ?[0-9][0-9_]* ?\}|\}, ?[0-9][0-9_]{3,}\);" -- '.bkit/core/engine/**/*.test.ts' 'scripts/harvest/**/*.test.ts'`
  - **READ:** `vitest.child-deadline.ts`: child calls with no `timeout` are sized from the test limit, so they follow automatically
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the guard test below passes on the whole tree, and each edited test file passes when run alone
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a bare numeric test or hook limit` fails while e.g. `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts:110` `{ timeout: 60_000 }` is literal
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a bare numeric test limit is caught` fails if the guard's pattern misses `it("x", { timeout: 30_000 }, fn)` or `}, 30_000);`
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: Docs and the advice bkit ships
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Rewrite the shipped advice and the repo's docs to the CI / local split
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-flakes.md` § Context & Goals (`:23`): replace the sentences recommending a load-scaled budget re-read per test file with: strict limits under CI; locally a fixed multiple of the CI limit whose only job is to catch a hang; no load-based scaling. Keep the warning against widening one test's limit to hide a flake.
  - **UPDATE:** `.bkit/templates/docs/testing.md` § Accepted divergences, row `ci-strict-time-limits` (`:136`): same split in one sentence
  - **UPDATE:** `docs/testing.md` § Accepted divergences, row `ci-strict-time-limits` (`:133`), and the **Time limits** bullet (`:560`): same split, local values 30s / 60s / 180s
  - **UPDATE:** `docs/templates/bkit-audit-dependencies.md:482` (drop the `test-timeout-budget` load-line mention), `docs/templates/bkit-audit-failures.md:295` (`limitFactor`, `localLimit`, `tierTimeouts`), `docs/templates/bkit-audit-testing.md:311` (no "load-scaled"): these lines sit outside the `bkit:start` / `bkit:end` block
  - **UPDATE:** `docs/templates/bkit-audit-flakes.md`: refresh its managed block from the edited core template with `bkit upgrade`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n -i -E "load-scaled|loadFactor|planUnitLoad|MAX_LOAD_FACTOR|UNIT_PLANNED_LOAD_PER_CORE|laptop's load" -- ':!docs/audits/**' ':!docs/plans/**' ':!*.jsonl' ':!floorplan/**'` prints nothing, and `bkit check` passes
  - **TEST FIRST:** n/a — docs
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Supersede the knowledge row that prescribes per-suite load budgets
  - **UPDATE:** `docs/knowledge.jsonl` key `spawn-heavy-unit-suite-needs-its-own-budget-under-load`: append a same-key row with `status: "SUPERSEDED"` via `bkit ledgers append`, saying the local limit is now a fixed hang limit (#814)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=knowledge --status=ACTIVE` no longer lists the key
  - **TEST FIRST:** n/a — ledger row
<!-- bkit:task 5 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumed: explicit `timeout` options on child-process calls (`spawnSync`, `execFileSync`, …) inside test files stay as they are. They bound the child, not the test, several are the behaviour under test (a hang test whose child limit must stay under its test limit), and none of the recorded failures is a child timeout. If one fails under load during the build, wrapping it in `localLimit` is in scope.
- Assumed: `expect.poll` / `vi.waitFor` timeouts stay as they are: they are assertion waits, not test limits.
- `floorplan/**` regenerates from the code (`graph:refresh`) and is not edited by hand.

### Breaking Changes & Naming

- `loadFactor` → `limitFactor`; `MAX_LOAD_FACTOR` → `LOCAL_HANG_FACTOR`; new `localLimit`.
- Removed: `planUnitLoad`, `plannedLoadPerCore`, the `UNIT_PLANNED_LOAD_PER_CORE` env var, and the `[test-timeout-budget] load average …` log line.
- All of these are in bkit's own checkout only. `package.json` `files` ships none of them, so no consumer code breaks. Only the shipped advice text changes.

### Out of Scope

- CI limits: unchanged by owner decision.
- Consumers' own load-scaled budgets (e.g. app-gether-life's `tooling/vitest/timeout-budget.ts`) and the `ci-strict-time-limits` row in consumers' existing `docs/testing.md`: consumer-owned. Raise a separate issue in each consumer repo.
- Closing the open `docs/failures.jsonl` rows this fixes: `bkit-utility-update-failures` closes them once the change lands.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-7)

- Open `docs/failures.jsonl` rows for this class: `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`, `gateguard-opencode-patch-tests-flaky-under-full-audits-run`, `runs-wait-cli-found-flaky-under-full-gate`, `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate`, `instructions-corpus-store-timeout-under-full-gate`, `disk-prune-wait-test-flaky-under-load`, `json-parse-owner-audit-timeout-under-load`
- `docs/knowledge.jsonl` key `spawn-heavy-unit-suite-needs-its-own-budget-under-load`
- `.bkit/core/docs/templates/bkit-audit-flakes.md` § Context & Goals
- `docs/testing.md` § Accepted divergences
- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- #801 — Build friction: undo per-file test locking and hard stops on missing proof (https://github.com/cbartens/bkit/issues/801), touches the same test harness

## Issue comment — posted 2026-11-15T03:27:47.000Z

### Owner direction (2026-11-15)

On a local machine, a test must not fail just because the machine was busy and its time limit was too tight. Those failures don't catch bugs. They send build and debug runs into extra rounds that spend tokens chasing load. The limit has to be smarter and less strict. Locally its only job is to catch a test that is really hung, not one that is slow because the suite is loading the machine.

This replaces "What should happen" above. Unless this issue says otherwise, CI keeps its strict limits (`loadFactor` returns 1 when `CI` is set).

### What the code does now

The "Affected area" section above is out of date. Since it was written, `vitest.timeout-budget.ts` has gained two things, and tests still time out:

- `planUnitLoad` (called from `vitest.config.ts:11`) sets a starting minimum before any worker starts: the load average plus one per worker, divided by the cores.
- `vitest.setup.ts:120` re-reads the limit as each test file starts, from the current load average.

### New evidence: round 4 of a local gate run

<!-- prettier-ignore -->
|  | Rounds 1-3 | Round 4 |
| --- | --- | --- |
| Unit tier wall time | 241-281s | 449.71s |
| Fence syntax check | ~21s | >60s |
| Starting multiplier | x1.58 to x1.73 | x1.33 (load 4.3 on 10 cores, so (4.3 + 9 workers) / 10) |
| Per-test limit at start |  | 6650ms |

During the run the 15-minute load average rose to about 20 on 10 cores. That load came from the suite itself: nine vitest workers, each starting git, bash and node processes. An earlier round's diagnosis measured the full suite slowing these tests about 2.3 times, while the limit only stretched about 1.6 times.

Nobody has found out why round 4 ran about 1.7 times slower than rounds 1-3. The dev commits in that rebase didn't touch `vitest*`, `package.json` or `scripts/ci/`.

### Why the limit falls behind

1. The limit is computed from the 1-minute load average. That average trails the load the suite is building up, so files that start while load is rising get limits sized for a quieter machine.
2. `plannedLoadPerCore` counts each worker as one core, and its own comment calls that an estimate. Each worker also starts child processes, so one worker costs more than one core.
3. The limit is only re-read when a file starts, so load that rises while a file runs is never counted.
4. Not part of the vitest failure: `scripts/ci/bkit-test-limits.mjs` really does set one limit for the whole run, as a single `--test-timeout` for node's test runner and a single `BATS_TEST_TIMEOUT` for bats.

### Open questions

- How should the local limit tell a hung test from a slow one? Options include a large fixed limit locally that only catches hangs, a limit based on the slowdown the run actually measures rather than the load average, or retrying once only when a test fails on its time limit.
- Should the starting minimum count each worker's child processes, not just one core per worker?

## Issue comment — posted 2026-11-15T03:42:20.000Z

The issue body has been rewritten as a build-ready change, using the approach the owner chose on 2026-11-15. CI keeps its strict limits. Locally, every limit is a fixed 6 times the CI limit, and the code no longer reads the machine's load. The advice bkit ships to consumers changes to match.

This settles the open questions in the previous comment. The local limit tells a hung test from a slow one by being a fixed hang limit, not by predicting or measuring the slowdown. The worker-count estimate is removed, not improved. Where this comment and the body differ, the body is the spec. Next step: `/bkit-build #814`.
