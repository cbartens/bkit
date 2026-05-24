# Design: Real-World (Non-Mock) Testing Gates for Plan / Build / Debug

## Acceptance Scenario

### Narrative

As a maintainer running bkit's plan/build/debug workflows, when my feature touches a real
integration boundary I want the workflow to insist a non-mock test exists, fail before my fix and
pass after it, so a runtime-only defect cannot ship green behind mocked tests. When my repo has no
runnable real stack, I want the gate to step aside loudly and on the record rather than block me or
pretend the green result proves the feature works.

### Success Criteria

- A plan whose tasks cross an external boundary (DB / API / model / network / migration) is flagged
  at plan-review time if it lacks a paired non-mock test task with a ground-truth `Done when`.
- When a `test:real` script is declared, build will not raise a PR and debug will not close green
  unless `test:real` passes; in debug it must be observed to fail before the fix and pass after.
- When no `test:real` is declared (or `[real-stack=off]`), all three gates degrade to CONCERNS, the
  workflow still completes, and the skip is recorded in status.json and stated in the close comment.
- Soak mode is selectable for unknown-cause non-functional bugs, running one accumulating-context
  agent that loops against `test:real` until green, bounded by the existing attempt cap.
- No new magic-number constant, no new config file type, and no Unicode comparison operators are
  introduced; all consumer-facing advisory text is free of internal KN-/BAR- refs.

### Key Edge Cases

- **Vacuous pass:** a `test:real` that exits 0 without reaching the stack (creds absent) is caught
  because the reproduce-first gate records `repro: pass` (it never failed), so empirical-verify's
  required fail-then-pass transition is absent.
- **Real stack reached but verification fails:** the one case that does NOT degrade — it is a hard
  FAIL routed into the existing retry loop, because it is exactly the defect class #143 targets.
- **Credentials missing in CI:** `test:real` exits non-zero at setup → capability resolves to
  `absent` → CONCERNS, not FAIL (so the gate is not ripped out on credential-less runs).
- **Soak requested without a real stack:** record CONCERNS `real-stack-unavailable` and fall back to
  the structured diagnose→remediate loop; never run a mock-only soak that looks like a real one.
- **Mislabeled mock suite as `test:real`:** an inherent limit of consumer-agnostic enforcement —
  bkit cannot know which deps are external; stated as an accepted residual risk, not silently
  assumed away.
- **Resume mid-run:** `realStack` is resolved once and persisted, so a resumed workflow reads the
  same capability state and OBSERVE_MODE (now including `soak`) it had at interruption.

## Architecture

### The single invariant being installed

All three #143 bugs were runtime-only and shipped green because every test was mocked. The
root cause is one missing invariant, not a missing subsystem:

> **A test that exercises the real integration boundary must exist, must FAIL before a fix,
> and must PASS after it — and when that test cannot be run, the green result must be loud,
> auditable, and never silently equated with "works."**

The design installs this invariant across plan (mandate the test exists), build (the test
exists and passes before a PR is raised), and debug (the test fails-then-passes around a fix,
with a soak loop for iterative bug chains). It does so by **reusing existing bkit machinery**
— the `jq -e .scripts[...]` script-discovery pattern, the OBSERVE_MODE axis, the
diagnose→remediate→run-tests retry loop, the `debug-fetch`-grep-from-doc pattern, and
status.json per-step verdicts — adding the minimum new surface.

### Resolving the consumer-agnostic crux

bkit ships to consumer repos that may have no runnable real stack, or where hitting real deps
(LLMs, DBs) costs money or needs CI-absent credentials. A gate that hard-requires a real stack
is unsatisfiable on those repos, gets ripped out, and takes the good parts with it. The design
resolves this with a **declared-capability + graceful-downgrade + loud-audit** model:

