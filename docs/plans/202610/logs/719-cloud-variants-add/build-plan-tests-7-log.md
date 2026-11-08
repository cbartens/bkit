Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 13: cloudAgents / issueTracker read from package.json bkit.cloud.agent / bkit.tracker.default from .bkit/core/engine/shared/settings.ts:410
SOURCE — TASK 14: opencode provider from bkit.providers.opencode.default (settings.ts:347-357); envVar names from .bkit/core/engine/shared/egress.ts:49-95
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale`
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing`
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `missing id-token wins over tracker-stale and tracker-stale over codex-missing`
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `cloud-claude-missing-id-token action names the template re-copy, not --tracker=github`
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `jira tracker without a router gets the tracker-neutral cloud-router-none nudge`
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `cloud-router advisory names the Claude GitHub App only for cloud.agent claude`
WROTE — TASK 13: `.bkit/core/engine/checks/after/github.test.ts` `adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto=`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `dashboards router section names the recorded variant's BKIT_ secret`
WROTE — TASK 14: `.bkit/core/engine/checks/after/auth.test.ts` `adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed`
NOTE — TASK 13: removed old test 'jira tracker: no nudge' (contradicts planned jira test); first cloud-router test now sets agent claude + id-token + BKIT_ content.
