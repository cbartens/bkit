<!-- bkit:anchor
baseSha: 67a6e07e11f1880dd894ea97db8cc0d717f56edd
baseRef: dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->
<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate filled this report at `docs/audits/202611/failures.md`. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Failures Triage

> [!CAUTION]
> **Purpose:** A verdict on every open failure: reachable, already fixed, mis-framed, unconfirmed, or a repeat of a known defect.
>
> **Rules:**
>
> - NEVER append or edit a ledger line.
> - Write close, correction, regression, triage and knowledge rows in `Expected` only.
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

- Problem management and the known-error database (e.g., ITIL 4; record the edition). The deferred and known-error review it describes (e.g., ITIL-aligned known-error monitoring).
- Postmortem action items (e.g., Google SRE Workbook, Postmortem Culture).
- Bug triage and resolution states, including an incomplete state for an unanswered reproduction request (e.g., Mozilla defect severity guide, Bugzilla triage).
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

- [x] **Permissions:** every blocked call is recorded. Cheap read-only probes ran first: `gh run list --limit 1` (gh 2.102.0, returned run 41363058909), `mcp__github__search_issues` on `cbartens/bkit` (returned 3 items), Serena `get_symbols_overview` on `.bkit/core/engine/ledgers/telemetry.ts`, `WebFetch` of `sre.google`, `wiki.mozilla.org` and `peoplecert.org`, `bkit branches anchor-stamp` (exit 0). No call was blocked or denied.
- [x] **Ledger:** Steps 3-7 — `docs/failures.jsonl` and `.bkit/jsonl.md`. Read at `HEAD` with `git show HEAD:docs/failures.jsonl` (139 lines, 120 keys, all `kind: "failure"`, all numeric `ts`); `.bkit/jsonl.md` § Write Idiom, § Ledgers & Writers, § Per-Kind Fields, § Severity, § Categories, § Updating a Row, § Compaction read.
- [x] **Git History:** Steps 2, 5 — `git rev-parse --is-shallow-repository` printed `false`, so history is complete. git 2.56.0. No previous failures report exists (`git log --all --name-only -- docs/audits` has no `failures` path), so Step 2 is baseline; fix commits were read with `git log -S` / `git log -L`.
- [x] **Web:** Step 8 — anchor standards fetched on 2026-11-02 with `WebFetch` and `WebSearch`: Google SRE Workbook, Postmortem Culture (`Copyright © 2018 Google, Inc.`); Mozilla BMO `BugStatuses` (`This page was last edited on 22 August 2024, at 11:13`); PeopleCert ITIL page (names `ITIL (Version 5)`, `The new ITIL is here!`, no date). The ITIL problem-management practice text itself was not readable from an official page (gap in `Not Checked`).

#### Conditional

