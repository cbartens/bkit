# Ship Input — 380-roadmap-analysis-refresh

## Session Prompt

/bkit-ship 380

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

## Issue Comments (raw JSON, 56 comments)

````json
[
  {
    "id": 5052366526,
    "body": "## Shaping notes — scope, forks, and next step\n\n**Recommendation: `bkit-design` next, not `bkit-plan`.** The *what* is clear, but every *how* is an open architectural fork (below). `bkit-plan` assumes a settled approach and just sequences tasks — jumping there hard-codes one unexamined answer per fork. This is a multi-workstream feature: a new agent + a new doc contract + close-step hooks touching the shipped surface of all 5 workflows (cross-provider mirror regen) + ledger/audit integration + a stated evolution path into #260. That's design territory.\n\n### Core forks the design must resolve\n\n1. **Where does the roadmap live?** Title/body say `docs/roadmap.md`; the reference example ([gether-life#398](https://github.com/gether-life/app-gether-life/issues/398)) is a *tracker issue*. Options: file-only / issue-only / file-as-source + issue-as-rendered-mirror. File = versioned, diffable, in-context for agents; issue = human-visible + notification-native. Likely landing: `docs/roadmap.md` as a **consumer-owned generated artifact** (peer of `status.jsonl` / `deferrals.jsonl`), NOT a shipped managed-block template — confirm.\n\n2. **Trigger cadence.** \"At every workflow close\" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale \"read whole roadmap + all tracker issues\" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) **ship-close only + an on-demand `/bkit-roadmap` utility**; (c) event-driven + heartbeat (mirrors #260's tick). Lean (b) for v1.\n\n3. **Relationship to #260.** #380 already says \"can evolve into #260.\" Framing: **#380 = sense + human-facing next-step recommendation; #260 = autonomous actuation.** #260's tick step 1 (\"Sense → reconstruct the frontier\") *is* #380's core engine. Design them as one shared **sensing primitive** so we don't build it twice (rules: *improve over duplicate*). Decide explicitly: is #380 the #260 sensing substrate, or standalone?\n\n4. **Ledger + audit integration cadence.** \"Every now and then inject #80 audits\", \"periodically review deferrals/failures.jsonl\" — cadence is undefined. Needs a concrete trigger (every N ship cycles / staleness threshold / count threshold) and a surfacing model (audit + ledger items become **candidate grouped next-steps** on the roadmap).\n\n5. **Prompt-suggestion content model** (the rich requirement). Suggestions must be bkit-optimal (incl. *when NOT to use bkit — task too easy*), scope-aware + issue-grouping, IDE-aware, model-recommending, subagent-maximising. Concerns to design around:\n   - Model names + IDE targets are **volatile/vendor-specific** — a shipped agent must NOT hardcode them; reference the model-selection doctrine generically or read from config (model IDs come from live endpoints, not stored strings).\n   - \"When not to use bkit\" ≈ the existing `plan-complexity-check` heuristic — reuse it.\n   - Issue-grouping ≈ `design→organise` workstream/dependency logic + #260's DAG — reuse, don't reinvent.\n\n### Constraints to carry into design\n- **Stack-independence:** the agent may read \"tracker issues\" generically but must bake in no stack/vendor (shipped-surface rule).\n- **Cross-provider:** any new close-step + agent = mirror regen across claude/cursor/opencode; must work under all three.\n- **Concurrency:** the roadmap write is another close-commit — fine within one clone, but note the no-concurrent-workflows-per-clone constraint.\n- **Tracker writes are MCP-only.**\n\n### Suggested phasing (for the design to weigh)\n- **v1** — `docs/roadmap.md` generator agent + ship-close hook + on-demand utility; human-readable \"best next step\" with prompt suggestions.\n- **v2** — deferrals/failures.jsonl review + #80 audit injection on a defined cadence.\n- **v3** — promote the sensing primitive into #260's tick.\n\n**Next step:** `bkit-design` on this issue — this comment can seed the brainstorm inputs.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052366526",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T22:43:33Z",
    "updated_at": "2026-07-22T22:43:33Z"
  },
  {
    "id": 5052392380,
    "body": "\u003e Where does the roadmap live?\n\nMust be docs/roadmap.md\n\n\u003e Trigger cadence. \"At every workflow close\" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale \"read whole roadmap + all tracker issues\" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) ship-close only + an on-demand /bkit-roadmap utility; (c) event-driven + heartbeat (mirrors https://github.com/cbartens/bkit/issues/260's tick). Lean (b) for v1.\n\nyes \"(b) ship-close only + an on-demand /bkit-roadmap utility\" but maybe add something simpler as in mechanical roadmap.md update in each workflow to move issues from design -\u003e plan -\u003e build -\u003e debug -\u003e ship similar to tracker updates and analysis only on ship, that way other agents can see status in roadmap.md",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052392380",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T22:47:22Z",
    "updated_at": "2026-07-22T22:47:22Z"
  },
  {
    "id": 5052404025,
    "body": "## Design Workflow\n### Step 1 — Start Workflow\n[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052404025",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T22:48:58Z",
    "updated_at": "2026-07-22T22:48:58Z"
  },
  {
    "id": 5052413007,
    "body": "### Step 2 — Worktree Setup\n[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)\n[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052413007",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T22:50:18Z",
    "updated_at": "2026-07-22T22:50:18Z"
  },
  {
    "id": 5052455233,
    "body": "### Step 3 — Brainstorm \u0026 Ideate",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052455233",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T22:56:51Z",
    "updated_at": "2026-07-22T22:56:51Z"
  },
  {
    "id": 5052518322,
    "body": "### Step 4 — Generate Design\n[design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v1-draft.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052518322",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T23:06:24Z",
    "updated_at": "2026-07-22T23:06:24Z"
  },
  {
    "id": 5052545026,
    "body": "### Step 5 — Design Review - Verdict: CONCERNS",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052545026",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T23:10:26Z",
    "updated_at": "2026-07-22T23:10:26Z"
  },
  {
    "id": 5052589505,
    "body": "### Step 6 — Apply Review - Verdict: CONCERNS\n[design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v2-reviewed.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052589505",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T23:16:53Z",
    "updated_at": "2026-07-22T23:16:53Z"
  },
  {
    "id": 5052605294,
    "body": "### Step 7 — Design Organise - Verdict: PASS\n[design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052605294",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T23:19:06Z",
    "updated_at": "2026-07-22T23:19:06Z"
  },
  {
    "id": 5052667476,
    "body": "### Step 8 — Summary - Verdict: PASS\n[design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-summary.md)\n\nVerdict: PASS\n\n\u003c!-- verdict:end --\u003e\n\n# Design Summary\n\n## Overview\n\nThe design automates the constant refresh of `docs/roadmap.md` to surface issue phases and actionable next steps. Problem: users manually maintain roadmap sequencing, creating staleness/friction. Approach: two-tier system — a deterministic mechanical tier regenerates the status block at every workflow close (no LLM turn), and an opus analysis tier refreshes the best-next-step at ship/on-demand. Key decisions: (a) pure-projection status block (regenerate-on-conflict, making race conditions non-events), (b) consumer-owned file with two machine-owned marker blocks (preserves drift-clean status), (c) per-workflow staging integration (not one uniform rule), (d) bounded scan + coverage-stamped analysis to handle large trackers.\n\n## Design Quality\n\nWell-reasoned with clear trade-off documentation. The decision table (8 rows) explicitly compares chosen approaches against alternatives (regenerate-on-conflict, two-block seam, deterministic vs LLM, per-workflow staging) and states rationale for each—no hidden trade-offs. Notably honest about accepted costs: the regenerate-on-conflict choice trades durable event-log history for simplicity (deferred to #260); the per-workflow staging choice increases surface footprint vs a single uniform rule but avoids silent mis-staging. Edge cases well-identified: concurrent closes, merge conflicts, large-tracker context exhaustion, marker-block self-healing, and staleness honesty via the live-phase banner. Minor: the decision to count persisted ship-cycles in `.bkit/stats.jsonl` (vs the non-persisted counter-bus helper) is sound but depends on #324's existing schema; no pre-requisite stated.\n\n## Acceptance Scenario\n\n**Scenario:** User closes any workflow phase; `docs/roadmap.md` automatically shows each issue's current phase (from tracker labels + status.jsonl projection), with no manual edit or analysis turn. Ship-close + on-demand `/bkit-roadmap` refresh the analysis block (best-next-step, groupings, prompt suggestions, coverage-stamped). **Success Criteria:** 5 criteria address mechanical tier (no-manual refresh), robustness (concurrent closes/conflicts never abort), analysis tier (ship + on-demand refresh with coverage), cadence integration (deterministic threshold), and consumer ownership (no bkit-install overwrite). **Key Edge Cases:** Concurrent closes / `-X ours` conflicts (board reproducible from tracker), per-workflow staging shapes (design/plan widen allowlist; build/debug/ship have existing paths), marker self-healing (re-emit missing blocks), large-tracker context exhaustion (bounded scan + coverage-stamped), hand-edits (banner reverts), build/debug phase lag (tracker = live authority). **Verdict on template adherence:** ✓ Compliant. Narrative + Success Criteria + Process Sketch + Key Edge Cases present in design-phase format (Concrete Example and Derived Test Matrix are plan-phase, correctly omitted here).\n\n## Breaking Changes\n\nNone. All changes are additive: new file `docs/roadmap.md` (consumer-owned, not a shipped managed-block template), new shell helper `.bkit/scripts/bkit-roadmap-fold.sh` (reuses existing `bkit-status-fold.sh`), new subagent `@bkit-roadmap-refresh`, new utility workflow `/bkit-roadmap`. Existing workflows (five Close steps) extended but not broken — STRAY-guard allowlist widened in design/plan workflows to include `^docs/roadmap\\.md$`, while build/debug/ship already capture it via existing `git add` paths. No API contract changes, no database schema changes, no removed exports. `.agents/docs.md` gains one new row (consumer-owned section).\n\n## Feasibility\n\nHigh. No spike generated, but design is well-grounded in existing bkit infrastructure. Reuses proven patterns: (a) `bkit-status-fold.sh` pattern (#58 single-source reducer, extended for tracker projection), (b) `status.jsonl` format (#209 precedent), (c) two-block seam anti-clobber (#209), (d) MCP `list_issues` for bounded reads, (e) jq rendering, (f) parallel subagent in Step 10 (ship/update-docs pattern), (g) per-workflow Close-step integration (existing pattern). No new persisted schema required — reuses status.jsonl + stats.jsonl (ship-cycle counter). Technical risks identified and mitigated: large-tracker context exhaustion (bounded scan + coverage-stamped), per-close MCP availability (best-effort fail-open + stderr logs), concurrent closes/conflicts (pure projection regenerates all). Feasibility risk is primarily operational (five workflow edits + three shape-aware staging paths + mirror regen), not technical.\n\n## Synthesis Coverage\n\nThree brainstorm lenses synthesized into 9 approaches; final design KEPT 3A (core: regenerate-on-conflict pure-projection + two marker blocks), MERGED 1A (parallel subagent + sourced fold pattern) and 2A-split (two-block seam kept, persisted ledger rejected), REJECTED 1B/2C/3B (single-tier variants, conflicts owner requirements), 2B (shared-file race, mirrors #209 Defect A), 3C (over-engineered ledger). Synthesis is sound: ✓ kept only approach satisfying two-tier requirement, ✓ merged tested patterns (fold, parallel subagent), ✓ split ideas (kept value, rejected overhead), ✓ rejected known anti-patterns (shared-file races). No lost good options; good rationale for each rejection.\n\n## Scope Alignment\n\nFocused and well-scoped. Deliverables: automated roadmap.md status/analysis refresh at close/on-demand, bounded analysis with coverage-stamped cadence. Explicitly OUT-OF-SCOPE (deferred as features or dependencies): #260 standalone sensing contract/actuator, #80 lens engine, #260 tick-step-1 YAGNI, persistent roadmap.jsonl ledger, build/debug dev-write (deferred, tracker = live authority). The design delivers #260's fold sense primitive without building #260 itself — a smart boundary. No scope creep; all planned surfaces align with the two-tier acceptance scenario.\n\n## Risks\n\n**Unknowns:** (1) Human gate on build/debug dev-write — should between-ship phases force dev update? (2) Cadence numbers — proposed N=5 ship-cycles + staleness-days fallback. (3) Status-board columns + closed-issue policy (proposed: open + recently-merged only). **Dependencies:** (1) #80 audit-candidate injection assumes lens engine lands (fallback: generic \"run audit\" reference). (2) #324 expected to provide persisted ship-cycle row schema in stats.jsonl. **Assumptions:** (1) No concurrent workflows per clone (regenerate-on-conflict tolerates but not designed for parallel). (2) Shipped text stays stack/vendor-agnostic. **Operational risks:** (1) Cross-provider mirror regen (five workflows + agent + utility; force-overwritten NOT drift-gated; silent shipping if stale). Mitigation: batch at session end + dogfood install AND upgrade. (2) Per-workflow-shape staging integration (design/plan widen allowlist; build/debug/ship reuse existing paths; single grep would miss reality). Mitigation: per-shape-aware CI/bats assertion. (3) Analysis maxTurns/context exhaustion on 200+ issues. Mitigation: bounded scan + coverage-stamped + ROADMAP_SCAN_COVERAGE counter (machine-visible). (4) Per-close MCP read couples close latency to tracker availability. Mitigation: best-effort fail-open (keep prior block, never gate) + stderr logs on every fail branch.\n\n## Action Items\n\n_None._ Design is complete and ready for planning. All three OPEN questions are addressed in Outstanding Questions section with recommended answers.\n\n## Outstanding Questions\n\n- **Q:** Should build/debug closes force a dev-located `roadmap.md` status write so `dev`'s board reflects build/debug phases between ships (cost: adding dev-writes to workflows that don't write dev today)? — **Recommended:** No (per v1 proposal). Tracker labels = live authority; staleness-honesty banner is sufficient. Between-ship visibility via tracker is adequate; if critical later, make it a v2 feature. Operational simplicity wins.\n\n- **Q:** Cadence numbers: `N` ship-cycles and staleness-days fallback value? — **Recommended:** N=5 ship-cycles + 14-day staleness fallback. Fires audit/ledger injection when either 5 ships occur or 14 days pass since last analysis. Tunable post-ship.\n\n- **Q:** Exact status-board columns and closed-issue handling? — **Recommended:** Columns: `Issue | Title | Phase | Milestone | Blocked-by | Last-transition ts`. Show open + recently-merged (last 2 releases, ~2-4 weeks); closed history archived in `docs/completed.md`. Avoids board bloat, keeps focus current.\n\n## Suggested Workstreams\n\n- **WS-1: Roadmap artifact + deterministic fold foundation** (Requires: none) — `docs/roadmap.md` marker-block layout, bootstrap flow, `.bkit/scripts/bkit-roadmap-fold.sh` shell helper (sources `bkit-status-fold.sh` + adds tracker projection), frontier-snapshot schema, status-board columns definition, `.agents/docs.md` row. Root deliverable; both tiers depend on it.\n\n- **WS-2: Mechanical status tier** (Requires: WS-1) — Per-close hook in all five workflows (design/plan/build/debug/ship) — bounded `list_issues` MCP read + fold → rewrite `roadmap-status` block, staged per workflow shape (design/plan widen STRAY allowlist; build/debug/ship use existing paths), best-effort fail-open, per-workflow-shape-aware CI/bats assertion.\n\n- **WS-3: Analysis tier — @bkit-roadmap-refresh opus leaf** (Requires: WS-1) — New subagent writes ONLY `roadmap-analysis` block; added as 3rd parallel in ship Step 10, reads bounded frontier + deferrals/failures, writes ranked best-next-step + groupings + prompt suggestions + coverage stamp + `ROADMAP_SCAN_COVERAGE` counter row.\n\n- **WS-4: Cadence-driven ledger/audit injection** (Requires: WS-3) — Deterministic threshold (N ship-cycles + staleness-days) derived from persisted `.bkit/stats.jsonl` rows; fires audit candidate + grouping ledger items when threshold crosses; logs `[bkit-analysis]` on counter-advance + injection-fire.\n\n- **WS-5: On-demand `/bkit-roadmap` utility workflow** (Requires: WS-2, WS-3) — Thin composition reusing mechanical fold + `@bkit-roadmap-refresh`; gives on-demand refresh outside close cycle.\n\n- **WS-6: Cross-provider mirror regen + live dogfood** (Requires: WS-2, WS-3, WS-4, WS-5) — Mirror regen for five workflows + new agent + new utility (claude/cursor/opencode), batched at session end; live dogfood of `bkit install` AND `bkit upgrade` (separate engines); verify `docs/roadmap.md` stays consumer-owned (no `bkit install` overwrite, `bkit check` drift clean).\n\n## Recommended Next Step\n\n```text\n/bkit-plan 380\n\nBrief: Execute WS-1–WS-6 in sequence (foundation → mechanical → analysis → cadence → utility → mirror+dogfood). Confirm three open questions with owner before implementation details: build/debug dev-write policy, cadence numbers (propose N=5, 14d staleness), status-board columns + closed-issue handling. Caveat: per-workflow-shape staging integration (design/plan widen allowlist; build/debug/ship reuse existing) must land correctly in all five workflows — per-shape-aware CI/bats assertion is mandatory. Design: docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md\n```",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052667476",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T23:27:41Z",
    "updated_at": "2026-07-22T23:27:41Z"
  },
  {
    "id": 5052686552,
    "body": "### Step 10 — Close Workflow\n#### Artifacts\n- [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md)\n- [design-brainstorm-ideate-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-brainstorm-ideate-1.md)\n- [design-brainstorm-ideate-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-brainstorm-ideate-2.md)\n- [design-brainstorm-ideate-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-brainstorm-ideate-3.md)\n- [design-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-input.md)\n- [design-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-review-1.md)\n- [design-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-review-2.md)\n- [design-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-summary.md)\n- [design-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v1-draft.md)\n- [design-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v2-reviewed.md)\n- [design-v3-organised.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/design-v3-organised.md)\n\n#### Telemetry\n**design close** · cbartens/bkit\n\n| metric | this run | med·5 |\n| --- | --- | --- |\n| durationSeconds | 38443 (10h41m) | — |\n| linesChanged | 1735 (+1735/-0) | — |\n| filesChanged | 15 | — |\n| frictionAdded | 1 | — |\n| deferralsAdded | 2 | — |\n| failuresAdded | 0 | — |\n| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |\n| attempts | DESIGN_ATTEMPT 1 | — |\n\n`med·5` = median of the previous 5 design runs (— if \u003c 3) · ledger 11 rows, 0 malformed\n\n[#380 Constant roadmap analysis refresh](https://github.com/cbartens/bkit/issues/380)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5052686552",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-22T23:31:04Z",
    "updated_at": "2026-07-22T23:31:04Z"
  },
  {
    "id": 5053920253,
    "body": "## Post-design addition — roadmap must be tracker-optional (on-disk-first)\n\nNew requirement from the owner, folded into the canonical design doc after close:\n\n\u003e Should work without a connected tracker — scan existing design/plan `.md` docs in `docs/plans` and build the roadmap from those, plus `failures.jsonl`/`deferrals.jsonl`, plus any ideas for new work in a consumer-owned section at the bottom of `roadmap.md`. If a tracker IS connected, additionally scan open issues + their status/readiness.\n\nThis **inverts the sensing model**: the merged design treated the tracker `list_issues` read as the primary status source. It's now **on-disk-first, tracker-additive** — which also makes #380 correctly honour bkit's `tracker: none` mode (#202 inline-marker model) and strengthens the stack-independence posture.\n\n### What changed in the design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`)\n\n| Area | Change |\n|---|---|\n| **Sensing source** | New Decisions row: **ON-DISK-FIRST** — per-FID phase from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + folded `status.jsonl` + `docs/completed.md`, plus `deferrals`/`failures.jsonl` and the consumer ideas region. `list_issues` is **additive, run only when a tracker is wired**; skipped entirely under `none`. |\n| **Success Criteria #1–#2** | Board is built primarily from on-disk artifacts (works with NO tracker); tracker enriches with open issues + `bkit:*` phase/readiness when wired; regenerable from on-disk (+ tracker when wired). |\n| **`bkit-roadmap-fold.sh` (Component 2)** | Projection input = `(on-disk plan-artifact scan + folded status.jsonl [+ tracker rows when wired]) → status board + frontier snapshot`; reads wired-vs-`none` from the #202 inline-marker config. |\n| **Mechanical hook (Component 3)** | Always-run on-disk scan; the bounded `list_issues` read is conditional on a wired tracker; a failed/empty read falls back to the on-disk board (never blank), never gates the close. |\n| **Consumer \"Ideas / New Work\" region** | Now a first-class, named region **below the last machine marker** — never rewritten by any regenerator, and a declared **read-input** for the analysis tier (folded into best-next-step; may suggest filing as an issue when a tracker is wired). |\n| **Data model** | Status-board rows = union of on-disk FIDs ∪ open tracker issues (when wired); frontier snapshot item gains `source ∈ {\"on-disk\",\"tracker\"}`. |\n| **New edge cases** | `tracker: none` / tracker-read-failure (on-disk floor, never empty); build/debug on-disk lag (same accepted trade-off, enrichment overrides when wired). |\n\nWS-1 (fold foundation) absorbs the on-disk scan + the ideas-region contract; WS-2 makes the tracker read conditional; WS-3 reads the ideas region. No new workstream needed — the change is scoped inside the existing WS-1–WS-3 boundaries.\n\nCommitted to `dev` as a docs-only amendment (`docs(380-roadmap-analysis-refresh): fold tracker-optional on-disk sensing into design`). Ready for `/bkit-plan 380`.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5053920253",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T03:17:33Z",
    "updated_at": "2026-07-23T03:17:33Z"
  },
  {
    "id": 5054003033,
    "body": "## Design revision 2 — `roadmap.md` is the CANONICAL home for issue state\n\nOwner direction after review. This **inverts the authority model** (previously: tracker = live authority, roadmap = derived view). Captured as a superseding `## Addendum — Canonical-home revision` in the design doc (where it conflicts with the body, the addendum wins).\n\n| # | Decision | Effect |\n|---|---|---|\n| **A** | `docs/roadmap.md` = **canonical home** for issue state; tracker = downstream mirror | Authority chain flips to *workflow → on-disk + roadmap.md (canonical) → tracker labels (synced from roadmap)*. Every worked-on item appears under exactly one phase section. Supersedes \"tracker = live authority\". |\n| **B** | **Phase-sectioned board**: Backlog → Design → Plan → Build → Debug → Ship | Item moves to the completed ledger on ship. **Backlog** = the free-form consumer-managed region at the bottom (the \"Ideas / New Work\" region, renamed + promoted); never regenerated, read by analysis, promotable into design. |\n| **C** | **build/debug now write roadmap status to `dev`** (dev-lock idiom) — **resolves the OPEN build/debug-dev-write question → YES** | All five workflows refresh the dev roadmap at close. This is the only way `tracker: none` repos see build/debug on dev. Supersedes \"v1 = no build/debug dev-write\". |\n| **D** | **Reverse tracker-label sync** (roadmap → tracker) on the cadence | New capability: reconcile each open issue's `bkit:*` label to its roadmap section. MCP-only, best-effort, idempotent, only reconciles settled drift, no-op under `tracker: none`. |\n| **E** | On-disk scan **excludes completed** FIDs | Bounds `docs/plans/**` growth (your finding #2). |\n| **F** | **FID is the universal key**; tracker id is embedded in the FID when connected | No separate issue-number column (your finding #3). |\n| **G** | **Recommend `docs/completed.md` → `docs/completed.jsonl`** (structured shipped-FID ledger, peer of deferrals/failures) — **confirm scope** | Machine-readable \"is this FID shipped?\" instead of parsing markdown; `@bkit-ship-update-docs` appends rows. **Touches the ship workflow + existing `completed.md` readers**, so it's a companion change to confirm, not silently absorbed. |\n\n**Conflict-safety preserved:** the phase sections stay regenerable (from dev-visible on-disk + each writer's own-FID phase, now incl. build/debug on dev); the Backlog is consumer-canonical, protected by living outside the machine markers. Plan must specify the per-FID upsert-vs-full-regenerate mechanism.\n\n**Workstream impact:** WS-1 (+phase sections, backlog contract, exclude-completed, `completed.jsonl` schema), WS-2 (+build/debug dev-writes), WS-4 (+reverse tracker sync). A dedicated workstream for D+G if they grow.\n\nCommitted to `dev` (`docs(380): canonical-home revision`).",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054003033",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T03:33:13Z",
    "updated_at": "2026-07-23T03:33:13Z"
  },
  {
    "id": 5054062877,
    "body": "## Design re-review (post canonical-home revision) — both CONCERNS, no FAIL\n\nRe-ran the buildability + operability lenses against the revised design. Both returned **CONCERNS** (buildable + operable; no blocker), each verified against source. The critical findings are now folded into the design as **plan directives** (`## Re-review findings — plan directives`); reports in the logs dir (`design-rereview-1.md`, `design-rereview-2.md`).\n\n**Verified-against-source, load-bearing:**\n\n1. **Phase sections must be a per-FID UPSERT/merge, not a blind full-regenerate.** build/debug rows are authored on `dev` but their `status.jsonl` lives on `feat/{FID}` — not re-derivable from `dev`. A later close doing a full rebuild would silently revert build/debug rows. → status region = idempotent per-FID upsert keyed on FID; `-X ours` non-event holds for the writer's own row only. (This resolves the body's open upsert-vs-regenerate question.)\n2. **`completed.md` → `completed.jsonl` must migrate atomically, with backfill.** Confirmed: `bkit-ship.md:902` greps `docs/completed.md` for the ship verdict (miss it → `UPDATE_DOCS_VERDICT`=FAIL blocks **every** ship); `docs/completed.md` is hash-gated in `.bkit/version` (unlike deferrals.jsonl). Plus a one-time **backfill** — else finding E's exclude-completed reads an empty ledger on day one and every historically-shipped FID reappears as active.\n3. **Reverse tracker sync is orchestrator-mediated + settled-drift-guarded.** Confirmed no leaf prompt has tracker MCP tools, so it lives in the workflow/cadence step, not `@bkit-roadmap-refresh`; reconciles only settled drift (skip actively-transitioning issues), idempotent, best-effort, logged.\n4. **Canonical reconciliation/recovery check** — diff live `feat/*` (+ open issues when wired) against the board to re-add/flag lost in-flight rows.\n5. **build/debug dev-write is fail-open + a 4th staging shape** — the per-shape CI/bats assertion must cover it.\n\nAll five are \"plan must specify X\" gaps, not design blockers — appropriate for the plan phase and now captured so they can't be lost.\n\n**Verdict: design is plan-ready.** The gates are green (no FAIL across 4 review passes), the canonical-home + tracker-optional model is coherent, `completed.jsonl` is in-scope with its migration hazards mapped, and the crux (per-FID upsert + rollout backfill) is now an explicit directive. Recommend **`/bkit-plan 380`**, instructing the plan to resolve the five directives up front (WS-1 carries #2/#4, WS-2 carries #1/#5, WS-4 carries #3).",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054062877",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T03:43:42Z",
    "updated_at": "2026-07-23T03:43:42Z"
  },
  {
    "id": 5054111633,
    "body": "## Plan Workflow\n### Step 1 — Start Workflow\n[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)\nParent design: None (design workflow already ran on this same issue — canonical design doc: [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md))",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054111633",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T03:50:52Z",
    "updated_at": "2026-07-23T03:50:52Z"
  },
  {
    "id": 5054126300,
    "body": "### Step 2 — Worktree Setup\n[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)\n[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054126300",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T03:52:55Z",
    "updated_at": "2026-07-23T03:52:55Z"
  },
  {
    "id": 5054216379,
    "body": "### Step 3 — Generate Plan\n[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v1-draft.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054216379",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:06:09Z",
    "updated_at": "2026-07-23T04:06:09Z"
  },
  {
    "id": 5054227503,
    "body": "### Step 4 — Fetch Context\n[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-issues.md)\n[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-deferrals.md)\n[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/related-failures.md)\n\nNote: `mcp__github__search_issues` returned `total_count: 0` for every query on this private repo, including a bare control query — the known, already-logged failure (`github-mcp-search-issues-silently-returns-zero-private-repo`, still OPEN). Verified against `gh issue list --search` (which found matches) before classifying as `Search unavailable.` rather than `None.`, per that failure's own remediation guidance.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054227503",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:08:15Z",
    "updated_at": "2026-07-23T04:08:15Z"
  },
  {
    "id": 5054267284,
    "body": "### Step 5 — Review Plan - Verdict: CONCERNS - Failures: 4",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054267284",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:15:39Z",
    "updated_at": "2026-07-23T04:15:39Z"
  },
  {
    "id": 5054355779,
    "body": "### Step 6 — Apply Review - Verdict: PASS\n[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054355779",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:29:01Z",
    "updated_at": "2026-07-23T04:29:01Z"
  },
  {
    "id": 5054426967,
    "body": "### Step 7 — Scope Check - Verdict: PASS - Failures: 2",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054426967",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:37:08Z",
    "updated_at": "2026-07-23T04:37:08Z"
  },
  {
    "id": 5054494177,
    "body": "### Step 8 — Apply Scope - Verdict: CONCERNS\n[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v3-checked.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054494177",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:44:56Z",
    "updated_at": "2026-07-23T04:44:56Z"
  },
  {
    "id": 5054504882,
    "body": "### Step 9 — Complexity Check - Verdict: SPLIT",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054504882",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T04:46:13Z",
    "updated_at": "2026-07-23T04:46:13Z"
  },
  {
    "id": 5054625898,
    "body": "### Step 10 — Complexity Split - Verdict: PASS\n[plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-split.md)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054625898",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T05:00:35Z",
    "updated_at": "2026-07-23T05:00:35Z"
  },
  {
    "id": 5054660435,
    "body": "### Step 11 — Summary - Verdict: PASS\n[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-summary.md)\n\nVerdict: PASS\n\n\u003c!-- verdict:end --\u003e\n\n# Plan Summary\n\n## Overview\n\nThree-sub-plan split implementation of constant roadmap automation. Automates `docs/roadmap.md` with a deterministic mechanical status tier (refreshed at every close) and an opus analysis tier (best-next-step, dependency groupings, prompt suggestions) refreshed at ship/on-demand. WS-1/2 (foundation + mechanical), WS-3/4 (analysis + cadence/sync/reconcile), WS-5/6 (utility + mirror regen). Gate 1 (Prerequisites) in SP1; Gates 2–4 + full Verification + Manual Verification in SP3.\n\n## Plan Quality\n\nWell-scoped and highly detailed. Clear dependency ordering (SP1 → SP2 → SP3); explicit prerequisite declaration for each sub-plan. Five design directives precisely mapped to concrete tasks across workstreams. Each task has a focused \"Done when\" criterion tied to matrix rows. Dependencies tracked (e.g., SP2 waits for SP1's fold + frontier snapshot; SP3 composes both). Pre-flight sections verify prerequisites per sub-plan. No ambiguity on ordering or integration points. Per-workflow-shape staging variations well-justified and explicitly tested (rows 11/20/21). Rollback strategy atomic (SP1's completed.jsonl touchpoints land together).\n\n## Completeness\n\nComprehensive across all six workstreams. SP1 (WS-1/2): telemetry codec, backfill script, fold foundation, doc-index, mechanical hooks + 4 staging variants. SP2 (WS-3/4): analysis leaf, ship Step 10 wiring, cadence threshold + audit/ledger injection, reverse sync, reconcile/recovery. SP3 (WS-5/6): utility workflow, deferral closure, observability/ledger docs, mirror regen. All 22-row Derived Test Matrix distributed across sub-plans with ownership map (rows 1–11,19–22 SP1; rows 12–16 SP2; rows 17–18 SP3). Every section reproduced across sub-plans for self-containment. Testing strategy covers Unit/Integration/Shell-bats; no E2E/fresh-DB. Security \u0026 Privacy sections present per sub-plan (MCP-only reads, no new secrets, untrusted user input treated correctly). Documentation Updates detailed with specific files + row locations.\n\n## Acceptance Scenario\n\n**Narrative:** User closes a workflow phase; `docs/roadmap.md` auto-updates to show issue's phase (from on-disk artifacts + optional tracker enrichment) with no manual edit. Ship/on-demand refresh analysis block with best-next-step, groupings, prompt suggestions. **Success Criteria:** (1) phase-sectioned board built from on-disk artifacts (tracker-optional, never blank); (2) concurrent closes/conflicts never corrupt board (per-FID upsert, deterministic regen); (3) ship + `/bkit-roadmap` refresh analysis block with coverage-stamped scan; (4) ledger/audit cadence fires on threshold (persisted ship-cycles + staleness-days); (5) `docs/roadmap.md` consumer-owned (bkit install never overwrites, check stays clean). **Concrete example:** `tracker: none` repo with 2 in-flight FIDs on disk, 1 shipped in completed.jsonl, 2 hand-written Backlog lines → board shows each under its phase, Backlog untouched, analysis ranks next step. **Template Adherence:** Compliant — narrative, success criteria, process sketch, edge cases table (12 rows), concrete example all present; human-confirmation checkboxes carried forward from master plan unchanged.\n\n## Breaking Changes\n\nNone — all additive. New artifact: `docs/roadmap.md` (consumer-owned, NOT a managed-block template); new scripts/agents/workflows; five Close steps extended (STRAY widened design/plan; build/debug/ship existing paths capture); new codec `kind: \"completed\"` (union member, not breaking change). New ledger `docs/completed.jsonl` + migration from `completed.md` (atomic across all touchpoints: reader + writer + backfill in one change, SP1). **Critical migration:** `completed.md` grep reader switches to `completed.jsonl` in Task 5 (SP1). `completed.md` file retained as human-readable (dual-write). No API contract changes. New observability prefix `[bkit-roadmap]` (new module, one-per-subsystem rule). New `counterName: \"ROADMAP_SCAN_COVERAGE\"`. **Deferral closure:** `380-dev-located-roadmap-status-write-for-build-debug-closes` marked CLOSED (superseded by SP1 Task 7's dev-lock write, per Addendum C).\n\n## Design Alignment\n\nPlan closely mirrors design with explicit handling of two post-close amendments (canonical-home inversion + on-disk-first sensing). **Five design directives resolved across sub-plans:** Directive 1 (per-FID upsert) → SP1 Tasks 3/6/7; Directive 2 (completed.jsonl migration+backfill) → SP1 Tasks 1/2/5; Directive 3 (reverse tracker sync) → SP2 Task 11; Directive 4 (reconcile/recovery) → SP2 Task 12; Directive 5 (build/debug 4th staging shape) → SP1 Task 7 + matrix row 11. Acceptance Scenario narrative, success criteria, process sketch carried verbatim across all three sub-plans for self-containment. Edge cases table expands design's 6 rows to 12 per sub-plan. Open questions \u0026 assumptions reproduced unchanged (cadence numbers N=5/14, board scope, completed.md fate, codec scope, no-concurrent constraint, stats.jsonl schema, stack-agnostic shipped text, #80 lens engine defer). Design's choice of regenerate-on-conflict + per-FID upsert + two-marker-block seam + on-disk-first sensing all preserved. No design scope exceeded.\n\n## Deferred \u0026 Out-of-Scope\n\nAll declared as Exempt (genuinely-additive, not required by Success Criteria): (1) Persisted `roadmap.jsonl` event log / durable cross-tick frontier → #260 (mirrors `docs/deferrals.jsonl` key `380-persisted-frontier-snapshot-event-log-for-260`). (2) #260 autonomous actuator/sensing contract/standalone schema → #260 (Speculative, YAGNI). (3) #80 lens engine (concrete audit lenses) → #80 (depends on landing; cadence injects generic \"run audit\" ref). (4) `bkit harvest` / `bkit analysis` ingestion of `completed.jsonl` → Follow-up (no reader consumes yet; codec-acceptance enough). (5) Generating `docs/completed.md` from ledger → Follow-up (dual-write lower risk). (6) `380-first-bootstrap-preserve-preexisting-consumer-roadmap-content` → Deferred (low blast radius for bkit repo: no pre-existing roadmap.md to migrate). **No Blocking items.** All deferral rows cite where they belong.\n\n## Suggested Scope Expansion\n\nNone identified. Plan addresses the core feature comprehensively across all six workstreams. The design's approach to deferred phasing (v1 status/analysis + utility, v2 ledger/cadence, v3 #260 integration) aligns with the planned implementation.\n\n## Risks\n\n**Unknowns:** Cadence numbers (N=5 ship-cycles, staleness=14 days) open-question; human confirmation deferred to Manual Verification. **Dependencies:** #80 audit-candidate source (fallback: generic ref until lands); #324 persisted ship-cycle row schema in stats.jsonl (fail-safe if missing: count reads 0, never fires). **Assumptions:** No concurrent workflows per clone (regenerate-on-conflict tolerates but per-FID upsert handles race); no-concurrent-workflows rule held (KN class). Shipped text stays stack/vendor-agnostic. **Operational risks:** (1) Cross-provider mirror regen (five workflows + agent + utility; force-overwritten, NOT drift-gated; batch at session end + dogfood install AND upgrade). (2) Per-workflow staging variations (4 shapes for close: design/plan widen STRAY; build/debug/ship reuse; per-shape CI/bats assertion covering). (3) Analysis maxTurns exhaustion on large trackers (bounded scan + coverage-stamped + ROADMAP_SCAN_COVERAGE counter). (4) Per-close MCP read couples close latency to tracker availability (best-effort fail-open, never gates close). (5) `completed.jsonl` empty-on-rollout trap (backfill wired to `bkit upgrade`; runs idempotently fail-open across all consumers). Mitigations clear per risk.\n\n## Action Items\n\nNone. Plan is build-ready. Open questions (cadence numbers, board scope, completed.md fate, codec scope) are properly identified in shared human-confirmation checkboxes and deferred to Manual Verification with specific steps. Assumptions documented and mitigations in place. No CONCERNS-level gaps identified.\n\n## Recommended Next Step\n\n```\n/bkit-build 380\nBrief: Execute sub-plans sequentially (1 → 2 → 3): SP1 builds mechanical foundation + backfill, SP2 adds analysis + cadence/sync/reconcile, SP3 finishes utility + mirror regen + full verification. Gate 1 in SP1; Gates 2–4 + Manual Verification in SP3. Plan-docs: [plan-v4-split.md](./plan-v4-split.md), [plan-v4-1.md](./plan-v4-1.md), [plan-v4-2.md](./plan-v4-2.md), [plan-v4-3.md](./plan-v4-3.md).\n```",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054660435",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T05:04:41Z",
    "updated_at": "2026-07-23T05:04:41Z"
  },
  {
    "id": 5054692025,
    "body": "### Step 12 — Close Workflow\n#### Artifacts\n- [380-roadmap-analysis-refresh-design.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-design.md)\n- [380-roadmap-analysis-refresh-plan-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan-1.md)\n- [380-roadmap-analysis-refresh-plan-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan-2.md)\n- [380-roadmap-analysis-refresh-plan-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan-3.md)\n- [380-roadmap-analysis-refresh-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/380-roadmap-analysis-refresh-plan.md)\n- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-complexity-check.md)\n- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-input.md)\n- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-review-1.md)\n- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-review-2.md)\n- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-review-3.md)\n- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-scope-check-1.md)\n- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-scope-check-2.md)\n- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-summary.md)\n- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v1-draft.md)\n- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v2-reviewed.md)\n- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v3-checked.md)\n- [plan-v4-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-1.md)\n- [plan-v4-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-2.md)\n- [plan-v4-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-3.md)\n- [plan-v4-split.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/380-roadmap-analysis-refresh/plan-v4-split.md)\n\n#### Telemetry\n**plan close** · cbartens/bkit\n\n| metric | this run | med·5 |\n| --- | --- | --- |\n| durationSeconds | 40521 (11h15m) | — |\n| linesChanged | 4905 (+4538/-367) | — |\n| filesChanged | 25 | — |\n| taskCount | 93 | — |\n| frictionAdded | 1 | — |\n| deferralsAdded | 1 | — |\n| failuresAdded | 0 | — |\n| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |\n| attempts | PLAN_ATTEMPT 1 | — |\n\n`med·5` = median of the previous 5 plan runs (— if \u003c 3) · ledger 15 rows, 0 malformed\n\n[#380 Constant roadmap analysis refresh](https://github.com/cbartens/bkit/issues/380)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5054692025",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-23T05:08:24Z",
    "updated_at": "2026-07-23T05:08:24Z"
  },
  {
    "id": 5075924156,
    "body": "Agreed on all of it. A few things to pin down before I touch the plan docs.\n\n**Schema fields** — add `references` (FID + on-disk paths, already a generic envelope field, just needs populating) and `summary`/`description` (new for the `outcome` kind — today only friction/deferral/failure/knowledge/decision have those). I'd skip adding a `key` field though: `key` in this ledger means \"recurring, mutable identity, updated via same-key append\" (a friction item gets re-touched over time). An activity row is a one-shot point-in-time event — every workflow close is a new row, not an update to a prior one — so `references: [FID, ...]` is the right fit, not `key`.\n\n**Naming/location** — `activity.jsonl` is a good name, matches the `deferrals`/`failures`/`knowledge`/`decisions` convention. But that convention lives in `docs/`, while `stats.jsonl` lives in `.bkit/` (internal tooling dir) and also carries `counter`/`compliance` rows (attempt counters, pass/fail gate checks) that are pure build-machinery, not really \"activity\" in the human sense. Three options: (a) rename in place, `.bkit/activity.jsonl`, everything stays together; (b) move+rename the whole thing to `docs/activity.jsonl`, matching the sibling ledgers; (c) split — `counter`/`compliance` stay in `.bkit/stats.jsonl` untouched, and only `outcome` rows (now FID/summary/description-enriched) move to a new `docs/activity.jsonl`. I'd lean (c) — it keeps \"internal telemetry\" and \"human-legible project history\" in separate files with separate audiences, same split docs/ vs .bkit/ already draws everywhere else — but it's a real judgment call, your pick.\n\n**Scope flag, genuinely worth pausing on:** I grepped — `stats.jsonl` is referenced in **42 files**: every workflow's source + all three rendered mirrors (claude/cursor/opencode, 20 files alone), the telemetry/comply/harvest/analysis/manifest source + 6 test files, and 4 docs pages. That's not a roadmap-feature change, it's a rename of shared infrastructure that #58/#209/#234/#324 all built on. Given how strict the scope-check reviewers were on this exact plan an hour ago, I'd want to either (a) spin this out as its own small prerequisite issue/plan that #380 then depends on, or (b) fold it into #380 sub-plan 1 explicitly as an added, acknowledged scope item. Which do you want?\n\n**roadmap.md sections** — confirming my read since you didn't list a \"Shipped\" section: once an item's row reaches Ship and the ship workflow closes, the row is **removed from the board entirely** (not moved to a 6th section) — the ship close-hook's upsert action is a delete, not a move. The only remaining record that it ever existed is `activity.jsonl`'s `outcome` rows. That also means the board's own state (row present/absent) becomes directly verifiable — the ship-verdict gate checks \"is the FID's row gone from roadmap.md,\" no ledger detour, and the already-planned reconcile/recovery task additionally reads `activity.jsonl` if the board ever needs rebuilding from scratch (an occasional best-effort read there is fine — that path already tolerates it). Is that the right read, or did you want shipped items to stay visible somewhere on the board?\n\nThat's just a stale background `find` command from earlier finishing up (part of my scope-check investigation a few turns back) — not new input. Still waiting on your answers to the three questions above: prerequisite issue vs. folded into #380 for the `stats.jsonl` rename, the file split/location choice, and whether \"Ship = row removed from the board\" matches what you intended.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5075924156",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-25T00:49:26Z",
    "updated_at": "2026-07-25T00:49:26Z"
  },
  {
    "id": 5076140795,
    "body": "## Decisions — completed ledger, board cap, telemetry scope (owner, 2026-07-25)\n\nAnswers to the three open questions, plus the row format. Captured as `## Addendum 2` in the design doc (where it conflicts with Addendum 1 or the body, Addendum 2 wins) and propagated through all four plan docs.\n\n| # | Decision | Effect |\n|---|---|---|\n| **H** | **`docs/completed.md` is DELETED**, not retained | No dual-write, no generated markdown view. `docs/completed.jsonl` becomes the only shipped-feature record. Nobody reads the `.md` (humans read `docs/roadmap.md`; the sole machine reader is the ship verdict grep) and two records of one thing drift. Supersedes Addendum 1 § G's retention clause. |\n| **I** | **Row format = a `deferral`/`failure` row minus `severity` and `status`** | `key` = `{FID}` (identity `(kind, repo, key)`, existing key-based default — a re-ship is a same-`key` append, `fold()` last-wins, prior lines stay as history); `category` = the DOMAIN set shared with `deferral`/`failure`, not `completed.md`'s legacy product-shaped set; `summary` = title; `description` = the old `**Summary:**` prose; `references[]` absorbs `**Artifacts:**` + `**Related:**`. No `severity` (jsonl.md forbids it outside the triage trio), no `status` (terminal kind). |\n| **J** | **Migration extends `bkit telemetry migrate`** — not a new backfill script | `docs/completed.md` -\u003e `docs/completed.jsonl` becomes the **fifth** `.md`-\u003e`.jsonl` pair on the existing migrator (`knowledge.md`, `decisions.md`, `pending.md`, `.bkit/friction.md` are the first four), inheriting its `.md.bak` -\u003e write rows -\u003e **row-count parity gate** -\u003e delete-the-`.md`-only-after-parity contract and its idempotent re-run. Supersedes the planned `bkit-completed-backfill.sh`. |\n| **K** | **`## Ship` and `## Shipped` are separate sections; Shipped caps at 10** | Sections become Backlog -\u003e Design -\u003e Plan -\u003e Build -\u003e Debug -\u003e Ship -\u003e Shipped. `## Ship` = in-flight ship runs, per-FID upsert. `## Shipped` = last **10** by `ts` desc, **fully regenerated from `completed.jsonl`** each fold — holds no state, prunes itself, no delete step. Resolves the \"board scope / drop-off policy\" open question. |\n| **L** | **`.bkit/stats.jsonl` unchanged — the `activity.jsonl` proposal is closed** | Recorded so it is not re-raised. Rejected because `outcome` rows drive the `med·5` report and are copied wholesale into the harvest store (adding consumer prose there changes what leaves a repo), and because `stats.jsonl` is the hot file `writeRollupShard` drains into archive shards — durable history must not sit in a compaction path. |\n\n**Row shape:**\n\n```jsonl\n{ \"ts\": 1753400000000, \"kind\": \"completed\", \"repo\": \"cbartens/bkit\", \"bkitVersion\": \"4.8.0\", \"workflow\": \"ship\", \"step\": \"ship-update-docs\", \"subagent\": \"bkit-ship-update-docs\", \"model\": \"claude-opus-5\", \"key\": \"380-roadmap-analysis-refresh\", \"category\": \"agentic\", \"summary\": \"constant roadmap analysis refresh\", \"description\": \"Automated docs/roadmap.md with a deterministic status tier refreshed at every workflow close and an analysis tier refreshed at ship.\", \"references\": [\"380\", \"docs/plans/202607/380-roadmap-analysis-refresh-plan.md\", \"PR-401\", \"a1b2c3d\"] }\n```\n\n### Two consequences worth flagging\n\n**1. DE-39 voids the auto-run rollout.** The migrator is deliberately **never callable from `bkit upgrade`** — explicit invocation only, enforced mechanically by `bkit-telemetry-migrate.integration.test.ts`. That kills re-review directive #3(d)'s \"wire the backfill to `bkit upgrade`\" trigger. Rollout instead: (a) an install advisory on the existing `PreflightFinding` channel while `docs/completed.md` still exists, naming `bkit telemetry migrate`; (b) the fold's exclude-completed step falls back to the legacy `completed.md` grep while the ledger is absent/empty and the `.md` still exists, logging a `[bkit-roadmap]` hint. Deleting the `.md` at migration ends the fallback permanently. Without both, every historically-shipped FID re-materialises as active on an unmigrated consumer's first board.\n\n**2. No template, no hash-gate — one fewer shipped file.** No `.jsonl` in the tree is install-seeded or listed in `.bkit/version` (`deferrals`/`failures`/`knowledge`/`decisions` are all born on first append), so `completed.jsonl` gets neither. The planned `.bkit/templates/docs/completed.jsonl` is dropped, and `.bkit/version`'s `docs/completed.md` entry is **removed** rather than regenerated.\n\n### Plan updates applied\n\n- **Design** — new `## Addendum 2` (§ H–L); Addendum 1 § B and § G and re-review directive #3 annotated as superseded in part.\n- **SP1** — Task 2 rewritten from \"backfill script + upgrade trigger\" to \"`bkit telemetry migrate` fifth pair + rollout advisory\"; Task 1 payload gains `category`/`description` and drops the template; Task 3 gains the `## Shipped` regenerate + transitional fallback; Task 5 gains the `completed.md` deletion and its seven reference sites (`.gitattributes`, `.agents/docs.md`, `.bkit/version`, `.bkit/README.md:321`, `.bkit/workflows.md` x4); `[MODIFY] completed.md` became `[DELETE]`; Supersession Inventory, Rollback, Documentation Updates, Merge Method updated; matrix row 9 retargeted to `bkit-telemetry-migrate.integration.test.ts`; **new matrix rows 23** (Shipped regenerates capped at 10 without disturbing the in-flight Ship row) **and 24** (fallback fires only pre-migration).\n- **SP2/SP3** — board-scope and `completed.md`-fate open questions marked RESOLVED; prerequisite names, rollback, knowledge/decision rows, Manual Verification Steps 1 and 4, and the `bkit install` hash-refresh task all updated for deletion-not-dual-write and migrate-not-backfill.\n- **Master** — directive 2 wording, atomicity note, and the chosen-approach line.\n\nUncommitted on `dev` so far — say the word and I will commit.\n\n### Still open\n\n- **Cadence numbers** — `N` = 5 ship-cycles, staleness = 14 days (proposed defaults, unconfirmed).\n- **Harvest scope** — `bkit harvest`/`bkit analysis` ingestion of `completed.jsonl` currently declared out of scope; count-only would be the natural future add.\n",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5076140795",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-25T01:47:44Z",
    "updated_at": "2026-07-25T01:47:44Z"
  },
  {
    "id": 5086064968,
    "body": "## Design revision 3 — the feature ledger is canonical; `roadmap.md` becomes a projection\n\nOwner direction across a working session. Captured as `## Addendum 3` (§ N–S) in the design doc, which **wins over Addendum 1, Addendum 2 and the body** where they conflict, and propagated through all four plan docs. This inverts the authority model a second time: Addendum 1 made `docs/roadmap.md` canonical; it is now a regenerable view of `docs/roadmap.jsonl`.\n\n| # | Decision | Effect |\n|---|---|---|\n| **N** | **`docs/roadmap.jsonl`** — `kind: \"feature\"`, `key` = FID, `status: DESIGNED \\| PLANNED \\| BUILT \\| DEBUGGED \\| SHIPPED \\| ABANDONED`, no `severity`, plus `category`/`summary`/`description`/`references`. Appended at **every** phase close, not just ship | Renames and widens Addendum 2's `completed.jsonl`. Each close is a same-`key` append; `fold()` last-wins gives the current phase, the row sequence is the history. build/debug reach `dev` via the Addendum 1 § C dev-lock write, now appending one `merge=union` line instead of upserting markdown |\n| **O** | **`docs/roadmap.md` is a pure projection** — fully regenerated from the ledger every fold | **Directive 1 (per-FID upsert) is VOID.** The KN-42 duplicate-collapse invariant is VOID with it. **Directive 4 (reconcile/recovery) is VOID** as a recovery path — a lost or deleted board is rebuilt exactly by re-running the fold; what survives is a drift *check* that warns when a live `feat/*` has no ledger row at all |\n| **P** | **Marker-pair invariant** — bkit rewrites only the bytes strictly between a `start`/`end` pair; everything outside any pair is consumer territory, wherever it sits | Replaces \"the region below the last machine marker\". Scratch notes above the board, between the two blocks, or at the bottom all survive. The self-heal path for mangled markers must repair them without swallowing adjacent text — the one regenerate path that can destroy consumer bytes, so it gets its own test row |\n| **Q** | **Cadence** — count distinct FIDs reaching `BUILT` **since the last cadence FIRE**; thresholds `bkit.roadmap.buildCycles` = 10 and `bkit.roadmap.stalenessDays` = 90 in the `package.json` manifest | Anchoring on the last FIRE is load-bearing: the analysis block refreshes at every ship close, so a refresh-anchored counter would reset every ship and never reach 10. Fire timestamp persists as a FID-free `ROADMAP_CADENCE_FIRE` counter row. Evaluated at ship close + `/bkit-roadmap`; a skipped ship delays a fire but never loses one, since the count accrues on builds. Firing rebaselines, so a 25-FID gap yields one fire |\n| **R** | **No consumer task detail in harvested ledgers** — `references: [\"{FID}\"]` on `outcome` rows is **rejected**, not deferred | `stats.jsonl` and `friction.jsonl` are `HARVEST_COPY_FILES`, copied wholesale into bkit's cross-repo store; they carry how bkit *performs*, never what a consumer is building. This reverses the \"optional follow-up\" in Addendum 2 § L |\n| **S** | **Bootstrap seed** — the on-disk scan runs **once**, not per close | With the board projecting purely from the ledger, in-flight work with no rows would be invisible until its next phase close. The migration run seeds one row per in-flight FID from `docs/plans/**` + folded `status.jsonl`, then the scan is never used again |\n\nAlso settled: **`ABANDONED` is appended by a human, or an agent on explicit human instruction** — never workflow-inferred — and hides the FID from the board entirely; `SHIPPED` needs no action, it ages off the last-10 window on its own. Both idioms get documented in `.bkit/jsonl.md` and the `roadmap.md` banner. **`bkit harvest` does not consume the ledger** (design § M) — not copied, not counted.\n\n### What this removes\n\nThe design's three most expensive mechanisms existed *because* `roadmap.md` was canonical and not re-derivable. An append-only, union-merged ledger that reaches `dev` at every close makes the board reproducible from scratch, so the per-FID upsert, the dedupe invariant that made `merge=union` safe on it, and the recovery pass all go. That is a net simplification of sub-plans 1 and 2, not added scope.\n\nIt also **supersedes a deferral we had already filed**: `380-persisted-frontier-snapshot-event-log-for-260` reads \"persist the roadmap fold's frontier snapshot (or a `roadmap.jsonl` event log) if #260 needs durable cross-tick sensing.\" That is now in scope and built — the deferral is closed in SP3 Task 14 with a #260 reference, so #260 inherits the sensing substrate.\n\n### Plan updates applied\n\n- **Design** — new `## Addendum 3` (§ N–S); Addendum 1 § A and re-review directives 1/2, and Addendum 2 § H/I/J/K/L, all annotated with supersession pointers.\n- **SP1** — Task 1 becomes the `kind: \"feature\"` codec + manifest keys; Task 2 becomes the migrate fifth pair **plus** the bootstrap seed; Task 3 becomes the projection fold carrying the marker-pair invariant; Task 5 asserts a `SHIPPED`-status row (presence alone must not pass, or a `BUILT` row greens a failed ship writer); Tasks 6/7 append status rows before regenerating. Matrix rows 1/2/3/6/8/9/10/19/21/23/24 rewritten, **new rows 24 (bootstrap seed) and 25 (marker repair does not swallow consumer text)**. Supersession inventory gains the two removed mechanisms.\n- **SP2** — Task 10 counts distinct `BUILT` FIDs since the last fire with manifest-driven thresholds; Task 12 rescoped from recovery to a drift check; matrix rows 14/16 rewritten; cadence open question RESOLVED.\n- **SP3** — decision + knowledge rows rewritten, Task 14 closes **both** deferrals, Manual Verification Step 4 checks the `SHIPPED`/`BUILT` gate distinction and scratchpad survival.\n- **Master** — directive summaries plus a pointer that § N–S must be read before executing any sub-plan.\n\nAll five docs prettier-clean, uncommitted on `dev`. Cadence numbers and harvest scope from the previous round are folded in here rather than posted separately.\n\n### Still open\n\n**Nothing blocking.** One item worth a decision before build: `ABANDONED` relies on someone remembering to append the row. When a tracker is wired there is a natural signal — an issue closed with no `SHIPPED` row — that the reverse-sync step could surface as a candidate rather than act on. Not planned; say the word if it should be.\n",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5086064968",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-27T00:10:10Z",
    "updated_at": "2026-07-27T00:10:10Z"
  },
  {
    "id": 5114449376,
    "body": "My recommendation: run sub-plan 1 on Claude/opus, then sub-plans 2 and 3 on opencode/glm-5.2 — those are mostly additive (a new prompt file, a new utility workflow, doc/ledger updates) with far less silent-failure surface. If you'd rather do the whole thing on GLM for cost, that's a reasonable call too; just treat a thin build-challenge report as a signal to re-run the challenge step on Claude rather than as a pass.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114449376",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T07:22:13Z",
    "updated_at": "2026-07-29T07:22:13Z"
  },
  {
    "id": 5114461965,
    "body": "## Build Workflow\n### Step 1 — Start Workflow\n[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114461965",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T07:23:43Z",
    "updated_at": "2026-07-29T07:23:43Z"
  },
  {
    "id": 5114475964,
    "body": "### Step 2 — Worktree Setup\n[cbartens/bkit/tree/feat/380-roadmap-analysis-refresh](https://github.com/cbartens/bkit/tree/feat/380-roadmap-analysis-refresh)\n[docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl](https://github.com/cbartens/bkit/blob/feat/380-roadmap-analysis-refresh/docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114475964",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T07:25:11Z",
    "updated_at": "2026-07-29T07:25:11Z"
  },
  {
    "id": 5114478882,
    "body": "### Step 3 — Branch Sync\n[cbartens/bkit/tree/feat/380-roadmap-analysis-refresh](https://github.com/cbartens/bkit/tree/feat/380-roadmap-analysis-refresh)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114478882",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T07:25:31Z",
    "updated_at": "2026-07-29T07:25:31Z"
  },
  {
    "id": 5114487283,
    "body": "### Step 4 — Install Skills",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114487283",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T07:26:26Z",
    "updated_at": "2026-07-29T07:26:26Z"
  },
  {
    "id": 5114863154,
    "body": "### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 1/3",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114863154",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T08:08:01Z",
    "updated_at": "2026-07-29T08:08:01Z"
  },
  {
    "id": 5114940501,
    "body": "### Step 6 — Plan Verify - Verdict: FAIL - Failures: 9 - Sub-plan: 1/3 - Attempt: 1",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5114940501",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T08:15:55Z",
    "updated_at": "2026-07-29T08:15:55Z"
  },
  {
    "id": 5115115417,
    "body": "### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/3 - Attempt: 1 - Strategy: STANDARD",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5115115417",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T08:33:27Z",
    "updated_at": "2026-07-29T08:33:27Z"
  },
  {
    "id": 5115281129,
    "body": "### Step 6 — Plan Verify - Verdict: FAIL - Failures: 9 - Sub-plan: 1/3 - Attempt: 2\n\nNote: branch had been cut from a stale `origin/dev` and was missing plan revision `4840de2b`. `origin/dev` merged in, Tasks 5–7 re-executed against the revised spec, then re-verified.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5115281129",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T08:48:18Z",
    "updated_at": "2026-07-29T08:48:18Z"
  },
  {
    "id": 5115351684,
    "body": "### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/3 - Attempt: 2 - Strategy: PIVOT",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5115351684",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T08:53:57Z",
    "updated_at": "2026-07-29T08:53:57Z"
  },
  {
    "id": 5115549072,
    "body": "### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 1/3 - Attempt: 3\n### Step 7 — Plan Gaps Remediate - Verdict: CONCERNS - Sub-plan: 1/3 - Attempt: 3 - Strategy: FINAL",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5115549072",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T09:11:24Z",
    "updated_at": "2026-07-29T09:11:24Z"
  },
  {
    "id": 5115614536,
    "body": "### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 1/3 - Attempt: 4\n\nSub-plan 1/3 (Foundation + Mechanical tier, WS-1 + WS-2) complete. Advancing to sub-plan 2/3.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5115614536",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T09:16:44Z",
    "updated_at": "2026-07-29T09:16:44Z"
  },
  {
    "id": 5115888200,
    "body": "### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 2/3",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5115888200",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T09:37:43Z",
    "updated_at": "2026-07-29T09:37:43Z"
  },
  {
    "id": 5116008765,
    "body": "### Step 6 — Plan Verify - Verdict: FAIL - Failures: 4 - Sub-plan: 2/3 - Attempt: 1\n\nBlocking: 6 real test failures (status-hole-detector, counter-prose-audit), invalid MCP tool names asserted by their own test, and an unexecutable reverse-sync write.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5116008765",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T09:46:44Z",
    "updated_at": "2026-07-29T09:46:44Z"
  },
  {
    "id": 5116275008,
    "body": "### Step 6 — Plan Verify - Verdict: FAIL - Failures: 1 - Sub-plan: 2/3 - Attempt: 2\n\nSuite is green again (2769 pass, 0 fail) and all four attempt-1 blockers confirmed closed. One new blocking gap in the reverse-sync remediation: it iterates every ledger FID rather than settled *drift*, passes a single-element `labels` array that would wipe co-existing labels, and oscillates `SHIPPED`→`bkit:ship` against Step 13's `bkit:merged`.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5116275008",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T10:09:47Z",
    "updated_at": "2026-07-29T10:09:47Z"
  },
  {
    "id": 5116458852,
    "body": "### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 2/3 - Attempt: 2 - Strategy: PIVOT",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5116458852",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T10:24:11Z",
    "updated_at": "2026-07-29T10:24:11Z"
  },
  {
    "id": 5116667981,
    "body": "### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 2/3 - Attempt: 3\n### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 2/3 - Attempt: 3 - Strategy: FINAL\n\nReverse-sync blocker confirmed closed by mutation testing (5 reintroduced defects, each caught). Two MEDIUM residuals closed: `DEBUGGED`→`bkit:debug` additive-label collapse, and per-FID `git ls-remote` (50+ round trips) reduced to one bounded remote read.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5116667981",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T10:43:06Z",
    "updated_at": "2026-07-29T10:43:06Z"
  },
  {
    "id": 5116741430,
    "body": "### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 2/3 - Attempt: 4\n\nSub-plan 2/3 (Analysis + Cadence/Sync/Reconcile, WS-3 + WS-4) complete. Suite green at default timeout (2773 pass, 0 fail) — the earlier timeout failures were confirmed a machine-load artifact. Advancing to sub-plan 3/3.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5116741430",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T10:50:19Z",
    "updated_at": "2026-07-29T10:50:19Z"
  },
  {
    "id": 5116977461,
    "body": "### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 3/3\n\nBatched mirror regen done (`bkit check` 0 writes), `slop:delta` back to net 0/0.00, and the two carried `docs/failures.jsonl` items closed.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5116977461",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T11:14:08Z",
    "updated_at": "2026-07-29T11:14:08Z"
  },
  {
    "id": 5117094920,
    "body": "### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 2 - Sub-plan: 3/3 - Attempt: 1\n\nMirror regen verified (all six ship mirrors clean of `docs/completed.md`, `bkit check` 0 writes) and `slop:delta` independently confirmed net 0. Two gaps: matrix row 18 has no covering test, and `bkit telemetry migrate` was inconclusive in a scratch consumer (exit 0, no output, no ledger written).",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5117094920",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T11:25:34Z",
    "updated_at": "2026-07-29T11:25:34Z"
  },
  {
    "id": 5117277350,
    "body": "### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 3/3 - Attempt: 1 - Strategy: STANDARD\n\nGAP-2 turned out to be a real consumer-facing defect, not a bad invocation: `bkit telemetry migrate` gated `knowledge`/`decisions` on `!mdExists \u0026\u0026 jsonlNonEmpty` while the other three pairs gated on `!mdExists` alone, so any consumer without `docs/knowledge.md`/`docs/decisions.md` aborted the **entire** migrate run — including the `completed.md → roadmap.jsonl` port. Reproduced via a packed-tarball scratch consumer, fixed, regression test added.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5117277350",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T11:44:34Z",
    "updated_at": "2026-07-29T11:44:34Z"
  },
  {
    "id": 5117453415,
    "body": "### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 3/3 - Attempt: 3\n\nAll three sub-plans verified PASS. Gates green: 2780 tests, bats 189/189, typecheck, format:check, `slop:delta` net 0, `bkit check` 0 writes, `check:dist` clean.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5117453415",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T12:02:41Z",
    "updated_at": "2026-07-29T12:02:41Z"
  },
  {
    "id": 5117594673,
    "body": "### Step 8 — Plan Verify Holistic - Verdict: FAIL - Failures: 5",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5117594673",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T12:14:56Z",
    "updated_at": "2026-07-29T12:14:56Z"
  },
  {
    "id": 5117601234,
    "body": "### Workflow Failure\nStep: 8 — Plan Verify Holistic; Sub-step: 6\nError: `HOLISTIC_VERDICT = FAIL` (5 failures) — routed to Failure Path per Step 8 routing.\n\nAll three sub-plans verified PASS in isolation; every gap is at a cross-sub-plan seam:\n\n1. **Ship close never regenerates the board.** `.bkit/workflows/bkit-ship.md` has zero `bkit_roadmap_fold` call sites (design/plan/build/debug and `/bkit-roadmap` each have them). Sub-plan 1 handed the ship regenerate to sub-plans 2/3; 2 delivered the Step 10 leaf and cadence, 3 delivered the utility, and nobody delivered the regenerate. The `SHIPPED` row lands and the verdict greens, but the FID stays under Build/Debug on the board until an unrelated FID's close runs a fold. Breaks master SC#1 for ship.\n2. **`### Ship` (in flight) is unpopulatable** and leaks plan-internal text into the consumer's `docs/roadmap.md` (`bkit-roadmap-fold.sh:180`) — the six-state ladder has no in-flight-ship state.\n3. **`/bkit-roadmap` drops `ROADMAP_SCAN_COVERAGE`** — the `counterSource: \"shell-bus\"` decision put the derivation in the caller's shell, and only `bkit-ship.md` implements it.\n4. **`.bkit/.roadmap-refresh-on-demand.md`** is documented as gitignored but is not (`git check-ignore` exits 1); its two sibling scratch paths were added to `.gitignore` + template.\n5. **Committed `docs/roadmap.md` is stale** — 4-column, no Ship section, while the shipped fold renders 5 columns with one.\n\nSeams that hold: one fold signature/arg order across all five callers, one status ladder, matching marker strings, matching `ROADMAP_SCAN_COVERAGE` producer/consumer format, terminal-aware `SHIPPED`→`bkit:merged` with `DEBUGGED` correctly excluded, all four STRAY allowlists widened, complete `completed.md` removal.\n\nGates are green: 2780 tests, bats 189/189, typecheck, `check:dist`, `slop:delta` net 0, `bkit check` 0 writes, `lint:prose` (1 pre-existing warning).\n\nWork is committed on `feat/380-roadmap-analysis-refresh` (not pushed, no PR). Artifact: `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5117601234",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-29T12:15:28Z",
    "updated_at": "2026-07-29T12:15:28Z"
  },
  {
    "id": 5130627086,
    "body": "## Debug Workflow\n### Step 1 — Start Workflow - Mode: NORMAL - Push: LOCAL - Attempt: 1\n[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5130627086",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-30T12:09:21Z",
    "updated_at": "2026-07-30T12:09:21Z"
  },
  {
    "id": 5130638881,
    "body": "### Workflow Failure\nStep: 2 — Worktree Setup; Sub-step: 3\nError: Rebase of `feat/380-roadmap-analysis-refresh` onto `origin/dev` (33 commits) hit conflicts in more than `pnpm-lock.yaml`, so Step 2 wrote the `.rebase-failed` sentinel and routed to the Failure Path. No tests ran; no diagnosis was produced.\nStderr:\n```\nRebasing (10/33)\nAuto-merging .bkit/src/bkit-manifest.test.ts\nCONFLICT (content): Merge conflict in .bkit/src/bkit-manifest.test.ts\nAuto-merging .bkit/workflows.md\nCONFLICT (content): Merge conflict in .bkit/workflows.md\nCONFLICT (modify/delete): docs/completed.md deleted in HEAD and modified in refs/rewritten/onto.\n  Version refs/rewritten/onto of docs/completed.md left in tree.\nRecorded preimage for '.bkit/src/bkit-manifest.test.ts'\nRecorded preimage for '.bkit/workflows.md'\nCould not apply 2c7363b0... onto # Merge remote-tracking branch 'origin/dev' into feat/380-roadmap-analysis-refresh\nRebase conflict\n```\nRebase aborted; branch left at its pre-rebase HEAD (`9ebd3361`). Lock released.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5130638881",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-30T12:10:39Z",
    "updated_at": "2026-07-30T12:10:39Z"
  },
  {
    "id": 5130735399,
    "body": "### Workflow Handover\n[debug-handover.md](https://github.com/cbartens/bkit/blob/feat/380-roadmap-analysis-refresh/docs/plans/202607/logs/380-roadmap-analysis-refresh/debug-handover.md)\n\n# Debug Abort Handover\n\n## The Short Version\n\nThe automated \"roadmap board\" feature (#380) is code-complete and mostly working, but the last checkpoint found 5 small gaps where different parts of the feature don't quite line up with each other. Before anyone could look at those gaps, today's automated attempt to sync the work branch with the team's shared branch hit a scary-looking but routine conflict (3 files edited on both sides) and stopped itself rather than guess — nothing is broken or lost, it just needs a person (or the next automated run) to say which side wins for each of the 3 files, then go fix the 5 gaps.\n\n## What's Actually Happening\n\n**Symptom:** Debug Step 2 (Worktree Setup) aborted with a `.rebase-failed` sentinel; the workflow routed to the Failure Path before any test or diagnosis ran.\n\n**Trigger:** The feature branch (`feat/380-roadmap-analysis-refresh`) is 31 commits ahead of the merge-base (`b0d5b150`) — genuinely #380's own work — and 7 commits behind `origin/dev` (33 commits replayed during the rebase attempt, since a rebase replays ahead-commits on top of the new base, not just the raw behind-count). Both figures are real; this is expected churn on a long-lived branch, not a bug, and not the \"stale worktree base\" corruption case (ruled out — see Persistent Errors § 3).\n\n**Proximate cause:** `git rebase origin/dev` hit content/modify-delete conflicts beyond the routine `pnpm-lock.yaml` case the workflow auto-resolves, in 3 files:\n\n- `.bkit/src/bkit-manifest.test.ts` — content conflict (both sides edited the same lines)\n- `.bkit/workflows.md` — content conflict (both sides edited the same lines)\n- `docs/completed.md` — modify/delete: the feature branch DELETED this file (via #380's own migration to `docs/roadmap.jsonl`, a load-bearing part of the design), while `dev` MODIFIED it (some other change landed on `docs/completed.md` after this branch forked, before #380's own migration removed it there too, presumably via a later ship).\n\n**Root cause (design fragility, not a defect):** None — this is the normal shape of a long-running branch (31 commits, spanning multiple sub-plans and several days) rebasing onto a shared branch that has also moved. The workflow's automated conflict-resolution only covers the single known-safe case (`pnpm-lock.yaml`); anything else is intentionally routed to a human/next-attempt decision rather than guessed.\n\n**Contributing factors:** `docs/completed.md`'s modify/delete conflict is a direct consequence of #380's own scope — it is the file this feature deletes as part of migrating to `docs/roadmap.jsonl`. If `dev` shipped an unrelated `docs/completed.md` edit (or another feature's own migration-adjacent touch) between when this branch forked and now, that edit needs to be reconciled against the deletion, not blindly discarded.\n\nThe rebase was aborted cleanly; the branch sits at its pre-rebase HEAD `9ebd3361` — no commits were lost, nothing was force-pushed, working tree is clean at that point.\n\n## Rot Signals\n\nNone. No diagnose attempt ran this cycle (aborted at Worktree Setup, before Step 3), so no rot-signal extraction was possible. `.agents/docs.md` and `docs/knowledge.jsonl` were consulted for handover-writing only; no rot signal was raised against them.\n\n## Out-of-Scope Recommendations\n\nNone. No diagnose attempt ran this cycle, so none were produced.\n\n## Attempt History\n\n\u003c!-- prettier-ignore --\u003e\n| Strategy | What was tried | Why it failed |\n| --- | --- | --- |\n| n/a (Debug Step 2, DEBUG_ATTEMPT 1) | Worktree Setup rebased `feat/380-roadmap-analysis-refresh` (31 commits ahead) onto `origin/dev` (33 commits replayed) to pick up shared-branch changes before running tests/diagnosis. | Conflicts beyond the auto-resolved `pnpm-lock.yaml` case appeared in 3 files (2 content, 1 modify/delete) — the workflow does not attempt to resolve these itself and correctly routed to the Failure Path. No tests ran, no `debug-diagnose` attempt was made. |\n\nThe unresolved **build** failure this debug run was meant to address (from the prior `build` workflow, `build-plan-verify-holistic`, attempt 1, `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`) is a separate, later concern — see Persistent Errors below. It was never reached this cycle.\n\n## Verified Resolutions (DO NOT ROLL BACK)\n\nNone from this cycle — no remediation was attempted. Everything landed by the prior `build` workflow (all 3 sub-plans PASS per their own verify logs: `build-plan-verify-1-4.md`, `-2-4.md`, `-3-3.md`) remains as committed on the branch at `9ebd3361`; do not revert any of that work while resolving the rebase.\n\n## Persistent Errors\n\n**1. Rebase conflict (this cycle's abort cause) — NOT YET RESOLVED:**\n\n- `.bkit/src/bkit-manifest.test.ts` — content conflict.\n- `.bkit/workflows.md` — content conflict.\n- `docs/completed.md` — modify/delete (deleted on `feat/380-roadmap-analysis-refresh`, modified on `origin/dev`).\n- Event sequence: `git fetch origin dev` → `git rebase origin/dev` (auto-resolve `pnpm-lock.yaml` only) → conflict on the 3 files above → `git rebase --abort` → `.rebase-failed` sentinel written → workflow routed to Failure Path. Branch HEAD is unmoved at `9ebd3361`; no force-push occurred.\n\n**2. `build-plan-verify-holistic` FAIL (5 integration gaps) — carried over, NOT YET DIAGNOSED this cycle:**\n\nFull detail in `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md`. Summary of the 5 gaps (all cross-sub-plan, none catchable by a per-sub-plan verify pass):\n\n1. `bkit-ship.md` never calls `bkit_roadmap_fold` — the board still shows a shipped FID under Build/Debug until some unrelated FID's design/plan/build/debug close happens to regenerate it. Sub-plan 1 explicitly deferred this to sub-plans 2/3; neither picked it up.\n2. `bkit-roadmap-fold.sh:180-181` renders a literal `### Ship _(in flight — populated by ship-close wiring, sub-plans 2/3)_` plus hardcoded `_(none)_` into every consumer's `docs/roadmap.md` — bkit-internal sub-plan numbering leaking into shipped surface, and the six-state ladder has no in-flight-ship state to ever populate that section.\n3. `/bkit-roadmap` (`bkit-roadmap.md`) never appends a `ROADMAP_SCAN_COVERAGE` counter row — the `shell-bus` derivation decision was implemented in `bkit-ship.md` only, not the on-demand path.\n4. `.bkit/.roadmap-refresh-on-demand.md` is called \"gitignored\" in the shipped prose but is absent from both `.gitignore` and `.bkit/templates/gitignore` (unlike its two sibling `#380` scratch paths) — a stray report can get swept into a build/debug `git add -A` close commit.\n5. Committed `docs/roadmap.md` (4-column, no `### Ship` section) does not match the current `bkit-roadmap-fold.sh` output (5-column, with `### Ship`) — a stale Task 15 dogfood artifact.\n\nGate suite at that verify pass was fully green (`pnpm test`, `pnpm test:bats`, `pnpm typecheck`, `pnpm check:dist`, `pnpm slop:delta`, `pnpm bkit check`, `pnpm lint:prose`, `pnpm format:check` — see the log for exact output). The 5 gaps are integration-only defects, not implementation breakage.\n\n**3. Large Diff Guard data (confirmed by the coordinator; this session had no shell/Bash tool of its own):**\n\nBranch state: HEAD = `9ebd3361` (unmoved, as assumed above). Working tree has exactly 5 entries, all expected from this handover's own writes: modified `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl`, plus untracked `debug-handover.md`. Merge-base with `origin/dev` = `b0d5b150`. Full `git diff origin/dev..HEAD` = 20835 lines — per-file budget mode applies. Top 20 files by lines changed (`--numstat`, added+deleted):\n\n\u003c!-- prettier-ignore --\u003e\n| Lines | File |\n| --- | --- |\n| 1757 | `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-input.md` |\n| 1577 | `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-input.md` |\n| 753 | `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-input.md` |\n| 641 | `.bkit/src/bkit-cloud-ctx-step.integration.test.ts` |\n| 632 | `.github/workflows/bkit-cloud.yml` |\n| 632 | `.bkit/templates/.github/workflows/bkit-cloud.yml` |\n| 486 | `.bkit/src/bkit-telemetry-migrate.ts` |\n| 427 | `dist/bkit-telemetry-migrate.js` |\n| 314 | `.bkit/src/bkit-roadmap-sync.integration.test.ts` |\n| 264 | `.bkit/version` |\n| 264 | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |\n| 258 | `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` |\n| 229 | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |\n| 205 | `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` |\n| 205 | `.bkit/scripts/bkit-roadmap-fold.sh` |\n| 200 | `.bkit/workflows/bkit-ship.md` |\n| 199 | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |\n| 190 | `docs/completed.md` |\n| 186 | `.opencode/commands/bkit-ship.md` |\n| 186 | `.cursor/commands/bkit-ship.md` |\n\n**Verified: this is an ordinary behind-by-7 branch, NOT the \"stale `origin/dev` ref\" corruption case.** Measured directly: the branch is 31 commits ahead of the merge-base AND 7 commits behind `origin/dev`; both figures are real, and the 31 genuinely are #380's own work. `git diff b0d5b150..HEAD --shortstat` (merge-base baseline — #380's real change) = **123 files changed, 7968 insertions(+), 454 deletions(-)**. `git diff origin/dev..HEAD --shortstat` = **187 files changed, 8594 insertions(+), 8330 deletions(-)**. The `363-widen-bkit-cloud-trigger` artifacts (`ship-input.md`, `build-input.md`) do show as pure deletions in the `origin/dev..HEAD` diff, but the reason is benign: those files exist on `origin/dev` (landed via 7 commits this branch hasn't rebased in yet) and simply aren't on this branch, because the branch is behind, not because #380 deletes them or was cut from a stale ref. None of the 7 dev-only commits (`702426ae`, `fe289e67`, `fbd46ad0`, `a62dc54d`, `b8bf1bfd`, `ded52461`, `a924c9a4`) is an ancestor of HEAD. **Consequence for anyone sizing #380: `origin/dev..HEAD` overcounts by roughly 2.5x (20835 vs. the real 8422 merge-base lines) because it also carries the diff of everything dev gained in those 7 commits.** The honest baseline for reviewing #380 is `git diff b0d5b150..HEAD` (the merge-base), or `origin/dev..HEAD` re-taken only AFTER the rebase actually lands. The Step 2 rebase already attempted is exactly the correct fix for this — it must be completed, not worked around.\n\nDev-side history of the 3 conflicting files since merge-base `b0d5b150` (each has exactly one dev-side commit, all inside the 7-commit behind range):\n\n\u003c!-- prettier-ignore --\u003e\n| File | Dev commit | Subject |\n| --- | --- | --- |\n| `.bkit/workflows.md` | `fbd46ad0` | fix(363-widen-bkit-cloud-trigger): emit the auto-route marker; close challenge F1-F11 (#407) |\n| `.bkit/src/bkit-manifest.test.ts` | `a62dc54d` | fix(lint-prose): stop the prose gate silently self-disabling in worktrees |\n| `docs/completed.md` | `fe289e67` | docs(363-widen-bkit-cloud-trigger): ship DONE bkit [skip ci] |\n\nThis resolves the open question from the earlier draft of this section: `docs/completed.md`'s dev-side edit is FID `363`'s ship-DONE completion row (190 lines changed) — not an unrelated migration touch. See the sharpened resolution rule below; carrying that row forward as a `docs/roadmap.jsonl` entry before accepting the deletion is now a **required** step, not merely something to check.\n\n## Recommended Next Steps\n\n**Option A — Resolve the 3 rebase conflicts by hand, then re-run debug (recommended).**\n✅ FIXES: unblocks Debug Step 2 so tests + diagnosis of the 5 holistic gaps can finally run.\n❌ DOES NOT FIX: the 5 holistic-verify integration gaps themselves — those still need a real `debug-diagnose` + `debug-failure-remediate` pass after the rebase lands.\n⚠️ COST: ~15-30 minutes of careful manual conflict resolution (2 content conflicts need line-level review of both sides; the `docs/completed.md` modify/delete needs a judgment call — see resolution rule below); low risk since nothing is force-pushed until resolution is verified.\n\n**Option B — Skip the rebase for this debug cycle (proceed against the branch's current base) and defer sync to ship.**\n✅ FIXES: nothing blocks Debug Step 3+ immediately; the 5 holistic gaps could be diagnosed sooner.\n❌ DOES NOT FIX: `origin/dev` and the feature branch keep diverging, so the eventual ship-time integration/rebase gets larger and riskier the longer this is deferred; also whatever `dev` changed in `.bkit/workflows.md` / `bkit-manifest.test.ts` / `docs/completed.md` stays un-integrated into this branch's own gap-fixing work, which is a plausible source of new conflicts later.\n⚠️ COST: requires whatever mechanism this workflow has (if any) to explicitly opt out of the mandatory rebase step — may not be a supported path at all; treat as a fallback only if Option A is blocked.\n\n**Option C — Re-run Debug Step 2 unattended and let the workflow retry the rebase.**\n✅ FIXES: nothing — the conflict is deterministic (same 3 files, same content) and will reproduce identically on a bare retry with no `origin/dev` movement in between.\n❌ DOES NOT FIX: anything; wastes a debug attempt.\n⚠️ COST: burns `DEBUG_ATTEMPT` budget for zero progress; only sensible if `origin/dev` has since moved further in a way that might resolve the conflict (unlikely for a modify/delete).\n\n## Recommended Path\n\n**Option A.** Resolve the 3 conflicts by hand using the repo's own doctrine (below), then let debug proceed from Step 2. This is the only option that makes forward progress on both the rebase AND the 5 real bugs waiting behind it, and the conflict set is small (3 files) and well-understood — none of them are surprising given #380's own scope (it deletes `docs/completed.md`) and the repo's shared-doctrine files (`.bkit/workflows.md`) are exactly the kind of file the repo's own conflict-resolution rule already covers.\n\n**Per-file resolution rule** (per `.agents/rules.md` and repo doctrine — take `dev` for shared doctrine files under `.bkit/workflows`/`.bkit/prompts`/`.agents/rules.md`; take the feature branch for its own code and plan artifacts):\n\n- **`.bkit/workflows.md`** — shared doctrine file under `.bkit/workflows`. Confirmed: dev's side is `fbd46ad0` \"fix(363-widen-bkit-cloud-trigger): emit the auto-route marker; close challenge F1-F11 (#407)\" — this is exactly the kind of shared-doctrine edit the carve-out means to preserve, and it must survive. But this file is also one #380 itself edits (per the plan's own Sub-Plan 1/2/3 task lists — the roadmap-status wiring, `bkit_roadmap_fold` call sites, Telemetry Ledgers row for `docs/roadmap.jsonl`). This is NOT a pure \"take dev\" case — do a real three-way merge: start from `dev`'s side (keeping `fbd46ad0`'s auto-route-marker doctrine intact), then re-apply #380's specific edits on top (`git log --oneline feat/380-roadmap-analysis-refresh -- .bkit/workflows.md` to see exactly what #380 changed) — neither side's edit should be dropped.\n- **`.bkit/src/bkit-manifest.test.ts`** — a test file, not itself named in the shared-doctrine carve-out (`.bkit/workflows`/`.bkit/prompts`/`.agents/rules.md`), so it falls under \"feature branch for its own code\" for #380's own assertions (e.g. `docs/completed.md` removed from the manifest, `docs/roadmap.jsonl` merge-strategy entries) — but dev's side is confirmed as `a62dc54d` \"fix(lint-prose): stop the prose gate silently self-disabling in worktrees\", a real bug fix unrelated to #380 that must be re-applied, not discarded. Resolution: keep #380's manifest assertions from the feature branch AND re-apply `a62dc54d`'s prose-gate/worktree-detection fix from dev on top — both sides are required, this is an additive merge, not a pick-one.\n- **`docs/completed.md`** — modify/delete. Confirmed: dev's side is `fe289e67` \"docs(363-widen-bkit-cloud-trigger): ship DONE bkit [skip ci]\" — FID `363`'s own ship-DONE completion row (190 lines changed), not incidental churn. #380 deletes this file as part of its migration to `docs/roadmap.jsonl` (Directive 2, sub-plan 1 Tasks 1/2/5, confirmed intact in the plan file). **Required resolution, not optional:** before accepting the deletion, carry FID `363`'s completion forward as a `docs/roadmap.jsonl` row (`kind:\"feature\"`, `key:\"363-widen-bkit-cloud-trigger\"` or its minted FID slug, `status:\"SHIPPED\"`) using `fe289e67`'s diff (`git show fe289e67 -- docs/completed.md`) as the source content, in the same shape the migration's own bootstrap-seed logic produces for other legacy rows (see `.bkit/src/bkit-telemetry-migrate.ts`, and the sibling `380-bootstrap-seed-key-namespace-mismatch...` OPEN deferral in `docs/deferrals.jsonl` for the seed-key convention). Only once that row is appended should `docs/completed.md`'s deletion be accepted for the merge.\n\nThis is not a corruption case needing a workaround — the branch is simply 7 commits behind `origin/dev`, and the Step 2 rebase already attempted is exactly the correct fix. Proceed straight to the per-file resolution rules above; no separate stale-base check is needed.\n\nAfter resolving, verify with a fresh `git status` and `git diff b0d5b150..HEAD --shortstat` (the honest #380-only baseline — do not re-judge change size from `origin/dev..HEAD` until AFTER the rebase lands, since pre-rebase that diff still overcounts by the 7-commits-behind delta) before continuing debug, and let Debug Step 2 finish (push if `PUSH_MODE` requires it) before proceeding to Step 3 (tests) and `debug-diagnose` against the 5 holistic gaps in Persistent Errors.\n\n## Reference Docs\n\n- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` — full workflow history (design DONE, plan DONE, build FAILED at `build-plan-verify-holistic` attempt 1 with 5 failures, this debug run FAILED at Step 2).\n- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` — the 5 integration gaps this debug cycle exists to fix; not yet reached.\n- `docs/plans/202607/380-roadmap-analysis-refresh-plan.md` — master plan index; confirms `docs/completed.md` deletion is intentional #380 scope (Directive 2).\n- No `debug-*.md` diagnose artifacts exist for this attempt — none were produced (aborted before Step 3).\n- `docs/failures.jsonl` / `docs/deferrals.jsonl` — new rows appended by this handover (see below) recording the rebase-conflict block and the still-open 5 holistic gaps.\n- `.agents/rules.md` — source of the shared-doctrine-vs-feature-branch conflict-resolution rule applied above.",
    "html_url": "https://github.com/cbartens/bkit/issues/380#issuecomment-5130735399",
    "user": {
      "login": "cbartens",
      "id": 1326912,
      "profile_url": "https://github.com/cbartens",
      "avatar_url": "https://avatars.githubusercontent.com/u/1326912?v=4"
    },
    "author_association": "OWNER",
    "reactions": {
      "total_count": 0,
      "+1": 0,
      "-1": 0,
      "laugh": 0,
      "confused": 0,
      "heart": 0,
      "hooray": 0,
      "rocket": 0,
      "eyes": 0
    },
    "created_at": "2026-07-30T12:20:46Z",
    "updated_at": "2026-07-30T12:20:46Z"
  }
]
````

## Plan

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
