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
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals fires when the rules file has no Project Goals heading" | red | passed |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals fires when the section holds only commented examples" | red | passed |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the section holds one bullet, and when there is no rules file" | red | passed |
| 6 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when a second Project Goals section holds a goal" | red | passed |
| 6 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals ask says to fill the section when the heading already exists" | red | passed |
| 7 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the goals are a numbered list" | red | passed |
| 7 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the goals use * bullets" | red | passed |

## Gaps

None.
