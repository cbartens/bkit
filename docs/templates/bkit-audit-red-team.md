<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.4.0 — do not edit; run `bkit upgrade` to refresh -->

# Red Team Audit

> [!CAUTION]
> **Purpose:** Active adversarial exploitation of a non-production deployment: one hostile request per probe, the request and response kept, then cleaned up.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites this run's evidence (`file:line`, or command / query and its output) and tool behind it; a previous report's figure, list, or status is a lead, not evidence.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Non-production deployment only. NEVER production, the release branch, or a third party's own platform beyond calls the app already makes.
> - Synthetic identities only; creating and deleting them is the only data write, and they are deleted before the report finishes. One request per probe. No load, volume fuzzing, or spend past a single cap. Stop at proof — do not pivot.
> - never copy a working token or a personal-data value into the report. Record the route, the input shape, and the response.

## Universal Instructions

### Context & Goals

Three shapes do not show up in a source read: row-security denial looks like empty result; middleware checks the route file does not show; prompt injection shows only when the model runs. Target failure: **a control that holds in the source and fails on a request** — e.g. mixed tenant-id list clamped to caller's rows, revoked token still accepted, message makes the model delete items it does not mention. Static suspicions from `bkit-audit-security` and `bkit-audit-llm`; this audit sends the request.

**Applies when:** non-production deployment can be called, and the system has auth, tenancy, or a public free-text model surface. None → one `N/A` row with evidence, never "clean".

**Cadence:** once before launch, then quarterly. Extra pass after any change to authentication, a route that takes an id, the inbound pipeline, or a machine-client tool.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- OWASP Web Security Testing Guide (e.g. WSTG v4.2; record if a newer stable release exists).
- Penetration Testing Execution Standard (PTES): pre-engagement, intelligence gathering, threat modelling, vulnerability analysis, exploitation, post-exploitation, reporting.
- When a probe drives a model: OWASP GenAI Red Teaming Guide, OWASP AI Testing Guide, MITRE ATLAS.
- OWASP Mobile Application Security Testing Guide (MASTG), when the native build is in scope.
- bkit block of `docs/security.md` (bkit version from `.bkit/version`): § Untrusted Content & Prompt Injection

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
- Off-topic use of public model surfaces.
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

- **HELD:** control did what it should. Held probe = result, not blank. No test proves it → `bkit-audit-testing`. Not a finding.
- **BROKE:** control failed = finding. Record blast radius by reasoning, not by pivoting.
- **INCONCLUSIVE:** blocked, skipped, or no clear answer. Say why. Stays in `Probes` — skipped check reads like passed. `BROKE` without kept response → `INCONCLUSIVE` until a later run reproduces.
- **FIXED** / **STILL BROKE:** retest of earlier `BROKE` only, with fix commit.
- **OTHER:** fits none. Say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Target:** Steps 2–13 — non-production deployment of this commit, resolved by commit SHA, confirmed serving. Fallback: none. Probes stay `INCONCLUSIVE`. NEVER point them at production.
- [ ] **Identities:** Steps 2, 5–12, 15 — create and delete synthetic users and tenants, guarded so a non-synthetic identity cannot be deleted. Fallback: none. Do not probe with real accounts.
- [ ] **Web:** Steps 2, 14 — each platform's penetration-testing page, and anchor standards. Fallback: policy unread → do not send probes; record why.

#### Conditional

Verify only when applicable.

