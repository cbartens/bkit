Enforced: true
Verdict: null
Gaps: 7
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads IDs, severities, titles and keys from the Findings table" | red-not-loaded | passed |
| 5 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > refuses a row with an unknown key, naming its ID" | red-not-loaded | passed |
| 5 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > refuses a row with an empty severity, naming its ID" | red-not-loaded | passed |
| 6 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "bkit ledgers findings > prints the totals and the ledger rows from a report" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "bkit ledgers findings > prints zero totals and no ledger rows for a report with no findings" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/issues.test.ts` "bkit issues comment > audit comment derives Findings from --report" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/template-shape.test.ts` "audit templates carry Title and Key columns in their Findings table" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no prompt or workflow names --result-file" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps stub > refuses --result-file as an unknown flag" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps verdict > reads a header with a leftover Fingerprint line" | red | passed |

## Gaps

- Task 8 `delete-still-referenced` — DELETE `FINGERPRINT` in `.bkit/core/engine/commands/workflow/steps.ts` is still referenced: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts:309` — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/steps.ts`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `structuredFindings` in `.bkit/core/engine/commands/workflow/challenge.ts` is still referenced: `docs/audits/202611/deferrals-20261116T065554Z.md:277`, `docs/deferrals.jsonl:257`, `docs/deferrals.jsonl:429` — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `parseAuditResult` in `.bkit/core/engine/commands/workflow/audit-report.ts` is still referenced: `docs/decisions.jsonl:963` — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/instructions.md`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/steps.test.ts`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/challenge.test.ts`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
