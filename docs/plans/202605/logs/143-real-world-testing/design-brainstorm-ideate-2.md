# Design Brainstorm & Ideas

Lens: Developer/operator ergonomics — how do the gates degrade gracefully when no real stack is available, and how do they avoid being disabled as a first resort?

---

## Approach A — Tiered Repro Contract with Explicit Stack Declaration and Graceful Downgrade ⭐ Recommended

**Summary:** Introduce a `bkit-real-stack.md` config file (consumer-authored, committed) that declares what constitutes the "real stack" for that repo, what credentials/services it needs, and a per-tier availability signal. Gates in debug, build, and plan read this contract and downgrade their evidence tier rather than silently skipping — a CONCERNS verdict with an auditable "real-stack unavailable" reason is emitted instead of a PASS or silent skip.

**Complexity:** MEDIUM. One new config file type, one new step in debug (reproduce-first), one new gate condition in build (e2e smoke), one new mandatory plan checklist item. No new workflow modes.

**Extensibility:** The tier model (tier-1: unit/mock, tier-2: real-deps-local, tier-3: real-deps-CI) can absorb future test categories without changing gate semantics. New consumer repos declare only what they have. The contract file is consumer-authored so bkit stays agnostic.

**Risk:** Consumers declare the wrong tier or leave `bkit-real-stack.md` absent entirely, and the gates stay at tier-1 perpetually. Mitigation: plan workflow mandates non-absent `bkit-real-stack.md` as a gate item; absence = CONCERNS (not silent skip). The plan agent's review step explicitly checks "is there at least one tier-2 or tier-3 test task for integration boundaries?"

**Maintenance:** One contract file per consumer repo. bkit itself does not maintain the stack definition. Contract format is stable; consumers update it as their stack evolves.

**Friction vs ideal:** Low friction on the bkit side. Consumer repos need to author one config file. Workflows need three surgical additions: (A) debug Step 2 (worktree setup) reads `bkit-real-stack.md` and sets `STACK_TIER`; (B) debug Step 4 (failure-diagnose) gets a new pre-condition: "if STACK_TIER >= 2, reproduce-first: run the declared repro command and confirm it fails before diagnosing"; (C) build Step 6 (plan-verify) gains a gate bullet "if real-stack test declared, it passes". The biggest existing-codebase friction is that `bkit-debug-failure-diagnose.md` currently has no concept of "confirm the failure is real before theorising" — this is a new mandatory step in that prompt's Process, which touches an established subagent prompt.

### How the gates degrade gracefully

- `bkit-real-stack.md` absent or declares tier-1 only: all three gates emit CONCERNS with reason `real-stack-unavailable`, not PASS. The orchestrator narrates this. The operator can override by setting `STACK_TIER_OVERRIDE=1` in the session to suppress the CONCERNS downgrade for a known-cost scenario (e.g., LLM API costs too high in this run).
- Real stack declared but credentials not present in worktree env: the repro command exits non-zero at setup; gate emits CONCERNS with `repro-credentials-missing`, not FAIL (which would abort the workflow). The diagnose step is still permitted but is marked `empirical-unverified` in the diagnosis artifact.
- Real stack declared and available but empirical-verify command fails after remediation: that is a hard FAIL — the gate does not degrade here, because this is exactly the failure mode we are trying to catch.

### Soak mode vs OBSERVE_MODE

OBSERVE_MODE (instrument → analyse → revert) is designed for known-shape bugs where observation data is needed before diagnosis. Soak mode is for unknown-cause/non-functional bugs where iterative reproduce→fix→verify loops are needed without the overhead of structured handoffs. These are orthogonal. Approach A introduces soak mode as a fourth `OBSERVE_MODE` value (`soak`) selectable via `OBSERVE_MODE_OVERRIDE=soak` in session input. When soak: the diagnose→remediate handoff is collapsed into a single `@bkit-debug-soak` subagent with accumulating context, a reproduce command it must re-run after each fix attempt, and a loop limit of `MAX_SOAK_ATTEMPT` = 5. This avoids the structural change of removing the existing three-step loop, which is still correct for known-shape bugs.

