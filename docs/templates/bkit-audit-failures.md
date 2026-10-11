<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Failures Triage

> [!CAUTION]
> **Purpose:** Verdict on every open failure — reachable, already fixed, mis-framed, unconfirmed, or a repeat of a known defect.
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
> - NEVER append or edit a ledger line. Close, regression, triage, and knowledge rows live in `Expected` only. `ts` is minted at append (`.bkit/jsonl.md` § Write Idiom), never written in this report.
> - A security row (`category: "security"`, or an auth, secrets, or data-exposure hole) carries key, verdict, and severity only. `file:line` stays in the ledger row. A public repo uses a draft repository security advisory, not this report.

## Universal Instructions

### Context & Goals

`docs/failures.jsonl` logs discovered bugs (`.bkit/jsonl.md` § Ledgers & Writers). Rows append at discovery; never re-validated. Four drifts:

- Silently fixed — bug fixed, row not `CLOSED`
- Mis-framed — not reachable, or path moved
- Understated — one instance of a systemic defect
- Untracked — reachable, no issue carries it

Row text that says found by reading and must be confirmed later = hypothesis, not established bug. Nothing forces confirmation. Target failure: **an open row for a bug the code has already fixed, or a live bug the row understates or never confirmed.**

**Applies when:** `docs/failures.jsonl` exists, or agents append `kind: "failure"`. None → one `N/A` row with evidence, never "clean".

**Cadence:** once per ship cycle, and at least monthly when no cycle ships. Extra pass when new `CRITICAL` row lands (age target 7 days), or after incident on production or preview.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Problem management and the known-error database (e.g. ITIL 4; record the edition). The deferred and known-error review it describes (e.g. ITIL-aligned known-error monitoring).
- Postmortem action items (e.g. Google SRE Workbook, Postmortem Culture).
- Bug triage and resolution states, including an incomplete state for an unanswered reproduction request (e.g. Mozilla defect severity guide, Bugzilla triage).
- Age targets, set by this procedure: 7 days for `CRITICAL`, 30 days for `HIGH`, from the row's first `ts`. No published standard.

### Scope

- Fold `docs/failures.jsonl` last-row-wins. Open = winning `status != "CLOSED"`.
- Age against target. Whether CI gate on open `CRITICAL` failures is installed, and whether it reads this ledger.
- Verify every open row against source, including hypotheses, mis-framing, and understatement.
- Incident follow-ups, and whether each incident has a postmortem with a preventing action.
- Recurrences and regressions.
- Known-error workaround on record. Root-cause classes, and the top class as a gate candidate.
- Security rows routed without exploit detail.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Deliberate deferred work | Deferral register | `bkit-audit-deferrals` |
| Exploit reproduction; auth and exposure as an attack sweep | Security sweep reads the ledger row | `bkit-audit-security` |
| Flake diagnosis in depth | Flake sweep | `bkit-audit-flakes` |
| Log volume, alert rules, drain coverage | Log sweep | `bkit-audit-logs` |
| Closing rows the code already finished; locator fixes; `TRIAGED` when an issue already exists | Ledger writes. For `category: "testing"`, the utility closes only on a landed deterministic fix, never a recent green run | `@bkit-utility-update-failures` |
| Opening issues; writing the failing test or the postmortem | Audit reports only | Plan from this report |

### Verdicts

One per verified row.

- **CONFIRMED:** real and reachable. Reproduced, or path read end to end with cited `file:line` (citation out of report when row is security). Record reach: flow, roles that hit it, live event counts when error tracker available. No issue → `Expected` names issue to open. Bug not reproducible is not fixed from row alone. Failing test = next step in `Expected`, not written here.
- **FIXED:** already resolved. `Expected` = `CLOSED` same-`key` row, with `references` that closed it, and test that would fail if bug returned. Fix with no such test is not FIXED: `Expected` = `TRIAGED` row whose follow-up is missing test.
- **MIS-FRAMED:** row wrong. Bug not reachable, component/path moved, or one instance of systemic defect. `Expected` = corrected row, or `CLOSED` row with close reason.
- **TRACKED:** real; open issue covers it. `Expected` = issue to point row at.
- **UNCONFIRMED:** hypothesis; not yet reproduced or read end to end. `Expected` = probe or failing test to settle it. Still unsettled on third run → `CLOSED` as not reproducible, and say so.
- **DUPLICATE:** same defect as another row under different `key`. `Expected` = canonical key, and `CLOSED` row for this one.
- **OTHER:** fits none. Say what it is, why, and where it goes. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**FIXED and MIS-FRAMED are the verdicts most likely to hide a live bug.** Language server under-reporting biases that way. Either verdict needs positive reason — fix commit, deleted file, or changed guard. Empty query is not absence. Error-tracker events on matching issue after fix commit → bug not fixed.

