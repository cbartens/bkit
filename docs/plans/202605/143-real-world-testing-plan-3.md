Verdict: PASS

<!-- verdict:end -->

<!-- Note: child sub-plan 3 of 4. Split from the master per the WS DAG. -->

# Live Testing Gates — Sub-Plan 3: WS-4 Plan Mandate + WS-5 Build Gate + WS-6 Debug Gate (NON-soak)

**Parent Plan:** [`143-real-world-testing-plan.md`](./143-real-world-testing-plan.md)
**Source master:** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Requires (merged):** [`143-real-world-testing-plan-1.md`](./143-real-world-testing-plan-1.md) (renamed scripts + probe-both convention) AND [`143-real-world-testing-plan-2.md`](./143-real-world-testing-plan-2.md) (the `liveStack` resolver + status.json envelope + OBSERVE_MODE enum + taxonomy).
**Blocks:** plan-v4-4 (WS-7 widens the WS6-1 `debug-reproduce` soak arm + adds the Step 9S soak loop; WS-8 catalog rows mirror the EXACT final command text WS-5/WS-6 produce here).

> [!CAUTION]
> **CRITICAL — do not hallucinate plan execution state.**
>
> 1. ALWAYS read this file natively before executing any step.
> 2. NEVER trust session summaries or conversation history for completion state.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in THIS document.

## Context & Goals

Three runtime-only bugs (#143) shipped green because every test was mocked. The fix is one missing invariant: a real-boundary test must EXIST, FAIL before a fix, PASS after — and when it cannot run, the green result must be loud and auditable.

This sub-plan installs the **plan/build/debug gate logic (NON-soak)** on the WS-3 foundation. The three workstreams are parallelisable per the DAG (no internal ordering constraint once plan-v4-2 is merged):

- **WS-4 — Plan-phase non-mock mandate:** plan-generate emits a paired non-mock test task for each boundary-crossing task; plan-review-3 flags mock-only coverage as CRITICAL.
- **WS-5 — Build empirical-verify + e2e-smoke gate + escape-hatch audit:** build Step 13 appends `test:smoke` LAST + narrows `test`->`test:unit`; records `liveVerdict` + fail-then-pass; gates PR creation; escape-hatch audit at Close Workflow.
- **WS-6 — Debug reproduce-first + empirical-verify + escape-hatch audit (NON-soak):** the new `debug-reproduce` mini-step + classifier; Step 6 appends live tiers LAST + records `liveVerdict`; the §I Gate-4 non-collision; remediate empirical-verify; escape-hatch audit.

> [!IMPORTANT]
> **The WS6-1 `debug-reproduce` guard introduced here reads `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` — the soak ARM is in the guard SHAPE but the soak loop itself is wired in plan-v4-4 (WS-7).** Introduce the guard shape now; WS-7 widens/wires the soak behaviour.

> [!WARNING]
> **WS5-1 single-package fallback rename:** the build Step 13 fallback ENUMERATED list must ALSO be renamed (not just the turbo path): `typecheck`->`check:type` (probe-both per the plan-v4-1/WS1-8 convention), `format:check`->`check:format` (probe-both), `test`->`test:unit`. The plan-v4-1/WS1-8 rename already touched line 710/713 for the aggregate; WS5-1 narrows `test`->`test:unit` + appends `test:smoke` on the same lines.

**Success criteria for THIS child:**

- plan-generate + plan-review-3 + the plan workflow carry the boundary-scoped non-mock mandate + `mock-only-coverage` CRITICAL lens.
- build Step 13 runs `pnpm turbo lint check test:unit ... test:smoke` (smoke LAST, only when `LIVE_STACK = live`); records `liveVerdict` + fail-then-pass; gates Step 16->17; escape-hatch line on `absent|off`.
- debug has a `debug-reproduce` step (4-outcome classifier); Step 6 appends live tiers LAST + records `liveVerdict`; Gate 4 NOT widened; remediate + summary carry the empirical-verify + escape-hatch lines.

## Out of Scope (this child)

- Writing live test BODIES / adding `test:smoke` / `:live` bodies to bkit's own `package.json`.
- Adding mocked `test:integration` / `test:e2e` to build's OWN run-tests step (build's own step is `lint check test:unit` + `test:smoke` last; CI covers the mocked tiers on the resulting PR).
- **Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion** — pre-existing narrowing; the `debug-reproduce` CONCERNS rides its OWN step verdict (WS6-4).
- Soak orchestration (WS-7) + canonical-mirror catalog rows (WS-8) — plan-v4-4.

