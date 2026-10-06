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

A board with no stated rule is the order issues happened to be filed in. A search feature and an authorisation bypass then share a band, and the next pass reshuffles both because the answer depended on who ran it. Target failure: **a ranking that cannot be re-derived**. Rule 1 picks the band. Rule 2 moves it. The rule lives in this template, beside the ranking, so a later run gets the same answer on the same board.

**Applies when:** a tracker holds open issues. None → one `N/A` row with evidence, never "clean".

**Cadence:** not on a calendar. Rule 2 is a function of board state; a pass on an unchanged board reproduces itself. Extra pass when a milestone opens or closes, a ship cycle lands a cluster, a lane's contents turn over, or an audit files a batch of follow-ups. An issue filed since the previous report that has gone a week with no size or priority triggers a mini-pass: Steps 3–7 and 9 on those issues only, same two rules. The week is the anchor standard's weekly triage of new issues. Still run Steps 1, 10, and 11.

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
- Rule 2 move from what is in flight, what is launch-gating, and what waits on data that does not exist yet.
- Size of the work.
- Order inside a band. The tracker fields do not store order.
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

Both rules are load-bearing. Rule 1 decides the band. Rule 2 moves it by one band. Re-apply them; do not vote.

**Rule 1 — what kind of work it is.** Security issues, then error fixing, then design issues, then everything else.

<!-- prettier-ignore -->
| Category | Priority | What lands here |
| --- | --- | --- |
| Security | `Urgent` | Auth holes, authorisation bypass, credential exposure, data exposure, access-control gaps |
| Error fixing | `High` | Real defects — something is broken, wrong, or silently failing |
| Design | `Medium` | Layout, copy, icons, parity, accessibility, anything about how it looks or reads |
| Everything else | `Low` | New features, test coverage, CI, and tooling, dependency debt, trackers, and milestones |

The defect label is the starting point, not the answer. Read the body. Presentation work and missing tests are often labelled as bugs. Record every override — those rows are the ones most likely to be wrong. Name the label correction that would make the label match the body (e.g. drop the defect label from presentation work).

**Rule 2 — when it can be done.** In-flight neighbours move up. Work that can wait until later in the lifecycle moves down.

<!-- prettier-ignore -->
| Signal | Move |
| --- | --- |
| Parent, child, or sibling of something in progress or in review | Up one band |
| Split out of an in-flight issue, or touching the same harness | Up one band |
| Launch-gating: must ship before launch or before first production deploy | Never down. Up one band when the recorded launch or milestone target is eight weeks away or less. No target recorded → keep the Rule 1 band |
| Says "once we have usage data" or "when thresholds are hit" | Down one band |
| Protects data that does not exist yet | Down one band, except a critical path named in Project Instructions |

Launch-gating work has the fixed-date class of service. Its cost of delay grows as the date approaches, so it never moves down. Step 4 records the target each run.

**Blockers take the band of what they block**, when that band is higher than their own. A non-security blocker of an `Urgent` issue stops at `High` and goes first in `High`'s order (Step 7).

Two guards:

1. Non-security work does not reach `Urgent`, however hot it is. No up-move and no blocker lifts it past `High`. One exception: a defect that loses or silently corrupts user data may be `Urgent`.
2. A security issue drops at most one band, and never for launch timing. Launch-gating security never moves down. Security on the named critical path never takes the "data does not exist yet" down-move. A security issue never reaches `Low` on "no users yet" alone.

**Traps:**

- Do not rank by label alone. That is the main source of wrong answers.
- `Urgent` inflation kills the band. A long `Urgent` list is a category, not a queue. If everything protective is `Urgent`, ask which of them matter in the current lifecycle (Project Instructions says whether there are users).
- Standing issues split across bands by subject. Shared process does not put them in one band.
- An auto-generated checklist is not work (e.g. a dependency-bot dashboard).
- Every open lane uses the same two rules. Two lanes ranked differently cannot be read across the boundary.

