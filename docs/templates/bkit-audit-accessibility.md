<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.3 — do not edit; run `bkit upgrade` to refresh -->

# Accessibility Audit

> [!CAUTION]
> **Purpose:** What the automated accessibility gate covers, what it leaves out, and the manual passes nothing automates, judged against WCAG 2.2 AA.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites evidence (`file:line`, or command / query and its output) and tool behind it.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - never widen, narrow, or edit the CI accessibility gate or its allowlists; full-rule and platform audits are report-only.
> - never record an assistive-technology participant's name, contact, or health detail.

## Universal Instructions

### Context & Goals

Gate on + waiting for real content still covers partial rules/routes; not keyboard, screen reader, zoom, or native. Re-finding what CI blocks wastes the run.

Target failure: **a gate that stays green while the unchecked surface is where the defects are** — allowlist with no expiry, route never opened, checker on skeleton, custom control whose name the role forgot. Start from gate snapshot; scope everything below against it.

**Applies when:** a user interface (web, native, or email). None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when palette, shared control, or route layout changes. Assistive-technology user sessions: once a year, own date; record next due.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- WCAG 2.2 (W3C Recommendation; same text ISO/IEC 40500). Record dated update.
- EN 301 549. Record version procurement regime cites.
- European Accessibility Act, Directive (EU) 2019/882, where it applies.
- WAI-ARIA Authoring Practices Guide; record date read.
- Platform accessibility HIG and store nutrition-label criteria (e.g. Apple HIG and Accessibility Nutrition Labels, Android accessibility guidelines and Accessibility Scanner).
- National disability-discrimination guidance `Laws` finds applies (e.g. Australia's DDA and AHRC digital-access guidelines, US ADA via DOJ web guidance).

### Scope

- Applicable accessibility laws and required statement.
- Automated gate: rules, routes, themes, allowlists, self-checks, checker version.
- Full rule set, report-only, every route and every theme the app ships.
- Auth routes (accessible authentication), email, manual passes including assistive-technology matrix.
- WCAG 2.2 additions, every Level A and AA criterion, native, text across locales and widths.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Title, description, structured data | Search sweep; this audit owns alt text, headings, and names | `bkit-audit-aio-seo` |
| CLS numbers | Performance sweep; this audit names missing dimensions | `bkit-audit-app-performance` |
| Declaring store accessibility labels | Store sweep; this audit records which could be honest | `bkit-audit-app-store` |
| Accessibility-statement wording vs behaviour | Privacy sweep; this audit checks the statement exists when a law requires it | `bkit-audit-privacy` |
| Applying fixes / changing the gate or allowlists | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`. never retry or reword a blocked call to get past it.
- [ ] **Gate Source:** Steps 2, 4, 13 — automated-gate files readable. Fallback: no gate while UI exists = finding; later steps run without snapshot.
- [ ] **Checker:** Steps 5, 6 — full rule set, e.g. axe-core, pa11y, Accessibility Insights. Fallback: manual steps only; automated rows `Not Checked`.
- [ ] **Web:** Step 15 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Browser Runner:** Web UI → Steps 5, 6, 8, 11 — e.g. Playwright, Cypress. Fallback: manual on named route sample; rest `Not Checked`.
- [ ] **Assistive Tech:** Manual pass → Step 8 — e.g. NVDA, JAWS, VoiceOver, TalkBack, Voice Control, Voice Access, Switch Control. Fallback: each missing pair → `Not Checked`.
- [ ] **Native Audits:** Native UI → Step 12 — e.g. Xcode Accessibility Inspector, `performAccessibilityAudit()`, Android Accessibility Scanner, Espresso Accessibility Test Framework. Fallback: `Not Checked`.
- [ ] **Email Render:** Transactional email → Step 7 — rendered HTML. Fallback: template source.
- [ ] **Contrast Tool:** Non-text contrast → Step 8 — e.g. Colour Contrast Analyser. Fallback: ratios computed from tokens.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Gate:** Open gate specs and helpers. Record in `Gate`: checker rule set; route list + ready/settle selectors per route; each allowlist; gate-pinned vs audit-run checker version; rules checker changelog adds since previous report version (pinned old version under-reports newer WCAG 2.2 rules). Scope everything below against snapshot. **Done when:** snapshot in `Gate`, or no gate recorded.
- [ ] **Step 3 — Laws:** Which laws apply = owner decision; record or unmade (`Project Instructions` names questions). Law requiring public accessibility statement, service info, feedback channel → check they exist. Statement wording vs behaviour → `bkit-audit-privacy`. **Done when:** `Laws` row per regime: applies · why · statement.
- [ ] **Step 4 — Allowlists:** Per-offender keys, never runtime hash, never rule downgrade or route exclusion. Honest only if each entry re-read. Per entry: offender still there, reason still true, fixable now? No expiry/owner = permanent exemption = finding. Policy "new entry = finding, not fix" (`Project Instructions`) → new entry = finding. Stale (offender gone, key remains) = finding. **Done when:** `Allowlists` row per entry: still present · reason true · expiry or owner · verdict. Empty → one row `none`, key shape noted.
- [ ] **Step 5 — Full Rules:** Gate runs small rule set as hard gate. This audit: everything report-only — no rule restriction, every route, every theme the app ships, WCAG 2.2 AA tag set not just defaults. Full run on gate-uncovered route → findings. Do not widen CI rule set — rank; widening = later plan. Same sequencing as `bkit-audit-dead-code`: report first, gate later. **Done when:** `Full Rules` counts per route and theme, each violation dispositioned.
- [ ] **Step 6 — Routes:** Diff gate route list vs every route. Each auth route: WCAG 2.2 3.3.8 Accessible Authentication — paste in every password/code field; `autocomplete` (`email`, `current-password`, `new-password`, `one-time-code` on code fields, also 1.3.5); CAPTCHA alternative not cognitive test; note magic-link/passkey sign-in. **Done when:** `Routes` row per route: in gate / not, 3.3.8 line per auth route.
- [ ] **Step 7 — Emails:** Each transactional email the product sends (list from templates / send calls). Per message: `lang`; plain-text or real text alternative; image alt; layout tables `role="presentation"`; link text out of context; contrast. **Done when:** `Emails` row per message, or no email surface in `Checked`.
- [ ] **Step 8 — Manual:** Not automatable. One pass per run on primary flows named in `Project Instructions` (none named → sign-in → first screen → core create action; record flows walked):
  - Keyboard only: every control reachable, sensible order, visible focus; nothing reachable that should not be; no trap.
  - Focus management: dialogs/popovers take focus, restore on close, no strand.
  - Screen reader: names, roles, states — custom controls; `div` + role = common missing name.
  - Assistive-technology matrix: NVDA+Chrome, NVDA+Firefox; JAWS+Chrome; VoiceOver+Safari macOS; VoiceOver iOS Safari + native app; TalkBack Chrome + native Android; one flow Voice Control (iOS) or Voice Access (Android); one Switch Control. Record versions. Pairs from latest WebAIM Screen Reader User Survey — re-read new editions; record figure and year.
  - Composite widgets vs WAI-ARIA APG: grid (arrow keys), popover (dialog/disclosure), picker (listbox/combobox), tabs, menus — roles, keys, focus match pattern.
  - Status messages (4.1.3): toasts, async state, save confirmations, form errors via `aria-live` or `role="status"` without moving focus; self-dismissing toast readable duration or pausable (2.2.1).
  - Page structure: skip link to main (2.4.1); unique title per route/locale (2.4.2); link text names destination (2.4.4).
  - Colour alone (1.4.1): colour-only distinction also has initials, icon, or pattern — contrast tools miss this.
  - Non-text contrast (1.4.11): every theme — focus, borders, outlines, toggles, icons ≥3:1 vs adjacent; tools often skip.
  - Forced colours / increased contrast: `forced-colors: active`, platform Increase Contrast — custom controls and focus rings usual failures.
  - Zoom/reflow: 200% zoom, 320px viewport — no horizontal scroll or lost content (1.4.10).
  - Text spacing (1.4.12): line-height 1.5, paragraph spacing 2×, letter 0.12em, word 0.16em — nothing clipped/overlapping.
  - Content on hover/focus (1.4.13): Esc dismiss, hover without vanish, persist until dismissed.
  - Orientation/text size: no orientation lock unless essential (1.3.4); text 200% without loss (1.4.4), separate from 320px reflow.
  - Reduced motion: `prefers-reduced-motion` on animation surfaces.
  - Motion/flashing: no >5s self-starting animation without pause (2.2.2); no flashing (2.3.1). Native: Reduce Motion via platform API.

  **Done when:** `Manual` row per pass: met / finding / not checked (which pair).

- [ ] **Step 9 — Sessions:** Yearly, 3–5 daily assistive-technology users on primary flow. Expert review misses their strategies; many screen-reader users navigate by headings first (WebAIM survey — record figure). Record last session date and next due. None yet → due now, not pass. **Done when:** `Sessions` holds last date, next due, barriers, or `due now`.
- [ ] **Step 10 — Additions:** WCAG 2.2 likeliest gaps:
  - 2.5.7 Dragging Movements — every drag has single-pointer alternative.
  - 2.4.11 Focus Not Obscured — sticky headers/footers can cover focus.
  - 3.2.6 Consistent Help and 3.3.7 Redundant Entry across multi-step flows.
  - 2.5.8 Target Size (Minimum) — 24px floor, distinct from larger house convention gate may enforce.

  **Done when:** `Additions` line per criterion: met / finding / not applicable (why).

- [ ] **Step 11 — Layout:** Same screens; nothing else owns them. Source-language text breaks first when translations longer.
  - Hardcoded strings: if a hardcoded-string guard exists → re-read each exception — reason still true? User-facing string without reason = finding. No guard → record absence in `Checked`. Translation authoring = plan, not this run.
  - Longer text: fixed widths, single-line truncation, buttons sized to source label. Primary flow in pseudo-locale and longest shipped locale, web and native.
  - RTL: physical `left`/`right`, physical margin/padding where logical `start`/`end`; icons that should mirror and do not.
  - Type floor: `px` fonts not scaling with user text size; <12px; native text ignoring system font size.
  - Off-scale: colours/spacing bypassing design tokens (if the project has them); a colour guard, if one exists, may not cover spacing/sizes.
  - Layout-shift causes: images/media without width/height. CLS → `bkit-audit-app-performance`.
  - Breakpoints: each primary screen phone, tablet, desktop — not only 320px reflow.
  - Before colour/sizing defect: value duplicated? Duplicated colour/spacing = finding here + name for `bkit-audit-duplication`. Documented palette / token source (if any) = reference fix edits first.

  **Done when:** `Layout` row per check: met / finding.

- [ ] **Step 12 — Native:** Native UI → shared controls: name, role, state (e.g. `accessibilityLabel`, `accessibilityRole`, `accessibilityState`). Screen reader on same primary flow. Platform-split files (e.g. RN `.native`/`.web`) not diverged in labelling. Shared component fixed web bug → confirm native twin (consumer refs both ways; text search — language server under-reports). Platform automated audits report-only per primary-flow screen: iOS Accessibility Inspector or `performAccessibilityAudit()` in XCUITest; Android Accessibility Scanner or Espresso Accessibility Test Framework. Text scaling: largest accessibility text size + 200% font max (large-text scaling non-linear, e.g. Android 14+). Content not clipped/overlapped. Search text-scaling opt-outs on content text (e.g. RN `allowFontScaling={false}`, low `maxFontSizeMultiplier`; SwiftUI capped `dynamicTypeSize`; Android text sized in `dp` not `sp`) — finding unless reason recorded. Map to platform nutrition-label criteria (`Project Instructions`); declare only if common tasks completable with that feature; larger text needs ≥200%. Record honest labels; declaring → `bkit-audit-app-store`. **Done when:** `Native` holds label parity, audit rows, scaling, label map, or no native UI in `Checked`.
- [ ] **Step 13 — Gate Proof:** Vacuous-assertion class: checker on unmounted subtree passes; unmatched locator can pass assertion. Confirm gate self-checks fail closed — injected failure reported, injected undersize proves rule ran (not merely no violation when alternatives pass isolated node). Each route settle selector resolves after guarded content renders, including post-skeleton mount. Refactored route may measure skeleton again. **Done when:** self-check results in `Gate`, or no gate recorded.
- [ ] **Step 14 — Criteria:** Automated rules cover minority of WCAG success criteria; `Manual` + `Additions` = chosen subset. Primary flows web + native: pass/fail/N/A every WCAG 2.2 Level A and AA criterion. Reuse earlier steps (name step); hand-check rest. Each fail = finding. **Done when:** `Criteria` has no empty criterion.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: row per anchor + per WCAG 2.2 A/AA criterion → checked (name step; reuse `Criteria`) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Since previous report commit touching accessibility (routes, shared controls + platform twins (e.g. `.web`/`.native`), palette/tokens, animations, emails, gate rule set/route list/allowlists, checker version) → one-line verdict each. (b) ~30 min bounded: senior specialist flags no step asks; read since previous run (incidents, new `docs/failures.jsonl`, `bkit-audit-logs`, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and the checker version.
- [ ] **Sessions:** states the date of the last assistive-technology session and when the next is due.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
