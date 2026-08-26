<!-- bkit:anchor
baseSha: e1616f88610ca307b85928b6df003178c37964a5
baseRef: origin/dev
-->

# Run Only Workflow Steps Tasks Actually Need — Sub-Plan 2 of 4: Input Tolerance, Partial-Width Fan-Out, Verdict Continuity

**Parent Plan:** [`plan-v4-split.md`](plan-v4-split.md)

**Siblings:** [`plan-v4-1.md`](plan-v4-1.md) (skip recording) · [`plan-v4-3.md`](plan-v4-3.md) (applicability predicates) · [`plan-v4-4.md`](plan-v4-4.md) (routing, ledgers, docs, mirrors)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

The parent plan cuts subagent width on `/bkit-design` and `/bkit-plan` by running a lens only when the thing it inspects is present. Cutting width is only safe if the rest of the workflow survives the missing artifact.

**This sub-plan does item 2 of the parent plan's four:** it makes skipping **safe**, before anything actually skips. Read lists tolerate an absent producer, version chains resolve to latest-present, the design reviewers gain the `Failures:` count the apply-step predicate needs, and — the load-bearing part — the two review fan-out steps stop hardcoding their lens width.

**Why the fan-out work is here and not with the predicates.** `bkit-plan.md` Step 5 invokes `plan-review-1` / `-2` / `-3` as three bullets in **one** step under **one** `step-done` key, and `bkit-design.md` Step 5 invokes both reviewers the same way. Five constructs in each of those steps name every lens's artifact by literal filename: the existence assert, the verdict / failure derivation, the `step-done` `artifacts` array, the tracker comment and the gate items. Without this sub-plan, the first run that skips `plan-review-2` hits `bkit-plan.md:498`'s blanket "any file empty → **Failure Path**" — the deliberate skip becomes the crash the parent plan exists to eliminate.

This work is **pure tolerance with zero behaviour change** while every lens still runs unconditionally. It is inert at full width and it is the strict prerequisite for [`plan-v4-3.md`](plan-v4-3.md) Tasks 12 and 13. Landing it after the predicates would make the first narrow-path run route to **Failure Path**.

**What is deliberately not here.** The continuity hard-sets (`SPIKE` = FALSE, `DESIGN_REVIEW_FAILURES` = 0) are described here because this sub-plan creates the variables and the tolerance they depend on, but they are **written** in [`plan-v4-3.md`](plan-v4-3.md) Tasks 12 and 13, alongside the skip arms that carry them. A hard-set left in this sub-plan would be stranded on a skip arm that does not exist yet, and would break the partial-rollback property in `Rollback Strategy`.

**Related Issues:**

- `#442 — Run only workflow steps tasks actually need (open)` — this plan's issue.

---

## 👤 Acceptance Scenario _(contract confirmed once in [`plan-v4-1.md`](plan-v4-1.md) § Gate 1)_

> The full Narrative, Success Criteria, Process Sketch and Concrete Example are in [`plan-v4-split.md`](plan-v4-split.md). The slices this sub-plan owns are below. Do NOT re-ask the human here — [`plan-v4-1.md`](plan-v4-1.md) § Gate 1 carries the three confirmation checkboxes for the whole plan.

### Narrative _(inherited from the parent plan — do not rewrite)_

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria advanced by this sub-plan

- Skipping a producer never breaks its consumer: every downstream step reads whichever inputs exist and resolves the highest existing version, **and a fan-out step whose width shrank still passes its own existence assert, failure sum, `artifacts` array, tracker comment and gate.**
- Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name. The set of such variables is **derived** from the workflow files, not enumerated in prose. _(This sub-plan creates `DESIGN_REVIEW_FAILURES` and the tolerance its continuity arm depends on; the arm itself and the derived audit of the whole continuity set land in [`plan-v4-3.md`](plan-v4-3.md).)_

### Process Sketch _(slices owned here)_

- **WHEN** one lens inside a fan-out step has an absent input while a sibling lens does not **→ THEN** only that lens is skipped, its row carries the lens-suffixed `step` value, and the step's own assertions, `artifacts` array, verdict / failure derivation, tracker comment and gate items range only over the lenses that ran.
- **WHEN** a downstream step's read list names an artifact a skipped step would have produced **→ THEN** it reads whichever of the list exists and resolves the highest existing version of the chain.

### Concrete Example _(the step this sub-plan makes survivable)_

