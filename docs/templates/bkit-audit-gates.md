<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Gate Candidates

> [!CAUTION]
> **Purpose:** A ranking of which detective audit sweeps can become preventive gates, in what order, and which must stay audits.
>
> **Rules:**
>
> - Never build, wire or land a gate.
> - Never edit workflows, hooks, allowlists or gate scripts.
> - NEVER weaken an existing gate so a candidate looks adoptable: no skip, rule downgrade, lowered floor or broader ignore.

## Universal Instructions

### Context & Goals

Maintenance sweeps find breakage, and none of them prevents the next one. Sibling audits keep saying "make it a gate", but an unscheduled sweep is not a control, even when the sweep is the stated prevention. Converting a check into a gate has costs. A gate that is red on day one from unencoded noise gets disabled. A gate at the wrong altitude, such as one rule where the class needs a guard per case, gets reverted. This pass ranks candidates and does not build gates. Staying an audit is a valid verdict.

**Applies when:** at least one detective audit exists, **and** a CI job, hook or test could block a class before merge. **If** not → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when a sibling audit's `Process Improvements` proposes a new gate, or when `bkit-audit-failures` names a recurring root-cause class as a gate candidate.

**Anchor Standards:**

- Fitness functions (e.g. Ford, Parsons, Kua, and Sadalage, _Building Evolutionary Architectures_, 2nd ed.).
- Static-analysis review bar (e.g. Tricorder: under 10% effective false positives, and an actionable message; Sadowski et al., Communications of the ACM, 2018).
- Quality gates on new code (e.g. SonarQube Clean as You Code).
- Ratchet and baseline tools (e.g. Betterer; reviewdog `filter_mode: added`).
- Policy as code (e.g. Conftest / OPA; JSON Schema).
- Required status checks and a merge queue (e.g. GitHub rulesets).
- OpenSSF Scorecard checks, at the Scorecard version read.
- DORA continuous integration capability.
- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § CI test tiers (the bkit scaffold); § Accepted divergences; § Step names say whether a red is real; § Composite actions: two rules that fail silently; § JUnit reports for bkit
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Commit-message force tags; § Workflow-file limits GitHub does not enforce visibly; § Ship gate + bookkeeping
- bkit block of `docs/design.md` (bkit version from `.bkit/version`): § Machine-checked reference

### Scope

- Collect candidates from sibling audits, repeat defects, and standard gates nobody proposed.
- Score each candidate, check its disqualifiers, and set its tier, moment, enforcement point, positive control and report-only bar.
- Check the health of gates that already landed.
- Check allowlist and ratchet-baseline expiry.
- Re-review gates that were reverted or rejected.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Running a sibling sweep, or clearing what it found | That audit covers it | source `bkit-audit-*` |
| Building, wiring, or landing a gate, including workflow and allowlist edits | The audit only reports | A plan made from this report |

### Verdicts

Give each candidate one verdict.

