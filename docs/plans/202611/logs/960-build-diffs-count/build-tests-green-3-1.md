Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/960-build-diffs-count-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build migration scan and debug off-dev no-leak scan pass --base=origin/dev" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/feature-base.test.ts` "featureBase falls back to the origin/dev meeting point when local dev already contains HEAD" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff without --base finds a marker the branch added when local dev already contains the branch" | red | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "ship sweep and Failure Path context diff lines pass --base=origin/dev" | red | passed |

## Gaps

None.
