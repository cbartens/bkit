<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Privacy Audit

> [!CAUTION]
> **Purpose:** Lifecycle of personal data — what is held, where it goes, how long it stays, whether deletion removes the person, whether what people are told matches the code.
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
> - Name each field and where it lives; never copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

Privacy rules land with features; nothing re-reads them together. Drift: new table without retention; processor missing from list; deletion cascades only through tables that existed when written; privacy policy describes older app. None fail a test. Most findings = owner decisions (keep / prune / anonymise), not code changes.

**Applies when:** system holds personal data (accounts, contact details, content about people). None → one `N/A` row with evidence, never "clean".

**Cadence:** once before launch, then ≥ yearly (run can serve as annual privacy review). Extra pass when migration adds personal-data tables / columns, or a new processor lands.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed. Covers regimes `Regimes` finds apply and guidance they rely on; statutes also record compilation.

- GDPR and UK GDPR.
- ePrivacy Art 5(3) and EDPB Guidelines 2/2023.
- EDPB DPIA criteria (WP248 rev.01).
- Children's rules (e.g. COPPA, ICO Age Appropriate Design Code).
- National / state laws (e.g. Australian Privacy Act, CCPA).

### Scope

- Applicable regimes and changes.
- Every personal-data store: DB rows, file storage, derived data (embeddings), logs, device storage.
- Children's data: age knowledge, consent, defaults.
- Impact assessments.
- Every recipient system and contract / transfer basis.
- Retention, deletion, other rights.
- Privacy policy, in-app copy, store declarations vs code.
- Breach readiness.

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

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Published Policy:** Step 10 — privacy policy and in-app privacy copy readable (repo file or live URL). Fallback: unreadable → `Not Checked`; no policy = finding.
- [ ] **Web:** Steps 2, 6, 12 — regulator and law sources, vendor sub-processor pages, anchor standards. Fallback: regime changes and versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Live Catalogue:** Hosted DB → Steps 3, 7 — read-only listing of non-row stores and purge jobs, e.g. platform MCP `execute_sql`. Fallback: migrations only; live state = hypothesis.
- [ ] **Vendor Settings:** Third-party processors → Steps 6, 7 — retention, scrubbing, region, e.g. vendor dashboard, API, MCP. Fallback: code and docs only; vendor settings `Not Checked`.
- [ ] **Agreements:** Processors → Steps 6, 11 — signed processing agreements and breach-notice terms, e.g. repo copies, contract store. Fallback: public vendor terms; signed status `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Regimes:** Per candidate regime: applies? why (user locations, turnover / volume thresholds, exemptions and their exceptions, child-directed or actual knowledge). Non-binding regime → mark which checks run as good practice. List law / regulator / code changes since previous report's date, with source links. **Done when:** `Regimes` row per regime: applies · why · changes.
- [ ] **Step 3 — Inventory:** Schema and code. Per table / column / payload: what, whose (user / non-user member / third party named in content), why held, where documented; strictly necessary? default? Optional on by default or model-prompt data beyond task need = finding. Group by purpose → record-of-processing: lawful basis, subjects, recipients, transfer destination and mechanism, security measure. Consent purposes → consent record and withdrawal path. Third parties in content → legitimate-interests assessment and notify decision. Non-row stores: file storage, device caches, derived data (embeddings as personal as source text). Device storage (cookies, local storage, native caches, SDK identifiers) → strictly necessary vs needs consent. **Done when:** `Inventory` lists every store; store no doc mentions = finding.
- [ ] **Step 4 — Children:** When product can hold children's data, state every run: how child is known (field / role / parent statement / not at all) and where; consent path per age band and rule setting it; child defaults (visibility, location, sharing, automated processing); age-threshold crossing (re-consent / role change / nothing); parent monitoring of a child (most children's rules require telling the child). **Done when:** answers in `Inventory`, or evidence product cannot hold children's data in `Checked`.
- [ ] **Step 5 — Assessments:** Current impact assessment (DPIA / PIA) per inventory purpose; list uncovered. Children, new tech (language models), third-party data in content usually meet threshold. Features since previous report's commit vs assessment register; unassessed feature = finding. **Done when:** every purpose has assessment or finding.
- [ ] **Step 6 — Recipients:** Find in code (SDK imports, outbound hosts), not docs: hosting, DB, error tracking, background jobs, email, payments, maps, model providers, anything new. Per recipient: what, why, how long kept. Verify every vendor-side control docs claim (e.g. zero-retention model calls, error-tracker scrub list) in code and tests. Per processor: processing agreement signed (children's-data assurance if required); sub-processor list URL, last checked, change notice; region and transfer mechanism; processor chain (routers fan out); exit plan (export, deletion on exit, replacement). **Done when:** `Recipients` row per system; undocumented one = finding.
- [ ] **Step 7 — Retention:** Per inventory row: what deletes / anonymises it (scheduled job / worker / cascade / nothing); stated period vs enforcing mechanism. Good answer = period, enforcing job, and lawful basis. "Nothing removes it" = finding only without a recorded decision in `docs/decisions.jsonl`. Exception: children's data needs a deletion timeframe regardless — most children's rules forbid indefinite keeping. Published retention policy required → check inventory against published text. **Done when:** `Retention` row per store: period · mechanism, or "no decision".
- [ ] **Step 8 — Deletion:** Read account and tenant deletion code against inventory. Stores reached vs missed: email- / name-keyed rows, file objects, rows in other tenants naming the person. External systems from `Recipients`: does deleting our row delete theirs (payment customers, error-tracker user context, job payloads, backups)? Every run: after deleting a user, what still maps their id back to a person? Deletion test must go red on a missed store — "user can no longer sign in" is not a deletion test. **Done when:** `Deletion` lists every store reached / missed.
- [ ] **Step 9 — Rights:** Per right, how it works today or that it doesn't: access and export (machine-readable where required); correction; partial erasure keeping the account (incl. parent for child); request from a third party named in content; objection and restriction; requester verification (incl. parent for child); response deadline per applicable regime; request log and complaints route. Automated actions with real effect (e.g. a model creating / changing / deleting user data) → "significant effect: yes / no" and reasoning. Right with no exercise path = owner decision, not defect. **Done when:** `Rights` line per right.
- [ ] **Step 10 — Claims:** Read the privacy policy linked from sign-up and in-app privacy copy; compare each claim with `Inventory`, `Recipients`, `Retention`, `Deletion`, `Rights`. Unnamed processor, wrong retention period, unkept promise, unmentioned significant automated decision = finding. Store privacy declarations likewise once listings exist. Child members possible → child-readable policy and collection notices; notice to child when a parent can monitor. Terms, refund wording, accessibility statement likewise. **Done when:** `Claims` row per claim: matches / finding.
- [ ] **Step 11 — Breaches:** Written breach plan per applicable regime: regulator clock and when affected people are told; internal log of every breach (notifiable or not); each processor's notice duty and speed from its agreement. Children's regime requires a written security programme → named coordinator, ≥ yearly risk assessment, tested safeguards. **Done when:** every requirement met or finding.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per standard and each obligation this procedure relies on → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching personal data (migrations, tables / columns, routes and server actions, SDKs and outbound hosts, buckets, consent screens, privacy copy) → one-line verdict each. (b) Bounded ~30 min pass: what senior privacy counsel flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? End with what a regulator would ask that this run cannot answer and legal questions for owner / counsel. **Done when:** `Beyond the Steps` holds both passes and regulator questions, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No values:** no personal-data value anywhere in the report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Personal data exposed to someone who should not see it, or sent to an unnamed processor; deletion leaves a direct identifier; children's data collected without required consent |
| `HIGH` | Personal-data store without retention rule or recorded decision; privacy-policy promise the code breaks; processor without agreement / transfer basis; deletion test blind to a missed store; child row without deletion timeframe |
| `MEDIUM` | Doc describes a store / processor wrongly; purpose without impact assessment; right without exercise path; missing breach-plan element |
| `LOW` | Undocumented field already covered by deletion, retention, and processor list; wording drift changing no obligation |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: children's data first. No users yet → do not lower severity for empty production tables.

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity.
- [ ] **Annual Review:** states whether this run serves as the annual privacy review and whether everyone with children's-data access completed privacy training.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
