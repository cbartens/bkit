# Brief: group 1 — Core-count default for the tests slots

Plan: Tests lock: default the slot count from the core count Implementation Plan

## Why and what

### Context & Goals

The `tests` machine lock gets its default slot count from the core count: 2 slots with 8 or more cores, else 1. `BKIT_TEST_SLOTS` still overrides it, `BKIT_TEST_WORKERS` follows the chosen slot count, and the docs and the slots decision say so (#921, blocked by #814).

## Where it fits

- Group 1: Core-count default for the tests slots — this group
  - TASK 1: Work out the default slot count from the core count — open
  - TASK 2: Pin one slot in the tests that expect a second run to wait — done
  - TASK 5: Release the first holder before the three-slot half of the override test — open
- Group 2: Docs and decision — next
  - TASK 3: Document the default rule and where to set the override — open
  - TASK 4: Update the slots decision — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Work out the default slot count from the core count
  - **UPDATE:** `_local_stack_lock_cores` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: the core probe moved out of `_local_stack_lock_workers` (`getconf _NPROCESSORS_ONLN`, else `nproc`, else `sysctl -n hw.ncpu`, else 1), setting `_lsl_cores`
  - **UPDATE:** `_local_stack_lock_slots` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: with `BKIT_TEST_SLOTS` unset, use 2 when `_lsl_cores` >= 8, else 1; a set value that is not a whole number >= 1 falls back to that same default, and the one-time note reads `[machine-lock] invalid BKIT_TEST_SLOTS; using N slot(s)` with the count used
  - **UPDATE:** `_local_stack_lock_workers` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: use `_lsl_cores` instead of probing again
  - **UPDATE:** `_local_stack_lock` in `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: for `tests`, call `_local_stack_lock_cores`, then `_local_stack_lock_slots`, then `_local_stack_lock_workers`, with `_lsl_cores` declared `local` there
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: header comment (`:30-31`) states the core-count default and the override
  - **UPDATE:** `scripts/ci/bkit-machine-lock.sh`: byte-identical copy of the template
  - **UPDATE:** `envFor` in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: put a fake `getconf` reporting 4 cores first on `PATH` unless the caller passes its own `PATH`, so the existing one-slot tests hold on any machine
  - **DONE WHEN:** `cmp scripts/ci/bkit-machine-lock.sh .bkit/templates/scripts/ci/bkit-machine-lock.sh` succeeds and `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with slots unset on 10 cores, two runs hold tests at once and a third waits naming both` fails on the second run waiting while the default is 1
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with slots unset on 7 cores, a second run waits behind the first` fails if the threshold is below 8
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with slots unset, BKIT_TEST_WORKERS follows the core-count slots` fails on 10 cores giving 9 instead of 4
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` fails if the override is ignored
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `an invalid slots value falls back to the core-count default and names it` fails on 10 cores falling back to 1
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `with no working core probe, slots unset gives one slot` fails if the fallback core count is not 1

<!-- bkit:task 1 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Release the first holder before the three-slot half of the override test
  - **UPDATE:** `a set BKIT_TEST_SLOTS overrides the core-count default both ways` in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: stop the `override one` holder before the `BKIT_TEST_SLOTS=3` half starts, so three holders fit in three slots; the test keeps its name
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` fails if the override is ignored

<!-- bkit:task 5 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Core-count default slots and shared core probe | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -n "_local_stack_lock\|BKIT_TEST_SLOTS"` in the template | `_local_stack_lock_slots`, `_local_stack_lock_workers` — already read the slots and probe cores | EXTEND | Move the probe into a helper and give the slots a core-based default |
| Tests for the default | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | `grep -n envFor` | Existing slots tests and `envFor` | EXTEND | Add cases; pin a fake core count in `envFor` |

## Deviations

Cut the worktree branch feat/{FID} from local dev (the checked-out dev branch), not origin/dev.
