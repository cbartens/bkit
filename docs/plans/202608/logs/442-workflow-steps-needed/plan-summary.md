Verdict: PASS

<!-- verdict:end -->

# Plan Summary — 442 Run Only Workflow Steps Tasks Actually Need

## Overview

This plan implements per-lens applicability predicates for the design and plan workflows, reducing subagent invocations from 21 to as few as 5 on small, well-scoped changes by running each review lens only when the thing it inspects is present. The plan is split into four dependency-ordered waves: Step-Skipped Row Recording (pure logging, no behaviour change); Input Tolerance and Partial-Width Fan-Out (mechanical tolerance, inert at full width); Applicability Predicates (new lens-level conditions and continuity hard-sets); and Routing, Ledgers, Docs, Mirrors (escalation verdict, debug entry rule, and integration).

The scope is clean, the four sub-plans have no cycles and carry only forward-pointing cross-plan edges (sub-plan 1 tasks must complete before sub-plans 3 and 4 can verify; sub-plan 2 is safe alone). The human contract is confirmed exactly once in sub-plan 1 Gate 1; sub-plans 2, 3 and 4 assert that gate passed rather than re-asking. Rollback is enabled as a natural consequence of the wave boundaries: sub-plans 1 and 2 are reversible on their own if sub-plan 3 has not landed; reverting sub-plan 3 with sub-plan 4 in place requires reverting both.

The plan gates on three open questions (whose predicate computes each value — orchestrator or subagent; whether apply-step skips on `Verdict: PASS` alone or require a `Failures` count; where the escalation verdict comes from), all with explicit options and recommendations. All three are resolved before any builder runs, and the default if unanswered is carried in each.

## Plan Quality

The plan is well-scoped and internally complete. The issue's agreed-approach comment is sufficiently specific that the plan can stand alone, authoring both Narrative and Success Criteria from the issue statement rather than inheriting from a design doc — marked with a `⚠️ NOTE` and confirmed by the human in Gate 1, following shipped precedent.

Dependencies are explicit and acyclic. The four sub-plans execute in order (1, 2, 3, 4), each internally consistent, with no backward edges across a sub-plan boundary. Within each sub-plan, the tasks respect `Requires:` edges; all are forward-pointing.

The split itself is sound. The pre-split assumption was that the runbook would exceed 12 tasks and named Task 4 as a natural seam. The realised split is wave-boundary aligned: Task 4's 28 conditional-step retrofit stays whole in sub-plan 1 because Task 5's derived audit gates all five workflow files as one subject set, and splitting it would leave four of five partitions ungated until the last landed. That is why the wave boundaries are the plan's own `Requires:` edges and impose no new ordering constraint.

Gates and confirmation checkpoints are correct. Sub-plan 1 carries the three human-confirmation checkboxes once; sub-plans 2, 3 and 4 assert that gate passed. Build-phase gates are sound (derived audits are asserting `Requires:` from the corpus itself, never hand-written lists, so a newly-added conditional step is covered-or-failing by construction).

## Completeness

The Acceptance Scenario is complete: Narrative, Success Criteria, Process Sketch, Concrete Example and Edge Cases are all carried verbatim. The Narrative is authored from the issue's agreed-approach and is marked as standalone. The Success Criteria are five, each concrete and testable: (1) skip-skipped rows for every skip, (2) partial-width plans running 5-6 invocations not 11, (3) absent artifacts never break consumers, (4) every gated variable has a defined value whether its emitter ran, (5) escalation on open decisions and debug NO-REPRO on attempt 1 PASS.

The Derived Test Matrix carries 27 rows total, distributed across the four sub-plans (8 in sub-plan 1, 5 in sub-plan 2, 8 in sub-plan 3, 6 in sub-plan 4). All are tied to runbook tasks with `Done when:` assertions. Coverage is explicit — each row is either a shell bats case, an integration scenario, or a Vitest markdown-invariant test or derived audit. No row claims an E2E, `@live`, migration or smoke tier that bkit lacks.

