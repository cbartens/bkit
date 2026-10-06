<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Log Triage

> [!CAUTION]
> **Purpose:** Judge the error-tracker stream and the runtime logs it cannot see: which issues are real, which are the wrong level, and which failures never arrived.
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
> - NEVER resolve, archive, mute, or edit tracker issues, dashboards, alert rules, or sample rates.
> - NEVER copy log free text, an event payload, or a personal-data value into the report. Cite ids, status codes, error codes, and timestamps.

## Universal Instructions

### Context & Goals

An error tracker does not distinguish a bug from a handled outcome logged at error. Both arrive unresolved, and the second kind is usually most of the stream. Left alone, the noise trains people to ignore the board, and the one real defect in it goes unread. The level belongs at the call site, not in a tracker-side filter (e.g. a `beforeSend` denylist). The report recommends a one-line level change and a warnings-doc row; making that change is the next step. Some failures never raise in app code, so they exist only in a platform log: a function killed at its time limit reports nothing, and a database that refuses a connection or a grant may log it only there. One incident usually shows in several logs at once, so they are read in one sweep. A platform-only failure normally needs a new tracker signal, so the next one arrives by itself. Adding the signal is the next step.

**Applies when:** an error tracker, runtime logs, or both. None → one `N/A` row with evidence, never "clean".

**Cadence:** every two weeks, over the whole window since the previous report. Extra pass after a release on a rail with no other coverage, when the production event count goes above zero, or after a vendor status incident while those logs still hold it. A source whose retention is shorter than this interval = finding: it needs a drain or a shorter cadence.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Error-tracker release health (e.g. Sentry). Record SDK versions; unversioned docs record the date read.
- Source maps and debug symbols (e.g. Sentry Debug IDs, Hermes maps, dSYM, ProGuard).
- Event grouping, fingerprints, and stack-trace rules (e.g. Sentry).
- Ownership rules (e.g. Sentry ownership, a CODEOWNERS import).
- Quotas and spike protection (e.g. Sentry).
- OpenTelemetry semantic conventions, including GenAI; record the semconv version.
- W3C Trace Context, Level 1.
- Alerting on SLOs (e.g. Google SRE Workbook, "Alerting on SLOs").

### Scope

- Unresolved tracker issues over the window: verdict, root cause, blast radius, disposition.
- Whether the stream can be trusted: symbolication, release, environment, dropped events, grouping, ownership.
- Personal data the tracker stores.
- Swallowed errors in the code behind this sweep's issues, and user reports with no event.
- Runtime logs the tracker cannot see: retention against the cadence, match to the tracker, trace correlation.
- Uptime monitors, cron coverage, alert routing, alert quality, and on-call.

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

One per unresolved issue. The verdict decides everything downstream.

- **GENUINE ERROR:** an unhandled failure, or a handled one whose handling is wrong. Root-cause it. The fix is the next step.
- **WRONG LEVEL:** working as intended, but filed at error: the response was 2xx, the guard did its job, or the docblock documents this branch. Recommend the level change. Do not edit the call site.
- **NOISE:** vendor or infrastructure, with no app call site (SDK internals, tunnel egress, platform insight). Recommend a tracker-side filter (e.g. a `beforeSend` denylist) and a warnings-doc row. Do not add the filter here. The denylist is for vendor frames with no call site, not for app code.
- **OTHER:** fits none. Say why, and what the issue needs. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

