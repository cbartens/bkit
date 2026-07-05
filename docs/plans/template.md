<\!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# [Plan Title] Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

[High-level overview of problem/feature. Why is it necessary?]

**Success Criteria:**

- [1-3 bullet points defining "done" (e.g., "Users can upload profile pictures").]

**Related Issues:**

- [Related issues search results. Tracker issue refs ONLY (e.g. `#N — title (state)`); NOT full content. Considered for dedup / scope-awareness; NOT a scope mandate. None / scan unavailable → `None`.]

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV (not system POV). Describes what the user does and what they get back.
- **Success Criteria:** ≤5 bullets, each measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), NOT implementation steps (e.g. "call API, render component"). If design doc lists fewer or more, prefer the smallest set that still proves the feature works.
- **Key Edge Cases _(design phase produces; plan phase inherits)_:** Design-shaping only — concurrency, conflict resolution, failure modes, cross-feature interactions. NOT trivial input validation (the plan adds those).
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + adds plan-level cases (validation, error paths, boundary conditions).
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome. One scenario, not a list.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task in the Agent Execution Runbook. No row without a target file.

**Design-missing fallback:** If `{FID}-design.md` is absent or has no `## Acceptance Scenario` section, replace the inherited Narrative and Success Criteria fields with `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`. Do NOT fabricate either field; gate-1 stays blocked until human fills both.

### Narrative _(inherited from design — do not rewrite)_

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Narrative. Design-missing → use fallback string per Spec above.]

### Success Criteria _(inherited from design — do not rewrite)_

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Success Criteria. Design-missing → use fallback string per Spec above.]

### Concrete Example _(plan expands from design)_

**Setup:** [User role, existing state, context]

**Steps:**

1. User [does X] → System [responds with Y]
2. User [does X] → System [responds with Y]
3. …

**Outcome:** [End state the user sees that proves success]

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| [Inherited from design Key Edge Cases and plan-added cases] | [Specific behavior] |
| [e.g., concurrent edit from another device] | [e.g., last-write-wins, no crash] |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md` § "Which tier does a behaviour need?" (a behaviour may need more than one). Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.

**Tier key** — use these exact tier names in the `Type` column (they MUST match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc` + lint + `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces RLS against a fresh local DB |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content AND a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migrate`) | migration replays from empty + the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| [e.g., Happy path: user creates event, sees it in list] | E2E (Playwright) | `apps/web/e2e/[feature].spec.ts` |
| [e.g., Service correctly parses payload] | Unit (Vitest) | `packages/[pkg]/[module].test.ts` |
| [e.g., API endpoint enforces RLS] | Integration (Vitest) | `packages/api/[feature].integration.test.ts` |
| [e.g., Real 3rd-party API returns expected shape AND a boundary-only identity — not "did not throw"] | @live (golden) | `packages/[pkg]/[feature].live.test.ts` |
| [e.g., New migration replays from empty + seed loads] | fresh-DB replay (bkit-tests-migrate) | `supabase/migrations/*` (replayed by `bkit-tests-migrate`) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

[Proposed names: pages, files, DB tables, routes, API contracts. Breaking changes, DB structure diffs, global layout changes. Use IMPORTANT/WARNING/CAUTION alerts. If none, write "None".]

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

[Document rejected paths and why. List future phase recommendations.]

## Out of Scope

[List features/fixes explicitly excluded to prevent scope creep.]

## Merge Method

**Merge method: always squash.** Plans MUST NOT propose `rebase` or `merge-commit` as the integration method into `dev`. `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`. If a plan needs commit-boundary preservation for ordering reasons, decompose into separate PRs rather than requesting a non-squash merge.

## Supersession Inventory

