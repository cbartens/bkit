<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Flake Triage

> [!CAUTION]
> **Purpose:** Diagnosis of tests that pass only on retry, or fail on one surface and pass on another, and the change that would remove each one.
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
> - NEVER `.skip`, quarantine, delete an assertion, or widen a timeout to green a lane. A timeout named before the trace is read is not a verdict.
> - Repro and repeat runs use the suite's test tenant only; NEVER production tenants, payments, or mail.

## Universal Instructions

### Context & Goals

A ledger row can record that a flake exists. The useful part is the mechanism, and it is never one line. The standing danger is reading a flake as a timing problem and widening a timeout: the reported error is usually the consequence, and a timeout bump applied before the trace is read turns a real bug into a slow green. Target failure: **a skip, quarantine, or wider timeout standing in for a named mechanism.**

**Applies when:** a test suite that runs more than once (CI or a local repeat). None → one `N/A` row with evidence, never "clean".

**Cadence:** every two weeks, over every workflow's runs since the previous report, on the same window as `bkit-audit-logs` (both read the same CI runs). Do not quarantine; a flake stays until it is fixed, so age is measured, not remembered. Extra pass, scoped to the one flake or red run: when a test passes only on retry, or fails on one surface and passes on another, on the integration branch; after a change to retries, workers, timeouts, trace settings, or shared fixtures; after a fix lands, to repeat the rate measurement for the run count `Fix` named.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Flake root-cause taxonomy (Luo et al., "An Empirical Analysis of Flaky Tests", FSE 2014).
- Google, "Flaky Tests at Google and How We Mitigate Them" (Google Testing Blog, 2016).
- Order-dependence and root-cause location (e.g. iDFlakies, Lam et al., ICST 2019; Ziftci and Cavalcanti, "De-Flake Your Tests", ICSME 2020).
- Browser-runner retries, flaky status, repeat-each, fail-on-flaky (e.g. Playwright); record the version.
- Unit-runner shuffle, seed, and retry (e.g. Vitest `sequence.shuffle` / `sequence.seed` / `retry`, pytest-randomly); record the version.

### Scope

- Every runner-reported flake, and every test that failed on one run or surface and passed on another, since the previous report.
- Measured failure rate, the log through the first runner line, and the trace.
- CI vs local, and vendor incidents, before blaming the test. Sharing set of a fixture from the tooling, not from memory.
- Timezone and date. Order dependence. Device flakes: boot, retries, animation, where artifacts live.
- One mechanism, one root-cause class, one verdict, and the change that would remove it.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Whether the right behaviours are tested | Testing sweep | `bkit-audit-testing` |
| Log content beyond the flake's run | Log triage | `bkit-audit-logs` |
| CI annotation quality | Annotations sweep | `bkit-audit-annotations` |
| Vendor-incident catalogue | Dependencies sweep | `bkit-audit-dependencies` |
| Quarantine, skip, or a widened timeout | Never an outcome | — |
| Applying the named fix | Audit reports only | Plan from this report |

### Verdicts

One per flake. The root-cause class (`Mechanism`) is the evidence; these are the outcomes. Quarantine, `.skip`, and a widened timeout are never outcomes.

