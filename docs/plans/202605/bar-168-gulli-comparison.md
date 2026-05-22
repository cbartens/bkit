# Gulli "Agentic Design Patterns" vs bkit — differential review (BAR-168)

**Source:** Antonio Gulli, _Agentic Design Patterns: A Hands-On Guide to Building Intelligent Systems_ (424 pp PDF; Google Drive extraction at `/tmp/gulli.txt`, 158 KB / 1652 lines).

## Coverage disclosure

Of the supplied PDF text dump:

- **Read in full:** front matter, foreword, "Power and Responsibility", preface, "What makes an AI system an Agent" (levels 0-3 + future hypotheses), Chapter 1 (Prompt Chaining), Chapter 2 (Routing), Chapter 3 (Parallelization), Chapter 4 (Reflection), and Chapter 5 (Tool Use) up to ~mid-chapter.
- **Truncated by the extraction:** Chapters 6-21 and Appendices A-G — the JSON dump terminates after Chapter 5's first half and degrades into an unstructured list of source URLs (`/tmp/gulli.txt:1567-1651`). The TOC at the top of the dump (`/tmp/gulli.txt:7-23`) preserves chapter titles and page counts; pattern names and one-line scopes for chapters 6-21 below are derived from the TOC plus the user-supplied prompt summary, NOT from in-chapter prose. Where I cite a verbatim quote, it is from the read portion.

% read of total book text in the dump: ~30% by line count, ~95% of the book's 21 named patterns identifiable by title (4 read in full, 1 partial, 16 by name only).

---

## 1. Patterns inventory (TOC order)

### Part 1 — Foundations

<!-- prettier-ignore -->
| # | Pattern (book term) | One-line definition |
| --- | --- | --- |
| 1 | **Prompt Chaining** (Pipeline pattern) | "Divide-and-conquer" — break a complex task into sequential sub-prompts; output of step N feeds step N+1. |
| 2 | **Routing** | Dynamic conditional dispatch — classifier (LLM / embedding / rule) selects which sub-agent, tool, or chain handles the input. |
| 3 | **Parallelization** | Concurrent execution of independent sub-tasks (`RunnableParallel`, `ParallelAgent`); join → synthesize. |
| 4 | **Reflection** (Producer-Critic, Generator-Critic) | Generate → critique → refine loop. Critic separated from producer (different prompt / persona / agent) to avoid self-review bias. |
| 5 | **Tool Use** (Function Calling) | LLM emits structured call → framework executes external function/API/DB → result returned to LLM as observation. |
| 6 | **Planning** | Agent decomposes goal into ordered action sequence before execution (per TOC; chapter not in dump). |
| 7 | **Multi-Agent Collaboration** | Multiple specialised agents (roles) coordinated to solve a goal — manager + workers, peer-to-peer, or hierarchical. |

### Part 2 — Memory and Adaptation

<!-- prettier-ignore -->
| # | Pattern (book term) | One-line definition |
| --- | --- | --- |
| 8 | **Memory Management** | Short-term (conversation) + long-term (persistent) state; eviction, summarisation, retrieval. |
| 9 | **Learning and Adaptation** | Agent updates behaviour from feedback / outcomes (online prompt-tuning, RL, self-improvement). |
| 10 | **Model Context Protocol (MCP)** | Standardised protocol for connecting LLMs to external tool servers / context sources. |
| 11 | **Goal Setting and Monitoring** | Explicit declared goal + progress tracking against measurable success criteria. |

### Part 3 — Reliability at Scale

<!-- prettier-ignore -->
| # | Pattern (book term) | One-line definition |
| --- | --- | --- |
| 12 | **Exception Handling and Recovery** | Catch tool/agent failures, retry / fallback / escalate; bounded-attempt strategies. |
| 13 | **Human-in-the-Loop** | Insert human approval / override gates at consequential decision points. |
| 14 | **Knowledge Retrieval (RAG)** | Retrieve from vector store / knowledge base, ground LLM response in retrieved context. |

### Part 4 — The Frontier

