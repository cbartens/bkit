<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# App Performance Audit

> [!CAUTION]
> **Purpose:** Reproducible field, lab, and source baseline of web, native, and server performance, judged against published thresholds and budgets.
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
> - NEVER change sampling rates, dashboards, or project settings to take a measurement; a gap = finding.
> - Every figure names environment, window, percentile, and `n`.

## Universal Instructions

### Context & Goals

A performance number is only worth anything beside the number it replaced, taken the same way; without a fixed method each run measures something slightly different and the delta is worthless. Target failure: **a baseline that measures the instrument or the harness, not the app** — e.g. field data that is all CI / preview traffic (cold functions, no warm cache, no CDN benefit, a robot driving the browser: waterfall shape transfers, absolute times do not); a preview-only overlay adding seconds to every pageload; a vital never collected reading as fine. Fix what you measure before you measure; instrument findings outrank app findings.

**Applies when:** web app, native app, or server answering user requests. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when production first gets real traffic, after instrument fixes land (`Re-baseline`), or after a change to network shape (region pin, prefetch policy, server-data seeding). Changed sampling rate, dashboards, window, or percentile → new baseline; run one then.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Core Web Vitals (LCP, INP, CLS at p75, mobile, and desktop apart) and supporting FCP, TTFB (e.g. web.dev); check its changelog.
- Field dataset (e.g. Chrome UX Report, PageSpeed Insights).
- Lab method (e.g. Lighthouse, WebPageTest); record tool version.
- Long Animation Frames API.
- Soft Navigations API; record browser version shipping it by default.
- Framework production checklist, edition = version the app runs (e.g. Next.js, Nuxt).
- Platform native vitals (e.g. Android vitals, Xcode Organizer metrics).
- Monitoring vendor's mobile vitals docs (e.g. Sentry Mobile Vitals, Datadog RUM mobile).

### Scope

