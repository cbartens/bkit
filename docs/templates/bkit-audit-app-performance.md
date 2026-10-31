<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# App Performance Audit

> [!CAUTION]
> **Purpose:** Reproducible field, lab and source baseline of web, native and server performance, judged against published thresholds and budgets.
>
> **Rules:**
>
> - Do not change sampling rates, dashboards or project settings to take a measurement.
> - Record a measurement gap as a finding.
> - Name the environment, window, percentile and `n` for every figure.

## Universal Instructions

### Context & Goals

A performance number only matters beside the previous number, taken the same way. **If** the method is not fixed → the delta is worthless. The failure this audit targets is a baseline that measures the instrument or the harness instead of the app. Examples: field data that comes only from CI or previews (cold functions, no warm cache, no CDN, a robot browser), where the waterfall shape transfers but the absolute times do not; a preview overlay that adds seconds to each page load; or a vital that was never collected and so reads as fine. Fix the measurement before measuring. Findings about the instrument outrank findings about the app.

**Applies when:** there is a web app, a native app or a server answering user requests. **If** there is none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when production first gets real traffic, after instrument fixes (`Re-baseline`), and after a change to the network shape (region pin, prefetch policy, server-data seeding). A change to sampling, dashboards, the window or the percentile starts a new baseline, so run one then.

**Anchor Standards:**

- Core Web Vitals (LCP, INP, CLS at p75, mobile, and desktop apart) and supporting FCP, TTFB (e.g. web.dev). Check its changelog.
- Field dataset (e.g. Chrome UX Report, PageSpeed Insights).
- Lab method (e.g. Lighthouse, WebPageTest). Record the tool version.
- Long Animation Frames API.
- Soft Navigations API. Record the browser version that ships it by default.
- Framework production checklist, in the edition for the version the app runs (e.g. Next.js, Nuxt).
- Platform native vitals (e.g. Android vitals, Xcode Organizer metrics).
- Monitoring vendor's mobile vitals docs (e.g. Sentry Mobile Vitals, Datadog RUM mobile).

### Scope

- Check instrument health: which metrics are collected, sample sizes, the environment split and pollution.
- Take field and lab baselines per web route, native screen and client-side navigation, and read production field data.
- Read store and device native vitals.
- Compare results with budgets.
- Read waterfalls, and find static causes: bundle, media, render-blocking, start-up, rendering and caching, third parties, back/forward cache, prefetch and native size.
- Find slow interactions.
- Measure async user-facing pipelines.
- Measure server, DB, background-job and LLM latency.
- Check long sessions.
- Sort the follow-ups closed since the previous report.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Crawling, metadata, structured data | The search sweep owns them; page speed stays here | `bkit-audit-aio-seo` |
| Query plans, indexes, vacuum, pool sizing | The database sweep owns them | `bkit-audit-database` |
| Prompt quality | The prompt sweep owns it; latency stays here | `bkit-audit-prompts` |
| Model choice | The model sweep owns it; latency stays here | `bkit-audit-models` |
| LLM spend | The cost sweep owns it; latency stays here | `bkit-audit-cost` |
| Third-party tag payloads, consent | The tracking sweep owns them; main-thread cost stays here | `bkit-audit-analytics` |
| Module structure, coupling | The architecture sweep owns them; its method is reused here | `bkit-audit-architecture` |
| CI pipeline duration | The CI sweep owns it | `bkit-audit-ci-performance` |
| Applying fixes; changing sampling or dashboards | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Monitoring:** Steps 2-4, 6, 9, 11-13, 15 — field traces, vitals and spans per environment (e.g., Sentry, Datadog RUM, New Relic). Fallback: lab and static only, with field rows `Not Checked`.
- [ ] **Build Output:** Steps 8, 10 — a production build with per-route size and render mode (e.g., `next build`, `vite build` with a bundle analyser). Fallback: read the source only, and mark sizes `Not Checked`.
- [ ] **Web:** Steps 4, 17 — fetch the anchor standards and published thresholds. Fallback: record the versions and thresholds as unread.

#### Conditional