A finding's `CRITICAL`–`LOW` bucket in another audit does not set its priority. The two rules do. Severity orders inside `High` only (Step 7).

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Tracker Read:** Steps 2, 4, 9 — every open item with lane, size, and priority, e.g. `gh project item-list`, Linear issues. Fallback: none; unread items `Not Checked`, and the proposal does not cover them.
- [ ] **Issue Bodies:** Steps 3, 5, 7 — title, labels, body, relations, e.g. `gh issue view`, Linear issue API. Fallback: titles only; each such rank marked low-confidence in `Judgement Calls`.
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

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Board:** Read every item. Assert the read is not truncated (count below the limit; at the limit, raise it and re-read). Record lane names, and the size and priority field ids and option ids, from the live field list. An unused numeric estimate field stays unused; size is the estimate. **Done when:** item count, lanes, and field ids in `Board`, or `N/A` and STOP.
- [ ] **Step 3 — Triage:** Read every open issue, not just the titles. A short prefix of the body is enough when the summary is front-loaded; open umbrella and milestone issues in full. While reading: stale = no activity in 90 days AND the body is no longer true of the code or the plan (a standing issue is never stale for being old); duplicate = two issues asking for the same change, or one wholly inside another; `Low` on three or more passes and still true = a won't-do candidate (standing issues excluded); a ready-lane item missing acceptance criteria, a reproduction if it is a defect, or the test to write = not ready (it still gets a size and a priority). Note each Rule 1 override for Step 5, with the label correction. List each stale or duplicate with the issue to merge into or the reason it is stale. Closing is the owner's call; this run does not close. **Done when:** `Triage` lists stale, duplicates, won't-do, not-ready, and the overrides to rank.
- [ ] **Step 4 — In Flight:** Three sources, all of them: lanes in progress and in review; open PRs; issues closed recently (a cluster that just shipped is still warm — the next issue in that cluster is cheap now). Record the launch or milestone target and where it is written. None recorded → say so; launch-gating work then keeps its Rule 1 band. Count in-progress and in-review items; each one's age and last activity (commit, PR, or comment). Flag any older than the service level expectation: the 85th-percentile cycle time of issues closed in the last 90 days, from start of work to close. Record how the start was taken. Fewer than 20 closed items → two weeks, and say so. A stuck item still lifts its parent, children, and siblings; list each lift as a judgement call. Read blocking links for every `Urgent`, `High`, and in-flight issue, and search bodies for "blocked by". Apply the blocker rule. **Done when:** `In Flight` holds counts, ages, the target, blocker moves, and stuck lifts.
- [ ] **Step 5 — Rank:** Apply `Ranking Rules` to every in-scope issue. Record every Rule 1 override (label said one thing, body another) and the label correction. Record every Rule 2 move with the signal, and the launch target it read. A band change since the previous report whose body, labels, and in-flight neighbours did not change means one of the two passes misapplied the rule — say which. A maintenance check that belongs as a gate → `bkit-audit-gates`, not a band here. Mini-pass → this step on the unsized and unprioritised subset only. **Done when:** `Ranking` lists every override, move, and band change.
- [ ] **Step 6 — Size:** Size the work, not the body. A long evidence write-up can be a one-file fix. XS = one file, one change, plus its test. S = one surface, a day or less. M = a few files in one package, or one full sweep of an existing pattern. L = several packages, more than one client, or roughly a week. XL = a milestone, a full-product inventory, or a subsystem that does not exist yet. A change that must land on more than one client is never sized as if it were one. Standing and umbrella issues are sized for one run, not for the series. A milestone issue is sized for its contents. **Done when:** `Sizes` row per in-scope issue.

- [ ] **Step 7 — Order:** Four bands leave issues tied. Order each band of the ready lane. Report the top ten of that lane. The proposal does not invent a field for order. (1) Inside `High`: blockers of `Urgent` issues first, then severity. A defect whose ledger row or audit finding is `CRITICAL` comes before one that is `HIGH`, and both come before the rest. Severity orders inside the band; it never moves an issue to another band. (2) Then cost of delay divided by size (Weighted Shortest Job First). Score 1, 2, or 3: value to users or the business, how time-critical it is, and the risk it reduces or the work it unblocks. Add them and divide by size: XS 1, S 2, M 3, L 5, XL 8. Tie → the older issue. This is a simplified WSJF; the standard scores each part and the job size on a modified Fibonacci scale. (3) Demand, where there is any: error-tracker volume, store reviews, analytics, support contact, and what users of a previous product report can raise the value score. Name the source. Empty → say so; do not guess. **Done when:** `Order` holds the top ten with scores.
- [ ] **Step 8 — Shipped:** For issues closed since the previous report, join each to its ship outcome through the closing PR (lines changed, duration). Compare with the size it was given. Sizes that overlap heavily in lines or time → the size table no longer means what it says; propose the change in `Process Improvements`. **Done when:** `Shipped` holds the comparison, or no outcomes and say so.
- [ ] **Step 9 — Propose:** One proposed size and one proposed priority per open item outside the done lane, from Steps 5 and 6. Assert set-equality between the proposal and the board read before the report is finished. A missing issue is silent otherwise. This run does not write the fields. Distribution before (fields as read) and after (this proposal) leads `Summary`. `Judgement Calls` lists every call the owner should overturn: stuck-item lifts, won't-do candidates, stale, and duplicate closes, and any band you are not sure of, each with a recommendation and what would settle it. **Done when:** `Proposal` covers every in-scope item, and `Judgement Calls` holds the calls.
- [ ] **Step 10 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor-standard practice (within-band order, classes of service, WIP, and work-item age, definition of ready, severity against priority, dependencies) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 11 — Anything Else:** (a) Everything changed since previous report's commit touching prioritisation (board fields and options, lanes, labels, milestones, issue templates, the two rules) → one-line verdict each. (b) Bounded ~30 min pass: what a senior delivery lead flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Proposal complete:** every open item outside Done has a proposed size and priority; the proposal set equals the board read.
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

The ranked issues are not findings. Their output is the proposed priority. Findings are stale, duplicate, not-ready, mis-ranked, and stuck.

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