Row text awaiting confirmation = UNCONFIRMED until reproduced or read end to end.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Ledger:** Steps 3–7 — `docs/failures.jsonl` and `.bkit/jsonl.md`. Fallback: file absent → one `N/A` row after Step 3 and STOP.
- [ ] **Git History:** Steps 2, 5 — commits since the previous report, fix commits. Fallback: closures and regression-by-commit `Not Checked`.
- [ ] **Web:** Step 8 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed language → Step 4 — symbol at current path, caller chain, diagnostics for one file without full typecheck, e.g. Serena, `tsserver`. Fallback: text search. Reach and close needing callers stay hypotheses until corroborated.
- [ ] **Error Tracker:** Production or preview events exist → Steps 4, 5 — event counts and flows after fix commit, e.g. Sentry, platform logs. Fallback: code only. Event counts `Not Checked`.
- [ ] **Tracker:** Issues wired → Steps 4, 7 — issue carrying bug, postmortem tracking issue. Fallback: issue pointers `Not Checked`.
- [ ] **CI Config:** Workflow can fail build → Step 3 — gate on open `CRITICAL` failures. Fallback: gate check `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Closures:** Re-verify every FIXED and MIS-FRAMED row from previous report at `HEAD`. Each no longer holding = finding, with what changed. **Done when:** `Closures` holds every row, each failure, and failure rate, or run marked baseline.
- [ ] **Step 3 — Fold:** Last-row-wins per `key`, not per line. Append-only file (`.gitattributes` `merge=union`); editing a line keeps stale copy beside replacement. Highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row). `key` whose `ts` is not a number → last line in file is latest. Open = every winning row with `status != "CLOSED"`, including `TRIAGED` (diagnosed is not fixed), `RESOLVED`, `FIXED`, `SUPERSEDED`, and rows with no `status`. Word that looks finished is not done. `RESOLVED` or `FIXED` row really done → `CLOSED` row in `Expected`, with `references` that closed it. Not skipped because word looks finished. Order: `CRITICAL`, then `HIGH`, then oldest `ts`. Compare `severity` case-insensitively. No `severity` → assign with verdict. Age from row's first `ts`: list every `CRITICAL` older than 7 days and every `HIGH` older than 30 days. Where CI check goes red while any `CRITICAL` row has `status != "CLOSED"`, report whether installed. Green check beside such row = finding (gate not reading ledger). Absent → record in `Checked`. Large open set may be partial pass → record rows verified / rows open. Winning future `ts` that would outrank close → name `key`. No later `ts` invented. **Done when:** `Trend` holds open counts, age-target breaches, gate result, and verified / open, or `N/A` and STOP.
- [ ] **Step 4 — Source:** No verdict before this step. Under-reporting biases toward closing live bug.

<!-- prettier-ignore -->
| Row claims | Check with |
| --- | --- |
| "`X` in `path` is broken" and the path looks stale | Language server, symbol lookup, at its current path. Settles MIS-FRAMED without a manual hunt |
| "Reachable from the API" or from a caller | Language server, references. A caller chain, not an assumption. No callers is a hint, not proof |
| "One instance of a systemic defect" | Text search for the literal signature, repo-wide. An understated row is a pattern question |
| A type or interop failure in one file | Language-server diagnostics for that file, not a full typecheck |
| A ledger, migration, workflow, SQL, config, or string literal | Text search. A language server reads one language |
| FIXED, or the reach of CONFIRMED | Error tracker and platform logs. Events after the fix commit mean not fixed. Counts and flows are the reach |

Pace reference queries. Re-run empty or surprisingly low result before close verdict. Partial answer indistinguishable from real one. Empty inconclusive, not absence. Packages/files outside project graph, mock-factory keys invisible → text search.

Incident rows (seen on production or preview, not in review) need follow-ups checked. Remediation usually names more than code fix: regression test, monitor, alert, doc change. Check each landed. Fix landed, test or monitor did not → not FIXED. `Expected` names each missing follow-up and issue to open.

Each incident: written postmortem; ≥1 action preventing or detecting repeat, with owner and tracking issue at top priority. User-affecting outage needs ≥1 top-priority bug. Missing postmortem, or postmortem with only mitigation items = finding. `Expected` = issue to open. **Done when:** every row verified this pass has evidence and tool on finding. `Incidents` lists follow-ups and postmortem gaps, or `none`. Unverified rows stay counted in `Trend`; not passed.

- [ ] **Step 5 — Recurrences:** Same-`key` append recording defect seen again = recurrence (`.bkit/jsonl.md` § Updating a Row). Omit appends that only change `status`. For `category: "testing"`, flake count = `key`'s row count under that rule. Rank open rows by count. Then regressions: each row `CLOSED` since previous report → look for later row same `key`, new row same defect under another `key`, or error-tracker events on matching issue after close. Each → `Expected` = `OPEN` row to append. **Done when:** `Recurrences` ranks open rows and lists regressions, or `none`.
- [ ] **Step 6 — Classes:** (a) Known errors carry workaround. For every `TRIAGED` or CONFIRMED row agents keep hitting (≥2 recurrences in Step 5, or parked row whose blocker not in winning row), check `docs/knowledge.jsonl` has `ACTIVE` row with workaround. Missing → finding. `Expected` = knowledge row to append. (b) Count open and recently closed rows by `category`, package, root-cause class. Top recurring class this run = gate candidate → name for `bkit-audit-gates`. **Done when:** `Classes` holds workaround gaps, counts, gate candidate, or `none`.
- [ ] **Step 7 — Classify:** Every row, as Step 4 left it, gets one verdict. This run does not append or open issues. Security row → `bkit-audit-security`: key, verdict, severity only in this report. Flaky test diagnosis → `bkit-audit-flakes`. Older flake diagnoses may sit on tracker issues predating that audit. Search those too.

<!-- prettier-ignore -->
| Finding | Expected |
| --- | --- |
| CONFIRMED | The issue to open if none carries it. The failing test is the next step |
| FIXED | The `CLOSED` row, with the `references` that closed it, and the regression test |
| Fix with no regression test, or an incident follow-up that did not land | The `TRIAGED` row, and the issue to open for each missing follow-up |
| Missing postmortem, or one with only mitigation items | The issue to open |
| MIS-FRAMED | The corrected row, or the `CLOSED` row with the close reason |
| TRACKED | The issue to point the row at |
| UNCONFIRMED | The probe or failing test. On its third run, the `CLOSED` row as not reproducible |
| DUPLICATE | The canonical key, and the `CLOSED` row for this one |
| Regression | The `OPEN` row to append |
| Known error with no workaround on record | The `docs/knowledge.jsonl` row to append |
| Top recurring root-cause class | Named for `bkit-audit-gates`, as a gate candidate |
| Security row | `bkit-audit-security`. Key, verdict, and severity only |
| Flaky test's diagnosis | `bkit-audit-flakes` |
| OTHER | Where it goes |

**Done when:** every verified row has one verdict. Security rows in Findings carry no `file:line` and no exploit detail.

- [ ] **Step 8 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per practice (known-error records, proactive problem review, postmortem action items, triage resolution states, age targets) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 9 — Anything Else:** (a) Everything changed since previous report's commit touching failures (schema and writers in `.bkit/jsonl.md`, steps and agents that append rows, CI gate on open `CRITICAL` failures, flake register `bkit-audit-flakes`, error-tracker projects and alert rules) → one-line verdict each. (b) Bounded ~30 min pass: what senior problem manager flags that no step asks; read since previous run (incidents, `bkit-audit-logs` sweeps, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Read-only:** no ledger line, code, or config changed. Every close, regression, and knowledge row is `Expected` only.
- [ ] **Security:** security rows carry key, verdict, and severity only. No exploit detail, no `file:line`.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Data loss, a security hole, or a broken workflow with no workaround. Still open, including a row whose word looks finished |
| `HIGH` | Real damage or a blocked path, with a workaround. Fix landed and no regression test. Incident whose test or monitor did not land. User-affecting outage with no preventing action |
| `MEDIUM` | Mis-framed or understated. Recurrence or regression. Known error with no workaround on record. Age target breached. Hypothesis still open |
| `LOW` | Duplicate key. Path drift that does not change reach. Missing `severity` |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: oldest `ts` first. Finding keeps severity when it becomes ledger row or issue. Row's bucket = ledger severity, or verdict assigns.

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

### Incidents

PENDING

### Recurrences

PENDING

### Classes

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
- [ ] **Summary:** names count per severity, age-target breach count, and rows verified / rows open.
- [ ] **Series:** open count and the recurrence ranking beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
