<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Accessibility Audit

> [!CAUTION]
> **Purpose:** What the automated accessibility gate covers, what it leaves out, and the manual passes nothing automates, judged against WCAG 2.2 AA.
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
> - NEVER widen, narrow, or edit the CI accessibility gate or its allowlists; full-rule and platform audits are report-only.
> - NEVER record an assistive-technology participant's name, contact, or health detail.

## Universal Instructions

### Context & Goals

An automated gate that proves its own rules are on, and waits for real content, still covers a slice of the rules, a slice of the routes, and none of keyboard, screen reader, zoom, or native. Re-finding what CI already blocks wastes the run. Target failure: **a gate that stays green while the unchecked surface is where the defects are** — an allowlist entry with no expiry, a route never opened, a checker run against a skeleton, a custom control whose name the role forgot. Start from the gate snapshot; everything below is scoped against it.

**Applies when:** a user interface (web, native, or email). None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when the palette, a shared control, or a route's layout changes. Sessions with assistive-technology users run once a year, on their own date; each run records when the next is due.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- WCAG 2.2 (W3C Recommendation; the same text is ISO/IEC 40500). Record the dated update.
- EN 301 549. Record which version the procurement regime cites.
- European Accessibility Act, Directive (EU) 2019/882, where it applies.
- WAI-ARIA Authoring Practices Guide; record the date read.
- Platform accessibility HIG and store nutrition-label criteria (e.g. Apple HIG and Accessibility Nutrition Labels, Android accessibility guidelines and Accessibility Scanner).
- National disability-discrimination guidance that `Laws` finds applies (e.g. Australia's DDA and AHRC digital-access guidelines, US ADA via DOJ web guidance).

### Scope

- Applicable accessibility laws, and the statement they require.
- The automated gate: rules, routes, themes, allowlists, self-checks, checker version.
- Full rule set, report-only, on every route and both themes.
- Auth routes (accessible authentication), email, and manual passes including the assistive-technology matrix.
- WCAG 2.2 additions, every Level A and AA criterion, native, and text across locales and widths.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Title, description, structured data | Search sweep; this audit owns alt text, headings, and names | `bkit-audit-aio-seo` |
| CLS numbers | Performance sweep; this audit names missing dimensions | `bkit-audit-app-performance` |
| Declaring store accessibility labels | Store sweep; this audit records which could be honest | `bkit-audit-app-store` |
| Accessibility-statement wording vs behaviour | Privacy sweep; this audit checks the statement exists when a law requires it | `bkit-audit-privacy` |
| Applying fixes / changing the gate or allowlists | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Gate Source:** Steps 2, 4, 13 — automated-gate files readable. Fallback: no gate while a UI exists = finding; later steps run without a snapshot.
- [ ] **Checker:** Steps 5, 6 — full rule set, e.g. axe-core, pa11y, Accessibility Insights. Fallback: manual steps only; automated rows `Not Checked`.
- [ ] **Web:** Step 15 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Browser Runner:** Web UI → Steps 5, 6, 8, 11 — e.g. Playwright, Cypress. Fallback: manual on a named sample of routes; the rest `Not Checked`.
- [ ] **Assistive Tech:** Manual pass → Step 8 — e.g. NVDA, JAWS, VoiceOver, TalkBack, Voice Control, Voice Access, Switch Control. Fallback: each missing pair → `Not Checked`.
- [ ] **Native Audits:** Native UI → Step 12 — e.g. Xcode Accessibility Inspector, `performAccessibilityAudit()`, Android Accessibility Scanner, Espresso Accessibility Test Framework. Fallback: `Not Checked`.
- [ ] **Email Render:** Transactional email → Step 7 — rendered HTML. Fallback: template source.
- [ ] **Contrast Tool:** Non-text contrast → Step 8 — e.g. Colour Contrast Analyser. Fallback: ratios computed from tokens.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Gate:** Open the gate specs and their helpers. Record, in `Gate`: the rule set passed to the checker; the route list and each route's ready / settle selectors; the contents of each allowlist; the checker version the gate pins and the version this audit runs; rules the checker changelog adds between the previous report's version and this one. A pinned old version under-reports newer WCAG 2.2 rules. Everything below is scoped against that snapshot. **Done when:** snapshot in `Gate`, or no gate recorded.
- [ ] **Step 3 — Laws:** Which laws apply is an owner decision; record it, or that it is unmade (`Project Instructions` names the questions). A law that requires a public accessibility statement, service information, and a feedback channel → check they exist. Statement wording vs behaviour → `bkit-audit-privacy`. **Done when:** `Laws` row per regime: applies · why · statement.
- [ ] **Step 4 — Allowlists:** Per-offender keys, never a runtime hash, never a rule downgrade or a route exclusion. That design stays honest only if each entry is re-read. Per entry: is the offender still there, is the reason still true, and can it be fixed now? An entry with no expiry or owner is a permanent exemption = finding. A list whose policy is "a new entry is a finding, not a fix" (`Project Instructions`) → a new entry = finding. Stale entry (offender gone, key remains) = finding. **Done when:** `Allowlists` row per entry: still present · reason true · expiry or owner · verdict. Empty list → one row `none`, with the key shape.
- [ ] **Step 5 — Full Rules:** The gate runs a small rule set so it can be a hard gate. This audit runs everything, report-only: no rule restriction, every route, both themes, and the WCAG 2.2 AA tag set rather than only the default rules. A full run on a route the gate does not cover will produce findings. Do NOT widen the CI rule set this run — rank, and leave widening to a later plan. Same sequencing as `bkit-audit-dead-code`: report first, gate later. **Done when:** `Full Rules` counts per route and theme, each violation dispositioned.
- [ ] **Step 6 — Routes:** Diff the gate's route list against every route. On each auth route, check WCAG 2.2 3.3.8 Accessible Authentication directly: paste works in every password and code field; each field carries its `autocomplete` token (`email`, `current-password`, `new-password`, and `one-time-code` on any code field), which also satisfies 1.3.5 Identify Input Purpose; any CAPTCHA has an alternative that is not a cognitive test; note whether a magic-link or passkey sign-in exists. **Done when:** `Routes` row per route: in gate / not, and a 3.3.8 line per auth route.
- [ ] **Step 7 — Emails:** Invitation, sign-up confirmation, and inbound-reply emails are part of the flow. Per message: `lang` set, a plain-text part or a real text alternative, images have alt text, layout tables carry `role="presentation"`, link text makes sense out of context, and text meets contrast. **Done when:** `Emails` row per message, or no email surface in `Checked`.
- [ ] **Step 8 — Manual:** None of this is automatable. One pass per run on the primary flows (sign-in → first screen → create the main object → its calendar or list):
  - Keyboard only. Every interactive control reachable, in a sensible order, with a visible focus indicator. Nothing reachable that should not be. No trap.
  - Focus management. Dialogs and popovers take focus, restore it on close, and do not strand it.
  - Screen reader. Names, roles, states — particularly on custom controls. A `div` with a role is where a name goes missing.
  - Assistive-technology matrix. Each pair: NVDA with Chrome and with Firefox; JAWS with Chrome; VoiceOver with Safari on macOS; VoiceOver on iOS in Safari and in the native app; TalkBack in Chrome and in the native app on Android. Then one flow with Voice Control (iOS) or Voice Access (Android), and one with Switch Control. Record each version. Which pairs matter comes from the latest WebAIM Screen Reader User Survey; re-read it when a new one is published, and record the figure and year.
  - Composite widgets against the WAI-ARIA APG pattern they imitate: grid with arrow-key navigation, popover as dialog or disclosure, picker as listbox or combobox, tabs, and menus. Roles, keys, and focus match the pattern.
  - Status messages (4.1.3). Toasts, async processing state, save confirmations, and form errors are announced through `aria-live` or `role="status"` without moving focus. A toast that dismisses itself stays long enough to read, or can be paused (2.2.1).
  - Page structure. A skip link to the main content (2.4.1); a unique page title per route and locale (2.4.2); link text that says where it goes (2.4.4).
  - Colour alone (1.4.1). Items told apart by colour also carry initials, an icon, or a pattern. Automated contrast cannot see this.
  - Non-text contrast (1.4.11). Automated tools often skip it. Both themes: focus indicators, input borders, outlines, toggles, and icons reach 3:1 against what is next to them.
  - Forced colours and increased contrast. `forced-colors: active`, and the platforms' Increase Contrast settings. Custom-drawn controls and focus rings are the usual casualties.
  - Zoom and reflow. 200% zoom and a 320px viewport without horizontal scroll or lost content (1.4.10).
  - Text spacing (1.4.12). Line height 1.5, paragraph spacing 2×, letter spacing 0.12em, and word spacing 0.16em; nothing clipped or overlapping.
  - Content on hover or focus (1.4.13). Dismiss with Esc, hover without vanishing, and stay until dismissed.
  - Orientation and text size. No orientation lock unless essential (1.3.4). Text resizes to 200% without loss (1.4.4), separate from the 320px reflow check.
  - Reduced motion. `prefers-reduced-motion` respected by the animation surfaces.
  - Motion and flashing. No animation that starts by itself and runs longer than 5 seconds without a way to pause it (2.2.2), and nothing that flashes (2.3.1). On native, Reduce Motion is respected through the platform API.

  **Done when:** `Manual` row per pass: met / finding / not checked (which pair).

- [ ] **Step 9 — Sessions:** Once a year, 3 to 5 people who use assistive technology every day walk the primary flow. Expert review misses their strategies; many screen-reader users move by headings first (latest WebAIM survey — record the figure). Record the date of the last session and when the next is due. None yet → due now, not a pass. **Done when:** `Sessions` holds last date, next due, and barriers, or `due now`.
- [ ] **Step 10 — Additions:** WCAG 2.2 criteria are the likeliest gaps:
  - 2.5.7 Dragging Movements — every drag has a single-pointer alternative.
  - 2.4.11 Focus Not Obscured — sticky headers and footers can cover a focused element.
  - 3.2.6 Consistent Help and 3.3.7 Redundant Entry across multi-step flows.
  - 2.5.8 Target Size (Minimum) — the 24px floor, distinct from any larger house convention the gate enforces.

  **Done when:** `Additions` line per criterion: met / finding / not applicable (why).

- [ ] **Step 11 — Layout:** Same screens, and nothing else owns them. Text that fits in the source language breaks first when translations are longer.
  - Hardcoded strings. Re-read each exception a CI guard allows: is the reason still true? A string a person reads, with no reason, = finding. Authoring the translation is a plan, not this run.
  - Longer text. Fixed widths, single-line truncation, and buttons sized to the source-language label. Walk the primary flow in the pseudo-locale and in the longest shipped locale, on web and on native.
  - Right-to-left. Physical `left` / `right` and physical margin or padding sides where logical `start` / `end` is meant; icons that should mirror and do not.
  - Type floor. Font sizes in `px` that do not scale with the user's text size, anything below 12px, and native text that does not follow the system font size.
  - Off-scale values. Colours and spacing that bypass design tokens. A raw-colour contract does not cover spacing or sizes.
  - Layout-shift causes. Images and media without width and height. CLS numbers → `bkit-audit-app-performance`.
  - Breakpoints. Each primary screen at phone, tablet, and desktop widths, not only the 320px reflow check.
  - Before a colour or sizing defect, ask whether the value is duplicated. A duplicated colour or spacing value is a finding here and is named for `bkit-audit-duplication`. The design-doc palette table is the reference a fix edits first.

  **Done when:** `Layout` row per check: met / finding.

- [ ] **Step 12 — Native:** Native UI → shared controls carry a name, role, and state (e.g. `accessibilityLabel`, `accessibilityRole`, `accessibilityState`). Screen reader over the same primary flow. Platform splits (`.native` / `.web`) have not diverged in labelling. Where a shared component fixed a web bug, confirm the native twin got it — references on both consumers; text search corroborates, because a language server under-reports. Then the platforms' own automated audits, report-only, on each primary-flow screen: iOS Accessibility Inspector, or `performAccessibilityAudit()` in an XCUITest where the OS supports it; Android Accessibility Scanner, or Espresso's Accessibility Test Framework. Text scaling: largest accessibility text size, and the 200% font maximum (large-text scaling is not linear, e.g. Android 14 and later). Content text is not clipped or overlapped. Search `allowFontScaling={false}` and a low `maxFontSizeMultiplier` on content text; each is a finding unless the reason is recorded. Map results onto the platform's nutrition-label criteria (`Project Instructions`). A label can be declared only when people can complete common tasks with that feature; larger text needs text to reach at least 200%. Record which labels could honestly be declared. Declaring them → `bkit-audit-app-store`. **Done when:** `Native` holds label parity, audit rows, scaling, and the label map, or no native UI in `Checked`.
- [ ] **Step 13 — Gate Proof:** The vacuous-assertion class is specific to this surface: a checker run against an unmounted subtree passes, and an unmatched locator can be a passing assertion. Confirm the gate's own self-checks still fail closed — the injected failure is reported, and the injected undersize shows the rule executed, not merely that a violation was absent when the rule's alternatives can pass an isolated node. Each route's settle selector still resolves after the content it guards actually renders, including content that mounts later than the skeleton. A refactored route can go back to measuring a skeleton. **Done when:** self-check results in `Gate`, or no gate recorded.
- [ ] **Step 14 — Criteria:** Automated rules cover a minority of WCAG's success criteria, and `Manual` and `Additions` check a chosen subset. For the primary flows, on web and native, record pass, fail, or not applicable for every WCAG 2.2 Level A and AA criterion. Reuse what earlier steps established, naming the step, and check the rest by hand. Each fail is a finding. **Done when:** `Criteria` has no empty criterion.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per anchor standard and per WCAG 2.2 Level A and AA success criterion → checked (name step; reuse `Criteria`) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Everything changed since previous report's commit touching accessibility (routes, shared controls and their `.web` / `.native` twins, the palette and design tokens, animations, emails, the gate's rule set, route list, and allowlists, and the checker version) → one-line verdict each. (b) Bounded ~30 min pass: what a senior accessibility specialist flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows, log-audit output from `bkit-audit-logs`, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Gate untouched:** checker invocation, route list, and allowlists byte-identical to committed.
- [ ] **No participants:** no name, contact, or health detail of an assistive-technology user.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A primary task is impossible with keyboard, screen reader, or the only authentication method, and there is no workaround |
| `HIGH` | WCAG 2.2 A or AA fail on a primary flow; gate self-check hollow, or the gate measured a skeleton; a drag on a primary interaction has no single-pointer alternative; an allowlist entry hides a real A or AA failure |
| `MEDIUM` | A or AA fail off the primary flows; email defect; native name, role, or state missing on a shared control; text clipped at 200%, at 320px, or in a long locale; allowlist entry whose reason is stale or has no expiry |
| `LOW` | Meets AA and misses a house convention (e.g. 44px where 2.5.8's 24px holds); wording drift that changes no criterion |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: blocked primary tasks first.

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

### Gate

PENDING

### Laws

PENDING

### Allowlists

PENDING

### Full Rules

PENDING

### Routes

PENDING

### Emails

PENDING

### Manual

PENDING

### Sessions

PENDING

### Additions

PENDING

### Layout

PENDING

### Native

PENDING

### Criteria

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
- [ ] **Summary:** names count per severity and the checker version.
- [ ] **Sessions:** states the date of the last assistive-technology session and when the next is due.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
