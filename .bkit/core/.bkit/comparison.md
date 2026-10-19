# bkit — Comparison, Pipeline Reference & Agentic Design Patterns

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** Human-facing reference. bkit vs other AI development frameworks, five-phase pipeline + every subagent (execution order), bkit vs Antonio Gulli's _Agentic Design Patterns_. Evaluation, onboarding, outreach — not agent workflow doc-matrix.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Keep prose factual; house / write-good linters apply to `*.md`; no hype adjectives.
> - Part 3 cells: each project's own repo / docs only, never roundups or AI summaries; no star counts; refresh the as-of month with the table.
> - Pipeline or subagents change → update Part 1 to match `.bkit/core/workflows/*` and `.bkit/core/.bkit/prompts.md`.
> - Audit templates added, removed or renamed → update the Part 1 § Audits table to match `.bkit/core/docs/templates/bkit-audit-*.md`.

**Contents**

- [What this is](#what-this-is)
- [Part 1 — The five-phase pipeline, in order](#part-1--the-five-phase-pipeline-in-order)
  - [Pipeline map](#pipeline-map-key-steps-only) · [CI test scaffold](#ci-test-scaffold-runs-on-every-pr--push)
  - [Design](#phase-1--bkit-design) · [Plan](#phase-2--bkit-plan) · [Build](#phase-3--bkit-build) · [Debug](#phase-4--bkit-debug) · [Ship](#phase-5--bkit-ship)
  - [Audits: every template](#audits)
- [Part 2 — Comparison to agentic design patterns](#part-2--comparison-to-agentic-design-patterns)
  - [Where bkit goes beyond the catalogue](#where-bkit-goes-beyond-the-catalogue) · [Known gaps](#known-gaps-scoped-as-opportunities)
- [Part 3 — Compared with other AI development frameworks](#part-3--compared-with-other-ai-development-frameworks)
  - [Agents and CI](#agents-and-ci)

## What this is

bkit turns a single coding-agent request into gated, peer-reviewed engineering. Five commands — `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship` — each fans out to specialised single-purpose subagents (48 in total, phases + audit + utilities). Many run parallel under different _lenses_ (bug review vs security review) → independent review before human sees output. Same pipeline on five hosts: Claude Code, Cursor, Codex, Google Antigravity, opencode.

Beside those commands, 35 read-only audit templates live at `docs/templates/bkit-audit-*.md`. `@bkit-audit-generate` runs one and writes `docs/audits/{YYYYMM}/{slug}.md`. `/bkit-plan` takes a design, one or more of those reports, or both.

Part 1: every phase subagent in execution order, then the main audit templates. Part 2: bkit vs Gulli agentic patterns. Part 3: bkit vs 10 other AI development frameworks, one table, then agents and CI in detail.

Not related to [bkit Vibecoding Kit](https://github.com/popup-studio-ai/bkit-claude-code), a separate project with the same name. This bkit = `@cbartens/bkit`, [github.com/cbartens/bkit](https://github.com/cbartens/bkit).

---

## Part 1 — The five-phase pipeline, in order

Each phase lists subagents in execution order. "Parallel" = same-time run, merged after; distinct lenses = multi-perspective review. Orchestrator steps (git, worktree, tracker) noted but not listed as subagents.

### Pipeline map (key steps only)

```
┌────────────────────── bkit-auto (opt-in cloud router) ─────────────────┐
│ workflow_run on feat/**  → ship (CI green) / debug (CI red)            │
│ workflow_dispatch        → ship|debug|plan|build (design: local only)  │
│ Dispatches the matching /bkit-* skill — runs unattended in cloud       │
│ (Claude Code on the web / Cursor cloud agents / opencode).               │
│ Opt-in: `bkit install --auto=claude|cursor|opencode`. See `.bkit/cloud.md`. │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼

/bkit-design ───── output: detailed design ───────────────────────────────────
  1. grill              (human interview, one decision frontier per round;
                         skipped headless: recommended answers recorded as assumed)
  2. fetch related       (semantic tracker search, rank order → related-issues.md)
  3. brainstorm × 3 (parallel, distinct lenses, no sibling reads)
     • pragmatic  • optimal-tradeoff  • risk / pre-mortem
  4. generate design     (synthesise across lenses + related issues)
  5. review × 2 (parallel, cross-tier models)
     • feasibility (web)  • operability (failure modes, observability, on-call)
  6. spike               (only if review flags load-bearing unknowns:
                         throwaway probe code, confined to the run's log folder)
  7. update design       (fold reviews + spike back in)
  8. organise            (decompose into workstreams + DAG)
  9. summary             (tracker-facing)

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
  1. plan-current        (plan still executable against code landed since it was written?)
  2. install-skills
  3. execute build       (producer — implement tasks)
  4. verify build        (critic — verify each task; tick only on confirmed artifacts)
                         ↶ producer-critic loop, capped 3 attempts
  5. gaps-remediate      (fix verifier gaps, re-verify)
  6. verify build        (holistic second pass across whole plan)
  7. challenge × 2 (parallel, distinct lenses, no sibling reads)
    • bug-hunting  • security
  8. challenge-reconcile (merge findings, severity + verdict max-wins)
  9. challenge-remediate (classify-gate: architectural → FAIL; else fix + test)
  10. challenge-tests    (edge-case tests for changed files)
  11. run tests          (local tier: lint + typecheck + unit + slop:delta + bkit check;
                         no integration / e2e / @live — those run in CI)
    ↳ on test failure → /bkit-debug (debug-failure-diagnose + remediate)
  12. summary            (tracker-facing + PR link)
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
bkit-tests-static   (typecheck, lint, format, prose lint, slop, actionlint, bkit check)
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
| `bkit-design-review-2` | Operability (cross-tier) | Parallel review on a different model tier: failure modes, observability, on-call ergonomics. |
| `bkit-design-spike` | Probe unknowns | Only when a review flags load-bearing unknowns: settles them with throwaway probe code, confined to the run's log folder. |
| `bkit-design-update` | Apply review | Folds both reviews (and the spike, if run) back into the design. |
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
| `bkit-build-plan-current` | Plan freshness | Judges whether changes landed since the plan was written leave it executable; findings feed execute. |
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

**Context fetch.** Per failed attempt, `/bkit-debug` runs each `context-fetch` bash block below `<!-- bkit:end -->` in `.agents/context.md` — failing CI logs, the diff since the last green run, end-to-end reports, runtime errors (Sentry, Vercel, Supabase, Stripe and more) and web search (Tavily) — writing one artifact per context and narrating `CHECKED` / `SELF-SKIPPED` / `NOT CONFIGURED` before fetching. Fail-soft and block-driven: bkit hardcodes no CI host, workflow filename or test framework, and a context with no block is never read as a clean result.

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

All 35 templates, by area. Template file = `docs/templates/bkit-audit-{template}.md`.

<!-- prettier-ignore -->
| Area | Audit | Template | What it finds |
| --- | --- | --- | --- |
| **Security and privacy** | Security | `security` | Holes in sign-in, permissions, secrets and input checks, plus documented protections that never run. |
| | Red team | `red-team` | Attacks a test copy of the app, never production, one hostile request at a time. Keeps each request and response, then cleans up. |
| | Privacy | `privacy` | Where personal data goes and how long it stays, whether deleting an account removes the person, whether the privacy policy matches the code. |
| **Code quality** | Architecture | `architecture` | Code that breaks the intended layers: server code reaching the client, modules tied together with no visible import. |
| | Duplication | `duplication` | One behaviour built more than once: copied rules, competing mechanisms, restated types, merges that should not have happened. |
| | Dead code | `dead-code` | Code, settings, routes, events, tables and assets that look live and never run. |
| | Slop | `slop` | Every switched-off check: disabled lint rules, casts that hide type errors, skipped tests, config opt-outs. |
| | Documentation | `documentation` | Docs that disagree with the code, links that land nowhere, facts agents rely on that nobody wrote down. |
| | Dependencies | `dependencies` | Pending dependency updates merged as one verified batch; security advisories, licences, end-of-life packages, supply-chain settings. |
| **Tests and CI** | Testing | `testing` | Tests that can't fail, don't run, or skip what the product must and must never do. |
| | Coverage | `coverage` | How much code the tests reach, against the minimum CI enforces, and the next minimum to set. |
| | Flaky tests | `flakes` | Tests that pass only on retry or fail on one platform, and the change that makes each one reliable. |
| | Gates | `gates` | Problems audits keep finding by hand that an automatic check could block, and the order to add those checks. |
| | Annotations | `annotations` | Warnings buried in green CI runs: silent failures, deprecations with a deadline, ignored lint warnings. |
| | CI performance | `ci-performance` | The lane that makes CI slow or expensive, and what each change would save. |
| **Running in production** | Reliability | `reliability` | What breaks when a service is slow, down or answers twice: missing timeouts, unsafe retries, races, failures no alert reports. |
| | Database | `database` | Who can read and write what, migrations, data integrity, capacity, and whether a restore works. |
| | Logs | `logs` | Error-tracker issues and logs sorted into real bugs, noise at the wrong level, and failures that never got reported. |
| | App performance | `app-performance` | Web, phone and server speed, measured against published targets and your own budgets. |
| | Config | `config` | Settings outside the code that disagree across environments, dashboards, repo and docs; anything with an expiry date. |
| | Cost | `cost` | Vendor plans that don't fit your usage, what drives each bill, whether a spike shows up before the invoice. |
| **Users and reach** | Accessibility | `accessibility` | What automated accessibility checks miss against WCAG 2.2 AA, plus the manual checks nothing automates. |
| | Usability | `usability` | Screens that don't match their design or the other platforms, and main flows a person can't finish. |
| | Analytics | `analytics` | Product events that don't fire, differ between web and phone, fire before consent, or carry personal data. |
| | AI search & SEO | `aio-seo` | Whether search engines and AI answer engines can find, read and describe your public pages. |
| | App Store | `app-store` | What keeps an iOS or Android app listed: deadlines, privacy declarations, permissions, signing, review readiness, crashes, ratings. |
| **AI features** | LLM | `llm` | What each AI model call can make happen, and what stops it when the input is hostile: prompts, tool limits, output checks, evals. |
| | Models | `models` | Whether each AI call uses the best current model for the job, whether models and fallbacks still exist, whether one list holds them all. |
| | Prompts | `prompts` | Product prompts that are unclear, badly structured, or off the model maker's current guide. |
| **Project upkeep** | Issues | `issues` | Size and priority for every open issue, by rules a later run applies the same way; board, parent, milestone and blocking links. |
| | Deferrals | `deferrals` | Postponed work sorted into done, replaced, tracked, parked, or in scope and never finished. |
| | Failures | `failures` | Known bugs sorted into still reachable, already fixed, misdescribed, unconfirmed, or a repeat of an earlier one. |
| | Repo | `repo` | Leftovers and layout: stale worktrees, branches and stashes, ignored files, files in the wrong place. |
| | Agents | `agents` | Each AI tool's setup: which instructions load, permissions, hooks, tool servers, model choices, untrusted input each agent reads. |
| | Adoption | `adoption` | Whether every file bkit installed is used and used correctly: install current, docs filled in, audits run on schedule, each template adopted or declined with a reason. |

Agent-facing scope per template: `.bkit/prompts.md` § Audit (Ad-hoc).

---

## Part 2 — Comparison to agentic design patterns

Benchmark: Antonio Gulli's _Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems_. Practitioner catalogue of agentic-AI patterns. Table maps all 21 named patterns + Context Engineering against bkit.

22 patterns assessed: 13 fully implemented, 7 partial (scoped to code-shipping), 2 intentionally N/A. No foundational patterns missing.

<!-- prettier-ignore -->
| Pattern (Gulli) | bkit status | Where / note |
| --- | --- | --- |
| Prompt Chaining | Already does | Every workflow is prompt chaining at slash-command granularity. |
| Routing | Already does | `Verdict` routing (PASS/CONCERNS/FAIL), strategy escalation, CI-router dispatch to ship vs debug. |
| Parallelization | Already does | Parallel pairs and triplets, with a tighter constraint than the book: no sibling reads, plus cross-model pairing on design brainstorm / design review / plan scope-check. |
| Reflection (producer-critic) | Already does | Build execute → verify → remediate loop; plan and design generate → review → update. |
| Tool Use | Already does | Per-role minimum-capability tool allowlists — stricter than the book's additive model. |
| Planning | Already does | `/bkit-plan` is a first-class artifact with a template and durable checkbox state. |
| Multi-Agent Collaboration | Already does | 48 subagents, orchestrator-as-coordinator; subagents are leaves (no nested orchestration). |
| Model Context Protocol (MCP) | Already does | Tracker MCP held at the workflow layer only — cleaner separation than the book's examples. |
| Exception Handling & Recovery | Already does | Universal failure path, bounded retries (3), 3600s timeouts, runaway-turn caps, human handover. |
| Human-in-the-Loop | Already does | Mandatory hard stops after design / plan / ship; "recommend, do not decide." |
| Resource-Aware Optimization | Already does | Effort-to-model tiering with explicit per-agent pins. |
| Context Engineering | Already does | Phase doc-matrix, lazy-load, output caps, stubbed-output pattern; consumer `context-fetch` blocks add CI, diff, e2e, runtime and web signal in debug. |
| Memory Management | Partial | Filesystem and grep episodic memory (`status.jsonl`, knowledge / decisions). No vector retrieval, by scale choice. |
| Learning & Adaptation | Partial | `friction.jsonl` drives human-reviewed prompt edits; entries carry confidence, scope, and last-confirmed fields. No auto prompt-tuning — deliberate, to keep humans in the loop. |
| Goal Setting & Monitoring | Already does | Issue = goal, phase labels = state, verdicts = criteria. Per-task `Done when:` in the plan template; verifier ticks only on confirmed artifacts; deferred-sweep FAILs merge on any unplanned gap; `stats.jsonl` tracks every run. |
| Knowledge Retrieval (RAG) | Partial | Deterministic doc-matrix retrieval plus web search in design review. No embedding RAG (Grep wins at repo scale). |
| Reasoning Techniques | Partial | Extended thinking (CoT) plus parallel-pair-reconcile (a form of self-consistency). No formal ToT or ReAct trace. |
| Guardrails / Safety | Partial | Tool sandbox, destructive-git bans, locks, verdict checks, and an advisory edit-investigation plus gate-config hook (GateGuard), and an advisory repeat-read hook (ReadGuard). `bkit steps finish` validates each step's verdict and artifacts structurally. No content-level output validators (e.g. safety classifiers). |
| Evaluation & Monitoring | Partial | `friction` / `knowledge` logs, CI gates, and a catalog-parity drift check. No automated regression-fixture eval harness yet. |
| Exploration & Discovery | Partial | Divergent brainstorm triplet plus feasibility search. No temperature-spread or vote-of-K. |
| Inter-Agent Communication (A2A) | N/A by design | Agents communicate only via filesystem artifacts — deliberate, to preserve leaf-only and resume guarantees. |
| Prioritization | N/A by design | Features run in parallel, one worktree each; per-feature `.lock` blocks a second run of the same feature, repo-global `.dev.lock` serialises only `dev` writes. Ordering across features = human / tracker. |

### Where bkit goes beyond the catalogue

- **Producer-critic with circular-reasoning guard.** Sibling reviewers cannot read each other's output. Book permits self-reflection.
- **Cross-model diversity where breadth beats depth.** Design brainstorm, design review, plan scope-check groups pair Opus + Sonnet (Grok + Composer on Cursor) → two reasoners review same work. Depth-sensitive lenses (plan review, build challenge) stay on top tier.
- **Resume-from-state as single source of truth.** `status.jsonl` makes every run inspectable and restartable; book treats this only obliquely under memory.
- **Human-in-the-loop as non-negotiable.** Hard stops after design / plan / ship; book treats HITL as one option.
- **Fail-soft external context in debug.** Provider-agnostic `context-fetch` blocks (CI logs, diff, e2e, runtime, web) feed `/bkit-debug`; each self-skips to a narrated `CHECKED` / `SELF-SKIPPED` / `NOT CONFIGURED` state, so a context with no block is never read as a clean result.
- **Explicit per-agent model pins.** Immune to session-default drift.
- **Provider- and host-portable execution.** Per-agent pins → `bkit install --codex` / `--antigravity` / `--opencode=<provider>` add Codex, Google Antigravity and opencode hosts alongside Claude/Cursor — harness unchanged; inference backend moves. Same five-phase gated parallel pipeline on four BYO-key providers (OpenRouter, Ollama, opencode Zen + Go gateways) plus Google via Antigravity. Curated per-agent pins; models mirror Claude tier by default, CoT reasoners swapped for convergent-reasoning agents (debug/risk). See `.bkit/providers.md` § Hosts + Providers.
- **Cross-host/provider continuity.** State in `status.jsonl`, plan/design docs under `docs/plans/`, tracker issue — not vendor session. Every host renders from same `.bkit/` source → phase or resumed run moves across IDE/provider mid-feature with identical gates, hooks, per-agent pins: exhaust Claude weekly limit or free-tier quota → continue on another host, no re-setup. Single-vendor frameworks tie run to starting session.

### Known gaps, scoped as opportunities

Most partials = deliberate scope. Two remain: automated eval harness with regression fixtures for closed friction items; optional self-consistency vote (quorum-of-N) for high-stakes reviews. Neither requires leaf-agent architecture change.

---

## Part 3 — Compared with other AI development frameworks

As of October 2026. A cross-section of 10: the closest process frameworks, the two main spec toolkits, the largest skills pack, an autonomous agent platform and an agentic IDE. Each column read from the project's own repo and docs. ✅ yes · ◐ partly · — no · ? not documented.

Kind: **Framework** runs a fixed multi-phase process · **Spec toolkit** writes specs / plans, agent does the rest · **Skills pack** library of skills / agents / commands, no fixed process · **Agent** product that writes code itself · **Editor** IDE or single-agent pair programmer. ECC is everything-claude-code.

<!-- prettier-ignore -->
| | **bkit** | [Superpowers](https://github.com/obra/superpowers) | [gstack](https://github.com/garrytan/gstack) | [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) | [GSD Core](https://github.com/open-gsd/gsd-core) | [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) + bmad-loop | [Spec Kit](https://github.com/github/spec-kit) | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | [Kiro](https://kiro.dev) (AWS) | [ECC](https://github.com/affaan-m/ECC) | [OpenHands](https://github.com/OpenHands/OpenHands) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Kind** | Framework | Framework | Skills pack (sprint) | Framework | Framework | Framework | Spec toolkit | Spec toolkit | Editor + cloud agent | Skills pack + pipeline | Agent |
| **Licence** | MIT | MIT | MIT | MIT | MIT | MIT + trademark | MIT | MIT | Closed source, paid tiers | MIT | MIT (paid cloud) |
| **Phases**<br>design, plan, build, review, fix, merge | all six | all six; no CI wait | all six; host writes code | all six; merge only if granted | all six; never merges | all six; local merge, no PR | design, plan, build | design, plan, build; merges specs | all six; never merges | all six; no merge | no design; plan partial |
| **Reviewers**<br>agents that didn't write the work | ✅ bug + security, blind to each other | ◐ per task + whole branch | ✅ up to 8 + second model | ✅ blind personas + second model | ✅ checkers + outside AI tools | ✅ 4 blind reviewers | ◐ via extensions | — | ✅ opt-in, mixed model vendors | ✅ + refuter agent | ◐ one reviewer |
| **Sign-offs**<br>stops for human approval | ✅ design, plan, merge | ✅ design, plan, merge | ✅ design, plan, merge | ◐ interactive only | ✅ roadmap, acceptance, ship | ◐ risky plans, done, epic | ✅ spec, plan | ◐ by convention | ✅ requirements, design, PR | ✅ plan, commit | ◐ per action |
| **Checked**<br>"done" proved by code, not the agent's word | ✅ tests seen failing before code | ✅ task's test must pass | ✅ test evidence tied to files | ◐ | ✅ goes stale on file change | ◐ (✅ with loop) | ◐ | ◐ spec structure only | ✅ property-based tests | ◐ | ✅ merge waits for CI |
| **CI**<br>a test pipeline for your project | ✅ fails on skipped lane / zero tests | — | ◐ basic `test.yml` | — | — | — | — | — | ◐ example | — | ◐ AI PR review only |
| **Tracker** | GitHub, Linear | — | ◐ GitHub | GitHub, Linear, Jira | — by design | GitHub, Jira, Linear, Notion, Trello | ◐ tasks → GitHub issues | ? | ◐ GitHub, GitLab | GitHub, Jira | GitHub, GitLab, Jira, Linear |
| **Memory**<br>lessons and decisions later runs read | ✅ | — | ✅ outside repo | ✅ `docs/solutions/` | ✅ | ◐ | ◐ constitution | ◐ living specs | ◐ | ✅ | ◐ opt-in |
| **Docs**<br>project docs kept current | ✅ | — | ✅ | ◐ | ◐ | ◐ | ◐ | ◐ specs | ◐ | ◐ | ◐ AGENTS.md |
| **Parallel**<br>several features at once, isolated | ✅ | ◐ | ◐ via Conductor | ◐ | ✅ | ◐ | ◐ via extensions | ◐ | ✅ 10 cloud sandboxes | ◐ | ✅ containers |
| **Cloud**<br>runs unattended, triggered or hosted | ✅ ship on green, debug on red | ? | ◐ stops at gates | ◐ scheduler | ◐ local | ◐ local | ◐ | ◐ via Copilot agent | ✅ | ◐ | ✅ |
| **Guards**<br>hooks that block dangerous actions | ✅ all hosts | ◐ prompt rules | ◐ opt-in, Claude Code only | ◐ prompt rules | ◐ blocks `.env` reads | — | — | ? | ✅ | ✅ GateGuard | ✅ sandbox + hooks |
| **Audits**<br>audit / checklist templates | ✅ 35 | — | ✅ ~10 + 8 checklists | ◐ reviewer personas | ◐ ~8 | ◐ 5 lenses | ◐ checklists | ? | ? | ✅ ~25 | ◐ |
| **AI tools** | 5 | 16 | 1 certified, 7 experimental | ~14 | 15 | 10+ | 40+ | 30+ | own IDE, CLI, web, mobile | 1 stable, ~15 beta / experimental | own UI / CLI / cloud, ACP editors |

Where others are ahead of bkit:

- **Superpowers:** skills trigger automatically; skill eval harness; official marketplaces.
- **gstack:** real-browser and iOS device QA; design mockups; deploy + canary monitoring; prompt-injection defences.
- **Compound Engineering:** learnings shared across repos; Jira; stacked-PR babysitting; Slack / GitHub feedback → plan.
- **GSD Core:** cross-tool plan review; ship blocked by open security threats; cross-project learnings.
- **BMAD:** Agile roles and artifacts (PRD, UX spec, epics, stories); most trackers.
- **Spec Kit:** most AI tools; 181 community extensions; workflow engine for custom processes.
- **OpenSpec:** light to adopt; made for existing code (spec deltas → living specs); multi-repo planning (beta).
- **Kiro:** full product; EARS requirements; workflow rules enforced by runtime; enterprise SSO.
- **ECC:** largest library (70+ agents, 300+ skills); finding refutation; hosted skill generator.
- **OpenHands:** sandboxed and hosted execution; issue-to-merge with no human; Jira, GitLab.

Where bkit stands apart, per the table:

- **Only one with all of:** blind bug + security reviewers, sign-off after design / plan / before merge, mechanical "done" checks, a CI pipeline for your project, GitHub / Linear tracker, and file-based memory.
- **CI pipeline for your project:** none of the 10 ships a multi-lane test pipeline with a final gate. Closest: gstack's basic `test.yml`, OpenHands' AI PR-review workflow, Kiro's example. How agents use CI: [Agents and CI](#agents-and-ci).
- **Merge discipline:** merges into `dev` only after the capstone check, never `main`. OpenHands merges with no human; most stop at a PR.
- **Debug with outside evidence:** connectors pull CI logs, runtime errors and web results into diagnosis; soak mode for runtime-only bugs; handover when unfixable.
- **Test first, checked by code:** each plan task's tests are run by bkit and must fail before the task's code exists, then pass; the agent's report of a failure never counts. Superpowers enforces TDD by instruction; Task Master's TDD mode takes pass / fail counts from the agent.
- **Gaps vs the field:** no IDE or hosted service; no Jira; no formal requirements notation (EARS); no embedding memory; far smaller community.

Also reviewed, left out of the table: Claude Task Master, ccpm, wshobson/agents, mattpocock/skills, SuperClaude, Ruflo, oh-my-openagent, Cline, Aider.

### Agents and CI

bkit's biggest difference from the field is how tightly its agents and its checks work together. Each row asks one question: does the framework itself do this, or is it left to you? Optional add-ons don't count. Rows run in the order of the wall in the README picture, nearest layer first. ✅ yes · ◐ partly · — no · ? not documented.

<!-- prettier-ignore -->
| | **bkit** | Superpowers | gstack | Compound Engineering | GSD Core | BMAD | Spec Kit | OpenSpec | Kiro | ECC | OpenHands |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Code search**<br>definitions and callers, not text matches | ✅ Serena template | — | ✅ opt-in; definitions, callers | — | ◐ opt-in graph, planners only | — | — | — | ✅ built in, 18 languages | — | — |
| **Agent hooks**<br>steer the agent around each edit | ✅ read before editing, don't loosen checks; 4 hosts | — | ✅ opt-in verify gate, Claude Code only | — | ✅ read before editing | ◐ add-on test-quality hook | — | — | ◐ engine; you write the hooks | ✅ GateGuard, config lock, post-edit type check | — engine only |
| **Git hooks**<br>for your project, same checks as CI | ✅ pre-commit formats; pre-push runs the agents' gate scripts | — | ◐ opt-in pre-push, credentials only | — | ◐ opt-in pre-commit, planning files | — | — | — | — | ◐ Codex only; checks opt-in | ◐ pre-commit on request |
| **Ships CI**<br>ending in one "every lane passed" check | ✅ fails on a failed or skipped lane, or zero tests | — | ◐ one `test.yml`, no final check | — | — | ◐ optional TEA module | — | — | ◐ AI-review example | — | ◐ AI review and QA bots |
| **Waits for CI**<br>before merging or calling it done | ✅ green on the exact merge commit | — local suite only | ✅ exact head | ✅ `lfg` and PR babysitter | — left to you | — | — | — | ✅ opt-in workflows | ◐ | ✅ |
| **Reads CI logs**<br>on red, diagnoses from them | ✅ failed lanes, diff since last green | — | ◐ deploy failure or `/investigate` | ✅ failing jobs and log tails | — | — | — | — | ◐ failed check names, no logs | ◐ by instruction | ✅ failed-job logs |
| **CI starts next step**<br>fix on red, merge on green, no human | ✅ `bkit:auto`: ship on green, debug on red | — | — stops on red | ✅ watcher fixes and pushes | — | — | — | — | ✅ wakes the agent; never merges | — | ✅ automations; merger with no AI |
| **Tests mapped to lanes**<br>planning picks each test's tier | ✅ unit, integration or end-to-end | — | ◐ `/ship` fails a file with no lane | ◐ scenarios, no lane | ◐ unit / end-to-end split, no lane | ◐ TEA module only | ◐ optional contract tests | — | ◐ | ◐ tiers, no lane | ? |

- **Only one with all eight.** Compound Engineering and OpenHands also close the CI loop, fixing on red with no human, but neither ships a test pipeline or edit hooks for your project. gstack and ECC have strong edit hooks, but gstack hands a red CI result back to you and ECC doesn't watch CI.
- **Only one whose git hooks run the same checks as its CI.** None of the 10 does; most ship no git hooks for your project at all.
- **Ahead of bkit here:**
  - ECC's hooks block where bkit's advise. It refuses edits to an existing lint or format config, refuses the first edit of each file until the agent answers its questions, and runs type checks and formatting after each edit.
  - gstack's opt-in gate won't let a turn end until a declared test command passes. `/freeze` keeps the agent inside one folder and switches on by itself when debugging.
  - Kiro's symbol search needs no install and covers 18 languages; Serena needs a language server per language.
  - gstack maps every changed file to a lane read from your CI workflow files, and blocks publishing until a lane your laptop can't run has passed in CI.
  - Compound Engineering re-runs flaky failures instead of debugging them, and notices when its fixes go in circles. It and Kiro wait for CI with a plain script that wakes the agent only on change.
  - OpenHands merges through a step with no AI in it, and closes pull requests that stay red for 14 days.
  - BMAD's TEA module generates CI for five platforms, splits tests across parallel runners, re-runs tests to catch flaky ones, and blocks bad tests as they're written.

---

Sources: bkit workflow and prompt definitions (`.bkit/core/workflows/*`, `.bkit/core/.bkit/prompts.md`); the Gulli differential review of _Agentic Design Patterns_ (Part 2); each compared project's own repo and docs (Part 3).
