Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/920-build-agents-run-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2's exit-80 arm continues only when every check passed and sends a timed-out, startup-failure or error check to /bkit-debug" | red | passed |
| 8 | `.bkit/core/engine/tools/instructions.test.ts` "bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run" | red | passed |
| 9 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 2's exit-80 arm reads check-run conclusions, not the combined commit status" | red | passed |

## Gaps

None.
