# Build Input — 380-roadmap-analysis-refresh

## Session Prompt

```
/bkit-build 380
```

## Issue #380 — Constant roadmap analysis refresh

URL: https://github.com/cbartens/bkit/issues/380
State: open | Labels: enhancement, bkit:build

### Description

Constant roadmap analysis refresh written to roadmap.md
Automated version of Bkit / Gether / Fraser 'roadmap' issues / ledgers
Example https://github.com/gether-life/app-gether-life/issues/398
Integrate into bkit process, i.e. add new designs, plans, build, debug, ship in progress
At every workflow close run new 'Roadmap update' subagent to analyse roadmap.md and context (tracker issues)
And refine / update docs/roadmap.md to human and agents always know the best next step to take incl. prompt suggestions
Prompt suggestions should use bkit processes in optimal fashion and suggest also when not to use as task too easy
Prompt suggestions should be scope aware and group issues together where feasible
Prompt suggestions should be IDE aware (bkit install) and include model recommendations
Prompt suggestions should maximise use of subagents where possible, i.e. opus writes specs, sonnet subagents execute
And every now and then inject #80 audits as next step and then integrate audit gap closures into work
Same for deferrals.jsonl and failures.jsonl, should be reviewed and integrated periodically
Can later be integrated / evolved into #260

### Comments

#### @cbartens — 2026-07-22T22:43:33Z

## Shaping notes — scope, forks, and next step

**Recommendation: `bkit-design` next, not `bkit-plan`.** The _what_ is clear, but every _how_ is an open architectural fork (below). `bkit-plan` assumes a settled approach and just sequences tasks — jumping there hard-codes one unexamined answer per fork. This is a multi-workstream feature: a new agent + a new doc contract + close-step hooks touching the shipped surface of all 5 workflows (cross-provider mirror regen) + ledger/audit integration + a stated evolution path into #260. That's design territory.

### Core forks the design must resolve

1. **Where does the roadmap live?** Title/body say `docs/roadmap.md`; the reference example ([gether-life#398](https://github.com/gether-life/app-gether-life/issues/398)) is a _tracker issue_. Options: file-only / issue-only / file-as-source + issue-as-rendered-mirror. File = versioned, diffable, in-context for agents; issue = human-visible + notification-native. Likely landing: `docs/roadmap.md` as a **consumer-owned generated artifact** (peer of `status.jsonl` / `deferrals.jsonl`), NOT a shipped managed-block template — confirm.

2. **Trigger cadence.** "At every workflow close" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale "read whole roadmap + all tracker issues" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) **ship-close only + an on-demand `/bkit-roadmap` utility**; (c) event-driven + heartbeat (mirrors #260's tick). Lean (b) for v1.

3. **Relationship to #260.** #380 already says "can evolve into #260." Framing: **#380 = sense + human-facing next-step recommendation; #260 = autonomous actuation.** #260's tick step 1 ("Sense → reconstruct the frontier") _is_ #380's core engine. Design them as one shared **sensing primitive** so we don't build it twice (rules: _improve over duplicate_). Decide explicitly: is #380 the #260 sensing substrate, or standalone?

4. **Ledger + audit integration cadence.** "Every now and then inject #80 audits", "periodically review deferrals/failures.jsonl" — cadence is undefined. Needs a concrete trigger (every N ship cycles / staleness threshold / count threshold) and a surfacing model (audit + ledger items become **candidate grouped next-steps** on the roadmap).

5. **Prompt-suggestion content model** (the rich requirement). Suggestions must be bkit-optimal (incl. _when NOT to use bkit — task too easy_), scope-aware + issue-grouping, IDE-aware, model-recommending, subagent-maximising. Concerns to design around:
   - Model names + IDE targets are **volatile/vendor-specific** — a shipped agent must NOT hardcode them; reference the model-selection doctrine generically or read from config (model IDs come from live endpoints, not stored strings).
   - "When not to use bkit" ≈ the existing `plan-complexity-check` heuristic — reuse it.
   - Issue-grouping ≈ `design→organise` workstream/dependency logic + #260's DAG — reuse, don't reinvent.

### Constraints to carry into design

- **Stack-independence:** the agent may read "tracker issues" generically but must bake in no stack/vendor (shipped-surface rule).
- **Cross-provider:** any new close-step + agent = mirror regen across claude/cursor/opencode; must work under all three.
- **Concurrency:** the roadmap write is another close-commit — fine within one clone, but note the no-concurrent-workflows-per-clone constraint.
- **Tracker writes are MCP-only.**

### Suggested phasing (for the design to weigh)

- **v1** — `docs/roadmap.md` generator agent + ship-close hook + on-demand utility; human-readable "best next step" with prompt suggestions.
- **v2** — deferrals/failures.jsonl review + #80 audit injection on a defined cadence.
- **v3** — promote the sensing primitive into #260's tick.

**Next step:** `bkit-design` on this issue — this comment can seed the brainstorm inputs.

---

#### @cbartens — 2026-07-22T22:47:22Z

> Where does the roadmap live?

Must be docs/roadmap.md

> Trigger cadence. "At every workflow close" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale "read whole roadmap + all tracker issues" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) ship-close only + an on-demand /bkit-roadmap utility; (c) event-driven + heartbeat (mirrors https://github.com/cbartens/bkit/issues/260's tick). Lean (b) for v1.

yes "(b) ship-close only + an on-demand /bkit-roadmap utility" but maybe add something simpler as in mechanical roadmap.md update in each workflow to move issues from design -> plan -> build -> debug -> ship similar to tracker updates and analysis only on ship, that way other agents can see status in roadmap.md

---

#### @cbartens — 2026-07-22T22:48:58Z

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

---

#### @cbartens — 2026-07-22T22:50:18Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

---

#### @cbartens — 2026-07-22T22:56:51Z

### Step 3 — Brainstorm & Ideate

---

#### @cbartens — 2026-07-22T23:06:24Z

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v1-draft.md)

---

#### @cbartens — 2026-07-22T23:10:26Z

### Step 5 — Design Review - Verdict: CONCERNS

---

#### @cbartens — 2026-07-22T23:16:53Z

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v2-reviewed.md)