1. **"Real stack" is a declared, optional capability** — a consumer-owned `test:real` script
   discovered exactly the way build/debug already discover `test:integration` / `test:e2e`
   (`jq -e ".scripts[\"$s\"]"` for single-package, turbo task for monorepos). Documented in one
   canonical home: a new `Real` row in the `docs/testing.md` Tiers table plus a short managed
   subsection inside the existing `<!-- bkit:start -->` block.
2. **The escape hatch is a single declared key, never a hard block.** `bkit:real-stack` resolves
   to one of three capability states — `live` (a `test:real` script exists and runs),
   `absent` (no script declared), or `off` (explicitly opted out via a `[real-stack=off]`
   input flag). `absent`/`off` make the gates **degrade to CONCERNS, never hard-FAIL**, so the
   workflow continues and is auditable rather than blocked. A hard FAIL only fires in the one
   case we are actually trying to catch: the real stack was reached and the empirical
   verification failed.
3. **Every skip is loud and state-recorded.** The capability state and per-run verdicts are
   written to status.json, and the close-workflow comment states, in consumer-neutral language,
   "real-stack verification skipped — runtime-only defects not gated." A silent skip would
   recreate the exact #143 failure, so silence is prohibited.

### The two divergent options, resolved

**Option 1 — Real-stack definition: declared `test:real` script (CHOSEN) vs new config file.**
Brainstorm 2 proposed a structured `bkit-real-stack.md` contract file (tiers, credentials, cost
signals); brainstorms 1 and 3 proposed reusing the existing script-discovery seam. We choose the
**declared `test:real` script**, because it rides the exact mechanism build/debug already use for
`test:integration`/`test:e2e` — zero new file type, zero new parser, zero new drift surface, and
"anyone who understands the current `test:integration` discovery understands this." The structured
config file's only material advantage — distinguishing "verified against real stack" from "script
ran, stack absent, exited 0 vacuously" — is preserved without the file by layering on brainstorm
2's strongest mitigation: the **fail-then-pass transition is recorded in status.json**. A
`test:real` that exits 0 vacuously cannot produce a recorded `repro: fail` before the fix, so the
empirical-verify gate detects the vacuous-pass case from state, not from a config declaration.
Credential/cost preconditions are handled by the script itself (it exits non-zero when creds are
absent → capability resolves to `absent` → CONCERNS, not FAIL) rather than by a declared schema.

