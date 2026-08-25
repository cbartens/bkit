Verdict: PASS
<!-- verdict:end -->

# Ship Bookkeeping — Plan Complexity Split (v4 Parent Index)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. This is the **parent index**. The full feature context (Acceptance Scenario, Success Criteria, Breaking Changes, Open Questions, Architecture, Supersession Inventory, Rollback) lives in `plan-v3-checked.md` — read it ONCE.
> 2. Each child sub-plan (`384-ship-bookkeeping-plan-1.md`, `384-ship-bookkeeping-plan-2.md`, `384-ship-bookkeeping-plan-3.md`) is **self-contained**: it re-states the design slice it owns, carries its own task list, and ends with its own gate.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in each sub-plan. `[ ]` = NOT DONE.

**Parent Plan (checked):** `docs/plans/202607/logs/384-ship-bookkeeping/plan-v3-checked.md`
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`)
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384

---

## Partition Rationale

The checked plan (`plan-v3-checked.md`, `Verdict: PASS`) holds 12 tasks (Task 0–11) and 4 gates across shell scripts, bats, vitest, a 1278-line structural rewrite, rendered mirrors, 6 docs, a new detector module, and consumer-repo E2E. The complexity check (`plan-complexity-check.md`, `Verdict: SPLIT`) estimates ~140K tokens end-to-end — ~1.6× the 85K single-session threshold. The RED→GREEN Tier-2 invariant is the plan's central quality mechanism and would be jeopardised by attempting the rewrite (Task 7) in the same session as 11 other tasks.

The split is **lossless** along clean, tested dependency seams. Each seam is a verifiable artifact the next sub-plan treats as a stable input:

- **Seam 1 (Sub-plan 1 → 2):** tested `bkit-ship-gate.sh` (10 bats cases pass) + the `BOOK_ROOT`/`BOOK_PATHS` contract published as a RED Tier-2 invariant test + config keys + stub harness. These are proven before any prose is touched.
- **Seam 2 (Sub-plan 2 → 3):** the rewritten `bkit-ship.md` (Tier-2 invariant test GREEN) + byte-identical rendered mirrors + re-sectioned `.bkit/workflows.md`. These are the final workflow shape the docs and detector parse.

The critical path holds across the seam: **tested gate (SP1) → RED→GREEN invariant + final workflow shape (SP2) → docs/detector/E2E against that shape (SP3).** No deviation from the complexity check's proposed 3-way partition — it is the cleanest lossless seam available (each sub-plan is comfortably under 85K; a 4-way split would only add context-reload overhead).

---

## Sub-Plan Dependency Graph

```
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 1 — Foundations & Tier-1 Gate      │
                       │  Tasks 0, 1, 2, 3, 4   (~33K est.)           │
                       │  In:  none                                  │
                       │  Out: config keys · gh stub harness ·        │
                       │       Tier-2 invariant RED · tested gate     │
                       │       (10 bats cases GREEN)                  │
                       └──────────────────────┬──────────────────────┘
                                              │ Seam 1
                                              ▼
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 2 — Hardening, Rewrite & Mirrors   │
                       │  Tasks 5, 6, 7, 8       (~44K est.)          │
                       │  In:  tested gate (SP1 T4) · BOOK_ROOT       │
                       │       contract (SP1 T3) · config (SP1 T1)    │
                       │  Out: hardened Failure Path + Step 12 ·      │
                       │       structural rewrite (Tier-2 GREEN) ·    │
                       │       byte-identical mirrors + workflows.md  │
                       └──────────────────────┬──────────────────────┘
                                              │ Seam 2
                                              ▼
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 3 — Docs, Detector & E2E           │
                       │  Tasks 9, 10, 11        (~26K est.)          │
                       │  In:  final workflow shape (SP2 T7) ·        │
                       │       mirrors (SP2 T8)                      │
                       │  Out: 6 docs + decisions ledger · Tier-3     │
                       │       advisory detector · consumer-repo E2E  │
                       └─────────────────────────────────────────────┘
