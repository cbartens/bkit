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
| 19 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "never echoes inspected source text as hook instructions" | red | passed |
| 20 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "parses hostile patch lines in linear time" | red | passed |

## Gaps

None.