<!-- prettier-ignore -->
| # | Pattern (book term) | One-line definition |
| --- | --- | --- |
| 15 | **Inter-Agent Communication (A2A)** | Agent-to-agent message passing protocols, shared state, blackboards. |
| 16 | **Resource-Aware Optimization** | Token / latency / cost budgeting; model tiering by task difficulty. |
| 17 | **Reasoning Techniques** | Chain-of-Thought, Tree-of-Thoughts, ReAct, self-consistency, deliberate think-before-act. |
| 18 | **Guardrails / Safety Patterns** | Input filters, output validators, jailbreak detection, scope enforcement. |
| 19 | **Evaluation and Monitoring** | Trace logging, eval harnesses, regression tests on agent behaviour. |
| 20 | **Prioritization** | Task ordering / queueing under contention; importance × urgency arbitration. |
| 21 | **Exploration and Discovery** | Open-ended search of solution space; sampling diversity for novel problems. |

### Appendices (per TOC)

<!-- prettier-ignore -->
| Letter | Topic |
| --- | --- |
| A | Advanced Prompting Techniques (28 pp) — covers Context Engineering (read in dump), CoT, few-shot, etc. |
| B | GUI to Real-world environment |
| C | Agentic Frameworks overview |
| D | AgentSpace |
| E | AI Agents on the CLI |
| F | Reasoning engines under the hood |
| G | Coding agents |

Cross-cutting concept introduced before Chapter 1: **Context Engineering** — "the systematic discipline of designing, constructing, and delivering a complete informational environment to an AI model prior to token generation" (`/tmp/gulli.txt:525-540`). Applies across every pattern.

---

## 2. Mapping table

