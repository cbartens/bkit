# Design Input — 380-roadmap-analysis-refresh

## Session Prompt

Help me think through issue 380, document thoughts in comments to make the issue better, what is best next step? bkit design or plan?

Follow-up instruction: run `/bkit-design issue #380`.

## Issue #380 — Constant roadmap analysis refresh

**State:** open
**Labels:** enhancement, bkit:design
**Milestone:** Workflow Optimisation
**URL:** https://github.com/cbartens/bkit/issues/380

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

#### Comment 1 (cbartens, 2026-07-22T22:43:33Z)

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

#### Comment 2 (cbartens, 2026-07-22T22:47:22Z)

> Where does the roadmap live?

Must be docs/roadmap.md

> Trigger cadence. "At every workflow close" = a new close-step subagent in design/plan/build/debug/ship, each an opus-scale "read whole roadmap + all tracker issues" pass — expensive/slow, and design/plan closes merge nothing (roadmap barely moves, maybe just a status annotation). Options: (a) every close as written; (b) ship-close only + an on-demand /bkit-roadmap utility; (c) event-driven + heartbeat (mirrors #260's tick). Lean (b) for v1.

yes "(b) ship-close only + an on-demand /bkit-roadmap utility" but maybe add something simpler as in mechanical roadmap.md update in each workflow to move issues from design -> plan -> build -> debug -> ship similar to tracker updates and analysis only on ship, that way other agents can see status in roadmap.md

## Resolved decisions carried into brainstorm/design

- **Roadmap location:** `docs/roadmap.md` (confirmed, file not issue).
- **Two-tier update model (confirmed by issue owner):**
  - **Mechanical status update** — every workflow close (design/plan/build/debug/ship) writes/updates this issue's row/section in `docs/roadmap.md` to reflect current phase (mirrors the `bkit:*` label transitions already done via tracker MCP). Cheap, deterministic, no LLM analysis required — keeps `docs/roadmap.md` a live phase-status board other agents can read.
  - **Full analysis refresh** — runs ONLY on `ship`-close (or on-demand via a new `/bkit-roadmap` utility). This is the opus-scale pass: read `docs/roadmap.md` + tracker issues + (periodically) `docs/deferrals.jsonl` / `docs/failures.jsonl` / #80-style audits, and rewrite the "best next step" + prompt-suggestion sections.
- **Relationship to #260:** design should treat this as (or explicitly justify not treating this as) the sensing primitive #260's tick would consume — avoid building two roadmap-sensing engines.
- **Still open for design to resolve:** ledger/audit cadence (concrete trigger, not "every now and then"); prompt-suggestion content model (stack/model/IDE-agnostic, reuse `plan-complexity-check` + `design→organise` grouping logic); exact `docs/roadmap.md` schema/format; whether mechanical status updates are a new orchestrator step or folded into the existing tracker-label-update step in each workflow.
