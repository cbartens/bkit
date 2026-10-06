<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Dead Code Audit

> [!CAUTION]
> **Purpose:** Reachability of code, config, routes, events, schema, and assets — what looks live and never runs.
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
> - NEVER delete code, files, routes, schema objects, or dependencies. The report names the destination; applying it is the next step.
> - A detector proves use, never absence. Dead only when every method that would have found a use found none, and the file was opened. NEVER write a finding from tool output alone.

## Universal Instructions

### Context & Goals

Dead code here is a control that looks live and is not: a limiter gated on an env var nobody sets, an end-to-end assertion against a test id no component renders, a config key calling an API its pinned dependency removed. Target failure: **a control that reads as live in review and never executes**.

**Applies when:** application source, config, or a package manifest. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when a cycle deletes a feature or moves a package.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Reachability scanner, version run, including production mode, workspaces, and issue types (e.g. knip, ts-prune, vulture).
- Compiler unused and unreachable options (e.g. TypeScript `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode`; Ruff `F401`, `F841`).
- Always-true / always-false condition lint (e.g. typescript-eslint `no-unnecessary-condition`).
- Unused-index advisor (e.g. Supabase Splinter `0005_unused_index`, engine index stats).
- Database inspection CLI (e.g. `supabase inspect db`); record CLI version.
- Feature-flag cleanup (e.g. Uber Piranha).
- Runtime-usage dead-code removal (e.g. Meta SCARF).
- i18n key checkers (e.g. `i18n-check`).

### Scope

