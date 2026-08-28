# Ship Input — 380-roadmap-analysis-refresh

## Session Prompt

```
/bkit-ship #380
```

## Issue #380 — Constant roadmap analysis refresh

URL: https://github.com/cbartens/bkit/issues/380
State: open
Labels: enhancement, bkit:ship, bkit:debug, bkit:failed

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

### Comments (oldest → newest, bkit:generated excluded)

#### 2026-07-22T22:43:33Z — cbartens

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

#### 2026-07-22T22:47:22Z — cbartens

> Where does the roadmap live?

Must be docs/roadmap.md

> Trigger cadence. "At every workflow close" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale "read whole roadmap + all tracker issues" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) ship-close only + an on-demand /bkit-roadmap utility; (c) event-driven + heartbeat (mirrors https://github.com/cbartens/bkit/issues/260's tick). Lean (b) for v1.

yes "(b) ship-close only + an on-demand /bkit-roadmap utility" but maybe add something simpler as in mechanical roadmap.md update in each workflow to move issues from design -> plan -> build -> debug -> ship similar to tracker updates and analysis only on ship, that way other agents can see status in roadmap.md

#### 2026-07-22T22:48:58Z — cbartens

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

#### 2026-07-22T22:50:18Z — cbartens

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

#### 2026-07-22T22:56:51Z — cbartens

### Step 3 — Brainstorm & Ideate

#### 2026-07-22T23:06:24Z — cbartens

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v1-draft.md)

#### 2026-07-22T23:10:26Z — cbartens

### Step 5 — Design Review - Verdict: CONCERNS

#### 2026-07-22T23:16:53Z — cbartens

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v2-reviewed.md)

#### 2026-07-22T23:19:06Z — cbartens

### Step 7 — Design Organise - Verdict: PASS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md)

#### 2026-07-22T23:27:41Z — cbartens

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

#### 2026-07-22T23:31:04Z — cbartens

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

#### 2026-07-23T03:17:33Z — cbartens

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

#### 2026-07-23T03:33:13Z — cbartens

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

#### 2026-07-23T03:43:42Z — cbartens

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

#### 2026-07-23T03:50:52Z — cbartens

## Plan Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None (design workflow already ran on this same issue — canonical design doc: [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md))

#### 2026-07-23T03:52:55Z — cbartens

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

#### 2026-07-23T04:06:09Z — cbartens

### Step 3 — Generate Plan

[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v1-draft.md)

#### 2026-07-23T04:08:15Z — cbartens

### Step 4 — Fetch Context

[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-failures.md)

Note: `mcp__github__search_issues` returned `total_count: 0` for every query on this private repo, including a bare control query — the known, already-logged failure (`github-mcp-search-issues-silently-returns-zero-private-repo`, still OPEN). Verified against `gh issue list --search` (which found matches) before classifying as `Search unavailable.` rather than `None.`, per that failure's own remediation guidance.

#### 2026-07-23T04:15:39Z — cbartens

### Step 5 — Review Plan - Verdict: CONCERNS - Failures: 4

#### 2026-07-23T04:29:01Z — cbartens

### Step 6 — Apply Review - Verdict: PASS

[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md)

#### 2026-07-23T04:37:08Z — cbartens

### Step 7 — Scope Check - Verdict: PASS - Failures: 2

#### 2026-07-23T04:44:56Z — cbartens

### Step 8 — Apply Scope - Verdict: CONCERNS

[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v3-checked.md)

#### 2026-07-23T04:46:13Z — cbartens

### Step 9 — Complexity Check - Verdict: SPLIT

#### 2026-07-23T05:00:35Z — cbartens

### Step 10 — Complexity Split - Verdict: PASS

[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-split.md)

#### 2026-07-23T05:04:41Z — cbartens

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

#### 2026-07-23T05:08:24Z — cbartens

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

#### 2026-07-25T00:49:26Z — cbartens

Agreed on all of it. A few things to pin down before I touch the plan docs.

**Schema fields** — add `references` (FID + on-disk paths, already a generic envelope field, just needs populating) and `summary`/`description` (new for the `outcome` kind — today only friction/deferral/failure/knowledge/decision have those). I'd skip adding a `key` field though: `key` in this ledger means "recurring, mutable identity, updated via same-key append" (a friction item gets re-touched over time). An activity row is a one-shot point-in-time event — every workflow close is a new row, not an update to a prior one — so `references: [FID, ...]` is the right fit, not `key`.

**Naming/location** — `activity.jsonl` is a good name, matches the `deferrals`/`failures`/`knowledge`/`decisions` convention. But that convention lives in `docs/`, while `stats.jsonl` lives in `.bkit/` (internal tooling dir) and also carries `counter`/`compliance` rows (attempt counters, pass/fail gate checks) that are pure build-machinery, not really "activity" in the human sense. Three options: (a) rename in place, `.bkit/activity.jsonl`, everything stays together; (b) move+rename the whole thing to `docs/activity.jsonl`, matching the sibling ledgers; (c) split — `counter`/`compliance` stay in `.bkit/stats.jsonl` untouched, and only `outcome` rows (now FID/summary/description-enriched) move to a new `docs/activity.jsonl`. I'd lean (c) — it keeps "internal telemetry" and "human-legible project history" in separate files with separate audiences, same split docs/ vs .bkit/ already draws everywhere else — but it's a real judgment call, your pick.

**Scope flag, genuinely worth pausing on:** I grepped — `stats.jsonl` is referenced in **42 files**: every workflow's source + all three rendered mirrors (claude/cursor/opencode, 20 files alone), the telemetry/comply/harvest/analysis/manifest source + 6 test files, and 4 docs pages. That's not a roadmap-feature change, it's a rename of shared infrastructure that #58/#209/#234/#324 all built on. Given how strict the scope-check reviewers were on this exact plan an hour ago, I'd want to either (a) spin this out as its own small prerequisite issue/plan that #380 then depends on, or (b) fold it into #380 sub-plan 1 explicitly as an added, acknowledged scope item. Which do you want?

**roadmap.md sections** — confirming my read since you didn't list a "Shipped" section: once an item's row reaches Ship and the ship workflow closes, the row is **removed from the board entirely** (not moved to a 6th section) — the ship close-hook's upsert action is a delete, not a move. The only remaining record that it ever existed is `activity.jsonl`'s `outcome` rows. That also means the board's own state (row present/absent) becomes directly verifiable — the ship-verdict gate checks "is the FID's row gone from roadmap.md," no ledger detour, and the already-planned reconcile/recovery task additionally reads `activity.jsonl` if the board ever needs rebuilding from scratch (an occasional best-effort read there is fine — that path already tolerates it). Is that the right read, or did you want shipped items to stay visible somewhere on the board?

That's just a stale background `find` command from earlier finishing up (part of my scope-check investigation a few turns back) — not new input. Still waiting on your answers to the three questions above: prerequisite issue vs. folded into #380 for the `stats.jsonl` rename, the file split/location choice, and whether "Ship = row removed from the board" matches what you intended.

#### 2026-07-25T01:47:44Z — cbartens

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

#### 2026-07-27T00:10:10Z — cbartens

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

#### 2026-07-29T07:22:13Z — cbartens

My recommendation: run sub-plan 1 on Claude/opus, then sub-plans 2 and 3 on opencode/glm-5.2 — those are mostly additive (a new prompt file, a new utility workflow, doc/ledger updates) with far less silent-failure surface. If you'd rather do the whole thing on GLM for cost, that's a reasonable call too; just treat a thin build-challenge report as a signal to re-run the challenge step on Claude rather than as a pass.

#### 2026-07-29T07:23:43Z — cbartens

## Build Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

#### 2026-07-29T07:25:11Z — cbartens

### Step 2 — Worktree Setup

