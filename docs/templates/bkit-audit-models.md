<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.0.1 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Model Audit

> [!CAUTION]
> **Purpose:** Each call site: latest capable model for the job; model and fallbacks live; choice in one registry.
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
> - never edit the model registry, call wrappers, routing config, or call sites; the report proposes the replacement.
> - Fallback probes use a synthetic fixture; NEVER send production user content, and NEVER write the spend ledger.
> - never publish a number with no recorded source.

## Universal Instructions

### Context & Goals

Config ids look identical delisted vs choice day. Target failure: **a stale entry indistinguishable from a working one until a fallback fires, which is the moment it has to work** — e.g. text-only model in a file chain, two chains sharing one fallback that then disappears, a floating alias that now names a different model. Pull live catalogue; do not remember or infer ids from version numbers.

**Applies when:** code calls hosted model (chat, tools, vision, embeddings, any modality). None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass when listed id delisted, call-sends capability lost, expiration or deprecation added, alias resolves to different canonical id, or new task/call site routes through fallback wrapper.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Provider model-list APIs, including lifecycle and per-endpoint fields (e.g. OpenRouter models and endpoints APIs: `expiration_date`, `canonical_slug`, `knowledge_cutoff`; Anthropic, OpenAI, and Google model lists).
- Provider routing controls (e.g. OpenRouter `require_parameters`, `quantizations`, `max_price`, `allow_fallbacks`, zero-retention).
- Maker deprecation pages (e.g. Anthropic, OpenAI, Google), plus the equivalent for every other maker in a chain.
- Model cards published by each model's maker.
- NIST AI 600-1, Generative AI Profile, MEASURE, and MANAGE for third-party models.
- OWASP Top 10 for LLM Applications, LLM03 Supply Chain; record the edition (e.g. 2025).

### Scope