### Plan-time mandate

Plan workflow Step 4 (review) adds a new lens to `@bkit-plan-review-3` (or a dedicated `@bkit-plan-review-realstack`): "for each task that touches an external integration boundary (DB, API, model), is there a corresponding non-mock test task? If not, FAIL with reason `mock-only-coverage`." This is a plan-time gate, not a runtime gate, so it does not require a runnable stack — it is a static check on the plan's task list. The plan-generate prompt gets a new instruction: "for each integration task, include a paired test task whose description explicitly names the real dep (e.g., `test: verify corpus search uses index — EXPLAIN ANALYZE against real DB`)."

---

## Approach B — Empirical Verify as a First-Class Workflow Step (No New Config File)

**Summary:** Rather than introducing a config file, make empirical verification a mandatory named step in the debug workflow between remediate and run-tests. The step runs a consumer-declared `bkit:verify` package.json script (or a fallback probe); if the script is absent the step records `empirical-skipped` in status.json and emits CONCERNS. The reproduce-first gate becomes an instruction inside the diagnose prompt: "before theorising, attempt to reproduce by running `pnpm bkit:repro` if present."

**Complexity:** LOW to MEDIUM. No new config file. One new workflow step in bkit-debug (Step 5.5 — Empirical Verify) between the existing Step 5 (remediate) and Step 6 (run-tests). One new convention: `bkit:repro` and `bkit:verify` scripts in consumer `package.json`.

**Extensibility:** Any repo can add `bkit:repro` / `bkit:verify` scripts at any granularity. The convention is lightweight and familiar. However, it provides no structured way to declare tier, credentials, or cost — a `bkit:verify` script that silently no-ops because credentials are absent will look like a PASS.

**Risk:** The main failure mode is the silent no-op. A `bkit:verify` that exits 0 because it cannot reach the real stack (e.g., DB not running) is indistinguishable from one that ran and passed. Without the config contract, there is no way to distinguish "verified against real stack" from "script ran, stack absent, exited 0 vacuously." This re-creates the mocked-worldview problem in a different form.

**Maintenance:** Consumers maintain two package.json scripts. Low friction initially, but the convention drifts: teams forget to update `bkit:repro` after refactoring, or write it as a mock probe. No auditable record of what "real" means for this repo.

**Friction vs ideal:** Very low workflow friction — one new step, no new files on the bkit side. But the consumer-side convention is under-specified and relies on discipline. The plan-time mandate has no good home: the plan reviewer cannot check for `bkit:repro` coverage because it is an implicit convention, not a declared contract.

### How the gates degrade gracefully

- `bkit:repro` absent: gate emits CONCERNS `repro-script-absent`. Workflow continues.
- `bkit:repro` present but exits 0 before remediation (i.e., cannot reproduce): gate emits FAIL `repro-did-not-fail` — this is correct behaviour and matches the reproduce-first intent.
- `bkit:verify` absent after remediation: gate emits CONCERNS `verify-script-absent`. The diagnose→remediate loop completes without empirical closure.

---

## Approach C — Soak-First Debug Mode as the Primary Change, Gates as Follow-On

**Summary:** Treat the iterative soak loop as the primary structural change, making it the default for all unknown-cause bugs (replacing the structured diagnose→remediate handoff for that class). Gates (reproduce-first, empirical-verify) are embedded as invariants inside the soak subagent prompt rather than as separate workflow steps. The "real stack" definition is deferred to a follow-on issue; the soak subagent is simply instructed to "prefer real execution over static analysis" and "re-run the failing behaviour after each fix."