Documentation is complete across all five categories: Breaking changes are named (step-skipped is new, fan-out width is now variable, design reviewers gain `Failures:`, scope-check-2 is deleted, three variables are new, three assumptions declared); Open Questions carry options with recommendations and defaults; Suggested Scope Expansion is advisory only and carries nine candidates with rationale; Security & Privacy is addressed (user input is from untrusted issue text, read by subagents under existing standing rules; `bkit.sensitivePaths` is a consumer-authored glob list, not a secret; no PII or new routes); and Data Schema is clean (step-skipped is an additive audit row, not folded; the only database is status.jsonl per-FID, which is append-only).

Rollback is well-defined. A full revert is `git revert {COMMIT}`, `pnpm build`, `pnpm bkit install`. Partial rollback is possible: reverting sub-plans 3 and 4 independently of 1 and 2 restores full-width while keeping skip logging and tolerance inert. Reverting sub-plan 1 or 2 alone after sub-plan 3 has landed is unsupported because continuity hard-sets land in sub-plan 3 alongside their predicates.

## Acceptance Scenario

**Narrative:** ⚠️ No design doc exists for this FID — this is a standalone plan. Narrative and Success Criteria are derived from the issue's agreed-approach comment, which is a complete statement of intent, and are the human's to confirm.

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

**Success Criteria:**

- A skipped step or a skipped lens inside a fan-out step writes a step-skipped row naming the step (lens-suffixed when a lens), the absent input, and who decided — never nothing, never a step-done.
- A plan whose runbook declares no dependency edges and whose Architecture & Component Changes carries no [MODIFY] / [DELETE] row completes on five 🧠 invocations (generate, plan-review-1, scope-check-1, complexity-check, summary). A plan that modifies a consumed surface but declares no dependency edges costs six (adds plan-review-3). A plan with dependency edges and modified surfaces still runs all of them.
- Skipping a producer never breaks its consumer: every downstream step reads whichever inputs exist and resolves the highest existing version, and a fan-out step whose width shrank still passes its own existence assert, failure sum, artifacts array, tracker comment and gate.
- Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name.
- A plan resting on open decisions with real alternatives stops before the Step 5 fan-out and hands to design; a bug with no failing test is routed to plan rather than closing debug green.

**Process Sketch:**

- WHEN a lens step's input is absent → THEN the step does not run and a step-skipped row records the step, the reason and the decider.
- WHEN one lens inside a fan-out step has an absent input while a sibling lens does not → THEN only that lens is skipped, and the step's own assertions, artifacts array, verdict / failure derivation, tracker comment and gate items range only over the lenses that ran.
- WHEN a skipped step or lens was the sole emitter of a variable → THEN the workflow hard-sets that variable to a defined enum member as an orchestrator prose variable, outside any bash fence.
- WHEN a downstream step's read list names an artifact a skipped step would have produced → THEN it reads whichever of the list exists and resolves the highest existing version of the chain.
- WHEN the generated plan rests on open decisions with real alternatives → THEN plan stops before the review fan-out and hands to design, costing one wasted generate run.
- IF debug is entered on a bug with no failing test → THEN the run records NO-REPRO and names /bkit-plan as the next action instead of reporting a clean pass.
- IF a consumer sensitive-path glob matches a planned target → THEN the matching lens is forced on regardless of its own predicate; a glob never drops a lens.

