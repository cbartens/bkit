<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Log Triage

> [!CAUTION]
> **Purpose:** Judge the error-tracker stream and runtime logs it cannot see: real issues, wrong level, failures that never arrived.
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

An error tracker does not distinguish a bug from a handled outcome logged at error. Both arrive unresolved; the second kind is usually most of the stream. Target failure: **noise that trains people to ignore the board, so the one real defect goes unread.**

**Applies when:** error tracker, runtime logs, or both. None → one `N/A` row with evidence, never "clean".

**Cadence:** every two weeks, whole window since previous report. Extra pass: after release on a rail with no other coverage; when production event count > zero; after vendor status incident while those logs still hold it. Retention shorter than interval = finding → drain or shorter cadence.

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
- Stream trust: symbolication, release, environment, dropped events, grouping, ownership.
- Personal data the tracker stores.
- Swallowed errors in code behind this sweep's issues; user reports with no event.
- Runtime logs the tracker cannot see: retention vs cadence, match to tracker, trace correlation.
- Uptime monitors, cron coverage, alert routing, alert quality, on-call.

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

One per unresolved issue. Verdict decides everything downstream.

- **GENUINE ERROR:** unhandled failure, or handled with wrong handling. Root-cause it. Fix = next step.
- **WRONG LEVEL:** working as intended, filed at error: 2xx response, guard did its job, or docblock documents branch. Recommend level change. Do not edit call site.
- **NOISE:** vendor or infrastructure, no app call site (SDK internals, tunnel egress, platform insight). Recommend tracker-side filter (e.g. `beforeSend` denylist) and warnings-doc row. Do not add filter here. Denylist = vendor frames with no call site, not app code.
- **OTHER:** fits none. Say why and what the issue needs. Same `OTHER` on 2 runs → propose new verdict in `Process Improvements`.

