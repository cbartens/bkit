Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 8: openDecision skips Status != OPEN from .bkit/core/engine/commands/workflow/workflows.ts:285; build-decision row names the file via artifacts, as at workflows.test.ts:3263
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/workflows.test.ts` `workflows start reports openDecision for a DECIDED decision file that no build-decision row names`
PASSES — TASK 8: `.bkit/core/engine/commands/workflow/workflows.test.ts` `workflows start does not report openDecision for a DECIDED decision file that a build-decision row names`: current openDecision already skips any non-OPEN file; the test guards the new reopen rule against over-reopening
SOURCE — TASK 9: step 5/6 text from .bkit/core/workflows/bkit-build.md:213-246
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check`
