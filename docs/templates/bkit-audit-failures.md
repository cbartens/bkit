<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Failures Triage

> [!CAUTION]
> **Purpose:** A verdict on every open failure: reachable, already fixed, mis-framed, unconfirmed, or a repeat of a known defect.
>
> **Rules:**
>
> - NEVER append or edit a ledger line.
> - Write close, regression, triage and knowledge rows in `Expected` only.
> - Never write `ts` in this report, because it is minted at append (`.bkit/jsonl.md` § Write Idiom).
> - Give a security row (`category: "security"`, or an auth, secrets or data-exposure hole) its key, verdict and severity only.
> - Keep a security row's `file:line` in the ledger row.
> - **If** the repo is public → report a security row through a draft repository security advisory, not this report.

## Universal Instructions

### Context & Goals

`docs/failures.jsonl` logs discovered bugs (`.bkit/jsonl.md` § Ledgers & Writers). Rows are appended at discovery and never re-validated. They drift in four ways:

- Silently fixed: the bug is fixed, and the row is not `CLOSED`.
- Mis-framed: the bug is not reachable, or its path moved.
- Understated: the row is one instance of a systemic defect.
- Untracked: the bug is reachable, and no issue carries it.

Row text that says the bug was found by reading and must be confirmed later is a hypothesis, not an established bug, and nothing forces the confirmation. The failure this audit targets is an open row for a bug the code has already fixed, or a live bug the row understates or never confirmed.

**Applies when:** `docs/failures.jsonl` exists, **or** agents append `kind: "failure"`. **If** neither holds → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once per ship cycle, and at least once a month when no cycle ships. Run an extra pass when a new `CRITICAL` row lands (its age target is 7 days), or after an incident on production or preview.

**Anchor Standards:**

- Problem management and the known-error database (e.g. ITIL 4; record the edition). The deferred and known-error review it describes (e.g. ITIL-aligned known-error monitoring).
- Postmortem action items (e.g. Google SRE Workbook, Postmortem Culture).
- Bug triage and resolution states, including an incomplete state for an unanswered reproduction request (e.g. Mozilla defect severity guide, Bugzilla triage).
- Age targets, set by this procedure: 7 days for `CRITICAL`, 30 days for `HIGH`, from the winning row's `firstTs` (`ts` when absent). No published standard.

### Scope

- Fold `docs/failures.jsonl` last-row-wins. A row is open when its winning row has `status != "CLOSED"`.
- Measure each row's age against its target.
- Check whether a CI gate on open `CRITICAL` failures is installed, and whether it reads this ledger.
- Verify every open row against source, including hypotheses, mis-framing and understatement.
- Check incident follow-ups, and whether each incident has a postmortem with a preventing action.
- Find recurrences and regressions.
- Check that each known error has a workaround on record.
- Count root-cause classes, and name the top class as a gate candidate.
- Route security rows without exploit detail.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Deliberate deferred work | It is in the deferral register | `bkit-audit-deferrals` |
| Exploit reproduction; auth and exposure as an attack sweep | The security sweep reads the ledger row | `bkit-audit-security` |
| Flake diagnosis in depth | The flake sweep covers it | `bkit-audit-flakes` |
| Log volume, alert rules, drain coverage | The log sweep covers it | `bkit-audit-logs` |
| Closing rows the code already finished; locator fixes; `TRIAGED` when an issue already exists | These are ledger writes. For `category: "testing"`, the utility closes a row only on a landed deterministic fix, never on a recent green run | `@bkit-utility-update-failures` |
| Opening issues; writing the failing test or the postmortem | The audit only reports | A plan made from this report |

### Verdicts

Give each verified row one verdict.

- **CONFIRMED:** the bug is real and reachable. It was reproduced, or its path was read end to end with a cited `file:line`. **If** the row is a security row → keep the citation out of the report. Record the reach: the flow, the roles that hit it, and live event counts when an error tracker is available. **If** no issue carries it → `Expected` names the issue to open. A bug that cannot be reproduced is not fixed on the row's word alone. The failing test is the next step, named in `Expected`, not written here.
- **FIXED:** the bug is already resolved. `Expected` = the `CLOSED` row with the same `key`, with the `references` that closed it, and the test that would fail if the bug returned. A fix with no such test is not FIXED: `Expected` = a `TRIAGED` row whose follow-up is the missing test.
- **MIS-FRAMED:** the row is wrong. The bug is not reachable, its component or path moved, or it is one instance of a systemic defect. `Expected` = the corrected row, or the `CLOSED` row with the close reason.
- **TRACKED:** the bug is real, and an open issue covers it. `Expected` = the issue to point the row at.
- **UNCONFIRMED:** the row is a hypothesis, not yet reproduced or read end to end. `Expected` = the probe or failing test that settles it. **If** it is still unsettled on its third run → `CLOSED` as not reproducible, and say so.
- **DUPLICATE:** the row is the same defect as another row under a different `key`. `Expected` = the canonical key, and the `CLOSED` row for this one.
- **OTHER:** it fits no other verdict. Say what it is, why, and where it goes. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

