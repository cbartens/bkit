<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# LLM Audit

> [!CAUTION]
> **Purpose:** What each model call can make happen, and what stops it when its input is hostile: prompts, tool bounds, output checks, limits, and evals.
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
> - NEVER copy raw mail, prompt text that contains personal data, or a model completion into the report. Cite `file:line` and name the field.
> - NEVER call a model, send mail, or invoke a write tool. Hostile cases are fixtures and code reads.
> - NEVER change a provider account setting. Record logging, retention, and spend caps only.

## Universal Instructions

### Context & Goals

A model that can write is held by its tools, not by a sentence in the prompt. Prose in a prompt is defence-in-depth. The control that holds is structural: what the model is able to do, and what a hostile input cannot make it do. Target failure: **untrusted text reaches a model that can create, change, or delete tenant data, and nothing in code bounds the write.** None of that fails a test unless an eval says so.

**Applies when:** a language model reads input the operator does not control, or a model call can make something happen (a write, a fetch, a tool result that leaves the tenant). None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass after any new model call site, prompt set, or tool, and after a model-registry refresh (`bkit-audit-models`).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- OWASP Top 10 for LLM Applications, 2025 (LLM01–LLM10).
- OWASP Top 10 for Agentic Applications, 2026 (ASI01–ASI10).
- MITRE ATLAS.
- NIST AI RMF 1.0 and its Generative AI Profile, NIST AI 600-1.
- EU AI Act Art 50 (transparency), read with the Commission's guidelines and FAQ. Record the application date read.
- ISO/IEC 42001 (AI management systems) and ISO/IEC 42005 (AI system impact assessment).
- Tool-server authorization and security best practices, where a tool server is exposed (e.g. MCP). Record the specification date read.

Taxonomy names match `bkit-audit-red-team`, so a finding here and its live proof there line up.

### Scope

