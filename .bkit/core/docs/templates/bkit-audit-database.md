<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

<!-- Note: @bkit-audit-generate fills this template. The report lives at `docs/audits/{YYYYMM}/{slug}.md`, where `{YYYYMM}` is the UTC month of the run and `{slug}` is this file's name without `bkit-audit-` and `.md`. **If** that month already has `{slug}.md` or `{slug}-{TIMESTAMP}.md` → write `{slug}-{TIMESTAMP}.md`, where `{TIMESTAMP}` is the output of `date -u +%Y%m%dT%H%M%SZ`. NEVER overwrite an earlier report. The report is stamped with a `bkit:anchor` block that records the audited commit (`baseSha`) and branch (`baseRef`). NEVER write or edit that block by hand. -->

# Database Audit

> [!CAUTION]
> **Purpose:** A catalogue-backed check of privileges, access coverage, migrations, integrity, capacity and restore.
>
> **Rules:**
>
> - Query a remote catalogue ONLY with `SELECT`. For a non-relational store, use ONLY its read-only reads.
> - Run writes ONLY locally, or inside a transaction you roll back explicitly.
> - Always check afterwards that the remote is unchanged.
> - NEVER push schema to a remote by hand.
> - NEVER hard-delete.
> - Restore ONLY into a throwaway target, and delete it before the report finishes.
> - Name the environment each claim ran against.

## Universal Instructions

### Context & Goals

Migrations and integration tests exercise queries, but neither checks that privileges, policies and constraints match what the code assumes. The failure this audit targets is **a control that reads as enforced in the migration text but is not enforced in the live catalogue**: for example, a `REVOKE` undone by the platform's default privileges, a tenant table with no row-level policy, or a `CHECK` that evaluates to `NULL` (not `FALSE`) for the shape it should reject. Only the catalogue knows, so query it.

**Applies when:** migrations, a schema file or a DB client appear in a manifest. **If** none appears → write one `N/A` row with its evidence, and never report the surface as "clean". **If** the DB is relational → run every step. **If** it is a non-relational store (e.g. Firestore, DynamoDB, MongoDB):

- Run Steps 1-4, 6-9, 12-13 and 17-19 against its own mechanism (e.g. Firestore security rules, IAM policies, admin SDK vs client SDK).
- **If** the store has an equivalent for one of Steps 5, 10-11 and 14-16 → run that step against it.
- **Else** → write `N/A` for that step, with evidence.

**Cadence:** Run once a month. Run an extra pass when a migration adds a privileged function, changes an access policy or adds a tenancy-scoped table.

**Anchor Standards:**

- Platform production checklist and security guide (e.g. Supabase).
- Platform advisors and inspection CLI (e.g. Supabase Advisors, `supabase inspect db`); record CLI version.
- Platform backup / restore docs.
- Platform serverless connection guidance.
- DB routine-maintenance docs, edition = hosted major (e.g. PostgreSQL Routine Database Maintenance Tasks).
- Safe-migration rule set (e.g. Squawk); record version.
- bkit block of `docs/setup.md` (bkit version from `.bkit/version`): Rules

### Scope

- Check the catalogue privileges on functions, tables and sequences.
- Find the role each write in the code actually runs as.
- Check the row-level access coverage, and the exposure outside the main schema (file storage, change feeds, views, exposed schemas).
- Check migration hygiene, data integrity, derived data and data removal.
- Measure capacity, vacuum, connections and timeouts.
- Prove a restore against the recovery targets.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why | Where it belongs |
| --- | --- | --- |
| Policy predicate correctness; route reachability | The security audit owns correctness | `bkit-audit-security` |
| Lawful basis and retention periods for personal data | The privacy audit owns the data lifecycle | `bkit-audit-privacy` |
| Request latency outside the DB | The app-performance audit owns hot paths | `bkit-audit-app-performance` |
| Applying fixes | The audit only reports | A plan made from this report |

### Pre-Flight / Dependencies

#### Core

- [ ] **Permissions:** every blocked call is recorded.
- [ ] **Catalogue Read:** Steps 3-16 — read-only SQL, or the store's read-only API, for each environment (e.g., platform MCP `execute_sql`, `psql` as a read-only role). Fallback: use a local DB built from the migrations, and treat remote claims as hypotheses.
- [ ] **Local DB:** Steps 2, 10, 14 — a DB replayable from the migrations. Fallback: use rolled-back transactions, and re-check the remote afterwards.
- [ ] **Web:** Step 18 — fetch the anchor standards. Fallback: record the versions as unread.

