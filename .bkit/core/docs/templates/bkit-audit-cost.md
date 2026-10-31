<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Cost Audit

> [!CAUTION]
> **Purpose:** Judge every vendor's plan against its usage, find what drives the bill, and check whether a spike would be noticed before the invoice.
>
> **Rules:**
>
> - Never change a plan, cancel a resource or edit a billing setting.
> - NEVER copy an invoice number, payment-card detail, account id or secret into the report.

## Universal Instructions

### Context & Goals

Spend spans many vendors, each on its own plan, and nobody sees the whole bill. Tiers chosen before launch stop fitting, free tiers end without a deploy, and usage-billed services spike from one bug (a retry loop, a cron fan-out over every tenant, an uncapped scraper). A cut is never only a saving, so report what it would stop (e.g., an uptime monitor disabled for billing never alerts).
**Applies when:** the project has paid vendors, usage-billed APIs, or payment or store fees. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month, after invoices close. Run an extra pass when a vendor or a paid plan is added or changed, when a spend alert fires, or at launch.

**Anchor Standards:**

- FinOps Framework (e.g. the current edition). Capabilities this audit uses: Allocation, Anomaly Management, Budgeting, Forecasting, Unit Economics, and Rate Optimization, across Public Cloud, SaaS, and AI.
- FOCUS (FinOps Open Cost and Usage Specification); record the version.
- Vendor spend-control docs (e.g. host spend management, database spend cap, model-gateway guardrails, error-tracker spike protection); record the date read.
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Disable GitHub Code Quality billing

### Scope

- List every vendor, plan and environment, including the fees that are not a vendor plan.
- Find the usage drivers in code, egress and metered observability.
- Compare unit cost with revenue.
- Find seats, idle resources and duplicate vendors.
- Check spend caps and alerts: whether a spike is noticed, and what a cap does when it is hit.
- Find legacy subscriptions still billing after a replacement shipped.
- Check currency, foreign exchange and tax.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Model-call limits in code | The LLM audit owns them | `bkit-audit-llm` |
| Why CI minutes are high | The CI performance audit owns it | `bkit-audit-ci-performance` |
| Whether a seat's access is still justified | The security audit owns it | `bkit-audit-security` |
| Editing docs to add a vendor | The documentation audit owns it | `bkit-audit-documentation` |
| Changing a plan, cap, or billing setting | The audit only reports | A plan made from this report |

### Verdicts

Give one verdict per vendor, and one per paid resource inside a vendor that has several.

