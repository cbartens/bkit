Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: sessions folder <git-common-dir>/bkit-outbox/sessions from .bkit/core/engine/commands/workflow/tracker.ts:1974-1989
SOURCE — TASK 1: --file run lookup via commentKey/readRunsLenient from .bkit/core/engine/commands/workflow/tracker.ts:2042-2066
SOURCE — TASK 1: outbox root from .bkit/core/engine/commands/lib.ts:1130
SOURCE — TASK 1: commentFile at <top>/tmp/bkit-comment-*.md from .bkit/core/engine/commands/workflow/tracker.ts:460-466
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `refuses a call with no workflow-run proof and prints no body`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `refuses an unproven post before any tracker request`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `refuses a call whose proof cannot be resolved`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `checks the run proof before skipping an issue-less call`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `an ad-hoc comment with no run proof exits 2 and reaches no tracker`
PASSES — TASK 1: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `accepts a session minted in the main checkout from a linked worktree`: sessionPublication already resolves the git-common-dir sessions folder, so the call is accepted today (no guard yet to refuse it); guards the new check against regressing
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/issues.test.ts` `the comment verb's summary says it is for workflow steps only`
