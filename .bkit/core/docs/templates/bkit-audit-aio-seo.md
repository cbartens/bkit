<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# AIO SEO Audit

> [!CAUTION]
> **Purpose:** Whether search engines and answer engines can find, read, and correctly describe public pages.
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
> - never change search-console, webmaster, robots, sitemap, IndexNow, or firewall settings; record the owner's decision.
> - Name a personal-data field and its page for `bkit-audit-privacy`; never copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

- Search and answer engines read the same public pages; silent failures (`noindex` from preview config, canonical to preview URL, sitemap listing login-gated pages) stop traffic while the site still works.
- Search engines rank pages; answer engines quote facts → plain factual copy matters.
- Engine ignores `llms.txt` but shares one index with AI answers → indexing basics cover both.

**Applies when:** a web origin crawlers can request. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when routing, locales, or the public site change.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Search essentials and the search-documentation updates log (e.g. Google Search Essentials, Bing Webmaster Guidelines); record the date of the newest entry read.
- The engine's AI-features and generative-AI optimisation guides (e.g. Google's AI features and your website); record each page's last-updated date.
- Search-console help, including the control for generative answers (e.g. Search Console Help); record the date read.
- Index submission protocol (e.g. IndexNow); record the date read.
- Structured-data vocabulary release and the engine's supported-type list (e.g. schema.org, Google's structured-data gallery); record release number and date read.
- Robots Exclusion Protocol (e.g. RFC 9309).
- Each AI vendor's crawler documentation (e.g. OpenAI, Anthropic, Perplexity, Apple, Google's common crawlers); record each page's date or the date read.
- Core Web Vitals, owned by `bkit-audit-app-performance`; this audit reads only what the search console reports.

### Scope

