<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->

# Prompt Audit

> [!CAUTION]
> **Purpose:** Each prompt the product sends to a model — clear, well structured, and written for the model that runs it, per that model maker's current prompting guide.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Quote at most one line of prompt text per finding; never copy personal data or a model completion into the report.
> - never call a model to generate. Token counts use a local tokenizer or a provider count endpoint only.

## Universal Instructions

### Context & Goals

A prompt is written against one model maker's advice at one point in time. The model behind it changes, the advice changes, and the prompt does not. Rules pile up without reasons, emphasis written for an older model makes a newer one over-apply a rule, the output format drifts from the parser that reads it. Nothing fails a test: the model still answers, a little worse. Target failure: **a prompt that the current guide for the model running it says will degrade results, and nobody re-read it after the model or the guide changed.**

**Applies when:** the product sends a prompt to a language model at runtime (system prompt, message template, few-shot examples, tool or output-schema descriptions). Coding-agent instruction files and bkit-managed files are not product prompts. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass after a model change at any call site (`bkit-audit-models`), a new prompt set, or a maker guide update.

**Anchor Standards:** record URL, last-updated date or date read, and the model generation each targets. Newer version → `Standards` step reads what changed.

- Anthropic prompt engineering docs and the prompting best-practices page for current Claude models.
- OpenAI prompt engineering guide and the model-specific prompting guide for each model in use (e.g. the cookbook guide per model generation).
- Google Gemini API prompt design strategies.
- Every other maker whose model runs a prompt (e.g. xAI, Mistral, Meta, DeepSeek, Qwen): its own prompting guide, or `Not Checked` when it publishes none.
- Each maker's tool-use and structured-output docs, for tool and schema descriptions.

Guides disagree. The guide for the model that runs the prompt wins. A prompt that runs on models from more than one maker (fallback chain, router, several hosts) relies only on practice every one of those guides supports.

### Scope

- Every runtime prompt: system prompt, message template, few-shot set, prefill, tool descriptions, output-schema descriptions.
- Model and guide per prompt.
- Clarity: task, success, context and reason behind each rule, definitions, contradictions, dead instructions.
- Structure: sections, delimiters, ordering, examples, output format against its parser.
- Model fit: emphasis, reasoning and verbosity controls, sampling parameters, prefill, workarounds from an older model.
- Tool and output-schema descriptions.
- Token cost, duplication, cache-friendly ordering.
- Deliberate departures from a guide: recorded once, not re-raised.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Injection boundary, tool capability, output validators, call limits, job-scope bound, evals / golden sets | LLM sweep | `bkit-audit-llm` |
| Model choice, deprecation, catalogue, fallback-chain membership | Model sweep | `bkit-audit-models` |
| Coding-agent instruction files (e.g. `AGENTS.md`, `CLAUDE.md`, agent definitions, skills): loading, permissions, untrusted input | Agent config sweep | `bkit-audit-agents` |
| Contradictions between instruction files; always-loaded size | Documentation sweep | `bkit-audit-documentation` |
| bkit-managed prompts and templates (`.bkit/`, `bkit-*` host agent mirrors, `bkit:start` / `bkit:end` blocks) | Fixed upstream in bkit | bkit's own run of this audit |
| Live hostile probes | Red team | `bkit-audit-red-team` |
| Model spend beyond per-call token count | Cost sweep | `bkit-audit-cost` |
| Rewriting prompts | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Code Search:** Steps 2, 4–9 — text search and language server for call sites (e.g. ripgrep, Serena, `tsserver`). Prompts often markdown or string literals; tool descriptions often strings in schema files. Language-server hits under-report; empty inconclusive → corroborate with text search and name the tool. Fallback: text search only; name it per claim.
- [ ] **Web:** Steps 3, 10 — each maker's prompting guide (e.g. WebFetch, WebSearch). Fallback: guide practice recorded as unread; Steps 4–7 cite the previous report's guide version and say so.

#### Conditional

Verify only when applicable.