- **ADOPT:** the candidate passes every `Score` axis, and no `Disqualify` item holds. Its rank sets its place in the order. The report names the tracker issue to open and the `docs/decisions.jsonl` row to append. Opening and appending are the next step.
- **REJECT:** the candidate fails a `Score` axis, or a `Disqualify` item holds. It stays an audit. Record why, so a later run can see when the reason stops holding.
- **OTHER:** it fits no other verdict, because it waits on a decision or a tool. Say why, and what would settle it. The next run resolves it to ADOPT or REJECT. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Sibling Reports:** Steps 2, 3 — the newest report for each other `bkit-audit-*` slug under `docs/audits/`, or else that template's `Process Improvements`. Fallback: the templates only. A missing report marks that audit `Not Checked`.
- [ ] **Ledgers:** Steps 3, 10, 11 — `docs/failures.jsonl`, `docs/decisions.jsonl`, `docs/deferrals.jsonl`. Fallback: mark incident evidence and prior rejections `Not Checked`.
- [ ] **Repo Gates:** Steps 7, 9, 12, 13, 15 — workflows, the hook directory, gate scripts and allowlist files (e.g., `.github/workflows`, `.husky`, `.gitlab-ci.yml`, and every `bkit:gate:*` script in `package.json`). Fallback: none. Mark those items `Not Checked`.
- [ ] **Web:** Step 14 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Ruleset Read:** **If** the host exposes branch rules → Step 7 — required checks and bypass actors (e.g., `gh api` rulesets, GitLab protected branches). Fallback: the workflow and hook files only, and mark bypass actors `Not Checked`.
- [ ] **Run History:** **If** a gate has already landed → Step 12 — how often it fired (e.g., `gh run list`, CI analytics). Fallback: code reading only, and mark the fire rate `Not Checked`.
- [ ] **Scorecard:** **If** the repo is public **or** a token is present → Steps 3, 14 — e.g., `scorecard`. Fallback: read the check list, and mark the live score `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Inventory:** Collect the gate candidates from each other `bkit-audit-*` report's `Process Improvements` (or else that template's), without re-deriving them. Record the source slug. Two audits proposing one guard make one candidate with both sources, not two work items. A re-grep of a swept class and an owner-allowlist over the same literals are one guard. **Done when:** `Inventory` has a row per candidate: source slug · one-line guard.
- [ ] **Step 3 — Widen:** The sibling sections are one source. Also add the following, recording the source of each. (a) Every defect class on 2 or more rows in `docs/failures.jsonl`, whether or not a sibling proposed a gate. (b) Standard gates nobody proposed, each checked against the tree: secret-scanning push protection, code scanning (e.g., CodeQL), a dependency-review check, workflow linters (e.g., `actionlint`, `zizmor`), lockfile lint, the test runner's forbid-only flag (e.g., Playwright `--forbid-only`), typechecking of test files, and the OpenSSF Scorecard checks. (c) Policy as code for config with no type system (e.g., JSON Schema, Conftest): bot config, job-runner triggers and concurrency, hosting config, mobile build config, and workflow YAML. Class (c) is what `bkit-audit-testing` flags. **If** a gate is already enforced → it goes in `Health`, not in a second candidate. **Done when:** every added row is in `Inventory` with its source.
- [ ] **Step 4 — Score:** Score each candidate on six axes. It fails an axis when that axis's fail condition holds.
  - **Determinism.** Can a machine decide pass/fail with no judgement? Fails if the verdict needs someone to read intent.
  - **False-positive class.** Empty, a fixed allowlist, or structural? Fails if structural and unencoded.
  - **Incident evidence.** Has this class shipped a defect here? Fails if purely theoretical.
  - **Home lane.** Does a lane already exist to run it? Fails if it needs new infrastructure or an unavailable tool.
  - **Cost.** Runtime per change, plus developer wait and upkeep (baseline maintenance, version bumps). Fails if it costs more than the value it returns.
  - **Actionability.** Does a failure say what to change and where (`file:line` plus the fix)? Fails if the developer must investigate. A deterministic but cryptic gate is bypassed as fast as a noisy one.

  Rank by incident evidence x determinism ÷ effort. Prefer a candidate with a real incident over one that is merely tidy. **Done when:** `Scores` holds the six answers, the rank and the failed axes.

- [ ] **Step 5 — Disqualify:** A candidate stays an audit when any of these holds:
  1. **Judgement is the task.** Examples: whether a log line is a bug or a handled outcome; whether a deferral may still be live (`bkit-audit-deferrals`); whether code is duplication or two deliberately different decisions (`bkit-audit-duplication`). No gate decides these.
  2. **The false-positive class is structural and unencoded.** Gate it only after the exclusions are committed as config. The default sequence, as in `bkit-audit-dead-code`, is to clear the findings, commit the baseline, then wire the lane. **If** clearing takes more than one PR → a ratchet (`Sequence`) may wire the lane first: a committed baseline holds the existing findings, and the gate enforces on new ones.
  3. **The tool cannot run in CI.** A local-only graph tool with no CI provisioning (e.g., graphify) blocks a graph-derived gate until that changes, or until the check is reimplemented without it.

  **Done when:** `Scores` names each disqualifier that holds.

- [ ] **Step 6 — Tier:** Pick the lowest tier that can see the defect. Pushing a check down a tier makes it faster, earlier and less flaky, so a rule that can be a unit test should never be an end-to-end spec. A ratchet (`Sequence`) works at any tier, because it changes what the gate compares against, not where it runs.
  - **Unit / contract test.** Rule computable from source constants. Example: contrast over a palette.
  - **Static.** Signature is a literal. Example: env reachability, swept-class re-grep, migration hygiene.
  - **Migration lane.** Truth in database catalogue. Example: row-level coverage, definer-rights grants.
  - **Integration.** Needs real database and real request. Example: cross-tenant rejection.
  - **End-to-end.** Needs rendered page. Example: contrast and target size in situ.
  - **Scheduled.** Depends on external service. Example: model-id resolution against live catalogue.

  Then pick the moment, separately from the tier: the editor or language server, pre-commit, pre-push, pull request, merge queue, post-merge, or scheduled. Run a cheap deterministic check as early as it can run. Put a slow or flaky one in the merge queue or on a schedule. **Done when:** `Tiers` holds the tier and the moment per candidate.

- [ ] **Step 7 — Enforcement:** **If** the integration branch accepts direct pushes → a CI check on that branch goes red after the code has landed, so it is detective, not preventive. For each candidate, record whether it is a required status check on the integration and release branches, who can bypass it, and whether the only preventive point is a pre-push hook that a verify-skip flag skips. **If** the only preventive point can be bypassed → the ranking says so. **Done when:** `Enforcement` has a row per candidate: branch · required? · bypass · preventive point.
- [ ] **Step 8 — Positive Control:** A gate that passes because it measures nothing is worse than no gate, because it stops anyone looking. The control every new gate must meet is to put the defect back and watch the gate go red. This run does not build the gate, so the report states that control. A gate with no proven-red demonstration is not finished. Related cheap checks: an unmatched browser-test locator can sit in a passing assertion, and a row-level denial can give silent zero rows that look like an empty table (`bkit-audit-database`). A skip is a hollow pass. A required job skipped by a job-level condition reports success. A workflow skipped by a path filter, a branch filter or a skip-CI marker leaves the required check pending. For each candidate, record the skip behaviour, and how a skip is kept from standing in for a pass. **If** proven-red is a convention for gate changes but not a merge requirement → propose making it one in `Process Improvements`. **Done when:** `Controls` states the positive control and the skip behaviour per candidate.
- [ ] **Step 9 — Sequence:** Each candidate runs report-only for at least one full cycle, then enforcing. This run does not land the gate. The landing reads the current tree, fixes or allowlists the findings, then flips the gate to enforcing. Name the candidates that would go red if enforced cold. Report-only ends when the gate meets its stated bar, not just when a cycle has passed. For each candidate, the bar is: a minimum number of runs; an effective false-positive rate under 10% (findings judged not a real problem ÷ all findings); no unexplained reds; no flakes of its own; and added p90 runtime under a stated budget. Name one enforcement tier. **Clear-then-gate** is the default: fix or allowlist every existing finding, then enforce on everything. Use a **Ratchet** (new violations only) when clearing the existing findings takes more than one PR. The gate then fails only on findings not in a committed baseline: the guard's baseline file, or the tool's own (e.g., the Betterer results file, or reviewdog's added-only mode). The baseline may only shrink, and each entry names an owner. An allowlist is per offender and keyed to its identity, never a rule downgrade or a route exclusion. Every entry cites an owner, because an entry with no owner and no date is a permanent exemption. A ratchet baseline has the same contract, and never grows. **Done when:** `Sequence` names the bar and the tier per candidate.
- [ ] **Step 10 — Decision:** Any workflow change needs explicit human confirmation, so propose and do not edit. The rule against weakening a gate applies to a new one too: the bar for adding a gate is that what it catches will be fixed. Record ADOPT, REJECT or OTHER, including the `docs/decisions.jsonl` row to append for ADOPT and REJECT. Appending is the next step. A rejection whose reason later stops holding must stay findable. **Done when:** every candidate in `Scores` has a verdict and row text, or OTHER with what settles it, and `Scores` holds the verdict counts (proposed, ADOPT, REJECT, OTHER, reverted).
- [ ] **Step 11 — Re-Review:** A gate that was built and reverted is not settled. Re-read each rejection in `docs/decisions.jsonl` and in prior reports, and check whether its reasoning still holds. Two decisions on one guard with neither retired mean the criterion cannot be judged, which is a finding. **If** the reasoning no longer holds → score the candidate again in `Scores`, with the `docs/decisions.jsonl` row that would retire the old decision. **Done when:** `Rejections` has a row per reverted or rejected gate: still holds?
- [ ] **Step 12 — Health:** For each landed gate since the previous report, record the fire rate, the true-positive rate, overrides and bypasses, its own flakes, and its runtime. A gate that never fired is either perfectly preventive or hollow, and the two look the same from outside. A fresh positive control (`Positive Control`) tells them apart. **If** a gate never fired **or** is hollow → name that control as the next step. Every `bkit:gate:*` script in `package.json` is a landed gate, and workflows, agents and pre-push run only these. Expand each one, following every nested `pnpm <script>` to its body, and list each command. A hollow gate is `CRITICAL`: the script is missing or empty, or runs nothing that can fail (e.g., `echo`, `true`, `|| exit 0`). A command that exits 0 when its tool is absent (e.g., `command -v … || echo skipping`) makes that check hollow; name the tool and its install step. **Done when:** `Health` has a row per landed gate, or says none landed, and each `bkit:gate:*` row lists every command and which ones can skip.
- [ ] **Step 13 — Allowlists:** Check every allowlist entry (known-offender maps, ratchet baselines, dead-code ignores) for a date that has passed or a cited issue that is closed. Each lapsed entry is a finding: renew it with a reason, or fix the offender. For each ratchet baseline, compare the entry count with the previous report. A baseline that grew, or an entry with no owner, is a finding. **Done when:** `Allowlists` lists every lapsed, grown or ownerless entry, or says `none`.
- [ ] **Step 14 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give one row per anchor practice (fitness functions, the static-analysis false-positive bar, new-code gating, ratchets, policy as code, rulesets and merge queue, the DORA CI capability) and per OpenSSF Scorecard check, marked checked (with the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 15 — Anything Else:** (a) List everything changed since the previous report's commit that touches gating (guards and contract tests, the hook directory, gate scripts, workflow jobs, rulesets and branch protection, allowlists), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior build and developer-productivity engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Sources read:** every candidate cites the section it came from.
- [ ] **No summary-only scores:** no score rests on a sibling summary alone.
- [ ] **No gate landed:** no workflow, hook, allowlist or gate script changed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | An ungated class is data loss, a security hole, or a broken workflow with no workaround. A required check reports success when skipped, or when it measured nothing. |
| `HIGH` | A class has shipped real damage and still has a workaround. A landed gate has never fired and has no positive control. Structural false positives have no committed baseline. |
| `MEDIUM` | A repeat defect class has a home lane and no gate. A report-only candidate is past its bar with no enforce-or-stay decision. An allowlist entry is past its date or has no owner. |
| `LOW` | A candidate has no incident. An OTHER waits on a tool or a decision. Gate-message wording changes no pass/fail. |

A candidate takes the severity of the class its gate would catch. Within a severity, list the higher `Score` first.

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and per verdict (ADOPT / REJECT / OTHER).
- [ ] **Series:** the report shows verdict counts, `Health`, and allowlist sizes beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
