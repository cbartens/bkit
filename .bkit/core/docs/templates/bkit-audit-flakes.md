<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Flake Triage

> [!CAUTION]
> **Purpose:** A diagnosis of the tests that pass only on retry, or fail on one surface and pass on another, and the change that would remove each one.
>
> **Rules:**
>
> - Never `.skip` a test, quarantine it, delete an assertion, or widen a timeout to green a lane.
> - A timeout named before the trace is read is not a verdict.
> - Run repros and repeat runs against the suite's test tenant only.
> - NEVER touch production tenants, payments or mail.

## Universal Instructions

### Context & Goals

A ledger row can record that a flake exists, but the useful part is the mechanism, and that never fits in one line. The standing danger is reading a flake as timing and widening the timeout. The reported error is usually a consequence, and a timeout bump made before the trace is read turns a real bug into a slow green. On shared dev machines, a load-scaled time budget sampled once at config or worker load goes stale mid-run, because a load ramp starves the later files. Re-read it per test file (vitest `vi.setConfig` in a setup file, jest `jest.setTimeout` in setup), with the same base and cap, and the factor pinned to 1 on CI. That freshness fix is a mechanism fix, not a widen. The failure this audit targets is a skip, a quarantine or a wider timeout standing in for a named mechanism.

**Applies when:** the suite runs more than once, in CI or as a local repeat. **If** it does not → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once every two weeks, over every workflow's runs since the previous report. Use the same window as `bkit-audit-logs`, because both read the same CI runs. A flake is not quarantined, so it stays until it is fixed, and its age is measured, not remembered. Run an extra pass, for one flake or red run, when a test on the integration branch passes only on retry or fails on one surface and passes on another; after a change to retries, workers, timeouts, trace or a shared fixture; and after a fix lands, to measure the repeat rate for the run count `Fix` named.

**Anchor Standards:**

- Flake root-cause taxonomy (Luo et al., "An Empirical Analysis of Flaky Tests", FSE 2014).
- Google, "Flaky Tests at Google and How We Mitigate Them" (Google Testing Blog, 2016).
- Order-dependence and root-cause location (e.g., iDFlakies, Lam et al., ICST 2019; Ziftci and Cavalcanti, "De-Flake Your Tests", ICSME 2020).
- Browser-runner retries, flaky status, repeat-each, fail-on-flaky (e.g., Playwright); record the version.
- Unit-runner shuffle, seed, and retry (e.g., Vitest `sequence.shuffle` / `sequence.seed` / `retry`, pytest-randomly); record the version.
- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Which resources may each lane touch?; § E2E on PRs: run the full suite, watch which DB it hits; § Concurrent invocations collide on disk, not just in the database

### Scope

- Take every runner-reported flake since the previous report, and every test that failed on one run or surface and passed on another.
- Measure the failure rate, read the log up to the first runner line, and read the trace.
- Compare CI with local, and check vendor incidents, before blaming the test.
- Take the fixture-sharing set from tooling, not from memory.
- Check timezone and date, and order dependence.
- Check device flakes: boot, retries, animation and artifact locations.
- Give each flake one mechanism, one root-cause class, one verdict, and the change that would remove it.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether the right behaviours are tested | The testing sweep covers it | `bkit-audit-testing` |
| Log content beyond the flake's run | The log triage covers it | `bkit-audit-logs` |
| CI annotation quality | The annotations sweep covers it | `bkit-audit-annotations` |
| Vendor-incident catalogue | The dependencies sweep covers it | `bkit-audit-dependencies` |
| Quarantine, skip, or a widened timeout | It is never an outcome | — |
| Applying the named fix | The audit only reports | A plan made from this report |

### Verdicts

Give each flake one verdict. The root-cause class (`Mechanism`) is the evidence, and the verdicts below are the outcomes. A quarantine, a `.skip` or a widened timeout is never an outcome.

