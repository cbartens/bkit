<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Model Audit

> [!CAUTION]
> **Purpose:** For each call site: the latest capable model for the job, a live model with live fallbacks, and the choice kept in one registry.
>
> **Rules:**
>
> - Never edit the model registry, call wrappers, routing config or call sites.
> - The report proposes the replacement.
> - Run fallback probes with a synthetic fixture.
> - NEVER send production user content.
> - Never write the spend ledger.
> - Never publish a number with no recorded source.

## Universal Instructions

### Context & Goals

A config id looks the same on the day it is delisted as on the day it was chosen. The failure this audit targets is a stale entry that looks the same as a working one until a fallback fires, which is the moment it has to work. Examples: a text-only model in a file chain, two chains that share one fallback that then disappears, a floating alias that now names a different model. Pull the live catalogue; do not remember ids, or infer them from version numbers.

**Applies when:** code calls a hosted model (chat, tools, vision, embeddings, any modality). **If** it does not → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass when a listed id is delisted, a capability the call sends is lost, an expiration or deprecation is added, an alias resolves to a different canonical id, or a new task or call site routes through the fallback wrapper.

**Anchor Standards:**

- Provider model-list APIs, including lifecycle and per-endpoint fields (e.g. OpenRouter models and endpoints APIs: `expiration_date`, `canonical_slug`, `knowledge_cutoff`; Anthropic, OpenAI, and Google model lists).
- Provider routing controls (e.g. OpenRouter `require_parameters`, `quantizations`, `max_price`, `allow_fallbacks`, zero-retention).
- Maker deprecation pages (e.g. Anthropic, OpenAI, Google), plus the equivalent for every other maker in a chain.
- Model cards published by each model's maker.
- NIST AI 600-1, Generative AI Profile, MEASURE, and MANAGE for third-party models.
- OWASP Top 10 for LLM Applications, LLM03 Supply Chain; record the edition (e.g. 2025).

### Scope

