<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Coverage Floor

> [!CAUTION]
> **Purpose:** The ratchet of a CI coverage-floor gate: whether each committed floor still sits under the measured branch coverage, and the next floor each gated surface should move to.
>
> **Rules:**
>
> - Never edit workflows, floor files, coverage config or the gate script.
> - State each edit in the report instead.
> - Never lower a floor, add an exclusion or add an ignore hint.
> - NEVER run a tool that rewrites source to measure mutants or coverage.
> - Read the artifacts already produced.

## Universal Instructions

### Context & Goals

A static floor fails one way: coverage climbs, the gate stays far below it, and a large drop still passes green. Tightening off one run fails another way: branch coverage on identical code moves between runs, so the gate flakes, and a flaky gate gets disabled. The failure this audit targets is a floor left far under measured coverage, or a floor ratcheted onto noise.

**Applies when:** a coverage floor gate exists. **If** none exists → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass after a coverage lift, a runner or provider version change, an include, exclude or measured-glob change, or a new package or app under a gated glob.

**Anchor Standards:**

- Coverage practice for a gate (e.g. Google, "Code Coverage Best Practices"; Ivanković et al., "Code Coverage at Google").
- Coverage guide for pinned runner and provider (e.g. Vitest coverage, including `coverage.include` and AST-aware remapping; Jest coverage; Istanbul). Record major pinned.
- Patch (diff) coverage (e.g. Codecov patch status; PR coverage-comment changed-file mode). Record action version.
- Ratchet tooling (e.g. Betterer). Record version read.
- Goodhart's law: coverage is a signal, not a goal.

### Scope

