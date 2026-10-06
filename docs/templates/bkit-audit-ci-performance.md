<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# CI Performance Audit

> [!CAUTION]
> **Purpose:** Where CI wall clock and spend go, which lane holds the run open, and whether a change buys latency or cost.
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
> - NEVER dispatch, rerun, or cancel a workflow. A runner-class experiment is named, not run.
> - Billable rates are read this run from the billing pages. NEVER copy a previous report's prices.

## Universal Instructions

### Context & Goals

CI time gets re-argued from impressions. Two mistakes recur. A lane's own duration says nothing: only its finish time relative to the run's shows whether trimming it saves wall clock. Cost and latency are different purchases: state which a change buys, every time. Target failure: effort spent on a lane that does not hold the run open, or a latency change reported as money saved.

**Applies when:** a CI workflow. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when workflow topology changes: a new lane, a runner class, or a cache.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- DORA software delivery performance: change lead time, deployment frequency, failed-deployment recovery time, change fail rate, and deployment rework rate.
- Host CI metrics (e.g. GitHub Actions usage and performance: job run time, queue time, failure rate). Living docs; record the date read.
- Task-runner remote cache and affected selection (e.g. Turborepo remote caching and `--affected`), at the version in the lockfile.
- Package-manager store cache in CI (e.g. pnpm via `actions/setup-node` `cache: pnpm`), at the pinned setup version.
- Browser-test sharding and report merge (e.g. Playwright sharding and `merge-reports`), at the version in the lockfile.
- Concurrency groups and job timeouts (e.g. GitHub Actions `concurrency` and `timeout-minutes`).
- Runner billing (e.g. GitHub-hosted and larger runners, a remote builder such as Depot, mobile-build credits such as EAS). Record the date read.

### Scope

- Per-lane duration, queue, and finish time, and whether the lane holds the run open.
- Distributions (p50 and p90), not a single run, and job timeouts.
- Change lead time from push to green to deployed, split by segment.
- Step timings, cache hit rate, shard balance, per-job setup cost, and artifacts, on the lanes that matter.
- Every cache: hit or miss, restore time against a cold rebuild, usage against the eviction limit.
- What a change actually runs, including path filters and required checks.
- The local gate, timed separately, with cache forced off.
- Re-runs, failures that passed later, and duplicate runs, as minutes.
- Billable minutes and cost per successful merge. Latency or cost, stated on every finding.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Spend outside CI minutes | Whole bill | `bkit-audit-cost` |
| Which checks should gate | Gate sweep | `bkit-audit-gates` |
| Product request latency | Hot paths | `bkit-audit-app-performance` |
| Why a test flakes, beyond minutes lost | Flake sweep | `bkit-audit-flakes` |
| Changing workflows, runners, or caches | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **CI API:** Steps 2–6, 10–11 — read-only run and job metadata, e.g. `gh run view`, `gh api`. Fallback: workflow files only; timings `Not Checked`.
- [ ] **Workflow Files:** Steps 3, 7–10 — workflows, task graph, and cache config readable. Fallback: none; those steps `Not Checked`.
- [ ] **Web:** Step 12 — fetch anchor standards and current runner prices. Fallback: versions and prices recorded as unread. NEVER reuse a previous report's prices.

#### Conditional

Verify only when applicable.

- [ ] **Host Metrics:** The host publishes queue time → Step 3 — e.g. the Actions performance page. Fallback: queue computed from timestamps only.
- [ ] **Cache API:** A cache listing exists → Step 7 — e.g. `gh cache list`. Fallback: log lines only; eviction `Not Checked`.
- [ ] **Remote Builders:** A job only waits on an external builder → Step 6 — builder API or log, e.g. EAS GraphQL. Fallback: wrapper-job duration only; worker time `Not Checked`.
- [ ] **Local Gate:** A pre-push or local CI command exists → Step 9. Fallback: skip with evidence.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Reference:** Name the reference run ids, their event type, and the date. A push to the integration branch and a pull request are different pipelines (some lanes are push-only). Never compare them as one number without saying so. Record whether each run was green. A red lane exits early and under-reports its own duration. Runner classes and external queues drift, so the date matters. **Done when:** `Reference` holds ids, event types, conclusions, and the date.
- [ ] **Step 3 — Lanes:** Per job: conclusion, duration, start, and a column for whether it holds the run open. Duration alone is not that column. Add queue time. Duration from start to completion hides time waiting for a runner. Queue = run created → job started; a job with `needs:` also waits on those jobs, so subtract their finish to get runner wait, and keep the `needs:` wait for Step 5. Cross-check the host's average queue time per job. e.g. GitHub Actions:

  ```
  gh run view <id> --json jobs \
    --jq '.jobs[] | "\(.name)\t\(.conclusion)\t\((((.completedAt|fromdate)-(.startedAt|fromdate))/60)|floor)m\t\(.startedAt)"'
  gh api "repos/{owner}/{repo}/actions/runs/<id>" --jq .created_at
  gh api "repos/{owner}/{repo}/actions/runs/<id>/jobs?per_page=100" \
    --jq '.jobs[] | "\(.name)\t\(.created_at)\t\(.started_at)"'
  ```

  **Done when:** `Lanes` has duration, queue, finish, and holding-the-run-open per job.

