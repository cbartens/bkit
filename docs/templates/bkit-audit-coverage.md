<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Coverage Floor

> [!CAUTION]
> **Purpose:** Ratchet of a CI coverage-floor gate — whether each committed floor still sits under measured branch coverage, and the next floor a gated surface should move to.
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
> - NEVER edit workflows, floor files, coverage config, or the gate script; the report states the edit.
> - NEVER lower a floor, add an exclusion, or add an ignore hint.
> - NEVER run a tool that rewrites source to measure mutants or coverage. Read artifacts already produced.

## Universal Instructions

### Context & Goals

A floor that never moves stops protecting anything: coverage climbs, the gate sits far below it, and a large drop passes green. A floor tightened off one run flakes instead — branch coverage of identical code moves between runs — and a flaky gate gets disabled. Target failure: **a floor left far under measured coverage, or ratcheted onto noise**.

**Applies when:** a coverage floor gate exists. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass after a change that lifts coverage, after a coverage-runner or provider version change, after an include, exclude, or measured-glob change, and when a new package or app lands under a gated glob.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Coverage practice for a gate (e.g. Google, "Code Coverage Best Practices"; Ivanković et al., "Code Coverage at Google").
- Coverage guide for the pinned runner and provider (e.g. Vitest coverage, including `coverage.include` and AST-aware remapping; Jest coverage; Istanbul). Record the major pinned.
- Patch (diff) coverage (e.g. Codecov patch status; a PR coverage-comment action's changed-file mode). Record the action version.
- Ratchet tooling (e.g. Betterer). Record the version read.
- Goodhart's law: coverage is a signal, not a goal.

### Scope

- Floor history: no floor dropped, no new exclusion, no new ignore hint.
- Sample of ≥10 full runs per gated surface; ratchet from the lowest, never from one run.
- Denominator: files the glob should cover vs files in the summary.
- Variance of identical code across two runs, and what caused a move (tests vs tooling).
- Recommended floor per gated surface. Surfaces move independently.
- Report-only surfaces, including a named surface that emits no coverage.
- High-risk modules, report-only.
- Patch coverage of changes merged since the previous report.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether tests check the right behaviour, can fail, or run | Test quality | `bkit-audit-testing` |
| Conditional or timing-dependent tests behind a spread | Flake sweep | `bkit-audit-flakes` |
| Patch coverage as a new required check | Gate ranking | `bkit-audit-gates` |
| Changing floors, exclusions, ignore hints, or workflows | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **CI History:** Steps 4, 5, 7, 10 — branch coverage from full CI runs, e.g. `gh run list` / `gh run download`, GitLab pipelines, Codecov. Fallback: local re-runs fill the gap; mark every local observation.
- [ ] **Coverage Artifacts:** Steps 6, 7, 11, 12 — summary and per-file coverage, e.g. `coverage-summary.json`, `coverage-final.json`, lcov. Fallback: percentages only; file-level claims `Not Checked`.
- [ ] **Git History:** Steps 3, 9, 15 — `git log -L` / `git log -p` on floor values and coverage config. Fallback: current tree only; history `Not Checked`.
- [ ] **Web:** Step 14 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Local Runner:** Fewer than ten CI observations for a gated surface → Steps 4, 7 — re-run that surface's coverage command in a detached worktree, removed before the report finishes. Fallback: do not tighten that surface; shortfall in `Not Checked`.
- [ ] **Mutation Score:** A mutation report or `bkit-audit-testing` report exists → Step 9 — latest score beside each gated surface. Fallback: movement without a mutation comparison; record in `Not Checked`. Do NOT start a run that rewrites source.
- [ ] **Patch Source:** Changed-file coverage is reported → Step 12 — e.g. a PR coverage comment's changed-file table, Codecov patch status. Fallback: diff plus per-file coverage; if neither, `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find the coverage floor gate (CI job, script, or threshold that fails a run below a committed number) and where that number is stored. List hard-gated surfaces vs report-only. Metric = branch coverage unless a recorded decision names another; line, statement, and function percentages are not floors. None → `N/A` and STOP. **Done when:** gate path, metric, and surface list in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — History:** Since the previous report's commit: no floor dropped (`git log -L` on each floor value and on coverage include / exclude). A floor never moves down; a drop is fixed, not accommodated. Diff exclusions. Count ignore hints under each gated glob, then and now (e.g. `v8 ignore`, `istanbul ignore`, `c8 ignore`, `# pragma: no cover`). Each new exclusion and each new ignore hint, with its commit = finding. **Done when:** `History` lists every floor change, new exclusion, and new ignore hint, or `none`.
- [ ] **Step 4 — Sample:** Per gated surface, ≥10 full runs: same commit, or the most recent full CI runs on the default branch. CI history first; local re-run only to fill the gap; mark which observations are local. Record every run id. No partial lane. Never ratchet off a single run. **Done when:** `Sample` holds ≥10 observations per gated surface, or a named shortfall and that floor not tightened.
- [ ] **Step 5 — Lowest:** Per gated surface, record every observation and ratchet from the lowest, not the latest. Write covered/total beside the percentage. Spread = max − min. Spread above two points = finding (coverage on that surface is non-deterministic); `Variance` finds the cause, and `Floor` does not tighten that surface until the spread is fixed. **Done when:** `Sample` row per surface: observations · covered/total · lowest · spread.
- [ ] **Step 6 — Denominator:** Runner that omits a file no test imports unless an include list names it (e.g. Vitest ≥4) → compare the file count in the summary with `git ls-files` for the glob that surface should cover, and list source files missing from the report. A missing file inflates the percentage = finding. Other runner → its equivalent omission, or skip with evidence. **Done when:** missing files listed in `Denominator`, or skip recorded.
- [ ] **Step 7 — Variance:** Coverage of identical code should be identical. Two runs on the same commit → diff per-file coverage (e.g. `coverage-final.json`) and list files whose covered branches differ. They point at tests that run conditionally or depend on timing → `bkit-audit-flakes`. **Done when:** file list in `Variance`, or identical and recorded.
- [ ] **Step 8 — Floor:** Recommended floor = lowest observation, rounded down, minus one point. Spread above two points keeps the current floor. Recommended figure below the current floor → leave the floor; the drop = finding. Surfaces move for different reasons and are ratcheted separately; do not nudge a surface whose tests did not change. **Done when:** `Recommendation` holds current · lowest · recommended · move? per gated surface.
- [ ] **Step 9 — Movement:** Name which tests caused a lift, and whether the lift is durable (runs on every invocation of that tier) or sits behind a conditional lane. A ratchet with no named cause = finding. Before crediting tests, record the runner, the coverage-provider package, and the provider for each run in `Sample`, and diff the lockfile between the oldest and the newest. A provider change (e.g. a switch to AST-aware remapping) moves branch counts with no test change → do not credit tests. Latest mutation score for the same code beside each gated surface. Coverage rising while the mutation score stays flat = finding (tests that cover code and check nothing → `bkit-audit-testing`). **Done when:** `Movement` names the cause per surface, or the tooling change that explains it.
- [ ] **Step 10 — Report-Only:** List report-only surfaces and their current numbers. The decision not to gate one is part of the record: stay report-only (why) or a date to decide. Reported across runs with no recorded decision = finding. A surface the project names that produces no coverage = finding, not an omission. Record whether any coverage is collected from end-to-end runs, or from server and route code no unit test reaches (e.g. V8 or Istanbul via the browser runner and a coverage merger). If none, say so. **Done when:** `Report-Only` row per surface: number · decision · coverage collected?
- [ ] **Step 11 — Modules:** Per high-risk area the project names, report branch coverage and the absolute number of uncovered branches. Name the files, so the next run measures the same set. Report-only; does not move a floor. **Done when:** `Modules` row per area: files · branch % · uncovered branches.
- [ ] **Step 12 — Patch:** Every change merged since the previous report whose changed lines had branch coverage below a stated bar, and state the bar (default 90% per commit unless the project states another). Patch coverage names the change that dropped coverage, which the aggregate gate does not. Below the bar = finding, and a gate candidate for `bkit-audit-gates`. **Done when:** `Patch` lists every below-bar change, or `none`, and states the bar.
- [ ] **Step 13 — Recommend:** State old floor → new floor per surface, and the edit (file and value). Do NOT apply it. A workflow change in that edit needs explicit human confirmation. Note whether the previous report's recommended floor is what the tree holds now. Per surface, one line on what a red means: the failing change is often an untested file added under the glob, not coverage removed. If CI does not print the recommended next floor (lowest of the sample, rounded down, minus one point) beside the current floor, propose that in `Process Improvements`. **Done when:** `Recommendation` holds the edit text and the red-means line; tree unchanged.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per practice the anchor standards recommend for a coverage gate (e.g. a per-commit bar, include-list guidance, patch coverage, ratchet tooling) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything changed since previous report's commit touching coverage measurement (runner and provider versions, include, and exclude, ignore hints, measured globs, floor files, the gate script, the merge script, the floor step, new packages or apps) → one-line verdict each. (b) Bounded ~30 min pass: what a senior test engineer who owns CI quality gates flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Floors untouched:** no workflow, floor file, coverage config, or gate script changed.
- [ ] **Sample:** every gated surface has ≥10 full-run observations, or a named shortfall and its floor not tightened; no partial lane in the sample.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Floor gate removed, or a gated surface dropped from it with no replacement; gate passes when the coverage summary is missing |
| `HIGH` | Floor lowered; new exclusion or ignore hint under a gated glob; spread above two points; source files in the glob missing from the summary |
| `MEDIUM` | Recommended floor below current and the drop left in place; coverage up while the mutation score stays flat; report-only surface with no stay-or-gate decision; high-risk module with uncovered branches; change merged below the patch bar; movement with no named cause |
| `LOW` | Comment or prose in a floor file that does not change the number; report-only drift inside a recorded stay-report-only decision |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: gated surfaces, then exclusions.

<!-- prettier-ignore -->
| ID | Severity | Location | Evidence | Expected |
| --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, and old floor → recommended floor per gated surface.
- [ ] **Series:** `Sample` spreads and the floor series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
