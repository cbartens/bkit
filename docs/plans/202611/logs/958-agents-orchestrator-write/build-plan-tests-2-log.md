Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 5: parseAuditReport return shape follows AuditResult (findings with id, severity, title, location, priorKey) from .bkit/core/engine/commands/workflow/issues.ts:630; refusals throw like parseAuditResult
SOURCE — TASK 6: ledgerRows and totals shape from .bkit/core/engine/commands/workflow/issues.ts:701-780 (auditTotals, auditLedgerRows); no-findings report assumed as a single None row per template
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > reads IDs, severities, titles and keys from the Findings table`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > refuses a row with an unknown key, naming its ID`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/audit-report.test.ts` `parseAuditReport > refuses a row with an empty severity, naming its ID`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `bkit ledgers findings > prints the totals and the ledger rows from a report`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `bkit ledgers findings > prints zero totals and no ledger rows for a report with no findings`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/issues.test.ts` `bkit issues comment > audit comment derives Findings from --report`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/template-shape.test.ts` `audit templates carry Title and Key columns in their Findings table`
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt or workflow names --result-file`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps stub > refuses --result-file as an unknown flag`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps verdict > reads a header with a leftover Fingerprint line`
