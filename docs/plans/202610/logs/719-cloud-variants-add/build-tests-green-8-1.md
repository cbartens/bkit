Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 15 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude" | red | passed |
| 15 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "cloud tip for codex names --codex and BKIT_OPENAI_API_KEY" | red | passed |

## Gaps

None.
