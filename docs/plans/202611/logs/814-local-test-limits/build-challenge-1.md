Verdict: CONCERNS
Failures: 4
Fingerprint: 98195d5cff1a24e2100423bb3bb895c1d317f053f53eb3c694115377c0e6ee0a
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Read: `docs/plans/202611/814-local-test-limits-plan.md`, `tmp/bkit-diff-814-local-test-limits.md` (full coverage; its first line carries no `partial diff coverage` marker). Docs: `.agents/docs.md`, `docs/testing.md` (§ Accepted divergences, § Tests lock, the **Time limits** bullet); `docs/architecture.md` and `docs/security.md` are present and neither bears on a test-harness limit change.

The diff carries hunks this branch did not author (`.bkit/core/engine/commands/workflow/prs.ts`, `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/checks/tips/catalogue.ts`, `.husky/pre-push`, prompt and workflow mirrors), so the diff base is older than the branch base. Those hunks were skimmed, not challenged. The findings cover the #814 surfaces: `vitest.timeout-budget.ts`, `vitest.config.ts`, `vitest.setup.ts`, the guard tests in `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`, the added `localLimit(` call sites, `scripts/ci/bkit-test-limits*.mjs`, `tests/shell/setup_suite.bash` and the docs rewording.

This report re-emits the four findings of the previous attempt with every TEST FIRST entry in the form `` `test file` `test name` fails on {what goes wrong} ``. Each finding was re-checked against the current worktree: `vitest.timeout-budget.ts:19` / `:24`, `vitest.setup.ts:109` and `:173-181`, `.bkit/core/engine/commands/workflow/branches.test.ts:102` (17 `GIT_TIMEOUT` uses), `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:96`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1629` and `tests/shell/setup_suite.bash:22`.

## Notes

- Task 1 contradicts `docs/testing.md` § Time limits ("under `CI` ... strict (5s / 10s unit, 30s integration)") and the `localLimit` JSDoc. `vitest.setup.ts:109` reads `CI` for the tier, then `vitest.setup.ts:173-181` deletes it, and only then is the test file imported. So every module-level `localLimit(N)` and `tierTimeouts(true)` call in a test file computes with factor 6 on CI. The new unit tests pass an explicit factor (`localLimit(60_000, limitFactor({ CI: "true" }))`), so they never exercise the default path the wrapped files use. `bkit-tests-unit` and `bkit-tests-integration` in `.github/workflows/bkit-ci.yml` set no `timeout-minutes`, so nothing shorter catches the inflated limit.
- Task 3 cross-references `docs/testing.md` § Tests lock: Claude Code ships `BKIT_LOCK_WAIT_S=1200`. The 600s race test's `spawnSync` has no `timeout`, so `vitest.child-deadline.ts` sizes it from the 3,600,000 ms test limit.
- Explicit child-process timeouts in multi-key options (for example `husky-pre-push.integration.test.ts` `timeout: 20_000`) stay unscaled. This matches the state before the change and the plan's READ of `vitest.child-deadline.ts`, so it is not logged.
- Task 4: `limitFactor({ CI: "false" })` is asserted local (`vitest-timeout-budget.test.ts`), while `setup_suite` takes any non-empty `CI` as CI.
- No embedded directives found in the diff content.
- No tests were run; findings come from reading the code, the diff and the plan.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Under CI a file's own localLimit(N) returns 6N, because vitest.setup.ts deletes CI before the test file evaluates it, so a CI hang in machine-lock.integration.test.ts waits 60 minutes, not 10
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.timeout-budget.ts:24` · **Round:** 1
  - **DONE WHEN:** A test file evaluated in a worker started with CI=true or CI=1 gets localLimit(N) === N (and a module-level tierTimeouts(true) gets 30000), because the factor is captured before vitest.setup.ts:173-181 deletes CI (for example the setup records the factor in an env var or module state that limitFactor() reads first), and the localLimit JSDoc claim "unchanged under CI" holds
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts` `a file-level localLimit stays at the CI value under CI=1` fails on a nested vitest run with CI=1 and setupFiles [vitest.setup.ts] over a fixture asserting localLimit(60_000) === 60_000 at module level, which reads 360000 today
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** branches.test.ts keeps a bare 60s limit through const GIT_TIMEOUT = 60_000 on 16 describe blocks, and the no-bare-limit guard cannot see a named constant, so those suites stay at 60s locally while every other file gets 6x
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.test.ts:102` · **Round:** 1
  - **DONE WHEN:** GIT_TIMEOUT is localLimit(60_000), and the guard at .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts:96 also flags a numeric literal bound to a constant used as { timeout: NAME } or }, NAME); (and a multi-key { timeout: N, ... } test option), with a CONTROL for each shape
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `CONTROL — a test limit set through a named numeric constant is caught` fails on BARE not matching a const T = 60_000 used as { timeout: T }
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `no test file sets a numeric test limit through a named constant` fails on .bkit/core/engine/commands/workflow/branches.test.ts:102 binding GIT_TIMEOUT = 60_000
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Scaling an already-large file limit by 6 lets one hung local test hold the machine-wide tests lock for up to an hour (localLimit(600_000) = 3,600,000 ms, localLimit(240_000) = 24 min), past the 1200s lock wait other agents use, so their runs give up with exit 81
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:1629` · **Round:** 1
  - **DONE WHEN:** The owner decides whether a file's own limit above the tier base is multiplied by LOCAL_HANG_FACTOR (the plan's localLimit = Math.ceil(ms * factor), task 1) or capped (for example at max(ms, INTEGRATION_TEST_TIMEOUT_MS * LOCAL_HANG_FACTOR)); no agent can settle it because the plan and docs/testing.md § Time limits fix the plain multiply, and a cap trades hang latency against the tests lock wait budget (BKIT_LOCK_WAIT_S=1200)
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `localLimit of a large file limit stays inside the tests lock wait` fails on localLimit(600_000, limitFactor({})) returning 3,600,000 ms, above 1,200,000 ms
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** With CI=false exported, bats takes the 30s CI branch ([ -n "${CI:-}" ]) while Vitest and node --test take the 180s local limit (limitFactor matches only true / 1), and the bats parity test reads only the else branch, so the split drifts unseen
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `tests/shell/setup_suite.bash:22` · **Round:** 1
  - **DONE WHEN:** setup_suite treats only CI=true or CI=1 as CI (for example case "${CI:-}" in true|1)), and the parity test in .bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts asserts the bats CI test matches limitFactor's
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `CI=false gets the local 180s bats limit` fails on setup_suite exporting BATS_TEST_TIMEOUT=30 when CI=false
    - `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` `the bats CI branch matches limitFactor's CI values` fails on tests/shell/setup_suite.bash testing -n "${CI:-}" instead of true or 1
<!-- bkit:task 4 end -->
