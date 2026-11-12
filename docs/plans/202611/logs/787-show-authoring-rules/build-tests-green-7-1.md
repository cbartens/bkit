Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 28 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script copied into a new directory or by a glob" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "cursor: mirror matches its template" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "claude: mirror matches its template" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "codex: mirror matches its template" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "agents: mirror matches its template" | red | passed |

## Gaps

None.
