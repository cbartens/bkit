Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

## CRITICAL

None. Template structure intact (all mandated top-level sections present, correct order); `Acceptance Scenario` (incl. `Derived Test Matrix`) and `Open Questions & Assumptions` are populated and well-shaped; every plan task traces to a named design workstream (WS-1…WS-9) with no unjustified expansion; every `Out of Scope` row is genuinely `Exempt` (later ideas / dropped smoke job / run-product) with no required work parked there.

## OPTIONAL

- **Success Criteria = 7 bullets** vs template `Spec` guidance "<=5 bullets". The plan inherits the design's 7 verbatim per "Design → verbatim; do not rewrite". The two template clauses conflict for a design with count ≠ 5; flagging for the human to confirm either the verbatim 7 or a distilled "smallest set proving feature". Not a content gap.
- **Prompt revision not carried into the report contract.** Design WS-6 / Data Model require the report to record the **prompt revision** with the score ("prompt revision recorded with the score"). Architecture (`examples/analysis-prompt.md`) and Task 7 name the merge SHA + `bkitVersion` but drop the prompt-revision field. Add it to Task 7 `Done when` and the prompt's content list.
- **`### Database Migrations` subsection dropped.** The template places it under `## Architecture & Component Changes`; the plan omits it entirely (no DB). Structure is otherwise intact — consider an explicit `### Database Migrations` → "None — no database" line to match the template shape, mirroring the `Data Schema Changes` "None" treatment.
- **Ruleset drift repair not explicit in Task 4.** Design WS-4 states verify-and-repair covers ruleset drift "like the rest of the durable root"; Task 4 `Done when` covers the payload shape and the no-required-PR constraint but does not state the verify-and-repair path for ruleset drift. Name it so the durable guard is testably repaired, not only created.
- **Answered design questions not carried forward as assumptions.** Design `Risks & Open Questions` answered (default A): run-marker location, what `main` holds, executed-count recorded-vs-gate, C10 de-risk, `data.js` owner-check. The plan references most in tasks/`Future phase recommendations`, but only some surface in `Open Questions & Assumptions`. Per template "carry its options / recommendation forward where already answered", folding the settled five in as short assumptions would tighten the human-confirmation page.
- **Verify the two comparison deferral keys.** Assumption states `504-second-example-extending-existing-code` and `504-external-suite-comparison` already exist in `docs/deferrals.jsonl`, and "this cycle adds none". `related-deferrals.md` surfaced only `504-additional-example-apps`; rev-notes-4 §B frames `504-external-suite-comparison` as a **new** row added with the design. Empty fetch is inconclusive (not authoritative absence), but the plan's "Verified present" claim should be re-confirmed against the live ledger before Gate 1.
- **Rollback adds a non-template axis.** The `Rollback Strategy` table adds a "Run repo" axis beyond the template's DB / Code / Risk window. Useful and correct (run repo is out of band); noting only for template-shape awareness.
- **Edge Case `[skip ci]` recovery line + breaking-release runbook** are listed as contract-table content (Task 9) but no `Done when` sub-item pins the `[skip ci]` recovery procedure specifically; the design flags KN-11 as a hard failure mode. Consider naming it in Task 9's `Done when`.

## OUT OF SCOPE

- `504-additional-example-apps` (bill splitter / meeting planner / recipe scaler / password checker) — appeared in `related-deferrals.md`; each is a new fixture folder + the same runner, already parked in the plan's `Out of Scope`. No action; not this cycle's plan surface.
- `#43` diff-aware LLM-judge evals, `#45` per-host evidence, `#232` flaky-grader CI policy — related issues cited in plan `Related Issues`; they are context this example supplies, not plan surfaces. No expansion applied.

## SUGGESTED SCOPE EXPANSION

- `504-additional-example-apps` — source: `related-deferrals.md` (OPEN) — overlaps the fixture + runner surfaces (WS-1/WS-4) — recommendation: keep deferred; plan already lists it `Exempt`.
- `runs-gate-repo-flag-ignored-pr-resolved-from-checkout` — source: design § Risks (`docs/failures.jsonl`, OPEN) — overlaps the runner/bats constraint (WS-8 non-scope) — recommendation: keep deferred; the plan already encodes only the constraint, not the fix.
- `related-failures.md` — `None.` → no failure-sourced candidate overlaps this plan's surfaces.
