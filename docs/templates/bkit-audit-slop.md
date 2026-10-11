<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# Slop Audit

> [!CAUTION]
> **Purpose:** Verdict on every suppression — scanner overrides, disable comments, casts, escape-hatch types, skipped tests, config opt-outs.
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
> - never recommend adding suppression; scanner config stays byte-identical to committed one.

## Universal Instructions

### Context & Goals

Each suppression made sense in one PR; nothing re-reads them. Glob hiding one deliberate pattern keeps hiding whatever lands under it; unexamined looks like examined. Audit reads every suppression list end to end.

**Applies when:** source under linter, type checker, scanner, or test runner. None, or no scanner and no in-code suppression → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly; extra when override count exceeds previous report's or pinned scanner version changes.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Slop scanner at pinned version (e.g. `slop-scan`).
- Strictest preset of type-aware linter (e.g. typescript-eslint `strict-type-checked`, mypy `--strict`; rule list changes in minors).
- Type-coverage tool (e.g. `type-coverage --strict`).
- Disable-comment rules (e.g. ESLint `reportUnusedDisableDirectives`, `eslint-comments/require-description`, Ruff `RUF100`).
- Cognitive Complexity (SonarSource white paper; e.g. `eslint-plugin-sonarjs`).
- Mutation testing (e.g. Stryker, mutmut).

### Scope

- Scanner config: overrides, ignores.
- In-code: disable comments (e.g. `eslint-disable`, `# noqa`, `//nolint`), type-checker ignores (e.g. `@ts-expect-error`, `# type: ignore`), casts, escape-hatch types (e.g. `any`, `Any`), non-null assertions on boundary values, test-weakening markers (skip / only / fail / soft / retry overrides).
- Config: linter, type checker, coverage, formatter, prose linter.
- Inferred: implicit escape-hatch types, unawaited async work, defensive noise.
- Complexity hotspots; surviving mutants.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Adding a suppression | Never recommended | — |
| Fixing / deleting findings | Audit reports only | Plan from this report |
| Dead files beyond reference check | Dead-code sweep | `bkit-audit-dead-code` |
| Test quality beyond mutants / mock-only assertions | Testing sweep | `bkit-audit-testing` |

### Verdicts

- **FIX:** hides real failure. Name change and override / comment it removes.
- **DELETE:** file dead, scratch, or finished one-off. Config entries hiding whole files only. Name file after reference check.
- **KEEP:** intentional. Record reason beside suppression — reasonless `KEEP` = unexamined next run.
- **OTHER:** fits none; say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

**Rule of thumb:** real debt only if you can name concrete bug hidden; else `KEEP`. Almost always `KEEP` (fixing degrades code): fail-open middleware, fire-and-forget / best-effort telemetry, tolerant parsing fallbacks, framework-required shapes, thin named data-access / predicate helpers, config-per-file dirs, intentional barrels, deliberate duplicate signatures, duplicated test mock setup.

**Always `FIX`:**

