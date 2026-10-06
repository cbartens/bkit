<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Testing Audit

> [!CAUTION]
> **Purpose:** Whether the suite tests what the product must do and must never do, whether those tests go red when the code breaks, and whether they run.
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
> - NEVER weaken, skip, delete, or quarantine a test to get green. A test that fails because it found a real bug is working.
> - Mutation and clock probes restore the tree before the report finishes: in-place edits reverted, throwaway setup removed, `git status` clean on touched paths. Restore fails → STOP, restore, record as finding.
> - Do not run suites that send mail, take payment, or write production tenants. Unit and local / throwaway targets only.

## Universal Instructions

### Context & Goals

A green suite says the tests passed. It does not say they could have failed, that a promise with no code yet has a test, or that any lane runs them. A coverage percentage misses both: a line can be covered by a test that asserts nothing, and a percentage cannot show a behaviour that should exist and has no test. Target failure: **a test that stays green when the behaviour it names is broken, or a promise with no test at the tier that would notice.**

**Applies when:** a test runner, test files, or a CI test lane. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly. Every product area and every package or app. Record mutation cost per package. A package the mutation tool cannot finish is `Not Checked` with that cost, never omitted. Extra pass when a test-toolchain major or its config changes (mutation step with force — incremental mode misses those); when a new route, worker, or external service lands; when `bkit-audit-logs` or `bkit-audit-flakes` reports a bug no test caught.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Risk-based testing (e.g. ISO/IEC/IEEE 29119 Part 1:2022 and Part 2:2021, ISTQB Foundation Level syllabus).
- Test-size model (e.g. Testing Trophy, Google test sizes); unversioned → record the date read.
- Mutation tool, incl. incremental mode and disable comments (e.g. StrykerJS, mutmut); record the version run.
- Property-based testing (e.g. fast-check, Hypothesis); record the version read.
- Contract testing (e.g. Pact, schema snapshots); record the version read.
- Database tests (e.g. pgTAP, a catalog check against the deployed schema); record the date read.
- OWASP ASVS and the OWASP API Security Top 10; record the edition read.
- Visual and accessibility snapshots (e.g. Playwright `toHaveScreenshot` / `toMatchAriaSnapshot`, device screenshots); record the runner version.
- Test-smell catalogue (e.g. xUnit Test Patterns, Meszaros 2007).
- Test lint (e.g. `@vitest/eslint-plugin`, `eslint-plugin-playwright`, `eslint-plugin-testing-library`); record each version.
- Network mock that fails closed (e.g. MSW); record the major read.

### Scope

