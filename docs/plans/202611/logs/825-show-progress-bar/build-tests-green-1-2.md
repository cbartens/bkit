Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/825-show-progress-bar-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress flat workflow" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress build groups" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress groups added" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress loop back" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress bar width" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress all workflow numbers" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress missing plan fallback" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress attempt suffix" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/step-table.test.ts` "runProgress final completion only" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "finish prints progressLine" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "done prints progressLine" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "progress output metadata" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "gate progress number validation" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress reads fresh plan groups" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress resumes from saved run" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress loop attempts and grants" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress specialized completion producers" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress gate only completions" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/progress.integration.test.ts` "progress excludes noncompletions" | red | not passed |

## Gaps

- Task 2 `not-green` — "progress excludes noncompletions" failure: malformed-status: expected 1 to be +0 // Object.is equality — Fixable: true — log: TASK 2: `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress excludes noncompletions` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/commands/workflow/progress.integration.test.ts`

```
 ❯ .bkit/core/engine/commands/workflow/progress.integration.test.ts (8 tests | 1 failed) 1271ms
   ❯ workflow progress command wiring (8)
     ✓ progress uses saved cross-run soak attempts and grants 43ms
     ✓ progress refuses contextless or mismatched numeric gates 30ms
     ✓ progress reads fresh plan groups 38ms
     ✓ progress resumes from saved run 43ms
     ✓ progress loop attempts and grants 228ms
     ✓ progress specialized completion producers 632ms
     ✓ progress gate only completions 91ms
     × progress excludes noncompletions 164ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/progress.integration.test.ts > workflow progress command wiring > progress excludes noncompletions
AssertionError: malformed-status: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/commands/workflow/progress.integration.test.ts:605:39
    603|       expect(git(broken, "rev-parse", "HEAD"), bad).toBe(head);
    604|       expect(invalid.snapshot(), bad).toEqual(before);
    605|       expect(invalid.journals(), bad).toBe(invalid.expectedJournals);
       |                                       ^
    606|     }
    607|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 7 passed (8)
   Start at  21:31:46
   Duration  1.42s (tests 92%, import 4%, transform 3%, setup 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gAFVMO/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