---

#### @cbartens — 2026-07-22T23:19:06Z

### Step 7 — Design Organise - Verdict: PASS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md)

---

#### @cbartens — 2026-07-22T23:27:41Z

### Step 8 — Summary - Verdict: PASS

[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-summary.md)

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

---

#### @cbartens — 2026-07-22T23:31:04Z

### Step 10 — Close Workflow

#### Artifacts

- [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md)
- [design-brainstorm-ideate-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-brainstorm-ideate-1.md)
- [design-brainstorm-ideate-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-brainstorm-ideate-2.md)
- [design-brainstorm-ideate-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-brainstorm-ideate-3.md)
- [design-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-input.md)
- [design-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-review-1.md)
- [design-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-review-2.md)
- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-summary.md)
- [design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v1-draft.md)
- [design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v2-reviewed.md)
- [design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md)

#### Telemetry

**design close** · cbartens/bkit

| metric          | this run                       | med·5 |
| --------------- | ------------------------------ | ----- |
| durationSeconds | 38443 (10h41m)                 | —     |
| linesChanged    | 1735 (+1735/-0)                | —     |
| filesChanged    | 15                             | —     |
| frictionAdded   | 1                              | —     |
| deferralsAdded  | 2                              | —     |
| failuresAdded   | 0                              | —     |
| compliance      | 2 pass · 0 fail · 0 n/a (100%) | —     |
| attempts        | DESIGN_ATTEMPT 1               | —     |

`med·5` = median of the previous 5 design runs (— if < 3) · ledger 11 rows, 0 malformed

