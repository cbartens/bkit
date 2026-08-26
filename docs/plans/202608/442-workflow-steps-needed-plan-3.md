<!-- bkit:anchor
baseSha: e1616f88610ca307b85928b6df003178c37964a5
baseRef: origin/dev
-->

# Run Only Workflow Steps Tasks Actually Need — Sub-Plan 3 of 4: Applicability Predicates

**Parent Plan:** [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md)

**Siblings:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) (skip recording) · [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) (input tolerance) · [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) (routing, ledgers, docs, mirrors)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!WARNING]
> **This is the first sub-plan that changes what runs.** Sub-plans 1 and 2 were pure logging and pure tolerance. Six of the plan's eight Open Questions are answered here, and two of them (3 and 6) have landing sites that are a **plan revision, not an in-flight edit** — read § Open Questions before Task 11.

## Context & Goals

Every feature pays the same subagent bill regardless of size. On a small, well-scoped change most review lenses read an artifact that contains zero instances of what they iterate over, return `PASS` having looked at nothing, and cost a full model turn anyway.

**This sub-plan does item 3 of the parent plan's four:** it adds **applicability predicates** to `bkit-design` and `bkit-plan` only, so a lens runs when the thing it inspects is present. Not when a size dial says so.

A step runs when the thing it inspects is present. That is machine-checkable, it is auditable after the fact via the `step-skipped` row, and it never deletes a dimension — a lens that is skipped had nothing to read, by construction.

