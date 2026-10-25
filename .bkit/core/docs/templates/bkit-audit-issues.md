<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Issue Prioritisation

> [!CAUTION]
> **Purpose:** A size and a priority for every open tracker issue, on two rules a later run can re-apply and get the same answer; plus board membership, parent, milestone, and blocked-by links the rules read.
>
> **Rules:**
>
> - never write tracker fields, labels, or comments; NEVER close, merge, or open issues. The report proposes size and priority.
> - never copy a personal-data value from an issue body into the report.

## Universal Instructions

### Context & Goals

Board with no stated rule = filing order. Search feature and authorisation bypass share a band; next pass reshuffles both. Target failure: **a ranking that cannot be re-derived**. Rule 1 picks the band. Rule 2 moves it. Rule lives in this template beside the ranking → later run, same board, same answer.

**Applies when:** tracker holds open issues. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly for clocks. Steps 1, 4, 11, 12 always; 2 membership only; 3 stale only; 5 in-flight age and launch target; 6 eight-week launch move and stuck-item lifts only. Other issues carry previous proposal. Full rank (Steps 2-10) when milestone opens/closes, ship cycle lands cluster, lane contents turn over, or audit files follow-up batch. Mini-pass when issue filed since previous report has gone a week with no size/priority or off-board (anchor-standard triage): Steps 3-8 and 10, plus 1, 2 membership, 11, 12; same two rules.

**Anchor Standards:**

- Weighted Shortest Job First and cost of delay (e.g. SAFe WSJF, after Reinertsen, _The Principles of Product Development Flow_).
- RICE and ICE scoring (e.g. Intercom RICE).
- The Kanban Guide (WIP, work-item age, service level expectation); record the edition (e.g. May 2025).
- Kanban classes of service (Expedite, Fixed date, Standard, Intangible).
- Definition of Ready: the Scrum Guide's description of ready items under Product Backlog refinement; record the edition (e.g. November 2020). No separate published standard exists.
- Severity is not priority (e.g. Mozilla defect-severity guide and Bugzilla triage policy).
- Tracker dependency links (e.g. GitHub blocked-by / blocking).
- bkit issue shapes (bkit version from `.bkit/version`): `.bkit/trackers.md` § Issue shapes; example forms `.bkit/templates/.github/ISSUE_TEMPLATE/` (`.bkit/templates.md` § Issue forms)

### Scope

- Every open issue, every open lane, one rule.
- Rule 1 band from the work, not the label.
- Rule 2 move from in flight, launch-gating, and waits on data that does not exist yet.
- Size of the work.
- Order inside a band. Tracker fields do not store order.
- Proposed size and priority per issue. This run does not write them.
- Board membership, parent, milestone, blocked-by: missing, stale, or contradicting → finding.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Ranking the next items to work into `docs/roadmap.md` | Roadmap utility | `@bkit-utility-update-roadmap` |
| Whether a maintenance check should become a gate | Gate sweep | `bkit-audit-gates` |
| Ordering one migration programme's own queue | Project migration map | Project Instructions |
| Writing size, priority, labels, or links | Tracker writes | `@bkit-utility-update-tracker` |
| Closing, merging, or opening issues | Owner decision | Plan from this report |
| Assignees, start / target dates, numeric estimate | Rules do not read them | Project Instructions |

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

Launch-gating = fixed-date class of service. Cost of delay grows as date approaches → never down. Step 5 records target each run.

**Blockers take the band of what they block**, when that band is higher than their own. Non-security blocker of `Urgent` stops at `High`, first in `High` order (Step 8).

Two guards:

1. Non-security work does not reach `Urgent`, however hot. No up-move and no blocker lifts past `High`. Exception: defect that loses or silently corrupts user data may be `Urgent`.
2. Security drops at most one band, never for launch timing. Launch-gating security never down. Security on named critical path never takes "data does not exist yet" down-move. Security never `Low` on "no users yet" alone.

**Traps:**

- Do not rank by label alone — main wrong-answer source.
- `Urgent` inflation kills the band. Long `Urgent` list = category, not queue. If all protective work is `Urgent`, ask which matter in current lifecycle (Project Instructions: users?).
- Standing issues split across bands by subject. Shared process does not put them in one band.
- An auto-generated checklist is not work (e.g. a dependency-bot dashboard).
- Every open lane, same two rules. Two lanes ranked differently → unread across boundary.

Finding `CRITICAL`-`LOW` in another audit does not set priority. Two rules do. Severity orders inside `High` only (Step 8).

### Size Scale

Size work, not body. Long evidence write-up can be one-file fix.

<!-- prettier-ignore -->
| Size | Work |
| --- | --- |
| `XS` | One file, one change, plus test |
| `S` | One surface, a day or less |
| `M` | Few files in one package, or one full pattern sweep |
| `L` | Several packages, more than one client, or roughly a week |
| `XL` | Milestone, full-product inventory, or subsystem not yet built |

