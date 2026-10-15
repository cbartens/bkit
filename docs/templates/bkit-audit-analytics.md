<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.1 — do not edit; run `bkit upgrade` to refresh -->

# Analytics Audit

> [!CAUTION]
> **Purpose:** Product events — what is tracked, whether it fires, whether names and shapes match across clients, whether consent comes first, and whether any payload carries personal data.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Name the field and where it lives; never copy a personal-data value into the report.
> - Vendor consoles are read-only: NEVER publish a container, change a property, or send a live collection hit.
> - Every container, property, and capture names the environment it ran against.

## Universal Instructions

### Context & Goals

Tracking decays quietly: one-sided renames, funnel steps that stop after refactors, tags before consent, personal values in properties. Nothing errors; product still decides on the numbers. Code = tracking plan as implemented. Target failure: **a number the product trusts that the code no longer sends, or a payload that carries a person.** Personal scope, consent requirements, deletion reach → `bkit-audit-privacy`'s rules; this audit applies them to payloads and consent mode.

**Applies when:** the product sends analytics events (SDK, tag snippet, or server collection call). None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass after a change to a core flow, and on the run that first finds product tracking (mark baseline).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Product-analytics collection docs (e.g. GA4 developer guides, Analytics Help: collection/config limits, user-id, recommended events, Measurement Protocol, warehouse export). Record date read.
- Tag-manager docs (e.g. GTM Help: workspaces, environments, preview, tag diagnostics). Record date read.
- Tag-platform consent (e.g. Google Consent Mode v2 web/app; server-side tagging, first-party tag gateway). Record consent-mode version + date read.
- Native analytics SDK (e.g. Firebase Analytics). Record SDK version in use.
- Vendor consent policy (e.g. Google EU user consent policy). Record date read.
- Privacy regimes for tracking identifiers (e.g. GDPR, ePrivacy Directive; national use/disclosure/cross-border principles). Interpretation → `bkit-audit-privacy`. Record compilation where applicable.

### Scope

