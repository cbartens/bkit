<!-- bkit:anchor
baseSha: e1616f88610ca307b85928b6df003178c37964a5
baseRef: origin/dev
-->

# Run Only Workflow Steps Tasks Actually Need — Sub-Plan 4 of 4: Routing, Ledgers, Docs, Mirrors, Final Gate Suite

**Parent Plan:** [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md)

**Siblings:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) (skip recording) · [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) (input tolerance) · [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) (applicability predicates)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **This sub-plan closes the plan.** Task 22 requires **every prior task in every sub-plan**, runs the mirror regen once, and carries the whole-plan gate suite. The seven live Manual Verification runs for the entire feature are here.

## Context & Goals

The parent plan's diagnosis: the five phases are already independently invocable — `bkit-auto.md` reads `{PHASE}` as a literal argument and never checks that design ran before plan; `bkit-plan.md:266` treats an empty `PARENT_FID` as expected input, not a workaround; `/bkit-debug` takes an FID and mints its own worktree. So there is no chain to unlock. What is missing is that **nothing chooses the entry point and nothing records the choice**.

**This sub-plan does item 4 of the parent plan's four, plus the closing wave:**

- A **plan → design escalation verdict**: `bkit-plan-generate` writes a second artifact, and a new 🤖 Step 3.5 reads it before the Step 5 fan-out. A plan resting on open decisions with real alternatives hands to design, costing one wasted generate run.
- Closing the **debug entry gap**: a bug a human just reported, with no failing test yet, currently gets a green no-op — the workflow finishes clean having proved only that the existing suite still passes. Attempt 1 with `TEST_VERDICT` = PASS now records `NO-REPRO` and names `/bkit-plan`.
- Then the ledgers, the docs, the mirror regen and the full gate run.

**One invariant does not move.** `bkit-build.md:206` (`**If** existing docs/plans/{YYYYMM}/{FID}-plan.md → reuse FID. **Else** → **Failure Path**.`) stays exactly as it is — plan is the floor for all feature work, so nothing can downgrade below it. That is also why escalation needs no human approval gate: the only automatic move available is upward.

**Related Issues:**

- `#442 — Run only workflow steps tasks actually need (open)` — this plan's issue.

---

## 👤 Acceptance Scenario _(contract confirmed once in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1)_

> The full Narrative, Success Criteria, Process Sketch and Concrete Example are in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md). The slices this sub-plan owns are below. Do NOT re-ask the human here.

### Narrative _(inherited from the parent plan — do not rewrite)_

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria advanced by this sub-plan

- A plan resting on open decisions with real alternatives stops before the Step 5 fan-out and hands to design; a bug with no failing test is routed to plan rather than closing debug green.

Task 22 additionally proves, for the plan as a whole, that every sub-plan's work reaches a real consumer installed from the built `dist/`.

### Process Sketch _(slices owned here)_

- **WHEN** the generated plan rests on open decisions with real alternatives **→ THEN** plan stops before the review fan-out and hands to design, costing one wasted generate run.
- **IF** debug is entered on a bug with no failing test **→ THEN** the run records `NO-REPRO` and names `/bkit-plan` as the next action instead of reporting a clean pass.

### Concrete Example _(the routing this sub-plan adds)_

**Setup:** the parent plan's `/bkit-plan #900` run — a one-file CLI help-string fix.

**Steps:**

1. Maintainer runs `/bkit-plan #900` → workflow mints `feat/900-cli-help-copy`, writes `plan-input.md`, invokes `@bkit-plan-generate`. Generate creates two artifacts: `plan-v1-draft.md` and `plan-escalation.md`.
2. `plan-escalation.md` reports `Escalate: FALSE` (the draft rests on no open architectural decision) → Step 3.5 reads `PLAN_ESCALATE` = FALSE and proceeds to Step 4.
3. Workflow closes; `docs/plans/202608/900-cli-help-copy-plan.md` is the canonical plan.

**Outcome:** Step 3.5 invokes no subagent and adds nothing to any invocation count. Had `Escalate` been `TRUE`, the run would have recorded `plan-escalate`, posted a comment naming `/bkit-design {ISSUE_ID}`, run the Close Workflow and stopped — one wasted generate run, and no reviewer invoked.

