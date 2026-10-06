<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# AIO SEO Audit

> [!CAUTION]
> **Purpose:** Whether search engines and answer engines can find, read, and correctly describe public pages.
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
> - NEVER change search-console, webmaster, robots, sitemap, IndexNow, or firewall settings; record the owner's decision.
> - Name a personal-data field and its page for `bkit-audit-privacy`; NEVER copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

Search ranking and answer engines read the same public pages and fail without an error: a `noindex` copied from a preview config, a canonical pointing at a preview URL, a sitemap listing pages behind login. The site still works, and traffic quietly stops. Search engines rank pages; answer engines lift facts out of them, so plain factual statements matter to the second. An engine that ignores `llms.txt` and shares one index with its AI answers means the indexing basics carry both.

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

- Which URLs are public, and that previews are not indexable.
- Crawling and indexing: robots, sitemap, canonicals, locales, status codes, HTML with and without JavaScript.
- Metadata, structured data, and plain answers answer engines quote.
- AI crawler policy, firewall agreement, and what the engines say when asked.
- Site structure, trust pages, and search-console reports.

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

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Public URLs:** List public URLs from the sitemap if one exists, else by crawling from the home page. Record the production host and which tools were available, in `Checked`. Check first that no preview deployment is indexable (`X-Robots-Tag: noindex`, or the host's deployment protection); a crawled preview competes with production and can expose unreleased pages. Marketing site outside this repo → name where, and audit it from its live URL. **Done when:** host, URL list, and preview verdict in `Public URLs`. No web origin → `N/A` and STOP. No indexable page → say so; `Indexing` still runs; steps that need an indexable page skip with evidence in `Not Checked`.
- [ ] **Step 3 — Indexing:** `robots.txt` and the sitemap: present, valid, listing only public pages. `lastmod` changes only when that page's content changes — engines trust it only when it is consistently accurate. Sitemap submitted in each webmaster console. Robots meta and `X-Robots-Tag` per page type: auth pages and previews `noindex`, public pages indexable. No `noindex` page is also `Disallow`ed: a crawler blocked from fetching never sees `noindex`, so the URL can stay indexed from links. Canonicals: absolute, on the production host, one per page. Host canonicalisation: `http` to `https`, apex to `www` (or the reverse), and the trailing-slash policy each resolve in one hop; HSTS is set; the sitemap uses only the canonical form. Status codes: no chain longer than one hop, no loops, a missing page returns 404. Locales: `hreflang` for each locale variant, pointing at pages that exist; an `hreflang="x-default"` entry; sets reciprocal and include the page itself; each canonical points at the same-locale URL, never another locale; no forced redirect on `/` by `Accept-Language` or IP — a crawler that sends no `Accept-Language` and crawls from one country (e.g. Googlebot) never sees the other locales. Content in the HTML a crawler gets without JavaScript. Rendered HTML: one URL per page type, compare the no-JavaScript view with the HTML the engine rendered after JavaScript (e.g. URL Inspection). Mobile and desktop serve the same content when the engine indexes the mobile version (e.g. Google). **Done when:** `Indexing` row per check: met / finding / not applicable (why).
- [ ] **Step 4 — Metadata:** Indexable public page → title and description present, unique, and the right length. Open Graph and Twitter card tags, with images that exist and are the right size. `lang`, favicon, and web manifest. Store listings exist → Smart App Banner (`apple-itunes-app`) and that `apple-app-site-association` and `assetlinks.json` are reachable, so a search result can open the app. Whether the link opens the right screen → `bkit-audit-app-store`. **Done when:** `Metadata` row per page: tag · verdict, or skip in `Not Checked`.
- [ ] **Step 5 — Structured Data:** Indexable public page → JSON-LD per public page type: `Organization`, `WebSite`, `SoftwareApplication` or `MobileApplication` with the store links, `FAQPage` only where it mirrors questions and answers visible on the page, `BreadcrumbList` where there is depth. Validate each block, and check it says the same as the visible page; markup that disagrees with the page is worse than none. Validate in the engine's rich-results test (what it supports) and a schema.org validator (what the vocabulary allows). App types carry the properties the engine's software-app docs mark as required, plus `operatingSystem` and `applicationCategory`. Any rating comes from real user ratings shown on the page, never one the site gives itself. A retired rich-result type (`Project Instructions`) missing is not a finding. Generative answers need no special markup; structured data earns rich results and states facts plainly. **Done when:** `Structured Data` row per block: type · valid · agrees with page · verdict, or skip in `Not Checked`.
- [ ] **Step 6 — Answer Engines:**
  - `llms.txt` and `llms-full.txt`, optional. Engines that ignore them, or use them unevenly → a missing file is not a finding. If one exists: current, and links to pages that exist; stale = `LOW`.
  - Indexable page → plain facts in HTML text, not only in images or scripts: what the product is, who it is for, what it costs, and which platforms it runs on. Questions with direct answers near the top of the page they belong to. One name for one thing: product and company named the same way on the site, the store listings, and social profiles. Off-site: description, pricing, and platforms match store listings, review sites, forums, and press — answer engines often cite these more than the product site. List third-party sources the prompt pass below cited.
  - AI crawler policy: what `robots.txt` says, per group. Allowing and blocking are both fine; no recorded decision = finding. The owner decides; the report records it. Blocking one group does not block the others. Training: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot. Search: OAI-SearchBot, Claude-SearchBot, PerplexityBot, and Bingbot, which also feeds some assistants — blocking these takes the site out of those answers. User-triggered fetches: ChatGPT-User, Claude-User, Perplexity-User; some vendors say these may not follow `robots.txt`. "Block training, allow search" is a common choice; whatever is picked is written down per group.
  - Edge and firewall rules, and any CDN "block AI bots" default, agree with the `robots.txt` decision. A firewall `403` to a search crawler the recorded policy allows overrides `robots.txt` without saying so. Check edge or server logs for each search crawler's recent requests and status codes, not `robots.txt` alone.
  - The search-console control that includes or excludes the site from that engine's generative answers. The owner decides; the report records the setting. It does not govern training.
  - Indexable page → put the same questions to the same answer engines. Record the date, what each said, and what it cited. Answers change day to day, so this is a signal, not a test; a wrong answer is a finding about these pages, not the engine. Repeatable: a fixed prompt set covering the brand, the category, a comparison with a named competitor, and pricing; a fixed engine set chosen from ChatGPT search, Perplexity, Gemini, Google AI Mode, Copilot, and Claude; ask signed out; record each answer verbatim with its cited URLs; mention and citation share beside the previous report's, or marked baseline.
  - AI referrals from answer-engine hosts, and visits tagged with those sources, measured per `bkit-audit-analytics`. Unmeasurable → name that audit; do not invent a method here.

  **Done when:** `Answer Engines` holds policy per group, the console control, prompt rows or a skip, and referral status.

- [ ] **Step 7 — Structure:** Indexable public page → URL format (lowercase, hyphenated, stable), click depth from the home page, orphan pages nothing links to, broken internal links, and whether navigation and breadcrumbs reach every public page. Whether the hierarchy works for people → `bkit-audit-usability`; flag it, do not decide it. **Done when:** `Structure` row per check: met / finding, or skip in `Not Checked`.
- [ ] **Step 8 — Trust:** Indexable public page → public pages show who is behind the product and how to reach them: an about or company page, contact, and support, pricing, the privacy policy and terms, and dated, attributed content wherever content is published. `Organization` markup carries `sameAs` links to the store listings and social profiles. Generative-AI guides put unique, non-commodity content ahead of other suggestions → flag pages that only restate what is available elsewhere. Whether the copy works for people → `bkit-audit-usability`. **Done when:** `Trust` row per required page: present / finding, or skip in `Not Checked`.
- [ ] **Step 9 — Consoles:** Indexable public pages and consoles set up → indexing errors, pages indexed against pages submitted, and the top queries with their change since the previous report. Consoles not set up while indexable pages exist = finding; without them, `Indexing` is the only signal. Search console: the generative-AI performance report, the Core Web Vitals report (speed itself → `bkit-audit-app-performance`), and page-indexing reasons per page type (soft 404, duplicate without user-selected canonical, crawled but not indexed). Other webmaster console: its AI-performance report (citations, grounding queries, cited pages) with the change since the previous report. IndexNow: public URL additions, updates, and deletions are submitted, and the webmaster console shows them as received. **Done when:** `Consoles` row per report: figure · delta · verdict, the missing-console finding, or skip in `Not Checked`.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor standard and per search-documentation or AI-crawler change since the previous report → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching public pages and how they are crawled (public routes, `robots.txt`, the sitemap, page metadata, structured data, locale routing, redirects, and middleware, firewall or bot settings) → one-line verdict each. (b) Bounded ~30 min pass: what a senior technical SEO flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows, log-audit output from `bkit-audit-logs`, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, whether any indexable public page exists, and the production host.
- [ ] **Series:** mention and citation share, and console query deltas, beside the previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
