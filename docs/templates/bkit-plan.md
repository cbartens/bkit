<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once by the first workflow run for `{FID}`. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. The canonical copy is also stamped with a `bkit:anchor` block recording its base commit; never hand-author or edit it. `@bkit-plan-generate` fills this template. -->

<!-- bkit:start -->

<!-- bkit:managed v5.0.2 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh -->

# [Plan Title] Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.
>
> **Rules:**
>
> - Any tools mentioned below are examples only; swap for actual tools in final output; drop inapplicable.
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Read `.agents/docs.md` → load docs for workflow / step / task; skip missing; cite docs inline where required.
> - Read this document once at session start; do not trust session memory; do not re-read on every loop iteration.
> - Source of truth: literal `[x]` vs `[ ]` checkboxes in this document; `[ ]` means not DONE regardless of context.

## Context & Goals

[High-level overview of problem/feature and why it is necessary; initially set to `PENDING`.]

> Success criteria once in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do not restate success list here.

**Related Issues:**

- [Issue references from plan input (linked/referenced in issue text). Tracker refs only (e.g. `#N — title (state)`); not full content. Dedupe/scope-awareness; not scope mandate. None → `None`. Workflow fetch-context step runs fresh tracker search for reviewers, not this section.]

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Spec

> [!IMPORTANT]
> What good looks like; canonical for the plan phase. Subagents (plan generate, plan review, plan summary) must follow this spec. No plan subagent restates rules; this section = single source of truth for the plan.

- **Narrative:** 1–2 sentences, user POV (not system POV). User action + what they get back. Design → verbatim. Audits only (`docs/audits/`) → user/operator impact from in-scope findings. Neither, or design lacks `## Acceptance Scenario` → both fields = `⚠️ MISSING: no design doc and no audit report — human must provide before plan proceeds`; never fabricate; Gate 1 blocked until human fills.
- **Success Criteria:** <=5 bullets, measurable / testable. Outcomes (e.g. "user sees their event in the list within 2s"), not steps (e.g. "call API, render component"). Design count ≠ 5 → smallest set proving feature. Design → verbatim. Audits only → one bullet per in-scope finding id from `Expected`; no 5-bullet cap.
- **Process Sketch:** Design → plan inherits/refines. same happy-path (`Concrete Example`) + branches (`Edge Cases`) as `WHEN X → THEN Y` (3–7 lines); reuse exact examples, do not invent. Outcomes, not steps.
- **Key Edge Cases:** Design → plan inherits. Concurrency, conflicts, failures, cross-feature — not trivial validation (plan adds that).
- **Edge Cases:** Plan phase — design Key Edge Cases verbatim + validation / error / boundary cases.
- **Concrete Example:** Plan phase only. Role, starting state, numbered steps, observable outcome. One scenario, not a list.
- **Derived Test Matrix:** Plan phase only. One row per testable behaviour → exactly one `Agent Execution Runbook` task. No row without a target file. In-scope audit behaviour → one row.

### Narrative

> Inherited from design; do not rewrite.

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Narrative. No design → per Spec above; initially set to `PENDING`.]

### Success Criteria

> Inherited from design; do not rewrite.

[Copied verbatim from `{FID}-design.md` § Acceptance Scenario → Success Criteria. No design → per Spec above; initially set to `PENDING`.]

### Process Sketch

> Inherited from design; plan may refine. `Concrete Example` (happy path) + `Edge Cases` (branches) as `WHEN X → THEN Y`, not prose — same examples. Do not invent new examples. Sense-check top-level process HERE without prose below. Outcomes, not implementation steps.

- **WHEN** [trigger / user action] **→ THEN** [observable outcome]
- **WHEN** [next step] **→ THEN** [outcome]
- **IF** [edge case / failure — mirrors an Edge Cases row] **→ THEN** [handling]

_notation, e.g._ **WHEN** a user submits the form with a valid file **→ THEN** it is queued and a receipt shown; **IF** the file is malformed **→ THEN** it is rejected inline and nothing is queued.

### Concrete Example

> Plan expands from design.

**Setup:** [User role, existing state, context]

**Steps:**

1. User [does X] → System [responds with Y]
2. User [does X] → System [responds with Y]
3. …

