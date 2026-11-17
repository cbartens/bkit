Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 8: issues fetch --json reply shape {labels[],terminal,...} and exit 80 {reason} from .bkit/core/engine/commands/workflow/issues.ts:717
SOURCE — TASK 8: PR-body marker form `<!-- bkit:issue=X bkit:fid=Y -->` from .bkit/core/engine/commands/workflow/fids.ts:592
SOURCE — TASK 9: Select outputs agent/dispatched/ignored from .bkit/templates/.github/workflows/bkit-cloud.yml:233
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `github feat run passes the gate through the real bkit and stub gh`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `label removed gives label-absent, skip and a summary row`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s recorded fetch reply carrying bkit:auto passes the gate`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `jira marker AB2-12 dispatches`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=%s is unreadable with that reason and exits green`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s fetch output is unreadable reason=output-unparseable`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `absent node_modules/.bin/bkit warns bkit unavailable and exits green`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `feat branch with no marker and no feature row gives no-issue`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch`
WROTE — TASK 9: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason`
WROTE — TASK 9: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s recorded fetch reply carrying bkit:auto passes the gate`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=%s is unreadable with that reason and exits green`
WROTE — TASK 8: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `%s fetch output is unreadable reason=output-unparseable`
