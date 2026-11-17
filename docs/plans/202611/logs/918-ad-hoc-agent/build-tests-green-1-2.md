Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/918-ad-hoc-agent-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "refuses a call with no workflow-run proof and prints no body" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "refuses an unproven post before any tracker request" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "session proof accepts a path under the outbox sessions folder even once deleted and refuses one outside it" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "status proof accepts a status file with a run of the workflow and refuses a missing file or one without that run" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "audit proof accepts a body file in its own audit outbox folder and refuses one elsewhere" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "refuses a call whose proof cannot be resolved" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "checks the run proof before skipping an issue-less call" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "an ad-hoc comment with no run proof exits 2 and reaches no tracker" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "accepts a session minted in the main checkout from a linked worktree" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/issues.test.ts` "the comment verb's summary says it is for workflow steps only" | red | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "accepts a session minted in the main checkout from a linked worktree" — passed at the group's red, and the tests step accepted it: sessionPublication already resolves the git-common-dir sessions folder, so the call is accepted today (no guard yet to refuse it); guards the new check against regressing; no red is due