[#380 Constant roadmap analysis refresh](https://github.com/cbartens/bkit/issues/380)

---

#### @cbartens — 2026-07-23T03:17:33Z

## Post-design addition — roadmap must be tracker-optional (on-disk-first)

New requirement from the owner, folded into the canonical design doc after close:

> Should work without a connected tracker — scan existing design/plan `.md` docs in `docs/plans` and build the roadmap from those, plus `failures.jsonl`/`deferrals.jsonl`, plus any ideas for new work in a consumer-owned section at the bottom of `roadmap.md`. If a tracker IS connected, additionally scan open issues + their status/readiness.

This **inverts the sensing model**: the merged design treated the tracker `list_issues` read as the primary status source. It's now **on-disk-first, tracker-additive** — which also makes #380 correctly honour bkit's `tracker: none` mode (#202 inline-marker model) and strengthens the stack-independence posture.

### What changed in the design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`)

| Area                                     | Change                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sensing source**                       | New Decisions row: **ON-DISK-FIRST** — per-FID phase from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + folded `status.jsonl` + `docs/completed.md`, plus `deferrals`/`failures.jsonl` and the consumer ideas region. `list_issues` is **additive, run only when a tracker is wired**; skipped entirely under `none`. |
| **Success Criteria #1–#2**               | Board is built primarily from on-disk artifacts (works with NO tracker); tracker enriches with open issues + `bkit:*` phase/readiness when wired; regenerable from on-disk (+ tracker when wired).                                                                                                                              |
| **`bkit-roadmap-fold.sh` (Component 2)** | Projection input = `(on-disk plan-artifact scan + folded status.jsonl [+ tracker rows when wired]) → status board + frontier snapshot`; reads wired-vs-`none` from the #202 inline-marker config.                                                                                                                               |
| **Mechanical hook (Component 3)**        | Always-run on-disk scan; the bounded `list_issues` read is conditional on a wired tracker; a failed/empty read falls back to the on-disk board (never blank), never gates the close.                                                                                                                                            |
| **Consumer "Ideas / New Work" region**   | Now a first-class, named region **below the last machine marker** — never rewritten by any regenerator, and a declared **read-input** for the analysis tier (folded into best-next-step; may suggest filing as an issue when a tracker is wired).                                                                               |
| **Data model**                           | Status-board rows = union of on-disk FIDs ∪ open tracker issues (when wired); frontier snapshot item gains `source ∈ {"on-disk","tracker"}`.                                                                                                                                                                                    |
| **New edge cases**                       | `tracker: none` / tracker-read-failure (on-disk floor, never empty); build/debug on-disk lag (same accepted trade-off, enrichment overrides when wired).                                                                                                                                                                        |

WS-1 (fold foundation) absorbs the on-disk scan + the ideas-region contract; WS-2 makes the tracker read conditional; WS-3 reads the ideas region. No new workstream needed — the change is scoped inside the existing WS-1–WS-3 boundaries.

Committed to `dev` as a docs-only amendment (`docs(380-roadmap-analysis-refresh): fold tracker-optional on-disk sensing into design`). Ready for `/bkit-plan 380`.

---

#### @cbartens — 2026-07-23T03:33:13Z

## Design revision 2 — `roadmap.md` is the CANONICAL home for issue state

Owner direction after review. This **inverts the authority model** (previously: tracker = live authority, roadmap = derived view). Captured as a superseding `## Addendum — Canonical-home revision` in the design doc (where it conflicts with the body, the addendum wins).

| #     | Decision                                                                                                                                   | Effect                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A** | `docs/roadmap.md` = **canonical home** for issue state; tracker = downstream mirror                                                        | Authority chain flips to _workflow → on-disk + roadmap.md (canonical) → tracker labels (synced from roadmap)_. Every worked-on item appears under exactly one phase section. Supersedes "tracker = live authority".                        |
| **B** | **Phase-sectioned board**: Backlog → Design → Plan → Build → Debug → Ship                                                                  | Item moves to the completed ledger on ship. **Backlog** = the free-form consumer-managed region at the bottom (the "Ideas / New Work" region, renamed + promoted); never regenerated, read by analysis, promotable into design.            |
| **C** | **build/debug now write roadmap status to `dev`** (dev-lock idiom) — **resolves the OPEN build/debug-dev-write question → YES**            | All five workflows refresh the dev roadmap at close. This is the only way `tracker: none` repos see build/debug on dev. Supersedes "v1 = no build/debug dev-write".                                                                        |
| **D** | **Reverse tracker-label sync** (roadmap → tracker) on the cadence                                                                          | New capability: reconcile each open issue's `bkit:*` label to its roadmap section. MCP-only, best-effort, idempotent, only reconciles settled drift, no-op under `tracker: none`.                                                          |
| **E** | On-disk scan **excludes completed** FIDs                                                                                                   | Bounds `docs/plans/**` growth (your finding #2).                                                                                                                                                                                           |
| **F** | **FID is the universal key**; tracker id is embedded in the FID when connected                                                             | No separate issue-number column (your finding #3).                                                                                                                                                                                         |
| **G** | **Recommend `docs/completed.md` → `docs/completed.jsonl`** (structured shipped-FID ledger, peer of deferrals/failures) — **confirm scope** | Machine-readable "is this FID shipped?" instead of parsing markdown; `@bkit-ship-update-docs` appends rows. **Touches the ship workflow + existing `completed.md` readers**, so it's a companion change to confirm, not silently absorbed. |

**Conflict-safety preserved:** the phase sections stay regenerable (from dev-visible on-disk + each writer's own-FID phase, now incl. build/debug on dev); the Backlog is consumer-canonical, protected by living outside the machine markers. Plan must specify the per-FID upsert-vs-full-regenerate mechanism.

**Workstream impact:** WS-1 (+phase sections, backlog contract, exclude-completed, `completed.jsonl` schema), WS-2 (+build/debug dev-writes), WS-4 (+reverse tracker sync). A dedicated workstream for D+G if they grow.

Committed to `dev` (`docs(380): canonical-home revision`).

---

#### @cbartens — 2026-07-23T03:43:42Z

## Design re-review (post canonical-home revision) — both CONCERNS, no FAIL

Re-ran the buildability + operability lenses against the revised design. Both returned **CONCERNS** (buildable + operable; no blocker), each verified against source. The critical findings are now folded into the design as **plan directives** (`## Re-review findings — plan directives`); reports in the logs dir (`design-rereview-1.md`, `design-rereview-2.md`).

**Verified-against-source, load-bearing:**

1. **Phase sections must be a per-FID UPSERT/merge, not a blind full-regenerate.** build/debug rows are authored on `dev` but their `status.jsonl` lives on `feat/{FID}` — not re-derivable from `dev`. A later close doing a full rebuild would silently revert build/debug rows. → status region = idempotent per-FID upsert keyed on FID; `-X ours` non-event holds for the writer's own row only. (This resolves the body's open upsert-vs-regenerate question.)
2. **`completed.md` → `completed.jsonl` must migrate atomically, with backfill.** Confirmed: `bkit-ship.md:902` greps `docs/completed.md` for the ship verdict (miss it → `UPDATE_DOCS_VERDICT`=FAIL blocks **every** ship); `docs/completed.md` is hash-gated in `.bkit/version` (unlike deferrals.jsonl). Plus a one-time **backfill** — else finding E's exclude-completed reads an empty ledger on day one and every historically-shipped FID reappears as active.
3. **Reverse tracker sync is orchestrator-mediated + settled-drift-guarded.** Confirmed no leaf prompt has tracker MCP tools, so it lives in the workflow/cadence step, not `@bkit-roadmap-refresh`; reconciles only settled drift (skip actively-transitioning issues), idempotent, best-effort, logged.
4. **Canonical reconciliation/recovery check** — diff live `feat/*` (+ open issues when wired) against the board to re-add/flag lost in-flight rows.
5. **build/debug dev-write is fail-open + a 4th staging shape** — the per-shape CI/bats assertion must cover it.

All five are "plan must specify X" gaps, not design blockers — appropriate for the plan phase and now captured so they can't be lost.

**Verdict: design is plan-ready.** The gates are green (no FAIL across 4 review passes), the canonical-home + tracker-optional model is coherent, `completed.jsonl` is in-scope with its migration hazards mapped, and the crux (per-FID upsert + rollout backfill) is now an explicit directive. Recommend **`/bkit-plan 380`**, instructing the plan to resolve the five directives up front (WS-1 carries #2/#4, WS-2 carries #1/#5, WS-4 carries #3).

---

#### @cbartens — 2026-07-23T03:50:52Z

## Plan Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None (design workflow already ran on this same issue — canonical design doc: [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md))

---

#### @cbartens — 2026-07-23T03:52:55Z

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

---

#### @cbartens — 2026-07-23T04:06:09Z

### Step 3 — Generate Plan

[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v1-draft.md)

---

#### @cbartens — 2026-07-23T04:08:15Z

### Step 4 — Fetch Context

[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-failures.md)

Note: `mcp__github__search_issues` returned `total_count: 0` for every query on this private repo, including a bare control query — the known, already-logged failure (`github-mcp-search-issues-silently-returns-zero-private-repo`, still OPEN). Verified against `gh issue list --search` (which found matches) before classifying as `Search unavailable.` rather than `None.`, per that failure's own remediation guidance.

---

#### @cbartens — 2026-07-23T04:15:39Z

### Step 5 — Review Plan - Verdict: CONCERNS - Failures: 4

---

#### @cbartens — 2026-07-23T04:29:01Z

### Step 6 — Apply Review - Verdict: PASS

[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md)

---

#### @cbartens — 2026-07-23T04:37:08Z

### Step 7 — Scope Check - Verdict: PASS - Failures: 2

---

#### @cbartens — 2026-07-23T04:44:56Z

### Step 8 — Apply Scope - Verdict: CONCERNS

[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v3-checked.md)

---

#### @cbartens — 2026-07-23T04:46:13Z

### Step 9 — Complexity Check - Verdict: SPLIT

---

#### @cbartens — 2026-07-23T05:00:35Z

### Step 10 — Complexity Split - Verdict: PASS

[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-split.md)

---

#### @cbartens — 2026-07-23T05:04:41Z

### Step 11 — Summary - Verdict: PASS

[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-summary.md)

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

---

#### @cbartens — 2026-07-23T05:08:24Z

### Step 12 — Close Workflow

#### Artifacts

- [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md)
- [380-roadmap-analysis-refresh-plan-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan-1.md)
- [380-roadmap-analysis-refresh-plan-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan-2.md)
- [380-roadmap-analysis-refresh-plan-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan-3.md)
- [380-roadmap-analysis-refresh-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan.md)
- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-complexity-check.md)
- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-input.md)
- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-review-1.md)
- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-review-2.md)
- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-review-3.md)
- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-scope-check-1.md)
- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-scope-check-2.md)
- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-summary.md)
- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v1-draft.md)
- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md)
- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v3-checked.md)
- [plan-v4-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-1.md)
- [plan-v4-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-2.md)
- [plan-v4-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-3.md)
- [plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-split.md)

