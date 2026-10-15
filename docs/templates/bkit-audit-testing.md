<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.2 — do not edit; run `bkit upgrade` to refresh -->

# Testing Audit

> [!CAUTION]
> **Purpose:** Whether the suite tests what the product must do and must never do, whether those tests go red when the code breaks, and whether they run.
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
> - NEVER weaken, skip, delete, or quarantine a test to get green. A test that fails because it found a real bug is working.
> - Mutation and clock probes restore the tree before the report finishes: in-place edits reverted, throwaway setup removed, `git status` clean on touched paths. Restore fails → STOP, restore, record as finding.
> - Do not run suites that send mail, take payment, or write production tenants. Unit and local / throwaway targets only.

## Universal Instructions

### Context & Goals

Green suite = tests passed — not that they could fail, that every promise has a test, or that lanes run them. Coverage % misses both: line covered by a test that asserts nothing; % cannot show behaviour that should exist with no test. Target failure: **a test that stays green when the behaviour it names is broken, or a promise with no test at the tier that would notice.**

**Applies when:** test runner, test files, or CI test lane. None → one `N/A` row with evidence, never "clean".

**Cadence:** monthly — every product area and every package or app; record mutation cost per package. Package mutation tool cannot finish → `Not Checked` with that cost, never omitted. Extra pass when: test-toolchain major or config changes (mutation with force — incremental misses those); new route, worker, or external service; `bkit-audit-logs` or `bkit-audit-flakes` reports bug no test caught.

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
- Mutation: would tests go red. Known cannot-fail shapes. Lint and setup that should catch those shapes.
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

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

#### Core

Always verify.

- [ ] **Git:** Steps 1, 14 — `git rev-parse`, diff since previous report. Fallback: run marked baseline; ages and the what-changed pass `Not Checked`.
- [ ] **Test Runner:** Steps 3, 6, 9, 10 — execute or read reports, e.g. Vitest, Jest, pytest. Fallback: static read only; counts, mutation, clock runs `Not Checked`.
- [ ] **Web:** Step 13 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Mutation Tool:** Tool exists for the language → Step 6 — e.g. Stryker, mutmut. Fallback: hand-break code tests protect; scores `Not Checked`.
- [ ] **E2E Runner:** Browser or device E2E → Steps 3, 7, 9 — e.g. Playwright, Cypress, Maestro. Fallback: unit and integration only.
- [ ] **DB Tests:** Row-level policies, buckets, or data migrations → Step 4 — e.g. pgTAP, `supabase db test`, deployed-schema check. Fallback: read existing tests; live matrix = hypothesis.
- [ ] **Test Lint:** Test files linted → Step 8 — e.g. eslint-plugin-vitest, eslint-plugin-playwright. Fallback: text search for the shapes.
- [ ] **Language Server:** Typed language → Step 11 — references, e.g. Serena, `tsserver`. Fallback: text search; name it.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Scope:** Every product area for Steps 3–5 (behaviour usually crosses packages). Every package or app for Steps 6–11. Area shared with native client → every platform; one defect can have a different cause on each. **Done when:** every area, every package, platforms in `Scope`; tools and commands in `Checked`.
- [ ] **Step 3 — Behaviours:** Start from product should-do, not code — code finds untested code, not promises with no test or unguarded failures. Rows from:
  - Screens and routes (each action one row; finishing separate from opening).
  - Unattended work (workers, crons, inbound, webhooks, tool APIs).
  - Security rules (cross-tenant read/write, role above itself, signed-out access).
  - OWASP ASVS and API Security Top 10 items security doc may omit (cross-tenant object access, open redirect, SSRF via user-supplied URL, mass assignment, rate limiting, CSRF, webhook signature bypass) — tier each.
  - Decisions ledger (decision with no test undoable unnoticed).
  - Failures ledger (each fixed row needs test red if fix reverted).
  - Each external-service boundary → live test reaching real service.
  - Multiply every row: every platform (native never out of scope when native client exists); every role can/cannot; failure path (request fails, service down, invalid input, cancel halfway); data outliving request (deletes, retention, billing, storage writes).
  - Per row: tier = unit / integration / live / web E2E / device E2E / none vs project rubric. Tier below behaviour (mock for real external API) = gap. Tier above (only web/device E2E where unit/integration suffices) = finding — slowness and flake source. Record test count and runtime per tier per package (trophy vs pyramid). Per core screen: visual or accessibility snapshot on web, device screenshot on native; list screens with neither.
  - Rank gaps: another tenant's data, lost data, money first; broken core action; cosmetic.
  - Recurring shapes: action started never finished (confirm on destructive/session-wide); failing request still success; security guard only stop (e.g. app check because DB client skips RLS) — list even if code correct today; settings config-only (triggers, schedules, concurrency, lint globs, auth mount paths) — blank breaks production unnoticed.
  - Behaviour-to-test registry exists → start from it, add; do not rebuild. Coverage reports show untested code; cannot produce this list. **Done when:** ranked gaps, tiers, per-tier counts in `Gaps`.
