<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.2 — do not edit; run `bkit upgrade` to refresh -->

# Documentation Audit

> [!CAUTION]
> **Purpose:** Docs still true — each claim matches code, each pointer lands, each agent-relevant fact written down.
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
> - NEVER paste a secret or credential value into the report.
> - Historical records (`docs/plans/**`, `docs/archive/**`, `docs/completed.md`) and existing ledger rows are citers only; never edit them.

## Universal Instructions

### Context & Goals

Docs are the record agents work from: memory points at them, plans cite them, code comments cite them. Wrong doc > missing doc — agents follow it. Prose lint = style; formatter = shape; managed-block check = managed blocks only. None reads docs against code. Per-ship doc update sees only files that ship changed → drift across ships belongs to nobody.

**Target failure:** **a claim the code has left behind** — default doc states but deployed env does not; script phase doc omits (look hardest for anything that deletes); pointer leads nowhere; fact running code relies on exists only in memory or was dropped from a ledger.

**Applies when:** project has live docs (prose under `docs/` or `.agents/`, or root `README.md` agents treat as entry). None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after ledger migration, `bkit upgrade`, or toolchain change (runtime, package manager, SDK, new required tool or hook).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Diátaxis (unversioned; record the date read).
- Docs-as-code prose linter and link checker (e.g. Vale, lychee); record versions.
- Architecture decision records (e.g. ADR form).
- Runbook practice (e.g. Google SRE Workbook, "On-Call").
- Source-host community health files (e.g. GitHub `README`, `CONTRIBUTING`, `SECURITY.md`).
- API-doc validation for the language (e.g. TypeDoc validation, TSDoc); record version.
- HTTP API specification when the project serves HTTP (e.g. OpenAPI); record version.

### Scope

