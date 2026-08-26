<!-- bkit:anchor
baseSha: e1616f88610ca307b85928b6df003178c37964a5
baseRef: origin/dev
-->

Verdict: PASS
<!-- verdict:end -->

# Run Only Workflow Steps Tasks Actually Need Implementation Plan — Master Index

> [!IMPORTANT]
> **This is a split master.** It carries no `Agent Execution Runbook`, no tasks, no constraints and no gates. Every executable task, constraint and gate lives in exactly one sub-plan below. Read this file for context, the human contract and the routing; execute from the sub-plans in index order.

## Sub-Plan Index

Execute in order. Each sub-plan is self-contained and names its own `Requires:` edges; no edge points backwards across a sub-plan boundary.

<!-- prettier-ignore -->
| # | Sub-plan | Wave | Tasks | Scope |
| --- | --- | --- | --- | --- |
| 1 | [`plan-v4-1.md`](plan-v4-1.md) | 1 | 1–5 | Step-skipped row recording — the `route_append_step_skipped` emitter, its bats + reducer coverage, the row-type documentation, the 28-step skip-arm retrofit, and the derived presence audit |
| 2 | [`plan-v4-2.md`](plan-v4-2.md) | 2 | 6–10 | Input tolerance, partial-width fan-out, verdict continuity — `(if present)` read lists, latest-present version chains, the design `Failures:` header, width-independent fan-out steps, and the derived tolerance audit |
| 3 | [`plan-v4-3.md`](plan-v4-3.md) | 3 | 11–15 | Applicability predicates — the two design signal sections, the design and plan `**Run lens only if**` / `**Run only if**` predicates with their continuity hard-sets, the `bkit-plan-scope-check-2` deletion, and the derived applicability audit |
| 4 | [`plan-v4-4.md`](plan-v4-4.md) | 4 + 5 | 16–22 | Routing, ledgers, docs, mirrors, final gate suite — the escalation artifact and plan Step 3.5, the debug `NO-REPRO` entry rule, the routing audit rows, the entry-point doctrine and config-key docs, the ledger verification, and the install integration suite plus the whole local gate run |

**Cross-sub-plan dependency edges** (all forward-pointing):

- Sub-plan 3 Task 12 requires sub-plan 1 Task 5 and sub-plan 2 Tasks 9, 10.
- Sub-plan 3 Task 13 requires sub-plan 1 Task 5 and sub-plan 2 Tasks 9, 10.
- Sub-plan 3 Task 14 requires sub-plan 2 Task 9.
- Sub-plan 4 Task 20 requires sub-plan 3 Tasks 12, 13.
- Sub-plan 4 Task 21 requires sub-plan 2 Task 8 and sub-plan 3 Tasks 11, 14.
- Sub-plan 4 Task 22 requires every prior task in every sub-plan.

**Where the human contract lives.** The three 👤 confirmation checkboxes (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions) sit in [`plan-v4-1.md`](plan-v4-1.md) § Gate 1 — the first sub-plan executed — so they are confirmed exactly once. Sub-plans 2, 3 and 4 carry a Gate 1 item asserting sub-plan 1's Gate 1 passed. The content those checkboxes confirm is reproduced below as this master's context, and each sub-plan repeats the slice it owns.

---

## Context & Goals

Every feature pays the same subagent bill regardless of size. `/bkit-design` fires 10 subagent invocations at full width and `/bkit-plan` fires 11; on a small, well-scoped change most of those lenses read an artifact that contains zero instances of what they iterate over, return `PASS` having looked at nothing, and cost a full model turn anyway.

The cost that matters is not tokens. The pipeline is heavy enough that people route around it, and work done outside bkit leaves no artifacts, no ledger rows and no gates. That is the debt.

The five phases are already independently invocable — `bkit-auto.md` reads `{PHASE}` as a literal argument and never checks that design ran before plan; `bkit-plan.md:266` treats an empty `PARENT_FID` as expected input, not a workaround; `/bkit-debug` takes an FID and mints its own worktree. So there is no chain to unlock. What is missing is that **nothing chooses the entry point and nothing records the choice**.

This plan does four things, in the order the issue fixes them:

