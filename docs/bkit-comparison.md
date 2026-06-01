# bkit — Pipeline Reference & Comparison to Agentic Design Patterns

> [!CAUTION]
> **Purpose:** Human-facing reference. Documents the five-phase pipeline and every subagent it runs (in execution order), and maps bkit against the patterns in Antonio Gulli's _Agentic Design Patterns_. Used for evaluation, onboarding, and outreach — not part of the agent workflow doc-matrix.
>
> **Rules:**
>
> - Human-written. Not seeded to consumers — bkit-repo-specific.
> - Keep prose factual (House / write-good linters apply to `*.md`). No hype adjectives.
> - When the pipeline or subagents change, update Part 1 to match `.bkit/workflows/*` and `.bkit/prompts.md`.

## What this is

bkit turns a single request to a coding agent into a gated, peer-reviewed engineering process. Work flows through five commands — `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship` — and each phase fans the work out to specialised, single-purpose subagents. Many run in parallel under different _lenses_ (for example, one reviews for bugs while another reviews for security), so output is reviewed by independent agents before a human sees it.

Part 1 lists every subagent in execution order. Part 2 maps bkit against an external reference catalogue of agentic patterns.

---

## Part 1 — The five-phase pipeline, in order

Each phase lists its subagents in execution order. "Parallel" means agents run at the same time and are merged afterwards; where they carry distinct lenses, those are noted, because that is the source of the multi-perspective review. Steps run by the orchestrator itself (git, worktree setup, tracker updates) are noted but not listed as subagents.

### Phase 1 — `/bkit-design`

Output: a reviewed design document (`docs/plans/{YYYYMM}/{FID}-design.md`). Hard stop for human approval at the end.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-design-brainstorm-ideate-1` | Pragmatic | Independent design exploration. Opus, high effort. Forbidden from reading siblings (circular-reasoning guard). |
| `bkit-design-brainstorm-ideate-2` | Optimal-tradeoff | Same task, different lens. Cross-tier / cross-family model (Sonnet on Claude, GPT on Cursor) for diversity. |
| `bkit-design-brainstorm-ideate-3` | Risk / pre-mortem | Same task, failure-mode lens. Opus, high effort. |
| `bkit-design-generate` | Synthesiser | Merges the three brainstorms into one design. xhigh effort. Merges across lenses rather than collapsing to consensus. |
| `bkit-design-review-1` | Feasibility (web) | Adversarial review with live web search; checks ecosystem feasibility per capability. Opus, high. |
| `bkit-design-review-2` | Feasibility (cross-tier) | Same review in parallel, different model tier for independent judgement. |
| `bkit-design-update` | Apply review | Folds both reviews back into the design. |
| `bkit-design-organise` | Structure | Cleans and organises the final design doc. High effort. |
| `bkit-design-summary` | Summarise | Writes the tracker-facing summary (capped, scannable). |

### Phase 2 — `/bkit-plan`

Output: an executable plan (`{FID}-plan.md`, split into `-plan-N.md` if too large). Consumes the design. Hard stop at the end.

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

Output: a pull request to `dev`. The heaviest phase — most steps verify the work rather than produce it. CI takes over after the PR.

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

Output: a remediated commit pushed to the feature branch. Two modes — normal (fix a known failure) and observe (instrument → analyse → revert).

**Normal mode**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-failure-diagnose` | Diagnostician | Reproduces and diagnoses. Accumulates per-attempt context; escalates Standard → Pivot → Final. xhigh. |
| `bkit-debug-failure-remediate` | Fixer | Applies whatever the strategy-aware diagnosis produced. L-tier with test loop. |
| `bkit-debug-summary` | Summarise | Tracker-facing summary. |

**Observe mode**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-observe-instrument` | Instrument | Adds targeted logging / tracing to surface the bug. High effort. |
| `bkit-debug-observe-analyse` | Analyse | Reads what the instrumentation revealed and pinpoints cause. |
| `bkit-debug-observe-revert` | Clean up | Reverts the instrumentation so diagnostic scaffolding never ships. |

**Escape hatch**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-abort-handover` | Handover | On unrecoverable failure: writes a human handover doc and stops cleanly. Shared across phases. |

### Phase 5 — `/bkit-ship`

