<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Testing Audit

> [!CAUTION]
> **Purpose:** Whether the suite tests what the product must do and must never do, whether those tests go red when the code breaks, and whether they run.
>
> **Rules:**
>
> - Never weaken, skip, delete or quarantine a test to get green. A test that fails because it found a real bug is working.
> - Mutation and clock probes restore the tree before the report finishes: revert in-place edits, remove throwaway setup, and leave `git status` clean on the touched paths.
> - **If** a restore fails → **STOP**, restore the tree, and record a finding.
> - NEVER run suites that send mail, take payment or write to production tenants. Run unit tests and local or throwaway targets only.

## Universal Instructions

### Context & Goals

A green suite means the tests passed. It does not mean they could fail, that every promise has a test, or that the lanes run them. Coverage percentage misses both: a line can be covered by a test that asserts nothing, and a percentage cannot show behaviour that should exist but has no test. The failure this audit targets is a test that stays green when the behaviour it names is broken, or a promise with no test at the tier that would notice.

**Applies when:** the project has a test runner, test files or a CI test lane. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a month, covering every product area and every package or app, and record the mutation cost per package. **If** a package's mutation tool cannot finish → mark it `Not Checked` with that cost, and never omit it. Run an extra pass when the test toolchain's major version or config changes (run mutation with force, because incremental mode misses those changes), when a new route, worker or external service lands, or when `bkit-audit-logs` or `bkit-audit-flakes` reports a bug no test caught.

**Anchor Standards:**

