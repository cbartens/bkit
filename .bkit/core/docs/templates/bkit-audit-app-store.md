<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# App Store Audit

> [!CAUTION]
> **Purpose:** Whether the iOS and Android apps can ship and stay listed: deadlines, privacy declarations, permissions, signing credentials and review readiness, and, once live, crashes, ratings and the listing.
>
> **Rules:**
>
> - NEVER submit a build, change a listing, accept an agreement, submit a declaration, or create, rotate or download a credential.
> - NEVER copy certificate, key, token or password material into the report.
> - Record a credential's expiry, holder and recovery path only.
> - Name the platform, and the account it was read from, in every store, deadline and credential claim.

## Universal Instructions

### Context & Goals

Stores change their rules on their own schedule. A new target API, a higher upload SDK, a privacy manifest or in-app account deletion arrives with a deadline. A missed deadline blocks the next release when it is needed, or hides the listing from new users. Nothing else watches the store side of the app. Native builds on a hosted builder, where one is used, can fail without raising an error-tracker issue. Review notices, policy notices and certificate expiry notices go by email to the account holder. The failure this audit targets is a release blocked, or a listing hidden, by a deadline, declaration or credential that nobody tracked.

**Applies when:** a native app is being prepared for a store, or is already listed. **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean". Before the first submission, the readiness steps still run. **If** the app is not yet listed → for each live-only step, write one `N/A` row with its evidence, and never report the surface as "clean". The steps name the Apple App Store and Google Play. **If** the app ships to another store (e.g., Amazon Appstore, Microsoft Store, Huawei AppGallery) → use that store's equivalent policy pages, or write `N/A` per step with its evidence.

