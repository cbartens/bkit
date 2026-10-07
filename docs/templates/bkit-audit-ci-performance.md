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

CI time gets re-argued from impressions. Two mistakes recur:

- Lane duration alone ≠ wall-clock savings — only finish time relative to the run shows whether trimming it helps.
- Cost and latency are different purchases: state which a change buys, every time.
- Target failure: effort on a lane that does not hold the run open, or a latency change reported as money saved.

**Applies when:** a CI workflow. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly; extra pass when workflow topology changes (new lane, runner class, or cache).

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- DORA software delivery performance: change lead time, deployment frequency, failed-deployment recovery time, change fail rate, and deployment rework rate.
- Host CI metrics (e.g. GitHub Actions usage and performance: job run time, queue time, failure rate). Living docs; record the date read.
- Task-runner remote cache and affected selection (e.g. Turborepo remote caching and `--affected`), at the version in the lockfile.
- Package-manager store cache in CI (e.g. pnpm via `actions/setup-node` `cache: pnpm`), at the pinned setup version.
- Browser-test sharding and report merge (e.g. Playwright sharding and `merge-reports`), at the version in the lockfile.
- Concurrency groups and job timeouts (e.g. GitHub Actions `concurrency` and `timeout-minutes`).
- Runner billing (e.g. GitHub-hosted and larger runners, a remote builder such as Depot, mobile-build credits such as EAS). Record the date read.

### Scope

- Per-lane duration, queue, finish time, and whether the lane holds the run open.
- Distributions (p50 and p90), not a single run, and job timeouts.
- Change lead time push → green → deployed, split by segment.
- Step timings, cache hit rate, shard balance, per-job setup cost, artifacts — on lanes that matter.
- Every cache: hit or miss, restore time vs cold rebuild, usage vs eviction limit.
- What a change actually runs: path filters and required checks.
- Local gate, timed separately, cache forced off.
- Re-runs, failures that passed later, duplicate runs — as minutes.
- Billable minutes and cost per successful merge; latency or cost on every finding.

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
- [ ] **Workflow Files:** Steps 3, 7–10 — workflows, task graph, cache config readable. Fallback: none; those steps `Not Checked`.
- [ ] **Web:** Step 12 — fetch anchor standards and current runner prices. Fallback: versions and prices unread. NEVER reuse a previous report's prices.

#### Conditional

Verify only when applicable.

- [ ] **Host Metrics:** Host publishes queue time → Step 3 — e.g. Actions performance page. Fallback: queue from timestamps only.
- [ ] **Cache API:** Cache listing exists → Step 7 — e.g. `gh cache list`. Fallback: log lines only; eviction `Not Checked`.
- [ ] **Remote Builders:** Job only waits on external builder → Step 6 — builder API or log, e.g. EAS GraphQL. Fallback: wrapper-job duration only; worker time `Not Checked`.
- [ ] **Local Gate:** Pre-push or local CI command exists → Step 9. Fallback: skip with evidence.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Reference:** Name reference run ids, event type, date. Push to integration branch vs pull request = different pipelines (some lanes push-only); never compare as one number without saying so. Record green/red per run — red lanes exit early and under-report duration. Runner classes and external queues drift; date matters. **Done when:** `Reference` holds ids, event types, conclusions, date.
- [ ] **Step 3 — Lanes:** Per job: conclusion, duration, start, column for holds-the-run-open (duration alone is not that column). Add queue time — duration start→completion hides runner wait. Queue = run created → job started; with `needs:` subtract upstream finish for runner wait; keep `needs:` wait for Step 5. Cross-check host average queue per job. e.g. GitHub Actions:

  ```
  gh run view <id> --json jobs \
    --jq '.jobs[] | "\(.name)\t\(.conclusion)\t\((((.completedAt|fromdate)-(.startedAt|fromdate))/60)|floor)m\t\(.startedAt)"'
  gh api "repos/{owner}/{repo}/actions/runs/<id>" --jq .created_at
  gh api "repos/{owner}/{repo}/actions/runs/<id>/jobs?per_page=100" \
    --jq '.jobs[] | "\(.name)\t\(.created_at)\t\(.started_at)"'
  ```

  **Done when:** `Lanes` has duration, queue, finish, holding-the-run-open per job.