A test-origin tag narrows the lane. It does not make something noise, and it does not lower severity.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Error Tracker:** Steps 3–9 — read-only issue, event, and alert APIs, e.g. tracker MCP, REST. Fallback: skip tracker steps; runtime-log steps still run; tracker sections `Not Checked`. Never "clean".
- [ ] **Web:** Step 13 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Runtime Logs:** Hosted platforms → Step 11 — read-only log APIs, e.g. log-fetch blocks, vendor CLIs, MCPs. A skipped credential = not read, never clean. Fallback: each skipped source named in `Not Checked`.
- [ ] **Language Server:** Typed language → Step 7 — references, e.g. Serena, `tsserver`. Fallback: text search only; name it on every blast-radius row.
- [ ] **Symbol Maps:** Release builds → Step 4 — source maps and native symbols. Fallback: unsymbolicated = finding; call-site table marked unbuildable.
- [ ] **User Reports:** A feedback channel exists → Step 10 — tracker user feedback, support inbox, store reviews. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find an error tracker, runtime logs, or both. **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Board:** Record the same figures every run, so successive runs compare. Window = since the previous report; also record a trailing-30-day figure when that is the tracker's default:
  - Unresolved count, and issue short ids.
  - Regressed count.
  - Events by environment. Name each environment. Call out production.
  - First seen, per issue, UTC.

  Production count above zero changes the priority of everything else. Until there is real user traffic, say the numbers describe CI and test traffic, not user impact. Resolve the release SHA on each issue (`git rev-parse`, `git branch --contains`) before attributing a defect to a branch. An event tagged with the integration-branch HEAD is a dev-side bug, not something the PR under review introduced. Release health per client (e.g. web and native): crash-free sessions and crash-free users, per release and per environment, and adoption of the latest release. Until there is real traffic it describes CI, and the report says so. Previous report named a fix expected to hold → confirm it held, and for how long. A miss over the window = finding. A fix the previous report called shipped, but absent from the default branch, is still live = finding. **Done when:** `Board` holds the four figures, release health, and those confirmations.

- [ ] **Step 4 — Instrument:** Read tracker project settings, read-only, against the anchor standards.
  - Symbolication. One recent production event and one non-production event: frames show the original file and line, the event carries debug ids, and the release is set. Native client → also Hermes maps, dSYM, and ProGuard uploads where that client exists. An unsymbolicated stack makes the call-site table unbuildable = finding.
  - Release and environment on every event. Release health on for each client.
  - Dropped events since the previous report: rate-limited, filtered, over quota, or dropped by spike protection. Record each count. Dropped events read exactly like a quiet board. Record that spike protection and per-key rate limits are set.
  - Server-side grouping: fingerprint rules, stack-trace rules, and inbound filters. List issues merged since the previous report, by hand or by the tracker's grouping assistant (e.g. Sentry Seer). SDK-side fingerprints are the Level step. A new inbound filter or merge can hide a class.
  - Ownership rules. A CODEOWNERS import needs code mappings and the team and user mappings. A rule whose owner is unmapped is silently ignored. Record the share of unresolved issues with no owner.

  **Done when:** `Instrument` holds each check, the dropped-event counts, and the unowned share.

- [ ] **Step 5 — Stored Data:** The tracker holds copies of what the app handles.
  - Server-side scrubbing: data-scrubber rules, IP storage, the send-default-PII flag in each init, session-replay masking, and the user context the app sets (id only). The client scrubber is the other half; this step is the server half. Wider lifecycle → `bkit-audit-privacy`.
  - Model inputs and outputs. A tracker AI integration can record prompts and responses, and current SDKs may do so by default (e.g. `recordInputs` and `recordOutputs` follow a gen-AI collection flag that defaults on). The default depends on the SDK version, so read the integration page for the installed one. Read the options in each init, then open one recent gen-AI span. Message and mail content can land in gen-AI span attributes.
  - Sample five recent events end to end (message, breadcrumbs, request, extra, tags) for names, emails, addresses, or message text. Report by field. Never copy the value.

  **Done when:** `Stored Data` says what the sample found, by field.