- [ ] **Step 4 — Database Rules:** DB with row-level policies (e.g. Postgres RLS, Firestore rules), storage buckets, definer-rights functions, or data-changing migrations → app guard tests cannot catch policy regression in migration. Per row-policy table, bucket, definer-rights function: DB test (e.g. pgTAP) or DB-backed integration asserts allow/deny per role and operation (select, insert, update, delete). Record matrix gaps. Migration transforming rows, not only schema → replay test on seeded rows asserts invariants: row counts, no orphaned FKs, no nulls in new `NOT NULL` column. **Done when:** matrix in `Database Rules`, or skip with evidence.
- [ ] **Step 5 — Contracts:** External services or fielded older clients → fixtures typed to provider SDK and pinned API version; age each payload vs version; webhook bad/expired signature tested and rejected. Contract or snapshot pins API and validator shapes oldest supported client needs; else server breaking change ships green. **Done when:** rows in `Contracts`, or skip with evidence.
- [ ] **Step 6 — Mutation:** Run mutation tool on every package. One small change at a time (flip comparison, delete line, blank string). Setup and traps → project docs. In-place mutation → nothing else builds, lints, tests, or commits package under mutation; tree clean afterwards or STOP and restore. Give every unnoticed change exactly one verdict:
  - **Bug in the code** — change exposed real wrong behaviour. Route as app bug.
  - **Real gap** — test exists, does not check this. Name missing assertion.
  - **No test at all** — no unit test runs this code. Tier that should own it → Step 3.
  - **Caught elsewhere** — integration, live, or E2E would catch it. Name the test. "Probably the E2E" is not a verdict.
  - **Equivalent** — no observable difference. Report the tool's disable comment to add so the next run does not re-judge it. Adding it is the next step.
  - **Not worth a test** — log text, error messages.
  - **Tool misreport** — re-check by hand.
  - **Other** — say why. Same `Other` on 2 runs → propose verdict in `Process Improvements`.

  Do not trust tool numbers until checked. Runner with zero tests per mutant → every mutant in suite reported survived. Test file crashing on load → survived, not caught. Integration-named tests mocking everything can sit outside unit and mutation runs. Tests reading source as text cannot mutate. Re-check every zero-tests survivor by hand. Code tool cannot reach (browser specs, device flows, lint guard tests) → break by hand, run test, watch red, restore. Two scores: total and covered (excludes mutants no test runs), by package and product risk area from Step 3. Total dominated by **No test at all** hides weak existing tests. List pure functions where boundary mutants survive (comparisons, dates, timezones, permission checks, validators) → one property-based test to recommend each. Record cost: wall-clock, CPU-seconds, peak memory, triage agents. CI check viability → `bkit-audit-gates` from those numbers. Run incremental keeping previous incremental file; full run (e.g. Stryker `--force`) every few runs and after dependency, config, or snapshot change. Record mode. **Done when:** both scores, verdicts, property candidates, cost, mode in `Scores`, or skip with evidence.

- [ ] **Step 7 — Shapes:** Search every package for a test that cannot fail. Every one of these has been green while checking nothing:
  - Wait that does not wait. Visibility check with ignored timeout (e.g. `isVisible({ timeout })`); response wait nobody reads.
  - Assertion matching anything. Bare regex in object matcher (e.g. Vitest `toMatchObject`); two constants vs calling code.
  - Mock hiding thing under test. Hand-written mock of shared module, or fixture shape production never produces.
  - Test of copy, not code. Hand-written copy of guard, or two apps same code compared to each other.
  - Setup skipping code. Fake DB always empty — branch under test never runs.
  - Test locking in bug. Asserts wrong behaviour; no decision wanted it.
  - Positive control that cannot fail. Asserts absent using selector/text that never existed.
  - Guard tested in different setup from runtime (cwd, config, env).
  - String scan cut short. Comment stripper cutting at marker also cuts marker inside strings.
  - Wrong surface. Write one place, assertion reads another — for every write, assertion reads surface write meant to change. Derived copies → `bkit-audit-database`.
  - Status-only assertion. Response code only on operation that succeeds when failed. Assert what was stored.
  - Two clients mocked as one. User-scoped and admin clients differ; same mock cannot see write through wrong one. Mocks keep runtime-different deps different.
  - "Did not throw" only check on boundary (webhook, external API, DB write). Not throwing ≠ work happened. Step 6 usually confirms.

  New shape → propose under `Process Improvements`. Do not edit this list during run. **Done when:** every hit in `Shapes`, or `none`.

