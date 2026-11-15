# Brief: group 4 — Challenge round 2 findings (tests)

Plan: Tests lock: default the slot count from the core count Implementation Plan

## Why and what

### Context & Goals

The `tests` machine lock gets its default slot count from the core count: 2 slots with 8 or more cores, else 1. `BKIT_TEST_SLOTS` still overrides it, `BKIT_TEST_WORKERS` follows the chosen slot count, and the docs and the slots decision say so (#921, blocked by #814).

## Where it fits

- Group 1: Core-count default for the tests slots — done
  - TASK 1: Work out the default slot count from the core count — done
  - TASK 2: Pin one slot in the tests that expect a second run to wait — done
  - TASK 5: Release the first holder before the three-slot half of the override test — done
- Group 2: Docs and decision — done
  - TASK 3: Document the default rule and where to set the override — done
  - TASK 4: Update the slots decision — done
- Group 3: Challenge round 1 findings — done
  - TASK 6: An owner who pins BKIT_TEST_SLOTS=1 in one host's settings still gets two heavy runs at once on an 8+ core machine, because a terminal, another host or a preserved 6.1.1 copy without the pin defaults to 2 and takes tests.2.lock beside the pinned holder — done
- Group 4: Challenge round 2 findings — this group
  - TASK 7: On an 8+ core machine, a plain `pnpm test` or `pnpm test:integration` started while a wrapped gate holds `tests.lock` no longer waits: the Vitest global setup takes `tests.2.lock` at once, but Vitest fixed its worker count before the lock was taken, so it runs cores - 1 workers (9 on 10 cores) beside the other heavy run instead of the 4 the slot count allows — open

## The work

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** On an 8+ core machine, a plain `pnpm test` or `pnpm test:integration` started while a wrapped gate holds `tests.lock` no longer waits: the Vitest global setup takes `tests.2.lock` at once, but Vitest fixed its worker count before the lock was taken, so it runs cores - 1 workers (9 on 10 cores) beside the other heavy run instead of the 4 the slot count allows
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.test-lock.ts:71` · **Round:** 2
  - **DONE WHEN:** A Vitest run whose lock is taken by the global setup (no wrapping `bkit-machine-lock.sh run --lock tests`, so `testWorkers()` saw no `BKIT_TEST_WORKERS`) never holds a `tests` slot beside another holder: with `BKIT_TEST_SLOTS` unset, the global setup's lock command runs with `BKIT_TEST_SLOTS=1`, so it queues behind any holder of `tests.lock` as it did before the core-count default; an explicit `BKIT_TEST_SLOTS` is passed through unchanged. Reproduced: with a 10-core fake `getconf` on `PATH`, `BKIT_TEST_SLOTS` unset and an external `run --lock tests -- sleep 4` holding `tests.lock`, the global setup's exact command entered at once and took `tests.2.lock`; Vitest's default `maxWorkers` outside watch mode is `max(count - 1, 1)` (`node_modules/vitest/dist/chunks/index.Di8au7q4.js:1631`). The existing global-setup tests miss it because `beforeEach` stubs `BKIT_TEST_SLOTS` to 1.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `with slots unset on 10 cores, the global setup waits for a held tests lock` fails on `setup(PROJECT)` settling within 200 ms while the wrapped holder still holds `tests.lock` (the test deletes the `BKIT_TEST_SLOTS` stub and puts a fake `getconf` reporting 10 cores first on `PATH` for both the holder and the setup)
<!-- bkit:task 7 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| with slots unset on 10 cores, the global setup waits for a held tests lock | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 7 |

## Deviations

Cut the worktree branch feat/{FID} from local dev (the checked-out dev branch), not origin/dev.
