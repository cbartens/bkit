Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: invocation lives in outbox via outboxRoot from .bkit/core/engine/commands/lib.ts:815; run lookup from lib.ts:450
WROTE — TASK 1: `.bkit/core/engine/commands/lib.test.ts` `rejects stale cross-worktree invocation and conflicting overrides`
SOURCE — TASK 1: build-branch-sync is step number 3 titled "Branch Sync" from .bkit/core/engine/commands/workflow/step-table.ts:60
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/status.test.ts` `issues invocation metadata from an explicit run and registered step`
SOURCE — TASK 2: subagent rows need by.model today from .bkit/core/engine/ledgers/telemetry.ts:475; by validation from telemetry.ts:1574
WROTE — TASK 2: `.bkit/core/engine/ledgers/telemetry.test.ts` `accepts verified unavailable model without confusing configured and observed models`
SOURCE — TASK 3: fold sorts by numeric ts, ties keep input order from .bkit/core/engine/ledgers/telemetry.ts:1911-1930
WROTE — TASK 3: `.bkit/core/engine/ledgers/telemetry.test.ts` `folds numeric timestamps and equal timestamp ties before filtering`
SOURCE — TASK 2: append refuses unlisted writers via writerProblem at .bkit/core/engine/commands/workflow/ledgers.ts:1347
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `rejects conflicting attribution and retains legacy writer restrictions`
SOURCE — TASK 3: append helper and EXIT.USAGE rejection pattern from .bkit/core/engine/commands/workflow/ledgers.ts:1280
WROTE — TASK 3: `.bkit/core/engine/commands/workflow/ledgers.test.ts` `pages canonical winners with diagnostics and rejects stale cursors`
WROTE — TASK 1: `.bkit/core/engine/ledgers/journal.integration.test.ts` `resumes explicit invocation across two real worktrees without identity leakage`
WROTE — TASK 2: `.bkit/core/engine/ledgers/journal.integration.test.ts` `completes missing subagent attribution before a real append`
WROTE — TASK 3: `.bkit/core/engine/ledgers/journal.integration.test.ts` `distinguishes unreadable missing malformed and clean ledger coverage without writing`
SOURCE — TASK 10: engine-call skipped when ctx.invocation set from .bkit/core/engine/commands/lib.ts:764; receipt read/refusal from lib.ts:577-600
SOURCE — TASK 10: engine-call rows are type engine-call with noun/verb/workflow from .bkit/core/engine/ledgers/journal.integration.test.ts:101
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/status.test.ts` `records the issued invocation in the run status log and rebuilds a deleted receipt`
WROTE — TASK 10: `.bkit/core/engine/commands/lib.test.ts` `writes the engine-call row for an invocation-bound command`
WROTE — TASK 10: `.bkit/core/engine/ledgers/journal.integration.test.ts` `keeps invocation events and engine-call rows inside the issuing worktree after receipt loss`
