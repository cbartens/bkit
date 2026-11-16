Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 8: touchedTests skip on t.blob === null from .bkit/core/engine/commands/workflow/tests.ts:436
SOURCE — TASK 9: refusal problem text from .bkit/core/engine/commands/workflow/steps.ts:1344
SOURCE — TASK 10: c.reasons skip in blocked.find from .bkit/core/engine/commands/workflow/steps.ts:1328
SOURCE — TASK 11: changed row field names from .bkit/core/engine/commands/workflow/steps.ts:1332 (blob field name is an assumption)
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step that writes a planned test whose red recorded its file missing, exit 11`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal of a restored BLOCKED change names the recorded change as the lines to put back`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/steps.test.ts` `the refusal of a re-change says the logged reason is already recorded`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/steps.test.ts` `records the baseline blob on a BLOCKED-named change that only adds lines`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/tests.test.ts` `green gives each changed test the line diff of its own lines since its baseline and whether it is additive`
WROTE — TASK 11: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `a changed-test item shows the test's line diff since its baseline`
WROTE — TASK 11: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the code prompts say a BLOCKED line lets through only a change that adds lines`
