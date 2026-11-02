<!-- bkit:anchor
baseSha: 67a6e07e11f1880dd894ea97db8cc0d717f56edd
baseRef: dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->
<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate filled this template. This report lives at `docs/audits/202611/deferrals.md`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

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

- Technical debt, principal, and interest, and the Technical Debt Quadrant (e.g., Martin Fowler).
- Hotspot analysis, churn against code health (e.g., CodeScene).
- Review of deferred problem records on a schedule and on release: activate, keep deferred, or close (e.g., ITIL-aligned known-error monitoring).
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

- [x] **Permissions:** every blocked call is recorded. One read-only probe per tool, all allowed, none blocked: `direnv exec . gh issue view 344` (gh 2.102.0), `mcp__github__search_issues` (3 hits), `mcp__serena__get_symbols_overview` on `.bkit/core/engine/commands/workflow/disk.ts`, `WebFetch` of martinfowler.com, `WebSearch`.
- [x] **Ledger:** Steps 3-9 — `docs/deferrals.jsonl` (177 lines, 170 keys, read at `HEAD` via `git show HEAD:docs/deferrals.jsonl`) and `.bkit/jsonl.md` (§ Write Idiom, § Per-Kind Fields, § Severity, § Deferral Reason, § Updating a Row, § Compaction). Tool: `jq-1.8.2`.
- [x] **Git History:** Steps 2, 7 — `git version 2.56.0`; `git rev-parse --is-shallow-repository` = `false`, so history is complete. No previous report exists, so Step 2 is baseline. 90-day churn via `git log --since=90.days --oneline HEAD -- <path>`.
- [x] **Web:** Step 10 — `WebFetch` read martinfowler.com `TechnicalDebt` (dated "21 May 2019") and `TechnicalDebtQuadrant` (dated "14 October 2009"), codescene.io hotspots guide (no version, "© Copyright 2026 CodeScene AB."), and the Micro Focus "Review deferred problems" page. The AXELOS ITIL 4 Problem Management practice guide was not reachable; only secondary sources were read (gap in `Not Checked`).

#### Conditional

- [x] **Language Server:** **If** the language is typed → Steps 5, 6 — Serena (`get_symbols_overview` on `disk.ts` listed `renewLock`, `LOCK_RENEW_MS`, `takeLock`). Most row checks were literal-signature and doc checks, so `git grep` / `git show HEAD:` at `HEAD` did the rest. No close in this run depends on a caller set.
- [x] **Tracker:** **If** issues are wired → Steps 6, 8 — GitHub, repo `cbartens/bkit` (PUBLIC). The GitHub MCP in this runtime exposes `search_issues` and `add_issue_comment` only, with no issue-read tool, so issue state, bodies and comments were read with `direnv exec . gh issue view` / `gh issue list` (gap in `Not Checked`, fix in `Process Improvements`).
- [x] **Run Stats:** **If** `.bkit/stats.jsonl` has `outcome` rows → Step 3 — 48 `outcome` rows (2026-07-22 to 2026-11-01). None carries `deferralsAdded`; all 48 carry `ledgers.deferrals.added` (`.bkit/jsonl.md` § Per-Kind Fields), which this run summed instead.

### 🔒 Gate 1: Prerequisites Check

- [x] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [x] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [x] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [x] **Step 2 — Closures:** Re-verify at `HEAD` every DONE and SUPERSEDED row from the previous report. Record each one that no longer holds as a finding, with what changed. **Done when:** `Closures` holds every row, each failure and the failure rate, or the run is marked baseline.
- [x] **Step 3 — Fold:** Fold the ledger last-row-wins per `key`, not per line. The ledger is append-only (`.gitattributes` `merge=union`), so editing a line leaves the stale copy beside its replacement.
  - The row with the highest numeric `ts` wins (`.bkit/jsonl.md` § Updating a Row).
  - **If** a `key` has a non-numeric `ts` → the last line in the file is the latest.
  - A row is open when its winning row has `status != "CLOSED"`. That includes `TRIAGED`, `RESOLVED`, `BLOCKED`, `SUPERSEDED`, `CANCELLED`, free text after the word, a missing `status` and any value outside the enum, because a word that looks finished does not mean done.
  - Order the open rows `CRITICAL` first, then `HIGH`, then oldest `ts`.
  - Compare `severity` case-insensitively.
  - **If** a row has no `severity` → assign one with its verdict.
  - Compare each of these figures with the previous report:
    - The open count.
    - Inflow: the sum of `deferralsAdded` on `outcome` rows in `.bkit/stats.jsonl` since the previous run, where the field exists.
    - Outflow: the rows that became `CLOSED` since the previous run.
    - An age histogram by `ts`.
    - The share of open rows missing `severity` or `reason`.
  - Record rows verified / rows open on every run, because a large open set may get only a partial pass.
  - Record the fold's limits: it cannot see a deferral with no `key`, or one recorded only in a PR description.

  **Done when:** `Trend` holds the counts, the histogram, inflow, outflow, the missing-field share, verified / open and those limits, or `N/A` is recorded → **STOP**.

- [x] **Step 4 — Defects:** Check the winning row of each `key`, without appending. `Expected` = the row the writer appends: a copy of the latest row with only the defective field changed, the same `key`, and a `ts` minted at append, never a literal and never in the future.

<!-- prettier-ignore -->
| Field | Defect | Expected row |
| --- | --- | --- |
| `ts` | Not numeric Unix milliseconds: a string, seconds, or missing. The fold order is then undefined | The same row with a fresh `ts` |
| `status` | Outside `OPEN` / `TRIAGED` / `CLOSED` (`RESOLVED`, `BLOCKED`, `SUPERSEDED`, free text) | `TRIAGED` where the row records analysis, otherwise `OPEN`, with the old word kept in `description`. `CLOSED` comes only from a verdict |
| `reason` | Missing, or outside `scope-declared` / `hard-blocked` / `needs-decision` / `own-cycle` / `low-severity` / `unjustified` | One of the first four values that the row's text supports, with the old text kept in `description`. Never `unjustified`, and `low-severity` only on a `LOW` row |

**If** a winning row has a future `ts` → name its `key` in a finding for the owner, and propose no correction row. **Done when:** `Defects` holds the count of each defect and each `Expected` row, or `none`.

- [x] **Step 5 — Source:** Give no verdict before this step. Claims of outstanding work are as unreliable as claims of done work.

<!-- prettier-ignore -->
| Row claims | Check with |
| --- | --- |
| "`X` should be extracted, renamed, or consolidated" | Language server symbol lookup: does it exist, and at what path now? A symbol that moved is SUPERSEDED |
| "Every caller of `Y` still does Z" | Language server references, then read the callers. This is DONE evidence |
| "The guard is missing at N sites" | Text search for the literal signature. Counting sites is a pattern question |
| Migrations, workflows, SQL, docs, or other ledgers | Text search. A language server reads one language |

Pace the reference queries. Re-run an empty or surprisingly low result before giving a close verdict, because a partial answer looks the same as a real one. An empty result is inconclusive, not proof of absence. **Done when:** every row verified this pass has its evidence and the tool on its finding. Unverified rows stay counted in `Trend`, and are not passed.

- [x] **Step 6 — Reasons:** `reason` records why the row was deferred, and each value implies a check. Re-test the enum value that Step 4 assigned in the same way. UNJUSTIFIED replaces a value only when Step 9's four tests hold.

<!-- prettier-ignore -->
| `reason` | Check |
| --- | --- |
| `hard-blocked` | Is the blocker the row names still there? |
| `needs-decision` | Was the decision made since? Search `docs/decisions.jsonl` |
| `own-cycle` | Does a plan or an issue for it exist? |
| `low-severity` | Is it still `LOW`? The four tests never make it `unjustified` |
| `scope-declared` | Does the cited doc section exist, and does it predate the row? |

A lifted blocker is the highest-yield finding, so flag it on the verdict. Apply the KEEP trigger rule. **Done when:** every verified row's reason and every KEEP trigger has a result on its finding.