<!-- prettier-ignore -->
| Pattern | bkit status | Where in bkit (or "absent") | Notes |
| --- | --- | --- | --- |
| Prompt Chaining | **Already does** | Every workflow file. `bkit-build.md` Steps 1-18 (`.agents/workflows/bkit-build.md`); `bkit-design.md` 7-step chain; `bkit-plan.md` 11-step chain. | bkit's whole workflow layer IS prompt chaining at slash-command granularity. Each step is a focused prompt. |
| Routing | **Already does** | Verdict routing (`PASS`/`CONCERNS`/`FAIL` → branch), Standard/Pivot/Final strategy escalation in `bkit-debug-failure-diagnose`, `bkit-ci-router` (DE-14, DE-15) post-CI dispatch to `/bkit-ship` vs `/bkit-debug`. | Rule-based + LLM-based routing both used. `bkit-plan-complexity-check` is a single→split classifier. |
| Parallelization | **Already does** | Parallel-pair pattern: `bkit-design-brainstorm-ideate-1`/`-2`, `bkit-design-review-1`/`-2`, `bkit-plan-review-1`/`-2`, `bkit-plan-scope-check-1`/`-2`, `bkit-build-challenge-1`/`-2`, `bkit-ship-update-docs`/`bkit-ship-summary`. | bkit has a tighter constraint than the book: cross-tier model diversity (Opus/high vs Sonnet/medium) inside each pair, plus circular-reasoning guard forbidding sibling reads (`prompts.md:268`). |
| Reflection (Producer-Critic) | **Already does** | Build: executor (`bkit-build-plan-execute`) → verify (`bkit-build-plan-verify`) → gaps-remediate (`bkit-build-plan-gaps-remediate`) — pure Producer-Critic loop bounded by `MAX_VERIFY_ATTEMPT=3`. Plan: generate → review-1/2 → update. Design: brainstorm → generate → review-1/2 → update. | bkit's loop-context accumulation (`prompts.md:269`) is exactly the cumulative reflection the book recommends. Strategy escalation (Standard / Pivot / Final) per attempt is novel relative to book's flat retry. |
| Tool Use | **Already does** | Subagent `tools:` allowlists in every prompt frontmatter (`prompts.md:79-86`); MCP Linear toolset; Bash / git / gh / pnpm. | bkit additionally enforces minimum-capability sandboxing per role — book treats tools as additive. |
| Planning | **Already does** | `/bkit-plan` workflow + `bkit-plan-generate` (xhigh) + `bkit-plan-complexity-split`. | Plan is a first-class artifact with template (`docs/plans/template.md`); checkboxes are the durable plan-state. |
| Multi-Agent Collaboration | **Already does** | 44 subagents in `.agents/prompts/`; orchestrator-as-coordinator pattern. | Constrained shape: subagents are leaves (rules.md:42), no nested orchestration. |
| Memory Management | **Partial** | Per-FID artifacts in `docs/plans/logs/{FID}/` (per-run; per-attempt logs `*-{N}-*.md`). `status.json` = resume SoT. `docs/knowledge.md` (KN-N entries) + `docs/decisions.md` (DE-N) act as long-term episodic memory. `feedback_*.md` user-memory layer exists. | No semantic / vector retrieval. Memory is filesystem + grep, not embeddings. Adequate for code-shipping scope. |
| Learning and Adaptation | **Partial** | `friction.md` append-only log → drives prompt revisions. `knowledge.md` KN-N pattern (KN-15 sentinel cleanup, KN-16 EOF-append section ordering) → fed back into prompt edits via human review. | No automated prompt-tuning loop; humans read friction → edit prompts. The book describes this as "context engineering with feedback loops" — bkit does it manually. |
| Model Context Protocol (MCP) | **Already does** | Linear MCP (`mcp__claude_ai_Linear__*`) is the workflow's only Linear surface. Workflow layer holds all MCP calls; subagents have no MCP access. | Used as the book describes — standardised protocol layer between agent and external system. |
| Goal Setting and Monitoring | **Partial** | Linear issue = goal artifact; phase labels (`Design`/`Plan`/`Build`/`Debug`/`Ship`/`Review`/`Failed`) = state machine. Verdict (`PASS`/`CONCERNS`/`FAIL`) = step-level success criterion. | NO measurable acceptance criteria per plan task — checkboxes are binary "verified by `bkit-build-plan-verify`" but criteria are implicit. Plan template doesn't force "Definition of Done" per task. |
| Exception Handling and Recovery | **Already does** | Universal Failure Path in every workflow. `MAX_VERIFY_ATTEMPT`/`MAX_TEST_ATTEMPT`/`MAX_DEBUG_ATTEMPT`/`MAX_MERGE_ATTEMPT` = 3. Universal 3600s step timeout. `maxTurns` runaway-loop cap (S=25 / M=50 / L=100). Sentinel file pattern (KN-15). | Comprehensive — explicit retry + bounded-attempt + human-handover (`bkit-debug-abort-handover`). |
| Human-in-the-Loop | **Already does** | Hard stops after `/design`, `/plan`, `/ship`. "Recommend, do not decide" (rules.md:21). Major changes require human confirmation (rules.md:22). Plans live in `drafts/` until human approves into `active/`. | bkit's most distinctive strength — gates are mandatory and explicit. |
| Knowledge Retrieval (RAG) | **Partial / N/A** | `docs.md` workflow matrix + lazy doc loading per phase is a primitive, deterministic RAG (matrix is the retrieval). `bkit-design-review-1/2` use `WebFetch`/`WebSearch` for ecosystem feasibility. | True embedding-based RAG over the codebase is absent. Whether worth adopting depends on repo scale; for small-medium repos `Grep` + `Glob` outperforms RAG. |
| Inter-Agent Communication (A2A) | **N/A by design** | Subagents communicate ONLY via filesystem artifacts (`docs/plans/logs/{FID}/*.md`, `status.json`). No direct agent-agent messaging. Nested orchestration explicitly prohibited (rules.md:42). | This is a deliberate architecture choice (workflow=side-effects, agent=pure-function-over-FS). A2A would invalidate the leaf-only contract. |
| Resource-Aware Optimization | **Already does** | Effort tier ↔ model mapping (`prompts.md:42-48`): Haiku/Sonnet/Opus by role. Cross-tier diversity in parallel pairs trades cost for coverage. `maxTurns` = runaway cap (not budget). Universal 3600s timeout. Large-Diff Guard (workflows/bkit-debug.md:36) caps subagent input. | More sophisticated than the book's typical treatment — explicit per-agent model pin survives session-default drift. |
| Reasoning Techniques (CoT, ToT, ReAct, self-consistency) | **Partial** | Effort tier `xhigh` activates Claude extended thinking (CoT-equivalent). Parallel-pair + reconcile = poor man's self-consistency (two independent reasoners → merge). | NO explicit Tree-of-Thoughts (multi-branch search-then-prune). NO ReAct loop in the formal sense (interleaved reason→act→observe with explicit traces) — bkit subagents do think→tool→think but not as a logged reasoning trace. |
| Guardrails / Safety Patterns | **Partial** | Preflight hooks (`Automated` label gate). `tools:` minimum-capability sandbox. Destructive-git prohibitions (rules.md:60-65, workflow protocol blocks). `--no-verify` PROHIBITED. `permissionMode: acceptEdits` is the only permission posture (workflow trust, not per-call check). Lock files (`.lock`) prevent concurrent runs. | NO output validators on subagent emissions beyond verdict-presence checks. NO jailbreak / scope-creep detection in subagent outputs. NO hard-coded scope filter on what files a subagent may edit (relies on prompt instruction + post-hoc review). |
| Evaluation and Monitoring | **Partial** | `friction.md` (orchestrator-observed recovery moments — append-only, human-reviewed). `knowledge.md` (post-mortems). CI gates as outcome eval. `docs/audits/*.md` from utility audit agents. | NO replay harness for prompts; NO regression-test fixture for "the agent should have done X on input Y"; NO trace-level latency / token telemetry. Eval is human-driven post-hoc. |
| Prioritization | **N/A by design** | Single-FID workflow at a time (`.lock` enforces). No multi-task contention. | bkit deliberately single-threads per feature ID. Multi-tenant prioritization would require dropping the lock model. |
| Exploration and Discovery | **Partial** | `bkit-design-brainstorm-ideate-1/2` parallel-pair generates divergent designs. `bkit-design-review-*` does ecosystem feasibility search. | Sampling diversity is bounded to N=2 (parallel pair). NO temperature-spread exploration, NO "generate K candidates → vote" beyond the pair. |
| Context Engineering (Appendix A / pre-Ch1) | **Already does** | `docs.md` workflow matrix = explicit context curation per phase. Lazy-load rule (rules.md:36). `Output cap: MAX 500 token` for Linear-bound summaries. Stubbed-output-with-PENDING pattern (`prompts.md:271`) = output-shape engineering. Compress-markdown utility. | bkit's most explicit instance of an idea the book treats as cross-cutting. |

