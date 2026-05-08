Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Summary

## Overview

The plan implements **bkit-ci-router** (BAR-148 Option 1), a new autonomous routing workflow that closes the manual gap between `bkit-build` completion and skill dispatch. After CI finishes on a PR's head SHA, the router automatically reads `status.json`, checks the PR status rollup, and invokes either `/bkit-ship {FID}` (green) or `/bkit-debug {FID}` (red) in a fresh Claude Code session on a GHA runner using `anthropics/claude-code-action@v1`. The router then appends the session URL back to the existing Linear comment. Consumer repos opt-in via the `bkit:auto-route` Linear label.

Key tasks span five phases: (A) template and source orchestrators, (B) installer module wiring, (C) test coverage (18 derived test matrix rows), (D) documentation updates, and (E) mirror regeneration. The plan is comprehensive, well-structured, and gates execution appropriately.

## Plan Quality

**Well-scoped:** The plan clearly delineates what is in-scope (Option 1 dispatch via `claude-code-action@v1`, new templates, new installer module, schema extension for `issueId`/`commentId`, 18-row test matrix, docs updates) vs. out-of-scope (Options 2–5, runner 6h ceiling enforcement, custom retry logic, cross-repo dispatch, Step 18 chaining). 

**Dependencies clear:** Pre-flight section identifies all required checks (package management, dependency versions, user context, blockers, project context, testing alignment, prerequisite plans). Conditional items (secrets, schema state, architecture, observability) are listed with applicability flags. The data schema section explicitly addresses Path A (preferred minimal extension adding `issueId` and `commentId` to `status.json`), with Path B documented as fallback. All 5 existing orchestrators (`bkit-plan.md`, `bkit-build.md`, `bkit-ship.md`, `bkit-debug.md`, `bkit-review.md`) are tagged for Step 1 edits to propagate the schema extension.

**Gates correct:** Gate 1 (prerequisites + acceptance scenario + breaking changes confirmation) gates entry; Gate 2 (code implementation verification) gates testing; Gate 3 (docs/tests completion) gates verification; Gate 4 (automated test pass) gates manual verification. Gate 2 and 3 require independent checkbox verification for each completed task. Unchecked human-confirmation boxes in the Acceptance Scenario and Breaking Changes sections are flagged as expected pre-review state, not verdict downgrade triggers.

## Completeness

**Scope covered:** Plan lists all artifacts (orchestrator, templates, modules, tests, docs), all phases (A–E), all test rows (18 matrix → C1a–C9g runbook mapping), all doc updates (D1–D7). The 18-row derived test matrix maps bidirectionally to concrete runbook tasks.

**Testing adequate:** Test matrix covers unit (Vitest for modules, YAML lint, snapshot, authoring-conventions), integration (installer write/drift, parity, canonicalHashes recording), and manual verification (smoke test with `ANTHROPIC_API_KEY`, end-to-end dispatch). Test types align with `docs/testing.md` (no Playwright — no UI surface). All 18 matrix rows have explicit C-task assignments. The authoring-conventions test (row 10, task C7) correctly documents its exception: router orchestrator legitimately omits Worktree Setup creation (runner provides the worktree); amendment required to avoid false failure.

**Docs planned:** Documentation Updates table (§ Documentation Updates) lists all affected files with change descriptions. Phase D runbook (D1–D7) operationalizes the table: `.agents/workflows.md` + metadata docs (`docs.md`, `prompts.md`), ADR verifications (`decisions.md`, `pending.md`), knowledge entry append (`knowledge.md`), deployment/secret guidance (`deployments.md`). Verification tasks (D4, D7) check for pre-existence of ADR entries to avoid duplicate-append corruption.

## Acceptance Scenario

**Spec adheres to template:** The Acceptance Scenario section includes Narrative (agent-drafted reference, pending human confirmation), Success Criteria (5 bullets covering dispatch, label gate, stale-run guard, concurrency, opt-in), Concrete Example (specific setup → 9 numbered steps → observable outcome), Edge Cases (11 scenarios in table form per spec), and Derived Test Matrix (18 rows with 1:1 runbook mapping). The section correctly notes that no design doc exists (`{FID}-design.md` absent), so per template fallback protocol, Narrative and Success Criteria are marked `⚠️ MISSING` with reference drafts provided for human confirmation. This is the expected state for design-missing features; the plan does NOT fabricate—it defers to human review. Gate 1 checkboxes for "Acceptance Scenario confirmed" and "Breaking Changes confirmed" are unchecked, which is the expected pre-review state (human must read and check them).

