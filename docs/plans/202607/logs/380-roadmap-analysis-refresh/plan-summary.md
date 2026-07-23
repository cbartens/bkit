Verdict: PASS

<!-- verdict:end -->

# Plan Summary

## Overview

Three-sub-plan split implementation of constant roadmap automation. Automates `docs/roadmap.md` with a deterministic mechanical status tier (refreshed at every close) and an opus analysis tier (best-next-step, dependency groupings, prompt suggestions) refreshed at ship/on-demand. WS-1/2 (foundation + mechanical), WS-3/4 (analysis + cadence/sync/reconcile), WS-5/6 (utility + mirror regen). Gate 1 (Prerequisites) in SP1; Gates 2–4 + full Verification + Manual Verification in SP3.

## Plan Quality

Well-scoped and highly detailed. Clear dependency ordering (SP1 → SP2 → SP3); explicit prerequisite declaration for each sub-plan. Five design directives precisely mapped to concrete tasks across workstreams. Each task has a focused "Done when" criterion tied to matrix rows. Dependencies tracked (e.g., SP2 waits for SP1's fold + frontier snapshot; SP3 composes both). Pre-flight sections verify prerequisites per sub-plan. No ambiguity on ordering or integration points. Per-workflow-shape staging variations well-justified and explicitly tested (rows 11/20/21). Rollback strategy atomic (SP1's completed.jsonl touchpoints land together).

## Completeness

Comprehensive across all six workstreams. SP1 (WS-1/2): telemetry codec, backfill script, fold foundation, doc-index, mechanical hooks + 4 staging variants. SP2 (WS-3/4): analysis leaf, ship Step 10 wiring, cadence threshold + audit/ledger injection, reverse sync, reconcile/recovery. SP3 (WS-5/6): utility workflow, deferral closure, observability/ledger docs, mirror regen. All 22-row Derived Test Matrix distributed across sub-plans with ownership map (rows 1–11,19–22 SP1; rows 12–16 SP2; rows 17–18 SP3). Every section reproduced across sub-plans for self-containment. Testing strategy covers Unit/Integration/Shell-bats; no E2E/fresh-DB. Security & Privacy sections present per sub-plan (MCP-only reads, no new secrets, untrusted user input treated correctly). Documentation Updates detailed with specific files + row locations.

## Acceptance Scenario

**Narrative:** User closes a workflow phase; `docs/roadmap.md` auto-updates to show issue's phase (from on-disk artifacts + optional tracker enrichment) with no manual edit. Ship/on-demand refresh analysis block with best-next-step, groupings, prompt suggestions. **Success Criteria:** (1) phase-sectioned board built from on-disk artifacts (tracker-optional, never blank); (2) concurrent closes/conflicts never corrupt board (per-FID upsert, deterministic regen); (3) ship + `/bkit-roadmap` refresh analysis block with coverage-stamped scan; (4) ledger/audit cadence fires on threshold (persisted ship-cycles + staleness-days); (5) `docs/roadmap.md` consumer-owned (bkit install never overwrites, check stays clean). **Concrete example:** `tracker: none` repo with 2 in-flight FIDs on disk, 1 shipped in completed.jsonl, 2 hand-written Backlog lines → board shows each under its phase, Backlog untouched, analysis ranks next step. **Template Adherence:** Compliant — narrative, success criteria, process sketch, edge cases table (12 rows), concrete example all present; human-confirmation checkboxes carried forward from master plan unchanged.

## Breaking Changes