**Concrete Example:** A maintainer runs `/bkit-plan #900` on a one-file CLI help-string fix with no new dependency, no runtime surface, no schema, and no dependency edges. Workflow invokes generate, creating plan-v1-draft.md and plan-escalation.md. plan-escalation.md reports Escalate: FALSE. plan-review-2 (dependency correctness) is skipped and one step-skipped row records "zero declared dependency edges". plan-review-1 and plan-review-3 run. Step 5 asserts only the two artifacts its two lenses produced, not a blanket "any file empty → Failure Path". Step 6 skipped on zero review findings. Step 7 invokes scope-check-1 only (scope-check-2 is deleted). Step 9 complexity-check runs unconditional, returns SINGLE, Step 10 skipped. Step 11 summary reads PLAN_FINAL = plan-v1-draft.md (highest present). Outcome: six 🧠 invocations instead of eleven (generate, plan-review-1, plan-review-3, scope-check-1, complexity-check, summary). status.jsonl carries four step-skipped rows (plan-review-2, plan-update at Step 6, plan-update at Step 8, plan-complexity-split).

**Adherence to docs/plans/template.md:** The plan carries all required sections and gates. Acceptance Scenario is present with Narrative, Success Criteria, Process Sketch, Concrete Example and Edge Cases. Breaking Changes are named and confirmed. Open Questions are carried with options and defaults. The template's Design-Missing Fallback clause allows this standalone form when the issue statement is complete, which is the case here. The human confirms both fields in Gate 1, following shipped precedent on 363-widen-bkit-cloud-trigger-plan.

## Breaking Changes

- `step-skipped` is a new `status.jsonl` row type, deliberately not folded — existing fold ignores unrecognised types (same treatment as runtime-resolved, transport-fallback, close-transport).
- A `step-skipped` row's `step` may be lens-suffixed (e.g. plan-review-2, design-review-1) for skipped lenses inside a fan-out step, distinct from the step's step-done slug.
- `route_append_step_skipped` · `step-skipped` type · `caller-flag` / `upstream-verdict` / `applicability` closed-enum on `decidedBy` · `**Run lens only if**` marker (introduced by sub-plan 1).
- Fan-out steps stop hardcoding their width — `bkit-plan.md` Step 5 and `bkit-design.md` Step 5 now name only the lenses that ran in their existence assert, artifact array, tracker comment and gate items (introduced by sub-plan 2).
- Design review artifacts gain a `Failures:` header line above `<!-- verdict:end -->` (introduced by sub-plan 2).
- `bkit-plan-scope-check-2` is deleted (introduced by sub-plan 3).
- `design-v1-draft.md` gains machine-read structure: `## Required Capabilities` and `## Runtime Surface Change` sections (introduced by sub-plan 3).
- `bkit.sensitivePaths` is this plan's one net-new consumer surface — a glob list in package.json that forces a review lens on if matched, never off (introduced by sub-plan 3).
- `PLAN_ESCALATE` · `plan-escalate` / `design-escalated` step keys · `NO-REPRO` debug outcome label (introduced by sub-plan 4).

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the PASS|CONCERNS|FAIL verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract.

## Design Alignment

The plan carries no pre-existing design doc (standalone plan). Narrative and Success Criteria are derived from the issue #442's agreed-approach comment and authored within the plan, confirmed by the human. The design section of the issue is the agreed-approach text itself, which the plan executes completely. The plan is within the issue's scope: it does not attempt to scale beyond what the issue describes, does not add machinery the issue did not ask for (scale dials, separate enums, new workflows), and does not downgrade below plan (build keeps its plan requirement).

## Deferred & Out-of-Scope

Nine items are Out of Scope (Exempt rows), each genuinely-additive and not required by Success Criteria, Acceptance Scenario, Derived Test Matrix or any design section:

