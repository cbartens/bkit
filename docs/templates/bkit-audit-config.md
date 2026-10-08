<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Config Audit

> [!CAUTION]
> **Purpose:** Whether settings outside the code agree across environments, dashboards, repository, and docs — variables, platform, and repository settings, DNS, and anything that expires on a date.
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
> - NEVER print or copy a secret value; names, presence, and dates only.
> - Dashboards, CLIs, and APIs read-only; NEVER change a setting, secret, or DNS record.
> - Every drift claim names the environment and where each side was read.

## Universal Instructions

### Context & Goals

Code is reviewed; dashboards are not. Dashboard changes (hosting, database, payments, error tracker) leave no diff, review, or history → next environment built from docs differs. Target failure: **drift nobody sees until it fails** — e.g. variable in production missing in preview (preview passes on fallback production never takes, or reverse); required check waiting on renamed job; domain / membership / secret lapsing on a date with no deploy. Each = short outage, cheap to prevent, slow to diagnose (nothing changed).

**Applies when:** project deploys to ≥1 hosted environment, or holds settings outside the repo (variables, dashboards, repository settings, DNS). None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass before any release, and after any change made in a dashboard.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- The Twelve-Factor App: III. Config and X. Dev/prod parity.
- Source-host CI security and ruleset docs (e.g. GitHub Actions secure-use reference, GitHub rulesets REST API).
- Platform production checklist (e.g. Supabase Production Checklist).
- TLS certificate validity schedule (e.g. CA/Browser Forum Baseline Requirements, Ballot SC-081v3).
- DNS CAA (RFC 8659); MTA-STS (RFC 8461) and TLS reporting (RFC 8460).
- Mailbox-provider sender requirements (e.g. Gmail, Yahoo) and one-click unsubscribe (RFC 8058).

### Scope

