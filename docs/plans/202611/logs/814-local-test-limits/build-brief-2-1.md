# Brief: group 2 — Docs and the advice bkit ships

Plan: Fixed Local Test Limits Implementation Plan

## Why and what

### Context & Goals

Off CI, every Vitest, `node --test` and bats time limit in bkit's own suite becomes a fixed 6 times its CI value, with no load reading. Under `CI=true` or `CI=1` the limits stay exactly as today (5s / 10s unit, 30s integration). The shipped flake audit and starter `docs/testing.md` recommend this split instead of a load-scaled budget. Source: issue #814.

## Where it fits

- Group 1: Fixed local limits, no load reading — done
  - TASK 1: Replace the load-scaled factor with a fixed local hang factor — done
  - TASK 2: Rewire the config, setup and callers to the fixed factor — done
  - TASK 3: Route every limit a test file sets itself through `localLimit` — done
- Group 2: Docs and the advice bkit ships — this group
  - TASK 4: Rewrite the shipped advice and the repo's docs to the CI / local split — open
  - TASK 5: Supersede the knowledge row that prescribes per-suite load budgets — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Rewrite the shipped advice and the repo's docs to the CI / local split
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-flakes.md`: in § Context & Goals (`:23`) replace the sentences recommending a load-scaled budget re-read per test file with: strict limits under CI; locally a fixed multiple of the CI limit whose only job is to catch a hang; no load-based scaling. Keep the warning against widening one test's limit to hide a flake.
  - **UPDATE:** `.bkit/templates/docs/testing.md`: in § Accepted divergences, row `ci-strict-time-limits` (`:136`): same split in one sentence
  - **UPDATE:** `docs/testing.md`: in § Accepted divergences, row `ci-strict-time-limits` (`:133`), and the **Time limits** bullet (`:560`): same split, local values 30s / 60s / 180s
  - **UPDATE:** `docs/templates/bkit-audit-dependencies.md`: line 482, drop the `test-timeout-budget` load-line mention (outside the `bkit:start` / `bkit:end` block)
  - **UPDATE:** `docs/templates/bkit-audit-failures.md`: line 295, name `limitFactor`, `localLimit` and `tierTimeouts` (outside the managed block)
  - **UPDATE:** `docs/templates/bkit-audit-testing.md`: line 311, no "load-scaled" (outside the managed block)
  - **UPDATE:** `docs/templates/bkit-audit-flakes.md`: refresh its managed block from the edited core template with `bkit upgrade`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `git grep -n -i -E "load-scaled|loadFactor|planUnitLoad|MAX_LOAD_FACTOR|UNIT_PLANNED_LOAD_PER_CORE|laptop's load" -- ':!docs/audits/**' ':!docs/plans/**' ':!*.jsonl' ':!floorplan/**'` prints nothing, and `bkit check` passes
  - **TEST FIRST:** n/a — docs only, no behaviour change

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Supersede the knowledge row that prescribes per-suite load budgets
  - **UPDATE:** `docs/knowledge.jsonl`: for key `spawn-heavy-unit-suite-needs-its-own-budget-under-load`, append a same-key row with `status: "SUPERSEDED"` via `bkit ledgers append`, saying the local limit is now a fixed hang limit (#814)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `bkit ledgers query --ledger=knowledge --status=ACTIVE` no longer lists the key
  - **TEST FIRST:** n/a — ledger row, no behaviour change

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Replace the load-scaled factor with a fixed local hang factor — `vitest.timeout-budget.ts`, `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Shipped advice | `.bkit/core/docs/templates/bkit-audit-flakes.md`, `.bkit/templates/docs/testing.md`, `docs/testing.md` | `git grep -l -i "load-scaled"` | each recommends load scaling | EXTEND | Reword to the CI / local split |
