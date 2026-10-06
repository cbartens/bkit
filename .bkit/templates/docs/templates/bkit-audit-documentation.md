<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Documentation Audit

> [!CAUTION]
> **Purpose:** Whether the docs are still true — each claim matches the code, each pointer lands, and each fact agents rely on is written down.
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
> - NEVER paste a secret or credential value into the report.
> - Historical records (`docs/plans/**`, `docs/archive/**`, `docs/completed.md`) and existing ledger rows are citers only; NEVER edit them.

## Universal Instructions

### Context & Goals

Docs are the record agents work from: memory points at them, plans cite them, code comments cite them. A wrong doc does more damage than a missing one, because an agent follows it. Prose lint checks style, a formatter checks shape, and a managed-block check only checks managed blocks. None reads a doc against the code. A per-ship doc update only sees files that ship changed, so drift that builds across ships belongs to nobody. Target failure: **a claim the code has left behind** — a default the doc states and the deployed env does not, a script phase the doc omits (look hardest for anything that deletes), a pointer that leads nowhere, a fact running code relies on that exists only in memory or was dropped from a ledger.

**Applies when:** project has live docs (prose under `docs/` or `.agents/`, or a root `README.md` agents treat as entry). None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after any ledger migration or `bkit upgrade`.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Diátaxis (unversioned; record the date read).
- Docs-as-code prose linter and link checker (e.g. Vale, lychee); record versions.
- Architecture decision records (e.g. ADR form).
- Runbook practice (e.g. Google SRE Workbook, "On-Call").
- Source-host community health files (e.g. GitHub `README`, `CONTRIBUTING`, `SECURITY.md`).
- API-doc validation for the language (e.g. TypeDoc validation, TSDoc); record version.
- HTTP API specification when the project serves HTTP (e.g. OpenAPI); record version.

### Scope

- One doc set per run, chosen by drift, not rotation. Cheap checks run repo-wide every time.
- Catalogue: `.agents/docs.md` rows vs files on disk, and the root entry point.
- Mechanical: prose, format, managed-block drift, backticked paths, links, and anchors, commands, diagrams.
- Ledger citations resolve to one winning row; significant choices have a `docs/decisions.jsonl` row.
- Claims in the chosen set vs the code.
- Setup doc is enough to start. Runbooks exist and one is walked.
- Generated reference for HTTP APIs, background events, and shared packages.
- Auto-memory vs docs. Instruction files vs each other. One topic, one doc. Diátaxis quadrant per doc in scope.

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
| Applying doc edits, appending ledger rows, editing memory | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Scope:** No live docs → one `N/A` row with evidence and STOP. Else pick one set per run, not the whole catalogue. Rank by drift first: for each live doc, commits since that doc last changed to the repo paths it cites; pick the set with the most, not the next in rotation. Record the top ten. Mechanical and Ledgers run repo-wide every time. Start from an up-to-date default branch with clean `git status`. Historical records are citers: a pointer that leads nowhere is a finding, fixed at the target. A stale fact inside them is history, not a defect. **Done when:** set and top ten in `Scope`.
- [ ] **Step 3 — Catalogue:** `.agents/docs.md`: every file on disk under `docs/` outside `plans/`, `archive/`, and `audits/` has a row, and every row's file exists; no doc listed twice (two docs on one topic is a bug, including one doc in both tables with different reading columns); each row's one-line scope still matches the doc. Root `README.md` is a working entry point: what the project is, links the setup doc, the architecture doc, and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute = finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
- [ ] **Step 4 — Mechanical:** Run prose lint, format check, and managed-block check. Then:
  - Every backticked repo path in a live doc exists. Output = candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
  - Relative links and heading anchors offline across every doc, plans, and archive included (they are citers). Then external URLs in live docs, with a cache. The anchor builder must match the host (e.g. GitHub); open a failed fragment before calling it broken. A markdown link is invisible to the path check.
  - Every package-manager script a live doc names is defined by some manifest. Every script path a doc runs exists. Both lists are candidates: a doc may name a removed script on purpose.
  - Diagrams still parse (e.g. Mermaid). A syntax break renders as raw text with no CI signal. Render each live doc that has one.

  Path or link fix → doc edit for `@bkit-utility-update-documentation`, sync pass only (no reorganise, compress, or cross-reference), after intentional hits are struck. A pointer broken because a route or file moved → also `bkit-audit-dead-code`. A broken diagram that is an architecture graph → also `bkit-audit-architecture`. A check that could be a CI gate → `bkit-audit-gates`. **Done when:** `Mechanical` lists broken paths, links, scripts, and diagrams, each dispositioned, including checks that came back clean.

