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
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals fires when the rules file has no Project Goals heading" | red | passed |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals fires when the section holds only commented examples" | red | passed |
| 4 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "project-goals stays quiet when the section holds one bullet, and when there is no rules file" | red | passed |

## Gaps

None.
