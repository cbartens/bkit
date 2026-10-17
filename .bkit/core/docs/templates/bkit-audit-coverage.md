<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Coverage Floor

> [!CAUTION]
> **Purpose:** Ratchet of a CI coverage-floor gate — whether each committed floor still sits under measured branch coverage, and the next floor a gated surface should move to.
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
> - never edit workflows, floor files, coverage config, or the gate script; the report states the edit.
> - never lower a floor, add an exclusion, or add an ignore hint.
> - NEVER run a tool that rewrites source to measure mutants or coverage. Read artifacts already produced.

## Universal Instructions

### Context & Goals

Static floor: coverage climbs, gate far below, large drop passes green. One-run tighten flakes — identical-code branch coverage moves between runs — flaky gate gets disabled. Target failure: **a floor left far under measured coverage, or ratcheted onto noise**.

**Applies when:** coverage floor gate exists. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly; extra pass after coverage lift, runner/provider version change, include/exclude/measured-glob change, or new package/app under gated glob.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Coverage practice for a gate (e.g. Google, "Code Coverage Best Practices"; Ivanković et al., "Code Coverage at Google").
- Coverage guide for pinned runner and provider (e.g. Vitest coverage, including `coverage.include` and AST-aware remapping; Jest coverage; Istanbul). Record major pinned.
- Patch (diff) coverage (e.g. Codecov patch status; PR coverage-comment changed-file mode). Record action version.
- Ratchet tooling (e.g. Betterer). Record version read.
- Goodhart's law: coverage is a signal, not a goal.

### Scope

