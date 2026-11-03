Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Debug Failure

## Remediation Log

DONE — Step 1: 13 byte-exact v6.0.0 fixtures written via git show (.bkit/core/engine/install/modules/__fixtures__/v6.0.0)
DONE — Step 2: four helpers read fixtures, no git/tag (upgrade.integration.test.ts, core.integration.test.ts)
DONE — Step 3: __fixtures__ added to .bkit/core/engine/.npmignore; pnpm pack lists 0 fixtures
DONE — Step 4: hash test v6-fixtures.test.ts added (8 pass); both integration files 198 pass; tsc, prettier clean