- [x] **Step 7 — Cost:** Severity measures how bad the gap is, not what it costs to carry. For each row still open after Step 6, measure churn: the commits touching its surface in the last 90 days (e.g., `git log --since=90.days --oneline -- <path>`). Find the related rows in `docs/failures.jsonl` and `.bkit/friction.jsonl` on the same symbol or path. **If** churn is high **and** related failures exist → raise the severity. **If** the risk is already a failure row → treat it as a live bug: pair the failure `key`, raise the severity, and name `bkit-audit-failures` for the bug triage. **Done when:** `Cost` holds one row per surviving open row, with its churn, related keys and severity change.
- [x] **Step 8 — Pointers:** (a) For each TRACKED row, check that the open issue's acceptance criteria include the deferred scope, and that the issue is not stale and has not been `Low` across 3 or more `bkit-audit-issues` passes. **If** either check fails → say which fix applies: extend the criteria, or give the verdict NEEDS ISSUE. (b) For each row that points at a closed issue, read what closed it. **If** the scope landed → DONE. **If** the scope was dropped → NEEDS ISSUE. (c) For each issue closed since the previous report, read its closing comments for deferred items. **If** a deferred item has no row keyed to it → `Expected` = the row to append. **Done when:** `Pointers` lists the issue checks and the comment-only deferrals, or `none`.
- [x] **Step 9 — Classify:** Give every row, as Step 5 left it, one verdict. Adjudicate `unjustified` here, and only here. Cluster the rows before naming issues. Put every `needs-decision` row and every ACCEPTED row in `Decisions`, with who decides. This run does not append rows, open issues or do the work.

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

