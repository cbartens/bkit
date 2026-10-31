<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Reliability Audit

> [!CAUTION]
> **Purpose:** What the product does when a dependency is slow, down, or delivered twice: dropped errors, missing timeouts, unsafe retries, races, unbounded work, and failure modes no alert reports.
>
> **Rules:**
>
> - Never take a dependency down, inject a fault, or change an alert, monitor or flag.
> - A game day is a separate exercise. This run only records its date and outcome.
> - Never run a replay, retry, send, charge or restore. Read the procedure only.

## Universal Instructions

### Context & Goals

Failure paths are the least tested. The happy path is tested, while a vendor outage stays unwalked until it happens. The failure this audit targets is a dependency that is slow, down or delivered twice, while the call site answers with success. For example, a write whose error is dropped: the route returns success, no event fires, and no dashboard sees it. Each new call site drifts that answer.

**Applies when:** the product has outbound calls, webhook receivers, background jobs or write paths. **If** it has none → write one `N/A` row with its evidence, and never report the surface as "clean".

**Cadence:** Run once a quarter. Run an extra pass when a new vendor, webhook or background job lands. The game day in `Degradation` is a separate exercise, also run quarterly, on its own date. Each run records when it last happened.

**Anchor Standards:**

- Google SRE Workbook (online edition): Implementing SLOs, Alerting on SLOs (multi-window, multi-burn-rate), Example error budget policy.
- Google SRE Book (online edition): Postmortem Culture.
- AWS Well-Architected Framework, Reliability Pillar: REL05 BP01-BP07 (graceful degradation, throttling, retries, fail fast, client timeouts, stateless, emergency levers), REL11 (static stability), REL13 (disaster recovery). Record the publication date read.
- Background-job flow-control docs (e.g. Inngest concurrency and `createFunction`, Temporal task queues).
- bkit block of `docs/deployments.md` (bkit version from `.bkit/version`): § Production rollback runbook; § Dev rollback runbook; § Consumer rollback path; § Smoke trigger plumbing; § Applying migrations at deploy time; § Build-vs-migration race; § Promote before the lanes (`bkit-tests-deploy`)

### Scope