1. Makes a skipped step **visible** — a `step-skipped` status row, retrofitted to all 28 steps that are already conditional, so a deliberate skip stops being indistinguishable from a crash. _(Sub-plan 1.)_
2. Makes skipping **safe** — read lists tolerate an absent producer, version chains resolve to latest-present, and every sole-emitter variable gets a defined value when its emitter does not run. _(Sub-plan 2.)_
3. Adds **applicability predicates** to `bkit-design` and `bkit-plan` only, so a lens runs when the thing it inspects is present. Not when a size dial says so. _(Sub-plan 3.)_
4. Adds a **plan → design escalation verdict** and closes the **debug entry gap** (a bug with no failing test belongs in plan, not debug). _(Sub-plan 4.)_

**Skip granularity is two-level, and the difference is load-bearing.** Most of the 28 existing conditional steps are whole-step skips. But wave 3's savings live _inside_ fan-out steps: `bkit-plan.md` Step 5 invokes `plan-review-1` / `-2` / `-3` as three bullets in **one** step under **one** `step-done` key (`plan-review`), and `bkit-design.md` Step 5 invokes both reviewers the same way. Wave 1's machinery (`**Run only if**` at step-header position, one `step-skipped` row keyed on the step slug, one gate item) cannot express a lens-level skip, and a step-level condition would drop the whole fan-out. So this plan defines a second, explicit construct:

- `**Run lens only if**` — a sub-step condition line attached to the individual subagent bullet, distinct from the step-header `**Run only if**` / `**Skip if**`, and separately greppable (`^\s*-?\s*\*\*Run lens only if\*\*`).
- A **lens-suffixed `step` value** on the row (`plan-review-2`, `design-review-1`), so a lens skip is distinguishable from the step skip that would carry the bare slug.
- **Partial-width tolerance** in the fan-out step itself — the existence assert, the verdict / failure derivation, the `artifacts` array, the tracker comment and the gate items all range over the lenses that actually ran, never a hardcoded three (sub-plan 2, Task 9).
- **Derived audits that see both** — Tasks 5 and 15 build their subject sets from _both_ regexes, so a lens condition cannot be invisible to the guard meant to prove it recorded its skip.

Without all four, a run that skips `plan-review-2` hits `bkit-plan.md:498`'s blanket "any file empty → **Failure Path**" — i.e. the deliberate skip becomes the crash this plan exists to eliminate.

Two invariants are load-bearing and do not move. `bkit-build.md:206` (`**If** existing docs/plans/{YYYYMM}/{FID}-plan.md → reuse FID. **Else** → **Failure Path**.`) stays exactly as it is — plan is the floor for all feature work, so nothing can downgrade below it. And a sensitive-path override may only _force_ a lens on, never drop one.

`bkit-build`, `bkit-debug` and `bkit-ship` get **no step changes**. Their conditional steps gain skip logging (item 1) and nothing else. Build is already half-conditional and the remainder is load-bearing: `challenge-1` and `challenge-2` carry different dimensions (bugs / security), so dropping `-2` deletes security coverage outright, and `challenge-reconcile` always has two reports to merge as a consequence.

**Related Issues:**

- `#442 — Run only workflow steps tasks actually need (open)` — this plan's issue.

**Split record.** The pre-split plan assumed its own runbook would exceed the published `SINGLE` ceiling (`tasks <= 12`) and named Task 4 as the natural seam if it split. The realised split is wave-boundary aligned rather than one-child-per-workflow-file: Task 4's 28 skip arms stay whole inside sub-plan 1 because Task 5's derived audit gates all five workflow files as one subject set, and splitting Task 4 by file would leave four of five partitions ungated until the last landed. The wave boundaries are the plan's own `Requires:` edges, so the four-way partition introduces no new ordering constraint.

---

## 👤 Acceptance Scenario _(contract — confirmation checkbox lives in `plan-v4-1.md` § Gate 1)_

### Narrative

⚠️ No `{FID}-design.md` exists for this FID — this is a standalone plan. Narrative and Success Criteria below are derived from the issue's agreed-approach comment, which is a complete statement of intent, and are the human's to confirm here rather than inherit.

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria

- A skipped step **or a skipped lens inside a fan-out step** writes a `step-skipped` row naming the step (lens-suffixed when a lens), the absent input, and who decided — never nothing, never a `step-done`. _(Sub-plans 1 + 3.)_
- A plan whose runbook declares no dependency edges and whose `Architecture & Component Changes` carries no `[MODIFY]` / `[DELETE]` row completes on **five** 🧠 invocations (generate, `plan-review-1`, `scope-check-1`, `complexity-check`, summary). A plan that modifies a consumed surface but declares no dependency edges costs **six** (adds `plan-review-3`). A plan with dependency edges and modified surfaces still runs all of them. `complexity-check` is unconditional under Open Question 6 option A and is counted in every figure above. _(Sub-plan 3.)_
- Skipping a producer never breaks its consumer: every downstream step reads whichever inputs exist and resolves the highest existing version, **and a fan-out step whose width shrank still passes its own existence assert, failure sum, `artifacts` array, tracker comment and gate.** _(Sub-plan 2.)_
- Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name. The set of such variables is **derived** from the workflow files, not enumerated in prose. _(Sub-plans 2 + 3.)_
- A plan resting on open decisions with real alternatives stops before the Step 5 fan-out and hands to design; a bug with no failing test is routed to plan rather than closing debug green. _(Sub-plan 4.)_

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

### Edge Cases — routing to sub-plans

The 16 rows of the pre-split `Edge Cases` table are distributed as follows; each row appears verbatim in exactly one sub-plan.

<!-- prettier-ignore -->
| Sub-plan | Rows it owns |
| --- | --- |
| [`plan-v4-1.md`](plan-v4-1.md) | union-merge duplicate skip rows; two lenses skipping in the same wall-clock second; attempt counters near a skipped step |
| [`plan-v4-2.md`](plan-v4-2.md) | non-contiguous version chain; every skippable step skips; one lens skips while a sibling runs; reviewer emits a non-integer `Failures` |
| [`plan-v4-3.md`](plan-v4-3.md) | `design-review-1` lens skipped (sole emitter of `SPIKE`); both design Step 5 lenses skipped; `plan-complexity-check` skipped; apply step skipped on `Failures: 0` with `CONCERNS`; no sensitive-path globs set; glob matches with predicate FALSE; glob matches with predicate TRUE |
| [`plan-v4-4.md`](plan-v4-4.md) | escalation fires on a re-run of an already-escalated plan; debug entered on a green tree at attempt 1 |

### Derived Test Matrix — routing to sub-plans

27 rows total, each verbatim in exactly one sub-plan: 8 in sub-plan 1, 5 in sub-plan 2, 8 in sub-plan 3, 6 in sub-plan 4.

<!-- prettier-ignore -->
| Sub-plan | Rows | Owning task |
| --- | --- | --- |
| [`plan-v4-1.md`](plan-v4-1.md) | emitter row shape; emitter enum / empty-field refusal; `parseStatus` fold no-op; shell `BKIT_STATUS_FOLD` no-op; `counter_count` unchanged; derived skip-recording presence audit; lens-suffixed `step` literal; `reason` names an absent input | 2, 5 |
| [`plan-v4-2.md`](plan-v4-2.md) | `(if present)` on every skippable producer's read entry; `sort -V \| tail -1` at every version-chain consumer; no fan-out step hardcodes its width; design reviewers declare `Failures:` and Step 5 sums over reviews present; verdict-vocabulary linkage | 8, 10 |
| [`plan-v4-3.md`](plan-v4-3.md) | `decidedBy` closed enum with no dead arm; derived sole-emitter continuity set; hard-sets outside any fence; predicate-artifact linkage incl. heading literals; `sensitivePaths` promoting-OR only; absent `sensitivePaths` resolves to `[]`; tabulated plan-side predicate set; `scope-check-2` absent from the live surface | 15 |
| [`plan-v4-4.md`](plan-v4-4.md) | plan Step 3 asserts both artifacts; Step 3.5 `PLAN_ESCALATE` enum and terminal TRUE route; debug `NO-REPRO` route; `.bkit/prompts.md` catalog parity after deletion and additions; scratch consumer from built `dist/`; seeded upgrade-prune consumer | 19, 21, 22 |

---

## 👤 Breaking Changes & Naming Review _(contract — confirmation checkbox lives in `plan-v4-1.md` § Gate 1)_

Each alert and each `New names` row appears verbatim in exactly one sub-plan.

