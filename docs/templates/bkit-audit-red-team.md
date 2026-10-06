<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Red Team Audit

> [!CAUTION]
> **Purpose:** Active adversarial exploitation of a non-production deployment: one hostile request per probe, the request and response kept, then cleaned up.
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
> - Non-production deployment only. NEVER production, the release branch, or a third party's own platform beyond calls the app already makes.
> - Synthetic identities only; creating and deleting them is the only data write, and they are deleted before the report finishes. One request per probe. No load, volume fuzzing, or spend past a single cap. Stop at proof — do not pivot.
> - NEVER copy a working token or a personal-data value into the report. Record the route, the input shape, and the response.

## Universal Instructions

### Context & Goals

Three shapes do not show up in a reading of the source: a row-security denial looks like an empty result, middleware does checks the route file does not show, and prompt injection shows only when the model runs. Target failure: **a control that holds in the source and fails on a request** — e.g. a mixed tenant-id list clamped to the caller's rows, a revoked token still accepted, a message that makes the model delete items it does not mention. Static suspicions come from `bkit-audit-security` and `bkit-audit-llm`; this audit sends the request.

**Applies when:** a non-production deployment can be called, and the system has auth or tenancy. None → one `N/A` row with evidence, never "clean".

**Cadence:** once before launch, then quarterly. Extra pass after any change to authentication, a route that takes an id, the inbound pipeline, or a machine-client tool.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- OWASP Web Security Testing Guide (e.g. WSTG v4.2; record if a newer stable release exists).
- Penetration Testing Execution Standard (PTES): pre-engagement, intelligence gathering, threat modelling, vulnerability analysis, exploitation, post-exploitation, reporting.
- When a probe drives a model: OWASP GenAI Red Teaming Guide, OWASP AI Testing Guide, MITRE ATLAS.
- OWASP Mobile Application Security Testing Guide (MASTG), when the native build is in scope.

### Scope

- Written in-list and out-list for this run, and what each platform's testing page allows.
- Attack-surface diff since the previous report. Everything new gets at least one probe.
- Retest of every earlier break whose fix has landed.
- Cross-tenant reads through the app and, separately, through the data API with the client public key.
- Acting above a role. A removed member trying every way back in.
- Authentication, session end, off-site redirects.
- Hostile inbound content: unauthorised writes, leaks, internal fetches, impersonation, caps.
- Machine-client tool misuse.
- Injection at render, search, and webhook boundaries. Rate-limit and cost caps, one crossing each.
- Cleanup of every identity this run created.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Reading a control without sending the request | Static sweep | `bkit-audit-security` |
| What the model may do, and rules only the prompt enforces | Model sweep | `bkit-audit-llm` |
| Writing the regression test a held probe lacks | Test sweep | `bkit-audit-testing` |
| Production, the release branch, third-party platforms, the persistent demo tenant, identities this run did not create | Rules of engagement | — |
| Load, volume fuzzing, spend past one cap | Can take the target down | — |
| Applying fixes | Audit reports only | Plan from this report |

### Verdicts

One per probe, on the `Probes` row.

- **HELD:** the control did what it should. A probe that held is a result, not a blank. No test proves it → `bkit-audit-testing`. Not a finding.
- **BROKE:** the control failed. It is a finding. Record blast radius by reasoning, not by pivoting.
- **INCONCLUSIVE:** blocked, skipped, or no clear answer. Say why. Stays in `Probes`, because a skipped check reads exactly like a passed one. A `BROKE` whose response was not kept is `INCONCLUSIVE` until a later run reproduces it.
- **FIXED** / **STILL BROKE:** a retest of an earlier `BROKE` only, with the fix commit.
- **OTHER:** fits none. Say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Target:** Steps 2–12 — a non-production deployment of this commit, resolved by commit SHA, confirmed serving. Fallback: none. Probes stay `INCONCLUSIVE`. NEVER point them at production.
- [ ] **Identities:** Steps 2, 5–12, 14 — create and delete synthetic users and tenants, guarded so a non-synthetic identity cannot be deleted. Fallback: none. Do not probe with real accounts.
- [ ] **Web:** Steps 2, 13 — each platform's penetration-testing page, and anchor standards. Fallback: policy unread → do not send probes; record why.

#### Conditional

Verify only when applicable.

