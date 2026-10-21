<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Gate Candidates

> [!CAUTION]
> **Purpose:** Ranking of which detective audit sweeps can become preventive gates, in what order, and which must stay audits.
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
> - never build, wire, or land a gate; never edit workflows, hooks, allowlists, or gate scripts.
> - NEVER weaken an existing gate — no skip, rule downgrade, lowered floor, or broader ignore — so a candidate looks adoptable.

## Universal Instructions

### Context & Goals

Maintenance sweeps find breakage; none prevent the next. Sibling audits repeat “make it a gate”; an unscheduled sweep is not a control, even when the sweep is the stated prevention. Converting checks costs: day-one red on unencoded noise → gate disabled; wrong altitude (one rule where the class needs a guard per case) → reverted. This pass ranks candidates; it does not build gates. **Stays an audit** is a valid verdict.

**Applies when:** at least one detective audit exists, and a CI job, hook, or test could block a class before merge. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when a sibling audit's `Process Improvements` proposes a new gate, or `bkit-audit-failures` names a recurring root-cause class as a gate candidate.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Fitness functions (e.g. Ford, Parsons, Kua, and Sadalage, _Building Evolutionary Architectures_, 2nd ed.).
- Static-analysis review bar (e.g. Tricorder: under 10% effective false positives, and an actionable message; Sadowski et al., Communications of the ACM, 2018).
- Quality gates on new code (e.g. SonarQube Clean as You Code).
- Ratchet and baseline tools (e.g. Betterer; reviewdog `filter_mode: added`).
- Policy as code (e.g. Conftest / OPA; JSON Schema).
- Required status checks and a merge queue (e.g. GitHub rulesets).
- OpenSSF Scorecard checks, at the Scorecard version read.
- DORA continuous integration capability.
- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § CI test tiers (the bkit scaffold); § Accepted divergences; § Step names say whether a red is real; § Composite actions: two rules that fail silently
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Commit-message force tags; § Workflow-file limits GitHub does not enforce visibly; § Ship gate + bookkeeping
- bkit block of `docs/design.md` (bkit version from `.bkit/version`): § Machine-checked reference

### Scope

- Candidates from sibling audits, repeat defects, and standard gates nobody proposed.
- Score, disqualify, tier, moment, enforcement point, positive control, and report-only bar.
- Health of gates that already landed.
- Allowlist and ratchet-baseline expiry.
- Re-review of gates that were reverted or rejected.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Running a sibling sweep, or clearing what it found | That audit | source `bkit-audit-*` |
| Building, wiring, or landing a gate, including workflow and allowlist edits | Audit reports only | Plan from this report |

### Verdicts

One per candidate.

