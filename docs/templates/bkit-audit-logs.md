<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Log Triage

> [!CAUTION]
> **Purpose:** A judgement on the error-tracker stream and on the runtime logs it cannot see: real issues, the wrong level, and failures that never arrived.
>
> **Rules:**
>
> - NEVER resolve, archive, mute or edit tracker issues, dashboards, alert rules or sample rates.
> - NEVER copy log free text, an event payload or a personal-data value into the report.
> - Cite ids, status codes, error codes and timestamps instead.
> - Before the first read of vendor config or error text, name the fields that can carry credentials (e.g., request headers in monitor config, URLs with query tokens, error messages that echo a request).
> - The field decides, not the shape of the value: a value with no secret prefix still counts.
> - Report the field and its class only (e.g., `auth header present`), NEVER the value.

## Universal Instructions

### Context & Goals

An error tracker does not tell a bug apart from a handled outcome logged at error. Both arrive unresolved, and the second kind is usually most of the stream. The failure this audit targets is noise that trains people to ignore the board, so the one real defect goes unread.

**Applies when:** the project has an error tracker, runtime logs, or both. **If** it has neither → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once every two weeks, over the whole window since the previous report. Run an extra pass in each of these three cases: (1) after a release on a rail with no other coverage; (2) when the production event count is above zero; (3) after a vendor status incident, while the logs still hold it. **If** log retention is shorter than the interval → it is a finding; propose a drain or a shorter cadence.

**Anchor Standards:**

- Error-tracker release health (e.g. Sentry). Record SDK versions; unversioned docs record the date read.
- Source maps and debug symbols (e.g. Sentry Debug IDs, Hermes maps, dSYM, ProGuard).
- Event grouping, fingerprints, and stack-trace rules (e.g. Sentry).
- Ownership rules (e.g. Sentry ownership, a CODEOWNERS import).
- Quotas and spike protection (e.g. Sentry).
- OpenTelemetry semantic conventions, including GenAI; record the semconv version.
- W3C Trace Context, Level 1.
- Alerting on SLOs (e.g. Google SRE Workbook, "Alerting on SLOs").
- bkit block of `docs/observability.md` (bkit version from `.bkit/version`): every rule and section
- bkit block of `docs/noise.md` (bkit version from `.bkit/version`): every rule and section

### Scope

- Give each unresolved tracker issue in the window a verdict, a root cause, a blast radius and a disposition.
- Check that the stream can be trusted: symbolication, release, environment, dropped events, grouping and ownership.
- Check the personal data the tracker stores.
- Find swallowed errors in the code behind this sweep's issues.
- Find user reports with no event.
- Read the runtime logs the tracker cannot see: retention against cadence, the match to the tracker, and trace correlation.
- Check uptime monitors, cron coverage, alert routing, alert quality and on-call.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Failures that never reach a log, outside the code behind this sweep's issues | Reliability sweep | `bkit-audit-reliability` |
| Performance issues and Web Vitals | Hot paths | `bkit-audit-app-performance` |
| Flake mechanisms | Flake sweep | `bkit-audit-flakes` |
| CI annotation noise | Annotation sweep | `bkit-audit-annotations` |
| Personal-data lifecycle beyond what the tracker stores | Privacy sweep | `bkit-audit-privacy` |
| Resolving issues or changing levels, filters, alerts, or monitors | Audit reports only | Plan from this report |

### Verdicts

Give each unresolved issue one verdict. The verdict decides everything downstream.

- **GENUINE ERROR:** an unhandled failure, or a failure handled the wrong way. Root-cause it. The fix is the next step.
- **WRONG LEVEL:** the code works as intended but is filed at error: a 2xx response, a guard that did its job, or a branch its docblock documents. Recommend a level change. Do not edit the call site.
- **NOISE:** the event comes from a vendor or infrastructure, with no app call site (SDK internals, tunnel egress, platform insight). Recommend a tracker-side filter (e.g., a `beforeSend` denylist) and a `docs/noise.md` row. Do not add the filter here. The denylist holds vendor frames with no call site, not app code.
- **OTHER:** it fits no other verdict. Say why and what the issue needs. **If** the same `OTHER` shows up on 2 runs → propose a new verdict in `Process Improvements`.

