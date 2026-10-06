<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Reliability Audit

> [!CAUTION]
> **Purpose:** What the product does when a dependency is slow, down, or delivered twice: dropped errors, missing timeouts, unsafe retries, races, unbounded work, and failure modes no alert reports.
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
> - NEVER take a dependency down, inject a fault, or change an alert, monitor, or flag. A game day is a separate exercise; this run only records its date and outcome.
> - NEVER run a replay, retry, send, charge, or restore. Read the procedure only.

## Universal Instructions

### Context & Goals

Failure paths are the least-tested code: the happy path is tested, and a vendor outage is rare enough that nobody walks it until it happens. Target failure: **a dependency is slow, down, or delivered twice, and the call site answers with success** — e.g. a write whose error is dropped, the route returns success, and no event fires, so no dashboard can see it. Each new call site drifts that answer.

**Applies when:** outbound calls, webhook receivers, background jobs, or write paths. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when a new vendor, webhook, or background job lands. The game day in `Degradation` is a separate exercise, also quarterly, on its own date; each run records when it last happened.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Google SRE Workbook (online edition): Implementing SLOs, Alerting on SLOs (multi-window, multi-burn-rate), Example error budget policy.
- Google SRE Book (online edition): Postmortem Culture.
- AWS Well-Architected Framework, Reliability Pillar: REL05 BP01–BP07 (graceful degradation, throttling, retries, fail fast, client timeouts, stateless, emergency levers), REL11 (static stability), REL13 (disaster recovery). Record the publication date read.
- Background-job flow-control docs (e.g. Inngest concurrency and `createFunction`, Temporal task queues).

### Scope

- Outbound calls, webhook receivers, background work, write paths. Hard vs soft, including transitive dependencies.
- Critical journeys, SLOs, error-budget policy.
- Dropped errors, timeouts, retries, idempotency, races, unbounded work.
- User-local time, where the product schedules.
- What the user sees when a dependency is down; one dependency walked on paper; last game day recorded, not run.
- Emergency levers, recovery targets, disaster paths.
- Deploys, old clients, alerts, runbooks, incident response.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Errors that already reached a log | That sweep reads them; this sweep is failures that never reach a log | `bkit-audit-logs` |
| Grants, catalogue integrity, restore drill | Database sweep | `bkit-audit-database` |
| Query plans and database-side limits | Database sweep | `bkit-audit-database` |
| Live fault injection | Separate exercise, under that audit's rules | `bkit-audit-red-team` |
| Prompt bounds, call limits, evals | LLM sweep | `bkit-audit-llm` |
| Which model is called, deprecation, registry | Registry sweep | `bkit-audit-models` |
| Copied wrappers as duplication | Duplication sweep | `bkit-audit-duplication` |
| Adding a lint or test gate | Gates sweep | `bkit-audit-gates` |
| Rewriting a doc that omits a surface | Docs sweep | `bkit-audit-documentation` |
| Store-side version settings | Store sweep | `bkit-audit-app-store` |
| Whether an outside caller is allowed to trigger a replay | Security sweep; this audit still reads idempotency | `bkit-audit-security` |
| Changing code, alerts, or monitors | Audit reports only | Plan from this report |

### 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. NEVER abort for a missing capability.

#### Core

Always verify.