Output: a squash-merged PR, updated docs, pruned skills, and a torn-down worktree. The safety-critical phase — hard guards around the production branch, and explicit human approval to touch `main`.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-ship-conflict-resolve` | Conflict resolver | Resolves merge conflicts against the integration branch. Medium effort, with test gate. |
| `bkit-debug-failure-diagnose` | Diagnostician | (If post-merge checks fail) diagnoses the regression. Shared with debug. |
| `bkit-debug-failure-remediate` | Fixer | (If post-merge checks fail) applies the fix. |
| `bkit-ship-update-docs` | Docs | Updates knowledge / decisions / completed docs. High effort. Parallel with summary. |
| `bkit-ship-summary` | Summarise | Final tracker-facing summary. Parallel with docs. |

Orchestrator-only steps in ship: regression guard, the merge itself, switch-to-dev with `--ff-only` pull plus divergence re-assert, skill pruning, worktree cleanup, and close. These are guarded git / tracker operations the orchestrator performs directly, not subagents.

---

## Part 2 — Comparison to agentic design patterns

Benchmark: Antonio Gulli's _Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems_. Gulli is a Google engineering director, and the book reads as a practitioner catalogue of agentic-AI patterns. The table below maps every one of its 21 named patterns plus its cross-cutting Context Engineering discipline against what bkit does.

Of 22 patterns assessed: 12 fully implemented, 7 partial (deliberately scoped to code-shipping), 3 intentionally not applicable. None of the foundational patterns are missing.

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
| Memory Management | Partial | Filesystem and grep episodic memory (`status.json`, knowledge / decisions). No vector retrieval, by scale choice. |
| Learning & Adaptation | Partial | `friction.md` drives human-reviewed prompt edits. No auto prompt-tuning — deliberate, to keep humans in the loop. |
| Goal Setting & Monitoring | Partial | Issue = goal, phase labels = state, verdicts = criteria. No measurable per-task Definition of Done yet. |
| Knowledge Retrieval (RAG) | Partial | Deterministic doc-matrix retrieval plus web search in design review. No embedding RAG (Grep wins at repo scale). |
| Reasoning Techniques | Partial | Extended thinking (CoT) plus parallel-pair-reconcile (a form of self-consistency). No formal ToT or ReAct trace. |
| Guardrails / Safety | Partial | Tool sandbox, destructive-git bans, locks, verdict checks. No output validators or edit-path scope filter yet. |
| Evaluation & Monitoring | Partial | `friction` / `knowledge` logs plus CI gates and audits. No automated regression-fixture eval harness yet. |
| Exploration & Discovery | Partial | Divergent brainstorm triplet plus feasibility search. No temperature-spread or vote-of-K. |
| Inter-Agent Communication (A2A) | N/A by design | Agents communicate only via filesystem artifacts — deliberate, to preserve leaf-only and resume guarantees. |
| Prioritization | N/A by design | Single-feature-at-a-time via lock file; multi-task contention is out of scope. |

### Where bkit goes beyond the catalogue

- **Producer-critic with a circular-reasoning guard.** Sibling reviewers cannot read each other's output. The book permits self-reflection.
- **Cross-tier model diversity in parallel pairs.** Opus-high paired with Sonnet-medium (cross-family on Cursor), so two different reasoners review the same work.
- **Resume-from-state as the single source of truth.** `status.json` makes every run inspectable and restartable; the book treats this only obliquely under memory.
- **Human-in-the-loop as non-negotiable.** Hard stops after design / plan / ship; the book treats HITL as one option among many.
- **Explicit per-agent model pins.** Immune to session-default drift.

### Known gaps, scoped as opportunities

Most partials are deliberate scope choices. Three are flagged in the source review as worth adopting: an automated eval harness with regression fixtures for closed friction items; a per-task `Done when:` line in the plan template; and an optional self-consistency vote (quorum-of-N) for high-stakes reviews. None require changing the leaf-agent architecture.

---

Source: bkit workflow and prompt definitions (`.bkit/workflows/*`, `.bkit/prompts.md`) and the BAR-168 differential review of Gulli, _Agentic Design Patterns_ (`docs/plans/202605/bar-168-gulli-comparison.md`).
