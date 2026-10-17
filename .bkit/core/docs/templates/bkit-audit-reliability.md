<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Reliability Audit

> [!CAUTION]
> **Purpose:** What the product does when a dependency is slow, down, or delivered twice: dropped errors, missing timeouts, unsafe retries, races, unbounded work, and failure modes no alert reports.
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
> - never take a dependency down, inject a fault, or change an alert, monitor, or flag. A game day is a separate exercise; this run only records its date and outcome.
> - never run a replay, retry, send, charge, or restore. Read the procedure only.

## Universal Instructions

### Context & Goals

Failure paths are least-tested: happy path is tested; vendor outage stays unwalked until it happens. Target failure: **a dependency is slow, down, or delivered twice, and the call site answers with success** — e.g. write whose error is dropped, route returns success, no event fires, no dashboard sees it. Each new call site drifts that answer.

**Applies when:** outbound calls, webhook receivers, background jobs, or write paths. None → one `N/A` row with evidence, never "clean".

**Cadence:** quarterly. Extra pass when a new vendor, webhook, or background job lands. Game day in `Degradation` is separate, also quarterly, on its own date; each run records when it last happened.

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
- What the user sees when a dependency is down; every dependency walked on paper; last game day recorded, not run.
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

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`. never retry or reword a blocked call to get past it.
- [ ] **Code Search:** Steps 2–12, 14, 16 — text search and language server for callers, e.g. ripgrep, Serena, `tsserver`. Language-server hits under-report; empty is inconclusive → corroborate with text search and name the tool. Fallback: text search only; name it per claim.
- [ ] **Web:** Step 15 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Metrics:** Hosted traces, errors, or health endpoint → Steps 3, 13 — SLO queries and alert config, e.g. Sentry, Datadog, Better Stack. Fallback: repo config only; live measurements `Not Checked`.
- [ ] **Job Platform:** Background jobs → Steps 6, 7 — flow control and replay docs, read-only, e.g. Inngest, Temporal. Log access: `.agents/context.md` `context-fetch` blocks below `bkit:end` are ready-made read-only readers (`bkit context list-blocks` → each block's `context` and `body`); set a body's `# Customise:` knobs to the audit window; run it via `direnv exec . bash`. Fallback: code only; live run history `Not Checked`.
- [ ] **Deploy Platform:** Hosted deploys → Step 12 — skew protection, rollout, rollback history, e.g. Vercel API, Cloud Run. Fallback: repo config only; dashboard settings `Not Checked`.
- [ ] **Vendor Status:** External dependencies → Step 13 — status feeds. Fallback: none; feeds `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Surfaces:** One table, kept run to run for diffs. Outbound calls (every SDK client and every `fetch` host); webhook receivers; background work (job functions and scheduled database jobs); write paths (routes and server actions that change data). Per dependency: hard (journey fails without it) or soft (degrades), and what it depends on in turn. Transitive counts (e.g. auth mail via mail vendor → mail outage is sign-in outage). Surface in code, not docs = finding; doc rewrite → `bkit-audit-documentation`. **Done when:** `Surfaces` lists every surface with hard/soft and transitive deps, or `N/A` and STOP.
- [ ] **Step 3 — Journeys:** Every user-reliant journey. Per journey: SLI as good/total ratio, SLO over rolling 28-day window, current measurement with query that produced it. Keep table run to run. No target, or target nobody measures = finding. Error-budget policy: what changes when budget spent (e.g. feature freeze, mandatory postmortem when one incident uses >20% of budget). Record whether policy triggered since previous run and whether obeyed. No policy = finding. **Done when:** `Journeys` row per journey: SLI · SLO · measurement and query · budget triggered · obeyed.
- [ ] **Step 4 — Dropped Errors:** Codebase-wide, not only errors that reached a log (`bkit-audit-logs` owns those). `catch` that neither rethrows, returns error, nor logs at `warn` or above; client calls whose error never read (e.g. Supabase `{ error }`, AWS SDK, Prisma); promises without `await` or `.catch`; broad catches turning every failure into one generic message so caller cannot tell timeout from bug. Dropped, never logged = invisible to user and operators; those first. Deliberate best-effort (telemetry, fire-and-forget notification) OK when code says so. Linter-catchable class (e.g. `@typescript-eslint/no-floating-promises`, unread client `error`) → name rule under `Process Improvements`; do not add it. Adding gate → `bkit-audit-gates`. **Done when:** every hit = finding with `file:line`.
- [ ] **Step 5 — Timeouts:** Per outbound call from `Surfaces`. Timeout (`fetch` none by default; SDK may or may not). No timeout holds function open until platform kills it. Each timeout × attempts + backoff fits inside calling function's duration limit; each inner timeout shorter than outer. Function killed at limit reports nothing; platform timeouts → `bkit-audit-logs`; this step owns budget. Bounded retries with backoff on worth-retrying errors (timeouts, 429, 5xx), never 4xx. Retries only on safe ops: retrying create, charge, or send without idempotency key does it twice. Background-job retry setting (e.g. Inngest `retries`) and re-run behavior per step. Model call has fallback model/provider list or degraded path without model. Models listed → `bkit-audit-models`. Token caps and evals → `bkit-audit-llm`. Credit-limit vs rate-limit responses distinct, not one generic retry: credit limit does not succeed on retry unless `Retry-After`; rate limit backs off (e.g. OpenRouter `402` / `429`). Shared outbound client with default timeout/retry → check bypasses; absent → propose under `Process Improvements`. Same wrapper copied → name for `bkit-audit-duplication`. **Done when:** every call from `Surfaces` has timeout, budget, retry, and safety verdict.
- [ ] **Step 6 — Idempotency:** Webhooks at-least-once; job step re-runs after failure. Per receiver/step, second run harmless: dedupe on provider event id, conditional update, or naturally idempotent. Side effects (email, charge, row insert) outside step run again on every retry. Outside caller repeating create → `bkit-audit-security` and `bkit-audit-red-team`; this step reads code. Run failed for good needs written replay/bulk-retry procedure, tried on preview — read only, do not run. Replay creates new runs → repeats side effects this step did not make safe; reaches back only as far as plan history retention. Terminal failure with no replay path = lost work. **Done when:** every receiver and step has verdict; replay path or replacing finding recorded.
- [ ] **Step 7 — Races:** Read-modify-write with no lock, conditional update, or unique constraint. Partial writes: two+ mutations outside transaction or stored procedure (e.g. client calls outside RPC). Concurrent jobs on same row/tenant with no concurrency key. Per job function: `concurrency` (key and scope), `throttle`, `rateLimit`, `idempotency`, `retries`, `onFailure` (or platform equivalents). Overlapping cron = finding. No failure handler leaving half-done state on terminal fail = finding. Unbounded work: loops over every tenant/row, queries with no limit (database-side limits → `bkit-audit-database`), fan-out with no cap, payloads with no size limit. Vendor ceilings (pooler client limit, job concurrency cap, mail send rate, model rate limit) vs expected peak product is sized for. Load test proposed under `Process Improvements`, not run. **Done when:** every function's flow-control settings and every unbounded site have verdict.
- [ ] **Step 8 — Time:** Product stores/sends user-local times → DST transitions, cron timezone vs user-local send time, recurrence crossing DST, month-end (31st, February). Name test pinning each case; no test = finding. No user-local times → skip with evidence. **Done when:** each case names test, or skip recorded.
- [ ] **Step 9 — Degradation:** Per `Surfaces` dependency: what user sees and whether right. Documented deliberate fallback is model. Each dependency failure labelled with one upstream signal so outage reads as one thing, not many bugs. Offline client: queued or lost write, user told which; reconnect does not double-submit; no infinite spinner. Walk every dependency on paper: take down in reasoning, follow call sites, write what breaks — no fault injection. Live injection = quarterly game day: one dependency down on preview, under `bkit-audit-red-team`, separate exercise, never this run. Record last game day date/outcome; >1 quarter overdue = finding. Name next dependency to fault-inject and alert that must fire when down. **Done when:** per-dependency answer and paper walk in `Degradation`; date, outcome, next dependency in `Game Day`.
- [ ] **Step 10 — Levers:** Per costly/risky subsystem abusable or runaway (paid model calls, inbound automation, scrapers, outbound fan-out): lever off/down without deploy (flag, kill switch, throttle). Record who pulls, how, last pulled/tested. Code change + redeploy is not a lever. No lever = finding; untried lever = finding. **Done when:** `Levers` row per subsystem: lever · who · how · last tested · verdict.
- [ ] **Step 11 — Recovery:** State RPO (data loss) and RTO (time to work again) per data store and per `Journeys` row; compare with setup delivers. Read platform backup docs, do not assume. Restore drill → `bkit-audit-database`; this step owns whether targets written and achievable. DB backups often omit file storage, in-flight jobs, replay history, DNS, developer account access. Per store: recovery path or finding. Per scenario: path and who carries it out — region outage (name region); vendor account suspended or billing lapsed; lost source-host org, deploy team, or sole-account developer; key compromised and revoked. No path = finding. **Done when:** `Recovery` holds RPO, RTO, each scenario path, or replacing finding.
- [ ] **Step 12 — Deploys:** Most outages follow a change. Version skew: client loaded pre-deploy keeps reaching server code it was built against where platform offers that. Framework may not pin custom client-side fetches (e.g. `fetch` from Next.js client components); check newer-server handling. Schema/code order: expand first, contract later so either rolls back alone. Rollback speed: last rollback duration or rollback runbook drill. No drill and no measured rollback = finding. Progressive rollout: staged rollout or what stops bad deploy reaching all users; neither = finding. Old native clients cannot roll back. API tolerates oldest supported version; forced-update/minimum-version gate; update channels map to runtime versions. Record oldest version in production traffic and support window. Store-side settings → `bkit-audit-app-store`. **Done when:** each check met, finding, or not applicable (why).
- [ ] **Step 13 — Alerts:** Map each Step 4–9 failure mode to alert (error-tracker, health endpoint, uptime monitors, canaries, data-freshness, dropped-work). No alert = finding; alert with no runbook = finding. Whether alarms fire → `bkit-audit-logs`; this step checks coverage. `Journeys` SLO alert = burn-rate, long and short windows per Workbook, not raw threshold. Near-zero traffic: one failed request can look like outage — minimum request count or synthetic probe behind alert. Each vendor status feed reaches alert channel. **Done when:** `Alerts` maps every failure mode to alert, runbook, sensitivity verdict.
- [ ] **Step 14 — Incidents:** Severity levels, incident lead per incident, who told at each level and how. User comms: status page or in-app banner for outage plus message template. Drill with date. Never rehearsed = finding. Incidents since previous run: each blameless postmortem with owned actions; record closed actions. Gap = finding with proposal; do not file — report is output. **Done when:** `Incidents` states each requirement met or finding.
- [ ] **Step 15 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per REL05 BP01–BP07, REL11, REL13, each SLO and error-budget checklist item → checked (name step) / not applicable (why) / finding. Each row pass / partial / fail with evidence. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 16 — Anything Else:** (a) Everything changed since previous report's commit touching reliability (outbound calls and hosts, webhook receivers, job functions and flow-control, scheduled jobs, write paths, timeouts and duration limits, alerts and monitors) → one-line verdict each. (b) Bounded ~30 min pass: what senior SRE flags that no step asks; read since previous run (incidents and postmortems, log-audit sweeps, new `docs/failures.jsonl` rows, vendor status incidents) — what would no step catch? **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

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

**Checkpoint.** Verify and check `[x]` all boxes below, then stop.

- [ ] **No placeholders:** Findings table and every `Report` section have no `PENDING`.
- [ ] **Summary:** names count per severity, journeys measured, and that every dependency was walked on paper.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Game Day:** states the date and outcome of the last game day, or that none is recorded, and names the next dependency.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