- Extending the status-hole detector beyond ship to design/plan/build/debug (plan-sized, new machinery; own cycle) — existing deferral `384-promote-status-hole-detector-from-advisory-to-gate`.
- Promoting the status-hole detector from advisory to gate (already deferred with an explicit promotion condition).
- `.bkit/workflows.md` canonical-invariants row scope drift audit (different change from adding one row; own cycle) — existing deferral `workflows-md-canonical-invariants-row-scope-drift`.
- A per-workflow rollback path for shipped `.bkit/workflows/*` changes (design decision needed; own cycle) — existing deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`.
- `status.jsonl` run-boundary keying on last-run-overall (orthogonal; own cycle) — existing deferral `58-status-jsonl-run-boundary-keys-on-last-run-overall`.
- Conditional-lens keystone vocabulary alignment with /bkit-audit (shared vocabulary decision needed; own cycle) — existing deferrals `#402` A1 / `#405`.
- A `bkit check` drift gate over the rendered host mirrors (observable half is folded in; general gate is own cycle) — failure `363-host-mirrors-stale-after-first-challenge-remediation` (HIGH, OPEN).
- Validating `--arg`-passed workflow variables against their enums at every existing write site (the new `route_append_step_skipped` validates its own fields; retrofitting existing sites is own cycle).
- Ship artifact lost before any commit captures it (weak overlap; own cycle) — failure `363-ship-worktree-artifact-lost-before-any-commit-captures-it`.

**One declared non-goal (NOT deferred):** `.bkit/workflows/bkit-auto.md` CI mode is failure-driven by construction and never receives a human-reported bug, so the debug entry rule cannot fire there and the file needs no change. Stated so no builder invents a diff for it.

**Note:** Amending `docs/plans/template.md` § Design-Missing Fallback to cover standalone plans with a complete issue-side statement is tracked as deferral `442-plan-template-design-missing-fallback-amendment` and is an assumption in sub-plan 4's Open Questions & Assumptions.

Every `Exempt` row is mirrored to `docs/deferrals.jsonl` by sub-plan 4 Task 21.

## Suggested Scope Expansion

Nine advisory candidates; none gate the Verdict and none become runbook tasks:

- Promote the ship status-hole detector from advisory to a blocking gate — `step-skipped` rows would let classifyRun read skips from the log; keep deferred until this plan supplies the fail-open signal.
- `.bkit/workflows.md` canonical-invariants row scope drift — overlaps this plan's workflow edits; keep deferred as separate audit.
- A per-workflow rollback path for shipped `.bkit/workflows/*` changes — needs design decision.
- `status.jsonl` run-boundary keying on last-run-overall — orthogonal.
- Conditional-lens keystone vocabulary alignment with `/bkit-audit` — needs design decision across two issues.
- A `bkit check` drift gate over rendered host mirrors — observable half is folded in; general gate is own cycle.
- Validating `--arg`-passed workflow variables against their enums at every existing write site — retrofitting existing sites is own cycle.
- Ship artifact lost before any commit captures it — weak overlap.
- Sequencing against in-flight audit-workstream plan runs (`#402`, `#403`, `#405`) — advisory only; adding Step 3.5 and deleting Step 7 sibling changes the workflow mid-flight, but does not gate this plan.

## Risks

**Open Question 1 — Who computes each predicate?** Some are countable by the orchestrator in bash (declared dependency edges, task count, touched paths). Others ("does this design add a dependency") need the artifact read, so they want a header emitted by the upstream subagent. Probably a mix; the split needs deciding per row. **Mitigation:** sub-plan 3 Tasks 12 and 13 define the predicate set and its call sites; if the decision changes which predicates are orchestrator vs. subagent, the mechanics shift but the audit remains consistent (derived from workflow files, not hand-written).

**Open Question 2 — Is Verdict: PASS alone enough to skip an apply step, or is the Failures count load-bearing?** Plan already has the count; design does not. If the answer is "PASS alone", Task 8's design Failures: header becomes optional and design Step 7's zero-findings skip becomes unconditional. **Mitigation:** the default if unanswered is "count load-bearing" (option A); sub-plan 2 Task 8 is written for it. If option B is chosen, Task 8 shrinks to the fan-out sum alone and design Step 7's predicate changes.

**Open Question 4 — Is Verdict: PASS alone enough for an apply step, or must Failures = 0?** Same class as above, for apply-step gating (plan Step 6 currently gates on `Failures >= 1`, design has no gate). **Mitigation:** default is "Failures = 0 required"; sub-plan 2 Task 8 is written for it.

