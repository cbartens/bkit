<\!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# [Plan Title] Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** Core docs named inline; other docs per project; no stack assumed.
>
> - **Docs:** Universal/core docs (`.agents/docs.md` § Universal Documents — architecture, technology, data-schema, security, design, testing, deployments, observability, knowledge/decisions/deferrals/failures ledgers) named below. OTHER domain → consult `.agents/docs.md`, cite project doc inline; skip domains with no doc; never invent path. Never name doc's internal section.
> - **Stack:** Concrete tools below = **examples only**. Swap Vercel / Supabase / Inngest / etc for actual stack; drop inapplicable rows/checks.

## Context & Goals

[High-level overview of problem/feature. Why is it necessary?]

> Success criteria ONCE in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do NOT restate success list here.

**Related Issues:**

- [Issue references from plan input (linked/referenced in issue text). Tracker refs ONLY (e.g. `#N — title (state)`); NOT full content. Dedupe/scope-awareness; NOT scope mandate. None → `None`. Workflow fetch-context step runs fresh tracker search for reviewers, NOT this section.]

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Spec — what good looks like _(canonical for the plan phase)_

> [!IMPORTANT]
> Subagents (plan generate, plan review, plan summary) MUST follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). Describes what the user does and what they get back.
- **Success Criteria:** <=5 bullets, each measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), NOT implementation steps (e.g. "call API, render component"). If design doc lists fewer or more, prefer the smallest set that still proves the feature works.
- **Process Sketch _(design produces; plan inherits / refines)_:** the SAME happy-path scenario (`Concrete Example`) and branches (`Edge Cases`) rendered as a glanceable `WHEN X → THEN Y` flow — process, NOT prose; reuse those exact examples, do NOT invent new ones. 3–7 lines so a human sense-checks the top-level process without reading prose. Outcomes, NOT implementation steps.
- **Key Edge Cases _(design phase produces; plan phase inherits)_:** Design-shaping only — concurrency, conflict resolution, failure modes, cross-feature interactions. NOT trivial input validation (the plan adds those).
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + adds plan-level cases (validation, error paths, boundary conditions).
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome. One scenario, not a list.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task in the Agent Execution Runbook. No row without a target file.

**Design-missing fallback:** If `{FID}-design.md` is absent or has no `## Acceptance Scenario` section, replace the inherited Narrative and Success Criteria fields with `⚠️ MISSING: design doc has no Acceptance Scenario — human must provide before plan proceeds`. Do NOT fabricate either field; gate-1 stays blocked until human fills both.

### Narrative _(inherited from design — do not rewrite)_

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Narrative. Design-missing → use fallback string per Spec above.]

### Success Criteria _(inherited from design — do not rewrite)_

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Success Criteria. Design-missing → use fallback string per Spec above.]

### Process Sketch _(inherited from design — plan may refine)_

> The `Concrete Example` (happy path) and `Edge Cases` (branches) in process form — the SAME examples, as `WHEN X → THEN Y` not prose. Do NOT invent new examples. Sense-check the top-level process HERE without reading the prose below. Outcomes, not implementation steps.

- **WHEN** [trigger / user action] **→ THEN** [observable outcome]
- **WHEN** [next step] **→ THEN** [outcome]
- **IF** [edge case / failure — mirrors an Edge Cases row] **→ THEN** [handling]

_notation, e.g._ **WHEN** a user submits the form with a valid file **→ THEN** it is queued and a receipt shown; **IF** the file is malformed **→ THEN** it is rejected inline and nothing is queued.

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

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md` (a behaviour may need more than one). Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.
>
> **Discrimination (no false-green):** each row's assertion MUST observe the **affected** surface and would FAIL if the behaviour were broken — never assert transport status (200/201) or a derived proxy surface, never mock away the boundary under test.

**Tier key** — use these exact tier names in the `Type` column (they MUST match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc` + lint + `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces RLS against a fresh local DB |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content AND a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migration`) | migration replays from empty + the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| [e.g., Happy path: user creates event, sees it in list] | E2E (Playwright) | `apps/web/e2e/[feature].spec.ts` |
| [e.g., Service correctly parses payload] | Unit (Vitest) | `packages/[pkg]/[module].test.ts` |
| [e.g., API endpoint enforces RLS] | Integration (Vitest) | `packages/api/[feature].integration.test.ts` |
| [e.g., Real 3rd-party API returns expected shape AND a boundary-only identity — not "did not throw"] | @live (golden) | `packages/[pkg]/[feature].live.test.ts` |
| [e.g., New migration replays from empty + seed loads] | fresh-DB replay (bkit-tests-migration) | `supabase/migrations/*` (replayed by `bkit-tests-migration`) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