- Public URLs vs previews (previews not indexable).
- Crawling / indexing: robots, sitemap, canonicals, locales, status codes, HTML with and without JavaScript.
- Metadata, structured data, plain answers answer engines quote.
- AI crawler policy, firewall agreement, engine responses when asked.
- Site structure, trust pages, search-console reports.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Page speed; Core Web Vitals beyond the search console's report | Speed sweep | `bkit-audit-app-performance` |
| Heading order, alt text, contrast | Accessibility sweep | `bkit-audit-accessibility` |
| Whether structure or copy works for people | Usability sweep | `bkit-audit-usability` |
| Personal data on a public page | Privacy sweep | `bkit-audit-privacy` |
| Screen a search-to-app link opens | Store sweep | `bkit-audit-app-store` |
| How AI referral traffic is measured | Tracking sweep | `bkit-audit-analytics` |
| A doc that describes the site wrongly | Documentation sweep | `bkit-audit-documentation` |
| Applying fixes / changing robots, consoles, or firewall | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Live Fetch:** Steps 2–9 — request public URLs, headers, and HTML, e.g. `curl`, a browser. Fallback: source read; live claims = hypotheses.
- [ ] **Web:** Step 10 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Search Consoles:** Indexable public pages → Step 9 — e.g. Google Search Console, Bing Webmaster Tools. Fallback: none; consoles missing while indexable pages exist = finding.
- [ ] **Edge Logs:** Bot firewall or CDN → Step 6 — crawler status codes, e.g. Vercel Firewall, Cloudflare. Fallback: `robots.txt` only; log rows `Not Checked`.
- [ ] **Schema Validators:** Structured data present → Step 5 — rich-results test and a schema.org validator, e.g. Google Rich Results Test, Schema Markup Validator. Fallback: read required properties from the engine's docs.
- [ ] **Answer Engines:** Indexable public pages → Step 6 — signed-out prompts, e.g. ChatGPT search, Perplexity, Gemini, Google AI Mode, Copilot, Claude. Fallback: page-text checks only; prompt rows `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Public URLs:** List public URLs from sitemap if present, else crawl from home. Record production host and tools available in `Checked`. First: no preview deployment indexable (`X-Robots-Tag: noindex` or host deployment protection); crawled preview competes with production and can expose unreleased pages. Marketing site outside repo → name where; audit from live URL. **Done when:** host, URL list, preview verdict in `Public URLs`. No web origin → `N/A` and STOP. No indexable page → say so; `Indexing` still runs; steps needing indexable page skip with evidence in `Not Checked`.
- [ ] **Step 3 — Indexing:** `robots.txt` + sitemap: present, valid, public URLs only. `lastmod` only when that page's content changes — trusted only when consistently accurate. Sitemap submitted in each webmaster console. Robots meta + `X-Robots-Tag` per page type: auth/previews `noindex`, public indexable. No `noindex` also `Disallow`ed: blocked crawler never sees `noindex` → URL can stay indexed from links. Canonicals: absolute, production host, one per page. Host canonicalisation: `http`→`https`, apex↔`www`, trailing-slash policy each one hop; HSTS set; sitemap uses canonical form only. Status codes: chain ≤1 hop, no loops, missing →404. Locales: `hreflang` per variant → existing pages; `hreflang="x-default"`; sets reciprocal and include self; canonical same-locale, never another locale; no forced `/` redirect by `Accept-Language` or IP — crawler without `Accept-Language` from one country (e.g. Googlebot) must see other locales. Content in HTML without JavaScript. Rendered HTML: one URL per page type — no-JS view vs engine render after JS (e.g. URL Inspection). Mobile/desktop same content when engine indexes mobile (e.g. Google). **Done when:** `Indexing` row per check: met / finding / not applicable (why).
- [ ] **Step 4 — Metadata:** Indexable public page → title + description present, unique, right length. Open Graph + Twitter card tags; images exist, right size. `lang`, favicon, web manifest. Store listings → Smart App Banner (`apple-itunes-app`); `apple-app-site-association` + `assetlinks.json` reachable so search opens app. Link target screen → `bkit-audit-app-store`. **Done when:** `Metadata` row per page: tag · verdict, or skip in `Not Checked`.
- [ ] **Step 5 — Structured Data:** Indexable public page → JSON-LD per page type: `Organization`, `WebSite`, `SoftwareApplication` or `MobileApplication` with store links, `FAQPage` only mirroring on-page Q&A, `BreadcrumbList` where depth exists. Validate each block; must match visible page — disagreeing markup worse than none. Engine rich-results test (supported) + schema.org validator (vocabulary). App types: engine software-app required props + `operatingSystem`, `applicationCategory`. Ratings from real on-page user ratings, never self-assigned. Retired rich-result type (`Project Instructions`) missing ≠ finding. Generative answers need no special markup; structured data earns rich results and states facts plainly. **Done when:** `Structured Data` row per block: type · valid · agrees with page · verdict, or skip in `Not Checked`.
- [ ] **Step 6 — Answer Engines:**
  - `llms.txt` / `llms-full.txt` optional. Engines ignore or use unevenly → missing file ≠ finding. If present: current, links to existing pages; stale = `LOW`.
  - Indexable page → plain facts in HTML text (not only images/scripts): product, audience, cost, platforms. Direct Q&A near top of owning page. One name for product/company across site, store, social. Off-site description/pricing/platforms match store, reviews, forums, press — answer engines often cite these over product site. List third-party sources prompt pass cited.
  - AI crawler policy: `robots.txt` per group. Allow/block both fine; no recorded decision = finding. Owner decides; report records. Blocking one group ≠ blocking others. Training: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot. Search: OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot (feeds some assistants) — block → out of those answers. User-triggered: ChatGPT-User, Claude-User, Perplexity-User; some vendors say may not follow `robots.txt`. "Block training, allow search" common; write per group.
  - Edge/firewall + CDN "block AI bots" agree with `robots.txt`. Firewall `403` to allowed search crawler overrides `robots.txt` silently. Check edge/server logs for each search crawler requests + status codes, not `robots.txt` alone.
  - Search-console control for generative answers inclusion/exclusion. Owner decides; report records. Does not govern training.
  - Indexable page → same questions to same answer engines. Record date, each answer, citations. Answers drift daily → signal not test; wrong answer = finding about these pages, not the engine. Repeatable: fixed prompts (brand, category, named competitor comparison, pricing); fixed engine set from ChatGPT search, Perplexity, Gemini, Google AI Mode, Copilot, Claude; signed out; verbatim answers + cited URLs; mention/citation share vs previous report or baseline.
  - AI referrals from answer-engine hosts + tagged visits per `bkit-audit-analytics`. Unmeasurable → name that audit; do not invent method here.

  **Done when:** `Answer Engines` holds policy per group, the console control, prompt rows or a skip, and referral status.

- [ ] **Step 7 — Structure:** Indexable public page → URL format (lowercase, hyphenated, stable), click depth from home, orphan pages, broken internal links, nav/breadcrumbs reach every public page. Hierarchy for people → `bkit-audit-usability`; flag, do not decide. **Done when:** `Structure` row per check: met / finding, or skip in `Not Checked`.
- [ ] **Step 8 — Trust:** Indexable public page → about/company, contact, support, pricing, privacy, terms; dated attributed content where published. `Organization` `sameAs` → store + social. Generative-AI guides: unique non-commodity content first → flag pages restating elsewhere only. Copy for people → `bkit-audit-usability`. **Done when:** `Trust` row per required page: present / finding, or skip in `Not Checked`.
- [ ] **Step 9 — Consoles:** Indexable pages + consoles → indexing errors, indexed vs submitted, top queries + delta vs previous report. Consoles missing while indexable pages exist = finding; else `Indexing` only signal. Search console: generative-AI performance, Core Web Vitals (speed → `bkit-audit-app-performance`), page-indexing reasons per type (soft 404, duplicate without user-selected canonical, crawled not indexed). Other webmaster: AI-performance (citations, grounding queries, cited pages) + delta. IndexNow: public URL add/update/delete submitted; webmaster shows received. **Done when:** `Consoles` row per report: figure · delta · verdict, missing-console finding, or skip in `Not Checked`.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor + per search-doc or AI-crawler change since previous → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Changes since previous report's commit on public pages + crawl surface (routes, `robots.txt`, sitemap, metadata, structured data, locale routing, redirects, middleware, firewall/bot settings) → one-line verdict each. (b) Bounded ~30 min: senior technical SEO flags no step asks; read since previous run (incidents, new `docs/failures.jsonl`, `bkit-audit-logs` output, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Settings untouched:** no search-console, webmaster, robots, sitemap, IndexNow, or firewall setting changed.
- [ ] **No values:** no personal-data value anywhere in the report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | An indexed preview or signed-in page exposes personal or unreleased data; production canonical points at a host that serves the wrong site and there is no workaround |
| `HIGH` | Production removed from search; a page that should not be indexed is (auth, preview, signed-in), or an indexable page is `noindex`; `noindex` combined with `Disallow` so the URL can stay indexed; firewall blocks a search crawler the recorded policy allows |
| `MEDIUM` | Wrong or missing metadata; structured data that disagrees with the page; canonical, `hreflang`, or redirect defect; consoles absent while indexable pages exist; an answer engine states a wrong fact taken from these pages; off-site listing disagrees with the site |
| `LOW` | Stale `llms.txt`; naming drift that does not change which page is indexed. A missing `llms.txt`, or a missing retired rich-result type, is not a finding |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: indexing first.

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

### Public URLs

PENDING

### Indexing

PENDING

### Metadata

PENDING

### Structured Data

PENDING

### Answer Engines

PENDING

### Structure

PENDING

### Trust

PENDING

### Consoles

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
- [ ] **Summary:** names count per severity, whether any indexable public page exists, and the production host.
- [ ] **Series:** mention and citation share, and console query deltas, beside the previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
