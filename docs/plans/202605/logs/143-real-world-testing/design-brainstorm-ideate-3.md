# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover. **Distinct angle: minimalism & scope discipline.** The bias here is to close the #143 gap with the _fewest new moving parts_, reusing existing machinery (OBSERVE_MODE, the diagnose→remediate→run-tests loop, `docs/testing.md` tiers, the existing turbo/`package.json` script discovery) before inventing new modes/gates. Over-engineering is itself a failure mode: every new gate that can't be satisfied gets disabled (the input names this explicitly), and every new mode is markdown an orchestrator can drift from in 6 months.

The root cause in #143 is **one missing invariant, not a missing subsystem**: "a test that exercises the real boundary must exist and must fail before a fix and pass after it." Every approach below is judged by how cheaply it installs that single invariant.

A note on the consumer-agnostic crux that constrains all three: the gate cannot hard-require a runnable real stack, because consumers may lack one or it may cost money / need CI-absent credentials. So the "real-stack repro" must be a **named, declared capability** with an **auditable escape hatch** — and the smallest correct form of that is a single config key plus a script-name convention, not a new config file or schema.

---

## Approach A — Reuse-everything: one config key + one script convention, no new modes ⭐ Recommended

**Summary (one sentence):** Define "real stack" as an optional consumer-declared test script (`test:real`) discovered exactly the way `bkit-build` already discovers `test:integration`/`test:e2e`, gate the _empirical_ part of debug on it (repro must fail-then-pass when the script exists), and reuse the existing OBSERVE_MODE escalation as the iterative "soak" loop — adding **zero new modes** and one config key for the escape hatch.

The whole change is: (1) a convention — if a consumer's `package.json`/`turbo.json` exposes a `test:real` task it is the real-stack boundary; (2) the debug run-tests step and build run-tests step already glob scripts, so they run `test:real` when present and skip it cleanly when absent (mirrors the existing `jq -e ".scripts[\"$s\"]"` fallback); (3) reproduce-first and empirical-verify become _gate checklist items conditioned on `test:real` existing_, not standalone steps; (4) the escape hatch is a single declared key (`bkit:real-stack=none|<script>`) read from the same place the workflow already reads config, logged to `status.json` so the skip is auditable.

**Premortems:**

- **10× scale (more consumers, bigger corpora, more debug runs).** What breaks: a `test:real` that hits live LLMs/DBs is slow and costly; running it on every debug attempt and every build multiplies spend. Observability: `status.json` already records per-step verdicts and attempts — add a `realStack` field per run-tests entry (`run|skip|absent`) so cost/frequency is visible without new telemetry. Recovery: because it reuses the existing per-step retry caps (`MAX_TEST_ATTEMPT`), a runaway loop is already bounded; the only addition is running the real script _last_ in the existing script sequence so cheap tiers fail first and short-circuit.
- **6 months later (drift, undocumented invariants).** What breaks: the `test:real` convention is invisible if it lives only in workflow markdown; a maintainer adds a fourth tier and forgets the convention. Observability: the convention is documented in exactly one canonical home (`docs/testing.md` Tiers table, which already enumerates Unit/Integration/E2E/Smoke — add one row), and `.agents/docs.md` already routes `docs/testing.md` as `●` for Plan/Build/Debug, so it is read every run. Recovery: no magic numbers introduced; the only constant is a script name, which is self-documenting.
- **On-call at 3am (page shape, diagnosability).** What breaks: debug closes green but the real defect is still live because the consumer declared `bkit:real-stack=none`. Page shape: the `status.json` run-tests entry shows `realStack: skip` and the close-workflow comment carries the reason string — the on-call sees _immediately_ that the green is mock-only. Recovery path: re-run debug after wiring a `test:real` script; nothing in the workflow is destructive. This is the cheapest possible diagnosability win because it rides the existing status/comment surfaces.
- **Author leaves (bus factor).** What breaks: lowest of the three approaches — there is no new mode, no new subagent prompt, no new state machine to understand. The knowledge is one table row + one config key + a conditional in two existing run-tests steps. Anyone who understands the current `test:integration` discovery understands this. Bus factor is essentially unchanged from today.

**Risk-mitigation guidance (fold onto whichever approach is picked):**

- Make the escape hatch **loud, not silent**: when `test:real` is absent or set to `none`, the close-workflow comment must state "real-stack verification skipped — runtime-only defects not gated" in consumer-neutral language (no KN-/BAR- refs per MEMORY). A silent skip recreates the exact #143 failure.
- Run the real-stack script **after** lint/typecheck/unit/integration in the existing sequence so the expensive boundary only runs once cheaper gates are green — protects 10× cost.
- Record the repro's **fail-then-pass transition** in `status.json` (a `repro: fail` entry before remediation, `repro: pass` after) so the empirical-verify gate is auditable from state, not just prose. This is the single field that would have caught all three #143 bugs.
- Scope the bkit-repo's own `test:real` (its E2E tier is currently "out of scope for bkit" per `docs/testing.md`) **outside** `bkit:start/end` markers if it differs from the consumer-facing default (per the bkit-repo-vs-consumer scoping rule in MEMORY).