- Should-test list: promises, never-events, platforms, roles, failure paths, data that outlives the request. Right tier, not only any tier.
- Database rules and boundary contracts have tests, not only the guards in front of them.
- Mutation: would the tests go red. Known shapes of a test that cannot fail. Lint and setup that should catch those shapes.
- Every test file has a lane. Timezone and date boundaries. Duplicated test procedure.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Branch-coverage percentage and the CI floor | Coverage sweep | `bkit-audit-coverage` |
| Flake diagnosis | Flake triage | `bkit-audit-flakes` |
| Log sweeps | Log triage | `bkit-audit-logs` |
| Turning a check into a CI gate | Gates sweep | `bkit-audit-gates` |
| Dead code beyond a mutant no test runs | Dead-code sweep | `bkit-audit-dead-code` |
| Product-code duplication | Duplication sweep | `bkit-audit-duplication` |
| Catalogue privileges and policy correctness | Database sweep | `bkit-audit-database` |
| Changing tests or code | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Git:** Steps 1, 14 — `git rev-parse`, diff since previous report. Fallback: run marked baseline; ages and the what-changed pass `Not Checked`.
- [ ] **Test Runner:** Steps 3, 6, 9, 10 — execute or read reports, e.g. Vitest, Jest, pytest. Fallback: static read only; counts, mutation, and clock runs `Not Checked`.
- [ ] **Web:** Step 13 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Mutation Tool:** Tool exists for the language → Step 6 — e.g. Stryker, mutmut. Fallback: hand-break the code the tests protect; scores `Not Checked`.
- [ ] **E2E Runner:** Browser or device E2E → Steps 3, 7, 9 — e.g. Playwright, Cypress, Maestro. Fallback: unit and integration only.
- [ ] **DB Tests:** Row-level policies, buckets, or data migrations → Step 4 — e.g. pgTAP, `supabase db test`, deployed-schema check. Fallback: read existing tests; live matrix = hypothesis.
- [ ] **Test Lint:** Test files linted → Step 8 — e.g. eslint-plugin-vitest, eslint-plugin-playwright. Fallback: text search for the shapes.
- [ ] **Language Server:** Typed language → Step 11 — references, e.g. Serena, `tsserver`. Fallback: text search; name it.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Scope:** Every product area for Steps 3–5 (a behaviour usually crosses packages). Every package or app for Steps 6–11. An area shared with a native client → every platform; one defect can have a different cause on each. **Done when:** every area, every package, and platforms in `Scope`; tools and commands in `Checked`.
- [ ] **Step 3 — Behaviours:** Start from what the product should do, not from the code. Code finds untested code. It cannot find a promise with no test, or a failure nobody guarded. Rows from: screens and routes (each action one row; finishing it is a separate row from opening it); unattended work (workers, crons, inbound, webhooks, tool APIs); security rules (cross-tenant read or write, a role acting above itself, signed-out access); OWASP ASVS and API Security Top 10 items the security doc may omit (cross-tenant object access, open redirect, SSRF via a user-supplied URL, mass assignment, rate limiting, CSRF, webhook signature bypass) — a tier for each; decisions ledger (a decision with no test can be undone unnoticed); failures ledger (each fixed row needs a test that goes red if the fix is reverted); each external-service boundary needs a live test that reaches the real service. Multiply every row: every platform (native is never out of scope when a native client exists); every role, both can and cannot; failure path (request fails, service down, invalid input, cancel halfway); data that outlives the request (deletes, retention, billing, storage writes). Per row, tier = unit / integration / live / web E2E / device E2E / none, judged against the project's tier rubric. Tier lower than the behaviour needs (a mock standing in for a real external API) = gap. Tier higher than it needs (only web or device E2E where unit or integration would do) = finding — slowness and flake come from there. Record test count and runtime per tier per package (trophy vs pyramid). Per core screen: visual or accessibility snapshot on web, device screenshot on native; list screens with neither. Rank gaps: another tenant's data, lost data, or money first; then a broken core action; then cosmetic. Recurring shapes: action started but never finished (confirm on a destructive or session-wide action); a failing request still reported as success; a security guard that is the only thing stopping an attack (app check because the DB client skips row-level rules) — list it even when the code is correct today; settings that exist only as config (triggers, schedules, concurrency, lint globs, auth mount paths) — a blank value breaks production and nothing notices. A behaviour-to-test registry, if one exists → start from it and add; do not rebuild. Coverage reports show code no test runs; they cannot produce this list. **Done when:** ranked gaps, tiers, and per-tier counts in `Gaps`.
- [ ] **Step 4 — Database Rules:** Database with row-level policies, storage buckets, definer-rights functions, or data-changing migrations → app-level guard tests cannot catch a policy regression in a migration. Per table with row-level security, per bucket, and per definer-rights function: a DB test (e.g. pgTAP) or a database-backed integration test asserts allow and deny for each role and each operation (select, insert, update, delete). Record matrix gaps. A migration that transforms rows, not only the schema → a replay test against seeded representative rows asserts invariants: row counts, no orphaned foreign keys, no nulls in a new `NOT NULL` column. **Done when:** matrix in `Database Rules`, or skip with evidence.
- [ ] **Step 5 — Contracts:** External services or fielded older clients → fixtures typed against the provider SDK and the pinned API version; age of each recorded payload against that version; a webhook with a bad or expired signature is tested and rejected. A contract or snapshot pins the API and validator shapes the oldest supported client relies on; otherwise a server breaking change ships green. **Done when:** rows in `Contracts`, or skip with evidence.
- [ ] **Step 6 — Mutation:** Run the mutation tool on every package. One small change at a time (flip a comparison, delete a line, blank a string). Setup and traps → project docs. In-place mutation → nothing else builds, lints, tests, or commits the package under mutation; tree clean afterwards or STOP and restore. Give every unnoticed change exactly one verdict:
  - **Bug in the code** — the change exposed real wrong behaviour. Route as an app bug.
  - **Real gap** — a test exists and does not check this. Name the missing assertion.
  - **No test at all** — no unit test runs this code. Which tier should own it → Step 3.
  - **Caught elsewhere** — an integration, live, or E2E test would catch it. Name the test. "Probably the E2E" is not a verdict.
  - **Equivalent** — no observable difference. Report the tool's disable comment to add so the next run does not re-judge it. Adding it is the next step.
  - **Not worth a test** — log text, error messages.
  - **Tool misreport** — re-check by hand.
  - **Other** — say why. Same `Other` on 2 runs → propose a verdict in `Process Improvements`.

  Do not trust the tool's numbers until checked. A runner that executed zero tests per mutant reports every mutant inside a suite as survived. A test file that crashes on load is recorded as survived, not caught. Integration-named tests that mock everything can sit outside both the unit run and the mutation run. Tests that read source as text cannot be mutated. Re-check every zero-tests survivor by hand. Code the tool cannot reach (browser specs, device flows, lint guard tests) → break it by hand, run the test, watch it go red, restore. Two scores: total, and covered (leaves out mutants no test runs), by package and by product risk area from Step 3. A total dominated by **No test at all** hides how weak the existing tests are. List pure functions where boundary mutants survive (comparisons, dates, timezones, permission checks, validators) → one property-based test to recommend each. Record cost: wall-clock, CPU-seconds, peak memory, agents the triage took. Whether this becomes a CI check depends on those numbers → `bkit-audit-gates`. Run incremental, keeping the previous incremental file; `--force` every few runs and after any dependency, config, or snapshot change. Record which mode ran. **Done when:** both scores, verdicts, property candidates, cost, and mode in `Scores`, or skip with evidence.

