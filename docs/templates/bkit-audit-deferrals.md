<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Deferrals Triage

> [!CAUTION]
> **Purpose:** A verdict on every open deferral: already done, superseded, tracked, parked, or in-scope work that should have been finished.
>
> **Rules:**
>
> - NEVER append or edit a ledger line. Write each correction and close row in `Expected` only.
> - Leave `ts` out of every row in this report. The writer mints it when it appends the row (`.bkit/jsonl.md` § Write Idiom).
> - A winning row whose `ts` is in the future outranks every correction. Name its `key` rather than inventing a later `ts`.

## Universal Instructions

### Context & Goals

Deferred work adds rows to `docs/deferrals.jsonl`, and nothing reads them again. Rows drift in three ways: the work is silently done (it landed, but the row is still not `CLOSED`), superseded (its surface was rewritten or removed), or genuinely deferred and untracked (real work with no tracker issue). The failure this audit targets is an open row whose work the code has already finished, or a real deferral that nothing carries. Examples: a row left at `RESOLVED` or `SUPERSEDED` because only `CLOSED` counts as done, or a deferral whose only record is a comment on a closed issue. The register holds deliberate debt only (the prudent and deliberate quadrant).

**Applies when:** `docs/deferrals.jsonl` exists, or a workflow writes `kind: "deferral"`. **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once per ship cycle, and at least once a month when no cycle ships. Run an extra pass after a release, or after another audit records deferred items (e.g., `bkit-audit-app-performance`).

**Anchor Standards:**

- Technical debt, principal, and interest, and the Technical Debt Quadrant (e.g. Martin Fowler).
- Hotspot analysis, churn against code health (e.g. CodeScene).
- Review of deferred problem records on a schedule and on release: activate, keep deferred, or close (e.g. ITIL-aligned known-error monitoring).
- `.bkit/jsonl.md` § Deferral Reason — `reason` enum and the four `unjustified` tests, at the installed bkit version.

### Scope

- Fold `docs/deferrals.jsonl` last-row-wins. A row is open when its winning row has `status != "CLOSED"`.
- Check the winning row for data defects in `ts`, `status` and `reason`, and put the row to append in `Expected`.
- Verify every open row against source before any verdict.
- Re-test each `reason`, and each `KEEP` trigger.
- Measure the carrying cost: 90-day churn, and the related rows in `docs/failures.jsonl` and `.bkit/friction.jsonl`.
- Check the tracker issues that rows point at.
- Find the deferrals that exist only as comments on closed issues.
- Adjudicate `unjustified` with the four tests, and report the row without appending it.
- Track the trend: open count, inflow, outflow, age, rows missing `severity` or `reason`, and rows verified / rows open.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Reckless and inadvertent debt | It is not in this register | `bkit-audit-slop`, `bkit-audit-architecture`, `bkit-audit-dead-code` |
| Known bugs | They belong in the failure ledger | `bkit-audit-failures` |
| Closing rows the code already finished; locator fixes; `TRIAGED` when an issue already exists | These are ledger writes. The utility reads every winning row that is not `CLOSED` | `@bkit-utility-update-deferrals` |
| Doing the deferred work; opening tracker issues | The audit only reports | A plan made from this report |

### Verdicts

Give each verified row one verdict.

- **DONE:** the work already landed. `Expected` = the `CLOSED` row with the same `key`. Cite `file:line`.
- **SUPERSEDED:** the row no longer applies (its surface moved, was rewritten or removed, or is N/A). `Expected` = the `CLOSED` row and the reason.
- **TRACKED:** the work is genuinely deferred, and an open issue already covers it. `Expected` = the issue to point the row at, or the acceptance criteria to extend.
- **NEEDS ISSUE:** the work is genuinely deferred, real and untracked. `Expected` = the issue to open.
- **KEEP:** the work is genuinely deferred, correctly parked, and not yet worth an issue (a tripwire or a contingent item). `Expected` = no action, and the trigger.
- **SMALL:** the work is small enough for the next cycle. This run does not do it.
- **ACCEPTED:** the row is still true, and the work is deliberately never to be done. `Expected` = who decides, and the `CLOSED` row to append once they sign off. Record the verdict without waiting for the sign-off.
- **UNJUSTIFIED:** all four tests hold. `Expected` = a row with the same `key`, `reason: "unjustified"`, the failed test named in `description`, and `status: "TRIAGED"`. Later rows carry `reason` word for word. The work goes back in scope through a plan.
- **OTHER:** it fits no other verdict. Say what it is, why, and where it goes. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

**Close evidence:** DONE is the verdict most likely to be wrong, and a plausible commit message is not evidence. Give each DONE or SUPERSEDED a positive reason: a commit, a deleted file or a new owner module. An empty query does not prove absence.

Set UNJUSTIFIED when all four tests hold (`.bkit/jsonl.md` § Deferral Reason):

