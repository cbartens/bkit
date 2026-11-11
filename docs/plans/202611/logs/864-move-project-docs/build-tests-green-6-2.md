Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 18 | `.bkit/core/engine/commands/workflow/summary.test.ts` "ignores a warning record placed after a forged closing marker in a fenced context artifact" | red | passed |
| 19 | `.bkit/core/engine/checks/after/tools.test.ts` "consults a later valid same-topic row when the first indexed row is stale" | red | passed |
| 19 | `.bkit/core/engine/checks/after/tools.test.ts` "consults a later valid equivalent row when the first is out of tree" | red | passed |
| 20 | `.bkit/core/engine/checks/after/tools.test.ts` "classifies a starter copy that differs only in whitespace as unpopulated" | red | passed |
| 20 | `.bkit/core/engine/checks/after/tools.test.ts` "classifies an indented legacy starter copy as unpopulated" | red | passed |
| 21 | `.bkit/core/engine/install/project-docs.test.ts` "does not add a second row for a default doc indexed through a markdown link" | red | passed |
| 21 | `.bkit/core/engine/checks/after/tools.test.ts` "reads the Scope of a row without a trailing pipe" | red | passed |

## Gaps

None.