<!-- prettier-ignore -->
| Breaking change / new name | Sub-plan |
| --- | --- |
| `step-skipped` is a new `status.jsonl` row type, deliberately not folded | [`plan-v4-1.md`](plan-v4-1.md) |
| A `step-skipped` row's `step` may be lens-suffixed | [`plan-v4-1.md`](plan-v4-1.md) |
| `route_append_step_skipped` · `step-skipped` type · `caller-flag` / `upstream-verdict` / `applicability` enum · `**Run lens only if**` marker | [`plan-v4-1.md`](plan-v4-1.md) |
| Fan-out steps stop hardcoding their width | [`plan-v4-2.md`](plan-v4-2.md) |
| Design review artifacts gain a `Failures:` header line · `DESIGN_REVIEW_FAILURES` | [`plan-v4-2.md`](plan-v4-2.md) |
| `bkit-plan-scope-check-2` is deleted (Open Question 8) | [`plan-v4-3.md`](plan-v4-3.md) |
| `design-v1-draft.md` gains machine-read structure (`## Required Capabilities`, `## Runtime Surface Change`) | [`plan-v4-3.md`](plan-v4-3.md) |
| `bkit.sensitivePaths` is this plan's one net-new consumer surface | [`plan-v4-3.md`](plan-v4-3.md) |
| `PLAN_ESCALATE` · `plan-escalate` / `design-escalated` step keys · `NO-REPRO` debug outcome label | [`plan-v4-4.md`](plan-v4-4.md) |

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the `PASS|CONCERNS|FAIL` verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract.

---

## 👤 Open Questions & Assumptions _(contract — confirmation checkbox lives in `plan-v4-1.md` § Gate 1)_

Each question and each assumption appears in full, with its options / recommendation / default, in exactly one sub-plan.

<!-- prettier-ignore -->
| Question / assumption | Sub-plan |
| --- | --- |
| Assumption: `step-skipped` stays out of the fold | [`plan-v4-1.md`](plan-v4-1.md) |
| Verified finding: `.bkit/scripts/*` ship via the core template walk | [`plan-v4-1.md`](plan-v4-1.md) |
| Assumption: build, debug and ship keep every step they have today | [`plan-v4-1.md`](plan-v4-1.md) |
| Open Question 1 — who computes each predicate | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 2 — the design-side signal is self-assessed | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 3 — design Step 3 `ideate-2` / `-3` have no upstream artifact | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 4 — is `Verdict: PASS` alone enough to skip an apply step | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 6 — what plan size makes `SPLIT` unreachable | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 7 — where the sensitive-path globs live | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 8 — should `bkit-plan-scope-check-2` still be deleted | [`plan-v4-3.md`](plan-v4-3.md) |
| Assumption: `COMPLEXITY_VERDICT` continuity value is `SINGLE` | [`plan-v4-3.md`](plan-v4-3.md) |
| Assumption: design Step 8's predicate is `MILESTONE` alone | [`plan-v4-3.md`](plan-v4-3.md) |
| Assumption: a fan-out step whose lenses all skip is itself a skipped step | [`plan-v4-3.md`](plan-v4-3.md) |
| Open Question 5 — where the escalation verdict comes from | [`plan-v4-4.md`](plan-v4-4.md) |
| Assumption: `.bkit/workflows.md:23` counts numbered steps | [`plan-v4-4.md`](plan-v4-4.md) |
| Assumption (template divergence, deliberate): standalone plan authors Narrative and Success Criteria | [`plan-v4-4.md`](plan-v4-4.md) |

The pre-split assumption "the plan's own runbook exceeds the published `SINGLE` ceiling, and Task 4 is the natural seam if it splits" is **resolved by this split** and carries into no sub-plan; see § Context & Goals → Split record for what was actually done and why the seam moved to the wave boundaries.

---

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change.

**Chosen: input-presence predicates, logged, applied to design and plan only, in four dependency-ordered waves.**

A step runs when the thing it inspects is present. That is machine-checkable, it is auditable after the fact via the `step-skipped` row, and it never deletes a dimension — a lens that is skipped had nothing to read, by construction. The four waves are ordered so that each is safe on its own: waves 1 and 2 are pure logging and pure tolerance with zero behaviour change, and only wave 3 changes what runs.

