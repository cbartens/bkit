<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Prompt Audit

> [!CAUTION]
> **Purpose:** Each prompt the product sends to a model is clear, well structured, and written for the model that runs it, per that model maker's current prompting guide.
>
> **Rules:**
>
> - Quote at most one line of prompt text per finding.
> - NEVER copy personal data or a model completion into the report.
> - Never call a model to generate.
> - Count tokens with a local tokenizer or a provider count endpoint only.

## Universal Instructions

### Context & Goals

A prompt is written against one model maker's advice at one point in time. The model behind it changes, the advice changes, and the prompt does not. Examples: rules pile up without reasons, emphasis written for an older model makes a newer one over-apply a rule, and the output format drifts from the parser that reads it. Nothing fails a test: the model still answers, a little worse. The failure this audit targets is a prompt that the current guide for its model says will degrade results, which nobody re-read after the model or the guide changed.

**Applies when:** the product sends a prompt to a language model at runtime (system prompt, message template, few-shot examples, tool or output-schema descriptions). Coding-agent instruction files and bkit-managed files are not product prompts. **If** the product sends none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass after a model change at any call site (`bkit-audit-models`), a new prompt set, or a maker guide update.

**Anchor Standards:** For each guide, record the URL, the last-updated date or the date it was read, and the model generation it targets.

- Anthropic prompt engineering docs and the prompting best-practices page for current Claude models.
- OpenAI prompt engineering guide and the model-specific prompting guide for each model in use (e.g. the cookbook guide per model generation).
- Google Gemini API prompt design strategies.
- Every other maker whose model runs a prompt (e.g. xAI, Mistral, Meta, DeepSeek, Qwen): its own prompting guide, or `Not Checked` when it publishes none; its model parameter docs either way.
- Each maker's tool-use and structured-output docs, for tool and schema descriptions.

Guides disagree. The guide for the model that runs the prompt wins. A prompt that runs on models from more than one maker (fallback chain, router, several hosts) follows the current guides of the makers whose models run it day to day. A fallback model's guide counts only where it does not conflict with them.

### Scope

- Read every runtime prompt: system prompt, message template, few-shot set, prefill, tool descriptions and output-schema descriptions.
- Name the model and the guide for each prompt.
- Check clarity: the task, success, the context and reason behind each rule, definitions, contradictions and dead instructions.
- Check structure: sections, delimiters, ordering, examples, and the output format against its parser.
- Check model fit: emphasis, reasoning and verbosity controls, sampling parameters, prefill, and workarounds from an older model.
- Check tool and output-schema descriptions.
- Measure token cost, duplication and cache-friendly ordering.
- Deliberate departures from a guide are recorded once, and are not re-raised.

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

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Code Search:** Steps 2, 4-9 — text search, and the language server for call sites (e.g., ripgrep, Serena, `tsserver`). Prompts are often markdown or string literals, and tool descriptions are often strings in schema files. Language-server hits under-report. **If** a result is empty → treat it as inconclusive, corroborate it with text search, and name the tool. Fallback: text search only, and name the tool for each claim.
- [ ] **Web:** Steps 3, 10 — each maker's prompting guide (e.g., WebFetch, WebSearch). Fallback: record guide practice as unread; Steps 4-7 cite the previous report's guide version and say so.

#### Conditional

