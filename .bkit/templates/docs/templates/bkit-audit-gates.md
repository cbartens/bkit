<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Gate Candidates

> [!CAUTION]
> **Purpose:** Ranking of which detective audit sweeps can become preventive gates, in what order, and which must stay audits.
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
> - NEVER build, wire, or land a gate; NEVER edit workflows, hooks, allowlists, or gate scripts.
> - NEVER weaken an existing gate — no skip, rule downgrade, lowered floor, or broader ignore — so a candidate looks adoptable.

## Universal Instructions

### Context & Goals

Every maintenance sweep finds what already broke. None of them stops the next one. Sibling audits keep proposing the same fix — make it a gate — and an unscheduled sweep is not a control, including where the sweep is the stated prevention. Converting a check is not free: a gate that reds on day one against unencoded noise gets disabled, and a gate at the wrong altitude (one rule, where the class needs a guard per case) gets reverted. This pass ranks candidates. It does not build the gate. Stays an audit is a valid verdict.

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

### Scope

- Candidates from sibling audits, from repeat defects, and from standard gates nobody proposed.
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

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Sibling Reports:** Steps 2, 3 — newest report per other `bkit-audit-*` slug under `docs/audits/`, else that template's `Process Improvements`. Fallback: templates only; a missing report = that audit `Not Checked`.
- [ ] **Ledgers:** Steps 3, 10, 11 — `docs/failures.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`. Fallback: incident evidence and prior rejections `Not Checked`.
- [ ] **Repo Gates:** Steps 7, 9, 12, 13, 15 — workflows, hook directory, gate scripts, allowlist files, e.g. `.github/workflows`, `.husky`, `.gitlab-ci.yml`. Fallback: none; those items `Not Checked`.
- [ ] **Web:** Step 14 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Ruleset Read:** Host exposes branch rules → Step 7 — required checks and bypass actors, e.g. `gh api` rulesets, GitLab protected branches. Fallback: workflow and hook files only; bypass actors `Not Checked`.
- [ ] **Run History:** A gate has already landed → Step 12 — how often it fired, e.g. `gh run list`, CI analytics. Fallback: code reading only; fire rate `Not Checked`.
- [ ] **Scorecard:** Repo is public, or a token is present → Steps 3, 14 — e.g. `scorecard`. Fallback: read the check list; live score `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Inventory:** Collect gate candidates from each other `bkit-audit-*` report's `Process Improvements` (else that template's), without re-deriving. Record the source slug. Two audits proposing one guard = one candidate and both sources, not two work items. A re-grep of a swept class and an owner-allowlist over the same literals are one guard. **Done when:** `Inventory` row per candidate: source slug · one-line guard.
- [ ] **Step 3 — Widen:** Sibling sections are one source. Also add, and record the source of each: (a) every defect class in `docs/failures.jsonl` seen on ≥2 rows, whether or not a sibling proposed a gate; (b) standard gates nobody proposed, each checked against the tree — secret-scanning push protection, code scanning (e.g. CodeQL), a dependency-review check, workflow linters (e.g. `actionlint`, `zizmor`), lockfile lint, a test-runner forbid-only flag (e.g. Playwright `--forbid-only`), typechecking of test files, and the OpenSSF Scorecard checks; (c) policy-as-code for configuration with no type system (e.g. JSON Schema, Conftest) — bot config, job-runner triggers and concurrency, hosting config, mobile build config, workflow YAML. The class (c) is the one `bkit-audit-testing` flags. Already enforced → `Health`, not a second candidate. **Done when:** every added row is in `Inventory` with its source.
- [ ] **Step 4 — Score:** Per candidate, six axes. Fails if the fail condition holds.
  - **Determinism.** Can a machine decide pass/fail with no judgement? Fails if the verdict needs someone to read intent.
  - **False-positive class.** Empty, a fixed allowlist, or structural? Fails if structural and unencoded.
  - **Incident evidence.** Has this class shipped a defect here? Fails if purely theoretical.
  - **Home lane.** Does a lane already exist to run it? Fails if it needs new infrastructure or an unavailable tool.
  - **Cost.** Runtime added per change, plus developer wait and upkeep (baseline maintenance, version bumps). Fails if slower than the value it returns.
  - **Actionability.** Does the failure say what to change and where (`file:line` plus the fix)? Fails if the developer must investigate to learn what to change. A deterministic but cryptic gate is bypassed as fast as a noisy one.

  Rank by incident evidence × determinism ÷ effort. Prefer a candidate with a real incident over one that is merely tidy. **Done when:** `Scores` holds the six answers, the rank, and the fail axes.

- [ ] **Step 5 — Disqualify:** A candidate stays an audit if any of these hold.
  1. **Judgement is the task.** Examples: a log line that is a bug or a handled outcome; a deferral that may still be live (`bkit-audit-deferrals`); duplication or two deliberately different decisions (`bkit-audit-duplication`). No gate can decide these.
  2. **The false-positive class is structural and unencoded.** Gate only after the exclusions are committed as config. Default sequence, per `bkit-audit-dead-code`: clear the findings → commit the baseline → wire the lane. Where clearing is more than one PR of work, a ratchet (`Sequence`) may wire the lane first: the committed baseline holds the existing findings, and the gate enforces on new ones.
  3. **The tool cannot run in CI.** A local-only graph tool with no CI provisioning (e.g. graphify) blocks any graph-derived gate until that changes or the check is reimplemented without it.

  **Done when:** each holding disqualifier is named in `Scores`.

- [ ] **Step 6 — Tier:** Lowest tier that can see the defect. Pushing a check down a tier makes it faster, earlier, and less flaky. A rule that can be a unit test should never be an end-to-end spec. A ratchet (`Sequence`) can run at any tier; it changes what the gate compares against, not where it runs.
  - **Unit / contract test.** The rule is computable from source constants. Example: contrast over a palette.
  - **Static.** The signature is a literal. Example: env reachability, a swept-class re-grep, migration hygiene.
  - **Migration lane.** The truth lives in the database catalogue. Example: row-level coverage, definer-rights grants.
  - **Integration.** Needs a real database and a real request. Example: cross-tenant rejection.
  - **End-to-end.** Needs a rendered page. Example: contrast and target size in situ.
  - **Scheduled.** Depends on an external service. Example: model-id resolution against a live catalogue.

  Then the moment, separately from the tier: editor or language server, pre-commit, pre-push, pull request, merge queue, post-merge, or scheduled. A cheap deterministic check belongs as early as it can run. A slow or flaky one belongs in a merge queue or a scheduled run. **Done when:** `Tiers` holds tier and moment per candidate.

- [ ] **Step 7 — Enforcement:** Where the integration branch accepts a direct push, a CI check on that branch reds after the code has landed: detective, not preventive. Per candidate, record whether it would be a required status check on the integration branch and on the release branch, who can bypass that rule, and whether the only preventive point is a pre-push hook a verify-skip flag skips. The ranking says so when the only preventive point can be bypassed. **Done when:** `Enforcement` row per candidate: branch · required? · bypass · preventive point.
- [ ] **Step 8 — Positive Control:** A gate that passes because it measures nothing is worse than no gate: it also stops anyone looking. The control every new gate meets: put the defect back and watch it red. This run does not build the gate. The report states that control. A gate with no proven-red demonstration is not finished. Related cheap checks: an unmatched browser-test locator can be a passing assertion; a row-level denial can surface as silent zero rows, indistinguishable from an empty table (`bkit-audit-database`). A skip is another hollow pass. A required job skipped by a job-level condition reports success. A workflow skipped by a path filter, a branch filter, or a skip-CI marker leaves its required check pending. Per candidate, state how it behaves when skipped, and how a skip is kept from standing in for a pass. If proven-red is only a convention for a gate change, and not a merge requirement, propose that in `Process Improvements`. **Done when:** `Controls` states the positive control and the skip behaviour per candidate.
- [ ] **Step 9 — Sequence:** Each candidate: report-only for at least one full cycle, then enforcing. This run does not land the gate. Read what it says about the current tree, fix, or allowlist what it finds, then flip it to enforcing. Name candidates that would red immediately if enforced cold. Report-only ends when the gate meets a stated bar, not just when a cycle has passed. Per candidate, name the bar: a minimum number of runs, an effective false-positive rate under 10% (findings judged not a real problem, divided by all findings), no unexplained reds, no flakes of its own, and an added p90 runtime under a stated budget. Name one enforcement tier. **Clear-then-gate** is the default: fix or allowlist every existing finding, then enforce on all of them. **Ratchet** (new violations only) is allowed when clearing the existing findings is more than one PR of work. The gate fails only on findings not in a committed baseline (a guard baseline file, or the tool's own, e.g. Betterer's results file, reviewdog added-only mode). The baseline may only shrink, and each entry names an owner. An allowlist is per-offender and keyed to identity, never a rule downgrade or a route exclusion. Every entry cites an owner. An allowlist with no owner and no date is a permanent exemption. A ratchet baseline is the same contract, and it never grows. **Done when:** `Sequence` names the bar and the tier per candidate.
- [ ] **Step 10 — Decision:** Any workflow change needs explicit human confirmation. Propose, do not edit. A rule that forbids weakening a gate applies to a new one: the bar for adding one is that what it catches will be fixed. Record ADOPT, REJECT, or OTHER, including the `docs/decisions.jsonl` row to append, for ADOPT and REJECT. Appending it is the next step. A rejection whose reason later stops holding must stay findable. **Done when:** every candidate in `Scores` has a verdict and row text, or OTHER with what settles it; verdict counts (proposed, ADOPT, REJECT, OTHER, reverted) are in `Scores`.
- [ ] **Step 11 — Re-Review:** A gate that was built and reverted is not settled. Re-read each rejection in `docs/decisions.jsonl` and in prior reports, and check whether the reasoning still holds. Two decisions on one guard, neither retired → that criterion cannot be judged = finding. Reasoning that no longer holds → score it again into `Scores`, with the `docs/decisions.jsonl` row that would retire the old decision. **Done when:** `Rejections` row per reverted or rejected gate: still holds?
- [ ] **Step 12 — Health:** Per gate that has landed, since the previous report: how often it fired, how many of those were true positives, the overrides or bypasses used, its own flakes, and its runtime. A gate that has never fired is either perfectly preventive or hollow, and the two look the same from outside; a fresh positive control (`Positive Control`) tells them apart. Never fired, or hollow → name that control as the next step. **Done when:** `Health` row per landed gate, or none landed.
- [ ] **Step 13 — Allowlists:** Every allowlist entry (known-offender maps, a ratchet baseline, dead-code ignores) whose date has passed or whose cited issue is closed. Each lapsed entry = finding: renew it with a reason, or fix the offender. Per ratchet baseline, compare its entry count with the previous report: a baseline that grew, or an entry with no owner, = finding. **Done when:** `Allowlists` lists every lapsed, grown, or ownerless entry, or `none`.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor practice (fitness functions, the static-analysis false-positive bar, new-code gating, ratchets, policy as code, rulesets, and merge queue, the DORA CI capability) and per OpenSSF Scorecard check → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching gating (guards and contract tests, the hook directory, gate scripts, workflow jobs, rulesets, and branch protection, allowlists) → one-line verdict each. (b) Bounded ~30 min pass: what a senior build and developer-productivity engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and per verdict (ADOPT / REJECT / OTHER).
- [ ] **Series:** verdict counts, `Health`, and allowlist sizes beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
