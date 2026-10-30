<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Annotations Triage

> [!CAUTION]
> **Purpose:** Triage CI annotations and warnings beside a green result — silent failures, deprecations with a deadline, and lint warnings including a suppression on the wrong node.
>
> **Rules:**
>
> - Do not edit a workflow, composite action or other CI config.
> - Record a recommended CI change as a finding for a human.
> - NEVER dispatch a workflow, push, or otherwise start a run to verify a fix.

## Universal Instructions

### Context & Goals

Green CI hides costly warnings. The failure this audit targets takes two forms. In the first, a step succeeds while the operation it ran was refused, skipped or ignored, and the annotation was the only signal. In the second, a deprecation with a deadline stays green until the runtime or API is removed, and CI goes red on a date nobody chose.

**Applies when:** CI emits annotations, warnings or notices (e.g., GitHub Actions check-run annotations, GitLab code-quality reports, Buildkite annotations). **If** it emits none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a week, and before every release to the production branch. Sweeps done in passing are not a control. Run an extra pass when a CI-vendor deprecation or retirement post, or a runner-image announcement, touches these workflows; when a workflow, composite action or reusable workflow changes, because a conditional lane annotates only when it runs; and when a deprecation deadline falls before the next weekly sweep.

**Anchor Standards:**

- CI vendor changelog, deprecation, and retirement posts (e.g. GitHub Changelog deprecation label). These are living pages; record the date read.
- Runner-image announcements (e.g. `actions/runner-images` Announcement label). These are living pages; record the date read.
- Workflow command reference, including deprecated commands (e.g. GitHub `set-output`, `save-state`, `set-env`, `add-path`).
- Problem matchers and annotation limits (e.g. `actions/toolkit` problem matchers; per-step and per-job caps).
- Workflow static analysers (e.g. actionlint, zizmor). Record their versions.
- Deprecated-API lint (e.g. typescript-eslint `no-deprecated`). Record the version in the lockfile.

### Scope

- Read the annotations and notices on recent runs of every workflow, including scheduled, manual and bot-triggered runs, not just one pipeline.
- Read deprecation notices in the vendor changelog before they show up as annotations.
- Inventory actions and runtimes, including leftover opt-out env keys.
- Read log lines that never become annotations (deprecations, outdated CLIs).
- Run workflow static analysis, and find deprecated workflow commands that a conditional lane hides.
- Give one verdict per annotation.
- Find the root cause of each silent failure.
- Find which node a lint warning actually trips.
- Check that problem matchers turn lint output into annotations.
- Record what was verified locally, and what still needs a real run.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Runtime errors, and log lines that are not annotations or deprecation warnings | The log sweep owns them | `bkit-audit-logs` |
| Flaky tests | The flake sweep owns them | `bkit-audit-flakes` |
| Whether a static-analysis hit is exploitable | The security sweep owns it | `bkit-audit-security` |
| Applying fixes; changing workflows | The audit only reports | A plan made from this report |

### Verdicts

Give each annotation one verdict. **SILENT FAILURE** outranks every other verdict.