- Live provider catalogue = standard for every listed and proposed id.
- Call-site fitness: capability, cost (catalogue price, not spend), latency, context, modality.
- Deprecation, retirement, supersession, expiration.
- Endpoints and fallbacks live, not model-summary claim.
- One registry vs scattered ids.
- Proposed registry and per-task routing; not applied this run.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| What a model can do with hostile input, call limits, evals / golden sets | LLM sweep | `bkit-audit-llm` |
| Prompt text: clarity, structure, fit to the model that runs it | Prompt sweep | `bkit-audit-prompts` |
| Spend, budgets, blended cost of a switch, fallback-rate dollars | Cost sweep | `bkit-audit-cost` |
| User-facing latency outside model choice | Performance sweep | `bkit-audit-app-performance` |
| Personal-data transfer, retention, children's-data borders | Privacy sweep | `bkit-audit-privacy` |
| Coding-agent model pins | Agent config sweep | `bkit-audit-agents` |
| Editing the registry, wrappers, or routing | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Catalogue Read:** Steps 3, 5, 6 — live model list per provider call sites use, e.g. OpenRouter `/api/v1/models`, Anthropic models API, OpenAI models API, Google models API. Fallback: maker docs only; live-endpoint claims = hypotheses.
- [ ] **Web:** Steps 5, 10 — maker deprecation pages, model cards, anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed call sites → Step 4 — references, e.g. Serena, `tsserver`. Fallback: text search; name it per claim.
- [ ] **Endpoint API:** Provider exposes per-model endpoints → Step 6 — e.g. OpenRouter endpoints API. Fallback: model-summary fields only; say so.
- [ ] **Usage Ledger:** A usage ledger exists → Step 6 — largest measured input per task. Fallback: catalogue context only; measured input `Not Checked`.
- [ ] **Live Call:** Credential for a fixture call → Step 7. Fallback: endpoint metadata only; liveness `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find every model call site (SDK calls, HTTP to a model API, config lists) and whether choice lives in one registry or literals at sites. Embeddings and other modalities count. Registry absent and ids inline = scatter is the finding; still audit ids. **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Catalogue:** Pull live catalogue for each provider Step 2 found. Record date, URL, counts (full list, any constrained subset calls require, e.g. zero-retention). Every id proposed later must exist in this pull. **Done when:** date, source, and counts in `Catalogue`.
- [ ] **Step 4 — Call Sites:** Derive each call site's requirements from code this run: modality, tools, and tool choice, structured output, reasoning, output cap, timeout. Do not copy a requirements table forward. Language-server references on each wrapper and each exported chain → every task routing through it; re-run empty results, corroborate with text search. Empty is inconclusive. Task added since previous report appears here only. **Done when:** `Call Sites` row per site: task · wrapper · requirements · chain · `file:line` · how derived.
- [ ] **Step 5 — Lifecycle:** Hard filters on every listed id and candidate vs Step 3 pull + maker page. (a) Retention call sends (e.g. zero-retention): no matching endpoint → reject (id does not route). (b) `expiration_date` + maker deprecation page; reject id expiring before next refresh; reject preview, experimental, free-tier variants. (c) Tool-calling candidate whose reasoning cannot be switched off → reject (reasoning tokens exhaust the output budget, the model returns no tool call, and the wrapper surfaces a truncation error). (d) Alias or dated snapshot, and which canonical id it resolved to on the pull date. Prefer dated snapshots. An alias whose canonical id differs from the previous report = a model change: name `bkit-audit-llm`; do not run the eval here. (e) Model card URL, knowledge cutoff, open-weight licence, training-on-data policy, maker terms for products serving minors, hosting region for retention-satisfying endpoints. Children's data crossing borders → `bkit-audit-privacy`. **Done when:** `Lifecycle` row per id: filters · canonical id · card · verdict.
- [ ] **Step 6 — Endpoints:** Model-level summary can pass Step 5 while no single endpoint does. Query endpoints, not summary. Require ≥1, ideally 2, satisfying retention constraint and every parameter call site sends (tools, tool choice including required value, file, structured output — as Step 4's table requires). Record whether call sets flag stopping router sending a parameter to provider that ignores it (e.g. `require_parameters`). Absent → propose in `Proposal`. Open weights: quantization per endpoint; propose pin or order where quality differs. Compare each endpoint's context length and max completion with largest measured input for that task (ledger when it has task; say when not). No output cap on tool-calling path = defect in current list; propose value per task. Latency and throughput per endpoint vs call timeout. Catalogue price = fitness comment on proposed row. Blended spend and fallback-rate dollars → `bkit-audit-cost`. Propose per-task price ceiling as routing config, not spend figure. **Done when:** `Endpoints` row per id: qualifying endpoints · parameters · context vs input · latency vs timeout · verdict.
- [ ] **Step 7 — Fallbacks:** (a) Chain positions = different makers → one delisting or outage cannot collapse retry. Record router as single point of failure; whether any call constructs direct maker client. Diagram naming maker SDKs is not that client. (b) One synthetic fixture per chain position, under routing parameters production sends. Pass = position accepted call shape. Fail = finding. Proves fallback answers; does not score quality. Extraction accuracy, tool-call validity rate, hostile fixture → `bkit-audit-llm`. (c) Record whether anything counts how often a position fires. Nothing = finding; counter = `Process Improvements` proposal; spend consequence → `bkit-audit-cost`. **Done when:** `Fallbacks` row per position: maker · fixture result or skip · fire-rate measured · verdict.
- [ ] **Step 8 — Registry:** Re-check current list, not only candidates. (1) Modality: every model in chain accepts input call site sends (image support does not satisfy file part). (2) Reasoning that cannot be switched off on tool-calling path. (3) Task group or list with no call site. References on export plus text search, including docs — search sees planning docs language server does not. Recommend delete unless plan in progress. Carrying lists for unbuilt feature = how registry goes stale. (4) Model ids outside registry. **Done when:** every hit = finding with `file:line`, or clean stated in `Registry`.
- [ ] **Step 9 — Proposal:** Proposed list + per-task config (retention, required-parameters, quantization pin, price ceiling, output cap); catalogue price and context window as row comments. Chain order = judgement unless `bkit-audit-llm` scorecard cited — label which. Never an invented score. Apply order (report only, does not apply): (1) wrappers must pass per-task settings or nothing else applies; (2) retention routing pinned at the shared boundary before the model switch, so new models are validated under the routing they will run; (3) import registry, delete hardcoded lists, apply list + per-task config; (4) the eval audit's check before the list is treated as mergeable — do not change model, sampling, and fallback behaviour in one unmeasured step; (5) watch with named revert (current lists, by commit) + per-signal thresholds (format-error rate, fallback-fire count, task success). Cost per job → `bkit-audit-cost`. Open decision → one `Proposal` question + recommendation + what would settle it. Route: defect / filter-fail id → proposed list; missing routing param → per-task config; wrapper cannot pass settings → apply-order (1); model change (incl. alias move) → `bkit-audit-llm`; children's-data borders → `bkit-audit-privacy`; unwired group → delete recommendation. **Done when:** `Proposal` holds list, apply order, watch plan, any open question.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per catalogue field, routing parameter, maker lifecycle rule, and third-party-model control this procedure relies on → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching model choice (registry, wrappers, call sites, routing parameters, embedding model id) → one-line verdict each. Read provider and maker changelogs since previous report for changed meaning of retention routing, reasoning, tool choice, or pricing. Flag catalogue anomalies on current ids: price jump, context cut, endpoint count fallen to one. (b) Bounded ~30 min pass: what senior ML platform engineer flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Include catalogue/changelog items surfaced unchecked, with query for next run. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, the catalogue date, and the counts.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