- Cast or escape-hatch type where data crosses boundary (SDK call, webhook payload, API response, DB client result) — hides drift boundary tests catch.
- Disabled hook-dependency rule (e.g. `react-hooks/exhaustive-deps`) whose effect reads unlisted value. Read effect, not comment.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Scanner:** Steps 2–4 — pinned in manifest, e.g. `slop-scan`. Fallback: skip scanner steps; run code / config steps.
- [ ] **Worktree:** Steps 2–8 — detached worktree off default branch. Fallback: Steps 5–7 read-only in main checkout; Steps 3, 8 `Not Checked`.
- [ ] **Git History:** Steps 5, 8 — full history for blame and churn. Fallback: ages and churn `Not Checked`.
- [ ] **Web:** Step 9 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Language Server:** Typed language → Step 4 — references, e.g. Serena, `tsserver`. Fallback: text search only; name it per `DELETE`.
- [ ] **Typed Lint and Type Coverage:** Typed language → Step 7 — e.g. typescript-eslint typed rules, `type-coverage`, mypy. Fallback: text-search escape-hatch counts.
- [ ] **Complexity and Mutation Tools:** Tools exist for language → Step 8 — e.g. `eslint-plugin-sonarjs`, Stryker, mutmut; install in worktree only. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Isolate:** Find scanner run (package scripts). Detached worktree off default branch (no new branch); clean `git status` before start; removed before report finishes. **Done when:** worktree path and clean status in `Checked`, or absent scanner recorded.
- [ ] **Step 3 — Hidden Findings:** Pinned scanner, committed config → JSON baseline. Stripped config (build-artifact ignores only, no overrides, all rules on) under restore guard → scan → restore → `diff` byte-identical. Suppressed = in stripped, not baseline; stripped count not fix-list. Count override blocks. Restore fails → STOP; restore committed config; record finding. **Done when:** baseline / stripped / suppressed / override-block counts in `Counts`; config diff empty.
- [ ] **Step 4 — Verdicts:** Read each suppressed site, not rule name → verdict. `DELETE` needs reference check: language-server references where available + text search basename (script / config refs language server lacks). Text search over-reports, language server under-reports → agreement = signal. Re-run every empty result once before `DELETE`. **Done when:** every suppressed finding has verdict and evidence.
- [ ] **Step 5 — Code Suppressions:** Search source for disable comments, type-checker ignores, escape-hatch types, double casts, single casts / non-null assertions on boundary values, test-weakening markers, stray debug output, `TODO` / `FIXME` / `HACK`. Split product vs test code. Type-level tests: expected-error directive = assertion, not suppression. Drop comment-only hits and import renames. Then:
  - Disable naming a rule the resolved config lacks → suppresses nothing → `FIX`.
  - Commented-out code → `FIX` unless comment says why it stays.
  - `TODO` citing closed tracker item → `FIX`.
  - Each suppression: introducing commit, date, PR (`git blame`); agent-authored (agent branch prefix / `Co-authored-by`)?

  **Done when:** every hit has verdict; counts per kind, age distribution, agent share in `Counts`.

- [ ] **Step 6 — Config Suppressions:** List per config: linter rules off / warn for globs and ignore entries; resolved type-checker config per workspace (not file) — relaxed strictness / excludes (strictness identical across workspaces); coverage excludes and ignore comments; formatter ignores; prose-linter ignores / off-switches. **Done when:** every entry `FIX` / `KEEP`; count per kind in `Counts`.
- [ ] **Step 7 — Inferred Types:** Most escape-hatch typing implicit (e.g. `res.json()`, `JSON.parse`, `json.loads`, untyped SDK return, `catch (e)`) → per package: type coverage and any-typed boundary identifiers; unsafe-any lint counts; unawaited / misused async (e.g. floating promises) in request handlers and background jobs (serverless: post-response work not guaranteed unless platform API, e.g. Next.js `after()` / `waitUntil`); defensive-noise density (unnecessary conditions / assertions, useless catches). Typed rules from CLI, config untouched; no typed linting → record. **Done when:** measurements in `Counts`; each handler violation = `FIX` row.
- [ ] **Step 8 — Hotspots:** Top 20 functions by cognitive complexity (threshold 15) × 90-day churn. Mutation-test 1–2 packages with most suppressions / casts → surviving-mutant rate. Mock-only assertions = disguised suppression. Missing tools → install in worktree only; clean `git status` at end. **Done when:** hotspot table and mutant rate in `Counts`, or missing tool recorded.
- [ ] **Step 9 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per standard and per strict-preset rule resolved config leaves off → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 10 — Anything Else:** (a) Everything changed since previous report's commit touching suppressions (scanner / linter / type-checker / coverage / prose configs, new disables / casts / escape-hatch types / skips, lint scripts) → one-line verdict each. (b) Bounded ~30 min pass: what senior reviewer of this language flags that no step asks; read since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Tree clean:** scanner config byte-identical to committed; worktree `git status` clean.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Suppression hides a security, auth, or data-loss failure |
| `HIGH` | Boundary cast / escape-hatch type on untrusted input; promise that can drop handler work; skipped / focused test; blanket disable naming no rule |
| `MEDIUM` | Reason no longer matches code; disable for a rule the config lacks; `TODO` citing closed item; relaxed strictness in one workspace |
| `LOW` | `KEEP` without written reason; commented-out code |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: security / data first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

Empty and clean → one row `None`.

## Report

### Summary

PENDING

### Previous Run

PENDING

### Counts

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
- [ ] **Summary:** names count per severity and baseline / stripped / suppressed counts.
- [ ] **Series:** `Counts` beside previous report's counts, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
