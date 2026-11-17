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
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "linear-shaped FID under the github tracker gives no-issue and no dispatch" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject naming several issues is a no-FID no-op" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm passes the gate for a closed issue that still carries bkit:auto" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/" | passed-accepted | passed |
| 11 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex job runs only when the context job selects codex and skip is not true" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex job installs dependencies before openai/codex-action" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "trust step writes a codex-home config.toml trusting the workspace" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "filled bkit-cloud.yml passes actionlint" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex summary step runs under if: always() and writes action, commits and comments" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "opencode job installs dependencies before its dispatch step" | red | passed |

## Gaps

None.

## Already landed

- Task 10 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm passes the gate for a closed issue that still carries bkit:auto" — passed at the group's red, and the tests step accepted it: current bkit_gate already reads labels only (bkit-cloud.yml template bkit_gate), so the closed issue passes; no red is due
- Task 10 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/" — passed at the group's red, and the tests step accepted it: current YAML slug allowlist already rejects ../x before any path is built; no red is due
