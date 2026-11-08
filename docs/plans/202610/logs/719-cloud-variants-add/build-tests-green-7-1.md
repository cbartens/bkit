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
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "missing id-token wins over tracker-stale and tracker-stale over codex-missing" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "cloud-claude-missing-id-token action names the template re-copy, not --tracker=github" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "jira tracker without a router gets the tracker-neutral cloud-router-none nudge" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "cloud-router advisory names the Claude GitHub App only for cloud.agent claude" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto=" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "dashboards router section names the recorded variant's BKIT_ secret" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" | red | passed |

## Gaps

None.