A test-origin tag narrows the lane. It does not make something noise, and it does not lower severity.

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Error Tracker:** Steps 3–9 — read-only issue, event, and alert APIs, e.g. tracker MCP, REST. Fallback: skip tracker steps; runtime-log steps still run; tracker sections `Not Checked`. Never "clean".
- [ ] **Web:** Step 13 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Runtime Logs:** Hosted platforms → Step 11 — read-only log APIs, e.g. log-fetch blocks, vendor CLIs, MCPs. Skipped credential = not read, never clean. Fallback: each skipped source named in `Not Checked`.
- [ ] **Language Server:** Typed language → Step 7 — references, e.g. Serena, `tsserver`. Fallback: text search only; name it on every blast-radius row.
- [ ] **Symbol Maps:** Release builds → Step 4 — source maps and native symbols. Fallback: unsymbolicated = finding; call-site table marked unbuildable.
- [ ] **User Reports:** Feedback channel exists → Step 10 — tracker user feedback, support inbox, store reviews. Fallback: `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find error tracker, runtime logs, or both. **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Board:** Same figures every run for comparison. Window = since previous report; also trailing-30-day when that is tracker default:
  - Unresolved count, and issue short ids.
  - Regressed count.
  - Events by environment. Name each. Call out production.
  - First seen, per issue, UTC.

  Production count > zero → reprioritize everything. No real user traffic → numbers describe CI/test traffic, not user impact; report says so. Resolve release SHA per issue (`git rev-parse`, `git branch --contains`) before branch attribution. Integration-branch HEAD event = dev-side bug, not PR-under-review defect. Release health per client (e.g. web, native): crash-free sessions and crash-free users, per release and environment; latest-release adoption. Low traffic → describes CI; report says so. Previous report expected fix → confirm held and duration. Miss in window = finding. "Shipped" fix absent from default branch = still live = finding. **Done when:** `Board` holds the four figures, release health, and those confirmations.

- [ ] **Step 4 — Instrument:** Read tracker project settings, read-only, against anchor standards.
  - Symbolication. One recent production event and one non-production: frames show original file/line, event carries debug ids, release set. Native client → Hermes maps, dSYM, ProGuard uploads where that client exists. Unsymbolicated stack → call-site table unbuildable = finding.
  - Release and environment on every event. Release health on for each client.
  - Dropped events since previous report: rate-limited, filtered, over quota, spike protection. Record each count. Dropped events read like a quiet board. Record spike protection and per-key rate limits set.
  - Server-side grouping: fingerprint rules, stack-trace rules, inbound filters. List issues merged since previous report (hand or grouping assistant, e.g. Sentry Seer). SDK-side fingerprints = Level step. New inbound filter or merge can hide a class.
  - Ownership rules. CODEOWNERS import needs code mappings and team/user mappings. Unmapped owner = silently ignored. Record share of unresolved issues with no owner.

  **Done when:** `Instrument` holds each check, dropped-event counts, unowned share.

- [ ] **Step 5 — Stored Data:** Tracker holds copies of what the app handles.
  - Server-side scrubbing: data-scrubber rules, IP storage, send-default-PII flag in each init, session-replay masking, user context the app sets (id only). Client scrubber = other half; this step = server half. Wider lifecycle → `bkit-audit-privacy`.
  - Model inputs/outputs. Tracker AI integration can record prompts/responses; current SDKs may default on (e.g. `recordInputs`, `recordOutputs` follow gen-AI collection flag defaulting on). Default depends on SDK version → read integration page for installed one. Read options in each init; open one recent gen-AI span. Message/mail content can land in gen-AI span attributes.
  - Sample five recent events end to end (message, breadcrumbs, request, extra, tags) for names, emails, addresses, message text. Report by field. Never copy value.

  **Done when:** `Stored Data` says what the sample found, by field.

- [ ] **Step 6 — Classify:** One verdict per unresolved issue. Tracker performance issues (e.g. N+1, slow DB spans) and Web Vitals regressions: not classified. Record count on `Board`; name defect-like ones for `bkit-audit-app-performance`. Flake mechanism → note for `bkit-audit-flakes`. **Done when:** every unresolved issue has verdict in `Issues`; performance count on `Board`.
- [ ] **Step 7 — Root Cause:** Each `GENUINE ERROR` and any issue whose verdict depends on call site. Message = symptom. Read call site → path → blast radius. Call-site table = artefact: callers sharing broken mechanism vs not. Language server, where available: stack symbol → every referencing symbol → diagnostics for that file. Pace reference queries; partial answer = indistinguishable from real. Re-run surprising low count. Empty = inconclusive → corroborate with text search; say which count from where. Ask why no test caught it. Every suite mocking SDK = second finding. Verify constraints against live system, not memory: actual predicate, rolled-back insert, host vs published IP ranges. Say what is unverifiable. Teardown often deletes rows an event points at → non-production findings corroborated by mechanism, not row. A mechanism that fits is not a confirmed cause. **Done when:** each `GENUINE ERROR` row in `Issues` has root cause, call-site table, the method that produced it, what is not established, and the file a later change would touch.
- [ ] **Step 8 — Level:** Each `WRONG LEVEL`: recommend error-level log → warning, plus warnings-doc row (call site, reason). Do not edit. Do not recommend tracker denylist for app code. Before downgrading, check hypothesis that would make it real defect; record check. Read both symbols; do not search column name. Fingerprint explosion: message with varying payload (ids, arrays) needs stable grouping key and pinned test before left in stream. **Done when:** each `WRONG LEVEL` row names the level change, the hypothesis checked, any fingerprint gap, and the file a later change would touch.
- [ ] **Step 9 — Disposition:** Recommend resolve, archive, or leave open and why, per issue. This run does not resolve or archive. Recommend resolve only when code that files the issue changed and shipped. Resolving ahead of fix hides only signal on rails with no other coverage. **Done when:** `Issues` states resolve, archive, or leave open for every issue.
- [ ] **Step 10 — Invisible:** Tracker only sees errors that reach it. Caught then neither logged nor rethrown = invisible to caller and this sweep. Quiet board ≠ evidence shape absent. Look only in code behind this sweep's issues (`bkit-audit-reliability` sweeps rest):
  - `catch` blocks that neither rethrow, return error, nor log at warn or above. Start with DB writes and outbound calls.
  - Client calls whose error is never read: result discarded, or success destructured without error.
  - Promises started without `await` or rejection handler on write path.

  Text search finds candidates; read each. Deliberate best-effort (telemetry, fire-and-forget notification) OK when code says so. Real one → Expected names `docs/failures.jsonl` row to append; names `bkit-audit-database` when miss is grant, policy, or write role. Appending = next step. Users see same shape: tracker user feedback, support inbox, store reviews since previous report. User-reported failure with no matching event = this class. Next step = runtime half: swallowed DB error may appear in DB log. **Done when:** `Invisible` lists each candidate read, and its verdict.

- [ ] **Step 11 — Runtime Logs:** Read each runtime-log source in `Project Instructions` for whole window since previous report, not tool default short window. Record retention from plan page and window part source could not cover. Retention < cadence = finding → drain or shorter cadence. Skipped reader (credential, tool, block) = not read, never clean. No reader → vendor console by hand, or not read and why. Note whether server logs share one structured shape (request id, trace id, hashed tenant id, error code) so queries are filters not text search; tracker log product or OTel log exporter in use. Per log error:
  - Match tracker first (timestamps; trace id joins). Covered → note platform evidence on issue. Same incident, not second finding.
  - Group by time across sources. Cluster within few minutes = one outage; write once.
  - Tracker empty → gap = finding. Noise (why), or failure that should have been reported. Second → Expected names signal: log at call site, upstream-outage classifier pattern, or health-endpoint check. Monitor/capacity alert = next step, not this run.
  - Never copy log line free text. PII-safe fields reader already selects.

  Check correlation without clock. Every inbound-request → background-work path: one trace (e.g. W3C `traceparent`, tracker trace header) spans host, job runner, DB calls, in tracker and job-runner traces. Broken hop = finding. Without it, time grouping = only join. Platform failure re-reported to tracker → counts must match; platform failure with no tracker event = broken reporter. **Done when:** `Runtime Logs` row per source: read or not (why) · window covered · retention · error count · matched tracker issues. Correlation recorded.

- [ ] **Step 12 — Alarms:** Prior steps read what arrived. This step checks what is meant to arrive still can. Per observability doc (health endpoint, alert routing, uptime monitors):
  - Uptime monitors. List each: last check-in, last failure, still right URL/environment. Status-only assertion can pass on login wall when checker follows redirects.
  - Cron coverage. Every clock job health endpoint should know. Unknown job can stop silently.
  - Alert routing. Rule exists, destination current, last real alert seen. Alert never seen fire since created = unproven, not healthy. Destination by role or doc section; no personal address.
  - Alert quality. Count fired since previous report, share that led to action, time to acknowledge. Rule fired repeatedly with no action = noise; name it. Rule with no environment filter letting non-production noise reach person = noise; name it.
  - On-call. Who gets production alerts OOH, if no ack, whether quiet hours suppress anything critical. Before launch, developer inbox OK only as written answer.

  No error tracker → monitor list and alert rules `Not Checked`; cron coverage still from repo. Before launch, much unproven for lack of traffic. Record what could not be proven and why. Missing monitor = next step, not this run. **Done when:** `Alarms` row per monitor and cron: last check-in · what could not be proven. Alert-quality numbers and on-call answer included.

- [ ] **Step 13 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per tracker setup practice (symbolication, release, environment, release health, grouping, ownership, quotas, spike protection, scrubbing) and per trace-propagation and SLO-alerting practice → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 14 — Anything Else:** (a) Everything changed since previous report's commit touching error reporting and logs (tracker init and integrations, scrubber, upstream-outage classifier, new error-level call sites, alert rules, uptime and cron monitors, log-fetch blocks, new outside services) → one-line verdict each. (b) Bounded ~30 min pass: what senior SRE flags that no step asks; read since previous run (incidents, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? Any error source this run saw that `Runtime Logs` does not name → record and propose source in `Process Improvements`. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

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