- [ ] **Step 4 — Distributions:** One run cannot separate regression from noise. Pull ≥20 recent CI workflow runs per event type; keep green and red apart. Report p50 and p90 for total wall clock and critical-path lane finish, per event type. Say how typical Step 2 runs are. Every job timeout ≈1.5× its p99 (in this sample size, slowest run). No timeout → host default (e.g. GitHub Actions 360 minutes) and bills all of it. e.g. `gh api "repos/{owner}/{repo}/actions/workflows/<workflow>/runs?event=push&branch=<branch>&per_page=30"`. **Done when:** p50 and p90 in `Distributions`; each job within timeout rule or finding.
- [ ] **Step 5 — Lead Time:** Lane finish times = one segment. Report DORA change lead time for push to integration branch: push → all lanes green → deployed. Split queue (Step 3), critical-path execution, `needs:` waits, re-run time (Step 10). Name dominating segment — that is the one worth buying down. **Done when:** `Lead Time` names split and dominating segment.
- [ ] **Step 6 — Timings:** Inside lanes that hold the run open or that a proposal would trim: step timings; task-runner cache hit rate (zero cached on a lane that should cache = finding); test counts executed (wall clock per test compares runs better than wall clock alone); remote-builder jobs — record builder queue and build time separately from wrapper; shard balance — slowest/fastest >~1.3× means one shard holds the lane; fixed cost per job (checkout, toolchain setup, install) × parallel jobs (splitting buys wall clock, pays setup again); artifact upload/download time and stored size (large reports every green run cost time and storage). e.g. `gh run view <id> --log --job=<jobId>` and grep cache and executed-count lines. **Done when:** `Timings` holds hit rate, counts, shard ratio or "not sharded", setup cost, artifact size per lane that matters.
- [ ] **Step 7 — Caches:** Every cache, not only task runner. Hit or miss and restore time: package-manager store, framework build cache, browser binaries, native build caches (e.g. Gradle, CocoaPods, hosted mobile builds), image layer caches. Compare restore vs cold install — restore slower than rebuild = finding. Cache usage vs eviction limit — full cache evicts entries that matter. **Done when:** `Caches` row per cache: hit or miss · restore vs cold · over limit, or absent with evidence.
- [ ] **Step 8 — Affected:** Do PR lanes run only what changed (affected graph or path filter)? For docs-only change and one-app-scoped change, read `on:` triggers, `paths` filters, job-level `if:` — which lanes each starts. Where `paths` filter is safe, propose it and say required-check interaction: workflow skipped by path filter leaves required checks pending; job skipped by `if` reports success. **Done when:** `Affected` says what each sample change starts and names any required-check trap.
- [ ] **Step 9 — Local:** Time local gate on whole tree, cache forced off — warm or affected-only numbers are meaningless. Record beside CI critical path. **Done when:** `Local` holds forced whole-tree time, command, whether on critical path.
- [ ] **Step 10 — Reruns:** Red lane costs full re-run. Read concurrency block before counting. If in-progress runs not cancelled on integration branch, fix-and-repush = two complete runs; if cancelled, count cancelled minutes separately from re-runs — neither is zero. Flakiest lane slowest lane compounds wall clock; minutes here, cause → `bkit-audit-flakes`. Over Step 4 window: runs attempt >1; jobs failed then passed same commit, per lane — both → minutes. Also commits under both push and PR; runs completing after newer run started. **Done when:** `Reruns` holds those minutes and what concurrency block does.
- [ ] **Step 11 — Cost:** For Step 4 window: billable minutes per lane × runner class current per-minute price, remote-builder minutes, mobile-build credits — read prices this run. Derive cost per successful merge to integration branch, re-runs included. Spend outside CI minutes → `bkit-audit-cost`. Before recommending runner class change for CPU-bound lane, name one-run experiment on larger/different-architecture runner comparing cost and duration (running it is next step — changes workflow). Every finding states whether it buys latency or cost. **Done when:** `Cost` holds minutes, current prices, cost per merge, experiment name or "none".
- [ ] **Step 12 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per DORA metric, host performance metric, caching/sharding/concurrency/billing practice in anchor list → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 13 — Anything Else:** (a) Everything changed since previous report's commit touching pipeline (workflows and composite actions, jobs and `needs:`, runner classes, task-runner config and cache keys, shard settings, remote-build profiles, local pre-push gate) → one-line verdict each. (b) Bounded ~30 min pass: what senior CI engineer flags that no step asks; read since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

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