- **ADOPT:** passes every `Score` axis and no `Disqualify` item holds. Its rank sets its place in the order. The report names the tracker issue to open and the `docs/decisions.jsonl` row to append. Opening and appending are the next step.
- **REJECT:** fails a `Score` axis, or a `Disqualify` item holds. It stays an audit. Record why, so a later run can see when the reason stops holding.
- **OTHER:** fits neither (waiting on a decision or a tool). Say why, and what would settle it. The next run resolves it to ADOPT or REJECT. The same OTHER on 2 runs → propose a new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Sibling Reports:** Steps 2, 3 — newest report per other `bkit-audit-*` slug under `docs/audits/`, else that template's `Process Improvements`. Fallback: templates only; a missing report = that audit `Not Checked`.
- [ ] **Ledgers:** Steps 3, 10, 11 — `docs/failures.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`. Fallback: incident evidence and prior rejections `Not Checked`.
- [ ] **Repo Gates:** Steps 7, 9, 12, 13, 15 — workflows, hook directory, gate scripts, allowlist files, e.g. `.github/workflows`, `.husky`, `.gitlab-ci.yml`, every `bkit:gate:*` script in `package.json`. Fallback: none; those items `Not Checked`.
- [ ] **Web:** Step 14 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Ruleset Read:** Host exposes branch rules → Step 7 — required checks and bypass actors, e.g. `gh api` rulesets, GitLab protected branches. Fallback: workflow and hook files only; bypass actors `Not Checked`.
- [ ] **Run History:** A gate has already landed → Step 12 — how often it fired, e.g. `gh run list`, CI analytics. Fallback: code reading only; fire rate `Not Checked`.
- [ ] **Scorecard:** Repo is public, or a token is present → Steps 3, 14 — e.g. `scorecard`. Fallback: read the check list; live score `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** Collect gate candidates from each other `bkit-audit-*` report's `Process Improvements` (else that template's), without re-deriving. Record source slug. Two audits proposing one guard = one candidate, both sources — not two work items. Re-grep of a swept class + owner-allowlist over same literals = one guard. **Done when:** `Inventory` row per candidate: source slug · one-line guard.
- [ ] **Step 3 — Widen:** Sibling sections are one source. Also add, record source each: (a) every defect class in `docs/failures.jsonl` on ≥2 rows, whether or not a sibling proposed a gate; (b) standard gates nobody proposed, each vs tree — secret-scanning push protection, code scanning (e.g. CodeQL), dependency-review check, workflow linters (e.g. `actionlint`, `zizmor`), lockfile lint, test-runner forbid-only flag (e.g. Playwright `--forbid-only`), typechecking of test files, OpenSSF Scorecard checks; (c) policy-as-code for config with no type system (e.g. JSON Schema, Conftest) — bot config, job-runner triggers and concurrency, hosting config, mobile build config, workflow YAML. Class (c) is what `bkit-audit-testing` flags. Already enforced → `Health`, not a second candidate. **Done when:** every added row in `Inventory` with source.
- [ ] **Step 4 — Score:** Per candidate, six axes. Fails if fail condition holds.
  - **Determinism.** Can a machine decide pass/fail with no judgement? Fails if the verdict needs someone to read intent.
  - **False-positive class.** Empty, a fixed allowlist, or structural? Fails if structural and unencoded.
  - **Incident evidence.** Has this class shipped a defect here? Fails if purely theoretical.
  - **Home lane.** Does a lane already exist to run it? Fails if it needs new infrastructure or an unavailable tool.
  - **Cost.** Runtime per change + developer wait and upkeep (baseline maintenance, version bumps). Fails if slower than the value it returns.
  - **Actionability.** Does failure say what to change and where (`file:line` plus fix)? Fails if developer must investigate. Deterministic but cryptic gate is bypassed as fast as a noisy one.

  Rank by incident evidence × determinism ÷ effort. Prefer candidate with real incident over merely tidy. **Done when:** `Scores` holds six answers, rank, and fail axes.

- [ ] **Step 5 — Disqualify:** Candidate stays audit if any hold:
  1. **Judgement is the task.** Examples: log line that is bug or handled outcome; deferral that may still be live (`bkit-audit-deferrals`); duplication or two deliberately different decisions (`bkit-audit-duplication`). No gate decides these.
  2. **The false-positive class is structural and unencoded.** Gate only after exclusions committed as config. Default sequence, per `bkit-audit-dead-code`: clear findings → commit baseline → wire lane. Where clearing is >1 PR, ratchet (`Sequence`) may wire lane first: committed baseline holds existing findings; gate enforces on new ones.
  3. **The tool cannot run in CI.** Local-only graph tool with no CI provisioning (e.g. graphify) blocks graph-derived gate until that changes or check is reimplemented without it.

  **Done when:** each holding disqualifier named in `Scores`.

- [ ] **Step 6 — Tier:** Lowest tier that can see the defect. Pushing check down a tier → faster, earlier, less flaky. Rule that can be unit test should never be end-to-end spec. Ratchet (`Sequence`) at any tier; changes what gate compares against, not where it runs.
  - **Unit / contract test.** Rule computable from source constants. Example: contrast over a palette.
  - **Static.** Signature is a literal. Example: env reachability, swept-class re-grep, migration hygiene.
  - **Migration lane.** Truth in database catalogue. Example: row-level coverage, definer-rights grants.
  - **Integration.** Needs real database and real request. Example: cross-tenant rejection.
  - **End-to-end.** Needs rendered page. Example: contrast and target size in situ.
  - **Scheduled.** Depends on external service. Example: model-id resolution against live catalogue.

  Then moment, separate from tier: editor or language server, pre-commit, pre-push, pull request, merge queue, post-merge, or scheduled. Cheap deterministic check → as early as it can run. Slow or flaky → merge queue or scheduled. **Done when:** `Tiers` holds tier and moment per candidate.

- [ ] **Step 7 — Enforcement:** Where integration branch accepts direct push, CI check on that branch reds after code landed: detective, not preventive. Per candidate: required status check on integration and release branch? who bypasses? is only preventive point a pre-push hook a verify-skip flag skips? Ranking says so when only preventive point can be bypassed. **Done when:** `Enforcement` row per candidate: branch · required? · bypass · preventive point.
- [ ] **Step 8 — Positive Control:** Gate that passes because it measures nothing is worse than no gate — it stops anyone looking. Control every new gate meets: put defect back, watch it red. This run does not build the gate; report states that control. Gate with no proven-red demonstration is not finished. Related cheap checks: unmatched browser-test locator can be passing assertion; row-level denial can be silent zero rows, indistinguishable from empty table (`bkit-audit-database`). Skip = hollow pass. Required job skipped by job-level condition reports success. Workflow skipped by path filter, branch filter, or skip-CI marker leaves required check pending. Per candidate: skip behaviour; how skip is kept from standing in for pass. If proven-red is convention for gate change, not merge requirement → propose in `Process Improvements`. **Done when:** `Controls` states positive control and skip behaviour per candidate.
- [ ] **Step 9 — Sequence:** Each candidate: report-only ≥1 full cycle, then enforcing. This run does not land gate. Read current tree, fix or allowlist findings, flip enforcing. Name candidates that would red if enforced cold. Report-only ends when gate meets stated bar, not just when cycle passed. Per candidate, bar: minimum runs; effective false-positive rate under 10% (findings judged not real problem ÷ all findings); no unexplained reds; no flakes of its own; added p90 runtime under stated budget. Name one enforcement tier. **Clear-then-gate** default: fix or allowlist every existing finding, then enforce on all. **Ratchet** (new violations only) when clearing existing findings is >1 PR: gate fails only on findings not in committed baseline (guard baseline file, or tool's own, e.g. Betterer results file, reviewdog added-only mode). Baseline may only shrink; each entry names owner. Allowlist per-offender, keyed to identity — never rule downgrade or route exclusion. Every entry cites owner; no owner and no date = permanent exemption. Ratchet baseline same contract; never grows. **Done when:** `Sequence` names bar and tier per candidate.
- [ ] **Step 10 — Decision:** Any workflow change needs explicit human confirmation. Propose, do not edit. Rule forbidding weakening gate applies to new one: bar for adding is that what it catches will be fixed. Record ADOPT, REJECT, or OTHER, including `docs/decisions.jsonl` row to append for ADOPT and REJECT. Appending is next step. Rejection whose reason later stops holding must stay findable. **Done when:** every candidate in `Scores` has verdict and row text, or OTHER with what settles it; verdict counts (proposed, ADOPT, REJECT, OTHER, reverted) in `Scores`.
- [ ] **Step 11 — Re-Review:** Gate built and reverted is not settled. Re-read each rejection in `docs/decisions.jsonl` and prior reports; check whether reasoning still holds. Two decisions on one guard, neither retired → criterion cannot be judged = finding. Reasoning no longer holds → score again into `Scores`, with `docs/decisions.jsonl` row that would retire old decision. **Done when:** `Rejections` row per reverted or rejected gate: still holds?
- [ ] **Step 12 — Health:** Per landed gate, since previous report: fire rate, true-positive rate, overrides/bypasses, own flakes, runtime. Never fired = perfectly preventive or hollow — indistinguishable outside; fresh positive control (`Positive Control`) tells apart. Never fired or hollow → name that control as next step. Every `bkit:gate:*` script in `package.json` = landed gate; workflows, agents, pre-push run only these → expand each (follow every nested `pnpm <script>` to its body) → list each command. Hollow → `CRITICAL`: script missing, empty, or runs nothing that can fail (e.g. `echo`, `true`, `|| exit 0`); command exits 0 when its tool absent (e.g. `command -v … || echo skipping`) = that check hollow → name tool and install step. **Done when:** `Health` row per landed gate, or none landed; each `bkit:gate:*` row lists every command and which can skip.
- [ ] **Step 13 — Allowlists:** Every allowlist entry (known-offender maps, ratchet baseline, dead-code ignores) past date or with cited issue closed. Each lapsed = finding: renew with reason, or fix offender. Per ratchet baseline, compare entry count vs previous report: grew, or entry with no owner = finding. **Done when:** `Allowlists` lists every lapsed, grown, or ownerless entry, or `none`.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor practice (fitness functions, static-analysis false-positive bar, new-code gating, ratchets, policy as code, rulesets and merge queue, DORA CI capability) and per OpenSSF Scorecard check → checked (name step) / not applicable (why) / finding. Per bkit anchor (doc section, rule, or issue shape): one row → followed (name step or evidence) / not applicable (why) / finding; departure with no recorded reason (e.g. `docs/decisions.jsonl` row, accepted-divergence entry) = finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching gating (guards and contract tests, hook directory, gate scripts, workflow jobs, rulesets and branch protection, allowlists) → one-line verdict each. (b) Bounded ~30 min pass: what senior build and developer-productivity engineer flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Sources read:** every candidate cites the section it came from; a score off a sibling summary alone is not a score.
- [ ] **No gate landed:** no workflow, hook, allowlist, or gate script changed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Ungated class is data loss, a security hole, or a broken workflow with no workaround; a required check that reports success when skipped or when it measured nothing |
| `HIGH` | Class that has shipped real damage and still has a workaround; a landed gate that has never fired and has no positive control; structural false positives with no committed baseline |
| `MEDIUM` | Repeat defect class with a home lane and no gate; report-only candidate past its bar with no enforce-or-stay decision; allowlist entry past its date or with no owner |
| `LOW` | Candidate with no incident; OTHER waiting on a tool or a decision; gate-message wording that changes no pass/fail |

Scale per `.bkit/jsonl.md` § Severity. A candidate takes the severity of the class its gate would catch. Within a severity: higher `Score` first.

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

### Inventory

PENDING

### Scores

PENDING

### Tiers

PENDING

### Enforcement

PENDING

### Controls

PENDING

### Sequence

PENDING

### Rejections

PENDING

### Health

PENDING

### Allowlists

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
- [ ] **Summary:** names count per severity and per verdict (ADOPT / REJECT / OTHER).
- [ ] **Series:** verdict counts, `Health`, and allowlist sizes beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