- **FIX NAMED:** the mechanism is named. The report names the change that would remove it, with the runs that prove it (`Fix`).
- **BUG:** a real defect is behind the flake. It gets its own issue and a `docs/failures.jsonl` row.
- **INFRASTRUCTURE:** a host, preview, database or vendor incident explains it. It is not charged to the test.
- **PARKED:** the fix waits on a decision, and the report names the decision.
- **FIXED:** a fix landed since the previous report, and the repeated rate measurement ran the count `Fix` named with no failure.
- **not ESTABLISHED:** no mechanism fits. Say what is not established and what would establish it. The flake stays open.
- **OTHER:** it fits no other verdict. Say why. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **CI History:** Steps 2, 3 — workflow runs since the previous report (e.g., `gh run list`, the Actions API, GitLab pipelines). Log access: the `context-fetch` blocks below `bkit:end` in `.agents/context.md` are ready-made read-only readers. `bkit context list-blocks` prints each block's `context` and `body`. Set a body's `# Customise:` knobs to the audit window, and run it with `direnv exec . bash`. Fallback: local repeats only, and mark the ranked CI list `Not Checked`.
- [ ] **Repeat Runner:** Steps 4, 7, 8 — repeat runs with retries off (e.g., Playwright `--repeat-each`, pytest-repeat). Fallback: mark the rate `Not Checked`. Do not mark an unmeasured flake `FIX NAMED` unless its mechanism is deterministic and the report says the rate is unknown.
- [ ] **Web:** Steps 6, 13 — vendor status pages and the anchor standards. Fallback: record the versions as unread, and the incidents as well.

#### Conditional

