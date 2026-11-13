Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 5
Loosened: none
Fingerprint: feabcb93cda0389088768530514887ae4763f2b95df66b8d2a90f4f1ec215cf0
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

1 integration gap.

- TASK 4 (group 2) against the existing bats red-probe path. A bats limit was meant to end only hung tests. Under bats 1.13.0 it also holds every failing bats test until the limit runs out. Measured here on a one-line `false` test: 1s with no limit, 16s at `BATS_TEST_TIMEOUT=15`, and 31s through `node scripts/ci/bkit-test-file.mjs`, which fills in `batsTestTimeoutSeconds()`. A passing test is unaffected (0s). The countdown is `bats_start_timeout_countdown` in bats' `libexec/bats-core/bats-exec-test` (lines 267-291). In the holistic run, this made `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:137` `bats — a failing probe.bats exits non-zero with a <failure> for its named test` fail: `pnpm -s bkit:test:file .../probe.bats did not finish within 119999 ms`. Under load, the scaled bats limit reached that test's fixed 120s timeout. The group 2 verify ran this file only with `CI=true`, where the bats limit is 30s, so the probe passed slowly and the problem stayed hidden. The same stall hits every red bats probe in a build's tests-red step, and every failing test under `pnpm bkit:test:bats`, which waits 180s locally. Fixable: the plan sets the limit but not how bats ends a finished test, so the fix round can close this without an owner choice.

## Previously Attempted

None (first holistic attempt). Group reports read: `build-plan-verify-1-1.md` (CONCERNS, 3 gaps, closed by `build-plan-gaps-remediate-1-1-log.md`), `build-plan-verify-1-2.md` (PASS), `build-plan-verify-1-3.md` (PASS, after `build-plan-gaps-remediate-1-2-log.md`), `build-plan-verify-2-1.md` (CONCERNS, test-loosened gap on `bats-setup-suite.integration.test.ts`) and `build-plan-verify-2-2.md` (PASS, gap closed).

## Notes

- Branch scope: `origin/dev...HEAD` holds 156 commits, mostly other features from the local dev branch. The work for this run starts at `7395352a1`, and this report judged the 19 files changed since then (`git diff 7395352a1^ HEAD`).
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exit 1 (29m44s, 1090 changed files). Lint, format, types, the `node --test` stage (121/121, run with `--test-timeout=40691 --test-force-exit`) and the bats stage passed. Three Vitest tests failed:
  - `test-file-script.integration.test.ts` bats red probe: the gap above, caused by TASK 4.
  - `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `check flags an old marker; upgrade restamps every marker with no conflict; check is then clean`: timed out at 63.9s in the full run. It passed alone in 34s at load 19.
  - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault`: timed out at 63.9s in the full run. It passed alone in 51s at load 15.
  - Neither file is in this run's changes, and both are async timeouts, not a child call stopped by `vitest.child-deadline.ts`, which would throw an error naming the command. So both are machine-load timeouts, not gaps.
- TASK 1 satisfied: the four unit tests in `vitest-child-deadline.test.ts` carry the planned names and pass in the related stage. `vitest.child-deadline.ts` imports nothing.
- TASK 2 satisfied: `vitest.setup.ts` wraps `node:child_process`, calls `syncBuiltinESMExports()`, takes the deadline from `ctx.task.timeout` and falls back to `hookTimeout`. The nested-run integration test passes.
- TASK 3 satisfied: `scripts/ci/bkit-test-limits.mjs` derives both helpers from `tierTimeouts(true).testTimeout`, and its test passes in the node stage. `vitest.timeout-budget.ts` imports only `node:os`, so plain Node 24 (`engines: >=24`) can import the `.ts` file.
- TASK 4 not satisfied: its runner changes and its three TEST FIRST tests are in place and pass, but it broke the existing bats red-probe test (the gap above). `bkit-test-file.mjs` and `bkit-gate-changed.mjs` are the only `"--test"` call sites outside tests, and both pass `nodeTestLimitArgs()`. The bats call sites are `bkit-test-file.mjs`, `bkit-gate-changed.mjs` and `bkit:test:bats`, which goes through `setup_suite.bash`. The runners set `BATS_TEST_TIMEOUT` first, and `setup_suite()` keeps it (`:-`), so they agree on one value.
- TASK 5 satisfied: every file and flag named in the `docs/testing.md:556` **Time limits** bullet exists, and the three inventory rows name files that exist.
- Cross-group check: the group 1 Vitest child limit and the group 2 runner limits come from the same `vitest.timeout-budget.ts`, so they share one number. The `bkit-harvest.test.mjs` single-root-test restructure is safe under `--test-timeout`: the root test took 1.57s with `CI=true` (limit 30s), 62/62 passed.
- Outside the plan, not a gap: `pnpm test:harvest` runs `node scripts/harvest/bkit-harvest.test.mjs` directly, without `--test`, so it gets no `--test-timeout`. No CI lane or gate calls it, and TASK 4 does not list it. Proposed as separate follow-up work.
- Unproven, as the caller noted, so not a gap: TASK 4 `bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after`. The owner answers it once at the end of the build.
- No test-first audit report, decision records or `Deviations` sections were supplied. The plan has no `Documentation Updates` section. `docs/observability.md` is present, and the change adds no runtime logging: the wrapper throws an `Error` with `cause`.
- Matrix row 4: the hook-limit half is still unasserted (`vitest.setup.ts`), as the group verifies noted. It is an observation, not a gap, because TASK 1's planned test covers the row.

## Identified Gaps Log

1 gap.

INTEGRATION: TASK 4 (group 2) — the `BATS_TEST_TIMEOUT` that `runBats` in `scripts/ci/bkit-test-file.mjs`, the `named` stage of `scripts/gate/bkit-gate-changed.mjs` and `setup_suite()` in `tests/shell/setup_suite.bash` now set makes bats 1.13.0 hold every FAILING bats test for the whole limit (a one-line `false` test takes 16s at `BATS_TEST_TIMEOUT=15`, 31s through `bkit-test-file.mjs`, 1s with no limit; a passing test is unaffected), so the existing `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `bats — a failing probe.bats exits non-zero with a <failure> for its named test` fails under load (`pnpm -s bkit:test:file .../probe.bats did not finish within 119999 ms`, the load-scaled bats limit reaching the test's fixed 120s timeout) and every red bats probe in a build's tests-red step, and every failing test under `pnpm bkit:test:bats` (180s locally), now stalls for the full limit — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** INTEGRATION: TASK 4 bats limit holds every failing bats test for the whole BATS_TEST_TIMEOUT
  **Severity:** HIGH · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts:137` · **Round:** 1
  - **DONE WHEN:** a failing bats test run through scripts/ci/bkit-test-file.mjs, scripts/gate/bkit-gate-changed.mjs or pnpm bkit:test:bats (tests/shell/setup_suite.bash) ends within a few seconds of failing while BATS_TEST_TIMEOUT is set, a hanging bats test still fails with `timeout after`, and test-file-script.integration.test.ts `bats — a failing probe.bats exits non-zero with a <failure> for its named test` passes without CI set
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/test-file-script.integration.test.ts `bats — a failing probe.bats exits non-zero with a <failure> for its named test`
    - .bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts `a hanging bats test fails with timeout after`
<!-- bkit:task 1 end -->
