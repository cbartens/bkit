Verdict: PASS

<!-- verdict:end -->

<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) Implementation Plan — Master Index (split)

> [!IMPORTANT]
> **This master plan was SPLIT for session/token budget.** Its `Agent Execution Runbook` (15 tasks + 5 mandatory Testing/Documentation tasks), its four 🔒 Gates, its Derived Test Matrix (22 rows), and its Verification Plan now live in three self-contained sub-plans. Execute them **in order 1 → 2 → 3**. This file retains only the shared context/goals/patterns and the sub-plan index — do NOT execute tasks from here.

## Sub-Plan Index

<!-- prettier-ignore -->
| Order | Sub-plan | Scope (WS) | Tasks | Gates | Derived Test Matrix rows |
| --- | --- | --- | --- | --- | --- |
| 1 | [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) | Foundation + Mechanical tier (WS-1 + WS-2) | Tasks 1–7 | Gate 1 (Prerequisites) | 1–11, 19–22 |
| 2 | [380-roadmap-analysis-refresh-plan-2.md](./380-roadmap-analysis-refresh-plan-2.md) | Analysis + Cadence/Sync/Reconcile (WS-3 + WS-4) | Tasks 8–12 | — | 12–16 |
| 3 | [380-roadmap-analysis-refresh-plan-3.md](./380-roadmap-analysis-refresh-plan-3.md) | Utility + Cross-provider/docs + Verification (WS-5 + WS-6) | Tasks 13–15 + Mandatory Testing/Documentation tasks | Gate 2 (Code Impl), Gate 3 (Testing/Docs), Gate 4 (Automated Verification) + Manual Verification | 17–18 |