- [ ] **Step 7 — Shapes:** Search every package for a test that cannot fail. Every one of these has been green while checking nothing:
  - A wait that does not wait. A visibility check whose timeout is ignored (e.g. `isVisible({ timeout })`); a response wait whose result nobody reads.
  - An assertion that matches anything. A bare regex inside an object matcher matches any string (e.g. Vitest `toMatchObject`); comparing two constants instead of calling the code.
  - A mock that hides the thing under test. A hand-written mock of a shared module, or a fixture shape production never produces.
  - A test of a copy, not the code. A hand-written copy of the guard, or two apps built by the same code compared with each other.
  - A setup that skips the code. A fake database that always returns empty, so the branch under test never runs.
  - A test that locks in a bug. It asserts the wrong behaviour, and no decision says that behaviour was wanted.
  - A positive control that cannot fail. It asserts something is absent, using a selector or text that never existed.
  - A guard tested in a different setup from the one it runs in (working directory, config, or env).
  - A string scan cut short. A comment stripper that cuts at a comment marker also cuts that marker inside strings.
  - A test that checks the wrong surface. The write goes to one place and the test reads another. For every write, the assertion reads the surface the write was meant to change. Derived copies → `bkit-audit-database`.
  - A status-only assertion. Response code and nothing else, on an operation that can return success when it failed. Assert what was stored.
  - Two clients mocked as one. User-scoped and admin clients run as different roles. The same mock object cannot see a write through the wrong one. Mocks keep dependencies that differ at runtime different.
  - "Did not throw" as the only check on a boundary (webhook, external API, database write). Not throwing is not evidence the work happened. Step 6 usually confirms these.

  A new shape → propose it under `Process Improvements`. Do not edit this list during the run. **Done when:** every hit in `Shapes`, or `none`.