**Complexity:** MEDIUM for the soak mode itself. LOW for the gates (they are prompt instructions, not workflow steps). HIGH operational complexity because "unknown-cause" vs "known-shape" classification is itself done by the diagnose agent — if the agent misclassifies, the soak loop runs where it shouldn't.

**Extensibility:** The soak subagent accumulates context well for single-bug chains. But it does not scale to parallel bug chains (different components) and has no structural way to record intermediate verified states in status.json. Each soak loop is a black box to the orchestrator until it exits.

**Risk:** The classification problem. The current debug workflow uses STANDARD → PIVOT → FINAL strategy escalation, which is correct for known-shape bugs. Replacing this with a soak loop for any "unknown-cause" bug removes the structured escape hatch. A soak agent that runs 5 iterations without progress has no signal to escalate — it just exhausts `MAX_SOAK_ATTEMPT` and reaches the Failure Path, whereas the structured loop would have escalated to OBSERVE_MODE for instrumentation.

**Maintenance:** Ongoing cost is high: the soak subagent prompt becomes the load-bearing document for all unknown-cause debug logic, making it long and hard to reason about. The reproduce-first and empirical-verify invariants are buried in prose instructions rather than being auditable gate checklist items.

**Friction vs ideal:** Low friction to ship (no new config file, no new workflow steps). High friction to maintain and audit. Does not address the plan-time mandate at all. Does not give build a gate for e2e smoke coverage.

---

## Decisions

| Decided                                                                                                                          | Alternatives                                                    | Why                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Introduce `bkit-real-stack.md` as a consumer-authored stack contract rather than relying on package.json script conventions      | Approach B's `bkit:repro`/`bkit:verify` scripts                 | Config file allows structured tier declaration, credential requirements, and cost signals. Scripts allow silent no-ops. Config is auditable; a missing config is a CONCERNS signal at plan time.                                                                                                                             |
| Soak mode is a new `OBSERVE_MODE` value (`soak`), orthogonal to the existing instrument/analyse/revert sequence                  | Making soak the default for all unknown-cause bugs (Approach C) | OBSERVE_MODE states are already tracked in status.json with `observeMode` field; adding `soak` is a natural extension. Collapsing the structured loop into soak removes the STANDARD/PIVOT/FINAL escalation which is valuable for known-shape bugs.                                                                          |
| Reproduce-first gate lives as a mandatory Process step inside `bkit-debug-failure-diagnose.md`, not as a separate workflow step  | A new standalone Step 3.5 in bkit-debug.md                      | The diagnose subagent is already the "no diagnosis until I understand the failure" agent. Adding a pre-condition inside its prompt ("run the declared repro command; if it does not fail, set Verdict FAIL with reason `repro-did-not-fail`") is surgical and keeps the workflow step count stable.                          |
| Empirical-verify gate lives as a new explicit Step 5.5 in bkit-debug.md (between remediate and run-tests)                        | Embedding it as a prompt instruction in the remediate agent     | The remediate agent currently ends at "local tests pass." The empirical-verify step needs to run the declared real-stack repro command and record the result in status.json as a separate auditable artifact. A prompt instruction would not produce a status.json entry and could not be enforced by a gate checklist item. |
| Plan-time non-mock mandate is a new review lens in `@bkit-plan-review-3` (or a renamed variant), not a new plan workflow step    | A separate `@bkit-plan-review-realstack` parallel agent         | Modifying an existing review agent's prompt is lower friction than adding a fourth parallel agent to plan Step 4. The existing three-reviewer architecture can absorb a new lens without structural change.                                                                                                                  |
| Gates emit CONCERNS (not FAIL) when real stack is unavailable, and FAIL only when real stack was reached and verification failed | Making unavailable-stack a hard FAIL                            | A hard FAIL on every consumer repo that lacks credentials in CI would make the gates universally disabled. CONCERNS preserves the signal ("we did not verify empirically") while allowing the workflow to continue and be audited by a human before merge.                                                                   |
