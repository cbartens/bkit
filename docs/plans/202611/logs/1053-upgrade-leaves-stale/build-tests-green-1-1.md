Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1053-upgrade-leaves-stale-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/modules/index.integration.test.ts` "lists the force-rendered outputs of a claude install and nothing the owner shares" | red | passed |
| 1 | `.bkit/core/engine/install/modules/index.integration.test.ts` "names no other host's mirror for a claude-only install" | red | passed |
| 2 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "re-records a stale entry for a rendered mirror, doc and allowlist that are already current" | red | passed |
| 3 | `.bkit/core/engine/install/modules/core.integration.test.ts` "re-records a stale entry for a rendered output whose file is already current" | red | passed |
| 3 | `.bkit/core/engine/commands/install/check.integration.test.ts` "a wrong entry for a rendered mirror fails check and names the file, a wrong package.json entry does not" | red | passed |
| 4 | `.bkit/core/engine/install/version-file.test.ts` "prunes an existing .agents/ entry and counts it" | red | passed |
| 4 | `.bkit/core/engine/install/version-file.test.ts` "drops a fresh .agents/ entry" | red | passed |
| 4 | `.bkit/core/engine/install/version-file.integration.test.ts` "updateCanonicalHashesAfterUpgrade drops a recorded .agents/docs.md entry" | red | passed |
| 4 | `.bkit/core/engine/install/modules/core.integration.test.ts` "a core install run drops a recorded .agents/docs.md entry" | red | passed |

## Gaps

None.