**Outcome:** [End state the user sees that proves success]

### Edge Cases

> Plan expands from design's Key Edge Cases.

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| [Inherited from design Key Edge Cases and plan-added cases] | [Specific behavior] |
| [e.g., concurrent edit from another device] | [e.g., last-write-wins, no crash] |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign tier(s) via **tier-selection rubric** in `docs/testing.md` (behaviour may need more than one). Boundary rows use that doc's rigor — reach real boundary, assert ground-truth signal, `@live` for external / deployed boundaries; do not restate those rules here.
>
> **Discrimination (no false-green):** assertion MUST hit the **affected** surface and FAIL if behaviour broken — not transport status (200/201), not proxy surfaces, never mock away the boundary under test.

**Tier Key** — use these exact tier names in the `Type` column (they must match `docs/testing.md`); pick the **lowest tier that actually exercises** the behaviour (a behaviour may need several):

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift (global gate, not a per-feature row) | `tsc`, lint, and `bkit check` pass on the changed files |
| **Unit** | pure function / single module, no I/O | service parses a payload correctly |
| **Integration** | crosses a LOCAL stateful boundary (own DB / API), no mocks at the boundary, fresh instance | API endpoint enforces tenant isolation against a fresh local instance |
| **@live (golden)** | crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model, payment, deployed schema, RLS) — reach it, assert a ground-truth signal | a real 3rd-party API returns content and a boundary-only identity |
| **E2E** | user-visible UI flow / DOM state | user creates an event and sees it in the list |
| **fresh-DB replay** | new / changed migration or seed (`bkit-tests-migration`) | migration replays from empty and the seed loads |
| **Smoke** | post-deploy health of a deployed surface (global observability gate) | deployed health route returns 200 |

One row per behaviour (copy the tier name from the key above verbatim into `Type`):

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

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

[Proposed names: pages, files, DB tables, routes, API contracts. Breaking changes, DB structure diffs, global layout changes. Use IMPORTANT/WARNING/CAUTION alerts. If none, write "None"; initially set to `PENDING`.]

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".
> **Never a bare question.** Each carries 2-3 options, a recommendation, and default if unanswered — human must decide from the page alone. Canonical plan shape.
> Design → carry its options / recommendation forward where already answered.