```

**Seam contracts (hard):**

- Sub-plan 2's first task (Task 5) re-verifies Sub-plan 1's outputs landed: `bkit-ship-gate.sh` + `tests/ship-gate.bats` exist and `pnpm test:bats tests/ship-gate.bats` passes; `.bkit/src/bkit-ship-invariants.test.ts` exists and is RED against current `bkit-ship.md`.
- Sub-plan 3's first task (Task 9) re-verifies Sub-plan 2's outputs landed: `.bkit/src/bkit-ship-invariants.test.ts` is GREEN; `bkit check` reports no `bkit-rendered-prompts-stale` drift; `.bkit/workflows.md` ship section reflects new shape.

---

## Per-Sub-Plan Summary

<!-- prettier-ignore -->
| Sub-plan | File | Tasks | Est. tokens | Predecessor verification | Own gate |
| --- | --- | --- | --- | --- | --- |
| **1 — Foundations & Tier-1 Gate** | `384-ship-bookkeeping-plan-1.md` | 0, 1, 2, 3, 4 | ~33K | none (fresh start) | SP1 Gate (tested gate GREEN + invariant RED) |
| **2 — Hardening, Rewrite & Mirrors** | `384-ship-bookkeeping-plan-2.md` | 5, 6, 7, 8 | ~44K | SP1 gate + bats + RED invariant re-verified (Task 5 prelude) | SP2 Gate (invariant GREEN + mirrors byte-identical) |
| **3 — Docs, Detector & E2E** | `384-ship-bookkeeping-plan-3.md` | 9, 10, 11 | ~26K | SP2 mirrors + GREEN invariant re-verified (Task 9 prelude) | SP3 Gate (docs published + detector advisory + E2E report) |

### Lossless Coverage

- **Original tasks (plan-v3-checked):** Task 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 → **12 tasks**.
- **Across sub-plans:** SP1 = {0,1,2,3,4} · SP2 = {5,6,7,8} · SP3 = {9,10,11} → **12 tasks**. Each task appears in **exactly one** sub-plan; `Done when` entries copied verbatim.
- **Original gates (Gate 1–4):** Gate 1 (human-review prerequisites) is confirmed once at the feature level (`plan-v3-checked.md`) and inherited by every sub-plan. Gates 2–4 (code / testing / automated verification) are sliced per sub-plan: each sub-plan carries the gate scope its tasks own, plus the predecessor-seam verification. The full Gate 4 suite (`pnpm test && pnpm test:bats && pnpm bkit check`) is re-run at every sub-plan boundary.
- **Total est. tokens:** ~103K across 3 sessions (vs ~140K single-session) — every sub-plan < 85K.

---

## Preserved Corrections (plan-v3-checked)

Every correction from `plan-v3-checked.md` is carried into the relevant sub-plan verbatim. This section is the cross-check index:

- **Real post-#341 ship marker** (`bkit_runtime_row ship` / `RUNTIME_DEVPUSHES`) — **SP1, Task 0** Done-when.
- **gh PATH-shim reuse** (not "first-of-its-kind") — **SP1, Task 2** (extends `bkit-runtime.bats:44-58`) + **SP1 Gate** no-bolt-on box.
- **8-path frozen `BOOK_PATHS` allow-list** — **SP1, Task 3** positive-presence assertion.
- **Mode-3 deferral cross-reference** (`384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`) — **SP3, Task 11** Mode-3 gap.
- **`bkit-dogfood-noop.integration.test.ts` ownership** (Task 6 sole owner; Tasks 1+4 use manual `diff`) — **SP1, Tasks 1 & 4** Done-when; **SP2, Task 6** sole ownership.
- **Path-scoped staging** (never `git add -A` / blanket `docs/`) — **SP1, Task 3**; enforced GREEN by **SP2, Task 7**.
- **`[skip ci]` hygiene** (single path-scoped close commit) — **SP2, Task 7** Steps 7+.
- **`CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional `BOOK_ROOT`** (explicit Step-1 bullet) — **SP2, Task 7** (review-1 m4).
- **Timeout literals sourced from `bkit-ship-timeouts.sh`** (no third source of truth) — **SP2, Task 7** Step 5 (review-3 m2).
- **Preserve Task 5's Failure Path block in the rewrite** (review-2 MINOR 4) — **SP2, Task 7**.
- **Task 8 must not drop Task 5's `.deferred-blocked` writer wire-in** (scope-check-1 MINOR-2) — **SP2, Task 8**.

---

## Execution Order

1. **Execute `384-ship-bookkeeping-plan-1.md`** end-to-end (Tasks 0 → 4). Land SP1 Gate: tested gate GREEN, Tier-2 invariant RED.
2. **Execute `384-ship-bookkeeping-plan-2.md`** (Tasks 5 → 8), starting with the SP1-seam verification prelude. Land SP2 Gate: invariant GREEN, mirrors byte-identical.
3. **Execute `384-ship-bookkeeping-plan-3.md`** (Tasks 9 → 11), starting with the SP2-seam verification prelude. Land SP3 Gate: docs published, detector advisory, E2E report written.

Each sub-plan is independently buildable + verifiable against its own gate. Merge is one squash-merged PR to `dev` per the workflow's hard rule (see `plan-v3-checked.md` § Merge Method).
