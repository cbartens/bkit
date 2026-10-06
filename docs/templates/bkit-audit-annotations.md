<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Annotations Triage

> [!CAUTION]
> **Purpose:** Triage CI annotations and warnings beside a green result — silent failures, deprecations with a deadline, and lint warnings including a suppression on the wrong node.
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
> - NEVER edit a workflow, composite action, or other CI config; a recommended change is a finding for a human.
> - NEVER dispatch a workflow, push, or otherwise start a run to verify a fix.

## Universal Instructions

### Context & Goals

An annotation costs nothing to ignore: the job is green, the change merges, and the warning is emitted again next run. Two failures hide there. A step reports success while the operation was refused, skipped, or ignored — the annotation was the only signal. A deprecation with a deadline stays green until the runtime or API disappears, and CI goes red on a date nobody chose. Lint warnings are the third population, and the expensive one is a suppression on the wrong node: a dead disable on one line, while the node that trips the rule sits further down with only a comment. Reading the annotation's line and assuming the directive above it is the relevant one is how that survives.

**Applies when:** CI emits annotations, warnings, or notices (e.g. GitHub Actions check-run annotations, GitLab code-quality reports, Buildkite annotations). None → one `N/A` row with evidence, never "clean".

**Cadence:** weekly, and before every release to the production branch. A sweep done in passing during other work is not a control. Extra pass when a CI-vendor deprecation or retirement post, or a runner-image announcement, touches these workflows; when a workflow, composite action, or reusable workflow changes (a conditional lane only annotates when it runs); when a deprecation's dated deadline falls before the next weekly sweep.

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