- Floor history: no floor dropped, no new exclusion, no new ignore hint.
- Sample ≥10 full runs per gated surface; ratchet from lowest, never one run.
- Denominator: glob-should-cover files vs summary files.
- Identical-code variance across two runs; cause (tests vs tooling).
- Recommended floor per gated surface; surfaces move independently.
- Report-only surfaces, including named surface emitting no coverage.
- High-risk modules, report-only.
- Patch coverage of changes merged since previous report.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether tests check the right behaviour, can fail, or run | Test quality | `bkit-audit-testing` |
| Conditional or timing-dependent tests behind a spread | Flake sweep | `bkit-audit-flakes` |
| Patch coverage as a new required check | Gate ranking | `bkit-audit-gates` |
| Changing floors, exclusions, ignore hints, or workflows | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`. never retry or reword a blocked call to get past it.
- [ ] **CI History:** Steps 4, 5, 7, 10 — branch coverage from full CI runs, e.g. `gh run list` / `gh run download`, GitLab pipelines, Codecov. Fallback: local re-runs fill gap; mark every local observation.
- [ ] **Coverage Artifacts:** Steps 6, 7, 11, 12 — summary and per-file coverage, e.g. `coverage-summary.json`, `coverage-final.json`, lcov. Fallback: percentages only; file-level claims `Not Checked`.
- [ ] **Git History:** Steps 3, 9, 15 — `git log -L` / `git log -p` on floor values and coverage config. Fallback: current tree only; history `Not Checked`.
- [ ] **Web:** Step 14 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Local Runner:** Fewer than ten CI observations for a gated surface → Steps 4, 7 — re-run that surface's coverage command in detached worktree, removed before report finishes. Fallback: do not tighten that surface; shortfall in `Not Checked`.
- [ ] **Mutation Score:** Mutation report or `bkit-audit-testing` report exists → Step 9 — latest score beside each gated surface. Fallback: movement without mutation comparison; record in `Not Checked`. Do not start a run that rewrites source.
- [ ] **Patch Source:** Changed-file coverage reported → Step 12 — e.g. PR coverage comment changed-file table, Codecov patch status. Fallback: diff plus per-file coverage; if neither, `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find coverage floor gate (CI job, script, or threshold failing below committed number) and where number is stored. List hard-gated vs report-only surfaces. Metric = branch coverage unless recorded decision names another; line, statement, function percentages are not floors. None → `N/A` and STOP. **Done when:** gate path, metric, surface list in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — History:** Since previous report's commit: no floor dropped (`git log -L` on each floor value and coverage include / exclude). Floor never moves down; drop is fixed, not accommodated. Diff exclusions. Count ignore hints under each gated glob, then and now (e.g. `v8 ignore`, `istanbul ignore`, `c8 ignore`, `# pragma: no cover`). Each new exclusion and ignore hint, with commit = finding. **Done when:** `History` lists every floor change, new exclusion, and new ignore hint, or `none`.
- [ ] **Step 4 — Sample:** Per gated surface, ≥10 full runs: same commit, or most recent full CI runs on default branch. CI history first; local re-run only to fill gap; mark local observations. Record every run id. No partial lane. Never ratchet off single run. **Done when:** `Sample` holds ≥10 observations per gated surface, or named shortfall and that floor not tightened.
- [ ] **Step 5 — Lowest:** Per gated surface, record every observation; ratchet from lowest, not latest. Write covered/total beside percentage. Spread = max − min. Spread above two points = finding (non-deterministic coverage); `Variance` finds cause; `Floor` does not tighten until spread fixed. **Done when:** `Sample` row per surface: observations · covered/total · lowest · spread.
- [ ] **Step 6 — Denominator:** Runner omits file no test imports unless include list names it (e.g. Vitest ≥4) → compare summary file count with `git ls-files` for glob surface should cover; list source files missing from report. Missing file inflates percentage = finding. Other runner → equivalent omission, or skip with evidence. **Done when:** missing files in `Denominator`, or skip recorded.
- [ ] **Step 7 — Variance:** Identical-code coverage should match. Two runs on same commit → diff per-file coverage (e.g. `coverage-final.json`); list files whose covered branches differ. Conditional or timing-dependent tests → `bkit-audit-flakes`. **Done when:** file list in `Variance`, or identical and recorded.
- [ ] **Step 8 — Floor:** Recommended floor = lowest observation, rounded down, minus one point. Spread above two points keeps current floor. Recommended below current floor → leave floor; drop = finding. Surfaces ratchet separately; do not nudge surface whose tests did not change. **Done when:** `Recommendation` holds current · lowest · recommended · move? per gated surface.
- [ ] **Step 9 — Movement:** Name tests that caused lift; durable (every tier invocation) vs conditional lane. Ratchet with no named cause = finding. Before crediting tests, record runner, coverage-provider package, and provider per run in `Sample`; diff lockfile between oldest and newest. Provider change (e.g. AST-aware remapping) moves branch counts with no test change → do not credit tests. Latest mutation score beside each gated surface. Coverage up, mutation flat = finding (covers code, checks nothing → `bkit-audit-testing`). **Done when:** `Movement` names cause per surface, or tooling change explaining it.
- [ ] **Step 10 — Report-Only:** List report-only surfaces and numbers. Not gating is part of record: stay report-only (why) or date to decide. Reported across runs with no decision = finding. Project-named surface with no coverage = finding, not omission. Record E2E-collected coverage, or server/route code no unit test reaches (e.g. V8/Istanbul via browser runner and merger). If none, say so. **Done when:** `Report-Only` row per surface: number · decision · coverage collected?
- [ ] **Step 11 — Modules:** Per project-named high-risk area: branch coverage and absolute uncovered branches. Name files so next run measures same set. Report-only; does not move floor. **Done when:** `Modules` row per area: files · branch % · uncovered branches.
- [ ] **Step 12 — Patch:** Every change merged since the previous report whose changed lines had branch coverage below a stated bar, and state the bar (default 90% per commit unless the project states another). Patch coverage names the change that dropped coverage, which the aggregate gate does not. Below the bar = finding, and a gate candidate for `bkit-audit-gates`. **Done when:** `Patch` lists every below-bar change, or `none`, and states the bar.
- [ ] **Step 13 — Recommend:** State old floor → new floor per surface and edit (file and value). Do not apply. Workflow change in edit needs explicit human confirmation. Note whether previous report's recommended floor matches tree. Per surface, one line on red: often untested file under glob, not removed coverage. If CI does not print recommended next floor (lowest of sample, rounded down, minus one point) beside current, propose in `Process Improvements`. **Done when:** `Recommendation` holds edit text and red-means line; tree unchanged.
- [ ] **Step 14 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor practice for coverage gate (e.g. per-commit bar, include-list guidance, patch coverage, ratchet tooling) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 15 — Anything Else:** (a) Everything since previous report's commit touching coverage measurement (runner/provider versions, include/exclude, ignore hints, measured globs, floor files, gate script, merge script, floor step, new packages/apps) → one-line verdict each. (b) Bounded ~30 min pass: what senior test engineer owning CI quality gates flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Floors untouched:** no workflow, floor file, coverage config, or gate script changed.
- [ ] **Sample:** every gated surface has ≥10 full-run observations, or named shortfall and its floor not tightened; no partial lane in the sample.
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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, and old floor → recommended floor per gated surface.
- [ ] **Series:** `Sample` spreads and the floor series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
