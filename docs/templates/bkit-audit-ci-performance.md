<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# CI Performance Audit

> [!CAUTION]
> **Purpose:** Where CI wall clock and spend go, which lane holds the run open, and whether a change buys latency or cost.
>
> **Rules:**
>
> - Never dispatch, rerun or cancel a workflow.
> - Name a runner-class experiment, but do not run it.
> - Read the billable rates from the billing pages during this run.
> - Never copy a previous report's prices.

## Universal Instructions

### Context & Goals

CI time gets re-argued from impressions, and two mistakes recur. First, a lane's duration alone does not equal wall-clock savings: only its finish time relative to the run shows whether trimming it helps. Second, cost and latency are different purchases, so state which one a change buys, every time. The failure this audit targets is effort spent on a lane that does not hold the run open, or a latency change reported as money saved.

**Applies when:** the repo has a CI workflow. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when the workflow topology changes (a new lane, runner class or cache).

**Anchor Standards:**

- DORA software delivery performance: change lead time, deployment frequency, failed-deployment recovery time, change fail rate, and deployment rework rate.
- Host CI metrics (e.g. GitHub Actions usage and performance: job run time, queue time, failure rate). Living docs; record the date read.
- Task-runner remote cache and affected selection (e.g. Turborepo remote caching and `--affected`), at the version in the lockfile.
- Package-manager store cache in CI (e.g. pnpm via `actions/setup-node` `cache: pnpm`), at the pinned setup version.
- Browser-test sharding and report merge (e.g. Playwright sharding and `merge-reports`), at the version in the lockfile.
- Concurrency groups and job timeouts (e.g. GitHub Actions `concurrency` and `timeout-minutes`).
- Runner billing (e.g. GitHub-hosted and larger runners, a remote builder such as Depot, mobile-build credits such as EAS). Record the date read.
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Run-level decision matrix; § One run per branch or pull request; § Parallel test lanes (one lane per tier); § turbo `//` over-triggers `web_affected` on docs-only diffs (turbo monorepos); § One CI run per dev commit (release PR mirrors the `dev` push run)
- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § CI verbosity (`[verbose ci]`)

### Scope

- Measure each lane's duration, queue time and finish time, and whether the lane holds the run open.
- Report distributions (p50 and p90), not a single run.
- Check the job timeouts.
- Measure change lead time from push → green → deployed, split by segment.
- On the lanes that matter, measure step timings, cache hit rate, shard balance, per-job setup cost and artifacts.
- Check every cache: hit or miss, restore time against a cold rebuild, and usage against the eviction limit.
- Check what a change actually runs: path filters and required checks.
- Time the local gate separately, with the cache forced off.
- Count re-runs, failures that passed later and duplicate runs, as minutes.
- Measure billable minutes and the cost per successful merge.
- State latency or cost on every finding.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Spend outside CI minutes | The cost audit owns the whole bill | `bkit-audit-cost` |
| Which checks should gate | The gates audit owns it | `bkit-audit-gates` |
| Product request latency | The performance audit owns hot paths | `bkit-audit-app-performance` |
| Why a test flakes, beyond minutes lost | The flakes audit owns it | `bkit-audit-flakes` |
| Changing workflows, runners, or caches | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **CI API:** Steps 2-6, 10-11 — read-only run and job metadata (e.g., `gh run view`, `gh api`). Fallback: use the workflow files only, and mark timings `Not Checked`.
- [ ] **Workflow Files:** Steps 3, 7-10 — readable workflows, task graph and cache config. Fallback: none. Mark those steps `Not Checked`.
- [ ] **Web:** Step 12 — fetch the anchor standards and the current runner prices. Fallback: record the versions and prices as unread. Never reuse a previous report's prices.

#### Conditional

- [ ] **Host Metrics:** **If** the host publishes queue time → Step 3 — the host's queue figures (e.g., the Actions performance page). Fallback: derive queue time from timestamps only.
- [ ] **Cache API:** **If** a cache listing exists → Step 7 — the cache list (e.g., `gh cache list`). Fallback: use log lines only, and mark eviction `Not Checked`.
- [ ] **Remote Builders:** **If** a job only waits on an external builder → Step 6 — the builder API or log (e.g., EAS GraphQL). Fallback: use the wrapper-job duration only, and mark worker time `Not Checked`.
- [ ] **Local Gate:** **If** a pre-push or local CI command exists → Step 9 — that command. Fallback: skip the step with evidence.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Reference:** Name the reference run ids, the event type and the date. A push to the integration branch and a pull request are different pipelines (some lanes run on push only), so never compare them as one number without saying so. Record green or red for each run, because red lanes exit early and under-report duration. Runner classes and external queues drift, so the date matters. **Done when:** `Reference` holds the ids, event types, conclusions and date.
- [ ] **Step 3 — Lanes:** For each job, record the conclusion, duration and start, and a column for whether it holds the run open (duration alone is not that column). Add queue time, because the duration from start to completion hides the runner wait. Queue time = run created → job started. **If** the job has `needs:` → subtract the upstream finish to get the runner wait, and keep the `needs:` wait for Step 5. Cross-check the host's average queue time per job. For example, on GitHub Actions:

  ```
  gh run view <id> --json jobs \
    --jq '.jobs[] | "\(.name)\t\(.conclusion)\t\((((.completedAt|fromdate)-(.startedAt|fromdate))/60)|floor)m\t\(.startedAt)"'
  gh api "repos/{owner}/{repo}/actions/runs/<id>" --jq .created_at
  gh api "repos/{owner}/{repo}/actions/runs/<id>/jobs?per_page=100" \
    --jq '.jobs[] | "\(.name)\t\(.created_at)\t\(.started_at)"'
  ```

  **Done when:** `Lanes` has the duration, queue, finish and holding-the-run-open column for each job.

