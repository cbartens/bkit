<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Issue Prioritisation

> [!CAUTION]
> **Purpose:** A size and a priority for every open tracker issue, set by two rules that a later run can re-apply and get the same answer. The audit also checks board membership, and the parent, milestone and blocked-by links the rules read.
>
> **Rules:**
>
> - NEVER write tracker fields, labels or comments.
> - NEVER close, merge or open issues.
> - The report proposes size and priority.
> - NEVER copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

A board with no stated rule is ordered by filing order. Example: a search feature and an authorisation bypass share a band, and the next pass reshuffles both. The failure this audit targets is a ranking that cannot be re-derived. Rule 1 picks the band, and Rule 2 moves it. The rules live in this template beside the ranking, so a later run on the same board gets the same answer.

**Applies when:** the tracker holds open issues. **If** it holds none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month for the clocks. A monthly pass always runs Steps 1, 4, 11 and 12. It runs Step 2 for membership only, Step 3 for stale issues only, Step 5 for in-flight age and the launch target, and Step 6 for eight-week launch moves and stuck-item lifts only. Other issues carry the previous proposal. Run a full rank (Steps 2-10) when a milestone opens or closes, a ship cycle lands a cluster, lane contents turn over, or an audit files a batch of follow-ups. Run a mini-pass when an issue filed since the previous report has gone a week with no size or priority, or off the board (anchor-standard triage). A mini-pass runs Steps 3-8 and 10, plus Steps 1, 11 and 12 and Step 2 for membership, with the same two rules.

**Anchor Standards:**

- Weighted Shortest Job First and cost of delay (e.g., SAFe WSJF, after Reinertsen, _The Principles of Product Development Flow_).
- RICE and ICE scoring (e.g., Intercom RICE).
- The Kanban Guide (WIP, work-item age, service level expectation); record the edition (e.g., May 2025).
- Kanban classes of service (Expedite, Fixed date, Standard, Intangible).
- Definition of Ready: the Scrum Guide's description of ready items under Product Backlog refinement; record the edition (e.g., November 2020). No separate published standard exists.
- Severity is not priority (e.g., Mozilla defect-severity guide and Bugzilla triage policy).
- Tracker dependency links (e.g., GitHub blocked-by / blocking).
- bkit issue shapes (bkit version from `.bkit/version`): `.bkit/trackers.md` § Issue shapes; example forms `.bkit/templates/.github/ISSUE_TEMPLATE/` (`.bkit/templates.md` § Issue forms)

### Scope

- Apply one rule set to every open issue in every open lane.
- Take the Rule 1 band from the work, not the label.
- Take the Rule 2 move from work in flight, launch-gating, and waits on data that does not exist yet.
- Size the work.
- Order the issues inside each band. Tracker fields do not store order.
- Propose a size and a priority for each issue. This run does not write them.
- Record a finding for board membership, a parent, a milestone or a blocked-by link that is missing, stale or contradicting.

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

Both rules are load-bearing. Rule 1 decides the band, and Rule 2 moves it one band. Re-apply the rules; do not vote.

**Rule 1 — what kind of work it is:** security issues come first, then error fixing, then design issues, then everything else.

<!-- prettier-ignore -->
| Category | Priority | What lands here |
| --- | --- | --- |
| Security | `Urgent` | Auth holes, authorisation bypass, credential exposure, data exposure, access-control gaps |
| Error fixing | `High` | Real defects — something is broken, wrong, or silently failing |
| Design | `Medium` | Layout, copy, icons, parity, accessibility, anything about how it looks or reads |
| Everything else | `Low` | New features, test coverage, CI, and tooling, dependency debt, trackers, and milestones |

A defect label is a starting point, not the answer. Read the body, because presentation work and missing tests are often labelled as bugs. Record every override, because those rows are the most likely to be wrong. Name the label correction that matches the body (e.g., drop the defect label from presentation work).

**Rule 2 — when it can be done:** in-flight neighbours move up, and lifecycle-later work moves down.