- [x] **Step 10 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per practice (principal and interest, the debt quadrant, hotspots, review triggers for deferred records) and one per `reason` value, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [x] **Step 11 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches deferrals: the schema and writers in `.bkit/jsonl.md`, the design, plan, build and ship steps that write rows, the ship deferral check `@bkit-ship-deferred-sweep`, and the issues that rows point at. (b) In a bounded pass of about 30 minutes, note what a senior EM owning a technical-debt register would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` sweeps, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [x] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [x] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [x] **Read-only:** no ledger line, code or config changed.
- [x] **Rows proposed only:** every correction and close row is marked `Expected`.
- [x] **Positive close:** every `DONE` and `SUPERSEDED` cites a positive reason, never an empty query.
- [x] **Gate 2 — Verified:** every item above holds.

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
| deferrals-1 | HIGH | NEEDS ISSUE (blocker lifted) | `381-opencode-curl-glob-substring-bypass` (ledger line 54); `.opencode/opencode.json:180-183`; `.bkit/core/engine/install/modules/opencode.ts:352-360` | `git show HEAD:` — the shell allows are still substring globs (`"curl *agents.md*": "allow"`, opencode.ts:357 `` bash[`curl *${base}*`] = "allow" ``). The row's blocker is "revisit if OpenCode gains ... a pre-tool hook comparable to Cursor beforeShellExecution". That hook exists and bkit already blocks through it: `.bkit/core/.opencode/plugin/bkit-gateguard.js:270` registers `"tool.execute.before"`, and `:173` throws to refuse a call (`git grep`). | One `own-cycle` issue for the host-guard cluster (Suggested Issues row 1). Same-`key` row: `reason` stays `hard-blocked`, `description` adds "blocker lifted: OpenCode `tool.execute.before` plugins can refuse a call (bkit-gateguard.js:173, :270)", `references` + the new issue. |
| deferrals-2 | HIGH | TRACKED (criteria gap; severity raised by Step 7) | `397-dual-agent-same-run-double-ship-when-both-secrets-set` (line 156); `.bkit/templates/.github/workflows/bkit-cloud.yml:129-151` | `git show HEAD:` — the `gate` step sets `claude=true` and `opencode=true` independently, so both agent jobs still start when both secrets are set. `git grep -i 'Select agent'` on both `bkit-cloud.yml` copies is empty; plan `docs/plans/202610/719-cloud-variants-add-plan.md:86,102,119` names that step. #719 is open, but its acceptance criteria (`gh issue view 719`, line 28) say "dispatches the configured agent jobs" and never "exactly one". Step 7: `bkit-cloud.yml` had 27 commits in 90 days, and an open HIGH failure sits on the same jobs (`bkit-cloud-opencode-job-never-installs-repo-deps`). | Extend #719's acceptance criteria with "a run starts only the job `bkit.cloud.agent` names". Same-`key` row: `severity: "HIGH"`, `status: "TRIAGED"`, `references` + `719` plan Task 8. |
| deferrals-3 | HIGH | NEEDS ISSUE (blocker lifted) | `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` (line 50); `.bkit/core/.codex/hooks/bkit-guardrails.cjs:74-77`; `.bkit/core/hooks/guardrails-tiers.js:193-197` | The blocker was "the Codex file-read tool name is unverified". `.bkit/core/.codex/hooks/bkit-readguard.cjs:5` now records that "Codex has no file-read tool, so every read arrives as a shell command". The shell path classifies `*.pem`, `*.p12` and `id_rsa` as `key` (guardrails-tiers.js:196), but `decideShell` answers the `secret` tier with `ask`, which is advisory on Codex (bkit-guardrails.cjs:74-77). A `cat id_rsa` therefore runs with only a note. The row's own remediation says "Deny is real on Codex". | Fold into Suggested Issues row 1: deny the `key` kind on Codex shell reads, keep `.env` advisory. Same-`key` row: `reason` stays `hard-blocked`, `description` adds "blocker lifted: Codex reads go through the shell (bkit-readguard.cjs:5)", `references` + the new issue. |
| deferrals-4 | MEDIUM | Data defect (`reason`) | 17 open winning rows (ledger lines 1-8, 10-15, 17-19) | `jq` fold of `HEAD:docs/deferrals.jsonl`: 17 of 120 open winning rows have no `reason`, which `.bkit/jsonl.md` § Deferral Reason makes required. All 17 have `status: "OPEN"`. | The 17 same-`key` rows in `Defects`, each a copy of the winning row with only `reason` added and the old text kept in `description`. |
| deferrals-5 | MEDIUM | DONE (4 rows) | `pending-unify-the-143-live-api-smoke-convention-with-the-203` (line 11); `untrusted-input-threat-model-hand-authored-utility-agents` (47); `381-provider-registry-key-mirror-consolidation` (55); `381-upgrade-does-not-write-advisories-artifact` (97) | Line 11: one tier vocabulary now ships (`.bkit/shared/docs/testing.md:13` "Static · Unit · Integration · E2E · @live · Smoke"; `:153-155` names `LIVE_API` as the anti-pattern; `.bkit/core/engine/checks/after/ci-yml.ts:262,380` maps `@smoke`/`@live` to scripts). Line 47: both remaining hand-authored agents carry the untrusted-input rule (`.claude/agents/utility-new-release.md:36`, `.claude/agents/utility-pre-release-check.md:38`), and `utility-harvest-friction.md` is absent from `.claude/agents/` at `HEAD` (`git ls-tree`). Line 55: `.bkit/core/engine/cli.ts:21` imports `OPENCODE_PROVIDERS` from `shared/egress.ts`, and `.bkit/core/engine/render/models.ts:108-117` ends `GATEWAY_COLUMN` with `satisfies Record<OpencodeProvider ...>`, so a missing key fails `tsc`. Line 97: `.bkit/core/engine/commands/install/upgrade.ts:1059-1060` calls `runUpgradeAdvisories` (install.ts:216), which writes the artifact with `mode: "upgrade"` (install.ts:571-573), from commit `0911c0be3` "fix(524): check and upgrade report the gate advisories install reports". | 4 same-`key` rows with `status: "CLOSED"` and the evidence above in `references`. Line 11 also takes `reason: "own-cycle"` (Defects). |
| deferrals-6 | MEDIUM | SMALL (decision under `Decisions`) | `create-security-github-label-for-injection-hardening` (line 14) | `direnv exec . gh label list --limit 300` returned 28 labels (10 `next:*`, corroborating the read) and none matching `secur`. #342 "Prompt-injection hardening" closed 2026-10-13. The row says "consider creating one (manually)". | Owner decides (see `Decisions`). A) create the `security` label → `CLOSED` row. B) decline → `CLOSED` row "not wanted". |
| deferrals-7 | MEDIUM | Data defect (`ts`) | `create-security-github-label-for-injection-hardening` (line 14, `ts` 1784030000001); `shell-native-mcp-cli-bridge-real-exit-codes` (15, 1784073600000); `tracker-read-path-corroboration-outside-mcp-private-repo` (17, 1784073600003); `341-mode-tuned-subagent-fanout-concurrency-pacing` (19, 1784678400001) | `jq` over every line: these `ts` values sit on whole-second or exact-midnight UTC values plus 0-3 ms (2026-07-15T00:00:00Z ×2, 2026-07-22T00:00:00Z, 2026-07-14T11:53:20Z). They are hand-typed literals (`.bkit/jsonl.md` § Write Idiom: "`ts` is never a literal"). Line 15 is a whole second, which § Write Idiom says fails the live-ledger gate. None is in the future. | The same rows with a minted `ts`. The `reason` repair rows for these 4 keys in `Defects` already mint a fresh `ts`, so no separate row is needed. |
| deferrals-8 | MEDIUM | NEEDS ISSUE (`needs-decision`) | `58-status-jsonl-run-boundary-keys-on-last-run-overall` (line 52); `.bkit/core/engine/commands/workflow/workflows.ts:2128-2129` | `git show HEAD:` — `const latest = fold(readStatusEvents(file)).at(-1); const resumed = latest?.workflow === workflow && ...` still keys on the last run overall. `lastRun(runs, workflow)` exists at `.bkit/core/engine/ledgers/status.ts:156`, but the start test does not use it. `docs/decisions.jsonl` has no decision on it (`jq` regex search). | Owner decides (see `Decisions`), then one issue. Same-`key` row `TRIAGED` with the issue in `references`. |
| deferrals-9 | MEDIUM | NEEDS ISSUE (cluster of 5; one trigger fired) | `341-live-run-verification-mode-1-and-mode-3` (69); `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (73); `650-debug-dev-ci-live-round-trip` (111); `719-codex-cloud-session-start-guard` (155); `719-linear-jira-router-live-read` (158) | All five wait on a live run that an agent cannot start alone: a cloud session, a Codex Cloud task, live Linear/Jira keys, or a human-confirmed dev push. Line 69's trigger, "Before merge", fired when #341 closed on 2026-07-28. Its mode-1 half has run on `dev` since (commit `469ae7789` "docs(715-retire-lite-workflows): ship DONE bkit [skip ci]"), and the mode-3 half is still unexercised. #341, #384 and #650 are closed; #719 is open. | One `own-cycle` issue, "live verification pass", that names the five runs and closes each row with its run id. Same-`key` rows `TRIAGED` pointing at it. |
| deferrals-10 | MEDIUM | NEEDS ISSUE (2 rows) | `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (66); `384-required-status-checks-on-dev-via-bkit-protect-main` (72); `.bkit/core/engine/commands/setup/setup.ts:5` | `git grep -E -- '--revert\|revertWorkflow\|pin.*workflow'` on `upgrade.ts` is empty, while the same file reads `upgradeFlags.dryRun` at `:1060` (a known hit, so the read works). `setup.ts:5` still says "`dev` is left unprotected". Each row's remediation pairs it with the other. Neither has an open issue (#384 closed 2026-07-29). | One issue covering both, with the stance question from `setup.ts:5` in it. Same-`key` rows `TRIAGED` pointing at it. |
| deferrals-11 | MEDIUM | NEEDS ISSUE (host-guard cluster, 4 more rows) | `381-cloud-allowlist-staleness-detector` (48); `381-webfetch-grants-survive-uninstall-after-seed-emptied` (98); `381-opencode-bash-grants-never-revoked` (100); `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` (51) | Line 48: the paste block has its fingerprint (`.bkit/core/engine/install/cloud-env.ts:634,685`), but `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` never echoes one (`git grep -i fingerprint\|egress` hits only a comment at `:157`). Line 98: `.bkit/core/engine/commands/install/uninstall.ts:739` still recomputes `resolveClaudeDerivedAllows(ctx.cwd)`. Line 100: `opencode.ts:352-360` only adds `curl`/`wget` allows, and the reconcile at `:383-450` deep-merges the existing keys. Line 51: `.bkit/core/.opencode/plugin/` holds `bkit-gateguard.js`, `bkit-readguard.js` and `bkit-rules.js`, with no guardrails plugin. #381 and #441 are closed. | Fold into Suggested Issues row 1, one `own-cycle` issue with deferrals-1 and deferrals-3 (6 rows, cluster rule). Same-`key` rows `TRIAGED` pointing at it. |
| deferrals-12 | MEDIUM | NEEDS ISSUE (TRACKED check failed) | `397-ship-lane-reconciler-for-depth-1-queue-eviction` (77) | #397 is open (updated 2026-10-30). `gh issue view 397` body grep for `reconcil\|sweep\|evict\|depth\|third` is empty, and the body read back (Gap 1 "Ship is not global"). The row itself says "future issue after #397 lands". | A sub-issue of #397 with the row's remediation as acceptance criteria. Same-`key` row `TRIAGED` pointing at it. |
| deferrals-13 | MEDIUM | NEEDS ISSUE (`needs-decision`; trigger fired) | `conditional-lens-vocabulary-alignment-across-workflow-and-audit` (95) | The row says "Decide before both surfaces ship". #442 closed 2026-10-07 and #405 closed 2026-10-05 (`gh issue view`), so both shipped. `docs/decisions.jsonl` holds `442-step-skipped-row-not-folded` (SUPERSEDED) and no vocabulary decision. The reason no longer holds as a pre-ship decision; it is now a retrofit. | Owner decides (see `Decisions`), then one issue. Same-`key` row `TRIAGED`. |
| deferrals-14 | MEDIUM | Data defect (`firstTs`, owner item) | `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (line 73) | `jq`: the only line for this key has `firstTs: 0`, `updates: 7`, `ts: 1791975891597`, written by `by.workflow: "utility"`. Age reports read it as 20,759 days old. § Compaction stamps the "earliest `firstTs` / `ts` across the entry", and § Write Idiom fills `firstTs` the same way, so 0 survives every later append and compaction. | No correction row, because a writer-filled `firstTs` keeps the 0. Owner item: find how `0` was written and make the writer or `validate()` refuse it (Suggested Issues row 4). |
| deferrals-15 | MEDIUM | NEEDS ISSUE (decision inside) | `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (112); `.bkit/templates/.husky/pre-push:12` | `git show HEAD:` — the header still tells Turbo repos to scope `bkit:gate*` with `--filter="...[origin/<default>]"`. #653 closed 2026-10-22, and its Out of Scope declared this. The row asks to "Decide between (a) ... or (b)". | One issue that carries the A/B choice (see `Decisions`). Same-`key` row `TRIAGED`. |
| deferrals-16 | MEDIUM | NEEDS ISSUE | `724-host-hook-catches-raw-test-runners` (150) | `git grep -l 'machine-lock\|--lock tests'` over `.bkit/core/hooks` and the host dirs is empty. The same pattern hits `docs/plans/202610/724-machine-wide-test-plan.md` and the ledgers, so the read works. #724 is open, but its Out of Scope names this as a separate follow-up. | One issue: a per-host hook that wraps heavy test-runner commands in the tests lock. Same-`key` row `TRIAGED`. |
| deferrals-17 | LOW | ACCEPTED (3 rows; owner sign-off) | `pending-factory-reset-uninstall-mode` (1); `pending-bkit-upgrade-prune-flag-deferred-post-v2-0-0` (7); `pending-143-script-naming-rename-typecheck-check-type-format-c` (12) | Line 1 has no trigger, and no factory-reset mode exists in `uninstall.ts` (`git grep -i factory\|--purge` empty; `cli.ts:18` imports `runUninstallCommand`, so the read works). Line 7's trigger "post-v2.0.0" has fired: the installed bkit is 6.0.0 (anchor stamp), and `cli.ts`/`upgrade.ts` have no `--prune` (`--dry-run` hits in `cli.ts`). Line 12: `.bkit/core/engine/install/manifest.ts:250-251` still runs `pnpm typecheck && pnpm lint && pnpm format:check`, and `748-names-outside-the-branding-rule` leaves generic stack script slots unprefixed. | Owner decides (see `Decisions`). On sign-off, 3 `CLOSED` rows (with the `reason` repair from `Defects`). |
| deferrals-18 | LOW | SUPERSEDED | `pending-bar-155-deferred-task-range-parameter-for-bkit-build-pl` (4) | `.bkit/core/prompts/bkit-build-plan-execute.md` was deleted in `ade710750` "feat(796): tests-first subagent per build group, with engine-proved reds" (`git log --diff-filter=D`). The build prompts are now `bkit-build-plan-tasks.md` / `-tests.md` (`git ls-tree`). | `CLOSED` row: "surface removed in ade710750; the build-plan-execute prompt no longer exists", with `reason: "own-cycle"` (Defects). |
| deferrals-19 | LOW | SMALL | `pending-drop-decorative-cursor-hooks-json-echo-commands-deferre` (8); `.bkit/shared/.cursor/hooks.json:7` | `git show HEAD:` — `"sessionStop": [{ "command": "echo '[bkit] session stopped'" }]` is still there. | Next cycle: drop the echo hook. This run does not do it. |
| deferrals-20 | LOW | Reason check failed (`scope-declared` without doc §) | `pending-per-pr-opt-in-alternative-to-bkit-auto-route-linear-label` (25); `pending-ci-lint-guarding-against-agents-scripts-agents-template` (46); `700-first-action-deny-gate` (113); `700-rules-content-hash-acknowledgement` (114); `700-provider-auto-load-rules` (115) | `jq` on `references`: line 25 has none, line 46 has only `.bkit/core/engine`, and lines 113-115 have only `#700`. § Deferral Reason requires "`references` to that doc §" for `scope-declared`. The rows' source was not verified this pass. | Next run: find the declaring doc section and append same-`key` rows with it in `references`, or re-pick the reason. |
| deferrals-21 | LOW | Data defect (`type`) | `341-live-run-verification-mode-1-and-mode-3` (69); `650-debug-dev-ci-live-round-trip` (111) | `jq`: `type: "verification"`, outside `"issue"` / `"feature"` (`.bkit/jsonl.md` § Per-Kind Fields). | Same-`key` rows with `type: "issue"` and the old word kept in `description`, or carry it in the deferrals-9 rows. |
| deferrals-22 | LOW | DONE (3 rows) | `700-session-start-nudge-challenge-low-bkit-core-claude-hooks-bkit-preflight-sh-46` (128); `703-standardise-question-option-roadmap-duplicate-refreshed-stamp` (136); `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-245` (175) | Line 128: `.bkit/core/.claude/hooks/bkit-preflight.sh:53-62` now escapes the rest of the C0 range, landed in `2790b4181`. Line 136: `docs/roadmap.md:26` carries a single `_(refreshed 2026-11-01T23:27:25Z)_` stamp (`git grep -n`). Line 175: the sweep renews its lock (`.bkit/core/engine/commands/workflow/disk.ts:50` `LOCK_RENEW_MS`, `:266` `renewLock`, `:429` `setInterval(renewLock, ...)`), from `827bfd1ae` "fix(99): close the gaps the review of the friction fixes found". | 3 `CLOSED` rows. Line 136's row carries `reason: "unjustified"` word for word. |
| deferrals-23 | LOW | OTHER (not ours) | `700-session-start-nudge-challenge-low-agents-skills-hook-development-scripts-test-hook-sh-190` (131) | `.agents/skills/hook-development/` is not on disk (`ls`), was never tracked (`git log` on the path is empty), and is absent from `.agents/skills.md` (`git grep`; the known hit `brainstorming` is found). The code is a third-party vendored skill. | `CLOSED` row "not ours: vendored third-party skill, not installed in this repo". Report it upstream if the skill is reinstalled. |
| deferrals-24 | LOW | SMALL (5 rows; 1 locator drift) | `705-...-status-ts-468` (124) → now `.bkit/core/engine/commands/workflow/status.ts:536,538`; `705-...-manifest-ts-252` (125) → `manifest.ts:251`; `703-...-decisions-ts-52` (132) → `decisions.ts:53`; `715-...-disk-ts-232` (173) → `disk.ts:229-240`; `715-...-status-ts-269` (174) → `status.ts:303` | `git show HEAD:` — status.ts:536 still says "Step 10's challenge" and :538 "Step 10 goes on to Step 11"; manifest.ts:251 still says "build Step 11"; `letterAt = (i) => String.fromCharCode(65 + i)` has no bound; `takeLock` does stat → read → `rmSync` → create; `PUBLISH_TOKEN.exec(promptText)` scans the whole prompt. | Next cycle's work. Line 124's row also takes the new locator `status.ts:536`. |
| deferrals-25 | LOW | ACCEPTED (7 rows; owner sign-off) | `715-no-batch-publish-verb` (140), `715-build-docs-sync-stays-in-ship` (141), `715-build-verification-unchanged` (142), `715-debug-publish-mode-unchanged` (143), `715-tracker-label-definitions-unchanged` (144), `715-consumer-lite-content-migration` (145), `715-historical-audit-report-mentions` (146) | Each row records a non-goal from #715's Out of scope or Success criteria, with no `remediation`. Line 140 still holds, since no `--batch` verb exists (`git grep -c -- '--batch'` over engine sources is empty). #715 is open. | Owner signs off (see `Decisions`), then 7 `CLOSED` rows "deliberate non-goal". |