#### Telemetry

**plan close** · cbartens/bkit

| metric          | this run                       | med·5 |
| --------------- | ------------------------------ | ----- |
| durationSeconds | 40521 (11h15m)                 | —     |
| linesChanged    | 4905 (+4538/-367)              | —     |
| filesChanged    | 25                             | —     |
| taskCount       | 93                             | —     |
| frictionAdded   | 1                              | —     |
| deferralsAdded  | 1                              | —     |
| failuresAdded   | 0                              | —     |
| compliance      | 2 pass · 0 fail · 0 n/a (100%) | —     |
| attempts        | PLAN_ATTEMPT 1                 | —     |

`med·5` = median of the previous 5 plan runs (— if < 3) · ledger 15 rows, 0 malformed

[#380 Constant roadmap analysis refresh](https://github.com/cbartens/bkit/issues/380)

---

#### @cbartens — 2026-07-25T00:49:26Z

Agreed on all of it. A few things to pin down before I touch the plan docs.

**Schema fields** — add `references` (FID + on-disk paths, already a generic envelope field, just needs populating) and `summary`/`description` (new for the `outcome` kind — today only friction/deferral/failure/knowledge/decision have those). I'd skip adding a `key` field though: `key` in this ledger means "recurring, mutable identity, updated via same-key append" (a friction item gets re-touched over time). An activity row is a one-shot point-in-time event — every workflow close is a new row, not an update to a prior one — so `references: [FID, ...]` is the right fit, not `key`.

**Naming/location** — `activity.jsonl` is a good name, matches the `deferrals`/`failures`/`knowledge`/`decisions` convention. But that convention lives in `docs/`, while `stats.jsonl` lives in `.bkit/` (internal tooling dir) and also carries `counter`/`compliance` rows (attempt counters, pass/fail gate checks) that are pure build-machinery, not really "activity" in the human sense. Three options: (a) rename in place, `.bkit/activity.jsonl`, everything stays together; (b) move+rename the whole thing to `docs/activity.jsonl`, matching the sibling ledgers; (c) split — `counter`/`compliance` stay in `.bkit/stats.jsonl` untouched, and only `outcome` rows (now FID/summary/description-enriched) move to a new `docs/activity.jsonl`. I'd lean (c) — it keeps "internal telemetry" and "human-legible project history" in separate files with separate audiences, same split docs/ vs .bkit/ already draws everywhere else — but it's a real judgment call, your pick.

**Scope flag, genuinely worth pausing on:** I grepped — `stats.jsonl` is referenced in **42 files**: every workflow's source + all three rendered mirrors (claude/cursor/opencode, 20 files alone), the telemetry/comply/harvest/analysis/manifest source + 6 test files, and 4 docs pages. That's not a roadmap-feature change, it's a rename of shared infrastructure that #58/#209/#234/#324 all built on. Given how strict the scope-check reviewers were on this exact plan an hour ago, I'd want to either (a) spin this out as its own small prerequisite issue/plan that #380 then depends on, or (b) fold it into #380 sub-plan 1 explicitly as an added, acknowledged scope item. Which do you want?

**roadmap.md sections** — confirming my read since you didn't list a "Shipped" section: once an item's row reaches Ship and the ship workflow closes, the row is **removed from the board entirely** (not moved to a 6th section) — the ship close-hook's upsert action is a delete, not a move. The only remaining record that it ever existed is `activity.jsonl`'s `outcome` rows. That also means the board's own state (row present/absent) becomes directly verifiable — the ship-verdict gate checks "is the FID's row gone from roadmap.md," no ledger detour, and the already-planned reconcile/recovery task additionally reads `activity.jsonl` if the board ever needs rebuilding from scratch (an occasional best-effort read there is fine — that path already tolerates it). Is that the right read, or did you want shipped items to stay visible somewhere on the board?

That's just a stale background `find` command from earlier finishing up (part of my scope-check investigation a few turns back) — not new input. Still waiting on your answers to the three questions above: prerequisite issue vs. folded into #380 for the `stats.jsonl` rename, the file split/location choice, and whether "Ship = row removed from the board" matches what you intended.

---

#### @cbartens — 2026-07-25T01:47:44Z

## Decisions — completed ledger, board cap, telemetry scope (owner, 2026-07-25)

Answers to the three open questions, plus the row format. Captured as `## Addendum 2` in the design doc (where it conflicts with Addendum 1 or the body, Addendum 2 wins) and propagated through all four plan docs.

| #     | Decision                                                                    | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H** | **`docs/completed.md` is DELETED**, not retained                            | No dual-write, no generated markdown view. `docs/completed.jsonl` becomes the only shipped-feature record. Nobody reads the `.md` (humans read `docs/roadmap.md`; the sole machine reader is the ship verdict grep) and two records of one thing drift. Supersedes Addendum 1 § G's retention clause.                                                                                                                                                                                              |
| **I** | **Row format = a `deferral`/`failure` row minus `severity` and `status`**   | `key` = `{FID}` (identity `(kind, repo, key)`, existing key-based default — a re-ship is a same-`key` append, `fold()` last-wins, prior lines stay as history); `category` = the DOMAIN set shared with `deferral`/`failure`, not `completed.md`'s legacy product-shaped set; `summary` = title; `description` = the old `**Summary:**` prose; `references[]` absorbs `**Artifacts:**` + `**Related:**`. No `severity` (jsonl.md forbids it outside the triage trio), no `status` (terminal kind). |
| **J** | **Migration extends `bkit telemetry migrate`** — not a new backfill script  | `docs/completed.md` -> `docs/completed.jsonl` becomes the **fifth** `.md`->`.jsonl` pair on the existing migrator (`knowledge.md`, `decisions.md`, `pending.md`, `.bkit/friction.md` are the first four), inheriting its `.md.bak` -> write rows -> **row-count parity gate** -> delete-the-`.md`-only-after-parity contract and its idempotent re-run. Supersedes the planned `bkit-completed-backfill.sh`.                                                                                       |
| **K** | **`## Ship` and `## Shipped` are separate sections; Shipped caps at 10**    | Sections become Backlog -> Design -> Plan -> Build -> Debug -> Ship -> Shipped. `## Ship` = in-flight ship runs, per-FID upsert. `## Shipped` = last **10** by `ts` desc, **fully regenerated from `completed.jsonl`** each fold — holds no state, prunes itself, no delete step. Resolves the "board scope / drop-off policy" open question.                                                                                                                                                      |
| **L** | **`.bkit/stats.jsonl` unchanged — the `activity.jsonl` proposal is closed** | Recorded so it is not re-raised. Rejected because `outcome` rows drive the `med·5` report and are copied wholesale into the harvest store (adding consumer prose there changes what leaves a repo), and because `stats.jsonl` is the hot file `writeRollupShard` drains into archive shards — durable history must not sit in a compaction path.                                                                                                                                                   |

**Row shape:**

```jsonl
{
  "ts": 1753400000000,
  "kind": "completed",
  "repo": "cbartens/bkit",
  "bkitVersion": "4.8.0",
  "workflow": "ship",
  "step": "ship-update-docs",
  "subagent": "bkit-ship-update-docs",
  "model": "claude-opus-5",
  "key": "380-roadmap-analysis-refresh",
  "category": "agentic",
  "summary": "constant roadmap analysis refresh",
  "description": "Automated docs/roadmap.md with a deterministic status tier refreshed at every workflow close and an analysis tier refreshed at ship.",
  "references": [
    "380",
    "docs/plans/202607/380-roadmap-analysis-refresh-plan.md",
    "PR-401",
    "a1b2c3d"
  ]
}
```

### Two consequences worth flagging

**1. DE-39 voids the auto-run rollout.** The migrator is deliberately **never callable from `bkit upgrade`** — explicit invocation only, enforced mechanically by `bkit-telemetry-migrate.integration.test.ts`. That kills re-review directive #3(d)'s "wire the backfill to `bkit upgrade`" trigger. Rollout instead: (a) an install advisory on the existing `PreflightFinding` channel while `docs/completed.md` still exists, naming `bkit telemetry migrate`; (b) the fold's exclude-completed step falls back to the legacy `completed.md` grep while the ledger is absent/empty and the `.md` still exists, logging a `[bkit-roadmap]` hint. Deleting the `.md` at migration ends the fallback permanently. Without both, every historically-shipped FID re-materialises as active on an unmigrated consumer's first board.

**2. No template, no hash-gate — one fewer shipped file.** No `.jsonl` in the tree is install-seeded or listed in `.bkit/version` (`deferrals`/`failures`/`knowledge`/`decisions` are all born on first append), so `completed.jsonl` gets neither. The planned `.bkit/templates/docs/completed.jsonl` is dropped, and `.bkit/version`'s `docs/completed.md` entry is **removed** rather than regenerated.

### Plan updates applied

- **Design** — new `## Addendum 2` (§ H–L); Addendum 1 § B and § G and re-review directive #3 annotated as superseded in part.
- **SP1** — Task 2 rewritten from "backfill script + upgrade trigger" to "`bkit telemetry migrate` fifth pair + rollout advisory"; Task 1 payload gains `category`/`description` and drops the template; Task 3 gains the `## Shipped` regenerate + transitional fallback; Task 5 gains the `completed.md` deletion and its seven reference sites (`.gitattributes`, `.agents/docs.md`, `.bkit/version`, `.bkit/README.md:321`, `.bkit/workflows.md` x4); `[MODIFY] completed.md` became `[DELETE]`; Supersession Inventory, Rollback, Documentation Updates, Merge Method updated; matrix row 9 retargeted to `bkit-telemetry-migrate.integration.test.ts`; **new matrix rows 23** (Shipped regenerates capped at 10 without disturbing the in-flight Ship row) **and 24** (fallback fires only pre-migration).
- **SP2/SP3** — board-scope and `completed.md`-fate open questions marked RESOLVED; prerequisite names, rollback, knowledge/decision rows, Manual Verification Steps 1 and 4, and the `bkit install` hash-refresh task all updated for deletion-not-dual-write and migrate-not-backfill.
- **Master** — directive 2 wording, atomicity note, and the chosen-approach line.

Uncommitted on `dev` so far — say the word and I will commit.

### Still open

- **Cadence numbers** — `N` = 5 ship-cycles, staleness = 14 days (proposed defaults, unconfirmed).
- **Harvest scope** — `bkit harvest`/`bkit analysis` ingestion of `completed.jsonl` currently declared out of scope; count-only would be the natural future add.

---

#### @cbartens — 2026-07-27T00:10:10Z

## Design revision 3 — the feature ledger is canonical; `roadmap.md` becomes a projection

Owner direction across a working session. Captured as `## Addendum 3` (§ N–S) in the design doc, which **wins over Addendum 1, Addendum 2 and the body** where they conflict, and propagated through all four plan docs. This inverts the authority model a second time: Addendum 1 made `docs/roadmap.md` canonical; it is now a regenerable view of `docs/roadmap.jsonl`.

| #     | Decision                                                                                                                                                                                                                                                     | Effect                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **N** | **`docs/roadmap.jsonl`** — `kind: "feature"`, `key` = FID, `status: DESIGNED \| PLANNED \| BUILT \| DEBUGGED \| SHIPPED \| ABANDONED`, no `severity`, plus `category`/`summary`/`description`/`references`. Appended at **every** phase close, not just ship | Renames and widens Addendum 2's `completed.jsonl`. Each close is a same-`key` append; `fold()` last-wins gives the current phase, the row sequence is the history. build/debug reach `dev` via the Addendum 1 § C dev-lock write, now appending one `merge=union` line instead of upserting markdown                                                                                                                                 |
| **O** | **`docs/roadmap.md` is a pure projection** — fully regenerated from the ledger every fold                                                                                                                                                                    | **Directive 1 (per-FID upsert) is VOID.** The KN-42 duplicate-collapse invariant is VOID with it. **Directive 4 (reconcile/recovery) is VOID** as a recovery path — a lost or deleted board is rebuilt exactly by re-running the fold; what survives is a drift _check_ that warns when a live `feat/*` has no ledger row at all                                                                                                     |
| **P** | **Marker-pair invariant** — bkit rewrites only the bytes strictly between a `start`/`end` pair; everything outside any pair is consumer territory, wherever it sits                                                                                          | Replaces "the region below the last machine marker". Scratch notes above the board, between the two blocks, or at the bottom all survive. The self-heal path for mangled markers must repair them without swallowing adjacent text — the one regenerate path that can destroy consumer bytes, so it gets its own test row                                                                                                            |
| **Q** | **Cadence** — count distinct FIDs reaching `BUILT` **since the last cadence FIRE**; thresholds `bkit.roadmap.buildCycles` = 10 and `bkit.roadmap.stalenessDays` = 90 in the `package.json` manifest                                                          | Anchoring on the last FIRE is load-bearing: the analysis block refreshes at every ship close, so a refresh-anchored counter would reset every ship and never reach 10. Fire timestamp persists as a FID-free `ROADMAP_CADENCE_FIRE` counter row. Evaluated at ship close + `/bkit-roadmap`; a skipped ship delays a fire but never loses one, since the count accrues on builds. Firing rebaselines, so a 25-FID gap yields one fire |
| **R** | **No consumer task detail in harvested ledgers** — `references: ["{FID}"]` on `outcome` rows is **rejected**, not deferred                                                                                                                                   | `stats.jsonl` and `friction.jsonl` are `HARVEST_COPY_FILES`, copied wholesale into bkit's cross-repo store; they carry how bkit _performs_, never what a consumer is building. This reverses the "optional follow-up" in Addendum 2 § L                                                                                                                                                                                              |
| **S** | **Bootstrap seed** — the on-disk scan runs **once**, not per close                                                                                                                                                                                           | With the board projecting purely from the ledger, in-flight work with no rows would be invisible until its next phase close. The migration run seeds one row per in-flight FID from `docs/plans/**` + folded `status.jsonl`, then the scan is never used again                                                                                                                                                                       |

Also settled: **`ABANDONED` is appended by a human, or an agent on explicit human instruction** — never workflow-inferred — and hides the FID from the board entirely; `SHIPPED` needs no action, it ages off the last-10 window on its own. Both idioms get documented in `.bkit/jsonl.md` and the `roadmap.md` banner. **`bkit harvest` does not consume the ledger** (design § M) — not copied, not counted.

### What this removes

The design's three most expensive mechanisms existed _because_ `roadmap.md` was canonical and not re-derivable. An append-only, union-merged ledger that reaches `dev` at every close makes the board reproducible from scratch, so the per-FID upsert, the dedupe invariant that made `merge=union` safe on it, and the recovery pass all go. That is a net simplification of sub-plans 1 and 2, not added scope.

It also **supersedes a deferral we had already filed**: `380-persisted-frontier-snapshot-event-log-for-260` reads "persist the roadmap fold's frontier snapshot (or a `roadmap.jsonl` event log) if #260 needs durable cross-tick sensing." That is now in scope and built — the deferral is closed in SP3 Task 14 with a #260 reference, so #260 inherits the sensing substrate.

### Plan updates applied

- **Design** — new `## Addendum 3` (§ N–S); Addendum 1 § A and re-review directives 1/2, and Addendum 2 § H/I/J/K/L, all annotated with supersession pointers.
- **SP1** — Task 1 becomes the `kind: "feature"` codec + manifest keys; Task 2 becomes the migrate fifth pair **plus** the bootstrap seed; Task 3 becomes the projection fold carrying the marker-pair invariant; Task 5 asserts a `SHIPPED`-status row (presence alone must not pass, or a `BUILT` row greens a failed ship writer); Tasks 6/7 append status rows before regenerating. Matrix rows 1/2/3/6/8/9/10/19/21/23/24 rewritten, **new rows 24 (bootstrap seed) and 25 (marker repair does not swallow consumer text)**. Supersession inventory gains the two removed mechanisms.
- **SP2** — Task 10 counts distinct `BUILT` FIDs since the last fire with manifest-driven thresholds; Task 12 rescoped from recovery to a drift check; matrix rows 14/16 rewritten; cadence open question RESOLVED.
- **SP3** — decision + knowledge rows rewritten, Task 14 closes **both** deferrals, Manual Verification Step 4 checks the `SHIPPED`/`BUILT` gate distinction and scratchpad survival.
- **Master** — directive summaries plus a pointer that § N–S must be read before executing any sub-plan.

All five docs prettier-clean, uncommitted on `dev`. Cadence numbers and harvest scope from the previous round are folded in here rather than posted separately.

### Still open

**Nothing blocking.** One item worth a decision before build: `ABANDONED` relies on someone remembering to append the row. When a tracker is wired there is a natural signal — an issue closed with no `SHIPPED` row — that the reverse-sync step could surface as a candidate rather than act on. Not planned; say the word if it should be.

---

#### @cbartens — 2026-07-29T07:22:13Z

My recommendation: run sub-plan 1 on Claude/opus, then sub-plans 2 and 3 on opencode/glm-5.2 — those are mostly additive (a new prompt file, a new utility workflow, doc/ledger updates) with far less silent-failure surface. If you'd rather do the whole thing on GLM for cost, that's a reasonable call too; just treat a thin build-challenge report as a signal to re-run the challenge step on Claude rather than as a pass.

---

## Plan (master)

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