<!-- prettier-ignore -->
| Signal | Move |
| --- | --- |
| Parent, child, or sibling of something in progress or in review | Up one band |
| Split out of an in-flight issue, or touching the same harness | Up one band |
| Launch-gating: must ship before launch or before first production deploy | Never down. Up one band when the recorded launch or milestone target is eight weeks away or less. **If** no target is recorded → keep the Rule 1 band |
| Says "once we have usage data" or "when thresholds are hit" | Down one band |
| Protects data that does not exist yet | Down one band, except a critical path named in Project Instructions |

Launch-gating work is the fixed-date class of service. Its cost of delay grows as the date approaches, so it never moves down. Step 5 records the target on each run.

**Blockers:** a blocker takes the band of what it blocks, when that band is higher than its own. A non-security blocker of an `Urgent` issue stops at `High`, and goes first in the `High` order (Step 8).

Two guards:

1. Non-security work does not reach `Urgent`, however hot. No up-move and no blocker lifts it past `High`. The exception: a defect that loses or silently corrupts user data may be `Urgent`.
2. Security work drops at most one band, and never for launch timing. Launch-gating security work never moves down. Security work on a named critical path never takes the "data does not exist yet" down-move. Security work is never `Low` on "no users yet" alone.

**Traps:**

- Do not rank by label alone. It is the main source of wrong answers.
- `Urgent` inflation kills the band. A long `Urgent` list is a category, not a queue. **If** all protective work is `Urgent` → ask which items matter in the current lifecycle (Project Instructions: are there users?).
- Standing issues split across bands by subject. A shared process does not put them in one band.
- An auto-generated checklist is not work (e.g., a dependency-bot dashboard).
- Rank every open lane by the same two rules. **If** two lanes are ranked differently → the ranking did not read across the boundary.

A `CRITICAL`-`LOW` finding in another audit does not set priority; the two rules do. Severity orders issues inside `High` only (Step 8).

### Size Scale

Size the work, not the issue body. A long evidence write-up can describe a one-file fix.

<!-- prettier-ignore -->
| Size | Work |
| --- | --- |
| `XS` | One file, one change, plus test |
| `S` | One surface, a day or less |
| `M` | Few files in one package, or one full pattern sweep |
| `L` | Several packages, more than one client, or roughly a week |
| `XL` | Milestone, full-product inventory, or subsystem not yet built |

