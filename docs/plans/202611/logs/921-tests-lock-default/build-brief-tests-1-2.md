# Brief: group 1 — Core-count default for the tests slots (tests)

Plan: Tests lock: default the slot count from the core count Implementation Plan

## Why and what

### Context & Goals

The `tests` machine lock gets its default slot count from the core count: 2 slots with 8 or more cores, else 1. `BKIT_TEST_SLOTS` still overrides it, `BKIT_TEST_WORKERS` follows the chosen slot count, and the docs and the slots decision say so (#921, blocked by #814).

## Where it fits

- Group 1: Core-count default for the tests slots — this group
  - TASK 1: Work out the default slot count from the core count — done
  - TASK 2: Pin one slot in the tests that expect a second run to wait — done
  - TASK 5: Release the first holder before the three-slot half of the override test — open
- Group 2: Docs and decision — next
  - TASK 3: Document the default rule and where to set the override — open
  - TASK 4: Update the slots decision — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Release the first holder before the three-slot half of the override test
  - **UPDATE:** `a set BKIT_TEST_SLOTS overrides the core-count default both ways` in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`: stop the `override one` holder before the `BKIT_TEST_SLOTS=3` half starts, so three holders fit in three slots; the test keeps its name
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts` passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` fails if the override is ignored

<!-- bkit:task 5 end -->

### Derived Test Matrix rows

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

### Planned tests that already exist

- TASK 5 `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a set BKIT_TEST_SLOTS overrides the core-count default both ways` — exists at `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts:366`; update that test in place: add expectations, never remove or loosen one

## Deviations

Cut the worktree branch feat/{FID} from local dev (the checked-out dev branch), not origin/dev.
