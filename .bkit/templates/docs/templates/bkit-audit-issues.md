<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Issue Prioritisation

> [!CAUTION]
> **Purpose:** A size and a priority for every open tracker issue, on two rules a later run can re-apply and get the same answer.
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
> - NEVER write tracker fields, labels, or comments; NEVER close, merge, or open issues. The report proposes size and priority.
> - NEVER copy a personal-data value from an issue body into the report.

## Universal Instructions

### Context & Goals

Board with no stated rule = filing order. Search feature and authorisation bypass share a band; next pass reshuffles both. Target failure: **a ranking that cannot be re-derived**. Rule 1 picks the band. Rule 2 moves it. Rule lives in this template beside the ranking → later run, same board, same answer.

**Applies when:** tracker holds open issues. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly for clocks. Steps 1, 10, 11 always; 3 stale only; 4 in-flight age and launch target; 5 eight-week launch move and stuck-item lifts only. Other issues carry previous proposal. Full rank (Steps 2–9) when milestone opens/closes, ship cycle lands cluster, lane contents turn over, or audit files follow-up batch. Mini-pass when issue filed since previous report has gone a week with no size/priority (anchor-standard triage): Steps 3–7 and 9, plus 1, 10, 11; same two rules.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Weighted Shortest Job First and cost of delay (e.g. SAFe WSJF, after Reinertsen, _The Principles of Product Development Flow_).
- RICE and ICE scoring (e.g. Intercom RICE).
- The Kanban Guide (WIP, work-item age, service level expectation); record the edition (e.g. May 2025).
- Kanban classes of service (Expedite, Fixed date, Standard, Intangible).
- Definition of Ready: the Scrum Guide's description of ready items under Product Backlog refinement; record the edition (e.g. November 2020). No separate published standard exists.
- Severity is not priority (e.g. Mozilla defect-severity guide and Bugzilla triage policy).
- Tracker dependency links (e.g. GitHub blocked-by / blocking).

### Scope

- Every open issue, every open lane, one rule.
- Rule 1 band from the work, not the label.
- Rule 2 move from in flight, launch-gating, and waits on data that does not exist yet.
- Size of the work.
- Order inside a band. Tracker fields do not store order.
- Proposed size and priority per issue. This run does not write them.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Ranking the next items to work into `docs/roadmap.md` | Roadmap utility | `@bkit-utility-update-roadmap` |
| Whether a maintenance check should become a gate | Gate sweep | `bkit-audit-gates` |
| Ordering one migration programme's own queue | Project migration map | Project Instructions |
| Writing size, priority, or labels; closing, merging, or opening issues | Audit reports only | Plan from this report |

### Ranking Rules

Both rules load-bearing. Rule 1 decides band. Rule 2 moves one band. Re-apply; do not vote.

**Rule 1 — what kind of work it is.** Security issues, then error fixing, then design issues, then everything else.

<!-- prettier-ignore -->
| Category | Priority | What lands here |
| --- | --- | --- |
| Security | `Urgent` | Auth holes, authorisation bypass, credential exposure, data exposure, access-control gaps |
| Error fixing | `High` | Real defects — something is broken, wrong, or silently failing |
| Design | `Medium` | Layout, copy, icons, parity, accessibility, anything about how it looks or reads |
| Everything else | `Low` | New features, test coverage, CI, and tooling, dependency debt, trackers, and milestones |

Defect label = starting point, not answer. Read body. Presentation work and missing tests often labelled bugs. Record every override — those rows most likely wrong. Name label correction to match body (e.g. drop defect label from presentation work).

**Rule 2 — when it can be done.** In-flight neighbours move up. Lifecycle-later work moves down.

<!-- prettier-ignore -->
| Signal | Move |
| --- | --- |
| Parent, child, or sibling of something in progress or in review | Up one band |
| Split out of an in-flight issue, or touching the same harness | Up one band |
| Launch-gating: must ship before launch or before first production deploy | Never down. Up one band when the recorded launch or milestone target is eight weeks away or less. No target recorded → keep the Rule 1 band |
| Says "once we have usage data" or "when thresholds are hit" | Down one band |
| Protects data that does not exist yet | Down one band, except a critical path named in Project Instructions |

