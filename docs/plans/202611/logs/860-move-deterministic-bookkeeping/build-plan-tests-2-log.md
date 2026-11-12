Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 12: writerProblem signature (row: Record<string, unknown>) from .bkit/core/engine/ledgers/telemetry.ts:482
PASSES — TASK 12: `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts verified unavailable model without confusing configured and observed models`: test passes before and after; the double cast was replaced by a plain object spread `writerProblem({ ...unavailable })`, every expectation unchanged; the planned red is the slop check on the cast, not a test failure.
