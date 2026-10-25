<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is stamped with a `bkit:anchor` block recording the base commit (`baseSha`), its ref (`baseRef`), and the design it targets (`designPath`, `designBaseSha`); never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# [Plan Title] Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

[Problem or feature, and why it is needed; initially set to `PENDING`.]

**Related Issues:**

- [`#N — title (state)` per related issue. None → `None`; initially set to `PENDING`.]

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

[1-2 sentences from the user's side: what they do, what they get back; initially set to `PENDING`.]

### Success Criteria

[Up to 5 measurable outcomes; initially set to `PENDING`.]

### Process Sketch

- **WHEN** [trigger / user action] **→ THEN** [observable outcome]
- **WHEN** [next step] **→ THEN** [outcome]
- **IF** [edge case / failure — mirrors an Edge Cases row] **→ THEN** [handling]

_notation, e.g._ **WHEN** a user submits the form with a valid file **→ THEN** it is queued and a receipt shown; **IF** the file is malformed **→ THEN** it is rejected inline and nothing is queued.

### Concrete Example

**Setup:** [User role, existing state, context]

**Steps:**

1. User [does X] → System [responds with Y]
2. User [does X] → System [responds with Y]
3. …

**Outcome:** [End state the user sees that proves success]

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| [Design Key Edge Case or plan-added case] | [Specific behavior] |
| [e.g., concurrent edit from another device] | [e.g., last-write-wins, no crash] |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| [e.g., Happy path: user creates event, sees it in list] | E2E | [e.g. `apps/web/e2e/[feature].spec.ts`] |
| [e.g., Service correctly parses payload] | Unit | [e.g. `packages/[pkg]/[module].test.ts`] |
| [e.g., API endpoint enforces tenant isolation] | Integration | [e.g. `packages/api/[feature].integration.test.ts`] |
| [e.g., Real 3rd-party API returns expected shape and a boundary-only identity — not "did not throw"] | @live (golden) | [e.g. `packages/[pkg]/[feature].live.test.ts`] |
| [e.g., New migration replays from empty and seed loads] | fresh-DB replay | [e.g. `supabase/migrations/*`] (replayed by `bkit-tests-migration`) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

[Proposed names (pages, files, DB tables, routes, API contracts) and breaking changes (DB structure, global layout). None → `None`; initially set to `PENDING`.]

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Assumption:** [what the plan takes as given] → [what breaks if it's wrong]
- **Open Question:** [decision needed] → [who / how to resolve]
  - **Options:** A — [option, trade-off] · B — [option, trade-off] · C — [option, trade-off, optional]
  - **Recommended:** [A] — [why, 1 line]
  - **Default if unanswered:** [what the agent proceeds with]

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

[Rejected paths and why; future phase recommendations; initially set to `PENDING`.]

## Out of Scope

[Excluded items, each `Exempt`. None → `None`; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| [feature/fix] | [why genuinely-additive] | [design non-goal / follow-up #N / future phase] |

## Suggested Scope Expansion

[Candidates overlapping this plan's surfaces. None → `None`; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| [what it is] | [`#N` / `docs/deferrals.jsonl` / `docs/failures.jsonl` / audit finding id] | [surface / task it touches] | [fold in / keep deferred / needs design decision] |

## Security & Privacy

- [ ] **New API Route** — auth guard (e.g. a `requireMember`-style check); rate limit if auth-adjacent.
- [ ] **New DB Table/Column** — deny-by-default row / tenant access policy (e.g. RLS); tenant-scoped.
- [ ] **Role-Gated Mutation** — role checked at the API layer.
- [ ] **User Input** — schema-validated in the handler (e.g. Zod `parse()`).
- [ ] **PII** — absent from logs; audit / CDC trigger updated for new monitored columns.
- [ ] **Redirect URL** — allow-list validated.
- [ ] **Webhook** — signature verified; secret in the env schema.
- [ ] **New Secret/Env Var** — in the env schema and the project's secret manager.

_If none apply: "None — no new routes, DB writes, secrets, or user input."_

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** packages declared; manifest and lockfile in sync.
- [ ] **Dependency Versions:** outdated deps and toolchain / stack CLI versions checked.
- [ ] **Existing-Solution Search (reuse over duplicate):** in-repo, dependency and ecosystem sweeps recorded in `Reuse Inventory`.
- [ ] **User Context:** file access confirmed; missing user information requested.
- [ ] **Project Context:** relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows read.
- [ ] **Testing & Quality:** testing strategy matches `docs/testing.md`.
- [ ] **Prerequisite Plans:** [plans to finish first, or `None`]

### Conditional

- [ ] **Secrets & Env Vars:** secret store and service-account roles checked.
- [ ] **Schema State:** database state confirmed against `docs/data-schema.md`.
- [ ] **Architecture & UI:** `docs/architecture.md` topology; `docs/design.md` for UI.
- [ ] **Observability:** logs, audit tables and traces per `docs/observability.md`.
- [ ] **Notifications:** alert / toast tier per the notifications doc.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** applicable rows verified, or `None` justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [ ] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

[How this feature uses the existing schema and what changes; initially set to `PENDING`.]

### Data Schema Usage

[Existing `docs/data-schema.md` tables and fields read (Input) or written (Output). None → `None`; initially set to `PENDING`. e.g.,

- **Input (Read):** `users.id`, `items.title`
- **Output (Write):** `items.status`, `job_audits.log`]

### Data Schema Changes

[New tables, new fields, or changed fields to record in `docs/data-schema.md`. None → `None`; initially set to `PENDING`. e.g.,

- **ADD:** `items.new_field` (type: text)
- **MODIFY:** `users.role` (added enum value)]

## Reuse Inventory

[One row per capability the plan introduces; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| [what the plan must do] | `path/to/existing` | `grep -rn "..."`; references to `{symbol}`; `docs/capabilities.md`; `{framework} {capability} built-in` | `path/to/existing` — covers [X], missing [Y] | EXTEND | [what changes in it to close the gap] |
| [e.g., item status column] | `supabase/migrations/{timestamp}_add_items_status.sql` | [exact commands / queries run] | None — [what was searched] | NEW | [reason (a)/(b)/(c)] |
| [e.g., status change action] | `packages/api/src/items/setStatus.ts` | [exact commands / queries run] | None — [what was searched] | NEW | [reason (a)/(b)/(c)] |

## Architecture & Component Changes

[Files grouped by area (DB, API, Backend, Frontend, Cron, Observability), one header each; initially set to `PENDING`.]
**Ledger rows:** [Backticked `key` of every `docs/decisions.jsonl` / `docs/deferrals.jsonl` row written for this plan, comma-separated. If none, write "None"; initially set to `PENDING`.]

### Database Migrations

[New tables / columns / access policies (e.g. RLS) and the migration that adds them; initially set to `PENDING`.]

### [Component Area 1]

[Summary of component changes; initially set to `PENDING`.]

#### [MODIFY] `path/to/file.ext`

- **Existence Check:** [file exists]
- [Logic, schema, or API contract changes.]

#### [new] `path/to/file.ext`

- **Reuse Check:** [`Reuse Inventory` row + reason (a)/(b)/(c)]
- [Purpose, access policies (e.g. RLS), input validation (e.g. Zod), naming.]

#### [DELETE] `path/to/file.ext`

- [Reason]

### Cron Jobs & Scheduled Tasks

[Scheduled tasks (e.g. Vercel cron, pg_cron, Inngest). None → `None`; initially set to `PENDING`.]

## Supersession Inventory

[Existing artifacts the new code replaces. None → `None`; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `path/to/old-thing` | `path/to/new-thing` | DELETE | [reason] |

## Documentation Updates

[One row per doc this change touches; others via `.agents/docs.md`.]

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | [learnings, gotchas] |
| `docs/decisions.jsonl` | [architecture decisions] |
| `docs/architecture.md` | [topology / component changes] |
| `docs/technology.md` | [frameworks, libraries, conventions] |
| `docs/data-schema.md` | [new tables / columns] |
| `docs/design.md` | [palette, typography, components] |
| `docs/testing.md` | [new test files / patterns] |
| `docs/observability.md` | [new log names / spans] |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | [Corrective migration that undoes the change; safe if additive-only] | merged migrations are immutable — ship the corrective migration through CI's migration lane; dev full reset → `docs/deployments.md` § Dev rollback runbook |
| **Code** | [Git revert SHA or feature flag to disable] | `git revert {COMMIT}` |
| **Risk window** | [Gap between DB migration merge and code deploy] | [e.g., "~2 min Vercel build — migration must be additive"] |

_No DB changes: "Code-only — `git revert` sufficient."_

## Agent Execution Runbook

[Chronological task checklist; initially set to `PENDING`.]

**Implementation Tasks (Examples):**

<!-- bkit:group 1 start -->

### GROUP 1: [e.g., Item status in the API]

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** [e.g., Create DB migration with the repo's migration script (`pnpm db:diff`)]
  - **CREATE:** `supabase/migrations/{timestamp}_add_items_status.sql`: [e.g., `items.status` column]
  - **DONE WHEN:** [e.g., the migration exists; `pnpm db:reset` replays it cleanly]
  - **TEST FIRST:** n/a — [e.g., migration; fresh-DB replay tier]

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** [e.g., Implement backend API action `setStatus`]
  - **CREATE:** `setStatus` in `packages/api/src/items/setStatus.ts`: [e.g., Zod-validated status change]
  - **READ:** `ItemStatus` in `packages/api/src/items/schema.ts`: [e.g., the allowed statuses]
  - **DEPENDS ON:** 1
  - **DONE WHEN:** [e.g., unit test covers each status transition; integration test passes]
  - **TEST FIRST:**
    - `packages/api/src/items/setStatus.test.ts` `rejects an unknown status` fails on [e.g., an unknown status being accepted]
    - `packages/api/items.integration.test.ts` `persists the new status` fails on [e.g., no row being stored]

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** [Existing E2E tests (e.g. Playwright) to update alongside.]
- [ ] **Build Configuration:** [Test-only files kept out of the production build (e.g. `tsconfig.json` `exclude`).]
- [ ] **[Test Type] (`path/to/test.spec.ts`):** [Flows / unit / E2E additions and data hygiene needs.]
- [ ] **Apply local migrations:** [New migrations applied locally (e.g. `pnpm db:reset`).]
- [ ] **Run all tests:** [Local unit and integration suites (e.g. `pnpm test`, `pnpm test:integration`) pass.]

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** [How to verify the feature end-to-end via CLI / DB.]

<!-- bkit:end -->
