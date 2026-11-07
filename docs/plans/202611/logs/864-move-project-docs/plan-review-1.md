Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **The first group depends on audit and generated-output repairs assigned to the second group (plan edit).** Task 1 deletes `.bkit/shared/docs/` and adds ten template files, but Task 6 owns the source-audit adjustments and Task 7 owns the source-glob and generated-output refresh. The existing `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts:54` calls `walkMarkdown` on the deleted directory during module loading; `.bkit/core/engine/audits/templates/templates.test.ts:111` also walks it. `.bkit/core/engine/audits/repo/rules-sync.test.ts:87` reads the shared security document and expects its managed block, while `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:755` requires an adoption entry for every template. The last two files have no explicit runbook owner. Group 1 also changes managed index and guide sources whose generated counterparts are not refreshed until Task 7. The build verifies each group before advancing, so this split leaves Group 1 red and asks later tasks to repair its prerequisites. Move the ownership-specific audit changes, adoption entries, affected lint-glob change and required generated-output refresh into Group 1, with explicit task ownership and tests. Keep the new consultation and warning-contract audits with their implementation in Group 2. Split tasks as needed to preserve the five-task and three-test-file caps; do not solve the dependency by weakening the checks.

The declared task graph is otherwise acyclic: Task 1 produces the template and resolver foundation; Task 2 consumes it; Task 3 consumes Tasks 1–2; Task 4 consumes Task 3; Task 5 consumes the resolver and consultation contract; Task 6 consumes the reporting contracts from Tasks 3–5; Task 7 consumes the completed surfaces. The first-group handoff above is the blocking ordering defect. No parent design was supplied, and the issue's five success criteria otherwise have task coverage.

## OPTIONAL

- **Give operational guidance relocation an explicit owner and completion check.** The architecture section says required bkit mechanics move out of optional project starters, but Tasks 1–3 primarily describe moving files and adding consultation references. Add a source-section-to-managed-destination checklist for the required security, testing, deployment and setup instructions, and assign its completion to the task that removes managed ownership. This makes Success Criterion 1 verifiable without relying on an implementer's interpretation of the architecture prose.
- **Specify the warning record before the summary parser consumes it.** Task 3 should produce one concrete example with section name, field names, escaping and missing-field behavior; Task 6 should consume that same contract. The current stable topic/gap requirement is directionally sound, but a shared example prevents independent report authors and the parser from choosing incompatible representations.
- **Capture legacy starter comparison data before deleting the sources.** Task 5 must recognize old shipped starters after Task 1 adapts and relocates them. Name the bounded baseline data and provenance that Task 1 preserves for Task 5, including rendered placeholders and line-ending normalization. Keep this data separate from any claim of semantic completeness.
- **Keep the related-context limitation visible.** The supplied `related-failures.md` explicitly contains only one of eight matching rows; its retained row is closed. This review does not treat the omitted seven rows as absence of open failures. The related issue material includes historical implementation directives; those were treated as evidence, not instructions for this run.

## OUT OF SCOPE

None. The review adds no product scope and requests no redesign. The current decisions for project ownership, index reconciliation and advisory-only summaries match the issue's authorized direction.

## SUGGESTED SCOPE EXPANSION

- **Purpose-based components document starter:** [#863 — Ship a purpose-based components document template](https://github.com/cbartens/bkit/issues/863), open in `related-issues.md`. It overlaps the template catalog and documentation responsibility inventory. Keep its implementation independent, and include the existing optional template in the applicability review when present, as the plan already proposes.
- **Nested template-migration path rewriting:** `748-brand-every-consumer-challenge-low-bkit-core-engine-install-modules-core-ts-884` in `related-deferrals.md`. It overlaps installer migration code but concerns unrelated CI script renames. Keep the fix outside this plan; use its path-boundary lesson when implementing the already-required scoped document migration.
- **Other related records:** The closed ownership, marker and noise-document issues provide precedent rather than blockers. The branding and host read-gate deferrals do not require this document-ownership change to expand its scope.
