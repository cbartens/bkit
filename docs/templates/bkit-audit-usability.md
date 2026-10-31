<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Usability Review

> [!CAUTION]
> **Purpose:** Whether each screen matches its drawing and the same screen on other platforms, and whether a person can finish the primary flows.
>
> **Rules:**
>
> - NEVER commit, push or start a metered native build to produce shots. Use an artifact that already exists.
> - Keep seeded-defect copies in scratch. Never write them into the app, the manifest under test, or this report as product shots.
> - Name the segment in session notes, not the person.
> - NEVER copy a personal-data value into the report.

## Universal Instructions

### Context & Goals

Automated checks never look at a screen. They pass when a title is centred on one platform and left-aligned on another, when an empty state was never drawn, or when a label overflows. Drawings are the reference for how a screen should look, so drift from the drawing is a defect even with every test green. The failure this audit targets is a screen that does not match its drawing or its twin on another platform, or a path a new user cannot finish.

**Applies when:** the product has user-facing screens. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month. Run an extra pass when a shared component, the palette or a route's layout changes. Every second run includes the sessions in `Sessions`.

**Anchor Standards:**

- Nielsen's 10 usability heuristics (NN/g, the 1994 set).
- NN/g severity ratings: frequency, impact, and persistence.
- ISO 9241-11:2018 (effectiveness, efficiency, and satisfaction).
- ISO 9241-110:2020 (interaction principles).
- Platform interface guidelines (e.g. Apple Human Interface Guidelines, Material Design 3). Living documents; record the date read.
- Human-AI interaction guidelines (e.g. Microsoft HAX, 18 guidelines; Google PAIR Guidebook).
- Task metrics (e.g. task success, time on task, Single Ease Question, SUS, UMUX-Lite) and the five-participant round.

### Scope