**Close evidence:** FIXED and MIS-FRAMED are the verdicts most likely to hide a live bug, and language-server under-reporting biases the run toward them. Either verdict needs a positive reason: a fix commit, a deleted file or a changed guard. An empty query does not prove absence. **If** the error tracker shows events on the matching issue after the fix commit → the bug is not fixed.

Row text awaiting confirmation is UNCONFIRMED until the bug is reproduced or read end to end.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Ledger:** Steps 3-7 — `docs/failures.jsonl` and `.bkit/jsonl.md`. Fallback: **If** the file is absent → write one `N/A` row after Step 3, then **STOP**.
- [ ] **Git History:** Steps 2, 5 — commits since the previous report, and fix commits. Fallback: mark closures and regression-by-commit `Not Checked`.
- [ ] **Web:** Step 8 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Language Server:** **If** the language is typed → Step 4 — the symbol at its current path, the caller chain, and diagnostics for one file without a full typecheck (e.g., Serena, `tsserver`). Fallback: text search. Reach and closes that need callers stay hypotheses until corroborated.
- [ ] **Error Tracker:** **If** production or preview events exist → Steps 4, 5 — event counts and flows after the fix commit (e.g., Sentry, platform logs). Log access: the `context-fetch` blocks below `bkit:end` in `.agents/context.md` are ready-made read-only readers. `bkit context list-blocks` prints each block's `context` and `body`. Set a body's `# Customise:` knobs to the audit window, and run it with `direnv exec . bash`. Fallback: code only. Mark event counts `Not Checked`.
- [ ] **Tracker:** **If** issues are wired → Steps 4, 7 — the issue carrying the bug, and the postmortem tracking issue. Fallback: mark issue pointers `Not Checked`.
- [ ] **CI Config:** **If** a workflow can fail the build → Step 3 — the gate on open `CRITICAL` failures. Fallback: mark the gate check `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Closures:** Re-verify at `HEAD` every FIXED and MIS-FRAMED row from the previous report. Each one that no longer holds is a finding, with what changed. **Done when:** `Closures` holds every row, each failure, and the failure rate, or the run is marked baseline.
- [ ] **Step 3 — Fold:** Fold last-row-wins per `key`, not per line. The file is append-only (`.gitattributes` `merge=union`), so editing a line leaves the stale copy beside the replacement. The highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row). **If** a `key`'s `ts` is not a number → the last line in the file is the latest. Open means every winning row with `status != "CLOSED"`, including `TRIAGED` (diagnosed is not fixed), `RESOLVED`, `FIXED`, `SUPERSEDED`, and rows with no `status`. A word that looks finished does not make a row done. **If** a `RESOLVED` or `FIXED` row is really done → put a `CLOSED` row in `Expected`, with the `references` that closed it. Do not skip a row because its word looks finished. Order the rows `CRITICAL`, then `HIGH`, then oldest `ts`. Compare `severity` case-insensitively. **If** a row has no `severity` → assign one with its verdict. Measure age from the row's first `ts`, and list every `CRITICAL` older than 7 days and every `HIGH` older than 30 days. Report whether a CI check is installed that goes red while any `CRITICAL` row has `status != "CLOSED"`. A green check beside such a row is a finding, because the gate is not reading the ledger. **If** the check is absent → record that in `Checked`. A large open set may get a partial pass, so record rows verified / rows open. **If** a winning row has a future `ts` that would outrank a close → name its `key`. Do not invent a later `ts`. **Done when:** `Trend` holds the open counts, the age-target breaches, the gate result, and verified / open, or holds `N/A`, then **STOP**.
- [ ] **Step 4 — Source:** Give no verdict before this step. Under-reporting biases the run toward closing a live bug.

<!-- prettier-ignore -->
| Row claims | Check with |
| --- | --- |
| "`X` in `path` is broken" and the path looks stale | Language server, symbol lookup, at its current path. Settles MIS-FRAMED without a manual hunt |
| "Reachable from the API" or from a caller | Language server, references. A caller chain, not an assumption. No callers is a hint, not proof |
| "One instance of a systemic defect" | Text search for the literal signature, repo-wide. An understated row is a pattern question |
| A type or interop failure in one file | Language-server diagnostics for that file, not a full typecheck |
| A ledger, migration, workflow, SQL, config, or string literal | Text search. A language server reads one language |
| FIXED, or the reach of CONFIRMED | Error tracker and platform logs. Events after the fix commit mean not fixed. Counts and flows are the reach |

Pace the reference queries. Re-run an empty or surprisingly low result before giving a close verdict, because a partial answer looks the same as a real one. An empty result is inconclusive, not proof of absence. Packages and files outside the project graph, and mock-factory keys, are invisible to the language server, so use text search for them.

Incident rows (seen on production or preview, not in review) need their follow-ups checked. The remediation usually names more than the code fix: a regression test, a monitor, an alert or a doc change. Check that each one landed. **If** the fix landed **and** the test or monitor did not → the row is not FIXED. `Expected` names each missing follow-up and the issue to open.

Each incident needs a written postmortem, with at least one action that prevents or detects a repeat, an owner, and a tracking issue at top priority. A user-affecting outage needs at least one top-priority bug. A missing postmortem, or a postmortem with only mitigation items, is a finding, and `Expected` = the issue to open. **Done when:** every row verified this pass has evidence and the tool on its finding. `Incidents` lists the follow-ups and postmortem gaps, or says `none`. Unverified rows stay counted in `Trend`, and are not passed.

- [ ] **Step 5 — Recurrences:** A same-`key` append that records the defect being seen again is a recurrence (`.bkit/jsonl.md` § Updating a Row). Leave out appends that only change `status`. For `category: "testing"`, the flake count is the winning row's `updates`, status-only appends included. Rank the open rows by count. Then find regressions. For each row `CLOSED` since the previous report, look for a later row with the same `key`, a new row for the same defect under another `key`, or error-tracker events on the matching issue after the close. Each one gets `Expected` = the `OPEN` row to append. **Done when:** `Recurrences` ranks the open rows and lists the regressions, or says `none`.
- [ ] **Step 6 — Classes:** (a) Known errors carry a workaround. For every `TRIAGED` or CONFIRMED row that agents keep hitting (2 or more recurrences in Step 5, or a parked row whose blocker is not in the winning row), check that `docs/knowledge.jsonl` has an `ACTIVE` row with the workaround. A missing one is a finding, and `Expected` = the knowledge row to append. (b) Count the open and recently closed rows by `category`, package and root-cause class. The top recurring class this run is a gate candidate; name it for `bkit-audit-gates`. **Done when:** `Classes` holds the workaround gaps, the counts and the gate candidate, or says `none`.
- [ ] **Step 7 — Classify:** Give every row, as Step 4 left it, one verdict. This run does not append rows or open issues. A security row goes to `bkit-audit-security`, with only its key, verdict and severity in this report. A flaky test's diagnosis goes to `bkit-audit-flakes`. Older flake diagnoses may sit on tracker issues that predate that audit, so search those too.

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

**Done when:** every verified row has one verdict, and the security rows in Findings carry no `file:line` and no exploit detail.

- [ ] **Step 8 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per practice (known-error records, proactive problem review, postmortem action items, triage resolution states, age targets), marked checked (with the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 9 — Anything Else:** (a) List everything changed since the previous report's commit that touches failures (the schema and writers in `.bkit/jsonl.md`, the steps and agents that append rows, the CI gate on open `CRITICAL` failures, the flake register `bkit-audit-flakes`, and error-tracker projects and alert rules), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior problem manager would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` sweeps, vendor status incidents), and note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Read-only:** no ledger line, code or config changed.
- [ ] **Rows proposed only:** every close, regression and knowledge row is in `Expected` only.
- [ ] **Security:** security rows carry key, verdict and severity only.
- [ ] **No exploit detail:** security rows carry no exploit detail and no `file:line`.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A row records data loss, a security hole, or a broken workflow with no workaround, and is still open. That includes a row whose word looks finished. |
| `HIGH` | A row records real damage or a blocked path, with a workaround. A fix landed with no regression test. An incident's test or monitor did not land. A user-affecting outage has no preventing action. |
| `MEDIUM` | A row is mis-framed or understated. A defect recurred or regressed. A known error has no workaround on record. An age target is breached. A hypothesis is still open. |
| `LOW` | A key is duplicated. A path drifted without changing the reach. A row is missing `severity`. |

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the age-target breach count, and rows verified / rows open.
- [ ] **Series:** the report shows open count and the recurrence ranking beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
