<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

<!-- Note: @bkit-plan-generate fills this template. The plan lives at `docs/plans/{YYYYMM}/{FID}-plan.md`, the canonical month bucket, where `{YYYYMM}` is the month the first workflow run for `{FID}` created it, set once. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/`, and may be deleted. The canonical copy is stamped with a `bkit:anchor` block that records the base commit (`baseSha`), its ref (`baseRef`) and the design it targets (`designPath`, `designBaseSha`). NEVER write or edit that block by hand. -->

# [Plan Title] Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

[The problem or feature, and why it is needed. Initially set to `PENDING`.]

**Related Issues:**

- [One `#N — title (state)` line per related issue. **If** none → `None`. Initially set to `PENDING`.]

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> This is the feature's testable contract. The implementation, the tests and the verification all follow from what you confirm here, so a mistake here carries into every later step.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). The agent handles the rest.

### Narrative

[One or two sentences from the user's side: what they do, and what they get back. Initially set to `PENDING`.]

### Success Criteria

[Up to 5 measurable outcomes. Initially set to `PENDING`.]

### Process Sketch

- **WHEN** [the trigger or user action] **→ THEN** [the observable outcome]
- **WHEN** [the next step] **→ THEN** [its outcome]
- **IF** [an edge case or failure, mirroring an Edge Cases row] **→ THEN** [how it is handled]

_e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is queued and a receipt is shown; **IF** the file is malformed **→ THEN** it is rejected inline and nothing is queued.

### Concrete Example

**Setup:** [The user's role, the existing state and the context]

**Steps:**

1. User [does X] → System [responds with Y]
2. User [does X] → System [responds with Y]
3. …

**Outcome:** [The end state the user sees that proves success]

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| [a design Key Edge Case, or a case the plan adds] | [the specific behavior] |
| [e.g., a concurrent edit from another device] | [e.g., the last write wins, with no crash] |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| [e.g., happy path: a user creates an event and sees it in the list] | E2E | [e.g., `apps/web/e2e/[feature].spec.ts`] | 2 |
| [e.g., the service parses the payload correctly] | Unit | [e.g., `packages/[pkg]/[module].test.ts`] | 2 |
| [e.g., the API endpoint enforces tenant isolation] | Integration | [e.g., `packages/api/[feature].integration.test.ts`] | 2 |
| [e.g., the real third-party API returns the expected shape and a boundary-only identity, not just "did not throw"] | @live (golden) | [e.g., `packages/[pkg]/[feature].live.test.ts`] | 2 |
| [e.g., the new migration replays from empty and the seed loads] | fresh-DB replay | [e.g., `packages/db/migrations/*`] (replayed by `bkit-tests-migration`) | 1 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

[Each proposed name (page, file, database table, route, API contract) and each breaking change (database structure, global layout). **If** none → `None`. Initially set to `PENDING`.]

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.
> These are the unknowns and assumptions this plan relies on. An unresolved question is a risk, and a wrong assumption breaks what follows. **If** there are none → write `None`.

- **Assumption:** [what the plan takes as given] → [what breaks if it is wrong]
- **Open Question:** [the decision needed] → [who resolves it, and how]
  - **Options:** A) [option] — [trade-off] · B) [option] — [trade-off] · C) [option] — [trade-off, optional]
  - **Recommended:** A) [option] — [why, in one line]
  - **Default if unanswered:** [what the agent proceeds with]

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

[The paths rejected and why, and recommendations for a future phase. Initially set to `PENDING`.]

## Out of Scope

