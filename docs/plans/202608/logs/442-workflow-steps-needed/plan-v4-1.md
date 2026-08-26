<!-- bkit:anchor
baseSha: e1616f88610ca307b85928b6df003178c37964a5
baseRef: origin/dev
-->

# Run Only Workflow Steps Tasks Actually Need — Sub-Plan 1 of 4: Step-Skipped Row Recording

**Parent Plan:** [`plan-v4-split.md`](plan-v4-split.md)

**Siblings:** [`plan-v4-2.md`](plan-v4-2.md) (input tolerance) · [`plan-v4-3.md`](plan-v4-3.md) (applicability predicates) · [`plan-v4-4.md`](plan-v4-4.md) (routing, ledgers, docs, mirrors)

**Position:** first sub-plan executed. Its Gate 1 carries the three 👤 human confirmations for the whole plan; sub-plans 2, 3 and 4 assert that this gate passed rather than repeating the confirmations.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

Every feature pays the same subagent bill regardless of size. `/bkit-design` fires 10 subagent invocations at full width and `/bkit-plan` fires 11; on a small, well-scoped change most of those lenses read an artifact that contains zero instances of what they iterate over, return `PASS` having looked at nothing, and cost a full model turn anyway. The cost that matters is not tokens — the pipeline is heavy enough that people route around it, and work done outside bkit leaves no artifacts, no ledger rows and no gates.

**This sub-plan does item 1 of the parent plan's four:** it makes a skipped step **visible**. A `step-skipped` status row, retrofitted to all 28 steps that are already conditional, so a deliberate skip stops being indistinguishable from a crash.

It is **pure logging**. No step's condition changes here, no lens condition is added here, and no behaviour changes. The width cuts land in [`plan-v4-3.md`](plan-v4-3.md), and the tolerance that makes them safe lands in [`plan-v4-2.md`](plan-v4-2.md).

Two things this sub-plan builds are consumed by the later ones, and both are named here so the later work has something to point at:

- The **`**Run lens only if**` construct** — a sub-step condition line attached to an individual subagent bullet, distinct from the step-header `**Run only if**` / `**Skip if**`, and separately greppable (`^\s*-?\s*\*\*Run lens only if\*\*`). Task 3 documents it; sub-plan 3 is the first to write one into a workflow file.
- The **lens-suffixed `step` value** on the row (`plan-review-2`, `design-review-1`), so a lens skip is distinguishable from the step skip that would carry the bare slug. Task 1 accepts it, Task 5's audit asserts it.

Task 5's audit derives **both** subject sets from the workflow files — step-level and lens-level — so a lens condition added later cannot be invisible to the guard meant to prove it recorded its skip.

**Related Issues:**

- `#442 — Run only workflow steps tasks actually need (open)` — this plan's issue.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.
>
> **Scope of this confirmation:** confirming here confirms the whole plan across all four sub-plans. The full Narrative, Success Criteria, Process Sketch and Concrete Example are in [`plan-v4-split.md`](plan-v4-split.md); the slices this sub-plan owns are reproduced below.

### Narrative _(inherited from the parent plan — do not rewrite)_

⚠️ No `{FID}-design.md` exists for this FID — this is a standalone plan. Narrative and Success Criteria are derived from the issue's agreed-approach comment, which is a complete statement of intent, and are the human's to confirm rather than inherit.

A developer running `/bkit-plan` on a small, single-task change gets a reviewed plan back after five subagent invocations instead of eleven, with no lens that had something to look at dropped; and when they later ask "did this run ever get a dependency-correctness pass?", the status log answers with a row that says it was skipped and why.

### Success Criteria advanced by this sub-plan

- A skipped step **or a skipped lens inside a fan-out step** writes a `step-skipped` row naming the step (lens-suffixed when a lens), the absent input, and who decided — never nothing, never a `step-done`. _(This sub-plan builds the emitter, the schema, the 28-step retrofit and the derived audit; [`plan-v4-3.md`](plan-v4-3.md) supplies the lens-level call sites.)_

The remaining four Success Criteria are in [`plan-v4-split.md`](plan-v4-split.md) and are advanced by sub-plans 2, 3 and 4.

### Process Sketch _(slice owned here)_

- **WHEN** a lens step's input is absent **→ THEN** the step does not run and a `step-skipped` row records the step, the reason and the decider.

### Concrete Example _(evidence this sub-plan produces)_

**Setup:** A maintainer of a repo with bkit installed opens an issue for a one-file copy fix: change a CLI help string. No new dependency, no runtime surface, no schema, no dependency edges between tasks. `bkit.sensitivePaths` is unset. They run `/bkit-plan #900`.

**Steps (the log this sub-plan makes possible):**

