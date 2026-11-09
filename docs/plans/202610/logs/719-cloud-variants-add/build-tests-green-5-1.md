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
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "github feat run passes the gate through the real bkit and stub gh" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "label removed gives label-absent, skip and a summary row" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s recorded fetch reply carrying bkit:auto passes the gate" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "jira marker AB2-12 dispatches" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=%s is unreadable with that reason and exits green" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s fetch output is unreadable reason=output-unparseable" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "absent node_modules/.bin/bkit warns bkit unavailable and exits green" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "feat branch with no marker and no feature row gives no-issue" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets" | red | passed |

## Gaps

None.
