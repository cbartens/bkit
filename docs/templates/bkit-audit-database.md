<!-- Note: Reports live at `docs/audits/{YYYYMM}/{slug}.md`. `{YYYYMM}` = UTC month of this run. `{slug}` = template basename without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md` (`{TIMESTAMP}` = `date -u +%Y%m%dT%H%M%SZ`). Never overwrite. The report is stamped with a `bkit:anchor` block recording the audited commit (`baseSha`) and branch (`baseRef`); never hand-author or edit it. `@bkit-audit-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.2.3 — do not edit; run `bkit upgrade` to refresh -->

# Database Audit

> [!CAUTION]
> **Purpose:** Catalogue-backed check of privileges, access coverage, migrations, integrity, capacity, and restore.
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
> - Remote catalogue queries ONLY use `SELECT` (non-relational: read-only reads); writes run locally, or in explicitly rolled-back transactions; ALWAYS check remote unchanged.
> - NEVER push schema to remote by hand; NEVER hard-delete; restore target = throwaway, deleted before report finishes.
> - Every claim names the environment it ran against.

## Universal Instructions

### Context & Goals

Migrations and integration tests exercise queries; neither verifies privileges, policies, or constraints match code assumptions. Target failure: **a control that reads as enforced in migration text and is not enforced in the live catalogue** — e.g. `REVOKE` undone by platform default privileges, tenant table with no row-level policy, `CHECK` evaluating `NULL` (not `FALSE`) for the shape it should reject. Only the catalogue knows → query it.

**Applies when:** migrations, schema file, or DB client in a manifest. None → one `N/A` row with evidence, never "clean". Relational DB → all steps. Non-relational store (e.g. Firestore, DynamoDB, MongoDB) → Steps 1–4, 6–9, 12–13, 17–19 against its own mechanism (e.g. Firestore security rules, IAM policies, admin SDK vs client SDK); Steps 5, 10–11, 14–16 only where it has an equivalent, else `N/A` with evidence.

**Cadence:** monthly. Extra pass when a migration adds a privileged function, changes access policy, or adds a tenancy-scoped table.

**Anchor Standards:** record version and date read. Newer version → `Standards` step reads what changed.

- Platform production checklist and security guide (e.g. Supabase).
- Platform advisors and inspection CLI (e.g. Supabase Advisors, `supabase inspect db`); record CLI version.
- Platform backup / restore docs.
- Platform serverless connection guidance.
- DB routine-maintenance docs, edition = hosted major (e.g. PostgreSQL Routine Database Maintenance Tasks).
- Safe-migration rule set (e.g. Squawk); record version.

### Scope

- Catalogue privileges: functions, tables, sequences.
- Role each code write actually runs as.
- Row-level access coverage; exposure outside main schema (file storage, change feeds, views, exposed schemas).
- Migration hygiene, data integrity, derived data, data removal.
- Capacity, vacuum, connections, timeouts.
- Restore against recovery targets.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Policy predicate correctness; route reachability | Correctness, not coverage | `bkit-audit-security` |
| Lawful basis / retention periods for personal data | Data lifecycle | `bkit-audit-privacy` |
| Request latency outside the DB | Hot paths | `bkit-audit-app-performance` |
| Applying fixes | Audit reports only | Plan from this report |

### Pre-Flight / Dependencies

**Checkpoint:** Check off all core items. Check conditional items only when applicable. Each item: available → tool and version; missing → fallback, gap in `Not Checked`, fix in `Process Improvements`. Unnamed gap reads as passed. never abort for a missing capability.

**Credentials:** probe direnv before marking a token / env var missing: `direnv exec . sh -c '[ -n "${VAR}" ] && echo set || echo unset'`; `unset` = missing. Run credentialed CLIs as `direnv exec . <cmd>`. No direnv (cloud session) → plain env check. Report names, never values.

#### Core

Always verify.

