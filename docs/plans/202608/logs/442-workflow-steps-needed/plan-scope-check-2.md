Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

None found.

- **Template conformance:** `plan-v2-reviewed.md` carries every mandated `docs/plans/template.md` section, populated (not placeholder): Context & Goals, Acceptance Scenario (Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, Derived Test Matrix, Human Confirmation), Breaking Changes & Naming Review, Open Questions & Assumptions (7 questions, each with options/recommendation/default), Alternative Approaches & Recommendations, Out of Scope, Suggested Scope Expansion, Security & Privacy, Pre-Flight/Dependencies + Gate 1, Data Schema Integration, Architecture & Component Changes, Supersession Inventory, Documentation Updates, Rollback Strategy, Agent Execution Runbook (22 tasks) + Gate 2/3, Verification Plan + Gate 4, Manual Verification.
- **Runbook task completeness:** All 22 tasks (`docs/plans/202608/logs/442-workflow-steps-needed/plan-v2-reviewed.md:694-744`) carry scope (a concrete file-level edit), a `**Done when:**` line with codebase-verifiable assertions (grep counts, exit codes, `vitest run` targets), and a `Requires:` dependency edge. No cycles found; no edge points backward across a wave.
- **Build/verify pairing:** every scope item has both a build task and a verification task — either inline in its own `Done when` (e.g. Task 1's manual `sh -c` probes, Task 4's `git diff` check) or via a dedicated downstream audit task (Task 5 gates Task 4; Task 10 gates Tasks 6-9; Task 15 gates Tasks 12-14; Task 19 gates Tasks 16-18; Task 22 is the terminal regen + full-suite gate).
- **Derived Test Matrix ↔ Runbook mapping — verified bidirectional, all 27 rows:**
  - Rows 1-2 (emitter shape/refusal) → `tests/step-skipped-row.bats` → Task 2
  - Rows 3-4 (fold no-op, both reducers) → `bkit-status.test.ts` / `tests/counter-derive.bats` → Task 2
  - Row 5 (`counter_count` unaffected, bare + lens-suffixed) → `tests/counter-derive.bats` → Task 2
  - Rows 6, 8, 9 (skip-recording presence/lens-suffix/reason-wording) → `bkit-skip-recording-audit.test.ts` → Task 5
  - Rows 10-13 (`(if present)`, version-chain resolution, partial-width fan-out, design `Failures:` sum) → `bkit-input-tolerance-audit.test.ts` → Task 10 (row 13 also touches Task 8's `bkit-verdict-vocabulary.test.ts` check)
  - Rows 7, 14-17, 19 (enum completeness, sole-emitter continuity, hard-set placement, predicate-artifact linkage, sensitivePaths promoting-only, tabulated plan predicate set) → `bkit-applicability-audit.test.ts` → Task 15
  - Row 18 (absent `sensitivePaths` → `[]`) → `bkit-config-keys.test.ts` → Task 15
  - Row 20 (`scope-check-2` absent from live surface) → `bkit-applicability-audit.test.ts` / grep → Tasks 14-15
  - Rows 21-23 (Step 3 two-artifact assert, `PLAN_ESCALATE` terminal route, debug `NO-REPRO`) → `bkit-applicability-audit.test.ts` → Task 19
  - Row 24 (catalog parity) → `bkit-catalog-parity.test.ts` → Task 14
  - Row 25 (verdict-vocabulary linkage) → `bkit-verdict-vocabulary.test.ts` → Task 8
  - Rows 26-27 (scratch-consumer install/upgrade, seeded-prune) → `bkit-install.integration.test.ts` → Task 22
  - Gate 2's own "Verify test coverage against Derived Test Matrix" line (`:765`) independently states this same total mapping and names the carrying tasks — the plan self-asserts the bidirectional check rather than leaving it implicit.
- **Supersession Inventory:** present and complete — 6 rows, all `DELETE` except the `.bkit/workflows.md:23` step-count line (`MODIFY`, correctly not a deletion). Every `DELETE` row is mirrored as `[DELETE]` in Architecture & Component Changes and as removal work in Task 14, per the section's own mandated cross-reference rule.
- **Out of Scope — all 9 rows genuinely `Exempt`, none `Blocking`:** width reductions in build (issue's own audit found "no changes"), `build-plan-current` conditional (explicitly the failure mode the step exists to catch), debug/ship step-count reductions (issue's audit: "no changes"), status-hole detector extension/promotion (plan-sized / already-deferred with its own promotion condition), the rejected `NARROW/STANDARD/WIDE` dial and sibling rejects (explicitly ruled out by the issue's agreed approach), design Step 3 ideate-2/-3 predicates (Open Question 3, no upstream artifact exists to carry a predicate — reasoned default, not a shortcut), the `complexity-check` predicate on plan Step 9 (Open Question 6, evidence-backed: `.bkit/stats.jsonl` has zero calibration data between 1 and 54 tasks), and the template's Design-Missing Fallback amendment (a template-wide contract change, correctly out of this plan's cycle). None of these are required by a Success Criterion, an Acceptance Scenario/Derived Test Matrix row, or a design section — each traces to either the issue's own audit conclusion or a resolved Open Question with its own recorded default.

## OPTIONAL

- **Dedup-collapse edge case is documented, not automated.** The Edge Cases table (`:101`) records that two lens skips inside the same fan-out step sharing a second-resolution timestamp collapse to one event under the existing `identity()` dedup key — correctly scoped as pre-existing reducer behavior, not something this plan changes, and explicitly declared out of scope for changing the key. No matrix row exercises the collapse itself (only that raw lines survive `status.jsonl`, which the emitter's own bats coverage implies). A synthetic bats case forcing two `step-skipped` calls with an identical `at` and asserting both raw lines persist while the fold sees one would close the residual gap between "documented" and "observed," but it is genuinely additive polish, not required by any Success Criterion.
- **Sensitive-path force-on behavior (Edge Cases rows "glob matches but predicate FALSE" / "glob matches and predicate TRUE") is verified only by Manual Verification Steps 2c and prose-structure assertions (matrix row 17), not by a markdown-invariant test that simulates an actual OR-evaluation.** This is consistent with the corpus's stated testing doctrine (prose-audit tier asserts structure/operators, not live workflow execution, since these are LLM-orchestrated steps) — flagged as a residual live-verification dependency, not a build-task gap.
- **Task 20's `README.md` doctrine update** has no dedicated automated test beyond its own `Done when` grep-style assertions (pipeline sketch present, no leaked internal identifiers). Acceptable per template (documentation tasks may carry a content-based `Done when` without a new test file), noted for completeness only.

## OUT OF SCOPE

None beyond what the plan's own `Out of Scope` and `Suggested Scope Expansion` tables already enumerate — those tables are already comprehensive (9 `Exempt` rows, 7 `Suggested Scope Expansion` candidates each with source/overlap/recommendation) and no additional plan-expansion candidate surfaced during this audit.
