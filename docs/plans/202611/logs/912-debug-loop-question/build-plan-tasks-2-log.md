Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 4: failedJobCount on CiSelection — optional field validated as positive integer, set by locateCi without the capstone (.bkit/core/engine/ledgers/status.ts, .bkit/core/engine/commands/workflow/runs.ts)
DONE — TASK 5: CI test-run row carries failures — testRunProblem accepts positive count or null; tests run writes selection.failedJobCount ?? null (.bkit/core/engine/ledgers/status.ts, .bkit/core/engine/commands/workflow/tests.ts)
DONE — TASK 6: steps finish matches CI round failures to the row (.bkit/core/engine/commands/workflow/steps.ts); fixture type widened in steps.test.ts; integration fixture already updated by the tests step
DONE — TASK 10: incident sequence end to end — test already rewritten by tests step; no source change needed; debug-ci-evidence.integration.test.ts passes 8/8 (.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts)
