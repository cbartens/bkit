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
| 3 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "refuses a staged dist file shadowed by a tab-named twin" | red | passed |
| 4 | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` "refuses a staged dist that matches the build only through a gitattributes filter" | red | passed |

## Gaps

None.
