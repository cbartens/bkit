<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Privacy Audit

> [!CAUTION]
> **Purpose:** The lifecycle of personal data — what is held, where it goes, how long it stays, whether deletion removes the person, and whether what people are told matches the code.
>
> **Rules:**
>
> - Name each field and where it lives.
> - Never copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

Privacy rules land with features, and nothing re-reads them together. The failure this audit targets is the drift that follows. Examples: a new table without retention, a processor missing from the list, a deletion that cascades only through the tables that existed when it was written, a privacy policy that describes an older app. None of these fails a test. Most findings are owner decisions (keep / prune / anonymise), not code changes.

**Applies when:** the system holds personal data (accounts, contact details, content about people). **If** it does not → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once before launch, then at least once a year; a run can serve as the annual privacy review. Run an extra pass when a migration adds personal-data tables / columns, or a new processor lands.

**Anchor Standards:** The standards are the regimes that `Regimes` finds apply, and the guidance they rely on. For statutes, also record the compilation.

- GDPR and UK GDPR.
- ePrivacy Art 5(3) and EDPB Guidelines 2/2023.
- EDPB DPIA criteria (WP248 rev.01).
- Children's rules (e.g. COPPA, ICO Age Appropriate Design Code).
- National / state laws (e.g. Australian Privacy Act, CCPA).

### Scope

- Find the applicable regimes and their changes.
- Map every personal-data store: DB rows, file storage, derived data (embeddings), logs and device storage.
- Check children's data: age knowledge, consent and defaults.
- Check impact assessments.
- List every recipient system, and its contract / transfer basis.
- Check retention, deletion and the other rights.
- Compare the privacy policy, in-app copy and store declarations with the code.
- Check breach readiness.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Auth holes, secrets, PII in logs as attack surface | Security sweep | `bkit-audit-security` |
| Row-level access and purge-job mechanics | Database sweep | `bkit-audit-database` |
| Analytics payloads, consent mode | Tracking sweep | `bkit-audit-analytics`, against this audit's rules |
| Store declarations in depth | Store sweep | `bkit-audit-app-store`, against this audit's inventory |
| Changing retention / data / policy | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Published Policy:** Step 10 — the privacy policy and in-app privacy copy, readable from a repo file or a live URL. Fallback: **If** they are unreadable → mark them `Not Checked`. **If** there is no policy → it is a finding.
- [ ] **Web:** Steps 2, 6, 12 — regulator and law sources, vendor sub-processor pages, anchor standards. Fallback: record regime changes and versions as unread.

#### Conditional