- Judge every listed and proposed id against the live provider catalogue.
- Check each call site's fitness: capability, cost (catalogue price, not spend), latency, context and modality.
- Check deprecation, retirement, supersession and expiration.
- Check that endpoints and fallbacks are live, not only claimed in the model summary.
- Check whether ids live in one registry or are scattered.
- Propose a registry and per-task routing. This run does not apply them.

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

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Catalogue Read:** Steps 3, 5, 6 — the live model list for each provider the call sites use (e.g., OpenRouter `/api/v1/models`, Anthropic models API, OpenAI models API, Google models API). Fallback: read maker docs only, and treat live-endpoint claims as hypotheses.
- [ ] **Web:** Steps 5, 10 — maker deprecation pages, model cards, anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Language Server:** **If** call sites are typed → Step 4 — references (e.g., Serena, `tsserver`). Fallback: text search, and name the tool for each claim.
- [ ] **Endpoint API:** **If** the provider exposes per-model endpoints → Step 6 — the endpoint list (e.g., OpenRouter endpoints API). Fallback: read model-summary fields only, and say so.
- [ ] **Usage Ledger:** **If** a usage ledger exists → Step 6 — the largest measured input per task. Fallback: use catalogue context only, and mark measured input `Not Checked`.
- [ ] **Live Call:** **If** there is a credential for a fixture call → Step 7. Fallback: read endpoint metadata only, and mark liveness `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** Find every model call site (SDK calls, HTTP to a model API, config lists), and whether the choice lives in one registry or as literals at the sites. Embeddings and other modalities count. **If** there is no registry **and** ids are inline → the scatter is the finding; still audit the ids. **Done when:** `Checked` holds evidence, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Catalogue:** Pull the live catalogue for each provider Step 2 found. Record the date, the URL and the counts (the full list, and any constrained subset the calls require, e.g., zero-retention). Every id proposed later must exist in this pull. **Done when:** the date, source and counts are in `Catalogue`.
- [ ] **Step 4 — Call Sites:** Derive each call site's requirements from the code on this run: modality, tools and tool choice, structured output, reasoning, output cap, timeout. Do not copy a requirements table forward. Run language-server references on each wrapper and each exported chain to find every task that routes through it. Re-run empty results, and corroborate them with text search, because an empty result is inconclusive. A task added since the previous report shows up only through this step. **Done when:** `Call Sites` has a row per site: task · wrapper · requirements · chain · `file:line` · how derived.
- [ ] **Step 5 — Lifecycle:** Apply hard filters to every listed id and candidate, against the Step 3 pull and the maker page. (a) Retention the call sends (e.g., zero-retention). **If** no endpoint matches → reject the id, because it does not route. (b) `expiration_date` and the maker deprecation page. Reject an id that expires before the next refresh. Reject preview, experimental and free-tier variants. (c) **If** a tool-calling candidate's reasoning cannot be switched off → reject it. Reasoning tokens exhaust the output budget, the model returns no tool call, and the wrapper surfaces a truncation error. (d) Alias or dated snapshot, and which canonical id it resolved to on the pull date. Prefer dated snapshots. An alias whose canonical id differs from the previous report is a model change: name `bkit-audit-llm`, and do not run the eval here. (e) The model card URL, knowledge cutoff, open-weight licence, training-on-data policy, maker terms for products that serve minors, and the hosting region for retention-satisfying endpoints. Children's data crossing borders goes to `bkit-audit-privacy`. **Done when:** `Lifecycle` has a row per id: filters · canonical id · card · verdict.
- [ ] **Step 6 — Endpoints:** A model-level summary can pass Step 5 while no single endpoint does, so query the endpoints, not the summary. Require >=1 endpoint, ideally 2, that satisfies the retention constraint and every parameter the call site sends (tools, tool choice including the required value, file, structured output — as Step 4's table requires). Record whether the call sets the flag that stops the router sending a parameter to a provider that ignores it (e.g., `require_parameters`). **If** the flag is absent → propose it in `Proposal`. For open weights, record the quantization per endpoint, and propose a pin or an order where quality differs. Compare each endpoint's context length and max completion with the largest measured input for that task (from the ledger when it has the task; say when it does not). No output cap on a tool-calling path is a defect in the current list; propose a value per task. Compare latency and throughput per endpoint with the call timeout. The catalogue price is a fitness comment on the proposed row. Blended spend and fallback-rate dollars belong to `bkit-audit-cost`. Propose a per-task price ceiling as routing config, not as a spend figure. **Done when:** `Endpoints` has a row per id: qualifying endpoints · parameters · context vs input · latency vs timeout · verdict.
- [ ] **Step 7 — Fallbacks:** (a) Check that the chain positions come from different makers, so one delisting or outage cannot collapse the retry. Record the router as a single point of failure, and whether any call constructs a direct maker client. A diagram that names maker SDKs is not that client. (b) Run one synthetic fixture per chain position, under the routing parameters production sends. A pass means the position accepted the call shape. A fail is a finding. This proves the fallback answers; it does not score quality. Extraction accuracy, tool-call validity rate and the hostile fixture belong to `bkit-audit-llm`. (c) Record whether anything counts how often a position fires. **If** nothing does:
  - Record it as a finding.
  - Propose a counter in `Process Improvements`.
  - Send the spend consequence to `bkit-audit-cost`.

  **Done when:** `Fallbacks` has a row per position: maker · fixture result or skip · fire-rate measured · verdict.

- [ ] **Step 8 — Registry:** Re-check the current list, not only the candidates. (1) Modality: every model in the chain accepts the input the call site sends (image support does not satisfy a file part). (2) Reasoning that cannot be switched off on a tool-calling path. (3) A task group or list with no call site. Run references on the export plus text search, including docs, because text search sees planning docs that the language server does not. Recommend deleting it unless a plan is in progress, because carrying lists for an unbuilt feature is how a registry goes stale. (4) Model ids outside the registry. **Done when:** every hit is a finding with `file:line`, or `Registry` states that it is clean.
- [ ] **Step 9 — Proposal:** Write the proposed list and per-task config (retention, required-parameters, quantization pin, price ceiling, output cap), with the catalogue price and context window as row comments. Chain order is a judgement unless a `bkit-audit-llm` scorecard is cited; label which. Never invent a score. Give the apply order; the report does not apply it. (1) Wrappers must pass per-task settings, or nothing else applies. (2) Pin retention routing at the shared boundary before the model switch, so new models are validated under the routing they will run. (3) Import the registry, delete hardcoded lists, and apply the list and per-task config. (4) Run the eval audit's check before the list is treated as mergeable; do not change model, sampling and fallback behaviour in one unmeasured step. (5) Watch with a named revert (the current lists, by commit) and per-signal thresholds (format-error rate, fallback-fire count, task success). Cost per job belongs to `bkit-audit-cost`. **If** a decision is open → write one `Proposal` question with `Options: A) … / B) …` and a `Recommended: A) … — {reason}` naming the chosen letter, plus what would settle it. Route each finding: a defect or filter-fail id → the proposed list; a missing routing param → per-task config; a wrapper that cannot pass settings → apply-order (1); a model change (including an alias move) → `bkit-audit-llm`; children's-data borders → `bkit-audit-privacy`; an unwired group → a delete recommendation. **Done when:** `Proposal` holds the list, apply order, watch plan and any open question.
- [ ] **Step 10 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per catalogue field, routing parameter, maker lifecycle rule and third-party-model control this procedure relies on, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches model choice: the registry, wrappers, call sites, routing parameters and embedding model id. Read the provider and maker changelogs since the previous report for a changed meaning of retention routing, reasoning, tool choice or pricing. Flag catalogue anomalies on current ids: a price jump, a context cut, an endpoint count fallen to one. (b) In a bounded pass of about 30 minutes, note what a senior ML platform engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. Include the catalogue and changelog items that surfaced unchecked, with a query for the next run. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **IDs sourced:** every proposed id exists in this run's catalogue pull.
- [ ] **Numbers sourced:** every number has a recorded source.
- [ ] **Registry untouched:** no edit was made to the registry, wrappers, routing config or call sites.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | No listed model has a live endpoint that accepts the call's modality and required parameters; fallback chain has no working position |
| `HIGH` | A fallback position would fail the call shape; listed id deprecated, retiring, or expiring before the next refresh; model id outside the registry; tool-calling model whose reasoning cannot be switched off; chain whose positions share one maker; router may drop a parameter the call sends |
| `MEDIUM` | Floating alias, or alias whose canonical id moved; context or output cap below measured input; only one qualifying endpoint; unwired model list still maintained; open-weight quantization not pinned; nothing records fallback fires |
| `LOW` | Proposed row missing an inline lifecycle or price comment; doc names a model the registry does not, with no call site |

Within a severity, list a call that cannot be served first.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the catalogue date and the counts.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
