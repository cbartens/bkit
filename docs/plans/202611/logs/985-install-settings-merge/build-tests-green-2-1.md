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
| 3 | `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run over a seeded old-shape settings file reports the file as drift and names the retired entry" | red | passed |
| 3 | `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run over a clean settings file records no drift and no retired-settings-entry advisory" | passed-accepted | passed |
| 3 | `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run names an edited variant as kept" | red | passed |
| 4 | `.bkit/core/engine/install/write.test.ts` "every entry on the retired settings list has a docs/migrations.md row naming its source tags" | red | passed |

## Gaps

None.

## Already landed

- Task 3 `.bkit/core/engine/install/modules/claude.integration.test.ts` "dry run over a clean settings file records no drift and no retired-settings-entry advisory" — passed at the group's red, and the tests step accepted it: no advisory exists yet and a clean file has no write, so it guards against a false advisory once the code lands; no red is due