None — all additive. New artifact: `docs/roadmap.md` (consumer-owned, NOT a managed-block template); new scripts/agents/workflows; five Close steps extended (STRAY widened design/plan; build/debug/ship existing paths capture); new codec `kind: "completed"` (union member, not breaking change). New ledger `docs/completed.jsonl` + migration from `completed.md` (atomic across all touchpoints: reader + writer + backfill in one change, SP1). **Critical migration:** `completed.md` grep reader switches to `completed.jsonl` in Task 5 (SP1). `completed.md` file retained as human-readable (dual-write). No API contract changes. New observability prefix `[bkit-roadmap]` (new module, one-per-subsystem rule). New `counterName: "ROADMAP_SCAN_COVERAGE"`. **Deferral closure:** `380-dev-located-roadmap-status-write-for-build-debug-closes` marked CLOSED (superseded by SP1 Task 7's dev-lock write, per Addendum C).

## Design Alignment

Plan closely mirrors design with explicit handling of two post-close amendments (canonical-home inversion + on-disk-first sensing). **Five design directives resolved across sub-plans:** Directive 1 (per-FID upsert) → SP1 Tasks 3/6/7; Directive 2 (completed.jsonl migration+backfill) → SP1 Tasks 1/2/5; Directive 3 (reverse tracker sync) → SP2 Task 11; Directive 4 (reconcile/recovery) → SP2 Task 12; Directive 5 (build/debug 4th staging shape) → SP1 Task 7 + matrix row 11. Acceptance Scenario narrative, success criteria, process sketch carried verbatim across all three sub-plans for self-containment. Edge cases table expands design's 6 rows to 12 per sub-plan. Open questions & assumptions reproduced unchanged (cadence numbers N=5/14, board scope, completed.md fate, codec scope, no-concurrent constraint, stats.jsonl schema, stack-agnostic shipped text, #80 lens engine defer). Design's choice of regenerate-on-conflict + per-FID upsert + two-marker-block seam + on-disk-first sensing all preserved. No design scope exceeded.

## Deferred & Out-of-Scope

All declared as Exempt (genuinely-additive, not required by Success Criteria): (1) Persisted `roadmap.jsonl` event log / durable cross-tick frontier → #260 (mirrors `docs/deferrals.jsonl` key `380-persisted-frontier-snapshot-event-log-for-260`). (2) #260 autonomous actuator/sensing contract/standalone schema → #260 (Speculative, YAGNI). (3) #80 lens engine (concrete audit lenses) → #80 (depends on landing; cadence injects generic "run audit" ref). (4) `bkit harvest` / `bkit analysis` ingestion of `completed.jsonl` → Follow-up (no reader consumes yet; codec-acceptance enough). (5) Generating `docs/completed.md` from ledger → Follow-up (dual-write lower risk). (6) `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` → Deferred (low blast radius for bkit repo: no pre-existing roadmap.md to migrate). **No Blocking items.** All deferral rows cite where they belong.

## Suggested Scope Expansion

None identified. Plan addresses the core feature comprehensively across all six workstreams. The design's approach to deferred phasing (v1 status/analysis + utility, v2 ledger/cadence, v3 #260 integration) aligns with the planned implementation.

## Risks

**Unknowns:** Cadence numbers (N=5 ship-cycles, staleness=14 days) open-question; human confirmation deferred to Manual Verification. **Dependencies:** #80 audit-candidate source (fallback: generic ref until lands); #324 persisted ship-cycle row schema in stats.jsonl (fail-safe if missing: count reads 0, never fires). **Assumptions:** No concurrent workflows per clone (regenerate-on-conflict tolerates but per-FID upsert handles race); no-concurrent-workflows rule held (KN class). Shipped text stays stack/vendor-agnostic. **Operational risks:** (1) Cross-provider mirror regen (five workflows + agent + utility; force-overwritten, NOT drift-gated; batch at session end + dogfood install AND upgrade). (2) Per-workflow staging variations (4 shapes for close: design/plan widen STRAY; build/debug/ship reuse; per-shape CI/bats assertion covering). (3) Analysis maxTurns exhaustion on large trackers (bounded scan + coverage-stamped + ROADMAP_SCAN_COVERAGE counter). (4) Per-close MCP read couples close latency to tracker availability (best-effort fail-open, never gates close). (5) `completed.jsonl` empty-on-rollout trap (backfill wired to `bkit upgrade`; runs idempotently fail-open across all consumers). Mitigations clear per risk.

## Action Items

None. Plan is build-ready. Open questions (cadence numbers, board scope, completed.md fate, codec scope) are properly identified in shared human-confirmation checkboxes and deferred to Manual Verification with specific steps. Assumptions documented and mitigations in place. No CONCERNS-level gaps identified.

## Recommended Next Step

```
/bkit-build 380
Brief: Execute sub-plans sequentially (1 → 2 → 3): SP1 builds mechanical foundation + backfill, SP2 adds analysis + cadence/sync/reconcile, SP3 finishes utility + mirror regen + full verification. Gate 1 in SP1; Gates 2–4 + Manual Verification in SP3. Plan-docs: [plan-v4-split.md](./plan-v4-split.md), [plan-v4-1.md](./plan-v4-1.md), [plan-v4-2.md](./plan-v4-2.md), [plan-v4-3.md](./plan-v4-3.md).
```
