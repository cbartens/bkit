# Brief: group 3 — Challenge round 1 findings

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
- Group 3: Challenge round 1 findings — this group
  - TASK 6: An owner who pins BKIT_TEST_SLOTS=1 in one host's settings still gets two heavy runs at once on an 8+ core machine, because a terminal, another host or a preserved 6.1.1 copy without the pin defaults to 2 and takes tests.2.lock beside the pinned holder — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** An owner who pins BKIT_TEST_SLOTS=1 in one host's settings still gets two heavy runs at once on an 8+ core machine, because a terminal, another host or a preserved 6.1.1 copy without the pin defaults to 2 and takes tests.2.lock beside the pinned holder
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

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Slots rule in docs | `docs/testing.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md` | `grep -n "BKIT_TEST_SLOTS"` over docs and catalogs | The existing "default 1" bullets | EXTEND | Rewrite the bullets |

## Deviations

Cut the worktree branch feat/{FID} from local dev (the checked-out dev branch), not origin/dev.
