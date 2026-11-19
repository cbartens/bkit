Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 51 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run" | red | passed |
| 51 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > exits 6 on a loop pause whose own questions decisions check refuses" | red | passed |
| 52 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question whose bold closes before the colon, naming the line" | red | passed |
| 53 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question line behind a list marker on a loop pause, naming the line" | red | passed |
| 53 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question written as **Question 2 on a loop pause, naming the line" | red | passed |
| 54 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files" | red | passed |

## Gaps

None.