**If** the run finds nothing → write one row: `None`.

## Report

### Summary

This is the baseline run: no earlier deferrals report exists. The ledger folds to 170 keys, and 120 of them are open (95 `OPEN`, 8 `TRIAGED`, 17 with no `status`). This pass checked 49 of the 120 open rows against source (40.8%). The highest-yield results are two lifted blockers on host-guard gaps. On Codex, private-key reads are only advisory (deferrals-3). On OpenCode, the curl/wget allowlist is a substring glob, although a pre-tool hook now exists (deferrals-1). The third is a live double-dispatch path in `bkit-cloud.yml` whose fix is planned in #719 but missing from #719's acceptance criteria (deferrals-2). Seven rows are already done or superseded, 17 rows lack the required `reason`, and 7 rows from #715 are non-goals rather than debt.

- **Findings by severity:** CRITICAL 0 · HIGH 3 · MEDIUM 13 · LOW 9.
- **Verdicts over the 49 verified rows:** DONE 7 · SUPERSEDED 1 · TRACKED 1 · NEEDS ISSUE 18 · KEEP 4 · SMALL 7 · ACCEPTED 10 · UNJUSTIFIED 0 · OTHER 1.
- **Coverage:** 49 / 120 open rows verified. The other 71 stay open and uncounted as passed (`Not Checked`).

### Previous Run

Baseline. `docs/audits/` has no earlier `deferrals*.md` report (`ls docs/audits/202610 docs/audits/202611`, `git log --all -- 'docs/audits/**'` filtered on `defer` is empty), so there is no closure rate, no fixed / still-open count and no finding age to carry.

### Closures

Baseline: there is no previous report, so there are no earlier DONE or SUPERSEDED verdicts to re-verify. Failure rate: not applicable.

### Trend

Baseline values. No previous report exists, so every figure is a first reading.

