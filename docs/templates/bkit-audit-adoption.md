<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.0.2 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# bkit Adoption Audit

> [!CAUTION]
> **Purpose:** Every file bkit ships — written and kept current (`core/`, `shared/`) or copy-and-own (`templates/`) — used, and used correctly; nothing missed.
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
> - NEVER print or copy a token, key, or secret value; names and presence only.
> - never run `bkit install` / `bkit upgrade`; bkit commands = `bkit check`, `bkit doctor` only.
> - NEVER run a hook, script, or tool that writes, commits, pushes, or calls a remote write API; syntax checks and read-only modes only.
> - No skip record exists: every unadopted template is re-listed each run, with the previous verdict and its age.

## Universal Instructions

### Context & Goals

bkit ships three folders. Path inside a folder = path it lands at in the repo.

<!-- prettier-ignore -->
| Package folder | Install does | Repo gets |
| --- | --- | --- |
| `.bkit/core/` | Writes, keeps current; `engine/`, `workflows/`, `prompts/`, `LICENSE.md` never written as-is (workflows + prompts render to host agent and command copies) | Whole files, managed blocks, hooks, reference docs in `.bkit/`, audit and plan templates |
| `.bkit/shared/` | Writes, keeps current | bkit blocks and keys inside files you also edit (`docs/*.md`, `.gitignore`, settings, tool-server config) |
| `.bkit/templates/` | Never writes into the repo; raw copy at `.bkit/templates/`, `bkit upgrade` lists changed paths | Nothing until you copy one and own it |

`bkit check` proves written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a written doc holding only bkit's block, a shipped audit never run. Target failure: **a shipped piece that would have caught something sits unused or half-wired, and every check stays green** — e.g. `.husky/pre-push` never copied, tests run only in CI; `.lintstagedrc.json` copied but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` holds bkit's block and nothing else; `bkit-audit-security` never run; three releases behind with hand edits inside managed blocks.

**Applies when:** `.bkit/version` present. Absent → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after `bkit upgrade`, after adopting or dropping a template, and after adding an agent host.

**Anchor Standards:** record bkit version and date read. Newer version → `Standards` step reads what changed.

- bkit, at the installed version: `.bkit/templates.md` (Contract, placeholders, Context-fetch blocks), `.bkit/README.md` § File ownership and § Ongoing CLI, `.bkit/install.md`; release notes since pinned version.
- Config reference of each tool behind an adopted template (e.g. Husky, lint-staged, Vale, Prettier, Renovate, Dependabot, GitHub Actions workflow syntax, direnv); record version read.

### Scope

- Inventory: every file in the package's `core/`, `shared/`, `templates/` vs `.bkit/version` `canonicalHashes` vs the repo's `.bkit/templates/` copy.
- Version: pinned vs installed vs registry latest.
- `bkit check` drift; `bkit doctor` advisories.
- Hosts: agent hosts in use vs bkit hosts installed; host agent, command, and hook copies per host.
- Written files: managed blocks and owned keys untouched; files bkit shares with you carry your part.
- Audit templates: each run within its cadence.
- Templates: each adopted, or not and why; adopted copies filled, reconciled, merged after upgrade, wired, running.
- Context-fetch blocks: one per context with a lane; each matches the lane it names.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Agent permissions, hooks firing, tool servers, parity across hosts — bkit-shipped gates included | Agent config sweep | `bkit-audit-agents` |
| Whether a doc's content is true | Documentation sweep | `bkit-audit-documentation` |
| Branch protection, required checks, hosted variables | Config sweep | `bkit-audit-config` |
| CI token permissions, action pinning, secret rotation | Security sweep | `bkit-audit-security` |
| Lint and scanner suppressions inside adopted configs | Slop sweep | `bkit-audit-slop` |
| Whether a sweep here should become a gate | Gate sweep | `bkit-audit-gates` |
| Copying, editing, or merging a template; running `bkit install` / `bkit upgrade` | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Checkout:** Steps 2–11 — repo with `.bkit/version`. Fallback: none; absent → `N/A` and STOP.
- [ ] **Package:** Step 2 — installed package root (e.g. `node_modules/@cbartens/bkit/.bkit/`, resolved via the package manager). Fallback: unpack the pinned version (e.g. `npm pack @cbartens/bkit@<pinnedVersion>` into a throwaway dir); else inventory from `.bkit/templates/` + `canonicalHashes` only, `core/` + `shared/` unwritten files `Not Checked`.
- [ ] **bkit CLI:** Steps 4, 5 — `bkit check`, `bkit doctor` (or `pnpm bkit …`). Fallback: hash written files against `canonicalHashes` by hand; advisories `Not Checked`.
- [ ] **Registry:** Step 3 — latest version and release notes (e.g. `npm view @cbartens/bkit version`, release page). Fallback: pinned vs installed only; currency `Not Checked`.

