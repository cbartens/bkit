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
| 21 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value" | red | passed |
| 22 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green" | red | passed |
| 23 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context job installs and runs bkit from dev, never from the feat/** PR head" | red | passed |
| 24 | `.bkit/core/engine/install/cloud-env.test.ts` "never lets BKIT_OPENAI_API_KEY into the paste block" | red | passed |

## Gaps

None.