- Risk-based testing (e.g. ISO/IEC/IEEE 29119 Part 1:2022 and Part 2:2021, ISTQB Foundation Level syllabus).
- Test-size model (e.g. Testing Trophy, Google test sizes); unversioned → record the date read.
- Mutation tool, incl. incremental mode and disable comments (e.g. StrykerJS, mutmut); record the version run.
- Property-based testing (e.g. fast-check, Hypothesis); record the version read.
- Contract testing (e.g. Pact, schema snapshots); record the version read.
- Database tests (e.g. pgTAP, a catalog check against the deployed schema); record the date read.
- OWASP ASVS and the OWASP API Security Top 10; record the edition read.
- Visual and accessibility snapshots (e.g. Playwright `toHaveScreenshot` / `toMatchAriaSnapshot`, device screenshots); record the runner version.
- Test-smell catalogue (e.g. xUnit Test Patterns, Meszaros 2007).
- Test lint (e.g. `@vitest/eslint-plugin`, `eslint-plugin-playwright`, `eslint-plugin-testing-library`, or Oxlint's `vitest` + `typescript` plugins); record each version. typescript-eslint type-aware rules need a TypeScript version it supports; newer → Oxlint `--type-aware` (oxlint-tsgolint).
- Network mock that fails closed (e.g. MSW); record the major read.
- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Validated means executed, not "didn't fail"; § A guard asserts the rule, not the sentence that explains it; § Which tier does a behaviour need?; § Test first; § What each tier must do; § Design assertions are a dimension, not a lane; § Schema-invariant DB checks (e.g. RLS coverage); § Provision backing services fresh; § Optional hardening (adopt when the cost is justified); § Coverage on PRs

### Scope

- Build the should-test list: promises, never-events, platforms, roles, failure paths, and data that outlives the request.
- Check that each item is tested at the right tier, not only at some tier.
- Check that database rules and boundary contracts have tests, not only the guards in front of them.
- Run mutation testing to see whether the tests go red.
- Search for the known cannot-fail shapes.
- Check the lint and setup that should catch those shapes.
- Check that every test file has a lane.
- Check timezone and date boundaries.
- Find duplicated test procedures.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Branch-coverage percentage and the CI floor | The coverage sweep owns them | `bkit-audit-coverage` |
| Flake diagnosis | Flake triage owns it | `bkit-audit-flakes` |
| Log sweeps | Log triage owns them | `bkit-audit-logs` |
| Turning a check into a CI gate | The gates sweep owns it | `bkit-audit-gates` |
| Dead code beyond a mutant no test runs | The dead-code sweep owns it | `bkit-audit-dead-code` |
| Product-code duplication | The duplication sweep owns it | `bkit-audit-duplication` |
| Catalogue privileges and policy correctness | The database sweep owns them | `bkit-audit-database` |
| Changing tests or code | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Git:** Steps 1, 14 — `git rev-parse`, and the diff since the previous report. Fallback: mark the run as baseline, and mark the ages and the what-changed pass `Not Checked`.
- [ ] **Test Runner:** Steps 3, 6, 9, 10 — run the tests or read their reports (e.g., Vitest, Jest, pytest). Fallback: read statically only, and mark the counts, mutation runs and clock runs `Not Checked`.
- [ ] **Web:** Step 13 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Mutation Tool:** **If** a tool exists for the language → Step 6 — mutation runs (e.g., Stryker, mutmut). Fallback: break the code the tests protect by hand, and mark the scores `Not Checked`.
- [ ] **E2E Runner:** **If** there is browser or device E2E → Steps 3, 7, 9 — E2E runs (e.g., Playwright, Cypress, Maestro). Fallback: cover unit and integration tests only.
- [ ] **DB Tests:** **If** there are row-level policies, buckets or data migrations → Step 4 — database tests (e.g., pgTAP, `supabase db test`, a deployed-schema check). Fallback: read the existing tests, and treat the live matrix as a hypothesis.
- [ ] **Test Lint:** **If** test files are linted → Step 8 — test lint rules (e.g., `@vitest/eslint-plugin`, `eslint-plugin-playwright`, Oxlint `vitest` / `typescript` plugins). Fallback: text search for the shapes.
- [ ] **Language Server:** **If** the language is typed → Step 11 — references (e.g., Serena, `tsserver`). Fallback: text search, and name it.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Scope:** Cover every product area in Steps 3-5, because behaviour usually crosses packages. Cover every package or app in Steps 6-11. **If** an area is shared with a native client → cover every platform, because one defect can have a different cause on each. **Done when:** `Scope` holds every area, every package and the platforms, and `Checked` holds the tools and commands.
- [ ] **Step 3 — Behaviours:** Start from what the product should do, not from the code. The code finds untested code, not promises with no test or unguarded failures. Build rows from:
  - Screens and routes: each action is one row, and finishing an action is a separate row from opening it.
  - Unattended work: workers, crons, inbound, webhooks and tool APIs.
  - Security rules: cross-tenant read and write, a role acting above itself, and signed-out access.
  - OWASP ASVS and API Security Top 10 items the security doc may omit (cross-tenant object access, open redirect, SSRF through a user-supplied URL, mass assignment, rate limiting, CSRF, webhook signature bypass). Give each one a tier.
  - The decisions ledger: a decision with no test can be undone unnoticed.
  - The failures ledger: each fixed row needs a test that goes red if the fix is reverted. For each fixed `HIGH` / `CRITICAL` row, revert the fix as a Step 6 hand mutant. A test named for the row is not proof. **If** the fix is not found (e.g., `git log -S` / `--grep` on the row key or file), **or** cannot be reverted locally (an applied migration, a remote setting) → mark the row `Not Checked` with the reason, never guarded.
  - Each external-service boundary: it needs a live test that reaches the real service.
  - Multiply every row by every platform (native is never out of scope when a native client exists), by every role that can and cannot act, by the failure path (the request fails, a service is down, the input is invalid, the user cancels halfway), and by data that outlives the request (deletes, retention, billing, storage writes).
  - For each row, set the tier (unit, integration, live, web E2E, device E2E or none) against the project rubric. A tier below the behaviour (a mock for a real external API) is a gap. A tier above it (only web or device E2E where unit or integration suffices) is a finding, because it is a source of slowness and flakes. Record the test count and runtime per tier per package (trophy against pyramid). For each core screen, check for a visual or accessibility snapshot on web, or a device screenshot on native, and list the screens with neither.
  - Rank the gaps: another tenant's data, lost data and money first, then a broken core action, then cosmetic.
  - Look for recurring shapes: an action that is started but never finished (confirm on destructive or session-wide actions); a failing request that still reports success; a security guard that is the only stop (e.g., an app check because the DB client skips RLS), listed even if the code is correct today; and settings that live only in config (triggers, schedules, concurrency, lint globs, auth mount paths), where a blank value breaks production unnoticed.
  - **If** a behaviour-to-test registry exists → start from it and add to it, and do not rebuild it. Coverage reports show untested code, but cannot produce this list. **Done when:** `Gaps` holds the ranked gaps, the tiers and the per-tier counts.
- [ ] **Step 4 — Database Rules:** App guard tests cannot catch a policy regression in a migration. **If** the database has row-level policies (e.g., Postgres RLS, Firestore rules), storage buckets, definer-rights functions or data-changing migrations → for each row-policy table, bucket and definer-rights function, check for a DB test (e.g., pgTAP), or a DB-backed integration test, that asserts allow and deny per role and operation (select, insert, update, delete). Record the gaps in the matrix. **If** a migration transforms rows, not only the schema → check for a replay test on seeded rows that asserts the invariants: row counts, no orphaned foreign keys, and no nulls in a new `NOT NULL` column. **Done when:** `Database Rules` holds the matrix, or the step is skipped with evidence.
- [ ] **Step 5 — Contracts:** **If** there are external services or older clients in the field → check that fixtures are typed to the provider SDK and the pinned API version, age each payload against its version, and check that a webhook with a bad or expired signature is tested and rejected. A contract or snapshot pins the API and validator shapes the oldest supported client needs. Without one, a breaking server change ships green. **Done when:** `Contracts` has its rows, or the step is skipped with evidence.
- [ ] **Step 6 — Mutation:** Run the mutation tool on every package, one small change at a time (flip a comparison, delete a line, blank a string). Setup and traps are in the project docs. During in-place mutation, nothing else builds, lints, tests or commits the package under mutation, and the tree must be clean afterwards. **If** it is not → **STOP** and restore. Give every unnoticed change exactly one verdict:
  - **Bug in the code:** the change exposed real wrong behaviour. Route it as an app bug.
  - **Real gap:** a test exists, but does not check this. Name the missing assertion.
  - **No test at all:** no unit test runs this code. Send the tier that should own it to Step 3.
  - **Caught elsewhere:** an integration, live or E2E test would catch it. Name the test. "Probably the E2E" is not a verdict.
  - **Equivalent:** there is no observable difference. Report the tool's disable comment to add, so the next run does not judge it again. Adding it is the next step.
  - **Not worth a test:** log text, error messages.
  - **Tool misreport:** re-check it by hand.
  - **Other:** say why. **If** the same `Other` comes up on 2 runs → propose a verdict for it in `Process Improvements`.

  Do not trust the tool's numbers until they are checked. A runner with zero tests per mutant reports every mutant in the suite as survived. A test file that crashes on load counts as survived, not caught. Integration-named tests that mock everything can sit outside both the unit and mutation runs. Tests that read source as text do not see the mutation. Re-check every zero-tests survivor by hand. For code the tool cannot reach (browser specs, device flows, lint guard tests), break it by hand, run the test, watch it go red, and restore. Record two scores, total and covered (covered excludes mutants no test runs), by package and by the product risk area from Step 3. A total dominated by **No test at all** hides weak existing tests. List the pure functions where boundary mutants survive (comparisons, dates, timezones, permission checks, validators), and recommend one property-based test for each. Record the cost: wall-clock, CPU-seconds, peak memory and triage agents. Whether a CI check is viable goes to `bkit-audit-gates`, based on those numbers. Run in incremental mode, keeping the previous incremental file, and do a full run (e.g., Stryker `--force`) every few runs and after a dependency, config or snapshot change. Record the mode. **Done when:** `Scores` holds both scores, the verdicts, the property candidates, the cost and the mode, or the step is skipped with evidence.

- [ ] **Step 7 — Shapes:** Search every package for tests that cannot fail. Each of these shapes has been green while checking nothing:
  - A wait that does not wait: a visibility check with an ignored timeout (e.g., `isVisible({ timeout })`), or a response wait nobody reads.
  - An assertion that matches anything: a bare regex in an object matcher (e.g., Vitest `toMatchObject`), or two constants compared instead of calling the code.
  - A mock that hides the thing under test: a hand-written mock of a shared module, or a fixture shape production never produces.
  - A test of a copy, not the code: a hand-written copy of a guard, or two apps with the same code compared with each other.
  - Setup that skips the code: a fake DB that is always empty, so the branch under test never runs.
  - A test that locks in a bug: it asserts wrong behaviour that no decision wanted.
  - A positive control that cannot fail: it asserts absence using a selector or text that never existed.
  - An absence guard that outlived its writer: it asserts that a file, path or name is not written, shipped or listed, yet no source writes, copies or templates it any more (a retired or deprecated name), and no migration or cleanup removes it. Search the sources for each named path. Also flag absence samples (headings, strings) that appear nowhere, because the guard then passes whatever leaks. Keep secret and credential guards, and removal checks for a migration that still runs.
  - A guard tested in a different setup from runtime (cwd, config, env).
  - A string scan cut short: a comment stripper that cuts at a marker also cuts a marker inside strings.
  - The wrong surface: a write goes to one place, and the assertion reads another. For every write, the assertion must read the surface the write meant to change. Derived copies go to `bkit-audit-database`.
  - A status-only assertion: it checks the response code only, on an operation that reports success when it failed. Assert what was stored.
  - Two clients mocked as one: user-scoped and admin clients differ, and one shared mock cannot see a write through the wrong one. Mocks must keep dependencies that differ at runtime different.
  - "Did not throw" as the only check on a boundary (webhook, external API, DB write). Not throwing != the work happened. Step 6 usually confirms it.

  **If** you find a new shape → propose it under `Process Improvements`, and do not edit this list during the run. **Done when:** `Shapes` holds every hit, or says `none`.

- [ ] **Step 8 — Guards:** A shape that tools can catch belongs in a lint rule or a setup file, not in a per-run search. Confirm the rules are enabled for test files, and record the violation count for each test-stack lint rule that catches a shape (e.g., JS: `vitest/expect-expect`, `vitest/valid-expect`, `vitest/no-conditional-in-test`, `vitest/no-conditional-expect`, `playwright/missing-playwright-await`, `playwright/no-wait-for-timeout`, `playwright/prefer-web-first-assertions`, `playwright/no-networkidle`, `playwright/no-force-option`, `@typescript-eslint/no-floating-promises` (Oxlint: `typescript/no-floating-promises` with `--type-aware`); Python: `flake8-pytest-style`). **If** there is no test-stack linter → text search for the shapes, and say so. **If** a rule would catch a Step 7 shape and is off → record a finding, with `bkit-audit-gates` as its destination. Confirm that the network mock fails a test on an unhandled request (e.g., MSW `onUnhandledRequest: 'error'`). Otherwise an unmocked call reaches the real service or hangs. Check that fixtures and factories are typed to the generated DB types and schema validators, where the project has them. Grep the tests for type-check escapes (e.g., TS `as any`, `as unknown as`; Python `cast(Any, ...)`, `# type: ignore`), because they let a fixture drift to a shape production never produces. **If** the language is untyped → `N/A`. Count the snapshot assertions and their size. List the snapshot files (e.g., `.snap`) changed in the same commit as the code they cover since the previous report's commit. A large snapshot, or a wholesale `-u` update, behaves like an assertion that matches anything. **Done when:** `Guards` holds the counts and hits.
- [ ] **Step 9 — Runs:** Check that every test file has a lane. Find names that put a file outside every run (see Step 6). Find suites that skip when setup fails, instead of failing. Find skips (e.g., `test.skip`, `fixme`, `describe.skip`, `pytest.mark.skip`) and env-dependent skips. Take skip counts per file from the CI runner log too (e.g., job log `N skipped` lines), not only from local runs, because a tool missing on the runner skips only there. **If** the runner prints totals only → use a per-file reporter (e.g., verbose, JUnit). **If** there is no CI, **or** the log has expired → mark the CI half `Not Checked`. Find stale build output the runner now collects (e.g., Vitest 4 and later does not ignore `dist/` by default). List the 20 slowest tests per tier from the runner reports. A slow test is the next one someone skips. **Done when:** `Runs` has its rows.
- [ ] **Step 10 — Time:** **If** there is date, calendar or timezone logic → run the unit tests with `TZ` set to a non-UTC zone that observes DST (e.g., `Pacific/Auckland`, `America/St_Johns`), on the process before workers spawn. Then run the date-touching suites with the clock pinned near a month end and a DST change (e.g., `vi.setSystemTime`, Playwright `page.clock`), and remove the throwaway setup afterwards. A clock pin covers in-process time only. Suites that spawn subprocesses (e.g., `git`, `node`) need the child clock set too (e.g., `GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`, a faketime wrapper). **If** the child clock cannot be set → mark the subprocess half `Not Checked`, and still record the in-process result. Record the tests whose result changes. List the suites that never pin the clock. **Done when:** `Time` holds the results, or the step is skipped with evidence.
- [ ] **Step 11 — Copies:** Find the same test procedure in several places (open a dialog, create a user, read credentials). List the copies that disagree first. Copies that agree need a single owner only if they are likely to drift. Once one owner is created, the next step adds a guard that fails on a new copy. A code graph finds copied functions, and copied statement sequences need a syntax-tree scan. Product-code duplication goes to `bkit-audit-duplication`. **Done when:** `Copies` holds the groups, or says `none`.
- [ ] **Step 12 — Route:** Give no finding without evidence someone can check again: `file:line`, or a query, run id or measurement, plus the tool. An empty language-server result is inconclusive, so corroborate it with text search. The report names where each finding goes. Sending it is the next step, and the audit agent writes the `docs/failures.jsonl` rows. An app bug → a `docs/failures.jsonl` row and an issue, marked as security when it is one. A small missing test → the test to write. A large missing test → a follow-up issue. A cannot-fail test → the fix, a positive control (break the code, watch it go red, restore) and a `docs/failures.jsonl` row. A behaviour with no recorded intent → a question for the maintainer, and do not guess from the code. A tier too high → the lower-tier test to write, and the higher-tier test stays until the new one has been seen red. An equivalent mutant → the disable comment to add. A timezone or date result → an app bug if the app is wrong, otherwise a test fix and a `docs/failures.jsonl` row. A flaky test → `bkit-audit-flakes`. Moving the coverage floor → `bkit-audit-coverage`. A check as a CI gate → `bkit-audit-gates`. Dead code → `bkit-audit-dead-code`. **Done when:** every finding's Expected names its destination.
- [ ] **Step 13 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per OWASP API Security Top 10 item and ASVS chapter (the attack rows from Step 3), and one per test smell in the catalogue (the shapes from Step 7), each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. Do not change the steps during the run. **Done when:** no row is empty.
- [ ] **Step 14 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches the suite: test files and helpers, fixtures and factories, unit, browser and device runner config, CI test lanes, and the routes, workers, migrations and external services the tests cover. (b) In a bounded pass of about 30 minutes, note what a senior test engineer would flag outside the steps. Read what happened since the previous run (incidents, `bkit-audit-logs`, new `docs/failures.jsonl` rows, vendor status), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Tree clean:** every mutation is restored.
- [ ] **Clock setup removed:** the throwaway clock setup is removed.
- [ ] **No test weakened:** no test was weakened, skipped or deleted.
- [ ] **Scores:** `Scores` records the total and covered scores, or mutation is explicitly skipped with evidence.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | An untested or cannot-fail guard on cross-tenant access, money, or a workflow with no workaround. The lane that should run that guard does not |
| `HIGH` | Core behaviour with no test, or with a test that cannot go red. A security guard with no test. An untyped external contract, or untested signature rejection. A timezone-dependent result hiding a real bug |
| `MEDIUM` | A tier too low or too high. A missing failure path. A lint rule turned off that would catch a cannot-fail shape. Duplicated procedures that disagree. A snapshot that matches anything. A suite that skips itself |
| `LOW` | An equivalent mutant without a disable comment. A cosmetic screen without a visual assertion. Duplicates that agree |

Within a severity, list security and data findings first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` names the single most important finding, and gives the count per severity and both mutation scores per package (or the skip).
- [ ] **Series:** the report shows test count and runtime per tier, and both scores, beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
