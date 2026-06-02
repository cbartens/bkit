# Agent Prompts Index

> [!CAUTION]
> **Purpose:** Index of `.bkit/prompts/*.md` — description, frontmatter, rationale, settings.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Subagents are leaves, NEVER invoke other subagents.
> - One row per agent — `Name | Scope | maxTurns | Recommended | Rationale`.
> - Update when an agent's tools / effort / step count changes materially.

## Prompt Authoring Rules

`.bkit/prompts/*.md` are AI-only execution surfaces. Every byte is paid on every run.

- **Instructions only:** NO rationale, NO parentheticals explaining "why", NO inline comments justifying behaviour.
- **Removal = delete:** When dropping an instruction, delete it. NEVER replace it with an explanation of the removal.
- **Self-contained:** Each prompt file MUST stand alone. NO cross-references to `.bkit/prompts.md` or other meta docs. If the agent needs the rule, inline it; if it doesn't, leave it out.
- **Standalone-runnable:** Each prompt works invoked outside any workflow. All inputs arrive via orchestrator-supplied Read paths. Multi-agent coordination uses the `**Parallel:**` and `**Lens discipline:**` Contract clauses.
- **Generic Role, specific Process:** `Role:` and `description:` anchor on seniority titles ("Senior X", "Veteran X"). Lens-specific behaviour lives in Process steps. Where sibling lenses define distinct disciplines, the lens MAY differentiate the `Role:` line; siblings still share the seniority anchor. Where the lens is a priority weighting rather than a discipline, `Role:` lines MUST be identical and lens lives entirely in Process.
- **Rationale lives here:** Decisions, trade-offs, history, meta-commentary belong in this file (`.bkit/prompts.md`) — NEVER in the per-agent prompt files.
- **Reuse wording and formatting:** ALWAYS `grep .bkit/prompts/` before writing. Copy closest existing phrasing AND formatting verbatim — backtick conventions, indentation, line breaks, punctuation, spacing.
- **Cross-prompt alignment:** ALWAYS change shared lines in ALL prompts using them.
- **Procedural conditionals:** Any flow-gating conditional uses bold `**If** {condition} → {action}.` (with `**Else** → {action}.` for branches), regardless of syntactic shape. Test: if reordering reads as "If {X}, {Y}" naturally, it IS one. Excludes inline qualifiers (`if any`, `if defined`), dispatch tables (`PASS = …`, `STANDARD → …`), iteration (`For each …`), bash inside backticks, and output-template placeholders.
- **ASCII operators:** Use ASCII comparison/logic operators only — `!=`, `>=`, `<=`, `=>` — and `x` for "times"/dimensions. NEVER Unicode math glyphs (not-equal, greater-or-equal, less-or-equal, implies, multiplication). The flow-arrow `→` in procedural conditionals / dispatch tables is the **sole intentional non-ASCII glyph** — deliberately kept (it is the uniform, documented flow notation used in every conditional, not a stray operator; it reads clearer than `->`, which is also overloaded as member-access). Do NOT convert `→`.
- **Variable references:** In prose, variable names / field labels / placeholder identifiers go in backticks. Two forms with distinct meaning: bare `VAR` = reference (conditionals, schema); `{VAR}` = interpolation site (orchestrator substitutes value — paths, JSON, commit msgs, Context payloads). Operators stay outside (`VERIFY_ATTEMPT` = 0). Singular literal enum values stay plain when compared (**If** `VERDICT` = PASS); enum unions are one backticked unit (`PASS|CONCERNS|FAIL`). Inside fenced output-format blocks: keep plain. NEVER use `${VAR}` outside bash code fences.
- **Output section shape** content drives format:
  - Section content is a list of **short structured fields** (single-phrase values, enum picks, one-sentence answers) → flat bracket: `[Field1 (hint), Field2 (hint), Field3 (hint)]`. One bracketed line, comma-separated.
  - Section content is **freeform, multi-finding, or multi-paragraph** (prose, prioritised lists, per-item findings, tables) → its own heading + bracketed instruction: `## Section\n\n[Instructions describing what goes here; initially set to `PENDING`.]`
  - Mixed sections (some short fields + some freeform) → split into sub-headings (H3) under one H2; each sub-heading follows the rule above.
- **Output Lens line:** Parallel-sibling outputs carry one `Lens:` line directly under the H1 (deliverable name) to identify the lens that generated the artifact. Pattern: `Lens: {Name} — {comma-separated qualifiers}.` or compact `Lens: {field list}.` Single-line, no blank inside, blank line before next heading.

## Frontmatter Conventions

```yaml
---
name: <kebab-case> # MUST match filename
description: <one sentence> # action verb only — H1 in body carries deliverable name
effort: low | medium | high | xhigh | max # thinking budget; required on Claude side
model: <claude-model-id> # explicit Claude model pin (REQUIRED); locks model independent of user's session default
tools: [Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch]
permissionMode: acceptEdits # standard for in-pipeline agents — disables mid-run prompts
maxTurns: <int> # safety cap on agent turns (NOT runtime budget)
---
```

