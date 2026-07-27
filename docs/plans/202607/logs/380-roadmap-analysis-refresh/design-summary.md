Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

The design automates the constant refresh of `docs/roadmap.md` to surface issue phases and actionable next steps. Problem: users manually maintain roadmap sequencing, creating staleness/friction. Approach: two-tier system — a deterministic mechanical tier regenerates the status block at every workflow close (no LLM turn), and an opus analysis tier refreshes the best-next-step at ship/on-demand. Key decisions: (a) pure-projection status block (regenerate-on-conflict, making race conditions non-events), (b) consumer-owned file with two machine-owned marker blocks (preserves drift-clean status), (c) per-workflow staging integration (not one uniform rule), (d) bounded scan + coverage-stamped analysis to handle large trackers.

## Design Quality

Well-reasoned with clear trade-off documentation. The decision table (8 rows) explicitly compares chosen approaches against alternatives (regenerate-on-conflict, two-block seam, deterministic vs LLM, per-workflow staging) and states rationale for each—no hidden trade-offs. Notably honest about accepted costs: the regenerate-on-conflict choice trades durable event-log history for simplicity (deferred to #260); the per-workflow staging choice increases surface footprint vs a single uniform rule but avoids silent mis-staging. Edge cases well-identified: concurrent closes, merge conflicts, large-tracker context exhaustion, marker-block self-healing, and staleness honesty via the live-phase banner. Minor: the decision to count persisted ship-cycles in `.bkit/stats.jsonl` (vs the non-persisted counter-bus helper) is sound but depends on #324's existing schema; no pre-requisite stated.

## Acceptance Scenario

**Scenario:** User closes any workflow phase; `docs/roadmap.md` automatically shows each issue's current phase (from tracker labels + status.jsonl projection), with no manual edit or analysis turn. Ship-close + on-demand `/bkit-roadmap` refresh the analysis block (best-next-step, groupings, prompt suggestions, coverage-stamped). **Success Criteria:** 5 criteria address mechanical tier (no-manual refresh), robustness (concurrent closes/conflicts never abort), analysis tier (ship + on-demand refresh with coverage), cadence integration (deterministic threshold), and consumer ownership (no bkit-install overwrite). **Key Edge Cases:** Concurrent closes / `-X ours` conflicts (board reproducible from tracker), per-workflow staging shapes (design/plan widen allowlist; build/debug/ship have existing paths), marker self-healing (re-emit missing blocks), large-tracker context exhaustion (bounded scan + coverage-stamped), hand-edits (banner reverts), build/debug phase lag (tracker = live authority). **Verdict on template adherence:** ✓ Compliant. Narrative + Success Criteria + Process Sketch + Key Edge Cases present in design-phase format (Concrete Example and Derived Test Matrix are plan-phase, correctly omitted here).

## Breaking Changes

None. All changes are additive: new file `docs/roadmap.md` (consumer-owned, not a shipped managed-block template), new shell helper `.bkit/scripts/bkit-roadmap-fold.sh` (reuses existing `bkit-status-fold.sh`), new subagent `@bkit-roadmap-refresh`, new utility workflow `/bkit-roadmap`. Existing workflows (five Close steps) extended but not broken — STRAY-guard allowlist widened in design/plan workflows to include `^docs/roadmap\.md$`, while build/debug/ship already capture it via existing `git add` paths. No API contract changes, no database schema changes, no removed exports. `.agents/docs.md` gains one new row (consumer-owned section).

## Feasibility

High. No spike generated, but design is well-grounded in existing bkit infrastructure. Reuses proven patterns: (a) `bkit-status-fold.sh` pattern (#58 single-source reducer, extended for tracker projection), (b) `status.jsonl` format (#209 precedent), (c) two-block seam anti-clobber (#209), (d) MCP `list_issues` for bounded reads, (e) jq rendering, (f) parallel subagent in Step 10 (ship/update-docs pattern), (g) per-workflow Close-step integration (existing pattern). No new persisted schema required — reuses status.jsonl + stats.jsonl (ship-cycle counter). Technical risks identified and mitigated: large-tracker context exhaustion (bounded scan + coverage-stamped), per-close MCP availability (best-effort fail-open + stderr logs), concurrent closes/conflicts (pure projection regenerates all). Feasibility risk is primarily operational (five workflow edits + three shape-aware staging paths + mirror regen), not technical.

## Synthesis Coverage

Three brainstorm lenses synthesized into 9 approaches; final design KEPT 3A (core: regenerate-on-conflict pure-projection + two marker blocks), MERGED 1A (parallel subagent + sourced fold pattern) and 2A-split (two-block seam kept, persisted ledger rejected), REJECTED 1B/2C/3B (single-tier variants, conflicts owner requirements), 2B (shared-file race, mirrors #209 Defect A), 3C (over-engineered ledger). Synthesis is sound: ✓ kept only approach satisfying two-tier requirement, ✓ merged tested patterns (fold, parallel subagent), ✓ split ideas (kept value, rejected overhead), ✓ rejected known anti-patterns (shared-file races). No lost good options; good rationale for each rejection.

## Scope Alignment

Focused and well-scoped. Deliverables: automated roadmap.md status/analysis refresh at close/on-demand, bounded analysis with coverage-stamped cadence. Explicitly OUT-OF-SCOPE (deferred as features or dependencies): #260 standalone sensing contract/actuator, #80 lens engine, #260 tick-step-1 YAGNI, persistent roadmap.jsonl ledger, build/debug dev-write (deferred, tracker = live authority). The design delivers #260's fold sense primitive without building #260 itself — a smart boundary. No scope creep; all planned surfaces align with the two-tier acceptance scenario.

## Risks

**Unknowns:** (1) Human gate on build/debug dev-write — should between-ship phases force dev update? (2) Cadence numbers — proposed N=5 ship-cycles + staleness-days fallback. (3) Status-board columns + closed-issue policy (proposed: open + recently-merged only). **Dependencies:** (1) #80 audit-candidate injection assumes lens engine lands (fallback: generic "run audit" reference). (2) #324 expected to provide persisted ship-cycle row schema in stats.jsonl. **Assumptions:** (1) No concurrent workflows per clone (regenerate-on-conflict tolerates but not designed for parallel). (2) Shipped text stays stack/vendor-agnostic. **Operational risks:** (1) Cross-provider mirror regen (five workflows + agent + utility; force-overwritten NOT drift-gated; silent shipping if stale). Mitigation: batch at session end + dogfood install AND upgrade. (2) Per-workflow-shape staging integration (design/plan widen allowlist; build/debug/ship reuse existing paths; single grep would miss reality). Mitigation: per-shape-aware CI/bats assertion. (3) Analysis maxTurns/context exhaustion on 200+ issues. Mitigation: bounded scan + coverage-stamped + ROADMAP_SCAN_COVERAGE counter (machine-visible). (4) Per-close MCP read couples close latency to tracker availability. Mitigation: best-effort fail-open (keep prior block, never gate) + stderr logs on every fail branch.

## Action Items

_None._ Design is complete and ready for planning. All three OPEN questions are addressed in Outstanding Questions section with recommended answers.

## Outstanding Questions

- **Q:** Should build/debug closes force a dev-located `roadmap.md` status write so `dev`'s board reflects build/debug phases between ships (cost: adding dev-writes to workflows that don't write dev today)? — **Recommended:** No (per v1 proposal). Tracker labels = live authority; staleness-honesty banner is sufficient. Between-ship visibility via tracker is adequate; if critical later, make it a v2 feature. Operational simplicity wins.

- **Q:** Cadence numbers: `N` ship-cycles and staleness-days fallback value? — **Recommended:** N=5 ship-cycles + 14-day staleness fallback. Fires audit/ledger injection when either 5 ships occur or 14 days pass since last analysis. Tunable post-ship.

- **Q:** Exact status-board columns and closed-issue handling? — **Recommended:** Columns: `Issue | Title | Phase | Milestone | Blocked-by | Last-transition ts`. Show open + recently-merged (last 2 releases, ~2-4 weeks); closed history archived in `docs/completed.md`. Avoids board bloat, keeps focus current.

## Suggested Workstreams

- **WS-1: Roadmap artifact + deterministic fold foundation** (Requires: none) — `docs/roadmap.md` marker-block layout, bootstrap flow, `.bkit/scripts/bkit-roadmap-fold.sh` shell helper (sources `bkit-status-fold.sh` + adds tracker projection), frontier-snapshot schema, status-board columns definition, `.agents/docs.md` row. Root deliverable; both tiers depend on it.

- **WS-2: Mechanical status tier** (Requires: WS-1) — Per-close hook in all five workflows (design/plan/build/debug/ship) — bounded `list_issues` MCP read + fold → rewrite `roadmap-status` block, staged per workflow shape (design/plan widen STRAY allowlist; build/debug/ship use existing paths), best-effort fail-open, per-workflow-shape-aware CI/bats assertion.

- **WS-3: Analysis tier — @bkit-roadmap-refresh opus leaf** (Requires: WS-1) — New subagent writes ONLY `roadmap-analysis` block; added as 3rd parallel in ship Step 10, reads bounded frontier + deferrals/failures, writes ranked best-next-step + groupings + prompt suggestions + coverage stamp + `ROADMAP_SCAN_COVERAGE` counter row.

- **WS-4: Cadence-driven ledger/audit injection** (Requires: WS-3) — Deterministic threshold (N ship-cycles + staleness-days) derived from persisted `.bkit/stats.jsonl` rows; fires audit candidate + grouping ledger items when threshold crosses; logs `[bkit-analysis]` on counter-advance + injection-fire.

- **WS-5: On-demand `/bkit-roadmap` utility workflow** (Requires: WS-2, WS-3) — Thin composition reusing mechanical fold + `@bkit-roadmap-refresh`; gives on-demand refresh outside close cycle.

- **WS-6: Cross-provider mirror regen + live dogfood** (Requires: WS-2, WS-3, WS-4, WS-5) — Mirror regen for five workflows + new agent + new utility (claude/cursor/opencode), batched at session end; live dogfood of `bkit install` AND `bkit upgrade` (separate engines); verify `docs/roadmap.md` stays consumer-owned (no `bkit install` overwrite, `bkit check` drift clean).

## Recommended Next Step

```text
/bkit-plan 380

Brief: Execute WS-1–WS-6 in sequence (foundation → mechanical → analysis → cadence → utility → mirror+dogfood). Confirm three open questions with owner before implementation details: build/debug dev-write policy, cadence numbers (propose N=5, 14d staleness), status-board columns + closed-issue handling. Caveat: per-workflow-shape staging integration (design/plan widen allowlist; build/debug/ship reuse existing) must land correctly in all five workflows — per-shape-aware CI/bats assertion is mandatory. Design: docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md
```