- List the outbound calls, webhook receivers, background work and write paths.
- Mark each dependency hard or soft, including transitive dependencies.
- Check the critical journeys, SLOs and the error-budget policy.
- Check for dropped errors, timeouts, retries, idempotency, races and unbounded work.
- Check user-local time, where the product schedules.
- Record what the user sees when a dependency is down.
- Walk every dependency on paper.
- Record the last game day, without running one.
- Check the emergency levers, recovery targets and disaster paths.
- Check deploys, old clients, alerts, runbooks and incident response.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Errors that already reached a log | That sweep reads them. This sweep covers failures that never reach a log | `bkit-audit-logs` |
| Grants, catalogue integrity, restore drill | The database sweep owns them | `bkit-audit-database` |
| Query plans and database-side limits | The database sweep owns them | `bkit-audit-database` |
| Live fault injection | It is a separate exercise, under that audit's rules | `bkit-audit-red-team` |
| Prompt bounds, call limits, evals | The LLM sweep owns them | `bkit-audit-llm` |
| Which model is called, deprecation, registry | The registry sweep owns them | `bkit-audit-models` |
| Copied wrappers as duplication | The duplication sweep owns them | `bkit-audit-duplication` |
| Adding a lint or test gate | The gates sweep owns it | `bkit-audit-gates` |
| Rewriting a doc that omits a surface | The docs sweep owns it | `bkit-audit-documentation` |
| Store-side version settings | The store sweep owns them | `bkit-audit-app-store` |
| Whether an outside caller is allowed to trigger a replay | The security sweep owns it. This audit still reads idempotency | `bkit-audit-security` |
| Changing code, alerts, or monitors | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Code Search:** Steps 2-12, 14, 16 — text search, and a language server for callers (e.g., ripgrep, Serena, `tsserver`). Language-server hits under-report, and an empty result is inconclusive, so corroborate with text search and name the tool. Fallback: text search only, and name the tool for each claim.
- [ ] **Web:** Step 15 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Metrics:** **If** there are hosted traces, errors or a health endpoint → Steps 3, 13 — SLO queries and alert config (e.g., Sentry, Datadog, Better Stack). Fallback: read the repo config only, and mark live measurements `Not Checked`.
- [ ] **Job Platform:** **If** there are background jobs → Steps 6, 7 — flow-control and replay docs, read-only (e.g., Inngest, Temporal). Log access: the `context-fetch` blocks below `bkit:end` in `.agents/context.md` are ready-made read-only readers. `bkit context list-blocks` prints each block's `context` and `body`. Set a body's `# Customise:` knobs to the audit window, and run it with `direnv exec . bash`. Fallback: read the code only, and mark live run history `Not Checked`.
- [ ] **Deploy Platform:** **If** deploys are hosted → Step 12 — skew protection, rollout and rollback history (e.g., Vercel API, Cloud Run). Fallback: read the repo config only, and mark dashboard settings `Not Checked`.
- [ ] **Vendor Status:** **If** there are external dependencies → Step 13 — status feeds. Fallback: there is none, so mark the feeds `Not Checked`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Surfaces:** Keep one table, run to run, so runs can be diffed. List the outbound calls (every SDK client and every `fetch` host), webhook receivers, background work (job functions and scheduled database jobs) and write paths (routes and server actions that change data). Mark each dependency hard (the journey fails without it) or soft (the journey degrades), and record what it depends on in turn. Transitive dependencies count: for example, when auth mail goes through a mail vendor, a mail outage is a sign-in outage. A surface that is in the code but not in the docs is a finding. The doc rewrite goes to `bkit-audit-documentation`. **Done when:** `Surfaces` lists every surface with hard/soft and its transitive dependencies, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Journeys:** List every journey users rely on. For each journey, record the SLI as a good/total ratio, the SLO over a rolling 28-day window, and the current measurement with the query that produced it. Keep the table run to run. A journey with no target, or with a target nobody measures, is a finding. Read the error-budget policy: what changes when the budget is spent (e.g., a feature freeze, or a mandatory postmortem when one incident uses more than 20% of the budget). Record whether the policy triggered since the previous run, and whether it was obeyed. No policy is a finding. **Done when:** `Journeys` has one row per journey: SLI · SLO · measurement and query · budget triggered · obeyed.
- [ ] **Step 4 — Dropped Errors:** Search the whole codebase, not only the errors that reached a log (`bkit-audit-logs` owns those). Look for a `catch` that neither rethrows, returns an error nor logs at `warn` or above; client calls whose error is never read (e.g., Supabase `{ error }`, AWS SDK, Prisma); promises without `await` or `.catch`; and broad catches that turn every failure into one generic message, so the caller cannot tell a timeout from a bug. An error that is dropped and never logged is invisible to users and operators, so list those first. Deliberate best effort (telemetry, a fire-and-forget notification) is fine when the code says so. **If** a class is linter-catchable (e.g., `@typescript-eslint/no-floating-promises`, an unread client `error`) → name the rule under `Process Improvements`, and do not add it. Adding a gate goes to `bkit-audit-gates`. **Done when:** every hit is a finding with `file:line`.
- [ ] **Step 5 — Timeouts:** Check each outbound call in `Surfaces`. Check the timeout: `fetch` has none by default, and an SDK may or may not. A call with no timeout holds the function open until the platform kills it. Check that each timeout times the attempts, plus backoff, fits inside the calling function's duration limit, and that each inner timeout is shorter than the outer one. A function killed at its limit reports nothing. Platform timeouts go to `bkit-audit-logs`, and this step owns the budget. Check that retries are bounded, with backoff, on errors worth retrying (timeouts, 429, 5xx), and never on 4xx. Check that retries run only on safe operations: retrying a create, charge or send without an idempotency key does it twice. Check the background-job retry setting (e.g., Inngest `retries`), and how each step behaves when re-run. Check that a model call has a fallback model or provider list, or a degraded path without a model. Listing models goes to `bkit-audit-models`. Token caps and evals go to `bkit-audit-llm`. Check that credit-limit and rate-limit responses are handled apart, not by one generic retry: a credit limit does not succeed on retry unless there is a `Retry-After`, and a rate limit backs off (e.g., OpenRouter `402` / `429`). **If** a shared outbound client sets a default timeout, a default retry or both → check for calls that bypass it. **Else** → propose one under `Process Improvements`. **If** the same wrapper is copied → name it for `bkit-audit-duplication`. **Done when:** every call in `Surfaces` has a timeout, budget, retry and safety verdict.
- [ ] **Step 6 — Idempotency:** Webhooks arrive at least once, and a job step re-runs after a failure. For each receiver and step, check that a second run is harmless: it dedupes on the provider event id, uses a conditional update, or is naturally idempotent. Side effects (email, charge, row insert) outside a step run again on every retry. An outside caller repeating a create goes to `bkit-audit-security` and `bkit-audit-red-team`. This step reads the code. A run that failed for good needs a written replay or bulk-retry procedure, tried on preview. Read it only, and do not run it. A replay creates new runs, so it repeats the side effects this step did not make safe, and it reaches back only as far as the plan's history retention. A terminal failure with no replay path is lost work. **Done when:** every receiver and step has a verdict, and the replay path, or the finding that replaces it, is recorded.
- [ ] **Step 7 — Races:** Find read-modify-write with no lock, conditional update or unique constraint. Find partial writes: two or more mutations outside a transaction or stored procedure (e.g., client calls outside an RPC). Find concurrent jobs on the same row or tenant with no concurrency key. For each job function, record `concurrency` (key and scope), `throttle`, `rateLimit`, `idempotency`, `retries` and `onFailure`, or the platform's equivalents. An overlapping cron is a finding. A missing failure handler that leaves half-done state on a terminal failure is a finding. Find unbounded work: loops over every tenant or row, queries with no limit (database-side limits go to `bkit-audit-database`), fan-out with no cap, and payloads with no size limit. Compare the vendor ceilings (pooler client limit, job concurrency cap, mail send rate, model rate limit) with the expected peak the product is sized for. Propose a load test under `Process Improvements`, and do not run it. **Done when:** every function's flow-control settings and every unbounded site have a verdict.
- [ ] **Step 8 — Time:** **If** the product stores or sends user-local times → check DST transitions, the cron timezone against the user-local send time, recurrence that crosses DST, and month-end (the 31st, February). Name the test that pins each case. A case with no test is a finding. **If** there are no user-local times → skip with evidence. **Done when:** each case names its test, or the skip is recorded.
- [ ] **Step 9 — Degradation:** For each dependency in `Surfaces`, record what the user sees and whether it is right. A documented, deliberate fallback is the model to follow. Check that each dependency failure is labelled with one upstream signal, so an outage reads as one thing, not many bugs. Check an offline client: a write is queued or lost, and the user is told which; reconnecting does not double-submit; and no spinner runs forever. Walk every dependency on paper: take it down in your reasoning, follow its call sites, and write what breaks. Inject no fault. Live injection is the quarterly game day: one dependency taken down on preview, under `bkit-audit-red-team`, as a separate exercise, never in this run. Record the date and outcome of the last game day. A game day more than one quarter overdue is a finding. Name the next dependency to fault-inject, and the alert that must fire when it is down. **Done when:** `Degradation` holds the answer for each dependency and the paper walk, and `Game Day` holds the date, the outcome and the next dependency.
- [ ] **Step 10 — Levers:** For each costly or risky subsystem that could be abused or run away (paid model calls, inbound automation, scrapers, outbound fan-out), find a lever that turns it off or down without a deploy (a flag, kill switch or throttle). Record who pulls it, how, and when it was last pulled or tested. A code change plus a redeploy is not a lever. No lever is a finding, and an untried lever is a finding. **Done when:** `Levers` has one row per subsystem: lever · who · how · last tested · verdict.
- [ ] **Step 11 — Recovery:** State the RPO (data loss) and RTO (time until it works again) for each data store and each `Journeys` row, and compare them with what the setup delivers. Read the platform's backup docs, and do not assume. The restore drill goes to `bkit-audit-database`. This step owns whether the targets are written and achievable. Database backups often omit file storage, in-flight jobs, replay history, DNS and developer account access. For each store, record a recovery path or a finding. For each scenario, record the path and who carries it out: a region outage (name the region); a vendor account suspended or its billing lapsed; a lost source-host org, deploy team or sole-account developer; and a key compromised and revoked. No path is a finding. **Done when:** `Recovery` holds the RPO, the RTO and each scenario's path, or the finding that replaces it.
- [ ] **Step 12 — Deploys:** Most outages follow a change. Check version skew: where the platform offers it, a client loaded before a deploy keeps reaching the server code it was built against. The framework may not pin custom client-side fetches (e.g., `fetch` from Next.js client components), so check how a newer server handles them. Check the schema and code order: expand first and contract later, so either can roll back alone. Check rollback speed: the duration of the last rollback, or a drill of the rollback runbook. No drill and no measured rollback is a finding. Check progressive rollout: a staged rollout, or whatever stops a bad deploy reaching all users. Neither is a finding. Old native clients cannot roll back, so check that the API tolerates the oldest supported version, that a forced-update or minimum-version gate exists, and that update channels map to runtime versions. Record the oldest version in production traffic and the support window. Store-side settings go to `bkit-audit-app-store`. **Done when:** each check is met, a finding, or not applicable (saying why).
- [ ] **Step 13 — Alerts:** Map each failure mode from Steps 4-9 to an alert (error tracker, health endpoint, uptime monitors, canaries, data freshness, dropped work). No alert is a finding, and an alert with no runbook is a finding. Whether alarms fire goes to `bkit-audit-logs`. This step checks coverage. A `Journeys` SLO alert is a burn-rate alert, with long and short windows as the Workbook describes, not a raw threshold. At near-zero traffic, one failed request can look like an outage, so check that a minimum request count or a synthetic probe sits behind the alert. Check that each vendor status feed reaches the alert channel. **Done when:** `Alerts` maps every failure mode to an alert, a runbook and a sensitivity verdict.
- [ ] **Step 14 — Incidents:** Check for severity levels, an incident lead per incident, and who is told at each level and how. Check user comms: a status page or in-app banner for an outage, plus a message template. Check for a drill with a date. A process never rehearsed is a finding. For each incident since the previous run, check for a blameless postmortem with owned actions, and record the closed actions. A gap is a finding with a proposal. Do not file it, because the report is the output. **Done when:** `Incidents` states that each requirement is met, or gives its finding.
- [ ] **Step 15 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per REL05 BP01-BP07, REL11, REL13, and each SLO and error-budget checklist item, each marked checked (naming the step), not applicable (saying why) or finding. Mark each row pass, partial or fail, with evidence. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 16 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches reliability: outbound calls and hosts, webhook receivers, job functions and flow control, scheduled jobs, write paths, timeouts and duration limits, and alerts and monitors. (b) In a bounded pass of about 30 minutes, note what a senior SRE would flag that no step asks about. Read what happened since the previous run (incidents and postmortems, log-audit sweeps, new `docs/failures.jsonl` rows, vendor status incidents), and ask what no step would catch. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Read-only:** no dependency was taken down.
- [ ] **No side effects:** no replay, send, charge or restore ran.
- [ ] **Alerts unchanged:** no alert or monitor changed.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | A silent failure drops or corrupts data with no user signal and no retry. A charge or send can happen twice with no reversal. A hard dependency going down takes a core journey down with no degraded path |
| `HIGH` | A silent write, or a double effect a person can repair. A call with no timeout on a user-facing or job path. A core failure mode with no alert. No written recovery target, or a target the setup cannot meet. A costly subsystem with no emergency lever |
| `MEDIUM` | A journey with no SLO or no measurement. No error-budget policy. A retry on a client error. An overlapping scheduled job. An unbounded loop or fan-out. An alert with no runbook. An untested lever. A game day more than one quarter overdue. An incident process never drilled |
| `LOW` | A soft dependency whose failure is unlabelled, while the journey still succeeds. Wording drift in an alert title |

Within a severity, list money and data first, then a broken core action. A silent write, or a charge or send that can happen twice, is at least `HIGH`. Do not lower either because traffic is low.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity, the journeys measured, and a statement that every dependency was walked on paper.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Game Day:** `Game Day` states the date and outcome of the last game day, or that none is recorded, and names the next dependency.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