- [x] **Language Server:** TypeScript repo. Serena `find_symbol` (with body) on `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts` and `get_symbols_overview` on `telemetry.ts` worked. Everything else (workflow markdown, YAML, shell hooks, ledgers) was read with `git grep` / `git show HEAD:` text search, as Step 4's table prescribes.
- [x] **Error Tracker:** Not applicable. bkit is a CLI package with no production or preview event stream: the `context-fetch` blocks below `bkit:end` in `.agents/context.md` are `github context=ci`, `github context=diff` and `tavily context=web`, with `context-fetch:none e2e`; none reads error events. Fallback: code only; event counts are `Not Checked`.
- [x] **Tracker:** GitHub issues on `cbartens/bkit`. `mcp__github__search_issues` found #719, #345 and others; issue states by number were read with `gh issue view {N} --json state,title` because the MCP surface here has search only (gap in `Process Improvements`).
- [x] **CI Config:** `.github/workflows/bkit-ci.yml`, `bkit-trivy.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `release.yml` exist. `git grep -i 'failures.jsonl' HEAD -- .github/` hits only the issue template and SVG assets, and the only `CRITICAL` hits in workflows are the Trivy / dependency-audit gates (`bkit-trivy.yml:66`, `bkit-ci.yml:506`). No gate on open `CRITICAL` failures exists (recorded in `Checked`).

### 🔒 Gate 1: Prerequisites Check

- [x] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [x] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [x] **Step 2 — Closures:** Re-verify at `HEAD` every FIXED and MIS-FRAMED row from the previous report. Each one that no longer holds is a finding, with what changed. **Done when:** `Closures` holds every row, each failure and the failure rate, or the run is marked baseline.
- [x] **Step 3 — Fold:** Fold the ledger last-row-wins per `key`, not per line. The ledger is append-only (`.gitattributes` `merge=union`), so editing a line leaves the stale copy beside its replacement. The highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row).
  - **If** a `key`'s `ts` is not a number → the last line in the file is the latest.
  - Open means every winning row with `status != "CLOSED"`, including `TRIAGED` (diagnosed is not fixed), `RESOLVED`, `FIXED`, `SUPERSEDED`, and rows with no `status`. A word that looks finished does not make a row done.
  - **If** a `RESOLVED` or `FIXED` row is really done → put a `CLOSED` row in `Expected`, with the `references` that closed it.
  - Do not skip a row because its word looks finished.
  - Order the rows `CRITICAL`, then `HIGH`, then oldest `ts`.
  - Compare `severity` case-insensitively.
  - **If** a row has no `severity` → assign one with its verdict.
  - Measure age from the row's first `ts`, and list every `CRITICAL` older than 7 days and every `HIGH` older than 30 days.
  - Report whether a CI check is installed that goes red while any `CRITICAL` row has `status != "CLOSED"`. A green check beside such a row is a finding, because the gate is not reading the ledger.
  - **If** the check is absent → record that in `Checked`.
  - A large open set may get a partial pass, so record rows verified / rows open.
  - **If** a winning row has a future `ts` that would outrank a close → name its `key`.
  - Do not invent a later `ts`.

  **Done when:** `Trend` holds the open counts, the age-target breaches, the gate result, and verified / open, or holds `N/A`, then **STOP**.

- [x] **Step 4 — Source:** Give no verdict before this step. Under-reporting biases the run toward closing a live bug.

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

Each incident needs a written postmortem, with at least one action that prevents or detects a repeat, an owner, and a tracking issue at top priority. A user-affecting outage needs at least one top-priority bug. A missing postmortem, or a postmortem with only mitigation items, is a finding, and `Expected` = the issue to open. **Done when:** every row verified this pass has its evidence and the tool on its finding. `Incidents` lists the follow-ups and postmortem gaps, or says `none`. Unverified rows stay counted in `Trend`, and are not passed.

- [x] **Step 5 — Recurrences:** A same-`key` append that records the defect being seen again is a recurrence (`.bkit/jsonl.md` § Updating a Row). Leave out appends that only change `status`. For `category: "testing"`, the flake count is the winning row's `updates`, status-only appends included. Rank the open rows by count. Then find regressions. For each row `CLOSED` since the previous report, look for a later row with the same `key`, a new row for the same defect under another `key`, or error-tracker events on the matching issue after the close. Each one gets `Expected` = the `OPEN` row to append. **Done when:** `Recurrences` ranks the open rows and lists the regressions, or says `none`.
- [x] **Step 6 — Classes:** (a) Known errors carry a workaround. For every `TRIAGED` or CONFIRMED row that agents keep hitting (2 or more recurrences in Step 5, or a parked row whose blocker is not in the winning row), check that `docs/knowledge.jsonl` has an `ACTIVE` row with the workaround. A missing one is a finding, and `Expected` = the knowledge row to append. (b) Count the open and recently closed rows by `category`, package and root-cause class. The top recurring class this run is a gate candidate; name it for `bkit-audit-gates`. **Done when:** `Classes` holds the workaround gaps, the counts and the gate candidate, or says `none`.
- [x] **Step 7 — Classify:** Give every row, as Step 4 left it, one verdict. This run does not append rows or open issues. A security row goes to `bkit-audit-security`, with only its key, verdict and severity in this report. A flaky test's diagnosis goes to `bkit-audit-flakes`. Older flake diagnoses may sit on tracker issues that predate that audit, so search those too.

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

- [x] **Step 8 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per practice (known-error records, proactive problem review, postmortem action items, triage resolution states, age targets), marked checked (with the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [x] **Step 9 — Anything Else:** (a) List everything changed since the previous report's commit that touches failures (the schema and writers in `.bkit/jsonl.md`, the steps and agents that append rows, the CI gate on open `CRITICAL` failures, the flake register `bkit-audit-flakes`, and error-tracker projects and alert rules), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior problem manager would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` sweeps, vendor status incidents), and note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [x] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [x] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [x] **Read-only:** no ledger line, code or config changed.
- [x] **Rows proposed only:** every close, correction, regression, triage and knowledge row is in `Expected` only.
- [x] **Security:** security rows carry key, verdict and severity only. No open row is a security row (fold: no open `category: "security"` row, and no open row describes an auth, secrets or data-exposure hole).
- [x] **No exploit detail:** no security row carries exploit detail.
- [x] **No location:** no security row carries a `file:line`.
- [x] **Gate 2 — Verified:** every item above holds.

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
| failures-1 | HIGH | FIXED, no regression test → TRIAGED | `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`; `.github/workflows/bkit-ci.yml:546-559` | Prevention landed: `175807e91` and `81aecbf14` (fix(444), 2026-10-27/28) make `Check Capability Register` run on every event and check the PR's test merge (`git log -L 540,560:.github/workflows/bkit-ci.yml`). The red is cleared: dev run 41363058876 at `79b96cfcb` has `Check Capability Register success` (`gh run view 41363058876 --json jobs`). No test pins the step to `pull_request` runs: `git grep 'Check Capability Register' HEAD -- '*.test.ts'` hits only `runs.test.ts` (failed-step parsing) and a pre-push comment; `git grep -i "it\(.*(graphify\|register)"` hits only `templates-content.test.ts:729` (starter rules). Tool: git, gh. | Append a `TRIAGED` row, same `key`, `severity: "HIGH"`, `references` += `175807e91`, `81aecbf14`, `#444`; follow-up = a test that fails when `Check Capability Register` in `.github/workflows/bkit-ci.yml` and `.bkit/templates/.github/workflows/bkit-ci.yml` gains an event filter that skips `pull_request`. Issue to open: Suggested Issues #1. |
| failures-2 | HIGH | TRACKED | `bkit-cloud-opencode-job-never-installs-repo-deps`; `.bkit/templates/.github/workflows/bkit-cloud.yml:546-597` | Read end to end: the opencode job is checkout → `Configure git user` → `Install opencode` (`npm install -g @opencode/cli@2.1.2`) → `opencode run "/bkit-auto ..."`, with no `setup-node` / `pnpm install`; `/bkit-auto` calls `node_modules/.bin/bkit` first (`.bkit/core/workflows/bkit-auto.md:87`). No opencode plugin installs deps (`.bkit/core/.opencode/plugin/` holds gateguard, readguard, rules only). #719 ("Cloud variants: add --auto=codex and allow any tracker", https://github.com/cbartens/bkit/issues/719, OPEN) carries the fix: `docs/plans/202610/719-cloud-variants-add-plan.md:426` adds `setup-node` + `pnpm/action-setup` + `pnpm install` to the router. The row's `rootCause` ("unlike the claude job's environment") is understated: the claude job (`bkit-cloud.yml:471-541`) has no install step either and relies on `bkit-cloud-bootstrap.sh`, which exits 0 unless `CLAUDE_CODE_REMOTE=true` (`.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh:27-28`). The winning row has no `status`. Tool: git grep, MCP search_issues, gh. | Append a same-`key` row with `status: "TRIAGED"`, `severity: "HIGH"`, `references` += `#719`, `docs/plans/202610/719-cloud-variants-add-plan.md`, and a `rootCause` that drops the claude-job contrast and names the open question whether the claude job's runner sets `CLAUDE_CODE_REMOTE`. Probe for that question: a `workflow_dispatch` of the claude job that prints `command -v bkit` before dispatch. |
| failures-3 | MEDIUM | CONFIRMED | `github-mcp-search-issues-silently-returns-zero-private-repo`; `.bkit/core/workflows/bkit-design.md:319` | The workflow hole is live: `bkit-design.md:319` writes `Search unavailable.` only "on call error / timeout", so a silent `total_count: 0` is recorded as no related issues. The row was triaged to #461 ("list_issues off-spec in every phase; fields never return", CLOSED per `gh issue view 461`), so no open issue carries it. The MCP behaviour itself cannot be re-run here: `gh repo view cbartens/bkit --json visibility` prints `PUBLIC`, and `mcp__github__search_issues` returned 14 hits this run. Workaround on record: knowledge row `380-list-issues-not-search-issues-zero-is-inconclusive` (ACTIVE). Tool: git grep, gh, MCP. | Issue to open: Suggested Issues #3. Failing test first: a workflow-audit case asserting that the related-issues step treats an empty hit list as inconclusive (control query or gh fallback) rather than as `None.`. Append a same-`key` row with `references` → the new issue. |
| failures-4 | MEDIUM | MIS-FRAMED | `telemetry-validate-does-not-enforce-ts-mint-or-duplicate-line-invariants`; `.bkit/core/engine/commands/telemetry.ts:17-26` | `bkit telemetry validate` no longer exists: `telemetry.ts` accepts only the `summary` sub-verb. The ts-mint invariant is enforced elsewhere: `bkit ledgers append` mints `ts` (`dfb1b5e8f`, feat(680)), and `.bkit/core/engine/audits/repo/ledger-integrity.test.ts:260` (no future `ts`) and `:275` (no whole-second `ts` since `1787788800000`, added in `5e527e4a6`) gate the live ledgers. Byte-identical duplicate lines: 0 in each of the five keyed ledgers at `HEAD` (`git show HEAD:{f} \| sort \| uniq -d \| wc -l`), and `fold` / compaction count same-`ts` rows once (`.bkit/jsonl.md` § Compaction). Tool: git grep, git log -S, jq. | Append a `CLOSED` row, same `key`, close reason "the named command was removed; ts minting is enforced at append and by the ledger-integrity gate; same-ts duplicates are folded", `references` += `dfb1b5e8f`, `5e527e4a6`, `.bkit/core/engine/audits/repo/ledger-integrity.test.ts:260`, `:275`. |
| failures-5 | MEDIUM | MIS-FRAMED | `ship-cloud-failure-path-after-merge-has-no-publish-channel`; `.bkit/core/engine/commands/workflow/workflows.ts:744` | The row's mechanism is gone: the Failure Path no longer pushes `git branch --show-current`; step 5 runs `workflows handover --flush` (`.bkit/core/workflows/bkit-ship.md:94-97`), which lands the FAILED record on dev from a throwaway `origin/dev` checkout (`0df5dda6c`, feat(639)). The defect the title names is still reachable: when dev refuses the push, `landFailedRecord` keeps the record in the local book and exits 10, with no `ship-close/{fid}` PR fallback (`workflows.test.ts:1633-1645` pins `pushed: false`, `ref: null`, "ship FAILED record kept in {wt}"), while Close Workflow's `shipClose` does open that PR (`workflows.ts:1435-1444`). On an ephemeral cloud runner the kept record is lost. #452 (CLOSED) no longer covers it. Tool: git grep, git show. | Append a corrected row, same `key`, `severity: "MEDIUM"`: `description` = "a dev-refused `handover --flush` keeps the ship FAILED record only in the local book (exit 10); unlike `shipClose`, it opens no `ship-close/{fid}` PR, so a cloud runner loses it", `references` → `workflows.ts:744`, `workflows.test.ts:1633`, `0df5dda6c`. Issue to open: Suggested Issues #4. |
| failures-6 | MEDIUM | CONFIRMED | `steps-placeholder-gate-false-positive-on-derived-issue-dump`; `.bkit/core/engine/commands/workflow/steps.ts:161`, `:235` | Path read end to end: `steps finish` adds every existing `--optional-artifact` to `artifacts` (`steps.ts:928-933`), passes them to `gateChecks` (`:1005-1012`), which runs `placeholderLines` on each (`:655-667`) with `PLACEHOLDER = /^(?:\[?PENDING\]?\|.*:\s*\[?PENDING\]?\.?)$/` (`:161`). `bkit-plan.md:298` passes `related-issues.md`, a dump of other issues' bodies, as `--optional-artifact`. The row cites `steps.ts:121`; the function is now at `:235`. No issue carries it (ISSUE-99 in `references` is the friction-triage parent). Tool: git show, git grep. | Issue to open: Suggested Issues #5. Failing test first: `steps finish` with an optional artifact whose body quotes a whole-line `PENDING` passes. Append a same-`key` row with `references` `steps.ts:235` and the new issue. |
| failures-7 | MEDIUM | MIS-FRAMED (understated) | Eight load-timeout flake rows: `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite`, `gateguard-opencode-patch-tests-flaky-under-full-audits-run`, `runs-wait-cli-found-flaky-under-full-gate`, `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate`, `instructions-corpus-store-timeout-under-full-gate`, `disk-prune-wait-test-flaky-under-load`, `json-parse-owner-audit-timeout-under-load` | Each row records one test that fails only under the full parallel gate and passes alone; every cited test title still exists at `HEAD` (`git grep -c -F` = 1 each). They share one root cause, stated in the closed sibling `resolve-push-base-uses-last-green-run-timeout-under-full-gate`: the load factor is `loadAverage / cores` floored at 1 (`vitest.timeout-budget.ts:28-40`), so a loaded 10-core box keeps the idle budget. Load-scaled cases still time out (`instructions.test.ts:55` `CORPUS_CASE`); fixed budgets remain (`ci-scripts.test.ts:260` `timeout: 30_000`). New rows keep landing (10-14 to 11-02). Workaround on record: knowledge row `spawn-heavy-unit-suite-needs-its-own-budget-under-load` (ACTIVE). Tool: jq fold, git grep. | Diagnosis → `bkit-audit-flakes`. Append one corrected row per key naming the shared class in `rootCause` ("full-gate load exceeds a budget that the load factor does not raise"), with `references` += the class's canonical issue. Issue to open: Suggested Issues #6. Named for `bkit-audit-gates` as the gate candidate (see `Classes`). |
| failures-8 | MEDIUM | FIXED | `wording-test-setup-tips-lines-not-in-wording-file`; `.bkit/core/engine/tools/instructions.test.ts:213` | `33c7aae18` (feat(663), 2026-10-25) deleted `.bkit/wording.md` and `wording.ts`, renamed `wording.test.ts` → `instructions.test.ts`, and removed the setup-tips sentences: `git grep -l -i 'tips' HEAD -- '.bkit/core/workflows/*.md'` returns nothing (control: `git grep -c 'pnpm install' HEAD -- .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` = 5). Regression test: `instructions.test.ts:213` "has no findings" over the shared-instruction corpus. Tool: git log --diff-filter=D, git grep. | Append a `CLOSED` row, same `key`, `references` += `33c7aae18`, `.bkit/core/engine/tools/instructions.test.ts:213`. |
| failures-9 | MEDIUM | CONFIRMED (understated) | `audit-dead-code-readme-pngs-unread`; `scripts/readme/readme-art.mjs:2615-2621` | The generator writes a `.png` beside every `.svg` it renders (`readme-art.mjs:2615-2621`). `git grep -l -I -E 'bkit-[a-z-]+-(dark\|light)\.png' HEAD` hits only `docs/audits/202610/audit-improvements-20261031T034130Z.md`; `README.md` names the `.svg` twins. The set has grown: 30 themed PNGs, 4605 KB (`git ls-tree -l HEAD .github/assets/`), against the row's 16 / 2860 KB. Only the four `bkit-social*.png` have a stated consumer (`readme-art.mjs:411`). No issue carries it. Tool: git grep, git ls-tree. | Append a corrected row, same `key`: 30 themed PNGs, 4605 KB. Issue to open: Suggested Issues #7 (the owner decides whether the PNGs have a consumer; why they exist is not written down). |
| failures-10 | MEDIUM | CONFIRMED | `precommit-check-dist-blocks-parallel-agents`; `package.json:87`, `.husky/pre-commit:18-22` | `bkit:check:dist` = `rm -rf dist && tsc && ... git diff --exit-code dist/` (`package.json:87`): it builds the whole working tree and compares it with the index, and `.husky/pre-commit:18-22` runs it whenever a non-test engine `.ts` is staged. Another agent's unstaged engine edit therefore refuses a commit of only the committer's files. No issue carries it (#473, "Duplication audit", OPEN, is a standing audit parent, not a fix). Tool: git show, gh. | Issue to open: Suggested Issues #8. Failing test first: with an unstaged engine edit beside a staged one, the dist check passes for the staged tree. |
| failures-11 | MEDIUM | FIXED | `ship-step8-skip-ci-bookkeeping-push-refused-by-pre-push-guard`; `.husky/pre-push:164-197` | `163e09176` (feat(699), 2026-11-01) lets a `[skip ci]` push through when every file changed since the remote head is on ship's `--scope=pr` allow-list (`bkit ci bookkeeping-push`, `.husky/pre-push:183-186`). Regression test: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:362` "[skip ci] bookkeeping only on top of the remote head, open PR → allowed, gates run". The winning row has no `status`. Tool: git log -L, git grep. | Append a `CLOSED` row, same `key`, `references` += `163e09176`, `husky-pre-push.integration.test.ts:362`. |
| failures-12 | MEDIUM | CONFIRMED | `engine-journal-misattributes-calls-to-stale-run`; `.bkit/core/engine/commands/lib.ts:401-454` | Serena `find_symbol resolveActiveRun` (body): a `--fid` with no IN_PROGRESS run falls through to the checkout scan, which trusts each local `status.jsonl` and returns the single IN_PROGRESS one. Reach seen this run: `HEAD` `67a6e07e1` commits five `engine-call` rows into `docs/plans/202610/logs/715-retire-lite-workflows/status.jsonl` under `workflow: "ship"`, including `worktrees setup` (23:43:20Z, 23:44:28Z) and `worktrees remove` (23:58:59Z), the calls the row says belong to feature 802. #802 ("Engine logs a human-confirm friction row on every owner pause", OPEN) does not carry this fix. Distinct from the closed `engine-journal-dirties-status-after-every-commit` (different root cause: hook-launched calls). Tool: Serena, git show. | Issue to open: Suggested Issues #9. Failing test first: a call with `--fid=B` while a stale local copy of feature A's log folds IN_PROGRESS journals nothing into A. |
| failures-13 | LOW | CONFIRMED | `block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines`; `.bkit/core/engine/audits/workflows/block-locality-audit.test.ts:182` | `maskNonExpansions` (`:161-184`) still blanks `'[^']*'` spans with no `#` comment handling (`:182`); the row cites `:181`. Tool: git show. | Append a same-`key` row with the locator `:182`. Fix batched in Suggested Issues #10. |
| failures-14 | LOW | DUPLICATE | `audit-testing-shipped-standalone-tests-without-lane`; `.bkit/core/engine/audits/templates/ci-scripts.test.ts:255-266` | Same defect as `audit-dead-code-shipped-test-mjs-never-run` (CLOSED, `references` `589`, `a5361e68`, `testing-7`). `a5361e680` (fix(589)) runs every `.bkit/templates/scripts/**/*.test.mjs` from Vitest (`ci-scripts.test.ts:255-266`), and the repo copies are pinned byte-identical (`dogfood-templates.test.ts:333-353`). The row's ledger severity is `MEDIUM`; the finding is `LOW` per the severity table (duplicated key). Tool: jq fold, git grep. | Canonical key `audit-dead-code-shipped-test-mjs-never-run`. Append a `CLOSED` row for this key, `references` += `audit-dead-code-shipped-test-mjs-never-run`, `a5361e680`. |
| failures-15 | LOW | CONFIRMED | `plan-update-stub-keeps-prior-verdict-header`; `.bkit/core/prompts/bkit-plan-update.md:78`, `.bkit/core/prompts/bkit-design-update.md:57` | Both stub calls omit `--strip-header` (`bkit-design-organise.md:55` passes it), and `steps stub` strips only when the flag is set (`steps.ts:1742-1745`). The row cites `bkit-plan-update.md:42` and `bkit-design-update.md:43`. Tool: git grep. | Append a same-`key` row with the locators `:78` / `:57`. Fix batched in Suggested Issues #10. |
| failures-16 | LOW | CONFIRMED | `.bkit/core/engine/audits/repo/release-workflow.integration.test.ts published tarball excludes test sources (pnpm pack)`; `release-workflow.integration.test.ts:32` | The pack call still discards stderr (`stdio: ["ignore", "pipe", "ignore"]`, `:32`), so a Corepack registry failure surfaces only as `Command failed`. Intermittent on the registry, so diagnosis belongs to `bkit-audit-flakes`. Tool: git grep. | Diagnosis → `bkit-audit-flakes`. Fix batched in Suggested Issues #10. |
| failures-17 | LOW | FIXED | `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate`; `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:26`, `:134` | `2790b4181` (#708) added `SPAWN_CASE = { timeout: tierTimeouts(true).testTimeout }` on the `exit 0 always` suite (`:134`), which contains the cited case (`:217`, nested `local mode` suite). The sibling `resolve-push-base-uses-last-green-run-timeout-under-full-gate` was closed on the same change and lists this key in its `references`, but this row stayed open. Tool: git log -S, git show. | Append a `CLOSED` row, same `key`, `references` += `2790b4181`, `resolve-push-base.test.ts:134`. For `category: "testing"`, confirm with `bkit-audit-flakes` that no later failure was seen. |
| failures-18 | LOW | FIXED | `template-smoke-stub-listens-on-missing-ci-workflow`; `.bkit/templates/.github/workflows/bkit-health.yml:18` | `8f857fd5e` (feat(748), 2026-10-30) retired the smoke stub (`git grep -i smoke HEAD -- .bkit/templates/.github/workflows/bkit-ci.yml` returns nothing) and ships `bkit-health.yml`, which listens on `workflows: [bkit-ci]` (`:18`). Regression test: `.bkit/core/engine/audits/templates/templates-content.test.ts:585` "runs after every finished bkit-ci run on the default branch, whatever its conclusion". #748 is still OPEN. Tool: git log -S, git grep, gh. | Append a `CLOSED` row, same `key`, `references` += `8f857fd5e`, `templates-content.test.ts:585`. |

**If** the run finds nothing → write one row: `None`.

## Report

### Summary

- Audited commit: `67a6e07e1` on `dev` (the `bkit:anchor` `baseSha`). Baseline run: no earlier failures report exists.
- Findings: CRITICAL 0 · HIGH 2 · MEDIUM 10 · LOW 6 (18 findings over 25 open rows; failures-7 covers 8 rows).
- Age-target breaches: 0. No open `CRITICAL` row; the oldest open `HIGH` row is 6 days old (target 30).
- Coverage: rows verified / rows open = 25 / 25.
- Verdicts by row: FIXED 5 (failures-1 lacks its regression test, so it is TRIAGED), MIS-FRAMED 10 (2 moved rows plus the 8 load-timeout rows of failures-7), CONFIRMED 8, TRACKED 1, DUPLICATE 1. In plain terms: 6 rows (failures-4, -8, -11, -14, -17, -18) describe bugs the code no longer has, and can be closed by appending rows; 1 more (failures-1) is fixed but has no test guarding it.
- No CI check goes red on an open `CRITICAL` failure; with 0 open `CRITICAL` rows there is no green-beside-critical finding this run.

### Previous Run

Baseline. `git log --all --name-only --format= -- docs/audits` lists no `failures` report, and `docs/audits/202610/` holds none. Closure rate, failure rate and the oldest-open age carried from a prior run: not applicable.

### Closures

Baseline: no previous report, so there are no FIXED or MIS-FRAMED rows to re-verify. Failure rate: not applicable.

### Trend

<!-- prettier-ignore -->
| Measure | This run (baseline) |
| --- | --- |
| Ledger lines / keys at `HEAD` | 139 / 120 |
| Open rows (winning `status != "CLOSED"`) | 25: `OPEN` 22, `TRIAGED` 1, no `status` 2 |
| Open by severity | CRITICAL 0 · HIGH 2 · MEDIUM 10 · LOW 13 |
| Closed in the last 30 days | 83 |
| `CRITICAL` older than 7 days | 0 |
| `HIGH` older than 30 days | 0 (`capability-register-drift-shipped-by-pr-708-reds-dev-capstone` 6 days, `bkit-cloud-opencode-job-never-installs-repo-deps` 3 days) |
| Oldest open row | `github-mcp-search-issues-silently-returns-zero-private-repo`, `firstTs` 2026-07-14, 110 days (`MEDIUM`, no age target) |
| Gate on open `CRITICAL` failures | Absent (see `Checked`) |
| Future `ts` | None (`ts > now` count 0) |
| Whole-second `ts` | 4 winning rows, all `CLOSED` and all before the `1787788800000` cutoff in `ledger-integrity.test.ts:273` |
| Rows verified / rows open | 25 / 25 |

Fold: `git show HEAD:docs/failures.jsonl \| jq -s 'to_entries \| map(.value + {line: (.key+1)}) \| group_by(.key) \| map(sort_by(.ts, .line)[-1])'`, open = `status != "CLOSED"`, ordered `CRITICAL`, `HIGH`, then oldest `firstTs` (jq 1.8.2).

### Incidents

- No production or preview incident: bkit has no production service and no error tracker (see Pre-Flight `Error Tracker`).
- One dev-branch CI incident row: `capability-register-drift-shipped-by-pr-708-reds-dev-capstone` (post-merge capstone red at squash commit `2790b418`, run 40416374038).
  - Code follow-ups: the red is cleared (dev run 41363058876, `Check Capability Register success`), and the preventing action landed (`175807e91`, `81aecbf14`: the register gate runs on pull requests).
  - Postmortem: written as knowledge rows `capability-register-drift-reached-dev-through-warn-only-pre-push` and `capability-register-pr-gate-checks-the-merge-ref` (both ACTIVE), with a preventing action and tracking issue #444 ("Serena Graphify code graph templates", CLOSED).
  - Gap: no regression test pins the gate to `pull_request` runs → failures-1 (`HIGH`), Suggested Issues #1.
- Owner and priority on the postmortem action: the ledger and the knowledge rows carry no owner or priority field, so this was not checkable (see `Standards Coverage`).

### Recurrences

Same-`key` appends that re-observe the defect (status-only appends excluded). For `category: "testing"`, the count is the winning row's `updates`.

<!-- prettier-ignore -->
| Rank | Key | Count | Basis |
| --- | --- | --- | --- |
| 1 | `block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines` | 4 appends after the first; 1 is a re-observation (testing audit, `ts` 1792238896392), 3 are locator moves | `git log -p -- docs/failures.jsonl` |
| 2 | `runs-test-ci-refuses-not-open-pr-timeout-under-full-suite` | `updates` 2 | flake count |
| 2 | `gateguard-opencode-patch-tests-flaky-under-full-audits-run` | `updates` 2 | flake count |
| 2 | `runs-wait-cli-found-flaky-under-full-gate` | `updates` 2 | flake count |
| 2 | `instructions-corpus-store-timeout-under-full-gate` | `updates` 2 (3 lines, 2 share one `ts`) | flake count |
| — | The other 20 open rows | 0 re-observations (`github-mcp-search-issues-...` has 3 later appends, all `OPEN`→`TRIAGED` / re-triage) | `git log -p` |

Regressions (baseline: checked against rows `CLOSED` in the last 30 days):

- No `CLOSED` key has a later open row with the same `key` (the fold's winners are the latest rows).
- One duplicate that outlived its close: `audit-testing-shipped-standalone-tests-without-lane` is the same defect as the closed `audit-dead-code-shipped-test-mjs-never-run` → failures-14. It is a missed close, not a regression: the fix still holds.
- One sibling missed by a close: `resolve-push-base-uses-last-green-run-timeout-under-full-gate` was closed on `2790b4181` and lists `resolve-push-base-falls-back-gh-fails-timeout-under-full-gate` in its `references`, but that row stayed open → failures-17.
- `engine-journal-dirties-status-after-every-commit` (closed 2026-10-31) and the open `engine-journal-misattributes-calls-to-stale-run` share a symptom, a dirtied tracked `status.jsonl`. They have different root causes, hook-launched calls against a stale-run scan, so this is not a regression.
- Error-tracker events after a close: not applicable (no error tracker).

### Classes

(a) Known-error workarounds. One TRIAGED or CONFIRMED row is parked: `github-mcp-search-issues-...`, whose triage issue #461 is closed. It has its workaround in knowledge row `380-list-issues-not-search-issues-zero-is-inconclusive` (ACTIVE). The load-timeout class has `spawn-heavy-unit-suite-needs-its-own-budget-under-load` (ACTIVE). No open row has 2 or more re-observations. Workaround gaps: none.

(b) Counts by `category` (open / closed in the last 30 days):

<!-- prettier-ignore -->
| Category | Open | Closed (30 days) |
| --- | --- | --- |
| testing | 13 | 13 |
| tooling | 4 | 12 |
| agentic | 2 | 5 |
| ci | 1 | 0 |
| docs | 1 | 0 |
| observability | 1 | 1 |
| other | 1 | 0 |
| infra | 0 | 9 |
| security | 0 | 16 |
| architecture | 0 | 7 |
| correctness | 0 | 7 |
| no `category` | 2 | 13 |

Root-cause classes among open rows:

<!-- prettier-ignore -->
| Class | Open rows | Recently closed |
| --- | --- | --- |
| Test budget exceeded under full-gate load | 9 (8 in failures-7, plus failures-17) | 1 (`resolve-push-base-uses-last-green-run-timeout-under-full-gate`) |
| Hook or CI gate disagrees with a workflow or with parallel agents | 3 (failures-1, -10, -11) | 2 (`worktree-copy-gitignored-file-breaks-commit`, `main-checkout-left-core-bare-true`) |
| Row text outlived a refactor (command, file or mechanism removed) | 3 (failures-4, -5, -8) | — |
| Workflow trusts an empty or local signal | 2 (failures-3, -12) | 1 (`engine-journal-dirties-status-after-every-commit`) |

By package: the repo is one package. 18 of the 25 open rows point into `.bkit/core/engine/**`, `.bkit/core/workflows/**` or `.bkit/core/prompts/**`. The other 7 point at `.bkit/templates/**` (3), `.husky/` (2, one of them also at `package.json`), `.github/workflows/` (1) and `scripts/readme/` (1).

Gate candidate for `bkit-audit-gates`: **test budget exceeded under full-gate load**. A gate could run the unit and audit tiers once under deliberate CPU contention, or a lint could require that a test which spawns a process or walks the whole corpus carries a load-scaled budget.

### Checked

- Ledger fold at `HEAD` `67a6e07e1`: all 139 lines and 120 keys, last-row-wins by numeric `ts`, with the line number breaking ties (jq 1.8.2).
- All 25 open rows were verified against source at `HEAD` with `git show HEAD:` / `git grep ... HEAD`, plus Serena for `resolveActiveRun`.
- Gate on open `CRITICAL` failures: **absent**. No workflow under `.github/workflows/` reads `docs/failures.jsonl` (`git grep -l -i 'failures.jsonl' HEAD -- .github/`), and `.bkit/core/engine/audits/repo/ledger-integrity.test.ts` checks parse, envelope, kind, shell substitution, future `ts` and whole-second `ts`, but not severity or status.
- Every path-shaped `references` entry on open rows exists at `HEAD`: 22 paths checked with `git cat-file -e`, and the control `.bkit/wording.md` was reported missing as expected.
- Issue states of referenced issues were read with `gh issue view`: #461, #380, #452, #700, #444, #341 CLOSED; #504, #99, #715, #802, #719, #748, #473, #345 OPEN.
- Knowledge workarounds: `docs/knowledge.jsonl` at `HEAD` folded, ACTIVE rows filtered with a keyword pattern per open class.
- Latest dev CI: `gh run list --workflow bkit-ci.yml --branch dev --limit 5` (all `success`) and `gh run view 41363058876 --json jobs` (`Check Capability Register success`).

### Not Checked

- **Shared checkout:** `git status --short` at the start showed `M docs/plans/202610/logs/715-retire-lite-workflows/status.jsonl`, changed by another writer. Another writer then committed it as `67a6e07e1` mid-run, before the anchor stamp. Every source was audited at `HEAD` `67a6e07e1` only. At the report gate, `git status --short` shows only this run's `docs/audits/202611/`.
- **Error tracker:** not applicable (no production or preview event stream). Event counts after fix commits and the reach of CONFIRMED rows by event count are not checked.
- **ITIL problem-management text:** PeopleCert's page names `ITIL (Version 5)` but the practice guide's known-error wording was not read from an official source; only secondary sources were seen via `WebSearch`. The Axelos page returned no edition. The "ITIL-aligned known-error monitoring" source was not fetched separately.
- **Live reproductions:** none were run. failures-3: the private-repo MCP behaviour cannot be re-run because `cbartens/bkit` is `PUBLIC`. failures-2: whether `anthropics/claude-code-action` sets `CLAUDE_CODE_REMOTE`, so that the claude job installs deps, is not verified. failures-5: no cloud ship Failure Path run. failures-12: no fresh repro beyond the rows in `67a6e07e1`.
- **Flake diagnosis:** the 10 testing rows in failures-7, -16 and -17 were not re-run under load; their diagnosis belongs to `bkit-audit-flakes`. failures-17 assumes Vitest's suite-level `timeout` option reaches nested suites; the suite was not run.
- **Capability register locally:** `bash scripts/graphify/bkit-graphify.sh check` was not run; failures-1 relies on CI run 41363058876.
- **Closures / regressions by commit since the previous report:** baseline run, no previous report.
- **Vendor status incidents** (npm registry, GitHub): not read. failures-16's registry 503 was not cross-checked against a status page.
- **Tracker reads through a bkit verb:** no `bkit issues` verb reads an arbitrary issue's state, and the MCP surface here offers `search_issues` only, so issue states came from `gh issue view` (see `Process Improvements`).

### Standards Coverage

Versions read 2026-11-02 (baseline, so no "what changed" diff): Google SRE Workbook, Postmortem Culture (© 2018); Mozilla BMO `BugStatuses` (last edited 22 August 2024); ITIL (Version 5) per PeopleCert (no date shown).

<!-- prettier-ignore -->
| Practice | Source (quoted) | Status | Note |
| --- | --- | --- | --- |
| Known-error records | ITIL known error = a problem analysed but not resolved, with a documented workaround and/or root cause (secondary sources only; see `Not Checked`) | Checked (Step 6) | Every parked or recurring open row has an ACTIVE `docs/knowledge.jsonl` workaround. |
| Proactive problem review | ITIL problem management (secondary) | Checked (Step 9) | This audit, `@bkit-utility-update-failures` and the ship deferred sweep sweep the ledger. 83 closes in 30 days, yet 6 open rows describe fixed code, so sweeps miss sibling and duplicate closes (failures-14, -17). |
| Postmortem action items | SRE Workbook: "Any resulting action items are filed as bugs in our centralized bug tracking system"; "All action items are assigned a priority level"; "you should include some preventative action items" | Finding (failures-1) | The capability-register incident has a preventing action and a tracking issue, but its regression test did not land. Owner and priority: the ledger has no owner or priority field → **adopt**: Step 4 checks the tracking issue's assignee and priority label when an incident row has one. |
| Triage resolution states | BMO: INCOMPLETE = "we don't have enough information at this point"; WORKSFORME = "all attempts at reproducing this bug were futile"; DUPLICATE = "the problems must be exactly the same" | Checked (Step 7) | Verdicts map onto UNCONFIRMED / CLOSED-not-reproducible / DUPLICATE. The ledger's ladder is `OPEN` / `TRIAGED` / `CLOSED` with the close reason in free-text `references`, so a DUPLICATE close is not machine-distinguishable from a FIXED close → **reject** a new `resolution` field for now: the canonical key in `references` is enough for a reader, and a schema field needs a migration. |
| Age targets | Set by this procedure (7 days `CRITICAL`, 30 days `HIGH`) | Checked (Step 3) | 0 breaches. No CI check reds on an open `CRITICAL` row → **adopt**: a `ledger-integrity.test.ts` case, or a CI step, that fails while a winning `CRITICAL` row is open past 7 days. |

### Beyond the Steps

(a) Changes touching failures (baseline: last 30 days, `git log --since=2026-10-03`):

<!-- prettier-ignore -->
| Change | Verdict |
| --- | --- |
| `dfb1b5e8f` feat(680): `bkit ledgers append` mints `ts` | Sound; closes the ts-mint half of failures-4. |
| `5e527e4a6` (ledger-integrity whole-second `ts` gate since `1787788800000`) | Sound; old rows are exempt by design. |
| `abda6278e` docs(747): a direct chat may write every ledger | Widens `failure` writers to the utility orchestrator. Rows from `by.workflow: "utility"` now include `engine-journal-misattributes-calls-to-stale-run`, which is well-formed. |
| `99baaa0b3` feat(699) #786: engine records its own failures | Writes `friction` (`tool-failure`), not `failure`; no effect on this ledger. |
| `8f2c66b40` / `60f83024a` feat(802): engine logs owner pauses | Friction only. |
| `163e09176` feat(699): pre-push bookkeeping guard | Fixes failures-11. |
| Flake register `bkit-audit-flakes` | Template edited 10+ times in the window (`git log --since=2026-10-03 -- .bkit/core/docs/templates/bkit-audit-flakes.md`: 747 authoring rewrite, 663, 631, 627, 524 and others). These are wording and shared-audit-procedure changes; no flake report under `docs/audits/` exists yet, so the 10 open testing rows have never had a flakes pass. |
| CI gate on open `CRITICAL` failures | Still absent. |
| Error-tracker projects / alert rules | None exist. |

(b) What a senior problem manager would flag:

- **Closes miss siblings.** Two rows stayed open after the change that fixed them: failures-14, whose duplicate was closed, and failures-17, whose sibling's close listed it in `references`. A sweep that closes a row could also close every open row its `references` names, or every row with the same test file.
- **Rows without `status`.** Two winning rows were appended with no `status` (`ship-step8-skip-ci-bookkeeping-push-refused-by-pre-push-guard`, `bkit-cloud-opencode-job-never-installs-repo-deps`). Readers count them as open, which is correct, but `bkit ledgers append` does not default `status` to `OPEN`, and both came from workflow steps (`ship-bookkeeping-push`, `design-spike`).
- **The stale-run defect wrote into tracked history during this audit window.** `67a6e07e1` committed five `engine-call` rows that belong to another feature into `715-retire-lite-workflows/status.jsonl`. The commit message presents them as a feature ("add engine call logs for workflow steps"). The bug's output reached `dev` as if it were intended.
- **No owner on any open row.** 22 of the 25 open rows have no open issue carrying them. The ledger can rank by severity and age but cannot say who acts.
- **Row text outlives refactors.** Three rows (failures-4, -5, -8) named a command, file or mechanism that a refactor removed. Their `references` paths still exist, so a path-existence check would not catch them; only a re-read of the description against the code did.

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Add a test that pins Check Capability Register to pull_request runs | failures-1 | HIGH | `/bkit-build` | The fix is landed and only the guarding test is missing. |
| 2 | Append the close, correction and pointer rows this report proposes to docs/failures.jsonl | failures-2, failures-4, failures-8, failures-11, failures-14, failures-17, failures-18 | HIGH | `/bkit-build` | Each row is written out in `Expected`, and `@bkit-utility-update-failures` appends them. |
| 3 | Treat an empty related-issues search as inconclusive in bkit-design | failures-3 | MEDIUM | `/bkit-design` | Control query, gh fallback or an engine verb are open options. |
| 4 | Publish a dev-refused ship FAILED flush through a ship-close PR | failures-5 | MEDIUM | `/bkit-build` | `shipClose` already has the PR path to reuse. |
| 5 | Keep the steps placeholder scan off derived external-content dumps | failures-6 | MEDIUM | `/bkit-design` | The row names two fixes (exempt optional artifacts or quote external text) and neither is chosen. |
| 6 | Give load-sensitive tests a budget that holds under the full gate | failures-7 | MEDIUM | `/bkit-debug` | Eight tests fail only under load and the budget shortfall per test is not measured. |
| 7 | Decide whether the themed README PNGs have a consumer, and stop generating them if not | failures-9 | MEDIUM | `/bkit-design` | Why the PNGs exist is not written down, so the owner decides. |
| 8 | Build the pre-commit dist freshness check from the staged tree | failures-10 | MEDIUM | `/bkit-build` | The row's root cause names the exact change. |
| 9 | Stop the engine journal from filing calls under a stale run | failures-12 | MEDIUM | `/bkit-design` | Trusting origin, matching `--fid`, or refusing the scan fallback are open options. |
| 10 | Fix the LOW tooling rows: comment-aware quote mask, stub --strip-header, pnpm pack stderr | failures-13, failures-15, failures-16 | LOW | `/bkit-build` | Each row names its one-line fix. |

### Process Improvements

**Universal** (proposed template step changes; the template is untouched):

- Step 3 — Fold: add "List every winning row with no `status` field by key. Readers count it as open, but the writer omitted the ladder state, so the row is likely never swept." Two such rows were found this run by hand.
- Step 5 — Recurrences: add "For each row `CLOSED` in the window, check every open row its `references` names, and every open row on the same test file. A close that cites an open sibling usually fixed it too." This found failures-17, and the duplicate in failures-14 is the same miss.
- Step 7 — Classify / Verdicts: for FIXED by deletion (the surface itself was removed, as for failures-8 and failures-18), say what the regression test is: the test that would fail if the deleted surface came back, or the deletion commit when no such test can exist.
- Pre-Flight — Tracker: name a read-by-number fallback (an MCP `issue_read`, or `gh issue view {N} --json state,title`) for hosts whose tracker MCP exposes semantic search only. Semantic search cannot fetch an issue's state by number (a query for the 461 topic returned 0 hits).

**Project** (applied below `<!-- bkit:end -->` in `docs/templates/bkit-audit-failures.md`):

- Added `Project Instructions` keyed to `Pre-Flight / Dependencies`, `Step 3 — Fold`, `Step 4 — Source`, `Step 6 — Classes`, `Step 8 — Standards` and `Permissions`. They cover the `HEAD` fold command, the issue-state read, the error-tracker non-applicability, the CI capability-register probe, the knowledge-row filter, the anchor-standard URLs that returned content, and the current tool permissions (none blocked).

### 🔒 Gate 3: Report Check

- [x] **No placeholders:** no `PENDING` is left.
- [x] **Summary:** `Summary` gives the count per severity.
- [x] **Age breaches:** `Summary` gives the age-target breach count.
- [x] **Coverage:** `Summary` gives rows verified / rows open.
- [x] **Series:** the report shows open count and the recurrence ranking beside the previous report's numbers, or marks the run as baseline.
- [x] **Writes:** this run changed only this report and the template's `Project Instructions` (`git status --short`: `M docs/templates/bkit-audit-failures.md`, `?? docs/audits/202611/`).
- [x] **Throwaways removed:** every throwaway worktree or remote target is removed. This run created none; the 3 `git worktree list` entries predate it.
- [x] **Process Improvements:** `Universal` and `Project` are both filled.
- [x] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [x] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [x] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->
