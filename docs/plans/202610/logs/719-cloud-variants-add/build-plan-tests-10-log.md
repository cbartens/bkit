Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 21: warning wording and secret_var from .bkit/templates/.github/workflows/bkit-cloud.yml:449
SOURCE — TASK 22: bkit-unavailable warning and summary row (verdict unreadable, reason bkit-unavailable) from .bkit/templates/.github/workflows/bkit-cloud.yml:419-430
SOURCE — TASK 23: checkout ref expression from .bkit/templates/.github/workflows/bkit-cloud.yml:172; Install bkit step :194
SOURCE — TASK 24: drop list from .bkit/core/engine/install/cloud-env.ts:35-39
WROTE — TASK 21: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value`
WROTE — TASK 22: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green`
WROTE — TASK 23: `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context job installs and runs bkit from dev, never from the feat/** PR head`
WROTE — TASK 24: `.bkit/core/engine/install/cloud-env.test.ts` `never lets BKIT_OPENAI_API_KEY into the paste block`
