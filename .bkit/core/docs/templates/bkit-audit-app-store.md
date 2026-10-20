<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# App Store Audit

> [!CAUTION]
> **Purpose:** Whether iOS and Android apps can ship and stay listed — deadlines, privacy declarations, permissions, signing credentials, review readiness, and once live: crashes, ratings, listing.
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
> - NEVER submit a build, change a listing, accept an agreement, submit a declaration, or create, rotate, or download a credential.
> - never copy certificate, key, token, or password material into the report; expiry, holder, and recovery path only.
> - Every store, deadline, and credential claim names the platform and the account it was read from.

## Universal Instructions

### Context & Goals

Stores change rules on their own schedule. New target API, higher upload SDK, privacy manifest, or in-app account deletion arrives with a deadline. Miss one → next release blocked when needed, or listing hidden from new users. Nothing else watches this plane. Native builds on hosted builder (if used) may fail with no error-tracker issue. Review, policy notices, certificate expiry → email to account holder. Target failure: **a release blocked, or a listing hidden, by a deadline, declaration, or credential nobody tracked.**

**Applies when:** native app prepared for store or already listed. None → one `N/A` row with evidence, never "clean". Before first submission, readiness steps still run; live-only steps → one `N/A` row with evidence, never "clean". Steps name Apple App Store and Google Play; other stores (e.g. Amazon Appstore, Microsoft Store, Huawei AppGallery) → equivalent policy pages, or `N/A` per step with evidence.

