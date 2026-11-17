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
| 10 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "ship switches the PR conflict check off for every push" | red | passed |
| 11 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "debug switches the PR conflict check off for every feature-branch push" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "shallow clone → no base fetch, warns, gates run" | red | passed |

## Gaps

None.
