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
| 17 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question line written with an en dash, naming the line" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a file with no question when the engine file holds no loop question" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > does not count a fenced line under ## CRITICAL as an item" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > a fenced ## line under ## CRITICAL does not end the section" | red | passed |
| 21 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads a row whose Evidence cell holds a backslash" | red | passed |
| 21 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads a lone short None row as no finding" | red | passed |

## Gaps

None.
