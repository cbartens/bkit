Verdict: CONCERNS
<!-- verdict:end -->

# Run Only Workflow Steps Tasks Actually Need Implementation Plan

## Context & Goals

Every feature pays the same subagent bill regardless of size. `/bkit-design` fires 10 subagent invocations at full width and `/bkit-plan` fires 11; on a small, well-scoped change most of those lenses read an artifact that contains zero instances of what they iterate over, return `PASS` having looked at nothing, and cost a full model turn anyway.

The cost that matters is not tokens. The pipeline is heavy enough that people route around it, and work done outside bkit leaves no artifacts, no ledger rows and no gates. That is the debt.

The five phases are already independently invocable — `bkit-auto.md` reads `{PHASE}` as a literal argument and never checks that design ran before plan; `bkit-plan.md:266` treats an empty `PARENT_FID` as expected input, not a workaround; `/bkit-debug` takes an FID and mints its own worktree. So there is no chain to unlock. What is missing is that **nothing chooses the entry point and nothing records the choice**.

This plan does four things, in the order the issue fixes them:

1. Makes a skipped step **visible** — a `step-skipped` status row, retrofitted to all 28 steps that are already conditional, so a deliberate skip stops being indistinguishable from a crash.
2. Makes skipping **safe** — read lists tolerate an absent producer, version chains resolve to latest-present, and every sole-emitter variable gets a defined value when its emitter does not run.
3. Adds **applicability predicates** to `bkit-design` and `bkit-plan` only, so a lens runs when the thing it inspects is present. Not when a size dial says so.
4. Adds a **plan → design escalation verdict** and closes the **debug entry gap** (a bug with no failing test belongs in plan, not debug).

**Skip granularity is two-level, and the difference is load-bearing.** Most of the 28 existing conditional steps are whole-step skips. But wave 3's savings live _inside_ fan-out steps: `bkit-plan.md` Step 5 invokes `plan-review-1` / `-2` / `-3` as three bullets in **one** step under **one** `step-done` key (`plan-review`), and `bkit-design.md` Step 5 invokes both reviewers the same way. Wave 1's machinery (`**Run only if**` at step-header position, one `step-skipped` row keyed on the step slug, one gate item) cannot express a lens-level skip, and a step-level condition would drop the whole fan-out. So this plan defines a second, explicit construct:

- `**Run lens only if**` — a sub-step condition line attached to the individual subagent bullet, distinct from the step-header `**Run only if**` / `**Skip if**`, and separately greppable (`^\s*-?\s*\*\*Run lens only if\*\*`).
- A **lens-suffixed `step` value** on the row (`plan-review-2`, `design-review-1`), so a lens skip is distinguishable from the step skip that would carry the bare slug.
- **Partial-width tolerance** in the fan-out step itself — the existence assert, the verdict / failure derivation, the `artifacts` array, the tracker comment and the gate items all range over the lenses that actually ran, never a hardcoded three (wave 2, Task 9).
- **Derived audits that see both** — Tasks 5 and 15 build their subject sets from _both_ regexes, so a lens condition cannot be invisible to the guard meant to prove it recorded its skip.

Without all four, a run that skips `plan-review-2` hits `bkit-plan.md:498`'s blanket "any file empty → **Failure Path**" — i.e. the deliberate skip becomes the crash this plan exists to eliminate.

Two invariants are load-bearing and do not move. `bkit-build.md:206` (`**If** existing docs/plans/{YYYYMM}/{FID}-plan.md → reuse FID. **Else** → **Failure Path**.`) stays exactly as it is — plan is the floor for all feature work, so nothing can downgrade below it. And a sensitive-path override may only _force_ a lens on, never drop one.

`bkit-build`, `bkit-debug` and `bkit-ship` get **no step changes**. Their conditional steps gain skip logging (item 1) and nothing else. Build is already half-conditional and the remainder is load-bearing: `challenge-1` and `challenge-2` carry different dimensions (bugs / security), so dropping `-2` deletes security coverage outright, and `challenge-reconcile` always has two reports to merge as a consequence.

**Related Issues:**

- `#442 — Run only workflow steps tasks actually need (open)` — this plan's issue.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative

⚠️ No `{FID}-design.md` exists for this FID — this is a standalone plan. Narrative and Success Criteria below are derived from the issue's agreed-approach comment, which is a complete statement of intent, and are the human's to confirm here rather than inherit.

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria

- A skipped step **or a skipped lens inside a fan-out step** writes a `step-skipped` row naming the step (lens-suffixed when a lens), the absent input, and who decided — never nothing, never a `step-done`.
- A plan whose runbook declares no dependency edges and whose `Architecture & Component Changes` carries no `[MODIFY]` / `[DELETE]` row completes on **five** 🧠 invocations (generate, `plan-review-1`, `scope-check-1`, `complexity-check`, summary). A plan that modifies a consumed surface but declares no dependency edges costs **six** (adds `plan-review-3`). A plan with dependency edges and modified surfaces still runs all of them. `complexity-check` is unconditional under Open Question 6 option A and is counted in every figure above.
- Skipping a producer never breaks its consumer: every downstream step reads whichever inputs exist and resolves the highest existing version, **and a fan-out step whose width shrank still passes its own existence assert, failure sum, `artifacts` array, tracker comment and gate.**
- Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name. The set of such variables is **derived** from the workflow files, not enumerated in prose.
- A plan resting on open decisions with real alternatives stops before the Step 5 fan-out and hands to design; a bug with no failing test is routed to plan rather than closing debug green.

### Process Sketch

- **WHEN** a lens step's input is absent **→ THEN** the step does not run and a `step-skipped` row records the step, the reason and the decider.
- **WHEN** one lens inside a fan-out step has an absent input while a sibling lens does not **→ THEN** only that lens is skipped, its row carries the lens-suffixed `step` value, and the step's own assertions, `artifacts` array, verdict / failure derivation, tracker comment and gate items range only over the lenses that ran.
- **WHEN** a skipped step or lens was the sole emitter of a variable **→ THEN** the workflow hard-sets that variable to a defined enum member **as an orchestrator prose variable, outside any bash fence**, before the gate that reads it.
- **WHEN** a downstream step's read list names an artifact a skipped step would have produced **→ THEN** it reads whichever of the list exists and resolves the highest existing version of the chain.
- **WHEN** the generated plan rests on open decisions with real alternatives **→ THEN** plan stops before the review fan-out and hands to design, costing one wasted generate run.
- **IF** debug is entered on a bug with no failing test **→ THEN** the run records `NO-REPRO` and names `/bkit-plan` as the next action instead of reporting a clean pass.
- **IF** a consumer sensitive-path glob matches a planned target **→ THEN** the matching lens is forced on regardless of its own predicate; a glob never drops a lens. A forced-on lens runs, so it emits an ordinary `step-done` and **no** `step-skipped` row.

### Concrete Example

**Setup:** A maintainer of a repo with bkit installed opens an issue for a one-file copy fix: change a CLI help string. No new dependency, no runtime surface, no schema, no dependency edges between tasks. `bkit.sensitivePaths` is unset. They run `/bkit-plan #900`.

**Steps:**

1. Maintainer runs `/bkit-plan #900` → workflow mints `feat/900-cli-help-copy`, writes `plan-input.md`, invokes `@bkit-plan-generate`. Generate creates two artifacts: `plan-v1-draft.md` and `plan-escalation.md`.
2. `plan-escalation.md` reports `Escalate: FALSE` (the draft rests on no open architectural decision) → Step 3.5 reads `PLAN_ESCALATE` = FALSE and proceeds to Step 4. `plan-v1-draft.md` carries a single runbook task with no `Requires:` / `Blocked by:` / `After:` line, and `Architecture & Component Changes` carrying one `[MODIFY]` row.
3. Workflow reaches Step 5 → counts zero declared dependency edges in the draft → `plan-review-2`'s lens condition is FALSE, so it is skipped and one `step-skipped` row is appended with `step` = `plan-review-2`, `reason` = `"zero declared dependency edges"`, `decidedBy` = `applicability`. `plan-review-3`'s lens condition **is** TRUE — the draft carries one `[MODIFY]` row — so `plan-review-3` **runs** alongside `plan-review-1`. Step 5 asserts only the two artifacts its two lenses produced, sums `REVIEW_FAILURES` over those two, and writes an `artifacts` array of length 2.
4. Both reviewers return `Verdict: PASS`, `Failures: 0` → `REVIEW_FAILURES` = 0 → Step 6 does not run; a `step-skipped` row records `step` = `plan-update`, `"zero review findings"`, `decidedBy: upstream-verdict`.
5. Step 7 invokes `@bkit-plan-scope-check-1` (there is no `-2` any more). It returns `Failures: 0` → Step 8 skipped and recorded. Step 9 `complexity-check` runs unconditionally (Open Question 6 option A), returns `SINGLE`, Step 10 skipped and recorded. Step 11 summary reads `PLAN_FINAL` = `plan-v1-draft.md` — the highest version that exists.
6. Workflow closes; `docs/plans/202608/900-cli-help-copy-plan.md` is the canonical plan.

