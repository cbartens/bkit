Verdict: CONCERNS
Failures: 1
Fingerprint: e3c5e173b29c0cb45d1c0b7c83af71b5ec00408da612b93bb57ff50855913255
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

The run's diff `tmp/bkit-diff-921-tests-lock-default.md` (full coverage, not partial): `.bkit/templates/scripts/ci/bkit-machine-lock.sh` and its byte-identical copy `scripts/ci/bkit-machine-lock.sh`, the new and pinned tests in `machine-lock.integration.test.ts`, `tests-lock.integration.test.ts` and `branches-lock.integration.test.ts`, the slots bullets in `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md`, their mirrors and `docs/testing.md`, and the two `724-tests-lock-fixed-slots-not-live-load` decision rows. Plan: `docs/plans/202611/921-tests-lock-default-plan.md`, groups 1 to 3.

## Notes

- Docs read: `.agents/docs.md`, `docs/testing.md` § Tests lock (`:325`) and § Raw Vitest (`:558`). `docs/architecture.md` and `docs/security.md` exist and hold no machine-lock or tests-lock content, so they gave nothing to cross-check.
- Cross-reference for Task 1: `docs/testing.md:558` says `vitest.test-lock.ts` makes heavy root runs queue for the `tests` lock, and `:325` says `BKIT_TEST_WORKERS` follows the chosen slot count. On 8+ cores with the new default, a raw heavy run does not queue behind one holder, and its worker count cannot follow the slot it takes.
- Not re-logged: mixed `BKIT_TEST_SLOTS` values across processes (a pinned host, an unpinned terminal, an adopted 6.1.1 copy) can hold slots at once. Plan Task 6 settles it as a documented per-process value.
- Checked and clean: `_lsl_cores` reaches `_local_stack_lock_slots` and `_local_stack_lock_workers` through bash dynamic scope from the `local` in `_local_stack_lock`, and nothing else calls them, so `set -u` callers never see it unset. `[ "$_lsl_cores" -ge 8 ] && _lsl_default=2` is not the function's last command, so `set -e` callers survive a false test. Set-but-empty, `0`, `-1`, `1.5` and `garbage` fall back with one note, and leading zeros still parse base 10. The CI bypass still returns before the probe. The threshold matches the plan (`-ge 8`), and the worker expectations 4 / 3 / 6 for 10 / 8 / 7 cores match `max(1, floor(cores / slots) - 1)`. `envFor` adds the 4-core fake `getconf` unless a caller passes `PATH`, and no test in `machine-lock.integration.test.ts` rebuilds `PATH` after `envFor`, so the older one-slot tests hold on any machine. `testsLockHolder` in `.bkit/core/engine/commands/lib.ts:171` takes the whole `; `-joined holder list, so the now-common two-holder timeout line still parses. `tests-jump.test.ts`, `tests.test.ts` and `vitest-process-group.integration.test.ts` never wait behind a real holder.
- Observation, not a finding: in `a set BKIT_TEST_SLOTS overrides the core-count default both ways`, `await holder.done` resolves when the killed bash exits, not when its perl holder lets go of `tests.lock`, and `three c` then has only `LOCAL_STACK_LOCK_WAIT_S=1`. Release usually takes about 0.1 s, so it passes, but a heavily loaded machine could flake it. Polling until `tests.lock.holder` is gone would close it. No deterministic failing test exists, so it is not a task.
- Design input, not a finding: the core probe tries `getconf _NPROCESSORS_ONLN` first, which on Linux reports the host's online CPUs, not a container's CPU limit. Inside a CPU-limited container on a 16-core host the default is now 2 slots of 7 workers each. The probe order is the plan's, unchanged by this diff.
- Untrusted content: the diff's `.bkit/friction.jsonl` and `docs/decisions.jsonl` rows are ledger data and held no directives.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** On an 8+ core machine, a plain `pnpm test` or `pnpm test:integration` started while a wrapped gate holds `tests.lock` no longer waits: the Vitest global setup takes `tests.2.lock` at once, but Vitest fixed its worker count before the lock was taken, so it runs cores - 1 workers (9 on 10 cores) beside the other heavy run instead of the 4 the slot count allows
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.test-lock.ts:71` · **Round:** 1
  - **DONE WHEN:** A Vitest run whose lock is taken by the global setup (no wrapping `bkit-machine-lock.sh run --lock tests`, so `testWorkers()` saw no `BKIT_TEST_WORKERS`) never holds a `tests` slot beside another holder: with `BKIT_TEST_SLOTS` unset, the global setup's lock command runs with `BKIT_TEST_SLOTS=1`, so it queues behind any holder of `tests.lock` as it did before the core-count default; an explicit `BKIT_TEST_SLOTS` is passed through unchanged. Reproduced: with a 10-core fake `getconf` on `PATH`, `BKIT_TEST_SLOTS` unset and an external `run --lock tests -- sleep 4` holding `tests.lock`, the global setup's exact command entered at once and took `tests.2.lock`; Vitest's default `maxWorkers` outside watch mode is `max(count - 1, 1)` (`node_modules/vitest/dist/chunks/index.Di8au7q4.js:1631`). The existing global-setup tests miss it because `beforeEach` stubs `BKIT_TEST_SLOTS` to 1.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `with slots unset on 10 cores, the global setup waits for a held tests lock` fails on `setup(PROJECT)` settling within 200 ms while the wrapped holder still holds `tests.lock` (the test deletes the `BKIT_TEST_SLOTS` stub and puts a fake `getconf` reporting 10 cores first on `PATH` for both the holder and the setup)
<!-- bkit:task 1 end -->
