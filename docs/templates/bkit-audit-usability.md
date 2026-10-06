<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Usability Review

> [!CAUTION]
> **Purpose:** Whether each screen matches its drawing and the same screen on other platforms, and whether a person can finish the primary flows.
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
> - NEVER commit, push, or start a metered native build to produce shots. Use an artifact that already exists.
> - Seeded-defect copies stay in scratch. NEVER write them into the app, the manifest under test, or this report as product shots.
> - Session notes name the segment, not the person. NEVER copy a personal-data value from a screen into the report.

## Universal Instructions

### Context & Goals

Automated checks never look at a screen. They pass when a title is centred on one platform and left-aligned on another, when an empty state was never drawn, or when a label overflows. Drawings are the reference for how a screen should look, so drift from the drawing is a defect with every test green. Target failure: a screen that does not match its drawing, its twin on another platform, or a path a new user can finish.

**Applies when:** user-facing screens. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Extra pass when a shared component, the palette, or a route's layout changes. Every second run includes the sessions in `Sessions`.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Nielsen's 10 usability heuristics (NN/g, the 1994 set).
- NN/g severity ratings: frequency, impact, and persistence.
- ISO 9241-11:2018 (effectiveness, efficiency, and satisfaction).
- ISO 9241-110:2020 (interaction principles).
- Platform interface guidelines (e.g. Apple Human Interface Guidelines, Material Design 3). Living documents; record the date read.
- Human-AI interaction guidelines (e.g. Microsoft HAX, 18 guidelines; Google PAIR Guidebook).
- Task metrics (e.g. task success, time on task, Single Ease Question, SUS, UMUX-Lite) and the five-participant round.

### Scope