---

## Approach B — Promote OBSERVE_MODE into a true reproduce→fix→re-verify soak loop

**Summary (one sentence):** Rather than reuse OBSERVE_MODE as-is, generalise it: keep the existing instrument→analyse→revert flow but add a single-agent iterative variant that loops reproduce→instrument→fix→re-verify against `test:real` until green, which directly answers the input's "let one agent just keep at it" recommendation — at the cost of a more complex mode state machine.

This is heavier than A: OBSERVE*MODE today is a \_terminal* escalation (it runs once when `DEBUG_ATTEMPT` is exhausted, then hands off). Turning it into an iterative soak means changing its entry condition, its loop semantics, and its exit condition, and likely a new prompt (`bkit-debug-soak`) or a materially rewritten `observe-instrument`. The payoff is a closer match to "the thing that actually worked" in the input (accumulating context, each fix reveals the next bug).

**Premortems:**

- **10× scale.** What breaks: an unbounded soak loop against a live stack is the worst-case cost profile — a single agent burning the full 3600s timeout hitting paid LLM/DB endpoints. Observability: needs a _new_ per-iteration record in `status.json` (iteration count, repro verdict) that doesn't exist today. Recovery: must introduce a new cap (`MAX_SOAK_ITERATION`) — a new magic number, which the minimalism lens flags as added surface that can drift.
- **6 months later.** What breaks: two overlapping concepts ("observe" vs "soak") with subtly different loop semantics is a classic drift trap — a maintainer fixing one forgets the other, or they diverge. This is the same "two docs cover the same topic = a bug" smell `.agents/docs.md` warns about, applied to workflow modes. Observability: poor unless the design explicitly documents the OBSERVE vs SOAK decision boundary in one place. Recovery: requires consolidating back to one mode — i.e. partially un-doing this approach.
- **On-call at 3am.** What breaks: a soak run that exits non-green is harder to triage than a structured diagnose→remediate handoff because the reasoning is one long single-agent context rather than discrete diagnose/remediate artifacts. Page shape: the abort-handover still fires, but the evidence trail is less segmented. Recovery: same handover path as today, so not worse on recovery — only on diagnosability of _why_ it gave up.
- **Author leaves.** What breaks: highest bus-factor cost of the three. A bespoke soak state machine with its own entry/exit/iteration semantics is load-bearing tribal knowledge. Whoever wrote the OBSERVE↔SOAK distinction holds it.

**Risk-mitigation guidance (fold onto whichever approach is picked):**

- If soak is adopted at all, **do not add a parallel mode** — make it the _default behaviour_ of the existing diagnose→remediate→run-tests loop when `test:real` exists (i.e. the loop already re-runs Step 4 on FAIL; the only addition is that `test:real` must transition fail→pass to exit). That collapses B back toward A and avoids the dual-mode drift.
- If a genuinely separate soak agent is unavoidable, bound it with the _existing_ `MAX_TEST_ATTEMPT`/`MAX_DEBUG_ATTEMPT` constants rather than minting `MAX_SOAK_ITERATION`, so no new magic number enters the system.
- Document the OBSERVE-vs-SOAK boundary in a single canonical sentence in `.agents/workflows.md` so the distinction can't silently drift.

---

## Approach C — Plan-time non-mock test mandate as a hard scope gate

**Summary (one sentence):** Front-load the fix into the Plan workflow — make `@bkit-plan-generate` and the scope-check gate require that every plan whose changes cross an external boundary includes an explicit non-mock test task (and a `test:real` wiring task if absent), so the real-stack test exists _before_ build rather than being retrofitted in debug.

This directly answers Comment 1 ("Mandate more non mock tests as part of plan?"). It is additive to Plan only and complementary to A — it does not replace the debug gates, it ensures the artifact the debug gates check for actually gets planned. Minimalism caveat: a plan-time _mandate with no enforcement teeth_ is just advisory prose that drifts; the only way to make it real is to assert it in the existing scope-check or complexity-check gate, which is a small change to one prompt's checklist.

**Premortems:**