Never size a multi-client change as one. Size a standing or umbrella issue for one run, not for the series. Size a milestone for its contents.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Tracker Read:** Steps 2, 5, 10 — every board item with its lane, size and priority, read through the tracker MCP (e.g., GitHub MCP `projects_list` for project items, Linear MCP `list_issues`, Jira MCP `searchJiraIssuesUsingJql`). Use `gh` only as a fallback. Fallback: none. Mark unread items `Not Checked`; the proposal does not cover them.
- [ ] **Open-Issue List:** Steps 2, 10 — every open issue in every repo or team the board draws from, read separately from the board (e.g., GitHub MCP `list_issues`, Linear MCP `list_issues` per team, Jira MCP JQL per project). Fallback: none. Mark membership `Not Checked`; the proposal covers board items only.
- [ ] **Issue Bodies:** Steps 3, 4, 6, 8 — the title, labels, body, parent, milestone and blocked-by of each issue (e.g., GitHub MCP `issue_read`, Linear MCP `get_issue`, Jira MCP `getJiraIssue`). Fallback: read titles only, mark each such rank low-confidence in `Judgement Calls`, and take links from structured fields only.
- [ ] **Web:** Step 11 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Ship Ledger:** **If** ship outcomes are recorded → Step 9 — the outcomes (e.g., `.bkit/stats.jsonl` `outcome` rows). Fallback: say that the size table was not checked against what shipped.
- [ ] **Link API:** **If** the tracker exposes structured blocked-by or parent links → Step 4 — those links (e.g., GitHub MCP `issue_read` sub-issues / parent, Linear `relations` / `parent`, Jira issue links / `parent`). Fallback: read the body text only, and say so.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Board:** Read every item. Check that the read was not truncated: the count is below the limit. **If** the count is at the limit → raise the limit and read again. Record the lane names, and the size and priority field ids and option ids, from the live field list. An unused numeric estimate field stays unused, and the size field is the estimate. For membership, diff the open-issue list against the board. An open issue not on the board is off-board. A closed issue outside the done lane is a stale card. List each one by number. Off-board issues stay in scope: Steps 3-10 treat each one as an item with no lane, size or priority. **Done when:** the item count, lanes, field ids, off-board issues and stale cards are in `Board`, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Triage:** Read every open issue, not only its title. A short prefix of the body is enough when the summary comes first. Read umbrella and milestone issues in full. While reading, mark these. Stale: no activity for 90 days, and the body is no longer true of the code or plan. A standing issue is never stale for age. Duplicate: the same change filed twice, or one change wholly inside another. Won't-do candidate: `Low` on 3 or more passes and still true, standing issues excluded. Not ready: a ready-lane item missing acceptance criteria, a defect reproduction or a test to write. A not-ready item still gets a size and a priority. Note each Rule 1 override, with its label correction, for Step 6. List each stale or duplicate issue with its merge target or stale reason. Closing is the owner's decision, and this run does not close. **If** this is a monthly clock pass → check stale issues only. **Done when:** `Triage` lists the stale, duplicate, won't-do and not-ready issues, and the overrides to rank.
- [ ] **Step 4 — Links:** For each open issue, record its parent, milestone and blocked-by links.
  - For blocked-by, read all three sources: structured links (`Link API`), the body block the build gates on (e.g., GitHub `###### bkit:blocked-by start` / `end`), and body prose ("blocked by #N", "after #N").
  - Flag these:
    - (1) Parent: a child listed in the parent body with no link, or the reverse; an open child with a closed parent.
      - **If** an open non-standing parent has all its children closed → put it in `Judgement Calls`.
    - (2) Milestone: a closed or past-due milestone with open issues; a body or title that names a milestone while the field is empty; a milestone that breaks how the repo assigns them, read from open and recently closed issues.
      - **If** there is no clear pattern → do not flag it.
    - (3) Blocked-by: a link in prose only; a structured link and a body block that disagree; a closed blocker still listed; a blocked issue in a ready or later lane while its blocker is open; an off-board blocker; a cycle.
  - Feed the edges to the Step 5 blocker rule and the Step 6 parent and child moves.

  **Done when:** `Links` holds the counts per kind (with and without a parent, a milestone and a blocker) and every flag, or `none`.

- [ ] **Step 5 — In Flight:** Read three sources: the in-progress and in-review lanes, open PRs, and recently closed issues. A shipped cluster is still warm, so the next issue in it is cheap. Record the launch or milestone target, and where it is written. **If** there is none → say so; launch-gating work keeps its Rule 1 band. Count the in-progress and in-review items, with each one's age and last activity (commit, PR, comment). Flag each item older than the service level expectation: the 85th-percentile cycle time of issues closed in the last 90 days, from start of work to close. Record how the start was taken. **If** fewer than 20 issues closed → use two weeks, and say so. A stuck item lifts its parent, its children or its siblings. List each lift as a judgement call. Apply the blocker rule to every Step 4 edge. **Done when:** `In Flight` holds the counts, ages, target, blocker moves and stuck lifts.
- [ ] **Step 6 — Rank:** Apply `Ranking Rules` to every in-scope issue. Record every Rule 1 override (label against body) and its label correction. Record every Rule 2 move with its signal and the launch target read. **If** a band changed since the previous report while none of the body, labels or in-flight neighbours changed → one of the two passes misapplied a rule; say which. **If** a maintenance check belongs as a gate → send it to `bkit-audit-gates`, and give it no band here. **If** this is a mini-pass → run this step on the unsized or unprioritised subset only. **If** this is a monthly clock pass → apply the eight-week launch moves and stuck lifts only. **Done when:** `Ranking` lists every override, move and band change.
- [ ] **Step 7 — Size:** Apply `Size Scale` to every in-scope issue. **Done when:** `Sizes` has a row per in-scope issue.

