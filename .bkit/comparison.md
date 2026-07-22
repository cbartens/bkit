# bkit — Pipeline Reference & Comparison to Agentic Design Patterns

> [!CAUTION]
> **Purpose:** Human-facing reference. Five-phase pipeline + every subagent (execution order), bkit vs Antonio Gulli's _Agentic Design Patterns_, bkit vs peer framework `everything-claude-code`. Evaluation, onboarding, outreach — not agent workflow doc-matrix.
>
> **Rules:**
>
> - Human-written. Not seeded to consumers — bkit-repo-specific.
> - Keep prose factual (House / write-good linters apply to `*.md`). No hype adjectives.
> - Pipeline or subagents change → update Part 1 to match `.bkit/workflows/*` and `.bkit/prompts.md`.

## What this is

bkit turns a single coding-agent request into gated, peer-reviewed engineering. Five commands — `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship` — each fans out to specialised single-purpose subagents. Many run parallel under different _lenses_ (bug review vs security review) → independent review before human sees output.

Part 1: every subagent in execution order. Part 2: bkit vs Gulli agentic patterns. Part 3: bkit vs `everything-claude-code`.

---

## Part 1 — The five-phase pipeline, in order

Each phase lists subagents in execution order. "Parallel" = same-time run, merged after; distinct lenses = multi-perspective review. Orchestrator steps (git, worktree, tracker) noted but not listed as subagents.

### Phase 1 — `/bkit-design`