**Unchecked human-confirmation gates are expected:** The plan includes two human-confirmation gates (Acceptance Scenario confirmed, Breaking Changes confirmed) that remain unchecked. Per contract, these are NOT verdict downgrade triggers; they are expected pre-review state. The verdict reflects plan completeness and quality, not human review state. The action item below notes these gates for human review.

## Design Alignment

The plan has no corresponding design doc (`bar-148-design.md` does not exist per the plan's own notes). Instead, the plan synthesizes a complete Acceptance Scenario from the issue description (`plan-input.md`). The narrative, success criteria, concrete example, and edge cases align internally and with the issue's problem statement (close the manual gap between `bkit-build` close and skill dispatch). Option 1 (GHA → `claude-code-action@v1`) was pre-selected in the issue; the plan implements this choice without deviation. The scope—new router orchestrator, templates, installer module, schema extension, test matrix, docs updates—is a proper subset of what the issue requests (no over-scope). Verified: plan scope ⊆ issue scope.

## Risks

**Unknowns:** Plan declares no major unknowns; design decisions are well-explored in the issue. Minor implementation details (exact YAML structure, step-skeleton contract) will be verified during code review.

**Dependencies:** Plan depends on `anthropics/claude-code-action@v1` availability and stability. Pre-flight includes a check to "confirm `anthropics/claude-code-action@v1` is the current pinned tag." Consumer repos must add the `ANTHROPIC_API_KEY` secret and create the `bkit:auto-route` Linear label (both documented in deployment guidance).

**Assumptions:** Plan assumes `status.json` will be extended consistently across all 5 orchestrators (Path A). This is well-scoped and testable (matrix row 11, task C8 asserts the propagation). Plan assumes the runner's 6-hour job ceiling is sufficient (per issue: `MAX_DEBUG_ATTEMPT=3` + 3600s per-step timeout caps total runtime well under 6h in observed runs). This is documented as acceptable in Out of Scope.

## Action Items

1. **Human confirmation required:** Review the Acceptance Scenario section and check the "Acceptance Scenario confirmed" box if the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix correctly describe what "done" looks like for this feature. The reference drafts provided are reasonable but only binding after human sign-off.

2. **Human confirmation required:** Review the Breaking Changes & Naming Review section and check the "Breaking Changes confirmed" box. The plan proposes no breaking changes (all new artifacts; no replacements). Proposed names (`.agents/workflows/bkit-ci-router.md`, `.github/workflows/bkit-ci-router.yml`, `runCiRouterModule`, `--ci-router` flag, `bkit:auto-route` label, concurrency group naming, Linear comment header format) should be validated against naming conventions.

3. **Verify pre-flight dependencies before build starts:** All Core pre-flight items must be checked (package management, dependency versions, user context, blockers, project context, testing alignment, prerequisites). Confirm `anthropics/claude-code-action@v1` pinned tag is current. For dogfood testing (Step 5 of manual verification), ensure `ANTHROPIC_API_KEY` is available in this repo.

4. **Verify gates independently during execution:** Each of Gates 2, 3, and 4 requires independent checkbox verification for every listed item before proceeding to the next gate. Do not skip.

5. **Snapshot updates required:** Template snapshot in `.agents/scripts/templates.test.ts` must be updated post-creation of the new template file.

6. **ADR ledger check (D4, D7):** Verify that `docs/decisions.md` entries `DE-14` and `DE-15` and `docs/pending.md` defer entries already exist at the listed line ranges before proceeding with Phase D. Do NOT append duplicates (decisions/pending are append-only ledgers; duplication corrupts the ADR ledger).

---

**Summary:** The plan is complete, well-scoped, and ready for human confirmation of the Acceptance Scenario and Breaking Changes sections. Once those gates are checked, implementation can proceed through Phases A–E with clear task ordering, verification, and rollback paths.