**Option 2 — Soak: fourth OBSERVE_MODE value (CHOSEN) vs reuse the existing retry loop
unchanged.** Brainstorm 1 and 2 proposed `soak` as a fourth OBSERVE_MODE value; brainstorm 3
argued the existing diagnose→remediate→run-tests loop already provides fail→pass machinery and a
parallel mode adds a magic-number cap, a prompt, and dual-mode drift. We choose **`soak` as a
fourth OBSERVE_MODE value**, because the issue calls the iterative single-agent loop "decisively
yes" for unknown-cause/non-functional bugs and explicitly contrasts it with the structured
diagnose→remediate handoff ("instead of the diagnose→remediate handoff. Keep the structured
handoff for known-shape, localized fixes"). The structured loop and the soak loop are genuinely
different tools: the structured loop hands off discrete diagnose/remediate artifacts and escalates
STANDARD→PIVOT→FINAL→instrument; soak keeps one accumulating context that re-runs `test:real`
after each fix. Collapsing soak into "just re-run the loop" (brainstorm 3's fallback) would lose
the accumulating-context property that the issue identifies as the thing that actually cracked the
bugs. We adopt brainstorm 3's risk mitigation in full to neutralise its objections: **soak reuses
the existing `MAX_DEBUG_ATTEMPT` / `MAX_TEST_ATTEMPT` constants — no new magic number is minted**,
and the OBSERVE-vs-SOAK decision boundary is documented in one canonical sentence in
`.agents/workflows.md` so it cannot silently drift.

### Capability resolution (where it lives)

Capability is resolved **once per debug/build run** in Worktree Setup and persisted to
status.json, so every downstream gate reads the same value rather than re-probing. This adopts the
clean conceptual core of brainstorm 1's Approach C (single source of truth) **without** its heavy
cross-workflow gate engine — the resolver is ~15 lines of shell, not a new subsystem. Resolution
order:

```
# REAL_STACK in {live, absent, off}
# [real-stack=off] read from debug-input / build-input session text
if [real-stack=off] present:        REAL_STACK=off
elif test:real declared (turbo task or jq -e .scripts["test:real"]):  REAL_STACK=live
else:                               REAL_STACK=absent
```

Persisted as `realStack` on the `worktree-setup` step entry, alongside the existing `observeMode`
field.

### Component boundaries and integration points

- **`docs/testing.md`** (consumer-facing managed block + Tiers table) — the canonical definition
  of the `test:real` convention. Single seam a consumer fills in to upgrade from "no stack" to
  "real stack."
- **`.agents/workflows/bkit-debug.md`** — capability resolution in Worktree Setup; reproduce-first
  gate (Step 4 area); empirical-verify in run-tests (Step 6); `soak` as a fourth OBSERVE_MODE value
  with its own step block; escape-hatch audit in Close Workflow.
- **`.agents/workflows/bkit-build.md`** — capability resolution in Worktree Setup; `test:real`
  added to the run-tests sequence (Step 13) run **last**; e2e-smoke gate folded into run-tests
  verdict; escape-hatch audit in Close Workflow.
- **`.agents/workflows/bkit-plan.md`** — non-mock mandate as a `@bkit-plan-generate` instruction +
  a new lens in `@bkit-plan-review-3`, scoped to boundary-crossing tasks only.
- **Prompts** — `bkit-debug-failure-diagnose.md` (reproduce-first pre-condition),
  `bkit-debug-failure-remediate.md` (empirical-verify in its local-test gate), new
  `bkit-debug-soak.md`, `bkit-plan-generate.md` and `bkit-plan-review-3.md` (mandate + lens).
- **status.json** — `realStack` capability field on worktree-setup; `repro` / `realStackVerdict`
  fields on the relevant step entries; new `debug-reproduce` and `debug-soak` step kinds.

## Data Model

This is a markdown-workflow toolkit; the "schema" is the status.json shape and the consumer-facing
`docs/testing.md` convention. No application schema changes.

### status.json additions

All additions are optional fields layered onto existing step entries — no breaking change to the
existing reader. `realStack` cross-field invariant: `realStackVerdict` is only meaningful when
`realStack == "live"`.

| Field              | On step                                                               | Values                                   | Meaning                                                                                    |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `realStack`        | `debug-worktree-setup`, `build-worktree-setup`                        | `live` \| `absent` \| `off`              | Capability resolved once per run, reused by all downstream gates                           |
| `repro`            | `debug-reproduce` (new), and on `debug-run-tests` / `build-run-tests` | `fail` \| `pass` \| `skip`               | The fail-then-pass transition; `skip` when `realStack != live`                             |
| `realStackVerdict` | `debug-run-tests`, `build-run-tests`                                  | `PASS` \| `FAIL` \| `CONCERNS` \| `skip` | Verdict of the `test:real` execution specifically (distinct from the suite-wide `verdict`) |
| `realStackReason`  | `debug-close-workflow`, `build-close-workflow`                        | string                                   | Consumer-neutral reason logged when capability `absent`/`off` (no KN-/BAR- refs)           |

New step kinds (same envelope as existing steps — `step`, `status`, `verdict`, `attempt`,
`at`, `parentSha`, `artifacts`):

- `debug-reproduce` — the reproduce-first gate execution (records `repro`, `realStack`).
- `debug-soak` — one soak-mode pass (records `verdict`, `attempt`, `realStackVerdict`).

### OBSERVE_MODE enum

Extended from `off | instrument | analyse` to `off | instrument | analyse | soak`. Every place
that branches on OBSERVE_MODE (resume logic, `Run only if OBSERVE_MODE = off` step guards, the
Failure Path max-retry branch, gate tables, the Step 1 `OBSERVE_MODE` decision) must learn the
fourth value. Soak is entered via an `OBSERVE_MODE_OVERRIDE=soak` / `[soak]` debug-input flag
(operator-selected for "feature non-functional, cause unknown"); it is NOT auto-entered on attempt
exhaustion (that path stays `instrument`), preserving the existing escalation ladder.

### docs/testing.md consumer surface

Inside the existing `<!-- bkit:start -->` managed block, add a short `## Real-stack verification`
subsection documenting the `test:real` convention in consumer-neutral language. In the Tiers
table, add a `Real` row and flip the E2E row's "Out of scope for bkit" framing:

```
| Real | `test:real` (script/turbo task) | Exercises real integration boundaries — live DB / API / model, no mocks. Optional; declares the repo HAS a real stack. | CI + debug/build real-stack gate (skipped when absent) |
```

The bkit repo's own `test:real` choice (its E2E tier is currently "out of scope for bkit") is a
bkit-repo-specific decision that, if it differs from the consumer-facing default, must sit
**outside** the `bkit:start/end` markers per the bkit-repo-vs-consumer scoping rule.

## Components / Flows

Concrete, decision-complete edit points. All operators in workflow/prompt markdown use ASCII
(`!=`, `>=`, `<=`); no Unicode comparison glyphs. All consumer-facing advisory text omits KN-/BAR-
refs.

### A. Capability resolution (debug Step 2 + build Worktree Setup)

New sub-step appended to each workflow's Worktree Setup, after `pnpm install`, before the
status-update sub-step:

```bash
# Resolve real-stack capability once; reuse downstream.
REAL_STACK=absent
case "$DEBUG_INPUT_FLAGS" in *"[real-stack=off]"*) REAL_STACK=off ;; esac   # build: BUILD_INPUT_FLAGS
if [ "$REAL_STACK" != "off" ]; then
  if [ -f turbo.json ] && pnpm turbo run test:real --dry-run >/dev/null 2>&1; then
    REAL_STACK=live
  elif jq -e '.scripts["test:real"]' package.json >/dev/null 2>&1; then
    REAL_STACK=live
  fi
fi
```

Persist `realStack: $REAL_STACK` onto the existing `*-worktree-setup` step jq object (alongside
`observeMode` for debug). Gate checklist gains: `[ ] REAL_STACK resolved (live | absent | off)`.

### B. Reproduce-first gate (debug)

Two-part change so the gate is auditable from state, not just prose:

1. **New workflow sub-step in `bkit-debug.md` Step 4 area** (a `debug-reproduce` mini-step that runs
   when `OBSERVE_MODE = off` AND `REAL_STACK = live`, before the diagnose subagent is invoked).
   Run `test:real` once and assert it FAILS:
   ```bash
   if [ "$REAL_STACK" = "live" ]; then
     if [ -f turbo.json ]; then pnpm turbo run test:real --filter='...[origin/dev]'; else pnpm test:real; fi
     [ $? -ne 0 ] && REPRO=fail || REPRO=pass
   else
     REPRO=skip
   fi
   ```
   Record `repro: $REPRO` on a `debug-reproduce` step entry. **If** `REPRO = pass` (the real repro
   does NOT fail) → the failure is not reproducible at the real boundary → record verdict and route
   per the existing diagnose-can't-proceed handling (CONCERNS, not a hard abort, since the bug may
   be environmental). **If** `REPRO = skip` → capability absent/off, gate degrades, diagnosis
   proceeds with the diagnosis artifact marked `empirical-unverified`.
2. **`bkit-debug-failure-diagnose.md` prompt** gains a Process pre-condition (new step before the
   strategy step): "If a real-stack repro was recorded as `fail`, anchor the diagnosis on that
   ground-truth observation; do NOT theorise past a green real repro." This is the
   "refuse-to-theorise" discipline the issue credits with cracking the bugs.

### C. Empirical-verify gate (debug Step 6 + build Step 13)

Reuse the existing run-tests steps; do NOT add a standalone verify step. Append `test:real` to the
script sequence **last** (cheap tiers short-circuit first, protecting cost):

- **debug Step 6 / build Step 13** turbo path adds `test:real` to the task list; single-package
  fallback appends `test:real` to the `for s in ...` loop list. `test:real` runs only when
  `REAL_STACK = live`.
- Capture a dedicated `realStackVerdict`:
  - `REAL_STACK = live` and `test:real` passed → `realStackVerdict = PASS`, `repro = pass`.
  - `REAL_STACK = live` and `test:real` failed → `realStackVerdict = FAIL` → this is the one
    **hard FAIL** that does NOT degrade; route into the existing FAIL retry branch (back to
    diagnose if `TEST_ATTEMPT <= MAX_TEST_ATTEMPT`).
  - `REAL_STACK != live` → `realStackVerdict = skip`, `repro = skip`.
- The empirical-verify gate is satisfied only when the same `test:real` recorded `repro: fail`
  earlier and `repro: pass` now (the fail-then-pass transition). A `test:real` that was green
  before the fix cannot satisfy empirical-verify — it is recorded as `repro: pass` at reproduce
  time and flagged, defeating the vacuous-pass failure mode.
- Gate 6 / Gate 13 checklist gains: `[ ] realStackVerdict recorded (PASS | FAIL | CONCERNS | skip)`
  and `[ ] empirical fail-then-pass transition recorded when REAL_STACK = live`.

### D. Soak mode (debug — fourth OBSERVE_MODE value)

- **Step 1 OBSERVE_MODE decision** gains: "If `OBSERVE_MODE_OVERRIDE = soak` (or `[soak]` in
  debug-input) → `OBSERVE_MODE = soak`." Placed before the attempt-exhaustion branch so an explicit
  soak request wins.
