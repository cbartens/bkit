Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 622a2339fdae62e5eec540827d08337de242de225a8aea1c1bfca3e1fcba8340
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0 integration gaps. Group 3 (tasks 6 and 7) changes only `vitest.child-deadline.ts`, `vitest.setup.ts`, the two `vitest-child-deadline` test files and `docs/testing.md`, and it keeps the group 1 contract: a call with its own `timeout` is passed through, and every limit still comes from `tierTimeouts` in `vitest.timeout-budget.ts`, the same source the group 2 `node --test` and bats limits read.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (CONCERNS, 1 gap): under bats 1.13.0 a failing bats test waited out the whole `BATS_TEST_TIMEOUT`. `build-plan-gaps-remediate-holistic-1-log.md` closed it with `patches/bats@1.13.0.patch`.
- `build-plan-verify-holistic-2.md` (PASS, 0 gaps): verified groups 1-2 (tasks 1-5) before the Build Challenge added group 3.
- Group 3 reports: `build-plan-verify-3-1.md`, `build-plan-verify-3-2.md` and `build-plan-verify-3-3.md` (CONCERNS, 1 gap each on the Task 7 child limit, closed by `build-plan-gaps-remediate-3-1-log.md`, `-3-2-log.md` and `-3-3-log.md`), then `build-plan-verify-3-4.md` (PASS, tasks 6 and 7).
- Earlier group reports: `build-plan-verify-1-1.md` to `1-3.md` and `build-plan-verify-2-1.md` to `2-2.md`, all closed.

## Notes

- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` ran twice (1117 changed files, `origin/dev` at `d28117fa8`). Both runs exited 1, and both times the only failing stage was `related`:
  - Run 1 (15m29s, load 6.2): 2 of 9583 failed. Both were in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` (`with N slots, N runs hold a named lock at once and run N+1 waits naming every holder` and `run exits 75 when the wait gives up, distinct from the command's own failure`), each with `ENOTEMPTY` from its `afterEach` `fs.rmSync(tmp, ...)` at line 41.
  - Run 2 (11m40s, load 3.2): 1 of 9583 failed, in a different file: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests changed exits 81 naming the holder when its wrapped gate gives up on the tests lock`, with `ENOTEMPTY` from `afterEach` `fs.rmSync(tmp, ...)` at line 155.
  - Judged not a gap. Both `afterEach` hooks send `SIGKILL` to their async `spawn` lock holders and delete the temp folder at once, without waiting for them to exit, so a holder's Perl helper that is still writing makes the delete fail. That teardown makes no synchronous child call, so the child limit never runs there; neither log contains `did not finish within`. This branch does not touch either test file or `bkit-machine-lock.sh` (`git diff --stat origin/dev...HEAD` on them is empty). The same `ENOTEMPTY` teardown failure is recorded on branches that do not touch these files (`docs/plans/202611/logs/892-template-copies-bkit/build-plan-verify-holistic-2.md:55`, `916-tests-lock-waiting/build-plan-verify-1-1.md:35`, `787-show-authoring-rules/build-plan-verify-holistic-6.md:25`). Run alone, `machine-lock.integration.test.ts` passed 45/45 three times and `tests-lock.integration.test.ts` passed 14/14.
  - Every other stage passed in both runs. Named Vitest: 234/234 files (9550 passed, 2 skipped); it includes `vitest-child-deadline.test.ts`, `vitest-child-deadline.integration.test.ts`, `test-file-script.integration.test.ts` and `bats-setup-suite.integration.test.ts`. Named `node --test`: passed with `--test-timeout=30000` / `33499` and `--test-force-exit`; it includes `scripts/ci/bkit-test-limits.test.mjs` and `scripts/gate/bkit-gate-changed.test.mjs`. Named bats, Oxlint, Prettier and typecheck also passed.
- TASK 1 satisfied: the four planned unit tests pass, and `vitest.child-deadline.ts` imports nothing.
- TASK 2 satisfied: `vitest.setup.ts` wraps `node:child_process` and calls `syncBuiltinESMExports()`. `fails a test whose spawnSync child hangs within the test's own timeout` passes, with its 9_000 ms bound tightened in `build-plan-gaps-remediate-3-1-log.md`.
- TASK 3 satisfied: both helpers in `scripts/ci/bkit-test-limits.mjs` come from `tierTimeouts(true).testTimeout`, and the test passes.
- TASK 4 satisfied: `runNode`, `runBats`, the `named` stage, `bkit:test:awake` and `setup_suite()` carry the limits. Its three TEST FIRST tests pass, and so does the bats red-probe test it once broke, fixed by `patches/bats@1.13.0.patch`. The only `node --test` / bats entry points are still `scripts/ci/bkit-test-file.mjs`, `scripts/gate/bkit-gate-changed.mjs` and `pnpm bkit:test:bats` (`bkit-ci.yml:634`).
- TASK 5 satisfied: every file and flag the `docs/testing.md` **Time limits** bullet names exists. Group 3's update to that bullet (the hook floor, body start, SIGKILL) matches `vitest.setup.ts` and `vitest.child-deadline.ts`. The three inventory rows name files that exist.
- TASK 6 satisfied: an injected `timeout` brings `killSignal: existing.killSignal ?? "SIGKILL"`, and a caller-set `timeout` returns through `original.apply` untouched. `stops a child that ignores SIGTERM at the remaining time` passes.
- TASK 7 satisfied: an each-hook call gets `Math.max(hookTimeout, testDeadline - Date.now())`. The body limit is counted from `bodyStart`, which the accessor on `task.result.hooks.beforeEach` sets. The named test and the async `afterEach`, slow `beforeEach` and await-then-hang tests pass.
- Cross-group: `scripts/ci/bkit-test-awake.test.mjs` and `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs` are byte-identical (`cmp`). The repo has no `it.concurrent` / `describe.concurrent` test, so the single `currentTask` in `vitest.setup.ts` is never shared between two running tests.
- Derived Test Matrix: every one of the 11 rows names its test in its task's `TEST FIRST`, and every one of those tests exists and passes. The plan has no `Documentation Updates` section. `docs/observability.md` does not apply, because the change adds no runtime error path to bkit-only test harness files.
- Unproven, carried from the group 2 verify and not a gap: TASK 4 `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` `a hanging bats test fails with timeout after`. The owner answers it once, at the end of the build.
- No decision records (`build-decision-*.md`), test-first audit report or `Deviations` sections were supplied. The four new `docs/deferrals.jsonl` rows are the challenge's LOW findings, and they count toward no task. The `bats-testing-patterns` skill files and the `skills-lock.json` change come from the build's skill-install step, not from a plan task.
- Outside the plan, proposed as separate work: the `afterEach` teardowns at `machine-lock.integration.test.ts:39-42` and `tests-lock.integration.test.ts:153-156` should wait for their killed children to exit before calling `rmSync`. `pnpm test:harvest` still runs `bkit-harvest.test.mjs` without `--test`, so it gets no `--test-timeout` (carried from attempt 1).

## Identified Gaps Log

None
