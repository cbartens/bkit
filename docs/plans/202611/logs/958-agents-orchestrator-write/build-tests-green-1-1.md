Enforced: true
Verdict: null
Gaps: 2
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "promptHeader > reads the Failures count rule of bkit-plan-review-1" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "headerDeclaration > refuses an unknown count declaration" | red | passed |
| 1 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` "every count-checked prompt declares a known count rule" | red | passed |
| 1 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` "no prompt leaves an incomplete finding out of the Failures count" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > checks Failures against the ## CRITICAL items and ignores OPTIONAL ones" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > reads None under ## CRITICAL as zero items" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a verify Fixable that disagrees with its gap lines" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > counts only the Fixable gap lines under a verify gap-count line" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a challenge PASS with a HIGH task block" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a challenge CONCERNS with a CRITICAL task block" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > hands back a challenge task block it cannot read" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a report the old render wrote whose Failures counted an OPTIONAL item" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > checks each agent's count in a two-agent finish" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no prompt names a Result: launch line or a structured result file" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` "every judgment field a result prompt names is a header line promptHeader reads" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names a Result: line, a -result.json file or a result-file render" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > the steps finish re-ask passes the printed problem" | red | passed |

## Gaps

- Task 3 `delete-still-referenced` — DELETE `.bkit/instructions.md`: the file still exists — Fixable: null — log: TASK 3: delete-still-referenced — Fixable: null
- Task 4 `delete-still-referenced` — DELETE `.bkit/instructions.md`: the file still exists — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null

## Already landed

- Task 2 `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > reads None under ## CRITICAL as zero items" — passed at the group's red, and the tests step accepted it: current finish counts no section, so a PASS with None and Failures 0 is accepted; the test guards the new count check; no red is due
- Task 2 `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > counts only the Fixable gap lines under a verify gap-count line" — passed at the group's red, and the tests step accepted it: current finish counts no section, so the report is accepted; the test guards the new count check; no red is due