- Every live doc, every run.
- Catalogue: `.agents/docs.md` rows vs files on disk, and the root entry point.
- Mechanical: prose, format, managed-block drift, backticked paths, links, and anchors, commands, diagrams.
- Ledger citations resolve to one winning row; significant choices have a `docs/decisions.jsonl` row.
- Claims in every live doc vs the code.
- Setup doc enough to start. Runbooks exist and each is walked.
- Generated reference for HTTP APIs, background events, and shared packages.
- Auto-memory vs docs. Instruction files vs each other. One topic, one doc. Diátaxis quadrant per live doc.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether a doc is in the right place | Placement | `bkit-audit-repo` |
| Stale pointers found only from the code side (route or file moved, no doc cites the old path) | Code-side sweep | `bkit-audit-dead-code` |
| Capability-register status (`one` / `bypassed` / `split` / `gap`) | Duplication sweep | `bkit-audit-duplication` |
| Architecture graph diagram correctness | Architecture sweep | `bkit-audit-architecture` |
| Turning a check into a CI gate | Gate design | `bkit-audit-gates` |
| A stale fact inside a historical record | History, not a defect | Citers only; fix a dead pointer at the target |
| Instruction files each agent host loads; agent permissions, hooks, tool servers | Agent config sweep | `bkit-audit-agents` |
| Applying doc edits, appending ledger rows, editing memory | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`. never retry or reword a blocked call to get past it.
- [ ] **Repo Read:** Steps 2–13 — live docs, instruction files, manifests, CI workflow. Fallback: none; unreadable tree = finding.
- [ ] **Web:** Step 14 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Prose and Format:** Step 4 — e.g. Vale, Prettier. Fallback: skip that check; name it in `Not Checked`.
- [ ] **Managed-Block Check:** bkit project → Step 4 — e.g. `bkit check`. Fallback: read managed blocks; drift `Not Checked`.
- [ ] **Link Checker:** Step 4 — offline fragments plus cached external URLs, e.g. lychee. Fallback: open relative links by hand; external URLs `Not Checked`.
- [ ] **Diagram Renderer:** Fenced diagrams → Step 4 — e.g. mermaid-cli, headless browser. Fallback: skip render; `Not Checked`. A cloud session may lack the browser.
- [ ] **API Doc Validator:** Shared packages or an HTTP API → Step 9 — e.g. TypeDoc `--validation`, `eslint-plugin-jsdoc`. Fallback: read exports; broken links `Not Checked`.
- [ ] **Local Memory:** Maintainer machine → Step 10 — IDE auto-memory directory. Fallback: cloud session skips; record in `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Scope:** No live docs → one `N/A` row with evidence and STOP. Else every live doc. Rank by drift: per live doc, commits since that doc last changed to repo paths it cites. Record ranking. Start from up-to-date default branch with clean `git status`. Historical records are citers: pointer leads nowhere = finding, fix at target. Stale fact inside them = history, not defect. **Done when:** every live doc and drift ranking in `Scope`.
- [ ] **Step 3 — Catalogue:** `.agents/docs.md`: every file on disk under `docs/` outside `plans/`, `archive/`, and `audits/` has a row, and every row's file exists; no doc listed twice (two docs on one topic = bug, including one doc in both tables with different reading columns); each row's one-line scope still matches the doc. Root `README.md` = working entry point: what the project is, links setup doc, architecture doc, and `.agents/docs.md`, and how to report a security issue. Missing community-health file with no README substitute = finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
- [ ] **Step 4 — Mechanical:** Run prose lint, format check, and managed-block check. Then:
  - Every backticked repo path in a live doc exists. Output = candidates. Path named on purpose as removed = not finding. Path moved = finding. Section anchors and `file:line` wait for `Claims`.
  - Relative links and heading anchors offline across every doc, plans, and archive included (citers). Then external URLs in live docs, with cache. Anchor builder must match host (e.g. GitHub); open failed fragment before calling broken. Markdown link invisible to path check.
  - Every package-manager script a live doc names is defined by some manifest. Every script path a doc runs exists. Both lists = candidates: doc may name removed script on purpose.
  - Diagrams still parse (e.g. Mermaid). Syntax break renders as raw text with no CI signal. Render each live doc that has one.
  - Markdown tables in live docs: each carries `<!-- prettier-ignore -->` directly above its head, and each renders — no row with more cells than the separator (GFM drops the overflow), no header / separator count mismatch (GFM renders raw text). Run read-only, e.g. `node scripts/prettier/bkit-insert-ignore.mjs --check` (bkit package template `.bkit/templates/scripts/prettier/`; skips `docs/audits/`, `docs/plans/`). No such check → `Process Improvements` proposes the template.

  Path or link fix → doc edit for `@bkit-utility-update-documentation`, sync pass only (no reorganise, compress, or cross-reference), after intentional hits struck. Pointer broken because route or file moved → also `bkit-audit-dead-code`. Broken diagram that is architecture graph → also `bkit-audit-architecture`. Check that could be CI gate → `bkit-audit-gates`. **Done when:** `Mechanical` lists broken paths, links, scripts, diagrams, and tables, each dispositioned, including checks that came back clean.

- [ ] **Step 5 — Ledgers:** Rows cited by `key` (`.bkit/jsonl.md` § Key & References). Resolve winning row: fold by `key`, highest `ts` (§ Updating a Row). Legacy counter ids (e.g. `KN-<n>`, `DE-<n>`) = leftovers, not unique, survive in `references`; new citations keep appearing → runs every time. `references` may be string or list — accept both; reader assuming list silently skips string rows. Three candidate lists: cited legacy id resolves to nothing; cited legacy id resolves to >1 row; `key` cited next to ledger name no row has (also picks up job names — open each). Rows sharing `key` = updates, not duplicates. Only different keys claiming same legacy id = clash. For each real hit:
  - Live doc or code comment → report names citation change to row's `key`. This run does not edit.
  - `docs/completed.md` or plan → do not edit. Report names new version of owning row to append, with old id in `references`.
  - Fact in no row → `git log -S` the old id. Report quotes historical text to restore, or ask maintainer. never reconstruct rationale nobody wrote. Restoring = same-`key` append, next step. never edit a line in place.

  Then choices recorded at all. List each external service, major library, and data-model choice visible in code; find its `docs/decisions.jsonl` row. No row = question for maintainer, not rationale to write. Choice code reversed needs newer row, same `key`; report names row to append. **Done when:** `Ledgers` lists every unresolved citation and every choice without a row.

