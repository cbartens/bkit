<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.1 — do not edit; run `bkit upgrade` to refresh -->

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
> - Every claim cites this run's evidence (`file:line`, or command / query and its output) and tool behind it; a previous report's figure, list, or status is a lead, not evidence.
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

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Clean Tree:** Steps 2–17 — clean `git status` at recorded commit; one checkout all steps. Fallback: detached worktree off integration branch; dirty-path candidates = hypotheses.
- [ ] **Text Search:** Steps 5–14 — repo search (`git grep`, ripgrep). Fallback: none → those steps `Not Checked`.
- [ ] **Reachability Scanner:** Steps 3–4 — ad hoc, not committed dependency (e.g. `pnpm dlx knip`, vulture). Fallback: language-server refs + text search; scanner categories `Not Checked`.
- [ ] **Web:** Step 16 — fetch anchor standards. Fallback: versions unread.

#### Conditional

Verify only when applicable.

- [ ] **Compiler Unused Checks:** Compiled language → Step 2 — resolved compiler/linter config, not base file. Fallback: `Detectors` `Not Checked`.
- [ ] **Language Server:** Typed language → Steps 13–14 — refs (Serena, `tsserver`, pyright). Fallback: text search only; name it; re-run every empty result before recording dead.
- [ ] **Git History:** Flags or introduction dates → Step 6 — `git log -S`. Fallback: flag ages `Not Checked`.
- [ ] **E2E Locators:** E2E asserts test ids → Step 7. Fallback: skip with evidence; `Assertions` = `N/A`.
- [ ] **Hosted DB:** SQL migrations or hosted DB → Step 10 — inspection CLI + unused-index advisor (e.g. `supabase inspect db`, Splinter `0005_unused_index`). Fallback: static grep only; runtime zero-use `Not Checked`.
- [ ] **Runtime Counts:** Production request/job/query stats → Step 15 — e.g. host per-route counts, job-runner runs, `pg_stat_statements`. Fallback: static only; "zero executions" `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detectors:** Compiled language → scanner sees module exports only; dead branch/parameter inside live function → compiler + linter. Read resolved config per workspace, not base: unused-local, unused-parameter, no-unreachable-code; linter unused-vars, unreachable, always-true/false (e.g. `@typescript-eslint/no-unnecessary-condition`). Workspace override or file disable switches one off silently. Detector off = finding → `bkit-audit-gates` (gate candidate). Linter cannot run on project's compiler version (e.g. peer dependency range excludes it) → same detector-off finding; its rules → `Not Checked`. **Done when:** `Detectors` lists each config and resolved value.
- [ ] **Step 3 — Reachability:** Ad hoc scanner, same resolved version both runs; record version. Do not add it as a dependency, and do not wire a CI gate this run. Report baseline-config readiness. First readiness check: scanner ignores exports used inside their own file (e.g. knip `ignoreExportsUsedInFile`); without it export signal = noise → run with and without, report both counts. Gate before `False Positives` exclusions encoded → structural noise → disabled. Do not encode test-only code as ignore entries or negated project patterns — plugins add test files as entries; production mode separates. Check scanner stderr before trusting: plugin load failure drops entry class → false unused files. Signal: files, exports, types, duplicates. Dependency categories → `Dependencies` pass, not mixed. Same version in production mode (or strict: implies production + each workspace uses only its own deps). Export used default run, unused production → test/config-only class. Report both runs side by side. Scanner has no class-member check (e.g. knip 6: no `classMembers` issue type) and project has classes → gap in `Not Checked`; fallback = language-server references per public member. **Done when:** version, both runs, with/without in-file-use counts, plugin-load errors in `Reachability`.
- [ ] **Step 4 — Dependencies:** Scanner dependency mode per workspace, categories the scanner offers (e.g. knip: unused, unlisted, unresolved, unlisted binaries, catalog entries unreferenced). Before unused verdict → search name across manifest scripts, config, CI. Config-only consumers (e.g. linter, formatter, CSS presets, bundler plugins, `@types/*`) = usual false hits. Unused = install/supply-chain surface; unlisted = hoisted from another workspace. Unlisted or advisory → `bkit-audit-dependencies`. **Done when:** `Dependencies` row per candidate: name · class · config-or-CI reader · verdict.
- [ ] **Step 5 — Env Vars:** Text search only — env names are string literals; language server cannot see them. Every referenced env vs declared (examples, task runner, typed env schema — sources in `Project Instructions`). Referenced, never declared → control cannot switch on. Triage: platform-injected = fine; optional + safe default = fine (read default); gates control (absence disables limiter, auth, feature) = finding. Third group → path never executed in any environment. Omitted declaration source → `Process Improvements` gap. Gating var → `docs/failures.jsonl` via `@bkit-utility-update-failures`, and `bkit-audit-duplication`. **Done when:** `Env Vars` row per referenced-undeclared: group · absence effect · verdict.
- [ ] **Step 6 — Config:** Deadness no scanner reports. (a) Feature flags stuck on/off; hardcoded or same every environment → branch never runs. Per flag: every read + value per environment; all same → other branch dead = finding. Age flags (`git log -S`); >90 days, rollout complete = finding even if environments differ. (b) Config keys no reader, or name removed object — search key; language server reads typed source only. (c) Default replaced in every environment by later layer = lying docs. Dead control → `docs/failures.jsonl` like `Env Vars`, not tidiness. **Done when:** `Config` row per flag/unread key: value per environment · age · verdict.
- [ ] **Step 7 — Assertions:** E2E asserts test ids → unmatched locator passes; test id no component renders = vacuous spec, green CI. Extract asserted E2E ids vs component-rendered ids (both string literals). **Done when:** `Assertions` lists asserted-but-unrendered ids, or `none`.
- [ ] **Step 8 — Routes:** Two checks; the second is where the defects are. (a) Forwarders. A route whose page only redirects renders nothing: no content, an extra round trip, and it reads in every route list as a page. Use the project's derived list, do not eyeball the tree. The usual justification is that old bookmarked or emailed links must keep working — check that claim against the deployment doc before accepting it. (b) What still points at a forwarder, or at a path that moved. Grep the old path, not the new one. Stale cache-invalidation call (e.g. Next.js `revalidatePath` / `revalidateTag`) refreshes the stub; the page a user reads is never invalidated. Stale end-to-end helpers drive every spec through the redirect. A middleware allowlist arm that can no longer match reads as a live carve-out. A deep-link or email builder whose redirect drops a query param loses the token or id silently. A doc comment naming the old directory is free to fix, and it makes the next reader mistrust every other comment in the file. Relative imports hide the dependency: a repo-wide grep for the path string misses `./old/page`. After a route delete, run the typecheck before believing a grep was complete. Stale generated route types are build output: remove them and re-run, do not read them as source errors. A test that pins the call argument (`toHaveBeenCalledWith` the path) cannot tell a live pointer from a dead one. "A test covers it" is no evidence in this step. **Done when:** `Routes` row per forwarder and per stale pointer: kind · `file:line` · verdict.
- [ ] **Step 9 — Fetches:** Clients call API paths with raw fetch → the mirror of `Routes`. Route-side asks whether a route has a caller. This asks whether a call has a route. Neither finds the other's class. Compiler-checked RPC clients are out of scope (a missing route fails typecheck). Raw fetch is the whole exposure: a URL inside a template literal, so lint, typecheck, and the reachability scanner all pass on a path that 404s. Two routing layers (where the stack has them) → model both. The outer framework decides whether a handler runs (static directory vs catch-all that forwards a subtree). The inner router then routes within what was forwarded. A route correctly mounted on the inner router and unreachable from the outer layer is its own class (`stranded`). Checking either layer alone says the route is fine. Read a finding as two questions: the path has no handler, and why nobody noticed. The answer is at the call site — `if (res.ok)` skips the block, `if (!res.ok) return success` fails open. A 404 is a successful HTTP response, so nothing throws. The report names the guard and the route. Confirm against the deployment (status code of the path beside a known-live path) before writing it up. Two false positives, do not reintroduce them: a path in a doc comment is not a call; a prefix test (`startsWith`) is not a request. The dangerous failure is silent: an extractor that stops at `?` never reports the URL, so it is not seen. When changing extraction, the fetched-path count must go up, not merely the findings list get shorter. No project script → extract literals and match routes by hand; record the gap in `Process Improvements`. **Done when:** `Fetches` row per unreachable call and per stranded route: path · call-site guard · deployment status · verdict.
- [ ] **Step 10 — Schema:** SQL migrations or hosted DB — only step here. Unused column/orphan SQL function still costs migrations + access review. From the schema source (migrations, schema file, or generated types): per table, column, view, SQL function, access policy (e.g. RLS) → search code (table calls, columns, RPC), other SQL (triggers, policies, functions), deployed serverless functions (e.g. edge functions). Zero refs all three = candidate. Runtime on deployed DB: table no scans/writes since stats reset (record reset time); inspection-CLI table/index stats; unused-index advisor. Unused indexes → also `bkit-audit-database` — name, do not duplicate capacity finding. Thin/pre-launch traffic → zero-use = static candidate, never proof alone. **Done when:** `Schema` row per candidate: object · static refs · runtime counts · reset time · verdict.
- [ ] **Step 11 — Events:** Jobs, crons, event bus — mirror of `Fetches` for background work. Event names = string literals; scanner + language server blind. List every send, registered function + trigger/cron, every cron + target. Sent event → registered function; registered trigger → sender or cron; cron → existing target. No trigger = dead function; no function = unfireable control → route like `Env Vars`. **Done when:** `Events` row per name: sender · function · cron target · verdict.
- [ ] **Step 12 — Strings:** (a) Message catalogue — diff keys vs reads each app/shared UI both ways (`i18n-check` or search script). No reader = dead; read missing = renders key name; language server often blind → search. Missing catalogue → `bkit-audit-usability`. (b) Static assets — list shipped (incl. email templates); search basename in code, config, CSS; scanner skips assets; native bundle ships unused. (c) Scripts — per manifest script + scripts tree file → search name in CI, hooks, task runner, docs, other scripts, plus its stem and every process-spawn site (e.g. `spawn`, `exec`, a directory listing filtered by extension) — runtime-built path misses name search; no invoker = candidate; doc-only = candidate + reader to update. **Done when:** `Strings` row per unused key, missing key, unread asset, uninvoked script.
- [ ] **Step 13 — False Positives:** Filter these before reading anything as a finding. They are structural and recur every run. Ambient module augmentation: zero importers by design; applied through the compiler include. Never dead. Platform file splits (e.g. RN `.ios` / `.android` / `.web`): one specifier resolves to a per-platform file the scanner cannot follow, so unresolved entries are noise. The filter hides the opposite, so check once per run: for each platform pair, the platform that would load that variant imports the parent. A single-platform component carrying the other platform's file is dead and invisible, because both resolve through the same specifier. Files referenced from config, not code: check the referencing config before believing unused (app config, CI, test-runner project dependencies, agent hooks, deployed functions, an explicit worker registry). Test-only exports: only importer is a test = a seam, not dead code. Report separately from unreferenced code; never delete. A drift test is not a reader: generated artefact referenced only by its generator and a drift test (no runtime reader) = finding, not seam. A default export a preview server requires while code imports the named one. Mock-factory keys: no scanner and no language server sees them; a key inside a mock factory is a real use. **Done when:** `Candidates` names each class and what it removed.
- [ ] **Step 14 — Eliminate:** Language server before opening files. One reference found means the candidate is not dead, and that verdict is sound even though the converse is not. Per surviving unused-export candidate: find the symbol, then find references. Any hit ends it. Empty → fall through to text search, and re-run the empty language-server query once more before recording it. Record both measurements. Pace reference queries: back-to-back calls collapse to zero, and a partial answer looks exactly like a dead symbol. Empty is inconclusive, not absence. Text search over-reports (comments, same-named symbols in other modules); the language server under-reports. Agreement is the signal. Run search in addition to the language server, never instead of it. An unused export needs zero matches repo-wide other than its own definition: search, subtract the defining file, ignore prose comments. An unused file is not reached from JSON, YAML, or other config no typed tool reads. An env-var finding is a control, not an optional setting with a working default. A test id asserted in end-to-end tests exists on a component. No finding without opening the file. Cite `file:line` and the method. Non-typed surfaces (markdown, ledgers, YAML, SQL, shell, string literals) are search, not the language server. **Done when:** every survivor in `Candidates` has `file:line`, method, and the zero-reference re-run.
- [ ] **Step 15 — Runtime:** Production request/job/query stats → static says unreferenced; production says ran. Rank survivors: recent window of per-route counts/logs, job runs, SQL function query stats. "Zero executions" ≠ "zero static references". Thin/pre-launch → signal, never proof; uncalled route ≠ dead. **Done when:** `Runtime` holds window, source, zero-execution rows, or skip.
- [ ] **Step 16 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: row per anchor + scanner issue type → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 17 — Anything Else:** (a) Since previous commit, reachability-touching changes (features/packages deleted/moved, exports/files, deps, env/flags, routes/fetch URLs, events/functions/crons, migrations, i18n, assets, manifest scripts) → one-line verdict each. (b) ~30 min bounded pass: senior code-health flags no step asks; since previous run (incidents, new `docs/failures.jsonl`, `bkit-audit-logs` reports, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and candidate / surviving counts.
- [ ] **Series:** `Reachability` counts and `Runtime` zeroes beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions

- **Text Search:** `rg` is a shell function in agent shells, so `xargs rg` fails (`xargs: rg: No such file or directory`). Use `git grep -n -w -F` for batch reference counts.
- **Reachability Scanner:** single package, no workspaces. Write outputs under repo-root `tmp/<dir>/` (gitignored), never `/tmp`.
  - Default: `pnpm dlx knip@<version> --reporter json --no-progress --no-exit-code > tmp/<dir>/knip-default.json 2> tmp/<dir>/knip-default.stderr`
  - Production: same plus `--production`.
  - Dependencies: same plus `--strict --dependencies`.
  - Used-in-own-file pass: ad hoc config `tmp/<dir>/knip-infile.json` = `{"$schema":"https://unpkg.com/knip@6/schema.json","ignoreExportsUsedInFile":true}`, passed with `--config`, both modes. Never commit it.
  - knip 6 has no `classMembers` issue type; `cycles` belongs to `bkit-audit-architecture`.
- **Compiler Unused Checks:** `pnpm exec tsc --showConfig -p tsconfig.json` and `-p tsconfig.test.json` (extends the first; adds tests). Ad hoc detector run: `pnpm exec tsc --noEmit -p <config> --noUnusedLocals --noUnusedParameters --allowUnreachableCode false --allowUnusedLabels false`.
- **Language Server:** Serena loads `tsconfig.json`, which excludes `**/*.test.ts`, so test-file references never appear; fill the test side with `git grep`. Control symbol with known non-test references: `getCoreRoot` (`.bkit/core/engine/shared/package-roots.ts:60`).
- **Runtime Counts:** GitHub Actions history, `gh run list --workflow <file> --limit 300 --json conclusion,createdAt`. bkit has no per-command CLI telemetry.
- **Step 2 — Detectors:** before planning a lint run, compare `pnpm view typescript-eslint peerDependencies` with the repo's `typescript` version.
- **Step 5 — Env Vars:** declaration sources are `.bkit/.env.example` (shipped source `.bkit/shared/.bkit/.env.example`), `.bkit/README.md`, `.bkit/providers.md`, `.bkit/cloud.md`. CI side: `gh secret list`, `gh variable list`, `gh api repos/cbartens/bkit/environments`; workflow references: `grep -o -h -E 'secrets\.[A-Za-z_]+|vars\.[A-Za-z_]+' .github/workflows/*.yml`.
- **Step 6 — Config:** config surfaces are `package.json` `bkit.*` (readers in `.bkit/core/engine/**` and `.bkit/core/prompts/*.md`), `.bkit/version`, `slop-scan.config.json`. Coverage thresholds layer `vitest.config.ts` under the `package.json` `test:coverage:*` flags and `.github/workflows/bkit-ci.yml`.
- **Step 8 — Routes:** no web routes. Grep the pre-`.bkit/core/` payload paths (`.bkit/workflows/`, `.bkit/prompts/`, `.bkit/docs`, `.bkit/src`) over `.bkit/core/engine/` and `docs/architecture.md`. Check the hook command paths in `.claude/settings.json`, `.cursor/hooks.json`, `.codex/hooks.json` and the antigravity / opencode plugin dirs.
- **Step 11 — Events:** surfaces are the workflows in `.github/workflows/`; `bkit-cloud.yml` fires on `workflow_run` of bkit-ci plus a marker commit, so check both the marker commits (`git log --all --grep`) and its runner secrets.
- **Step 12 — Strings:** `.github/assets/` is generated by `scripts/readme/readme-art.mjs`. Copy-and-own `.test.mjs` files under `.bkit/templates/scripts/ci/**` and `scripts/ci/**` run only when a vitest test spawns them, through computed paths (`AUDIT.replace(/\.mjs$/, ".test.mjs")` in `.bkit/core/engine/audits/templates/ci-scripts.test.ts`): search stems and `spawnSync` sites, not only basenames. Repo copies under `scripts/` are dogfood copies of `.bkit/templates/scripts/` (parity: `.bkit/core/engine/audits/repo/dogfood-templates.test.ts`).
- **Step 13 — False Positives:** structural classes in this repo:
  - `dist/**` — the committed build of `.bkit/core/engine`.
  - Host hook files wired from host configs; `.bkit/core/hooks/*.js` inlined via `{{BKIT_PART <name>}}`.
  - Generated mirrors — a verdict belongs to the source (`.agents/rules.md` § Repo Authoring).
  - Copy-and-own `.bkit/templates/**`, vendored `.agents/skills/**`, archived `docs/plans/**/logs/**/spike/**`, manual maintainer tools in `scripts/**`.
  - System binaries `jq`, `actionlint`, `pgrep`, `direnv`, `vale`.
- **Permissions:** `Bash(pnpm dlx knip@*)`, `Bash(pnpm exec tsc *)`, `Bash(pnpm view *)`, `Bash(gh run list *)`, `Bash(gh secret list *)`, `Bash(gh variable list *)`, `Bash(gh api repos/cbartens/bkit/*)` (read-only GETs), `Bash(git grep *)`, `Bash(git log *)`, Serena `find_symbol` / `find_referencing_symbols`, `WebFetch(domain:github.com)`, `WebFetch(domain:typescript-eslint.io)`, `WebFetch(domain:www.typescriptlang.org)`.
