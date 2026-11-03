Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "persists atomic selections and preserves identical evidence generations" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "resumes saved evidence and replaces it only on explicit new selection" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "clears saved CI routing immediately for explicit local selection" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "counts reproduction and fixes only in the active generation" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "orders covering gates for red tiers and preserves live off" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "records a CI evidence round without executing a local gate" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "runs local gates only after current-generation remediation or soak" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tests.test.ts` "rejects CI rounds without active matching debug selection" | red | passed |
| 4 | `.bkit/core/engine/ledgers/telemetry.test.ts` "accepts bounded CI evidence rows while preserving local exit validation" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finishes validated CI evidence rounds without local clamp records" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/steps.test.ts` "preserves local clamp enforcement when completing test rounds" | red | passed |
| 5 | `.bkit/core/engine/checks/status-holes.test.ts` "audits evidence-first debug rounds without requiring a local discovery run" | red | passed |

## Gaps

None.
