Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1011-rules-ship-project-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/repo/rules-sync.test.ts` "the template holds an empty Project Goals section between Project Rules and Project Settings" | red | passed |
| 2 | `.bkit/core/engine/tools/instructions.test.ts` "rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules" | red | passed |

## Gaps

None.
