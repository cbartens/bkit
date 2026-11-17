Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 30: ledger row shape (schema 3, key, status OPEN) from docs/failures.jsonl:last; derived key from .bkit/core/engine/commands/workflow/issues.ts:735
WROTE — TASK 30: `.bkit/core/engine/commands/workflow/steps.test.ts` `derives a fresh audit key when the ledger already holds it`
SOURCE — TASK 31: status invocation --file handling from .bkit/core/engine/commands/workflow/status.ts:682
WROTE — TASK 31: `.bkit/core/engine/commands/workflow/status.test.ts` `refuses to issue an invocation through a status file symlinked out of the checkout`