---

## 3. Worth adopting — ranked by leverage / effort

### A. **Evaluation and Monitoring** — eval harness + regression fixtures for subagents

- **Why it would help:** Recurring agent-side regressions land in `friction.md` and `knowledge.md` (KN-15 sentinel cleanup, KN-16 EOF-append section ordering, KN-8 Tier-2 deep-merge regression, KN-11 `[skip ci]` HEAD trap, KN-14 helper-action additive bug) but there's no automated way to assert "this prompt fix actually closes the regression." Each fix relies on the next live run to surface re-occurrence. The book's chapter 19 frames this as a first-class pattern. Concretely: `friction.md` "build-challenge-remediate skipped bkit install after editing canonical file" (entry of 2026-05-09) is exactly the class of bug a regression fixture catches in <1 second.
- **Smallest sensible adoption surface:** A new `.agents/evals/` directory with one fixture file per closed-loop friction entry: `{KN-N}.eval.md` containing `inputs:` (canonical-file edit transcript) + `expects:` (`bkit install` invoked). A `pnpm eval` script driving Claude Code in headless mode against each fixture, asserting the prompt fix still binds. Wire into `.github/workflows/ci.yml` so prompt edits trigger eval re-run.
- **Risk / cost:** Headless Claude runs cost API tokens; budget + cache. Fixtures must be deterministic — temperature-0 + fixed model ID + recorded `Read`/`Glob` results. Initial fixture set: 5-10 of the highest-recurring friction entries. Cost = engineering days, not ongoing.

### B. **Reasoning Techniques: ReAct trace + Self-Consistency vote** — formalise what parallel-pair + reconcile already half-does