A test-origin tag narrows the lane. It does not make something noise, and it does not lower severity.

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Error Tracker:** Steps 3-9 — read-only issue, event and alert APIs (e.g., tracker MCP, REST). Fallback: skip the tracker steps, still run the runtime-log steps, and mark the tracker sections `Not Checked`. Never report them as "clean".
- [ ] **Web:** Step 13 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Runtime Logs:** **If** the project runs on hosted platforms → Step 11 — read-only log APIs (e.g., vendor CLIs, MCPs). Log access: the `context-fetch` blocks below `bkit:end` in `.agents/context.md` are ready-made read-only readers. `bkit context list-blocks` prints each block's `context` and `body`. Set a body's `# Customise:` knobs to the audit window, and run it with `direnv exec . bash`. A source skipped for a missing credential is not read, and never clean. Fallback: name each skipped source in `Not Checked`.
- [ ] **Language Server:** **If** the language is typed → Step 7 — references (e.g., Serena, `tsserver`). Fallback: text search only, and name it on every blast-radius row.
- [ ] **Symbol Maps:** **If** there are release builds → Step 4 — source maps and native symbols. Fallback: record an unsymbolicated stack as a finding, and mark the call-site table unbuildable.
- [ ] **User Reports:** **If** a feedback channel exists → Step 10 — tracker user feedback, support inbox, store reviews. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** Find the error tracker, the runtime logs, or both. **Done when:** `Checked` holds evidence, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Board:** Record the same figures on every run, so runs compare. The window is the time since the previous report. Also record the trailing 30 days when that is the tracker's default:
  - The unresolved count, and the issue short ids.
  - The regressed count.
  - Events by environment. Name each environment, and call out production.
  - First seen per issue, in UTC.
  - Reported against platform failures. For each platform that re-reports failures to the tracker (e.g., job runner, host), put the platform failure count beside the tracker event count for the same window. **If** the ratio is < 1 → reports were lost.

  **If** the production count is above zero → reprioritize everything. **If** there is no real user traffic → the numbers describe CI or test traffic, not user impact, and the report says so. Resolve the release SHA per issue (`git rev-parse`, `git branch --contains`) before attributing it to a branch. An event at the integration branch's HEAD is a dev-side bug, not a defect in the PR under review. Record release health per client (e.g., web, native): crash-free sessions and crash-free users per release and environment, and latest-release adoption. **If** traffic is low → the numbers describe CI, and the report says so. **If** the previous report expected a fix → confirm that it held, and for how long. A miss in the window is a finding. A "shipped" fix that is absent from the default branch is still live, and is a finding. **Done when:** `Board` holds the five figures, release health and those confirmations.

- [ ] **Step 4 — Instrument:** Read the tracker project settings, read-only, against the anchor standards.
  - Symbolication. Open one recent production event and one non-production event: the frames show the original file and line, the event carries debug ids, and the release is set. **If** there is a native client → check the Hermes map, dSYM and ProGuard uploads where that client exists. An unsymbolicated stack makes the call-site table unbuildable, and is a finding.
  - Release and environment are set on every event. Release health is on for each client.
  - Dropped events since the previous report: rate-limited, filtered, over quota, and spike protection. Record each count, because dropped events read like a quiet board. Record the spike protection and per-key rate limits that are set.
  - Server-side grouping: fingerprint rules, stack-trace rules and inbound filters. List the issues merged since the previous report, by hand or by a grouping assistant (e.g., Sentry Seer). SDK-side fingerprints belong to the Level step. A new inbound filter or merge can hide a class.
  - Ownership rules. A CODEOWNERS import needs code mappings and team/user mappings. An unmapped owner is silently ignored. Record the share of unresolved issues with no owner.

  **Done when:** `Instrument` holds each check, the dropped-event counts and the unowned share.

- [ ] **Step 5 — Stored Data:** The tracker holds copies of what the app handles.
  - Server-side scrubbing: the data-scrubber rules, IP storage, the send-default-PII flag in each init, session-replay masking, and the user context the app sets (id only). The client scrubber is the other half; this step checks the server half. The wider lifecycle belongs to `bkit-audit-privacy`.
  - Model inputs and outputs. The tracker's AI integration can record prompts and responses, and current SDKs may default this on (e.g., `recordInputs`, `recordOutputs` follow the gen-AI collection flag, which defaults on). The default depends on the SDK version, so read the integration page for the installed one. Read the options in each init, and open one recent gen-AI span. Message and mail content can land in gen-AI span attributes.
  - Sample five recent events end to end (message, breadcrumbs, request, extra, tags) for names, emails, addresses and message text. Report by field. NEVER copy a value.

  **Done when:** `Stored Data` says what the sample found, by field.

