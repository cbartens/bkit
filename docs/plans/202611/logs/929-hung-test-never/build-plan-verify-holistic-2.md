Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: 91393f6c410818992e0e1f0811dadab9245da477fcdb4891b57a0bd2b9a6d682
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0 integration gaps. The one gap from attempt 1 (a failing bats test waited out the whole `BATS_TEST_TIMEOUT`) is closed; see Notes.

## Previously Attempted

- `docs/plans/202611/logs/929-hung-test-never/build-plan-verify-holistic-1.md` (attempt 1): CONCERNS, 1 gap. Under bats 1.13.0 a failing bats test held its run for the full limit, so `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` `bats — a failing probe.bats exits non-zero with a <failure> for its named test` timed out under load (Fixable: true). `build-plan-gaps-remediate-holistic-1-log.md` fixed it with `patches/bats@1.13.0.patch` in commit `5c4c14ba8`.
- Group reports: `build-plan-verify-1-1.md` (CONCERNS, closed by `build-plan-gaps-remediate-1-1-log.md`), `build-plan-verify-1-2.md` (PASS), `build-plan-verify-1-3.md` (PASS), `build-plan-verify-2-1.md` (CONCERNS, test-loosened, closed) and `build-plan-verify-2-2.md` (PASS).

## Notes

- Attempt 1 gap closed. Cause: `bats_perform_test` in bats' `libexec/bats-core/bats-exec-test` stored the watchdog pid with `declare -r BATS_killer_pid=$!`. Inside a function that makes it local, so when a failing test leaves the function, the EXIT trap's `bats_abort_timeout_countdown` runs `kill ""` and the watchdog lives on until the limit. The patch turns it into a plain assignment `BATS_killer_pid=$!`. That is the only change to the watchdog. The countdown still starts, and `bats_start_timeout_countdown`, `bats_timeout_trap` and the kill path are untouched, so nothing is weakened. The second hunk changes `bin/bats` to `exec env ... bash "$BATS_ROOT/libexec/bats-core/bats"`. pnpm puts a patched package in a folder named `bats@1.13.0_patch_hash=...`, and `env` reads a path with `=` in it as a variable assignment. The libexec script's own shebang is `#!/usr/bin/env bash`, so running it through `bash` behaves the same.
- Patch is applied: `node_modules/bats` resolves to `.pnpm/bats@1.13.0_patch_hash=9f80abc1.../node_modules/bats`, whose `bats-exec-test:338` and `bin/bats:75` carry the patched lines.
- Lockfile and `package.json` agree: `package.json` `pnpm.patchedDependencies` maps `bats@1.13.0` to `patches/bats@1.13.0.patch`. `pnpm-lock.yaml` has the same entry with hash `9f80abc1acebf95b25e18ef2d14667d1ef4c3792095b72d8257009a1c92b5155`, and `shasum -a 256 patches/bats@1.13.0.patch` gives the same hash. The importer and snapshot entries both read `1.13.0(patch_hash=9f80abc1...)`. `bats` is a devDependency, and `patches/` is not in `files`, so nothing ships to consumers.
- Repro here (bats run directly with `BATS_TEST_TIMEOUT=5`): a one-line `false` test fails in 1s (16s at a 15s limit in attempt 1). A `sleep 60` test fails in 6s with `not ok 1 hangs # timeout after 5s`. A passing test takes 1s. The `false` test run through `node scripts/ci/bkit-test-file.mjs`, which sets the limit, ends in 0s with exit 1.
- All three bats call sites (`scripts/ci/bkit-test-file.mjs`, the `named` stage of `scripts/gate/bkit-gate-changed.mjs`, and `pnpm bkit:test:bats` in CI `bkit-ci.yml:634`) run the `node_modules` bats, so the fix reaches each one.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit`: exit 0, verdict PASS, 26m16s, 1094 changed files (`origin/dev` fetched first, at `d28117fa8`). Related Vitest 236/236 files (9576 passed, 2 skipped). Named Vitest 234/234 files (9545 passed, 2 skipped); this stage includes `test-file-script.integration.test.ts` and `bats-setup-suite.integration.test.ts`, run without `CI` set. The named `node --test` stage passed 121/121 with `--test-timeout=34292 --test-force-exit`. The named bats stage passed 32/32. Oxlint, Prettier and typecheck passed.
- TASK 1 satisfied: the four planned unit tests pass, and `vitest.child-deadline.ts` imports nothing.
- TASK 2 satisfied: `vitest.setup.ts` installs the wrapper with `syncBuiltinESMExports()`. The nested-run integration test passes.
- TASK 3 satisfied: both helpers in `scripts/ci/bkit-test-limits.mjs` come from `tierTimeouts(true).testTimeout`, and the test passes.
- TASK 4 satisfied: the runner changes are as judged in `build-plan-verify-2-2.md`. Its three TEST FIRST tests pass. The bats red-probe test it broke now passes without `CI`.
- TASK 5 satisfied: the **Time limits** bullet at `docs/testing.md:556` names only files and flags that exist. It now also describes `patches/bats@1.13.0.patch`, which exists. The three inventory rows name files that exist.
- Cross-group: the group 1 Vitest child limit and the group 2 runner limits both come from `vitest.timeout-budget.ts`, so they share one number. API contracts and shared state are consistent.
- Unproven, as the caller noted, so not a gap: TASK 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after`. The owner answers it once at the end of the build.
- Remediate log `BLOCKED` lines (bkit:generate snapshot step and the group gate, both stopped by the machine tests lock) were not counted as evidence. This attempt's own changed-files run replaces them.
- No decision records, test-first audit report or `Deviations` sections were supplied. The plan has no `Documentation Updates` section. `docs/observability.md` is present, and the change adds no runtime logging.
- Outside the plan, not a gap (carried from attempt 1): `pnpm test:harvest` runs `node scripts/harvest/bkit-harvest.test.mjs` without `--test`, so it gets no `--test-timeout`. Proposed as separate follow-up work.

## Identified Gaps Log

None