- [ ] **Step 6 — Classify:** One verdict per unresolved issue. Tracker performance issues (e.g. N+1 queries, slow database spans) and Web Vitals regressions are not classified. Record their count on `Board` so a jump is visible, and name any that look like a defect for `bkit-audit-app-performance`. A flake mechanism → note for `bkit-audit-flakes`. **Done when:** every unresolved issue has a verdict in `Issues`; the performance count is on `Board`.
- [ ] **Step 7 — Root Cause:** For each `GENUINE ERROR`, and any issue whose verdict depends on the call site. The message names a symptom. Read the call site, then the path that reaches it, then the blast radius. The call-site table is the artefact: which callers share the broken mechanism, and which do not. Language server, where available: find the symbol named in the stack → every referencing symbol → diagnostics for that file. Pace reference queries; a partial answer is indistinguishable from a real one. Re-run a surprising low count. Empty is inconclusive. Corroborate with text search, and say which count came from where. Ask why no test caught it. Every suite mocking the SDK = a second finding. Verify constraints against the live system, not memory: the actual predicate, a rolled-back insert, the host against published IP ranges. Say what is unverifiable. Teardown often deletes the rows an event points at, so non-production findings are corroborated by mechanism rather than by the row. A mechanism that fits is not a confirmed cause. **Done when:** each `GENUINE ERROR` row in `Issues` has root cause, call-site table, the method that produced it, what is not established, and the file a later change would touch.
- [ ] **Step 8 — Level:** For `WRONG LEVEL`, recommend changing the error-level log to a warning, and a warnings-doc row naming the call site and the reason. Do not edit. Do not recommend a tracker-side denylist for app code. Before downgrading, check the one hypothesis that would make it a real defect, and record the check. Read both symbols; do not search for the column name. Fingerprint explosion: a message carrying a varying payload (ids, arrays) needs a stable grouping key and a pinned test before it is left in the stream. **Done when:** each `WRONG LEVEL` row names the level change, the hypothesis checked, any fingerprint gap, and the file a later change would touch.
- [ ] **Step 9 — Disposition:** Recommend resolve, archive, or leave open, and why, per issue. This run does not resolve or archive. Recommend resolve only when the code that files the issue has changed and shipped. Resolving ahead of the fix hides the only signal on rails with no other coverage. **Done when:** `Issues` states resolve, archive, or leave open for every issue.
- [ ] **Step 10 — Invisible:** The tracker only sees errors that reach it. An error caught and then neither logged nor rethrown is invisible to the caller and to this sweep. A quiet board is not evidence that shape is absent. Look only in the code behind this sweep's issues (`bkit-audit-reliability` sweeps the rest):
  - `catch` blocks that neither rethrow, return an error, nor log at warn or above. Start with database writes and outbound calls.
  - Client calls whose error is never read: the result discarded, or success destructured without the error.
  - Promises started without `await` or a rejection handler on a write path.

  Text search finds the candidates; read each one. A deliberately best-effort call (telemetry, a fire-and-forget notification) is fine when the code says so. For a real one, Expected names the `docs/failures.jsonl` row to append, and names `bkit-audit-database` when the miss is a grant, a policy, or a write role. Appending is the next step. Users see the same shape from the other side: tracker user feedback, the support inbox, and store reviews since the previous report. A failure a user reported with no matching event = this class. The next step is the runtime half: a swallowed database error can still appear in the database log. **Done when:** `Invisible` lists each candidate read, and its verdict.

