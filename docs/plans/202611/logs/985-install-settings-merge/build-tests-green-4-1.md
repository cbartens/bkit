Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/985-install-settings-merge-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/install/write.test.ts` "removes every Linear connector tool grant bkit shipped in v0.4.0-v2.2.3 and reports none as edited" | red | passed |
| 8 | `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept" | red | passed |

## Gaps

None.
