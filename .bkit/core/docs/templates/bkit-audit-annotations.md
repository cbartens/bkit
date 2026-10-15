<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Annotations Triage

> [!CAUTION]
> **Purpose:** Triage CI annotations and warnings beside a green result — silent failures, deprecations with a deadline, and lint warnings including a suppression on the wrong node.
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
> - never edit a workflow, composite action, or other CI config; a recommended change is a finding for a human.
> - NEVER dispatch a workflow, push, or otherwise start a run to verify a fix.

## Universal Instructions

### Context & Goals

Green CI hides costly warnings. Two failure modes: step success while the operation was refused, skipped, or ignored (annotation was the only signal); deprecation with a deadline stays green until runtime/API removal — CI red on a date nobody chose.

**Applies when:** CI emits annotations, warnings, or notices (e.g. GitHub Actions check-run annotations, GitLab code-quality reports, Buildkite annotations). None → one `N/A` row with evidence, never "clean".

**Cadence:** weekly, and before every release to the production branch. In-passing sweeps are not a control. Extra pass when: CI-vendor deprecation/retirement post or runner-image announcement touches these workflows; workflow, composite action, or reusable workflow changes (conditional lane annotates only when it runs); deprecation deadline before next weekly sweep.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- CI vendor changelog, deprecation, and retirement posts (e.g. GitHub Changelog deprecation label). Living; record the date read.
- Runner-image announcements (e.g. `actions/runner-images` Announcement label). Living; record the date read.
- Workflow command reference, including deprecated commands (e.g. GitHub `set-output`, `save-state`, `set-env`, `add-path`).
- Problem matchers and annotation limits (e.g. `actions/toolkit` problem matchers; per-step and per-job caps).
- Workflow static analysers (e.g. actionlint, zizmor); record versions.
- Deprecated-API lint (e.g. typescript-eslint `no-deprecated`); record the version in the lockfile.

### Scope

- Annotations and notices on recent runs of every workflow, including scheduled, manual, and bot-triggered. Not one pipeline.
- Deprecation notices in the vendor changelog before they annotate.
- Action and runtime inventory, including leftover opt-out env keys.
- Log lines that never become annotations (deprecations, outdated CLIs).
- Workflow static analysis, and deprecated workflow commands a conditional lane hides.
- One verdict per annotation. Root cause for each silent failure.
- Which node a lint warning actually trips. Problem matchers so lint output becomes annotations.
- What was verified locally, and what still needs a real run.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Runtime errors, and log lines that are not annotations or deprecation warnings | Log sweep | `bkit-audit-logs` |
| Flaky tests | Flake sweep | `bkit-audit-flakes` |
| Whether a static-analysis hit is exploitable | Security sweep | `bkit-audit-security` |
| Applying fixes / changing workflows | Audit reports only | Plan from this report |

### Verdicts

One per annotation. **SILENT FAILURE** outranks every other verdict.