**Cadence:** Run once a month. Run an extra pass after the yearly conference that sets upload minimums (e.g., Apple's June developer conference), and after the yearly target-API announcement (e.g., Google Play).

**Anchor Standards:**

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

- Read the store state, the accepted agreements and the pending declarations for each platform.
- Check the deadlines, and the guideline and policy changes since the previous run.
- Check the store privacy declarations in depth (the privacy manifest, the store privacy labels and the data-safety form), and match each one to `bkit-audit-privacy`'s inventory and privacy policy.
- Do not rebuild that inventory.
- Check the permissions, including restricted-permission declarations.
- Check the store and push signing credentials: expiry, holder and recovery path.
- Check universal links and App Links against the store build.
- **If** the app is live → check stability, store vitals, ratings, review prompts, releases, and whether the listing is true.
- Check the listing fields, localisation, screenshots and conversion.
- Check review readiness: the demo account, sign-in rules, how digital goods are sold, update-without-review limits, tablet, export compliance, trader status, the pre-launch report and accessibility nutrition labels.
- Check the age rating and age assurance.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| What the app collects; privacy-policy wording; how a child is known | The privacy audit owns the inventory. Declarations here are matched to it | `bkit-audit-privacy` |
| SDK or library upgrade a deadline forces | The dependency audit owns it | `bkit-audit-dependencies` |
| Crash and ANR clusters as log triage | The logs audit owns it. The rates stay here | `bkit-audit-logs` |
| Native accessibility beyond the nutrition-label comparison | The accessibility audit owns it | `bkit-audit-accessibility` |
| Expiry of credentials that are not store or push credentials | The config audit owns it | `bkit-audit-config` |
| Who should hold store access | The security audit owns it. The recovery path stays here | `bkit-audit-security` |
| Slow starts, hangs, wake locks, or battery drain as performance work | The performance audit owns it. The vital stays here | `bkit-audit-app-performance` |
| How the app works, from review themes | The usability audit owns it. The theme list stays here | `bkit-audit-usability` |
| Association-file hosting and DNS where the store build still matches | The config audit owns it | `bkit-audit-config` |
| Submitting a build, changing a listing, or touching a credential | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Build Config:** Steps 2-6, 10 — the app config and build profiles in the repo (e.g., `app.json`, `eas.json`, `project.pbxproj`). Fallback: none. Missing config is a finding.
- [ ] **Web:** Step 12 — fetch the anchor standards and the deadline pages. Fallback: record the versions and dates as unread.

#### Conditional

- [ ] **Build Service:** **If** native builds run on a hosted service → Steps 2, 3, 6 — the version and build number from the service, not the local config, and the last built artifact for native-library alignment (e.g., `eas build:list`, `eas build:view`). Fallback: use the local config only, and treat the remote version as a hypothesis.
- [ ] **Store Consoles:** **If** store accounts exist → Steps 2, 4, 8, 9, 11 — policy status, app content, agreements and listings (e.g., App Store Connect, Play Console). Fallback: use the repo only, and mark store state `Not Checked`.
- [ ] **Credential Metadata:** **If** signing material exists → Step 6 — expiry and holder from the build service or console, NEVER the material itself (e.g., `eas credentials`). Fallback: `Not Checked`.
- [ ] **Devices:** **If** the app has deep links, or a binary to open → Step 7 — a device or emulator with the app installed, and one without it. Fallback: use files and config only, and mark opening `Not Checked`.
- [ ] **Vitals:** **If** the app is live → Step 8 — store vitals and the error tracker (e.g., Play vitals, Xcode Organizer, Sentry, Crashlytics). Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Store State:** For each platform, record the version and build, the store state (not submitted, in review, live) and the accounts that can be read. **If** the config keeps the version remotely → read the version and build from the build service, not the local app config. Read the Android policy-status and app-content pages, and the iOS agreements page. An unaccepted updated agreement or a pending declaration blocks uploads, so each one is a finding for the account holder, with the page. **Done when:** `Store State` holds a table per platform with the version, build, target SDK, store state, accounts read and nearest deadline (filled in `Deadlines`).
- [ ] **Step 3 — Deadlines:** Confirm each date on the current store page. **If** the page differs → the page wins. (a) Compare the target API level and its date with the app's target SDK from the last built Android bundle, not from config only. (b) Memory page size: record the date and the target API the requirement names (e.g., updates targeting that API cannot ship unless native libraries support 16 KB pages). Check `.so` alignment in the last built bundle, not in config. Any app that ships native code is in scope. (c) Compare the upload minimum SDK and toolchain with the build image. (d) Check the native framework's SDK support window. (e) List the store policies announced since the previous run. (f) Diff the guidelines and policies since the previous report's date, and test the changes against the app, not only the deadlines. A requirement due within 90 days is a finding. One due within 30 days is at least `HIGH`. An upgrade fix goes to `bkit-audit-dependencies`. **Done when:** `Deadlines` holds one row per item, with the requirement, date, app value and verdict.
- [ ] **Step 4 — Declarations:** Match each declaration to `bkit-audit-privacy`'s inventory and privacy policy. Do not rebuild the inventory. (a) Check the iOS privacy manifest (required-reason APIs for the app and every third-party SDK) and the store privacy labels. (b) Check that each SDK on the vendor's commonly-used list ships its own privacy manifest and signature, and that the tracking-domain list names any tracking domain the app contacts. (c) Check the Android data-safety form. (d) Third-party AI: a review guideline requires disclosure where personal data is shared with third parties, including third-party AI, and explicit permission before sharing (e.g., App Review Guideline 5.1.2(i)). Check that the in-app consent screen, the stored consent flag that gates each call, the withdraw path and the privacy label describe the same flow. **If** there is a gap → it goes to `bkit-audit-privacy`, with a plan item for the consent screen. (e) Both stores require account deletion started inside the app, not only on the web. The Android form also requires a working web link, entered on the data-safety form, that names the app or developer and lets someone request deletion without reinstalling. **If** the app offers Sign in with Apple → deleting an account revokes its tokens through the revoke endpoint, and the server handles the server-to-server notifications for revoked consent and deleted accounts (e.g., Apple technote TN3194). (f) Check that the advertising-id and tracking answers match what `bkit-audit-analytics` found the app collects. A declaration mismatch is at least `HIGH`, and goes to `bkit-audit-privacy`. **Done when:** `Declarations` holds one row per label, manifest entry and form answer, with what is declared, the inventory and the verdict.
- [ ] **Step 5 — Permissions:** Check that each requested permission (e.g., camera, photos, location, contacts, notifications) has a true purpose string and a feature that uses it. A permission left over from a removed feature is a finding, because reviewers reject apps for it. On Android, compare the restricted permissions with store policy. Photos and videos go through the system photo picker. **If** broad media access is core to the app → the picker is not required, and broad media access needs an approved console declaration. Exact alarms are only for apps whose core is alarms, timers or calendars. Other apps use schedule-exact with user consent. The full-screen intent is allowed by default only for alarm and calling apps. Other apps need user consent and a console declaration. Request post-notifications at runtime when a notification makes sense, not at first launch. An unused permission goes to a plan made from this report. **Done when:** `Permissions` holds one row per permission, with its purpose string, feature and verdict.
- [ ] **Step 6 — Credentials:** Check the iOS distribution certificate and provisioning profiles, the push key, the Android upload key and store app signing, the build-service credentials and the developer-program membership. For each, record the expiry, the holder, and the recovery path if the holder leaves. **If** the upload key is lost **and** there is no store app signing → the app can never be updated, and the finding is `CRITICAL` until shown otherwise. Include the push-messaging service-account credential for the current HTTP API. Legacy server keys must be unused. Record the expiry, holder and recovery path only. Who should hold access goes to `bkit-audit-security`. Other expiries go to `bkit-audit-config`. A credential with no owner or no recovery path is at least `HIGH`. **Done when:** `Credentials` holds one row per item, with its expiry, holder, recovery and verdict.
- [ ] **Step 7 — Links:** **If** the native app has invite or deep links → check that the association files sit on the web domain over HTTPS with no redirect, cover the invite, join and email deep-link paths, and match the shipped apps: the iOS team and bundle id, and the Android SHA-256 fingerprints, including the store signing key's, not the upload key's only. Open an invite link on a device with the app and on one without it. Hosting or DNS drift where the store build still matches goes to `bkit-audit-config`. A file that does not match the store build is a finding, and goes to a plan made from this report. **Done when:** `Links` holds one row per file and per device case.
- [ ] **Step 8 — Live:** **If** the app is not listed → write `N/A` in `Live`, never "clean", and skip the rest of this step. (a) Read the crash-free sessions and the Android ANR rate from store vitals, Xcode Organizer and the error tracker. Compare the crash and ANR rates with both the overall and the per-device bad-behaviour thresholds, not the overall only. A cluster goes to `bkit-audit-logs`. (b) Check Android vitals beyond crashes: excessive partial wake locks (a core vital; record the vitals-page date) and slow cold and warm starts. (c) Check Xcode Organizer beyond crashes: hang rate, launch time, memory, disk writes and battery, per version. Slow starts, hangs, wake locks and battery go to `bkit-audit-app-performance`. (d) Record the rating, its change since the previous run, and recent review themes. Themes about how the app works go to `bkit-audit-usability`. (e) Check that review prompts use the store review API only, and are never incentivised or gated. Compare replies with the owner's response-rate target. (f) List the rejections since the previous run, and their reasons. (g) Check production: phased release and staged rollout, with a halt rule tied to crash-free sessions, and the active external test tracks. (h) Check that the screenshots are current, the description is true, and the support and privacy URLs work. An out-of-date listing goes to the owner, with the screen or text. **Done when:** `Live` holds the rates, the rating and each verdict, or `N/A`.
- [ ] **Step 9 — Listing:** **If** the app is not yet submitted → check the draft listing. **If** it is live → check the published listing. Check that the title, subtitle, keyword field, and short and full descriptions are within the store field limits and use search-oriented words. Check for localised listings in the shipped locales. Check for a screenshot set per required device size, and a tablet set if tablet is supported. **If** the app is live → read the conversion funnel (impressions, product-page views, installs) from both stores' acquisition reports, with its change since the previous run. Record listing experiments, and propose one quarterly test (screenshots or icon) to the owner. **Done when:** `Listing` holds one row per field and locale, with within limits, true and verdict.
- [ ] **Step 10 — Readiness:** (a) Check for a working demo account for reviewers, not the seeded owner. (b) **If** the iOS app offers any other third-party sign-in → it needs Sign in with Apple. (c) Check how digital subscriptions are sold in the app. Using an external processor instead of in-app purchase is limited by store and country rules. It is an owner decision in `docs/decisions.jsonl`, so match that record to the app's behaviour. (d) Check out-of-app purchase links against the same rules. (e) Check the subscription disclosures: terms, price and renewal shown before purchase, a manage and cancel path, and restore purchases if in-app purchase is used. **If** subscriptions run on an external processor only → account deletion explains cancellation. (f) **If** the app ships over-the-air updates (e.g., Expo Updates, CodePush) → they carry script and assets only, and never change the primary purpose or add a feature that skips review. The runtime-version policy prevents an incompatible binary from landing. A breach goes to a plan made from this report. **If** the app ships none → `N/A`. (g) **If** tablet is supported → check that layouts work on tablet for review. **Else** → check that tablet support is flagged false on purpose. (h) Check that the export-compliance flag is set, so uploads are not held. (i) Check trader status on both stores. Undeclared apps are removed from EU storefronts. (j) Check the current closed-test rule for a personal developer account (e.g., an account created after 2023-11-13 needs a closed test with >=12 testers opted in for 14 consecutive days before production). Check identity verification and package-name registration, and record the store-page date for removing unregistered packages (e.g., 2026-09-30). (k) Read the pre-launch report for the latest build: crashes, accessibility and security warnings, and the failed devices and OS versions. (l) Compare the accessibility nutrition labels in the store declaration with the vendor criteria per feature (every common task can be completed). They are voluntary until the store requires them. Evidence goes to `bkit-audit-accessibility`. An unused permission, a missing deletion path or a review-rule gap goes to a plan made from this report. **Done when:** `Readiness` holds one row per item: met / finding / not applicable.
- [ ] **Step 11 — Age:** Check that both stores' age-rating questionnaires are answered. **If** features changed (messaging, UGC, AI chat, unrestricted web) since they were answered → record a finding that the questionnaires need re-answering. Record the store's due date for new questions (e.g., Apple added bands due 2026-01-31 to keep submitting updates). A questionnaire left unanswered past that date is a finding. **If** the product holds children's data → age assurance is an owner decision in `docs/decisions.jsonl`. Read both stores' jurisdiction lists (e.g., Texas SB 2420 for new Texas accounts from 2026-06-04, through the declared-age-range API, the significant-change API and the server notification for revoked parental consent; the Play age-signals API for eligible accounts). How a child is known and consent is given goes to `bkit-audit-privacy`. Check that the target-audience declaration is accurate, and record whether Play Families applies. An age-rating or age-assurance gap goes to the owner. Child safety goes to `bkit-audit-privacy`. **Done when:** `Age` holds one row per questionnaire and jurisdiction, with answered, matches the app, and verdict.
- [ ] **Step 12 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per App Review Guidelines section and one per Play policy area (User Data, Permissions, Families, Data safety, and the rest), each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 13 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches native apps and listings: app config, build profiles, native permissions and config plugins, the privacy manifest, entitlements, native SDK versions, store listing text, subscription and purchase flows, account deletion, and over-the-air channels. (b) Spend a bounded pass of about 30 minutes on what a senior mobile release manager would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Consoles untouched:** no build was submitted, no listing or declaration edited, no agreement accepted, and no credential created, rotated or downloaded.
- [ ] **No secrets:** the report contains no certificate, key, token or password material.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | The upload key is lost and there is no store app signing, so the app can never be updated. A deadline has already passed, so no update can ship |
| `HIGH` | A deadline within 30 days. A privacy declaration that does not match the app or the privacy inventory. A credential with no recovery path. Personal data sent to a third-party AI without explicit in-app permission |
| `MEDIUM` | An unused permission. An association file that does not match the store build. An over-the-air update that can change reviewed behaviour. A stale age questionnaire. An out-of-date listing. An unaccepted agreement |
| `LOW` | Listing wording within limits that does not use search words. A nutrition-label gap while the labels are still voluntary. No listing experiment proposed |

Within a severity, list blocked releases and credentials first, then declarations. A deadline within 30 days, a privacy declaration that does not match the app, a credential with no recovery path, and personal data sent to a third-party AI without explicit in-app permission are each at least `HIGH`. `Expected` names where the finding goes.

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
| An unused permission, a missing deletion path, or a review-rule gap | A plan made from this report |
| A universal link or App Link that does not match a store build | A plan made from this report |
| An over-the-air update that changes reviewed behaviour, or a runtime-version gap | A plan made from this report |
| The in-app subscription decision | The owner, recorded in `docs/decisions.jsonl` |
| An age-rating answer or age-assurance gap | The owner, recorded in `docs/decisions.jsonl`. Child safety goes to `bkit-audit-privacy` |
| An unaccepted agreement or a pending store declaration | The account holder, with the page |
| A listing that is out of date | The owner, with the screen or text to change |

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, and for each platform the store state and nearest deadline.
- [ ] **Series:** the report shows ratings and the listing conversion funnel beside the previous report's, or marks the run as baseline or not live.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