1. The run skips `plan-review-2`, Step 6 `plan-update`, Step 8 `plan-update` and Step 10 `plan-complexity-split`.
2. `status.jsonl` carries four `step-skipped` rows, each naming the absent input, one of them under the lens-suffixed `step` value `plan-review-2`.
3. `jq -r 'select(.type=="step-skipped") | "\(.step)\t\(.decidedBy)\t\(.reason)"'` over the file reports all four.

**Outcome:** the run is auditable — no lens was dropped that had anything to read, and the log proves which ones were and why. The full six-invocation narrative is in [`plan-v4-split.md`](plan-v4-split.md) § Concrete Example.

### Edge Cases _(rows owned by this sub-plan)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Two workflow runs append `step-skipped` rows for the same step under `merge=union` | Rows duplicate harmlessly — the type is not folded, so no reducer double-counts it; readers filter on `type` |
| Two lenses of one fan-out step skip inside the same wall-clock second | Both reducers key non-`step-done` events as `W {type} {workflow} {at}` with no `step` field (`bkit-status-fold.sh:34`, `bkit-status.ts:62-65`), so the two rows collapse to one in the deduped stream. Both raw lines survive in `status.jsonl` and a `jq`-over-raw-lines reader sees both; only the folded view collapses. Harmless today because the fold discards the type entirely — but it bounds what any future skip-reading consumer can see from the fold, and this plan does not change the dedup key |
| Attempt counters near a skipped step | `counter_count` reads the folded run's `steps` array, which only `step-done` populates, so a skip cannot inflate an attempt |

### Derived Test Matrix _(rows owned by this sub-plan)_

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
| Every lens-level skip call site passes a lens-suffixed `step` value matching an invoked subagent's name-suffix in that same step, never the bare step slug | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-skip-recording-audit.test.ts` |
| Every `reason` literal at a `route_append_step_skipped` call site names an absent input drawn from the tabulated predicate set — no size-judgement wording (`small`, `simple`, `trivial`, `minor`, `narrow`) | Unit (Vitest, markdown-invariant) | `.bkit/src/bkit-skip-recording-audit.test.ts` |

The remaining 19 matrix rows are in sub-plans 2, 3 and 4; the routing table is in [`plan-v4-split.md`](plan-v4-split.md) § Derived Test Matrix.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix — here and in [`plan-v4-split.md`](plan-v4-split.md). They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This confirmation covers the whole plan; the alerts owned by sub-plans 2, 3 and 4 are in their files, and the routing table is in [`plan-v4-split.md`](plan-v4-split.md).

> [!WARNING]
> **`step-skipped` is a new `status.jsonl` row type.** It is deliberately NOT folded — the reducer's fallthrough arm ignores unrecognised types, the same treatment `runtime-resolved`, `transport-fallback` and `close-transport` already get, in **both** reducers (`.bkit/src/bkit-status.ts` `fold` and the shell `BKIT_STATUS_FOLD` in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34`). Any consumer reader that assumes a closed type set, or that counts raw lines rather than folding, will see rows it does not recognise. Readers that fold, or that filter on `type`, are unaffected.

> [!WARNING]
> **A `step-skipped` row's `step` may be lens-suffixed.** For a skipped lens inside a fan-out step the value is the invoked subagent's suffix (`plan-review-2`, `design-review-1`), not the step's `step-done` slug (`plan-review`, `design-review`). Consequence: one step can emit a `step-done` under the bare slug **and** one or more `step-skipped` rows under lens-suffixed values in the same run. Any reader that assumes `step` values are drawn from the `step-done` slug set will not match lens rows. `counter_count` is unaffected — it filters `type=="step-done"` (`.bkit/scripts/bkit-counter-bus.sh:95`).

**New names introduced by this sub-plan:**

<!-- prettier-ignore -->
| Name | Kind | Where |
| --- | --- | --- |
| `route_append_step_skipped` | shell function | `.bkit/templates/.bkit/scripts/bkit-status-route.sh` |
| `step-skipped` | `status.jsonl` row `type` | workflow skip arms; documented in `.bkit/workflows.md` § Event types |
| `caller-flag` / `upstream-verdict` / `applicability` | closed `decidedBy` enum — **three** members. `path-override` is deliberately NOT a member: a lens forced on by a sensitive-path glob *runs*, so it emits `step-done` and never a skip row; a fourth arm would be dead by construction and would red the no-dead-arm audit | same |
| `**Run lens only if**` | workflow-prose sub-step condition marker, distinct from the step-header `**Run only if**` / `**Skip if**` | `.bkit/workflows/bkit-design.md`, `bkit-plan.md`; documented in `.bkit/workflows.md` § Common Workflow Anatomy |