[Existing artifacts the new code replaces — shared triggers/routes, redundant exports, etc. If plan adds without replacing, write "None".]

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `path/to/old-thing` | `path/to/new-thing` | DELETE | [reason] |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date + follow-up issue link.
>
> NEVER accept `@deprecated` + still exported as a resolution. Each `DELETE` row MUST be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` AND as a removal task in `Agent Execution Runbook`.

## Security & Privacy

> Reference: `docs/security.md` § Security Checklist for New Features. Check all that apply; skip inapplicable rows.

- [ ] **New API route** — `requireFamilyMember`/`requireFamilyMemberHono` applied? Rate-limited if auth-adjacent?
- [ ] **New DB table/column** — RLS enabled deny-by-default? Family-scoped via `family_members` join?
- [ ] **Role-gated mutation** — `familyRole` checked at API layer (not RLS alone)?
- [ ] **User input** — Zod schema in `@app-gether-life/validators`? `schema.parse()` called in handler?
- [ ] **PII** — absent from logs? CDC trigger updated if new column on monitored table?
- [ ] **Redirect URL** — validated via `isAllowedRedirect()`?
- [ ] **Webhook** — signature verified? Secret in env schema?
- [ ] **New secret/env var** — added to `packages/env/src/index.ts`? Stored in GCP Secret Manager?

_If none apply: "None — no new routes, DB writes, secrets, or user input."_

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` for required packages. Ensure `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** Run `pnpm outdated` and spot-check CLI versions (`npx supabase --version`, `npx tsc --version`, `pnpm --version`). Flag any outdated dependencies that may silently block or break implementation. Many infrastructure errors stem from version mismatches between CLI tools and their backend services.
- [ ] **User Context:** Verify read/write access to required files. Request any missing user information up front.
- [ ] **Pending Blockers:** Query Linear for open issues (label `blocker`) relevant to this feature.
- [ ] **Project Context:** Check `docs/knowledge.md` and `docs/decisions.md` for relevant patterns, established decisions, and known gotchas.
- [ ] **Testing & Quality:** Ensure testing strategy aligns with rules in `docs/testing.md`.
- [ ] **Prerequisite Plans:** List `docs/plans/...` plans that must be fully executed and verified BEFORE this one.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** _(new API keys / third-party credentials)_: Verify GCP Secret Manager. Fallback to Vercel env vars. Check GCP Service Account IAM roles.
- [ ] **Schema State** _(any DB reads/writes)_: Confirm exact database state (`docs/data-schema.md`) before finalizing ORM logic.
- [ ] **Architecture & UI** _(new files, routes, or UI components)_: Validate strict adherence to `docs/architecture.md` (monorepo topology). For UI: `docs/styles.md`; for mobile: `docs/setup.md` §6. Reference repos at `/Users/christian/Documents/GitHub/create-t3-turbo` and `/Users/christian/Documents/GitHub/next-hono-drizzle`.
- [ ] **Observability** _(new log points, CDC tables, or OTel spans)_: Verify logging, tracing, and audit conventions align with `docs/observability.md`. Ensure `console.error` structured format, correlation IDs, and CDC/OTel patterns are followed.
- [ ] **Notifications** _(user-facing alerts or toasts)_: Check `docs/notifications.md` for tier classification (1=inline, 2=toast, 3=persistent bell).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

[Define how this feature interacts with the existing database schema and what changes are required.]

### Data Schema Usage (Inputs & Outputs)

[List all existing `docs/data-schema.md` tables and fields that this feature will read from (Input) or write to (Output). e.g.,

- **Input (Read):** `users.id`, `items.title`
- **Output (Write):** `items.status`, `job_audits.log`]
  If no existing fields are used, explicitly state "None".

### Data Schema Changes

[List any new tables, new fields, or modifications to existing fields that need to be added to `docs/data-schema.md`. e.g.,

- **ADD:** `items.new_field` (type: text)
- **MODIFY:** `users.role` (added enum value)]
  If no schema changes are required, explicitly state "None".

## Architecture & Component Changes

[Group files logically (DB, API, Backend, Frontend, Cron, Observability). Separate by headers.]
**CRITICAL:** Justify new file locations using `docs/architecture.md` monorepo topology.
**CRITICAL:** For Frontend/Mobile changes, verify styling/components adhere to `docs/styles.md` and `docs/setup.md` §6.
**CRITICAL:** Use file search to verify `[MODIFY]` files exist. Otherwise list as `[NEW]`.
**CRITICAL:** Explicitly include backend actions to execute newly created Zod schema validations (`schema.parse`).
**CRITICAL:** Observability is automated via Log Drains/CDC (`docs/data-pipeline.md`). You **MUST** mandate `console.error("[Context] Message", payload)` for edge cases escaping auto-capture (orphaned records, fallbacks, API aborts). See `docs/observability.md` for naming conventions, severity mapping, correlation IDs, and vendor label taxonomy.

### Database Migrations

[Define new tables/columns/RLS (`db:diff`). **Do not run `db push` to Dev/Main.** Migrations are pushed **automatically by the Supabase GitHub App Branching Integration** upon PR merge.]

> [\!WARNING]
> **If adding/removing columns on `users`, `families`, or `user_channels` (CDC-monitored tables):**
>
> 1. Update `knownSafeColumns` in `packages/observability/tests/cdc-schema-assurance.integration.test.ts`.
> 2. If column contains PII → update `notify_telemetry_audit()` trigger to scrub it.
> 3. See `docs/data-schema.md` § CDC Audit Triggers for full checklist.

### [Component Area 1]

[Summary of component changes]

#### [MODIFY] `path/to/file.ext`

- **Existence Check:** [Verify file exists first.]
- [Detail logic, schema, or API contracts.]

#### [NEW] `path/to/file.ext`

- [Detail purpose, RLS policies, Zod validation, naming.]

#### [DELETE] `path/to/file.ext`

- [Reason]

### Cron Jobs & Scheduled Tasks

[Define Vercel cron, pg_cron, or Inngest tasks. Must include updating `docs/data-cron-jobs.md`.]

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | [learnings, gotchas] |
| `docs/decisions.md` | [architecture decisions] |
| `docs/architecture.md` | [topology/component changes] |
| `docs/data-schema.md` | [new tables/columns] |
| `docs/data-pipeline.md` | [pipeline changes] |
| `docs/testing.md` | [new test files/patterns] |
| `docs/observability.md` | [new log names/spans] |

_Remove rows with no change. Add rows for any other affected docs._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | [Migration to revert; safe if additive-only] | `npx supabase db push --linked` after reverting file |
| **Code** | [Git revert SHA or feature flag to disable] | `git revert {COMMIT}` |
| **Risk window** | [Gap between DB migration merge and code deploy] | [e.g., "~2 min Vercel build — migration must be additive"] |

_No DB changes: "Code-only — `git revert` sufficient."_

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [\!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a Linear issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the exact next task in the list.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment on the issue per `.claude/workflows/conventions.md`.

**Implementation Tasks (Examples):**

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable criterion (file exists / function signature matches / test passes / specific behaviour observable). Plan-verify reads this line and asserts against it before ticking `[x]`. No task without `Done when:`.

- [ ] **Task 1:** [e.g., Create DB migration (`npx supabase db diff`)]
  - **Done when:** [e.g., `supabase/migrations/{timestamp}_add_items_status.sql` exists; `npx supabase db push --local` applies cleanly]
- [ ] **Task 2:** [e.g., Implement backend API action `action.ts`]
  - **Done when:** [e.g., `packages/api/src/items/setStatus.ts` exports `setStatus` with Zod-validated input; integration test in `packages/api/items.integration.test.ts` passes]
- [ ] **Task 3:** [e.g., Update React component `page.tsx`]
  - **Done when:** [e.g., `apps/web/app/items/page.tsx` renders status badge; Playwright spec `apps/web/e2e/items.spec.ts` confirms user-visible state]

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [\!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):**
>
> - **Backend Pipeline logic MUST be tested in Vitest only**. No Playwright for webhooks/APIs. Mock HTTP and assert DB natively.
> - **End-to-End Integration Testing**: Core data pipelines require writing at least 1 integration test firing the API vs local DB _without_ ORM/DB mocking (`npm run test:integration`).
> - **Playwright strictly for UI tests**. Do not use Playwright E2E unless clicking visual DOM components.
>
> **Playwright E2E Conventions (MANDATORY for new tests):**
>
> - **Authentication:** A `setup` project (`e2e/auth.setup.ts`) logs in once and saves `storageState` to `playwright/.auth/user.json`. All tests in the `chromium` project **automatically start pre-authenticated** — do NOT add manual login logic.
> - **Unauthenticated Tests:** Tests for sign-in, sign-up, or account deletion MUST opt out of shared auth:
>   ```typescript
>   import { test, expect } from "@playwright/test"; // NOT from './fixtures'
>   test.use({ storageState: { cookies: [], origins: [] } });
>   ```
> - **Data Factory:** All test data MUST be generated via `e2e/datafactory/` modules. Never construct inline strings. Use typed factories with overrides to isolate what each test is verifying:
>   ```typescript
>   import { eventData, transientUser } from "./datafactory";
>   const event = eventData({ location: "Custom Venue" }); // override only what matters
>   ```
> - **New factories:** If your feature introduces a new data type, add a new factory module to `e2e/datafactory/` and re-export it from the barrel `index.ts`.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` must have a corresponding test task checked off below. Add tasks if any row is uncovered.
- [ ] **Update existing tests:** Review/adjust unit, integration, and E2E tests for new changes aligned with `docs/testing.md`.
- [ ] **Write new tests:** Draft tests covering new functionality per Testing Strategy. For Playwright, use `e2e/datafactory/` for test data and follow the `storageState` auth conventions above.
- [ ] **Verify observability:** Ensure new feature is observable per `docs/observability.md` — structured `console.error("[Context] Message", payload)` for error paths, correlation IDs (`family_id`, `user_id`, `job_id`) propagated in Inngest events, and CDC-tracked tables include audit triggers. Update `docs/observability.md` if new log names, labels, or tracing scopes are introduced.
- [ ] **Update documentation:** Natively integrate new logic/schemas into `docs/architecture.md`, `docs/data-pipeline.md`, `docs/data-schema.md`, `docs/knowledge.md` and `docs/decisions.md`. Rewrite prose to maintain ground-truth; DO NOT append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `📚 Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** Run `tsc --noEmit` and ESLint to catch syntax/typing/import errors before testing.
- [ ] **Test Synchronization:** [List existing E2E/Playwright tests to update synchronously to prevent CI failures.]
- [ ] **Build Configuration:** [Add new mock files/test configs to `exclude` array in `tsconfig.json` to protect Vercel builds.]
- [ ] **[Test Type] (`path/to/test.spec.ts`):** [Describe flows/unit/E2E additions. Note data hygiene needs.]
- [ ] **Apply local migrations:** If new migration files were created, run `npx supabase db push --local` to apply them to the local Docker DB. Without this, integration tests (e.g., CDC schema assurance) will fail against the stale local schema.
- [ ] **Run all tests:** Execute locally. Pass `pnpm test` and `TEST_REAL_APIS=true pnpm test:integration`. Fix all failures before Gate 4.

> [\!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build, compiler, or test errors during verification, NEVER resolve them via hot fixes or anti-patterns. Strictly follow industry best practices as per `docs/architecture.md` (and its reference repos) and `docs/knowledge.md`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### Manual Verification

> [\!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1:** [Instructions for agent/user to verify feature end-to-end via CLI/DB.]

<!-- bkit:start -->

<!-- bkit:managed v4.2.2 — do NOT edit; run `bkit upgrade` to refresh -->

# [Plan Title] Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

[High-level overview of problem/feature. Why is it necessary?]

**Success Criteria:**

- [1-3 bullet points defining "done" (e.g., "Users can upload profile pictures").]

**Related Issues:**

- [Related issues search results. Tracker issue refs ONLY (e.g. `#N — title (state)`); NOT full content. Considered for dedup / scope-awareness; NOT a scope mandate. None / scan unavailable → `None`.]

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV (not system POV). Describes what the user does and what they get back.
- **Success Criteria:** <=5 bullets, each measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), NOT implementation steps (e.g. "call API, render component"). If design doc lists fewer or more, prefer the smallest set that still proves the feature works.
- **Key Edge Cases _(design phase produces; plan phase inherits)_:** Design-shaping only — concurrency, conflict resolution, failure modes, cross-feature interactions. NOT trivial input validation (the plan adds those).
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + adds plan-level cases (validation, error paths, boundary conditions).
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome. One scenario, not a list.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task in the Agent Execution Runbook. No row without a target file.