The 13 `Rejected` rows are distributed to the sub-plan whose work each one bounds: fold-related and emitter-related rejections to [`plan-v4-1.md`](plan-v4-1.md); the step-level-condition-on-a-fan-out rejection to [`plan-v4-2.md`](plan-v4-2.md); the scale-dial, build-width, `path-override` and force-on-row rejections to [`plan-v4-3.md`](plan-v4-3.md); the escalation-gate, `→ build` route and `build-plan-current` rejections to [`plan-v4-4.md`](plan-v4-4.md).

**Future-phase recommendations (not this plan):** once `step-skipped` rows exist across all five workflows, the ship status-hole detector can read skips from the log instead of inferring them from absence (`classifyRun` currently infers `MERGED_ON_ENTRY` from two missing rows). That is the single strongest argument for promoting it from advisory to gate — tracked as an existing deferral, listed under `Suggested Scope Expansion`.

## Out of Scope

The nine `Exempt` rows are distributed: the two status-hole-detector rows to [`plan-v4-1.md`](plan-v4-1.md); the `bkit-build` / `bkit-debug` / `bkit-ship` width rows, the rejected-machinery row, the design Step 3 `ideate` row and the `complexity-check` predicate row to [`plan-v4-3.md`](plan-v4-3.md); the `docs/plans/template.md` amendment row to [`plan-v4-4.md`](plan-v4-4.md). Each appears verbatim in exactly one sub-plan and is mirrored in `docs/deferrals.jsonl` by sub-plan 4 Task 21.

> `.bkit/workflows/bkit-auto.md` is not an `Exempt` row and takes no deferral: there is no work to defer. Its CI mode is failure-driven by construction and never receives a human-reported bug, so the debug entry rule cannot fire there and the file needs no change. Stated in [`plan-v4-4.md`](plan-v4-4.md) § Architecture so no builder invents a diff for it.

## Suggested Scope Expansion

Advisory candidates only — they are never runbook tasks and MUST NOT expand any sub-plan's scope. Held here in the master, unpartitioned, so no sub-plan can mistake one for work.

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

## Security & Privacy _(shared reference — each sub-plan verifies the rows its own work touches)_

- The `reason` string on a `step-skipped` row is written into `status.jsonl`, which is committed and merged to `dev`. Every predicate reads only first-party artifacts the workflow itself produced (`plan-v*.md`, `design-v*.md`, `{LABELS}`, `package.json`), so no tracker or web content reaches the row. The helper must still pass `reason` through `jq --arg` rather than string interpolation, so a reason containing a quote or backslash cannot emit an unparseable line — one bad row makes the whole run's status file unreadable to every `jq -s` consumer, not just that entry.
- No new secret or env var. `bkit.sensitivePaths` is a glob list in `package.json`, not a credential; it names paths whose plans warrant extra review, and it is consumer-authored.
- No new routes, DB writes, or PII. The only untrusted-input surface (`design-input.md` / `plan-input.md`, which carry issue text) is read by subagents under the existing standing `External input:` header bullet and is never used as a predicate source.

## Data Schema Integration _(shared reference)_

No database. bkit's persistent state is `status.jsonl` (per-FID workflow event log) and the JSONL ledgers; the schema work here is to the event log. The full `step-skipped` schema definition, the not-folded rule and the dedup-collapse note live in [`plan-v4-1.md`](plan-v4-1.md) § Data Schema Integration, which is where Tasks 1 and 3 implement and document them. The `bkit.sensitivePaths` key definition lives in [`plan-v4-3.md`](plan-v4-3.md).

## Architecture & Component Changes _(routing only — the per-wave detail lives in the sub-plans)_

