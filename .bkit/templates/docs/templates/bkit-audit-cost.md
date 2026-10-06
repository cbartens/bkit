<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Cost Audit

> [!CAUTION]
> **Purpose:** Judge every vendor's plan against what is used, what drives the bill, and whether a spike would be noticed before the invoice.
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
> - NEVER change a plan, cancel a resource, or edit a billing setting.
> - NEVER copy an invoice number, payment-card detail, account id, or secret into the report.

## Universal Instructions

### Context & Goals

Spend sits across many vendors, each chosen on its own plan, and nobody sees the whole bill in one place. Tiers chosen before launch stop fitting after it, free tiers end without a deploy, and a usage-billed service can spike from one bug: a retry loop, a cron fanning out over every tenant, a scraper with no cap. A cut is never only a saving: the report says what it would stop (e.g. an uptime monitor disabled for billing never alerts).

**Applies when:** paid vendors, usage-billed APIs, or payment / store fees. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly, after invoices close. Extra pass when a vendor or a paid plan is added or changed, a spend alert fires, or at launch.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- FinOps Framework (e.g. the current edition). Capabilities this audit uses: Allocation, Anomaly Management, Budgeting, Forecasting, Unit Economics, and Rate Optimization, across Public Cloud, SaaS, and AI.
- FOCUS (FinOps Open Cost and Usage Specification); record the version.
- Vendor spend-control docs (e.g. host spend management, database spend cap, model-gateway guardrails, error-tracker spike protection); record the date read.

### Scope

- Every vendor, plan, and environment, including fees that are not a vendor plan.
- Usage drivers in code, egress, and metered observability.
- Unit cost against revenue.
- Seats, idle resources, and duplicate vendors.
- Spend caps and alerts: whether a spike is noticed, and what a cap does when hit.
- Legacy subscriptions still billing after a replacement shipped.
- Currency, foreign exchange, and tax.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Model-call limits in code | LLM sweep | `bkit-audit-llm` |
| Why CI minutes are high | CI performance sweep | `bkit-audit-ci-performance` |
| Whether a seat's access is still justified | Security sweep | `bkit-audit-security` |
| Editing docs to add a vendor | Documentation sweep | `bkit-audit-documentation` |
| Changing a plan, cap, or billing setting | Audit reports only | Plan from this report |

### Verdicts

One per vendor, and one per paid resource inside a vendor that has several.

