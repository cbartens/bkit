<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# AIO SEO Audit

> [!CAUTION]
> **Purpose:** Whether search engines and answer engines can find, read and correctly describe public pages.
>
> **Rules:**
>
> - Do not change search-console, webmaster, robots, sitemap, IndexNow or firewall settings.
> - Record the owner's decision on the AI-crawler policy in `robots.txt` and on the search-console control for generative answers.
> - Name each personal-data field and its page for `bkit-audit-privacy`.
> - NEVER copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

Search engines and answer engines read the same public pages. The failure this audit targets is a silent indexing fault that stops traffic while the site still works. Examples: `noindex` leaking from preview config, a canonical pointing at a preview URL, or a sitemap listing login-gated pages.

Search engines rank pages, and answer engines quote facts, so plain factual copy matters. An engine that ignores `llms.txt` still shares one index with its AI answers, so the indexing basics cover both.

**Applies when:** there is a web origin crawlers can request. **If** there is none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when routing, locales or the public site change.

**Anchor Standards:**

- Search essentials and the search-documentation updates log (e.g. Google Search Essentials, Bing Webmaster Guidelines). Record the date of the newest entry read.
- The engine's AI-features and generative-AI optimisation guides (e.g. Google's AI features and your website). Record each page's last-updated date.
- Search-console help, including the control for generative answers (e.g. Search Console Help). Record the date read.
- Index submission protocol (e.g. IndexNow). Record the date read.
- The structured-data vocabulary release and the engine's supported-type list (e.g. schema.org, Google's structured-data gallery). Record the release number and the date read.
- Robots Exclusion Protocol (e.g. RFC 9309).
- Each AI vendor's crawler documentation (e.g. OpenAI, Anthropic, Perplexity, Apple, Google's common crawlers). Record each page's date, or the date read.
- Core Web Vitals, owned by `bkit-audit-app-performance`. This audit reads only what the search console reports.

### Scope