#### Conditional

- [ ] **Platform Advisors:** **If** the platform is managed → Step 3 — the platform's advisors (e.g., Supabase MCP `get_advisors`). Fallback: run the equivalent catalogue queries.
- [ ] **Platform Settings:** **If** the platform is managed → Steps 4, 17 — network, MFA, owners, backups and point-in-time recovery (e.g., dashboard, management API). Fallback: none. Mark those items `Not Checked`.
- [ ] **Inspection CLI:** **If** the platform has one → Steps 14-16 — the inspection CLI (e.g., `supabase inspect db`). Fallback: read the engine's statistics views (e.g., `pg_stat_*`).
- [ ] **Migration Linter:** **If** the migrations are SQL → Step 10 — a safe-migration linter (e.g., Squawk). Fallback: apply its rules by reading.
- [ ] **Restore Target:** **If** the DB is hosted → Step 17 — the permission and tier to create a throwaway project. Fallback: none. A missing restore target is a finding.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Gaps named:** every missing item names its fallback and its `Not Checked` entry.
- [ ] **Gate 1 — Verified:** every Core item and every applicable Conditional item is checked.

### Probe Steps

- [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
- [ ] **Step 2 — Detect:** Find the migrations, schema file or DB client. Confirm the local DB matches the migrations before trusting any local measurement. **If** migrations exist but the schema doc does not → the missing doc is a finding, and still read the migrations. **Done when:** `Checked` holds evidence, or `N/A` is recorded → **STOP**.
- [ ] **Step 3 — Advisors:** Run the platform's security and performance advisors. Each advisor row is a candidate, not a finding. Write one line for each lint the platform's advisor runs, even when it is clean (e.g., Supabase: unindexed FKs, duplicate indexes, per-row auth in a policy, multiple permissive policies, mutable function `search_path`, an extension in the public schema, an exposed table without row-level security, an owner-rights view). **If** there is no advisor → run the subset that fits the engine as catalogue queries, and mark the rest `N/A`. Cite the platform's fix pattern for each finding. **Done when:** every row in `Advisors` has a disposition.
- [ ] **Step 4 — Checklist:** Walk the platform production checklist against production, not memory: transport encryption enforced, network restrictions, org MFA, more than one owner, point-in-time recovery where size or RPO needs it, and compute sized for the `Connections` peak. **Done when:** every item is marked met, not met (a finding) or not applicable (saying why).
- [ ] **Step 5 — Inventory:** Count the tables, migrations and extensions. Compare the applied migrations with the directory in both directions, because drift invalidates every later step. Check the hosted major version against the platform's support window, and list the extensions that block the next major. **Done when:** the counts, drift and version are in `Environment`.
- [ ] **Step 6 — Grants:** Read grants from the catalogue, never from migration text. For every function, record whether it runs with definer rights and which client roles can execute it (e.g., `pg_proc` and its ACL). A definer-rights function the anonymous role can execute is a finding unless its body checks the caller's identity, so read the body. Every function that became privileged since the previous report is a candidate, whether it was added or changed to definer rights. Check table and sequence grants to the anonymous role the same way. **Done when:** `Grants` lists every privileged function and anonymous grant, with a verdict.
- [ ] **Step 7 — Write Roles:** `Grants` shows who may write. This step shows who the code writes as. For each table whose writes need a role the request path lacks, find every write site, including SQL functions. Search for the table name, because language servers miss string literals. For each site, record the client used (a user-scoped client runs as the user role; an admin client runs as a privileged role, e.g., the Supabase service role), and compare it with the grant. An ungranted write is a finding. An ungranted write whose error is never read, or is dropped, is `CRITICAL`, because it fails silently on every call. **Done when:** `Write Roles` has one row per site: table · `file:line` · role at site · role granted · error checked · verdict.
- [ ] **Step 8 — Coverage:** For every tenancy-scoped table, check that tenancy is enforced at one recorded layer: a DB row policy (e.g., Postgres RLS: control on, >=1 policy, deny by default), or one app-layer scope that every query goes through (e.g., a Rails default scope, a Django manager). A table with a scope column and neither layer is a finding. Control on with 0 policies denies everything, which is safe but usually a mistake. Check coverage only; correctness goes to `bkit-audit-security`. The policy or scope test must fail when the policy is removed, because a denial can surface as silent zero rows. **Done when:** `Coverage` has one row per table: layer · policy count or scope · scope column · verdict.
- [ ] **Step 9 — Exposure:** `Coverage` keys on scope columns, so check the other paths here, for coverage only: file-storage policies and public buckets; change-feed publications and the row-level control on each published table; owner-rights views that bypass the caller's policies (e.g., no `security_invoker`); and API-served schemas that hold internal tables. **Done when:** `Exposure` has one row per surface, with a verdict.
- [ ] **Step 10 — Migrations:** Check the migrations added since the previous report for: shared timestamps (in the directory and on open branches); guarded DDL (`IF [NOT] EXISTS`) with no trailing catalogue re-query that asserts the result (a typo makes it a silent no-op that still counts as applied); a schema change without regenerated DB types (where types are generated); constraints that cannot fire because they evaluate to `NULL`, not `FALSE`, probed with a rolled-back `INSERT`; lock-unsafe DDL (e.g., Postgres: a non-`CONCURRENTLY` index, a constraint without `NOT VALID` and a later `VALIDATE`, a type change, `NOT NULL` on an existing column, no `lock_timeout`), found with a safe-migration linter or by applying its rules, saying which; and a drop or rename that the previous deployed build or the oldest supported client still reads. **Done when:** every hit is a finding with its file.
- [ ] **Step 11 — Integrity:** Check for: an FK `ON DELETE` that writes to an immutability-guarded table (the referenced delete fails); a hard delete beside a soft-delete convention, or a cascade that bypasses it; audit or CDC triggers missing where they are meant to be, or a stream not receiving rows (env flags can disable them); orphans in deliberately FK-less tables; and every timestamp without time zone, with its intended zone and whether all writers agree. **Done when:** every hit is a finding with its query.
- [ ] **Step 12 — Derived Data:** List the stores computed from other data (caches, denormalised columns, counters, materialised views, scheduled rebuilds). For each store, answer three questions: does one shared writer own it (a write anywhere else is a finding); does every source write path call that writer (each source path missing from the writer's callers is a finding); and does something check the copy against the source. **If** the only safety net is the next rebuild → state how long users see wrong data. **Done when:** each store has a row with those three answers.
- [ ] **Step 13 — Removal:** For each personal-data table, record the retention period and the purge job, whether soft-deleted rows are ever hard-deleted and when, and whether account deletion reaches every copy (caches, audit stream, embeddings, file storage, backups). No period, or a period without a job, is a finding. **Done when:** `Retention` has one row per table: data · retention · purge job · erasure covers · verdict.
- [ ] **Step 14 — Capacity:** Record each series beside the previous report's: table sizes and rows, the largest and unused indexes, sequential scans on large tables, and the inspection suite's outputs (e.g., outliers, calls, index stats, bloat, vacuum stats, table stats, locks, blocking, long-running, replication slots, cache hit). For the top 10 queries by total time and by mean time, take a query plan (e.g., `EXPLAIN (ANALYZE, BUFFERS)`) locally or in a rolled-back transaction, and record plan changes and the stats reset time. Record the size, growth and purge of the housekeeping tables (job history, HTTP logs, audit, auth audit). Flag any 32-bit key or sequence above 50% of its maximum. Compare disk with its limit and IO with the tier caps, and record the cache hit ratios. Measure query time in the DB, not in app traces, because network time dominates app traces. **Done when:** the series is in `Capacity`, and each threshold breach is a finding.
- [ ] **Step 15 — Vacuum:** **If** the engine vacuums (e.g., Postgres) → record the transaction-ID age per DB and for the largest tables, and the dead-tuple ratio and last autovacuum and autoanalyze for each hot table. A table not vacuumed since the previous report, or a climbing ID age, is a finding. **If** the engine is another kind → check its routine maintenance (e.g., SQLite `VACUUM`, InnoDB purge lag), or skip with evidence. **Done when:** the numbers are in `Capacity`, or the skip is recorded.
- [ ] **Step 16 — Connections:** Compare the connection limit and the pooler size with the peak, by application and by role. **If** serverless code connects directly → check it uses a transaction-mode pooler, a pool of 1 and prepared statements off (or the platform equivalent). Record the idle-in-transaction count and age. Record the statement timeout and the idle-in-transaction timeout for each client and admin role. A role with neither is a finding. **Done when:** the numbers, and each client constructor read, are in `Capacity`.
- [ ] **Step 17 — Restore:** (a) From source, list every outbound side effect a clone fires (scheduled jobs, triggers or functions that call HTTP, DB webhooks, foreign-data wrappers) and how each one stops: a logical restore strips it first, it fails closed in the clone, or it is unscheduled right after the restore (only when a first run is harmless). **If** a side effect reaches real users or payments and does not fail closed → do no binary restore. **If** there is no plan → write a finding, and do not restore. (b) Restore the latest backup to a throwaway target, check that the schema matches the migrations, record the time taken and the data lost, then delete the target. (c) Record the backup type, retention, point-in-time recovery, RTO and RPO. Missing written targets are a finding. Retention shorter than the time it takes to notice silent corruption is a finding. (d) Record the age of the logical backup kept outside the platform account, and check that the restore notes cover the key material that backups never contain. **If** there is no such backup → write a finding. **Done when:** `Restore` holds the side-effect plan and the result, or the finding that replaces them.
- [ ] **Step 18 — Standards:** Confirm the current version of each anchor standard, and read what changed since the previous report's version. Give `Standards Coverage` one row per checklist item, advisor lint and inspection report, each marked checked (naming the step), not applicable (saying why) or finding. Give each bkit anchor (a doc section, rule or issue shape) one row, marked followed (with the step or evidence), not applicable (saying why) or finding. A departure with no recorded reason (e.g., a `docs/decisions.jsonl` row or an accepted-divergence entry) is a finding. Mark each recommended practice the project does not apply as adopt (with a proposed step), reject (saying why) or not applicable. **Done when:** no row is empty.
- [ ] **Step 19 — Anything Else:** (a) Give a one-line verdict on each change since the previous report's commit that touches the DB: migrations, tables and columns, functions and grants, policies, extensions, scheduled jobs, buckets, publications and new DB clients. (b) In a bounded pass of about 30 minutes, note what a senior DBA would flag that no step asks about. Read what happened since the previous run (incidents, new `docs/failures.jsonl` rows), and ask what no step would catch. Include anything the catalogue, logs or advisors surfaced that no step checked, with the query for the next run. **Done when:** `Beyond the Steps` holds both passes, or says `none`. **If** one class of issue is seen on 2 runs → propose a step for it in `Process Improvements`.

### 🔒 Gate 2: Probes Check

- [ ] **Steps complete:** every step is `[x]`, or skipped with evidence that its surface is absent.
- [ ] **Evidence:** every finding cites evidence someone can check again, and the tool that produced it.
- [ ] **Environments:** every finding names the environment it ran against.
- [ ] **Remote untouched:** no remote database changed.
- [ ] **Restore target deleted:** the throwaway restore target no longer exists.
- [ ] **Gate 2 — Verified:** every item above holds.

## Findings

<!-- prettier-ignore -->
| Severity | Use |
| --- | --- |
| `CRITICAL` | Tenant data is readable or writable across tenants, or by the anonymous role. An anonymous-executable privileged function has no identity check. A write fails silently on every call. A migration drops data without a backfill |
| `HIGH` | A tenancy table has no enforcing layer (no row policy and no app-layer scope). A public bucket or an owner-rights view exposes tenant data. A constraint cannot fire. A lock-unsafe migration runs on a live table. There is no proven restore, no recovery target or no off-platform backup. The applied migrations differ from the directory |
| `MEDIUM` | An index the query shape needs is missing. A housekeeping table has no purge. Vacuum lags. A sequence is above 50%. A role has no timeouts. Derived data has no agreement check. The schema doc differs from the migrations |
| `LOW` | A deny-all table has no policies. Naming drift changes neither access nor results |

Within a severity, list security and data findings first.

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

### Suggested Issues

<!-- prettier-ignore -->
| # | Title | Findings | Severity | Next Step | Reason |
| --- | --- | --- | --- | --- | --- |
| PENDING | PENDING | PENDING | PENDING | PENDING | PENDING |

### Process Improvements

PENDING

### 🔒 Gate 3: Report Check

- [ ] **No placeholders:** no `PENDING` is left.
- [ ] **Summary:** `Summary` gives the count per severity and the environments measured.
- [ ] **Series:** the report shows every series beside the previous report's numbers, or marks the run as baseline.
- [ ] **Writes:** only this report, the template's `Project Instructions` and ledger rows have changed, and every throwaway worktree or remote target is removed.
- [ ] **Process Improvements:** `Universal` and `Project` are both filled.
- [ ] **Suggested Issues:** every `MEDIUM`+ finding ID is in exactly one row, and every row has a `Next Step`.
- [ ] **Gate 3 — Verified:** every item above holds.

<!-- bkit:end -->

## Project Instructions