[cbartens/bkit/tree/feat/380-roadmap-analysis-refresh](https://github.com/cbartens/bkit/tree/feat/380-roadmap-analysis-refresh)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/feat/380-roadmap-analysis-refresh/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

#### 2026-07-29T07:25:31Z — cbartens

### Step 3 — Branch Sync

[cbartens/bkit/tree/feat/380-roadmap-analysis-refresh](https://github.com/cbartens/bkit/tree/feat/380-roadmap-analysis-refresh)

#### 2026-07-29T07:26:26Z — cbartens

### Step 4 — Install Skills

#### 2026-07-29T08:08:01Z — cbartens

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 1/3

#### 2026-07-29T08:15:55Z — cbartens

### Step 6 — Plan Verify - Verdict: FAIL - Failures: 9 - Sub-plan: 1/3 - Attempt: 1

#### 2026-07-29T08:33:27Z — cbartens

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/3 - Attempt: 1 - Strategy: STANDARD

#### 2026-07-29T08:48:18Z — cbartens

### Step 6 — Plan Verify - Verdict: FAIL - Failures: 9 - Sub-plan: 1/3 - Attempt: 2

Note: branch had been cut from a stale `origin/dev` and was missing plan revision `4840de2b`. `origin/dev` merged in, Tasks 5–7 re-executed against the revised spec, then re-verified.

#### 2026-07-29T08:53:57Z — cbartens

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/3 - Attempt: 2 - Strategy: PIVOT

#### 2026-07-29T09:11:24Z — cbartens

### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 1/3 - Attempt: 3

### Step 7 — Plan Gaps Remediate - Verdict: CONCERNS - Sub-plan: 1/3 - Attempt: 3 - Strategy: FINAL

#### 2026-07-29T09:16:44Z — cbartens

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 1/3 - Attempt: 4

Sub-plan 1/3 (Foundation + Mechanical tier, WS-1 + WS-2) complete. Advancing to sub-plan 2/3.

#### 2026-07-29T09:37:43Z — cbartens

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 2/3

#### 2026-07-29T09:46:44Z — cbartens

### Step 6 — Plan Verify - Verdict: FAIL - Failures: 4 - Sub-plan: 2/3 - Attempt: 1

Blocking: 6 real test failures (status-hole-detector, counter-prose-audit), invalid MCP tool names asserted by their own test, and an unexecutable reverse-sync write.

#### 2026-07-29T10:09:47Z — cbartens

### Step 6 — Plan Verify - Verdict: FAIL - Failures: 1 - Sub-plan: 2/3 - Attempt: 2

Suite is green again (2769 pass, 0 fail) and all four attempt-1 blockers confirmed closed. One new blocking gap in the reverse-sync remediation: it iterates every ledger FID rather than settled _drift_, passes a single-element `labels` array that would wipe co-existing labels, and oscillates `SHIPPED`→`bkit:ship` against Step 13's `bkit:merged`.

#### 2026-07-29T10:24:11Z — cbartens

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 2/3 - Attempt: 2 - Strategy: PIVOT

#### 2026-07-29T10:43:06Z — cbartens

### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 2/3 - Attempt: 3

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 2/3 - Attempt: 3 - Strategy: FINAL

Reverse-sync blocker confirmed closed by mutation testing (5 reintroduced defects, each caught). Two MEDIUM residuals closed: `DEBUGGED`→`bkit:debug` additive-label collapse, and per-FID `git ls-remote` (50+ round trips) reduced to one bounded remote read.

#### 2026-07-29T10:50:19Z — cbartens

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 2/3 - Attempt: 4

Sub-plan 2/3 (Analysis + Cadence/Sync/Reconcile, WS-3 + WS-4) complete. Suite green at default timeout (2773 pass, 0 fail) — the earlier timeout failures were confirmed a machine-load artifact. Advancing to sub-plan 3/3.

#### 2026-07-29T11:14:08Z — cbartens

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 3/3

Batched mirror regen done (`bkit check` 0 writes), `slop:delta` back to net 0/0.00, and the two carried `docs/failures.jsonl` items closed.

#### 2026-07-29T11:25:34Z — cbartens

### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 2 - Sub-plan: 3/3 - Attempt: 1

Mirror regen verified (all six ship mirrors clean of `docs/completed.md`, `bkit check` 0 writes) and `slop:delta` independently confirmed net 0. Two gaps: matrix row 18 has no covering test, and `bkit telemetry migrate` was inconclusive in a scratch consumer (exit 0, no output, no ledger written).

#### 2026-07-29T11:44:34Z — cbartens

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 3/3 - Attempt: 1 - Strategy: STANDARD

GAP-2 turned out to be a real consumer-facing defect, not a bad invocation: `bkit telemetry migrate` gated `knowledge`/`decisions` on `!mdExists && jsonlNonEmpty` while the other three pairs gated on `!mdExists` alone, so any consumer without `docs/knowledge.md`/`docs/decisions.md` aborted the **entire** migrate run — including the `completed.md → roadmap.jsonl` port. Reproduced via a packed-tarball scratch consumer, fixed, regression test added.

#### 2026-07-29T12:02:41Z — cbartens

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 3/3 - Attempt: 3

All three sub-plans verified PASS. Gates green: 2780 tests, bats 189/189, typecheck, format:check, `slop:delta` net 0, `bkit check` 0 writes, `check:dist` clean.

#### 2026-07-29T12:14:56Z — cbartens

### Step 8 — Plan Verify Holistic - Verdict: FAIL - Failures: 5

#### 2026-07-29T12:15:28Z — cbartens

### Workflow Failure

Step: 8 — Plan Verify Holistic; Sub-step: 6
Error: `HOLISTIC_VERDICT = FAIL` (5 failures) — routed to Failure Path per Step 8 routing.

All three sub-plans verified PASS in isolation; every gap is at a cross-sub-plan seam:

1. **Ship close never regenerates the board.** `.bkit/workflows/bkit-ship.md` has zero `bkit_roadmap_fold` call sites (design/plan/build/debug and `/bkit-roadmap` each have them). Sub-plan 1 handed the ship regenerate to sub-plans 2/3; 2 delivered the Step 10 leaf and cadence, 3 delivered the utility, and nobody delivered the regenerate. The `SHIPPED` row lands and the verdict greens, but the FID stays under Build/Debug on the board until an unrelated FID's close runs a fold. Breaks master SC#1 for ship.
2. **`### Ship` (in flight) is unpopulatable** and leaks plan-internal text into the consumer's `docs/roadmap.md` (`bkit-roadmap-fold.sh:180`) — the six-state ladder has no in-flight-ship state.
3. **`/bkit-roadmap` drops `ROADMAP_SCAN_COVERAGE`** — the `counterSource: "shell-bus"` decision put the derivation in the caller's shell, and only `bkit-ship.md` implements it.
4. **`.bkit/.roadmap-refresh-on-demand.md`** is documented as gitignored but is not (`git check-ignore` exits 1); its two sibling scratch paths were added to `.gitignore` + template.
5. **Committed `docs/roadmap.md` is stale** — 4-column, no Ship section, while the shipped fold renders 5 columns with one.

Seams that hold: one fold signature/arg order across all five callers, one status ladder, matching marker strings, matching `ROADMAP_SCAN_COVERAGE` producer/consumer format, terminal-aware `SHIPPED`→`bkit:merged` with `DEBUGGED` correctly excluded, all four STRAY allowlists widened, complete `completed.md` removal.

Gates are green: 2780 tests, bats 189/189, typecheck, `check:dist`, `slop:delta` net 0, `bkit check` 0 writes, `lint:prose` (1 pre-existing warning).

Work is committed on `feat/380-roadmap-analysis-refresh` (not pushed, no PR). Artifact: `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`.

#### 2026-07-30T12:09:21Z — cbartens

## Debug Workflow

### Step 1 — Start Workflow - Mode: NORMAL - Push: LOCAL - Attempt: 1

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

#### 2026-07-30T12:10:39Z — cbartens

### Workflow Failure

Step: 2 — Worktree Setup; Sub-step: 3
Error: Rebase of `feat/380-roadmap-analysis-refresh` onto `origin/dev` (33 commits) hit conflicts in more than `pnpm-lock.yaml`, so Step 2 wrote the `.rebase-failed` sentinel and routed to the Failure Path. No tests ran; no diagnosis was produced.
Stderr:

```
Rebasing (10/33)
Auto-merging .bkit/src/bkit-manifest.test.ts
CONFLICT (content): Merge conflict in .bkit/src/bkit-manifest.test.ts
Auto-merging .bkit/workflows.md
CONFLICT (content): Merge conflict in .bkit/workflows.md
CONFLICT (modify/delete): docs/completed.md deleted in HEAD and modified in refs/rewritten/onto.
  Version refs/rewritten/onto of docs/completed.md left in tree.
Recorded preimage for '.bkit/src/bkit-manifest.test.ts'
Recorded preimage for '.bkit/workflows.md'
Could not apply 2c7363b0... onto # Merge remote-tracking branch 'origin/dev' into feat/380-roadmap-analysis-refresh
Rebase conflict
```

Rebase aborted; branch left at its pre-rebase HEAD (`9ebd3361`). Lock released.

#### 2026-07-30T12:20:46Z — cbartens

### Workflow Handover

[debug-handover.md](https://github.com/cbartens/bkit/blob/feat/380-roadmap-analysis-refresh/docs/plans/202607/logs/380-roadmap-analysis-refresh/debug-handover.md)

# Debug Abort Handover

## The Short Version

The automated "roadmap board" feature (#380) is code-complete and mostly working, but the last checkpoint found 5 small gaps where different parts of the feature don't quite line up with each other. Before anyone could look at those gaps, today's automated attempt to sync the work branch with the team's shared branch hit a scary-looking but routine conflict (3 files edited on both sides) and stopped itself rather than guess — nothing is broken or lost, it just needs a person (or the next automated run) to say which side wins for each of the 3 files, then go fix the 5 gaps.

## What's Actually Happening

**Symptom:** Debug Step 2 (Worktree Setup) aborted with a `.rebase-failed` sentinel; the workflow routed to the Failure Path before any test or diagnosis ran.

**Trigger:** The feature branch (`feat/380-roadmap-analysis-refresh`) is 31 commits ahead of the merge-base (`b0d5b150`) — genuinely #380's own work — and 7 commits behind `origin/dev` (33 commits replayed during the rebase attempt, since a rebase replays ahead-commits on top of the new base, not just the raw behind-count). Both figures are real; this is expected churn on a long-lived branch, not a bug, and not the "stale worktree base" corruption case (ruled out — see Persistent Errors § 3).

**Proximate cause:** `git rebase origin/dev` hit content/modify-delete conflicts beyond the routine `pnpm-lock.yaml` case the workflow auto-resolves, in 3 files:

- `.bkit/src/bkit-manifest.test.ts` — content conflict (both sides edited the same lines)
- `.bkit/workflows.md` — content conflict (both sides edited the same lines)
- `docs/completed.md` — modify/delete: the feature branch DELETED this file (via #380's own migration to `docs/roadmap.jsonl`, a load-bearing part of the design), while `dev` MODIFIED it (some other change landed on `docs/completed.md` after this branch forked, before #380's own migration removed it there too, presumably via a later ship).

**Root cause (design fragility, not a defect):** None — this is the normal shape of a long-running branch (31 commits, spanning multiple sub-plans and several days) rebasing onto a shared branch that has also moved. The workflow's automated conflict-resolution only covers the single known-safe case (`pnpm-lock.yaml`); anything else is intentionally routed to a human/next-attempt decision rather than guessed.

**Contributing factors:** `docs/completed.md`'s modify/delete conflict is a direct consequence of #380's own scope — it is the file this feature deletes as part of migrating to `docs/roadmap.jsonl`. If `dev` shipped an unrelated `docs/completed.md` edit (or another feature's own migration-adjacent touch) between when this branch forked and now, that edit needs to be reconciled against the deletion, not blindly discarded.

The rebase was aborted cleanly; the branch sits at its pre-rebase HEAD `9ebd3361` — no commits were lost, nothing was force-pushed, working tree is clean at that point.

## Rot Signals

None. No diagnose attempt ran this cycle (aborted at Worktree Setup, before Step 3), so no rot-signal extraction was possible. `.agents/docs.md` and `docs/knowledge.jsonl` were consulted for handover-writing only; no rot signal was raised against them.

## Out-of-Scope Recommendations

None. No diagnose attempt ran this cycle, so none were produced.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| n/a (Debug Step 2, DEBUG_ATTEMPT 1) | Worktree Setup rebased `feat/380-roadmap-analysis-refresh` (31 commits ahead) onto `origin/dev` (33 commits replayed) to pick up shared-branch changes before running tests/diagnosis. | Conflicts beyond the auto-resolved `pnpm-lock.yaml` case appeared in 3 files (2 content, 1 modify/delete) — the workflow does not attempt to resolve these itself and correctly routed to the Failure Path. No tests ran, no `debug-diagnose` attempt was made. |

The unresolved **build** failure this debug run was meant to address (from the prior `build` workflow, `build-plan-verify-holistic`, attempt 1, `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`) is a separate, later concern — see Persistent Errors below. It was never reached this cycle.

## Verified Resolutions (DO NOT ROLL BACK)

None from this cycle — no remediation was attempted. Everything landed by the prior `build` workflow (all 3 sub-plans PASS per their own verify logs: `build-plan-verify-1-4.md`, `-2-4.md`, `-3-3.md`) remains as committed on the branch at `9ebd3361`; do not revert any of that work while resolving the rebase.

## Persistent Errors

**1. Rebase conflict (this cycle's abort cause) — NOT YET RESOLVED:**

- `.bkit/src/bkit-manifest.test.ts` — content conflict.
- `.bkit/workflows.md` — content conflict.
- `docs/completed.md` — modify/delete (deleted on `feat/380-roadmap-analysis-refresh`, modified on `origin/dev`).
- Event sequence: `git fetch origin dev` → `git rebase origin/dev` (auto-resolve `pnpm-lock.yaml` only) → conflict on the 3 files above → `git rebase --abort` → `.rebase-failed` sentinel written → workflow routed to Failure Path. Branch HEAD is unmoved at `9ebd3361`; no force-push occurred.

**2. `build-plan-verify-holistic` FAIL (5 integration gaps) — carried over, NOT YET DIAGNOSED this cycle:**

Full detail in `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`. Summary of the 5 gaps (all cross-sub-plan, none catchable by a per-sub-plan verify pass):

1. `bkit-ship.md` never calls `bkit_roadmap_fold` — the board still shows a shipped FID under Build/Debug until some unrelated FID's design/plan/build/debug close happens to regenerate it. Sub-plan 1 explicitly deferred this to sub-plans 2/3; neither picked it up.
2. `bkit-roadmap-fold.sh:180-181` renders a literal `### Ship _(in flight — populated by ship-close wiring, sub-plans 2/3)_` plus hardcoded `_(none)_` into every consumer's `docs/roadmap.md` — bkit-internal sub-plan numbering leaking into shipped surface, and the six-state ladder has no in-flight-ship state to ever populate that section.
3. `/bkit-roadmap` (`bkit-roadmap.md`) never appends a `ROADMAP_SCAN_COVERAGE` counter row — the `shell-bus` derivation decision was implemented in `bkit-ship.md` only, not the on-demand path.
4. `.bkit/.roadmap-refresh-on-demand.md` is called "gitignored" in the shipped prose but is absent from both `.gitignore` and `.bkit/templates/gitignore` (unlike its two sibling `#380` scratch paths) — a stray report can get swept into a build/debug `git add -A` close commit.
5. Committed `docs/roadmap.md` (4-column, no `### Ship` section) does not match the current `bkit-roadmap-fold.sh` output (5-column, with `### Ship`) — a stale Task 15 dogfood artifact.

Gate suite at that verify pass was fully green (`pnpm test`, `pnpm test:bats`, `pnpm typecheck`, `pnpm check:dist`, `pnpm slop:delta`, `pnpm bkit check`, `pnpm lint:prose`, `pnpm format:check` — see the log for exact output). The 5 gaps are integration-only defects, not implementation breakage.

**3. Large Diff Guard data (confirmed by the coordinator; this session had no shell/Bash tool of its own):**

Branch state: HEAD = `9ebd3361` (unmoved, as assumed above). Working tree has exactly 5 entries, all expected from this handover's own writes: modified `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl`, plus untracked `debug-handover.md`. Merge-base with `origin/dev` = `b0d5b150`. Full `git diff origin/dev..HEAD` = 20835 lines — per-file budget mode applies. Top 20 files by lines changed (`--numstat`, added+deleted):

<!-- prettier-ignore -->
| Lines | File |
| --- | --- |
| 1757 | `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-input.md` |
| 1577 | `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-input.md` |
| 753 | `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-input.md` |
| 641 | `.bkit/src/bkit-cloud-ctx-step.integration.test.ts` |
| 632 | `.github/workflows/bkit-cloud.yml` |
| 632 | `.bkit/templates/.github/workflows/bkit-cloud.yml` |
| 486 | `.bkit/src/bkit-telemetry-migrate.ts` |
| 427 | `dist/bkit-telemetry-migrate.js` |
| 314 | `.bkit/src/bkit-roadmap-sync.integration.test.ts` |
| 264 | `.bkit/version` |
| 264 | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| 258 | `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` |
| 229 | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| 205 | `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` |
| 205 | `.bkit/scripts/bkit-roadmap-fold.sh` |
| 200 | `.bkit/workflows/bkit-ship.md` |
| 199 | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |
| 190 | `docs/completed.md` |
| 186 | `.opencode/commands/bkit-ship.md` |
| 186 | `.cursor/commands/bkit-ship.md` |

**Verified: this is an ordinary behind-by-7 branch, NOT the "stale `origin/dev` ref" corruption case.** Measured directly: the branch is 31 commits ahead of the merge-base AND 7 commits behind `origin/dev`; both figures are real, and the 31 genuinely are #380's own work. `git diff b0d5b150..HEAD --shortstat` (merge-base baseline — #380's real change) = **123 files changed, 7968 insertions(+), 454 deletions(-)**. `git diff origin/dev..HEAD --shortstat` = **187 files changed, 8594 insertions(+), 8330 deletions(-)**. The `363-widen-bkit-cloud-trigger` artifacts (`ship-input.md`, `build-input.md`) do show as pure deletions in the `origin/dev..HEAD` diff, but the reason is benign: those files exist on `origin/dev` (landed via 7 commits this branch hasn't rebased in yet) and simply aren't on this branch, because the branch is behind, not because #380 deletes them or was cut from a stale ref. None of the 7 dev-only commits (`702426ae`, `fe289e67`, `fbd46ad0`, `a62dc54d`, `b8bf1bfd`, `ded52461`, `a924c9a4`) is an ancestor of HEAD. **Consequence for anyone sizing #380: `origin/dev..HEAD` overcounts by roughly 2.5x (20835 vs. the real 8422 merge-base lines) because it also carries the diff of everything dev gained in those 7 commits.** The honest baseline for reviewing #380 is `git diff b0d5b150..HEAD` (the merge-base), or `origin/dev..HEAD` re-taken only AFTER the rebase actually lands. The Step 2 rebase already attempted is exactly the correct fix for this — it must be completed, not worked around.

Dev-side history of the 3 conflicting files since merge-base `b0d5b150` (each has exactly one dev-side commit, all inside the 7-commit behind range):

<!-- prettier-ignore -->
| File | Dev commit | Subject |
| --- | --- | --- |
| `.bkit/workflows.md` | `fbd46ad0` | fix(363-widen-bkit-cloud-trigger): emit the auto-route marker; close challenge F1-F11 (#407) |
| `.bkit/src/bkit-manifest.test.ts` | `a62dc54d` | fix(lint-prose): stop the prose gate silently self-disabling in worktrees |
| `docs/completed.md` | `fe289e67` | docs(363-widen-bkit-cloud-trigger): ship DONE bkit [skip ci] |

This resolves the open question from the earlier draft of this section: `docs/completed.md`'s dev-side edit is FID `363`'s ship-DONE completion row (190 lines changed) — not an unrelated migration touch. See the sharpened resolution rule below; carrying that row forward as a `docs/roadmap.jsonl` entry before accepting the deletion is now a **required** step, not merely something to check.

## Recommended Next Steps

**Option A — Resolve the 3 rebase conflicts by hand, then re-run debug (recommended).**
✅ FIXES: unblocks Debug Step 2 so tests + diagnosis of the 5 holistic gaps can finally run.
❌ DOES NOT FIX: the 5 holistic-verify integration gaps themselves — those still need a real `debug-diagnose` + `debug-failure-remediate` pass after the rebase lands.
⚠️ COST: ~15-30 minutes of careful manual conflict resolution (2 content conflicts need line-level review of both sides; the `docs/completed.md` modify/delete needs a judgment call — see resolution rule below); low risk since nothing is force-pushed until resolution is verified.

**Option B — Skip the rebase for this debug cycle (proceed against the branch's current base) and defer sync to ship.**
✅ FIXES: nothing blocks Debug Step 3+ immediately; the 5 holistic gaps could be diagnosed sooner.
❌ DOES NOT FIX: `origin/dev` and the feature branch keep diverging, so the eventual ship-time integration/rebase gets larger and riskier the longer this is deferred; also whatever `dev` changed in `.bkit/workflows.md` / `bkit-manifest.test.ts` / `docs/completed.md` stays un-integrated into this branch's own gap-fixing work, which is a plausible source of new conflicts later.
⚠️ COST: requires whatever mechanism this workflow has (if any) to explicitly opt out of the mandatory rebase step — may not be a supported path at all; treat as a fallback only if Option A is blocked.

**Option C — Re-run Debug Step 2 unattended and let the workflow retry the rebase.**
✅ FIXES: nothing — the conflict is deterministic (same 3 files, same content) and will reproduce identically on a bare retry with no `origin/dev` movement in between.
❌ DOES NOT FIX: anything; wastes a debug attempt.
⚠️ COST: burns `DEBUG_ATTEMPT` budget for zero progress; only sensible if `origin/dev` has since moved further in a way that might resolve the conflict (unlikely for a modify/delete).

## Recommended Path

**Option A.** Resolve the 3 conflicts by hand using the repo's own doctrine (below), then let debug proceed from Step 2. This is the only option that makes forward progress on both the rebase AND the 5 real bugs waiting behind it, and the conflict set is small (3 files) and well-understood — none of them are surprising given #380's own scope (it deletes `docs/completed.md`) and the repo's shared-doctrine files (`.bkit/workflows.md`) are exactly the kind of file the repo's own conflict-resolution rule already covers.

**Per-file resolution rule** (per `.agents/rules.md` and repo doctrine — take `dev` for shared doctrine files under `.bkit/workflows`/`.bkit/prompts`/`.agents/rules.md`; take the feature branch for its own code and plan artifacts):

- **`.bkit/workflows.md`** — shared doctrine file under `.bkit/workflows`. Confirmed: dev's side is `fbd46ad0` "fix(363-widen-bkit-cloud-trigger): emit the auto-route marker; close challenge F1-F11 (#407)" — this is exactly the kind of shared-doctrine edit the carve-out means to preserve, and it must survive. But this file is also one #380 itself edits (per the plan's own Sub-Plan 1/2/3 task lists — the roadmap-status wiring, `bkit_roadmap_fold` call sites, Telemetry Ledgers row for `docs/roadmap.jsonl`). This is NOT a pure "take dev" case — do a real three-way merge: start from `dev`'s side (keeping `fbd46ad0`'s auto-route-marker doctrine intact), then re-apply #380's specific edits on top (`git log --oneline feat/380-roadmap-analysis-refresh -- .bkit/workflows.md` to see exactly what #380 changed) — neither side's edit should be dropped.
- **`.bkit/src/bkit-manifest.test.ts`** — a test file, not itself named in the shared-doctrine carve-out (`.bkit/workflows`/`.bkit/prompts`/`.agents/rules.md`), so it falls under "feature branch for its own code" for #380's own assertions (e.g. `docs/completed.md` removed from the manifest, `docs/roadmap.jsonl` merge-strategy entries) — but dev's side is confirmed as `a62dc54d` "fix(lint-prose): stop the prose gate silently self-disabling in worktrees", a real bug fix unrelated to #380 that must be re-applied, not discarded. Resolution: keep #380's manifest assertions from the feature branch AND re-apply `a62dc54d`'s prose-gate/worktree-detection fix from dev on top — both sides are required, this is an additive merge, not a pick-one.
- **`docs/completed.md`** — modify/delete. Confirmed: dev's side is `fe289e67` "docs(363-widen-bkit-cloud-trigger): ship DONE bkit [skip ci]" — FID `363`'s own ship-DONE completion row (190 lines changed), not incidental churn. #380 deletes this file as part of its migration to `docs/roadmap.jsonl` (Directive 2, sub-plan 1 Tasks 1/2/5, confirmed intact in the plan file). **Required resolution, not optional:** before accepting the deletion, carry FID `363`'s completion forward as a `docs/roadmap.jsonl` row (`kind:"feature"`, `key:"363-widen-bkit-cloud-trigger"` or its minted FID slug, `status:"SHIPPED"`) using `fe289e67`'s diff (`git show fe289e67 -- docs/completed.md`) as the source content, in the same shape the migration's own bootstrap-seed logic produces for other legacy rows (see `.bkit/src/bkit-telemetry-migrate.ts`, and the sibling `380-bootstrap-seed-key-namespace-mismatch...` OPEN deferral in `docs/deferrals.jsonl` for the seed-key convention). Only once that row is appended should `docs/completed.md`'s deletion be accepted for the merge.

This is not a corruption case needing a workaround — the branch is simply 7 commits behind `origin/dev`, and the Step 2 rebase already attempted is exactly the correct fix. Proceed straight to the per-file resolution rules above; no separate stale-base check is needed.

After resolving, verify with a fresh `git status` and `git diff b0d5b150..HEAD --shortstat` (the honest #380-only baseline — do not re-judge change size from `origin/dev..HEAD` until AFTER the rebase lands, since pre-rebase that diff still overcounts by the 7-commits-behind delta) before continuing debug, and let Debug Step 2 finish (push if `PUSH_MODE` requires it) before proceeding to Step 3 (tests) and `debug-diagnose` against the 5 holistic gaps in Persistent Errors.

## Reference Docs

- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` — full workflow history (design DONE, plan DONE, build FAILED at `build-plan-verify-holistic` attempt 1 with 5 failures, this debug run FAILED at Step 2).
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` — the 5 integration gaps this debug cycle exists to fix; not yet reached.
- `docs/plans/202607/380-roadmap-analysis-refresh-plan.md` — master plan index; confirms `docs/completed.md` deletion is intentional #380 scope (Directive 2).
- No `debug-*.md` diagnose artifacts exist for this attempt — none were produced (aborted before Step 3).
- `docs/failures.jsonl` / `docs/deferrals.jsonl` — new rows appended by this handover (see below) recording the rebase-conflict block and the still-open 5 holistic gaps.
- `.agents/rules.md` — source of the shared-doctrine-vs-feature-branch conflict-resolution rule applied above.

#### 2026-07-30T23:53:26Z — cbartens

## Ship Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

#### 2026-07-30T23:54:23Z — cbartens

### Step 2 — Verify PR (Worktree Setup + Regression Guard)

[cbartens/bkit/tree/feat/380-roadmap-analysis-refresh](https://github.com/cbartens/bkit/tree/feat/380-roadmap-analysis-refresh)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/feat/380-roadmap-analysis-refresh/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

#### 2026-07-31T00:00:48Z — cbartens

### Step 5 — Re-validate + Deferred Sweep - Verdict: FAIL

#### 2026-07-31T00:09:02Z — cbartens

### Workflow Handover

[ship-handover.md](https://github.com/cbartens/bkit/blob/feat/380-roadmap-analysis-refresh/docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-handover.md)

# Ship Debug Abort Handover

## The Short Version

Feature #380 ("keep `docs/roadmap.md` always up to date automatically") is built, tested, and green on every mechanical gate — but Ship's own pre-merge completeness check (Step 5) found 5 small places where the finished pieces don't quite fit together, and refused to let the PR merge until a human decides what to do about them. This is NOT a new bug and NOT a build/test failure: it's a deliberate stop-and-check gate doing its job. The underlying code has already survived one full build cycle (4 sub-plan rounds) and a debug cycle that got stuck on an unrelated branch-sync conflict, which a human then resolved by hand to get the PR this far.

## What's Actually Happening

**Symptom:** `bkit-ship` Step 5 (`@bkit-ship-deferred-sweep`, the pre-merge completeness gate) returned `Verdict: FAIL / Failures: 5` on PR #411 and the ship workflow stopped (`workflow-failed` at `2026-07-31T00:00:59Z`, per `status.jsonl` line 31). No CI failure, no rebase failure, no max-retry exhaustion occurred in this ship run — Steps 1–4 (start, worktree setup, regression guard) all passed cleanly on the first attempt.

**Trigger:** The deferred-sweep gate diffs "what was designed/planned" against "what the PR actually delivers" and found 5 unresolved gaps that were already known before ship started — they are the same 5 findings the prior `build` workflow's holistic verify pass caught (`build-plan-verify-holistic.md`, `Verdict: FAIL / Failures: 5`, 2026-07-29), carried through an aborted `debug` attempt, and re-confirmed as still-present against the current PR HEAD.

**Proximate cause:** Three of the five are handoff drops between the plan's 3 sub-plans (a sub-plan explicitly deferred a piece of work to "sub-plans 2/3" and neither of those actually picked it up); the other two are consistency/hygiene defects on the same seam (a stale generated artifact, an undeclared gitignore entry). None is a logic bug in delivered code — the full gate suite (`pnpm test`, `test:bats`, `typecheck`, `check:dist`, `slop:delta`, `bkit check`, `lint:prose`, `format:check`) was green at both the build holistic-verify pass and this ship deferred-sweep.

**Root cause (design fragility, not a defect):** The plan split #380 into 3 sub-plans and explicitly handed the ship-close wiring ("the `roadmap-status` regenerate at ship, the analysis Step 10 wiring, and the cadence step") from sub-plan 1 to "sub-plans 2/3" as a cross-cutting commitment in prose, rather than as a task on either sub-plan's own runbook. No per-sub-plan verify pass (11 of them ran, all green) could catch this — a prose handoff between plan documents isn't visible to a scope that only looks at one sub-plan's own diff. This is a process/plan-decomposition fragility, not a coding mistake.

**Contributing factors:** This PR already carries real history that should NOT be mistaken for fresh flailing:

1. The original `build` workflow needed 2 remediation cycles across 3 sub-plans before its own per-sub-plan verifies went green, then failed its holistic (cross-sub-plan) verify — see Attempt History.
2. The subsequent `debug` workflow's _first_ attempt never even reached diagnosis: it aborted at Worktree Setup because rebasing the 31-commits-ahead feature branch onto `origin/dev` (7 commits behind) hit 3 real conflicts (2 content, 1 modify/delete on `docs/completed.md`, which #380 itself deletes as part of its own migration). That abort produced `debug-handover.md`.
3. A human then resolved those 3 conflicts by hand (commits `7385085c`, `47472bf1`, `2b9b0a67`, all after the debug abort) and pushed the PR to where it now sits: rebased, green, mergeable — but the 5 holistic gaps from step 1 were never diagnosed or fixed, because the debug cycle that was supposed to reach them got consumed entirely by the rebase.

So: **this ship abort is the first time anyone has actually reached the 5 real gaps with the branch in a clean, rebased state.** They are old, known, well-documented findings — not a new discovery.

## Rot Signals

None. No `ship-failure-diagnose-*.md` or `ship-failure-remediate-*-log.md` artifacts exist for this ship run — the deferred-sweep gate stops the workflow directly, before any diagnose/remediate subagent runs, so no rot-signal extraction was possible this cycle.

## Out-of-Scope Recommendations

None produced this cycle (no diagnose attempt ran). For reference, `ship-deferred-sweep.md` § Exempt lists 9 previously-declared out-of-scope items (deferred to #260, #80, or explicitly rejected) that are NOT part of the 5 blocking gaps below — see that file if triaging scope.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed / current state |
| --- | --- | --- |
| `build` sub-plan 1, attempts 1–4 | Execute → verify → gaps-remediate loop (STANDARD → PIVOT → FINAL strategies) | Reached PASS at attempt 4 (2026-07-29 09:16) after 2 remediation passes |
| `build` sub-plan 2, attempts 1–4 | Same loop | Reached PASS at attempt 4 (2026-07-29 09:50) after 2 remediation passes |
| `build` sub-plan 3, attempts 1–3 | Same loop | Reached PASS at attempt 3 (2026-07-29 12:02) after 1 remediation pass |
| `build-plan-verify-holistic`, attempt 1 | Cross-sub-plan integration verify against the full feature diff | **FAIL, 5 failures** — the same 5 gaps below; `build` workflow terminated (`workflow-failed`, 2026-07-29 12:15) |
| `debug`, attempt 1 (Step 2 Worktree Setup) | Rebase `feat/380-roadmap-analysis-refresh` onto `origin/dev` before running tests/diagnosis | **Aborted before any diagnosis** — 3 real conflicts beyond the auto-resolved `pnpm-lock.yaml` case (`debug-handover.md`); `debug` workflow terminated (`workflow-failed`, 2026-07-30 12:10) |
| *(human, out-of-workflow)* | Manually resolved the 3 rebase conflicts and pushed | Branch is now clean, rebased, and mergeable — but the 5 gaps below were never touched |
| `ship`, this run — Steps 1–4 | Start / worktree setup / regression guard | All PASS |
| `ship`, this run — Step 5 (`@bkit-ship-deferred-sweep`) | Pre-merge completeness sweep of the full PR against design/plan intent | **FAIL, 5 failures** — the same 5 gaps, re-verified against current HEAD, still unfixed. Ship workflow stopped here. |

## Verified Resolutions (DO NOT ROLL BACK)

Everything landed by the `build` workflow (all 3 sub-plans, verified PASS individually) and everything the human's manual rebase-conflict resolution preserved remains correct and should NOT be reverted:

- `kind:"feature"` telemetry codec + `docs/roadmap.jsonl` append-only ledger (51 rows), `merge=union` `.gitattributes` entries.
- `bkit.roadmap.buildCycles` / `stalenessDays` manifest keys.
- `bkit telemetry migrate` bootstrap seed + install advisory + full migration from `docs/completed.md`.
- `bkit-roadmap-fold.sh` projection (mechanical status board) + bootstrap/self-heal + marker-pair invariant — green in both unit and bats coverage.
- Ship writer / verdict reader swap from `docs/completed.md` presence-check to `docs/roadmap.jsonl` `status=="SHIPPED"` check; `docs/completed.md` fully removed (file, template, `.bkit/version` hash, prose references).
- Design/plan/build/debug close-step hooks (mechanical board regenerate on every close except ship — see Blocking 1) + widened STRAY allowlists + tracker enrichment.
- `@bkit-roadmap-refresh` opus leaf (analysis tier) + its wiring as ship Step 10's third parallel subagent.
- Cadence counter (`bkit-roadmap-cadence.sh`, distinct `BUILT` FIDs since last fire) + reverse tracker sync (settled-drift-guarded, MCP-only) + drift check (`live feat/* with no ledger row`).
- The human's 3 rebase-conflict resolutions: `.bkit/workflows.md` (re-applied #380's edits on top of dev's `fbd46ad0` auto-route-marker fix), `.bkit/src/bkit-manifest.test.ts` (kept #380's assertions + dev's `a62dc54d` prose-gate fix), `docs/completed.md` deletion (accepted, with FID #363's completion row from `fe289e67` carried forward into `docs/roadmap.jsonl` first).

Full gate suite (`pnpm test` — 2780 passed; `test:bats`; `typecheck`; `check:dist`; `slop:delta` — net 0; `bkit check` — 0 drift; `lint:prose`; `format:check`) is green as of the ship deferred-sweep's own re-verification.

## Persistent Errors

**The 5 blocking gaps (unchanged since `build-plan-verify-holistic.md`, attempt 1, 2026-07-29; re-confirmed by `ship-deferred-sweep.md` against current PR #411 HEAD):**

1. **Ship close never regenerates the roadmap-status board.** `.bkit/workflows/bkit-ship.md` has zero `bkit_roadmap_fold` call sites (design/plan/build/debug and the `/bkit-roadmap` utility all call it; ship does not). Sub-plan 1 explicitly deferred "the `roadmap-status` regenerate at ship" to sub-plans 2/3; neither picked it up. Effect: at ship, the `SHIPPED` row is appended and the verdict greens off it, but the board keeps showing the shipped FID under Build/Debug until some unrelated FID's close happens to regenerate it. Breaks Success Criterion #1 for the ship close specifically.
2. **`### Ship` (in flight) section is a permanently-empty placeholder leaking bkit-internal text.** `.bkit/scripts/bkit-roadmap-fold.sh:180` (and its template copy) emit the literal `### Ship _(in flight — populated by ship-close wiring, sub-plans 2/3)_` followed by hardcoded `_(none)_` into every consumer's `docs/roadmap.md`. Two problems in one line: bkit's internal sub-plan numbering ships as consumer-facing text, and the six-state status ladder has no in-flight-ship state, so no ledger row can ever populate that section as built.
3. **`/bkit-roadmap` (on-demand utility) drops the scan-coverage counter.** The `shell-bus` counter-derivation decision (caller's shell greps the leaf's report and appends a `ROADMAP_SCAN_COVERAGE` row) was implemented in `bkit-ship.md` only; `bkit-roadmap.md` reuses the same analysis leaf but has no shell-side derivation or `stats.jsonl` append, so on-demand refreshes record no coverage telemetry.
4. **Undeclared scratch path, false "gitignored" claim.** `.bkit/workflows/bkit-roadmap.md:39` tells the leaf to write `.bkit/.roadmap-refresh-on-demand.md` and describes it as "(gitignored, not committed)" — it is not, in either `.gitignore` or `.bkit/templates/gitignore` (unlike its two sibling `#380` scratch paths). Because build/debug closes stage with `git add -A`, a stray on-demand report can get swept into a close commit.
5. **Committed dogfood board is stale vs the shipped fold.** The committed `docs/roadmap.md` renders 4 columns and no `### Ship` section; the current `bkit-roadmap-fold.sh` renders 5 columns (matching the plan's Data Schema contract) plus `### Ship`. It was generated by a pre-remediation version of the script and never re-folded — self-heals on the next close, but is currently the feature's only end-to-end evidence, and it's wrong.

None of the five appears in `docs/deferrals.jsonl`, any plan Out-of-Scope table, the design's non-goals, or a phase summary — they are logged only as a bug (`docs/failures.jsonl` key `380-holistic-verify-5-cross-sub-plan-integration-gaps`, `status: OPEN`), which confers no exemption. All five are therefore unplanned gaps that must be either fixed or explicitly deferred with an owner before this PR can re-attempt ship.

**Resolved, do not re-investigate:** the debug-attempt-1 rebase conflict (3 files: `.bkit/workflows.md`, `.bkit/src/bkit-manifest.test.ts`, `docs/completed.md`) is fully resolved by the human's manual continuation; branch is clean and rebased. The stale `docs/deferrals.jsonl` row for that abort (`380-debug-attempt-1-aborted-rebase-conflicts-before-diagnosis`) is closed as part of writing this handover.

## Recommended Next Steps

**Option A — Route back to `bkit-debug` (or a fresh `bkit-build` gaps-remediate pass) to close all 5 gaps, then re-run `bkit-ship`. (Recommended.)**
✅ FIXES: all 5 gaps properly, with the design's own success criteria fully satisfied.
❌ DOES NOT FIX: nothing outstanding — this is the complete fix.
⚠️ COST: Per `ship-deferred-sweep.md` § Handover Notes, gaps 1–4 are small, well-scoped edits (add one `bkit_roadmap_fold` call site to ship's close path; remove or properly implement the `### Ship` section; port ~25 lines of shell-bus counter derivation into `bkit-roadmap.md`; add one `.gitignore` line + template mirror); gap 5 is a re-fold + commit, cheapest of the five and should be done last (after gap 2 is decided, so the artifact matches the final renderer). Estimated 1–2 hours of focused work, low risk — the gaps are additive/isolated, not architecture-level.

**Option B — Defer the gaps explicitly (declared `docs/deferrals.jsonl` rows + plan Out-of-Scope updates with owners) and override the sweep to ship as-is.**
✅ FIXES: unblocks merge immediately.
❌ DOES NOT FIX: any of the 5 gaps — the board will visibly misbehave in production (ship closes won't regenerate the status section; consumers see a bkit-internal placeholder string in their `docs/roadmap.md`; on-demand refreshes silently lose coverage telemetry) until a later fast-follow closes them.
⚠️ COST: Requires deliberately untick-ing the plan checkboxes that currently assert behaviour that cannot occur as built (sub-plan 2 Concrete Example step 4, sub-plan 3 Manual Verification step 4) — a paper-trail cost, not a code cost. Only sensible if there's schedule pressure to ship the mechanical/analysis tiers now and gap 2 in particular (shipping bkit's internal sub-plan numbering to every consumer) is judged tolerable short-term.

**Option C — Fix only the highest-severity gap (1: ship-close fold) and defer the rest.**
✅ FIXES: the one gap that breaks a Success Criterion outright (SC#1 for the ship close) and is also a prerequisite for gap 5's re-fold being meaningful long-term.
❌ DOES NOT FIX: gaps 2–4 (placeholder leak to consumers, missing on-demand coverage counter, undeclared scratch path) — all still ship as-is.
⚠️ COST: Smallest targeted fix, but leaves the consumer-visible `### Ship` placeholder text (gap 2) in production, which is arguably worse optics than gap 1 alone; would still need explicit deferral rows for gaps 2–4.

## Recommended Path

**Option A.** All 5 gaps are small, additive, well-diagnosed fixes with an exact remediation recipe already written in `ship-deferred-sweep.md` § Handover Notes (reproduced under Persistent Errors above) — there is no design ambiguity left to resolve, only implementation. Given the PR has already survived a full build cycle, a rebase-conflict debug abort, and a manual human rescue to get this far, the lowest-risk path to actually shipping a fully-correct feature is one more focused pass (likely `bkit-build-plan-gaps-remediate`-shaped, or a fresh `bkit-debug` cycle now that the branch is clean) rather than shipping known-incomplete behavior and hoping the deferred fast-follow happens.

## Reference Docs

- `docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-deferred-sweep.md` — the FAIL verdict this handover summarizes; primary source for all 5 gaps and their remediation recipes.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` — where the 5 gaps were first found (2026-07-29), including the full gate-suite pass evidence.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/debug-handover.md` — the aborted debug attempt (rebase conflicts), now fully resolved; explains why the gaps reached ship undiagnosed.
- `docs/plans/202607/380-roadmap-analysis-refresh-plan.md` (+ `-plan-1.md`/`-plan-2.md`/`-plan-3.md`) — master plan + 3 sub-plans; sub-plan 1 § `[MODIFY] .bkit/workflows/bkit-ship.md` is where the ship-close fold was deferred to "sub-plans 2/3" and never picked up.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` — full workflow history: design DONE, plan DONE, build FAILED at holistic verify (5 failures), debug FAILED at Step 2, this ship run FAILED at Step 5 (deferred sweep, 5 failures).
- `docs/failures.jsonl` key `380-holistic-verify-5-cross-sub-plan-integration-gaps` (`ts` 1785401000001, `status: OPEN`) — the bug-log record of the 5 gaps.
- `docs/deferrals.jsonl` key `380-debug-attempt-1-aborted-rebase-conflicts-before-diagnosis` — closed by this handover (rebase resolved by the human continuation); do not let closing it be mistaken for closing the 5 gaps themselves, which remain open.
- `docs/deferrals.jsonl` key `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys` (OPEN, unrelated minor cosmetic issue, not blocking) — legacy migrated rows render synthesised `completed-…-<hash>` keys instead of FIDs in the `## Shipped` column; noted by the sweep as a corollary, not one of the 5 blockers.

#### 2026-07-31T00:09:24Z — cbartens

### Workflow Failure

Step: 5 — Re-validate + Deferred Sweep; Sub-step: 7
Error: `@bkit-ship-deferred-sweep` returned Verdict: FAIL / Failures: 5 — pre-merge completeness gate found 5 unresolved cross-sub-plan integration gaps (see ship-deferred-sweep.md and the handover comment above). Routed to `@bkit-debug-abort-handover` via `.deferred-blocked` sentinel.
Stderr: (n/a — no shell tool failure; subagent-reported verdict)

#### 2026-07-31T00:27:34Z — cbartens

### Ship blockers resolved — all 5 gaps closed

Commit `121dcc41` on `feat/380-roadmap-analysis-refresh` closes every blocking gap the deferred-sweep gate found. Each was re-verified empirically against the canonical source **and** all three rendered host mirrors, not just assumed from the edit.

| #   | Gap                                                                                        | Fix                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Ship close never regenerated the board                                                     | `bkit-ship.md` Step 10 item 5 now sources `bkit-roadmap-fold.sh` and calls `bkit_roadmap_fold "$BOOK_ROOT"` **after** the three parallel subagents — so it reads `@bkit-ship-update-docs`' just-written `SHIPPED` row and never races `@bkit-roadmap-refresh` (the two rewrite disjoint marker blocks). No staging added: both roadmap paths were already in `BOOK_PATHS` and ride the single Step 13 commit. |
| 2   | Permanently-empty `### Ship` section leaking bkit-internal sub-plan numbering to consumers | Removed from **both** `bkit-roadmap-fold.sh` copies, kept byte-identical (`sha256` verified). The six-state ladder has no in-flight-ship state, so nothing could ever have populated it.                                                                                                                                                                                                                      |
| 3   | `/bkit-roadmap` dropped `ROADMAP_SCAN_COVERAGE`                                            | Ported the `shell-bus` derivation from `bkit-ship.md` as `bkit-roadmap.md` item 6. Also made the leaf's report path deterministic — the utility has no `{FID}`/`{YYYYMM}` to resolve a `docs/plans/**` path against, so it was emitting literal-brace paths.                                                                                                                                                  |
| 4   | Scratch path claimed gitignored but wasn't                                                 | Added `.bkit/.roadmap-refresh-on-demand.md` to `.gitignore` and `.bkit/templates/gitignore` beside its two siblings. `git check-ignore` now exits 0.                                                                                                                                                                                                                                                          |
| 5   | Committed dogfood board stale vs renderer                                                  | Re-folded from the 51-row ledger. Verified **byte-identical** to a fresh fold of the shipped script.                                                                                                                                                                                                                                                                                                          |

Also widened the `.bkit/jsonl.md` `workflow`-field enum to document the new `roadmap` utility emitter, so docs match code in the same change. Host mirrors regenerated — `bkit check` reports 0 writes.

**Gates:** `pnpm test` 2908 passed / 87 files · `test:bats` 189 ok, 0 failures · `typecheck` · `check:dist` · `format:check` · `slop:delta` net 0 · `lint:prose` 0 errors · `bkit check` no drift.

**Ledgers:** failure `380-holistic-verify-5-cross-sub-plan-integration-gaps` → `CLOSED`. Two `decision` rows record the scope calls (ship folds with empty `TRACKER_ROWS` rather than widening ship's MCP surface; the utility stamps `workflow: "roadmap"`). One `deferral` records that `docs/roadmap.md` is a generated projection prettier still formats — the durable fix is a `.prettierignore` entry, deliberately **not** taken here because that is quality-gate config and needs explicit sign-off.

CI dispatched against the new head; ship can be re-run once it lands green.

#### 2026-07-31T00:47:08Z — cbartens

### dev integrated — PR #411 green and mergeable

`dev` had moved ahead with `90d70473` (ship close-telemetry staging fix), which edits the same `BOOK_PATHS` line #380 does. Merged dev in at `ea6f17f7` rather than rebasing 38 commits — no history rewrite, no force-push.

**Resolution was a semantic union**, since both changes are wanted:

- dev adds `.bkit/stats.jsonl` to the staging allow-list (close telemetry was written before the path-scoped commit and stranded dirty every ship)
- #380 swaps `docs/completed.md` for `docs/roadmap.jsonl` + `docs/roadmap.md` (the ledger replaces `completed.md` entirely)

The frozen `BOOK_PATHS_ALLOW_LIST` in `bkit-ship-invariants.test.ts` auto-merged into the correct 11-entry union; the workflow's `BOOK_PATHS` string was hand-resolved to match. Host mirrors and `.bkit/version` were regenerated from the merged canonical sources rather than hand-resolved.

**Two things the conflict markers did not surface**, both caught by reading rather than trusting the merge:

1. **Three stale `10-path` prose counts** — in `bkit-ship.md`, `.bkit/workflows.md` (×2) and `docs/testing.md`. They merged _cleanly_, so nothing flagged them, and they would have silently contradicted the 11-path list. Corrected.
2. **A tracked `.deferred-blocked` sentinel.** `docs/plans/*/logs/**/.lock` is gitignored but its siblings `.deferred-blocked` and `.rebase-failed` are not, and they sit inside the `BOOK_PATHS`-staged logs dir — so this run's own Failure Path commit captured one onto `dev`, where the next run's `rm -f` would surface as a spurious deletion in an unrelated close commit. Same defect class as blocking gap 4. Added both to `.gitignore` and the shipped template beside `.lock`, untracked the instance, logged CLOSED as `workflow-run-sentinels-not-gitignored-beside-lock`.

**State:** PR #411 `OPEN` · base `dev` · `MERGEABLE` · head `ea6f17f7` · CI 5/5 green (`scope`, `static`, `unit`, `integration`, `check`). `origin/dev` is an ancestor of the head, so ship takes Path A — no integration step needed.

Ready for `/bkit-ship 380` to be re-run.

#### 2026-07-31T01:12:52Z — cbartens

### Runtime-fencing risk closed — and a correction

**Correction first:** an earlier note here described this as pre-existing rather than introduced by this PR. That was wrong. `git log -S` places the dev-lock mirror block in `aa3e45ed` (sub-plan 1, Task 7), and it has **zero** occurrences on `dev` — it is this PR's own code. Fixed in `ea37e5c8`.

**The defect.** The dev-side roadmap mirror runs `git -C "$REPO_ROOT" checkout dev` / commit / `push origin dev`, guarded only by the dev lock. In adopt mode (`RUNTIME_WORKTREES=false`, `WORKTREE_PATH == REPO_ROOT`) that path _is_ the session's only working tree, so the checkout swaps the branch out from under the in-progress build/debug run, over a tree still holding uncommitted feature work. `CUR_BRANCH` is restored afterwards so blast radius is bounded, but `bkit_close_guard_checkout` — which exists to refuse exactly this — was never consulted.

**Two traps that explain why it was left undone**, both now recorded in-comment:

1. **`bkit_close_guard_checkout` cannot be dropped in verbatim.** It installs its own `EXIT` trap, and bash traps _replace_ rather than chain — it would clobber the `trap 'rm -f "$DEVLOCK"' EXIT` below it and leak the dev lock. Ship Step 9 declines the helper for the same reason and asserts inline; this follows that precedent.
2. **The naive inline fix would have been silently broken.** `RUNTIME_WORKTREES` / `RUNTIME_DEVPUSHES` are set by `bkit_runtime_detect` in an _earlier, separate_ fenced shell invocation and are not in scope in the close block. Testing them there would have compared against unset and disabled the mirror in **every** mode — a worse bug that would have looked like a fix.

**The fix.** An inline fence at the top of the mirror subshell, above the lock acquisition, so adopt mode does not even take the dev lock:

```bash
if [ "$WT" = "$REPO_ROOT" ]; then
  echo "[bkit-roadmap] skipping dev-side roadmap mirror — adopt mode ..." >&2
  exit 0
fi
```

Derived from local facts already assigned in the same block rather than out-of-scope `RUNTIME_*`. Faithful proxy for the double guard because the capability table moves both flags together (`LOCAL`/`GITHUB_ACTION`/`CLOUD_CURSOR` → both `true`; `CLOUD_CLAUDE`/`UNKNOWN` → both `false`). Verified by executing the fence for both modes — adopt skips, mint proceeds. Applied to `bkit-build.md` and its `bkit-debug.md` twin; host mirrors regenerated.

Logged CLOSED as `380-devlock-roadmap-mirror-missing-adopt-mode-fence`.

**State:** PR #411 `MERGEABLE` at `ea37e5c8`; both the `pull_request` and `workflow_dispatch` CI runs at that head are green, 5/5 lanes each. Local gates: 2908 tests / 87 files, 189 bats, typecheck, `check:dist`, `format:check`, `slop:delta` net 0, `lint:prose` 0 errors, `bkit check` 0 drift.

One consistency gap remains open by choice: ship's fold passes empty `TRACKER_ROWS`, so tracker-only FIDs (labelled issues with no ledger row) drop off the board at a ship close until the next design/plan/build/debug close re-enriches. Ledger-backed rows are unaffected. Recorded as `380-ship-close-fold-without-tracker-enrichment`.

#### 2026-07-31T02:57:09Z — cbartens

### What actually appears on `docs/roadmap.md` — and two fixes it surfaced

Answering the question directly, then the fixes it led to.

#### Which issues reach the board

Two sources feed the fold:

**1. Ledger rows (`docs/roadmap.jsonl`)** — a FID gets a row only when a bkit workflow _close_ appends one (`DESIGNED`/`PLANNED`/`BUILT`/`DEBUGGED`/`SHIPPED`). This is the canonical source.

**2. Tracker enrichment (`list_issues`)** — queried as:

```
labels: "bkit:design,bkit:plan,bkit:build,bkit:debug,bkit:ship", state: "open"
```

and kept only where the FID has **no** ledger row:

```
map(select((.key | tid) as $k | ($known | index($k)) == null))
```

So the honest answer to _"what about tracker issues in matching phases never touched by bkit?"_ — **they do not appear at all.** The query filters on `bkit:*` phase labels, and those labels are applied by the workflows themselves (Step 1 of each). An issue bkit has never touched carries no `bkit:*` label, produces no `status`, and is dropped. There is no "infer the phase from tracker state" path.

What enrichment _does_ cover is the gap between the two: issues carrying a `bkit:*` label but no ledger row —

- hand-labelled issues (manual enrolment)
- issues whose workflow set the label but whose close never landed a row — **exactly what happened to #380 itself**, whose build and debug both failed mid-run
- issues labelled before the ledger existed

It also fills `Milestone` / `Blocked-by`; ledger-only rows render those as `—`.

Anything with no `bkit:*` label lives only in the consumer-owned `## Backlog / Ideas` region, which the fold never touches.

#### Fix 1 — ship's close now enriches (reversing an earlier decision)

Both premises behind that decision were wrong, and measurement showed it:

- **Severity.** Recorded as "transient cosmetic". It isn't — the fold is a _full regenerate_, so a ship without enrichment blanks every tracker-only FID. Measured on a fresh-consumer fixture: **4 board rows before the first ship, 1 after**, with Design/Plan/Build/Debug all `_(none)_`. That is this issue's stated purpose failing at the exact moment someone reads the board, worst for a new consumer whose near-empty ledger makes the board almost entirely enrichment.
- **Cost.** Recorded as needing "new tracker marker blocks on the shipped MCP surface". It didn't — `bkit-ship.md` already declared `mcp__github__list_issues` and already had `github`/`linear` marker blocks in Step 10. Two prose lines inside existing blocks, plus pointing `TRACKER_ROWS` at the file.

Ship now joins the row-20 enrichment test loop, which covers all five closes.

#### Fix 2 — the dedup never actually deduped

Testing the enrichment path before enabling it surfaced a live bug. The additive-only guard compared keys across **two namespaces**: ledger keys are FIDs (`412-export-csv`, `TEAM-42-delta`), enrichment maps tracker rows to the raw issue id (`#412`). A raw compare never matched, so the guard never fired. Reproduced — the same issue rendered twice in `### Build`:

```
| 412-export-csv | CSV export | — | — | 1000 |
| #412           | CSV export | — | — | 0    |
```

This has hit **every wired-tracker consumer on every close** since enrichment landed. bkit never saw it because it dogfoods with `githubProject: false` and a `completed.md`-migrated ledger whose synthesised keys don't collide either way. Enabling enrichment at ship without fixing it would have doubled the exposure.

Fixed with a `tid` normaliser in `BKIT_ROADMAP_FOLD` that maps both sides to one tracker identity before the test — strip a leading `#`, lowercase, then take the leading numeric segment (github) or leading alpha-numeric pair (linear), mirroring the ship reverse-sync FID convention. Keys matching neither shape — notably migrated `completed-<slug>-<hash>` rows — pass through unchanged and can never falsely collapse.

Distinct from the OPEN deferral `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys`, which covers bootstrap-seed FIDs vs migrated `completed.md` keys.

#### Verification

Dedup checked on four fixtures (github dup suppressed while a genuine tracker-only row survives, linear dup suppressed, legacy keys intact, empty tracker unaffected). All three tracker modes resolve through the real #202 resolver with zero orphan markers. Both fold copies byte-identical.

Gates: **2910** tests / 87 files (+2 from ship joining the loop), 189 bats, typecheck, `check:dist`, `format:check`, `slop:delta` net 0, `lint:prose` 0 errors, `bkit check` 0 drift.

Ledgers: decision `380-ship-close-fold-without-tracker-enrichment` **reversed** with the reasoning; failure `380-fold-tracker-vs-ledger-key-namespace-duplicates-every-enriched-fid` **CLOSED**.

Commit `9bb06472`; CI running.

#### 2026-08-06T01:25:55Z — cbartens

## Related: #423 — the machine-readable half of this

#423 proposes writing the same judgements this issue produces in prose into the tracker as labels and issue links, so an automated dispatcher can route on them without parsing `docs/roadmap.md`.

Direct overlaps with the scope here:

| This issue produces                                       | #423 writes it as                                                                         |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| "best next step to take"                                  | `bkit:next:design` / `:plan` / `:build`                                                   |
| "prompt suggestions should include model recommendations" | `bkit:model:*`, value set generated from installed hosts                                  |
| "scope aware, group issues together where feasible"       | `bkit:size:*`, anchored on `bkit-plan-complexity-check`'s ≤ 85K tokens / ≤ 12 tasks bound |
| "human and agents always know the best next step"         | `bkit:priority:*` + issue-to-issue ordering links                                         |
| "at every workflow close run new Roadmap update subagent" | the close-step label write                                                                |

Two things from #423 that bear on how this one gets built:

**The ordering in `docs/roadmap.md` should be transferable to the tracker.** bkit already writes dependency links, but only within a single design's workstreams (`bkit-design.md:693-704`) — Linear natively via `blockedBy`, GitHub as a body marker block. Nothing writes ordering across the backlog. If the roadmap doc is going to hold a sequence, that sequence is worth pushing into issue links so it survives outside the file.

**Where the recommendation is decided vs written.** #423's open question 3 recommends the roadmap-refresh subagent _here_ makes the judgement, and each phase workflow's close step _writes_ the label — one brain, one writer. If that's agreed, this issue owns the analysis and #423 owns the label surface, and neither needs to duplicate the other.

Open for either issue to absorb the other; #423 open question 4 leaves the placement decision here.

#### 2026-08-26T08:25:37Z — cbartens

## Three decisions before re-integrating with `dev`

The branch has sat since 2026-07-31 while `dev` moved 55 commits and shipped 4.12.0. Before merging that in, the three open items got settled. Recording them here so the merge commit isn't the first place they appear.

### Correction first

An earlier note framed the three OPEN rows in `docs/deferrals.jsonl` as something the deferred-sweep gate would fail on. That was wrong. Declared deferrals cannot block a merge — `bkit-ship-deferred-sweep.md:34` reads _"`Exempt` and `Lazy` → never block; both resurfaced."_ What failed the ship on 2026-07-31 was the separate **Blocking Deferrals** track: 5 unplanned cross-sub-plan integration gaps, all since closed in `121dcc41`. The three below were never gate blockers. They are being settled because of what they mean for consumers, not because anything is stopping the merge.

### 1. First-bootstrap clobber — fixing it now

`380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` (LOW) — **coming into scope, not shipping as a deferral.**

A consumer who hand-authored `docs/roadmap.md` before adopting this feature has freeform content and no marker blocks. The bootstrap writes markers, a banner and an empty `## Backlog / Ideas`, and the plan never states whether their existing text survives. That is data loss on the one file this whole issue exists to produce, and it brushes against SC#5 — consumer-owned, never overwrite.

It escaped dogfood for a structural reason worth naming: bkit has no `docs/roadmap.md` of its own, so the WS-6 dogfood never exercises the first-bootstrap path at all.

**Decision: pre-existing non-marker content is preserved by wrapping it under `## Backlog / Ideas`, never clobbered.** Plus a `tests/roadmap-fold.bats` row asserting it survives the first fold.

It would also not have survived adjudication. The four `unjustified` tests (`.bkit/jsonl.md:167-172`) all hold — bounded remediation naming specific files, surface inside files this cycle already touched, no external blocker, and no declaration of out-of-scope anywhere except the deferral row itself. Test 4 carries the weight and this is exactly its shape: declared at the moment of avoidance rather than before work started.

### 2. The other two — stamping the missing `reason`

Both stay deferred; both get the field they are missing.

All three rows were written at `bkitVersion: 4.8.0`, before #415 (`1d6fef7c`) made `reason` a required closed enum adjudicated at ship. None carries one. Nothing automated validates the field, so no test fails — but it leaves the ship-time adjudication guessing.

**Decision: same-key append stamping `reason: "scope-declared"` on both.** Each was declared out of scope in the design before work started and each already carries a `references` entry pointing at the design doc, which is what `scope-declared` requires.

- `380-dev-located-roadmap-status-write-for-build-debug-closes` (MEDIUM)
- `380-persisted-frontier-snapshot-event-log-for-260` (LOW)

**One consequence of the MEDIUM one staying deferred, stated plainly:** `dev`'s `docs/roadmap.md` will show a stale phase for any issue sitting in build or debug, until the next design, plan or ship close regenerates the board. Build and debug commit to the feature branch, not `dev`, so their status only reaches `dev` at ship. The tracker's `bkit:*` labels remain the live-phase authority and the board carries a banner saying so. Accepted for this cycle; the row stays OPEN and names the remediation if between-ship accuracy on `dev` later proves load-bearing.

### 3. #423 stays separate

**Decision: #423 runs standalone. It is not folded into this branch.**

The substance of #423's open question 3 is already agreed on both sides — the roadmap-refresh subagent here makes the judgement, each phase workflow's close step writes the label. One brain, one writer. That split holds regardless of which issue builds which half, so it needs no further decision.

Open question 4 — fold or standalone — resolves to standalone for three reasons:

- #423's label families can ship against #214's "Active sequence" prose today. Only the ordering-link half reads better once `docs/roadmap.md` exists, and that is the last of its five suggested pieces.
- Folding it in would add label lifecycles, a `bkit-cloud.yml` job gate and a per-run model-column collapse onto a branch that is already 43 commits deep and 26 days behind `dev`.
- #423 still has a load-bearing unknown its own text flags as **"check this before designing"** — open question 8, whether GitHub's MCP surface exposes issue dependencies at all. If it does not, the body-marker fallback is correct rather than a shortcut, and that answer changes the design.

This issue owns the analysis and `docs/roadmap.md`; #423 owns the tracker label surface.

### What happens next

Merge `dev` into the branch — merge rather than rebase, matching the precedent already set at `ea6f17f7`: 43 commits, most of them workflow-run chores, and no history rewrite or force-push. A dry-run merge reports 44 conflicts, of which 18 are regenerated rather than resolved (15 host mirrors, 2 `dist/`, `.bkit/version`).

Two of the 22 real conflicts need judgement rather than mechanics:

- **All 5 workflow files.** `dev` restructured exactly the close steps this branch hooks into — #438 (one central rule set), #440 (one marker per name), #437 (collapsed gate lanes), #422 (GateGuard), plus #431, #427 and #421. This is a per-hunk union; the usual "take `dev` for `.bkit/workflows`" shortcut does not apply, because the roadmap fold hooks _are_ edits to those steps.
- **`docs/completed.md`, modify/delete.** This branch deletes it, `docs/roadmap.jsonl` having replaced it. `dev` has written to it twice since the merge base — `17435d7b` (GateGuard) and `e9d928a7` (the 4.12.0 release entry). Those two entries get folded into the 51-row ledger before the delete is taken, so a month of history is not dropped on the way past.

#### 2026-08-26T11:00:06Z — cbartens

## Correction to the decisions comment, and what the merge actually found

Two things in the comment above rested on a bad read. Both are corrected here, and neither changes what was built — but one of them means a question was put to the owner that did not need asking.

### There was one open deferral, not three

The earlier count came from scanning `docs/deferrals.jsonl` line by line for `status != CLOSED`. That is not how the ledger reads — an entity's state is the **fold** of its same-`key` rows, last-wins by `ts`. Folded properly:

| Key                                                                 | Real state                                                                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `380-dev-located-roadmap-status-write-for-build-debug-closes`       | **CLOSED** — superseded by design Addendum C; sub-plan 1 Task 7 built the dev-lock roadmap write from build/debug closes             |
| `380-persisted-frontier-snapshot-event-log-for-260`                 | **CLOSED** — superseded by design Addendum 3 § N; `docs/roadmap.jsonl` **is** the persisted event log, and #260 inherits it directly |
| `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` | **OPEN** — the only one                                                                                                              |

**The consequence I asked to have accepted does not exist.** The comment above said the board would show a stale phase for anything sitting in build or debug, and asked for that to be signed off as deferred. It was already built — it is the same dev-lock mirror block that a later fix fenced to mint mode. Nothing needed accepting.

The reason stamps went only where they were actually needed. `380-roadmap-md-generated-but-not-prettier-ignored` was the one row a gate flagged (`bkit-ledger-integrity`, "every entity updated since the field landed carries a reason") and now carries `reason: "needs-decision"` — it was held pending human sign-off on quality-gate config, and is closed. The two superseded-and-built entities were left alone; appending correction rows to settled entities is churn.

### `docs/completed.md` had nothing to migrate

The comment said dev's two commits added entries that needed folding into the 51-row ledger before taking the delete. They did not. Both commits touched only the managed-block header (`v4.10.0` → `v4.12.0`) and two prose rules inside it. Verified before deleting: **23 entry headings on both sides, identical sets**. The delete dropped no history.

### The one open deferral is now closed by doing the work

Preserve-under-Backlog is built. The bootstrap branch in `bkit_roadmap_fold` fired only when `docs/roadmap.md` was **absent**. A consumer who hand-authored one fell through to the marker-repair path — which did keep their text, so this was never the total clobber the row implied, but it left that text above a file with no banner, no analysis block and no `## Backlog / Ideas` region.

Bootstrap now also fires on a file that exists but carries neither marker, writes the full scaffold, and carries the pre-existing content into `## Backlog / Ideas` — the one region bkit never regenerates. A board already carrying either marker is untouched. Both shipped copies of the script updated byte-identically; `tests/roadmap-fold.bats` rows 26 and 27 cover preserve-on-first-bootstrap and no-re-bootstrap-when-markers-present.

Adjudicated `unjustified` on close. All four tests in `.bkit/jsonl.md:167-172` held, and test 4 carried it: the ledger row was the only place the work was ever called out of scope.

### What the merge surfaced that nobody had listed

`dev` landed five doctrine gates while this branch sat, and this branch's surface had never been through any of them. 31 tests failed on the merged tree. All are now green, but two were real runtime defects rather than conformance:

**Nine fenced shell blocks referenced `$VAR` they never assigned.** Each block is a separate Bash call, so those expand to empty at run time — `$BOOK_ROOT/docs/roadmap.jsonl` becomes `/docs/roadmap.jsonl`. The reason some of them hid is worth recording: **an apostrophe inside a shell-block comment opens a single-quote span for the auditor's masker and blanks every real assignment below it.** `# ... this phase's docs/roadmap.jsonl row ...` was enough to make `TRACKER_ROWS=` and `ROADMAP_LINE=` invisible to the gate. Reworded the apostrophes out and made the blocks self-assign.

**The migrate idempotency check could not see the roadmap target.** dev's fresh-consumer early return tests "no legacy `.md` ledgers and no migrated rows", where "migrated rows" meant knowledge and decisions only. A consumer whose only legacy ledger was `completed.md` has both of those empty even after a successful migrate — so they were told "nothing to migrate" both before migrating (stranding the one file that had rows to convert) and after. Widened with `completed.md` and `roadmap.jsonl`.

Also: `docs/roadmap.jsonl` carried `merge=union` but was absent from the rebase resolver's auto-resolvable set, so a conflict there would have refused and routed to the Failure Path. Added, along with `docs/roadmap.md`. That second one is the deliberate divergence — `roadmap.md` is a full regenerate, not append-only, so a union leaves a duplicated board. It is listed anyway because both sides of any rebase have almost certainly re-folded it, making a conflict there the common case: refusing would fail nearly every ship, whereas the duplicate is erased by the very next fold. One self-healing commit beats a halted workflow. The carve-out is documented in the script header beside the existing `friction.jsonl` one.

### State

Merged at `bb981805` — `origin/dev` is now a genuine ancestor, 0 behind / 44 ahead.

One process note: the first attempt recorded as a **single-parent** commit. A `git stash` run mid-merge to inspect ledger history cleared `MERGE_HEAD`, so `git commit` wrote an ordinary commit whose tree happened to be correct. The content was right and the gates were green, but git would have re-conflicted all 44 files on the next integration. Re-recorded via `git commit-tree` with both parents against the byte-identical tree.

Local gates on the final commit: **3673 tests / 105 files**, **214 bats / 0 failures**, `typecheck`, `check:dist`, `format:check`, `lint:prose` 0 errors, `slop:delta` net 0, `bkit check` 0 drift. CI dispatched against the new head.

**#423 stays standalone**, unchanged from the decision above.

#### 2026-08-26T20:32:45Z — cbartens

## Ship run 2 stopped at the gate; all four gaps now fixed on the branch

Short version: the second ship attempt was refused by the pre-merge completeness gate with 4 real findings. I fixed all four, added tests that actually catch them, and committed to `feat/380-roadmap-analysis-refresh` as `594de861`. **That commit is not pushed yet** — the PR still shows the un-fixed code.

### What the gate found, and what it did not

`@bkit-ship-deferred-sweep` returned `Verdict: FAIL / Failures: 4 / Unjustified: 1` at PR head `11a74fd4`. Steps 1–4 (start, worktree setup, regression guard) all passed; every CI check on the PR was green. This was not a test failure or a broken build — it was the gate comparing what the plan promised against what the branch actually delivers.

Worth stating plainly, because it is easy to lose: **all five gaps from the 2026-07-31 sweep are genuinely fixed.** The sweep re-verified each one against the current files rather than trusting the old log. The four findings below are new — one long-standing bug nobody had exercised, and three regressions that the 2026-08-26 reintegration with `dev` reintroduced.

The workflow then ran its Failure Path to completion and hard-stopped: `workflow-failed` recorded at `2026-08-26T20:11:13Z`, bookkeeping committed and pushed to `dev` as `88dfae9c`, lock released, handover written. PR #411 was not merged.

### The four fixes

**1. Design and plan closes were losing their work whenever a PR was involved.** This is the only one that changed behaviour, and it is the reason the roadmap board kept looking stale.

The close path appends the roadmap row, regenerates the board, and commits — then calls `gh pr create` and `gh pr merge`. Those two commands act on the **remote** branch. Nothing pushed in between. So the roadmap commit, _and_ the `close-workflow` commit carrying the `status.jsonl` rows, both sat on the local branch and never entered the PR. Every design or plan close that went through a pull request silently dropped its board update.

This has been there since the original build. Neither the per-sub-plan verifies nor the first sweep caught it, because neither exercised that branch end to end. Build and debug never had the problem — their close already pushes the feature branch.

Fix: one guarded push in each file — `bkit-design.md:974` and `bkit-plan.md:1015`. I placed it **after** the STRAY guard rather than before it, so a close carrying unexpected files still aborts before anything is published. The sweep suggested before; after is strictly safer and the guard's result is identical either way.

**2. `.bkit/version` still claimed ownership of a file this feature deletes.** The `docs/completed.md` entry in `canonicalHashes` survived the reintegration because `dev`'s side of that line won the merge. It would never have healed itself: `bkit install` merges previous hashes forward on every run, and the uninstall safe-delete guard reads that list. One line removed.

**3. The conflict-resolution agent was being told the wrong thing.** `.bkit/prompts/bkit-ship-conflict-resolve.md` still listed `docs/completed.md` as a ledger that can be auto-merged by taking both sides, and named neither roadmap file. So during a rebase conflict the agent would not have known `docs/roadmap.jsonl` and `docs/roadmap.md` are safe to union. The two other copies of that same list (`.bkit/workflows.md:724` and `bkit-rebase-resolve.sh`) were already correct on this branch — only the prompt was missed. Now consistent with them.

**4. A test was pinning the bug in place.** `bkit-book-commit.sh` had gained both roadmap paths but kept `docs/completed.md`, and `BOOK_PATHS_ALLOW_LIST` in `bkit-ship-invariants.test.ts` asserted every entry is present in the script — so the test actively _required_ the script to keep naming a deleted file. Staging itself worked fine, which is why nothing broke visibly. Removed from both script copies (kept byte-identical), and the allow-list now carries `docs/roadmap.md`. `docs/roadmap.jsonl` reaches the pathspec through the `docs/*.jsonl` glob, so I assert that glob rather than the literal path — asserting the path would fail for the wrong reason.

### Tests

Two new assertions, both **verified to fail against the un-fixed tree** before I trusted them:

- `bkit-roadmap-staging.integration.test.ts:111` checks ordering, not just presence: the push must come after the roadmap commit, after the STRAY guard, and before `gh pr create`. A push placed after `gh pr merge` would satisfy a presence check while fixing nothing.
- `bkit-ship-invariants.test.ts:206` fails if `docs/completed.md` reappears anywhere in the staging seam — the script (both copies), the allow-list, or `.bkit/version`. This is the guard against the exact drift that produced findings 2–4: a merge with a branch predating the deletion quietly puts the path back.

### Two things found along the way

**An apostrophe in a shell-block comment can break a detector.** I wrote `bkit-book-commit.sh's` in a comment inside a fenced block in `bkit-ship.md`. The block-locality audit blanks single-quoted spans before looking for assignments, so my stray apostrophe paired with a later one and swallowed a real `TRACKER_ROWS=` assignment between them — two tests failed pointing at a variable that was correctly assigned two lines above its use. Reworded to avoid the apostrophe. Flagging it because the failure message points nowhere near the actual cause.

**Shipped docs cannot cite issue numbers.** My first draft of the rationale in `.bkit/workflows.md` referenced `#380` and `#446`; `bkit-shipped-docs-refs.test.ts` rejects that. Rewritten to describe the reason instead.

### Also done

- Dropped the stale `BOOK_PATHS` prose left behind when `bkit-book-commit.sh` replaced that mechanism — `bkit-ship.md:1198` and four places in `.bkit/workflows.md`'s ship section. Added the rationale for the push fix to `.bkit/workflows.md`, where explanations belong.
- Supplied the missing `reason` on the one OPEN deferral that lacked it (`380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys`), as a same-key append with `reason: "needs-decision"` stating both options. Not adjudicated `unjustified` — the remediation is a choice between two designs, not a bounded edit.
- Regenerated the host mirrors for all four edited source files (12 re-rendered, then 3 more after the apostrophe fix).

### Deliberately left alone

- The stale sub-plan 2 prose about the cadence reusing `.bkit/stats.jsonl` `outcome` rows. The shipped code is correct; only the plan text is wrong, and plan artifacts are historical records.
- `build-plan-verify-holistic.md`'s `Verdict: FAIL / Failures: 5` header. All five are fixed and closed in `docs/failures.jsonl`; the log correctly records what was true when written.
- `BOOK_PATHS` mentions in two unrelated sections of `.bkit/workflows.md` (around lines 1393 and 1469). Genuinely stale, but they are documentation debt from the change that replaced that mechanism, not part of this feature's surface. Worth a separate sweep.

### Gate results

`594de861`, working tree clean:

| Gate              | Result                                                           |
| ----------------- | ---------------------------------------------------------------- |
| `vitest`          | 3710 passed, 2 skipped, 2 todo (was 3707 — the 3 new assertions) |
| `bats`            | 227 ok                                                           |
| `typecheck`       | clean                                                            |
| `format:check`    | clean                                                            |
| `lint:prose`      | 0 errors (2 pre-existing warnings in `docs/testing.md`)          |
| `bkit:check:dist` | clean                                                            |
| `slop:delta`      | added 8, resolved 8, net findings 0, net score 0.00              |
| `bkit check`      | 0 writes would occur                                             |

### What is needed next

`594de861` is committed locally and **not pushed**. `origin/feat/380-roadmap-analysis-refresh` is one commit behind — which is a fair demonstration of finding 1: a local commit the remote cannot see is invisible to the PR.

Re-shipping is a new ship run, not a resumption of the stopped one. It needs the branch pushed, then `/bkit-ship #380`, which will re-dispatch CI at the new head and re-run the sweep against the fixes.

## Plan — docs/plans/202607/380-roadmap-analysis-refresh-plan.md

Verdict: PASS

<!-- verdict:end -->

<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) Implementation Plan — Master Index (split)

> [!IMPORTANT]
> **This master plan was SPLIT for session/token budget.** Its `Agent Execution Runbook` (15 tasks + 5 mandatory Testing/Documentation tasks), its four 🔒 Gates, its Derived Test Matrix (26 rows), and its Verification Plan now live in three self-contained sub-plans. Execute them **in order 1 → 2 → 3**. This file retains only the shared context/goals/patterns and the sub-plan index — do NOT execute tasks from here.

## Sub-Plan Index

<!-- prettier-ignore -->
| Order | Sub-plan | Scope (WS) | Tasks | Gates | Derived Test Matrix rows |
| --- | --- | --- | --- | --- | --- |
| 1 | [380-roadmap-analysis-refresh-plan-1.md](./380-roadmap-analysis-refresh-plan-1.md) | Foundation + Mechanical tier (WS-1 + WS-2) | Tasks 1–7 | Gate 1 (Prerequisites) | 1–11, 19–26 |
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
- **Directive 1 — VOID (Addendum 3 § O).** It required a per-FID UPSERT because build/debug rows were not re-derivable from `dev`; the ledger removes that asymmetry, so the status region is a **full regenerate from `docs/roadmap.jsonl`**. → sub-plan 1 (Task 3 builds the projection).
- **Directive 2** — `docs/completed.md` → `docs/roadmap.jsonl` migrates atomically across ALL touchpoints, via the existing parity-gated `bkit telemetry migrate` (which DELETES the `.md`) plus the bootstrap seed. → sub-plan 1 (Tasks 1/2/5).

> **Design Addendum 3 (owner, 2026-07-27) supersedes Directives 1 and 4.** `docs/roadmap.jsonl` (`kind: "feature"`, six-state ladder) is the canonical state, appended at all five phase closes; `docs/roadmap.md` is a pure projection, fully regenerated from it. The per-FID upsert (Directive 1) and the reconcile/recovery pass (Directive 4) are VOID — the latter survives only as a drift check. Read design § N–S before executing any sub-plan.
>
> **Design Addendum 4 (2026-07-29) re-anchors the ship surface on post-#384 `dev`.** Three things the original plan asserted about the shipped surface are no longer true and are corrected across all three sub-plans: (§ T) ship stages via the FROZEN `BOOK_PATHS` allow-list under `$BOOK_ROOT` — the scoped `git add -- docs/` no longer exists, `BOOK_PATHS` must swap `docs/completed.md` for the two roadmap paths or the ship-close row never commits, and `.bkit/src/bkit-ship-invariants.test.ts` publishes that list as a frozen invariant; (§ U) design/plan each carry the STRAY guard TWICE (dev path AND `RUNTIME_DEVPUSHES=false` PR path) — all four widen, or every PR-mode close aborts; (§ V) the cadence body text in the design is superseded by § Q (distinct `BUILT` FIDs from the ledger since the last fire, 10/90 — never `stats.jsonl` `outcome` rows). Read § T–V before executing sub-plan 1 or 2.

- **Directive 3** — reverse tracker-label sync (roadmap → tracker) is orchestrator-mediated, settled-drift-guarded, MCP-only, best-effort. → sub-plan 2 (Task 11).
- **Directive 4 — VOID as a recovery path (Addendum 3 § O).** A lost/corrupted board is rebuilt by re-running the fold. What survives is a smaller drift CHECK: warn when a live `feat/*` has NO ledger row (a close that never wrote); it never mutates the board. → sub-plan 2 (Task 12, rescoped).
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
- **Full regenerate from `docs/roadmap.jsonl`** for the status region (Addendum 3 § O; the per-FID upsert is VOID) — every close appends a `merge=union` row that reaches `dev`, so `-X ours` on the board is a non-event and the board needs no upsert, no dedupe invariant, and no recovery pass.
- **On-disk-first, tracker-additive** sensing — the board builds under `tracker: none`; `list_issues` enriches only when wired (never `search_issues` — silently returns 0 on private repos).
- **`docs/roadmap.jsonl` as the SOLE feature record** (Directive 2 + design Addenda 2 § H/I and 3 § N) — `completed.md` DELETED, row = a `deferral`/`failure` row minus `severity` with a six-state ladder, written at every phase close, content migrated by the existing parity-gated `bkit telemetry migrate`.

Rejected paths: per-FID upsert of the board (VOID with Directive 1); sed-edited single unstructured file; tracker `list_issues` as required/primary source; folding analysis into `@bkit-ship-update-docs`; `search_issues` for the tracker read; counting the cadence off `stats.jsonl` `outcome` rows (needs a FID in a harvested ledger — § R); re-widening ship staging to blanket `docs/` or `-A` (banned by #384 — Addendum 4 § T).

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