- [ ] **Traces:** **If** the suite has browser E2E → Step 5 — the trace, video and screenshot of the failed attempt (e.g., Playwright trace, Cypress). Fallback: the log only, and mark geometry claims `Not Checked`.
- [ ] **Language Server:** **If** the language is typed → Steps 6, 11 — which specs share a fixture (e.g., Serena, `tsserver`). Fallback: text search, and name it. Guessing the sharing set misattributes the diagnosis.
- [ ] **Vendor Status:** **If** the failure time may overlap a vendor window → Step 6 — e.g., GitHub status, the hosting preview, the database host. Fallback: mark `INFRASTRUCTURE` `Not Checked`.
- [ ] **Device Runner:** **If** a flake is native → Step 9 — e.g., Maestro, EAS, XCUITest. Fallback: mark native flakes `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — List:** Before triage, list every test with the runner status flaky (failed, then passed on retry) and every pass-only-on-retry, across every workflow since the previous report. Also list the tests that failed on one run or surface and passed on another. With retries off, `flaky` never appears, and a red run someone noticed is input, not the list. Rank by flake rate (flaky or failed runs ÷ runs) and by the reruns caused. For each open flake, record first seen, last seen and age, and report the median age of the open flakes. A red run that is absent from the list is a detection finding. Triage in rank order. **Done when:** `Flakes` holds the ranked list, the ages and the median.
- [ ] **Step 3 — Pin:** For each triaged flake, record the run id, the commit, and whether the job failed itself or only downstream. Record a control run and its valid scope. An earlier red run is a control only when its failure mode differs. For example, an auth failure that redirects every lane to sign-in is a control for the tenant-minting lane only. **Done when:** `Pin` holds the run, the job and the control.
- [ ] **Step 4 — Rate:** Run the spec with repeat-each, retries off, at the CI worker count, and record k failures in N runs. Repeat with the CPU throttled or loaded. Record N, k, the workers and the commit. Without a measured rate, there is nothing to compare a fix against (Step 11). **Done when:** `Rate` holds N, k, the workers and the commit, or why the rate was not measured.
- [ ] **Step 5 — Log:** The reported error is usually a consequence.
  - Read up to the first runner line. A closed target or a crashed browser is downstream of a test timeout. An unmatched locator can sit in a passing assertion. A row-level denial gives silent zero rows, which looks like an empty mock.
  - Open the trace, where the runner records one.
  - Take geometry (the cell, y, in or out of the viewport) from the trace, or from a local repro at the same viewport, never from layout reasoning. A negative bounding box, or a pointer dragged out of the viewport, is that shape.
  - Recognise these, and do not stop at them: an assertion at the runner default beside an explicit longer timeout, and a retrying helper that burns most of the test timeout before the body runs.
  - Check the capture settings. Every CI browser and device runner keeps the trace, or the nearest artefact (log, video, screenshot), of the failed first attempt, not only the retry. For example, Playwright `retain-on-first-failure` and `retain-on-failure-and-retries` keep it, while `on-first-retry` records the retry, which is usually the passing attempt for a flake. A missing setting is a finding.
  - From the trace or HAR, list the third-party requests (analytics, fonts, maps), and recommend a route stub for any that block load or response.

  **Done when:** `Log` holds the first runner line, the trace notes, the capture settings and the third-party requests.

- [ ] **Step 6 — Surfaces:** CI and local run different apps (e.g., a production build on a preview deploy, against a dev server reusing its process).
  - **If** a test fails on one **and** not the other → check hydration timing, build output and a stale dev server before blaming the test.
  - Record the CI and local `TZ`.
  - Rule out infrastructure: compare the failure time with host status, database and vendor status, and the preview deploy and cold start when the project uses them. A flake that infrastructure explains gets the class `infrastructure` in Step 10 and the verdict `INFRASTRUCTURE`, and is not charged to the test.
  - Make the same split inside CI. A worker-scoped fixture shared by many specs means a test that mutates the tenant fails whichever spec runs next.
  - Take the sharing set from the language server, not from memory: which specs reference the fixture or helper, where a helper moved to, and type errors without a full typecheck. Reference counts from before the tests joined the project graph are stale.
  - Pace the queries, because back-to-back reference queries give partial results; re-run surprisingly small sets.
  - The language server cannot see a mock-factory key. For fixture wiring that is not typed (runner deps, CI YAML, scripts), use text search.

  **Done when:** `Surfaces` holds the surface split, the infrastructure check and the sharing set.

- [ ] **Step 7 — Time:** **If** a flake touches dates → repro it locally with the clock pinned (e.g., Playwright `page.clock.setFixedTime`, `vi.setSystemTime`) at the failed date, at month end, and at a DST change. Run with the local `TZ`, then the CI one, and set `TZ` before the workers spawn. **Done when:** `Time` holds the results, or the skip with evidence that the flake does not touch dates.
- [ ] **Step 8 — Order:** **If** the runner is a unit runner → shuffle with a recorded seed (e.g., Vitest `--sequence.shuffle --sequence.seed=<n>`). **If** it is a browser runner → change the worker or shard count. Record the seed and the counts. This tests cross-spec contamination (e.g., the Step 6 shared fixture) by running, not only by the reference graph. **Done when:** `Order` holds the seed, the counts and the result.
- [ ] **Step 9 — Native:** **If** a flake is on a device runner (e.g., Maestro, EAS) → Steps 5-6 target the browser, so also check that boot finished before the flow started, device-cloud retries, and animation and keyboard timing. Record the artifact locations (screenshots, recordings, logs). **Done when:** `Native` holds the answers, or the skip with evidence.
- [ ] **Step 10 — Mechanism:** Teardown deletes the rows an event points at, so most diagnoses are corroborated by the mechanism, not by the row. Tell "fits" apart from "proven". Give one root-cause class: async wait, concurrency, order dependency, shared fixture state, resource leak, network, external service, time and date, randomness, unordered collection, infrastructure, or other (described). In Luo et al., async wait, concurrency and order dependency cover about 78% of classified flakes. Record the per-class counts across open flakes as a series. Before settling on a timing mechanism, run the floating-promise and missing-await rules on the spec and its helpers (e.g., `@typescript-eslint/no-floating-promises`, `playwright/missing-playwright-await`), and record the hits, so a missing `await` is not hidden behind timing. **If** a real defect is behind the flake → the verdict is `BUG`. **Done when:** `Mechanism` holds the class, what is not established, and the await hits.
- [ ] **Step 11 — Fix:** Name the cause and the change that removes it; making the change is the next step. Never `.skip`, quarantine, delete an assertion or widen a timeout. Before the repaired test is trusted, the next step puts the bug back, watches the test go red, restores the fix, and confirms `git diff` on the source file is empty. That is not optional for anything touching row-level access control or a cross-tenant boundary. A change to a shared helper or fixture is a signature change, so check references first. A one-spec fix made through a shared fixture causes the next unattributable failure. Putting the bug back proves a deterministic fix. A flaky fix also repeats Step 4: at rate p, about 3/p runs with no failure gives 95% confidence that the rate is below p (the rule of three), and the report states the count. Give one verdict from `Verdicts`. **Done when:** `Fix` holds the verdict, the change or why there is none, and the run count.
- [ ] **Step 12 — Route:** No finding goes in without evidence someone can check again: a `file:line`, or a query, run id or measurement with its tool. An empty language-server result is inconclusive, so corroborate it with text search. The report names the destinations. This run writes the `docs/failures.jsonl` rows. Sending to every other destination is the next step's job. Every flake gets a `docs/failures.jsonl` row with its class, rate and age. A named mechanism gets the recommended fix and the proof runs (Step 11). A real defect gets its own issue and a ledger row. A fix that waits on a decision gets the named decision. A mechanism the error tracker also saw goes to `bkit-audit-logs`. A retry-pass or warning that CI annotated goes to `bkit-audit-annotations`. A missing trace or capture setting, a third-party stub, or a missing `await` gets a recommended change (Steps 5, 10). **Done when:** every finding's Expected names its destination, including the ledger row.
- [ ] **Step 13 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. In `Standards Coverage`, give a row per Luo et al. class and per flake feature the runner offers (e.g., retries, flaky status, repeat-each, fail-on-flaky, sequence shuffle), marked checked (with the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. Do not change the steps during the run. **Done when:** no row is empty.
- [ ] **Step 14 — Anything Else:** (a) List everything since the previous report's commit that touches test stability (browser and unit config: retries, workers, timeouts and trace; shared fixtures and helpers; CI workflows and runners; the preview and DB for E2E; device flows), with a one-line verdict each. (b) In a bounded pass of about 30 minutes, note what a senior test-infrastructure engineer would flag that no step asks about. Read what happened since the previous run (incidents, `bkit-audit-logs`, new `docs/failures.jsonl` rows, vendor status), and note what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Verdicts:** every triaged flake has one verdict from `Verdicts`.
- [ ] **No masking:** no verdict is a skip, a quarantine or a widened timeout.
- [ ] **Rates:** every triaged flake records N and k, or why the rate was not measured.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A flake masks a cross-tenant write, data loss, or a broken workflow with no workaround. |
| `HIGH` | A real defect is behind the flake. The only path is blocked, and the workaround is a rerun. |
| `MEDIUM` | An intermittent failure is named. The trace of the failed attempt is missing. A shared fixture can attribute a failure to the next spec. Reruns cost time repeatedly. |
| `LOW` | A vendor incident is not charged to the test. A timing theory is speculative, with no measured rate. |

Within a severity, list real defects first.

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

### Flakes

PENDING

### Pin

PENDING

### Rate

PENDING

### Log

PENDING

### Surfaces

PENDING

### Time

PENDING

### Order

PENDING

### Native

PENDING

### Mechanism

PENDING

### Fix

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
- [ ] **Summary:** `Summary` gives the count per severity.
- [ ] **Verdict counts:** `Summary` gives the count per verdict.
- [ ] **Median age:** `Summary` gives the median age of open flakes.
- [ ] **Series:** the report shows each open flake's rate and the median age beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
- [ ] **Throwaways removed:** every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one `Suggested Issues` row.
- [ ] **Next Step:** every `Suggested Issues` row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
