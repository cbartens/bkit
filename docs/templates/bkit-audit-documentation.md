<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Documentation Audit

> [!CAUTION]
> **Purpose:** Whether the docs are still true: each claim matches the code, each pointer lands, and each fact agents rely on is written down.
>
> **Rules:**
>
> - NEVER paste a secret or credential value into the report.
> - Treat historical records (`docs/plans/**`, `docs/archive/**`, `docs/completed.md`) and existing ledger rows as citers only, and never edit them.

## Universal Instructions

### Context & Goals

Docs are the record agents work from: memory points at them, and plans and code comments cite them. A wrong doc is worse than a missing one, because agents follow it. Prose lint checks style, the formatter checks shape, and the managed-block check covers managed blocks only. None of them reads the docs against the code. The doc update on each ship sees only the files that ship changed, so drift across ships belongs to nobody.

The failure this audit targets is a claim the code has left behind. Examples: a default the doc states that the deployed environment does not use; a script phase the doc leaves out (look hardest for anything that deletes); a pointer that leads nowhere; and a fact the running code relies on that exists only in memory, or was dropped from a ledger.

**Applies when:** the project has live docs: prose under `docs/` or `.agents/`, or a root `README.md` that agents treat as the entry point. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass after a ledger migration, a `bkit upgrade`, or a toolchain change (runtime, package manager, SDK, or a new required tool or hook).

**Anchor Standards:**

- Diátaxis (unversioned; record the date read).
- Docs-as-code prose linter and link checker (e.g., Vale, lychee); record versions.
- Architecture decision records (e.g., ADR form).
- Runbook practice (e.g., Google SRE Workbook, "On-Call").
- Source-host community health files (e.g., GitHub `README`, `CONTRIBUTING`, `SECURITY.md`).
- API-doc validation for the language (e.g., TypeDoc validation, TSDoc); record version.
- HTTP API specification when the project serves HTTP (e.g., OpenAPI); record version.

### Scope

