Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: STALE message and scratch folder prefix check-dist- from scripts/gate/bkit-check-dist.mjs:10,45
SOURCE — TASK 2: logged pnpm call format and PUSH_DEV_SHA/PUSH_BRANCH_SHA from .husky/pre-push:160-172
WROTE — TASK 1: `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref of a commit with a stale dist fails as stale while the fix is only staged`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref of a correct commit passes while an unrelated engine edit is staged`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref values starting with a dash, empty or not a commit are refused with no scratch folder left`
PASSES — TASK 1: `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `without --ref the check still reads the index and not the commit`: today's script already reads the index (extra regression guard, not in TEST FIRST)
WROTE — TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a code push still runs them`
WROTE — TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit`
PASSES — TASK 2: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a push with no dev or branch commit runs the dist check with no argument`: hook already calls pnpm bkit:check:dist with no argument (not in TEST FIRST, named in DONE WHEN)