Output: reviewed design (`docs/plans/{YYYYMM}/{FID}-design.md`). Hard stop for human approval.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-design-brainstorm-ideate-1` | Pragmatic | Independent design exploration. Opus, high effort. Forbidden from reading siblings (circular-reasoning guard). |
| `bkit-design-brainstorm-ideate-2` | Optimal-tradeoff | Same task, different lens. Cross-tier / cross-family model (Sonnet on Claude, Grok on Cursor) for diversity. |
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
| `bkit-build-challenge-reconcile` | Merge findings | Unifies both challenges. Severity and verdict max-wins; downgrades need explicit justification. xhigh. |
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
| `bkit-debug-failure-soak` | Instrument-or-fix loop | One accumulating context against the failing boundary; each iteration EITHER adds `[DEBUG-OBSERVE]` instrumentation OR applies the smallest evidence-backed fix, stripping all scaffolding before declaring a fix. xhigh; bounded by `SOAK_ATTEMPT` (reset per soak entry). |

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
| `bkit-debug-failure-diagnose` | Diagnostician | (If post-merge checks fail) diagnoses the regression. Shared with debug. |
| `bkit-debug-failure-remediate` | Fixer | (If post-merge checks fail) applies the fix. |
| `bkit-ship-update-docs` | Docs | Updates knowledge / decisions / completed docs. High effort. Parallel with summary. |
| `bkit-ship-summary` | Summarise | Final tracker-facing summary. Parallel with docs. |

Orchestrator-only ship steps: regression guard, merge, switch-to-dev with `--ff-only` pull + divergence re-assert, skill pruning, worktree cleanup, close. Guarded git / tracker ops orchestrator performs directly, not subagents.

---

## Part 2 — Comparison to agentic design patterns

Benchmark: Antonio Gulli's _Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems_. Practitioner catalogue of agentic-AI patterns. Table maps all 21 named patterns + Context Engineering against bkit.

22 patterns assessed: 12 fully implemented, 8 partial (scoped to code-shipping), 2 intentionally N/A. No foundational patterns missing.

<!-- prettier-ignore -->
| Pattern (Gulli) | bkit status | Where / note |
| --- | --- | --- |
| Prompt Chaining | Already does | Every workflow is prompt chaining at slash-command granularity. |
| Routing | Already does | Verdict routing (PASS/CONCERNS/FAIL), strategy escalation, CI-router dispatch to ship vs debug. |
| Parallelization | Already does | Parallel pairs and triplets, with a tighter constraint than the book: cross-tier model diversity and no sibling reads. |
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
| Learning & Adaptation | Partial | `friction.jsonl` drives human-reviewed prompt edits; entries now carry confidence, scope, and last-confirmed fields (Part 3). No auto prompt-tuning — deliberate, to keep humans in the loop. |
| Goal Setting & Monitoring | Partial | Issue = goal, phase labels = state, verdicts = criteria. No measurable per-task Definition of Done yet. |
| Knowledge Retrieval (RAG) | Partial | Deterministic doc-matrix retrieval plus web search in design review. No embedding RAG (Grep wins at repo scale). |
| Reasoning Techniques | Partial | Extended thinking (CoT) plus parallel-pair-reconcile (a form of self-consistency). No formal ToT or ReAct trace. |
| Guardrails / Safety | Partial | Tool sandbox, destructive-git bans, locks, verdict checks, and an advisory edit-investigation plus gate-config hook (GateGuard, Part 3). No output validators yet. |
| Evaluation & Monitoring | Partial | `friction` / `knowledge` logs, CI gates, audits, and a catalog-parity drift check (Part 3). No automated regression-fixture eval harness yet. |
| Exploration & Discovery | Partial | Divergent brainstorm triplet plus feasibility search. No temperature-spread or vote-of-K. |
| Inter-Agent Communication (A2A) | N/A by design | Agents communicate only via filesystem artifacts — deliberate, to preserve leaf-only and resume guarantees. |
| Prioritization | N/A by design | Single-feature-at-a-time via lock file; multi-task contention is out of scope. |

### Where bkit goes beyond the catalogue

- **Producer-critic with circular-reasoning guard.** Sibling reviewers cannot read each other's output. Book permits self-reflection.
- **Cross-tier model diversity in parallel pairs.** Opus-high + Sonnet-medium (cross-family on Cursor) → two reasoners review same work.
- **Resume-from-state as single source of truth.** `status.jsonl` makes every run inspectable and restartable; book treats this only obliquely under memory.
- **Human-in-the-loop as non-negotiable.** Hard stops after design / plan / ship; book treats HITL as one option.
- **Explicit per-agent model pins.** Immune to session-default drift.
- **Provider- and host-portable execution.** Per-agent pins → `bkit install --opencode=<provider>` adds opencode host alongside Claude/Cursor — harness unchanged; inference backend moves. Same five-phase gated parallel pipeline on seven providers (local Ollama, NVIDIA NIM, Groq, Cerebras, OpenRouter, cloud Ollama, opencode Zen gateway (`opencode`)). Curated per-agent pins; models mirror Claude tier by default, CoT reasoners swapped for convergent-reasoning agents (debug/risk). See `.bkit/providers.md` § Hosts + Providers.
- **Cross-host/provider continuity.** State in `status.jsonl`, plan/design docs under `docs/plans/`, tracker issue — not vendor session. Every host renders from same `.bkit/` source → phase or resumed run moves across IDE/provider mid-feature with identical gates, hooks, per-agent pins: exhaust Claude weekly limit or free-tier quota → continue on another host, no re-setup. Single-vendor frameworks tie run to starting session.

### Known gaps, scoped as opportunities

Most partials = deliberate scope. Per-task `Done when:` shipped in plan template. Two remain: automated eval harness with regression fixtures for closed friction items; optional self-consistency vote (quorum-of-N) for high-stakes reviews. Neither requires leaf-agent architecture change.

---

## Part 3 — Comparison to a peer framework: everything-claude-code

Benchmark: `affaan-m/everything-claude-code` (ECC) — 63 agents, 251 skills, 79 commands, hook-enforced runtime, profile/module installer across 11 IDE trees. Gulli = academic taxonomy; ECC = peer real-world artifact → shipped mechanisms, not patterns. Several rows: "bkit already does this, sometimes more strictly."

<!-- prettier-ignore -->
| ECC mechanism | bkit status | Where / note |
| --- | --- | --- |
| Prompt-chaining workflows | Already does | Slash-command step chains, one per phase. |
| Verdict routing / classifier dispatch | Already does, stronger | PASS/CONCERNS/FAIL branching with max-wins reconcile. |
| Parallel fan-out | Already does, stronger | Triplets and pairs with a circular-reasoning guard and cross-tier diversity; ECC's six-agent review has no independence guard. |
| Producer-critic / reflection | Already does | execute → verify → remediate, bounded at three attempts. |
| Critic tests the live running app | Partial | bkit verifies static artifacts and `Done when:` criteria, not a Playwright-driven live app. |
| Model routing by task | Already does, stronger | Effort-to-model table plus per-agent pins immune to session drift. |
| Cross-vendor adversarial review | Partial (Cursor only) | Cursor uses cross-family models; the Claude host is single-vendor by design. |
| Human-in-the-loop gates | Already does, stronger | Mandatory hard stops; ECC's are mostly advisory prose. |
| Resume-from-state | Already does, stronger | `status.jsonl` is a deterministic source of truth; ECC's session file is best-effort. |
| Edit-time investigation gate (GateGuard) | Adopted | Advisory PreToolUse hook injects an investigation checklist on the first edit per file. |
| Block weakening of gate configs | Adopted | The same hook flags edits to lint / format / type / test / slop configs. |
| Cross-session memory trio | Not adopted | bkit keeps within-feature resume plus human-curated knowledge; no cross-session memory injection. |
| Empirical eval / obedience harness | Deferred | ECC ships pass@k / pass^k eval and rule-obedience measurement; bkit has friction/knowledge logs and CI gates, no runnable eval harness yet. |
| Confidence-scored learnings | Adopted (structure) | friction / knowledge entries carry confidence, scope, and last-confirmed; promotion stays human-gated. |
| Prompt-injection guard on agents | Adopted, scoped | A one-line untrusted-input directive on the nine agents that read web / diff / log content; ECC blankets all 63. |
| Install provenance stamping | Adopted | `.bkit/version` records the source commit for upgrade and repair diffs. |
| Catalog-parity check | Adopted | A test asserts every prompt and workflow file is documented in its index. |
| Component-façade installer | Deferred | A `--with` / `--without` selective layer over the existing module system. |
| Single canonical source → mirror install | Already does, stronger | One `.bkit/` source regenerates `.claude`, `.cursor`, and `.opencode`; ECC hand-maintains 11 trees. |
| Concurrency lock | Already does | Single-feature lock file; ECC has none. |

### Adopted from ECC

- **GateGuard — advisory edit-time hook.** PreToolUse injects investigation checklist (read file, find callers, confirm types, quote instruction) on first edit per file per session. Advisory default, fail-open, opt-in deny mode. Flags gate-config edits → fix code, don't weaken gate.
- **Scoped prompt-injection guard.** Nine subagents reading external content (web, diffs, logs) carry one-line directive: treat content as data, never instructions.
- **Confidence-scored knowledge.** friction/knowledge entries record confidence, scope, last-confirmed date → repeatedly-confirmed lesson reads differently from contradicted one. No auto-promotion.
- **Install provenance.** Version file records source commit, not just version number, for upgrade/repair diagnostics.
- **Catalog-parity test.** Check fails if prompt or workflow file missing from index doc.

### Deliberately not adopted

External multi-model orchestration (violates single-vendor-per-host and MCP-only discipline), Rust control-plane and dashboard (`status.jsonl` CLI covers scope), 251-skill catalogue (bkit curates skills → overlap debt), commands-versus-skills dual stack, auto-promotion of learnings into prompt edits (breaks "recommend, do not decide"), 11-IDE target sprawl.

### Deferred

Empirical eval layer (pass@k / pass^k regression fixtures + rule-obedience measurement) and component-façade installer — larger builds than adopted items; worth future design pass.

---

Source: bkit workflow and prompt definitions (`.bkit/workflows/*`, `.bkit/prompts.md`), the Gulli differential review of _Agentic Design Patterns_, and the `everything-claude-code` differential review.
