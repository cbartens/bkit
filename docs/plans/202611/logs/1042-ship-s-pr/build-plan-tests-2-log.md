Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 4: closePr merge flow and restoreBranchRows from .bkit/core/engine/commands/workflow/workflows.ts:1699 and .bkit/core/engine/commands/workflow/branches.ts:2926
SOURCE — TASK 5: probePr list answers and PR_FIELDS from .bkit/core/engine/commands/workflow/prs.ts:55 and .bkit/core/engine/commands/workflow/prs.ts:154
SOURCE — TASK 7: mergePr re-read before merge from .bkit/core/engine/commands/workflow/prs.ts:588
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a symlinked ledger`
WROTE — TASK 4: `.bkit/core/engine/commands/workflow/branches.test.ts` `restoreBranchRows writes nothing through a symlinked ledger`
WROTE — TASK 5: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with a fork PR on the ship-failed branch name opens its own PR`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev onto a leftover ship-failed branch keeps the skip token on the pushed head`
WROTE — TASK 7: `.bkit/core/engine/commands/workflow/workflows.test.ts` `a second refused close waits for the reused PR head to reach the pushed tip before merging`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that adds a skill`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not merge a leftover tip that writes .bkit/issues.jsonl`
