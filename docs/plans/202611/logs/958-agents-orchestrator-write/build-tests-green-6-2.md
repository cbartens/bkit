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
| 22 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > refuses a row whose Location is not path:line, naming its ID" | red | passed |
| 23 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines" | red | passed |
| 24 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no bkit-build bash block puts the owner's words inside a double-quoted argument" | red | passed |
| 24 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | red | passed |

## Gaps

None.