<!-- prettier-ignore -->
| Measure | This run | Previous report |
| --- | --- | --- |
| Lines / keys | 177 lines, 170 keys | baseline |
| Open winning rows | 120 (`OPEN` 95, `TRIAGED` 8, no `status` 17) | baseline |
| Closed keys (outflow, all time) | 50; by winning-row month: 2026-07 2, 2026-08 1, 2026-10 46, 2026-11 1 | baseline |
| Inflow | 141 = sum of `ledgers.deferrals.added` over 48 `outcome` rows, 2026-07-22 to 2026-11-01. `deferralsAdded` is on no row | baseline |
| Open by severity | MEDIUM 29, LOW 91 (no CRITICAL / HIGH in the ledger) | baseline |
| Open by `reason` | `scope-declared` 60, `low-severity` 18, `own-cycle` 10, `hard-blocked` 7, `needs-decision` 7, `unjustified` 1, missing 17 | baseline |
| Missing `severity` | 0 / 120 (0%) | baseline |
| Missing `reason` | 17 / 120 (14.2%) | baseline |
| Verified / open | 49 / 120 (40.8%) | baseline |

Age histogram, open rows by `firstTs` (else `ts`), measured on 2026-11-02:

<!-- prettier-ignore -->
| < 7 d | 7-29 d | 30-89 d | 90-179 d | >= 180 d |
| --- | --- | --- | --- | --- |
| 47 | 15 | 10 | 47 | 1 |

The single ">= 180 d" row is the `firstTs: 0` defect (deferrals-14). By its `ts` it belongs in "7-29 d".

**Fold limits:** The fold sees only keyed rows in `docs/deferrals.jsonl`. It cannot see a deferral recorded only in a PR description, an issue comment or a plan's Out of Scope section without a row. The 17 rows with no `status` read as open by the template's rule, although `.bkit/jsonl.md` § Per-Kind Fields marks `status` optional on `deferral`.

### Defects

<!-- prettier-ignore -->
| Field | Count | Keys |
| --- | --- | --- |
| `ts` not numeric ms / seconds / missing | 0 | none |
| `ts` hand-typed literal (whole second or midnight + 0-3 ms) | 4 | deferrals-7 |
| `ts` in the future | 0 | none |
| `status` outside `OPEN` / `TRIAGED` / `CLOSED` | 0 | none (17 rows have no `status`; schema-optional, counted as open) |
| `reason` missing | 17 | below |
| `reason` outside the enum | 0 | none |
| `firstTs` = 0 | 1 | deferrals-14, owner item, no correction row |
| `type` outside `issue` / `feature` | 2 | deferrals-21 |

`Expected` rows for the 17 missing `reason` values. Each is a copy of the key's winning row with only `reason` added, the old title kept in `description`, and the writer minting `ts`. The minted `ts` also fixes the 4 literal `ts` values (lines 14, 15, 17, 19).

<!-- prettier-ignore -->
| Line | `key` | `reason` to add | Supported by the row's text |
| --- | --- | --- | --- |
| 1 | `pending-factory-reset-uninstall-mode` | `own-cycle` | a new uninstall mode |
| 2 | `pending-three-way-merge-ui-for-bkit-upgrade-conflicts` | `own-cycle` | a new merge UI |
| 3 | `pending-router-dead-letter-retry-policy-if-claude-code-action-v1` | `own-cycle` | a new retry policy, contingent on a crash |
| 4 | `pending-bar-155-deferred-task-range-parameter-for-bkit-build-pl` | `own-cycle` | a new prompt parameter (and SUPERSEDED, deferrals-18) |
| 5 | `pending-bar-155-deferred-focused-brief-mode-for-bkit-build-challe` | `own-cycle` | a new prompt mode |
| 6 | `pending-cursor-v1-keyed-object-schema-deeper-validation-if-task-0a-s` | `needs-decision` | contingent on what a spike surfaces |
| 7 | `pending-bkit-upgrade-prune-flag-deferred-post-v2-0-0` | `own-cycle` | a new CLI flag |
| 8 | `pending-drop-decorative-cursor-hooks-json-echo-commands-deferre` | `scope-declared` | "deferred per Plan-Phase Decision 3" |
| 10 | `pending-bkit-repo-own-renovate-local-json5-parallel-update-if-reno` | `needs-decision` | contingent on Renovate noise |
| 11 | `pending-unify-the-143-live-api-smoke-convention-with-the-203` | `own-cycle` | two conventions to unify (closing DONE, deferrals-5) |
| 12 | `pending-143-script-naming-rename-typecheck-check-type-format-c` | `needs-decision` | a rename across consumers |
| 13 | `pending-tighter-per-paid-endpoint-soak-iteration-cap-for-debug-mode` | `own-cycle` | a new cap mechanism |
| 14 | `create-security-github-label-for-injection-hardening` | `needs-decision` | "consider creating one" |
| 15 | `shell-native-mcp-cli-bridge-real-exit-codes` | `own-cycle` | "a bespoke CLI" |
| 17 | `tracker-read-path-corroboration-outside-mcp-private-repo` | `needs-decision` | "is left open" |
| 18 | `58-counter-row-countername-value-pairing-unverified` | `needs-decision` | "Settle alongside #234's counterSource enum question" |
| 19 | `341-mode-tuned-subagent-fanout-concurrency-pacing` | `own-cycle` | "mode-tuned concurrency pacing" |

### Cost

Churn = commits touching the surface in the last 90 days at `HEAD` (`git log --since=90.days --oneline HEAD -- <path>`, 960 commits repo-wide). The count runs without `--follow`, so files moved from `.bkit/src/` into `.bkit/core/engine/` undercount. Related rows come from `jq` regex matches over the 25 open `docs/failures.jsonl` winning rows and the 23 `.bkit/friction.jsonl` rows. A severity is raised only where the failure sits on the same symbol, not just the same file.

<!-- prettier-ignore -->
| Row (line) | Verdict | Surface | Churn 90 d | Related keys | Severity change |
| --- | --- | --- | --- | --- | --- |
| 54 | NEEDS ISSUE | `.bkit/core/engine/install/modules/opencode.ts` | 20 | none | MEDIUM → HIGH (lifted blocker, deferrals-1) |
| 100 | NEEDS ISSUE | `opencode.ts` | 20 | none | none |
| 51 | NEEDS ISSUE | `.bkit/core/.opencode/plugin/` | 8 | `gateguard-opencode-patch-tests-flaky-under-full-audits-run` (LOW, test flake, different symbol) | none |
| 50 | NEEDS ISSUE | `.bkit/core/.codex/hooks/bkit-guardrails.cjs`, `.bkit/core/hooks/guardrails-tiers.js` | 5, 7 | none | MEDIUM → HIGH (lifted blocker, deferrals-3) |
| 98 | NEEDS ISSUE | `.bkit/core/engine/commands/install/uninstall.ts` | 24 | none | none |
| 48 | NEEDS ISSUE | `bkit-cloud-bootstrap.sh`, `cloud-env.ts` | 5, 17 | none | none |
| 156 | TRACKED | `.bkit/templates/.github/workflows/bkit-cloud.yml` | 27 | `bkit-cloud-opencode-job-never-installs-repo-deps` (HIGH, same agent jobs) | MEDIUM → HIGH |
| 77 | NEEDS ISSUE | `bkit-cloud.yml` | 27 | same failure, different symbol (concurrency) | none |
| 84 | KEEP | `bkit-cloud.yml` trigger | 27 | same failure, different symbol (trigger branches) | none |
| 52 | NEEDS ISSUE | `.bkit/core/engine/commands/workflow/workflows.ts` | 25 | none | none |
| 66 | NEEDS ISSUE | `.bkit/core/engine/commands/install/upgrade.ts` | 26 | none | none |
| 72 | NEEDS ISSUE | `.bkit/core/engine/commands/setup/setup.ts` | 3 | none | none |
| 69 | NEEDS ISSUE | `.bkit/core/workflows/bkit-ship.md` | 51 | none | none |
| 73 | NEEDS ISSUE | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 15 | none | none |
| 111 | NEEDS ISSUE | `.bkit/core/workflows/bkit-debug.md` | 50 | none | none |
| 155 | NEEDS ISSUE | `.bkit/cloud.md` | 69 | none | none |
| 158 | NEEDS ISSUE | `.bkit/core/engine/commands/workflow/tracker.ts` | 2 | none | none |
| 95 | NEEDS ISSUE | `.bkit/core/workflows/` | 83 | none | none |
| 112 | NEEDS ISSUE | `.bkit/templates/.husky/pre-push` | 23 | 5 pre-push timeout / guard failures (different symbol: timeouts and the `[skip ci]` guard, not filter scope) | none |
| 150 | NEEDS ISSUE | `.bkit/core/hooks/` | 16 | none | none |
| 15 | KEEP | tracker fallback prose, `.bkit/core/workflows/` | 83 | none | none |
| 17 | KEEP | tracker read path | 83 | none | none |
| 21 | KEEP | phase-close path, `bkit-ship.md` | 51 | none | none |
| 14 | SMALL | tracker labels (outside repo) | n/a | none | none |
| 8 | SMALL | `.bkit/shared/.cursor/hooks.json` | 2 | none | none |
| 124, 174 | SMALL | `.bkit/core/engine/commands/workflow/status.ts` | 14 | none | none |
| 125, 12 | SMALL / ACCEPTED | `.bkit/core/engine/install/manifest.ts` | 30 | none | none |
| 132 | SMALL | `.bkit/core/engine/commands/workflow/decisions.ts` | 5 | none | none |
| 173 | SMALL | `.bkit/core/engine/commands/workflow/disk.ts` | 8 | `disk-prune-wait-test-flaky-under-load` (LOW, test timing) | none |
| 1 | ACCEPTED | `uninstall.ts` | 24 | none | none |
| 7 | ACCEPTED | `upgrade.ts` | 26 | none | none |
| 140-146 | ACCEPTED | non-goals, no code surface | n/a | none | none |