- [ ] **Step 6 — Claims:** For each live doc, list claims something depends on; check each against code. No tool does this.

  <!-- prettier-ignore -->
  | Claim type | Check against |
  | --- | --- |
  | Defaults and flags | Schema default and the env files that are actually deployed. A schema default (e.g. zod `.default()`) applies only when the variable is unset |
  | What a script does | The script, end to end. Look hardest for anything that deletes |
  | Which parts exist, on which platform | The code, on every platform the doc claims |
  | `file:line` | Open the line. It must still say what the doc claims |
  | Section links (`§ Heading`) | The heading exists, word for word |
  | Counts and lists | Count them again |

  Destinations: doc wrong, code right → doc edit; doc right, code wrong → `docs/failures.jsonl` row (`@bkit-utility-update-failures` applies it), do not "fix" doc to match bug; no recorded intent → question for maintainer; product-shape statement → proposed wording for owner before it lands; drift inside `bkit:start` / `bkit:end` → upstream bkit fix, do not edit there (`bkit install` overwrites it). Handoff for `@bkit-utility-update-documentation` (this run does not invoke): findings from this report only; known drift first (`file:line` and code that disproves it); no managed-block interiors; no historical records or `*.jsonl`. Unscoped, it walks every indexed doc in several passes and stops partway. It cannot run commands → script behaviour and deployed values from this list. Compress pass can delete a warning — next reader checks every removed "never", "always", or trap. Docs other code reads: hand-fix, then tests `Handoff` finds. Do not trust "synced"; re-grep every changed claim. **Done when:** `Claims` row per hit: `file:line` · what the doc said · what the code does · severity · destination.

- [ ] **Step 7 — Setup:** Setup doc enough: new developer or agent in fresh session/worktree gets clean clone → running app and passing local suite using only that doc. Cheap checks every run. Full walk every run.

  Cheap checks: tool versions in doc vs manifest and version files (e.g. `engines`, `packageManager`, `.nvmrc`, `.python-version`, `rust-toolchain.toml`); every binary a package script, git hook, or local CI runner calls is listed (hook dying on missing binary = usual first-day stop); required vs optional still right (nothing calls it, or platform retired → not required); every command and path in doc exists; every variable code reads is in example env or doc says where to get it, every example variable still read, doc names right example file and how loaded; doc says what agent needs that person already has (env trust in new worktree, language-server provisioning, which steps cloud session cannot run).

  Full walk → fresh clone into temp directory, not worktree of this checkout (hides missing steps). Follow doc literally, in order. Every time you need something the doc did not say = finding. Goal states, in order, with time each takes: install succeeds; local app serves on doc's port and sign-in works; local static, unit, and integration gate passes; local end-to-end passes; mobile section, when doc has one, through simulator and emulator. Then new worktree of existing checkout through first test passing (agent path). Then which goal states cloud session can reach, and whether doc says which it cannot. Secrets: doc says where each comes from, and whether that works without asking a person. never paste a value. **Done when:** `Setup` row per cheap check; when walk ran, time per goal state and every point doc was not enough.

- [ ] **Step 8 — Runbooks:** Procedure exists for each, named by doc and section: production rollback, per host (web deploy, native update plus store build when those exist); database restore and point-in-time recovery; migration fails partway through push; secret rotation, per provider; failing or poisoned background-job queue; outage at primary dependency; user data export and deletion request. Walk every procedure with `Claims` checks: every command exists, every path real, every dashboard step still matches. Missing procedure = finding. Says who to tell but not what to run = finding. Destination: doc and section to add, also `bkit-audit-reliability`. **Done when:** `Runbooks` lists each procedure and its walk.
- [ ] **Step 9 — Reference:** HTTP routes external or native client calls → generated, current reference (e.g. OpenAPI), not prose. Each background-event name and payload schema → generated or code-adjacent reference matching what is sent. Shared packages → API-doc validation over each entry point (e.g. TSDoc: broken `{@link}` references, exported symbols with no docs). Gap = finding; fix = generated reference, next step. **Done when:** `Reference` row per surface: present or gap.
- [ ] **Step 10 — Memory:** Local session → auto-memory must point at docs, never copy them. Cloud session → skip and say so.
  - Fact only in memory → doc or ledger row it should move to, and pointer to leave behind.
  - Memory copying doc → cut to pointer (path, section, one-line hook).
  - Pointer at section moved or gone → pointer fix, and whether `Mechanical` missed same move in docs.
  - Memory and doc disagree → code decides. Report says which next step should fix.

  **Done when:** `Memory` holds each hit, or the skip recorded.