- Separate public URLs from previews, and check that previews are not indexable.
- Check crawling and indexing: robots, sitemap, canonicals, locales, status codes, and the HTML with and without JavaScript.
- Check metadata, structured data and the plain answers that answer engines quote.
- Check the AI crawler policy, the firewall's agreement with it, and how engines respond when asked.
- Check site structure, trust pages and search-console reports.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Page speed; Core Web Vitals beyond the search console's report | The speed sweep owns them | `bkit-audit-app-performance` |
| Heading order, alt text, contrast | The accessibility sweep owns them | `bkit-audit-accessibility` |
| Whether structure or copy works for people | The usability sweep owns it | `bkit-audit-usability` |
| Personal data on a public page | The privacy sweep owns it | `bkit-audit-privacy` |
| The screen a search-to-app link opens | The store sweep owns it | `bkit-audit-app-store` |
| How AI referral traffic is measured | The tracking sweep owns it | `bkit-audit-analytics` |
| A doc that describes the site wrongly | The documentation sweep owns it | `bkit-audit-documentation` |
| Applying fixes; changing robots, consoles or the firewall | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Live Fetch:** Steps 2-9 — request public URLs, headers and HTML (e.g., `curl`, a browser). Fallback: read the source, and treat live claims as hypotheses.
- [ ] **Web:** Step 10 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Search Consoles:** **If** there are indexable public pages → Step 9 (e.g., Google Search Console, Bing Webmaster Tools). Fallback: none. **If** consoles are missing while indexable pages exist → that is a finding.
- [ ] **Edge Logs:** **If** there is a bot firewall or CDN → Step 6 — the status codes it returns to crawlers (e.g., Vercel Firewall, Cloudflare). Fallback: read `robots.txt` only, and mark the log rows `Not Checked`.
- [ ] **Schema Validators:** **If** structured data is present → Step 5 — a rich-results test and a schema.org validator (e.g., Google Rich Results Test, Schema Markup Validator). Fallback: read the required properties from the engine's docs.
- [ ] **Answer Engines:** **If** there are indexable public pages → Step 6 — signed-out prompts (e.g., ChatGPT search, Perplexity, Gemini, Google AI Mode, Copilot, Claude). Fallback: check the page text only, and mark the prompt rows `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Public URLs:** List the public URLs from the sitemap. **If** there is no sitemap → crawl from the home page. Record the production host and the tools available in `Checked`. Check first that no preview deployment is indexable (`X-Robots-Tag: noindex`, or the host's deployment protection), because a crawled preview competes with production and can expose unreleased pages. **If** the marketing site lives outside the repo → name where, and audit it from the live URL. **If** there is no web origin → write `N/A`, then **STOP**. **If** there is no indexable page → say so. `Indexing` still runs, and the steps that need an indexable page skip with evidence in `Not Checked`. **Done when:** `Public URLs` holds the host, the URL list and the preview verdict.
- [ ] **Step 3 — Indexing:** Check that `robots.txt` and the sitemap are present and valid. Check that the sitemap lists public URLs only. Check that `lastmod` changes only when that page's content changes. Engines trust it only when it is consistently accurate. Check that the sitemap is submitted in each webmaster console. Check the robots meta tag and `X-Robots-Tag` per page type: auth pages and previews are `noindex`, and public pages are indexable. Check that no `noindex` page is also `Disallow`ed, because a blocked crawler never sees the `noindex`, so the URL can stay indexed from links. Check that each canonical is absolute, on the production host, and one per page. Check host canonicalisation: `http` → `https`, apex ↔ `www` and the trailing-slash policy each take one hop, HSTS is set, and the sitemap uses the canonical form only. Check status codes: redirect chains are <= 1 hop, there are no loops, and missing pages return 404. Check locales: each variant's `hreflang` points to existing pages; `hreflang="x-default"` is present; each set is reciprocal and includes itself; the canonical stays in the same locale, never another; and no forced `/` redirect by `Accept-Language` or IP exists, because a crawler that sends no `Accept-Language` from one country (e.g., Googlebot) must still see the other locales. Check that content is in the HTML without JavaScript. Compare the rendered HTML for one URL per page type: the no-JavaScript view vs the engine's render after JavaScript (e.g., URL Inspection). **If** the engine indexes the mobile version (e.g., Google) → check that mobile and desktop have the same content. **Done when:** `Indexing` holds one row per check: met / finding / not applicable (saying why).
- [ ] **Step 4 — Metadata:** Run this step only when the project has an indexable public page. Check that the title and description are present, unique and the right length. Check the Open Graph and Twitter card tags, and that their images exist at the right size. Check `lang`, the favicon and the web manifest. **If** the project has store listings → check the Smart App Banner (`apple-itunes-app`), and that `apple-app-site-association` and `assetlinks.json` are reachable, so search opens the app. The screen the link opens goes to `bkit-audit-app-store`. **Done when:** `Metadata` holds one row per page: tag · verdict, or the skip is in `Not Checked`.
- [ ] **Step 5 — Structured Data:** Run this step only when the project has an indexable public page. Check the JSON-LD for each page type: `Organization`, `WebSite`, `SoftwareApplication` or `MobileApplication` with store links, `FAQPage` only where it mirrors on-page Q&A, and `BreadcrumbList` where the site has depth. Validate each block, and check that it matches the visible page, because markup that disagrees with the page is worse than none. Use the engine's rich-results test for supported types and a schema.org validator for the vocabulary. For app types, check the engine's required software-app properties, plus `operatingSystem` and `applicationCategory`. Ratings must come from real on-page user ratings, never self-assigned ones. A missing rich-result type that is retired (listed in `Project Instructions`) is not a finding. Generative answers need no special markup: structured data earns rich results and states facts plainly. **Done when:** `Structured Data` holds one row per block: type · valid · agrees with page · verdict, or the skip is in `Not Checked`.
- [ ] **Step 6 — Answer Engines:**
  - `llms.txt` and `llms-full.txt` are optional. Engines ignore them or use them unevenly, so a missing file is not a finding. **If** one is present → check that it is current and links to existing pages. A stale file is `LOW`.
  - **If** there is an indexable page → check that the plain facts are in the HTML text, not only in images or scripts: product, audience, cost and platforms. Check for a direct Q&A near the top of the page that owns each answer. Check that the product and company use one name across the site, store and social. Check that the off-site description, pricing and platforms match the store, reviews, forums and press, because answer engines often cite those over the product site. List the third-party sources the prompt pass cited.
  - Read the AI crawler policy in `robots.txt` for each crawler group. Allowing and blocking are both fine; a group with no recorded decision is a finding. The owner decides, and the report records the decision. Blocking one group does not block the others. Training crawlers: GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot. Search crawlers: OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot (which feeds some assistants); blocking one keeps the site out of those answers. User-triggered crawlers: ChatGPT-User, Claude-User, Perplexity-User; some vendors say these may not follow `robots.txt`. "Block training, allow search" is common. Write the policy per group.
  - Check that the edge or firewall and any CDN "block AI bots" setting agree with `robots.txt`. A firewall `403` to an allowed search crawler silently overrides `robots.txt`. Check the edge or server logs for each search crawler's requests and status codes, not `robots.txt` alone.
  - Read the search-console control for including or excluding pages from generative answers. The owner decides, and the report records the decision. The control does not govern training.
  - **If** there is an indexable page → ask the same questions of the same answer engines. Record the date, each answer and its citations. Answers drift daily, so treat them as a signal, not a test. A wrong answer is a finding about these pages, not about the engine. Keep the pass repeatable: fixed prompts (brand, category, comparison with a named competitor, pricing); a fixed engine set from ChatGPT search, Perplexity, Gemini, Google AI Mode, Copilot and Claude; signed out; verbatim answers and cited URLs; and the mention and citation share against the previous report or the baseline.
  - Read AI referrals from answer-engine hosts and tagged visits as `bkit-audit-analytics` defines them. **If** referrals cannot be measured → name that audit, and do not invent a method here.

  **Done when:** `Answer Engines` holds the policy per group, the console control, the prompt rows or a skip, and the referral status.

- [ ] **Step 7 — Structure:** Run this step only when the project has an indexable public page. Check the URL format (lowercase, hyphenated, stable), the click depth from home, orphan pages, broken internal links, and that navigation and breadcrumbs reach every public page. Whether the hierarchy works for people goes to `bkit-audit-usability`: flag it, and do not decide it. **Done when:** `Structure` holds one row per check: met / finding, or the skip is in `Not Checked`.
- [ ] **Step 8 — Trust:** Run this step only when the project has an indexable public page. Check for the about or company, contact, support, pricing, privacy and terms pages, and for dated, attributed content where the site publishes any. Check that `Organization` `sameAs` points to the store and social profiles. The generative-AI guides put unique, non-commodity content first, so flag pages that only restate what exists elsewhere. Copy for people goes to `bkit-audit-usability`. **Done when:** `Trust` holds one row per required page: present / finding, or the skip is in `Not Checked`.
- [ ] **Step 9 — Consoles:** **If** there are indexable pages **and** consoles → read the indexing errors, indexed vs submitted, and the top queries with their delta against the previous report. **If** consoles are missing while indexable pages exist → that is a finding, and `Indexing` is the only signal. In the search console, read generative-AI performance, Core Web Vitals (speed goes to `bkit-audit-app-performance`) and the page-indexing reasons per type (soft 404, duplicate without user-selected canonical, crawled but not indexed). In other webmaster consoles, read AI performance (citations, grounding queries, cited pages) and its delta. For IndexNow, check that public URL additions, updates and deletions are submitted, and that the webmaster console shows them received. **Done when:** `Consoles` holds one row per report: figure · delta · verdict, or the missing-console finding, or the skip is in `Not Checked`.
- [ ] **Step 10 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per anchor and one per search-documentation or AI-crawler change since the previous report, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches public pages or the crawl surface: routes, `robots.txt`, the sitemap, metadata, structured data, locale routing, redirects, middleware, or firewall and bot settings. (b) In a bounded pass of about 30 minutes, note what a senior technical SEO would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows, `bkit-audit-logs` output, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Settings untouched:** no search-console, webmaster, robots, sitemap, IndexNow or firewall setting changed.
- [ ] **No values:** no personal-data value appears anywhere in the report.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | An indexed preview or signed-in page exposes personal or unreleased data. The production canonical points at a host that serves the wrong site, and there is no workaround |
| `HIGH` | Production is removed from search. A page that should not be indexed is indexed (auth, preview, signed-in), or an indexable page is `noindex`. `noindex` is combined with `Disallow`, so the URL can stay indexed. The firewall blocks a search crawler that the recorded policy allows |
| `MEDIUM` | Wrong or missing metadata. Structured data that disagrees with the page. A canonical, `hreflang` or redirect defect. Consoles absent while indexable pages exist. An answer engine states a wrong fact taken from these pages. An off-site listing disagrees with the site |
| `LOW` | A stale `llms.txt`. Naming drift that does not change which page is indexed. A missing `llms.txt`, or a missing retired rich-result type, is not a finding |

Within a severity, list indexing findings first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, whether any indexable public page exists, and the production host.
- [ ] **Series:** the report shows mention and citation share, and console query deltas, beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