- [ ] **Step 8 — Guards:** Shape tools can catch → lint rule or setup file, not per-run search. Confirm enabled for test files; record violation count per test-stack lint rule catching each shape (e.g. JS: `vitest/expect-expect`, `vitest/valid-expect`, `vitest/no-conditional-in-test`, `playwright/missing-playwright-await`, `playwright/no-wait-for-timeout`, `playwright/prefer-web-first-assertions`, `playwright/no-networkidle`, `playwright/no-force-option`, `@typescript-eslint/no-floating-promises`; Python: `flake8-pytest-style`). No test-stack linter → text search for the shapes, say so. Rule would catch Step 7 shape and is off → finding, destination `bkit-audit-gates`. Confirm network mock fails test on unhandled request (e.g. MSW `onUnhandledRequest: 'error'`). Else unmocked call reaches real service or hangs. Fixtures/factories typed to generated DB types and schema validators, where the project has them. Grep tests for type-check escapes (e.g. TS `as any`, `as unknown as`; Python `cast(Any, ...)`, `# type: ignore`) — fixture drifts to shape production never produces; untyped language → `N/A`. Count snapshot assertions and size. List snapshot files (e.g. `.snap`) changed same commit as covered code since previous report commit. Large snapshot or wholesale `-u` update behaves like assertion matching anything. **Done when:** counts and hits in `Guards`.
- [ ] **Step 9 — Runs:** Every test file has a lane. Names putting file outside every run (see Step 6). Suites skipping when setup fails instead of failing. Skips (e.g. `test.skip`, `fixme`, `describe.skip`, `pytest.mark.skip`), env-dependent skips. Stale build output runner now collects (e.g. Vitest 4 and later does not ignore `dist/` by default). The 20 slowest tests per tier from runner reports. Slow test = next one someone skips. **Done when:** rows in `Runs`.
- [ ] **Step 10 — Time:** Date/calendar/timezone logic → unit tests with `TZ` non-UTC zone observing DST (e.g. `Pacific/Auckland`, `America/St_Johns`) on process before workers spawn. Then date-touching suites with clock pinned near month end and DST change (e.g. `vi.setSystemTime`, Playwright `page.clock`), throwaway setup removed after. Record tests whose result changes. List suites never pinning clock. **Done when:** results in `Time`, or skip with evidence.
- [ ] **Step 11 — Copies:** Same test procedure in several places (open dialog, create user, read credentials). Disagreeing copies first. Agreeing copies need single owner only if likely to drift. One owner created → next step adds guard failing on new copy. Code graph finds copied functions; copied statement sequences need syntax-tree scan. Product-code duplication → `bkit-audit-duplication`. **Done when:** groups in `Copies`, or `none`.
- [ ] **Step 12 — Route:** No finding without re-checkable evidence: `file:line`, or query, run id, measurement, plus tool. Language-server empty inconclusive → corroborate text search. Report names where each finding goes; sending is next step. App bug → `docs/failures.jsonl` row and issue; security bugs flagged for project security milestone. Missing test small → test to write. Missing test large → follow-up issue. Cannot-fail test → fix, positive control (break code, watch red, restore), `docs/failures.jsonl` row. Behaviour no recorded intent → question for maintainer; do not guess from code. Tier too high → lower-tier test to write; higher-tier stays until new one seen red. Equivalent mutant → disable comment to add. Timezone/date result → app bug if app wrong; else test fix and `docs/failures.jsonl` row. Flaky → `bkit-audit-flakes`. Coverage floor move → `bkit-audit-coverage`. Check as CI gate → `bkit-audit-gates`. Dead code → `bkit-audit-dead-code`. **Done when:** every finding's Expected names destination.
- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per OWASP API Security Top 10 item and ASVS chapter (attack rows Step 3), per test-smell in catalogue (shapes Step 7) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. Do not change steps during run. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything since previous report commit touching suite (test files/helpers, fixtures/factories, unit/browser/device runner config, CI test lanes, routes/workers/migrations/external services tests cover) → one-line verdict each. (b) Bounded ~30 min pass: senior test engineer flags outside steps; read since previous run (incidents, `bkit-audit-logs`, new `docs/failures.jsonl`, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names the single most important finding, count per severity, and both mutation scores per package (or the skip).
- [ ] **Series:** test count and runtime per tier, and both scores, beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
