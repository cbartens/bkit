Verdict: PENDING

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — Task 0c: Static fixture for upgrade-chain regression — created tests/fixtures/heavy-customised-consumer-v1-envelope/ with cursor-hooks.json, claude-settings.json, bkit-version.json (tests/fixtures/heavy-customised-consumer-v1-envelope/)
DONE — Task 0d: Static fixture for .husky/pre-push consumer customisation — created tests/fixtures/heavy-customised-prepush/.husky/pre-push (tests/fixtures/heavy-customised-prepush/.husky/pre-push)
DONE — Task 0e: Static fixture for heavy-customised ci.yml — created tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml (tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml)
DONE — Task 1: deepContains primitive — added to .agents/scripts/bkit-tiers.ts (~110 LOC)
DONE — Task 1b: Extract getPkgRoot() to bkit-paths.ts — created .agents/scripts/bkit-paths.ts; updated bkit-modules.ts to import from bkit-paths (.agents/scripts/bkit-paths.ts)
DONE — Task 2: writeTier2JsonContained — added to .agents/scripts/bkit-tiers.ts (.agents/scripts/bkit-tiers.ts)
DONE — Task 3: migrateLegacyBkitEnvelope — added to .agents/scripts/bkit-tiers.ts (.agents/scripts/bkit-tiers.ts)
DONE — Task 4: Update runClaudeModule + runCursorModule — migrateLegacyBkitEnvelope + writeTier2JsonContained integrated (.agents/scripts/bkit-modules.ts)
DONE — Task 4b: stripTier2JsonScope — added to .agents/scripts/bkit-uninstall.ts (.agents/scripts/bkit-uninstall.ts)
DONE — Task 14a: package.json version bump to 2.0.0 (package.json)
DONE — Task 5: Templates rewrite — .agents/templates/.cursor/hooks.json (Cursor v1 keyed-object); .agents/templates/.claude/settings.json (dropped **bkit**)
DONE — Task 6: Preflight advisories + drift detection — added detectLegacyBkitEnvelope, detectTier2JsonDrift, detectPreEnvelopeBkitVersion to bkit-preflight.ts (.agents/scripts/bkit-preflight.ts)
DONE — Task 7: Delete obsolete code — removed bkit-tier1-defaults.ts/test.ts; removed extractBkitNamespace/applyBkitNamespace/writeTier2Json/migrateTier1JsonToTier2 from bkit-tiers.ts; updated upgrade integration test imports (.agents/scripts/bkit-tiers.ts, .agents/scripts/bkit-modules.upgrade.integration.test.ts)
DONE — Task 8: bkit-tiers.test.ts rewrite — added deepContains (8 rows), writeTier2JsonContained (5 tests), migrateLegacyBkitEnvelope (4 sub-cases), cursor-v1-schema block; removed old envelope tests (.agents/scripts/bkit-tiers.test.ts)
DONE — Task 8b: bkit-uninstall.test.ts stripTier2JsonScope block — added unit tests for leaf-deletion, consumer-only sibling preservation, empty-intermediate pruning, array preservation, no-mutation (.agents/scripts/bkit-uninstall.test.ts)
DONE — Task 9: Upgrade integration tests — rewrote bkit-modules.upgrade.integration.test.ts with v0.8.x→v2.0.0 chain, cursor fixture, idempotency (.agents/scripts/bkit-modules.upgrade.integration.test.ts)
DONE — Task 10: Modules integration tests — added legacy-bkit-envelope-detected, tier2-json-drift, pre-envelope-bkit-version-detected, Dockerfile safe-delete tests (.agents/scripts/bkit-modules.integration.test.ts)
