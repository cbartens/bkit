Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/724-machine-wide-test-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` "terminating a run wrapper stops its gate before another run acquires the tests lock" | red | passed |
| 14 | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` "a build close push retry does not repeat workflow close or lose its outputs" | red | passed |

## Gaps

None.