**Two levels of skip, and the difference is load-bearing.** Most conditional steps are whole-step skips. But the savings here live _inside_ fan-out steps: `bkit-plan.md` Step 5 invokes `plan-review-1` / `-2` / `-3` as three bullets in **one** step under **one** `step-done` key (`plan-review`), and `bkit-design.md` Step 5 invokes both reviewers the same way. So this sub-plan writes the first `**Run lens only if**` lines in the corpus — the sub-step condition construct that [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 3 documented and that [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 5's audit has been waiting to gate.

**Hard prerequisites.** Tasks 12 and 13 require [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 5 and [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) Tasks 9 and 10. Without Task 9's partial-width fan-out, the first narrow-path run hits `bkit-plan.md:498`'s blanket "any file empty → **Failure Path**" and the deliberate skip becomes the crash this plan exists to eliminate.

**The continuity hard-sets land here, deliberately.** `SPIKE` = FALSE and `DESIGN_REVIEW_FAILURES` = 0 are written by Task 12, on the skip arms Task 12 creates — not by [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) Task 9. This is what makes sub-plans 3 and 4 revertible independently of 1 and 2: a hard-set left in sub-plan 2 would be stranded on a skip arm that no longer exists.

`bkit-build`, `bkit-debug` and `bkit-ship` get **no step changes** anywhere in this plan. Build is already half-conditional and the remainder is load-bearing: `challenge-1` and `challenge-2` carry different dimensions (bugs / security), so dropping `-2` deletes security coverage outright, and `challenge-reconcile` always has two reports to merge as a consequence.

**Related Issues:**

- `#442 — Run only workflow steps tasks actually need (open)` — this plan's issue.

---

## 👤 Acceptance Scenario _(contract confirmed once in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1)_

> The full Narrative, Success Criteria, Process Sketch and Concrete Example are in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md). The slices this sub-plan owns are below. Do NOT re-ask the human here.

### Narrative _(inherited from the parent plan — do not rewrite)_

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria advanced by this sub-plan

- A plan whose runbook declares no dependency edges and whose `Architecture & Component Changes` carries no `[MODIFY]` / `[DELETE]` row completes on **five** 🧠 invocations (generate, `plan-review-1`, `scope-check-1`, `complexity-check`, summary). A plan that modifies a consumed surface but declares no dependency edges costs **six** (adds `plan-review-3`). A plan with dependency edges and modified surfaces still runs all of them. `complexity-check` is unconditional under Open Question 6 option A and is counted in every figure above.
- A skipped **lens** inside a fan-out step writes a `step-skipped` row under a lens-suffixed `step` value — the lens-level half of Success Criterion 1, whose emitter and audit are [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md)'s.
- Every variable a later step gates on has a defined value whether its emitter ran or not — no gate reads an unset name. The set of such variables is **derived** from the workflow files, not enumerated in prose.

### Process Sketch _(slices owned here)_

- **WHEN** a skipped step or lens was the sole emitter of a variable **→ THEN** the workflow hard-sets that variable to a defined enum member **as an orchestrator prose variable, outside any bash fence**, before the gate that reads it.
- **IF** a consumer sensitive-path glob matches a planned target **→ THEN** the matching lens is forced on regardless of its own predicate; a glob never drops a lens. A forced-on lens runs, so it emits an ordinary `step-done` and **no** `step-skipped` row.

### Concrete Example _(the decision this sub-plan makes)_

**Setup:** A maintainer of a repo with bkit installed opens an issue for a one-file copy fix: change a CLI help string. No new dependency, no runtime surface, no schema, no dependency edges between tasks. `bkit.sensitivePaths` is unset. They run `/bkit-plan #900`.

**Steps:**

1. `plan-v1-draft.md` carries a single runbook task with no `Requires:` / `Blocked by:` / `After:` line, and `Architecture & Component Changes` carrying one `[MODIFY]` row.
2. Workflow reaches Step 5 → counts zero declared dependency edges in the draft → `plan-review-2`'s lens condition is FALSE, so it is skipped and one `step-skipped` row is appended with `step` = `plan-review-2`, `reason` = `"zero declared dependency edges"`, `decidedBy` = `applicability`. `plan-review-3`'s lens condition **is** TRUE — the draft carries one `[MODIFY]` row — so `plan-review-3` **runs** alongside `plan-review-1`. Step 5 asserts only the two artifacts its two lenses produced, sums `REVIEW_FAILURES` over those two, and writes an `artifacts` array of length 2.
3. Both reviewers return `Verdict: PASS`, `Failures: 0` → `REVIEW_FAILURES` = 0 → Step 6 does not run; a `step-skipped` row records `step` = `plan-update`, `"zero review findings"`, `decidedBy: upstream-verdict`.
4. Step 7 invokes `@bkit-plan-scope-check-1` (there is no `-2` any more). It returns `Failures: 0` → Step 8 skipped and recorded. Step 9 `complexity-check` runs unconditionally (Open Question 6 option A), returns `SINGLE`, Step 10 skipped and recorded.

**Outcome:** Six 🧠 invocations instead of eleven. Had the draft carried no `[MODIFY]` / `[DELETE]` row, `plan-review-3` would have skipped too and the run would have cost five.

### Edge Cases _(rows owned by this sub-plan)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `design-review-1` lens skipped — sole emitter of `SPIKE` | Its lens skip arm hard-sets `SPIKE` = FALSE, as an orchestrator prose variable outside any bash fence, before Step 6's gate reads it; self-consistent, since no new capability is also nothing to spike |
| **Both** design Step 5 lenses skipped — Step 5 emits nothing, and it is the sole emitter of `DESIGN_REVIEW_FAILURES` | The full-skip arm hard-sets `DESIGN_REVIEW_FAILURES` = 0 (prose variable) so Step 7's `>= 1` predicate reads a defined value and skips; the `SPIKE` = FALSE hard-set fires from the `design-review-1` lens arm as above |
| `plan-complexity-check` skipped — sole emitter of `COMPLEXITY_VERDICT` | Not reachable under Open Question 6 option A: Step 9 carries no condition, so it has no skip arm and `COMPLEXITY_VERDICT` is always emitted. **If** the human answers OQ6 B or C, the skip arm hard-sets `COMPLEXITY_VERDICT` = `SINGLE` (the shipped enum member; the issue's `NOSPLIT` is not a value this workflow accepts) — that is a plan revision, not a runbook edit |
| An apply step is skipped on `Failures: 0` but the reviewer returned `CONCERNS` | `CONCERNS` with `failures = 0` is legal under the status invariants; the apply step still skips — the count, not the verdict, is the input |
| Consumer sets no sensitive-path globs (the default) | Absent `bkit.sensitivePaths` resolves to `[]`; an empty list matches nothing; every predicate falls through to its own base condition — no lens is forced, and none is dropped by the absence. Behaviour is byte-identical to a consumer who sets `[]` explicitly |
| A sensitive-path glob matches but the lens's own predicate is FALSE | Lens runs, emits `step-done`, and writes **no** `step-skipped` row. Globs force on only; they never reduce width |
| A sensitive-path glob matches and the lens's own predicate is TRUE | Lens runs exactly once — the two arms are OR'd, not additive; no second invocation, no duplicate artifact |

### Derived Test Matrix _(rows owned by this sub-plan)_

> Each row → one Agent Execution Runbook task. Assign each behaviour its tier(s) using the **tier-selection rubric** in `docs/testing.md`. Boundary rows carry that doc's rigor — reach the real boundary and assert a ground-truth signal; do not restate those rules here.
>
> **Discrimination (no false-green):** each row's assertion MUST observe the **affected** surface and would FAIL if the behaviour were broken.

**Tier Key** — bkit's own tiers per `docs/testing.md` § Tiers: Unit (`*.test.ts`, in-process, no real subprocess), Integration (`*.integration.test.ts`, multi-module or spawned `bkit` via `tsx`), Shell (`tests/*.bats`, cross-process, real files and exit codes). bkit has no browser, DB or deploy, so there is no E2E, `@live`, fresh-DB-replay or Smoke tier. Static is the global gate, not a per-feature row.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Every `route_append_step_skipped` call site passes a `decidedBy` literal from the closed enum; every enum member has at least one call site (no dead enum arm) — asserted after wave 3 lands, since `applicability` has no call site before it | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| The sole-emitter set is **derived** — every variable read by a gate whose only assignment site sits in a skippable step or lens is assigned a member of its own declared enum on that step's / lens's skip arm, and the assigned value is the one the downstream gate treats as "do not run". Fails on any newly-added sole emitter that has no hard-set | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Every continuity hard-set is an orchestrator **prose** variable placed outside any fenced code block — a shell assignment inside a fence reds the guard (shell state does not survive the tool-call boundary; `docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`) | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| Every applicability predicate names an artifact that an earlier step in the same workflow demonstrably produces — no predicate reads a header no upstream step emits; and for the two design predicates the **heading literal** (`## Required Capabilities` / `## Runtime Surface Change`) appears verbatim in `bkit-design-generate.md`'s output format, so a rename in the prompt reds the guard rather than pinning both predicates permanently FALSE | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |
| The `bkit.sensitivePaths` arm appears only in a promoting position — every predicate carrying it is an OR of (base condition) OR (glob match), never an AND and never a negation, so a glob can add a lens and can never drop one | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| An absent `bkit.sensitivePaths` key resolves to `[]` through the same read path the workflow uses (`jq -r '.bkit.sensitivePaths // [] \| .[]'`), and an empty list matches no path — byte-identical predicate outcome to a consumer who sets `[]` explicitly | Unit (Vitest) | `.bkit/src/bkit-config-keys.test.ts` |
| The plan-side predicate set is exactly the tabulated one — `plan-review-2`, `plan-review-3`, Step 6, Step 8 and Step 10 carry a condition; Step 3, Step 5's `plan-review-1`, Step 7, Step 9 and Step 11 carry none — **and each apply-step condition reads the failure count (`>= 1`), never a verdict literal**, so an `!= PASS` rewrite reds the guard instead of silently reverting Open Question 4 to option B. The derived count of unconditional 🧠 steps in `bkit-plan.md` is five, so the narrow-path invocation count is derived from the workflow file rather than asserted in prose | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-applicability-audit.test.ts` |
| `bkit-plan-scope-check-2` is absent from the **live surface** — `.bkit/prompts/`, `.bkit/workflows/`, `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/comparison.md` — with append-only `*.jsonl` ledgers and `docs/plans/**` excluded; and `SCOPE_VERDICT` / `SCOPE_FAILURES` derive from the single remaining checker | Unit (Vitest) | `.bkit/src/bkit-applicability-audit.test.ts` |

The other 19 matrix rows belong to sub-plans 1, 2 and 4; the routing table is in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md) § Derived Test Matrix.

## 👤 Breaking Changes & Naming Review _(alerts owned by this sub-plan; confirmed once in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1)_

> [!WARNING]
> **`bkit-plan-scope-check-2` is deleted.** The prompt file, its `.bkit/prompts.md` row, its `bkit-plan.md` Step 7 invocation and its `plan-scope-check-2.md` artifact all go. It is the one genuine duplicate in the parallel-sibling set — byte-identical to `-1` apart from `name:` and `model:` (opus vs sonnet), carrying no `Lens:` of its own.
>
> **⚠️ Direct counter-evidence, observed while this very plan was being checked (2026-08-26, n=1).** On identical input, `bkit-plan-scope-check-1` returned `CONCERNS` with **3** failures and `bkit-plan-scope-check-2` returned `PASS` with **0**. So the two prompts do **not** return redundant output in practice, and the "byte-identical therefore redundant" half of the rationale is refuted as stated. What the observation does _not_ establish is that `-2` adds a **dimension**: the divergence runs in the direction of the cheaper model (`-2`, sonnet, effort slot 2) finding strictly less than the dearer one (`-1`, opus), which reads as a subordinate second sample rather than a second lens. That is one run, not a proof, and it cuts both ways — a second sample that sometimes catches what the first missed is exactly the argument for keeping it. **The decision is the human's at this gate**, and it is written up with options as Open Question 8. Task 14 stands unless the human answers otherwise.
>
> Consumer impact: a `.bkit/prompts.md` § Model Overrides row naming `bkit-plan-scope-check-2` becomes inert (it is below `bkit:end`, so `bkit install` never rewrites it and `bkit check` stays clean — the row simply matches nothing). Any consumer tooling globbing `plan-scope-check-*.md` will find one file where it found two.

> [!IMPORTANT]
> **`design-v1-draft.md` gains machine-read structure.** Two new `##` sections carry the design-side applicability signal. Proposed names, both singular-noun section headings consistent with the existing `## Architecture` / `## Data Model` set:
>
> - `## Required Capabilities` — one row per capability the design needs that the stack does not already provide (new dependency, new external system, new service), or `None`. Drives `design-review-1` (buildability) and, transitively, `SPIKE`.
> - `## Runtime Surface Change` — what changes at runtime (new process, new endpoint, new job, new failure mode), or `None`. Drives `design-review-2` (operability).
>
> Both are human-readable design content, not hidden headers — the reviewability of the signal is the point (see Open Question 2).

> [!WARNING]
> **`bkit.sensitivePaths` is this plan's one net-new consumer surface, and it wants an explicit nod rather than passing as a detail.** `#442` § "Net new machinery for the whole issue" is a declared non-goal, and this key is in scope only because it sits inside the confirmed Acceptance Scenario (Process Sketch, three Edge Cases, two `Derived Test Matrix` rows). What it costs: a new consumer `package.json` key, a new `README.md` section, and a permanent config-compatibility obligation — once consumers set it, the shape cannot change without a breaking release. What it buys: the only way a consumer can force a review lens **on** for a path they consider sensitive, which is the safety valve that makes narrowing acceptable at all. It can never drop a lens.

**New names introduced by this sub-plan:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `bkit.sensitivePaths` | consumer `package.json` config key, `string[]` of globs | read by design/plan predicates via `jq -r '.bkit.sensitivePaths // [] \| .[]' package.json`; matched against the draft's planned target paths with bash `case` pattern matching (POSIX-portable, no new dependency — `picomatch` is a `.bkit/src/` engine dep and the predicate runs in orchestrator shell, not in the engine); absent key resolves to `[]`. Documented in `README.md` beside `bkit.githubProject` / `bkit.issueTracker` by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 20 |

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the `PASS|CONCERNS|FAIL` verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract.

## 👤 Open Questions & Assumptions _(confirmed once in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1)_

> [!CAUTION]
> Six of the plan's eight Open Questions are answered here, and the answers change what this sub-plan builds. **Open Questions 3 and 6 have landing sites that are a plan revision, not an in-flight edit** — if the human answers B or C to either, re-run `/bkit-plan` on this FID rather than improvising.

**Assumptions owned by this sub-plan:**

- **Assumption:** the `COMPLEXITY_VERDICT` continuity value is `SINGLE`. The issue text says `NOSPLIT`, but `bkit-plan-complexity-check.md` declares `Verdict: SINGLE | SPLIT` and `bkit-plan.md` Gate 9 asserts `COMPLEXITY_VERDICT` in `SINGLE|SPLIT` → hard-setting `NOSPLIT` would fail that gate on every skip.
- **Assumption:** design Step 8's predicate is `MILESTONE` alone. The issue's second half — "more than one workstream" — is not computable before Step 8 runs, because decomposing into workstreams _is_ Step 8's job. The only downstream consumer of `design-v3-organised.md`'s `WS-N` structure is Step 10, which already gates on `MILESTONE` → if some other consumer of the workstream decomposition exists, skipping Step 8 starves it.
- **Assumption:** a fan-out step whose lenses all skip is itself a skipped step, and records the bare-slug `step-skipped` row rather than N lens rows → if instead it should record N lens rows plus a step row, the audits double-count and `counter_count` still stays honest (it filters `step-done`), but the log grows a row per lens for no added information.

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

- **Open Question 4:** Is `Verdict: PASS` alone sufficient evidence to skip an apply step, or is the `Failures:` count load-bearing? → resolve here; plan already has the count, design does not until [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) Task 8 lands.
  - **Options:** A — gate on `Failures` = 0. Precise: `CONCERNS` with zero findings is legal under the status invariants (`CONCERNS => failures >= 0`), and that combination genuinely has nothing to apply. · B — gate on `Verdict` = PASS. Simpler and needs no new design header; but it runs the apply step on every `CONCERNS`, including the zero-finding ones, so the saving mostly evaporates. · C — gate on both (`PASS` **and** `Failures` = 0). Strictly the most conservative; but it is A with a redundant conjunct, since `PASS => failures = 0` is already an asserted invariant.
  - **Recommended:** A — the count is the actual input to an apply step, and it is why [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) Task 8 adds the `Failures:` header to the design reviewers in the first place.
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

**Open Questions 5** (where the escalation verdict comes from) belongs to [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md).

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

**Chosen: input-presence predicates, applied to design and plan only.** A step runs when the thing it inspects is present. That is machine-checkable, it is auditable after the fact via the `step-skipped` row, and it never deletes a dimension.

**Rejected paths:**

<!-- prettier-ignore -->
| Rejected | Why |
| --- | --- |
| A `NARROW \| STANDARD \| WIDE` scale dial | Collapses several independent facts into one number, then lets arbitrary filename numbering decide which lens survives. On plan Step 5, "NARROW = run 1" keeps the tightness lens (the one most duplicated by Step 7's scope check) and drops both dependency correctness and regression risk. The parallel siblings are not redundant copies — each carries an explicit `Lens:` line — so cutting width by count silently deletes a dimension |
| Reducing width in `bkit-build` Step 10 | `challenge-1` (bugs) and `challenge-2` (security) are different dimensions; dropping `-2` deletes security coverage entirely. `challenge-reconcile` stays unconditional as a consequence — with both challengers always running there are always two reports to merge |
| A `path-override` member in the `decidedBy` enum | A lens forced on by a sensitive-path glob **runs** — it emits `step-done`, not `step-skipped` — so no skip call site could ever carry the literal. The arm would be dead by construction and would red the no-dead-arm audit. Force-on is observable as the lens's ordinary `step-done` row plus the prose-invariant test that the glob arm sits only in a promoting OR position |
| Keeping `bkit-plan-scope-check-2` as a second opinion | Same `Lens:` line, so it samples one dimension twice on a cheaper model. Contested by one observation (see Open Question 8); the deletion stands on "same lens, weaker sample", never on "same output" |

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Width reductions in `bkit-build` Step 10 (`challenge-1`/`-2`) and Step 11 (`challenge-reconcile`) | Genuinely-additive: the issue's own audit reviewed build and concluded "no changes" — the two challengers are different dimensions and reconcile always has two reports to merge | Declared non-goal — `#442` § `bkit-build` — reviewed, no changes |
| Making `bkit-build` Step 4 `build-plan-current` conditional | Genuinely-additive: explicitly dropped from the candidate list by the issue's audit, because a stale-`origin/dev` branch is the case the step exists to catch | Declared non-goal — `#442` § `bkit-build` — reviewed, no changes |
| Step-count reductions in `bkit-debug` and `bkit-ship` | Genuinely-additive: every 🧠 step in both is already conditional; the issue's audit records "no step changes" for debug and "no changes" for ship | Declared non-goal — `#442` § `bkit-debug` / § `bkit-ship` |
| A `NARROW \| STANDARD \| WIDE` scale dial, a skip-precondition enum in prose, a human approval gate on escalation, a new workflow | Genuinely-additive: each is explicitly rejected by the issue's agreed approach | Declared non-goal — `#442` § "Net new machinery for the whole issue" |
| Design Step 3 `ideate-2` / `-3` applicability predicates | Genuinely-additive under Open Question 3's recommended answer: no upstream artifact exists to carry a predicate, and the alternatives either serialise a parallel step or add a subagent the issue ruled out | Open Question 3 — reopen if the human picks option B or C |
| A `complexity-check` applicability predicate on plan Step 9 | Genuinely-additive under Open Question 6's recommended answer. `#442` § `bkit-plan` asks for it ("below the split threshold, `SPLIT` is unreachable"), but the published rule is `SINGLE` = tokens <= 85K **and** tasks <= 12, and no artifact carries a token estimate — so a task-count predicate can never prove the token arm unreachable. `.bkit/stats.jsonl` has 12 `outcome` rows; `taskCount` is 0 on every design/plan row and 55, 55, 55, 92, 119, 119, 129 on build/ship rows, with **no** datapoint between 1 and 54 — zero calibration for the low end | Open Question 6 — reopen once the corpus carries small-plan `taskCount` rows; mirrored as deferral `442-plan-complexity-check-predicate` |

> **Two rows are `Exempt` only conditionally, and the human should see that at Gate 1.** The design Step 3 `ideate-2` / `-3` row and the `complexity-check` predicate row are `Exempt` **because** Open Questions 3 and 6 resolve to option A — and `#442` itself asks for the second one. Neither is `Blocking` as written: each names an explicit plan-revision landing site and each is evidenced (OQ6 carries the `.bkit/stats.jsonl` finding that no `taskCount` datapoint exists between 1 and 54). But if the human answers B or C at Gate 1, that exemption becomes required work parked out of scope, and the plan must be **re-run**, not patched in flight.

> [!CAUTION]
> **Default = in-scope.** An item is `Exempt` ONLY if genuinely-additive — NOT required by `Success Criteria`, an `Acceptance Scenario` / `Derived Test Matrix` row, or a design section (declared non-goals excepted). Mirror each `Exempt` row in `docs/deferrals.jsonl` — done once for the whole plan by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 21.

## Suggested Scope Expansion

None held here. The nine advisory candidates for the whole plan live in [`442-workflow-steps-needed-plan.md`](442-workflow-steps-needed-plan.md) § Suggested Scope Expansion.

> [!CAUTION]
> **Candidates, not scope.** They do NOT become `Agent Execution Runbook` tasks and MUST NOT expand this sub-plan's scope.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — every predicate this sub-plan writes reads only first-party artifacts the workflow itself produced (`plan-v*.md`, `design-v*.md`, `{LABELS}`, `package.json`), so no tracker or web content reaches a `step-skipped` row's `reason`. `design-input.md` / `plan-input.md` carry issue text and are explicitly **not** a predicate source.
- [ ] **New Secret/Env Var** — none. `bkit.sensitivePaths` is a glob list in `package.json`, not a credential; it names paths whose plans warrant extra review, and it is consumer-authored.

_No new routes, DB writes, or PII._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Sub-plans 1 and 2 landed:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) and [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) have every Gate `[x]`. Specifically: Task 5's derived audit is green with an empty lens-level subject set, and Tasks 9 and 10 have made both fan-out steps width-independent. Without Task 9, this sub-plan's first narrow-path run routes to **Failure Path**.
- [ ] **Open Questions 3 and 6 answered A (or the plan re-run):** if the human answered B or C to either, STOP — the landing site is a plan revision, not an in-flight edit. Same for Open Question 8 answered B or C, which removes Task 14 entirely.
- [ ] **Package Management:** No new runtime or dev dependency. `picomatch` is a `.bkit/src/` engine dep and is deliberately NOT used — the predicate runs in orchestrator shell with bash `case`. Verify `pnpm-lock.yaml` still syncs cleanly.
- [ ] **Dependency Versions:** Run `pnpm outdated`; spot-check `npx tsc --version` and `pnpm --version`. `jq` must be present — every predicate's `bkit.sensitivePaths` arm uses it.
- [ ] **Existing-Solution Search (reuse over duplicate):** Confirmed before planning. The skip-arm shape is copied verbatim from [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 4's 28 sites. The prose-audit test shape copies `.bkit/src/bkit-runtime-prose-audit.test.ts`. The `bkit.*` config read path already exists and is covered by `.bkit/src/bkit-config-keys.test.ts` — extended, not duplicated. The one `[NEW]` artifact is a test file; no new engine module.
- [ ] **User Context:** Read/write access to `.bkit/workflows/`, `.bkit/prompts/`, `.bkit/src/`, `.bkit/prompts.md`, `.bkit/workflows.md`, `.bkit/comparison.md`. No missing user information beyond the Open Questions above.
- [ ] **Project Context:** Check `docs/knowledge.jsonl` and `docs/decisions.jsonl`. Load-bearing here: `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary` — it is why every continuity hard-set is a prose variable outside any fence, and why Task 15 asserts placement rather than mere presence.
- [ ] **Testing & Quality:** Aligns with `docs/testing.md` § Tiers — Unit (`*.test.ts`), Integration (`*.integration.test.ts`), Shell (`tests/*.bats`). bkit has no E2E, `@live`, migration or Smoke tier.
- [ ] **Prerequisite Plans:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) and [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md), both complete. [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) follows.

### Conditional _(verify only when applicable)_

- [ ] **Architecture & UI** _(new files)_: the new test file sits beside its peers in `.bkit/src/` per `docs/architecture.md` § Package Boundaries. No new engine module, no new shipped script.
- [ ] **Observability** _(new log points)_: the `applicability` `decidedBy` value gets its first call sites here. Diagnostics keep the existing `[bkit-telemetry]` stderr prefix `_route_die` emits, per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Plan-wide human confirmations recorded:** [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Gate 1's three 👤 items (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions) are `[x]`. _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The `step-skipped` event type is defined in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) § Data Schema Integration; this sub-plan supplies the first call sites carrying `decidedBy: applicability` and the first lens-suffixed `step` values.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — existing `step-done` rows via `route_last_verdict` / `route_last_failures`.
- **Input (Read):** consumer `package.json` — the `bkit.sensitivePaths` key, via `jq -r '.bkit.sensitivePaths // [] | .[]'`.
- **Input (Read):** `.bkit/stats.jsonl` `outcome` rows — read once, for the Open Question 6 calibration finding only; not read at runtime.
- **Output (Write):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — `step-skipped` rows carrying `decidedBy: applicability`, some under lens-suffixed `step` values.

### Data Schema Changes

- **ADD:** consumer `package.json` key `bkit.sensitivePaths: string[]`, default `[]`. Read by design and plan predicates as a force-on override only, via `jq -r '.bkit.sensitivePaths // [] | .[]' package.json`; matched against the draft's planned target paths with bash `case` pattern matching. Documented in `README.md` beside the other `bkit.*` keys by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 20 and covered by `.bkit/src/bkit-config-keys.test.ts` here in Task 15.

## Architecture & Component Changes

**CRITICAL:** Every `[NEW]` states why an existing artifact cannot be evolved. Source-only edits — `.bkit/workflows/*`, `.bkit/prompts/*`, `.bkit/src/*`, `.bkit/*.md`. NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*` mirrors; regenerate them with `bkit install`, batched once at session end by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 22.

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

#### Continuity hard-sets are prose variables, never shell assignments

- Every hard-set (`SPIKE` = FALSE, `DESIGN_REVIEW_FAILURES` = 0) is written as an orchestrator **prose** variable outside any fenced code block, in the corpus's existing `{SPIKE}` substitution style (`bkit-design.md:453,455,486,501,559`; `bkit-plan.md:743,753`).
- **Why the placement is load-bearing:** a `SPIKE=FALSE` assignment inside the skip arm's bash fence is silently inert at the next tool call — shell state does not survive the boundary (`docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`; the still-OPEN `363-auto-route-suffix-github-env-handoff-inert-across-cloud-tool-calls` row is the same class). A guard that only checks "the arm contains `SPIKE` = FALSE" passes on the broken form, so Task 15's audit asserts **placement** as well as value.

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
| `.bkit/version` `canonicalHashes` `:108,:162,:208` | one entry per rendered mirror (`.claude`, `.cursor`, `.opencode`) | regenerated by `pnpm bkit install` in [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 22 — never hand-edited |
| `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/` `bkit-plan-scope-check-2.md` | orphan rendered mirrors | pruned by install. Prune **is** implemented — `bkit-install.ts:808-832` for `.claude` / `.cursor` under the `WRITE_DIRS` allowlist, `bkit-modules.ts:147-165` and `:674-683` for `.opencode/agents`, bkit-prefix only — so a consumer loses the stale agent file on upgrade. [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 22 asserts it rather than assuming it |
| `.bkit/friction.jsonl` (1 historical occurrence) | append-only ledger row | **never edited.** Excluded from every `Done when` assertion |
| `docs/plans/**` | prior plan artifacts | **never edited.** Excluded from every `Done when` assertion |

- **Consequence for the `Done when`:** a blanket `grep -rc 'scope-check-2' .bkit/ docs/` returning zero is unachievable — `.bkit/friction.jsonl` carries a row that must not be edited and `.bkit/version` is only regenerated in [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 22. The assertion is narrowed to the live surface with ledgers and plan artifacts excluded.

### Tests

#### [NEW] `.bkit/src/bkit-applicability-audit.test.ts`

- Asserts: the **derived** sole-emitter continuity set (every gate-read variable whose only assignment site sits in a skippable step or lens carries a hard-set to a member of its own declared enum); that each hard-set sits **outside** any fenced code block; that every predicate names an artifact an earlier step produces; `scope-check-2`'s removal from the live surface; the `decidedBy` enum is exactly three members with no dead arm; the `bkit.sensitivePaths` arm appears only in a promoting OR position; the tabulated plan-side predicate set (which steps carry a condition, which do not).
- Its three routing rows — `PLAN_ESCALATE`'s enum and terminal TRUE-route, plan Step 3's two-artifact assertion, and debug's `NO-REPRO` route — are added to this same file by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 19, once the constructs they assert exist.
- **Why a new file rather than extending `bkit-skip-recording-audit.test.ts`:** that file asserts **presence** of a skip call site per conditional subject and must stay green from sub-plan 1 onward. Enum completeness and continuity are properties that only hold once predicates exist, so folding them in would have left the suite red across two sub-plans — the backwards dependency [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) Task 5 explicitly refuses.

#### [MODIFY] `.bkit/src/bkit-config-keys.test.ts`

- Add the `bkit.sensitivePaths` default-resolution row beside the existing `bkit.*` key contracts: an absent key resolves to `[]` through the same read path the workflow uses, and an empty list matches no path.

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

> [!CAUTION]
> **Default = `DELETE`.** Each `DELETE` row above is mirrored as `[DELETE]` in `Architecture & Component Changes` and as a removal task in `Agent Execution Runbook` (Task 14). The plan's sixth supersession row — `.bkit/workflows.md:23`'s step count — belongs to [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md), alongside Task 17 that invalidates it.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md:511,540,654,829` | Rewrite the artifact-kind row, artifact inventory row, subagent table row and Plan Phase step table row that name `plan-scope-check-2` to the single checker; drop `(parallel)` at `:829` |
| `.bkit/prompts.md` (deletions only) | Delete the `bkit-plan-scope-check-2` § Special Behaviors row (`:276`), Models table row (`:171`), effort-tier `medium` list mention (`:104`) and Cursor cross-family footnote mention (`:388`). _(The four **content** updates — `bkit-design-generate`'s new sections, the two design reviewers' `Failures:`, `bkit-plan-generate`'s second artifact, and § Special Behaviors' parallel-fan-out / stubbed-output rewrites — are owned by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 21, batched because catalog parity is asserted file → doc for existence only.)_ |
| `.bkit/comparison.md` | Delete the `:173` row describing `bkit-plan-scope-check-2` |
| `README.md` · `.bkit/workflows.md` § Rationale (four bullets) · `docs/testing.md` · the JSONL ledgers | No change here — all owned by [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Tasks 20 and 21, because the constructs they document are written across sub-plans 3 and 4 and a split update would ship half a doc |
| `.agents/docs.md` | No change — no new doc file; `.bkit/*.md` are bkit-authoring docs and are not catalog rows |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | No persistent-state schema change beyond the consumer `package.json` key, which is additive and optional |
| **Code** | `git revert {COMMIT}`, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional. Reverting Task 14 also restores the `bkit-plan-scope-check-2.md` mirror on the next install |
| **Partial rollback** | Revertible independently of [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) and [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) | Holds **only because** every continuity hard-set lives here, alongside the skip arm that carries it. Reverting only the predicates restores full width while keeping the skip log, the tolerant read lists and the partial-width fan-out shape (inert at full width, harmless). A hard-set left in sub-plan 2 would be stranded on a skip arm that no longer exists — which is why Task 12 and Task 13, not [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) Task 9, own them |
| **Risk window** | None — no deploy. A consumer on the released version is unaffected until they run `bkit upgrade` | A consumer who has set `bkit.sensitivePaths` and then downgrades keeps an inert `package.json` key; nothing reads it and nothing breaks |

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate. Check `[x]` tasks as you go.
> **Step Isolation:** Complete each task fully (verification + checkbox) before next task.
> **Integration Shape:** this sub-plan changes behaviour, so a commit per task reads well in review — advisory only, NEVER a gate; delivering every task in ONE PR is always correct. Do NOT specify a merge method; that is not a plan choice.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Plan-verify reads this line and asserts against it before ticking `[x]`.
>
> Every task also carries a `Requires:` line naming the tasks that must complete first. There are no cycles, and no edge points backwards across a sub-plan boundary. Tasks 5, 9 and 10 are in [`442-workflow-steps-needed-plan-1.md`](442-workflow-steps-needed-plan-1.md) and [`442-workflow-steps-needed-plan-2.md`](442-workflow-steps-needed-plan-2.md) and must already be `[x]`.

### Wave 3 — applicability predicates (design and plan only)

- [ ] **Task 11: Give the design doc the two signal sections.** _Requires: none (safe alone)._ Add `## Required Capabilities` and `## Runtime Surface Change` to `bkit-design-generate.md`'s output format with the corpus's `PENDING` annotation, plus the Process steps that populate them. **Done when:** both sections are in the output format between `## Architecture` and `## Data Model`, each annotated `initially set to \`PENDING\``, and each has a Process step naming it.

- [ ] **Task 12: Wire the design predicates and their continuity hard-sets.** _Requires: Tasks 5, 9, 10, 11._ Add the two `**Run lens only if**` conditions to design Step 5's two lens bullets, the step-level `**Skip if**` for the both-lenses-FALSE case, and the `**Run only if**` conditions to Steps 7 and 8 — each with the Task-4 skip-arm shape carrying `decidedBy: applicability`, the tabulated `reason`, and the lens-suffixed `step` value where it is a lens. Carry the continuity hard-sets here, where the arms now exist: the `design-review-1` lens arm sets `SPIKE` = FALSE; the Step 5 step-level arm sets `DESIGN_REVIEW_FAILURES` = 0. Both are orchestrator **prose** variables written outside any bash fence. Leave Step 3's three ideate lenses unconditional per Open Question 3 option A. **Done when:** design Step 5 carries two `**Run lens only if**` lines and one step-level `**Skip if**`, and Steps 7 and 8 each carry a `**Run only if**` line, every one naming a bash-countable condition over a named artifact; the `design-review-1` lens arm contains `SPIKE` = FALSE and the Step 5 step-level arm contains `DESIGN_REVIEW_FAILURES` = 0; **each hard-set sits outside any fenced code block** and each assigned value is a member of the enum its own gate asserts (`TRUE|FALSE`; a non-negative integer for the failure count); no arm assigns `NOSPLIT`; `grep -c 'Run only if' .bkit/workflows/bkit-design.md` is 2 higher than at HEAD and `grep -c 'Run lens only if' .bkit/workflows/bkit-design.md` is 2; Step 3 is unchanged in `git diff`.

- [ ] **Task 13: Wire the plan predicates.** _Requires: Tasks 5, 9, 10._ Add the two `**Run lens only if**` conditions to plan Step 5's `plan-review-2` and `plan-review-3` bullets and the `**Run only if**` conditions to Steps 6 and 8, each with its skip arm carrying `decidedBy: applicability` and, for a lens, the lens-suffixed `step` value. Each lens condition takes the two-arm form `(base condition) OR (bkit.sensitivePaths glob match)`; the glob arm can only add the lens, and a forced-on lens runs and writes **no** skip row, so no call site carries `path-override`. Leave Step 9 unconditional per Open Question 6 option A — it therefore has no skip arm and no `COMPLEXITY_VERDICT` hard-set; `COMPLEXITY_VERDICT` is not a sole emitter on a skippable step. Build's `CHALLENGE_VERDICT` needs no change either — build Step 11 stays unconditional because both challengers always run. **Done when:** plan Step 5 carries two `**Run lens only if**` lines and Steps 6 and 8 each carry a `**Run only if**` line; both lens conditions contain both arms, OR'd — never AND'ed, never negated — so the glob arm can only add the lens; no `route_append_step_skipped` call site anywhere in the corpus passes `path-override`; Step 9 has no `**Run only if**`, no skip arm and no `COMPLEXITY_VERDICT` assignment, and no arm in any workflow assigns `NOSPLIT`; the plan workflow reads `bkit.sensitivePaths` via `jq -r '.bkit.sensitivePaths // [] | .[]' package.json` and matches with bash `case`, so an absent key yields `[]` and matches nothing.

- [ ] **Task 14: Delete `bkit-plan-scope-check-2` and every caller.** _Requires: Tasks 9, 13._ **Gated on Open Question 8** — the deletion's justification is "same lens, weaker sample", not "same output"; one observation (this plan's own scope check: `-1` `CONCERNS` / 3, `-2` `PASS` / 0) refutes the output-redundancy claim. Under OQ8's default answer A the task executes exactly as written; a B or C answer removes it and is a plan revision, not an in-flight edit. Remove the prompt file; collapse plan Step 7 to the single checker (invocation, artifact assertion, `SCOPE_VERDICT` / `SCOPE_FAILURES` derivation, the status row's `artifacts` array, the tracker comment, Gate 7's items); and update every site in the Architecture § caller inventory — `.bkit/prompts.md:104,171,276,388`, `.bkit/workflows.md:511,540,654,829`, `.bkit/comparison.md:173`. Never touch `.bkit/friction.jsonl`, `.bkit/version` or `docs/plans/**`. **Done when:** `.bkit/prompts/bkit-plan-scope-check-2.md` does not exist; `grep -rn 'scope-check-2' .bkit/prompts/ .bkit/workflows/ .bkit/prompts.md .bkit/workflows.md .bkit/comparison.md` returns zero matches — the live surface only, with append-only `*.jsonl` ledgers, `.bkit/version` (regenerated in Task 22) and `docs/plans/**` deliberately excluded because editing them is prohibited; `git diff` shows no change to `.bkit/friction.jsonl`; `npx vitest run .bkit/src/bkit-catalog-parity.test.ts` passes; plan Step 7's `SCOPE_VERDICT` derives from one artifact.

- [ ] **Task 15: Gate wave 3 with a derived applicability audit.** _Requires: Tasks 12, 13, 14._ Create `.bkit/src/bkit-applicability-audit.test.ts` covering the continuity hard-sets, the predicate-artifact linkage, the enum, the `sensitivePaths` force-on-only property, the tabulated predicate set and `scope-check-2`'s removal (its escalation and debug rows land in Task 18 and Task 19). Add the `bkit.sensitivePaths` default-resolution row to `.bkit/src/bkit-config-keys.test.ts` beside the existing `bkit.*` key contracts. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-applicability-audit.test.ts` passes its rows — sole-emitter continuity derived from the files (not an enumerated list, so a newly-added sole emitter with no hard-set reds it), hard-set placement outside any fenced block, predicate-artifact linkage, `decidedBy` literals forming exactly the three-member enum with no dead arm, the `sensitivePaths` arm appearing only in a promoting OR position, the tabulated plan-side predicate set, and `scope-check-2`'s removal from the live surface; introducing a predicate that reads an unemitted header reds it; moving one hard-set inside a bash fence reds it; adding a fourth `decidedBy` literal reds it; **each design predicate's heading literal — `## Required Capabilities` and `## Runtime Surface Change` — appears verbatim in `bkit-design-generate.md`'s output format**, so renaming a heading in the prompt reds the guard instead of silently pinning both predicates FALSE, skipping both lenses forever and leaving every other guard green; **each apply-step condition reads the failure count, never a verdict literal** (`REVIEW_FAILURES` / `DESIGN_REVIEW_FAILURES` / `SCOPE_FAILURES` `>= 1`), so rewriting one as `REVIEW_VERDICT != PASS` reds it — that rewrite otherwise satisfies every other guard while silently reverting Open Question 4 to option B, and `CONCERNS` with `failures = 0` is exactly the case it would break; **the derived count of unconditional 🧠 steps in `bkit-plan.md` is exactly five**, so Success Criteria, the `Concrete Example`, the plan-side predicate table and Manual Verification Step 1 cannot drift apart; `npx vitest run .bkit/src/bkit-config-keys.test.ts` proves an absent `bkit.sensitivePaths` resolves to `[]` through the same read path the workflow uses.

> **Note on Task 15's `Done when`:** it names Tasks 18 and 19 as owning the escalation and debug rows. Both live in [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md); this sub-plan's Task 15 must NOT attempt them, because the constructs they assert do not exist yet.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **No bolt-on / no gate-weakening:** the one `[NEW]` (`bkit-applicability-audit.test.ts`) is justified against extending `bkit-skip-recording-audit.test.ts` — that file must stay green from sub-plan 1 onward and enum completeness only holds once predicates exist; no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Source-only edits:** no file under `.claude/`, `.cursor/` or `.opencode/` was hand-edited; every mirror change comes from `bkit install` in [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 22.
- [ ] **Derived sets, never hand-written lists:** the audit derives its subject sets from the files under test, so a newly-added predicate or sole emitter is covered-or-failing by construction.
- [ ] **Append-only ledgers untouched:** `git diff` shows no change to `.bkit/friction.jsonl`, `.bkit/version` or anything under `docs/plans/**`.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Workflow / prompt prose** — Vitest markdown-invariant tests. Assert the **rule** (a call site, a flag, an `if:` shape), never the sentence that explains it; a guard pinned to prose reds when someone improves a comment and passes for years after the rule is deleted. This corpus is the one sanctioned exception where wording _is_ the deliverable: a header declaration or a `**Run only if**` operator is behaviour, and asserting on it is correct.
> - **Prove each guard can fail** — put the bug back and watch it red before trusting it. For this sub-plan that means: move a hard-set inside a fence, add a fourth `decidedBy` literal, rename a design heading in the prompt, and rewrite an apply condition as `!= PASS`. Each must red.
> - **No browser tier** — bkit has no UI; nothing here drives a browser.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all eight rows owned by this sub-plan map to Task 15. Count the rows at build time and confirm the mapping is total — do not trust a number written in prose.
- [ ] **Update existing tests:** `.bkit/src/bkit-config-keys.test.ts`; plus any assertion in `.bkit/src/bkit-catalog-parity.test.ts` that moves with the deleted prompt.
- [ ] **Write new tests:** `.bkit/src/bkit-applicability-audit.test.ts`.
- [ ] **Verify observability:** `decidedBy: applicability` gets its first call sites here; its failure diagnostics keep the `[bkit-telemetry]` stderr prefix `_route_die` already emits, per `docs/observability.md`.
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

- [ ] **Local gate suite for this sub-plan:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta`, plus `pnpm vitest run` (full suite, never scoped) and `npx bats tests/*.bats`. Do NOT weaken any gate to pass. _(The whole-plan gate run, including `pnpm bkit check` after the mirror regen, is [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md) Task 22.)_
- [ ] **Test Synchronization:** no E2E tier exists in this repo. Do re-run `.bkit/src/bkit-catalog-parity.test.ts`, `.bkit/src/bkit-verdict-vocabulary.test.ts`, `.bkit/src/bkit-skip-recording-audit.test.ts` (its lens-level subject set becomes non-empty for the first time here), `.bkit/src/bkit-input-tolerance-audit.test.ts`, `.bkit/src/bkit-runtime-prose-audit.test.ts`, `.bkit/src/bkit-block-locality-audit.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`, `.bkit/src/bkit-untrusted-input-coverage.test.ts`, `.bkit/src/bkit-telemetry-workflow-writers.test.ts` and `.bkit/src/bkit-config-keys.test.ts`.
- [ ] **Build Configuration:** none — no new mock files or test configs; the new test file matches the existing `.bkit/src/*.test.ts` include glob.
- [ ] **Prose-audit tier (`.bkit/src/bkit-applicability-audit.test.ts`):** for each new guard, reintroduce the defect once and confirm it reds. A guard that has never failed is indistinguishable from a guard that cannot.
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

- [ ] **Predicate dry-read.** Without running a workflow, execute each predicate's bash by hand against a real `plan-v1-draft.md` and a real `design-v1-draft.md` and confirm each returns the value the tables above say it should — including with `bkit.sensitivePaths` absent (`jq` yields nothing, no glob matches) and with a glob that matches (the lens is promoted, not demoted).

_The plan's seven whole-feature Manual Verification steps (narrow-path, full-width, partial-width, sensitive-path force-on, escalation, debug entry, consumer upgrade) run once at the end and live in [`442-workflow-steps-needed-plan-4.md`](442-workflow-steps-needed-plan-4.md). Four of them — narrow-path, full-width, partial-width and sensitive-path force-on — are the direct live observation of this sub-plan's work._