- Compare rendered screens with their drawings, and with the same screen on other platforms.
- List the routes and states the capture did not reach.
- Walk a new user's first journey on each platform.
- Check the primary flows against the heuristics, including when the drawing itself is the defect.
- Check copy, locale format, findability, platform conventions, notifications, poor network and device switching.
- Check errors, forms and destructive actions.
- Check that the user can see, correct and undo what AI features do.
- Run scripted sessions with real people every second run.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Contrast, target size, focus, labels | The same screens, in a different sweep | `bkit-audit-accessibility` |
| A value or control implemented twice | The duplication sweep owns it | `bkit-audit-duplication` |
| Funnel or feedback instrumentation | The analytics sweep owns it | `bkit-audit-analytics` |
| Store listing declarations | The store sweep owns them | `bkit-audit-app-store` |
| Model output, when the screen already shows, corrects, and undoes it | The model sweep owns it | `bkit-audit-llm` |
| Price, renewal, or cancel wording vs consumer law | The privacy sweep owns it | `bkit-audit-privacy` |
| Capture pipeline (bad crop, unpaired row, missing cell, canary miss) | It is the pipeline, not the screen | A plan made from this report |
| Changing screens or drawings | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Screens:** Steps 2, 7-14 — open the product, locally or on an existing preview. Fallback: read the drawings and source only, and treat live claims as hypotheses.
- [ ] **Drawings:** Steps 5, 7, 9 — readable reference drawings. Fallback: compare live with live only, and mark the drawing comparison `Not Checked`.
- [ ] **Web:** Step 15 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Capture Artifact:** **If** a screenshot-capture pipeline exists, **and** a finished run's artifact is inside the retention window → Steps 3-6 — the capture artifact. Fallback: walk by hand, and mark the capture `Not Checked`. NEVER push or start a run.
- [ ] **Vision:** **If** the agent can review images → Steps 5-6 — the agent opens every PNG. Fallback: compare by hand, and record the images not opened.
- [ ] **Phone Runtimes:** **If** phone apps ship → Step 8 — a simulator, emulator or device. Fallback: cover web only, and mark phone `Not Checked`.
- [ ] **Locale Catalogue:** **If** there is more than one locale, **or** a pseudo-locale → Step 8 — the locale catalogue. Fallback: check the source-language copy only.
- [ ] **Participants:** **If** a session is run → Step 11 — the participants. Fallback: record the last round's date and the next due date, and mark the figures `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Signals:** Collect, since the previous report, funnel drop-off on core flows, support tickets, store-review themes and in-app feedback. Each of the top 5 complaints becomes a finding, or is explained, by the end of the run. **If** there are no users yet → write `no users yet`. Missing or untrustworthy funnel data stays listed, and its fix goes to `bkit-audit-analytics`. **Done when:** `Signals` holds the five, or `no users yet`.
- [ ] **Step 3 — Capture:** **If** the project has a screenshot-capture pipeline (`Project Instructions` names it, including how a run opts in, e.g., a commit-message marker) → use a finished run whose artifact is still inside the retention window. **If** there is no pipeline, **or** no such run → walk by hand, and mark the capture `Not Checked`. Record the run id, event type and opt-in markers. Fetch and review the artifact before it expires. **Done when:** `Capture` holds the run id, or the absence is recorded.
- [ ] **Step 4 — Manifest:** Download that run's report artifact. Read the manifest, and the gap step in the same job's log, where the pipeline emits them. Every route and test id the run did not reach is this run's blind spot. **Done when:** `Capture` holds the manifest path and `Gaps` holds the gap list, or the skip is recorded.
- [ ] **Step 5 — Review:** Build a side-by-side image per row. The reviewer opens every image, and reads each row: the drawing, viewport, full page, and each platform that has a cell. Review rows, not pairs (one row per screen x state x size x theme the pipeline captures). The status bar, home indicator and keyboard are never findings. A blocked or missing native cell is the pipeline, or a surface with no phone screen, never an app defect. A cut drawing stops at the control its state is about, so the region below the cut is not missing. Compare viewport with viewport, and full page with full page, because their heights differ by construction. At the same scale, metrics may be compared. At a different scale, compare layout and presence only. Take the inventory on the full-page pair only: items in the drawing missing from the app, and items in the app missing from the drawing, by name, not by count. Do not fold the inventory into parity severity. Verdicts are not deterministic, so they go through Step 7. **Done when:** every row has a verdict or an explicit skip, and `Inventory` names both directions or says `none`.
- [ ] **Step 6 — Canary:** A run that finds nothing looks the same as a reviewer who cannot see. Copy a few rows' screenshots to scratch, and seed known defects in them: a title off centre, a truncated button label, a blank screen where the drawing shows an empty state. Point a copy of the manifest at them, and review those rows only. Record the hit rate. A missed seed is a pipeline finding, not an app defect. **Done when:** the hit rate is in `Canary`.
- [ ] **Step 7 — Verify:** No finding counts until the PNG and the live screen have been opened at the same width and theme; the drawing has been compared, and wins on arrangement when they disagree; the pipeline has been ruled out; and the value or control has been checked for a second implementation (a platform file split, both consumers). A second copy is still recorded here, and it belongs to `bkit-audit-duplication`. Each finding cites a PNG, live screen, drawing or source line. **Done when:** every finding has that evidence.
- [ ] **Step 8 — Hand Checks:** Check what the shots do not cover. While phone cells are blocked, walk the primary flows on each phone platform, in light and dark, against the same drawings. For states the seed does not produce (empty, loading, failed request), each state not seen is unchecked, not clean. Check longer text in a pseudo-locale, and send the source detail to `bkit-audit-accessibility`. Translations: check every key in every locale, no source-language text on a translated screen, and no sentence built from joined strings, then read every locale for meaning. Check that dates, numbers and currency use the locale format. Plurals: use counts that reach every category the locale has (0, 1, 2, 5 and 21 cover most), and check that the right branch shows, not the raw pattern or the source-language form. **If** there is a right-to-left target locale → walk the primary flow once in it. Plain language: UI copy and email are at about grade 8, use one word per concept everywhere, and contain no internal jargon. Findability: try the five lookups `Project Instructions` names, and flag any path over 3 taps or clicks. Phone conventions: back gesture and system back, native date and time pickers, share sheet, haptics, safe areas, pull-to-refresh and tab bar. Web: links open in place, browser back works, and every screen has a URL that opens it directly. Notifications and email: each one is worth sending and opens the right screen, there are frequency and quiet-hours settings, and permission is asked in context when first needed, not at first launch. Poor network on a phone (slow or flaky, offline, backgrounding mid-flow, a low-end device): record what the user sees, whether the action queues or fails loudly, and whether every skeleton and spinner resolves. Switching devices: start a task on a phone and finish it on web, and check that state, drafts and notifications agree. Plans: the comparison is understandable, prices show tax and currency, downgrade and cancel take no more steps than upgrade, there is no confirm-shaming, and there is no hidden cancel path. Consumer-law wording goes to `bkit-audit-privacy`. Record every gap in `Gaps`. **Done when:** `Hand Checks` lists each item checked, unchecked, or not applicable.
- [ ] **Step 9 — First Run:** The capture account is already full, so walk the new-user path by hand, as a journey, on each platform, with a fresh synthetic account that teardown can reap. Give one row per point: the screens and taps, dead ends, words that assume knowledge, and a verdict per platform. (1) Sign up on web, including the confirmation message and link, through to the first landing. Check the message, not only the screens. (2) Install on a phone first, and check whether the user can create an account there. **If** not → check whether the screen says where to go. (3) **If** the product is multi-tenant and a tenant is created for the user → check that they understand it exists, can see and change its name, and can find the address or id they were given. (4) Check that each empty primary screen says what to do next, or record that it is blank. **If** there is no drawing of the empty state → it is a finding for the drawing first: decide, draw, then build. (5) Create the first record by hand from an empty screen, and check that it appears where expected and the empty-state message goes away. (6) **If** the product ingests items from outside the app (e.g., a forwarded email, an upload) → for the first item, record what the user sees while it processes, the reply text, and what happens when nothing can be extracted. (7) **If** invitations exist → join by invitation, which is a different first run that arrives in a full tenant. (8) Come back: sign out, sign in, and use the recovery path once. Note where the drawings promise what the app lacks. (9) Record the first plan gate or paywall in the first session: what it says, and whether the next step is clear. **Done when:** `First Run` has one row per point, and each point whose condition is unmet has an `N/A` row with evidence.
- [ ] **Step 10 — Heuristics:** The drawing says how a screen should look, but nothing above asks whether the drawn design is usable, so a screen that matches a bad drawing passes. Walk each primary flow, and check every screen against Nielsen's 10 heuristics. Each violation is a finding that names its heuristic (`H1` visibility of system status through `H10` help and documentation). **If** the same problem is in the drawing → it is a finding for the drawing first. **Done when:** each primary flow has a line in `Checked`, and the violations are findings.
- [ ] **Step 11 — Sessions:** A screenshot review is not evidence from users. Every second run, run the same scripted tasks with real people: five participants from the segments `Project Instructions` names, thinking aloud, with one script kept in `Sessions` for the next round. For each task, record success (unaided, with help, failed), time on task, and the Single Ease Question. For each session, record SUS or UMUX-Lite: pick one, and keep it. Put each figure beside the previous session's. **If** there are no participants → record the last round's date and the next due date, and do not invent figures. **Done when:** `Sessions` holds the figures beside the previous session's, or the next due date.
- [ ] **Step 12 — AI Features:** Check each feature that shows the user a result against the human-AI guidelines: the user sees what it did and why; each extracted field can be corrected, and each created item undone; low confidence is flagged, not silently saved; and a failure says what happened and what to do next (Step 9 point 6 covers the first one). **If** the screen already does this and the fault is the model's output → `bkit-audit-llm`. **Done when:** `AI Features` has one row per feature: guideline · what the user sees · verdict.
- [ ] **Step 13 — Errors:** Trigger every validation and server error on the primary forms. Check that each one says what happened and how to fix it, in plain language, next to the field. Check that input survives a failed submit, going offline mid-form, and session expiry. Check that every destructive action has an undo or a confirmation, behaves the same on every platform, and is not the most prominent control when the drawing shows otherwise. **Done when:** `Errors` has one row per form and per destructive action.
- [ ] **Step 14 — Dates:** **If** the product has dates, times or recurrence → use accounts in different locales and timezones. Check that the date format, the first day of the week, and 12- or 24-hour time follow the locale. For members in different timezones, record which timezone each one sees, and whether the app says so when they differ. Check that an event crossing a daylight-saving change keeps its wall-clock time. When a recurring event is edited, check that the choice (this event, this and following, all events) is clear, and that each option does what it says. **If** there are no dates → skip with evidence. **Done when:** `Dates` holds the answers, or the skip is recorded.
- [ ] **Step 15 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per Nielsen heuristic, ISO 9241-110 interaction principle and HAX guideline, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 16 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches usability: screens and routes, shared components, drawings, copy, emails, notifications, plan gates and AI-produced results. (b) In a bounded pass of about 30 minutes, note what a senior UX researcher would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Canary isolated:** no seeded copy appears as a product shot in this report.
- [ ] **App untouched:** no seeded copy was written into the app.
- [ ] **Pipeline ruled out:** no finding is OS chrome, the region below a cut drawing, or a blocked native cell.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A broken primary flow with no workaround. Typed input or a record lost with no recovery. A destructive action with no undo that loses data |
| `HIGH` | The user cannot finish a task, and a workaround exists. An empty first screen with no next step. A destructive confirmation missing on one platform |
| `MEDIUM` | A screen that differs from its drawing, where the drawing is right and the difference stops nobody. Error text that does not say how to fix the problem. A wrong locale format. One concept named two ways |
| `LOW` | A cosmetic mismatch. A region below a cut drawing reported as missing, then corrected to not-reached |

Within a severity, list blocked tasks first. Set the bucket from frequency (how many users meet it), impact (whether they can get past it) and persistence (whether it bothers them every time). A task the user cannot finish is `HIGH`, or `CRITICAL` when there is no workaround. A drawing mismatch that stops nobody is `MEDIUM` or `LOW`.

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

### Signals

PENDING

### Capture

PENDING

### Gaps

PENDING

### Inventory

PENDING

### Canary

PENDING

### Hand Checks

PENDING

### First Run

PENDING

### Sessions

PENDING

### AI Features

PENDING

### Errors

PENDING

### Dates

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
- [ ] **Summary:** `Summary` gives the count per severity, the cells captured against blocked per platform, and the canary hit rate.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