- [ ] **Lab Runner:** **If** a web app is deployed → Steps 5, 10 (e.g., Lighthouse CI, WebPageTest). Record its version and profile. Fallback: none. Mark `Lab Baseline` `Not Checked`.
- [ ] **Browser DevTools:** **If** there is a web app → Steps 10, 11, 14 — back/forward cache, Long Animation Frames and heap snapshots (e.g., Chrome DevTools, Playwright over CDP). Fallback: mark those rows `Not Checked`.
- [ ] **Field Dataset:** **If** a production origin has traffic → Step 6 (e.g., CrUX via PageSpeed Insights, the search console Core Web Vitals report). Fallback: use the monitoring production rows only.
- [ ] **Store Consoles:** **If** a native app is published → Step 7 (e.g., Play Console Android vitals, Xcode Organizer, App Store Connect sizes). Fallback: `not published`, or `Not Checked`.
- [ ] **Low-End Device:** **If** there is a native app → Step 7 — a physical low-end device for each platform shipped (e.g., a budget Android, the oldest supported iPhone). Fallback: none. Mark the device rows `Not Checked`.
- [ ] **Language Server:** **If** the language is typed → Step 9 — references (e.g., Serena, `tsserver`, `pyright`). Fallback: text search only, named on each finding.
- [ ] **Code Graph:** **If** there are structural questions → Steps 9, 10 — module fan-out and the cold-start graph, using `bkit-audit-architecture`'s method. Fallback: language server and text search. **If** a local-only tool is missing in the cloud → say so.
- [ ] **Platform Settings:** **If** the app runs on a hosted platform → Steps 3, 10 — preview overlays, region and CDN cache hit ratio (e.g., Vercel, Netlify, Cloudflare dashboard or API). Fallback: read response headers only, and mark settings `Not Checked`.
- [ ] **DB Statistics:** **If** the DB is hosted → Step 13 (e.g., `pg_stat_statements`, the platform's performance advisor). Fallback: monitoring spans only.
- [ ] **Job Runner:** **If** there are background jobs → Steps 12, 13 — run timings and queue lag (e.g., Inngest, Temporal, Sidekiq). Fallback: monitoring spans only.
- [ ] **Tracker:** **If** previous reports raised follow-ups → Step 16 — read them through the tracker MCP (e.g., GitHub MCP, Linear MCP, Jira MCP), with `gh` only as a fallback. Fallback: mark `Closed Follow-Ups` `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Measurement Basis:** Record the dashboards (their IDs, and whether each is owned or vendor-prebuilt; a prebuilt one cannot be edited) and the exact query behind each table. Record the window, percentile and `n` for each row. Split environments plainly, and give the production count even when it is 0. Link one reference trace. **If** the window or percentile differs from the previous report → this is a new baseline, not a comparison. **Done when:** `Measurement Basis` holds all of these.
- [ ] **Step 3 — Instrument:** Confirm each of these before trusting the numbers, and state each result, because a missing metric otherwise reads as fine. **If** preview deploys exist with injected overlays (e.g., toolbars, comment widgets) → check that they are off at the project level, or page loads carry their requests. Check that every vital is collected (INP `null` on every route is a gap). Check native screen transactions and frame tracking. **If** warm start is slower than cold start → the dataset cannot be trusted. Check that `n` per row is large enough (a few hundred events on one transaction is not a baseline). Check that client-side navigations are measured: navigation transactions, and LCP and INP after a soft navigation. Check that the fallback or degraded-path rate is measured, or name it as a blind spot. **If** field data comes only from CI or previews → say that the shape transfers, and the absolute times do not. Each failure here is a finding, and outranks app findings, because no fix can be proven until the instrument is honest. **Done when:** `Instrument` holds one line per check.
- [ ] **Step 4 — Field Baseline:** Build one table per surface, at p75, ordered by load count. For web, per route: LCP, INP, CLS, FCP and TTFB. For native, per screen: cold and warm start, time to initial and full display, and slow and frozen frames. Write `not collected` for an uncollected metric, never a blank. Give each p75 a verdict of good / needs improvement / poor against the source's thresholds, with mobile and desktop split. Read the thresholds on each run, never from memory, and write them in the table header. Add a navigation table: navigation transactions per route, and LCP and INP after soft navigation where reported. **Done when:** every row in `Field Baseline` has a verdict or `not collected`.
- [ ] **Step 5 — Lab Baseline:** **If** field data comes from CI or previews → the lab gives the reproducible number. Run the lab runner on production, never a preview, on the `Field Baseline` web routes, with fixed throttling (mid-tier mobile, slow 4G), 5 runs per route, and take the median. Record the tool version and profile. A change to either starts a new series. The lab cannot measure INP, so use Total Blocking Time as the stand-in. Keep the third-party summary for `Static`. **Done when:** `Lab Baseline` holds a series per route.
- [ ] **Step 6 — Production:** **If** there are production users → their numbers are the ones that count. Check that production sampling gives about 1,000 events per route per window, and record the production `n` per route. Read the field dataset (e.g., CrUX via PageSpeed Insights) for the production origin once it qualifies, and the search console Core Web Vitals report (shared with `bkit-audit-aio-seo`). **If** there is no production traffic → write `no production traffic`, and never omit the section. **Done when:** `Production` holds `n` per route and the field-dataset rows, or `no production traffic`.
- [ ] **Step 7 — Native Vitals:** Run this step only when the project has a native app, and read beyond the monitoring SDK. Android store vitals: slow cold and warm starts, slow and frozen frames, ANR rate and excessive partial wake locks (which affect store visibility). iOS Organizer: launch time, hang rate and energy. On a low-end device, read memory across the primary flow. **If** an over-the-air update layer ships (e.g., `expo-updates`, CodePush) → measure its cost on cold start on the same low-end device. **If** the app is not in the stores → write `not published` for the store rows. **Done when:** `Native Vitals` holds one row per metric, or `not published`.
- [ ] **Step 8 — Budgets:** A delta against the previous run says the number moved, not that it is good enough, so report each delta against a budget: shipped client code per route (e.g., first-load JS, gzipped), LCP and INP targets per route, native bundle or binary size, and a bundle size cap. **If** a budget is not set → propose one from this run, and let the owner decide. **Done when:** `Budgets` holds one row per budget: target · actual · delta, or a proposed target.
- [ ] **Step 9 — Waterfall:** The table says which route is slow; the trace says why. For each worst route, open its reference trace and count: round trips; sequential vs concurrent calls (concurrent code already in the codebase is the model to copy); page-load requests for data that only one interaction needs; duplicate work (e.g., two navigation components each prefetching every route); and a fixed floor under every call (a primary-key lookup costing the same as token validation is a network toll, not a slow query). Find where the DB and the functions run before rewriting any query, because a region pin beats every rewrite. **If** several findings share one toll → merge them into one finding (six sequential calls paying one toll is one fix, not six). Use language-server references on the hook or fetcher to see whether there is one call site or many, and on the shared client or helper to see what else pays the toll. Pace the queries: back-to-back queries collapse to partial results, and the under-count shrinks the blast radius, so re-run small caller sets. Use text search for config and JSON wiring. Use the code graph for structural questions (hub module, cold-start graph). Each finding carries its explanation, or links the finding that has it. **Done when:** `Waterfall` holds one row per worst route: round trips · shape · tolls · call sites · merged findings.
- [ ] **Step 10 — Static:** The baseline covers routes with traffic and collected metrics; the source shows causes before they run. **If** an item's surface is absent **or** the stack lacks its mechanism → write `N/A` for that item, with evidence. Check each item below where its surface (web, server, native) exists and the stack has the mechanism:
  - Client bundle: size per route from the build output; heavy dependencies in client-side code (e.g., React client components); barrel imports that drag in a whole package. Record it as a series.
  - Media: missing width and height (CLS), no lazy loading below the fold, no responsive sizes.
  - Render-blocking: synchronous third-party scripts; font loading.
  - Server start-up: heavy top-level imports in route handlers or workers, where a lazy import would keep them off the cold start; intended cold-start splits that were undone. Code-graph fan-out finds candidates.
  - Request-path blocking: synchronous file or crypto work; sequential awaits that could run concurrently.
  - Native entry: top-level imports that every cold start pays for.
  - Rendering and caching per route: the rendering mode from the build output, where the framework has one (e.g., Next.js static / dynamic / partially prerendered); unexpected dynamic rendering (e.g., cookies or headers read in a layout); `Cache-Control`; the CDN cache hit ratio; the server-rendered payload on the heaviest routes (e.g., the React server-component payload).
  - Third-party scripts: main-thread time and transfer per third party, from the `Lab Baseline` summary. Check that each loads after the page is interactive or later (e.g., `next/script` `afterInteractive`, Nuxt Scripts).
  - Back/forward cache: check that the main routes are eligible (DevTools). `Cache-Control: no-store` on HTML, `unload` handlers or open connections force a full reload on back and forward.
  - Prefetch: what each route prefetches (link prefetch, Speculation Rules), and whether it is used.
  - Native size: the bytecode bundle (e.g., Hermes), the store download and install size, and whether long lists are virtualised.

  These are risk signals, not measurements. Confirm fixes with `Re-baseline`, not by re-reading code. **Done when:** `Static` holds one row per item, and the bundle series is recorded.

- [ ] **Step 11 — Interactions:** For each route with INP, find the slowest interactions, and attribute them with Long Animation Frames to a script source, forced layout or hydration. Name the worst ones (drag, popover open, picker, form submit). **Done when:** `Interactions` holds one row per route: interaction · duration · attributed cause.
- [ ] **Step 12 — Async Paths:** **If** there are async user-facing pipelines → the slowest path is often absent from web vitals (e.g., an inbound message is parsed, goes through model extraction, becomes visible, and a reply is sent). Measure it end to end, at p50 and p95 per stage, from job-runner timings and monitoring spans, and name the longest stage. **Done when:** `Async Paths` holds a stage table per pipeline, or records none.
- [ ] **Step 13 — Server Latency:** `Waterfall` covers only the traced routes, so read latency app-wide: p75 and p95 per server endpoint (e.g., server action, route handler, controller action, DB RPC) from spans; slow queries from DB statistics and the platform advisor; background-job step durations and queue lag; and LLM calls per model and call site — time to first token, total duration, timeouts, retries, and whether user-facing calls stream. **Done when:** `Server Latency` holds a table per source.
- [ ] **Step 14 — Long Sessions:** **If** some screens stay open for hours (calendar, dashboard) → keep each open for 30 minutes, take heap snapshots, and record memory growth, the realtime subscription count and polling intervals. **Done when:** `Long Sessions` holds one row per screen.
- [ ] **Step 15 — Re-baseline:** **If** the instrument was fixed since the previous report → the pre-fix baseline is no longer the reference. Re-take `Field Baseline` and `Lab Baseline`, and mark the figures that moved because of the instrument change, not the app. **Done when:** `Field Baseline` marks the moves, or the report records that there was no instrument fix since the previous report.
- [ ] **Step 16 — Closed Follow-Ups:** Follow-ups from previous reports often close with their decisions recorded only in threads. Read each one closed since the previous report, and sort it: A = not done, blocked on an owner → a named action and blocker; B = deliberately dropped, and the reasoning holds → record it so nobody reopens it; C = real work nobody owns → a new tracker item, or a named home in scheduled work. **If** there is neither a tracker nor scheduled work → name a `docs/deferrals.jsonl` row. A comment on a closed item is not a register. **Done when:** `Closed Follow-Ups` holds one row per item: group · destination.
- [ ] **Step 17 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per Core Web Vital and supporting web metric (LCP, INP, CLS, FCP, TTFB), one per Android vital, one per iOS Organizer metric and one per framework production-checklist item, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 18 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches performance: routes and layouts, client-side code and dependencies, third-party scripts, server endpoints, DB queries and RPCs, background jobs, LLM call sites, region and caching config, monitoring sampling, or the native app entry. (b) In a bounded pass of about 30 minutes, note what a senior performance engineer would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Environments:** every figure names its environment, window, percentile and `n`.
- [ ] **Settings untouched:** no sampling rate, dashboard or project setting changed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A user-facing path times out or never completes. A crash, ANR or hang blocks a primary flow. Memory grows over a long session until it crashes |
| `HIGH` | An instrument gap or pollution invalidates the baseline. A core vital is `poor` on a primary route. A budget is exceeded. A store-enforced vital is over its threshold. A fixed network toll on every call. A sequential waterfall on a primary route |
| `MEDIUM` | A vital at `needs improvement`. A duplicate or wasted prefetch. Unexpected dynamic rendering. A main route that is not back/forward-cache eligible. A third party that loads before the page is interactive. A slow query, job step or LLM call off the primary path. A long list that is not virtualised |
| `LOW` | A static risk signal with no measured impact. Size drift within budget. A gap in a series |

Within a severity, list first what unblocks the next measurement, in this order: instrument and pollution fixes; one-line config changes (region, project settings); contained client trims; decisions; and packages shared with native that need a local repro. **If** a finding needs diagnosis before it can be sized → its `Expected` says so.

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

### Measurement Basis

PENDING

### Instrument

PENDING

### Field Baseline

PENDING

### Lab Baseline

PENDING

### Production

PENDING

### Native Vitals

PENDING

### Budgets

PENDING

### Waterfall

PENDING

### Static

PENDING

### Interactions

PENDING

### Async Paths

PENDING

### Server Latency

PENDING

### Long Sessions

PENDING

### Closed Follow-Ups

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
- [ ] **Summary:** `Summary` gives the count per severity, the environments measured and the production `n`.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