- [ ] **LLM Report:** **If** a `bkit-audit-llm` report exists → Steps 2, 9 — its `Inventory` and `Evals`. Fallback: build the inventory from code, and mark eval coverage `Not Checked`.
- [ ] **Token Counter:** Step 8 — a local tokenizer or a provider count endpoint (no generation). Fallback: use character count ÷ 4, labelled as an estimate.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Inventory:** Start from the code: every model call site outside tests, with the newest `bkit-audit-llm` `Inventory` as a cross-check, not as the source. For each prompt, record: the file and call sites · the model(s) that run it — every model in the fallback chain, resolved at the call site (choice and lifecycle belong to `bkit-audit-models`, and are not scored here) · the maker guide that applies · the task (extract, classify, write, converse, tool-calling) · the output consumer (parser, schema, human) · the eval set covering it (`bkit-audit-llm` `Evals`) · the last-changed commit · whether the model or guide changed since. Exclude bkit-managed files and coding-agent instruction files. Diff against the previous run, and read each new prompt or new model first. **Done when:** `Inventory` has a row per prompt, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Guides:** For each maker in `Inventory`, read the current prompting guide and the model-specific page for each model generation in use. Record the URL, the last-updated date or the date read, and the generation targeted. Build `Guidance`: practice · source · makers it applies to · which conflict. **If** makers conflict → note which prompts run on both. **If** there is no guide, **or** its URL is dead → still read the maker's model parameter docs per generation (e.g., reasoning-effort values, rejected sampling parameters), so the Step 6 parameter checks run. **If** the parameter docs are missing → mark that generation's parameter checks `Not Checked`. **If** a guide is unread → mark it `Not Checked`, and use the previous report's reading, labelled, for that maker in Steps 4-7. **Done when:** `Guidance` has a row per practice used in Steps 4-7, and every row is sourced.
- [ ] **Step 4 — Clarity:** For each prompt, check that: the task and what a good answer looks like are stated up front; the audience and context are given; each constraint carries its reason where the guide asks for one; it says what to do, not only what to avoid; the terms the output depends on are defined (e.g., date format, "recent", allowed labels, "out-of-scope" in a redirect rule); a conversational prompt states its job and the reply to off-topic asks (wording only — enforcement belongs to `bkit-audit-llm` `Job Scope`); there is no contradiction within the prompt, or between the system prompt and the template; and no dead instruction names a removed field, tool or format. **Done when:** `Clarity` has a row per prompt: a verdict per check, with each failure cited.
- [ ] **Step 5 — Structure:** For each prompt, check that: sections and inputs are delimited the way the guide recommends (e.g., XML tags, markdown headings); instructions are kept apart from inserted data (layout only — injection belongs to `bkit-audit-llm`); long inputs sit where the guide says (e.g., documents first, question last); the output format is stated and matches its consumer, so read the parser or schema and compare field names, types and enums, and mark a human consumer `N/A`; every parsed field has an instruction (or schema description) that sets it and says what it counts; every field the instructions ask for appears in the output format; a structured-output or tool schema is used where the provider supports it and the guide prefers it; and examples are present where format or judgment matters, varied, consistent with the instructions, and not copied verbatim into output. **Done when:** `Structure` has a row per prompt: a verdict per check, with the format-vs-parser and field-to-instruction diffs recorded.
- [ ] **Step 6 — Model Fit:** For each prompt x model running it, check against that maker's current guide. Check the emphasis level (all-caps, "CRITICAL", "must", alarm emoji), because some current guides say forceful wording now makes the model over-apply a rule. First sort each capitalised absolute (or bold / emoji emphasis), by the rule it governs, into invariant (safety, permission, required field, irreversible action) or judgement call, and judge only the judgement calls. Then check: reasoning controls (the effort or thinking setting at the call site, against a hand-written "think step by step" on a model with built-in reasoning); verbosity and length controls; sampling parameters the model ignores or rejects (e.g., temperature on a reasoning model); prefill used where the model or API no longer supports it; and a workaround written for an older model that is still present after a model change. **If** a prompt runs on models from several makers → it uses a practice every guide supports, or it is a finding. **Done when:** `Model Fit` has a row per prompt x model: check · guide line · verdict.
- [ ] **Step 7 — Tools and Schemas:** For each tool or output schema a prompt offers, check that: the description says what it does, when to use it and when not to; each parameter's meaning, unit, format and allowed values are given; the names are unambiguous; no two tools are ones a model could confuse; and error text returned to the model says how to recover. Capability and bounds belong to `bkit-audit-llm`. **If** there are no tools or schemas → skip with evidence. **Done when:** `Tools and Schemas` has a row per tool / schema, or the skip.
- [ ] **Step 8 — Efficiency:** For each prompt, record: the token count of the fixed part (naming the tool); text duplicated across prompts that one shared fragment could hold; whether fixed content comes before variable content where the provider caches prompt prefixes; and text that no instruction or example needs. Spend beyond the per-call count belongs to `bkit-audit-cost`. **Done when:** `Efficiency` has a row per prompt: tokens · duplication · cache order · dead text.
- [ ] **Step 9 — Deliberate Choices:** For every departure from a guide found in Steps 4-8, check `docs/decisions.jsonl`, prompt comments, and the previous reports' `Deliberate Choices`. **If** it is recorded with a reason → list it once, not as a finding. Re-raise it only when the guide changed after that reason was written. **If** it is unrecorded → mark it adopt (a finding), reject (saying why, and proposing a `docs/decisions.jsonl` row under `Process Improvements`) or not applicable. Each finding names the eval that would confirm the rewrite (`bkit-audit-llm` `Evals`). **If** there is none → write `unverified`, and propose the golden case to `bkit-audit-llm`. **Done when:** `Deliberate Choices` has a row per departure: practice · decision source or verdict.
- [ ] **Step 10 — Standards:** Confirm the current version of each anchor guide, and read what changed since the previous report's version. Give `Standards Coverage` one row per guide recommendation that applies to a prompt in `Inventory`, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches prompts, call-site model settings, tool or schema descriptions, or parsers of model output. (b) In a bounded pass of about 30 minutes, note what a senior prompt engineer would flag that no step asks about. Read the maker changelogs and model release notes since the previous run, and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites `file:line`, the guide line it departs from (URL and date read), and the tool behind it.
- [ ] **No payloads:** each finding quotes at most one line of prompt text.
- [ ] **No personal data:** no personal data or model completion is in the report.
- [ ] **Read-only:** no model generation call was made.
- [ ] **Prompts unchanged:** no prompt or config changed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Output-format instruction contradicts the parser or schema that consumes it on a write path, so following the prompt writes wrong data or drops it |
| `HIGH` | Model changed and the prompt keeps practice the current guide says degrades results; contradictory instructions in one prompt; output format unstated where code parses it; write tool with no when-to-use or parameter meaning; sampling parameter or prefill the model rejects |
| `MEDIUM` | Rule with no reason where the guide asks for one; examples missing where format matters, or contradicting instructions; prompt on several makers' models relying on one maker's behaviour; fixed content after variable content where the provider caches; text duplicated across prompts; dead instruction; departure from a guide not recorded |
| `LOW` | Wording; token waste with no behaviour change; non-write tool description gaps |