- [ ] **LLM Report:** A `bkit-audit-llm` report exists → Steps 2, 9 — its `Inventory` and `Evals`. Fallback: inventory from code; eval coverage `Not Checked`.
- [ ] **Token Counter:** Step 8 — local tokenizer or provider count endpoint (no generation). Fallback: character count ÷ 4, labelled estimate.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** Start from code: every model call site outside tests (newest `bkit-audit-llm` `Inventory` as cross-check, not source). Per prompt: file, call sites, model(s) that run it — every model in the fallback chain, resolved at the call site (choice and lifecycle → `bkit-audit-models`, not scored here) · maker guide that applies · task (extract, classify, write, converse, tool-calling) · output consumer (parser, schema, human) · eval set covering it (`bkit-audit-llm` `Evals`) · last-changed commit · model or guide changed since. Exclude bkit-managed files and coding-agent instruction files. Diff vs previous run; new prompt or new model read first. **Done when:** `Inventory` row per prompt, or `N/A` and STOP.
- [ ] **Step 3 — Guides:** Per maker in `Inventory`: read current prompting guide and model-specific page for each model generation in use. Record URL, last-updated date or date read, generation targeted. Build `Guidance`: practice · source · makers it applies to · which conflict. Conflict between makers → note which prompts run on both. Guide unread → `Not Checked`; Steps 4–7 for that maker = previous report's reading, labelled. **Done when:** `Guidance` row per practice used in Steps 4–7, every row sourced.
- [ ] **Step 4 — Clarity:** Per prompt: task and what a good answer looks like stated up front; audience and context given; each constraint carries its reason where the guide asks for one; says what to do, not only what to avoid; terms the output depends on defined (e.g. date format, "recent", allowed labels, "out-of-scope" in a redirect rule); conversational prompt states its job and the reply to off-topic asks (wording only — enforcement → `bkit-audit-llm` `Job Scope`); no contradiction within the prompt or between system prompt and template; no dead instruction naming a removed field, tool, or format. **Done when:** `Clarity` row per prompt: verdict per check, each failure cited.
- [ ] **Step 5 — Structure:** Per prompt: sections and inputs delimited the way the guide recommends (e.g. XML tags, markdown headings); instructions apart from inserted data (layout only — injection → `bkit-audit-llm`); long inputs placed where the guide says (e.g. documents first, question last); output format stated and matching its consumer — read the parser or schema and compare field names, types, enums; structured-output or tool schema used where the provider supports it and the guide prefers it; examples present where format or judgment matters, varied, consistent with instructions, not copied verbatim into output. **Done when:** `Structure` row per prompt: verdict per check, format-vs-parser diff recorded.
- [ ] **Step 6 — Model Fit:** Per prompt × model running it, against that maker's current guide: emphasis level (all-caps, "CRITICAL", "must", alarm emoji) — some current guides say forceful wording now makes the model over-apply a rule; reasoning controls (effort or thinking setting at call site vs hand-written "think step by step" on a model with built-in reasoning); verbosity and length controls; sampling parameters the model ignores or rejects (e.g. temperature on a reasoning model); prefill used where the model or API no longer supports it; workaround written for an older model still present after a model change. Prompt on models from several makers → practice every guide supports, or finding. **Done when:** `Model Fit` row per prompt × model: check · guide line · verdict.
- [ ] **Step 7 — Tools and Schemas:** Per tool or output schema a prompt offers: description says what it does, when to use it, when not to; each parameter's meaning, unit, format, allowed values; names unambiguous; no two tools a model could confuse; error text returned to the model says how to recover. Capability and bounds → `bkit-audit-llm`. No tools or schemas → skip with evidence. **Done when:** `Tools and Schemas` row per tool / schema, or skip.
- [ ] **Step 8 — Efficiency:** Per prompt: token count of fixed part (tool named); text duplicated across prompts that one shared fragment could hold; fixed content before variable content where the provider caches prompt prefixes; text no instruction or example needs. Spend beyond per-call count → `bkit-audit-cost`. **Done when:** `Efficiency` row per prompt: tokens · duplication · cache order · dead text.
- [ ] **Step 9 — Deliberate Choices:** Every departure from a guide found in Steps 4–8: check `docs/decisions.jsonl`, prompt comments, and previous reports' `Deliberate Choices`. Recorded with a reason → listed once, not a finding; re-raise only when the guide changed since that reason was written. Unrecorded → adopt (finding) / reject (why; propose `docs/decisions.jsonl` row under `Process Improvements`) / not applicable. Each finding names the eval that would confirm the rewrite (`bkit-audit-llm` `Evals`); none → `unverified`, and propose the golden case to `bkit-audit-llm`. **Done when:** `Deliberate Choices` row per departure: practice · decision source or verdict.
- [ ] **Step 10 — Standards:** Confirm current version per anchor guide; read what changed since previous report's version. `Standards Coverage`: one row per guide recommendation that applies to a prompt in `Inventory` → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Changes since previous report's commit touching prompts, call-site model settings, tool or schema descriptions, or parsers of model output → one-line verdict each. (b) Bounded ~30 min pass: what a senior prompt engineer flags that no step asks; read maker changelogs and model release notes since previous run — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites `file:line`, the guide line it departs from (URL + date read), and the tool behind it.
- [ ] **No payloads:** at most one line of prompt text per finding; no personal data or model completion.
- [ ] **Read-only:** no model generation call, no prompt or config changed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Output-format instruction contradicts the parser or schema that consumes it on a write path, so following the prompt writes wrong data or drops it |
| `HIGH` | Model changed and the prompt keeps practice the current guide says degrades results; contradictory instructions in one prompt; output format unstated where code parses it; write tool with no when-to-use or parameter meaning; sampling parameter or prefill the model rejects |
| `MEDIUM` | Rule with no reason where the guide asks for one; examples missing where format matters, or contradicting instructions; prompt on several makers' models relying on one maker's behaviour; fixed content after variable content where the provider caches; text duplicated across prompts; dead instruction; departure from a guide not recorded |
| `LOW` | Wording; token waste with no behaviour change; non-write tool description gaps |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: write paths first, then prompts whose model changed. A departure recorded in `docs/decisions.jsonl` with a reason is not a finding.