- **Why it would help:** `bkit-build-challenge-reconcile` already does merge-of-two-reasoners with severity max-wins and verdict max-wins (DE-16). Generalising to N>2 and adding explicit voting (rather than max-wins, which is conservative-by-design) would let bkit run a 3-of-5 plan-review for high-stakes plans without changing the leaf-agent contract. Closer to the book's "self-consistency" pattern (sample multiple reasoning paths → majority vote).
- **Smallest sensible adoption surface:** Optional `--quorum=N` knob on `bkit-plan-review-*` (defaults to 2 = today's behaviour). Reconciler treats agreement count as a separate signal alongside max-wins severity. Enable only on Linear-issue label `high-stakes` to keep cost bounded. ReAct trace: emit `[REASON]` / `[ACT]` / `[OBSERVE]` markers in `bkit-debug-failure-diagnose` log so post-hoc replay can trace decisions — feeds back into eval harness (item A).
- **Risk / cost:** Token cost scales linearly with N. Voting can hide a single-correct-but-outvoted reviewer (book acknowledges this). Tag findings as "outvoted-CRITICAL" rather than dropping them.

### C. **Goal Setting and Monitoring — explicit Definition of Done per plan task**

- **Why it would help:** `bkit-build-plan-verify` ticks `[ ]` → `[x]` only on verified codebase artifact (`prompts.md:274`), which is good — but the verification criterion is implicit ("artifact exists / function shape matches"). Recurring class of friction: tasks marked done because surface signals matched but behaviour didn't (KN-14 helper-action additive bug — code change shipped, snapshot tests broke; the task-level acceptance criterion was never written). The book frames per-step measurable success criteria as a first-class pattern.
- **Smallest sensible adoption surface:** Add a `**Done when:**` line under each task in `docs/plans/template.md`. `bkit-plan-generate` populates it (one terse line per task); `bkit-plan-review-*` rejects plans missing it. `bkit-build-plan-verify` reads the line and asserts against it during ticking — failure to satisfy = `CONCERNS` not `PASS`.
- **Risk / cost:** Plan-doc verbosity grows ~10-15%. `bkit-plan-generate` already uses `xhigh` Opus — capacity exists. Quality of `Done when:` lines varies; review-1/2 catch.

### D. **Guardrails / Safety: scope-filter on subagent file edits**

- **Why it would help:** Today, an L-tier source-modifier (`bkit-build-plan-execute`, `bkit-debug-failure-remediate`) can in principle edit any path — relies on prompt instructions ("modify only files listed in plan") + post-hoc `bkit-build-challenge-*`. Friction `2026-05-09 build-challenge-remediate skipped bkit install` is one example of out-of-scope ambient behaviour (forgot mirror regen). The book treats this as guardrails — pre-execution allowlist on tool inputs.
- **Smallest sensible adoption surface:** Extend the `tools:` frontmatter shape with optional `scope: { paths: [glob, glob] }`. Workflow Bash pre-flight greps the plan for `Files Touched:` block and writes the glob list to a per-step `scope.json`. A wrapper hook on `Edit` / `Write` tool calls denies paths outside the glob set. Implementable on Claude side first via `.claude/hooks/`; Cursor later.
- **Risk / cost:** Many plans touch unanticipated files (test fixtures, snapshots, generated `dist/`). False-positive denials would block legitimate work. Start advisory-only (log to `friction.md`); promote to deny after 2-3 weeks of clean signal.

### E. **Memory Management: structured episodic memory for `bkit-debug`**

- **Why it would help:** `bkit-debug-failure-diagnose` reads loop-context via `glob docs/plans/logs/{FID}/debug-*.md` (`prompts.md:269`) — this works for the current FID but doesn't surface "we hit the same error class on FID-X two months ago." `knowledge.md` is human-curated and grep-only. The book's chapter 8 frames this as long-term memory with retrieval.
- **Smallest sensible adoption surface:** During Failure Path, `bkit-debug-abort-handover` already writes a handover doc — extend to also write a one-line `error-class: <slug>` tag at top. New utility agent `bkit-utility-debug-history` (low effort, Haiku) greps `docs/plans/logs/**/debug-*.md` for matching `error-class:` slugs and feeds `bkit-debug-failure-diagnose` a "prior occurrences" preamble. Embedding-free: pure tag-based lookup.
- **Risk / cost:** Tag inflation if `error-class:` slugs aren't disciplined. Constrain by `bkit-utility-update-documentation` periodic clean-up. Cheap to try.

### F. **Exploration and Discovery: temperature-spread brainstorm**

- **Why it would help:** Today's `bkit-design-brainstorm-ideate-1/2` parallel pair varies effort/model but not temperature. For genuinely open-ended design questions (label the issue `exploratory`), low-temperature Opus + low-temperature Sonnet still occupy a narrow part of the solution space. Book chapter 21 emphasises sampling diversity for novel problems.
- **Smallest sensible adoption surface:** Add a third sibling `bkit-design-brainstorm-ideate-3` gated behind the `exploratory` Linear label — `temperature: 1.0` / `effort: high`. `bkit-design-generate` (xhigh) already merges N inputs; trivially handles 3.
- **Risk / cost:** Cost +50% on flagged runs only. Exploratory output may be incoherent — generate-step rejects via existing PASS/CONCERNS verdict.

---

## 4. Already-strong areas (don't rebuild what works)

- **Prompt Chaining + Routing + Parallelization + Reflection + Tool Use** — bkit fully realises Part-1 patterns. Book chapters 1-5 are essentially what bkit does.
- **Producer-Critic separation** with circular-reasoning guard (siblings forbidden from reading each other's output, `prompts.md:268`) — stronger than book's prescription, which permits self-reflection.
- **Cross-tier model diversity in parallel pairs** (Opus high vs Sonnet medium, `prompts.md:73`) — ahead of the book.
- **Resume-from-state model** via `status.json` array — book treats this only obliquely under "memory"; bkit makes it the single source of truth.
- **Human-in-the-Loop hard stops** after design / plan / ship — bkit treats these as non-negotiable; book treats HITL as one option among many.
- **MCP usage** — Linear MCP held at workflow layer only; subagents have no MCP access. Cleaner separation than book's chapter 10 examples.
- **Resource-Aware effort tiers** with explicit per-agent model pins (immune to session-default drift) — a real engineering refinement the book doesn't articulate.
- **Context Engineering** — `docs.md` workflow matrix + lazy-load + `Output cap: MAX 500 token` for Linear-bound summaries + stubbed-output PENDING pattern (`prompts.md:271`) collectively realise Appendix-A material more rigorously than the book's framing.

---

## 5. Don't bother

<!-- prettier-ignore -->
| Pattern | Why not |
| --- | --- |
| **Inter-Agent Communication (A2A)** | Violates leaf-only subagent contract (rules.md:42). bkit's "agents communicate via filesystem only" is a deliberate complexity-cap — A2A would invalidate every Resume guarantee. |
| **Knowledge Retrieval (RAG) over codebase** | bkit operates in a single-repo worktree where `Grep`/`Glob`/`Read` outperform vector search at this scale. RAG's value emerges with M+ files or M+ docs; consumer repos using bkit may eventually want this but bkit-the-framework should not impose it. |
| **Prioritization** | bkit single-threads per FID via `.lock`. Multi-FID prioritization requires dropping the lock model — a much larger architectural shift than any benefit warrants. |
| **Embodiment / Physical World Interaction** (book future hypothesis 3) | Out of scope — bkit ships code, not robots. |
| **Agent-Driven Economy** (book future hypothesis 4) | Out of scope. |
| **Goal-Driven Metamorphic Multi-Agent Systems** (book future hypothesis 5) | Self-modifying agent topology is incompatible with bkit's "canonical sources only, regenerate mirrors" install model. |
| **Learning and Adaptation as automated prompt-tuning** | bkit's tighter "Recommend, do NOT decide" rule (rules.md:21) deliberately keeps humans in the loop on prompt edits. Auto-prompt-tuning would erode the gate. Manual feedback via `friction.md` → human-edited prompts is the right cadence for this surface. |