No row's risk is already an open failure row, so no pairing goes to `bkit-audit-failures`.

### Pointers

(a) TRACKED rows:

<!-- prettier-ignore -->
| Row | Issue | State | Criteria include the scope? | Fix |
| --- | --- | --- | --- | --- |
| 156 | #719 "Cloud variants: add --auto=codex and allow any tracker" https://github.com/cbartens/bkit/issues/719 | OPEN, updated 2026-11-01 | No. The acceptance criteria say "dispatches the configured agent jobs"; only the plan (`719-cloud-variants-add-plan.md:86,102,119`) and decision `719-cloud-router-dispatches-recorded-agent-only` say one job | Extend the criteria (deferrals-2) |
| 77 | #397 "bkit-cloud concurrency: global ship lock, FID arbitration" https://github.com/cbartens/bkit/issues/397 | OPEN, updated 2026-10-30 | No reconciler or eviction criterion found (keyword grep of the body) | NEEDS ISSUE as a sub-issue (deferrals-12) |

Staleness across `bkit-audit-issues` passes was not checked (`Not Checked`).

(b) Rows pointing at closed issues, checked against source this run: #341 (rows 15, 17, 19, 21, 69), #342 (14, 47), #381 (48, 54, 55, 97, 98, 100), #384 (66, 72, 73), #441 (50, 51), #442 / #405 (95), #58 (52), #650 (111), #653 (112), #700 (128, 131), #703 (132, 136), #705 (124, 125). The verdicts are in `Findings`. Scope that landed → DONE (55, 97, 128, 136). Scope dropped with a live gap → NEEDS ISSUE (48, 50, 51, 54, 66, 72, 98, 100, 111, 112).

