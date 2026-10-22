<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.1 — do not edit; run `bkit upgrade` to refresh -->

# Deferrals Triage

> [!CAUTION]
> **Purpose:** Verdict on every open deferral — already done, superseded, tracked, parked, or in-scope work that should have been finished.
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
> - NEVER append or edit a ledger line. Correction and close rows live in `Expected` only. `ts` is minted at append (`.bkit/jsonl.md` § Write Idiom), never written in this report.
> - A winning row whose `ts` is in the future outranks every correction. Name its `key`. Do not invent a later `ts`.

## Universal Instructions

### Context & Goals

Deferred work appends rows; nothing re-reads them. Three drifts: silently done (landed, row still not `CLOSED`); superseded (surface rewritten or removed); genuinely deferred and untracked (real work, no tracker issue). Target failure: **an open row the code has already finished, or a real deferral with nothing carrying it** — e.g. `RESOLVED` or `SUPERSEDED` left open because only `CLOSED` is done, or a deferral whose only record is a comment on a closed issue. Deliberate debt only (prudent and deliberate quadrant).

**Applies when:** `docs/deferrals.jsonl` exists, or a workflow writes `kind: "deferral"`. None → one `N/A` row with evidence, never "clean".

**Cadence:** once per ship cycle; at least monthly when no cycle ships. Extra pass after release, or after another audit records deferred items (e.g. `bkit-audit-app-performance`).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Technical debt, principal, and interest, and the Technical Debt Quadrant (e.g. Martin Fowler).
- Hotspot analysis, churn against code health (e.g. CodeScene).
- Review of deferred problem records on a schedule and on release: activate, keep deferred, or close (e.g. ITIL-aligned known-error monitoring).
- `.bkit/jsonl.md` § Deferral Reason — `reason` enum and the four `unjustified` tests, at the installed bkit version.

### Scope

- Fold `docs/deferrals.jsonl` last-row-wins. Open = winning `status != "CLOSED"`.
- Data defects on the winning row: `ts`, `status`, `reason`. The row to append goes in `Expected`.
- Verify every open row against source before any verdict.
- Re-test each `reason`, and each `KEEP` trigger.
- Carrying cost: 90-day churn, related `docs/failures.jsonl` and `.bkit/friction.jsonl` rows.
- Tracker issues rows point at. Deferrals that exist only as comments on closed issues.
- `unjustified` adjudication (four tests). Report the row. Do not append.
- Trend: open count, inflow, outflow, age, missing `severity` or `reason`, rows verified / rows open.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Reckless and inadvertent debt | Not in this register | `bkit-audit-slop`, `bkit-audit-architecture`, `bkit-audit-dead-code` |
| Known bugs | Failure ledger | `bkit-audit-failures` |
| Closing rows the code already finished; locator fixes; `TRIAGED` when an issue already exists | Ledger writes. Utility reads every winning row not `CLOSED` | `@bkit-utility-update-deferrals` |
| Doing the deferred work; opening tracker issues | Audit reports only | Plan from this report |

### Verdicts

One per verified row.

- **DONE:** already landed. `Expected` = `CLOSED` same-`key` row. Cite `file:line`.
- **SUPERSEDED:** no longer applies (moved, rewritten, removed, or N/A). `Expected` = `CLOSED` row and the reason.
- **TRACKED:** genuinely deferred, an open issue already covers it. `Expected` = the issue to point the row at, or the acceptance criteria to extend.
- **NEEDS ISSUE:** genuinely deferred, real work, untracked. `Expected` = the issue to open.
- **KEEP:** genuinely deferred, correctly parked, not worth an issue yet (tripwire or contingent). `Expected` = no action, and the trigger.
- **SMALL:** small enough for the next cycle. This run does not do it.
- **ACCEPTED:** still true, and deliberately never to be done. `Expected` = who decides, and the `CLOSED` row to append once signed off. Record it. Do not wait.
- **UNJUSTIFIED:** all four tests hold. `Expected` = same-`key` row, `reason: "unjustified"`, the failed test named in `description`, `status: "TRIAGED"`. Later rows carry `reason` verbatim. Work goes back in scope via a plan.
- **OTHER:** fits none. Say what it is, why, and where it goes. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**DONE is the verdict most likely to be wrong.** Plausible commit message ≠ evidence. DONE or SUPERSEDED needs positive reason — commit, deleted file, or new owner module. Empty query is not absence.

**UNJUSTIFIED** when all four hold (`.bkit/jsonl.md` § Deferral Reason):

1. `remediation` names specific files and a bounded edit, not a new architecture.
2. The surface is inside files the cycle already touched.
3. No external blocker: no missing decision, credential, upstream fix, or confirmation.
4. `reason` is `scope-declared`, and the row is the only place it was called out of scope. Test 4 carries the weight.