- [ ] **Step 8 — Guards:** A shape a tool can catch belongs in a lint rule or a setup file, not in each run's search. Confirm these are enabled for test files and record the violation count for each: `vitest/expect-expect`, `vitest/valid-expect`, `vitest/no-conditional-in-test`, `playwright/missing-playwright-await`, `playwright/no-wait-for-timeout`, `playwright/prefer-web-first-assertions`, `playwright/no-networkidle`, `playwright/no-force-option`, `@typescript-eslint/no-floating-promises`. A rule that would catch a Step 7 shape and is off → finding, destination `bkit-audit-gates`. Confirm the network mock fails the test on an unhandled request (e.g. MSW `onUnhandledRequest: 'error'`). Otherwise an unmocked call reaches a real service or hangs. Fixtures and factories typed against generated DB types and schema validators. Grep tests for `as any` and `as unknown as`: that is how a fixture drifts into a shape production never produces. Count snapshot assertions and their size. List `.snap` files that changed in the same commit as the code they cover since the previous report's commit. A large snapshot, or one updated wholesale with `-u`, behaves like an assertion that matches anything. **Done when:** counts and hits in `Guards`.
- [ ] **Step 9 — Runs:** For every test file, some lane runs it. Names that put a file outside every run (see Step 6). Suites that skip themselves when setup fails, instead of failing. `test.skip`, `fixme`, `describe.skip`, and skips that depend on an environment variable. Stale build output the runner now collects (e.g. Vitest 4 and later does not ignore `dist/` by default). The 20 slowest tests per tier from the runner reports. A slow test is the next one someone skips. **Done when:** rows in `Runs`.
- [ ] **Step 10 — Time:** Date, calendar, or timezone logic → run the unit tests with `TZ` set to a non-UTC zone that observes daylight saving (e.g. `Pacific/Auckland`, `America/St_Johns`), on the process before workers spawn. Then run the date-touching suites with the clock pinned near a month end and near a daylight-saving change (e.g. `vi.setSystemTime`, Playwright `page.clock`), using a throwaway setup file removed afterwards. Record every test whose result changes. List suites that never pin the clock. **Done when:** results in `Time`, or skip with evidence.
- [ ] **Step 11 — Copies:** The same test procedure written in several places (opening a dialog, creating a user, reading credentials). Copies that disagree come first. Copies that agree need a single owner only if they are likely to drift. When one owner is created, the next step adds a guard that fails on any new copy. A code graph finds copied functions. Copied statement sequences need a syntax-tree scan. Product-code duplication → `bkit-audit-duplication`. **Done when:** groups in `Copies`, or `none`.
- [ ] **Step 12 — Route:** No finding without evidence a reader can re-check: `file:line`, or the query, run id, or measurement, plus the tool. Language-server empty is inconclusive → corroborate with text search. The report names where each finding goes. Sending it is the next step. App bug → a `docs/failures.jsonl` row and its own issue; security bugs flagged for the project's security milestone. Missing test, small → the test to write. Missing test, large → a follow-up issue. Test that cannot fail → the fix, a positive control (break the code, watch the test go red, restore), and a `docs/failures.jsonl` row. Behaviour with no recorded intent → a question for the maintainer; do not guess the intended behaviour from the code. Tier too high → the lower-tier test to write; the higher-tier test stays until the new one has been seen to go red. Equivalent mutant → the disable comment to add. Result depends on timezone or date → an app bug if the app is wrong; otherwise the test fix and a `docs/failures.jsonl` row. Flaky test → `bkit-audit-flakes`. A coverage floor that should move → `bkit-audit-coverage`. A check that could become a CI gate → `bkit-audit-gates`. Dead code → `bkit-audit-dead-code`. **Done when:** every finding's Expected names a destination.
- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per OWASP API Security Top 10 item and ASVS chapter (attack rows in Step 3), and per test-smell in the catalogue (shapes in Step 7) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. Do not change the steps during the run. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything changed since previous report's commit that touches the suite (test files and helpers, fixtures, and factories, unit / browser / device runner config, CI test lanes, and the routes, workers, migrations, and external services the tests cover) → one-line verdict each. (b) Bounded ~30 min pass: what a senior test engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Tree clean:** mutation restores and throwaway clock setup removed; no test weakened, skipped, or deleted.
- [ ] **Scores:** total and covered recorded, or mutation explicitly skipped with evidence.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Untested or cannot-fail guard on cross-tenant access, money, or a workflow with no workaround; the lane that should run that guard does not |
| `HIGH` | Core behaviour with no test, or a test that cannot go red; security guard with no test; untyped external contract or untested signature rejection; timezone-dependent result hiding a real bug |
| `MEDIUM` | Tier too low or too high; missing failure path; lint rule off that would catch a cannot-fail shape; duplicated procedures that disagree; snapshot that matches anything; suite that skips itself |
| `LOW` | Equivalent mutant without a disable comment; cosmetic screen without a visual assertion; agreed duplicates |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: security / data first.

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

### Scope

PENDING

### Gaps

PENDING

### Database Rules

PENDING

### Contracts

PENDING

### Scores

PENDING

### Shapes

PENDING

### Guards

PENDING

### Runs

PENDING

### Time

PENDING

### Copies

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
- [ ] **Summary:** names the single most important finding, count per severity, and both mutation scores per package (or the skip).
- [ ] **Series:** test count and runtime per tier, and both scores, beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
