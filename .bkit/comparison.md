# bkit — Pipeline Reference & Comparison to Agentic Design Patterns

<!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

> [!CAUTION]
> **Purpose:** Human-facing reference. Five-phase pipeline + every subagent (execution order), bkit vs Antonio Gulli's _Agentic Design Patterns_. Evaluation, onboarding, outreach — not agent workflow doc-matrix.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Keep prose factual; house / write-good linters apply to `*.md`; no hype adjectives.
> - Pipeline or subagents change → update Part 1 to match `.bkit/core/workflows/*` and `.bkit/core/.bkit/prompts.md`.

## What this is

bkit turns a single coding-agent request into gated, peer-reviewed engineering. Five commands — `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship` — each fans out to specialised single-purpose subagents. Many run parallel under different _lenses_ (bug review vs security review) → independent review before human sees output.

Beside those commands, more than 30 read-only audit templates live at `docs/templates/bkit-audit-*.md`. `@bkit-audit-generate` runs one and writes `docs/audits/{YYYYMM}/{slug}.md`. `/bkit-plan` takes a design, one or more of those reports, or both.

Part 1: every phase subagent in execution order, then the main audit templates. Part 2: bkit vs Gulli agentic patterns. Full audit catalogue: `.bkit/prompts.md` § Audit (Ad-hoc).

---

## Part 1 — The five-phase pipeline, in order

Each phase lists subagents in execution order. "Parallel" = same-time run, merged after; distinct lenses = multi-perspective review. Orchestrator steps (git, worktree, tracker) noted but not listed as subagents.

### Pipeline map (key steps only)

```
┌────────────────────── bkit-auto (opt-in cloud router) ─────────────────┐
│ workflow_run on feat/**  → ship (CI green) / debug (CI red)            │
│ workflow_dispatch        → any phase (ship|debug|design|plan|build)    │
│ Dispatches the matching /bkit-* skill — runs unattended in cloud       │
│ (Claude Code on the web / Cursor Background Agents / opencode).        │
│ Opt-in: `bkit install --auto=claude|cursor|opencode`. See `.bkit/cloud.md`. │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼

/bkit-design ───── output: detailed design ───────────────────────────────────
  1. fetch related       (semantic tracker search, rank order → related-issues.md)
  2. brainstorm × 3 (parallel, distinct lenses, no sibling reads)
     • pragmatic  • optimal-tradeoff  • risk / pre-mortem
  3. generate design     (synthesise across lenses + related issues)
  4. review × 2 (parallel, cross-tier models)
     • feasibility (web)  • feasibility (cross-tier)
  5. update design       (fold reviews back in)
  6. organise            (decompose into workstreams + DAG)
  7. summary             (tracker-facing)

/bkit-plan ───── output: detailed plan ───────────────────────────────────────
  1. generate plan
  2. fetch context       (tracker: related issues; ledgers: prior deferrals,
                         prior failures, strongest term-overlap first, top 40
                         → feeds all three reviewers below)
  3. review × 3 (parallel, distinct lenses)
     • tightness + design-coverage  • dependency-correctness  • regression-risk
  4. update plan         (merge critiques, max-wins on CRITICAL)
  5. scope-check × 2 (parallel)
     • internal-completeness  • scope audit (cross-family)
  6. update plan         (merge scope findings)
  7. complexity-check    (single vs split)
  8. complexity-split    (only if SPLIT)
  9. summary             (tracker-facing)

/bkit-build ─── output: code, PR to dev, CI takes over ──────────────────────
  1. install-skills
  2. execute build       (producer — implement tasks)
  3. verify build        (critic — verify each task; tick only on confirmed artifacts)
                         ↶ producer-critic loop, capped 3 attempts
  4. gaps-remediate      (fix verifier gaps, re-verify)
  5. verify build        (holistic second pass across whole plan)
  6. challenge × 2 (parallel, distinct lenses, no sibling reads)
    • bug-hunting  • security
  7. challenge-reconcile (merge findings, severity + verdict max-wins)
  8. challenge-remediate (classify-gate: architectural → FAIL; else fix + test)
  9. challenge-tests     (edge-case tests for changed files)
  10. run tests          (local tier: lint + typecheck + unit + slop:delta + bkit check;
                         no integration / e2e / @live — those run in CI)
    ↳ on test failure → /bkit-debug (debug-failure-diagnose + remediate)
  11. summary            (tracker-facing + PR link)
  → PR opened; CI runs the full multi-tier scaffold (see "CI test scaffold" below)

/bkit-debug ─── side-rail, invoked on test/CI failure ────────────────────────
  1. run tests          (broader tier than build: lint + typecheck + unit
                        + integration + e2e + optional @live canary —
                        reproduces against the deployed boundary)
  2. fetch context       (only if tests FAIL; CI: failed jobs/steps + error
                         annotations + failed-step logs; e2e test reports; local
                         test output; diff vs last-passing CI; runtime logs via
                         context-fetch blocks; tracker: related issues by error
                         signature → feeds diagnose below)
  Normal mode (localisable failure):
  3. diagnose           (reads docs/knowledge.jsonl for prior failures;
                        Standard → Pivot → Final strategy escalation)
  4. remediate          (apply diagnosis fix)
  5. re-run tests
  6. summary
    ↳ if diagnose can't localise, or loop exhausts 3 strategies → Soak mode
  Soak mode (non-localisable / runtime-only failure):
  1. soak loop          (one accumulating context per iteration:
                        instrument OR smallest evidence-backed fix;
                        strips all scaffolding before declaring a fix)
  Escape hatch:
  abort-handover       (unrecoverable failure → human handover doc + stop)

/bkit-ship ─── output: squash-merged PR, hard stop before main ──────────────
  1. conflict-resolve    (only if rebase sentinels exist)
  2. deferred-sweep      (pre-merge completeness gate; FAIL blocks merge)
  3. run tests           (wait for CI on squash-merge SHA; bkit-tests-check
                         must be green — every planned tier ran and passed;
                         a planned bkit-tests-live-web failure reds it)
  4. merge               (orchestrator-only guarded git op)
    ↳ on post-merge failure → /bkit-debug (diagnose + remediate)
  5. update-docs / summary (parallel)
  6. prune skills + worktree cleanup + close  (orchestrator-only)
```