## Invariants (this child)

- `MAX_DEBUG_ATTEMPT = 3` is the single shared cap (verified at `bkit-debug.md:38`); no new constant.
- `LIVE_API` is the in-code env var; surface vocab stays `live`; NO `API_LIVE` residue.
- ASCII operators (`!=` `>=` `<=`) in `.agents/workflows/*` + `.agents/prompts/*` — never Unicode.
- No `KN-` / `BAR-` / issue refs in consumer-facing text (the escape-hatch skip line).
- **#135 coordination note:** `bkit-debug-failure-diagnose.md` is ALSO edited by #135 (bounded issue-scan); do NOT assume sole ownership of that prompt (WS6-2).
- Hard-FAIL routes only on `LIVE_STACK = live AND live test failed` — every other live-skip degrades to CONCERNS.

## Merge Method

**Merge method: always squash.** This child lands as ONE squash-merged PR after plan-v4-2.

## Supersession Inventory (slice relevant to this child)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/workflows/bkit-build.md` Step 13 build run-tests `test` umbrella invocation (turbo path + single-package fallback) | `test:unit` (mocked integration/e2e move to CI-on-PR) | DELETE (narrow) | Material narrowing of build's own run-tests step from the `test` umbrella to `test:unit` — NOT a coverage drop (CI covers the mocked integration/e2e tiers on the resulting PR). Owned by WS5-1; mirrored in the WS-5 Architecture entry and the `.agents/workflows.md` Build Step 13 catalog row (WS8-2, in plan-v4-4). |

> [!CAUTION]
> **Default = `DELETE`.** This is a narrowing of build's own run-tests step, mirrored in the runbook (WS5-1) and the canonical-mirror catalog row (WS8-2 in plan-v4-4).

## Architecture & Component Changes

### WS-4 — Plan-phase non-mock mandate

#### [MODIFY] `.agents/prompts/bkit-plan-generate.md`

- **Existence Check:** exists. Add a Process instruction: for each `Agent Execution Runbook` task crossing an external boundary (DB/API/model/network/migration), include a paired non-mock test task whose `Done when` names the boundary AND the ground-truth signal. Pure-function tasks exempt. ASCII operators only.

#### [MODIFY] `.agents/prompts/bkit-plan-review-3.md`

- **Existence Check:** exists (regression-risk / design-coverage lens). Add a check: for each boundary-crossing task, assert a paired non-mock test task exists with a ground-truth `Done when`; mock-only or absent -> CRITICAL reason `mock-only-coverage`. Static plan-task check; no runnable stack. Absorbed by the existing three-reviewer + max-wins merge — NO new agent/step.

#### [MODIFY] `.agents/workflows/bkit-plan.md`

- **Existence Check:** exists. Reflect the mandate + the new review-3 lens where the workflow describes `@bkit-plan-generate` / `@bkit-plan-review-3` scope (boundary-crossing tasks only).

### WS-5 — Build empirical-verify + e2e-smoke gate + escape-hatch audit

#### [MODIFY] `.agents/workflows/bkit-build.md` (Step 13 run-tests + Step 18 Close Workflow)

