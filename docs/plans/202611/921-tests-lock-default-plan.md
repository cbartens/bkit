# Tests lock: default the slot count from the core count Implementation Plan

## Context & Goals

The `tests` machine lock gets its default slot count from the core count: 2 slots with 8 or more cores, else 1. `BKIT_TEST_SLOTS` still overrides it, `BKIT_TEST_WORKERS` follows the chosen slot count, and the docs and the slots decision say so (#921, blocked by #814).

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — a shell lock script and its docs; no service boundary changes | `.agents/docs.md` index | covered | None |
| technology | `docs/technology.md` | no — no new framework or library | `.agents/docs.md` index | covered | None |
| security | `docs/security.md` | no — no credential, permission or input boundary changes | `.agents/docs.md` index | covered | None |
| testing | `docs/testing.md` | yes | `docs/testing.md` § Tests lock (`:325`) | covered | Task 3 updates the slots bullet |

## Documentation Warnings

```jsonl

```

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Core-count default slots and shared core probe | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `grep -n "_local_stack_lock\|BKIT_TEST_SLOTS"` in the template | `_local_stack_lock_slots`, `_local_stack_lock_workers` — already read the slots and probe cores | EXTEND | Move the probe into a helper and give the slots a core-based default |
| Slots rule in docs | `docs/testing.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md` | `grep -n "BKIT_TEST_SLOTS"` over docs and catalogs | The existing "default 1" bullets | EXTEND | Rewrite the bullets |
| Tests for the default | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | `grep -n envFor` | Existing slots tests and `envFor` | EXTEND | Add cases; pin a fake core count in `envFor` |

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Unset slots on 10 cores: two holders hold `tests` at once and a third waits naming both | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| Unset slots on 7 cores: a second holder waits behind the first | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| Unset slots: `BKIT_TEST_WORKERS` is 4 on 10 cores, 3 on 8 cores and 6 on 7 cores | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `BKIT_TEST_SLOTS=1` on 10 cores keeps one slot; `BKIT_TEST_SLOTS=3` on 4 cores gives three | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| An invalid slots value falls back to the core-count default with one note naming it, on 10 and on 4 cores | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| No working core probe gives one slot | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 1 |
| `BKIT_TEST_SLOTS=3` after the one-slot holder is released: three holders hold `tests` at once | Integration | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` | 5 |
| with slots unset on 10 cores, the global setup waits for a held tests lock | Integration | `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` | 7 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Core-count default for the tests slots

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Work out the default slot count from the core count
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

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Pin one slot in the tests that expect a second run to wait
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts`: the env of every run that expects exit 81 / `lockHolder` behind the external `tests` holder sets `BKIT_TEST_SLOTS: "1"`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts`: same for the push runs that expect exit 81 behind `external push holder`
  - **READ:** `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts`: already stubs `BKIT_TEST_SLOTS` to 1 (`:32`)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both files pass with `pnpm bkit:test:file` on a machine with 8 or more cores, and `git grep -l "take_local_stack_lock" -- '*.test.ts'` lists no other file whose test expects a second `tests` run to wait without pinning the slot count
  - **TEST FIRST:** n/a — test-only change; the two files' existing exit-81 tests are the check

<!-- bkit:task 2 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Release the first holder before the three-slot half of the override test
  - **UPDATE:** `a set BKIT_TEST_SLOTS overrides the core-count default both ways` in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: stop the `override one` holder before the `BKIT_TEST_SLOTS=3` half starts, so three holders fit in three slots; the test keeps its name
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` fails if the override is ignored

<!-- bkit:task 5 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Docs and decision

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Document the default rule and where to set the override
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock (`:966`) states default 2 slots on 8 or more cores, else 1; `BKIT_TEST_SLOTS` overrides it; an invalid value falls back to the default with one note; it is a per-machine setting, set in user-level host settings or the shell profile, never per repo
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the slots bullet (`:1231`) gets the same rule in one bullet
  - **UPDATE:** `docs/testing.md`: § Tests lock (`:325`) gets the same rule in one bullet
  - **UPDATE:** `.bkit/templates.md`: refresh the mirror from the core copy with `bkit install`
  - **UPDATE:** `.bkit/workflows.md`: refresh the mirror from the core copy with `bkit install`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n "default 1" -- docs/testing.md .bkit/templates.md .bkit/workflows.md .bkit/core/.bkit/templates.md .bkit/core/.bkit/workflows.md` no longer matches a `BKIT_TEST_SLOTS` line, and `bkit check` passes
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Update the slots decision
  - **UPDATE:** `docs/decisions.jsonl`: append a same-key row for `724-tests-lock-fixed-slots-not-live-load` with `bkit ledgers append`, saying the default slot count comes from the core count (2 on 8 or more cores, else 1), `BKIT_TEST_SLOTS` overrides it, and live load still never decides it (#921)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=decisions --status=ACTIVE` shows the key with the new description
  - **TEST FIRST:** n/a — ledger row, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** An owner who pins BKIT_TEST_SLOTS=1 in one host's settings still gets two heavy runs at once on an 8+ core machine, because a terminal, another host or a preserved 6.1.1 copy without the pin defaults to 2 and takes tests.2.lock beside the pinned holder
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:107` · **Round:** 1
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Machine lock (`:966`) keeps `BKIT_TEST_SLOTS` a per-process value with the core-count default, and says an override goes in every place runs start from (the shell profile and each host's user-level settings) or nowhere, because runs that read different values can hold `tests` slots at once
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the slots bullet (`:1231`) gets the same override advice in that one bullet
  - **UPDATE:** `docs/testing.md`: § Tests lock (`:325`) gets the same override advice in that one bullet
  - **UPDATE:** `.bkit/templates.md`: refresh the mirror from the core copy with `bkit install`
  - **UPDATE:** `.bkit/workflows.md`: refresh the mirror from the core copy with `bkit install`
  - **UPDATE:** `docs/decisions.jsonl`: append a same-key row for `724-tests-lock-fixed-slots-not-live-load` with `bkit ledgers append`, keeping its current description and adding that the slot count stays per process and an override must reach every process on the machine
  - **DONE WHEN:** `git grep -n "user-level host settings or the shell profile\|(user-level host settings or shell profile)" -- docs/testing.md .bkit/templates.md .bkit/workflows.md .bkit/core/.bkit/templates.md .bkit/core/.bkit/workflows.md` finds no match, each of those five files says an override goes in every place runs start from or nowhere, `bkit ledgers query --ledger=decisions --status=ACTIVE` shows the key with the new description, and `bkit check` passes
  - **TEST FIRST:** n/a — docs and ledger only; the lock script keeps its per-process behaviour

<!-- bkit:task 6 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 7 start -->

- [x] **TASK 7:** On an 8+ core machine, a plain `pnpm test` or `pnpm test:integration` started while a wrapped gate holds `tests.lock` no longer waits: the Vitest global setup takes `tests.2.lock` at once, but Vitest fixed its worker count before the lock was taken, so it runs cores - 1 workers (9 on 10 cores) beside the other heavy run instead of the 4 the slot count allows
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `vitest.test-lock.ts:71` · **Round:** 2
  - **DONE WHEN:** A Vitest run whose lock is taken by the global setup (no wrapping `bkit-machine-lock.sh run --lock tests`, so `testWorkers()` saw no `BKIT_TEST_WORKERS`) never holds a `tests` slot beside another holder: with `BKIT_TEST_SLOTS` unset, the global setup's lock command runs with `BKIT_TEST_SLOTS=1`, so it queues behind any holder of `tests.lock` as it did before the core-count default; an explicit `BKIT_TEST_SLOTS` is passed through unchanged. Reproduced: with a 10-core fake `getconf` on `PATH`, `BKIT_TEST_SLOTS` unset and an external `run --lock tests -- sleep 4` holding `tests.lock`, the global setup's exact command entered at once and took `tests.2.lock`; Vitest's default `maxWorkers` outside watch mode is `max(count - 1, 1)` (`node_modules/vitest/dist/chunks/index.Di8au7q4.js:1631`). The existing global-setup tests miss it because `beforeEach` stubs `BKIT_TEST_SLOTS` to 1.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/vitest-test-lock.integration.test.ts` `with slots unset on 10 cores, the global setup waits for a held tests lock` fails on `setup(PROJECT)` settling within 200 ms while the wrapped holder still holds `tests.lock` (the test deletes the `BKIT_TEST_SLOTS` stub and puts a fake `getconf` reporting 10 cores first on `PATH` for both the holder and the setup)

<!-- bkit:task 7 end -->
<!-- bkit:group 4 end -->
