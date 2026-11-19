Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 14: workflow Failure Path lines from .bkit/core/workflows/bkit-plan.md:91-93
WROTE — TASK 14: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names {OUTBOX_ROOT}/error.md or {OUTBOX}/stderr.log`
WROTE — TASK 14: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr`
SOURCE — TASK 15: heredoc from .bkit/core/workflows/bkit-debug.md:501
WROTE — TASK 15: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt or workflow writes a file with a shell heredoc`
