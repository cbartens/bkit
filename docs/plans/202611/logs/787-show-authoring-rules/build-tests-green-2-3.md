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
| 6 | `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` "routes Claude notebook and shell targets through shared advice" | red | passed |
| 7 | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "routes Cursor delete and shell targets without replacing its driver" | passed-accepted | passed |
| 8 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "routes Codex complete patches and initial shell commands" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "routes Antigravity multi-replace and shell targets" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "preserves OpenCode edit coverage and after-execute boundary" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "leaves Antigravity targets eligible when retry transport cannot deliver" | red | passed |

## Gaps

None.

## Already landed

- Task 7 `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "routes Cursor delete and shell targets without replacing its driver" — passed at the group's red, and the tests step accepted it: original plan name restored; the body is the owner-approved corrected one (contradictory single-line emit assertion dropped, all other assertions kept); the code already exists and satisfies it (driver has only the ternary form), so it passes now; no red is due