Multi-client change never sized as one. Standing/umbrella sized for one run, not series. Milestone sized for contents.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** blocked calls recorded
- [ ] **Tracker Read:** Steps 2, 5, 10 — every board item with lane, size, and priority, via tracker MCP, e.g. GitHub MCP `projects_list` (project items), Linear MCP `list_issues`, Jira MCP `searchJiraIssuesUsingJql`; `gh` only as fallback. Fallback: none; unread items `Not Checked`, proposal does not cover them.
- [ ] **Open-Issue List:** Steps 2, 10 — every open issue, every repo / team board draws from, read separately from board, e.g. GitHub MCP `list_issues`, Linear MCP `list_issues` per team, Jira MCP JQL per project. Fallback: none; membership `Not Checked`, proposal covers board items only.
- [ ] **Issue Bodies:** Steps 3, 4, 6, 8 — title, labels, body, parent, milestone, blocked-by, e.g. GitHub MCP `issue_read`, Linear MCP `get_issue`, Jira MCP `getJiraIssue`. Fallback: titles only; each such rank low-confidence in `Judgement Calls`, links from structured fields only.
- [ ] **Web:** Step 11 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

- [ ] **Ship Ledger:** Ship outcomes recorded → Step 9 — e.g. `.bkit/stats.jsonl` `outcome` rows. Fallback: size table unchecked against what shipped; say so.
- [ ] **Link API:** Tracker exposes structured blocked-by or parent links → Step 4 — e.g. GitHub MCP `issue_read` sub-issues / parent, Linear `relations` / `parent`, Jira issue links / `parent`. Fallback: body text only; say so.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 — Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Board:** Read every item. Assert read not truncated (count below limit; at limit → raise and re-read). Record lane names, size and priority field ids and option ids from live field list. Unused numeric estimate stays unused; size = estimate. Membership: diff open-issue list vs board. Open issue not on board = off-board; closed issue outside done lane = stale card; list each by number. Off-board stays in scope: Steps 3-10 treat as item with no lane, size, priority. **Done when:** item count, lanes, field ids, off-board, stale cards in `Board`, or `N/A` and STOP.
- [ ] **Step 3 — Triage:** Read every open issue, not titles only. Short body prefix OK when summary front-loaded; open umbrella/milestone issues in full. While reading: stale = no activity 90 days and body no longer true of code/plan (standing issue never stale for age); duplicate = same change twice or one wholly inside another; `Low` on 3+ passes and still true = won't-do candidate (standing excluded); ready-lane item missing acceptance criteria, defect reproduction, or test to write = not ready (still gets size/priority). Note each Rule 1 override for Step 6 with label correction. List stale/duplicate with merge target or stale reason. Closing = owner; this run does not close. Monthly clock → stale only. **Done when:** `Triage` lists stale, duplicates, won't-do, not-ready, overrides to rank.
- [ ] **Step 4 — Links:** Per open issue record parent, milestone, blocked-by. Blocked-by: read all three — structured links (`Link API`), body block build gates on (e.g. GitHub `###### bkit:blocked-by start` / `end`), body prose ("blocked by #N", "after #N"). Flag: (1) Parent — child listed in parent body, no link (or reverse); open child, closed parent; open non-standing parent, all children closed → `Judgement Calls`. (2) Milestone — closed / past-due milestone with open issues; child with no or later milestone than parent; body / title names milestone, field empty; open milestone, no open issues. (3) Blocked-by — prose only; structured link vs body block disagree; closed blocker still listed; blocked issue in ready or later lane, blocker open; blocker off-board; cycle. Edges → Step 5 blocker rule, Step 6 parent / child moves. **Done when:** `Links` holds per-kind counts (with / without parent, milestone, blocker) and every flag, or `none`.
- [ ] **Step 5 — In Flight:** Three sources: lanes in progress/review; open PRs; issues closed recently (shipped cluster still warm — next issue in cluster cheap). Record launch/milestone target and where written. None → say so; launch-gating keeps Rule 1 band. Count in-progress/in-review; age and last activity (commit, PR, comment). Flag older than service level expectation: 85th-percentile cycle time of issues closed last 90 days, start of work to close. Record how start taken. <20 closed → two weeks, say so. Stuck item lifts parent/children/siblings; list each lift as judgement call. Apply blocker rule to every Step 4 edge. **Done when:** `In Flight` holds counts, ages, target, blocker moves, stuck lifts.
- [ ] **Step 6 — Rank:** Apply `Ranking Rules` to every in-scope issue. Record every Rule 1 override (label vs body) and label correction. Record every Rule 2 move with signal and launch target read. Band change since previous report without body/labels/in-flight change → one pass misapplied rule — say which. Maintenance check belonging as gate → `bkit-audit-gates`, not band here. Mini-pass → this step on unsized/unprioritised subset only. Monthly clock → eight-week launch moves and stuck lifts only. **Done when:** `Ranking` lists every override, move, band change.
- [ ] **Step 7 — Size:** Apply `Size Scale` to every in-scope issue. **Done when:** `Sizes` row per in-scope issue.