### CI test scaffold (runs on every PR + push)

The template `bkit-ci.yml` (copied into `.bkit/templates/`, adopted and owned by the consumer) is static: two lanes run in parallel and the `bkit-tests-check` capstone joins them as the single branch-protection check. No planner. The capstone fails unless both lanes concluded `success`, and fails a unit lane that reports zero executed tests.

```
bkit-tests-static   (typecheck, format, prose lint, slop, actionlint, bkit check)
bkit-tests-unit     (unit tests; writes the executed-test count)
        │
        ▼
bkit-tests-check    (capstone: needs both lanes; sole required check)
```

Add the lanes the repo has (integration, E2E, migration, live) as further `needs:` of the capstone. Full tier rules: `docs/testing.md`.

Hard stops after Design, Plan, and Ship (production merge needs explicit human approval). Shared subagents cross-invoked: `bkit-debug-failure-diagnose` / `bkit-debug-failure-remediate` run inside Build and Ship failure paths as well as the Debug phase.

With `bkit-auto` enabled, the loop is unattended: Build opens a PR → CI runs → on green `bkit-auto` dispatches `/bkit-ship`, on red it dispatches `/bkit-debug`; debug re-pushes, CI re-runs, auto-routes again — no local session required until a human gate fires.

### Phase 1 — `/bkit-design`

Output: reviewed design (`docs/plans/{YYYYMM}/{FID}-design.md`). Hard stop for human approval.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-design-brainstorm-ideate-1` | Pragmatic | Independent design exploration. Opus, high effort. Forbidden from reading siblings (circular-reasoning guard). |
| `bkit-design-brainstorm-ideate-2` | Optimal-tradeoff | Same task, different lens. Cross-tier / native-pool diversity (Sonnet on Claude, Composer on Cursor vs Grok siblings). |
| `bkit-design-brainstorm-ideate-3` | Risk / pre-mortem | Same task, failure-mode lens. Opus, high effort. |
| `bkit-design-generate` | Synthesiser | Merges three brainstorms into one design. xhigh effort. Merges across lenses rather than collapsing to consensus. |
| `bkit-design-review-1` | Feasibility (web) | Adversarial review with live web search; checks ecosystem feasibility per capability. Opus, high. |
| `bkit-design-review-2` | Feasibility (cross-tier) | Same review in parallel, different model tier for independent judgement. |
| `bkit-design-update` | Apply review | Folds both reviews back into the design. |
| `bkit-design-organise` | Structure | Cleans and organises the final design doc. High effort. |
| `bkit-design-summary` | Summarise | Writes the tracker-facing summary (capped, scannable). |

### Phase 2 — `/bkit-plan`

Output: executable plan (`{FID}-plan.md`, split into `-plan-N.md` if too large). Consumes design. Hard stop.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-plan-generate` | Generate | Turns the design into a tasked plan. xhigh effort. |
| `bkit-plan-review-1` | Tightness + design-coverage | Read-only critique; flags vague or missing `Done when:` as CRITICAL. Opus, high. Parallel. |
| `bkit-plan-review-2` | Dependency-correctness | Same scope, dependency lens. Depth-sensitive — pinned to Opus even at medium effort. |
| `bkit-plan-review-3` | Regression-risk | Same scope, regression lens. Opus, high. Parallel. |
| `bkit-plan-update` | Apply review (merge) | Merges all three critiques, max-wins on CRITICAL findings. xhigh effort. |
| `bkit-plan-scope-check-1` | Internal-completeness | Mechanical scope audit — verifies template structure and criteria slots. Parallel. |
| `bkit-plan-scope-check-2` | Scope audit (cross-family) | Second scope audit in parallel for independent coverage. |
| `bkit-plan-update` | Apply scope fixes | Second merge pass folding scope-check findings in. |
| `bkit-plan-complexity-check` | Single → split classifier | Decides whether the plan is too big for one build and must be split. |
| `bkit-plan-complexity-split` | Splitter | If SPLIT: divides the plan into sequenced sub-plans. High effort. |
| `bkit-plan-summary` | Summarise | Tracker-facing summary. |