- **Assumption:** [what the plan takes as given] → [what breaks if it's wrong]
- **Open Question:** [decision needed] → [who / how to resolve]
  - **Options:** A — [option, trade-off] · B — [option, trade-off] · C — [option, trade-off, optional]
  - **Recommended:** [A] — [why, 1 line]
  - **Default if unanswered:** [what the agent proceeds with]

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do not pass Gate 1 until this checkbox is `[x]`.

---

## Alternative Approaches & Recommendations

[Document rejected paths and why. List future phase recommendations; initially set to `PENDING`.]

**Selection Rule:** pick the approach with the best quality-of-end-state, not the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

## Out of Scope

[Features / fixes excluded to prevent scope creep. Every exclusion is `Exempt` per the rule below, with a reason and a home. If none, write "None"; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| [feature/fix] | [why genuinely-additive] | [design non-goal / follow-up #N / future phase] |

> [!CAUTION]
> **Default = in-scope.** `Exempt` only if genuinely-additive — not required by `Success Criteria`, `Acceptance Scenario` / `Derived Test Matrix` row, or design (non-goals excepted). Required items → runbook task, never deferral; parking here = `Blocking` deferral → plan review / scope-check pulls back. Mirror each `Exempt` row in `docs/deferrals.jsonl`. Audit `LOW` → `Exempt` rows here.

## Suggested Scope Expansion

[Prior work overlapping this plan's surfaces — related open issues, `docs/deferrals.jsonl` deferrals, `docs/failures.jsonl` failures, audit findings the input did not name — surfaced as candidate expansions for the human. Fold `docs/deferrals.jsonl` and `docs/failures.jsonl` ledgers by `key`, highest `ts` wins → read only winning rows where `status` is not `CLOSED`; never read any other rows. If none, write "None"; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| [what it is] | [`#N` / `docs/deferrals.jsonl` / `docs/failures.jsonl` / audit finding id] | [surface / task it touches] | [fold in / keep deferred / needs design decision] |

> [!CAUTION]
> **Candidates, not scope.** Human review only — not runbook tasks, must not expand scope. Fold in only on design scope or explicit human decision → becomes task, leaves list.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **New API Route** — auth guard applied (e.g. a `requireMember`-style check)? Rate-limited if auth-adjacent?
- [ ] **New DB Table/Column** — row / tenant access policy deny-by-default (e.g. RLS)? Tenant-scoped (e.g. via a membership join)?
- [ ] **Role-Gated Mutation** — role checked at the API layer (not data-layer policy alone)?
- [ ] **User Input** — validated by a schema (e.g. Zod) with `parse()` called in the handler?
- [ ] **PII** — absent from logs? Audit/CDC trigger updated if a new column lands on a monitored table?
- [ ] **Redirect URL** — validated against an allow-list?
- [ ] **Webhook** — signature verified? Secret declared in the env schema?
- [ ] **New Secret/Env Var** — added to the env schema? Stored in the project's secret manager (e.g. GCP Secret Manager / Vercel env)?

_If none apply: "None — no new routes, DB writes, secrets, or user input."_

## Pre-Flight / Dependencies

**CRITICAL:** Check off all core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core

Always verify.

- [ ] **Package Management:** Required packages declared; dependency manifest + lockfile in sync (e.g. `package.json` + `pnpm-lock.yaml`, `pyproject.toml` + `uv.lock`).
- [ ] **Dependency Versions:** Run `pnpm bkit:deps:outdated`; spot-check toolchain + stack CLI versions (e.g. `npx tsc --version`, `pnpm --version`, `npx supabase --version`). Flag outdated deps that may silently block implementation — infra errors often = CLI vs backend version mismatch.
- [ ] **Existing-Solution Search (reuse over duplicate):** per capability, three sweeps → `Reuse Inventory`: in-repo (text search for names / strings / near-miss helpers / sibling modules; symbol references via language server when configured; `docs/capabilities.md` when present), dependency (`{framework} {capability} built-in`), ecosystem (`{problem} best practice {current year}`). Empty language-server / capability-map result = inconclusive — absence needs text search. Unrecorded = unsearched. Drives `[MODIFY]` vs `[NEW]`.
- [ ] **User Context:** Verify read / write access to required files. Request missing user information up front.
- [ ] **Project Context:** Fold `docs/knowledge.jsonl` and `docs/decisions.jsonl` each by `key`, highest `ts` wins → read only winning rows where `status` is `ACTIVE` or absent; never read any other rows. Check for relevant patterns, decisions, gotchas.
- [ ] **Testing & Quality:** Ensure testing strategy aligns with `docs/testing.md`.
- [ ] **Prerequisite Plans:** List `docs/plans/...` plans that must be fully executed and verified before this one.

### Conditional

Verify only when applicable.

- [ ] **Secrets & Env Vars:** New API keys or third-party credentials → verify the project's secret store (e.g. GCP Secret Manager, Vercel env vars) and any service-account / IAM roles.
- [ ] **Schema State:** Any DB reads or writes → confirm exact database state against `docs/data-schema.md` before finalizing data-access logic.
- [ ] **Architecture & UI:** New files / routes / UI → `docs/architecture.md` topology; UI/mobile → `docs/design.md`; consult named reference repos.
- [ ] **Observability:** New logs / audit tables / traces → align with `docs/observability.md` (e.g. structured logger calls, correlation IDs, CDC / OTel).
- [ ] **Notifications:** Alerts / toasts → notifications doc via `.agents/docs.md` for tier (e.g. 1=inline, 2=toast, 3=bell).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all applicable boxes above. **do not stop for user permission.** Proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified (or "None" justified).
- [ ] **Reuse Inventory complete:** every capability has a row with non-empty `Search performed` + `Decision`; every `NEW` cites an allowed reason.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

[Define how this feature interacts with the existing database schema and what changes are required; initially set to `PENDING`.]

**Invariant Conformance:** Multi-store or privileged writes → every mutation path maintains every store a read surface depends on, under a compatible privilege, with the returned error actually checked (never swallowed). If a write can fail on privilege/constraint, the plan says how that failure surfaces — not a silent 200.

### Data Schema Usage

[List all existing `docs/data-schema.md` tables and fields that this feature will read from (Input) or write to (Output); initially set to `PENDING`. e.g.,

- **Input (Read):** `users.id`, `items.title`
- **Output (Write):** `items.status`, `job_audits.log`]
  If no existing fields are used, explicitly state "None".

### Data Schema Changes

[List any new tables, new fields, or modifications to existing fields that need to be recorded in `docs/data-schema.md`; initially set to `PENDING`. e.g.,

- **ADD:** `items.new_field` (type: text)
- **MODIFY:** `users.role` (added enum value)]
  If no schema changes are required, explicitly state "None".

## Reuse Inventory

[One row per capability plan introduces, including those search cleared as absent. Author before `Architecture & Component Changes`. No capability → no rows; "None" never substitutes for searching. Design `Reuse & Prior Art` verdicts = starting point; every row still records its own `Search performed`; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Capability | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- |
| [what the plan must do] | `grep -rn "..."`; references to `{symbol}`; `docs/capabilities.md`; `{framework} {capability} built-in` | `path/to/existing` — covers [X], missing [Y] | EXTEND | [what changes in it to close the gap] |
| [capability] | [exact commands / queries run] | None — [what was searched] | new | [reason (a)/(b)/(c)] |

> [!CAUTION]
> **Default = `EXTEND`.** `NEW` only allowed for:
> (a) no candidate — `Search performed` shows the commands establishing absence;
> (b) extending breaks the candidate's contract or callers — name both;
> (c) candidate is a `Supersession Inventory` `DELETE` — replacement, not duplicate.
>
> never accept cleaner-fresh / messy-existing / close-but-different as a `NEW` reason — messy candidate → extend and clean it, in scope. Empty `Search performed` = UNSEARCHED, not `NEW`-eligible.
>
> Each `EXTEND` row must land as `[MODIFY] path/to/existing` in `Architecture & Component Changes` and a task in `Agent Execution Runbook`; each `NEW` row as `[NEW]` carrying the same reason. `[NEW]` with no row = unjustified.

## Architecture & Component Changes

[Group files logically (DB, API, Backend, Frontend, Cron, Observability). Separate by headers; initially set to `PENDING`.]
**CRITICAL:** Justify new file locations per `docs/architecture.md` topology.
**CRITICAL:** Prefer `[MODIFY]` over `[NEW]`. Every `[NEW]` must trace to a `Reuse Inventory` `NEW` row and carry its reason — no parallel reimplementation. Superseded → `Supersession Inventory` as `DELETE`.
**CRITICAL:** Frontend/Mobile → adhere to `docs/design.md`.
**CRITICAL:** Verify `[MODIFY]` files exist (else `[NEW]`). Before changing exported symbol/signature/contract: find callers/importers/schemas/consumers (language-server references when configured + text search), list blast radius.
**CRITICAL:** Include backend actions for new schema validations (e.g. Zod `schema.parse`).
**CRITICAL:** NEVER weaken gate to pass: no type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), deleted assertions, empty `catch` / error-swallowing, mocking-away unit under test. Fix root causes; per-file opt-out needs explicit human sign-off.
**CRITICAL:** Auto-capture (e.g. log drains / CDC) does not replace explicit logging — log edge cases escaping auto-capture with the project's structured logger (e.g. `console.error("[Context] Message", payload)`). See `docs/observability.md` for naming, severity, correlation IDs, label taxonomy.

### Database Migrations

[Define new tables / columns / access policies (e.g. RLS) with your migration tool (e.g. `db:diff`). **NEVER apply to shared remotes by hand** (e.g. `db push` to Dev/Main) — CI's migration lane applies them; see `docs/deployments.md` § Applying migrations at deploy time; initially set to `PENDING`.]

> [!WARNING]
> **If adding/removing columns on CDC/audit-monitored tables (e.g. `users` and the other tenant tables your project monitors):**
>
> 1. Update the monitored-column allow-list in the schema-assurance test (e.g. a `knownSafeColumns` list).
> 2. If a column contains PII → update the audit trigger to scrub it.
> 3. See `docs/data-schema.md` for the full checklist.

### [Component Area 1]

[Summary of component changes; initially set to `PENDING`.]

#### [MODIFY] `path/to/file.ext`

- **Existence Check:** [Verify file exists first.]
- [Detail logic, schema, or API contracts.]

#### [new] `path/to/file.ext`

- **Reuse Check:** [`Reuse Inventory` row + reason (a)/(b)/(c) — why no existing artifact can be evolved.]
- [Detail purpose, access policies (e.g. RLS), input validation (e.g. Zod), naming.]

#### [DELETE] `path/to/file.ext`

- [Reason]

### Cron Jobs & Scheduled Tasks

[Define scheduled tasks (e.g. Vercel cron, pg_cron, Inngest). Record them in the project's cron/scheduled-jobs doc if it has one (resolve via `.agents/docs.md`); initially set to `PENDING`.]

## Supersession Inventory

[Existing artifacts the new code replaces — shared triggers/routes, redundant exports, etc. If plan adds without replacing, write "None"; initially set to `PENDING`.]

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `path/to/old-thing` | `path/to/new-thing` | DELETE | [reason] |

> [!CAUTION]
> **Default = `DELETE`.** `RETAIN-WITH-REASON` only allowed for:
> (a) external contract — atomic migration impossible (third-party callers, public API);
> (b) staged rollout with kill-date and follow-up issue link.
>
> never accept `@deprecated` and still exported as a resolution. Each `DELETE` row must be mirrored as `[DELETE] path/to/file` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook`.

## Documentation Updates

> Docs this change touches only; delete rest. Core below; others via `.agents/docs.md`. Code-change treatment — rewrite prose, no lazy bullet appends.

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

_Delete rows with no change; add a row per other affected doc (resolve via `.agents/docs.md`)._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | [Corrective migration that undoes the change; safe if additive-only] | merged migrations are immutable — ship the corrective migration through CI's migration lane; dev full reset → `docs/deployments.md` § Dev rollback runbook |
| **Code** | [Git revert SHA or feature flag to disable] | `git revert {COMMIT}` |
| **Risk window** | [Gap between DB migration merge and code deploy] | [e.g., "~2 min Vercel build — migration must be additive"] |

_No DB changes: "Code-only — `git revert` sufficient."_

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**; initially set to `PENDING`.]

> [!IMPORTANT]
> **Continuous Execution:** Run runbook autonomously; no user permission at Gates; `[x]` as you go.
> **Step Isolation:** Finish task (verify + checkbox) before next.
> **Integration Shape:** may suggest PR / commit / sequencing — advisory, never a gate; one PR for all tasks always OK. Do not specify merge method.

**Implementation Tasks (Examples):**

> Every task MUST include `**Done when:**` — terse, testable, codebase-verifiable (file exists / signature matches / test passes / behaviour observable). Plan-verify asserts before `[x]`. No task without `Done when:`. One task per in-scope audit finding id; group only on one shared root cause in report — every id still named.
>
> **Tests ship with their task.** Task adding / changing logic → names its own unit tests in `Done when`, matrix row or not; tests it breaks → fixed in same task. never defer task tests to later tasks to avoid splits that leave untested code and drop coverage gates.
>
> **Build order and test source.** Order tasks by build dependency (schema → API → UI). Behaviour tests only from `Derived Test Matrix` rows — do not invent. Boundary-crossing tasks (DB / API / model / network / migration) carry paired non-mock `Done when` tests; pure-function tasks exempt from pairing, not from unit tests.

- [ ] **Task 1:** [e.g., Create DB migration (`npx supabase db diff`)]. **Done when:** [e.g., `supabase/migrations/{timestamp}_add_items_status.sql` exists; `npx supabase db push --local` applies cleanly].
- [ ] **Task 2:** [e.g., Implement backend API action `action.ts`]. **Done when:** [e.g., `packages/api/src/items/setStatus.ts` exports `setStatus` with Zod-validated input; unit test `packages/api/src/items/setStatus.test.ts` covers each status transition; integration test in `packages/api/items.integration.test.ts` passes].
- [ ] **Task 3:** [e.g., Update React component `page.tsx`]. **Done when:** [e.g., `apps/web/app/items/page.tsx` renders status badge; Playwright spec `apps/web/e2e/items.spec.ts` confirms user-visible state].

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row and its search still holds — reusable artifact found mid-build → add a row, fold code into it; every `EXTEND` landed as a modification of the named artifact, not a parallel file. No type-system escapes (e.g. TS `as any` / `as unknown as` / `@ts-ignore`, Python `# type: ignore`), linter disables (e.g. `eslint-disable`, `//nolint`), test skips (e.g. `.skip`, `xfail`), empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Backend / pipeline logic** — test at the unit/integration tier (e.g. Vitest), not through a browser. Mock HTTP and assert against the real datastore natively.
> - **End-to-end integration** — core data paths need at least 1 integration test firing the real API against a local DB _without_ ORM/DB mocking.
> - **UI E2E (browser or device) for UI only** (e.g. Playwright) — don't drive a UI for non-visual logic.
>
> **UI E2E Conventions** — test-auth + data-factory per `docs/testing.md`: shared `setup` logs in once, reuses auth state (sign-in / sign-up / account-deletion tests opt out); typed factories with per-test overrides, not inline strings.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Each `Acceptance Scenario → Derived Test Matrix` row → one runbook task whose `Done when` carries its test; gaps → add to that task, not here.
- [ ] **Sweep existing tests:** Each task fixed the tests it broke; full suite green per `docs/testing.md`. Fix only what tasks missed.
- [ ] **Sweep new tests:** Each task's `Done when` tests exist and pass per Testing Strategy; add only what tasks missed — not where tests are first written. Reuse data factories + auth conventions (above) for UI E2E tests.
- [ ] **Verify observability:** Observable per `docs/observability.md` — errors logged via the project's structured logger (e.g. `console.error("[Context] Message", payload)`), correlation IDs through pipeline, audit coverage on monitored tables where the project has it (e.g. audit / CDC triggers); update doc for new log names / labels / tracing scopes.
- [ ] **Update documentation:** Integrate logic/schemas into affected docs — `docs/architecture.md`, `docs/data-schema.md`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, others via `.agents/docs.md`. Rewrite ground-truth prose; do not append lazy bullet points.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, not merge gates.** Only `Agent Execution Runbook` `Done when` lines gate merge; nothing here does. Do not write "before merge" on untickable boxes — CI/human-only preconditions (lane RUN, deployed state, operator step) unenforceable. Work that MUST block merge → runbook task + codebase-verifiable `Done when`; lane that must run → CI config, not plan prose.

### Automated Tests

- [ ] **Full Local Gate Suite:** Full local gates — deepest declared `bkit:gate:*` script up to integration (`pnpm bkit:gate:static-unit-integration`, else `pnpm bkit:gate:static-unit`; e.g. typecheck, lint, `format:check`, prose, `slop:delta`, unit, in-process integration) + `bkit check`. Do not weaken gates (anti-suppression CRITICAL under Architecture & Component Changes).
- [ ] **Test Synchronization:** [List existing E2E tests (e.g. Playwright) to update synchronously to prevent CI failures.]
- [ ] **Build Configuration:** [Keep new test-only files (mocks, test configs) out of the production build (e.g. `tsconfig.json` `exclude`).]
- [ ] **[Test Type] (`path/to/test.spec.ts`):** [Describe flows/unit/E2E additions. Note data hygiene needs.]
- [ ] **Apply local migrations:** New migrations → apply locally (e.g. `npx supabase db push --local`); else integration tests fail on stale schema.
- [ ] **Run all tests:** Local unit + integration (e.g. `pnpm test`, `pnpm test:integration`); fix failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Build / compiler / test errors during verification → never hot-fix or anti-pattern; follow `docs/architecture.md` + named reference repos. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT — `[x]` all boxes below. **do not stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results, API responses) gathered.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** Run during build wherever a CLI can (Dashboard Ban below). An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (e.g. `gh`, `vercel`, `npx supabase`) to verify CI/CD pipelines instead of asking users to check dashboards.

- [ ] **Step 1:** [Instructions for agent/user to verify feature end-to-end via CLI/DB.]

<!-- bkit:end -->