- [ ] **Permissions:** Before Step 1 — one cheap read-only call per tool this run uses (every item below, every rule under `Project Instructions` `Permissions`), e.g. `gh run list --limit 1`, one MCP read, one anchor-standard fetch. Blocked / denied (here or in any step) → record call verbatim and narrow allow rule clearing it (e.g. `Bash(gh run list *)`) in `Not Checked`, `Process Improvements`, and `Project Instructions` `Permissions`; run every step the remaining tools allow; work needing blocked call → `Not Checked`. never stop the run for a blocked call; never retry or reword a blocked call to get past it.
- [ ] **Catalogue Read:** Steps 3–16 — read-only SQL (or store's read-only API) per environment, e.g. platform MCP `execute_sql`, `psql` as read-only role. Fallback: local DB from migrations; remote claims = hypotheses.
- [ ] **Local DB:** Steps 2, 10, 14 — replayable from migrations. Fallback: rolled-back transactions and remote re-check.
- [ ] **Web:** Step 18 — fetch anchor standards. Fallback: versions recorded as unread.

#### Conditional

Verify only when applicable.

- [ ] **Platform Advisors:** Managed platform → Step 3 — e.g. Supabase MCP `get_advisors`. Fallback: equivalent catalogue queries.
- [ ] **Platform Settings:** Managed platform → Steps 4, 17 — network, MFA, owners, backups, point-in-time recovery, e.g. dashboard, management API. Fallback: none; items `Not Checked`.
- [ ] **Inspection CLI:** Platforms with one → Steps 14–16 — e.g. `supabase inspect db`. Fallback: engine statistics views, e.g. `pg_stat_*`.
- [ ] **Migration Linter:** SQL migrations → Step 10 — e.g. Squawk. Fallback: apply its rules by reading.
- [ ] **Restore Target:** Hosted DB → Step 17 — permission and tier to create throwaway project. Fallback: none; absence = finding.

### 🔒 Gate 1: Prerequisites Check

**Checkpoint.** Verify and check `[x]` all applicable boxes above, then continue to `Probe Steps` without asking.

- [ ] **Gaps named:** every missing item names its fallback and `Not Checked` entry.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** Audited commit = this report's `bkit:anchor` `baseSha`. Read newest prior report for this slug under `docs/audits/`; its commit = its `bkit:anchor` `baseSha`, else the HEAD its `Previous Run` recorded. Count findings fixed / still open; age of oldest open. Open after 2 runs → re-raise with age. **Done when:** closure rate in `Previous Run`, or run marked baseline.
- [ ] **Step 2 — Detect:** Find migrations / schema file / DB client. Confirm local DB matches migrations before trusting local measurements. Schema doc absent, migrations exist → missing doc = finding; still read migrations. **Done when:** evidence in `Checked`, or `N/A` and STOP.
- [ ] **Step 3 — Advisors:** Run platform security and performance advisors; each row = candidate, not finding. One line per lint the platform's advisor runs, even when clean (e.g. Supabase: unindexed FKs, duplicate indexes, per-row auth in policy, multiple permissive policies, mutable function `search_path`, extension in public schema, exposed table without row-level security, owner-rights view). No advisor → engine-appropriate subset by catalogue query; rest `N/A`. Cite platform fix pattern per finding. **Done when:** every row dispositioned in `Advisors`.
- [ ] **Step 4 — Checklist:** Walk platform production checklist against production, not memory: transport encryption enforced, network restrictions, org MFA, >1 owner, point-in-time recovery where size / RPO needs it, compute sized for `Connections` peak. **Done when:** every item met / not met (finding) / not applicable (why).
- [ ] **Step 5 — Inventory:** Count tables, migrations, extensions. Applied vs directory, both directions — drift invalidates downstream. Hosted major vs platform support window; extensions blocking next major. **Done when:** counts, drift, version in `Environment`.
- [ ] **Step 6 — Grants:** Catalogue, never migration text. Every function: definer-rights? executable by which client roles (e.g. `pg_proc` and ACL)? Definer-rights + anonymous-executable = finding unless body checks caller identity — read body. Every privileged function since previous report = candidate. Same for table / sequence grants to anonymous role. **Done when:** `Grants` lists every privileged function and anonymous grant with verdict.
- [ ] **Step 7 — Write Roles:** `Grants` = who may write; this = who code writes as. Per table whose writes need a role the request path lacks: every write site incl. SQL functions (search table name — language servers miss string literals) → client used (user-scoped = user role; admin = privileged role, e.g. Supabase service role) → compare with grant. Ungranted = finding; ungranted with error never read / dropped = `CRITICAL` (silent fail every call). **Done when:** `Write Roles` row per site: table · `file:line` · role at site · role granted · error checked · verdict.
- [ ] **Step 8 — Coverage:** Every tenancy-scoped table: tenancy enforced at one recorded layer — DB row policy (e.g. Postgres RLS: control on, >=1 policy, deny default) or one app-layer scope every query goes through (e.g. Rails default scope, Django manager). Scope column, neither layer = finding. Control on, 0 policies = deny-all (safe, usually mistake). Coverage only; correctness → `bkit-audit-security`. Policy / scope test must fail when removed — denials can surface as silent zero rows. **Done when:** `Coverage` row per table: layer · policy count or scope · scope column · verdict.
- [ ] **Step 9 — Exposure:** `Coverage` keys on scope columns; check other paths (coverage only): file-storage policies and public buckets; change-feed publications and row-level control per published table; owner-rights views bypassing caller policies (e.g. no `security_invoker`); API-served schemas with internal tables. **Done when:** `Exposure` row per surface with verdict.
- [ ] **Step 10 — Migrations:** Since previous report: shared timestamps (directory and open branches); guarded DDL (`IF [NOT] EXISTS`) without trailing catalogue re-query assertion (typo → silent no-op, still applied); schema change without regenerated DB types (where generated); constraints that cannot fire (`NULL` not `FALSE`) → probe with rolled-back `INSERT`; lock-unsafe DDL (e.g. Postgres: non-`CONCURRENTLY` index, constraint without `NOT VALID` + later `VALIDATE`, type change, `NOT NULL` on existing column, no `lock_timeout`) via safe-migration linter or its rules — say which; drop / rename still read by previous deployed build or oldest supported client. **Done when:** every hit = finding with file.
- [ ] **Step 11 — Integrity:** FK `ON DELETE` writing to immutability-guarded table (referenced delete fails); hard-delete beside soft-delete convention, or cascades bypassing it; audit / CDC triggers present where meant and stream receiving rows (env flags can disable); orphans in deliberately FK-less tables; every timestamp without time zone → intended zone and all writers agree. **Done when:** every hit = finding with query.
- [ ] **Step 12 — Derived Data:** List stores computed from others (caches, denormalised columns, counters, materialised views, scheduled rebuilds). Each: one shared writer (writes elsewhere = finding); every source write path calls it (source paths minus writer's callers = finding); something checks copy vs source. Only safety net = next rebuild → state how long users see wrong data. **Done when:** row per store with those three answers.
- [ ] **Step 13 — Removal:** Per personal-data table: retention period and purge job; soft-deleted rows ever hard-deleted, when; account deletion reaches every copy (caches, audit stream, embeddings, file storage, backups). No period, or period without job = finding. **Done when:** `Retention` row per table: data · retention · purge job · erasure covers · verdict.
- [ ] **Step 14 — Capacity:** Series vs previous report: table sizes and rows, largest / unused indexes, seq scans on large tables, inspection-suite outputs (e.g. outliers, calls, index stats, bloat, vacuum stats, table stats, locks, blocking, long-running, replication slots, cache hit). Top 10 by total and mean time → query plan (e.g. `EXPLAIN (ANALYZE, BUFFERS)`) locally or rolled back; plan changes; stats reset time. Housekeeping tables (job history, HTTP logs, audit, auth audit) size, growth, purge. 32-bit key / sequence >50% of max. Disk vs limit, IO vs tier caps, cache hit ratios. Measure query time in DB, not app traces (network dominates). **Done when:** series in `Capacity`; each threshold breach = finding.
- [ ] **Step 15 — Vacuum:** Vacuuming engine (e.g. Postgres) → transaction-ID age per DB and largest tables; dead-tuple ratio, last autovacuum / autoanalyze per hot table. Not vacuumed since previous report, or ID age climbing = finding. Other engine → its routine maintenance (e.g. SQLite `VACUUM`, InnoDB purge lag), or skip with evidence. **Done when:** numbers in `Capacity`, or skip recorded.
- [ ] **Step 16 — Connections:** Connection limit and pooler size vs peak by application and role. Serverless direct connections → transaction-mode pooler, pool of 1, prepared statements off (or platform equivalent). Idle-in-transaction count and age. Statement and idle-in-transaction timeouts per client / admin role; neither = finding. **Done when:** numbers and each client constructor read in `Capacity`.
- [ ] **Step 17 — Restore:** (a) From source, list every outbound side effect a clone fires (scheduled jobs, HTTP-calling triggers / functions, DB webhooks, foreign-data wrappers) and how each stops: logical restore stripping them first / fails closed in clone / unscheduled right after restore (harmless first run only). Reaches real users or payments without failing closed → no binary restore. No plan → finding, do not restore. (b) Restore latest backup to throwaway target; schema matches migrations; time taken and data lost; delete target. (c) Record backup type, retention, point-in-time recovery, RTO, RPO. No written targets = finding. Retention < time to notice silent corruption = finding. (d) Logical backup outside platform account: age; restore notes cover key material backups never contain. None = finding. **Done when:** `Restore` holds side-effect plan and result, or the replacing finding.
- [ ] **Step 18 — Standards:** Confirm current version per anchor standard; read changes since previous report's version. `Standards Coverage`: one row per checklist item, advisor lint, inspection report → checked (name step) / not applicable (why) / finding. Unapplied recommended practice → adopt (propose step) / reject (why) / not applicable. **Done when:** no empty row.
- [ ] **Step 19 — Anything Else:** (a) Everything changed since previous report's commit touching DB (migrations, tables / columns, functions and grants, policies, extensions, scheduled jobs, buckets, publications, new DB clients) → one-line verdict each. (b) Bounded ~30 min pass: what a senior DBA flags that no step asks; read since previous run (incidents, new `docs/failures.jsonl` rows) — what would no step catch? Include anything catalogue / logs / advisors surfaced unchecked, with query for next run. **Done when:** `Beyond the Steps` holds both passes, or `none`. Class seen on 2 runs → propose step in `Process Improvements`.

### 🔒 Gate 2: Probes Check

**Checkpoint.** Verify and check `[x]` all boxes below, then continue to `Findings` without asking.

- [ ] **Steps complete:** every step `[x]`, or explicit skip with evidence the surface is absent.
- [ ] **Evidence:** every finding cites re-checkable evidence and the tool behind it.
- [ ] **Environments:** every finding names the environment it ran against.
- [ ] **Remote untouched:** no remote database changed; throwaway restore target deleted.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Tenant data readable / writable across tenants or by anonymous role; anonymous-executable privileged function without identity check; write failing silently every call; migration dropping data without backfill |
| `HIGH` | Tenancy table with no enforcing layer (no row policy, no app-layer scope); public bucket / owner-rights view exposing tenant data; constraint that cannot fire; lock-unsafe migration on live table; no proven restore, no recovery targets, or no off-platform backup; applied migrations ≠ directory |
| `MEDIUM` | Missing index the query shape needs; housekeeping table without purge; vacuum lag; sequence >50%; role without timeouts; derived data without agreement check; schema doc ≠ migrations |
| `LOW` | Deny-all table without policies; naming drift changing neither access nor results |

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

### Environment

PENDING

### Advisors

PENDING

### Checklist

PENDING

### Grants

PENDING

### Write Roles

PENDING

### Coverage

PENDING

### Exposure

PENDING

### Retention

PENDING

### Capacity

PENDING

### Restore

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
- [ ] **Summary:** names count per severity and environments measured.
- [ ] **Series:** every series beside previous report's numbers, or marked baseline.
- [ ] **Writes:** only this report and template `Project Instructions` changed; throwaway worktrees / remote targets removed.
- [ ] **Process Improvements:** `Universal` = proposed step changes, template untouched; `Project` = edits applied below `bkit:end`; each `none` if empty.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

> `Project Instructions` below `bkit:end` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add project-specific tools, paths, commands, and checks there, keyed by section or step title; never results.

<!-- bkit:end -->

## Project Instructions
