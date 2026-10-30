<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Red Team Audit

> [!CAUTION]
> **Purpose:** Active adversarial exploitation of a non-production deployment: one hostile request per probe, with the request and response kept, then cleanup.
>
> **Rules:**
>
> - Probe a non-production deployment only.
> - NEVER probe production, the release branch, or a third party's own platform beyond the calls the app already makes.
> - Use synthetic identities only.
> - Creating and deleting those identities is the only data write, and they are deleted before the report finishes.
> - Send one request per probe.
> - Send no load, no volume fuzzing, and no spend past a single cap.
> - Stop at proof, and do not pivot.
> - NEVER copy a working token into the report.
> - NEVER copy a personal-data value into the report.
> - Record the route, the input shape and the response.

## Universal Instructions

### Context & Goals

Three kinds of failure do not show up in a source read. A row-security denial looks like an empty result. A middleware check is not visible in the route file. A prompt injection shows only when the model runs. The failure this audit targets is a control that holds in the source and fails on a request. Examples: a mixed tenant-id list is clamped to the caller's rows instead of refused, a revoked token is still accepted, or a message makes the model delete items it does not mention. The static suspicions come from `bkit-audit-security` and `bkit-audit-llm`, and this audit sends the request.

**Applies when:** a non-production deployment can be called, and the system has auth, tenancy, or a public free-text model surface. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once before launch, then once a quarter. Run an extra pass after any change to authentication, a route that takes an id, the inbound pipeline, or a machine-client tool.

**Anchor Standards:**

- OWASP Web Security Testing Guide (e.g. WSTG v4.2; record if a newer stable release exists).
- Penetration Testing Execution Standard (PTES): pre-engagement, intelligence gathering, threat modelling, vulnerability analysis, exploitation, post-exploitation, reporting.
- When a probe drives a model: OWASP GenAI Red Teaming Guide, OWASP AI Testing Guide, MITRE ATLAS.
- OWASP Mobile Application Security Testing Guide (MASTG), when the native build is in scope.
- bkit block of `docs/security.md` (bkit version from `.bkit/version`): § Untrusted Content & Prompt Injection

### Scope

- Write the in-list and the out-list for this run, and what each platform's testing page allows.
- Diff the attack surface against the previous report, and give everything new at least one probe.
- Retest every earlier break whose fix has landed.
- Probe cross-tenant reads through the app.
- Probe cross-tenant reads separately through the data API with the client public key.
- Probe acting above a role.
- Probe every way a removed member could get back in.
- Probe authentication, session end and off-site redirects.
- Probe hostile inbound content: unauthorised writes, leaks, internal fetches, impersonation and caps.
- Probe machine-client tool misuse.
- Probe injection at the render, search and webhook boundaries.
- Cross each rate-limit and cost cap once.
- Probe off-topic use of public model surfaces.
- Clean up every identity this run created.

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

Each probe gets one verdict, on its `Probes` row.

- **HELD:** the control did what it should. A held probe is a result, not a blank. **If** no test proves it → route it to `bkit-audit-testing`. It is not a finding.
- **BROKE:** the control failed, and that is a finding. Record the blast radius by reasoning, not by pivoting.
- **INCONCLUSIVE:** the probe was blocked, skipped, or gave no clear answer. Say why. It stays in `Probes`, because a skipped check otherwise reads as passed. **If** a `BROKE` has no kept response → mark it `INCONCLUSIVE` until a later run reproduces it.
- **FIXED** / **STILL BROKE:** use these only for a retest of an earlier `BROKE`, with the fix commit.
- **OTHER:** it fits no other verdict. Say why. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Target:** Steps 2-13 — a non-production deployment of this commit, resolved by commit SHA and confirmed serving. Fallback: none, so the probes stay `INCONCLUSIVE`. NEVER point them at production.
- [ ] **Identities:** Steps 2, 5-12, 15 — create and delete synthetic users and tenants, with a guard so that a non-synthetic identity cannot be deleted. Fallback: none. Do not probe with real accounts.
- [ ] **Web:** Steps 2, 14 — read each platform's penetration-testing page and the anchor standards. Fallback: **If** a platform's policy is unread → send no probes, and record why.

#### Conditional

