# Related Issues — 380-roadmap-analysis-refresh

> Note: `mcp__github__search_issues` returned 0 hits for multiple keyword queries (`roadmap milestone orchestrator audit ledger`, `roadmap`) against this repo despite known matches existing — verified via `gh search issues` CLI as a backup per `.agents/rules.md` ("Tracker MCP: ... use CLI/HTTP shell-outs as backup only"). Related issues below were found via `gh search issues "roadmap" --repo cbartens/bkit` and fetched in full via `mcp__github__issue_read`.

## #214 — bkit roadmap (open)

Living sequencing reference for open bkit work. Update as issues land or priorities shift.

## Shipped

- **#202** — inline tracker-block model (github/linear/true/false markers inline at call sites; drop `loadTrackers`) ✓
- **#160** — centralise install code + payload into `.bkit/` root ✓
- **#209** — workflow state model: squash-to-dev + persistent `feat/{FID}`, NDJSON `status.jsonl` ✓
- **#203** — CI verdicts: gether-403 `bkit-decide`/`bkit-gate` model generalised into the CI template ✓
- **#135** — bounded GitHub issue-scan enrichment in design/debug workflows ✓
- **#143** — real-world testing for debug (repro-first + empirical-verify gates, soak mode) ✓
- **#119** — cloud phase-routed dispatch ✓

## Active sequence

### Now: #261 — CI-trigger gate (`[skip ci]` HEAD → vacuously-green PR)

