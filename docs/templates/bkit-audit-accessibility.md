<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Accessibility Audit

> [!CAUTION]
> **Purpose:** What the automated accessibility gate covers, what it leaves out, and the manual passes nothing automates, judged against WCAG 2.2 AA.
>
> **Rules:**
>
> - NEVER widen, narrow or edit the CI accessibility gate or its allowlists.
> - Run the full-rule and platform audits as report-only.
> - NEVER record an assistive-technology participant's name, contact or health detail.

## Universal Instructions

### Context & Goals

An automated gate that is switched on and waits for real content still covers only some rules and some routes. It does not cover keyboard use, screen readers, zoom or native apps. Re-finding what CI already blocks wastes the run.

The failure this audit targets is a gate that stays green while the defects sit in the surface it does not check. Examples: an allowlist entry with no expiry, a route the gate never opens, a checker that runs on a loading skeleton, or a custom control that has a role but no name. Start from the gate snapshot, and scope everything below against it.

**Applies when:** the project has a user interface (web, native or email). **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when the palette, a shared control or the route layout changes. Hold assistive-technology user sessions once a year, on their own date, and record when the next one is due.

**Anchor Standards:**

- WCAG 2.2 (W3C Recommendation, the same text as ISO/IEC 40500). Record the dated update.
- EN 301 549. Record the version that the procurement regime cites.
- European Accessibility Act, Directive (EU) 2019/882, where it applies.
- WAI-ARIA Authoring Practices Guide. Record the date read.
- Platform accessibility HIG and store nutrition-label criteria (e.g. Apple HIG and Accessibility Nutrition Labels, Android accessibility guidelines and Accessibility Scanner).
- National disability-discrimination guidance that `Laws` finds applies (e.g. Australia's DDA and AHRC digital-access guidelines, US ADA via DOJ web guidance).
- bkit block of `docs/design.md` (bkit version from `.bkit/version`): every rule and section

### Scope

- Find the accessibility laws that apply, and the statement they require.
- Snapshot the automated gate: its rules, routes, themes, allowlists, self-checks and checker version.
- Run the full rule set, report-only, on every route and every theme the app ships.
- Check the auth routes for accessible authentication.
- Check the emails the product sends.
- Run the manual passes, including the assistive-technology matrix.
- Check the WCAG 2.2 additions and every Level A and AA criterion.
- Check the native UI.
- Check text across locales and widths.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Title, description, structured data | The search sweep owns them. This audit owns alt text, headings and names | `bkit-audit-aio-seo` |
| CLS numbers | The performance sweep owns them. This audit names missing dimensions | `bkit-audit-app-performance` |
| Declaring store accessibility labels | The store sweep owns it. This audit records which labels could be declared honestly | `bkit-audit-app-store` |
| Whether the accessibility statement's wording matches behaviour | The privacy sweep owns it. This audit checks that the statement exists when a law requires it | `bkit-audit-privacy` |
| Applying fixes; changing the gate or allowlists | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Gate Source:** Steps 2, 4, 13 — the automated gate's files, readable. Fallback: **If** a user interface exists and no gate does → record a finding, and run the later steps without a snapshot.
- [ ] **Checker:** Steps 5, 6 — the full rule set (e.g., axe-core, pa11y, Accessibility Insights). Fallback: run the manual steps only, and mark the automated rows `Not Checked`.
- [ ] **Web:** Step 15 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Browser Runner:** **If** the UI is web → Steps 5, 6, 8, 11 — a browser runner (e.g., Playwright, Cypress). Fallback: check a named sample of routes by hand, and mark the rest `Not Checked`.
- [ ] **Assistive Tech:** **If** a manual pass runs → Step 8 — assistive technology (e.g., NVDA, JAWS, VoiceOver, TalkBack, Voice Control, Voice Access, Switch Control). Fallback: mark each missing pair `Not Checked`.
- [ ] **Native Audits:** **If** the UI is native → Step 12 — the platform audit tools (e.g., Xcode Accessibility Inspector, `performAccessibilityAudit()`, Android Accessibility Scanner, Espresso Accessibility Test Framework). Fallback: `Not Checked`.
- [ ] **Email Render:** **If** the product sends transactional email → Step 7 — the rendered HTML. Fallback: read the template source.
- [ ] **Contrast Tool:** **If** non-text contrast is checked → Step 8 — a contrast tool (e.g., Colour Contrast Analyser). Fallback: compute the ratios from the tokens.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Gate:** Open the gate's specs and helpers. Record in `Gate`: the checker rule set; the route list, with the ready and settle selectors of each route; each allowlist; the checker version the gate pins beside the version this audit runs; and the rules the checker's changelog added since the previous report's version, because a pinned old version under-reports the newer WCAG 2.2 rules. Scope every step below against this snapshot. **Done when:** `Gate` holds the snapshot, or records that there is no gate.
- [ ] **Step 3 — Laws:** Which laws apply is the owner's decision. Record the decision, or record that it is unmade (`Project Instructions` names the questions). **If** a law requires a public accessibility statement, service information or a feedback channel → check that each exists. Whether the statement's wording matches behaviour goes to `bkit-audit-privacy`. **Done when:** `Laws` holds one row per regime: applies · why · statement.
- [ ] **Step 4 — Allowlists:** A sound allowlist keys each entry to one offender, never to a runtime hash, and never downgrades a rule or excludes a route. An allowlist is honest only if each entry is re-read. For each entry, check whether the offender is still there, whether the reason is still true, and whether it is fixable now. **If** an entry has neither an expiry nor an owner → it is a permanent exemption, and a finding. **If** `Project Instructions` sets the policy "a new entry is a finding, not a fix" → record each new entry as a finding. **If** an entry is stale (the offender is gone and the key remains) → record a finding. **Done when:** `Allowlists` holds one row per entry: still present · reason true · expiry or owner · verdict. **If** there are no entries → write one row `none`, and note the key shape.
- [ ] **Step 5 — Full Rules:** The gate runs a small rule set as a hard gate. This audit runs everything, report-only: no rule restriction, every route and every theme the app ships, and the WCAG 2.2 AA tag set, not just the defaults. Record what the full run finds on a route the gate does not cover as findings. Do not widen the CI rule set. Rank the findings instead, and leave widening to a later plan. The order is the same as in `bkit-audit-dead-code`: report first, gate later. **Done when:** `Full Rules` holds the counts per route and theme, and each violation has a disposition.
- [ ] **Step 6 — Routes:** Diff the gate's route list against every route. Check each auth route against WCAG 2.2 3.3.8 Accessible Authentication: paste works in every password and code field; `autocomplete` is set (`email`, `current-password`, `new-password`, and `one-time-code` on code fields, which 1.3.5 also covers); and any CAPTCHA has an alternative that is not a cognitive test. Note magic-link and passkey sign-in. **Done when:** `Routes` holds one row per route, in the gate or not, and one 3.3.8 line per auth route.
- [ ] **Step 7 — Emails:** List each transactional email the product sends, from the templates and send calls. Check each message for `lang`; a plain-text part or a real text alternative; image alt text; `role="presentation"` on layout tables; link text that makes sense out of context; and contrast. **Done when:** `Emails` holds one row per message, or `Checked` records that there is no email surface.
- [ ] **Step 8 — Manual:** These checks cannot be automated. Run one pass per run on the primary flows that `Project Instructions` names. **If** it names none → walk sign-in, then the first screen, then the core create action. Record the flows walked. On each flow, run these passes:
  - Keyboard only: every control is reachable, in a sensible order, with visible focus. Nothing is reachable that should not be, and there is no keyboard trap.
  - Focus management: dialogs and popovers take focus and restore it on close, and focus is never stranded.
  - Screen reader: custom controls have names, roles and states. A `div` given a role is the common case of a missing name.
  - Assistive-technology matrix: NVDA with Chrome and with Firefox; JAWS with Chrome; VoiceOver with Safari on macOS; VoiceOver with iOS Safari and the native app; TalkBack with Chrome and the native Android app; one flow with Voice Control (iOS) or Voice Access (Android); and one with Switch Control. Record the versions. The pairs come from the latest WebAIM Screen Reader User Survey. Re-read each new edition, and record the figure and the year.
  - Composite widgets against the WAI-ARIA APG: grid (arrow keys), popover (dialog or disclosure), picker (listbox or combobox), tabs and menus. Their roles, keys and focus match the pattern.
  - Status messages (4.1.3): toasts, async state, save confirmations and form errors are announced through `aria-live` or `role="status"` without moving focus. A self-dismissing toast stays for a readable duration, or can be paused (2.2.1).
  - Page structure: a skip link to the main content (2.4.1); a unique title per route and locale (2.4.2); link text that names its destination (2.4.4).
  - Colour alone (1.4.1): a distinction made by colour also has initials, an icon or a pattern. Contrast tools miss this.
  - Non-text contrast (1.4.11): in every theme, focus indicators, borders, outlines, toggles and icons reach >=3:1 against adjacent colours. Tools often skip this.
  - Forced colours and increased contrast: check `forced-colors: active` and the platform's Increase Contrast. Custom controls and focus rings are the usual failures.
  - Zoom and reflow: at 200% zoom and a 320px viewport, there is no horizontal scroll and no lost content (1.4.10).
  - Text spacing (1.4.12): with line-height 1.5, paragraph spacing 2x, letter spacing 0.12em and word spacing 0.16em, nothing is clipped or overlapping.
  - Content on hover or focus (1.4.13): Esc dismisses it, the pointer can move onto it without it vanishing, and it persists until dismissed.
  - Orientation and text size: there is no orientation lock unless it is essential (1.3.4), and text resizes to 200% without loss (1.4.4), which is a separate check from 320px reflow.
  - Reduced motion: animation surfaces respect `prefers-reduced-motion`.
  - Motion and flashing: no self-starting animation runs longer than 5s without a pause (2.2.2), and nothing flashes (2.3.1). On native, Reduce Motion is read through the platform API.

  **Done when:** `Manual` holds one row per pass: met / finding / not checked (naming the pair).

- [ ] **Step 9 — Sessions:** Once a year, the owner holds a session with 3-5 people who use assistive technology daily, on a primary flow. Expert review misses their strategies. For example, many screen-reader users navigate by headings first (the WebAIM survey; record the figure). Record the date of the last session and when the next is due. **If** no session has happened yet → record it as due now, not as a pass. **Done when:** `Sessions` holds the last date, the next due date and the barriers found, or `due now`.
- [ ] **Step 10 — Additions:** Check the WCAG 2.2 additions most likely to be missed:
  - 2.5.7 Dragging Movements — every drag has a single-pointer alternative.
  - 2.4.11 Focus Not Obscured — sticky headers and footers can cover focus.
  - 3.2.6 Consistent Help and 3.3.7 Redundant Entry, across multi-step flows.
  - 2.5.8 Target Size (Minimum) — a 24px floor, distinct from any larger house convention the gate may enforce.

  **Done when:** `Additions` holds one line per criterion: met / finding / not applicable (saying why).

- [ ] **Step 11 — Layout:** Use the same screens. No other audit owns these checks. Source-language text breaks layouts first when translations are longer.
  - Hardcoded strings: **If** a hardcoded-string guard exists → re-read each of its exceptions, and check that its reason still holds. A user-facing string with no reason is a finding. **If** there is no guard → record its absence in `Checked`. Writing translations belongs to a plan, not this run.
  - Longer text: look for fixed widths, single-line truncation and buttons sized to the source label. Walk the primary flow in a pseudo-locale and in the longest shipped locale, on web and native.
  - RTL: look for physical `left` and `right`, and physical margin and padding, where logical `start` and `end` belong; and for icons that should mirror and do not.
  - Type floor: look for `px` fonts that do not scale with the user's text size, text under 12px, and native text that ignores the system font size.
  - Off-scale values: look for colours and spacing that bypass the design tokens, where the project has them. A colour guard, where one exists, may not cover spacing and sizes.
  - Layout-shift causes: look for images and media without width and height. CLS goes to `bkit-audit-app-performance`.
  - Breakpoints: check each primary screen at phone, tablet and desktop widths, not only at 320px reflow.
  - Before you record a colour or sizing defect, check whether the value is duplicated. A duplicated colour or spacing value is a finding here, and is named for `bkit-audit-duplication`. Where the project documents a palette or token source, that source is the reference the fix edits first.

  **Done when:** `Layout` holds one row per check: met / finding.

- [ ] **Step 12 — Native:** Run this step only when the project has a native UI. Check that each shared control carries a name, role and state (e.g., `accessibilityLabel`, `accessibilityRole`, `accessibilityState`). Run the screen reader on the same primary flow. Check that platform-split files (e.g., React Native `.native` and `.web`) have not diverged in labelling. **If** a shared component fixed a web bug → confirm its native twin, following consumer references both ways with text search, because the language server under-reports them. Run the platform's automated audits, report-only, on each primary-flow screen: iOS Accessibility Inspector or `performAccessibilityAudit()` in XCUITest; Android Accessibility Scanner or the Espresso Accessibility Test Framework. Test text scaling at the largest accessibility text size and at the 200% font maximum, because large-text scaling is non-linear (e.g., Android 14+). Check that no content is clipped or overlapping. Search for text-scaling opt-outs on content text (e.g., React Native `allowFontScaling={false}` or a low `maxFontSizeMultiplier`; a capped SwiftUI `dynamicTypeSize`; Android text sized in `dp`, not `sp`). Each one is a finding unless a reason is recorded. Map the results to the platform's nutrition-label criteria (`Project Instructions`). A label may be declared only if common tasks can be completed with that feature, and larger text needs >=200%. Record which labels would be honest. Declaring them belongs to `bkit-audit-app-store`. **Done when:** `Native` holds label parity, the audit rows, scaling and the label map, or `Checked` records that there is no native UI.
- [ ] **Step 13 — Gate Proof:** A gate can pass on a vacuous assertion: a checker run on an unmounted subtree passes, and an unmatched locator can pass an assertion. Confirm that the gate's self-checks fail closed: an injected failure is reported, and an injected undersize target proves the rule ran, not merely that no violation appeared because alternatives pass on an isolated node. Check that each route's settle selector resolves after the guarded content renders, including content mounted after a skeleton. A refactored route may measure the skeleton again. **Done when:** `Gate` holds the self-check results, or records that there is no gate.
- [ ] **Step 14 — Criteria:** Automated rules cover a minority of the WCAG success criteria, and `Manual` and `Additions` cover a chosen subset. On the primary flows, web and native, mark every WCAG 2.2 Level A and AA criterion pass, fail or N/A. Reuse the earlier steps, naming the step, and check the rest by hand. Record each fail as a finding. **Done when:** `Criteria` has no empty criterion.
- [ ] **Step 15 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per anchor and one per WCAG 2.2 A and AA criterion, each marked checked (naming the step, and reusing `Criteria`), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 16 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches accessibility: routes, shared controls and their platform twins (e.g., `.web` and `.native`), the palette and tokens, animations, emails, the gate's rule set, route list and allowlists, and the checker version. (b) In a bounded pass of about 30 minutes, note what a senior specialist would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows, `bkit-audit-logs` output, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Gate untouched:** the checker invocation, route list and allowlists are byte-identical to the committed versions.
- [ ] **No participants:** no name, contact or health detail of an assistive-technology user appears in the report.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A primary task is impossible with the keyboard, a screen reader or the only authentication method, and there is no workaround |
| `HIGH` | A WCAG 2.2 A or AA fail on a primary flow. A hollow gate self-check, or a gate that measured a skeleton. A drag on a primary interaction with no single-pointer alternative. An allowlist entry that hides a real A or AA failure |
| `MEDIUM` | An A or AA fail off the primary flows. An email defect. A native name, role or state missing on a shared control. Text clipped at 200%, at 320px or in a long locale. An allowlist entry whose reason is stale or that has no expiry |
| `LOW` | The UI meets AA and misses a house convention (e.g., 44px where 2.5.8's 24px holds). Wording drift that changes no criterion |

Within a severity, list blocked primary tasks first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and the checker version.
- [ ] **Sessions:** `Sessions` states the date of the last assistive-technology session and when the next is due.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