- **KEEP:** the vendor is used, and the plan fits. Say what uses it.
- **RIGHT-SIZE:** the vendor is used, but the plan or tier no longer fits: it has unused headroom, or is near a hard limit. State the change, the monthly saving and what it would stop.
- **REMOVE:** the vendor is billed, and nothing uses it. The proof is that no code calls it and no workflow needs it (wider dead code goes to `bkit-audit-dead-code`). Use language-server references where available, and text search. An empty result is inconclusive, so re-run an empty result once before giving `REMOVE`.
- **ASK:** the evidence cannot tell, usually because a dashboard is unread. Name who can tell. An unread bill is `ASK`, never cheap.
- **OTHER:** it fits no other verdict. Say why. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Bills:** Steps 3-5, 8 — invoices or a billing export (e.g., FOCUS), and read-only plan, usage and cap pages (e.g., the host dashboard, the cloud billing console, a vendor API). Fallback: give an unread vendor `ASK`, and mark tax, foreign exchange and card fees `Not Checked`.
- [ ] **Code Search:** Steps 3, 6, 7 — SDKs, outbound hosts and reference checks (e.g., ripgrep, language-server references). Fallback: use docs and invoices only, and mark the `REMOVE` proof incomplete.
- [ ] **Web:** Step 9 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Payment Reports:** **If** the project pays processor or store fees → Steps 3, 5 — fee and commission reports (e.g., the card processor, app-store proceeds). Fallback: `Not Checked`.
- [ ] **Legacy Accounts:** **If** the migration map names a replaced platform → Step 3 — confirm that its subscriptions are not still billing. Fallback: give it `ASK`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** Find paid vendors, usage-billed APIs, or payment or store fees (manifests, outbound hosts, vendor docs). **Done when:** `Checked` holds evidence, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Inventory:** Build the vendor list from code (SDKs, outbound hosts), docs (vendor list, secrets list) and the invoices the owner shared, and compare the sources. A vendor in code but not in docs is a finding (the doc fix goes to `bkit-audit-documentation`). A vendor on an invoice but nowhere in code is a `REMOVE` candidate. Count the fees that are not a vendor plan (card-processor fees, app-store commission): they grow with paying accounts and have no vendor dashboard. A replaced platform still billing after its replacement shipped is a `REMOVE` candidate. **Done when:** `Vendors` lists every vendor with its sources.
- [ ] **Step 4 — Plans:** For each vendor, record the plan, the billing model (flat, per seat, per use), the spend over the last three months, the usage driver, the plan limit and how close usage is to it. Split by environment. Preview or dev billed like production is a finding. For each usage-billed vendor, record the share used by preview, E2E and CI against production, by feature where the vendor can tell. For the logging environment split, start from `bkit-audit-logs`. E2E-driven usage on a usage-billed vendor is a `RIGHT-SIZE` candidate. List every free-tier resource that production or CI depends on, and its behaviour at the limit (e.g., a free DB pauses, a free monitor stops). A free tier that fails hard is a finding, even at $0 today. Compare monthly with annual billing, prepaid credits, startup programmes and committed-use discounts. **If** usage has been stable for >=3 months → propose a commitment. **Else** → propose none. Record the billing currency, card FX fees, and whether sales tax, VAT, GST or reverse charge is applied correctly, from the invoice and the card statement, not dashboards. **Done when:** `Vendors` holds one row per vendor, with verdict, plan, billing model, three-month spend, change since the previous report, driver, limit and environment split, plus the total spend.
- [ ] **Step 5 — Unit Cost:** Divide the total monthly cost by active accounts and by active users, and split it into fixed and variable. For each metered feature, record the cost per action (e.g., per model assist, per inbound message). Compare the series with the previous report, because without unit cost the bill's health cannot be judged as usage grows. Against revenue, compare price x assumed conversion, less processor fees and store commission, with the cost per account. An account that costs more than it pays is a finding, stated with its assumptions. **Done when:** `Unit Cost` holds the figures, the trend and the assumptions.
- [ ] **Step 6 — Drivers:** For each usage-billed service, find the code that drives the meter and its worst case (retry, tenant fan-out, cron frequency). A multiplier with no upper bound is a finding. A model-call multiplier also names `bkit-audit-llm` (in-code limits). Other unbounded multipliers get a `docs/failures.jsonl` row, which the audit agent writes. Give egress and data transfer their own line, because they grow with users and are unnamed in code (DB egress, cached egress, host data transfer, origin transfer, storage transforms, log-drain egress), and list the top routes or buckets by bytes. Check metered observability: log drains, host observability events, replay, and trace sample rates in code. From the drivers, forecast the monthly cost at 10x and 100x today's active accounts, and name the first vendor whose tier breaks and the month it breaks at current growth. CI minutes go to `bkit-audit-ci-performance`, so do not analyse them here. **Done when:** `Drivers` holds one row per meter, and `Forecast` holds 10x, 100x, the first tier break and its month.
- [ ] **Step 7 — Leftovers:** Find seats for people who no longer need them, and record only their cost here. Access goes to `bkit-audit-security`. Find idle resources: projects, DBs, monitors, buckets and domains left from experiments. Find duplicates: two vendors doing one job. **Done when:** `Leftovers` holds one row per hit, with its monthly amount and verdict.
- [ ] **Step 8 — Caps:** For each usage-billed vendor, record the spend cap or budget alert, its amount and its recipients. No cap and no alert is a finding, even when spend is small. Record what happens when the cap is hit:
  - Whether it notifies, stops spend or pauses service, and whether a hit means an outage. Notify-only may leave production serving, and pause may take production down (e.g., a host spend limit notifies unless production deploys are paused). Record the check frequency, because lag leads to overshoot.
  - The line items the cap does not cover. Name them from each vendor's spend-cap doc (e.g., compute, log drains).
  - Model-gateway keys (e.g., a per-key spend limit with reset, a guardrail budget). Check that keys are separate per environment or feature, so preview or one feature cannot drain production. In-code limits go to `bkit-audit-llm`, and the key-level budget stays here. No spend limit, or one key shared across environments, is a finding.
  - Error tracker: spike protection per project, and a notification when it trips (protection turned on does not notify by itself). Check that ingest keys are rate-limited and that an on-demand budget is set. Quota exhaustion blinds `bkit-audit-logs`.

  List the anomalies since the previous report: how each was found (alert or invoice), the time to find it, and the cost avoided. **If** a cap only notifies, omits line items or pauses production → record it as an owner decision between notify, cap and pause, with what each would stop. This run does not set it. **Done when:** `Caps` holds one row per usage-billed vendor, and the anomaly list.

- [ ] **Step 9 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per FinOps capability (Allocation, Anomaly Management, Budgeting, Forecasting, Unit Economics, and Rate Optimization), each marked checked (naming the step), not applicable (saying why) or finding. Score each capability crawl, walk or run, and name the next one to raise. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 10 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches cost: SDKs, outbound hosts, vendors, plans, crons, schedules, fan-outs, model calls, sample rates, environment and seat changes. (b) In a bounded pass of about 30 minutes, note what a senior FinOps practitioner would flag that no step asks about. Read what happened since the previous run (incidents, log-audit reports under `docs/audits/`, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. Include the invoice charges that Steps 4-8 do not explain (a new line item, fee, tax, FX or overage). **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No billing writes:** no plan, resource, cap or billing setting changed.
- [ ] **No account secrets:** the report holds no invoice number, card detail, account id or secret.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A cap or free-tier limit that stops production with no workaround. An unbounded meter that can already exhaust the account with no way to stop it |
| `HIGH` | A usage-billed vendor with no cap and no alert. An account that costs more than it pays. A forecast that breaks a tier inside the planning window. A legacy subscription still billing after its replacement is live |
| `MEDIUM` | A plan that no longer fits (`RIGHT-SIZE`). A preview, end-to-end, or CI share of a usage bill. A free tier that fails hard. A cap that only notifies, omits line items, or pauses production. A duplicate vendor. Tax or foreign exchange applied wrongly |
| `LOW` | Docs that omit a vendor the code calls. A seat whose access is otherwise in scope for the security audit. A currency note with no wrong charge |

Within a severity, list the larger monthly amount first. No cap and no alert on a usage-billed vendor is at least `HIGH`, even when today's spend is small.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and the total monthly spend.
- [ ] **Series:** the report shows `Vendors` spend, `Unit Cost`, and `Forecast` beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