**Cadence:** monthly. Extra pass after yearly conference that sets upload minimums (e.g. Apple's June developer conference) and after yearly target-API announcement (e.g. Google Play).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Apple App Review Guidelines. Record last-updated date.
- Apple upcoming requirements and Apple developer news. Record newest item read.
- App Store Connect Help: App Privacy, age ratings, Accessibility Nutrition Labels, EU Digital Services Act trader requirements. Record date read.
- Apple privacy manifest files, including required-reason APIs and list of commonly used SDKs. Record date read.
- Google Play Developer Program Policy: User Data, Permissions, Families, and Data safety. Record date read and newest policy-update announcement.
- Play target API level requirement and 16 KB page-size requirement. Record required level and each date.
- Android vitals. Record core vitals and their thresholds.
- Native framework and build-service docs (e.g. Expo and EAS). Record SDK version in use and support window.
- Age-assurance rules as stores apply them (e.g. Apple's Texas SB 2420 update, Google Play Age Signals API). Record jurisdictions in force on run date.

### Scope

- Store state, accepted agreements, pending declarations, per platform.
- Deadlines, and guideline and policy diff since previous run.
- Store privacy declarations in depth — privacy manifest, store privacy labels, data-safety form — each matched to `bkit-audit-privacy`'s inventory and privacy policy. This audit does not rebuild that inventory.
- Permissions, including restricted-permission declarations.
- Store and push signing credentials: expiry, holder, recovery path.
- Universal links and App Links against store build.
- Once live: stability, store vitals, ratings, review prompts, releases, whether listing is true.
- Listing fields, localisation, screenshots, conversion.
- Review readiness: demo account, sign-in rules, how digital goods are sold, update-without-review limits, tablet, export compliance, trader status, pre-launch report, accessibility nutrition labels.
- Age rating and age assurance.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| What the app collects; privacy-policy wording; how a child is known | Privacy sweep owns the inventory; declarations here match it | `bkit-audit-privacy` |
| SDK or library upgrade a deadline forces | Dependency sweep | `bkit-audit-dependencies` |
| Crash and ANR clusters as log triage | Logs sweep; the rates stay here | `bkit-audit-logs` |
| Native accessibility beyond the nutrition-label comparison | Accessibility sweep | `bkit-audit-accessibility` |
| Expiry of credentials that are not store or push credentials | Config sweep | `bkit-audit-config` |
| Who should hold store access | Security sweep; the recovery path stays here | `bkit-audit-security` |
| Slow starts, hangs, wake locks, or battery drain as performance work | Performance sweep; the vital stays here | `bkit-audit-app-performance` |
| How the app works, from review themes | Usability sweep; the theme list stays here | `bkit-audit-usability` |
| Association-file hosting and DNS where the store build still matches | Config sweep | `bkit-audit-config` |
| Submitting a build, changing a listing, or touching a credential | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Build Config:** Steps 2–6, 10 — app config and build profiles in repo, e.g. `app.json`, `eas.json`, `project.pbxproj`. Fallback: none; missing config = finding.
- [ ] **Web:** Step 12 — fetch anchor standards and deadline pages. Fallback: versions and dates recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Build Service:** Hosted native builds → Steps 2, 3, 6 — version and build number from service, not local config; last built artifact for native-library alignment, e.g. `eas build:list`, `eas build:view`. Fallback: local config only; remote version = hypothesis.
- [ ] **Store Consoles:** Store accounts exist → Steps 2, 4, 8, 9, 11 — policy status, app content, agreements, listings, e.g. App Store Connect, Play Console. Fallback: repo only; store state `Not Checked`.
- [ ] **Credential Metadata:** Signing material exists → Step 6 — expiry and holder from build service or console, never the material, e.g. `eas credentials`. Fallback: `Not Checked`.
- [ ] **Devices:** Deep links or binary to open → Step 7 — device or emulator with app installed and one without. Fallback: file and config only; opening `Not Checked`.
- [ ] **Vitals:** App is live → Step 8 — store vitals and error tracker, e.g. Play vitals, Xcode Organizer, Sentry, Crashlytics. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Store State:** Per platform: version · build from build service when config keeps version remotely, not local app config; store state (not submitted, in review, live); readable accounts. Read Android policy-status and app-content pages, iOS agreements page. Unaccepted updated agreement or pending declaration blocks uploads = finding → account holder, with page. **Done when:** `Store State` table per platform: version · build · target SDK · store state · accounts read · nearest deadline (filled in `Deadlines`).
- [ ] **Step 3 — Deadlines:** Confirm each date on current store page; page wins if it differs. (a) Target API level and date vs app target SDK from last built Android bundle, not config only. (b) Memory page size: date and target API the requirement names (e.g. updates targeting that API cannot ship unless native libraries support 16 KB pages). Check `.so` alignment in last built bundle, not config. Any app shipping native code in scope. (c) Upload minimum SDK and toolchain vs build image. (d) Native framework SDK support window. (e) Store policy announced since previous run. (f) Guideline and policy diff since previous report's date, tested against app, not deadline-only. Due within 90 days = finding. Due within 30 days = at least `HIGH`. Upgrade fix → `bkit-audit-dependencies`. **Done when:** `Deadlines` row per item: requirement · date · app value · verdict.
- [ ] **Step 4 — Declarations:** Match each declaration to `bkit-audit-privacy`'s inventory and privacy policy. Do not rebuild the inventory. (a) iOS privacy manifest — required-reason APIs for app and every third-party SDK — and store privacy labels. (b) Each SDK on vendor's commonly-used list ships own privacy manifest and signature; tracking-domain list names any tracking domain the app contacts. (c) Android data-safety form. (d) Third-party AI: review guideline requiring disclosure where personal data is shared with third parties, including third-party AI, and explicit permission before sharing (e.g. App Review Guideline 5.1.2(i)). In-app consent screen, stored consent flag gating each call, withdraw path, and privacy label describe same flow. Gap → `bkit-audit-privacy`, and plan item for consent screen. (e) Both stores require account deletion started inside the app, not only on the web. The Android form also requires a working web link, entered on the data-safety form, that names the app or developer and lets someone request deletion without reinstalling. Deleting an account revokes Sign in with Apple tokens through the revoke endpoint, and the server handles the server-to-server notifications for revoked consent and deleted accounts (e.g. Apple technote TN3194), when that provider exists. (f) Advertising-id and tracking answers match what `bkit-audit-analytics` found the app collects. Declaration mismatch = at least `HIGH` → `bkit-audit-privacy`. **Done when:** `Declarations` row per label, manifest entry, and form answer: declared · inventory · verdict.
- [ ] **Step 5 — Permissions:** Each requested permission (e.g. camera, photos, location, contacts, notifications) has true purpose string and feature using it. Leftover permission from removed feature = finding — reviewers reject for it. Android: restricted permissions vs store policy. Photos/videos via system photo picker unless broad media access is core; broad media needs approved console declaration. Exact-alarm only for alarms/timers/calendar core apps; others → schedule-exact with user consent. Full-screen intent default only alarm/calling apps; others need user consent and console declaration. Post-notifications at runtime when notification makes sense, not first launch. Unused permission → plan from this report. **Done when:** `Permissions` row per permission: purpose string · feature · verdict.
- [ ] **Step 6 — Credentials:** iOS distribution certificate and provisioning profiles, push key, Android upload key and store app signing, build-service credentials, developer-program membership: each expiry, holder, recovery if holder leaves. Lost upload key with no store app signing → app never updatable = `CRITICAL` until shown otherwise. Include push-messaging service-account credential for current HTTP API; legacy server keys must be unused. Record expiry, holder, recovery path only. Who should hold access → `bkit-audit-security`. Other expiry → `bkit-audit-config`. No owner or no recovery path = at least `HIGH`. **Done when:** `Credentials` row per item: expiry · holder · recovery · verdict.
- [ ] **Step 7 — Links:** Native app with invite/deep links → association files on web domain over HTTPS, no redirect, cover invite/join/email deep-link paths, match shipped apps: iOS team and bundle id; Android SHA-256 fingerprints including store signing key's, not upload key only. Open invite link on device with app and without. Hosting/DNS drift where store build still matches → `bkit-audit-config`. File mismatch vs store build = finding → plan from this report. **Done when:** `Links` row per file and per device case.
- [ ] **Step 8 — Live:** Not listed → `N/A` in `Live`, never "clean"; skip rest. (a) Crash-free sessions; Android ANR rate — store vitals, Xcode Organizer, error tracker. Compare crash/ANR vs overall and per-device bad-behaviour thresholds, not overall only. Cluster → `bkit-audit-logs`. (b) Android vitals beyond crashes: excessive partial wake locks (core vital; record vitals-page date) and slow cold/warm starts. (c) Xcode Organizer beyond crashes: hang rate, launch time, memory, disk writes, battery, per version. Slow starts, hangs, wake locks, battery → `bkit-audit-app-performance`. (d) Rating and change since previous run; recent review themes. How-app-works themes → `bkit-audit-usability`. (e) Review prompts via store review API only — never incentivised or gated. Replies vs owner response-rate target. (f) Rejections since previous run and reasons. (g) Production: phased release and staged rollout, halt rule tied to crash-free sessions; external test tracks active. (h) Screenshots current, description true, support and privacy URLs work. Out-of-date listing → owner, with screen or text. **Done when:** `Live` holds rates, rating, each verdict, or `N/A`.
- [ ] **Step 9 — Listing:** Pre-submission → draft listing; live → published. Title, subtitle, keyword field, short/full description: within store field limits, search-oriented words. Localised listings for shipped locales. Screenshot sets per required device size; tablet if supported. Live: conversion funnel (impressions, product-page views, installs) from both stores' acquisition reports, change since previous run. Record listing experiments; propose one quarterly test (screenshots or icon) to owner. **Done when:** `Listing` row per field and locale: within limits · true · verdict.
- [ ] **Step 10 — Readiness:** (a) Working demo account for reviewers, not seeded owner. (b) Sign in with Apple if any other third-party sign-in on iOS. (c) How digital subscriptions sold in-app. External processor vs in-app purchase limited by store/country rules — owner decision in `docs/decisions.jsonl`; match record to app behaviour. (d) Out-of-app purchase links vs same rules. (e) Subscription disclosures: terms, price, renewal before purchase; manage/cancel path; restore purchases if IAP used. External-processor-only subscriptions → account deletion explains cancellation. (f) App ships over-the-air updates (e.g. Expo Updates, CodePush) → script and assets only — never change primary purpose or skip-review feature. Runtime-version policy prevents incompatible binary landing. Breach → plan from this report. None → `N/A`. (g) Tablet supported → layouts work on tablet for review; else flag false on purpose. (h) Export-compliance flag set so uploads not held. (i) Trader status on both stores — undeclared apps removed from EU storefronts. (j) Current closed-test rule for personal developer account (e.g. account created after 2023-11-13 needs closed test with ≥12 testers opted in 14 consecutive days before production). Identity verification and package-name registration; record store-page date for unregistered package removal (e.g. 2026-09-30). (k) Pre-launch report for latest build: crashes, accessibility, security warnings; failed devices/OS versions. (l) Accessibility nutrition labels: store declaration vs vendor criteria per feature (every common task completable). Voluntary until store requires. Evidence → `bkit-audit-accessibility`. Unused permission, missing deletion path, review-rule gap → plan from this report. **Done when:** `Readiness` row per item: met / finding / not applicable.
- [ ] **Step 11 — Age:** Both stores' age-rating questionnaires answered; re-answer when features change (messaging, UGC, AI chat, unrestricted web). Record store due date for new questions (e.g. Apple added bands due 2026-01-31 to keep submitting updates); unanswered past date = finding. Age assurance: owner decision in `docs/decisions.jsonl` when product holds children's data. Read both stores' jurisdiction lists (e.g. Texas SB 2420 for new Texas accounts from 2026-06-04 via declared-age-range API, significant-change API, server notification for revoked parental consent; Play age-signals API for eligible accounts). How child is known and consent given → `bkit-audit-privacy`. Target-audience declaration accurate; Play Families applicability recorded. Age-rating or age-assurance gap → owner; child safety → `bkit-audit-privacy`. **Done when:** `Age` row per questionnaire and jurisdiction: answered · matches the app · verdict.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per App Review Guidelines section and per Play policy area (User Data, Permissions, Families, Data safety, and the rest) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) All changes since previous report's commit touching native apps and listings (app config, build profiles, native permissions and config plugins, privacy manifest, entitlements, native SDK versions, store listing text, subscription and purchase flows, account deletion, over-the-air channels) → one-line verdict each. (b) Bounded ~30 min pass: senior mobile release manager flags no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Consoles untouched:** no build submitted, no listing or declaration edited, no agreement accepted, no credential created, rotated, or downloaded.
- [ ] **No secrets:** report contains no certificate, key, token, or password material.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Upload key lost and no store app signing, so the app can never be updated; a deadline already passed so no update can ship |
| `HIGH` | Deadline within 30 days; privacy declaration does not match the app or the privacy inventory; credential with no recovery path; personal data sent to a third-party AI without explicit in-app permission |
| `MEDIUM` | Unused permission; association file does not match the store build; over-the-air update can change reviewed behaviour; age questionnaire stale; listing out of date; agreement unaccepted |
| `LOW` | Listing wording within limits that does not use search words; nutrition-label gap while the labels are still voluntary; no listing experiment proposed |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: blocked release and credentials first, then declarations. A deadline within 30 days, a privacy declaration that does not match the app, a credential with no recovery path, and personal data sent to a third-party AI without explicit in-app permission are each at least `HIGH`. `Expected` names where it goes.

<!-- prettier-ignore -->
| Finding | Goes to |
| --- | --- |
| A deadline that needs an SDK or library upgrade | `bkit-audit-dependencies` |
| A declaration that does not match what the app collects | `bkit-audit-privacy` |
| Personal data sent to a third-party AI without in-app disclosure and permission | `bkit-audit-privacy`, and a plan item for the consent screen |
| A credential with no owner or no recovery path | `bkit-audit-security` |
| A crash or ANR cluster | `bkit-audit-logs` |
| Slow starts, hangs, wake locks, or battery drain | `bkit-audit-app-performance` |
| Review themes about how the app works | `bkit-audit-usability` |
| Native accessibility | `bkit-audit-accessibility` |
| An unused permission, a missing deletion path, or a review-rule gap | Plan from this report |
| A universal link or App Link that does not match a store build | Plan from this report |
| An over-the-air update that changes reviewed behaviour, or a runtime-version gap | Plan from this report |
| The in-app subscription decision | The owner, recorded in `docs/decisions.jsonl` |
| An age-rating answer or age-assurance gap | The owner, recorded in `docs/decisions.jsonl`; child safety → `bkit-audit-privacy` |
| An unaccepted agreement or a pending store declaration | The account holder, with the page |
| A listing that is out of date | The owner, with the screen or text to change |

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

### Store State

PENDING

### Deadlines

PENDING

### Declarations

PENDING

### Permissions

PENDING

### Credentials

PENDING

### Links

PENDING

### Live

PENDING

### Listing

PENDING

### Readiness

PENDING

### Age

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
- [ ] **Summary:** names count per severity, and per platform the store state and nearest deadline.
- [ ] **Series:** ratings and the listing conversion funnel beside previous report's, or marked baseline / not live.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
