<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.5.0 — do not edit; run `bkit upgrade` to refresh -->

# Flake Triage

> [!CAUTION]
> **Purpose:** Diagnosis of tests that pass only on retry, or fail on one surface and pass on another, and the change that would remove each one.
>
> **Rules:**
>
> - Read-only audit; never edit code, config, or data.
> - `Universal Instructions` apply to all projects; `Project Instructions` apply only to this project.
> - Local audit instructions / overrides → `Project Instructions` below the bkit-managed block; universal instructions stay in-block.
> - Any tools mentioned in `Universal Instructions` are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Every claim cites this run's evidence (`file:line`, or command / query and its output) and tool behind it; a previous report's figure, list, or status is a lead, not evidence.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - never `.skip`, quarantine, delete an assertion, or widen a timeout to green a lane. A timeout named before the trace is read is not a verdict.
> - Repro and repeat runs use the suite's test tenant only; NEVER production tenants, payments, or mail.

## Universal Instructions

### Context & Goals

- Ledger row can record a flake exists; useful part = mechanism (never one line).
- Standing danger: read flake as timing → widen timeout; reported error usually consequence; timeout bump before trace read turns real bug into slow green.
- Load-scaled budget on shared dev machines: sampled once at config / worker load → stale mid-run (a load ramp starves late files); re-read per test file (vitest `vi.setConfig` in a setup file, jest `jest.setTimeout` in setup), same base + cap, factor pinned 1 on CI. Freshness fix = mechanism fix, not a widen.
- Target failure: **a skip, quarantine, or wider timeout standing in for a named mechanism.**

**Applies when:** suite runs more than once (CI or local repeat). None → one `N/A` row with evidence, never "clean".

**Cadence:** biweekly; every workflow's runs since previous report; same window as `bkit-audit-logs` (both read same CI runs). Do not quarantine; flake stays until fixed → age measured, not remembered. Extra pass (one flake or red run): pass-only-on-retry or fail one surface/pass another on integration branch; after retries/workers/timeouts/trace/shared-fixture change; after fix lands → repeat rate measurement for run count `Fix` named.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Flake root-cause taxonomy (Luo et al., "An Empirical Analysis of Flaky Tests", FSE 2014).
- Google, "Flaky Tests at Google and How We Mitigate Them" (Google Testing Blog, 2016).
- Order-dependence and root-cause location (e.g. iDFlakies, Lam et al., ICST 2019; Ziftci and Cavalcanti, "De-Flake Your Tests", ICSME 2020).
- Browser-runner retries, flaky status, repeat-each, fail-on-flaky (e.g. Playwright); record the version.
- Unit-runner shuffle, seed, and retry (e.g. Vitest `sequence.shuffle` / `sequence.seed` / `retry`, pytest-randomly); record the version.
- bkit block of `docs/testing.md` (bkit version from `.bkit/version`): § Which resources may each lane touch?; § E2E on PRs: run the full suite, watch which DB it hits; § Concurrent invocations collide on disk, not just in the database

### Scope

- Every runner-reported flake, and every test failed one run/surface and passed another, since previous report.
- Measured failure rate, log through first runner line, and trace.
- CI vs local, vendor incidents, before blaming test. Fixture sharing set from tooling, not memory.
- Timezone and date. Order dependence. Device flakes: boot, retries, animation, artifact locations.
- One mechanism, one root-cause class, one verdict, and change that would remove it.

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

One per flake. Root-cause class (`Mechanism`) = evidence; these = outcomes. Quarantine, `.skip`, widened timeout never outcomes.

