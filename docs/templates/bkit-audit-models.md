<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Model Audit

> [!CAUTION]
> **Purpose:** Whether each model call site uses the latest capable model fit for the job, whether that model and its fallbacks are still live, and whether the choice sits in one registry.
>
> **Rules:**
>
> - Read-only audit; NEVER edit code, config, or data.
> - `Universal Instructions` apply to ALL projects; `Project Instructions` apply ONLY to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document ONCE at session start; do NOT trust session memory; do NOT re-read on every loop iteration.
> - NEVER edit the model registry, call wrappers, routing config, or call sites; the report proposes the replacement.
> - Fallback probes use a synthetic fixture; NEVER send production user content, and NEVER write the spend ledger.
> - NEVER publish a number with no recorded source.

## Universal Instructions

### Context & Goals

A model id in config reads the same the day it is delisted as the day it was chosen. Target failure: **a stale entry indistinguishable from a working one until a fallback fires, which is the moment it has to work** — e.g. a text-only model in a file chain, two chains sharing one fallback that then disappears, a floating alias that now names a different model. Pull the live catalogue; do not remember an id, and do not infer one from a version number.

**Applies when:** code calls a hosted model (chat, tools, vision, embeddings, or any other modality). None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass when a listed id is delisted, loses a capability the call sends, gains an expiration or a deprecation notice, when an alias resolves to a different canonical id, or when a new task or call site routes through a fallback wrapper.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Provider model-list APIs, including lifecycle and per-endpoint fields (e.g. OpenRouter models and endpoints APIs: `expiration_date`, `canonical_slug`, `knowledge_cutoff`; Anthropic, OpenAI, and Google model lists).
- Provider routing controls (e.g. OpenRouter `require_parameters`, `quantizations`, `max_price`, `allow_fallbacks`, zero-retention).
- Maker deprecation pages (e.g. Anthropic, OpenAI, Google), plus the equivalent for every other maker in a chain.
- Model cards published by each model's maker.
- NIST AI 600-1, Generative AI Profile, MEASURE, and MANAGE for third-party models.
- OWASP Top 10 for LLM Applications, LLM03 Supply Chain; record the edition (e.g. 2025).

### Scope

