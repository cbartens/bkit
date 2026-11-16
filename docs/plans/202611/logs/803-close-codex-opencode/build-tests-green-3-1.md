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
| 4 | `.bkit/core/engine/install/modules/index.integration.test.ts` "Codex denies shell reads of private-key files" | red | passed |
| 4 | `.bkit/core/engine/install/modules/index.integration.test.ts` "Codex denies a command that reads .env and a private key together" | red | passed |
| 4 | `.bkit/core/engine/install/modules/index.integration.test.ts` "the Codex private-key deny reason names the file and not the command" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "a --codex install reports the private-key and .env shell-read protection status" | red | passed |

## Gaps

None.