- **SILENT FAILURE:** the step reported success, but the annotation says the operation was refused, skipped, or ignored. The report names the root cause. The fix is the next step.
- **DEPRECATION:** an action, runtime, or API with an announced end date. The report names the date and the bump. Scheduling it is the next step.
- **LINT WARNING:** a real warning that points at code. The report says fix, or why it stands. Do not edit the code here.
- **DEAD SUPPRESSION:** a disable comment with nothing left to disable. The report says delete it, and whether it sat on the wrong node. Do not delete it here.
- **ACCEPTED:** known, and already recorded. Say where, and skip.
- **OTHER:** fits none. Resolve it to one of the above if you can; otherwise say what it is and why it fits none. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Collect:** No CI → one `N/A` row with evidence and STOP. Else read annotation lists for recent runs of every workflow, not the last run of one pipeline. Deprecations surface on whichever workflow uses the old action. Include scheduled, manual, and bot-triggered runs. Collect mechanically, not by eye from the UI. Window = since the previous report, and at least the latest completed run of each workflow. Save the list and diff it against the previous report: new, resolved, persisting. Annotations are capped (e.g. GitHub: 10 warnings, 10 errors, and 10 notices per step, and 50 per job). For any step at the cap, grep the raw job log for warning and error markers so the overflow is triaged too. Record run ids and the commit. An id, run, or path you cannot re-open → do not cite it. **Done when:** `Annotations` holds the diff (new, resolved, persisting) and the run ids.
- [ ] **Step 3 — Deprecations:** Read vendor deprecation and retirement posts, and runner-image announcements, since the previous report. List every dated change that touches these workflows: runtimes, runner images, events, actions. A changelog notice comes earlier than a notice on a run. Each gets DEPRECATION, with its date and the bump. A dependency bot that already tracks the bump → say so; scheduling the rest is the next step. **Done when:** `Deprecations` row per dated change: what · date · bump · bot already tracking?
- [ ] **Step 4 — Runtimes:** Every `uses:` in workflows, local composite actions, and reusable workflows, with its resolved version and the runtime that version declares (e.g. `runs.using`). An action still declaring a removed runtime (e.g. `node20` after runners dropped it) now runs on the forced runtime with no opt-out → finding, unless it has been seen working there. List leftover opt-out env keys that no longer change anything, for removal. **Done when:** `Runtimes` row per action: version · declared runtime · verdict, plus leftover keys.
- [ ] **Step 5 — Log Warnings:** Some deprecations only print to the log. Grep the step logs of the same runs for deprecation markers (e.g. `DeprecationWarning`, `[DEP0`, `npm warn deprecated`, `WARN  deprecated`, `will be removed`) and for CLI outdated notices (e.g. EAS, Expo, Vercel). Give each a verdict as if it were an annotation. Agree with `bkit-audit-logs` which sweep owns each line, so it is triaged once. **Done when:** `Log Warnings` row per line: verdict or the sweep that owns it.
- [ ] **Step 6 — Static Analysis:** Run workflow linters every sweep, not only to verify a fix. Treat each new finding as an annotation: shell issues in `run:` blocks, expression typos, template injection, excessive permissions, unpinned `uses:`. Grep workflows and scripts for deprecated workflow commands (e.g. `::set-output`, `::save-state`, `::set-env`, `::add-path`) and for an opt-in that re-enables them (e.g. `ACTIONS_ALLOW_UNSECURE_COMMANDS`). The runner warns about some of these only when they execute, so a conditional lane hides them. **Done when:** `Static Analysis` row per finding with verdict.
- [ ] **Step 7 — Classify:** One verdict each, from `Verdicts`. Treat as SILENT FAILURE on sight, e.g. GitHub `Unexpected input(s) '…', valid inputs are …` (a misspelled input key, ignored) and `No files were found with the provided path` (an artifact that never uploaded). No forced fit → OTHER. Destinations, all next step, this run does not send them: a real defect → the `docs/failures.jsonl` row to append (`@bkit-utility-update-failures` applies it); SILENT FAILURE → root cause, fix, and guard (`Silent Failures`); DEPRECATION → date and bump, dependency bot first; LINT WARNING → the fix, or why it stands; DEAD SUPPRESSION → the directive to delete, and whether it sat on the wrong node; a flake → `bkit-audit-flakes`; a runtime error, or a log line the log sweep owns → `bkit-audit-logs`; a standing rule → the sentence to add to the testing or deployments doc; any workflow change → a recommendation that needs explicit human confirmation; ACCEPTED → nothing, and where it is recorded. **Done when:** every annotation in `Annotations` has a verdict and a destination.
- [ ] **Step 8 — Silent Failures:** Root-cause each SILENT FAILURE against the runner's own rules. The annotation names a symptom in the platform's vocabulary. Examples (GitHub Actions): `$GITHUB_ENV` blocklists some names (`NODE_OPTIONS` among them) — set those as static job-level `env:` keys; the `env` context is not available to a job-level `env:` value, so a shortened form resolves empty and fails in the quiet direction; a step-level `env:` replaces the job-level map rather than merging — a step that overrides one key must restate the others; managed blocks revert in-marker edits — check whether the key sits inside a managed marker before recommending a move. Other CI → the equivalent (masked variables, non-merging env, config the platform rewrites). The report names the guard the fix should carry, proven red by putting the bug back, and, where deleting the mechanism would leave the lane both quiet and knob-less, a second guard that the replacement knob exists. Writing that fix is the next step. **Done when:** `Silent Failures` names root cause, fix, and guard for each.
- [ ] **Step 9 — Lint Node:** Lint annotation or in-code suppression → which node the rule actually fires on, and whether the count would change if this directive were removed. Reason from per-file diagnostics; do not edit, and do not run a whole-repo typecheck or lint to answer one file. The language server reads one language; workflow files stay a text search. A dead disable at the annotation's line, with the effect further down carrying only a comment, is DEAD SUPPRESSION on the wrong node (the live rule is a LINT WARNING). **Done when:** `Lint` row per warning: node · directive · verdict.
- [ ] **Step 10 — Matchers:** Problem matchers, or reporters that emit annotations, exist for typecheck, lint, and test output in CI (e.g. `tsc`, ESLint, Vitest). Without them those warnings live only in the logs, and LINT WARNING is under-counted. Confirm a deprecated-API lint is enabled (e.g. `@typescript-eslint/no-deprecated`). Calls to deprecated framework APIs are the code-side version of the same deadline. **Done when:** `Matchers` names each reporter and the deprecated-API rule: present or absent.
- [ ] **Step 11 — Verified:** A green run does not verify a fix to a conditional lane. A marker-gated lane needs a run that actually carries the marker — a deliberate workflow dispatch, not a push. State what was verified locally (workflow linters, YAML parse, guard tests, per-file diagnostics) and what still needs a real run. Do not dispatch. **Done when:** `Verified` splits local vs still needs a run.
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per deprecation or retirement announcement in the window, deprecated workflow command, and linter check class → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching CI's signal (workflows, composite actions, reusable workflows, `uses:` pins, runner images, workflow, and step `env:` keys, lint config) → one-line verdict each. (b) Bounded ~30 min pass: what a senior CI platform engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

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

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

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