Within a severity, list write paths first, then prompts whose model changed. A departure recorded in `docs/decisions.jsonl` with a reason is not a finding.

<!-- prettier-ignore -->
| ID | Severity | Prompt | Location | Evidence | Expected | Verify |
| --- | --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`. `Verify` = the eval that confirms the fix, or `unverified`.

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the prompts read and the guide versions read.
- [ ] **Series:** `Inventory` and `Deliberate Choices` are diffed against the previous report's, or the run is marked baseline.
- [ ] **Guides:** every `Model Fit` verdict names the guide and the date it was judged against.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows changed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

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
- **Deliberate choices (Step 9):** the dense, telegraphic style (`.bkit/authoring.md` § Prompts and Workflows; `.bkit/core/prompts/bkit-utility-compress-markdown.md`) is deliberate. Judge it once against current guides in `Deliberate Choices`; re-raise only when a guide changes. Other recorded choices → `.bkit/prompts.md` § Special Behaviors (inline protocol clauses, auto-approval line, output cap, untrusted-input bullet) and § Frontmatter Conventions (effort ladder; measurements in `.bkit/providers.md` § Agentic-coding parity board); `docs/decisions.jsonl` via `jq` over `key` / `summary`.
- **Gate boilerplate (Step 11):** supplied templates in `.bkit/core/docs/templates/` (copies in `docs/templates/`) hold shape only; their shared gate rules live in `bkit-audit-generate` (`Gates`) and `bkit-build-plan-execute` (`Plan gates`); judge those lines against the same guides in `Beyond the Steps`.