- Check every live doc on every run.
- Check the catalogue: `.agents/docs.md` rows against the files on disk, and the root entry point.
- Run the mechanical checks: prose, format, managed-block drift, backticked paths, links and anchors, commands, and diagrams.
- Check that each ledger citation resolves to one winning row, and that each significant choice has a `docs/decisions.jsonl` row.
- Check the claims in every live doc against the code.
- Check that the setup doc is enough to start, that the runbooks exist, and walk each one.
- Check the generated reference for HTTP APIs, background events and shared packages.
- Check auto-memory against the docs, and the instruction files against each other.
- Check that each topic has one doc, and label each live doc with its Diátaxis quadrant.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether a doc is in the right place | The repo sweep covers placement | `bkit-audit-repo` |
| Stale pointers found only from the code side (route or file moved, no doc cites the old path) | The code-side sweep covers it | `bkit-audit-dead-code` |
| Capability-register status (`one` / `bypassed` / `split` / `gap`) | The duplication sweep covers it | `bkit-audit-duplication` |
| Architecture graph diagram correctness | The architecture sweep covers it | `bkit-audit-architecture` |
| Turning a check into a CI gate | It is a gate design | `bkit-audit-gates` |
| A stale fact inside a historical record | It is history, not a defect | Citers only; fix a dead pointer at the target |
| Instruction files each agent host loads; agent permissions, hooks, tool servers | The agent config sweep covers it | `bkit-audit-agents` |
| Applying doc edits, appending ledger rows, editing memory | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Repo Read:** Steps 2-13 — live docs, instruction files, manifests and the CI workflow. Fallback: none. An unreadable tree is a finding.
- [ ] **Web:** Step 14 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Prose and Format:** Step 4 — e.g., Vale, Prettier. Fallback: skip that check, and name it in `Not Checked`.
- [ ] **Managed-Block Check:** **If** this is a bkit project → Step 4 — e.g., `bkit check`. Fallback: read the managed blocks, and mark drift `Not Checked`.
- [ ] **Link Checker:** Step 4 — offline fragments plus cached external URLs (e.g., lychee). Fallback: open relative links by hand, and mark external URLs `Not Checked`.
- [ ] **Diagram Renderer:** **If** docs have fenced diagrams → Step 4 — e.g., mermaid-cli, a headless browser. A cloud session may lack the browser. Fallback: skip the render, and mark it `Not Checked`.
- [ ] **API Doc Validator:** **If** the project has shared packages **or** an HTTP API → Step 9 — e.g., TypeDoc `--validation`, `eslint-plugin-jsdoc`. Fallback: read the exports, and mark broken links `Not Checked`.
- [ ] **Local Memory:** **If** the run is on a maintainer machine → Step 10 — the IDE auto-memory directory. Fallback: a cloud session skips it and records that in `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Scope:** **If** there are no live docs → write one `N/A` row with evidence, then **STOP**. Otherwise take every live doc, and rank them by drift: for each live doc, count the commits to the repo paths it cites since the doc last changed. Record the ranking. Start from an up-to-date default branch with a clean `git status`. Historical records are citers. A pointer in one that leads nowhere is a finding, fixed at the target. A stale fact inside one is history, not a defect. **Done when:** `Scope` holds every live doc and the drift ranking.
- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
- [ ] **Step 4 — Mechanical:** Run prose lint, the format check and the managed-block check. Then:
  - Check that every backticked repo path in a live doc exists. The output is candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
  - Check relative links and heading anchors offline across every doc, plans and archive included, because they are citers. Then check external URLs in live docs, with a cache. The anchor builder must match the host (e.g., GitHub). Open a failed fragment before calling it broken. The path check cannot see Markdown links.
  - Check that every package-manager script a live doc names is defined by some manifest, and that every script path a doc runs exists. Both lists are candidates, because a doc may name a removed script on purpose.
  - Check that diagrams still parse (e.g., Mermaid). A syntax break renders as raw text with no CI signal, so render each live doc that has one.
  - Check Markdown tables in live docs. Each carries `<!-- prettier-ignore -->` directly above its head, and each renders. No row has more cells than the separator, because GFM drops the overflow. The header and separator counts match, because a mismatch renders as raw text. Run the check read-only (e.g., `node scripts/prettier/bkit-insert-ignore.mjs --check`; the bkit package template is in `.bkit/templates/scripts/prettier/`, and it skips `docs/audits/` and `docs/plans/`). **If** there is no such check → `Process Improvements` proposes the template.

  A path or link fix is a doc edit for `@bkit-utility-update-documentation`, as a sync pass only (no reorganising, compressing or cross-referencing), after the intentional hits are struck. **If** a pointer broke because a route or file moved → also name `bkit-audit-dead-code`. **If** a broken diagram is the architecture graph → also name `bkit-audit-architecture`. A check that could be a CI gate goes to `bkit-audit-gates`. **Done when:** `Mechanical` lists the broken paths, links, scripts, diagrams and tables, each with its destination, including the checks that came back clean.

- [ ] **Step 5 — Ledgers:** Rows are cited by `key` (`.bkit/jsonl.md` § Key & References). Resolve the winning row by folding on `key` and taking the highest `ts` (§ Updating a Row). Legacy counter ids (e.g., `KN-<n>`, `DE-<n>`) are leftovers. They are not unique, and they survive in `references`. New citations of them keep appearing, so this check runs every time. `references` may be a string or a list, so accept both; a reader that assumes a list silently skips string rows. Build three candidate lists: a cited legacy id that resolves to nothing; a cited legacy id that resolves to more than one row; and a `key` cited next to a ledger name that no row has. The third list also picks up job names, so open each one. Rows that share a `key` are updates, not duplicates. A clash is only when different keys claim the same legacy id. For each real hit:
  - **If** the hit is in a live doc or a code comment → the report names the citation change to the row's `key`. This run does not edit.
  - **If** the hit is in `docs/completed.md` or a plan → do not edit. The report names the new version of the owning row to append, with the old id in `references`.
  - **If** the fact is in no row → run `git log -S` on the old id. The report quotes the historical text to restore, or asks the maintainer. Never reconstruct rationale nobody wrote. Restoring is a same-`key` append in the next step. Never edit a line in place.

  Then check that choices are recorded at all. List each external service, major library and data-model choice visible in the code, and find its `docs/decisions.jsonl` row. A missing row is a question for the maintainer, not rationale to write. A choice the code reversed needs a newer row with the same `key`, and the report names the row to append. **Done when:** `Ledgers` lists every unresolved citation and every choice without a row.

- [ ] **Step 6 — Claims:** For each live doc, list the claims something depends on, and check each against the code. No tool does this.

  <!-- prettier-ignore -->
  | Claim type | Check against |
  | --- | --- |
  | Defaults and flags | Schema default and the env files that are actually deployed. A schema default (e.g., zod `.default()`) applies only when the variable is unset |
  | What a script does | The script, end to end. Look hardest for anything that deletes |
  | Which parts exist, on which platform | The code, on every platform the doc claims |
  | `file:line` | Open the line. It must still say what the doc claims |
  | Section links (`§ Heading`) | The heading exists, word for word |
  | Counts and lists | Count them again |

  Destinations:
  - **If** the doc is wrong **and** the code is right → a doc edit.
  - **If** the doc is right **and** the code is wrong → a `docs/failures.jsonl` row, which `@bkit-utility-update-failures` applies. Do not "fix" the doc to match the bug.
  - **If** there is no recorded intent → a question for the maintainer.
  - **If** it is a statement about the product's shape → proposed wording for the owner before it lands.
  - **If** the drift is inside `bkit:start` / `bkit:end` → an upstream bkit fix. Do not edit there, because `bkit install` overwrites it.

  Write the handoff for `@bkit-utility-update-documentation`; this run does not invoke it. Give it findings from this report only, known drift first (the `file:line` and the code that disproves it), no managed-block interiors, and no historical records or `*.jsonl`. Unscoped, it walks every indexed doc in several passes and stops partway. It cannot run commands, so give it script behaviour and deployed values from this list. A compress pass can delete a warning, so the next reader checks every removed "never", "always" or trap. For docs that other code reads, fix by hand, then run the tests that `Handoff` finds. Do not trust "synced"; re-grep every changed claim. **Done when:** `Claims` has a row per hit: `file:line` · what the doc said · what the code does · severity · destination.

- [ ] **Step 7 — Setup:** The setup doc is enough when a new developer, or an agent in a fresh session or worktree, gets from a clean clone to a running app and a passing local suite using only that doc. Run the cheap checks and the full walk on every run.

  Cheap checks: the tool versions in the doc match the manifest and version files (e.g., `engines`, `packageManager`, `.nvmrc`, `.python-version`, `rust-toolchain.toml`). Every binary that a package script, git hook or local CI runner calls is listed; a hook dying on a missing binary is the usual first-day stop. Required and optional are still right: **if** nothing calls a tool, **or** its platform is retired → it is not required. Every command and path in the doc exists. Every variable the code reads is in the example env, or the doc says where to get it. Every example variable is still read, and the doc names the right example file and how it is loaded. The doc says what an agent needs that a person already has: env trust in a new worktree, language-server provisioning, and which steps a cloud session cannot run.

  Full walk: make a fresh clone into a temp directory, not a worktree of this checkout, because a worktree hides missing steps. Follow the doc literally, in order. Every time you need something the doc did not say is a finding. Reach these goal states in order, recording the time each takes: the install succeeds; the local app serves on the doc's port and sign-in works; the local static, unit and integration gate passes; local end-to-end passes; and, when the doc has a mobile section, the simulator and emulator run. Then take a new worktree of the existing checkout through to the first passing test, which is the agent path. Then record which goal states a cloud session can reach, and whether the doc says which it cannot. Secrets: the doc says where each one comes from, and whether that works without asking a person. Never paste a value. **Done when:** `Setup` has a row per cheap check, and, when the walk ran, the time per goal state and every point where the doc was not enough.

- [ ] **Step 8 — Runbooks:** Check that a procedure exists for each case below, named by doc and section: production rollback, per host (web deploy, plus native update and store build when those exist); database restore and point-in-time recovery; a migration that fails partway through a push; secret rotation, per provider; a failing or poisoned background-job queue; an outage at the primary dependency; and a user data export and a user data deletion request. Walk every procedure with the `Claims` checks: every command exists, every path is real, and every dashboard step still matches. A missing procedure is a finding. A procedure that says who to tell but not what to run is a finding. The destination is the doc and section to add, and also `bkit-audit-reliability`. **Done when:** `Runbooks` lists each procedure and its walk.
- [ ] **Step 9 — Reference:** **If** an external or native client calls HTTP routes → they need a generated, current reference (e.g., OpenAPI), not prose. Each background-event name and payload schema needs a generated or code-adjacent reference that matches what is sent. **If** the project has shared packages → run API-doc validation over each entry point (e.g., TSDoc: broken `{@link}` references, exported symbols with no docs). A gap is a finding, and the fix is a generated reference in the next step. **Done when:** `Reference` has a row per surface: present or gap.
- [ ] **Step 10 — Memory:** **If** the session is local → auto-memory must point at docs, never copy them. **If** the session is in the cloud → skip this step and say so.
  - **If** a fact is only in memory → name the doc or ledger row it should move to, and the pointer to leave behind.
  - **If** memory copies a doc → cut it to a pointer (path, section, one-line hook).
  - **If** a pointer aims at a section that moved or is gone → name the pointer fix, and whether `Mechanical` missed the same move in the docs.
  - **If** memory and a doc disagree → the code decides. The report says which next step should fix it.

  **Done when:** `Memory` holds each hit, or the skip is recorded.

- [ ] **Step 11 — Rules:** Read the instruction files the IDE loads side by side (`AGENTS.md`, `CLAUDE.md`, IDE rule files, `.agents/rules.md`, and any other). A directive that one file forbids, or two commands for the same task, is a finding. **If** it is inside `bkit:start` / `bkit:end` → it is an upstream bkit fix. The destination is proposed wording, so the owner can pick the rule that stands. Record the load size as a series: the byte size of the always-applied files, and about a quarter of that in tokens. Growth with no new rule means copying. **Done when:** `Rules` lists the contradictions and the load size.
- [ ] **Step 12 — Topics:** Two docs on one topic is a bug (`.agents/docs.md`).
  - Look for duplicates in this order: the same table or list in two docs; a section in a domain doc that repeats a ledger row; and an audit report still giving advice that a doc replaced.
  - For each duplicate, name the home, the copy to delete and the link to add, for the next step to apply.
  - Label each live doc with its Diátaxis quadrant (tutorial, how-to, reference, explanation).
  - Record the labels, so the next run can diff them.
  - A doc that mixes quadrants is a finding for a split.
  - A topic agents need with no doc in the right quadrant is a finding for a new one.
  - A long prose doc may be named as a candidate for `@bkit-utility-compress-markdown`, which overwrites one file per call. This run does not invoke it.
  - Never name a doc that tests parse, or a ledger, as a compress candidate.

  **Done when:** `Topics` holds the duplicates, the quadrant labels, and any compress candidate.

- [ ] **Step 13 — Handoff:** This run does not edit docs. Read the CI workflow for what a docs-only push actually runs. Record the recheck the next step owes after the edits this report names: prose lint, the format check, the managed-block check, `Mechanical` and `Ledgers` again (both should list nothing new), and every test that reads a doc the report says to touch. Find those tests with `git grep -l`; do not list them from memory. A change to a code comment, a script or a migration is a code change, and takes the normal lanes. **Done when:** `Handoff` names the recheck commands and tests.
- [ ] **Step 14 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per Diátaxis quadrant, plus one row each for link checking, anchor checking, decision records, runbooks, each community health file, and the API or package reference, marked checked (with the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 15 — Anything Else:** (a) List everything changed since the previous report's commit that touches docs (new or renamed docs, `.agents/*.md` and other rule files, package scripts, env vars, routes, background events, new ledger rows and new external services), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior technical writer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows and vendor status incidents), and note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No secrets:** no secret or credential value appears anywhere in the report.
- [ ] **Docs untouched:** no live doc, memory file or instruction file changed, other than the template's `Project Instructions`.
- [ ] **Ledger rows untouched:** no existing ledger row changed.
- [ ] **Scratch in tmp:** scratch files are only under the repo-root `tmp/`.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Following the doc destroys data, skips a safety check, or blocks a fresh start with no workaround written. Instruction files contradict each other on a safety rule. |
| `HIGH` | The doc states the opposite of the code on a flag, a default or a platform shape. A pointer an agent follows leads nowhere. Running code depends on a fact that no ledger row holds. The setup doc has a gap with a known workaround. |
| `MEDIUM` | A `file:line`, count or list has drifted. A table renders as raw text or drops cells. A setup command is wrong but recoverable. A runbook is missing. A generated reference is missing. The same topic is in two docs. A doc mixes Diátaxis quadrants. A choice has no decision row. |
| `LOW` | A catalogue one-line scope is slightly off. Wording drift changes no instruction. A quadrant label needs no split. |

Within a severity, list destructive steps and contradictions first.

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
- [ ] **Series:** the report shows load size, and setup-walk times when the walk ran, beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