(c) Comment-only deferrals: baseline, so there is no "since the previous report" window. A bounded sample covered the last 3 comments of 6 of the issues closed since 2026-10-26 (#796, #799, #798, #792, #788, #744). It found no deferred item without a row: #796's hit describes code that differs from the issue text, and #799's hit is a squashed follow-up commit. The other issues closed in that window were not read (`Not Checked`).

### Decisions

Who decides: the repository owner (`cbartens`).

1. **`create-security-github-label-for-injection-hardening` (line 14):** Should the repo get a `security` label? A) Create it by hand and tag future injection-hardening issues. B) Decline, and close the row. Recommended: B, because #342 closed without it and no open issue needs it.
2. **`tracker-read-path-corroboration-outside-mcp-private-repo` (line 17):** On a private repo, may a tracker read corroborate a zero-hit MCP search with a read-only `gh` probe? A) Admit a narrow read-only `gh` corroboration probe on private repos. B) Keep MCP-only reads with the "a 0 is inconclusive" rule. Recommended: B until a private-repo run reproduces the silent zero, because this repo is now public and the symptom cannot be re-tested here.
3. **`58-status-jsonl-run-boundary-keys-on-last-run-overall` (line 52):** A) Key `bkit workflows start`'s resume test on `lastRun(runs, workflow)` (`ledgers/status.ts:156`). B) Record that the feature lock makes the interleave impossible, and close the row. Recommended: A, because the helper already exists and the lock does not cover build and debug sharing one `status.jsonl`.
4. **`conditional-lens-vocabulary-alignment-across-workflow-and-audit` (line 95):** A) One shared vocabulary, retrofitted onto whichever surface is cheaper to change. B) Keep the two vocabularies and document the mapping. Recommended: B, since both surfaces shipped and a mapping costs one doc table.
5. **`653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (line 112):** A) Scope pre-push lint and typecheck to the CI push base. B) Run them whole-repo locally. Recommended: A, because the pre-push hook already resolves the CI push base for slop (`pre-push:195`).
6. **ACCEPTED rows (deferrals-17, deferrals-25):** lines 1, 7, 12, 140, 141, 142, 143, 144, 145 and 146. A) Sign off, and append the 10 `CLOSED` rows. B) Keep any of them open with a named trigger. Recommended: A for the seven #715 non-goals. For lines 1, 7 and 12, the owner judges whether the idea still has value.

### Checked

- **Fold and defects (Steps 3-4):** all 177 lines and 170 keys, at `HEAD` (`git show HEAD:docs/deferrals.jsonl | jq`).
- **Source (Step 5):** 49 open rows. 28 of the 29 `MEDIUM` rows (all except line 123), plus `LOW` lines 1, 4, 7, 8, 12, 124, 125, 128, 131, 132, 136, 140-146, 173, 174 and 175.
- **KEEP verdicts (verified rows with a live, unfired trigger; recorded here because they need no action):**
  - Line 15 `shell-native-mcp-cli-bridge-real-exit-codes`. Trigger: "if the prose fallback ... proves insufficient in practice, or if the fallback path needs to be regression-tested outside a live agent session". The tracker verbs still answer exit 80 = "do this through MCP instead" (`bkit issues --help`), and no bridge exists.
  - Line 17 `tracker-read-path-corroboration-outside-mcp-private-repo`. Trigger: a private-repo run reproduces the silent zero. Also in `Decisions`.
  - Line 21 `uniform-pr-based-phase-close-all-runtimes`. Trigger: "a second D1-class incident". This run found none in the open `docs/failures.jsonl` rows. This is the row's first KEEP.
  - Line 84 `363-main-branch-trigger-excluded-reversal`. Trigger: "a bkit-authored dev->main promotion workflow exists". `.bkit/templates/.github/workflows/` holds only `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-health.yml`, `bkit-renovate.yml` and `bkit-trivy.yml` (`git ls-tree`).
- **Clusters (by `category` and source issue):** host-guard / egress, 6 verified rows (deferrals-1, -3, -11) → one `own-cycle` issue. Live verification, 5 rows (deferrals-9) → one issue. Unverified groups of 3 or more that point at open issues and are TRACKED candidates for the next run: `504-*` (9 rows, #504 open) and `402-*` (6 rows, #402 open).
- **Reasons (Step 6):** every verified row. Lifted blockers: lines 50 and 54. Fired triggers: line 69 ("Before merge"), line 95 ("before both surfaces ship") and line 7 ("post-v2.0.0"). `scope-declared` rows without a doc §: deferrals-20.
- **Cost (Step 7):** every surviving verified row.
- **Pointers (Step 8):** #397 and #719 criteria; closed-issue pointers for the verified rows; a bounded comment sample.
- **Standards (Step 10) and Beyond (Step 11):** below.

### Not Checked

- **71 of 120 open rows were not verified against source**, and no verdict was given. Each needs a source pass next run: `341-mode-tuned-subagent-fanout-concurrency-pacing`, `341-periodic-transport-fallback-frequency-analysis`, `363-dev-dispatch-cap-self-resettable-by-controlled-principal`, `381-cursor-hook-ask-rate-signal`, `381-unified-runtime-allowlist-artifact-all-hosts`, `384-merge-queue-unavailable-private-non-enterprise`, `384-promote-status-hole-detector-from-advisory-to-gate`, `384-ship-without-a-writable-branch-checkout-outside-b2`, `397-external-cross-runner-lock-primitive-ref-or-label-cas`, `397-router-executor-split-as-shared-dispatch-primitive`, `402-api-contract-lens-still-deferred`, `402-audit-token-skill-seed-set-authoring`, `402-caching-correctness-half-uncovered`, `402-rate-limiting-lens-still-deferred`, `402-second-correlation-rule-derived-divergence-candidate`, `402-severity-class-matrix-subclass-axis-at-18-lenses`, `442-design-ideate-lens-predicates`, `442-plan-complexity-check-predicate`, `442-plan-template-design-missing-fallback-amendment`, `504-additional-example-apps`, `504-before-vs-after-bkit`, `504-external-suite-comparison`, `504-how-this-was-built-panel`, `504-local-diff-input`, `504-run-replay-viewer`, `504-second-example-extending-existing-code`, `504-time-saved-calculator`, `504-your-repo-report`, `546-issues-jsonl-feature-rows-join-brain`, `546-retire-brain-stubs-and-legacy-ledger-alias`, `58-counter-row-countername-value-pairing-unverified`, `58-debug-run-tests-parentsha-advances-only-transitively`, `639-refused-ship-failed-record-lost-in-cloud-container`, `650-bkit-auto-issue-less`, `650-issue-less-fid-continuity`, `650-preflight-linear-issue-less`, `699-completeness-check-excludes-bkit-auto-router`, `699-completeness-verdict-no-success-axis`, `699-engine-run-completeness-friction-recurrence-parallel-race`, `699-friction-key-truncation-class-fix`, `700-first-action-deny-gate`, `700-provider-auto-load-rules`, `700-rules-content-hash-acknowledgement`, `700-session-start-nudge-challenge-low-bkit-core-hooks-antigravity-hook-js-63`, `700-session-start-nudge-challenge-low-bkit-core-hooks-preflight-rules-sh-6`, `701-design-workflow-reviewer-audit`, `701-plan-current-classification-stays-in-prompt`, `701-sweep-deliverable-verification-stays-in-prompt`, `701-verify-diff-reads-stay-in-prompt`, `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-50`, `703-standardise-question-option-challenge-low-bkit-core-engine-audits-workflows-question-option-format-test-ts-55`, `703-standardise-question-option-challenge-low-bkit-core-engine-commands-workflow-steps-ts-463`, `705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279`, `705-build-plan-convert-challenge-low-bkit-core-workflows-bkit-build-md-415`, `715-retire-lite-workflows-challenge-low-bkit-core-engine-audits-workflows-ship-verdict-integration-test-ts-302`, `715-retire-lite-workflows-challenge-low-bkit-core-engine-commands-workflow-disk-ts-559`, `719-runner-tracker-mcp-fallback`, `724-gate-templates-pass-test-workers`, `724-timeout-budget-and-ci-serialisation-unchanged`, `724-upstream-consumer-load-gate`, `748-names-outside-the-branding-rule`, `748-rename-unprefixed-template-script-files`, `ledger-envelope-workflow-field-not-universal`, `pending-bar-155-deferred-focused-brief-mode-for-bkit-build-challe`, `pending-bkit-repo-own-renovate-local-json5-parallel-update-if-reno`, `pending-ci-lint-guarding-against-agents-scripts-agents-template`, `pending-cursor-v1-keyed-object-schema-deeper-validation-if-task-0a-s`, `pending-per-pr-opt-in-alternative-to-bkit-auto-route-linear-label`, `pending-router-dead-letter-retry-policy-if-claude-code-action-v1`, `pending-three-way-merge-ui-for-bkit-upgrade-conflicts`, `pending-tighter-per-paid-endpoint-soak-iteration-cap-for-debug-mode`.
- **`699-friction-key-truncation-class-fix` (line 123, MEDIUM):** the ~68-char truncation site was not located. `scripts/harvest/ledgers.ts:16-17` now gates the prune on byte-for-byte content rather than identity, which suggests the destroyed-loser symptom is gone, but that is a hypothesis without a located truncation, so no verdict was given.
- **Line 47 gate coverage:** the untrusted-input clause is in both agent files, but whether the injection-coverage test globs `.claude/agents/utility-*.md` was not checked.
- **Line 55 doc tables:** the Models tables in `.bkit/prompts.md` and `.bkit/providers.md` were not compared against the registry.
- **#397 acceptance criteria:** read by keyword grep and the body's first 1,500 characters, not in full.
- **Issue staleness:** whether TRACKED issues sat at `Low` across 3 or more `bkit-audit-issues` passes was not checked.
- **Step 8(c):** of the issues closed since 2026-10-26 (`gh issue list --state closed --search 'closed:>=2026-10-26' --limit 50` returned 50, so the list may be capped), only the last 3 comments of 6 were read.
- **Tracker reads through MCP:** the GitHub MCP here has no issue-read tool, so issue state, bodies and comments came from `direnv exec . gh issue view` / `gh issue list` / `gh label list`, not from MCP.
- **ITIL 4:** the AXELOS ITIL 4 Problem Management practice guide was not read. Only secondary sources were (the Micro Focus "Review deferred problems" page, quoted; an InvGate / study-guide summary via `WebSearch`). The ITIL version stays unread.
- **Churn:** counted without `--follow`, so surfaces moved from `.bkit/src/` undercount.
- **Shared checkout:** `git status --short` before the report gate listed ` M docs/templates/bkit-audit-failures.md`, a file this run did not write. It was changed by another writer and was audited at `HEAD` only (it is outside this audit's surface). The caller's note named `docs/plans/202610/logs/715-retire-lite-workflows/status.jsonl` as modified, but at this run's first `git status --short` that path was already clean. All sources were read at `HEAD` `67a6e07e1`.

### Standards Coverage

Versions read on 2026-11-02: Fowler "TechnicalDebt" (dated 21 May 2019), Fowler "TechnicalDebtQuadrant" (dated 14 October 2009), the CodeScene hotspots guide (no version on the page), the Micro Focus ITSMA 2018.02 "Review deferred problems" page, ITIL 4 (practice guide unread), and `.bkit/jsonl.md` § Deferral Reason at bkit 6.0.0. Baseline: no earlier version to diff against.

<!-- prettier-ignore -->
| Practice / value | Status | Note |
| --- | --- | --- |
| Principal and interest (Fowler: "The extra effort that it takes to add new features is the interest paid on the debt") | Checked, Step 7 | Interest proxy = 90-day churn on each surface. Principal is in each row's `remediation` |
| Technical Debt Quadrant (prudent / reckless × deliberate / inadvertent) | Finding, Step 9 | The register holds non-debt: 7 #715 non-goal rows with no remediation (deferrals-25). Adopt: a writer-side rule that a deferral carries a `remediation` (`Process Improvements`) |
| Hotspots (CodeScene: "identify those modules where you spend most of your development time") | Checked, Step 7, churn half only | Code-health scoring is not applied. Reject for now: no code-health tool is wired in this repo, and churn plus related failures already drives the raise rule |
| Review triggers for deferred records (Micro Focus: "deferred again, reassigned for further investigation, or closed") | Checked, Steps 6 and 9 | Maps to KEEP / NEEDS ISSUE / CLOSED. Adopt: a recurring run per ship cycle; this is the first run, so no cadence held before |
| `scope-declared` | Finding, Step 6 | 5 rows lack the required doc § `references` (deferrals-20) |
| `hard-blocked` | Finding, Step 6 | 2 blockers lifted (deferrals-1, -3); the other verified blockers (lines 69, 73, 111, 155) still need live runs |
| `needs-decision` | Checked, Step 6 | `docs/decisions.jsonl` has no decision for lines 47, 52 or 95; line 95's "decide before" trigger fired (deferrals-13) |
| `own-cycle` | Checked, Step 6 | No plan or open issue for lines 51, 66, 98 or 100 → NEEDS ISSUE; line 97 DONE |
| `low-severity` | Checked, Step 6 | The verified challenge rows are still `LOW`; 2 are DONE (128, 175) |
| `unjustified` | Checked, Step 9 | The single row (136) is DONE. No new row met all four tests: the verified `scope-declared` rows either name new architecture (test 1) or cite a pre-existing doc section (test 4) |

### Beyond the Steps

(a) Changes touching deferrals (baseline, so this covers the last 30 days at `HEAD`):

- `.bkit/core/.bkit/jsonl.md`: 8 commits (`8f2c66b40`, `79b96cfcb`, `f1ae6fd08`, `ade710750`, `99baaa0b3`, `3107d10ac`, `f9789e64a`, `abda6278e`). Verdict: the deferral schema is unchanged in what this audit reads (`reason` enum, `status` ladder, `firstTs` stamping).
- `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: 5 commits, all #747 authoring rewrites. Verdict: wording-only by subject; the sweep's verdict contract was not re-read.
- `bkit challenge merge` (`.bkit/core/engine/commands/workflow/challenge.ts:418-429`): writes `LOW` rows with no `status` and a fixed `category: "correctness"`. Verdict: schema-legal, but it produces the 17 status-less open rows, and every challenge finding lands in one category, which weakens the cluster rule.
- Issues the rows point at: 13 closed issues still carry open rows (see `Pointers` (b)).

