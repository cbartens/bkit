Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 18: request hash and operation id from JSON.stringify of raw rows from .bkit/core/engine/commands/workflow/ledgers.ts:1471
SOURCE — TASK 19: key `${slug}-${kebab(title)}` from .bkit/core/engine/commands/workflow/issues.ts:734
SOURCE — TASK 20: evidenceComplete default from .bkit/core/engine/commands/workflow/steps.ts:1660
SOURCE — TASK 22: invocation event fields from .bkit/core/engine/commands/workflow/status.ts:742
WROTE — TASK 18: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `issues the same operation for rows whose keys are reordered`
WROTE — TASK 19: `.bkit/core/engine/commands/workflow/issues.test.ts` `derives audit ledger keys under the audit-slug prefix`
WROTE — TASK 20: `.bkit/core/engine/commands/workflow/steps.test.ts` `renders no PASS from a result that omits its evidence`
WROTE — TASK 21: `.bkit/core/engine/tools/instructions.test.ts` `routes every ledgers query reader on coverage status`
WROTE — TASK 22: `.bkit/core/engine/commands/workflow/status.test.ts` `writes no absolute checkout path into the run's committed invocation event`
