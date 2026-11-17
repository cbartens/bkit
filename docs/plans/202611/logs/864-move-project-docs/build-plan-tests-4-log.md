Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 10: documentationWarnings step-done artifact reading from .bkit/core/engine/commands/workflow/summary.ts:153
SOURCE — TASK 11: v6.1.1 shipped starter text from git show v6.1.1:.bkit/shared/docs/{security,deployments}.md; digests at .bkit/core/engine/install/project-docs.ts:160
SOURCE — TASK 12: notice forms from git show 3446554a5 and .bkit/core/engine/install/managed-block.ts:255
SOURCE — TASK 13: SyncReport unsafe shape from .bkit/core/engine/install/project-docs.ts:325
SOURCE — TASK 14: detector unindexed action from .bkit/core/engine/checks/after/tools.ts:570
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/summary.test.ts` `excludes raw tracker text in related-issues.md from documentation warnings`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/summary.test.ts` `ignores warning records inside an UNTRUSTED fence`
WROTE — TASK 11: `.bkit/core/engine/checks/after/tools.test.ts` `recognizes the v6.1.1 untouched security starter as unpopulated`
WROTE — TASK 11: `.bkit/core/engine/checks/after/tools.test.ts` `recognizes a legacy deployments starter rendered with default branch dev`
WROTE — TASK 12: `.bkit/core/engine/install/managed-block.test.ts` `removes a v5 PolyForm-licensed notice with the wrapper`
WROTE — TASK 12: `.bkit/core/engine/install/managed-block.test.ts` `removes a pre-6.0 do NOT edit notice with the wrapper`
WROTE — TASK 13: `.bkit/core/engine/install/project-docs.test.ts` `reports instead of throwing when docs is a regular file`
WROTE — TASK 13: `.bkit/core/engine/checks/after/tools.test.ts` `returns an advisory instead of throwing when docs is a regular file`
WROTE — TASK 14: `.bkit/core/engine/checks/after/tools.test.ts` `does not advise bkit upgrade for a default doc that sync leaves to an indexed equivalent`
WROTE — TASK 14: `.bkit/core/engine/install/project-docs.test.ts` `registers a present default doc when its only equivalent row points at a missing file`