- **FIX NAMED** — mechanism named; report names change that would remove it, with runs that prove it (`Fix`).
- **BUG** — real defect behind flake; own issue + `docs/failures.jsonl` row.
- **INFRASTRUCTURE** — host, preview, database, or vendor incident explains it; not charged to test.
- **PARKED** — fix waits on decision; report names decision.
- **FIXED** — fix landed since previous report; repeated rate measurement ran count `Fix` named, no failure.
- **not ESTABLISHED** — no mechanism fits; say what is not established and what would establish it; stays open.
- **OTHER** — fits none; say why. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **CI History:** Steps 2, 3 — workflow runs since previous report, e.g. `gh run list`, Actions API, GitLab pipelines. Log access: `.agents/context.md` `context-fetch` blocks below `bkit:end` are ready-made read-only readers (`bkit context list-blocks` → each block's `context` and `body`); set a body's `# Customise:` knobs to the audit window; run it via `direnv exec . bash`. Fallback: local repeats only; ranked CI list `Not Checked`.
- [ ] **Repeat Runner:** Steps 4, 7, 8 — repeat with retries off, e.g. Playwright `--repeat-each`, pytest-repeat. Fallback: rate `Not Checked`; do not mark `FIX NAMED` on unmeasured flake unless mechanism deterministic and report says rate unknown.
- [ ] **Web:** Steps 6, 13 — vendor status pages and anchor standards. Fallback: incidents and versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Traces:** Browser E2E → Step 5 — trace, video, screenshot of failed attempt, e.g. Playwright trace, Cypress. Fallback: log only; geometry claims `Not Checked`.
- [ ] **Language Server:** Typed language → Steps 6, 11 — which specs share fixture, e.g. Serena, `tsserver`. Fallback: text search; name it. Guessing sharing set misattributes diagnosis.
- [ ] **Vendor Status:** Failure time may overlap vendor window → Step 6 — e.g. GitHub status, hosting preview, database host. Fallback: `INFRASTRUCTURE` `Not Checked`.
- [ ] **Device Runner:** Native flake → Step 9 — e.g. Maestro, EAS, XCUITest. Fallback: native flakes `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — List:** Before triage, list every test with runner status flaky (failed, passed on retry) and every pass-only-on-retry, across every workflow since previous report. Also list fail one run/surface, pass another: with retries off, `flaky` never appears; a noticed red run is input, not the list. Rank by flake rate (flaky or failed runs ÷ runs) and reruns caused. Per open flake: first-seen, last-seen, age. Report median age of open flakes. Red run absent from list → detection finding. Triage in rank order. **Done when:** ranked list, ages, median in `Flakes`.
- [ ] **Step 3 — Pin:** Per triaged flake: run id, commit, job that failed vs downstream-only. Control run and valid scope. Prior red run = control only when failure mode differs — auth failure redirecting every lane to sign-in is control for tenant-minting lane only. **Done when:** run, job, control in `Pin`.
- [ ] **Step 4 — Rate:** Spec with repeat-each, retries off, at CI worker count: k failures in N runs. Repeat with CPU throttled/loaded. Record N, k, workers, commit. Without measured rate, nothing to compare fix against (Step 11). **Done when:** N, k, workers, commit in `Rate`, or why not measured.
- [ ] **Step 5 — Log:** Reported error usually consequence. Read up to first runner line. Closed-target/crashed-browser → downstream of test timeout. Unmatched locator can be passing assertion. Row-level denial → silent zero rows, like empty mock. Open trace (where runner records one). Geometry (cell, y, in/out viewport) from trace or local repro at same viewport — never layout reasoning. Negative bounding box or pointer dragged out of viewport = that shape. Recognise, do not stop at: assertion at runner default beside explicit longer timeout; retrying helper burning most of test timeout before body. Check capture settings. Every CI browser / device runner keeps trace or nearest artefact (log, video, screenshot) of failed first attempt, not only the retry (e.g. Playwright `retain-on-first-failure` and `retain-on-failure-and-retries` keep it; `on-first-retry` records retry — usually passing attempt for flake). Missing setting = finding. From trace or HAR, list third-party requests (analytics, fonts, maps); recommend route stub for any blocking load/response. **Done when:** first runner line, trace notes, capture settings, third-party requests in `Log`.
- [ ] **Step 6 — Surfaces:** CI vs local = different apps (e.g. production build on preview deploy vs dev server reusing process). Fail one, not other → hydration timing, build output, stale dev server before test blame. Record CI and local `TZ`. Rule out infrastructure: failure time vs host status, preview deploy/cold-start (if used), database/vendor status. Infra-explained flake → class `infrastructure` in Step 10, verdict `INFRASTRUCTURE`, not charged to test. Same split inside CI. Worker-scoped fixture shared by many specs: mutating tenant fails whichever spec runs next. Sharing set from language server, not memory: which specs reference fixture/helper; moved helper location; type errors without full typecheck. Pace queries — back-to-back reference queries → partial results; re-run surprisingly small sets. No language server for mock-factory key. Non-typed fixture wiring (runner deps, CI YAML, scripts) → text search. Stale reference counts from before tests joined project graph. **Done when:** surface split, infra check, sharing set in `Surfaces`.
- [ ] **Step 7 — Time:** Date-touching flake → local repro with clock pinned (e.g. Playwright `page.clock.setFixedTime`, `vi.setSystemTime`): failed date, month end, DST change. `TZ` local then CI; set `TZ` before workers spawn. **Done when:** results in `Time`, or skip with evidence flake does not touch dates.
- [ ] **Step 8 — Order:** Unit runner → shuffle with recorded seed (e.g. Vitest `--sequence.shuffle --sequence.seed=<n>`). Browser runner → different worker/shard count. Record seed and counts. Tests cross-spec contamination (e.g. Step 6 shared fixture) by running, not only reference graph. **Done when:** seed, counts, result in `Order`.
- [ ] **Step 9 — Native:** Device-runner flake (e.g. Maestro, EAS) → Steps 5–6 target browser; also boot finished before flow, device-cloud retries, animation/keyboard timing. Record artifact locations (screenshots, recordings, logs). **Done when:** answers in `Native`, or skip with evidence.
- [ ] **Step 10 — Mechanism:** Teardown deletes rows event points at → most diagnoses corroborated by mechanism, not row. Distinguish "fits" vs "proven". One root-cause class: async wait, concurrency, order dependency, shared fixture state, resource leak, network, external service, time and date, randomness, unordered collection, infrastructure, or other (describe). Luo et al.: async wait, concurrency, order dependency ≈ 78% classified. Per-class counts across open flakes = series. Before timing mechanism → floating-promise/missing-await rules on spec/helpers (e.g. `@typescript-eslint/no-floating-promises`, `playwright/missing-playwright-await`); record hits so missing `await` is not hidden behind timing. Real defect behind flake → verdict `BUG`. **Done when:** class, what is not established, await hits in `Mechanism`.
- [ ] **Step 11 — Fix:** Name cause and change that removes it; making change = next step. Never `.skip`, quarantine, delete assertion, widen timeout. Before trusting the repaired test, the next step puts the bug back, watches the test go red, restores, and confirms `git diff` on the source file is empty. That is not optional on anything touching row-level access control or a cross-tenant boundary. Shared helper/fixture change = signature change: references first. One-spec fix via shared fixture → next unattributable failure. Put bug back proves deterministic fix. Flaky fix also repeats Step 4: at rate p, ~3/p runs with no failure → 95% confidence rate below p (rule of three); report states count. One verdict from `Verdicts`. **Done when:** verdict, change, or why none, run count in `Fix`.
- [ ] **Step 12 — Route:** No finding without re-checkable evidence: `file:line`, or query/run id/measurement + tool. Language-server empty inconclusive → text search corroboration. Report names destinations (sending = next step); the audit agent writes `docs/failures.jsonl` rows. Every flake → `docs/failures.jsonl` row (class, rate, age). Named mechanism → recommended fix + proof runs (Step 11). Real defect → own issue + ledger row. Fix waits on decision → named decision. Mechanism error tracker also saw → `bkit-audit-logs`. Retry-pass/warning CI annotated → `bkit-audit-annotations`. Missing trace/capture, third-party stub, missing `await` → recommended change (Steps 5, 10). **Done when:** every finding's Expected names destination, including ledger row.
- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: row per Luo et al. class + per flake feature the runner offers (e.g. retries, flaky status, repeat-each, fail-on-flaky, sequence shuffle) → checked (name step) / not applicable (why) / finding. Per bkit anchor (doc section, rule, or issue shape): one row → followed (name step or evidence) / not applicable (why) / finding; departure with no recorded reason (e.g. `docs/decisions.jsonl` row, accepted-divergence entry) = finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. Do not change steps during run. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Since previous report's commit, everything touching test stability (browser/unit config: retries, workers, timeouts, trace; shared fixtures/helpers; CI workflows/runners; preview/DB for E2E; device flows) → one-line verdict each. (b) Bounded ~30 min: senior test-infra flags no step asks; read since previous run (incidents, `bkit-audit-logs`, new `docs/failures.jsonl`, vendor status) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity and per verdict, and the median age of open flakes.
- [ ] **Series:** each open flake's rate and the median age beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID in exactly one row; every row has a `Next Step`.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