### Edge Cases _(rows owned by this sub-plan)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Escalation fires on a re-run of a plan that already escalated once | The escalation close is idempotent — it records the verdict and stops; it never creates a second design |
| Debug entered on a green tree at attempt 1 | Records `NO-REPRO` and names `/bkit-plan`; does not report a clean debug pass |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md`. Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal; do not restate those rules here.
>
> **Discrimination (no false-green):** each row's assertion MUST observe the **affected** surface and would FAIL if the behaviour were broken.

**Tier Key** — bkit's own tiers per `docs/testing.md` § Tiers: Unit (`*.test.ts`, in-process, no real subprocess), Integration (`*.integration.test.ts`, multi-module or spawned `bkit` via `tsx`), Shell (`tests/*.bats`, cross-process, real files and exit codes). bkit has no browser, DB or deploy, so there is no E2E, `@live`, fresh-DB-replay or Smoke tier. Static is the global gate, not a per-feature row.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `bkit-plan.md` Step 3 asserts **both** `plan-v1-draft.md` and `plan-escalation.md` exist and are non-empty, its `plan-generate` `step-done` `artifacts` array names both, and Gate 3's artifact / PENDING items name both | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Plan Step 3.5 sets `PLAN_ESCALATE` in `TRUE\|FALSE`; the TRUE route reaches the escalation close without naming any Step 5 reviewer, and its close is entered exactly once per run (no loop back into Step 3) | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Debug Step 3 `TEST_VERDICT` = PASS at attempt 1 routes to a `NO-REPRO` outcome naming `/bkit-plan`, not to the clean-pass close | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `.bkit/prompts.md` documents every file in `.bkit/prompts/` after the deletion and additions (catalog parity, file → doc direction) | Unit (Vitest) | `.bkit/src/bkit-catalog-parity.test.ts` |
| A scratch consumer installed from the built `dist/` receives the extended `bkit-status-route.sh` and the re-rendered workflows, and `bkit check` reports no drift | Integration (Vitest, spawned `bkit` via `tsx` on an `os.tmpdir()` consumer) | `.bkit/src/bkit-install.integration.test.ts` |
| A scratch consumer **seeded with** `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, then upgraded, carries none of the four afterwards — the observable proof the mirror-prune path fired | Integration (Vitest, spawned `bkit` via `tsx` on an `os.tmpdir()` consumer) | `.bkit/src/bkit-install.integration.test.ts` |

The other 21 matrix rows belong to sub-plans 1, 2 and 3; the routing table is in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md) § Derived Test Matrix.

## 👤 Breaking Changes & Naming Review _(alerts owned by this sub-plan; confirmed once in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1)_

**New names introduced by this sub-plan:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `PLAN_ESCALATE` | workflow variable, `TRUE\|FALSE` | `bkit-plan.md` Step 3.5 |
| `plan-escalate` / `design-escalated` | `status.jsonl` step keys | `bkit-plan.md` |
| `NO-REPRO` | debug outcome label | `bkit-debug.md` Step 3 / Step 9 |

`plan-escalation.md` is a new artifact rather than a header on `plan-v1-draft.md`; see Open Question 5. It lands in the log directory beside the existing plan artifacts, so nothing about the canonical plan's shape changes.

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the `PASS|CONCERNS|FAIL` verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract. Existing plan `step-done` keys (`plan-review`, `plan-scope-check`, …) are unchanged — Step 3.5 is numbered `3.5` precisely so nothing renumbers.

## 👤 Open Questions & Assumptions _(confirmed once in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1)_

**Assumptions owned by this sub-plan:**

- **Assumption:** the `.bkit/workflows.md` header line `bkit-plan.md # Workflow 2/6 — 12 steps` (`:23`) counts _numbered_ steps, so adding Step 3.5 makes it 13 → if that count is instead meant as "steps 1..12" the line needs different wording; either way it is stale after Task 17 and is in that task's scope.
- **Assumption (template divergence, deliberate):** `docs/plans/template.md:53` § Design-Missing Fallback says a standalone plan replaces Narrative and Success Criteria with the `⚠️ MISSING …` string and does not fabricate either. This plan authors both from the issue's agreed-approach comment, marked with a `⚠️` note, following shipped precedent (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md:75-85`). The protective intent still holds because Gate 1 human confirmation gates both fields → if the human prefers the template letter, revert both fields to the MISSING string; if the precedent is right, the fallback clause needs amending to cover "standalone plan with a complete issue-side statement of intent". Either way it is a decision here, not a habit — and amending the template is **not** in this plan's scope.

---

- **Open Question 5:** Where does the escalation verdict come from? → human decision.
  - **Options:** A — a separate one-line artifact, `plan-escalation.md`, written by `bkit-plan-generate` alongside the draft, carrying `Escalate: TRUE|FALSE` + `<!-- verdict:end -->` and a one-paragraph reason. Keeps `plan-v1-draft.md` header-free, so `bkit-plan-update`'s `cp`-then-prepend needs no change and no stray header reaches the canonical plan. · B — an `Escalate:` header on `plan-v1-draft.md` itself. One fewer file; but `plan-update` copies the prior version verbatim and prepends its own `Verdict: PENDING` header, so the escalate line would end up buried in v2's body and ride into the canonical plan. Requires teaching `plan-update` to strip a pre-existing header. · C — a separate cheap classifier subagent before Step 3. Independent of the generating agent, so no self-assessment; but it must classify from raw issue text without a plan to look at, which is exactly the judgement the plan draft exists to make concrete.
  - **Recommended:** A — it gets the verdict from the agent that has just done the work of finding the open decisions, without touching the version chain or the canonical doc.
  - **Default if unanswered:** A.

**Open Questions 1, 2, 3, 4, 6, 7 and 8** belong to [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md); the routing table is in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md).

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

**Chosen: an escalation verdict emitted as a separate artifact and read by a 🤖 orchestrator step before the fan-out, plus a debug entry rule that distinguishes attempt 1 from a retry.**

**Rejected paths:**

<!-- prettier-ignore -->
| Rejected | Why |
| --- | --- |
| A human approval gate on escalation | An orchestrator with free choice of steps drifts toward the cheap path, but that only bites on *downgrades*. Escalation is the expensive direction and is never the lazy choice; with build's plan requirement intact there is nothing below plan to downgrade into. The only automatic move available is upward, so no human needs to stand in for it |
| A `→ build` route or comment-only plans | `bkit-build.md:206` stays exactly as it is. Plan is the floor, which is precisely why plan's cost is the thing worth attacking |
| Making `build-plan-current` conditional on "plan commit is an ancestor of the base" | Step 2 branching off a stale `origin/dev` is exactly the case that step exists to catch; the obvious skip disables the guard on its own failure mode |
| An `Escalate:` header on `plan-v1-draft.md` | `bkit-plan-update` copies the prior version verbatim then prepends its own `Verdict: PENDING` header, so the line would be buried in v2's body and ride into the canonical plan (Open Question 5, option B) |

**Future-phase recommendations (not this plan):** once `step-skipped` rows exist across all five workflows, the ship status-hole detector can read skips from the log instead of inferring them from absence (`classifyRun` currently infers `MERGED_ON_ENTRY` from two missing rows). That is the single strongest argument for promoting it from advisory to gate — tracked as an existing deferral, listed in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md) § Suggested Scope Expansion.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Amending `docs/plans/template.md` § Design-Missing Fallback to cover standalone plans with a complete issue-side statement of intent | Genuinely-additive: a template change alters every future plan's contract and is not required by any Success Criterion or matrix row here | Own cycle — follow-up issue; mirrored as deferral `442-plan-template-design-missing-fallback-amendment`; recorded as an assumption in `Open Questions & Assumptions` |

> `.bkit/workflows/bkit-auto.md` is not an `Exempt` row and takes no deferral: there is no work to defer. Its CI mode is failure-driven by construction and never receives a human-reported bug, so the debug entry rule cannot fire there and the file needs no change. Stated in `Architecture & Component Changes` below so no builder invents a diff for it.

> [!CAUTION]
> **Default = in-scope.** An item is `Exempt` ONLY if genuinely-additive — NOT required by `Success Criteria`, an `Acceptance Scenario` / `Derived Test Matrix` row, or a design section (declared non-goals excepted). Task 21 mirrors **every** `Exempt` row from all four sub-plans into `docs/deferrals.jsonl`.

## Suggested Scope Expansion

None held here. The nine advisory candidates for the whole plan live in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md) § Suggested Scope Expansion. Task 21 does append two of them as non-`442-` deferral rows (`conditional-lens-vocabulary-alignment-across-workflow-and-audit`, `bkit-check-drift-gate-over-rendered-host-mirrors`) — that is ledger hygiene, not scope.

> [!CAUTION]
> **Candidates, not scope.** They do NOT become `Agent Execution Runbook` tasks and MUST NOT expand this sub-plan's scope.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — `plan-escalation.md` is written by `bkit-plan-generate`, which reads `plan-input.md` (issue text, untrusted). Its one-paragraph reason is read by Step 3.5 only to extract `Escalate: TRUE|FALSE` above `<!-- verdict:end -->`; the paragraph is never executed and never becomes a predicate source. The standing `External input:` header bullet already covers the generate subagent.
- [ ] **New Secret/Env Var** — none.

_No new routes, DB writes, or PII._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Sub-plans 1, 2 and 3 landed:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md), [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) and [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) have every Gate `[x]` and every task `[x]`. Task 22 requires all of them.
- [ ] **Package Management:** No new runtime or dev dependency. Verify `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** Run `pnpm outdated`; spot-check `npx tsc --version` and `pnpm --version`. `jq` and `bats` must be present for the full gate run.
- [ ] **Existing-Solution Search (reuse over duplicate):** Confirmed before planning. The escalation artifact reuses the corpus's existing header-plus-`<!-- verdict:end -->` shape and the standard re-invoke-once loop; the install scenarios extend `.bkit/src/bkit-install.integration.test.ts` rather than adding a suite; the three routing audit rows extend `.bkit/src/bkit-applicability-audit.test.ts` created in [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md). No `[NEW]` file in this sub-plan.
- [ ] **User Context:** Read/write access to `.bkit/workflows/`, `.bkit/prompts/`, `.bkit/src/`, `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/comparison.md`, `README.md`, `docs/`. No missing user information beyond Open Question 5.
- [ ] **Project Context:** Check `docs/knowledge.jsonl` and `docs/decisions.jsonl`. Relevant: `363-host-mirrors-stale-after-first-challenge-remediation` (HIGH, OPEN, in `docs/failures.jsonl`) — mirror drift is not caught by `bkit check`, which is why Task 22's prune must be **observed** in the suite rather than assumed from a hand-run dogfood.
- [ ] **Testing & Quality:** Aligns with `docs/testing.md` § Tiers — Unit (`*.test.ts`), Integration (`*.integration.test.ts`), Shell (`tests/*.bats`). bkit has no E2E, `@live`, migration or Smoke tier, so no row in the matrix claims one.
- [ ] **Prerequisite Plans:** all three sibling sub-plans, complete and verified.

### Conditional _(verify only when applicable)_

- [ ] **Architecture & UI** _(new files)_: none — this sub-plan adds no new file to `.bkit/src/` or `tests/`. Its one new **artifact** (`plan-escalation.md`) is produced at runtime into the log directory beside the existing plan artifacts.
- [ ] **Observability** _(new log points)_: the `plan-escalate` `step-done` row and the debug `NO-REPRO` outcome are the new observables. Both use the existing row shapes and the `[bkit-telemetry]` stderr prefix per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Plan-wide human confirmations recorded:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1's three 👤 items (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions) are `[x]`. _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The `step-skipped` event type is defined in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Data Schema Integration; the `bkit.sensitivePaths` consumer key in [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md).

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/plans/{YYYYMM}/logs/{FID}/plan-escalation.md` — the `Escalate: TRUE|FALSE` line above `<!-- verdict:end -->`.
- **Input (Read):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — the folded run's `steps` array, for debug's derived attempt count.
- **Output (Write):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — a `plan-escalate` `step-done` row on the TRUE route; the `debug-run-tests` row gains outcome `NO-REPRO` on the attempt-1 PASS path.
- **Output (Write):** `docs/decisions.jsonl`, `docs/deferrals.jsonl`, `docs/knowledge.jsonl` — verified and, where absent, appended by Task 21. Append-only; read each ledger first and never edit a prior line.

### Data Schema Changes

None beyond what sub-plans 1 and 3 define.

## Architecture & Component Changes

**CRITICAL:** Every `[NEW]` states why an existing artifact cannot be evolved — this sub-plan has none. Source-only edits — `.bkit/workflows/*`, `.bkit/prompts/*`, `.bkit/src/*`, `.bkit/*.md`, `README.md`, `docs/*`. NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*` mirrors; regenerate them with `bkit install`, batched once at session end in Task 22.

### Workflow prose — wave 4 (routing)

#### [MODIFY] `.bkit/prompts/bkit-plan-generate.md`

- Add a second **Create** path, `docs/plans/{YYYYMM}/logs/{FID}/plan-escalation.md`, carrying `Escalate: TRUE | FALSE` + `<!-- verdict:end -->` and one paragraph of reason. `TRUE` when the generated plan rests on open decisions with real alternatives — that is, when `Open Questions & Assumptions` carries a question whose `Recommended` option changes the `Architecture & Component Changes` shape rather than a parameter.
- **Why a second artifact and not a header on the draft:** `bkit-plan-update` bootstraps by copying the prior version verbatim then prepending its own `Verdict: PENDING` header, so a header on `plan-v1-draft.md` would be buried in v2's body and ride into the canonical plan (Open Question 5).

#### [MODIFY] `.bkit/workflows/bkit-plan.md` — Step 3 second artifact

- Step 3 currently asserts one Create file and carries one path in the `plan-generate` `step-done` `artifacts` array, and Gate 3's "Artifacts written" / "No PENDING placeholders remain" items name one file. All four must cover `plan-escalation.md` as well, or Step 3.5 reads an artifact no upstream step asserts — the exact class [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) Task 15's own audit row exists to catch ("every predicate names an artifact an earlier step demonstrably produces").
- Sites: Step 3's existence assert, its `artifacts` array, its tracker comment, Gate 3's artifact item and Gate 3's PENDING item.

#### [MODIFY] `.bkit/workflows/bkit-plan.md` — Step 3.5 Escalation Check

- New 🤖 step between Step 3 and Step 4, so the verdict lands **before** the Step 5 fan-out: read `plan-escalation.md` to `<!-- verdict:end -->` → `PLAN_ESCALATE`; invalid → the corpus's standard re-invoke-once loop, then **Failure Path**. It invokes no subagent, so it adds nothing to any invocation count.
- **Route:** `**If** PLAN_ESCALATE` = FALSE → Step 4. `**If** TRUE` → record `step-done` `plan-escalate` with the verdict, post the tracker comment naming `/bkit-design {ISSUE_ID}` as the next action, run the Close Workflow, and **STOP**. Cost when the entry guess is wrong: one wasted `bkit-plan-generate` run.
- **Idempotency mechanism, stated rather than asserted:** the TRUE route is terminal — it runs the Close Workflow and **STOP**s. It creates nothing, invokes no design subagent, and has no loop back into Step 3, so a re-run of `/bkit-plan` on an already-escalated FID re-derives the same verdict, appends a fresh `plan-escalate` `step-done` row and stops again. A second design is created only by a human running `/bkit-design`. That is what "the escalation close is idempotent" means here, and the matrix row asserts the terminal shape (Close Workflow reached, no Step 5 reviewer named, no back-edge into Step 3).
- No human approval gate: escalation is the expensive direction and `bkit-build.md:206` leaves nothing below plan to downgrade into.
- `.bkit/workflows.md:23` (`bkit-plan.md # Workflow 2/6 — 12 steps`) becomes stale on this change and is in Task 17's scope.

#### [MODIFY] `.bkit/workflows/bkit-debug.md` — Step 3 entry rule

- **Existence Check:** Step 3 sub-step 7 currently routes `TEST_VERDICT` = PASS to Step 8 when the derived attempt is > 1, and to Step 9 Summary when it is 1. Step 4 is gated `**Run only if** TEST_VERDICT = FAIL` (`:584`). So a bug a human just reported, with no failing test yet, gets a green no-op: the workflow finishes clean having proved only that the existing suite still passes.
- Change: attempt 1 **and** `TEST_VERDICT` = PASS records outcome `NO-REPRO` on the `debug-run-tests` row and routes to Step 9 with an instruction that the summary names `/bkit-plan {ISSUE_ID}` as the next action — writing the failing test first is plan-and-build-shaped work, not debug work. Attempt > 1 with PASS keeps today's Step 8 route (a fix was applied and now passes) unchanged.
- **PROHIBITED:** no change to Steps 4-7, to `DEBUG_MODE` routing, or to the soak ladder.

> `.bkit/workflows/bkit-auto.md` carries **no** entry here. Its CI mode is failure-driven by construction and never receives a human-reported bug, so the debug entry rule cannot fire there and no task touches the file. Recorded as a declared non-goal in `Out of Scope`, not as a `[MODIFY]` with no diff.

### Tests

#### [MODIFY] `.bkit/src/bkit-applicability-audit.test.ts`

- Created in [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) Task 15. This sub-plan's Task 19 adds its three routing rows: `PLAN_ESCALATE`'s enum and terminal TRUE-route, plan Step 3's two-artifact assertion, and debug's `NO-REPRO` route. They land here rather than in a new file because they are the same class of markdown invariant over the same corpus.

#### [MODIFY] `.bkit/src/bkit-install.integration.test.ts`

- Extend the existing scratch-consumer scenario's assertions to cover the re-rendered workflows and the extended `bkit-status-route.sh` reaching the consumer, and `bkit check` reporting no drift.
- Add an **upgrade-prune** scenario: seed a scratch consumer with `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, upgrade it, assert none of the four survives. Mirror drift is not caught by `bkit check` (`docs/failures.jsonl` key `363-host-mirrors-stale-after-first-challenge-remediation`, HIGH, OPEN), so the prune must be observed, not assumed.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/workflows.md:23` step count `bkit-plan.md # Workflow 2/6 — 12 steps` | The same line with the count corrected for Step 3.5 | MODIFY | Not a deletion, but the same class: a fact in the contract file that Task 17 invalidates |

The plan's five `DELETE` supersession rows belong to [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) Task 14.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md` § Common Workflow Anatomy | The entry-point doctrine clause: plan by default, design by escalation, debug for a reproducing failure. _(The construct clauses of this section are owned by [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 3; the fan-out-width clause by [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md).)_ |
| `.bkit/workflows.md` § Rationale rehomed from the workflow files | The four bullets [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 3 did not carry: why `SINGLE` (not `NOSPLIT`) is the continuity value and why plan Step 9 needs no hard-set under OQ6 option A; why the design S8 predicate is `MILESTONE` alone; why the `bkit.sensitivePaths` override is force-on only and why `path-override` is therefore not a `decidedBy` member; why continuity hard-sets are prose variables and not shell assignments. Every rationale byte belongs here, never in a workflow file |
| `.bkit/workflows.md:23` | Correct the `bkit-plan.md # Workflow 2/6 — 12 steps` count for Step 3.5 |
| `.bkit/prompts.md` | Four **content** updates: Design Phase — `bkit-design-generate` gains the two new sections; `bkit-design-review-1` / `-2` gain `Failures:` and their applicability conditions. Plan Phase — `bkit-plan-generate`'s second artifact. § Special Behaviors — update the parallel-fan-out and stubbed-output rows where they name `bkit-plan-scope-check-*`. _(The four `bkit-plan-scope-check-2` **deletions** at `:104,171,276,388` are owned by [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) Task 14.)_ |
| `docs/testing.md` | Add the four new / modified test files to the file-inventory tables with their tier and scope, beside the existing counter-derivation and runtime-shim tables |
| `docs/decisions.jsonl` | Three `decision` rows — already appended by plan-generate: `442-step-skipped-row-not-folded`, `442-applicability-not-scale-dial`, `442-escalation-needs-no-human-gate`. Build verifies, does not re-append |
| `docs/deferrals.jsonl` | **Eight** `442-` `deferral` rows mirroring the `Out of Scope` `Exempt` tables across all four sub-plans — the six plan-generate already appended plus `442-plan-complexity-check-predicate` (Open-Question-6 declination) and `442-plan-template-design-missing-fallback-amendment`. The detector-promotion `Exempt` row maps to the existing key `384-promote-status-hole-detector-from-advisory-to-gate` — no duplicate is minted, per the same-`key`-append rule. Two further non-`442-` rows carry the new `Suggested Scope Expansion` candidates (`conditional-lens-vocabulary-alignment-across-workflow-and-audit`, `bkit-check-drift-gate-over-rendered-host-mirrors`); they are advisory candidates, never runbook tasks |
| `docs/knowledge.jsonl` | One `knowledge` row if the retrofit surfaces a real gotcha; the issue's `NOSPLIT`-vs-`SINGLE` mismatch is a candidate |
| `README.md` | The entry-point line — default entry is `/bkit-plan`, design is entered by escalation from plan, debug is for a failure that already reproduces. Update the ASCII pipeline sketch to show the escalation edge. **Separately:** document `bkit.sensitivePaths` beside the existing `bkit.issueTracker` / `bkit.githubProject` / `bkit.depUpdater` / `bkit.cloudAgents` entries (§ Optional post-install decisions and the advisory table at `:384-388`) — what it is (a glob list of paths whose plans warrant extra review), that it defaults to `[]`, and that it can only force a review lens **on**, never off |
| `.bkit/comparison.md` | No change here — the `:173` row deletion is owned by [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) Task 14 |
| `.agents/docs.md` | No change — no new doc file; `.bkit/*.md` are bkit-authoring docs and are not catalog rows |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | The only persistent-state change in the plan is an additive `status.jsonl` row type; existing logs stay readable because the fold already ignores unrecognised types |
| **Code** | `git revert {COMMIT}` on the squash-merge commit, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional |
| **Partial rollback** | Revertible independently of [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) and [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) | The escalation route and the debug `NO-REPRO` route stand alone — neither carries a continuity hard-set and neither depends on a predicate. Reverting this sub-plan restores today's plan step numbering and today's debug PASS route while leaving the skip log, the tolerance and the predicates intact |
| **Risk window** | None — no deploy. A consumer on the released version is unaffected until they run `bkit upgrade` | A consumer who upgrades mid-run of a workflow could hit a workflow file whose step numbering changed (plan gains Step 3.5). The per-FID `.lock` and the resume-by-fold contract make that a resume-at-the-wrong-step risk, not corruption |

_A per-workflow rollback primitive does not exist; this is the reason the deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` is open. Whole-commit revert plus mirror regen is the current path._

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** waves 4 and 5 change behaviour and then close the plan, so a commit per task reads well in review — advisory only, NEVER a gate; delivering every task in ONE PR is always correct. Do NOT specify a merge method; that is not a plan choice.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Plan-verify reads this line and asserts against it before ticking `[x]`.
>
> Every task also carries a `Requires:` line naming the tasks that must complete first. There are no cycles, and no edge points backwards across a sub-plan boundary. Tasks 8, 11, 12, 13, 14 and 15 are in [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) and [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) and must already be `[x]`.

### Wave 4 — routing

- [ ] **Task 16: Emit the escalation verdict and assert it upstream.** _Requires: none (safe alone)._ Add `plan-escalation.md` as a second **Create** to `bkit-plan-generate.md`, carrying `Escalate: TRUE | FALSE` + `<!-- verdict:end -->` and a one-paragraph reason, with the Process step that decides it. In the same task extend `bkit-plan.md` Step 3 so the second artifact is asserted where the first one is: its existence assert, its `plan-generate` `step-done` `artifacts` array, its tracker comment, and Gate 3's artifact and PENDING items. **Done when:** the prompt names `docs/plans/{YYYYMM}/logs/{FID}/plan-escalation.md` as a Create, declares `Escalate: TRUE | FALSE` above `<!-- verdict:end -->`, and `plan-v1-draft.md` still carries no header line; `bkit-plan.md` Step 3 asserts both artifacts exist and are non-empty, its `artifacts` array names both, and Gate 3's artifact and PENDING items name both — so Step 3.5 reads nothing an upstream step has not asserted.

- [ ] **Task 17: Add plan Step 3.5 Escalation Check.** _Requires: Task 16._ Insert the 🤖 step between Steps 3 and 4: extract `PLAN_ESCALATE`, re-invoke once on an invalid value then **Failure Path**, and route FALSE → Step 4 / TRUE → record `plan-escalate`, post the `/bkit-design` hand-off comment, run Close Workflow, **STOP**. Renumber nothing — use `3.5` so downstream step numbers and their `step-done` keys stay stable. Correct `.bkit/workflows.md:23`'s `bkit-plan.md # Workflow 2/6 — 12 steps` count in the same change. **Done when:** `bkit-plan.md` contains a Step 3.5 section whose route block has both branches; the TRUE branch reaches Close Workflow without naming any Step 5 reviewer and has no back-edge into Step 3 (terminal by construction, which is the stated idempotency mechanism — a re-run re-derives the verdict and stops again, and only a human running `/bkit-design` creates a design); existing step keys (`plan-review`, `plan-scope-check`, …) are unchanged; `.bkit/workflows.md:23` names the corrected step count.

- [ ] **Task 18: Close the debug entry gap.** _Requires: none (safe alone)._ Change debug Step 3 sub-step 7 so attempt 1 with `TEST_VERDICT` = PASS records `NO-REPRO` and routes to Step 9 with the summary naming `/bkit-plan {ISSUE_ID}`; leave attempt > 1 with PASS on today's Step 8 route. **Done when:** `bkit-debug.md` Step 3's PASS branch distinguishes attempt 1 from attempt > 1 by outcome as well as destination; `NO-REPRO` appears on the attempt-1 path; Steps 4-7, `DEBUG_MODE` routing and the soak ladder are unchanged in `git diff`.

- [ ] **Task 19: Extend the applicability audit to the routing rows.** _Requires: Tasks 15, 17, 18._ Add the `PLAN_ESCALATE` enum / terminal-TRUE-route case, the Step 3 two-artifact case and the debug `NO-REPRO` case to `.bkit/src/bkit-applicability-audit.test.ts`. **Done when:** `npx vitest run .bkit/src/bkit-applicability-audit.test.ts` passes all three routing matrix rows; removing the `NO-REPRO` route reds it; adding a back-edge from the Step 3.5 TRUE branch into Step 3 reds it.

- [ ] **Task 20: Write the entry-point doctrine, the new config key and the wave-3 rationale into the docs.** _Requires: Tasks 12, 13, 17, 18._ Update `README.md` (default entry is `/bkit-plan`; design is entered by escalation; debug is for a failure that already reproduces) including the ASCII pipeline sketch, and `.bkit/workflows.md` § Common Workflow Anatomy. In the same task document `bkit.sensitivePaths` in `README.md` beside the other `bkit.*` keys (§ Optional post-install decisions and the advisory table at `:384-388`). **Also in the same task, rehome the four `§ Rationale` bullets that Task 3 did not carry** — Task 3 owns only the not-folded and dedup-collapse bullets, and the constructs the remaining four explain are written by Tasks 12, 13 and 17, so their rationale has no other owner: (a) why `SINGLE` (not the issue's `NOSPLIT`) is the continuity value and why plan Step 9 needs no hard-set at all under Open Question 6 option A; (b) why design S8's predicate is `MILESTONE` alone; (c) why the `bkit.sensitivePaths` override is force-on only and why `path-override` is therefore not a `decidedBy` member; (d) why every continuity hard-set is a prose variable and not a shell assignment. All four land in `.bkit/workflows.md` § Rationale rehomed from the workflow files — every rationale byte belongs there, never in a workflow file. **Done when:** `README.md` states the plan-by-default entry rule and its pipeline sketch shows the plan → design escalation edge; `README.md` documents `bkit.sensitivePaths` — what it is, that it defaults to `[]`, and that it can only force a review lens on, never off — in the same section as `bkit.issueTracker` / `bkit.githubProject`; `.bkit/workflows.md` carries the same entry rule; `.bkit/workflows.md` § Rationale rehomed from the workflow files carries all six bullets the `Documentation Updates` row demands — the two from Task 3 plus these four, each independently greppable in that section (`SINGLE`, `NOSPLIT`, `MILESTONE`, `path-override`, `prose variable`); no file under `.bkit/workflows/` carries any of that rationale prose; neither `README.md` nor `.bkit/workflows.md` names a tracker issue number or any other bkit-internal identifier.

### Wave 5 — ledgers, docs, mirrors

- [ ] **Task 21: Verify the ledger rows and finish the docs.** _Requires: Tasks 8, 11, 14, 16, 20._ The three `decision` rows and six `deferral` rows were appended by plan-generate; verify they are intact and correct rather than re-appending them (a same-`key` append is only warranted if a field genuinely changed). Verify the two further deferrals the review merge appended — `442-plan-complexity-check-predicate` (Open-Question-6 declination, carrying the `.bkit/stats.jsonl` calibration evidence) and `442-plan-template-design-missing-fallback-amendment` — are intact, and append them if absent. Then update `.bkit/prompts.md`, `.bkit/comparison.md`, `docs/testing.md` and, if the retrofit surfaced one, `docs/knowledge.jsonl`. The `.bkit/prompts.md` work is **four distinct content updates plus the deletion**, because catalog parity is asserted file → doc for **existence** only (`bkit-catalog-parity.test.ts`) — nothing detects a row whose described behaviour went stale after Tasks 8, 11 and 16: the Design-Phase `bkit-design-generate` row gains the two new sections; the `bkit-design-review-1` / `-2` rows gain `Failures:` and their applicability conditions; the Plan-Phase `bkit-plan-generate` row gains its second artifact; and § Special Behaviors' parallel-fan-out and stubbed-output rows are rewritten where they name `bkit-plan-scope-check-*`. Read each ledger first; append, never edit a prior line. **Done when:** `jq -r 'select(.kind=="decision") | .key' docs/decisions.jsonl | grep -c '^442-'` is 3; `jq -r 'select(.kind=="deferral") | .key' docs/deferrals.jsonl | grep -c '^442-'` is 8 and includes both `442-plan-complexity-check-predicate` and `442-plan-template-design-missing-fallback-amendment`, each carrying a `reason` from the closed enum and, where `scope-declared`, `references` naming the `#442` section or plan section that declared it (the row is not its own declaration); no duplicate of `384-promote-status-hole-detector-from-advisory-to-gate` was minted; `docs/testing.md` lists all four new / modified test files with tier and scope; `.bkit/prompts.md` and `.bkit/comparison.md` have no `scope-check-2` row; and `.bkit/prompts.md` carries all four content updates — its `bkit-design-generate` entry names `## Required Capabilities` and `## Runtime Surface Change`; its `bkit-design-review-1` and `bkit-design-review-2` entries each name `Failures:` and state the lens's applicability condition; its `bkit-plan-generate` entry names `plan-escalation.md` as a second Create; and § Special Behaviors' parallel-fan-out and stubbed-output rows describe plan Step 7 as a single checker with no surviving `bkit-plan-scope-check-*` pair.

- [ ] **Task 22: Extend the install integration suite, regenerate mirrors, and run the full gate suite.** _Requires: all prior tasks._ First extend `.bkit/src/bkit-install.integration.test.ts` — the file `Architecture & Component Changes` § Tests declares `[MODIFY]` and the two consumer-facing matrix rows name as their target — with **both** scenarios as Vitest cases, not as one-off shell steps: (a) extend the existing scratch-consumer scenario to assert the re-rendered workflows and the extended `bkit-status-route.sh` reach a consumer installed from the built `dist/`, and that `bkit check` reports no drift; (b) add the **upgrade-prune** case that seeds a scratch consumer with `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, upgrades it, and asserts none of the four survives. Both must live in the suite so they rerun — mirror drift is not caught by `bkit check` (`docs/failures.jsonl` key `363-host-mirrors-stale-after-first-challenge-remediation`, HIGH, OPEN), which is precisely why the prune must be **observed**, and a hand-run dogfood is the observation that does not repeat. Then run `pnpm build`, then `pnpm bkit install` once (batched at session end, never per edit), then `git config core.bare false`. Run the whole local gate set and a packed-tarball dogfood on a fresh scratch consumer. **Done when:** `.bkit/src/bkit-install.integration.test.ts` contains both cases and `npx vitest run .bkit/src/bkit-install.integration.test.ts` passes them; removing the prune call from the install engine reds the seeded case, and reverting one re-rendered workflow in the consumer fixture reds the `dist/`-install case; `pnpm vitest run` (full suite, never scoped) passes; `npx bats tests/*.bats` passes; `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta` and `pnpm bkit check` all exit 0 with no `bkit-rendered-prompts-stale` finding; `grep -rn 'scope-check-2' .bkit/version .claude/ .cursor/ .opencode/` returns zero matches after the regen, and no `bkit-plan-scope-check-2.md` file exists under `.claude/agents/`, `.cursor/agents/` or `.opencode/agents/`; a `pnpm pack` tarball installed into a fresh `os.tmpdir()` consumer yields a `.bkit/scripts/bkit-status-route.sh` containing `route_append_step_skipped` and a `.claude/commands/bkit-plan.md` containing Step 3.5; and a scratch consumer **seeded** with `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, then upgraded, carries none of the four afterwards.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **No bolt-on / no gate-weakening:** this sub-plan adds no `[NEW]` file — the routing audit rows extend `bkit-applicability-audit.test.ts` and the consumer scenarios extend `bkit-install.integration.test.ts`; no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Source-only edits:** no file under `.claude/`, `.cursor/` or `.opencode/` was hand-edited; every mirror change came from `bkit install` in Task 22.
- [ ] **Derived sets, never hand-written lists:** the audit rows added here assert routing shape over the corpus, not an enumerated site list.
- [ ] **Append-only ledgers respected:** every `docs/*.jsonl` change is an append; `git diff` shows no edited prior line, and `.bkit/friction.jsonl` is untouched.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Shell helpers** — bats, cross-process, real `status.jsonl` and real exit codes; never a re-implementation of the script under test. Use the `BKIT_*` path override so a bats row can run `dev`'s version against the worktree's.
> - **Workflow / prompt prose** — Vitest markdown-invariant tests. Assert the **rule** (a call site, a flag, an `if:` shape), never the sentence that explains it; a guard pinned to prose reds when someone improves a comment and passes for years after the rule is deleted. This corpus is the one sanctioned exception where wording _is_ the deliverable: a header declaration or a `**Run only if**` operator is behaviour, and asserting on it is correct.
> - **Prove each guard can fail** — put the bug back and watch it red before trusting it.
> - **No browser tier** — bkit has no UI; nothing here drives a browser.

**Mandatory Tasks (Testing & Documentation) — whole plan, verified here:**

- [ ] **Verify test coverage against Derived Test Matrix:** every row across all four sub-plans maps to a runbook task ([`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Tasks 2 and 5; [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) Tasks 8 and 10; [`442-workflow-steps-needed-plan-3.md`](442-workflow-steps-needed-plan-3.md) Task 15 incl. the `bkit-config-keys.test.ts` row; this sub-plan's Tasks 19, 21 and 22). Count the rows in each sub-plan's matrix at build time and confirm the mapping is total — do not trust a number written in prose.
- [ ] **Update existing tests:** `.bkit/src/bkit-status.test.ts`, `tests/counter-derive.bats`, `.bkit/src/bkit-install.integration.test.ts`, `.bkit/src/bkit-config-keys.test.ts`, plus any assertion in `bkit-catalog-parity.test.ts` / `bkit-verdict-vocabulary.test.ts` that moves with the deleted prompt and the new headers.
- [ ] **Write new tests:** `tests/step-skipped-row.bats`, `.bkit/src/bkit-skip-recording-audit.test.ts`, `.bkit/src/bkit-input-tolerance-audit.test.ts`, `.bkit/src/bkit-applicability-audit.test.ts` — all four created in earlier sub-plans; confirm each exists and passes.
- [ ] **Verify observability:** the `step-skipped` row is the new observable; its failure diagnostics keep the `[bkit-telemetry]` stderr prefix `_route_die` already emits, per `docs/observability.md`.
- [ ] **Update documentation:** every row in every sub-plan's `Documentation Updates` completed, rewritten as prose rather than appended as bullets.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Docs updated:** every row in every sub-plan's `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **No PENDING placeholders remain** anywhere in the plan artifacts or the new test files.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta`, `pnpm bkit check`, plus `pnpm vitest run` (full suite, never scoped) and `npx bats tests/*.bats`. Do NOT weaken any gate to pass.
- [ ] **Test Synchronization:** no E2E tier exists in this repo, so nothing to synchronise there. Do re-run `.bkit/src/bkit-catalog-parity.test.ts`, `.bkit/src/bkit-verdict-vocabulary.test.ts`, `.bkit/src/bkit-runtime-prose-audit.test.ts`, `.bkit/src/bkit-block-locality-audit.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`, `.bkit/src/bkit-untrusted-input-coverage.test.ts`, `.bkit/src/bkit-telemetry-workflow-writers.test.ts` and `.bkit/src/bkit-config-keys.test.ts` — all eight read the workflow / prompt corpus or the `bkit.*` config surface this change edits.
- [ ] **Build Configuration:** none — no new mock files or test configs; the new test files match existing include globs (`.bkit/src/*.test.ts`, `tests/*.bats`).
- [ ] **Shell tier (`tests/step-skipped-row.bats`):** each case in a fresh subprocess against a real temp `status.jsonl`; assert the appended line parses with `jq -e .` and that a refused call leaves the file byte-unchanged. Clean the temp file per case.
- [ ] **Prose-audit tier (`.bkit/src/bkit-*-audit.test.ts`):** for each new guard, reintroduce the defect once and confirm it reds. A guard that has never failed is indistinguishable from a guard that cannot.
- [ ] **Run all tests:** execute locally; fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** never resolve a red via `as any`, a `.skip`, or a weakened assertion. Halt if stuck.

### 🔒 Gate 4: Automated Verification Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test output, CLI results) gathered.

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval.

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`gh`, `jq`, `git`) rather than asking anyone to open a dashboard.

> These seven steps cover the **whole plan**, not just this sub-plan. They are here because none of them is exercisable until every sub-plan has landed.

- [ ] **Step 1 — Narrow-path live run.** Run `/bkit-plan` against a single-task issue in this repo whose plan will declare no dependency edges. Confirm from the tracker comments that exactly **five** 🧠 steps invoked a subagent if the draft carries no `[MODIFY]` / `[DELETE]` row, or **six** if it carries one (the sixth is `plan-review-3`); Step 3.5 invokes no subagent and is not counted. Confirm from `jq -r 'select(.type=="step-skipped") | "\(.step)\t\(.decidedBy)\t\(.reason)"' docs/plans/*/logs/{FID}/status.jsonl` that every skipped step **and lens** recorded a row naming an absent input, with lens rows carrying lens-suffixed `step` values.
- [ ] **Step 2 — Full-width live run.** Run `/bkit-plan` against an issue whose plan declares dependency edges and modifies exported symbols. Confirm all three Step 5 reviewers ran, that no `step-skipped` row was written for Step 5 or any of its lenses, and that the `plan-review` `step-done` row's `artifacts` array has three entries.
- [ ] **Step 2b — Partial-width live run.** Run `/bkit-plan` against an issue whose plan modifies a consumed surface but declares no dependency edges. Confirm Step 5 **ran** at width 2, that exactly one `step-skipped` row exists with `step` = `plan-review-2`, that the `plan-review` `step-done` row's `artifacts` array has two entries, and that the run did not enter the Failure Path.
- [ ] **Step 2c — Sensitive-path force-on.** Set `bkit.sensitivePaths` to a glob matching a file the plan touches, on an issue whose base predicates are both FALSE. Confirm the matched lens **ran**, wrote no `step-skipped` row, and that the run cost one invocation more than the same issue with the key unset.
- [ ] **Step 3 — Escalation live run.** Run `/bkit-plan` against an issue with a genuinely open architectural decision. Confirm `plan-escalation.md` reports `Escalate: TRUE`, no Step 5 reviewer was invoked, and the tracker comment names `/bkit-design`.
- [ ] **Step 4 — Debug entry rule.** Run `/bkit-debug` against a green FID. Confirm the run records `NO-REPRO` and the summary names `/bkit-plan`, rather than reporting a clean pass.
- [ ] **Step 5 — Consumer upgrade.** In a separate consumer clone, run `bkit upgrade`, then `bkit check`. Confirm exit 0, that `.bkit/scripts/bkit-status-route.sh` carries `route_append_step_skipped`, that `bkit-plan-scope-check-2.md` is gone from `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, and that no `.opencode/` or `.cursor/` mirror was left stale.
