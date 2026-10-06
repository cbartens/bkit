<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# App Store Audit

> [!CAUTION]
> **Purpose:** Whether the iOS and Android apps can ship and stay listed — deadlines, privacy declarations, permissions, signing credentials, review readiness, and, once live, crashes, ratings, and the listing.
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
> - NEVER submit a build, change a listing, accept an agreement, submit a declaration, or create, rotate, or download a credential.
> - NEVER copy certificate, key, token, or password material into the report; expiry, holder, and recovery path only.
> - Every store, deadline, and credential claim names the platform and the account it was read from.

## Universal Instructions

### Context & Goals

The stores change their rules on their own schedule. A newer target API, a higher upload SDK, a privacy manifest, or in-app account deletion arrives with a deadline. Miss one and the next release is blocked on the day it is needed, or an existing listing is hidden from new users. Nothing else watches this plane. Native builds run on a hosted builder, and a failed build can produce no error-tracker issue. Review, policy notices, and certificate expiry arrive by email to whoever holds the account. Target failure: **a release blocked, or a listing hidden, by a deadline, declaration, or credential nobody tracked.**

**Applies when:** a native app is being prepared for a store, or is already listed. None → one `N/A` row with evidence, never "clean". Before the first submission, readiness steps still run; live-only steps → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after the yearly conference that sets upload minimums (e.g. Apple's June developer conference) and after the yearly target-API announcement (e.g. Google Play).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Apple App Review Guidelines. Record the last-updated date.
- Apple upcoming requirements and Apple developer news. Record the newest item read.
- App Store Connect Help: App Privacy, age ratings, Accessibility Nutrition Labels, EU Digital Services Act trader requirements. Record the date read.
- Apple privacy manifest files, including required-reason APIs and the list of commonly used SDKs. Record the date read.
- Google Play Developer Program Policy: User Data, Permissions, Families, and Data safety. Record the date read and the newest policy-update announcement.
- Play target API level requirement and 16 KB page-size requirement. Record the required level and each date.
- Android vitals. Record the core vitals and their thresholds.
- Native framework and build-service docs (e.g. Expo and EAS). Record the SDK version in use and its support window.
- Age-assurance rules as the stores apply them (e.g. Apple's Texas SB 2420 update, Google Play Age Signals API). Record the jurisdictions in force on the run date.

### Scope

- Store state, accepted agreements, and pending declarations, per platform.
- Deadlines, and the guideline and policy diff since the previous run.
- Store privacy declarations in depth — privacy manifest, store privacy labels, data-safety form — each matched to `bkit-audit-privacy`'s inventory and to the privacy policy. This audit does not rebuild that inventory.
- Permissions, including restricted-permission declarations.
- Store and push signing credentials: expiry, holder, and recovery path.
- Universal links and App Links against the store build.
- Once live: stability, store vitals, ratings, review prompts, releases, and whether the listing is true.
- Listing fields, localisation, screenshots, and conversion.
- Review readiness: demo account, sign-in rules, how digital goods are sold, update-without-review limits, tablet, export compliance, trader status, pre-launch report, and accessibility nutrition labels.
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

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Build Config:** Steps 2–6, 10 — app config and build profiles in the repo, e.g. `app.json`, `eas.json`, `project.pbxproj`. Fallback: none; missing config = finding.
- [ ] **Web:** Step 12 — fetch anchor standards and deadline pages. Fallback: versions and dates recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Build Service:** Hosted native builds → Steps 2, 3, 6 — version and build number from the service, not the local config; last built artifact for native-library alignment, e.g. `eas build:list`, `eas build:view`. Fallback: local config only; remote version = hypothesis.
- [ ] **Store Consoles:** Store accounts exist → Steps 2, 4, 8, 9, 11 — policy status, app content, agreements, and listings, e.g. App Store Connect, Play Console. Fallback: repo only; store state `Not Checked`.
- [ ] **Credential Metadata:** Signing material exists → Step 6 — expiry and holder from the build service or console, never the material, e.g. `eas credentials`. Fallback: `Not Checked`.
- [ ] **Devices:** Deep links or a binary to open → Step 7 — a device or emulator with the app installed and one without. Fallback: file and config only; opening `Not Checked`.
- [ ] **Vitals:** App is live → Step 8 — store vitals and the error tracker, e.g. Play vitals, Xcode Organizer, Sentry, Crashlytics. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Store State:** Per platform: app version and build number from the build service when the config keeps version remotely, not from the local app config; store state (not submitted, in review, live); which accounts were readable. Read the Android policy-status and app-content pages, and the iOS agreements page. An updated agreement nobody has accepted, or a pending declaration, blocks uploads = finding → the account holder, with the page. **Done when:** `Store State` table per platform: version · build · target SDK · store state · accounts read · nearest deadline (filled in `Deadlines`).
- [ ] **Step 3 — Deadlines:** Confirm each date on the current store page; the page wins if it differs. (a) Target API level and its date, against the app's target SDK, read from the last built Android bundle, not only the config. (b) Memory page size: record the date and the target API the requirement names (e.g. updates targeting that API cannot ship unless native libraries support 16 KB pages). Check `.so` alignment in the last built bundle, not the config. Any app that ships native code is in scope. (c) The upload minimum SDK and toolchain, against the build image. (d) The native framework SDK's support window. (e) Any store policy announced since the previous run. (f) The guideline and policy diff since the previous report's date, tested against the app, not only for a deadline. Anything due within 90 days = finding. Due within 30 days = at least `HIGH`. An upgrade fix → `bkit-audit-dependencies`. **Done when:** `Deadlines` row per item: requirement · date · app value · verdict.
- [ ] **Step 4 — Declarations:** Match each declaration to `bkit-audit-privacy`'s inventory and to the privacy policy. Do not rebuild the inventory. (a) iOS privacy manifest, including required-reason APIs of the app and of every third-party SDK, and the store privacy labels. (b) Each SDK on the vendor's commonly-used list ships its own privacy manifest and signature, and the tracking-domain list names any tracking domain the app contacts. (c) Android data-safety form. (d) Third-party AI: the review guideline that requires disclosing where personal data is shared with third parties, including third-party AI, and explicit permission before sharing (e.g. App Review Guideline 5.1.2(i)). The in-app consent screen, the stored consent flag that gates each call, the way to withdraw, and the privacy label describe the same flow. Gap → `bkit-audit-privacy`, and a plan item for the consent screen. (e) Both stores require account deletion started inside the app, not only on the web. The Android form also requires a working web link, entered on the data-safety form, that names the app or developer and lets someone request deletion without reinstalling. Deleting an account revokes Sign in with Apple tokens through the revoke endpoint, and the server handles the server-to-server notifications for revoked consent and deleted accounts (e.g. Apple technote TN3194), when that provider exists. (f) Advertising-id and tracking answers match what `bkit-audit-analytics` found the app collects. A declaration that does not match the app = at least `HIGH` → `bkit-audit-privacy`. **Done when:** `Declarations` row per label, manifest entry, and form answer: declared · inventory · verdict.
- [ ] **Step 5 — Permissions:** Each permission the app requests (e.g. camera, photos, location, contacts, and notifications) has a purpose string that is true and a feature that uses it. A permission left over from a removed feature = finding: reviewers reject apps for it. On Android, also check restricted permissions against store policy. Photos and videos come through the system photo picker unless broad media access is core; broad media permissions need an approved console declaration. Exact-alarm permission is only for apps whose core function is alarms, timers, or calendars; others use the schedule-exact permission with the user's consent. Full-screen intent is granted by default only to alarm and calling apps; others need the user's consent and a console declaration. Post-notifications is requested at runtime, at the moment a notification makes sense, not on first launch. Unused permission → plan from this report. **Done when:** `Permissions` row per permission: purpose string · feature · verdict.
- [ ] **Step 6 — Credentials:** The iOS distribution certificate and provisioning profiles, the push key, the Android upload key and store app signing, the build-service credentials, and the developer-program membership: each one's expiry date, who holds it, and how it would be recovered if that person left. A lost upload key with no store app signing means the app can never be updated = `CRITICAL` until shown otherwise. Include the push-messaging service-account credential for the current HTTP API; legacy server keys must be unused. Record expiry, holder, and recovery path only. Who should hold access → `bkit-audit-security`. Expiry of anything else → `bkit-audit-config`. No owner or no recovery path = at least `HIGH`. **Done when:** `Credentials` row per item: expiry · holder · recovery · verdict.
- [ ] **Step 7 — Links:** Native app with invite or deep links → the association files are served from the web domain over HTTPS, without a redirect, cover the invite, join, and email deep-link paths, and match the shipped apps: the iOS team and bundle id, and the Android SHA-256 fingerprints, including the store signing key's, not only the upload key's. Open an invite link on a device with the app installed and on one without. Hosting or DNS drift where the store build still matches → `bkit-audit-config`. A file that does not match a store build = finding → plan from this report. **Done when:** `Links` row per file and per device case.
- [ ] **Step 8 — Live:** Not listed → `N/A` in `Live`, never "clean", and skip the rest of this step. (a) Crash-free sessions and, on Android, the ANR rate, from store vitals, Xcode Organizer, and the error tracker. Compare crash and ANR rates with both the overall and the per-device bad-behaviour thresholds, not only the overall rate. A cluster → `bkit-audit-logs`. (b) Android vitals beyond crashes: excessive partial wake locks (a core vital that can reduce store visibility; record the date the vitals page gives) and slow cold and warm starts. (c) Xcode Organizer beyond crashes: hang rate, launch time, memory, disk writes, and battery, per version. Slow starts, hangs, wake locks, or battery → `bkit-audit-app-performance`. (d) Rating and its change since the previous run, and the themes in recent reviews. Themes about how the app works → `bkit-audit-usability`. (e) Review prompts only through the store's review API, never incentivised or gated. Replies to reviews happen, against a response-rate target the owner sets. (f) Rejections since the previous run and their reasons. (g) Production releases use phased release and staged rollout, with a halt rule tied to crash-free sessions; external test tracks stay active. (h) Screenshots show the current app, the description is true, and support and privacy URLs work. A listing that is out of date → the owner, with the screen or text. **Done when:** `Live` holds the rates, the rating, and each verdict, or `N/A`.
- [ ] **Step 9 — Listing:** Before the first submission, check the draft listing; once live, the published one. Title, subtitle, keyword field, short description, and full description: each within the store's current field limits, and using the words people search for. Localised listings for the locales the app ships in. Screenshot sets for each device size the store currently requires, and tablet screenshots if the app supports tablet. Once live, the conversion funnel (impressions, product-page views, and installs) from both stores' acquisition reports, with its change since the previous run. Record which listing experiments are in use. Propose one test a quarter, on screenshots or the icon, to the owner. **Done when:** `Listing` row per field and per locale: within limits · true · verdict.
- [ ] **Step 10 — Readiness:** (a) A demo account for reviewers that works, and is not the seeded owner. (b) Sign in with Apple, if any other third-party sign-in is offered on iOS. (c) How digital subscriptions are sold inside the app. Selling them with an external processor instead of in-app purchase is limited by rules that differ by store and by country. That is an owner decision and must be recorded in `docs/decisions.jsonl`; check what is recorded against what the app does. (d) Links out of the app to purchase pages, against the same rules. (e) Subscription disclosures: terms, price, and renewal period shown before purchase; a way to manage and cancel; restore purchases if in-app purchase is used. If subscriptions are external-processor only, account deletion tells the user how that subscription is cancelled. (f) Over-the-air updates ship script and assets only, never a change to the app's primary purpose or a feature that skips review. The runtime-version policy ensures an update never lands on a binary it is incompatible with. A breach → plan from this report. (g) If tablet is supported, reviewers test on tablet, so the layouts work there; otherwise the flag is false on purpose. (h) The export-compliance flag is set, so uploads are not held on the question. (i) Trader status is declared on both stores. Undeclared apps are removed from EU storefronts. (j) Confirm the current closed-test rule for a personal developer account (e.g. an account created after 2023-11-13 needs a closed test with at least 12 testers opted in for 14 days in a row before production access). Check identity verification and package-name registration; record the date the store page gives for removal of unregistered package names (e.g. 2026-09-30). (k) The pre-launch report for the latest build: crashes, accessibility, and security warnings, and the devices and OS versions that failed. (l) Accessibility nutrition labels: what the store declares, against the vendor's criteria for each feature (every common task can be completed with it). Voluntary until the store says required. Evidence → `bkit-audit-accessibility`. Unused permission, missing deletion path, or review-rule gap → plan from this report. **Done when:** `Readiness` row per item: met / finding / not applicable.
- [ ] **Step 11 — Age:** Age-rating questionnaires on both stores are answered, and re-answered when features change (messaging, user-generated content, AI chat, unrestricted web access). Record the due date the store published for any new questions (e.g. Apple's added bands were due 2026-01-31 to keep submitting updates); unanswered past that date = finding. Age assurance is an owner decision, recorded in `docs/decisions.jsonl`, when the product holds children's data. Read both stores' current jurisdiction lists (e.g. Texas SB 2420 for new Texas accounts from 2026-06-04, via the declared-age-range API, the significant-change API, and the server notification for revoked parental consent; the Play age-signals API for eligible accounts). How a child is known, and how consent is given → `bkit-audit-privacy`. The target-audience declaration is accurate, and whether Play's Families policy applies is recorded. Age-rating or age-assurance gap → the owner; child safety also → `bkit-audit-privacy`. **Done when:** `Age` row per questionnaire and per jurisdiction: answered · matches the app · verdict.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per App Review Guidelines section and per Play policy area (User Data, Permissions, Families, Data safety, and the rest) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching the native apps and their listings (app config, build profiles, native permissions and config plugins, the privacy manifest, entitlements, native SDK versions, store listing text, subscription, and purchase flows, account deletion, and over-the-air channels) → one-line verdict each. (b) Bounded ~30 min pass: what a senior mobile release manager flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, and vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, and per platform the store state and nearest deadline.
- [ ] **Series:** ratings and the listing conversion funnel beside previous report's, or marked baseline / not live.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
