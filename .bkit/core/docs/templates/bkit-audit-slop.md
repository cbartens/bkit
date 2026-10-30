<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Slop Audit

> [!CAUTION]
> **Purpose:** Verdict on every suppression — scanner overrides, disable comments, casts, escape-hatch types, skipped tests, config opt-outs.
>
> **Rules:**
>
> - Never recommend adding a suppression.
> - Keep the scanner config byte-identical to the committed one.

## Universal Instructions

### Context & Goals

Each suppression made sense in the PR that added it, and nothing reads them again. A glob that hides one deliberate pattern keeps hiding whatever lands under it, and an unexamined suppression looks the same as an examined one. This audit reads every suppression list end to end.

**Applies when:** the source is under a linter, type checker, scanner or test runner. **If** none of these exists, **or** there is no scanner and no in-code suppression → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when the override count exceeds the previous report's, or when the pinned scanner version changes.

**Anchor Standards:**

- Slop scanner at pinned version (e.g. `slop-scan`).
- Strictest preset of type-aware linter (e.g. typescript-eslint `strict-type-checked`, mypy `--strict`; rule list changes in minors).
- Type-coverage tool (e.g. `type-coverage --strict`).
- Disable-comment rules (e.g. ESLint `reportUnusedDisableDirectives`, `eslint-comments/require-description`, Ruff `RUF100`).
- Cognitive Complexity (SonarSource white paper; e.g. `eslint-plugin-sonarjs`).
- Mutation testing (e.g. Stryker, mutmut).

### Scope

- List the scanner config's overrides and ignores.
- Find in-code suppressions: disable comments (e.g., `eslint-disable`, `# noqa`, `//nolint`), type-checker ignores (e.g., `@ts-expect-error`, `# type: ignore`), casts, escape-hatch types (e.g., `any`, `Any`), non-null assertions on boundary values, and test-weakening markers (skip / only / fail / soft / retry overrides).
- List config suppressions in the linter, type checker, coverage, formatter and prose linter.
- Measure inferred suppressions: implicit escape-hatch types, unawaited async work and defensive noise.
- Find complexity hotspots.
- Measure surviving mutants.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Adding a suppression | It is never recommended | — |
| Fixing / deleting findings | The audit only reports | A plan made from this report |
| Dead files beyond reference check | The dead-code sweep owns them | `bkit-audit-dead-code` |
| Test quality beyond mutants / mock-only assertions | The testing sweep owns it | `bkit-audit-testing` |

### Verdicts

- **FIX:** it hides a real failure. Name the change, and the override or comment it removes.
- **DELETE:** the file is dead, scratch or a finished one-off. For a config entry, use it only when the entry hides whole files. Name the file after the reference check.
- **KEEP:** it is intentional. Record the reason beside the suppression, because a `KEEP` with no reason counts as unexamined on the next run.
- **OTHER:** it fits no other verdict. Say why. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

**Rule of thumb:** **If** you can name the concrete bug a suppression hides → it is real debt. **Else** → `KEEP`. These are almost always `KEEP`, because fixing them degrades the code: fail-open middleware, fire-and-forget or best-effort telemetry, tolerant parsing fallbacks, framework-required shapes, thin named data-access or predicate helpers, config-per-file directories, intentional barrels, deliberate duplicate signatures, and duplicated test mock setup.

**Always `FIX`:**