**Design-missing fallback:** If `{FID}-design.md` is absent or has no `## Acceptance Scenario` section, replace the inherited Narrative and Success Criteria fields with `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`. Do NOT fabricate either field; gate-1 stays blocked until human fills both.

### Narrative _(inherited from design — do not rewrite)_

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Narrative. Design-missing → use fallback string per Spec above.]

### Success Criteria _(inherited from design — do not rewrite)_

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Success Criteria. Design-missing → use fallback string per Spec above.]

### Concrete Example _(plan expands from design)_

**Setup:** [User role, existing state, context]

**Steps:**

1. User [does X] → System [responds with Y]
2. User [does X] → System [responds with Y]
3. …

**Outcome:** [End state the user sees that proves success]

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| [Inherited from design Key Edge Cases and plan-added cases] | [Specific behavior] |
| [e.g., concurrent edit from another device] | [e.g., last-write-wins, no crash] |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md` § "Which tier does a behaviour need?" (a behaviour may need more than one). Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.

**Tier key** — use these exact tier names in the `Type` column (they MUST match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc` + lint + `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces RLS against a fresh local DB |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content AND a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migrate`) | migration replays from empty + the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| [e.g., Happy path: user creates event, sees it in list] | E2E (Playwright) | `apps/web/e2e/[feature].spec.ts` |
| [e.g., Service correctly parses payload] | Unit (Vitest) | `packages/[pkg]/[module].test.ts` |
| [e.g., API endpoint enforces RLS] | Integration (Vitest) | `packages/api/[feature].integration.test.ts` |
| [e.g., Real 3rd-party API returns expected shape AND a boundary-only identity — not "did not throw"] | @live (golden) | `packages/[pkg]/[feature].live.test.ts` |
| [e.g., New migration replays from empty + seed loads] | fresh-DB replay (bkit-tests-migrate) | `supabase/migrations/*` (replayed by `bkit-tests-migrate`) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