- [ ] **Code Search:** Steps 2–12, 14, 16 — text search and a language server for callers, e.g. ripgrep, Serena, `tsserver`. Language-server hits under-report; empty is inconclusive → corroborate with text search and name the tool. Fallback: text search only; name it per claim.
- [ ] **Web:** Step 15 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Metrics:** Hosted traces, errors, or a health endpoint → Steps 3, 13 — SLO queries and alert config, e.g. Sentry, Datadog, Better Stack. Fallback: repo config only; live measurements `Not Checked`.
- [ ] **Job Platform:** Background jobs → Steps 6, 7 — flow control and replay docs, read-only, e.g. Inngest, Temporal. Fallback: code only; live run history `Not Checked`.
- [ ] **Deploy Platform:** Hosted deploys → Step 12 — skew protection, rollout, rollback history, e.g. Vercel API, Cloud Run. Fallback: repo config only; dashboard settings `Not Checked`.
- [ ] **Vendor Status:** External dependencies → Step 13 — status feeds. Fallback: none; feeds `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Probe Steps`.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Record `git rev-parse HEAD`. Read newest prior report for this slug under `docs/audits/`. Count its findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Surfaces:** One table, kept from run to run so the next run diffs it. Outbound calls (every SDK client and every `fetch` host); webhook receivers; background work (job functions and scheduled database jobs); write paths (routes and server actions that change data). Per dependency: hard (the journey fails without it) or soft (the journey degrades), and what it depends on in turn. A transitive dependency counts (e.g. auth mail sent through the mail vendor means a mail outage is a sign-in outage). A surface in code and not in the docs = finding; the doc rewrite → `bkit-audit-documentation`. **Done when:** `Surfaces` lists every surface with hard/soft and transitive deps, or `N/A` and STOP.
- [ ] **Step 3 — Journeys:** Pick 3–5 journeys a user relies on. Per journey: SLI as a good/total ratio, SLO over a rolling 28-day window, current measurement with the query that produced it. Keep the table from run to run. No target, or a target nobody measures = finding. Error-budget policy: what changes when a budget is spent (e.g. a feature freeze, or a mandatory postmortem when one incident uses more than 20% of the budget). Record whether the policy was triggered since the previous run, and whether it was obeyed. No policy = finding. **Done when:** `Journeys` row per journey: SLI · SLO · measurement and query · budget triggered · obeyed.
- [ ] **Step 4 — Dropped Errors:** Codebase-wide, not only behind errors that already reached a log (`bkit-audit-logs` owns those). `catch` that neither rethrows, returns an error, nor logs at `warn` or above; client calls whose error result is never read (e.g. Supabase `{ error }`, AWS SDK, Prisma); promises started without `await` or `.catch`; broad catches that turn every failure into one generic message, so the caller cannot tell a timeout from a bug. A failure dropped and never logged is invisible to the user and to operators; those come first. A deliberately best-effort call (telemetry, a fire-and-forget notification) is fine when the code says so. A class a linter could catch (e.g. `@typescript-eslint/no-floating-promises`, an unread client `error`) → name the rule under `Process Improvements`; do not add it. Adding the gate → `bkit-audit-gates`. **Done when:** every hit = finding with `file:line`.
- [ ] **Step 5 — Timeouts:** Per outbound call from `Surfaces`. A timeout (`fetch` has none by default; an SDK may or may not). A call with no timeout holds a function open until the platform kills it. Each timeout, multiplied by its attempts, plus its backoff, fits inside the calling function's duration limit, and each inner timeout is shorter than the one around it. A function killed at its limit reports nothing; recorded platform timeouts → `bkit-audit-logs`; this step owns the budget. Bounded retries with backoff, only on errors worth retrying (timeouts, 429, 5xx), never on a 4xx. Retries only on safe operations: retrying a create, a charge, or a send without an idempotency key does it twice. Background-job retry setting (e.g. Inngest `retries`), and what each step does when re-run. A model call has a fallback model or provider list, or a degraded path that works without the model. Which models are listed → `bkit-audit-models`. Token caps and evals → `bkit-audit-llm`. Credit-limit and rate-limit responses are distinct, not one generic retry: a credit limit does not succeed on retry unless the response carries `Retry-After`; a rate limit backs off (e.g. OpenRouter `402` / `429`). A shared outbound client with a default timeout and retry policy turns this step into checking bypasses. Absent → propose under `Process Improvements`. The same wrapper copied in several places → name for `bkit-audit-duplication`. **Done when:** every call from `Surfaces` has a timeout, budget, retry, and safety verdict.
- [ ] **Step 6 — Idempotency:** Webhooks are delivered at least once, and a job step re-runs after a failure. Per receiver and per step, a second run is harmless: it dedupes on the provider's event id, uses a conditional update, or is naturally idempotent. Side effects (an email, a charge, a row insert) outside a step run again on every retry. An outside caller repeating a create → `bkit-audit-security` and `bkit-audit-red-team`; this step reads the code. A run which fails for good has a written replay or bulk-retry procedure, already tried on a preview. Read it; do not run it. Replay creates new runs, so it repeats every side effect this step did not make safe, and it reaches back only as far as the plan's history retention. A terminal failure with no replay path is lost work. **Done when:** every receiver and step has a verdict; replay path or the replacing finding recorded.
- [ ] **Step 7 — Races:** Read-modify-write with no lock, no conditional update, and no unique constraint. Partial writes: two or more mutations outside a transaction or stored procedure (e.g. client calls outside an RPC). Concurrent jobs on the same row or tenant with no concurrency key. Per job function, record `concurrency` (key and scope), `throttle`, `rateLimit`, `idempotency`, `retries`, and `onFailure` (or the platform's equivalents). A cron that can overlap its own previous run = finding. A function with no failure handler that leaves half-done state when it fails for good = finding. Unbounded work: loops over every tenant or every row, queries with no limit (database-side limits → `bkit-audit-database`), fan-out with no cap, payloads with no size limit. Vendor ceilings (e.g. pooler client limit, job concurrency cap, mail send rate, model rate limit) against the expected peak the product is sized for. A load test is proposed under `Process Improvements`, not run. **Done when:** every function's flow-control settings and every unbounded site have a verdict.
- [ ] **Step 8 — Time:** Product stores or sends user-local times → DST transitions, the timezone each cron runs in against the user-local time of what it sends, recurrence that crosses a DST change, month-end dates (the 31st, February). Name the test that pins each case; no test = finding. No user-local times → skip with evidence. **Done when:** each case names its test, or the skip is recorded.
- [ ] **Step 9 — Degradation:** Per dependency in `Surfaces`: what the user sees, and whether it is the right thing. A documented deliberate fallback is the model. Each dependency's failure is labelled with one upstream signal, so an outage reads as one thing and not as many bugs. Client can run with no network → a write made offline is queued or lost, and the user is told which; a reconnect does not submit it twice; no spinner waits forever. Walk one dependency per run on paper: take it down in reasoning, follow every call site, write what breaks. Rotate through `Surfaces` so every dependency gets a turn. Do not inject a fault. Live fault injection is a quarterly game day: one dependency taken down on a preview, under `bkit-audit-red-team` rules, as its own exercise, never inside this run. Record the date and outcome of the last game day; more than one quarter overdue = finding. Name the next dependency to fault-inject and the alert that must fire when it goes down. **Done when:** per-dependency answer and the paper walk are in `Degradation`; date, outcome, and next dependency are in `Game Day`.
- [ ] **Step 10 — Levers:** Per costly or risky subsystem that can be abused or can run away (paid model calls, inbound automation, scrapers, outbound fan-out): a lever that turns it off or down without a deploy (a flag, a kill switch, a throttle). Record who can pull it, how, and when it was last pulled or tested. A code change and a redeploy is not a lever. No lever = finding. A lever nobody has tried = finding. **Done when:** `Levers` row per subsystem: lever · who · how · last tested · verdict.
- [ ] **Step 11 — Recovery:** State RPO (how much data can be lost) and RTO (how long until it works again) per data store and per `Journeys` row, and compare them with what the setup delivers. Read the platform backup docs rather than assuming. The restore drill → `bkit-audit-database`; this step owns whether the targets are written down and achievable. Database backups often omit file storage, in-flight jobs, and the history a replay needs, plus DNS and access to each developer account. Per store, a recovery path or a finding. Per scenario, the recovery path and who can carry it out: a region outage (name the region); a vendor account suspended, or billing lapsed; a lost source-host organisation, deploy team, or a developer who alone holds an account; a key compromised and revoked. No path = finding. **Done when:** `Recovery` holds RPO, RTO, and each scenario's path, or the replacing finding.
- [ ] **Step 12 — Deploys:** Most outages follow a change. Version skew: a client loaded before a deploy keeps reaching the server code it was built against, where the platform offers that. The framework may not pin custom `fetch` calls from client components; check how those handle a newer server. Schema and code order: expand first, contract later, so either can roll back alone. Rollback speed: how long the last rollback took, or a drill of the rollback runbook. No drill and no measured rollback = finding. Progressive rollout: a staged rollout, or what stops a bad deploy reaching every user at once. Neither = finding. Old native clients cannot be rolled back. The API tolerates the oldest version still supported; a forced-update or minimum-version gate exists; update channels map to runtime versions. Record the oldest version seen in production traffic and how long it is supported. Store-side settings → `bkit-audit-app-store`. **Done when:** each check is met, a finding, or not applicable (why).
- [ ] **Step 13 — Alerts:** Map each failure mode from Steps 4–9 to the alert that would report it (error-tracker alerts, health endpoint, uptime monitors, canaries, data-freshness, and dropped-work signals). No alert = finding. An alert with no runbook that says what to do when it fires = finding. Whether the alarms fire → `bkit-audit-logs`; this step checks they cover what can break. An alert on a `Journeys` SLO is a burn-rate alert, long, and short windows as the Workbook recommends, not a raw threshold. When traffic is near zero, one failed request can look like an outage: a minimum request count or a synthetic probe behind each such alert. Each vendor's status feed reaches the alert channel. **Done when:** `Alerts` maps every failure mode to an alert, a runbook, and a sensitivity verdict.
- [ ] **Step 14 — Incidents:** Severity levels, an incident lead named per incident, and who is told at each level, and how. User communication: a status page or in-app banner that can tell users about an outage, and a message template. A drill, with its date. A process never rehearsed = finding. Incidents since the previous run: each has a blameless postmortem with owned action items; record which actions closed. A gap = finding, with a proposal. Do not file it; the report is the output. **Done when:** `Incidents` states each requirement met or a finding.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per REL05 best practice (BP01–BP07), REL11, REL13, and each SLO and error-budget checklist item → checked (name step) / not applicable (why) / finding. Each row also pass / partial / fail, with the evidence. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Everything changed since previous report's commit touching reliability (outbound calls and hosts, webhook receivers, job functions and flow-control settings, scheduled jobs, write paths, timeouts, and duration limits, alerts, and monitors) → one-line verdict each. (b) Bounded ~30 min pass: what a senior site reliability engineer flags that no step asks; read what happened since previous run (incidents and postmortems, log-audit sweeps, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Findings`.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Read-only:** no dependency taken down; no replay, send, charge, or restore executed; no alert or monitor changed.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Silent failure that drops or corrupts data with no user signal and no retry; charge or send that can happen twice with no reversal; hard dependency down takes a core journey down with no degraded path |
| `HIGH` | Silent write, or a double effect a person can repair; call with no timeout on a user-facing or job path; core failure mode with no alert; no written recovery target, or a target the setup cannot meet; costly subsystem with no emergency lever |
| `MEDIUM` | Journey with no SLO or no measurement; no error-budget policy; retry on a client error; overlapping scheduled job; unbounded loop or fan-out; alert with no runbook; untested lever; game day more than one quarter overdue; incident process never drilled |
| `LOW` | Soft dependency whose failure is unlabelled but the journey still succeeds; wording drift in an alert title |

Scale per `.bkit/jsonl.md` § Severity. Within a severity: money and data first, then a broken core action. A silent write, or a charge or send that can happen twice, is at least `HIGH`. Do not lower either because traffic is low.

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

### Surfaces

PENDING

### Journeys

PENDING

### Degradation

PENDING

### Game Day

PENDING

### Levers

PENDING

### Recovery

PENDING

### Alerts

PENDING

### Incidents

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
- [ ] **Summary:** names count per severity, journeys measured, and the dependency walked.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Game Day:** states the date and outcome of the last game day, or that none is recorded, and names the next dependency.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
