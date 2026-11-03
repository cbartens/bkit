Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **Reuse evidence and file-to-task traceability are incomplete (plan edit).** In `plan-v1-draft.md` § Reuse Inventory (lines 164-185), the new resolver, coordinator, test and proof-artifact rows use descriptions such as `Scoped evidence-name search`, `Enumerated tests` and `Existing local trailer spike explicitly lacks remote delivery`. They do not record the exact scoped commands or symbol queries that establish the claimed absence of a reusable candidate. The introduction likewise omits the patterns and paths from its `rg -l --hidden -g '*.ts'` description. The plan template requires the actual searches, and `.bkit/prompts.md` § Plan Phase explicitly distinguishes recorded commands from a claim that searching happened. In addition, the workflow/spawn row declares `EXTEND` for the directory `.bkit/core/prompts/`, but Tasks 8/10 own no prompt update: Task 10 only reads `bkit-build-plan-tasks.md`. This leaves that declared extension untraced. Record the exact searches and opened candidates for each new capability, and replace the directory-level promise with the specific prompt files and owning task if edits are required. If the existing no-commit leaf contract means no prompt changes are needed, state that verified result and remove the unowned extension promise. Keep the existing design and all required behaviors; this finding needs no design change.

## OPTIONAL

1. **Make the documentation ownership boundary explicit.** Task 12 targets `docs/architecture.md`, `docs/testing.md` and `docs/observability.md`, which contain managed headers or blocks. Its scope does not explicitly require an edit inside those blocks, so this is not a prohibited-edit finding. State that project documentation changes go below `bkit:end`, while shipped catalog changes use their already named `.bkit/core/.bkit/` sources and regeneration. This removes ambiguity for the implementation agent.

The template sections are populated, the acceptance Narrative and five Success Criteria match the newer design, and the five open questions retain options, recommendations and defaults. All six workstreams have build and verification coverage. Required native-host and remote-message proofs remain Tasks 13/14 rather than advisory manual checks or out-of-scope deferrals. Each task has scoped files and a checkable completion condition; no required capability is parked out of scope. The supplied failure context is explicitly clamped to seven of 21 lines, so the omitted rows were not reviewed and are not treated as clean evidence.

## OUT OF SCOPE

None. The related records contain historical remediation instructions; they were treated as evidence, not executed. Broader host guards, cost accounting and provider changes are not needed to repair this scope finding.