Never set `unjustified` while repairing a missing or illegal `reason`. That repair uses one of the first four enum values. This step is the only place `unjustified` is set.

**KEEP needs a trigger** ("before launch", "when N users", a dependency version). No trigger, or trigger fired → another verdict. Row on third consecutive KEEP → NEEDS ISSUE or ACCEPTED.

**Cluster** open rows by package and `category`. 3+ in one group → one `own-cycle` issue in `Expected`, not one per row.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Ledger:** Steps 3–9 — `docs/deferrals.jsonl` and `.bkit/jsonl.md`. Fallback: file absent → one `N/A` row after Step 3 and STOP.
- [ ] **Git History:** Steps 2, 7 — commits since the previous report, 90-day churn. Fallback: closures and churn `Not Checked`.
- [ ] **Web:** Step 10 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed language → Steps 5, 6 — symbol location and callers, e.g. Serena, `tsserver`. Fallback: text search. A close that needs a caller set stays a hypothesis until corroborated.
- [ ] **Tracker:** Issues wired → Steps 6, 8 — open issue, acceptance criteria, comments on issues closed since the previous report. Fallback: tracker pointers `Not Checked`.
- [ ] **Run Stats:** `.bkit/stats.jsonl` has `outcome` rows → Step 3 — sum `deferralsAdded`. Fallback: inflow `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Closures:** Re-verify every DONE and SUPERSEDED row from the previous report at `HEAD`. Each that no longer holds = finding, with what changed. **Done when:** `Closures` holds every row, each failure, and the failure rate, or run marked baseline.
- [ ] **Step 3 — Fold:** Last-row-wins per `key`, not per line. Append-only (`.gitattributes` `merge=union`); editing a line keeps stale copy beside replacement. Highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row). Non-numeric `ts` on a `key` → last line in file is latest. Open = every winning row with `status != "CLOSED"`, including `TRIAGED`, `RESOLVED`, `BLOCKED`, `SUPERSEDED`, `CANCELLED`, free text after the word, missing `status`, and any value outside the enum. Finished-looking words ≠ done. Order: `CRITICAL`, then `HIGH`, then oldest `ts`. Compare `severity` case-insensitively. No `severity` → assign with verdict. Trend vs previous report: open count; inflow = sum `deferralsAdded` on `outcome` rows in `.bkit/stats.jsonl` since previous run where field exists; outflow = rows that became `CLOSED` since; age histogram by `ts`; share of open rows missing `severity` or `reason`. Large open set may be partial pass → record rows verified / rows open. Invisible to fold: deferral with no `key`, or recorded only in a PR description. **Done when:** `Trend` holds counts, histogram, inflow, outflow, missing-field share, verified / open, and those limits, or `N/A` and STOP.
- [ ] **Step 4 — Defects:** Winning row of each `key`. Do not append. `Expected` = row writer appends: copy latest row, change only defective field, same `key`, `ts` minted at append, never literal and never in the future.

<!-- prettier-ignore -->
| Field | Defect | Expected row |
| --- | --- | --- |
| `ts` | Not numeric Unix milliseconds: a string, seconds, or missing. Fold order is then undefined | The same row with a fresh `ts` |
| `status` | Outside `OPEN` / `TRIAGED` / `CLOSED` (`RESOLVED`, `BLOCKED`, `SUPERSEDED`, free text) | `TRIAGED` where the row records analysis, otherwise `OPEN`, old word kept in `description`. `CLOSED` comes only from a verdict |
| `reason` | Missing, or outside `scope-declared` / `hard-blocked` / `needs-decision` / `own-cycle` / `unjustified` | One of the first four the row's text supports, old text kept in `description`. Never `unjustified` |

Winning row with future `ts` → finding names `key` for owner. No correction row. **Done when:** count of each defect, and each `Expected` row, in `Defects`, or `none`.

- [ ] **Step 5 — Source:** No verdict before this step. Outstanding-work claims as unreliable as done claims.

<!-- prettier-ignore -->
| Row claims | Check with |
| --- | --- |
| "`X` should be extracted, renamed, or consolidated" | Language server, symbol lookup. Exists, and at what path now? A symbol that moved is SUPERSEDED |
| "Every caller of `Y` still does Z" | Language server, references, then read the callers. This is DONE evidence |
| "The guard is missing at N sites" | Text search for the literal signature. Counting sites is a pattern question |
| Migrations, workflows, SQL, docs, or other ledgers | Text search. A language server reads one language |

Pace reference queries. Re-run empty or surprisingly low results before close verdict. Partial answer indistinguishable from real. Empty is inconclusive, not absence. **Done when:** every row verified this pass has evidence and the tool on its finding. Unverified rows stay counted in `Trend` and are not passed.

- [ ] **Step 6 — Reasons:** `reason` = why deferred. Each value implies a check. Re-test enum value Step 4 assigned the same way. UNJUSTIFIED replaces it only when Step 9's four tests hold.

<!-- prettier-ignore -->
| `reason` | Check |
| --- | --- |
| `hard-blocked` | Is the blocker the row names still there? |
| `needs-decision` | Was the decision made since? Search `docs/decisions.jsonl` |
| `own-cycle` | Does a plan or an issue for it exist? |
| `scope-declared` | Does the cited doc section exist, and does it predate the row? |

Blocker lifted = highest-yield finding. Flag on verdict. Apply KEEP trigger rule. **Done when:** every verified row's reason, and every KEEP trigger, has a result on the finding.

- [ ] **Step 7 — Cost:** Severity = gap badness, not carry cost. Each row still open after Step 6: churn = commits touching surface in last 90 days (e.g. `git log --since=90.days --oneline -- <path>`); related rows in `docs/failures.jsonl` and `.bkit/friction.jsonl` on same symbol or path. High churn + related failures → raise severity. Risk already a failure row = live bug: pair failure `key`, raise severity, name `bkit-audit-failures` for bug triage. **Done when:** `Cost` row per surviving open row: churn, related keys, severity change.
- [ ] **Step 8 — Pointers:** (a) TRACKED: open issue acceptance criteria include deferred scope; issue not stale and not `Low` across 3+ `bkit-audit-issues` passes. Either fails → say which: extend criteria, or verdict NEEDS ISSUE. (b) Row pointing at closed issue: read what closed it. DONE if scope landed, NEEDS ISSUE if dropped. (c) Deferrals with no row: each issue closed since previous report → read closing comments for deferred items. No row keyed → `Expected` = row to append. **Done when:** `Pointers` lists issue checks and comment-only deferrals, or `none`.
- [ ] **Step 9 — Classify:** Every row as Step 5 left it gets one verdict. Adjudicate `unjustified` here, and only here. Cluster before naming issues. `needs-decision` and every ACCEPTED row → `Decisions` with who decides. This run does not append, open issues, or do the work.

<!-- prettier-ignore -->
| Finding | Expected |
| --- | --- |
| DONE | The `CLOSED` row, with the `file:line` evidence |
| SUPERSEDED | The `CLOSED` row, with the reason |
| TRACKED | The issue to point the row at, or the criteria to extend |
| NEEDS ISSUE | The issue to open. One per cluster of 3 or more |
| KEEP | No action. Its trigger, re-checked next run |
| SMALL | The next cycle's work. This run does not do it |
| ACCEPTED | Who decides, then the `CLOSED` row to append once signed off |
| UNJUSTIFIED | The same-`key` row (`reason`, failed test, `TRIAGED`), and the work routed back in scope |
| `needs-decision` | Who decides, under `Decisions` |
| Risk already a failure row | The failure `key`. Triage at `bkit-audit-failures` |
| Deferral with no row | The row to append |
| Data defect | The correction row, or the future-`ts` key for the owner |
| OTHER | Where it goes |

**Done when:** every verified row has one verdict. `Decisions` lists each `needs-decision` and ACCEPTED row with who decides, or `none`.

- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per practice (principal and interest, debt quadrant, hotspots, review triggers for deferred records) and per `reason` value → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching deferrals (schema and writers in `.bkit/jsonl.md`, design, plan, build, and ship steps that write rows, ship deferral check `@bkit-ship-deferred-sweep`, issues rows point at) → one-line verdict each. (b) Bounded ~30 min pass: what a senior EM owning a technical-debt register flags that no step asks; read since previous run (incidents, `bkit-audit-logs` sweeps, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Read-only:** no ledger line, code, or config changed. Every correction and close row is `Expected` only.
- [ ] **Positive close:** every DONE and SUPERSEDED cites a positive reason, never an empty query.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Deferred gap is data loss, a security hole, or a broken workflow with no workaround. Risk already showing as a `CRITICAL` failure |
| `HIGH` | Blocker has lifted on work that still does real damage. Deferral paired with a failure row. Unjustified in-scope work that has a workaround |
| `MEDIUM` | Data defect (`ts`, `status`, `reason`). KEEP whose trigger has fired. Real work with no issue. Reason no longer holds |
| `LOW` | KEEP with no trigger. Missing `severity`. Locator drift. Superseded surface that changes no result |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: oldest `ts` first. Finding keeps severity when it becomes a ledger row or an issue. Row bucket = ledger severity, or verdict-assigned.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Closures

PENDING

### Trend

PENDING

### Defects

PENDING

### Cost

PENDING

### Pointers

PENDING

### Decisions

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
- [ ] **Summary:** names count per severity, count per verdict, and rows verified / rows open.
- [ ] **Series:** `Trend` open count, inflow, and outflow beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