- [ ] **Step 5 — Ledgers:** Rows are cited by `key` (`.bkit/jsonl.md` § Key & References). Resolve against the winning row: fold by `key`, highest `ts` (§ Updating a Row). Legacy counter ids (e.g. `KN-<n>`, `DE-<n>`) are leftovers, not unique, and survive inside `references`; new citations keep appearing, so this runs every time. `references` may be a string or a list — accept both; a reader that assumes a list silently skips string rows. Three candidate lists: a cited legacy id that resolves to nothing; a cited legacy id that resolves to more than one row; a `key` cited next to a ledger name that no row has (also picks up job names — open each). Rows that share a `key` are updates, not duplicates. Only different keys claiming the same legacy id are a clash. For each real hit:
  - Live doc or code comment → report names the citation change, to the row's `key`. This run does not edit.
  - `docs/completed.md` or a plan → do not edit. Report names the new version of the owning row to append, with the old id added to `references`.
  - Fact in no row → `git log -S` the old id. Report quotes the historical text to restore, or says ask the maintainer. NEVER reconstruct a rationale nobody wrote. Restoring = same-`key` append, next step. NEVER edit a line in place.

  Then choices recorded at all. List each external service, major library, and data-model choice visible in the code, and find its `docs/decisions.jsonl` row. No row = a question for the maintainer, not a rationale to write. A choice the code has reversed needs a newer row, same `key`; the report names the row to append. **Done when:** `Ledgers` lists every unresolved citation and every choice without a row.

- [ ] **Step 6 — Claims:** For each doc in the set, list claims something depends on, and check each against the code. No tool does this.

  <!-- prettier-ignore -->
  | Claim type | Check against |
  | --- | --- |
  | Defaults and flags | Schema default and the env files that are actually deployed. A schema `.default()` applies only when the variable is unset |
  | What a script does | The script, end to end. Look hardest for anything that deletes |
  | Which parts exist, on which platform | The code, on every platform the doc claims |
  | `file:line` | Open the line. It must still say what the doc claims |
  | Section links (`§ Heading`) | The heading exists, word for word |
  | Counts and lists | Count them again |

  Destinations: doc wrong, code right → doc edit; doc right, code wrong → a `docs/failures.jsonl` row (`@bkit-utility-update-failures` applies it), do not "fix" the doc to match the bug; no recorded intent → question for the maintainer; a product-shape statement → proposed wording for the owner before it lands; drift inside `bkit:start` / `bkit:end` → upstream bkit fix, do not edit there (`bkit install` overwrites it). Handoff for `@bkit-utility-update-documentation`, which this run does not invoke: that set only; known drift first (`file:line` and the code that disproves it); no other doc, even if `.agents/docs.md` lists it; no managed-block interiors; no historical records or `*.jsonl`. Unscoped, it walks every indexed doc in several passes and stops partway. It cannot run commands, so script behaviour and deployed values come from this list. A compress pass can delete a warning — the next reader checks every removed "never", "always", or trap. Docs other code reads: hand-fix, then the tests `Handoff` finds. Do not trust "synced"; re-grep every changed claim. **Done when:** `Claims` row per hit: `file:line` · what the doc said · what the code does · severity · destination.

- [ ] **Step 7 — Setup:** Whether the setup doc is enough: a new developer, or an agent in a fresh session or worktree, gets from a clean clone to a running app and a passing local suite using nothing but that doc. Cheap checks every run, whatever `Scope` picked. Full walk when the set includes setup, or after any toolchain change (runtime, package manager, SDK, new required tool or hook).

  Cheap checks: tool versions in the doc vs manifest `engines`, version file, and `packageManager`; every binary a package script, git hook, or local CI runner calls is listed (a hook that dies on a missing binary is the usual first-day stop); required vs optional still right (nothing calls it, or the platform is retired → not required); every command and path in the doc exists; every variable the code reads is in an example env or the doc says where to get it, every example variable is still read, and the doc names the right example file and how it is loaded; the doc says what an agent needs that a person already has (env trust in a new worktree, language-server provisioning, which steps a cloud session cannot run).

  Full walk → fresh clone into a temp directory, not a worktree of this checkout (that hides missing steps). Follow the doc literally, in order. Every time you need something the doc did not say = finding. Goal states, in order, with the time each takes: install succeeds; local app serves on the doc's port and sign-in works; local static, unit, and integration gate passes; local end-to-end passes; mobile section, when the doc has one, through to a simulator and an emulator. Then a new worktree of an existing checkout through to the first test passing (the path agents take). Then which goal states a cloud session can reach, and whether the doc says which it cannot. Secrets: the doc says where each comes from, and whether that works without asking a person. NEVER paste a value. **Done when:** `Setup` row per cheap check; when the walk ran, time per goal state and every point the doc was not enough.

