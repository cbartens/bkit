<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) — Sub-Plan 3/3: Utility + Cross-provider/docs + Verification (WS-5 + WS-6)

**Parent Plan:** [380-roadmap-analysis-refresh-plan.md](./380-roadmap-analysis-refresh-plan.md)

> [!IMPORTANT]
> **Sub-plan sequencing.** This is sub-plan **3 of 3** (split for session/token budget) and runs LAST. It DEPENDS on both prior sub-plans having landed. Sibling sub-plans:
>
> - [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) — Foundation + Mechanical tier (WS-1 + WS-2). **Prerequisite.**
> - [380-roadmap-analysis-refresh-plan-2.md](./380-roadmap-analysis-refresh-plan-2.md) — Analysis + Cadence/Sync/Reconcile (WS-3 + WS-4). **Prerequisite.**
>
> **Gates:** this sub-plan owns **Gate 2 (Code Implementation)**, the **Mandatory Testing & Documentation tasks**, **Gate 3 (Testing & Documentation)**, the **full Verification Plan** (Automated Tests), **Gate 4 (Automated Verification)**, and **Manual Verification** — they run once here against the fully-merged foundation + analysis work. Gate 1 (Prerequisites) ran in sub-plan 1.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no application stack. "Schema" = the JSONL ledger + generated-artifact contracts. Tests = Vitest (`*.test.ts` / `*.integration.test.ts`) + bats (`tests/*.bats`); no E2E / @live / fresh-DB tiers (`docs/testing.md` § Tiers). Shipped surface must stay stack/vendor-agnostic (`.agents/rules.md`).

## Context & Goals

`docs/roadmap.md` is maintained by hand today, so it goes stale the moment any issue moves between design → plan → build → debug → ship. #380 automates it as a **two-tier generated artifact** (status tier in sub-plan 1; analysis tier in sub-plan 2).

**This sub-plan (3/3) finishes the feature:** the on-demand `/bkit-roadmap` utility workflow, the deferral closure + observability/ledger doc updates, the cross-provider mirror regen + `.bkit/version` hash refresh, and then the whole feature's Gate 2/3/4 checkpoints + Verification Plan + Manual Verification (run once against the fully-merged sub-plans 1–3).

Load-bearing directives touched here:

- **Directive 5 (deferral closure)** — the `380-dev-located-roadmap-status-write-for-build-debug-closes` deferral (superseded by Addendum C, built in sub-plan 1 Task 7) is marked `CLOSED` here (Task 14).
- All five directives are verified complete at Gate 2 (they are implemented across sub-plans 1/2; this sub-plan asserts they landed).

**Related Issues:**

- `#260` — Milestone Orchestrator autonomous PM loop (open) — `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive.
- `#214` — bkit roadmap (open) — the hand-maintained sequencing reference this feature automates.
- `#209` — Workflow state model (closed) — precedent for the `-X ours` conflict class + mirror-not-drift-gated behaviour.
- `#80` — `bkit-audit` lens engine (open) — cadence audit-candidate source (sub-plan 2); generic reference until it lands.
- `#324` — recurring self-healing audit loop / after-ship trigger (open) — shares the post-merge event substrate; noted, not a dependency.
- `#236` — Post-mortem on consumer debug sessions (closed) — source of the stack-independence rule.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> Shared across all three sub-plans (human-confirmed once on the master plan). Reproduced verbatim for self-containment. The **Derived Test Matrix** below is scoped to THIS sub-plan's tasks; the **full 22-row matrix coverage** is re-asserted at the Mandatory "Verify test coverage" task.

### Narrative _(inherited from design — do not rewrite)_

As a bkit user, after I close any workflow phase for an issue, `docs/roadmap.md` shows that issue under its current phase with no manual edit, so anyone — human or agent — can see where every open issue stands. The board is built **primarily from on-disk artifacts so it works with no tracker connected** — the `docs/plans/**` design/plan docs, per-FID `status.jsonl`, the `deferrals`/`failures` ledgers, and a consumer-authored "Backlog / Ideas" region at the bottom of `roadmap.md`; when a tracker IS wired the board is additionally enriched with open tracker issues and their status/readiness. When I ship an issue (or run `/bkit-roadmap` on demand), bkit refreshes an opus-authored "best next step": dependency-aware issue groupings, IDE- and model-aware prompt suggestions (including when NOT to use bkit), and periodically-injected audit and backlog candidates, so I always know what to work on next and how to drive bkit optimally.

