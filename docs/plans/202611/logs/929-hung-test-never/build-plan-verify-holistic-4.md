Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8
Loosened: none
Fingerprint: 5c3671348302245246ee97952e90918bc2b388f784ebc4a866bfd0b5d7fad8b3
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has 4 groups).

## Integration Gaps

0 integration gaps. Group 4 (task 8) changes only `vitest.setup.ts`: it binds `const realNow = Date.now.bind(Date);` at line 117 when the setup file loads, and every child-limit time read goes through it (the test deadline, the body-start accessor, the each-hook floor and the body limit). That keeps the group 1 contract (`withChildDeadline` in `vitest.child-deadline.ts` still gets only a remaining-time function and passes a caller-set `timeout` through), keeps the group 3 hook floor and body-start rules (tasks 6 and 7) unchanged apart from the clock, and leaves the group 2 `node --test` and bats limits (`scripts/ci/bkit-test-limits.mjs`, tasks 3 and 4) on the same `tierTimeouts` source in `vitest.timeout-budget.ts`.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (CONCERNS, 1 gap: a failing bats test waited out the whole `BATS_TEST_TIMEOUT`), closed by `build-plan-gaps-remediate-holistic-1-log.md` with `patches/bats@1.13.0.patch`.
- `build-plan-verify-holistic-2.md` (PASS, tasks 1-5) and `build-plan-verify-holistic-3.md` (PASS, tasks 1-7), both before group 4 existed.
- `build-plan-verify-4-1.md` (PASS, task 8).
- Group reports `build-plan-verify-1-1.md` to `3-4.md`, all closed by their remediate logs.

## Notes

- Test runs, following the caller's instruction to run only the plan's own test files instead of `bkit tests changed` (load average 3.0 on 10 cores): Vitest on `vitest-child-deadline.test.ts`, `vitest-child-deadline.integration.test.ts`, `test-file-script.integration.test.ts`, `bats-setup-suite.integration.test.ts`, `.bkit/core/engine/commands/workflow/locks.test.ts` and `.bkit/core/engine/commands/workflow/ledgers.test.ts` passed: 6 files, 164 tests, 47.6s. `node --test` on `scripts/ci/bkit-test-limits.test.mjs` and `scripts/gate/bkit-gate-changed.test.mjs` passed 5/5. `scripts/ci/bkit-test-awake.test.mjs` through `scripts/ci/bkit-test-file.mjs` (the `bkit:test:awake` runner) passed 21/21. `scripts/harvest/bkit-harvest.test.mjs` passed 62/62 both through `bkit-test-file.mjs` (with `--test-force-exit`) and run directly (`pnpm test:harvest`'s form). The full changed-files run was last made in `build-plan-verify-holistic-3.md`, and `build-plan-tasks-4-log.md` records `bkit tests changed` passing after task 8.
- TASK 1 satisfied: the four unit tests pass, and `vitest.child-deadline.ts` imports nothing.
- TASK 2 satisfied: `vitest.setup.ts` wraps `node:child_process` and calls `syncBuiltinESMExports()`; `fails a test whose spawnSync child hangs within the test's own timeout` passes.
- TASK 3 satisfied: both helpers come from `tierTimeouts(true).testTimeout`; both tests pass (30000 ms and 30 s under `CI=true`).
- TASK 4 satisfied: `runNode`, `runBats`, the `named` stage, `bkit:test:awake` and `setup_suite()` carry the limits, and the three TEST FIRST tests pass.
- TASK 5 satisfied: every file and flag the `docs/testing.md` **Time limits** bullet names exists, and the three inventory rows name files that exist. The bullet does not say the child limit counts real time even when a test mocks `Date`; task 8's DONE WHEN asks for no doc change, so this is an optional wording addition, not a gap.
- TASK 6 satisfied: an injected `timeout` brings `killSignal: existing.killSignal ?? "SIGKILL"`; `stops a child that ignores SIGTERM at the remaining time` passes.
- TASK 7 satisfied: an each-hook call gets `Math.max(hookTimeout, testDeadline - realNow())`, and the body limit counts from `bodyStart`; the named test passes.
- TASK 8 satisfied: `grep -n 'Date\.now' vitest.setup.ts` returns only line 117 (the `realNow` binding); both TEST FIRST tests pass, and so do `locks.test.ts` and `ledgers.test.ts`, the two repo tests the DONE WHEN names as setting a past system time.
- Cross-group: `scripts/ci/bkit-test-awake.test.mjs` and `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` are byte-identical (`cmp`).
- Derived Test Matrix: every one of the 13 rows names its test in its task's TEST FIRST, and every one of those tests exists and passes. The plan has no `Documentation Updates` section. `docs/observability.md` is present; the change adds no runtime error path to log.
- Unproven, carried from the group 2 verify and not a gap: TASK 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after`. The owner answers it once, at the end of the build.
- No decision records (`build-decision-*.md`), test-first audit report or `Deviations` sections were supplied for this attempt. The new `docs/deferrals.jsonl` rows are the challenge's LOW findings and count toward no task. The `bats-testing-patterns` skill files and the `skills-lock.json` change come from the build's skill-install step, not from a plan task.
- Outside the plan, proposed as separate work (carried from attempt 3): the `afterEach` teardowns at `machine-lock.integration.test.ts:39-42` and `tests-lock.integration.test.ts:153-156` should wait for their killed children before `rmSync`.

## Identified Gaps Log

None
