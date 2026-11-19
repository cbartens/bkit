Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 23: redact and SECRET_KEYS from .bkit/core/engine/commands/workflow/tracker.ts:75
WROTE — TASK 22: `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > refuses a row whose Location is not path:line, naming its ID`
WROTE — TASK 23: `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines`
WROTE — TASK 24: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no bkit-build bash block puts the owner's words inside a double-quoted argument`
WROTE — TASK 24: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file`