**No breaking change to:** `bkit-build.md:206` plan-required invariant, the `PASS|CONCERNS|FAIL` verdict vocabulary, attempt-counter derivation, the fold reducer's output shape, or any `bkit install` / `bkit check` file-format contract.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions — here and in the sibling sub-plans indexed by [`plan-v4-split.md`](plan-v4-split.md).

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this plan relies on. Each unresolved question is a risk — a wrong assumption breaks everything downstream. This confirmation covers all four sub-plans; the eight Open Questions live in sub-plans 3 and 4, routed by [`plan-v4-split.md`](plan-v4-split.md).

**Assumptions owned by this sub-plan:**

- **Assumption:** `step-skipped` stays out of the fold, following the `runtime-resolved` / `transport-fallback` / `close-transport` precedent (documented in the event-type table, absent from the `StatusEvent` union in `bkit-status.ts`) → if it were folded instead, `counter_count` would start counting skips as attempts and every attempt-bounded loop in build and debug would mis-terminate.
- **Verified finding (was an assumption):** `.bkit/scripts/*` ship via the core template directory walk as Tier-1 force-overwrite files, so extending the existing `bkit-status-route.sh` needs no `bkit-manifest.ts` row and no `bkit-modules.ts` change. Evidence: `.bkit/src/bkit-manifest.ts:723,741,745` carry explicit rows **only** for `.bkit/scripts/bkit-slop-*.{mjs,sh}` and the dependabot / lint module files, each commented as "moved OUT of the core template walk (#265) … See `CORE_TEMPLATE_PATH_EXCLUDE`". `bkit-status-route.sh` has **no** manifest row and is not in `CORE_TEMPLATE_PATH_EXCLUDE`, which is exactly the positive evidence the walk covers it. No residual risk.
- **Assumption:** build, debug and ship keep every step they have today; their 24 conditional steps gain skip logging only → if the reviewer disagrees and wants width cuts there, item 3 grows by three workflows.

**Open Questions:** none owned here. Tasks 1–5 execute unconditionally under every answer to Open Questions 1–8, because this sub-plan adds no predicate and changes no condition. The one interaction to know about: Task 5 deliberately does **not** assert `decidedBy` enum completeness, because `applicability` gets its first call site in [`plan-v4-3.md`](plan-v4-3.md) Task 12 — asserting it here would leave the suite red across two sub-plans.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption — here and in the sibling sub-plans indexed by [`plan-v4-split.md`](plan-v4-split.md).

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Selection Rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff / lowest cost-of-change. In-scope work = complete or explicitly moved to `Out of Scope` — no 90% solutions or silent shortcuts.

**Chosen for this sub-plan: extend the existing routing script, keep the row out of the fold, and gate the retrofit with a derived audit rather than a hand-written list.**

**Rejected paths:**

