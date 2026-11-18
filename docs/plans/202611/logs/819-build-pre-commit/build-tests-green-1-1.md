Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/819-build-pre-commit-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "passes for the staged tree with an unstaged engine edit beside it" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "refuses a stale staged dist" | red | passed |
| 1 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "leaves the working tree's dist untouched" | red | passed |

## Gaps

None.
