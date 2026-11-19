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
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names {OUTBOX_ROOT}/error.md or {OUTBOX}/stderr.log" | red | passed |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr" | red | passed |
| 15 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no prompt or workflow writes a file with a shell heredoc" | red | passed |

## Gaps

None.