**Effort → Claude model mapping (canonical):**

<!-- prettier-ignore -->
| Effort | Claude model | Rationale |
| --- | --- | --- |
| `low` | `claude-haiku-4-5-20251001` | Pure synthesizers / summary writers. Fast + cheap; no deep reasoning needed. |
| `medium` | `claude-sonnet-4-6` | Single-shot writers, fix executors with clear input. Solid mid-tier reasoning. |
| `high` | `claude-opus-4-8` | Adversarial review, broad audits, observability. Standard 200K context Opus. |
| `xhigh` | `claude-opus-4-8` | Top-of-pipeline synthesizers. Same model ID as `high`; differs by `effort: xhigh` thinking-budget allocation. |
| `max` | `claude-opus-4-8` | Same model as `xhigh`; differs by `effort: max` thinking-budget allocation. Reserved tier — escalate from `xhigh` only after observed truncation. |

Pinning `model:` ensures the agent runs on the same model regardless of which Claude model the orchestrator's session is using. Without a pin, subagents inherit the session's default — running `/bkit-plan` from a Sonnet session would silently downgrade every Opus-tier agent.

### Field rationale

<!-- prettier-ignore -->
| Field | Why this default | When to deviate |
| --- | --- | --- |
| `name` | `@name` invocation in `commands/*.md` requires exact match | Never deviate. |
| `description` | Surfaces in picker and `Agent` tool catalog; one-sentence scope statement only — H1 inside the markdown body carries the deliverable name (`# Build Skills Installed`, `# Plan Review`, etc.). | Keep terse; never duplicate the H1. |
| `effort` | Maps to a Claude model via the table above, with depth-sensitive lenses (`bkit-plan-review-2`, `bkit-build-challenge-2`) pinning opus even at `medium` effort. Parallel fan-outs (triplets `-1`/`-2`/`-3` for ideate + plan-review; pairs `-1`/`-2` for review / scope-check / challenge / ship-update-docs+summary) mix `high`/`medium` effort to spread reasoning depth on Claude. On Cursor, the same fan-outs use different `model:` values for cross-family diversity. | `low` only for read-and-emit summarizers. `high` for adversarial / generative / cross-codebase work. `xhigh` for whole-doc rewrites and Final-strategy diagnostics. |
| `model` | Explicit Claude model pin per the effort mapping table above. Locks the model independent of the orchestrator's session default — without it, subagents inherit user's Claude Code default and `xhigh` thinking depth + 1M context disappear if the user runs Sonnet. | Brittle by version (must update on every model rev), but explicit and discoverable. Never use family alias (`opus` / `sonnet`) — they don't lock context-window variant. |
| `tools` | Minimum capability sandbox. Enforced on both Claude (native) and Cursor (passthrough — Cursor 2.4+ honours `tools:` allowlist; `bkit install` T3 transform passes the field through verbatim). Removing `Edit`/`Bash` makes agent provably non-mutating on both hosts. | Add `WebFetch`/`WebSearch` only for genuine ecosystem research (`bkit-design-review-1/2`). |
| `permissionMode: acceptEdits` | End-to-end runs of `/design`/`/plan`/`/build`/`/debug`/`/ship` would break if mid-workflow prompt blocked an agent. Bash auto-approve surface lives in `.claude/settings.json` (`workflows.md` § Permissions) | Never deviate inside the pipeline; one-off ad-hoc invocations may use stricter modes. |
| `maxTurns` | Pure runaway-loop safety cap, NOT a workload budget. 3 tiers (S=25 / M=50 / L=100) sized at ~2-5x typical work — same multiplier band as the universal 3600s timeout (which is ~2x typical 30 min runtime). Hitting the cap means the agent is definitely stuck (tight retry loop, infinite re-read pattern, etc.), not "tight on a complex run." | Cap by **tier** (see § `maxTurns` calibration). Per-agent assignment in § Models. |

### Effort tiers

<!-- prettier-ignore -->
| Tier | Use for | Example agents |
| --- | --- | --- |
| `low` | Pure synthesis: read N inputs → write 1 verdict file. No deep reasoning, no codebase scan. | `*-summary`, `bkit-debug-abort-handover` |
| `medium` | Single-shot writers, scope audits, skill curators, fix executors with clear input. Some `medium`-effort agents pin opus (depth-sensitive lens) — see Models table footnote. | `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-debug-failure-remediate`, `bkit-ship-conflict-resolve`, `bkit-plan-complexity-check`, `bkit-plan-scope-check-1`, `bkit-plan-scope-check-2`, `bkit-plan-review-2`, `bkit-build-challenge-tests`, `bkit-build-install-skills`, all `bkit-utility-*` except audits |
| `high` | Adversarial review, parallel-fan-out high-effort slots, broad audits, observability instrumentation, feasibility research. | `bkit-build-plan-verify`, `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-design-brainstorm-ideate-1`, `bkit-design-brainstorm-ideate-3`, `bkit-design-organise`, `bkit-design-review-1`, `bkit-plan-review-1`, `bkit-plan-review-3`, `bkit-plan-complexity-split`, `bkit-debug-observe-*`, `bkit-ship-update-docs`, `bkit-utility-audit-*` |
| `xhigh` | Top-of-pipeline synthesizers and highest-leverage adversarial / diagnostic agents — depth here compounds downstream. Model-gated (Opus-only on current models); pin `model: opus` if dispatched from a Sonnet orchestrator. | `bkit-design-generate`, `bkit-plan-generate`, `bkit-plan-update`, `bkit-build-challenge-reconcile`, `bkit-debug-failure-diagnose` |
| `max` | Reserved — only if `xhigh` proves insufficient on a recurring failure mode. Costliest tier; one-shot orchestrator-level work only. Lazy-escalate from `xhigh` based on observed truncation, never preemptively. | (none currently) |