- [ ] **Step 11 — Runtime Logs:** Read each runtime-log source in `Project Instructions` for the whole window since the previous report, not the tool's default short window. Record each source's retention from its plan page, and which part of the window that source could not cover. Retention shorter than the cadence = finding: a drain, or a shorter cadence. A reader that skipped (missing credential, tool, or block) = not read, never clean. Sources with no reader: read by hand in the vendor console, or record not read and why. Note whether server logs share one structured shape (request id, trace id, hashed tenant id, error code), so queries are filters rather than text search, and whether a tracker log product or an OpenTelemetry log exporter is in use. For each error a log shows:
  - Match it to the tracker first (timestamps; a trace id joins). Already covered → note the platform evidence on that issue. Same incident, not a second finding.
  - Group by time across sources. A cluster within a few minutes is one outage; write it once.
  - Tracker has nothing → the gap is the finding. Noise (say why), or a failure that should have been reported. For the second, Expected names the signal: a log at the call site, an upstream-outage classifier pattern, or a health-endpoint check. Building the monitor or the capacity alert is the next step, not this run.
  - Never copy a log line's free text. Use the PII-safe fields the reader already selects.

  Once per run, check correlation without the clock. Pick one inbound request that starts background work, and confirm a single trace (e.g. W3C `traceparent`, or the tracker's trace header) spans the host, the job runner, and the database calls, in the tracker and in the job runner's traces. A broken hop = finding. Without it, grouping by time is the only join. Where a platform failure is supposed to be re-reported into the tracker, the two counts must match; a platform failure with no tracker event means the reporter is broken. **Done when:** `Runtime Logs` row per source: read or not (why) · window covered · retention · error count · how many matched a tracker issue. Correlation result recorded.

- [ ] **Step 12 — Alarms:** Steps above read what arrived. This step checks that what is meant to arrive still can. Per the observability doc (health endpoint, alert routing, uptime monitors):
  - Uptime monitors. List them. For each: last check-in, last failure, and whether it still points at the right URL and environment. A status-only assertion can pass on a login wall when the checker follows redirects.
  - Cron coverage. Every job on a clock that the health endpoint should know. One it does not know can stop silently.
  - Alert routing. The rule exists, the destination is current, and the last real alert was seen. An alert nobody has seen fire since it was created is unproven, not healthy. Name the destination by role or doc section; do not paste a personal address.
  - Alert quality. Count fired since the previous report, the share that led to action, and the time to acknowledge. A rule that fired repeatedly with no action is noise; name it. A rule with no environment filter, which lets non-production noise reach a person, is noise too; name it.
  - On-call. Who receives production alerts out of hours, what happens if they do not acknowledge, and whether quiet hours suppress anything critical. Before launch, the developer's inbox is acceptable only as the written answer.

  No error tracker → the monitor list and alert rules are `Not Checked`; cron coverage still runs from the repo. Before launch, much of this has no traffic to prove. Record what could not be proven, and why. Building a missing monitor is the next step, not this run. **Done when:** `Alarms` row per monitor and cron: last check-in · what could not be proven. Alert-quality numbers and the on-call answer included.

- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per tracker setup practice (symbolication, release, and environment, release health, grouping, ownership, quotas, and spike protection, scrubbing) and per trace-propagation and SLO-alerting practice → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything changed since previous report's commit touching error reporting and logs (tracker init and integrations, scrubber, upstream-outage classifier, new error-level call sites, alert rules, uptime, and cron monitors, log-fetch blocks, new outside services) → one-line verdict each. (b) Bounded ~30 min pass: what a senior SRE flags that no step asks; read what happened since previous run (incidents, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Any error source this run saw that `Runtime Logs` does not name → record it and propose the source in `Process Improvements`. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **No tracker writes:** nothing resolved, archived, muted, or edited; no sample rate or alert rule changed.
- [ ] **No payloads:** no log free text, event payload, or personal-data value in the report.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Unhandled failure on a production path with no workaround; swallowed write that returns success; message text or credentials stored in the tracker |
| `HIGH` | Genuine error on a rail with no other coverage; production events above zero and unread; dropped events or quota exhaustion that blinds the board; platform-only failure with no signal; retention shorter than the cadence on a source production depends on |
| `MEDIUM` | Handled outcome filed at error; unsymbolicated stack; no owner on most unresolved issues; alert that has never fired, or fires with no action; fingerprint explosion; user report with no event |
| `LOW` | Noise with a named vendor frame; test-traffic issue already tagged; warnings-doc wording drift |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: production first, then blast radius. A test-origin tag does not lower severity. A quiet board is not a pass.

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

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, STOP.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, what is new, the single most important finding, the unresolved count, and the production event count.
- [ ] **Series:** `Board` counts beside previous report's counts, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