- [ ] **Step 6 — Classify:** Give each unresolved issue one verdict. Do not classify tracker performance issues (e.g., N+1, slow DB spans) or Web Vitals regressions. Record their count on `Board`, and name the defect-like ones for `bkit-audit-app-performance`. **If** an issue shows a flake mechanism → note it for `bkit-audit-flakes`. **Done when:** every unresolved issue has a verdict in `Issues`, and the performance count is on `Board`.
- [ ] **Step 7 — Root Cause:** Root-cause each `GENUINE ERROR`, and any issue whose verdict depends on the call site. The message is the symptom. Read the call site, then the path, then the blast radius. The call-site table is the artefact: the callers that share the broken mechanism, and those that do not. Where a language server is available, go from the stack symbol to every referencing symbol, then to the diagnostics for that file. Pace the reference queries, because a partial answer looks the same as a real one. Re-run a surprisingly low count. An empty result is inconclusive: corroborate it with text search, and say which count came from where. Ask why no test caught it. Every suite that mocks the SDK is a second finding. Verify constraints against the live system, not memory: the actual predicate, a rolled-back insert, the host against the published IP ranges. Say what cannot be verified. Teardown often deletes the rows an event points at, so corroborate non-production findings by mechanism, not by row. A mechanism that fits is not a confirmed cause. **Done when:** each `GENUINE ERROR` row in `Issues` has a root cause, a call-site table, the method that produced it, what is not established, and the file a later change would touch.
- [ ] **Step 8 — Level:** For each `WRONG LEVEL`, recommend moving the error-level log to warning, plus a `docs/noise.md` row (call site, reason). Do not edit. Do not recommend a tracker denylist for app code. Before downgrading, check the hypothesis that would make it a real defect, and record the check. Read both symbols; do not search for the column name. Watch for fingerprint explosion: a message with a varying payload (ids, arrays) needs a stable grouping key and a pinned test before it is left in the stream. **Done when:** each `WRONG LEVEL` row names the level change, the hypothesis checked, any fingerprint gap, and the file a later change would touch.
- [ ] **Step 9 — Disposition:** For each issue, recommend resolve, archive or leave open, and say why. This run does not resolve or archive. Recommend resolve only when the code that files the issue has changed and shipped, because resolving ahead of the fix hides the only signal on rails with no other coverage. Check archived / muted issues too: for each archive or mute row in `docs/noise.md`, compare the window's events with the row's recorded trigger. **If** the events are past the trigger → recommend un-archiving. **Done when:** `Issues` states resolve, archive or leave open for every issue, and every archive / mute row is checked against its trigger.
- [ ] **Step 10 — Invisible:** The tracker sees only the errors that reach it. An error that is caught, then neither logged nor rethrown, is invisible to the caller and to this sweep. A quiet board is not evidence that the shape is absent. Look only in the code behind this sweep's issues (`bkit-audit-reliability` sweeps the rest):
  - `catch` blocks that neither rethrow, return an error, nor log at warn or above. Start with DB writes and outbound calls.
  - Client calls whose error is never read: the result is discarded, or the success value is destructured without the error.
  - Promises on a write path started without `await` or a rejection handler.

  Text search finds candidates; read each one. Deliberate best-effort code (telemetry, a fire-and-forget notification) is fine when the code says so. **If** a candidate is real → it gets a `docs/failures.jsonl` row, which the audit agent writes. **If** the miss is a grant, a policy or a write role → `Expected` names `bkit-audit-database`. Users see the same shape: read the tracker user feedback, support inbox and store reviews since the previous report. A user-reported failure with no matching event belongs to this class. The next step is the runtime half: a swallowed DB error may appear in the DB log. **Done when:** `Invisible` lists each candidate read, and its verdict.

- [ ] **Step 11 — Runtime Logs:** Read each runtime-log source in `Project Instructions` and each `context=runtime` block in `.agents/context.md` over the whole window since the previous report, not the tool's short default window. Record the retention from the plan page, and the part of the window a source could not cover. **If** retention is < the cadence → it is a finding; propose a drain or a shorter cadence. A skipped reader (credential, tool, block) is not read, and never clean. **If** there is no reader → read the vendor console by hand, or record that it was not read and why. Note whether server logs share one structured shape (request id, trace id, hashed tenant id, error code), so that queries are filters, not text search, and whether a tracker log product or an OTel log exporter is in use. **If** test and production share a vendor resource (e.g., a sending domain, an API key) → read its reputation signal (e.g., bounce and complaint rate per sender) for the window. **If** the resources are separate → record `not shared`. **If** the vendor exposes no such metric → name the missing signal, and mark it `Not Checked`. For each log error:
  - Match it to the tracker first (timestamps; trace id joins). **If** it is covered → note the platform evidence on the issue. It is the same incident, not a second finding.
  - Group errors by time across sources. A cluster within a few minutes is one outage; write it once.
  - **If** the tracker is empty for it → the gap is a finding. Record whether it is noise (and why), or a failure that should have been reported. **If** it should have been reported → `Expected` names the signal: a log at the call site, an upstream-outage classifier pattern, or a health-endpoint check. A monitor or capacity alert is the next step, not this run.
  - NEVER copy log-line free text. Use the PII-safe fields the reader already selects.

  Check correlation without the clock. On every inbound-request → background-work path, one trace (e.g., W3C `traceparent`, a tracker trace header) spans the host, job runner and DB calls, in both the tracker and the job-runner traces. A broken hop is a finding, because without the trace, time grouping is the only join. **If** platform failures are re-reported to the tracker → the counts must match, and a platform failure with no tracker event means a broken reporter. **Done when:** `Runtime Logs` has a row per source: read or not (why) · window covered · retention · error count · matched tracker issues. It has a row per shared vendor resource: reputation per sender, `not shared`, or `Not Checked` (why). Correlation is recorded, and `Board` holds the reported-vs-platform ratio per reporting platform.