- **SILENT FAILURE:** step reported success, but annotation says operation was refused, skipped, or ignored. Report names root cause. Fix is next step.
- **DEPRECATION:** action, runtime, or API with announced end date. Report names date and bump. Scheduling is next step.
- **LINT WARNING:** real warning pointing at code. Report says fix, or why it stands. Do not edit the code here.
- **DEAD SUPPRESSION:** disable comment with nothing left to disable. Report says delete it, and whether it sat on the wrong node. Do not delete it here.
- **ACCEPTED:** known, and already recorded. Say where, and skip.
- **OTHER:** fits none. Resolve to one of the above if you can; otherwise say what it is and why it fits none. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **CI Read:** Steps 2, 5, 11 — annotations and step logs for recent runs of every workflow, e.g. `gh api` check-run annotations, `gh run view --log`, GitLab job-trace API. Fallback: saved logs; runs not fetched `Not Checked`.
- [ ] **Workflow Files:** Steps 4, 6, 8 — workflows, composite actions, reusable workflows on disk. Fallback: none.
- [ ] **Web:** Steps 3, 12 — vendor changelog, runner-image announcements, anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Workflow Linters:** Workflows on disk → Step 6 — e.g. actionlint, zizmor, shellcheck. Fallback: read the workflows; name each check skipped.
- [ ] **Language Server:** Typed language and a lint annotation → Step 9 — per-file diagnostics, e.g. Serena, `tsserver`. Fallback: lint that file; say so. Empty is inconclusive; corroborate with text search.
- [ ] **Deprecated-API Lint:** Typed language → Step 10 — e.g. `@typescript-eslint/no-deprecated`. Fallback: text search for known deprecated calls; under-count recorded.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Collect:** No CI → one `N/A` row with evidence and STOP. Else read annotation lists for recent runs of every workflow, not last run of one pipeline. Deprecations surface on whichever workflow uses the old action. Include scheduled, manual, and bot-triggered runs. Collect mechanically, not by eye from the UI. Window = since previous report, and at least latest completed run of each workflow. Save list; diff vs previous report: new, resolved, persisting. Annotations capped (e.g. GitHub: 10 warnings, 10 errors, and 10 notices per step, and 50 per job). Step at cap → grep raw job log for warning and error markers; triage overflow. Record run ids and commit. Id, run, or path you cannot re-open → do not cite it. **Done when:** `Annotations` holds diff (new, resolved, persisting) and run ids.
- [ ] **Step 3 — Deprecations:** Read vendor deprecation/retirement posts and runner-image announcements since previous report. List every dated change touching these workflows: runtimes, runner images, events, actions. Changelog notice precedes run notice. Each → DEPRECATION with date and bump. Dependency bot already tracks bump → say so; schedule rest next step. **Done when:** `Deprecations` row per dated change: what · date · bump · bot already tracking?
- [ ] **Step 4 — Runtimes:** Every `uses:` (or the CI system's equivalent) in workflows, local composite actions, and reusable workflows — resolved version and declared runtime (e.g. `runs.using`). Action declaring removed runtime (e.g. `node20` after runners dropped it) runs on forced runtime with no opt-out → finding, unless seen working there. List leftover opt-out env keys that no longer change anything. **Done when:** `Runtimes` row per action: version · declared runtime · verdict, plus leftover keys.
- [ ] **Step 5 — Log Warnings:** Some deprecations print only to log. Grep same runs' step logs for deprecation markers (e.g. `DeprecationWarning`, `[DEP0`, `npm warn deprecated`, `WARN  deprecated`, `will be removed`) and CLI outdated notices (e.g. EAS, Expo, Vercel). Verdict each as if annotation. Agree with `bkit-audit-logs` which sweep owns each line — triage once. **Done when:** `Log Warnings` row per line: verdict or owning sweep.
- [ ] **Step 6 — Static Analysis:** Run workflow linters every sweep, not only to verify a fix. Each new finding = annotation: shell issues in `run:` blocks, expression typos, template injection, excessive permissions, unpinned `uses:`. Grep workflows/scripts for deprecated workflow commands (e.g. GitHub Actions `::set-output`, `::save-state`, `::set-env`, `::add-path`) and opt-in re-enabling them (e.g. `ACTIONS_ALLOW_UNSECURE_COMMANDS`). Runner warns on some only at execute — conditional lane hides them. **Done when:** `Static Analysis` row per finding with verdict.
- [ ] **Step 7 — Classify:** One verdict each from `Verdicts`. SILENT FAILURE on sight, e.g. GitHub `Unexpected input(s) '…', valid inputs are …` (misspelled input key, ignored); `No files were found with the provided path` (artifact never uploaded). No forced fit → OTHER. Destinations (next step; this run does not send): real defect → `docs/failures.jsonl` row to append (`@bkit-utility-update-failures` applies); SILENT FAILURE → root cause, fix, guard (`Silent Failures`); DEPRECATION → date and bump, dependency bot first; LINT WARNING → fix or why it stands; DEAD SUPPRESSION → delete directive, wrong-node flag; flake → `bkit-audit-flakes`; runtime error or log-sweep line → `bkit-audit-logs`; standing rule → sentence for testing or deployments doc; workflow change → recommendation needing explicit human confirmation; ACCEPTED → nothing, cite record. **Done when:** every annotation in `Annotations` has verdict and destination.
- [ ] **Step 8 — Silent Failures:** Root-cause each SILENT FAILURE vs runner rules. Annotation = platform vocabulary symptom. Examples (GitHub Actions): `$GITHUB_ENV` blocklists some names (`NODE_OPTIONS` among them) — set as static job-level `env:` keys; `env` context unavailable to job-level `env:` value → shortened form resolves empty, fails quiet; step-level `env:` replaces job-level map (no merge) — overriding one key restates others; managed blocks revert in-marker edits — check key inside managed marker before recommending move. Other CI → equivalent (masked variables, non-merging env, platform-rewritten config). Report names guard fix should carry, proven red by reintroducing bug; where deleting mechanism leaves lane quiet and knob-less → second guard that replacement knob exists. Writing fix = next step. **Done when:** `Silent Failures` names root cause, fix, guard for each.
- [ ] **Step 9 — Lint Node:** Lint annotation or in-code suppression → node rule fires on; count change if directive removed. Reason from per-file diagnostics; do not edit; do not whole-repo typecheck/lint for one file. Language server = one language; workflow files = text search. Dead disable at annotation line with effect further down (comment only) → DEAD SUPPRESSION on wrong node (live rule = LINT WARNING). **Done when:** `Lint` row per warning: node · directive · verdict.
- [ ] **Step 10 — Matchers:** Problem matchers or annotation reporters for typecheck, lint, test output in CI (e.g. `tsc`, ESLint, Vitest). Without them warnings stay in logs — LINT WARNING under-counted. Confirm deprecated-API lint enabled (e.g. `@typescript-eslint/no-deprecated`). Deprecated framework API calls = code-side same deadline. **Done when:** `Matchers` names each reporter and deprecated-API rule: present or absent.
- [ ] **Step 11 — Verified:** Green run does not verify fix to conditional lane. Marker-gated lane needs run carrying marker — deliberate workflow dispatch, not push. State local verification (workflow linters, YAML parse, guard tests, per-file diagnostics) vs still needs real run. Do not dispatch. **Done when:** `Verified` splits local vs still needs a run.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: row per deprecation/retirement announcement in window, deprecated workflow command, linter check class → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching CI signal (workflows, composite actions, reusable workflows, `uses:` pins, runner images, workflow and step `env:` keys, lint config) → one-line verdict each. (b) Bounded ~30 min pass: what senior CI platform engineer flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Workflows untouched:** no workflow, composite action, or CI config edited.
- [ ] **No dispatch:** no workflow run triggered, and no push.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Step reported success while a required operation was refused, skipped, or ignored, and no other check fails |
| `HIGH` | Deprecation whose deadline falls before the next release, or an action on a runtime the runners removed; suppression on the wrong node so the intended rule still fires |
| `MEDIUM` | Lint warning that points at code; deprecation with a deadline still after the next release; dead suppression; static-analysis finding that is not itself a silent failure |
| `LOW` | Leftover env key that changes nothing; accepted annotation with no written record; cosmetic notice |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: silent failures first.

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

### Annotations

PENDING

### Deprecations

PENDING

### Runtimes

PENDING

### Log Warnings

PENDING

### Static Analysis

PENDING

### Silent Failures

PENDING

### Lint

PENDING

### Matchers

PENDING

### Verified

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
- [ ] **Summary:** names count per severity and the runs read.
- [ ] **Series:** new / resolved / persisting counts beside previous report's, or marked baseline.
- [ ] **Verified:** states what was checked locally and what still needs a real run.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
