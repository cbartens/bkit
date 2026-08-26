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

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after four subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria

- A skipped step writes a `step-skipped` row naming the step, the absent input, and who decided — never nothing, never a `step-done`.
- A genuinely small single-task plan completes on four 🧠 invocations (generate, `plan-review-1`, `scope-check-1`, summary); a plan with dependency edges and modified surfaces still runs all of them.
- Skipping a producer never breaks its consumer: every downstream step reads whichever inputs exist and resolves the highest existing version.
- Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name.
- A plan resting on open decisions with real alternatives stops before the Step 5 fan-out and hands to design; a bug with no failing test is routed to plan rather than closing debug green.

### Process Sketch

- **WHEN** a lens step's input is absent **→ THEN** the step does not run and a `step-skipped` row records the step, the reason and the decider.
- **WHEN** a skipped step was the sole emitter of a variable **→ THEN** the workflow hard-sets that variable to a defined enum member before the gate that reads it.
- **WHEN** a downstream step's read list names an artifact a skipped step would have produced **→ THEN** it reads whichever of the list exists and resolves the highest existing version of the chain.
- **WHEN** the generated plan rests on open decisions with real alternatives **→ THEN** plan stops before the review fan-out and hands to design, costing one wasted generate run.
- **IF** debug is entered on a bug with no failing test **→ THEN** the run records `NO-REPRO` and names `/bkit-plan` as the next action instead of reporting a clean pass.
- **IF** a consumer sensitive-path glob matches a planned target **→ THEN** the matching lens is forced on regardless of its own predicate; a glob never drops a lens.

### Concrete Example

**Setup:** A maintainer of a repo with bkit installed opens an issue for a one-file copy fix: change a CLI help string. No new dependency, no runtime surface, no schema, no dependency edges between tasks. They run `/bkit-plan #900`.

**Steps:**

1. Maintainer runs `/bkit-plan #900` → workflow mints `feat/900-cli-help-copy`, writes `plan-input.md`, invokes `@bkit-plan-generate`.
2. Generate writes `plan-v1-draft.md` with a single runbook task and no `Requires:` / `Blocked by:` / `After:` line, and `Architecture & Component Changes` carrying one `[MODIFY]` row → the orchestrator's escalation check reads `PLAN_ESCALATE` = FALSE and proceeds.
3. Workflow reaches Step 5 → counts zero declared dependency edges in the draft → invokes `@bkit-plan-review-1` only; appends two `step-skipped` rows for `plan-review-2` (`"zero declared dependency edges"`) and, because the plan's only `[MODIFY]` row is matched by no sensitive-path glob and the change touches no exported symbol, for `plan-review-3`.
4. `plan-review-1` returns `Verdict: PASS`, `Failures: 0` → Step 6 does not run; a `step-skipped` row records `"zero review findings"`, `decidedBy: upstream-verdict`.
5. Step 7 invokes `@bkit-plan-scope-check-1` (there is no `-2` any more). It returns `Failures: 0` → Step 8 skipped and recorded. Step 9 runs, returns `SINGLE`, Step 10 skipped and recorded. Step 11 summary reads `PLAN_FINAL` = `plan-v1-draft.md` — the highest version that exists.
6. Workflow closes; `docs/plans/202608/900-cli-help-copy-plan.md` is the canonical plan.

