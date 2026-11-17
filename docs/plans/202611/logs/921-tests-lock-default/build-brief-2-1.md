# Brief: group 2 — Docs and decision

Plan: Tests lock: default the slot count from the core count Implementation Plan

## Why and what

### Context & Goals

The `tests` machine lock gets its default slot count from the core count: 2 slots with 8 or more cores, else 1. `BKIT_TEST_SLOTS` still overrides it, `BKIT_TEST_WORKERS` follows the chosen slot count, and the docs and the slots decision say so (#921, blocked by #814).

## Where it fits

- Group 1: Core-count default for the tests slots — done
  - TASK 1: Work out the default slot count from the core count — done
  - TASK 2: Pin one slot in the tests that expect a second run to wait — done
  - TASK 5: Release the first holder before the three-slot half of the override test — done
- Group 2: Docs and decision — this group
  - TASK 3: Document the default rule and where to set the override — open
  - TASK 4: Update the slots decision — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Document the default rule and where to set the override
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

- [ ] **TASK 4:** Update the slots decision
  - **UPDATE:** `docs/decisions.jsonl`: append a same-key row for `724-tests-lock-fixed-slots-not-live-load` with `bkit ledgers append`, saying the default slot count comes from the core count (2 on 8 or more cores, else 1), `BKIT_TEST_SLOTS` overrides it, and live load still never decides it (#921)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=decisions --status=ACTIVE` shows the key with the new description
  - **TEST FIRST:** n/a — ledger row, no behaviour change

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Work out the default slot count from the core count — `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, `scripts/ci/bkit-machine-lock.sh`, `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Slots rule in docs | `docs/testing.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md` | `grep -n "BKIT_TEST_SLOTS"` over docs and catalogs | The existing "default 1" bullets | EXTEND | Rewrite the bullets |

## Deviations

Cut the worktree branch feat/{FID} from local dev (the checked-out dev branch), not origin/dev.