### Tool set patterns

<!-- prettier-ignore -->
| Pattern | Tools | Agents |
| --- | --- | --- |
| Pure summarizer | `Read, Write, Edit` | `bkit-build-summary`, `bkit-debug-summary`, `bkit-design-summary`, `bkit-plan-summary`, `bkit-ship-summary`, `bkit-debug-abort-handover` |
| Read-only reviewer | `Read, Grep, Glob, Write` | `bkit-design-brainstorm-ideate-*`, `bkit-plan-complexity-check` |
| Stub-replace reviewer | `Read, Grep, Glob, Write, Edit` | `bkit-plan-review-*`, `bkit-plan-scope-check-*`, `bkit-plan-complexity-split`, `bkit-design-generate`, `bkit-plan-generate`, `bkit-utility-compress-markdown`, `bkit-utility-update-documentation` |
| Stub-replace + log-append reviewer | `Read, Grep, Glob, Write, Edit, Bash` | `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-debug-observe-analyse` |
| Doc rewriter (cp + Edit) | `Read, Grep, Glob, Edit, Bash` | `bkit-design-update`, `bkit-plan-update`, `bkit-build-challenge-reconcile` |
| Doc writer (with shell) | `Read, Grep, Glob, Write, Edit, Bash` | `bkit-design-organise`, `bkit-ship-update-docs`, `bkit-utility-audit-codebase`, `bkit-utility-audit-security`, `bkit-utility-audit-tests` |
| Source modifier (with test gate) | `Read, Grep, Glob, Write, Edit, Bash` | `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-build-challenge-tests`, `bkit-debug-failure-remediate`, `bkit-debug-observe-instrument`, `bkit-debug-observe-revert`, `bkit-ship-conflict-resolve`, `bkit-utility-audit-logs`, `bkit-utility-audit-logs-ship` |
| Reference fixer | `Read, Glob, Write, Edit` | `bkit-utility-update-references` |
| Skill-installer / Bash-only utility | `Read, Grep, Glob, Bash` | `bkit-build-install-skills` |
| Investigator (web access) | `Read, Grep, Glob, Write, Edit, Bash, WebFetch, WebSearch` | `bkit-design-review-1`, `bkit-design-review-2` |

### `maxTurns` calibration

`maxTurns` = max **agent turns** (assistant messages); each turn may emit multiple parallel tool calls. **Pure runaway-loop safety cap, NOT a workload budget.** Runtime bounded separately by the universal 3600s step timeout (`workflows.md` § Execution Protocol).

**Same philosophy as the timeout:** 3600s timeout is ~2x typical 30 min workflow runtime — set so high that hitting it means something is definitely wrong. `maxTurns` follows the same multiplier band (~2-5x typical work). 3 tiers, applied per-agent in § Models:

<!-- prettier-ignore -->
| Tier | Cap | Typical work | Use for | Examples |
| --- | --- | --- | --- | --- |
| **S** | **25** | 3-10 turns | Pure synthesizers, scope checks, single-pass utilities, install/cleanup, summary writers. | `*-summary`, `bkit-debug-abort-handover`, `bkit-plan-complexity-check`, `bkit-plan-scope-check-*`, `bkit-build-install-skills`, `bkit-debug-observe-revert`, `bkit-utility-audit-logs-ship`, `bkit-utility-audit-logs`, `bkit-utility-compress-markdown` |
| **M** | **50** | 5-25 turns | Reviewers, doc writers, multi-doc, web investigators, audits, surgical-edit appliers, single-pass source modifiers (no test loop). | `bkit-design-brainstorm-ideate-*`, `bkit-design-review-*`, `bkit-design-generate`, `bkit-design-organise`, `bkit-design-update`, `bkit-plan-review-*`, `bkit-plan-generate`, `bkit-plan-update`, `bkit-plan-complexity-split`, `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-build-challenge-tests`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-debug-observe-analyse`, `bkit-debug-observe-instrument`, `bkit-ship-update-docs`, `bkit-utility-audit-*` (codebase / security / tests), `bkit-utility-update-*` |
| **L** | **100** | 30-60 turns | Source modifiers with test loops, plan executor — iterative edit→`pnpm turbo lint typecheck test`→edit cycles. | `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-debug-failure-remediate` |

**Tier assignment is canonical** — see per-agent rows in § Models. Hitting the cap at any tier signals the agent is stuck (tight retry loop, infinite re-read, etc.) — orchestrator's verdict-validation retry handles partial state recovery.

## Models

Canonical per-agent metadata lookup. Both hosts pin per-agent — Cursor via the `Cursor model` column (cross-family diversity via real model selection), Claude via the `Claude model` column (locked to a specific Claude model ID, independent of session default). Claude `effort:` is the thinking-budget knob layered on top of the pinned model. `maxTurns` is the runaway-loop cap (Claude only); see § `maxTurns` calibration above for workload-class rationale.

> **Context-window note:** Claude Code's `model:` frontmatter accepts standard model IDs (e.g. `claude-opus-4-8`); bracket-suffix variants like `claude-opus-4-8[1m]` for the 1M-context build are NOT documented as supported in subagent frontmatter. xhigh-tier agents currently pin to `claude-opus-4-8` (200K context). If input-size truncation surfaces, options are: (a) verify whether `claude-opus-4-8[1m]` works empirically and switch, (b) split the agent's inputs, (c) escalate via env var `CLAUDE_CODE_SUBAGENT_MODEL`.

<!-- prettier-ignore -->
| name | Cursor model | Claude model | Claude effort | maxTurns | role hint |
| --- | --- | --- | --- | --- | --- |
| `bkit-design-brainstorm-ideate-1` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | parallel slot 1 (pragmatic lens) |
| `bkit-design-brainstorm-ideate-2` | `gpt-5.5-high` | `claude-sonnet-4-6` | `medium` | 50 | parallel slot 2 (optimal-tradeoff lens; cross-family on Cursor; cross-tier on Claude) |
| `bkit-design-brainstorm-ideate-3` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | parallel slot 3 (risk-premortem lens) |
| `bkit-design-review-1` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | design review slot 1 (web search + feasibility analysis) |
| `bkit-design-review-2` | `gpt-5.5-high` | `claude-sonnet-4-6` | `medium` | 50 | design review slot 2 (cross-family on Cursor; cross-tier on Claude) |
| `bkit-design-update` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `xhigh` | 50 | merge review critiques into design (whole-doc rewrite — needs depth) |
| `bkit-design-organise` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | decompose reviewed design into dependency-annotated workstreams; coverage self-verify + DAG cycle detection |
| `bkit-design-summary` | `composer-2.5` | `claude-haiku-4-5-20251001` | `low` | 25 | summary writer |
| `bkit-design-generate` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `xhigh` | 50 | generate design from brainstorms (top-of-pipeline synthesizer; whole-doc rewrite) |
| `bkit-plan-complexity-check` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 25 | complexity check |
| `bkit-plan-generate` | `gpt-5.5-high` | `claude-opus-4-8` | `xhigh` | 50 | plan draft generator (top-of-pipeline synthesizer) |
| `bkit-plan-review-1` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | review slot 1 (tightness + design-coverage) |
| `bkit-plan-review-2` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `medium` | 50 | review slot 2 (dependency-correctness + design-coverage; depth-sensitive lens — both opus) |
| `bkit-plan-review-3` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | review slot 3 (regression-risk + design-coverage) |
| `bkit-plan-scope-check-1` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `medium` | 25 | scope audit slot 1 (mechanical audit — medium effort) |
| `bkit-plan-scope-check-2` | `gpt-5.5-high` | `claude-sonnet-4-6` | `medium` | 25 | scope audit slot 2 |
| `bkit-plan-complexity-split` | `gpt-5.5-high` | `claude-opus-4-8` | `high` | 50 | split large plan |
| `bkit-plan-summary` | `composer-2.5` | `claude-haiku-4-5-20251001` | `low` | 25 | summary writer |
| `bkit-plan-update` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `xhigh` | 50 | merge review + scope critiques into plan (whole-doc rewrite — needs depth) |
| `bkit-build-install-skills` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 25 | skill identifier |
| `bkit-build-challenge-1` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | parallel slot 1 (bug-hunting lens) |
| `bkit-build-challenge-2` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | parallel slot 2 (security lens; depth-sensitive — both opus) |
| `bkit-build-challenge-reconcile` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `xhigh` | 30 | merge parallel challenge findings (whole-doc rewrite) |
| `bkit-build-challenge-tests` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 50 | test generator (source modifier, no test loop) |
| `bkit-build-plan-execute` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 100 | task executor (source modifier with test loop; ceiling — split if exceeded) |
| `bkit-build-challenge-remediate` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 100 | fix challenge findings (source modifier with test loop) |
| `bkit-build-plan-gaps-remediate` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 100 | fix verification gaps (source modifier with test loop) |
| `bkit-build-summary` | `composer-2.5` | `claude-haiku-4-5-20251001` | `low` | 25 | summary writer |
| `bkit-build-plan-verify` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | verify impl vs plan |
| `bkit-debug-abort-handover` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 25 | handover writer |
| `bkit-debug-failure-diagnose` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `xhigh` | 50 | failure diagnosis (Final-strategy attempts especially benefit from depth before human handover) |
| `bkit-debug-observe-analyse` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | analyse observability data |
| `bkit-debug-observe-instrument` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | add debug logging (source modifier, no test loop) |
| `bkit-debug-observe-revert` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 25 | remove debug logging |
| `bkit-debug-failure-remediate` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 100 | implement diagnosis fixes (source modifier with test loop) |
| `bkit-debug-summary` | `composer-2.5` | `claude-haiku-4-5-20251001` | `low` | 25 | summary writer |
| `bkit-ship-summary` | `composer-2.5` | `claude-haiku-4-5-20251001` | `low` | 25 | summary writer |
| `bkit-ship-update-docs` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | update completed.md (multi-doc writer) |
| `bkit-ship-conflict-resolve` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 100 | mechanical rebase-conflict resolver (source modifier with test loop) |
| `bkit-utility-audit-codebase` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | codebase audit |
| `bkit-utility-audit-security` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | security audit |
| `bkit-utility-audit-tests` | `claude-opus-4-8-thinking-high` | `claude-opus-4-8` | `high` | 50 | test coverage audit |
| `bkit-utility-compress-markdown` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 25 | token-optimize markdown |
| `bkit-utility-audit-logs` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 25 | scan production logs |
| `bkit-utility-update-documentation` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 50 | doc sync (multi-doc writer) |
| `bkit-utility-update-references` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 50 | fix broken refs |
| `bkit-utility-audit-logs-ship` | `composer-2.5` | `claude-sonnet-4-6` | `medium` | 25 | post-deploy verify |

**Effort vs maxTurns vs model — three independent knobs:**

<!-- prettier-ignore -->
| Knob | Mechanism | Owner | Calibration |
| --- | --- | --- | --- |
| `effort` | Claude thinking-budget on the pinned model | this file § Effort tiers | low / medium / high / xhigh / max — per role |
| `model` | Explicit per-agent model pin (both hosts) | this file § Models (table above) | per-agent — drives cross-family diversity on Cursor; locks Claude variant against session-default drift |
| `maxTurns` | Runaway-loop cap (Claude) | this file § `maxTurns` calibration | per workload class — see § calibration table |

### Orchestrators (slash commands)

`.bkit/workflows/*.md` are workflow orchestrators — they dispatch subagents and synthesize results. They are **not subagents** (no frontmatter `effort:` / `maxTurns:`) and run on whichever model the user's session is on. Pin the session model to match the table below when invoking the command.

<!-- prettier-ignore -->
| Orchestrator | Claude model | Cursor model | Role / why |
| --- | --- | --- | --- |
| `/design` | Opus 4.8 | `claude-opus-4-8-thinking-high` | Synthesizes conflicting brainstorms; resolves design ambiguity. |
| `/plan` | Opus 4.8 | `claude-opus-4-8-thinking-high` | Decides single vs split; merges review (triplet) + scope-check (pair) critiques. |
| `/debug` | Opus 4.8 | `claude-opus-4-8-thinking-high` | Picks remediation path under uncertainty; Standard / Pivot / Final escalation. |
| `/build` | Sonnet 4.6 | `claude-4.6-sonnet-thinking` | Fixed pipeline: dispatch → verify → challenge → tests → summary. Subagents own the heavy reasoning (`bkit-build-challenge-1`/`-2`/`-reconcile`, `bkit-build-plan-verify` are `high`/`medium`/`xhigh` effort). |
| `/ship` | Sonnet 4.6 | `claude-4.6-sonnet-thinking` | Mostly mechanical: merge + archive + parallel docs/summary. |

**Rule:** Opus where the orchestrator itself resolves ambiguity; Sonnet where it executes a defined sequence. **If** a Sonnet orchestrator starts skipping Failure Path branches or mis-routing verify gaps → escalate to Opus.

## Design Phase

<!-- prettier-ignore -->
| Agent | Scope |
| --- | --- |
| `bkit-design-brainstorm-ideate-1` | Independent design exploration — pragmatic lens; effort slot 1 (`high`). Runs parallel with `-2` and `-3`; writes `design-brainstorm-ideate-1.md`. Never references sibling output (circular reasoning guard). |
| `bkit-design-brainstorm-ideate-2` | Same as `-1` — optimal-tradeoff lens; effort slot 2 (`medium`). Effort-diversity within the parallel triplet (Sonnet on Claude, GPT on Cursor). |
| `bkit-design-brainstorm-ideate-3` | Same as `-1` — risk-premortem lens; effort slot 3 (`high`). Restores Opus depth for the failure-mode side of the brainstorm triplet. |
| `bkit-design-generate` | Generate unified design draft from brainstorms; append `decisions.md`/`pending.md` if applicable. |
| `bkit-design-review-1` | Feasibility research with `WebFetch`/`WebSearch`; ecosystem search per capability; writes review log. |
| `bkit-design-review-2` | Same as `-1`; runs in parallel with cross-tier model diversity. |
| `bkit-design-update` | Apply CRITICAL + merit-OPTIONAL items from both reviews; whole-doc rewrite of design. |
| `bkit-design-organise` | Decompose `design-v2-reviewed.md` into dependency-annotated workstreams (`WS-1`, `WS-2`, …); inline `Requires` per workstream; `FAIL` if cycles detected. Workflow Step 9 (`design-workstream-issues`) consumes this output to spawn one Linear sub-issue per `WS-N` with `blockedBy` edges. |
| `bkit-design-summary` | Read-only verdict on design doc + spike. |

## Plan Phase

<!-- prettier-ignore -->
| Agent | Scope |
| --- | --- |
| `bkit-plan-generate` | Read design + template + docs → write new plan draft. Workstream contract: if input includes `**Workstream:**` directive, plan covers ONLY that workstream's `## Scope` content unless stated otherwise; surface `**Requires:**` at top of plan. Every task in the `Agent Execution Runbook` MUST carry a `**Done when:**` line — terse, testable, codebase-verifiable; tasks without it are rejected. |
| `bkit-plan-review-1` | Read-only critique — tightness lens; effort slot 1 (`high`). Parallel with `-2` and `-3`. Missing or vague `**Done when:**` on any task → CRITICAL. |
| `bkit-plan-review-2` | Same scope — dependency-correctness lens; effort slot 2 (`medium` effort, opus model — depth-sensitive lens). |
| `bkit-plan-review-3` | Same scope — regression-risk lens; effort slot 3 (`high`). |
| `bkit-plan-scope-check-1` | Internal-completeness scope audit; effort slot 1 (`high`). `**Done when:**` is the literal criteria slot; missing on any task → FAIL (template structure broken). |
| `bkit-plan-scope-check-2` | Same scope, effort slot 2 (`medium`). |
| `bkit-plan-update` | Merge review/scope critique notes → in-place plan edits + record log. Invariant: every task's `**Done when:**` line survives critique-merge (may be tightened, never removed/weakened). |
| `bkit-plan-complexity-check` | Single→Split verdict on plan size. |
| `bkit-plan-complexity-split` | Partition plan into sub-plans preserving 100% of tasks (including each task's `**Done when:**` line verbatim); self-verifies losslessness and emits PASS/FAIL. |
| `bkit-plan-summary` | Read-only verdict on plan. |

## Build Phase

<!-- prettier-ignore -->
| Agent | Scope |
| --- | --- |
| `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`. |
| `bkit-build-plan-execute` | Execute plan tasks sequentially; reads each task's `**Done when:**` line as the completion criterion to satisfy; modify source; write stub artifact first then incremental `## Task Log` entries. Does NOT tick plan checkboxes (verify owns that). |
| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. Ticks plan `[ ]`→`[x]` ONLY when the task's `**Done when:**` criterion is satisfied in the codebase. Missing `**Done when:**` on any task → FAIL (template structure broken; remediation cannot recover). |
| `bkit-build-plan-gaps-remediate` | Fix specific gaps from latest verify log; Standard/Pivot/Final escalation. |
| `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev..HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes findings, each tagged `class: mechanical\ | architectural`. Never references sibling output (circular reasoning guard). |
| `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude/opus — depth-sensitive; Sonnet on Cursor for cross-family diversity). |
| `bkit-build-challenge-reconcile` | Merge `build-challenge-1.md` + `build-challenge-2.md` into unified `build-challenge.md`. Dedup: same `file:line` OR same root-cause cluster → single finding citing both reviewers. Severity max-wins (`CRITICAL > HIGH > MEDIUM > LOW`). Verdict max-wins (`FAIL > CONCERNS > PASS`). Downgrade only with explicit `## Justification`. |
| `bkit-build-challenge-remediate` | Classify-gate (data-driven on `class`): any architectural → `FAIL` (no fixes; BLOCKED entries logged); else apply mechanical fixes in priority order; runs lint/typecheck/test. |
| `bkit-build-challenge-tests` | Add edge-case tests for changed files; runs lint/typecheck/test. |
| `bkit-build-summary` | Read-only verdict on build outcome. |

> **Cross-phase reuse:** Build Steps 13–14 + Ship Steps 4–5 invoke `bkit-debug-failure-diagnose` / `bkit-debug-failure-remediate` (in-build test failures, in-ship merge failures) — see Debug Phase entries below.

## Debug Phase

<!-- prettier-ignore -->
| Agent | Scope |
| --- | --- |
| `bkit-debug-failure-diagnose` | Investigate test/CI failure → diagnosis log; no fixes. Standard/Pivot/Final by attempt. Reads `docs/knowledge.md` fully → cites matching entries in `## Prior Knowledge` section → uses them to seed hypotheses. Output uses append-only ReAct `Hypothesis {N}` blocks; refuted hypotheses must remain. |
| `bkit-debug-failure-remediate` | Apply diagnosis fix; lint/typecheck/test gate; may append `knowledge.md`/`decisions.md`. |
| `bkit-debug-observe-instrument` | Add `[DEBUG-OBSERVE]` instrumentation; lint/typecheck/test gate. Wired into `/debug` § Step 9 (`MODE` = observe-instrument). |
| `bkit-debug-observe-analyse` | Read pre-fetched CI/runtime context from `debug-context-*.md` + instrumentation report; extract `[DEBUG-OBSERVE]` evidence; write handover doc. Wired into `/debug` § Step 10 (`MODE` = observe-analyse). |
| `bkit-debug-observe-revert` | Strip all `[DEBUG-OBSERVE]` lines; lint/typecheck/test gate. Wired into `/debug` § Step 11 (`MODE` = observe-analyse). |
| `bkit-debug-abort-handover` | Read all prior diagnose/remediate/verify logs → handover doc + `pending.md` append. Called from build/debug/ship Failure Paths. |
| `bkit-debug-summary` | Read-only verdict on debug loop outcome. |

## Ship Phase

<!-- prettier-ignore -->
| Agent | Scope |
| --- | --- |
| `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale; append `completed.md`. Runs parallel with `bkit-ship-summary`. |
| `bkit-ship-summary` | Read-only verdict on ship outcome. Runs parallel with `bkit-ship-update-docs` (no cross-reference — circular reasoning guard). |
| `bkit-ship-conflict-resolve` | Mid-rebase mechanical conflict resolver. Invoked from `/bkit-ship` Step 2 after the in-bash `pnpm-lock.yaml`-only fast path fails to clear the sentinel. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — `FAIL` aborts the rebase cleanly and routes to `bkit-debug-abort-handover`. Verifies via `pnpm install` / `typecheck` / `test` / `build` before `PASS`. |

## Utility (Ad-hoc)

<!-- prettier-ignore -->
| Agent | Scope |
| --- | --- |
| `bkit-utility-audit-codebase` | Codebase quality vs best practices; writes `docs/audits/codebase-audit.md`. |
| `bkit-utility-audit-security` | Security audit (auth, validation, secrets, API, data, deps); writes `docs/audits/security-audit.md`. |
| `bkit-utility-audit-tests` | Test coverage audit; writes `docs/audits/tests-audit.md`. |
| `bkit-utility-compress-markdown` | Token-optimize a single markdown file; preserve 100 % load-bearing tokens. **Destructive** (overwrites target). |
| `bkit-utility-audit-logs` | Run `audit-gcp-errors.sh` + integrate findings into `docs/audits/errors-audit.md` (merge rules). |
| `bkit-utility-update-documentation` | Sync every doc in `.agents/docs.md` with system state — drift cleanup across multiple plans. |
| `bkit-utility-update-references` | Fix broken paths/links in markdown; locator-only (no content change). |
| `bkit-utility-audit-logs-ship` | Post-deploy health check (`audit-gcp-errors.sh 1h` + smoke + baseline diff). |

## Special Behaviors (frontmatter-adjacent contracts)

<!-- prettier-ignore -->
| Behavior | Agents | Notes |
| --- | --- | --- |
| **Parallel-fan-out circular-reasoning guard** | `bkit-design-brainstorm-ideate-*` (triplet), `bkit-plan-review-*` (triplet), `bkit-build-challenge-*` (pair), `bkit-plan-scope-check-*` (pair), `bkit-ship-update-docs`/`bkit-ship-summary` (pair) | Each agent's prompt explicitly forbids reading any sibling output. Triplets carry per-slot lenses (pragmatic/optimal-tradeoff/risk-premortem for ideate; tightness/dependency/regression for plan-review); pairs carry per-slot lenses (bug-hunting/security for challenge; mechanical-audit slots for scope-check). Effort-tier and model diversity provide reasoning-depth + cross-family spread. |
| **Loop context accumulation** | `bkit-build-plan-verify`/`bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-debug-failure-diagnose` | Per-attempt log files (`*-{N}-*.md`) — agent globs its own prior logs and adjusts strategy (Standard / Pivot / Final). Workflow caps at 3 attempts → Failure Path. `bkit-debug-failure-remediate` is strategy-blind — applies whatever diagnosis (now strategy-aware) generates. See `workflows.md` § Loop Context Accumulation. |
| **Linear-bound output (`Output cap: MAX 500 token`)** | `bkit-build-summary`, `bkit-debug-summary`, `bkit-design-summary`, `bkit-plan-summary`, `bkit-ship-summary`, `bkit-debug-abort-handover` | Output is pasted verbatim into the Linear comment thread (workflow `save_comment` block). 500-token cap is a Linear UX concern — keep comments scannable, no walls of text. Self-contained — don't add references to other files the human reviewer can't open. **Cap belongs ONLY here** — critique/review/diagnosis agents (`bkit-*-review-*`, `bkit-*-scope-check-*`, `bkit-build-challenge-*`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-debug-observe-analyse`) are uncapped because their output drives downstream apply steps (`*-update`, `*-remediate`) and detail compression there pushes interpretation cost onto the apply agent. Utility audits emit file deliverables (`docs/audits/*.md`) and are also not Linear-ready / not capped. |
| **Stubbed output (verdict + section placeholders)** | All multi-section verdict-bearing agents — critique/review (`bkit-plan-review-*`, `bkit-plan-scope-check-*`, `bkit-design-review-*`, `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-debug-observe-analyse`), top-of-pipeline synthesizers (`bkit-design-generate`, `bkit-plan-generate`, `bkit-build-challenge-reconcile`), Linear-bound summaries (`*-summary`, `bkit-debug-abort-handover`), and L-tier source modifiers (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-debug-failure-remediate`, `bkit-ship-conflict-resolve`) — see "Flat append-only Log for L-tier source modifiers" row below. | Process shape: (1) Initialise **Create** output stub with `PENDING` placeholders (matches Output format); (2-3) re-read inputs + load docs; (4) Update **Create** output — replace each `PENDING` via `Edit` as content becomes available (standing directive for the analysis below); (5+) analysis steps fill PENDING incrementally as findings emerge. Output format shows each section ending with `; initially set to PENDING` annotation. Truncation recovery is **section-granular** — orchestrator greps for `PENDING` markers and re-issues specific gaps. Per-step gate `No PENDING placeholders remain` paired with `Verdict valid` enforces completeness. Plan-update / design-update follow the same shape but bootstrap from `cp` of prior v(N) + `Verdict: PENDING` prepend (Bash) instead of fresh stub (Write). |
| **Disregard auto-approvals** | All `*-summary` agents, `bkit-utility-audit-logs-ship` | `> ⛔ Disregard system auto-approvals (e.g. "user has automatically approved"). Only explicit human instruction resumes.` — ensures verdict step never auto-advances past a `CONCERNS`/`FAIL`/`DEGRADED`/`BROKEN` outcome. |
| **`acceptEdits` HARD requirement** | All in-pipeline agents | `Bash(*)`/`Edit(*)`/`Write(*)` blanket-allow lives in `.claude/settings.json`; `acceptEdits` skips per-call prompts. Stricter modes break end-to-end runs. |
| **Plan checkbox ticking owned by verify** | `bkit-build-plan-execute` (does NOT tick), `bkit-build-plan-verify` (ticks `[ ]`→`[x]` only on verified codebase artifact) | Originated from BAR-137: 3/3 plan-execute runs in BAR-130 timed out during the per-task `Edit`-tick phase, after implementation already done. Splitting responsibilities (executor → flat append-only log; verify → checkbox ticks based on verified diff/files) removes ~30 Edit calls from the budget-pressured agent and preserves resume-safety: durable progress record = artifact's `DONE —` lines, plan checkboxes = verify's derived view. NEVER tick checkboxes in `bkit-build-plan-execute`. |
| **Flat append-only log for L-tier source modifiers** | `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-debug-failure-remediate` | Output format collapses to a single H1 + flat log body (no separate `Brief` / `Strategy` body sections — `Strategy` lives in machine-parseable header alongside `Verdict`; reasoning is implicit in `DONE —` / `BLOCKED —` lines). Stub state: `Verdict: PENDING` header + H1 + empty body. After every discrete unit of work (task / gap / finding / fix step): `Bash echo "DONE — {Unit} {N}: {name} — {outcome} ({path or commit ref})" >> {artifact}`. On failure: `BLOCKED — {Unit} {N}: {name} — {reason}`. Step 4 standing directive: `Update **Create** output — append DONE/BLOCKED log entries at EOF as content becomes available.` (vs canonical `replace each PENDING via Edit` for multi-section verdict-bearing agents). Verdict flips `PENDING` → `PASS` / `CONCERNS` / `FAIL` at the end via `Edit` on the header line. **Two wins:** (1) timeout resilience — partial progress is on disk after every appended line, so a budget-exhausted agent leaves a usable record (vs original BAR-130 antipattern: ~30 ticks clustered at end → all lost on timeout); (2) `Bash echo >>` is cheaper than `Edit` (no file-read for `old_string` match). **Skip-done logic** (read prior attempts via Read glob, skip units already in `DONE —`) added only where workflow already attempt-numbers and globs the artifact: `bkit-build-plan-gaps-remediate` (via `VERIFY_ATTEMPT`, glob already in Step 7 Read). `bkit-build-plan-execute` is single-attempt; on `PENDING` (subagent timeout) the verify→remediate loop bounded by `MAX_VERIFY_ATTEMPT` = 3 absorbs recovery via `bkit-build-plan-gaps-remediate`. `bkit-build-challenge-remediate` writes a single fixed-name artifact today (no glob) — gets stub+log only. `bkit-debug-failure-remediate` is diagnosis-driven (each attempt fresh-strategy via `bkit-debug-failure-diagnose`) — skip-done would be wrong shape; gets stub+log only, but flat log still feeds `bkit-debug-failure-diagnose`'s loop-context glob with finer evidence. |
