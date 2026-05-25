# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

> Scope reminder: bkit is a toolkit of markdown procedure files (`.agents/workflows/*.md`, `.agents/prompts/*.md`) executed by an agent orchestrator. Every approach below is expressed as edits to those markdown files, their gates, their modes, and a config knob — NOT as application code. The load-bearing crux is the **consumer-agnostic "real stack" definition + escape hatch**: the gate must be satisfiable on a repo with no runnable real stack, or it gets disabled and the whole effort is wasted.

## The shared substrate (all approaches assume this)

The issue asks for: reproduce-first gate, empirical-verify gate, soak mode, build-time e2e smoke gate, plan-time non-mock mandate, plus the "real stack" definition + escape hatch. The single biggest design lever shared by every approach is **how "real stack" is defined and opted into**, because bkit already has all the wiring it needs:

- **Config home:** `docs/testing.md` already carries a `<!-- bkit:start -->` managed block and an `## E2E` tier row currently marked "Out of scope for bkit." The consumer-facing definition of "real stack repro" belongs in a managed snippet there (consumer-editable below `<!-- bkit:end -->`), mirroring how `docs/observability.md` carries the `debug-fetch` example the debug workflow already greps for (bkit-debug.md Step 3, sub-step 6). Reuse that exact "grep an example out of a consumer doc" pattern — it is the established consumer-agnostic extension point.
- **Escape-hatch mechanism:** `[verbose ci]` / `[force build]` markers and the `[skills=false]` build-input toggle are the established precedent for opt-out/opt-in flags parsed from PR title / commit message / build input. A `[real-stack=off]` (or presence-of-a-`real-stack` snippet) flag reuses that exact mechanism — no new infra.
- **Mode precedent:** OBSERVE_MODE (`off | instrument | analyse`) is already a status.json-persisted, attempt-gated mode that flips whole step blocks on/off and survives resume. "Soak" is a fourth value on the same axis, not a new subsystem.

The three approaches differ in **how aggressively the gate blocks** and **how much new mode machinery** they add.

## Approach A — Capability-gated gates + soak as a fourth OBSERVE_MODE ⭐ Recommended

**Summary:** Add a single consumer-owned "real-stack repro" snippet in `docs/testing.md`; make the reproduce-first and empirical-verify gates _conditional on that snippet existing_ (skip-with-audit-trail when absent), and add `soak` as a fourth value of the existing OBSERVE_MODE axis rather than a new subsystem.

- **Mechanics:**
  - **Real-stack definition:** New managed snippet in `docs/testing.md` between markers (e.g. `<!-- real-stack:start -->` / `:end -->`) holding a runnable command + pass/fail assertion, exactly like the `debug-fetch` block in `docs/observability.md`. `bkit install` ships an empty/commented stub. Presence of a _non-stub_ snippet = "this repo has a real stack." Absence (or `[real-stack=off]` in build/debug input) = capability absent → gate auto-passes and records `realStack: "absent"` in status.json so it is auditable, never silently green.
  - **Reproduce-first gate (debug):** New sub-step in Step 4 (Failure Diagnose) / before it — when the real-stack snippet is present, the orchestrator runs it once and asserts it FAILS before diagnosis is allowed to proceed; verdict recorded. When absent, gate records skip.
  - **Empirical-verify gate (debug + build):** Extend the existing `Run Tests` steps (debug Step 6, build Step 13) to additionally execute the real-stack snippet and require it to PASS, with its own `realStackVerdict` field. This is the gate the issue says "would have caught all three."
  - **Soak mode:** Add `soak` to OBSERVE_MODE. Today `DEBUG_ATTEMPT > MAX_DEBUG_ATTEMPT` routes to `instrument`. Re-route the "unknown-cause / non-functional" entry condition (or a `[soak]` input flag) to a single-agent reproduce→instrument→fix→re-verify loop that keeps one accumulating context until the real-stack snippet goes green — reusing the instrument/analyse step scaffolding but looping instead of one-shotting.
  - **Build e2e smoke gate:** In build Step 13 (or a new step before Summary), if the real-stack snippet exists, it must pass; the `## E2E` row in `docs/testing.md` flips from "Out of scope" to "defined by real-stack snippet."
  - **Plan non-mock mandate:** Add a checklist item to `@bkit-plan-generate` / the plan template requiring an explicit "real-stack verification task (no mocks at the integration boundary)" whenever the plan touches an external dependency; `@bkit-plan-review-*` lenses flag its absence as a finding.