- [ ] **Data API:** **If** the client public key plus a user token can call the data API directly → Step 6 — e.g., PostgREST, Storage, Realtime. Fallback: probe through the app routes only, and mark the direct path `Not Checked`.
- [ ] **Inbound Mail:** **If** the synthetic tenant has an inbound address → Step 10. Fallback: skip the step, and mark it `Not Checked`.
- [ ] **Machine Client:** **If** a token-gated tool endpoint exists → Steps 2, 11. Fallback: skip with evidence.
- [ ] **Native Build:** **If** this run includes the native client → Step 8 — cached data and sync on a device or emulator. Fallback: test the web only, and mark the device path `Not Checked`.
- [ ] **Model Spend:** **If** a probe drives a model → Steps 10, 13 — a budget for one crossing of one cap. Fallback: do not send the cost probe, and mark it `INCONCLUSIVE`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Engage:** Record the commit and the non-production URL deployed for it. Use the deployment the live lane resolves for that SHA, not a branch alias, which may be stale. Confirm it is serving. Write the scope in `Scope`. The in-list covers: the non-production web URL (e.g., preview deploy, staging), the API host, the machine-client endpoint, the inbound mail domain, the data API via the client public key, the background-job serve endpoint, and the native build if it is tested. The out-list covers: production, the release branch, the persistent demo tenant, every third party's own platform, and anything not on the in-list. Read the current penetration-testing page of each platform the probes touch (app host, database, and the native vendor if in scope). Record what each allows and the plan tier. **If** a page forbids a probe → do not send it, and mark it `INCONCLUSIVE`. Create two synthetic tenants, attacker and victim, each with the roles the product distinguishes. Issue a machine-client token for each owner where the product has one, on a plan the feature allows. Seed the victim with a few records, one recurring record and an attachment. Do not touch the persistent demo tenant. Read the newest `bkit-audit-security` and `bkit-audit-llm` reports. Give each finding they could not prove a probe, and give each of the model audit's prompt-only rules a probe. Give each trust boundary the threat model names at least one probe. **If** there is no threat model → say so in `Scope`. Before a destructive probe, confirm that no other live test holds the target database, and record the window. Do not wait for a named approver. **If** a later probe degrades the target, touches non-synthetic data, or reaches a third party → stop the remaining probes, and record the stop in `Scope`. Each later probe gets a `Probes` row with: the request with tokens redacted, the response status, the relevant body and the verdict. A `BROKE` row adds the blast radius by reasoning, not by pivoting. **Done when:** `Scope` holds the URL, the commit, the in-list, the out-list, the platform rules, the plan tier, the identities (no tokens) and the suspicion list.
- [ ] **Step 3 — Surface:** List the attack surface at this commit: routes, server actions, machine-client tools, webhooks, and the response headers of each in-scope origin. Diff it against the previous report's list. Give everything new at least one probe. **Done when:** `Surface` holds the list and the diff.
- [ ] **Step 4 — Retest:** Re-run every earlier `BROKE` whose fix has landed, from its recorded reproduction. Mark it `FIXED` or `STILL BROKE`, with the fix commit. Confirm that the regression test the prior run named exists. **If** it does not → route it to `bkit-audit-testing`. **Done when:** `Retests` has a row per prior break, or says `none`.
- [ ] **Step 5 — Cross-Tenant:** As the attacker, request the victim's records by id on every route that takes one: items, attachments, download URLs, members, invitations and machine-client read tools. A mixed list of own and foreign ids must be refused, not clamped to the attacker's rows. Expected: denial or not-found, and no victim field in any part of the response, errors included. **Done when:** `Probes` has a row per route, in the Step 2 row shape.
- [ ] **Step 6 — Direct API:** Step 5 goes through the app, and an attacker can skip the app. With the attacker's token and the client public key, ask the data API for the victim's tenant: each tenant-scoped table, privileged routines, GraphQL if enabled, file-storage list and download, and realtime subscribe. Expected: no victim row, object or event. **If** a denial looks like an empty result → send the same request once as the victim, to show it would have returned data. **Done when:** `Probes` has a row per surface, including the victim-control request, or the step is skipped with evidence that the direct API is not exposed.
- [ ] **Step 7 — Roles:** Inside the attacker tenant, have the low role try what only a higher role may do: invite, remove a member, change the plan, issue a machine-client token, delete a record that is not theirs, and delete the tenant. Check each against the role matrix. **Done when:** `Probes` has a row per operation.
- [ ] **Step 8 — Removed:** The realistic attacker is a former tenant member. Remove the attacker's second member, then try every way back in: the web session, native cached data and sync, a machine-client token they issued, invitation links they sent, signed attachment URLs they were given, a capability URL (a calendar feed or equivalent), and mail to the tenant address. Expected: every path fails on the next request, and mail from a removed member gets no more trust than a stranger's. **Done when:** `Probes` has a row per path.
- [ ] **Step 9 — Authentication:** Probe an expired token and a revoked one. A revoked machine token must fail on the next call, with no grace period unless the product records one. A token for a plan that excludes the feature must be refused. Probe a cookie-authenticated write with no `Origin`, and one with a foreign `Origin`. Probe redirect parameters that point off-site. Check that sign-out-all ends every other session. **Done when:** `Probes` has a row per case.
- [ ] **Step 10 — Inbound:** Send mail to the synthetic tenant's inbound address, from the attacker's address, trying to make the model: delete or change records the message does not mention; leak other records into the reply; fetch an internal address (`http://169.254.169.254/`, localhost, private ranges); claim to be a member (by address or display name) from a domain that fails or lacks SPF and DKIM; and exceed the link and attachment caps. Use a payload corpus (e.g., promptfoo, garak), and record which. On a shared inbound provider, use the environment tag the project documents, so the message cannot land in production. Expected: only the records the message genuinely describes are written, nothing else changes, no internal fetch happens, and every cap fires. Check the action log for what was written. The cost probe crosses one limit, once. **Done when:** `Probes` has a row per attempt, with action-log evidence, or `INCONCLUSIVE` where model spend is unavailable.
- [ ] **Step 11 — Tools:** With the attacker's token, act as a client that ignores the rules: set fields the allow-list excludes, pass the victim's ids, change a recurring record without the required scope, send oversized arguments, and repeat a create to test the idempotency key. **Done when:** `Probes` has a row per case, or the step is skipped with evidence that there are no machine-client tools.
- [ ] **Step 12 — Boundaries:** Put script and markup in text fields, and check how they render on the web, in the native client and in a reply. Send injection through the search query and the filters that reach the search routine. Webhook endpoints: no signature must get a denial, and a wrong signature must get the same denial plus an error log. Rate limits: the documented thresholds must fire, then stop. **Done when:** `Probes` has a row per boundary.
- [ ] **Step 13 — Off-Topic:** For each public free-text model surface (from `bkit-audit-llm` `Job Scope`, or from `Surface` when that report lists none), act as an anonymous or synthetic visitor and send one ask per probe: general coding (e.g., "write a Python function that…"), homework, an essay, and an off-topic ask wrapped in an on-topic frame (e.g., "for my trip, write a script that…"). Then send one greeting as a control. Expected: a redirect per the surface's stated job and no off-topic answer, while the greeting gets a normal reply. **If** an off-topic ask is answered → mark it `BROKE`, and record what was meant to bound it (prompt, grounding gate, classifier). **Done when:** `Probes` has a row per surface x ask, or the step is skipped with evidence that there is no public free-text model surface.
- [ ] **Step 14 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per WSTG category (INFO, CONF, IDNT, ATHN, ATHZ, SESS, INPV, ERRH, CRYP, BUSL, CLNT, APIT), and one per ATLAS tactic a model probe touched, each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 15 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches the attack surface: routes, server actions, machine-client tools, webhooks, response headers, inbound handling, and what the client public key can reach. The Step 3 diff is the starting list. (b) In a bounded pass of about 30 minutes, note what a senior penetration tester would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. Probes these passes send follow the Rules, use identities made for this run, and go in `Probes`. Then delete every identity this run created with the guarded delete, which also reaps any tenant it would strand, and confirm that the orphan sweep finds nothing left. Record where the full request and response evidence is kept, for how long, and the redaction applied. **Done when:** `Beyond the Steps` holds both passes, or says `none`. `Cleanup` confirms that every identity this run created is gone. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`. `Expected` names where the finding goes, and recommends the safer fix. This run files nothing. The audit agent writes the `docs/failures.jsonl` rows. Route each result as follows: `BROKE` → a plan from this report, a `docs/failures.jsonl` row, and a regression test (ideally at the deployed boundary) so that `bkit-audit-testing` keeps it fixed; `HELD` with no test → `bkit-audit-testing`; a model result → `bkit-audit-llm`, against the finding it tested; `STILL BROKE` → the original finding, with the retest and the fix commit; `INCONCLUSIVE` → the next run's Step 2 suspicion list, with what blocked it; `OTHER` → this report, and a second run proposes a verdict; a vulnerability in the database product itself, not in the project's use of it → the vendor, per that vendor's testing page, plus this report; a stop condition → the remaining probes stop, and the stop is recorded in `Scope`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Target:** no probe was sent to production, the release branch, a third-party platform, or a non-synthetic identity.
- [ ] **Cleanup:** every identity this run created is deleted.
- [ ] **No tokens:** no token value appears in the report.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

A `HELD` probe stays in `Probes`. Every `BROKE` is a finding, and shares its probe ID. `Expected` carries the WSTG id, the CWE, and the reasoning for likelihood and impact. A model finding also names its OWASP Top 10 for LLM / agentic applications category and its MITRE ATLAS technique, the vocabulary `bkit-audit-llm` uses.

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Response contains another tenant's data; a revoked credential still performs a privileged action; the model deletes, leaks, or fetches internally on the attacker's instruction |
| `HIGH` | A role check fails on a real action; an unsigned or wrongly signed webhook is accepted; a removed member can still read or write; a signed URL still works after removal |
| `MEDIUM` | A mixed id list is clamped instead of refused; a rate limit or size cap does not fire; markup renders unsanitised on one surface; a public model surface answers an off-topic ask |
| `LOW` | Status differs from expected, and the response exposes no data and grants no action |

Within a severity, list cross-tenant findings first. A break on the non-production target keeps the severity it would have in production.

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and the probe counts (`HELD` / `BROKE` / `INCONCLUSIVE`).
- [ ] **Cleanup:** states that every identity this run created is deleted, and where redacted evidence is kept.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
