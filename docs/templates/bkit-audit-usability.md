<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do NOT edit; run `bkit upgrade` to refresh -->

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

- [ ] **Screens:** Steps 2, 7–14 — open product (local or existing preview). Fallback: drawings and source only; live claims = hypotheses.
- [ ] **Drawings:** Steps 5, 7, 9 — reference drawings readable. Fallback: live vs live only; drawing comparison `Not Checked`.
- [ ] **Web:** Step 15 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Capture Artifact:** Screenshot-capture pipeline exists, finished run's artifact inside retention window → Steps 3–6. Fallback: hand walk; capture `Not Checked`. NEVER push or start a run.
- [ ] **Vision:** Image review → Steps 5–6 — agent opens every PNG. Fallback: hand comparison; record images not opened.
- [ ] **Phone Runtimes:** Phone apps ship → Step 8 — simulator, emulator, or device. Fallback: web only; phone `Not Checked`.
- [ ] **Locale Catalogue:** More than one locale, or a pseudo-locale → Step 8. Fallback: source-language copy only.
- [ ] **Participants:** Session run → Step 11. Fallback: last round's date and next due date; figures `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Signals:** Since previous report: funnel drop-off on core flows, support tickets, store-review themes, in-app feedback. Top 5 complaints → each a finding or explained by run end. No users yet → `no users yet`. Missing or untrustworthy funnel data stays listed; fix → `bkit-audit-analytics`. **Done when:** `Signals` holds the five, or `no users yet`.
- [ ] **Step 3 — Capture:** Project has a screenshot-capture pipeline (`Project Instructions` names it, incl. how a run opts in, e.g. commit-message marker) → use finished run with artifact still inside retention window. No pipeline or no such run → hand walk; capture `Not Checked`. Record run id, event type, opt-in markers. Fetch and review before artifact expires. **Done when:** run id in `Capture`, or absence recorded.
- [ ] **Step 4 — Manifest:** Download that run's report artifact. Read manifest and gap step in same job's log, where the pipeline emits them: every route and test id the run did not reach → this run's blind spot. **Done when:** manifest path in `Capture` and gap list in `Gaps`, or skip recorded.
- [ ] **Step 5 — Review:** Side-by-side image per row. Reviewer opens every image; reads each row (drawing, viewport, full page, each platform with a cell). Rules: rows, not pairs (one row per screen × state × size × theme the pipeline captures); status bar, home indicator, and keyboard are never findings; blocked or missing native cell = pipeline or surface with no phone screen, never app defect; cut drawing stops at control its state is about — region below cut not missing; viewport↔viewport, full page↔full page (heights differ by construction); same scale → metrics may compare, different scale → layout and presence only. Inventory on full-page pair only: items in drawing missing from app, items in app missing from drawing — names, not counts; do not fold inventory into parity severity. Verdicts not deterministic → Step 7. **Done when:** every row has verdict or explicit skip; `Inventory` names both directions or `none`.
- [ ] **Step 6 — Canary:** Run that finds nothing reads like blind reviewer. Copy few rows' shots to scratch; seed known defects (title off centre, truncated button label, blank drawn empty state). Point manifest copy at them; review those rows only. Record hit rate. Missed seed = pipeline finding, not app defect. **Done when:** hit rate in `Canary`.
- [ ] **Step 7 — Verify:** No finding counts until PNG and live screen at same width and theme opened; drawing compared and wins on arrangement when they disagree; pipeline ruled out; value or control checked for second implementation (platform file split, both consumers). Second copy still recorded here → belongs to `bkit-audit-duplication`. Each finding cites PNG, live screen, drawing, or source line. **Done when:** every finding has that evidence.
- [ ] **Step 8 — Hand Checks:** What shots do not cover. While phone cells blocked → walk primary flows on each phone platform, light and dark, against same drawings. States seed does not produce (empty, loading, failed request): each not seen = unchecked, not clean. Longer text in pseudo-locale; source detail → `bkit-audit-accessibility`. Translations: every key in every locale, no source-language on translated screen, no sentence from joined strings; then read every locale for meaning. Dates, numbers, currency use locale format. Plurals: counts reaching every category locale has (0, 1, 2, 5, 21 cover most) — right branch, not raw pattern or source-language form. Right-to-left target locale → walk primary flow once. Plain language: UI copy and email ~grade 8; one word per concept everywhere; no internal jargon. Findability: five lookups `Project Instructions` name; flag path over 3 taps or clicks. Phone conventions: back gesture and system back, native date/time pickers, share sheet, haptics, safe areas, pull-to-refresh, tab bar. Web: links open in place, browser back works, every screen has URL that opens directly. Notifications and email: worth sending, open right screen; frequency and quiet-hours settings; permission in context when first needed, not at first launch. Poor network on phone: slow/flaky, offline, backgrounding mid-flow, low-end device — record what user sees, whether action queues or fails loudly, whether every skeleton and spinner resolves. Switching devices: start task on phone, finish on web; state, drafts, notifications agree. Plans: comparison understandable, prices show tax and currency, downgrade, and cancel take no more steps than upgrade, no confirm-shaming, and no hidden cancel path. Consumer-law wording → `bkit-audit-privacy`. Everything in `Gaps`. **Done when:** `Hand Checks` lists each item checked, unchecked, or not applicable.
- [ ] **Step 9 — First Run:** Capture account already full. Walk new-user path by hand, as journey, each platform, fresh synthetic account teardown can reap. One row per point: screens and taps, dead ends, words that assume knowledge, verdict per platform. (1) Sign up on web, including confirmation message and link, through first landing — check message, not only screens. (2) Install on phone first — create account? If not, screen says where to go? (3) Multi-tenant → tenant created for them: understand it exists, see and change name, find address or id given. (4) Empty primary screens — each says what to do next or is blank; no drawing of empty state → finding for drawing first: decide, draw, then build. (5) First record by hand from empty screen — appears where expected, empty-state message goes away. (6) Product ingests items from outside app (e.g. forwarded email, upload) → first item: what they see while processing, reply text, when nothing extractable. (7) Invitations exist → join by invitation — different first run, arrive in full tenant. (8) Come back: sign out, sign in, recovery path once; note drawings promise what app lacks. (9) First plan gate or paywall in first session — what it says, whether next step clear. **Done when:** `First Run` has one row per point; condition unmet → `N/A` row with evidence.
- [ ] **Step 10 — Heuristics:** Drawing says how screen should look; nothing above asks whether drawn design is usable — screen matching bad drawing passes. Walk each primary flow; check every screen against Nielsen's 10 heuristics. Each violation = finding with heuristic (`H1` visibility of system status through `H10` help and documentation). Same problem in drawing → finding for drawing first. **Done when:** each primary flow has line in `Checked`; violations are findings.
- [ ] **Step 11 — Sessions:** Screenshot review ≠ user evidence. Every second run: same scripted tasks with real people — five participants from segments `Project Instructions` name; think-aloud; one script in `Sessions` for next round. Per task: success (unaided, with help, failed), time on task, Single Ease Question. Per session: SUS or UMUX-Lite — pick one, keep it. Each figure beside previous session. No participants → last round's date and next due; do not invent figures. **Done when:** `Sessions` holds figures beside previous session, or next due date.
- [ ] **Step 12 — AI Features:** Each user-visible result feature vs human-AI guidelines — user sees what it did and why; each extracted field correctable, each created item undoable; low-confidence flagged, not silently saved; failure says what happened and next step (Step 9 point 6 covers first). Screen already does this, fault is model output → `bkit-audit-llm`. **Done when:** `AI Features` row per feature: guideline · what the user sees · verdict.
- [ ] **Step 13 — Errors:** Trigger every validation and server error on primary forms — each says what happened and how to fix, plain language, next to field. Input survives failed submit, offline mid-form, session expiry. Every destructive action: undo or confirmation, same on every platform, not most prominent when drawing shows otherwise. **Done when:** `Errors` row per form and per destructive action.
- [ ] **Step 14 — Dates:** Product with dates, times, or recurrence → accounts in different locales and timezones. Date format, first day of week, and 12- or 24-hour time follow the locale. Members in different timezones: which timezone each sees, whether app says so when they differ. Event crossing daylight-saving change keeps wall-clock time. Editing recurring event: choice (this event, this and following, all events) clear, each does what it says. No dates → skip with evidence. **Done when:** `Dates` holds answers, or skip recorded.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Nielsen heuristic, ISO 9241-110 interaction principle, HAX guideline → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Everything changed since previous report's commit touching usability (screens and routes, shared components, drawings, copy, emails, notifications, plan gates, AI-produced results) → one-line verdict each. (b) Bounded ~30 min pass: what senior UX researcher flags that no step asks; read since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

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

Scale per `.bkit/jsonl.md` § Severity. Within a severity: blocked tasks first. Set bucket from frequency (how many users meet it), impact (whether they can get past it), persistence (whether it bothers them every time). Task user cannot finish = `HIGH`, or `CRITICAL` with no workaround. Drawing mismatch that stops nobody = `MEDIUM` or `LOW`.

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
