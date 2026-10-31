<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Dead Code Audit

> [!CAUTION]
> **Purpose:** The reachability of code, config, routes, events, schema and assets: what looks live and never runs.
>
> **Rules:**
>
> - NEVER delete code, files, routes, schema objects or dependencies. Name the destination in the report, and leave applying it to the next step.
> - A detector proves use, never absence. Call a candidate dead only when every method that would have found a use found none, and the file was opened.
> - Never write a finding from tool output alone.

## Universal Instructions

### Context & Goals

Dead code is a control that looks live and is not. Examples: a limiter on an env var that is never set, an E2E assertion on a test id that no component renders, or a config key that calls an API the pinned dependency removed. The failure this audit targets is a control that reads as live in review and never executes.

**Applies when:** the project has application source, config or a package manifest. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when a cycle deletes a feature or moves a package.

**Anchor Standards:**

- Reachability scanner, version run, including production mode, workspaces, and issue types (e.g., knip, ts-prune, vulture).
- Compiler unused and unreachable options (e.g., TypeScript `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode`; Ruff `F401`, `F841`).
- Always-true / always-false condition lint (e.g., typescript-eslint `no-unnecessary-condition`).
- Unused-index advisor (e.g., Supabase Splinter `0005_unused_index`, engine index stats).
- Database inspection CLI (e.g., `supabase inspect db`); record CLI version.
- Feature-flag cleanup (e.g., Uber Piranha).
- Runtime-usage dead-code removal (e.g., Meta SCARF).
- i18n key checkers (e.g., `i18n-check`).

### Scope

