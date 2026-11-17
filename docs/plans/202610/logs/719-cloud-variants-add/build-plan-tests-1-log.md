Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: fetch reply shapes (state.type, statusCategory.key) from .bkit/core/engine/commands/workflow/tracker.ts:582-660
SOURCE — TASK 2: Linear guard output and FAIL text from .bkit/core/hooks/preflight-linear.sh:1-80
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `github fetch marks a closed issue terminal and an open one not`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `linear fetch marks a completed state renamed Shipped terminal`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `linear fetch marks a canceled state terminal and a started state not`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/tracker.test.ts` `jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/issues.test.ts` `fetch prints terminal in its facts and in issue-facts.json`
WROTE — TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github issue without bkit:auto stops the Cursor background session`
WROTE — TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github closed issue stops the session and an open labelled one passes`
WROTE — TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `github read failure stops the session naming the tracker and the reason`
WROTE — TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `linear completed state renamed Shipped stops the session`
WROTE — TASK 2: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` `generated Claude and Cursor hooks carry the one preflight-tracker.sh part`