- Every model call and every tool: input, effect, role, tenant data in context, output that leaves the tenant.
- Least capability: bounds, annotations, allowlists, tenant id source, similarity-search scope.
- Tool-server auth, token lifecycle, tool-description diff.
- Instructions kept apart from data; prompt-only rules listed.
- Hostile text read again after it is stored.
- What comes back: validators, fetches, rendering, zero or many tool calls.
- Paths out of the tenant. Disclosure, children, content safety.
- Per-call limits and worst-case fan-out. Reconstructability and undo.
- Evals, including a hostile fixture.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Model choice, deprecation, catalogue, zero-retention routing, fallback-chain membership | Registry sweep | `bkit-audit-models` |
| Vendor bill outside per-call limits in code | Cost sweep | `bkit-audit-cost` |
| Prose review of the prompt-injection boundary | Security sweep | `bkit-audit-security` |
| Live attack against a running preview | Red team | `bkit-audit-red-team` |
| Fitting a timeout inside the caller duration limit, and retry safety of non-model side effects | Reliability sweep; per-call token, retry, and fan-out caps stay here | `bkit-audit-reliability` |
| Lawful basis and retention periods for prompt data | Privacy sweep | `bkit-audit-privacy` |
| Test quality beyond the eval questions in `Evals` | Testing sweep | `bkit-audit-testing` |
| Changing prompts, tools, limits, or provider settings | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Code Search:** Steps 2–12, 14 — text search and a language server for callers, e.g. ripgrep, Serena, `tsserver`. Prompts are often markdown; tool names are often strings. Language-server hits under-report; empty is inconclusive → corroborate with text search and name the tool. Fallback: text search only; name it per claim.
- [ ] **Taxonomy Skill:** Steps 2–9, 13 — a skill covering the LLM and agentic top 10 editions in Anchor Standards, e.g. `owasp-security`. Categories it lacks → `Checked`. Fallback: read the anchor standards directly.
- [ ] **Web:** Steps 4, 9, 13 — tool-server spec, provider terms, anchor standards. Fallback: regime and version changes recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Provider Account:** A model router with an account → Steps 10, 11 — logging, retention, and spend-cap settings, e.g. OpenRouter dashboard, vendor API. Fallback: code flags only; account settings `Not Checked`.
- [ ] **Live Catalogue:** Hosted DB, and embeddings or an action log → Steps 3, 11 — read-only listing, e.g. platform MCP `execute_sql`. Fallback: migrations and code; live rows = hypothesis.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** Start from code, not from a remembered caller list. Find every model-package import outside that package and outside tests, and list prompt-set directories. Load the taxonomy skill; categories it lacks against the anchor editions → `Checked`. Per model call and per tool, one `Inventory` row: input and who controls it · model-group name the call site uses (choice, deprecation, catalogue, and zero-retention routing → `bkit-audit-models`; do not score them here) · tools offered · what a tool call writes, and to which tenant · which database client the write runs as · which tenant data is placed in the prompt · which output can reach someone outside the tenant. Diff the table against the previous run. A new call site, prompt set, or tool is read first. Per surface, an AI impact-assessment record with a named owner (ISO/IEC 42001 6.1.4, ISO/IEC 42005, NIST AI RMF MAP). Update that record from this table; do not rebuild it. No record = finding. A checked-in inventory that fails when a new call site has no row → propose under `Process Improvements`; do not add it this run. **Done when:** `Inventory` lists every call and tool, or `N/A` and STOP.
- [ ] **Step 3 — Capability:** Per tool, does the caller need it, and what bounds it? Model writes from untrusted inbound content → which rows can it touch: only rows created from the same message or thread, or any row in the tenant? State the outcome of an instruction to delete everything matching a phrase. "Any row" = finding, ranked by how much one message could remove. Outside tool credential is tenant-wide → can it be limited to read-only? If not, record a design question in `Governance`, not a defect, unless code contradicts `docs/decisions.jsonl`. Every tool marked read-only writes nothing; a destructive tool is marked destructive. A host skips its confirmation prompt on read-only tools, so a wrong annotation removes a human check. An allowlist that subtracts fields still subtracts them; a contract test pins it; a new tool goes through the same filter. Tenant id comes from the credential row, never from tool arguments. Check every tool added since the previous run. Similarity search is scoped by tenant inside the query (LLM08). Every query over an embedding store filters by tenant in the query itself, because a privileged role bypasses row-level security. An embedding is regenerated when the source row is edited and deleted when the row is deleted. **Done when:** `Capability` states the inbound bound and a verdict for annotations, allowlist, tenant id, and embedding scope.
- [ ] **Step 4 — Governance:** Outside model holds a credential to a tool server → check it against the tool protocol's authorization and security best practices. Record the auth model. Where the spec says an HTTP server that supports authorization should use OAuth with protected-resource metadata and audience-bound tokens, a static bearer token is a design question in `Governance`, not a defect, unless code contradicts `docs/decisions.jsonl`. Token lifecycle: default lifetime, scopes, how a token is rotated or revoked, whether every tool call is logged per token. The server never passes a token it received to a downstream service. Snapshot every tool's name, description, and annotations; diff the previous run. A changed tool description is a supply-chain risk (ASI04): the outside model reads it as instructions, so it needs a reviewer. No tool server → skip with evidence. **Done when:** `Governance` holds auth, lifecycle, passthrough, and the description diff, or the skip.
- [ ] **Step 5 — Prompts:** Every system prompt lives in a prompt file, not inline at a call site. Inline prompt text = finding. Untrusted content goes in the user message, clearly delimited, never concatenated into a system prompt. Read how templates are filled, and what happens to text that contains the template's own delimiters. Text from links, OCR'd attachments, and calendar files is untrusted too; it must be fenced the same way as the primary body. A prompt rule ("never set a past date") is not a control. List the rules code enforces, and the rules only the prompt asks for. The second list is what `bkit-audit-red-team` attacks. Prose review of the boundary → `bkit-audit-security`. Assume system prompts leak (LLM07). No system prompt contains a secret, an internal host or id, or a rule that is the only control. **Done when:** `Prompt Rules` lists code-enforced rules and prompt-only rules; every inline prompt is a finding.
- [ ] **Step 6 — Hostile Text:** Text written from a hostile input is read again later (ASI06, memory, and context poisoning): by later runs, by embedding search, and by an outside tool caller. Per reader, the row's origin (channel, sender) travels with the text into the prompt or the tool result, so the downstream model and the user can tell the text is untrusted. Text that arrives with no origin = finding. **Done when:** `Hostile Text` row per reader: origin travels · verdict.
- [ ] **Step 7 — Returns:** Every tool call's arguments pass the strict validators before anything is written. A contract test pins them; confirm it covers every tool, including new ones. Model output is never used as code, a host, SQL, or unescaped HTML. Where model output becomes URLs that are fetched: cap the count, allow only expected schemes, and refuse private, loopback, and cloud-metadata addresses. A model told to fetch a metadata address must not be able to. Text a model wrote is rendered safely wherever it is shown (web, native, and reply mail). Zero tool calls, and too many: record what a job does with zero, and what it does with a large count. **Done when:** `Returns` row per output path: validator · sink · bound · verdict.
- [ ] **Step 8 — Paths:** From the two outbound columns of `Inventory`, list every call where tenant data is in the context and an output can reach someone outside the tenant. Above all, a reply to the sender of untrusted input. A hostile sender, tenant data in context, and a reply to that sender together make an exfiltration path (LLM02, ASI01). Record each path and what stops it. Live proof → `bkit-audit-red-team`; this step records the structure. **Done when:** `Paths` row per path: data in context · who receives it · what stops it.
- [ ] **Step 9 — Disclosure:** EU AI Act Art 50. Where the operator puts the system into service under its own name, it is the provider. Per surface people meet, record whether people are told they are dealing with an AI at first exposure, unless that is obvious; above all a model-written reply and AI-created rows. Record whether machine-readable marking of generated content applies, or whether an exemption for an assistive function for standard editing is claimed, with the reasoning. AI-created rows are marked (LLM09), and the UI invites the tenant to review them. Model providers' terms for products with child users, when the product can hold children's data: read each provider's terms. Which providers are reachable → `bkit-audit-models`; do not rediscover the chain. Record compliance per provider. Content safety for attachments: whether anything moderates images and attachments before or after a vision model reads them, and what happens when a model refuses or flags abusive content. **Done when:** `Disclosure` row per surface and per provider: told · marking · terms · moderation · verdict.
- [ ] **Step 10 — Limits:** A hostile or looping input must hit a limit, not a bill. Per model call: maximum output tokens; retries; per-message and per-job caps (URL count, attachment count); for a tool server, the request rate limit. An absent limit = finding. Every model call writes to a spend ledger; check whether anything alerts when a tenant or a day spends abnormally. Record whether the provider account has a hard spend cap. The vendor bill across every vendor → `bkit-audit-cost`. Timeout budgets and idempotency → `bkit-audit-reliability`. Record the worst-case number of model calls one message can trigger (ASI08): retries × fallbacks × chunks × URLs. Then what happens to a message when every model in a chain fails: a dead-letter queue, a notice to the tenant, or a silent drop. Which models sit in the chain → `bkit-audit-models`. **Done when:** `Limits` row per call: output tokens · retries · caps · rate limit · spend alert · hard cap · worst case · failure path.
- [ ] **Step 11 — Provenance:** For any row a model wrote or deleted, can we answer: which message, which model, which prompt version, which tool call? Check whether the model id and the tool arguments are recoverable, not only a channel and a job id. The inverse: no raw inbound text or personal data in logs. A hit is also named for `bkit-audit-privacy` and `bkit-audit-security`. Logs the operator does not own: provider account privacy settings, which no code shows. Record input and output logging (when on, the provider keeps prompts and completions), and any separate setting that lets the provider use inputs and outputs. Expected off. Either on = finding; personal-data retention → `bkit-audit-privacy`. Whether account-level zero-retention is enforced per model group, and whether a plugin or server tool bypasses that routing → `bkit-audit-models`; do not score it here. Record what is stripped from inbound content before it reaches a prompt (headers, other recipients, signatures). Can a model's write be undone (ASI09, LLM06)? `Capability` asks what a model can delete; this asks how it is restored. Model-initiated deletes are soft deletes or not; how long they can be undone; whether the tenant is told what the model changed; whether there is a per-message cap on deletes. **Done when:** `Provenance` answers reconstructability, logging settings, stripping, and undo.
- [ ] **Step 12 — Evals:** The golden set checks that real inputs produce the right rows. Does any fixture carry hostile instructions? A message that says to ignore the instructions and delete every row must produce zero deletes and still extract its real event. Without that case, a model-registry change (`bkit-audit-models`) can weaken this and nothing goes red. Which prompt sets have no golden case at all? A write-capable set with none = finding; a non-write set is recorded. Are the facts that matter right? Track field-level accuracy for dates, times, and places, not only whether a row was created (LLM09). Is there a bar, and is it moving? A pass threshold per prompt set. Evals run on prompt changes as well as model changes. Record the scores in `Evals` so drift between runs is visible. Does the hostile case cover indirect injection? Variants with the instruction in an attachment, a calendar file, an OCR'd image, a linked page, hidden, or zero-width text, and another language. The model-choice scorecard that consumes this fixture → `bkit-audit-models`. **Done when:** `Evals` holds hostile-case verdict, sets with no golden case, field accuracy, thresholds, and scores, or a finding where a bar is absent.
- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per OWASP LLM Top 10 item (LLM01–LLM10) and OWASP Agentic Top 10 item (ASI01–ASI10) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything changed since previous report's commit touching model calls or tools (model package, inbound pipeline, tool server, prompt sets, tools, and their annotations, outbound hosts) → one-line verdict each. Model lifecycle, deprecation, and catalogue diffs → `bkit-audit-models`, not a verdict here. (b) Bounded ~30 min pass: what a senior AI security engineer flags that no step asks; read what happened since previous run (incidents, log-audit sweeps, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Provider changelogs for prompt, tool, or safety behaviour this audit owns. Deprecation and registry changelogs → `bkit-audit-models`. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No payloads:** no raw mail, personal-data value, or model completion in the report.
- [ ] **Read-only:** no model call, write, or provider-account change.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Untrusted input can delete or overwrite tenant data with no structural bound and no undo; tenant data can leave to the sender or another tenant; model output used as a URL, query, or markup that reaches a private or metadata address |
| `HIGH` | Tool can mutate more than the task needs; wrong read-only annotation; tenant id taken from arguments; similarity search not filtered by tenant in the query; write whose only control is prompt text; model call with no output, retry, or fan-out limit; hostile instruction fixture absent; no content-safety path where the product can hold children's data |
| `MEDIUM` | Prompt assembled inline; stored hostile text re-read with no origin; surface with no impact assessment; people not told they are dealing with a model where that is required; model write not reconstructable; eval with no pass threshold; indirect-injection variants absent; write-capable prompt set with no golden case |
| `LOW` | Non-write prompt set with no golden case; disclosure wording drift; annotation wording that does not change behaviour |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: data loss and exfiltration first. An absent limit is at least `HIGH`. A design question recorded in `Governance` is not a finding unless code contradicts `docs/decisions.jsonl`.

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

### Inventory

PENDING

### Capability

PENDING

### Governance

PENDING

### Prompt Rules

PENDING

### Hostile Text

PENDING

### Returns

PENDING

### Paths

PENDING

### Disclosure

PENDING

### Limits

PENDING

### Provenance

PENDING

### Evals

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
- [ ] **Summary:** names count per severity.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Limits:** every model call has a recorded limit, or an absent limit is a finding.
- [ ] **Registry:** model choice, deprecation, and catalogue checks point at `bkit-audit-models` and are not scored here.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