- **SILENT FAILURE:** the step reported success, but the annotation says the operation was refused, skipped or ignored. The report names the root cause, and the fix is the next step.
- **DEPRECATION:** an action, runtime or API has an announced end date. The report names the date and the bump, and scheduling it is the next step.
- **LINT WARNING:** a real warning that points at code. The report says the fix, or why the warning stands. Do not edit the code here.
- **DEAD SUPPRESSION:** a disable comment with nothing left to disable. The report says to delete it, and whether it sat on the wrong node. Do not delete it here.
- **ACCEPTED:** the annotation is known and already recorded. Say where, and skip it.
- **OTHER:** it fits no other verdict. Resolve to one of the above if you can; otherwise say what it is and why it fits none. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **CI Read:** Steps 2, 5, 11 — annotations and step logs for recent runs of every workflow (e.g., `gh api` check-run annotations, `gh run view --log`, GitLab job-trace API). Log access: the `context-fetch` blocks below `bkit:end` in `.agents/context.md` are ready-made read-only readers. `bkit context list-blocks` prints each block's `context` and `body`. Set a body's `# Customise:` knobs to the audit window, and run it with `direnv exec . bash`. Fallback: read saved logs, and mark the runs not fetched `Not Checked`.
- [ ] **Workflow Files:** Steps 4, 6, 8 — the workflows, composite actions and reusable workflows on disk. Fallback: none.
- [ ] **Web:** Steps 3, 12 — the vendor changelog, runner-image announcements and anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Workflow Linters:** **If** workflows are on disk → Step 6 (e.g., actionlint, zizmor, shellcheck). Fallback: read the workflows, and name each check skipped.
- [ ] **Language Server:** **If** the language is typed **and** there is a lint annotation → Step 9 — per-file diagnostics (e.g., Serena, `tsserver`). Fallback: lint that file, and say so. An empty result is inconclusive, so corroborate it with a text search.
- [ ] **Deprecated-API Lint:** **If** the language is typed → Step 10 (e.g., `@typescript-eslint/no-deprecated`). Fallback: text search for known deprecated calls, and record the under-count.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Collect:** **If** there is no CI → write one `N/A` row with evidence, then **STOP**. **Else** → read the annotation lists for recent runs of every workflow, not the last run of one pipeline, because deprecations surface on whichever workflow uses the old action. Include scheduled, manual and bot-triggered runs. Collect them mechanically, not by eye from the UI. The window runs from the previous report, and covers at least the latest completed run of each workflow. Save the list, and diff it against the previous report: new, resolved and persisting. Annotations are capped (e.g., GitHub allows 10 warnings, 10 errors and 10 notices per step, and 50 per job). **If** a step is at the cap → grep its raw job log for warning and error markers, and triage the overflow. Record the run ids and the commit. **If** you cannot re-open an id, run or path → do not cite it. **Done when:** `Annotations` holds the diff (new, resolved, persisting) and the run ids.
- [ ] **Step 3 — Deprecations:** Read the vendor's deprecation and retirement posts and the runner-image announcements since the previous report. List every dated change that touches these workflows: runtimes, runner images, events and actions. The changelog notice comes before the run notice. Give each one a DEPRECATION verdict with its date and bump. **If** a dependency bot already tracks the bump → say so. Schedule the rest as the next step. **Done when:** `Deprecations` holds one row per dated change: what · date · bump · bot already tracking?
- [ ] **Step 4 — Runtimes:** For every `uses:` (or the CI system's equivalent) in workflows, local composite actions and reusable workflows, record the resolved version and the declared runtime (e.g., `runs.using`). An action that declares a removed runtime (e.g., `node20` after the runners dropped it) runs on a forced runtime with no opt-out, and is a finding unless it has been seen working there. List leftover opt-out env keys that no longer change anything. **Done when:** `Runtimes` holds one row per action: version · declared runtime · verdict, plus the leftover keys.
- [ ] **Step 5 — Log Warnings:** Some deprecations print only to the log. Grep the same runs' step logs for deprecation markers (e.g., `DeprecationWarning`, `[DEP0`, `npm warn deprecated`, `WARN  deprecated`, `will be removed`) and for outdated-CLI notices (e.g., EAS, Expo, Vercel). Give each line a verdict as if it were an annotation. Agree with `bkit-audit-logs` which sweep owns each line, so it is triaged once. **Done when:** `Log Warnings` holds one row per line: verdict or owning sweep.
- [ ] **Step 6 — Static Analysis:** Run the workflow linters on every sweep, not only to verify a fix. Treat each new finding as an annotation: shell issues in `run:` blocks, expression typos, template injection, excessive permissions and unpinned `uses:`. Grep workflows and scripts for deprecated workflow commands (e.g., GitHub Actions `::set-output`, `::save-state`, `::set-env`, `::add-path`) and for opt-ins that re-enable them (e.g., `ACTIONS_ALLOW_UNSECURE_COMMANDS`). The runner warns about some of these only when they execute, so a conditional lane hides them. **Done when:** `Static Analysis` holds one row per finding, with its verdict.
- [ ] **Step 7 — Classify:** Give each annotation one verdict from `Verdicts`. Some annotations are a SILENT FAILURE on sight, e.g., GitHub's `Unexpected input(s) '…', valid inputs are …` (a misspelled input key, ignored) and `No files were found with the provided path` (the artifact was never uploaded). **If** no verdict fits without forcing → use OTHER. Record each annotation's destination; sending it is the next step, not this run's job, and the audit agent writes the `docs/failures.jsonl` rows. Destinations: a real defect → a `docs/failures.jsonl` row; SILENT FAILURE → root cause, fix and guard (`Silent Failures`); DEPRECATION → date and bump, dependency bot first; LINT WARNING → the fix, or why it stands; DEAD SUPPRESSION → delete the directive, flagging a wrong node; a flake → `bkit-audit-flakes`; a runtime error or a line the log sweep owns → `bkit-audit-logs`; a standing rule → a sentence for the testing or deployments doc; a workflow change → a recommendation that needs explicit human confirmation; ACCEPTED → nothing, citing the record. **Done when:** every annotation in `Annotations` has a verdict and a destination.
- [ ] **Step 8 — Silent Failures:** Find the root cause of each SILENT FAILURE in the runner's rules. The annotation is the symptom, in the platform's vocabulary. Examples from GitHub Actions: `$GITHUB_ENV` blocklists some names (`NODE_OPTIONS` among them), so set them as static job-level `env:` keys; the `env` context is not available to a job-level `env:` value, so the shortened form resolves empty and fails quietly; a step-level `env:` replaces the job-level map instead of merging, so overriding one key means restating the others; and managed blocks revert edits inside their markers, so check whether a key sits inside a managed marker before recommending a move. On other CI, look for the equivalents (masked variables, env that does not merge, config the platform rewrites). The report names the guard the fix should carry, proven red by reintroducing the bug. **If** deleting the mechanism leaves the lane quiet with no knob → name a second guard that checks the replacement knob exists. Writing the fix is the next step. **Done when:** `Silent Failures` names the root cause, fix and guard for each.
- [ ] **Step 9 — Lint Node:** For each lint annotation or in-code suppression, find the node the rule fires on, and how the count changes if the directive is removed. Reason from per-file diagnostics. Do not edit the code, and do not typecheck or lint the whole repo for one file. A language server covers one language; use text search for workflow files. **If** a disable comment sits at the annotation line, but the rule's effect is further down → it is a DEAD SUPPRESSION on the wrong node (comment only), and the live rule is a LINT WARNING. **Done when:** `Lint` holds one row per warning: node · directive · verdict.
- [ ] **Step 10 — Matchers:** Check for problem matchers or annotation reporters on typecheck, lint and test output in CI (e.g., `tsc`, ESLint, Vitest). Without them, warnings stay in the logs, and LINT WARNING is under-counted. Confirm that the deprecated-API lint is enabled (e.g., `@typescript-eslint/no-deprecated`). Calls to deprecated framework APIs are the code-side version of the same deadline. **Done when:** `Matchers` names each reporter and the deprecated-API rule: present or absent.
- [ ] **Step 11 — Verified:** A green run does not verify a fix to a conditional lane. A lane gated on a marker needs a run that carries the marker, which means a deliberate workflow dispatch, not a push. State what was verified locally (workflow linters, YAML parse, guard tests, per-file diagnostics), and what still needs a real run. Do not dispatch. **Done when:** `Verified` splits what was checked locally from what still needs a run.
- [ ] **Step 12 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per deprecation or retirement announcement in the window, one per deprecated workflow command and one per linter check class, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 13 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches the CI signal: workflows, composite actions, reusable workflows, `uses:` pins, runner images, workflow and step `env:` keys, or lint config. (b) In a bounded pass of about 30 minutes, note what a senior CI platform engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Workflows untouched:** no workflow, composite action or CI config was edited.
- [ ] **No dispatch:** no workflow run was triggered.
- [ ] **No push:** nothing was pushed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A step reported success while a required operation was refused, skipped or ignored, and no other check fails |
| `HIGH` | A deprecation whose deadline falls before the next release, or an action on a runtime the runners removed. A suppression on the wrong node, so the intended rule still fires |
| `MEDIUM` | A lint warning that points at code. A deprecation whose deadline is still after the next release. A dead suppression. A static-analysis finding that is not itself a silent failure |
| `LOW` | A leftover env key that changes nothing. An accepted annotation with no written record. A cosmetic notice |

Within a severity, list silent failures first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and the runs read.
- [ ] **Series:** the report shows new / resolved / persisting counts beside the previous report's numbers, or marks the run as baseline.
- [ ] **Verified:** `Verified` states what was checked locally and what still needs a real run.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