- **FIX NAMED** — the mechanism is named, and the report names the change that would remove it, with the runs that will prove it (`Fix`).
- **BUG** — a real defect behind the flake. It is a bug, not a flake: its own issue plus a `docs/failures.jsonl` row.
- **INFRASTRUCTURE** — a host, preview, database, or other vendor incident explains it. Not charged to the test.
- **PARKED** — the fix waits on a decision. The report names the decision.
- **FIXED** — a fix landed since the previous report, and the repeated rate measurement ran the count `Fix` named, with no failure.
- **NOT ESTABLISHED** — no mechanism fits yet. Say what is not established and what would establish it. Stays open.
- **OTHER** — fits none; say why. Same `OTHER` on 2 runs → propose a new verdict in `Process Improvements`.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **CI History:** Steps 2, 3 — workflow runs since the previous report, e.g. `gh run list`, Actions API, GitLab pipelines. Fallback: local repeats only; the ranked CI list `Not Checked`.
- [ ] **Repeat Runner:** Steps 4, 7, 8 — repeat with retries off, e.g. Playwright `--repeat-each`, pytest-repeat. Fallback: rate `Not Checked`; do not mark `FIX NAMED` on an unmeasured flake unless the mechanism is deterministic and the report says the rate is unknown.
- [ ] **Web:** Steps 6, 13 — vendor status pages and anchor standards. Fallback: incidents and versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Traces:** Browser E2E → Step 5 — trace, video, and screenshot of the failed attempt, e.g. Playwright trace, Cypress. Fallback: log only; geometry claims `Not Checked`.
- [ ] **Language Server:** Typed language → Steps 6, 11 — which specs share a fixture, e.g. Serena, `tsserver`. Fallback: text search; name it. Guessing the sharing set is how a diagnosis lands on the wrong spec.
- [ ] **Vendor Status:** Failure time may overlap a vendor window → Step 6 — e.g. GitHub status, hosting preview, database host. Fallback: `INFRASTRUCTURE` `Not Checked`.
- [ ] **Device Runner:** Native flake → Step 9 — e.g. Maestro, EAS, XCUITest. Fallback: native flakes `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — List:** Before picking what to triage, list every test with runner status flaky (failed, then passed on retry) and every test that passed only on retry, across every workflow's runs since the previous report. Also list a test that failed on one run or surface and passed on another: with retries off, status `flaky` never appears, and a red run someone happened to see is one input, not the list. Rank by flake rate (flaky or failed runs ÷ runs) and by the reruns they caused. Per open flake: first-seen, last-seen, age. Report the median age of open flakes. A noticed red run absent from the list is a finding about detection. Triage in that rank order. **Done when:** ranked list, ages, and median in `Flakes`.
- [ ] **Step 3 — Pin:** Per triaged flake: run id, commit, and which job actually failed as opposed to which were downstream of it. Then a control run, and what it is valid for. A previous red run is a control only for the lanes whose failure mode differs — a run that failed auth and redirected every lane to sign-in is a control for the lane that mints its own tenant, and nothing else. **Done when:** run, job, and control in `Pin`.
- [ ] **Step 4 — Rate:** Run the spec with repeat-each and retries off, at CI's worker count: k failures in N runs. Run it again with the CPU throttled or loaded. Record N, k, the worker count, and the commit. Without a measured rate there is nothing to compare a fix against (Step 11). **Done when:** N, k, workers, and commit in `Rate`, or why not measured.
- [ ] **Step 5 — Log:** The reported error is usually the consequence. Read up to the first line the runner emitted. A closed-target or crashed-browser message is downstream of a test timeout. An unmatched locator can be a passing assertion, not a failing one. A row-level denial can surface as silent zero rows, indistinguishable from a mock returning empty. Then open the trace. Geometry (which cell, at what y, inside or outside the viewport) comes from the trace or a local repro at the same viewport size — never from reasoning about the layout. A negative bounding box, or a pointer dragged out of the viewport, is that shape. Recognise, do not stop at: an assertion left at the runner default beside an explicit longer timeout; a retrying helper that burns most of the test timeout before the body starts. Check the capture settings this step depends on. Every CI browser project needs a trace, and ideally video and a screenshot, of the failed first attempt. `retain-on-first-failure` and `retain-on-failure-and-retries` keep it; `on-first-retry` records only the retry, which for a flake is usually the attempt that passed. Check the device-runner equivalents. A missing setting is a finding. From the trace or a HAR, list the third-party requests the spec makes (analytics, fonts, maps). Recommend a route stub for any that holds up load or a response the test waits on. **Done when:** first runner line, trace notes, capture settings, and third-party requests in `Log`.
- [ ] **Step 6 — Surfaces:** CI and local are different applications: a production build on a preview, versus a dev server that reuses an existing process. A failure on one and not the other is evidence about hydration timing, build output, or a stale dev server before it is evidence about the test. Record the `TZ` of CI and of local. Then rule out infrastructure. Compare the failure time with the host's status history, the preview's deploy and cold-start timing, and database and other vendor status. A flake the infrastructure explains gets class `infrastructure` in Step 10, verdict `INFRASTRUCTURE`, and is not charged to the test. The same split applies inside CI. A worker-scoped fixture shared by many specs: a spec that mutates that tenant can fail whichever spec runs next. Get the sharing set from the language server, not from memory: which specs reference the fixture or helper; where a moved helper lives now; type errors for one spec without a full typecheck. Pace the queries — back-to-back reference queries collapse to partial results, so re-run any surprisingly small set before trusting it. No language server sees a mock-factory key. Fixture wiring in non-typed surfaces (runner project dependencies, CI YAML, package scripts) is text search. Reference counts from before tests joined the project graph are stale. **Done when:** surface split, infra check, and sharing set in `Surfaces`.
- [ ] **Step 7 — Time:** Date-touching flake → re-run in a local repro with the clock pinned (e.g. Playwright `page.clock.setFixedTime`, `vi.setSystemTime`): at the date it failed, at a month end, and at a daylight-saving change. Run with `TZ` matching local, then matching CI. Set `TZ` before workers spawn. **Done when:** results in `Time`, or skip with evidence the flake does not touch dates.
- [ ] **Step 8 — Order:** Unit runner → shuffle with a recorded seed (e.g. Vitest `--sequence.shuffle --sequence.seed=<n>`). Browser runner → a different worker or shard count. Record the seed and the counts. This tests a cross-spec contamination hypothesis, such as the shared fixture in Step 6, by running it rather than only by reading the reference graph. **Done when:** seed, counts, and result in `Order`.
- [ ] **Step 9 — Native:** Device-runner flake (e.g. Maestro, EAS) → Steps 5 and 6 are written for a browser runner. Also check whether the device or emulator had finished booting before the flow started, what retries the device-cloud logs record, and whether the flow depends on animation or keyboard timing. Record where the run's artifacts (screenshots, recordings, logs) live, so the next diagnosis finds them. **Done when:** answers in `Native`, or skip with evidence.
- [ ] **Step 10 — Mechanism:** Teardown deletes the rows an event points at, so most diagnoses are corroborated by mechanism rather than by the row. Write that out. "This fits" and "this is proven" are different claims; the next reader has to be able to tell which one they are holding. One root-cause class: async wait, concurrency, order dependency, shared fixture state, resource leak, network, or external service, time, and date, randomness, unordered collection, infrastructure, or other (describe it). In Luo et al., async wait, concurrency, and order dependency were about 78% of classified flakes. Per-class counts across open flakes are the series. Before naming a timing mechanism, run the floating-promise and missing-await rules on the spec and its helpers (e.g. `@typescript-eslint/no-floating-promises`, `playwright/missing-playwright-await`) and record hits, so a missing `await` does not sit behind a timing diagnosis. A real defect behind a flake is a bug, not a flake: verdict `BUG`. **Done when:** class, what is not established, and await hits in `Mechanism`.
- [ ] **Step 11 — Fix:** Name the cause and the change that would remove it. Making that change is the next step. Never `.skip`, quarantine, delete an assertion, or widen a timeout. Before trusting the repaired test, the next step puts the bug back, watches the test go red, restores, and confirms `git diff` on the source file is empty. That is not optional on anything touching row-level security or a cross-tenant boundary. A change to a shared helper or fixture is a signature change: references first. Fixing one spec by editing a fixture many specs share is how the next unattributable failure gets created. Putting the bug back proves a deterministic fix. For a flaky one, the next step also repeats Step 4 after the fix: at a measured failure rate p, about 3/p runs with no failure give 95% confidence the rate is now below p (the rule of three). The report states that run count. One verdict from `Verdicts`. **Done when:** verdict, change, or why none, and the run count in `Fix`.
- [ ] **Step 12 — Route:** No finding without evidence a reader can re-check: `file:line`, or the query, run id, or measurement, plus the tool. Language-server empty is inconclusive → corroborate with text search. The report names where each finding goes. Sending it is the next step. Every flake gets a `docs/failures.jsonl` row, whatever its verdict, with its class, measured rate, and age. A flake with a named mechanism → the recommended fix and the runs that will prove it (Step 11). A real defect → its own issue, plus the ledger row. A fix waiting on a decision → the decision the report names. A mechanism an error tracker also saw → `bkit-audit-logs`. A retry-pass or warning that CI annotated → `bkit-audit-annotations`. A missing trace or capture setting, a third-party request to stub, or a missing `await` → the recommended change (Steps 5 and 10). **Done when:** every finding's Expected names a destination, including the ledger row to append.
- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per Luo et al. root-cause class, and per runner flake-handling feature (retries, flaky status, repeat-each, fail-on-flaky, sequence shuffle) → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. Do not change the steps during the run. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything changed since previous report's commit that touches test stability (browser and unit runner config: retries, workers, timeouts, trace; shared fixtures and helpers; CI workflows and runners; the preview and database setup the E2E lanes use; device flows) → one-line verdict each. (b) Bounded ~30 min pass: what a senior test-infrastructure engineer flags that no step asks; read what happened since previous run (incidents, `bkit-audit-logs` reports, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Verdicts:** every triaged flake has one verdict from `Verdicts`; none is skip, quarantine, or a widened timeout.
- [ ] **Rates:** every triaged flake records N and k, or why the rate was not measured.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Flake masks cross-tenant write, data loss, or a broken workflow with no workaround |
| `HIGH` | Real defect behind the flake; the only path is blocked and the workaround is a rerun |
| `MEDIUM` | Named intermittent failure; missing trace of the failed attempt; shared fixture that can attribute a failure to the next spec; repeated rerun cost |
| `LOW` | Vendor incident not charged to the test; speculative timing with no measured rate |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: real defects first.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and per verdict, and the median age of open flakes.
- [ ] **Series:** each open flake's rate and the median age beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