- Rendered screens beside their drawings and beside the same screen on other platforms.
- Routes and states the capture did not reach.
- A new user's first journey, per platform.
- Heuristics on the primary flows, including when the drawing itself is the defect.
- Copy, locale format, findability, platform conventions, notifications, poor network, and device switching.
- Errors, forms, and destructive actions.
- AI features the user must see, correct, and undo.
- Scripted sessions with real people, every second run.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Contrast, target size, focus, labels | Same screens, different sweep | `bkit-audit-accessibility` |
| A value or control implemented twice | Duplication sweep | `bkit-audit-duplication` |
| Funnel or feedback instrumentation | Analytics sweep | `bkit-audit-analytics` |
| Store listing declarations | Store sweep | `bkit-audit-app-store` |
| Model output, when the screen already shows, corrects, and undoes it | Model sweep | `bkit-audit-llm` |
| Price, renewal, or cancel wording vs consumer law | Privacy sweep | `bkit-audit-privacy` |
| Capture pipeline (bad crop, unpaired row, missing cell, canary miss) | Pipeline, not the screen | Plan from this report |
| Changing screens or drawings | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Screens:** Steps 2, 7–14 — a way to open the product (local or existing preview). Fallback: drawings and source only; live claims = hypotheses.
- [ ] **Drawings:** Steps 5, 7, 9 — reference drawings readable. Fallback: live vs live only; drawing comparison `Not Checked`.
- [ ] **Web:** Step 15 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Capture Artifact:** A finished run already opted in, and the artifact is inside its retention window → Steps 3–6. Fallback: hand walk; capture `Not Checked`. NEVER push or start a run.
- [ ] **Vision:** Image review → Steps 5–6 — the agent opens every PNG. Fallback: hand comparison; record that images were not opened.
- [ ] **Phone Runtimes:** Phone apps ship → Step 8 — simulator and emulator, or a device. Fallback: web only; phone `Not Checked`.
- [ ] **Locale Catalogue:** More than one locale, or a pseudo-locale → Step 8. Fallback: source-language copy only.
- [ ] **Participants:** This run is a session run → Step 11. Fallback: last round's date and the next due date; figures `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Signals:** Since the previous report: funnel drop-off on the core flows, support tickets, store-review themes, and in-app feedback. Top 5 complaints. By the end of the run each is a finding or explained. No users yet → `no users yet`. Missing or untrustworthy funnel data stays listed; the fix belongs to `bkit-audit-analytics`. **Done when:** `Signals` holds the five, or `no users yet`.
- [ ] **Step 3 — Capture:** Capture rides the normal end-to-end run and stays off unless the commit message opts in. Use a run whose message already carries the markers and whose artifact is still inside the retention window. None → hand walk; capture `Not Checked`. Record run id, event type, and markers. Fetch and review must finish before the artifact expires. **Done when:** run id in `Capture`, or the absence recorded.
- [ ] **Step 4 — Manifest:** Download that run's report artifact. Read the manifest and the gap step in the same job's log: every route and test id the run did not reach. That list is this run's blind spot. **Done when:** manifest path in `Capture` and the gap list in `Gaps`, or the skip recorded.
- [ ] **Step 5 — Review:** Build a side-by-side image per row. A reviewer that opens every image reads each row (drawing, viewport, full page, and each platform that has a cell). Rules: rows, not pairs (`surface × surfaceState × size × theme`); status bar, home indicator, and keyboard are never findings; a blocked or missing native cell is the pipeline, or a surface that has no phone screen, never an app defect; a cut drawing stops at the control its state is about, so everything below the cut is not missing; compare viewport with viewport and full page with full page (heights differ by construction); same scale → metrics may be compared, different scale → layout and presence only. Inventory, on the full-page pair only, names items in the drawing missing from the app, and items in the app missing from the drawing. Names, not counts. Do not fold inventory into parity severity. Verdicts are not deterministic → Step 7. **Done when:** every row has a verdict or an explicit skip, and `Inventory` names both directions or `none`.
- [ ] **Step 6 — Canary:** A run that finds nothing reads like a blind reviewer. Copy a few rows' shots into scratch and seed known defects: shift a title off centre, truncate a button label, blank a drawn empty state. Point a manifest copy at them and review only those rows. Record the hit rate. A missed seed is a pipeline finding, not an app defect. **Done when:** hit rate in `Canary`.
- [ ] **Step 7 — Verify:** No finding counts until the PNG and the live screen at the same width and theme were opened; the drawing was compared and wins on arrangement when they disagree; the pipeline was ruled out; a value or control was checked for a second implementation (platform file split, both consumers). A second copy is still recorded here, and belongs to `bkit-audit-duplication`. Each finding cites the PNG, the live screen, the drawing, or a source line. **Done when:** every finding has that evidence.
- [ ] **Step 8 — Hand Checks:** What the shots do not cover. While phone cells are blocked, walk the primary flows on each phone platform, light, and dark, against the same drawings. States the seed does not produce (empty, loading, failed request): each one not seen is unchecked, not clean. Longer text in the pseudo-locale; source detail → `bkit-audit-accessibility`. Translations: every key present in every locale, no source-language left on a translated screen, no sentence built by joining strings. Then read every locale for meaning. Dates, numbers, and currency use the locale's format. Plurals: counts that reach every category the locale has (0, 1, 2, 5, and 21 cover most); each message renders the right branch, not the raw pattern or the source-language form. A right-to-left target locale → walk the primary flow once. Plain language: UI copy and email at about grade 8; one word per concept, used everywhere; no internal jargon. Findability: the five lookups Project Instructions name; flag any path over 3 taps or clicks. Platform conventions, phone: back gesture and system back, native date and time pickers, share sheet, haptics, safe areas, pull-to-refresh, and tab bar. Web: links open in place, browser back works, and every screen has a URL that opens directly. Notifications and email: each is worth sending and opens the right screen; frequency and quiet-hours settings exist; permission is asked in context, when first needed, not at first launch. Poor network, on the phone: slow or flaky, offline, backgrounding mid-flow, and a low-end device. Record what the user sees, whether an action queues or fails loudly, and whether every skeleton and spinner resolves. Switching devices: start a task on the phone and finish it on the web; state, drafts, and notifications agree. Plans: the comparison is understandable, prices show tax and currency, downgrade, and cancel take no more steps than upgrade, no confirm-shaming, and no hidden cancel path. Wording that may break consumer law → `bkit-audit-privacy`. Everything in `Gaps`. **Done when:** `Hand Checks` lists each item checked, unchecked, or not applicable.
- [ ] **Step 9 — First Run:** The capture account is already full. Walk a new user's path by hand, as a journey, on each platform, with a fresh synthetic account teardown can reap. One row per point: screens and taps, every dead end, every word that assumes knowledge, verdict per platform. (1) Sign up on the web, including the confirmation message and its link, through first landing. Check the message, not only the screens. (2) Install on the phone first. Can they create an account? If not, does the screen say where to go? (3) The tenant created for them: do they understand it exists, can they see and change its name, and can they find the address or id they were given? (4) Empty primary screens. Each says what to do next, or is blank. No drawing of that empty state → finding for the drawing first: decide, draw, then build. (5) First record by hand, from the empty screen. It appears where expected, and the empty-state message goes away. (6) First item that arrives from outside the app. What they see while it processes, what the reply says, and what happens when nothing can be extracted. (7) Join by invitation. A different first run: they arrive in a tenant that is already full. (8) Come back: sign out, sign in, and the recovery path once. Note what the drawings promise that the app does not have. (9) First plan gate or paywall in the first session. What it says, and whether the next step is clear. **Done when:** `First Run` has one row per point.
- [ ] **Step 10 — Heuristics:** The drawing says how a screen should look; nothing above asks whether the drawn design is usable, so a screen that matches a bad drawing passes. Walk each primary flow. Check every screen against Nielsen's 10 heuristics. Each violation = finding with the heuristic (`H1` visibility of system status through `H10` help and documentation). The same problem in the drawing → finding for the drawing first. **Done when:** each primary flow has a line in `Checked`; violations are findings.
- [ ] **Step 11 — Sessions:** Screenshot review is not user evidence. Every second run, the same scripted tasks with real people: five participants, from the segments Project Instructions name; think-aloud; one script, kept in `Sessions` so the next round reuses it. Per task: success (unaided, with help, or failed), time on task, and the Single Ease Question. Per session: SUS or UMUX-Lite; pick one and keep it. Each figure beside the previous session. No participants → record the last round's date and when the next is due. Do not invent figures. **Done when:** `Sessions` holds the figures beside the previous session, or the next due date.
- [ ] **Step 12 — AI Features:** Each feature that produces a user-visible result, against the human-AI guidelines. The user can see what it did and why. Each extracted field can be corrected, and each created item undone. A low-confidence result is flagged, not silently saved. A failure says what happened and what to do next (Step 9 point 6 covers the first one). When the screen already does this and the fault is the model's output → `bkit-audit-llm`. **Done when:** `AI Features` row per feature: guideline · what the user sees · verdict.
- [ ] **Step 13 — Errors:** Trigger every validation and server error on the primary forms. Each says what happened and how to fix it, in plain language, next to the field. Input survives a failed submit, going offline mid-form, and session expiry. Every destructive action has undo or a confirmation, the same one on every platform, and is not the most prominent control when the drawing shows otherwise. **Done when:** `Errors` row per form and per destructive action.
- [ ] **Step 14 — Dates:** Product with dates, times, or recurrence → accounts in different locales and timezones. Date format, first day of the week, and 12- or 24-hour time follow the locale. Members in different timezones: which timezone each sees, and whether the app says so when they differ. An event that crosses a daylight-saving change keeps its wall-clock time. Editing a recurring event: the choice (this event, this and following, all events) is clear, and each does what it says. No dates → skip with evidence. **Done when:** `Dates` holds the answers, or the skip recorded.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Nielsen heuristic, ISO 9241-110 interaction principle, and HAX guideline → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Everything changed since previous report's commit touching usability (screens and routes, shared components, drawings, copy, emails, notifications, plan gates, AI-produced results) → one-line verdict each. (b) Bounded ~30 min pass: what a senior UX researcher flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Canary isolated:** seeded copies are not product shots in this report, and were not written into the app.
- [ ] **Pipeline ruled out:** no finding is OS chrome, the region below a cut drawing, or a blocked native cell.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Broken primary flow with no workaround; typed input or a record lost with no recovery; destructive action with no undo that loses data |
| `HIGH` | User cannot finish a task, and a workaround exists; empty first screen with no next step; destructive confirmation missing on one platform |
| `MEDIUM` | Screen ≠ drawing, the drawing is right, and it stops nobody; error text that does not say how to fix it; wrong locale format; one concept named two ways |
| `LOW` | Cosmetic mismatch; region below a cut drawing reported as missing and then corrected to not-reached |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: blocked tasks first. Set the bucket from frequency (how many users meet it), impact (whether they can get past it), and persistence (whether it bothers them every time). A task the user cannot finish is `HIGH`, or `CRITICAL` with no workaround. A drawing mismatch that stops nobody is `MEDIUM` or `LOW`.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, cells captured vs blocked per platform, and the canary hit rate.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
