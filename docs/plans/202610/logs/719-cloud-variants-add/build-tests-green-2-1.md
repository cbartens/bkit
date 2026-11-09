Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira terminal issue stops the Cursor background session" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira session without node_modules/.bin/bkit stops naming the missing bin" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira fetch %s stops the session naming the tracker and the reason" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "%s session with no issue id records bkit:auto not verified and exits 0" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "Claude session carrying GITHUB_ISSUE_ID runs the tracker guard" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0" | red | passed |

## Gaps

None.
