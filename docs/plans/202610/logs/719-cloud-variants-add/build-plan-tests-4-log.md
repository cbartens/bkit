Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 7: gate and agent outputs from .bkit/templates/.github/workflows/bkit-cloud.yml:121-153; bkit.cloud.agent read from package.json per .bkit/core/engine/install/modules/cloud.ts:157; opencode env mapping from bkit-cloud.yml:579-594.
WROTE — TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `enabled is true when any agent BKIT_ secret is set and false when none is`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `absent bkit.cloud.agent selects no job and the notice names bkit install --auto=`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded agent without its secret selects no job and names the missing secret`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded %s selects no router job`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `opencode dispatch maps each provider BKIT_ secret to its own env name`