- [ ] **Step 8 — Order:** Four bands tie issues. Order each ready-lane band; report top ten. Proposal does not invent order field. (1) Inside `High`: blockers of `Urgent` first, then severity. Defect with ledger/audit `CRITICAL` before `HIGH`, both before rest. Severity orders in band; never moves band. (2) Cost of delay ÷ size (WSJF). Score 1-3: user/business value, time-criticality, risk reduced/work unblocked. Sum ÷ size: XS 1, S 2, M 3, L 5, XL 8. Tie → older issue. Simplified WSJF; standard uses modified Fibonacci per part and job size. (3) Demand when any: error-tracker volume, store reviews, analytics, support, previous-product users → raise value score; name source. Empty → say so; do not guess. **Done when:** `Order` holds top ten with scores.
- [ ] **Step 9 — Shipped:** Issues closed since previous report → join ship outcome via closing PR (lines changed, duration). Compare with size given. Sizes overlapping heavily in lines/time → size table no longer means what it says; propose change in `Process Improvements`. **Done when:** `Shipped` holds comparison, or no outcomes and say so.
- [ ] **Step 10 — Propose:** One proposed size and priority per open item outside done lane, off-board included, from Steps 6-7. Assert set-equality proposal vs open-issue list (Step 2) before report finished. Missing issue = silent otherwise. This run does not write fields. Distribution before (fields as read) and after (proposal) leads `Summary`. `Judgement Calls`: every call owner should overturn — stuck lifts, won't-do, stale, duplicate closes, uncertain bands — recommendation and what would settle each. **Done when:** `Proposal` covers every in-scope item; `Judgement Calls` holds calls.
- [ ] **Step 11 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor-standard practice (within-band order, classes of service, WIP, and work-item age, definition of ready, severity against priority, dependencies) → checked (name step) / not applicable (why) / finding. Per bkit anchor (doc section, rule, or issue shape): one row → followed (name step or evidence) / not applicable (why) / finding; departure with no recorded reason (e.g. `docs/decisions.jsonl` row, accepted-divergence entry) = finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 12 — Anything Else:** (a) Everything changed since previous report's commit touching prioritisation (board fields/options, lanes, labels, milestones, issue templates, two rules) → one-line verdict each. (b) Bounded ~30 min pass: what senior delivery lead flags that no step asks; read since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent. Monthly clock pass → Steps 7, 8, 9, and 10 explicit skip; Step 2 membership only.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Membership:** open-issue list read separately from board; every off-board issue, stale card listed.
- [ ] **Links:** parent, milestone, blocked-by recorded per open issue; blocked-by from all three Step 4 sources.
- [ ] **Proposal complete:** every open item outside Done has proposed size and priority; proposal set equals open-issue list. Monthly clock pass → previous proposal stands, plus stale calls, stuck lifts, eight-week moves.
- [ ] **Tracker untouched:** no tracker field, label, comment, or issue was written.
- [ ] **Gate 2 — Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Security issue proposed more than one band down, or non-security proposed as `Urgent` (the data-loss exception in `Ranking Rules` is allowed) |
| `HIGH` | Launch-gating work the rules forbid moving down; blocker left below the issue it blocks; security issue moved down for "no users yet" |
| `MEDIUM` | Rule 1 override with no label correction; ready-lane item not ready; stale or duplicate still treated as open work; band change whose body, labels, and in-flight neighbours did not change; in-flight item older than the service level expectation; off-board issue; blocked-by prose only, or structured link vs body block disagree; blocked issue in ready or later lane, blocker open; blocked-by cycle; open child, closed parent; closed / past-due milestone with open issues |
| `LOW` | Won't-do candidate; label correction that changes no band; within-band order only; stale card; closed blocker still listed; parent named in body, no link; child outside parent's milestone; milestone named in body, field empty; empty open milestone |

Within a severity: security-band mistakes first.

Ranked issues are not findings. Their output is the proposed priority. Findings are stale, duplicate, not-ready, mis-ranked, stuck, off-board, and broken links.

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

### Links

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` left
- [ ] **Summary:** names count per severity, the size and priority distribution before and after the proposal; off-board and broken-link counts.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report, template `Project Instructions`, and ledger rows changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` and `Project` filled
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** Every checkbox above independently verified and checked off.

<!-- bkit:end -->

## Project Instructions