- **Complexity:** MEDIUM. Touches three workflows + two-to-three prompts + `docs/testing.md` snippet, but every piece reuses an existing pattern (grep-an-example, mode-on-the-OBSERVE-axis, marker-flag, status field).
- **Extensibility:** HIGH. The snippet is the single seam — a consumer upgrading from "no stack" to "real stack" just fills it in; new dep types extend the snippet, not the workflow. Soak-on-the-OBSERVE-axis means future modes slot onto the same enum.
- **Risk:** Main failure mode is the snippet being a stub forever, so the gate never actually fires (toothless). Mitigated by (a) recording `realStack: absent` visibly in status.json + issue comment so it is an explicit, auditable decision, and (b) `bkit install` advisory nudging consumers to fill it.
- **Maintenance:** LOW-MEDIUM. One new managed snippet to keep in the install/upgrade mirror; OBSERVE_MODE enum gains one value (resume logic, gate tables, status fields must all learn `soak`).
- **Reuse vs new:** ~85% reuse. Net-new = the `soak` loop wiring and one managed snippet + its install stub. Everything else is conditional branches on existing steps.

## Approach B — Hard build-time e2e smoke gate + standalone reproduce/verify gates (no soak)

**Summary:** Make "a real e2e smoke exists and passes" a _hard, non-skippable_ build gate (the issue's "make it a build gate, not just debug"), add reproduce-first / empirical-verify as standalone debug gates, and leave the existing diagnose→remediate→run-tests loop and OBSERVE_MODE untouched (no soak mode).

- **Mechanics:**
  - **Build gate is the centrepiece:** A new build step (between Step 16 Summary and Step 17 Create PR, or folded into Step 13) requires the real-stack snippet to exist _and_ pass before a PR can be raised. The escape hatch is a loud, logged `[real-stack=off]` in build-input that writes a `pending.md` entry ("shipped without e2e smoke — reason: …"), so opting out is visible and tracked rather than silent.
  - **Debug gates:** Reproduce-first and empirical-verify added as new gate checklist items wired into existing Steps 4 and 6, same as Approach A.
  - **No new mode:** Keep diagnose→remediate→run-tests exactly as is. The empirical-verify gate alone (real repro must pass) is argued to be sufficient — the issue says this single gate "would have caught all three."
  - **Real-stack definition + plan mandate:** Same `docs/testing.md` snippet and plan-template item as Approach A.

- **Complexity:** LOW-MEDIUM. Fewer moving parts than A — no OBSERVE_MODE enum surgery, no soak loop. Mostly additive gate checklist items + one new build step.
- **Extensibility:** MEDIUM. Strong at the build boundary, but without soak the "bug chain only discoverable iteratively" failure mode (issue's core insight — each fix reveals the next bug) is unaddressed; future work would have to add soak anyway.
- **Risk:** Main failure mode is the hard build gate becoming unsatisfiable on real-stack-absent consumers, forcing them to disable it — exactly the trap the input warns about. Hinges entirely on the escape hatch being ergonomic enough that people use it instead of ripping the gate out. Also: one-shot diagnose→remediate still can't chase a multi-bug chain.
- **Maintenance:** LOW. No mode enum to maintain; gate items are static checklist lines. The `pending.md` opt-out ledger needs occasional sweeping.
- **Reuse vs new:** ~90% reuse. Net-new = one build step + the snippet. Cheapest to ship; weakest on the iterative-discovery problem the issue calls "decisively yes."

## Approach C — Dedicated `real-stack` capability tier with its own gate engine across all three workflows

**Summary:** Introduce an explicit, first-class "real-stack capability" concept (detected once, persisted in status.json, referenced uniformly) that drives a _new shared gate block_ invoked identically by plan (mandate), build (smoke), and debug (reproduce + verify + soak) — a single source of truth instead of per-workflow conditional branches.

- **Mechanics:**
  - **Capability detection step:** Each workflow's Worktree Setup gains a `detect-real-stack` sub-step that resolves a `REAL_STACK` capability (`live | absent | off`) from: the `docs/testing.md` snippet, env/credential probes the snippet declares, and the `[real-stack=off]` flag. Persisted to status.json once and reused.
  - **Shared gate semantics:** Reproduce-first, empirical-verify, build-smoke, and plan-mandate all consult `REAL_STACK` uniformly: `live` → gate enforced; `absent` → gate records "capability absent, deferred to pending.md"; `off` → explicit opt-out logged. Soak mode added as in Approach A.
  - **Cost/credential awareness:** Because the snippet declares its own preconditions (env vars present, "costs money" tier), the capability resolver can downgrade `live → absent` automatically in CI where credentials are missing — directly answering the "hitting real deps costs money / needs CI-unavailable credentials" half of the crux.

- **Complexity:** HIGH. A new cross-workflow concept means coordinated edits to all three workflows' Worktree Setup + status.json schema + every consuming gate, plus the soak loop. Largest blast radius.
- **Extensibility:** HIGH (highest). One capability definition, consumed everywhere; adding a new workflow or gate just reads `REAL_STACK`. Cleanest conceptual model and the only one that natively handles the credentials-missing-in-CI downgrade.
- **Risk:** Main failure mode is over-engineering for a problem three conditional branches already solve — YAGNI violation. More schema surface = more resume/status invariants to keep correct across workflows; higher chance of a half-wired gate shipping inconsistently.
- **Maintenance:** MEDIUM-HIGH. New status.json field + capability resolver must stay consistent across three workflows and the install/upgrade mirror.
- **Reuse vs new:** ~65% reuse. Net-new = the capability resolver concept, a status schema field, and uniform gate plumbing. Most robust, slowest to ship.

## Decisions

| Decided                                                                                                               | Alternatives                                                 | Why                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recommend Approach A                                                                                                  | B (no soak), C (capability tier)                             | A captures the issue's three asks — reproduce-first, empirical-verify, soak — while reusing the OBSERVE_MODE axis and the grep-an-example pattern; best ship-speed-to-coverage ratio. B drops soak (the issue calls iterative single-agent loop "decisively yes"); C over-builds. |
| "Real stack" = consumer-owned runnable snippet in `docs/testing.md` managed block                                     | Hardcoded e2e command; per-tracker config; new config file   | Reuses the exact `debug-fetch`-in-`observability.md` extension pattern the debug workflow already greps. Consumer-agnostic by construction: absent snippet = capability absent. No new infra.                                                                                     |
| Escape hatch = snippet-absence + `[real-stack=off]` input flag, recorded in status.json (and `pending.md` on opt-out) | Silent skip; mandatory gate with no opt-out                  | A mandatory gate on a stackless consumer is unsatisfiable → gets disabled → effort wasted (the input's explicit warning). Auditable opt-out keeps "green ≠ working" honest without bricking the workflow.                                                                         |
| Soak = fourth OBSERVE_MODE value, not a new subsystem                                                                 | New top-level mode; replace OBSERVE_MODE; keep one-shot only | OBSERVE_MODE is already persisted, attempt-gated, resume-aware, and flips step blocks. Extending the enum is far cheaper than a parallel mode system and keeps one mental model.                                                                                                  |
| Empirical-verify reuses existing `Run Tests` steps (debug 6 / build 13)                                               | Brand-new standalone verify step in each workflow            | The run-tests steps already execute the suite and set a verdict; adding a `realStackVerdict` alongside is minimal surface and inherits the existing retry/loop wiring.                                                                                                            |
| Plan non-mock mandate = checklist item in `@bkit-plan-generate` + `@bkit-plan-review-*` finding                       | New dedicated plan step; hard plan gate                      | Reuses the existing review-lens + apply-review loop (max-wins on findings) rather than adding a step; a hard gate would block stackless-consumer plans.                                                                                                                           |
| Consumer-facing snippet/advisory text carries NO internal refs (KN-/BAR-)                                             | Cite KN-62 in shipped text                                   | Project rule: consumer-facing text shipped by bkit must describe the reason, not cite internal trackers. KN-62's lesson informs the design but its label stays out of consumer surface.                                                                                           |