### Phase 3 — `/bkit-build`

Output: PR to `dev`. Heaviest phase — most steps verify rather than produce. CI takes over after PR.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-build-install-skills` | Setup | Installs the skills the plan needs for this build. |
| `bkit-build-plan-execute` | Producer | Implements the plan tasks. L-tier; iterates edit → lint/typecheck/test → edit. |
| `bkit-build-plan-verify` | Critic | Verifies each task against the plan; ticks boxes only on confirmed artifacts. Producer-critic loop, capped at 3 attempts. |
| `bkit-build-plan-gaps-remediate` | Gap-fixer | Fills gaps the verifier found, then re-verifies. |
| `bkit-build-plan-verify` | Holistic critic | Second, whole-of-plan verification pass across everything built. |
| `bkit-build-challenge-1` | Bug-hunting | Adversarial review of the full diff. Opus, high. Forbidden from reading its sibling. Parallel. |
| `bkit-build-challenge-2` | Security | Same diff, security lens. Depth-sensitive (Opus on Claude). Parallel. |
| `bkit-build-challenge-reconcile` | Merge findings | Unifies both challenges. `Severity` and verdict max-wins; downgrades need explicit justification. xhigh. |
| `bkit-build-challenge-remediate` | Fixer (classify-gate) | Any architectural finding → FAIL (no silent fixes); else applies mechanical fixes and re-runs tests. |
| `bkit-build-challenge-tests` | Test author | Adds edge-case tests for changed files; runs the test suite. |
| `bkit-debug-failure-diagnose` | Diagnostician | (If tests fail) diagnoses with Standard / Pivot / Final strategy escalation. Shared with debug. xhigh. |
| `bkit-debug-failure-remediate` | Fixer | (If tests fail) applies the diagnosed fix. |
| `bkit-build-summary` | Summarise | Tracker-facing summary plus PR link. |

### Phase 4 — `/bkit-debug`

Output: remediated commit on feature branch. Two modes — normal (diagnose → remediate localisable failure) and soak (one accumulating-context instrument-or-fix loop for non-localisable / runtime-only failures). Normal escalates to soak when diagnose can't localise, or normal loop exhausts three strategies; observation logging (`[DEBUG-OBSERVE]`) inside soak, stripped before fix ships.

**Normal mode**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-failure-diagnose` | Diagnostician | Reproduces and diagnoses. Accumulates per-attempt context; escalates Standard → Pivot → Final. xhigh. |
| `bkit-debug-failure-remediate` | Fixer | Applies whatever the strategy-aware diagnosis produced. L-tier with test loop. |
| `bkit-debug-summary` | Summarise | Tracker-facing summary. |

**Soak mode**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-failure-soak` | Instrument-or-fix loop | One accumulating context against the failing boundary; each iteration either adds `[DEBUG-OBSERVE]` instrumentation or applies the smallest evidence-backed fix, stripping all scaffolding before declaring a fix. xhigh; bounded by `SOAK_ATTEMPT` (reset per soak entry). |

**Escape hatch**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-abort-handover` | Handover | On unrecoverable failure: writes a human handover doc and stops cleanly. Shared across phases. |

### Phase 5 — `/bkit-ship`