- **New Step (e.g. Step 9-soak block), `Run only if OBSERVE_MODE = soak`** — invokes a new
  `@bkit-debug-soak` subagent with one accumulating context. The subagent loops
  reproduce→instrument→fix→re-verify, re-running `test:real` after each fix attempt, until
  `test:real` goes green or the loop bound is hit. **Loop bound reuses `MAX_DEBUG_ATTEMPT` — no new
  constant.** Each iteration appends a `repro: fail|pass` line to the soak artifact; the orchestrator
  records a `debug-soak` step entry with `realStackVerdict`.
- **Soak requires `REAL_STACK = live`** (it is defined by looping against the real boundary). If a
  soak run is requested when `REAL_STACK != live` → record CONCERNS with reason
  `real-stack-unavailable` and fall back to the standard diagnose→remediate path; do NOT silently
  run a mock-only soak.
- **New prompt `.agents/prompts/bkit-debug-soak.md`** (mirrors the failure-diagnose/remediate
  prompt shape: machine-parseable verdict header, `<!-- verdict:end -->`, accumulating ReAct-style
  log). Other steps' `Run only if OBSERVE_MODE = off` guards are unaffected; Step 12 Close Workflow
  guard extends to include `soak` for the close path.
- **`.agents/workflows.md`** gets the one canonical OBSERVE-vs-SOAK boundary sentence: "OBSERVE
  (instrument/analyse) is the terminal one-shot observation pass when attempts are exhausted; SOAK
  is the operator-selected iterative single-agent loop against the real stack for unknown-cause
  non-functional bugs."