[Each excluded item, marked `Exempt`. **If** none → `None`. Initially set to `PENDING`.]

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| [the excluded feature or fix] | [why it only adds to the plan's goal] | [a design non-goal, a follow-up issue or a future phase] |
| [e.g., bulk status change] | [e.g., single changes meet the goal, and bulk changes add to it] | [e.g., follow-up #N] |

## Suggested Scope Expansion

[The candidates that overlap this plan's surfaces. **If** none → `None`. Initially set to `PENDING`.]

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| [what it is] | [`#N`, `docs/deferrals.jsonl`, `docs/failures.jsonl` or an audit finding id] | [the surface or task it touches] | [fold in, keep deferred, or needs a design decision] |

## Security & Privacy

- [ ] **New API Route** — an auth guard (e.g., a `requireMember`-style check). **If** the route is auth-adjacent → a rate limit as well.
- [ ] **New DB Table/Column** — a deny-by-default row or tenant access policy (e.g., a row-level policy in the database), scoped to the tenant.
- [ ] **Role-Gated Mutation** — the role is checked at the API layer.
- [ ] **User Input** — validated against a schema in the handler (e.g., the schema library's parse call).
- [ ] **PII** — kept out of logs, and the audit or CDC trigger is updated for new monitored columns.
- [ ] **Redirect URL** — validated against an allow-list.
- [ ] **Webhook** — the signature is verified, and the secret is in the env schema.
- [ ] **New Secret/Env Var** — in the env schema and in the project's secret manager.

[**If** no row applies → write "None — no new routes, DB writes, secrets, or user input."]

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** the packages are declared, and the manifest and lockfile are in sync.
- [ ] **Dependency Versions:** outdated dependencies and the toolchain and stack CLI versions are checked.
- [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
- [ ] **User Context:** access to the files is confirmed, and missing user information is requested.
- [ ] **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
- [ ] **Testing & Quality:** the testing strategy matches `docs/testing.md`.
- [ ] **Prerequisite Plans:** [the plans to finish first. **If** none → `None`.]

### Conditional

- [ ] **Secrets & Env Vars:** the secret store and the service-account roles are checked.
- [ ] **Schema State:** the database state is confirmed against `docs/data-schema.md`.
- [ ] **Architecture & UI:** the topology is checked against `docs/architecture.md`, and any UI against `docs/design.md`.
- [ ] **Observability:** logs, audit tables and traces follow `docs/observability.md`.
- [ ] **Notifications:** the alert or toast tier follows the notifications doc.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** every applicable row is verified, or `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Data Schema Integration

[How this feature uses the existing schema, and what changes. Initially set to `PENDING`.]

### Data Schema Usage

[The existing `docs/data-schema.md` tables and fields the feature reads (Input) or writes (Output). **If** none → `None`. Initially set to `PENDING`.]

- [e.g., **Input (Read):** `users.id`, `items.title`]
- [e.g., **Output (Write):** `items.status`, `job_audits.log`]

### Data Schema Changes

[The new tables, new fields and changed fields to record in `docs/data-schema.md`. **If** none → `None`. Initially set to `PENDING`.]

- [e.g., **ADD:** `items.new_field` (type: text)]
- [e.g., **MODIFY:** `users.role` (added enum value)]

## Reuse Inventory

[One row per capability the plan introduces. Initially set to `PENDING`.]

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| [what the plan must do] | `path/to/existing` | `grep -rn "..."`, references to `{symbol}`, `docs/capabilities.md`, `{framework} {capability} built-in` | `path/to/existing` — covers [X], missing [Y] | EXTEND | [what changes in it to close the gap] |
| [e.g., item status column] | `packages/db/migrations/{timestamp}_add_items_status.sql` | [the exact commands and queries run] | None — [what was searched] | NEW | [reason (a), (b) or (c)] |
| [e.g., status change action] | `packages/api/src/items/setStatus.ts` | [the exact commands and queries run] | None — [what was searched] | NEW | [reason (a), (b) or (c)] |

## Architecture & Component Changes

[The files, grouped by area (DB, API, Backend, Frontend, Cron, Observability), with one heading per area. Initially set to `PENDING`.]
**Ledger rows:** [The backticked `key` of every `docs/decisions.jsonl` and `docs/deferrals.jsonl` row written for this plan, comma-separated. **If** none → write "None". Initially set to `PENDING`.]

### Database Migrations

[The new tables, columns and access policies (e.g., row-level policies), and the migration that adds them. Initially set to `PENDING`.]

### [Component Area 1]

[A summary of the component changes. Initially set to `PENDING`.]

#### [MODIFY] `path/to/file.ext`

- **Existence Check:** [the file exists]
- [The logic, schema or API contract changes.]

#### [new] `path/to/file.ext`

- **Reuse Check:** [the `Reuse Inventory` row, and reason (a), (b) or (c)]
- [The purpose, access policies, input validation and naming.]

#### [DELETE] `path/to/file.ext`

- [The reason]

### Cron Jobs & Scheduled Tasks

[The scheduled tasks (e.g., a hosting platform's cron, a database scheduler or a background-job runner). **If** none → `None`. Initially set to `PENDING`.]

## Supersession Inventory

[The existing artifacts the new code replaces. **If** none → `None`. Initially set to `PENDING`.]

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `path/to/old-thing` | `path/to/new-thing` | DELETE | [the reason] |

## Documentation Updates

[One row per doc this change touches. Find any doc not listed here through `.agents/docs.md`.]

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | [learnings and gotchas] |
| `docs/decisions.jsonl` | [architecture decisions] |
| `docs/architecture.md` | [topology or component changes] |
| `docs/technology.md` | [frameworks, libraries and conventions] |
| `docs/data-schema.md` | [new tables or columns] |
| `docs/design.md` | [palette, typography and components] |
| `docs/testing.md` | [new test files or patterns] |
| `docs/observability.md` | [new log names or spans] |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | [A corrective migration that undoes the change. It is safe when the change only adds.] | Merged migrations are immutable, so ship the corrective migration through CI's migration lane. For a full dev reset, see `docs/deployments.md` § Dev rollback runbook. |
| **Code** | [The git revert SHA, or the feature flag that disables the change] | `git revert {COMMIT}` |
| **Risk window** | [The gap between the DB migration merge and the code deploy] | [e.g., "~2 min deploy build, so the migration must be additive"] |

[**If** there are no DB changes → write "Code-only — `git revert` sufficient."]

## Agent Execution Runbook

[A chronological task checklist. Initially set to `PENDING`.]

**Implementation Tasks (Examples):**

<!-- bkit:group 1 start -->

### TASK GROUP 1: [e.g., Item status in the API]

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** [e.g., Create the database migration with the repo's migration script (`pnpm db:diff`)]
  - **CREATE:** `packages/db/migrations/{timestamp}_add_items_status.sql`: [e.g., the `items.status` column]
  - **DONE WHEN:** [e.g., the migration exists, and `pnpm db:reset` replays it cleanly]
  - **TEST FIRST:** n/a — [e.g., a migration, covered by the fresh-DB replay tier]

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** [e.g., Implement the backend API action `setStatus`]
  - **CREATE:** `setStatus` in `packages/api/src/items/setStatus.ts`: [e.g., a validated status change]
  - **READ:** `ItemStatus` in `packages/api/src/items/schema.ts`: [e.g., the allowed statuses]
  - **DEPENDS ON:** 1
  - **DONE WHEN:** [e.g., a unit test covers each status transition, and the integration test passes]
  - **TEST FIRST:**
    - `packages/api/src/items/setStatus.test.ts` `rejects an unknown status` fails on [e.g., an unknown status being accepted]
    - `packages/api/items.integration.test.ts` `persists the new status` fails on [e.g., no row being stored]

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** every planned test recorded a red run before its code.
- [ ] **Tests unchanged:** every planned test is unchanged since its red run.
- [ ] **Test-order gaps:** each test-order gap is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** errors are logged and traced as `docs/observability.md` describes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** [The existing E2E tests to update alongside.]
- [ ] **Build Configuration:** [How test-only files are kept out of the production build (e.g., the compiler config's exclude list).]
- [ ] **[Test Type] (`path/to/test.spec.ts`):** [The flow, unit or E2E additions, and their data hygiene needs.]
- [ ] **Apply local migrations:** [The new migrations applied locally (e.g., `pnpm db:reset`).]
- [ ] **Run all tests:** [The local unit and integration suites (e.g., `pnpm test`, `pnpm test:integration`) pass.]

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** [How to verify the feature end to end through the CLI or the database.]

<!-- bkit:end -->