- A cast or escape-hatch type where data crosses a boundary (SDK call, webhook payload, API response, DB client result). It hides drift that boundary tests catch.
- A disabled hook-dependency rule (e.g., `react-hooks/exhaustive-deps`) whose effect reads an unlisted value. Read the effect, not the comment.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Scanner:** Steps 2-4 — the scanner pinned in the manifest (e.g., `slop-scan`). Fallback: skip the scanner steps, and run the code and config steps.
- [ ] **Worktree:** Steps 2-8 — a detached worktree off the default branch. Fallback: run Steps 5-7 read-only in the main checkout, and mark Steps 3 and 8 `Not Checked`.
- [ ] **Git History:** Steps 5, 8 — full history, for blame and churn. Fallback: mark ages and churn `Not Checked`.
- [ ] **Web:** Step 9 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Language Server:** **If** the language is typed → Step 4 — references (e.g., Serena, `tsserver`). Fallback: text search only, and name it on each `DELETE`.
- [ ] **Typed Lint and Type Coverage:** **If** the language is typed → Step 7 — typed lint rules and type coverage (e.g., typescript-eslint typed rules, `type-coverage`, mypy). Fallback: count escape-hatch types with text search.
- [ ] **Complexity and Mutation Tools:** **If** tools exist for the language → Step 8 — complexity and mutation runs (e.g., `eslint-plugin-sonarjs`, Stryker, mutmut). Install them in the worktree only. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Isolate:** Find how the scanner runs (package scripts). Create a detached worktree off the default branch, with no new branch. Check that `git status` is clean before you start, and remove the worktree before the report finishes. **Done when:** `Checked` holds the worktree path and its clean status, or the absent scanner is recorded.
- [ ] **Step 3 — Hidden Findings:** Run the pinned scanner with the committed config, and save the result as a JSON baseline. Under a restore guard, scan with a stripped config (build-artifact ignores only, no overrides, all rules on), then restore the config and `diff` it to confirm it is byte-identical. A suppressed finding is one in the stripped run but not in the baseline. The stripped count is not a fix list. Count the override blocks. **If** the restore fails → **STOP**, restore the committed config, and record a finding. **Done when:** `Counts` holds the baseline, stripped, suppressed and override-block counts, and the config diff is empty.
- [ ] **Step 4 — Verdicts:** Read each suppressed site, not only its rule name, and give it a verdict. `DELETE` needs a reference check: language-server references where available, plus a text search for the basename (for script and config references the language server lacks). Text search over-reports and the language server under-reports, so agreement between them is the signal. Re-run every empty result once before `DELETE`. **Done when:** every suppressed finding has a verdict and evidence.
- [ ] **Step 5 — Code Suppressions:** Search the source for disable comments, type-checker ignores, escape-hatch types, double casts, single casts and non-null assertions on boundary values, test-weakening markers, stray debug output, and `TODO` / `FIXME` / `HACK`. Split product code from test code. In type-level tests, an expected-error directive is an assertion, not a suppression. Drop comment-only hits and import renames. Then:
  - **If** a disable names a rule the resolved config lacks → it suppresses nothing, so it is `FIX`.
  - Commented-out code is `FIX`, unless a comment says why it stays.
  - A `TODO` that cites a closed tracker item is `FIX`.
  - For each suppression, record the introducing commit, date and PR (`git blame`), and whether an agent wrote it (agent branch prefix or `Co-authored-by`).

  **Done when:** every hit has a verdict, and `Counts` holds the counts per kind, the age distribution and the agent share.

- [ ] **Step 6 — Config Suppressions:** List, per config: linter rules turned off or set to warn for globs, and ignore entries; the resolved type-checker config per workspace (not per file), with any relaxed strictness or excludes (strictness is expected to be identical across workspaces); coverage excludes and ignore comments; formatter ignores; and prose-linter ignores and off-switches. **Done when:** every entry is `FIX` or `KEEP`, and `Counts` holds the count per kind.
- [ ] **Step 7 — Inferred Types:** Most escape-hatch typing is implicit (e.g., `res.json()`, `JSON.parse`, `json.loads`, an untyped SDK return, `catch (e)`). For each package, measure type coverage and any-typed boundary identifiers; unsafe-any lint counts; unawaited or misused async (e.g., floating promises) in request handlers and background jobs; and defensive-noise density (unnecessary conditions and assertions, useless catches). On serverless, work after the response is not guaranteed unless it uses a platform API (e.g., Next.js `after()` / `waitUntil`). Run the typed rules from the CLI, and leave the config untouched. **If** there is no typed linting → record that. **Done when:** `Counts` holds the measurements, and each handler violation is a `FIX` row.
- [ ] **Step 8 — Hotspots:** Rank the top 20 functions by cognitive complexity (threshold 15) times 90-day churn. Mutation-test the 1-2 packages with the most suppressions or casts, and record the surviving-mutant rate. Mock-only assertions are a disguised suppression. **If** a tool is missing → install it in the worktree only. Check that `git status` is clean at the end. **Done when:** `Counts` holds the hotspot table and the mutant rate, or the missing tool is recorded.
- [ ] **Step 9 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per standard, and one per strict-preset rule the resolved config leaves off, each marked checked (naming the step), not applicable (saying why) or finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 10 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches suppressions: scanner, linter, type-checker, coverage and prose configs; new disables, casts, escape-hatch types and skips; and lint scripts. (b) In a bounded pass of about 30 minutes, note what a senior reviewer of this language would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Tree clean:** the scanner config is byte-identical to the committed one.
- [ ] **Worktree clean:** the worktree's `git status` is clean.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A suppression hides a security, auth or data-loss failure |
| `HIGH` | A boundary cast or escape-hatch type on untrusted input. A promise that can drop handler work. A skipped or focused test. A blanket disable that names no rule |
| `MEDIUM` | A reason that no longer matches the code. A disable for a rule the config lacks. A `TODO` that cites a closed item. Relaxed strictness in one workspace |
| `LOW` | A `KEEP` with no written reason. Commented-out code |

Within a severity, list security and data findings first.

<!-- prettier-ignore -->
| ID | Severity | Verdict | Location | Evidence | Expected |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

**If** the run finds nothing → write one row: `None`.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, and the baseline, stripped and suppressed counts.
- [ ] **Series:** the report shows `Counts` beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
