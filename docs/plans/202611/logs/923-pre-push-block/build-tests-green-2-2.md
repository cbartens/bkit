Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/923-pre-push-block-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run" | red | passed |
| 5 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ship switches the PR conflict check off for its pushes before Step 4, and only those" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR whose only conflict is a merge=union ledger → blocked" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "single-branch fetch refspec → checks the fetched base, no false block" | red | passed |
| 8 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork PR with the same head branch name → ignored, gates run" | red | passed |

## Gaps

None.
