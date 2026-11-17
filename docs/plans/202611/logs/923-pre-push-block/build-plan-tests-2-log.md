Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 5: gh stub / push helper shapes from .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1650
WROTE — TASK 5: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run`
WROTE — TASK 5: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `ship switches the PR conflict check off for its pushes before Step 4, and only those`
SOURCE — TASK 5: branches push lines before Step 4 from .bkit/core/workflows/bkit-ship.md:282,306,432
WROTE — TASK 6: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR whose only conflict is a merge=union ledger → blocked`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `single-branch fetch refspec → checks the fetched base, no false block`
SOURCE — TASK 8: tip shape from .bkit/core/engine/checks/tips/catalogue.test.ts:474
WROTE — TASK 8: `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA`
SOURCE — TASK 9: hook --jq filter from .bkit/templates/.husky/pre-push:147
WROTE — TASK 9: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `fork PR with the same head branch name → ignored, gates run`
