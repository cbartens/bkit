<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) — Sub-Plan 2/3: Analysis + Cadence/Sync/Reconcile (WS-3 + WS-4)

**Parent Plan:** [380-roadmap-analysis-refresh-plan.md](./380-roadmap-analysis-refresh-plan.md)

> [!IMPORTANT]
> **Sub-plan sequencing.** This is sub-plan **2 of 3** (split for session/token budget). Execution order is **1 → 2 → 3**. This sub-plan DEPENDS on sub-plan 1 having landed: `bkit-roadmap-fold.sh` + the in-memory frontier snapshot (Task 3), the four close-hooks (Tasks 6/7), and `docs/roadmap.jsonl` + codec (Tasks 1/2/5). Sibling sub-plans:
>
> - [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) — Foundation + Mechanical tier (WS-1 + WS-2). **Prerequisite.**
> - [380-roadmap-analysis-refresh-plan-3.md](./380-roadmap-analysis-refresh-plan-3.md) — Utility + Cross-provider/docs (WS-5 + WS-6) + full Verification Plan (Gates 2–4, Manual Verification).
>
> **Gates:** this sub-plan owns none of the master's four Gates — Gate 1 (Prerequisites) ran in sub-plan 1; Gates 2–4 + Mandatory Testing/Documentation tasks + Manual Verification run in sub-plan 3 after all three sub-plans' tasks land. Each task below carries its own `Done when` test assertion for local self-verification.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no application stack. "Schema" = the JSONL ledger + generated-artifact contracts. Tests = Vitest (`*.test.ts` / `*.integration.test.ts`) + bats (`tests/*.bats`); no E2E / @live / fresh-DB tiers (`docs/testing.md` § Tiers). Shipped surface must stay stack/vendor-agnostic (`.agents/rules.md`).

## Context & Goals

`docs/roadmap.md` is maintained by hand today, so it goes stale the moment any issue moves between design → plan → build → debug → ship. #380 automates it as a **two-tier generated artifact**: a cheap deterministic **status tier** (built in sub-plan 1) and an opus **analysis tier** rewriting a "best next step" at ship and on-demand.

**This sub-plan (2/3) builds the analysis tier + cadence/sync/reconcile:** the `@bkit-roadmap-refresh` opus leaf, ship Step 10 wiring, the cadence + audit/ledger injection, the reverse tracker-label sync, and the reconcile/recovery pass.

Load-bearing directives resolved here:

- **On-disk-first, tracker-optional sensing** — the analysis reads on-disk artifacts + `deferrals`/`failures.jsonl` + the Backlog region; `list_issues` is additive only when wired.
- **Directive 3** — reverse tracker-label sync (roadmap → tracker) is orchestrator-mediated, settled-drift-guarded, MCP-only, best-effort. **[This sub-plan: Task 11.]**
- **Directive 4 — RESCOPED (design Addendum 3 § O).** The board is a pure projection of `docs/roadmap.jsonl`, so a lost/corrupted board is rebuilt by re-running the fold — no recovery pass needed. What remains is a **drift CHECK**: warn when a live `feat/*` has NO ledger row at all (a close that never wrote). **[This sub-plan: Task 12, rescoped.]**
- Directives 1/2/5 are resolved in sub-plan 1 and are prerequisites here — note Directive 1 (per-FID upsert) is VOID, replaced by the full-regenerate projection over `docs/roadmap.jsonl` (design Addendum 3 § O); Directive 2 is the ledger migration + `completed.md` deletion + bootstrap seed; Directive 5 is the build/debug 4th staging shape.

**Related Issues:**

- `#260` — Milestone Orchestrator autonomous PM loop (open) — `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive.
- `#214` — bkit roadmap (open) — the hand-maintained sequencing reference this feature automates.
- `#209` — Workflow state model (closed) — precedent for the `-X ours` conflict class + Close STRAY-guard.
- `#80` — `bkit-audit` lens engine (open) — the audit-candidate source injected on the cadence (Task 10); a generic "run an audit" reference stands in until it lands.
- `#324` — recurring self-healing audit loop / after-ship trigger (open) — shares the post-merge event substrate; noted, not a dependency.
- `#236` — Post-mortem on consumer debug sessions (closed) — source of the stack-independence rule the roadmap surface must respect.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> Shared across all three sub-plans (human-confirmed once on the master plan). Reproduced verbatim for self-containment. The **Derived Test Matrix** below is scoped to THIS sub-plan's tasks.

### Narrative _(inherited from design — do not rewrite)_