- [ ] **Data API:** Client public key plus a user token can call the data API directly → Step 6 — e.g. PostgREST, Storage, Realtime. Fallback: app routes only; direct path `Not Checked`.
- [ ] **Inbound Mail:** The synthetic tenant has an inbound address → Step 10. Fallback: skip; `Not Checked`.
- [ ] **Machine Client:** A token-gated tool endpoint exists → Steps 2, 11. Fallback: skip with evidence.
- [ ] **Native Build:** This run includes the native client → Step 8 — cached data and sync on a device or emulator. Fallback: web only; device path `Not Checked`.
- [ ] **Model Spend:** A probe drives a model → Step 10 — budget for one crossing of one cap. Fallback: do not send the cost probe; `INCONCLUSIVE`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Engage:** Record the commit and the non-production URL deployed for it (the deployment the live lane resolves for that SHA, not a branch alias that may be stale). Confirm it is serving. Write scope in `Scope`. In: preview web URL, API host, machine-client endpoint, inbound mail domain, data API reached with the client public key, background-job serve endpoint, and native build if this run tests it. Out: production, release branch, persistent demo tenant, every third party's own platform, and anything not on the in-list. Read the current penetration-testing page of each platform the probes touch (app host, database, native vendor if in scope). Record what they allow and the plan tier. A page that forbids the probe → do not send it; `INCONCLUSIVE`. Create two synthetic tenants, attacker, and victim, each with the roles the product distinguishes. Issue a machine-client token for each owner where the product has one, on a plan the feature allows. Seed the victim with a few records, one recurring record, and an attachment. Do not touch the persistent demo tenant. Read the newest `bkit-audit-security` and `bkit-audit-llm` reports. Every finding they could not prove becomes a probe, as does the model audit's list of rules only the prompt enforces. Every trust boundary the threat model names gets at least one probe. No threat model → say so in `Scope`. Before any destructive probe, confirm no other live test holds the target database. Record the window. Do not wait for a named approver. A later probe that degrades the target, touches non-synthetic data, or reaches a third party → stop remaining probes and record the stop in `Scope`. **Done when:** `Scope` holds URL, commit, in-list, out-list, platform rules, plan tier, identities (no tokens), and the suspicion list. **Probe row** (every later probe): request with tokens redacted, response status, relevant body, and verdict. `BROKE` adds blast radius by reasoning, not by pivoting.
- [ ] **Step 3 — Surface:** List the attack surface at this commit: routes, server actions, machine-client tools, webhooks, and the response headers of each in-scope origin. Diff against the previous report's list. Everything new gets at least one probe. **Done when:** `Surface` holds the list and the diff.
- [ ] **Step 4 — Retest:** Re-run every earlier `BROKE` whose fix has landed, from its recorded reproduction. `FIXED` or `STILL BROKE`, with the fix commit. Confirm the regression test the prior run named exists; if it does not → `bkit-audit-testing`. **Done when:** `Retests` row per prior break, or `none`.
- [ ] **Step 5 — Cross-Tenant:** As the attacker, request the victim's records by id on every route that takes one: items, attachments, and their download URLs, members, invitations, and machine-client read tools. A mixed own-and-foreign id list must be refused, not clamped to the attacker's rows. Expected: denial or not-found, and no victim field in any part of the response, including errors. **Done when:** `Probes` row per route, shape as Step 2.
- [ ] **Step 6 — Direct API:** Step 5 goes through the app. An attacker can skip it. With the attacker's token and the client public key, ask the data API for the victim's tenant: each tenant-scoped table, privileged routines, GraphQL if enabled, file-storage list and download, and realtime subscribe. Expected: no victim row, object, or event. A denial looks like an empty result, so send the same request once as the victim to show it would have returned data. **Done when:** `Probes` row per surface, including the victim-control request, or skip with evidence the direct API is not exposed.
- [ ] **Step 7 — Roles:** Inside the attacker tenant, a low role tries what only a higher role may do: invite, remove a member, change the plan, issue a machine-client token, delete a record that is not theirs, and delete the tenant. Check against the role matrix. **Done when:** `Probes` row per operation.
- [ ] **Step 8 — Removed:** The realistic attacker is someone who used to be in the tenant. Remove the attacker's second member, then try every way back: the web session, the native client's cached data and sync, the machine-client token they issued, invitation links they sent, signed attachment URLs they were given, any capability URL (calendar feed or equivalent), and mail to the tenant address. Expected: every path fails on the next request, and mail from the removed member gets no more trust than mail from a stranger. **Done when:** `Probes` row per path.
- [ ] **Step 9 — Authentication:** An expired token and a revoked one. A revoked machine token fails on the next call — no grace period unless the product records one. A token for a plan that excludes the feature is refused. A cookie-authenticated write with no `Origin`, or a foreign one. Redirect parameters pointing off-site. Sign-out-all ends every other session. **Done when:** `Probes` row per case.
- [ ] **Step 10 — Inbound:** Mail to the synthetic tenant's inbound address, from the attacker's address, trying to make the model: delete or change records the message does not mention; leak other records into the reply; fetch an internal address (`http://169.254.169.254/`, localhost, private ranges); claim to be a member (address or display name) from a domain that fails or lacks SPF and DKIM; and exceed link and attachment caps. Payload corpus e.g. promptfoo, garak — record which. On a shared inbound provider, use the environment tag the project documents so the message cannot land in production. Expected: only records the message genuinely describes are written, nothing else changes, no internal fetch happens, and every cap fires. Check the action log for what was written. A cost probe crosses one limit, once. **Done when:** `Probes` row per attempt, with action-log evidence, or `INCONCLUSIVE` where model spend was unavailable.
- [ ] **Step 11 — Tools:** With the attacker's token, as a client that ignores the rules: set fields the allow-list excludes; pass the victim's ids; change a recurring record without the required scope; send oversized arguments; and repeat a create to test the idempotency key. **Done when:** `Probes` row per case, or skip with evidence no machine-client tools.
- [ ] **Step 12 — Boundaries:** Script and markup in text fields; check how it renders on web, on the native client, and in the reply. Injection through the search query and through filters that reach the search routine. Webhook endpoints: no signature must be a denial; a wrong signature, the same denial plus an error log. Rate limits: the documented thresholds fire, then stop. **Done when:** `Probes` row per boundary.
- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per WSTG category (INFO, CONF, IDNT, ATHN, ATHZ, SESS, INPV, ERRH, CRYP, BUSL, CLNT, APIT), and per ATLAS tactic a model probe touched → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything changed since previous report's commit touching the attack surface (routes, server actions, machine-client tools, webhooks, response headers, inbound handling, and what the client public key can reach; Step 3's diff is the starting list) → one-line verdict each. (b) Bounded ~30 min pass: what a senior penetration tester flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, and vendor status incidents) — what would no step catch? Any probe these passes send follows the rules, uses identities made for it, and goes in `Probes`. Then delete every identity this run created with the guarded delete, which also reaps a tenant it would strand, and confirm the orphan sweep finds nothing left. Record where full request and response evidence is kept, for how long, and the redaction applied. **Done when:** `Beyond the Steps` holds both passes, or `none`; `Cleanup` confirms every identity this run created is gone. Class seen on 2 runs → propose step in `Process Improvements`. `Expected` names where the finding goes, and recommends the safer fix. This run does not file or append a ledger: `BROKE` → plan from this report, the `docs/failures.jsonl` row to append later, and a regression test (ideally against the deployed boundary) so `bkit-audit-testing` can keep it fixed; `HELD` with no test → `bkit-audit-testing`; a model result → `bkit-audit-llm`, against the finding it tested; `STILL BROKE` → the original finding, with the retest and the fix commit; `INCONCLUSIVE` → the next run's Step 2 suspicion list, with what blocked it; `OTHER` → the report, and the second run proposes a verdict; a vulnerability in the database product itself, not in this project's use of it → the vendor, the way that vendor's testing page says, plus this report; a stop condition → remaining probes stopped, the stop recorded in `Scope`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Target:** no probe against production, the release branch, a third-party platform, or a non-synthetic identity.
- [ ] **Cleanup:** every identity this run created is deleted; no token value in the report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

A `HELD` probe stays in `Probes`. Every `BROKE` is a finding and shares its probe's ID. `Expected` carries the WSTG id, the CWE, and a likelihood and impact rationale. A model finding also names the OWASP Top 10 for LLM / agentic applications category and the MITRE ATLAS technique, the vocabulary `bkit-audit-llm` uses.

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Response contains another tenant's data; a revoked credential still performs a privileged action; the model deletes, leaks, or fetches internally on the attacker's instruction |
| `HIGH` | A role check fails on a real action; an unsigned or wrongly signed webhook is accepted; a removed member can still read or write; a signed URL still works after removal |
| `MEDIUM` | A mixed id list is clamped instead of refused; a rate limit or size cap does not fire; markup renders unsanitised on one surface |
| `LOW` | Status differs from expected, and the response exposes no data and grants no action |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: cross-tenant first. A break on the non-production target keeps the severity it would have in production.

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

### Scope

PENDING

### Surface

PENDING

### Retests

PENDING

### Probes

PENDING

### Cleanup

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
- [ ] **Summary:** names count per severity and probe counts (`HELD` / `BROKE` / `INCONCLUSIVE`).
- [ ] **Cleanup:** states that every identity this run created is deleted, and where redacted evidence is kept.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