Launch-gating = fixed-date class of service. Cost of delay grows as date approaches → never down. Step 4 records target each run.

**Blockers take the band of what they block**, when that band is higher than their own. Non-security blocker of `Urgent` stops at `High`, first in `High` order (Step 7).

Two guards:

1. Non-security work does not reach `Urgent`, however hot. No up-move and no blocker lifts past `High`. Exception: defect that loses or silently corrupts user data may be `Urgent`.
2. Security drops at most one band, never for launch timing. Launch-gating security never down. Security on named critical path never takes "data does not exist yet" down-move. Security never `Low` on "no users yet" alone.

**Traps:**

- Do not rank by label alone — main wrong-answer source.
- `Urgent` inflation kills the band. Long `Urgent` list = category, not queue. If all protective work is `Urgent`, ask which matter in current lifecycle (Project Instructions: users?).
- Standing issues split across bands by subject. Shared process does not put them in one band.
- An auto-generated checklist is not work (e.g. a dependency-bot dashboard).
- Every open lane, same two rules. Two lanes ranked differently → unread across boundary.

Finding `CRITICAL`–`LOW` in another audit does not set priority. Two rules do. Severity orders inside `High` only (Step 7).

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Tracker Read:** Steps 2, 4, 9 — every open item with lane, size, and priority, e.g. `gh project item-list`, Linear issues. Fallback: none; unread items `Not Checked`, proposal does not cover them.
- [ ] **Issue Bodies:** Steps 3, 5, 7 — title, labels, body, relations, e.g. `gh issue view`, Linear issue API. Fallback: titles only; each such rank low-confidence in `Judgement Calls`.
- [ ] **Web:** Step 10 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Ship Ledger:** Ship outcomes recorded → Step 8 — e.g. `.bkit/stats.jsonl` `outcome` rows. Fallback: size table unchecked against what shipped; say so.
- [ ] **Dependency API:** Tracker exposes blocked-by links → Step 4 — e.g. GitHub issue dependencies API. Fallback: body text only; say so.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Board:** Read every item. Assert read not truncated (count below limit; at limit → raise and re-read). Record lane names, size and priority field ids and option ids from live field list. Unused numeric estimate stays unused; size = estimate. **Done when:** item count, lanes, field ids in `Board`, or `N/A` and STOP.
- [ ] **Step 3 — Triage:** Read every open issue, not titles only. Short body prefix OK when summary front-loaded; open umbrella/milestone issues in full. While reading: stale = no activity 90 days AND body no longer true of code/plan (standing issue never stale for age); duplicate = same change twice or one wholly inside another; `Low` on 3+ passes and still true = won't-do candidate (standing excluded); ready-lane item missing acceptance criteria, defect reproduction, or test to write = not ready (still gets size/priority). Note each Rule 1 override for Step 5 with label correction. List stale/duplicate with merge target or stale reason. Closing = owner; this run does not close. Monthly clock → stale only. **Done when:** `Triage` lists stale, duplicates, won't-do, not-ready, overrides to rank.
- [ ] **Step 4 — In Flight:** Three sources: lanes in progress/review; open PRs; issues closed recently (shipped cluster still warm — next issue in cluster cheap). Record launch/milestone target and where written. None → say so; launch-gating keeps Rule 1 band. Count in-progress/in-review; age and last activity (commit, PR, comment). Flag older than service level expectation: 85th-percentile cycle time of issues closed last 90 days, start of work to close. Record how start taken. <20 closed → two weeks, say so. Stuck item lifts parent/children/siblings; list each lift as judgement call. Read blocking links for every `Urgent`, `High`, in-flight issue; search bodies for "blocked by". Apply blocker rule. **Done when:** `In Flight` holds counts, ages, target, blocker moves, stuck lifts.
- [ ] **Step 5 — Rank:** Apply `Ranking Rules` to every in-scope issue. Record every Rule 1 override (label vs body) and label correction. Record every Rule 2 move with signal and launch target read. Band change since previous report without body/labels/in-flight change → one pass misapplied rule — say which. Maintenance check belonging as gate → `bkit-audit-gates`, not band here. Mini-pass → this step on unsized/unprioritised subset only. Monthly clock → eight-week launch moves and stuck lifts only. **Done when:** `Ranking` lists every override, move, band change.
- [ ] **Step 6 — Size:** Size work, not body. Long evidence write-up can be one-file fix. XS = one file, one change, plus test. S = one surface, a day or less. M = few files one package, or one full pattern sweep. L = several packages, more than one client, or roughly a week. XL = milestone, full-product inventory, or subsystem not yet built. Multi-client change never sized as one. Standing/umbrella sized for one run, not series. Milestone sized for contents. **Done when:** `Sizes` row per in-scope issue.