Design + plan complete and marked **DONE** (`docs/plans/202606/261-ci-trigger-gate-{design,plan}.md`). Build-ready — straight to build, no further planning. Adds a post-push **CI-Dispatch gate** that confirms a run was dispatched for the exact pushed HEAD (additive `ciDispatch` field on #209's `step-done` record), else self-heals once or terminates with a named verdict (`dispatched` / `self-healed` / `no-ci` / `unresolved`).

### Deferred — testing-doctrine chain (gated on consumer re-review)

Sequencing decided 2026-06-16: **#270 → #263 → #265**. The doctrine is expected to shift after re-reading the consumer repos, so #263 is held rather than landed now.

- **#270** — research: monorepo CI & testing-tier organisation vs bkit doctrine. _Next action:_ re-review all changes made in the **gether + fraser** consumer repos, then finalise the doctrine. Research itself has landed (`docs/plans/202606/research-ci-testing-tiers.md`, on dev); the consumer re-read is still open.
- **#263** — hollow-boundary test doctrine + `boundary/type-suppression` slop gate. Implementation is **drafted and parked on branch `wip/263-hollow-boundary`** (integration test passes) — **NOT landed**. Revisit after #270 settles, since the doctrine will likely change.
- **#265** — split `--tooling` into stack-agnostic `--ci` + opt-in `--typescript`. **Depends on #263** (re-homes #263's TS-specific slop rule into the `--typescript` profile). No design/plan yet → needs a full **design → plan → build** cycle once #263 is final.

## Parking lot / not yet sequenced

- **#133** — in-repo source of truth (multi-dev artifact storage vs externalized)
- **#99** — bkit workflow friction optimisation

## Milestones

| Milestone                   | Issues                                            |
| --------------------------- | ------------------------------------------------- |
| Initial Version             | #160 ✓                                            |
| Workflow Agent Optimisation | #209 ✓, #203 ✓, #135 ✓, #143 ✓, #119 ✓, #133, #99 |
| CI-trigger integrity        | #261                                              |
| Testing doctrine            | #270, #263, #265                                  |

**No comments.**

---

## #260 — Milestone Orchestrator autonomous PM loop that drives workstreams (open)

**Directly relevant — comment `#260-4724691125` explicitly names #380's exact requirement** ("Should also auto update some roadmap issue or roadmap.md to always suggest best next issue"), predating #380 by ~5 weeks. #380 is the extraction/realisation of this sub-requirement.

# Milestone Orchestrator — an autonomous PM loop that drives a milestone's workstream DAG to done

> **Consolidated design** (folds in the original body + Addenda 1–2; those comments remain as history). Priority tags: **[MVP]** = must-add before first ship (correctness/safety); **[MVP+1]** = next.

## Problem

bkit already delivers **per-issue** autonomy: `design → plan → build → ship` chains itself, and `bkit-cloud` routes on CI conclusion (success → ship, failure → debug). What's missing is the **project-level coordinator** — the human still manually kicks off the next issue, re-checks status, and sequences workstreams, even though no code is hand-written.

Goal: an orchestrator that **plans, sequences, and advances** a unit of work with minimal human check-ins, escalating only on genuine exceptions. The human shifts from _"kick off every step"_ → _"approve the plan + handle the exceptions."_

## Scope — a **milestone**, not a whole project

Bound the orchestrator to one GitHub **Milestone**:

- **Free termination condition** — milestone % complete answers _"done?"_ A whole-project loop never cleanly terminates.
- **Fixed, analyzable DAG** — workstreams are decided once (by `design → organise`, which emits dependency-annotated workstreams). The loop **walks a known graph** instead of discovering a drifting one.
- **Bounded blast radius + cost** — a few-to-dozen issues, a natural stop, a cappable budget.
- **Matches bkit's grain** — _"run this design's workstreams to done"_ is the shape of the phase chain.

> **Orchestrator's job: drive this milestone's workstream DAG from open → done, escalating on exceptions.**

## What already exists (a thin layer, not a moonshot)

- **Decomposition** → `design → organise` produces dependency-annotated workstreams.
- **Event routing** → `bkit-cloud.yml` fires phases on `workflow_run` conclusion.
- **State** → the GitHub Project board + `bkit:` labels are the state machine.

Missing: the **project-level DAG state + a dispatcher that advances it on merge events**, with dependency/conflict gating and human escalation.

---

## Execution model — event-driven, not a busy-poll

Primary trigger = **events** (PR merged to `dev`, CI concluded, debug loop exhausted) — the substrate `bkit-cloud` already routes on, lifted to _"tick the milestone."_ A **~15–30 min heartbeat** runs only as a safety net (detect stalls: a workflow that died without emitting its conclusion, an issue stuck in-review) and escalate. Polling every 30 min as the _engine_ is both wasteful and laggy.

### Anatomy of one tick (cheap, idempotent, stateless)

1. **Sense** (deterministic) — pull milestone issues + labels + open PRs + last CI conclusions → reconstruct the frontier.
2. **Decide** (graph math; LLM only at forks) — done → finish & summarize; at capacity → sleep; ready + non-conflicting + capacity → dispatch; failed / debug-exhausted / design-rejected / ambiguous / high-blast-radius → run the **decision funnel**, else escalate (PARK/PAUSE/HALT), mark blocked, continue.
3. **Act** — kick off the existing `bkit-auto` phase chain for the chosen workstream.
4. **Sleep** — until next event or heartbeat.

### Reliability — idempotent, single-writer, reconciling **[MVP]**

The dual-write problem (we dispatch _and_ journal) and overlapping tick invocations are the #1 functional risk. Required:

- **Idempotency keys on dispatch** — an event-tick and a heartbeat-tick must not double-launch the same workstream.
- **Single-flight lock / leader election** — only one tick mutates state at a time (capacity=1 does **not** prevent two overlapping _invocations of the loop_).
- **Reconciliation** — a tick detects "journal says dispatched X but no `workflow_run` exists" → recovers. (Durable-execution / saga discipline — Temporal, Step Functions.)

### Inputs — events + heartbeat + human steering **[H1, MVP]**

Beyond kill/approve, the human must be able to **steer without stopping**: comment on the milestone issue ("deprioritize X / use Postgres not Mongo") and the loop picks it up next tick. The journal is _already_ comments, so this is nearly free.

### Anti-thrash + termination

- **Decide order once at plan time, then just walk it** — the tick never re-litigates priority (re-planning every wake = thrash). LLM judgment is for exceptions only. (Legitimate re-planning is bounded — see Adaptivity.)
- **Capacity = 1 in-flight per repo to start** — sidesteps the _no-concurrent-workflows-on-one-clone_ hazard.
- **Hard termination** — stop on milestone done / budget cap / kill-switch label / all-remaining-blocked-on-human.

---

## Decisioning & learning — answer most questions WITHOUT asking

Cost asymmetry: an interrupt **at kickoff** is cheap; **mid-milestone** is expensive (work parked, context lost); a revision **at the end** (wrong naming/structure, or a wrong load-bearing assumption surfaced at workstream 8) is the **most** expensive. So **predict-and-batch**, and resolve silently wherever precedent or first-principles allow.

### 1. Adversarial pre-flight (front bookend)

At **Phase 0** — after `design → organise`, before first dispatch — **simulate failure** to surface latent blockers:

- **Pre-mortem:** _"Assume this stalled halfway or got rejected at the end — why? What did we fail to ask? What will the user want changed?"_
- **Multi-lens panel** (security / cost / UX / naming-structure / credentials / ops) — **this is #80's lens engine pointed forward at the plan** (see Composition).

It hunts: **naming/structure/convention** ("what would the user name this"); **credentials/access/scopes** ("what access keys do we need" — the #483 admin-scope class); **external deps/approvals/provisioning**; **genuine value decisions** ("how would the user answer this"); **load-bearing assumptions** _(highest leverage — a wrong one invalidates everything downstream)_; **cross-workstream coupling/ordering**; **definition-of-done gaps**.

**Output: one batched kickoff brief** — runs the decision funnel first so it holds only genuine residuals; each item carries _why it blocks_ + a _recommended answer_ (so the user confirms, not composes) + a _resources-to-provision checklist_ + _assumptions-to-confirm_. One deliberate interrupt at the natural start, not N random ones.

### 2. The decision funnel

For any fork (at pre-flight or mid-flight), resolve in order; escalate only if all three fail:

1. **Precedent — the cross-repo preference record.** Consult a persistent record of the user's past decisions (naming, grouping, structure, architecture). If decided before, apply it. Cross-repo (a per-user store, not one repo's `docs/decisions.md`); each entry carries scope (global vs repo), rule, rationale, provenance; user-reviewable.
2. **UX-optimized reasoning.** No precedent → decide from the user's outcome across **usability / speed / cost / security / maintainability**; pick the dominant option; **log the rationale** (also harvestable). #80's **reference-repo divergence signal** feeds this step.
3. **Escalate** — only a genuine Pareto trade-off (no dominant option, needs the user's _values_) or a high-blast-radius/irreversible surface (always escalate those).

### 3. Learning bookend (close) + promotion model

The preference record learns from **three signals of increasing strength**:

| Signal                               | Strength                                                 | Stored as                                                                 |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| Explicit answer at the kickoff brief | strong                                                   | **confirmed** default                                                     |
| Survived to "done" uncorrected       | weak (silence ≠ endorsement — user may not have noticed) | **provisional** — re-surfaced for one-click confirm, not applied silently |
| Explicit correction at any point     | strongest (a _revealed_ preference)                      | **confirmed** rule (the "I keep correcting grouping/naming" loop)         |

A **closing decisions-ledger review** (back bookend) batches _all_ auto-resolved calls at milestone close for a single quick veto pass — converting weak implicit acceptance into cheap explicit endorsement. So the loop has **two batched moments (kickoff brief + close ledger)** with mid-flight kept uninterrupted; both feed the record, so each milestone asks fewer questions than the last.

### Cold-start **[B1, MVP+1]**

Empty record = max early escalations. Seed by **mining the user's existing repos** (Gether/Fraser already encode naming/structure conventions) or a one-time onboarding pass.

---

## Guardrails — escalation taxonomy (PARK / PAUSE / HALT)

Three tiers — most escalations should **not** halt the whole loop:

- **PARK** _(block this workstream, others keep moving)_ — scope ambiguity; debug loop hit `K` iterations without green (wire the abort-handover → PARK, not silent retry); a plan reveals unplanned scope creep.
- **PAUSE** _(freeze the milestone, wait for the user)_ — **irreversible / high-blast-radius surface** (migrations/schema, auth, billing, data deletion, secrets, prod deploy, branch protection) → sign-off _even when green_; a design fork with no dominant option; **systemic failure** (same error signature across workstreams = a broken shared assumption).
- **HALT** _(kill the loop)_ — budget cap; kill-switch / infra down; **a trust-contract violation it can't isolate** (a green it can't prove ran).

**Meta-rules:** escalate on **low self-confidence**; **escalations push to the user** (proactive), not journal-and-wait.

---

## Trust & verification

- **Trust ceiling — never advance on a hollow green.** An autonomous PM is only as safe as _green == validated_ (the #236 lesson). A tier that ran zero tests / a cache-replay / a capstone skip-cascade → HALT, not warn.
- **Acceptance verification vs intent [V1, MVP+1].** "Done" must mean _meets the issue's acceptance criteria_, not just `workflow_run.success`. Wire the issue's DoD **and the relevant #80 lenses** into the done-predicate — quality gate, not just CI-green.

## Security — the autonomous loop is an attack surface **[S1, MVP]**

A loop with repo-write + credentials that reads **untrusted content** (issue/PR bodies, CI logs, web via #80's reference signal) is the OWASP-LLM-Top-10 case:

- **Untrusted-content isolation** — treat that text as _data, never instructions_.
- **Least-privilege per-workstream tokens** — not one god-token for the whole loop.
- **Independent human approval for high-privilege actions** — regardless of the green gate.

## Adaptivity — bounded re-planning **[P1]** + compensation **[C1]**

- **Bounded re-planning** — "never re-plan" is too rigid (plans go stale). The _one_ legitimate path: a PAUSE that proves the DAG is wrong re-plans the **remaining** milestone (not the whole), logged.
- **Compensation / rollback (saga)** — when workstream 8 reveals workstream 3 was wrong: a named path (revert PR, reopen issue, re-plan tail) — not forward-progress-only.

## Cost governance **[$1]**

Per-workstream attribution + **graceful degradation** (cheaper model / less fan-out) _before_ HALT; budget _allocation_ across the DAG; treat the multi-agent **~10–15x token multiplier** as an explicit constraint.

---

## Context-exhaustion strategy

The orchestrator is **stateless per tick** and rehydrates from the journal — it never holds the milestone's history in-window (the user's own `/clear` + read-handover pattern).

- **Milestone issue comments = the journal**: **one rolling "current-state" comment** (idempotently overwritten each tick: frontier, in-flight, blocked + why, last decision, next action — bounded size, the rehydration source) + **an append-only event log** (audit trail).
- A cold tick reads the snapshot → drills into a workstream only if needed → **context per tick is small and constant**, independent of milestone length.
- Within a workstream, context is handled by bkit's phase decomposition; the orchestrator sees only the _outcome_ (merged/failed/escalated) via GitHub.

## Topology — one loop, everything else terminates

Picture **one loop that triggers independent jobs and observes their results through GitHub** — not a call stack of nested agents.

> **Exactly one persistent loop (the orchestrator). Everything it starts must be a terminating job.**

- **L0 orchestrator** — the only loop; persists via the journal.
- **L1 workstream** — a `bkit-auto` run to a terminal state, then returns.
- **L2/L3 phase sub-agents** — bkit's existing build/challenge/test fan-out: bounded task trees.

Sub-agents _can_ spawn sub-agents (build already does) — fine, they terminate. **Forbidden: a workstream spawning another loop** (runaway cost, two writers racing the DAG, competing journals). Loops = 1; bounded fan-out below = 2–3 deep. L0 <-> L1 communicate via GitHub events, never via nested context.

## Concurrency / shared-state hazards

Two bkit workflows on one clone collide (shared `dev` + working tree + `.git/config`). MVP = **capacity 1 / serial** (+ the single-flight lock from R1). Parallel requires worktree isolation per workstream **and** conflict-aware frontier selection (never co-schedule two issues touching the same shared surface). Deferred.

---

## Observability & telemetry **[O1]** -> composition with #234

The journal is human audit; the _metrics_ layer rides on **#234 (unified JSONL telemetry)**:

- Orchestrator **emits `stats.jsonl`** per tick/workstream; the **unix-timestamp id** gives elapsed-time math: time-in-PARK, time-to-escalation-resolution, workstream duration, time-to-fix.
- Discipline maps 1:1: **PARK -> `deferrals.jsonl`** ("never silently drop"), **mid-flight bug -> `failures.jsonl`** ("any found bug"), friction -> `friction.jsonl`.
- **Preference-learning is telemetry** — every auto-decision + whether it was corrected is a record; #234's harvest/analysis (incl. #183 size<->outcome, #232 compliance) measures whether escalations actually fall over time.
- The close decisions-ledger + milestone summary ride on #234's "summary aggregates stats; ship summary reports the whole chain."

## Composition with #80 (audit lenses)

**#80 (`bkit-audit`) is the orchestrator's quality brain — compose it, don't rebuild:**

- **Adversarial pre-flight panel** = #80's 11 universal + conditional lenses (security/perf/reliability/UI-UX/data-layer/AI-LLM/supply-chain) pointed _forward_ at the plan; its **reference-repo divergence signal** feeds decision-funnel step 2.
- **Acceptance verification (V1)** = run the relevant #80 lenses against a completed workstream.
- **Planning seed** = an audit's severity x class report + workstream decomposition can _generate_ a milestone's DAG.
- #260 is the **automated-trigger home #80 deferred** ("CI scheduling / automated audits — out of scope v1"): kickoff baseline audit + close regression audit. Reuse #80's **conditional-lens model** (stack-detect flags + the "N/A — not applicable" coverage state) so a non-applicable lens isn't a false all-clear.

## Best-practice lineage

Orchestrator-workers (Anthropic) - durable-execution/event-sourcing (Temporal, Step Functions) - MemGPT context management - pre-mortem (Klein) + Reflexion/evaluator-optimizer - Airflow/Dagster DAGs - supervised-autonomy/circuit-breakers - preference capture - saga compensation - OWASP-LLM-Top-10. Core is aligned; the **[MVP]/[MVP+1]** tags above are the operationalize-it-safely layer.

---

## Staged rollout

1. **MVP — serial auto-advance** + the must-adds: **R1** (idempotent/single-flight/reconcile), **S1** (untrusted-content isolation + least-privilege tokens), **H1** (steering channel). Event-driven tick + heartbeat; decision funnel + PARK/PAUSE/HALT; journal (snapshot + log); a basic kickoff brief. Removes ~90% of manual kickoffs at near-zero new risk.
2. **Learning + telemetry** — preference record + three-signal promotion + close decisions-ledger; wire **#234** (`stats/deferrals/failures.jsonl`, O1); **B1** cold-start seeding.
3. **Quality + adaptivity + parallelism** — **#80** audit gating (pre-flight + acceptance, V1); **P1** bounded re-planning; **C1** compensation; **$1** graduated cost control; worktree-isolated, conflict-aware capacity > 1.

## Open questions

- Cross-repo **preference store** location + schema + promotion policy (auto vs confirmed)?
- Loop hosting — scheduled cloud agent vs GHA cron vs harness scheduler; how it receives `workflow_run` events + acquires the single-flight lock?
- Per-repo vs per-user budget accounting.
- Reliable "stuck in-review" detection for the heartbeat.
- Does the orchestrator become a bkit phase (dogfoodable via `/bkit-*`) or a new top-level capability?

## Dependencies / Related

- **#80** (`bkit-audit` lens engine) — **foundation** (pre-flight panel, acceptance verification, planning seed). #260 is its deferred automated-trigger home.
- **#234** (unified JSONL telemetry) — **foundation** (closes O1; PARK/failure discipline; preference-learning-as-telemetry).
- **#236** (consumer-debug post-mortem) — source of the _green == validated_ trust ceiling.
- Suggested sequencing: advance **#234 + #80 first/in parallel**, then build #260 on top. All three sit in the **Workflow Agent Optimisation** milestone.

---

_Add `bkit:design` (or run the design phase) to formalise this through bkit's own pipeline — the obvious dogfood._

### Comments

#### Comment (cbartens, 2026-06-13T23:48:36Z)

## Addendum — Adversarial pre-flight (front-load the interrupts) + the learning bookends

[... full addendum on adversarial pre-flight, decision funnel layering, learning bookends — see issue #260 comment 4700140004 for complete text; summarized here for brevity of this related-issues digest: establishes a Phase-0 pre-flight kickoff brief pattern (pre-mortem + multi-lens panel) and a two-signal-strength preference-learning model (kickoff-confirmed vs survived-uncorrected vs explicit-correction), plus a closing decisions-ledger review.]

#### Comment (cbartens, 2026-06-14T00:22:23Z)

## Addendum 2 — Best-practice alignment, gaps to fold in, and composition with #80 + #234

Flags MUST-ADD gaps (R1 idempotent dispatch, S1 untrusted-content isolation, H1 steering channel) and MVP+1 gaps (V1 acceptance verification, P1 bounded re-planning, C1 compensation, $1 cost governance, O1 observability, B1 cold-start). Establishes composition contract: **#80 = orchestrator's quality brain** (pre-flight panel, acceptance verification, DAG-generation seed), **#234 = observability substrate** (stats.jsonl, deferrals/failures/friction discipline, preference-learning-as-telemetry). Recommends landing #234 + #80 before/parallel with #260.

#### Comment (cbartens, 2026-06-14T00:58:19Z)

Must include closing tasks that always run at end

Check for any deferred items and work through them if deferred as excuse by workers

Audit test coverage to make sure not just all mocked to catch any issues and then enter debug if not

What else?

Full audit #80 cannot run after every milestone or can it?

What about the UX screenshot test?

#### Comment (cbartens, 2026-06-14T08:11:15Z)

See also #206 and #207 and how to integrate

#### Comment (cbartens, 2026-06-14T22:20:58Z)

Issues that keep happening this orchestrators needs to help avoid

- Crucial test missing, too much mocking, hence not build properly, releasing things that do not actually work
- Reinventing the wheel, existing process not re-used but instead new similar process built so drift
- Not cleaning up when something becomes obsolete
- ???

#### Comment (cbartens, 2026-06-17T00:02:58Z) — **THE #380 PRECURSOR**

Should also auto update some roadmap issue or roadmap.md to always suggest best next issue

#### Comment (cbartens, 2026-07-05T00:29:31Z)

Combine with https://github.com/cbartens/bkit/issues/324 ???

#### Comment (cbartens, 2026-07-05T00:45:38Z)

## Overlap noted from #324 — the after-ship audit trigger rides this same event substrate

#324 (recurring self-healing audit loop) is adding an **after-ship / post-deploy trigger** that fires on the same post-merge / CI-concluded `workflow_run` signal this orchestrator ticks on. Full detail + overlap table on #324.

Net: the **event-router + dispatcher** layer here is a shared primitive with two producers — milestone workstreams (this issue) and audit findings (#324) — plus shared idempotency/dedup-on-dispatch and worktree isolation. Worth designing the sense -> dispatch seam once and letting both consume it. Not a closing dependency either way.

---

## #236 — Post mortem on consumer debug sessions (closed)

Tangential — establishes the "green must mean validated" trust-ceiling doctrine and the bkit-fixable-vs-consumer-fixable stack-independence rule that #380's design must also respect (roadmap agent must stay stack-agnostic). Not directly about roadmap mechanics; included for the stack-independence precedent only. Full body/comments omitted from this digest (22-issue post-mortem, not roadmap-relevant) — see `https://github.com/cbartens/bkit/issues/236` if needed.

---

## #209 — Workflow state model design/plan squash to dev persistent feat branch build->ship (closed)

Relevant precedent for **where `docs/roadmap.md` writes should live** (dev-located vs feat-located) — #380's design must decide this the same way #209 did for `status.jsonl`.

## Problem

Today the workflow state model has two friction points that hurt cloud-agent dispatch:

1. **`status.json` is pushed to `dev`** (one `[skip ci]` snapshot per run, every phase). Nobody reads it on `dev` — it's a _rendezvous file_, written there only because the cloud runner checks out `ref: dev` and that's the one ref a stateless runner is guaranteed to reach.
2. **Per-phase branch lifecycle is inconsistent.** design and plan each create a throwaway `feat/{FID}` worktree, squash-merge their doc to `dev`, then **delete** the branch; build creates `feat/{FID}` and _keeps_ it (the PR spine).

## Decision — the approach

Keep squash-merge to `dev`. No PR ceremony for design/plan. Localize the persistent branch to the window that needs it.

1. **design & plan -> squash-merge to `dev`, "dev always wins" on conflict** — design/plan are doc-only phases writing only FID-namespaced files, which never conflict with `dev`. Merge uses `-X ours` so shared-file collisions resolve to `dev`, never halting.
2. **build creates the one persistent `feat/{FID}`**, lasting build -> debug -> ship. It inherits design+plan docs for free by branching from `dev` after they've merged.
3. **build/debug/ship state comes off the branch** — `status.json`/`status.jsonl` writes commit on `feat/{FID}` only; state reaches `dev` exactly once, at ship's final squash-merge. (Later corrected in comments: design/plan status.jsonl was ALSO relocated to feat-branch, to match — see re-open below.)

Absorbed defects: Defect A (status.json conflicts -> unmergeable PRs -> CI never runs, fixed by moving state off dev mid-lifecycle + NDJSON `merge=union`); Defect B (`[skip ci]` status commit leaking onto the PR-branch tip suppresses all CI, fixed by a HEAD-Subject Assertion guard re-run after every feat mutation).

### Comments (abbreviated — full implementation log, 13 comments)

Key decisions across the comment thread:

- **status.jsonl event model** — append-only NDJSON (`workflow-started`/`step-done`/`workflow-meta`/`workflow-done`/`workflow-failed`), canonical `fold` reducer in `bkit-status.ts` (TS is source of truth), mirrored as an inline jq fold at every read site (no node/dist runtime dependency at status sites — avoids coupling status ops to compiled `dist/`).
- **`docs/plans/**/status.jsonl merge=union`** in `.gitattributes` (scoped to the status path specifically, NOT a blanket `*.jsonl` — union-merge is destructive for non-append-only files a consumer might have, e.g. datasets/fixtures).
- **Migrate-once at Step 1** — legacy `status.json` array converted to `status.jsonl` events once per FID; all downstream reads assume `.jsonl`.
- **Comment-link permanence rule adopted:** link to `feat` while feat is alive and holds the artifact; link to `dev` once the artifact is permanently on `dev` (post-merge/post-close). design/plan link `dev` (they prune feat at close); build/debug link `feat` (persists through their whole window); ship already splits pre/post-merge.
- **Re-opened** once: design/plan's `status.jsonl` was initially left dev-located ("cheap archive") while build/debug/ship were feat-located — inconsistent. Fixed to feat-locate ALL FIVE workflows' status, with the Close step reordered so status events are appended _before_ the `git add -A && git commit` (else the squash-merge would drop post-commit-appended events). Subagent worktree `cd` idiom also pinned to `{WORKTREE_PATH}` across all 5 workflows (closed friction #29/#43).
- **`bkit-cloud` made fully stateless** — removed its `status.jsonl` writes entirely (nothing read them; the tracker comments already carry richer links).
- **ASCII-operator authoring rule** adopted (`!=`/`>=`/`<=`/`=>`, keep `->` flow-arrow as the one intentional non-ASCII glyph) — applies to any new workflow steps #380 adds.

**Takeaway for #380's design:** if `docs/roadmap.md` mechanical-update writes happen inside design/plan/build/debug/ship (per the issue owner's confirmed two-tier model), the file should be **feat-located during the run, reaching `dev` once via the phase's existing squash-merge/PR-merge** — matching the now-uniform `status.jsonl` placement, not a special-cased dev-write. Avoids resurrecting Defect A's conflict class for a second file.
