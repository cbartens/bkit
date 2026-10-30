<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Analytics Audit

> [!CAUTION]
> **Purpose:** Product events — what is tracked, whether it fires, whether names and shapes match across clients, whether consent comes first, and whether any payload carries personal data.
>
> **Rules:**
>
> - Name the field and where it lives. Never copy a personal-data value into the report.
> - Use vendor consoles read-only.
> - NEVER publish a container, change a property or send a live collection hit.
> - Name the environment each container, property and capture ran against.

## Universal Instructions

### Context & Goals

Tracking decays quietly: an event renamed on one side only, funnel steps that stop firing after a refactor, tags that load before consent, and personal values in properties. Nothing errors, and the product still decides on the numbers. The code is the tracking plan as implemented. The failure this audit targets is a number the product trusts that the code no longer sends, or a payload that carries a person. What counts as personal, what consent requires and how far deletion must reach are `bkit-audit-privacy`'s rules. This audit applies them to payloads and consent mode.

**Applies when:** the product sends analytics events (an SDK, a tag snippet or a server collection call). **If** it sends none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass after a change to a core flow, and on the run that first finds product tracking (mark it baseline).

**Anchor Standards:**

- Product-analytics collection docs (e.g. GA4 developer guides, Analytics Help: collection/config limits, user-id, recommended events, Measurement Protocol, warehouse export). Record the date read.
- Tag-manager docs (e.g. GTM Help: workspaces, environments, preview, tag diagnostics). Record the date read.
- Tag-platform consent (e.g. Google Consent Mode v2 web/app; server-side tagging, first-party tag gateway). Record the consent-mode version and the date read.
- Native analytics SDK (e.g. Firebase Analytics). Record the SDK version in use.
- Vendor consent policy (e.g. Google EU user consent policy). Record the date read.
- Privacy regimes for tracking identifiers (e.g. GDPR, ePrivacy Directive; national use/disclosure/cross-border principles). Their interpretation goes to `bkit-audit-privacy`. Record the compilation where one applies.

### Scope