- [ ] **Live Catalogue:** **If** there is a hosted DB → Steps 3, 7 — a read-only listing of non-row stores and purge jobs (e.g., platform MCP `execute_sql`). Fallback: read migrations only, and treat live state as a hypothesis.
- [ ] **Vendor Settings:** **If** there are third-party processors → Steps 6, 7 — retention, scrubbing and region (e.g., vendor dashboard, API, MCP). Fallback: read code and docs only, and mark vendor settings `Not Checked`.
- [ ] **Agreements:** **If** there are processors → Steps 6, 11 — signed processing agreements and breach-notice terms (e.g., repo copies, contract store). Fallback: read public vendor terms, and mark signed status `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Regimes:** For each candidate regime, decide whether it applies, and why: user locations, turnover / volume thresholds, exemptions and their exceptions, a child-directed service or actual knowledge. **If** a regime is not binding → mark which checks run as good practice. List the law / regulator / code changes since the previous report's date, with source links. **Done when:** `Regimes` has a row per regime: applies · why · changes.
- [ ] **Step 3 — Inventory:** Read the schema and code. For each table / column / payload, record what it holds, whose data it is (user / non-user member / third party named in content), why it is held, where it is documented, whether it is strictly necessary, and its default. Optional data that is on by default, or model-prompt data beyond the task's need, is a finding. Group the rows by purpose into a record of processing: lawful basis, subjects, recipients, transfer destination and mechanism, and security measure. **If** a purpose rests on consent → record the consent record and the withdrawal path. **If** content names third parties → record the legitimate-interests assessment and the notify decision. Cover non-row stores: file storage, device caches and derived data (embeddings are as personal as their source text). Classify device storage (cookies, local storage, native caches, SDK identifiers) as strictly necessary or as needing consent. **Done when:** `Inventory` lists every store, and a store no doc mentions is a finding.
- [ ] **Step 4 — Children:** **If** the product can hold children's data → state on every run: how a child is known (field / role / parent statement / not at all) and where; the consent path per age band, and the rule that sets it; the child defaults (visibility, location, sharing, automated processing); what happens when a child crosses an age threshold (re-consent / role change / nothing); and parent monitoring of a child (most children's rules require telling the child). **Done when:** the answers are in `Inventory`, or evidence that the product cannot hold children's data is in `Checked`.
- [ ] **Step 5 — Assessments:** Find the current impact assessment (DPIA / PIA) for each inventory purpose, and list the purposes none covers. Children, new technology (language models) and third-party data in content usually meet the threshold. Compare the features added since the previous report's commit with the assessment register; an unassessed feature is a finding. **Done when:** every purpose has an assessment or a finding.
- [ ] **Step 6 — Recipients:** Find recipients in code (SDK imports, outbound hosts), not docs: hosting, DB, error tracking, background jobs, email, payments, maps, model providers, and anything new. For each recipient, record what it receives, why, and how long it keeps it. Verify in code and tests every vendor-side control the docs claim (e.g., zero-retention model calls, an error-tracker scrub list). For each processor, record whether a processing agreement is signed (with a children's-data assurance if required); the sub-processor list URL, when it was last checked, and the change notice; the region and transfer mechanism; the processor chain (routers fan out); and the exit plan (export, deletion on exit, replacement). **Done when:** `Recipients` has a row per system, and an undocumented one is a finding.
- [ ] **Step 7 — Retention:** For each inventory row, record what deletes or anonymises it (scheduled job / worker / cascade / nothing), and compare the stated period with the enforcing mechanism. A good answer gives the period, the enforcing job and the lawful basis. "Nothing removes it" is a finding only when there is no recorded decision in `docs/decisions.jsonl`. The exception: children's data needs a deletion timeframe regardless, because most children's rules forbid keeping it indefinitely. **If** a published retention policy is required → check the inventory against the published text. **Done when:** `Retention` has a row per store: period · mechanism, or "no decision".
- [ ] **Step 8 — Deletion:** Read the account and tenant deletion code against the inventory. Record the stores reached and missed: email- / name-keyed rows, file objects, and rows in other tenants that name the person. For the external systems in `Recipients`, check whether deleting our row deletes theirs (payment customers, error-tracker user context, job payloads, backups). On every run, ask what still maps a deleted user's id back to a person. A deletion test must go red on a missed store; "user can no longer sign in" is not a deletion test. **Done when:** `Deletion` lists every store reached / missed.
- [ ] **Step 9 — Rights:** For each right, record how it works today, or that it does not: access and export (machine-readable where required); correction; partial erasure that keeps the account (including by a parent for a child); a request from a third party named in content; objection and restriction; requester verification (including a parent for a child); the response deadline per applicable regime; and the request log and complaints route. **If** an automated action has a real effect (e.g., a model creating / changing / deleting user data) → record "significant effect: yes / no" and the reasoning. A right with no exercise path is an owner decision, not a defect. **Done when:** `Rights` has a line per right.
- [ ] **Step 10 — Claims:** Read the privacy policy linked from sign-up and the in-app privacy copy, and compare each claim with `Inventory`, `Recipients`, `Retention`, `Deletion` and `Rights`. An unnamed processor, a wrong retention period, an unkept promise or an unmentioned significant automated decision is a finding. Check the store privacy declarations the same way once listings exist. **If** child members are possible → check for a child-readable policy and collection notices, and for a notice to the child when a parent can monitor. Check the terms, refund wording and accessibility statement the same way. **Done when:** `Claims` has a row per claim: matches / finding.
- [ ] **Step 11 — Breaches:** Check for a written breach plan per applicable regime: the regulator clock and when affected people are told; an internal log of every breach, notifiable or not; and each processor's notice duty and speed from its agreement. **If** a children's regime requires a written security programme → check for a named coordinator, a risk assessment at least yearly, and tested safeguards. **Done when:** every requirement is met or has a finding.
- [ ] **Step 12 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per standard and per obligation this procedure relies on, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 13 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches personal data: migrations, tables / columns, routes and server actions, SDKs and outbound hosts, buckets, consent screens and privacy copy. (b) In a bounded pass of about 30 minutes, note what a senior privacy counsel would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and ask what no step would catch. End with what a regulator would ask that this run cannot answer, and the legal questions for the owner / counsel. **Done when:** `Beyond the Steps` holds both passes and the regulator questions, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No values:** no personal-data value appears anywhere in the report.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Personal data exposed to someone who should not see it, or sent to an unnamed processor; deletion leaves a direct identifier; children's data collected without required consent |
| `HIGH` | Personal-data store without retention rule or recorded decision; privacy-policy promise the code breaks; processor without agreement / transfer basis; deletion test blind to a missed store; child row without deletion timeframe |
| `MEDIUM` | Doc describes a store / processor wrongly; purpose without impact assessment; right without exercise path; missing breach-plan element |
| `LOW` | Undocumented field already covered by deletion, retention, and processor list; wording drift changing no obligation |

Within a severity, list children's data first. **If** there are no users yet → do not lower the severity for empty production tables.

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

### Regimes

PENDING

### Inventory

PENDING

### Recipients

PENDING

### Retention

PENDING

### Deletion

PENDING

### Rights

PENDING

### Claims

PENDING

### Annual Review

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
- [ ] **Summary:** `Summary` gives the count per severity.
- [ ] **Annual Review:** `Annual Review` states whether this run serves as the annual privacy review.
- [ ] **Training:** `Annual Review` states whether everyone with children's-data access completed privacy training.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