- Check the floor history: no floor dropped, no new exclusion and no new ignore hint.
- Sample >=10 full runs per gated surface.
- Ratchet from the lowest observation, never from one run.
- Compare the denominator: the files the glob should cover against the files in the summary.
- Measure the variance on identical code across two runs, and its cause (tests or tooling).
- Recommend a floor for each gated surface, each surface's floor on its own.
- List the report-only surfaces, including a named surface that emits no coverage.
- Report the high-risk modules, as report-only.
- Check the patch coverage of the changes merged since the previous report.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether tests check the right behaviour, can fail, or run | The testing audit owns test quality | `bkit-audit-testing` |
| Conditional or timing-dependent tests behind a spread | The flakes audit owns them | `bkit-audit-flakes` |
| Patch coverage as a new required check | The gates audit owns gate ranking | `bkit-audit-gates` |
| Changing floors, exclusions, ignore hints, or workflows | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **CI History:** Steps 4, 5, 7, 10 — branch coverage from full CI runs (e.g., `gh run list` / `gh run download`, GitLab pipelines, Codecov). Fallback: fill the gap with local re-runs, and mark every local observation.
- [ ] **Coverage Artifacts:** Steps 6, 7, 11, 12 — summary and per-file coverage (e.g., `coverage-summary.json`, `coverage-final.json`, lcov). Fallback: use percentages only, and mark file-level claims `Not Checked`.
- [ ] **Git History:** Steps 3, 9, 15 — `git log -L` / `git log -p` on the floor values and coverage config. Fallback: use the current tree only, and mark history `Not Checked`.
- [ ] **Web:** Step 14 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Local Runner:** **If** a gated surface has fewer than ten CI observations → Steps 4, 7 — re-run that surface's coverage command in a detached worktree, removed before the report finishes. Fallback: do not tighten that surface, and record the shortfall in `Not Checked`.
- [ ] **Mutation Score:** **If** a mutation report or a `bkit-audit-testing` report exists → Step 9 — the latest score beside each gated surface. Fallback: report movement without a mutation comparison, and record that in `Not Checked`. Do not start a run that rewrites source.
- [ ] **Patch Source:** **If** changed-file coverage is reported → Step 12 — the changed-file coverage (e.g., the PR coverage comment's changed-file table, Codecov patch status). Fallback: use the diff plus per-file coverage. **If** neither exists → mark it `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** Find the coverage floor gate (a CI job, script or threshold that fails below a committed number) and where the number is stored. List the hard-gated and the report-only surfaces. The metric is branch coverage, unless a recorded decision names another. Line, statement and function percentages are not floors. **If** there is no gate → write `N/A` and **STOP**. **Done when:** `Checked` holds gate path, metric, surface list, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — History:** Since the previous report's commit, check that no floor dropped (`git log -L` on each floor value and on the coverage include and exclude). A floor never moves down: a drop is fixed, not accommodated. Diff the exclusions. Count the ignore hints under each gated glob, then and now (e.g., `v8 ignore`, `istanbul ignore`, `c8 ignore`, `# pragma: no cover`). Each new exclusion and each new ignore hint is a finding, with its commit. **Done when:** `History` lists every floor change, new exclusion and new ignore hint, or `none`.
- [ ] **Step 4 — Sample:** For each gated surface, take >=10 full runs: on the same commit, or the most recent full CI runs on the default branch. Use CI history first, and re-run locally only to fill a gap. Mark the local observations. Record every run id. Include no partial lane. Never ratchet off a single run. **Done when:** `Sample` holds >=10 observations per gated surface, or names the shortfall and leaves that floor untightened.
- [ ] **Step 5 — Lowest:** For each gated surface, record every observation, and ratchet from the lowest, not the latest. Write covered/total beside each percentage. Spread = max − min. A spread above two points is a finding (non-deterministic coverage). `Variance` finds the cause, and `Floor` does not tighten until the spread is fixed. **Done when:** `Sample` holds one row per surface, with the observations, covered/total, the lowest and the spread.
- [ ] **Step 6 — Denominator:** **If** the runner omits a file that no test imports unless the include list names it (e.g., Vitest >=4) → compare the summary's file count with `git ls-files` for the glob the surface should cover, and list the source files missing from the report. A missing file inflates the percentage, which is a finding. **If** the project uses another runner → check its equivalent omission, or skip with evidence. **Done when:** `Denominator` holds the missing files, or the skip is recorded.
- [ ] **Step 7 — Variance:** Coverage on identical code should match. Take two runs on the same commit, diff the per-file coverage (e.g., `coverage-final.json`), and list the files whose covered branches differ. Conditional or timing-dependent tests go to `bkit-audit-flakes`. **Done when:** `Variance` holds the file list, or records that the runs are identical.
- [ ] **Step 8 — Floor:** The recommended floor = the lowest observation, rounded down, minus one point. **If** the spread is above two points → keep the current floor. **If** the recommended floor is below the current floor → leave the floor as it is, and record the drop as a finding. Surfaces ratchet separately, so do not nudge a surface whose tests did not change. **Done when:** `Recommendation` holds the current, lowest and recommended floor, and whether to move, for each gated surface.
- [ ] **Step 9 — Movement:** Name the tests that caused a lift, and whether they are durable (run on every tier invocation) or in a conditional lane. A ratchet with no named cause is a finding. Before crediting tests, record the runner, the coverage-provider package and the provider for each run in `Sample`, and diff the lockfile between the oldest and newest runs. **If** the provider changed (e.g., AST-aware remapping) → branch counts move with no test change, so do not credit the tests with that movement. Put the latest mutation score beside each gated surface. Coverage up with mutation flat is a finding, because the tests cover code but check nothing, and it goes to `bkit-audit-testing`. **Done when:** `Movement` names the cause for each surface, or the tooling change that explains it.
- [ ] **Step 10 — Report-Only:** List the report-only surfaces and their numbers. Not gating is part of the record: each surface stays report-only (saying why) or has a date to decide. A surface reported across runs with no decision is a finding. A project-named surface with no coverage is a finding, not an omission. Record any E2E-collected coverage, or server and route code that no unit test reaches (e.g., V8/Istanbul through a browser runner and merger). **If** there is none → say so. **Done when:** `Report-Only` holds one row per surface, with the number, the decision and whether coverage is collected.
- [ ] **Step 11 — Modules:** For each project-named high-risk area, record the branch coverage and the absolute number of uncovered branches. Name the files, so the next run measures the same set. This is report-only and does not move the floor. **Done when:** `Modules` holds one row per area, with its files, branch % and uncovered branches.
- [ ] **Step 12 — Patch:** List every change merged since the previous report whose changed lines had branch coverage below a stated bar, and state the bar (default 90% per commit, unless the project states another). Patch coverage names the change that dropped coverage, which the aggregate gate does not. A change below the bar is a finding, and a gate candidate for `bkit-audit-gates`. **Done when:** `Patch` lists every below-bar change, or `none`, and states the bar.
- [ ] **Step 13 — Recommend:** For each surface, state old floor → new floor and the edit (file and value). Do not apply it. A workflow change in the edit needs explicit human confirmation. Note whether the previous report's recommended floor matches the tree. For each surface, write one line on what red means: often an untested file under the glob, not removed coverage. **If** CI does not print the recommended next floor (the lowest of the sample, rounded down, minus one point) beside the current one → propose that in `Process Improvements`. **Done when:** `Recommendation` holds the edit text and the red-means line, and the tree is unchanged.
- [ ] **Step 14 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per anchor practice for a coverage gate (e.g., the per-commit bar, include-list guidance, patch coverage, ratchet tooling), each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 15 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches coverage measurement: runner and provider versions, include and exclude, ignore hints, measured globs, floor files, the gate script, the merge script, the floor step, and new packages and apps. (b) In a bounded pass of about 30 minutes, note what a senior test engineer owning CI quality gates would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Floors untouched:** no workflow, floor file, coverage config or gate script changed.
- [ ] **Sample:** every gated surface has >=10 full-run observations, or a named shortfall with its floor not tightened.
- [ ] **Full runs only:** the sample holds no partial lane.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | The floor gate was removed, or a gated surface was dropped from it with no replacement. The gate passes when the coverage summary is missing |
| `HIGH` | A floor was lowered. A new exclusion or ignore hint under a gated glob. A spread above two points. Source files in the glob missing from the summary |
| `MEDIUM` | The recommended floor is below the current one and the drop is left in place. Coverage up while the mutation score stays flat. A report-only surface with no stay-or-gate decision. A high-risk module with uncovered branches. A change merged below the patch bar. Movement with no named cause |
| `LOW` | A comment or prose in a floor file that does not change the number. Report-only drift inside a recorded stay-report-only decision |

Within a severity, list gated surfaces first, then exclusions.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### History

PENDING

### Sample

PENDING

### Denominator

PENDING

### Variance

PENDING

### Movement

PENDING

### Report-Only

PENDING

### Modules

PENDING

### Patch

PENDING

### Recommendation

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
- [ ] **Summary:** `Summary` gives the count per severity, and old floor → recommended floor for each gated surface.
- [ ] **Series:** the report shows `Sample` spreads and the floor series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