- Find in-function unused locals and parameters, unreachable code, and always-true or always-false conditions.
- Check module reachability (files, exports, types and duplicates), with the default run beside a production-mode run.
- Check dependency reachability in its own pass: unused, unlisted and unresolved dependencies, binaries, and version-catalog entries.
- Check env-var reachability: referenced vars against declared ones, and the vars that gate a control.
- Find feature flags, config keys that nothing reads, and values that are always overridden.
- Check the assertion surface (test ids), the route surface (forwarders, stale pointers), and client fetches with no route.
- Find schema objects that nothing reaches.
- Check both ends of events, background functions and crons.
- Check i18n keys, static assets and scripts.
- Measure runtime executions separately from static references.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Module-graph shape | The architecture sweep covers it | `bkit-audit-architecture` |
| Git state, working-tree leftovers, layout | The repo sweep covers it | `bkit-audit-repo` |
| Config that is read but disagrees across environments or with its dashboard | The config sweep covers it | `bkit-audit-config` |
| Unused indexes as capacity | The database sweep covers it | `bkit-audit-database` |
| An unlisted dependency, or one with an advisory, beyond naming it | The dependency sweep covers it | `bkit-audit-dependencies` |
| An i18n key read but missing from the catalogue, as copy | The usability sweep covers it | `bkit-audit-usability` |
| A detector switched off, as a gate change | The gates sweep covers it | `bkit-audit-gates` |
| Wiring a reachability scanner into CI | It is a gate change | `bkit-audit-gates` |
| Deleting code, files, routes, schema, or dependencies | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Clean Tree:** Steps 2-17 — a clean `git status` at the recorded commit, with one checkout for every step. Fallback: use a detached worktree off the integration branch, and treat candidates on dirty paths as hypotheses.
- [ ] **Text Search:** Steps 5-14 — repo search (`git grep`, ripgrep). Fallback: none. Mark those steps `Not Checked`.
- [ ] **Reachability Scanner:** Steps 3-4 — an ad hoc scanner, not a committed dependency (e.g., `pnpm dlx knip`, vulture). Fallback: use language-server references and text search, and mark the scanner categories `Not Checked`.
- [ ] **Web:** Step 16 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Compiler Unused Checks:** **If** the language is compiled → Step 2 — the resolved compiler and linter config, not the base file. Fallback: mark `Detectors` `Not Checked`.
- [ ] **Language Server:** **If** the language is typed → Steps 13-14 — references (Serena, `tsserver`, pyright). Fallback: text search only. Name it, and re-run every empty result before recording a candidate as dead.
- [ ] **Git History:** **If** the run needs flag ages or introduction dates → Step 6 — `git log -S`. Fallback: mark flag ages `Not Checked`.
- [ ] **E2E Locators:** **If** E2E tests assert test ids → Step 7. Fallback: skip the step with evidence, and set `Assertions` to `N/A`.
- [ ] **Hosted DB:** **If** the project has SQL migrations or a hosted DB → Step 10 — the inspection CLI and the unused-index advisor (e.g., `supabase inspect db`, Splinter `0005_unused_index`). Fallback: static grep only. Mark runtime zero-use `Not Checked`.
- [ ] **Runtime Counts:** **If** production request, job or query stats exist → Step 15 — e.g., host per-route counts, job-runner runs, `pg_stat_statements`. Fallback: static checks only. Mark "zero executions" `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detectors:** **If** the language is compiled → the scanner sees module exports only, so a dead branch or parameter inside a live function needs the compiler and the linter. Read the resolved config of each workspace, not the base file: the compiler's unused-local, unused-parameter and no-unreachable-code options, and the linter's unused-vars, unreachable and always-true / always-false rules (e.g., `@typescript-eslint/no-unnecessary-condition`). A workspace override or a file-level disable switches one off silently. **If** a detector is off → record a finding, and name it for `bkit-audit-gates` as a gate candidate. **If** the linter cannot run on the project's compiler version (e.g., its peer dependency range excludes that version) → record the same detector-off finding, and mark its rules `Not Checked`. **Done when:** `Detectors` lists each config and its resolved value.
- [ ] **Step 3 — Reachability:** Run the scanner ad hoc, at the same resolved version for both runs, and record the version.
  - Do not add it as a dependency, and do not wire a CI gate this run.
  - Report how ready a baseline config is. The first readiness check is that the scanner ignores exports used inside their own file (e.g., knip `ignoreExportsUsedInFile`). Without that setting the export signal is noise, so run with it and without it, and report both counts. A gate wired before the `False Positives` exclusions are encoded fails on structural noise, and gets disabled.
  - Do not encode test-only code as ignore entries or negated project patterns: plugins add test files as entries, and production mode separates them.
  - Check the scanner's stderr before trusting its output, because a plugin that fails to load drops a whole class of entries and produces false unused files. The signal is files, exports, types and duplicates. Dependency categories go to the `Dependencies` pass, not mixed in here.
  - Run the same version in production mode (or strict mode, which implies production mode and has each workspace use only its own dependencies).
  - **If** an export is used in the default run **and** unused in the production run → it belongs to the test-only or config-only class.
  - Report both runs side by side.
  - **If** the scanner has no class-member check (e.g., knip 6 has no `classMembers` issue type) **and** the project has classes → record the gap in `Not Checked`, and fall back to language-server references for each public member.

  **Done when:** `Reachability` holds the version, both runs, the counts with and without in-file use, and the plugin-load errors.

- [ ] **Step 4 — Dependencies:** Run the scanner's dependency mode for each workspace, in the categories the scanner offers (e.g., knip: unused, unlisted, unresolved, unlisted binaries, unreferenced catalog entries). Before giving an unused verdict, search for the name across manifest scripts, config and CI. Config-only consumers are the usual false hits (e.g., linter, formatter, CSS presets, bundler plugins, `@types/*`). An unused dependency is install and supply-chain surface. An unlisted one is hoisted from another workspace. **If** a dependency is unlisted **or** has an advisory → name it for `bkit-audit-dependencies`. **Done when:** `Dependencies` holds one row per candidate: name · class · config-or-CI reader · verdict.
- [ ] **Step 5 — Env Vars:** Use text search only, because env names are string literals that a language server cannot see. Compare every referenced env var with the declared ones (examples, task runner, typed env schema; the sources are in `Project Instructions`). A var that is referenced and never declared is a control that cannot switch on. Triage each one: a platform-injected var is fine, and an optional var with a safe default is fine (read the default). A var that gates a control, whose absence disables a limiter, auth or a feature, is a finding. The third group is a path that never executes in any environment. **If** a declaration source was omitted → record the gap in `Process Improvements`. **If** a var gates a control → route it to `docs/failures.jsonl` through `@bkit-utility-update-failures`, and to `bkit-audit-duplication`. **Done when:** `Env Vars` holds one row per referenced-but-undeclared var: group · effect of its absence · verdict.
- [ ] **Step 6 — Config:** Look for the deadness that no scanner reports. (a) Feature flags stuck on or off: a flag that is hardcoded, or the same in every environment, leaves a branch that never runs. For each flag, record every read and its value in each environment. **If** the values are all the same → the other branch is dead, and that is a finding. Age each flag with `git log -S`. **If** a flag is older than 90 days **and** its rollout is complete → record a finding even when the environments differ. (b) Config keys with no reader, or whose name points at a removed object: search for the key, because a language server reads typed source only. (c) A default that a later layer replaces in every environment makes the docs lie. Route a dead control to `docs/failures.jsonl` as in `Env Vars`, not as tidiness. **Done when:** `Config` holds one row per flag or unread key: value per environment · age · verdict.
- [ ] **Step 7 — Assertions:** **If** E2E tests assert test ids → an unmatched locator passes, so a test id that no component renders makes a vacuous spec with green CI. Extract the test ids the E2E tests assert and the ids that components render (both are string literals), and compare them. **Done when:** `Assertions` lists the asserted-but-unrendered ids, or `none`.
- [ ] **Step 8 — Routes:** Run two checks; the second is where the defects are.
  - (a) Forwarders. A route whose page only redirects renders nothing: it has no content, adds a round trip, and reads in every route list as a page.
    - Use the project's derived route list rather than eyeballing the tree.
    - The usual justification is that old bookmarked or emailed links must keep working, so check that claim against the deployment doc before accepting it.
  - (b) What still points at a forwarder, or at a path that moved.
    - Grep for the old path, not the new one.
    - A stale cache-invalidation call (e.g., Next.js `revalidatePath` / `revalidateTag`) refreshes the stub, so the page a user reads is never invalidated.
    - Stale end-to-end helpers drive every spec through the redirect.
    - A middleware allowlist arm that can no longer match reads as a live carve-out.
    - A deep-link or email builder whose redirect drops a query param loses the token or id silently.
    - A doc comment naming the old directory is free to fix, and it makes the next reader mistrust every other comment in the file.
    - Relative imports hide the dependency: a repo-wide grep for the path string misses `./old/page`.
  - After a route delete, run the typecheck before believing a grep was complete.
  - Stale generated route types are build output: remove them and re-run, rather than reading them as source errors.
  - A test that pins the call argument (`toHaveBeenCalledWith` the path) cannot tell a live pointer from a dead one, so "a test covers it" is no evidence in this step.

  **Done when:** `Routes` holds one row per forwarder and per stale pointer: kind · `file:line` · verdict.

- [ ] **Step 9 — Fetches:** **If** clients call API paths with raw fetch → run the mirror of `Routes`.
  - The route side asks whether a route has a caller, and this step asks whether a call has a route. Neither finds the other's class.
  - Compiler-checked RPC clients are out of scope, because a missing route fails the typecheck.
  - Raw fetch is the whole exposure: the URL sits inside a template literal, so lint, typecheck and the reachability scanner all pass on a path that returns 404.
  - **If** the stack has two routing layers → model both.
    - The outer framework decides whether a handler runs (a static directory, or a catch-all that forwards a subtree), and the inner router then routes within what was forwarded.
    - A route correctly mounted on the inner router and unreachable from the outer layer is its own class (`stranded`). Checking either layer alone says the route is fine.
  - Read each finding as two questions: the path has no handler, and why nobody noticed. The answer is at the call site: `if (res.ok)` skips the block, and `if (!res.ok) return success` fails open. A 404 is a successful HTTP response, so nothing throws.
  - Name the guard and the route in the report.
  - Before writing a finding up, confirm it against the deployment: the status code of the path beside a known-live path.
  - Do not reintroduce two false positives: a path in a doc comment is not a call, and a prefix test (`startsWith`) is not a request.
  - When you change the extraction, the fetched-path count must go up, not only the findings list get shorter. The dangerous failure is silent: an extractor that stops at `?` never reports the URL, so nobody sees it.
  - **If** the project has no script for this → extract the literals and match routes by hand, and record the gap in `Process Improvements`.

  **Done when:** `Fetches` holds one row per unreachable call and per stranded route: path · call-site guard · deployment status · verdict.

- [ ] **Step 10 — Schema:** This step is the only one here for SQL migrations or a hosted DB. An unused column or an orphan SQL function still costs migrations and access review. From the schema source (migrations, schema file or generated types), take each table, column, view, SQL function and access policy (e.g., RLS), and search for it in code (table calls, columns, RPC), in other SQL (triggers, policies, functions) and in deployed serverless functions (e.g., edge functions). An object with zero references in all three is a candidate. At runtime on the deployed DB, check for tables with no scans or writes since the stats reset (record the reset time), read the inspection CLI's table and index stats, and run the unused-index advisor. Name unused indexes for `bkit-audit-database` as well, without duplicating its capacity finding. **If** traffic is thin **or** the app is pre-launch → zero use marks a static candidate, never proof on its own. **Done when:** `Schema` holds one row per candidate: object · static refs · runtime counts · reset time · verdict.
- [ ] **Step 11 — Events:** Jobs, crons and the event bus are the mirror of `Fetches` for background work. Event names are string literals, so the scanner and the language server are blind to them. List every send, every registered function with its trigger or cron, and every cron with its target. Check that each sent event reaches a registered function, that each registered trigger has a sender or a cron, and that each cron has an existing target. A function with no trigger is dead. An event with no function is a control that cannot fire, so route it as in `Env Vars`. **Done when:** `Events` holds one row per name: sender · function · cron target · verdict.
- [ ] **Step 12 — Strings:** (a) Message catalogue: diff the keys against the reads in each app and in shared UI, both ways (`i18n-check` or a search script). A key with no reader is dead. A read key missing from the catalogue renders the key name. A language server is often blind here, so search. Name each key missing from the catalogue for `bkit-audit-usability`. (b) Static assets: list the shipped assets (email templates included), and search for each basename in code, config and CSS. The scanner skips assets, and a native bundle ships unused ones. (c) Scripts: for each manifest script and each file in the scripts tree, search for its name in CI, hooks, the task runner, docs and other scripts. Also search for its stem and check every process-spawn site (e.g., `spawn`, `exec`, a directory listing filtered by extension), because a path built at runtime escapes a name search. A script with no invoker is a candidate. A script invoked only from docs is a candidate, with the reader to update. **Done when:** `Strings` holds one row per unused key, missing key, unread asset and uninvoked script.
- [ ] **Step 13 — False Positives:** Filter these classes before reading anything as a finding. They are structural and recur on every run.
  - Ambient module augmentation has zero importers by design and applies through the compiler include, so it is never dead.
  - Platform file splits (e.g., RN `.ios` / `.android` / `.web`): one specifier resolves to a per-platform file the scanner cannot follow, so unresolved entries are noise.
    - The filter hides the opposite case, so check once per run that, for each platform pair, the platform that would load that variant imports the parent.
    - A single-platform component carrying the other platform's file is dead and invisible, because both resolve through the same specifier.
  - Files referenced from config, not code: check the referencing config before believing a file unused (app config, CI, test-runner project dependencies, agent hooks, deployed functions, an explicit worker registry).
  - Test-only exports: an export whose only importer is a test is a seam, not dead code.
    - Report them apart from unreferenced code, and never delete them.
    - A drift test is not a reader: a generated artefact referenced only by its generator and a drift test (no runtime reader) is a finding, not a seam.
  - A default export that a preview server requires while code imports the named one.
  - Mock-factory keys: no scanner and no language server sees them, so a key inside a mock factory is a real use.

  **Done when:** `Candidates` names each class and what it removed.

- [ ] **Step 14 — Eliminate:** Use the language server before opening files. One reference found means the candidate is not dead, and that verdict is sound even though the converse is not.
  - For each surviving unused-export candidate, find the symbol, then find its references. Any hit ends the candidate.
  - **If** the result is empty → fall through to text search, and re-run the empty language-server query once more before recording it.
  - Record both measurements.
  - Pace the reference queries: back-to-back calls collapse to zero, and a partial answer looks exactly like a dead symbol. An empty result is inconclusive, not proof of absence.
  - Text search over-reports (comments, same-named symbols in other modules), and the language server under-reports, so agreement between them is the signal.
  - Run the search in addition to the language server, never instead of it:
    - An unused export needs zero matches repo-wide other than its own definition: search, subtract the defining file, and ignore prose comments.
    - An unused file is not reached from JSON, YAML or other config that no typed tool reads.
    - An env-var finding is a control, not an optional setting with a working default.
    - A test id asserted in end-to-end tests exists on a component.
  - Write no finding without opening the file, and cite `file:line` and the method.
  - Non-typed surfaces (markdown, ledgers, YAML, SQL, shell, string literals) take search, not the language server.

  **Done when:** every survivor in `Candidates` has its `file:line`, its method and the zero-reference re-run.

- [ ] **Step 15 — Runtime:** **If** production request, job or query stats exist → compare them with the static results: static analysis says what is unreferenced, and production says what ran. Rank the survivors by a recent window of per-route counts or logs, job runs and SQL function query stats. "Zero executions" is not "zero static references". **If** traffic is thin **or** the app is pre-launch → the counts are a signal, never proof, and an uncalled route is not dead. **Done when:** `Runtime` holds the window, the source and the zero-execution rows, or the skip.
- [ ] **Step 16 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per anchor and per scanner issue type, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 17 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches reachability: features or packages deleted or moved, exports and files, dependencies, env vars and flags, routes and fetch URLs, events, functions and crons, migrations, i18n, assets, and manifest scripts. (b) In a bounded pass of about 30 minutes, note what a senior code-health reviewer would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows, `bkit-audit-logs` reports, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Candidates eliminated:** every survivor's file was opened.
- [ ] **Use ends a candidate:** every candidate for which a method found a use was ended.
- [ ] **Re-runs:** every zero-reference result was re-run.
- [ ] **Re-runs recorded:** both measurements of every re-run are recorded.
- [ ] **Tree untouched:** no code, config, schema or dependency changed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A dead control on auth, a limiter or validation (the path never executes). A client fetch whose error path treats failure as success, so the missing route never surfaces |
| `HIGH` | A user-facing or background path with no handler, or a handler nothing can reach. An end-to-end assertion that passes because its target does not exist. An event or cron with one end missing |
| `MEDIUM` | A file or export with zero references after elimination. A feature flag older than 90 days whose rollout is complete. An unused or unlisted dependency. An i18n key with no reader, or a reader whose key is missing from the catalogue |
| `LOW` | A doc comment naming a moved path. A test-only export (its own class, never a delete). A preview-only default export |

Within a severity, list dead controls first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity.
- [ ] **Candidates:** `Summary` gives the candidate count.
- [ ] **Survivors:** `Summary` gives the surviving count.
- [ ] **Series:** the report shows `Reachability` counts and `Runtime` zeroes beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