(b) What a senior EM owning a debt register would flag:

- **The register is mostly unreviewed:** 47 open rows are 90-179 days old and no deferrals audit ran before today. Outflow is bursty (46 of 50 closes in 2026-10).
- **Non-goals are logged as deferrals:** #715 wrote 7 "X stays unchanged" rows with no `remediation`, and #724 wrote 1. They inflate the open count and age without carrying debt.
- **Hand-typed timestamps and a zero `firstTs` reached the live ledger:** `validate()` lets `firstTs: 0` through, and § Write Idiom's whole-second check did not stop the earlier literal rows. That is a ledger-tooling bug, recommended for `docs/failures.jsonl` (this run does not write ledger rows for this template).
- **Security debt hides at MEDIUM:** both security-category lifted blockers were MEDIUM in the ledger. No row in the ledger is `HIGH`, so severity triage at write time is not happening.

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| 1 | Close the Codex and OpenCode guard gaps: deny key reads on Codex, host-parse OpenCode curl/wget, revoke dropped grants, and echo the cloud allowlist fingerprint | deferrals-1, deferrals-3, deferrals-11 | HIGH | /bkit-design | Six rows across three hosts with an open plugin-contract choice for OpenCode |
| 2 | Add "a run starts only the job `bkit.cloud.agent` names" to #719's acceptance criteria, and point the row at plan Task 8 | deferrals-2 | HIGH | manual | The fix is a tracker edit to an existing issue |
| 3 | Append the `reason` repairs and the MEDIUM close rows this report lists | deferrals-4, deferrals-5, deferrals-7 | MEDIUM | /bkit-build | The exact rows are written out in `Defects` and `Findings`, for `@bkit-utility-update-deferrals` to append |
| 4 | Repair the zero `firstTs` entry and make ledger validation refuse `firstTs: 0` | deferrals-14 | MEDIUM | /bkit-debug | How `0` reached the live ledger is unknown |
| 5 | Run the live verification pass: cloud mode-3 close and bookkeeping, debug dev-CI round trip, Codex Cloud hook probe, Linear and Jira router reads | deferrals-9 | MEDIUM | manual | Each run needs a cloud session, live tracker keys or a human-confirmed push |
| 6 | Give shipped workflow changes a rollback path, and decide required checks on `dev` | deferrals-10 | MEDIUM | /bkit-design | Pin versus revert, and the `dev`-unprotected stance, are open |
| 7 | Key `bkit workflows start`'s resume test on the last run of the same workflow | deferrals-8 | MEDIUM | /bkit-design | The owner's run-boundary decision is still missing |
| 8 | Map the workflow `step-skipped` and audit coverage vocabularies onto one set of names | deferrals-13 | MEDIUM | /bkit-design | Unify versus document a mapping is open |
| 9 | Scope pre-push lint and typecheck to the CI push base, or run them whole-repo | deferrals-15 | MEDIUM | /bkit-design | The A/B choice the row names is open |
| 10 | Add a ship-lane reconciler for depth-1 queue eviction as a sub-issue of #397 | deferrals-12 | MEDIUM | /bkit-plan | The row's remediation already settles the approach |
| 11 | Route raw test-runner commands through the tests lock with a per-host hook | deferrals-16 | MEDIUM | /bkit-design | Host parity and the light-run exemption are open |
| 12 | Create a `security` label or close its row | deferrals-6 | MEDIUM | manual | The change is a tracker label |
| 13 | Fix the small LOW items and append the LOW close, accept and correction rows | deferrals-17, deferrals-18, deferrals-19, deferrals-20, deferrals-21, deferrals-22, deferrals-23, deferrals-24, deferrals-25 | LOW | /bkit-build | Each fix and row is named with its file and line |

### Process Improvements

- **Universal** (proposed template step changes; the template is untouched):
  - Step 3 and Pre-Flight `Run Stats`: replace `deferralsAdded` with `ledgers.deferrals.added`, the field the `outcome` row carries (`.bkit/jsonl.md` § Per-Kind Fields). No row has `deferralsAdded`.
  - Step 4: add three defect rows. `firstTs` of `0` or later than `ts` is sticky, because § Compaction keeps the earliest value, so it needs an owner fix rather than a correction row. `type` outside `issue` / `feature` is the second. A `ts` that is a whole second or a round literal is the third (§ Write Idiom).
  - Verdicts / Suggested Issues: say where a `MEDIUM`+ KEEP row goes, since it needs no issue but "every `MEDIUM`+ finding" must sit in a row. This run recorded KEEP rows in `Checked`.
  - Step 5: add a rotation rule for large open sets, for example "verify every `MEDIUM`+ row and the newest `LOW` batch, record the verified keys, and start the next run at the first unverified key", so a partial pass resumes where the last one stopped.
  - Watch item for a new verdict (seen once): non-goal rows ("X stays unchanged", no `remediation`) are neither debt nor ACCEPTED work. **If** this recurs next run → propose a `NON-GOAL` verdict, plus a writer rule that a deferral carries a `remediation`.
- **Project** (applied below `<!-- bkit:end -->` in `docs/templates/bkit-audit-deferrals.md`): added `Project Instructions` entries for the HEAD fold command, the issue-read fallback (`gh issue view`, since this runtime's GitHub MCP has no issue-read tool), the LOW-row writer location, the host-guard surfaces, the inflow field path, and `Permissions`.

### 🔒 Gate 3: Report Check

- [x] **No placeholders:** no `PENDING` is left.
- [x] **Summary:** `Summary` gives the count per severity.
- [x] **Verdict counts:** `Summary` gives the count per verdict.
- [x] **Coverage:** `Summary` gives rows verified / rows open.
- [x] **Series:** the report shows `Trend` open count, inflow, and outflow beside the previous report's numbers, or marks the run as baseline.
- [x] **Writes:** this run changed only this report and the template's `Project Instructions`.
- [x] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [x] **Process Improvements:** `Universal` and `Project` are both filled.
- [x] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [x] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [x] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->