- [ ] **Step 11 — Rules:** Read instruction files IDE loads side by side (`AGENTS.md`, `CLAUDE.md`, IDE rule files, `.agents/rules.md`, any other). Directive one forbids, or two commands for same task = finding. Inside `bkit:start` / `bkit:end` → upstream bkit fix. Destination: proposed wording, for owner to pick rule that stands. Load size: byte size of always-applied files, and about a quarter of that in tokens, as a series. Growth with no new rule = copying. **Done when:** `Rules` lists contradictions and load size.
- [ ] **Step 12 — Topics:** Two docs on one topic = bug (`.agents/docs.md`): pick home, delete copy, link to home. Look in order: same table or list in two docs; section in domain doc repeating ledger row; audit report still giving advice doc replaced. Label each live doc by Diátaxis quadrant (tutorial, how-to, reference, explanation). Doc mixing quadrants = finding for split. Topic agents need with no doc in right quadrant = finding for new one. Record labels so next run diffs them. `@bkit-utility-compress-markdown` overwrites one file per call; this run does not invoke it. Long prose doc may be named as candidate. Never a doc tests parse, never a ledger. **Done when:** `Topics` holds duplicates, quadrant labels, and any compress candidate.
- [ ] **Step 13 — Handoff:** This run does not edit docs. Read CI workflow for what docs-only push actually runs. Record recheck next step owes after edits this report names: prose lint, format check, managed-block check, `Mechanical` and `Ledgers` again (both should list nothing new), and every test that reads a doc the report says to touch. Find those tests (`git grep -l`), do not list from memory. Change to code comment, script, or migration = code change → normal lanes. **Done when:** `Handoff` names recheck commands and tests.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Diátaxis quadrant, link, and anchor checking, decision records, runbooks, each community health file, and API or package reference → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching docs (new or renamed docs, `.agents/*.md` and other rule files, package scripts, env vars, routes, background events, new ledger rows, new external services) → one-line verdict each. (b) Bounded ~30 min pass: what senior technical writer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No secrets:** no secret or credential value anywhere in the report.
- [ ] **Tree clean:** no doc, ledger, memory, or instruction file changed; scratch only under repo-root `tmp/`.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Following the doc destroys data, skips a safety check, or blocks a fresh start with no workaround written; instruction files contradict on a safety rule |
| `HIGH` | Doc states the opposite of the code on a flag, default, or platform shape; pointer an agent follows that leads nowhere; fact running code depends on, and no ledger row holds it; setup gap with a known workaround |
| `MEDIUM` | Drifted `file:line`, count, or list; table that renders as raw text or drops cells; setup command wrong but recoverable; missing runbook; missing generated reference; same topic in two docs; mixed Diátaxis quadrant; choice with no decision row |
| `LOW` | Catalogue one-line scope slightly off; wording drift that changes no instruction; quadrant label with no split needed |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: destructive steps and contradictions first.

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

### Scope

PENDING

### Catalogue

PENDING

### Mechanical

PENDING

### Ledgers

PENDING

### Claims

PENDING

### Setup

PENDING

### Runbooks

PENDING

### Reference

PENDING

### Memory

PENDING

### Rules

PENDING

### Topics

PENDING

### Handoff

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
- [ ] **Summary:** names count per severity.
- [ ] **Series:** load size, and setup-walk times when the walk ran, beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
