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
| 1 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "retains lexical context for nested shell edits" | red | passed |
| 1 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "recognizes direct edit command families" | red | passed |
| 1 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "normalizes literal working directories without guessing" | red | passed |
| 1 | `.bkit/core/engine/install/modules/index.integration.test.ts` "keeps existing shell consumers working with structured evidence" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "extracts all literal patch effects" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "classifies inline and named script effects" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "requires a positive whole-program reader grammar" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "retains exact targets beside uncertain script effects" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "bounds direct source inspection without executing it" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "stops analysis at each internal bound" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "preserves stronger shell decisions and compound advice" | red | passed |
| 4 | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` "prepares complete advice without acknowledging it" | red | passed |
| 4 | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` "shares normalized warning identity across edit channels" | red | passed |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "acknowledges only complete selected blocks on verified routes" | red | passed |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "reserves notices inside conservative host budgets" | red | passed |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` "preserves off deny and state-fallback semantics" | red | passed |

## Gaps

None.