Output: squash-merged PR, updated docs, pruned skills, torn-down worktree. Safety-critical — hard guards on production branch, explicit human approval to touch `main`.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-ship-conflict-resolve` | Conflict resolver | Resolves merge conflicts against the integration branch. Medium effort, with test gate. |
| `bkit-ship-deferred-sweep` | Pre-merge completeness gate | Builds the intended-delivery set from plan `Acceptance Scenario` sections + `Done when` lines; FAILs the merge if any unplanned gap (silent `TODO`, skipped test) is found. Declared deferrals resurfaced, never blocking. Gates only what the repo can prove — plan gate checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never gated, and no plan precondition or merge condition blocks however a log or summary restates it. |
| `bkit-debug-failure-diagnose` | Diagnostician | (If post-merge checks fail) diagnoses the regression. Shared with debug. |
| `bkit-debug-failure-remediate` | Fixer | (If post-merge checks fail) applies the fix. |
| `bkit-ship-update-docs` | Docs | Updates knowledge / decisions / completed docs. High effort. Parallel with summary. |
| `bkit-ship-summary` | Summarise | Final tracker-facing summary. Parallel with docs. |

Orchestrator-only ship steps: regression guard, merge, switch-to-dev with `--ff-only` pull + divergence re-assert, skill pruning, worktree cleanup, close. Guarded git / tracker ops orchestrator performs directly, not subagents.

### Audits

No command and no phase label. One subagent, one template per run.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-audit-generate` | One template | Runs `docs/templates/bkit-audit-*.md`. Writes `docs/audits/{YYYYMM}/{slug}.md` (`{slug}` = basename without `bkit-audit-`; same slug already in that month → `{slug}-{TIMESTAMP}.md`). Report is the template through `bkit:end`. Refines that template's `Project Instructions` below `bkit:end`. |

`/bkit-plan` reads a design doc, one or more reports, or both. The invocation names which findings are in scope. The rest of each report stays context.

More than 30 templates. Main ones:

<!-- prettier-ignore -->
| Template | Title | What it does |
| --- | --- | --- |
| `bkit-audit-security` | Security Audit | Auth, authorisation, secrets, input validation, data exposure, dependency risk — documented control that does not run. |
| `bkit-audit-privacy` | Privacy Audit | Personal data — held, where it goes, retention, deletion removes the person, disclosure matches code. |
| `bkit-audit-accessibility` | Accessibility Audit | WCAG 2.2 AA — automated-gate coverage vs gaps; manual passes nothing automates. |
| `bkit-audit-architecture` | Architecture Review | Package graph, intended layers, server / client boundary, coupling with no import edge. |
| `bkit-audit-app-performance` | App Performance Audit | Field / lab / source baseline — web, native, server — vs published thresholds and budgets. |
| `bkit-audit-reliability` | Reliability Audit | Dependency slow / down / delivered twice — dropped errors, missing timeouts, unsafe retries, races, unbounded work, unalerted failure modes. |
| `bkit-audit-testing` | Testing Audit | Suite covers must-do and must-never-do, goes red when code breaks, and runs. |
| `bkit-audit-database` | Database Audit | Privileges, access coverage, migrations, integrity, capacity, restore. |
| `bkit-audit-llm` | LLM Audit | Per model call — effect, stop on hostile input: prompts, tool bounds, output checks, limits, evals. |
| `bkit-audit-cost` | Cost Audit | Vendor plan vs use, bill drivers, spike noticed before the invoice. |

Full catalogue: `.bkit/prompts.md` § Audit (Ad-hoc).

---

## Part 2 — Comparison to agentic design patterns

Benchmark: Antonio Gulli's _Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems_. Practitioner catalogue of agentic-AI patterns. Table maps all 21 named patterns + Context Engineering against bkit.

22 patterns assessed: 12 fully implemented, 8 partial (scoped to code-shipping), 2 intentionally N/A. No foundational patterns missing.

