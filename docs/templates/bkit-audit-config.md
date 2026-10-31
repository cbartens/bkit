<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Config Audit

> [!CAUTION]
> **Purpose:** Whether the settings outside the code agree across environments, dashboards, the repository and the docs: variables, platform and repository settings, DNS, and anything that expires on a date.
>
> **Rules:**
>
> - NEVER print or copy a secret value.
> - Record a secret by its name, presence, dates and truncated SHA-256 fingerprint only.
> - Use dashboards, CLIs and APIs read-only.
> - NEVER change a setting, secret or DNS record.
> - Name the environment, and where each side was read, in every drift claim.

## Universal Instructions

### Context & Goals

Code is reviewed, but dashboards are not. A dashboard change (hosting, database, payments, error tracker) leaves no diff, review or history, so the next environment built from the docs differs. The failure this audit targets is drift that nobody sees until it fails. Examples: a variable in production that is missing in preview, so preview passes on a fallback that production never takes, or the reverse; a required check waiting on a renamed job; or a domain, membership or secret lapsing on a date with no deploy. Each one is a short outage that is cheap to prevent and slow to diagnose, because nothing changed.

**Applies when:** the project deploys to >=1 hosted environment, or holds settings outside the repo (variables, dashboards, repository settings, DNS). **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass before any release, and after any change made in a dashboard.

**Anchor Standards:**

- The Twelve-Factor App: III. Config and X. Dev/prod parity.
- Source-host CI security and ruleset docs (e.g. GitHub Actions secure-use reference, GitHub rulesets REST API).
- Platform production checklist (e.g. Supabase Production Checklist).
- TLS certificate validity schedule (e.g. CA/Browser Forum Baseline Requirements, Ballot SC-081v3).
- DNS CAA (RFC 8659); MTA-STS (RFC 8461) and TLS reporting (RFC 8460).
- Mailbox-provider sender requirements (e.g. Gmail, Yahoo) and one-click unsubscribe (RFC 8058).
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Autonomous phase-close prerequisites; § Post-merge dev CI auto-routing; § Promotion-lag warning (`Check Default Branch Lags Dev`)

### Scope