- In-function unused locals, parameters, unreachable code, and always-true or always-false conditions.
- Module reachability: files, exports, types, duplicates; default run beside production mode.
- Dependency reachability as its own pass: unused, unlisted, unresolved, binaries, catalog entries.
- Env-var reachability: referenced against declared; gates.
- Feature flags, config keys nothing reads, values always overridden.
- Assertion surface (test ids), route surface (forwarders and stale pointers), client fetches with no route.
- Schema objects nothing reaches.
- Events, background functions, and crons, both ends.
- i18n keys, static assets, and scripts.
- Runtime executions, kept separate from static references.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Module-graph shape | Architecture sweep | `bkit-audit-architecture` |
| Git state, working-tree leftovers, layout | Repo sweep | `bkit-audit-repo` |
| Config that is read but disagrees across environments or with its dashboard | Config sweep | `bkit-audit-config` |
| Unused indexes as capacity | Database sweep | `bkit-audit-database` |
| An unlisted dependency, or one with an advisory, beyond naming it | Dependency sweep | `bkit-audit-dependencies` |
| An i18n key read but missing from the catalogue, as copy | Usability sweep | `bkit-audit-usability` |
| A detector switched off, as a gate change | Gates sweep | `bkit-audit-gates` |
| Wiring a reachability scanner into CI | Gate change | `bkit-audit-gates` |
| Deleting code, files, routes, schema, or dependencies | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Clean Tree:** Steps 2–17 — `git status` clean at the recorded commit; one checkout for every step. Fallback: detached worktree off the integration branch; candidates touching a dirty path = hypotheses.
- [ ] **Text Search:** Steps 5–14 — repo search, e.g. `git grep`, ripgrep. Fallback: none; those steps `Not Checked`.
- [ ] **Reachability Scanner:** Steps 3–4 — ad hoc, not a committed dependency, e.g. `pnpm dlx knip`, vulture. Fallback: language-server references and text search; scanner categories `Not Checked`.
- [ ] **Web:** Step 16 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Compiler Unused Checks:** Compiled language → Step 2 — resolved compiler and linter config, not the base file. Fallback: `Detectors` `Not Checked`.
- [ ] **Language Server:** Typed language → Steps 13–14 — references, e.g. Serena, `tsserver`, pyright. Fallback: text search only; name it; re-run every empty result before recording dead.
- [ ] **Git History:** Flags or introduction dates → Step 6 — `git log -S`. Fallback: flag ages `Not Checked`.
- [ ] **E2E Locators:** End-to-end tests assert test ids → Step 7. Fallback: skip with evidence; `Assertions` = `N/A`.
- [ ] **Hosted DB:** SQL migrations or a hosted database → Step 10 — inspection CLI and unused-index advisor, e.g. `supabase inspect db`, Splinter `0005_unused_index`. Fallback: static grep only; runtime zero-use `Not Checked`.
- [ ] **Runtime Counts:** Production request, job, or query stats → Step 15 — e.g. host per-route counts, job-runner run counts, `pg_stat_statements`. Fallback: static only; "zero executions" `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detectors:** Compiled language → the scanner sees module exports only, so a dead branch or parameter inside a live function belongs to the compiler and the linter. Read the resolved config per workspace, not the base file: every compiler config sets unused-local, unused-parameter, and no-unreachable-code; the linter enables unused-vars, unreachable, and always-true / always-false conditions (e.g. `@typescript-eslint/no-unnecessary-condition`). A workspace override or a file-level disable switches one off silently. A detector that is off = finding. Destination: `bkit-audit-gates`, as a gate candidate. **Done when:** `Detectors` lists each config and the value it resolves to.
- [ ] **Step 3 — Reachability:** Ad hoc scanner, same resolved version for both runs; record the version. Do NOT add it as a dependency, and do NOT wire a CI gate this run. Report whether a baseline config is ready. A gate before the `False Positives` exclusions are encoded fails on structural noise and gets disabled. Do not encode test-only code as ignore entries or negated project patterns: plugins add test files as entries. Production mode is how they are separated. Check scanner stderr before trusting output: a plugin that fails to load drops a whole entry class and turns every file it would have reached into a false unused file. Categories that carry signal: files, exports, types, duplicates. Dependency categories are a separate pass (`Dependencies`), not mixed in. Then the same version in production mode (or strict mode, which implies it and also checks each workspace uses only its own dependencies). An export the default run calls used and the production run calls unused is reached only from tests or config — the test-only class, found by the tool. Report the two runs side by side. **Done when:** version, both runs, and plugin-load errors in `Reachability`.
- [ ] **Step 4 — Dependencies:** Scanner dependency mode per workspace: unused, unlisted, unresolved, unlisted binaries, and catalog entries nothing references. Before believing a candidate unused, search its name across manifest scripts, config files, and CI. Packages consumed only by config (linter, formatter, CSS, language presets, bundler plugins, `@types/*`) are the usual false hits. An unused dependency is install-time and supply-chain surface. An unlisted one works only because another workspace hoists it. Unlisted, or one with an advisory → destination `bkit-audit-dependencies`. **Done when:** `Dependencies` row per candidate: name · class · config-or-CI reader · verdict.
- [ ] **Step 5 — Env Vars:** This stays a text search. Env names are string literals; a language server cannot see them. Every referenced env var against everything declared (examples, task runner, typed env schema — sources named in `Project Instructions`). Referenced and never declared is a candidate for a control that cannot switch on. Triage: platform-injected = fine; optional with a safe default = fine, but read the default; gates a control (absence disables a limiter, an auth check, or a feature) = finding. A var in the third group means that path has never executed in any environment. A declaration source the list omits = gap in `Process Improvements`. Destination for a gating var: `docs/failures.jsonl` via `@bkit-utility-update-failures`, and `bkit-audit-duplication`. **Done when:** `Env Vars` row per referenced-undeclared name: group · what the absence does · verdict.
- [ ] **Step 6 — Config:** Same deadness, no scanner reports it. (a) Feature flags stuck on or off. A flag hardcoded, or set the same in every environment, leaves a branch that never runs. Per flag: every read and the value in each environment. Every environment the same value → the other branch is dead = finding. Then age every flag (`git log -S`); older than 90 days with the rollout complete = finding even when environments still differ. A finished rollout leaves the old branch. That is the class flag-cleanup tools exist to remove. (b) Config keys with no reader, or that name something that no longer exists. Search the key; a language server reads typed source only. (c) A default a later layer replaces in every environment is documentation that lies. Route a dead control as `Env Vars` does: `docs/failures.jsonl`, not tidiness. **Done when:** `Config` row per flag and per unread key: value per environment · age · verdict.
- [ ] **Step 7 — Assertions:** E2E asserts test ids → an unmatched locator is a passing assertion, so a test id no component renders makes a spec vacuous while CI stays green. Extract ids asserted in end-to-end tests and diff them against ids components render. Both sides are string literals. **Done when:** `Assertions` lists asserted-but-unrendered ids, or `none`.
- [ ] **Step 8 — Routes:** Two checks; the second is where the defects are. (a) Forwarders. A route whose page only redirects renders nothing: no content, an extra round trip, and it reads in every route list as a page. Use the project's derived list, do not eyeball the tree. The usual justification is that old bookmarked or emailed links must keep working — check that claim against the deployment doc before accepting it. (b) What still points at a forwarder, or at a path that moved. Grep the old path, not the new one. Stale `revalidatePath` / `revalidateTag` / cache-trigger refreshes the stub; the page a user reads is never invalidated. Stale end-to-end helpers drive every spec through the redirect. A middleware allowlist arm that can no longer match reads as a live carve-out. A deep-link or email builder whose redirect drops a query param loses the token or id silently. A doc comment naming the old directory is free to fix, and it makes the next reader mistrust every other comment in the file. Relative imports hide the dependency: a repo-wide grep for the path string misses `./old/page`. After a route delete, run the typecheck before believing a grep was complete. Stale generated route types are build output: remove them and re-run, do not read them as source errors. A test that pins the call argument (`toHaveBeenCalledWith` the path) cannot tell a live pointer from a dead one. "A test covers it" is no evidence in this step. **Done when:** `Routes` row per forwarder and per stale pointer: kind · `file:line` · verdict.
- [ ] **Step 9 — Fetches:** Clients call API paths with raw fetch → the mirror of `Routes`. Route-side asks whether a route has a caller. This asks whether a call has a route. Neither finds the other's class. Compiler-checked RPC clients are out of scope (a missing route fails typecheck). Raw fetch is the whole exposure: a URL inside a template literal, so lint, typecheck, and the reachability scanner all pass on a path that 404s. Model both routing layers. The outer framework decides whether a handler runs (static directory vs catch-all that forwards a subtree). The inner router then routes within what was forwarded. A route correctly mounted on the inner router and unreachable from the outer layer is its own class (`stranded`). Checking either layer alone says the route is fine. Read a finding as two questions: the path has no handler, and why nobody noticed. The answer is at the call site — `if (res.ok)` skips the block, `if (!res.ok) return success` fails open. A 404 is a successful HTTP response, so nothing throws. The report names the guard and the route. Confirm against the deployment (status code of the path beside a known-live path) before writing it up. Two false positives, do not reintroduce them: a path in a doc comment is not a call; a prefix test (`startsWith`) is not a request. The dangerous failure is silent: an extractor that stops at `?` never reports the URL, so it is not seen. When changing extraction, the fetched-path count must go up, not merely the findings list get shorter. No project script → extract literals and match routes by hand; record the gap in `Process Improvements`. **Done when:** `Fetches` row per unreachable call and per stranded route: path · call-site guard · deployment status · verdict.
- [ ] **Step 10 — Schema:** SQL migrations or a hosted DB → no other step looks here. An unused column or an orphaned SQL function still costs migrations and access review. From generated database types and migrations: per table, column, view, SQL function, and row-level policy, search code (table-name calls, column lists, RPC names), other SQL (triggers, policies, functions), and deployed edge functions. Zero references in all three = candidate. Runtime, on the deployed database: a table with no scans and no row writes since the last stats reset (record the reset time); inspection-CLI table and index stats; unused-index advisor. Unused indexes also belong to `bkit-audit-database` — name them, do not write the capacity finding twice. Thin or pre-launch traffic → a zero-use object is a candidate for the static check, never proof on its own. **Done when:** `Schema` row per candidate: object · static refs · runtime counts · reset time · verdict.
- [ ] **Step 11 — Events:** Background jobs, crons, or an event bus → the mirror of `Fetches` for background work. Event names are string literals; the scanner and the language server cannot see them. List every send, every registered function with its trigger or cron, and every cron with the route or function it names. Every event sent has a registered function. Every registered function's trigger has a sender or a cron. Every cron names a target that exists. A function with no trigger is dead. An event with no function is a control that cannot fire, routed like `Env Vars`. **Done when:** `Events` row per name: sender · function · cron target · verdict.
- [ ] **Step 12 — Strings:** (a) Message catalogue → diff catalogue keys against keys read in each app and shared UI, both ways, with a key checker or a search script. A key with no reader is dead. A key read but missing renders its own name. A language server is often blind to the catalogue; this stays search. Missing-from-catalogue destination: `bkit-audit-usability`. (b) Static assets. List shipped asset files, including email-template assets, and search each basename across code, config, and CSS. The scanner does not check assets; a native bundle ships every unused one. (c) Scripts. Per manifest script and per file under the scripts tree, search the name across CI, hooks, the task runner, docs, and other scripts. Nothing invokes it = candidate. Only a doc names it = candidate with a reader to update. **Done when:** `Strings` row per unused key, missing key, unread asset, and uninvoked script.
- [ ] **Step 13 — False Positives:** Filter these before reading anything as a finding. They are structural and recur every run. Ambient module augmentation: zero importers by design; applied through the compiler include. Never dead. Platform file splits: one specifier resolves to a per-platform file the scanner cannot follow, so unresolved entries are noise. The filter hides the opposite, so check once per run: for each platform pair, the platform that would load that variant imports the parent. A single-platform component carrying the other platform's file is dead and invisible, because both resolve through the same specifier. Files referenced from config, not code: check the referencing config before believing unused (app config, CI, test-runner project dependencies, agent hooks, deployed functions, an explicit worker registry). Test-only exports: only importer is a test = a seam, not dead code. Report separately from unreferenced code; never delete. A default export a preview server requires while code imports the named one. Mock-factory keys: no scanner and no language server sees them; a key inside a mock factory is a real use. **Done when:** `Candidates` names each class and what it removed.
- [ ] **Step 14 — Eliminate:** Language server before opening files. One reference found means the candidate is not dead, and that verdict is sound even though the converse is not. Per surviving unused-export candidate: find the symbol, then find references. Any hit ends it. Empty → fall through to text search, and re-run the empty language-server query once more before recording it. Record both measurements. Pace reference queries: back-to-back calls collapse to zero, and a partial answer looks exactly like a dead symbol. Empty is inconclusive, not absence. Text search over-reports (comments, same-named symbols in other modules); the language server under-reports. Agreement is the signal. Run search in addition to the language server, never instead of it. An unused export needs zero matches repo-wide other than its own definition: search, subtract the defining file, ignore prose comments. An unused file is not reached from JSON, YAML, or other config no typed tool reads. An env-var finding is a control, not an optional setting with a working default. A test id asserted in end-to-end tests exists on a component. No finding without opening the file. Cite `file:line` and the method. Non-typed surfaces (markdown, ledgers, YAML, SQL, shell, string literals) are search, not the language server. **Done when:** every survivor in `Candidates` has `file:line`, method, and the zero-reference re-run.
- [ ] **Step 15 — Runtime:** Production request, job, or query stats exist → static analysis says nothing references a symbol; production says whether it ran. Rank survivors with a recent window of per-route request counts or logs, per-function job runs, and query stats for SQL functions. "Zero executions" is its own class, separate from "zero static references". Thin or pre-launch traffic → a signal, never proof. A route nobody has called yet is not dead. **Done when:** `Runtime` holds the window, the source, and zero-execution rows, or the skip.
- [ ] **Step 16 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor standard and per scanner issue type → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 17 — Anything Else:** (a) Everything changed since previous report's commit touching reachability (deleted or moved features and packages, new exports and files, dependencies, env vars and feature flags, routes, and fetch URLs, events, functions, and crons, migrations, i18n keys, assets, manifest scripts) → one-line verdict each. (b) Bounded ~30 min pass: what a senior engineer who owns code health flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows, log-audit reports under `bkit-audit-logs`, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Candidates eliminated:** every survivor opened the file; a method that found a use ended it; every zero-reference result was re-run and both measurements are recorded.
- [ ] **Tree untouched:** no code, config, schema, or dependency change.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Dead control on auth, a limiter, or validation (the path never executes); client fetch whose error path treats failure as success, so the missing route never surfaces |
| `HIGH` | User-facing or background path with no handler, or a handler nothing can reach; end-to-end assertion that passes because the target does not exist; event or cron with one end missing |
| `MEDIUM` | File or export with zero references after elimination; feature flag older than 90 days with rollout complete; unused or unlisted dependency; i18n key with no reader, or a reader missing from the catalogue |
| `LOW` | Doc comment naming a moved path; test-only export (own class, never a delete); preview-only default export |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: dead controls first.

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

### Detectors

PENDING

### Reachability

PENDING

### Dependencies

PENDING

### Env Vars

PENDING

### Config

PENDING

### Assertions

PENDING

### Routes

PENDING

### Fetches

PENDING

### Schema

PENDING

### Events

PENDING

### Strings

PENDING

### Candidates

PENDING

### Runtime

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
- [ ] **Summary:** names count per severity and candidate / surviving counts.
- [ ] **Series:** `Reachability` counts and `Runtime` zeroes beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
