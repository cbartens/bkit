# bkit — Comparison with Other Frameworks & Agentic Design Patterns

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

> [!CAUTION]
> **Purpose:** Human-facing reference. bkit vs other AI development frameworks, bkit vs Antonio Gulli's _Agentic Design Patterns_. Evaluation, outreach — not agent workflow doc-matrix. Five-phase pipeline + every subagent + every audit template: `.bkit/pipeline.md`.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Keep prose factual; house / write-good linters apply to `*.md`; no hype adjectives.
> - Framework table cells: each project's own repo / docs only, never roundups or AI summaries; no star counts; refresh the as-of month with the table.
> - Headings linked from outside carry a fixed `<a id>` above them; keep the id when rewording the heading.
> - Table cells about bkit (subagent counts, audit count, model pairings) → match `.bkit/pipeline.md` and `.bkit/core/.bkit/prompts.md` § Models.

**Contents**

- [What this is](#what-this-is)
- [Compared with other AI development frameworks](#frameworks)
  - [Agents and CI](#agents-and-ci)
- [Compared with agentic design patterns](#patterns)
  - [Where bkit goes beyond the catalogue](#beyond-the-book) · [Known gaps](#known-gaps)

## What this is

bkit turns a single coding-agent request into gated, peer-reviewed engineering: five commands (`/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`), 39 single-purpose subagents, 35 audit templates, same pipeline on Claude Code, Cursor, Codex, Google Antigravity and opencode. Every subagent in execution order and every audit template: [`.bkit/pipeline.md`](pipeline.md).

This doc: bkit vs 10 other AI development frameworks (one table, then agents and CI in detail), then bkit vs Gulli's agentic patterns.

Not related to [bkit Vibecoding Kit](https://github.com/popup-studio-ai/bkit-claude-code), a separate project with the same name. This bkit = `@cbartens/bkit`, [github.com/cbartens/bkit](https://github.com/cbartens/bkit).

---

<a id="frameworks"></a>

## Compared with other AI development frameworks

As of October 2026. A cross-section of 10: the closest process frameworks, the two main spec toolkits, the largest skills pack, an autonomous agent platform and an agentic IDE. Each column read from the project's own repo and docs. ✅ yes · ◐ partly · — no · ? not documented.

Kind: **Framework** runs a fixed multi-phase process · **Spec toolkit** writes specs / plans, agent does the rest · **Skills pack** library of skills / agents / commands, no fixed process · **Agent** product that writes code itself · **Editor** IDE or single-agent pair programmer. ECC is everything-claude-code.

<!-- prettier-ignore -->
|  | **bkit** | [Superpowers](https://github.com/obra/superpowers) | [gstack](https://github.com/garrytan/gstack) | [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) | [GSD Core](https://github.com/open-gsd/gsd-core) | [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) + bmad-loop | [Spec Kit](https://github.com/github/spec-kit) | [OpenSpec](https://github.com/Fission-AI/OpenSpec) | [Kiro](https://kiro.dev) (AWS) | [ECC](https://github.com/affaan-m/ECC) | [OpenHands](https://github.com/OpenHands/OpenHands) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Kind** | Framework | Framework | Skills pack (sprint) | Framework | Framework | Framework | Spec toolkit | Spec toolkit | Editor + cloud agent | Skills pack + pipeline | Agent |
| **Licence** | MIT | MIT | MIT | MIT | MIT | MIT + trademark | MIT | MIT | Closed source, paid tiers | MIT | MIT (paid cloud) |
| **Phases**<br>design, plan, build, review, fix, merge | all six | all six; no CI wait | all six; host writes code | all six; merge only if granted | all six; never merges | all six; local merge, no PR | design, plan, build | design, plan, build; merges specs | all six; never merges | all six; no merge | no design; plan partial |
| **Reviewers**<br>agents that didn't write the work | ✅ bug + security, blind to each other | ◐ per task + whole branch | ✅ up to 8 + second model | ✅ blind personas + second model | ✅ checkers + outside AI tools | ✅ 4 blind reviewers | ◐ via extensions | — | ✅ opt-in, mixed model vendors | ✅ + refuter agent | ◐ one reviewer |
| **Sign-offs**<br>stops for human approval | ✅ design, plan, merge | ✅ design, plan, merge | ✅ design, plan, merge | ◐ interactive only | ✅ roadmap, acceptance, ship | ◐ risky plans, done, epic | ✅ spec, plan | ◐ by convention | ✅ requirements, design, PR | ✅ plan, commit | ◐ per action |
| **Checked**<br>"done" proved by code, not the agent's word | ✅ tests seen failing before code | ✅ task's test must pass | ✅ test evidence tied to files | ◐ | ✅ goes stale on file change | ◐ (✅ with loop) | ◐ | ◐ spec structure only | ✅ property-based tests | ◐ | ✅ merge waits for CI |
| **CI**<br>a test pipeline for your project | ✅ fails on skipped lane / zero tests | — | ◐ basic `test.yml` | — | — | — | — | — | ◐ example | — | ◐ AI PR review only |
| **Tracker** | GitHub, Linear, Jira | — | ◐ GitHub | GitHub, Linear, Jira | — by design | GitHub, Jira, Linear, Notion, Trello | ◐ tasks → GitHub issues | ? | ◐ GitHub, GitLab | GitHub, Jira | GitHub, GitLab, Jira, Linear |
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

- **Only one with all of:** blind bug + security reviewers, sign-off after design / plan / before merge, mechanical "done" checks, a CI pipeline for your project, GitHub / Linear / Jira tracker, and file-based memory.
- **CI pipeline for your project:** none of the 10 ships a multi-lane test pipeline with a final gate. Closest: gstack's basic `test.yml`, OpenHands' AI PR-review workflow, Kiro's example. How agents use CI: [Agents and CI](#agents-and-ci).
- **Merge discipline:** merges into `dev` only after the capstone check, never `main`. OpenHands merges with no human; most stop at a PR.
- **Debug with outside evidence:** connectors pull CI logs, runtime errors and web results into diagnosis; soak mode for runtime-only bugs; handover when unfixable.
- **Test first, checked by code:** each plan task's tests are run by bkit and must fail before the task's code exists, then pass; the agent's report of a failure never counts. Superpowers enforces TDD by instruction; Task Master's TDD mode takes pass / fail counts from the agent.
- **Gaps vs the field:** no IDE or hosted service; no formal requirements notation (EARS); no embedding memory; far smaller community.

Also reviewed, left out of the table: Claude Task Master, ccpm, wshobson/agents, mattpocock/skills, SuperClaude, Ruflo, oh-my-openagent, Cline, Aider.

### Agents and CI

bkit's biggest difference from the field is how tightly its agents and its checks work together. Each row asks one question: does the framework itself do this, or is it left to you? Optional add-ons don't count. Rows run in the order of the wall in the README picture, nearest layer first. ✅ yes · ◐ partly · — no · ? not documented.

<!-- prettier-ignore -->
|  | **bkit** | Superpowers | gstack | Compound Engineering | GSD Core | BMAD | Spec Kit | OpenSpec | Kiro | ECC | OpenHands |
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

<a id="patterns"></a>

## Compared with agentic design patterns

Benchmark: Antonio Gulli's _Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems_. Practitioner catalogue of agentic-AI patterns. Table maps all 21 named patterns + Context Engineering against bkit.

22 patterns assessed: 13 fully implemented, 7 partial (scoped to code-shipping), 2 intentionally N/A. No foundational patterns missing.

<!-- prettier-ignore -->
| Pattern (Gulli) | bkit status | Where / note |
| --- | --- | --- |
| Prompt Chaining | Already does | Every workflow is prompt chaining at slash-command granularity. |
| Routing | Already does | `Verdict` routing (PASS/CONCERNS/FAIL), strategy escalation, CI-router dispatch to ship vs debug. |
| Parallelization | Already does | Parallel pairs and triplets, with a tighter constraint than the book: no sibling reads, plus cross-model pairing on design brainstorm / design review. |
| Reflection (producer-critic) | Already does | Build execute → verify → remediate loop; plan and design generate → review → update. |
| Tool Use | Already does | Per-role minimum-capability tool allowlists — stricter than the book's additive model. |
| Planning | Already does | `/bkit-plan` is a first-class artifact with a template and durable checkbox state. |
| Multi-Agent Collaboration | Already does | 39 subagents, orchestrator-as-coordinator; subagents are leaves (no nested orchestration). |
| Model Context Protocol (MCP) | Already does | Tracker MCP held at the workflow layer only — cleaner separation than the book's examples. |
| Exception Handling & Recovery | Already does | Universal failure path, bounded retries (3), 3600s timeouts, runaway-turn caps, human handover. |
| Human-in-the-Loop | Already does | Mandatory hard stops after design / plan / ship; "recommend, do not decide." |
| Resource-Aware Optimization | Already does | Effort-to-model tiering with explicit per-agent pins. |
| Context Engineering | Already does | Phase doc-matrix, lazy-load, output caps, stubbed-output pattern; consumer `context-fetch` blocks add CI, diff, e2e, runtime and web signal in debug. |
| Memory Management | Partial | Filesystem and grep episodic memory (`status.jsonl`, knowledge / decisions). No vector retrieval, by scale choice. |
| Learning & Adaptation | Partial | `friction.jsonl` drives human-reviewed prompt edits; entries carry confidence, scope, and last-confirmed fields. No auto prompt-tuning — deliberate, to keep humans in the loop. |
| Goal Setting & Monitoring | Already does | Issue = goal, phase labels = state, verdicts = criteria. Per-task `DONE WHEN:` in the plan template; verifier ticks only on confirmed artifacts; deferred-sweep FAILs merge on any unplanned gap; `stats.jsonl` tracks every run. |
| Knowledge Retrieval (RAG) | Partial | Deterministic doc-matrix retrieval plus web search in design review. No embedding RAG (Grep wins at repo scale). |
| Reasoning Techniques | Partial | Extended thinking (CoT) plus parallel-pair-reconcile (a form of self-consistency). No formal ToT or ReAct trace. |
| Guardrails / Safety | Partial | Tool sandbox, destructive-git bans, locks, verdict checks, and an advisory edit-investigation plus gate-config hook (GateGuard), and an advisory repeat-read hook (ReadGuard). `bkit steps finish` validates each step's verdict and artifacts structurally. No content-level output validators (e.g. safety classifiers). |
| Evaluation & Monitoring | Partial | `friction` / `knowledge` logs, CI gates, and a catalog-parity drift check. No automated regression-fixture eval harness yet. |
| Exploration & Discovery | Partial | Divergent brainstorm triplet plus feasibility search. No temperature-spread or vote-of-K. |
| Inter-Agent Communication (A2A) | N/A by design | Agents communicate only via filesystem artifacts — deliberate, to preserve leaf-only and resume guarantees. |
| Prioritization | N/A by design | Features run in parallel, one worktree each; per-feature `.lock` blocks a second run of the same feature; every `dev` write is built in a throwaway `origin/dev` checkout and rebuilt when `dev` moved, so features never wait on each other. Ordering across features = human / tracker. |

<a id="beyond-the-book"></a>

### Where bkit goes beyond the catalogue

- **Producer-critic with circular-reasoning guard.** Sibling reviewers cannot read each other's output. Book permits self-reflection.
- **Cross-model diversity where breadth beats depth.** Design brainstorm and design review groups pair Opus + Sonnet (Grok + Composer on Cursor) → two reasoners review same work. Depth-sensitive lenses (plan review, plan scope check, build challenge) stay on top tier.
- **Resume-from-state as single source of truth.** `status.jsonl` makes every run inspectable and restartable; book treats this only obliquely under memory.
- **Human-in-the-loop as non-negotiable.** Hard stops after design / plan / ship; book treats HITL as one option.
- **Fail-soft external context in debug.** Provider-agnostic `context-fetch` blocks (CI logs, diff, e2e, runtime, web) feed `/bkit-debug`; each self-skips to a narrated `CHECKED` / `SELF-SKIPPED` / `NOT CONFIGURED` state, so a context with no block is never read as a clean result.
- **Explicit per-agent model pins.** Immune to session-default drift.
- **Provider- and host-portable execution.** Per-agent pins → `bkit install --codex` / `--antigravity` / `--opencode=<provider>` add Codex, Google Antigravity and opencode hosts alongside Claude / Cursor — harness unchanged; inference backend moves. Same five-phase gated parallel pipeline on four BYO-key providers (OpenRouter, Ollama, opencode Zen + Go gateways) plus Google via Antigravity. Curated per-agent pins; models mirror Claude tier by default, CoT reasoners swapped for convergent-reasoning agents (debug / risk). See `.bkit/providers.md` § Supported hosts.
- **Cross-host / provider continuity.** State in `status.jsonl`, plan / design docs under `docs/plans/`, tracker issue — not vendor session. Every host renders from same `.bkit/` source → phase or resumed run moves across IDE / provider mid-feature with identical gates, hooks, per-agent pins: exhaust Claude weekly limit or free-tier quota → continue on another host, no re-setup. Single-vendor frameworks tie run to starting session.

<a id="known-gaps"></a>

### Known gaps, scoped as opportunities

Most partials = deliberate scope. Two remain: automated eval harness with regression fixtures for closed friction items; optional self-consistency vote (quorum-of-N) for high-stakes reviews. Neither requires leaf-agent architecture change.

---

Sources: each compared project's own repo and docs; the Gulli differential review of _Agentic Design Patterns_; bkit workflow and prompt definitions (`.bkit/core/workflows/*`, `.bkit/core/.bkit/prompts.md`).