- [ ] **Step 4 — Distributions:** One run cannot separate a regression from noise. Pull >=20 recent CI workflow runs per event type, and keep green and red apart. Report p50 and p90 for the total wall clock and for the critical-path lane finish, per event type. Say how typical the Step 2 runs are. Check that every job timeout is about 1.5x its p99 (at this sample size, the slowest run). **If** a job has no timeout → it gets the host default (e.g., GitHub Actions 360 minutes) and bills all of it. For example: `gh api "repos/{owner}/{repo}/actions/workflows/<workflow>/runs?event=push&branch=<branch>&per_page=30"`. **Done when:** `Distributions` holds p50 and p90, and each job meets the timeout rule or is a finding.
- [ ] **Step 5 — Lead Time:** Lane finish times are one segment. Report DORA change lead time for a push to the integration branch: push → all lanes green → deployed. Split it into queue (Step 3), critical-path execution, `needs:` waits and re-run time (Step 10). Name the dominating segment, because that is the one worth buying down. **Done when:** `Lead Time` names the split and the dominating segment.
- [ ] **Step 6 — Timings:** Inside the lanes that hold the run open, or that a proposal would trim, record: step timings; the task-runner cache hit rate (zero cached on a lane that should cache is a finding); the test counts executed (wall clock per test compares runs better than wall clock alone); for remote-builder jobs, the builder queue and build time, recorded separately from the wrapper; shard balance (a slowest/fastest ratio above about 1.3x means one shard holds the lane); the fixed cost per job (checkout, toolchain setup, install) x the parallel jobs (splitting buys wall clock, but pays setup again); and artifact upload and download time and stored size (large reports on every green run cost time and storage). For example, run `gh run view <id> --log --job=<jobId>` and grep the cache and executed-count lines. **Done when:** `Timings` holds the hit rate, counts, shard ratio or "not sharded", setup cost and artifact size for each lane that matters.
- [ ] **Step 7 — Caches:** Check every cache, not only the task runner's. Record hit or miss and the restore time for the package-manager store, the framework build cache, browser binaries, native build caches (e.g., Gradle, CocoaPods, hosted mobile builds) and image layer caches. Compare each restore with a cold install. A restore slower than a rebuild is a finding. Compare cache usage with the eviction limit, because a full cache evicts entries that matter. **Done when:** `Caches` holds one row per cache, with hit or miss, restore against cold, and over limit, or the cache is absent with evidence.
- [ ] **Step 8 — Affected:** Check whether PR lanes run only what changed (an affected graph or a path filter). For a docs-only change and a change scoped to one app, read the `on:` triggers, `paths` filters and job-level `if:`, and record which lanes each change starts. **If** a `paths` filter is safe → propose it, and state its interaction with required checks: a workflow skipped by a path filter leaves required checks pending, while a job skipped by `if` reports success. **Done when:** `Affected` says what each sample change starts, and names any required-check trap.
- [ ] **Step 9 — Local:** Time the local gate on the whole tree, with the cache forced off, because warm or affected-only numbers are meaningless. Record it beside the CI critical path. **Done when:** `Local` holds the forced whole-tree time, the command, and whether it is on the critical path.
- [ ] **Step 10 — Reruns:** A red lane costs a full re-run. Read the concurrency block before counting. **If** in-progress runs are not cancelled on the integration branch → a fix-and-repush costs two complete runs. **If** they are cancelled → count the cancelled minutes separately from re-runs. Neither is zero. **If** the flakiest lane is also the slowest lane → it compounds the wall clock. Count its minutes here, and send the cause to `bkit-audit-flakes`. Over the Step 4 window, count the runs with attempt >1, and the jobs that failed then passed on the same commit, per lane, and record both as minutes. Also count the commits that ran under both push and PR, and the runs that completed after a newer run started. **Done when:** `Reruns` holds those minutes, and what the concurrency block does.
- [ ] **Step 11 — Cost:** For the Step 4 window, multiply the billable minutes per lane by the runner class's current per-minute price, and record the remote-builder minutes and mobile-build credits. Read the prices during this run. Derive the cost per successful merge to the integration branch, re-runs included. Spend outside CI minutes goes to `bkit-audit-cost`. Before recommending a runner-class change for a CPU-bound lane, name a one-run experiment on a larger or different-architecture runner that compares cost and duration. Name the experiment only, and do not run it in this audit, because running it changes the workflow. Every finding states whether it buys latency or cost. **Done when:** `Cost` holds the minutes, the current prices, the cost per merge, and the experiment name or "none".
- [ ] **Step 12 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per DORA metric, per host performance metric, and per caching, sharding, concurrency or billing practice in the anchor list, each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 13 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches the pipeline: workflows and composite actions, jobs and `needs:`, runner classes, task-runner config and cache keys, shard settings, remote-build profiles, and the local pre-push gate. (b) In a bounded pass of about 30 minutes, note what a senior CI engineer would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Event types:** push and pull request are never treated as one pipeline.
- [ ] **Prices current:** every rate was read this run, not copied from a previous report.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | There is no green path through the pipeline. A job with no timeout can bill the host maximum on every run |
| `HIGH` | The dominating segment is the one a proposal would not touch. Latency is described as cost savings, or the reverse, on that segment |
| `MEDIUM` | A cache miss on a lane that should cache. Shard imbalance that holds a lane open. Setup cost paid again on every split. Re-run minutes that rival the critical path |
| `LOW` | A slow lane that does not hold the run open. Artifact size that is not on the critical path |

Within a severity, list critical-path findings first. Every finding states whether it buys latency or cost.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and the segment that dominates wall clock.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
