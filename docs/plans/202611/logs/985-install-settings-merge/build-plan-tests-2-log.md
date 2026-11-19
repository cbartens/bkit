Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 3: advisory id and shape from .bkit/core/engine/install/modules/claude.ts:257 and .bkit/core/engine/checks/before/index.ts:53
WROTE — TASK 3: `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run over a seeded old-shape settings file reports the file as drift and names the retired entry`
PASSES — TASK 3: `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run over a clean settings file records no drift and no retired-settings-entry advisory`: no advisory exists yet and a clean file has no write, so it guards against a false advisory once the code lands
WROTE — TASK 3: `.bkit/core/engine/install/modules/claude.integration.test.ts` `dry run names an edited variant as kept`
WROTE — TASK 4: `.bkit/core/engine/install/write.test.ts` `every entry on the retired settings list has a docs/migrations.md row naming its source tags`
