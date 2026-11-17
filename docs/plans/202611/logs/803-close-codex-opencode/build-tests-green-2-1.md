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
| 3 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "removes a recorded WebFetch grant whose domain left allowed-domains" | red | passed |
| 3 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "keeps an unrecorded WebFetch grant and lists it for owner review" | red | passed |
| 3 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "removes no WebFetch grant when .bkit/version has no claudeAllowDerived record" | red | passed |
| 3 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "leaves legacy OpenCode substring fetch grants in place and lists them for owner review" | red | passed |
| 3 | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` "a full bkit uninstall removes a recorded WebFetch grant whose domain left allowed-domains" | red | passed |

## Gaps

None.