- Whether product tracking exists, and any doc that claims it does.
- Event list against the measurement plan.
- Collection wrapper, data layer, and snippet load order.
- Tag-manager container: governance, environments, and custom tags.
- Names, shapes, reserved names, collection limits, and client parity.
- Core-flow start and completion; double fires.
- Payloads + consent mode (`bkit-audit-privacy` rules): consent before load/send, defaults/lifecycle, ad-id collection, personal data in payloads/URLs/titles, vendor redaction, analytics purge on account deletion.
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

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

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

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find every analytics SDK, tag-manager snippet, and event call on web, native, and server — vendor packages, hosts, wrapper. Error-tracker SDKs are not product analytics. None → docs claiming tracking; unmet claim = finding → `bkit-audit-documentation`; then `N/A` and STOP. Record tools in `Checked`. **Done when:** surfaces in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Events:** Every code-sent event: name, fire site, property types = tracking plan as implemented. No written intended plan = finding (Step 4). **Done when:** `Events` lists every event and change since the previous run, or marked baseline.
- [ ] **Step 4 — Plan:** Each business question: owner + map to named events, key events, custom dimensions. Event without question wastes limits = finding; question without event = gap. Intended plan `Events` compares to. **Done when:** `Plan` row per question: owner · events · verdict against `Events`.
- [ ] **Step 5 — Data Layer:** Tag manager between app and vendor (e.g. GA4 through GTM) → (a) Push to data layer only via one typed wrapper; tag manager picks destinations. Direct vendor calls (e.g. `gtag(`), in-component SDK calls, bypass pushes = finding. (b) Layer retains keys across pushes → leak without reset; clear prior object before each commerce push (e.g. `ecommerce: null`). (c) One page view per navigation: non-full-load router sends `page_view` from history auto **or** manual virtual, never both; preview five routes → five hits with new location/title. (d) Snippet once from root layout, after Step 10 consent defaults, only after grant; each deploy loads `Container` environment expected. No tag manager → skip with evidence. **Done when:** `Data Layer` holds the five-route count and each breach = finding.
- [ ] **Step 6 — Container:** Tag manager in use → (a) Export live container JSON each run → attach (or commit per owner) → diff vs previous export. (b) One naming convention (e.g. `GA4 – Event – sign_up`), folders; no unused/paused tags, triggers, variables; named published versions + notes; one workspace per change set; publish rights to named people only. (c) Each custom HTML/template: author, loads what, consent check, `unsafe-inline` CSP need; script risk → `bkit-audit-security`. (d) Non-prod: non-live snippet or none, never live container. (e) Diagnostics + coverage: untagged pages, silent tags, CSP blocks. (f) Container + property on company account; least privilege; leavers removed; access → `bkit-audit-security`. No tag manager → skip with evidence. **Done when:** `Container` holds the diff, governance, diagnostics, and ownership, or the skip.
- [ ] **Step 7 — Names:** One convention (e.g. `object_action`, one case); same event + properties every client; no always-empty/same properties; consistent id types; rename/version changes, not silent reshapes. Prefer vendor recommended events (e.g. GA4 `sign_up`, `login`, `purchase`, `begin_checkout`, `share`, `generate_lead`). No reserved events or reserved-prefix params (e.g. `_`, `firebase_`, `ga_`, `google_`, `gtag.`). Record vendor collection limits (name length, params/event, value length, distinct names); silent over-limit drop → check longest name, widest event, longest values. **Done when:** convention and recorded limits in `Events`; each breach = finding.
- [ ] **Step 8 — Coverage:** Each core flow: start + completion for drop-off; conversions defined; no double fires (re-renders, strict mode, client + server same action). De-duplication → `Server Events`; key events → `Property`. **Done when:** each core flow's start and completion are in `Events`; each double fire = finding.
- [ ] **Step 9 — Consent:** Apply `bkit-audit-privacy`'s rules. (a) No tag/SDK load or send before consent where required; cross-app permission (e.g. iOS App Tracking Transparency) only when tracking crosses apps. (b) Native: advertising-id off unless app shows ads — no ad-id module/framework, vendor ad-id flag false; store answers must match → `bkit-audit-app-store`. (c) No personal data in properties, URLs, titles (email, name, free text, precise location). (d) Web streams: vendor redaction (e.g. GA4 data redaction) on for email + query params (auth codes, tokens, email); test redaction preview; without it auth/invite URLs leak location/referrer. Fields redaction skips (e.g. GA4: `Server Events` + page titles) → check dynamic titles (person/household/item names). Gap → `bkit-audit-privacy`. (e) Vendor IP handling + retention. (f) Vendor on processor list + privacy policy; list → `bkit-audit-privacy`. (g) Account deletion removes user analytics via vendor user-deletion API (user id + client/app instance id when known). Gap → `bkit-audit-privacy`. **Done when:** `Consent` row per item: met / finding / not applicable.
- [ ] **Step 10 — Consent Mode:** Consent-mode tag platform (e.g. Google tags) → (a) Signals (e.g. `analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`) default denied before snippet runs; update on choice; regional defaults → record regions, check each. (b) Basic mode only: no vendor load/send before grant. Capture + preview: no choice → no vendor host request; deny → same. Advanced mode (preload + cookieless pings while denied) = finding; any pre-consent vendor request = finding. (c) No vendor cookies pre-choice; deny/withdraw clears/stops; choice survives reload, consistent across clients — preview consent tab + cookie jar dump per stage; names only, never identifying values. (d) Native defaults denied in platform config; native call matches web banner choice. (e) Ads/remarketing linked → CMP integrates consent mode (prefer vendor-certified); `ad_user_data` gates user-id/enhanced-conversion sharing. Wrong default/signal/lifecycle → `bkit-audit-privacy`. No consent mode → skip with evidence. **Done when:** `Consent` holds defaults, the no-choice capture, and the lifecycle, or the skip.
- [ ] **Step 11 — Identity:** Login → internal user id only (never email/personal), via vendor's user-id mechanism only (e.g. GA4 `user_id` config parameter) — never event param, user property, or registered custom dimension; sent every page load while signed in. Logout → null, not `""`, `" "`, or `"null"`; never-signed-in → no user id. Native mirrors login/logout. One property stitches web+app (e.g. Blended/Observed); household model documented (e.g. low-cardinality user property). Never register per-household/per-user id as custom dimension. Verify sign-in/nav/sign-out in preview (web) + debug view (native); record user-id presence/shape, never value. Personal id or post-logout survival → plan from this report + `bkit-audit-privacy` if personal data left. **Done when:** `Identity` row per stage: signed out · signed in · after logout · never signed in.
- [ ] **Step 12 — Firing:** Run each core flow (E2E or manual) → capture requests vs `Events`. Events in code that never fire = dead tracking; fire-not-in-code = auto-collection decision; payload mismatch = bug. Web: tag-manager preview + network. Per flow: tags + consent state, data layer per push, outgoing hits. Native: debug view; debug flags never in release. One screen view per screen (name/class match web routes) + auto events (e.g. `first_open`, `session_start`, Android `app_remove`). **Done when:** `Firing` row per core flow: expected · captured · verdict.
- [ ] **Step 13 — Dashboards:** Vendor reports/conversions use existing events; internal/test filtered. Each run: unset page/landing shares, collapsed high-cardinality size, unassigned channel, self-referrals + delta vs previous run. Alert on core-flow key event → zero between runs. Tracking-changing releases annotated. Dashboard on dead event → owner with report + event. **Done when:** `Dashboards` holds quality shares, alerts, and annotations.
- [ ] **Step 14 — Property:** Hosted property (e.g. GA4) → screenshot or admin API dump per setting; name property. (a) Deliberate retention (past short default) + reset-on-new-activity vs `bkit-audit-privacy` rules. (b) Internal/dev traffic filters active (not testing); permanent exclusions; app streams exclude at source (CI/synthetic/test). (c) Unwanted referrals: checkout, OAuth, auth hosts — else sign-in/purchase credit lost. (d) Each `Coverage` completion = key event (non-trivial); counting method chosen; within doc limit (record limit). (e) Report params registered as custom dims/metrics within limits; no high-cardinality ids. (f) Auto-collection toggles: SPA form noise; site-search param names; downloads may leak filenames (personal). (g) Signals/demographics threshold risk — record decision; off or device identity if core data hidden. (h) Granular location/device + user-provided data per region; user-provided off unless enhanced conversions. (i) TZ/currency match business; session/engaged timers; cross-domain if marketing ≠ app domain. Other vendor → equivalent settings or skip. Undecided drift → owner + diff/screenshot. **Done when:** `Property` row per setting: value · decided · verdict.
- [ ] **Step 15 — Server Events:** List server-protocol sends (e.g. webhook subscription lifecycle, inbound message, job outcomes). Reuse client id (web) or app instance id (native); session id only in vendor window. Validate via vendor debug endpoint; API secret in secrets store, rotated. No client twin or shared dedup key (e.g. `transaction_id`); subscription revenue from webhook, not client success page. Server strips personal data (redaction N/A). Document first-party script + same-origin path (e.g. `/metrics`) via host/CDN + server container strip; no decision = finding; if adopted check domain, prod instance count vs vendor guidance, strip rules. **Done when:** `Server Events` row per event: client id reused · deduped · personal data stripped · verdict.
- [ ] **Step 16 — Campaigns:** Written UTM taxonomy: lowercase fixed source/medium vocabulary + campaign id matching vendor channel groups; no internal UTMs; invite/reply/reset links carry UTMs. Auth redirects preserve params (e.g. `utm_*`, `gclid`, `gbraid`, `wbraid`) through sign-up → confirm → callback → first landing; test tagged sign-up + first page view/sign-up hit. Record attribution model, key-event lookbacks, custom channel groups (incl. assistant-referrer for `bkit-audit-aio-seo`). Installs: store referrer, campaign links, deferred invite deep links → first open. Lost params/untagged email → plan, name flow. **Done when:** `Campaigns` row per item: written · tested · verdict.
- [ ] **Step 17 — Integrations:** Search Console when public pages exist. Warehouse export → project observability stack, daily (+ streaming if needed), all streams; record region/expiry/cost; daily volume vs export limit (record limit; chronic exceed → pause risk). One processed day: vendor UI count vs warehouse rows (device id identity, matched TZ); doc gap (e.g. 2–5%) OK, more = finding. Ads + auto-tagging/enhanced conversions only if paid acquisition else "not linked". Link native projects + store billing if IAP. Missing link → owner. **Done when:** `Integrations` row per link: linked / not linked / not applicable.
- [ ] **Step 18 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: row per consent signal, collection/config limit, user-id rule, tag-manager governance, server-protocol requirement → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 19 — Anything Else:** (a) Since previous commit, every tracking touch (events, data-layer wrapper, container, property/stream, consent banner/mode, native config, server events, auth redirects) → one-line verdict. (b) ~30 min senior pass + incidents/`bkit-audit-logs`/`docs/failures.jsonl`/vendor status since last run — gaps no step covers. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, whether the audit applied, and the event-list change vs the previous run (or baseline).
- [ ] **Series:** `Dashboards` shares and the `Container` diff beside previous report's, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