- [ ] **Step 4 — Distributions:** One run cannot tell a regression from noise. Pull at least 20 recent runs of the CI workflow per event type. Keep green and red runs apart. Report p50 and p90 for total wall clock and for the finish time of the critical-path lane, per event type. Say how typical the Step 2 runs are. Every job sets a timeout at roughly 1.5× its p99 (in a sample this size, its slowest run). A job with no timeout runs until the host default (e.g. GitHub Actions, 360 minutes) and bills for all of it. e.g. `gh api "repos/{owner}/{repo}/actions/workflows/<workflow>/runs?event=push&branch=<branch>&per_page=30"`. **Done when:** p50 and p90 in `Distributions`, and each job is within its timeout rule or is a finding.
- [ ] **Step 5 — Lead Time:** Lane finish times are one segment. Report DORA change lead time for a push to the integration branch: from the push, to all lanes green, to deployed. Split into queue (Step 3), critical-path execution, `needs:` waits, and re-run time (Step 10). Name the segment that dominates. That is the one worth buying down. **Done when:** `Lead Time` names the split and the dominating segment.
- [ ] **Step 6 — Timings:** Inside the lanes that hold the run open, or that a proposal would trim. Step timings. Task-runner cache hit rate: zero cached on a lane that should cache = finding. Test counts executed: wall clock per test compares across runs better than wall clock alone. A job that only wraps a remote builder hides the real work; record builder queue and build time separately from the wrapper. Shard balance: slowest shard over fastest, above about 1.3× means one shard holds the lane open. Fixed cost per job: checkout, toolchain setup, and install, multiplied by the number of parallel jobs. Splitting a lane buys wall clock and pays that setup again. Artifact upload and download time, and stored size. Large reports uploaded on every green run cost time and storage. e.g. `gh run view <id> --log --job=<jobId>` and grep cache and executed-count lines. **Done when:** `Timings` holds hit rate, counts, shard ratio or "not sharded", setup cost, and artifact size for each lane that matters.
- [ ] **Step 7 — Caches:** Every cache, not only the task runner. Record hit or miss and restore time: package-manager store, framework build cache, browser binaries, native build caches (e.g. Gradle, CocoaPods, hosted mobile builds), and image layer caches. Compare restore time with a cold install. A cache slower to restore than to rebuild = finding. Check cache usage against the eviction limit. A full cache evicts entries that matter. **Done when:** `Caches` row per cache: hit or miss · restore vs cold · over the limit, or absent with evidence.
- [ ] **Step 8 — Affected:** Do pull-request lanes run only what changed (affected graph, or a path filter)? For a docs-only change and for a change scoped to one app, read `on:` triggers, `paths` filters, and job-level `if:` conditions, and say which lanes each would start. Where a `paths` filter is safe, propose it, and say how it interacts with required checks. A workflow skipped by a path filter leaves its required checks pending. A job skipped by `if` reports success. **Done when:** `Affected` says what each sample change starts, and names any required-check trap.
- [ ] **Step 9 — Local:** Time the local gate against the whole tree with cache forced off. A warm or affected-only number is meaningless. Record that time beside the CI critical path. **Done when:** `Local` holds the forced whole-tree time, the command, and whether it is on the critical path.
- [ ] **Step 10 — Reruns:** A red lane costs a full re-run. Read the concurrency block before counting. If in-progress runs are not cancelled on the integration branch, a fix-and-repush is two complete runs. If they are cancelled, count cancelled minutes separately from re-runs, and do not treat either as zero. The flakiest lane being the slowest lane compounds wall clock; the minutes belong in this ranking, and the cause belongs to `bkit-audit-flakes`. Over the Step 4 window: runs with attempt above 1, and jobs that failed then passed on the same commit, per lane. Turn both into minutes. Also count commits that ran under both push and pull request, and runs that went to completion after a newer run had started. **Done when:** `Reruns` holds those minutes and what the concurrency block actually does.
- [ ] **Step 11 — Cost:** For the Step 4 window, billable minutes per lane times that runner class's current per-minute price, remote-builder minutes, and mobile-build credits. Read the prices this run. Derive the cost per successful merge to the integration branch, re-runs included. Spend outside CI minutes → `bkit-audit-cost`. Before recommending a runner class change for a CPU-bound lane, name the one-run experiment on a larger or different-architecture runner that would compare cost and duration. Running it is the next step, because it changes a workflow. Every finding states whether it buys latency or cost. **Done when:** `Cost` holds minutes, current prices, cost per merge, and the experiment name or "none".
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per DORA metric, host performance metric, and caching, sharding, concurrency, or billing practice in the anchor list → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching the pipeline (workflows and composite actions, jobs, and their `needs:`, runner classes, task-runner config and cache keys, shard settings, remote-build profiles, the local pre-push gate) → one-line verdict each. (b) Bounded ~30 min pass: what a senior CI engineer flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Event types:** push and pull request are never treated as one pipeline.
- [ ] **Prices current:** every rate was read this run, not copied from a prior report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | No green path through the pipeline; a job with no timeout can bill the host maximum on every run |
| `HIGH` | The dominating segment is the one a proposal would not touch; latency described as cost savings, or the reverse, on that segment |
| `MEDIUM` | Cache miss on a lane that should cache; shard imbalance holding a lane open; setup cost paid again on every split; re-run minutes that rival the critical path |
| `LOW` | A slow lane that does not hold the run open; artifact size that is not on the critical path |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: critical path first. Every finding states whether it buys latency or cost.

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

### Reference

PENDING

### Lanes

PENDING

### Distributions

PENDING

### Lead Time

PENDING

### Timings

PENDING

### Caches

PENDING

### Affected

PENDING

### Local

PENDING

### Reruns

PENDING

### Cost

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
- [ ] **Summary:** names count per severity and the segment that dominates wall clock.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