[Proposed names: pages, files, DB tables, routes, API contracts. Breaking changes, DB structure diffs, global layout changes. Use IMPORTANT/WARNING/CAUTION alerts. If none, write "None".]

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this plan relies on. Each unresolved question is a risk — a wrong assumption breaks everything downstream. If none, write "None".
> **Never a bare question.** Every open question carries 2-3 concrete options, a recommendation, and the default applied if nobody answers — a human confirming this section must be able to decide from what is on the page. _(Canonical shape for the plan.)_

- **Assumption:** [what the plan takes as given] → [what breaks if it's wrong]
- **Open question:** [decision needed] → [who / how to resolve]
  - **Options:** A — [option, trade-off] · B — [option, trade-off] · C — [option, trade-off, optional]
  - **Recommended:** [A] — [why, 1 line]
  - **Default if unanswered:** [what the agent proceeds with]

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

[Document rejected paths and why. List future phase recommendations.]

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

[Features/fixes excluded to prevent scope creep. Every exclusion is `Exempt` per the rule below, with a reason + a home. If none, write "None".]

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| [feature/fix] | [why genuinely-additive] | [design non-goal / follow-up #N / future phase] |

> [!CAUTION]
> **Default = in-scope.** An item is `Exempt` ONLY if genuinely-additive — NOT required by `Success Criteria`, an `Acceptance Scenario` / `Derived Test Matrix` row, or a design section (declared non-goals excepted). Anything so required is an `Agent Execution Runbook` task, NEVER a deferral; parking it here is a `Blocking` deferral that plan review / scope-check pull back into scope. Mirror each `Exempt` row in `docs/deferrals.jsonl`.

## Suggested Scope Expansion

[Prior work overlapping this plan's surfaces — related open issues, `docs/deferrals.jsonl` deferrals, `docs/failures.jsonl` failures — surfaced as candidate expansions for the human. If none, write "None".]

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| [what it is] | [`#N` / `docs/deferrals.jsonl` / `docs/failures.jsonl`] | [surface / task it touches] | [fold in / keep deferred / needs design decision] |

> [!CAUTION]
> **Candidates, not scope.** Entries are surfaced for human review; they do NOT become `Agent Execution Runbook` tasks and MUST NOT expand plan scope. Fold one in only once it traces to design scope or an explicit human decision — then it becomes a task and leaves this list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **New API route** — auth guard applied (e.g. a `requireMember`-style check)? Rate-limited if auth-adjacent?
- [ ] **New DB table/column** — row-level security enabled deny-by-default? Tenant-scoped (e.g. via a membership join)?
- [ ] **Role-gated mutation** — role checked at the API layer (not RLS alone)?
- [ ] **User input** — validated by a schema (e.g. Zod) with `parse()` called in the handler?
- [ ] **PII** — absent from logs? Audit/CDC trigger updated if a new column lands on a monitored table?
- [ ] **Redirect URL** — validated against an allow-list?
- [ ] **Webhook** — signature verified? Secret declared in the env schema?
- [ ] **New secret/env var** — added to the env schema? Stored in the project's secret manager (e.g. GCP Secret Manager / Vercel env)?

_If none apply: "None — no new routes, DB writes, secrets, or user input."_

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` for required packages. Ensure `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** Run `pnpm outdated` and spot-check CLI versions (`npx tsc --version`, `pnpm --version`, plus any stack CLIs — e.g. `npx supabase --version`). Flag any outdated dependencies that may silently block or break implementation. Many infrastructure errors stem from version mismatches between CLI tools and their backend services.
- [ ] **Existing-solution search (reuse over duplicate):** grep/read for existing implementations of this capability; prefer extending them. Search `{framework} {capability} built-in` / `{problem} best practice {current year}` before writing custom. Every planned `[NEW]` artifact must justify why an existing one can't be evolved.
- [ ] **User Context:** Verify read/write access to required files. Request any missing user information up front.
- [ ] **Pending Blockers:** Query the configured issue tracker for open issues (label `blocker`) relevant to this feature.
- [ ] **Project Context:** Check `docs/knowledge.jsonl` and `docs/decisions.jsonl` for relevant patterns, established decisions, and known gotchas.
- [ ] **Testing & Quality:** Ensure testing strategy aligns with `docs/testing.md`.
- [ ] **Prerequisite Plans:** List `docs/plans/...` plans that must be fully executed and verified BEFORE this one.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** _(new API keys / third-party credentials)_: Verify the project's secret store (e.g. GCP Secret Manager, Vercel env vars) and any service-account / IAM roles.
- [ ] **Schema State** _(any DB reads/writes)_: Confirm exact database state against `docs/data-schema.md` before finalizing data-access logic.
- [ ] **Architecture & UI** _(new files, routes, or UI components)_: Validate strict adherence to `docs/architecture.md` (topology); for UI/mobile, `docs/design.md`. Consult any reference repos those docs name.
- [ ] **Observability** _(new log points, audit tables, or trace spans)_: Verify logging, tracing, and audit conventions align with `docs/observability.md` — e.g. structured `console.error`, correlation IDs, and any CDC/OTel patterns it defines.
- [ ] **Notifications** _(user-facing alerts or toasts)_: Check the project's notifications doc, if any (resolve via `.agents/docs.md`), for tier classification (e.g. 1=inline, 2=toast, 3=persistent bell).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

[Define how this feature interacts with the existing database schema and what changes are required.]

**Invariant conformance** _(multi-store or privileged writes)_: every mutation path maintains every store a read surface depends on, under a compatible privilege, with the returned error actually checked (never swallowed). If a write can fail on privilege/constraint, the plan says how that failure surfaces — not a silent 200.

### Data Schema Usage (Inputs & Outputs)

[List all existing `docs/data-schema.md` tables and fields that this feature will read from (Input) or write to (Output). e.g.,

- **Input (Read):** `users.id`, `items.title`
- **Output (Write):** `items.status`, `job_audits.log`]
  If no existing fields are used, explicitly state "None".

### Data Schema Changes

[List any new tables, new fields, or modifications to existing fields that need to be recorded in `docs/data-schema.md`. e.g.,

- **ADD:** `items.new_field` (type: text)
- **MODIFY:** `users.role` (added enum value)]
  If no schema changes are required, explicitly state "None".

## Architecture & Component Changes

[Group files logically (DB, API, Backend, Frontend, Cron, Observability). Separate by headers.]
**CRITICAL:** Justify new file locations per `docs/architecture.md` topology.
**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` MUST state **why existing artifact can't be evolved** — no parallel reimplementation. Superseded → `Supersession Inventory` as `DELETE`.
**CRITICAL:** Frontend/Mobile → adhere to `docs/design.md`.
**CRITICAL:** Verify `[MODIFY]` files exist (else `[NEW]`). Before changing exported symbol/signature/contract: grep callers/importers/schemas/consumers, list blast radius.
**CRITICAL:** Include backend actions for new schema validations (e.g. Zod `schema.parse`).
**CRITICAL:** NEVER weaken gate to pass: no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / deleted assertions / empty `catch` / error-swallowing / mocking-away unit under test. Fix root causes; per-file opt-out needs explicit human sign-off.
**CRITICAL:** Automated observability (log drains / CDC) still mandates `console.error("[Context] Message", payload)` for edge cases escaping auto-capture. See `docs/observability.md` for naming, severity, correlation IDs, label taxonomy.

### Database Migrations

[Define new tables/columns/RLS (`db:diff`). **Do not run `db push` to Dev/Main.** Migrations are applied by your migration/branching integration (e.g. the Supabase GitHub branching app) upon PR merge — follow `docs/deployments.md`.]

> [!WARNING]
> **If adding/removing columns on CDC/audit-monitored tables (e.g. `users` and the other tenant tables your project monitors):**
>
> 1. Update the monitored-column allow-list in the schema-assurance test (e.g. a `knownSafeColumns` list).
> 2. If a column contains PII → update the audit trigger to scrub it.
> 3. See `docs/data-schema.md` for the full checklist.

### [Component Area 1]

[Summary of component changes]

#### [MODIFY] `path/to/file.ext`

- **Existence Check:** [Verify file exists first.]
- [Detail logic, schema, or API contracts.]

#### [NEW] `path/to/file.ext`

- [Detail purpose, access/RLS policies, input validation (e.g. Zod), naming.]

#### [DELETE] `path/to/file.ext`

- [Reason]

### Cron Jobs & Scheduled Tasks

[Define scheduled tasks (e.g. Vercel cron, pg_cron, Inngest). Record them in the project's cron/scheduled-jobs doc if it has one (resolve via `.agents/docs.md`).]

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

## Documentation Updates

> List only docs this change actually touches; delete the rest. Core docs named below; for any OTHER affected doc resolve it via `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/knowledge.jsonl` | [learnings, gotchas] |
| `docs/decisions.jsonl` | [architecture decisions] |
| `docs/architecture.md` | [topology/component changes] |
| `docs/data-schema.md` | [new tables/columns] |
| `docs/testing.md` | [new test files/patterns] |
| `docs/observability.md` | [new log names/spans] |

_Delete rows with no change; add a row per other affected doc (resolve via `.agents/docs.md`)._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | [Migration to revert; safe if additive-only] | re-apply via your migration CLI (e.g. `npx supabase db push --linked`) after reverting the file |
| **Code** | [Git revert SHA or feature flag to disable] | `git revert {COMMIT}` |
| **Risk window** | [Gap between DB migration merge and code deploy] | [e.g., "~2 min Vercel build — migration must be additive"] |

_No DB changes: "Code-only — `git revert` sufficient."_

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → **DO NOT fail silently**. Create tracker issue (label `blocker`) with context before stopping, via configured tracker MCP.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing entries first).
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Progress Updates:** After each major task, post structured summary as issue comment via configured tracker MCP (`.agents/rules.md` § Tracker MCP).

**Implementation Tasks (Examples):**

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable criterion (file exists / function signature matches / test passes / specific behaviour observable). Plan-verify reads this line and asserts against it before ticking `[x]`. No task without `Done when:`.

- [ ] **Task 1:** [e.g., Create DB migration (`npx supabase db diff`)]. **Done when:** [e.g., `supabase/migrations/{timestamp}_add_items_status.sql` exists; `npx supabase db push --local` applies cleanly].
- [ ] **Task 2:** [e.g., Implement backend API action `action.ts`]. **Done when:** [e.g., `packages/api/src/items/setStatus.ts` exports `setStatus` with Zod-validated input; integration test in `packages/api/items.integration.test.ts` passes].
- [ ] **Task 3:** [e.g., Update React component `page.tsx`]. **Done when:** [e.g., `apps/web/app/items/page.tsx` renders status badge; Playwright spec `apps/web/e2e/items.spec.ts` confirms user-visible state].

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` justified against extending an existing artifact; no `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier (e.g. Vitest), not through a browser. Mock HTTP and assert against the real datastore natively.
> - **End-to-end integration** — core data paths need at least 1 integration test firing the real API against a local DB _without_ ORM/DB mocking.
> - **Browser E2E for UI only** (e.g. Playwright) — don't drive a browser for non-visual logic.
>
> **Browser E2E conventions** — follow the project's test-auth and data-factory conventions (see `docs/testing.md`). Typically: a shared `setup` project logs in once and reuses stored auth state (tests for sign-in / sign-up / account-deletion opt out explicitly), and all test data comes from typed factories with per-test overrides rather than inline strings.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` must have a corresponding test task checked off below. Add tasks if any row is uncovered.
- [ ] **Update existing tests:** Review/adjust unit, integration, and E2E tests for new changes aligned with `docs/testing.md`.
- [ ] **Write new tests:** Draft tests covering new functionality per Testing Strategy — reuse the project's data factories and auth-state conventions (above) for browser tests.
- [ ] **Verify observability:** Ensure the new feature is observable per `docs/observability.md` — e.g. structured `console.error("[Context] Message", payload)` for error paths, correlation IDs propagated through your event pipeline, and audit triggers on monitored tables. Update `docs/observability.md` if new log names, labels, or tracing scopes are introduced.
- [ ] **Update documentation:** Natively integrate new logic/schemas into every affected doc — `docs/architecture.md`, `docs/data-schema.md`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, plus any others (resolve via `.agents/docs.md`) — as applicable. Rewrite prose to maintain ground-truth; DO NOT append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** Run the project's complete local gate set — typecheck (`tsc --noEmit`), lint, `format:check`, prose, `slop:delta`, and `bkit check` — plus the unit + in-process integration tests. Do NOT weaken any gate to pass (see the anti-suppression CRITICAL under Architecture & Component Changes).
- [ ] **Test Synchronization:** [List existing E2E tests (e.g. Playwright) to update synchronously to prevent CI failures.]
- [ ] **Build Configuration:** [Add new mock files/test configs to `exclude` array in `tsconfig.json` to protect production builds.]
- [ ] **[Test Type] (`path/to/test.spec.ts`):** [Describe flows/unit/E2E additions. Note data hygiene needs.]
- [ ] **Apply local migrations:** If new migration files were created, apply them to your local DB (e.g. `npx supabase db push --local`). Without this, integration tests (e.g. schema assurance) will fail against the stale local schema.
- [ ] **Run all tests:** Execute locally. Pass the unit and integration suites (e.g. `pnpm test` and `pnpm test:integration`). Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades**: If you encounter build, compiler, or test errors during verification, NEVER resolve them via hot fixes or anti-patterns. Strictly follow industry best practices as per `docs/architecture.md` (and any reference repos it names) and `docs/knowledge.jsonl`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (e.g. `gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1:** [Instructions for agent/user to verify feature end-to-end via CLI/DB.]

## Merge Method

**Merge method: always squash.** Plans MUST NOT propose `rebase` or `merge-commit` as the integration method into `dev`. Default is hardcoded to `gh pr merge --squash --delete-branch --body ""`. If a plan needs commit-boundary preservation for ordering reasons, decompose into separate PRs rather than requesting a non-squash merge.

<!-- bkit:end -->