- Check the variables across every environment and secret store.
- Check that secret values match across stores.
- Check that each secret has one declared source.
- Compare the platform dashboard settings with the repo and docs.
- Check the runtime versions.
- Check the scheduled jobs, wherever they are defined.
- Read the dashboard change history since the previous run.
- Take a secret-free settings snapshot.
- Check the repository rulesets, required checks and security settings.
- Check DNS, domains, the registrar and inbound mail transport.
- Check deep and invite links and the `.well-known` files.
- Check email deliverability.
- Build the expiry calendar: credentials, certificates, accounts and plans.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Config nothing reads; flags set the same everywhere | It is dead config | `bkit-audit-dead-code` |
| Secret rotation, mail-authentication policy, who holds keys, workflow contents | The security audit owns them | `bkit-audit-security` |
| Store signing credentials, developer memberships, store accounts | The app-store audit owns them | `bkit-audit-app-store` |
| Rewriting docs that describe a setting wrongly | The documentation audit owns it | `bkit-audit-documentation` |
| Error-stream and platform-log triage | The logs audit owns it | `bkit-audit-logs` |
| Coding-agent settings, permissions, hooks, tool servers | The agents audit owns agent config | `bkit-audit-agents` |
| bkit install state; templates adopted and wired | The adoption audit owns it | `bkit-audit-adoption` |
| Changing settings, secrets, or records | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Variable Listing:** Steps 2, 3 — the names per environment from every host, CI and secret store (e.g., `vercel env ls`, `gh secret list` / `gh variable list`, `gcloud secrets list`, `eas env:list`). Fallback: use the repo-declared names only, and mark environments `Not Checked`.
- [ ] **Platform Read:** Steps 4-6 — a read-only dashboard, CLI or management API per platform (e.g., Vercel API, Supabase Management API, Stripe CLI, Sentry API). Fallback: use the repo and docs only, and mark the platform side `Not Checked`.
- [ ] **Audit Logs:** Step 6 — each platform's settings-change history (e.g., Vercel team activity, the Supabase org audit log, the GitHub org or repo audit log). Fallback: use the snapshot diff only, and mark set-and-reverted changes `Not Checked`.
- [ ] **Repository API:** Step 7 — rulesets, protection and security settings (e.g., `gh api`, GitLab API). Fallback: none. Mark those items `Not Checked`.
- [ ] **DNS and TLS:** Steps 8, 11 — DNS, registration and certificate reads (e.g., `dig`, RDAP / `whois`, `openssl s_client`). Fallback: use an online checker, and name it.
- [ ] **Web:** Step 12 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Built Bundle:** **If** the app has build-time public variables → Step 3 — the preview build's client bundle, to search. Fallback: search the source only, and mark the bundle `Not Checked`.
- [ ] **Secret Fingerprints:** **If** a secret is held in >=2 stores → Step 3 — a read-only value comparison by SHA-256 (e.g., the repo sync tooling's drift mode `node scripts/secrets/bkit-secrets.mjs drift` from the bkit package template `.bkit/templates/scripts/secrets/`, or a hash of the value read in-process). Fallback: compare names and `updated_at` only, and mark values `Not Checked`.
- [ ] **Registrar Account:** **If** the project owns domains → Steps 8, 11 — renewal, auto-renew, lock, MFA and contact (e.g., the registrar dashboard or API). Fallback: use RDAP for lock and expiry, and mark the rest `Not Checked`.
- [ ] **Test Devices:** **If** a native app has deep or invite links → Step 9 — a device or emulator with the app, and one without it. Fallback: validate the `.well-known` files only, and mark link opening `Not Checked`.
- [ ] **Mailbox-Provider Tools:** **If** the app sends email → Step 10 — sender data (e.g., Google Postmaster Tools, the email-provider dashboard or API). Fallback: read the headers of one sent message, and mark rates `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Variables:** For every variable declared (in the env schema or loader, where one exists) or read in code (e.g., `process.env.X`, `os.environ[...]`), record where it is set: example env files, each hosting environment (e.g., development / preview / production), CI secrets and variables, the secret manager, and the mobile build service, where one is used. Build one matrix, names only. A variable missing from an environment that runs code reading it is a finding, unless a doc says why. A variable set where nothing declares it goes to `bkit-audit-dead-code`. **Done when:** `Variables` holds the matrix of variable x environment, names only.
- [ ] **Step 3 — Variable Handling:** For each matrix variable, answer (a)-(f). (a) A build-time public prefix (e.g., `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`, `VITE_*`) is inlined into the shipped bundle, so it must never hold a secret value, and changing it needs a rebuild, not an env change. Search the preview build's client bundle for server-only names and secret-key prefixes (e.g., `sk_live_`), and record presence only. (b) Check that each secret is held as the host's secret type (unreadable back from the dashboard or CLI). A preview environment holding a production secret (e.g., a DB service-role key, a live payments key) is a finding. (c) Check that a missing or malformed value is rejected at startup (e.g., by an env schema loader) in every environment, not at first use. A silent default that differs between environments is a finding. (d) Feature flags: record the owner, the date added and the value per environment. **If** preview != production **and** no doc says why → it is drift. **If** a flag is the same everywhere → it goes to `bkit-audit-dead-code`. (e) Value parity: **If** a secret is held in >=2 stores for one environment (env file, hosting, CI, secret manager, mobile build service, function secrets) → it has the same value everywhere. A name present everywhere proves nothing, because the secret may be rotated in one store and stale in the rest. Compare SHA-256 fingerprints, never values. **If** the store is readable → hash the live value in-process. **If** the store is write-only (e.g., GitHub Actions secrets) → compare the fingerprint at the last recorded push with the source, and compare `updated_at` with that push (a later date means it changed outside the sync). A store holding a name the deployed code no longer reads (renamed, stale) is a finding. **If** parity cannot be proven → mark it `Not Checked`, never pass. (f) Source: every secret has one declared source that every store is compared against (e.g., a sync config with one row per secret naming every store). **If** a copy sits where no API reaches (pasted into a provider dashboard, e.g., a webhook signing secret) → check that it is listed in a copy inventory with how to update it. A secret with no declared source, or a hand-set copy that is not listed, is a finding. **If** there is no sync tooling → `Process Improvements` proposes one (e.g., the bkit package template `.bkit/templates/scripts/secrets/`). A push path that bypasses the sync goes to `bkit-audit-security`. **Done when:** every matrix variable answers (a)-(f) in `Variables`.
- [ ] **Step 4 — Platform Settings:** For each platform in use (e.g., hosting: Vercel, Netlify; DB and auth: Supabase, RDS, Auth0; mobile build: EAS), check only the settings that platform has. **If** there are none → `N/A`. Compare the dashboard with the repo and docs. Hosting: the build command, function regions and durations, deployment protection and deployment checks. DB and auth: the config file, where one exists, against each hosted project (e.g., auth settings, redirect URLs, email templates, rate limits, extensions, and scheduled DB jobs against docs). Background jobs: those registered per environment against the code registry. Webhooks (payments, email): endpoints, subscribed events and inbound routes against docs. Error tracker: alert rules and monitors against docs. Mobile: build profiles and environments against the build config. Auth (config file, dev, production), where offered: the site URL, the redirect allow-list (no wildcard preview URLs in production), token and OTP expiry, leaked-password protection, the SMTP sender and auth rate limits. Mobile config against builds: the runtime version, the OTA-update channel per branch where OTA updates ship (e.g., EAS Update), and bundle ids. A mismatch breaks OTA silently. Classify each setting as in code, documented, or recorded nowhere. A setting recorded nowhere is a finding even when its value is right, because the next environment will not get it. **Done when:** `Platform Settings` holds one row per setting, with platform, environment, where recorded and verdict.
- [ ] **Step 5 — Runtimes and Crons:** Compare the runtime version (e.g., `.nvmrc`, `engines`, `.python-version`) with the hosting, CI and mobile build images. Compare the DB major version (e.g., in the platform config file) with each hosted environment. Check that the platform CLI version is pinned. For every scheduled job, wherever it is defined (hosting crons, job-runner cron triggers, the DB scheduler, scheduled CI workflows), record the timezone it runs in. A job defined in two places runs twice, which is a finding. **Done when:** `Platform Settings` holds one row per runtime and per schedule.
- [ ] **Step 6 — Dashboard Changes:** Today's diff misses a setting that was changed and changed back, so read each platform's audit log since the previous report. List each settings change: who made it, what it was, and whether it is recorded in the repo or a doc. Snapshot the dashboard config as secret-free JSON (e.g., the hosting project API; the DB management API: auth config, network restrictions, SSL enforcement, pooler; the source-host API: rulesets). Confirm that the snapshot holds no secret value. Diff it against the previous report's `Snapshot`, or against the committed project copy, where one exists. **If** there is no previous snapshot → the run is the baseline. **Done when:** `Dashboard Changes` lists every settings change, and `Snapshot` holds the JSON and the diff, or is marked baseline.
- [ ] **Step 7 — Repository:** Check the rulesets or branch protection on the default and release branches. Compare the required status checks with today's CI job names. A renamed job is a trap: the branch waits on a check that never reports, or merges without it once the old name is removed. Check the merge methods, delete-branch-on-merge, the default CI token permissions, and CI secrets and variables against docs. Ruleset detail: bypass actors and mode (e.g., GitHub `pull_request` is narrower than `always`, and `exempt` skips rules and leaves no bypass entry in the audit log); stale reviews dismissed on push; code-owner review enforced; a tag ruleset for release tags; and protection rules for each deployment environment that holds secrets. Security: secret scanning and push protection, dependency alerts and security updates, code scanning, a SHA-pinned-actions policy, and approval before fork PR workflows run. Check settings only. Workflow contents go to `bkit-audit-security`. **Done when:** `Repository` holds one row per setting, with expected, actual and verdict.
- [ ] **Step 8 — DNS:** For every domain and subdomain, record the registrar, the renewal date and auto-renew, and compare each record with where its provider says it should point (e.g., hosting, email). A record for a service no longer used is a finding, because a dangling subdomain allows takeover. Mail-authentication policy goes to `bkit-audit-security`, so for mail-authentication records check only drift and expiry here. **If** CAA is present → check that it authorises every CA the hosts issue from (e.g., `letsencrypt.org`), because otherwise renewal fails silently. Shrinking certificate lifetimes make this bite sooner. Registrar hardening: the transfer lock (`clientTransferProhibited`), account MFA, a registrant email that is deliverable and off-domain, and DNSSEC on, or off with a written reason. Inbound mail: MX points to the intended provider; MTA-STS and TLS reporting are set (testing mode, then enforce); and the DMARC `rua` mailbox exists and is read. **Done when:** `DNS` holds one row per domain and record, with its verdict.
- [ ] **Step 9 — Links:** **If** a native app has deep or invite links → check that the web serves `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`, and that each one is valid and names the bundle id and signing identity of the current build (`Platform Settings`). Open an invite link on a device with the app (it opens the app) and on one without it (it reaches a working web page). A broken file breaks every link silently. **Done when:** `Links` holds one row per file and device case.
- [ ] **Step 10 — Deliverability:** **If** the app sends email → compare the sending domains with the mailbox-provider sender requirements, and record the page's thresholds. Compare the spam rate (e.g., Google Postmaster Tools) with the bulk-sender limit. Check for one-click unsubscribe (the RFC 8058 `List-Unsubscribe-Post` header and a visible link) on every non-transactional message. Transactional mail (sign-in links, receipts) is exempt. Check that bounces, complaints and unsubscribes are suppressed, and that nothing re-adds them. Check that transactional mail is separate from marketing (by subdomain or stream), so a marketing complaint cannot sink sign-in mail. **Done when:** `Deliverability` holds one row per requirement, with threshold, measurement and verdict.
- [ ] **Step 11 — Expiry:** List every credential or account with a date: domains, non-auto-renewing certificates, OAuth client secrets, expiring API keys, source-host tokens, build-service tokens and annual paid plans. List store signing credentials and developer memberships by reference to `bkit-audit-app-store`. For each row, record the date, the owner and what breaks. A date due in <=60 days is a finding, and so is an unknown date. For each non-auto-renewing certificate, measure the issuer and the days left live (e.g., `openssl s_client`, a TLS checker), not from a dashboard. Cover custom DB domains, inbound mail hosts and API hosts off the main host. A hand-renewed certificate is a finding whatever its date, so propose automation. **Done when:** `Expiry Calendar` is sorted by date, and every row has a date or an unknown-date finding.
- [ ] **Step 12 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per Twelve-Factor III and X requirement, per CI secure-use recommendation and per platform checklist item, each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 13 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches config: declared variables and example env files, hosting, DB and mobile config files, workflows and rulesets, scheduled jobs, DNS records, and every `Dashboard Changes` entry. A dashboard setting that changed and that no step lists is a finding, so propose adding it to `Platform Settings`. (b) In a bounded pass of about 30 minutes, note what a senior platform engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No secrets:** no secret value appears anywhere in the report, including `Snapshot`.
- [ ] **Fingerprints only:** every fingerprint in the report is a truncated SHA-256.
- [ ] **Remote untouched:** no dashboard setting, secret or DNS record changed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A secret in a public build-time variable or the client bundle. A production secret reachable from preview. A dangling record on a live domain. An expired domain, certificate or credential still in use |
| `HIGH` | A required check that no longer reports. Anything expiring in <=30 days. A variable missing from an environment that runs code reading it. A secret value that differs between stores of one environment, or code reading a name no store holds. A wildcard redirect in production auth. A job scheduled in two places. A bypass wider than needed, or a repository security setting turned off. CAA blocking the issuing CA. A broken `.well-known` file or invite link |
| `MEDIUM` | A setting recorded nowhere. A secret with no declared source. A hand-set secret copy missing from the inventory. A silent default that differs between environments. Flag drift with no doc. An expiry in 31-60 days, or an unknown one. A hand-renewed certificate. A secret not held as a secret type. Runtime version drift. A registrar hardening gap. A deliverability rule not met |
| `LOW` | A doc that describes a setting wrongly while the value is right. Naming drift that changes no behaviour |

Within a severity, list secrets and production findings first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the environments, and the dashboards read.
- [ ] **Series:** `Snapshot` is diffed against the previous report's, or the run is marked baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