#### Conditional

Verify only when applicable.

- [ ] **CI Host Read:** Repo has CI → Steps 8, 9 — workflow list, job names, recent runs, artifact names (e.g. `gh workflow list`, `gh run list`, `gh run view --json jobs`). Fallback: workflow files only; lane matching `Not Checked`.
- [ ] **Template Tools:** ≥1 adopted template → Step 9 — each tool behind one, installed version (e.g. `npx husky --version`, `vale --version`, `npx lint-staged --version`). Fallback: version from lockfile; runs `Not Checked`.
- [ ] **Machine Config:** Audit runs on a developer machine → Step 9 — local git config (e.g. `git config core.hooksPath`), direnv allow state. Fallback: repo-level only; machine wiring `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. Carry each `Adoption` verdict forward with its age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** List every file in the package's `core/`, `shared/`, `templates/`. Landing path = path inside the folder; `core/engine/`, `core/workflows/`, `core/prompts/`, each `LICENSE.md` → no landing (workflows + prompts → Step 5 host copies). Join: package file · landing path present · in `canonicalHashes` · repo `.bkit/templates/` copy matches package `templates/`. Kind per file: whole file / managed block / owned keys / template. Findings: `core/` or `shared/` file with landing path absent; `canonicalHashes` entry the package no longer ships; repo `.bkit/templates/` differing from package. Group a folder into one row only when every file shares one verdict. **Done when:** `Inventory` row per shipped file or uniform folder: folder · landing path · kind · present · recorded.
- [ ] **Step 3 — Version:** `pinnedVersion` vs installed package vs registry latest; pinned ≠ installed = package bumped without `bkit upgrade`. Behind → release count; release-note changes touching this repo; template paths changed since pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
- [ ] **Step 4 — Check and Doctor:** `bkit check`: exit code, each drift line → cause. `bkit doctor`: each advisory → adopt / reject (why) / not applicable; previous report's reject carried forward, re-raised only when the advisory text changed. **Done when:** `Check and Doctor` row per drift line and advisory.
- [ ] **Step 5 — Hosts:** Agent hosts in use (repo config dirs, team use; newest `bkit-audit-agents` `Hosts` as cross-check, not source) vs bkit hosts installed. Per installed host: one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, every `core/` hook file present, executable, and wired in that host's settings. Findings: host in use with no bkit install (agents there run without bkit gates); missing or extra copy; hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts → `bkit-audit-agents`. **Done when:** `Hosts` row per host: in use · installed · agent copies · command copies · hooks wired.
- [ ] **Step 6 — Written Files:** (a) Every `bkit:start` / `bkit:end` block and owned key: untouched (Step 4 drift). Hand edit → move below `bkit:end` / to `Project Instructions`; bkit-shipped defect → upstream bkit fix. (b) Files bkit shares with you (`shared/docs/*.md`, `AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config): your part present for every block that expects one — a doc holding only bkit's block is unadopted. `.bkit/.env.example` → `.bkit/.env` present, git-ignored, every listed key set (names only). Tracker or tool-server entry bkit wrote → credential env var it names is set. Whether your part is true → `bkit-audit-documentation`. **Done when:** `Written Files` row per shared file: block untouched · your part present · verdict.
- [ ] **Step 7 — Audits:** Per `docs/templates/bkit-audit-*.md`: `**Applies when:**` met yes / no (evidence); `**Cadence:**`; newest report under `docs/audits/` by commit date (never run = due; same rule as `bkit-utility-update-roadmap`). `N/A` report with evidence = run. Findings: applies and never run; overdue past one cadence; `Process Improvements` `Project` edits proposed in a report and absent from that template's `Project Instructions`. **Done when:** `Audits` row per template: applies · cadence · last run · overdue by · verdict.
- [ ] **Step 8 — Adoption:** Per file in package `templates/`, joined to `.bkit/templates.md` § Contract (file missing from Contract → upstream bkit doc fix): adopted (copy at landing path, or at the destination the Contract names) / not adopted. Not adopted → `gap` (fits this stack, nothing else does the job) / `covered` (name the tool that does) / `not applicable` (evidence, e.g. no GitHub Actions, no markdown docs). Two templates for one job (e.g. Renovate and Dependabot) → one adopted, or `bkit.depUpdater` recorded. Context-fetch: per context (`ci`, `diff`, `e2e`, `runtime`, `web`) the repo has a lane or provider for → block below `bkit:end` in `.agents/context.md`, or `<!-- context-fetch:none … -->` naming it; provider in use (dependency, config, CI step) with a shipped `templates/context/` file and no block → `gap`. Re-list every row each run; diff vs previous report: newly adopted, newly dropped, unchanged with age. **Done when:** `Adoption` row per template file and per context: adopted · verdict · evidence · age.
- [ ] **Step 9 — Templates:** Per adopted template: (a) Filled: no raw `{{…}}` placeholder; default branch and runner real; no stub sentinel left. (b) Reconciled: `diff .bkit/templates/<path> <path>` → each difference adopt / reject (why); placeholder lines differ by design. (c) Merged: package changed the template after the copy's last change (Step 3, `git log` on `.bkit/templates/<path>`) → merged / rejected (why) / pending. (d) Wired: tool behind it installed, and invoked where the template expects — e.g. hook manager installed by a `prepare` script, hooks executable, `core.hooksPath` set; `pre-commit` calls lint-staged; prose linter styles synced and its config loads them; scanner plugin path resolves; tool-server snippet merged into the host's server config; secrets config names real stores; cloud workflow waits on a workflow `name:` that exists; CI template's job names are the ones the repo requires. (e) Runs: one read-only invocation where one exists (e.g. `sh -n` on a hook, `prettier --check`, `vale` on one doc, `actionlint` on a workflow). (f) Ignored: every repo-wide gate (formatter, prose linter, scanner, linter, type checker) skips `.bkit/templates/`. Context-fetch block → job regex and artifact name match exactly the lane it names (CI Host Read); widened regex catching another lane = finding. **Done when:** `Templates` row per adopted template: (a)–(f) verdict each.
- [ ] **Step 10 — Standards:** Confirm anchor versions; read changes since previous report's version. `Standards Coverage`: one row per Contract row, per context-fetch file, and per tool reference read → checked (name step) / not applicable (why) / finding. Deprecated key or option in an adopted config per its tool reference → finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching bkit-written files, `.bkit/templates/`, adopted copies, `.agents/context.md`, or `package.json` `bkit.*` → one-line verdict each. (b) Bounded ~30 min pass: what a senior engineer adopting bkit flags that no step asks; read what happened since previous run (`bkit upgrade` output, new `docs/failures.jsonl` rows, `.bkit/friction.jsonl`) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No secrets:** no token, key, or secret value anywhere in the report.
- [ ] **Repo untouched:** no template copied or edited, no bkit-written file changed, no `bkit install` / `bkit upgrade` run, no writing hook or script run.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Secret value in a tracked adopted copy or a tracked `.bkit/.env` (rotation → `bkit-audit-security`) |
| `HIGH` | `bkit check` failing; pinned ≠ installed; host in use with no bkit install; adopted template whose tool is not installed or never invoked; raw placeholder in an executed file (workflow, hook); cloud workflow waiting on a workflow name that does not exist; context-fetch block matching the wrong lane |
| `MEDIUM` | Template `gap`; edits inside a bkit managed block; unaddressed `bkit doctor` advisory; package change to an adopted template unmerged; unreviewed difference from the template; written doc holding only bkit's block; `.bkit/.env` key unset; audit that applies never run or overdue; repo-wide gate scanning `.bkit/templates/`; context with a lane and no block or opt-out; bkit behind with relevant fix |
| `LOW` | bkit behind, no relevant fix; shipped file missing from the Contract; two updaters adopted with one idle; naming drift, no behaviour change |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: missing gates, then unwired copies, then drift.

<!-- prettier-ignore -->
| ID | Severity | Folder | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Inventory

PENDING

### Version

PENDING

### Check and Doctor

PENDING

### Hosts

PENDING

### Written Files

PENDING

### Audits

PENDING

### Adoption

PENDING

### Templates

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
- [ ] **Summary:** names count per severity, bkit version, hosts, and templates adopted / `gap` / `covered` / `not applicable`.
- [ ] **Series:** `Adoption` diffed against previous report's, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway package unpack removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions

- **Package (Step 2):** this repo is the package. Read `.bkit/core/`, `.bkit/shared/`, `.bkit/templates/` from the repo root, not `node_modules`; the installed copies they land as are the dogfood. Repo-root adopted copies (`scripts/<tool>/`, `.husky/`, `.github/workflows/`, `slop-scan.config.json`) stay byte-identical to `.bkit/templates/` unless the difference is deliberate → each difference in Step 9 (b).
- **Audits (Step 7):** `docs/templates/` copies carry this repo's `Project Instructions`; the managed part must equal `.bkit/core/docs/templates/` (`.bkit/core/engine/audits/templates/templates.test.ts`).