- [ ] **Data API:** Client public key plus a user token can call the data API directly → Step 6 — e.g. PostgREST, Storage, Realtime. Fallback: app routes only; direct path `Not Checked`.
- [ ] **Inbound Mail:** The synthetic tenant has an inbound address → Step 10. Fallback: skip; `Not Checked`.
- [ ] **Machine Client:** A token-gated tool endpoint exists → Steps 2, 11. Fallback: skip with evidence.
- [ ] **Native Build:** This run includes the native client → Step 8 — cached data and sync on a device or emulator. Fallback: web only; device path `Not Checked`.
- [ ] **Model Spend:** A probe drives a model → Steps 10, 13 — budget for one crossing of one cap. Fallback: do not send the cost probe; `INCONCLUSIVE`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Engage:** Record commit and non-production URL deployed for it (the deployment the live lane resolves for that SHA, not a branch alias that may be stale). Confirm serving. Write scope in `Scope`. **In:** non-production web URL (e.g. preview deploy, staging), API host, machine-client endpoint, inbound mail domain, data API via client public key, background-job serve endpoint, native build if tested. **Out:** production, release branch, persistent demo tenant, every third party's own platform, anything not on in-list. Read current penetration-testing page of each platform probes touch (app host, database, native vendor if in scope). Record what they allow and plan tier. Page forbids probe → do not send; `INCONCLUSIVE`. Create two synthetic tenants, attacker, and victim, each with roles the product distinguishes. Issue machine-client token for each owner where product has one, on plan the feature allows. Seed victim with few records, one recurring record, attachment. Do not touch persistent demo tenant. Read newest `bkit-audit-security` and `bkit-audit-llm` reports. Every finding they could not prove → probe; model audit's prompt-only rules → probe. Every trust boundary threat model names → ≥1 probe. No threat model → say so in `Scope`. Before destructive probe, confirm no other live test holds target database. Record window. Do not wait for named approver. Later probe degrades target, touches non-synthetic data, or reaches third party → stop remaining probes; record stop in `Scope`. **Done when:** `Scope` holds URL, commit, in-list, out-list, platform rules, plan tier, identities (no tokens), suspicion list. **Probe row** (every later probe): request with tokens redacted, response status, relevant body, verdict. `BROKE` adds blast radius by reasoning, not pivoting.
- [ ] **Step 3 — Surface:** List attack surface at this commit: routes, server actions, machine-client tools, webhooks, response headers of each in-scope origin. Diff vs previous report's list. Everything new → ≥1 probe. **Done when:** `Surface` holds list and diff.
- [ ] **Step 4 — Retest:** Re-run every earlier `BROKE` whose fix landed, from recorded reproduction. `FIXED` or `STILL BROKE`, with fix commit. Confirm regression test prior run named exists; if not → `bkit-audit-testing`. **Done when:** `Retests` row per prior break, or `none`.
- [ ] **Step 5 — Cross-Tenant:** As attacker, request victim's records by id on every route that takes one: items, attachments, download URLs, members, invitations, machine-client read tools. Mixed own-and-foreign id list must be refused, not clamped to attacker's rows. Expected: denial or not-found; no victim field in any response part, including errors. **Done when:** `Probes` row per route, shape as Step 2.
- [ ] **Step 6 — Direct API:** Step 5 goes through app; attacker can skip. With attacker's token and client public key, ask data API for victim's tenant: each tenant-scoped table, privileged routines, GraphQL if enabled, file-storage list and download, realtime subscribe. Expected: no victim row, object, or event. Denial looks like empty result → send same request once as victim to show it would have returned data. **Done when:** `Probes` row per surface, including victim-control request, or skip with evidence direct API not exposed.
- [ ] **Step 7 — Roles:** Inside attacker tenant, low role tries what only higher role may do: invite, remove member, change plan, issue machine-client token, delete record not theirs, delete tenant. Check against role matrix. **Done when:** `Probes` row per operation.
- [ ] **Step 8 — Removed:** Realistic attacker = former tenant member. Remove attacker's second member, then try every way back: web session, native cached data and sync, machine-client token they issued, invitation links they sent, signed attachment URLs they were given, capability URL (calendar feed or equivalent), mail to tenant address. Expected: every path fails on next request; mail from removed member gets no more trust than stranger. **Done when:** `Probes` row per path.
- [ ] **Step 9 — Authentication:** Expired token and revoked one. Revoked machine token fails on next call — no grace period unless product records one. Token for plan excluding feature → refused. Cookie-authenticated write with no `Origin`, or foreign one. Redirect parameters pointing off-site. Sign-out-all ends every other session. **Done when:** `Probes` row per case.
- [ ] **Step 10 — Inbound:** Mail to synthetic tenant inbound address, from attacker address, trying to make model: delete or change records message does not mention; leak other records into reply; fetch internal address (`http://169.254.169.254/`, localhost, private ranges); claim member (address or display name) from domain failing or lacking SPF and DKIM; exceed link and attachment caps. Payload corpus e.g. promptfoo, garak — record which. On a shared inbound provider, use the environment tag the project documents so the message cannot land in production. Expected: only records message genuinely describes are written; nothing else changes; no internal fetch; every cap fires. Check action log for what was written. Cost probe crosses one limit, once. **Done when:** `Probes` row per attempt, with action-log evidence, or `INCONCLUSIVE` where model spend unavailable.
- [ ] **Step 11 — Tools:** With attacker's token, as client that ignores rules: set fields allow-list excludes; pass victim's ids; change recurring record without required scope; send oversized arguments; repeat create to test idempotency key. **Done when:** `Probes` row per case, or skip with evidence no machine-client tools.
- [ ] **Step 12 — Boundaries:** Script and markup in text fields; check render on web, native client, reply. Injection through search query and filters reaching search routine. Webhook endpoints: no signature = denial; wrong signature = same denial plus error log. Rate limits: documented thresholds fire, then stop. **Done when:** `Probes` row per boundary.
- [ ] **Step 13 — Off-Topic:** Per public free-text model surface (`bkit-audit-llm` `Job Scope`; none there → find from `Surface`), as an anonymous or synthetic visitor, one ask per probe: general coding (e.g. "write a Python function that…"), homework, essay, off-topic ask wrapped in an on-topic frame (e.g. "for my trip, write a script that…"); then one greeting as control. Expected: redirect per the surface's stated job, no off-topic answer; greeting gets a normal reply. Off-topic answered → `BROKE`; record what was meant to bound it (prompt, grounding gate, classifier). **Done when:** `Probes` row per surface × ask, or skip with evidence no public free-text model surface.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per WSTG category (INFO, CONF, IDNT, ATHN, ATHZ, SESS, INPV, ERRH, CRYP, BUSL, CLNT, APIT), and per ATLAS tactic a model probe touched → checked (name step) / not applicable (why) / finding. Per bkit anchor (doc section, rule, or issue shape): one row → followed (name step or evidence) / not applicable (why) / finding; departure with no recorded reason (e.g. `docs/decisions.jsonl` row, accepted-divergence entry) = finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching attack surface (routes, server actions, machine-client tools, webhooks, response headers, inbound handling, what client public key can reach; Step 3 diff = starting list) → one-line verdict each. (b) Bounded ~30 min pass: what senior penetration tester flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Probes these passes send follow rules, use identities made for it, go in `Probes`. Then delete every identity this run created with guarded delete (reaps tenant it would strand); confirm orphan sweep finds nothing left. Record where full request/response evidence is kept, for how long, redaction applied. **Done when:** `Beyond the Steps` holds both passes, or `none`; `Cleanup` confirms every identity this run created is gone. Class seen on 2 runs → propose step in `Process Improvements`. `Expected` names where finding goes, recommends safer fix. This run does not file; the audit agent writes `docs/failures.jsonl` rows: `BROKE` → plan from this report, `docs/failures.jsonl` row, regression test (ideally deployed boundary) so `bkit-audit-testing` keeps it fixed; `HELD` with no test → `bkit-audit-testing`; model result → `bkit-audit-llm`, against finding it tested; `STILL BROKE` → original finding, with retest and fix commit; `INCONCLUSIVE` → next run's Step 2 suspicion list, with what blocked; `OTHER` → report, second run proposes verdict; vulnerability in database product itself, not project's use → vendor per that vendor's testing page, plus this report; stop condition → remaining probes stopped, stop recorded in `Scope`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Target:** no probe against production, the release branch, a third-party platform, or a non-synthetic identity.
- [ ] **Cleanup:** every identity this run created is deleted; no token value in the report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

`HELD` probe stays in `Probes`. Every `BROKE` is finding, shares probe ID. `Expected` carries WSTG id, CWE, likelihood and impact rationale. Model finding also names OWASP Top 10 for LLM / agentic applications category and MITRE ATLAS technique — vocabulary `bkit-audit-llm` uses.

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Response contains another tenant's data; a revoked credential still performs a privileged action; the model deletes, leaks, or fetches internally on the attacker's instruction |
| `HIGH` | A role check fails on a real action; an unsigned or wrongly signed webhook is accepted; a removed member can still read or write; a signed URL still works after removal |
| `MEDIUM` | A mixed id list is clamped instead of refused; a rate limit or size cap does not fire; markup renders unsanitised on one surface; a public model surface answers an off-topic ask |
| `LOW` | Status differs from expected, and the response exposes no data and grants no action |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: cross-tenant first. Break on non-production target keeps severity it would have in production.

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
- [ ] **Summary:** names count per severity and probe counts (`HELD` / `BROKE` / `INCONCLUSIVE`).
- [ ] **Cleanup:** states that every identity this run created is deleted, and where redacted evidence is kept.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