- **KEEP:** used, and the plan fits. Say what uses it.
- **RIGHT-SIZE:** used, but the plan or tier no longer fits: paying for headroom that is unused, or close to a limit that fails hard. State the change, the monthly saving, and what it would stop.
- **REMOVE:** billed, and nothing uses it. Proof = no code calls it and no workflow needs it (wider dead code → `bkit-audit-dead-code`). Language-server references where available, and text search; empty is inconclusive. Re-run an empty result once before `REMOVE`.
- **ASK:** cannot tell from the evidence, usually because the dashboard was not readable. Name who can. An unread bill is `ASK`, never cheap.
- **OTHER:** fits none. Say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Bills:** Steps 3–5, 8 — invoices or a billing export (e.g. FOCUS), and read-only plan, usage, and cap pages, e.g. host dashboard, cloud billing console, vendor API. Fallback: unread vendor = `ASK`; tax, foreign exchange, and card fees `Not Checked`.
- [ ] **Code Search:** Steps 3, 6, 7 — SDKs, outbound hosts, and reference checks, e.g. ripgrep, language-server references. Fallback: docs and invoices only; `REMOVE` proof marked incomplete.
- [ ] **Web:** Step 9 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Payment Reports:** Processor or store fees → Steps 3, 5 — fee and commission reports, e.g. card processor, app-store proceeds. Fallback: `Not Checked`.
- [ ] **Legacy Accounts:** A migration map names a replaced platform → Step 3 — confirm those subscriptions are not still billing. Fallback: `ASK`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find paid vendors, usage-billed APIs, or payment / store fees (manifests, outbound hosts, vendor docs). **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Inventory:** Build the list from three sources and compare them: code (SDKs and outbound hosts), docs (vendor list and the secrets list), and invoices the owner can share. In code and not in the docs = finding; the doc fix belongs to `bkit-audit-documentation`. On an invoice and nowhere in code = `REMOVE` candidate. Count fees that are not a vendor plan (e.g. card-processor fees, app-store commission): they grow with every paying account and appear on no vendor dashboard. Replaced platforms still billing, whose replacement has shipped = `REMOVE` candidate. **Done when:** `Vendors` lists every vendor with its sources.
- [ ] **Step 4 — Plans:** Per vendor: the plan, how it bills (flat, per seat, per use), spend for each of the last three months, what drives the usage, the plan's limit, and how close usage is. Split by environment; a preview or dev project billed like production = finding. Per usage-billed vendor, the share that is preview, end-to-end, or CI rather than production, and by feature where the vendor can tell. Where a log audit recorded an environment split, start from `bkit-audit-logs`. Usage that end-to-end runs drive on a usage-billed vendor = `RIGHT-SIZE` candidate. Every free-tier resource that production or CI depends on, and what happens at its limit (e.g. a free database pauses, a free monitor stops). A free tier that fails hard = finding even when it costs nothing today. Compare monthly with annual pricing, prepaid credits, startup programmes, and committed-use discounts. Propose a commitment only for usage stable for three months or more. Record the currency each vendor bills in, the card's foreign-exchange fees, and whether sales tax, VAT, GST, or a reverse charge is applied correctly. Dashboards do not show these; the invoice and the card statement do. **Done when:** `Vendors` row per vendor: verdict · plan · billing model · three-month spend · change since previous report · driver · limit · environment split. Total spend included.
- [ ] **Step 5 — Unit Cost:** Total monthly cost divided by active accounts, and by active users; split fixed and variable. Per metered feature, cost per action (e.g. per model assist, per inbound message). Series vs previous report: without a unit cost, "is this bill healthy" has no answer as usage grows. Set against revenue: price times the conversion assumed, less processor fees and store commission, against cost per account. An account that costs more than it pays = finding, with the assumptions that produced it. **Done when:** `Unit Cost` holds the figures, the trend, and the assumptions.
- [ ] **Step 6 — Drivers:** Per usage-billed service, the code that drives the meter and its worst case: a retry, a fan-out over every tenant, a cron's frequency. A multiplier with no upper bound = finding. A model-call multiplier also names `bkit-audit-llm` (that audit owns in-code limits); any other unbounded multiplier names the `docs/failures.jsonl` row to append. Appending is the next step. Egress and data transfer get their own line: they grow with users and no code names them (e.g. database egress and cached egress, host data transfer and origin transfer, storage image transformations, log-drain egress). Top routes and buckets by bytes. Observability is metered too: log drains, host observability events, replay, and trace sample rates set in code. From these drivers, forecast monthly cost at 10× and 100× today's active accounts. Name the first vendor whose tier breaks, and the month that happens at current growth. CI minutes, if seen, go to `bkit-audit-ci-performance`; do not analyse them here. **Done when:** `Drivers` row per meter; `Forecast` holds 10×, 100×, the first tier that breaks, and the month.
- [ ] **Step 7 — Leftovers:** Seats for people who no longer need them: this step only counts the cost; who should lose access → `bkit-audit-security`. Idle resources: projects, databases, monitors, buckets, or domains left from an experiment. Duplicates: two vendors doing one job. **Done when:** `Leftovers` row per hit with the monthly amount and a verdict.
- [ ] **Step 8 — Caps:** Per usage-billed vendor: is there a spend cap or a budget alert, at what amount, and who receives it? No cap and no alert = finding even when today's spend is small. Then what the control does when hit:
  - Notify, stop the spend, or pause the service, and whether hitting it is an outage. A notify-only amount can leave production serving; a pause switch can take production down (e.g. a host spend limit that only notifies unless production deploys are paused). Record how often the check runs; a lag means spend overshoots the cap.
  - Line items the cap does not cover. Name them for each vendor from that vendor's spend-cap doc (e.g. compute, log drains).
  - Model-gateway keys (e.g. a per-key spend limit with a reset, or a guardrail budget). Separate keys per environment and per feature, so a preview or one feature cannot drain the production balance. In-code limits → `bkit-audit-llm`; the key-level budget stays here. No spend limit, or one key shared across environments, = finding.
  - Error tracker: spike protection on per project, and a notification when it trips (turning protection on does not itself notify). Ingest keys have rate limits. An on-demand budget is set. Quota exhaustion blinds `bkit-audit-logs`.

  Anomalies since the previous report: how each was found (an alert or the invoice), how long it took to find, and the cost avoided. A cap that only notifies, omits line items, or takes production down → the owner's decision on notify, cap, or pause, with what each would stop. This run does not set it. **Done when:** `Caps` row per usage-billed vendor, and the anomaly list.

- [ ] **Step 9 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per FinOps capability (Allocation, Anomaly Management, Budgeting, Forecasting, Unit Economics, and Rate Optimization) → checked (name step) / not applicable (why) / finding. Score each capability crawl, walk, or run, and name the next to raise. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 10 — Anything Else:** (a) Everything changed since previous report's commit touching cost (SDKs and outbound hosts, vendors, and plans, crons and schedules, fan-outs, model calls, sample rates, environment, or seat changes) → one-line verdict each. (b) Bounded ~30 min pass: what a senior FinOps practitioner flags that no step asks; read what happened since previous run (incidents, log-audit reports under `docs/audits/`, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Include any invoice charge Steps 4–8 do not explain (new line item, fee, tax, foreign-exchange charge, or overage). **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No billing writes:** no plan, resource, cap, or billing setting changed.
- [ ] **No account secrets:** no invoice number, card detail, account id, or secret in the report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A cap or free-tier limit that stops production with no workaround; an unbounded meter already able to exhaust the account with no way to stop it |
| `HIGH` | Usage-billed vendor with no cap and no alert; account costs more than it pays; forecast breaks a tier inside the planning window; legacy subscription still billing after its replacement is live |
| `MEDIUM` | Plan no longer fits (`RIGHT-SIZE`); preview, end-to-end, or CI share of a usage bill; free tier that fails hard; cap that only notifies, omits line items, or pauses production; duplicate vendor; tax or foreign exchange applied wrongly |
| `LOW` | Docs omit a vendor the code calls; a seat whose access is otherwise in scope for the security sweep; a currency note with no wrong charge |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: larger monthly amount first. No cap and no alert on a usage-billed vendor is at least `HIGH`, even when today's spend is small.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Vendors

PENDING

### Unit Cost

PENDING

### Drivers

PENDING

### Forecast

PENDING

### Leftovers

PENDING

### Caps

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
- [ ] **Summary:** names count per severity and total monthly spend.
- [ ] **Series:** `Vendors` spend, `Unit Cost`, and `Forecast` beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
