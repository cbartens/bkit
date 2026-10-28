Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 6: Seed build.publish on install and upgrade — 4 seed tests green, dist rebuilt (.bkit/core/engine/install/modules/core.ts)
DONE — TASK 7: Retire the lite payload in one install transition — migrateRetiredLite, 10 migration tests green, dist rebuilt, docs/migrations.md row replaced (.bkit/core/engine/install/modules/core.ts)
NOTE — install.integration.test.ts '#507 every payload file lands' fails on .bkit/lite.md source doc still shipped; resolved by the later task that deletes .bkit/core/.bkit/lite.md and the manifest entry
