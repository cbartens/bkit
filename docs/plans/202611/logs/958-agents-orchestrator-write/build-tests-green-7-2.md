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
| 25 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | red | passed |
| 26 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files" | red | passed |
| 26 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~" | red | passed |

## Gaps

None.