- Instrument health: collected metrics, sample sizes, environment split, pollution.
- Field and lab baselines per web route, native screen, and client-side navigation; production field data.
- Store and device native vitals; budgets.
- Waterfalls and static causes: bundle, media, render-blocking, start-up, rendering / caching, third parties, back/forward cache, prefetch, native size.
- Slow interactions; async user-facing pipelines; server, DB, background-job, and LLM latency; long sessions.
- Follow-ups closed since previous report.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Crawling, metadata, structured data | Search sweep; page speed stays here | `bkit-audit-aio-seo` |
| Query plans, indexes, vacuum, pool sizing | Database sweep | `bkit-audit-database` |
| Prompt quality | LLM sweep; latency stays here | `bkit-audit-llm` |
| Model choice | Model sweep; latency stays here | `bkit-audit-models` |
| LLM spend | Cost sweep; latency stays here | `bkit-audit-cost` |
| Third-party tag payloads, consent | Tracking sweep; main-thread cost stays here | `bkit-audit-analytics` |
| Module structure, coupling | Architecture sweep; method reused here | `bkit-audit-architecture` |
| CI pipeline duration | CI sweep | `bkit-audit-ci-performance` |
| Applying fixes / changing sampling or dashboards | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Monitoring:** Steps 2–4, 6, 9, 11–13, 15 — field traces, vitals, and spans per environment, e.g. Sentry, Datadog RUM, New Relic. Fallback: lab and static steps only; field rows `Not Checked`.
- [ ] **Build Output:** Steps 8, 10 — production build with per-route size and render mode, e.g. `next build`, `vite build` with bundle analyser. Fallback: source read only; sizes `Not Checked`.
- [ ] **Web:** Steps 4, 17 — fetch anchor standards and published thresholds. Fallback: versions and thresholds recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Lab Runner:** Deployed web app → Steps 5, 10 — e.g. Lighthouse CI, WebPageTest; record version and profile. Fallback: none; `Lab Baseline` `Not Checked`.
- [ ] **Browser DevTools:** Web app → Steps 10, 11, 14 — back/forward cache, Long Animation Frames, heap snapshots, e.g. Chrome DevTools, Playwright over CDP. Fallback: those rows `Not Checked`.
- [ ] **Field Dataset:** Production origin with traffic → Step 6 — e.g. CrUX via PageSpeed Insights, search console Core Web Vitals report. Fallback: monitoring production rows only.
- [ ] **Store Consoles:** Published native app → Step 7 — e.g. Play Console Android vitals, Xcode Organizer, App Store Connect sizes. Fallback: `not published`, or `Not Checked`.
- [ ] **Low-End Device:** Native app → Step 7 — physical low-end Android device. Fallback: none; device rows `Not Checked`.
- [ ] **Language Server:** Typed language → Step 9 — references, e.g. Serena, `tsserver`, `pyright`. Fallback: text search only; name it per finding.
- [ ] **Code Graph:** Structural questions → Steps 9, 10 — module fan-out and cold-start graph, method per `bkit-audit-architecture`. Fallback: language server and text search; local-only tool missing in cloud → say so.
- [ ] **Platform Settings:** Hosted platform → Steps 3, 10 — preview overlays, region, CDN cache hit ratio, e.g. Vercel, Netlify, Cloudflare dashboard / API. Fallback: response headers only; settings `Not Checked`.
- [ ] **DB Statistics:** Hosted DB → Step 13 — e.g. `pg_stat_statements`, platform performance advisor. Fallback: monitoring spans only.
- [ ] **Job Runner:** Background jobs → Steps 12, 13 — run timings and queue lag, e.g. Inngest, Temporal, Sidekiq. Fallback: monitoring spans only.
- [ ] **Tracker:** Follow-ups opened from previous reports → Step 16 — e.g. `gh`, Linear MCP. Fallback: `Closed Follow-Ups` `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Measurement Basis:** Record dashboards used with IDs, owned vs vendor-prebuilt (prebuilt = not editable), and the exact query behind each table; window, percentile, and `n` per row; environment split stated plainly, production count even when 0; one linked reference trace the narrative cites. Window or percentile ≠ previous report → new baseline, not comparison. **Done when:** all in `Measurement Basis`.
- [ ] **Step 3 — Instrument:** Confirm before trusting; state each result — a missing metric reads as fine otherwise. Preview-only overlays (e.g. toolbars, comment widgets) off at project level, else pageloads carry their requests. Every vital collected (e.g. INP `null` on every route = gap). Native screen transactions and frame tracking exist; warm start slower than cold = dataset untrustworthy. `n` per row large enough (a few hundred events on one transaction ≠ baseline). Client-side navigations measured: navigation transactions, LCP / INP after soft navigation. Fallback / degraded-path execution rate measured, or named blind spot. Field data from CI / preview only → shape transfers, absolute times do not; say so. Each failure = finding, outranks app findings — until the instrument is honest, no fix can be shown to work. **Done when:** `Instrument` line per check.
- [ ] **Step 4 — Field Baseline:** One table per surface, p75, ordered by load count. Web per route: LCP, INP, CLS, FCP, TTFB. Native per screen: cold / warm start, time to initial / full display, slow / frozen frames. Uncollected → `not collected`, never blank. Verdict per p75 good / needs improvement / poor against thresholds its source publishes, mobile, and desktop split; read thresholds from sources each run, never memory; write them in the table header. Plus navigation table: navigation transactions per route; LCP / INP after soft navigation where reported. **Done when:** every row has verdict or `not collected` in `Field Baseline`.
- [ ] **Step 5 — Lab Baseline:** Field data from CI / preview → lab run = the reproducible number. Lab runner against production, never preview, on `Field Baseline` web routes: fixed throttling profile (mid-tier mobile device, slow 4G), 5 runs per route, median. Record tool version and profile; change to either → new series. Lab cannot measure INP → record Total Blocking Time as stand-in. Keep third-party summary for `Static`. **Done when:** series per route in `Lab Baseline`.
- [ ] **Step 6 — Production:** Production users → their numbers count. Production sampling rate yields ~1,000 events per route per window; record production `n` per route against that. Field dataset (e.g. CrUX via PageSpeed Insights) for production origin once it qualifies; search console Core Web Vitals report (shared with `bkit-audit-aio-seo`). No production traffic → `no production traffic`, never omit. **Done when:** `Production` holds `n` per route and field-dataset rows, or `no production traffic`.
- [ ] **Step 7 — Native Vitals:** Native app → read beyond the monitoring SDK. Android store vitals: slow cold / warm starts, slow / frozen frames, ANR rate, excessive partial wake locks (enforced on store visibility). iOS organizer: launch time, hang rate, energy. Low-end Android device: memory over primary flow; what the OTA update layer adds to cold start (e.g. `expo-updates`, CodePush). Not in stores → `not published` for store rows. **Done when:** `Native Vitals` row per metric, or `not published`.
- [ ] **Step 8 — Budgets:** Delta vs previous report says moved, not good enough → report delta vs budget: per-route first-load JS (gzipped), LCP and INP targets per route, native JS bundle size, bundle size cap. Unset budget → propose from this run's figures; owner decides. **Done when:** `Budgets` row per budget: target · actual · delta, or proposed target.
- [ ] **Step 9 — Waterfall:** Table says which route is slow; trace says why. Per worst route open reference trace; count: round trips, sequential vs concurrent (concurrent pattern already in codebase = model to copy); requests on every pageload for data only one interaction needs; duplicate work (e.g. two nav components each prefetching every route); fixed floor under every call regardless of work (primary-key lookup costing the same as token validation = network toll, not slow query). Resolve where DB and functions run before rewriting any query — a region pin beats every query rewrite. Several findings, one toll → one finding (six sequential calls paying one toll ≠ six fixes). Language-server references on hook / fetcher → one call site or many; on shared client / helper → what else pays this toll. Pace queries — back-to-back queries collapse to partial results, under-count shrinks blast radius; re-run surprisingly small caller sets; config / JSON wiring = text search. Structural questions (hub module, cold-start graph split) → code graph. Each finding carries its explanation or links the one that has it. **Done when:** `Waterfall` row per worst route: round trips · shape · tolls · call sites · merged findings.
- [ ] **Step 10 — Static:** Baseline covers only routes with traffic and collected metrics; source shows causes before anything runs:
  - Client bundle: size per route from build output; heavy dependencies in client components; barrel imports dragging a whole package. Record as series.
  - Media: missing width / height (CLS), no lazy loading below the fold, no responsive sizes.
  - Render-blocking: synchronous third-party scripts; font loading.
  - Server start-up: heavy top-level imports in route handlers / workers where a lazy import keeps them off cold start; intended cold-start module splits not undone; code-graph fan-out ranking finds candidates.
  - Request-path blocking: synchronous file / crypto work; sequential awaits that could run concurrently.
  - Native entry: top-level imports every cold start pays for.
  - Rendering / caching per route: static / dynamic / partially prerendered from build output; unexpected dynamic rendering (e.g. request cookies / headers read in a layout); `Cache-Control`; CDN cache hit ratio; server-component payload size of heaviest routes.
  - Third-party scripts: main-thread time and transfer per third party from `Lab Baseline` summary; each loads after interactive or later (e.g. `next/script` `afterInteractive`, Nuxt Scripts).
  - Back/forward cache: main routes eligible (DevTools); `Cache-Control: no-store` on HTML, `unload` handlers, or open connections each turn back / forward into a full reload.
  - Prefetch: what each route prefetches (link prefetch, Speculation Rules) and how much is used.
  - Native size: bytecode bundle size (e.g. Hermes), store download / install size, long lists virtualised.

  Risk signals, not measurements; confirm any fix with `Re-baseline`, not by re-reading code. **Done when:** `Static` row per item; bundle series recorded.

- [ ] **Step 11 — Interactions:** Per route with INP data: what makes the slowest interactions slow — Long Animation Frames attribution to script source, forced layout, or hydration. Name worst interactions (e.g. drag, popover open, picker, form submit). **Done when:** `Interactions` row per route: interaction · duration · attributed cause.
- [ ] **Step 12 — Async Paths:** Async user-facing pipelines → slowest user-facing path often appears in no web vital (e.g. inbound message → parsed → model extraction → visible → reply sent). Measure end to end, p50 / p95 per stage, from job-runner timings and monitoring spans; name the longest stage. **Done when:** `Async Paths` stage table per pipeline, or none recorded.
- [ ] **Step 13 — Server Latency:** `Waterfall` sees only traced routes → read across the app: p75 / p95 per server action, route handler, and DB RPC from spans; slow queries from DB statistics and platform advisor; background-job step durations and queue lag; LLM calls per model and call site — time to first token, total duration, timeouts, retries, and whether user-facing calls stream. **Done when:** `Server Latency` tables per source.
- [ ] **Step 14 — Long Sessions:** Screens left open for hours (e.g. calendar, dashboard) → open each 30 min, heap snapshots along the way; record memory growth, realtime subscription count, and polling intervals. **Done when:** `Long Sessions` row per screen.
- [ ] **Step 15 — Re-baseline:** Instrument findings fixed since previous report → pre-fix baseline is not the reference; re-take `Field Baseline` and `Lab Baseline`; mark which figures moved because the instrument changed, not the app. **Done when:** moves marked in `Field Baseline`, or no instrument fix since previous report recorded.
- [ ] **Step 16 — Closed Follow-Ups:** Follow-ups opened from previous reports close carrying decisions only in their threads. Read every one closed since previous report; sort what each left: A = not done, blocked on owner action → named action and blocker; B = deliberately dropped, reasoning holds → recorded so nobody reopens it; C = real work nobody owns → new tracker item or named home in scheduled work. In neither tracker nor scheduled work → `docs/deferrals.jsonl` row named. Comment on a closed item ≠ register. **Done when:** `Closed Follow-Ups` row per item: group · destination.
- [ ] **Step 17 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Core Web Vital and supporting web metric (LCP, INP, CLS, FCP, TTFB), Android vital, iOS organizer metric, and framework production-checklist item → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 18 — Anything Else:** (a) Everything changed since previous report's commit touching performance (routes and layouts, client components and dependencies, third-party scripts, server actions and route handlers, DB queries and RPCs, background jobs, LLM call sites, region, and caching config, monitoring sampling, native app entry) → one-line verdict each. (b) Bounded ~30 min pass: what a senior performance engineer flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Environments:** every figure names environment, window, percentile, and `n`.
- [ ] **Settings untouched:** no sampling rate, dashboard, or project setting changed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | User-facing path that times out or never completes; crash, ANR, or hang blocking a primary flow; long-session memory growth to crash |
| `HIGH` | Instrument gap or pollution invalidating the baseline; core vital `poor` on a primary route; budget exceeded; store-enforced vital over threshold; fixed network toll on every call; sequential waterfall on a primary route |
| `MEDIUM` | Vital `needs improvement`; duplicate or wasted prefetch; unexpected dynamic rendering; main route not back/forward-cache eligible; third party loading before interactive; slow query, job step, or LLM call off the primary path; unvirtualised long list |
| `LOW` | Static risk signal without measured impact; size drift within budget; series gap |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: what unblocks the next measurement first — instrument / pollution, one-line config (region, project settings), contained client trims, decisions, or packages shared with native, needs local repro. Needs diagnosis before sizing → `Expected` says so.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, environments measured, and production `n`.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