- **10× scale.** What breaks: low risk — Plan generates artifacts, it doesn't run the stack, so no cost multiplier. The risk is plan bloat: every plan gains boilerplate "add a real test" tasks even for changes that touch no external boundary. Observability: the scope-check verdict already records failures; a false-positive mandate shows up as plan churn. Recovery: scope the mandate to boundary-crossing changes only (LLM/DB/network/migration), detected from the plan's own task list.
- **6 months later.** What breaks: the mandate degrades to a checkbox nobody validates — plans say "real test added" but build never confirms the test exists or fails-first. This is the #72 failure mode (written but never executed) relocated to plan-time. Observability: nil unless build verifies the planned test actually exists and runs. Recovery: pair C with A so build/debug _check_ what plan _mandated_ — C alone is insufficient.
- **On-call at 3am.** What breaks: nothing pages from Plan; this approach has no runtime surface. Its failure is silent and upstream — a weak plan ships a weak build. Diagnosability is entirely deferred to build/debug, which is why C is a complement, not a standalone fix.
- **Author leaves.** What breaks: low — it's a checklist line in one or two existing plan prompts plus a scope-check assertion. Bus factor is small, but the _intent_ (why the mandate exists) must land in `docs/testing.md` or it reads as arbitrary ceremony.

**Risk-mitigation guidance (fold onto whichever approach is picked):**

- Make the plan mandate **conditional on boundary-crossing**, not blanket — a plan touching only pure functions should not be forced to invent a real-stack test (that's the over-engineering trap).
- The plan task must name the _boundary_ and the _ground-truth signal_ (e.g. "EXPLAIN ANALYZE shows index used", "tool-call args logged", "finishReason observed") so the build-time test has a concrete pass condition — vague "add integration test" tasks re-encode the #143 mock worldview.
- Pair with A so the mandate is _verified downstream_, not trusted; an unverified plan mandate is the #72 defect by another name.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Define "real stack" as an optional `test:real` script discovered via existing script/turbo detection | New `bkit:real-stack` config schema; new test-tier file; per-consumer manifest | Smallest surface that closes the gap; rides the exact mechanism already used for `test:integration`/`test:e2e`; no new file to drift |
| Escape hatch = one declared key (`none` or script name) logged to `status.json` + stated in close comment | Silent skip when script absent; mandatory hard-fail with no opt-out | Silent skip recreates #143; mandatory gate becomes unsatisfiable and gets disabled (input's explicit warning). Auditable opt-out is the only stable middle |
| Reproduce-first + empirical-verify as **conditional gate checklist items** on existing steps | Two new standalone workflow steps | Gates are cheaper and harder to skip than steps; the diagnose→remediate→run-tests loop already provides the fail→pass machinery — only a `repro` state field is added |
| Reuse the existing run-tests retry loop as the iterative "soak"; do NOT add a parallel mode (Approach A over B) | New SOAK mode / `bkit-debug-soak` prompt (Approach B) | A dual mode duplicates OBSERVE semantics and adds a magic-number cap + a prompt + state — high drift and bus-factor cost for marginal gain over the existing loop |
| Plan-time mandate adopted only as a **complement** to A, scoped to boundary-crossing changes | Plan mandate as the primary fix (Approach C standalone) | Plan mandate with no downstream verification is the #72 "written but never run" failure relocated upstream |
| Run `test:real` last in the existing script sequence | Run real-stack tests first/always | Cheap tiers short-circuit before the expensive boundary runs — protects 10× cost without new infra |

## Cross-Approach Risks

(Surface these in the final design's `Risks & Open Questions` section.)

- **Unsatisfiable-gate disablement.** Any "no mocks against the real stack" gate that a consumer cannot satisfy (no runnable stack, paid deps, CI-absent creds) will be disabled wholesale, taking the _good_ parts with it. The escape hatch must be granular (per-repo declaration) and the skip must be loud and auditable, never a hard block that forces `--no-verify`-style bypasses.
- **Mock-vs-real boundary ambiguity.** "Real stack" is consumer-defined; bkit cannot know which deps are external. The `test:real` convention pushes that judgement to the consumer, but a consumer who mislabels a mocked suite as `test:real` re-creates #143 with a green light. No bkit-side change can fully prevent this — it is an inherent limit of consumer-agnostic enforcement and should be stated as such.
- **Cost/credential blast radius at 10×.** Gating debug _and_ build on a live-stack script multiplies spend and may exhaust rate limits or quotas under autonomous looping. The retry caps bound it, but the design must decide whether `test:real` runs on every debug attempt or only on the final verify.
- **Consumer-facing advisory hygiene.** All new skip/advisory text shipped inside `bkit:start/end` markers must avoid KN-/BAR-/Linear refs (MEMORY: no-internal-refs rule) and describe the reason in plain terms.
- **bkit-repo's own E2E tier is "out of scope" today** (`docs/testing.md`). Dogfooding any `test:real` convention in the bkit repo itself requires deciding whether bkit grows its own real-stack test or declares `none` — and that bkit-repo-specific choice must sit outside consumer-facing markers (MEMORY: bkit-repo-vs-consumer scoping).
- **ASCII-operator and no-Unicode constraints** apply to every workflow/prompt edit the chosen approach lands (MEMORY: `!=`/`>=`/`<=`, never `≠`/`≥`/`≤`).
