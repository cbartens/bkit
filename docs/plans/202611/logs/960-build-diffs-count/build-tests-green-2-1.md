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
| 4 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "build workflow and verify prompt name no origin/dev diff or test base" | red | passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug passes --base only when it runs in place on dev" | red | passed |

## Gaps

None.