1. `remediation` names specific files and a bounded edit, not a new architecture.
2. The surface is inside files the cycle already touched.
3. No external blocker exists: no missing decision, credential, upstream fix or confirmation.
4. `reason` is `scope-declared`, and the row is the only place the work was called out of scope. Test 4 carries the most weight.

When you repair a missing or illegal `reason`, use one of the first four enum values, never `unjustified`. Set `unjustified` in Step 9 only.

**KEEP needs a trigger:** Each KEEP row names its trigger, such as "before launch", "when N users" or a dependency version.

- **If** the row has no trigger, **or** its trigger has fired → give it another verdict.
- **If** the row is on its third KEEP in a row → give it NEEDS ISSUE or ACCEPTED.

**Cluster:** Group the open rows by package and `category`.

- **If** a group holds 3 or more rows → propose one `own-cycle` issue for the group in `Expected`, not one per row.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Ledger:** Steps 3-9 — `docs/deferrals.jsonl` and `.bkit/jsonl.md`. Fallback: **If** the file is absent → write one `N/A` row after Step 3, then **STOP**.
- [ ] **Git History:** Steps 2, 7 — the commits since the previous report, and 90-day churn. Fallback: mark closures and churn `Not Checked`.
- [ ] **Web:** Step 10 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Language Server:** **If** the language is typed → Steps 5, 6 — symbol location and callers (e.g., Serena, `tsserver`). Fallback: text search. A close that needs a caller set stays a hypothesis until something corroborates it.
- [ ] **Tracker:** **If** issues are wired → Steps 6, 8 — open issues, acceptance criteria, and comments on the issues closed since the previous report. Fallback: mark tracker pointers `Not Checked`.
- [ ] **Run Stats:** **If** `.bkit/stats.jsonl` has `outcome` rows → Step 3 — sum `deferralsAdded`. Fallback: mark inflow `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Closures:** Re-verify at `HEAD` every DONE and SUPERSEDED row from the previous report. Record each one that no longer holds as a finding, with what changed. **Done when:** `Closures` holds every row, each failure and the failure rate, or the run is marked baseline.
- [ ] **Step 3 — Fold:** Fold the ledger last-row-wins per `key`, not per line. The ledger is append-only (`.gitattributes` `merge=union`), so editing a line leaves the stale copy beside its replacement. The row with the highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row). **If** a `key` has a non-numeric `ts` → the last line in the file is the latest. A row is open when its winning row has `status != "CLOSED"`. That includes `TRIAGED`, `RESOLVED`, `BLOCKED`, `SUPERSEDED`, `CANCELLED`, free text after the word, a missing `status` and any value outside the enum, because a word that looks finished does not mean done. Order the open rows `CRITICAL` first, then `HIGH`, then oldest `ts`. Compare `severity` case-insensitively. **If** a row has no `severity` → assign one with its verdict. Compare the trend with the previous report: the open count; inflow, the sum of `deferralsAdded` on `outcome` rows in `.bkit/stats.jsonl` since the previous run, where the field exists; outflow, the rows that became `CLOSED` since; an age histogram by `ts`; and the share of open rows missing `severity` or `reason`. Always record rows verified / rows open, because a large open set may get only a partial pass. The fold cannot see a deferral with no `key`, or one recorded only in a PR description. **Done when:** `Trend` holds the counts, the histogram, inflow, outflow, the missing-field share, verified / open and those limits, or `N/A` is recorded → **STOP**.
- [ ] **Step 4 — Defects:** Check the winning row of each `key`, without appending. `Expected` = the row the writer appends: a copy of the latest row with only the defective field changed, the same `key`, and a `ts` minted at append, never a literal and never in the future.

<!-- prettier-ignore -->
| Field | Defect | Expected row |
| --- | --- | --- |
| `ts` | Not numeric Unix milliseconds: a string, seconds, or missing. The fold order is then undefined | The same row with a fresh `ts` |
| `status` | Outside `OPEN` / `TRIAGED` / `CLOSED` (`RESOLVED`, `BLOCKED`, `SUPERSEDED`, free text) | `TRIAGED` where the row records analysis, otherwise `OPEN`, with the old word kept in `description`. `CLOSED` comes only from a verdict |
| `reason` | Missing, or outside `scope-declared` / `hard-blocked` / `needs-decision` / `own-cycle` / `low-severity` / `unjustified` | One of the first four values that the row's text supports, with the old text kept in `description`. Never `unjustified`, and `low-severity` only on a `LOW` row |

**If** a winning row has a future `ts` → name its `key` in a finding for the owner, and propose no correction row. **Done when:** `Defects` holds the count of each defect and each `Expected` row, or `none`.

- [ ] **Step 5 — Source:** Give no verdict before this step. Claims of outstanding work are as unreliable as claims of done work.

<!-- prettier-ignore -->
| Row claims | Check with |
| --- | --- |
| "`X` should be extracted, renamed, or consolidated" | Language server symbol lookup: does it exist, and at what path now? A symbol that moved is SUPERSEDED |
| "Every caller of `Y` still does Z" | Language server references, then read the callers. This is DONE evidence |
| "The guard is missing at N sites" | Text search for the literal signature. Counting sites is a pattern question |
| Migrations, workflows, SQL, docs, or other ledgers | Text search. A language server reads one language |

Pace the reference queries. Re-run an empty or surprisingly low result before giving a close verdict, because a partial answer looks the same as a real one. An empty result is inconclusive, not proof of absence. **Done when:** every row verified this pass has its evidence and the tool on its finding. Unverified rows stay counted in `Trend`, and are not passed.

- [ ] **Step 6 — Reasons:** `reason` records why the row was deferred, and each value implies a check. Re-test the enum value that Step 4 assigned in the same way. UNJUSTIFIED replaces a value only when Step 9's four tests hold.

<!-- prettier-ignore -->
| `reason` | Check |
| --- | --- |
| `hard-blocked` | Is the blocker the row names still there? |
| `needs-decision` | Was the decision made since? Search `docs/decisions.jsonl` |
| `own-cycle` | Does a plan or an issue for it exist? |
| `low-severity` | Is it still `LOW`? The four tests never make it `unjustified` |
| `scope-declared` | Does the cited doc section exist, and does it predate the row? |

A lifted blocker is the highest-yield finding, so flag it on the verdict. Apply the KEEP trigger rule. **Done when:** every verified row's reason and every KEEP trigger has a result on its finding.

- [ ] **Step 7 — Cost:** Severity measures how bad the gap is, not what it costs to carry. For each row still open after Step 6, measure churn: the commits touching its surface in the last 90 days (e.g., `git log --since=90.days --oneline -- <path>`). Find the related rows in `docs/failures.jsonl` and `.bkit/friction.jsonl` on the same symbol or path. **If** churn is high **and** related failures exist → raise the severity. **If** the risk is already a failure row → treat it as a live bug: pair the failure `key`, raise the severity, and name `bkit-audit-failures` for the bug triage. **Done when:** `Cost` holds one row per surviving open row, with its churn, related keys and severity change.
- [ ] **Step 8 — Pointers:** (a) For each TRACKED row, check that the open issue's acceptance criteria include the deferred scope, and that the issue is not stale and has not been `Low` across 3 or more `bkit-audit-issues` passes. **If** either check fails → say which fix applies: extend the criteria, or give the verdict NEEDS ISSUE. (b) For each row that points at a closed issue, read what closed it. **If** the scope landed → DONE. **If** the scope was dropped → NEEDS ISSUE. (c) For each issue closed since the previous report, read its closing comments for deferred items. **If** a deferred item has no row keyed to it → `Expected` = the row to append. **Done when:** `Pointers` lists the issue checks and the comment-only deferrals, or `none`.
- [ ] **Step 9 — Classify:** Give every row, as Step 5 left it, one verdict. Adjudicate `unjustified` here, and only here. Cluster the rows before naming issues. Put every `needs-decision` row and every ACCEPTED row in `Decisions`, with who decides. This run does not append rows, open issues or do the work.

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

**Done when:** every verified row has one verdict, and `Decisions` lists each `needs-decision` and ACCEPTED row with who decides, or `none`.

- [ ] **Step 10 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per practice (principal and interest, the debt quadrant, hotspots, review triggers for deferred records) and one per `reason` value, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches deferrals: the schema and writers in `.bkit/jsonl.md`, the design, plan, build and ship steps that write rows, the ship deferral check `@bkit-ship-deferred-sweep`, and the issues that rows point at. (b) In a bounded pass of about 30 minutes, note what a senior EM owning a technical-debt register would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` sweeps, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Read-only:** no ledger line, code or config changed.
- [ ] **Rows proposed only:** every correction and close row is marked `Expected`.
- [ ] **Positive close:** every `DONE` and `SUPERSEDED` cites a positive reason, never an empty query.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | The deferred gap is data loss, a security hole, or a broken workflow with no workaround. The risk already shows as a `CRITICAL` failure |
| `HIGH` | A blocker has lifted on work that still does real damage. A deferral is paired with a failure row. Unjustified in-scope work has a workaround |
| `MEDIUM` | A data defect (`ts`, `status`, `reason`). A KEEP whose trigger has fired. Real work with no issue. A reason that no longer holds |
| `LOW` | A KEEP with no trigger. A missing `severity`. Locator drift. A superseded surface that changes no result |

Within a severity, list the oldest `firstTs` first, using `ts` where `firstTs` is absent. A finding keeps its severity when it becomes a ledger row or an issue. A row's severity is its ledger `severity`, or the one its verdict assigned.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the count per verdict, and rows verified / rows open.
- [ ] **Series:** the report shows `Trend` open count, inflow, and outflow beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