- **Existence Check:** exists (run-tests ~710-713). Append `test:smoke` LAST to `pnpm turbo lint check test:unit ...` and to the single-package fallback loop; run only when `LIVE_STACK = live` (build's own step has NO mocked integration/e2e — CI covers on PR). Record `liveVerdict` + the fail-then-pass `repro` transition on `build-run-tests`; hard-FAIL-only-on-live-and-failed routes into the existing FAIL branch; the e2e-smoke gate folded into Step 13 verdict gates Step 16 Summary -> Step 17 Create PR. Add Gate 13 checklist items `[ ] liveVerdict recorded` and `[ ] empirical fail-then-pass transition recorded when LIVE_STACK = live`. Escape-hatch audit at Close Workflow (Step 18): record `liveReason`; emit the consumer-neutral skip line.

#### [MODIFY] `.agents/prompts/bkit-build-summary.md`

- **Existence Check:** exists. When `liveStack = absent | off` (or a soak-to-off downgrade), the always-written `build-summary.md` MUST include the consumer-neutral skip line (no internal refs); the summary body propagates to the PR body + tracker comment when wired.

### WS-6 — Debug reproduce-first + empirical-verify + escape-hatch audit (non-soak)

#### [MODIFY] `.agents/workflows/bkit-debug.md` (Step 4 area + Step 6 + Close Workflow)

- **Existence Check:** exists. New `debug-reproduce` mini-step in the Step 4 area, guarded `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` (the soak arm is wired in WS-7/plan-v4-4 but the guard shape is introduced here): run the live test once, classify `repro` (fail/pass/skip) + `reproKind` (functional/infra/none) per the §B classifier, route the four outcomes (functional-fail->diagnose; infra-fail->CONCERNS `live-stack-infra-failure`; pass->soft CONCERNS `empirical-unverified`; skip->degrade). Step 6 run-tests: append `test:integration:live test:e2e:live` LAST to `pnpm turbo lint check test test:integration test:e2e ... --continue` + the single-package fallback; record `liveVerdict`; require fail-then-pass; hard-FAIL-on-live-and-failed routes into the diagnose retry branch. The §I rule: reproduce CONCERNS rides the `debug-reproduce` step's OWN verdict (`PASS | CONCERNS | skip`), NOT Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` (Gate 4 NOT widened). Add Gate 6 checklist items. Escape-hatch audit at Close Workflow: `liveReason` + skip line.

#### [MODIFY] `.agents/prompts/bkit-debug-failure-diagnose.md`

- **Existence Check:** exists. Add a Process pre-condition BEFORE the strategy step: anchor diagnosis on a `repro: fail` + `reproKind: functional` ground truth; do NOT theorise past a green live repro; treat `reproKind: infra` as an environment/credential problem, never as the feature being broken. (Coordination: #135 also edits this prompt — do not assume sole ownership.)

#### [MODIFY] `.agents/prompts/bkit-debug-failure-remediate.md`

- **Existence Check:** exists (local-test gate ~52). Add the empirical-verify item to its local-test gate (the fix is "done" only when the same live test that recorded `repro: fail` now records `repro: pass`).

#### [MODIFY] `.agents/prompts/bkit-debug-summary.md`

- **Existence Check:** exists. Same always-written skip-line behaviour as the build summary.

## Documentation Updates (this child)

> No reference-doc rows in this child — the doc renames were owned by plan-v4-1/WS1-6 and the taxonomy by plan-v4-2/WS-2. WS-4/5/6 are workflow/prompt-text edits.

## 🚨 Pre-Flight / Dependencies 🚨

- [ ] **Prerequisite Plans:** plan-v4-1 (rename) AND plan-v4-2 (foundation) merged. The `liveStack` field + status.json envelope + `OBSERVE_MODE = off | instrument | analyse | soak` enum + the taxonomy must already exist.
- [ ] **Architecture & UI:** WS-6 introduces the new `debug-reproduce` mini-step in `bkit-debug.md` — confirm it does not collide with an existing step heading.
- [ ] **Project Context:** Re-read `docs/knowledge.md:365` (the #143 silent-gate-disablement) — WS-5 IS the structural fix for that regression.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through autonomously. Do not pause for user permission.
> **Blockers:** If a task cannot be completed, create a tracker issue (label `blocker`) before stopping.
> **Step Isolation:** Complete each task fully before the next.
> **Sequencing:** WS-4, WS-5, WS-6 are parallelisable per the DAG (each requires WS-2/WS-3 merged). Mirror regen BATCHED at session end.

> Every task MUST include a `**Done when:**` line.

### WS-4 — Plan non-mock mandate (Requires WS-2) — parallelisable with WS-5/WS-6

- [ ] **WS4-1 — Add the generate mandate.** `bkit-plan-generate.md` Process instruction: paired non-mock test task with a named ground-truth `Done when` for boundary-crossing tasks; pure-function tasks exempt. **Done when:** the prompt contains the boundary-scoped mandate; ASCII operators only.
- [ ] **WS4-2 — Add the review-3 lens.** `bkit-plan-review-3.md`: boundary-crossing task without a paired non-mock test task -> CRITICAL reason `mock-only-coverage`. **Done when:** the prompt contains the lens and the `mock-only-coverage` reason string; no new agent/step added.
- [ ] **WS4-3 — Reflect scope in `bkit-plan.md`.** **Done when:** the plan workflow describes the mandate + lens scoped to boundary-crossing tasks.

### WS-5 — Build empirical-verify + e2e-smoke gate + audit (Requires WS-3)

> This gate IS the structural fix for the #143-class regression recorded at `docs/knowledge.md:365` (a subagent declaring PASS after `pnpm turbo lint typecheck test` while integration/e2e still fail on the same SHA). The empirical fail-then-pass requirement prevents a future executor re-deriving the same gate.

- [ ] **WS5-1 — Append `test:smoke` LAST to build Step 13 + narrow `test`->`test:unit`.** Turbo path + single-package fallback; run only when `LIVE_STACK = live`. This INTENTIONALLY narrows build's own run-tests step from the `test` umbrella to `test:unit` (the mocked integration/e2e tiers move to CI-on-PR — NOT a coverage drop; CI covers them on the resulting PR). The single-package fallback ENUMERATED list must also be renamed, not just the turbo path: `typecheck`->`check:type` (probe-both per WS1-8), `format:check`->`check:format` (probe-both), `test`->`test:unit`. **Done when:** `bkit-build.md` Step 13 turbo command reads `pnpm turbo lint check test:unit ... test:smoke` (smoke last); the single-package fallback loop enumerates `check:type test:unit check:format ...` (+ legacy probe-aliases) and appends `test:smoke`; no mocked integration/e2e in build's own step.
- [ ] **WS5-2 — Record `liveVerdict` + fail-then-pass + hard-FAIL routing; gate PR creation.** **Done when:** `build-run-tests` records `liveVerdict`; live-and-failed routes into the existing FAIL branch; the e2e-smoke verdict gates Step 16->17; Gate 13 has `[ ] liveVerdict recorded` + `[ ] empirical fail-then-pass transition recorded when LIVE_STACK = live`.
- [ ] **WS5-3 — Build escape-hatch audit.** Close Workflow records `liveReason`; `bkit-build-summary.md` always-writes the consumer-neutral skip line on `absent|off`/downgrade. **Done when:** `build-close-workflow` records `liveReason`; the summary prompt emits the exact line `Live verification skipped - runtime-only defects not gated (no live test declared, or opted out).` with no internal refs.

### WS-6 — Debug reproduce-first + empirical-verify + audit (Requires WS-3)

- [ ] **WS6-1 — Add the `debug-reproduce` mini-step.** Step 4 area; guard `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live`; classify `repro` + `reproKind`; route the four outcomes. **Done when:** `bkit-debug.md` has a `debug-reproduce` step writing `repro` + `reproKind` with the §B classifier and the four routing branches (functional-fail / infra-fail / pass / skip); ASCII operators.
- [ ] **WS6-2 — Diagnose reproduce-first pre-condition.** `bkit-debug-failure-diagnose.md`: anchor on functional ground truth; treat `reproKind: infra` as environment, never feature-broken. **Done when:** the prompt's Process has the pre-condition before the strategy step. (Note #135 shared edit.)
- [ ] **WS6-3 — Append live tiers LAST to debug Step 6 + record `liveVerdict` + fail-then-pass + hard-FAIL routing.** **Done when:** Step 6 turbo command reads `... test:integration test:e2e test:integration:live test:e2e:live` (live last); `debug-run-tests` records `liveVerdict`; live-and-failed routes into the diagnose retry branch; Gate 6 gains the two checklist items.
- [ ] **WS6-4 — §I Gate-4 non-collision.** The `debug-reproduce` CONCERNS rides its own step verdict (`PASS | CONCERNS | skip`), NOT Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL`; Gate 4 NOT widened. **Done when:** the `debug-reproduce` step has its own verdict field and the workflow text explicitly states reproduce CONCERNS does not feed `DIAGNOSE_VERDICT`.
- [ ] **WS6-5 — Remediate empirical-verify item.** `bkit-debug-failure-remediate.md` local-test gate requires the same live test's fail-then-pass. **Done when:** the prompt's local-test gate names the fail-then-pass requirement.
- [ ] **WS6-6 — Debug escape-hatch audit.** Close Workflow `liveReason` + `bkit-debug-summary.md` always-writes the skip line, including the soak-downgrade VARIANT line when `soakDowngradeReason` is set (debug-only — soak is debug-only). **Done when:** `debug-close-workflow` records `liveReason`; the debug summary emits the exact standard line `Live verification skipped - runtime-only defects not gated (no live test declared, or opted out).` AND the soak-downgrade variant line `Soak requested but no live stack available - ran standard diagnose path; runtime-only defects not gated.` when a soak-to-off downgrade occurred; both with no internal refs.

## Hand-off to next child

On merge, plan-v4-4 (WS-7 + WS-8 + Gates 2/3/4 + Verification Plan) may start. It relies on: the WS6-1 `debug-reproduce` mini-step + its guard shape (WS-7 widens the soak arm); the EXACT final Step 6 / Step 13 command text WS6-3 / WS5-1 produced (WS-8 catalog rows mirror it verbatim); the WS5-3 / WS6-6 escape-hatch lines. Mirror/snapshot regen for the WS-4/5/6 surface is part of THIS child's session-end batch.