<!-- prettier-ignore -->
| Pattern (Gulli) | bkit status | Where / note |
| --- | --- | --- |
| Prompt Chaining | Already does | Every workflow is prompt chaining at slash-command granularity. |
| Routing | Already does | `Verdict` routing (PASS/CONCERNS/FAIL), strategy escalation, CI-router dispatch to ship vs debug. |
| Parallelization | Already does | Parallel pairs and triplets, with a tighter constraint than the book: no sibling reads, plus cross-model pairing on design brainstorm / design review / plan scope-check. |
| Reflection (producer-critic) | Already does | Build execute → verify → remediate loop; plan and design generate → review → update. |
| Tool Use | Already does | Per-role minimum-capability tool allowlists — stricter than the book's additive model. |
| Planning | Already does | `/bkit-plan` is a first-class artifact with a template and durable checkbox state. |
| Multi-Agent Collaboration | Already does | 40+ subagents, orchestrator-as-coordinator; subagents are leaves (no nested orchestration). |
| Model Context Protocol (MCP) | Already does | Tracker MCP held at the workflow layer only — cleaner separation than the book's examples. |
| Exception Handling & Recovery | Already does | Universal failure path, bounded retries (3), 3600s timeouts, runaway-turn caps, human handover. |
| Human-in-the-Loop | Already does | Mandatory hard stops after design / plan / ship; "recommend, do not decide." |
| Resource-Aware Optimization | Already does | Effort-to-model tiering with explicit per-agent pins. |
| Context Engineering | Already does | Phase doc-matrix, lazy-load, output caps, stubbed-output pattern. |
| Memory Management | Partial | Filesystem and grep episodic memory (`status.jsonl`, knowledge / decisions). No vector retrieval, by scale choice. |
| Learning & Adaptation | Partial | `friction.jsonl` drives human-reviewed prompt edits; entries carry confidence, scope, and last-confirmed fields. No auto prompt-tuning — deliberate, to keep humans in the loop. |
| Goal Setting & Monitoring | Partial | Issue = goal, phase labels = state, verdicts = criteria. No measurable per-task Definition of Done yet. |
| Knowledge Retrieval (RAG) | Partial | Deterministic doc-matrix retrieval plus web search in design review. No embedding RAG (Grep wins at repo scale). |
| Reasoning Techniques | Partial | Extended thinking (CoT) plus parallel-pair-reconcile (a form of self-consistency). No formal ToT or ReAct trace. |
| Guardrails / Safety | Partial | Tool sandbox, destructive-git bans, locks, verdict checks, and an advisory edit-investigation plus gate-config hook (GateGuard). No output validators yet. |
| Evaluation & Monitoring | Partial | `friction` / `knowledge` logs, CI gates, and a catalog-parity drift check. No automated regression-fixture eval harness yet. |
| Exploration & Discovery | Partial | Divergent brainstorm triplet plus feasibility search. No temperature-spread or vote-of-K. |
| Inter-Agent Communication (A2A) | N/A by design | Agents communicate only via filesystem artifacts — deliberate, to preserve leaf-only and resume guarantees. |
| Prioritization | N/A by design | Features run in parallel, one worktree each; per-feature `.lock` blocks a second run of the same feature, repo-global `.dev.lock` serialises only `dev` writes. Ordering across features = human / tracker. |

### Where bkit goes beyond the catalogue

- **Producer-critic with circular-reasoning guard.** Sibling reviewers cannot read each other's output. Book permits self-reflection.
- **Cross-model diversity where breadth beats depth.** Design brainstorm, design review, plan scope-check groups pair Opus + Sonnet (Grok + Composer on Cursor) → two reasoners review same work. Depth-sensitive lenses (plan review, build challenge) stay on top tier.
- **Resume-from-state as single source of truth.** `status.jsonl` makes every run inspectable and restartable; book treats this only obliquely under memory.
- **Human-in-the-loop as non-negotiable.** Hard stops after design / plan / ship; book treats HITL as one option.
- **Explicit per-agent model pins.** Immune to session-default drift.
- **Provider- and host-portable execution.** Per-agent pins → `bkit install --opencode=<provider>` adds opencode host alongside Claude/Cursor — harness unchanged; inference backend moves. Same five-phase gated parallel pipeline on four providers (OpenRouter, Ollama, opencode Zen + Go gateways). Curated per-agent pins; models mirror Claude tier by default, CoT reasoners swapped for convergent-reasoning agents (debug/risk). See `.bkit/providers.md` § Hosts + Providers.
- **Cross-host/provider continuity.** State in `status.jsonl`, plan/design docs under `docs/plans/`, tracker issue — not vendor session. Every host renders from same `.bkit/` source → phase or resumed run moves across IDE/provider mid-feature with identical gates, hooks, per-agent pins: exhaust Claude weekly limit or free-tier quota → continue on another host, no re-setup. Single-vendor frameworks tie run to starting session.

### Known gaps, scoped as opportunities

Most partials = deliberate scope. Per-task `Done when:` shipped in plan template. Two remain: automated eval harness with regression fixtures for closed friction items; optional self-consistency vote (quorum-of-N) for high-stakes reviews. Neither requires leaf-agent architecture change.

---

Source: bkit workflow and prompt definitions (`.bkit/core/workflows/*`, `.bkit/core/.bkit/prompts.md`) and the Gulli differential review of _Agentic Design Patterns_.