- Live provider catalogue as the standard for every listed id and every proposed id.
- Fitness per call site: capability, cost, latency, context, and modality. Cost here is the catalogue price of the choice, not spend.
- Deprecation, retirement, supersession, and expiration.
- Endpoints and fallbacks live, not the model-summary claim.
- One registry versus scattered ids.
- Proposed registry and per-task routing. This run does not apply them.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Prompt text, what a model can do with hostile input, call limits, evals / golden sets | LLM sweep | `bkit-audit-llm` |
| Spend, budgets, blended cost of a switch, fallback-rate dollars | Cost sweep | `bkit-audit-cost` |
| User-facing latency outside model choice | Performance sweep | `bkit-audit-app-performance` |
| Personal-data transfer, retention, children's-data borders | Privacy sweep | `bkit-audit-privacy` |
| Editing the registry, wrappers, or routing | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Catalogue Read:** Steps 3, 5, 6 — live model list per provider the call sites use, e.g. OpenRouter `/api/v1/models`, Anthropic models API, OpenAI models API, Google models API. Fallback: maker docs only; live-endpoint claims = hypotheses.
- [ ] **Web:** Steps 5, 10 — maker deprecation pages, model cards, anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed call sites → Step 4 — references, e.g. Serena, `tsserver`. Fallback: text search; name it per claim.
- [ ] **Endpoint API:** Provider exposes per-model endpoints → Step 6 — e.g. OpenRouter endpoints API. Fallback: model-summary fields only; say so.
- [ ] **Usage Ledger:** A usage ledger exists → Step 6 — largest measured input per task. Fallback: catalogue context only; measured input `Not Checked`.
- [ ] **Live Call:** Credential for a fixture call → Step 7. Fallback: endpoint metadata only; liveness `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find every model call site (SDK calls, HTTP to a model API, config lists) and whether choice lives in one registry or in literals at the sites. Embeddings and other modalities count. Registry absent and ids inline = the scatter is the finding; still audit the ids. **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Catalogue:** Pull the live catalogue for each provider Step 2 found. Record date, URL, and counts (full list, and any constrained subset the calls require, e.g. zero-retention). Every id proposed later must exist in this pull. **Done when:** date, source, and counts in `Catalogue`.
- [ ] **Step 4 — Call Sites:** Derive each call site's requirements from the code this run: modality, tools, and tool choice, structured output, reasoning, output cap, timeout. Do not copy a requirements table forward. Language-server references on each wrapper and each exported chain → every task that routes through it; re-run any empty result, then corroborate with text search. Empty is inconclusive. A task added since the previous report appears here and nowhere else. **Done when:** `Call Sites` row per site: task · wrapper · requirements · chain · `file:line` · how derived.
- [ ] **Step 5 — Lifecycle:** Hard filters on every listed id and every candidate, against the Step 3 pull and the maker page. (a) Retention the call actually sends (e.g. zero-retention): no matching endpoint → the id does not route; reject. (b) `expiration_date` and the maker deprecation page. Reject an id that expires before the next expected refresh. Reject preview, experimental, and free-tier variants. (c) Tool-calling candidate whose reasoning cannot be switched off → reject (reasoning tokens exhaust the output budget, the model returns no tool call, and the wrapper surfaces a truncation error). (d) Alias or dated snapshot, and which canonical id it resolved to on the pull date. Prefer dated snapshots. An alias whose canonical id differs from the previous report = a model change: name `bkit-audit-llm`; do not run the eval here. (e) Model card URL, knowledge cutoff, open-weight licence, training-on-data policy, maker terms for products serving minors, hosting region of the endpoints that satisfy the retention constraint. Children's data crossing borders → `bkit-audit-privacy`. **Done when:** `Lifecycle` row per id: filters · canonical id · card · verdict.
- [ ] **Step 6 — Endpoints:** A model-level summary can pass Step 5 while no single endpoint does. Query endpoints, not the summary. Require at least one, ideally two, that satisfy the retention constraint and every parameter the call site sends (tools, tool choice including a required value, file, structured output — as Step 4's table requires). Record whether the call sets a flag that stops the router sending a parameter to a provider that ignores it (e.g. `require_parameters`). Absent → propose it in `Proposal`. Open weights: quantization per endpoint; propose a pin or an order where quality differs. Compare each endpoint's context length and max completion with the largest measured input for that task (ledger when it has the task; say when it does not). No output cap on a tool-calling path = a defect in the current list; propose a value per task. Latency and throughput per endpoint against the call's timeout. Catalogue price is a fitness comment on the proposed row. Blended spend and fallback-rate dollars → `bkit-audit-cost`. Propose a per-task price ceiling as routing config, not as a spend figure. **Done when:** `Endpoints` row per id: qualifying endpoints · parameters · context vs input · latency vs timeout · verdict.
- [ ] **Step 7 — Fallbacks:** (a) A chain's positions are different makers, so one delisting or one outage cannot collapse the retry. Record the router as a single point of failure, and whether any call constructs a direct maker client. A diagram that names maker SDKs is not that client. (b) One synthetic fixture per chain position, under the routing parameters production sends. Pass = that position accepted the call shape. Fail = finding. This proves the fallback answers; it does not score quality. Extraction accuracy, tool-call validity rate, and a hostile fixture → `bkit-audit-llm`. (c) Record whether anything counts how often a position fires. Nothing = finding; a counter is a `Process Improvements` proposal; the spend consequence → `bkit-audit-cost`. **Done when:** `Fallbacks` row per position: maker · fixture result or skip · fire-rate measured · verdict.
- [ ] **Step 8 — Registry:** Re-check the current list, not only candidates. (1) Modality: every model in a chain accepts the input the call site sends (image support does not satisfy a file part). (2) Reasoning that cannot be switched off on a tool-calling path. (3) A task group or list with no call site. References on the export plus a text search, including docs — the search sees planning docs the language server does not. Recommend delete unless a plan is actually in progress. Carrying lists for an unbuilt feature is how a registry goes stale. (4) Model ids outside the registry. **Done when:** every hit = finding with `file:line`, or clean stated in `Registry`.
- [ ] **Step 9 — Proposal:** Proposed list and per-task config (retention, required-parameters, quantization pin, price ceiling, output cap) with catalogue price and context window as comments on each row. Ordering inside a chain is judgement unless a `bkit-audit-llm` report's scorecard is cited; label which. Never an invented score. The report gives the apply order and does not perform it: (1) the wrappers must be able to pass per-task settings, or nothing else can be applied; (2) retention routing pinned at the shared boundary before the model switch, so new models are validated under the routing they will run; (3) import the registry, delete hardcoded lists, apply the list and per-task config; (4) the eval audit's check before the list is treated as mergeable — do not change model, sampling, and fallback behaviour in one unmeasured step; (5) watch, with a named revert (current lists, by commit) and a threshold on each signal (format-error rate, fallback-fire count, task success). Cost per job → `bkit-audit-cost`. An open decision → one question in `Proposal`, with a recommendation and what would settle it. Destinations: a defect or an id that fails a filter → the proposed list; a missing routing parameter → the per-task config; a wrapper that cannot pass settings → apply-order item 1; a model change, including an alias that moved → `bkit-audit-llm`; children's-data borders → `bkit-audit-privacy`; an unwired group → a delete recommendation. **Done when:** `Proposal` holds the list, the apply order, the watch plan, and any open question.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per catalogue field, routing parameter, maker lifecycle rule, and third-party-model control this procedure relies on → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching model choice (registry, wrappers, call sites, routing parameters, embedding model id) → one-line verdict each. Read provider and maker changelogs since the previous report for a changed meaning of retention routing, reasoning, tool choice, or pricing. Flag catalogue anomalies on current ids: a price jump, a context cut, or the endpoint count fallen to one. (b) Bounded ~30 min pass: what a senior ML platform engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Include anything the catalogue or changelogs surfaced unchecked, with the query to check it next run. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **IDs sourced:** every proposed id exists in this run's catalogue pull; no number without a recorded source.
- [ ] **Registry untouched:** no edit to the registry, wrappers, routing config, or call sites.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | No listed model has a live endpoint that accepts the call's modality and required parameters; fallback chain has no working position |
| `HIGH` | A fallback position would fail the call shape; listed id deprecated, retiring, or expiring before the next refresh; model id outside the registry; tool-calling model whose reasoning cannot be switched off; chain whose positions share one maker; router may drop a parameter the call sends |
| `MEDIUM` | Floating alias, or alias whose canonical id moved; context or output cap below measured input; only one qualifying endpoint; unwired model list still maintained; open-weight quantization not pinned; nothing records fallback fires |
| `LOW` | Proposed row missing an inline lifecycle or price comment; doc names a model the registry does not, with no call site |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: a call that cannot be served first.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Catalogue

PENDING

### Call Sites

PENDING

### Lifecycle

PENDING

### Endpoints

PENDING

### Fallbacks

PENDING

### Registry

PENDING

### Proposal

PENDING

### Checked

PENDING

### Not Checked

PENDING

### Standards Coverage

PENDING

### Beyond the Steps

PENDING

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, the catalogue date, and the counts.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