### Success Criteria _(inherited from design — do not rewrite)_

1. After every workflow close, the phase-sectioned status board reflects each in-flight issue's current phase, built primarily from on-disk artifacts (no tracker needed); tracker-enriched via `list_issues` when wired (never `gh`/`search_issues`), additive never a precondition. _(sub-plan 1.)_
2. A concurrent close / merge conflict / `-X ours` squash never aborts a close or silently corrupts the board — deterministically regenerable per-FID. _(sub-plan 1.)_
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage. **[On-demand `/bkit-roadmap` path: this sub-plan, Task 13; ship path: sub-plan 2.]**
4. Ledger/audit integration fires on a deterministic threshold. _(sub-plan 2.)_
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never creates/overwrites it and `bkit check` drift stays clean; only the generator script, the analysis prompt, the utility, the five close-step edits, the ledger migration, and doc-index rows ship. **[Verified end-to-end here: Manual Verification Step 1 + matrix row 18.]**

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** any workflow reaches Close **→ THEN** the fold upserts only the closing FID's row. _(sub-plan 1.)_
- **WHEN** ship-close runs OR `/bkit-roadmap` is invoked **→ THEN** `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block, bounded + coverage-stamped. **[On-demand path: Task 13.]**
- **WHEN** the persisted ship-close count crosses `N` (or the staleness threshold) **→ THEN** the analysis pass injects a #80 audit candidate + open `deferrals`/`failures` items, and reconciles tracker labels (settled drift only, when wired). _(sub-plan 2.)_
- **IF** `tracker: none` or the `list_issues` read fails/returns empty **→ THEN** the board is built entirely from on-disk artifacts + the Backlog region (never blank, never gated); every fail-open branch logs `[bkit-roadmap]`.
- **IF** a live in-flight `feat/*` FID is missing from the board **→ THEN** the reconcile pass re-adds/flags it; `/bkit-roadmap` runs that reconcile on demand. **[Task 13 wires the reconcile into the utility.]**

### Concrete Example _(plan expands from design)_

**Setup:** A `tracker: none` consumer repo with in-flight FIDs on disk, a shipped FID in `docs/roadmap.jsonl`, and two hand-written `## Backlog / Ideas` lines.

**Steps (utility portion):**

3. User runs `/bkit-roadmap` → the utility runs the mechanical fold + the reconcile pass + invokes `@bkit-roadmap-refresh`, refreshing BOTH blocks outside the close cycle (so the human's explicit "fix my board now" entry point also re-adds lost in-flight rows without waiting for the next cadence fire), stamps "scanned N of M", and appends a `ROADMAP_SCAN_COVERAGE` counter row.

**Outcome:** `docs/roadmap.md` shows every in-flight FID under exactly one phase section with zero manual edits, the Backlog survives every regenerate, and the analysis block names the next best step — all with no tracker connected.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `docs/roadmap.md` on `bkit install` | NEVER created/overwritten by install (consumer-owned); `bkit check` drift stays clean. (Matrix row 18.) |
| `docs/roadmap.jsonl` empty on rollout day | `bkit telemetry migrate` (fifth pair) ports historically-shipped FIDs and DELETES `completed.md`; by DE-39 it is never auto-run at `bkit upgrade`, so rollout = install advisory + the fold's transitional `completed.md` grep fallback until the consumer runs it. (Verified in Manual Verification Step 1.) |
| Human runs `/bkit-roadmap` with a lost in-flight row | The utility's reconcile pass re-adds/flags it on demand (no wait for cadence). |
| Consumer "Backlog / Ideas" region below the last machine marker | NEVER rewritten by any regenerator; a declared read-input for the analysis tier. |

### Derived Test Matrix _(scoped to this sub-plan)_

> Tiers per `docs/testing.md` § Tiers. Row numbers preserve the master plan's numbering for cross-reference. The Mandatory "Verify test coverage" task below re-asserts ALL 22 rows across sub-plans 1–3.

<!-- prettier-ignore -->
| # | Test description | Type | Target file |
| --- | --- | --- | --- |
| 17 | `/bkit-roadmap` utility invokes the mechanical fold + `@bkit-roadmap-refresh`; renders to all three hosts | Unit (Vitest) | `.bkit/src/bkit-roadmap-utility.test.ts` |
| 18 | `docs/roadmap.md` consumer-owned: `bkit install` never creates/overwrites it and `bkit check` drift stays clean | Integration (Vitest) | `.bkit/src/bkit-install.integration.test.ts` (new scenario) |

> [!NOTE]
> **Full-matrix ownership map (all 22 rows):** rows 1–11, 19–22 → sub-plan 1; rows 12–16 → sub-plan 2; rows 17–18 → this sub-plan. The Mandatory Testing task "Verify test coverage against Derived Test Matrix" below confirms every row has a covering test across all three sub-plans with no uncovered row.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced for self-containment; only entries relevant to this sub-plan expanded.

**Proposed names (new artifacts, this sub-plan):**

- `.bkit/workflows/bkit-roadmap.md` → renders `/bkit-roadmap` utility command (mirrors the `bkit-worktree-*` workflow shape).
- Observability prefix `[bkit-roadmap]` — a NEW module prefix, registered in `docs/observability.md` here (Task 14).

Prerequisite names (already landed in sub-plans 1/2): `docs/roadmap.jsonl` (`kind: "feature"`, six-state ladder, canonical); `docs/roadmap.md` (consumer-owned projection, fully regenerated, `## Shipped` capped at 10, `ABANDONED` hidden, bytes outside marker pairs untouched); `.bkit/scripts/bkit-roadmap-fold.sh`; the `bkit telemetry migrate` fifth pair + bootstrap seed; `.bkit/prompts/bkit-roadmap-refresh.md` (`@bkit-roadmap-refresh`); `counterName: "ROADMAP_SCAN_COVERAGE"` + `"ROADMAP_CADENCE_FIRE"`; the `bkit.roadmap.{buildCycles,stalenessDays}` manifest keys.

> [!IMPORTANT]
> **Deferral closure (Directive 5 / Addendum C).** `docs/deferrals.jsonl` key `380-dev-located-roadmap-status-write-for-build-debug-closes` was SUPERSEDED by the build/debug dev-lock roadmap write (built in sub-plan 1, Task 7). Mark it `CLOSED` here (append a `status:"CLOSED"` same-`key` row) — Task 14.

No exported TS symbol signatures change. No consumer command is renamed. `docs/roadmap.md` is net-new and consumer-owned.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced verbatim for self-containment.

- **Open question (cadence numbers):** `N` ship-cycles = **5**; staleness-days fallback = **14** (implemented in sub-plan 2). → Confirm both values, or accept the defaults.
- **RESOLVED (board scope, owner 2026-07-25 — design Addendum 2 § K):** active phase sections carry open + in-flight FIDs only; shipped FIDs move to a separate `## Shipped` section regenerated from `docs/roadmap.jsonl` (`ts` desc, cap **10**).
- **RESOLVED (`completed.md` fate, owner 2026-07-25 — design Addendum 2 § H):** DELETE it — no dual-write, no generated markdown view. **[Verified in Manual Verification Step 4.]**
- **RESOLVED (`completed` codec scope, owner 2026-07-25):** **`bkit harvest` does NOT consume `docs/roadmap.jsonl`** — not copy, not count; `HARVEST_COPY_FILES` and the count-only set are unchanged.
- **Assumption:** the no-concurrent-workflows-per-clone constraint holds.
- **Assumption:** `.bkit/stats.jsonl` carries persisted ship-close `outcome` rows (`workflow == "ship"`).
- **Assumption:** shipped roadmap/analysis text stays stack/vendor-agnostic and cites no tracker-internal refs (`BAR-`/`KN-`/Linear ids) → if violated, the shipped-surface rule reds `slop`/review. **[Verified at Gate 2 / Verification Plan.]**
- **Assumption:** #80 lens engine is NOT landed → cadence injects a generic "run an audit" next-step.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## Alternative Approaches & Recommendations

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff.

Chosen (relevant here): a clean reusable `/bkit-roadmap` utility (mirroring the `bkit-worktree-*` shape) that composes the mechanical fold + reconcile + `@bkit-roadmap-refresh`, rather than a bespoke command — so the utility reuses the exact same leaf/fold the close cycle uses. Mirrors are force-overwritten and NOT drift-gated (batch `bkit install` at session end, never per-edit).

Rejected: folding the utility's analysis into `@bkit-ship-update-docs` (blocks reuse); per-edit mirror regen (churn — batch at session end).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| `references: ["{FID}"]` on close-step `outcome` rows | Genuinely additive; no Success Criterion needs it | Standalone follow-up issue (design Addendum 2 § L) |
| `bkit harvest` / `bkit analysis` ingestion of `docs/roadmap.jsonl` | DECIDED out (owner 2026-07-25) — harvest neither copies nor counts it | Not planned |

> [!CAUTION]
> **Candidate, not scope.** `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` (`docs/deferrals.jsonl`) overlaps the fold bootstrap — KEEP DEFERRED (low blast radius for the bkit repo: no `docs/roadmap.md` exists to migrate, so the WS-6 dogfood run won't exercise it). Do not fold in.

## Security & Privacy

> Reference: `docs/security.md`. bkit ships no runtime server; observability is CLI stdout/stderr (`docs/observability.md`).

- [ ] **User input** — the consumer "Backlog / Ideas" region is untrusted data read by `@bkit-roadmap-refresh` (the utility reuses that leaf). Never executed.
- [ ] **Tracker MCP read/write** — `list_issues` (read) + reverse-sync label writes (sub-plan 2) are via the configured tracker MCP only, best-effort, never `gh`/`search_issues`; the `/bkit-roadmap` utility inherits the same rules.
- [ ] **PII** — none. Roadmap rows carry FIDs + issue titles + phase only. Shipped text stays stack/vendor-agnostic.

_No new routes, DB writes, or secrets._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable.

### Core (always verify)

- [ ] **Prerequisite Plans:** [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) (WS-1/WS-2) AND [380-roadmap-analysis-refresh-plan-2.md](./380-roadmap-analysis-refresh-plan-2.md) (WS-3/WS-4) MUST both be fully executed + verified first — this sub-plan composes their fold + reconcile + leaf inside `/bkit-roadmap` and mirror-regens all their edited artifacts.
- [ ] **Package Management:** No new npm deps. Confirm `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** `pnpm --version`, `npx tsc --version`, `jq --version`, `npx bats --version` present.
- [ ] **Existing-solution search (reuse over duplicate):** the utility mirrors the `bkit-worktree-*` workflow shape and reuses the fold (sub-plan 1) + reconcile (sub-plan 2 Task 12) + `@bkit-roadmap-refresh` (sub-plan 2 Task 8) — no new leaf/fold.
- [ ] **User Context:** read/write access to `.bkit/**`, `docs/**`, `.claude/**`, `.cursor/**`, `.opencode/**`, `tests/**` confirmed.
- [ ] **Pending Blockers:** query the tracker for open `blocker`-labelled issues touching the five workflows / the new utility.
- [ ] **Project Context:** `docs/knowledge.jsonl` + `docs/decisions.jsonl` read for: `bkit install` batch-at-session-end, mirror not drift-gated, `git config core.bare false` after install.
- [ ] **Testing & Quality:** strategy aligns with `docs/testing.md` § Tiers.

### Conditional (verify only when applicable)

- [ ] **Observability** _(new log points)_: the new `[bkit-roadmap]` prefix is a NEW module prefix → add it to `docs/observability.md` (one-prefix-per-subsystem rule) — Task 14, covering fold + hook (sub-plan 1) + reconcile + reverse-sync (sub-plan 2) fail-open lines.
- [ ] **Architecture & Cross-provider** _(new workflow + agent + script from all sub-plans)_: every edited `.bkit/workflows/*.md` + new `.bkit/prompts/bkit-roadmap-refresh.md` + `.bkit/workflows/bkit-roadmap.md` require mirror regen to `.claude/`, `.cursor/`, `.opencode/` (force-overwritten, NOT drift-gated — batch at session end here, WS-6) — Task 15.

## Data Schema Integration

bkit has no database. **Invariant conformance:** every write path is best-effort append that exits 0 and never gates a workflow. No new schema in this sub-plan (the codec + ledger + counter landed in sub-plans 1/2). The `.bkit/jsonl.md` documentation of `kind: "completed"` + `ROADMAP_SCAN_COVERAGE` is applied here (Task 14).

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** the frontier snapshot (fold) + `deferrals`/`failures.jsonl` + Backlog region (via `@bkit-roadmap-refresh`, reused by the utility); live `feat/*` (via the reconcile pass, reused by the utility).
- **Output (Write):** `docs/roadmap.md` both blocks (via the utility); `docs/deferrals.jsonl` `status:"CLOSED"` row for the superseded deferral (Task 14); `.bkit/version` `canonicalHashes` (new scripts; the `docs/completed.md` entry REMOVED, Task 15); `docs/roadmap.jsonl` populated by the `bkit telemetry migrate` run (Task 15).

## Architecture & Component Changes

**CRITICAL:** Workflow SSOT is `.bkit/workflows/*.md`; `bkit install` renders host mirrors (`.claude/`, `.cursor/`, `.opencode/`). shell/jq scripts are edited in `.bkit/templates/.bkit/scripts/` (SSOT); `bkit install` renders the repo copy + regenerates `.bkit/version` hashes. Every `[NEW]` reuses an existing pattern (justified inline).

### On-demand utility (WS-5)

#### [NEW] `.bkit/workflows/bkit-roadmap.md` → `/bkit-roadmap`

- Utility workflow mirroring the `bkit-worktree-*` shape (`description:` frontmatter, numbered steps): run the mechanical fold (WS-1/WS-2 path, sub-plan 1) + the reconcile pass (sub-plan 2 Task 12 — so the human's explicit "fix my board now" entry point also re-adds lost in-flight rows without waiting for the next cadence fire) + invoke `@bkit-roadmap-refresh` (sub-plan 2 Task 8), refreshing both blocks outside the close cycle.

### Cross-provider + telemetry docs (WS-6)

#### [MODIFY] host mirrors + `.bkit/version`

- `bkit install` regenerates `.claude/commands/`, `.cursor/commands/`, `.opencode/command/` for the five edited workflows + new `/bkit-roadmap`; `.claude/agents/`, `.cursor/agents/`, `.opencode/agent/` for `@bkit-roadmap-refresh`; `.bkit/scripts/bkit-roadmap-fold.sh` from templates; `.bkit/version` `canonicalHashes` for the new scripts, with the `docs/completed.md` entry gone (its template is deleted). Batch at session end.

### Cron Jobs & Scheduled Tasks

None — all triggers are workflow-close-driven or on-demand (`/bkit-roadmap`); no scheduler.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `docs/deferrals.jsonl` key `380-dev-located-roadmap-status-write-for-build-debug-closes` (OPEN deferral) | build/debug dev-lock roadmap write (Addendum C, built in sub-plan 1 Task 7) | CLOSE (append `status:"CLOSED"` row) | Pulled into scope; the deferred feature is now built. |

> [!CAUTION]
> No source file is DELETED. The deferral closure is a same-`key` ledger append, not a deletion.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/observability.md` | Add the `[bkit-roadmap]` prefix section (fold + hook + reconcile + reverse-sync fail-open lines); note the module prefix in the one-per-subsystem list. |
| `docs/decisions.jsonl` | Append `decision` rows (`.bkit/jsonl.md` format): `docs/roadmap.jsonl is the canonical feature ledger, roadmap.md is its regenerated projection`; `roadmap.jsonl replaces completed.md as the sole feature record`; `bkit rewrites only bytes strictly between marker pairs`; `cadence counts BUILT FIDs from the ledger, thresholds in the package.json manifest`; `no consumer task detail in harvested ledgers - stats.jsonl stays as-is, activity.jsonl rename rejected` (design Addenda 2 § L / 3 § N-S). Check existing entries first (none present). |
| `docs/knowledge.jsonl` | Append `knowledge` rows: cadence must anchor on the last FIRE not the last analysis refresh (a refresh-anchored counter resets every ship and never fires); unmigrated-or-empty-ledger trap (`bkit telemetry migrate` is NOT auto-run at `bkit upgrade` per DE-39, and the § S bootstrap seed is what stops an empty first board); `list_issues`-not-`search_issues` (0/empty inconclusive); build/debug dev-write is a 4th staging shape; **a full-regenerate projection over an append-only `merge=union` ledger sidesteps the KN-42 duplicate-line class entirely (`kn-42-pre-release-main-dev-backmerge-with-x-ours-duplicate`) — no dedupe invariant to maintain**. |
| `docs/testing.md` | Add `tests/roadmap-fold.bats`, `tests/roadmap-cadence.bats`, and the new `*.test.ts`/`*.integration.test.ts` to the Key test files / bats tables. |
| `.bkit/jsonl.md` | Add `kind: "feature"` to § Ledgers & Writers (`docs/roadmap.jsonl`, written by ALL FIVE workflow closes + `@bkit-ship-update-docs`), § Per-Kind Fields (`key`/`status`/`category`/`summary`/`description`/`references`, six-value `status` ladder, NO `severity`), § Identity/Dedup (`(kind, repo, key)`, same-`key` append advances the phase), § Severity (explicit exclusion), the `ABANDONED` board-removal idiom, + an example row; drop `docs/completed.md` from the ledger list; note `ROADMAP_SCAN_COVERAGE` + `ROADMAP_CADENCE_FIRE` as `counterName`s. |
| Consumer install/upgrade doc (`docs/setup.md` or the upgrade help text) | Document the `completed.md` → `docs/roadmap.jsonl` migration: run `bkit telemetry migrate` once (parity-gated; deletes `completed.md`). It is deliberately NOT auto-run at `bkit upgrade` (DE-39); an install advisory fires while the `.md` remains, and the roadmap fold falls back to the legacy grep until then. |

> [!NOTE]
> `.agents/docs.md` (`docs/completed.md` row REPLACED by `docs/roadmap.jsonl`, plus the new `docs/roadmap.md` row), the deletion of `docs/completed.md` + its template + its `.bkit/version` entry + its `.bkit/README.md`/`.bkit/workflows.md` references, and `.gitattributes` (`merge=union` lines) were all handled in sub-plan 1 (Tasks 1/4/5) — do NOT re-apply here.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` — all changes are additive files + workflow-step edits | No DB. Reverting drops `/bkit-roadmap` + the doc rows; re-run `bkit install`. |
| **Data (`docs/roadmap.jsonl`)** | Delete `docs/roadmap.jsonl`; the revert restores `docs/completed.md` and its grep reader from git | The migration deletes the `.md` only after a row-count parity gate, and git holds it regardless — no shipped-feature history is lost in either direction. Re-running `bkit telemetry migrate` after a revert is an idempotent no-op. |
| **Mirrors** | `bkit install` re-renders host mirrors from the reverted SSOT | Mirrors are force-overwritten, not drift-gated — re-run install after any revert. |
| **Risk window** | None — no deploy, no migration apply | The only cross-file coupling is the `completed.md → docs/roadmap.jsonl` touchpoint set (sub-plan 1); land it as one commit so revert is atomic. |

_Code-only — `git revert` sufficient; re-run `bkit install` to re-render mirrors._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) via configured tracker MCP before stopping.
> **Never drop work silently:** deferrals → `docs/deferrals.jsonl`, bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing entries first).
> **Ordering:** utility → docs/deferral-closure → mirror-regen (session end). Each task fully complete (verification + checkbox) before the next.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Test-bearing `Done when` entries map to exactly one `Derived Test Matrix` row.

### On-demand utility (WS-5)

- [ ] **Task 13 — `/bkit-roadmap` utility.** Create `.bkit/workflows/bkit-roadmap.md` (mirrors `bkit-worktree-*` shape): run the mechanical fold + the reconcile pass (Task 12 — so the human's explicit "fix my board now" entry point also re-adds lost in-flight rows without waiting for the next cadence fire) + invoke `@bkit-roadmap-refresh`. **Done when:** `bkit-roadmap-utility.test.ts` asserts the workflow sources the fold, runs the reconcile pass, and invokes `@bkit-roadmap-refresh` (matrix row 17).

### Cross-provider + docs (WS-6)

- [ ] **Task 14 — deferral closures + observability + ledger docs.** Append `status:"CLOSED"` rows (same `key`) to `docs/deferrals.jsonl` for BOTH `380-dev-located-roadmap-status-write-for-build-debug-closes` (built in sub-plan 1 Task 7) and `380-persisted-frontier-snapshot-event-log-for-260` (superseded — `docs/roadmap.jsonl` IS the event log, design Addendum 3 § N; reference #260 so it inherits the substrate); add the `[bkit-roadmap]` section to `docs/observability.md`; add `kind: "feature"` + the six-value `status` ladder + the `ABANDONED` board-removal idiom + `ROADMAP_SCAN_COVERAGE`/`ROADMAP_CADENCE_FIRE` to `.bkit/jsonl.md`; append the `decisions.jsonl`/`knowledge.jsonl` rows from Documentation Updates. **Done when:** both deferrals show `CLOSED` rows; `docs/observability.md` carries the `[bkit-roadmap]` prefix; `.bkit/jsonl.md` carries `kind: "feature"`, the status ladder, the `ABANDONED` idiom and both `counterName`s (grep-verifiable in § Ledgers & Writers / § Per-Kind Fields / § Identity/Dedup / § Severity); `docs/decisions.jsonl` + `docs/knowledge.jsonl` carry the new rows, each grep-verifiable by `key`; `bkit check` + prose lint clean.
- [ ] **Task 15 — mirror regen + hash refresh.** Run `bkit install` (batched, session end) to render `.claude/`/`.cursor/`/`.opencode/` for the five edited workflows + `/bkit-roadmap` + `@bkit-roadmap-refresh` + the edited `@bkit-ship-update-docs` prompt (sub-plan 1 Task 5), render `.bkit/scripts/bkit-roadmap-fold.sh` from templates, and regenerate `.bkit/version` hashes (new scripts; the `docs/completed.md` entry must be GONE). Run `bkit telemetry migrate` once on `dev` — it ports the entries, passes its parity gate, and deletes `docs/completed.md`. **Done when:** rendered mirrors exist for the new utility + agent + the edited `@bkit-ship-update-docs`; `git config core.bare false` restored; `bkit check` drift clean; `docs/roadmap.jsonl` populated from backfill.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes. **DO NOT stop for user permission.** Proceed to `Testing & Documentation`. _(This gate verifies the whole feature — code implemented across sub-plans 1–3.)_

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` justified against reuse; `bkit-roadmap-fold.sh` sources (never re-inlines) `BKIT_STATUS_FOLD`; no `as any`/`@ts-ignore`/`.skip`/empty `catch`/error-swallowing added to pass a gate.
- [ ] **All five plan directives resolved or explicitly voided:** Directive 1 (per-FID upsert) VOID — replaced by the ledger projection (sub-plan 1 Task 3); Directive 2 ledger migration + `completed.md` deletion + bootstrap seed (sub-plan 1 Tasks 1/2/5); Directive 3 reverse sync (sub-plan 2 Task 11); Directive 4 RESCOPED to a drift check (sub-plan 2 Task 12); Directive 5 build/debug 4th staging shape + CI/bats (sub-plan 1 Task 7 + matrix row 11). Both voidings trace to design Addendum 3 § O.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all 22 matrix rows have a covering test task — rows 1–17 + 19–22 across sub-plans 1–2 Tasks 1–13 (rows 1–11/19–22 in sub-plan 1; rows 12–16 in sub-plan 2; row 17 here); row 18 (`bkit install` consumer-owned) via the "Update existing tests" mandatory task below; no uncovered row.
- [ ] **Update existing tests:** adjust `bkit-status-fold.test.ts` expectations if `WORKFLOW_FILES` gains roadmap-source assertions; extend `bkit-install.integration.test.ts` with the roadmap-consumer-owned scenario (matrix row 18); extend `tests/telemetry-failopen.bats` with the new `[bkit-roadmap]` fail-branch exit-0 cases (matrix row 22) — coordinate with sub-plan 1 (which created the bats file) and sub-plan 2 (reverse-sync branches).
- [ ] **Write new tests:** confirm the new `*.test.ts`/`*.integration.test.ts` (`bkit-roadmap-fold`, `bkit-roadmap-refresh-prompt`, `bkit-roadmap-utility`, `bkit-telemetry-migrate`, `bkit-ship-verdict`, `bkit-roadmap-staging`, `bkit-roadmap-sync`, `bkit-roadmap-reconcile`, `bkit-roadmap-devwrite`) + `tests/roadmap-fold.bats` + `tests/roadmap-cadence.bats` all exist across sub-plans 1–3 per the matrix; bats over real `jq`/`sh`/`status.jsonl` (no mocks at the boundary); all in-process hashing via `node:crypto`, never a shell `md5`.
- [ ] **Verify observability:** every fold/hook/reconcile/sync fail branch emits a bracketed `[bkit-roadmap]` line; counter appends `[bkit-telemetry]` fail-open; cadence `[bkit-analysis]`. `docs/observability.md` updated (Task 14).
- [ ] **Update documentation:** all Documentation Updates rows (this sub-plan + the sub-plan 2 additions folded into Task 14) applied; `.agents/docs.md` accurate.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes. **DO NOT stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** every `Documentation Updates` row completed (across all three sub-plans); `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan

> Runs once against the fully-merged sub-plans 1–3.

### Automated Tests

- [ ] **Full local gate suite:** `pnpm typecheck` + `pnpm lint` + `pnpm format:check` + `pnpm lint:prose` + `pnpm lint:slop` + `pnpm slop:delta` + `pnpm check:dist` + `pnpm bkit check` — all green on the changed files. Do NOT weaken any gate.
- [ ] **Unit + integration (Vitest):** `pnpm test` passes including `bkit-telemetry.test.ts`, `bkit-roadmap-fold.test.ts`, `bkit-roadmap-refresh-prompt.test.ts`, `bkit-roadmap-utility.test.ts`, `bkit-telemetry-migrate.integration.test.ts`, `bkit-ship-verdict.integration.test.ts`, `bkit-roadmap-staging.integration.test.ts`, `bkit-roadmap-sync.integration.test.ts`, `bkit-roadmap-reconcile.integration.test.ts`, `bkit-roadmap-devwrite.integration.test.ts`, and the new `bkit-install.integration.test.ts` roadmap scenario.
- [ ] **Shell (bats):** `npx --yes bats tests/*.bats` passes including `tests/roadmap-fold.bats` + `tests/roadmap-cadence.bats` + the new `tests/telemetry-failopen.bats` `[bkit-roadmap]` fail-branch cases (real `jq`, cross-process, real fixtures).
- [ ] **Coverage:** `pnpm test:coverage:unit` branch floor not regressed (the shared `--coverage.thresholds.branches` gate — `docs/testing.md` § Coverage).
- [ ] **Build Configuration:** no new mock files; nothing to add to `tsconfig.json` exclude.

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/compiler/test errors per `docs/architecture.md` + `docs/knowledge.jsonl`; never via `as any`/`.skip`/`passWithNoTests`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes. **DO NOT stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified; explicit proof (test outputs) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`gh`, `bkit`) to verify, never a dashboard.

> [!IMPORTANT]
> **Load-bearing for the workflow-file-content assertions.** Matrix rows 11/15/20 (sub-plan 1 Tasks 6/7, sub-plan 2 Tasks 9/11) assert `.bkit/workflows/*.md` prose/marker CONTENT ("boundary: workflow files"), a weaker signal that can pass while the orchestrated runtime behavior is broken — inherent to bkit's orchestrator-as-prose architecture. Steps 2 and 4 below (a real workflow close + a real ship-close round-trip) are the runtime ground-truth for those rows and MUST NOT be skipped.

- [ ] **Step 1 — dogfood install + upgrade + migrate (separate engines).** In a scratch consumer (`os.tmpdir()`) seeded with a `docs/completed.md` holding shipped FIDs: `bkit install --claude --cursor --tooling` then `bkit upgrade`; assert `docs/roadmap.md` is NOT created by install (consumer-owned, matrix row 18), that `bkit upgrade` does NOT auto-run the migrator (DE-39) but DOES surface the advisory naming `bkit telemetry migrate`, and that the first board built before migrating uses the transitional `completed.md` grep fallback so no shipped FID reappears as active. Then run `bkit telemetry migrate`: the seeded FIDs land in `docs/roadmap.jsonl`, `docs/completed.md` is deleted, a re-run is an idempotent no-op, and `bkit check` exits 0. Restore `git config core.bare false` in the bkit repo after install.
- [ ] **Step 2 — end-to-end close in the bkit repo.** Run one `/bkit-plan`-style close on a scratch FID and confirm `docs/roadmap.md` gains the FID under the Plan section (upsert), the Backlog region is untouched, and `[bkit-roadmap]` fail-open lines appear when the tracker is unreachable.
- [ ] **Step 3 — cadence + reconcile.** Seed 5 ship `outcome` rows in a fixture `.bkit/stats.jsonl` and confirm the cadence fires (`[bkit-analysis]`); create a stray `feat/{FID}` and confirm the reconcile pass re-adds its row.
- [ ] **Step 4 — real ship-close round-trip (writer↔reader, single sink).** Run one real `/bkit-ship` close on a scratch FID; confirm `@bkit-ship-update-docs` appends a reader-valid `docs/roadmap.jsonl` row at `status: "SHIPPED"` carrying `key`/`category`/`summary`/`description`/`references` and NO `severity`, that no `docs/completed.md` is recreated, that `UPDATE_DOCS_VERDICT` resolves `PASS` from the `SHIPPED` row (and would FAIL on a `BUILT`-only row), that the FID moves out of the active phase sections into `## Shipped` at the top of the capped list, and that hand-written scratch text above, between and below the marker blocks survives byte-unchanged.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. The `completed.md → docs/roadmap.jsonl` touchpoints (codec + migrator + writer + reader + file deletion + manifest/`.gitattributes`/doc-index references — sub-plan 1) MUST land in the same squash so revert is atomic and no ship is ever blocked by a partial migration.

<!-- bkit:end -->