**Open Question 5 — Where does the escalation verdict come from?** Option A: separate `plan-escalation.md` artifact; Option B: `Escalate:` header on the draft (buries in v2's body, rides into canonical); Option C: separate cheap classifier (not the agent with the plan in hand). **Mitigation:** option A is recommended and default; sub-plan 4 Task 16 is written for it.

**Open Question 6 — What plan size makes SPLIT unreachable?** Needs calibration against real runs in `.bkit/stats.jsonl`. **Mitigation:** if the threshold proves too low or too high, the COMPLEXITY_VERDICT continuity value in sub-plan 3 may need adjustment, but the hard-set mechanism is load-bearing and does not change. Option A (complexity-check always runs, no NOSPLIT) is recommended and default.

**Open Question 7 — Where do sensitive-path globs live?** In consumer config (package.json `bkit.sensitivePaths`), defaulting to empty — naming auth/migration/payment paths in bkit's own shipped surface would break stack-independence. **Mitigation:** the placement is consumer-authored; bkit's own test suite need not set it.

**Open Question 8 — Should bkit-plan-scope-check-2 still be deleted?** It is a byte-identical file to `-1` bar `name:` and `model:`. The plan deletes it. **Mitigation:** if the decision is to keep it, sub-plan 3 Task 14 reverts; the predicate logic and the scope-check-2 read stay in place, and the audit gates both call sites.

**No other open questions or unknown dependencies.** All nine suggested expansions are explicitly deferred and advisory only.

## Action Items

None. The plan is complete and ready for build. All open questions carry explicit options with recommended and default answers. All dependencies are forward-pointing and acyclic. All three human-confirmation checkboxes (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions) are confirmed in sub-plan 1 Gate 1 and inherited by the later sub-plans.

## Outstanding Questions

**Open Question 1 — Who computes each predicate?**

- **Options:** A — Some orchestrator-countable (declared edges, task count, paths); some subagent-readable (new capability, runtime surface). Probably a mix; split per row. · B — Orchestrator computes all via heuristic bash conditions. Simpler; but "does this design add a dependency" wants the artifact. · C — Subagent computes all via headers. Cleaner; but dependency-edge counts are heuristic in bash.
- **Recommended:** A — each predicate lives at the natural boundary (orchestrator for countable facts, subagent for artifact facts).
- **Default if unanswered:** A.

**Open Question 2 — Is Verdict: PASS alone enough evidence for the apply-step skips, or is the Failures count load-bearing?**

- **Options:** A — Apply step gates on Failures = 0, not on Verdict = PASS. Precise (a CONCERNS with zero findings skips apply). · B — Apply step gates on Verdict = PASS. Looser (runs apply even on zero-finding CONCERNS); savings mostly evaporate.
- **Recommended:** A — gating on the count is more precise.
- **Default if unanswered:** A.

**Open Question 3 — Design Step 3 ideate-2 and ideate-3 have no upstream artifact to read. Can they run unconditionally?**

- **Options:** A — Yes, they ideate alternatives and risks from the issue text. · B — No, they need a design scope statement first (too much; require design S1). · C — Somewhere in between (conditional based on issue labels or size).
- **Recommended:** A — they read the issue and ideate freely.
- **Default if unanswered:** A.

**Open Question 4 — Is Verdict: PASS alone enough to skip a design apply step, or must Failures = 0?**

- **Options:** A — Design applies on Failures = 0, not on Verdict = PASS. Precise. · B — Design applies on Verdict = PASS. Looser (runs apply even on zero-finding CONCERNS).
- **Recommended:** A — same precision argument as OQ2.
- **Default if unanswered:** A.

**Open Question 5 — Where does the escalation verdict come from?**

- **Options:** A — Separate `plan-escalation.md` artifact written by `bkit-plan-generate`, carrying Escalate: TRUE|FALSE + reason. Keeps draft header-free; no change to plan-update copy-then-prepend logic. · B — An `Escalate:` header on the draft. One fewer file; but buried in v2's body and rides into canonical. Requires teaching plan-update to strip it. · C — Separate cheap classifier subagent before Step 3. Independent of generating agent; but classifies from raw issue text without a plan.
- **Recommended:** A — gets the verdict from the agent that did the work, without touching the version chain.
- **Default if unanswered:** A.

**Open Question 6 — Thresholds for complexity-check. What plan size makes SPLIT unreachable?**

- **Options:** A — complexity-check always runs, SPLIT is the only possible verdict. Continuity hard-set is COMPLEXITY_VERDICT = SINGLE (or MULTI_PLAN) when skipped; plan Step 9 needs no hard-set. · B — complexity-check skips below a size threshold. Continuity needs a hard-set for the FALSE case; more machinery.
- **Recommended:** A — simpler, and `complexity-check` running unconditional means the verdict is always recorded.
- **Default if unanswered:** A.

**Open Question 7 — Sensitive-path glob list. Where does it live, and is it stack-agnostic?**

- **Options:** A — Consumer config in package.json `bkit.sensitivePaths`, defaulting to empty. Stack-agnostic (bkit's shipped surface names only the key name, consumer fills in app-specific paths). Can only force a lens on, never off (path-override is not a decidedBy member). · B — bkit-shipped glob list hardcoding app-stack paths. Names auth/migration/payment paths in bkit's own surface, breaking stack-independence.
- **Recommended:** A — option B breaks the shipped surface contract.
- **Default if unanswered:** A.

**Open Question 8 — Should bkit-plan-scope-check-2 still be deleted?**

- **Options:** A — Yes. It is byte-identical to `-1` bar `name:` and `model:`, a second-opinion sampler on a cheaper model, never a dimension. Deleting it saves a subagent invocation on narrow paths. · B — No. Keep it as a quality gate; widen based on a different heuristic if the single checker is not enough.
- **Recommended:** A — the plan deletes it.
- **Default if unanswered:** A.

**Assumption: `step-skipped` stays out of the fold.** Follows the `runtime-resolved` / `transport-fallback` / `close-transport` precedent (documented in the event-type table, absent from the `StatusEvent` union in `bkit-status.ts`). If it were folded instead, `counter_count` would start counting skips as attempts and every attempt-bounded loop in build and debug would mis-terminate.

**Assumption: build, debug and ship keep every step they have today.** Their 24 conditional steps gain skip logging only (no width cuts).

**Assumption (template divergence, deliberate): standalone plan authors Narrative and Success Criteria.** The template's Design-Missing Fallback says a standalone plan replaces both with the ⚠️ MISSING string. This plan authors both from the issue's agreed-approach, marked with ⚠️ and confirmed in Gate 1, following shipped precedent (363-widen-bkit-cloud-trigger-plan.md). The protective intent holds because human confirmation gates both fields. If the human prefers the template letter, both fields revert to MISSING string; if the precedent is right, the fallback clause needs amending to cover "standalone plan with a complete issue-side statement of intent".

**Assumption: `.bkit/workflows.md:23` counts numbered steps.** The line `bkit-plan.md # Workflow 2/6 — 12 steps` makes it 13 after Step 3.5 is added. Task 17 corrects it.

## Recommended Next Step

/bkit-build #442

Brief: Split plan ready for build. Four dependency-ordered sub-plans (skip logging; input tolerance; applicability predicates; routing/escalation/docs) with all open questions resolved via defaults. plan-apply-review PASS, plan-apply-scope CONCERNS with one optional item knowingly skipped. No new machinery or scale dials; only observability (step-skipped rows) and applicability (per-lens predicates). Rollback enabled by wave boundaries. See plan-v4-split.md § Context & Goals for the cost savings (5-6 invocations vs 11 on narrow paths) and the plan's four-item fix list.