**Outcome:** Six 🧠 invocations instead of eleven — generate, `plan-review-1`, `plan-review-3`, `scope-check-1`, `complexity-check`, summary. Had the draft carried no `[MODIFY]` / `[DELETE]` row, `plan-review-3` would have skipped too and the run would have cost five. `status.jsonl` carries four `step-skipped` rows (`plan-review-2`, `plan-update` at Step 6, `plan-update` at Step 8, `plan-complexity-split`), each naming the absent input, so the run is auditable: no lens was dropped that had anything to read, and the log proves which ones were and why.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Version chain becomes non-contiguous (Step 6 skipped, Step 8 runs → `plan-v1-draft.md` then `plan-v3-checked.md`, no v2) | `ls … \| sort -V \| tail -1` still resolves the highest present; no step assumes v(N-1) exists |
| Every skippable step in a run skips | Summary still runs (mandatory), reads `PLAN_FINAL` = `plan-v1-draft.md`, and the close copies that file to canonical |
| `design-review-1` lens skipped — sole emitter of `SPIKE` | Its lens skip arm hard-sets `SPIKE` = FALSE, as an orchestrator prose variable outside any bash fence, before Step 6's gate reads it; self-consistent, since no new capability is also nothing to spike |
| **Both** design Step 5 lenses skipped — Step 5 emits nothing, and it is the sole emitter of `DESIGN_REVIEW_FAILURES` | The full-skip arm hard-sets `DESIGN_REVIEW_FAILURES` = 0 (prose variable) so Step 7's `>= 1` predicate reads a defined value and skips; the `SPIKE` = FALSE hard-set fires from the `design-review-1` lens arm as above |
| One lens of a fan-out step skips while a sibling runs | The step still runs. It asserts only the artifacts of the lenses that ran, derives its verdict / failure sum over those, emits a variable-length `artifacts` array, names only those lenses in its tracker comment, and ticks only their gate items — plus one skip gate item per skipped lens. It never routes to **Failure Path** on the absent sibling artifact |
| `plan-complexity-check` skipped — sole emitter of `COMPLEXITY_VERDICT` | Not reachable under Open Question 6 option A: Step 9 carries no condition, so it has no skip arm and `COMPLEXITY_VERDICT` is always emitted. **If** the human answers OQ6 B or C, the skip arm hard-sets `COMPLEXITY_VERDICT` = `SINGLE` (the shipped enum member; the issue's `NOSPLIT` is not a value this workflow accepts) — that is a plan revision, not a runbook edit |
| An apply step is skipped on `Failures: 0` but the reviewer returned `CONCERNS` | `CONCERNS` with `failures = 0` is legal under the status invariants; the apply step still skips — the count, not the verdict, is the input |
| A reviewer emits a non-integer `Failures` header | Existing re-invocation loop fires; a still-invalid header routes to **Failure Path**, never to a silent skip |
| Two workflow runs append `step-skipped` rows for the same step under `merge=union` | Rows duplicate harmlessly — the type is not folded, so no reducer double-counts it; readers filter on `type` |
| Two lenses of one fan-out step skip inside the same wall-clock second | Both reducers key non-`step-done` events as `W {type} {workflow} {at}` with no `step` field (`bkit-status-fold.sh:34`, `bkit-status.ts:62-65`), so the two rows collapse to one in the deduped stream. Both raw lines survive in `status.jsonl` and a `jq`-over-raw-lines reader sees both; only the folded view collapses. Harmless today because the fold discards the type entirely — but it bounds what any future skip-reading consumer can see from the fold, and this plan does not change the dedup key |
| Attempt counters near a skipped step | `counter_count` reads the folded run's `steps` array, which only `step-done` populates, so a skip cannot inflate an attempt |
| Escalation fires on a re-run of a plan that already escalated once | The escalation close is idempotent — it records the verdict and stops; it never creates a second design |
| Debug entered on a green tree at attempt 1 | Records `NO-REPRO` and names `/bkit-plan`; does not report a clean debug pass |
| Consumer sets no sensitive-path globs (the default) | Absent `bkit.sensitivePaths` resolves to `[]`; an empty list matches nothing; every predicate falls through to its own base condition — no lens is forced, and none is dropped by the absence. Behaviour is byte-identical to a consumer who sets `[]` explicitly |
| A sensitive-path glob matches but the lens's own predicate is FALSE | Lens runs, emits `step-done`, and writes **no** `step-skipped` row. Globs force on only; they never reduce width |
| A sensitive-path glob matches and the lens's own predicate is TRUE | Lens runs exactly once — the two arms are OR'd, not additive; no second invocation, no duplicate artifact |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md`. Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal; do not restate those rules here.
>
> **Discrimination (no false-green):** each row's assertion MUST observe the **affected** surface and would FAIL if the behaviour were broken.

**Tier Key** — bkit's own tiers per `docs/testing.md` § Tiers: Unit (`*.test.ts`, in-process, no real subprocess), Integration (`*.integration.test.ts`, multi-module or spawned `bkit` via `tsx`), Shell (`tests/*.bats`, cross-process, real files and exit codes). bkit has no browser, DB or deploy, so there is no E2E, `@live`, fresh-DB-replay or Smoke tier. Static is the global gate, not a per-feature row.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `route_append_step_skipped` appends one row carrying `type`/`workflow`/`step`/`reason`/`decidedBy`/`at`/`parentSha`, and the appended line parses as JSON | Shell (bats, real `status.jsonl`) | `tests/step-skipped-row.bats` |
| `route_append_step_skipped` refuses a `decidedBy` outside `caller-flag\|upstream-verdict\|applicability`, a `workflow` outside `design\|plan\|build\|debug\|ship`, an empty `step` and an empty `reason` — exit 2, nothing on stdout, file byte-unchanged | Shell (bats, exit codes) | `tests/step-skipped-row.bats` |
| `parseStatus` over a raw NDJSON fixture containing `step-skipped` lines, then `fold`, returns a run array byte-identical to the same fixture with those lines removed — asserted through `parseStatus(raw: string)` so no `as unknown as StatusEvent` cast is needed | Unit (Vitest) | `.bkit/src/bkit-status.test.ts` |
| The **shell** reducer `BKIT_STATUS_FOLD` (`bkit-status-fold.sh`) — the copy workflows actually execute — produces a run array unchanged by `step-skipped` rows | Shell (bats, real `status.jsonl`) | `tests/counter-derive.bats` |
| `counter_count` for a step key is unchanged by a `step-skipped` row carrying that same key, and by one carrying its lens-suffixed variant | Shell (bats, real `status.jsonl`) | `tests/counter-derive.bats` |
| Every `**Skip if**` / `**Run only if**` step **and** every `**Run lens only if**` lens bullet across the five workflows carries a `route_append_step_skipped` call in its skip arm and a gate item recording the skip; the audit derives both sets from the files, never a hand-written list | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-skip-recording-audit.test.ts` |
| Every `route_append_step_skipped` call site passes a `decidedBy` literal from the closed enum; every enum member has at least one call site (no dead enum arm) — asserted after wave 3 lands, since `applicability` has no call site before it | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Every lens-level skip call site passes a lens-suffixed `step` value matching an invoked subagent's name-suffix in that same step, never the bare step slug | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-skip-recording-audit.test.ts` |
| Every `reason` literal at a `route_append_step_skipped` call site names an absent input drawn from the tabulated predicate set — no size-judgement wording (`small`, `simple`, `trivial`, `minor`, `narrow`) | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-skip-recording-audit.test.ts` |
| Every subagent `Read:` entry naming an artifact a skippable step **or skippable lens** produces carries the `(if present)` qualifier — including `bkit-design.md` Step 5 / Step 6 / Step 7 and `bkit-plan.md` Step 5 / Step 6 / Step 7 / Step 8 | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| Every consumer of a versioned chain resolves `ls … \| sort -V \| tail -1` rather than a fixed `-v{N}-` filename | Unit (Vitest) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| No fan-out step hardcodes its full lens width: its existence assert, its verdict / failure derivation, its `step-done` `artifacts` array, its tracker comment and its gate items each range over the lenses that ran, and none names an absent lens's artifact by literal filename | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| `bkit-design-review-1.md` and `bkit-design-review-2.md` declare `Failures: <integer >= 0>` above `<!-- verdict:end -->`, and `bkit-design.md` Step 5 extracts and sums them over the reviews **present** into `DESIGN_REVIEW_FAILURES` | Unit (Vitest) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| The sole-emitter set is **derived** — every variable read by a gate whose only assignment site sits in a skippable step or lens is assigned a member of its own declared enum on that step's / lens's skip arm, and the assigned value is the one the downstream gate treats as "do not run". Fails on any newly-added sole emitter that has no hard-set | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Every continuity hard-set is an orchestrator **prose** variable placed outside any fenced code block — a shell assignment inside a fence reds the guard (shell state does not survive the tool-call boundary; `docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`) | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Every applicability predicate names an artifact that an earlier step in the same workflow demonstrably produces — no predicate reads a header no upstream step emits; and for the two design predicates the **heading literal** (`## Required Capabilities` / `## Runtime Surface Change`) appears verbatim in `bkit-design-generate.md`'s output format, so a rename in the prompt reds the guard rather than pinning both predicates permanently FALSE | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| The `bkit.sensitivePaths` arm appears only in a promoting position — every predicate carrying it is an OR of (base condition) OR (glob match), never an AND and never a negation, so a glob can add a lens and can never drop one | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| An absent `bkit.sensitivePaths` key resolves to `[]` through the same read path the workflow uses (`jq -r '.bkit.sensitivePaths // [] \| .[]'`), and an empty list matches no path — byte-identical predicate outcome to a consumer who sets `[]` explicitly | Unit (Vitest) | `.bkit/src/bkit-config-keys.test.ts` |
| The plan-side predicate set is exactly the tabulated one — `plan-review-2`, `plan-review-3`, Step 6, Step 8 and Step 10 carry a condition; Step 3, Step 5's `plan-review-1`, Step 7, Step 9 and Step 11 carry none — **and each apply-step condition reads the failure count (`>= 1`), never a verdict literal**, so an `!= PASS` rewrite reds the guard instead of silently reverting Open Question 4 to option B. The derived count of unconditional 🧠 steps in `bkit-plan.md` is five, so the narrow-path invocation count is derived from the workflow file rather than asserted in prose | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `bkit-plan-scope-check-2` is absent from the **live surface** — `.bkit/prompts/`, `.bkit/workflows/`, `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/comparison.md` — with append-only `*.jsonl` ledgers and `docs/plans/**` excluded; and `SCOPE_VERDICT` / `SCOPE_FAILURES` derive from the single remaining checker | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `bkit-plan.md` Step 3 asserts **both** `plan-v1-draft.md` and `plan-escalation.md` exist and are non-empty, its `plan-generate` `step-done` `artifacts` array names both, and Gate 3's artifact / PENDING items name both | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Plan Step 3.5 sets `PLAN_ESCALATE` in `TRUE\|FALSE`; the TRUE route reaches the escalation close without naming any Step 5 reviewer, and its close is entered exactly once per run (no loop back into Step 3) | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Debug Step 3 `TEST_VERDICT` = PASS at attempt 1 routes to a `NO-REPRO` outcome naming `/bkit-plan`, not to the clean-pass close | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `.bkit/prompts.md` documents every file in `.bkit/prompts/` after the deletion and additions (catalog parity, file → doc direction) | Unit (Vitest) | `.bkit/src/bkit-catalog-parity.test.ts` |
| Verdict-vocabulary linkage holds for the changed headers — every workflow gate enum matches its producing prompt's declaration | Unit (Vitest) | `.bkit/src/bkit-verdict-vocabulary.test.ts` |
| A scratch consumer installed from the built `dist/` receives the extended `bkit-status-route.sh` and the re-rendered workflows, and `bkit check` reports no drift | Integration (Vitest, spawned `bkit` via `tsx` on an `os.tmpdir()` consumer) | `.bkit/src/bkit-install.integration.test.ts` |
| A scratch consumer **seeded with** `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, then upgraded, carries none of the four afterwards — the observable proof the mirror-prune path fired | Integration (Vitest, spawned `bkit` via `tsx` on an `os.tmpdir()` consumer) | `.bkit/src/bkit-install.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

> [!WARNING]
> **`bkit-plan-scope-check-2` is deleted.** The prompt file, its `.bkit/prompts.md` row, its `bkit-plan.md` Step 7 invocation and its `plan-scope-check-2.md` artifact all go. It is the one genuine duplicate in the parallel-sibling set — byte-identical to `-1` apart from `name:` and `model:` (opus vs sonnet), carrying no `Lens:` of its own.
>
> **⚠️ Direct counter-evidence, observed while this very plan was being checked (2026-08-26, n=1).** On identical input, `bkit-plan-scope-check-1` returned `CONCERNS` with **3** failures and `bkit-plan-scope-check-2` returned `PASS` with **0**. So the two prompts do **not** return redundant output in practice, and the "byte-identical therefore redundant" half of the rationale is refuted as stated. What the observation does _not_ establish is that `-2` adds a **dimension**: the divergence runs in the direction of the cheaper model (`-2`, sonnet, effort slot 2) finding strictly less than the dearer one (`-1`, opus), which reads as a subordinate second sample rather than a second lens. That is one run, not a proof, and it cuts both ways — a second sample that sometimes catches what the first missed is exactly the argument for keeping it. **The decision is the human's at this gate**, and it is written up with options as Open Question 8. Task 14 stands unless the human answers otherwise.
>
> Consumer impact: a `.bkit/prompts.md` § Model Overrides row naming `bkit-plan-scope-check-2` becomes inert (it is below `bkit:end`, so `bkit install` never rewrites it and `bkit check` stays clean — the row simply matches nothing). Any consumer tooling globbing `plan-scope-check-*.md` will find one file where it found two.

> [!WARNING]
> **`step-skipped` is a new `status.jsonl` row type.** It is deliberately NOT folded — the reducer's fallthrough arm ignores unrecognised types, the same treatment `runtime-resolved`, `transport-fallback` and `close-transport` already get, in **both** reducers (`.bkit/src/bkit-status.ts` `fold` and the shell `BKIT_STATUS_FOLD` in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34`). Any consumer reader that assumes a closed type set, or that counts raw lines rather than folding, will see rows it does not recognise. Readers that fold, or that filter on `type`, are unaffected.

> [!WARNING]
> **A `step-skipped` row's `step` may be lens-suffixed.** For a skipped lens inside a fan-out step the value is the invoked subagent's suffix (`plan-review-2`, `design-review-1`), not the step's `step-done` slug (`plan-review`, `design-review`). Consequence: one step can emit a `step-done` under the bare slug **and** one or more `step-skipped` rows under lens-suffixed values in the same run. Any reader that assumes `step` values are drawn from the `step-done` slug set will not match lens rows. `counter_count` is unaffected — it filters `type=="step-done"` (`.bkit/scripts/bkit-counter-bus.sh:95`).

> [!WARNING]
> **Fan-out steps stop hardcoding their width.** `bkit-plan.md` Step 5 and `bkit-design.md` Step 5 currently name every lens's artifact by literal filename in their existence assert, `step-done` `artifacts` array, tracker comment and gate items. All four become width-dependent. Any consumer tooling that expects `artifacts` on a `plan-review` row to have length 3 will see 1, 2 or 3.

> [!IMPORTANT]
> **Design review artifacts gain a header line.** `design-review-1.md` grows `Failures: <integer >= 0>` (making its header three lines: `Verdict`, `Spike`, `Failures`) and `design-review-2.md` grows it (two lines). Any parser that assumes `<!-- verdict:end -->` sits at a fixed line number breaks; parsers that scan to the marker do not.

> [!IMPORTANT]
> **`design-v1-draft.md` gains machine-read structure.** Two new `##` sections carry the design-side applicability signal. Proposed names, both singular-noun section headings consistent with the existing `## Architecture` / `## Data Model` set:
>
> - `## Required Capabilities` — one row per capability the design needs that the stack does not already provide (new dependency, new external system, new service), or `None`. Drives `design-review-1` (buildability) and, transitively, `SPIKE`.
> - `## Runtime Surface Change` — what changes at runtime (new process, new endpoint, new job, new failure mode), or `None`. Drives `design-review-2` (operability).
>
> Both are human-readable design content, not hidden headers — the reviewability of the signal is the point (see Open Question 2).

> [!WARNING]
> **`bkit.sensitivePaths` is this plan's one net-new consumer surface, and it wants an explicit nod rather than passing as a detail.** `#442` § "Net new machinery for the whole issue" is a declared non-goal, and this key is in scope only because it sits inside the confirmed Acceptance Scenario (Process Sketch, three Edge Cases, two `Derived Test Matrix` rows). What it costs: a new consumer `package.json` key, a new `README.md` section, and a permanent config-compatibility obligation — once consumers set it, the shape cannot change without a breaking release. What it buys: the only way a consumer can force a review lens **on** for a path they consider sensitive, which is the safety valve that makes narrowing acceptable at all. It can never drop a lens.

**New names introduced:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `route_append_step_skipped` | shell function | `.bkit/templates/.bkit/scripts/bkit-status-route.sh` |
| `step-skipped` | `status.jsonl` row `type` | workflow skip arms; documented in `.bkit/workflows.md` § Event types |
| `caller-flag` / `upstream-verdict` / `applicability` | closed `decidedBy` enum — **three** members. `path-override` is deliberately NOT a member: a lens forced on by a sensitive-path glob *runs*, so it emits `step-done` and never a skip row; a fourth arm would be dead by construction and would red the no-dead-arm audit | same |
| `**Run lens only if**` | workflow-prose sub-step condition marker, distinct from the step-header `**Run only if**` / `**Skip if**` | `.bkit/workflows/bkit-design.md`, `bkit-plan.md`; documented in `.bkit/workflows.md` § Common Workflow Anatomy |
| `DESIGN_REVIEW_FAILURES` | workflow variable | `bkit-design.md` Step 5 (mirrors plan's `REVIEW_FAILURES`) |
| `PLAN_ESCALATE` | workflow variable, `TRUE\|FALSE` | `bkit-plan.md` Step 3.5 |
| `plan-escalate` / `design-escalated` | `status.jsonl` step keys | `bkit-plan.md` |
| `bkit.sensitivePaths` | consumer `package.json` config key, `string[]` of globs | read by design/plan predicates via `jq -r '.bkit.sensitivePaths // [] \| .[]' package.json`; matched against the draft's planned target paths with bash `case` pattern matching (POSIX-portable, no new dependency — `picomatch` is a `.bkit/src/` engine dep and the predicate runs in orchestrator shell, not in the engine); absent key resolves to `[]`. Documented in `README.md` beside `bkit.githubProject` / `bkit.issueTracker` |
| `NO-REPRO` | debug outcome label | `bkit-debug.md` Step 3 / Step 9 |

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the `PASS|CONCERNS|FAIL` verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this plan relies on. Each unresolved question is a risk — a wrong assumption breaks everything downstream.

- **Assumption:** `step-skipped` stays out of the fold, following the `runtime-resolved` / `transport-fallback` / `close-transport` precedent (documented in the event-type table, absent from the `StatusEvent` union in `bkit-status.ts`) → if it were folded instead, `counter_count` would start counting skips as attempts and every attempt-bounded loop in build and debug would mis-terminate.
- **Assumption:** the `COMPLEXITY_VERDICT` continuity value is `SINGLE`. The issue text says `NOSPLIT`, but `bkit-plan-complexity-check.md` declares `Verdict: SINGLE | SPLIT` and `bkit-plan.md` Gate 9 asserts `COMPLEXITY_VERDICT` in `SINGLE|SPLIT` → hard-setting `NOSPLIT` would fail that gate on every skip.
- **Assumption:** design Step 8's predicate is `MILESTONE` alone. The issue's second half — "more than one workstream" — is not computable before Step 8 runs, because decomposing into workstreams _is_ Step 8's job. The only downstream consumer of `design-v3-organised.md`'s `WS-N` structure is Step 10, which already gates on `MILESTONE` → if some other consumer of the workstream decomposition exists, skipping Step 8 starves it.
- **Verified finding (was an assumption):** `.bkit/scripts/*` ship via the core template directory walk as Tier-1 force-overwrite files, so extending the existing `bkit-status-route.sh` needs no `bkit-manifest.ts` row and no `bkit-modules.ts` change. Evidence: `.bkit/src/bkit-manifest.ts:723,741,745` carry explicit rows **only** for `.bkit/scripts/bkit-slop-*.{mjs,sh}` and the dependabot / lint module files, each commented as "moved OUT of the core template walk (#265) … See `CORE_TEMPLATE_PATH_EXCLUDE`". `bkit-status-route.sh` has **no** manifest row and is not in `CORE_TEMPLATE_PATH_EXCLUDE`, which is exactly the positive evidence the walk covers it. No residual risk.
- **Assumption:** build, debug and ship keep every step they have today; their 24 conditional steps gain skip logging only → if the reviewer disagrees and wants width cuts there, item 3 grows by three workflows.
- **Assumption:** the plan's own runbook exceeds the published `SINGLE` ceiling (`tasks <= 12`), so `/bkit-plan` Step 9 will very likely return `SPLIT` and Step 10 will partition it. That is expected, not a defect. **If it splits, Task 4 is the natural seam** — it is the largest single task in the runbook (28 skip arms plus 28 gate items across five workflow files) and it partitions cleanly one child per workflow file, because Task 5's audit derives its subject set from the files and therefore gates every partition equally.
- **Assumption:** a fan-out step whose lenses all skip is itself a skipped step, and records the bare-slug `step-skipped` row rather than N lens rows → if instead it should record N lens rows plus a step row, the audits double-count and `counter_count` still stays honest (it filters `step-done`), but the log grows a row per lens for no added information.
- **Assumption:** the `.bkit/workflows.md` header line `bkit-plan.md # Workflow 2/6 — 12 steps` (`:23`) counts _numbered_ steps, so adding Step 3.5 makes it 13 → if that count is instead meant as "steps 1..12" the line needs different wording; either way it is stale after Task 17 and is in that task's scope.
- **Assumption (template divergence, deliberate):** `docs/plans/template.md:53` § Design-Missing Fallback says a standalone plan replaces Narrative and Success Criteria with the `⚠️ MISSING …` string and does not fabricate either. This plan authors both from the issue's agreed-approach comment, marked with a `⚠️` note, following shipped precedent (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md:75-85`). The protective intent still holds because Gate 1 human confirmation gates both fields → if the human prefers the template letter, revert both fields to the MISSING string; if the precedent is right, the fallback clause needs amending to cover "standalone plan with a complete issue-side statement of intent". Either way it is a decision here, not a habit — and amending the template is **not** in this plan's scope.

---

- **Open Question 1:** Who computes each predicate — the orchestrator in bash, or an upstream subagent emitting a header? → resolve at plan review, or by the human here.
  - **Options:** A — bash everywhere: predicates must be countable off an artifact with `grep`/`awk` (dependency edges, `[MODIFY]`/`[DELETE]` rows, `MILESTONE` in `{LABELS}`, `Failures:` counts). Cheap, auditable, no new agent turns; but some signals genuinely are not countable. · B — header everywhere: each upstream subagent emits a machine-parseable flag. Uniform; but it makes an agent judge whether its own output needs reviewing, and adds header lines to artifacts that today have none. · C — mixed, split per row: bash where a count exists, an upstream artifact section where it does not, and no predicate at all where neither is available.
  - **Recommended:** C — it is the only option that does not force a bad mechanism onto rows that cannot carry it, and it makes the "no predicate available" cases explicit rather than fudged.
  - **Default if unanswered:** C, with the per-row split as tabulated in `Architecture & Component Changes` § Applicability predicates.

- **Open Question 2:** The design-side signal is self-assessed. `design-review-1` (buildability) and `-2` (operability) inspect `design-v1-draft.md`, which `bkit-design-generate` wrote — so whichever mechanism supplies the predicate, the design's author is deciding whether the design needs reviewing, and the lazy answer is always "no". → human decision.
  - **Options:** A — new `## Required Capabilities` and `## Runtime Surface Change` sections in the design doc, orchestrator counts non-`None` rows in bash. The signal is human-reviewable design content sitting in the canonical doc, so under-reporting is visible at the Gate-1 read rather than hidden in a header. · B — a hidden `Capabilities: <n>` / `RuntimeSurface: TRUE|FALSE` header above `<!-- verdict:end -->`. Smaller diff, no template change; but the signal is invisible to the human reviewing the design and pollutes the canonical doc when the version chain carries it forward. · C — no design-side predicate: `design-review-1` and `-2` stay unconditional, and item 3 shrinks to plan only.
  - **Recommended:** A — it converts a self-report into a reviewable artifact, and a design that claims `None` while adding a dependency is a defect a human can see.
  - **Default if unanswered:** A.

- **Open Question 3:** Design Step 3's `ideate-2` (optimal-tradeoff) and `ideate-3` (risk premortem) have no upstream artifact to read a predicate from — S3 is the first 🧠 step, and its only input is the raw issue text in `design-input.md`. → human decision.
  - **Options:** A — keep all three ideate lenses unconditional; drop them from this plan's scope. Costs the 2-invocation saving on a bug-fix-shaped design; buys zero new machinery and zero risk of a keyword heuristic silently deleting the risk lens. · B — split S3 into two waves: run `ideate-1` alone, have it emit `LegacyConstraint: TRUE|FALSE` and `NewRuntimeSurface: TRUE|FALSE`, then conditionally fan out `-2` and `-3`. No new agent; but it serialises a step that is parallel today, so the full-width path pays wall-clock to let the narrow path save two invocations. · C — a new cheap pre-S3 classifier subagent emitting both flags. Keeps the fan-out parallel; but it is net-new machinery the issue explicitly did not want, and it spends one invocation to maybe save two.
  - **Recommended:** A — grepping issue prose for "legacy constraint" is a scale dial wearing a predicate's clothes, and the risk-premortem lens is the one whose silent loss is least recoverable.
  - **Default if unanswered:** A. Design's saving then comes from S5, S7 and S8 (up to 4 invocations), not S3.
  - **Landing site if the human answers B or C:** neither has a runbook task, and neither is a task-sized edit — B re-shapes S3 from one parallel fan-out into two serial waves and C adds a subagent. Answering B or C means a **plan revision** before the runbook starts, not an in-flight runbook edit. Deferral row `442-design-ideate-lens-predicates` and the `Out of Scope` row both stay as the record if A stands.

- **Open Question 4:** Is `Verdict: PASS` alone sufficient evidence to skip an apply step, or is the `Failures:` count load-bearing? → resolve here; plan already has the count, design does not until item 2 lands.
  - **Options:** A — gate on `Failures` = 0. Precise: `CONCERNS` with zero findings is legal under the status invariants (`CONCERNS => failures >= 0`), and that combination genuinely has nothing to apply. · B — gate on `Verdict` = PASS. Simpler and needs no new design header; but it runs the apply step on every `CONCERNS`, including the zero-finding ones, so the saving mostly evaporates. · C — gate on both (`PASS` **and** `Failures` = 0). Strictly the most conservative; but it is A with a redundant conjunct, since `PASS => failures = 0` is already an asserted invariant.
  - **Recommended:** A — the count is the actual input to an apply step, and it is why item 2 adds the `Failures:` header to the design reviewers in the first place.
  - **Default if unanswered:** A.

- **Open Question 5:** Where does the escalation verdict come from? → human decision.
  - **Options:** A — a separate one-line artifact, `plan-escalation.md`, written by `bkit-plan-generate` alongside the draft, carrying `Escalate: TRUE|FALSE` + `<!-- verdict:end -->` and a one-paragraph reason. Keeps `plan-v1-draft.md` header-free, so `bkit-plan-update`'s `cp`-then-prepend needs no change and no stray header reaches the canonical plan. · B — an `Escalate:` header on `plan-v1-draft.md` itself. One fewer file; but `plan-update` copies the prior version verbatim and prepends its own `Verdict: PENDING` header, so the escalate line would end up buried in v2's body and ride into the canonical plan. Requires teaching `plan-update` to strip a pre-existing header. · C — a separate cheap classifier subagent before Step 3. Independent of the generating agent, so no self-assessment; but it must classify from raw issue text without a plan to look at, which is exactly the judgement the plan draft exists to make concrete.
  - **Recommended:** A — it gets the verdict from the agent that has just done the work of finding the open decisions, without touching the version chain or the canonical doc.
  - **Default if unanswered:** A.

- **Open Question 6:** What plan size makes `SPLIT` unreachable, so `complexity-check` can be skipped? → human decision; the issue asked for calibration against `.bkit/stats.jsonl`, and that corpus cannot supply it.
  - **Evidence:** `bkit-plan-complexity-check.md` publishes the rule as `SINGLE` = estimated tokens <= 85K **and** task count <= 12. Task count is greppable; the token estimate is a model judgement with no artifact behind it, so a task-count predicate can never prove the token arm unreachable. `.bkit/stats.jsonl` holds 12 `outcome` rows; `taskCount` is 0 on every design/plan row and 55, 55, 55, 92, 119, 119, 129 on the build/ship rows. There is **no** datapoint between 1 and 54, so the corpus offers zero calibration for the low end.
  - **Options:** A — keep `complexity-check` unconditional. It is the cheapest 🧠 step in plan (sonnet, `effort: medium`, `maxTurns: 25`, one file read), so the saving is the smallest in the set and the soundness risk is real. · B — skip when the runbook task count is <= 6 (half the published cap). Machine-countable off `plan-v3-checked.md`; but it silently assumes the token arm cannot fire below 6 tasks, which nothing establishes. · C — skip when task count <= 6 **and** the plan doc is under a byte ceiling as a token proxy. Adds a second arm; but doc bytes are a poor proxy for _execution_ tokens, so it buys the appearance of rigour rather than rigour.
  - **Recommended:** A — spend the cheapest invocation rather than assert an unreachability the data does not support, and revisit once the corpus has small-plan rows to calibrate against.
  - **Default if unanswered:** A — `complexity-check` stays unconditional. Consequences already applied throughout this plan under A: Step 9 has no `**Run only if**`, therefore no skip arm, therefore **no** `COMPLEXITY_VERDICT` hard-set (Task 12 / Task 13); the narrow path counts `complexity-check` as one of its five invocations; the declination is recorded as an `Out of Scope` row and mirrored as deferral `442-plan-complexity-check-predicate` carrying the `.bkit/stats.jsonl` evidence.
  - **Landing site if the human answers B or C:** a **plan revision** before the runbook starts, not an in-flight edit — B/C add a condition to Step 9, which in turn requires a skip arm, a `COMPLEXITY_VERDICT` = `SINGLE` prose hard-set, a sole-emitter audit row that now has a subject, a narrow-path count of four/five rather than five/six, and deletion of the `Out of Scope` row and its deferral. Cost is a re-run of `/bkit-plan` on this FID, not a builder improvising.

- **Open Question 7:** Where do the sensitive-path globs live, and what is the default? → human decision.
  - **Options:** A — `package.json` `bkit.sensitivePaths`, an array of globs, defaulting to `[]`, alongside the existing `bkit.githubProject` / `bkit.issueTracker` keys. Consumer-owned, so bkit's shipped surface names no auth / migration / payment path and stack-independence holds. · B — a block in `.agents/config.md` below `bkit:end`, alongside the `debug-fetch` blocks. Also consumer-owned and closer to the other agent-tooling config; but it needs a new marker grammar and a new parser, where `package.json` already has one. · C — ship a default glob list in bkit. Immediately useful; but it hardcodes stack assumptions into the shipped surface, which is the thing the stack-independence rule forbids.
  - **Recommended:** A — reuses the existing `bkit.*` config path and parser, and an empty default means a consumer who sets nothing gets exactly today's behaviour from the override.
  - **Default if unanswered:** A, defaulting to `[]`.

- **Open Question 8:** Should `bkit-plan-scope-check-2` still be deleted (Task 14), now that one observation contradicts the "redundant output" half of its rationale? → human decision.
  - **Evidence (2026-08-26, n=1, from this plan's own scope-check run):** the two prompts are byte-identical apart from `name:` and `model:`, and they were run on identical input. `bkit-plan-scope-check-1` (opus) returned `CONCERNS` with **3** failures; `bkit-plan-scope-check-2` (sonnet, effort slot 2) returned `PASS` with **0**. Byte-identical prompts therefore do not produce redundant output. The divergence ran in the direction of the cheaper model finding strictly less, which is consistent with "same lens, weaker sample" and not with "second dimension" — but it is one run, and the sample size cannot separate those two readings.
  - **Options:** A — delete as planned. `-2` declares the same `Lens:` line, so it samples one dimension twice; the observation shows the cheaper sample finding less, not finding differently in kind, and the cheap way to buy sampling variance is re-running `-1`. Saves one 🧠 invocation on every plan run and removes a documentation surface duplicated across `.bkit/prompts.md`, `.bkit/workflows.md` and `.bkit/comparison.md`. · B — keep `-2`, drop Task 14. Treats the observed divergence as the point: a second sample caught a different result set, and on this run the pair's union was strictly better than either alone. Costs one invocation on every plan run, keeps the duplicated catalog rows, and deletes Task 14, its `Supersession Inventory` rows, its caller inventory and the `scope-check-2`-removal matrix row. · C — keep `-2` but give it a genuinely distinct `Lens:` line, so the pair stops being a sampler and becomes two dimensions. Fixes the duplication complaint at its root and preserves the diversity; but nobody has yet named a second scope dimension, so authoring it is prompt-design work with no agreed content — its own cycle, not this plan.
  - **Recommended:** A — the plan's conclusion survives once the rationale is stated correctly. Delete on "same lens, weaker sample", never on "same output"; that wording is now corrected wherever it appeared. One run in which the cheaper sibling under-reported is weak support for paying for it on every plan.
  - **Default if unanswered:** A — Task 14 executes as written. Answering B or C is a **plan revision** before the runbook starts, not an in-flight edit: B removes a task and three inventory surfaces, C adds prompt-authoring work this plan has no content for.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change.

**Chosen: input-presence predicates, logged, applied to design and plan only, in four dependency-ordered waves.**

A step runs when the thing it inspects is present. That is machine-checkable, it is auditable after the fact via the `step-skipped` row, and it never deletes a dimension — a lens that is skipped had nothing to read, by construction. The four waves are ordered so that each is safe on its own: waves 1 and 2 are pure logging and pure tolerance with zero behaviour change, and only wave 3 changes what runs.

**Rejected paths:**

<!-- prettier-ignore -->
| Rejected | Why |
| --- | --- |
| A `NARROW \| STANDARD \| WIDE` scale dial | Collapses several independent facts into one number, then lets arbitrary filename numbering decide which lens survives. On plan Step 5, "NARROW = run 1" keeps the tightness lens (the one most duplicated by Step 7's scope check) and drops both dependency correctness and regression risk. The parallel siblings are not redundant copies — each carries an explicit `Lens:` line — so cutting width by count silently deletes a dimension |
| Reducing width in `bkit-build` Step 10 | `challenge-1` (bugs) and `challenge-2` (security) are different dimensions; dropping `-2` deletes security coverage entirely. `challenge-reconcile` stays unconditional as a consequence — with both challengers always running there are always two reports to merge |
| Making `build-plan-current` conditional on "plan commit is an ancestor of the base" | Step 2 branching off a stale `origin/dev` is exactly the case that step exists to catch; the obvious skip disables the guard on its own failure mode |
| A human approval gate on escalation | An orchestrator with free choice of steps drifts toward the cheap path, but that only bites on *downgrades*. Escalation is the expensive direction and is never the lazy choice; with build's plan requirement intact there is nothing below plan to downgrade into. The only automatic move available is upward, so no human needs to stand in for it |
| A `→ build` route or comment-only plans | `bkit-build.md:206` stays exactly as it is. Plan is the floor, which is precisely why plan's cost is the thing worth attacking |
| A new skip-precondition enum in the workflow prose | `decidedBy` on the row is the enum; a second one in prose would be a parallel vocabulary to keep in sync |
| Folding `step-skipped` into the run array | Would make skips indistinguishable from attempts to `counter_count`, breaking every attempt-bounded loop in build and debug |
| A step-level `**Run only if**` on the review fan-out steps | Would skip all three lenses together, deleting the tightness lens that always has something to read. The saving is per-lens, so the condition has to be per-lens; hence the `**Run lens only if**` sub-step construct |
| A `path-override` member in the `decidedBy` enum | A lens forced on by a sensitive-path glob **runs** — it emits `step-done`, not `step-skipped` — so no skip call site could ever carry the literal. The arm would be dead by construction and would red the no-dead-arm audit. Force-on is observable as the lens's ordinary `step-done` row plus the prose-invariant test that the glob arm sits only in a promoting OR position |
| Recording the force-on as a separate `status.jsonl` row type | A second additive audit type for one boolean the `step-done` row already implies. The observable question — "can a glob ever drop a lens?" — is a property of the workflow prose, and a markdown-invariant test answers it at build time rather than after the fact |
| A new shell script for the row emitter | `bkit-status-route.sh` already owns durable `status.jsonl` reads and writes (`route_append_debug_mode`, `route_append_push_mode`) and already has the `_route_die` / `_route_need_file` fail-closed helpers. Extending it costs no manifest row, no uninstall surface and no new drift target |

**Future-phase recommendations (not this plan):** once `step-skipped` rows exist across all five workflows, the ship status-hole detector can read skips from the log instead of inferring them from absence (`classifyRun` currently infers `MERGED_ON_ENTRY` from two missing rows). That is the single strongest argument for promoting it from advisory to gate — tracked as an existing deferral, listed under `Suggested Scope Expansion`.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Width reductions in `bkit-build` Step 10 (`challenge-1`/`-2`) and Step 11 (`challenge-reconcile`) | Genuinely-additive: the issue's own audit reviewed build and concluded "no changes" — the two challengers are different dimensions and reconcile always has two reports to merge | Declared non-goal — `#442` § `bkit-build` — reviewed, no changes |
| Making `bkit-build` Step 4 `build-plan-current` conditional | Genuinely-additive: explicitly dropped from the candidate list by the issue's audit, because a stale-`origin/dev` branch is the case the step exists to catch | Declared non-goal — `#442` § `bkit-build` — reviewed, no changes |
| Step-count reductions in `bkit-debug` and `bkit-ship` | Genuinely-additive: every 🧠 step in both is already conditional; the issue's audit records "no step changes" for debug and "no changes" for ship | Declared non-goal — `#442` § `bkit-debug` / § `bkit-ship` |
| Extending the status-hole detector beyond ship to design / plan / build / debug | Plan-sized: needs a per-workflow path model (each workflow's routing branches), a corpus sweep to seed each expected set, and a fail-open→gate promotion policy per workflow — new machinery, not a mechanical edit | Own cycle — follow-up issue |
| Promoting the status-hole detector from advisory to a blocking gate | Already deferred with an explicit promotion condition (one release of fail-open signal without muting) | Existing deferral `384-promote-status-hole-detector-from-advisory-to-gate` |
| A `NARROW \| STANDARD \| WIDE` scale dial, a skip-precondition enum in prose, a human approval gate on escalation, a new workflow | Genuinely-additive: each is explicitly rejected by the issue's agreed approach | Declared non-goal — `#442` § "Net new machinery for the whole issue" |
| Design Step 3 `ideate-2` / `-3` applicability predicates | Genuinely-additive under Open Question 3's recommended answer: no upstream artifact exists to carry a predicate, and the alternatives either serialise a parallel step or add a subagent the issue ruled out | Open Question 3 — reopen if the human picks option B or C |
| A `complexity-check` applicability predicate on plan Step 9 | Genuinely-additive under Open Question 6's recommended answer. `#442` § `bkit-plan` asks for it ("below the split threshold, `SPLIT` is unreachable"), but the published rule is `SINGLE` = tokens <= 85K **and** tasks <= 12, and no artifact carries a token estimate — so a task-count predicate can never prove the token arm unreachable. `.bkit/stats.jsonl` has 12 `outcome` rows; `taskCount` is 0 on every design/plan row and 55, 55, 55, 92, 119, 119, 129 on build/ship rows, with **no** datapoint between 1 and 54 — zero calibration for the low end | Open Question 6 — reopen once the corpus carries small-plan `taskCount` rows; mirrored as deferral `442-plan-complexity-check-predicate` |
| Amending `docs/plans/template.md` § Design-Missing Fallback to cover standalone plans with a complete issue-side statement of intent | Genuinely-additive: a template change alters every future plan's contract and is not required by any Success Criterion or matrix row here | Own cycle — follow-up issue; mirrored as deferral `442-plan-template-design-missing-fallback-amendment`; recorded as an assumption in `Open Questions & Assumptions` |

> **Two rows are `Exempt` only conditionally, and the human should see that at Gate 1.** The design Step 3 `ideate-2` / `-3` row and the `complexity-check` predicate row are `Exempt` **because** Open Questions 3 and 6 resolve to option A — and `#442` itself asks for the second one. Neither is `Blocking` as written: each names an explicit plan-revision landing site and each is evidenced (OQ6 carries the `.bkit/stats.jsonl` finding that no `taskCount` datapoint exists between 1 and 54). But if the human answers B or C at Gate 1, that exemption becomes required work parked out of scope, and the plan must be **re-run**, not patched in flight.

> `.bkit/workflows/bkit-auto.md` is not an `Exempt` row and takes no deferral: there is no work to defer. Its CI mode is failure-driven by construction and never receives a human-reported bug, so the debug entry rule cannot fire there and the file needs no change. Stated in `Architecture & Component Changes` § wave 4 so no builder invents a diff for it.

> [!CAUTION]
> **Default = in-scope.** An item is `Exempt` ONLY if genuinely-additive — NOT required by `Success Criteria`, an `Acceptance Scenario` / `Derived Test Matrix` row, or a design section (declared non-goals excepted). Mirror each `Exempt` row in `docs/deferrals.jsonl`.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| Promote the ship status-hole detector from advisory to a blocking gate | `docs/deferrals.jsonl` key `384-promote-status-hole-detector-from-advisory-to-gate` | `step-skipped` rows would let `classifyRun` read skips from the log instead of inferring `MERGED_ON_ENTRY` from two absent rows | Keep deferred — its promotion condition is a release of fail-open signal, which this plan does not supply |
| `.bkit/workflows.md` canonical-invariants row scope drift | `docs/deferrals.jsonl` key `workflows-md-canonical-invariants-row-scope-drift` | This plan edits `.bkit/workflows.md` § Event types and § Common Workflow Anatomy | Keep deferred — a drift audit of that table is a different change from adding one row to it |
| A per-workflow rollback path for shipped `.bkit/workflows/*` changes | `docs/deferrals.jsonl` key `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` | This plan's `Rollback Strategy` leans on whole-commit `git revert` for exactly this reason | Needs design decision — a per-workflow rollback primitive is its own cycle |
| `status.jsonl` run-boundary keying on last-run-overall | `docs/deferrals.jsonl` key `58-status-jsonl-run-boundary-keys-on-last-run-overall` | Touches the same fold semantics the `step-skipped` no-op test asserts against | Keep deferred — orthogonal to whether a new type is folded |
| Conditional-lens keystone vocabulary alignment with `/bkit-audit` | `related-issues.md` — `#402` A1 / `#405` | `#402` ships a three-state coverage manifest (`ran` / `N/A — not applicable` / `crashed`) plus `[applicability-override=…]` for the same false-all-clear problem this plan's `decidedBy` enum solves; its own Step-5/6 review found "the override escape hatch is textually indistinguishable from genuine absence" | Needs design decision — decide once whether the two surfaces share a vocabulary, before both ship two names for one idea |
| A `bkit check` drift gate over the rendered `.claude/` / `.cursor/` / `.opencode/` mirrors | `docs/failures.jsonl` key `363-host-mirrors-stale-after-first-challenge-remediation` (HIGH, OPEN) | This plan edits every workflow file and deletes a prompt, so it depends on the regen being run; the mirrors are force-overwritten and their drift exits 0 today | Keep deferred — the observable half is folded in here (Task 22 asserts the deletion reaches all four consumer surfaces); a general drift gate over force-overwritten dirs is its own cycle |
| Validating `--arg`-passed workflow variables against their enums at every existing write site | `docs/deferrals.jsonl` key `58-test-verdict-scope-arg-accepts-empty-silently` | The new `route_append_step_skipped` is `--arg`-based and does validate its own fields; the retrofit to existing sites does not | Keep deferred — cited as the rationale for the new helper's non-empty and enum asserts so the reasoning survives |
| Ship artifact lost before any commit captures it | `docs/failures.jsonl` key `363-ship-worktree-artifact-lost-before-any-commit-captures-it` | Weak overlap — this plan's one new artifact (`plan-escalation.md`) lands in the log directory beside the existing plan artifacts, not in a worktree-resident location | Keep deferred |
| Sequencing against the in-flight audit-workstream plan runs | `related-issues.md` — `#402`, `#403`, `#405` queued for `/bkit-plan` | Adding Step 3.5 and deleting a Step 7 sibling changes the workflow those queued runs execute mid-flight | Advisory only — note the interaction; do not gate this plan on their completion |

> [!CAUTION]
> **Candidates, not scope.** Entries are surfaced for human review; they do NOT become `Agent Execution Runbook` tasks and MUST NOT expand plan scope.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — the `reason` string on a `step-skipped` row is written into `status.jsonl`, which is committed and merged to `dev`. Every predicate reads only first-party artifacts the workflow itself produced (`plan-v*.md`, `design-v*.md`, `{LABELS}`, `package.json`), so no tracker or web content reaches the row. The helper must still pass `reason` through `jq --arg` rather than string interpolation, so a reason containing a quote or backslash cannot emit an unparseable line — one bad row makes the whole run's status file unreadable to every `jq -s` consumer, not just that entry.
- [ ] **New Secret/Env Var** — none. `bkit.sensitivePaths` is a glob list in `package.json`, not a credential; it names paths whose plans warrant extra review, and it is consumer-authored.

_No new routes, DB writes, or PII. The only untrusted-input surface (`design-input.md` / `plan-input.md`, which carry issue text) is read by subagents under the existing standing `External input:` header bullet and is never used as a predicate source._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime or dev dependency. Verify `pnpm-lock.yaml` still syncs cleanly after the branch is rebased.
- [ ] **Dependency Versions:** Run `pnpm outdated`; spot-check `npx tsc --version` and `pnpm --version`. `jq` and `bats` must be present — the new shell helper and its bats suite depend on both.
- [ ] **Existing-Solution Search (reuse over duplicate):** Confirmed before planning. `grep -rn 'step-skipped' .bkit/` returns nothing, so the row type genuinely does not exist. The emitter reuses `bkit-status-route.sh`, which already owns `route_append_debug_mode` / `route_append_push_mode` and the fail-closed `_route_die` / `_route_need_file` helpers — no new script. The `(if present)` read qualifier already exists at `bkit-plan.md` Step 5 for `related-issues.md`, and latest-present version resolution already exists at `bkit-design.md` Step 9, `bkit-plan.md` Step 11 and both close steps — both patterns are copied verbatim, not invented. The prose-audit test shape copies `.bkit/src/bkit-runtime-prose-audit.test.ts`. Every `[NEW]` artifact below is a test file or a workflow step; no new engine module.
- [ ] **User Context:** Read/write access to `.bkit/workflows/`, `.bkit/prompts/`, `.bkit/templates/.bkit/scripts/`, `.bkit/src/`, `.bkit/comparison.md`, `README.md`, `tests/`, `docs/`. No missing user information beyond the seven Open Questions.
- [ ] **Shipping walk verified (not assumed):** `.bkit/src/bkit-manifest.ts:723,741,745` carry rows only for the `CORE_TEMPLATE_PATH_EXCLUDE`d slop / dependabot / lint scripts; `bkit-status-route.sh` has no row, so the core template walk ships it. Confirm with `grep -n 'bkit-status-route' .bkit/src/bkit-manifest.ts` returning nothing before Task 1.
- [ ] **Project Context:** Check `docs/knowledge.jsonl` and `docs/decisions.jsonl`. Relevant established decisions: `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`, `58-status-fold-sourced-once-from-shared-script`, `58-followup-routing-state-reread-from-status-jsonl`, `341-runtime-enum-and-measured-sleep`, `384-tier3-promotion`. No existing decision covers skip recording or applicability predicates.
- [ ] **Testing & Quality:** Aligns with `docs/testing.md` § Tiers — Unit (`*.test.ts`), Integration (`*.integration.test.ts`), Shell (`tests/*.bats`). bkit has no E2E, `@live`, migration or Smoke tier, so no row in the matrix claims one.
- [ ] **Prerequisite Plans:** None. This plan is self-contained; waves 1 and 2 are its own prerequisites for waves 3 and 4.

### Conditional _(verify only when applicable)_

- [ ] **Architecture & UI** _(new files)_: New test files sit beside their peers in `.bkit/src/` and `tests/` per `docs/architecture.md` § Package Boundaries. No new `.bkit/src/` engine module and no new `.bkit/templates/.bkit/scripts/` file.
- [ ] **Observability** _(new log points)_: The `step-skipped` row is the new observable. Its diagnostics use the existing `[bkit-telemetry]` stderr prefix that `_route_die` already emits — load-bearing for log-drain grep per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. bkit's persistent state is `status.jsonl` (per-FID workflow event log) and the JSONL ledgers; the schema work here is to the event log.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — existing `step-done` rows (for `Failures` / verdict reads via `route_last_verdict` / `route_last_failures`) and `runtime-resolved` rows (unchanged).
- **Input (Read):** `.bkit/stats.jsonl` `outcome` rows — read once, for the Open Question 6 calibration finding only; not read at runtime.
- **Output (Write):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — one new `step-skipped` row per skipped conditional step.

### Data Schema Changes

- **ADD:** `status.jsonl` event type `step-skipped` — `{type:"step-skipped", workflow, step, reason, decidedBy, at, parentSha}`.
  - `workflow` ∈ `design|plan|build|debug|ship` (validated at the write site, same `case` as `decidedBy`); `reason` is free text naming the **absent input** (`"zero declared dependency edges"`, `"no new capability required"`, `"zero review findings"`), never a size judgement; `decidedBy` ∈ `caller-flag|upstream-verdict|applicability` — **three** members, no `path-override` (a forced-on lens runs and emits `step-done`); `at` is ISO-8601 UTC; `parentSha` is `git rev-parse HEAD` at step start.
  - **`step` is two-valued by construction.** For a whole-step skip it is the same kebab slug the step's `step-done` row would carry (`plan-review`, `design-spike`, `ship-conflict-resolve`). For a **lens** skip inside a fan-out step it is the invoked subagent's suffix (`plan-review-2`, `plan-review-3`, `design-review-1`, `design-review-2`). One step may therefore emit a `step-done` under the bare slug and one or more `step-skipped` rows under lens-suffixed values in the same run. `counter_count` is unaffected — `.bkit/scripts/bkit-counter-bus.sh:95` filters `type=="step-done"`.
  - **Not folded.** Both reducers' fallthrough arms ignore it — `.bkit/src/bkit-status.ts` `fold` (the reference implementation) and the shell `BKIT_STATUS_FOLD` in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34` (the copy workflows actually execute) — exactly as they ignore `runtime-resolved`, `transport-fallback` and `close-transport`. It therefore does not enter `WorkflowRun.steps`, does not affect `counter_count` / `counter_current`, and is absent from the `StatusEvent` union in `.bkit/src/bkit-status.ts` — consistent with the three existing additive audit rows. Both reducers are covered by a test row; the shell one is the merge-relevant copy.
  - **Dedup collapse is expected, not a defect.** `identity()` keys any non-`step-done` event as `W {type} {workflow} {at}` with **no** `step` field (`bkit-status.ts:62-65`, `bkit-status-fold.sh:34`). Two lens skips inside the same fan-out step sharing a second-resolution `at` collapse to one event _inside the fold_ before the reducer sees them. Harmless today — the fold discards the type regardless — and both raw lines remain in `status.jsonl` for any `jq`-over-raw-lines reader. Recorded here because it bounds what the future skip-reading consumer named under `Future-phase recommendations` can ever see from the folded view. Changing the dedup key is **out of scope** (it is `#58`'s counter contract).
  - **Union-merge safe.** Append-only NDJSON under `merge=union`; duplicate rows are harmless because nothing reduces them.
- **ADD:** consumer `package.json` key `bkit.sensitivePaths: string[]`, default `[]`. Read by design and plan predicates as a force-on override only, via `jq -r '.bkit.sensitivePaths // [] | .[]' package.json`; matched against the draft's planned target paths with bash `case` pattern matching. Documented in `README.md` beside the other `bkit.*` keys and covered by `.bkit/src/bkit-config-keys.test.ts`.
- **MODIFY:** `.bkit/workflows.md` § Event types — one new table row documenting `step-skipped`, in the same additive-audit-row block as `runtime-resolved` / `transport-fallback` / `close-transport`, stating both `step` forms.

## Architecture & Component Changes

**CRITICAL:** Every `[NEW]` states why an existing artifact cannot be evolved. Source-only edits — `.bkit/workflows/*`, `.bkit/prompts/*`, `.bkit/templates/*`, `.bkit/src/*`, `tests/*`, `docs/*`. NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*` mirrors; regenerate them with `bkit install`, batched once at session end.

### Shell primitives

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-status-route.sh`

- **Existence Check:** exists; already exports `route_get_debug_mode`, `route_get_push_mode`, `route_append_debug_mode`, `route_append_push_mode`, `route_last_verdict`, `route_last_failures`, `route_last_strategy`, `ladder_next`, plus `_route_die` / `_route_need_file` / `_route_need_fold`.
- Add `route_append_step_skipped STATUS_FILE WORKFLOW STEP REASON DECIDED_BY PARENT_SHA`, modelled byte-for-byte on `route_append_debug_mode`'s shape: validate `DECIDED_BY` against the closed three-member enum **and** `WORKFLOW` against `design|plan|build|debug|ship` in the same `case` block, assert `STEP` / `REASON` non-empty, `_route_need_file`, then `jq -nc --arg` every field (never `printf` + `sed` escaping — a backslash in a reason string emits an invalid JSON escape and makes the whole file unreadable to `jq -s`) and `>>` the file. Fail-closed: `_route_die` + `return 2`, nothing on stdout.
- **Why `WORKFLOW` is enum-validated and not merely non-empty:** the schema declares it a closed enum, and a typo'd value writes a row no reader will ever match — a silent hole in the audit trail this plan exists to create. Existing `--arg` sites accept anything non-empty (`docs/deferrals.jsonl` key `58-test-verdict-scope-arg-accepts-empty-silently`); retrofitting them is out of scope, but the new site does not inherit the gap.
- Does **not** require `BKIT_STATUS_FOLD` — it writes, it does not fold, matching `route_append_debug_mode`.
- **Why not a new script:** this module is already the single home for durable status routing state; a second script would duplicate the fail-closed helpers, add a manifest row, add an uninstall surface and add a drift target for no gain.

#### [MODIFY] `.bkit/src/bkit-status.ts`

- **Existence Check:** exists; defines `Step`, `WorkflowRun`, `StatusEvent`, `fold`, `parseStatus`, `validateInvariants`, `appendLine`.
- Header-comment only: document that `step-skipped` joins `runtime-resolved` / `transport-fallback` / `close-transport` as an additive audit row that the reducer ignores by design. **No change to the `StatusEvent` union** — adding it would imply the fold handles it, and the three existing audit rows are all absent from the union.

### Workflow prose — wave 1 (skip recording)

#### [MODIFY] `.bkit/workflows/bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`

- **Existence Check:** all five exist. `grep -nE '^\*\*(Skip if|Run only if)' .bkit/workflows/bkit-*.md` returns exactly **28** steps: design 3 (`:501`, `:714`, `:838`), plan 2 (`:743`, `:858`), build 9 (`:508`, `:698`, `:766`, `:952`, `:1022`, `:1163`, `:1228`, `:1284`, `:1343`), debug 7 (`:584`, `:798`, `:878`, `:944`, `:1020`, `:1077`, `:1139`), ship 7 (`:555`, `:860`, `:914`, `:979`, `:1065`, `:1142`, `:1193`).
- Each gains a skip arm immediately under its `**Skip if**` / `**Run only if**` line, in the corpus's existing shape — a fenced bash block that sources `bkit-status-route.sh` and calls the helper, then prose routing to the next step:

  ```bash
  REPO_ROOT=$(git rev-parse --show-toplevel)
  . "$REPO_ROOT/.bkit/scripts/bkit-status-route.sh"
  STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
  route_append_step_skipped "$STATUS" plan plan-review "zero declared dependency edges" applicability "$(git rev-parse HEAD)" || exit 2
  ```

- Each step's `🔒 Gate N` checklist gains one item, in the mandated shape (prose label first, variables only in a trailing backticked parenthetical): `- [ ] Skip recorded when the step did not run (\`step-skipped\` row with \`reason\` and \`decidedBy\`)`. A skipped step's gate is recorded as skipped, never as passed.
- `decidedBy` assignment across the 28: `caller-flag` for build `:508` (`[skills=false]`); `applicability` for the wave-3 predicates in design and plan; `upstream-verdict` for every remaining existing condition (verdict-, state- or count-gated). **No `path-override` arm exists** — a lens a sensitive-path glob forces on runs, so it never reaches a skip call site.
- **Enum-completeness is asserted in wave 3, not wave 1.** After wave 1 only `caller-flag` and `upstream-verdict` have call sites; `applicability` gets its first in Task 12. Putting the no-dead-arm assertion in Task 5 would make the suite red from wave 1 to wave 3 — a backwards dependency. Task 5 asserts presence and gate items; Task 15 asserts the enum is exactly `caller-flag|upstream-verdict|applicability` with no dead arm.
- **PROHIBITED:** no step's condition changes in wave 1, and no `**Run lens only if**` line is added in wave 1. This wave is logging only.

### Workflow prose — wave 2 (input tolerance, partial-width fan-out, verdict continuity)

#### [MODIFY] `.bkit/workflows/bkit-design.md`

- Step 5: extract `Failures` from **whichever reviews are present** and sum into `DESIGN_REVIEW_FAILURES`, mirroring plan Step 5's `REVIEW_FAILURES`; carry it on the `design-review` `step-done` row's `failures` field and into the Step 5 tracker comment (`- Failures: {DESIGN_REVIEW_FAILURES}`), matching plan's comment shape. Extend Gate 5's verdict item to cover the count, in the mandated single-item form.
- Step 5 read list (`:453`): both `design-review-1.md` and `design-review-2.md` become `(if present)` — this is the site that computes `REVIEW_VERDICT` + `SPIKE` and is the **first** to break on a lens skip, ahead of Step 7.
- Step 6 read list (`:505`): `design-review-1.md` becomes `(if present)` — Step 6 is spike, and `design-review-1` is now a skippable lens.
- Step 7 read list (`:559`): `design-review-1.md` **and** `design-review-2.md` each become `(if present)`.
- Step 8 read list (`:607`): replace the fixed `design-v2-reviewed.md` with a resolved highest-present chain — `DESIGN_CURRENT=$(ls docs/plans/{YYYYMM}/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)`, copied verbatim from Step 9's existing `DESIGN_FINAL` idiom, `**If** empty → **Failure Path**`.
- `SPIKE` continuity: the `design-review-1` **lens** skip arm hard-sets `SPIKE` = FALSE (sole emitter; Step 6's gate at `:501` and its invalid-value **Failure Path** at `:455` both read it). The arm is created in wave 3 (Task 12) because that is where the lens condition lands; wave 2 supplies only the tolerance the arm depends on. The invalid-value arm at `:455` must not re-invoke a subagent the predicate just skipped — its re-invoke branch is reachable only when the lens **ran**.
- `DESIGN_REVIEW_FAILURES` continuity: when **both** Step 5 lenses skip, Step 5 emits nothing and is itself a skipped step. Its step-level skip arm hard-sets `DESIGN_REVIEW_FAILURES` = 0, so Step 7's `>= 1` predicate reads a defined value. Without this the new variable is a sole emitter on a fully skippable step — the exact class Success Criterion 4 exists to close.

#### [MODIFY] `.bkit/workflows/bkit-design.md`, `.bkit/workflows/bkit-plan.md` — partial-width fan-out

The two review fan-out steps stop hardcoding their lens width. Each of the five width-dependent constructs, at both sites:

<!-- prettier-ignore -->
| Construct | Shipped shape | New shape |
| --- | --- | --- |
| Existence assert | `bkit-plan.md:498` / `bkit-design.md` Step 5 sub-step 2 — blanket "assert subagent Update / Create files exist, are non-empty … **If** any file empty → **Failure Path**" | Assert only the artifacts of the lenses whose condition was TRUE. A lens that skipped contributes no artifact and no assertion; its absence is proved by its `step-skipped` row, not by a **Failure Path** |
| Verdict / failure derivation | `bkit-plan.md:499` — `REVIEW_VERDICT` = worst of three, `REVIEW_FAILURES` = sum of three; `bkit-design.md:453` — same over two | Worst-of / sum-over the reviews **present**. All lenses skipped → the step is a skipped step, and its step-level arm supplies the continuity value |
| `step-done` `artifacts` array | `bkit-plan.md:507` — literal three-element array; `bkit-design.md:463` — literal two-element | Variable-length, one entry per lens that ran |
| Tracker comment | `bkit-plan.md:521` — prints all three artifact names | Names only the lenses that ran, and lists the skipped lenses with their `reason` |
| Gate items | `bkit-plan.md:527-533` Gate 5 — four items naming all three subagents and all three literal filenames, incl. `No PENDING placeholders remain (plan-review-1.md, plan-review-2.md, plan-review-3.md)`; `bkit-design.md:483-487` — same over two | Each of those items ranges over the lenses that ran, plus one skip item per skipped lens. The plan-wide rule "a skipped step's gate is recorded as skipped" does **not** apply here — this step *ran* |

- **Also applies to plan Step 7** (`:602`) while it still has two scope checkers; after Task 14 collapses it to one the construct is inert there but the audit rule still holds.
- **Why this is wave 2, not wave 3:** it is pure tolerance with zero behaviour change while every lens still runs unconditionally, and it is the strict prerequisite for Tasks 12 and 13. Landing it after the predicates would make the first narrow-path run route to **Failure Path**.

#### [MODIFY] `.bkit/workflows/bkit-plan.md`

- Step 5 read list (`:499`): all three `plan-review-*.md` become `(if present)` — the site that computes `REVIEW_VERDICT` / `REVIEW_FAILURES` and breaks first.
- Step 6 read list (`:545`): all three `plan-review-*.md` become `(if present)`.
- Steps 7, 8, 9, 10 (`:595`, `:599`, `:648`, `:698`, `:747`): replace fixed `plan-v2-reviewed.md` / `plan-v3-checked.md` with `PLAN_CURRENT=$(ls docs/plans/{YYYYMM}/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)` — the child-excluding form already in Step 11 and the close step.
- Step 7 read list (`:602`): both `plan-scope-check-*.md` become `(if present)`.
- Step 8 read list (`:648`): both `plan-scope-check-*.md` become `(if present)`. After Task 14 only `-1` remains and its producer is unconditional, so the qualifier there is **inert but correct** — the audit rule is "every read entry naming an artifact a skippable producer emits carries `(if present)`", a one-way implication, never an iff. A qualifier on a non-skippable producer's artifact is not a finding.
- Step 9 (`complexity-check`) stays unconditional under Open Question 6 option A, so it has **no** skip arm and **no** `COMPLEXITY_VERDICT` hard-set. `COMPLEXITY_VERDICT` is therefore not a sole emitter on a skippable step and does not enter the continuity set.

#### Continuity hard-sets are prose variables, never shell assignments

- Every hard-set (`SPIKE` = FALSE, `DESIGN_REVIEW_FAILURES` = 0) is written as an orchestrator **prose** variable outside any fenced code block, in the corpus's existing `{SPIKE}` substitution style (`bkit-design.md:453,455,486,501,559`; `bkit-plan.md:743,753`).
- **Why the placement is load-bearing:** a `SPIKE=FALSE` assignment inside the skip arm's bash fence is silently inert at the next tool call — shell state does not survive the boundary (`docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`; the still-OPEN `363-auto-route-suffix-github-env-handoff-inert-across-cloud-tool-calls` row is the same class). A guard that only checks "the arm contains `SPIKE` = FALSE" passes on the broken form, so Task 15's audit asserts **placement** as well as value.

#### [MODIFY] `.bkit/prompts/bkit-design-review-1.md`, `.bkit/prompts/bkit-design-review-2.md`

- **Existence Check:** both exist. `-1` declares `Verdict:` + `Spike:`; `-2` declares `Verdict:` only. Neither declares `Failures:`, and they are the only reviewers in the corpus that do not — every plan reviewer and scope checker has one.
- Add `Failures: <integer >= 0>` to each output-format header, above `<!-- verdict:end -->`, and a Process step setting it, both copied from `bkit-plan-review-1.md`'s wording. This is what makes design Step 7's zero-findings skip possible at all.

### Workflow prose — wave 3 (applicability predicates)

#### [MODIFY] `.bkit/prompts/bkit-design-generate.md`

- Add two sections to the output format, after `## Architecture` and before `## Data Model`, each with the corpus's `; initially set to \`PENDING\`` annotation, plus the matching Process steps:
  - `## Required Capabilities` — one row per capability the design needs that the stack does not already provide (new dependency, new external system, new service), else `None`.
  - `## Runtime Surface Change` — what changes at runtime (new process, endpoint, job, failure mode), else `None`.
- **Why here and not a header:** the signal must be reviewable by the human at Gate 1. A design that claims `None` while adding a dependency is then a visible defect rather than a hidden self-report (Open Question 2).

#### [MODIFY] `.bkit/workflows/bkit-design.md` — applicability predicates

<!-- prettier-ignore -->
| Step | Subagent | Condition kind | Runs when | Computed by | `step` on skip | `reason` when skipped |
| --- | --- | --- | --- | --- | --- | --- |
| S3 | `ideate-1` / `-2` / `-3` | none | always | — | — | — (Open Question 3, option A) |
| S4 | `design-generate` | none | always — mandatory | — | — | — |
| S5 | `design-review-1` | `**Run lens only if**` | `## Required Capabilities` in `design-v1-draft.md` is not `None`, **or** a `bkit.sensitivePaths` glob matches a planned target | orchestrator bash | `design-review-1` | `"no new capability required"` — and hard-set `SPIKE` = FALSE as a prose variable |
| S5 | `design-review-2` | `**Run lens only if**` | `## Runtime Surface Change` in `design-v1-draft.md` is not `None`, **or** a `bkit.sensitivePaths` glob matches a planned target | orchestrator bash | `design-review-2` | `"no runtime behaviour change"` |
| S5 | (whole step) | `**Skip if**` | both lens conditions FALSE | orchestrator bash | `design-review` | `"no capability and no runtime change"` — and hard-set `DESIGN_REVIEW_FAILURES` = 0 as a prose variable |
| S6 | `design-spike` | `**Run only if**` | `SPIKE` = TRUE — unchanged | — | `design-spike` | unchanged |
| S7 | `design-update` | `**Run only if**` | `DESIGN_REVIEW_FAILURES` >= 1 | orchestrator bash | `design-update` | `"zero review findings"` |
| S8 | `design-organise` | `**Run only if**` | uppercase `{LABELS}` contains MILESTONE | orchestrator bash | `design-organise` | `"no milestone — no workstream consumer"` |
| S9 | `design-summary` | none | always — mandatory, S10 and S11 gate on `SUMMARY_VERDICT` | — | — | — |

- Both S5 lenses skipped → the step itself is skipped, records the bare-slug row and hard-sets `DESIGN_REVIEW_FAILURES` = 0 → S7 skips on that zero → S8 skips without a milestone: design's narrow path is 5 invocations (ideate ×3, generate, summary).
- One S5 lens skipped, one runs → S5 **runs** at width 1: it asserts one artifact, sums over one review, emits a one-element `artifacts` array, names one lens in its comment, and ticks that lens's gate items plus one skip item.

#### [MODIFY] `.bkit/workflows/bkit-plan.md` — applicability predicates

<!-- prettier-ignore -->
| Step | Subagent | Condition kind | Runs when | Computed by | `step` on skip | `reason` when skipped |
| --- | --- | --- | --- | --- | --- | --- |
| S3 | `plan-generate` | none | always — mandatory | — | — | — |
| S3.5 | (no subagent) | none | always — 🤖 orchestrator-only | — | — | — |
| S5 | `plan-review-1` | none | always — its input is the plan | — | — | — |
| S5 | `plan-review-2` | `**Run lens only if**` | `grep -cE '^\s*(\*\*)?(Requires\|Blocked by\|After)' ` on the draft >= 1, **or** a `bkit.sensitivePaths` glob matches a planned target | orchestrator bash | `plan-review-2` | `"zero declared dependency edges"` |
| S5 | `plan-review-3` | `**Run lens only if**` | the draft's `Architecture & Component Changes` carries >= 1 `[MODIFY]` or `[DELETE]` row, **or** a `bkit.sensitivePaths` glob matches a planned target | orchestrator bash | `plan-review-3` | `"no consumed surface touched"` |
| S6 | `plan-update` | `**Run only if**` | `REVIEW_FAILURES` >= 1 | orchestrator bash | `plan-update` | `"zero review findings"` |
| S7 | `scope-check-1` | none | always | — | — | — |
| S7 | `scope-check-2` | — | **deleted** | — | — | — |
| S8 | `plan-update` | `**Run only if**` | `SCOPE_FAILURES` >= 1 | orchestrator bash | `plan-scope-update` | `"zero scope findings"` |
| S9 | `complexity-check` | none | always — Open Question 6, option A | — | — | — |
| S10 | `complexity-split` | `**Run only if**` | `COMPLEXITY_VERDICT` = SPLIT — unchanged | — | `plan-complexity-split` | unchanged |
| S11 | `plan-summary` | none | always — mandatory, S12 gates on it | — | — | — |

- **Narrow-path arithmetic, stated once and derivable from the table.** Unconditional 🧠 steps: `plan-generate`, `plan-review-1`, `scope-check-1`, `complexity-check`, `plan-summary` = **five**. A draft that declares no dependency edges and carries no `[MODIFY]` / `[DELETE]` row skips `plan-review-2` and `plan-review-3` and costs exactly those five. A draft that modifies a consumed surface adds `plan-review-3` = **six**. Full width is eleven. Step 3.5 is 🤖 orchestrator-only and invokes no subagent, so it adds nothing to any count. Every other statement of the count in this plan — Success Criteria, Concrete Example, Manual Verification Step 1 — derives from this line, and the matrix row "the plan-side predicate set is exactly the tabulated one" is what stops the three drifting apart again.
- The `bkit.sensitivePaths` arm is **force-on only** and appears in every predicate as `(base condition) OR (glob match)` — never an AND, never a negation. A glob may promote a lens from skipped to run; it may never demote one. A forced-on lens runs and emits `step-done`, so it writes **no** `step-skipped` row and needs no `decidedBy` value — which is why `path-override` is not an enum member.
- **Matcher mechanism:** the orchestrator reads the key with `jq -r '.bkit.sensitivePaths // [] | .[]' package.json` (absent key → `[]`, empty output, no match) and tests each planned target path from the draft's `Architecture & Component Changes` `[NEW]` / `[MODIFY]` / `[DELETE]` headings against each glob with bash `case "$path" in $glob) …` — POSIX-portable, no new dependency. `picomatch` is a `.bkit/src/` engine dependency and the predicate runs in orchestrator shell, not in the engine, so it is not available here and is not added.

#### [DELETE] `.bkit/prompts/bkit-plan-scope-check-2.md`

- Byte-identical to `bkit-plan-scope-check-1.md` apart from `name:` and `model:` (opus vs sonnet) — verified line by line: identical Role, Scope, EXECUTION PROTOCOL, Contract, all 14 Process steps, and an identical `Lens: Scope, criteria, verification audit.` It is a second-opinion sampler on a cheaper model, not a lens; everywhere else in the parallel-sibling set, cutting by count deletes a dimension, and here it deletes nothing.
- **Counter-evidence on record (2026-08-26, n=1, observed on this plan's own scope-check run).** The two prompts returned materially different results on identical input: `-1` gave `CONCERNS` / 3 failures, `-2` gave `PASS` / 0. Byte-identical prompts therefore do **not** imply redundant output, and any wording claiming they do is wrong. The surviving argument for deletion is narrower and is the one to rely on: `-2` carries no distinct `Lens:`, so it samples the same dimension on a cheaper model — and in the one observation available it found strictly **less**, not something different in kind. The deletion stands on "same lens, weaker sample", never on "same output". Decision surfaced to the human as Open Question 8; a `keep` answer deletes Task 14, its two `Supersession Inventory` rows, its caller-inventory table and the `scope-check-2`-removal matrix row, and is a plan revision rather than an in-flight edit.
- **Complete caller inventory** — every site verified by `grep -n 'scope-check' <file>`, not assumed:

<!-- prettier-ignore -->
| Site | What it carries | Action |
| --- | --- | --- |
| `.bkit/prompts/bkit-plan-scope-check-2.md` | the prompt itself | delete the file |
| `.bkit/workflows/bkit-plan.md` `:597,600,602,610,630,631,633,648` | Step 7 invocation, artifact assertion, `SCOPE_VERDICT` / `SCOPE_FAILURES` derivation (worst-of-two and sum-of-two collapse to the single checker's values), the status row's `artifacts` array, the tracker comment, Gate 7's four items, Step 8's read entry | collapse to the single checker |
| `.bkit/prompts.md:276` | § Special Behaviors row `bkit-plan-scope-check-2 \| Same scope, effort slot 2 (medium)` | delete the row |
| `.bkit/prompts.md:171` | **Models table** row carrying its six per-provider model pins + effort + `maxTurns` | delete the row |
| `.bkit/prompts.md:104` | effort-tier table, `medium` example list | remove the name from the list |
| `.bkit/prompts.md:388` | Cursor cross-family footnote naming it as a diversity slot | remove the name from the footnote |
| `.bkit/workflows.md:511` | artifact-kind table, Opinion-only-log row `plan-scope-check-1/2` | rewrite to `plan-scope-check-1` |
| `.bkit/workflows.md:540` | artifact inventory row `plan-scope-check-1`, `-2` \| both \| `plan-scope-check-1.md`, `-2.md` | rewrite to the single checker |
| `.bkit/workflows.md:654` | subagent table row `@bkit-plan-scope-check-1` / `-2` … `Same; pair.` | rewrite to a single entry |
| `.bkit/workflows.md:829` | Plan Phase step table, `7 — Check Scope \| @bkit-plan-scope-check-1 ‖ @bkit-plan-scope-check-2 (parallel)` | rewrite to the single checker, drop `(parallel)` |
| `.bkit/comparison.md:173` | shipped comparison row describing the agent | delete the row |
| `.bkit/version` `canonicalHashes` `:108,:162,:208` | one entry per rendered mirror (`.claude`, `.cursor`, `.opencode`) | regenerated by `pnpm bkit install` in Task 22 — never hand-edited |
| `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/` `bkit-plan-scope-check-2.md` | orphan rendered mirrors | pruned by install. Prune **is** implemented — `bkit-install.ts:808-832` for `.claude` / `.cursor` under the `WRITE_DIRS` allowlist, `bkit-modules.ts:147-165` and `:674-683` for `.opencode/agents`, bkit-prefix only — so a consumer loses the stale agent file on upgrade. Task 22 asserts it rather than assuming it |
| `.bkit/friction.jsonl` (1 historical occurrence) | append-only ledger row | **never edited.** Excluded from every `Done when` assertion |
| `docs/plans/**` | prior plan artifacts | **never edited.** Excluded from every `Done when` assertion |

- **Consequence for the `Done when`:** a blanket `grep -rc 'scope-check-2' .bkit/ docs/` returning zero is unachievable — `.bkit/friction.jsonl` carries a row that must not be edited and `.bkit/version` is only regenerated in Task 22. The assertion is narrowed to the live surface with ledgers and plan artifacts excluded.

### Workflow prose — wave 4 (routing)

#### [MODIFY] `.bkit/prompts/bkit-plan-generate.md`

- Add a second **Create** path, `docs/plans/{YYYYMM}/logs/{FID}/plan-escalation.md`, carrying `Escalate: TRUE | FALSE` + `<!-- verdict:end -->` and one paragraph of reason. `TRUE` when the generated plan rests on open decisions with real alternatives — that is, when `Open Questions & Assumptions` carries a question whose `Recommended` option changes the `Architecture & Component Changes` shape rather than a parameter.
- **Why a second artifact and not a header on the draft:** `bkit-plan-update` bootstraps by copying the prior version verbatim then prepending its own `Verdict: PENDING` header, so a header on `plan-v1-draft.md` would be buried in v2's body and ride into the canonical plan (Open Question 5).

#### [MODIFY] `.bkit/workflows/bkit-plan.md` — Step 3 second artifact

- Step 3 currently asserts one Create file and carries one path in the `plan-generate` `step-done` `artifacts` array, and Gate 3's "Artifacts written" / "No PENDING placeholders remain" items name one file. All four must cover `plan-escalation.md` as well, or Step 3.5 reads an artifact no upstream step asserts — the exact class Task 15's own audit row exists to catch ("every predicate names an artifact an earlier step demonstrably produces").
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

#### [NEW] `tests/step-skipped-row.bats`

- Row shape and the fail-closed contract for `route_append_step_skipped`, in a fresh subprocess per case against a real `status.jsonl`, following `tests/route-state.bats`'s shape. Honours a `BKIT_STATUS_ROUTE` override so a bats row can run `dev`'s version against the worktree's for RED-vs-GREEN without a second clone.
- **Why not extend `tests/route-state.bats`:** that file's scope is the durable routing-state reads (`debugMode` / `pushMode` / verdicts / ladder). A write-side emitter with its own enum validation is a distinct contract, and `docs/testing.md` § Counter derivation names each bats file by its scope.

#### [NEW] `.bkit/src/bkit-skip-recording-audit.test.ts`

- Presence audit over the workflow corpus, modelled on `.bkit/src/bkit-runtime-prose-audit.test.ts`. Derives **two** subject sets from the files themselves, never a hand-written list, so a newly-added conditional step or lens is covered-or-failing by construction:
  - step-level — `^\*\*(Skip if|Run only if)` (line-start, step-header position);
  - lens-level — `^\s*-?\s*\*\*Run lens only if\*\*` (indented, inside a step body).
- For each subject: a `route_append_step_skipped` call in its skip arm and a skip gate item within its own section. For lens subjects additionally: the `step` literal is the invoked subagent's suffix, not the bare step slug.
- Asserts every `reason` literal names an absent input drawn from the tabulated predicate set, and reds on size-judgement wording (`small`, `simple`, `trivial`, `minor`, `narrow`) — the schema states the rule and nothing else enforces it.
- **Does not** assert enum completeness — that moves to `bkit-applicability-audit.test.ts`, because `applicability` has no call site until wave 3 and a wave-1 assertion would be red for three waves.

#### [NEW] `.bkit/src/bkit-input-tolerance-audit.test.ts`

- Asserts `(if present)` on every read entry naming a skippable step's **or skippable lens's** output, latest-present resolution at every version-chain consumer, the `Failures:` header + present-only `DESIGN_REVIEW_FAILURES` extraction, and the partial-width fan-out invariant (no step names an absent lens's artifact by literal filename in its assert, derivation, `artifacts` array, tracker comment or gate items).
- Pins the **mechanism** (`sort -V | tail -1`, the literal `(if present)` qualifier), never a comment that explains it.
- The `(if present)` rule is a one-way implication, not an iff: a qualifier on an unconditional producer's artifact (plan Step 8's `plan-scope-check-1.md` after Task 14) is correct and must not red.

#### [NEW] `.bkit/src/bkit-applicability-audit.test.ts`

- Asserts: the **derived** sole-emitter continuity set (every gate-read variable whose only assignment site sits in a skippable step or lens carries a hard-set to a member of its own declared enum); that each hard-set sits **outside** any fenced code block; that every predicate names an artifact an earlier step produces; `scope-check-2`'s removal from the live surface; the `decidedBy` enum is exactly three members with no dead arm; the `bkit.sensitivePaths` arm appears only in a promoting OR position; the tabulated plan-side predicate set (which steps carry a condition, which do not); Step 3's two-artifact assertion; `PLAN_ESCALATE`'s enum and terminal TRUE-route; and debug's `NO-REPRO` route.

#### [MODIFY] `.bkit/src/bkit-status.test.ts`

- One case: `parseStatus(raw)` over a raw NDJSON fixture containing `step-skipped` lines, then `fold`, equals the same pipeline over the fixture with those lines removed. **Route through `parseStatus`, never a hand-built event** — `StatusEvent` (`bkit-status.ts:42-47`) is a closed union with no member for `runtime-resolved` / `transport-fallback` / `close-transport`, so constructing a `step-skipped` event would need `as unknown as StatusEvent`, which Gate 2 forbids and `slop:delta` flags. `parseStatus` takes a `string` and casts internally (`:139`), so a raw fixture keeps the case honest and cast-free.
- Prove it can fail — add the row to the union handling, watch the case red, revert.

#### [MODIFY] `tests/counter-derive.bats`

- One case: `counter_count` for a step key is unchanged by a `step-skipped` row carrying that key, and by one carrying its lens-suffixed variant.
- One case: the **shell** reducer `BKIT_STATUS_FOLD` (`.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34`) produces a run array unchanged by `step-skipped` rows. `.bkit/src/bkit-status.ts:10-12` says plainly it is the _reference_ reducer and that workflows execute the inline `jq` filter instead — so the Vitest case above covers the reference copy and this one covers the copy that decides whether a real run's counters stay honest.

#### [MODIFY] `.bkit/src/bkit-install.integration.test.ts`

- Extend the existing scratch-consumer scenario's assertions to cover the re-rendered workflows and the extended `bkit-status-route.sh` reaching the consumer, and `bkit check` reporting no drift.
- Add an **upgrade-prune** scenario: seed a scratch consumer with `bkit-plan-scope-check-2.md` under `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, upgrade it, assert none of the four survives. Mirror drift is not caught by `bkit check` (`docs/failures.jsonl` key `363-host-mirrors-stale-after-first-challenge-remediation`, HIGH, OPEN), so the prune must be observed, not assumed.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/prompts/bkit-plan-scope-check-2.md` | `.bkit/prompts/bkit-plan-scope-check-1.md` | DELETE | Byte-identical apart from `name:` and `model:`; carries the same `Lens:` line, so it is a second-opinion sampler, not a dimension. **Contested by one observation** — on this plan's own scope check `-1` returned `CONCERNS` / 3 and `-2` returned `PASS` / 0, so the output is not redundant; what is lost is a weaker second sample of the same lens, not a dimension. Open Question 8 puts the call to the human; the row stands under its default answer |
| `bkit-plan.md` Step 7 `@bkit-plan-scope-check-2` invocation, its artifact assertion, its `plan-scope-check-2.md` entry in the status row's `artifacts`, and its Gate 7 items | The single-checker Step 7 | DELETE | Direct consequence of the row above; `SCOPE_VERDICT` / `SCOPE_FAILURES` stop being worst-of-two / sum-of-two |
| `.bkit/prompts.md` rows for `bkit-plan-scope-check-2` — § Special Behaviors (`:276`), Models table (`:171`), effort-tier `medium` list (`:104`), Cursor cross-family footnote (`:388`) | The remaining `bkit-plan-scope-check-1` entries | DELETE | Catalog parity is asserted file → doc; a documented entry with no file is tolerated by the test but is drift. The Models-table row also carries six per-provider model pins that would silently pin nothing |
| `.bkit/workflows.md` rows naming `plan-scope-check-2` — artifact-kind table (`:511`), artifact inventory (`:540`), subagent table (`:654`), Plan Phase step table (`:829`) | The single-checker Step 7 | DELETE | `.bkit/workflows.md` is itself the workflow contract; a stale pair entry there ships doc drift into every consumer |
| `.bkit/comparison.md:173` row describing `bkit-plan-scope-check-2` | — | DELETE | Shipped consumer-facing doc describing an agent that no longer exists |
| `.bkit/workflows.md:23` step count `bkit-plan.md # Workflow 2/6 — 12 steps` | The same line with the count corrected for Step 3.5 | MODIFY | Not a deletion, but the same class: a fact in the contract file that Task 17 invalidates |

> [!CAUTION]
> **Default = `DELETE`.** Each `DELETE` row above is mirrored as `[DELETE]` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook` (Task 14).

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md` § Event types | One new row for `step-skipped` in the additive-audit-row block, stating both `step` forms (bare slug for a step skip, lens-suffixed for a lens skip) and the three-member `decidedBy` enum |
| `.bkit/workflows.md` § Common Workflow Anatomy | Skipped steps record a skip and a skipped gate; the `**Run lens only if**` sub-step construct and its per-lens row / gate item; a fan-out step's assert, derivation, `artifacts`, comment and gate items range over the lenses that ran; the entry-point doctrine (plan by default, design by escalation, debug for a reproducing failure) |
| `.bkit/workflows.md` § Rationale rehomed from the workflow files | Why the row is not folded (both reducers); why the fold's non-`step-done` dedup key collapses same-second skips and why that is not being changed here; why `SINGLE` (not `NOSPLIT`) is the continuity value and why plan Step 9 needs no hard-set under OQ6 option A; why the design S8 predicate is `MILESTONE` alone; why the `bkit.sensitivePaths` override is force-on only and why `path-override` is therefore not a `decidedBy` member; why continuity hard-sets are prose variables and not shell assignments. Every rationale byte belongs here, never in a workflow file |
| `.bkit/workflows.md:23` | Correct the `bkit-plan.md # Workflow 2/6 — 12 steps` count for Step 3.5 |
| `.bkit/workflows.md:511,540,654,829` | Rewrite the artifact-kind row, artifact inventory row, subagent table row and Plan Phase step table row that name `plan-scope-check-2` to the single checker; drop `(parallel)` at `:829` |
| `.bkit/prompts.md` | Design Phase — `bkit-design-generate` gains the two new sections; `bkit-design-review-1` / `-2` gain `Failures:` and their applicability conditions. Plan Phase — delete the `bkit-plan-scope-check-2` § Special Behaviors row (`:276`), Models table row (`:171`), effort-tier `medium` list mention (`:104`) and Cursor cross-family footnote mention (`:388`); note `bkit-plan-generate`'s second artifact. § Special Behaviors — update the parallel-fan-out and stubbed-output rows where they name `bkit-plan-scope-check-*` |
| `.bkit/comparison.md` | Delete the `:173` row describing `bkit-plan-scope-check-2` |
| `docs/testing.md` | Add the four new / modified test files to the file-inventory tables with their tier and scope, beside the existing counter-derivation and runtime-shim tables |
| `docs/decisions.jsonl` | Three `decision` rows — already appended by plan-generate: `442-step-skipped-row-not-folded`, `442-applicability-not-scale-dial`, `442-escalation-needs-no-human-gate`. Build verifies, does not re-append |
| `docs/deferrals.jsonl` | **Eight** `442-` `deferral` rows mirroring the `Out of Scope` `Exempt` table — the six plan-generate already appended plus `442-plan-complexity-check-predicate` (Open-Question-6 declination) and `442-plan-template-design-missing-fallback-amendment`. The detector-promotion `Exempt` row maps to the existing key `384-promote-status-hole-detector-from-advisory-to-gate` — no duplicate is minted, per the same-`key`-append rule. Two further non-`442-` rows carry the new `Suggested Scope Expansion` candidates (`conditional-lens-vocabulary-alignment-across-workflow-and-audit`, `bkit-check-drift-gate-over-rendered-host-mirrors`); they are advisory candidates, never runbook tasks |
| `docs/knowledge.jsonl` | One `knowledge` row if the retrofit surfaces a real gotcha; the issue's `NOSPLIT`-vs-`SINGLE` mismatch is a candidate |
| `README.md` | The entry-point line — default entry is `/bkit-plan`, design is entered by escalation from plan, debug is for a failure that already reproduces. Update the ASCII pipeline sketch to show the escalation edge. **Separately:** document `bkit.sensitivePaths` beside the existing `bkit.issueTracker` / `bkit.githubProject` / `bkit.depUpdater` / `bkit.cloudAgents` entries (§ Optional post-install decisions and the advisory table at `:384-388`) — what it is (a glob list of paths whose plans warrant extra review), that it defaults to `[]`, and that it can only force a review lens **on**, never off |
| `.agents/docs.md` | No change — no new doc file; `.bkit/*.md` are bkit-authoring docs and are not catalog rows |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | The only persistent-state change is an additive `status.jsonl` row type; existing logs stay readable because the fold already ignores unrecognised types |
| **Code** | `git revert {COMMIT}` on the squash-merge commit, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional |
| **Partial rollback** | Revert wave 3 and wave 4 independently of waves 1 and 2 | Holds **only because** every continuity hard-set lives in wave 3 alongside the skip arm that carries it. Waves 1 and 2 are pure logging and pure tolerance with no behaviour change: reverting only the predicates restores full width while keeping the skip log, the tolerant read lists and the partial-width fan-out shape (inert at full width, harmless). A hard-set left in wave 2 would strand it on a skip arm that no longer exists — which is why Task 12 and Task 13, not Task 9, own them. Waves 3 and 4 have no such split — the escalation route and the debug `NO-REPRO` route stand alone |
| **Risk window** | None — no deploy. A consumer on the released version is unaffected until they run `bkit upgrade` | A consumer who upgrades mid-run of a workflow could hit a workflow file whose step numbering changed (plan gains Step 3.5). The per-FID `.lock` and the resume-by-fold contract make that a resume-at-the-wrong-step risk, not corruption |

_A per-workflow rollback primitive does not exist; this is the reason the deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` is open. Whole-commit revert plus mirror regen is the current path._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** Waves 1-2 are behaviour-neutral and 3-4 are not, so a wave-per-commit shape reads well in review — advisory only, NEVER a gate; delivering every task in ONE PR is always correct.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Plan-verify reads this line and asserts against it before ticking `[x]`.
>
> Every task also carries a `Requires:` line naming the tasks that must complete first. Wave headings are advisory grouping; the `Requires:` edges are the ordering contract. There are no cycles, and no edge points backwards across a wave.

### Wave 1 — skip recording (pure logging, no behaviour change)

- [ ] **Task 1: Add `route_append_step_skipped` to the shared routing script.** _Requires: none._ Extend `.bkit/templates/.bkit/scripts/bkit-status-route.sh` with the emitter, modelled on `route_append_debug_mode`: closed-enum `case` on `DECIDED_BY` (`caller-flag|upstream-verdict|applicability` — three members) **and** on `WORKFLOW` (`design|plan|build|debug|ship`), non-empty asserts on `STEP` / `REASON`, `_route_need_file`, `jq -nc --arg` for every field, `>>` append, `_route_die` + `return 2` on any failure. **Done when:** `route_append_step_skipped` is defined in that file; a manual `sh -c '. …/bkit-status-route.sh && route_append_step_skipped ./tmp/s.jsonl plan plan-review r applicability abc'` appends one line that `jq -e .` parses and `jq -r .decidedBy` reports as `applicability`; the same call with `decidedBy=bogus` exits 2 and prints nothing on stdout; the same call with `workflow=bogus` exits 2 and prints nothing on stdout; the enum `case` contains no `path-override` arm.

- [ ] **Task 2: Cover the emitter with bats and both reducers.** _Requires: Task 1._ Create `tests/step-skipped-row.bats` with a fresh subprocess per case, a real temp `status.jsonl`, and a `BKIT_STATUS_ROUTE` override. Add cases to `tests/counter-derive.bats` and `.bkit/src/bkit-status.test.ts`. **Done when:** `npx bats tests/step-skipped-row.bats` passes and covers both matrix rows for the emitter (row shape with all seven fields; `decidedBy` / `workflow` enum, empty-`step` and empty-`reason` refusal at exit 2 with the file byte-unchanged); `tests/counter-derive.bats` proves `counter_count` for a step key is unchanged by a `step-skipped` row carrying that key **and** by one carrying its lens-suffixed variant, and proves the shell reducer `BKIT_STATUS_FOLD` (`bkit-status-fold.sh`) produces a run array unchanged by `step-skipped` rows; `.bkit/src/bkit-status.test.ts` proves the same for the reference reducer **routed through `parseStatus(raw: string)` over a raw NDJSON fixture, with no `as any` / `as unknown as StatusEvent` cast anywhere in the case**, and reds when the row is added to the union handling.

- [ ] **Task 3: Document the row type before any caller exists.** _Requires: Task 1._ Add the `step-skipped` row to `.bkit/workflows.md` § Event types beside `runtime-resolved` / `transport-fallback` / `close-transport`; add the not-folded rationale, the dedup-collapse note and the `**Run lens only if**` construct to § Rationale rehomed from the workflow files and § Common Workflow Anatomy; extend the `.bkit/src/bkit-status.ts` header comment. **Done when:** `.bkit/workflows.md` § Event types contains a `step-skipped` row naming all seven fields, both `step` forms (bare slug and lens-suffixed) and the three-member `decidedBy` enum; § Rationale states that neither reducer folds it and that same-second non-`step-done` rows collapse under the `W {type} {workflow} {at}` dedup key; `grep -c 'step-skipped' .bkit/src/bkit-status.ts` is >= 1 and the `StatusEvent` union is unchanged.

- [ ] **Task 4: Retrofit the skip arm to all 28 conditional steps.** _Requires: Tasks 1, 3._ Add the bash skip arm and the gate item to every step matched by `grep -nE '^\*\*(Skip if|Run only if)' .bkit/workflows/bkit-*.md`, assigning `decidedBy` per the Architecture table (`caller-flag` for build `:508`, `upstream-verdict` for the rest — no `applicability` and no `path-override` in this wave). Change no step's condition. **Done when:** every step matched by that grep has exactly one `route_append_step_skipped` call and exactly one skip gate item **within its own section** — verified by Task 5's derived audit, not by a bare corpus-wide count; `git diff` shows no edit to any `**Skip if**` / `**Run only if**` condition text and no `**Run lens only if**` line added.

- [ ] **Task 5: Gate the retrofit with a derived presence audit.** _Requires: Task 4._ Create `.bkit/src/bkit-skip-recording-audit.test.ts`, deriving **both** subject sets from the workflow files at run time — step-level via `^\*\*(Skip if|Run only if)` and lens-level via `^\s*-?\s*\*\*Run lens only if\*\*` — never a hand-written list. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-skip-recording-audit.test.ts` passes its matrix rows (every step-level **and** lens-level conditional subject has a call and a gate item within its own section; every lens-level call site passes a lens-suffixed `step` literal matching a subagent invoked in that same step, never the bare slug; every `reason` literal names an absent input and none uses size-judgement wording); deleting one call site reds it; **the enum-completeness / no-dead-arm assertion is NOT in this file** — it lands in Task 15, because `applicability` has no call site until wave 3 and asserting it here would red the suite for three waves.

### Wave 2 — input tolerance, partial-width fan-out, verdict continuity (mechanical, no behaviour change)

- [ ] **Task 6: Make read lists tolerate an absent producer.** _Requires: none (safe alone)._ Add `(if present)` to design Step 5's two review entries (`:453`), Step 6's `design-review-1.md` entry (`:505`) and Step 7's two review entries; and to plan Step 5's three review entries (`:499`), Step 6's three review entries, Step 7's two scope-check entries (`:602`) and Step 8's two scope-check entries — copying the qualifier's existing wording at `bkit-plan.md` Step 5. **Done when:** each of those twelve read entries carries `(if present)`; `grep -c '(if present)' .bkit/workflows/bkit-design.md .bkit/workflows/bkit-plan.md` is at least twelve higher than at HEAD; **no** `Read:` entry naming a `plan-review-*.md`, `design-review-*.md` or `plan-scope-check-*.md` artifact anywhere in either workflow lacks the qualifier.

- [ ] **Task 7: Resolve version chains to latest-present.** _Requires: none (safe alone)._ Replace fixed `design-v2-reviewed.md` at design Step 8 and fixed `plan-v2-reviewed.md` / `plan-v3-checked.md` at plan Steps 7, 8, 9 and 10 with the `ls … | sort -V | tail -1` idiom already at design Step 9 / plan Step 11 (plan keeps the child-excluding `grep -v 'plan-v[0-9]*-[0-9]'`), each with an empty-result **Failure Path**. **Done when:** no `Read:` line in either workflow names a fixed `-v2-` or `-v3-` filename; each replacement site contains `sort -V | tail -1` and an empty-result **Failure Path**.

- [ ] **Task 8: Add the `Failures:` header to both design reviewers and sum it over the reviews present.** _Requires: Task 6._ Extend `bkit-design-review-1.md` and `-2.md` output formats and Process steps, copying `bkit-plan-review-1.md`'s wording; extract and sum into `DESIGN_REVIEW_FAILURES` at design Step 5 **over whichever reviews exist**, carry it on the `design-review` row's `failures` field and in the Step 5 tracker comment; extend Gate 5. **Done when:** both prompts declare `Failures: <integer >= 0>` above `<!-- verdict:end -->`; `bkit-design.md` Step 5 assigns `DESIGN_REVIEW_FAILURES` as a sum over the reviews present (not a fixed two-term sum) and passes it as the row's `failures`; `npx vitest run .bkit/src/bkit-verdict-vocabulary.test.ts` passes.

- [ ] **Task 9: Make both review fan-out steps partial-width tolerant.** _Requires: Tasks 6, 8._ This is the strict prerequisite for Tasks 12 and 13 — without it the first narrow-path run routes to **Failure Path** at `bkit-plan.md:498`. At `bkit-plan.md` Step 5, `bkit-design.md` Step 5 and `bkit-plan.md` Step 7, rewrite all five width-dependent constructs per the Architecture table: the existence assert covers only the lenses that ran; the verdict / failure derivation is worst-of / sum-over the artifacts present; the `step-done` `artifacts` array is variable-length; the tracker comment names the lenses that ran and lists skipped lenses with their `reason`; each gate item ranges over the lenses that ran, plus one skip item per skipped lens. **Done when:** neither `bkit-plan.md` Step 5 / Step 7 nor `bkit-design.md` Step 5 contains a literal `plan-review-2.md` / `plan-review-3.md` / `design-review-2.md` / `plan-scope-check-2.md` filename in its existence assert, verdict derivation, `artifacts` array, tracker comment or gate items; each of those sites is phrased over "the lenses that ran"; no blanket "**If** any file empty → **Failure Path**" remains at a fan-out step; `git diff` shows no `**Run only if**` / `**Run lens only if**` condition added by this task (it is tolerance only, inert at full width).

- [ ] **Task 10: Gate wave 2 with a derived tolerance audit.** _Requires: Tasks 6, 7, 8, 9._ Create `.bkit/src/bkit-input-tolerance-audit.test.ts`, pinning mechanisms (`sort -V | tail -1`, the literal `(if present)`, the `Failures:` declaration, absence of literal lens filenames at fan-out sites), never prose that explains them. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-input-tolerance-audit.test.ts` passes all of its matrix rows (read-list tolerance, latest-present resolution, design `Failures:` + present-only sum, partial-width fan-out); reverting one `(if present)` qualifier reds it; re-adding one literal lens filename to a fan-out step's `artifacts` array reds it; the `(if present)` rule is implemented as a one-way implication so a qualifier on an unconditional producer's artifact does **not** red it.

### Wave 3 — applicability predicates (design and plan only)

- [ ] **Task 11: Give the design doc the two signal sections.** _Requires: none (safe alone)._ Add `## Required Capabilities` and `## Runtime Surface Change` to `bkit-design-generate.md`'s output format with the corpus's `PENDING` annotation, plus the Process steps that populate them. **Done when:** both sections are in the output format between `## Architecture` and `## Data Model`, each annotated `initially set to \`PENDING\``, and each has a Process step naming it.

- [ ] **Task 12: Wire the design predicates and their continuity hard-sets.** _Requires: Tasks 5, 9, 10, 11._ Add the two `**Run lens only if**` conditions to design Step 5's two lens bullets, the step-level `**Skip if**` for the both-lenses-FALSE case, and the `**Run only if**` conditions to Steps 7 and 8 — each with the Task-4 skip-arm shape carrying `decidedBy: applicability`, the tabulated `reason`, and the lens-suffixed `step` value where it is a lens. Carry the continuity hard-sets here, where the arms now exist: the `design-review-1` lens arm sets `SPIKE` = FALSE; the Step 5 step-level arm sets `DESIGN_REVIEW_FAILURES` = 0. Both are orchestrator **prose** variables written outside any bash fence. Leave Step 3's three ideate lenses unconditional per Open Question 3 option A. **Done when:** design Step 5 carries two `**Run lens only if**` lines and one step-level `**Skip if**`, and Steps 7 and 8 each carry a `**Run only if**` line, every one naming a bash-countable condition over a named artifact; the `design-review-1` lens arm contains `SPIKE` = FALSE and the Step 5 step-level arm contains `DESIGN_REVIEW_FAILURES` = 0; **each hard-set sits outside any fenced code block** and each assigned value is a member of the enum its own gate asserts (`TRUE|FALSE`; a non-negative integer for the failure count); no arm assigns `NOSPLIT`; `grep -c 'Run only if' .bkit/workflows/bkit-design.md` is 2 higher than at HEAD and `grep -c 'Run lens only if' .bkit/workflows/bkit-design.md` is 2; Step 3 is unchanged in `git diff`.

- [ ] **Task 13: Wire the plan predicates.** _Requires: Tasks 5, 9, 10._ Add the two `**Run lens only if**` conditions to plan Step 5's `plan-review-2` and `plan-review-3` bullets and the `**Run only if**` conditions to Steps 6 and 8, each with its skip arm carrying `decidedBy: applicability` and, for a lens, the lens-suffixed `step` value. Each lens condition takes the two-arm form `(base condition) OR (bkit.sensitivePaths glob match)`; the glob arm can only add the lens, and a forced-on lens runs and writes **no** skip row, so no call site carries `path-override`. Leave Step 9 unconditional per Open Question 6 option A — it therefore has no skip arm and no `COMPLEXITY_VERDICT` hard-set; `COMPLEXITY_VERDICT` is not a sole emitter on a skippable step. Build's `CHALLENGE_VERDICT` needs no change either — build Step 11 stays unconditional because both challengers always run. **Done when:** plan Step 5 carries two `**Run lens only if**` lines and Steps 6 and 8 each carry a `**Run only if**` line; both lens conditions contain both arms, OR'd — never AND'ed, never negated — so the glob arm can only add the lens; no `route_append_step_skipped` call site anywhere in the corpus passes `path-override`; Step 9 has no `**Run only if**`, no skip arm and no `COMPLEXITY_VERDICT` assignment, and no arm in any workflow assigns `NOSPLIT`; the plan workflow reads `bkit.sensitivePaths` via `jq -r '.bkit.sensitivePaths // [] | .[]' package.json` and matches with bash `case`, so an absent key yields `[]` and matches nothing.

- [ ] **Task 14: Delete `bkit-plan-scope-check-2` and every caller.** _Requires: Tasks 9, 13._ **Gated on Open Question 8** — the deletion's justification is "same lens, weaker sample", not "same output"; one observation (this plan's own scope check: `-1` `CONCERNS` / 3, `-2` `PASS` / 0) refutes the output-redundancy claim. Under OQ8's default answer A the task executes exactly as written; a B or C answer removes it and is a plan revision, not an in-flight edit. Remove the prompt file; collapse plan Step 7 to the single checker (invocation, artifact assertion, `SCOPE_VERDICT` / `SCOPE_FAILURES` derivation, the status row's `artifacts` array, the tracker comment, Gate 7's items); and update every site in the Architecture § caller inventory — `.bkit/prompts.md:104,171,276,388`, `.bkit/workflows.md:511,540,654,829`, `.bkit/comparison.md:173`. Never touch `.bkit/friction.jsonl`, `.bkit/version` or `docs/plans/**`. **Done when:** `.bkit/prompts/bkit-plan-scope-check-2.md` does not exist; `grep -rn 'scope-check-2' .bkit/prompts/ .bkit/workflows/ .bkit/prompts.md .bkit/workflows.md .bkit/comparison.md` returns zero matches — the live surface only, with append-only `*.jsonl` ledgers, `.bkit/version` (regenerated in Task 22) and `docs/plans/**` deliberately excluded because editing them is prohibited; `git diff` shows no change to `.bkit/friction.jsonl`; `npx vitest run .bkit/src/bkit-catalog-parity.test.ts` passes; plan Step 7's `SCOPE_VERDICT` derives from one artifact.

- [ ] **Task 15: Gate wave 3 with a derived applicability audit.** _Requires: Tasks 12, 13, 14._ Create `.bkit/src/bkit-applicability-audit.test.ts` covering the continuity hard-sets, the predicate-artifact linkage, the enum, the `sensitivePaths` force-on-only property, the tabulated predicate set and `scope-check-2`'s removal (its escalation and debug rows land in Task 18 and Task 19). Add the `bkit.sensitivePaths` default-resolution row to `.bkit/src/bkit-config-keys.test.ts` beside the existing `bkit.*` key contracts. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-applicability-audit.test.ts` passes its rows — sole-emitter continuity derived from the files (not an enumerated list, so a newly-added sole emitter with no hard-set reds it), hard-set placement outside any fenced block, predicate-artifact linkage, `decidedBy` literals forming exactly the three-member enum with no dead arm, the `sensitivePaths` arm appearing only in a promoting OR position, the tabulated plan-side predicate set, and `scope-check-2`'s removal from the live surface; introducing a predicate that reads an unemitted header reds it; moving one hard-set inside a bash fence reds it; adding a fourth `decidedBy` literal reds it; **each design predicate's heading literal — `## Required Capabilities` and `## Runtime Surface Change` — appears verbatim in `bkit-design-generate.md`'s output format**, so renaming a heading in the prompt reds the guard instead of silently pinning both predicates FALSE, skipping both lenses forever and leaving every other guard green; **each apply-step condition reads the failure count, never a verdict literal** (`REVIEW_FAILURES` / `DESIGN_REVIEW_FAILURES` / `SCOPE_FAILURES` `>= 1`), so rewriting one as `REVIEW_VERDICT != PASS` reds it — that rewrite otherwise satisfies every other guard while silently reverting Open Question 4 to option B, and `CONCERNS` with `failures = 0` is exactly the case it would break; **the derived count of unconditional 🧠 steps in `bkit-plan.md` is exactly five**, so Success Criteria, the `Concrete Example`, the plan-side predicate table and Manual Verification Step 1 cannot drift apart; `npx vitest run .bkit/src/bkit-config-keys.test.ts` proves an absent `bkit.sensitivePaths` resolves to `[]` through the same read path the workflow uses.

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

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` justified against extending an existing artifact (the emitter extends `bkit-status-route.sh`; the audits copy `bkit-runtime-prose-audit.test.ts`'s derived-set shape); no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Source-only edits:** no file under `.claude/`, `.cursor/` or `.opencode/` was hand-edited; every mirror change came from `bkit install`.
- [ ] **Derived sets, never hand-written lists:** each audit test derives its subject set from the files under test, so a newly-added conditional step or prompt is covered-or-failing by construction.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Shell helpers** — bats, cross-process, real `status.jsonl` and real exit codes; never a re-implementation of the script under test. Use the `BKIT_*` path override so a bats row can run `dev`'s version against the worktree's.
> - **Workflow / prompt prose** — Vitest markdown-invariant tests. Assert the **rule** (a call site, a flag, an `if:` shape), never the sentence that explains it; a guard pinned to prose reds when someone improves a comment and passes for years after the rule is deleted. This corpus is the one sanctioned exception where wording _is_ the deliverable: a header declaration or a `**Run only if**` operator is behaviour, and asserting on it is correct.
> - **Prove each guard can fail** — put the bug back and watch it red before trusting it.
> - **No browser tier** — bkit has no UI; nothing here drives a browser.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** every row maps to a runbook task above (Tasks 2, 5, 10, 15, 19, 22 carry the test-bearing `Done when` lines; Tasks 8 and 14 carry the vocabulary and catalog rows; Task 15 carries the `bkit-config-keys.test.ts` row). Count the rows in the matrix at build time and confirm the mapping is total — do not trust a number written in prose.
- [ ] **Update existing tests:** `.bkit/src/bkit-status.test.ts`, `tests/counter-derive.bats`, `.bkit/src/bkit-install.integration.test.ts`, `.bkit/src/bkit-config-keys.test.ts`, plus any assertion in `bkit-catalog-parity.test.ts` / `bkit-verdict-vocabulary.test.ts` that moves with the deleted prompt and the new headers.
- [ ] **Write new tests:** `tests/step-skipped-row.bats`, `.bkit/src/bkit-skip-recording-audit.test.ts`, `.bkit/src/bkit-input-tolerance-audit.test.ts`, `.bkit/src/bkit-applicability-audit.test.ts`.
- [ ] **Verify observability:** the `step-skipped` row is the new observable; its failure diagnostics keep the `[bkit-telemetry]` stderr prefix `_route_die` already emits, per `docs/observability.md`.
- [ ] **Update documentation:** every row in `Documentation Updates` completed, rewritten as prose rather than appended as bullets.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Docs updated:** every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
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

- [ ] **Step 1 — Narrow-path live run.** Run `/bkit-plan` against a single-task issue in this repo whose plan will declare no dependency edges. Confirm from the tracker comments that exactly **five** 🧠 steps invoked a subagent if the draft carries no `[MODIFY]` / `[DELETE]` row, or **six** if it carries one (the sixth is `plan-review-3`); Step 3.5 invokes no subagent and is not counted. Confirm from `jq -r 'select(.type=="step-skipped") | "\(.step)\t\(.decidedBy)\t\(.reason)"' docs/plans/*/logs/{FID}/status.jsonl` that every skipped step **and lens** recorded a row naming an absent input, with lens rows carrying lens-suffixed `step` values.
- [ ] **Step 2 — Full-width live run.** Run `/bkit-plan` against an issue whose plan declares dependency edges and modifies exported symbols. Confirm all three Step 5 reviewers ran, that no `step-skipped` row was written for Step 5 or any of its lenses, and that the `plan-review` `step-done` row's `artifacts` array has three entries.
- [ ] **Step 2b — Partial-width live run.** Run `/bkit-plan` against an issue whose plan modifies a consumed surface but declares no dependency edges. Confirm Step 5 **ran** at width 2, that exactly one `step-skipped` row exists with `step` = `plan-review-2`, that the `plan-review` `step-done` row's `artifacts` array has two entries, and that the run did not enter the Failure Path.
- [ ] **Step 2c — Sensitive-path force-on.** Set `bkit.sensitivePaths` to a glob matching a file the plan touches, on an issue whose base predicates are both FALSE. Confirm the matched lens **ran**, wrote no `step-skipped` row, and that the run cost one invocation more than the same issue with the key unset.
- [ ] **Step 3 — Escalation live run.** Run `/bkit-plan` against an issue with a genuinely open architectural decision. Confirm `plan-escalation.md` reports `Escalate: TRUE`, no Step 5 reviewer was invoked, and the tracker comment names `/bkit-design`.
- [ ] **Step 4 — Debug entry rule.** Run `/bkit-debug` against a green FID. Confirm the run records `NO-REPRO` and the summary names `/bkit-plan`, rather than reporting a clean pass.
- [ ] **Step 5 — Consumer upgrade.** In a separate consumer clone, run `bkit upgrade`, then `bkit check`. Confirm exit 0, that `.bkit/scripts/bkit-status-route.sh` carries `route_append_step_skipped`, that `bkit-plan-scope-check-2.md` is gone from `.bkit/prompts/`, `.claude/agents/`, `.cursor/agents/` and `.opencode/agents/`, and that no `.opencode/` or `.cursor/` mirror was left stale.