### E. Build e2e-smoke gate

No separate step. The `test:real` execution folded into build Step 13 (run-tests, item C above)
IS the e2e-smoke gate: when `REAL_STACK = live`, `test:real` must pass before Step 16 Summary →
Step 17 Create PR. When `REAL_STACK = absent/off`, the gate degrades to CONCERNS and the skip is
logged at Close Workflow — a PR can still be raised, but the green is explicitly marked mock-only.

### F. Plan non-mock mandate

- **`bkit-plan-generate.md` prompt** gains a Process instruction: "For each `Agent Execution
Runbook` task that crosses an external integration boundary (DB, API, model, network, migration),
  include a paired non-mock test task whose `Done when` names the boundary AND the ground-truth
  signal (e.g. `EXPLAIN ANALYZE shows index used`, `tool-call args logged`, `finishReason
observed`). Tasks touching only pure functions are exempt — do NOT force a real-stack test where
  no boundary is crossed." Conditional-on-boundary scoping prevents plan bloat.
- **`bkit-plan-review-3.md` prompt** (regression-risk / design-coverage lens) gains a check: "For
  each task crossing an external integration boundary, assert a paired non-mock test task exists
  with a ground-truth `Done when`. A boundary-crossing task with mock-only or absent real coverage
  → CRITICAL with reason `mock-only-coverage`." This is a static check on the plan task list — it
  needs no runnable stack, so it works on every consumer repo. The existing three-reviewer +
  max-wins-merge architecture absorbs the lens; no new parallel agent, no new plan step.
- Plan-time is a mandate verified downstream by C/E (build/debug check the test actually exists and
  fails-first), closing the "written but never executed" gap.

### G. Escape-hatch audit (debug + build Close Workflow)

When `REAL_STACK = absent` or `off`, the Close Workflow comment body adds a line, in
consumer-neutral language with no internal refs:

```
Real-stack verification skipped — runtime-only defects not gated (no test:real declared, or opted out).
```

Record `realStackReason` on the close-workflow step entry so the skip is auditable from state.

## Decisions

| Decided                                                                                                                                                              | Alternatives                                                                                                                                   | Why                                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Real stack" = optional consumer-declared `test:real` script, discovered via the existing `jq -e .scripts[...]` / turbo task pattern                                 | New `bkit-real-stack.md` config file (brainstorm 2); per-tracker config; hardcoded e2e command                                                 | Smallest surface that closes the gap; rides the mechanism build/debug already use for `test:integration`/`test:e2e`; no new file type or parser to drift. The config file's one real edge (vacuous-pass detection) is preserved via the status.json fail-then-pass record instead.         |
| Escape hatch = capability state `absent`/`off` degrading gates to CONCERNS (never hard-FAIL), with `[real-stack=off]` flag + loud close-comment + status.json record | Silent skip; mandatory hard-fail with no opt-out                                                                                               | A mandatory gate on a stackless / credential-less consumer is unsatisfiable, gets disabled, and the effort is wasted (the input's explicit warning). Silent skip recreates #143. Auditable CONCERNS is the only stable middle.                                                             |
| Hard FAIL fires ONLY when `REAL_STACK = live` AND `test:real` fails after remediation                                                                                | Hard FAIL on any unavailable stack; CONCERNS even on real failure                                                                              | Degrade where we cannot verify; refuse to degrade in the exact failure mode we are trying to catch.                                                                                                                                                                                        |
| Soak = fourth OBSERVE_MODE value, operator-selected, bounded by existing `MAX_DEBUG_ATTEMPT`                                                                         | Reuse existing retry loop unchanged (brainstorm 3); new top-level mode; make soak default for all unknown-cause bugs (brainstorm 2 Approach C) | The issue calls the accumulating-context iterative loop "decisively yes" and explicitly distinguishes it from the structured handoff. Reusing the existing constant and documenting the OBSERVE-vs-SOAK boundary in one place neutralises the dual-mode-drift and magic-number objections. |
| Reproduce-first + empirical-verify as conditional gate items on existing steps (reproduce sub-step + run-tests), NOT standalone steps                                | Two new standalone workflow steps (brainstorm 2)                                                                                               | Gates are cheaper and harder to skip than steps; the diagnose→remediate→run-tests loop already provides fail→pass machinery. One new `debug-reproduce` mini-step is justified because the `repro` transition must be a status.json artifact, not prose.                                    |
| Capability resolved once in Worktree Setup, persisted to status.json, reused by all gates                                                                            | Re-probe per gate; full cross-workflow capability engine (brainstorm 1 Approach C)                                                             | Single source of truth without the heavy gate-engine blast radius; resume-safe; ~15 lines of shell, not a subsystem.                                                                                                                                                                       |
| `test:real` runs LAST in the run-tests sequence                                                                                                                      | Run real-stack first/always                                                                                                                    | Cheap tiers (lint/typecheck/unit/integration) short-circuit before the expensive paid boundary runs — protects cost at 10x scale without new infra.                                                                                                                                        |
| Plan mandate = `@bkit-plan-generate` instruction + `@bkit-plan-review-3` lens, scoped to boundary-crossing tasks; verified downstream by build/debug                 | New dedicated plan step; new parallel review agent; hard plan gate; blanket mandate on all tasks                                               | Reuses the existing reviewer + max-wins merge; static check needs no runnable stack; boundary-scoping prevents plan bloat; downstream verification prevents the "written but never run" relocation of the defect.                                                                          |

## Approaches Considered

| Approach                                                                                               | Verdict                                          | Why                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1-A: Capability-gated gates + soak as 4th OBSERVE_MODE + `docs/testing.md` snippet                    | MERGED (spine)                                   | Strongest ship-speed-to-coverage; captures all three asks via existing patterns. Adopted as the backbone — refined to use `test:real` script discovery (B3) rather than a bespoke snippet block for the runnable command.     |
| B3-A: Reuse-everything `test:real` script convention + status.json fail-then-pass record, no new modes | MERGED (real-stack definition + cost discipline) | Its `test:real` discovery, run-last cost ordering, and fail-then-pass status field are adopted wholesale; its "no soak mode" stance is rejected in favour of B1's soak (the issue is decisive on the iterative loop).         |
| B2-A: Tiered repro contract via `bkit-real-stack.md` config file + graceful CONCERNS downgrade         | MERGED (downgrade semantics)                     | Its graceful-CONCERNS-not-FAIL degradation model and credential-missing handling are adopted; its config-file mechanism is rejected (new file type / parser / drift surface) in favour of the script convention.              |
| B2/B3 soak risk-mitigations (reuse existing cap, document the boundary)                                | KEPT (layered onto soak)                         | Folded onto the chosen soak mode to neutralise the dual-mode-drift and magic-number objections.                                                                                                                               |
| B3-C / B2 plan mandate scoped to boundary-crossing + named ground-truth signal                         | KEPT (layered onto plan change)                  | Boundary-scoping and the named ground-truth `Done when` are adopted to prevent plan bloat and vague mock-encoding tasks.                                                                                                      |
| B1-B: Hard non-skippable build e2e gate, no soak                                                       | REJECTED                                         | Hard gate becomes unsatisfiable on stackless consumers → disabled (the trap the input names); drops soak (the issue's "decisively yes").                                                                                      |
| B1-C / B2 single cross-workflow capability engine                                                      | REJECTED (as a subsystem)                        | Over-engineers for what one persisted field + conditional branches solve; largest blast radius, most resume/status invariants. Its single-source-of-truth idea is kept in lightweight form (one persisted `realStack` field). |
| B2-B: `bkit:repro`/`bkit:verify` scripts with no contract                                              | REJECTED                                         | Silent-no-op vacuous-pass problem; no auditable record of what "real" means. Superseded by `test:real` + the status.json fail-then-pass record.                                                                               |
| B2-C / B3-B: soak as the primary/default structural change                                             | REJECTED                                         | Removes the STANDARD/PIVOT/FINAL escalation valuable for known-shape bugs; classification risk; black-box loop. Soak stays an operator-selected mode alongside the structured loop.                                           |

## Trade-offs Accepted

**For the chosen design (B1-A spine + B3 definition + B2 downgrade + soak):**

- **Gain:** Closes the #143 invariant across all three workflows with ~85% reuse of existing
  machinery; consumer-agnostic by construction (absent capability = CONCERNS, never a brick);
  auditable from status.json state, not prose; no new config file, no new magic number.
- **Sacrifice vs the config-file approach (B2):** No structured, machine-declared tier/credential/
  cost metadata — the consumer encodes those in the `test:real` script itself. We accept this
  because the fail-then-pass status record recovers the only load-bearing benefit (vacuous-pass
  detection), and a free-form script is more flexible than a fixed schema.
- **Sacrifice vs the no-soak approach (B1-B / B3 no-mode):** One new OBSERVE_MODE value, one new
  prompt, and extra branch-coverage in resume/guard logic. Accepted because the issue is explicit
  that the iterative accumulating-context loop is the tool that actually cracked the bugs, and the
  cost is bounded by reusing the existing attempt cap.
- **Sacrifice vs the hard-gate approach (B1-B):** A consumer can opt out (`absent`/`off`) and ship
  mock-only green. Accepted deliberately — a hard gate gets disabled wholesale; a loud auditable
  opt-out keeps the signal alive and lets a human catch it before merge.
- **Residual limit:** bkit cannot verify that a `test:real` actually hits real deps (a consumer can
  mislabel a mock suite). This is an inherent ceiling of consumer-agnostic enforcement, surfaced as
  an open risk rather than papered over.

## Risks & Open Questions

- **Unsatisfiable-gate disablement.** Any "no mocks" gate a consumer cannot satisfy will be ripped
  out if it hard-blocks. Mitigated by per-repo declared capability + CONCERNS degradation + loud
  audit, but the ergonomics of the escape hatch must stay frictionless or consumers route around it.
- **Mock-vs-real boundary ambiguity.** "Real stack" is consumer-defined; a consumer mislabeling a
  mocked suite as `test:real` recreates #143 with a green light. No bkit-side change fully prevents
  this — stated as an accepted limit.
- **Cost/credential blast radius at 10x.** Gating both debug and build on a live-stack script
  multiplies spend and can exhaust quotas under autonomous looping. Bounded by existing retry caps
  and run-`test:real`-last ordering. **Open question:** should `test:real` run on every debug
  attempt and every soak iteration, or only on the final empirical-verify? Current design runs it at
  reproduce time + each run-tests pass + each soak iteration; a plan-time decision may cap soak
  iterations more tightly for paid endpoints.
- **OBSERVE_MODE enum surface.** Adding `soak` touches resume logic, every `Run only if
OBSERVE_MODE = off` guard, the Failure Path max-retry branch, and all gate tables. Risk of a
  half-wired branch shipping; mitigated by the single canonical boundary sentence in
  `.agents/workflows.md` and exhaustive guard-table updates in the plan.
- **bkit repo's own E2E tier is "out of scope" today.** Dogfooding `test:real` in the bkit repo
  requires deciding whether bkit grows its own real-stack test or declares `none`; that bkit-repo
  choice must sit outside consumer-facing `bkit:start/end` markers. **Open question for plan.**
- **`pnpm turbo run test:real --dry-run` detection.** The exact monorepo detection incantation for
  "does a `test:real` task exist" needs validation against the turbo version pinned in the repo; the
  single-package `jq -e` path is established and safe.
- **Consumer mirror upgrade.** The `docs/testing.md` managed-block edit and any new prompt
  (`bkit-debug-soak.md`) must flow through the install/upgrade mirror; mirror regen is batched at
  session end, not per-edit.