- [ ] **Step 7 — Order:** Four bands tie issues. Order each ready-lane band; report top ten. Proposal does not invent order field. (1) Inside `High`: blockers of `Urgent` first, then severity. Defect with ledger/audit `CRITICAL` before `HIGH`, both before rest. Severity orders in band; never moves band. (2) Cost of delay ÷ size (WSJF). Score 1–3: user/business value, time-criticality, risk reduced/work unblocked. Sum ÷ size: XS 1, S 2, M 3, L 5, XL 8. Tie → older issue. Simplified WSJF; standard uses modified Fibonacci per part and job size. (3) Demand when any: error-tracker volume, store reviews, analytics, support, previous-product users → raise value score; name source. Empty → say so; do not guess. **Done when:** `Order` holds top ten with scores.
- [ ] **Step 8 — Shipped:** Issues closed since previous report → join ship outcome via closing PR (lines changed, duration). Compare with size given. Sizes overlapping heavily in lines/time → size table no longer means what it says; propose change in `Process Improvements`. **Done when:** `Shipped` holds comparison, or no outcomes and say so.
- [ ] **Step 9 — Propose:** One proposed size and priority per open item outside done lane, from Steps 5–6. Assert set-equality proposal vs board read before report finished. Missing issue = silent otherwise. This run does not write fields. Distribution before (fields as read) and after (proposal) leads `Summary`. `Judgement Calls`: every call owner should overturn — stuck lifts, won't-do, stale, duplicate closes, uncertain bands — recommendation and what would settle each. **Done when:** `Proposal` covers every in-scope item; `Judgement Calls` holds calls.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor-standard practice (within-band order, classes of service, WIP, and work-item age, definition of ready, severity against priority, dependencies) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching prioritisation (board fields/options, lanes, labels, milestones, issue templates, two rules) → one-line verdict each. (b) Bounded ~30 min pass: what senior delivery lead flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence surface absent. Monthly clock pass → Steps 2, 6, 7, 8, and 9 explicit skip.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Proposal complete:** every open item outside Done has proposed size and priority; proposal set equals board read. Monthly clock pass → previous proposal stands, plus stale calls, stuck lifts, eight-week moves.
- [ ] **Tracker untouched:** no tracker field, label, comment, or issue was written.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Security issue proposed more than one band down, or non-security proposed as `Urgent` (the data-loss exception in `Ranking Rules` is allowed) |
| `HIGH` | Launch-gating work the rules forbid moving down; blocker left below the issue it blocks; security issue moved down for "no users yet" |
| `MEDIUM` | Rule 1 override with no label correction; ready-lane item not ready; stale or duplicate still treated as open work; band change whose body, labels, and in-flight neighbours did not change; in-flight item older than the service level expectation |
| `LOW` | Won't-do candidate; label correction that changes no band; within-band order only |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: security-band mistakes first.

Ranked issues are not findings. Their output is the proposed priority. Findings are stale, duplicate, not-ready, mis-ranked, and stuck.

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

### Board

PENDING

### Triage

PENDING

### In Flight

PENDING

### Ranking

PENDING

### Sizes

PENDING

### Order

PENDING

### Shipped

PENDING

### Proposal

PENDING

### Judgement Calls

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
- [ ] **Summary:** names count per severity and the size and priority distribution before and after the proposal.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