<!-- prettier-ignore -->
| ID | Severity | Prompt | Location | Evidence | Expected | Verify |
| --- | --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`. `Verify` = eval that confirms the fix, or `unverified`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Inventory

PENDING

### Guidance

PENDING

### Clarity

PENDING

### Structure

PENDING

### Model Fit

PENDING

### Tools and Schemas

PENDING

### Efficiency

PENDING

### Deliberate Choices

PENDING

### Checked

PENDING

### Not Checked

PENDING

### Standards Coverage

PENDING

### Beyond the Steps

PENDING

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, prompts read, and guide versions read.
- [ ] **Series:** `Inventory` and `Deliberate Choices` diffed against previous report's, or marked baseline.
- [ ] **Guides:** every `Model Fit` verdict names the guide and date it was judged against.
- [ ] **Writes:** only this report and template `Project Instructions` changed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions

- **Scope (Step 2):** this repo's product prompts are `.bkit/core/prompts/*.md` — the subagent prompts bkit ships. Audit them; they are not excluded as bkit-managed here. Skip their renders in `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/`, `.codex/agents/`.
- **Models (Step 2):** the model each prompt runs on, per host, is in `.bkit/prompts.md` § Models and each prompt's frontmatter. One prompt runs on several makers' models across hosts → Step 6 multi-maker rule applies.
- **Call sites / renders (Step 2):** workflow call sites → ``rg -n 'Invoke `@<name>`' .bkit/core/workflows/*.md``; `bkit-audit-generate` and `bkit-utility-*` run ad hoc. bkit calls no model API; hosts load the rendered agent file as system prompt, orchestrator `Context` / `Read` / `Create` lines are the user message. Render fields → Serena `find_referencing_symbols` on `applyOpencodeAgent` / `applyCodexAgent` (`.bkit/core/engine/render/hosts.ts`).
- **Consumers (Step 5):** header extraction → ``rg -n 'until `<!-- verdict:end -->`' .bkit/core/workflows/*.md``; values models actually wrote → `git grep -h -o -E '"step":"<step>"[^}]*"<field>":[^,}]*' HEAD -- 'docs/plans/**/status.jsonl'` (HEAD, not the working tree, which parallel agents may be changing). Verdict vocabularies are test-gated (`.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts`); other header fields are not → check each has a Process step that sets and defines it.
- **Emphasis (Step 6):** strip inline code spans before counting capitalised normative words; split lines carrying invariants (git, untrusted input, ledger writes, machine-parseable header, tracker writes) from process / judgement lines before judging.
- **Tokens (Step 8):** no local tokenizer installed → Anthropic `POST /v1/messages/count_tokens` (no generation) with `BKIT_ANTHROPIC_API_KEY` loaded via `set -a; . ./.bkit/.env; set +a` (never echo it); body after frontmatter as `system`, the prompt's pinned model, minus the empty-`system` baseline. Non-Claude counts → `Not Checked`.
- **Guides (Step 3):** Anthropic → best-practices page + `platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-<model>` per pinned model. OpenAI → `developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6.md`, `.../guides/latest-model/gpt-6-astra`, blog `rethinking-skills-and-prompts-for-gpt-6-astra`; re-search when OpenAI pins move. Moonshot → `platform.kimi.ai/docs/guide/prompt-best-practice` (`platform.moonshot.ai` redirects there). Z.ai → index `docs.z.ai/llms.txt`. DeepSeek → `api-docs.deepseek.com/guides/thinking_mode` (parameters only). xAI → `docs.x.ai/docs/guides/grok-code-prompt-engineering` is dead; search for a current Grok guide first. Cursor (`cursor.com/docs/models`, `cursor.com/docs/context/rules`) publishes no model prompting guide. No maker guide → still read its parameter docs (effort values, rejected sampling parameters).
- **Tool gaps (Pre-Flight Web):** WebFetch may summarise and refuse verbatim passages over ~125 characters → ask per-topic short-quote questions, or fetch the page's `.md` variant (works for OpenAI docs).
- **Evals (Step 9):** look for `Evals` in `docs/audits/*/llm*.md`; `.bkit/core/engine/**/*.test.ts` files that read `.bkit/core/prompts/` assert text shape, not model behaviour — never count them as evals.
- **Deliberate choices (Step 9):** the dense, telegraphic style (`.bkit/prompts.md` § Prompt Authoring Rules; `.bkit/core/prompts/bkit-utility-compress-markdown.md`) is deliberate. Judge it once against current guides in `Deliberate Choices`; re-raise only when a guide changes. Other recorded choices → `.bkit/prompts.md` § Special Behaviors (inline protocol clauses, auto-approval line, output cap, untrusted-input bullet) and § Frontmatter Conventions (effort ladder; measurements in `.bkit/providers.md` § Agentic-coding parity board); `docs/decisions.jsonl` via `jq` over `key` / `summary`.
- **Gate boilerplate (Step 11):** supplied templates in `.bkit/core/docs/templates/` (copies in `docs/templates/`) are read as instructions by `bkit-audit-generate` / `bkit-plan-generate`; judge their shared gate lines against the same guides in `Beyond the Steps`.
