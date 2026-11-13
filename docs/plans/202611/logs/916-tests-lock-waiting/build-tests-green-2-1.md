Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/916-tests-lock-waiting-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "replaces a shipped 6.1.1 machine-lock copy and records the same unhashed write in dry run" | red | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "preserves an edited machine-lock copy without the queue and reports the template to merge by hand" | red | passed |
| 6 | `.bkit/core/engine/install/modules/core.integration.test.ts` "leaves a symlinked machine-lock copy unchanged and reports the template to merge by hand" | red | passed |

## Gaps

None.
