<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Analytics Audit

> [!CAUTION]
> **Purpose:** Product events — what is tracked, whether it fires, whether names and shapes match across clients, whether consent comes first, and whether any payload carries personal data.
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
> - Name the field and where it lives; NEVER copy a personal-data value into the report.
> - Vendor consoles are read-only: NEVER publish a container, change a property, or send a live collection hit.
> - Every container, property, and capture names the environment it ran against.

## Universal Instructions

### Context & Goals

Tracking decays quietly. An event is renamed in one place and not the other, a funnel step stops firing after a refactor, a tag loads before consent is answered, a personal value ends up in an event property. Nothing errors, and product decisions get made on the numbers anyway. The code holds the tracking plan as implemented. Target failure: **a number the product trusts that the code no longer sends, or a payload that carries a person.** What counts as personal, what needs consent, and what deletion must reach are `bkit-audit-privacy`'s rules; this audit applies them to payloads and consent mode.

**Applies when:** the product sends analytics events (SDK, tag snippet, or server collection call). None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass after a change to a core flow, and on the run that first finds product tracking (mark baseline).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Product-analytics collection docs (e.g. GA4 developer guides and Analytics Help: event collection limits, configuration limits, user-id, recommended events, Measurement Protocol, warehouse export). Living documents: record the date read.
- Tag-manager docs (e.g. Google Tag Manager Help: workspaces, environments, preview, tag diagnostics). Record the date read.
- Tag-platform consent (e.g. Google Consent Mode v2 for websites and for apps; server-side tagging and a first-party tag gateway). Record the consent-mode version and the date read.
- Native analytics SDK (e.g. Firebase Analytics). Record the SDK version in use.
- Vendor consent policy (e.g. Google's EU user consent policy). Record the date read.
- Privacy regimes that govern tracking identifiers (e.g. GDPR, ePrivacy Directive; national principles for use, disclosure, and cross-border disclosure). Interpretation → `bkit-audit-privacy`. Record compilation where the regime has one.

### Scope

- Whether product tracking exists, and any doc that claims it does.
- Event list against the measurement plan.
- Collection wrapper, data layer, and snippet load order.
- Tag-manager container: governance, environments, and custom tags.
- Names, shapes, reserved names, collection limits, and client parity.
- Core-flow start and completion; double fires.
- Analytics payloads and consent mode, under `bkit-audit-privacy`'s rules: consent before load or send, consent-mode defaults and lifecycle, advertising-id collection, personal data in payloads / URLs / titles, vendor redaction, and analytics data removed on account deletion.
- User id across login, logout, and clients.
- What actually fires against the code.
- Dashboards, data quality, alerts, and annotations.
- Property settings: retention, filters, referrals, key events, custom definitions, automatic collection, and signals.
- Server-sent events and the collection protocol.
- Campaigns, attribution, and auth-redirect survival.
- Integrations: search console, warehouse export, ads, and native-app streams.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Lawful basis, retention periods, processor-list interpretation | Privacy sweep owns the rules; this audit applies them | `bkit-audit-privacy` |
| Error telemetry and crash reporting | Not product analytics | `bkit-audit-logs` |
| Third-party scripts as an attack surface; container and property access review | Security sweep | `bkit-audit-security` |
| Store privacy answers in depth, including advertising-id answers | Store sweep | `bkit-audit-app-store` |
| Main-thread cost of tags | Performance sweep; payloads and consent stay here | `bkit-audit-app-performance` |
| Rewriting a doc that describes tracking wrongly | Docs sweep; naming the claim stays here | `bkit-audit-documentation` |
| Turning a check into a test or gate | Gates sweep | `bkit-audit-gates` |
| Changing tracking code or analytics settings | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Web:** Step 18 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Request Capture:** Product tracking in code → Step 12 — browser network panel or a test-runner intercept, e.g. Playwright `page.route`, Cypress `intercept`. Fallback: code only; firing claims = hypotheses in `Not Checked`.
- [ ] **Tag Manager:** A tag manager sits between app and vendor → Steps 5, 6, 10, 12 — container export, preview, and diagnostics, e.g. GTM JSON export, Tag Assistant. Fallback: code and network only; container diff `Not Checked`.
- [ ] **Analytics Admin:** A hosted property exists → Steps 9, 11, 13, 14 — retention, filters, redaction, and user-deletion, e.g. GA4 Admin API, Firebase console, Amplitude settings. Fallback: none; settings `Not Checked`.
- [ ] **Native Debug:** A native analytics SDK exists → Steps 10–12 — debug view, e.g. Firebase DebugView. Fallback: `Not Checked`. Confirm debug flags never ship in a release build.
- [ ] **Warehouse:** An export is linked → Step 17 — row counts, e.g. BigQuery, Snowflake. Fallback: vendor-UI counts only; reconciliation `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find every analytics SDK, tag-manager snippet, and event call, on web, native, and server. Search vendor package names, hosts, and the wrapper the code uses. Error-tracker SDKs are not product analytics. None → check docs that claim tracking; a claim the code does not meet = finding → `bkit-audit-documentation`; then `N/A` and STOP. Record tools available in `Checked`. **Done when:** surfaces in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Events:** Every event the code sends: name, where it fires, and properties with their types. That list is the tracking plan as implemented. No written intended plan = finding (the plan is Step 4). **Done when:** `Events` lists every event, and its change since the previous run, or marked baseline.
- [ ] **Step 4 — Plan:** Each business question analytics is meant to answer is written down with an owner, and maps to named events, key events, and custom dimensions. An event with no question spends collection limits and answers nothing = finding. A question with no event = a gap. This is the intended plan `Events` is compared with. **Done when:** `Plan` row per question: owner · events · verdict against `Events`.
- [ ] **Step 5 — Data Layer:** Tag manager between app and vendor (e.g. GA4 through GTM) → (a) App code only pushes to the data layer through one typed wrapper; the tag manager decides destinations. Direct vendor calls (e.g. `gtag(`), vendor SDK calls inside components, and pushes that bypass the wrapper = finding. (b) The data layer keeps keys from earlier pushes, so a value set for one event leaks into later ones unless reset. Each commerce push is preceded by one that clears the previous object (e.g. `ecommerce: null`). (c) One page view per navigation. A client router that does not full-load sends `page_view` from automatic history events or from a manual virtual page view, never both. In preview, navigate five routes and count: five page-view hits, each with the new location and title. (d) The snippet loads once, from the root layout, after the consent defaults in Step 10, and only once consent is granted. Each deploy environment loads the tag-manager environment `Container` expects. No tag manager → skip with evidence. **Done when:** `Data Layer` holds the five-route count and each breach = finding.
- [ ] **Step 6 — Container:** Tag manager in use → (a) Export the live container version as JSON each run, attach it to the report (or commit it where the owner says), and diff it against the previous run's export. (b) One naming convention for tags, triggers, and variables (e.g. `GA4 – Event – sign_up`), grouped in folders. No unused or paused tags, triggers, or variables. Every published version has a name and notes. One workspace per change set. Publish rights limited to named people. (c) Each custom HTML tag and custom template: who added it, what it loads, whether it has a consent check, and whether it needs `unsafe-inline` in the content-security policy. Script risk → `bkit-audit-security`. (d) Non-production deployments load a non-live environment's snippet, or none, and never the live container. (e) Tag diagnostics and tag coverage: untagged pages, tags that stopped sending, requests blocked by the content-security policy. (f) The container and the analytics property belong to a company account, not a person; access follows least privilege; people who have left are removed. Access review → `bkit-audit-security`. No tag manager → skip with evidence. **Done when:** `Container` holds the diff, governance, diagnostics, and ownership, or the skip.
- [ ] **Step 7 — Names:** One naming convention (e.g. `object_action`, one case). The same event with the same properties on every client. No property that is always empty or always the same. Ids typed the same way everywhere. A changed event renamed or versioned, not silently reshaped. Where the vendor publishes recommended events (e.g. GA4 `sign_up`, `login`, `purchase`, `begin_checkout`, `share`, `generate_lead`), use that name and its parameters rather than a custom one. No reserved event names, and no parameter or user-property names starting with a reserved prefix (e.g. `_`, `firebase_`, `ga_`, `google_`, `gtag.`). Read the vendor's collection-limits page and record the limits it states (name length, parameters per event, value length, and distinct event names). Over-limit data dropped without an error → check the longest name, the widest event, and the longest values. **Done when:** convention and recorded limits in `Events`; each breach = finding.
- [ ] **Step 8 — Coverage:** Each core flow sends a start event and a completion event, so the drop-off between them can be measured. Conversions are defined. Nothing fires twice: re-renders, strict mode, or a client event and a server event for the same action. Server de-duplication is `Server Events`; key events are `Property`. **Done when:** each core flow's start and completion are in `Events`; each double fire = finding.
- [ ] **Step 9 — Consent:** Apply `bkit-audit-privacy`'s rules. (a) No tag or SDK loads, and no event is sent, before consent where consent is required. Cross-app tracking permission (e.g. iOS App Tracking Transparency) only where tracking crosses apps. (b) On native, advertising-id collection is off unless the app shows ads: e.g. no advertising-id support module and no ad-support framework linked, and the vendor's ad-id flag false. That keeps the cross-app permission out of scope; the store privacy answers must say the same → `bkit-audit-app-store`. (c) No personal data in event properties, URLs, or page titles: emails, names, free text, and precise location. (d) On web streams, vendor redaction is on for email addresses and for a query-parameter list covering auth codes, tokens, and email. Without it, auth-callback, and invite URLs leak into page location and referrer. Test the list with the stream's redaction preview. Redaction does not cover the server protocol (`Server Events`) or page titles, so check dynamic titles separately: a person, household, or item name in a title goes straight into the title. Personal-data gap → `bkit-audit-privacy`. (e) The vendor's IP handling and retention settings. (f) The vendor is on the processor list and in the privacy policy; the list itself → `bkit-audit-privacy`. (g) Deleting an account deletes that user's analytics data too: the deletion path calls the vendor's user-deletion API for the user's id, and for the client id or app instance id where it is known. Gap → `bkit-audit-privacy`. **Done when:** `Consent` row per item: met / finding / not applicable.
- [ ] **Step 10 — Consent Mode:** Tag platform with a consent mode (e.g. Google tags) → (a) All consent signals (e.g. `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) default to denied before the tag-manager or vendor snippet runs, and update when the user chooses. Defaults that differ by region → record the regions and check each one. (b) Basic mode only. No vendor tag loads or sends a request before consent is granted. In the network capture and preview: load a page, make no choice, and confirm no request goes to a vendor host; then deny, and confirm the same. Advanced mode, where tags load before the choice and send cookieless pings while consent is denied, = finding. Any request to a vendor host before consent = finding. (c) Before any choice there are no vendor cookies. Denying keeps them absent. Withdrawing consent later stops collection and removes them. The choice survives a reload and is the same on every client. Verify with the preview consent tab and a dump of the cookie jar at each stage. Record cookie names, never values that identify a person. (d) Native consent defaults are denied in the platform config, and the native consent call applies the same choice the web banner records. (e) If ads or remarketing are linked, the banner is a consent platform that integrates with consent mode, preferably vendor-certified, and the ad-user-data signal gates any sharing of user ids or enhanced-conversion data. Wrong default, signal, or lifecycle step → `bkit-audit-privacy`. No consent mode → skip with evidence. **Done when:** `Consent` holds defaults, the no-choice capture, and the lifecycle, or the skip.
- [ ] **Step 11 — Identity:** On login, user id is set to the internal user id, never an email or anything else personal, as a configuration parameter, never as an event parameter, a user property, or a registered custom dimension. While signed in, it is sent on every page load, not only after the login event. On logout, it is set to null: not `""`, `" "`, or the string `"null"`. A visitor who never signed in sends no user id at all. Native sets the same value at login and clears it at logout. Web and app streams sit in one property whose reporting identity stitches a person across devices (e.g. Blended or Observed). How a household is modelled is decided and written down, e.g. a low-cardinality user property. Never register a per-household or per-user id as a custom dimension: high-cardinality values collapse. Verify by signing in, navigating, and signing out in preview (web) and debug view (native). Record whether each hit carries a user id, and its shape, never the value. Personal user id, or one that survives logout → plan from this report, and `bkit-audit-privacy` if personal data left. **Done when:** `Identity` row per stage: signed out · signed in · after logout · never signed in.
- [ ] **Step 12 — Firing:** Run each core flow, in an end-to-end test or by hand, and capture the analytics requests. Compare with `Events`. Events in the code that never fire are dead tracking. Events that fire but are not in the code come from automatic collection and need a decision. Payloads that differ from what the code builds are a bug. On web, use tag-manager preview alongside the network capture. Per core flow: which tags fired and their consent state, the data layer at each push, and the outgoing hits. On native, use the debug view; confirm the debug flags never ship in release builds. Each screen sends one screen view, with name and class following the web route naming, and the automatic events arrive (e.g. `first_open`, `session_start`, and on Android `app_remove`). **Done when:** `Firing` row per core flow: expected · captured · verdict.
- [ ] **Step 13 — Dashboards:** The reports and conversions defined in the vendor use events that exist. Internal and test traffic is filtered out. Record each run the share of unset page and landing-page rows, the size of the collapsed high-cardinality row, the unassigned channel, and self-referrals, with their change since the previous run. An alert fires when a core flow's key event drops to zero, so breakage shows between runs. Each release that changes tracking has an annotation, so a break in a trend is explained where people read it. A dashboard on an event that no longer exists → the owner, with the report and the event. **Done when:** `Dashboards` holds quality shares, alerts, and annotations.
- [ ] **Step 14 — Property:** Hosted product-analytics property (e.g. GA4) → capture each setting with a screenshot or an admin API dump, and name the property. (a) Data retention is set deliberately, long enough that explorations and funnels reach past the short default, with reset-on-new-activity decided. Check the choice against `bkit-audit-privacy`'s retention rules. (b) Internal-traffic and developer-traffic filters exist and are active, not testing. Exclusion filters are permanent, and IP rules cannot cover app streams, so CI, synthetic runs, and test accounts are kept out at source. (c) Unwanted referrals list payment-checkout hosts, OAuth providers, and the auth host. Otherwise sign-ins and purchases are credited to those hosts and the original campaign is lost. (d) Each core-flow completion from `Coverage` is a key event, nothing trivial is one, the counting method (once per event or once per session) is chosen, and the list fits the property's limit. Record the limit the docs state. (e) Every event parameter used in a report is registered as a custom dimension or metric, within the property's limits (record them), and none is a high-cardinality id. (f) Each automatic-collection toggle reviewed: form interactions are noisy on single-page apps; site-search parameter names match the app's; outbound clicks are fine; file downloads can put attachment filenames, which may be personal, into events. (g) Signals and demographics can make the vendor withhold report rows below its thresholds. Record the decision; keep signals off, or use device-based reporting identity, if thresholds hide core-flow data. (h) Granular location and device data, and user-provided data collection, are set deliberately per region; user-provided data is off unless enhanced conversions are in use. (i) Reporting time zone and currency match the business; session timeout and the engaged-session timer reviewed; cross-domain measurement configured if the marketing site and the app are on different domains. Other vendor → the same list in that vendor's settings, or skip with evidence. Drift nobody decided → the owner, with the diff or screenshot. **Done when:** `Property` row per setting: value · decided · verdict.
- [ ] **Step 15 — Server Events:** List the events the server sends through the vendor's server protocol (e.g. payment-webhook subscription start, renewal, cancellation, and refund; inbound message processed; background-job outcomes). Each reuses the client's client id (web) or app instance id (native), and includes session id only inside the vendor's session window. Payloads are validated against the vendor's debug endpoint. The API secret sits in the secrets store and is rotated. Each server event has no client twin, or the two share a de-duplication key (e.g. `transaction_id`). Subscription revenue comes from the payment webhook, never from the client's success page. Vendor redaction does not apply to server-protocol events, so the server strips personal data itself. Record a decision on first-party script serving and a same-origin collection path (e.g. `/metrics`) through the host or a CDN, with a server container stripping personal data before forwarding. No decision = finding. If adopted, check the custom domain, the production instance count against the vendor's server-side tagging guidance, and the rules that strip personal data. **Done when:** `Server Events` row per event: client id reused · deduped · personal data stripped · verdict.
- [ ] **Step 16 — Campaigns:** UTM taxonomy is written down: lowercase, a fixed vocabulary for source and medium that matches the vendor's default channel groups, and a campaign id. No UTMs on internal links. Links in invitations, inbound replies, and password resets carry UTMs. Otherwise invite-driven sign-ups land as direct and the invite loop cannot be measured. Auth redirects keep campaign parameters (e.g. `utm_*`, `gclid`, `gbraid`, `wbraid`) through sign-up, the email confirmation, the auth callback, and the first landing page. Redirect chains often strip them. Test by signing up through a tagged link and reading the first page view and the sign-up hit. Record the reporting attribution model, the key-event lookback windows, and any custom channel group, including an assistant-referrer channel. `bkit-audit-aio-seo` reads that channel. App installs: the store install referrer is captured, marketing uses store campaign links, and deferred deep links for invites carry the invite source into the first open. Lost parameters or untagged email links → plan from this report, naming the flow. **Done when:** `Campaigns` row per item: written · tested · verdict.
- [ ] **Step 17 — Integrations:** Search console is linked once public pages exist, so organic queries sit next to behaviour. Warehouse export is linked to the project observability already uses, with the daily export (and streaming if needed) and every stream included. Record the dataset region, table expiry, and cost. Check daily volume against the export limit on the vendor's export page; record the limit; a property that keeps exceeding it can have the export paused. For one fully processed day, compare the vendor UI's event count with the warehouse row count, with reporting identity temporarily set to device id and the time zones matching. Record the gap the vendor documents (e.g. 2–5%); more = finding. Link ads, with auto-tagging and enhanced conversions, only if paid acquisition exists; otherwise record "not linked". Native analytics projects are linked for the app streams, and the store's billing is linked if in-app purchase is used. A missing link → the owner. **Done when:** `Integrations` row per link: linked / not linked / not applicable.
- [ ] **Step 18 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per consent-mode signal, collection, or configuration limit, user-id rule, tag-manager governance practice, and server-protocol requirement → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 19 — Anything Else:** (a) Everything changed since previous report's commit touching tracking (event calls and the data-layer wrapper, the container version, property, and stream settings, the consent banner and consent-mode code, native analytics settings in the app config, server-sent events, and auth redirect routes) → one-line verdict each. (b) Bounded ~30 min pass: what a senior analytics engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, and vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No values:** no personal-data value anywhere in the report.
- [ ] **Consoles untouched:** no container published, no property setting changed, no live collection hit sent.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Personal data already sent in an event, URL, or title; vendor request before any consent choice and no way to stop collection |
| `HIGH` | Consent default not denied before the snippet; advanced consent mode; user id that is personal or survives logout; account deletion leaves analytics data; over-limit data dropped with no error; live container on a non-production deploy |
| `MEDIUM` | Dead, duplicate, or misshapen event; client mismatch; no measurement plan; key event missing or trivial; filter left in testing; campaign parameters stripped; dashboard on a dead event |
| `LOW` | Naming drift that changes no report; missing annotation; unused paused tag |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: personal data / consent first. Personal data in an event, a tag that loads before consent, consent defaults that are not denied before the snippet, and a user id that is personal data are each at least `HIGH`. `Expected` names where it goes.

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

Empty and clean → one row `None`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, whether the audit applied, and the event-list change vs the previous run (or baseline).
- [ ] **Series:** `Dashboards` shares and the `Container` diff beside previous report's, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
