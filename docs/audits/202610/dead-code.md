<!-- bkit:anchor
baseSha: 5f5a097cc9e4e6dd44cf46ad74457064a2a798c5
baseRef: dev
bkitVersion: 5.2.4
bkitLatest: 5.2.4
-->
<!-- Note: Report at `docs/audits/202610/dead-code.md`. Template = `docs/templates/bkit-audit-dead-code.md`. Stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. Never overwrite. `@bkit-audit-generate` filled this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->

# Dead Code Audit

> [!CAUTION]
> **Purpose:** Reachability of code, config, routes, events, schema, and assets — what looks live and never runs.
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
> - NEVER delete code, files, routes, schema objects, or dependencies. The report names the destination; applying it is the next step.
> - A detector proves use, never absence. Dead only when every method that would have found a use found none, and the file was opened. never write a finding from tool output alone.

## Universal Instructions

### Context & Goals

Dead code = control that looks live, is not: limiter on unset env var; E2E assertion on test id no component renders; config key calling API removed from pinned dependency. Target failure: **a control that reads as live in review and never executes**.

**Applies when:** application source, config, or package manifest. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly; extra pass when a cycle deletes a feature or moves a package.

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

- In-function unused locals, parameters, unreachable code, always-true/false conditions.
- Module reachability: files, exports, types, duplicates; default run beside production mode.
- Dependency reachability (own pass): unused, unlisted, unresolved, binaries, version-catalog entries.
- Env-var reachability: referenced vs declared; gates.
- Feature flags; config keys nothing reads; values always overridden.
- Assertion surface (test ids), route surface (forwarders, stale pointers), client fetches with no route.
- Schema objects nothing reaches.
- Events, background functions, crons — both ends.
- i18n keys, static assets, scripts.
- Runtime executions — separate from static references.

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

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [x] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
  - **Result:** all probes answered, none blocked — `git status`, `git grep`, `pnpm dlx knip@6.41.0`, `pnpm exec tsc --showConfig`, `pnpm view`, `gh run list --limit 1`, `gh secret list`, `gh variable list`, `gh api repos/cbartens/bkit/environments`, `gh api repos/cbartens/bkit/rules/branches/dev`, Serena `find_symbol`, WebFetch `github.com` / `typescript-eslint.io` / `www.typescriptlang.org`. `Project Instructions` `Permissions` absent (baseline run).
- [x] **Clean Tree:** Steps 2–17 — clean `git status` at recorded commit; one checkout all steps. Fallback: detached worktree off integration branch; dirty-path candidates = hypotheses.
  - **Result:** `git status --porcelain` at `5f5a097c` → only untracked `docs/audits/202610/{dead-code,duplication,security,testing}.md` (this report + parallel audit reports; none is an audited surface). One checkout, all steps.
- [x] **Text Search:** Steps 5–14 — repo search (`git grep`, ripgrep). Fallback: none → those steps `Not Checked`.
  - **Result:** `git grep` + ripgrep 14.1.1. `rg` is a shell function here, so `xargs rg` fails (`xargs: rg: No such file or directory`); `git grep -l -w -F` used for batch counts.
- [x] **Reachability Scanner:** Steps 3–4 — ad hoc, not committed dependency (e.g. `pnpm dlx knip`, vulture). Fallback: language-server refs + text search; scanner categories `Not Checked`.
  - **Result:** knip 6.41.0 via `pnpm dlx knip@6.41.0` (pnpm 10.34.5, node v24.16.0); not added to `package.json`; outputs in throwaway `tmp/audit-dead-code/` (removed at end).
- [x] **Web:** Step 16 — fetch anchor standards. Fallback: versions unread.
  - **Result:** WebFetch `github.com/webpro-nl/knip/releases`, `typescript-eslint.io/rules/no-unnecessary-condition`, `www.typescriptlang.org/tsconfig` — all read 2026-10-17; `pnpm view` for current versions.

#### Conditional

Verify only when applicable.

- [x] **Compiler Unused Checks:** Compiled language → Step 2 — resolved compiler/linter config, not base file. Fallback: `Detectors` `Not Checked`.
  - **Result:** tsc 7.0.2 (native) — `pnpm exec tsc --showConfig -p tsconfig.json` and `-p tsconfig.test.json`; ad hoc `--noEmit --noUnusedLocals --noUnusedParameters --allowUnreachableCode false` run on both. No linter configured (no ESLint / Biome / oxlint config in the tree).
- [x] **Language Server:** Typed language → Steps 13–14 — refs (Serena, `tsserver`, pyright). Fallback: text search only; name it; re-run every empty result before recording dead.
  - **Result:** Serena (TypeScript LS). Serena loads `tsconfig.json`, which excludes `**/*.test.ts`, so test-file references are invisible to it (control: `getCoreRoot` returns non-test refs). Every empty result re-run once; text search fills the test side.
- [x] **Git History:** Flags or introduction dates → Step 6 — `git log -S`. Fallback: flag ages `Not Checked`.
  - **Result:** no feature flags exist; `git log` used for move dates (`.bkit/workflows/` + `.bkit/prompts/` → `.bkit/core/` in 3b8d9468, 2026-10-11) and `git log --all -- docs/linear-issues.csv` (empty).
- [ ] **E2E Locators:** E2E asserts test ids → Step 7. Fallback: skip with evidence; `Assertions` = `N/A`.
  - **N/A:** no E2E suite; `git grep -l -E 'data-testid|testID|getByTestId'` → only vendored skill prose (`.agents/skills/test-driven-development/testing-anti-patterns.md`) and a ledger line (`harvest/friction.jsonl`).
- [ ] **Hosted DB:** SQL migrations or hosted DB → Step 10 — inspection CLI + unused-index advisor (e.g. `supabase inspect db`, Splinter `0005_unused_index`). Fallback: static grep only; runtime zero-use `Not Checked`.
  - **N/A:** `git ls-files '*.sql'` → 0; no database client in `package.json` (no runtime `dependencies`).