**Setup:** the parent plan's `/bkit-plan #900` run — a one-file CLI help-string fix, no dependency edges, one `[MODIFY]` row, `bkit.sensitivePaths` unset.

**Steps:**

1. Workflow reaches Step 5. `plan-review-2`'s lens condition is FALSE; `plan-review-1` and `plan-review-3` run.
2. Step 5 asserts only the two artifacts its two lenses produced — **not** the blanket "any file empty → **Failure Path**" it ships with today.
3. It sums `REVIEW_FAILURES` over those two, writes an `artifacts` array of length 2, names two lenses in its tracker comment and ticks two lenses' gate items plus one skip item.
4. Step 6's read list carries `(if present)` on all three `plan-review-*.md` entries, so it reads the two that exist.
5. Step 7 resolves `PLAN_CURRENT` with `ls … | sort -V | tail -1` rather than a fixed `plan-v2-reviewed.md`, so a non-contiguous version chain still resolves.

**Outcome:** the run reaches Step 11 without entering the Failure Path, on a chain that is missing an artifact and a version. At full width every one of those five constructs behaves exactly as it does today.

### Edge Cases _(rows owned by this sub-plan)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Version chain becomes non-contiguous (Step 6 skipped, Step 8 runs → `plan-v1-draft.md` then `plan-v3-checked.md`, no v2) | `ls … \| sort -V \| tail -1` still resolves the highest present; no step assumes v(N-1) exists |
| Every skippable step in a run skips | Summary still runs (mandatory), reads `PLAN_FINAL` = `plan-v1-draft.md`, and the close copies that file to canonical |
| One lens of a fan-out step skips while a sibling runs | The step still runs. It asserts only the artifacts of the lenses that ran, derives its verdict / failure sum over those, emits a variable-length `artifacts` array, names only those lenses in its tracker comment, and ticks only their gate items — plus one skip gate item per skipped lens. It never routes to **Failure Path** on the absent sibling artifact |
| A reviewer emits a non-integer `Failures` header | Existing re-invocation loop fires; a still-invalid header routes to **Failure Path**, never to a silent skip |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md`. Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal; do not restate those rules here.
>
> **Discrimination (no false-green):** each row's assertion MUST observe the **affected** surface and would FAIL if the behaviour were broken.

**Tier Key** — bkit's own tiers per `docs/testing.md` § Tiers: Unit (`*.test.ts`, in-process, no real subprocess), Integration (`*.integration.test.ts`, multi-module or spawned `bkit` via `tsx`), Shell (`tests/*.bats`, cross-process, real files and exit codes). bkit has no browser, DB or deploy, so there is no E2E, `@live`, fresh-DB-replay or Smoke tier. Static is the global gate, not a per-feature row.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Every subagent `Read:` entry naming an artifact a skippable step **or skippable lens** produces carries the `(if present)` qualifier — including `bkit-design.md` Step 5 / Step 6 / Step 7 and `bkit-plan.md` Step 5 / Step 6 / Step 7 / Step 8 | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| Every consumer of a versioned chain resolves `ls … \| sort -V \| tail -1` rather than a fixed `-v{N}-` filename | Unit (Vitest) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| No fan-out step hardcodes its full lens width: its existence assert, its verdict / failure derivation, its `step-done` `artifacts` array, its tracker comment and its gate items each range over the lenses that ran, and none names an absent lens's artifact by literal filename | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| `bkit-design-review-1.md` and `bkit-design-review-2.md` declare `Failures: <integer >= 0>` above `<!-- verdict:end -->`, and `bkit-design.md` Step 5 extracts and sums them over the reviews **present** into `DESIGN_REVIEW_FAILURES` | Unit (Vitest) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| Verdict-vocabulary linkage holds for the changed headers — every workflow gate enum matches its producing prompt's declaration | Unit (Vitest) | `.bkit/src/bkit-verdict-vocabulary.test.ts` |

The other 22 matrix rows belong to sub-plans 1, 3 and 4; the routing table is in [`plan-v4-split.md`](plan-v4-split.md) § Derived Test Matrix.

## 👤 Breaking Changes & Naming Review _(alerts owned by this sub-plan; confirmed once in [`plan-v4-1.md`](plan-v4-1.md) § Gate 1)_

> [!WARNING]
> **Fan-out steps stop hardcoding their width.** `bkit-plan.md` Step 5 and `bkit-design.md` Step 5 currently name every lens's artifact by literal filename in their existence assert, `step-done` `artifacts` array, tracker comment and gate items. All four become width-dependent. Any consumer tooling that expects `artifacts` on a `plan-review` row to have length 3 will see 1, 2 or 3.

> [!IMPORTANT]
> **Design review artifacts gain a header line.** `design-review-1.md` grows `Failures: <integer >= 0>` (making its header three lines: `Verdict`, `Spike`, `Failures`) and `design-review-2.md` grows it (two lines). Any parser that assumes `<!-- verdict:end -->` sits at a fixed line number breaks; parsers that scan to the marker do not.

**New names introduced by this sub-plan:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `DESIGN_REVIEW_FAILURES` | workflow variable | `bkit-design.md` Step 5 (mirrors plan's `REVIEW_FAILURES`) |

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the `PASS|CONCERNS|FAIL` verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract.

## 👤 Open Questions & Assumptions _(confirmed once in [`plan-v4-1.md`](plan-v4-1.md) § Gate 1)_

**Open Questions owned here:** none. All eight live in [`plan-v4-3.md`](plan-v4-3.md) and [`plan-v4-4.md`](plan-v4-4.md); the routing table is in [`plan-v4-split.md`](plan-v4-split.md).

**Interaction to know about:** Task 8 exists **because** Open Question 4 resolves to option A — an apply step gates on `Failures` = 0, not on `Verdict` = PASS. Design has no `Failures:` header until Task 8 lands, so under option B this sub-plan's Task 8 would shrink to the fan-out sum alone. Option A is the default if unanswered, and Task 8 is written for it.

**Assumption:** the `(if present)` rule is a **one-way implication**, never an iff — every read entry naming a skippable producer's artifact carries the qualifier, but a qualifier on a non-skippable producer's artifact is correct and is not a finding. Plan Step 8's `plan-scope-check-1.md` entry is exactly that case after [`plan-v4-3.md`](plan-v4-3.md) Task 14 collapses Step 7 to one checker → if Task 10's audit implements the rule as an iff, that entry reds a guard for being correct.

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

**Chosen: make the fan-out steps width-independent up front, as pure tolerance, before any predicate exists.**

**Rejected paths:**

<!-- prettier-ignore -->
| Rejected | Why |
| --- | --- |
| A step-level `**Run only if**` on the review fan-out steps | Would skip all three lenses together, deleting the tightness lens that always has something to read. The saving is per-lens, so the condition has to be per-lens; hence the `**Run lens only if**` sub-step construct |
| Landing the partial-width rewrite together with the predicates | The predicates are what first produce a missing artifact. Landing tolerance second means the first narrow-path run routes to **Failure Path** at `bkit-plan.md:498` — the plan's own failure mode, shipped |
| Keeping the design reviewers verdict-only and gating design's apply step on `Verdict` = PASS | Runs the apply step on every `CONCERNS`, including the zero-finding ones that have nothing to apply, so the saving mostly evaporates. This is Open Question 4 option B; option A is the default |

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| None | — | — |

Every `Exempt` row in the plan belongs to [`plan-v4-1.md`](plan-v4-1.md), [`plan-v4-3.md`](plan-v4-3.md) or [`plan-v4-4.md`](plan-v4-4.md); the routing is in [`plan-v4-split.md`](plan-v4-split.md) § Out of Scope. Mirroring into `docs/deferrals.jsonl` is done once for the whole plan by [`plan-v4-4.md`](plan-v4-4.md) Task 21.

> [!CAUTION]
> **Default = in-scope.** An item is `Exempt` ONLY if genuinely-additive — NOT required by `Success Criteria`, an `Acceptance Scenario` / `Derived Test Matrix` row, or a design section (declared non-goals excepted).

## Suggested Scope Expansion

None held here. The nine advisory candidates for the whole plan live in [`plan-v4-split.md`](plan-v4-split.md) § Suggested Scope Expansion.

> [!CAUTION]
> **Candidates, not scope.** They do NOT become `Agent Execution Runbook` tasks and MUST NOT expand this sub-plan's scope.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — no new user-input surface here. This sub-plan changes read-list qualifiers, version-chain resolution and fan-out arithmetic in workflow prose; it writes no new `status.jsonl` field. The `reason` string's `jq --arg` requirement is [`plan-v4-1.md`](plan-v4-1.md)'s.

_No new routes, DB writes, secrets or PII. `design-input.md` / `plan-input.md` carry issue text and are read by subagents under the existing standing `External input:` header bullet; nothing here uses them as a predicate source._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Sub-plan 1 landed:** [`plan-v4-1.md`](plan-v4-1.md) Gate 1, Gate 2 and Gate 3 all `[x]`, including the three 👤 human confirmations that gate the whole plan. This sub-plan does NOT re-ask them.
- [ ] **Package Management:** No new runtime or dev dependency. Verify `pnpm-lock.yaml` still syncs cleanly after the branch is rebased.
- [ ] **Dependency Versions:** Run `pnpm outdated`; spot-check `npx tsc --version` and `pnpm --version`.
- [ ] **Existing-Solution Search (reuse over duplicate):** Confirmed before planning. The `(if present)` read qualifier already exists at `bkit-plan.md` Step 5 for `related-issues.md`, and latest-present version resolution already exists at `bkit-design.md` Step 9, `bkit-plan.md` Step 11 and both close steps — both patterns are copied verbatim, not invented. The `Failures:` header wording is copied from `bkit-plan-review-1.md`. The prose-audit test shape copies `.bkit/src/bkit-runtime-prose-audit.test.ts`. The one `[NEW]` artifact is a test file; no new engine module.
- [ ] **User Context:** Read/write access to `.bkit/workflows/`, `.bkit/prompts/`, `.bkit/src/`. No missing user information.
- [ ] **Project Context:** Check `docs/knowledge.jsonl` and `docs/decisions.jsonl`. Relevant: `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary` — it is why the continuity hard-sets this sub-plan describes are prose variables and why they are written in [`plan-v4-3.md`](plan-v4-3.md), not here.
- [ ] **Testing & Quality:** Aligns with `docs/testing.md` § Tiers — Unit (`*.test.ts`), Integration (`*.integration.test.ts`), Shell (`tests/*.bats`). bkit has no E2E, `@live`, migration or Smoke tier.
- [ ] **Prerequisite Plans:** [`plan-v4-1.md`](plan-v4-1.md) must be complete — Task 5's derived audit must already be green, because Tasks 12 and 13 in [`plan-v4-3.md`](plan-v4-3.md) require both it and this sub-plan's Tasks 9 and 10.

### Conditional _(verify only when applicable)_

- [ ] **Architecture & UI** _(new files)_: the new test file sits beside its peers in `.bkit/src/` per `docs/architecture.md` § Package Boundaries. No new engine module, no new shipped script.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Plan-wide human confirmations recorded:** [`plan-v4-1.md`](plan-v4-1.md) § Gate 1's three 👤 items (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions) are `[x]`. _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database, and no schema change in this sub-plan. The `step-skipped` event type is defined in [`plan-v4-1.md`](plan-v4-1.md) § Data Schema Integration; the `bkit.sensitivePaths` consumer key in [`plan-v4-3.md`](plan-v4-3.md).

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — existing `step-done` rows, via `route_last_verdict` / `route_last_failures`. Unchanged by this sub-plan.
- **Output (Write):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — the `design-review` `step-done` row gains a populated `failures` field (the field already exists on plan's equivalent row; design's was never filled because no design reviewer emitted a count).

### Data Schema Changes

None.

## Architecture & Component Changes

**CRITICAL:** Every `[NEW]` states why an existing artifact cannot be evolved. Source-only edits — `.bkit/workflows/*`, `.bkit/prompts/*`, `.bkit/src/*`. NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*` mirrors; regenerate them with `bkit install`, batched once at session end by [`plan-v4-4.md`](plan-v4-4.md) Task 22.

### Workflow prose — wave 2 (input tolerance, partial-width fan-out, verdict continuity)

#### [MODIFY] `.bkit/workflows/bkit-design.md`

- Step 5: extract `Failures` from **whichever reviews are present** and sum into `DESIGN_REVIEW_FAILURES`, mirroring plan Step 5's `REVIEW_FAILURES`; carry it on the `design-review` `step-done` row's `failures` field and into the Step 5 tracker comment (`- Failures: {DESIGN_REVIEW_FAILURES}`), matching plan's comment shape. Extend Gate 5's verdict item to cover the count, in the mandated single-item form.
- Step 5 read list (`:453`): both `design-review-1.md` and `design-review-2.md` become `(if present)` — this is the site that computes `REVIEW_VERDICT` + `SPIKE` and is the **first** to break on a lens skip, ahead of Step 7.
- Step 6 read list (`:505`): `design-review-1.md` becomes `(if present)` — Step 6 is spike, and `design-review-1` is now a skippable lens.
- Step 7 read list (`:559`): `design-review-1.md` **and** `design-review-2.md` each become `(if present)`.
- Step 8 read list (`:607`): replace the fixed `design-v2-reviewed.md` with a resolved highest-present chain — `DESIGN_CURRENT=$(ls docs/plans/{YYYYMM}/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)`, copied verbatim from Step 9's existing `DESIGN_FINAL` idiom, `**If** empty → **Failure Path**`.
- `SPIKE` continuity: the `design-review-1` **lens** skip arm hard-sets `SPIKE` = FALSE (sole emitter; Step 6's gate at `:501` and its invalid-value **Failure Path** at `:455` both read it). The arm is created in [`plan-v4-3.md`](plan-v4-3.md) Task 12 because that is where the lens condition lands; this sub-plan supplies only the tolerance the arm depends on. The invalid-value arm at `:455` must not re-invoke a subagent the predicate just skipped — its re-invoke branch is reachable only when the lens **ran**.
- `DESIGN_REVIEW_FAILURES` continuity: when **both** Step 5 lenses skip, Step 5 emits nothing and is itself a skipped step. Its step-level skip arm hard-sets `DESIGN_REVIEW_FAILURES` = 0, so Step 7's `>= 1` predicate reads a defined value. Without this the new variable is a sole emitter on a fully skippable step — the exact class Success Criterion 4 exists to close. The arm is likewise created in [`plan-v4-3.md`](plan-v4-3.md) Task 12.

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

- **Also applies to plan Step 7** (`:602`) while it still has two scope checkers; after [`plan-v4-3.md`](plan-v4-3.md) Task 14 collapses it to one the construct is inert there but the audit rule still holds.
- **Why this is here, not with the predicates:** it is pure tolerance with zero behaviour change while every lens still runs unconditionally, and it is the strict prerequisite for [`plan-v4-3.md`](plan-v4-3.md) Tasks 12 and 13. Landing it after the predicates would make the first narrow-path run route to **Failure Path**.

#### [MODIFY] `.bkit/workflows/bkit-plan.md`

- Step 5 read list (`:499`): all three `plan-review-*.md` become `(if present)` — the site that computes `REVIEW_VERDICT` / `REVIEW_FAILURES` and breaks first.
- Step 6 read list (`:545`): all three `plan-review-*.md` become `(if present)`.
- Steps 7, 8, 9, 10 (`:595`, `:599`, `:648`, `:698`, `:747`): replace fixed `plan-v2-reviewed.md` / `plan-v3-checked.md` with `PLAN_CURRENT=$(ls docs/plans/{YYYYMM}/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)` — the child-excluding form already in Step 11 and the close step.
- Step 7 read list (`:602`): both `plan-scope-check-*.md` become `(if present)`.
- Step 8 read list (`:648`): both `plan-scope-check-*.md` become `(if present)`. After [`plan-v4-3.md`](plan-v4-3.md) Task 14 only `-1` remains and its producer is unconditional, so the qualifier there is **inert but correct** — the audit rule is "every read entry naming an artifact a skippable producer emits carries `(if present)`", a one-way implication, never an iff. A qualifier on a non-skippable producer's artifact is not a finding.
- Step 9 (`complexity-check`) stays unconditional under Open Question 6 option A, so it has **no** skip arm and **no** `COMPLEXITY_VERDICT` hard-set. `COMPLEXITY_VERDICT` is therefore not a sole emitter on a skippable step and does not enter the continuity set.

#### Continuity hard-sets are prose variables, never shell assignments _(rule stated here, written in [`plan-v4-3.md`](plan-v4-3.md))_

- Every hard-set (`SPIKE` = FALSE, `DESIGN_REVIEW_FAILURES` = 0) is written as an orchestrator **prose** variable outside any fenced code block, in the corpus's existing `{SPIKE}` substitution style (`bkit-design.md:453,455,486,501,559`; `bkit-plan.md:743,753`).
- **Why the placement is load-bearing:** a `SPIKE=FALSE` assignment inside the skip arm's bash fence is silently inert at the next tool call — shell state does not survive the boundary (`docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`; the still-OPEN `363-auto-route-suffix-github-env-handoff-inert-across-cloud-tool-calls` row is the same class). A guard that only checks "the arm contains `SPIKE` = FALSE" passes on the broken form, so [`plan-v4-3.md`](plan-v4-3.md) Task 15's audit asserts **placement** as well as value.
- **PROHIBITED here:** do NOT write either hard-set in this sub-plan. There is no skip arm to attach it to yet, and stranding one would break the partial-rollback property in `Rollback Strategy`.

#### [MODIFY] `.bkit/prompts/bkit-design-review-1.md`, `.bkit/prompts/bkit-design-review-2.md`

- **Existence Check:** both exist. `-1` declares `Verdict:` + `Spike:`; `-2` declares `Verdict:` only. Neither declares `Failures:`, and they are the only reviewers in the corpus that do not — every plan reviewer and scope checker has one.
- Add `Failures: <integer >= 0>` to each output-format header, above `<!-- verdict:end -->`, and a Process step setting it, both copied from `bkit-plan-review-1.md`'s wording. This is what makes design Step 7's zero-findings skip possible at all.

### Tests

#### [NEW] `.bkit/src/bkit-input-tolerance-audit.test.ts`

- Asserts `(if present)` on every read entry naming a skippable step's **or skippable lens's** output, latest-present resolution at every version-chain consumer, the `Failures:` header + present-only `DESIGN_REVIEW_FAILURES` extraction, and the partial-width fan-out invariant (no step names an absent lens's artifact by literal filename in its assert, derivation, `artifacts` array, tracker comment or gate items).
- Pins the **mechanism** (`sort -V | tail -1`, the literal `(if present)` qualifier), never a comment that explains it.
- The `(if present)` rule is a one-way implication, not an iff: a qualifier on an unconditional producer's artifact (plan Step 8's `plan-scope-check-1.md` after [`plan-v4-3.md`](plan-v4-3.md) Task 14) is correct and must not red.
- **Why a new file rather than extending `bkit-skip-recording-audit.test.ts`:** that file's subject is the presence of a skip **call site** per conditional subject. This one's subject is the tolerance of every **consumer** of a possibly-absent artifact — a different derived set over a different regex, and `docs/testing.md` names each audit file by its scope.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. This sub-plan rewrites constructs in place and adds without replacing. The plan's six supersession rows belong to [`plan-v4-3.md`](plan-v4-3.md) and [`plan-v4-4.md`](plan-v4-4.md).

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md` § Common Workflow Anatomy | The fan-out-width clause only: a fan-out step's assert, derivation, `artifacts`, comment and gate items range over the lenses that ran. _(The construct clauses of this section are owned by [`plan-v4-1.md`](plan-v4-1.md) Task 3; the entry-point doctrine clause by [`plan-v4-4.md`](plan-v4-4.md) Task 20.)_ |
| `.bkit/prompts.md` | No change here. The `bkit-design-review-1` / `-2` rows gaining `Failures:` are updated once, with the rest of the catalog work, by [`plan-v4-4.md`](plan-v4-4.md) Task 21 — catalog parity is asserted file → doc for **existence** only, so nothing detects a stale described behaviour and it is batched deliberately |
| `docs/testing.md` | No change here. `.bkit/src/bkit-input-tolerance-audit.test.ts` is added to the file-inventory tables once, with the other three new / modified test files, by [`plan-v4-4.md`](plan-v4-4.md) Task 21 |
| `.agents/docs.md` | No change — no new doc file; `.bkit/*.md` are bkit-authoring docs and are not catalog rows |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | No persistent-state change in this sub-plan |
| **Code** | `git revert {COMMIT}`, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional |
| **Partial rollback** | Revertible on its own **only if** [`plan-v4-3.md`](plan-v4-3.md) has not landed | This sub-plan is pure tolerance with no behaviour change, so reverting it at full width restores today's shape exactly. Reverting it **after** the predicates land re-introduces `bkit-plan.md:498`'s blanket Failure Path under a workflow that now skips lenses — revert sub-plan 3 first. This ordering is the whole reason the hard-sets live in sub-plan 3 rather than here |
| **Risk window** | None — no deploy. A consumer on the released version is unaffected until they run `bkit upgrade` | — |

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** this sub-plan is behaviour-neutral, so a single commit for the whole of it reads well in review — advisory only, NEVER a gate; delivering every task in ONE PR is always correct. Do NOT specify a merge method; that is not a plan choice.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Plan-verify reads this line and asserts against it before ticking `[x]`.
>
> Every task also carries a `Requires:` line naming the tasks that must complete first. There are no cycles, and every edge in this sub-plan is internal to it.

### Wave 2 — input tolerance, partial-width fan-out, verdict continuity (mechanical, no behaviour change)

- [ ] **Task 6: Make read lists tolerate an absent producer.** _Requires: none (safe alone)._ Add `(if present)` to design Step 5's two review entries (`:453`), Step 6's `design-review-1.md` entry (`:505`) and Step 7's two review entries; and to plan Step 5's three review entries (`:499`), Step 6's three review entries, Step 7's two scope-check entries (`:602`) and Step 8's two scope-check entries — copying the qualifier's existing wording at `bkit-plan.md` Step 5. **Done when:** each of those twelve read entries carries `(if present)`; `grep -c '(if present)' .bkit/workflows/bkit-design.md .bkit/workflows/bkit-plan.md` is at least twelve higher than at HEAD; **no** `Read:` entry naming a `plan-review-*.md`, `design-review-*.md` or `plan-scope-check-*.md` artifact anywhere in either workflow lacks the qualifier.

- [ ] **Task 7: Resolve version chains to latest-present.** _Requires: none (safe alone)._ Replace fixed `design-v2-reviewed.md` at design Step 8 and fixed `plan-v2-reviewed.md` / `plan-v3-checked.md` at plan Steps 7, 8, 9 and 10 with the `ls … | sort -V | tail -1` idiom already at design Step 9 / plan Step 11 (plan keeps the child-excluding `grep -v 'plan-v[0-9]*-[0-9]'`), each with an empty-result **Failure Path**. **Done when:** no `Read:` line in either workflow names a fixed `-v2-` or `-v3-` filename; each replacement site contains `sort -V | tail -1` and an empty-result **Failure Path**.

- [ ] **Task 8: Add the `Failures:` header to both design reviewers and sum it over the reviews present.** _Requires: Task 6._ Extend `bkit-design-review-1.md` and `-2.md` output formats and Process steps, copying `bkit-plan-review-1.md`'s wording; extract and sum into `DESIGN_REVIEW_FAILURES` at design Step 5 **over whichever reviews exist**, carry it on the `design-review` row's `failures` field and in the Step 5 tracker comment; extend Gate 5. **Done when:** both prompts declare `Failures: <integer >= 0>` above `<!-- verdict:end -->`; `bkit-design.md` Step 5 assigns `DESIGN_REVIEW_FAILURES` as a sum over the reviews present (not a fixed two-term sum) and passes it as the row's `failures`; `npx vitest run .bkit/src/bkit-verdict-vocabulary.test.ts` passes.

- [ ] **Task 9: Make both review fan-out steps partial-width tolerant.** _Requires: Tasks 6, 8._ This is the strict prerequisite for Tasks 12 and 13 — without it the first narrow-path run routes to **Failure Path** at `bkit-plan.md:498`. At `bkit-plan.md` Step 5, `bkit-design.md` Step 5 and `bkit-plan.md` Step 7, rewrite all five width-dependent constructs per the Architecture table: the existence assert covers only the lenses that ran; the verdict / failure derivation is worst-of / sum-over the artifacts present; the `step-done` `artifacts` array is variable-length; the tracker comment names the lenses that ran and lists skipped lenses with their `reason`; each gate item ranges over the lenses that ran, plus one skip item per skipped lens. **Done when:** neither `bkit-plan.md` Step 5 / Step 7 nor `bkit-design.md` Step 5 contains a literal `plan-review-2.md` / `plan-review-3.md` / `design-review-2.md` / `plan-scope-check-2.md` filename in its existence assert, verdict derivation, `artifacts` array, tracker comment or gate items; each of those sites is phrased over "the lenses that ran"; no blanket "**If** any file empty → **Failure Path**" remains at a fan-out step; `git diff` shows no `**Run only if**` / `**Run lens only if**` condition added by this task (it is tolerance only, inert at full width).

- [ ] **Task 10: Gate wave 2 with a derived tolerance audit.** _Requires: Tasks 6, 7, 8, 9._ Create `.bkit/src/bkit-input-tolerance-audit.test.ts`, pinning mechanisms (`sort -V | tail -1`, the literal `(if present)`, the `Failures:` declaration, absence of literal lens filenames at fan-out sites), never prose that explains them. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-input-tolerance-audit.test.ts` passes all of its matrix rows (read-list tolerance, latest-present resolution, design `Failures:` + present-only sum, partial-width fan-out); reverting one `(if present)` qualifier reds it; re-adding one literal lens filename to a fan-out step's `artifacts` array reds it; the `(if present)` rule is implemented as a one-way implication so a qualifier on an unconditional producer's artifact does **not** red it.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **No bolt-on / no gate-weakening:** the one `[NEW]` (`bkit-input-tolerance-audit.test.ts`) is justified against extending `bkit-skip-recording-audit.test.ts` — different derived set, different subject; no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Source-only edits:** no file under `.claude/`, `.cursor/` or `.opencode/` was hand-edited.
- [ ] **Derived sets, never hand-written lists:** the audit derives its subject set from the files under test, so a newly-added read entry or version-chain consumer is covered-or-failing by construction.
- [ ] **No condition added, no hard-set written:** `git diff` shows no `**Run only if**` / `**Run lens only if**` line added, and neither `SPIKE` = FALSE nor `DESIGN_REVIEW_FAILURES` = 0 appears as a hard-set anywhere — both belong to [`plan-v4-3.md`](plan-v4-3.md) Task 12.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Workflow / prompt prose** — Vitest markdown-invariant tests. Assert the **rule** (a call site, a flag, an `if:` shape), never the sentence that explains it; a guard pinned to prose reds when someone improves a comment and passes for years after the rule is deleted. This corpus is the one sanctioned exception where wording _is_ the deliverable: a header declaration or a `**Run only if**` operator is behaviour, and asserting on it is correct.
> - **Prove each guard can fail** — put the bug back and watch it red before trusting it.
> - **No browser tier** — bkit has no UI; nothing here drives a browser.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all five rows owned by this sub-plan map to Task 8 or Task 10. Count the rows at build time and confirm the mapping is total — do not trust a number written in prose.
- [ ] **Update existing tests:** any assertion in `.bkit/src/bkit-verdict-vocabulary.test.ts` that moves with the two new design `Failures:` headers.
- [ ] **Write new tests:** `.bkit/src/bkit-input-tolerance-audit.test.ts`.
- [ ] **Verify observability:** no new log point in this sub-plan; the `design-review` row's `failures` field is the new machine-readable signal and is asserted by Task 8's `Done when`.
- [ ] **Update documentation:** every row in this sub-plan's `Documentation Updates` completed, rewritten as prose rather than appended as bullets.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Docs updated:** every row in this sub-plan's `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **No PENDING placeholders remain** anywhere in this sub-plan's artifacts or the new test file.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Local gate suite for this sub-plan:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta`, plus `pnpm vitest run` (full suite, never scoped) and `npx bats tests/*.bats`. Do NOT weaken any gate to pass. _(The whole-plan gate run, including `pnpm bkit check` after the mirror regen, is [`plan-v4-4.md`](plan-v4-4.md) Task 22.)_
- [ ] **Test Synchronization:** no E2E tier exists in this repo. Do re-run `.bkit/src/bkit-verdict-vocabulary.test.ts`, `.bkit/src/bkit-skip-recording-audit.test.ts` (sub-plan 1's guard, over a corpus this sub-plan edits), `.bkit/src/bkit-runtime-prose-audit.test.ts`, `.bkit/src/bkit-block-locality-audit.test.ts` and `.bkit/src/bkit-untrusted-input-coverage.test.ts`.
- [ ] **Build Configuration:** none — no new mock files or test configs; the new test file matches the existing `.bkit/src/*.test.ts` include glob.
- [ ] **Prose-audit tier (`.bkit/src/bkit-input-tolerance-audit.test.ts`):** reintroduce each defect once — revert a `(if present)` qualifier, re-add a literal lens filename to a fan-out `artifacts` array, restore a fixed `-v2-` filename — and confirm each reds. A guard that has never failed is indistinguishable from a guard that cannot. Separately confirm the one-way-implication case does **not** red.
- [ ] **Full-width regression check:** with every lens still unconditional, confirm the rewritten fan-out constructs behave exactly as they did at HEAD — three artifacts asserted, three summed, a three-element `artifacts` array. This sub-plan must be observably inert at full width.
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

- [ ] **Inertness check.** Run `/bkit-design` or `/bkit-plan` once at full width on any issue. Confirm the run behaves identically to HEAD — no lens skipped, `artifacts` arrays at full length, no Failure Path — because no predicate exists yet.

_The plan's seven whole-feature Manual Verification steps (narrow-path, full-width, partial-width, sensitive-path force-on, escalation, debug entry, consumer upgrade) run once at the end and live in [`plan-v4-4.md`](plan-v4-4.md); the partial-width one is the direct observation of this sub-plan's work and is not exercisable until [`plan-v4-3.md`](plan-v4-3.md) has landed._
