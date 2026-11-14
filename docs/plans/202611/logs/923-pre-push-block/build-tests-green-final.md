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
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR whose base conflicts → blocked before bkit check, names the file" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR that merges cleanly → gates run, no message" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no open PR → no fetch, gates run" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "gh not on PATH → warns, gates run" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "base fetch fails → warns, gates run" | red | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "dev push → no PR lookup" | passed-accepted | passed |
| 1 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "min push of a conflicting PR → blocked" | red | passed |
| 2 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires only for a hook without merge-tree" | passed-accepted | passed |
| 4 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "gh not on PATH → warns, gates run for both hook copies" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "BKIT_PR_CONFLICT_CHECK=false on a conflicting PR → no fetch, off line, gates run" | red | passed |
| 6 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR whose only conflict is a merge=union ledger → blocked" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "single-branch fetch refspec → checks the fetched base, no false block" | red | passed |
| 8 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires for a hook with merge-tree but no PUSH_BRANCH_SHA" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork PR with the same head branch name → ignored, gates run" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ship switches the PR conflict check off for every push" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "debug switches the PR conflict check off for every feature-branch push" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "shallow clone → no base fetch, warns, gates run" | red | passed |
| 13 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork contributor's own PR with a skip-ci head → blocked by the CI-suppressor guard" | red | passed |
| 14 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "fork PRs past gh's page limit → same-repo PR still found, conflict blocked" | red | passed |

## Gaps

None.

## Already landed

- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "open PR that merges cleanly → gates run, no message" — passed at the group's red, and the tests step accepted it: today's hook has no conflict check, so a clean run passes already; no red is due
- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "no open PR → no fetch, gates run" — passed at the group's red, and the tests step accepted it: today's hook never fetches or warns; no red is due
- Task 1 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "dev push → no PR lookup" — passed at the group's red, and the tests step accepted it: today's hook already skips the lookup on dev; no red is due
- Task 2 `.bkit/core/engine/checks/tips/catalogue.test.ts` "pre-push-pr-conflict fires only for a hook without merge-tree" — passed at the group's red, and the tests step accepted it: owner accepted the group 2 edit on 2026-11-14 (its up-to-date hook sample gains the PUSH_BRANCH_SHA= line so it agrees with Task 8's test); recorded through tests red because the BLOCKED escape is not read yet (#914); no red is due
