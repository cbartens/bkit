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
| 6 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when a second Project Goals section holds a goal" | red | passed |
| 6 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals ask says to fill the section when the heading already exists" | red | passed |
| 7 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the goals are a numbered list" | red | passed |
| 7 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the goals use * bullets" | red | passed |

## Gaps

None.
