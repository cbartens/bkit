Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` `distinguishes missing and empty project documentation from populated candidates`
WROTE — TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` `recognizes current and migrated untouched starters`
WROTE — TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning`
WROTE — TASK 5: `.bkit/core/engine/checks/after/index.test.ts` `reports and suppresses project documentation advisories without a blocker`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/summary.test.ts` `consolidates documentation warnings from the active run without changing its verdict`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` `reports only attributed documentation warnings for the active run`
WROTE — TASK 6: `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `covers the full documentation responsibility inventory`
WROTE — TASK 6: `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` `ships documentation warning contracts for plan and no-plan paths`
SOURCE — TASK 5: PreflightFinding shape from .bkit/core/engine/checks/before/index.ts:51
SOURCE — TASK 5: index row parsing and equivalent rule from .bkit/core/engine/install/project-docs.ts:233
SOURCE — TASK 5: suppression note scope "." from .bkit/core/engine/checks/after/suppression.ts:17
SOURCE — TASK 6: warning record fields from docs/plans/202611/864-move-project-docs-plan.md:262
SOURCE — TASK 6: summary rows and artifacts from .bkit/core/engine/commands/workflow/workflows.ts:1697
