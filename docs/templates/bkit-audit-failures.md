<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Failures Triage

> [!CAUTION]
> **Purpose:** Verdict on every open failure — reachable, already fixed, mis-framed, unconfirmed, or a repeat of a known defect.
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
> - NEVER append or edit a ledger line. Close, regression, triage, and knowledge rows live in `Expected` only. `ts` is minted at append (`.bkit/jsonl.md` § Write Idiom), never written in this report.
> - A security row (`category: "security"`, or an auth, secrets, or data-exposure hole) carries key, verdict, and severity only. `file:line` stays in the ledger row. A public repo uses a draft repository security advisory, not this report.

## Universal Instructions

### Context & Goals

`docs/failures.jsonl` is where any agent logs a discovered bug (`.bkit/jsonl.md` § Ledgers & Writers). Rows are appended at discovery and never re-validated. Four drifts: silently fixed (the bug was fixed, the row is still not `CLOSED`); mis-framed (not reachable, or the path has moved); understated (one instance of a defect that is systemic); untracked (reachable, and no issue carries it). A row whose text says it was found by reading and must be confirmed later is a hypothesis, not an established bug. Nothing forces that confirmation. Target failure: **an open row for a bug the code has already fixed, or a live bug the row understates or never confirmed.**

**Applies when:** `docs/failures.jsonl` exists, or agents append `kind: "failure"`. None → one `N/A` row with evidence, never "clean".

**Cadence:** once per ship cycle, and at least monthly when no cycle ships. Extra pass when a new `CRITICAL` row lands (its age target is 7 days), or after an incident on production or a preview.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Problem management and the known-error database (e.g. ITIL 4; record the edition). The deferred and known-error review it describes (e.g. ITIL-aligned known-error monitoring).
- Postmortem action items (e.g. Google SRE Workbook, Postmortem Culture).
- Bug triage and resolution states, including an incomplete state for an unanswered reproduction request (e.g. Mozilla defect severity guide, Bugzilla triage).
- Age targets, set by this procedure: 7 days for `CRITICAL`, 30 days for `HIGH`, from the row's first `ts`. No published standard.

### Scope

- Fold `docs/failures.jsonl` last-row-wins. Open = winning `status != "CLOSED"`.
- Age against target. Whether a CI gate on open `CRITICAL` failures is installed, and whether it reads this ledger.
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

- **CONFIRMED:** real and reachable. Reproduced, or the path read end to end and cited `file:line` (that citation stays out of the report when the row is security). Record reach: the flow, the roles that hit it, and live event counts when an error tracker is available. No issue carries it → `Expected` names the issue to open. A bug that cannot be reproduced is not fixed from the row alone. The failing test is the next step, named in `Expected`, not written here.
- **FIXED:** already resolved. `Expected` = `CLOSED` same-`key` row, with the `references` that closed it, and the test that would fail if the bug returned. A fix with no such test is not FIXED: `Expected` = `TRIAGED` row whose follow-up is the missing test.
- **MIS-FRAMED:** the row is wrong. The bug is not reachable, it names a component or path that has moved, or it records one instance of a defect that is systemic. `Expected` = the corrected row, or the `CLOSED` row with the close reason.
- **TRACKED:** real, an open issue already covers it. `Expected` = the issue to point the row at.
- **UNCONFIRMED:** a hypothesis, not yet reproduced or read end to end. `Expected` = the probe or the failing test that would settle it. Still unsettled on its third run → `CLOSED` as not reproducible, and say so.
- **DUPLICATE:** the same defect as another row under a different `key`. `Expected` = the canonical key, and the `CLOSED` row for this one.
- **OTHER:** fits none. Say what it is, why, and where it goes. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**FIXED and MIS-FRAMED are the verdicts most likely to hide a live bug.** A language server that under-reports biases that way. Either verdict needs a positive reason — the commit that fixed it, the deleted file, or the changed guard. An empty query is not absence. Error-tracker events on the matching issue after the fix commit mean the bug is not fixed.