<!-- prettier-ignore -->
| Rejected | Why |
| --- | --- |
| Folding `step-skipped` into the run array | Would make skips indistinguishable from attempts to `counter_count`, breaking every attempt-bounded loop in build and debug |
| A new skip-precondition enum in the workflow prose | `decidedBy` on the row is the enum; a second one in prose would be a parallel vocabulary to keep in sync |
| A new shell script for the row emitter | `bkit-status-route.sh` already owns durable `status.jsonl` reads and writes (`route_append_debug_mode`, `route_append_push_mode`) and already has the `_route_die` / `_route_need_file` fail-closed helpers. Extending it costs no manifest row, no uninstall surface and no new drift target |
| Recording a force-on as a separate `status.jsonl` row type | A second additive audit type for one boolean the `step-done` row already implies. The observable question — "can a glob ever drop a lens?" — is a property of the workflow prose, and a markdown-invariant test answers it at build time rather than after the fact |

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Extending the status-hole detector beyond ship to design / plan / build / debug | Plan-sized: needs a per-workflow path model (each workflow's routing branches), a corpus sweep to seed each expected set, and a fail-open→gate promotion policy per workflow — new machinery, not a mechanical edit | Own cycle — follow-up issue |
| Promoting the status-hole detector from advisory to a blocking gate | Already deferred with an explicit promotion condition (one release of fail-open signal without muting) | Existing deferral `384-promote-status-hole-detector-from-advisory-to-gate` |

> [!CAUTION]
> **Default = in-scope.** An item is `Exempt` ONLY if genuinely-additive — NOT required by `Success Criteria`, an `Acceptance Scenario` / `Derived Test Matrix` row, or a design section (declared non-goals excepted). Mirror each `Exempt` row in `docs/deferrals.jsonl` — done once for the whole plan by [`plan-v4-4.md`](plan-v4-4.md) Task 21.

## Suggested Scope Expansion

None held here. The nine advisory candidates for the whole plan live in [`plan-v4-split.md`](plan-v4-split.md) § Suggested Scope Expansion.

> [!CAUTION]
> **Candidates, not scope.** They do NOT become `Agent Execution Runbook` tasks and MUST NOT expand this sub-plan's scope.

## Security & Privacy

> Reference: `docs/security.md`. Check all that apply; skip inapplicable rows.

- [ ] **User Input** — the `reason` string on a `step-skipped` row is written into `status.jsonl`, which is committed and merged to `dev`. Every predicate reads only first-party artifacts the workflow itself produced (`plan-v*.md`, `design-v*.md`, `{LABELS}`, `package.json`), so no tracker or web content reaches the row. The helper must still pass `reason` through `jq --arg` rather than string interpolation, so a reason containing a quote or backslash cannot emit an unparseable line — one bad row makes the whole run's status file unreadable to every `jq -s` consumer, not just that entry.

_No new routes, DB writes, secrets or PII. The only untrusted-input surface (`design-input.md` / `plan-input.md`, which carry issue text) is read by subagents under the existing standing `External input:` header bullet and is never used as a predicate source._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core _(always verify)_

- [ ] **Package Management:** No new runtime or dev dependency. Verify `pnpm-lock.yaml` still syncs cleanly after the branch is rebased.
- [ ] **Dependency Versions:** Run `pnpm outdated`; spot-check `npx tsc --version` and `pnpm --version`. `jq` and `bats` must be present — the new shell helper and its bats suite depend on both.
- [ ] **Existing-Solution Search (reuse over duplicate):** Confirmed before planning. `grep -rn 'step-skipped' .bkit/` returns nothing, so the row type genuinely does not exist. The emitter reuses `bkit-status-route.sh`, which already owns `route_append_debug_mode` / `route_append_push_mode` and the fail-closed `_route_die` / `_route_need_file` helpers — no new script. The prose-audit test shape copies `.bkit/src/bkit-runtime-prose-audit.test.ts`. Every `[NEW]` artifact below is a test file; no new engine module.
- [ ] **User Context:** Read/write access to `.bkit/workflows/`, `.bkit/templates/.bkit/scripts/`, `.bkit/src/`, `.bkit/workflows.md`, `tests/`. No missing user information.
- [ ] **Shipping walk verified (not assumed):** `.bkit/src/bkit-manifest.ts:723,741,745` carry rows only for the `CORE_TEMPLATE_PATH_EXCLUDE`d slop / dependabot / lint scripts; `bkit-status-route.sh` has no row, so the core template walk ships it. Confirm with `grep -n 'bkit-status-route' .bkit/src/bkit-manifest.ts` returning nothing before Task 1.
- [ ] **Project Context:** Check `docs/knowledge.jsonl` and `docs/decisions.jsonl`. Relevant established decisions: `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`, `58-status-fold-sourced-once-from-shared-script`, `58-followup-routing-state-reread-from-status-jsonl`, `341-runtime-enum-and-measured-sleep`, `384-tier3-promotion`. No existing decision covers skip recording.
- [ ] **Testing & Quality:** Aligns with `docs/testing.md` § Tiers — Unit (`*.test.ts`), Integration (`*.integration.test.ts`), Shell (`tests/*.bats`). bkit has no E2E, `@live`, migration or Smoke tier, so no row in the matrix claims one.
- [ ] **Prerequisite Plans:** None. This is the first sub-plan; [`plan-v4-2.md`](plan-v4-2.md), [`plan-v4-3.md`](plan-v4-3.md) and [`plan-v4-4.md`](plan-v4-4.md) follow it.

### Conditional _(verify only when applicable)_

- [ ] **Architecture & UI** _(new files)_: New test files sit beside their peers in `.bkit/src/` and `tests/` per `docs/architecture.md` § Package Boundaries. No new `.bkit/src/` engine module and no new `.bkit/templates/.bkit/scripts/` file.
- [ ] **Observability** _(new log points)_: The `step-skipped` row is the new observable. Its diagnostics use the existing `[bkit-telemetry]` stderr prefix that `_route_die` already emits — load-bearing for log-drain grep per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section above (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section above (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section above (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Security & Privacy checked:** All applicable `Security & Privacy` rows verified.
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

> This Gate 1 is the plan-wide human gate. [`plan-v4-2.md`](plan-v4-2.md), [`plan-v4-3.md`](plan-v4-3.md) and [`plan-v4-4.md`](plan-v4-4.md) assert it passed rather than re-asking.

## Data Schema Integration

No database. bkit's persistent state is `status.jsonl` (per-FID workflow event log) and the JSONL ledgers; the schema work here is to the event log.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — existing `step-done` rows (for `Failures` / verdict reads via `route_last_verdict` / `route_last_failures`) and `runtime-resolved` rows (unchanged).
- **Output (Write):** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` — one new `step-skipped` row per skipped conditional step.

### Data Schema Changes

- **ADD:** `status.jsonl` event type `step-skipped` — `{type:"step-skipped", workflow, step, reason, decidedBy, at, parentSha}`.
  - `workflow` ∈ `design|plan|build|debug|ship` (validated at the write site, same `case` as `decidedBy`); `reason` is free text naming the **absent input** (`"zero declared dependency edges"`, `"no new capability required"`, `"zero review findings"`), never a size judgement; `decidedBy` ∈ `caller-flag|upstream-verdict|applicability` — **three** members, no `path-override` (a forced-on lens runs and emits `step-done`); `at` is ISO-8601 UTC; `parentSha` is `git rev-parse HEAD` at step start.
  - **`step` is two-valued by construction.** For a whole-step skip it is the same kebab slug the step's `step-done` row would carry (`plan-review`, `design-spike`, `ship-conflict-resolve`). For a **lens** skip inside a fan-out step it is the invoked subagent's suffix (`plan-review-2`, `plan-review-3`, `design-review-1`, `design-review-2`). One step may therefore emit a `step-done` under the bare slug and one or more `step-skipped` rows under lens-suffixed values in the same run. `counter_count` is unaffected — `.bkit/scripts/bkit-counter-bus.sh:95` filters `type=="step-done"`.
  - **Not folded.** Both reducers' fallthrough arms ignore it — `.bkit/src/bkit-status.ts` `fold` (the reference implementation) and the shell `BKIT_STATUS_FOLD` in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34` (the copy workflows actually execute) — exactly as they ignore `runtime-resolved`, `transport-fallback` and `close-transport`. It therefore does not enter `WorkflowRun.steps`, does not affect `counter_count` / `counter_current`, and is absent from the `StatusEvent` union in `.bkit/src/bkit-status.ts` — consistent with the three existing additive audit rows. Both reducers are covered by a test row; the shell one is the merge-relevant copy.
  - **Dedup collapse is expected, not a defect.** `identity()` keys any non-`step-done` event as `W {type} {workflow} {at}` with **no** `step` field (`bkit-status.ts:62-65`, `bkit-status-fold.sh:34`). Two lens skips inside the same fan-out step sharing a second-resolution `at` collapse to one event _inside the fold_ before the reducer sees them. Harmless today — the fold discards the type regardless — and both raw lines remain in `status.jsonl` for any `jq`-over-raw-lines reader. Recorded here because it bounds what the future skip-reading consumer named under `Future-phase recommendations` can ever see from the folded view. Changing the dedup key is **out of scope** (it is `#58`'s counter contract).
  - **Union-merge safe.** Append-only NDJSON under `merge=union`; duplicate rows are harmless because nothing reduces them.
- **MODIFY:** `.bkit/workflows.md` § Event types — one new table row documenting `step-skipped`, in the same additive-audit-row block as `runtime-resolved` / `transport-fallback` / `close-transport`, stating both `step` forms.

The `bkit.sensitivePaths` consumer key is the other schema addition in this plan; it belongs to [`plan-v4-3.md`](plan-v4-3.md).

## Architecture & Component Changes

**CRITICAL:** Every `[NEW]` states why an existing artifact cannot be evolved. Source-only edits — `.bkit/workflows/*`, `.bkit/templates/*`, `.bkit/src/*`, `tests/*`. NEVER edit `.claude/*`, `.cursor/*`, `.opencode/*` mirrors; regenerate them with `bkit install`, batched once at session end by [`plan-v4-4.md`](plan-v4-4.md) Task 22.

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
- `decidedBy` assignment across the 28: `caller-flag` for build `:508` (`[skills=false]`); `applicability` for the wave-3 predicates in design and plan (added by [`plan-v4-3.md`](plan-v4-3.md), not here); `upstream-verdict` for every remaining existing condition (verdict-, state- or count-gated). **No `path-override` arm exists** — a lens a sensitive-path glob forces on runs, so it never reaches a skip call site.
- **Enum-completeness is asserted in sub-plan 3, not here.** After this sub-plan only `caller-flag` and `upstream-verdict` have call sites; `applicability` gets its first in [`plan-v4-3.md`](plan-v4-3.md) Task 12. Putting the no-dead-arm assertion in Task 5 would make the suite red until sub-plan 3 lands — a backwards dependency. Task 5 asserts presence and gate items; Task 15 asserts the enum is exactly `caller-flag|upstream-verdict|applicability` with no dead arm.
- **PROHIBITED:** no step's condition changes in this sub-plan, and no `**Run lens only if**` line is added in this sub-plan. This wave is logging only.

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
- **Does not** assert enum completeness — that moves to `.bkit/src/bkit-applicability-audit.test.ts` in [`plan-v4-3.md`](plan-v4-3.md), because `applicability` has no call site until that sub-plan and an assertion here would be red across two sub-plans.
- The lens-level subject set is **empty** at the end of this sub-plan (no `**Run lens only if**` line exists yet). That is correct and must not red: the audit iterates a derived set, so an empty set trivially passes and starts gating the moment sub-plan 3 writes the first lens condition.

#### [MODIFY] `.bkit/src/bkit-status.test.ts`

- One case: `parseStatus(raw)` over a raw NDJSON fixture containing `step-skipped` lines, then `fold`, equals the same pipeline over the fixture with those lines removed. **Route through `parseStatus`, never a hand-built event** — `StatusEvent` (`bkit-status.ts:42-47`) is a closed union with no member for `runtime-resolved` / `transport-fallback` / `close-transport`, so constructing a `step-skipped` event would need `as unknown as StatusEvent`, which Gate 2 forbids and `slop:delta` flags. `parseStatus` takes a `string` and casts internally (`:139`), so a raw fixture keeps the case honest and cast-free.
- Prove it can fail — add the row to the union handling, watch the case red, revert.

#### [MODIFY] `tests/counter-derive.bats`

- One case: `counter_count` for a step key is unchanged by a `step-skipped` row carrying that key, and by one carrying its lens-suffixed variant.
- One case: the **shell** reducer `BKIT_STATUS_FOLD` (`.bkit/templates/.bkit/scripts/bkit-status-fold.sh:34`) produces a run array unchanged by `step-skipped` rows. `.bkit/src/bkit-status.ts:10-12` says plainly it is the _reference_ reducer and that workflows execute the inline `jq` filter instead — so the Vitest case above covers the reference copy and this one covers the copy that decides whether a real run's counters stay honest.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

None. This sub-plan adds without replacing. The plan's six supersession rows belong to [`plan-v4-3.md`](plan-v4-3.md) and [`plan-v4-4.md`](plan-v4-4.md).

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/workflows.md` § Event types | One new row for `step-skipped` in the additive-audit-row block, stating both `step` forms (bare slug for a step skip, lens-suffixed for a lens skip) and the three-member `decidedBy` enum |
| `.bkit/workflows.md` § Common Workflow Anatomy | Skipped steps record a skip and a skipped gate; the `**Run lens only if**` sub-step construct and its per-lens row / gate item. _(The entry-point doctrine clause of this same section is owned by [`plan-v4-4.md`](plan-v4-4.md) Task 20; the fan-out-width clause is owned by [`plan-v4-2.md`](plan-v4-2.md) Task 9's documentation.)_ |
| `.bkit/workflows.md` § Rationale rehomed from the workflow files | Why the row is not folded (both reducers); why the fold's non-`step-done` dedup key collapses same-second skips and why that is not being changed here. _(The remaining four rationale bullets are owned by [`plan-v4-4.md`](plan-v4-4.md) Task 20.)_ Every rationale byte belongs in this section, never in a workflow file |
| `.bkit/src/bkit-status.ts` header comment | Document `step-skipped` as an additive audit row the reducer ignores by design; leave the `StatusEvent` union unchanged |
| `.agents/docs.md` | No change — no new doc file; `.bkit/*.md` are bkit-authoring docs and are not catalog rows |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database | The only persistent-state change is an additive `status.jsonl` row type; existing logs stay readable because the fold already ignores unrecognised types |
| **Code** | `git revert {COMMIT}`, then `pnpm build` and `pnpm bkit install` to regenerate `.claude/` / `.cursor/` / `.opencode/` mirrors | Mirrors are force-overwritten and are not drift-gated by `bkit check`, so a revert that skips the regen leaves stale rendered workflows on disk. The regen is part of the rollback, not optional |
| **Partial rollback** | This sub-plan is revertible on its own **only if** sub-plans 3 and 4 have not landed | Sub-plans 1 and 2 are pure logging and pure tolerance with no behaviour change. Reverting this one after sub-plan 3 has landed would strip the emitter out from under `applicability` call sites; revert 3 first |
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

### Wave 1 — skip recording (pure logging, no behaviour change)

- [ ] **Task 1: Add `route_append_step_skipped` to the shared routing script.** _Requires: none._ Extend `.bkit/templates/.bkit/scripts/bkit-status-route.sh` with the emitter, modelled on `route_append_debug_mode`: closed-enum `case` on `DECIDED_BY` (`caller-flag|upstream-verdict|applicability` — three members) **and** on `WORKFLOW` (`design|plan|build|debug|ship`), non-empty asserts on `STEP` / `REASON`, `_route_need_file`, `jq -nc --arg` for every field, `>>` append, `_route_die` + `return 2` on any failure. **Done when:** `route_append_step_skipped` is defined in that file; a manual `sh -c '. …/bkit-status-route.sh && route_append_step_skipped ./tmp/s.jsonl plan plan-review r applicability abc'` appends one line that `jq -e .` parses and `jq -r .decidedBy` reports as `applicability`; the same call with `decidedBy=bogus` exits 2 and prints nothing on stdout; the same call with `workflow=bogus` exits 2 and prints nothing on stdout; the enum `case` contains no `path-override` arm.

- [ ] **Task 2: Cover the emitter with bats and both reducers.** _Requires: Task 1._ Create `tests/step-skipped-row.bats` with a fresh subprocess per case, a real temp `status.jsonl`, and a `BKIT_STATUS_ROUTE` override. Add cases to `tests/counter-derive.bats` and `.bkit/src/bkit-status.test.ts`. **Done when:** `npx bats tests/step-skipped-row.bats` passes and covers both matrix rows for the emitter (row shape with all seven fields; `decidedBy` / `workflow` enum, empty-`step` and empty-`reason` refusal at exit 2 with the file byte-unchanged); `tests/counter-derive.bats` proves `counter_count` for a step key is unchanged by a `step-skipped` row carrying that key **and** by one carrying its lens-suffixed variant, and proves the shell reducer `BKIT_STATUS_FOLD` (`bkit-status-fold.sh`) produces a run array unchanged by `step-skipped` rows; `.bkit/src/bkit-status.test.ts` proves the same for the reference reducer **routed through `parseStatus(raw: string)` over a raw NDJSON fixture, with no `as any` / `as unknown as StatusEvent` cast anywhere in the case**, and reds when the row is added to the union handling.

- [ ] **Task 3: Document the row type before any caller exists.** _Requires: Task 1._ Add the `step-skipped` row to `.bkit/workflows.md` § Event types beside `runtime-resolved` / `transport-fallback` / `close-transport`; add the not-folded rationale, the dedup-collapse note and the `**Run lens only if**` construct to § Rationale rehomed from the workflow files and § Common Workflow Anatomy; extend the `.bkit/src/bkit-status.ts` header comment. **Done when:** `.bkit/workflows.md` § Event types contains a `step-skipped` row naming all seven fields, both `step` forms (bare slug and lens-suffixed) and the three-member `decidedBy` enum; § Rationale states that neither reducer folds it and that same-second non-`step-done` rows collapse under the `W {type} {workflow} {at}` dedup key; `grep -c 'step-skipped' .bkit/src/bkit-status.ts` is >= 1 and the `StatusEvent` union is unchanged.

- [ ] **Task 4: Retrofit the skip arm to all 28 conditional steps.** _Requires: Tasks 1, 3._ Add the bash skip arm and the gate item to every step matched by `grep -nE '^\*\*(Skip if|Run only if)' .bkit/workflows/bkit-*.md`, assigning `decidedBy` per the Architecture table (`caller-flag` for build `:508`, `upstream-verdict` for the rest — no `applicability` and no `path-override` in this wave). Change no step's condition. **Done when:** every step matched by that grep has exactly one `route_append_step_skipped` call and exactly one skip gate item **within its own section** — verified by Task 5's derived audit, not by a bare corpus-wide count; `git diff` shows no edit to any `**Skip if**` / `**Run only if**` condition text and no `**Run lens only if**` line added.

- [ ] **Task 5: Gate the retrofit with a derived presence audit.** _Requires: Task 4._ Create `.bkit/src/bkit-skip-recording-audit.test.ts`, deriving **both** subject sets from the workflow files at run time — step-level via `^\*\*(Skip if|Run only if)` and lens-level via `^\s*-?\s*\*\*Run lens only if\*\*` — never a hand-written list. **Done when:** the file exists; `npx vitest run .bkit/src/bkit-skip-recording-audit.test.ts` passes its matrix rows (every step-level **and** lens-level conditional subject has a call and a gate item within its own section; every lens-level call site passes a lens-suffixed `step` literal matching a subagent invoked in that same step, never the bare slug; every `reason` literal names an absent input and none uses size-judgement wording); deleting one call site reds it; **the enum-completeness / no-dead-arm assertion is NOT in this file** — it lands in Task 15, because `applicability` has no call site until wave 3 and asserting it here would red the suite for three waves.

  > **Cross-sub-plan pointer (not part of the `Done when`):** Task 15 is in [`plan-v4-3.md`](plan-v4-3.md). "Wave 3" is that sub-plan.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` justified against extending an existing artifact (the emitter extends `bkit-status-route.sh`; the audit copies `bkit-runtime-prose-audit.test.ts`'s derived-set shape); no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass.
- [ ] **Source-only edits:** no file under `.claude/`, `.cursor/` or `.opencode/` was hand-edited.
- [ ] **Derived sets, never hand-written lists:** the audit derives its subject sets from the files under test, so a newly-added conditional step is covered-or-failing by construction.
- [ ] **No condition changed:** `git diff` shows no edit to any `**Skip if**` / `**Run only if**` condition text and no `**Run lens only if**` line added anywhere.
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified and checked off against the plan.

> [!IMPORTANT]
> **Testing Strategy** (see `docs/testing.md`):
>
> - **Shell helpers** — bats, cross-process, real `status.jsonl` and real exit codes; never a re-implementation of the script under test. Use the `BKIT_*` path override so a bats row can run `dev`'s version against the worktree's.
> - **Workflow / prompt prose** — Vitest markdown-invariant tests. Assert the **rule** (a call site, a flag, an `if:` shape), never the sentence that explains it; a guard pinned to prose reds when someone improves a comment and passes for years after the rule is deleted. This corpus is the one sanctioned exception where wording _is_ the deliverable: a header declaration or a `**Run only if**` operator is behaviour, and asserting on it is correct.
> - **Prove each guard can fail** — put the bug back and watch it red before trusting it.
> - **No browser tier** — bkit has no UI; nothing here drives a browser.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all eight rows owned by this sub-plan map to Task 2 or Task 5. Count the rows at build time and confirm the mapping is total — do not trust a number written in prose.
- [ ] **Update existing tests:** `.bkit/src/bkit-status.test.ts`, `tests/counter-derive.bats`.
- [ ] **Write new tests:** `tests/step-skipped-row.bats`, `.bkit/src/bkit-skip-recording-audit.test.ts`.
- [ ] **Verify observability:** the `step-skipped` row is the new observable; its failure diagnostics keep the `[bkit-telemetry]` stderr prefix `_route_die` already emits, per `docs/observability.md`.
- [ ] **Update documentation:** every row in this sub-plan's `Documentation Updates` completed, rewritten as prose rather than appended as bullets.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.**

- [ ] **Docs updated:** every row in this sub-plan's `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **No PENDING placeholders remain** anywhere in this sub-plan's artifacts or the new test files.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

> [!IMPORTANT]
> **Advisory build-phase checks, NOT merge gates.** Only `Agent Execution Runbook` `Done when` lines gate the merge; nothing in this section does.

### Automated Tests

- [ ] **Local gate suite for this sub-plan:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm lint:prose`, `pnpm slop:delta`, plus `pnpm vitest run` (full suite, never scoped) and `npx bats tests/*.bats`. Do NOT weaken any gate to pass. _(The whole-plan gate run, including `pnpm bkit check` after the mirror regen, is [`plan-v4-4.md`](plan-v4-4.md) Task 22.)_
- [ ] **Test Synchronization:** no E2E tier exists in this repo. Do re-run `.bkit/src/bkit-runtime-prose-audit.test.ts`, `.bkit/src/bkit-block-locality-audit.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`, `.bkit/src/bkit-untrusted-input-coverage.test.ts` and `.bkit/src/bkit-telemetry-workflow-writers.test.ts` — each reads the workflow corpus this sub-plan edits at 28 sites.
- [ ] **Build Configuration:** none — no new mock files or test configs; the new test files match existing include globs (`.bkit/src/*.test.ts`, `tests/*.bats`).
- [ ] **Shell tier (`tests/step-skipped-row.bats`):** each case in a fresh subprocess against a real temp `status.jsonl`; assert the appended line parses with `jq -e .` and that a refused call leaves the file byte-unchanged. Clean the temp file per case.
- [ ] **Prose-audit tier (`.bkit/src/bkit-skip-recording-audit.test.ts`):** reintroduce the defect once (delete one call site) and confirm it reds. A guard that has never failed is indistinguishable from a guard that cannot.
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

- [ ] **Emitter smoke check.** Against a scratch `status.jsonl`, source the extended `bkit-status-route.sh` and call `route_append_step_skipped` once with a valid tuple and once with `decidedBy=bogus`. Confirm the first appends a line `jq -e .` parses and the second exits 2 leaving the file byte-unchanged.

_The plan's seven whole-feature Manual Verification steps (narrow-path, full-width, partial-width, sensitive-path force-on, escalation, debug entry, consumer upgrade) run once at the end and live in [`plan-v4-4.md`](plan-v4-4.md); none of them is exercisable until sub-plans 3 and 4 have landed._