[Proposed names: pages, files, DB tables, routes, API contracts. Breaking changes, DB structure diffs, global layout changes. Use IMPORTANT/WARNING/CAUTION alerts. If none, write "None".]

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

[Document rejected paths and why. List future phase recommendations.]

## Out of Scope

[List features/fixes explicitly excluded to prevent scope creep.]

## Merge Method

**Merge method: always squash.** Plans MUST NOT propose `rebase` or `merge-commit` as the integration method into `dev`. Default is hardcoded to `gh pr merge --squash --delete-branch --body ""`. If a plan needs commit-boundary preservation for ordering reasons, decompose into separate PRs rather than requesting a non-squash merge.

## Supersession Inventory

[Existing artifacts the new code replaces — shared triggers/routes, redundant exports, etc. If plan adds without replacing, write "None".]

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `path/to/old-thing` | `path/to/new-thing` | DELETE | [reason] |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date + follow-up issue link.
>
> NEVER accept `@deprecated` + still exported as a resolution. Each `DELETE` row MUST be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` AND as a removal task in `Agent Execution Runbook`.

## Security & Privacy

> Reference: `docs/security.md` § Security Checklist for New Features. Check all that apply; skip inapplicable rows.

- [ ] **New API route** — `requireFamilyMember`/`requireFamilyMemberHono` applied? Rate-limited if auth-adjacent?
- [ ] **New DB table/column** — RLS enabled deny-by-default? Family-scoped via `family_members` join?
- [ ] **Role-gated mutation** — `familyRole` checked at API layer (not RLS alone)?
- [ ] **User input** — Zod schema in your validators package? `schema.parse()` called in handler?
- [ ] **PII** — absent from logs? CDC trigger updated if new column on monitored table?
- [ ] **Redirect URL** — validated via `isAllowedRedirect()`?
- [ ] **Webhook** — signature verified? Secret in env schema?
- [ ] **New secret/env var** — added to `packages/env/src/index.ts`? Stored in GCP Secret Manager?

_If none apply: "None — no new routes, DB writes, secrets, or user input."_

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` for required packages. Ensure `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** Run `pnpm outdated` and spot-check CLI versions (`npx supabase --version`, `npx tsc --version`, `pnpm --version`). Flag any outdated dependencies that may silently block or break implementation. Many infrastructure errors stem from version mismatches between CLI tools and their backend services.
- [ ] **User Context:** Verify read/write access to required files. Request any missing user information up front.
- [ ] **Pending Blockers:** Query Linear for open issues (label `blocker`) relevant to this feature.
- [ ] **Project Context:** Check `docs/knowledge.md` and `docs/decisions.md` for relevant patterns, established decisions, and known gotchas.
- [ ] **Testing & Quality:** Ensure testing strategy aligns with rules in `docs/testing.md`.
- [ ] **Prerequisite Plans:** List `docs/plans/...` plans that must be fully executed and verified BEFORE this one.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** _(new API keys / third-party credentials)_: Verify GCP Secret Manager. Fallback to Vercel env vars. Check GCP Service Account IAM roles.
- [ ] **Schema State** _(any DB reads/writes)_: Confirm exact database state (`docs/data-schema.md`) before finalizing ORM logic.
- [ ] **Architecture & UI** _(new files, routes, or UI components)_: Validate strict adherence to `docs/architecture.md` (monorepo topology). For UI: `docs/styles.md`; for mobile: `docs/setup.md` §6. Reference repos at `/Users/christian/Documents/GitHub/create-t3-turbo` and `/Users/christian/Documents/GitHub/next-hono-drizzle`.
- [ ] **Observability** _(new log points, CDC tables, or OTel spans)_: Verify logging, tracing, and audit conventions align with `docs/observability.md`. Ensure `console.error` structured format, correlation IDs, and CDC/OTel patterns are followed.
- [ ] **Notifications** _(user-facing alerts or toasts)_: Check `docs/notifications.md` for tier classification (1=inline, 2=toast, 3=persistent bell).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

[Define how this feature interacts with the existing database schema and what changes are required.]

### Data Schema Usage (Inputs & Outputs)

[List all existing `docs/data-schema.md` tables and fields that this feature will read from (Input) or write to (Output). e.g.,

- **Input (Read):** `users.id`, `items.title`
- **Output (Write):** `items.status`, `job_audits.log`]
  If no existing fields are used, explicitly state "None".

### Data Schema Changes

[List any new tables, new fields, or modifications to existing fields that need to be added to `docs/data-schema.md`. e.g.,

- **ADD:** `items.new_field` (type: text)
- **MODIFY:** `users.role` (added enum value)]
  If no schema changes are required, explicitly state "None".

## Architecture & Component Changes

[Group files logically (DB, API, Backend, Frontend, Cron, Observability). Separate by headers.]
**CRITICAL:** Justify new file locations using `docs/architecture.md` monorepo topology.
**CRITICAL:** For Frontend/Mobile changes, verify styling/components adhere to `docs/styles.md` and `docs/setup.md` §6.
**CRITICAL:** Use file search to verify `[MODIFY]` files exist. Otherwise list as `[NEW]`.
**CRITICAL:** Explicitly include backend actions to execute newly created Zod schema validations (`schema.parse`).
**CRITICAL:** Observability is automated via Log Drains/CDC (`docs/data-pipeline.md`). You **MUST** mandate `console.error("[Context] Message", payload)` for edge cases escaping auto-capture (orphaned records, fallbacks, API aborts). See `docs/observability.md` for naming conventions, severity mapping, correlation IDs, and vendor label taxonomy.

### Database Migrations

[Define new tables/columns/RLS (`db:diff`). **Do not run `db push` to Dev/Main.** Migrations are pushed **automatically by the Supabase GitHub App Branching Integration** upon PR merge.]

> [\!WARNING]
> **If adding/removing columns on `users`, `families`, or `user_channels` (CDC-monitored tables):**
>
> 1. Update `knownSafeColumns` in `packages/observability/tests/cdc-schema-assurance.integration.test.ts`.
> 2. If column contains PII → update `notify_telemetry_audit()` trigger to scrub it.
> 3. See `docs/data-schema.md` § CDC Audit Triggers for full checklist.

### [Component Area 1]

[Summary of component changes]

#### [MODIFY] `path/to/file.ext`

- **Existence Check:** [Verify file exists first.]
- [Detail logic, schema, or API contracts.]

#### [NEW] `path/to/file.ext`

- [Detail purpose, RLS policies, Zod validation, naming.]

#### [DELETE] `path/to/file.ext`

- [Reason]

### Cron Jobs & Scheduled Tasks

[Define Vercel cron, pg_cron, or Inngest tasks. Must include updating `docs/data-cron-jobs.md`.]

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | [learnings, gotchas] |
| `docs/decisions.md` | [architecture decisions] |
| `docs/architecture.md` | [topology/component changes] |
| `docs/data-schema.md` | [new tables/columns] |
| `docs/data-pipeline.md` | [pipeline changes] |
| `docs/testing.md` | [new test files/patterns] |
| `docs/observability.md` | [new log names/spans] |

_Remove rows with no change. Add rows for any other affected docs._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | [Migration to revert; safe if additive-only] | `npx supabase db push --linked` after reverting file |
| **Code** | [Git revert SHA or feature flag to disable] | `git revert {COMMIT}` |
| **Risk window** | [Gap between DB migration merge and code deploy] | [e.g., "~2 min Vercel build — migration must be additive"] |

_No DB changes: "Code-only — `git revert` sufficient."_

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [\!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a Linear issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the exact next task in the list.
> **Progress Updates:** After checking off each major task, post a structured summary as a Linear comment on the issue per `.claude/workflows/conventions.md`.

**Implementation Tasks (Examples):**

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable criterion (file exists / function signature matches / test passes / specific behaviour observable). Plan-verify reads this line and asserts against it before ticking `[x]`. No task without `Done when:`.

- [ ] **Task 1:** [e.g., Create DB migration (`npx supabase db diff`)]. **Done when:** [e.g., `supabase/migrations/{timestamp}_add_items_status.sql` exists; `npx supabase db push --local` applies cleanly].
- [ ] **Task 2:** [e.g., Implement backend API action `action.ts`]. **Done when:** [e.g., `packages/api/src/items/setStatus.ts` exports `setStatus` with Zod-validated input; integration test in `packages/api/items.integration.test.ts` passes].
- [ ] **Task 3:** [e.g., Update React component `page.tsx`]. **Done when:** [e.g., `apps/web/app/items/page.tsx` renders status badge; Playwright spec `apps/web/e2e/items.spec.ts` confirms user-visible state].

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [\!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):**
>
> - **Backend Pipeline logic MUST be tested in Vitest only**. No Playwright for webhooks/APIs. Mock HTTP and assert DB natively.
> - **End-to-End Integration Testing**: Core data pipelines require writing at least 1 integration test firing the API vs local DB _without_ ORM/DB mocking (`npm run test:integration`).
> - **Playwright strictly for UI tests**. Do not use Playwright E2E unless clicking visual DOM components.
>
> **Playwright E2E Conventions (MANDATORY for new tests):**
>
> - **Authentication:** A `setup` project (`e2e/auth.setup.ts`) logs in once and saves `storageState` to `playwright/.auth/user.json`. All tests in the `chromium` project **automatically start pre-authenticated** — do NOT add manual login logic.
> - **Unauthenticated Tests:** Tests for sign-in, sign-up, or account deletion MUST opt out of shared auth:
>   ```typescript
>   import { test, expect } from "@playwright/test"; // NOT from './fixtures'
>   test.use({ storageState: { cookies: [], origins: [] } });
>   ```
> - **Data Factory:** All test data MUST be generated via `e2e/datafactory/` modules. Never construct inline strings. Use typed factories with overrides to isolate what each test is verifying:
>   ```typescript
>   import { eventData, transientUser } from "./datafactory";
>   const event = eventData({ location: "Custom Venue" }); // override only what matters
>   ```
> - **New factories:** If your feature introduces a new data type, add a new factory module to `e2e/datafactory/` and re-export it from the barrel `index.ts`.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` must have a corresponding test task checked off below. Add tasks if any row is uncovered.
- [ ] **Update existing tests:** Review/adjust unit, integration, and E2E tests for new changes aligned with `docs/testing.md`.
- [ ] **Write new tests:** Draft tests covering new functionality per Testing Strategy. For Playwright, use `e2e/datafactory/` for test data and follow the `storageState` auth conventions above.
- [ ] **Verify observability:** Ensure new feature is observable per `docs/observability.md` — structured `console.error("[Context] Message", payload)` for error paths, correlation IDs (`family_id`, `user_id`, `job_id`) propagated in Inngest events, and CDC-tracked tables include audit triggers. Update `docs/observability.md` if new log names, labels, or tracing scopes are introduced.
- [ ] **Update documentation:** Natively integrate new logic/schemas into `docs/architecture.md`, `docs/data-pipeline.md`, `docs/data-schema.md`, `docs/knowledge.md` and `docs/decisions.md`. Rewrite prose to maintain ground-truth; DO NOT append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `📚 Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** Run `tsc --noEmit` and ESLint to catch syntax/typing/import errors before testing.
- [ ] **Test Synchronization:** [List existing E2E/Playwright tests to update synchronously to prevent CI failures.]
- [ ] **Build Configuration:** [Add new mock files/test configs to `exclude` array in `tsconfig.json` to protect Vercel builds.]
- [ ] **[Test Type] (`path/to/test.spec.ts`):** [Describe flows/unit/E2E additions. Note data hygiene needs.]
- [ ] **Apply local migrations:** If new migration files were created, run `npx supabase db push --local` to apply them to the local Docker DB. Without this, integration tests (e.g., CDC schema assurance) will fail against the stale local schema.
- [ ] **Run all tests:** Execute locally. Pass `pnpm test` and `TEST_REAL_APIS=true pnpm test:integration`. Fix all failures before Gate 4.

> [\!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build, compiler, or test errors during verification, NEVER resolve them via hot fixes or anti-patterns. Strictly follow industry best practices as per `docs/architecture.md` (and its reference repos) and `docs/knowledge.md`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### Manual Verification

> [\!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1:** [Instructions for agent/user to verify feature end-to-end via CLI/DB.]

<!-- bkit:end -->