- [ ] **Step 8 — Order:** The four bands leave issues tied. Order each ready-lane band, and report the top ten. The proposal does not invent an order field. (1) Inside `High`, blockers of `Urgent` issues go first, then severity decides. A defect with a ledger or audit `CRITICAL` goes before one with `HIGH`, and both go before the rest. Severity orders issues within a band, and never moves the band. (2) Order by cost of delay ÷ size (WSJF). Score each of these 1-3: user or business value, time-criticality, and risk reduced or work unblocked. Divide the sum by the size: XS 1, S 2, M 3, L 5, XL 8. **If** two issues tie → the older issue goes first. This is a simplified WSJF; the standard uses modified Fibonacci for each part and for job size. (3) **If** any demand signal exists (error-tracker volume, store reviews, analytics, support, previous-product users) → raise the value score, and name the source. **If** none exists → say so, and do not guess. **Done when:** `Order` holds the top ten with their scores.
- [ ] **Step 9 — Shipped:** For each issue closed since the previous report, join its ship outcome through the closing PR (lines changed, duration). Compare it with the size given. **If** sizes overlap heavily in lines or time → the size table no longer means what it says; propose a change in `Process Improvements`. **Done when:** `Shipped` holds the comparison, or says there are no outcomes.
- [ ] **Step 10 — Propose:** Propose one size and one priority for each open item outside the done lane, off-board items included, from Steps 6-7. Before the report is finished, check that the proposal set equals the open-issue list (Step 2), because otherwise a missing issue goes unnoticed. This run does not write fields. The distribution before (fields as read) and after (the proposal) leads `Summary`. Put every call the owner might overturn in `Judgement Calls` (stuck lifts, won't-do, stale, duplicate closes, uncertain bands), each with a recommendation and what would settle it. **Done when:** `Proposal` covers every in-scope item, and `Judgement Calls` holds the calls.
- [ ] **Step 11 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per anchor-standard practice (within-band order, classes of service, WIP, and work-item age, definition of ready, severity against priority, dependencies), each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 12 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches prioritisation: board fields and options, lanes, labels, milestones, issue templates, and the two rules. (b) In a bounded pass of about 30 minutes, note what a senior delivery lead would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Clock pass skips:** a monthly clock pass skips Steps 7, 8, 9 and 10 explicitly.
- [ ] **Clock pass membership:** in a monthly clock pass, Step 2 covers membership only.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Membership:** the open-issue list was read separately from the board.
- [ ] **Off-board listed:** every off-board issue and every stale card is listed.
- [ ] **Links:** each open issue has its parent, milestone and blocked-by recorded.
- [ ] **Blocked-by sources:** blocked-by links come from all three Step 4 sources.
- [ ] **Proposal complete:** every open item outside Done has a proposed size and priority, or this is a monthly clock pass.
- [ ] **Proposal set:** the proposal set equals the open-issue list, or this is a monthly clock pass.
- [ ] **Clock pass proposal:** a monthly clock pass keeps the previous proposal, plus the stale calls, stuck lifts and eight-week moves.
- [ ] **Tracker untouched:** no tracker field, label, comment, or issue was written.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A security issue proposed more than one band down, or non-security work proposed as `Urgent` (the data-loss exception in `Ranking Rules` is allowed) |
| `HIGH` | Launch-gating work the rules forbid moving down. A blocker left below the issue it blocks. A security issue moved down for "no users yet" |
| `MEDIUM` | A Rule 1 override with no label correction. A ready-lane item that is not ready. A stale or duplicate issue still treated as open work. A band change whose body, labels, and in-flight neighbours did not change. An in-flight item older than the service level expectation. An off-board issue. A blocked-by link in prose only, or a structured link and body block that disagree. A blocked issue in a ready or later lane while its blocker is open. A blocked-by cycle. An open child with a closed parent. A closed / past-due milestone with open issues |
| `LOW` | A won't-do candidate. A label correction that changes no band. Within-band order only. A stale card. A closed blocker still listed. A parent named in the body with no link. A milestone named in the body while the field is empty. A milestone that breaks the repo's own milestone pattern |

Within a severity, list security-band mistakes first.

Ranked issues are not findings; their output is the proposed priority. The findings are stale, duplicate, not-ready, mis-ranked, stuck and off-board issues, and broken links.

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

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity.
- [ ] **Distribution:** `Summary` gives the size and priority distribution before and after the proposal.
- [ ] **Off-board count:** `Summary` gives the off-board count.
- [ ] **Broken-link count:** `Summary` gives the broken-link count.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