- [x] **Runtime Counts:** Production request/job/query stats → Step 15 — e.g. host per-route counts, job-runner runs, `pg_stat_statements`. Fallback: static only; "zero executions" `Not Checked`.
  - **Result:** partial — GitHub Actions run history (`gh run list --workflow <file> --limit 300`) is the only execution record for workflows. bkit is a CLI with no per-command telemetry from consumers → CLI command execution counts `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [x] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [x] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
  - **Result:** Baseline: `ls docs/audits/*/dead-code.md` → only this report; no prior `baseSha`. Marked baseline in `Previous Run`.
- [x] **Step 2 — Detectors:** Compiled language → scanner sees module exports only; dead branch/parameter inside live function → compiler + linter. Read resolved config per workspace, not base: unused-local, unused-parameter, no-unreachable-code; linter unused-vars, unreachable, always-true/false (e.g. `@typescript-eslint/no-unnecessary-condition`). Workspace override or file disable switches one off silently. Detector off = finding → `bkit-audit-gates` (gate candidate). **Done when:** `Detectors` lists each config and resolved value.
  - **Result:** `Detectors` lists both tsconfigs and the linter gap; ad hoc flags found 8 unused declarations → dead-code-5, dead-code-7.
- [x] **Step 3 — Reachability:** Ad hoc scanner, same resolved version both runs; record version. Do not add it as a dependency, and do not wire a CI gate this run. Report baseline-config readiness. Gate before `False Positives` exclusions encoded → structural noise → disabled. Do not encode test-only code as ignore entries or negated project patterns — plugins add test files as entries; production mode separates. Check scanner stderr before trusting: plugin load failure drops entry class → false unused files. Signal: files, exports, types, duplicates. Dependency categories → `Dependencies` pass, not mixed. Same version in production mode (or strict: implies production + each workspace uses only its own deps). Export used default run, unused production → test/config-only class. Report both runs side by side. **Done when:** version, both runs, plugin-load errors in `Reachability`.
  - **Result:** knip 6.41.0 default + `--production`, plus `ignoreExportsUsedInFile` and `--strict` passes; stderr clean → `Reachability`.
- [x] **Step 4 — Dependencies:** Scanner dependency mode per workspace, categories the scanner offers (e.g. knip: unused, unlisted, unresolved, unlisted binaries, catalog entries unreferenced). Before unused verdict → search name across manifest scripts, config, CI. Config-only consumers (e.g. linter, formatter, CSS presets, bundler plugins, `@types/*`) = usual false hits. Unused = install/supply-chain surface; unlisted = hoisted from another workspace. Unlisted or advisory → `bkit-audit-dependencies`. **Done when:** `Dependencies` row per candidate: name · class · config-or-CI reader · verdict.
  - **Result:** knip dependency categories, default + `--strict` → zero; `Dependencies` records the two config-only consumers.
- [x] **Step 5 — Env Vars:** Text search only — env names are string literals; language server cannot see them. Every referenced env vs declared (examples, task runner, typed env schema — sources in `Project Instructions`). Referenced, never declared → control cannot switch on. Triage: platform-injected = fine; optional + safe default = fine (read default); gates control (absence disables limiter, auth, feature) = finding. Third group → path never executed in any environment. Omitted declaration source → `Process Improvements` gap. Gating var → `docs/failures.jsonl` via `@bkit-utility-update-failures`, and `bkit-audit-duplication`. **Done when:** `Env Vars` row per referenced-undeclared: group · absence effect · verdict.
  - **Result:** `Env Vars` rows; two gating secrets (dead-code-3) and one unread secret (dead-code-4).
- [x] **Step 6 — Config:** Deadness no scanner reports. (a) Feature flags stuck on/off; hardcoded or same every environment → branch never runs. Per flag: every read + value per environment; all same → other branch dead = finding. Age flags (`git log -S`); >90 days, rollout complete = finding even if environments differ. (b) Config keys no reader, or name removed object — search key; language server reads typed source only. (c) Default replaced in every environment by later layer = lying docs. Dead control → `docs/failures.jsonl` like `Env Vars`, not tidiness. **Done when:** `Config` row per flag/unread key: value per environment · age · verdict.
  - **Result:** No feature flags (search evidence in `Config`); config keys all read; one overridden default → dead-code-11.
- [x] **Step 7 — Assertions:** E2E asserts test ids → unmatched locator passes; test id no component renders = vacuous spec, green CI. Extract asserted E2E ids vs component-rendered ids (both string literals). **Done when:** `Assertions` lists asserted-but-unrendered ids, or `none`.
  - **Result:** Skipped — surface absent: no E2E suite; test-id search hits only vendored skill prose (see Pre-Flight `E2E Locators`). `Assertions` = `N/A`.
- [x] **Step 8 — Routes:** Two checks; the second is where the defects are. (a) Forwarders. A route whose page only redirects renders nothing: no content, an extra round trip, and it reads in every route list as a page. Use the project's derived list, do not eyeball the tree. The usual justification is that old bookmarked or emailed links must keep working — check that claim against the deployment doc before accepting it. (b) What still points at a forwarder, or at a path that moved. Grep the old path, not the new one. Stale cache-invalidation call (e.g. Next.js `revalidatePath` / `revalidateTag`) refreshes the stub; the page a user reads is never invalidated. Stale end-to-end helpers drive every spec through the redirect. A middleware allowlist arm that can no longer match reads as a live carve-out. A deep-link or email builder whose redirect drops a query param loses the token or id silently. A doc comment naming the old directory is free to fix, and it makes the next reader mistrust every other comment in the file. Relative imports hide the dependency: a repo-wide grep for the path string misses `./old/page`. After a route delete, run the typecheck before believing a grep was complete. Stale generated route types are build output: remove them and re-run, do not read them as source errors. A test that pins the call argument (`toHaveBeenCalledWith` the path) cannot tell a live pointer from a dead one. "A test covers it" is no evidence in this step. **Done when:** `Routes` row per forwarder and per stale pointer: kind · `file:line` · verdict.
  - **Result:** No web routes (CLI). Stale-pointer pass on the moved `.bkit/workflows/` / `.bkit/prompts/` dirs and a never-existing default path → `Routes`; dead-code-9, dead-code-10.
- [x] **Step 9 — Fetches:** Clients call API paths with raw fetch → the mirror of `Routes`. Route-side asks whether a route has a caller. This asks whether a call has a route. Neither finds the other's class. Compiler-checked RPC clients are out of scope (a missing route fails typecheck). Raw fetch is the whole exposure: a URL inside a template literal, so lint, typecheck, and the reachability scanner all pass on a path that 404s. Two routing layers (where the stack has them) → model both. The outer framework decides whether a handler runs (static directory vs catch-all that forwards a subtree). The inner router then routes within what was forwarded. A route correctly mounted on the inner router and unreachable from the outer layer is its own class (`stranded`). Checking either layer alone says the route is fine. Read a finding as two questions: the path has no handler, and why nobody noticed. The answer is at the call site — `if (res.ok)` skips the block, `if (!res.ok) return success` fails open. A 404 is a successful HTTP response, so nothing throws. The report names the guard and the route. Confirm against the deployment (status code of the path beside a known-live path) before writing it up. Two false positives, do not reintroduce them: a path in a doc comment is not a call; a prefix test (`startsWith`) is not a request. The dangerous failure is silent: an extractor that stops at `?` never reports the URL, so it is not seen. When changing extraction, the fetched-path count must go up, not merely the findings list get shorter. No project script → extract literals and match routes by hand; record the gap in `Process Improvements`. **Done when:** `Fetches` row per unreachable call and per stranded route: path · call-site guard · deployment status · verdict.
  - **Result:** Skipped — surface absent: `git grep -n -E '\bfetch\('` over `*.ts`/`*.js`/`*.mjs`/`*.cjs` (excl. `dist`, docs, vendored skills) → 0; every `gh api` path is a GitHub REST endpoint. `Fetches` = `N/A`.
- [x] **Step 10 — Schema:** SQL migrations or hosted DB — only step here. Unused column/orphan SQL function still costs migrations + access review. From the schema source (migrations, schema file, or generated types): per table, column, view, SQL function, access policy (e.g. RLS) → search code (table calls, columns, RPC), other SQL (triggers, policies, functions), deployed serverless functions (e.g. edge functions). Zero refs all three = candidate. Runtime on deployed DB: table no scans/writes since stats reset (record reset time); inspection-CLI table/index stats; unused-index advisor. Unused indexes → also `bkit-audit-database` — name, do not duplicate capacity finding. Thin/pre-launch traffic → zero-use = static candidate, never proof alone. **Done when:** `Schema` row per candidate: object · static refs · runtime counts · reset time · verdict.
  - **Result:** Skipped — surface absent: `git ls-files '*.sql'` → 0; no DB client. `Schema` = `N/A`.
- [x] **Step 11 — Events:** Jobs, crons, event bus — mirror of `Fetches` for background work. Event names = string literals; scanner + language server blind. List every send, registered function + trigger/cron, every cron + target. Sent event → registered function; registered trigger → sender or cron; cron → existing target. No trigger = dead function; no function = unfireable control → route like `Env Vars`. **Done when:** `Events` row per name: sender · function · cron target · verdict.
  - **Result:** GitHub Actions triggers both ends → `Events`; one lane whose sender and secrets are both absent → dead-code-3.
- [x] **Step 12 — Strings:** (a) Message catalogue — diff keys vs reads each app/shared UI both ways (`i18n-check` or search script). No reader = dead; read missing = renders key name; language server often blind → search. Missing catalogue → `bkit-audit-usability`. (b) Static assets — list shipped (incl. email templates); search basename in code, config, CSS; scanner skips assets; native bundle ships unused. (c) Scripts — per manifest script + scripts tree file → search name in CI, hooks, task runner, docs, other scripts; no invoker = candidate; doc-only = candidate + reader to update. **Done when:** `Strings` row per unused key, missing key, unread asset, uninvoked script.
  - **Result:** No i18n catalogue; 34 `.github/assets` files + 1 docs HTML, 35 `package.json` scripts, 28 `scripts/` files checked → `Strings`; dead-code-6, dead-code-10.
- [x] **Step 13 — False Positives:** Filter these before reading anything as a finding. They are structural and recur every run. Ambient module augmentation: zero importers by design; applied through the compiler include. Never dead. Platform file splits (e.g. RN `.ios` / `.android` / `.web`): one specifier resolves to a per-platform file the scanner cannot follow, so unresolved entries are noise. The filter hides the opposite, so check once per run: for each platform pair, the platform that would load that variant imports the parent. A single-platform component carrying the other platform's file is dead and invisible, because both resolve through the same specifier. Files referenced from config, not code: check the referencing config before believing unused (app config, CI, test-runner project dependencies, agent hooks, deployed functions, an explicit worker registry). Test-only exports: only importer is a test = a seam, not dead code. Report separately from unreferenced code; never delete. A default export a preview server requires while code imports the named one. Mock-factory keys: no scanner and no language server sees them; a key inside a mock factory is a real use. **Done when:** `Candidates` names each class and what it removed.
  - **Result:** `Candidates` names each present class and what it removed; ambient augmentation, platform splits, preview default exports absent (evidence there).
- [x] **Step 14 — Eliminate:** Language server before opening files. One reference found means the candidate is not dead, and that verdict is sound even though the converse is not. Per surviving unused-export candidate: find the symbol, then find references. Any hit ends it. Empty → fall through to text search, and re-run the empty language-server query once more before recording it. Record both measurements. Pace reference queries: back-to-back calls collapse to zero, and a partial answer looks exactly like a dead symbol. Empty is inconclusive, not absence. Text search over-reports (comments, same-named symbols in other modules); the language server under-reports. Agreement is the signal. Run search in addition to the language server, never instead of it. An unused export needs zero matches repo-wide other than its own definition: search, subtract the defining file, ignore prose comments. An unused file is not reached from JSON, YAML, or other config no typed tool reads. An env-var finding is a control, not an optional setting with a working default. A test id asserted in end-to-end tests exists on a component. No finding without opening the file. Cite `file:line` and the method. Non-typed surfaces (markdown, ledgers, YAML, SQL, shell, string literals) are search, not the language server. **Done when:** every survivor in `Candidates` has `file:line`, method, and the zero-reference re-run.
  - **Result:** Survivors opened; Serena + `git grep` both recorded → `Candidates`.
- [x] **Step 15 — Runtime:** Production request/job/query stats → static says unreferenced; production says ran. Rank survivors: recent window of per-route counts/logs, job runs, SQL function query stats. "Zero executions" ≠ "zero static references". Thin/pre-launch → signal, never proof; uncalled route ≠ dead. **Done when:** `Runtime` holds window, source, zero-execution rows, or skip.
  - **Result:** GitHub Actions run history 2026-05-25 → 2026-10-17 → `Runtime`.
- [x] **Step 16 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: row per anchor + scanner issue type → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
  - **Result:** `Standards Coverage` row per anchor and per knip issue type.
- [x] **Step 17 — Anything Else:** (a) Since previous commit, reachability-touching changes (features/packages deleted/moved, exports/files, deps, env/flags, routes/fetch URLs, events/functions/crons, migrations, i18n, assets, manifest scripts) → one-line verdict each. (b) ~30 min bounded pass: senior code-health flags no step asks; since previous run (incidents, new `docs/failures.jsonl`, `bkit-audit-logs` reports, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.
  - **Result:** (a) baseline, no previous commit — the 2026-10-11 `.bkit/core/` move (3b8d9468) checked anyway; (b) bounded pass → `Beyond the Steps`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [x] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [x] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [x] **Candidates eliminated:** every survivor opened the file; a method that found a use ended it; every zero-reference result was re-run and both measurements are recorded.
- [x] **Tree untouched:** no code, config, schema, or dependency change.
- [x] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

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
| dead-code-1 | `MEDIUM` | `.claude/hooks/gate-paths.generated.cjs:1-53`; `.bkit/core/engine/shared/protected-paths.ts:1-12,54-59,86-105,154-163`; `docs/architecture.md:71,174-175` | The drift test guards a file nothing executes, and the sync it claims is false. `git grep -n "gate-paths.generated"` (excl. `dist`, `docs/audits`, `docs/plans`) → only the generator (`protected-paths.ts:3,98,102,109`) and the drift test (`protected-paths.test.ts:26-40`); no hook config or code loads the `.cjs`. The live guard is `.bkit/core/hooks/gateguard-engine.js:9-33`, inlined into every host's `bkit-gateguard` via `{{BKIT_PART gateguard-engine.js}}` and wired at `.claude/settings.json:255`: 23 patterns. The TS table at `protected-paths.ts:59-84` has 13 (`diff` → missing `jest`, `ruff`, `.ruff`, `.flake8`, `mypy`, `pylintrc`, `pytest`, `.golangci`, `clippy`, `rustfmt`). The drift test compares the `.cjs` with its own generator, so it stays green while `protected-paths.ts:6-7` ("ONE source of truth") and `:55-56` ("kept in sync via the generated `.cjs` drift test") are untrue. TS `GATE_CONFIG_PATTERNS` / `isGateConfig` / `generateGatePathsCjs` have no production caller: Serena refs → in-file only (×2), knip 6.41.0 `--production` + `ignoreExportsUsedInFile` → `isGateConfig:86`. `:97` says to run it with `ts-node`, which is not installed (`:154` names the real `node dist/shared/protected-paths.js`). | One gate-config table that the runtime guard actually loads, with a drift test comparing the guard against it (or the unread `.cjs` and its generator retired). Comments and `architecture.md` describe what runs. |
| dead-code-2 | `MEDIUM` | `.bkit/templates/scripts/ci/check-accepted-divergences.test.mjs`; `.bkit/templates/scripts/ci/lanes/resolve-push-base.test.mjs`; `scripts/ci/lanes/resolve-push-base.test.mjs` | Shipped copy-and-own tests that nothing runs. The vitest include is `.bkit/core/engine/**/*.test.ts` (`vitest.config.ts:7`). `git grep -n "test\.mjs"` over `.github/workflows`, `package.json` and the engine → only `audits/templates/ci-scripts.test.ts:239`, which spawns `check-dependency-audit.test.mjs` and nothing else (`AUDIT.replace(/\.mjs$/, ".test.mjs")`, `:238-243`). The other two scripts are tested through the `.mjs` (`ci-scripts.test.ts:12,56`; `audits/repo/resolve-push-base.test.ts:14`), never through the `.test.mjs` consumers copy (`docs/deployments.md:384` tells them to). The repo copy `scripts/ci/lanes/resolve-push-base.test.mjs` is byte-identical (`cmp`; `dogfood-templates.test.ts:271`). knip default lists all three as unused files. | Each shipped `.test.mjs` executed by vitest, the way `ci-scripts.test.ts:238-243` does for `check-dependency-audit.test.mjs`. |
| dead-code-3 | `MEDIUM` | `.github/workflows/bkit-cloud.yml:11-12,99-102,120-145` | The dogfood cloud lane has not executed since 2026-06-01. It runs only on a `bkit [auto route]` head commit (`:101`), then no-ops unless `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` are set (`:123-131`). `gh secret list` → only `BKIT_GH_TOKEN`, `BKIT_NPM_TOKEN`. `gh run list --workflow bkit-cloud.yml --limit 300` → 126 runs: 114 skipped, 11 failure, 1 success; newest non-skipped 2026-06-01T06:41Z. `git log --all --since=2026-06-01 --grep='bkit \[auto route\]'` → 0. The file is the dogfood of shipped `.bkit/templates/.github/workflows/bkit-cloud.yml` (`dogfood-templates.test.ts:203`) and was last edited 2026-10-15 (04ccf600): it keeps being edited with no live run. | Either the runner secrets are set so the dogfood lane executes, or the lane is disabled here and the gap is recorded where the cloud lane is documented. |
| dead-code-4 | `MEDIUM` | Repo secret `BKIT_NPM_TOKEN` (GitHub Settings); `.github/workflows/release.yml:10,77-82` | A long-lived publish credential that nothing reads. `git grep -n BKIT_NPM_TOKEN` (excl. `dist`, `docs/audits`) → only `audits/repo/release-workflow.test.ts:203`, which asserts that `release.yml` does NOT contain it. Release publishes through OIDC trusted publishing (`id-token: write` `:10`; `npm publish --provenance`, no token env `:77-82`). `gh secret list` → set. | Secret removed from repo settings and the token revoked on npmjs.com; routed to `bkit-audit-security`. |
| dead-code-5 | `MEDIUM` | `tsconfig.json:18-19`, `tsconfig.test.json:8-9`; no linter config | The compiler and linter detectors for unused and always-true code are off. `pnpm exec tsc --showConfig` (both projects) → `strict: true`; `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode`, `allowUnusedLabels` unset. No ESLint / Biome / oxlint config (`ls -a`). typescript-eslint 8.71.2 declares peer `typescript >=4.8.4 <6.1.0` (`pnpm view`), and the repo is on tsc 7.0.2, so `no-unnecessary-condition` cannot run. Ad hoc `tsc --noUnusedLocals --noUnusedParameters --allowUnreachableCode false` → 8 hits today (dead-code-7). | `noUnusedLocals` + `noUnusedParameters` on in `tsconfig.json` (inherited by `tsconfig.test.json`); always-true lint revisited once typescript-eslint supports TS 7. Routed to `bkit-audit-gates`. |
| dead-code-6 | `MEDIUM` | `.github/assets/bkit-{hero,features,pipeline,fences,fences-details,ci,context,audits}-{dark,light}.png` (16 files, 2860 KB) | The README reads only the `.svg` twins (`README.md:3-4,37-38,76-77,87-88,98-99,127-128,144-145,190-191`). `git grep -l -F <basename>` per PNG (excl. `dist`, `docs/audits`, `scripts/readme/`) → 0 readers for all 16. `.github/` is not in `package.json` `files`. `scripts/readme/readme-art.mjs:1-2` regenerates them on every run ("as both .svg and .png"). Only `bkit-social.png` has a stated consumer (`readme-art.mjs:228-229`, a manual upload in GitHub Settings). Why the other 16 PNGs exist is not written down. | Either a recorded consumer for the 16 PNGs, or the generator emits PNG for `bkit-social` only and the 16 files go. |
| dead-code-7 | `LOW` | `.bkit/core/engine/commands/install/upgrade.ts:44`; tests under `.bkit/core/engine/`: `audits/workflows/auto-fid-guard.test.ts:31`, `audits/workflows/ci-dispatch-gate-alignment.test.ts:23`, `audits/workflows/runtime-prose-audit.test.ts:20`, `audits/workflows/skip-ci-subject-audit.test.ts:23`, `checks/before/files.integration.test.ts:81,124`, `commands/install/uninstall.test.ts:573` | Ad hoc `tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.test.json`: TS6196 `ModuleFlag` imported but never used (the only production hit); TS6133 `REPO_ROOT` ×4, `pkgRoot` ×2, `templatesRoot` ×1. Each line opened; no read in scope. | Declarations removed; lands with the dead-code-5 flag change. |
| dead-code-8 | `LOW` | Under `.bkit/core/engine/`: `install/manifest.ts:256` `BKIT_DEBUG_GATES`, `:270` `BKIT_BUILD_GATES`; `commands/lib.ts:46-47` `OWN_EXIT_MIN` / `OWN_EXIT_MAX`; `shared/egress.ts:298` `MULTI_LABEL_SUFFIXES`, `:326` `MULTI_TENANT_APEXES`; `ledgers/telemetry.ts:306` `DEFERRAL_WRITERS`; `install/cloud-env.ts:495` `proposeEgressBase` | Test-only exports (seam class, not dead). knip 6.41.0 `--production` + `ignoreExportsUsedInFile` → these 8 (+ `isGateConfig`, see dead-code-1); the default run sees their test importers. Serena `find_referencing_symbols` → `{}` ×2 each (the LS excludes `**/*.test.ts`); `git grep -w` → only `*.test.ts` importers outside the defining file. `proposeEgressBase` already names its test tie (`shared/egress.ts:29`). | Kept as test seams, never deleted. Optional: name the test tie at each export, as `egress.ts:29` does. |
| dead-code-9 | `LOW` | Production comments `.bkit/core/engine/checks/before/context-fetch.ts:154`, `render/hosts.ts:195`, `render/trackers.ts:3`; `docs/architecture.md:25`; test titles / comments / fixtures under `.bkit/core/engine/`: `audits/workflows/catalog-parity.test.ts:38,51`, `audits/workflows/prompt-notation.test.ts:4,289`, `audits/workflows/runtime-prose-audit.test.ts:7,53,60`, `audits/workflows/slash-arg-expansion.test.ts:2`, `audits/workflows/workflow-book-paths.test.ts:3,9`, `render/models.test.ts:43,53,149,162`, `render/hosts.test.ts:313`, `shared/protected-paths.test.ts:76-77`, `commands/comply.test.ts:55` | These name `.bkit/workflows/`, `.bkit/prompts/` and `.bkit/docs`, which moved under `.bkit/core/` in 3b8d9468 (2026-10-11); `ls .bkit/workflows .bkit/prompts .bkit/docs` → `No such file or directory`. `git grep -n` on the old paths; every hit opened, none is a code read. `protected-paths.test.ts:76-77` asserts that a path which no longer exists is not a mirror. | Comments, titles and `architecture.md:25` name `.bkit/core/workflows/` and `.bkit/core/prompts/`; the two fixtures use live paths. |
| dead-code-10 | `LOW` | `scripts/linear/linear-to-github-import.ts:5,50`; `scripts/linear/linear-to-github-import.README.md:13` | The default `--csv` path is `docs/linear-issues.csv`; `git log --all -- docs/linear-issues.csv` → empty, so the file has never existed. A run without `--csv` reads a missing file. The tool is maintained (decisions `linear-import-prefers-keyring-gh-token`, `linear-import-skips-project-label`, `docs/decisions.jsonl:238-239`). | `--csv` required (no default), or the README names where the export lands. |
| dead-code-11 | `LOW` | `vitest.config.ts:16-19`; `package.json:76`; `.github/workflows/bkit-ci.yml:661-667` | The comment says "No thresholds by design (report-only never reds the lane)", but the unit coverage run that CI executes passes `--coverage.thresholds.branches=70` (`package.json:76` `test:coverage:unit`; `bkit-ci.yml:661` "carries the --coverage.thresholds.branches floor"). The default is replaced on the unit lane, so the comment is wrong for that lane; only the integration run is report-only (`bkit-ci.yml:691`). | The comment says the unit lane adds a 70% branch floor through the CLI and only the integration run is report-only. |

Empty and clean → one row `None`.

## Report

### Summary

Baseline run at `5f5a097c` (`dev`, bkit 5.2.4). **11 findings: `CRITICAL` 0 · `HIGH` 0 · `MEDIUM` 6 · `LOW` 5.**

- **Candidates:** knip 6.41.0 default run 168 files + 225 export / type symbols; production run 176 files + 455 symbols; dependency categories 0 in every mode. Non-scanner surfaces added 16 unread assets, 3 gating or unread secrets, 8 compiler hits, 21 stale-pointer lines, 1 never-existing default path, 1 overridden-default comment.
- **Surviving after false-positive filtering and elimination:** 4 unreferenced files (1 generated `.cjs`, 3 `.test.mjs`), 9 test-only exports (seam class, never a delete), 0 unreferenced exports, 0 dependencies.
- **Most important:** the gate-config drift test (dead-code-1) guards a generated file that nothing executes, while the guard that does run carries 10 more patterns than the table its comments call the single source of truth. In review it reads as a sync check, but it checks nothing that runs.
- **Dead by environment:** the dogfood cloud lane has not executed since 2026-06-01 (dead-code-3); an npm publish token sits in repo secrets with no reader (dead-code-4, same item as `security-3`).

### Previous Run

Baseline. `ls docs/audits/*/dead-code.md` → only this report, so there is no prior `baseSha`. Closure rate, fixed / still-open counts and oldest-open age: N/A. The next run compares against `5f5a097cc9e4e6dd44cf46ad74457064a2a798c5`.

### Detectors

<!-- prettier-ignore -->
| Config | Scope | Option | Resolved value | Effect |
| --- | --- | --- | --- | --- |
| `tsconfig.json` | `.bkit/core/engine/**/*.ts`, excl. `**/*.test.ts` (`:18-19`) | `strict` | `true` | — |
| `tsconfig.json` | same | `noUnusedLocals` | unset (off) | unused locals and imports compile clean |
| `tsconfig.json` | same | `noUnusedParameters` | unset (off) | unused parameters compile clean |
| `tsconfig.json` | same | `allowUnreachableCode` | unset (`undefined` → editor suggestion, never an error) | unreachable code compiles clean |
| `tsconfig.json` | same | `allowUnusedLabels` | unset (same) | unused labels compile clean |
| `tsconfig.test.json` | `extends ./tsconfig.json`, tests included (`:8-9`) | same four | inherited, unset | same |
| Linter | — | unused-vars / unreachable / always-true | none — no ESLint, Biome or oxlint config (`ls -a`) | no in-function detector runs anywhere |
| typescript-eslint 8.71.2 | — | `no-unnecessary-condition` | cannot run — peer `typescript >=4.8.4 <6.1.0` (`pnpm view`) vs repo tsc 7.0.2 | always-true / always-false conditions undetectable |
| File-level disables | `.bkit/core/engine/**` | `@ts-nocheck` / `@ts-ignore` / `@ts-expect-error` | 0 real — all hits are fixture strings in `audits/templates/slop-type-suppression.integration.test.ts:41-51` | — |

Ad hoc run, `pnpm exec tsc --noEmit -p <config> --noUnusedLocals --noUnusedParameters --allowUnreachableCode false --allowUnusedLabels false`: `tsconfig.json` → 1 (TS6196 `commands/install/upgrade.ts:44`); `tsconfig.test.json` → 8 (that one + 7 TS6133 in tests); unreachable 0; labels 0. → dead-code-5, dead-code-7.

### Reachability

knip 6.41.0 (`pnpm dlx knip@6.41.0 --reporter json --no-progress --no-exit-code`), same resolved version on every pass. Single package, no pnpm workspaces. Baseline: no previous numbers.

<!-- prettier-ignore -->
| Issue type | Default | Production (`--production`) | Default + `ignoreExportsUsedInFile` | Production + `ignoreExportsUsedInFile` |
| --- | --- | --- | --- | --- |
| `files` | 168 | 176 | 168 | 176 |
| `exports` | 187 (42 files) | 369 (60 files) | 0 | 9 (6 files) |
| `types` | 38 (17 files) | 86 (23 files) | 0 | 0 |
| `nsExports` / `nsTypes` | 0 | 0 | 0 | 0 |
| `enumMembers` / `namespaceMembers` | 0 | 0 | 0 | 0 |
| `duplicates` | 0 | 0 | 0 | 0 |

- **Plugin-load errors:** none. Default stderr = `pnpm dlx` install progress + the vitest config's own `[test-timeout-budget] load average …` line (proof the vitest plugin loaded the config); the other passes' stderr is empty.
- **Production-only files (8, test/config-only class):** `.bkit/core/engine/checks/status-holes.ts`, `.bkit/core/engine/tools/wording.ts`, `dist/cli.js`, `scripts/ci/check-dependency-audit.mjs`, `scripts/ci/lanes/resolve-push-base.mjs`, `scripts/prettier/bkit-insert-ignore.mjs`, `vitest.setup.ts`, `vitest.timeout-budget.ts` — reached from `package.json` scripts or the vitest config, which production mode drops.
- **Used in default, unused in production:** 182 exports + 48 types. With `ignoreExportsUsedInFile` only 9 remain (dead-code-8, plus `isGateConfig` in dead-code-1); the rest are also used inside their own file.
- **Used in own file only (225 default-run symbols):** scripted per-symbol count → every one has ≥1 in-file code use; every cross-file `git grep -w` hit is a comment, test title, same-named local or JSON key. The `export` keyword is unneeded; not dead, not a finding.
- **Baseline-config readiness: not ready.** A gate on knip defaults fails on 168 structural files and 225 used-in-own-file symbols. A baseline config first needs `ignoreExportsUsedInFile: true`; `dist/**` ignored as build output; host hook files and `.bkit/core/hooks/*.js` declared as entries (config-referenced); `.bkit/templates/**`, `.agents/skills/**`, `docs/plans/**/spike/**` ignored (copy-and-own / vendored / archived); `ignoreBinaries` for `jq`, `actionlint`, `pgrep`, `direnv`, `vale`. Test-only exports stay visible through production mode. Gate wiring → `bkit-audit-gates`.

### Dependencies

knip dependency categories in default, `--production` and `--strict --dependencies` runs: `dependencies` 0, `devDependencies` 0, `optionalPeerDependencies` 0, `unlisted` 0, `unresolved` 0, `catalog` / `catalogReferences` 0 (no catalog).

<!-- prettier-ignore -->
| Name | Class | Config-or-CI reader | Verdict |
| --- | --- | --- | --- |
| runtime `dependencies` | — | none declared; production code imports only `node:` built-ins and relative paths | nothing to check |
| `vite` | devDependency + `pnpm.overrides` pin (`package.json:102,107-108`) | transitive of vitest, pinned | used (override) |
| `@types/node` | config-only (`package.json:93`) | `tsconfig.json` `types` | used |
| `jq`, `actionlint`, `pgrep`, `direnv`, `vale` | unlisted binaries (production mode: `direnv`, `pgrep`, `vale`) | `package.json` scripts, hooks, CI steps | system tools, not npm packages — not a finding |

### Env Vars

Declaration sources: `.bkit/.env.example` (shipped source `.bkit/shared/.bkit/.env.example`), `.bkit/README.md`, `.bkit/providers.md`, `.bkit/cloud.md`; CI: `gh secret list`, `gh variable list`, `gh api repos/cbartens/bkit/environments`. Method: `git grep -n -w` (env names are string literals).

<!-- prettier-ignore -->
| Name | Group | Absence effect | Verdict |
| --- | --- | --- | --- |
| `BKIT_DEBUG` | optional + safe default (`.bkit/core/engine/checks/after/ci-yml.ts:282`) | debug output off | fine |
| `CURSOR_REMOTE_AGENT` | platform-injected (`checks/before/env.ts:106`) | — | fine |
| `UNIT_PLANNED_LOAD_PER_CORE` | optional, defaults to 0 (`vitest.timeout-budget.ts:39`) | no planned-load term | fine |
| `CHROME_BIN` | optional; auto-detect first, documented in header (`scripts/readme/readme-art.mjs:17-20`) | SVGs only, logged (`:1569`) | fine |
| `ANTHROPIC_API_KEY`, `OPENCODE_PROVIDER_KEY` (Actions secrets) | gates control — documented opt-in (`.github/workflows/bkit-cloud.yml:11-12,120-131`) | cloud lane no-ops; no executed run since 2026-06-01 | finding → dead-code-3 |
| `RENOVATE_APP_ID`, `RENOVATE_APP_PRIVATE_KEY` | commented-out alternative (`bkit-renovate.yml:62-66`) | — | not a read; fine |
| `vars.RENOVATE_GIT_AUTHOR` | optional with default (`bkit-renovate.yml:92`; declared `.bkit/.env.example:60`) | default commit author | fine |
| `BKIT_NPM_TOKEN` (inverse: set, never read) | declared credential, no reader | — | finding → dead-code-4 |
| `BKIT_GATEGUARD`, `BKIT_READGUARD`, `BKIT_ALLOW_CONFIG_EDIT`, `BKIT_SHIP_GATE_OVERRIDE`, `BKIT_NO_UPDATE_CHECK` | declared in docs; opt-out switches | unset → control stays on | fine |

Gating vars → `docs/failures.jsonl` rows written by this run; cross-check → `bkit-audit-duplication`.

### Config

<!-- prettier-ignore -->
| Flag / key | Value per environment | Age | Verdict |
| --- | --- | --- | --- |
| Feature flags | none — `git grep -l -i -E 'featureFlag\|feature_flag\|launchdarkly\|unleash\|growthbook\|isFeatureEnabled'` (excl. `docs`, vendored skills, `dist`) → 0 | — | N/A |
| `package.json` `bkit.*` (`capstoneJob`, `ciWorkflow`, `cloudAgents`, `githubProject`, `issueTracker`, `opencodeProvider`, `opencodeProviders`, `roadmapNext`) | one repo, one value | — | all read: engine (`commands/setup/setup.ts:106`, `checks/tips/catalogue.ts:162`, `checks/after/github.ts:72,154,326`, `cli.ts:133,684`) or prompt (`roadmapNext` → `.bkit/core/prompts/bkit-utility-update-roadmap.md:59`) |
| `.bkit/version` (`canonicalHashes`, `claudeAllowDerived`, `pinnedVersion`) | — | — | all read (`commands/install/upgrade.ts`, `install/modules/claude.ts`, `checks/before/version.ts`) |
| `slop-scan.config.json` (`ignores`, `overrides`, `plugins`, `rules`) | — | — | read by slop-scan (third-party schema) |
| Coverage thresholds — `vitest.config.ts:16-19` "No thresholds by design" | unit lane: `--coverage.thresholds.branches=70` (`package.json:76`, run by `bkit-ci.yml:661-667`); integration lane: none (`bkit-ci.yml:691`) | — | default replaced on the unit lane → lying comment → dead-code-11 |

### Assertions

`N/A` — no E2E suite; the test-id search hits only vendored skill prose (Pre-Flight `E2E Locators`).

### Routes

No web routes and no forwarders (CLI package). Stale pointers:

<!-- prettier-ignore -->
| Kind | `file:line` | Verdict |
| --- | --- | --- |
| Doc comment, moved dir | `.bkit/core/engine/checks/before/context-fetch.ts:154` (`.bkit/workflows/bkit-debug.md`) | stale → dead-code-9 |
| Doc comment, moved dir | `.bkit/core/engine/render/hosts.ts:195` (`.bkit/prompts/*.md`) | stale → dead-code-9 |
| Doc comment, moved dir | `.bkit/core/engine/render/trackers.ts:3` | stale → dead-code-9 |
| Architecture doc | `docs/architecture.md:25` (`.bkit/workflows`, `.bkit/prompts`, `.bkit/docs`) | stale → dead-code-9 |
| Test titles / comments | 15 lines across 7 test files (listed in dead-code-9) | stale → dead-code-9 |
| Test fixture pinning the old path | `shared/protected-paths.test.ts:76-77`, `commands/comply.test.ts:55` | asserts behaviour for a path that no longer exists → dead-code-9 |
| Default path that never existed | `scripts/linear/linear-to-github-import.ts:50` | → dead-code-10 |
| Comment naming an absent tool | `shared/protected-paths.ts:97` (`ts-node`) | folded into dead-code-1 |
| Hook command paths | `.claude/settings.json`, `.cursor/hooks.json`, `.codex/hooks.json`, antigravity and opencode plugin paths | all resolve; live |
| Old `.bkit/src` path | `git grep` → 0 | clean |

### Fetches

`N/A` — no raw `fetch(` in source (Step 9 evidence); outbound calls go through `gh api` to GitHub REST paths.

### Schema

`N/A` — no SQL files and no database client (Step 10 evidence).

### Events

<!-- prettier-ignore -->
| Name | Sender | Function | Cron target | Verdict |
| --- | --- | --- | --- | --- |
| `push` / `pull_request` / `workflow_dispatch` → bkit-ci | git push, PRs | `.github/workflows/bkit-ci.yml` | — | live: 68 runs, last 2026-10-17 |
| `workflow_run` [`bkit-ci`] → bkit-cloud | bkit-ci completion with a `bkit [auto route]` head commit | `.github/workflows/bkit-cloud.yml:32,99-102` | — | name matches bkit-ci's `name:`; marker sender absent since 2026-06-01, secrets unset → dead-code-3 |
| `workflow_dispatch` → bkit-cloud | manual / CLI dispatch | same | — | no executed run since 2026-06-01 → dead-code-3 |
| `push` tags `v*` → release | `v*` tag push | `.github/workflows/release.yml` | — | live: 97 runs, last 2026-10-17 |
| `schedule` → bkit-renovate | cron | `.github/workflows/bkit-renovate.yml` | itself | live: 6 runs, all success, last 2026-10-17 |

### Strings

<!-- prettier-ignore -->
| Surface | Item | Reader | Verdict |
| --- | --- | --- | --- |
| i18n catalogue | — | — | N/A — `git ls-files` → 0 locale / message files |
| Asset | 16 README PNGs (`.github/assets/*-{dark,light}.png`) | none | unread → dead-code-6 |
| Asset | 16 README SVGs | `README.md` | live |
| Asset | `bkit-social.png` | GitHub Settings social preview, manual upload (`readme-art.mjs:228-229`) | live (platform consumer) |
| Asset | `bkit-social.svg` | rasterisation input only | generator intermediate; decide with dead-code-6 |
| Asset | `docs/claude-model-effort.html` | none in repo; printable A4 sheet, not listed in `.agents/docs.md` | human-opened doc, not code — no finding |
| Script | `scripts/readme/readme-art.mjs` | own header only (`:1-3`) | manual tool, live (assets regenerated 2026-10-17); no doc names it |
| Script | `scripts/linear/linear-to-github-import.ts` | its README + `docs/decisions.jsonl:238-239` | manual tool; default path → dead-code-10 |
| Script | 2 shipped `.test.mjs` + 1 repo copy | nothing executes them | → dead-code-2 |
| Script | other 24 `scripts/` files (incl. `scripts/ci/check-dependency-audit.test.mjs`, byte-identical to the template copy vitest runs) | `.husky/pre-push`, `package.json` scripts, vitest spawn tests, sibling scripts | live |
| Manifest scripts | 35 in `package.json` | CI, husky, lint-staged, other scripts, docs | all invoked or documented; `format:tables` is a manual fixer named only in `package.json` (its `format:tables:check` twin runs in `bkit:gate:static`, `package.json:57`) — candidate, not a finding |

### Candidates

False-positive classes (Step 13):

<!-- prettier-ignore -->
| Class | Removed | Evidence |
| --- | --- | --- |
| Build output `dist/**` | 87 files | committed 1:1 build of `.bkit/core/engine` (`package.json` `files`, `bin`) |
| Host hook files referenced from config | 36 of 37 (survivor: `.claude/hooks/gate-paths.generated.cjs` → dead-code-1) | host settings / hooks.json / plugin paths resolve; `.bkit/core/hooks/*.js` inlined via `{{BKIT_PART …}}` |
| Copy-and-own templates `.bkit/templates/scripts/**` | 9 of 11 (survivors: 2 `.test.mjs` → dead-code-2) | spawned by `audits/templates/*.test.ts` |
| Vendored skills `.agents/skills/**` | 4 files | third-party skills, not bkit code |
| Archived plan spike `docs/plans/202610/logs/504-example-project/spike/**` | 21 files | plan evidence, never executed |
| Script-invoked / manual tools `scripts/**` | 7 of 8 (survivor: `scripts/ci/lanes/resolve-push-base.test.mjs` → dead-code-2) | invokers in `Strings` |
| Production-only entries | 8 files | `package.json` scripts / vitest config (`Reachability`) |
| Exports used in own file | 225 symbols | `ignoreExportsUsedInFile` → 0 |
| Test-only exports | 9 symbols kept as seams | → dead-code-8, dead-code-1 |
| System binaries | 5 | `jq`, `actionlint`, `pgrep`, `direnv`, `vale` |
| Mock-factory keys | 0 — 9 test files use `vi.mock`; no candidate was a mock key | `git grep -l "vi.mock"` |
| Ambient augmentation / platform splits / preview default exports | absent | `declare module` / `declare global` → 0; no `.ios` / `.android` / `.web` / `.native` files; no preview server |

Survivors (Step 14):

<!-- prettier-ignore -->
| Candidate | `file:line` | Language server (Serena, ×2) | Text search (`git grep`) | Opened | Verdict |
| --- | --- | --- | --- | --- | --- |
| `gate-paths.generated.cjs` | `.claude/hooks/gate-paths.generated.cjs:1-53` | n/a (CJS outside tsconfig) | generator + drift test only | yes | dead-code-1 |
| `generateGatePathsCjs` | `.bkit/core/engine/shared/protected-paths.ts:105` | in-file only (`:158`) | drift test + `dist/` copy | yes | dead-code-1 |
| `GATE_CONFIG_PATTERNS` | `protected-paths.ts:59` | in-file only (`:91,106`) | tests; same-named JS const in `gateguard-engine.js:9` | yes | dead-code-1 |
| `isGateConfig` | `protected-paths.ts:86` | `{}` ×2 | `protected-paths.test.ts` only; other hits are the JS twin (`gateguard-engine.js:53`) and regex strings in tests | yes | dead-code-1 |
| 3 `.test.mjs` files | see dead-code-2 | n/a (outside tsconfig) | path keys in `dogfood-templates.test.ts:271,276` only; no spawn | yes | dead-code-2 |
| 8 test-only exports | see dead-code-8 | `{}` ×2 each (LS excludes tests) | `*.test.ts` importers only | yes | dead-code-8 |

### Runtime

Window 2026-05-25 → 2026-10-17. Source: `gh run list --workflow <file> --limit 300 --json conclusion,createdAt`. Baseline: no previous numbers.

<!-- prettier-ignore -->
| Workflow | Runs | Executed (non-skipped) | Last executed | Verdict |
| --- | --- | --- | --- | --- |
| `bkit-cloud.yml` | 126 | 12 (11 failure, 1 success) | 2026-06-01T06:41Z | zero executions for 4.5 months → dead-code-3 |
| `bkit-ci.yml` | 68 | 68 | 2026-10-17 | live |
| `release.yml` | 97 | 97 | 2026-10-17 | live |
| `bkit-renovate.yml` | 6 | 6 | 2026-10-17 | live |

CLI command executions: `Not Checked` (no per-command telemetry from consumers).

### Checked

- Resolved `tsconfig.json` + `tsconfig.test.json`; linter presence; ad hoc unused / unreachable compile.
- knip 6.41.0: default, `--production`, both with `ignoreExportsUsedInFile`, and `--strict --dependencies`; stderr per pass.
- `package.json` dependencies, overrides, binaries.
- Env names across engine, scripts, hooks, workflows vs 4 declaration sources + GitHub secrets / variables / environments.
- Feature-flag search; `package.json` `bkit.*`, `.bkit/version`, `slop-scan.config.json` keys; coverage-threshold layering.
- Stale-pointer search for `.bkit/workflows`, `.bkit/prompts`, `.bkit/docs`, `.bkit/src`; hook command paths for all 5 hosts.
- Raw `fetch(` and SQL searches (absent).
- 4 workflows: triggers both ends + run histories.
- 34 `.github/assets` files + 1 docs HTML; 35 manifest scripts; 28 `scripts/` files.
- False-positive classes; Serena + `git grep` elimination of every survivor.
- GitHub Pages and branch-protection settings (read-only `gh api`) for `Beyond the Steps`.

### Not Checked

- **Always-true / always-false lint** (`@typescript-eslint/no-unnecessary-condition`): typescript-eslint 8.71.2 requires `typescript <6.1.0`; the repo runs 7.0.2. No substitute run.
- **Unused class members:** knip 6.41.0 has no `classMembers` issue type (`ERROR: Invalid issue type: classMembers`), and `noUnusedLocals` does not cover public members. 2 production classes unchecked (`commands/lib.ts`, `commands/workflow/branches.ts`).
- **CLI command execution counts:** no per-command telemetry; static only.
- **Runtime "zero executions" for engine code paths:** only workflow runs have history.
- **Outcome of the unrun `.test.mjs` files:** not executed; this run checks reachability only.
- **Consumer installs of shipped templates:** outside this repo.
- **Absent surfaces:** E2E locators, schema / hosted DB, i18n catalogue, raw fetches — `N/A` with evidence above.
- **knip `cycles`:** module-graph shape → `bkit-audit-architecture`.

### Standards Coverage

<!-- prettier-ignore -->
| Anchor / issue type | Version · date read | Status |
| --- | --- | --- |
| knip | 6.41.0, released 2026-10-09; release notes read 2026-10-17 (6.40.0 excluded test files from production entries) | checked — Steps 3-4 |
| knip `files` | 6.41.0 | checked (Step 3) → dead-code-1, dead-code-2 |
| knip `exports` / `nsExports` | 6.41.0 | checked (Step 3) → dead-code-8 |
| knip `types` / `nsTypes` | 6.41.0 | checked (Step 3) → 0 |
| knip `enumMembers` / `namespaceMembers` | 6.41.0 | checked (Step 3) → 0 |
| knip `duplicates` | 6.41.0 | checked (Step 3) → 0 |
| knip `dependencies` / `devDependencies` / `optionalPeerDependencies` / `unlisted` / `unresolved` / `binaries` | 6.41.0 | checked (Step 4) → 0 (binaries = system tools) |
| knip `catalog` / `catalogReferences` | 6.41.0 | not applicable — no pnpm catalog or workspace |
| knip `cycles` | 6.41.0 | not applicable — architecture sweep |
| knip `classMembers` | removed in 6.x | not available → `Not Checked` |
| TypeScript `noUnusedLocals` / `noUnusedParameters` / `allowUnreachableCode` / `allowUnusedLabels` | tsc 7.0.2 (latest stable 7.0.2, next 7.1.0-dev, `pnpm view typescript`); tsconfig reference read 2026-10-17 (page is 6.0-era) | finding → dead-code-5 |
| typescript-eslint `no-unnecessary-condition` | 8.71.2; rule page read 2026-10-17 (needs type info + `strictNullChecks`) | finding → dead-code-5; cannot run → `Not Checked` |
| Unused-index advisor (Splinter `0005_unused_index`) | — | not applicable — no database |
| DB inspection CLI (`supabase inspect db`) | — | not applicable — no database |
| Feature-flag cleanup (Piranha) | — | not applicable — no feature flags |
| Runtime-usage removal (SCARF) | — | not applicable — no usage telemetry; GitHub Actions history used instead (Step 15) |
| i18n key checker (`i18n-check`) | — | not applicable — no catalogue |
| Practice: knip `ignoreExportsUsedInFile` for baseline configs | knip docs | adopt — proposed in `Process Improvements` |
| Practice: production mode beside the default run | knip docs | adopted this run |

### Beyond the Steps

**(a) Reachability-touching changes.** Baseline, no previous commit. Checked anyway:

- 2026-10-11 move of `.bkit/workflows/` + `.bkit/prompts/` under `.bkit/core/` (3b8d9468) → 21 stale pointer lines left (dead-code-9); the older `.bkit/src` path is clean.
- README art regenerated 2026-10-17 (`scripts/readme/readme-art.mjs`) → 16 PNGs re-committed with no reader (dead-code-6).
- bkit-cloud lane edited 2026-10-12 → 2026-10-15 with no live run since 2026-06-01 (dead-code-3).
- Outdated-bkit warning (c8caba09, 34119d38): new `shared/bkit-latest.ts` and edits to `commands/workflow/{branches,repo,workflows}.ts` → no unused file or export in any knip pass.

**(b) Bounded pass.**

- `MIRROR_PATH_PREFIXES` (`.bkit/core/engine/shared/protected-paths.ts:32-39`) lists only `.claude/`, `.cursor/`, `.opencode/` `agents/` + `commands/`. `.codex/agents/`, `.agents/plugins/bkit/` and `.agents/skills/bkit-*` are generated mirrors too, so `ruleNoMirrorEdit` (`commands/comply.ts:20,111`) does not flag hand edits on 2 of 5 hosts. Whether that is intended is not written down. Impact is low because `bkit check` drift-gates every mirror. → `bkit-audit-gates`.
- `devRequiresChecks` (`commands/workflow/runs.ts:1553-1557`) returns false on any `gh api` failure, so a 403 (token without admin scope) reads the same as a 404 (no protection). Correct here today (`gh api repos/cbartens/bkit/rules/branches/dev` → `[]`; protection → 404). `checks/after/github.ts:25-39` separates 404 from unknown for `main`. → `bkit-audit-config`.
- GitHub Pages: `gh api repos/cbartens/bkit/pages` → `build_type: workflow`, source `main`; a `github-pages` environment exists; 0 deployments, 0 builds; no workflow under `.github/workflows/` deploys Pages. A hosting setting nothing feeds. → `bkit-audit-config`.
- Overlap with this cycle's parallel reports: dead-code-1 = `duplication-4` (`docs/audits/202610/duplication.md`; ledger key `audit-duplication-gate-config-patterns-two-tables` reused); dead-code-2 = `testing-7` (`docs/audits/202610/testing.md`, same three files); dead-code-4 = `security-3` (`docs/audits/202610/security.md`; ledger key `audit-security-unused-npm-token-repo-secret` reused). One tracker issue each.
- `docs/failures.jsonl`: 7 open rows at session start, none on a reachability surface.

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Make the gate-config table the one the runtime guard loads, and retire the unread generated `.cjs` | dead-code-1 | `MEDIUM` | `/bkit-design` | Two fixes are open (generate the guard's list from the TS table, or drop the TS table and `.cjs` and test the JS guard directly), and which file is meant to be the source is not written down |
| 2 | Run every shipped `.test.mjs` from vitest | dead-code-2 | `MEDIUM` | `shortcut:build` | The pattern already exists at `ci-scripts.test.ts:238-243`; a test-only change in one file |
| 3 | Decide the dogfood cloud lane: set its runner secrets, or disable it in this repo | dead-code-3 | `MEDIUM` | `manual` | Both fixes are GitHub repo settings (secrets, or `gh workflow disable`) |
| 4 | Delete the unread `BKIT_NPM_TOKEN` secret and revoke the npm token | dead-code-4 | `MEDIUM` | `manual` | The change is in GitHub Settings and on npmjs.com |
| 5 | Turn on `noUnusedLocals` and `noUnusedParameters`, and remove the 8 unused declarations | dead-code-5, dead-code-7 | `MEDIUM` | `/bkit-build` | The flags and all 8 sites are known; `tsconfig.json` is gate config, so no shortcut |
| 6 | Record a consumer for the 16 README PNGs, or stop generating them | dead-code-6 | `MEDIUM` | `/bkit-design` | Why the PNGs are generated is not written down, so keep-or-stop is an open question |
| 7 | Point comments, test titles and fixtures at `.bkit/core/`, require `--csv` for the Linear importer, correct the coverage-threshold comment, and name the test ties of the test-only exports | dead-code-8, dead-code-9, dead-code-10, dead-code-11 | `LOW` | `/bkit-build` | The edits are known, but `vitest.config.ts` is gate config, so no shortcut |

### Process Improvements

**Universal** (proposed step changes; template untouched):

- **Step 3:** make knip `ignoreExportsUsedInFile` the first baseline-readiness check. Here it took 225 default-run export / type hits to 0 and 455 production hits to 9; without it the export signal is noise.
- **Step 12 (c) / Step 14:** a basename search misses computed spawn paths (`AUDIT.replace(/\.mjs$/, ".test.mjs")`, `ci-scripts.test.ts:239`). Before calling a script unrun, search its stem and every `spawn` / `exec` site too.
- **Step 2:** add the case "linter cannot run on the project's compiler version" (typescript-eslint peer range vs TS 7) → detector-off finding plus `Not Checked`.
- **Step 3 / Step 16:** knip 6 dropped `classMembers`; the step should name the gap and the fallback (language-server refs per public member) when the project has classes.
- **Step 13:** add the class "generated artefact with no runtime reader, guarded only by a drift test". A drift test proves the artefact matches its generator, not that anything runs it (dead-code-1).

**Project** (applied below `bkit:end` in `docs/templates/bkit-audit-dead-code.md`): new `## Project Instructions` — exact knip and tsc commands, env declaration sources, false-positive paths, tool gaps (Serena excludes tests; `rg` via `xargs`; typescript-eslint vs TS 7; knip `classMembers`), computed spawn paths, `Permissions`.

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [x] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [x] **Summary:** names count per severity and candidate / surviving counts.
- [x] **Series:** `Reachability` counts and `Runtime` zeroes beside previous report's numbers, or marked baseline.
- [x] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [x] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [x] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [x] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->
