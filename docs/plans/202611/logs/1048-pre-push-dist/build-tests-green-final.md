Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1048-pre-push-dist-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "--ref of a commit with a stale dist fails as stale while the fix is only staged" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "--ref of a correct commit passes while an unrelated engine edit is staged" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "--ref values starting with a dash, empty or not a commit are refused with no scratch folder left" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: a code push still runs them" | red | passed |
| 2 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` ".husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit" | red | passed |

## Gaps

None.
