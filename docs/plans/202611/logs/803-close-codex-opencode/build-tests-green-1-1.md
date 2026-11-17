Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/803-close-codex-opencode-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/modules/opencode.integration.test.ts` "injects consumer allowed-domains into the fetch tool and never into shell allows" | red | passed |
| 1 | `.bkit/core/engine/install/modules/opencode.integration.test.ts` "permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated, no shell fetch allows" | red | passed |
| 1 | `.bkit/core/engine/install/modules/index.integration.test.ts` "every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks" | red | passed |
| 2 | `.bkit/core/engine/checks/before/files.test.ts` "reports each substring curl and wget allow with its removal action" | red | passed |
| 2 | `.bkit/core/engine/checks/before/files.test.ts` "ignores webfetch, non-allow and unrelated consumer entries" | red | passed |
| 2 | `.bkit/core/engine/checks/before/files.test.ts` "redacts URL credentials and query strings in a reported key" | red | passed |
| 2 | `.bkit/core/engine/checks/before/files.test.ts` "reports nothing and writes nothing for an absent, unparseable or map-less file" | red | passed |
| 2 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review" | red | passed |

## Gaps

None.