As a bkit user, after I close any workflow phase for an issue, `docs/roadmap.md` shows that issue under its current phase with no manual edit, so anyone — human or agent — can see where every open issue stands. The board is built **primarily from on-disk artifacts so it works with no tracker connected** — the `docs/plans/**` design/plan docs, per-FID `status.jsonl`, the `deferrals`/`failures` ledgers, and a consumer-authored "Backlog / Ideas" region at the bottom of `roadmap.md`; when a tracker IS wired the board is additionally enriched with open tracker issues and their status/readiness. When I ship an issue (or run `/bkit-roadmap` on demand), bkit refreshes an opus-authored "best next step": dependency-aware issue groupings, IDE- and model-aware prompt suggestions (including when NOT to use bkit), and periodically-injected audit and backlog candidates, so I always know what to work on next and how to drive bkit optimally.

### Success Criteria _(inherited from design — do not rewrite)_

1. After every workflow close, `docs/roadmap.md`'s phase-sectioned status board reflects each in-flight issue's current phase, built primarily from on-disk artifacts so it works with NO tracker connected; when a tracker IS wired, additionally enriched via an orchestrator-mediated `list_issues` MCP call (never `gh`/`search_issues`), additive never a precondition. _(Implemented in sub-plan 1.)_
2. A concurrent close, a merge conflict, or an `-X ours` squash never aborts a close or silently corrupts the board — `docs/roadmap.jsonl` is append-only + `merge=union` and the board is fully regenerated from it (design Addendum 3 § O). _(sub-plan 1.)_
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage. **[This sub-plan: Tasks 8/9; on-demand path in sub-plan 3, Task 13.]**
4. Ledger/audit integration fires on a deterministic threshold — counting DISTINCT FIDs that reached `BUILT` in `docs/roadmap.jsonl` since the last cadence FIRE (design Addendum 3 § Q; never `stats.jsonl` rows, which carry no FID by design § R) plus a staleness-days fallback: open `deferrals.jsonl`/`failures.jsonl` items and a #80 audit candidate surface as grouped next-steps. **[This sub-plan: Task 10.]**
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never creates/overwrites it and `bkit check` drift stays clean; only the generator script, the analysis prompt, the utility, the five close-step edits, the ledger migration, and doc-index rows ship.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** any workflow reaches Close **→ THEN** it appends the phase's `docs/roadmap.jsonl` row and the fold FULLY REGENERATES the `roadmap-status` block from the ledger (no upsert — design Addendum 3 § O). _(sub-plan 1.)_
- **WHEN** the squash-merge conflicts on `docs/roadmap.md` (`-X ours`) **→ THEN** it is a non-event: the ledger is append-only + `merge=union` and the next fold regenerates the board from it. _(sub-plan 1.)_
- **WHEN** ship-close runs OR `/bkit-roadmap` is invoked **→ THEN** `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block (best next step + groupings + prompt suggestions), bounded + coverage-stamped. **[This sub-plan: Tasks 8/9.]**
- **WHEN** a ship close (or `/bkit-roadmap`) evaluates the threshold and the distinct-`BUILT`-FID count since the last fire crosses `bkit.roadmap.buildCycles`, OR `bkit.roadmap.stalenessDays` have passed since that fire **→ THEN** the analysis pass fires ONCE, rebaselines via a `ROADMAP_CADENCE_FIRE` counter row, injects a #80 audit candidate + open `deferrals`/`failures` items as grouped next-steps, and reconciles tracker labels to the board (settled drift only, when wired). **[This sub-plan: Tasks 10/11.]**
- **IF** `tracker: none` or the `list_issues` read fails/returns empty **→ THEN** the board is built entirely from on-disk artifacts + the Backlog region (never blank, never gated); every fail-open branch logs `[bkit-roadmap]`.
- **IF** a live `feat/*` FID has NO row in `docs/roadmap.jsonl` (a close that never wrote) **→ THEN** the drift check warns with a `[bkit-roadmap]` line. **[This sub-plan: Task 12.]**

### Concrete Example _(plan expands from design)_

**Setup:** A `tracker: none` consumer repo. Two issues in flight: FID `412-export-csv` has `docs/plans/202607/412-export-csv-design.md` + `-plan.md` on disk and is mid-build on `feat/412-export-csv`; FID `418-rate-limit` has only `418-rate-limit-design.md`. A previously-shipped FID `401-login` sits in `docs/roadmap.jsonl`. The consumer has hand-written two lines under `## Backlog / Ideas` at the bottom of `docs/roadmap.md`.

**Steps (analysis/cadence portion):**

3. User runs `/bkit-roadmap` → `@bkit-roadmap-refresh` reads the frontier snapshot + `deferrals`/`failures.jsonl` + the Backlog region, rewrites `roadmap-analysis` with a ranked best-next-step (folding the two ideas in), stamps "scanned 2 of 2", and appends a `ROADMAP_SCAN_COVERAGE` counter row.
4. A tenth DISTINCT FID reaches `BUILT` in `docs/roadmap.jsonl` since the last `ROADMAP_CADENCE_FIRE` row, crossing `bkit.roadmap.buildCycles`=10 (repeat `BUILT` rows for one FID do not advance it; design Addendum 3 § Q) → the next ship close evaluates the threshold, the cadence fires ONCE and rebaselines via a fresh `ROADMAP_CADENCE_FIRE` row: a #80 audit candidate + the oldest open `deferrals` item surface as grouped next-steps; the shipped FID (`412-export-csv`) gains a `SHIPPED` row, leaves the active phase sections, and appears at the top of the regenerated `## Shipped` section (last 10).

**Outcome:** the analysis block names the next best step, the Backlog survives every regenerate, and cadence/reconcile keep the board honest — all with no tracker connected.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Large tracker (200+ open issues) blows analysis `maxTurns`/context | Bounded scan (open + milestone-scoped, paged), coverage-stamped "scanned N of M" + `ROADMAP_SCAN_COVERAGE` counter row; report budget reserved. |
| Consumer "Backlog / Ideas" region below the last machine marker | NEVER rewritten by any regenerator; a declared read-input for the analysis tier (promotable into design; may suggest filing as an issue when wired). |
| Lost/corrupted/deleted board | Rebuilt exactly by re-running the fold — the board holds no state the ledger lacks (design Addendum 3 § O). The residual risk is a close that never WROTE its row: the drift check diffs live `feat/*` (+ open issues when wired) against `docs/roadmap.jsonl` and WARNS via `[bkit-roadmap]`; it never mutates the board. |
| Backlog region as untrusted analysis input | Analysis prompt treats the Backlog region as DATA, not instructions (prompt-injection surface); folds ideas into ranking, never executes them. |
| `tracker: none` or a `list_issues` read that fails/returns empty | Analysis + reverse sync + reconcile skip the tracker under `none`, treat a wired read that fails/returns 0/empty as inconclusive; never blank, never gated; `[bkit-roadmap]` stderr on every fail-open branch. |
| Reverse-sync candidate is actively transitioning | Only "settled" drift is synced — an issue with NO matching live `feat/{FID}` branch AND NO in-flight `status.jsonl` phase event; anything else is skipped with `[bkit-roadmap]`. |

### Derived Test Matrix _(scoped to this sub-plan)_

> Tiers per `docs/testing.md` § Tiers. Boundary rows reach the real boundary (real `jq`/`sh`, real `git`) and assert a ground-truth signal, never a mock at the boundary. Row numbers preserve the master plan's numbering for cross-reference.

<!-- prettier-ignore -->
| # | Test description | Type | Target file |
| --- | --- | --- | --- |
| 12 | `@bkit-roadmap-refresh` prompt writes ONLY the `roadmap-analysis` marker block and contains no hardcoded model IDs / IDE names | Unit (Vitest) | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |
| 13 | `ROADMAP_SCAN_COVERAGE` counter row conforms to the `.bkit/jsonl.md` counter schema (`counterSource: "model-self-report"`, full envelope) | Unit (Vitest) | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |
| 14 | Cadence: counts DISTINCT `BUILT` FIDs in `docs/roadmap.jsonl` since the last `ROADMAP_CADENCE_FIRE` counter row, fires at `bkit.roadmap.buildCycles`, staleness fallback at `bkit.roadmap.stalenessDays` from that same fire, rebaselines on fire (a long gap yields ONE fire), and both thresholds fall back to their defaults when `bkit.roadmap` is absent | Shell (bats) | `tests/roadmap-cadence.bats` |
| 15 | Reverse tracker sync step is MCP-only, no-op under `tracker: none`, best-effort (never gates the close), settled-drift-guarded | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-sync.integration.test.ts` |
| 16 | Drift check: a live `feat/*` with NO `docs/roadmap.jsonl` row emits a `[bkit-roadmap]` warning; a live `feat/*` that DOES have a row is silent; the check never mutates the board (it is regenerated from the ledger) | Integration (Vitest, boundary: git branches) | `.bkit/src/bkit-roadmap-reconcile.integration.test.ts` |

> [!NOTE]
> **Cross-sub-plan row references.** Task 9 (ship Step 10 wiring) EXTENDS matrix row 11 (per-workflow-shape staging, owned by sub-plan 1) — its assertion that Step 10 launches the three subagents with the analysis write preceding the docs commit is added to `.bkit/src/bkit-roadmap-staging.integration.test.ts`. Task 11's fire/skip/conflict fail-branches are covered by matrix row 22 (owned by sub-plan 1) in `tests/telemetry-failopen.bats`, which this sub-plan extends. Rows 1–11, 19–26 belong to sub-plan 1 (row 26 = the ship `BOOK_PATHS`/`BOOK_ROOT` contract, design Addendum 4 § T); rows 17–18 to sub-plan 3.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced for self-containment; only entries relevant to this sub-plan expanded.

**Proposed names (new artifacts, this sub-plan):**

- `.bkit/prompts/bkit-roadmap-refresh.md` → renders `@bkit-roadmap-refresh` (opus leaf) — writes ONLY the `roadmap-analysis` block.
- Telemetry names: `counterName: "ROADMAP_SCAN_COVERAGE"`; observability prefix `[bkit-roadmap]` (documented in sub-plan 3), `[bkit-analysis]` (cadence, already exists), `[bkit-telemetry]` (counter append, already exists).

Prerequisite names from sub-plan 1 (already landed): `docs/roadmap.jsonl` (`kind: "feature"`, six-state ladder, appended at every phase close — the canonical state); `docs/roadmap.md` (consumer-owned projection, marker blocks `roadmap-status`/`roadmap-analysis`, fully regenerated from the ledger, `## Shipped` capped at 10, `ABANDONED` hidden, bytes outside every marker pair untouched); `.bkit/scripts/bkit-roadmap-fold.sh`; the `bkit.roadmap.{buildCycles,stalenessDays}` manifest keys.

No exported TS symbol signatures change. No consumer command is renamed.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced verbatim for self-containment.

- **RESOLVED (cadence numbers, owner 2026-07-27 — design Addendum 3 § Q):** `bkit.roadmap.buildCycles` = **10** distinct FIDs reaching `BUILT` since the last cadence FIRE; `bkit.roadmap.stalenessDays` = **90**. Anchoring on the last FIRE (not the last analysis refresh) is load-bearing — the analysis block is refreshed at every ship close, so a refresh-anchored counter would reset every ship and never reach the threshold. Both values come from the `package.json` manifest via the existing `bkit.*` jq idiom. **[Load-bearing for Task 10.]**
- **RESOLVED (board scope, owner 2026-07-25 — design Addendum 2 § K):** active phase sections carry open + in-flight FIDs only; on ship the FID leaves them and appears in a separate `## Shipped` section — regenerated from `docs/roadmap.jsonl`, `ts` desc, capped at the last **10**. Closed/abandoned tracker issues are not shown.
- **RESOLVED (`kind: "feature"` codec scope, owner 2026-07-25):** **`bkit harvest` does NOT consume `docs/roadmap.jsonl`** — not copy, not count; `HARVEST_COPY_FILES` and the count-only set are unchanged.
- **Assumption:** the no-concurrent-workflows-per-clone constraint holds → if violated, closes rely on the append-only `merge=union` ledger + regenerate-from-ledger (`-X ours` on the board is a non-event).
- **Assumption:** `docs/roadmap.jsonl` carries a `BUILT` row per built FID (sub-plan 1, Task 7) and `.bkit/stats.jsonl` carries the FID-free `ROADMAP_CADENCE_FIRE` counter → if either is missing the count reads 0 and the cadence never fires (fail-safe, not fail-dangerous). **[Load-bearing for Task 10.]**
- **Assumption:** shipped roadmap/analysis text stays stack/vendor-agnostic and cites no tracker-internal refs (`BAR-`/`KN-`/Linear ids) → if violated, the shipped-surface rule reds `slop`/review.
- **Assumption:** #80 lens engine is NOT landed → the cadence injects a generic "run an audit" next-step referencing the audit prompt family, never a hardcoded stack lens. **[Load-bearing for Task 10.]**

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## Alternative Approaches & Recommendations

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff.

Chosen (relevant to this sub-plan): keep the analysis as a **clean reusable leaf** (`@bkit-roadmap-refresh`) rather than folding it into `@bkit-ship-update-docs` (which would couple it to ship-only doc work and block utility reuse); count the cadence from **distinct `BUILT` FIDs in `docs/roadmap.jsonl` since the last `ROADMAP_CADENCE_FIRE` row** (design Addendum 3 § Q — NOT `.bkit/stats.jsonl` `outcome` rows, which carry no FID by § R, and NOT the non-persisted per-FID `bkit-counter-bus.sh`); reverse sync via `list_issues` never `search_issues` (silently returns 0 on private repos), treating 0/empty as inconclusive.

Rejected: folding analysis into ship-update-docs; `search_issues` for tracker reads; counting the cadence off `stats.jsonl` `outcome` rows (would require a FID in a harvested ledger — § R).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| #80 lens engine (the concrete audit lenses) | Depends on #80 landing; cadence injects a generic "run an audit" reference until then | `#80` |
| ~~Persisted `roadmap.jsonl` event log / durable cross-tick frontier history~~ | **NOW IN SCOPE** — `docs/roadmap.jsonl` IS that event log (design Addendum 3 § N) | In scope, sub-plan 1; the `380-persisted-frontier-snapshot-event-log-for-260` deferral is closed in sub-plan 3, Task 14 |
| `bkit harvest` / `bkit analysis` ingestion of `docs/roadmap.jsonl` | DECIDED out (owner 2026-07-25) — neither copied nor counted | Not planned |

> [!CAUTION]
> **Candidates, not scope.** `github-mcp-search-issues-silently-returns-zero-private-repo` (`docs/failures.jsonl`) + `tracker-read-path-corroboration-outside-mcp-private-repo` (#341, `docs/deferrals.jsonl`) overlap the tracker-read path here (Tasks 11) — both KEEP DEFERRED: honored by mandating `list_issues` (never `search_issues`), treating 0/empty as inconclusive, with the on-disk-first floor as the mitigation. Do not fold in.

## Security & Privacy

> Reference: `docs/security.md`. bkit ships no runtime server; observability is CLI stdout/stderr (`docs/observability.md`).

- [ ] **User input** — the consumer "Backlog / Ideas" region is free-form text READ by `@bkit-roadmap-refresh` as a prompt input. Treat it as **untrusted data, not instructions** (prompt-injection surface): fold ideas into the ranking, never execute embedded directives.
- [ ] **Tracker MCP read** — `list_issues` is read-only, best-effort, and only when a tracker is wired; reuses the existing configured tracker MCP credential (no new secret). Never `gh`/`search_issues`.
- [ ] **Tracker MCP write (reverse sync)** — label reconciliation writes via the configured tracker MCP only (`.agents/rules.md` § Tracker MCP), best-effort, idempotent, never gates. No new scope beyond existing label-write.
- [ ] **PII** — none. Roadmap rows carry FIDs + issue titles + phase only. Shipped text stays stack/vendor-agnostic, no `BAR-`/`KN-`/Linear internal ids.

_No new routes, DB writes, or secrets._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable.

### Core (always verify)

- [ ] **Prerequisite Plans:** [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) (WS-1/WS-2) MUST be fully executed + verified first — this sub-plan reads its `bkit-roadmap-fold.sh` + frontier snapshot, the four close-hooks, and `docs/roadmap.jsonl`.
- [ ] **Package Management:** No new npm deps (jq + shell + Vitest + bats present). Confirm `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** `pnpm --version`, `npx tsc --version`, `jq --version`, `npx bats --version` present.
- [ ] **Existing-solution search (reuse over duplicate):** analysis reuses `plan-complexity-check` (when-NOT-to-use) + `design-organise` grouping seam; the leaf reuses the `@bkit-ship-update-docs`/`@bkit-ship-summary` leaf frontmatter shape; cadence reuses the persisted `.bkit/stats.jsonl` `outcome` rows (NOT `bkit-counter-bus.sh`); `ROADMAP_SCAN_COVERAGE` reuses the `.bkit/jsonl.md` counter envelope.
- [ ] **User Context:** read/write access to `.bkit/**`, `docs/**`, `tests/**` confirmed.
- [ ] **Pending Blockers:** query the tracker for open `blocker`-labelled issues touching `bkit-ship.md` / the analysis prompt.
- [ ] **Project Context:** `docs/knowledge.jsonl` + `docs/decisions.jsonl` read for: `list_issues`-not-`search_issues`, the dev-lock idiom, `-X ours` conflict class (#209), settled-vs-transitioning predicate.
- [ ] **Testing & Quality:** strategy aligns with `docs/testing.md` § Tiers + § Counter derivation test coverage (bats pattern for shell logic over a real `.bkit/stats.jsonl`).

### Conditional (verify only when applicable)

- [ ] **Observability** _(new log points)_: `[bkit-roadmap]` fail-open lines (reverse-sync fire/skip/conflict; reconcile) are added to `docs/observability.md` in sub-plan 3 (Task 14). `[bkit-analysis]` (cadence advance/fire) + `[bkit-telemetry]` (counter append) already exist — reuse.
- [ ] **Architecture & Cross-provider** _(new agent + edited workflow)_: the new `.bkit/prompts/bkit-roadmap-refresh.md` + edited `.bkit/workflows/bkit-ship.md` require mirror regen — batched at session end in sub-plan 3 (WS-6), NOT per-edit here.

## Data Schema Integration

bkit has no database. **Invariant conformance:** every write path is best-effort append (`|| echo "[bkit-…] append failed"`) that exits 0 and never gates a workflow.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** the in-memory frontier snapshot (fold output from sub-plan 1); `docs/deferrals.jsonl` + `docs/failures.jsonl` (backlog candidates, ranked severity then age); `.bkit/stats.jsonl` `outcome` rows where `workflow=="ship"` (cadence count); the `## Backlog / Ideas` region of `docs/roadmap.md` (analysis input, untrusted data); tracker `list_issues` rows (only when wired); live `feat/*` branches + per-FID `status.jsonl` (settled-drift predicate + reconcile).
- **Output (Write):** `docs/roadmap.md` `roadmap-analysis` block; `.bkit/stats.jsonl` `ROADMAP_SCAN_COVERAGE` counter row; tracker `bkit:*` labels (reverse sync, when wired); `docs/roadmap.md` `roadmap-status` re-added/flagged rows (reconcile).

### Data Schema Changes

- **ADD** counter name `ROADMAP_SCAN_COVERAGE` (existing `counter` kind; `counterSource: "model-self-report"`; `counterValue` = issues scanned or scanned/total ×100). Documented in `.bkit/jsonl.md` in sub-plan 3 (Task 14).
- **NO** new ledger or codec change (that landed in sub-plan 1). **NO** change to `status.jsonl` schema.

## Architecture & Component Changes

**CRITICAL:** Workflow/prompt SSOT is `.bkit/workflows/*.md` + `.bkit/prompts/*.md`; `bkit install` renders host mirrors. Every `[NEW]` reuses an existing pattern (justified inline). **Mirror regen is batched to sub-plan 3 (WS-6) — do NOT run `bkit install` per-edit here.**

### Analysis tier (WS-3)

#### [NEW] `.bkit/prompts/bkit-roadmap-refresh.md` → `@bkit-roadmap-refresh`

- Opus leaf writing ONLY the `roadmap-analysis` block. Reads the frontier snapshot + `.agents/docs.md` + `deferrals`/`failures.jsonl` + the `## Backlog / Ideas` region (as untrusted data). Writes: ranked best-next-step (folding ideas in), dependency-aware groupings (reuse `design-organise` seam), prompt suggestions (bkit-optimal usage; when-NOT-to-use via `plan-complexity-check`; IDE from install config; model recommendations by doctrine-reference; opus-plans/sonnet-executes shape). No hardcoded model IDs / IDE names. Bounded scan, report budget reserved, "scanned N of M" stamp + a `ROADMAP_SCAN_COVERAGE` counter row (`[bkit-telemetry]` fail-open). Reuses the `@bkit-ship-update-docs`/`@bkit-ship-summary` leaf frontmatter shape.

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Step 10

- **Existence Check (post-#384, verified on `dev` at `e14fe9f4`):** Step 10 starts at line 942 and today launches exactly TWO subagents — its prose reads "Launch **both** subagents in parallel using `Agent` tool" (line 948, item 3) with an item-4 wait/assert on their artifacts; Gate 10 is at line 995. Add `@bkit-roadmap-refresh` as the THIRD (alongside `@bkit-ship-update-docs` ‖ `@bkit-ship-summary`): update that "both" wording to three, give the leaf the same `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")"` Context preamble the siblings carry, and add its `docs/plans/{YYYYMM}/logs/{FID}/roadmap-refresh.md` artifact to the Step-4 non-empty assertion and the Gate-10 checklist.
- **Commit ordering:** there is NO `git add -- docs/` in `bkit-ship.md` any more (design Addendum 4 § T). Ship flushes ALL bookkeeping in ONE path-scoped commit at Step 13 Close (`git -C "$WT" add $BOOK_PATHS` → `git commit … -- $BOOK_PATHS`, lines ~1257–1258), and `docs/roadmap.md` + `docs/roadmap.jsonl` are in `BOOK_PATHS` from sub-plan 1 Task 5. So the Step-10 analysis write provably precedes the Step-13 staging by step order, and the block is never left written-but-uncommitted. The write itself targets `$BOOK_ROOT` (Step 1), not a bare relative path.

### Cadence + reverse sync + reconcile (WS-4)

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (cadence step)

- **Existence Check:** exists. Count DISTINCT FIDs whose `docs/roadmap.jsonl` status reached `BUILT` since the last `ROADMAP_CADENCE_FIRE` counter row in `.bkit/stats.jsonl` — NEVER from `stats.jsonl` `outcome` rows (they carry no FID by design Addendum 3 § R) and never `bkit-counter-bus.sh` (non-persisted, per-FID). Fire when that count crosses `bkit.roadmap.buildCycles` (default 10) OR `bkit.roadmap.stalenessDays` (default 90) have passed since the same fire — NOT since the analysis-refresh `ts`, which advances every ship and would reset the counter. On fire: append a fresh `ROADMAP_CADENCE_FIRE` counter row (rebaseline — a long gap yields ONE fire, not a backlog), inject a #80 audit candidate (generic "run an audit" until #80 lands) + open `deferrals`/`failures` items (severity then age) as grouped next-steps into the analysis pass; `[bkit-analysis]` line on counter-advance AND injection-fire. Thresholds resolve through `.bkit/src/bkit-manifest.ts` defaults. The count + staleness comparison MUST be a discrete, sourceable jq/shell expression (the Pre-Flight "counter derivation bats pattern"), NOT inline orchestrator prose — so the bats row exercises real logic, never a text grep.
- **Reverse tracker sync (Directive 3):** orchestrator-mediated (leaf prompts have no tracker MCP tools), MCP-only, best-effort, idempotent, no-op under `tracker: none`; reconcile ONLY settled drift — an issue is "settled" (eligible) ONLY when it has NO matching live `feat/{FID}` branch AND NO in-flight `status.jsonl` phase event for that FID; anything else is actively transitioning and is skipped; `[bkit-roadmap]` on fire/skip/conflict.
- **Drift check (Directive 4, rescoped):** diff live `feat/*` branches (+ open `list_issues` when wired) against `docs/roadmap.jsonl`; WARN on any live `feat/*` with no ledger row (a close that never wrote — the board itself needs no recovery, it is regenerated); `[bkit-roadmap]` line.

### Cron Jobs & Scheduled Tasks

None — all triggers are workflow-close-driven or on-demand; no scheduler.

## Documentation Updates

> Cross-cutting docs (`observability.md`, `decisions.jsonl`, `knowledge.jsonl`, `testing.md`, `.bkit/jsonl.md`) are applied in sub-plan 3, Task 14, and MUST include this sub-plan's additions:
>
> - `docs/observability.md` — `[bkit-roadmap]` reverse-sync fire/skip/conflict + reconcile fail-open lines.
> - `docs/knowledge.jsonl` — `list_issues`-not-`search_issues` (0/empty inconclusive); settled-vs-transitioning reverse-sync predicate.
> - `docs/testing.md` — `tests/roadmap-cadence.bats` + `bkit-roadmap-refresh-prompt.test.ts` / `bkit-roadmap-sync.integration.test.ts` / `bkit-roadmap-reconcile.integration.test.ts`.
> - `.bkit/jsonl.md` — note `ROADMAP_SCAN_COVERAGE` as a `counterName`.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` — all changes are an additive prompt file + workflow-step edits | No DB. Reverting drops the analysis/cadence/sync/reconcile additions; the status tier (sub-plan 1) is unaffected. |
| **Mirrors** | `bkit install` re-renders host mirrors from the reverted SSOT (run in sub-plan 3) | Mirrors are force-overwritten, not drift-gated. |
| **Risk window** | None — no deploy, no migration apply |  |

_Code-only — `git revert` sufficient; re-run `bkit install` (sub-plan 3) to re-render mirrors._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) via configured tracker MCP before stopping.
> **Never drop work silently:** deferrals → `docs/deferrals.jsonl`, bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing entries first).
> **Ordering:** analysis → cadence → reverse sync → reconcile. Each task fully complete (verification + checkbox) before the next. Gates 2–4 + Mandatory Testing/Documentation + Manual Verification run in sub-plan 3.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Test-bearing `Done when` entries map to exactly one `Derived Test Matrix` row.

### Analysis tier (WS-3)

- [ ] **Task 8 — `@bkit-roadmap-refresh` leaf.** Create `.bkit/prompts/bkit-roadmap-refresh.md` (opus leaf) writing ONLY `roadmap-analysis`; reads frontier snapshot + `deferrals`/`failures.jsonl` + Backlog region (as untrusted data); groupings via `design-organise` seam; prompt suggestions via `plan-complexity-check`; no hardcoded model IDs/IDE; "scanned N of M" + `ROADMAP_SCAN_COVERAGE` counter row. **Done when:** `bkit-roadmap-refresh-prompt.test.ts` asserts the prompt writes only the `roadmap-analysis` marker block + contains no model-ID/IDE literals (matrix row 12) and the emitted `ROADMAP_SCAN_COVERAGE` counter row conforms to the jsonl.md counter schema (matrix row 13).
- [ ] **Task 9 — ship Step 10 wiring.** Add `@bkit-roadmap-refresh` as the third parallel subagent in `bkit-ship.md` Step 10 (line 942; the "Launch both subagents" line is 948, Gate 10 is 995): rewrite that "both" prose to three, give the leaf the sibling Context/working-directory preamble, write under `$BOOK_ROOT`, and add its artifact to the Step-4 non-empty assertion + the Gate-10 checklist. Staging is the Step-13 `BOOK_PATHS` commit from sub-plan 1 Task 5 — do NOT add a Step-10 `git add`/`git commit` of `docs/` (design Addendum 4 § T; `bkit-ship-invariants.test.ts` bans it). **Done when:** `bkit-roadmap-staging.integration.test.ts` confirms Step 10 launches three subagents, names the `roadmap-refresh.md` artifact in the wait/assert list and Gate 10, and that the Step-10 write precedes the single Step-13 `BOOK_PATHS` commit by step order with no new `git add` introduced in Step 10 (extends matrix row 11 audit); `bkit-ship-invariants.test.ts` still green (matrix row 26); `bkit check` clean.

### Cadence + reverse sync + reconcile (WS-4)

- [ ] **Task 10 — cadence + audit/ledger injection.** Add the cadence step counting DISTINCT `BUILT`-status FIDs in `docs/roadmap.jsonl` since the last `ROADMAP_CADENCE_FIRE` counter row (fire at `bkit.roadmap.buildCycles` = 10, staleness `bkit.roadmap.stalenessDays` = 90 measured from that same fire, both read from the `package.json` manifest with `.bkit/src/bkit-manifest.ts` defaults); on fire append a fresh FID-free `ROADMAP_CADENCE_FIRE` row (rebaseline), inject a generic #80 audit candidate + open `deferrals`/`failures` grouped next-steps; `[bkit-analysis]` on advance/fire. Evaluation happens at ship close + `/bkit-roadmap` only — a skipped ship delays a fire but never loses one, since the count accrues on build closes. The count + staleness comparison MUST be a discrete, sourceable jq/shell expression (the Pre-Flight "counter derivation bats pattern"), NOT inline orchestrator prose. **Done when:** `tests/roadmap-cadence.bats` (real fixture ledger + `.bkit/stats.jsonl`, sourcing the discrete expression) proves the count crosses at the 10th distinct `BUILT` FID, that repeat `BUILT` rows for ONE FID do not advance it, that the staleness path fires from an old fire row, that firing rebaselines so a 25-FID gap yields exactly one fire, and that absent `bkit.roadmap` keys fall back to 10/90 (matrix row 14).
- [ ] **Task 11 — reverse tracker sync (Directive 3).** Add the orchestrator-mediated, MCP-only (never `gh`/`search_issues`), settled-drift-guarded, best-effort, no-op-under-`none` reverse label sync to the cadence step; `[bkit-roadmap]` on fire/skip/conflict, each branch exit 0. Make the settled-vs-transitioning predicate concrete + testable: an issue's drift is "settled" (eligible for reverse sync) ONLY when it has NO matching live `feat/{FID}` branch AND NO in-flight `status.jsonl` phase event for that FID; otherwise it is actively transitioning and is skipped (`[bkit-roadmap]`). **Done when:** `bkit-roadmap-sync.integration.test.ts` (boundary: workflow files) asserts the sync is MCP-only, guarded by the tracker-mode marker, encodes the settled predicate (no live `feat/{FID}` AND no in-flight `status.jsonl` phase event), and is wrapped so it never gates the close (matrix row 15); the fire/skip/conflict fail branches exit 0 (covered by matrix row 22 in `tests/telemetry-failopen.bats`, extended here from sub-plan 1).
- [ ] **Task 12 — drift check (Directive 4, rescoped).** Add the check diffing live `feat/*` (+ open issues when wired) against `docs/roadmap.jsonl` and WARNING via `[bkit-roadmap]` on any live `feat/*` with no ledger row — a close that never wrote. It never mutates the board (the board is regenerated from the ledger, so there is nothing to recover) and never gates. **Done when:** `bkit-roadmap-reconcile.integration.test.ts` (boundary: real git branches) proves a live `feat/*` without a ledger row warns, one with a row is silent, and neither path writes to `docs/roadmap.md` (matrix row 16).

> [!IMPORTANT]
> **Handoff to sub-plan 3.** After Tasks 8–12 land, sub-plan 3 (Utility + Cross-provider/docs) reuses the drift check (Task 12 — warn-only, never mutates the board) inside `/bkit-roadmap` (Task 13) and the `@bkit-roadmap-refresh` leaf, then batches all mirror regen + cross-cutting docs + the full Verification Plan (Gates 2–4, Manual Verification).

## Verification (scoped to this sub-plan)

> Full Gate 2/3/4 checkpoints + Manual Verification run in sub-plan 3. Locally verify THIS sub-plan's tasks with their `Done when` assertions before handoff:

- [ ] **Local gate suite on changed files:** `pnpm typecheck` + `pnpm lint` + `pnpm format:check` + `pnpm lint:prose` + `pnpm bkit check` green on the changed files. Do NOT weaken any gate.
- [ ] **This sub-plan's tests pass:** `pnpm test` for `bkit-roadmap-refresh-prompt.test.ts`, `bkit-roadmap-sync.integration.test.ts`, `bkit-roadmap-reconcile.integration.test.ts`, and the extended `bkit-roadmap-staging.integration.test.ts` Step-10 audit; `npx --yes bats tests/roadmap-cadence.bats tests/telemetry-failopen.bats`.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`.

<!-- bkit:end -->