- Check whether product tracking exists, and any doc that claims it does.
- Compare the event list with the measurement plan.
- Check the collection wrapper, the data layer and the snippet load order.
- Check the tag-manager container: governance, environments and custom tags.
- Check names, shapes, reserved names, collection limits and parity across clients.
- Check the start and completion of each core flow, and double fires.
- Check payloads and consent mode against `bkit-audit-privacy`'s rules: consent before load or send, defaults and lifecycle, ad-id collection, personal data in payloads, URLs and titles, vendor redaction, and the analytics purge on account deletion.
- Check the user id across login, logout and clients.
- Compare what actually fires with the code.
- Check dashboards, data quality, alerts and annotations.
- Check property settings: retention, filters, referrals, key events, custom definitions, automatic collection and signals.
- Check server-sent events and the collection protocol.
- Check campaigns, attribution, and whether parameters survive auth redirects.
- Check integrations: search console, warehouse export, ads and native-app streams.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Lawful basis, retention periods, processor-list interpretation | The privacy sweep owns the rules; this audit applies them | `bkit-audit-privacy` |
| Error telemetry and crash reporting | They are not product analytics | `bkit-audit-logs` |
| Third-party scripts as an attack surface; container and property access review | The security sweep owns them | `bkit-audit-security` |
| Store privacy answers in depth, including advertising-id answers | The store sweep owns them | `bkit-audit-app-store` |
| Main-thread cost of tags | The performance sweep owns it; payloads and consent stay here | `bkit-audit-app-performance` |
| Rewriting a doc that describes tracking wrongly | The docs sweep owns it; naming the claim stays here | `bkit-audit-documentation` |
| Turning a check into a test or gate | The gates sweep owns it | `bkit-audit-gates` |
| Changing tracking code or analytics settings | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Web:** Step 18 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Request Capture:** **If** the code has product tracking → Step 12 — the browser network panel or a test-runner intercept (e.g., Playwright `page.route`, Cypress `intercept`). Fallback: read the code only, and record firing claims as hypotheses in `Not Checked`.
- [ ] **Tag Manager:** **If** a tag manager sits between the app and the vendor → Steps 5, 6, 10, 12 — the container export, preview and diagnostics (e.g., GTM JSON export, Tag Assistant). Fallback: read the code and network only, and mark the container diff `Not Checked`.
- [ ] **Analytics Admin:** **If** a hosted property exists → Steps 9, 11, 13, 14 — retention, filters, redaction and user deletion (e.g., GA4 Admin API, Firebase console, Amplitude settings). Fallback: none. Mark the settings `Not Checked`.
- [ ] **Native Debug:** **If** a native analytics SDK exists → Steps 10-12 — the debug view (e.g., Firebase DebugView). Fallback: `Not Checked`. Confirm that debug flags never ship in a release build.
- [ ] **Warehouse:** **If** an export is linked → Step 17 — row counts (e.g., BigQuery, Snowflake). Fallback: use vendor-UI counts only, and mark reconciliation `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** Find every analytics SDK, tag-manager snippet and event call on web, native and server: vendor packages, hosts and the wrapper. Error-tracker SDKs are not product analytics. Record the tools in `Checked`. **If** there are none:
  - Look for docs that claim tracking. A claim with no tracking behind it is a finding for `bkit-audit-documentation`.
  - Write `N/A`, and **STOP**.

  **Done when:** `Checked` holds the surfaces, or `N/A` is recorded → **STOP**.

- [ ] **Step 3 — Events:** List every event the code sends, with its name, its fire site and its property types. This list is the tracking plan as implemented. **If** there is no written intended plan → that is a finding (Step 4). **Done when:** `Events` lists every event and each change since the previous run, or the run is marked baseline.
- [ ] **Step 4 — Plan:** For each business question, record its owner and map it to named events, key events and custom dimensions. An event that answers no question wastes limits and is a finding. A question with no event is a gap. This is the intended plan that `Events` is compared with. **Done when:** `Plan` holds one row per question: owner · events · verdict against `Events`.
- [ ] **Step 5 — Data Layer:** Run this step only when a tag manager sits between the app and the vendor (e.g., GA4 through GTM). **If** there is none → skip with evidence. (a) Check that the app pushes to the data layer only through one typed wrapper, and that the tag manager picks the destinations. Direct vendor calls (e.g., `gtag(`), SDK calls inside components and pushes that bypass the wrapper are findings. (b) The data layer keeps keys across pushes, so they leak without a reset: check that the prior object is cleared before each commerce push (e.g., `ecommerce: null`). (c) Check for one page view per navigation: a router that does not do full page loads sends `page_view` either from history automatically **or** as a manual virtual page view, never both. Preview five routes, and expect five hits, each with a new location and title. (d) Check that the snippet loads once from the root layout, after the Step 10 consent defaults and only after consent is granted, and that each deploy loads the `Container` environment it should. **Done when:** `Data Layer` holds the five-route count, and each breach is a finding.
- [ ] **Step 6 — Container:** Run this step only when a tag manager is in use. **If** there is none → skip with evidence. (a) Export the live container JSON on each run, attach it (or commit it, if the owner chooses), and diff it against the previous export. (b) Check governance: one naming convention (e.g., `GA4 – Event – sign_up`) and folders; no unused or paused tags, triggers or variables; published versions that are named and have notes; one workspace per change set; and publish rights for named people only. (c) For each custom HTML tag or template, record its author, what it loads, its consent check and whether it needs `unsafe-inline` in the CSP. Script risk goes to `bkit-audit-security`. (d) Check that non-production deploys load a non-live snippet or none, never the live container. (e) Read diagnostics and coverage: untagged pages, silent tags and CSP blocks. (f) Check that the container and property sit on a company account, with least privilege and leavers removed. Access review goes to `bkit-audit-security`. **Done when:** `Container` holds the diff, governance, diagnostics and ownership, or the skip.
- [ ] **Step 7 — Names:** Check for one naming convention (e.g., `object_action`, in one case); the same event and properties on every client; no property that is always empty or always the same; consistent id types; and renames or versioned changes rather than silent reshapes. Prefer the vendor's recommended events (e.g., GA4 `sign_up`, `login`, `purchase`, `begin_checkout`, `share`, `generate_lead`). Check that no event uses a reserved name, and no parameter a reserved prefix (e.g., `_`, `firebase_`, `ga_`, `google_`, `gtag.`). Record the vendor's collection limits (name length, parameters per event, value length, distinct names). Vendors drop over-limit data silently, so check the longest name, the widest event and the longest values against them. **Done when:** `Events` holds the convention and the recorded limits, and each breach is a finding.
- [ ] **Step 8 — Coverage:** For each core flow, check that both the start and the completion are tracked, so drop-off can be measured; that conversions are defined; and that nothing fires twice (re-renders, strict mode, or client and server sending the same action). De-duplication goes to `Server Events`, and key events go to `Property`. **Done when:** `Events` holds each core flow's start and completion, and each double fire is a finding.
- [ ] **Step 9 — Consent:** Apply `bkit-audit-privacy`'s rules. (a) Check that no tag or SDK loads or sends before consent where consent is required. Check that the app asks for cross-app permission (e.g., iOS App Tracking Transparency) only when tracking crosses apps. (b) Native: check that the advertising id is off unless the app shows ads, with no ad-id module or framework and the vendor's ad-id flag false. The store answers must match; that goes to `bkit-audit-app-store`. (c) Check that no personal data (email, name, free text, precise location) appears in properties, URLs or titles. (d) Web streams: check that vendor redaction (e.g., GA4 data redaction) is on for email and for query parameters (auth codes, tokens, email), and test it in the redaction preview. Without it, auth and invite URLs leak through the location and referrer. Redaction skips some fields (e.g., GA4 skips `Server Events` and page titles), so check dynamic titles for names of people, households or items. A gap goes to `bkit-audit-privacy`. (e) Record the vendor's IP handling and retention. (f) Check that the vendor is on the processor list and in the privacy policy. The list goes to `bkit-audit-privacy`. (g) Check that account deletion removes the user's analytics through the vendor's user-deletion API, using the user id and the client or app instance id when known. A gap goes to `bkit-audit-privacy`. **Done when:** `Consent` holds one row per item: met / finding / not applicable.
- [ ] **Step 10 — Consent Mode:** Run this step only when the tag platform has a consent mode (e.g., Google tags). **If** there is none → skip with evidence. (a) Check that the signals (e.g., `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) default to denied before the snippet runs, and update on the user's choice. **If** defaults differ by region → record the regions, and check each. (b) Check for basic mode only: nothing loads or sends to the vendor before consent is granted. Use capture and preview: with no choice made, no request goes to a vendor host, and the same holds after a deny. Advanced mode (preloading, and cookieless pings while denied) is a finding, and so is any vendor request before consent. (c) Check that no vendor cookie is set before the choice, that deny or withdraw clears them or stops them, and that the choice survives a reload and is consistent across clients. Use the preview consent tab and a cookie-jar dump at each stage, recording names only, never identifying values. (d) Native: check that defaults are denied in the platform config, and that the native call matches the choice made in the web banner. (e) **If** ads or remarketing are linked → check that the consent-management platform integrates consent mode (prefer a vendor-certified one), and that `ad_user_data` gates sharing of the user id and enhanced conversions. A wrong default, signal or lifecycle step goes to `bkit-audit-privacy`. **Done when:** `Consent` holds the defaults, the no-choice capture and the lifecycle, or the skip.
- [ ] **Step 11 — Identity:** Check that login sets only an internal user id (never an email or other personal value), and only through the vendor's user-id mechanism (e.g., the GA4 `user_id` config parameter), never as an event parameter, user property or registered custom dimension. Check that it is sent on every page load while signed in. Check that logout sets it to null, not `""`, `" "` or `"null"`, and that a user who never signed in has no user id. Check that native mirrors login and logout. Check that one property stitches web and app (e.g., Blended or Observed identity), and that the household model is documented (e.g., as a low-cardinality user property). Never register a per-household or per-user id as a custom dimension. Verify sign-in, navigation and sign-out in preview (web) and the debug view (native), recording the user id's presence and shape, never its value. **If** the id is personal or survives logout → record a finding whose `Expected` routes it to a plan, and also to `bkit-audit-privacy` when personal data has left. **Done when:** `Identity` holds one row per stage: signed out · signed in · after logout · never signed in.
- [ ] **Step 12 — Firing:** Run each core flow (end-to-end or by hand), and compare the captured requests with `Events`. An event in code that never fires is dead tracking. An event that fires but is not in code is an auto-collection decision. A payload that does not match is a bug. On web, use the tag-manager preview and the network panel, and record for each flow the tags and consent state, the data layer at each push, and the outgoing hits. On native, use the debug view, and check that debug flags never ship in a release build. Check for one screen view per screen, with names or classes that match the web routes, and for the automatic events (e.g., `first_open`, `session_start`, Android `app_remove`). **Done when:** `Firing` holds one row per core flow: expected · captured · verdict.
- [ ] **Step 13 — Dashboards:** Check that vendor reports and conversions use events that exist, and that internal and test traffic is filtered out. On each run, record the share of unset pages and landing pages, the size of collapsed high-cardinality buckets, the unassigned channel and self-referrals, with the delta against the previous run. Check for an alert when a core-flow key event drops to zero between runs. Check that releases which change tracking are annotated. **If** a dashboard uses a dead event → record a finding whose `Expected` routes it to the owner, with the report and the event. **Done when:** `Dashboards` holds the quality shares, alerts and annotations.
- [ ] **Step 14 — Property:** Run this step only when there is a hosted property (e.g., GA4). Take a screenshot or an admin API dump for each setting, and name the property. (a) Check that retention is set deliberately (past the short default), along with reset-on-new-activity, against `bkit-audit-privacy`'s rules. (b) Check that internal and dev traffic filters are active (not in testing), that exclusions are permanent, and that app streams exclude CI, synthetic and test traffic at the source. (c) Check unwanted referrals: checkout, OAuth and auth hosts. Without them, sign-in and purchase credit is lost. (d) Check that each `Coverage` completion is a key event (and not a trivial one), that a counting method is chosen, and that the count is within the documented limit (record the limit). (e) Check that report parameters are registered as custom dimensions or metrics within limits, with no high-cardinality ids. (f) Check the automatic-collection toggles: form events cause noise in single-page apps, site-search parameter names must match, and download events may leak personal filenames. (g) Record the decision on signals and demographics, which risk thresholding. **If** thresholding hides core data → record that the fix is to turn them off or to use device identity. (h) Check granular location and device data, and user-provided data, per region. User-provided data stays off unless enhanced conversions are in use. (i) Check that the time zone and currency match the business, the session and engaged-session timers, and cross-domain tracking when the marketing domain differs from the app domain. **If** the vendor is not GA4 → check its equivalent settings, or skip. **If** a setting drifted and nobody decided it → record a finding whose `Expected` routes it to the owner, with the diff or screenshot. **Done when:** `Property` holds one row per setting: value · decided · verdict.
- [ ] **Step 15 — Server Events:** List the events sent through the server protocol (e.g., subscription lifecycle webhooks, inbound messages, job outcomes). Check that each reuses the client id (web) or the app instance id (native), and sends a session id only within the vendor's window. Validate them through the vendor's debug endpoint. Check that the API secret is in the secrets store and rotated. Check that no event has a client twin unless both share a dedup key (e.g., `transaction_id`), and that subscription revenue comes from the webhook, not from a client success page. Check that the server strips personal data, because vendor redaction does not apply here. Check for a documented decision on a first-party script and a same-origin path (e.g., `/metrics`) through the host or CDN, with stripping in a server container. No decision is a finding. **If** it is adopted → check the domain, the production instance count against vendor guidance, and the strip rules. **Done when:** `Server Events` holds one row per event: client id reused · deduped · personal data stripped · verdict.
- [ ] **Step 16 — Campaigns:** Check for a written UTM taxonomy: a fixed lowercase vocabulary for source and medium, and a campaign id that matches the vendor's channel groups. Check that internal links carry no UTMs, and that invite, reply and reset links do. Check that auth redirects keep the parameters (e.g., `utm_*`, `gclid`, `gbraid`, `wbraid`) through sign-up → confirm → callback → first landing, and test a tagged sign-up through to its first page view or sign-up hit. Record the attribution model, the key-event lookback windows and the custom channel groups, including an assistant-referrer group for `bkit-audit-aio-seo`. For installs, check the store referrer, campaign links, and that deferred invite deep links reach the first open. **If** parameters are lost or email links are untagged → record a finding whose `Expected` routes it to a plan, and names the flow. **Done when:** `Campaigns` holds one row per item: written · tested · verdict.
- [ ] **Step 17 — Integrations:** **If** public pages exist → check that Search Console is linked. **If** a warehouse export exists → check that it goes to the project's observability stack, daily (plus streaming if needed), for all streams. Record its region, expiry and cost, and compare the daily volume with the export limit (record the limit), because chronically exceeding it risks a pause. For one processed day, compare the vendor UI count with the warehouse rows (device id identity, matched time zone). A gap within the documented range (e.g., 2-5%) is fine; a larger one is a finding. Check ads linking with auto-tagging and enhanced conversions only when there is paid acquisition; otherwise record "not linked". Check that native projects are linked, plus store billing when the app has in-app purchases. **If** a link is missing → record a finding whose `Expected` routes it to the owner. **Done when:** `Integrations` holds one row per link: linked / not linked / not applicable.
- [ ] **Step 18 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per consent signal, collection or config limit, user-id rule, tag-manager governance rule and server-protocol requirement, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 19 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches tracking: events, the data-layer wrapper, the container, the property or streams, the consent banner or mode, native config, server events or auth redirects. (b) In a bounded pass of about 30 minutes, note what a senior analytics engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` output, new `docs/failures.jsonl` rows, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No values:** no personal-data value appears anywhere in the report.
- [ ] **No publish:** no container was published.
- [ ] **Property untouched:** no property setting changed.
- [ ] **No live hits:** no live collection hit was sent.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Personal data was already sent in an event, URL or title. A vendor request goes out before any consent choice, and there is no way to stop collection |
| `HIGH` | The consent default is not denied before the snippet. Advanced consent mode. A user id that is personal or survives logout. Account deletion leaves analytics data. Over-limit data dropped with no error. The live container on a non-production deploy |
| `MEDIUM` | A dead, duplicate or misshapen event. A mismatch between clients. No measurement plan. A key event missing or trivial. A filter left in testing. Campaign parameters stripped. A dashboard on a dead event |
| `LOW` | Naming drift that changes no report. A missing annotation. An unused paused tag |

Within a severity, list personal-data and consent findings first. Each of these is at least `HIGH`: personal data in an event, a tag that loads before consent, consent defaults that are not denied before the snippet, and a user id that is personal data. Each finding's `Expected` names where it goes, from this table.

<!-- prettier-ignore -->
| Finding | Goes to |
| --- | --- |
| Personal data in an event, tracking before consent, or consent mode in advanced mode | `bkit-audit-privacy`; `bkit-audit-security` if data already left |
| A consent-mode default, signal, or lifecycle step that is wrong | `bkit-audit-privacy` |
| A user id that is personal data, or that survives logout | Plan from this report; `bkit-audit-privacy` if personal data left |
| Account deletion that leaves analytics data behind | `bkit-audit-privacy` |
| A missing, dead, duplicated, or misshapen event | Plan from this report |
| A difference between clients | Plan from this report |
| Campaign parameters lost in a redirect, or untagged email links | Plan from this report |
| A dashboard that uses an event that no longer exists | The owner, with the report and the event |
| Property or container drift nobody decided | The owner, with the diff or screenshot |
| A missing integration link | The owner |
| A third-party script as a risk | `bkit-audit-security` |
| Container or property access and ownership gaps | `bkit-audit-security` |
| Advertising-id collection the store privacy answers do not match | `bkit-audit-app-store` |
| A doc that describes tracking wrongly | `bkit-audit-documentation` |
| A check that could become a test | `bkit-audit-gates` |

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

### Events

PENDING

### Plan

PENDING

### Data Layer

PENDING

### Container

PENDING

### Consent

PENDING

### Identity

PENDING

### Firing

PENDING

### Dashboards

PENDING

### Property

PENDING

### Server Events

PENDING

### Campaigns

PENDING

### Integrations

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
- [ ] **Summary:** `Summary` gives the count per severity, whether the audit applied, and the event-list change against the previous run (or baseline).
- [ ] **Series:** the `Dashboards` shares and the `Container` diff are shown beside the previous report's, or the run is marked baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