- [ ] **Step 8 — Runbooks:** A procedure exists for each of these, named by doc and section: production rollback, per host (web deploy, and a native update plus a store build when those exist); database restore and point-in-time recovery; a migration that fails partway through a push; secret rotation, per provider; a failing or poisoned background-job queue; an outage at a primary dependency; a user's data export and deletion request. Walk one procedure per run with the `Claims` checks: every command exists, every path is real, every dashboard step still matches. Record which, so the next run takes another. A missing procedure = finding. One that says who to tell but not what to run = finding. Destination: the doc and section to add, also `bkit-audit-reliability`. **Done when:** `Runbooks` lists each procedure and the one walked.
- [ ] **Step 9 — Reference:** HTTP routes an external or native client calls → generated, current reference (e.g. OpenAPI), not prose. Each background-event name and payload schema → a generated or code-adjacent reference that matches what is sent. Shared packages → API-doc validation over each entry point (broken `{@link}` references, exported symbols with no docs). A gap = finding; the fix is a generated reference, next step. **Done when:** `Reference` row per surface: present or gap.
- [ ] **Step 10 — Memory:** Local session → auto-memory must point at docs, never copy them. Cloud session → skip and say so.
  - Fact only in memory → the doc or ledger row it should move to, and the pointer to leave behind.
  - Memory copying a doc → cut to a pointer (path, section, one-line hook).
  - Pointer at a section that moved or is gone → the pointer fix, and whether `Mechanical` missed the same move in the docs.
  - Memory and doc disagree → the code decides. The report says which one the next step should fix.

  **Done when:** `Memory` holds each hit, or the skip recorded.

- [ ] **Step 11 — Rules:** Read instruction files an IDE loads side by side (`AGENTS.md`, `CLAUDE.md`, IDE rule files, `.agents/rules.md`, any other). A directive one forbids, or two commands for the same task = finding. Inside `bkit:start` / `bkit:end` → upstream bkit fix. Destination: proposed wording, for the owner to pick the rule that stands. Load size: byte size of the always-applied files, and about a quarter of that in tokens, as a series. Growth with no new rule is copying. **Done when:** `Rules` lists contradictions and load size.
- [ ] **Step 12 — Topics:** Two docs on one topic is a bug (`.agents/docs.md`): pick the home, delete the copy, link to the home. Look in this order: the same table or list in two docs; a section in a domain doc that repeats a ledger row; an audit report still giving advice a doc has replaced. Then label each doc in scope by Diátaxis quadrant (tutorial, how-to, reference, explanation). A doc that mixes quadrants = finding for a split. A topic agents need with no doc in the right quadrant = finding for a new one. Record the labels so the next run diffs them. `@bkit-utility-compress-markdown` overwrites one file per call; this run does not invoke it. A long prose doc may be named as a candidate. Never a doc tests parse, never a ledger. **Done when:** `Topics` holds duplicates, quadrant labels, and any compress candidate.
- [ ] **Step 13 — Handoff:** This run does not edit docs. Read the CI workflow for what a docs-only push actually runs. Record the recheck the next step owes after the edits this report names: prose lint, format check, managed-block check, `Mechanical` and `Ledgers` again (both should list nothing new), and every test that reads a doc the report says to touch. Find those tests (`git grep -l`), do not list them from memory. A change to a code comment, a script, or a migration is a code change and goes through the normal lanes. **Done when:** `Handoff` names the recheck commands and the tests.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Diátaxis quadrant, link, and anchor checking, decision records, runbooks, each community health file, and API or package reference → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching docs (new or renamed docs, `.agents/*.md` and other rule files, package scripts, env vars, routes, background events, new ledger rows, new external services) → one-line verdict each. (b) Bounded ~30 min pass: what a senior technical writer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

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
| `MEDIUM` | Drifted `file:line`, count, or list; setup command wrong but recoverable; missing runbook; missing generated reference; same topic in two docs; mixed Diátaxis quadrant; choice with no decision row |
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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and the doc set in scope.
- [ ] **Series:** load size, and setup-walk times when the walk ran, beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