<!-- prettier-ignore -->
| Architecture section | Sub-plan |
| --- | --- |
| Shell primitives — `[MODIFY] .bkit/templates/.bkit/scripts/bkit-status-route.sh`, `[MODIFY] .bkit/src/bkit-status.ts` | [`plan-v4-1.md`](plan-v4-1.md) |
| Workflow prose — wave 1 (skip recording) across all five workflow files | [`plan-v4-1.md`](plan-v4-1.md) |
| Workflow prose — wave 2 (input tolerance, partial-width fan-out, verdict continuity); `[MODIFY]` design reviewer prompts | [`plan-v4-2.md`](plan-v4-2.md) |
| Workflow prose — wave 3 (applicability predicates); `[MODIFY] bkit-design-generate.md`; `[DELETE] bkit-plan-scope-check-2.md` with its full caller inventory | [`plan-v4-3.md`](plan-v4-3.md) |
| Workflow prose — wave 4 (routing); `[MODIFY] bkit-plan-generate.md`; plan Step 3 / Step 3.5; debug Step 3 entry rule | [`plan-v4-4.md`](plan-v4-4.md) |
| Tests — `[NEW] tests/step-skipped-row.bats`, `[NEW] bkit-skip-recording-audit.test.ts`, `[MODIFY] bkit-status.test.ts`, `[MODIFY] tests/counter-derive.bats` | [`plan-v4-1.md`](plan-v4-1.md) |
| Tests — `[NEW] bkit-input-tolerance-audit.test.ts` | [`plan-v4-2.md`](plan-v4-2.md) |
| Tests — `[NEW] bkit-applicability-audit.test.ts` | [`plan-v4-3.md`](plan-v4-3.md) |
| Tests — `[MODIFY] bkit-install.integration.test.ts` | [`plan-v4-4.md`](plan-v4-4.md) |
| Cron jobs & scheduled tasks | None — stated in every sub-plan |

## Supersession Inventory _(routing only)_

All six rows carry into [`plan-v4-3.md`](plan-v4-3.md) except the `.bkit/workflows.md:23` step-count `MODIFY` row, which carries into [`plan-v4-4.md`](plan-v4-4.md) alongside Task 17 that invalidates it.

## Documentation Updates _(routing only)_

<!-- prettier-ignore -->
| Doc row | Sub-plan |
| --- | --- |
| `.bkit/workflows.md` § Event types | [`plan-v4-1.md`](plan-v4-1.md) |
| `.bkit/workflows.md` § Common Workflow Anatomy — construct clauses | [`plan-v4-1.md`](plan-v4-1.md) |
| `.bkit/workflows.md` § Common Workflow Anatomy — entry-point doctrine clause | [`plan-v4-4.md`](plan-v4-4.md) |
| `.bkit/workflows.md` § Rationale — not-folded + dedup-collapse bullets | [`plan-v4-1.md`](plan-v4-1.md) |
| `.bkit/workflows.md` § Rationale — the four remaining bullets | [`plan-v4-4.md`](plan-v4-4.md) |
| `.bkit/workflows.md:511,540,654,829` · `.bkit/comparison.md` | [`plan-v4-3.md`](plan-v4-3.md) |
| `.bkit/workflows.md:23` | [`plan-v4-4.md`](plan-v4-4.md) |
| `.bkit/prompts.md` (deletions) | [`plan-v4-3.md`](plan-v4-3.md) |
| `.bkit/prompts.md` (four content updates) · `docs/testing.md` · `docs/decisions.jsonl` · `docs/deferrals.jsonl` · `docs/knowledge.jsonl` · `README.md` | [`plan-v4-4.md`](plan-v4-4.md) |
| `.agents/docs.md` — no change; no new doc file, and `.bkit/*.md` are bkit-authoring docs, not catalog rows | master (no task) |

## Rollback Strategy _(shared reference — each sub-plan repeats the slice it can roll back)_

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | The only persistent-state change is an additive `status.jsonl` row type; existing logs stay readable because the fold already ignores unrecognised types |
| **Code** | `git revert {COMMIT}` on the squash-merge commit, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional |
| **Partial rollback** | Revert sub-plans 3 and 4 independently of sub-plans 1 and 2 | Holds **only because** every continuity hard-set lives in sub-plan 3 alongside the skip arm that carries it. Sub-plans 1 and 2 are pure logging and pure tolerance with no behaviour change: reverting only the predicates restores full width while keeping the skip log, the tolerant read lists and the partial-width fan-out shape (inert at full width, harmless). A hard-set left in sub-plan 2 would strand it on a skip arm that no longer exists — which is why Task 12 and Task 13, not Task 9, own them. Sub-plans 3 and 4 have no such split — the escalation route and the debug `NO-REPRO` route stand alone |
| **Risk window** | None — no deploy. A consumer on the released version is unaffected until they run `bkit upgrade` | A consumer who upgrades mid-run of a workflow could hit a workflow file whose step numbering changed (plan gains Step 3.5). The per-FID `.lock` and the resume-by-fold contract make that a resume-at-the-wrong-step risk, not corruption |

_A per-workflow rollback primitive does not exist; this is the reason the deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` is open. Whole-commit revert plus mirror regen is the current path._