**Dependency order (from the plan's own "Ordering" note):** schema/foundation → mechanical → analysis → cadence → utility → mirror-regen.

- **Sub-plan 1** has no prerequisites — it is the load-bearing foundation (`bkit-roadmap-fold.sh` + frontier snapshot, the four close-hooks, `docs/roadmap.jsonl` codec/migration/reader). Nothing in 2/3 can be meaningfully tested without it.
- **Sub-plan 2** requires sub-plan 1's fold + frontier snapshot + close-hooks + `docs/roadmap.jsonl`.
- **Sub-plan 3** requires sub-plans 1 AND 2 (composes their fold + reconcile + `@bkit-roadmap-refresh` inside `/bkit-roadmap`, then batches all mirror-regen + cross-cutting docs + the whole-feature Gates 2–4 + Manual Verification).

> [!NOTE]
> **Merge / atomicity.** Merge method for each sub-plan is squash (`gh pr merge --squash --delete-branch --body ""`). The `completed.md → docs/roadmap.jsonl` touchpoints (codec + migrator + bootstrap seed + writer + reader + the `completed.md` DELETION + its manifest/`.gitattributes`/doc-index references) are all inside sub-plan 1 (Tasks 1/2/5) so they land in one atomic squash — no ship is ever blocked by a partial migration, and a revert restores the file with its reader.

---

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in the sub-plans. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no application stack (no DB / API / UI / deploy). "Schema" = the JSONL ledger + generated-artifact contracts. Tests = Vitest (`*.test.ts` / `*.integration.test.ts`) + bats (`tests/*.bats`); no E2E / @live / fresh-DB tiers exist here (`docs/testing.md` § Tiers). Shipped surface must stay stack/vendor-agnostic (`.agents/rules.md`).

## Context & Goals

`docs/roadmap.md` is maintained by hand today, so it goes stale the moment any issue moves between design → plan → build → debug → ship. #380 automates it as a **two-tier generated artifact**: a cheap deterministic **status tier** rewrites a phase-sectioned board at every workflow close (no LLM turn), and an opus **analysis tier** rewrites a "best next step" (dependency-aware groupings + IDE/model-aware prompt suggestions + periodically-injected audit/ledger candidates) at ship and on-demand.

The canonical design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`) was amended twice after close and re-reviewed. Two inversions and five re-review plan directives are load-bearing; the sub-plans resolve each as concrete tasks:

- **On-disk-first, tracker-optional sensing** — the board builds from `docs/plans/**` artifacts + folded `status.jsonl` + `deferrals`/`failures.jsonl` + a consumer backlog region, and works under `tracker: none`; a `list_issues` MCP read is additive only when a tracker is wired.
- **Canonical-home inversion** — `docs/roadmap.md` is now the **canonical home for issue state** (phase-sectioned board Backlog → Design → Plan → Build → Debug → Ship); the tracker is a downstream mirror kept in sync from roadmap.md.
- **Directive 1** — status region is a per-FID **UPSERT/merge keyed on FID**, never a blind full-regenerate (build/debug rows are authored on `dev` but their `status.jsonl` lives on `feat/{FID}` and are not re-derivable from `dev`). → sub-plan 1 (Tasks 3/6/7).
- **Directive 2** — `docs/completed.md` → `docs/roadmap.jsonl` migrates atomically across ALL touchpoints, via the existing parity-gated `bkit telemetry migrate` (which DELETES the `.md`) plus the bootstrap seed. → sub-plan 1 (Tasks 1/2/5).

> **Design Addendum 3 (owner, 2026-07-27) supersedes Directives 1 and 4.** `docs/roadmap.jsonl` (`kind: "feature"`, six-state ladder) is the canonical state, appended at all five phase closes; `docs/roadmap.md` is a pure projection, fully regenerated from it. The per-FID upsert (Directive 1) and the reconcile/recovery pass (Directive 4) are VOID — the latter survives only as a drift check. Read design § N–S before executing any sub-plan.

- **Directive 3** — reverse tracker-label sync (roadmap → tracker) is orchestrator-mediated, settled-drift-guarded, MCP-only, best-effort. → sub-plan 2 (Task 11).
- **Directive 4** — a canonical reconciliation/recovery pass diffs live `feat/*` (+ open issues when wired) against the board to re-add lost in-flight rows. → sub-plan 2 (Task 12).
- **Directive 5** — build/debug dev-write is fail-open and a **fourth** distinct staging shape; the per-shape CI/bats assertion must cover it. → sub-plan 1 (Task 7); deferral closure in sub-plan 3 (Task 14).

> **Directive ↔ design cross-map** (plan directive = design `Re-review findings` #): Directive 1 = re-review #1 (per-FID upsert); Directive 2 = re-review #3 (`docs/roadmap.jsonl` migration + `completed.md` deletion); Directive 3 = re-review #4 (reverse tracker sync); Directive 4 = re-review #2 (reconcile/recovery); Directive 5 = re-review #5 (build/debug 4th staging shape). All five are present + tasked; the plan numbering is not the design's re-review order.

> Success criteria live ONCE per sub-plan under `Acceptance Scenario → Success Criteria` (shared, human-confirmed on this master); each runbook task has its own `Done when`.

**Related Issues:**

- `#260` — Milestone Orchestrator autonomous PM loop (open) — the direct precursor; `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive (build once, #260 consumes the same fold + snapshot).
- `#214` — bkit roadmap (open) — the hand-maintained sequencing reference this feature automates.
- `#209` — Workflow state model: squash-to-dev + persistent `feat/{FID}`, NDJSON `status.jsonl` (closed) — precedent for feat-located writes reaching `dev`, `merge=union`, the Close STRAY-guard, and the `-X ours` conflict class.
- `#80` — `bkit-audit` lens engine (open) — the audit-candidate source injected on the cadence; a generic "run an audit" reference stands in until it lands.
- `#324` — recurring self-healing audit loop / after-ship trigger (open) — shares the post-merge event substrate; noted, not a dependency.
- `#236` — Post-mortem on consumer debug sessions (closed) — source of the stack-independence rule the roadmap surface must respect.

## Shared human-review sections

The three 👤 human-review sections (**Acceptance Scenario**, **Breaking Changes & Naming Review**, **Open Questions & Assumptions**) were confirmed once on the pre-split plan and are reproduced verbatim inside EACH sub-plan for self-containment. Each sub-plan's **Derived Test Matrix** is scoped to its own tasks (full-matrix ownership map is in sub-plan 3).

## Alternative Approaches & Recommendations (patterns retained)

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff.

Chosen (carried into the sub-plans):

- **Two-tier, two-marker-block generated artifact** inside one consumer-owned file — the deterministic status writer and the opus analysis writer own physically-separate marker regions; the Backlog lives below both markers so it is never regenerated.
- **Per-FID UPSERT** for the status region (Directive 1) — NOT a blind full-regenerate; keeps `-X ours` a non-event for the writer's own row.
- **On-disk-first, tracker-additive** sensing — the board builds under `tracker: none`; `list_issues` enriches only when wired (never `search_issues` — silently returns 0 on private repos).
- **`docs/roadmap.jsonl` as the SOLE feature record** (Directive 2 + design Addenda 2 § H/I and 3 § N) — `completed.md` DELETED, row = a `deferral`/`failure` row minus `severity` with a six-state ladder, written at every phase close, content migrated by the existing parity-gated `bkit telemetry migrate`.

Rejected paths: blind full-regenerate; persisted `roadmap.jsonl` event log (deferred to #260); sed-edited single unstructured file; tracker `list_issues` as required/primary source; folding analysis into `@bkit-ship-update-docs`; `search_issues` for the tracker read.

Future phases: promote the fold's frontier snapshot to #260's tick-step-1; when #260 needs durable cross-tick history, persist the snapshot (deferred).

## Where the moved content lives

<!-- prettier-ignore -->
| Master section (pre-split) | Now in |
| --- | --- |
| Agent Execution Runbook — Tasks 1–7 (WS-1/WS-2) | [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) |
| Agent Execution Runbook — Tasks 8–12 (WS-3/WS-4) | [380-roadmap-analysis-refresh-plan-2.md](./380-roadmap-analysis-refresh-plan-2.md) |
| Agent Execution Runbook — Tasks 13–15 (WS-5/WS-6) + Mandatory Testing/Documentation tasks | [380-roadmap-analysis-refresh-plan-3.md](./380-roadmap-analysis-refresh-plan-3.md) |
| Data Schema Integration / Architecture & Component Changes | Split by WS across the three sub-plans |
| Supersession Inventory (completed.md file + reader) | [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) |
| Supersession Inventory (deferral closure) | [380-roadmap-analysis-refresh-plan-3.md](./380-roadmap-analysis-refresh-plan-3.md) |
| Documentation Updates | Split: `.agents/docs.md`/`completed.md` removal/`.gitattributes` → SP1; cross-cutting docs → SP3 Task 14 (with SP2 additions) |
| Security & Privacy | Reproduced per sub-plan (scoped rows) |
| 🔒 Gate 1 (Prerequisites) | [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) |
| 🔒 Gate 2/3/4 + Verification Plan + Manual Verification | [380-roadmap-analysis-refresh-plan-3.md](./380-roadmap-analysis-refresh-plan-3.md) |
| Rollback Strategy / Merge Method | Reproduced per sub-plan |

<!-- bkit:end -->