- Variables across every environment and secret store.
- Platform dashboard settings vs repo and docs.
- Runtime versions; scheduled jobs wherever defined.
- Dashboard change history since previous run; secret-free settings snapshot.
- Repository rulesets, required checks, and security settings.
- DNS, domains, registrar, inbound mail transport.
- Deep / invite links and `.well-known` files.
- Email deliverability.
- Expiry calendar: credentials, certificates, accounts, plans.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Config nothing reads; flags set the same everywhere | Dead config | `bkit-audit-dead-code` |
| Secret rotation, mail-authentication policy, who holds keys, workflow contents | Security sweep | `bkit-audit-security` |
| Store signing credentials, developer memberships, store accounts | Store sweep | `bkit-audit-app-store` |
| Rewriting docs that describe a setting wrongly | Docs sweep | `bkit-audit-documentation` |
| Error-stream and platform-log triage | Log sweep | `bkit-audit-logs` |
| Coding-agent settings, permissions, hooks, tool servers; bkit install state | Agent config sweep | `bkit-audit-agents` |
| Changing settings, secrets, or records | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Variable Listing:** Steps 2, 3 — names per environment from every host, CI, and secret store (e.g. `vercel env ls`, `gh secret list` / `gh variable list`, `gcloud secrets list`, `eas env:list`). Fallback: repo-declared names only; environments `Not Checked`.
- [ ] **Platform Read:** Steps 4–6 — read-only dashboard / CLI / management API per platform (e.g. Vercel API, Supabase Management API, Stripe CLI, Sentry API). Fallback: repo and docs only; platform side `Not Checked`.
- [ ] **Audit Logs:** Step 6 — per-platform settings-change history (e.g. Vercel team activity, Supabase org audit log, GitHub org / repo audit log). Fallback: snapshot diff only; set-and-reverted changes `Not Checked`.
- [ ] **Repository API:** Step 7 — rulesets, protection, security settings (e.g. `gh api`, GitLab API). Fallback: none; items `Not Checked`.
- [ ] **DNS and TLS:** Steps 8, 11 — e.g. `dig`, RDAP / `whois`, `openssl s_client`. Fallback: online checker; name it.
- [ ] **Web:** Step 12 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Built Bundle:** Build-time public variables → Step 3 — preview build's client bundle to search. Fallback: source search only; bundle `Not Checked`.
- [ ] **Registrar Account:** Owned domains → Steps 8, 11 — renewal, auto-renew, lock, MFA, contact (e.g. registrar dashboard / API). Fallback: RDAP for lock and expiry; rest `Not Checked`.
- [ ] **Test Devices:** Native app with deep / invite links → Step 9 — device or emulator with and without the app. Fallback: `.well-known` validation only; link opening `Not Checked`.
- [ ] **Mailbox-Provider Tools:** Sends email → Step 10 — e.g. Google Postmaster Tools, email-provider dashboard / API. Fallback: headers of one sent message; rates `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Variables:** Every variable the env schema / loader declares → where set: example env files, each hosting environment (development / preview / production), CI secrets and variables, secret manager, mobile build service. One matrix, names only. Missing from an environment that runs code reading it = finding unless a doc says why. Set where nothing declares it → `bkit-audit-dead-code`. **Done when:** `Variables` matrix: variable × environment, names only.
- [ ] **Step 3 — Variable Handling:** Per matrix variable: (a) build-time public prefix (e.g. `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`, `VITE_*`) inlined into shipped bundle → never a secret; change needs rebuild, not env change. Search preview build's client bundle for server-only names and secret-key prefixes (e.g. `sk_live_`); presence only. (b) Secret held as host's secret type (unreadable back from dashboard / CLI). Preview holding production secret (e.g. DB service-role key, live payments key) = finding. (c) Loader rejects missing / malformed value at startup in every environment, not first use; silent default differing between environments = finding. (d) Feature flags: owner, date added, value per environment; preview ≠ production with no doc saying why = drift; same everywhere → `bkit-audit-dead-code`. **Done when:** every matrix variable answers (a)–(d) in `Variables`.
- [ ] **Step 4 — Platform Settings:** Per platform, dashboard vs repo / docs — hosting: build command, function regions / durations, deployment protection, deployment checks; DB + auth: config file vs each hosted project (auth settings, redirect URLs, email templates, rate limits, extensions, scheduled DB jobs vs docs); background jobs: registered per environment vs code registry; webhooks (payments, email): endpoints, subscribed events, inbound routes vs docs; error tracker: alert rules, monitors vs docs; mobile: build profiles / environments vs build config. Auth (config file, dev, production): site URL, redirect allow-list (no wildcard preview URLs in production), token / OTP expiry, leaked-password protection, SMTP sender, auth rate limits. Mobile config vs builds: runtime version, OTA-update channel per branch, bundle ids — mismatch breaks OTA silently. Classify: in code / documented / recorded nowhere; recorded nowhere = finding even when value is right (next environment will not get it). **Done when:** `Platform Settings` row per setting: platform · environment · where recorded · verdict.
- [ ] **Step 5 — Runtimes and Crons:** Runtime version (e.g. `.nvmrc`, `engines`) vs hosting, CI, mobile build images; DB major version (config file) vs each hosted environment; platform CLI version pinned. Every scheduled job wherever defined (hosting crons, job-runner cron triggers, DB scheduler, scheduled CI workflows) → timezone each runs in; job defined in two places runs twice = finding. **Done when:** `Platform Settings` holds row per runtime and per schedule.
- [ ] **Step 6 — Dashboard Changes:** Today's diff misses a setting changed and changed back → read each platform audit log since previous report; list each settings change: who, what, recorded in repo / doc? Snapshot dashboard config as secret-free JSON (hosting project API; DB management API: auth config, network restrictions, SSL enforcement, pooler; source-host API: rulesets); confirm no secret value; diff vs previous report's `Snapshot`, or committed project copy if any. No previous → baseline. **Done when:** `Dashboard Changes` lists every settings change; `Snapshot` holds JSON and diff, or marked baseline.
- [ ] **Step 7 — Repository:** Rulesets / branch protection on default + release branches; required status checks vs today's CI job names — renamed job = trap (waits on check that never reports, or merges without it once old name removed); merge methods; delete-branch-on-merge; default CI token permissions; CI secrets / variables vs docs. Ruleset detail: bypass actors + mode (e.g. GitHub `pull_request` narrower than `always`; `exempt` skips rules and leaves no bypass entry in audit log); stale reviews dismissed on push; code-owner review enforced; tag ruleset for release tags; protection rules per deployment environment holding secrets. Security: secret scanning + push protection, dependency alerts + security updates, code scanning, SHA-pinned-actions policy, approval before fork PR workflows run. Settings only; workflow contents → `bkit-audit-security`. **Done when:** `Repository` row per setting: expected · actual · verdict.
- [ ] **Step 8 — DNS:** Every domain and subdomain: registrar, renewal date, auto-renew, each record vs where its provider says it should point (e.g. hosting, email). Record for service no longer used = finding (dangling subdomain → takeover). Mail-authentication policy → `bkit-audit-security`; here drift and expiry only. CAA present → authorises every CA the hosts issue from (e.g. `letsencrypt.org`), else renewal fails silently; shrinking certificate lifetimes bite sooner. Registrar hardening: transfer lock (`clientTransferProhibited`), account MFA, registrant email deliverable and off-domain, DNSSEC on or off with written reason. Inbound mail: MX → intended provider; MTA-STS and TLS reporting set (testing mode, then enforce); DMARC `rua` mailbox exists and is read. **Done when:** `DNS` row per domain and record with verdict.
- [ ] **Step 9 — Links:** Native app with deep / invite links → web serves `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`; each valid and names bundle id and signing identity of current build (`Platform Settings`). Open invite link on device with app (opens app) and without (reaches working web page). Broken file breaks every link silently. **Done when:** `Links` row per file and device case.
- [ ] **Step 10 — Deliverability:** Sends email → sending domains vs mailbox-provider sender requirements; record page thresholds. Spam rate (e.g. Google Postmaster Tools) vs bulk-sender limit. One-click unsubscribe (RFC 8058 `List-Unsubscribe-Post` header + visible link) on every non-transactional message; transactional (sign-in links, receipts) exempt. Bounces, complaints, unsubscribes suppressed; nothing re-adds them. Transactional separate from marketing (subdomain / stream) so marketing complaint cannot sink sign-in mail. **Done when:** `Deliverability` row per requirement: threshold · measurement · verdict.
- [ ] **Step 11 — Expiry:** Every credential / account with a date: domains, non-auto-renewing certificates, OAuth client secrets, expiring API keys, source-host tokens, build-service tokens, annual paid plans. Store signing credentials and developer memberships → listed by reference to `bkit-audit-app-store`. Per row: date, owner, what breaks. Due ≤60 days = finding; unknown date = finding. Each non-auto-renewing certificate: issuer and days left measured live (e.g. `openssl s_client`, TLS checker), not read from dashboard; cover custom DB domains, inbound mail hosts, API hosts off main host. Hand-renewed certificate = finding whatever its date; propose automation. **Done when:** `Expiry Calendar` sorted by date, every row with a date or an unknown-date finding.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Twelve-Factor III and X requirement, CI secure-use recommendation, and platform checklist item → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching config (declared variables and example env files, hosting / DB / mobile config files, workflows, and rulesets, scheduled jobs, DNS records, every `Dashboard Changes` entry) → one-line verdict each; dashboard setting changed that no step lists = finding, propose adding it to `Platform Settings`. (b) Bounded ~30 min pass: what a senior platform engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No secrets:** no secret value anywhere in the report, incl. `Snapshot`.
- [ ] **Remote untouched:** no dashboard setting, secret, or DNS record changed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Secret in a public build-time variable or client bundle; production secret reachable from preview; dangling record on a live domain; expired domain / certificate / credential still in use |
| `HIGH` | Required check that no longer reports; anything expiring ≤30 days; variable missing from an environment that runs code reading it; wildcard redirect in production auth; job scheduled in two places; bypass wider than needed or repository security setting off; CAA blocking the issuing CA; broken `.well-known` file or invite link |
| `MEDIUM` | Setting recorded nowhere; silent default differing between environments; flag drift with no doc; expiry 31–60 days or unknown; hand-renewed certificate; secret not held as secret type; runtime version drift; registrar hardening gap; deliverability rule not met |
| `LOW` | Doc describing a setting wrongly while the value is right; naming drift changing no behaviour |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: secrets / production first.

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

### Variables

PENDING

### Platform Settings

PENDING

### Dashboard Changes

PENDING

### Snapshot

PENDING

### Repository

PENDING

### DNS

PENDING

### Links

PENDING

### Deliverability

PENDING

### Expiry Calendar

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
- [ ] **Summary:** names count per severity, environments, and dashboards read.
- [ ] **Series:** `Snapshot` diffed against previous report's, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