- [ ] **Step 12 — Alarms:** The earlier steps read what arrived. This step checks that what is meant to arrive still can. Follow the observability doc (health endpoint, alert routing, uptime monitors):
  - Uptime monitors. List each one with its last check-in, its last failure, and whether it still points at the right URL and environment. A status-only assertion can pass on a login wall when the checker follows redirects.
  - Cron coverage. The health endpoint should know every clock job, because an unknown job can stop silently. Read every run, not only each job's newest: a run that started and is unfinished past its timeout is a finding.
  - Health state store. Read the store the health endpoint writes check results to (table, key): for each check, the last result and when it was last evaluated. A row older than its schedule is a finding, whatever its last result, because a stale `ok` is a dead check. **If** there is no store (checks are computed live) → record that with evidence. **If** a row has no timestamp → record the gap. **If** the read needs a write-capable credential → mark it `Not Checked`; never borrow one.
  - Alert routing. Check that the rule exists, that the destination is current, and when a real alert was last seen. An alert never seen to fire since it was created is unproven, not healthy. Name the destination by role or doc section, with no personal address.
  - Alert quality. Record the count fired since the previous report, the share that led to action, and the time to acknowledge. A rule that fired repeatedly with no action is noise; name it. A rule with no environment filter that lets non-production noise reach a person is noise; name it.
  - On-call. Record who gets production alerts out of hours, who gets them when nobody acknowledges, and whether quiet hours suppress anything critical. Before launch, a developer inbox is acceptable only as a written answer.

  **If** there is no error tracker → mark the monitor list and alert rules `Not Checked`, and still read cron coverage from the repo. Before launch, much stays unproven for lack of traffic. Record what could not be proven, and why. A missing monitor is the next step, not this run. **Done when:** `Alarms` has a row per monitor and cron: last check-in · runs left unfinished · what could not be proven. It has a row per state-store check: last result · last evaluated, or `no state store` with evidence. The alert-quality numbers and the on-call answer are included.

- [ ] **Step 13 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per tracker setup practice (symbolication, release, environment, release health, grouping, ownership, quotas, spike protection, scrubbing) and per trace-propagation and SLO-alerting practice, each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 14 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches error reporting and logs: tracker init and integrations, the scrubber, the upstream-outage classifier, new error-level call sites, alert rules, uptime and cron monitors, log-fetch blocks, and new outside services. (b) In a bounded pass of about 30 minutes, note what a senior SRE would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **If** this run saw an error source that `Runtime Logs` does not name → record it, and propose the source in `Process Improvements`. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **No tracker writes:** nothing was resolved, archived, muted or edited.
- [ ] **No config changes:** no sample rate or alert rule changed.
- [ ] **No payloads:** no log free text, event payload, personal-data value or credential-field value is in the report.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Unhandled failure on a production path with no workaround; swallowed write that returns success; message text or credentials stored in the tracker |
| `HIGH` | Genuine error on a rail with no other coverage; production events above zero and unread; dropped events or quota exhaustion that blinds the board; platform-only failure with no signal; retention shorter than the cadence on a source production depends on |
| `MEDIUM` | Handled outcome filed at error; unsymbolicated stack; no owner on most unresolved issues; alert that has never fired, or fires with no action; fingerprint explosion; user report with no event |
| `LOW` | Noise with a named vendor frame; test-traffic issue already tagged; `docs/noise.md` wording drift |

Within a severity, list production first, then order by blast radius. A test-origin tag does not lower severity. A quiet board is not a pass.

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

### Board

PENDING

### Instrument

PENDING

### Stored Data

PENDING

### Issues

PENDING

### Invisible

PENDING

### Runtime Logs

PENDING

### Alarms

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
- [ ] **Summary:** `Summary` gives the count per severity, what is new, the single most important finding, the unresolved count and the production event count.
- [ ] **Series:** the report shows `Board` counts beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