**Outcome:** Four 🧠 invocations instead of eleven. `status.jsonl` carries seven `step-skipped` rows, each naming the absent input, so the run is auditable: no lens was dropped that had anything to read, and the log proves which ones were and why.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Version chain becomes non-contiguous (Step 6 skipped, Step 8 runs → `plan-v1-draft.md` then `plan-v3-checked.md`, no v2) | `ls … \| sort -V \| tail -1` still resolves the highest present; no step assumes v(N-1) exists |
| Every skippable step in a run skips | Summary still runs (mandatory), reads `PLAN_FINAL` = `plan-v1-draft.md`, and the close copies that file to canonical |
| `design-review-1` skipped — sole emitter of `SPIKE` | Skip arm hard-sets `SPIKE` = FALSE before Step 6's gate reads it; self-consistent, since no new capability is also nothing to spike |
| `plan-complexity-check` skipped — sole emitter of `COMPLEXITY_VERDICT` | Skip arm hard-sets `COMPLEXITY_VERDICT` = `SINGLE` (the shipped enum member; the issue's `NOSPLIT` is not a value this workflow accepts) |
| An apply step is skipped on `Failures: 0` but the reviewer returned `CONCERNS` | `CONCERNS` with `failures = 0` is legal under the status invariants; the apply step still skips — the count, not the verdict, is the input |
| A reviewer emits a non-integer `Failures` header | Existing re-invocation loop fires; a still-invalid header routes to **Failure Path**, never to a silent skip |
| Two workflow runs append `step-skipped` rows for the same step under `merge=union` | Rows duplicate harmlessly — the type is not folded, so no reducer double-counts it; readers filter on `type` |
| Attempt counters near a skipped step | `counter_count` reads the folded run's `steps` array, which only `step-done` populates, so a skip cannot inflate an attempt |
| Escalation fires on a re-run of a plan that already escalated once | The escalation close is idempotent — it records the verdict and stops; it never creates a second design |
| Debug entered on a green tree at attempt 1 | Records `NO-REPRO` and names `/bkit-plan`; does not report a clean debug pass |
| Consumer sets no sensitive-path globs (the default) | Empty list matches nothing; every predicate falls through to its own base condition — no lens is forced, and none is dropped by the absence |
| A sensitive-path glob matches but the lens's own predicate is FALSE | Lens runs. Globs force on only; they never reduce width |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md`. Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal; do not restate those rules here.
>
> **Discrimination (no false-green):** each row's assertion MUST observe the **affected** surface and would FAIL if the behaviour were broken.

**Tier Key** — bkit's own tiers per `docs/testing.md` § Tiers: Unit (`*.test.ts`, in-process, no real subprocess), Integration (`*.integration.test.ts`, multi-module or spawned `bkit` via `tsx`), Shell (`tests/*.bats`, cross-process, real files and exit codes). bkit has no browser, DB or deploy, so there is no E2E, `@live`, fresh-DB-replay or Smoke tier. Static is the global gate, not a per-feature row.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `route_append_step_skipped` appends one row carrying `type`/`workflow`/`step`/`reason`/`decidedBy`/`at`/`parentSha`, and the appended line parses as JSON | Shell (bats, real `status.jsonl`) | `tests/step-skipped-row.bats` |
| `route_append_step_skipped` refuses a `decidedBy` outside `caller-flag\|upstream-verdict\|applicability\|path-override`, an empty `step` and an empty `reason` — exit 2, nothing on stdout, file byte-unchanged | Shell (bats, exit codes) | `tests/step-skipped-row.bats` |
| `fold` over a log containing `step-skipped` rows returns a run array byte-identical to the same log with those rows removed | Unit (Vitest) | `.bkit/src/bkit-status.test.ts` |
| `counter_count` for a step key is unchanged by a `step-skipped` row carrying that same key | Shell (bats, real `status.jsonl`) | `tests/counter-derive.bats` |
| Every `**Skip if**` / `**Run only if**` step across the five workflows carries a `route_append_step_skipped` call in its skip arm and a gate item recording the skip | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-skip-recording-audit.test.ts` |
| Every `route_append_step_skipped` call site passes a `decidedBy` literal from the closed enum, and every enum member has at least one call site (no dead enum arm) | Unit (Vitest) | `.bkit/src/bkit-skip-recording-audit.test.ts` |
| Every subagent `Read:` entry naming an artifact a skippable step produces carries the `(if present)` qualifier | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| Every consumer of a versioned chain resolves `ls … \| sort -V \| tail -1` rather than a fixed `-v{N}-` filename | Unit (Vitest) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| `bkit-design-review-1.md` and `bkit-design-review-2.md` declare `Failures: <integer >= 0>` above `<!-- verdict:end -->`, and `bkit-design.md` Step 5 extracts and sums them into `DESIGN_REVIEW_FAILURES` | Unit (Vitest) | `.bkit/src/bkit-input-tolerance-audit.test.ts` |
| Each sole-emitter variable (`SPIKE`, `COMPLEXITY_VERDICT`) is assigned a member of its own declared enum on its emitter's skip arm, and the assigned value is the one the downstream gate treats as "do not run" | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Every applicability predicate names an artifact that an earlier step in the same workflow demonstrably produces — no predicate reads a header no upstream step emits | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `bkit-plan-scope-check-2` is absent from `.bkit/prompts/`, `bkit-plan.md` and `.bkit/prompts.md`, and `SCOPE_VERDICT` / `SCOPE_FAILURES` derive from the single remaining checker | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Plan Step 3.5 sets `PLAN_ESCALATE` in `TRUE\|FALSE`; the TRUE route reaches the escalation close without naming any Step 5 reviewer | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Debug Step 3 `TEST_VERDICT` = PASS at attempt 1 routes to a `NO-REPRO` outcome naming `/bkit-plan`, not to the clean-pass close | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `.bkit/prompts.md` documents every file in `.bkit/prompts/` after the deletion and additions (catalog parity, file → doc direction) | Unit (Vitest) | `.bkit/src/bkit-catalog-parity.test.ts` |
| Verdict-vocabulary linkage holds for the changed headers — every workflow gate enum matches its producing prompt's declaration | Unit (Vitest) | `.bkit/src/bkit-verdict-vocabulary.test.ts` |
| A scratch consumer installed from the built `dist/` receives the extended `bkit-status-route.sh` and the re-rendered workflows, and `bkit check` reports no drift | Integration (Vitest, spawned `bkit` via `tsx` on an `os.tmpdir()` consumer) | `.bkit/src/bkit-install.integration.test.ts` |

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
> **`bkit-plan-scope-check-2` is deleted.** The prompt file, its `.bkit/prompts.md` row, its `bkit-plan.md` Step 7 invocation and its `plan-scope-check-2.md` artifact all go. It is the one genuine duplicate in the parallel-sibling set — byte-identical to `-1` apart from `name:` and `model:` (opus vs sonnet), carrying no `Lens:` of its own. Consumer impact: a `.bkit/prompts.md` § Model Overrides row naming `bkit-plan-scope-check-2` becomes inert (it is below `bkit:end`, so `bkit install` never rewrites it and `bkit check` stays clean — the row simply matches nothing). Any consumer tooling globbing `plan-scope-check-*.md` will find one file where it found two.

> [!WARNING]
> **`step-skipped` is a new `status.jsonl` row type.** It is deliberately NOT folded — the reducer's fallthrough arm ignores unrecognised types, the same treatment `runtime-resolved`, `transport-fallback` and `close-transport` already get. Any consumer reader that assumes a closed type set, or that counts raw lines rather than folding, will see rows it does not recognise. Readers that fold, or that filter on `type`, are unaffected.

> [!IMPORTANT]
> **Design review artifacts gain a header line.** `design-review-1.md` grows `Failures: <integer >= 0>` (making its header three lines: `Verdict`, `Spike`, `Failures`) and `design-review-2.md` grows it (two lines). Any parser that assumes `<!-- verdict:end -->` sits at a fixed line number breaks; parsers that scan to the marker do not.

> [!IMPORTANT]
> **`design-v1-draft.md` gains machine-read structure.** Two new `##` sections carry the design-side applicability signal. Proposed names, both singular-noun section headings consistent with the existing `## Architecture` / `## Data Model` set:
>
> - `## Required Capabilities` — one row per capability the design needs that the stack does not already provide (new dependency, new external system, new service), or `None`. Drives `design-review-1` (buildability) and, transitively, `SPIKE`.
> - `## Runtime Surface Change` — what changes at runtime (new process, new endpoint, new job, new failure mode), or `None`. Drives `design-review-2` (operability).
>
> Both are human-readable design content, not hidden headers — the reviewability of the signal is the point (see Open Question 2).

**New names introduced:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `route_append_step_skipped` | shell function | `.bkit/templates/.bkit/scripts/bkit-status-route.sh` |
| `step-skipped` | `status.jsonl` row `type` | workflow skip arms; documented in `.bkit/workflows.md` § Event types |
| `caller-flag` / `upstream-verdict` / `applicability` / `path-override` | closed `decidedBy` enum | same |
| `DESIGN_REVIEW_FAILURES` | workflow variable | `bkit-design.md` Step 5 (mirrors plan's `REVIEW_FAILURES`) |
| `PLAN_ESCALATE` | workflow variable, `TRUE\|FALSE` | `bkit-plan.md` Step 3.5 |
| `plan-escalate` / `design-escalated` | `status.jsonl` step keys | `bkit-plan.md` |
| `bkit.sensitivePaths` | consumer `package.json` config key | read by design/plan predicates; defaults to `[]` |
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
- **Assumption:** `.bkit/scripts/*` ship via the core template directory walk as Tier-1 force-overwrite files, so extending the existing `bkit-status-route.sh` needs no `bkit-manifest.ts` row and no `bkit-modules.ts` change → if that walk has a per-file allow-list I did not find, consumers would not receive the new function and every skip arm would fail closed at `exit 2`.
- **Assumption:** build, debug and ship keep every step they have today; their 24 conditional steps gain skip logging only → if the reviewer disagrees and wants width cuts there, item 3 grows by three workflows.
- **Assumption:** the plan's own runbook exceeds the published `SINGLE` ceiling (`tasks <= 12`), so `/bkit-plan` Step 9 will very likely return `SPLIT` and Step 10 will partition it. That is expected, not a defect.

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
  - **Default if unanswered:** A — `complexity-check` stays unconditional; the runbook task for it becomes a no-op beyond its skip-logging retrofit.

- **Open Question 7:** Where do the sensitive-path globs live, and what is the default? → human decision.
  - **Options:** A — `package.json` `bkit.sensitivePaths`, an array of globs, defaulting to `[]`, alongside the existing `bkit.githubProject` / `bkit.issueTracker` keys. Consumer-owned, so bkit's shipped surface names no auth / migration / payment path and stack-independence holds. · B — a block in `.agents/config.md` below `bkit:end`, alongside the `debug-fetch` blocks. Also consumer-owned and closer to the other agent-tooling config; but it needs a new marker grammar and a new parser, where `package.json` already has one. · C — ship a default glob list in bkit. Immediately useful; but it hardcodes stack assumptions into the shipped surface, which is the thing the stack-independence rule forbids.
  - **Recommended:** A — reuses the existing `bkit.*` config path and parser, and an empty default means a consumer who sets nothing gets exactly today's behaviour from the override.
  - **Default if unanswered:** A, defaulting to `[]`.

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
- [ ] **User Context:** Read/write access to `.bkit/workflows/`, `.bkit/prompts/`, `.bkit/templates/.bkit/scripts/`, `.bkit/src/`, `tests/`, `docs/`. No missing user information beyond the seven Open Questions.
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
  - `workflow` ∈ `design|plan|build|debug|ship`; `step` is the same kebab slug the step's `step-done` row would carry (`plan-review`, `design-spike`, `ship-conflict-resolve`); `reason` is free text naming the **absent input** (`"zero declared dependency edges"`, `"no new capability required"`, `"zero review findings"`), never a size judgement; `decidedBy` ∈ `caller-flag|upstream-verdict|applicability|path-override`; `at` is ISO-8601 UTC; `parentSha` is `git rev-parse HEAD` at step start.
  - **Not folded.** The reducer's fallthrough arm ignores it, exactly as it ignores `runtime-resolved`, `transport-fallback` and `close-transport`. It therefore does not enter `WorkflowRun.steps`, does not affect `counter_count` / `counter_current`, and is absent from the `StatusEvent` union in `.bkit/src/bkit-status.ts` — consistent with the three existing additive audit rows.
  - **Union-merge safe.** Append-only NDJSON under `merge=union`; duplicate rows are harmless because nothing reduces them.
- **ADD:** consumer `package.json` key `bkit.sensitivePaths: string[]`, default `[]`. Read by design and plan predicates as a force-on override only.
- **MODIFY:** `.bkit/workflows.md` § Event types — one new table row documenting `step-skipped`, in the same additive-audit-row block as `runtime-resolved` / `transport-fallback` / `close-transport`.

## Architecture & Component Changes

**CRITICAL:** Every `[NEW]` states why an existing artifact cannot be evolved. Source-only edits — `.bkit/workflows/*`, `.bkit/prompts/*`, `.bkit/templates/*`, `.bkit/src/*`, `tests/*`, `docs/*`. NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*` mirrors; regenerate them with `bkit install`, batched once at session end.

### Shell primitives

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-status-route.sh`

- **Existence Check:** exists; already exports `route_get_debug_mode`, `route_get_push_mode`, `route_append_debug_mode`, `route_append_push_mode`, `route_last_verdict`, `route_last_failures`, `route_last_strategy`, `ladder_next`, plus `_route_die` / `_route_need_file` / `_route_need_fold`.
- Add `route_append_step_skipped STATUS_FILE WORKFLOW STEP REASON DECIDED_BY PARENT_SHA`, modelled byte-for-byte on `route_append_debug_mode`'s shape: validate `DECIDED_BY` against the closed enum in a `case`, assert `WORKFLOW` / `STEP` / `REASON` non-empty, `_route_need_file`, then `jq -nc --arg` every field (never `printf` + `sed` escaping — a backslash in a reason string emits an invalid JSON escape and makes the whole file unreadable to `jq -s`) and `>>` the file. Fail-closed: `_route_die` + `return 2`, nothing on stdout.
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
- `decidedBy` assignment across the 28: `caller-flag` for build `:508` (`[skills=false]`); `applicability` for the wave-3 predicates in design and plan; `path-override` for a lens forced on by `bkit.sensitivePaths` that its own predicate would have skipped; `upstream-verdict` for every remaining existing condition (verdict-, state- or count-gated).
- **PROHIBITED:** no step's condition changes in wave 1. This wave is logging only.

### Workflow prose — wave 2 (input tolerance, verdict continuity)

#### [MODIFY] `.bkit/workflows/bkit-design.md`

- Step 5: extract `Failures` from both reviews and sum into `DESIGN_REVIEW_FAILURES`, mirroring plan Step 5's `REVIEW_FAILURES`; carry it on the `design-review` `step-done` row's `failures` field and into the Step 5 tracker comment (`- Failures: {DESIGN_REVIEW_FAILURES}`), matching plan's comment shape. Extend Gate 5's verdict item to cover the count, in the mandated single-item form.
- Step 7 read list (`:559`): `design-review-1.md` **and** `design-review-2.md` each become `(if present)`.
- Step 8 read list (`:607`): replace the fixed `design-v2-reviewed.md` with a resolved highest-present chain — `DESIGN_CURRENT=$(ls docs/plans/{YYYYMM}/logs/{FID}/design-v*.md 2>/dev/null | sort -V | tail -1)`, copied verbatim from Step 9's existing `DESIGN_FINAL` idiom, `**If** empty → **Failure Path**`.
- Step 5 skip arm hard-sets `SPIKE` = FALSE (sole emitter; Step 6's gate at `:501` and its invalid-value **Failure Path** at `:455` both read it).

#### [MODIFY] `.bkit/workflows/bkit-plan.md`

- Step 6 read list (`:545`): all three `plan-review-*.md` become `(if present)`.
- Steps 7, 8, 9, 10 (`:595`, `:599`, `:648`, `:698`, `:747`): replace fixed `plan-v2-reviewed.md` / `plan-v3-checked.md` with `PLAN_CURRENT=$(ls docs/plans/{YYYYMM}/logs/{FID}/plan-v*.md 2>/dev/null | grep -v 'plan-v[0-9]*-[0-9]' | sort -V | tail -1)` — the child-excluding form already in Step 11 and the close step.
- Step 8 read list (`:648`): both `plan-scope-check-*.md` become `(if present)` (after wave 3 there is only `-1`, but the qualifier is still correct and the audit test asserts it).
- Step 9 skip arm hard-sets `COMPLEXITY_VERDICT` = `SINGLE` — the member Gate 9 asserts and Step 10's gate at `:743` treats as "do not run".

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
| Step | Subagent | Runs when | Computed by | `reason` when skipped |
| --- | --- | --- | --- | --- |
| S3 | `ideate-1` / `-2` / `-3` | always | — | — (Open Question 3, option A) |
| S4 | `design-generate` | always — mandatory | — | — |
| S5 | `design-review-1` | `## Required Capabilities` in `design-v1-draft.md` is not `None` | orchestrator bash | `"no new capability required"` — and hard-set `SPIKE` = FALSE |
| S5 | `design-review-2` | `## Runtime Surface Change` in `design-v1-draft.md` is not `None` | orchestrator bash | `"no runtime behaviour change"` |
| S6 | `design-spike` | `SPIKE` = TRUE — unchanged | — | unchanged |
| S7 | `design-update` | `DESIGN_REVIEW_FAILURES` >= 1 | orchestrator bash | `"zero review findings"` |
| S8 | `design-organise` | uppercase `{LABELS}` contains MILESTONE | orchestrator bash | `"no milestone — no workstream consumer"` |
| S9 | `design-summary` | always — mandatory, S10 and S11 gate on `SUMMARY_VERDICT` | — | — |

- Both S5 lenses skipped → both reviews absent → S7 skips on a zero count → S8 skips without a milestone: design's narrow path is 3 invocations (ideate ×3 stays) plus generate and summary.

#### [MODIFY] `.bkit/workflows/bkit-plan.md` — applicability predicates

<!-- prettier-ignore -->
| Step | Subagent | Runs when | Computed by | `reason` when skipped |
| --- | --- | --- | --- | --- |
| S3 | `plan-generate` | always — mandatory | — | — |
| S5 | `plan-review-1` | always — its input is the plan | — | — |
| S5 | `plan-review-2` | `grep -cE '^\s*(\*\*)?(Requires\|Blocked by\|After)' ` on the draft >= 1 | orchestrator bash | `"zero declared dependency edges"` |
| S5 | `plan-review-3` | the draft's `Architecture & Component Changes` carries >= 1 `[MODIFY]` or `[DELETE]` row, **or** any `bkit.sensitivePaths` glob matches a planned target path | orchestrator bash | `"no consumed surface touched"` |
| S6 | `plan-update` | `REVIEW_FAILURES` >= 1 | orchestrator bash | `"zero review findings"` |
| S7 | `scope-check-1` | always | — | — |
| S7 | `scope-check-2` | **deleted** | — | — |
| S8 | `plan-update` | `SCOPE_FAILURES` >= 1 | orchestrator bash | `"zero scope findings"` |
| S9 | `complexity-check` | always — Open Question 6, option A | — | — |
| S10 | `complexity-split` | `COMPLEXITY_VERDICT` = SPLIT — unchanged | — | unchanged |
| S11 | `plan-summary` | always — mandatory, S12 gates on it | — | — |

- A genuinely small single-task plan runs **four** invocations — generate, `plan-review-1`, `scope-check-1`, summary — plus the unconditional `complexity-check`, instead of eleven; no lens that had something to look at is dropped.
- The `bkit.sensitivePaths` arm is force-on only. It may promote `plan-review-3` from skipped to run (`decidedBy: path-override`); it may never demote a lens.

#### [DELETE] `.bkit/prompts/bkit-plan-scope-check-2.md`

- Byte-identical to `bkit-plan-scope-check-1.md` apart from `name:` and `model:` (opus vs sonnet) — verified line by line: identical Role, Scope, EXECUTION PROTOCOL, Contract, all 14 Process steps, and an identical `Lens: Scope, criteria, verification audit.` It is a second-opinion sampler on a cheaper model, not a lens; everywhere else in the parallel-sibling set, cutting by count deletes a dimension, and here it deletes nothing.
- Callers to update in the same change: `bkit-plan.md` Step 7 (invocation, artifact assertion, `SCOPE_VERDICT` / `SCOPE_FAILURES` derivation — worst-of-two and sum-of-two collapse to the single checker's values — the status row's `artifacts` array, the tracker comment, and Gate 7's four items) and `.bkit/prompts.md` (Plan Phase row plus the `bkit-plan-scope-check-*` mentions in § Special Behaviors' parallel-fan-out and stubbed-output rows).

### Workflow prose — wave 4 (routing)

#### [MODIFY] `.bkit/prompts/bkit-plan-generate.md`

- Add a second **Create** path, `docs/plans/{YYYYMM}/logs/{FID}/plan-escalation.md`, carrying `Escalate: TRUE | FALSE` + `<!-- verdict:end -->` and one paragraph of reason. `TRUE` when the generated plan rests on open decisions with real alternatives — that is, when `Open Questions & Assumptions` carries a question whose `Recommended` option changes the `Architecture & Component Changes` shape rather than a parameter.
- **Why a second artifact and not a header on the draft:** `bkit-plan-update` bootstraps by copying the prior version verbatim then prepending its own `Verdict: PENDING` header, so a header on `plan-v1-draft.md` would be buried in v2's body and ride into the canonical plan (Open Question 5).

#### [MODIFY] `.bkit/workflows/bkit-plan.md` — Step 3.5 Escalation Check

- New 🤖 step between Step 3 and Step 4, so the verdict lands **before** the Step 5 fan-out: read `plan-escalation.md` to `<!-- verdict:end -->` → `PLAN_ESCALATE`; invalid → the corpus's standard re-invoke-once loop, then **Failure Path**.
- **Route:** `**If** PLAN_ESCALATE` = FALSE → Step 4. `**If** TRUE` → record `step-done` `plan-escalate` with the verdict, post the tracker comment naming `/bkit-design {ISSUE_ID}` as the next action, run the Close Workflow, and **STOP**. Cost when the entry guess is wrong: one wasted `bkit-plan-generate` run.
- No human approval gate: escalation is the expensive direction and `bkit-build.md:206` leaves nothing below plan to downgrade into.

#### [MODIFY] `.bkit/workflows/bkit-debug.md` — Step 3 entry rule

- **Existence Check:** Step 3 sub-step 7 currently routes `TEST_VERDICT` = PASS to Step 8 when the derived attempt is > 1, and to Step 9 Summary when it is 1. Step 4 is gated `**Run only if** TEST_VERDICT = FAIL` (`:584`). So a bug a human just reported, with no failing test yet, gets a green no-op: the workflow finishes clean having proved only that the existing suite still passes.
- Change: attempt 1 **and** `TEST_VERDICT` = PASS records outcome `NO-REPRO` on the `debug-run-tests` row and routes to Step 9 with an instruction that the summary names `/bkit-plan {ISSUE_ID}` as the next action — writing the failing test first is plan-and-build-shaped work, not debug work. Attempt > 1 with PASS keeps today's Step 8 route (a fix was applied and now passes) unchanged.
- **PROHIBITED:** no change to Steps 4-7, to `DEBUG_MODE` routing, or to the soak ladder.

#### [MODIFY] `.bkit/workflows/bkit-auto.md`

- No routing-table change — `bkit-auto`'s CI mode is failure-driven by construction and never receives a human-reported bug. The entry doctrine lands in documentation only.

### Tests

#### [NEW] `tests/step-skipped-row.bats`

- Row shape and the fail-closed contract for `route_append_step_skipped`, in a fresh subprocess per case against a real `status.jsonl`, following `tests/route-state.bats`'s shape. Honours a `BKIT_STATUS_ROUTE` override so a bats row can run `dev`'s version against the worktree's for RED-vs-GREEN without a second clone.
- **Why not extend `tests/route-state.bats`:** that file's scope is the durable routing-state reads (`debugMode` / `pushMode` / verdicts / ladder). A write-side emitter with its own enum validation is a distinct contract, and `docs/testing.md` § Counter derivation names each bats file by its scope.

#### [NEW] `.bkit/src/bkit-skip-recording-audit.test.ts`

- Presence audit over the workflow corpus, modelled on `.bkit/src/bkit-runtime-prose-audit.test.ts`: derive the conditional-step set from the files themselves (`^\*\*(Skip if|Run only if)`) — never a hand-written list, so a newly-added conditional step is covered-or-failing by construction — and assert each has a `route_append_step_skipped` call and a skip gate item. Also assert the `decidedBy` literals form exactly the closed enum, with no dead arm.

#### [NEW] `.bkit/src/bkit-input-tolerance-audit.test.ts`

- Asserts `(if present)` on every read entry naming a skippable step's output, latest-present resolution at every version-chain consumer, and the `Failures:` header + `DESIGN_REVIEW_FAILURES` extraction. Pins the **mechanism** (`sort -V | tail -1`, the literal `(if present)` qualifier), never a comment that explains it.

#### [NEW] `.bkit/src/bkit-applicability-audit.test.ts`

- Asserts the verdict-continuity hard-sets against each variable's own declared enum, that every predicate names an artifact an earlier step produces, `scope-check-2`'s complete removal, `PLAN_ESCALATE`'s enum and TRUE-route, and debug's `NO-REPRO` route.

#### [MODIFY] `.bkit/src/bkit-status.test.ts`

- One case: `fold` over a log with `step-skipped` rows equals `fold` over the same log without them. Prove it can fail — add the row to the union handling, watch the case red, revert.

#### [MODIFY] `tests/counter-derive.bats`

- One case: `counter_count` for a step key is unchanged by a `step-skipped` row carrying that key.

#### [MODIFY] `.bkit/src/bkit-install.integration.test.ts`

- Extend the existing scratch-consumer scenario's assertions to cover the re-rendered workflows and the extended `bkit-status-route.sh` reaching the consumer, and `bkit check` reporting no drift.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/prompts/bkit-plan-scope-check-2.md` | `.bkit/prompts/bkit-plan-scope-check-1.md` | DELETE | Byte-identical apart from `name:` and `model:`; carries the same `Lens:` line, so it is a second-opinion sampler, not a dimension. Nothing is lost by removing it |
| `bkit-plan.md` Step 7 `@bkit-plan-scope-check-2` invocation, its artifact assertion, its `plan-scope-check-2.md` entry in the status row's `artifacts`, and its Gate 7 items | The single-checker Step 7 | DELETE | Direct consequence of the row above; `SCOPE_VERDICT` / `SCOPE_FAILURES` stop being worst-of-two / sum-of-two |
| `.bkit/prompts.md` Plan Phase row for `bkit-plan-scope-check-2` and its mentions in § Special Behaviors | The remaining `bkit-plan-scope-check-1` entries | DELETE | Catalog parity is asserted file → doc; a documented entry with no file is tolerated by the test but is drift |

> [!CAUTION]
> **Default = `DELETE`.** Each `DELETE` row above is mirrored as `[DELETE]` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook` (Task 14).

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md` | § Event types — one new row for `step-skipped` in the additive-audit-row block; § Common Workflow Anatomy — skipped steps record a skip and a skipped gate; § Rationale rehomed from the workflow files — why the row is not folded, why `SINGLE` (not `NOSPLIT`) is the continuity value, why the design S8 predicate is `MILESTONE` alone, and why the `bkit.sensitivePaths` override is force-on only. Every rationale byte belongs here, never in a workflow file |
| `.bkit/prompts.md` | Design Phase — `bkit-design-generate` gains the two new sections; `bkit-design-review-1` / `-2` gain `Failures:` and their applicability conditions. Plan Phase — delete the `bkit-plan-scope-check-2` row; note `bkit-plan-generate`'s second artifact. § Special Behaviors — update the parallel-fan-out and stubbed-output rows where they name `bkit-plan-scope-check-*` |
| `docs/testing.md` | Add the four new / modified test files to the file-inventory tables with their tier and scope, beside the existing counter-derivation and runtime-shim tables |
| `docs/decisions.jsonl` | Three `decision` rows — already appended by plan-generate: `442-step-skipped-row-not-folded`, `442-applicability-not-scale-dial`, `442-escalation-needs-no-human-gate`. Build verifies, does not re-append |
| `docs/deferrals.jsonl` | Six `deferral` rows already appended by plan-generate, mirroring the `Out of Scope` `Exempt` table. The seventh `Exempt` row (detector promotion) maps to the existing key `384-promote-status-hole-detector-from-advisory-to-gate` — no duplicate is minted, per the same-`key`-append rule |
| `docs/knowledge.jsonl` | One `knowledge` row if the retrofit surfaces a real gotcha; the issue's `NOSPLIT`-vs-`SINGLE` mismatch is a candidate |
| `README.md` | The entry-point line — default entry is `/bkit-plan`, design is entered by escalation from plan, debug is for a failure that already reproduces. Update the ASCII pipeline sketch to show the escalation edge |
| `.agents/docs.md` | No change — no new doc file; `.bkit/*.md` are bkit-authoring docs and are not catalog rows |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | The only persistent-state change is an additive `status.jsonl` row type; existing logs stay readable because the fold already ignores unrecognised types |
| **Code** | `git revert {COMMIT}` on the squash-merge commit, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional |
| **Partial rollback** | Revert wave 3 and wave 4 independently of waves 1 and 2 | Waves 1 and 2 are pure logging and pure tolerance with no behaviour change: reverting only the predicates restores full width while keeping the skip log and the tolerant read lists. Waves 3 and 4 have no such split — the escalation route and the debug `NO-REPRO` route stand alone |
| **Risk window** | None — no deploy. A consumer on the released version is unaffected until they run `bkit upgrade` | A consumer who upgrades mid-run of a workflow could hit a workflow file whose step numbering changed (plan gains Step 3.5). The per-FID `.lock` and the resume-by-fold contract make that a resume-at-the-wrong-step risk, not corruption |

_A per-workflow rollback primitive does not exist; this is the reason the deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` is open. Whole-commit revert plus mirror regen is the current path._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** Waves 1-2 are behaviour-neutral and 3-4 are not, so a wave-per-commit shape reads well in review — advisory only, NEVER a gate; delivering every task in ONE PR is always correct.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Plan-verify reads this line and asserts against it before ticking `[x]`.

### Wave 1 — skip recording (pure logging, no behaviour change)

- [ ] **Task 1: Add `route_append_step_skipped` to the shared routing script.** Extend `.bkit/templates/.bkit/scripts/bkit-status-route.sh` with the emitter, modelled on `route_append_debug_mode`: closed-enum `case` on `DECIDED_BY`, non-empty asserts on `WORKFLOW` / `STEP` / `REASON`, `_route_need_file`, `jq -nc --arg` for every field, `>>` append, `_route_die` + `return 2` on any failure. **Done when:** `route_append_step_skipped` is defined in that file; a manual `sh -c '. …/bkit-status-route.sh && route_append_step_skipped /tmp/s.jsonl plan plan-review r applicability abc'` appends one line that `jq -e .` parses and `jq -r .decidedBy` reports as `applicability`; the same call with `decidedBy=bogus` exits 2 and prints nothing on stdout.

- [ ] **Task 2: Cover the emitter with bats.** Create `tests/step-skipped-row.bats` with a fresh subprocess per case, a real temp `status.jsonl`, and a `BKIT_STATUS_ROUTE` override. Add one case to `tests/counter-derive.bats` and one to `.bkit/src/bkit-status.test.ts`. **Done when:** `npx bats tests/step-skipped-row.bats` passes and covers both matrix rows for the emitter (row shape with all seven fields; enum / empty-`step` / empty-`reason` refusal at exit 2 with the file byte-unchanged); `tests/counter-derive.bats` proves `counter_count` for a step key is unchanged by a `step-skipped` row carrying that key; `.bkit/src/bkit-status.test.ts` proves `fold` over a log with those rows equals `fold` over the same log without them, and reds when the row is added to the union handling.

- [ ] **Task 3: Document the row type before any caller exists.** Add the `step-skipped` row to `.bkit/workflows.md` § Event types beside `runtime-resolved` / `transport-fallback` / `close-transport`; add the not-folded rationale to § Rationale rehomed from the workflow files; extend the `.bkit/src/bkit-status.ts` header comment. **Done when:** `.bkit/workflows.md` § Event types contains a `step-skipped` row naming all seven fields and the `decidedBy` enum; `grep -c 'step-skipped' .bkit/src/bkit-status.ts` is >= 1 and the `StatusEvent` union is unchanged.

- [ ] **Task 4: Retrofit the skip arm to all 28 conditional steps.** Add the bash skip arm and the gate item to every step matched by `grep -nE '^\*\*(Skip if|Run only if)' .bkit/workflows/bkit-*.md`, assigning `decidedBy` per the Architecture table. Change no step's condition. **Done when:** `grep -c 'route_append_step_skipped' .bkit/workflows/bkit-*.md` sums to 28; every step matched by that grep has a `step-skipped` call and a skip gate item within its own section; `git diff` shows no edit to any `**Skip if**` / `**Run only if**` condition text.

- [ ] **Task 5: Gate the retrofit with a derived presence audit.** Create `.bkit/src/bkit-skip-recording-audit.test.ts`, deriving the conditional-step set from the workflow files at run time — never a hand-written list. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-skip-recording-audit.test.ts` passes both matrix rows (every conditional step has a call and a gate item; `decidedBy` literals form exactly the four-member enum with no dead arm); deleting one call site reds it.

### Wave 2 — input tolerance and verdict continuity (mechanical, no behaviour change)

- [ ] **Task 6: Make read lists tolerate an absent producer.** Add `(if present)` to design Step 7's two review entries and plan Step 6's three review entries and Step 8's two scope-check entries, copying the qualifier's existing wording at `bkit-plan.md` Step 5. **Done when:** each of those seven read entries carries `(if present)`; `grep -c '(if present)' .bkit/workflows/bkit-design.md .bkit/workflows/bkit-plan.md` is at least seven higher than at HEAD.

- [ ] **Task 7: Resolve version chains to latest-present.** Replace fixed `design-v2-reviewed.md` at design Step 8 and fixed `plan-v2-reviewed.md` / `plan-v3-checked.md` at plan Steps 7, 8, 9 and 10 with the `ls … | sort -V | tail -1` idiom already at design Step 9 / plan Step 11 (plan keeps the child-excluding `grep -v 'plan-v[0-9]*-[0-9]'`), each with an empty-result **Failure Path**. **Done when:** no `Read:` line in either workflow names a fixed `-v2-` or `-v3-` filename; each replacement site contains `sort -V | tail -1` and an empty-result **Failure Path**.

- [ ] **Task 8: Add the `Failures:` header to both design reviewers and sum it.** Extend `bkit-design-review-1.md` and `-2.md` output formats and Process steps, copying `bkit-plan-review-1.md`'s wording; extract and sum into `DESIGN_REVIEW_FAILURES` at design Step 5, carry it on the `design-review` row's `failures` field and in the Step 5 tracker comment; extend Gate 5. **Done when:** both prompts declare `Failures: <integer >= 0>` above `<!-- verdict:end -->`; `bkit-design.md` Step 5 assigns `DESIGN_REVIEW_FAILURES` and passes it as the row's `failures`; `npx vitest run .bkit/src/bkit-verdict-vocabulary.test.ts` passes.

- [ ] **Task 9: Hard-set the sole-emitter variables on skip.** Design Step 5's skip arm sets `SPIKE` = FALSE; plan Step 9's sets `COMPLEXITY_VERDICT` = `SINGLE`. Build's `CHALLENGE_VERDICT` needs no change — Step 11 stays unconditional because both challengers always run. **Done when:** design Step 5's skip arm contains `SPIKE` = FALSE and plan Step 9's contains `COMPLEXITY_VERDICT` = `SINGLE`; each assigned value is a member of the enum its own gate asserts (`TRUE|FALSE`, `SINGLE|SPLIT`); no skip arm assigns `NOSPLIT`.

- [ ] **Task 10: Gate wave 2 with a derived tolerance audit.** Create `.bkit/src/bkit-input-tolerance-audit.test.ts`, pinning mechanisms (`sort -V | tail -1`, the literal `(if present)`, the `Failures:` declaration), never prose that explains them. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-input-tolerance-audit.test.ts` passes all three of its matrix rows; reverting one `(if present)` qualifier reds it.

### Wave 3 — applicability predicates (design and plan only)

- [ ] **Task 11: Give the design doc the two signal sections.** Add `## Required Capabilities` and `## Runtime Surface Change` to `bkit-design-generate.md`'s output format with the corpus's `PENDING` annotation, plus the Process steps that populate them. **Done when:** both sections are in the output format between `## Architecture` and `## Data Model`, each annotated `initially set to \`PENDING\``, and each has a Process step naming it.

- [ ] **Task 12: Wire the design predicates.** Add the four `**Run only if**` conditions from the Architecture table to design Steps 5 (both lenses), 7 and 8, each with the Task-4 skip arm carrying `decidedBy: applicability` and the tabulated `reason`. Leave Step 3's three ideate lenses unconditional per Open Question 3 option A. **Done when:** design Steps 5, 7 and 8 each carry a `**Run only if**` line naming a bash-countable condition over a named artifact; Step 5's skip arm also hard-sets `SPIKE` = FALSE; `grep -c 'Run only if' .bkit/workflows/bkit-design.md` is 4 higher than at HEAD; Step 3 is unchanged.

- [ ] **Task 13: Wire the plan predicates.** Add the `**Run only if**` conditions to plan Steps 5 (`plan-review-2`, `plan-review-3`), 6 and 8, each with its skip arm. `plan-review-3` takes the two-arm form: base condition OR a `bkit.sensitivePaths` glob match, the latter recording `decidedBy: path-override`. Leave Step 9 unconditional per Open Question 6 option A. **Done when:** plan Steps 5, 6 and 8 carry their conditions; `plan-review-3`'s condition contains both arms and the glob arm can only add the lens; Step 9 has no `**Run only if**`; the plan workflow reads `bkit.sensitivePaths` from `package.json` and treats an absent key as `[]`.

- [ ] **Task 14: Delete `bkit-plan-scope-check-2` and every caller.** Remove the prompt file; collapse plan Step 7 to the single checker (invocation, artifact assertion, `SCOPE_VERDICT` / `SCOPE_FAILURES` derivation, the status row's `artifacts` array, the tracker comment, Gate 7's items); remove the `.bkit/prompts.md` Plan Phase row and update the two § Special Behaviors rows that name `bkit-plan-scope-check-*`. **Done when:** `.bkit/prompts/bkit-plan-scope-check-2.md` does not exist; `grep -rc 'scope-check-2' .bkit/ docs/` returns zero matches outside `docs/plans/`; `npx vitest run .bkit/src/bkit-catalog-parity.test.ts` passes; plan Step 7's `SCOPE_VERDICT` derives from one artifact.

- [ ] **Task 15: Gate wave 3 with a derived applicability audit.** Create `.bkit/src/bkit-applicability-audit.test.ts` covering the continuity hard-sets, the predicate-artifact linkage and `scope-check-2`'s removal (its escalation and debug rows land in Task 18 and Task 19). **Done when:** the file exists; `npx vitest run .bkit/src/bkit-applicability-audit.test.ts` passes its continuity, predicate-linkage and `scope-check-2`-removal rows; introducing a predicate that reads an unemitted header reds it.

### Wave 4 — routing

- [ ] **Task 16: Emit the escalation verdict.** Add `plan-escalation.md` as a second **Create** to `bkit-plan-generate.md`, carrying `Escalate: TRUE | FALSE` + `<!-- verdict:end -->` and a one-paragraph reason, with the Process step that decides it. **Done when:** the prompt names `docs/plans/{YYYYMM}/logs/{FID}/plan-escalation.md` as a Create, declares `Escalate: TRUE | FALSE` above `<!-- verdict:end -->`, and `plan-v1-draft.md` still carries no header line.

- [ ] **Task 17: Add plan Step 3.5 Escalation Check.** Insert the 🤖 step between Steps 3 and 4: extract `PLAN_ESCALATE`, re-invoke once on an invalid value then **Failure Path**, and route FALSE → Step 4 / TRUE → record `plan-escalate`, post the `/bkit-design` hand-off comment, run Close Workflow, **STOP**. Renumber nothing — use `3.5` so downstream step numbers and their `step-done` keys stay stable. **Done when:** `bkit-plan.md` contains a Step 3.5 section whose route block has both branches; the TRUE branch reaches Close Workflow without naming any Step 5 reviewer; existing step keys (`plan-review`, `plan-scope-check`, …) are unchanged.

- [ ] **Task 18: Close the debug entry gap.** Change debug Step 3 sub-step 7 so attempt 1 with `TEST_VERDICT` = PASS records `NO-REPRO` and routes to Step 9 with the summary naming `/bkit-plan {ISSUE_ID}`; leave attempt > 1 with PASS on today's Step 8 route. **Done when:** `bkit-debug.md` Step 3's PASS branch distinguishes attempt 1 from attempt > 1 by outcome as well as destination; `NO-REPRO` appears on the attempt-1 path; Steps 4-7 and the soak ladder are unchanged in `git diff`.

- [ ] **Task 19: Extend the applicability audit to the routing rows.** Add the `PLAN_ESCALATE` enum / TRUE-route case and the debug `NO-REPRO` case to `.bkit/src/bkit-applicability-audit.test.ts`. **Done when:** `npx vitest run .bkit/src/bkit-applicability-audit.test.ts` passes both routing matrix rows; removing the `NO-REPRO` route reds it.

- [ ] **Task 20: Write the entry-point doctrine into the docs.** Update `README.md` (default entry is `/bkit-plan`; design is entered by escalation; debug is for a failure that already reproduces) including the ASCII pipeline sketch, and `.bkit/workflows.md` § Common Workflow Anatomy. **Done when:** `README.md` states the plan-by-default entry rule and its pipeline sketch shows the plan → design escalation edge; `.bkit/workflows.md` carries the same rule; neither names a tracker issue number or any other bkit-internal identifier.

### Wave 5 — ledgers, docs, mirrors

- [ ] **Task 21: Verify the ledger rows and finish the docs.** The three `decision` rows and six `deferral` rows were appended by plan-generate; verify they are intact and correct rather than re-appending them (a same-`key` append is only warranted if a field genuinely changed). Then update `.bkit/prompts.md`, `docs/testing.md` and, if the retrofit surfaced one, `docs/knowledge.jsonl`. Read each ledger first; append, never edit a prior line. **Done when:** `jq -r 'select(.kind=="decision") | .key' docs/decisions.jsonl | grep -c '^442-'` is 3; `jq -r 'select(.kind=="deferral") | .key' docs/deferrals.jsonl | grep -c '^442-'` is 6, each carrying a `reason` from the closed enum and, where `scope-declared`, `references` naming the `#442` section that declared it (the row is not its own declaration); no duplicate of `384-promote-status-hole-detector-from-advisory-to-gate` was minted; `docs/testing.md` lists all four new / modified test files with tier and scope; `.bkit/prompts.md` has no `scope-check-2` row.

- [ ] **Task 22: Regenerate mirrors and run the full gate suite.** Run `pnpm build`, then `pnpm bkit install` once (batched at session end, never per edit), then `git config core.bare false`. Run the whole local gate set and a packed-tarball dogfood on a fresh scratch consumer. **Done when:** `pnpm vitest run` (full suite, never scoped) passes; `npx bats tests/*.bats` passes; `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta` and `pnpm bkit check` all exit 0 with no `bkit-rendered-prompts-stale` finding; a `pnpm pack` tarball installed into a fresh `os.tmpdir()` consumer yields a `.bkit/scripts/bkit-status-route.sh` containing `route_append_step_skipped` and a `.claude/commands/bkit-plan.md` containing Step 3.5.

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

- [ ] **Verify test coverage against Derived Test Matrix:** every one of the 17 rows maps to a runbook task above (Tasks 2, 5, 10, 15, 19, 22 carry the test-bearing `Done when` lines; Tasks 8 and 14 carry the vocabulary and catalog rows).
- [ ] **Update existing tests:** `.bkit/src/bkit-status.test.ts`, `tests/counter-derive.bats`, `.bkit/src/bkit-install.integration.test.ts`, plus any assertion in `bkit-catalog-parity.test.ts` / `bkit-verdict-vocabulary.test.ts` that moves with the deleted prompt and the new headers.
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
- [ ] **Test Synchronization:** no E2E tier exists in this repo, so nothing to synchronise there. Do re-run `.bkit/src/bkit-catalog-parity.test.ts`, `.bkit/src/bkit-verdict-vocabulary.test.ts`, `.bkit/src/bkit-runtime-prose-audit.test.ts`, `.bkit/src/bkit-block-locality-audit.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts` and `.bkit/src/bkit-untrusted-input-coverage.test.ts` — all six read the workflow / prompt corpus this change edits.
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

- [ ] **Step 1 — Narrow-path live run.** Run `/bkit-plan` against a small single-task issue in this repo. Confirm from the tracker comments that exactly four 🧠 steps invoked a subagent, and from `jq -r 'select(.type=="step-skipped") | "\(.step)\t\(.decidedBy)\t\(.reason)"' docs/plans/*/logs/{FID}/status.jsonl` that every skipped step recorded a row naming an absent input.
- [ ] **Step 2 — Full-width live run.** Run `/bkit-plan` against an issue whose plan declares dependency edges and modifies exported symbols. Confirm all three Step 5 reviewers ran and that no `step-skipped` row was written for Step 5.
- [ ] **Step 3 — Escalation live run.** Run `/bkit-plan` against an issue with a genuinely open architectural decision. Confirm `plan-escalation.md` reports `Escalate: TRUE`, no Step 5 reviewer was invoked, and the tracker comment names `/bkit-design`.
- [ ] **Step 4 — Debug entry rule.** Run `/bkit-debug` against a green FID. Confirm the run records `NO-REPRO` and the summary names `/bkit-plan`, rather than reporting a clean pass.
- [ ] **Step 5 — Consumer upgrade.** In a separate consumer clone, run `bkit upgrade`, then `bkit check`. Confirm exit 0, that `.bkit/scripts/bkit-status-route.sh` carries `route_append_step_skipped`, and that no `.opencode/` or `.cursor/` mirror was left stale.
