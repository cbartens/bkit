Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 16: template example record from .bkit/core/docs/templates/bkit-plan.md:194
SOURCE — TASK 17: inspectRepoFile from .bkit/core/engine/install/project-docs.ts:190
WROTE — TASK 15: `.bkit/core/engine/checks/after/tools.test.ts` `reports an ambiguous legacy wrapper left in a project document`
WROTE — TASK 16: `.bkit/core/engine/commands/workflow/summary.test.ts` `a plan built from the unfilled bkit-plan.md template yields no documentation warning`
PASSES — TASK 17: `.bkit/core/engine/checks/after/tools.test.ts` `reports an index row through a regular file as ambiguous instead of throwing`: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture
PASSES — TASK 17: `.bkit/core/engine/checks/after/tools.test.ts` `reports a NUL-byte index path as ambiguous instead of throwing`: current detectProjectDocs already returns project-docs-ambiguous without throwing on this fixture
