Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 4: located jobs and capstone filter from .bkit/core/engine/commands/workflow/runs.ts:489
SOURCE — TASK 5: CI row fixture shape from .bkit/core/engine/ledgers/telemetry.test.ts:53
SOURCE — TASK 6: Loop Question progress command from .bkit/core/workflows/bkit-debug.md:132
WROTE — TASK 4: `.bkit/core/engine/ledgers/status.test.ts` `CI evidence selection contract > validates failedJobCount as a positive whole number outside the identity`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/runs.test.ts` `saves the failed job count without the capstone job`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/runs.test.ts` `counts the capstone job when it is the only failed job`
PASSES — TASK 4: `.bkit/core/engine/commands/workflow/runs.test.ts` `saves no failed job count when no job failed`: current locateCi saves no failedJobCount field at all, so absence already holds
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/runs.test.ts` `counts fallback evidence jobs without the capstone job`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/tests.test.ts` `CI evidence test rounds > records the selected run's failed job count`
WROTE — TASK 5: `.bkit/core/engine/ledgers/telemetry.test.ts` `test-run status row validation > accepts a counted CI evidence round and refuses 0`
WROTE — TASK 5: `.bkit/core/engine/checks/status-holes.test.ts` `check — hole classes > a counted CI round with its step-done row raises no CI evidence hole`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/steps.test.ts` `finishes a CI round only with its own failed job count`
WROTE — TASK 6: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown`
PASSES — TASK 10: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown`: reworked to a failing local gate (control.failLocal, exit 1, no JUnit); existing tests runner records failures null and progress reads "2 → ?" / unknown
PASSES — TASK 6: `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `Debug CI evidence sequence > records the failed job count and reads an uncounted local round as unknown`: the same test as Task 10, corrected by the owner-approved Fix now (decision 1); its second round is now a failing local gate with no JUnit report, so it passes against the existing runner
