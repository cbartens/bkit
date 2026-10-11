<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do NOT edit; run `bkit upgrade` to refresh -->

# Cost Audit

> [!CAUTION]
> **Purpose:** Judge every vendor's plan against usage, bill drivers, and whether a spike would be noticed before the invoice.
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

- Spend spans many vendors, each on its own plan; nobody sees the whole bill.
- Tiers chosen pre-launch stop fitting; free tiers end without deploy; usage-billed services spike from one bug (retry loop, cron fan-out over every tenant, uncapped scraper).
- A cut is never only saving: report what it would stop (e.g. uptime monitor disabled for billing never alerts).

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
- **RIGHT-SIZE:** used, but plan/tier no longer fits: unused headroom or near a hard limit. State change, monthly saving, and what it would stop.
- **REMOVE:** billed, nothing uses it. Proof = no code calls it and no workflow needs it (wider dead code → `bkit-audit-dead-code`). Language-server references where available, and text search; empty is inconclusive. Re-run an empty result once before `REMOVE`.
- **ASK:** cannot tell from evidence, usually unread dashboard. Name who can. An unread bill is `ASK`, never cheap.
- **OTHER:** fits none. Say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Bills:** Steps 3–5, 8 — invoices or billing export (e.g. FOCUS), read-only plan/usage/cap pages (e.g. host dashboard, cloud billing console, vendor API). Fallback: unread vendor = `ASK`; tax, foreign exchange, and card fees `Not Checked`.
- [ ] **Code Search:** Steps 3, 6, 7 — SDKs, outbound hosts, reference checks (e.g. ripgrep, language-server references). Fallback: docs and invoices only; `REMOVE` proof marked incomplete.
- [ ] **Web:** Step 9 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Payment Reports:** Processor or store fees → Steps 3, 5 — fee and commission reports (e.g. card processor, app-store proceeds). Fallback: `Not Checked`.
- [ ] **Legacy Accounts:** Migration map names replaced platform → Step 3 — confirm those subscriptions are not still billing. Fallback: `ASK`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find paid vendors, usage-billed APIs, or payment / store fees (manifests, outbound hosts, vendor docs). **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Inventory:** Build list from code (SDKs, outbound hosts), docs (vendor list, secrets list), and owner-shared invoices; compare. In code, not docs = finding (doc fix → `bkit-audit-documentation`). On invoice, nowhere in code = `REMOVE` candidate. Count non-vendor-plan fees (card-processor, app-store commission): grow with paying accounts; no vendor dashboard. Replaced platform still billing after replacement shipped = `REMOVE` candidate. **Done when:** `Vendors` lists every vendor with its sources.
- [ ] **Step 4 — Plans:** Per vendor: plan, billing model (flat, per seat, per use), spend last three months, usage driver, plan limit, proximity to limit. Split by environment; preview/dev billed like production = finding. Per usage-billed vendor: preview/E2E/CI vs production share, by feature where vendor can tell. Log audit environment split → start from `bkit-audit-logs`. E2E-driven usage on usage-billed vendor = `RIGHT-SIZE` candidate. Every free-tier resource production/CI depends on; behavior at limit (e.g. free DB pauses, free monitor stops). Free tier failing hard = finding even at $0 today. Compare monthly vs annual, prepaid credits, startup programmes, committed-use discounts; propose commitment only if usage stable ≥3 months. Record billing currency, card FX fees, sales tax/VAT/GST/reverse-charge correctness (invoice + card statement, not dashboards). **Done when:** `Vendors` row per vendor: verdict · plan · billing model · three-month spend · change since previous report · driver · limit · environment split. Total spend included.
- [ ] **Step 5 — Unit Cost:** Total monthly cost ÷ active accounts and active users; split fixed/variable. Per metered feature, cost per action (e.g. per model assist, per inbound message). Series vs previous report: without unit cost, bill health is undecidable as usage grows. vs revenue: price × assumed conversion, less processor fees and store commission, vs cost per account. Account costing more than it pays = finding with assumptions. **Done when:** `Unit Cost` holds figures, trend, assumptions.
- [ ] **Step 6 — Drivers:** Per usage-billed service: code driving the meter and worst case (retry, tenant fan-out, cron frequency). Multiplier with no upper bound = finding. Model-call multiplier also names `bkit-audit-llm` (in-code limits); other unbounded multipliers name `docs/failures.jsonl` row to append (append = next step). Egress/data transfer own line: grow with users, unnamed in code (DB egress, cached egress, host data transfer, origin transfer, storage transforms, log-drain egress); top routes/buckets by bytes. Observability metered: log drains, host observability events, replay, trace sample rates in code. From drivers, forecast monthly cost at 10× and 100× today's active accounts; name first vendor whose tier breaks and month at current growth. CI minutes → `bkit-audit-ci-performance`; do not analyse here. **Done when:** `Drivers` row per meter; `Forecast` holds 10×, 100×, first tier break, month.
- [ ] **Step 7 — Leftovers:** Seats for people who no longer need them — cost only here; access → `bkit-audit-security`. Idle resources: projects, DBs, monitors, buckets, domains from experiments. Duplicates: two vendors, one job. **Done when:** `Leftovers` row per hit with monthly amount and verdict.
- [ ] **Step 8 — Caps:** Per usage-billed vendor: spend cap or budget alert, amount, recipients. No cap and no alert = finding even when spend is small. When hit:
  - Notify, stop spend, or pause service; whether hit = outage. Notify-only may leave production serving; pause may take production down (e.g. host spend limit notifies unless production deploys paused). Record check frequency; lag → overshoot.
  - Line items cap does not cover; name per vendor spend-cap doc (e.g. compute, log drains).
  - Model-gateway keys (e.g. per-key spend limit with reset, guardrail budget). Separate keys per environment/feature so preview or one feature cannot drain production. In-code limits → `bkit-audit-llm`; key-level budget stays here. No spend limit or one key shared across environments = finding.
  - Error tracker: spike protection per project + notification when tripped (protection on alone does not notify). Ingest keys rate-limited. On-demand budget set. Quota exhaustion blinds `bkit-audit-logs`.

  Anomalies since previous report: how found (alert or invoice), time to find, cost avoided. Cap that only notifies, omits line items, or pauses production → owner decision on notify/cap/pause with what each would stop; this run does not set it. **Done when:** `Caps` row per usage-billed vendor, and anomaly list.

- [ ] **Step 9 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per FinOps capability (Allocation, Anomaly Management, Budgeting, Forecasting, Unit Economics, and Rate Optimization) → checked (name step) / not applicable (why) / finding. Score each capability crawl, walk, or run; name next to raise. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 10 — Anything Else:** (a) Everything changed since previous report's commit touching cost (SDKs, outbound hosts, vendors, plans, crons, schedules, fan-outs, model calls, sample rates, environment, seat changes) → one-line verdict each. (b) Bounded ~30 min pass: what senior FinOps flags that no step asks; read since previous run (incidents, log-audit reports under `docs/audits/`, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Include invoice charges Steps 4–8 do not explain (new line item, fee, tax, FX, overage). **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

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
