# Plan Input — #380 Constant roadmap analysis refresh

## Session Prompt

```
/bkit-plan issue 380
```

## Issue Description

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

## Issue Comments

### Comment 1 (cbartens, 2026-07-22T22:43:33Z)

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

### Comment 2 (cbartens, 2026-07-22T22:47:22Z)

> Where does the roadmap live?

Must be docs/roadmap.md

> Trigger cadence. "At every workflow close" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale "read whole roadmap + all tracker issues" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) ship-close only + an on-demand /bkit-roadmap utility; (c) event-driven + heartbeat (mirrors https://github.com/cbartens/bkit/issues/260's tick). Lean (b) for v1.

yes "(b) ship-close only + an on-demand /bkit-roadmap utility" but maybe add something simpler as in mechanical roadmap.md update in each workflow to move issues from design -> plan -> build -> debug -> ship similar to tracker updates and analysis only on ship, that way other agents can see status in roadmap.md

### Comment 3 (cbartens, 2026-07-22T22:48:58Z)

## Design Workflow

### Step 1 — Start Workflow

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Comment 4 (cbartens, 2026-07-22T22:50:18Z)

### Step 2 — Worktree Setup

[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)

### Comment 5 (cbartens, 2026-07-22T22:56:51Z)

### Step 3 — Brainstorm & Ideate

### Comment 6 (cbartens, 2026-07-22T23:06:24Z)

### Step 4 — Generate Design

[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v1-draft.md)

### Comment 7 (cbartens, 2026-07-22T23:10:26Z)

### Step 5 — Design Review - Verdict: CONCERNS

### Comment 8 (cbartens, 2026-07-22T23:16:53Z)

### Step 6 — Apply Review - Verdict: CONCERNS

[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v2-reviewed.md)

### Comment 9 (cbartens, 2026-07-22T23:19:06Z)

### Step 7 — Design Organise - Verdict: PASS

[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md)

### Comment 10 (cbartens, 2026-07-22T23:27:41Z)

### Step 8 — Summary - Verdict: PASS

[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-summary.md)

Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

The design automates the constant refresh of `docs/roadmap.md` to surface issue phases and actionable next steps. Problem: users manually maintain roadmap sequencing, creating staleness/friction. Approach: two-tier system — a deterministic mechanical tier regenerates the status block at every workflow close (no LLM turn), and an opus analysis tier refreshes the best-next-step at ship/on-demand. Key decisions: (a) pure-projection status block (regenerate-on-conflict, making race conditions non-events), (b) consumer-owned file with two machine-owned marker blocks (preserves drift-clean status), (c) per-workflow staging integration (not one uniform rule), (d) bounded scan + coverage-stamped analysis to handle large trackers.

## Design Quality

Well-reasoned with clear trade-off documentation. The decision table (8 rows) explicitly compares chosen approaches against alternatives (regenerate-on-conflict, two-block seam, deterministic vs LLM, per-workflow staging) and states rationale for each — no hidden trade-offs. Notably honest about accepted costs: the regenerate-on-conflict choice trades durable event-log history for simplicity (deferred to #260); the per-workflow staging choice increases surface footprint vs a single uniform rule but avoids silent mis-staging. Edge cases well-identified: concurrent closes, merge conflicts, large-tracker context exhaustion, marker-block self-healing, and staleness honesty via the live-phase banner. Minor: the decision to count persisted ship-cycles in `.bkit/stats.jsonl` (vs the non-persisted counter-bus helper) is sound but depends on #324's existing schema; no pre-requisite stated.

## Acceptance Scenario

**Scenario:** User closes any workflow phase; `docs/roadmap.md` automatically shows each issue's current phase (from tracker labels + status.jsonl projection), with no manual edit or analysis turn. Ship-close + on-demand `/bkit-roadmap` refresh the analysis block (best-next-step, groupings, prompt suggestions, coverage-stamped). **Success Criteria:** 5 criteria address mechanical tier (no-manual refresh), robustness (concurrent closes/conflicts never abort), analysis tier (ship + on-demand refresh with coverage), cadence integration (deterministic threshold), and consumer ownership (no bkit-install overwrite). **Key Edge Cases:** Concurrent closes / `-X ours` conflicts (board reproducible from tracker), per-workflow staging shapes (design/plan widen allowlist; build/debug/ship have existing paths), marker self-healing (re-emit missing blocks), large-tracker context exhaustion (bounded scan + coverage-stamped), hand-edits (banner reverts), build/debug phase lag (tracker = live authority). **Verdict on template adherence:** Compliant.

## Breaking Changes

None. All changes are additive: new file `docs/roadmap.md` (consumer-owned, not a shipped managed-block template), new shell helper `.bkit/scripts/bkit-roadmap-fold.sh` (reuses existing `bkit-status-fold.sh`), new subagent `@bkit-roadmap-refresh`, new utility workflow `/bkit-roadmap`. Existing workflows (five Close steps) extended but not broken — STRAY-guard allowlist widened in design/plan workflows to include `^docs/roadmap\.md$`, while build/debug/ship already capture it via existing `git add` paths. No API contract changes, no database schema changes, no removed exports. `.agents/docs.md` gains one new row (consumer-owned section).

## Feasibility

High. No spike generated, but design is well-grounded in existing bkit infrastructure. Reuses proven patterns: (a) `bkit-status-fold.sh` pattern (#58 single-source reducer, extended for tracker projection), (b) `status.jsonl` format (#209 precedent), (c) two-block seam anti-clobber (#209), (d) MCP `list_issues` for bounded reads, (e) jq rendering, (f) parallel subagent in Step 10 (ship/update-docs pattern), (g) per-workflow Close-step integration (existing pattern). No new persisted schema required — reuses status.jsonl + stats.jsonl (ship-cycle counter). Technical risks identified and mitigated: large-tracker context exhaustion (bounded scan + coverage-stamped), per-close MCP availability (best-effort fail-open + stderr logs), concurrent closes/conflicts (pure projection regenerates all). Feasibility risk is primarily operational (five workflow edits + three shape-aware staging paths + mirror regen), not technical.

## Synthesis Coverage

Three brainstorm lenses synthesized into 9 approaches; final design KEPT 3A (core: regenerate-on-conflict pure-projection + two marker blocks), MERGED 1A (parallel subagent + sourced fold pattern) and 2A-split (two-block seam kept, persisted ledger rejected), REJECTED 1B/2C/3B (single-tier variants, conflicts owner requirements), 2B (shared-file race, mirrors #209 Defect A), 3C (over-engineered ledger).

## Scope Alignment

Focused and well-scoped. Deliverables: automated roadmap.md status/analysis refresh at close/on-demand, bounded analysis with coverage-stamped cadence. Explicitly OUT-OF-SCOPE (deferred as features or dependencies): #260 standalone sensing contract/actuator, #80 lens engine, #260 tick-step-1 YAGNI, persistent roadmap.jsonl ledger, build/debug dev-write (deferred, tracker = live authority — since **superseded**, see Comment 13 below). No scope creep; all planned surfaces align with the two-tier acceptance scenario.

## Risks

**Unknowns:** (1) Human gate on build/debug dev-write — should between-ship phases force dev update? (2) Cadence numbers — proposed N=5 ship-cycles + staleness-days fallback. (3) Status-board columns + closed-issue policy (proposed: open + recently-merged only). **Dependencies:** (1) #80 audit-candidate injection assumes lens engine lands (fallback: generic "run audit" reference). (2) #324 expected to provide persisted ship-cycle row schema in stats.jsonl. **Assumptions:** (1) No concurrent workflows per clone (regenerate-on-conflict tolerates but not designed for parallel). (2) Shipped text stays stack/vendor-agnostic. **Operational risks:** (1) Cross-provider mirror regen (five workflows + agent + utility; force-overwritten NOT drift-gated; silent shipping if stale). Mitigation: batch at session end + dogfood install AND upgrade. (2) Per-workflow-shape staging integration (design/plan widen allowlist; build/debug/ship reuse existing paths; single grep would miss reality). Mitigation: per-shape-aware CI/bats assertion. (3) Analysis maxTurns/context exhaustion on 200+ issues. Mitigation: bounded scan + coverage-stamped + ROADMAP_SCAN_COVERAGE counter (machine-visible). (4) Per-close MCP read couples close latency to tracker availability. Mitigation: best-effort fail-open (keep prior block, never gate) + stderr logs on every fail branch.

## Action Items

_None._ Design is complete and ready for planning at time of this summary. Two post-design amendments were folded in afterward (see Comments 12–14 below) — the plan MUST read the amended canonical design doc (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`), not this pre-amendment summary, as source of truth.

## Suggested Workstreams (pre-amendment — see Comments 12-14 for revisions)

- **WS-1: Roadmap artifact + deterministic fold foundation** (Requires: none)
- **WS-2: Mechanical status tier** (Requires: WS-1)
- **WS-3: Analysis tier — @bkit-roadmap-refresh opus leaf** (Requires: WS-1)
- **WS-4: Cadence-driven ledger/audit injection** (Requires: WS-3)
- **WS-5: On-demand `/bkit-roadmap` utility workflow** (Requires: WS-2, WS-3)
- **WS-6: Cross-provider mirror regen + live dogfood** (Requires: WS-2, WS-3, WS-4, WS-5)

### Comment 11 (cbartens, 2026-07-22T23:31:04Z)

### Step 10 — Close Workflow (design artifact links + telemetry — omitted here, see status.jsonl / repo for artifact list)

### Comment 12 (cbartens, 2026-07-23T03:17:33Z)

## Post-design addition — roadmap must be tracker-optional (on-disk-first)

New requirement from the owner, folded into the canonical design doc after close:

> Should work without a connected tracker — scan existing design/plan `.md` docs in `docs/plans` and build the roadmap from those, plus `failures.jsonl`/`deferrals.jsonl`, plus any ideas for new work in a consumer-owned section at the bottom of `roadmap.md`. If a tracker IS connected, additionally scan open issues + their status/readiness.

This **inverts the sensing model**: the merged design treated the tracker `list_issues` read as the primary status source. It's now **on-disk-first, tracker-additive** — which also makes #380 correctly honour bkit's `tracker: none` mode (#202 inline-marker model) and strengthens the stack-independence posture.

### What changed in the design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`)

<!-- prettier-ignore -->
| Area | Change |
| --- | --- |
| **Sensing source** | New Decisions row: **ON-DISK-FIRST** — per-FID phase from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + folded `status.jsonl` + `docs/completed.md`, plus `deferrals`/`failures.jsonl` and the consumer ideas region. `list_issues` is **additive, run only when a tracker is wired**; skipped entirely under `none`. |
| **Success Criteria #1–#2** | Board is built primarily from on-disk artifacts (works with NO tracker); tracker enriches with open issues + `bkit:*` phase/readiness when wired; regenerable from on-disk (+ tracker when wired). |
| **`bkit-roadmap-fold.sh` (Component 2)** | Projection input = `(on-disk plan-artifact scan + folded status.jsonl [+ tracker rows when wired]) → status board + frontier snapshot`; reads wired-vs-`none` from the #202 inline-marker config. |
| **Mechanical hook (Component 3)** | Always-run on-disk scan; the bounded `list_issues` read is conditional on a wired tracker; a failed/empty read falls back to the on-disk board (never blank), never gates the close. |
| **Consumer "Ideas / New Work" region** | Now a first-class, named region **below the last machine marker** — never rewritten by any regenerator, and a declared **read-input** for the analysis tier (folded into best-next-step; may suggest filing as an issue when a tracker is wired). |
| **Data model** | Status-board rows = union of on-disk FIDs ∪ open tracker issues (when wired); frontier snapshot item gains `source ∈ {"on-disk","tracker"}`. |
| **New edge cases** | `tracker: none` / tracker-read-failure (on-disk floor, never empty); build/debug on-disk lag (same accepted trade-off, enrichment overrides when wired). |

WS-1 (fold foundation) absorbs the on-disk scan + the ideas-region contract; WS-2 makes the tracker read conditional; WS-3 reads the ideas region. No new workstream needed — the change is scoped inside the existing WS-1–WS-3 boundaries.

Committed to `dev` as a docs-only amendment. Ready for `/bkit-plan 380`.

### Comment 13 (cbartens, 2026-07-23T03:33:13Z)

## Design revision 2 — `roadmap.md` is the CANONICAL home for issue state

Owner direction after review. This **inverts the authority model** (previously: tracker = live authority, roadmap = derived view). Captured as a superseding `## Addendum — Canonical-home revision` in the design doc (where it conflicts with the body, the addendum wins).

<!-- prettier-ignore -->
| # | Decision | Effect |
| --- | --- | --- |
| **A** | `docs/roadmap.md` = **canonical home** for issue state; tracker = downstream mirror | Authority chain flips to _workflow → on-disk + roadmap.md (canonical) → tracker labels (synced from roadmap)_. Every worked-on item appears under exactly one phase section. Supersedes "tracker = live authority". |
| **B** | **Phase-sectioned board**: Backlog → Design → Plan → Build → Debug → Ship | Item moves to the completed ledger on ship. **Backlog** = the free-form consumer-managed region at the bottom (the "Ideas / New Work" region, renamed + promoted); never regenerated, read by analysis, promotable into design. |
| **C** | **build/debug now write roadmap status to `dev`** (dev-lock idiom) — **resolves the OPEN build/debug-dev-write question → YES** | All five workflows refresh the dev roadmap at close. This is the only way `tracker: none` repos see build/debug on dev. Supersedes "v1 = no build/debug dev-write". |
| **D** | **Reverse tracker-label sync** (roadmap → tracker) on the cadence | New capability: reconcile each open issue's `bkit:*` label to its roadmap section. MCP-only, best-effort, idempotent, only reconciles settled drift, no-op under `tracker: none`. |
| **E** | On-disk scan **excludes completed** FIDs | Bounds `docs/plans/**` growth. |
| **F** | **FID is the universal key**; tracker id is embedded in the FID when connected | No separate issue-number column. |
| **G** | **Recommend `docs/completed.md` → `docs/completed.jsonl`** (structured shipped-FID ledger, peer of deferrals/failures) — **confirm scope** | Machine-readable "is this FID shipped?" instead of parsing markdown; `@bkit-ship-update-docs` appends rows. **Touches the ship workflow + existing `completed.md` readers**, so it's a companion change to confirm, not silently absorbed. |

**Conflict-safety preserved:** the phase sections stay regenerable (from dev-visible on-disk + each writer's own-FID phase, now incl. build/debug on dev); the Backlog is consumer-canonical, protected by living outside the machine markers. Plan must specify the per-FID upsert-vs-full-regenerate mechanism.

**Workstream impact:** WS-1 (+phase sections, backlog contract, exclude-completed, `completed.jsonl` schema), WS-2 (+build/debug dev-writes), WS-4 (+reverse tracker sync). A dedicated workstream for D+G if they grow.

Committed to `dev`.

### Comment 14 (cbartens, 2026-07-23T03:43:42Z)

## Design re-review (post canonical-home revision) — both CONCERNS, no FAIL

Re-ran the buildability + operability lenses against the revised design. Both returned **CONCERNS** (buildable + operable; no blocker), each verified against source. The critical findings are now folded into the design as **plan directives** (`## Re-review findings — plan directives`); reports in the logs dir (`design-rereview-1.md`, `design-rereview-2.md`).

**Verified-against-source, load-bearing:**

1. **Phase sections must be a per-FID UPSERT/merge, not a blind full-regenerate.** build/debug rows are authored on `dev` but their `status.jsonl` lives on `feat/{FID}` — not re-derivable from `dev`. A later close doing a full rebuild would silently revert build/debug rows. → status region = idempotent per-FID upsert keyed on FID; `-X ours` non-event holds for the writer's own row only. (This resolves the body's open upsert-vs-regenerate question.)
2. **`completed.md` → `completed.jsonl` must migrate atomically, with backfill.** Confirmed: `bkit-ship.md:902` greps `docs/completed.md` for the ship verdict (miss it → `UPDATE_DOCS_VERDICT`=FAIL blocks **every** ship); `docs/completed.md` is hash-gated in `.bkit/version` (unlike deferrals.jsonl). Plus a one-time **backfill** — else finding E's exclude-completed reads an empty ledger on day one and every historically-shipped FID reappears as active.
3. **Reverse tracker sync is orchestrator-mediated + settled-drift-guarded.** Confirmed no leaf prompt has tracker MCP tools, so it lives in the workflow/cadence step, not `@bkit-roadmap-refresh`; reconciles only settled drift (skip actively-transitioning issues), idempotent, best-effort, logged.
4. **Canonical reconciliation/recovery check** — diff live `feat/*` (+ open issues when wired) against the board to re-add/flag lost in-flight rows.
5. **build/debug dev-write is fail-open + a 4th staging shape** — the per-shape CI/bats assertion must cover it.

All five are "plan must specify X" gaps, not design blockers — appropriate for the plan phase and now captured so they can't be lost.

**Verdict: design is plan-ready.** The gates are green (no FAIL across 4 review passes), the canonical-home + tracker-optional model is coherent, `completed.jsonl` is in-scope with its migration hazards mapped, and the crux (per-FID upsert + rollout backfill) is now an explicit directive. Recommend `/bkit-plan 380`, instructing the plan to resolve the five directives up front (WS-1 carries #2/#4, WS-2 carries #1/#5, WS-4 carries #3).