A row whose text says it awaits confirmation is UNCONFIRMED until reproduced or read end to end.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Ledger:** Steps 3–7 — `docs/failures.jsonl` and `.bkit/jsonl.md`. Fallback: file absent → one `N/A` row after Step 3 and STOP.
- [ ] **Git History:** Steps 2, 5 — commits since the previous report, fix commits. Fallback: sample and regression-by-commit `Not Checked`.
- [ ] **Web:** Step 8 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed language → Step 4 — symbol at its current path, caller chain, diagnostics for one file without a full typecheck, e.g. Serena, `tsserver`. Fallback: text search. Reach and a close that needs callers stay hypotheses until corroborated.
- [ ] **Error Tracker:** Production or preview events exist → Steps 4, 5 — event counts and flows after a fix commit, e.g. Sentry, platform logs. Fallback: code only. Event counts `Not Checked`.
- [ ] **Tracker:** Issues wired → Steps 4, 7 — issue that carries the bug, postmortem tracking issue. Fallback: issue pointers `Not Checked`.
- [ ] **CI Config:** A workflow can fail the build → Step 3 — a gate on open `CRITICAL` failures. Fallback: gate check `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Closures:** Re-verify a sample of the previous report's FIXED and MIS-FRAMED rows at `HEAD`: 10%, and at least 3. Each that no longer holds = finding, with what changed. **Done when:** `Closures` holds the sample, each failure, and the sample's failure rate, or run marked baseline.
- [ ] **Step 3 — Fold:** Last-row-wins per `key`, not per line. The file is append-only (`.gitattributes` `merge=union`); editing a line keeps the stale copy beside its replacement. Highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row). A `key` whose `ts` is not a number → its last line in the file is latest. Open = every winning row with `status != "CLOSED"`, including `TRIAGED` (diagnosed is not fixed), `RESOLVED`, `FIXED`, `SUPERSEDED`, and rows with no `status`. A word that looks finished is not done. A `RESOLVED` or `FIXED` row that really is done gets a `CLOSED` row in `Expected`, with the `references` that closed it. It is not skipped because the word looks finished. Order: `CRITICAL`, then `HIGH`, then oldest `ts`. Compare `severity` case-insensitively. No `severity` → assign one with the verdict. Age from the row's first `ts`: list every `CRITICAL` older than 7 days and every `HIGH` older than 30 days. Where a CI check is installed to go red while any `CRITICAL` row has `status != "CLOSED"`, report whether it is installed. A green check beside such a row = finding (the gate is not reading this ledger). Absent → record in `Checked`. A large open set may be a partial pass → record rows verified / rows open. A winning future `ts` that would outrank a close → name the `key`. No later `ts` is invented. **Done when:** `Trend` holds open counts, age-target breaches, the gate result, and verified / open, or `N/A` and STOP.
- [ ] **Step 4 — Source:** No verdict before this step. Under-reporting biases toward closing a live bug.

<!-- prettier-ignore -->
| Row claims | Check with |
| --- | --- |
| "`X` in `path` is broken" and the path looks stale | Language server, symbol lookup, at its current path. Settles MIS-FRAMED without a manual hunt |
| "Reachable from the API" or from a caller | Language server, references. A caller chain, not an assumption. No callers is a hint, not proof |
| "One instance of a systemic defect" | Text search for the literal signature, repo-wide. An understated row is a pattern question |
| A type or interop failure in one file | Language-server diagnostics for that file, not a full typecheck |
| A ledger, migration, workflow, SQL, config, or string literal | Text search. A language server reads one language |
| FIXED, or the reach of CONFIRMED | Error tracker and platform logs. Events after the fix commit mean not fixed. Counts and flows are the reach |

Pace reference queries. Re-run any empty or surprisingly low result before a close verdict. A partial answer is indistinguishable from a real one. Empty is inconclusive, not absence. Packages or files outside the project graph, and mock-factory keys, are invisible → text search.

Rows from an incident (seen on production or a preview, not found in review) also need their follow-ups checked. Remediation usually names more than the code fix: a regression test, a monitor, an alert, a doc change. Check that each landed. Fix landed, test, or monitor did not → not FIXED. `Expected` names each missing follow-up and the issue to open for it.

Each incident needs a written postmortem, and at least one action that prevents or detects a repeat, with an owner and a tracking issue at the top priority. A user-affecting outage needs at least one top-priority bug. A missing postmortem, or a postmortem with only mitigation items, = finding. `Expected` = the issue to open. **Done when:** every row verified this pass has evidence and the tool on its finding. `Incidents` lists follow-ups and postmortem gaps, or `none`. Unverified rows stay counted in `Trend` and are not passed.

- [ ] **Step 5 — Recurrences:** A same-`key` append that records the defect seen again is a recurrence (`.bkit/jsonl.md` § Updating a Row). Leave out appends that only change `status`. For `category: "testing"`, the flake count is the `key`'s row count under that rule. Rank open rows by that count. Then regressions: for each row that became `CLOSED` since the previous report, look for a later row with the same `key`, a new row describing the same defect under another `key`, or error-tracker events on the matching issue after the close. Each one → `Expected` = the `OPEN` row to append. **Done when:** `Recurrences` ranks open rows and lists regressions, or `none`.
- [ ] **Step 6 — Classes:** (a) Known errors carry their workaround. For every `TRIAGED` or CONFIRMED row that agents keep hitting (2 or more recurrences in Step 5, or a parked row whose blocker is not in the winning row), check that `docs/knowledge.jsonl` has an `ACTIVE` row with the workaround. Missing → finding. `Expected` = the knowledge row to append. (b) Count open and recently closed rows by `category`, package, and root-cause class. The top recurring class this run is a gate candidate → name it for `bkit-audit-gates`. **Done when:** `Classes` holds the workaround gaps, the counts, and the gate candidate, or `none`.
- [ ] **Step 7 — Classify:** Every row, as Step 4 left it, gets one verdict. This run does not append or open issues. A security row goes to `bkit-audit-security`: key, verdict, and severity only in this report. A flaky test's diagnosis goes to `bkit-audit-flakes`. Older flake diagnoses may sit on tracker issues that predate that audit. Search those too.

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
- [ ] **Step 9 — Anything Else:** (a) Everything changed since previous report's commit touching failures (schema and writers in `.bkit/jsonl.md`, steps and agents that append rows, the CI gate on open `CRITICAL` failures, the flake register `bkit-audit-flakes`, error-tracker projects and alert rules) → one-line verdict each. (b) Bounded ~30 min pass: what a senior problem manager flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` sweeps, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

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

Scale per `.bkit/jsonl.md` § Severity. Within a severity: oldest `ts` first. A finding keeps its severity when it becomes a ledger row or an issue. A row's bucket is its ledger severity, or the one its verdict assigns.

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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, age-target breach count, and rows verified / rows open.
- [ ] **Series:** open count and the recurrence ranking beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
